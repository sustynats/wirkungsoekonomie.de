// Completed paid outputs from the failed/cancelled runners remain encrypted in
// its immutable artifacts. Recover only spending/attempt receipts here; neither
// an unpublished answer nor a new publication/review decision enters Git.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {repositoryJson} from './newsroom-store.mjs';
import {recoverUsageReport, verifyInterruptedPaidRuns} from './recover-failed-usage.mjs';

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
  'wt-c637d82374e8e890': ['49b0a7fecb9fb9e301978b5c31227db174740a15888d0231a298ee154efe7927', '8d44c7fceae1a485638a7bf0f2bcfdbd21b0056f71e0a458359cefd43875cee4', 2],
  'wt-2c796868270ba89b': ['1387768cee6abb9462b6af642ed474b1517c78697035960f76a6e3259585a701', '3a69a3786d91d8b22b62949b3b5c112c5c77623d96690a4b034799ee9839a5aa', 1],
});

// The 28 October runner completed two paid answers before cancellation during
// atomic publication. Its complete recovery bundle and sealed originals were
// verified before binding these receipts. Feed-clock changes are not new input.
const cancelledRun = Object.freeze({id: 40760217932, conclusion: 'cancelled',
  created_at: '2026-10-28T20:06:01Z', updated_at: '2026-10-28T21:00:59Z',
  html_url: 'https://github.com/sustynats/wirkungsoekonomie.de/actions/runs/40760217932'});
const cancelledEvidence = Object.freeze({run_id: cancelledRun.id, recovery_artifact_id: 12851371088,
  recovery_sha256: 'cca3a42317447e9257d922685ade12a3bdbaf6bedf3dbf06f4af6d3f3cfe3923',
  raw_artifact_id: 12849864754,
  raw_sha256: '830c0f36491b93cf076546f24e390c7f5e91cd6f2e71cca7b74b33139c1dbbd8'});
const cancelledReport = Object.freeze({started_at: '2026-10-28T20:26:07.083Z', completed_at: '2026-10-28T20:33:53.995Z',
  berlin_slot: 'Automatischer Lauf 21:00', processing_version: '2026-09-15-direct-3',
  ai_calls: 2, ai_stories: 2, input_tokens: 37954, output_tokens: 14728,
  estimated_cost_usd: 0.025264, token_source: 'provider_reported_usage', published_stories: 2, updated_stories: 0});
const cancelledFingerprints = Object.freeze({
  'wt-715a06a921b3b78c': ['870f8f40ece586ac674767805fcb39b46217967642f2e8c4d1d4af41fd94da08', '06f142b17013d7a956808cd4e4b64186e571e123c93d9977e22e0564410dc6ff', '599c271b7dfab84d69fc7b084127fd1f3f5bfb1d1c44fef85565e167c0d2de87'],
  'wt-01433c0b78d3c46b': ['8d80d4cdc153cea572b698b67880cad5994ad436448e9dfb54afc1dc807e34cf', '54886038c43db25f67909d2514e2e8491e2bc53078fb60223e568dade19bab71', 'a66a43ab038fbfc167b6ddb011b642cce63de32282bb65d007273035c8071ac6'],
});

export function documentedFailedPaidAttempts(storyId) {
  if (Object.hasOwn(cancelledFingerprints, storyId)) {
    const [fingerprint, evidence_fingerprint, retained_visual_source_sha256] = cancelledFingerprints[storyId];
    return [{version: cancelledReport.processing_version, fingerprint,
      evidence_fingerprint_version: 'paid-input-evidence-1', evidence_fingerprint,
      first_failed_at: cancelledReport.started_at, failed_at: cancelledReport.completed_at,
      retry_after: cancelledRun.updated_at, retry_count: 1,
      recovery: {...cancelledEvidence, retained_visual_source_sha256,
        provider_outcome: 'completed_uncommitted', publication_committed: false}}];
  }
  if (!Object.hasOwn(fingerprints, storyId)) return [];
  const [fingerprint, evidence_fingerprint, retry_count] = fingerprints[storyId];
  const repeated = retry_count === 2;
  return [{version: report.processing_version, fingerprint, evidence_fingerprint_version: 'paid-input-evidence-1', evidence_fingerprint,
    first_failed_at: report.started_at, failed_at: repeated ? '2026-10-26T12:51:03.302Z' : report.started_at,
    retry_after: repeated ? '2026-10-26T13:06:03.302Z' : '2026-10-26T12:48:54.295Z', retry_count,
    recovery: {...evidence, provider_outcome: 'completed_quality_held', publication_committed: false,
      ...(repeated ? {additional_attempt: {run_id:40323807371,raw_artifact_id:12652705406,
        raw_sha256:'01247d414109c637733a9d54294d097a695d765b5ed677db2d8ce10de2c979f7',recovery_artifact_id:12651569235,
        recovery_sha256:'5d3206dce6171297f4da5745cd465ebecb4ec98f42d8fcb5688f868182a45e8f'}} : {})}}];
}

export function recoverDocumentedFailedPaidUsage(usage, now) {
  if (!Number.isFinite(Date.parse(now))) throw Error('PAID_RECOVERY_TIME_INVALID');
  if (Date.parse(now) < Date.parse(run.updated_at)) return {recovered: false, reason: 'before_completed_run'};
  const recoveries = [{recovered: recoverUsageReport(usage, report, run, now), ...evidence}];
  if (Date.parse(now) >= Date.parse(cancelledRun.updated_at)) {
    recoveries.push({recovered: recoverUsageReport(usage, cancelledReport, cancelledRun, now), ...cancelledEvidence});
  }
  return {recovered: recoveries.some(row => row.recovered), recoveries, provider_called: false};
}

export function runInterruptedPaidPreflight({root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..'),
  now = new Date().toISOString(), env = process.env, gh, write = true} = {}) {
  const file = path.join(root, 'data/news/usage.json');
  const usage = JSON.parse(fs.readFileSync(file, 'utf8'));
  const guard = verifyInterruptedPaidRuns({usage, now, runId:env.GITHUB_RUN_ID,
    runAttempt:env.GITHUB_RUN_ATTEMPT, gh, documentedAttempts:documentedFailedPaidAttempts});
  if (write) fs.writeFileSync(file, repositoryJson(usage));
  return {version:guard.version,status:guard.status,checked_at:guard.checked_at,
    unresolved_run_ids:guard.unresolved_run_ids,unresolved_reasons:guard.unresolved_reasons,verification_error:guard.verification_error,
    recovered_runs:guard.recovered_runs,provider_called:false};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.argv.includes('--preflight')) throw Error('PAID_PREFLIGHT_MODE_REQUIRED');
  console.log(JSON.stringify(runInterruptedPaidPreflight({write:!process.argv.includes('--dry-run')})));
}
