-- Parlament-Datenmodell: Vorgang und DecisionUnit sind absichtlich getrennt.
-- Öffentliche Inhalte werden nur nach serverseitigem Editorial-Workflow lesbar.
create type public.parliament_case_kind as enum ('RADAR', 'IMPACT_BRIEF', 'FULL_CHECK', 'RETROSPECTIVE_CASE');
create type public.parliament_case_status as enum ('IMPORTING', 'DRAFT', 'FACT_CHECK', 'METHOD_REVIEW', 'RED_TEAM', 'APPROVED', 'PUBLISHED', 'ARCHIVED');
create type public.knowledge_time_side as enum ('AS_KNOWN_ON_DECISION', 'POST_DECISION');
create type public.impact_change as enum ('NO', 'MINOR', 'MATERIAL', 'VERDICT_REVIEW');

create table public.parliaments (
  id text primary key,
  jurisdiction text not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.parliamentary_cases (
  id uuid primary key default gen_random_uuid(),
  parliament_id text not null references public.parliaments(id),
  jurisdiction text not null,
  legislative_term text not null,
  external_system text not null default 'DIP',
  external_id text not null,
  case_kind public.parliament_case_kind not null,
  workflow_status public.parliament_case_status not null default 'IMPORTING',
  decision_date date,
  title text not null,
  original_title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (external_system, external_id)
);

create table public.decision_units (
  id uuid primary key default gen_random_uuid(),
  parliamentary_case_id uuid not null references public.parliamentary_cases(id) on delete cascade,
  stable_key text not null,
  title text not null,
  materiality_status text not null default 'UNREVIEWED',
  created_at timestamptz not null default now(),
  unique (parliamentary_case_id, stable_key)
);

create table public.source_documents (
  id uuid primary key default gen_random_uuid(),
  external_url text not null unique,
  publisher text not null,
  source_published_on date not null,
  content_sha256 text,
  retrieved_at timestamptz not null default now(),
  untrusted_input boolean not null default true
);

create table public.document_versions (
  id uuid primary key default gen_random_uuid(),
  parliamentary_case_id uuid not null references public.parliamentary_cases(id) on delete cascade,
  source_document_id uuid not null references public.source_documents(id),
  version_label text not null,
  is_final_voting_version boolean not null default false,
  impact_change public.impact_change not null default 'NO',
  change_rationale_url text,
  created_at timestamptz not null default now(),
  unique (parliamentary_case_id, version_label)
);

create table public.case_knowledge_entries (
  id uuid primary key default gen_random_uuid(),
  parliamentary_case_id uuid not null references public.parliamentary_cases(id) on delete cascade,
  source_document_id uuid not null references public.source_documents(id),
  time_side public.knowledge_time_side not null,
  evidence_text text not null,
  created_at timestamptz not null default now(),
  unique (parliamentary_case_id, source_document_id, time_side)
);

-- A retrospective case may never place a source on the wrong side of its decision date.
create or replace function public.enforce_hindsight_boundary() returns trigger language plpgsql as $$
declare case_date date; source_date date; case_kind public.parliament_case_kind;
begin
  select decision_date, case_kind into case_date, case_kind from public.parliamentary_cases where id = new.parliamentary_case_id;
  select source_published_on into source_date from public.source_documents where id = new.source_document_id;
  if case_kind <> 'RETROSPECTIVE_CASE' then return new; end if;
  if case_date is null then raise exception 'RETROSPECTIVE_DECISION_DATE_REQUIRED'; end if;
  if new.time_side = 'AS_KNOWN_ON_DECISION' and source_date > case_date then raise exception 'HINDSIGHT_BOUNDARY_VIOLATION'; end if;
  if new.time_side = 'POST_DECISION' and source_date <= case_date then raise exception 'POST_DECISION_SOURCE_REQUIRED'; end if;
  return new;
end $$;
create trigger hindsight_boundary before insert or update on public.case_knowledge_entries for each row execute function public.enforce_hindsight_boundary();

alter table public.parliaments enable row level security;
alter table public.parliamentary_cases enable row level security;
alter table public.decision_units enable row level security;
alter table public.source_documents enable row level security;
alter table public.document_versions enable row level security;
alter table public.case_knowledge_entries enable row level security;

-- Public clients can never read drafts. Editorial role policies are installed with the authenticated workbench.
create policy "published cases are publicly readable" on public.parliamentary_cases for select using (workflow_status = 'PUBLISHED');
