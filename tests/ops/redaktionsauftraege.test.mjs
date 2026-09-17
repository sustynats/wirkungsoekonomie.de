import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { redaktionsauftraege, auftragsBefund } from '../../scripts/ops/redaktionsauftraege.mjs';

const now = '2026-09-17T18:00:00.000Z';
const auftrag = (id, at, felder = {}) => ({ input: { job_id: id, job_type: 'editorial_request', request: { kind: 'opinion_analysis', brief: 'GEHEIMER AUFTRAGSTEXT' } },
  created_at: at, status: 'queued', intake: { owner: '1206956406805102593' }, ...felder });

const session = (rows, calls) => ({
  monitor: async () => { calls.push('monitor'); return { open_count: 3, open_personal_count: 1, oldest_open_minutes: 4321 }; },
  store: {
    acquire: async (...args) => { calls.push(`acquire:${args[1]}`); },
    release: async (ok) => { calls.push(`release:${ok}`); },
    all: async () => { calls.push('all'); return rows; },
    put: async () => { throw new Error('DIESER BEFUND DARF NICHTS SCHREIBEN'); },
    observe: async () => { throw new Error('DIESER BEFUND DARF NICHTS SCHREIBEN'); },
    editorialClaim: async () => { throw new Error('DIESER BEFUND DARF NICHTS FREIGEBEN'); },
  },
});

test('der Befund liest die Warteschlange und schreibt nichts', async () => {
  const calls = [];
  const ergebnis = await redaktionsauftraege({ session: session([auftrag('woek-a', '2026-09-14T09:00:00.000Z'), auftrag('woek-b', '2026-09-17T09:00:00.000Z', { status: 'acknowledged', accepted: true, completed_at: '2026-09-17T10:00:00.000Z' }),
    { input: { job_id: 'story-1', job_type: 'news_story' }, created_at: now }], calls), now });
  assert.deepEqual(calls, ['monitor', 'acquire:import', 'all', 'release:true']);
  assert.equal(ergebnis.offene_auftraege, 1);
  assert.equal(ergebnis.auftraege.length, 2, 'nur Redaktionsauftraege, keine Nachrichtenakte');
  assert.deepEqual(ergebnis.auftraege.map((a) => a.job_id), ['woek-b', 'woek-a'], 'neueste zuerst');
  assert.equal(ergebnis.auftraege[1].stunden_alt, 81, 'das Alter macht einen liegengebliebenen Auftrag sichtbar');
});

// Die Laufprotokolle sind oeffentlich, Natalies Auftraege nicht.
test('kein Auftragstext verlaesst die private Warteschlange', async () => {
  const ergebnis = await redaktionsauftraege({ session: session([auftrag('woek-a', '2026-09-14T09:00:00.000Z')], []), now });
  assert.equal(JSON.stringify(ergebnis).includes('GEHEIMER AUFTRAGSTEXT'), false);
  assert.deepEqual(Object.keys(auftragsBefund(auftrag('woek-a', now), now)).sort(),
    ['abgeschlossen', 'angenommen', 'art', 'erstellt', 'fehler', 'job_id', 'nachbesserungen', 'quittung', 'stunden_alt', 'zustand']);
});

test('eine belegte Importspur macht den Befund nicht wertlos', async () => {
  const calls = [];
  const belegt = { monitor: async () => ({ open_count: 3, open_personal_count: 2, oldest_open_minutes: 10 }),
    store: { acquire: async () => { throw new Error('BRIDGE_RUN_LOCKED'); }, release: async () => calls.push('release') } };
  const ergebnis = await redaktionsauftraege({ session: belegt, now });
  assert.equal(ergebnis.warteschlange_unlesbar, 'BRIDGE_RUN_LOCKED');
  assert.equal(ergebnis.offene_auftraege, 2, 'die Zahl offener Auftraege kommt ohne Spur');
  assert.deepEqual(calls, [], 'eine nicht erhaltene Spur wird nicht freigegeben');
});

test('der Befund-Lauf hat seinen vollstaendigen Abhaengigkeitsbaum im sparse checkout', () => {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const workflow = fs.readFileSync(path.join(root, '.github/workflows/ops-redaktionsauftraege.yml'), 'utf8');
  const checkout = workflow.split('sparse-checkout: |')[1].split('sparse-checkout-cone-mode:')[0].trim().split('\n').map((line) => line.trim());
  const visited = new Set();
  const visit = (file) => {
    if (visited.has(file)) return;
    visited.add(file);
    assert.ok(checkout.includes(file), `Der Befund-Checkout vermisst ${file}`);
    for (const match of fs.readFileSync(path.join(root, file), 'utf8').matchAll(/(?:from\s*|import\s*\(\s*|import\s*)['"](\.[^'"]+\.mjs)['"]/g)) {
      visit(path.posix.normalize(path.posix.join(path.posix.dirname(file), match[1])));
    }
  };
  visit('scripts/ops/redaktionsauftraege.mjs');
});
