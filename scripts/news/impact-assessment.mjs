// Canonical semantics for every ticker surface. No provider calls and no
// inference of magnitude from relevance, evidence, topic or party identity.
export const IMPACT_VERSION = '2.0';
export const IMPACT_KEYS = ['human', 'planet', 'democracy'];
export const DIRECTIONS = ['positive', 'negative', 'neutral', 'ambivalent', 'open', 'not_material'];
export const TEMPORAL = ['ex_ante', 'ongoing', 'ex_post'];
export const TARGET_TYPES = ['measure', 'decision', 'law', 'proposal', 'event', 'development', 'communication', 'narrative', 'institution', 'technology', 'dossier', 'other'];
export const EVIDENCE = { high: 'hoch', medium: 'mittel', low: 'gering', not_assessable: 'nicht bewertbar' };
export const DATA_STATUS = ['measured', 'observed', 'modelled', 'estimated', 'secondary_source', 'missing'];
export const MAGNITUDE = ['keine materielle Betroffenheit', 'gering', 'begrenzt', 'deutlich', 'hoch', 'sehr hoch'];
export const IMPACT_LEGEND = 'Balken = Tragweite · +/− = Richtung · Potenzial/Risiko = noch nicht eingetreten · beobachtet = belegte Zustandsveränderung';
export const IMPACT_RULE = 'impact_assessment 2.0 ist das führende MPD-Profil. Zuerst Nachrichtenanlass, sachlichen Wirkungsgegenstand, Vergleich, Zeitstatus, Empfänger und Wirkpfad bestimmen; dann Richtung, Tragweite, Evidenz und Gegenpfade prüfen. Politische Forderung: vorgeschlagene Maßnahme bedingt bewerten, Äußerung nur bei tatsächlichem Kommunikationsgegenstand. Dossier-Gegenstand beim Einzelupdate erhalten. Tragweite 0=keine materielle Betroffenheit,1=gering,2=begrenzt,3=deutlich,4=hoch,5=sehr hoch; unbekannt=null. Keine Ableitung aus Relevanz/Evidenz. Systemrelevanz separat. open≠neutral≠not_material; fehlende Daten nie0. Pro Dimension Zeitstatus: ex_ante=Potenzial/Risiko, ongoing=laufende Prüfung, ex_post nur mit beobachteter Zustandsänderung und source_ids; Schaden mit Toten/Verletzten nicht als bloßes Zukunftsrisiko darstellen. Ein Beschluss ist kein Folgenbeleg. Positive/negative Hauptpfade, Nebenpfade und Evidenz getrennt. Kleineres/schwächer belegtes Nebenrisiko ändert keine dominante Hauptrichtung. ambivalent nur bei materiellen positiven und negativen Hauptpfaden desselben Gegenstands und Vergleichs mit vergleichbarer Tragweite, begründetem Zielkonflikt und ohne entscheidende Schutzgrenze. Keine MPD-Mittelwerte; Nichtkompensation/Reverse Merit Order. Alle source_ids aus gelieferten Quellen, keine erfundenen Belege.';
const pathSchema = {
  direction: 'positive|negative', label: 'konkrete Zustandsänderung', mechanism: 'Wirkmechanismus',
  recipients: ['Wirkungsempfänger'], magnitude: '0|1|2|3|4|5|null (Zahl/null)', evidence: 'high|medium|low|not_assessable',
  temporal_status: 'ex_ante|ongoing|ex_post', material: true, same_target: true, same_baseline: true,
  source_ids: ['source_id'], condition: 'Bedingung/Zeithorizont',
};
export const IMPACT_DIMENSION_SCHEMA = {
  direction: DIRECTIONS.join('|'), magnitude: '0|1|2|3|4|5|null (Zahl/null)', evidence: Object.keys(EVIDENCE).join('|'),
  data_status: DATA_STATUS.join('|'), temporal_status: TEMPORAL.join('|'),
  primary_paths: [{ $ref: '#/$defs/impact_path' }], secondary_paths: [{ $ref: '#/$defs/impact_path' }],
  rationale: 'Begründung, auch für neutral/not_material/open',
  observed_outcome: { change: 'eingetretene Zustandsänderung, sonst Objekt null', source_ids: ['source_id'], attribution: 'established|open' },
  balance: { comparable_material_paths: false, protection_boundary_decisive: false, rationale: 'Abwägung, bei ambivalent Pflicht; sonst Objekt null' },
};
export const IMPACT_SCHEMA = {
  version: IMPACT_VERSION, news_event: 'konkreter Nachrichtenanlass',
  evaluation_target: { label: 'sachlicher Wirkungsgegenstand', type: TARGET_TYPES.join('|') },
  baseline: 'Vergleichszustand', temporal_status: TEMPORAL.join('|'), systemic_relevance: 'low|medium|high|very_high|null',
  dimensions: Object.fromEntries(IMPACT_KEYS.map(key => [key, { $ref: '#/$defs/impact_dimension' }])),
};
export const IMPACT_DEFS = { impact_dimension: IMPACT_DIMENSION_SCHEMA, impact_path: pathSchema };
const text = value => typeof value === 'string' && value.trim().length >= 12;
const magnitude = value => Number.isInteger(value) && value >= 0 && value <= 5;
const list = value => Array.isArray(value) ? value : [];
const signed = value => ['positive', 'negative'].includes(value);

// Validation examines raw data before any display fallback can conceal a bad
// verdict. A low-evidence but sourced potential can retain magnitude five.
export function impactAssessmentErrors(assessment, sources = [], { required = false } = {}) {
  if (!assessment) return required ? ['IMPACT_ASSESSMENT_REQUIRED'] : [];
  const errors = [], fail = code => errors.push(code);
  const sourceIds = new Set(sources.map(source => source.source_id));
  const grounded = ids => Array.isArray(ids) && ids.length > 0 && ids.every(id => typeof id === 'string' && sourceIds.has(id));
  if (assessment.version !== IMPACT_VERSION) fail('IMPACT_VERSION_INVALID');
  if (!text(assessment.news_event) || !text(assessment.evaluation_target?.label) || !TARGET_TYPES.includes(assessment.evaluation_target?.type) || !text(assessment.baseline)) fail('IMPACT_TARGET_REQUIRED');
  if (!TEMPORAL.includes(assessment.temporal_status)) fail('IMPACT_TIME_REQUIRED');
  if (![null, 'low', 'medium', 'high', 'very_high'].includes(assessment.systemic_relevance)) fail('IMPACT_RELEVANCE_INVALID');
  for (const key of IMPACT_KEYS) {
    const d = assessment.dimensions?.[key];
    if (!d || !DIRECTIONS.includes(d.direction) || !TEMPORAL.includes(d.temporal_status) || !Object.hasOwn(EVIDENCE, d.evidence) || !DATA_STATUS.includes(d.data_status)) { fail(`IMPACT_DIMENSION_INVALID:${key}`); continue; }
    if (d.magnitude !== null && !magnitude(d.magnitude)) fail(`IMPACT_MAGNITUDE_INVALID:${key}`);
    if (!text(d.rationale)) fail(`IMPACT_RATIONALE_REQUIRED:${key}`);
    if (d.data_status === 'missing' && (d.direction !== 'open' || d.magnitude !== null || d.evidence !== 'not_assessable')) fail(`IMPACT_MISSING_IS_OPEN:${key}`);
    if (d.direction === 'neutral' && (d.evidence === 'not_assessable' || d.data_status === 'missing')) fail(`IMPACT_NEUTRAL_UNSUPPORTED:${key}`);
    if (d.direction === 'not_material' && (d.magnitude !== 0 || d.evidence === 'not_assessable' || list(d.primary_paths).length)) fail(`IMPACT_NOT_MATERIAL_UNSUPPORTED:${key}`);
    if (d.direction !== 'not_material' && d.magnitude === 0 && !['neutral'].includes(d.direction)) fail(`IMPACT_ZERO_UNSUPPORTED:${key}`);
    if (!Array.isArray(d.primary_paths) || !Array.isArray(d.secondary_paths)) fail(`IMPACT_PATHS_REQUIRED:${key}`);
    const primary = list(d.primary_paths), all = [...primary, ...list(d.secondary_paths)];
    for (const p of all) {
      if (!signed(p?.direction) || !text(p.label) || !text(p.mechanism) || !list(p.recipients).some(text) || !TEMPORAL.includes(p.temporal_status)
        || !Object.hasOwn(EVIDENCE, p.evidence) || (p.magnitude !== null && !magnitude(p.magnitude)) || !grounded(p.source_ids) || typeof p.material !== 'boolean'
        || typeof p.same_target !== 'boolean' || typeof p.same_baseline !== 'boolean' || !text(p.condition)) fail(`IMPACT_PATH_INVALID:${key}`);
    }
    if (signed(d.direction) && !primary.some(p => p.direction === d.direction && p.material && p.same_target && p.same_baseline)) fail(`IMPACT_MAIN_PATH_REQUIRED:${key}`);
    if (signed(d.direction) && primary.some(p => p.direction !== d.direction)) fail(`IMPACT_MAIN_DIRECTION_CONFLICT:${key}`);
    if (signed(d.direction) && d.magnitude !== null && !primary.some(p => p.direction === d.direction && p.magnitude === d.magnitude)) fail(`IMPACT_MAGNITUDE_PATH_MISMATCH:${key}`);
    if (d.direction === 'ambivalent') {
      const relevant = primary.filter(p => p.material && p.same_target && p.same_baseline && magnitude(p.magnitude) && p.magnitude > 0 && p.evidence !== 'not_assessable');
      if (!['positive', 'negative'].every(sign => relevant.some(p => p.direction === sign)) || d.balance?.comparable_material_paths !== true || d.balance?.protection_boundary_decisive !== false || !text(d.balance?.rationale)) fail(`IMPACT_AMBIVALENCE_UNSUPPORTED:${key}`);
    }
    if (d.temporal_status === 'ex_post' || all.some(p => p.temporal_status === 'ex_post')) {
      if (!text(d.observed_outcome?.change) || !grounded(d.observed_outcome?.source_ids) || !['established', 'open'].includes(d.observed_outcome?.attribution)
        || !['measured', 'observed', 'secondary_source'].includes(d.data_status) || d.evidence === 'not_assessable') fail(`IMPACT_OBSERVED_OUTCOME_REQUIRED:${key}`);
    }
    if (d.temporal_status === 'ex_ante' && primary.some(p => p.temporal_status === 'ex_post')) fail(`IMPACT_OBSERVED_LABEL_CONFLICT:${key}`);
  }
  return [...new Set(errors)];
}

// Conservative compatibility projection. Original analysis and journalistic
// content remain immutable; migration records what could not be established.
export function migrateImpactAssessment(analysis = {}, context = {}) {
  if (analysis.impact_assessment?.version === IMPACT_VERSION) return structuredClone(analysis.impact_assessment);
  const old = analysis.subject_dimensions || analysis;
  const temporal = ({ monitoring: 'ongoing', ex_ante: 'ex_ante', ex_post: 'ex_post' })[analysis.analysis_type] || 'ongoing';
  const missing = [];
  const dimensions = Object.fromEntries(IMPACT_KEYS.map(key => {
    const item = old[key] || {}, reasons = [];
    // A 1.2 directional path can be preserved, but never its relevance score.
    const role = item.tendency === 'chance' ? 'positive_path' : item.tendency === 'risiko' ? 'negative_path' : null;
    const p = role && item[role];
    let direction = p?.effect_role === 'substantive_change' && p.reference === 'assessment_baseline' && text(p.mechanism) && p.source_ids?.length
      && text(analysis.assessment_frame?.subject) && text(analysis.assessment_frame?.baseline) ? (role === 'positive_path' ? 'positive' : 'negative') : 'open';
    // Older observed records lack dimension-specific proof. Preserve the
    // original outcome separately and request reassessment rather than
    // relabelling an occurred harm as future risk.
    if (temporal === 'ex_post') direction = 'open';
    const oldMagnitude = ({ low: 1, medium: 3, high: 4, very_high: 5 })[item.magnitude];
    const level = oldMagnitude ?? null; // Explicit old strength only, not relevance.
    reasons.push(...(level === null ? ['magnitude'] : []), 'evidence', 'dimension_temporal_status');
    if (direction === 'open') reasons.push('direction_and_materiality');
    missing.push(...reasons.map(reason => `${key}.${reason}`));
    const legacyPath = path => ({ direction: path === item.positive_path ? 'positive' : 'negative', label: path.state_change || path.mechanism, mechanism: path.mechanism,
      recipients: [], magnitude: null, evidence: 'not_assessable', temporal_status: temporal, material: true, same_target: true, same_baseline: path.reference === 'assessment_baseline',
      source_ids: path.source_ids || [], condition: path.condition || '' });
    return [key, { direction, magnitude: level, evidence: 'not_assessable', data_status: 'secondary_source', temporal_status: temporal,
      primary_paths: signed(direction) ? [legacyPath(p)] : [], secondary_paths: [item.positive_path, item.negative_path].filter(path => text(path?.mechanism) && path !== (signed(direction) ? p : null)).map(legacyPath),
      rationale: item.rationale || 'Die vorhandenen Angaben reichen für eine belastbare Einordnung nicht aus.', observed_outcome: null, balance: null }];
  }));
  const target = context.evaluation_target || analysis.assessment_frame?.subject;
  if (!target) missing.push('evaluation_target');
  return { version: IMPACT_VERSION, news_event: context.news_event || context.title || '', evaluation_target: {
    label: typeof target === 'object' ? target.label : target || '', type: typeof target === 'object' ? target.type : ({ proposed_measure: 'proposal', implemented_measure: 'measure', event: 'event', communication: 'communication' })[analysis.assessment_frame?.object_kind] || 'other',
  }, baseline: analysis.assessment_frame?.baseline || '', temporal_status: temporal,
  systemic_relevance: ({ gering: 'low', mittel: 'medium', hoch: 'high', 'sehr hoch': 'very_high' })[analysis.importance] || null,
  dimensions, review: { status: 'needs_reassessment', missing, legacy_version: analysis.direction_assessment_version || analysis.editorial_rules_version || null } };
}

export function deriveImpactPresentation(input = {}, context = {}) {
  const analysis = input.analysis || input;
  const assessment = input.version === IMPACT_VERSION && input.dimensions ? input : input.impact_assessment || migrateImpactAssessment(analysis, { title: input.title, ...context });
  const timeLabels = { ex_ante: 'Ex ante', ongoing: 'Laufende Prüfung', ex_post: 'Ex post' };
  const dimensions = Object.fromEntries(IMPACT_KEYS.map(key => {
    const d = assessment.dimensions?.[key] || {};
    let direction = DIRECTIONS.includes(d.direction) ? d.direction : 'open';
    const time = TEMPORAL.includes(d.temporal_status) ? d.temporal_status : assessment.temporal_status;
    const observed = time === 'ex_post' && text(d.observed_outcome?.change) && d.observed_outcome?.source_ids?.length;
    if (time === 'ex_post' && !observed && signed(direction)) direction = 'open';
    const short = { neutral: 'neutral', ambivalent: '± gegenläufig', open: '? offen', not_material: 'kein wesentlicher Wirkpfad' }[direction]
      || (observed ? `${direction === 'positive' ? '+' : '−'} beobachtet` : time === 'ex_ante' ? direction === 'positive' ? '+ Potenzial' : '− Risiko' : `${direction === 'positive' ? '+' : '−'} laufend geprüft`);
    const level = magnitude(d.magnitude) ? d.magnitude : null;
    return [key, { ...d, direction, magnitude: level, temporal_status: time, label: short, magnitude_label: level === null ? 'Tragweite offen' : MAGNITUDE[level], evidence_label: EVIDENCE[d.evidence] || EVIDENCE.not_assessable,
      time_label: timeLabels[time] || 'Zeitstatus offen', long_label: direction === 'not_material' ? 'Kein wesentlicher Wirkpfad identifiziert.' : short,
    }];
  }));
  return { ...assessment, dimensions, time_label: timeLabels[assessment.temporal_status] || 'Zeitstatus offen', relevance_label: ({ low: 'Geringe', medium: 'Mittlere', high: 'Hohe', very_high: 'Sehr hohe' })[assessment.systemic_relevance] || null,
    show_target: Boolean(assessment.evaluation_target?.label && assessment.evaluation_target.label.trim().toLowerCase() !== assessment.news_event?.trim().toLowerCase()), legend: IMPACT_LEGEND };
}
