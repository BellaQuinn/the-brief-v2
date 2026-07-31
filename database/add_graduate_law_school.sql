-- ============================================================================
-- Graduate & Law School — schools, scholarships, LSAT prep, documents,
-- and a general-purpose milestone roadmap.
--
-- All five new tables are direct-ownership (user_id -> public.users),
-- same simple RLS pattern as certifications/applications/networking/
-- resources — none of these nest through degree/term/course like Academics.
--
-- IMPORTANT: schema.sql's blanket "grant ... on all tables in schema public"
-- only covers tables that existed when it ran. New tables need their own
-- explicit GRANTs below, or every query fails with "permission denied"
-- regardless of RLS policies (bit us twice already this project).
-- ============================================================================

create type law_school_status as enum ('researching', 'planning_to_apply', 'applying', 'applied', 'waitlisted', 'accepted', 'rejected', 'enrolled');
create type law_school_priority as enum ('dream', 'reach', 'target', 'safety');
create type scholarship_status as enum ('researching', 'eligible', 'applying', 'applied', 'awarded', 'declined');
create type milestone_status as enum ('upcoming', 'in_progress', 'completed');
create type document_category as enum ('essay', 'recommendation', 'transcript', 'financial', 'other');

-- LSAT goal/diagnostic/planned-test-date are singleton per-user settings,
-- same pattern as the existing resume_url/resume_updated_at columns.
alter table public.users
  add column lsat_goal_score numeric,
  add column lsat_diagnostic_score numeric,
  add column lsat_planned_test_date date;

create table public.law_schools (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  school_name text not null,
  status law_school_status not null default 'researching',
  priority law_school_priority,
  application_deadline date,
  lsat_requirement numeric,
  median_gpa numeric,
  median_lsat numeric,
  essays_status text,
  recommendations_status text,
  -- Separate from personal_notes on purpose — a decision-journal field
  -- (why the school appeals, campus-visit impressions, conversations),
  -- meant to stand out once there are many schools to compare.
  why_this_school text,
  personal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.scholarships (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  law_school_id uuid references public.law_schools(id) on delete set null,
  name text not null,
  amount numeric,
  deadline date,
  status scholarship_status not null default 'researching',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lsat_practice_tests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  test_date date not null,
  source text,
  scaled_score numeric,
  logical_reasoning_score numeric,
  reading_comprehension_score numeric,
  analytical_reasoning_score numeric,
  timed boolean not null default true,
  confidence integer,
  missed_questions integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.law_school_documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  law_school_id uuid references public.law_schools(id) on delete set null,
  title text not null,
  category document_category not null default 'other',
  url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- General-purpose milestone roadmap — not law-school-specific in schema
-- even though it's only surfaced under Graduate & Law School's Timeline
-- tab today. Nothing stops a future Academic/Career milestone living here.
create table public.milestones (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  target_date date,
  status milestone_status not null default 'upcoming',
  progress numeric not null default 0 check (progress >= 0 and progress <= 100),
  notes text,
  linked_href text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index law_schools_user_id_idx on public.law_schools(user_id);
create index scholarships_user_id_idx on public.scholarships(user_id);
create index lsat_practice_tests_user_id_idx on public.lsat_practice_tests(user_id);
create index law_school_documents_user_id_idx on public.law_school_documents(user_id);
create index milestones_user_id_idx on public.milestones(user_id);

grant select, insert, update, delete on public.law_schools, public.scholarships,
  public.lsat_practice_tests, public.law_school_documents, public.milestones
  to authenticated, service_role;

alter table public.law_schools enable row level security;
alter table public.scholarships enable row level security;
alter table public.lsat_practice_tests enable row level security;
alter table public.law_school_documents enable row level security;
alter table public.milestones enable row level security;

create policy "law_schools_all_own" on public.law_schools for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "scholarships_all_own" on public.scholarships for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "lsat_practice_tests_all_own" on public.lsat_practice_tests for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "law_school_documents_all_own" on public.law_school_documents for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "milestones_all_own" on public.milestones for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger set_updated_at before update on public.law_schools for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.scholarships for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.lsat_practice_tests for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.law_school_documents for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.milestones for each row execute function public.set_updated_at();

-- ============================================================================
-- One-time seed: the user's starting milestone roadmap. Undated (she fills
-- in real target dates as they firm up) and in the order she gave.
-- ============================================================================
insert into public.milestones (user_id, title, sort_order, status)
select id, title, sort_order, 'upcoming'::milestone_status
from public.users, (values
  ('Finish Bachelor''s', 0),
  ('Maintain GPA goal', 1),
  ('Begin LSAT preparation', 2),
  ('Take first diagnostic', 3),
  ('Register for the LSAT', 4),
  ('Take the LSAT', 5),
  ('Submit applications', 6),
  ('Scholarship deadlines', 7),
  ('Interview invitations', 8),
  ('Admission decisions', 9),
  ('Seat deposit', 10),
  ('Begin JD', 11)
) as m(title, sort_order)
where public.users.email = 'ktalley132@gmail.com';
