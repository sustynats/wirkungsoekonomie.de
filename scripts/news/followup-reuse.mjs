import { createHash } from 'node:crypto';
import { sourceReviewFingerprint } from './evidence-packets.mjs';

// Scheduling is not new evidence. Bind the wait to substantive source fields,
// never to a generated headline, version number, ingestion time or run clock.
export function followupEvidenceFingerprint(sources = []) {
  if (!sources.length) return null;
  return createHash('sha256').update(JSON.stringify(sources.map(sourceReviewFingerprint).sort())).digest('hex');
}

const bindings = sources => JSON.stringify((sources || []).map(source =>
  [source.source_id, source.url, source.content_hash]).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))));

export function unchangedPublishedFollowup(candidate) {
  const old = candidate.existing_story, latest = old?.versions?.at(-1);
  const reason = old?.pending_update?.reason;
  return Boolean(candidate.followup_due && old?.published && old.listed !== false
    && !candidate.reassessment && !candidate.impact_reassessment && !candidate.deepening_due
    && !candidate.consolidation && !old.pending_update?.consolidation
    && (!reason || ['AI_BUDGET_OR_BATCH_LIMIT', 'AI_HOURLY_CALL_LIMIT', 'AI_RUN_TIME_LIMIT', 'AI_DISABLED'].includes(reason))
    && !(old.pending_update?.quality_errors || []).length
    && old.impact_semantic_review?.status === 'ready' && old.impact_assessment?.publication_status === 'ready'
    && latest?.version === old.current_version && Number.isFinite(Date.parse(latest.analyzed_at))
    && latest.content_hash && latest.content_hash === old.content_hash && candidate.content_hash === old.content_hash
    && (old.sources || []).every(source => source.source_id && source.url && source.content_hash)
    && bindings(latest.source_versions) === bindings(old.sources)
    && followupEvidenceFingerprint(candidate.sources)
    && followupEvidenceFingerprint(candidate.sources) === followupEvidenceFingerprint(old.sources));
}

export function waitForFollowupEvidence(candidate, now) {
  if (!unchangedPublishedFollowup(candidate)) throw Error('FOLLOWUP_REUSE_NOT_ESTABLISHED');
  const { pending_update: _pendingUpdate, ...record } = candidate.existing_story;
  const fingerprint = followupEvidenceFingerprint(candidate.sources);
  record.followups = (record.followups || []).map(followup =>
    !['resolved', 'cancelled'].includes(followup.status) && Date.parse(followup.follow_up_date) <= Date.parse(now)
      ? { ...followup, evidence_wait: { source_fingerprint: fingerprint, registered_at: now,
        reason: 'NO_NEW_SOURCE_EVIDENCE', last_paid_version: record.current_version } }
      : followup);
  // This is a free comparison with an existing published version, not a fresh
  // full-text investigation or a finding that the original question is resolved.
  return record;
}
