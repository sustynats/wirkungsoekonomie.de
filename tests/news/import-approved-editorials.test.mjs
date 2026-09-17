import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { claimApprovedEditorials, finalizeApprovedEditorials } from '../../scripts/news/import-approved-editorials.mjs';

// Der Bridge-Server verlangt fuer JEDE store-Operation eine gehaltene Spur
// desselben Besitzers und antwortet sonst mit BRIDGE_OWNER_MISMATCH. Die
// Attrappe erzwingt das jetzt: der alte Test kannte diese Regel nicht und hat
// deshalb eine Quittung durchgelassen, die live nie funktionieren konnte
// (17.09.2026, Natalies vier Freigaben).
const fakeSession = (editions, calls, { vermerk = null } = {}) => {
  let lane = null;
  return { store: {
    acquire: async (...args) => { calls.push(['acquire', args[1]]); lane = args[1]; },
    release: async (ok) => { calls.push(['release', ok]); lane = null; },
    editorialClaim: async () => { if (lane !== 'import') throw new Error('BRIDGE_OWNER_MISMATCH'); calls.push(['claim']); return editions; },
    editorialFailure: async (hash, code) => { calls.push(['failure', code]); },
    editorialFinalize: async () => { if (lane !== 'import') throw new Error('BRIDGE_OWNER_MISMATCH'); calls.push(['finalize']); return { published: 2 }; },
    observation: async () => vermerk,
    observe: async (key, value) => { calls.push(['observe', key, value]); },
  } };
};

test('missing Oracle configuration or a held import lane skips without touching files', async () => {
  const calls = [];
  assert.deepEqual(await claimApprovedEditorials({ env: {} }), { status: 'skipped', reason: 'BRIDGE_REMOTE_CONFIG_REQUIRED', changed: false });
  const locked = { store: { acquire: async () => { throw new Error('BRIDGE_RUN_LOCKED'); }, release: async () => calls.push('release') } };
  assert.equal((await claimApprovedEditorials({ session: locked })).status, 'skipped');
  assert.deepEqual(calls, []);
  assert.equal((await finalizeApprovedEditorials({ env: {} })).status, 'skipped');
});

test('the import lane is acquired, editions are claimed, and the lane is released even when nothing is approved', async () => {
  const calls = [];
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'woek-approved-'));
  const result = await claimApprovedEditorials({ session: fakeSession([], calls), root, now: '2026-09-15T12:00:00.000Z', env: { GITHUB_RUN_ID: '42', GITHUB_RUN_ATTEMPT: '1' } });
  assert.deepEqual(result, { status: 'ok', changed: false, failed: [], awaiting_receipt: 0 });
  assert.deepEqual(calls, [['acquire', 'import'], ['claim'], ['release', true]]);
  assert.equal(fs.existsSync(path.join(root, 'data/news/personal-editorials.json')), false);
});

test('die Quittung haelt die Importspur selbst und nimmt einen eigenen Lauf-Platz', async () => {
  const calls = [];
  const result = await finalizeApprovedEditorials({ session: fakeSession([], calls), now: '2026-09-17T18:00:00.000Z', env: { GITHUB_RUN_ID: '42', GITHUB_RUN_ATTEMPT: '1' } });
  assert.deepEqual(result, { status: 'ok', published: 2 });
  assert.deepEqual(calls, [['acquire', 'import'], ['finalize'], ['release', true]]);
});

test('eine schon uebernommene Fassung zaehlt als unquittiert und wird vermerkt', async () => {
  const calls = [];
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'woek-approved-'));
  const edition = JSON.parse(fs.readFileSync(new URL('./fixtures/approved-personal-edition.json', import.meta.url), 'utf8'));
  fs.mkdirSync(path.join(root, 'data/news'), { recursive: true });
  fs.writeFileSync(path.join(root, 'data/news/personal-editorials.json'), JSON.stringify({ schema_version: '1.0', editions: [edition] }));
  const result = await claimApprovedEditorials({ session: fakeSession([edition], calls, { vermerk: { awaiting: 1, awaiting_since: '2026-09-17T06:00:00.000Z' } }), root,
    now: '2026-09-17T18:00:00.000Z', env: { GITHUB_RUN_ID: '42', GITHUB_RUN_ATTEMPT: '1' } });
  assert.deepEqual({ changed: result.changed, awaiting: result.awaiting_receipt }, { changed: false, awaiting: 1 });
  const [, , vermerk] = calls.find(([kind]) => kind === 'observe');
  // Der Beginn bleibt der alte: nur so wird aus "wartet" irgendwann "haengt".
  assert.equal(vermerk.awaiting_since, '2026-09-17T06:00:00.000Z');
  assert.equal(vermerk.awaiting, 1);
});

test('an invalid approved edition is reported back to Oracle and never written', async () => {
  const calls = [];
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'woek-approved-'));
  const result = await claimApprovedEditorials({ session: fakeSession([{ format: 'approved_editorial', content_hash: 'x', analysis_id: 'broken' }], calls), root });
  assert.equal(result.status, 'ok'); assert.equal(result.changed, false);
  assert.equal(result.failed.length, 1);
  assert.ok(calls.some(([kind]) => kind === 'failure'));
  assert.deepEqual(calls.at(-1), ['release', true]);
});
