-- Migration: Complete CRM & n8n Email Personalization Architecture
-- Database: masterclass_leads
-- Target: Supabase project csdxhpdjkaddrblyxlhg

-- 1. Status enum for lead lifecycle (idempotent)
do $$ begin
  create type lead_crm_status as enum (
    'new',
    'contacted',
    'interested',
    'meeting_booked',
    'closed',
    'not_interested',
    'enrolled',
    'lost'
  );
exception when duplicate_object then null; end $$;

-- Add new enum values if type already existed
alter type lead_crm_status add value if not exists 'meeting_booked';
alter type lead_crm_status add value if not exists 'closed';

-- Convert status column to text so all custom statuses (e.g. Meeting Booked, Closed) work seamlessly
alter table masterclass_leads alter column status type text using status::text;
alter table masterclass_leads alter column status set default 'new';

-- 2. Intent level enum
do $$ begin
  create type lead_intent as enum (
    'hot',
    'warm',
    'cold'
  );
exception when duplicate_object then null; end $$;

-- 3. Email automation status enum
do $$ begin
  create type email_automation_status as enum (
    'pending',
    'queued',
    'in_progress',
    'completed',
    'failed',
    'opted_out'
  );
exception when duplicate_object then null; end $$;

-- 4. Ensure ALL core, enrichment, and n8n email automation columns exist
alter table masterclass_leads
  -- Contact details
  add column if not exists full_name text,
  add column if not exists email_address text,
  add column if not exists phone_number text,
  add column if not exists country text,
  
  -- Registration & Personalization base inputs (collected from form/Zoho)
  add column if not exists enrolled_for text,
  add column if not exists what_best_describes_them text,
  add column if not exists why_they_signed_up text,
  
  -- CRM Lead Management
  add column if not exists status lead_crm_status not null default 'new',
  add column if not exists intent lead_intent,
  add column if not exists lead_score integer not null default 0 check (lead_score between 0 and 100),
  add column if not exists source text default 'zoho',
  add column if not exists tags text[] not null default '{}',
  add column if not exists notes text,
  add column if not exists assigned_to text,
  add column if not exists goal text,
  add column if not exists profession text,
  add column if not exists company text,
  add column if not exists interested boolean not null default false,
  add column if not exists follow_up_at timestamptz,
  add column if not exists last_contacted_at timestamptz,
  add column if not exists zoho_lead_id text,
  
  -- n8n Personalised Email Automation Columns
  add column if not exists email_status text default 'new',
  add column if not exists next_campaign text,
  add column if not exists email_subject text,
  add column if not exists campaign_name text default 'Masterclass Welcome',
  add column if not exists email_automation_status email_automation_status not null default 'pending',
  add column if not exists last_campaign_sent_at timestamptz,
  add column if not exists last_emailed_at timestamptz,
  add column if not exists email_sequence_step integer not null default 0,
  add column if not exists n8n_workflow_id text,
  add column if not exists n8n_execution_id text,
  add column if not exists last_email_error text,
  add column if not exists unsubscribed boolean not null default false,
  
  -- Marketing attribution
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,

  -- Lead category — segmenting for targeted ad campaigns
  -- Values: free_class_registration (default), gumroad_course, afh_signup
  add column if not exists lead_category text not null default 'free_class_registration',

  -- Timestamps
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

-- 5. Auto-extract email_subject from next_campaign if subject is present in the text
update masterclass_leads
set email_subject = trim(substring(next_campaign from 'Subject: ([^\n\r]+)'))
where next_campaign is not null 
  and email_subject is null 
  and next_campaign ilike 'Subject:%';

-- 6. Indexes for lightning-fast queries in CRM Dashboard & n8n polling
create index if not exists masterclass_leads_email_status_idx on masterclass_leads (email_status);
create index if not exists masterclass_leads_status_idx on masterclass_leads (status);
create index if not exists masterclass_leads_assigned_to_idx on masterclass_leads (assigned_to);
create index if not exists masterclass_leads_intent_idx on masterclass_leads (intent);
create index if not exists masterclass_leads_email_idx on masterclass_leads (lower(email_address));
create index if not exists masterclass_leads_persona_idx on masterclass_leads (what_best_describes_them);
create index if not exists masterclass_leads_created_at_idx on masterclass_leads (created_at desc);
create index if not exists masterclass_leads_unsub_idx on masterclass_leads (unsubscribed);
create index if not exists masterclass_leads_category_idx on masterclass_leads (lead_category);

-- 7. Row Level Security policies
alter table masterclass_leads enable row level security;

drop policy if exists "masterclass_leads_read" on masterclass_leads;
create policy "masterclass_leads_read"
  on masterclass_leads for select
  using (true);

drop policy if exists "masterclass_leads_insert" on masterclass_leads;
create policy "masterclass_leads_insert"
  on masterclass_leads for insert
  with check (true);

drop policy if exists "masterclass_leads_update" on masterclass_leads;
create policy "masterclass_leads_update"
  on masterclass_leads for update
  using (true);

-- 8. Funnel Level Hierarchy & Email Deduplication
-- Level 1: afh_signup (Top Level / Most mature)
-- Level 2: free_class_registration (Mid Level)
-- Level 3: gumroad_course (Low Level)
--
-- Rule: Do not insert duplicate records for the same email.
-- When a lead upgrades their level (e.g. Level 3 -> Level 2 or 1, or Level 2 -> Level 1),
-- the lead_category is updated to the higher level, removing them from the lower level.

create or replace function upsert_masterclass_lead_funnel(
  p_email text,
  p_full_name text default null,
  p_phone text default null,
  p_country text default null,
  p_category text default 'afh_signup',
  p_status text default 'new',
  p_notes text default null
) returns jsonb as $$
declare
  v_clean_email text := lower(trim(p_email));
  v_existing record;
  v_existing_rank int;
  v_target_rank int;
  v_result jsonb;
begin
  -- Rank mapping: 1 is top, 3 is low
  v_target_rank := case p_category
    when 'afh_signup' then 1
    when 'free_class_registration' then 2
    when 'gumroad_course' then 3
    else 2
  end;

  -- Check existing lead
  select * into v_existing
  from masterclass_leads
  where lower(email_address) = v_clean_email
  limit 1;

  if found then
    v_existing_rank := case v_existing.lead_category
      when 'afh_signup' then 1
      when 'free_class_registration' then 2
      when 'gumroad_course' then 3
      else 2
    end;

    if v_target_rank < v_existing_rank then
      -- Upgrade level!
      update masterclass_leads
      set lead_category = p_category,
          full_name = coalesce(p_full_name, full_name),
          phone_number = coalesce(p_phone, phone_number),
          country = coalesce(p_country, country),
          notes = case when p_notes is not null then coalesce(notes || ' | ' || p_notes, p_notes) else notes end,
          updated_at = now()
      where id = v_existing.id;

      v_result := jsonb_build_object('id', v_existing.id, 'status', 'upgraded', 'from_level', v_existing_rank, 'to_level', v_target_rank);
    else
      -- Equal or higher level already exists — update details without downgrading or duplicating
      update masterclass_leads
      set full_name = coalesce(p_full_name, full_name),
          phone_number = coalesce(p_phone, phone_number),
          country = coalesce(p_country, country),
          notes = case when p_notes is not null then coalesce(notes || ' | ' || p_notes, p_notes) else notes end,
          updated_at = now()
      where id = v_existing.id;

      v_result := jsonb_build_object('id', v_existing.id, 'status', 'retained', 'level', v_existing_rank);
    end if;
  else
    -- Insert new single record
    insert into masterclass_leads (
      full_name, email_address, phone_number, country, lead_category, status, notes, created_at, updated_at
    ) values (
      p_full_name, v_clean_email, p_phone, p_country, p_category, p_status, p_notes, now(), now()
    ) returning jsonb_build_object('id', id, 'status', 'inserted', 'level', v_target_rank) into v_result;
  end if;

  return v_result;
end;
$$ language plpgsql security definer;
