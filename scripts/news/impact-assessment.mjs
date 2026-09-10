// Canonical semantics for every ticker surface. No provider calls and no
// inference of magnitude from relevance, evidence, topic or party identity.
import { MAGNITUDE_PATH_SCHEMA, MAGNITUDE_FACTORS, pathwayMagnitudeErrors, aggregateMainPaths, calculateMagnitude } from './impact-magnitude.mjs';
import { POTENTIAL_REVISION, PATH_QUALITIES, potentialDimensionErrors, deriveStatusPresentation } from './impact-potential.mjs';
export const IMPACT_VERSION = '2.1';
export const IMPACT_CONTRACT_FILE = 'impact-assessment-contract-2.1-potential-1.json';
export const IMPACT_KEYS = ['human', 'planet', 'democracy'];
export const DIRECTIONS = ['positive', 'negative', 'neutral', 'mixed', 'open'];
export const PATH_STATUS = ['modelled'];
export const LIKELIHOOD = { very_low: 'sehr gering', low: 'gering', medium: 'mittel', high: 'hoch', very_high: 'sehr hoch', already_occurring: 'bereits eingetreten', unknown: 'nicht belastbar bestimmt' };
export const DOMINANCE = ['dominant_positive', 'dominant_negative', 'balanced', 'none'];
export const TEMPORAL = ['ex_ante', 'ongoing', 'ex_post'];
export const TARGET_TYPES = ['measure', 'decision', 'law', 'proposal', 'event', 'development', 'communication', 'narrative', 'institution', 'technology', 'dossier', 'other'];
export const EVIDENCE = { high: 'hoch', medium: 'mittel', low: 'gering', not_assessable: 'nicht bewertbar' };
export const DATA_STATUS = ['measured', 'observed', 'modelled', 'estimated', 'secondary_source', 'missing'];
export const MAGNITUDE = ['praktisch vernachlässigbar im betrachteten Raum und Zeitraum', 'sehr gering', 'begrenzt', 'deutlich', 'hoch', 'sehr hoch'];
export const IMPACT_LEGEND = 'Ring = Status · Balken = Stärke / Tragweite · +/− = Richtung';
const BASE_IMPACT_RULE = "impact_assessment 2.1: Anlass≠Gegenstand≠Vergleich. Zuerst Empfänger/Mechanismus/Zeit, dann Richtung/Tragweite/Eintritt/Evidenz/Gegenpfade. Politische Forderung: Maßnahme bewerten, Kommunikation nur bei Kommunikationsgegenstand. Dossier-Gegenstand bei Updates erhalten. Systemrelevanz niemals MPD-Balken. JEDE reguläre Meldung braucht für ALLE DREI Dimensionen mindestens einen modellierten Potenzialpfad und eine numerische Tragweite0..5. path_status=modelled. not_material/insufficient_basis/no_path/null sind keine Abschlussbefunde. 0=begründete praktisch vernachlässigbare Zustandsveränderung im definierten Raum/Zeitraum; der Pfad bleibt dokumentiert. open betrifft nur die Richtung, nie die Existenz oder Tragweite. magnitude nie aus Relevanz/Evidenz/Eintritt ableiten. open≠neutral; offene Richtung≠fehlender Pfad; Zukunft unsicher≠Richtung offen. likelihood separat, unknown erlaubt, keine erfundenen Prozente. Hauptpfade bleiben ex_ante oder ongoing als Potenzial/Risiko; der Prüfzeitpunkt des Gesamtobjekts darf ex_post sein. Tatsächlich eingetretene Veränderungen separat als observed_effects mit Zustandsbeleg/source_ids und offener oder begründeter Attribution speichern. Keine beobachtete Verletzung bloß in Risiko umbenennen und keine Prognose rückwirkend erfinden. Tote/Verletzte sind Schaden; Beschluss kein Folgenbeleg. Haupt-/Gegen-/Nebenpfade trennen; kleines Nebenrisiko ändert keine Hauptrichtung. Schutzplanke, Restschaden, Risikominderung, besserer Entwurf und fremder Nutzen sind kein Ausgleich gegenüber Nichteingriff. Kooperation: Mehrheits-/Amts-/Personal-/Budget-/Institutionenmacht/Normalisierung prüfen. Energie: EE-Ausbau/Hürden/Netze/Speicher vs fossile Lock-ins/Emissionen/Importabhängigkeit. Programm≠Folgenbeweis; keine Überzeichnung. Jeden modellierten Pfad auf verbundene Folgen in den anderen MPD-Räumen prüfen. Energie/Klima: auch bezahlbare Versorgung, Beschäftigung, Gesundheit, Klimafolgen und ungleiche Belastungen für Menschen; kurz-/langfristige Pfade getrennt. Keine Dimension allein aus dem Ressort oder aus fehlender Folgennennung im Ausgangsartikel ausschließen. system_check.cross_dimension_review für Mensch, Planet und Demokratie konkret begründen. system_check: Ordnungen1–3, zentrale Dimensionen, Gegenevidenz, unabhängige Quellen, Rechtsstatus; baseline/counterfactual/reference_frame explizit. Quellenfunktionen Ereignis,Mechanismus/Kontext,Referenz,Gegenevidenz trennen. Ausgangsnachricht belegt nicht zwingend alle Folgen. Fehlende Grundlage: gezielte Wirkungsrecherche, keine erfundenen Quellen/Fakten. Neue research_sources mit URL,Funktion,kurzem Belegauszug; Quellenprüfung und unabhängiger Fachpass müssen bestätigen.";
export const MAGNITUDE_RULE = 'Pro modelliertem Pfad sechs Faktoren 0..5 mit Begründung und Beleg-IDs: R Reichweite, I Intensität, D Dauer, U Unumkehrbarkeit, V Verteilung/Vulnerabilität, S Systemtiefe. M_raw=(R+I+D+U+V+S)/6. 0=>0, >0 bis <1.5=>1, 1.5 bis <2.5=>2, 2.5 bis <3.5=>3, 3.5 bis <4.5=>4, ab4.5=>5. Auch 0 ist mit dokumentiertem Pfad zulässig, wenn alle Faktoren die praktisch vernachlässigbare Veränderung im angegebenen Raum/Zeitraum begründen. Keine Faktoren auf 0 setzen, nur weil Daten fehlen. Schutzprüfung pro Pfad: belegte schwere Schutzgrenzverletzung mit konkretem Referenzrahmen und Quellen => Mindestwert4; ex ante nur wenn genau diese Grenzverletzung bedingt modelliert ist. Keine Schlagwortregel und keine automatische Schutzgrenze aus Thema oder Partei. Die sechs Faktoren sind eine offengelegte ordinale Schätzung, keine statistische Regression. Keine Faktoren aus alten Relevanzwerten oder Balken rückwärts erfinden. Materielle positive/negative Hauptpfade desselben Gegenstands: stärkste Pfade vergleichen, Differenz höchstens1=>mixed/balanced; ab2=>mixed/dominant_positive oder dominant_negative. Maßgebliche negative Schutzgrenze begrenzt das Ergebnis, positive Pfade separat. Kleine Nebenrisiken ändern keine klare Hauptrichtung.';
const pathSchema = {
  direction: 'positive|negative|neutral|open', label: 'konkrete Zustandsänderung', mechanism: 'Wirkmechanismus',
  recipients: ['Wirkungsempfänger'], magnitude: '0|1|2|3|4|5 (Zahl)', evidence: 'high|medium|low|not_assessable',
  temporal_status: 'ex_ante|ongoing', same_target: true, same_baseline: true, type: 'main_path|counter_path|side_effect|side_risk', likelihood: 'very_low|low|medium|high|very_high|already_occurring|unknown',
  source_ids: ['source_id'], condition: 'notwendige Bedingungen',
  reference_space: 'abgegrenzter Wirkungsraum / Vergleich', time_horizon: 'Zeitraum der möglichen Veränderung',
  path_quality: ['direct|indirect|weak|systemic|high_uncertainty'],
  epistemic_basis: 'supported_mechanism|model_hypothesis', assumptions: 'offengelegte Modellannahmen',
  source_support: 'Was die Quellen tatsächlich belegen; Ausgangspunkt ist kein Beweis der Folge', limitations: 'Wissensgrenzen und Gegenannahmen',
  first_order: 'direkter möglicher Folgepfad', second_order: 'indirekte Folge, Bedingungen und Begrenzung', third_order: 'systemischer Folgepfad, Bedingungen und Begrenzung; keine Kaskade erfinden',
  magnitude_range: {lower: '0..5', upper: '0..5', rationale: 'begründete plausible Bandbreite, kein statistisches Konfidenzintervall'},
  negligibility_rationale: 'bei Stufe0: Warum ist die modellierte Änderung in Raum/Zeit praktisch vernachlässigbar?',
  observed_signal: {change:'bei ongoing: tatsächlich beobachtetes Signal; sonst null',source_ids:['source_id']},
  research_pass: 'initial|second_pass', research_result: 'Ergebnis gezielter Wirkungsrecherche; bei geringer Evidenz/hoher Unsicherheit Pflicht',
  ...MAGNITUDE_PATH_SCHEMA,
};
export const IMPACT_DIMENSION_SCHEMA = {
  path_status: PATH_STATUS.join('|'), likelihood: Object.keys(LIKELIHOOD).join('|'), dominance: DOMINANCE.join('|'),
  direction: DIRECTIONS.join('|'), magnitude: '0|1|2|3|4|5 (Zahl)', evidence: Object.keys(EVIDENCE).join('|'),
  data_status: 'modelled|estimated', temporal_status: 'ex_ante|ongoing',
  primary_paths: [{ $ref: '#/$defs/impact_path' }], secondary_paths: [{ $ref: '#/$defs/impact_path' }],
  rationale: 'Begründung der modellierten Potenziale, auch für Stufe0 oder offene Richtung',
  balance: { comparable_material_paths: false, protection_boundary_decisive: false, rationale: 'Abwägung, bei mixed Pflicht; sonst Objekt null' },
};
export const IMPACT_SCHEMA = {
  version: IMPACT_VERSION, semantics_revision: POTENTIAL_REVISION, news_event: 'konkreter Nachrichtenanlass',
  evaluation_target: { label: 'sachlicher Wirkungsgegenstand', type: TARGET_TYPES.join('|') },
  baseline: 'Vergleichszustand', temporal_status: TEMPORAL.join('|'), systemic_relevance: 'low|medium|high|very_high|critical|null',
  counterfactual: 'Was ohne die Maßnahme voraussichtlich geschieht', reference_frame: ['relevanter Schutz- oder Referenzrahmen'],
  system_check: { cross_dimension_review:{human:'Verbundene Folgen für Menschen, Verteilung, Gesundheit und Versorgung prüfen',planet:'Verbundene ökologische Folgen und Rückkopplungen prüfen',democracy:'Verbundene institutionelle Folgen und Korrekturfähigkeit auch bei schwachen indirekten Pfaden im definierten Raum/Zeit modellieren'}, central_dimensions: ['human|planet|democracy'], first_order: 'unmittelbare Veränderung', second_order: 'nachgelagerte Folge mit Bedingungen und offengelegten Grenzen', third_order: 'systemische Folge mit Bedingungen und offengelegten Grenzen', enablement: ['enables_power|enables_majority|enables_office|enables_legislation|enables_personnel_control|enables_budget_control|enables_institutional_control|normalisation_effect'], counter_evidence: ['materielle Gegenevidenz / Gegenpfade oder begründetes Fehlen'], source_independence: 'Unabhängigkeit der Belege, gemeinsame Agenturherkunft und fehlende zusätzliche Belege prüfen', institutional_status: 'geltende Zuständigkeiten und rechtlicher Status' },
  research_check: { status: 'completed|needs_research', source_functions: [{ source_id: 'source_id', functions: ['event|mechanism|reference|counter_evidence'], supported_claim: 'Welche Aussage die Quelle tatsächlich trägt' }], gaps: ['konkrete Wissenslücke oder leer'], searches: [{ question: 'konkrete Wirkungsfrage', result: 'Ergebnis, Gegenevidenz oder begründete Wissensgrenze', source_ids: ['source_id'] }] },
  observed_effects: [{ dimension: 'human|planet|democracy', change: 'belegte eingetretene Zustandsveränderung', direction: 'positive|negative|mixed|neutral|open', source_ids: ['source_id'], data_status: 'measured|observed|secondary_source', evidence: 'high|medium|low', attribution: 'established|open', reference_frame: 'Bewertungsmaßstab', reference_space: 'betroffene Empfänger und Raum', observed_at: 'belegter Zeitpunkt oder Zeitraum', temporal_status:'ongoing|ex_post', magnitude:'0|1|2|3|4|5 (Zahl)', mechanism:'belegter Mechanismus oder attribuierte Erklärung', recipients:['betroffene Empfänger'], time_horizon:'Zeitwirkung des beobachteten Zustands', same_target:true, same_baseline:true, ...MAGNITUDE_PATH_SCHEMA }],
  dimensions: Object.fromEntries(IMPACT_KEYS.map(key => [key, { $ref: '#/$defs/impact_dimension' }])),
};
export const IMPACT_RULE = BASE_IMPACT_RULE + ' Pflicht je Pfad: reference_space,time_horizon,Empfänger,Ordnungen1–3,path_quality,source_support,assumptions,limitations. supported_mechanism vs model_hypothesis trennen. Modellhypothese trägt nur low/not_assessable Evidenz, aber immer begründete Tragweite0..5 plus magnitude_range. Bei geringer Evidenz/high_uncertainty gezielter zweiter Recherchepass mit Ergebnis Pflicht; konservative begründete Bandbreite, keine erfundenen Präzisionswerte. Notwendige wissenschaftliche/amtliche Mechanismusquellen zusätzlich recherchieren; wenn sie nicht auffindbar sind, Wissensgrenze offenlegen. observed_effects ist getrennte Liste, leer wenn kein Beleg. Jede Beobachtung braucht eigene Tragweite mit sechs Faktoren, Empfänger, Mechanismus, Zeitraum und temporal_status ongoing oder ex_post. Der Ring wird daraus zentral abgeleitet; keine Prozentfüllung. Erste reine Umsetzungsschritte nicht als Folge messen: laufender Pfad braucht reale Signale; unbelegte Zukunftspfade bleiben ex_ante. original/current_potential_assessment erzeugt der Server, der Autor überschreibt keine Historie. ' + MAGNITUDE_RULE + ' Faktorenanker: ' + Object.entries(MAGNITUDE_FACTORS).map(([key,f]) => `${key}(${f.symbol}), Stufen 0..5: ${f.levels.join(';')}`).join(' | ');
export const IMPACT_DEFS = { impact_dimension: IMPACT_DIMENSION_SCHEMA, impact_path: { ...pathSchema, magnitude_factors:Object.fromEntries(Object.keys(MAGNITUDE_FACTORS).map(key=>[key,{$ref:'#/$defs/impact_factor'}])) }, impact_factor:{value:'0|1|2|3|4|5 (Zahl)',rationale:'Quellenbasierte Einordnung dieses Faktors',source_ids:['source_id']} };
const text = value => typeof value === 'string' && value.trim().length >= 12;
const magnitude = value => Number.isInteger(value) && value >= 0 && value <= 5;
const list = value => Array.isArray(value) ? value : [];
const signed = value => ['positive', 'negative'].includes(value);

export function withMagnitudeCalculations(assessment) {
  const result=structuredClone(assessment);
  if (result?.version === IMPACT_VERSION) for (const d of Object.values(result.dimensions || {}))
    for (const p of [...(d.primary_paths || []), ...(d.secondary_paths || [])]) p.magnitude_calculation=calculateMagnitude(p.magnitude_factors,{protectionBoundaryDecisive:p.protection_boundary?.decisive});
  for(const effect of result?.observed_effects||[]) effect.magnitude_calculation=calculateMagnitude(effect.magnitude_factors,{protectionBoundaryDecisive:effect.protection_boundary?.decisive});
  return result;
}

export function impactClaimLedger(assessment, sources = [], date = null) {
  return IMPACT_KEYS.flatMap(key => [...(assessment.dimensions?.[key]?.primary_paths || []), ...(assessment.dimensions?.[key]?.secondary_paths || [])].map(p => ({
    claim: p.label, claim_type: p.direction === 'negative' ? 'impact_risk' : 'impact_potential',
    source_ids: p.source_ids, sources: (p.source_ids || []).flatMap(id => sources.filter(s => s.source_id === id).map(s => ({ source_id: id, url: s.url || null, source_function: s.source_function || s.source_role || s.source_type || 'unclassified' }))),
    date, evidence: p.evidence, data_status: assessment.dimensions[key].data_status, direction: p.direction,
    affected_dimension: key, mechanism: p.mechanism, counterfactual: assessment.counterfactual || assessment.baseline,
    epistemic_basis: p.epistemic_basis, source_support:p.source_support, assumptions:p.assumptions, limitations:p.limitations, reference_space:p.reference_space, time_horizon:p.time_horizon, magnitude_range:p.magnitude_range, magnitude: p.magnitude, magnitude_factors: p.magnitude_factors, magnitude_calculation: p.magnitude_factors ? calculateMagnitude(p.magnitude_factors, { protectionBoundaryDecisive: p.protection_boundary?.decisive }) : null, protection_boundary: p.protection_boundary,
    uncertainty: p.condition, likelihood: p.likelihood || assessment.dimensions[key].likelihood,
  })));
}

// Validation examines raw data before any display fallback can conceal a bad
// verdict. A low-evidence but sourced potential can retain magnitude five.
export function impactAssessmentErrors(assessment, sources = [], { required = false, version = IMPACT_VERSION } = {}) {
  if (!assessment) return required ? ['IMPACT_ASSESSMENT_REQUIRED'] : [];
  if (JSON.stringify(assessment).length > 180000) return ['IMPACT_ASSESSMENT_TOO_LARGE'];
  const errors = [], fail = code => errors.push(code);
  const sourceIds = new Set(sources.map(source => source.source_id));
  const grounded = ids => Array.isArray(ids) && ids.length > 0 && ids.every(id => typeof id === 'string' && sourceIds.has(id));
  if (!['2.0','2.1'].includes(version) || assessment.version !== version) fail('IMPACT_VERSION_INVALID');
  const current = version === IMPACT_VERSION;
  if (assessment.review?.status === 'needs_reassessment') fail('IMPACT_REASSESSMENT_INCOMPLETE');
  if (!text(assessment.news_event) || !text(assessment.evaluation_target?.label) || !TARGET_TYPES.includes(assessment.evaluation_target?.type) || !text(assessment.baseline)) fail('IMPACT_TARGET_REQUIRED');
  if (!TEMPORAL.includes(assessment.temporal_status)) fail('IMPACT_TIME_REQUIRED');
  if (![null, 'low', 'medium', 'high', 'very_high', 'critical'].includes(assessment.systemic_relevance)) fail('IMPACT_RELEVANCE_INVALID');
  if (!text(assessment.counterfactual) || !list(assessment.reference_frame).some(text)) fail('IMPACT_REFERENCE_REQUIRED');
  if (current) {
    const research = assessment.research_check;
    if (!research || !['completed','needs_research'].includes(research.status) || !Array.isArray(research.gaps) || !Array.isArray(research.searches)
      || !Array.isArray(research.source_functions) || !research.source_functions.length) fail('IMPACT_RESEARCH_CHECK_REQUIRED');
    for (const source of research?.source_functions || []) if (!sourceIds.has(source.source_id) || !text(source.supported_claim)
      || !Array.isArray(source.functions) || !source.functions.length || source.functions.some(f=>!['event','mechanism','reference','counter_evidence'].includes(f))) fail('IMPACT_SOURCE_FUNCTION_INVALID');
    for (const search of research?.searches || []) if (!text(search.question) || !text(search.result) || !Array.isArray(search.source_ids) || search.source_ids.some(id=>!sourceIds.has(id))) fail('IMPACT_RESEARCH_RESULT_INVALID');
  }

  if (current) return [...new Set([...errors, ...potentialDimensionErrors(assessment, sourceIds)])];

  for (const key of IMPACT_KEYS) {
    const d = assessment.dimensions?.[key];
    if (!d || !['material','not_material','insufficient_basis'].includes(d.path_status) || !Object.hasOwn(LIKELIHOOD, d.likelihood) || !DOMINANCE.includes(d.dominance) || !['positive','negative','mixed','neutral','open','not_material'].includes(d.direction) || !TEMPORAL.includes(d.temporal_status) || !Object.hasOwn(EVIDENCE, d.evidence) || !DATA_STATUS.includes(d.data_status)) { fail(`IMPACT_DIMENSION_INVALID:${key}`); continue; }
    if (current && d.path_status === 'material' && (!magnitude(d.magnitude) || d.magnitude < 1)) fail(`IMPACT_MATERIAL_MAGNITUDE_REQUIRED:${key}`);
    if (d.magnitude !== null && !magnitude(d.magnitude)) fail(`IMPACT_MAGNITUDE_INVALID:${key}`);
    if (!text(d.rationale)) fail(`IMPACT_RATIONALE_REQUIRED:${key}`);
    if (d.data_status === 'missing' && (d.direction !== 'open' || d.magnitude !== null || d.evidence !== 'not_assessable')) fail(`IMPACT_MISSING_IS_OPEN:${key}`);
    if (d.path_status === 'insufficient_basis' && (d.direction !== 'open' || d.magnitude !== null || list(d.primary_paths).length)) fail(`IMPACT_INSUFFICIENT_PATH_CONFLICT:${key}`);
    if (d.path_status === 'not_material' && d.direction !== 'not_material' || d.direction === 'not_material' && d.path_status !== 'not_material') fail(`IMPACT_NOT_MATERIAL_CONFLICT:${key}`);
    if (signed(d.direction) && (d.path_status !== 'material' || d.evidence === 'not_assessable')) fail(`IMPACT_MATERIAL_PATH_REQUIRED:${key}`);
    if (d.temporal_status === 'ex_ante' && d.likelihood === 'already_occurring' || d.temporal_status === 'ex_post' && d.path_status === 'material' && d.likelihood !== 'already_occurring') fail(`IMPACT_LIKELIHOOD_TIME_CONFLICT:${key}`);
    if (d.direction === 'neutral' && (d.evidence === 'not_assessable' || d.data_status === 'missing')) fail(`IMPACT_NEUTRAL_UNSUPPORTED:${key}`);
    if (d.direction === 'not_material' && (d.magnitude !== 0 || d.evidence === 'not_assessable' || list(d.primary_paths).length)) fail(`IMPACT_NOT_MATERIAL_UNSUPPORTED:${key}`);
    if (d.direction !== 'not_material' && d.magnitude === 0 && !['neutral'].includes(d.direction)) fail(`IMPACT_ZERO_UNSUPPORTED:${key}`);
    if (!Array.isArray(d.primary_paths) || !Array.isArray(d.secondary_paths)) fail(`IMPACT_PATHS_REQUIRED:${key}`);
    const primary = list(d.primary_paths), all = [...primary, ...list(d.secondary_paths)];
    for (const p of all) {
      if (!['positive','negative','neutral','open'].includes(p?.direction) || !text(p.label) || !text(p.mechanism) || !list(p.recipients).some(text) || !TEMPORAL.includes(p.temporal_status)
        || !Object.hasOwn(EVIDENCE, p.evidence) || (p.magnitude !== null && !magnitude(p.magnitude)) || !grounded(p.source_ids) || typeof p.material !== 'boolean'
        || typeof p.same_target !== 'boolean' || typeof p.same_baseline !== 'boolean' || !text(p.condition)
        || !['main_path','counter_path','side_effect','side_risk'].includes(p.type) || !Object.hasOwn(LIKELIHOOD,p.likelihood)) fail(`IMPACT_PATH_INVALID:${key}`);
      if (current && p.magnitude_factors) for (const issue of pathwayMagnitudeErrors(p, sourceIds)) fail(`${issue}:${key}`);
      if (p.temporal_status === 'ex_ante' && p.likelihood === 'already_occurring' || p.temporal_status === 'ex_post' && p.likelihood !== 'already_occurring') fail(`IMPACT_PATH_TIME_CONFLICT:${key}`);
    }
    if (signed(d.direction) && !primary.some(p => p.direction === d.direction && p.material && p.same_target && p.same_baseline)) fail(`IMPACT_MAIN_PATH_REQUIRED:${key}`);
    if (!current && signed(d.direction) && primary.some(p => p.direction !== d.direction)) fail(`IMPACT_MAIN_DIRECTION_CONFLICT:${key}`);
    if (signed(d.direction) && primary.some(p => p.temporal_status !== d.temporal_status)) fail(`IMPACT_MAIN_TIME_CONFLICT:${key}`);
    if (d.direction === 'not_material' && all.some(p => p.material) || d.direction === 'neutral' && all.some(p => p.material && signed(p.direction))) fail(`IMPACT_NO_CHANGE_CONFLICT:${key}`);
    if (!current && signed(d.direction) && d.magnitude !== null && !primary.some(p => p.direction === d.direction && p.magnitude === d.magnitude)) fail(`IMPACT_MAGNITUDE_PATH_MISMATCH:${key}`);
    if (!current && d.direction === 'mixed') {
      const relevant = primary.filter(p => p.material && p.same_target && p.same_baseline && magnitude(p.magnitude) && p.magnitude > 0 && p.evidence !== 'not_assessable');
      if (!['positive', 'negative'].every(sign => relevant.some(p => p.direction === sign)) || (d.dominance === 'balanced' && d.balance?.comparable_material_paths !== true) || d.balance?.protection_boundary_decisive !== false || !text(d.balance?.rationale)) fail(`IMPACT_AMBIVALENCE_UNSUPPORTED:${key}`);
      const strengths = ['positive', 'negative'].map(sign => Math.max(0, ...relevant.filter(p => p.direction === sign).map(p => p.magnitude)));
      if (Math.min(...strengths) < 2 || (d.dominance === 'balanced' && Math.max(...strengths) - Math.min(...strengths) > 1) || d.magnitude !== Math.max(...strengths)) fail(`IMPACT_AMBIVALENCE_MAGNITUDE_CONFLICT:${key}`);
    }
    if (signed(d.direction) && d.dominance !== `dominant_${d.direction}`) fail(`IMPACT_DOMINANCE_CONFLICT:${key}`);
    if (d.direction === 'mixed' && !['balanced','dominant_positive','dominant_negative'].includes(d.dominance)) fail(`IMPACT_DOMINANCE_CONFLICT:${key}`);
    if (!current && d.direction === 'mixed' && d.dominance.startsWith('dominant_')) {
      const sign = d.dominance.slice(9), main = primary.filter(p => p.direction === sign), other = primary.filter(p => p.direction !== sign);
      if (!main.length || !other.length || Math.max(...main.map(p => p.magnitude || 0)) <= Math.max(...other.map(p => p.magnitude || 0))) fail(`IMPACT_DOMINANCE_UNSUPPORTED:${key}`);
    }
    // A retrospective assessment can explicitly leave a dimension unresolved
    // or find no material path. Neither finding asserts an observed outcome.
    // Every actual ex-post path still needs an outcome, including side paths.
    if (d.path_status === 'material' && d.temporal_status === 'ex_post' || all.some(p => p.temporal_status === 'ex_post')) {
      if (!text(d.observed_outcome?.change) || !grounded(d.observed_outcome?.source_ids) || !['established', 'open'].includes(d.observed_outcome?.attribution)
        || !['measured', 'observed', 'secondary_source'].includes(d.data_status) || d.evidence === 'not_assessable') fail(`IMPACT_OBSERVED_OUTCOME_REQUIRED:${key}`);
    }
    if (d.temporal_status === 'ex_ante' && primary.some(p => p.temporal_status === 'ex_post')) fail(`IMPACT_OBSERVED_LABEL_CONFLICT:${key}`);
    if (d.temporal_status === 'ex_post' && primary.some(p => p.temporal_status !== 'ex_post')) fail(`IMPACT_OBSERVED_LABEL_CONFLICT:${key}`);
    if (current && d.path_status === 'material') {
      for (const p of primary) {
        if (!p.material || !p.same_target || !p.same_baseline || !['main_path','counter_path'].includes(p.type)) fail(`IMPACT_MAIN_SCOPE_REQUIRED:${key}`);
        for (const issue of pathwayMagnitudeErrors(p, sourceIds)) fail(`${issue}:${key}`);
      }
      try {
        const aggregate = aggregateMainPaths(primary);
        if (d.direction !== aggregate.direction || d.dominance !== aggregate.dominance || d.magnitude !== aggregate.magnitude) fail(`IMPACT_MAIN_AGGREGATE_MISMATCH:${key}`);
        if ((d.direction === 'mixed' || aggregate.protection_boundary_decisive) && (!text(d.balance?.rationale) || d.balance.protection_boundary_decisive !== aggregate.protection_boundary_decisive
          || d.direction === 'mixed' && d.balance.comparable_material_paths !== (d.dominance === 'balanced'))) fail(`IMPACT_BALANCE_REQUIRED:${key}`);
      } catch { fail(`IMPACT_MAIN_MAGNITUDE_REQUIRED:${key}`); }
      if (d.temporal_status === 'ex_post') {
        const relation = d.observed_outcome?.reference_relation;
        if (!['strengthens','weakens','neutral','unresolved'].includes(relation)) fail(`IMPACT_OBSERVED_REFERENCE_REQUIRED:${key}`);
        if (relation === 'weakens' && !['negative','mixed'].includes(d.direction) || relation === 'strengthens' && !['positive','mixed'].includes(d.direction)) fail(`IMPACT_OBSERVED_DIRECTION_CONFLICT:${key}`);
      }
    }

  }
  return [...new Set(errors)];
}

// Conservative compatibility projection. Original analysis and journalistic
// content remain immutable; migration records what could not be established.
export function migrateImpactAssessment(analysis = {}, context = {}) {
  if (['2.0','2.1'].includes(analysis.impact_assessment?.version)) return structuredClone(analysis.impact_assessment);
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
    return [key, { path_status: signed(direction) ? 'material' : 'insufficient_basis', likelihood: 'unknown', dominance: signed(direction) ? `dominant_${direction}` : 'none', direction, magnitude: level, evidence: 'not_assessable', data_status: 'secondary_source', temporal_status: temporal,
      primary_paths: signed(direction) ? [legacyPath(p)] : [], secondary_paths: [item.positive_path, item.negative_path].filter(path => text(path?.mechanism) && path !== (signed(direction) ? p : null)).map(legacyPath),
      rationale: direction === 'open' ? 'Mögliche Wirkpfade und ihre Richtung sind in dieser Fassung noch nicht ausreichend getrennt eingeordnet. Das bedeutet weder neutrale Wirkung noch fehlendes Wirkungspotenzial.' : item.rationale,
      legacy_rationale: item.rationale || null, observed_outcome: null, balance: null }];
  }));
  const target = context.evaluation_target || analysis.assessment_frame?.subject;
  if (!target) missing.push('evaluation_target');
  return { version: context.version || IMPACT_VERSION, news_event: context.news_event || context.title || '', evaluation_target: {
    label: typeof target === 'object' ? target.label : target || '', type: typeof target === 'object' ? target.type : ({ proposed_measure: 'proposal', implemented_measure: 'measure', event: 'event', communication: 'communication' })[analysis.assessment_frame?.object_kind] || 'other',
  }, baseline: analysis.assessment_frame?.baseline || '', temporal_status: temporal,
  systemic_relevance: ({ gering: 'low', mittel: 'medium', hoch: 'high', 'sehr hoch': 'very_high' })[analysis.importance] || null,
  dimensions, review: { status: 'needs_reassessment', missing, legacy_version: analysis.direction_assessment_version || analysis.editorial_rules_version || null } };
}

export function deriveImpactPresentation(input = {}, context = {}) {
  const analysis = input.analysis || input;
  const assessment = ['2.0','2.1'].includes(input.version) && input.dimensions ? input : input.impact_assessment || migrateImpactAssessment(analysis, { title: input.title, ...context });
  const potential = assessment.semantics_revision === POTENTIAL_REVISION;
  const timeLabels = { ex_ante: 'Ex ante', ongoing: 'Laufende Prüfung', ex_post: 'Ex post' };
  const dimensions = Object.fromEntries(IMPACT_KEYS.map(key => {
    const d = assessment.dimensions?.[key] || {};
    let direction = DIRECTIONS.includes(d.direction) ? d.direction : 'open';
    const time = TEMPORAL.includes(d.temporal_status) ? d.temporal_status : assessment.temporal_status;
    const observed = !potential && time === 'ex_post' && text(d.observed_outcome?.change) && d.observed_outcome?.source_ids?.length;
    if (!potential && time === 'ex_post' && !observed && ['positive','negative','mixed'].includes(direction)) direction = 'open';
    const dominantSign = '±';
    const dominantLabel = observed ? `± überwiegend ${d.dominance === 'dominant_negative' ? 'negativ' : 'positiv'} beobachtet` : time === 'ex_ante' ? d.dominance === 'dominant_negative' ? '± überwiegend negativ' : '± überwiegend positiv' : `${dominantSign} überwiegend laufend`;
    const short = potential ? ({positive:'+ Potenzial', negative:'− Risiko', neutral:'neutral', open:'? Richtung offen', mixed:d.dominance?.startsWith('dominant_') ? `± überwiegend ${d.dominance === 'dominant_negative' ? 'negativ' : 'positiv'}` : '± gegenläufig'}[direction]) : { neutral: 'neutral', mixed: d.dominance?.startsWith('dominant_') ? dominantLabel : '± gegenläufig', open: '? offen', not_material: 'Historische Einordnung' }[direction]
      || (observed ? `${direction === 'positive' ? '+' : '−'} beobachtet` : time === 'ex_ante' ? direction === 'positive' ? '+ Potenzial' : '− Risiko' : `${direction === 'positive' ? '+' : '−'} laufend geprüft`);
    const level = magnitude(d.magnitude) ? d.magnitude : null;
    const potentialPresentation = deriveStatusPresentation({...d,label:d.primary_paths?.[0]?.label});
    const observations = (assessment.observed_effects||[]).filter(e=>e.dimension===key).map(e=>({...e,presentation:deriveStatusPresentation(e)}));
    // The strongest documented consequence is shown first, without averaging
    // opposite effects or conflating its strength with a future potential.
    const displayedObservation=[...observations].sort((a,b)=>b.magnitude-a.magnitude)[0];
    const display=displayedObservation?.presentation || potentialPresentation;
    return [key, { ...d, potential_presentation:potentialPresentation, observations, displayed_observation:displayedObservation,
      ringStatus:display.ringStatus, ringLabel:display.ringLabel,magnitudeBars:display.magnitudeBars,directionLabel:display.directionLabel,
      shortPathLabel:display.shortPathLabel,display_direction:display.direction,
      direction, magnitude: level, temporal_status: time, label: short, magnitude_label: level === null ? 'Tragweite offen' : MAGNITUDE[level], evidence_label: EVIDENCE[d.evidence] || EVIDENCE.not_assessable, likelihood_label: LIKELIHOOD[d.likelihood] || LIKELIHOOD.unknown, path_status_label: ({ modelled: 'Modelliertes Wirkungspotenzial', material: 'Historischer Wirkpfad', not_material: 'Historische Einordnung', insufficient_basis: 'Neubewertung erforderlich' })[d.path_status] || 'Wirkpfad noch zu prüfen',
      time_label: timeLabels[time] || 'Zeitstatus offen', long_label: direction === 'not_material' ? 'Historische Einordnung - Neubewertung erforderlich.' : short,
    }];
  }));
  return { ...assessment, dimensions, heading: 'Wirkungspotenzial', potential, time_label: timeLabels[assessment.temporal_status] || 'Zeitstatus offen', relevance_label: ({ low: 'Geringe', medium: 'Mittlere', high: 'Hohe', very_high: 'Sehr hohe', critical: 'Kritische' })[assessment.systemic_relevance] || null,
    show_target: Boolean(assessment.evaluation_target?.label && assessment.evaluation_target.label.trim().toLowerCase() !== assessment.news_event?.trim().toLowerCase()), legend: IMPACT_LEGEND };
}

// Compact prompt form of the same published contract. The full contract and
// field definitions remain available; no evidence is dropped for rule copies.
export const IMPACT_PROMPT_RULE = `Wirkungsticker2.1/all-dimensions-1: JEDE reguläre Meldung hat für ALLE DREI MPD-Dimensionen path_status=modelled, mindestens einen konkreten Potenzialpfad und magnitude0..5. Keine null-Werte, not_material/no_path/insufficient_basis oder leere Hauptpfade. 0=begründet praktisch vernachlässigbare Zustandsveränderung im definierten Raum/Zeit; nie Ersatz für fehlende Daten. open betrifft Richtung, nicht Pfadexistenz. Relevanz≠Tragweite≠Eintritt≠Evidenz; Zukunft unsicher≠Richtung offen. news_event/evaluation_target/baseline/counterfactual/reference_frame trennen. Politische Äußerung: sachliche Maßnahme bewerten, außer Kommunikation selbst ist Gegenstand. Dossier-Gegenstand bei Updates erhalten. Pro Pfad: Empfänger,Mechanismus,Bedingung,Raum,Zeithorizont,Ordnungen1–3,Quellenfunktion,Modellannahmen,Wissensgrenzen,path_quality. Quellen belegen nur ihren tatsächlichen source_support. Wissenschaft/Recht/Statistik für Mechanismus,Referenz,Gegenevidenz gezielt ergänzen; Ausgangsnachricht braucht nicht alle Folgen. supported_mechanism vs model_hypothesis; Hypothese nur low/not_assessable. Bei geringer Evidenz/high_uncertainty zweiter Recherchepass mit Ergebnis und begründeter konservativer magnitude_range; keine erfundenen Quellen/Fakten/Prozentwerte. research_sources: echte URL,Funktion,exakter kurzer Belegauszug. Hauptpfade ex_ante/ongoing; ongoing benötigt beobachtetes Signal. Belegte Veränderungen separat in observed_effects mit eigener Tragweite,Faktoren,Richtung,Evidenz,Empfängern,Zeit und Ursachenattribution. Schaden ist nicht Risiko; Ereignisbeleg nicht Attributionsbeleg. Potenzial bleibt daneben erhalten. Ringstatus leitet Server aus Zeitstatus ab, niemals aus Magnitude. Server bewahrt original/current_potential_assessment. Pro Pfad sechs begründete Faktoren0..5: R Reichweite,I Intensität,D Dauer,U Unumkehrbarkeit,V Verteilung/Vulnerabilität,S Systemtiefe. Summe/6, Grenzen0=>0,>0<1.5=>1,<2.5=>2,<3.5=>3,<4.5=>4,sonst5; keine Faktoren rückwärts aus alten Relevanzbalken erfinden. Maßgebliche konkret begründete schwere Schutzgrenze=>mindestens4; ex ante nur bedingter genau definierter Grenzpfad. Nichtkompensation/Reverse Merit Order; keine gemittelte MPD-Gesamtnote. Materielle gegenläufige Hauptpfade desselben Gegenstands/Baseline: höchste Stufe je Richtung; Differenz≤1=>mixed/balanced,≥2=>mixed/dominant. Maßgebliche negative Schutzgrenze begrenzt zuerst. Kleine Nebenrisiken,Schutzplanken,Restschaden,besserer Entwurf,politische Reaktion und fremder Nutzen sind kein ausgleichender Hauptpfad. Politische Kooperation: Mehrheits-/Regierungs-/Personal-/Budget-/Institutionenmacht,Normalisierung prüfen. Energie: EE-Ausbau/Hürden,Netze,Speicher,fossile Lock-ins,Emissionen,Importabhängigkeit; gekoppelte Folgen für Gesundheit,bezahlbare Versorgung,Beschäftigung,Verteilung und Demokratie. Keine Dimension nach Ressort ausschließen. Keine Partei-/Personenregeln, keine Überzeichnung von Programmen. system_check: alle drei Räume gekoppelt,Ordnungen1–3,Enablement,Gegenevidenz,Quellenunabhängigkeit,Rechtsstatus. Jede Modellannahme quellengetreu und bedingt kennzeichnen; kein Scheinbeleg durch Pflichtfeld.`;

export const IMPACT_PROMPT_SCHEMA = {...IMPACT_SCHEMA, observed_effects:[{$ref:'#/$defs/observed_effect'}]};
export const IMPACT_PROMPT_DEFS = {...IMPACT_DEFS,
  observed_effect:{...IMPACT_SCHEMA.observed_effects[0],magnitude_factors:IMPACT_DEFS.impact_path.magnitude_factors,protection_boundary:{$ref:'#/$defs/protection_boundary'}},
  impact_path:{...IMPACT_DEFS.impact_path,protection_boundary:{$ref:'#/$defs/protection_boundary'}},protection_boundary:MAGNITUDE_PATH_SCHEMA.protection_boundary};
