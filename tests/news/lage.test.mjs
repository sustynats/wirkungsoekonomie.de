import test from 'node:test';
import assert from 'node:assert/strict';
import { LAGEN, MAX_ENTRIES, berlinInstant, previousIsoDate, lageWindow, dueLage, lageId,
  lageEntries, lageHeadline, buildLage, upsertLage, lagenNachDatum, KEEP_DAYS } from '../../scripts/news/lage.mjs';

const story = (slug, published, updated = null, extra = {}) => ({ story_id: `wt-${slug}`, slug,
  title: `Titel ${slug}`, published: true, published_at: published,
  last_updated: updated || published, ...extra });

test('die drei Fenster schliessen aneinander an und lassen keine Lücke', () => {
  const morgen = lageWindow('morgenlage', '2026-09-17T06:05:00Z');
  const mittag = lageWindow('mittagslage', '2026-09-17T10:05:00Z');
  const abend = lageWindow('abendlage', '2026-09-17T16:05:00Z');
  assert.equal(morgen.to, mittag.from, 'die Mittagslage setzt an, wo die Morgenlage endet');
  assert.equal(mittag.to, abend.from, 'die Abendlage setzt an, wo die Mittagslage endet');
  // 18:00 Berlin des Vortags bis 06:00 Berlin: Abend und Nacht in einem Fenster.
  assert.equal(morgen.from, '2026-09-16T16:00:00.000Z');
  assert.equal(morgen.to, '2026-09-17T04:00:00.000Z');
  assert.equal(morgen.since, 'seit gestern Abend');
});

// Die Zeitumstellung darf das Fenster nicht verschieben. Am 17.09.2026 hat eine
// falsch gelesene Berliner Stunde das Tagesprofil dauerhaft auf Nacht gestellt.
test('Sommerzeit und Winterzeit verschieben die Fenster nicht', () => {
  // Ende der Sommerzeit: 25.10.2026, 18:00 (+02) bis 06:00 (+01) = 13 echte Stunden.
  const ende = lageWindow('morgenlage', '2026-10-25T05:30:00Z');
  assert.equal(ende.from, '2026-10-24T16:00:00.000Z');
  assert.equal(ende.to, '2026-10-25T05:00:00.000Z');
  assert.equal((Date.parse(ende.to) - Date.parse(ende.from)) / 3600000, 13);
  // Beginn der Sommerzeit: 29.03.2026, 18:00 (+01) bis 06:00 (+02) = 11 echte Stunden.
  const start = lageWindow('morgenlage', '2026-03-29T05:30:00Z');
  assert.equal((Date.parse(start.to) - Date.parse(start.from)) / 3600000, 11);
  // Und die Stunde selbst bleibt 06:00 Berliner Zeit, nicht 05:00 oder 07:00.
  for (const [datum, erwartet] of [['2026-01-15', '2026-01-15T05:00:00.000Z'], ['2026-07-15', '2026-07-15T04:00:00.000Z']]) {
    assert.equal(berlinInstant(datum, 6), erwartet);
  }
  assert.equal(previousIsoDate('2026-01-01'), '2025-12-31');
  assert.equal(berlinInstant('unsinn', 6), null);
  assert.equal(berlinInstant('2026-09-17', 24), null);
});

test('eine verspätete Lage gehört weiter zu ihrem Fenster', () => {
  // Berliner Zeit = UTC+2 im September.
  assert.equal(dueLage('2026-09-17T03:59:00Z'), null, 'vor 06:00 ist keine Lage fällig');
  assert.equal(dueLage('2026-09-17T04:00:00Z'), 'morgenlage');
  assert.equal(dueLage('2026-09-17T09:59:00Z'), 'morgenlage', 'ein verspäteter Lauf bleibt Morgenlage');
  assert.equal(dueLage('2026-09-17T10:00:00Z'), 'mittagslage');
  assert.equal(dueLage('2026-09-17T16:00:00Z'), 'abendlage');
  assert.equal(dueLage('2026-09-17T21:59:00Z'), 'abendlage');
  assert.equal(dueLage('unsinn'), null);
  assert.equal(lageId('2026-09-17', 'morgenlage'), '2026-09-17-morgenlage');
  assert.equal(lageId('2026-09-17', 'zwischenlage'), null);
});

// Der Kern der Entscheidung: maßgeblich ist die Herausgabezeit. Am 17.09.2026
// hat die Verwechslung mit der Ereigniszeit die Benachrichtigungen verschluckt.
// Dieselbe Verwechslung wuerde hier eine Meldung aus der Lage fallen lassen,
// nur weil das Ereignis aelter ist als der Lauf.
test('eine Meldung über ein älteres Ereignis gehört in die Lage, in der sie herausgegeben wurde', () => {
  const fenster = lageWindow('mittagslage', '2026-09-17T10:05:00Z'); // 06:00-12:00 Berlin
  const nachtrag = story('nachtrag', '2026-09-17T08:00:00Z'); // 10:00 Berlin herausgegeben
  nachtrag.news_at = '2026-09-14T09:00:00Z'; // Ereignis drei Tage alt
  const entries = lageEntries({ stories: [nachtrag], window: fenster });
  assert.equal(entries.length, 1, 'der Nachtrag ist in dieser Lage neu');
  assert.equal(entries[0].state, 'neu');
});

test('neu, fortgeschrieben und draussen werden getrennt', () => {
  const fenster = lageWindow('mittagslage', '2026-09-17T10:05:00Z');
  const entries = lageEntries({ stories: [
    story('neu', '2026-09-17T07:00:00Z'),
    story('fortgeschrieben', '2026-09-16T20:00:00Z', '2026-09-17T09:00:00Z'),
    story('unberuehrt', '2026-09-16T20:00:00Z'),
    story('spaeter', '2026-09-17T11:00:00Z'), // nach 12:00 Berlin, gehört in die Abendlage
    { ...story('unveroeffentlicht', '2026-09-17T07:30:00Z'), published: false },
  ], window: fenster });
  assert.deepEqual(entries.map((e) => `${e.slug}:${e.state}`), ['fortgeschrieben:fortgeschrieben', 'neu:neu']);
  assert.equal(entries[0].at, '2026-09-17T09:00:00.000Z', 'sortiert nach Herausgabe, neueste zuerst');
});

test('es gibt eine Obergrenze und ausdrücklich keine Untergrenze', () => {
  const fenster = lageWindow('mittagslage', '2026-09-17T10:05:00Z');
  const viele = Array.from({ length: 22 }, (_, i) =>
    story(`m${i}`, new Date(Date.parse('2026-09-17T05:00:00Z') + i * 60000).toISOString()));
  assert.equal(lageEntries({ stories: viele, window: fenster }).length, MAX_ENTRIES);
  assert.equal(MAX_ENTRIES, 15);
  // Keine Untergrenze: sechs Entwicklungen bleiben sechs.
  assert.equal(lageEntries({ stories: viele.slice(0, 6), window: fenster }).length, 6);
});

test('keine Entwicklung ist eine Aussage, keine Leerstelle', () => {
  const fenster = lageWindow('abendlage', '2026-09-17T16:05:00Z');
  assert.equal(lageHeadline({ entries: [], window: fenster }), 'Keine belastbare neue Entwicklung seit 12 Uhr.');
  assert.equal(lageHeadline({ entries: [1], window: fenster }), 'Das ist die eine Entwicklung, die seit 12 Uhr wirkungsrelevant geworden ist.');
  assert.equal(lageHeadline({ entries: [1, 2, 3], window: fenster }), 'Das sind die 3 Entwicklungen, die seit 12 Uhr wirkungsrelevant geworden sind.');
  assert.match(lageHeadline({ entries: [1, 2], window: lageWindow('morgenlage', '2026-09-17T06:05:00Z') }), /seit gestern Abend/);
});

test('eine Lage ist ein vollständiges, prüfbares Objekt', () => {
  const lage = buildLage({ slot: 'mittagslage', now: '2026-09-17T10:05:00Z', stories: [
    story('a', '2026-09-17T07:00:00Z'),
    story('b', '2026-09-16T20:00:00Z', '2026-09-17T09:30:00Z'),
  ] });
  assert.equal(lage.lage_id, '2026-09-17-mittagslage');
  assert.equal(lage.label, 'Mittagslage');
  assert.equal(lage.stand, lage.window_to);
  assert.deepEqual(lage.counts, { total: 2, neu: 1, fortgeschrieben: 1 });
  assert.equal(lage.headline, 'Das sind die 2 Entwicklungen, die seit 6 Uhr wirkungsrelevant geworden sind.');
  assert.deepEqual(lage.entries.map((e) => e.state), ['fortgeschrieben', 'neu']);
  assert.equal(buildLage({ slot: 'zwischenlage', now: '2026-09-17T10:05:00Z' }), null);
  assert.equal(LAGEN.length, 3);
});

test('dieselbe Lage zweimal ergibt keinen zweiten Eintrag', () => {
  const lage = (slot, now) => buildLage({ slot, now, stories: [story('a', '2026-09-17T07:00:00Z')] });
  let store = { lagen: [] };
  store = upsertLage(store, lage('mittagslage', '2026-09-17T10:05:00Z'));
  store = upsertLage(store, lage('mittagslage', '2026-09-17T10:20:00Z')); // Wiederholung desselben Laufs
  assert.equal(store.lagen.length, 1, 'ein wiederholter Lauf erzeugt keine Doppelausgabe');
  store = upsertLage(store, lage('abendlage', '2026-09-17T16:05:00Z'));
  assert.deepEqual(store.lagen.map((l) => l.slot), ['abendlage', 'mittagslage'], 'neueste zuerst');
  assert.equal(store.updated_at, store.lagen[0].stand);
  assert.equal(store.schema_version, '1.0');
});

test('alte Lagen fallen aus der Ablage, nach Tag gruppiert bleibt die Folge lesbar', () => {
  const alt = { lage_id: '2026-07-01-morgenlage', slot: 'morgenlage', date: '2026-07-01', stand: '2026-07-01T04:00:00.000Z' };
  const neu = buildLage({ slot: 'mittagslage', now: '2026-09-17T10:05:00Z', stories: [] });
  const store = upsertLage({ lagen: [alt] }, neu, { keepDays: 30 });
  assert.deepEqual(store.lagen.map((l) => l.lage_id), ['2026-09-17-mittagslage'], 'die alte Lage ist heraus');

  const gruppen = lagenNachDatum({ lagen: [
    { lage_id: '2026-09-16-abendlage', slot: 'abendlage', date: '2026-09-16', stand: '2026-09-16T16:00:00.000Z' },
    { lage_id: '2026-09-17-morgenlage', slot: 'morgenlage', date: '2026-09-17', stand: '2026-09-17T04:00:00.000Z' },
    { lage_id: '2026-09-17-mittagslage', slot: 'mittagslage', date: '2026-09-17', stand: '2026-09-17T10:00:00.000Z' },
  ] });
  assert.deepEqual(gruppen.map((g) => g.date), ['2026-09-17', '2026-09-16'], 'neuester Tag zuerst');
  assert.deepEqual(gruppen[0].lagen.map((l) => l.slot), ['mittagslage', 'morgenlage'], 'innerhalb des Tages neueste zuerst');
  assert.deepEqual(upsertLage({ lagen: [alt] }, null).lagen, [alt], 'ohne Lage bleibt die Ablage unberührt');
});

// Die Bauregel aus docs/news/LAGEN-UMBAU.md, Abschnitt 6a: die Lage ist ein
// Rahmen um die bestehenden Karten, kein neuer Kartentyp. Der Test prüft das am
// echten Meldungsbestand und auf die härteste denkbare Weise - die Lage muss die
// Ausgabe von storyCard wörtlich enthalten. Damit kann keine Lage eine Karte
// ohne Balken, Ringe, Quellen oder Wirkungsanalyse zeigen.
test('die Lage rendert wörtlich dieselbe Karte wie die Ticker-Liste', async () => {
  const fs = await import('node:fs');
  const { storyCard, lageBody } = await import('../../scripts/news/build.mjs');
  const katalog = JSON.parse(fs.readFileSync('data/news/stories.json')).stories
    .filter((s) => s.published && s.analysis && s.listed !== false);
  assert.ok(katalog.length > 50, 'der Test läuft gegen den echten Bestand');
  const echte = katalog[0];

  const lage = { lage_id: '2026-09-17-mittagslage', slot: 'mittagslage', label: 'Mittagslage',
    date: '2026-09-17', stand: '2026-09-17T10:00:00.000Z',
    headline: 'Das sind die 1 Entwicklungen, die seit 6 Uhr wirkungsrelevant geworden sind.',
    entries: [{ story_id: echte.story_id, slug: echte.slug, state: 'neu' }] };
  const html = lageBody(lage, new Map([[echte.story_id, echte]]));

  assert.ok(html.includes(storyCard(echte, 0)), 'die Karte ist wörtlich dieselbe');
  assert.match(html, /data-news-lage="2026-09-17-mittagslage"/);
  assert.match(html, /Mittagslage · 17\. September · Stand 12:00 Uhr/, 'Stand in Berliner Zeit');
  assert.ok(html.includes(lage.headline));
});

test('eine Lage ohne auflösbare Meldung bricht nicht und behauptet nichts', async () => {
  const { lageBody } = await import('../../scripts/news/build.mjs');
  const lage = { lage_id: '2026-09-17-abendlage', slot: 'abendlage', label: 'Abendlage',
    date: '2026-09-17', stand: '2026-09-17T16:00:00.000Z',
    headline: 'Keine belastbare neue Entwicklung seit 12 Uhr.', entries: [{ story_id: 'wt-verschwunden' }] };
  const html = lageBody(lage, new Map());
  assert.match(html, /Keine belastbare neue Entwicklung in diesem Zeitraum/);
  assert.doesNotMatch(html, /data-news-card/, 'keine erfundene Karte');
});
