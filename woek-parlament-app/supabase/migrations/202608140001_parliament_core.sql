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
  last_activity_on date,
  next_confirmed_event_on date,
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
  raw_payload jsonb,
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

-- Every automated import and screening is traceable.  A screening creates a
-- review task; it is deliberately not a political recommendation or verdict.
create table public.import_runs (
  id uuid primary key default gen_random_uuid(),
  source_system text not null default 'DIP',
  scope text not null check (scope in ('BOOTSTRAP', 'LOOKAHEAD', 'BOTH')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null check (status in ('RUNNING', 'SUCCEEDED', 'FAILED')),
  imported_count integer not null default 0,
  skipped_count integer not null default 0,
  error_code text,
  metadata jsonb not null default '{}'::jsonb
);

create table public.case_screenings (
  id uuid primary key default gen_random_uuid(),
  parliamentary_case_id uuid not null references public.parliamentary_cases(id) on delete cascade,
  screening_key text not null,
  method_version text not null,
  screening_status text not null check (screening_status in ('REVIEW_REQUIRED', 'SOURCE_REQUIRED', 'CLEARED_FOR_EDITORIAL_REVIEW')),
  criteria jsonb not null,
  evidence_gaps jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (parliamentary_case_id, screening_key)
);

-- The service role calls this one function for a whole DIP batch.  It never
-- changes a workflow status: automated ingestion must not overwrite editorial
-- work or publish a case.
create or replace function public.ingest_dip_snapshot(p_candidates jsonb)
returns table (case_id uuid, external_id text)
language plpgsql
security invoker
set search_path = public
as $$
declare
  candidate jsonb;
  v_case_id uuid;
  v_source_id uuid;
  v_external_id text;
  v_case_kind public.parliament_case_kind;
begin
  if jsonb_typeof(p_candidates) <> 'array' then
    raise exception 'DIP_CANDIDATES_MUST_BE_ARRAY';
  end if;

  insert into public.parliaments (id, jurisdiction, name)
  values ('bundestag', 'DE', 'Deutscher Bundestag')
  on conflict (id) do nothing;

  for candidate in select value from jsonb_array_elements(p_candidates)
  loop
    v_external_id := candidate->>'external_id';
    v_case_kind := (candidate->>'case_kind')::public.parliament_case_kind;
    if v_external_id is null or candidate->>'title' is null then
      raise exception 'DIP_CANDIDATE_MISSING_REQUIRED_FIELD';
    end if;

    insert into public.parliamentary_cases (
      parliament_id, jurisdiction, legislative_term, external_system, external_id,
      case_kind, workflow_status, decision_date, last_activity_on,
      next_confirmed_event_on, title, original_title
    ) values (
      'bundestag', 'DE', coalesce(candidate->>'legislative_term', '21'), 'DIP', v_external_id,
      v_case_kind, 'DRAFT', nullif(candidate->>'decision_date', '')::date,
      nullif(candidate->>'last_activity_on', '')::date,
      nullif(candidate->>'next_confirmed_event_on', '')::date,
      candidate->>'title', candidate->>'original_title'
    )
    on conflict (external_system, external_id) do update set
      title = excluded.title,
      original_title = excluded.original_title,
      case_kind = case
        when public.parliamentary_cases.workflow_status in ('FACT_CHECK', 'METHOD_REVIEW', 'RED_TEAM', 'APPROVED', 'PUBLISHED')
          then public.parliamentary_cases.case_kind
        else excluded.case_kind
      end,
      decision_date = coalesce(public.parliamentary_cases.decision_date, excluded.decision_date),
      last_activity_on = case
        when excluded.last_activity_on is null then public.parliamentary_cases.last_activity_on
        when public.parliamentary_cases.last_activity_on is null then excluded.last_activity_on
        else greatest(public.parliamentary_cases.last_activity_on, excluded.last_activity_on)
      end,
      next_confirmed_event_on = case
        when excluded.next_confirmed_event_on is null then public.parliamentary_cases.next_confirmed_event_on
        when public.parliamentary_cases.next_confirmed_event_on is null then excluded.next_confirmed_event_on
        when public.parliamentary_cases.next_confirmed_event_on < current_date then excluded.next_confirmed_event_on
        else least(public.parliamentary_cases.next_confirmed_event_on, excluded.next_confirmed_event_on)
      end,
      updated_at = now()
    returning id into v_case_id;

    insert into public.source_documents (
      external_url, publisher, source_published_on, content_sha256, raw_payload, retrieved_at, untrusted_input
    ) values (
      candidate->>'source_url', 'Deutscher Bundestag/Bundesrat – DIP',
      (candidate->>'source_published_on')::date, candidate->>'content_sha256',
      candidate->'raw_payload', now(), true
    )
    on conflict (external_url) do update set
      source_published_on = excluded.source_published_on,
      content_sha256 = excluded.content_sha256,
      raw_payload = excluded.raw_payload,
      retrieved_at = excluded.retrieved_at
    returning id into v_source_id;

    insert into public.decision_units (parliamentary_case_id, stable_key, title, materiality_status)
    values (v_case_id, candidate->>'decision_unit_key', candidate->>'decision_unit_title', 'SCREENING_REQUIRED')
    on conflict (parliamentary_case_id, stable_key) do update set
      title = excluded.title,
      materiality_status = case
        when public.decision_units.materiality_status = 'UNREVIEWED' then excluded.materiality_status
        else public.decision_units.materiality_status
      end;

    insert into public.document_versions (
      parliamentary_case_id, source_document_id, version_label, is_final_voting_version, impact_change, change_rationale_url
    ) values (
      v_case_id, v_source_id, candidate->>'version_label',
      coalesce((candidate->>'is_final_voting_version')::boolean, false), 'NO', candidate->>'source_url'
    )
    on conflict (parliamentary_case_id, version_label) do update set
      source_document_id = excluded.source_document_id,
      is_final_voting_version = excluded.is_final_voting_version,
      change_rationale_url = excluded.change_rationale_url;

    insert into public.case_screenings (
      parliamentary_case_id, screening_key, method_version, screening_status, criteria, evidence_gaps, updated_at
    ) values (
      v_case_id, candidate->>'screening_key', 'parliament-screening-v0.1',
      'SOURCE_REQUIRED', candidate->'screening_criteria', candidate->'evidence_gaps', now()
    )
    on conflict (parliamentary_case_id, screening_key) do update set
      criteria = excluded.criteria,
      evidence_gaps = excluded.evidence_gaps,
      updated_at = excluded.updated_at;

    case_id := v_case_id;
    external_id := v_external_id;
    return next;
  end loop;
end;
$$;

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
alter table public.import_runs enable row level security;
alter table public.case_screenings enable row level security;

-- Public clients can never read drafts. Editorial role policies are installed with the authenticated workbench.
create policy "published cases are publicly readable" on public.parliamentary_cases for select using (workflow_status = 'PUBLISHED');

revoke all on function public.ingest_dip_snapshot(jsonb) from public, anon, authenticated;
grant execute on function public.ingest_dip_snapshot(jsonb) to service_role;
