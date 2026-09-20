-- Migration: Complete CRM & n8n Email Personalization Architecture
-- Database: masterclass_leads
-- Target: Supabase project csdxhpdjkaddrblyxlhg

-- 1. Status enum for lead lifecycle (idempotent)
do $$ begin
  create type lead_crm_status as enum (
    'new',
    'contacted',
    'interested',
    'not_interested',
    'enrolled',
    'lost'
  );
exception when duplicate_object then null; end $$;

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
create index if not exists masterclass_leads_intent_idx on masterclass_leads (intent);
create index if not exists masterclass_leads_email_idx on masterclass_leads (lower(email_address));
create index if not exists masterclass_leads_persona_idx on masterclass_leads (what_best_describes_them);
create index if not exists masterclass_leads_created_at_idx on masterclass_leads (created_at desc);
create index if not exists masterclass_leads_unsub_idx on masterclass_leads (unsubscribed);

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
