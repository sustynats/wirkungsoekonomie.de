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

test('Navigation und Lage lesen dasselbe Verzeichnis', () => {
  assert.equal(contentTopics, themenVon);
  assert.deepEqual(RESERVIERTE_THEMEN, ['Technologie', 'KI', 'Digitalisierung', 'Wissenschaft', 'Forschung', 'Infrastruktur', 'Bildung']);
});

test('reserviert ist ein Thema auch ohne passendes Etikett', () => {
  assert.equal(istReserviertesThema(kiAktien), true);
  assert.equal(istReserviertesThema({ topic: ['Technologie'], title: 'Ohne jedes Musterwort' }), true, 'das ausdrueckliche Etikett bleibt gueltig');
  assert.equal(istReserviertesThema({ topic: ['Politik'], title: 'Generaldebatte im Bundestag', teaser: 'Haushalt und Etat' }), false);
});
