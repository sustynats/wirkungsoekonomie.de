// Completed paid outputs from the failed 26 October runner remain encrypted in
// its immutable artifacts. Recover only spending/attempt receipts here; neither
// an unpublished answer nor a new publication/review decision enters Git.
import {recoverUsageReport} from './recover-failed-usage.mjs';

const run = Object.freeze({id: 40321851363, conclusion: 'failure',
  created_at: '2026-10-26T12:21:01Z', updated_at: '2026-10-26T12:44:53Z',
  html_url: 'https://github.com/sustynats/wirkungsoekonomie.de/actions/runs/40321851363'});
const evidence = Object.freeze({run_id: run.id, recovery_artifact_id: 12650697316,
  recovery_sha256: '48147f0ccfb99957166a981e92518ab4f2fe2e27d94e9dc44748eb71afddd20e',
  raw_artifact_id: 12651130768,
  raw_sha256: 'bb7dd22ab2858493c7c0cf0c74695d1b316512e4e659eee2423d49e1fcbb57eb'});
const report = Object.freeze({started_at: '2026-10-26T12:33:54.295Z', completed_at: '2026-10-26T12:41:23.849Z',
  berlin_slot: 'Automatischer Lauf 13:00', processing_version: '2026-09-15-direct-3',
  ai_calls: 2, ai_stories: 2, input_tokens: 29980, output_tokens: 13082,
  estimated_cost_usd: 0.021694, token_source: 'provider_reported_usage', published_stories: 0, updated_stories: 1});
const fingerprints = Object.freeze({
  'wt-c637d82374e8e890': ['49b0a7fecb9fb9e301978b5c31227db174740a15888d0231a298ee154efe7927', '8d44c7fceae1a485638a7bf0f2bcfdbd21b0056f71e0a458359cefd43875cee4'],
  'wt-2c796868270ba89b': ['1387768cee6abb9462b6af642ed474b1517c78697035960f76a6e3259585a701', '3a69a3786d91d8b22b62949b3b5c112c5c77623d96690a4b034799ee9839a5aa'],
});

export function documentedFailedPaidAttempts(storyId) {
  if (!Object.hasOwn(fingerprints, storyId)) return [];
  const [fingerprint, evidence_fingerprint] = fingerprints[storyId];
  return [{version: report.processing_version, fingerprint, evidence_fingerprint_version: 'paid-input-evidence-1', evidence_fingerprint,
    first_failed_at: report.started_at, failed_at: report.started_at, retry_after: '2026-10-26T12:48:54.295Z', retry_count: 1,
    recovery: {...evidence, provider_outcome: 'completed_quality_held', publication_committed: false}}];
}

export function recoverDocumentedFailedPaidUsage(usage, now) {
  if (!Number.isFinite(Date.parse(now))) throw Error('PAID_RECOVERY_TIME_INVALID');
  if (Date.parse(now) < Date.parse(run.updated_at)) return {recovered: false, reason: 'before_completed_run'};
  const recovered = recoverUsageReport(usage, report, run, now);
  return {recovered, ...evidence, provider_called: false};
}
