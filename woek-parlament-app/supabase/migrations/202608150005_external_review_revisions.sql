-- A review ID identifies the analytical thread. New evidence may legitimately
-- refine that thread. Keep such revisions append-only rather than overwriting
-- the first imported proposal.

create table if not exists parliament.external_review_result_revisions (
  id uuid primary key default gen_random_uuid(),
  external_review_result_id uuid not null references parliament.external_review_results(id) on delete cascade,
  result_hash text not null,
  result_payload jsonb not null,
  import_status text not null check (import_status in ('REVIEW_PROPOSAL', 'SOURCE_CONFLICT', 'SCHEMA_INVALID', 'REJECTED')),
  validation_errors jsonb not null default '[]'::jsonb,
  imported_at timestamptz not null default now(),
  unique (external_review_result_id, result_hash)
);

alter table parliament.evidence_candidates
  add column if not exists external_review_result_revision_id uuid
    references parliament.external_review_result_revisions(id) on delete set null;

create index if not exists external_review_result_revisions_parent_idx
  on parliament.external_review_result_revisions (external_review_result_id, imported_at desc);
create index if not exists evidence_candidates_revision_idx
  on parliament.evidence_candidates (external_review_result_revision_id);

alter table parliament.external_review_result_revisions enable row level security;
grant select, insert, update, delete on parliament.external_review_result_revisions to service_role;

notify pgrst, 'reload schema';
