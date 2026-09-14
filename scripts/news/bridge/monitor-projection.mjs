import { JOB_ID } from './contract.mjs';

// Internal projection for runBridgeMonitor/updateProcessorHealth. Retain every
// field their decisions read, without retaining private articles in server RAM.
// Iterate SQLite rows individually; the source journal is never rewritten.
export function monitorJob(job) {
  if (!job) return job;
  const input = {}, seen = new Set();
  let source = job.input, target = input;
  while (source && typeof source === 'object' && !seen.has(source)) {
    seen.add(source);
    for (const key of ['job_id', 'job_type', 'created_at', 'impact_version', 'semantics_revision', 'backfill']) target[key] = source[key];
    target.discovery = { trigger_type: source.discovery?.trigger_type };
    source = source.original_input;
    if (source && typeof source === 'object' && !seen.has(source)) target = target.original_input = {};
  }
  const assessment = job.semantic_review?.assessment;
  return { input, status: job.status, created_at: job.created_at, backfill: job.backfill,
    ack: Boolean(job.ack), accepted: { record: Boolean(job.accepted?.record) }, last_error: Boolean(job.last_error),
    publication_gate: { status: job.publication_gate?.status, review_job_id: job.publication_gate?.review_job_id },
    semantic_review: { assessment: assessment ? { version: assessment.version, semantics_revision: assessment.semantics_revision } : null },
    corrections: { length: job.corrections?.length || 0 } };
}

export function monitorStore(store) {
  return {
    all: () => store.monitorJobs(),
    get: id => {
      // Preserve the individual remote store.get contract for review pointers.
      if (!JOB_ID.test(id)) throw Error('BRIDGE_JOB_ID_INVALID');
      return monitorJob(store.get(id));
    },
    observation: key => store.observation(key),
    observe: (key, value) => store.observe(key, value),
  };
}
