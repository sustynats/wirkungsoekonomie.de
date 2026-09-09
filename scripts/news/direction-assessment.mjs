// Display fallbacks are not analytical verdicts. Never rewrite old judgments.
export const DIRECTION_ASSESSMENT_VERSION = '1.1';
const supportedVersions = new Set(['1.0', DIRECTION_ASSESSMENT_VERSION]);
const effectTypes = ['independent_change', 'mitigation_only', 'unrealized_benefit', 'procedural_possibility'];
const references = ['assessment_baseline', 'other_baseline'];
export const DIRECTION_SEPARATION_RULE = 'Eintritt/Ausmaß/Evidenz/Richtung trennen: bedingter Schaden kann klar negativ sein. Keine False Balance: Schutzplanke/Unsicherheit/Streit sind keine Gegenwirkung. Keine Richtung aus Partei/Thema/Relevanz. Ereignis/Reaktion/Politik trennen, Systemkopplungen prüfen.';
export const DIRECTION_REFERENCE_RULE = 'Bewerteten Eingriff und Vergleich ohne Eingriff nennen; alle bilanzierten Pfade brauchen dieselbe Referenz. Nachbesserung gegenüber schlechterem Entwurf ≠ Verbesserung des Ausgangszustands. Restschaden/Risikominderung trennen. Ausbleibender Nutzen ≠ eigenständiger Schaden; bloßes Verfahren ≠ Demokratiegewinn. Eigenständige Vorteile anderer Maßnahmen separat zeigen. Risikominderung als eigener Gegenstand braucht eigenen Vergleich.';
export const NEWS_DIRECTION_RULE = `${DIRECTION_SEPARATION_RULE} ${DIRECTION_REFERENCE_RULE} assessment_frame:{subject,baseline}. tendency: chance/risiko/gemischt/offen; direction_basis: assessed, nur bei offen unclear/no_path. Chance braucht positive_path, Risiko negative_path, gemischt beide; unbenötigte Pfade null. Bilanzierbar: effect_type=independent_change, reference=assessment_baseline. Nicht bilanzierbar: mitigation_only/unrealized_benefit/procedural_possibility bzw. other_baseline. subject/baseline/rationale/mechanism ≥20 Zeichen. source_ids belegen Ausgangspunkt, nicht Kausalität. Keine weiteren Quellenabrufe.`;
export const NEWS_ASSESSMENT_FRAME_SCHEMA = { subject: 'string', baseline: 'string' };
export const OUTCOME_EVIDENCE_RULE = 'Potenzial/Risiko ≠ eingetretene Wirkung; Beschluss/Urteil/Daten allein ≠ Folgenbeleg. ex_post braucht observed_outcome:{change,source_ids,attribution:established|open}: beobachtete Zustandsänderung, Beleg, getrennte Ursachenzurechnung. Sonst null und ex_ante/monitoring. Plausible Risiken früh bewerten/veröffentlichen, nicht auf Langzeitmessungen warten.';
// Keep the actual model-facing template aligned with the validation contract.
// Path objects are conditional, not a request to invent a positive counterpath.
export const NEWS_DIMENSION_SCHEMA = {
  relevance: 'gering|mittel|hoch|sehr hoch|offen',
  tendency: 'chance|risiko|gemischt|offen',
  direction_basis: 'assessed|unclear|no_path',
  rationale: 'string',
  positive_path: { mechanism: 'string', source_ids: ['source_id oder gelieferte evidence_id'], effect_type: effectTypes.join('|'), reference: references.join('|') },
  negative_path: { mechanism: 'string', source_ids: ['source_id oder gelieferte evidence_id'], effect_type: effectTypes.join('|'), reference: references.join('|') },
};
const tendencies = new Set(['chance', 'risiko', 'gemischt', 'offen']);
const bases = new Set(['assessed', 'unclear', 'no_path']);
const substantive = value => typeof value === 'string' && value.trim().length >= 20;
const valueShape = value => value === undefined ? 'missing' : value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
// Some providers fill the object template with empty fields instead of null.
// Only this exact empty representation of a non-required path is equivalent.
// Never discard a mechanism, a reference, extra data, or a required mixed path.
export function normalizeEmptyDirectionPaths(analysis) {
  const normalized = [];
  if (!supportedVersions.has(analysis?.direction_assessment_version)) return normalized;
  for (const dimension of ['human', 'planet', 'democracy']) {
    const item = analysis[dimension];
    if (!['chance', 'risiko', 'offen'].includes(item?.tendency)) continue;
    for (const key of ['positive_path', 'negative_path']) {
      const path = item[key];
      if (!path || typeof path !== 'object' || Array.isArray(path)
        || !(Object.keys(path).length === 2 || (Object.keys(path).length === 4 && path.effect_type === '' && path.reference === '')) || typeof path.mechanism !== 'string'
        || path.mechanism.trim() || !Array.isArray(path.source_ids) || path.source_ids.length) continue;
      item[key] = null;
      normalized.push(`${dimension}.${key}`);
    }
  }
  return normalized;
}
// Shape-only production diagnostics: never retain model text, source IDs or
// arbitrary object keys. A failed proof remains failed; this does not repair it.
export function directionInputDiagnostics(analysis, sources = []) {
  const sourceIds = new Set(sources.map(source => source.source_id));
  const pathShape = path => ({
    shape: valueShape(path),
    literal_null: typeof path === 'string' && path.trim().toLowerCase() === 'null',
    mechanism_shape: valueShape(path?.mechanism),
    mechanism_chars: typeof path?.mechanism === 'string' ? path.mechanism.trim().length : null,
    source_ids_shape: valueShape(path?.source_ids),
    source_ids_count: Array.isArray(path?.source_ids) ? path.source_ids.length : null,
    known_source_ids_count: Array.isArray(path?.source_ids) ? path.source_ids.filter(id => sourceIds.has(id)).length : null,
    effect_type_shape: valueShape(path?.effect_type),
    effect_type: effectTypes.includes(path?.effect_type) ? path.effect_type : null,
    reference_shape: valueShape(path?.reference),
    reference: references.includes(path?.reference) ? path.reference : null,
  });
  return Object.fromEntries(['human','planet','democracy'].map(key => {
    const item = analysis?.[key];
    return [key, {
      shape: valueShape(item),
      tendency: tendencies.has(item?.tendency) ? item.tendency : null,
      direction_basis: bases.has(item?.direction_basis) ? item.direction_basis : null,
      positive_path: pathShape(item?.positive_path),
      negative_path: pathShape(item?.negative_path),
    }];
  }));
}
const independentPath = path => path?.effect_type === 'independent_change' && path?.reference === 'assessment_baseline';
export function hasMixedPaths(item, { requireReference = false } = {}) {
  const paths = [item?.positive_path, item?.negative_path];
  return paths.every(path => substantive(path?.mechanism) && Array.isArray(path.source_ids)
    && path.source_ids.length > 0 && path.source_ids.every(id => typeof id === 'string' && id.trim()))
    && paths[0].mechanism.trim().toLowerCase() !== paths[1].mechanism.trim().toLowerCase()
    && (!requireReference || paths.every(independentPath));
}
export function directionAssessmentErrors(analysis, sources = [], { requireCurrent = false } = {}) {
  if (!requireCurrent && analysis?.direction_assessment_version === undefined) return [];
  const errors = [];
  if (!supportedVersions.has(analysis?.direction_assessment_version) || (requireCurrent && analysis?.direction_assessment_version !== DIRECTION_ASSESSMENT_VERSION)) errors.push('AI_DIRECTION_ASSESSMENT_REQUIRED');
  const requireReference = analysis?.direction_assessment_version === DIRECTION_ASSESSMENT_VERSION;
  if (requireReference && (!substantive(analysis.assessment_frame?.subject) || !substantive(analysis.assessment_frame?.baseline))) errors.push('AI_DIRECTION_REFERENCE_REQUIRED');
  const sourceIds = new Set(sources.map(source => source.source_id));
  if (requireReference && analysis.analysis_type === 'ex_post') {
    const outcome = analysis.observed_outcome;
    if (!substantive(outcome?.change) || !Array.isArray(outcome?.source_ids) || !outcome.source_ids.length || outcome.source_ids.some(id => !sourceIds.has(id)) || !['established', 'open'].includes(outcome?.attribution)) errors.push('AI_OBSERVED_OUTCOME_REQUIRED');
  }
  for (const key of ['human', 'planet', 'democracy']) {
    const item = analysis?.[key];
    if (!tendencies.has(item?.tendency)) errors.push(`AI_DIRECTION_INVALID:${key}`);
    if (!substantive(item?.rationale)) errors.push(`AI_DIRECTION_RATIONALE_REQUIRED:${key}`);
    if (!bases.has(item?.direction_basis) || (item.tendency === 'offen') !== (item.direction_basis !== 'assessed')) errors.push(`AI_DIRECTION_BASIS_INVALID:${key}`);
    if (item?.tendency === 'gemischt' && !hasMixedPaths(item, { requireReference })) errors.push(`AI_DIRECTION_MIXED_PATHS_REQUIRED:${key}`);
    if (requireReference) {
      const required = item?.tendency === 'gemischt' ? ['positive_path', 'negative_path'] : item?.tendency === 'chance' ? ['positive_path'] : item?.tendency === 'risiko' ? ['negative_path'] : [];
      for (const name of required) if (!independentPath(item?.[name])) errors.push(`AI_DIRECTION_INDEPENDENT_PATH_REQUIRED:${key}:${name}`);
    }
    for (const path of [item?.positive_path, item?.negative_path].filter(Boolean)) {
      if (!substantive(path.mechanism) || !Array.isArray(path.source_ids) || !path.source_ids.length
        || path.source_ids.some(id => !sourceIds.has(id))) errors.push(`AI_DIRECTION_PATH_SOURCE_INVALID:${key}`);
      if (requireReference && (!effectTypes.includes(path.effect_type) || !references.includes(path.reference))) errors.push(`AI_DIRECTION_PATH_REFERENCE_INVALID:${key}`);
    }
  }
  return [...new Set(errors)];
}
export const DIRECTION_NOTICES = {
  not_assessed: { label: 'Noch nicht eingeordnet', note: 'Für diese Dimension liegt in dieser Fassung keine Richtungsbewertung vor. Das ist kein neutrales Urteil.' },
  invalid: { label: 'Keine belastbare Bewertung', note: 'Aus der vorliegenden Einordnung lässt sich keine verlässliche Wirkungsrichtung ablesen.' },
  no_path: { label: 'Kein belastbarer Wirkpfad', note: 'Die Belege dieser Meldung tragen für diese Dimension keinen konkreten Wirkpfad. Das ist keine Bewertung des gesamten Themenfelds.' },
  unclear: { label: 'Wirkungsrichtung unklar', note: 'Die Richtung der Folgen dieser Entwicklung ist nicht hinreichend bestimmt. Das bedeutet weder neutral noch unbedenklich.' },
  unresolved_balance: { label: 'Keine belastbare Gesamtbilanz', note: 'Positive und negative Wirkpfade sind in dieser Fassung nicht getrennt abgesichert. Daraus folgt keine ausgeglichene oder neutrale Bilanz.' },
};
export function dimensionAssessment(analysis, key, legacyTendency = analysis?.visuals?.tendency) {
  const item = analysis?.[key] || {};
  const raw = item.tendency !== undefined ? item.tendency : legacyTendency?.[key];
  const value = typeof raw === 'string' ? raw.trim().toLowerCase() : raw;
  let status = 'assessed';
  if (raw === undefined) status = 'not_assessed';
  else if (!tendencies.has(value)) status = 'invalid';
  else if (value === 'offen') status = item.direction_basis === 'no_path' ? 'no_path' : 'unclear';
  else if (value === 'gemischt' && !hasMixedPaths(item, { requireReference: analysis?.direction_assessment_version === DIRECTION_ASSESSMENT_VERSION })) status = 'unresolved_balance';
  return { status, tendency: status === 'assessed' ? value : 'offen', ...DIRECTION_NOTICES[status] };
}
