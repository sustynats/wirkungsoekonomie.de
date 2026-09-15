import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { claimApprovedEditorials, finalizeApprovedEditorials } from '../../scripts/news/import-approved-editorials.mjs';

const fakeSession = (editions, calls) => ({ store: {
  acquire: async (...args) => { calls.push(['acquire', args[1]]); },
  release: async (ok) => { calls.push(['release', ok]); },
  editorialClaim: async () => { calls.push(['claim']); return editions; },
  editorialFailure: async (hash, code) => { calls.push(['failure', code]); },
  editorialFinalize: async () => { calls.push(['finalize']); },
} });

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
  assert.deepEqual(result, { status: 'ok', changed: false, failed: [] });
  assert.deepEqual(calls, [['acquire', 'import'], ['claim'], ['release', true]]);
  assert.equal(fs.existsSync(path.join(root, 'data/news/personal-editorials.json')), false);
  await finalizeApprovedEditorials({ session: fakeSession([], calls) });
  assert.deepEqual(calls.at(-1), ['finalize']);
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
