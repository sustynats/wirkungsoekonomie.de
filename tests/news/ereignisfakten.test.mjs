import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { eventFacts, sameEventByFacts, SINGLE_DECISION_ACTIONS } from '../../scripts/news/ereignisfakten.mjs';

// 17.09.2026, Natalie: „Irgendwie kommen keine neuen Nachrichten." Vier der
// sechs neuesten waren dasselbe Ereignis, lexikalisch aber drei verschiedene
// Meldungen (Titelaehnlichkeit 0,25 bis 0,37). 190 bezahlte Aufrufe endeten im
// Befund AI_DUPLICATE_WITHOUT_UPDATE - das Modell erkannte die Dublette,
// nachdem sie bezahlt war.
const sanktionen = [
  { title: 'Laut Deutschlandfunk: US-Repräsentantenhaus verabschiedet Sanktionspaket', published_at: '2026-09-17T06:50:00.000Z' },
  { title: 'Laut Tagesspiegel: US-Kongress beschließt Gesetz für Russland-Sanktionen', published_at: '2026-09-16T23:40:00.000Z' },
  { title: 'Laut stern: US-Kongress stimmt für Sanktionsgesetz gegen Russland', published_at: '2026-09-16T22:30:00.000Z' },
];

test('dieselbe Nachricht in anderen Worten wird erkannt', () => {
  for (const item of sanktionen) {
    const fakten = eventFacts(item);
    assert.equal(fakten.action, 'beschluss', `${item.title.slice(0, 30)}: Handlungsart`);
    assert.equal(fakten.object, 'sanktion', 'Gegenstand auf den Kern zurueckgefuehrt');
    assert.ok(fakten.day, 'mit Tag');
  }
  assert.equal(sameEventByFacts(sanktionen[0], sanktionen[1]), true);
  assert.equal(sameEventByFacts(sanktionen[0], sanktionen[2]), true);
  assert.equal(sameEventByFacts(sanktionen[1], sanktionen[2]), true);
});

test('eine andere Nachricht bleibt eine andere', () => {
  const brand = { title: 'Großbrand in Mannheimer Recyclinghof: Warnung aufgehoben', published_at: '2026-09-17T04:20:00.000Z' };
  assert.equal(sameEventByFacts(sanktionen[0], brand), false);
  // Gleicher Gegenstand, andere Handlung.
  assert.equal(sameEventByFacts(sanktionen[0], { title: 'Gericht urteilt über Sanktionsliste', published_at: '2026-09-17T06:00:00.000Z' }), false);
  // Gleiche Handlung und Gegenstand, anderer Tag ausserhalb des Fensters.
  assert.equal(sameEventByFacts(sanktionen[0], { title: 'Bundestag beschließt Sanktionspaket', published_at: '2026-09-01T06:00:00.000Z' }), false);
  // Ohne erkennbare Fakten gibt es kein Urteil - dann bleiben es zwei Meldungen.
  assert.equal(sameEventByFacts({ title: 'Kurz notiert', published_at: '2026-09-17T06:00:00.000Z' }, sanktionen[0]), false);
  assert.equal(sameEventByFacts(sanktionen[0], { title: 'Bundestag beschließt Sanktionspaket' }), false, 'ohne Datum kein Urteil');
});

// Am Bestand gemessen: mit allen Handlungsarten erkannte die Regel 57 Paare,
// darunter die Stromnetz-Sabotage vom 04.09. als ein Ereignis. „Polizei findet
// zwoelf Sprengsaetze", „Polizei stuermt Fahrzeug" und „Brandenburg plant
// Sicherheitszentrum" sind verschiedene Entwicklungen einer Lage. Sie
// zusammenzufuehren haette echte Nachrichten geloescht.
test('rollende Lagen werden nicht zusammengefuehrt', () => {
  assert.deepEqual([...SINGLE_DECISION_ACTIONS].sort(), ['beschluss', 'urteil']);
  const lage = [
    { title: 'Angriffe aufs Stromnetz: Fahndung nach Verdächtigem läuft weiter', published_at: '2026-09-04T10:00:00.000Z' },
    { title: 'Sabotage: Polizei findet zwölf Sprengsätze an Stromtrassen in Sachsen', published_at: '2026-09-04T14:00:00.000Z' },
    { title: 'Brandenburg plant Sicherheitszentrum nach Stromnetz-Sabotage', published_at: '2026-09-04T18:00:00.000Z' },
  ];
  assert.equal(eventFacts(lage[0]).action, 'angriff', 'die Handlungsart wird erkannt');
  for (let i = 0; i < lage.length; i += 1) for (let j = i + 1; j < lage.length; j += 1) {
    assert.equal(sameEventByFacts(lage[i], lage[j]), false, `${lage[i].title.slice(0, 28)} vs ${lage[j].title.slice(0, 28)}`);
  }
});

// Die Schwelle ist eng, weil eine falsche Zusammenfuehrung eine echte Nachricht
// aus dem Ticker loescht. Am gesamten veroeffentlichten Bestand darf die Regel
// nur Paare erkennen, die wirklich dasselbe Ereignis sind.
test('am veroeffentlichten Bestand fuehrt die Regel nichts falsch zusammen', () => {
  const stories = JSON.parse(fs.readFileSync(new URL('../../data/news/stories.json', import.meta.url), 'utf8')).stories
    .filter((story) => story.published && story.listed !== false)
    .map((story) => ({ title: story.title, summary: story.analysis?.source_summary || '', published_at: story.published_at }));
  assert.ok(stories.length > 200, 'der Bestand ist gross genug fuer die Messung');
  const paare = [];
  for (let i = 0; i < stories.length; i += 1) for (let j = i + 1; j < stories.length; j += 1) {
    if (sameEventByFacts(stories[i], stories[j])) paare.push([stories[i].title, stories[j].title]);
  }
  // Jedes erkannte Paar muss denselben Gegenstand und dieselbe Handlung tragen.
  for (const [a, b] of paare) {
    const links = eventFacts({ title: a, published_at: '2026-09-17T00:00:00.000Z' });
    assert.ok(SINGLE_DECISION_ACTIONS.has(links.action), `${a.slice(0, 40)}: nur einzelne Vorgaenge`);
  }
  // Die Zahl bleibt klein: viele Treffer waeren ein Zeichen fuer zu grobe Regeln.
  assert.ok(paare.length <= 20, `wenige, sichere Paare (gemessen: ${paare.length})`);
});

test('der Lauf benutzt beide Wege der Dublettenerkennung', () => {
  const quelle = fs.readFileSync(new URL('../../scripts/news/run.mjs', import.meta.url), 'utf8');
  assert.match(quelle, /import \{ sameEventByFacts \} from "\.\/ereignisfakten\.mjs"/);
  assert.match(quelle, /existingStoryMatch\(item, \{ story, last_updated: story\.last_updated \|\| story\.published_at \}, now\) >= 0\.95\s*\|\|\s*sameEventByFacts/,
    'Wortvergleich oder Faktenvergleich');
});
