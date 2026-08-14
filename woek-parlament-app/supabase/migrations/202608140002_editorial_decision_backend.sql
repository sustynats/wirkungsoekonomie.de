-- Editorial Decision Backend
--
-- This migration adds the case-local editorial learning loop.  It deliberately
-- does not add a path from imports or AI suggestions to publication: only a
-- recorded editorial decision and the existing publication workflow may change
-- a public case.

create type public.decision_router_status as enum (
  'AUTO_RESOLVED',
  'PRECEDENT_RESOLVED',
  'AI_MICROTASK_ELIGIBLE',
  'HUMAN_REQUIRED',
  'EVIDENCE_REQUIRED',
  'METHOD_REVIEW_REQUIRED',
  'LEGAL_REVIEW_REQUIRED'
);

create type public.editorial_task_type as enum (
  'FACT_CONFLICT',
  'MATERIALITY_REVIEW',
  'DOMAIN_RELEVANCE',
  'IMPACT_PATH_LINK_REVIEW',
  'AFFECTED_GROUP_REVIEW',
  'NORMATIVE_MAPPING_REVIEW',
  'EVIDENCE_GRADE_REVIEW',
  'BOUNDARY_REVIEW',
  'COUNTERFACTUAL_REVIEW',
  'CORRECTION_TRIGGER_REVIEW',
  'RECOMMENDATION_REVIEW',
  'RED_TEAM_REVIEW',
  'PUBLICATION_APPROVAL',
  'METHOD_PATTERN_PROMOTION'
);

create type public.editorial_task_status as enum (
  'OPEN', 'IN_PROGRESS', 'WAITING_EVIDENCE', 'AI_REQUESTED',
  'RESOLVED', 'SUPERSEDED', 'CANCELLED'
);

create type public.editorial_task_priority as enum ('BLOCKING', 'HIGH', 'NORMAL', 'OPTIONAL');
create type public.resolution_pattern_scope as enum ('CASE_ONLY', 'CASE_FAMILY', 'DOMAIN_PATTERN', 'METHOD_RULE');
create type public.resolution_pattern_status as enum ('DRAFT', 'APPROVED', 'RETIRED');
create type public.method_change_request_status as enum (
  'NEW', 'REVIEWED', 'READY_FOR_CODEX', 'IN_IMPLEMENTATION',
  'TESTING', 'DEPLOYED', 'REJECTED'
);
create type public.assessment_domain_status as enum (
  'MATERIAL', 'INDIRECT', 'NOT_MATERIAL_IDENTIFIED', 'EVIDENCE_OPEN'
);
create type public.boundary_assessment_status as enum (
  'NO_BOUNDARY_CONCERN', 'POTENTIAL_BOUNDARY_CONCERN',
  'BOUNDARY_REVIEW_REQUIRED', 'BOUNDARY_BREACH_SUPPORTED'
);
create type public.recommendation_category as enum (
  'IMPACT_LOGIC_ROBUST', 'IMPACT_LOGIC_CONDITIONAL', 'PILOT_RECOMMENDED',
  'REWORK_BEFORE_DECISION', 'CURRENTLY_NOT_ROBUST', 'NO_ROBUST_RECOMMENDATION'
);
create type public.case_readiness_status as enum (
  'NOT_READY', 'ANALYSIS_INCOMPLETE', 'HUMAN_DECISIONS_OPEN', 'EVIDENCE_GAPS',
  'RED_TEAM_REQUIRED', 'READY_FOR_APPROVAL', 'APPROVED', 'PUBLISHED'
);
create type public.ai_microtask_status as enum (
  'QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'BUDGET_EXCEEDED', 'AI_UNAVAILABLE'
);
create type public.ai_usage_source as enum ('ACTUAL', 'ESTIMATED');
create type public.editorial_role as enum ('EDITOR', 'REVIEWER', 'PUBLISHER', 'ADMIN');

-- Roles are attached to Supabase Auth users.  No anonymous or ordinary
-- authenticated account acquires editorial access merely by knowing a route.
create table public.editorial_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.editorial_role not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_editorial_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.editorial_members
    where user_id = auth.uid() and active
  );
$$;

create table public.document_sections (
  id uuid primary key default gen_random_uuid(),
  document_version_id uuid not null references public.document_versions(id) on delete cascade,
  parent_section_id uuid references public.document_sections(id) on delete cascade,
  heading_path text[] not null default '{}',
  section_order integer not null,
  label text,
  location text,
  created_at timestamptz not null default now(),
  unique (document_version_id, section_order)
);

create table public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_version_id uuid not null references public.document_versions(id) on delete cascade,
  document_section_id uuid references public.document_sections(id) on delete set null,
  chunk_key text not null,
  heading_path text[] not null default '{}',
  page_or_location text,
  normalized_text text not null,
  content_sha256 text not null,
  char_start integer,
  char_end integer,
  created_at timestamptz not null default now(),
  unique (document_version_id, chunk_key),
  check (char_start is null or char_start >= 0),
  check (char_end is null or char_end >= coalesce(char_start, 0))
);

create table public.document_diffs (
  id uuid primary key default gen_random_uuid(),
  parliamentary_case_id uuid not null references public.parliamentary_cases(id) on delete cascade,
  from_document_version_id uuid not null references public.document_versions(id) on delete cascade,
  to_document_version_id uuid not null references public.document_versions(id) on delete cascade,
  diff_status public.impact_change not null default 'NO',
  summary text,
  created_at timestamptz not null default now(),
  unique (from_document_version_id, to_document_version_id),
  check (from_document_version_id <> to_document_version_id)
);

create table public.document_chunk_diffs (
  id uuid primary key default gen_random_uuid(),
  document_diff_id uuid not null references public.document_diffs(id) on delete cascade,
  from_chunk_id uuid references public.document_chunks(id) on delete set null,
  to_chunk_id uuid references public.document_chunks(id) on delete set null,
  change_kind text not null check (change_kind in ('UNCHANGED', 'ADDED', 'REMOVED', 'MODIFIED')),
  summary text,
  created_at timestamptz not null default now(),
  check (from_chunk_id is not null or to_chunk_id is not null)
);

create table public.decision_fact_packages (
  id uuid primary key default gen_random_uuid(),
  parliamentary_case_id uuid not null references public.parliamentary_cases(id) on delete cascade,
  decision_unit_id uuid references public.decision_units(id) on delete set null,
  document_version_id uuid references public.document_versions(id) on delete set null,
  package_version integer not null,
  parliamentary_status text,
  decision_object text,
  official_objective text,
  baseline text,
  affected_rules jsonb not null default '[]'::jsonb,
  financial_elements jsonb not null default '[]'::jsonb,
  implementation_actors jsonb not null default '[]'::jsonb,
  dates jsonb not null default '[]'::jsonb,
  source_document_ids jsonb not null default '[]'::jsonb,
  uncertainties jsonb not null default '[]'::jsonb,
  fact_status text not null check (fact_status in ('DRAFT', 'SOURCE_REQUIRED', 'EDITORIALLY_CONFIRMED')),
  created_by text not null default 'SYSTEM',
  created_at timestamptz not null default now(),
  unique (parliamentary_case_id, package_version)
);

create table public.impact_assessments (
  id uuid primary key default gen_random_uuid(),
  parliamentary_case_id uuid not null references public.parliamentary_cases(id) on delete cascade,
  decision_fact_package_id uuid references public.decision_fact_packages(id) on delete set null,
  method_version text not null,
  ruleset_version text not null,
  assessment_status text not null check (assessment_status in ('DRAFT', 'RECOMPUTED', 'EDITORIALLY_REVIEWED', 'SUPERSEDED')),
  provenance text not null check (provenance in ('RULE', 'PRECEDENT', 'AI_SUGGESTION', 'HUMAN', 'MIXED')),
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  superseded_at timestamptz,
  unique (parliamentary_case_id, method_version, ruleset_version, created_at)
);

create table public.impact_domain_assessments (
  id uuid primary key default gen_random_uuid(),
  impact_assessment_id uuid not null references public.impact_assessments(id) on delete cascade,
  domain_key text not null check (domain_key in (
    'HOUSING', 'HEALTH_CARE', 'EDUCATION_PARTICIPATION', 'WORK_SKILLS',
    'ECONOMY_TRANSFORMATION', 'ENERGY_GRIDS', 'MOBILITY', 'CLIMATE_RESILIENCE',
    'DIGITAL_STATE_INFRASTRUCTURE', 'STATE_ADMINISTRATION',
    'HUMAN', 'PLANET', 'DEMOCRACY'
  )),
  status public.assessment_domain_status not null default 'EVIDENCE_OPEN',
  rationale text,
  source_refs jsonb not null default '[]'::jsonb,
  resolved_by public.decision_router_status not null default 'HUMAN_REQUIRED',
  created_at timestamptz not null default now(),
  unique (impact_assessment_id, domain_key)
);

create table public.impact_paths (
  id uuid primary key default gen_random_uuid(),
  impact_assessment_id uuid not null references public.impact_assessments(id) on delete cascade,
  path_key text not null,
  title text not null,
  path_status text not null check (path_status in ('DRAFT', 'REVIEW_REQUIRED', 'APPROVED', 'SUPERSEDED')),
  provenance text not null check (provenance in ('RULE', 'PRECEDENT', 'AI_SUGGESTION', 'HUMAN', 'MIXED')),
  created_at timestamptz not null default now(),
  unique (impact_assessment_id, path_key)
);

create table public.impact_path_edges (
  id uuid primary key default gen_random_uuid(),
  impact_path_id uuid not null references public.impact_paths(id) on delete cascade,
  edge_order integer not null,
  from_label text not null,
  to_label text not null,
  evidence_status text not null check (evidence_status in ('HIGH', 'MEDIUM', 'LIMITED', 'MODEL_ASSUMPTION', 'DATA_GAP')),
  boundary_note text,
  created_at timestamptz not null default now(),
  unique (impact_path_id, edge_order)
);

create table public.impact_claims (
  id uuid primary key default gen_random_uuid(),
  parliamentary_case_id uuid not null references public.parliamentary_cases(id) on delete cascade,
  impact_assessment_id uuid references public.impact_assessments(id) on delete cascade,
  claim_key text not null,
  layer text not null check (layer in ('FACT', 'IMPACT_ANALYSIS', 'NORMATIVE_ASSESSMENT')),
  claim_text text not null,
  evidence_status text not null check (evidence_status in ('HIGH', 'MEDIUM', 'LIMITED', 'MODEL_ASSUMPTION', 'DATA_GAP')),
  claim_status text not null check (claim_status in ('DRAFT', 'REVIEW_REQUIRED', 'APPROVED', 'SUPERSEDED')),
  created_at timestamptz not null default now(),
  unique (parliamentary_case_id, claim_key)
);

create table public.impact_claim_evidence_links (
  id uuid primary key default gen_random_uuid(),
  impact_claim_id uuid not null references public.impact_claims(id) on delete cascade,
  source_document_id uuid references public.source_documents(id) on delete set null,
  document_chunk_id uuid references public.document_chunks(id) on delete set null,
  relation text not null check (relation in ('SUPPORTS', 'CONTRADICTS', 'CONTEXT', 'GAP')),
  created_at timestamptz not null default now(),
  check (source_document_id is not null or document_chunk_id is not null)
);

create table public.boundary_assessments (
  id uuid primary key default gen_random_uuid(),
  parliamentary_case_id uuid not null references public.parliamentary_cases(id) on delete cascade,
  impact_assessment_id uuid references public.impact_assessments(id) on delete cascade,
  boundary_key text not null,
  status public.boundary_assessment_status not null default 'BOUNDARY_REVIEW_REQUIRED',
  rationale text,
  source_refs jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (parliamentary_case_id, boundary_key)
);

create table public.editorial_tasks (
  id uuid primary key default gen_random_uuid(),
  parliamentary_case_id uuid not null references public.parliamentary_cases(id) on delete cascade,
  decision_unit_id uuid references public.decision_units(id) on delete set null,
  impact_assessment_id uuid references public.impact_assessments(id) on delete cascade,
  task_type public.editorial_task_type not null,
  router_status public.decision_router_status not null,
  question text not null,
  reason_manual text not null,
  priority public.editorial_task_priority not null default 'NORMAL',
  blocking boolean not null default false,
  context_refs jsonb not null default '{}'::jsonb,
  candidate_options jsonb not null default '[]'::jsonb,
  impact_preview jsonb not null default '{}'::jsonb,
  ai_eligible boolean not null default false,
  estimated_ai_tokens integer,
  dependency_ids jsonb not null default '[]'::jsonb,
  status public.editorial_task_status not null default 'OPEN',
  assigned_to uuid,
  due_by timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  check (estimated_ai_tokens is null or estimated_ai_tokens >= 0),
  check (not ai_eligible or router_status = 'AI_MICROTASK_ELIGIBLE')
);

create index editorial_tasks_inbox_idx
  on public.editorial_tasks (status, priority, due_by, created_at)
  where status in ('OPEN', 'IN_PROGRESS', 'WAITING_EVIDENCE', 'AI_REQUESTED');
create index editorial_tasks_case_idx on public.editorial_tasks (parliamentary_case_id, status);

create table public.editorial_decisions (
  id uuid primary key default gen_random_uuid(),
  editorial_task_id uuid not null references public.editorial_tasks(id) on delete cascade,
  parliamentary_case_id uuid not null references public.parliamentary_cases(id) on delete cascade,
  decision_type public.editorial_task_type not null,
  selected_value text not null,
  rationale text,
  source_refs jsonb not null default '[]'::jsonb,
  reviewer_id uuid,
  reviewer_label text not null default 'EDITORIAL',
  method_version text not null,
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  superseded_at timestamptz,
  unique (editorial_task_id, revision)
);

create table public.resolution_patterns (
  id uuid primary key default gen_random_uuid(),
  pattern_key text not null unique,
  task_type public.editorial_task_type not null,
  scope public.resolution_pattern_scope not null,
  conditions jsonb not null,
  resolution jsonb not null,
  rationale text not null,
  source_refs jsonb not null default '[]'::jsonb,
  method_version text not null,
  approved_by uuid,
  approved_at timestamptz,
  status public.resolution_pattern_status not null default 'DRAFT',
  created_at timestamptz not null default now(),
  check ((status = 'APPROVED') = (approved_at is not null))
);

create table public.method_change_requests (
  id uuid primary key default gen_random_uuid(),
  parliamentary_case_id uuid references public.parliamentary_cases(id) on delete set null,
  editorial_task_id uuid references public.editorial_tasks(id) on delete set null,
  status public.method_change_request_status not null default 'NEW',
  problem text not null,
  case_example jsonb not null,
  current_rule jsonb not null default '{}'::jsonb,
  observed_problem text not null,
  desired_behavior text not null,
  affected_components jsonb not null default '[]'::jsonb,
  candidate_regression_test jsonb not null default '{}'::jsonb,
  priority public.editorial_task_priority not null default 'NORMAL',
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.recommendation_candidates (
  id uuid primary key default gen_random_uuid(),
  parliamentary_case_id uuid not null references public.parliamentary_cases(id) on delete cascade,
  impact_assessment_id uuid references public.impact_assessments(id) on delete set null,
  category public.recommendation_category not null default 'NO_ROBUST_RECOMMENDATION',
  boundary_status public.boundary_assessment_status not null default 'BOUNDARY_REVIEW_REQUIRED',
  mechanism_fit_status text not null default 'OPEN',
  evidence_status text not null default 'OPEN',
  implementation_status text not null default 'OPEN',
  distribution_status text not null default 'OPEN',
  feedback_status text not null default 'OPEN',
  remaining_uncertainty jsonb not null default '[]'::jsonb,
  reasons jsonb not null default '[]'::jsonb,
  status text not null check (status in ('DRAFT', 'REVIEW_REQUIRED', 'APPROVED', 'SUPERSEDED')),
  created_at timestamptz not null default now()
);

create table public.red_team_reviews (
  id uuid primary key default gen_random_uuid(),
  parliamentary_case_id uuid not null references public.parliamentary_cases(id) on delete cascade,
  recommendation_candidate_id uuid not null references public.recommendation_candidates(id) on delete cascade,
  review_kind text not null check (review_kind in ('AI_SUGGESTION', 'HUMAN')),
  strongest_counterargument text,
  weakest_assumption text,
  missing_evidence_question text,
  outcome text check (outcome in ('PASS', 'REVISE', 'MORE_EVIDENCE', 'METHODOLOGY_REVIEW')),
  reviewed_by uuid,
  created_at timestamptz not null default now()
);

create table public.ai_prompt_templates (
  id uuid primary key default gen_random_uuid(),
  template_key text not null,
  version text not null,
  task_type text not null,
  output_schema jsonb not null,
  maximum_input_tokens integer not null default 1200,
  maximum_output_tokens integer not null default 300,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  unique (template_key, version),
  check (maximum_input_tokens > 0 and maximum_output_tokens > 0)
);

create table public.ai_microtasks (
  id uuid primary key default gen_random_uuid(),
  parliamentary_case_id uuid not null references public.parliamentary_cases(id) on delete cascade,
  editorial_task_id uuid references public.editorial_tasks(id) on delete set null,
  prompt_template_id uuid not null references public.ai_prompt_templates(id),
  task_type text not null,
  ai_use_reason text not null check (ai_use_reason in ('SEMANTIC_AMBIGUITY', 'CONFLICTING_EVIDENCE', 'NOVEL_IMPACT_LINK', 'DIFF_INTERPRETATION')),
  minimum_sufficient_context jsonb not null,
  input_hash text not null,
  status public.ai_microtask_status not null default 'QUEUED',
  result jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (input_hash)
);

create table public.ai_usage_ledger (
  id uuid primary key default gen_random_uuid(),
  parliamentary_case_id uuid not null references public.parliamentary_cases(id) on delete cascade,
  editorial_task_id uuid references public.editorial_tasks(id) on delete set null,
  ai_microtask_id uuid references public.ai_microtasks(id) on delete set null,
  model text not null,
  prompt_template_version text not null,
  estimated_input_tokens integer not null,
  actual_input_tokens integer,
  actual_output_tokens integer,
  cached_tokens integer,
  usage_source public.ai_usage_source not null default 'ESTIMATED',
  result_cache_hit boolean not null default false,
  created_at timestamptz not null default now(),
  check (estimated_input_tokens >= 0),
  check (actual_input_tokens is null or actual_input_tokens >= 0),
  check (actual_output_tokens is null or actual_output_tokens >= 0)
);

create table public.ai_cached_results (
  id uuid primary key default gen_random_uuid(),
  cache_key text not null unique,
  ai_microtask_id uuid not null references public.ai_microtasks(id) on delete cascade,
  source_hashes jsonb not null,
  woek_reference_snapshot text not null,
  model_version text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create table public.case_analysis_states (
  parliamentary_case_id uuid primary key references public.parliamentary_cases(id) on delete cascade,
  readiness public.case_readiness_status not null default 'NOT_READY',
  open_blocking_tasks integer not null default 0,
  open_tasks integer not null default 0,
  evidence_gaps integer not null default 0,
  last_recomputed_at timestamptz,
  ruleset_version text,
  method_version text,
  updated_at timestamptz not null default now()
);

create table public.analysis_recompute_runs (
  id uuid primary key default gen_random_uuid(),
  parliamentary_case_id uuid not null references public.parliamentary_cases(id) on delete cascade,
  trigger_kind text not null check (trigger_kind in ('IMPORT', 'EDITORIAL_DECISION', 'DOCUMENT_DIFF', 'PRECEDENT', 'METHOD_VERSION')),
  trigger_ref text,
  resolved_task_count integer not null default 0,
  new_task_count integer not null default 0,
  status text not null check (status in ('RUNNING', 'SUCCEEDED', 'FAILED')),
  error_code text,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

-- Recalculate a small, inspectable case status.  It does not calculate a
-- substantive verdict and never publishes a case.
create or replace function public.recompute_case_analysis_state(
  p_case_id uuid,
  p_trigger_kind text,
  p_trigger_ref text default null
) returns public.case_analysis_states
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_run_id uuid;
  v_open_blocking integer;
  v_open integer;
  v_evidence_gaps integer;
  v_readiness public.case_readiness_status;
  v_state public.case_analysis_states;
begin
  insert into public.analysis_recompute_runs (parliamentary_case_id, trigger_kind, trigger_ref, status)
  values (p_case_id, p_trigger_kind, p_trigger_ref, 'RUNNING')
  returning id into v_run_id;

  select
    count(*) filter (where blocking and status in ('OPEN', 'IN_PROGRESS', 'WAITING_EVIDENCE', 'AI_REQUESTED')),
    count(*) filter (where status in ('OPEN', 'IN_PROGRESS', 'WAITING_EVIDENCE', 'AI_REQUESTED')),
    count(*) filter (where router_status = 'EVIDENCE_REQUIRED' and status in ('OPEN', 'IN_PROGRESS', 'WAITING_EVIDENCE', 'AI_REQUESTED'))
  into v_open_blocking, v_open, v_evidence_gaps
  from public.editorial_tasks
  where parliamentary_case_id = p_case_id;

  if not exists (select 1 from public.decision_fact_packages where parliamentary_case_id = p_case_id and fact_status = 'EDITORIALLY_CONFIRMED') then
    v_readiness := 'NOT_READY';
  elsif v_open_blocking > 0 then
    v_readiness := 'HUMAN_DECISIONS_OPEN';
  elsif v_evidence_gaps > 0 then
    v_readiness := 'EVIDENCE_GAPS';
  elsif not exists (select 1 from public.red_team_reviews where parliamentary_case_id = p_case_id and review_kind = 'HUMAN' and outcome = 'PASS') then
    v_readiness := 'RED_TEAM_REQUIRED';
  else
    v_readiness := 'READY_FOR_APPROVAL';
  end if;

  insert into public.case_analysis_states (
    parliamentary_case_id, readiness, open_blocking_tasks, open_tasks, evidence_gaps, last_recomputed_at, updated_at
  ) values (
    p_case_id, v_readiness, coalesce(v_open_blocking, 0), coalesce(v_open, 0), coalesce(v_evidence_gaps, 0), now(), now()
  ) on conflict (parliamentary_case_id) do update set
    readiness = excluded.readiness,
    open_blocking_tasks = excluded.open_blocking_tasks,
    open_tasks = excluded.open_tasks,
    evidence_gaps = excluded.evidence_gaps,
    last_recomputed_at = excluded.last_recomputed_at,
    updated_at = now()
  returning * into v_state;

  update public.analysis_recompute_runs
  set status = 'SUCCEEDED', finished_at = now()
  where id = v_run_id;

  return v_state;
exception when others then
  update public.analysis_recompute_runs
  set status = 'FAILED', error_code = left(sqlerrm, 120), finished_at = now()
  where id = v_run_id;
  raise;
end;
$$;

-- A normal editorial decision is a versioned data operation, not a code or AI
-- interaction.  The caller supplies a reviewer identity only after server-side
-- RBAC has authenticated that person.
create or replace function public.record_editorial_decision(
  p_task_id uuid,
  p_selected_value text,
  p_rationale text,
  p_source_refs jsonb,
  p_reviewer_id uuid,
  p_reviewer_label text,
  p_method_version text
) returns public.editorial_decisions
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_task public.editorial_tasks;
  v_revision integer;
  v_decision public.editorial_decisions;
begin
  select * into v_task from public.editorial_tasks where id = p_task_id for update;
  if not found then raise exception 'EDITORIAL_TASK_NOT_FOUND'; end if;
  if v_task.status not in ('OPEN', 'IN_PROGRESS', 'AI_REQUESTED') then
    raise exception 'EDITORIAL_TASK_NOT_DECIDABLE';
  end if;
  if jsonb_typeof(p_source_refs) <> 'array' then raise exception 'EDITORIAL_SOURCE_REFS_MUST_BE_ARRAY'; end if;

  select coalesce(max(revision), 0) + 1 into v_revision from public.editorial_decisions where editorial_task_id = p_task_id;
  update public.editorial_decisions set superseded_at = now() where editorial_task_id = p_task_id and superseded_at is null;
  insert into public.editorial_decisions (
    editorial_task_id, parliamentary_case_id, decision_type, selected_value, rationale,
    source_refs, reviewer_id, reviewer_label, method_version, revision
  ) values (
    v_task.id, v_task.parliamentary_case_id, v_task.task_type, p_selected_value, nullif(trim(p_rationale), ''),
    p_source_refs, p_reviewer_id, p_reviewer_label, p_method_version, v_revision
  ) returning * into v_decision;

  update public.editorial_tasks set status = 'RESOLVED', resolved_at = now(), updated_at = now() where id = p_task_id;
  perform public.recompute_case_analysis_state(v_task.parliamentary_case_id, 'EDITORIAL_DECISION', v_decision.id::text);
  return v_decision;
end;
$$;

create or replace function public.touch_editorial_task() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;
create trigger editorial_tasks_touch before update on public.editorial_tasks for each row execute function public.touch_editorial_task();

create or replace function public.touch_method_change_request() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;
create trigger method_change_requests_touch before update on public.method_change_requests for each row execute function public.touch_method_change_request();

-- Ingestion creates one focused evidence task instead of a queue of speculative
-- impact tasks.  The deterministic engine can screen a case only after the
-- official source passage and fact package are available.
create or replace function public.create_case_intake_task() returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_case public.parliamentary_cases;
  v_priority public.editorial_task_priority;
begin
  select * into v_case from public.parliamentary_cases where id = new.parliamentary_case_id;
  if not found then return new; end if;
  v_priority := case
    when v_case.next_confirmed_event_on is not null and v_case.next_confirmed_event_on <= current_date + 14 then 'HIGH'::public.editorial_task_priority
    else 'NORMAL'::public.editorial_task_priority
  end;

  insert into public.editorial_tasks (
    parliamentary_case_id, task_type, router_status, question, reason_manual,
    priority, blocking, context_refs, candidate_options, impact_preview, ai_eligible, dependency_ids
  )
  select
    new.parliamentary_case_id,
    'FACT_CONFLICT',
    'EVIDENCE_REQUIRED',
    'Welche amtliche Originalfassung ist für die Wirkungsanalyse maßgeblich?',
    'DIP-Metadaten belegen einen Vorgang, enthalten aber noch nicht die fachlich prüfbare Originalpassage. Ohne diese Fassung werden keine Wirkpfade oder Fachvoten erzeugt.',
    v_priority,
    true,
    jsonb_build_object(
      'case_title', v_case.title,
      'screening_id', new.id,
      'screening_key', new.screening_key,
      'evidence_gaps', new.evidence_gaps
    ),
    jsonb_build_array(
      jsonb_build_object('value', 'SOURCE_ADDED', 'label', 'Amtliche Fassung hinterlegt'),
      jsonb_build_object('value', 'EVIDENCE_OPEN', 'label', 'Fassung derzeit nicht verfügbar')
    ),
    jsonb_build_object('effect', 'Erst nach bestätigter Fassung können Faktpaket, Themenfeldscreening und Wirkpfade erstellt werden.'),
    false,
    '[]'::jsonb
  where not exists (
    select 1 from public.editorial_tasks
    where parliamentary_case_id = new.parliamentary_case_id
      and task_type = 'FACT_CONFLICT'
      and status in ('OPEN', 'IN_PROGRESS', 'WAITING_EVIDENCE', 'AI_REQUESTED')
  );

  perform public.recompute_case_analysis_state(new.parliamentary_case_id, 'IMPORT', new.id::text);
  return new;
end;
$$;
create trigger case_screenings_create_intake_task
after insert on public.case_screenings
for each row execute function public.create_case_intake_task();

alter table public.document_sections enable row level security;
alter table public.document_chunks enable row level security;
alter table public.document_diffs enable row level security;
alter table public.document_chunk_diffs enable row level security;
alter table public.decision_fact_packages enable row level security;
alter table public.impact_assessments enable row level security;
alter table public.impact_domain_assessments enable row level security;
alter table public.impact_paths enable row level security;
alter table public.impact_path_edges enable row level security;
alter table public.impact_claims enable row level security;
alter table public.impact_claim_evidence_links enable row level security;
alter table public.boundary_assessments enable row level security;
alter table public.editorial_tasks enable row level security;
alter table public.editorial_decisions enable row level security;
alter table public.resolution_patterns enable row level security;
alter table public.method_change_requests enable row level security;
alter table public.recommendation_candidates enable row level security;
alter table public.red_team_reviews enable row level security;
alter table public.ai_prompt_templates enable row level security;
alter table public.ai_microtasks enable row level security;
alter table public.ai_usage_ledger enable row level security;
alter table public.ai_cached_results enable row level security;
alter table public.case_analysis_states enable row level security;
alter table public.analysis_recompute_runs enable row level security;
alter table public.editorial_members enable row level security;

create policy "editorial member can read own role"
  on public.editorial_members for select to authenticated using (user_id = auth.uid());

-- The authenticated workbench may read the internal data necessary to prepare
-- a task.  Writes stay behind server-side routes/RPCs that additionally verify
-- the role and record an audit identity; no broad client write policy exists.
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'parliamentary_cases', 'decision_units', 'source_documents', 'document_versions',
    'case_knowledge_entries', 'import_runs', 'case_screenings', 'document_sections',
    'document_chunks', 'document_diffs', 'document_chunk_diffs', 'decision_fact_packages',
    'impact_assessments', 'impact_domain_assessments', 'impact_paths', 'impact_path_edges',
    'impact_claims', 'impact_claim_evidence_links', 'boundary_assessments', 'editorial_tasks',
    'editorial_decisions', 'resolution_patterns', 'method_change_requests',
    'recommendation_candidates', 'red_team_reviews', 'ai_prompt_templates', 'ai_microtasks',
    'ai_usage_ledger', 'ai_cached_results', 'case_analysis_states', 'analysis_recompute_runs'
  ] loop
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.is_editorial_member())',
      'editorial members may read internal work', table_name
    );
  end loop;
end;
$$;

revoke all on function public.recompute_case_analysis_state(uuid, text, text) from public, anon, authenticated;
revoke all on function public.record_editorial_decision(uuid, text, text, jsonb, uuid, text, text) from public, anon, authenticated;
revoke all on function public.is_editorial_member() from public, anon;
grant execute on function public.recompute_case_analysis_state(uuid, text, text) to service_role;
grant execute on function public.record_editorial_decision(uuid, text, text, jsonb, uuid, text, text) to service_role;
grant execute on function public.is_editorial_member() to authenticated;
