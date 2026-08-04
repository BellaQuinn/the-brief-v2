-- Certification practice tracking -- the same practice-score log ->
-- trend analysis -> AI study plan pattern already shipped for LSAT, but
-- certifications don't share one fixed exam shape the way the LSAT does.
-- Different certs use different domains and different scales (PMP:
-- Above/At/Below Target across its own domains; CompTIA: numeric
-- 100-900; some certs are pure pass/fail with no number at all) -- so
-- domain_scores is jsonb (an array of {domain, score} the user names
-- themselves) rather than fixed columns like the LSAT's LR/RC/AR.

alter table public.certifications
  add column passing_score numeric;

create table public.certification_practice_tests (
  id uuid primary key default uuid_generate_v4(),
  certification_id uuid not null references public.certifications(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  test_date date not null,
  overall_score numeric,
  overall_result text,
  domain_scores jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index certification_practice_tests_certification_id_idx on public.certification_practice_tests(certification_id);
create index certification_practice_tests_user_id_idx on public.certification_practice_tests(user_id);

-- Shaped like lsat_study_plan_suggestions (the Product Bible's
-- Recommendation Object) but per-certification rather than singleton --
-- reuses the same confidence/status enums, never auto-applied.
create table public.certification_study_plan_suggestions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  certification_id uuid not null references public.certifications(id) on delete cascade,
  recommendation jsonb not null,
  reason text not null,
  confidence document_suggestion_confidence not null,
  status document_suggestion_status not null default 'pending',
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);
create index certification_study_plan_suggestions_user_id_idx on public.certification_study_plan_suggestions(user_id, status);
create index certification_study_plan_suggestions_certification_id_idx on public.certification_study_plan_suggestions(certification_id);

grant select, insert, update, delete on public.certification_practice_tests, public.certification_study_plan_suggestions
  to authenticated, service_role;

alter table public.certification_practice_tests enable row level security;
alter table public.certification_study_plan_suggestions enable row level security;

create policy "certification_practice_tests_all_own" on public.certification_practice_tests for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "certification_study_plan_suggestions_all_own" on public.certification_study_plan_suggestions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger set_updated_at before update on public.certification_practice_tests
  for each row execute function public.set_updated_at();
