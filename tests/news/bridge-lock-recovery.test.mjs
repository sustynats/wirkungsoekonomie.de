import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { BridgeStore } from '../../scripts/news/bridge/store.mjs';

function pair(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'woek-lock-recovery-'));
  const file = path.join(dir, 'queue.sqlite');
  const first = new BridgeStore(file, { lane: 'import' });
  const next = new BridgeStore(file, { lane: 'import' });
  t.after(() => { first.close(); next.close(); fs.rmSync(dir, { recursive: true, force: true }); });
  return { first, next };
}
const now = '2026-09-11T09:00:00Z';

test('journal write failure during acquire releases lane for next importer', t => {
  const { first, next } = pair(t);
  // Real SQLite contention from another connection, not a mocked lock error.
  next.db.exec('BEGIN IMMEDIATE');
  assert.throws(() => first.acquire(now, 'import'), /locked/);
  assert.equal(first.locked, false);
  next.db.exec('ROLLBACK');
  assert.doesNotThrow(() => next.acquire(now, 'import'));
  next.release(true);
});

test('journal failure during release cannot retain an abandoned lane', t => {
  const { first, next } = pair(t);
  first.acquire(now, 'import');
  next.db.exec('BEGIN IMMEDIATE');
  assert.throws(() => first.release(true), /locked/);
  assert.equal(first.locked, false);
  next.db.exec('ROLLBACK');
  assert.doesNotThrow(() => next.acquire(now, 'import'));
  next.release(true);
});

test('second acquire on active owner never unlocks its running transaction', t => {
  const { first, next } = pair(t);
  first.acquire(now, 'import');
  assert.throws(() => first.acquire(now, 'import'), /BRIDGE_RUN_LOCKED/);
  assert.equal(first.locked, true);
  assert.throws(() => next.acquire(now, 'import'), /BRIDGE_RUN_LOCKED/);
  first.release(true);
  assert.doesNotThrow(() => next.acquire('2026-09-11T09:05:00Z', 'import'));
  next.release(true);
});

test('completed slot remains protected without stranding subsequent slots', t => {
  const { first, next } = pair(t);
  first.acquire(now, 'import'); first.release(true);
  assert.throws(() => first.acquire(now, 'import'), /BRIDGE_SLOT_ALREADY_COMPLETED/);
  assert.equal(first.locked, false);
  assert.doesNotThrow(() => next.acquire('2026-09-11T09:05:00Z', 'import'));
  next.release(true);
});
