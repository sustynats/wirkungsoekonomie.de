import { IMPACT_KEYS, impactAssessmentErrors } from './impact-assessment.mjs';

export const SEMANTIC_CHECKS = ['event_target', 'time_and_observation', 'path_and_recipients', 'direction_and_reference', 'magnitude', 'likelihood', 'evidence', 'materiality', 'second_third_order', 'policy_coverage', 'source_fidelity', 'counterpaths_and_dominance', 'institutional_status', 'counterfactual'];
const text = value => typeof value === 'string' && value.trim().length >= 12;
const sourceText = record => [record.title, record.source_summary, ...[...(record.sources || record.source_snapshot || []), ...(record.impact_sources || [])].map(s => `${s.title || ''} ${s.summary || ''} ${s.article_excerpt || ''}`)].filter(Boolean).join('\n');

// Signals request scrutiny, never produce a political direction or magnitude.
// No party/person/source-name rules are permitted here.
export function impactContextRequirements(record = {}) {
  const material = sourceText(record);
  const power = /(?:Regierungsbildung|Regierungsmehrheit|Regierungsbeteiligung|Koalition|Duldung|Sondierung|politische[\s-]+Zusammenarbeit|Personalentscheidung|Institutionenmacht)/iu.test(material);
  const energy = /(?:Energiepolitik|Energieversorgung|Energiewende|Gasimporte|Gaslieferungen|Kohlekraft|Windkraft|Photovoltaik|CO2-Bepreisung)/iu.test(material);
  const harm = /(?:\b\d+\s+(?:Tote|Verletzte)|(?:getötet|gestorben|ums Leben gekommen|verletzt worden))/iu.test(material)
    && !/(?:könnte|könnten|befürchtet|Szenario).{0,35}(?:Tote|Verletzte|sterben)/iu.test(material);
  return { power, energy, harm, central_dimensions: [...(power ? ['democracy'] : []), ...(energy ? ['planet'] : []), ...(harm ? ['human'] : [])] };
}

export function semanticIssues(assessment, record = {}) {
  const sources = [...(record.sources || record.source_snapshot || []), ...(record.impact_sources || [])];
  const issues = impactAssessmentErrors(assessment, sources, { required: true });
  if (!assessment) return issues;
  const requirements = impactContextRequirements(record), system = assessment.system_check;
  const high = ['high', 'very_high', 'critical'].includes(assessment.systemic_relevance);
  if (!system || !['first_order', 'second_order', 'third_order', 'source_independence', 'institutional_status'].every(k => text(system[k]))
    || !Array.isArray(system.central_dimensions) || !Array.isArray(system.counter_evidence) || !system.counter_evidence.some(text)) issues.push('IMPACT_SYSTEM_CHECK_REQUIRED');
  const central = new Set([...requirements.central_dimensions, ...(system?.central_dimensions || []).filter(k => IMPACT_KEYS.includes(k))]);
  if (high && IMPACT_KEYS.every(k => assessment.dimensions?.[k]?.path_status === 'not_material')) issues.push('IMPACT_HIGH_RELEVANCE_WITHOUT_PATH');
  for (const key of central) {
    const d = assessment.dimensions?.[key];
    if (high && (!d || d.path_status !== 'material' || d.direction === 'open')) issues.push(`IMPACT_CENTRAL_DIMENSION_UNRESOLVED:${key}`);
  }
  if (requirements.power && (assessment.dimensions?.democracy?.path_status !== 'material' || !system?.enablement?.length)) issues.push('IMPACT_POWER_PATH_REQUIRED');
  if (requirements.energy && assessment.dimensions?.planet?.path_status === 'not_material') issues.push('IMPACT_ENERGY_PATH_REVIEW_REQUIRED');
  if (requirements.harm && assessment.dimensions?.human?.temporal_status === 'ex_ante') issues.push('IMPACT_OCCURRED_HARM_AS_RISK');
  for (const key of IMPACT_KEYS) {
    const d = assessment.dimensions?.[key];
    if (!d) continue;
    const explanation = `${d.rationale || ''} ${(d.primary_paths || []).map(p => `${p.label} ${p.mechanism}`).join(' ')}`;
    if (d.direction === 'open' && /(?:würde|würden|erhöht|erhöhen).{0,55}(?:Emissionen erhöhen|Emissionen steigern)|(?:CO2|Emissionen).{0,25}(?:erhöhen|erhöht|steigen)|(?:schwächt|verschlechtert).{0,35}(?:Grundrechte|Kontrolle|Gesundheit)/iu.test(explanation)) issues.push(`IMPACT_DIRECTION_RATIONALE_CONFLICT:${key}`);
  }
  return [...new Set(issues)];
}

// The caller must obtain review from the separately persisted review job, never
// from a review object supplied by the first writer in its own output.
export function derivePublicationStatus(assessment, record = {}, { review = null, secondPassComplete = false } = {}) {
  const issues = semanticIssues(assessment, record);
  if (review?.status === 'blocked') return { status: 'blocked', issues: [...issues, 'IMPACT_REVIEW_BLOCKED'] };
  const reviewed = review?.status === 'ready' && SEMANTIC_CHECKS.every(key => review.checks?.[key]?.status === 'pass' && text(review.checks[key].rationale));
  if (issues.length || !reviewed) return { status: secondPassComplete ? 'needs_review' : 'needs_second_pass', issues: [...issues, ...(!reviewed ? ['IMPACT_INDEPENDENT_REVIEW_REQUIRED'] : [])] };
  return { status: 'ready', issues: [] };
}
