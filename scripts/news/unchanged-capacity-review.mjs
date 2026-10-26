// A local wording/listing correction does not complete a queued assessment.
// Recognise only the observed, unchanged capacity envelope and leave it intact.
// Paid retry eligibility and provider/review holds remain with the normal runner.
import {sourceReviewFingerprint} from './evidence-packets.mjs';

const keys = new Set(['detected_at', 'content_hash', 'sources', 'reason', 'quality_errors',
  'quality_retry_count', 'quality_retry_after', 'reassessment', 'fresh', 'consolidation', 'source_integrity']);
const fingerprint = source => sourceReviewFingerprint({...source, published_at: null, source_published_at: null});

export function unchangedCapacityReview(story, at) {
  const p = story?.pending_update;
  if (!p || Object.keys(p).some(key => !keys.has(key)) || p.reason !== 'AI_BUDGET_OR_BATCH_LIMIT'
    || p.content_hash !== story.content_hash || !Number.isFinite(Date.parse(at))
    || !Number.isFinite(Date.parse(p.detected_at)) || Date.parse(p.detected_at) > Date.parse(at)
    || Date.parse(p.detected_at) < Date.parse(story.updated_at)
    || p.reassessment !== false || p.fresh !== false || p.consolidation !== false
    || !Array.isArray(p.quality_errors) || p.quality_errors.length
    || p.quality_retry_count !== 0 || p.quality_retry_after !== null) return false;
  const gate = p.source_integrity;
  if (gate?.status !== 'verified' || gate.publication_status !== 'eligible'
    || !Array.isArray(gate.issue_codes) || gate.issue_codes.length
    || !Array.isArray(gate.warning_codes) || gate.warning_codes.length
    || !Number.isFinite(Date.parse(gate.checked_at)) || Date.parse(gate.checked_at) > Date.parse(at)) return false;
  const validSource = source => source && !Array.isArray(source) && typeof source === 'object'
    && source.article_excerpt == null && source.evidence_segments == null
    && ['source_id', 'url', 'content_hash', 'title', 'summary'].every(key => typeof source[key] === 'string');
  if (!Array.isArray(story.sources) || !story.sources.length || !Array.isArray(p.sources)
    || p.sources.length !== story.sources.length || !story.sources.every(validSource) || !p.sources.every(validSource)) return false;
  const paid = story.sources.map(fingerprint).sort(), waiting = p.sources.map(fingerprint).sort();
  return paid.every((value, i) => value === waiting[i]);
}
