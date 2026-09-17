import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { buildAppPages } from '../../scripts/news/app-pages.mjs';

// Natalie am 17.09.2026: „Die Startseite könnte sehr klar werden: Morgenlage →
// Mittagslage → Abendlage, jeweils die relevante Auswahl." Die Karten bleiben
// auf der Lage-Seite; die Startseite ordnet.
function startseite(lagen) {
  const geschrieben = new Map();
  const wurzel = path.join(os.tmpdir(), `lage-test-${Math.random().toString(36).slice(2)}`);
  buildAppPages({ root: wurzel, stories: [], analyses: [], storiesById: new Map(),
    storyCard: () => '<article data-news-card></article>', editorialCard: () => '',
    pageShell: ({ body }) => body, write: (datei, inhalt) => geschrieben.set(datei, inhalt),
    updatedAt: '2026-09-17T10:00:00.000Z', lagen });
  return geschrieben.get(path.join(wurzel, 'wirkungsticker', 'index.html')) || '';
}

const lage = (slot, label, stand, headline, counts) => ({
  lage_id: `2026-09-17-${slot}`, slot, label, date: '2026-09-17', stand, headline, counts, entries: [] });

test('die Startseite zeigt die Lagen des jüngsten Tages, neueste zuerst', () => {
  const html = startseite([
    lage('morgenlage', 'Morgenlage', '2026-09-17T04:00:00.000Z', 'Das sind die 9 Entwicklungen, die seit gestern Abend wirkungsrelevant geworden sind.', { total: 9, neu: 7, fortgeschrieben: 2 }),
    lage('mittagslage', 'Mittagslage', '2026-09-17T10:00:00.000Z', 'Das sind die 4 Entwicklungen, die seit 6 Uhr wirkungsrelevant geworden sind.', { total: 4, neu: 4, fortgeschrieben: 0 }),
    { lage_id: '2026-09-16-abendlage', slot: 'abendlage', label: 'Abendlage', date: '2026-09-16',
      stand: '2026-09-16T16:00:00.000Z', headline: 'Alt.', counts: { total: 3 }, entries: [] },
  ]);

  assert.match(html, /Die Lage am 17\. September/);
  const reihenfolge = [...html.matchAll(/ticker-lage-kicker">([^<]+)/g)].map((m) => m[1]);
  assert.deepEqual(reihenfolge, ['Mittagslage · Stand 12:00 Uhr', 'Morgenlage · Stand 06:00 Uhr'],
    'neueste Lage zuerst, Stand in Berliner Zeit, der Vortag bleibt draußen');
  assert.match(html, /9 Entwicklungen · 2 fortgeschrieben/);
  assert.match(html, /4 Entwicklungen<\/p>/);
  // Wurzelrelative Verweise: die Startseite liegt eine andere Ebene als die Lage.
  assert.match(html, /href="\/wirkungsticker\/lage\/2026-09-17-mittagslage\/"/);
  assert.ok(!html.includes('2026-09-16-abendlage'), 'nur der jüngste Tag');
  // Der Abschnitt steht vor den aktuellen Meldungen.
  assert.ok(html.indexOf('ticker-home-lagen') < html.indexOf('Aktuelle Meldungen'));
});

test('keine Entwicklung wird als Aussage gezeigt, nicht als Leerstelle', () => {
  const html = startseite([lage('abendlage', 'Abendlage', '2026-09-17T16:00:00.000Z',
    'Keine belastbare neue Entwicklung seit 12 Uhr.', { total: 0, neu: 0, fortgeschrieben: 0 })]);
  assert.match(html, /Keine belastbare neue Entwicklung seit 12 Uhr\./);
  assert.match(html, /keine belastbare neue Entwicklung<\/p>/);
});

test('ohne Ablage entsteht kein Abschnitt und nichts bricht', () => {
  for (const leer of [[], undefined, [{ lage_id: null }], [{ lage_id: 'x', date: '2026-09-17', stand: 'unsinn' }]]) {
    const html = startseite(leer);
    assert.ok(!html.includes('ticker-home-lagen'), 'kein leerer Rahmen');
    assert.match(html, /Aktuelle Meldungen/, 'die Startseite bleibt vollständig');
  }
});
