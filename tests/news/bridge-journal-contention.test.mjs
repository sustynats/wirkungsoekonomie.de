import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { BridgeStore } from '../../scripts/news/bridge/store.mjs';

async function writer(t, file, delay) {
  // A separate process releases its real SQLite transaction even while the
  // synchronous main-thread writer is waiting. No mocked busy/error behavior.
  const child = spawn(process.execPath, ['--input-type=module', '-e', `
    import { DatabaseSync } from 'node:sqlite';
    const db = new DatabaseSync(process.argv[1]);
    db.exec('BEGIN IMMEDIATE');
    db.prepare('INSERT INTO observations VALUES (?, ?)').run('other-writer', '{"preserved":true}');
    process.stdout.write('locked');
    setTimeout(() => { db.exec('COMMIT'); db.close(); }, Number(process.argv[2]));
  `, file, String(delay)], { stdio: ['ignore', 'pipe', 'pipe'] });
  t.after(() => { if (child.exitCode === null) child.kill(); });
  const exited = once(child, 'exit');
  await Promise.race([once(child.stdout, 'data'), exited.then(() => { throw Error('writer exited before lock'); })]);
  return exited;
}

test('brief concurrent journal writes preserve both records without losing the API result', async t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'woek-journal-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const store = new BridgeStore(path.join(dir, 'queue.sqlite'), { lane: 'intake' });
  t.after(() => store.close());
  assert.equal(store.db.prepare('PRAGMA busy_timeout').get().timeout, 5000);
  const finished = await writer(t, path.join(dir, 'queue.sqlite'), 200);
  store.observe('api-processor-health', { delivered: 1 });
  assert.deepEqual(store.observation('other-writer'), { preserved: true });
  assert.deepEqual(store.observation('api-processor-health'), { delivered: 1 });
  assert.equal((await finished)[0], 0);
});

test('journal contention stays bounded and does not weaken exclusive lane ownership', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'woek-journal-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'queue.sqlite');
  const owner = new BridgeStore(file, { lane: 'import' });
  const next = new BridgeStore(file, { lane: 'import' });
  t.after(() => { next.close(); owner.close(); });
  assert.equal(next.lock.prepare('PRAGMA busy_timeout').get().timeout, 0);
  owner.acquire('2026-09-13T12:00:00Z', 'import');
  assert.throws(() => next.acquire('2026-09-13T12:05:00Z', 'import'), /BRIDGE_RUN_LOCKED/);
  owner.db.exec('BEGIN IMMEDIATE');
  next.db.exec('PRAGMA busy_timeout=20');
  try {
    assert.throws(() => next.observe('blocked-write', {}), /database is locked/);
  } finally { owner.db.exec('ROLLBACK'); }
  assert.equal(next.observation('blocked-write'), null);
  owner.release(false);
  next.acquire('2026-09-13T12:05:00Z', 'import');
});
