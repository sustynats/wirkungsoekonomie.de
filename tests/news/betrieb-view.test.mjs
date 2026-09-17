import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { betriebsAnzeige } from '../../admin/redaktion/betrieb-view.js';
import { operationalStatus } from '../../scripts/ops/betriebsstatus.mjs';

const at = '2026-09-16T19:30:00.000Z';
const now = '2026-09-16T19:40:00.000Z';
const status = (overrides = {}) => operationalStatus({
  checks: [{ id: 'sources', name: 'Quellenabruf', ok: true }, { id: 'publication', name: 'Veröffentlichung', ok: true }],
  summary: { usdMonth: 56.2, usdToday: 1.83 },
  report: { monthly_budget_usd: 75.63, ai_hourly_limit_configured: 3, ai_stories_in_last_hour: 1,
    editorial_drafts_in_last_hour: 1, shared_hourly_room: 1, published_stories: 1, ai_repair_calls: 0,
    ai_budget_pacing: { remaining_usd: 19.43, paused: false } },
  delivery: { verified: true, visible_news: 294, last_new_at: '2026-09-16T18:20:00.000Z' },
  at, ...overrides });

// Natalie am 16.09.: „Ich dachte, du hast ein permanentes Monitoring aufgesetzt
// bei jedem Schritt." Die Ansicht muss die Frage „läuft es?" beim Hinsehen
// beantworten - in Sätzen, nicht in Codes.
test('alles gruen sagt genau das', () => {
  const view = betriebsAnzeige(status(), { now });
  assert.equal(view.tone, 'ok');
  assert.equal(view.headline, 'Alles läuft');
  assert.ok(view.lines[0].includes('2 von 2 Prüfungen in Ordnung'));
  assert.ok(view.lines.some((line) => /Selbstheilung musste nichts nachstarten/.test(line)));
  const durchsatz = view.groups.find((group) => group.title === 'Durchsatz');
  assert.deepEqual(durchsatz.items[0], ['Kontingent je Stunde', '3']);
  assert.deepEqual(durchsatz.items[2], ['davon Nachbesprechungen und Analysen', '1']);
  assert.deepEqual(view.groups.find((group) => group.title === 'Budget').items.at(-1), ['Bremse', 'nicht aktiv']);
});

test('ein redaktioneller Hinweis ist kein Ausfall, eine rote Pruefung schon', () => {
  const hint = betriebsAnzeige(status({ checks: [{ id: 'sources', name: 'Quellenabruf', ok: true },
    { id: 'editorial-coverage', name: 'Redaktionelle Themenabdeckung', ok: false, kind: 'editorial', reason: 'Zwei überfällige Themen.' }] }), { now });
  assert.equal(hint.tone, 'hinweis');
  assert.equal(hint.headline, 'Läuft, mit redaktionellem Hinweis');
  assert.ok(hint.lines.some((line) => line.startsWith('Hinweis: Redaktionelle Themenabdeckung.')));

  const broken = betriebsAnzeige(status({ checks: [{ id: 'publication', name: 'Veröffentlichung', ok: false, reason: 'Live-Feed nicht lesbar.' }] }), { now });
  assert.equal(broken.tone, 'alarm');
  assert.equal(broken.headline, '1 Prüfung rot');
  assert.ok(broken.lines.some((line) => line.startsWith('Rot: Veröffentlichung.')));
});

test('ein stehengebliebener Befund verraet sich selbst', () => {
  const stale = betriebsAnzeige(status(), { now: '2026-09-16T21:00:00.000Z' });
  assert.equal(stale.tone, 'stale');
  assert.equal(stale.headline, 'Befund ist 90 Minuten alt');
  assert.ok(stale.lines.some((line) => /hängt der Monitorlauf selbst/.test(line)));
  const missing = betriebsAnzeige(null);
  assert.equal(missing.tone, 'unknown');
  assert.equal(missing.headline, 'Noch kein Befund');
  assert.deepEqual(missing.groups, []);
  assert.equal(betriebsAnzeige({ checked_at: 'unlesbar' }).tone, 'unknown');
});

test('die Selbstheilung wird genannt, wenn sie etwas versucht hat', () => {
  const view = betriebsAnzeige(status({ recovery: [{ workflow: 'wirkungsticker.yml', status: 'dispatched', at }] }), { now });
  assert.ok(view.lines.some((line) => line === 'Selbstheilung: wirkungsticker.yml (dispatched).'));
});

// Die Ansicht entscheidet nichts: kein Knopf, kein Schreibzugriff.
test('die Ansicht ist reine Auskunft', () => {
  const source = fs.readFileSync(new URL('../../admin/redaktion/betrieb-view.js', import.meta.url), 'utf8');
  for (const forbidden of ['fetch(', 'localStorage', 'addEventListener', 'innerHTML']) {
    assert.ok(!source.includes(forbidden), `${forbidden} gehoert nicht in die Darstellung`);
  }
  const app = fs.readFileSync(new URL('../../admin/redaktion/redaktion.js', import.meta.url), 'utf8');
  assert.match(app, /const data=await api\('\/status'\)/, 'die App holt den Befund über ihr angemeldetes Konto');
  assert.ok(!app.includes("api('/status',{method"), 'nur lesend');
});

// Natalie am 16.09.: „nicht solche Daten in die öffentliche App." Der Befund
// lebt ausschliesslich in der Ablage und in der angemeldeten Redaktions-App.
test('die Betriebsdaten erreichen die oeffentliche App nicht', () => {
  const publicFiles = ['assets/js/news-pwa.js', 'assets/js/main.js', 'scripts/news/app-pages.mjs', 'scripts/news/build.mjs', 'wirkungsticker/sw.js'];
  for (const file of publicFiles) {
    const source = fs.readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8');
    for (const marker of ['ops-status', 'betrieb-view', 'betriebsAnzeige', 'news-editorial/status']) {
      assert.ok(!source.includes(marker), `${file} darf ${marker} nicht kennen`);
    }
  }
  // Und kein Befund liegt als Datei im Repository, die der Build ausliefern koennte.
  for (const file of ['data/news/ops-status.json', 'reports/ops-status.json']) {
    assert.equal(fs.existsSync(new URL(`../../${file}`, import.meta.url)), false, `${file} darf es nicht geben`);
  }
  // Die Redaktions-App liefert die neue Datei aus, sonst bleibt der Reiter leer.
  const worker = fs.readFileSync(new URL('../../admin/redaktion/sw.js', import.meta.url), 'utf8');
  assert.match(worker, /'\.\/betrieb-view\.js'/);
  assert.match(worker, /woek-redaktion-shell-v\d+/, 'die Schale traegt eine Version');
  // Jede neue Datei der App braucht eine neue Schale, sonst liefert der
  // Service Worker die alte Fassung weiter aus.
  const version = Number(worker.match(/woek-redaktion-shell-v(\d+)/)[1]);
  assert.ok(version >= 8, `die Schale wurde mit jeder neuen Datei angehoben (jetzt v${version})`);
  assert.match(worker, /'\.\/parked-review\.js'/, 'die Erklaerung geparkter Fassungen wird ausgeliefert');
});
