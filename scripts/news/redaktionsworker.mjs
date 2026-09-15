// Redaktionsworker (Direktbetrieb, seit 15.09.2026): übernimmt die Rolle der
// früheren ChatGPT-Worker für die private Redaktion (Meinung & Analyse,
// Nachgehört, Nachgesehen, Buch & Wirkung), ohne Serverzugang. Er liest offene
// Redaktionsaufträge über die vorhandene authentifizierte Oracle-Schnittstelle,
// macht je Auftrag genau einen bezahlten OpenAI-Aufruf mit dem unveränderten
// Redaktionsvertrag, prüft die Ausgabe mit den bestehenden Regeln und legt sie
// als Entwurf ab. Die Redaktionsapp holt den Entwurf ab und legt ihn Natalie
// zur Freigabe oder Rückgabe vor. Nichts wird direkt veröffentlicht.
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { bridgeSession } from './bridge/remote.mjs';
import { bridgePath, hash, JOB_ID } from './bridge/contract.mjs';
import { prepareApiJob, validateApiOutput } from './bridge/api-processor.mjs';
import { editorialKnowledge } from './bridge/editorial-knowledge.mjs';
import { OPENAI_RESPONSES_URL, finalOutputText, decodeUsage, newsModel } from './openai-transport.mjs';
import { modelRates } from './budget.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const WORKER_ACTOR = 'github_direct_worker';
export const WORKER_VERSION = 'redaktionsworker-1';
const SKIP = new Set(['BRIDGE_RUN_LOCKED', 'BRIDGE_SLOT_ALREADY_COMPLETED', 'BRIDGE_REMOTE_CONFIG_REQUIRED']);
const isoDay = (value) => String(value).slice(0, 10);

export function selectEditorialRequests(rows, { limit = 2, excluded = new Set() } = {}) {
  return rows.filter((row) => row?.input?.job_type === 'editorial_request' && row.status === 'queued'
      && JOB_ID.test(row.input.job_id || '') && !row.ack && !row.accepted && !excluded.has(row.input.job_id))
    .sort((a, b) => String(a.created_at || '').localeCompare(String(b.created_at || '')))
    .slice(0, Math.max(0, limit));
}

// Exactly one paid model call with the unchanged editorial contract. The
// server-bound fields (job_id, input_hash, schema_version, processed_at) are
// set by software, never trusted from the model.
export async function draftEditorialOutput(request, { apiKey = process.env.OPENAI_API_KEY, model = newsModel(), fetchImpl = fetch, reasoningEffort = process.env.WOEK_EDITORIAL_REASONING_EFFORT || 'medium', maxOutputTokens = 48000, timeoutMs = 300000 } = {}) {
  if (!apiKey) throw Object.assign(new Error('OPENAI_API_KEY_MISSING'), { providerNotCalled: true });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let response, payload;
  try {
    response = await fetchImpl(OPENAI_RESPONSES_URL, { method: 'POST', signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, store: false, reasoning: { effort: reasoningEffort }, max_output_tokens: maxOutputTokens,
        instructions: request.instructions, input: request.prompt, text: { format: { type: 'json_object' } } }) });
    payload = await response.json().catch(() => null);
  } finally { clearTimeout(timer); }
  if (!response.ok) throw Object.assign(new Error(`AI_PROVIDER_ERROR:${response.status}`), { providerNotCalled: response.status === 401 || response.status === 403 || response.status === 429 });
  const usage = decodeUsage(payload);
  const reportedModel = typeof payload?.model === 'string' && payload.model ? payload.model : model;
  const rates = modelRates(reportedModel);
  const cost = usage ? Number((((usage.input_tokens - (usage.cached_input_tokens || 0)) * rates.inputUsdPerMillion + (usage.cached_input_tokens || 0) * rates.cachedInputUsdPerMillion + usage.output_tokens * rates.outputUsdPerMillion) / 1e6).toFixed(6)) : null;
  const text = finalOutputText(payload);
  if (!text) throw Object.assign(new Error('AI_PROVIDER_OUTPUT_INVALID'), { usage, model: reportedModel, cost, incomplete: payload?.incomplete_details?.reason || null });
  let parsed;
  try { parsed = JSON.parse(text); } catch { throw Object.assign(new Error('AI_MALFORMED_JSON'), { usage, model: reportedModel, cost }); }
  return { output: parsed, usage, model: reportedModel, cost, answer: text };
}

export async function processEditorialRequest(session, row, { knowledge, draft = draftEditorialOutput, now = () => new Date().toISOString(), rawOutputDir = process.env.WOEK_NEWS_RAW_OUTPUT_DIR } = {}) {
  const id = row.input.job_id;
  const job = await session.store.get(id);
  if (!job || job.ack || job.accepted || job.status !== 'queued') return { job_id: id, status: 'already_processed' };
  const attempt = await session.store.observation(`github-attempt:${id}`);
  if (attempt?.provider_called) return { job_id: id, status: 'attempt_exhausted', delivered: attempt.status === 'output_delivered' };
  const outputPath = bridgePath('20_OUTPUT_READY', `${id}.output.json`);
  if (await session.transport.metadata(outputPath) || await session.transport.metadata(bridgePath('30_ACK', `${id}.ack.json`))) return { job_id: id, status: 'already_delivered' };
  const name = `${id}.input.json`, sourcePath = bridgePath('00_INBOX', name), claimPath = bridgePath('10_CLAIMED', name);
  const ownClaim = await session.store.observation(`github-claim:${name}`);
  if (await session.transport.metadata(claimPath) && ownClaim?.state !== 'claimed') return { job_id: id, status: 'claimed_elsewhere' };
  const packet = JSON.parse(await session.transport.read(ownClaim?.state === 'claimed' ? claimPath : sourcePath));
  if (packet.job_id !== id || packet.input_hash !== job.input.input_hash || packet.job_type !== 'editorial_request') throw new Error('BRIDGE_JOB_BINDING_MISMATCH');
  const request = prepareApiJob(packet, knowledge);
  if (!ownClaim) {
    await session.store.observe(`github-claim:${name}`, { job_id: id, actor: WORKER_ACTOR, packet_hash: hash(packet), state: 'intent', at: now() });
    try { await session.transport.move(sourcePath, claimPath); }
    catch { return { job_id: id, status: 'claim_unknown' }; }
    await session.store.observe(`github-claim:${name}`, { job_id: id, actor: WORKER_ACTOR, packet_hash: hash(packet), state: 'claimed', at: now() });
  }
  await session.store.observe(`github-attempt:${id}`, { job_id: id, actor: WORKER_ACTOR, version: WORKER_VERSION, provider_called: true, status: 'started', at: now(), request_key: request.key });
  let result;
  try { result = await draft(request); }
  catch (error) {
    const status = error.providerNotCalled ? 'provider_unavailable' : 'output_unusable';
    await session.store.observe(`github-attempt:${id}`, { job_id: id, actor: WORKER_ACTOR, version: WORKER_VERSION, provider_called: !error.providerNotCalled, status, error: String(error.message).slice(0, 120), usage: error.usage || null, cost_usd: error.cost ?? null, at: now() });
    return { job_id: id, status, error: String(error.message).slice(0, 120), cost_usd: error.cost ?? 0 };
  }
  if (rawOutputDir) {
    try { fs.mkdirSync(rawOutputDir, { recursive: true }); fs.writeFileSync(path.join(rawOutputDir, `${now().replace(/[:.]/g, '-')}-${id}.json`), JSON.stringify({ job_id: id, model: result.model, usage: result.usage, answer: result.answer }, null, 2)); } catch { /* best effort */ }
  }
  const output = { ...result.output, schema_version: '1.0', job_id: id, input_hash: packet.input_hash, processed_at: now() };
  let validated;
  try { validated = validateApiOutput(output, packet, now()); }
  catch (error) {
    const message = [String(error.message), ...(error.issues || [])].join('\n').slice(0, 2000);
    await session.store.observe(`github-attempt:${id}`, { job_id: id, actor: WORKER_ACTOR, version: WORKER_VERSION, provider_called: true, status: 'validation_failed', error: message, usage: result.usage, cost_usd: result.cost, at: now() });
    return { job_id: id, status: 'validation_failed', error: message.slice(0, 200), cost_usd: result.cost };
  }
  const latest = await session.store.get(id);
  if (!latest || latest.ack || latest.accepted) return { job_id: id, status: 'already_processed', cost_usd: result.cost };
  if (await session.transport.metadata(outputPath)) return { job_id: id, status: 'already_delivered', cost_usd: result.cost };
  await session.transport.writeAtomic(outputPath, validated);
  if (hash(JSON.parse(await session.transport.read(outputPath))) !== hash(validated)) throw new Error('EDITORIAL_DELIVERY_READBACK_FAILED');
  await session.transport.writeAtomic(bridgePath('95_LOGS', `processor-github-${id}.json`), { actor: WORKER_ACTOR, version: WORKER_VERSION, job_id: id, request_key: request.key, output_hash: hash(validated), model: result.model, usage: result.usage, cost_usd: result.cost, delivered_at: now(), status: 'OUTPUT_DELIVERED_NOT_PUBLISHED', disposition: validated.disposition || 'preview' });
  await session.store.observe(`github-attempt:${id}`, { job_id: id, actor: WORKER_ACTOR, version: WORKER_VERSION, provider_called: true, status: 'output_delivered', usage: result.usage, cost_usd: result.cost, at: now() });
  return { job_id: id, status: 'output_delivered', disposition: validated.disposition || 'preview', cost_usd: result.cost, model: result.model };
}

export async function runRedaktionsworker({ session = null, root = ROOT, knowledge = null, draft = draftEditorialOutput, now = () => new Date().toISOString(), env = process.env,
  maxJobsPerRun = Number(env.WOEK_EDITORIAL_MAX_JOBS_PER_RUN || 2), maxJobsPerDay = Number(env.WOEK_EDITORIAL_MAX_JOBS_PER_DAY || 10) } = {}) {
  let store, transport;
  try { ({ store, transport } = session || bridgeSession(env)); }
  catch (error) { if (SKIP.has(error.message)) return { status: 'skipped', reason: error.message, results: [] }; throw error; }
  const live = { store, transport };
  let acquired = false;
  try {
    await store.acquire(now(), 'import', { manualRunId: `${env.GITHUB_RUN_ID || '0'}:${env.GITHUB_RUN_ATTEMPT || '1'}` });
    acquired = true;
  } catch (error) { if (SKIP.has(error.message)) return { status: 'skipped', reason: error.message, results: [] }; throw error; }
  try {
    const day = isoDay(now());
    const counter = (await store.observation(`github-editorial-day:${day}`)) || { day, paid: 0, cost_usd: 0 };
    if (counter.paid >= maxJobsPerDay) return { status: 'daily_limit', day, paid: counter.paid, results: [] };
    const rows = await store.all();
    const selected = selectEditorialRequests(rows, { limit: Math.min(maxJobsPerRun, maxJobsPerDay - counter.paid) });
    const resolvedKnowledge = knowledge || editorialKnowledge(root);
    const results = [];
    for (const row of selected) {
      const result = await processEditorialRequest(live, row, { knowledge: resolvedKnowledge, draft, now });
      results.push(result);
      if (result.cost_usd) { counter.paid += 1; counter.cost_usd = Number((counter.cost_usd + result.cost_usd).toFixed(6)); await store.observe(`github-editorial-day:${day}`, counter); }
      if (result.status === 'provider_unavailable') break;
    }
    return { status: 'ok', day, open_requests: rows.filter((row) => row?.input?.job_type === 'editorial_request' && row.status === 'queued').length, selected: selected.length, paid_today: counter.paid, cost_today_usd: counter.cost_usd, results };
  } finally {
    if (acquired) await store.release(true).catch(() => {});
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const report = await runRedaktionsworker();
    console.log(JSON.stringify(report, null, 2));
    if (report.results?.some((r) => r.status === 'provider_unavailable')) process.exitCode = 1;
  } catch (error) {
    console.error(JSON.stringify({ status: 'failed', error: /^[A-Z_0-9:.-]+$/.test(error?.message || '') ? error.message : 'REDAKTIONSWORKER_FAILED' }));
    process.exitCode = 1;
  }
}
