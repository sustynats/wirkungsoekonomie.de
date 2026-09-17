import test from 'node:test';
import assert from 'node:assert/strict';
import { themenVon, istReserviertesThema, TECHNIK_MUSTER } from '../../scripts/news/themen.mjs';
import { contentTopics } from '../../scripts/news/app-pages.mjs';
import { RESERVIERTE_THEMEN } from '../../scripts/news/lage.mjs';

// Der gemessene Fall vom 17.09.2026: Etikett "Energie", Titel "Kuenstliche
// Intelligenz". Das Etikett traf Wirtschaft und Klima, und weil die alte
// Zuordnung nur bei leerem Treffer in den Titel sah, bekam die Meldung nie
// Technik.
const kiAktien = { topic: ['Energie'], title: 'Künstliche Intelligenz: Warnungen schicken Aktien von Siemens Energy auf Talfahrt', teaser: '' };

test('Etiketten und Titel gelten zusammen, nicht entweder-oder', () => {
  const themen = themenVon(kiAktien);
  assert.ok(themen.includes('technik'), 'Technik aus dem Titel');
  assert.ok(themen.includes('wirtschaft'), 'Wirtschaft aus dem Etikett bleibt');
  assert.ok(themen.includes('klima'), 'Klima aus dem Etikett bleibt');
});

test('kein Thema geht durch die Vereinigung verloren', () => {
  const nurEtikett = { topic: ['Gesundheit'], title: 'Ein Titel ohne jedes Ressortwort' };
  assert.deepEqual(themenVon(nurEtikett), ['gesundheit']);
  const nurTitel = { topic: [], title: 'Halbleiter: Neues Rechenzentrum in Betrieb' };
  assert.deepEqual(themenVon(nurTitel), ['technik']);
});

test('das Technikmuster kennt die Begriffe ohne das Wort Technik', () => {
  for (const wort of ['Halbleiter', 'Chip', 'Rechenzentrum', 'Plattform', 'Sprachmodell', 'künstliche Intelligenz', 'Algorithmus', 'Cloud', 'Glasfaser']) {
    assert.ok(TECHNIK_MUSTER.test(wort.toLowerCase()), wort);
  }
});

// Gemessen: mit "Drohne" im Muster waeren 4 von 9 neuen Techniktreffern
// Kriegsmeldungen gewesen. Das Ressort ist Technik, nicht Ruestung.
test('Kriegsmeldungen werden nicht zum Technikthema', () => {
  assert.equal(themenVon({ topic: ['Geopolitik'], title: 'Russische Drohne trifft Geheimdienst-Sitz in Kiew' }).includes('technik'), false);
});

test('die Europaeische Union gehoert zu International', () => {
  for (const titel of ['Kanada soll assoziiertes EU-Mitglied werden', 'Die Europäische Union genehmigt den Kapazitätsmechanismus', 'Europa ordnet sich neu', 'Ein EU-Gipfel ohne Ergebnis']) {
    assert.ok(themenVon({ topic: [], title: titel }).includes('international'), titel);
  }
  assert.equal(themenVon({ topic: [], title: 'Ein Landtag beschliesst den Etat' }).includes('international'), false);
});

test('Navigation und Lage lesen dasselbe Verzeichnis', () => {
  assert.equal(contentTopics, themenVon);
  assert.deepEqual(RESERVIERTE_THEMEN, ['Technologie', 'KI', 'Digitalisierung', 'Wissenschaft', 'Forschung', 'Infrastruktur', 'Bildung']);
});

test('reserviert ist ein Thema auch ohne passendes Etikett', () => {
  assert.equal(istReserviertesThema(kiAktien), true);
  assert.equal(istReserviertesThema({ topic: ['Technologie'], title: 'Ohne jedes Musterwort' }), true, 'das ausdrueckliche Etikett bleibt gueltig');
  assert.equal(istReserviertesThema({ topic: ['Politik'], title: 'Generaldebatte im Bundestag', teaser: 'Haushalt und Etat' }), false);
});

// Gemessen am 17.09.2026: das Ressort "Wissenschaft" traf 0 von 363
// veroeffentlichten Meldungen, wurde aber als Filter angeboten. Ein Filter,
// der immer leer antwortet, ist ein Fehler und keine Auswahl.
test('ein Ressort ohne einen einzigen Beitrag wird nicht angeboten', async () => {
  const { buildAppPages } = await import('../../scripts/news/app-pages.mjs');
  const path = await import('node:path');
  const os = await import('node:os');
  const geschrieben = new Map();
  const wurzel = path.join(os.tmpdir(), `themen-test-${Math.random().toString(36).slice(2)}`);
  const story = { story_id: 's1', slug: 'chipfabrik', title: 'Halbleiter: Neue Chipfabrik beschlossen',
    teaser: 'Eine Entscheidung mit Folgen.', published: true, published_at: '2026-09-17T09:00:00.000Z',
    source_published_at: '2026-09-17T08:00:00.000Z', topic: ['Technologie'], sources: [] };
  buildAppPages({ root: wurzel, stories: [story], analyses: [], storiesById: new Map([['s1', story]]),
    storyCard: () => '<article data-news-card></article>', editorialCard: () => '',
    pageShell: ({ body }) => body, write: (datei, inhalt) => geschrieben.set(datei, inhalt),
    updatedAt: '2026-09-17T10:00:00.000Z' });
  const html = geschrieben.get(path.join(wurzel, 'wirkungsticker', 'news', 'index.html')) || '';
  assert.ok(html.includes('data-app-filter="technik"'), 'das belegte Ressort steht da');
  assert.equal(html.includes('data-app-filter="wissenschaft"'), false, 'das leere Ressort nicht');
  assert.equal(html.includes('value="wissenschaft"'), false, 'auch nicht in der Auswahlliste');
  assert.ok(html.includes('data-app-filter="alle"'), '"Alle" bleibt immer');
});
