-- Immutable source-to-result accounting records. These tables do not encode a
-- political conclusion; they preserve the reproducible quantitative path.

create table if not exists parliament.raw_observations (
  id uuid primary key default gen_random_uuid(),
  source_document_id uuid references parliament.source_documents(id) on delete set null,
  source_id text not null,
  source_location text not null,
  raw_value numeric not null,
  unit text not null,
  observation_date date,
  territorial_level text,
  quality_status text not null check (quality_status in ('HIGH', 'MEDIUM', 'LIMITED', 'UNKNOWN')),
  retrieved_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists parliament.formula_registry (
  formula_id text not null,
  version text not null,
  name text not null,
  description text not null,
  expression_ast jsonb not null,
  required_inputs jsonb not null,
  output_unit text not null,
  methodological_basis text not null,
  status text not null check (status in ('ACTIVE', 'RETIRED')),
  created_at timestamptz not null default now(),
  primary key (formula_id, version)
);

create table if not exists parliament.calculation_records (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references parliament.cases(id) on delete cascade,
  decision_unit_id uuid references parliament.decision_units(id) on delete set null,
  impact_claim_id text,
  woek_id text,
  calculation_type text not null check (calculation_type in ('QUANTIFIED_OBSERVED_EFFECT', 'QUANTIFIED_EXPECTED_EFFECT', 'RULE_BASED_ASSESSMENT', 'NOT_ROBUSTLY_QUANTIFIABLE')),
  baseline_value numeric,
  baseline_unit text,
  baseline_date date,
  counterfactual_value numeric,
  counterfactual_unit text,
  counterfactual_type text check (counterfactual_type in ('STATUS_QUO', 'TREND_CONTINUATION', 'CONTROL_GROUP', 'COMPARISON_REGION', 'MODELLED_COUNTERFACTUAL', 'EXTERNAL_EVALUATION', 'UNKNOWN')),
  scenario_value numeric,
  observed_value numeric,
  raw_change numeric,
  direction_adjusted_change numeric,
  affected_population numeric,
  exposure_factor numeric,
  attribution_factor numeric,
  attribution_basis text check (attribution_basis in ('RANDOMIZED_EVIDENCE', 'QUASI_EXPERIMENTAL', 'ECONOMETRIC_MODEL', 'OFFICIAL_EVALUATION', 'EXPERT_MODEL', 'ASSUMPTION', 'UNKNOWN')),
  benchmark_value numeric,
  target_value numeric,
  threshold_set_id text,
  normalized_value numeric,
  result_value numeric,
  result_unit text,
  lower_bound numeric,
  central_estimate numeric,
  upper_bound numeric,
  formula_id text,
  formula_version text,
  operand_ids jsonb not null default '[]'::jsonb,
  source_ids jsonb not null default '[]'::jsonb,
  assumption_ids jsonb not null default '[]'::jsonb,
  transformation_ids jsonb not null default '[]'::jsonb,
  method_version text not null,
  reference_snapshot jsonb not null,
  calculation_hash text not null unique,
  calculation_status text not null check (calculation_status in ('CALCULATED', 'DATA_GAP', 'ATTRIBUTION_UNRESOLVED', 'REVIEW_REQUIRED')),
  calculated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (lower_bound is null or upper_bound is null or lower_bound <= upper_bound),
  check (central_estimate is null or (lower_bound is null or central_estimate >= lower_bound) and (upper_bound is null or central_estimate <= upper_bound))
);

create table if not exists parliament.aggregation_records (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references parliament.cases(id) on delete cascade,
  input_calculation_ids jsonb not null,
  aggregation_method text not null,
  weights jsonb not null default '[]'::jsonb,
  weight_sources jsonb not null default '[]'::jsonb,
  excluded_inputs jsonb not null default '[]'::jsonb,
  exclusion_reasons jsonb not null default '[]'::jsonb,
  boundary_gate text not null,
  result jsonb not null,
  formula_version text,
  created_at timestamptz not null default now()
);

create index if not exists raw_observations_source_idx on parliament.raw_observations (source_id, observation_date);
create index if not exists calculation_records_case_idx on parliament.calculation_records (case_id, calculated_at desc);
create index if not exists aggregation_records_case_idx on parliament.aggregation_records (case_id, created_at desc);

alter table parliament.raw_observations enable row level security;
alter table parliament.formula_registry enable row level security;
alter table parliament.calculation_records enable row level security;
alter table parliament.aggregation_records enable row level security;
