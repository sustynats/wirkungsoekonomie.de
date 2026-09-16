// Strict JSON schema for impact_assessment 2.1, used only for the targeted
// follow-up call: the model completes the reader texts and then omits whole
// dimensions or single required keys (rationale, balance, research_pass) in
// roughly half of all answers. A schema-bound answer cannot omit a key, so the
// deterministic gate sees a complete object and only judges the content.
// The enums come from the contract modules so schema and gate cannot drift.
import { DIRECTIONS, DOMINANCE, DATA_STATUS, EVIDENCE, IMPACT_KEYS, LIKELIHOOD, TARGET_TYPES, TEMPORAL, IMPACT_VERSION } from './impact-assessment.mjs';
import { FACTOR_KEYS } from './impact-magnitude.mjs';
import { PATH_QUALITIES, POTENTIAL_REVISION } from './impact-potential.mjs';

export const SCHEMA_NAME = 'wirkungspotenzial_2_1';
const text = (description) => ({ type: 'string', description });
const nullableText = (description) => ({ type: ['string', 'null'], description });
const list = (items, description) => ({ type: 'array', items, description });
const enumOf = (values, description) => ({ type: 'string', enum: [...values], description });
const score = (description) => ({ type: 'integer', enum: [0, 1, 2, 3, 4, 5], description });
// Strict mode requires every property to be listed in required and forbids
// additional properties; optional editorial fields are expressed as nullable.
const object = (properties, description) => ({ type: 'object', additionalProperties: false, required: Object.keys(properties), properties, description });

const factor = object({
  value: score('0..5'),
  rationale: text('Begründete Einordnung im definierten Wirkungsraum, mindestens zwölf Zeichen.'),
  source_ids: list(text('gelieferte source_id'), 'Belege aus den gelieferten Quellen, nicht leer.'),
}, 'Ein offengelegter ordinaler Faktor.');

const protectionBoundary = object({
  decisive: { type: 'boolean', description: 'Nur bei belegter schwerer Schutzgrenzverletzung auf einem negativen Pfad true.' },
  rationale: text('Objektspezifische Prüfung der Schutzgrenze.'),
  reference_frame: nullableText('Konkretes Schutzgut, wenn decisive true ist, sonst null.'),
  source_ids: list(text('gelieferte source_id'), 'Belege, wenn decisive true ist, sonst leer.'),
  status: enumOf(['observed', 'conditional', 'not_decisive'], 'ex_ante höchstens conditional; not_decisive wenn decisive false.'),
}, 'Schutzprüfung je Pfad.');

const path = object({
  label: text('Konkrete mögliche Zustandsänderung.'),
  direction: enumOf(['positive', 'negative', 'neutral', 'open'], 'Richtung dieses Pfads.'),
  type: enumOf(['main_path', 'counter_path', 'side_effect', 'side_risk'], 'primary_paths nur main_path oder counter_path.'),
  mechanism: text('Wirkmechanismus.'),
  recipients: list(text('Wirkungsempfänger'), 'Mindestens ein Empfänger.'),
  magnitude: score('Aus den sechs Faktoren; der Server rechnet nach.'),
  magnitude_range: object({ lower: score('untere Grenze'), upper: score('obere Grenze'), rationale: text('Begründete Bandbreite, kein Konfidenzintervall.') }, 'Plausible Bandbreite, schließt magnitude ein.'),
  magnitude_factors: object(Object.fromEntries(FACTOR_KEYS.map((key) => [key, factor])), 'Alle sechs Faktoren R/I/D/U/V/S.'),
  protection_boundary: protectionBoundary,
  evidence: enumOf(Object.keys(EVIDENCE), 'Evidenzlage dieses Pfads.'),
  likelihood: enumOf(Object.keys(LIKELIHOOD), 'Eintrittseinschätzung, unknown erlaubt.'),
  temporal_status: enumOf(['ex_ante', 'ongoing'], 'ongoing nur mit beobachtetem Signal.'),
  same_target: { type: 'boolean', description: 'Derselbe Bewertungsgegenstand.' },
  same_baseline: { type: 'boolean', description: 'Derselbe Vergleichszustand.' },
  source_ids: list(text('gelieferte source_id'), 'Quellenbindung des Pfads, nicht leer.'),
  condition: text('Notwendige Bedingungen.'),
  reference_space: text('Abgegrenzter Wirkungsraum.'),
  time_horizon: text('Zeitraum der möglichen Veränderung.'),
  path_quality: list(enumOf(PATH_QUALITIES, 'Pfadeigenschaft'), 'Mindestens eine Eigenschaft.'),
  epistemic_basis: enumOf(['supported_mechanism', 'model_hypothesis'], 'model_hypothesis nur mit evidence low oder not_assessable.'),
  assumptions: text('Offengelegte Modellannahmen.'),
  source_support: text('Was die Quellen tatsächlich belegen.'),
  limitations: text('Wissensgrenzen und Gegenannahmen.'),
  first_order: text('Direkter möglicher Folgepfad.'),
  second_order: text('Indirekte Folge mit Bedingungen.'),
  third_order: text('Systemischer Folgepfad mit Bedingungen.'),
  research_pass: enumOf(['initial', 'second_pass'], 'Bei geringer Evidenz oder hoher Unsicherheit second_pass.'),
  research_result: nullableText('Ergebnis oder Wissensgrenze; bei second_pass Pflicht.'),
  negligibility_rationale: nullableText('Bei magnitude 0 Pflicht, sonst null.'),
  observed_signal: { type: ['object', 'null'], additionalProperties: false, required: ['change', 'source_ids'],
    properties: { change: text('Tatsächlich beobachtetes Signal.'), source_ids: list(text('gelieferte source_id'), 'Belege des Signals.') },
    description: 'Bei temporal_status ongoing Pflicht, sonst null.' },
}, 'Ein bedingter Wirkpfad.');

const dimension = object({
  path_status: enumOf(['modelled'], 'Neue Veröffentlichungen: immer modelled.'),
  direction: enumOf(DIRECTIONS, 'Aggregierte Richtung der Hauptpfade.'),
  dominance: enumOf(DOMINANCE, 'Dominanz der Hauptpfade.'),
  magnitude: score('Aggregierte Tragweite der Hauptpfade.'),
  evidence: enumOf(Object.keys(EVIDENCE), 'Evidenzlage der Dimension.'),
  likelihood: enumOf(Object.keys(LIKELIHOOD), 'Eintrittseinschätzung der Dimension.'),
  data_status: enumOf(['modelled', 'estimated'], 'Datenlage der Modellierung.'),
  temporal_status: enumOf(['ex_ante', 'ongoing'], 'ongoing nur mit beobachtetem Signal auf einem Hauptpfad.'),
  research_pass: enumOf(['initial', 'second_pass'], 'Rechercheschritt der Dimension.'),
  research_result: nullableText('Rechercheergebnis oder Wissensgrenze.'),
  reviewed_source_ids: list(text('gelieferte source_id'), 'Geprüfte Quellen dieser Dimension.'),
  rationale: text('Begründung des Potenzials, Pflichtfeld.'),
  primary_paths: list(path, 'Mindestens ein Hauptpfad, nur main_path oder counter_path.'),
  secondary_paths: list(path, 'Neben- und Gegenpfade, darf leer sein.'),
  balance: { type: ['object', 'null'], additionalProperties: false, required: ['comparable_material_paths', 'protection_boundary_decisive', 'rationale'],
    properties: { comparable_material_paths: { type: 'boolean', description: 'Vergleichbar starke materielle Pfade.' },
      protection_boundary_decisive: { type: 'boolean', description: 'Maßgebliche Schutzgrenze.' },
      rationale: text('Abwägung der Hauptpfade.') },
    description: 'Bei direction mixed oder maßgeblicher Schutzgrenze Pflicht, sonst null.' },
}, 'Eine modellierte MPD-Dimension.');

const observedEffect = object({
  dimension: enumOf(IMPACT_KEYS, 'Betroffene Dimension.'),
  change: text('Belegte eingetretene Zustandsveränderung.'),
  direction: enumOf(DIRECTIONS, 'Richtung der beobachteten Veränderung.'),
  source_ids: list(text('gelieferte source_id'), 'Belege der Veränderung.'),
  data_status: enumOf(['measured', 'observed', 'secondary_source'], 'Belegart.'),
  evidence: enumOf(['high', 'medium', 'low'], 'not_assessable ist hier unzulässig.'),
  attribution: enumOf(['established', 'open'], 'Ursachenzurechnung.'),
  reference_frame: text('Bewertungsmaßstab.'),
  reference_space: text('Betroffene Empfänger und Raum.'),
  observed_at: text('Belegter Zeitpunkt oder Zeitraum.'),
  temporal_status: enumOf(['ongoing', 'ex_post'], 'Beobachtete Wirkung.'),
  mechanism: text('Belegter Mechanismus oder attribuierte Erklärung.'),
  recipients: list(text('betroffene Empfänger'), 'Mindestens ein Empfänger.'),
  time_horizon: text('Zeitwirkung des beobachteten Zustands.'),
  magnitude: score('Tragweite aus den Faktoren.'),
  magnitude_factors: object(Object.fromEntries(FACTOR_KEYS.map((key) => [key, factor])), 'Alle sechs Faktoren.'),
  protection_boundary: protectionBoundary,
  same_target: { type: 'boolean', description: 'Derselbe Bewertungsgegenstand.' },
  same_baseline: { type: 'boolean', description: 'Derselbe Vergleichszustand.' },
}, 'Eine belegte eingetretene Veränderung, getrennt vom Potenzial.');

export const IMPACT_ASSESSMENT_JSON_SCHEMA = object({
  version: enumOf([IMPACT_VERSION], 'Vertragsversion.'),
  semantics_revision: enumOf([POTENTIAL_REVISION], 'Semantikstand.'),
  news_event: text('Konkreter Nachrichtenanlass.'),
  evaluation_target: object({ label: text('Sachlicher Wirkungsgegenstand.'), type: enumOf(TARGET_TYPES, 'Art des Gegenstands.') }, 'Bewertungsgegenstand, nicht der Anlass.'),
  baseline: text('Vergleichszustand.'),
  counterfactual: text('Was ohne die Maßnahme voraussichtlich geschieht.'),
  reference_frame: list(text('Schutz- oder Referenzrahmen'), 'Mindestens ein Rahmen.'),
  temporal_status: enumOf(TEMPORAL, 'Prüfzeitpunkt des Gesamtobjekts.'),
  systemic_relevance: { type: ['string', 'null'], enum: ['low', 'medium', 'high', 'very_high', 'critical', null], description: 'Systemrelevanz, niemals als MPD-Balken.' },
  system_check: object({
    cross_dimension_review: object(Object.fromEntries(IMPACT_KEYS.map((key) => [key, text(`Verbundene Folgen im Wirkungsraum ${key} konkret begründen.`)])), 'Alle drei Räume begründen.'),
    central_dimensions: list(enumOf(IMPACT_KEYS, 'Dimension'), 'Zentrale Dimensionen dieses Gegenstands.'),
    first_order: text('Unmittelbare Veränderung.'),
    second_order: text('Nachgelagerte Folge mit Grenzen.'),
    third_order: text('Systemische Folge mit Grenzen.'),
    enablement: list(text('Ermöglichungswirkung oder leer'), 'Macht-/Institutionenwirkungen, darf leer sein.'),
    counter_evidence: list(text('materielle Gegenevidenz'), 'Mindestens ein Eintrag.'),
    source_independence: text('Unabhängigkeit der Belege.'),
    institutional_status: text('Zuständigkeiten und rechtlicher Status.'),
  }, 'Systemprüfung.'),
  research_check: object({
    status: enumOf(['completed', 'needs_research'], 'completed nur mit tatsächlich durchgeführter Prüfung.'),
    gaps: list(text('konkrete Wissenslücke'), 'Darf leer sein.'),
    searches: list(object({ question: text('Konkrete Wirkungsfrage.'), result: text('Ergebnis oder begründete Wissensgrenze.'), source_ids: list(text('gelieferte source_id'), 'Nur gelieferte Quellen.') }, 'Eine gezielte Prüfung.'), 'Mindestens eine Prüfung.'),
    source_functions: list(object({ source_id: text('gelieferte source_id'), functions: list(enumOf(['event', 'mechanism', 'reference', 'counter_evidence'], 'Quellenfunktion'), 'Mindestens eine Funktion.'), supported_claim: text('Welche Aussage die Quelle trägt.') }, 'Funktion einer genutzten Quelle.'), 'Für jede genutzte Quelle.'),
  }, 'Rechercheprüfung, zweiter Pass in diesem Durchgang.'),
  dimensions: object(Object.fromEntries(IMPACT_KEYS.map((key) => [key, dimension])), 'Mensch, Planet und Demokratie, alle drei modelliert.'),
  observed_effects: list(observedEffect, 'Belegte eingetretene Veränderungen, darf leer sein.'),
}, 'Wirkungspotenzial nach Vertrag 2.1.');

// The follow-up asks for one assessment, so the object itself is the root:
// one nesting level less (the provider allows ten) and an unambiguous answer.
export function impactAssessmentResponseFormat(name = SCHEMA_NAME) {
  return { type: 'json_schema', name, strict: true, schema: IMPACT_ASSESSMENT_JSON_SCHEMA };
}
