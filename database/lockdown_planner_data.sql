-- ============================================================================
-- LOCK DOWN planner_data
-- v1's planner_data table has never had RLS enabled — anyone with the
-- public anon/publishable key can read (and write) it, no login required.
-- This scopes every operation to the row's owner, matching every other
-- table in the schema. Table-level grants to `authenticated` already exist
-- from schema.sql's blanket grant (it predates this table's creation).
-- ============================================================================
alter table public.planner_data enable row level security;

create policy "planner_data_select_own" on public.planner_data
  for select using (auth.uid() = owner_id);

create policy "planner_data_insert_own" on public.planner_data
  for insert with check (auth.uid() = owner_id);

create policy "planner_data_update_own" on public.planner_data
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "planner_data_delete_own" on public.planner_data
  for delete using (auth.uid() = owner_id);
