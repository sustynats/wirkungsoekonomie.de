import test from 'node:test';
import assert from 'node:assert/strict';
import { callOpenAiDirect, providerBillingRefusal } from '../../scripts/news/openai-transport.mjs';
import { failedRequestCost } from '../../scripts/news/budget.mjs';
import { aiProviderCoverageDegraded, runWirkungsticker } from '../../scripts/news/run.mjs';
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

const runNow = '2026-09-04T12:00:00.000Z';
const source = { source_id: 'test', publisher_id: 'test', name: 'Test', url: 'https://example.org/', feed_url: 'https://example.org/rss', enabled: true,
  source_type: 'official_rss', primary_source: true, access: { status: 'public', article: 'metadata_only', cost_usd: 0 }, frequency_class: 'high_frequency' };
function runFixture() {
  const stories = [
    ['klimagesetz', 'Bund beschließt Klimagesetz zur Energieversorgung', 'Neue Regeln verändern Investitionen in Energie und Infrastruktur.'],
    ['bildung', 'Bund beschließt Bildungsgesetz nach neuer Vergleichsstudie', 'Ergebnisse in Mathematik begründen neue Regeln für Schulen.'],
  ].map(([slug, title, summary]) => {
    const item = { source_id: 'test', publisher_id: 'test', publisher: 'Test', url: `https://example.org/${slug}`, title, summary, primary_source: true, published_at: runNow };
    return { story_id: `wt-${slug}`, slug, title, published: true, listed: true, first_seen: runNow, last_updated: runNow, published_at: runNow,
      current_version: 2, versions: [{ version: 2, analysis: { summary: 'Unveränderte veröffentlichte Fassung.' } }], analysis: { summary: 'Unveränderte veröffentlichte Fassung.' },
      sources: [item], pending_update: { sources: [item], detected_at: runNow, reason: 'AI_BUDGET_OR_BATCH_LIMIT' } };
  });
  return { dryRun: true, now: runNow, registry: { schema_version: '1.0', sources: [source], policy: {} },
    state: { source_status: {}, seen_items: {}, pending_story_ids: [], relevance_filter_version: '4.0' }, storyStore: { stories }, usage: { runs: [] },
    newsroom: { source_items: {}, events: {}, event_sources: [], discovery_candidates: [], decisions: [] },
    budgetFx: { rate_date: '2026-09-04', rate_usd_per_eur: 1.16 }, fetchFeedImpl: async () => ({ not_modified: true, final_url: source.feed_url }),
    fetchArticleImpl: async () => { throw new Error('No live network in tests'); }, aiBatchDelayImpl: async () => {} };
}
function oneStoryBatches(t) {
  for (const [key, value] of Object.entries({ WIRKUNGSTICKER_PROCESSING_MODE: 'api', WOEK_NEWS_AI_BATCH_SIZE: '1', WOEK_NEWS_MAX_AI_STORIES_PER_RUN: '2' })) {
    const previous = process.env[key]; process.env[key] = value;
    t.after(() => previous === undefined ? delete process.env[key] : process.env[key] = previous);
  }
}
for (const [code, expected] of errors) test(`${code}: the full ticker run retains the safe code and stops the remaining batch`, async t => {
  oneStoryBatches(t);
  const fixture = runFixture(), before = structuredClone(fixture.storyStore);
  let calls = 0, captured;
  const report = await runWirkungsticker({ ...fixture, captureState: value => captured = value,
    callAiImpl: stories => callOpenAiDirect(stories, { apiKey: 'test-only', prompt: 'Mock request, no network', schema: false,
      retryDelayImpl: async () => assert.fail('No retry of a billing refusal'),
      fetchImpl: async () => { calls++; return Response.json({ error: { code, message: 'PRIVATE_PROVIDER_TEXT_abcdefghijklmnopqrstuvwxyz0123456789' } }, { status: 429 }); } }) });
  assert.equal(report.ai_batches_planned, 2, 'both different updates were selected');
  assert.equal(calls, 1); assert.equal(report.ai_calls, 1); assert.equal(report.ai_provider_failures, 1);
  assert.equal(report.ai_provider_billing_blocked, true); assert.equal(report.ai_error, expected);
  assert.deepEqual(report.ai_provider_errors, [{ batch_offset: 0, error: expected }]);
  assert.equal(report.estimated_cost_usd, 0); assert.equal(report.status, 'degraded');
  assert.equal(report.published_stories, 0); assert.equal(report.updated_stories, 0);
  assert.doesNotMatch(JSON.stringify(report), /PRIVATE_PROVIDER_TEXT|abcdefghijklmnopqrstuvwxyz0123456789/);
  for (const previous of before.stories) {
    const saved = captured.storyStore.stories.find(item => item.story_id === previous.story_id);
    assert.equal(saved.pending_update.reason, 'AI_PROVIDER_UNAVAILABLE');
    for (const key of ['published_at', 'current_version', 'analysis', 'versions']) assert.deepEqual(saved[key], previous[key]);
  }
});

test('unknown or suffixed provider text remains redacted and never forges a billing status', async t => {
  oneStoryBatches(t);
  const secret = 'PRIVATE_PROVIDER_TEXT_abcdefghijklmnopqrstuvwxyz0123456789';
  let calls = 0;
  const report = await runWirkungsticker({ ...runFixture(), callAiImpl: async () => {
    calls++; throw Object.assign(new Error(`AI_PROVIDER_CREDIT_BALANCE_EXHAUSTED:${secret}`), { requestAttempts: 1, providerNotCalled: true });
  } });
  assert.equal(calls, 2); assert.equal(report.ai_provider_billing_blocked, undefined);
  assert.doesNotMatch(JSON.stringify(report), /PRIVATE_PROVIDER_TEXT|abcdefghijklmnopqrstuvwxyz0123456789|AI_PROVIDER_CREDIT_BALANCE_EXHAUSTED/);
  assert.equal(report.ai_error, '[redacted]:[redacted]');
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
