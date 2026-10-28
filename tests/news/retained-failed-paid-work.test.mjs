import test from 'node:test';
import assert from 'node:assert/strict';
import {documentedFailedPaidAttempts, recoverDocumentedFailedPaidUsage} from '../../scripts/news/retained-failed-paid-work.mjs';

test('the two confirmed paid inputs retain spending locks without exposing answers', () => {
  for (const id of ['wt-c637d82374e8e890', 'wt-2c796868270ba89b']) {
    const [attempt] = documentedFailedPaidAttempts(id);
    const count = id === 'wt-c637d82374e8e890' ? 2 : 1;
    assert.equal(attempt.retry_count, count); assert.match(attempt.fingerprint, /^[a-f0-9]{64}$/);
    assert.match(attempt.evidence_fingerprint, /^[a-f0-9]{64}$/);
    assert.equal(attempt.recovery.run_id, 40321851363);
    assert.equal(attempt.recovery.provider_outcome, 'completed_quality_held');
    assert.equal(attempt.recovery.publication_committed, false);
    assert.ok(!JSON.stringify(attempt).includes('answer'));
    attempt.retry_count = 0;
    assert.equal(documentedFailedPaidAttempts(id)[0].retry_count, count, 'callers cannot reset either retained receipt');
  }
  assert.deepEqual(documentedFailedPaidAttempts('wt_20261009T210310Z_ca8c7e26149310de572a1b17'), []);
  assert.deepEqual(documentedFailedPaidAttempts('__proto__'), []);
  assert.deepEqual(documentedFailedPaidAttempts('unrelated'), []);
});

test('the failed-run cost is booked once and never counted as a publication', () => {
  const before = {run_id: 'existing', ai: {requests: 1, estimated_cost_usd: 0.03}};
  const usage = {runs: [structuredClone(before)]};
  assert.equal(recoverDocumentedFailedPaidUsage(usage, '2026-10-26T12:44:00Z').recovered, false);
  assert.equal(usage.runs.length, 1);
  assert.equal(recoverDocumentedFailedPaidUsage(usage, '2026-10-26T13:00:00Z').recovered, true);
  assert.deepEqual(usage.runs[0], before);
  assert.equal(usage.runs.length, 2);
  const recovered = structuredClone(usage.runs[1]);
  assert.equal(recovered.ai.requests, 2); assert.equal(recovered.ai.estimated_cost_usd, 0.021694);
  assert.equal(recovered.ai.input_tokens, 29980); assert.equal(recovered.ai.output_tokens, 13082);
  assert.equal(recovered.counts.published_stories, 0); assert.equal(recovered.counts.updated_stories, 0);
  assert.equal(recovered.recovery.publication_committed, false);
  assert.equal(recoverDocumentedFailedPaidUsage(usage, '2026-10-27T13:00:00Z').recovered, false);
  assert.deepEqual(usage.runs[1], recovered);
});

test('the two completed but uncommitted cancellation inputs retain their own immutable spending receipts', () => {
  const evidence = ['06f142b17013d7a956808cd4e4b64186e571e123c93d9977e22e0564410dc6ff',
    '54886038c43db25f67909d2514e2e8491e2bc53078fb60223e568dade19bab71'];
  for (const [i, id] of ['wt-715a06a921b3b78c', 'wt-01433c0b78d3c46b'].entries()) {
    const [attempt] = documentedFailedPaidAttempts(id);
    assert.equal(attempt.evidence_fingerprint, evidence[i]);
    assert.equal(attempt.retry_count, 1);
    assert.equal(attempt.recovery.run_id, 40760217932);
    assert.equal(attempt.recovery.provider_outcome, 'completed_uncommitted');
    assert.equal(attempt.recovery.publication_committed, false);
    assert.equal(attempt.recovery.raw_artifact_id, 12849864754);
    assert.equal(attempt.recovery.recovery_artifact_id, 12851371088);
    attempt.recovery.publication_committed = true;
    attempt.retry_count = 0;
    assert.equal(documentedFailedPaidAttempts(id)[0].retry_count, 1);
    assert.equal(documentedFailedPaidAttempts(id)[0].recovery.publication_committed, false);
  }
});

test('confirmed cancelled-run spending is booked once after completion and preserves the later successful run', () => {
  const usage = {runs: []};
  recoverDocumentedFailedPaidUsage(usage, '2026-10-28T21:00:58Z');
  assert.equal(usage.runs.length, 1, 'the cancellation has not completed yet');
  const later = {run_id: 'news-run-03bc45f22eb5', started_at: '2026-10-28T21:06:50.720Z',
    ai: {requests: 2, estimated_cost_usd: 0.024593}, counts: {published_stories: 2}};
  usage.runs.push(structuredClone(later));
  const result = recoverDocumentedFailedPaidUsage(usage, '2026-10-28T21:35:00Z');
  assert.equal(result.recovered, true);
  assert.equal(result.provider_called, false);
  assert.equal(result.recoveries.find(row => row.run_id === 40760217932).recovered, true);
  assert.equal(usage.runs.length, 3);
  assert.deepEqual(usage.runs[1], later);
  const recovered = structuredClone(usage.runs[2]);
  assert.equal(recovered.ai.requests, 2);
  assert.equal(recovered.ai.input_tokens, 37954);
  assert.equal(recovered.ai.output_tokens, 14728);
  assert.equal(recovered.ai.estimated_cost_usd, 0.025264);
  assert.equal(recovered.counts.published_stories, 0);
  assert.equal(recovered.recovery.report_published_stories, 2);
  assert.equal(recovered.recovery.publication_committed, false);
  assert.equal(recoverDocumentedFailedPaidUsage(usage, '2026-10-28T22:00:00Z').recovered, false);
  assert.equal(usage.runs.length, 3);
  assert.deepEqual(usage.runs[2], recovered);
});
