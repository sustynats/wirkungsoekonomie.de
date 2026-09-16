import test from 'node:test';
import assert from 'node:assert/strict';
import { editorialDraftsInWindow, noteEditorialDraft, sharedHourlyRoom, EDITORIAL_HOUR_KEY } from '../../scripts/news/stundenkontingent.mjs';

const now = '2026-09-16T20:00:00.000Z';

// Natalie am 16.09.: die Nachbesprechungen und Analysen sind Teil derselben
// Veroeffentlichung, „dann kommt dann ein Artikel jeweils weniger".
test('ein Entwurf der Redaktionsspur kostet einen Platz der Nachrichtenspur', () => {
  assert.equal(sharedHourlyRoom({ configured: 3, tickerStories: 0, editorialDrafts: 0 }), 3);
  assert.equal(sharedHourlyRoom({ configured: 3, tickerStories: 1, editorialDrafts: 1 }), 1);
  assert.equal(sharedHourlyRoom({ configured: 3, tickerStories: 2, editorialDrafts: 1 }), 0);
  // Mehr als das Kontingent verbraucht ergibt keine negativen Plaetze.
  assert.equal(sharedHourlyRoom({ configured: 3, tickerStories: 3, editorialDrafts: 2 }), 0);
  assert.equal(sharedHourlyRoom({ configured: 0 }), 0);
  assert.equal(sharedHourlyRoom({ configured: 'drei' }), 0);
});

test('gezaehlt wird nur die letzte Stunde', () => {
  const observation = { drafts: ['2026-09-16T18:30:00.000Z', '2026-09-16T19:10:00.000Z', '2026-09-16T19:55:00.000Z'] };
  assert.equal(editorialDraftsInWindow(observation, now), 2, 'der Entwurf von 18:30 ist aus dem Fenster');
  assert.equal(editorialDraftsInWindow(observation, now, 120), 3);
  // Ein Vermerk in der Zukunft zaehlt nicht mit.
  assert.equal(editorialDraftsInWindow({ drafts: ['2026-09-16T21:00:00.000Z'] }, now), 0);
  assert.equal(editorialDraftsInWindow(null, now), 0);
  assert.equal(editorialDraftsInWindow(observation, 'unlesbar'), 0);
  // Altvermerke ohne Feld und blanke Listen gelten ebenfalls.
  assert.equal(editorialDraftsInWindow(['2026-09-16T19:30:00.000Z'], now), 1);
  assert.equal(editorialDraftsInWindow({ drafts: [{ at: '2026-09-16T19:30:00.000Z' }] }, now), 1);
});

test('der Vermerk waechst nicht und verliert nichts, was noch zaehlt', () => {
  let observation = null;
  for (const at of ['2026-09-16T17:00:00.000Z', '2026-09-16T19:10:00.000Z', '2026-09-16T19:55:00.000Z']) {
    observation = noteEditorialDraft(observation, at);
  }
  assert.deepEqual(observation.drafts, ['2026-09-16T19:10:00.000Z', '2026-09-16T19:55:00.000Z'], 'aelter als zwei Fenster faellt weg');
  assert.equal(editorialDraftsInWindow(observation, now), 2);
  assert.deepEqual(noteEditorialDraft(observation, 'unlesbar'), observation, 'eine unlesbare Zeit aendert nichts');
  assert.equal(EDITORIAL_HOUR_KEY, 'editorial-hour-usage');
});

// Beide Spuren lesen dieselben zwei Zahlen. Verdrahtet heisst: die
// Redaktionsspur deckelt ihr Laufbudget damit und vermerkt jeden Entwurf, die
// Nachrichtenspur zieht die Entwürfe von ihren Plätzen ab.
test('beide Spuren rechnen auf dasselbe Kontingent', async () => {
  const fs = await import('node:fs');
  const worker = fs.readFileSync('scripts/news/redaktionsworker.mjs', 'utf8');
  const ticker = fs.readFileSync('scripts/news/run.mjs', 'utf8');
  assert.match(worker, /const budget = Math\.min\(maxJobsPerRun, maxJobsPerDay - counter\.paid, hourlyRoom\)/, 'die Redaktionsspur deckelt ihr Laufbudget');
  assert.match(worker, /hourUsage = noteEditorialDraft\(hourUsage, now\(\)\)/, 'und vermerkt jeden bezahlten Entwurf');
  assert.match(worker, /store\.observe\(EDITORIAL_HOUR_KEY, hourUsage\)/, 'im gemeinsamen Vermerk');
  assert.match(worker, /status: 'hourly_quota_reached'/, 'ein voller Stundenplatz ist ein Ergebnis, kein Fehler');
  assert.match(ticker, /editorialDraftsInWindow\(await bridge\.store\.observation\(EDITORIAL_HOUR_KEY\), now\)/, 'die Nachrichtenspur liest den Vermerk');
  assert.match(ticker, /sharedHourlyRoom\(\{ configured: configuredStoriesPerHour, tickerStories: aiStoriesInLastHour, editorialDrafts: editorialDraftsInLastHour \}\)/, 'und zieht sie ab');
  assert.match(ticker, /report\.editorial_drafts_in_last_hour = editorialDraftsInLastHour;/, 'der Laufbericht zeigt es');
  assert.match(ticker, /report\.shared_hourly_room = hourlyRoom;/);
});

test('die Meldungen der letzten Stunde kommen aus der Nutzungsdatei', async () => {
  const { tickerStoriesInWindow, configuredHourlyQuota } = await import('../../scripts/news/stundenkontingent.mjs');
  const usage = { runs: [
    { started_at: '2026-09-16T18:10:00.000Z', counts: { ai_stories: 2 } },
    { started_at: '2026-09-16T19:40:00.000Z', counts: { ai_stories: 1 } },
    { started_at: '2026-09-16T19:50:00.000Z', ai: { requests: 1 } },
    { started_at: 'unlesbar', counts: { ai_stories: 9 } },
  ] };
  assert.equal(tickerStoriesInWindow(usage, now), 2, 'der Lauf von 18:10 ist aus dem Fenster, die unlesbare Zeit zaehlt nicht');
  assert.equal(tickerStoriesInWindow(usage, '2026-09-16T19:00:00.000Z'), 2, 'alte Laeufe im Fenster zaehlen mit ihrer Meldungszahl');
  assert.equal(tickerStoriesInWindow({}, now), 0);
  assert.equal(tickerStoriesInWindow(null, 'unlesbar'), 0);
  // Die Zahl steht an einer Stelle, der alte Name wirkt weiter.
  assert.equal(configuredHourlyQuota({ WOEK_NEWS_MAX_AI_STORIES_PER_HOUR: '3' }), 3);
  assert.equal(configuredHourlyQuota({ WOEK_NEWS_MAX_AI_CALLS_PER_HOUR: '2' }), 2);
  assert.equal(configuredHourlyQuota({}), 4);
});
