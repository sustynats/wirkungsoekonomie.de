-- The protected import tables keep every source needed during editorial work.
-- This separate projection is an explicit publication gate: a public source
-- never appears merely because it was fetched or cited in a draft case.
create table if not exists parliament.public_source_registry (
  id uuid primary key default gen_random_uuid(),
  source_document_id uuid references parliament.source_documents(id) on delete set null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  institution text not null,
  source_category text not null check (source_category in (
    'PARLIAMENTARY_RECORD',
    'GOVERNMENT_RECORD',
    'OFFICIAL_STATISTICS',
    'OFFICIAL_EVALUATION',
    'SCIENTIFIC_SOURCE',
    'WOEK_METHOD_REFERENCE',
    'OTHER_PRIMARY_SOURCE'
  )),
  source_role text not null check (source_role in (
    'DECISION_FACT',
    'EX_ANTE_EVIDENCE',
    'EX_POST_EVIDENCE',
    'CALCULATION_INPUT',
    'NORMATIVE_REFERENCE',
    'METHODOLOGY_REFERENCE',
    'CONTEXT'
  )),
  document_type text not null,
  canonical_url text not null check (canonical_url ~ '^https://'),
  document_date date,
  retrieved_at timestamptz not null default now(),
  version_label text,
  source_hash text,
  temporal_class text not null default 'CURRENT_REFERENCE'
    check (temporal_class in ('AVAILABLE_AT_DECISION_TIME', 'PUBLISHED_AFTER_DECISION', 'CURRENT_REFERENCE')),
  abstract text,
  public_status text not null default 'DRAFT'
    check (public_status in ('DRAFT', 'PUBLISHED', 'WITHHELD')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((public_status <> 'PUBLISHED') or published_at is not null)
);

create table if not exists parliament.public_source_usages (
  id uuid primary key default gen_random_uuid(),
  public_source_id uuid not null references parliament.public_source_registry(id) on delete cascade,
  case_id uuid not null references parliament.cases(id) on delete cascade,
  source_document_id uuid references parliament.source_documents(id) on delete set null,
  source_role text not null check (source_role in (
    'DECISION_FACT',
    'EX_ANTE_EVIDENCE',
    'EX_POST_EVIDENCE',
    'CALCULATION_INPUT',
    'NORMATIVE_REFERENCE',
    'METHODOLOGY_REFERENCE',
    'CONTEXT'
  )),
  relevant_locations jsonb not null default '[]'::jsonb,
  use_note text,
  created_at timestamptz not null default now(),
  unique (public_source_id, case_id, source_role)
);

create index if not exists public_source_registry_published_idx
  on parliament.public_source_registry (public_status, source_category, document_date desc);
create index if not exists public_source_usages_source_idx
  on parliament.public_source_usages (public_source_id);
create index if not exists public_source_usages_case_idx
  on parliament.public_source_usages (case_id);

alter table parliament.public_source_registry enable row level security;
alter table parliament.public_source_usages enable row level security;
grant select, insert, update, delete on parliament.public_source_registry to service_role;
grant select, insert, update, delete on parliament.public_source_usages to service_role;

notify pgrst, 'reload schema';
