-- ============================================================================
-- Migration 0002: Auth integration + user_progress cloud sync
-- ============================================================================
-- Adds:
--   1. user_progress  — cloud-synced task completion per authenticated user
--   2. RLS policies on members — lets authenticated users read their own row
--   3. RLS policies on user_progress — full CRUD for own rows only
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. user_progress table
-- ----------------------------------------------------------------------------
create table if not exists user_progress (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  task_id     text not null,
  completed   boolean not null default false,
  updated_at  timestamptz not null default now(),
  unique (user_id, task_id)
);

create index if not exists user_progress_user_idx on user_progress (user_id);

alter table user_progress enable row level security;

-- Users can read, insert, update, and delete only their own rows
create policy "user can manage own progress"
  on user_progress for all
  to authenticated
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

-- updated_at auto-update trigger
create or replace function set_user_progress_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists user_progress_updated_at on user_progress;
create trigger user_progress_updated_at
  before update on user_progress
  for each row execute function set_user_progress_updated_at();

-- ----------------------------------------------------------------------------
-- 2. RLS on members: allow authenticated users to read their own record
--    (The service-role key used in the API bypasses RLS, so backend keeps
--     full write access.)
-- ----------------------------------------------------------------------------
create policy "member can read own record"
  on members for select
  to authenticated
  using (lower(email) = lower((auth.jwt() ->> 'email')));

-- ----------------------------------------------------------------------------
-- 3. Helper: upsert a member row (called from backend after payment)
-- Idempotent — safe to call multiple times for the same email.
-- ----------------------------------------------------------------------------
create or replace function upsert_member(
  p_email      text,
  p_status     member_status default 'active',
  p_expires_at timestamptz   default (now() + interval '31 days')
) returns void as $$
begin
  insert into members (email, status, started_at, expires_at)
  values (lower(p_email), p_status, now(), p_expires_at)
  on conflict (lower(email))
  do update set
    status     = excluded.status,
    expires_at = excluded.expires_at,
    started_at = case
                   when members.started_at is null then now()
                   else members.started_at
                 end;
end;
$$ language plpgsql security definer;
