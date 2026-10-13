-- Migration 0007: Add Dubai Events Category to Lead Intelligence CRM
-- Target: Supabase project csdxhpdjkaddrblyxlhg

-- 1-2. Convert column to text so new categories (dubai_event_circle) never fail with enum errors
alter table masterclass_leads alter column lead_category type text using lead_category::text;
alter table masterclass_leads alter column lead_category set default 'free_class_registration';

-- 3. Update existing Dubai Events leads (Luma / Everyone Pitches / Dubai Event Circle)
update masterclass_leads
set lead_category = 'dubai_event_circle',
    updated_at = now()
where source = 'luma'
   or campaign_name = 'Everyone Pitches Event'
   or enrolled_for ilike '%Dubai Event Circle%'
   or 'dubai-event-circle' = any(tags)
   or 'event:everyone-pitches-dubai' = any(tags);

-- 4. Update helper function upsert_masterclass_lead_funnel to support dubai_events (Level 3 rank)
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
  -- Rank mapping: 1 is top, 4 is lowest
  v_target_rank := case p_category
    when 'afh_signup' then 1
    when 'free_class_registration' then 2
    when 'dubai_event_circle' then 3
    when 'gumroad_course' then 4
    else 2
  end;

  select * into v_existing
  from masterclass_leads
  where lower(email_address) = v_clean_email
  limit 1;

  if found then
    v_existing_rank := case v_existing.lead_category
      when 'afh_signup' then 1
      when 'free_class_registration' then 2
      when 'dubai_event_circle' then 3
      when 'gumroad_course' then 4
      else 2
    end;

    if v_target_rank < v_existing_rank then
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
    insert into masterclass_leads (
      full_name, email_address, phone_number, country, lead_category, status, notes, created_at, updated_at
    ) values (
      p_full_name, v_clean_email, p_phone, p_country, p_category, p_status, p_notes, now(), now()
    ) returning jsonb_build_object('id', id, 'status', 'inserted', 'level', v_target_rank) into v_result;
  end if;

  return v_result;
end;
$$ language plpgsql security definer;
