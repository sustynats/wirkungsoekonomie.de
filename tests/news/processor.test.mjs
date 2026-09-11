import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { bridgePath, hash } from '../../scripts/news/bridge/contract.mjs';
import { processorShard, processorPreflight, assertProcessorReady, beginProcessorRun, claimProcessorJob,
  finishProcessorJob, selectProcessorBatch, processorHealth, recordProcessorThroughput, protectedCurrentCandidate } from '../../scripts/news/bridge/processor.mjs';

const now = '2026-09-11T09:40:00.000Z';
const context = { actor: 'chatgpt', kind: 'automation', context_id: 'context-test-1', automation_id: 'automation-test-1', shard: 2 };
const id = n => `wt_20260911T080000Z_${n.toString(16).padStart(24, '0')}`;
function transport() {
  const files = new Map([[bridgePath('98_CONFIG', 'contract-2026-09-10-bridge-3.json'), '{}']]);
  return { files, moves: 0, async list(folder) { return [...files.keys()].filter(k => k.includes(`/${folder}/`)).map(k => ({ name: k.split('/').at(-1) })); },
    async read(p) { if (!files.has(p)) throw Error('BRIDGE_DROPBOX_NOT_FOUND'); return files.get(p); },
    async metadata(p) { return files.has(p) ? { name: p.split('/').at(-1) } : null; },
    async writeAtomic(p, value) {
      const raw = JSON.stringify(value);
      if (files.has(p) && files.get(p) !== raw) throw Error('BRIDGE_IMMUTABLE_FILE_CONFLICT');
      files.set(p, raw);
    },
    async move(from, to) {
      if (!files.has(from)) throw Error('BRIDGE_DROPBOX_NOT_FOUND');
      if (files.has(to)) throw Error('BRIDGE_DROPBOX_CONFLICT');
      this.moves++; files.set(to, files.get(from)); files.delete(from);
    } };
}
async function setup() {
  const t = transport(), receipt = await processorPreflight(t, context, now, 'run-test-one');
  const run = await beginProcessorRun(t, receipt, context, 2, now);
  const jobId = Array.from({ length: 100 }, (_, n) => id(n)).find(j => processorShard(j) === 2);
  const item = { job_id: jobId, input_hash: hash('immutable') };
  await t.writeAtomic(bridgePath('00_INBOX', `${jobId}.input.json`), item);
  return { t, receipt, run, item };
}

test('full SHA-256 modulo assigns 300 jobs exactly once, independent of input order', () => {
  const jobs = Array.from({ length: 300 }, (_, n) => ({ job_id: id(n), created_at: now }));
  for (const j of jobs) {
    const bytes = createHash('sha256').update(j.job_id).digest();
    let expected = 0; for (const byte of bytes) expected = (expected * 256 + byte) % 3;
    assert.equal(processorShard(j.job_id), expected);
  }
  const sets = [0, 1, 2].map(s => jobs.filter(j => processorShard(j.job_id) === s));
  assert.equal(new Set(sets.flat().map(j => j.job_id)).size, 300);
  assert.ok(sets.every(s => s.length > 70));
});
test('Codex/server identity cannot attest ChatGPT capability', async () => {
  await assert.rejects(processorPreflight(transport(), { ...context, actor: 'codex' }, now), /CONTEXT_REQUIRED/);
});
test('preflight proves all reads and actual write/readback without touching a job', async () => {
  const t = transport(), r = await processorPreflight(t, context, now, 'probe-complete');
  assert.equal(r.status, 'PASS'); assert.equal(r.shard, 2); assert.equal(t.moves, 0);
  assert.ok([...t.files.keys()].some(k => k.endsWith('.probe.json')));
  assert.ok(![...t.files.keys()].some(k => k.endsWith('.output.json')));
});
for (const folder of ['98_CONFIG', '00_INBOX', '10_CLAIMED', '20_OUTPUT_READY', '30_ACK']) {
  test(`missing ${folder} blocks preflight and every claim`, async () => {
    const t = transport(), list = t.list;
    t.list = async f => { if (f === folder) throw Error('READ_UNAVAILABLE'); return list(f); };
    const r = await processorPreflight(t, context, now, 'probe-fail-read');
    assert.equal(r.status, 'CHATGPT_DROPBOX_UNAVAILABLE'); assert.equal(r.failed_operation, `list:${folder}`);
    assert.throws(() => assertProcessorReady(r, context, now), /UNAVAILABLE/); assert.equal(t.moves, 0);
  });
}
test('a readable bridge with unavailable output write remains unavailable', async () => {
  const t = transport(), write = t.writeAtomic;
  t.writeAtomic = async (p, v) => { if (p.includes('/20_OUTPUT_READY/')) throw Error('BLOCKED_FILE_REFERENCE'); return write(p, v); };
  const r = await processorPreflight(t, context, now, 'probe-fail-write');
  assert.equal(r.dropbox_read_ok, true); assert.equal(r.dropbox_write_ok, false); assert.equal(r.status, 'CHATGPT_DROPBOX_UNAVAILABLE');
});
test('a stale, foreign or manual-only proof cannot start an automation', async () => {
  const t = transport(), r = await processorPreflight(t, context, now, 'probe-context');
  assert.throws(() => assertProcessorReady(r, { ...context, context_id: 'another-context' }, now), /UNAVAILABLE/);
  assert.throws(() => assertProcessorReady(r, context, '2026-09-11T10:11:00Z'), /UNAVAILABLE/);
  const manual = { ...context, kind: 'manual' }, manualReceipt = { ...r, context: manual };
  await assert.rejects(beginProcessorRun(t, manualReceipt, manual, 2, now), /UNAVAILABLE/);
});
test('same shard/hour cannot be started twice', async () => {
  const f = await setup();
  await assert.rejects(beginProcessorRun(f.t, f.receipt, context, 2, now), /HOURLY_SLOT_TAKEN/);
});
for (const folder of ['30_ACK', '20_OUTPUT_READY', '10_CLAIMED']) {
  test(`${folder} present prevents a fresh claim`, async () => {
    const f = await setup(), suffix = { '30_ACK': 'ack', '20_OUTPUT_READY': 'output', '10_CLAIMED': 'input' }[folder];
    await f.t.writeAtomic(bridgePath(folder, `${f.item.job_id}.${suffix}.json`), {});
    assert.equal(await claimProcessorJob(f.t, f.run, f.receipt, f.item, now), null); assert.equal(f.t.moves, 0);
  });
}
test('changed input hash cannot be claimed', async () => {
  const f = await setup();
  await assert.rejects(claimProcessorJob(f.t, f.run, f.receipt, { ...f.item, input_hash: hash('changed') }, now), /INPUT_CHANGED/);
  assert.equal(f.t.moves, 0);
});
test('two racing claims have exactly one owner', async () => {
  const f = await setup();
  const results = await Promise.all([1, 2].map(() => claimProcessorJob(f.t, f.run, f.receipt, f.item, now)));
  assert.equal(results.filter(Boolean).length, 1); assert.equal(f.t.moves, 1);
});
test('wrong shard and exhausted budget cannot move input', async () => {
  const f = await setup();
  await assert.rejects(claimProcessorJob(f.t, { ...f.run, shard: 1 }, f.receipt, f.item, now), /WRONG_SHARD/);
  await assert.rejects(claimProcessorJob(f.t, f.run, f.receipt, f.item, '2026-09-11T09:59:00Z'), /BUDGET_EXHAUSTED/);
});
test('complete output is validated and immutable; foreign worker cannot finish it', async () => {
  const f = await setup(); await claimProcessorJob(f.t, f.run, f.receipt, f.item, now);
  const output = { ...f.item, decision: 'test' }; let validated = 0;
  const validate = () => { validated++; };
  await assert.rejects(finishProcessorJob(f.t, { ...f.run, run_id: 'foreign' }, f.item, output, validate, now), /OWNER_MISMATCH/);
  await finishProcessorJob(f.t, f.run, f.item, output, validate, now);
  assert.equal(validated, 1);
  await assert.rejects(finishProcessorJob(f.t, f.run, f.item, { ...output, decision: 'changed' }, validate, now), /IMMUTABLE_FILE_CONFLICT/);
});
test('updates precede old normal jobs; urgent first; critical queue omits only historical work', () => {
  const jobs = Array.from({ length: 100 }, (_, n) => ({ job_id: id(n), created_at: '2026-09-01T00:00:00Z', job_type: 'new_story' }))
    .filter(j => processorShard(j.job_id) === 0).slice(0, 6);
  jobs[0].job_type = 'impact_reassessment';
  jobs[1] = { ...jobs[1], job_type: 'story_update', created_at: now };
  jobs[2] = { ...jobs[2], urgent: true, created_at: now };
  const selected = selectProcessorBatch(jobs, 0, now, { queueCritical: true });
  assert.equal(selected[0].job_id, jobs[2].job_id); assert.equal(selected[1].job_id, jobs[1].job_id);
  assert.equal(selected.length, 5); assert.ok(!selected.includes(jobs[0]));
});
test('TOP/HIGH and published updates have reserved admission, historical work does not', () => {
  assert.ok(protectedCurrentCandidate({ preanalysis: { event_score: { priority: 'HIGH' } } }));
  assert.ok(protectedCurrentCandidate({ existing_story: { published: true } }));
  assert.ok(!protectedCurrentCandidate({ backfill: true, preanalysis: { event_score: { priority: 'TOP' } } }));
});
test('62 jobs with no actual automation receipt is critical, never processor available', () => {
  const jobs = Array.from({ length: 62 }, (_, n) => ({ input: { job_id: id(n) }, status: 'queued', created_at: '2026-09-11T07:40:00Z' }));
  const h = processorHealth({ jobs, now });
  assert.equal(h.open_jobs, 62); assert.equal(h.oldest_open_job_age_minutes, 120);
  assert.equal(h.processor_available, false); assert.ok(h.alerts.includes('QUEUE_CRITICAL'));
  assert.equal(h.incoming_jobs_last_hour, null); assert.equal(h.historical_backfill_paused, true);
});
test('health reports proven read capability independently of blocked output writes', () => {
  const receipts = [0, 1, 2].map(shard => ({ checked_at: now, shard, context,
    status: 'CHATGPT_DROPBOX_UNAVAILABLE', dropbox_read_ok: true, dropbox_write_ok: false }));
  const h = processorHealth({ jobs: [], receipts, now });
  assert.equal(h.dropbox_read_ok, true); assert.equal(h.dropbox_write_ok, false);
  assert.equal(h.processor_available, false); assert.equal(h.all_shards_available, false);
});
test('warning thresholds are strictly greater than 10 and 20', () => {
  for (const [count, expected] of [[10, null], [11, 'QUEUE_WARNING'], [20, 'QUEUE_WARNING'], [21, 'QUEUE_CRITICAL']]) {
    const h = processorHealth({ jobs: Array.from({ length: count }, (_, n) => ({ input: { job_id: id(n) }, status: 'queued', created_at: now })), now });
    assert.equal(h.alerts.find(a => a.startsWith('QUEUE_')) || null, expected);
  }
});
test('two fully observed consecutive closed hours are necessary for capacity warning', () => {
  const throughput = { coverage_started_at: '2026-09-11T06:00:00Z', hours: {
    '2026-09-11T07:00:00.000Z': { incoming: 8, completed: 3 }, '2026-09-11T08:00:00.000Z': { incoming: 6, completed: 2 },
  } };
  assert.ok(processorHealth({ jobs: [], throughput, now }).alerts.includes('PROCESSING_CAPACITY_INSUFFICIENT'));
  throughput.coverage_started_at = '2026-09-11T07:01:00Z';
  assert.ok(!processorHealth({ jobs: [], throughput, now }).alerts.includes('PROCESSING_CAPACITY_INSUFFICIENT'));
});
test('throughput does not double-count unchanged jobs and remains available after archival', () => {
  const job = { input: { job_id: id(1) }, created_at: now };
  let log = recordProcessorThroughput(null, null, job, now);
  log = recordProcessorThroughput(log, job, job, now);
  const completed = { ...job, completed_at: now };
  log = recordProcessorThroughput(log, job, completed, now);
  log = recordProcessorThroughput(log, completed, { ...completed, archived_at: now }, now);
  assert.equal(log.events.length, 2); assert.equal(log.hours['2026-09-11T09:00:00.000Z'].incoming, 1);
  assert.equal(log.hours['2026-09-11T09:00:00.000Z'].completed, 1);
});
