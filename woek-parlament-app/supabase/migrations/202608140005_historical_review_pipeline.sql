-- Historical Backfill → external WÖk review pipeline
--
-- This migration stores a small, reproducible hand-off between the official
-- decision registry and an external, structured review. It deliberately does
-- not create a path from an imported review to a public case. Imported material
-- remains a proposal and is converted into source-aware editorial tasks.

create type public.historical_review_batch_status as enum (
  'DRAFT',
  'READY_FOR_EXPORT',
  'EXPORTED',
  'REVIEW_IMPORT_PENDING',
  'REVIEW_IMPORTED',
  'VALIDATION_FAILED',
  'TASKS_GENERATED',
  'SUPERSEDED'
);

create type public.historical_review_package_status as enum (
  'NOT_READY',
  'SOURCE_INCOMPLETE',
  'READY',
  'EXPORTED',
  'REVIEW_RECEIVED',
  'PROPOSAL_STAGED',
  'TASKS_GENERATED',
  'SUPERSEDED'
);

create type public.historical_review_import_status as enum (
  'CHATGPT_REVIEW_PROPOSAL',
  'VALIDATED',
  'SOURCE_REFERENCE_INVALID',
  'SNAPSHOT_MISMATCH',
  'CASE_MISMATCH',
  'SCHEMA_INVALID',
  'REJECTED',
  'APPLIED_TO_TASKS'
);

create type public.case_relation_type as enum (
  'RELATED_CASE',
  'SAME_POLICY_DOMAIN',
  'AMENDS_PREVIOUS_CASE',
  'IMPLEMENTS_PREVIOUS_CASE',
  'REVERSES_PREVIOUS_CASE',
  'FINANCIAL_DEPENDENCY',
  'CAUSAL_DEPENDENCY'
);

alter table public.historical_decision_registry
  add column review_package_status public.historical_review_package_status not null default 'NOT_READY',
  add column review_package_checked_at timestamptz,
  add column review_import_status public.historical_review_import_status,
  add column review_imported_at timestamptz;

create index historical_decision_registry_review_pipeline_idx
  on public.historical_decision_registry (
    government_term_id, materiality_assessment, selection_status,
    review_package_status, decision_date desc
  );

-- A batch stores only its selection, immutable package manifest and method
-- snapshot. Source document copies remain outside this table, in the official
-- source system or closed storage; package ZIPs contain source links/snippets
-- only and are generated on demand.
create table public.historical_review_batches (
  id uuid primary key default gen_random_uuid(),
  batch_key text not null unique,
  government_term_id uuid not null references public.government_terms(id) on delete restrict,
  status public.historical_review_batch_status not null default 'DRAFT',
  selection_criteria jsonb not null default '{}'::jsonb,
  woek_reference_snapshot text not null,
  method_version text not null,
  batch_size integer not null check (batch_size between 1 and 15),
  export_count integer not null default 0 check (export_count >= 0),
  last_exported_at timestamptz,
  created_by uuid references public.editorial_members(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(selection_criteria) = 'object')
);

create table public.historical_review_batch_cases (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.historical_review_batches(id) on delete cascade,
  historical_decision_registry_id uuid not null references public.historical_decision_registry(id) on delete restrict,
  position integer not null check (position > 0),
  review_package_status public.historical_review_package_status not null default 'NOT_READY',
  package_manifest jsonb not null default '{}'::jsonb,
  package_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (batch_id, position),
  unique (batch_id, historical_decision_registry_id),
  check (jsonb_typeof(package_manifest) = 'object')
);

create index historical_review_batch_cases_registry_idx
  on public.historical_review_batch_cases (historical_decision_registry_id, review_package_status);

-- Results are immutable proposals. Validation output is retained even when the
-- proposal is rejected, so the review and its source/snapshot checks are
-- auditable without treating it as an approved analysis.
create table public.historical_review_imports (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references public.historical_review_batches(id) on delete set null,
  historical_decision_registry_id uuid not null references public.historical_decision_registry(id) on delete cascade,
  parliamentary_case_id uuid not null references public.parliamentary_cases(id) on delete cascade,
  status public.historical_review_import_status not null default 'CHATGPT_REVIEW_PROPOSAL',
  proposal_status public.historical_review_import_status not null default 'CHATGPT_REVIEW_PROPOSAL'
    check (proposal_status = 'CHATGPT_REVIEW_PROPOSAL'),
  review_system text not null,
  reference_snapshot text,
  package_hash text,
  proposed_result jsonb not null,
  validation_messages jsonb not null default '[]'::jsonb,
  imported_by uuid references public.editorial_members(user_id) on delete set null,
  imported_at timestamptz not null default now(),
  validated_at timestamptz,
  task_generation_at timestamptz,
  result_hash text not null,
  check (jsonb_typeof(proposed_result) = 'object'),
  check (jsonb_typeof(validation_messages) = 'array')
);

create index historical_review_imports_case_idx
  on public.historical_review_imports (parliamentary_case_id, status, imported_at desc);

create table public.case_relations (
  id uuid primary key default gen_random_uuid(),
  from_parliamentary_case_id uuid not null references public.parliamentary_cases(id) on delete cascade,
  to_parliamentary_case_id uuid not null references public.parliamentary_cases(id) on delete cascade,
  relation_type public.case_relation_type not null,
  note text,
  source_refs jsonb not null default '[]'::jsonb,
  created_from_review_import_id uuid references public.historical_review_imports(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (from_parliamentary_case_id, to_parliamentary_case_id, relation_type),
  check (from_parliamentary_case_id <> to_parliamentary_case_id),
  check (jsonb_typeof(source_refs) = 'array')
);

-- A minimal, closed outbox is intentionally distinct from transport. A later
-- notification adapter may read it, but no Discord URL or personal data is
-- stored here and no network request is made from a database trigger.
create table public.editorial_notification_outbox (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  event_type text not null check (event_type in ('HISTORICAL_REVIEW_TASKS_READY', 'HISTORICAL_REVIEW_VALIDATION_FAILED')),
  parliamentary_case_id uuid references public.parliamentary_cases(id) on delete cascade,
  historical_review_import_id uuid references public.historical_review_imports(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  delivery_status text not null default 'PENDING' check (delivery_status in ('PENDING', 'DELIVERED', 'DISABLED', 'FAILED')),
  created_at timestamptz not null default now(),
  delivered_at timestamptz,
  check (jsonb_typeof(payload) = 'object')
);

create index editorial_notification_outbox_delivery_idx
  on public.editorial_notification_outbox (delivery_status, created_at);

create or replace function public.touch_historical_review_pipeline()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end;
$$;

create trigger historical_review_batches_touch
before update on public.historical_review_batches
for each row execute function public.touch_historical_review_pipeline();

create trigger historical_review_batch_cases_touch
before update on public.historical_review_batch_cases
for each row execute function public.touch_historical_review_pipeline();

alter table public.historical_review_batches enable row level security;
alter table public.historical_review_batch_cases enable row level security;
alter table public.historical_review_imports enable row level security;
alter table public.case_relations enable row level security;
alter table public.editorial_notification_outbox enable row level security;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'historical_review_batches', 'historical_review_batch_cases',
    'historical_review_imports', 'case_relations', 'editorial_notification_outbox'
  ] loop
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.is_editorial_member())',
      'editorial members read ' || table_name, table_name
    );
  end loop;
end;
$$;
