-- ============================================================================
-- Migration 0005: one entitlement row per product, not per person
-- ============================================================================
-- Additive and idempotent — safe to re-run.
--
-- THE BUG THIS FIXES
-- ------------------
-- `members` carried a unique index on lower(email), so a person could hold
-- exactly one entitlement row. But check-member now derives hasClaudeAccess /
-- hasRoadmapAccess from the product_code of EVERY active row.
--
-- So a customer who bought Master Claude and then the RoadMap hit:
--   duplicate key value violates unique constraint "members_email_key"
-- The insert was inside Promise.allSettled, so confirm-payment carried on and
-- still sent "you're enrolled" — while members kept only the first product.
-- They paid $159/mo and were locked out of the RoadMap. Same in reverse.
--
-- The fix: uniqueness belongs on (person, product).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Normalise product_code so the new index has a stable key
-- ----------------------------------------------------------------------------
-- Rows written before 0003 have no product_code. They are all RoadMap members,
-- which is also what check-member assumes for a null code.
update members set product_code = 'aaa-accelerator' where product_code is null;
update members set product_label = '50K RoadMap (AAA Accelerator)'
  where product_label is null and product_code = 'aaa-accelerator';

alter table members alter column product_code set default 'aaa-accelerator';

-- ----------------------------------------------------------------------------
-- 2. Swap the index: one row per person PER PRODUCT
-- ----------------------------------------------------------------------------
-- coalesce() keeps the key stable if a null ever slips back in — a plain
-- (lower(email), product_code) index would treat every null as distinct and
-- silently allow unlimited duplicate rows.
create unique index if not exists members_email_product_key
  on members (lower(email), coalesce(product_code, 'aaa-accelerator'));

drop index if exists members_email_key;

-- ----------------------------------------------------------------------------
-- 3. Atomic grant, so concurrent confirmations cannot collide
-- ----------------------------------------------------------------------------
-- PostgREST cannot express an upsert against an *expression* index, so the
-- backend calls this instead of POSTing to /members. ON CONFLICT makes it
-- race-free: two webhooks landing at once produce one row, not a 409.
--
-- Never shortens access: an existing expiry further in the future is kept, so
-- re-confirming an old payment can't cut a member off.
create or replace function grant_member_product(
  p_email         text,
  p_product_code  text        default 'aaa-accelerator',
  p_product_label text        default null,
  p_status        text        default 'active',
  p_expires_at    timestamptz default null,
  p_full_name     text        default null,
  p_source        text        default 'checkout'
) returns members
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_row  members;
  v_code text := coalesce(nullif(trim(p_product_code), ''), 'aaa-accelerator');
begin
  if p_email is null or trim(p_email) = '' then
    raise exception 'grant_member_product: email is required';
  end if;

  insert into members (email, product_code, product_label, status, started_at, expires_at, full_name, source)
  values (
    lower(trim(p_email)), v_code, p_product_label, p_status::member_status,
    now(), p_expires_at, p_full_name, p_source
  )
  on conflict (lower(email), coalesce(product_code, 'aaa-accelerator')) do update set
    status        = excluded.status,
    -- keep whichever access period ends later
    expires_at    = greatest(coalesce(members.expires_at, excluded.expires_at), coalesce(excluded.expires_at, members.expires_at)),
    product_label = coalesce(excluded.product_label, members.product_label),
    full_name     = coalesce(excluded.full_name, members.full_name),
    source        = coalesce(excluded.source, members.source),
    started_at    = coalesce(members.started_at, excluded.started_at),
    updated_at    = now()
  returning * into v_row;

  return v_row;
end;
$$;

-- Only the backend may call this — never the anon or authenticated key.
revoke all on function grant_member_product(text, text, text, text, timestamptz, text, text) from public;
revoke all on function grant_member_product(text, text, text, text, timestamptz, text, text) from anon;
revoke all on function grant_member_product(text, text, text, text, timestamptz, text, text) from authenticated;
grant execute on function grant_member_product(text, text, text, text, timestamptz, text, text) to service_role;

-- ----------------------------------------------------------------------------
-- 4. Retire the superseded helper from migration 0002
-- ----------------------------------------------------------------------------
-- upsert_member() targeted the index this migration drops, knows nothing about
-- product_code, and is not referenced anywhere in the codebase.
drop function if exists upsert_member(text, member_status, timestamptz);
