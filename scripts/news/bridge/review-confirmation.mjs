import { structuredSemanticChecks, SEMANTIC_CHECKS } from '../impact-publication.mjs';
import { parsePacket } from './contract.mjs';
import { REVIEW_RESPONSE_FORMAT, reviewResponseFormat, reviewPathAddresses } from './review-response-schema.mjs';

// Transport expansion only. The immutable proposal supplies every editorial
// judgment. The independent reviewer supplies its own research documentation.
// The ordinary source, method and publication gates still run afterwards.
export function expandReviewConfirmation(output, original) {
  if (Object.hasOwn(output,'assessment_result')) {
    if (Object.hasOwn(output,'impact_assessment') || Object.hasOwn(output,'assessment_confirmation')) throw Error('API_REVIEW_CONFIRMATION_CONFLICT');
    const result=output.assessment_result, branches=reviewResponseFormat(original.proposed_assessment,{legacy:true}).schema.properties.assessment_result.anyOf;
    if (!['confirm','replace','hold'].includes(result?.action)) throw Error('API_REVIEW_CONFIRMATION_INVALID');
    parsePacket(JSON.stringify(result),branches.find(branch=>branch.properties.action.enum.includes(result.action)));
    if (result.action === 'hold') {
      if (!['needs_review','blocked'].includes(output.review?.status) || !SEMANTIC_CHECKS.some(key=>output.review.checks?.[key]?.status==='fail')) throw Error('API_REVIEW_HOLD_INVALID');
      output.impact_assessment=structuredClone(original.proposed_assessment);
      output.review.findings=[...(output.review.findings || []),result.reason];
      delete output.assessment_result;
      return output;
    }
    if(result.action==='replace') {
      output.impact_assessment=result.impact_assessment;
      output.assessment_confirmation=null;
    } else {
      output.impact_assessment=null;
      output.assessment_confirmation={...result.confirmation,path_research:reviewPathAddresses(original.proposed_assessment).map(({key,...address})=>({
        ...address,...result.confirmation.path_research[key],
      }))};
    }
    delete output.assessment_result;
  }
  if (!Object.hasOwn(output, 'assessment_confirmation')) return output;
  const confirmation = output.assessment_confirmation;
  if (confirmation === null && output.impact_assessment) {
    delete output.assessment_confirmation;
    return output;
  }
  const fail = () => { throw Error('API_REVIEW_CONFIRMATION_INVALID'); };
  if (original.job_type !== 'impact_semantic_review' || output.impact_assessment !== null
    || !confirmation || !original.proposed_assessment
    || output.review?.status !== 'ready' || !structuredSemanticChecks(output.review)
    || !SEMANTIC_CHECKS.every(key => output.review.checks[key].status === 'pass')) fail();
  parsePacket(JSON.stringify(confirmation), REVIEW_RESPONSE_FORMAT.schema.properties.assessment_confirmation.anyOf[0]);
  const research = confirmation.research_check;
  if (research?.status !== 'completed' || !Array.isArray(research.searches) || !research.searches.length
    || !research.searches.every(s => typeof s.question === 'string' && s.question.trim()
      && typeof s.result === 'string' && s.result.trim())
    || !Array.isArray(confirmation.path_research)) fail();
  const assessment = structuredClone(original.proposed_assessment), seen = new Set();
  for (const item of confirmation.path_research) {
    if (!['human','planet','democracy'].includes(item.dimension)
      || !['primary_paths','secondary_paths'].includes(item.path_set)
      || !Number.isInteger(item.path_index) || item.path_index < 0) fail();
    const key = `${item.dimension}:${item.path_set}:${item.path_index}`;
    const path = assessment.dimensions?.[item.dimension]?.[item.path_set]?.[item.path_index];
    if (!path || seen.has(key) || typeof item.result !== 'string' || item.result.trim().length < 12
      || !Array.isArray(item.search_indices) || !item.search_indices.length
      || !item.search_indices.every(i => Number.isInteger(i) && i >= 0 && i < research.searches.length)) fail();
    seen.add(key);
    path.research_pass = 'second_pass';
    path.research_result = item.result;
  }
  // A first writer's claimed second pass cannot substitute for this review.
  for (const [dimension, value] of Object.entries(assessment.dimensions || {})) {
    for (const pathSet of ['primary_paths','secondary_paths']) {
      for (const [index, path] of (value[pathSet] || []).entries()) {
        const uncertain = ['low','not_assessable'].includes(path.evidence) || path.path_quality?.includes('high_uncertainty');
        if (uncertain && !seen.has(`${dimension}:${pathSet}:${index}`)) fail();
      }
    }
  }
  assessment.research_check = structuredClone(research);
  output.impact_assessment = assessment;
  delete output.assessment_confirmation;
  return output;
}
