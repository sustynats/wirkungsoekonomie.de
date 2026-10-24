// An HTTP failure/timeout does not prove that generation never started.
// Keep its request uncertain until an explicit, evidence-backed reconciliation;
// neither elapsed quota windows, new sources nor a merge resolve that write.
export const UNKNOWN_PROVIDER_OUTCOME = 'AI_PROVIDER_OUTCOME_UNKNOWN';

// Verified public report + canonical part at this exact commit. The old runner
// retained a cost reserve but no durable request hold; a later capacity label
// lost the error. This is NOT a reconstruction of the provider's raw response.
const known = {
  'wt-a2be1b69b19102aa': {
    status: 'unknown', error_code: 'AI_PROVIDER_ERROR:520', request_attempts: 1,
    run_id: '40092521984', reported_run_started_at: '2026-10-24T12:21:22.587Z',
    report_commit: 'dc50ae574025c2f6fe60519f02d9b9e3929d8a40',
    report_sha256: '3118e1eb2c0b553951d4016c1a0fc666c5ffd8c98245c5abf73ddae97fae6f71',
    recorded_pending_hash: '28cc0da4c25d43bdfb6abd0cb0f389c5e6c653a46b6b9cad09b7616a193c1651',
    request_binding: 'not_reconstructed', raw_response: 'not_confirmed',
  },
};
const knownFor = story => Object.hasOwn(known, story?.story_id) ? known[story.story_id] : null;

export function unresolvedProviderRequest(story) {
  // Unknown/malformed/newer hold formats also fail closed. No inferred success.
  if (story?.provider_request_hold != null) return story.provider_request_hold;
  return knownFor(story);
}

export function providerOutcomeUncertain(error, { started, costRecorded }) {
  const attempts = Number(error?.requestAttempts ?? 1);
  if (!started || costRecorded || error?.providerNotCalled === true || error?.localRefusal === true
    || attempts === 0) return false;
  // A single explicit rate refusal is not an uncertain generation. An earlier
  // unknown attempt, however, cannot be cleared by the last request's refusal.
  if (attempts === 1 && error?.message === 'AI_PROVIDER_ERROR:429') return false;
  return true;
}

export function holdProviderRequest(record, hold) {
  if (record.provider_request_hold != null) return record;
  return { ...record, provider_request_hold: structuredClone(hold),
    ...(record.pending_update
      ? { pending_update: { ...record.pending_update, reason: UNKNOWN_PROVIDER_OUTCOME } }
      : !record.published ? { pending_reason: UNKNOWN_PROVIDER_OUTCOME } : {}) };
}

export function retainKnownProviderRequests(stories) {
  const changes = [];
  for (let i = 0; i < stories.length; i++) {
    const story = stories[i], hold = knownFor(story);
    if (!hold || story.provider_request_hold != null) continue;
    stories[i] = holdProviderRequest(story, hold);
    changes.push({ story_id: story.story_id, run_id: hold.run_id, reason: UNKNOWN_PROVIDER_OUTCOME });
  }
  return changes;
}
