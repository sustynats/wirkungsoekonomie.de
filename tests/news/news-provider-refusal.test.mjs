import test from 'node:test';
import assert from 'node:assert/strict';
import { callOpenAiDirect, providerBillingRefusal } from '../../scripts/news/openai-transport.mjs';
import { failedRequestCost } from '../../scripts/news/budget.mjs';
import { aiProviderCoverageDegraded } from '../../scripts/news/run.mjs';
import { buildLage, lageProcessingStatus } from '../../scripts/news/lage.mjs';
import { lageBody } from '../../scripts/news/build.mjs';

const errors = [
  ['credit_balance_exhausted', 'AI_PROVIDER_CREDIT_BALANCE_EXHAUSTED'],
  ['organization_spend_limit_exceeded', 'AI_PROVIDER_SPEND_LIMIT_REACHED'],
  ['project_spend_limit_exceeded', 'AI_PROVIDER_SPEND_LIMIT_REACHED'],
  ['organization_usage_limit_exceeded', 'AI_PROVIDER_QUOTA_EXHAUSTED'],
  ['insufficient_quota', 'AI_PROVIDER_QUOTA_EXHAUSTED'],
];
for (const [code, expected] of errors) test(`${code}: first explicit billing refusal is neither retried nor charged`, async () => {
  let calls = 0, delays = 0;
  await assert.rejects(callOpenAiDirect([], { apiKey: 'test-only', prompt: 'Mock request, no network', schema: false,
    retryDelayImpl: async () => { delays++; }, fetchImpl: async () => { calls++; return Response.json({ error: { code, message: 'Private provider text must not become a report' } }, { status: 429 }); } }), error => {
      assert.equal(error.message, expected); assert.equal(error.requestAttempts, 1);
      assert.equal(error.providerNotCalled, true); assert.equal(failedRequestCost(error).estimated_cost_usd, 0);
      assert.equal(aiProviderCoverageDegraded({ ai_provider_failures: 1, ai_provider_errors: [{ error: error.message }] }), true);
      return true;
    });
  assert.equal(calls, 1); assert.equal(delays, 0);
});

test('legacy credit message is classified; temporary and unknown 429 remain distinct', () => {
  assert.equal(providerBillingRefusal(429, { error: { message: 'You have no credits remaining. Add credits.' } }), 'AI_PROVIDER_CREDIT_BALANCE_EXHAUSTED');
  for (const payload of [{}, { error: { code: 'rate_limit_exceeded', type: 'rate_limit_error' } }, { error: { code: 'slow_down' } }]) assert.equal(providerBillingRefusal(429, payload), null);
  assert.equal(providerBillingRefusal(503, { error: { code: 'insufficient_quota' } }), null);
  assert.equal(aiProviderCoverageDegraded({ ai_provider_failures: 1, ai_provider_errors: [{ error: 'AI_PROVIDER_ERROR:429' }] }), false);
});

test('an earlier uncertain request retains its conservative cost reserve', async () => {
  let calls = 0;
  await assert.rejects(callOpenAiDirect([], { apiKey: 'test-only', prompt: 'Mock request', schema: false, retryDelayImpl: async () => {},
    fetchImpl: async () => ++calls === 1 ? Response.json({}, { status: 503 }) : Response.json({ error: { code: 'credit_balance_exhausted' } }, { status: 429 }) }), error => {
      assert.equal(error.requestAttempts, 2); assert.equal(error.providerNotCalled, false);
      assert.equal(failedRequestCost(error).estimated_cost_usd, 0.5); return true;
    });
  assert.equal(calls, 2);
});

const now = '2026-10-08T06:10:00Z';
const report = { completed_at: '2026-10-08T06:09:00Z', eligible_stories: 20, pending_story_count: 20,
  ai_calls_available_this_run: 0, ai_budget_pacing: { paused: true }, source_successes: 20, source_failures: 0 };
test('an empty edition states publication, not absence of relevant news, and shows a fresh processing block', () => {
  const lage = buildLage({ slot: 'morgenlage', now, stories: [], report });
  assert.equal(lage.counts.total, 0);
  assert.match(lage.headline, /Noch keine neue Nachricht/); assert.doesNotMatch(lage.headline, /Keine belastbare/);
  assert.equal(lage.processing_status.state, 'processing_limited');
  const html = lageBody(lage, new Map());
  assert.match(html, /role="status"/); assert.match(html, /keine Feststellung/);
  assert.doesNotMatch(html, /Keine belastbare neue Entwicklung|credits|billing|API_PROVIDER/);
});

test('stale/future/missing reports cannot invent a current outage; source and provider states differ', () => {
  for (const value of [undefined, { ...report, completed_at: '2026-10-07T22:00:00Z' }, { ...report, completed_at: '2026-10-08T06:11:00Z' }]) assert.equal(lageProcessingStatus(value, now), null);
  assert.equal(lageProcessingStatus({ ...report, ai_provider_billing_blocked: true }, now).state, 'provider_unavailable');
  assert.equal(lageProcessingStatus({ ...report, source_successes: 0, source_failures: 5 }, now).state, 'source_unavailable');
  assert.equal(lageProcessingStatus({ ...report, pending_story_count: 0, ai_budget_pacing: { paused: false } }, now), null);
});
