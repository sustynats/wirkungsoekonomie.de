// The ticker models a potential in every dimension. These are conditional
// analytical statements, never evidence that the proposed consequence exists.
import { aggregateMainPaths, pathwayMagnitudeErrors } from './impact-magnitude.mjs';

export const POTENTIAL_REVISION = 'all-dimensions-1';
export const POTENTIAL_KEYS = ['human', 'planet', 'democracy'];
export const PATH_QUALITIES = ['direct', 'indirect', 'weak', 'systemic', 'high_uncertainty'];
const text = value => typeof value === 'string' && value.trim().length >= 12;
const score = value => Number.isInteger(value) && value >= 0 && value <= 5;
const list = value => Array.isArray(value) ? value : [];
const evidence = value => ['high', 'medium', 'low', 'not_assessable'].includes(value);
const likelihood = value => ['very_low', 'low', 'medium', 'high', 'very_high', 'already_occurring', 'unknown'].includes(value);

export function potentialDimensionErrors(assessment, sourceIds) {
  const errors = [], fail = code => errors.push(code);
  const bound = ids => Array.isArray(ids) && ids.length > 0 && ids.every(id => sourceIds.has(id));
  if (assessment.semantics_revision !== POTENTIAL_REVISION) fail('IMPACT_POTENTIAL_REVISION_REQUIRED');
  for (const key of POTENTIAL_KEYS) {
    const d = assessment.dimensions?.[key], suffix = code => fail(`${code}:${key}`);
    if (!d || d.path_status !== 'modelled') { suffix('IMPACT_POTENTIAL_PATH_REQUIRED'); continue; }
    if (!score(d.magnitude)) suffix('IMPACT_POTENTIAL_MAGNITUDE_REQUIRED');
    if (!['positive', 'negative', 'mixed', 'neutral', 'open'].includes(d.direction)) suffix('IMPACT_DIRECTION_INVALID');
    if (!evidence(d.evidence) || !likelihood(d.likelihood) || !['ex_ante', 'ongoing'].includes(d.temporal_status)
      || !['modelled', 'estimated'].includes(d.data_status)) suffix('IMPACT_POTENTIAL_STATUS_INVALID');
    if (!text(d.rationale)) suffix('IMPACT_RATIONALE_REQUIRED');
    if (d.temporal_status==='ongoing' && !list(d.primary_paths).some(p=>p.temporal_status==='ongoing' && text(p.observed_signal?.change) && bound(p.observed_signal?.source_ids))) suffix('IMPACT_EMERGING_SIGNAL_REQUIRED');
    if (d.temporal_status==='ex_ante' && d.likelihood==='already_occurring') suffix('IMPACT_LIKELIHOOD_TIME_CONFLICT');
    if (!list(d.primary_paths).length || !Array.isArray(d.secondary_paths)) suffix('IMPACT_POTENTIAL_PATH_REQUIRED');
    for (const p of [...list(d.primary_paths), ...list(d.secondary_paths)]) {
      if (!text(p?.label) || !text(p.mechanism) || !list(p.recipients).some(text) || !text(p.reference_space) || !text(p.time_horizon)
        || !text(p.condition) || !text(p.first_order) || !text(p.second_order) || !text(p.third_order)) suffix('IMPACT_POTENTIAL_SCOPE_REQUIRED');
      if (!Array.isArray(p?.path_quality) || !p.path_quality.length || p.path_quality.some(q => !PATH_QUALITIES.includes(q))) suffix('IMPACT_PATH_QUALITY_REQUIRED');
      if (!score(p?.magnitude) || !evidence(p.evidence) || !likelihood(p.likelihood)
        || !['positive', 'negative', 'neutral', 'open'].includes(p.direction)
        || !['ex_ante', 'ongoing'].includes(p.temporal_status)
        || !['main_path', 'counter_path', 'side_effect', 'side_risk'].includes(p.type)
        || typeof p.same_target !== 'boolean' || typeof p.same_baseline !== 'boolean') suffix('IMPACT_PATH_INVALID');
      if (!bound(p?.source_ids)) suffix('IMPACT_PATH_SOURCE_BINDING_REQUIRED');
      if (!['supported_mechanism', 'model_hypothesis'].includes(p?.epistemic_basis) || !text(p.assumptions)) suffix('IMPACT_MODEL_BASIS_REQUIRED');
      // A weak indirect pathway can be sourced at its starting point while its
      // causal extension remains explicitly an assumption. Do not invent a
      // scientific citation or label that extension as established evidence.
      if (!text(p?.source_support) || !text(p.limitations)) suffix('IMPACT_SOURCE_SCOPE_REQUIRED');
      if (p?.epistemic_basis === 'model_hypothesis' && !['low', 'not_assessable'].includes(p.evidence)) suffix('IMPACT_HYPOTHESIS_EVIDENCE_CONFLICT');
      if (p?.temporal_status === 'ongoing' && (!text(p.observed_signal?.change) || !bound(p.observed_signal?.source_ids))) suffix('IMPACT_EMERGING_SIGNAL_REQUIRED');
      if (p?.temporal_status === 'ex_ante' && p.likelihood === 'already_occurring') suffix('IMPACT_PATH_TIME_CONFLICT');
      if (p?.magnitude === 0 && !text(p.negligibility_rationale)) suffix('IMPACT_ZERO_SCOPE_REQUIRED');
      const range = p?.magnitude_range;
      if (!range || !score(range.lower) || !score(range.upper) || range.lower > p.magnitude || range.upper < p.magnitude || !text(range.rationale)) suffix('IMPACT_POTENTIAL_RANGE_REQUIRED');
      const uncertain = ['low', 'not_assessable'].includes(p?.evidence) || list(p?.path_quality).includes('high_uncertainty');
      if (uncertain && (p.research_pass !== 'second_pass' || !text(p.research_result))) suffix('IMPACT_POTENTIAL_SECOND_PASS_REQUIRED');
      if (!['initial', 'second_pass'].includes(p?.research_pass)) suffix('IMPACT_RESEARCH_PASS_REQUIRED');
      for (const issue of pathwayMagnitudeErrors(p, sourceIds)) suffix(issue);
    }
    for (const p of list(d.primary_paths)) if (!p.same_target || !p.same_baseline || !['main_path', 'counter_path'].includes(p.type)) suffix('IMPACT_MAIN_SCOPE_REQUIRED');
    try {
      const result = aggregateMainPaths(d.primary_paths);
      if (d.direction !== result.direction || d.magnitude !== result.magnitude || d.dominance !== result.dominance) suffix('IMPACT_MAIN_AGGREGATE_MISMATCH');
      if ((d.direction === 'mixed' || result.protection_boundary_decisive) && (!text(d.balance?.rationale)
        || d.balance.protection_boundary_decisive !== result.protection_boundary_decisive
        || d.direction === 'mixed' && d.balance.comparable_material_paths !== (d.dominance === 'balanced'))) suffix('IMPACT_BALANCE_REQUIRED');
    } catch { suffix('IMPACT_MAIN_MAGNITUDE_REQUIRED'); }
    // Observed effects are separate data, not an alternative main-path slot.
    if (d.observed_outcome != null) suffix('IMPACT_USE_SEPARATE_OBSERVED_EFFECTS');
  }
  if (!Array.isArray(assessment.observed_effects)) fail('IMPACT_OBSERVED_EFFECTS_ARRAY_REQUIRED');
  for (const effect of list(assessment.observed_effects)) {
    if (!POTENTIAL_KEYS.includes(effect.dimension) || !text(effect.change) || !bound(effect.source_ids)
      || !['positive', 'negative', 'mixed', 'neutral', 'open'].includes(effect.direction)
      || !['measured', 'observed', 'secondary_source'].includes(effect.data_status)
      || !evidence(effect.evidence) || effect.evidence === 'not_assessable'
      || !['established', 'open'].includes(effect.attribution) || !text(effect.reference_frame)
      || !text(effect.observed_at) || !text(effect.reference_space) || !text(effect.mechanism) || !text(effect.time_horizon)
      || !list(effect.recipients).some(text) || !['ongoing','ex_post'].includes(effect.temporal_status) || !score(effect.magnitude)) fail('IMPACT_OBSERVED_EFFECT_INVALID');
    for (const issue of pathwayMagnitudeErrors(effect, sourceIds)) fail(`IMPACT_OBSERVED_${issue}:${effect.dimension}`);
  }
  return [...new Set(errors)];
}

// Only the importer creates these snapshots. No first-pass model can replace
// an original forecast or backdate a retrospective reconstruction.
export function retainPotentialHistory(record, assessment, { at, jobId, retrospective = false } = {}) {
  if (!Number.isFinite(Date.parse(at))) throw Error('IMPACT_ASSESSMENT_DATE_REQUIRED');
  const snapshot = { assessed_at: at, job_id: jobId || null, origin: retrospective ? 'retrospective_reassessment' : 'current_assessment', assessment: structuredClone(assessment) };
  if (!record.original_potential_assessment) record.original_potential_assessment = structuredClone(snapshot);
  record.current_potential_assessment = snapshot;
  const observations = [...(record.observed_effects || [])];
  for (const effect of assessment.observed_effects || []) {
    const value = JSON.stringify(effect);
    if (!observations.some(item => JSON.stringify(item.effect) === value)) observations.push({ recorded_at: at, job_id: jobId || null, effect: structuredClone(effect) });
  }
  record.observed_effects = observations;
  return record;
}


export const IMPACT_STATUS_LABELS = {potential:'Potenzial',emerging:'Erste / laufende Wirkung',observed:'Beobachtete Wirkung'};
export function deriveImpactStatus(temporalStatus) {
  return ({ex_ante:'potential',ongoing:'emerging',ex_post:'observed'})[temporalStatus] || 'potential';
}
// A category, not a percentage, and never a function of magnitude/evidence.
export function deriveStatusPresentation({direction,temporal_status,magnitude,label,change}) {
  const ringStatus=deriveImpactStatus(temporal_status), sign=({positive:'+',negative:'−',mixed:'±'})[direction];
  const directionLabel=direction==='open'?'? Richtung offen':direction==='neutral'?'neutral':
    ringStatus==='observed'?`${sign} beobachtet`:ringStatus==='emerging'?`${sign} laufende Wirkung`:
    direction==='negative'?'− Risiko':direction==='positive'?'+ Potenzial':'± gegenläufig';
  return {ringStatus,ringLabel:IMPACT_STATUS_LABELS[ringStatus],magnitudeBars:magnitude,directionLabel,shortPathLabel:change||label||'',direction};
}
