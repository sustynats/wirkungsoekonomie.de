import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import { BridgeStore } from '../../scripts/news/bridge/store.mjs';
import { bridgeSession } from '../../scripts/news/bridge/remote.mjs';
import { DropboxChatGPTBridgeProvider } from '../../scripts/news/bridge/provider.mjs';
import { createBridgeServer } from '../../scripts/news/bridge/server-handler.mjs';
import { IMPACT_VERSION } from '../../scripts/news/impact-assessment.mjs';
import { POTENTIAL_REVISION } from '../../scripts/news/impact-potential.mjs';

const now = '2026-09-14T19:00:00Z', ago = minutes => new Date(Date.parse(now) - minutes * 60000).toISOString();
const id = i => `wt_20260914T120000Z_${String(i).padStart(24, '0')}`;
const secret = 'private-test-token-'.repeat(3);
const env = { WOEK_NEWS_BRIDGE_URL: 'https://130.162.217.58.sslip.io/api/news-bridge', WOEK_NEWS_BRIDGE_TOKEN: secret, GITHUB_RUN_ID: '123' };
function fixture(t, count = 319) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'woek-monitor-rpc-'));
  const store = new BridgeStore(path.join(directory, 'queue.sqlite'), { lane: 'import' });
  t.after(() => { store.close(); fs.rmSync(directory, { recursive: true, force: true }); });
  const files = new Map(['00_INBOX', '10_CLAIMED', '20_OUTPUT_READY', '90_ERRORS', '95_LOGS'].map(name => [name, []]));
  const writes = [];
  const transport = { list: async name => files.get(name) || [], writeAtomic: async (file, value) => writes.push({ file, value: structuredClone(value) }) };
  for (let i = 0; i < count; i++) {
    const job = { input: { job_id: id(i), job_type: 'new_story', created_at: ago(240) }, created_at: ago(240), status: 'queued', candidate: { text: 'PRIVATE_ARTICLE_MUST_NOT_LEAVE_SERVER' } };
    if (i % 13 === 0) job.publication_gate = { status: 'needs_second_pass', review_job_id: id(i + 1) };
    if (i % 13 === 1) job.input = { ...job.input, job_type: 'impact_semantic_review', impact_version: IMPACT_VERSION, semantics_revision: POTENTIAL_REVISION };
    if (i % 17 === 0) { job.status = 'correction_pending'; job.corrections = [{ original: 'private' }]; }
    if (i % 19 === 0) job.publication_gate = { status: 'needs_review' };
    if (i % 23 === 0) job.ack = { status: 'imported' };
    if (i % 29 === 0) job.input = { job_id: id(i), job_type: 'correction', original_input: { job_type: 'story_update', original_input: { job_type: 'impact_reassessment' } } };
    if (i % 31 === 0) job.accepted = { record: { title: 'private accepted record' } };
    if (i % 37 === 0) job.last_error = { stage: 'import', private_detail: 'unpublished' };
    if (i % 41 === 0) job.input = { ...job.input, discovery: { trigger_type: 'backfill' } };
    if (i % 43 === 0) job.semantic_review = { assessment: { version: '2.0', semantics_revision: 'old' } };
    if (i % 47 === 0) job.status = 'quarantined';
    store.db.prepare('INSERT INTO jobs VALUES (?, ?)').run(id(i), JSON.stringify(job));
    files.get('00_INBOX').push({ name: `${id(i)}.input.json` });
    files.get('10_CLAIMED').push({ name: `${id(i)}.${job.corrections ? 'repair-1' : 'input'}.json` });
    store.observe(`claim:${id(i)}`, { at: ago(180), name: `${id(i)}.input.json` });
    if (i < 150) { files.get('20_OUTPUT_READY').push({ name: `${id(i)}.output.json` }); store.observe(`output:${id(i)}`, { at: ago(60), generation: 0 }); }
  }
  files.get('20_OUTPUT_READY').push({ name: 'unknown.output.json' }, { name: `${id(900)}.output.json` });
  store.observe('discovery', { at: ago(10) });
  store.acquire(now, 'import'); store.observe('remote-owner:import', { owner: '123:1', at: now });
  const observations = () => store.db.prepare('SELECT * FROM observations ORDER BY key').all();
  const jobs = () => store.db.prepare('SELECT * FROM jobs ORDER BY id').all();
  return { store, transport, files, writes, observations, jobs };
}
async function serve(t, f) {
  const server = createBridgeServer({ stores: { import: f.store }, transport: f.transport, secret,
    fetchImpl: async () => { throw Error('EXTERNAL_NETWORK_FORBIDDEN'); } });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => { server.closeAllConnections(); server.close(); });
  return `http://127.0.0.1:${server.address().port}/api/news-bridge`;
}

test('one authenticated RPC preserves full monitoring results, histories and logs for a large mixed queue', async t => {
  const legacy = fixture(t), batched = fixture(t), before = batched.jobs();
  const legacyEndpoint = await serve(t, legacy); let legacyCalls = 0;
  const legacyRemote = bridgeSession(env, { fetchImpl: async (_url, options) => {
    legacyCalls++; return fetch(legacyEndpoint, options);
  } });
  const expected = await new DropboxChatGPTBridgeProvider(legacyRemote).monitor(now);
  const endpoint = await serve(t, batched); let calls = 0, responseText = '';
  const remote = bridgeSession(env, { fetchImpl: async (_url, options) => {
    calls++; assert.equal(JSON.parse(options.body).op, 'bridge.monitorRun');
    const response = await fetch(endpoint, options); responseText = await response.clone().text(); return response;
  } });
  batched.store.all = () => { throw Error('FULL_QUEUE_FORBIDDEN_ON_SERVER'); };
  const actual = await new DropboxChatGPTBridgeProvider({ store: remote.store, transport: remote.transport, remoteMonitor: remote.monitorRun }).monitor(now);
  assert.deepEqual(actual, expected); assert.equal(calls, 1);
  assert.ok(legacyCalls > 400, `legacy RPC count ${legacyCalls}`);
  t.diagnostic(`monitor RPCs: ${legacyCalls} legacy, ${calls} server-side`);
  assert.deepEqual(batched.observations(), legacy.observations());
  assert.deepEqual(batched.writes, legacy.writes);
  assert.deepEqual(batched.jobs(), before, 'no claims, gates, ACKs, jobs or paid outputs changed');
  assert.doesNotMatch(responseText, /PRIVATE_ARTICLE|private accepted|private_detail|original_input/);
  assert.ok(actual.alerts.some(value => value.startsWith('STALE_CLAIM:')));
  assert.ok(actual.alerts.some(value => value.startsWith('OUTPUT_OVERDUE:')));
  assert.ok(actual.review_pending > 0); assert.ok(actual.processor_health.current_news_stages.awaiting_import > 0);
});

test('monitor RPC enforces authentication, lane, owner, reacquisition, arguments and active-operation serialization', async t => {
  const f = fixture(t, 2), endpoint = await serve(t, f);
  const invoke = async ({ token = secret, owner = '123:1', lane = 'import', args = [now, { maxPending: 48 }] } = {}) => {
    const response = await fetch(endpoint, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'X-Bridge-Owner': owner, 'X-Bridge-Lane': lane }, body: JSON.stringify({ op: 'bridge.monitorRun', args }) });
    return { status: response.status, ...await response.json() };
  };
  const before = f.observations();
  for (const [options, error] of [[{ token: 'wrong' }, 'BRIDGE_UNAUTHORIZED'], [{ lane: 'intake' }, 'BRIDGE_LANE_INVALID'], [{ owner: '' }, 'BRIDGE_OWNER_INVALID'], [{ owner: '999:1' }, 'BRIDGE_OWNER_MISMATCH'], [{ args: [now, { maxPending: 48, store: {} }] }, 'BRIDGE_MONITOR_ARGUMENTS_INVALID']]) {
    assert.equal((await invoke(options)).error, error);
  }
  assert.deepEqual(f.observations(), before); assert.equal(f.writes.length, 0);
  f.store.release(false);
  assert.equal((await invoke()).error, 'BRIDGE_REACQUIRE_REQUIRED');
  f.store.acquire(now, 'import');
  let unblock, reached; const entered = new Promise(resolve => { reached = resolve; });
  const original = f.transport.list;
  f.transport.list = async name => { if (name === '00_INBOX') { reached(); await new Promise(resolve => { unblock = resolve; }); } return original(name); };
  const first = invoke(); await entered;
  assert.equal((await invoke()).error, 'BRIDGE_OPERATION_BUSY');
  unblock(); assert.equal((await first).ok, true);
});

test('old-server fallback is explicit; failed or uncertain monitor writes are never repeated', async () => {
  let fallback = 0, rpc = 0;
  const provider = new DropboxChatGPTBridgeProvider({ store: {}, transport: { list: async () => { fallback++; throw Error('LEGACY_PATH'); } },
    remoteMonitor: async () => { throw Error('BRIDGE_OPERATION_INVALID'); } });
  await assert.rejects(() => provider.monitor(now), /LEGACY_PATH/); assert.equal(fallback, 1);
  for (const error of ['BRIDGE_UNAUTHORIZED', 'BRIDGE_OWNER_MISMATCH', 'BRIDGE_OPERATION_BUSY', 'BRIDGE_REMOTE_TIMEOUT']) {
    provider.remoteMonitor = async () => { throw Error(error); };
    await assert.rejects(() => provider.monitor(now), new RegExp(error));
  }
  assert.equal(fallback, 1);
  const remote = bridgeSession(env, { fetchImpl: async () => { rpc++; return new Response('{', { status: 502 }); } });
  provider.remoteMonitor = remote.monitorRun;
  await assert.rejects(() => provider.monitor(now), /BRIDGE_REMOTE_INVALID_RESPONSE/);
  assert.equal(rpc, 1); assert.equal(fallback, 1);
});

test('batching retains individual job-ID validation for an invalid stored review pointer', async t => {
  const f = fixture(t, 2), endpoint = await serve(t, f);
  const job = f.store.get(id(1));
  job.publication_gate = { status: 'needs_second_pass', review_job_id: 'invalid' };
  f.store.put(job);
  const remote = bridgeSession(env, { fetchImpl: (_url, options) => fetch(endpoint, options) });
  for (const remoteMonitor of [undefined, remote.monitorRun]) {
    const provider = new DropboxChatGPTBridgeProvider({ ...remote, remoteMonitor });
    await assert.rejects(() => provider.monitor(now), /BRIDGE_JOB_ID_INVALID/);
  }
});
