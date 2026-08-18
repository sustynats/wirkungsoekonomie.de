create schema if not exists parliament;

create table if not exists parliament.parliaments (
  id text primary key,
  jurisdiction text not null,
  country text not null,
  language text not null,
  legislative_term text not null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists parliament.cases (
  id uuid primary key default gen_random_uuid(),
  parliament_id text not null references parliament.parliaments(id),
  external_case_id text,
  slug text not null unique,
  title text not null,
  kind text not null check (kind in ('RADAR', 'IMPACT_BRIEF', 'FULL_CHECK', 'RETROSPECTIVE_CASE')),
  source_status text not null default 'STATUS_UNVERIFIED',
  publication_status text not null default 'DRAFT',
  current_stage text,
  materiality text check (materiality in ('VERY_HIGH', 'HIGH', 'MEDIUM', 'WATCH')),
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (parliament_id, external_case_id)
);

create table if not exists parliament.source_documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references parliament.cases(id) on delete cascade,
  external_document_id text,
  document_type text not null,
  source_url text not null,
  source_attribution text not null,
  document_date date,
  retrieved_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists parliament.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references parliament.source_documents(id) on delete cascade,
  source_hash text not null,
  source_url text not null,
  retrieved_at timestamptz not null,
  document_date date,
  impact_change_status text not null default 'VERDICT_REVIEW_REQUIRED' check (impact_change_status in ('NO_IMPACT_CHANGE', 'MINOR_IMPACT_CHANGE', 'MATERIAL_IMPACT_CHANGE', 'VERDICT_REVIEW_REQUIRED')),
  created_at timestamptz not null default now(),
  unique (document_id, source_hash)
);

create table if not exists parliament.publication_versions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references parliament.cases(id) on delete cascade,
  version_number integer not null,
  public_summary text not null,
  published_at timestamptz,
  approved_by_first uuid,
  approved_by_second uuid,
  created_at timestamptz not null default now(),
  unique (case_id, version_number),
  check ((published_at is null) or (approved_by_first is not null and approved_by_second is not null and approved_by_first <> approved_by_second))
);

alter table parliament.parliaments enable row level security;
alter table parliament.cases enable row level security;
alter table parliament.source_documents enable row level security;
alter table parliament.document_versions enable row level security;
alter table parliament.publication_versions enable row level security;

-- Public access will be granted only through a reviewed publication view in a later migration.
