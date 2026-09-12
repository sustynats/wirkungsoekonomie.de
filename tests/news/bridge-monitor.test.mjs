import test from 'node:test';
import assert from 'node:assert/strict';
import { outputStatus, monitorStatus } from '../../scripts/news/bridge/status.mjs';
import { DropboxChatGPTBridgeProvider } from '../../scripts/news/bridge/provider.mjs';

const one = 'wt_20260910T120000Z_000000000000000000000001';
const parent = 'wt_20260910T120000Z_000000000000000000000002';
const child = 'wt_20260910T120000Z_000000000000000000000003';
const now = '2026-09-10T12:00:00Z';
const ago = minutes => new Date(Date.parse(now) - minutes * 60000).toISOString();
function fixture() {
  const jobs = new Map(), observations = new Map(), files = new Map();
  const store = { all: async () => [...jobs.values()], get: async id => jobs.get(id),
    observation: async key => observations.get(key), observe: async (key, value) => observations.set(key, value) };
  const transport = { list: async folder => files.get(folder) || [], writeAtomic: async () => {} };
  const provider = new DropboxChatGPTBridgeProvider({ store, transport });
  return { jobs, observations, files, store, transport, provider };
}
const job = (id, patch = {}) => ({ input: { job_id: id }, created_at: ago(500), status: 'queued', ...patch });

test('old inbox work is pending; only an actual claim older than two hours is stale', async () => {
  const f = fixture(); f.jobs.set(one, job(one));
  assert.equal((await monitorStatus(f.store, now)).oldest_claim_minutes, 0);
  f.files.set('10_CLAIMED', [{ name: `${one}.input.json` }]);
  const fresh = await f.provider.monitor(now);
  assert.equal(fresh.oldest_claim_minutes, 0);
  assert.ok(!fresh.alerts.some(code => /STALE_CLAIM|QUEUE_OVERDUE/.test(code)));
  f.observations.set(`claim:${one}`, { at: ago(120), name: `${one}.input.json` });
  assert.ok(!(await f.provider.monitor(now)).alerts.includes(`STALE_CLAIM:${one}`));
  f.observations.set(`claim:${one}`, { at: ago(121), name: `${one}.input.json` });
  assert.ok((await f.provider.monitor(now)).alerts.includes(`STALE_CLAIM:${one}`));
  assert.equal((await monitorStatus(f.store, now)).oldest_claim_minutes, 121);
});

test('new explicit repair generation starts its own claim observation, never an age-based reset', async () => {
  const f = fixture(); f.jobs.set(one, job(one, { status: 'correction_pending' }));
  f.observations.set(`claim:${one}`, { at: ago(300), name: `${one}.input.json` });
  f.files.set('10_CLAIMED', [{ name: `${one}.repair-1.json` }, { name: `${one}.input.json` }]);
  assert.equal((await f.provider.monitor(now)).oldest_claim_minutes, 0);
  assert.equal(f.observations.get(`claim:${one}`).name, `${one}.repair-1.json`);
  f.observations.set(`claim:${one}`, { at: ago(121), name: `${one}.repair-1.json` });
  assert.ok((await f.provider.monitor(now)).alerts.includes(`STALE_CLAIM:${one}`));
});

test('parent output waits for the separate review; child output wakes the importer immediately', async () => {
  const f = fixture();
  f.jobs.set(parent, job(parent, { publication_gate: { status: 'needs_second_pass', review_job_id: child } }));
  f.jobs.set(child, job(child));
  f.files.set('20_OUTPUT_READY', [{ name: `${parent}.output.json` }]);
  f.observations.set(`output:${parent}`, { at: ago(80) });
  assert.equal((await outputStatus(f.store, f.transport, now)).status, 'PROCESSING_PENDING');
  assert.equal((await monitorStatus(f.store, now)).output_wait_minutes, 0);
  assert.equal((await monitorStatus(f.store, now)).review_pending_count, 1);
  assert.ok(!(await f.provider.monitor(now)).alerts.includes(`OUTPUT_OVERDUE:${parent}`));
  f.files.get('20_OUTPUT_READY').push({ name: `${child}.output.json` });
  assert.deepEqual((await outputStatus(f.store, f.transport, now)).ready, [child]);
  assert.equal(f.observations.get(`output:${parent}`).at, ago(80), 'the original detection timestamp is never fabricated');
  f.jobs.get(child).status = 'acknowledged';
  assert.ok((await outputStatus(f.store, f.transport, now)).ready.includes(parent));
});

test('a complete unreviewed output is late after ten minutes; editorial holds remain distinct', async () => {
  const f = fixture(); f.jobs.set(one, job(one));
  f.files.set('20_OUTPUT_READY', [{ name: `${one}.output.json` }]);
  f.observations.set(`output:${one}`, { at: ago(10) });
  assert.ok((await f.provider.monitor(now)).alerts.includes(`OUTPUT_OVERDUE:${one}`));
  f.jobs.get(one).publication_gate = { status: 'needs_review' };
  const held = await f.provider.monitor(now);
  assert.ok(!held.alerts.includes(`OUTPUT_OVERDUE:${one}`));
  assert.ok(held.alerts.includes('EDITORIAL_REVIEW_REQUIRED'));
  assert.deepEqual((await outputStatus(f.store, f.transport, now)).ready, []);
  assert.equal((await monitorStatus(f.store, now)).review_required_count, 1);
});

test('a missing or only prepared review child does not suppress recovery of its parent', async () => {
  const f = fixture();
  f.jobs.set(parent, job(parent, { publication_gate: { status: 'needs_second_pass', review_job_id: child } }));
  f.files.set('20_OUTPUT_READY', [{ name: `${parent}.output.json` }]);
  assert.deepEqual((await outputStatus(f.store, f.transport, now)).ready, [parent]);
  f.jobs.set(child, job(child, { status: 'prepared_semantic' }));
  assert.deepEqual((await outputStatus(f.store, f.transport, now)).ready, [parent]);
});

test('a repaired output gets a new pickup clock while the previous detection remains in history', async () => {
  const f = fixture();
  f.jobs.set(one, job(one, { status: 'correction_pending', corrections: [{ attempt: 1 }] }));
  f.observations.set(`output:${one}`, { at: ago(180) });
  f.observations.set(`claim:${one}`, { at: ago(121), name: `${one}.repair-1.json` });
  assert.equal((await monitorStatus(f.store, now)).oldest_claim_minutes, 121);
  f.files.set('20_OUTPUT_READY', [{ name: `${one}.output.json` }]);
  await outputStatus(f.store, f.transport, now);
  assert.equal(f.observations.get(`output:${one}`).at, now);
  assert.equal(f.observations.get(`output:${one}:generation-0`).at, ago(180));
  assert.equal((await monitorStatus(f.store, now)).oldest_claim_minutes, 0);
  assert.equal((await monitorStatus(f.store, now)).output_wait_minutes, 0);
});
