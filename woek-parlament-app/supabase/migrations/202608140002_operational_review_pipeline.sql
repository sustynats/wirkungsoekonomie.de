-- Operational data model for the protected parliamentary import and external review workflow.
-- All tables remain private by default. Public pages read only separately approved projections.

alter table parliament.cases
  add column if not exists official_title text,
  add column if not exists decision_date date,
  add column if not exists decision_type text,
  add column if not exists proposer jsonb not null default '[]'::jsonb,
  add column if not exists vote_type text,
  add column if not exists vote_result jsonb not null default '{}'::jsonb,
  add column if not exists named_vote_available boolean not null default false,
  add column if not exists materiality_status text not null default 'NOT_SCREENED'
    check (materiality_status in ('NOT_SCREENED', 'NOT_SELECTED_FOR_FULL_IMPACT_REVIEW', 'SELECTED_FOR_FULL_IMPACT_REVIEW', 'MATERIALITY_REVIEW_REQUIRED')),
  add column if not exists review_status text not null default 'NOT_READY'
    check (review_status in ('NOT_READY', 'FACT_PACKAGE_IN_PROGRESS', 'REVIEW_PACKAGE_READY', 'EXTERNAL_REVIEW_PENDING', 'REVIEW_IMPORTED', 'CALCULATION_PENDING', 'TASKS_OPEN', 'READY_FOR_APPROVAL', 'PUBLISHED', 'DATA_GAP')),
  add column if not exists historical_assessment_status text,
  add column if not exists source_snapshot jsonb not null default '{}'::jsonb;

alter table parliament.source_documents
  add column if not exists source_hash text,
  add column if not exists temporal_class text not null default 'CURRENT_REFERENCE'
    check (temporal_class in ('AVAILABLE_AT_DECISION_TIME', 'PUBLISHED_AFTER_DECISION', 'CURRENT_REFERENCE')),
  add column if not exists source_metadata jsonb not null default '{}'::jsonb;

alter table parliament.document_versions
  add column if not exists normalized_text text,
  add column if not exists source_metadata jsonb not null default '{}'::jsonb;

create table if not exists parliament.decision_units (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references parliament.cases(id) on delete cascade,
  external_decision_id text,
  title text not null,
  decision_date date,
  parliamentary_stage text,
  final_decision_text text,
  final_document_version_id uuid references parliament.document_versions(id) on delete set null,
  actual_outcome text,
  vote_type text,
  vote_result jsonb not null default '{}'::jsonb,
  named_vote_available boolean not null default false,
  ranking_eligible boolean not null default false,
  preferred_vote_option text check (preferred_vote_option in ('YES', 'NO', 'ABSTENTION', 'NO_SCORE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (case_id, external_decision_id)
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'source_documents_case_external_document_key'
      and conrelid = 'parliament.source_documents'::regclass
  ) then
    alter table parliament.source_documents
      add constraint source_documents_case_external_document_key unique (case_id, external_document_id);
  end if;
end $$;

create table if not exists parliament.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_version_id uuid not null references parliament.document_versions(id) on delete cascade,
  chunk_key text not null,
  heading_path text not null default '',
  page_or_location text,
  normalized_text text not null,
  content_hash text not null,
  created_at timestamptz not null default now(),
  unique (document_version_id, chunk_key),
  unique (document_version_id, content_hash)
);

create table if not exists parliament.decision_fact_packages (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references parliament.cases(id) on delete cascade,
  decision_unit_id uuid references parliament.decision_units(id) on delete cascade,
  package_version integer not null,
  fact_package jsonb not null,
  source_snapshot jsonb not null,
  completeness_status text not null check (completeness_status in ('INCOMPLETE', 'READY_FOR_REVIEW', 'DATA_GAP')),
  content_hash text not null,
  created_at timestamptz not null default now(),
  unique (case_id, decision_unit_id, package_version),
  unique (content_hash)
);

create table if not exists parliament.import_runs (
  id uuid primary key default gen_random_uuid(),
  adapter_name text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  parameters jsonb not null default '{}'::jsonb,
  source_count integer not null default 0,
  created_count integer not null default 0,
  updated_count integer not null default 0,
  skipped_count integer not null default 0,
  status text not null check (status in ('RUNNING', 'SUCCEEDED', 'PARTIAL', 'FAILED')),
  error_summary text
);

create table if not exists parliament.materiality_assessments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references parliament.cases(id) on delete cascade,
  engine_version text not null,
  result text not null check (result in ('NOT_SELECTED_FOR_FULL_IMPACT_REVIEW', 'SELECTED_FOR_FULL_IMPACT_REVIEW', 'MATERIALITY_REVIEW_REQUIRED')),
  reasons jsonb not null,
  created_at timestamptz not null default now(),
  unique (case_id, engine_version)
);

create table if not exists parliament.review_batches (
  id uuid primary key default gen_random_uuid(),
  batch_code text not null unique,
  review_type text not null check (review_type in ('FULL_REVIEW', 'INCREMENTAL_REVIEW', 'EXCEPTION_REVIEW')),
  status text not null check (status in ('PREPARING', 'READY', 'EXPORTED', 'RESULT_RECEIVED', 'VALIDATED', 'PARTIALLY_ACCEPTED', 'REJECTED')),
  package_schema_version text not null,
  package_hash text,
  storage_key text,
  source_reference_snapshot jsonb not null default '{}'::jsonb,
  created_by text not null,
  created_at timestamptz not null default now(),
  exported_at timestamptz,
  imported_at timestamptz
);

create table if not exists parliament.review_batch_cases (
  review_batch_id uuid not null references parliament.review_batches(id) on delete cascade,
  case_id uuid not null references parliament.cases(id) on delete cascade,
  decision_fact_package_id uuid references parliament.decision_fact_packages(id) on delete set null,
  review_request jsonb not null,
  package_payload jsonb not null,
  package_hash text not null,
  primary key (review_batch_id, case_id)
);

create table if not exists parliament.external_review_results (
  id uuid primary key default gen_random_uuid(),
  review_batch_id uuid not null references parliament.review_batches(id) on delete cascade,
  case_id uuid not null references parliament.cases(id) on delete cascade,
  review_id text not null,
  review_type text not null check (review_type in ('FULL_REVIEW', 'INCREMENTAL_REVIEW', 'EXCEPTION_REVIEW')),
  input_package_hash text not null,
  reference_snapshot jsonb not null,
  result_payload jsonb not null,
  result_hash text not null,
  import_status text not null check (import_status in ('REVIEW_PROPOSAL', 'VALIDATED', 'SOURCE_CONFLICT', 'SCHEMA_INVALID', 'REJECTED', 'ACCEPTED')),
  validation_errors jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  imported_at timestamptz not null default now(),
  unique (review_batch_id, case_id, review_id),
  unique (result_hash)
);

create table if not exists parliament.editorial_tasks (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references parliament.cases(id) on delete cascade,
  decision_unit_id uuid references parliament.decision_units(id) on delete cascade,
  task_type text not null,
  question text not null,
  reason_manual text not null,
  priority text not null check (priority in ('BLOCKING', 'HIGH', 'NORMAL', 'OPTIONAL')),
  blocking boolean not null default false,
  context_refs jsonb not null default '[]'::jsonb,
  candidate_options jsonb not null default '[]'::jsonb,
  dependency_ids jsonb not null default '[]'::jsonb,
  status text not null check (status in ('OPEN', 'IN_PROGRESS', 'WAITING_EVIDENCE', 'RESOLVED', 'SUPERSEDED', 'CANCELLED')),
  assigned_to uuid,
  due_by timestamptz,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists parliament.notification_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  aggregate_type text not null,
  aggregate_id uuid,
  safe_payload jsonb not null,
  status text not null check (status in ('PENDING', 'DELIVERED', 'FAILED', 'SKIPPED')),
  delivered_at timestamptz,
  error_summary text,
  created_at timestamptz not null default now()
);

create index if not exists cases_review_status_idx on parliament.cases (review_status, decision_date desc);
create index if not exists source_documents_case_id_idx on parliament.source_documents (case_id);
create index if not exists document_chunks_version_id_idx on parliament.document_chunks (document_version_id);
create index if not exists decision_fact_packages_case_id_idx on parliament.decision_fact_packages (case_id, created_at desc);
create index if not exists materiality_assessments_case_id_idx on parliament.materiality_assessments (case_id, created_at desc);
create index if not exists review_batch_cases_case_id_idx on parliament.review_batch_cases (case_id);
create index if not exists external_review_results_case_id_idx on parliament.external_review_results (case_id, imported_at desc);
create index if not exists editorial_tasks_queue_idx on parliament.editorial_tasks (status, priority, due_by);

alter table parliament.decision_units enable row level security;
alter table parliament.document_chunks enable row level security;
alter table parliament.decision_fact_packages enable row level security;
alter table parliament.import_runs enable row level security;
alter table parliament.materiality_assessments enable row level security;
alter table parliament.review_batches enable row level security;
alter table parliament.review_batch_cases enable row level security;
alter table parliament.external_review_results enable row level security;
alter table parliament.editorial_tasks enable row level security;
alter table parliament.notification_events enable row level security;

-- No public policies belong to protected raw, review or audit data. Publication
-- must be performed through a separately reviewed public read model.
