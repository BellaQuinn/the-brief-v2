-- ============================================================================
-- ADD RESUME FIELDS
-- The Career workspace's "Resume" section is a link-out card (URL + last
-- updated date), not a hosted file — see schema.sql's Career-adjacent
-- tables for context. Additive, safe to run on the existing project.
-- ============================================================================
alter table public.users add column if not exists resume_url text;
alter table public.users add column if not exists resume_updated_at timestamptz;
