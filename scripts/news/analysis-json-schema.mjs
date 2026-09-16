// Erzwungenes Antwortschema für den ersten Nachrichtenaufruf. Die Inventur über
// 37 Läufe (16.09.) zeigte: vier von fünf gehaltenen Meldungen scheiterten an
// fehlenden oder falsch getypten Feldern, nicht an fehlender Substanz. Ein
// striktes Schema macht genau das unmöglich: Jeder Schlüssel ist Pflicht, jeder
// Aufzählungswert festgelegt, Zusatzfelder verboten. Die Aufzählungen kommen aus
// denselben Modulen wie die Prüfung, damit Schema und Gate nicht auseinanderlaufen.
import { IMPACT_ASSESSMENT_JSON_SCHEMA } from './impact-json-schema.mjs';

export const ANALYSIS_SCHEMA_NAME = 'wirkungsticker_analyse_1';
// Beschreibungen tragen im Schema nichts zur Erzwingung bei; die Semantik steht
// in der Systemanweisung und im Prompt. Ohne sie bleibt das Schema klein.
export function stripDescriptions(node) {
  if (Array.isArray(node)) return node.map(stripDescriptions);
  if (!node || typeof node !== 'object') return node;
  const { description: _drop, ...rest } = node;
  return Object.fromEntries(Object.entries(rest).map(([key, value]) => [key, stripDescriptions(value)]));
}

const text = () => ({ type: 'string' });
const nullableText = () => ({ type: ['string', 'null'] });
const list = (items) => ({ type: 'array', items });
const enumOf = (values) => ({ type: 'string', enum: [...values] });
const object = (properties) => ({ type: 'object', additionalProperties: false, required: Object.keys(properties), properties });
const nullableObject = (properties) => ({ type: ['object', 'null'], additionalProperties: false, required: Object.keys(properties), properties });

export const STATUS_VALUES = ['angekündigt', 'Entwurf', 'beschlossen', 'in Kraft', 'laufende Umsetzung', 'erste Daten', 'evaluiert', 'laufende Entwicklung', 'offen'];
export const NEWS_STATUS_VALUES = ['developing', 'preliminary', 'confirmed', 'disputed', 'corrected', 'updated'];
export const IMPORTANCE_VALUES = ['gering', 'mittel', 'hoch', 'sehr hoch'];
export const NEWS_VALUE_VALUES = ['binding_decision', 'implementation', 'new_evidence', 'material_update', 'substantive_commitment', 'context_only'];
export const MATERIALITY_FACTORS = ['affected_scope', 'intensity', 'duration', 'reversibility', 'systemic_relevance', 'cascades', 'distribution', 'resilience', 'democratic_correctability', 'resonance'];
export const EVIDENCE_BASIS_VALUES = ['primary_source_direct', 'primary_source_with_caveats', 'independent_reports', 'attributed_single_source', 'insufficient'];
export const DUPLICATE_STATUS_VALUES = ['new_story', 'material_update', 'duplicate_without_new_information'];
export const CLAIM_STATUS_VALUES = ['single_source_claim', 'confirmed_claim', 'disputed_claim', 'primary_source_claim', 'uncertain_claim'];
export const REJECTION_CODES = ['not_material', 'no_new_information', 'insufficient_evidence', 'superseded'];

const eventClaim = object({
  claim: text(),
  claim_type: text(),
  temporal_status: enumOf(['ex_ante', 'ongoing', 'ex_post']),
  status: enumOf(CLAIM_STATUS_VALUES),
  attribution_required: { type: 'boolean' },
  attributed_to: nullableText(),
  headline_claim: { type: 'boolean' },
  headline_qualifier: nullableText(),
  evidence: list(object({ evidence_id: text() })),
});

const followup = object({
  claim: text(),
  source_id: text(),
  measurable_indicator: text(),
  expected_by: nullableText(),
  expected_by_evidence: nullableText(),
});

const publicationGate = object({
  news_value: enumOf(NEWS_VALUE_VALUES),
  materiality_factors: list(enumOf(MATERIALITY_FACTORS)),
  exceptional_factor: enumOf(['none', ...MATERIALITY_FACTORS]),
  evidence_basis: enumOf(EVIDENCE_BASIS_VALUES),
  duplicate_status: enumOf(DUPLICATE_STATUS_VALUES),
  rationale: text(),
});

// Reihenfolge wie im Prompt: Lesertexte und Gate zuerst, das umfangreichste
// Objekt zuletzt. Bei erzwungenem Schema kann nichts mehr wegfallen, die
// Reihenfolge bleibt aber für die Lesbarkeit der Rohantwort erhalten.
export const ANALYSIS_JSON_SCHEMA = object({
  story_id: text(),
  publication_recommendation: { type: 'boolean' },
  rejection: nullableObject({ code: enumOf(REJECTION_CODES), reason: text() }),
  headline: text(),
  news_status: enumOf(NEWS_STATUS_VALUES),
  publication_depth: enumOf(['initial', 'deepened']),
  event_claims: list(eventClaim),
  followups: list(followup),
  source_summary: text(),
  summary: text(),
  detail_summary: text(),
  why_relevant: text(),
  status: enumOf(STATUS_VALUES),
  analysis_type: enumOf(['ex_ante', 'monitoring', 'ex_post']),
  importance: enumOf(IMPORTANCE_VALUES),
  impact_potential: text(),
  impact_risks: list(text()),
  mechanisms: list(text()),
  first_order: list(text()),
  second_order: list(text()),
  third_order: list(text()),
  systemic_relevance: text(),
  transformation_potential: text(),
  resilience: text(),
  side_effects: list(text()),
  uncertainties: list(text()),
  evidence_level: text(),
  attribution: text(),
  watch_next: list(text()),
  reference_frameworks: list(text()),
  publication_gate: publicationGate,
  // Bild- und Medienanalyse bleiben in diesem Aufruf leer: visuals sind
  // freiwillig und werden ohnehin verschoben, media_impact entsteht nur bei
  // lokal erkanntem Medienanlass und dann ohne Schemazwang.
  visuals: { type: 'null' },
  media_impact: { type: 'null' },
  impact_assessment: stripDescriptions(IMPACT_ASSESSMENT_JSON_SCHEMA),
});

// Ein Aufruf trägt genau eine Meldung (Stapelgröße 1). Die Analyse ist deshalb
// selbst die Wurzel: zwei Verschachtelungsebenen weniger als eine Liste, und
// die Antwort ist eindeutig. Der Transport verpackt sie wieder in analyses.
export function analysisResponseFormat(name = ANALYSIS_SCHEMA_NAME) {
  return { type: 'json_schema', name, strict: true, schema: ANALYSIS_JSON_SCHEMA };
}

// Der Medienanlass wird lokal erkannt; nur dann braucht die Antwort das freie
// media_impact-Objekt und läuft ohne Schema.
export const schemaEligible = (stories = []) => stories.length > 0
  && stories.every((story) => !story?.media_trigger?.relevant && !story?.preanalysis?.media_trigger?.relevant);
