import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { updateProbeContract, writeProcessorTransport, PREVIOUS_TRANSPORT } from '../../scripts/news/bridge/write-processor-transport.mjs';

const previous = {
  schema_version: '4.0', output_transport: { type: 'github_issue_encrypted', bridge_version: 2 },
  fresh_preflight: Array.from({ length: 10 }, (_, n) => `existing requirement ${n}`),
  editorial_rules: ['Final exact-version Natalie approval required'],
  queue_rules: ['Only own shard, fresh ACK/claim/output checks'],
  context_modes: { manual: 'Five fresh reads plus actual encrypted GitHub delivery receipt and own readback.', automation: 'Actual occurrence and encrypted server-verified report required' },
  processor_preflight_report: { immutable: true }, cloud_workers: [{ shard: 0 }, { shard: 1 }, { shard: 2 }],
  encoder_python: 'original encoder', public_key_pem: 'original public key', deployed_commit: 'historical',
};
const original = JSON.stringify(previous);
const fixtureHash = createHash('sha256').update(original).digest('hex');

test('inert probe exception preserves encrypted output, approval, shard and scheduler proof requirements', () => {
  const next = updateProbeContract(original, fixtureHash);
  assert.equal(next.probe_transport.bridge_version, 1);
  assert.deepEqual(next.probe_transport.payload, { probe_id: '<job_id>', test_only: true });
  assert.equal(next.probe_transport.additional_payload_fields, false);
  for (const key of ['output_transport', 'editorial_rules', 'queue_rules', 'cloud_workers', 'processor_preflight_report', 'encoder_python', 'public_key_pem']) assert.deepEqual(next[key], previous[key]);
  for (const n of [0, 1, 4, 6, 7, 8, 9]) assert.equal(next.fresh_preflight[n], previous.fresh_preflight[n]);
  assert.equal(next.context_modes.automation, previous.context_modes.automation);
  assert.match(next.context_modes.manual, /v1 inert probe or v2 encrypted probe/);
  assert.equal(next.supersedes, PREVIOUS_TRANSPORT);
  assert.equal(next.deployed_commit, undefined);
  assert.deepEqual(JSON.parse(original), previous);
});

test('unknown or edited predecessor cannot write any new contract', async () => {
  let writes = 0;
  await assert.rejects(writeProcessorTransport({ read: async () => original, writeAtomic: async () => { writes++; } }), /PREDECESSOR_CHANGED/);
  assert.equal(writes, 0);
  assert.throws(() => updateProbeContract(original + '\n', fixtureHash), /PREDECESSOR_CHANGED/);
});

test('failed predecessor read propagates without creating a misleading config or health PASS', async () => {
  let writes = 0;
  await assert.rejects(writeProcessorTransport({ read: async () => { throw Error('AUTH_FAILED'); }, writeAtomic: async () => { writes++; } }), /AUTH_FAILED/);
  assert.equal(writes, 0);
});
