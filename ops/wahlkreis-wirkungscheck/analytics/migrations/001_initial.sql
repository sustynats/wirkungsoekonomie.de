create schema if not exists analytics;
create schema if not exists research_analytics;
create schema if not exists method_analytics;
create schema if not exists privacy_ops;
create schema if not exists security_monitoring;

create table if not exists analytics.schema_migrations (
  version text primary key,
  applied_at timestamptz not null default now()
);

create table if not exists analytics.raw_events (
  id uuid primary key,
  received_at timestamptz not null default now(),
  client_timestamp timestamptz not null,
  analytics_session_nonce varchar(43) not null,
  client_event_id uuid not null,
  event_name text not null,
  schema_version text not null,
  page_key text,
  step_index smallint,
  question_type text,
  component_type text,
  viewport_class text,
  locale text,
  duration_bucket text,
  rating smallint,
  study_id text not null,
  wave_id text not null,
  survey_version text not null,
  unique (analytics_session_nonce, client_event_id)
);

create index if not exists raw_events_received_at_idx on analytics.raw_events (received_at);

create table if not exists analytics.daily_funnel (
  date date not null,
  study_id text not null,
  wave_id text not null,
  survey_version text not null,
  started_count integer not null default 0,
  completed_count integer not null default 0,
  report_generated_count integer not null default 0,
  research_opt_in_shown_count integer not null default 0,
  research_opt_in_count integer not null default 0,
  public_opt_in_shown_count integer not null default 0,
  public_opt_in_count integer not null default 0,
  primary key (date, study_id, wave_id, survey_version)
);

create table if not exists analytics.daily_steps (
  date date not null,
  study_id text not null,
  wave_id text not null,
  survey_version text not null,
  step_index smallint not null,
  view_count integer not null default 0,
  back_navigation_count integer not null default 0,
  drop_off_count integer not null default 0,
  primary key (date, study_id, wave_id, survey_version, step_index)
);

create table if not exists analytics.daily_questions (
  date date not null,
  study_id text not null,
  wave_id text not null,
  survey_version text not null,
  step_index smallint not null,
  question_type text not null,
  view_count integer not null default 0,
  completion_count integer not null default 0,
  skip_count integer not null default 0,
  back_navigation_count integer not null default 0,
  answer_change_count integer not null default 0,
  duration_bucket_counts jsonb not null default '{}'::jsonb,
  duration_p50_bucket text,
  duration_p90_bucket text,
  drop_off_count integer not null default 0,
  primary key (date, study_id, wave_id, survey_version, step_index, question_type)
);

create table if not exists analytics.daily_report_usage (
  date date not null,
  study_id text not null,
  wave_id text not null,
  survey_version text not null,
  metric_key text not null,
  count integer not null default 0,
  primary key (date, study_id, wave_id, survey_version, metric_key)
);

create table if not exists analytics.daily_consent_usage (
  date date not null,
  study_id text not null,
  wave_id text not null,
  survey_version text not null,
  consent_key text not null,
  shown_count integer not null default 0,
  accepted_count integer not null default 0,
  primary key (date, study_id, wave_id, survey_version, consent_key)
);

create table if not exists analytics.daily_feedback (
  date date not null,
  study_id text not null,
  wave_id text not null,
  survey_version text not null,
  rating smallint not null check (rating between 1 and 5),
  submission_count integer not null default 0,
  primary key (date, study_id, wave_id, survey_version, rating)
);

create table if not exists privacy_ops.retention_runs (
  id uuid primary key,
  job_name text not null,
  started_at timestamptz not null,
  completed_at timestamptz,
  status text not null check (status in ('running', 'succeeded', 'failed')),
  deleted_raw_events integer not null default 0,
  deleted_dedupe_keys integer not null default 0,
  error_code text
);

create table if not exists security_monitoring.alerts (
  id uuid primary key,
  occurred_at timestamptz not null default now(),
  alert_code text not null,
  source text not null,
  resolved_at timestamptz
);

revoke all on schema analytics, research_analytics, method_analytics, privacy_ops, security_monitoring from public;
revoke all on all tables in schema analytics, research_analytics, method_analytics, privacy_ops, security_monitoring from public;
