import test from 'node:test';
import assert from 'node:assert/strict';
import { callWoekAi } from '../../scripts/news/lib.mjs';
import { costFromUsage, failedRequestCost } from '../../scripts/news/budget.mjs';
import { shouldRetryQualityGate } from '../../scripts/news/run.mjs';

const envelope = { ok: true, model: 'gpt-5.4-mini', usage: { input_tokens: 1000, output_tokens: 500, cached_input_tokens: 200 } };
const cost = 0.002865;
const response = (body, status = 200) => new Response(JSON.stringify(body), { status });
const options = fetchImpl => ({ prompt: 'Local test only', attempts: 3, fetchImpl, retryDelayImpl: async () => {} });

for (const [answer, code] of [['broken', 'AI_MALFORMED_JSON'], ['{"analyses":{}}', 'AI_SCHEMA_ANALYSES_REQUIRED'], ['x'.repeat(40001), 'AI_RESPONSE_TOO_LARGE']]) {
  test(`retains token evidence while rejecting ${code}`, async () => {
    let calls = 0;
    await assert.rejects(callWoekAi([], options(async () => { calls++; return response({ ...envelope, answer }); })), error => {
      assert.equal(error.message, code);
      assert.equal(error.requestAttempts, 1);
      assert.equal(error.promptChars, 15);
      assert.equal(error.billingEvidence.answer, undefined);
      assert.equal(failedRequestCost(error).estimated_cost_usd, cost);
      assert.equal(failedRequestCost(error).input_tokens, 1000);
      return true;
    });
    assert.equal(calls, 1);
  });
}

test('an upstream output failure is not immediately retried as a transport failure', async () => {
  let calls = 0;
  await assert.rejects(callWoekAi([], options(async () => {
    calls++;
    return response({ ...envelope, ok: false, code: 'ANALYSIS_OUTPUT_INVALID', provider_called: true }, 502);
  })), error => {
    assert.equal(error.message, 'AI_PROVIDER_OUTPUT_INVALID');
    assert.equal(failedRequestCost(error).estimated_cost_usd, cost);
    assert.equal(shouldRetryQualityGate('AI_OUTPUT_INVALID', [error.message], 0), true);
    return true;
  });
  assert.equal(calls, 1);
});

test('only reported transport usage counts, never a model-authored billing assertion', async () => {
  await assert.rejects(callWoekAi([], options(async () => response({ ok: true, model: envelope.model, answer: JSON.stringify({ billingEvidence: envelope }) }))), error => {
    assert.equal(failedRequestCost(error).estimated_cost_usd, 0.25);
    return true;
  });
});

test('an earlier unknown request keeps its reserve even when the last failure has usage', async () => {
  let calls = 0;
  await assert.rejects(callWoekAi([], options(async () => ++calls === 1 ? response({}, 503) : response({ ...envelope, answer: 'broken' }))), error => {
    assert.equal(error.requestAttempts, 2);
    assert.equal(failedRequestCost(error).estimated_cost_usd, cost + 0.25);
    return true;
  });
  assert.equal(calls, 2);
  assert.equal(costFromUsage({ ...envelope, reported_usage: envelope.usage, request_attempts: 2 }).estimated_cost_usd, cost + 0.25);
});

test('budget scope is structured, bounded and never accepted as a no-charge proof for earlier attempts', async () => {
  for (const scope of ['news', 'shared', 'untrusted text']) {
    let calls = 0;
    await assert.rejects(callWoekAi([], options(async () => { calls++; return response({ ok: false, code: 'BUDGET_EXHAUSTED', provider_called: false, budget_scope: scope }, 429); })), error => {
      assert.equal(error.budgetScope, scope === 'untrusted text' ? 'unknown' : scope);
      assert.equal(failedRequestCost(error).estimated_cost_usd, 0);
      return true;
    });
    assert.equal(calls, 1);
  }
  assert.equal(failedRequestCost({ requestAttempts: 2, providerNotCalled: true }).estimated_cost_usd, 0.5);
});

test('invalid billing evidence cannot release a reserve or poison the ledger', () => {
  for (const usage of [undefined, { input_tokens: -1, output_tokens: 2 }, { input_tokens: 1.5, output_tokens: 2 }, { input_tokens: 1000, output_tokens: 500, cached_input_tokens: 1001 }, { input_tokens: 1000, output_tokens: 500, cached_input_tokens: '200' }, { input_tokens: Number.MAX_SAFE_INTEGER + 1, output_tokens: 0 }]) {
    const result = failedRequestCost({ requestAttempts: 1, billingEvidence: { model: envelope.model, reported_usage: usage } });
    assert.equal(result.estimated_cost_usd, 0.25);
    assert.equal(result.input_tokens, 0);
  }
  assert.equal(failedRequestCost({ billingEvidence: { model: 'unpriced', reported_usage: envelope.usage } }).estimated_cost_usd, 0.25);
  assert.equal(failedRequestCost({ requestAttempts: 0 }).estimated_cost_usd, 0);
  assert.equal(failedRequestCost({ requestAttempts: 3 }).estimated_cost_usd, 0.75);
});
