import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { makeSelectionSnapshot, importSelection, acknowledgeSelection, validateSelectionResult } from '../../scripts/news/cloud-selection.mjs';
import { runWirkungsticker } from '../../scripts/news/run.mjs';
import { EVENT_RELEVANCE_VERSION } from '../../scripts/news/event-relevance.mjs';

const now = '2026-09-30T10:00:00.000Z';
const source = (id, title, summary) => ({ source_id: id, publisher_id: id,
  url: `https://example.org/${id}`, published_at: '2026-09-30T09:30:00.000Z', title, summary });
const candidate = (id, title, summary) => ({ story_id: id, title, sources: [source(id, title, summary)] });
function fixture() {
  const tech = candidate('tech', 'Neue Methode halbiert den Speicherbedarf',
    'Ein Fachbericht dokumentiert die gemessene Speicherersparnis für kommunale Datenverarbeitung; die Übertragbarkeit bleibt offen.');
  const accident = candidate('accident', 'Schüsse in Berlin: Polizei bestätigt Verletzte',
    'Nach einem lokalen Vorfall ermittelt die Polizei; keine anhaltende Gefahr bestätigt.');
  const repeat = candidate('repeat', 'Neue Überschrift zu den Schüssen in Berlin', accident.sources[0].summary);
  const update = candidate('update', 'Versorgungsnetz wieder in Betrieb',
    'Der Betreiber bestätigt die Wiederaufnahme der Versorgung nach dem abgeschlossenen Reparaturtest.');
  const existing = { ...candidate('published', 'Versorgungsnetz ausgefallen', 'Der Betreiber bestätigt den Ausfall.'),
    event_id: 'event-known', published: true, slug: 'known', current_version: 1, content_hash: 'old',
    published_at: '2026-09-30T07:00:00.000Z' };
  update.existing_story = existing;
  const unrelated = candidate('different', 'Neue Forschungsanlage in Berlin in Betrieb',
    'Die neue Anlage ermöglicht kontrollierte Materialtests; ein anderes Ereignis am gleichen Ort.');
  const candidates = [tech, accident, repeat, update, unrelated];
  const knownAccident = { ...accident, story_id: 'known-accident', event_id: 'event-accident',
    published: true, slug: 'accident', current_version: 1, published_at: '2026-09-30T09:00:00.000Z' };
  const stories = [existing, knownAccident], state = {};
  const snapshot = makeSelectionSnapshot({ candidates, stories, runId: 'test-selection', now,
    coverage: { complete: true } });
  const decisions = snapshot.candidates.map(row => {
    const decision = row.candidate_id === 'repeat' ? 'repeat' : row.candidate_id === 'accident' ? 'defer'
      : row.candidate_id === 'update' ? 'update' : 'new';
    const rank = { tech: 1, update: 2, different: 3 }[row.candidate_id];
    return { candidate_id: row.candidate_id, candidate_hash: row.candidate_hash, decision,
      ...(rank ? { rank } : {}), ...(decision === 'update' ? { event_id: 'event-known' } : {}),
      ...(decision === 'repeat' ? { event_id: 'event-accident' } : {}),
      new_information: 'Konkrete neue belegte Information verändert den bisherigen Zustandsvergleich.',
      reason: 'Die quellengebundene Zustandsänderung ist strukturell relevant; bloße Verbreitung ist kein Auswahlgrund.',
      uncertainty: 'Übertragbarkeit und langfristige Folgen bleiben offen.',
      topics: row.candidate_id === 'tech' ? ['technology'] : ['society'],
      evidence: [{ source_id: row.sources[0].source_id, url: row.sources[0].url }] };
  });
  const result = { schema_version: snapshot.schema_version, run_id: snapshot.run_id,
    input_hash: snapshot.input_hash, comparison_hash: snapshot.comparison_hash,
    completed_at: now, complete: true, reviewed_candidate_ids: snapshot.candidates.map(row => row.candidate_id), decisions };
  return { candidates, stories, state, now, snapshot, result };
}
const check = f => validateSelectionResult(f.snapshot, f.result, f);

test('single specialist source, material update, repetition and different same-city event', () => {
  const f = fixture(), selected = check(f);
  assert.deepEqual(selected.map(row => row.story_id), ['tech', 'published', 'different']);
  assert.equal(selected[0].sources.length, 1);
  assert.equal(selected[1].event_id, 'event-known');
  assert.equal(selected[1].existing_story.current_version, 1);
  assert.equal(selected[2].existing_story, undefined);
});
test('syndicated copies do not gain rank; only the representative is admitted', () => {
  const f = fixture();
  f.result.decisions.find(d => d.candidate_id === 'accident').decision = 'new';
  Object.assign(f.result.decisions.find(d => d.candidate_id === 'accident'), { rank: 4 });
  Object.assign(f.result.decisions.find(d => d.candidate_id === 'repeat'),
    { event_id: null, duplicate_candidate_id: 'accident' });
  assert.equal(check(f).filter(row => ['accident', 'repeat'].includes(row.story_id)).length, 1);
});
test('incomplete, duplicate, stale, unknown, forged and article-shaped output fails closed', () => {
  for (const mutate of [
    f => { f.result.complete = false; },
    f => { f.result.decisions.pop(); },
    f => { f.result.reviewed_candidate_ids.pop(); },
    f => { f.result.decisions[1] = f.result.decisions[0]; },
    f => { f.result.input_hash = 'wrong'; },
    f => { f.result.decisions[0].candidate_hash = 'wrong'; },
    f => { f.result.decisions[0].evidence[0].url = 'https://unbound.example/'; },
    f => { f.result.decisions.find(d => d.decision === 'update').event_id = 'invented'; },
    f => { f.result.decisions.find(d => d.decision === 'update').rank = 1; },
    f => { f.result.article = 'not selection'; },
    f => { f.result.decisions[0].article = 'not selection'; },
    f => { f.stories[0].current_version = 2; },
    f => { f.candidates[0].sources[0].summary += ' altered'; },
    f => { f.now = '2026-09-30T12:00:01Z'; },
    f => { f.snapshot.candidates[0].title = 'tampered'; },
  ]) { const f = fixture(); mutate(f); assert.throws(() => check(f), /CLOUD_/); }
});
test('uncertain redirection and conflicting published-event IDs are held', () => {
  const f = fixture(), d = f.result.decisions.find(row => row.candidate_id === 'different');
  d.decision = 'update'; d.event_id = 'event-known';
  assert.throws(() => check(f), /CLOUD_/);
});
test('run time alone does not change the semantic content hash', () => {
  const f = fixture();
  const next = makeSelectionSnapshot({ ...f, runId: 'next-run', now: '2026-09-30T10:30:00Z' });
  assert.equal(next.content_hash, f.snapshot.content_hash);
  assert.notEqual(next.input_hash, f.snapshot.input_hash);
});

test('manual-only contents never enter the snapshot', () => {
  const f = fixture();
  f.candidates.push({ ...f.candidates[0], story_id: 'manual', manual_only: true });
  f.stories.push({ ...f.stories[0], story_id: 'book', event_id: 'book', format: 'Buch & Wirkung' });
  const snapshot = makeSelectionSnapshot({ ...f, runId: 'manual-check' });
  assert.equal(snapshot.candidates.some(row => row.candidate_id === 'manual'), false);
  assert.equal(snapshot.events.some(row => row.story_id === 'book'), false);
});
test('identical import is idempotent and conflicting return cannot replace it', () => {
  const f = fixture(), receipt = importSelection(f.snapshot, f.result, f);
  assert.equal(receipt.selected.length, 3);
  acknowledgeSelection(f.state, f.snapshot, receipt, now);
  const again = importSelection(f.snapshot, f.result, f);
  assert.equal(again.replay, true); assert.equal(again.selected.length, 0);
  f.result.decisions[0].reason += ' Changed decision.';
  assert.throws(() => importSelection(f.snapshot, f.result, f), /CLOUD_RESULT_CONFLICT/);
});

test('real runner exports below-threshold candidates and checks a return for free', async () => {
  const registered = { source_id: 'test', publisher_id: 'test', name: 'Test',
    url: 'https://example.org/', feed_url: 'https://example.org/rss',
    source_type: 'official_rss', primary_source: true, enabled: true,
    access: { status: 'public', article: 'bounded_public_text', cost_usd: 0 } };
  const rss = '<rss><channel><item><title>Neues Messverfahren vorgestellt</title><link>https://example.org/method</link><description>Ein Institut beschreibt eine geprüfte Methode mit geringerem Speicherbedarf und dokumentiert die Grenzen der Messreihe.</description><pubDate>Wed, 30 Sep 2026 09:30:00 GMT</pubDate></item></channel></rss>';
  const input = () => ({ dryRun: true, now, registry: { sources: [registered], policy: {} },
    state: { source_status: {}, seen_items: {}, pending_story_ids: [], relevance_filter_version: EVENT_RELEVANCE_VERSION },
    storyStore: { stories: [] }, usage: { runs: [] },
    newsroom: { source_items: {}, events: {}, event_sources: [], decisions: [], discovery_candidates: [] },
    budgetFx: { rate_date: '2026-09-30', rate_usd_per_eur: 1.16 },
    fetchFeedImpl: async () => ({ body: rss, final_url: registered.feed_url }),
    callAiImpl: async () => { throw Error('PAID_CALL_FORBIDDEN'); },
  });
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'woek-cloud-selection-'));
  const snapshotFile = path.join(directory, 'snapshot.json'), resultFile = path.join(directory, 'result.json');
  let snapshot, baseline;
  const exported = await runWirkungsticker({ ...input(), selectionOnly: true,
    selectionRunId: 'real-run', captureSelectionBaseline: value => { baseline = value; }, captureSelectionSnapshot: row => {
      fs.writeFileSync(snapshotFile, JSON.stringify(row), { flag: 'wx', mode: 0o600 });
      snapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'));
      assert.deepEqual(snapshot, row);
    } });
  assert.equal(exported.ai_calls, 0); assert.equal(snapshot.candidates.length, 1);
  assert.equal(baseline.input_hash, snapshot.input_hash);
  assert.equal(baseline.eligible.length, 0, 'semantic reviewer receives below-threshold single-source input');
  const row = snapshot.candidates[0];
  const result = { schema_version: snapshot.schema_version, run_id: snapshot.run_id,
    input_hash: snapshot.input_hash, comparison_hash: snapshot.comparison_hash,
    completed_at: now, complete: true, reviewed_candidate_ids: [row.candidate_id],
    decisions: [{ candidate_id: row.candidate_id, candidate_hash: row.candidate_hash,
      decision: 'new', rank: 1, new_information: 'Ein neu geprüftes Messverfahren reduziert den dokumentierten Speicherbedarf.',
      reason: 'Die fachliche Einzelquelle liefert überprüfbare technische Evidenz mit möglichem strukturellem Nutzen.',
      uncertainty: 'Die Übertragbarkeit auf andere Anwendungen ist noch offen.', topics: ['technology'],
      evidence: [{ source_id: row.sources[0].source_id, url: row.sources[0].url }] }] };
  fs.writeFileSync(resultFile, JSON.stringify(result), { flag: 'wx', mode: 0o600 });
  const returned = JSON.parse(fs.readFileSync(resultFile, 'utf8'));
  assert.deepEqual(returned, result, 'complete return stored and read back without retyping');
  let captured;
  const checked = await runWirkungsticker({ ...input(), cloudSelection: { snapshot, result: returned },
    captureState: value => { captured = value; } });
  assert.equal(checked.ai_calls, 0); assert.equal(checked.published_stories, 0);
  assert.equal(checked.cloud_selection.selected.length, 1);
  assert.equal(checked.ai_stories, 1, 'candidate reaches the existing elaboration lane, with API disabled');
  console.log(JSON.stringify({ comparison: 'same_snapshot_fixture', input_hash: snapshot.input_hash,
    old_local_eligible: baseline.eligible.length, cloud_selected_new: checked.cloud_selection.selected.length,
    ai_calls: checked.ai_calls, published: checked.published_stories }));
  // A real additional feed item arriving while the frozen package is reviewed
  // must remain pending, rather than being consumed as a reviewed rejection.
  const lateRss = rss.replace('</channel>', '<item><title>Neue Forschungsanlage eröffnet</title><link>https://example.org/late</link><description>Eine neue Anlage ermöglicht dokumentierte Materialtests.</description><pubDate>Wed, 30 Sep 2026 09:45:00 GMT</pubDate></item></channel>');
  let lateState;
  const withArrival = await runWirkungsticker({ ...input(), cloudSelection: { snapshot, result },
    fetchFeedImpl: async () => ({ body: lateRss, final_url: registered.feed_url }),
    captureState: value => { lateState = value; } });
  assert.equal(withArrival.ai_calls, 0);
  assert.equal(withArrival.cloud_selection.selected.length, 1);
  const waiting = lateState.storyStore.stories.find(story => story.sources?.some(s => s.url === 'https://example.org/late'));
  assert.ok(waiting, 'late arrival is retained in the established story store');
  assert.equal(waiting.pending_reason, 'CLOUD_AFTER_EDITORIAL_CUTOFF');
  assert.ok(lateState.state.pending_story_ids.includes(waiting.story_id));
  // Replay same frozen discovery context with the durable import receipt.
  const replayInput = input(); replayInput.state.cloud_selection_receipts = captured.state.cloud_selection_receipts;
  let replayStateWritten = false;
  const replay = await runWirkungsticker({ ...replayInput, cloudSelection: { snapshot, result },
    captureState: () => { replayStateWritten = true; } });
  assert.equal(replay.cloud_selection.replay, true); assert.equal(replay.ai_calls, 0);
  assert.equal(replay.status, 'selection_replay');
  assert.equal(replayStateWritten, false, 'replay cannot consume newly collected inputs');
  fs.rmSync(directory, { recursive: true });
});

test('later collection arrivals are outside the frozen review, changed reviewed inputs still fail', () => {
  const f = fixture();
  f.candidates.push(candidate('late', 'Später Eingang', 'Diese Meldung ging nach dem Redaktionsschluss ein.'));
  assert.equal(check(f).length, 3);
  f.candidates[0].sources[0].summary += ' Neue Quelleninformation.';
  assert.throws(() => check(f), /CLOUD_CANDIDATES_STALE/);
});
test('acknowledged identical return is a no-op after collection and publication advance', () => {
  const f = fixture();
  acknowledgeSelection(f.state, f.snapshot, importSelection(f.snapshot, f.result, f), now);
  f.candidates = [];
  f.stories[0].current_version = 2;
  f.now = '2026-10-01T10:00:00.000Z';
  assert.equal(importSelection(f.snapshot, f.result, f).replay, true);
  assert.equal(importSelection(f.snapshot, f.result, f).selected.length, 0);
  f.result.complete = false;
  assert.throws(() => importSelection(f.snapshot, f.result, f), /CLOUD_RESULT_CONFLICT/);
});

test('runner deadline fallback is visible and uses the old lane without a selection API', async () => {
  const keys = ['WOEK_NEWS_CLOUD_SELECTION_ENABLED', 'WOEK_NEWS_EDITION_DATE', 'WOEK_NEWS_EDITION_SLOT',
    'WOEK_NEWS_CLOUD_DEADLINE_AT', 'WOEK_NEWS_AI_ENABLED'];
  const saved = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  Object.assign(process.env, { WOEK_NEWS_CLOUD_SELECTION_ENABLED: 'true', WOEK_NEWS_EDITION_DATE: '2026-09-30',
    WOEK_NEWS_EDITION_SLOT: 'mittagslage', WOEK_NEWS_CLOUD_DEADLINE_AT: '2026-09-30T09:20:00Z', WOEK_NEWS_AI_ENABLED: 'false' });
  try {
    const registered = { source_id: 'test', publisher_id: 'test', name: 'Test', url: 'https://example.org/',
      feed_url: 'https://example.org/rss', source_type: 'official_rss', primary_source: true, enabled: true,
      access: { status: 'public', article: 'bounded_public_text', cost_usd: 0 } };
    const input = { dryRun: true, now: '2026-09-30T09:20:00Z', registry: { sources: [registered], policy: {} },
      state: { source_status: {}, seen_items: {}, pending_story_ids: [], relevance_filter_version: EVENT_RELEVANCE_VERSION },
      storyStore: { stories: [] }, usage: { runs: [] },
      newsroom: { source_items: {}, events: {}, event_sources: [], decisions: [], discovery_candidates: [] },
      budgetFx: { rate_date: '2026-09-30', rate_usd_per_eur: 1.16 },
      fetchFeedImpl: async () => ({ body: '<rss><channel></channel></rss>', final_url: registered.feed_url }),
      callAiImpl: async () => { throw Error('PAID_CALL_FORBIDDEN'); } };
    await assert.rejects(runWirkungsticker({ ...input, now: '2026-09-30T09:19:59Z' }), /CLOUD_SELECTION_WAITING_UNTIL_DEADLINE/);
    const report = await runWirkungsticker(input);
    assert.equal(report.cloud_fallback.route, 'existing_news_path');
    assert.equal(report.cloud_fallback.edition_id, '2026-09-30-mittagslage');
    assert.equal(report.ai_calls, 0);
    assert.equal(report.published_stories, 0);
    const invalid = await runWirkungsticker({ ...input, cloudSelection: { snapshot: {}, result: {} } });
    assert.equal(invalid.cloud_fallback.reason, 'CLOUD_SNAPSHOT_HASH_INVALID');
    assert.equal(invalid.ai_calls, 0);
  } finally {
    for (const key of keys) if (saved[key] === undefined) delete process.env[key]; else process.env[key] = saved[key];
  }
});
