import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { advanceState, berlinParts, evaluateChecks, summarizeNews, dailyReport, probe, sendDiscord, publicationFlow } from '../../scripts/ops/discord-monitor.mjs';

const now = '2026-09-04T06:00:00Z';
const fixture = () => ({ report: { status: 'ok', operational_status: 'ok', completed_at: now, source_failures: 0, monthly_budget_usd: 18.9, budget_policy: { status: 'ok', fx: { rate_date: '2026-09-03', rate_usd_per_eur: 1.16 } }, source_health: [], queue: { status: 'clear', total: 0, capacity: 0, technical: 0, editorial: 0 }, source_funnel: [] }, usage: { runs: [] }, stories: [], liveFeed: { items: [] }, probes: [] });
const healthy = [{ id: 'main', name: 'Hauptseite', ok: true }];
const failed = [{ id: 'main', name: 'Hauptseite', ok: false, reason: 'HTTP 503' }];

test('monitor sparse checkout includes the complete local module dependency graph', () => {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const workflowPath = '.github/workflows/ops-discord-monitor.yml';
  const workflow = fs.readFileSync(path.join(root, workflowPath), 'utf8');
  const checkout = workflow.split('sparse-checkout: |')[1].split('sparse-checkout-cone-mode:')[0]
    .trim().split('\n').map(line => line.trim());
  assert.ok(checkout.includes(workflowPath));
  const visited = new Set();
  function visit(file) {
    if (visited.has(file)) return;
    visited.add(file);
    assert.ok(checkout.includes(file), `Monitor checkout is missing ${file}`);
    const code = fs.readFileSync(path.join(root, file), 'utf8');
    for (const match of code.matchAll(/(?:from\s*|import\s*\(\s*|import\s*)['"](\.[^'"]+\.mjs)['"]/g)) {
      visit(path.posix.normalize(path.posix.join(path.posix.dirname(file), match[1])));
    }
  }
  visit('scripts/ops/discord-monitor.mjs');
  visit('tests/ops/discord-monitor.test.mjs');
});

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
test('green runs without queue progress trigger a distinct flow warning, not a provider failure', () => {
  const data = fixture();
  data.report.queue = { before: 27, after: 28, capacity: 26, oldest_minutes: 900, status: 'draining' };
  data.usage.runs = [0, 60, 125].map((minutes, i) => ({ run_id: `r${i}`,
    started_at: new Date(Date.parse(now) - minutes * 60000 - 1000).toISOString(), completed_at: new Date(Date.parse(now) - minutes * 60000).toISOString(),
    queue: { before: 26, after: 27 }, counts: { published_stories: 0, updated_stories: 0 } }));
  const checks = evaluateChecks(data, now).checks;
  assert.equal(checks.find(c => c.id === 'publication-flow').ok, false);
  assert.equal(checks.find(c => c.id === 'provider').ok, true);
  assert.equal(checks.find(c => c.id === 'run').ok, true);
  for (const counts of [{ queue_completed: 1 }, { published_stories: 1 }, { updated_stories: 1 }]) {
    const progress = structuredClone(data);
    progress.usage.runs[0].counts = counts;
    assert.equal(publicationFlow(progress.usage, progress.report, now).stalled, false);
  }
  const shrinking = structuredClone(data);
  shrinking.usage.runs[0].queue = { before: 28, after: 27 };
  assert.equal(publicationFlow(shrinking.usage, shrinking.report, now).stalled, false);
  const quiet = structuredClone(data);
  quiet.report.queue.capacity = 0;
  assert.equal(publicationFlow(quiet.usage, quiet.report, now).stalled, false);
  assert.equal(publicationFlow({ runs: data.usage.runs.slice(0, 2) }, data.report, now).stalled, false);
});
test('the existing 95 percent budget reserve is observable as a budget stop', () => {
  const data = fixture(); data.report.budget_stage = 3;
  assert.equal(evaluateChecks(data, now).checks.find(c => c.id === 'budget').ok, false);
  data.report.budget_stage = 1;
  assert.equal(evaluateChecks(data, now).checks.find(c => c.id === 'budget').ok, true);
});

test('budget stops are explicit and cannot hide overdue technical holds', () => {
  const data = fixture();
  data.report.budget_blocked = true;
  data.report.queue = {status:'budget_blocked', after:4, capacity:3, technical:1, oldest_technical_minutes:120};
  let checks = evaluateChecks(data, now).checks;
  assert.equal(checks.find(c=>c.id==='queue').ok, false);
  assert.equal(checks.find(c=>c.id==='budget').ok, false);
  assert.equal(checks.find(c=>c.id==='provider').ok, true);
  data.report.queue.technical = 0;
  data.report.queue.status = 'draining'; // older stored report
  assert.equal(summarizeNews(data, now).queue.status, 'budget_blocked');
  assert.equal(data.report.queue.status, 'draining', 'historical report is not mutated');
  checks = evaluateChecks(data, now).checks;
  assert.match(checks.find(c=>c.id==='queue').reason, /wartet auf Budgetfreigabe/);
  assert.equal(checks.find(c=>c.id==='queue').ok, true, 'the separate budget check carries the budget alert');
  data.report.budget_blocked = false;
  assert.equal(summarizeNews(data, now).queue.status, 'draining');
});
test('worker queue after-count is not misreported as zero in Discord',()=>{
  const data=fixture();
  data.report.queue={status:'draining',before:21,after:17,capacity:2,technical:15,editorial:0};
  const summary=summarizeNews(data,now);
  assert.equal(summary.queue.total,17);
  assert.match(dailyReport(summary,healthy),/Queue: 17 offen/);
});
test('one transient source throttle stays observable without a false outage alarm', () => {
  const d = fixture();
  d.report = { ...d.report, status: 'degraded', source_failures: 1, source_successes: 32, sources_scheduled: 33, source_errors: [{ source_id: 'berlin', error: 'FEED_HTTP_429' }] };
  const checks = evaluateChecks(d, now).checks;
  assert.equal(checks.find(c => c.id === 'run').ok, true);
  assert.equal(checks.find(c => c.id === 'sources').ok, true);
  d.report = { ...d.report, source_failures: 4, source_successes: 12, sources_scheduled: 16 };
  const degraded = evaluateChecks(d, now).checks;
  assert.equal(degraded.find(c => c.id === 'run').ok, false);
  assert.equal(degraded.find(c => c.id === 'sources').ok, false);
});
test('image-provider outages and exhausted retries are monitored, deliberate cards and safety rejections are not outages', () => {
  const d=fixture();
  d.stories=[{published:true,title_image:{mode:'impact_card',fallback_reason:'IMAGE_CONTAINS_TEXT'}}];
  assert.equal(evaluateChecks(d,now).checks.find(c=>c.id==='images').ok,true);
  d.stories.push({published:true,title_image:{mode:'editorial',refresh_failure:'HIGGSFIELD_RETRY_EXHAUSTED'}});
  const c=evaluateChecks(d,now).checks.find(c=>c.id==='images');
  assert.equal(c.ok,false);assert.match(c.reason,/1 Symbolbild mit/);assert.match(c.reason,/Nachrichten werden dadurch nicht zurückgehalten/);
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
test('case timeline members are not mistaken for missing live-feed publications', () => {
  const d = fixture();
  d.stories = [
    ['eins', 'Sabotage an Umspannwerk Jänschwalde: Polizei ermittelt', '2026-09-03T10:00:00Z'],
    ['zwei', 'Sabotage an Umspannwerk Jänschwalde: Bekennerschreiben gefunden', '2026-09-03T11:00:00Z'],
    ['drei', 'Sabotage an Umspannwerk Jänschwalde: Verdächtiger gesucht', '2026-09-03T12:00:00Z'],
  ].map(([story_id, title, last_updated]) => ({
    story_id, slug: story_id, title, last_updated, published_at: last_updated,
    published: true, listed: true, topic: ['Energie'], analysis: { summary: title }, sources: [],
  }));
  d.liveFeed.items = [{
    url: 'https://wirkungsoekonomie.de/wirkungsticker/drei/',
    date_modified: '2026-09-03T12:00:00Z',
  }];
  const summary = summarizeNews(d, now);
  assert.equal(summary.underlyingActive, 3);
  assert.equal(summary.caseCount, 1);
  assert.equal(summary.active, 1);
  assert.equal(summary.pendingPublication, 0);
  d.liveFeed.items = [];
  assert.equal(summarizeNews(d, now).pendingPublication, 1);
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
test('preflight holds are not provider outages or unknown paid requests', () => {
  const d=fixture(); d.report.input_holds=[{story_id:'test',reason:'AI_INPUT_TOO_LARGE'}]; d.report.queue={status:'draining',total:1,capacity:0,technical:1,editorial:0,oldest_technical_minutes:20};
  const checks=evaluateChecks(d,now).checks;
  assert.equal(checks.find(c=>c.id==='queue').ok,true);
  assert.equal(checks.find(c=>c.id==='run').ok,true);
  assert.equal(checks.find(c=>c.id==='provider').ok,true);
  d.usage.runs=[{run_id:'local-only',started_at:now,counts:{ai_stories:1,ai_requests:0},ai:null}];
  assert.equal(summarizeNews(d,now).missingCostRuns,0);
});
test('only an aged technical queue creates an incident; capacity and editorial holds stay in reporting', () => {
  const d=fixture();
  d.report.queue={status:'editorial_holds',total:7,capacity:3,technical:0,editorial:4,oldest_minutes:240};
  let checks=evaluateChecks(d,now).checks;
  assert.equal(checks.find(c=>c.id==='queue').ok,true);
  d.report.queue={status:'technical_delay',total:2,capacity:0,technical:2,editorial:0,oldest_technical_minutes:120};
  checks=evaluateChecks(d,now).checks;
  const queue=checks.find(c=>c.id==='queue');
  assert.equal(queue.ok,false);
  assert.match(queue.reason,/2 technisch blockierte/);
  assert.match(queue.reason,/120 Minuten/);
});
test('daily report contains exact pipeline, source funnel, queue and unit-cost monitoring', () => {
  const d=fixture();
  d.report.source_funnel=[{source_id:'heise-security',name:'heise Security',feed_items:10,new_items:2,eligible_stories:1,ai_selected:1,published_stories:1}];
  d.report.queue={status:'draining',total:3,capacity:3,technical:0,editorial:0};
  d.usage.runs=[{run_id:'today',started_at:now,counts:{feed_entries_fetched:10,feed_entries_new:2,feed_entries_updated:1,story_clusters:2,eligible_stories:1,locally_rejected:1,ai_stories:1,published_stories:1,updated_stories:0},ai:{estimated_cost_usd:0.12},source_funnel:d.report.source_funnel}];
  d.stories=[{published:true,listed:true,story_id:'eins',slug:'eins',published_at:now,last_updated:now,title:'Neue Akte',analysis:{summary:'Neue Akte'},sources:[]}];
  d.liveFeed.items=[{url:'https://wirkungsoekonomie.de/wirkungsticker/eins/',date_modified:now}];
  const summary=summarizeNews(d,now);
  const report=dailyReport(summary,evaluateChecks(d,now).checks);
  assert.match(report,/Queue: 3 offen/);
  assert.match(report,/10 Feed-Einträge → 3 neu\/aktualisiert → 2 Story-Kandidaten/);
  assert.match(report,/heise Security/);
  assert.match(report,/\$0\.120/);
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
