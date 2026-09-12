import { currentEvidence, latestEvidenceTime } from '../discovery-admission.mjs';
import { createHash, randomUUID } from 'node:crypto';
import { bridgePath, hash, JOB_ID } from './contract.mjs';

export const PROCESSOR_VERSION = '2026-09-11-2';
export const PROCESSOR_CONTRACT = "processor-contract-2026-09-11-3.json";
export const PROCESSOR_QUEUE_POLICY = "lifo-2026-09-11";
export const PROCESSOR_SHARDS = Object.freeze([
  { id: 'A', index: 0, minute: 0 }, { id: 'B', index: 1, minute: 20 }, { id: 'C', index: 2, minute: 40 },
]);
export const PREFLIGHT_FOLDERS = Object.freeze(['98_CONFIG', '00_INBOX', '10_CLAIMED', '20_OUTPUT_READY', '30_ACK']);
const HOUR = 3600000;
const closed = new Set(['acknowledged', 'quarantined', 'archive_failed']);
const validTime = value => Number.isFinite(Date.parse(value));
const utcHour = time => new Date(Math.floor(Date.parse(time) / HOUR) * HOUR).toISOString();

// Full SHA-256, UTF-8, unsigned big-endian integer. Never hash only the suffix
// or use Number(hex), which loses precision and can assign different workers.
export function processorShard(jobId) {
  if (!JOB_ID.test(jobId)) throw Error('PROCESSOR_JOB_ID_INVALID');
  return Number(BigInt('0x' + createHash('sha256').update(jobId, 'utf8').digest('hex')) % 3n);
}

function assertContext(context) {
  if (context?.actor !== 'chatgpt' || !/^[A-Za-z0-9_-]{8,100}$/.test(context.context_id || '')
    || !['manual', 'automation'].includes(context.kind)
    || context.kind === 'automation' && !/^[A-Za-z0-9_-]{8,100}$/.test(context.automation_id || '')) throw Error('PROCESSOR_CONTEXT_REQUIRED');
}

// The adapter MUST be the actual ChatGPT worker's connector. A server/Codex
// transport test cannot attest another actor's capability. Probe files are not
// outputs and therefore never wake the importer or create a publication job.
export async function processorPreflight(transport, context, now, runId = randomUUID()) {
  assertContext(context);
  if (!validTime(now) || !/^[A-Za-z0-9_-]{8,100}$/.test(runId)) throw Error('PROCESSOR_RUN_INVALID');
  const result = { version: PROCESSOR_VERSION, context, shard: context.shard ?? null, run_id: runId, checked_at: now,
    status: 'CHATGPT_DROPBOX_UNAVAILABLE', reads: {}, dropbox_read_ok: false, dropbox_write_ok: false };
  let operation = 'capabilities';
  try {
    if (!['list', 'read', 'metadata', 'move', 'writeAtomic'].every(k => typeof transport[k] === 'function')) throw Error('CONNECTOR_CAPABILITY_MISSING');
    for (const folder of PREFLIGHT_FOLDERS) {
      operation = `list:${folder}`;
      if (!Array.isArray(await transport.list(folder))) throw Error('CONNECTOR_LIST_INVALID');
      result.reads[folder] = true;
    }
    operation = 'read:98_CONFIG';
    JSON.parse(await transport.read(bridgePath('98_CONFIG', 'contract-2026-09-10-bridge-3.json')));
    result.dropbox_read_ok = true;
    const probe = { probe_id: runId, context, checked_at: now, purpose: 'capability_preflight_only' };
    const file = bridgePath('20_OUTPUT_READY', `preflight-${runId}.probe.json`);
    operation = 'write:20_OUTPUT_READY';
    if (await transport.metadata(file)) throw Error('PROBE_ALREADY_EXISTS');
    await transport.writeAtomic(file, probe);
    operation = 'read_after_write:20_OUTPUT_READY';
    if (hash(JSON.parse(await transport.read(file))) !== hash(probe)) throw Error('PROBE_READBACK_MISMATCH');
    result.dropbox_write_ok = true;
    result.probe_path = file; result.probe_hash = hash(probe); result.status = 'PASS';
  } catch (error) {
    result.failed_operation = operation;
    result.error = /^[A-Z_0-9:.-]+$/.test(error.message) ? error.message : 'CONNECTOR_OPERATION_FAILED';
  }
  // If logging fails, this is not a startable worker either. Keep failure local
  // for the caller to report; do not turn a failed test into a successful receipt.
  try { await transport.writeAtomic(bridgePath('95_LOGS', `processor-preflight-${runId}.json`), result); }
  catch { result.status = 'CHATGPT_DROPBOX_UNAVAILABLE'; result.failed_operation = 'write:95_LOGS'; }
  return result;
}

export function assertProcessorReady(receipt, context, now, { automation = false } = {}) {
  assertContext(context);
  const age = Date.parse(now) - Date.parse(receipt?.checked_at);
  if (receipt?.status !== 'PASS' || !receipt.dropbox_read_ok || !receipt.dropbox_write_ok
    || !PREFLIGHT_FOLDERS.every(f => receipt.reads?.[f] === true)
    || hash(receipt.context) !== hash(context) || !Number.isFinite(age) || age < 0 || age > 30 * 60000
    || automation && context.kind !== 'automation') throw Error('CHATGPT_DROPBOX_UNAVAILABLE');
  return true;
}

// Repair envelopes retain the identity and priority of their original work.
// A follow-up review of historical reassessment must not become a news update.
function inputLineage(value) {
  const chain=[],seen=new Set();let input=value?.input||value;
  while(input&&typeof input==='object'&&!seen.has(input)){
    chain.push(input);seen.add(input);input=input.original_input;
  }
  return chain;
}
export function isHistoricalJob(value) {
  return value?.backfill===true||inputLineage(value).some(input=>input.job_type==='impact_reassessment'
    ||input.backfill===true||input.discovery?.trigger_type==='backfill');
}
export function processorPriority(value, now) {
  if(isHistoricalJob(value))return 0;
  const lineage=inputLineage(value),input=lineage[0]||{},candidate=value.candidate||{};
  const importance=input.systemic_relevance||candidate.impact_assessment?.systemic_relevance;
  const tier=input.editorial_priority||candidate.preanalysis?.event_score?.priority;
  if(lineage.some(i=>i.urgent||i.request?.urgent||i.discovery?.importance_signals?.includes('urgent_manual_editorial_request'))||candidate.urgent||tier==='TOP')return 600;
  if (lineage.some(i => ['new_story','story_update'].includes(i.job_type))
    && currentEvidence(candidate.sources?.length ? candidate : { sources: lineage.flatMap(i => i.sources || []) }, now, 1)) return 580;
  if(lineage.some(i=>i.job_type==='editorial_request'||i.manual_request===true||i.discovery?.importance_signals?.includes('manual_editorial_request'))||value.intake_news_parent||candidate.manual_request)return 550;
  if(['story_update','correction','impact_semantic_review'].includes(input.job_type))return 500;
  if(['critical','very_high'].includes(importance))return 400;
  return importance==='high'||tier==='HIGH'?300:200;
}
export function selectProcessorBatch(jobs, shard, now, { maxJobs = 10, queueCritical = false } = {}) {
  if (![0, 1, 2].includes(shard)) throw Error('PROCESSOR_SHARD_INVALID');
  return jobs.filter(j => !closed.has(j.status) && !j.ack && !j.output && !j.claim
    && JOB_ID.test((j.input || j).job_id) && processorShard((j.input || j).job_id) === shard
    && !(queueCritical && isHistoricalJob(j)))
    .sort((a, b) => processorPriority(b, now) - processorPriority(a, now)
      || latestEvidenceTime(b.candidate || b.input || b, now) - latestEvidenceTime(a.candidate || a.input || a, now)
      || String((b.input || b).created_at).localeCompare(String((a.input || a).created_at))
      || (a.input || a).job_id.localeCompare((b.input || b).job_id))
    .slice(0, Math.max(1, Math.min(10, maxJobs)));
}

// Slot ownership does not expire while a slow worker may still be running.
// The scheduler may retry a failed preflight; a successful run gets one slot.
export async function beginProcessorRun(transport, receipt, context, shard, now) {
  assertProcessorReady(receipt, context, now, { automation: true });
  if (![0, 1, 2].includes(shard)) throw Error('PROCESSOR_SHARD_INVALID');
  if (receipt.shard !== shard || context.shard !== shard) throw Error('PROCESSOR_WRONG_SHARD');
  if (new Date(now).getUTCMinutes() < PROCESSOR_SHARDS[shard].minute) throw Error('PROCESSOR_SLOT_NOT_DUE');
  const hour = utcHour(now), file = bridgePath('95_LOGS', `processor-slot-${shard}-${hour.replace(/[^0-9TZ]/g, '')}.json`);
  if (await transport.metadata(file)) throw Error('PROCESSOR_HOURLY_SLOT_TAKEN');
  await transport.writeAtomic(file, { run_id: receipt.run_id, context, shard, started_at: now });
  return { run_id: receipt.run_id, context, shard, started_at: now, deadline_at: new Date(Date.parse(now) + 20 * 60000).toISOString(), max_jobs: 10 };
}

export async function claimProcessorJob(transport, run, receipt, item, now) {
  assertProcessorReady(receipt, run.context, now, { automation: run.context.kind === 'automation' });
  if (run.run_id !== receipt.run_id || Date.parse(now) >= Date.parse(run.deadline_at) - 120000) throw Error('PROCESSOR_BUDGET_EXHAUSTED');
  const id = item.job_id;
  if (processorShard(id) !== run.shard) throw Error('PROCESSOR_WRONG_SHARD');
  const owned = (await transport.list('95_LOGS')).filter(e => e.name.startsWith('processor-claim-'));
  let count = 0;
  for (const entry of owned) {
    const owner = JSON.parse(await transport.read(bridgePath('95_LOGS', entry.name)));
    if (owner.run_id === run.run_id) count++;
  }
  if (count >= Math.min(10, run.max_jobs || 10)) throw Error('PROCESSOR_BATCH_LIMIT');
  const file = item.file_name || `${id}.input.json`;
  if (!new RegExp(`^${id}\\.(?:input|repair-\\d+)\\.json$`).test(file)) throw Error('PROCESSOR_INPUT_NAME_INVALID');
  if (!/^[a-f0-9]{64}$/.test(item.input_hash || '')) throw Error('PROCESSOR_INPUT_HASH_REQUIRED');
  for (const [folder, name] of [['30_ACK', `${id}.ack.json`], ['20_OUTPUT_READY', `${id}.output.json`], ['10_CLAIMED', file]]) {
    if (await transport.metadata(bridgePath(folder, name))) return null;
  }
  // Repairs deliberately retain the old original claim; a new regular claim
  // must also exclude a concurrently owned repair generation.
  if (file.endsWith('.input.json') && (await transport.list('10_CLAIMED')).some(e => e.name.startsWith(`${id}.`))) return null;
  const from = bridgePath('00_INBOX', file), to = bridgePath('10_CLAIMED', file);
  const raw = await transport.read(from), input = JSON.parse(raw);
  if (input.job_id !== id || input.input_hash !== item.input_hash
    || input.original_input && input.original_input.input_hash !== item.input_hash) throw Error('PROCESSOR_INPUT_CHANGED');
  // Metadata check is advisory; atomic no-replace move is the concurrency lock.
  try { await transport.move(from, to); }
  catch (error) { if (['BRIDGE_DROPBOX_CONFLICT', 'BRIDGE_DROPBOX_NOT_FOUND'].includes(error.message)) return null; throw error; }
  if (hash(await transport.read(to)) !== hash(raw)) throw Error('PROCESSOR_CLAIM_CONTENT_CHANGED');
  await transport.writeAtomic(bridgePath('95_LOGS', `processor-claim-${file}`), {
    job_id: id, input_hash: input.input_hash, file_name: file, run_id: run.run_id, context: run.context, shard: run.shard, claimed_at: now,
  });
  return input;
}

export async function finishProcessorJob(transport, run, item, output, validateOutput, now) {
  if (typeof validateOutput !== 'function') throw Error('PROCESSOR_OUTPUT_VALIDATOR_REQUIRED');
  const file = item.file_name || `${item.job_id}.input.json`;
  const ownership = JSON.parse(await transport.read(bridgePath('95_LOGS', `processor-claim-${file}`)));
  if (ownership.run_id !== run.run_id || hash(ownership.context) !== hash(run.context)
    || ownership.input_hash !== item.input_hash || output.job_id !== item.job_id || output.input_hash !== item.input_hash) throw Error('PROCESSOR_OUTPUT_OWNER_MISMATCH');
  await validateOutput(output); // Native contract and independent publication gates remain mandatory.
  if (await transport.metadata(bridgePath('30_ACK', `${item.job_id}.ack.json`))) throw Error('PROCESSOR_JOB_ALREADY_ACKNOWLEDGED');
  await transport.writeAtomic(bridgePath('20_OUTPUT_READY', `${item.job_id}.output.json`), output);
  await transport.writeAtomic(bridgePath('95_LOGS', `processor-completed-${file}`), {
    run_id: run.run_id, context: run.context, job_id: item.job_id, input_hash: item.input_hash, completed_at: now, output_hash: hash(output),
  });
}

export async function finishProcessorRun(transport, run, completed, now) {
  if (!completed.length) return null;
  for (const item of completed) {
    const proof = JSON.parse(await transport.read(bridgePath('95_LOGS', `processor-completed-${item.file_name || `${item.job_id}.input.json`}`)));
    if (proof.run_id !== run.run_id || proof.input_hash !== item.input_hash) throw Error('PROCESSOR_COMPLETION_MISMATCH');
  }
  const result = { version: PROCESSOR_VERSION, run_id: run.run_id, context: run.context, shard: run.shard,
    status: 'completed', started_at: run.started_at, completed_at: now, completed_jobs: completed.map(j => j.job_id) };
  await transport.writeAtomic(bridgePath('95_LOGS', `processor-run-${run.run_id}.json`), result);
  return result;
}

export function protectedCurrentCandidate(candidate, now = new Date().toISOString()) {
  return !isHistoricalJob(candidate) && (Boolean(candidate.existing_story?.published) || candidate.urgent === true
    || ['TOP', 'HIGH'].includes(candidate.preanalysis?.event_score?.priority)
    || currentEvidence(candidate, now));
}

export function processorHealth({ jobs, receipts = [], throughput = {}, metrics = {}, now }) {
  const open = jobs.filter(j => !closed.has(j.status) && !j.ack);
  const currentNews = open.filter(j => !isHistoricalJob(j) && inputLineage(j).some(i => ['new_story','story_update'].includes(i.job_type)));
  const newsStages = { awaiting_output:0, awaiting_second_pass:0, needs_editorial_repair:0, awaiting_import:0 };
  for (const job of currentNews) {
    const stage = job.accepted?.record ? 'awaiting_import'
      : job.publication_gate?.status === 'needs_second_pass' ? 'awaiting_second_pass'
      : job.last_error || ['needs_review','blocked'].includes(job.publication_gate?.status) ? 'needs_editorial_repair'
      : 'awaiting_output';
    newsStages[stage]++;
  }
  const age = j => Math.max(0, (Date.parse(now) - Date.parse(j.created_at || j.input?.created_at)) / 60000) || 0;
  const fresh = receipts.filter(r => r.context?.kind === 'automation' && validTime(r.checked_at)
    && Date.parse(now) >= Date.parse(r.checked_at) && Date.parse(now) - Date.parse(r.checked_at) < 90 * 60000);
  const workers = PROCESSOR_SHARDS.map(s => {
    const r = fresh.filter(r => r.shard === s.index).sort((a, b) => b.checked_at.localeCompare(a.checked_at))[0];
    let available = false;
    try { assertProcessorReady(r, r?.context, r.checked_at, { automation: true }); available = true; } catch { /* No proof means unavailable. */ }
    return { ...s, processor_available: available, dropbox_read_ok: r?.dropbox_read_ok === true, dropbox_write_ok: r?.dropbox_write_ok === true,
      checked_at: r?.checked_at || null, context_id: r?.context?.context_id || null, automation_id: r?.context?.automation_id || null };
  });
  const previousHours = [1, 2].map(i => utcHour(new Date(Date.parse(now) - i * HOUR).toISOString()));
  const completeHours = previousHours.every(h => throughput.coverage_started_at && Date.parse(throughput.coverage_started_at) <= Date.parse(h));
  const overloaded = completeHours && previousHours.every(h => (throughput.hours?.[h]?.incoming || 0) > (throughput.hours?.[h]?.completed || 0));
  const since = Date.parse(now) - HOUR;
  const events = (throughput.events || []).filter(e => Date.parse(e.at) > since && Date.parse(e.at) <= Date.parse(now));
  const fullHour = throughput.coverage_started_at && Date.parse(throughput.coverage_started_at) <= since;
  const alerts = [];
  if (open.length > 20) alerts.push('QUEUE_CRITICAL'); else if (open.length > 10) alerts.push('QUEUE_WARNING');
  if (overloaded) alerts.push('PROCESSING_CAPACITY_INSUFFICIENT');
  if (!workers.some(w => w.processor_available)) alerts.push('CHATGPT_DROPBOX_UNAVAILABLE');
  else if (open.length && !workers.every(w => w.processor_available)) alerts.push('PROCESSOR_SHARD_UNAVAILABLE');
  return { version: PROCESSOR_VERSION, checked_at: now, processor_available: workers.some(w => w.processor_available),
    all_shards_available: workers.every(w => w.processor_available), dropbox_read_ok: workers.some(w => w.dropbox_read_ok),
    dropbox_write_ok: workers.some(w => w.dropbox_write_ok), workers,
    open_jobs: open.length, current_news_open:currentNews.length, current_news_stages:newsStages,
    oldest_current_news_age_minutes:Math.max(0,...currentNews.map(age)), oldest_open_job_age_minutes: Math.max(0, ...open.map(age)),
    incoming_jobs_last_hour: fullHour ? events.filter(e => e.type === 'incoming').length : null,
    completed_jobs_last_hour: fullHour ? events.filter(e => e.type === 'completed').length : null,
    throughput_coverage_started_at: throughput.coverage_started_at || null,
    last_successful_run: metrics.last_successful_run || null, last_completed_job: metrics.last_completed_job || null,
    historical_backfill_paused: open.length > 20, alerts };
}

// Called only on durable first insertion/completion, before archival. Never
// infer hourly completions from a directory's mtime or count an ACK twice.
export function recordProcessorThroughput(previous, existing, job, observedAt) {
  const value = structuredClone(previous || { coverage_started_at: observedAt, hours: {}, events: [] });
  for (const [type, changed] of [['incoming', !existing], ['completed', job.completed_at && !existing?.completed_at]]) {
    if (!changed) continue;
    const hour = utcHour(observedAt), counts = value.hours[hour] ||= { incoming: 0, completed: 0 };
    counts[type]++; value.events.push({ type, job_id: job.input.job_id, at: observedAt });
    if (type === 'completed') value.last_completed_job = job.input.job_id;
  }
  const cutoff = Date.parse(observedAt) - 48 * HOUR;
  value.events = value.events.filter(e => Date.parse(e.at) >= cutoff);
  for (const h of Object.keys(value.hours)) if (Date.parse(h) < cutoff) delete value.hours[h];
  return value;
}

export async function updateProcessorHealth(store, transport, now) {
  const receipts = [];
  const logs = await transport.list('95_LOGS');
  const entries = logs.filter(e => /^processor-preflight-.*\.json$/.test(e.name))
    .sort((a, b) => String(b.server_modified || b.name).localeCompare(String(a.server_modified || a.name))).slice(0, 12);
  for (const e of entries) {
    try {
      const r = JSON.parse(await transport.read(bridgePath('95_LOGS', e.name)));
      if (r.status === 'PASS') {
        const expected = bridgePath('20_OUTPUT_READY', `preflight-${r.run_id}.probe.json`);
        if (r.probe_path !== expected || hash(JSON.parse(await transport.read(expected))) !== r.probe_hash) r.status = 'PROBE_NOT_VERIFIED';
      }
      receipts.push(r);
    } catch { /* Missing/incomplete receipts never imply a healthy worker. */ }
  }
  const runs = logs.filter(e => /^processor-run-.*\.json$/.test(e.name))
    .sort((a, b) => String(b.server_modified || b.name).localeCompare(String(a.server_modified || a.name))).slice(0, 6);
  for (const e of runs) {
    try {
      const r = JSON.parse(await transport.read(bridgePath('95_LOGS', e.name)));
      if (r.context?.kind !== 'automation' || r.status !== 'completed' || !r.completed_jobs?.length
        || !validTime(r.completed_at) || Date.parse(r.completed_at) > Date.parse(now)) continue;
      const previous = await store.observation('processor-last-success');
      if (!previous || Date.parse(r.completed_at) > Date.parse(previous.at)) await store.observe('processor-last-success', { at: r.completed_at, run_id: r.run_id });
    } catch { /* Invalid run logs cannot create a successful-run timestamp. */ }
  }
  const throughput = await store.observation('processor-throughput') || {};
  const health = processorHealth({ jobs: await store.all(), receipts, throughput, metrics: { ...throughput,
    last_successful_run: (await store.observation('processor-last-success'))?.at || null }, now });
  await store.observe('processor-health', health);
  await transport.writeAtomic(bridgePath('95_LOGS', `processor-health-${now.replace(/[^0-9TZ]/g, '')}.json`), health);
  return health;
}
