import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceState, berlinParts, evaluateChecks, summarizeNews, dailyReport, probe, sendDiscord } from '../../scripts/ops/discord-monitor.mjs';

const now = '2026-09-04T06:00:00Z';
const fixture = () => ({ report: { status: 'ok', completed_at: now, source_failures: 0, monthly_budget_usd: 18.9, budget_policy: { status: 'ok', fx: { rate_date: '2026-09-03', rate_usd_per_eur: 1.16 } }, source_health: [] }, usage: { runs: [] }, stories: [], liveFeed: { items: [] }, probes: [] });
const healthy = [{ id: 'main', name: 'Hauptseite', ok: true }];
const failed = [{ id: 'main', name: 'Hauptseite', ok: false, reason: 'HTTP 503' }];

test('Berlin daily boundary honors winter, summer and DST transitions', () => {
  assert.equal(berlinParts(now).hour, 8);
  assert.equal(berlinParts('2026-01-04T07:00:00Z').hour, 8);
  assert.equal(berlinParts('2026-03-29T06:00:00Z').hour, 8);
  assert.equal(berlinParts('2026-10-25T07:00:00Z').hour, 8);
});
test('daily delivery queues once, not before eight, and retries via durable outbox', () => {
  const summary = summarizeNews(fixture(), now);
  let s = advanceState(null, healthy, summary, '2026-09-04T05:59:00Z');
  assert.equal(s.outbox.length, 0);
  s = advanceState(s, healthy, summary, now);
  assert.equal(s.outbox.length, 1);
  assert.deepEqual(advanceState(s, healthy, summary, '2026-09-04T07:00:00Z'), s);
  s.outbox.shift();
  assert.equal(advanceState(s, healthy, summary, '2026-09-04T08:00:00Z').outbox.length, 0);
});
test('transient outage stays quiet; confirmed outage and recovery each notify once', () => {
  const summary = summarizeNews(fixture(), now);
  let s = advanceState(null, failed, summary, '2026-09-04T04:00:00Z');
  assert.equal(s.outbox.length, 0);
  assert.equal(advanceState(s, healthy, summary, '2026-09-04T04:03:00Z').outbox.length, 0);
  s = advanceState(s, failed, summary, '2026-09-04T04:15:00Z');
  assert.equal(s.outbox.length, 1);
  assert.equal(advanceState(s, failed, summary, '2026-09-04T04:30:00Z').outbox.length, 1);
  s.outbox = [];
  s = advanceState(s, healthy, summary, '2026-09-04T04:45:00Z');
  assert.equal(s.outbox.length, 1);
  assert.match(s.outbox[0].content, /behoben/);
  assert.equal(advanceState(s, healthy, summary, '2026-09-04T05:00:00Z').outbox.length, 1);
});
test('no new articles is not a pipeline failure', () => {
  assert.ok(evaluateChecks(fixture(), now).checks.every(c => c.ok));
});
test('stale or missing report, provider failure, and missing feed are detected', () => {
  const d = fixture(); d.report.completed_at = '2026-09-04T04:00:00Z'; d.report.ai_error = 'HTTP503'; d.liveFeed = null;
  const c = evaluateChecks(d, now).checks;
  for (const id of ['run', 'provider', 'publication']) assert.equal(c.find(x => x.id === id).ok, false);
});
test('publication lag has grace period and compares versions rather than unchanged article count', () => {
  const d = fixture();
  d.stories = [{ published: true, slug: 'test', published_at: '2026-09-03T10:00:00Z', last_updated: '2026-09-04T04:00:00Z' }];
  assert.equal(summarizeNews(d, now).pendingPublication, 1);
  d.liveFeed.items = [{ url: 'https://wirkungsoekonomie.de/wirkungsticker/test/', date_modified: '2026-09-04T04:00:00Z' }];
  assert.equal(summarizeNews(d, now).pendingPublication, 0);
  d.stories[0].last_updated = '2026-09-04T05:50:00Z';
  assert.equal(summarizeNews(d, now).pendingPublication, 0);
});
test('AI alerts distinguish local input failures from HTTP responses and identify the report time', () => {
  const d = fixture(); d.report.ai_error = 'AI_INPUT_TOO_LARGE';
  let c = evaluateChecks(d, now).checks.find(c => c.id === 'provider');
  assert.equal(c.ok, false);
  assert.match(c.reason, /lokale KI-Eingabelimit/);
  assert.match(c.reason, /keine KI-Anfrage/);
  assert.match(c.reason, /2026-09-04T06:00:00\.000Z/);
  assert.doesNotMatch(c.reason, /KI-Anbieterfehler/);
  d.report.ai_error = 'AI_PROVIDER_ERROR:503';
  c = evaluateChecks(d, now).checks.find(c => c.id === 'provider');
  assert.match(c.reason, /HTTP 503/);
  assert.doesNotMatch(c.reason, /lokale KI-Eingabelimit/);
  d.report.ai_error = 'untrusted error @everyone private-token';
  c = evaluateChecks(d, now).checks.find(c => c.id === 'provider');
  assert.match(c.reason, /nicht nachgewiesen/);
  assert.doesNotMatch(c.reason, /@everyone|private-token/);
});
test('cost report deduplicates runs, counts missing usage, and does not invent analytics', () => {
  const d = fixture(); const row = { run_id: 'one', started_at: '2026-09-03T23:30:00Z', counts: { ai_stories: 1 }, ai: { estimated_cost_usd: 0.2 } };
  d.usage.runs = [row, row, { run_id: 'two', started_at: now, counts: { ai_stories: 1 }, ai: null }];
  const s = summarizeNews(d, now);
  assert.equal(s.usdMonth, 0.2); assert.equal(s.usdToday, 0.2); assert.equal(s.missingCostRuns, 1);
  assert.match(dailyReport(s, healthy), /nicht als null gezählt/);
  d.report.budget_policy.fx.rate_date = '2026-08-01';
  assert.equal(summarizeNews(d, now).eurMonthWithTaxReserve, null);
});
test('probe validates content and retries one transient connection failure', async () => {
  let calls = 0;
  assert.equal((await probe({ id: 'x', name: 'X', url: 'https://example.test', marker: /works/ }, async () => { if (++calls === 1) throw new Error('private upstream detail'); return new Response('works'); })).ok, true);
  assert.equal(calls, 2);
  const bad = await probe({ id: 'x', name: 'X', url: 'https://example.test', marker: /works/ }, async () => new Response('maintenance'));
  assert.equal(bad.ok, false);
});
test('DM sends only to explicit recipient, with stable nonce and no public mention fallback', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => { calls.push({ url, body: JSON.parse(options.body) }); return Response.json({ id: '123456789012345678' }); };
  await assert.rejects(sendDiscord({ id: 'nonce', content: 'test' }, { token: 'test', recipient: null, fetchImpl }), /CONFIGURATION/);
  await sendDiscord({ id: 'nonce', content: 'test' }, { token: 'test', recipient: '123456789012345679', fetchImpl });
  assert.equal(calls[0].body.recipient_id, '123456789012345679');
  assert.equal(calls[1].body.enforce_nonce, true);
  assert.deepEqual(calls[1].body.allowed_mentions, { parse: [] });
});
