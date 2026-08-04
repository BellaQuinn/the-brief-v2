-- LSAT study plan generation -- shaped like document_suggestions
-- (Syllabus Intelligence's Recommendation Object) but not tied to a
-- source document: the evidence here is the practice-test history and
-- computed section trends, not a file excerpt. Same hard rule applies --
-- never auto-applied. Accepting a suggestion is the only path that ever
-- creates a real milestones row.

create table public.lsat_study_plan_suggestions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  -- Proposed milestone fields: title, target_date, notes -- mirrors
  -- public.milestones' own columns, kept as jsonb since this is a
  -- proposal, not a real row.
  recommendation jsonb not null,
  reason text not null,
  confidence document_suggestion_confidence not null,
  status document_suggestion_status not null default 'pending',
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);
create index lsat_study_plan_suggestions_user_id_idx on public.lsat_study_plan_suggestions(user_id, status);

grant select, insert, update, delete on public.lsat_study_plan_suggestions to authenticated, service_role;

alter table public.lsat_study_plan_suggestions enable row level security;

create policy "lsat_study_plan_suggestions_all_own" on public.lsat_study_plan_suggestions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
