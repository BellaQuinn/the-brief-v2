-- ============================================================================
-- GRANT service_role ACCESS
-- Same lesson as fix_grants.sql, hitting a different role this time: the
-- service_role key bypasses RLS by design, but Postgres still checks base
-- table GRANTs first — without this, every service-role query (used by
-- lib/supabase/admin.ts for the public progress page) fails with
-- "permission denied" even though the key itself is valid and correctly
-- identified as service_role.
-- ============================================================================
grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
