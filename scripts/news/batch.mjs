import { sha256, decodeWoekAiResponse } from './lib.mjs';
import { modelRates, validReportedUsage } from './budget.mjs';
import { assertApiProcessing } from './processing-mode.mjs';

export const BATCH_PROTOCOL = 1;
export const BATCH_RESERVATION_USD = 0.125;
const terminal = new Set(['completed', 'failed', 'not_submitted']);
const activeKinds = new Set(['media_backfill', 'editorial_background']);

export function backgroundBatchEligibility(story, { kind, now, state = {} } = {}) {
  if (!activeKinds.has(kind)) return { eligible: false, reason: 'immediate_news' };
  if (!story?.published || !story.analysis || story.listed === false) return { eligible: false, reason: 'not_published' };
  if (state.pending_story_ids?.includes(story.story_id)) return { eligible: false, reason: 'news_update_pending' };
  if (story.breaking || story.urgent || story.editorial_priority === 'urgent' || story.analysis_variant === 'systemic') return { eligible: false, reason: 'urgent_or_commissioned' };
  const times = [story.published_at, story.last_updated, story.updated_at,
    ...(story.sources || []).map(source => source.source_published_at || source.published_at)].filter(Boolean).map(Date.parse);
  if (!times.length || times.some(value => !Number.isFinite(value)) || !Number.isFinite(Date.parse(now))) return { eligible: false, reason: 'currentness_unknown' };
  if (Date.parse(now) - Math.max(...times) < 24 * 3600000) return { eligible: false, reason: 'recent_news_or_update' };
  const deadline = Date.parse(story.next_event_at || story.event_deadline_at || '');
  if (Number.isFinite(deadline) && deadline > Date.parse(now) && deadline - Date.parse(now) < 48 * 3600000) return { eligible: false, reason: 'near_deadline' };
  return { eligible: true, reason: 'published_background_work' };
}

export function batchStoryFingerprint(story, kind, methodVersion) {
  // Bind to input facts AND the currently published analysis. Even a correction
  // without a changed feed hash invalidates a late answer.
  return sha256(JSON.stringify({ protocol: BATCH_PROTOCOL, kind, methodVersion, story_id: story.story_id,
    content_hash: story.content_hash, version: story.current_version, title: story.title,
    source_summary: story.source_summary, analysis: story.analysis, sources: story.sources, claims: story.claims }));
}

export function batchJobKey(input) {
  return sha256(JSON.stringify({ version: BATCH_PROTOCOL, kind: input.kind, story_id: input.story_id, fingerprint: input.fingerprint, question: input.question, attempt: input.attempt }));
}

export function batchWorkPriority(state, story, kind) {
  const jobs = Object.values(state.batch_jobs || {}).filter(job => job.story_id === story.story_id && job.kind === kind && !job.applied_at);
  if (jobs.some(job => job.status === 'completed')) return 0;
  if (jobs.some(job => !terminal.has(job.status))) return 1;
  return jobs.length ? 3 : 2;
}

function deferred(code, key) { return Object.assign(new Error(code), { batchDeferred: true, batchKey: key, requestAttempts: 0, providerNotCalled: true }); }

export function createNewsBatchClient({ state, usage, save, apiUrl, authToken, now, fetchImpl = fetch, canSubmit = () => true }) {
  state.batch_jobs ||= {};
  const jobs = state.batch_jobs;
  const report = { submitted: 0, pending: 0, completed: 0, failed: 0, applied: 0, polling_errors: 0, timing_reconciled: 0 };
  const url = new URL(apiUrl || 'https://130.162.217.58.sslip.io/api/news-analysis');
  url.pathname = '/api/news-analysis/batches'; url.search = ''; url.hash = '';
  const persist = () => save(state, usage);
  const usageId = job => `${job.kind === 'editorial_background' ? 'editorial' : 'media-backfill'}-batch-${job.key}`;
  const validTime = value => typeof value === 'string' && Number.isFinite(Date.parse(value)) && Date.parse(value) <= Date.parse(now);
  const sameJob = (job, remote) => remote && remote.key === job.key && remote.fingerprint === job.fingerprint
    && remote.story_id === job.story_id && remote.kind === job.kind && remote.processing_mode === 'batch';
  function accountTime(row, at, basis, active = false) {
    if (!validTime(at)) return false;
    const previous = row.cost_started_at || row.started_at;
    const clearCompletion = active && row.completed_at != null;
    const changed = row.cost_started_at !== at || row.cost_started_at_basis !== basis || clearCompletion;
    if (previous !== at || clearCompletion) {
      (row.batch_timing_history ||= []).push({ recorded_at: now, reason: 'batch_cost_clock_reconciliation',
        started_at: row.started_at, cost_started_at: previous, cost_started_at_basis: row.cost_started_at_basis || 'legacy_started_at',
        completed_at: row.completed_at ?? null, batch_status: row.batch_status ?? null,
        requests: row.ai?.requests ?? null, estimated_cost_usd: row.ai?.estimated_cost_usd ?? null });
    }
    row.cost_started_at = at; row.cost_started_at_basis = basis;
    if (clearCompletion) row.completed_at = null;
    return changed;
  }
  function account(job, remote) {
    const rows = usage.runs ||= [];
    let row = rows.find(entry => entry.run_id === usageId(job));
    if (!row) {
      row = { run_id: usageId(job), started_at: job.created_at, completed_at: null,
        berlin_slot: 'zeitunkritische Batch-Nachprüfung', counts: job.kind === 'editorial_background' ? { editorial_research_started: 1 } : { media_checks_triggered: 1 }, ai: {}, source_failures: 0, quality_holds: 0 };
      rows.push(row);
    }
    const known = remote?.billing_status === 'settled';
    let cost = BATCH_RESERVATION_USD;
    if (known) {
      // Independently verify the transport tariff; model text is never billing evidence.
      const tokens = remote.usage;
      if (validReportedUsage(tokens) && remote.model === 'gpt-5.4-mini') {
        const rates = modelRates(remote.model), cached = tokens.cached_input_tokens || 0;
        cost = Number((((tokens.input_tokens - cached) * rates.inputUsdPerMillion + cached * rates.cachedInputUsdPerMillion + tokens.output_tokens * rates.outputUsdPerMillion) / 1e6 * 0.5).toFixed(6));
      }
      else if (remote.estimated_cost_usd === 0 && remote.status === 'failed') cost = 0;
      if (cost !== remote.estimated_cost_usd) throw new Error('BATCH_BILLING_MISMATCH');
    }
    // Transport metadata, never model text, supplies the paid job's clock.
    // Before acknowledgement retain a conservative local reservation timestamp.
    if (remote && !remote.not_submitted && validTime(remote.created_at)) {
      accountTime(row, remote.created_at, 'provider_created_at', !terminal.has(remote.status));
    } else if (!remote || row.cost_started_at_basis !== 'provider_created_at') {
      accountTime(row, job.created_at, 'local_reservation_created_at', !terminal.has(remote?.status));
    }
    const old = row.ai.estimated_cost_usd;
    row.ai = { requests: remote?.not_submitted ? 0 : 1, provider: 'Oracle WOeK-KI API', model: 'gpt-5.4-mini', processing_mode: 'batch',
      input_tokens: known ? remote.usage?.input_tokens || 0 : 0, output_tokens: known ? remote.usage?.output_tokens || 0 : 0,
      estimated_cost_usd: cost, token_source: known ? 'batch_provider_usage' : 'batch_reserved_pending', batch_key: job.key };
    row.batch_status = remote?.status || 'submission_unknown';
    if (known && old !== undefined && old !== cost) row.billing_reconciliation = { previous_reserved_usd: old, reconciled_at: now, billed_usd: cost };
    if (terminal.has(remote?.status) && !row.completed_at) row.completed_at = now;
  }
  async function request(path, input) {
    assertApiProcessing();
    if (!authToken) throw Object.assign(new Error('BATCH_AUTH_MISSING'), { requestAttempts: 0, providerNotCalled: true });
    const r = await fetchImpl(`${url.href}${path}`, { method: input ? 'POST' : 'GET', redirect: 'error', signal: AbortSignal.timeout(45000),
      headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json', 'X-WOEK-Client-ID': 'woek-wirkungsticker-batch-v1' }, ...(input ? { body: JSON.stringify(input) } : {}) });
    const payload = await r.json();
    if (!r.ok || !payload?.ok) throw Object.assign(new Error(payload?.code === 'BUDGET_EXHAUSTED' ? 'AI_BUDGET_EXHAUSTED' : `BATCH_API_${payload?.code || r.status}`), {
      requestAttempts: 0, providerNotCalled: true, status: r.status, budgetScope: payload?.budget_scope,
      localRefusal: ['UNAUTHORIZED', 'BATCH_UNAVAILABLE', 'BATCH_CAPACITY', 'BUDGET_EXHAUSTED', 'BATCH_REQUEST_INVALID'].includes(payload?.code),
    });
    return payload.jobs || payload.job;
  }
  function accept(job, remote) {
    if (!sameJob(job, remote)) throw new Error('BATCH_RESULT_IDENTITY_MISMATCH');
    account(job, remote);
    Object.assign(job, { status: remote.status, billing_status: remote.billing_status, next_poll_at: new Date(Date.parse(now) + 15 * 60000).toISOString(), checked_at: now, error: remote.error || null });
    persist();
  }
  async function reconcile() {
    // Recover paid jobs even when a runner failed before committing its local
    // state. Oracle owns the durable submission journal; no article text here.
    try {
      const recovered = await request('');
      for (const remote of Array.isArray(recovered) ? recovered : []) {
        if (!remote || !/^[a-f0-9]{64}$/.test(remote.key || '') || !/^[a-f0-9]{64}$/.test(remote.fingerprint || '') || !/^[a-f0-9]{64}$/.test(remote.prompt_hash || '') || !activeKinds.has(remote.kind) || !validTime(remote.created_at) || !Number.isInteger(remote.attempt) || remote.attempt < 0 || remote.attempt > 2) continue;
        const existing = jobs[remote.key];
        if (existing) {
          // Also repair already settled/applied legacy rows, using the metadata
          // list we fetch anyway. Never reapply an answer or rewrite its bill.
          const row = (usage.runs || []).find(entry => entry.run_id === usageId(existing));
          if (sameJob(existing, remote) && remote.prompt_hash === existing.prompt_hash && remote.attempt === existing.attempt
            && row?.ai?.processing_mode === 'batch' && row.ai.batch_key === existing.key && row.ai.requests > 0
            && accountTime(row, remote.created_at, 'provider_created_at', !terminal.has(existing.status) && !terminal.has(remote.status))) {
            report.timing_reconciled += 1; persist();
          }
          continue;
        }
        const job = jobs[remote.key] = { key: remote.key, kind: remote.kind, story_id: remote.story_id, fingerprint: remote.fingerprint, prompt_hash: remote.prompt_hash, attempt: remote.attempt, created_at: remote.created_at, recovered_at: now };
        accept(job, remote);
        // Poll recovered active jobs now, not one scheduler interval later.
        delete job.next_poll_at;
      }
    } catch { report.polling_errors += 1; }
    for (const job of Object.values(jobs).filter(job => !job.applied_at && !terminal.has(job.status) && !(Date.parse(job.next_poll_at) > Date.parse(now))).slice(0, 4)) {
      try { accept(job, await request(`/${job.key}`)); }
      catch { job.next_poll_at = new Date(Date.parse(now) + 15 * 60000).toISOString(); report.polling_errors += 1; persist(); }
    }
    report.pending = Object.values(jobs).filter(job => !terminal.has(job.status)).length;
    report.attention_required = Object.values(jobs).filter(job => (['failed', 'completed'].includes(job.status) && job.billing_status !== 'settled' || !terminal.has(job.status) && Date.parse(now) - Date.parse(job.created_at) > 30 * 3600000)).map(job => ({ key: job.key, kind: job.kind, status: job.status, error: job.error }));
    return report;
  }
  async function call(story, { kind, methodVersion, prompt }) {
    assertApiProcessing();
    if (!backgroundBatchEligibility(story, { kind, now, state }).eligible) throw deferred('BATCH_NOT_ELIGIBLE');
    if (!authToken) throw deferred('BATCH_AUTH_MISSING');
    const fingerprint = batchStoryFingerprint(story, kind, methodVersion);
    const related = Object.values(jobs).filter(job => job.kind === kind && job.story_id === story.story_id && job.fingerprint === fingerprint);
    const matching = related.filter(job => job.prompt_hash === sha256(prompt));
    if (matching.some(job => job.applied_at)) throw deferred('BATCH_ALREADY_APPLIED');
    let job = matching.findLast(job => !['failed', 'not_submitted'].includes(job.status) && !job.applied_at);
    if (!job) {
      if (related.filter(job => job.status !== 'not_submitted').length >= 3) throw deferred('BATCH_RETRY_LIMIT');
      const last = matching.at(-1);
      if (last && Date.parse(now) - Date.parse(last.checked_at || last.created_at) < (last.status === 'not_submitted' ? 15 * 60000 : 6 * 3600000)) throw deferred('BATCH_RETRY_WAIT');
      if (!canSubmit()) throw deferred('BATCH_BUDGET_DEFERRED');
      if (Object.values(jobs).filter(job => !terminal.has(job.status)).length >= 4) throw deferred('BATCH_CAPACITY');
      const input = { kind, story_id: story.story_id, fingerprint, question: prompt, attempt: matching.filter(job => job.status !== 'not_submitted').length };
      input.key = batchJobKey(input);
      job = jobs[input.key] = { key: input.key, kind, story_id: story.story_id, fingerprint, prompt_hash: sha256(prompt), attempt: input.attempt, created_at: now, status: 'submission_unknown' };
      account(job); persist();
      try { accept(job, await request('', input)); report.submitted += 1; }
      catch (error) {
        if (error.localRefusal) {
          // An authenticated local refusal proves no paid job was created.
          accept(job, { ...job, processing_mode: 'batch', status: 'failed', billing_status: 'settled', estimated_cost_usd: 0, not_submitted: true });
          job.status = 'not_submitted'; persist();
        }
        if (error.message === 'AI_BUDGET_EXHAUSTED') throw error;
        throw deferred(error.message?.startsWith('BATCH_API_') ? error.message : 'BATCH_SUBMISSION_UNCERTAIN', job.key);
      }
      throw deferred('AI_BATCH_PENDING', job.key);
    }
    // Re-fetch the result only for this exact current snapshot and prompt.
    let remote;
    try { remote = await request(`/${job.key}`); accept(job, remote); }
    catch (error) {
      if (error.status === 404 && job.status === 'submission_unknown') {
        // The local proxy has no job: repeat the identical idempotent request,
        // never invent a new key or repeat the upstream paid submission here.
        const input = { key: job.key, kind, story_id: story.story_id, fingerprint, question: prompt, attempt: job.attempt };
        try { accept(job, await request('', input)); }
        catch { /* Reserve remains until a later authenticated reconciliation. */ }
      }
      throw deferred(error.message || 'BATCH_POLL_FAILED', job.key);
    }
    if (!terminal.has(remote.status)) throw deferred('AI_BATCH_PENDING', job.key);
    if (remote.status === 'failed') {
      report.failed += 1;
      throw Object.assign(new Error(remote.error || 'AI_PROVIDER_OUTPUT_INVALID'), { requestAttempts: 0, providerNotCalled: true, batchKey: job.key });
    }
    report.completed += 1;
    try {
      return { ...decodeWoekAiResponse({ ...remote, provider: 'Oracle WOeK-KI API', mode: 'newsroom-oracle-batch', sources: [] }, prompt), batch_key: job.key, processing_mode: 'batch', request_attempts: 0 };
    } catch (error) { error.requestAttempts = 0; error.providerNotCalled = true; throw error; }
  }
  function applied(result, counts) {
    const job = jobs[result?.batch_key];
    if (!job || job.applied_at) return;
    const row = usage.runs.find(entry => entry.run_id === usageId(job));
    if (row) { Object.assign(row.counts, counts); row.publication_applied_at = now; }
    job.applied_at = now; report.applied += 1; persist();
  }
  return { call, reconcile, applied, report };
}
