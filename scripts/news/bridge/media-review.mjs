import {parsePacket} from './contract.mjs';
import {MEDIA_REVIEW_SCHEMA} from './media-review-schema.mjs';
import {MEDIA_ANALYSIS_VERSION, mediaTriggerForAnalysis, sanitizeMediaImpact, mediaImpactValidationErrors} from '../media-impact.mjs';
// A missing first-pass classification is work for the independent reviewer,
// never an automatic finding that a media effect is absent.
export function needsMediaReview(record = {}) {
  return record.media_review_required === true && !record.analysis?.media_impact;
}

export function reviewedMediaRecord(record, output) {
  if (!needsMediaReview(record)) return record;
  const check = output.media_applicability;
  if (!check || typeof check.relevant !== 'boolean' || typeof check.reason !== 'string' || check.reason.trim().length < 30) {
    throw Error('MEDIA_INDEPENDENT_REVIEW_REQUIRED');
  }
  if (!check.relevant) return {...record, analysis:{...record.analysis, media_impact:structuredClone(check)}};
  try { parsePacket(JSON.stringify(check),MEDIA_REVIEW_SCHEMA); }
  catch { throw Error('MEDIA_IMPACT_REQUIRED'); }
  const story={...record,sources:[...(record.sources || record.source_snapshot || []),...(record.impact_sources || [])]};
  const trigger=mediaTriggerForAnalysis(record.analysis,story);
  const {media_impact,dropped}=sanitizeMediaImpact(check,story,trigger);
  // Reject unsupported evidence instead of letting normalization downgrade a
  // reviewer assertion and silently treat the resulting object as approved.
  const issues=dropped.filter(i=>i!=='MEDIA_USAGE_DERIVED_FROM_HEADLINE');
  const analysis={...record.analysis,media_analysis_version:MEDIA_ANALYSIS_VERSION,media_impact};
  issues.push(...mediaImpactValidationErrors(analysis,story,trigger));
  if(check.self_frame_check.rewrite_required)issues.push('MEDIA_SELF_FRAME_REWRITE_REQUIRED');
  if(issues.length)throw Object.assign(Error('MEDIA_COMPLETION_INVALID'),{issues:[...new Set(issues)]});
  return {...record,analysis};
}
