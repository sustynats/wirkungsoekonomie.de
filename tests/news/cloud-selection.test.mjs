import test from 'node:test';
import assert from 'node:assert/strict';
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
  let snapshot, baseline;
  const exported = await runWirkungsticker({ ...input(), selectionOnly: true,
    selectionRunId: 'real-run', captureSelectionBaseline: value => { baseline = value; }, captureSelectionSnapshot: row => { snapshot = row; } });
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
  let captured;
  const checked = await runWirkungsticker({ ...input(), cloudSelection: { snapshot, result },
    captureState: value => { captured = value; } });
  assert.equal(checked.ai_calls, 0); assert.equal(checked.published_stories, 0);
  assert.equal(checked.cloud_selection.selected.length, 1);
  // Replay same frozen discovery context with the durable import receipt.
  const replayInput = input(); replayInput.state.cloud_selection_receipts = captured.state.cloud_selection_receipts;
  const replay = await runWirkungsticker({ ...replayInput, cloudSelection: { snapshot, result } });
  assert.equal(replay.cloud_selection.replay, true); assert.equal(replay.ai_calls, 0);
});
