-- Historical Backfill — current Federal Government
--
-- 21st legislative term began 2025-03-25. The WÖk historical balance begins
-- separately at the Federal Government's start on 2025-05-06. Neither date is
-- a political evaluation and they must never be used interchangeably.

create type public.historical_registry_selection_status as enum (
  'PENDING_SCREEN',
  'FULL_IMPACT_REVIEW',
  'NOT_SELECTED_FOR_FULL_IMPACT_REVIEW',
  'DATA_GAP',
  'NOT_YET_ASSESSABLE',
  'READY_FOR_PUBLICATION',
  'PUBLISHED'
);
create type public.historical_materiality_status as enum (
  'UNSCREENED', 'POTENTIAL_MATERIAL', 'MATERIAL', 'NOT_MATERIAL', 'EVIDENCE_OPEN'
);

create table public.government_terms (
  id uuid primary key default gen_random_uuid(),
  term_key text not null unique,
  jurisdiction text not null,
  parliament_id text references public.parliaments(id) on delete set null,
  label text not null,
  legislative_term_start date not null,
  government_term_start date not null,
  historical_woek_backfill_start date not null,
  government_term_end date,
  official_source_url text not null,
  source_snapshot text not null,
  created_at timestamptz not null default now(),
  check (government_term_start >= legislative_term_start),
  check (historical_woek_backfill_start >= government_term_start),
  check (government_term_end is null or government_term_end >= government_term_start)
);

insert into public.government_terms (
  term_key, jurisdiction, parliament_id, label, legislative_term_start,
  government_term_start, historical_woek_backfill_start, official_source_url,
  source_snapshot
) values (
  'DE_BUND_2025_05_06', 'DE', 'bundestag', 'Laufende Bundesregierung seit 6. Mai 2025',
  '2025-03-25', '2025-05-06', '2025-05-06',
  'https://www.bundestag.de/dokumente/textarchiv/2025/kw19-de-kanzlerwahl-1062470',
  'Bundestag: Bundeskanzlerwahl, Ernennung und Vereidigung am 2025-05-06; konstituierende Sitzung der 21. Wahlperiode am 2025-03-25.'
) on conflict (term_key) do nothing;

alter table public.parliamentary_cases
  add column government_term_id uuid references public.government_terms(id) on delete set null;
create index parliamentary_cases_government_term_idx on public.parliamentary_cases (government_term_id, decision_date);

-- Terminological time axes stay separate in the stored case, even when both
-- happen to be supplied by one import run.
create or replace function public.assign_government_term_to_case()
returns trigger language plpgsql
set search_path = public
as $$
declare v_effective_date date;
begin
  v_effective_date := coalesce(new.decision_date, new.last_activity_on, new.next_confirmed_event_on);
  if v_effective_date is null then return new; end if;
  select id into new.government_term_id
  from public.government_terms
  where jurisdiction = new.jurisdiction
    and government_term_start <= v_effective_date
    and (government_term_end is null or government_term_end >= v_effective_date)
  order by government_term_start desc
  limit 1;
  return new;
end;
$$;
create trigger parliamentary_cases_assign_government_term
before insert or update of decision_date, last_activity_on, next_confirmed_event_on, jurisdiction
on public.parliamentary_cases
for each row execute function public.assign_government_term_to_case();

update public.parliamentary_cases as parliamentary_case
set government_term_id = government_term.id
from public.government_terms as government_term
where government_term.jurisdiction = parliamentary_case.jurisdiction
  and coalesce(parliamentary_case.decision_date, parliamentary_case.last_activity_on, parliamentary_case.next_confirmed_event_on) >= government_term.government_term_start
  and (government_term.government_term_end is null or coalesce(parliamentary_case.decision_date, parliamentary_case.last_activity_on, parliamentary_case.next_confirmed_event_on) <= government_term.government_term_end)
  and parliamentary_case.government_term_id is null;

create table public.historical_decision_registry (
  id uuid primary key default gen_random_uuid(),
  registry_key text not null unique,
  government_term_id uuid not null references public.government_terms(id) on delete restrict,
  parliamentary_case_id uuid not null references public.parliamentary_cases(id) on delete cascade,
  decision_unit_id uuid references public.decision_units(id) on delete set null,
  decision_date date not null,
  parliamentary_stage text,
  final_decision_text text,
  analysed_document_version_id uuid references public.document_versions(id) on delete set null,
  proposer jsonb not null default '[]'::jsonb,
  decision_type text,
  vote_type text,
  vote_result jsonb not null default '{}'::jsonb,
  adopted_or_rejected text check (adopted_or_rejected in ('ADOPTED', 'REJECTED', 'AMENDED', 'DEFERRED', 'UNKNOWN')),
  official_objective text,
  materiality_assessment public.historical_materiality_status not null default 'UNSCREENED',
  selection_status public.historical_registry_selection_status not null default 'PENDING_SCREEN',
  selection_reason text,
  source_snapshot jsonb not null default '{}'::jsonb,
  named_vote_source_url text,
  individual_votes_available boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (parliamentary_case_id, decision_unit_id),
  check (jsonb_typeof(proposer) = 'array'),
  check (jsonb_typeof(vote_result) = 'object'),
  check (jsonb_typeof(source_snapshot) = 'object'),
  check (not individual_votes_available or named_vote_source_url is not null),
  check (selection_status <> 'NOT_SELECTED_FOR_FULL_IMPACT_REVIEW' or selection_reason is not null)
);
create index historical_decision_registry_dashboard_idx
  on public.historical_decision_registry (government_term_id, selection_status, materiality_assessment, decision_date desc);

-- A registry entry is created deterministically for every screened decision
-- inside the selected government term. It is a complete decision register, not
-- a claim that every case has already received a full WÖk assessment.
create or replace function public.register_historical_screened_case()
returns trigger language plpgsql
security invoker
set search_path = public
as $$
declare
  v_case public.parliamentary_cases;
  v_term public.government_terms;
  v_decision_unit_id uuid;
  v_document_version_id uuid;
begin
  select * into v_case from public.parliamentary_cases where id = new.parliamentary_case_id;
  if not found or v_case.decision_date is null or v_case.government_term_id is null then return new; end if;
  select * into v_term from public.government_terms where id = v_case.government_term_id;
  if not found or v_case.decision_date < v_term.historical_woek_backfill_start then return new; end if;
  select id into v_decision_unit_id from public.decision_units where parliamentary_case_id = v_case.id order by created_at limit 1;
  select id into v_document_version_id from public.document_versions where parliamentary_case_id = v_case.id order by is_final_voting_version desc, created_at desc limit 1;

  insert into public.historical_decision_registry (
    registry_key, government_term_id, parliamentary_case_id, decision_unit_id,
    decision_date, parliamentary_stage, analysed_document_version_id,
    decision_type, official_objective, source_snapshot
  ) values (
    'historical-case:' || v_case.id::text,
    v_term.id, v_case.id, v_decision_unit_id, v_case.decision_date,
    'IMPORTED_DECISION_REQUIRES_SOURCE_CONFIRMATION', v_document_version_id,
    v_case.case_kind::text, null,
    jsonb_build_object('external_system', v_case.external_system, 'external_id', v_case.external_id, 'imported_at', now())
  ) on conflict (registry_key) do update set
    decision_date = excluded.decision_date,
    analysed_document_version_id = coalesce(excluded.analysed_document_version_id, public.historical_decision_registry.analysed_document_version_id),
    source_snapshot = excluded.source_snapshot,
    updated_at = now();
  return new;
end;
$$;
create trigger case_screenings_register_historical_case
after insert on public.case_screenings
for each row execute function public.register_historical_screened_case();

create or replace function public.touch_historical_decision_registry()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end;
$$;
create trigger historical_decision_registry_touch
before update on public.historical_decision_registry
for each row execute function public.touch_historical_decision_registry();

alter table public.government_terms enable row level security;
alter table public.historical_decision_registry enable row level security;
create policy "editorial members read government terms"
  on public.government_terms for select to authenticated using (public.is_editorial_member());
create policy "editorial members read historical registry"
  on public.historical_decision_registry for select to authenticated using (public.is_editorial_member());
