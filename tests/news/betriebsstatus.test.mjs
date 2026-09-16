import test from 'node:test';
import assert from 'node:assert/strict';
import { operationalStatus, statusIsStale, OPS_STATUS_KEY } from '../../scripts/ops/betriebsstatus.mjs';

const at = '2026-09-16T19:30:00.000Z';
const base = {
  checks: [
    { id: 'sources', name: 'Quellenabruf', ok: true },
    { id: 'publication', name: 'Veröffentlichung', ok: true },
    { id: 'editorial-coverage', name: 'Redaktionelle Themenabdeckung', ok: false, kind: 'editorial', reason: 'Zwei Hinweise auf überfällige Themen.' },
  ],
  incidents: { 'editorial-coverage': { firstSeen: '2026-09-16T17:10:00.000Z', active: true } },
  recovery: [{ workflow: 'wirkungsticker.yml', status: 'dispatched', at }],
  summary: { usdMonth: 56.2, usdToday: 1.83 },
  report: { monthly_budget_usd: 75.63, ai_hourly_limit_configured: 3, ai_stories_in_last_hour: 1,
    editorial_drafts_in_last_hour: 1, shared_hourly_room: 1, published_stories: 1, ai_repair_calls: 0,
    ai_budget_pacing: { remaining_usd: 19.43, paused: false } },
  delivery: { verified: true, visible_news: 294, last_new_at: '2026-09-16T18:20:00.000Z' },
  at,
};

// Natalie am 16.09.: „Ich dachte, du hast ein permanentes Monitoring aufgesetzt
// bei jedem Schritt." Es lief - nur unsichtbar. Der Befund muss die Betriebsfrage
// beantworten, ohne dass sie fragen muss.
test('der Befund beantwortet die Betriebsfrage', () => {
  const status = operationalStatus(base);
  assert.equal(status.checked, 3);
  assert.equal(status.healthy, 2);
  assert.deepEqual(status.failing.map((check) => check.id), ['editorial-coverage']);
  assert.equal(status.failing[0].since, '2026-09-16T17:10:00.000Z', 'seit wann steht die Pruefung rot');
  assert.equal(status.failing[0].kind, 'editorial', 'redaktioneller Hinweis, kein technischer Ausfall');
  assert.equal(status.recovery[0].workflow, 'wirkungsticker.yml', 'was die Selbstheilung versucht hat');
  assert.deepEqual(status.budget, { month_usd: 56.2, today_usd: 1.83, limit_usd: 75.63, remaining_usd: 19.43, paused: false });
  assert.deepEqual(status.throughput, { hourly_quota: 3, stories_last_hour: 1, editorial_drafts_last_hour: 1, room_left: 1, published_last_run: 1, repair_calls_last_run: 0 });
  assert.deepEqual(status.delivery, { verified: true, visible_news: 294, last_new_at: '2026-09-16T18:20:00.000Z' });
  // Eine gesunde Pruefung traegt keinen Grund und kein Datum mit sich.
  const healthy = status.checks.find((check) => check.id === 'sources');
  assert.equal('reason' in healthy, false);
  assert.equal('since' in healthy, false);
});

// Der Befund ist eine Betriebsauskunft, kein Archiv: keine Entwuerfe, keine
// Texte, keine Personenkennungen.
test('der Befund traegt keine redaktionellen Inhalte', () => {
  const status = operationalStatus({ ...base,
    checks: [{ id: 'x', name: 'Y', ok: false, reason: 'Grund '.repeat(200), preview: { markdown: 'Natalies Entwurf' }, owner: '1206956406805102593' }] });
  const json = JSON.stringify(status);
  assert.ok(!json.includes('Natalies Entwurf'), 'kein Entwurfstext');
  assert.ok(!json.includes('1206956406805102593'), 'keine Personenkennung');
  assert.ok(status.failing[0].reason.length <= 240, 'der Grund bleibt eine Zeile');
  assert.deepEqual(Object.keys(status.checks[0]).sort(), ['id', 'immediate', 'kind', 'name', 'ok', 'reason', 'since'],
    'nur Kennung, Name, Zustand, Art, Dringlichkeit, Grund und Beginn - kein weiteres Feld reist mit');
});

test('ein stehengebliebener Befund gilt als veraltet', () => {
  const status = operationalStatus(base);
  assert.equal(statusIsStale(status, '2026-09-16T19:40:00.000Z'), false);
  assert.equal(statusIsStale(status, '2026-09-16T20:30:00.000Z'), true, 'nach zwei Pruefzyklen');
  assert.equal(statusIsStale(status, '2026-09-16T20:00:00.000Z', 120), false, 'mit weiterem Fenster nicht');
  assert.equal(statusIsStale({}, at), true, 'ohne Zeitstempel gilt veraltet');
  assert.equal(statusIsStale(null, at), true);
  assert.equal(statusIsStale(status, 'unlesbar'), true);
});

test('leere und unbrauchbare Eingaben ergeben einen leeren, gueltigen Befund', () => {
  const status = operationalStatus({ at });
  assert.equal(status.checked, 0);
  assert.equal(status.healthy, 0);
  assert.deepEqual(status.failing, []);
  assert.deepEqual(status.recovery, []);
  assert.equal(status.budget.month_usd, null);
  assert.equal(status.throughput.hourly_quota, null);
  assert.equal(status.delivery.verified, false);
  assert.equal(operationalStatus({ at, recovery: 'kaputt' }).recovery.length, 0);
  assert.equal(OPS_STATUS_KEY, 'ops-status');
});
