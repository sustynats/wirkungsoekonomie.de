import test from 'node:test';
import assert from 'node:assert/strict';
import {documentedFailedPaidAttempts, recoverDocumentedFailedPaidUsage} from '../../scripts/news/retained-failed-paid-work.mjs';

test('the two confirmed paid inputs retain spending locks without exposing answers', () => {
  for (const id of ['wt-c637d82374e8e890', 'wt-2c796868270ba89b']) {
    const [attempt] = documentedFailedPaidAttempts(id);
    assert.equal(attempt.retry_count, 1); assert.match(attempt.fingerprint, /^[a-f0-9]{64}$/);
    assert.match(attempt.evidence_fingerprint, /^[a-f0-9]{64}$/);
    assert.equal(attempt.recovery.run_id, 40321851363);
    assert.equal(attempt.recovery.provider_outcome, 'completed_quality_held');
    assert.equal(attempt.recovery.publication_committed, false);
    assert.ok(!JSON.stringify(attempt).includes('answer'));
    attempt.retry_count = 0;
    assert.equal(documentedFailedPaidAttempts(id)[0].retry_count, 1, 'callers cannot reset the retained receipt');
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
