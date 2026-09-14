// Independent editorial scope witness. These checks establish consistency and
// coverage, not the truth of a model's interpretation of the source material.
// Old paid receipts remain valid under their original contract.
export const IMPACT_SCOPE_REVISION = 'target-baseline-1';
export const IMPACT_SCOPE_RULE = 'Gegenstandsprüfung vor der Pfadbewertung: Aus den Ereignisbelegen den berichteten Sachverhalt, die Maßnahme oder das Risiko bestimmen. Eine Warnung, Forderung oder Meldung ist zunächst Nachrichtenanlass, nicht automatisch Wirkungsgegenstand. Kommunikation nur dann selbst bewerten, wenn ihre Vermittlung oder Rezeption der begründete redaktionelle Gegenstand ist; den zugrunde liegenden Sachverhalt dennoch explizit benennen. Vergleich als konkreten Zustand ohne Gegenstand, früheren Zustand oder ausdrücklich benanntes Alternativszenario formulieren, nicht als fehlende Daten. Jeden Pfad gegen genau diesen Zustand prüfen. Risikominderung gegenüber einem schlechteren Szenario, Restschaden, bloßes Verfahren und ausbleibender Nutzen sind keine eigenständigen positiven Gegenpfade. Eine eigenständig bewertete Schutzmaßnahme darf einen positiven Hauptpfad haben, wenn sie gegenüber dem Zustand ohne diese Schutzmaßnahme eine begründete Veränderung bewirkt. Andere Maßnahmen und andere Vergleiche getrennt halten. Keine Richtung nach Thema, Partei oder Quelle. Der unabhängige Prüfer dokumentiert diese Auswahl in scope und prüft alle Pfadrollen der Endfassung; same_target/same_baseline allein sind kein Nachweis.';

const string = { type: 'string', minLength: 12 };
const en = values => ({ type: 'string', enum: values });
const object = properties => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });
export const IMPACT_SCOPE_SCHEMA = object({
  version: en([IMPACT_SCOPE_REVISION]),
  target: object({
    label: string, relation_to_news: en(['underlying_subject', 'communication_itself']),
    underlying_subject: string, rationale: string,
    source_ids: { type: 'array', minItems: 1, items: { type: 'string' } },
  }),
  baseline: object({ label: string, kind: en(['without_target', 'prior_state', 'alternative_scenario']), rationale: string }),
  paths: { type: 'array', items: object({
    dimension: en(['human', 'planet', 'democracy']), path_set: en(['primary_paths', 'secondary_paths']),
    path_index: { type: 'integer', minimum: 0 },
    target_relation: en(['same_target', 'other_target']),
    reference: en(['assessment_baseline', 'other_baseline']), baseline: string,
    effect_role: en(['substantive_change', 'risk_mitigation', 'residual_harm', 'procedure', 'unrealised_benefit', 'other_measure']),
    rationale: string,
  }) },
});

export function modelledPublicationIssues(assessment) {
  return ['human', 'planet', 'democracy'].flatMap(key => {
    const d = assessment?.dimensions?.[key];
    return d?.path_status === 'modelled' && Number.isInteger(d.magnitude) && d.magnitude >= 0 && d.magnitude <= 5 && d.primary_paths?.length ? [] : [`IMPACT_FRESH_MODELLED_DIMENSION_REQUIRED:${key}`];
  });
}
export const isModelledPublicationIssue = issue => issue.startsWith('IMPACT_FRESH_MODELLED_DIMENSION_REQUIRED:');

const text = value => typeof value === 'string' && value.trim().length >= 12;
const list = value => Array.isArray(value) ? value : [];
export function impactScopeErrors(scope, assessment, sources = [], { required = false, publication = false } = {}) {
  if (scope === undefined) return required ? ['IMPACT_SCOPE_REQUIRED'] : []; // Immutable historical review contract.
  const errors = [], fail = code => errors.push(code);
  if (publication) errors.push(...modelledPublicationIssues(assessment));
  if (!scope || scope.version !== IMPACT_SCOPE_REVISION) return ['IMPACT_SCOPE_INVALID'];
  const sourceIds = new Set(sources.map(source => source.source_id));
  const target = scope.target, baseline = scope.baseline;
  if (!text(target?.label) || target.label !== assessment?.evaluation_target?.label
    || !text(target.underlying_subject) || !text(target.rationale)
    || !['underlying_subject', 'communication_itself'].includes(target.relation_to_news)
    || !list(target.source_ids).length || target.source_ids.some(id => !sourceIds.has(id))) fail('IMPACT_SCOPE_TARGET_INVALID');
  if (target && (target.relation_to_news === 'communication_itself')
    !== ['communication', 'narrative'].includes(assessment?.evaluation_target?.type)) fail('IMPACT_SCOPE_COMMUNICATION_CONFLICT');
  if (!text(baseline?.label) || baseline.label !== assessment?.baseline || !text(baseline.rationale)
    || !['without_target', 'prior_state', 'alternative_scenario'].includes(baseline.kind)) fail('IMPACT_SCOPE_BASELINE_INVALID');
  if (!Array.isArray(scope.paths)) fail('IMPACT_SCOPE_PATHS_REQUIRED');
  const seen = new Set();
  for (const entry of list(scope.paths)) {
    const address = `${entry?.dimension}:${entry?.path_set}:${entry?.path_index}`;
    const path = assessment?.dimensions?.[entry?.dimension]?.[entry?.path_set]?.[entry?.path_index];
    if (!['human', 'planet', 'democracy'].includes(entry?.dimension)
      || !['primary_paths', 'secondary_paths'].includes(entry?.path_set)
      || !Number.isInteger(entry?.path_index) || entry.path_index < 0 || !path || seen.has(address)) {
      fail('IMPACT_SCOPE_PATH_ADDRESS_INVALID'); continue;
    }
    seen.add(address);
    if (!text(entry.rationale) || !text(entry.baseline)
      || !['same_target', 'other_target'].includes(entry.target_relation)
      || !['assessment_baseline', 'other_baseline'].includes(entry.reference)
      || !['substantive_change', 'risk_mitigation', 'residual_harm', 'procedure', 'unrealised_benefit', 'other_measure'].includes(entry.effect_role)) fail(`IMPACT_SCOPE_PATH_INVALID:${address}`);
    if ((entry.target_relation === 'same_target') !== path.same_target
      || (entry.reference === 'assessment_baseline') !== path.same_baseline
      || (entry.reference === 'assessment_baseline') !== (entry.baseline === assessment.baseline)) fail(`IMPACT_SCOPE_PATH_BINDING_CONFLICT:${address}`);
    // Labels such as "counter_path" or a pair of true booleans cannot turn a
    // mitigation against a worse proposal into a benefit against no intervention.
    if (entry.path_set === 'primary_paths' && (entry.effect_role !== 'substantive_change'
      || entry.target_relation !== 'same_target' || entry.reference !== 'assessment_baseline')) fail(`IMPACT_SCOPE_MAIN_ROLE_INVALID:${address}`);
  }
  for (const [dimension, value] of Object.entries(assessment?.dimensions || {})) {
    for (const pathSet of ['primary_paths', 'secondary_paths']) {
      list(value[pathSet]).forEach((_, index) => {
        if (!seen.has(`${dimension}:${pathSet}:${index}`)) fail(`IMPACT_SCOPE_PATH_UNREVIEWED:${dimension}:${pathSet}:${index}`);
      });
    }
  }
  return [...new Set(errors)];
}
