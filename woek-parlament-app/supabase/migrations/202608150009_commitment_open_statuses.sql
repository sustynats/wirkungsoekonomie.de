-- A commitment may be structured before a concrete parliamentary decision
-- exists.  Preserve that open status instead of inventing a DecisionUnit.
alter table parliament.commitment_decision_links
  alter column case_id drop not null;

alter table parliament.commitment_decision_links
  add column if not exists impact_path_refs jsonb not null default '[]'::jsonb,
  add column if not exists official_status_check text,
  add column if not exists effect_assessment text;

comment on column parliament.commitment_decision_links.case_id is
  'Null only when the imported source relationship explicitly records that no concrete parliamentary decision has yet been identified.';

comment on column parliament.commitment_decision_links.effect_assessment is
  'A scope statement only; it is not an independent impact assessment or a recommendation.';

notify pgrst, 'reload schema';
