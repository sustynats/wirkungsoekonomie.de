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
  assert.match(ticker, /sharedHourlyRoom\(\{ configured: configuredStoriesPerHour, tickerStories: aiStoriesInLastHour, editorialDrafts: editorialDraftsInLastHour/, 'und zieht sie ab');
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

// 17.09.2026: Die Nachrichtenspur laeuft in jedem Zyklus vier Minuten vor der
// Redaktionsspur (:04/:19/:34/:49 gegen :08/:23/:38/:53). Ohne Reserve nahm sie
// alle Plaetze der Stunde, und die Redaktionsspur fand um :08 nichts mehr:
// Natalies Analysen und Nachbesprechungen waeren nie gezogen worden, ohne dass
// irgendwo ein Fehler auftaucht. Genau das Gegenteil ihrer Vorgabe.
test('wartende Redaktionsarbeit bekommt ihren Platz in der Stunde', async () => {
  const { editorialReserve, sharedHourlyRoom, waitingRecord, waitingCount, EDITORIAL_WAITING_KEY } = await import('../../scripts/news/stundenkontingent.mjs');
  // Die Stunde spielt sich so ab, wie Natalie sie beschrieben hat.
  assert.equal(editorialReserve({ configured: 3, waiting: 92, editorialDrafts: 0 }), 1, 'ein Platz bleibt frei');
  assert.equal(sharedHourlyRoom({ configured: 3, tickerStories: 0, editorialDrafts: 0, reserve: 1 }), 2, 'die Nachrichtenspur nimmt um :04 nur zwei');
  assert.equal(sharedHourlyRoom({ configured: 3, tickerStories: 2, editorialDrafts: 0 }), 1, 'die Redaktionsspur findet um :08 ihren Platz');
  assert.equal(editorialReserve({ configured: 3, waiting: 92, editorialDrafts: 1 }), 0, 'der eingelöste Platz wird nicht doppelt reserviert');
  assert.equal(sharedHourlyRoom({ configured: 3, tickerStories: 2, editorialDrafts: 1, reserve: 0 }), 0, 'danach ist die Stunde voll');

  // Keine wartende Arbeit, keine Reserve - die Nachrichtenspur bekommt alles.
  assert.equal(editorialReserve({ configured: 3, waiting: 0 }), 0);
  assert.equal(sharedHourlyRoom({ configured: 3, tickerStories: 0, editorialDrafts: 0, reserve: 0 }), 3);
  // Bei einem einzigen Platz je Stunde wuerde die Reserve die Nachrichten ganz anhalten.
  assert.equal(editorialReserve({ configured: 1, waiting: 92 }), 0);
  assert.equal(editorialReserve({ configured: 'drei', waiting: 92 }), 0);

  // Ein alter Vermerk darf keinen Platz auf Dauer blockieren.
  const at = '2026-09-17T08:00:00.000Z';
  assert.equal(waitingCount(waitingRecord(92, at), '2026-09-17T08:30:00.000Z'), 92);
  assert.equal(waitingCount(waitingRecord(92, at), '2026-09-17T10:00:00.000Z'), 0, 'nach 90 Minuten nicht mehr');
  assert.equal(waitingCount(waitingRecord(0, at), at), 0);
  assert.equal(waitingCount(null, at), 0);
  assert.equal(waitingCount(waitingRecord(92, 'unlesbar'), at), 0);
  assert.equal(EDITORIAL_WAITING_KEY, 'editorial-waiting');
});

test('beide Spuren sind fuer die Reserve verdrahtet', async () => {
  const fs = await import('node:fs');
  const worker = fs.readFileSync('scripts/news/redaktionsworker.mjs', 'utf8');
  const ticker = fs.readFileSync('scripts/news/run.mjs', 'utf8');
  // Der Wartestand wird vor jedem Abbruch vermerkt, sonst verfaellt die Reserve.
  const vermerk = worker.indexOf('store.observe(EDITORIAL_WAITING_KEY');
  assert.ok(vermerk > 0, 'die Redaktionsspur vermerkt ihren Wartestand');
  assert.ok(vermerk < worker.indexOf("status: 'daily_limit'"), 'und zwar vor dem Tageslimit-Abbruch');
  assert.ok(vermerk < worker.indexOf("status: 'hourly_quota_reached'"), 'und vor dem Stundenabbruch');
  assert.match(ticker, /editorialReserve\(\{ configured: configuredStoriesPerHour, waiting: editorialWaiting/, 'die Nachrichtenspur rechnet die Reserve');
  assert.match(ticker, /reserve: editorialSlotReserve \}\)/, 'und zieht sie ab');
  assert.match(ticker, /report\.editorial_waiting = editorialWaiting;/, 'der Laufbericht zeigt beides');
  assert.match(ticker, /report\.editorial_slot_reserve = editorialSlotReserve;/);
});
