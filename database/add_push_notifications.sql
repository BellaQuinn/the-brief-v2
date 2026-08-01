-- Web Push subscriptions + a dedup ledger, so the daily reminder cron
-- can tell "have I already sent this specific reminder window for this
-- specific item" without re-notifying every day until the item is due.
--
-- New tables need their own explicit GRANTs below -- schema.sql's blanket
-- `grant ... on all tables in schema public` only covers tables that
-- existed when it ran. This has bit the project twice already (see
-- fix_grants.sql / grant_service_role.sql) -- not a third time.

create table public.push_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  -- The endpoint URL a browser's push service assigns is globally unique
  -- per device/install -- re-subscribing the same device should update
  -- the existing row, not create a duplicate.
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index push_subscriptions_user_id_idx on public.push_subscriptions(user_id);

create table public.notification_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  -- e.g. "assignment" | "certification" | "networking" | "law_school" |
  -- "scholarship" | "milestone" | "lsat_test_date" -- matches
  -- lib/calendar.ts's CalendarEventType plus the Graduate & Law School
  -- additions from this same pass.
  source_type text not null,
  source_id uuid not null,
  -- "3_days" | "1_day" | "day_of"
  window text not null,
  sent_at timestamptz not null default now(),
  unique (user_id, source_type, source_id, window)
);
create index notification_log_user_id_idx on public.notification_log(user_id);

grant select, insert, update, delete on public.push_subscriptions, public.notification_log
  to authenticated, service_role;

alter table public.push_subscriptions enable row level security;
alter table public.notification_log enable row level security;

create policy "push_subscriptions_all_own" on public.push_subscriptions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "notification_log_all_own" on public.notification_log for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger set_updated_at before update on public.push_subscriptions
  for each row execute function public.set_updated_at();
