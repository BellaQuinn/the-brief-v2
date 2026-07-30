-- ============================================================================
-- MIGRATE V1 PLANNER DATA → V2 RELATIONAL SCHEMA
-- Source: public.planner_data (single JSON blob, row id 'krystal-public')
-- Target: public.degrees / public.terms / public.courses
--
-- Run this AFTER database/schema.sql, and AFTER signing up in the v2 app
-- with the email below (the schema's auth trigger needs an existing
-- auth.users row to attach data to).
-- ============================================================================

-- Courses had free-text notes in v1 with no home in the v2 schema.
-- Adding a nullable column rather than dropping that context.
alter table public.courses add column if not exists notes text;

do $$
declare
  v_user_id uuid;
  v_degree_id uuid;
  v_term_id uuid;
begin
  select id into v_user_id from auth.users where email = 'ktalley132@gmail.com';
  if v_user_id is null then
    raise exception 'No auth user found for ktalley132@gmail.com — sign up in the v2 app first, then re-run this script.';
  end if;

  -- This account predates the handle_new_user() trigger (created for v1,
  -- before schema.sql existed), so the trigger never fired for it and
  -- public.users has no matching row. degrees.user_id has a FK to
  -- public.users, not auth.users directly, so backfill it here.
  insert into public.users (id, email, first_name, last_name)
  select id, email, raw_user_meta_data->>'first_name', raw_user_meta_data->>'last_name'
  from auth.users
  where id = v_user_id
  on conflict (id) do nothing;

  insert into public.degrees (user_id, school_name, degree_name, total_credits, completed_credits, expected_graduation, status)
  values (v_user_id, 'Champlain College Online', 'B.S. Cybersecurity', 120, 39, '2028-05-01', 'active')
  returning id into v_degree_id;

  -- Fall 2026 – 7A
  insert into public.terms (degree_id, name, status) values (v_degree_id, 'Fall 2026 – 7A', 'active') returning id into v_term_id;
  insert into public.courses (term_id, course_code, course_name, credits, status, notes) values
    (v_term_id, 'CMIT 130', 'Networking Fundamentals', 3, 'in_progress', null),
    (v_term_id, 'COMM 230', 'Small Group Communication', 3, 'in_progress', null);

  -- Fall 2026 – 7B
  insert into public.terms (degree_id, name, status) values (v_degree_id, 'Fall 2026 – 7B', 'active') returning id into v_term_id;
  insert into public.courses (term_id, course_code, course_name, credits, status, notes) values
    (v_term_id, 'CMIT 140', 'Introduction to Operating Systems', 3, 'in_progress', 'Certificate course'),
    (v_term_id, 'SOCI 200', 'Social Justice Perspectives', 3, 'in_progress', null),
    (v_term_id, 'WEBD 125', 'Web Page Development I', 3, 'in_progress', 'Advisor confirmation needed');

  -- Spring 2027 – 7A
  insert into public.terms (degree_id, name, status) values (v_degree_id, 'Spring 2027 – 7A', 'upcoming') returning id into v_term_id;
  insert into public.courses (term_id, course_code, course_name, credits, status, notes) values
    (v_term_id, 'CMIT 135', 'Introduction to Python', 3, 'planned', 'Certificate course'),
    (v_term_id, 'SCI 180', 'Science', 3, 'planned', null),
    (v_term_id, 'MGMT 260', 'Foundations of Project Management', 3, 'planned', null);

  -- Spring 2027 – 7B
  insert into public.terms (degree_id, name, status) values (v_degree_id, 'Spring 2027 – 7B', 'upcoming') returning id into v_term_id;
  insert into public.courses (term_id, course_code, course_name, credits, status, notes) values
    (v_term_id, 'NETW 210', 'Wireless Networking', 3, 'planned', null),
    (v_term_id, 'GEN ED 2', 'General Education', 3, 'planned', 'Select with advisor');

  -- Summer 2027 – 7A
  insert into public.terms (degree_id, name, status) values (v_degree_id, 'Summer 2027 – 7A', 'upcoming') returning id into v_term_id;
  insert into public.courses (term_id, course_code, course_name, credits, status, notes) values
    (v_term_id, 'NETW 215', 'TCP/IP', 3, 'planned', null),
    (v_term_id, 'CFDI 240', 'Digital Forensic Investigation Techniques', 3, 'planned', 'Certificate course'),
    (v_term_id, 'GEN ED 3', 'General Education', 3, 'planned', 'Select with advisor');

  -- Summer 2027 – 7B
  insert into public.terms (degree_id, name, status) values (v_degree_id, 'Summer 2027 – 7B', 'upcoming') returning id into v_term_id;
  insert into public.courses (term_id, course_code, course_name, credits, status, notes) values
    (v_term_id, 'CYBR 240', 'Networking & Security', 3, 'planned', null),
    (v_term_id, 'CMIT 280', 'Cloud Computing Security', 3, 'planned', null),
    (v_term_id, 'ELECTIVE 1', 'Elective', 3, 'planned', 'Could support certificate or law focus');

  -- Fall 2027 – 7A
  insert into public.terms (degree_id, name, status) values (v_degree_id, 'Fall 2027 – 7A', 'upcoming') returning id into v_term_id;
  insert into public.courses (term_id, course_code, course_name, credits, status, notes) values
    (v_term_id, 'NETW 255', 'System Administration & Network Services I', 3, 'planned', null),
    (v_term_id, 'CRIM 120', 'Criminal Law', 3, 'planned', 'Certificate course'),
    (v_term_id, 'GEN ED 4', 'General Education', 3, 'planned', 'Select with advisor');

  -- Fall 2027 – 7B
  insert into public.terms (degree_id, name, status) values (v_degree_id, 'Fall 2027 – 7B', 'upcoming') returning id into v_term_id;
  insert into public.courses (term_id, course_code, course_name, credits, status, notes) values
    (v_term_id, 'CYBR 260', 'Security Scripting with Python', 3, 'planned', null),
    (v_term_id, 'CYBR 310', 'Mobile Security', 3, 'planned', null),
    (v_term_id, 'CRIM 121', 'Criminal Procedure', 3, 'planned', 'Certificate course');

  -- Spring 2028 – 7A
  insert into public.terms (degree_id, name, status) values (v_degree_id, 'Spring 2028 – 7A', 'upcoming') returning id into v_term_id;
  insert into public.courses (term_id, course_code, course_name, credits, status, notes) values
    (v_term_id, 'CYBR 320', 'Intrusion Analysis & Response', 3, 'planned', null),
    (v_term_id, 'CYBR 330', 'Operating System Security', 3, 'planned', null),
    (v_term_id, 'ELECTIVE 2', 'Elective', 3, 'planned', 'Advisor confirmation needed');

  -- Spring 2028 – 7B
  insert into public.terms (degree_id, name, status) values (v_degree_id, 'Spring 2028 – 7B', 'upcoming') returning id into v_term_id;
  insert into public.courses (term_id, course_code, course_name, credits, status, notes) values
    (v_term_id, 'CYBR 335', 'Ethical Hacking', 3, 'planned', null),
    (v_term_id, 'CYBR 410', 'Emerging Threats & Defenses', 3, 'planned', null),
    (v_term_id, 'CFDI 345', 'Operating System Forensics', 3, 'planned', 'Certificate course; CFDI 240 prerequisite');

end $$;
