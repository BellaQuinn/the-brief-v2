-- Academic Documents — the first real file-storage system in this app.
-- Everything before this (resume_url, law_school_documents.url) has been a
-- plain link field, never a hosted file. This is a genuinely new capability:
-- Supabase Storage, not just another Postgres table.
--
-- Shared across every domain deliberately, not Academics-only -- a document
-- can attach to a degree, term, course, assignment, certification, career
-- application, law school, scholarship, or milestone. One unified system,
-- matching the Product Bible's "Knowledge: documents, notes, resources,
-- tags" shared-system principle, rather than a parallel per-domain table.
--
-- New tables need their own explicit GRANTs below -- schema.sql's blanket
-- `grant ... on all tables in schema public` only covers tables that
-- existed when it ran. Confirmed gotcha, twice already (fix_grants.sql /
-- grant_service_role.sql) -- not a third time.

create type academic_document_category as enum (
  'syllabus', 'notes', 'assignment_submission', 'reference', 'transcript',
  'certificate', 'resume', 'cover_letter', 'recommendation', 'financial',
  'essay', 'other'
);

-- Deliberately not a real FK -- Postgres can't constrain a column against
-- "one of these seven different tables." Relationship integrity here is
-- app-level; orphaning on a deleted parent row is left as a soft orphan
-- (the relationship row just stops resolving to anything), consistent with
-- "deletions should be soft where recovery matters."
create type document_relationship_entity_type as enum (
  'degree', 'term', 'course', 'assignment', 'certification', 'application',
  'law_school', 'scholarship', 'milestone'
);

create type document_status as enum ('active', 'archived');

create table public.documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  category academic_document_category not null default 'other',
  status document_status not null default 'active',
  is_favorite boolean not null default false,
  -- Mirrors the latest row in document_versions -- denormalized so a list
  -- read never needs a join just to know what to download.
  storage_path text not null,
  file_name text not null,
  file_size bigint not null,
  mime_type text not null,
  -- OCR target for future full-text search / syllabus extraction. Null
  -- until that pipeline exists -- not populated by this pass.
  extracted_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index documents_user_id_idx on public.documents(user_id);
create index documents_status_idx on public.documents(user_id, status);

create table public.document_relationships (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  entity_type document_relationship_entity_type not null,
  entity_id uuid not null,
  created_at timestamptz not null default now(),
  unique (document_id, entity_type, entity_id)
);
create index document_relationships_document_id_idx on public.document_relationships(document_id);
create index document_relationships_entity_idx on public.document_relationships(entity_type, entity_id);

-- Powers "replace with newer version" -- documents.storage_path always
-- mirrors the latest row here; older versions stay listed and downloadable,
-- never deleted on replace.
create table public.document_versions (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  file_size bigint not null,
  mime_type text not null,
  version_number integer not null,
  uploaded_at timestamptz not null default now()
);
create index document_versions_document_id_idx on public.document_versions(document_id);

-- Append-only. Powers Recently Viewed -- query is "most recent distinct
-- document_id ordered by viewed_at desc," no update-in-place needed.
create table public.document_views (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  viewed_at timestamptz not null default now()
);
create index document_views_user_id_idx on public.document_views(user_id, viewed_at desc);

grant select, insert, update, delete on public.documents, public.document_relationships,
  public.document_versions, public.document_views
  to authenticated, service_role;

alter table public.documents enable row level security;
alter table public.document_relationships enable row level security;
alter table public.document_versions enable row level security;
alter table public.document_views enable row level security;

create policy "documents_all_own" on public.documents for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "document_relationships_all_own" on public.document_relationships for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "document_versions_all_own" on public.document_versions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "document_views_all_own" on public.document_views for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger set_updated_at before update on public.documents
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- STORAGE
-- Private bucket. Path convention: {user_id}/{document_id}/{version}-{name}
-- -- versions live as siblings under the same document folder, never
-- overwritten in place, so version history is just listing that folder.
-- Policies mirror the standard Supabase multi-tenant idiom: the first path
-- segment must equal the caller's own uid.
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  26214400, -- 25MB
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
)
on conflict (id) do nothing;

create policy "documents_storage_select_own" on storage.objects for select
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "documents_storage_insert_own" on storage.objects for insert
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "documents_storage_update_own" on storage.objects for update
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "documents_storage_delete_own" on storage.objects for delete
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
