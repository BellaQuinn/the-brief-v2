-- ============================================================================
-- Academic Standing — grade tracking fields
--
-- final_grade_override: escape hatch for a course's final grade when it
-- can't be derived from assignment data (instructor curve, transfer/legacy
-- course). Accepts any grade string from the institution policy's scale
-- (e.g. 'A-') or non-GPA grades ('P', 'W', 'I', 'AU').
--
-- weight_percent: optional per-assignment weight. If any graded, included
-- assignment in a course has a weight set, the course grade is computed as
-- a weight-normalized average; otherwise it falls back to simple points
-- aggregation. Lets one course grade calculation handle both grading styles.
--
-- grade_excluded: drop an assignment from grade calculations entirely
-- (extra credit, a dropped lowest score, etc.) without deleting the row.
-- ============================================================================
alter table public.courses add column final_grade_override text;
alter table public.assignments add column weight_percent numeric;
alter table public.assignments add column grade_excluded boolean not null default false;
