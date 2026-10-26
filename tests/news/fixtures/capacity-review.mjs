// Synthetic capacity envelopes only; never imported by production code.
export function capacityReview(story, at) {
  return {detected_at: at, content_hash: story.content_hash, sources: structuredClone(story.sources),
    reason: 'AI_BUDGET_OR_BATCH_LIMIT', quality_errors: [], quality_retry_count: 0, quality_retry_after: null,
    reassessment: false, fresh: false, consolidation: false,
    source_integrity: {status: 'verified', publication_status: 'eligible', checked_at: at, issue_codes: [], warning_codes: []}};
}
