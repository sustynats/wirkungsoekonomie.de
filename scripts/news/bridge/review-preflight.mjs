import {reviewedMediaRecord} from './media-review.mjs';
import { verifyImpactResearch } from './impact-research.mjs';
import { derivePublicationStatus, semanticIssues, SEMANTIC_CHECKS } from '../impact-publication.mjs';

// Report independent defects together. Unverified source IDs may be used only
// to diagnose shape/binding errors, never as publication evidence or stored proof.
export async function reviewPreflight(bridge, output, record, now, options = {}) {
  const candidates = output.research_sources || [];
  const sources = [...(record.sources || record.source_snapshot || []), ...(record.impact_sources || [])];
  const diagnosticRecord = {...record, impact_sources:[...(record.impact_sources || []),
    ...(Array.isArray(candidates) ? candidates.map(s => ({source_id:s.source_id})) : [])]};
  const structuralIssues = semanticIssues(output.impact_assessment, diagnosticRecord, {secondPassComplete:true});
  let research;
  try { research = await verifyImpactResearch(bridge, candidates, sources, now, options); }
  catch (error) {
    // Transport outages must reuse the paid response; rewriting cannot repair them.
    if (error.retryable || error.code || error.cause?.code) throw error;
    throw Object.assign(Error('BRIDGE_PUBLICATION_GATE_FAILED'), {
      cause:error, issues:[...new Set([error.message, ...structuralIssues]),
        ...(error.source_repair_context ? ['SOURCE_REPAIR_CONTEXT: Tatsächlich gelesener begrenzter Ausschnitt; die angefragte Behauptung ist damit NICHT verifiziert. Nur belegte Aussagen verwenden, sonst Quelle weglassen und Recherchegrenze dokumentieren. '+JSON.stringify(error.source_repair_context)] : [])],
    });
  }
  let reviewRecord={...record, impact_sources:[...(record.impact_sources || []), ...research]}, mediaIssues=[];
  try { reviewRecord=reviewedMediaRecord(reviewRecord,output); } catch(error) { mediaIssues=[error.message,...(error.issues || [])]; }
  const gate = derivePublicationStatus(output.impact_assessment, reviewRecord, {review:output.review, secondPassComplete:true});
  if(mediaIssues.length){gate.issues.push(...mediaIssues);gate.status='needs_review';}
  const ready = output.review?.status === 'ready' && SEMANTIC_CHECKS.every(key => output.review.checks?.[key]?.status === 'pass');
  if (gate.issues.length && (ready || gate.issues.some(issue => /IMPACT_(?:VERSION|MATERIAL_MAGNITUDE|FACTOR_|MAGNITUDE_CALCULATION|MAIN_AGGREGATE|OBSERVED_DIRECTION|SOURCE_FUNCTION|RESEARCH_RESULT|RESEARCH_CHECK|BOUNDARY_)/.test(issue)))) {
    throw Object.assign(Error('BRIDGE_PUBLICATION_GATE_FAILED'), {issues:gate.issues});
  }
  return {research, reviewRecord, gate};
}
