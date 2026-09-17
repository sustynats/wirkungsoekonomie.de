import test from 'node:test';
import assert from 'node:assert/strict';
import { lageWindow, lageEntries, lageRelevanz, RESERVIERTE_THEMEN, RESERVIERTE_PLAETZE } from '../../scripts/news/lage.mjs';

const fenster = lageWindow('mittagslage', '2026-09-17T10:05:00Z'); // 06:00-12:00 Berlin

const meldung = (slug, { at = '2026-09-17T07:00:00Z', staerke = 0, evidenz = 'not_assessable',
  themen = ['Politik'], quellen = 1 } = {}) => ({
  story_id: `wt-${slug}`, slug, title: `Titel ${slug}`, published: true,
  published_at: at, last_updated: at, topic: themen,
  sources: Array.from({ length: quellen }, (_, i) => ({ source_id: `q${i}`, url: `https://example.org/${slug}/${i}` })),
  impact_assessment: { version: '2.1', dimensions: {
    human: { magnitude: staerke, direction: 'negative', evidence: evidenz },
    planet: { magnitude: 0, direction: 'neutral', evidence: 'not_assessable' },
    democracy: { magnitude: 0, direction: 'neutral', evidence: 'not_assessable' } } },
});

test('Wirkungsstärke schlägt Aktualität', () => {
  const stark = meldung('stark', { at: '2026-09-17T06:10:00Z', staerke: 4 });
  const frisch = meldung('frisch', { at: '2026-09-17T09:50:00Z', staerke: 1 });
  const aus = lageEntries({ stories: [frisch, stark], window: fenster, max: 1 });
  assert.deepEqual(aus.map((e) => e.slug), ['stark'], 'die stärkere Wirkung wird gewählt, nicht die neuere Meldung');
});

test('Evidenz entscheidet bei gleicher Stärke', () => {
  const belegt = meldung('belegt', { staerke: 3, evidenz: 'medium' });
  const offen = meldung('offen', { staerke: 3, evidenz: 'not_assessable' });
  assert.ok(lageRelevanz(belegt, { window: fenster }) > lageRelevanz(offen, { window: fenster }));
  assert.deepEqual(lageEntries({ stories: [offen, belegt], window: fenster, max: 1 }).map((e) => e.slug), ['belegt']);
});

// Der Kern von Natalies Vorgabe: „nur weil nicht alle Medien darüber berichten".
test('die Quellenzahl hat keinen Einfluss auf die Auswahl', () => {
  const einzelquelle = meldung('einzel', { staerke: 4, quellen: 1 });
  const vielfach = meldung('vielfach', { staerke: 4, quellen: 9 });
  assert.equal(lageRelevanz(einzelquelle, { window: fenster }), lageRelevanz(vielfach, { window: fenster }),
    'gleiche Wirkung, gleiche Relevanz - unabhängig von der Medienresonanz');
  // Und eine schwache Meldung mit neun Quellen verliert gegen eine starke mit einer.
  const schwachVielfach = meldung('agentur', { staerke: 1, quellen: 9, at: '2026-09-17T09:55:00Z' });
  assert.deepEqual(lageEntries({ stories: [schwachVielfach, einzelquelle], window: fenster, max: 1 }).map((e) => e.slug),
    ['einzel']);
});

test('ein neuer Vorgang hat bei sonst gleichem Stand knapp Vorrang vor einer Fortschreibung', () => {
  const at = '2026-09-17T08:00:00Z';
  const neu = meldung('neu', { at, staerke: 2 });
  const fort = { ...meldung('fort', { at, staerke: 2 }), published_at: '2026-09-16T20:00:00Z', last_updated: at };
  const aus = lageEntries({ stories: [fort, neu], window: fenster, max: 2 });
  assert.deepEqual(new Set(aus.map((e) => e.state)), new Set(['neu', 'fortgeschrieben']));
  assert.ok(lageRelevanz(neu, { state: 'neu', window: fenster }) > lageRelevanz(fort, { state: 'fortgeschrieben', window: fenster }));
});

// Gemessen am 17.09.2026: Technologie 3 und KI 3 Meldungen gegen Politik 106.
test('ein Technologiethema mit belastbarer Stärke verdrängt den schwächsten Politikeintrag', () => {
  const politik = Array.from({ length: 5 }, (_, i) =>
    meldung(`politik${i}`, { staerke: 2 + (i % 2), at: `2026-09-17T0${7 + (i % 2)}:0${i}:00Z` }));
  const technik = meldung('technik', { staerke: 3, themen: ['Technologie'], at: '2026-09-17T06:05:00Z' });
  const aus = lageEntries({ stories: [...politik, technik], window: fenster, max: 4 });
  assert.ok(aus.some((e) => e.slug === 'technik'), 'das Technologiethema ist dabei');
  assert.equal(aus.length, 4, 'die Obergrenze bleibt');
  assert.ok(RESERVIERTE_THEMEN.includes('Technologie') && RESERVIERTE_PLAETZE === 2);
});

test('ein reserviertes Thema ohne Wirkungsstärke verdrängt nichts', () => {
  const politik = Array.from({ length: 4 }, (_, i) => meldung(`politik${i}`, { staerke: 3 }));
  const schwach = meldung('technik-schwach', { staerke: 0, themen: ['Technologie'] });
  const aus = lageEntries({ stories: [...politik, schwach], window: fenster, max: 4 });
  assert.ok(!aus.some((e) => e.slug === 'technik-schwach'), 'keine Quote ohne Substanz');
});

test('gewählt wird nach Relevanz, angezeigt wird chronologisch', () => {
  const stories = [
    meldung('a', { staerke: 5, at: '2026-09-17T06:10:00Z' }),
    meldung('b', { staerke: 1, at: '2026-09-17T09:00:00Z' }),
    meldung('c', { staerke: 3, at: '2026-09-17T07:30:00Z' }),
  ];
  const aus = lageEntries({ stories, window: fenster, max: 3 });
  assert.deepEqual(aus.map((e) => e.slug), ['b', 'c', 'a'], 'neueste zuerst in der Anzeige');
  assert.ok(aus.find((e) => e.slug === 'a').score > aus.find((e) => e.slug === 'b').score, 'der Wert bleibt nachvollziehbar');
});
