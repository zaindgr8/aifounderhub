-- Migration 0007: Add "Dubai Event Circle" category to Lead Intelligence CRM
-- Target: Supabase project csdxhpdjkaddrblyxlhg (aifounderhubleads)
--
-- lead_category is a Postgres ENUM and the view gumroad_lead_products depends on it,
-- so we extend the enum instead of converting the column to text.
--
-- IMPORTANT: run in TWO separate executions in the SQL editor.
-- Postgres can't use a new enum value in the same transaction that adds it.

-- ═══════════════════════════════════════════════════════════════════════════
-- RUN 1 — select ONLY this statement and click Run
-- ═══════════════════════════════════════════════════════════════════════════
alter type lead_category add value if not exists 'dubai_event_circle';


-- ═══════════════════════════════════════════════════════════════════════════
-- RUN 2 — after Run 1 succeeds, select everything below and click Run
-- ═══════════════════════════════════════════════════════════════════════════

-- Move existing Dubai Event Circle leads (Luma / Everyone Pitches) into the new category
update masterclass_leads
set lead_category = 'dubai_event_circle',
    updated_at = now()
where source = 'luma'
   or campaign_name = 'Everyone Pitches Event'
   or enrolled_for ilike '%Dubai Event Circle%'
   or 'dubai-event-circle' = any(tags)
   or 'event:everyone-pitches-dubai' = any(tags);

-- Funnel upsert helper: Dubai Event Circle = Level 3, GumRoad = Level 4
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
    v_existing_rank := case v_existing.lead_category::text
      when 'afh_signup' then 1
      when 'free_class_registration' then 2
      when 'dubai_event_circle' then 3
      when 'gumroad_course' then 4
      else 2
    end;

    if v_target_rank < v_existing_rank then
      update masterclass_leads
      set lead_category = p_category::lead_category,
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
      p_full_name, v_clean_email, p_phone, p_country, p_category::lead_category, p_status, p_notes, now(), now()
    ) returning jsonb_build_object('id', id, 'status', 'inserted', 'level', v_target_rank) into v_result;
  end if;

  return v_result;
end;
$$ language plpgsql security definer;
