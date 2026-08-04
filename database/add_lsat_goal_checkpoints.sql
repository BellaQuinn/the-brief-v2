-- LSAT goal-gap planner -- breaks a single goal score into dated
-- checkpoints ("158 by Sept 15", "160 by Oct 15") plotted alongside the
-- real score trajectory, rather than leaving the goal as one distant
-- number with no path to it.

create table public.lsat_goal_checkpoints (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  target_date date not null,
  target_score integer not null,
  label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index lsat_goal_checkpoints_user_id_idx on public.lsat_goal_checkpoints(user_id);

grant select, insert, update, delete on public.lsat_goal_checkpoints to authenticated, service_role;

alter table public.lsat_goal_checkpoints enable row level security;

create policy "lsat_goal_checkpoints_all_own" on public.lsat_goal_checkpoints for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger set_updated_at before update on public.lsat_goal_checkpoints
  for each row execute function public.set_updated_at();
