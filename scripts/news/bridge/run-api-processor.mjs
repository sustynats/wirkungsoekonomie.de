import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { BridgeStore } from './store.mjs';
import { DropboxTransport, loadDropboxCredentials } from './dropbox.mjs';
import { editorialKnowledge } from './editorial-knowledge.mjs';
import { ApiEditorialProcessor, apiProcessorPreflight, selectApiJobs } from './api-processor.mjs';

// Explicit operator activation. A cron without credentials/config is not
// counted as healthy; dry-run lists selected IDs and never claims or calls AI.
const directory = process.env.WOEK_NEWS_BRIDGE_DIRECTORY;
if (!path.isAbsolute(directory || '')) throw Error('API_EDITORIAL_PRIVATE_DIRECTORY_REQUIRED');
const root = process.cwd(), now = () => new Date().toISOString();
const lock = new DatabaseSync(path.join(directory, 'api-processor.lock'));
lock.exec('CREATE TABLE IF NOT EXISTS singleton(id INTEGER PRIMARY KEY)');
try { lock.exec('BEGIN IMMEDIATE'); } catch { console.log(JSON.stringify({ status: 'BUSY' })); process.exit(0); }
const store = new BridgeStore(path.join(directory, 'queue.sqlite'), { lane: 'intake' });
try {
  // Small selection records: never load hundreds of full assessments on OCI.
  const rows = store.db.prepare(`SELECT id,
    json_extract(body,'$.status') AS status,
    json_extract(body,'$.input.job_type') AS kind,
    json_extract(body,'$.input.created_at') AS created_at,
    json_extract(body,'$.input.urgent') AS urgent,
    json_extract(body,'$.input.manual_request') AS manual_request,
    json_extract(body,'$.candidate.sources') AS sources,
    json_extract(body,'$.input.record.sources') AS review_sources
    FROM jobs WHERE json_extract(body,'$.ack') IS NULL AND json_extract(body,'$.accepted') IS NULL
    AND json_extract(body,'$.status') IN ('queued','correction_pending')
    AND json_extract(body,'$.input.job_type') IN ('new_story','story_update','impact_semantic_review','editorial_request')
    ORDER BY CASE WHEN json_extract(body,'$.input.job_type')='editorial_request' THEN 0 ELSE 1 END,
    json_extract(body,'$.input.created_at') DESC LIMIT 150`).all();
  const candidates = rows.map(row => ({ status: row.status, input: { job_id: row.id, job_type: row.kind,
    created_at: row.created_at, urgent: row.urgent === 1, manual_request: row.manual_request === 1 },
    candidate: { sources: JSON.parse(row.sources || row.review_sources || '[]') } }));
  const configured = JSON.parse(fs.readFileSync(path.join(directory, 'api-processor-config.json'), 'utf8'));
  if (configured.version !== 1 || !Number.isInteger(configured.max_jobs_per_run) || configured.max_jobs_per_run < 1 || configured.max_jobs_per_run > 10
    || !Number.isFinite(configured.max_news_age_hours) || configured.max_news_age_hours < 1 || configured.max_news_age_hours > 24) throw Error('API_EDITORIAL_CONFIG_INVALID');
  const jobs = selectApiJobs(candidates.filter(j => !configured.news_only || ['new_story','story_update','impact_semantic_review'].includes(j.input.job_type)), now(), {
    maxJobs: 150, maxNewsAgeHours: configured.max_news_age_hours, excludedIds: configured.excluded_job_ids || [],
  });
  if (process.argv.includes('--dry-run')) {
    console.log(JSON.stringify({ status: 'DRY_RUN', selected: jobs.slice(0, configured.max_jobs_per_run).map(j => ({ job_id: j.input.job_id, kind: j.input.job_type })), eligible: jobs.length, api_calls: 0 }));
  } else {
    if (process.env.WOEK_API_PROCESSOR_ENABLED !== 'true' || configured.enabled !== true) throw Error('API_EDITORIAL_PROCESSOR_DISABLED');
    const tokenFile = path.join(directory, 'api-worker-token');
    if (fs.statSync(tokenFile).mode & 0o077) throw Error('API_EDITORIAL_TOKEN_NOT_PRIVATE');
    const token = fs.readFileSync(tokenFile, 'utf8').trim();
    if (!token) throw Error('API_EDITORIAL_TOKEN_REQUIRED');
    const base = 'http://127.0.0.1:8787/api/news-analysis/editorial-jobs';
    const request = async (suffix, body) => {
      const response = await fetch(base + suffix, { method: body ? 'POST' : 'GET', redirect: 'error',
        signal: AbortSignal.timeout(body ? 195000 : 10000),
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}) });
      if (response.status === 404) return null;
      if (!response.ok) throw Error('API_EDITORIAL_HTTP_' + response.status);
      const result = await response.json(); return suffix === '/health' ? result : result.job;
    };
    const api = { health: () => request('/health'), get: key => request('/' + key), submit: input => request('', input) };
    const transport = new DropboxTransport({ credentials: loadDropboxCredentials(path.join(directory, 'dropbox.json'), root) });
    const receipt = await apiProcessorPreflight(transport, api, now());
    const processor = new ApiEditorialProcessor({ store, transport, api, knowledge: editorialKnowledge(root), now });
    const results = [], started = Date.now(); let attempted = 0;
    for (const selected of jobs) {
      if (attempted >= configured.max_jobs_per_run || Date.now() - started > 600000) break;
      try {
        const result = await processor.process(store.get(selected.input.job_id), receipt); results.push(result);
        if (result.provider_attempts > 0 || !['already_processed','already_delivered','claimed_elsewhere','excluded','repair_exhausted','legacy_claim_attention','unknown'].includes(result.status)) attempted++;
        if (['budget_blocked', 'busy'].includes(result.status)) break;
      } catch (error) {
        attempted++;
        results.push({ job_id: selected.input.job_id, status: 'attention', code: /^[A-Z_0-9:.-]+$/.test(error.message) ? error.message : 'API_EDITORIAL_FAILED' });
      }
    }
    const report = { actor: 'oracle_api', at: now(), status: results.some(r => ['attention','unknown','failed','repair_exhausted','legacy_claim_attention','claim_unknown','budget_blocked'].includes(r.status)) ? 'ATTENTION' : 'RUN_COMPLETED',
      delivered: results.filter(r => r.status === 'output_delivered').length, results };
    store.observe('api-processor-health', report);
    console.log(JSON.stringify(report));
  }
} finally { store.close(); lock.exec('ROLLBACK'); lock.close(); }
