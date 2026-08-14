-- WÖk Calculation & Impact Accounting Layer
--
-- Quantified statements remain auditable from source observation to formula,
-- reference snapshot, uncertainty and aggregation. This is intentionally not
-- a generic score table: absent causal evidence stays visible as a data gap or
-- a rule-based assessment instead of becoming a fabricated numeric value.

alter type public.editorial_task_type add value if not exists 'CALCULATION_INPUT_REVIEW';
alter type public.editorial_task_type add value if not exists 'ATTRIBUTION_REVIEW';
alter type public.editorial_task_type add value if not exists 'BENCHMARK_REVIEW';
alter type public.editorial_task_type add value if not exists 'NORMALIZATION_REVIEW';
alter type public.editorial_task_type add value if not exists 'AGGREGATION_REVIEW';
alter type public.editorial_task_type add value if not exists 'UNCERTAINTY_REVIEW';
alter type public.editorial_task_type add value if not exists 'DOUBLE_COUNTING_REVIEW';

create type public.calculation_type as enum (
  'QUANTIFIED_OBSERVED_EFFECT',
  'QUANTIFIED_EXPECTED_EFFECT',
  'RULE_BASED_ASSESSMENT',
  'NOT_ROBUSTLY_QUANTIFIABLE'
);
create type public.calculation_status as enum ('DRAFT', 'REVIEW_REQUIRED', 'APPROVED', 'SUPERSEDED', 'REJECTED');
create type public.calculation_time_side as enum ('EX_ANTE_CALCULATION', 'EX_POST_CALCULATION');
create type public.counterfactual_type as enum (
  'STATUS_QUO', 'TREND_CONTINUATION', 'CONTROL_GROUP', 'COMPARISON_REGION',
  'MODELLED_COUNTERFACTUAL', 'EXTERNAL_EVALUATION', 'UNKNOWN'
);
create type public.counterfactual_status as enum ('OBSERVED', 'MODELLED', 'ESTIMATED', 'UNRESOLVED');
create type public.indicator_direction as enum ('HIGHER_IS_BETTER', 'LOWER_IS_BETTER', 'TARGET_RANGE', 'NON_MONOTONIC');
create type public.attribution_basis as enum (
  'RANDOMIZED_EVIDENCE', 'QUASI_EXPERIMENTAL', 'ECONOMETRIC_MODEL',
  'OFFICIAL_EVALUATION', 'EXPERT_MODEL', 'ASSUMPTION', 'UNKNOWN'
);
create type public.effect_time_type as enum ('ONE_OFF', 'ANNUAL', 'RECURRING', 'CUMULATIVE', 'LONG_TERM_STOCK');
create type public.value_origin as enum ('SOURCE_OBSERVED', 'DERIVED', 'EDITORIAL_MANUAL', 'AI_GENERATED_NUMERIC_VALUE');
create type public.quality_status as enum ('HIGH', 'MEDIUM', 'LIMITED', 'DATA_GAP', 'NOT_APPLICABLE');
create type public.transformation_status as enum ('RAW', 'CLEANED', 'NORMALIZED', 'DERIVED', 'MODELLED');
create type public.formula_status as enum ('DRAFT', 'APPROVED', 'RETIRED');
create type public.aggregation_status as enum ('DRAFT', 'REVIEW_REQUIRED', 'APPROVED', 'SUPERSEDED');
create type public.historical_decision_confirmed_status as enum (
  'ENTSCHEIDUNG_BESTAETIGT',
  'GRUNDSAETZLICH_BESTAETIGT_AUSGESTALTUNG_PROBLEMATISCH',
  'DAMALS_VERTRETBAR_HEUTE_NICHT_BESTAETIGT',
  'GEGENOPTION_VORZUGSWUERDIG',
  'KEINE_BELASTBARE_RUECKSCHAU_MOEGLICH'
);
create type public.historical_review_status as enum ('DRAFT', 'EVIDENCE_REQUIRED', 'REVIEW_REQUIRED', 'APPROVED', 'SUPERSEDED');
create type public.historical_option_kind as enum ('ACTUAL_DECISION', 'ALTERNATIVE');
create type public.calculation_challenge_status as enum ('NEW', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED');

-- Units are centrally typed.  Formulas never add or compare values across
-- dimensions.  Conversion is done only in the application formula engine and
-- recorded as a transformation, never by silently changing a raw value.
create table public.measurement_units (
  code text primary key,
  dimension text not null,
  display_label text not null,
  is_ratio boolean not null default false,
  created_at timestamptz not null default now()
);

insert into public.measurement_units (code, dimension, display_label, is_ratio) values
  ('EUR', 'CURRENCY', 'Euro', false),
  ('EUR_PER_YEAR', 'CURRENCY_RATE', 'Euro pro Jahr', false),
  ('PERSONS', 'COUNT', 'Personen', false),
  ('PERCENT', 'PERCENTAGE', 'Prozent', true),
  ('TONNES_CO2E', 'MASS_CO2E', 'Tonnen CO₂e', false),
  ('KWH', 'ENERGY', 'Kilowattstunden', false),
  ('HECTARES', 'AREA', 'Hektar', false),
  ('MINUTES', 'TIME', 'Minuten', false),
  ('CASES', 'COUNT', 'Fälle', false),
  ('CASES_PER_100000', 'RATE', 'Fälle je 100.000', false),
  ('INDEX_POINTS', 'INDEX', 'Indexpunkte', false),
  ('FACTOR', 'FACTOR', 'Faktor', true),
  ('UNITLESS', 'UNITLESS', 'Einheitenlos', true)
on conflict (code) do nothing;

create table public.formula_registry (
  id uuid primary key default gen_random_uuid(),
  formula_key text not null,
  name text not null,
  description text not null,
  expression_ast jsonb not null,
  required_inputs jsonb not null default '[]'::jsonb,
  output_unit_code text references public.measurement_units(code),
  methodological_basis text not null,
  method_reference_id text,
  version text not null,
  status public.formula_status not null default 'DRAFT',
  reference_snapshot text not null,
  created_by uuid references public.editorial_members(user_id) on delete set null,
  approved_by uuid references public.editorial_members(user_id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (formula_key, version),
  check (status <> 'APPROVED' or approved_at is not null),
  check (jsonb_typeof(expression_ast) = 'object'),
  check (jsonb_typeof(required_inputs) = 'array')
);

create table public.normalization_rules (
  id uuid primary key default gen_random_uuid(),
  rule_key text not null,
  woek_id text not null,
  input_unit_code text not null references public.measurement_units(code),
  method text not null,
  thresholds jsonb not null default '[]'::jsonb,
  direction public.indicator_direction not null,
  output_scale text not null,
  version text not null,
  source_document_id uuid references public.source_documents(id) on delete set null,
  reference_snapshot text not null,
  status public.formula_status not null default 'DRAFT',
  valid_from date,
  valid_to date,
  created_at timestamptz not null default now(),
  unique (rule_key, version),
  check (valid_to is null or valid_from is null or valid_to >= valid_from),
  check (jsonb_typeof(thresholds) = 'array')
);

-- Imported values are append-only. A correction is a new raw observation with
-- `supersedes_raw_observation_id`, preserving the original source datum.
create table public.raw_observations (
  id uuid primary key default gen_random_uuid(),
  source_document_id uuid not null references public.source_documents(id) on delete restrict,
  parliamentary_case_id uuid references public.parliamentary_cases(id) on delete set null,
  observation_key text not null,
  raw_value numeric not null,
  unit_code text not null references public.measurement_units(code),
  source_location text not null,
  observation_date date,
  territorial_level text,
  geography text,
  population_scope text,
  quality_status public.quality_status not null default 'MEDIUM',
  knowledge_time_side public.knowledge_time_side not null default 'POST_DECISION',
  supersedes_raw_observation_id uuid references public.raw_observations(id) on delete set null,
  ingested_by text not null default 'SYSTEM',
  created_at timestamptz not null default now(),
  unique (source_document_id, observation_key, source_location),
  check (supersedes_raw_observation_id is null or supersedes_raw_observation_id <> id)
);

create table public.derived_metrics (
  id uuid primary key default gen_random_uuid(),
  metric_key text not null,
  name text not null,
  formula_registry_id uuid references public.formula_registry(id) on delete restrict,
  value numeric not null,
  unit_code text not null references public.measurement_units(code),
  transformation_status public.transformation_status not null default 'DERIVED',
  calculation_hash text not null,
  created_at timestamptz not null default now(),
  unique (metric_key, calculation_hash)
);

create table public.derived_metric_inputs (
  id uuid primary key default gen_random_uuid(),
  derived_metric_id uuid not null references public.derived_metrics(id) on delete cascade,
  raw_observation_id uuid references public.raw_observations(id) on delete restrict,
  source_derived_metric_id uuid references public.derived_metrics(id) on delete restrict,
  role text not null,
  created_at timestamptz not null default now(),
  check ((raw_observation_id is not null)::integer + (source_derived_metric_id is not null)::integer = 1)
);

create table public.calculation_assumptions (
  id uuid primary key default gen_random_uuid(),
  parliamentary_case_id uuid not null references public.parliamentary_cases(id) on delete cascade,
  assumption_key text not null,
  statement text not null,
  rationale text not null,
  source_document_id uuid references public.source_documents(id) on delete set null,
  range_lower numeric,
  range_central numeric,
  range_upper numeric,
  status public.calculation_status not null default 'REVIEW_REQUIRED',
  created_by uuid references public.editorial_members(user_id) on delete set null,
  created_at timestamptz not null default now(),
  check (range_lower is null or range_upper is null or range_lower <= range_upper),
  check (range_central is null or (range_lower is null or range_central >= range_lower) and (range_upper is null or range_central <= range_upper)),
  unique (parliamentary_case_id, assumption_key, created_at)
);

create table public.calculation_records (
  id uuid primary key default gen_random_uuid(),
  parliamentary_case_id uuid not null references public.parliamentary_cases(id) on delete cascade,
  decision_unit_id uuid references public.decision_units(id) on delete set null,
  impact_claim_id uuid references public.impact_claims(id) on delete set null,
  impact_path_edge_id uuid references public.impact_path_edges(id) on delete set null,
  woek_id text,
  calculation_type public.calculation_type not null,
  time_side public.calculation_time_side not null,
  indicator_key text not null,
  deduplication_key text,
  indicator_direction public.indicator_direction,
  counterfactual_type public.counterfactual_type not null default 'UNKNOWN',
  counterfactual_status public.counterfactual_status not null default 'UNRESOLVED',
  attribution_factor numeric,
  attribution_basis public.attribution_basis not null default 'UNKNOWN',
  attribution_rationale text,
  affected_population numeric,
  exposure_factor numeric,
  effect_time_type public.effect_time_type,
  effect_start date,
  effect_end date,
  observation_period text,
  benchmark_value numeric,
  target_value numeric,
  benchmark_unit_code text references public.measurement_units(code),
  threshold_set_id text,
  normalized_value numeric,
  result_value numeric,
  result_unit_code text references public.measurement_units(code),
  lower_bound numeric,
  central_estimate numeric,
  upper_bound numeric,
  formula_registry_id uuid references public.formula_registry(id) on delete restrict,
  formula_version text,
  normalization_rule_id uuid references public.normalization_rules(id) on delete restrict,
  reference_snapshot text not null,
  data_quality public.quality_status not null default 'DATA_GAP',
  causal_quality public.quality_status not null default 'DATA_GAP',
  model_quality public.quality_status not null default 'NOT_APPLICABLE',
  calculation_hash text not null,
  calculation_status public.calculation_status not null default 'DRAFT',
  not_quantifiable_reason text,
  calculated_at timestamptz not null default now(),
  superseded_at timestamptz,
  created_at timestamptz not null default now(),
  check (affected_population is null or affected_population >= 0),
  check (exposure_factor is null or (exposure_factor >= 0 and exposure_factor <= 1)),
  check (attribution_factor is null or (attribution_factor >= 0 and attribution_factor <= 1)),
  check (lower_bound is null or upper_bound is null or lower_bound <= upper_bound),
  check (central_estimate is null or (lower_bound is null or central_estimate >= lower_bound) and (upper_bound is null or central_estimate <= upper_bound)),
  check (effect_end is null or effect_start is null or effect_end >= effect_start),
  check (calculation_type <> 'NOT_ROBUSTLY_QUANTIFIABLE' or not_quantifiable_reason is not null),
  check (attribution_factor is null or attribution_basis <> 'UNKNOWN'),
  check (
    calculation_type not in ('QUANTIFIED_OBSERVED_EFFECT', 'QUANTIFIED_EXPECTED_EFFECT')
    or calculation_status <> 'APPROVED'
    or (formula_registry_id is not null and result_value is not null and result_unit_code is not null)
  )
);

create index calculation_records_case_idx on public.calculation_records (parliamentary_case_id, calculation_status, time_side);
create index calculation_records_claim_idx on public.calculation_records (impact_claim_id) where impact_claim_id is not null;

create table public.calculation_operands (
  id uuid primary key default gen_random_uuid(),
  calculation_record_id uuid not null references public.calculation_records(id) on delete cascade,
  role text not null check (role in ('BASELINE', 'COUNTERFACTUAL', 'SCENARIO', 'OBSERVED', 'RAW_CHANGE', 'EXPOSURE', 'ATTRIBUTION', 'BENCHMARK', 'TARGET', 'RESULT')),
  name text not null,
  value numeric not null,
  unit_code text not null references public.measurement_units(code),
  raw_observation_id uuid references public.raw_observations(id) on delete restrict,
  derived_metric_id uuid references public.derived_metrics(id) on delete restrict,
  source_document_id uuid references public.source_documents(id) on delete set null,
  source_location text,
  observation_date date,
  territorial_level text,
  transformation_status public.transformation_status not null default 'RAW',
  quality_status public.quality_status not null default 'MEDIUM',
  value_origin public.value_origin not null default 'SOURCE_OBSERVED',
  rationale text,
  verification_source_document_id uuid references public.source_documents(id) on delete set null,
  verified_by uuid references public.editorial_members(user_id) on delete set null,
  created_at timestamptz not null default now(),
  check (value_origin <> 'EDITORIAL_MANUAL' or (source_document_id is not null and rationale is not null)),
  check (value_origin <> 'AI_GENERATED_NUMERIC_VALUE' or (verification_source_document_id is not null and verified_by is not null)),
  check (raw_observation_id is null or value_origin in ('SOURCE_OBSERVED', 'DERIVED')),
  unique (calculation_record_id, role, name)
);

create table public.calculation_assumption_links (
  calculation_record_id uuid not null references public.calculation_records(id) on delete cascade,
  calculation_assumption_id uuid not null references public.calculation_assumptions(id) on delete restrict,
  primary key (calculation_record_id, calculation_assumption_id)
);

create table public.calculation_transformations (
  id uuid primary key default gen_random_uuid(),
  calculation_record_id uuid not null references public.calculation_records(id) on delete cascade,
  input_operand_id uuid references public.calculation_operands(id) on delete set null,
  transformation_kind text not null,
  transformation_version text not null,
  parameters jsonb not null default '{}'::jsonb,
  output_value numeric,
  output_unit_code text references public.measurement_units(code),
  created_at timestamptz not null default now(),
  check (jsonb_typeof(parameters) = 'object')
);

-- A calculation can make its separate SDG, SDG+ and MPD contribution visible
-- without claiming that mapping alone produces a numerical score.
create table public.normative_contributions (
  id uuid primary key default gen_random_uuid(),
  calculation_record_id uuid not null references public.calculation_records(id) on delete cascade,
  reference_id text not null,
  reference_type text not null check (reference_type in ('OFFICIAL_SDG', 'WOEK_SDG_PLUS', 'MPD_DIMENSION')),
  direction text not null check (direction in ('POSITIVE', 'NEGATIVE', 'MIXED', 'UNRESOLVED')),
  magnitude_if_available numeric,
  evidence_status public.quality_status not null default 'DATA_GAP',
  reason text not null,
  created_at timestamptz not null default now()
);

create table public.calculation_aggregations (
  id uuid primary key default gen_random_uuid(),
  parliamentary_case_id uuid not null references public.parliamentary_cases(id) on delete cascade,
  aggregation_key text not null,
  aggregation_method text not null check (aggregation_method in ('NO_AGGREGATION', 'FORMULA', 'WEIGHTED_MEAN', 'NON_ADDITIVE_SUMMARY')),
  boundary_gate public.boundary_assessment_status not null default 'BOUNDARY_REVIEW_REQUIRED',
  result jsonb not null default '{}'::jsonb,
  formula_registry_id uuid references public.formula_registry(id) on delete restrict,
  formula_version text,
  reference_snapshot text not null,
  aggregation_status public.aggregation_status not null default 'DRAFT',
  created_at timestamptz not null default now(),
  unique (parliamentary_case_id, aggregation_key, created_at),
  check (jsonb_typeof(result) = 'object')
);

create table public.calculation_aggregation_inputs (
  id uuid primary key default gen_random_uuid(),
  calculation_aggregation_id uuid not null references public.calculation_aggregations(id) on delete cascade,
  calculation_record_id uuid not null references public.calculation_records(id) on delete restrict,
  included boolean not null default true,
  exclusion_reason text,
  weight_value numeric,
  weight_basis text,
  weight_source_document_id uuid references public.source_documents(id) on delete set null,
  weight_version text,
  created_at timestamptz not null default now(),
  check (weight_value is null or weight_value >= 0),
  check (included or exclusion_reason is not null),
  check (weight_value is null or (weight_basis is not null and weight_source_document_id is not null and weight_version is not null)),
  unique (calculation_aggregation_id, calculation_record_id)
);

create table public.historical_decision_reviews (
  id uuid primary key default gen_random_uuid(),
  parliamentary_case_id uuid not null unique references public.parliamentary_cases(id) on delete cascade,
  actual_decision text,
  actual_vote_result jsonb not null default '{}'::jsonb,
  actual_final_document_version_id uuid references public.document_versions(id) on delete set null,
  official_objective_at_time text,
  evidence_available_at_time jsonb not null default '[]'::jsonb,
  expected_impact_paths_at_time jsonb not null default '[]'::jsonb,
  observed_outcomes jsonb not null default '[]'::jsonb,
  observed_side_effects jsonb not null default '[]'::jsonb,
  observed_boundary_effects jsonb not null default '[]'::jsonb,
  causal_evidence_strength public.quality_status not null default 'DATA_GAP',
  ex_ante_woek_assessment text,
  ex_post_woek_assessment text,
  preferred_decision_in_hindsight text,
  why_preferred jsonb not null default '[]'::jsonb,
  why_not_other_options jsonb not null default '[]'::jsonb,
  decision_confirmed_status public.historical_decision_confirmed_status,
  lessons_learned jsonb not null default '[]'::jsonb,
  future_decision_principles jsonb not null default '[]'::jsonb,
  status public.historical_review_status not null default 'DRAFT',
  method_version text not null,
  reference_snapshot text not null,
  approved_by uuid references public.editorial_members(user_id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'APPROVED' or approved_at is not null),
  check (jsonb_typeof(actual_vote_result) = 'object')
);

create table public.historical_review_options (
  id uuid primary key default gen_random_uuid(),
  historical_decision_review_id uuid not null references public.historical_decision_reviews(id) on delete cascade,
  option_kind public.historical_option_kind not null,
  option_key text not null,
  title text not null,
  decision_description text not null,
  available_at_decision_time boolean not null,
  counterfactual_status public.counterfactual_status not null default 'UNRESOLVED',
  ex_ante_assessment text,
  ex_post_assessment text,
  boundary_status public.boundary_assessment_status not null default 'BOUNDARY_REVIEW_REQUIRED',
  uncertainty text,
  created_at timestamptz not null default now(),
  unique (historical_decision_review_id, option_key),
  unique (historical_decision_review_id, option_kind, option_key)
);

create table public.historical_review_calculation_links (
  historical_review_option_id uuid not null references public.historical_review_options(id) on delete cascade,
  calculation_record_id uuid not null references public.calculation_records(id) on delete restrict,
  time_side public.calculation_time_side not null,
  primary key (historical_review_option_id, calculation_record_id)
);

create table public.calculation_challenges (
  id uuid primary key default gen_random_uuid(),
  calculation_record_id uuid not null references public.calculation_records(id) on delete cascade,
  challenge_type text not null check (challenge_type in ('SOURCE', 'INPUT', 'ASSUMPTION', 'FORMULA', 'COUNTERFACTUAL', 'ATTRIBUTION', 'NORMALIZATION', 'WEIGHT', 'BOUNDARY', 'NORMATIVE_MAPPING', 'DOUBLE_COUNTING', 'OTHER')),
  statement text not null,
  supporting_source_url text,
  status public.calculation_challenge_status not null default 'NEW',
  editorial_response text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create or replace function public.prevent_raw_observation_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'RAW_OBSERVATION_IMMUTABLE_CREATE_A_SUPERSEDING_OBSERVATION';
end;
$$;
create trigger raw_observations_immutable
before update or delete on public.raw_observations
for each row execute function public.prevent_raw_observation_mutation();

-- Historical ex-ante data may not originate after the decision date. This
-- repeats the existing case-knowledge boundary at the numeric-data layer.
create or replace function public.enforce_calculation_hindsight_boundary()
returns trigger language plpgsql
set search_path = public
as $$
declare
  v_decision_date date;
  v_source_date date;
  v_case_kind public.parliament_case_kind;
begin
  if new.parliamentary_case_id is null or new.knowledge_time_side <> 'AS_KNOWN_ON_DECISION' then return new; end if;
  select decision_date, case_kind into v_decision_date, v_case_kind from public.parliamentary_cases where id = new.parliamentary_case_id;
  select source_published_on into v_source_date from public.source_documents where id = new.source_document_id;
  if v_case_kind = 'RETROSPECTIVE_CASE' and (v_decision_date is null or v_source_date > v_decision_date) then
    raise exception 'CALCULATION_HINDSIGHT_BOUNDARY_VIOLATION';
  end if;
  return new;
end;
$$;
create trigger raw_observations_hindsight_boundary
before insert on public.raw_observations
for each row execute function public.enforce_calculation_hindsight_boundary();

-- An approved quantified claim must rest on a formula, a resolved
-- counterfactual, and no unverified AI-created numeric operand. An AI helper
-- may identify a missing value, but never smuggle one into a public result.
create or replace function public.validate_calculation_release()
returns trigger language plpgsql
set search_path = public
as $$
begin
  if new.calculation_status <> 'APPROVED' then return new; end if;
  if new.calculation_type in ('QUANTIFIED_OBSERVED_EFFECT', 'QUANTIFIED_EXPECTED_EFFECT') then
    if not exists (
      select 1 from public.formula_registry
      where id = new.formula_registry_id and version = new.formula_version and status = 'APPROVED'
    ) then
      raise exception 'APPROVED_CALCULATION_REQUIRES_APPROVED_FORMULA_VERSION';
    end if;
    if new.counterfactual_type = 'UNKNOWN' or new.counterfactual_status = 'UNRESOLVED' then
      raise exception 'APPROVED_QUANTIFIED_CALCULATION_REQUIRES_COUNTERFACTUAL';
    end if;
    if new.attribution_factor is not null and new.attribution_basis = 'UNKNOWN' then
      raise exception 'APPROVED_CALCULATION_REQUIRES_ATTRIBUTION_BASIS';
    end if;
    if exists (
      select 1 from public.calculation_operands
      where calculation_record_id = new.id
        and value_origin = 'AI_GENERATED_NUMERIC_VALUE'
        and (verification_source_document_id is null or verified_by is null)
    ) then
      raise exception 'UNVERIFIED_AI_NUMERIC_OPERAND_CANNOT_BE_APPROVED';
    end if;
  end if;
  return new;
end;
$$;
create trigger calculation_records_validate_release
before insert or update on public.calculation_records
for each row execute function public.validate_calculation_release();

-- A release happens only after the draft has received its source-linked
-- operands. This also prevents an approved record from having merely a result
-- number but no visible counterfactual or observed/scenario state.
create or replace function public.validate_calculation_operand_completeness()
returns trigger language plpgsql
set search_path = public
as $$
begin
  if new.calculation_status <> 'APPROVED' or new.calculation_type not in ('QUANTIFIED_OBSERVED_EFFECT', 'QUANTIFIED_EXPECTED_EFFECT') then return new; end if;
  if not exists (
    select 1 from public.calculation_operands
    where calculation_record_id = new.id and role = 'COUNTERFACTUAL'
      and (raw_observation_id is not null or derived_metric_id is not null or source_document_id is not null)
  ) then
    raise exception 'APPROVED_CALCULATION_REQUIRES_SOURCED_COUNTERFACTUAL_OPERAND';
  end if;
  if not exists (
    select 1 from public.calculation_operands
    where calculation_record_id = new.id and role in ('SCENARIO', 'OBSERVED')
      and (raw_observation_id is not null or derived_metric_id is not null or source_document_id is not null)
  ) then
    raise exception 'APPROVED_CALCULATION_REQUIRES_SOURCED_STATE_OPERAND';
  end if;
  return new;
end;
$$;
create trigger calculation_records_validate_operand_completeness
before insert or update on public.calculation_records
for each row execute function public.validate_calculation_operand_completeness();

-- Aggregation may never conceal a supported boundary breach. It must mark the
-- record as blocked by noncompensation instead of emitting a compensating
-- positive total. Equal deduplication keys cannot enter one aggregation twice.
create or replace function public.validate_calculation_aggregation_release()
returns trigger language plpgsql
set search_path = public
as $$
begin
  if new.aggregation_status = 'APPROVED'
    and new.boundary_gate = 'BOUNDARY_BREACH_SUPPORTED'
    and coalesce((new.result->>'noncompensation_blocked')::boolean, false) = false then
    raise exception 'APPROVED_AGGREGATION_REQUIRES_NONCOMPENSATION_BLOCK';
  end if;
  return new;
end;
$$;
create trigger calculation_aggregations_validate_release
before insert or update on public.calculation_aggregations
for each row execute function public.validate_calculation_aggregation_release();

create or replace function public.prevent_calculation_double_counting()
returns trigger language plpgsql
set search_path = public
as $$
declare v_deduplication_key text;
begin
  if not new.included then return new; end if;
  select deduplication_key into v_deduplication_key from public.calculation_records where id = new.calculation_record_id;
  if v_deduplication_key is not null and exists (
    select 1
    from public.calculation_aggregation_inputs existing
    join public.calculation_records existing_record on existing_record.id = existing.calculation_record_id
    where existing.calculation_aggregation_id = new.calculation_aggregation_id
      and existing.included
      and existing_record.deduplication_key = v_deduplication_key
      and existing.calculation_record_id <> new.calculation_record_id
  ) then
    raise exception 'DOUBLE_COUNTING_CHECK_FAILED';
  end if;
  return new;
end;
$$;
create trigger calculation_aggregation_inputs_no_double_counting
before insert or update on public.calculation_aggregation_inputs
for each row execute function public.prevent_calculation_double_counting();

alter table public.measurement_units enable row level security;
alter table public.formula_registry enable row level security;
alter table public.normalization_rules enable row level security;
alter table public.raw_observations enable row level security;
alter table public.derived_metrics enable row level security;
alter table public.derived_metric_inputs enable row level security;
alter table public.calculation_assumptions enable row level security;
alter table public.calculation_records enable row level security;
alter table public.calculation_operands enable row level security;
alter table public.calculation_assumption_links enable row level security;
alter table public.calculation_transformations enable row level security;
alter table public.normative_contributions enable row level security;
alter table public.calculation_aggregations enable row level security;
alter table public.calculation_aggregation_inputs enable row level security;
alter table public.historical_decision_reviews enable row level security;
alter table public.historical_review_options enable row level security;
alter table public.historical_review_calculation_links enable row level security;
alter table public.calculation_challenges enable row level security;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'measurement_units', 'formula_registry', 'normalization_rules', 'raw_observations',
    'derived_metrics', 'derived_metric_inputs', 'calculation_assumptions', 'calculation_records',
    'calculation_operands', 'calculation_assumption_links', 'calculation_transformations',
    'normative_contributions', 'calculation_aggregations', 'calculation_aggregation_inputs',
    'historical_decision_reviews', 'historical_review_options', 'historical_review_calculation_links',
    'calculation_challenges'
  ] loop
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.is_editorial_member())',
      'editorial members read ' || table_name, table_name
    );
  end loop;
end;
$$;
