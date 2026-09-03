-- Candidate evidence from an external WÖk review is not a verified source.
-- This protected queue preserves the proposal, its limits and its provenance
-- until an editor has checked the primary source. It has no public policy and
-- is deliberately separate from parliament.public_source_registry.

create table if not exists parliament.evidence_candidates (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references parliament.cases(id) on delete cascade,
  external_review_result_id uuid not null references parliament.external_review_results(id) on delete cascade,
  candidate_key text not null check (candidate_key ~ '^[A-Za-z0-9][A-Za-z0-9_-]{0,159}$'),
  title text not null,
  institution text not null,
  canonical_url text not null check (canonical_url ~ '^https://'),
  publication_date date,
  retrieval_date date,
  source_type text not null,
  exact_location text,
  temporal_class text not null check (temporal_class in ('AVAILABLE_AT_DECISION_TIME', 'PUBLISHED_AFTER_DECISION', 'CURRENT_REFERENCE')),
  needed_for text not null,
  what_it_supports text not null,
  what_it_does_not_support text not null,
  candidate_payload jsonb not null,
  candidate_hash text not null,
  verification_status text not null default 'CANDIDATE_ONLY'
    check (verification_status in ('CANDIDATE_ONLY', 'ACCESSIBLE_UNVERIFIED', 'SOURCE_REVIEW_REQUIRED', 'VERIFIED_FOR_INTERNAL_USE', 'REJECTED', 'SUPERSEDED')),
  availability_checked_at timestamptz,
  availability_http_status integer,
  verified_source_document_id uuid references parliament.source_documents(id) on delete set null,
  verification_note text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (case_id, candidate_key, candidate_hash)
);

create index if not exists evidence_candidates_queue_idx
  on parliament.evidence_candidates (verification_status, created_at asc);
create index if not exists evidence_candidates_case_idx
  on parliament.evidence_candidates (case_id, verification_status);

alter table parliament.evidence_candidates enable row level security;
grant select, insert, update, delete on parliament.evidence_candidates to service_role;

notify pgrst, 'reload schema';
