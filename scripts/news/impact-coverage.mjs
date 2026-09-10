import { IMPACT_VERSION, IMPACT_KEYS, impactAssessmentErrors } from './impact-assessment.mjs';
import { derivePublicationStatus } from './impact-publication.mjs';
import { hash } from './bridge/contract.mjs';
import { assessmentBasis } from './migrate-impact-assessments.mjs';
export const assessableRecord = r => (r.published || r.status === 'published') && !r.manual_authority && r.format !== 'book_review' && !r.book;
export const impactSources = r => [...(r.sources || r.source_snapshot || []), ...(r.impact_sources || [])];
export function impactCoverage(records, { publicHtml = [], minimumMaterialCounts = {} } = {}) {
  const report = { version:IMPACT_VERSION, active_stories:0, fully_assessed:0, needs_reassessment:0, high_needs_reassessment:0,
    invalid_assessment:0, material_without_magnitude:0, potential_without_magnitude:0, dimensions_without_path:0, public_debug_fallbacks:0, material:0,not_material:0,magnitude_null:0,
    open_directions:0, grounded_open_directions:0, technical_open_directions:0,
    by_dimension:Object.fromEntries(IMPACT_KEYS.map(k=>[k,{modelled:0,material:0,not_material:0,insufficient_basis:0,magnitudes:Object.fromEntries([0,1,2,3,4,5].map(n=>[n,0]))}])), errors:[] };
  for (const record of records.filter(assessableRecord)) {
    report.active_stories++;
    const a = record.impact_assessment, errors=impactAssessmentErrors(a,impactSources(record),{required:true});
    if (record.impact_assessment_basis !== assessmentBasis(record)) errors.push('IMPACT_COVERAGE_BASIS_MISMATCH');
    if (a?.publication_status !== 'ready' || record.impact_semantic_review?.status !== 'ready') errors.push('IMPACT_COVERAGE_REVIEW_REQUIRED');
    const valid = !errors.length;
    if (valid) report.fully_assessed++; else {
      report.invalid_assessment++;report.needs_reassessment++;
      if (['high','very_high','critical'].includes(a?.systemic_relevance)) report.high_needs_reassessment++;
      report.errors.push({id:record.analysis_id||record.story_id,errors:[...new Set(errors)]});
    }
    for (const key of IMPACT_KEYS) {
      const d=a?.dimensions?.[key], counts=report.by_dimension[key];
      if (!d?.primary_paths?.length) report.dimensions_without_path++;
      if (!Number.isInteger(d?.magnitude)||d.magnitude<0||d.magnitude>5)report.potential_without_magnitude++;
      if (!d) continue;
      if(d.path_status==='modelled')counts.modelled++;
      if(d.path_status==='modelled'&&d.magnitude>0){report.material++;counts.material++;}
      if (d.path_status==='material') { report.material++;counts.material++; if (!Number.isInteger(d.magnitude)||d.magnitude<1||d.magnitude>5)report.material_without_magnitude++; }
      if (d.path_status==='not_material') {report.not_material++;counts.not_material++;}
      if (d.path_status==='insufficient_basis') counts.insufficient_basis++;
      if (d.magnitude===null)report.magnitude_null++;
      if (Number.isInteger(d.magnitude)&&d.magnitude>=0&&d.magnitude<=5)counts.magnitudes[d.magnitude]++;
      if (d.direction==='open') {report.open_directions++; if(valid)report.grounded_open_directions++;else report.technical_open_directions++;}
    }
  }
  report.public_debug_fallbacks = publicHtml.filter(html=>/Keine Größenschätzung vorhanden|kein(?: belastbarer| wesentlicher)? Wirkpfad/iu.test(html)).length;
  report.filter_count_regressions = IMPACT_KEYS.filter(key=>Number(minimumMaterialCounts[key])>0 && report.by_dimension[key].material<minimumMaterialCounts[key]);
  report.pass = report.active_stories>0 && report.invalid_assessment===0 && report.material_without_magnitude===0
    && report.potential_without_magnitude===0 && report.dimensions_without_path===0 && report.public_debug_fallbacks===0 && report.needs_reassessment===0 && report.filter_count_regressions.length===0;
  return report;
}
export function assertImpactCoverage(report) {
  if (!report.pass) throw Object.assign(Error('IMPACT_COVERAGE_RELEASE_BLOCKED'), {report});
  return report;
}
// Only impact metadata is promoted. An intervening news revision invalidates
// its staged profile, rather than silently replacing a newer article snapshot.
export function prepareImpactPromotion(records, jobs) {
  const ready = jobs.filter(j=>j.input?.job_type==='impact_reassessment' && !j.input.test_only && j.staging?.impact_record && j.semantic_review?.gate?.status==='ready');
  const promoted = records.map(record=>{
    if (!assessableRecord(record)) return record;
    const id=record.analysis_id||record.story_id;
    const job=ready.filter(j=>j.input.binding.id===id && j.input.binding.basis===assessmentBasis(record))
      .sort((a,b)=>String(b.accepted_at).localeCompare(String(a.accepted_at)))[0];
    if (!job) return record;
    const staged=job.staging.impact_record;
    if (!job.accepted || job.accepted.decision !== 'publish' || job.staging.impact_record_hash !== hash(staged)
      || job.accepted.output_hash !== job.semantic_review.output_hash
      || staged.impact_import?.output_hash !== job.accepted.output_hash
      || staged.impact_import?.assessment_hash !== hash(job.semantic_review.assessment)
      || staged.impact_semantic_review?.review_job_id !== job.semantic_review.review_job_id
      || job.input.binding.previous_impact !== hash(record.impact_assessment)
      || staged.impact_assessment_basis !== assessmentBasis(staged)
      || derivePublicationStatus(staged.impact_assessment,staged,{review:job.semantic_review.review,secondPassComplete:true}).status !== 'ready') return record;
    const result=structuredClone(record);
    for (const key of ['original_potential_assessment','current_potential_assessment','observed_effects','impact_assessment','impact_sources','impact_history','impact_claims','impact_import','impact_assessment_basis','impact_semantic_review']) result[key]=structuredClone(staged[key]);
    return result;
  });
  return {records:promoted,report:impactCoverage(promoted)};
}
