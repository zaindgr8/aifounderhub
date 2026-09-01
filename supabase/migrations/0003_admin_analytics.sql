-- ============================================================================
-- Migration 0003: Admin analytics layer
-- ============================================================================
-- Everything here is ADDITIVE and IDEMPOTENT — safe to re-run.
--
-- Why it exists: the site had a schema for leads/payments/members but nothing
-- was actually writing to it (payments lived only in Ziina + an in-memory map,
-- leads lived only in Resend emails). /admin needs a durable record of
-- "who signed up, who bought what, on which package", so this migration adds
-- the missing columns, plus the admin allowlist and an audit trail.
--
-- The app degrades gracefully if this has NOT been run — the API falls back to
-- the base columns — but revenue attribution and lead sourcing need it.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. leads.goal → text
-- ----------------------------------------------------------------------------
-- The lead_goal enum only knew founder/freelancer/scaleup/agency/explore, but
-- the live forms submit 'workshop' and 'session' too, which made every workshop
-- signup fail to persist. Widening to text is non-destructive (existing values
-- carry over verbatim) and avoids ALTER TYPE ... ADD VALUE transaction issues.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'leads'
      and column_name = 'goal' and data_type = 'USER-DEFINED'
  ) then
    alter table leads alter column goal drop default;
    alter table leads alter column goal type text using goal::text;
    alter table leads alter column goal set default 'explore';
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 2. leads — capture what the forms actually send
-- ----------------------------------------------------------------------------
alter table leads add column if not exists full_phone     text;
alter table leads add column if not exists workshop_title text;
alter table leads add column if not exists ticket_number  text;
alter table leads add column if not exists submissions    integer     not null default 1;
alter table leads add column if not exists last_seen_at   timestamptz not null default now();
alter table leads add column if not exists updated_at     timestamptz not null default now();

create index if not exists leads_source_idx       on leads (source);
create index if not exists leads_last_seen_idx    on leads (last_seen_at desc);

-- ----------------------------------------------------------------------------
-- 3. payments — real product attribution in the currency we actually charge
-- ----------------------------------------------------------------------------
-- Ziina charges in USD cents here, not AED fils. amount_fils is kept for
-- backwards compatibility (and defaulted so inserts can omit it); amount_cents
-- is the field the admin panel reads.
alter table payments add column if not exists amount_cents  integer;
alter table payments add column if not exists product_code  text;
alter table payments add column if not exists product_label text;
alter table payments add column if not exists provider      text not null default 'ziina';
alter table payments add column if not exists completed_at  timestamptz;
alter table payments add column if not exists metadata      jsonb not null default '{}'::jsonb;

alter table payments alter column amount_fils set default 0;

-- Backfill anything already recorded before this migration.
update payments set amount_cents = amount_fils where amount_cents is null and currency = 'USD';
update payments
   set product_code  = coalesce(product_code,  case purpose when 'booking' then 'session-1on1' else 'aaa-accelerator' end),
       product_label = coalesce(product_label, case purpose when 'booking' then '1:1 Private Session' else 'AAA Accelerator' end)
 where product_code is null or product_label is null;
update payments set completed_at = updated_at where status = 'completed' and completed_at is null;

create index if not exists payments_created_idx   on payments (created_at desc);
create index if not exists payments_product_idx   on payments (product_code);
create index if not exists payments_completed_idx on payments (completed_at desc);

-- ----------------------------------------------------------------------------
-- 4. members — remember which package granted the access
-- ----------------------------------------------------------------------------
alter table members add column if not exists full_name        text;
alter table members add column if not exists product_code     text;
alter table members add column if not exists product_label    text;
alter table members add column if not exists source           text;
alter table members add column if not exists total_paid_cents integer     not null default 0;
alter table members add column if not exists updated_at       timestamptz not null default now();

create index if not exists members_status_idx  on members (status);
create index if not exists members_expires_idx on members (expires_at);

-- ----------------------------------------------------------------------------
-- 5. admin_users — who may open /admin
-- ----------------------------------------------------------------------------
-- RLS is on with no policies, so only the service-role key (used exclusively by
-- the /api/admin backend) can read this. The ADMIN_EMAILS env var is an
-- additional allowlist that is checked alongside this table.
create table if not exists admin_users (
  email      text primary key,
  role       text        not null default 'admin',   -- 'owner' | 'admin' | 'viewer'
  full_name  text,
  created_at timestamptz not null default now()
);
alter table admin_users enable row level security;

insert into admin_users (email, role, full_name) values
  ('zangbang360@gmail.com',  'owner', 'Zain Ul Abideen'),
  ('desigeek0007@gmail.com', 'owner', 'Zain Ul Abideen')
on conflict (email) do nothing;

-- ----------------------------------------------------------------------------
-- 6. admin_audit_log — every mutation made from the panel
-- ----------------------------------------------------------------------------
create table if not exists admin_audit_log (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  actor_email text not null,
  action      text not null,          -- 'member.grant' | 'member.revoke' | 'payment.manual' | ...
  subject     text,                   -- the email / id the action was applied to
  detail      jsonb not null default '{}'::jsonb
);
alter table admin_audit_log enable row level security;
create index if not exists admin_audit_created_idx on admin_audit_log (created_at desc);
