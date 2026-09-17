import { impactScopeErrors, modelledPublicationIssues } from './impact-scope.mjs';
import { isGroundedOpenDimension } from './impact-potential.mjs';
import { IMPACT_KEYS, impactAssessmentErrors } from './impact-assessment.mjs';

export const SEMANTIC_CHECKS = ['event_target', 'time_and_observation', 'path_and_recipients', 'direction_and_reference', 'magnitude', 'likelihood', 'evidence', 'potential_scope', 'second_third_order', 'policy_coverage', 'source_fidelity', 'counterpaths_and_dominance', 'institutional_status', 'counterfactual'];
const text = value => typeof value === 'string' && value.trim().length >= 12;
export const structuredSemanticChecks = review => SEMANTIC_CHECKS.every(key => ['pass','fail'].includes(review?.checks?.[key]?.status) && text(review.checks[key].rationale));
const sourceText = record => [record.title, record.source_summary, ...[...(record.sources || record.source_snapshot || []), ...(record.impact_sources || [])].map(s => `${s.title || ''} ${s.summary || ''} ${s.article_excerpt || ''}`)].filter(Boolean).join('\n');

// Die Ausloeser stehen als Wortlisten hier, und die Muster werden daraus
// gebaut - nicht umgekehrt. Denn dasselbe Wissen geht in den Auftrag an das
// Modell (IMPACT_CONTEXT_PROMPT_RULE): gemessen am 17.09.2026 waren 11 von 15
// Nachbesserungen fehlende Pflichtteile der Wirkungsbewertung, zweimal
// IMPACT_POWER_PATH_REQUIRED. Jede Nachbesserung ist ein zweiter bezahlter
// Aufruf - und Natalies Regel ist ein Aufruf je Veroeffentlichung. Wenn die
// Software vor dem Aufruf weiss, was die Meldung verlangt, muss sie es sagen.
export const POWER_TRIGGER_WORDS = ['Regierungsbildung', 'Regierungsmehrheit', 'Regierungsbeteiligung', 'Koalition', 'Duldung', 'Sondierung', 'politische Zusammenarbeit', 'Personalentscheidung', 'Institutionenmacht'];
export const ENERGY_TRIGGER_WORDS = ['Energiepolitik', 'Energieversorgung', 'Energiewende', 'Gasimporte', 'Gaslieferungen', 'Kohlekraft', 'Windkraft', 'Photovoltaik', 'CO2-Bepreisung'];
const triggerPattern = (words) => new RegExp(`(?:${words.map((word) => word.replace(/ /g, '[\\s-]+')).join('|')})`, 'iu');
export const POWER_TRIGGER = triggerPattern(POWER_TRIGGER_WORDS);
export const ENERGY_TRIGGER = triggerPattern(ENERGY_TRIGGER_WORDS);

// Der Auftrag nennt die Pflicht und die Folge - aber nur fuer die Meldung, um
// die es geht. Eine allgemeine Regel fuer alle Meldungen kostete 977 Zeichen
// und sprengte das Eingabebudget (AI_INPUT_TOO_LARGE im Prueflauf gegen die
// echten September-Pakete). Die gezielte Zeile kostet nichts, wo sie nicht
// gebraucht wird, und wird dort, wo sie steht, eher gelesen.
export function impactContextPromptRule(record = {}) {
  const { power, energy, harm } = impactContextRequirements(record);
  const pflichten = [
    ...(power ? ['dimensions.democracy braucht mindestens einen modellierten primary_path UND system_check.enablement mindestens einen Marker (Machtbezug ist belegt)'] : []),
    ...(energy ? ['dimensions.planet braucht mindestens einen modellierten primary_path (Energiebezug ist belegt)'] : []),
    ...(harm ? ['observed_effects braucht einen Eintrag dimension:human/direction:negative (belegter eingetretener Schaden, kein Risiko)'] : []),
  ];
  if (!pflichten.length) return '';
  // Die Folge muss dabeistehen, sonst ist es eine Bitte: zweimal am 17.09.2026
  // fehlte genau der Machtpfad, und jede Nachbesserung ist ein zweiter
  // bezahlter Aufruf.
  return `Pflichtteile dieser Meldung: ${pflichten.join('; ')}. Fehlt eines, wird die Antwort verworfen. Richtung, Staerke und Evidenz bleiben deine quellengebundene Entscheidung, "open" bleibt bei belegter Unklarheit erlaubt.`;
}

// Signals request scrutiny, never produce a political direction or magnitude.
// No party/person/source-name rules are permitted here.
export function impactContextRequirements(record = {}) {
  const material = sourceText(record);
  const power = POWER_TRIGGER.test(material);
  const energy = ENERGY_TRIGGER.test(material);
  const harm = /(?:\b\d+\s+(?:Tote|Verletzte)|(?:getötet|gestorben|ums Leben gekommen|verletzt worden))/iu.test(material)
    && !/(?:könnte|könnten|befürchtet|Szenario).{0,35}(?:Tote|Verletzte|sterben)/iu.test(material);
  return { power, energy, harm, central_dimensions: [...(power ? ['democracy'] : []), ...(energy ? ['planet'] : []), ...(harm ? ['human'] : [])] };
}

export function semanticIssues(assessment, record = {}, { secondPassComplete = false } = {}) {
  const sources = [...(record.sources || record.source_snapshot || []), ...(record.impact_sources || [])];
  const issues = impactAssessmentErrors(assessment, sources, { required: true });
  if (!assessment) return issues;
  const requirements = impactContextRequirements(record), system = assessment.system_check;
  const high = ['high', 'very_high', 'critical'].includes(assessment.systemic_relevance);
  if (!system || !['first_order', 'second_order', 'third_order', 'source_independence', 'institutional_status'].every(k => text(system[k]))
    || !Array.isArray(system.central_dimensions) || !Array.isArray(system.counter_evidence) || !system.counter_evidence.some(text)) issues.push('IMPACT_SYSTEM_CHECK_REQUIRED');
  if (assessment.version === '2.1' && !IMPACT_KEYS.every(key=>text(system?.cross_dimension_review?.[key]))) issues.push('IMPACT_CROSS_DIMENSION_REVIEW_REQUIRED');
  const researched = assessment.research_check?.status === 'completed' && Array.isArray(assessment.research_check.searches) && assessment.research_check.searches.some(s => text(s.question) && text(s.result));
  if (assessment.version === '2.1' && !researched) issues.push('IMPACT_RESEARCH_CHECK_REQUIRED');
  const central = new Set([...requirements.central_dimensions, ...(system?.central_dimensions || []).filter(k => IMPACT_KEYS.includes(k))]);
  if (high && IMPACT_KEYS.every(k => !assessment.dimensions?.[k]?.primary_paths?.length) && !(researched && IMPACT_KEYS.every(k => isGroundedOpenDimension(assessment.dimensions?.[k])))) issues.push('IMPACT_HIGH_RELEVANCE_WITHOUT_PATH');
  for (const key of central) {
    const d = assessment.dimensions?.[key];
    if (high && (!d || d.path_status !== 'modelled' || d.direction === 'open') && !(secondPassComplete && researched)) issues.push(`IMPACT_CENTRAL_DIMENSION_UNRESOLVED:${key}`);
  }
  if (requirements.power && !isGroundedOpenDimension(assessment.dimensions?.democracy) && (!assessment.dimensions?.democracy?.primary_paths?.length || !system?.enablement?.length)) issues.push('IMPACT_POWER_PATH_REQUIRED');
  if (requirements.energy && !isGroundedOpenDimension(assessment.dimensions?.planet) && !assessment.dimensions?.planet?.primary_paths?.length) issues.push('IMPACT_ENERGY_PATH_REVIEW_REQUIRED');
  if (requirements.harm && !assessment.observed_effects?.some(e => e.dimension === 'human' && e.direction === 'negative')) issues.push('IMPACT_OCCURRED_HARM_AS_RISK');
  for (const key of IMPACT_KEYS) {
    const d = assessment.dimensions?.[key];
    if (!d) continue;
    if (d.primary_paths?.some(p => p.path_quality?.includes('high_uncertainty')) && !researched) issues.push(`IMPACT_TARGETED_RESEARCH_REQUIRED:${key}`);
    const explanation = `${d.rationale || ''} ${(d.primary_paths || []).map(p => `${p.label} ${p.mechanism}`).join(' ')}`;
    if (d.direction === 'open' && /(?:würde|würden|erhöht|erhöhen).{0,55}(?:Emissionen erhöhen|Emissionen steigern)|(?:CO2|Emissionen).{0,25}(?:erhöhen|erhöht|steigen)|(?:schwächt|verschlechtert).{0,35}(?:Grundrechte|Kontrolle|Gesundheit)/iu.test(explanation)) issues.push(`IMPACT_DIRECTION_RATIONALE_CONFLICT:${key}`);
  }
  return [...new Set(issues)];
}

// The caller must obtain review from the separately persisted review job, never
// from a review object supplied by the first writer in its own output.
// Version 2.1 has a product invariant: a public release needs one modelled,
// numerical MPD pathway in every dimension. Callers may no longer forget this
// by omitting a flag. Read-only historical validation can opt out explicitly;
// no publishing path should do so.
export function derivePublicationStatus(assessment, record = {}, { review = null, secondPassComplete = false, requireScope = false, requireModelledDimensions = null } = {}) {
  const modelledRequired = requireModelledDimensions ?? assessment?.version === '2.1';
  const issues = [...semanticIssues(assessment, record, { secondPassComplete }), ...impactScopeErrors(review?.scope, assessment, [...(record.sources || record.source_snapshot || []), ...(record.impact_sources || [])], {required:requireScope, publication:review?.status === 'ready'})];
  if (modelledRequired) issues.push(...modelledPublicationIssues(assessment).filter(issue=>!issues.includes(issue)));
  if (review?.status === 'blocked') return { status: 'blocked', issues: [...issues, 'IMPACT_REVIEW_BLOCKED'] };
  const reviewed = review?.status === 'ready' && structuredSemanticChecks(review) && SEMANTIC_CHECKS.every(key => review.checks[key].status === 'pass');
  if (issues.length || !reviewed) return { status: secondPassComplete ? 'needs_review' : 'needs_second_pass', issues: [...issues, ...(!reviewed ? ['IMPACT_INDEPENDENT_REVIEW_REQUIRED'] : [])] };
  return { status: 'ready', issues: [] };
}
