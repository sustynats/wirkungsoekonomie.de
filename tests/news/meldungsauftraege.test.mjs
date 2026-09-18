import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runWirkungsticker } from '../../scripts/news/run.mjs';
import { ladeAuftraege, auftraegeVorziehen, auftragsErgebnisse } from '../../scripts/news/meldungsauftraege-lauf.mjs';
import { holen, abgeben, wartendeMeldungsauftraege, freigabeVorschau, MAX_VERSUCHE } from '../../scripts/news/meldungsauftraege.mjs';

// Am 18.09.2026 lag der Wunstorf-Auftrag mit bestandener Recherche seit dem
// Vormittag in der Warteschlange, zwei zurueckgegebene Meldungen seit dem
// 12.09.: den Meldungsauftrag analysierte seit dem Direktbetrieb niemand mehr.

const now = '2026-09-04T12:00:00.000Z';
const source = { source_id: 'test', publisher_id: 'test', name: 'Test', url: 'https://example.org/', feed_url: 'https://example.org/rss', enabled: true, source_type: 'official_rss', primary_source: true, access: { status: 'public', article: 'metadata_only', cost_usd: 0 }, frequency_class: 'high_frequency' };
const item = { source_id: 'test', publisher_id: 'test', publisher: 'Test', url: 'https://example.org/a', title: 'Bund beschließt Klimagesetz zur Energieversorgung', summary: 'Neue Regeln verändern Investitionen in Energie und Infrastruktur.', primary_source: true, published_at: now };
const storedStory = () => ({ story_id: 'wt-test', slug: 'klimagesetz', title: item.title, published: true, listed: true, first_seen: now, last_updated: now, published_at: now, current_version: 2, versions: [{ version: 2, analysis: { summary: 'Bestehender Artikel' } }], analysis: { summary: 'Bestehender Artikel' }, sources: [{ ...item }], pending_update: { sources: [{ ...item }], detected_at: now, reason: 'AI_BUDGET_OR_BATCH_LIMIT' } });
const auftragsKandidat = () => ({ story_id: 'wt-auftrag', slug: 'drohnenfund-auftrag', title: 'Drohnenfund am Fliegerhorst', source_summary: 'Die Bundeswehr bestätigt den Fund.',
  sources: [{ ...item, url: 'https://example.org/drohne', title: 'Drohnenfund am Fliegerhorst', article_excerpt: 'Die Bundeswehr bestätigt den Fund einer Drohne am Fliegerhorst.' }],
  claims: [], first_seen: now, event_id: 'ev-auftrag', topic: ['sicherheit'], preanalysis: { internal_relevance_score: 1, topics: ['sicherheit'] } });
const verzeichnis = () => fs.mkdtempSync(path.join(os.tmpdir(), 'meldungsauftraege-'));
const options = (dir, overrides = {}) => ({ dryRun: true, now, registry: { schema_version: '1.0', sources: [source], policy: {} },
  state: { source_status: {}, seen_items: {}, pending_story_ids: [], relevance_filter_version: '4.0' }, storyStore: { stories: [storedStory()] }, usage: { runs: [] },
  newsroom: { source_items: {}, events: {}, event_sources: [], discovery_candidates: [], decisions: [] }, budgetFx: { rate_date: '2026-09-04', rate_usd_per_eur: 1.16 },
  fetchFeedImpl: async () => ({ not_modified: true, final_url: source.feed_url }), fetchArticleImpl: async () => { throw new Error('No paid or live network in tests'); },
  aiBatchDelayImpl: async () => {}, orderFile: path.join(dir, 'auftraege.json'), orderResultFile: path.join(dir, 'ergebnisse.json'), ...overrides });
const auftragsDatei = (dir) => fs.writeFileSync(path.join(dir, 'auftraege.json'), JSON.stringify({ at: now, auftraege: [{ job_id: 'wt_20260904T110000Z_aaaaaaaaaaaaaaaaaaaaaaaa', input_hash: 'h1', candidate: auftragsKandidat() }] }));
const ablehnung = (stories) => ({ analyses: stories.map((story) => ({ story_id: story.story_id, publication_recommendation: false,
  rejection: { code: 'no_new_information', reason: 'Die vorliegenden Quellen ergänzen keine neue materielle Information gegenüber der veröffentlichten Fassung.' } })),
  model: 'gpt-5.6-luna', reported_usage: { input_tokens: 100, output_tokens: 50 } });

test('ein Meldungsauftrag wird zuerst analysiert und erscheint nie im oeffentlichen Bestand', async () => {
  const dir = verzeichnis(); auftragsDatei(dir);
  const reihenfolge = []; let gespeichert;
  const report = await runWirkungsticker(options(dir, { captureState: (value) => { gespeichert = value; },
    callAiImpl: async (stories) => { reihenfolge.push(...stories.map((story) => story.story_id)); return ablehnung(stories); } }));
  assert.equal(reihenfolge[0], 'wt-auftrag', 'Natalies Auftrag geht vor');
  assert.deepEqual(report.meldungsauftraege, { analysiert: 1, bestanden: 0, gescheitert: 1, offen: 0, gruende: ['QUALITY_GATE_FAILED'] });
  const ergebnisse = JSON.parse(fs.readFileSync(path.join(dir, 'ergebnisse.json'), 'utf8')).ergebnisse;
  assert.equal(ergebnisse[0].job_id, 'wt_20260904T110000Z_aaaaaaaaaaaaaaaaaaaaaaaa');
  assert.equal(ergebnisse[0].status, 'gescheitert');
  assert.ok(gespeichert?.storyStore, 'der Lauf liefert seinen Bestand');
  assert.equal(gespeichert.storyStore.stories.some((story) => story.story_id === 'wt-auftrag'), false, 'kein oeffentlicher Datensatz');
  assert.ok(Array.isArray(gespeichert.newsroom?.decisions), 'die Redaktionsakte ist da');
  assert.equal(gespeichert.newsroom.decisions.some((entscheidung) => entscheidung.story_id === 'wt-auftrag'), false, 'keine Spur in der Redaktionsakte');
  // Der Auftrag nahm den einen Platz dieses Laufs; die regulaere Meldung bleibt
  // unveraendert veroeffentlicht und wartet auf den naechsten.
  assert.deepEqual(reihenfolge, ['wt-auftrag']);
  assert.equal(gespeichert.storyStore.stories.find((story) => story.story_id === 'wt-test')?.published, true);
});

test('ein Meldungsauftrag laeuft auch, wenn die Stunde voll ist - vor jedem Limit', async () => {
  const dir = verzeichnis(); auftragsDatei(dir);
  const reihenfolge = [];
  const report = await runWirkungsticker(options(dir, {
    usage: { runs: [{ started_at: '2026-09-04T11:30:00.000Z', counts: { ai_stories: 4 }, ai: { requests: 4, estimated_cost_usd: 0.001 } }] },
    callAiImpl: async (stories) => { reihenfolge.push(...stories.map((story) => story.story_id)); return ablehnung(stories); } }));
  assert.equal(report.ai_hourly_limit, 0);
  assert.deepEqual(reihenfolge, ['wt-auftrag'], 'nur der Auftrag, die regulaere Meldung wartet');
});

test('ohne Auftragsdatei aendert sich am Lauf nichts', async () => {
  const dir = verzeichnis();
  const reihenfolge = [];
  const report = await runWirkungsticker(options(dir, { callAiImpl: async (stories) => { reihenfolge.push(...stories.map((story) => story.story_id)); return ablehnung(stories); } }));
  assert.deepEqual(reihenfolge, ['wt-test']);
  assert.equal(report.meldungsauftraege, undefined);
  assert.equal(fs.existsSync(path.join(dir, 'ergebnisse.json')), false);
});

test('Vorziehen haelt die Zahl der Plaetze und verdraengt dasselbe Ereignis', () => {
  const k = (id) => ({ story_id: id });
  const { selected, deferred } = auftraegeVorziehen([k('a'), k('b'), k('x')], [k('c')], [k('x')]);
  assert.deepEqual(selected.map((c) => c.story_id), ['x', 'a', 'b']);
  assert.deepEqual(deferred.map((c) => c.story_id), ['c']);
  const voll = auftraegeVorziehen([k('a'), k('b')], [], [k('x')]);
  assert.deepEqual(voll.selected.map((c) => c.story_id), ['x', 'a']);
  assert.deepEqual(voll.deferred.map((c) => c.story_id), ['b']);
});

test('ein bestandener Auftrag wird Ergebnis, der Bestand bleibt wie vorher', () => {
  const auftrag = { story_id: 'wt-a', manual_order: { job_id: 'job-a', input_hash: 'h' } };
  const alt = { story_id: 'wt-a', published: true, analysis: { summary: 'alt' } };
  const neu = { story_id: 'wt-a', published: true, analysis: { summary: 'neu' }, impact_semantic_review: { status: 'ready' } };
  const byId = new Map([['wt-a', neu]]), changedStoryIds = new Set(['wt-a']), report = { published_stories: 1 };
  const [ergebnis] = auftragsErgebnisse([auftrag], { byId, vorher: new Map([['wt-a', alt]]), changedStoryIds, report });
  assert.equal(ergebnis.status, 'bestanden');
  assert.equal(ergebnis.record, neu);
  assert.equal(byId.get('wt-a'), alt);
  assert.equal(changedStoryIds.has('wt-a'), false);
  assert.equal(report.published_stories, 0);
  // Nicht angefasst (Geld aus): wiederholbar, nicht verbraucht.
  const [offen] = auftragsErgebnisse([auftrag], { byId: new Map(), vorher: new Map(), changedStoryIds: new Set(), report: {} });
  assert.equal(offen.status, 'offen');
});

test('die Auftragsdatei liefert nur vollstaendige Auftraege, ohne fremden Bestand', () => {
  const dir = verzeichnis(), datei = path.join(dir, 'a.json');
  assert.deepEqual(ladeAuftraege(path.join(dir, 'fehlt.json')), []);
  fs.writeFileSync(datei, JSON.stringify({ auftraege: [{ job_id: 'j', input_hash: 'h', candidate: { ...auftragsKandidat(), existing_story: { published: true } } }, { job_id: 'leer', input_hash: 'h', candidate: { story_id: 'x', sources: [] } }] }));
  const [auftrag, ...rest] = ladeAuftraege(datei);
  assert.equal(rest.length, 0);
  assert.equal(auftrag.existing_story, undefined);
  assert.deepEqual(auftrag.manual_order, { job_id: 'j', input_hash: 'h' });
});

// --- Holen und Abgeben ueber den Redaktionstisch ---------------------------------

const job = (id, felder = {}) => ({ input: { job_id: id, job_type: 'new_story', input_hash: `hash-${id}` }, candidate: { story_id: `wt-${id}`, sources: [{}] },
  status: 'queued', created_at: '2026-09-18T09:40:00.000Z', queued_at: '2026-09-18T09:41:00.000Z', intake_news_parent: 'eltern', ...felder });
const tisch = (rows, calls = []) => ({ store: {
  acquire: async (...args) => { calls.push(`acquire:${args[2]?.manualRunId}`); },
  release: async (ok) => { calls.push(`release:${ok}`); },
  all: async () => rows,
  get: async (id) => structuredClone(rows.find((row) => row.input.job_id === id) || null),
  put: async (value) => { calls.push(`put:${value.input.job_id}:${value.status}`); const i = rows.findIndex((row) => row.input.job_id === value.input.job_id); rows[i] = value; },
} });
const env = { GITHUB_RUN_ID: '42', GITHUB_RUN_ATTEMPT: '1' };

test('holen nimmt frische wartende Meldungsauftraege, neueste zuerst, und laesst alte stehen', async () => {
  const rows = [job('a'), job('b', { created_at: '2026-09-18T10:00:00.000Z' }), job('alt', { created_at: '2026-09-12T16:00:00.000Z', queued_at: '2026-09-12T16:05:00.000Z' }),
    job('fertig', { status: 'accepted' }), job('regulaer', { intake_news_parent: undefined }), job('probe', { input: { job_id: 'probe', job_type: 'new_story', test_only: true } })];
  const dir = verzeichnis(), calls = [];
  const ergebnis = await holen({ session: tisch(rows, calls), env, datei: path.join(dir, 'a.json'), now: '2026-09-18T15:00:00.000Z' });
  assert.deepEqual(ergebnis, { status: 'ok', geholt: 2, weitere: 0, zu_alt: 1, auftraege: ['b', 'a'] });
  assert.deepEqual(calls, ['acquire:42:17', 'release:true'], 'eigener Spurplatz, nichts geschrieben');
  const datei = JSON.parse(fs.readFileSync(path.join(dir, 'a.json'), 'utf8'));
  assert.deepEqual(datei.auftraege.map((a) => a.input_hash), ['hash-b', 'hash-a']);
  assert.equal(wartendeMeldungsauftraege(rows, '2026-09-18T15:00:00.000Z').zu_alt, 1);
});

test('abgeben macht aus dem Ergebnis einen angenommenen Auftrag fuer die Freigabeliste', async () => {
  const rows = [job('a'), job('b'), job('c'), job('d')];
  const record = { story_id: 'wt-a', title: 'T', published: true, analysis: { summary: 'S' }, impact_semantic_review: { status: 'ready' } };
  const dir = verzeichnis(), datei = path.join(dir, 'e.json');
  fs.writeFileSync(datei, JSON.stringify({ ergebnisse: [
    { job_id: 'a', input_hash: 'hash-a', status: 'bestanden', record },
    { job_id: 'b', input_hash: 'hash-b', status: 'gescheitert', grund: 'QUALITY_GATE_FAILED', fehler: ['AI_ANALYSIS_MISSING'] },
    { job_id: 'c', input_hash: 'hash-c', status: 'offen', grund: 'AI_BUDGET_BLOCKED' },
    { job_id: 'd', input_hash: 'anderer-stand', status: 'bestanden', record },
  ] }));
  const calls = [];
  const ergebnis = await abgeben({ session: tisch(rows, calls), env, datei, now, pruefeVorschau: async () => null });
  assert.deepEqual(ergebnis.bericht.map((b) => `${b.job_id}:${b.status}`), ['a:bestanden', 'b:gescheitert', 'c:offen', 'd:uebersprungen']);
  assert.equal(calls[0], 'acquire:42:18');
  assert.equal(rows[0].status, 'accepted');
  assert.equal(rows[0].accepted.record.story_id, 'wt-a', 'daraus stellt der Redaktionstisch die Vorschau');
  assert.equal(rows[1].status, 'quarantined');
  assert.equal(rows[1].last_error.error_code, 'QUALITY_GATE_FAILED');
  assert.equal(rows[2].status, 'queued', 'nicht drangekommen bleibt wartend');
  assert.equal(rows[2].attempts.direct, 1);
  assert.equal(rows[3].status, 'queued', 'ein veraenderter Auftrag bekommt kein fremdes Ergebnis');
});

test('eine ungueltige Vorschau wird hier sichtbar blockiert, nicht auf dem Redaktionstisch', async () => {
  const rows = [job('a')];
  const dir = verzeichnis(), datei = path.join(dir, 'e.json');
  fs.writeFileSync(datei, JSON.stringify({ ergebnisse: [{ job_id: 'a', input_hash: 'hash-a', status: 'bestanden', record: { story_id: 'wt-a' } }] }));
  const ergebnis = await abgeben({ session: tisch(rows), env, datei, now, pruefeVorschau: async () => 'EDITORIAL_PREVIEW_INVALID' });
  assert.deepEqual(ergebnis.bericht, [{ job_id: 'a', status: 'gescheitert', grund: 'EDITORIAL_PREVIEW_INVALID' }]);
  assert.equal(rows[0].status, 'quarantined');
});

test('wer dreimal nicht drankommt, wird sichtbar blockiert statt endlos zu warten', async () => {
  const rows = [job('a', { attempts: { direct: MAX_VERSUCHE - 1 } })];
  const dir = verzeichnis(), datei = path.join(dir, 'e.json');
  fs.writeFileSync(datei, JSON.stringify({ ergebnisse: [{ job_id: 'a', input_hash: 'hash-a', status: 'offen', grund: 'AI_BUDGET_BLOCKED' }] }));
  await abgeben({ session: tisch(rows), env, datei, now, pruefeVorschau: async () => null });
  assert.equal(rows[0].status, 'quarantined');
  assert.equal(rows[0].last_error.error_code, 'AI_BUDGET_BLOCKED');
});

test('die Vorschau entspricht der, die der Redaktionstisch baut', () => {
  const tischCode = fs.readFileSync(new URL('../../scripts/news/bridge/intake-news.mjs', import.meta.url), 'utf8');
  assert.match(tischCode, /const preview=\{format:'news',title:record\.title,subtitle:record\.analysis\.summary,markdown:record\.source_summary,sources:record\.sources\.map\(s=>\(\{url:s\.url,title:s\.title,publisher:s\.publisher\}\)\),news_record:record,/,
    'aendert sich die Vorschau des Tisches, muss freigabeVorschau mitgehen');
  const vorschau = freigabeVorschau({ title: 'T', analysis: { summary: 'S' }, source_summary: 'Q', sources: [{ url: 'u', title: 't', publisher: 'p', extra: 1 }] });
  assert.deepEqual(vorschau.sources, [{ url: 'u', title: 't', publisher: 'p' }]);
  assert.equal(vorschau.format, 'news');
});

test('kein Quellentext und keine Meldung im oeffentlichen Protokoll', async () => {
  const rows = [job('a', { candidate: { story_id: 'wt-a', sources: [{ article_excerpt: 'GEHEIMER AUSZUG' }] } })];
  const dir = verzeichnis();
  const ergebnis = await holen({ session: tisch(rows), env, datei: path.join(dir, 'a.json'), now: '2026-09-18T15:00:00.000Z' });
  assert.equal(JSON.stringify(ergebnis).includes('GEHEIMER'), false);
});
