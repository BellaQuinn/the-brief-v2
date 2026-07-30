-- ============================================================================
-- THE BRIEF — Database Schema
-- Mission Control for ambitious nontraditional students.
--
-- Principle: single source of truth. Assignments live in one table.
-- Dashboard, courses, calendar, and search all query the same rows —
-- nothing is duplicated anywhere downstream.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Extensions
-- ----------------------------------------------------------------------------
create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- ENUM TYPES
-- ----------------------------------------------------------------------------
create type degree_status as enum ('active', 'completed', 'paused', 'planned');
create type term_status as enum ('upcoming', 'active', 'completed');
create type course_delivery_mode as enum ('in_person', 'online', 'hybrid');
create type course_status as enum ('in_progress', 'completed', 'withdrawn', 'planned');
create type assignment_type as enum ('homework', 'quiz', 'exam', 'paper', 'project', 'discussion', 'reading', 'other');
create type assignment_status as enum ('not_started', 'in_progress', 'submitted', 'graded');
create type priority_level as enum ('low', 'medium', 'high', 'urgent');
create type certification_status as enum ('planned', 'studying', 'scheduled', 'passed', 'failed', 'expired');
create type application_status as enum ('saved', 'applied', 'phone_screen', 'interviewing', 'offer', 'rejected', 'withdrawn');
create type resource_category as enum ('book', 'article', 'template', 'link', 'course', 'other');

-- ----------------------------------------------------------------------------
-- USERS
-- Mirrors auth.users (Supabase Auth). One row per authenticated user.
-- ----------------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  email text not null,
  avatar_url text,
  timezone text not null default 'America/New_York',
  -- Career workspace's Resume card is a link-out (Google Docs/Dropbox/etc.),
  -- not a hosted file — no Supabase Storage bucket needed for this.
  resume_url text,
  resume_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- DEGREES
-- ----------------------------------------------------------------------------
create table public.degrees (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  school_name text not null,
  degree_name text not null,
  major text,
  minor text,
  catalog_year text,
  total_credits numeric,
  completed_credits numeric not null default 0,
  expected_graduation date,
  status degree_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index degrees_user_id_idx on public.degrees(user_id);

-- ----------------------------------------------------------------------------
-- TERMS
-- ----------------------------------------------------------------------------
create table public.terms (
  id uuid primary key default uuid_generate_v4(),
  degree_id uuid not null references public.degrees(id) on delete cascade,
  name text not null,
  start_date date,
  end_date date,
  status term_status not null default 'upcoming',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index terms_degree_id_idx on public.terms(degree_id);

-- ----------------------------------------------------------------------------
-- COURSES
-- ----------------------------------------------------------------------------
create table public.courses (
  id uuid primary key default uuid_generate_v4(),
  term_id uuid not null references public.terms(id) on delete cascade,
  course_code text,
  course_name text not null,
  credits numeric,
  professor text,
  delivery_mode course_delivery_mode,
  status course_status not null default 'in_progress',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index courses_term_id_idx on public.courses(term_id);

-- ----------------------------------------------------------------------------
-- ASSIGNMENTS
-- Single source of truth for everything due, everywhere in the app.
-- ----------------------------------------------------------------------------
create table public.assignments (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  type assignment_type not null default 'other',
  due_date timestamptz,
  points_possible numeric,
  points_earned numeric,
  status assignment_status not null default 'not_started',
  priority priority_level not null default 'medium',
  estimated_minutes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index assignments_course_id_idx on public.assignments(course_id);
create index assignments_due_date_idx on public.assignments(due_date);
create index assignments_status_idx on public.assignments(status);

-- ----------------------------------------------------------------------------
-- CERTIFICATIONS
-- ----------------------------------------------------------------------------
create table public.certifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  provider text,
  status certification_status not null default 'planned',
  exam_date date,
  expiration_date date,
  progress numeric not null default 0 check (progress >= 0 and progress <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index certifications_user_id_idx on public.certifications(user_id);

-- ----------------------------------------------------------------------------
-- APPLICATIONS (job applications)
-- ----------------------------------------------------------------------------
create table public.applications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  company text not null,
  position text not null,
  salary text,
  location text,
  status application_status not null default 'saved',
  date_applied date,
  next_action text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index applications_user_id_idx on public.applications(user_id);

-- ----------------------------------------------------------------------------
-- NETWORKING
-- ----------------------------------------------------------------------------
create table public.networking (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  company text,
  role text,
  linkedin text,
  last_contact date,
  next_follow_up date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index networking_user_id_idx on public.networking(user_id);

-- ----------------------------------------------------------------------------
-- RESOURCES (personal knowledge library)
-- ----------------------------------------------------------------------------
create table public.resources (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  category resource_category not null default 'other',
  url text,
  notes text,
  favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index resources_user_id_idx on public.resources(user_id);

-- ============================================================================
-- GRANTS
-- RLS policies below only take effect once the role has base table
-- privileges — Postgres checks GRANTs first, then RLS narrows further.
-- Without this, every query from an authenticated user fails with
-- "permission denied for table ..." regardless of the policies.
-- ============================================================================
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;

-- service_role bypasses RLS by design, but still needs base GRANTs like
-- any other role — used server-side only (lib/supabase/admin.ts) for the
-- public progress page, never exposed to the browser.
grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;

-- ============================================================================
-- ROW LEVEL SECURITY
-- Every table: users can only ever read/write their own data.
-- ============================================================================
alter table public.users enable row level security;
alter table public.degrees enable row level security;
alter table public.terms enable row level security;
alter table public.courses enable row level security;
alter table public.assignments enable row level security;
alter table public.certifications enable row level security;
alter table public.applications enable row level security;
alter table public.networking enable row level security;
alter table public.resources enable row level security;

-- USERS: a user can only see/edit their own row
create policy "users_select_own" on public.users for select using (auth.uid() = id);
create policy "users_update_own" on public.users for update using (auth.uid() = id);
create policy "users_insert_own" on public.users for insert with check (auth.uid() = id);

-- DEGREES: direct ownership
create policy "degrees_all_own" on public.degrees for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- TERMS: ownership via degree
create policy "terms_all_own" on public.terms for all
  using (auth.uid() = (select user_id from public.degrees where id = degree_id))
  with check (auth.uid() = (select user_id from public.degrees where id = degree_id));

-- COURSES: ownership via term -> degree
create policy "courses_all_own" on public.courses for all
  using (auth.uid() = (
    select d.user_id from public.degrees d
    join public.terms t on t.degree_id = d.id
    where t.id = term_id
  ))
  with check (auth.uid() = (
    select d.user_id from public.degrees d
    join public.terms t on t.degree_id = d.id
    where t.id = term_id
  ));

-- ASSIGNMENTS: ownership via course -> term -> degree
create policy "assignments_all_own" on public.assignments for all
  using (auth.uid() = (
    select d.user_id from public.degrees d
    join public.terms t on t.degree_id = d.id
    join public.courses c on c.term_id = t.id
    where c.id = course_id
  ))
  with check (auth.uid() = (
    select d.user_id from public.degrees d
    join public.terms t on t.degree_id = d.id
    join public.courses c on c.term_id = t.id
    where c.id = course_id
  ));

-- Direct-ownership tables
create policy "certifications_all_own" on public.certifications for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "applications_all_own" on public.applications for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "networking_all_own" on public.networking for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "resources_all_own" on public.resources for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS: keep updated_at fresh
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.users for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.degrees for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.terms for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.courses for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.assignments for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.certifications for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.applications for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.networking for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.resources for each row execute function public.set_updated_at();

-- ============================================================================
-- AUTO-CREATE public.users ROW ON SIGNUP
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
