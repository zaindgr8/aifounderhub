-- ============================================================================
-- Migration 0004: Affiliate program
-- ============================================================================
-- Additive and idempotent — safe to re-run.
--
-- Model:
--   • Every user may APPLY to become an affiliate; the program is hidden until
--     they do, and inert until an admin approves.
--   • An approved affiliate gets ONE code. Product links are the same code on
--     different landing pages, so attribution never depends on which link was
--     shared.
--   • First touch wins and the binding is permanent: once a person is bound to
--     an affiliate, every completed payment they ever make earns commission at
--     the affiliate's CURRENT rate (15% unless an admin changes it).
--
-- All tables are service-role only (RLS on, no policies) — the browser reaches
-- them exclusively through /api/affiliate and /api/admin.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Fix: payments.purpose enum → text
-- ----------------------------------------------------------------------------
-- PACKAGES['claude-master'] declares purpose 'course', which the payment_purpose
-- enum (booking|bootcamp|membership) rejects — so every Master Claude checkout
-- was silently failing to record a payments row, in both the full and the
-- fallback payload. No payments row means no order in /admin and no affiliate
-- commission, so this has to be fixed before commissions can be computed.
-- Widening to text is non-destructive and stops this class of failure for good.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'payments'
      and column_name = 'purpose' and data_type = 'USER-DEFINED'
  ) then
    alter table payments alter column purpose type text using purpose::text;
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 1. affiliates — one row per applicant
-- ----------------------------------------------------------------------------
create table if not exists affiliates (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  user_id        uuid references auth.users(id) on delete set null,
  email          text not null,
  full_name      text,
  code           text not null,
  status         text not null default 'pending',   -- pending | approved | rejected | suspended
  commission_pct numeric(5,2) not null default 15 check (commission_pct >= 0 and commission_pct <= 100),
  payout_method  text,                              -- 'bank' | 'paypal' | 'crypto' | 'other'
  payout_details text,
  applicant_note text,
  admin_note     text,
  applied_at     timestamptz not null default now(),
  reviewed_at    timestamptz,
  reviewed_by    text
);

create unique index if not exists affiliates_email_key on affiliates (lower(email));
create unique index if not exists affiliates_code_key  on affiliates (upper(code));
create index if not exists affiliates_status_idx on affiliates (status);

-- ----------------------------------------------------------------------------
-- 2. affiliate_clicks — link visits, for a conversion rate the affiliate can see
-- ----------------------------------------------------------------------------
-- No raw IP is stored; visitor_hash is an opaque per-browser id used only to
-- keep one person refreshing a page from inflating the click count.
create table if not exists affiliate_clicks (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  affiliate_id uuid not null references affiliates(id) on delete cascade,
  code         text not null,
  landing_path text,
  referrer     text,
  visitor_hash text
);
create index if not exists affiliate_clicks_affiliate_idx on affiliate_clicks (affiliate_id, created_at desc);
create unique index if not exists affiliate_clicks_dedupe
  on affiliate_clicks (affiliate_id, visitor_hash, landing_path)
  where visitor_hash is not null;

-- ----------------------------------------------------------------------------
-- 3. affiliate_referrals — the permanent person → affiliate binding
-- ----------------------------------------------------------------------------
-- One row per referred person. The unique index on the email is what makes
-- attribution first-touch: a later affiliate cannot steal an existing referral.
create table if not exists affiliate_referrals (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  affiliate_id     uuid not null references affiliates(id) on delete cascade,
  referred_email   text not null,
  referred_user_id uuid references auth.users(id) on delete set null,
  landing_path     text,
  first_purchase_at timestamptz
);
create unique index if not exists affiliate_referrals_email_key on affiliate_referrals (lower(referred_email));
create index if not exists affiliate_referrals_affiliate_idx on affiliate_referrals (affiliate_id, created_at desc);

-- ----------------------------------------------------------------------------
-- 4. affiliate_commissions — one row per commissionable payment
-- ----------------------------------------------------------------------------
-- The unique payment_id is the idempotency guard: confirm-payment can run
-- twice (retry, webhook + redirect) without paying an affiliate twice.
create table if not exists affiliate_commissions (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  affiliate_id      uuid not null references affiliates(id) on delete cascade,
  payment_id        uuid references payments(id) on delete set null,
  referred_email    text not null,
  product_code      text,
  product_label     text,
  sale_amount_cents integer not null,
  commission_pct    numeric(5,2) not null,
  commission_cents  integer not null,
  status            text not null default 'pending',  -- pending | approved | paid | void
  paid_at           timestamptz,
  note              text
);
create unique index if not exists affiliate_commissions_payment_key on affiliate_commissions (payment_id) where payment_id is not null;
create index if not exists affiliate_commissions_affiliate_idx on affiliate_commissions (affiliate_id, created_at desc);
create index if not exists affiliate_commissions_status_idx on affiliate_commissions (status);

-- ----------------------------------------------------------------------------
-- 5. Lock everything to the service role
-- ----------------------------------------------------------------------------
alter table affiliates            enable row level security;
alter table affiliate_clicks      enable row level security;
alter table affiliate_referrals   enable row level security;
alter table affiliate_commissions enable row level security;

-- ----------------------------------------------------------------------------
-- 6. updated_at trigger
-- ----------------------------------------------------------------------------
create or replace function set_affiliates_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists affiliates_updated_at on affiliates;
create trigger affiliates_updated_at before update on affiliates
  for each row execute function set_affiliates_updated_at();

-- ----------------------------------------------------------------------------
-- 7. Programme-wide default rate, editable without a deploy
-- ----------------------------------------------------------------------------
create table if not exists app_settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);
alter table app_settings enable row level security;

insert into app_settings (key, value) values
  ('affiliate_default_pct', '15'),
  ('affiliate_cookie_days', '90')
on conflict (key) do nothing;
