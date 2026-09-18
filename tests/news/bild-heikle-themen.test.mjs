import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseTitleImageMode } from '../../scripts/news/title-image/policy.mjs';
import { pendingTitleImageQueue, sensitiveMotif } from '../../scripts/news/run.mjs';

const lang = 'Die Meldung beschreibt den Vorgang ausführlich und neutral, mit allen belegten Einzelheiten und ohne Wertung.';
const meldung = (title, summary, felder = {}) => ({ story_id: 'wt-' + 'a'.repeat(16), published: true, listed: true, title, source_summary: `${summary} ${lang}`, topic: [], claims: [], ...felder });

// 18.09.2026: "Fuenf Laeden in Frankfurt und Offenbach durch Detonationen stark
// beschaedigt" bekam als NEUTRAL_TOPIC_ECONOMY ein fotorealistisches Motiv mit
// Absperrband und Beweismarkierung - ein scheinbares Tatortfoto.
test('Gefahrenlagen, Einsaetze und Verletzungen bekommen die Karte', () => {
  for (const [titel, text] of [
    ['Fünf Läden durch Detonationen stark beschädigt', 'Die wirtschaftlichen Schäden für die Geschäfte sind hoch.'],
    ['Explosion in einem Wohnhaus', 'Die Wirtschaft der Region ist betroffen.'],
    ['Polizei ermittelt nach Brandanschlag', 'Der Haushalt der Stadt muss die Schäden tragen.'],
    ['Fliegerbombe gefunden', 'Die Evakuierung läuft, der Verkehr ruht.'],
    ['Unfall auf der Autobahn', 'Mehrere Menschen wurden verletzt.'],
    ['Festnahme nach Überfall', 'Der Täter wurde gefasst.'],
  ]) assert.deepEqual(chooseTitleImageMode(meldung(titel, text)), { mode: 'impact_card', reason: 'SENSITIVE_SUBJECT' }, titel);
});

test('ruhige Wirtschaftsthemen behalten ihr Motiv', () => {
  const ruhig = chooseTitleImageMode(meldung('EU plant neue Investitionen in Schienen', 'Die Investition soll den Verkehr stärken.'));
  assert.equal(ruhig.mode, 'editorial');
  // "Kostenexplosion" ist keine Gefahrenlage: die Wortgrenze trennt sie.
  assert.equal(chooseTitleImageMode(meldung('Kostenexplosion im Haushalt', 'Die Wirtschaft reagiert auf steigende Preise.')).mode, 'editorial');
});

// Die Warteschlange nahm nur Meldungen OHNE Bild. Ein schon veroeffentlichtes
// Motiv haette eine verschaerfte Regel deshalb nie mehr erreicht.
test('ein vorhandenes Motiv auf heikler Meldung wird ersetzt, vor fehlenden Bildern', () => {
  const heikel = meldung('Fünf Läden durch Detonationen beschädigt', 'Die Geschäfte sind stark beschädigt.', { story_id: 'wt-' + 'b'.repeat(16), title_image: { mode: 'editorial' } });
  const fehlt = meldung('EU plant Investitionen', 'Die Investition stärkt den Verkehr.', { story_id: 'wt-' + 'c'.repeat(16), title_image: null });
  const ruhig = meldung('EU plant Investitionen in Häfen', 'Die Investition stärkt den Handel.', { story_id: 'wt-' + 'd'.repeat(16), title_image: { mode: 'editorial', og: { url: 'x' }, wide: { url: 'x' }, square: { url: 'x' } } });
  assert.equal(sensitiveMotif(heikel), true);
  assert.equal(sensitiveMotif(ruhig), false, 'ein ruhiges Motiv bleibt');
  const reihe = pendingTitleImageQueue([fehlt, ruhig, heikel], { now: '2026-09-18T08:00:00Z', limit: 4 }).map((s) => s.story_id);
  assert.equal(reihe[0], heikel.story_id, 'das irrefuehrende Motiv zuerst');
  assert.equal(reihe.includes(ruhig.story_id), false);
});
