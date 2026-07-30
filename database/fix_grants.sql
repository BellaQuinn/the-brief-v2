-- ============================================================================
-- FIX: schema.sql enabled RLS but never granted base table privileges to
-- `authenticated`. Postgres checks GRANTs before RLS policies, so every
-- query from a logged-in user was failing with "permission denied for
-- table ..." even though the RLS policies themselves are correct.
-- Run this once against the existing project to fix it retroactively.
-- ============================================================================
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
