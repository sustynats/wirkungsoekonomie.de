import test from 'node:test';
import assert from 'node:assert/strict';
import { acquireLane } from '../../scripts/news/bridge/acquire-lane.mjs';

test('a short preview lock permits the same import after its normal release', async () => {
  let calls = 0, lockHeld = true;
  const delays = [];
  const retries = await acquireLane(async () => {
    calls++;
    if (lockHeld) throw Error('BRIDGE_RUN_LOCKED');
  }, { wait: async ms => { delays.push(ms); lockHeld = false; } });
  assert.equal(retries, 1);
  assert.equal(calls, 2);
  assert.deepEqual(delays, [5000]);
});

test('an active writer remains protected after at most fifteen seconds', async () => {
  let calls = 0; const delays = [];
  await assert.rejects(acquireLane(async () => { calls++; throw Error('BRIDGE_RUN_LOCKED'); },
    { wait: async ms => delays.push(ms) }), /BRIDGE_RUN_LOCKED/);
  assert.equal(calls, 4);
  assert.equal(delays.reduce((sum, value) => sum + value, 0), 15000);
});

test('uncertain writes, authentication errors and completed slots are never replayed', async () => {
  for (const code of ['BRIDGE_REMOTE_TIMEOUT', 'BRIDGE_UNAUTHORIZED', 'BRIDGE_SLOT_ALREADY_COMPLETED', 'BRIDGE_OPERATION_FAILED']) {
    let calls = 0;
    await assert.rejects(acquireLane(async () => { calls++; throw Error(code); },
      { wait: async () => assert.fail('unexpected retry') }), new RegExp(code));
    assert.equal(calls, 1);
  }
});
