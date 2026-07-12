-- AI Founder Hub backend schema
-- Postgres / Supabase. All write access goes through Edge Functions using the
-- service-role key (which bypasses RLS). RLS is left ON with no public policies,
-- so the anon/public key can read/write nothing directly. This keeps the CRM,
-- payments, and bookings server-controlled.

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
create type lead_goal as enum ('founder', 'freelancer', 'scaleup', 'agency', 'explore');
create type payment_purpose as enum ('booking', 'bootcamp', 'membership');
create type payment_status as enum ('pending', 'completed', 'failed', 'refunded');
create type booking_status as enum ('pending_payment', 'confirmed', 'cancelled');
create type member_status as enum ('active', 'lapsed', 'cancelled');

-- ----------------------------------------------------------------------------
-- Leads (the CRM core: every signup from the website)
-- ----------------------------------------------------------------------------
create table leads (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  first_name   text not null,
  email        text not null,
  phone        text,
  country_code text,
  dial_code    text,
  goal         lead_goal not null default 'explore',
  source       text not null default 'website',         -- which form / campaign
  tags         text[] not null default '{}',
  notes        text
);
create unique index leads_email_key on leads (lower(email));
create index leads_created_at_idx on leads (created_at desc);
create index leads_goal_idx on leads (goal);

-- ----------------------------------------------------------------------------
-- Mentors (Ahmed & Zain) and their bookable config
-- ----------------------------------------------------------------------------
create table mentors (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,                      -- 'ahmed' | 'zain'
  name        text not null,
  role        text not null,
  -- charge config: Ziina settles in AED, amounts are in fils (100 AED = 10000)
  price_fils  integer not null,
  currency    text not null default 'AED',
  -- availability as weekly recurring windows in the mentor's local timezone
  timezone    text not null default 'Asia/Dubai',
  active       boolean not null default true,
  session_minutes integer not null default 60
);

-- Weekly recurring availability windows (0 = Sunday ... 6 = Saturday)
create table availability_rules (
  id         uuid primary key default gen_random_uuid(),
  mentor_id  uuid not null references mentors(id) on delete cascade,
  weekday    smallint not null check (weekday between 0 and 6),
  start_min  smallint not null,   -- minutes from midnight, e.g. 17:00 = 1020
  end_min    smallint not null,
  check (end_min > start_min)
);
create index availability_rules_mentor_idx on availability_rules (mentor_id);

-- One-off blocked slots (holidays, manual blocks)
create table availability_blocks (
  id         uuid primary key default gen_random_uuid(),
  mentor_id  uuid not null references mentors(id) on delete cascade,
  starts_at  timestamptz not null,
  ends_at    timestamptz not null,
  reason     text
);

-- ----------------------------------------------------------------------------
-- Payments (one row per Ziina payment_intent)
-- ----------------------------------------------------------------------------
create table payments (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  purpose             payment_purpose not null,
  status              payment_status not null default 'pending',
  amount_fils         integer not null,
  currency            text not null default 'AED',
  customer_name       text,
  customer_email      text not null,
  lead_id             uuid references leads(id) on delete set null,
  ziina_intent_id     text unique,                       -- Ziina payment_intent id
  ziina_redirect_url  text,
  is_test             boolean not null default true,
  reference_table     text,                              -- 'bookings' | 'bootcamp_applications' | 'members'
  reference_id        uuid,
  latest_error        text
);
create index payments_status_idx on payments (status);
create index payments_email_idx on payments (lower(customer_email));

-- ----------------------------------------------------------------------------
-- Bookings (1:1 sessions)
-- ----------------------------------------------------------------------------
create table bookings (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  mentor_id       uuid not null references mentors(id),
  customer_name   text not null,
  customer_email  text not null,
  customer_phone  text,
  starts_at       timestamptz not null,
  ends_at         timestamptz not null,
  status          booking_status not null default 'pending_payment',
  payment_id      uuid references payments(id) on delete set null,
  topic           text,
  lead_id         uuid references leads(id) on delete set null
);
-- prevent double-booking the same confirmed slot for a mentor
create unique index bookings_slot_unique
  on bookings (mentor_id, starts_at)
  where status <> 'cancelled';
create index bookings_starts_idx on bookings (starts_at);

-- ----------------------------------------------------------------------------
-- Bootcamp applications ($249 program)
-- ----------------------------------------------------------------------------
create table bootcamp_applications (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  email       text not null,
  pathway     text not null,                             -- founder|freelancer|scaleup|agency
  status      text not null default 'applied',           -- applied|paid|enrolled|rejected
  payment_id  uuid references payments(id) on delete set null,
  lead_id     uuid references leads(id) on delete set null
);

-- ----------------------------------------------------------------------------
-- Members ($49.99/mo courses membership, renewal-link model)
-- ----------------------------------------------------------------------------
create table members (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  lead_id         uuid references leads(id) on delete set null,
  email           text not null,
  status          member_status not null default 'lapsed',
  started_at      timestamptz,
  expires_at      timestamptz,                           -- access end; renewal link sent before this
  last_payment_id uuid references payments(id) on delete set null,
  renewal_reminders_sent smallint not null default 0
);
create unique index members_email_key on members (lower(email));

-- ----------------------------------------------------------------------------
-- Webhook events (idempotency log for Ziina callbacks)
-- ----------------------------------------------------------------------------
create table webhook_events (
  id            uuid primary key default gen_random_uuid(),
  received_at   timestamptz not null default now(),
  provider      text not null default 'ziina',
  event_key     text not null,                           -- dedupe key (intent id + status)
  payload       jsonb not null,
  processed     boolean not null default false
);
create unique index webhook_events_key on webhook_events (provider, event_key);

-- ----------------------------------------------------------------------------
-- updated_at trigger for payments
-- ----------------------------------------------------------------------------
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;
create trigger payments_updated_at before update on payments
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- Lock everything down. Edge Functions use the service-role key and bypass RLS.
-- No anon/public policies are created, so the public key cannot touch these.
-- ----------------------------------------------------------------------------
alter table leads                 enable row level security;
alter table mentors               enable row level security;
alter table availability_rules    enable row level security;
alter table availability_blocks   enable row level security;
alter table payments              enable row level security;
alter table bookings              enable row level security;
alter table bootcamp_applications enable row level security;
alter table members               enable row level security;
alter table webhook_events        enable row level security;

-- ----------------------------------------------------------------------------
-- Seed: the two founders. Adjust price_fils to your real AED price.
-- 299 USD ~= 1098 AED -> 109800 fils. Set the exact amount you want to charge.
-- ----------------------------------------------------------------------------
insert into mentors (slug, name, role, price_fils, currency, timezone, session_minutes) values
  ('ahmed', 'Ahmed Al Kindi', 'Cofounder, Growth & Systems', 109800, 'AED', 'Asia/Dubai', 60),
  ('zain',  'Zain Ul Abideen', 'Founder & CEO',            109800, 'AED', 'Asia/Dubai', 60);

-- Default weekly availability: Sun-Thu (UAE work week), 17:00-21:00 local.
insert into availability_rules (mentor_id, weekday, start_min, end_min)
select id, wd, 1020, 1260
from mentors, unnest(array[0,1,2,3,4]) as wd;
