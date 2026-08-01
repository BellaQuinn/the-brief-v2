-- Syllabus Intelligence — human-reviewed extraction, never an automatic
-- write. A suggestion is a proposal shaped like the Product Bible's own
-- Recommendation Object (recommendation / reason / evidence / confidence /
-- user action); accepting one is the *only* path that ever creates a real
-- `assignments` row. The extraction call itself never touches
-- assignments/courses directly.

create type document_suggestion_confidence as enum ('high', 'medium', 'low');
create type document_suggestion_status as enum ('pending', 'accepted', 'edited_and_accepted', 'dismissed');

create table public.document_suggestions (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  -- Proposed assignment fields: title, type, due_date, points_possible,
  -- weight_percent, priority -- mirrors public.assignments' own columns,
  -- kept as jsonb rather than one column per field since this is a
  -- proposal, not a real row, and its shape may grow (course_detail
  -- suggestions, say) without a schema migration each time.
  recommendation jsonb not null,
  reason text not null,
  -- The syllabus excerpt the suggestion was drawn from -- source
  -- transparency per the Bible's AI Trust Controls, shown in the review
  -- UI so a suggestion is never taken on faith.
  evidence text,
  confidence document_suggestion_confidence not null,
  status document_suggestion_status not null default 'pending',
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);
create index document_suggestions_document_id_idx on public.document_suggestions(document_id);
create index document_suggestions_user_id_idx on public.document_suggestions(user_id, status);

grant select, insert, update, delete on public.document_suggestions to authenticated, service_role;

alter table public.document_suggestions enable row level security;

create policy "document_suggestions_all_own" on public.document_suggestions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
