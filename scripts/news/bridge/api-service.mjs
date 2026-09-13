import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, rename, open, readdir } from 'node:fs/promises';
import path from 'node:path';

export const API_EDITORIAL_PROTOCOL = 'woek-editorial-api-1';
const sha = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const ID = /^wt_\d{8}T\d{6}Z_[a-f0-9]{24}$/;
const digest = /^[a-f0-9]{64}$/;
const kinds = ['news', 'review', 'personal'];
export function apiRequestKey(input) {
  const { protocol, job_id, input_hash, packet_hash, kind, attempt, profile_hash, instructions, prompt } = input;
  return sha({ protocol, job_id, input_hash, packet_hash, kind, attempt, profile_hash, instructions, prompt });
}
export function validateApiRequest(input) {
  if (!input || input.protocol !== API_EDITORIAL_PROTOCOL || !ID.test(input.job_id)
    || ![input.input_hash, input.packet_hash, input.profile_hash].every(v => digest.test(v || ''))
    || !kinds.includes(input.kind) || !Number.isInteger(input.attempt) || input.attempt < 0 || input.attempt > 2
    || typeof input.instructions !== 'string' || !input.instructions.trim()
    || typeof input.prompt !== 'string' || !input.prompt.trim()
    || Buffer.byteLength(input.instructions + input.prompt) > 150000
    || !digest.test(input.key || '') || input.key !== apiRequestKey(input)) throw Error('API_EDITORIAL_INPUT_INVALID');
  return input;
}

// This service is mounted INSIDE the existing API process. withBudget must use
// that process's shared account AND news ledgers. No key, budget or publisher is
// created here. The EUR 5/day aspiration is deliberately not an admission gate.
export class EditorialApiService {
  constructor({ directory, apiKey, withBudget, ProviderError, fetchImpl = fetch, now = () => new Date().toISOString() }) {
    if (!path.isAbsolute(directory || '') || !apiKey || typeof withBudget !== 'function' || !ProviderError) throw Error('API_EDITORIAL_CONFIGURATION_REQUIRED');
    Object.assign(this, { directory, apiKey, withBudget, ProviderError, fetch: fetchImpl, now });
    this.active = new Set();
  }
  file(key) { if (!digest.test(key || '')) throw Error('API_EDITORIAL_KEY_INVALID'); return path.join(this.directory, key + '.json'); }
  async get(key) {
    try {
      const record = JSON.parse(await readFile(this.file(key), 'utf8'));
      if (record.key !== key || record.protocol !== API_EDITORIAL_PROTOCOL) throw Error('API_EDITORIAL_JOURNAL_INVALID');
      // A process crash must never cause a second charge for the same attempt.
      return record.status === 'started' && !this.active.has(key) ? { ...record, status: 'unknown', error: 'API_EDITORIAL_INTERRUPTED' } : record;
    } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  }
  async save(record) {
    const file = this.file(record.key), temporary = file + '.tmp';
    const handle = await open(temporary, 'w', 0o600);
    try { await handle.writeFile(JSON.stringify(record) + '\n'); await handle.sync(); } finally { await handle.close(); }
    await rename(temporary, file);
  }
  async submit(input) {
    validateApiRequest(input);
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    const previous = await this.get(input.key);
    if (previous && !(previous.status === 'budget_blocked' && previous.provider_called === false)) return previous;
    // Only one upstream call at a time on the small Oracle host. No in-memory
    // work queue which would be lost on restart; callers keep durable jobs.
    if (this.active.size) return { status: 'busy', provider_called: false };
    const record = { protocol: API_EDITORIAL_PROTOCOL, key: input.key, job_id: input.job_id,
      input_hash: input.input_hash, packet_hash: input.packet_hash, profile_hash: input.profile_hash,
      kind: input.kind, attempt: input.attempt, status: 'started', created_at: this.now(), provider_called: false };
    this.active.add(input.key);
    try {
      // Every kind of correction shares one three-call limit for this job.
      // Unknown outcomes block new keys too, so changing a prompt cannot silently
      // repeat a potentially billed request after a crash or lost response.
      let called = 0;
      for (const file of await readdir(this.directory)) {
        if (!/^[a-f0-9]{64}\.json$/.test(file)) continue;
        const old = await this.get(file.slice(0, -5));
        if (old.job_id !== input.job_id || !old.provider_called) continue;
        if (old.status === 'unknown' || old.status === 'started') return { status: 'unknown', error: 'API_EDITORIAL_JOB_INTERRUPTED', provider_called: false };
        called++;
      }
      if (called >= 3) return { status: 'repair_exhausted', provider_called: false };
      try {
        if (previous) {
          record.previous_budget_refusal_at = previous.updated_at;
          await this.save(record);
        } else await writeFile(this.file(input.key), JSON.stringify(record) + '\n', { mode: 0o600, flag: 'wx' });
      }
      catch (error) { if (error.code === 'EEXIST') return this.get(input.key); throw error; }
      try {
        const result = await this.withBudget(async () => {
          record.provider_called = true; await this.save(record);
          // Fixed priced model: the maximum UTF-8 input bytes plus 24k output
          // tokens fit the existing USD .25 prepaid reservation. No tools,
          // hidden retries, model fallback or unaccounted image/search calls.
          const response = await this.fetch('https://api.openai.com/v1/responses', {
            method: 'POST', redirect: 'error', signal: AbortSignal.timeout(180000),
            headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json', 'X-Client-Request-Id': input.key },
            body: JSON.stringify({ model: 'gpt-5.4-mini', store: false, reasoning: { effort: 'medium' },
              max_output_tokens: 24000, instructions: input.instructions, input: input.prompt,
              text: { format: { type: 'json_object' } } }),
          });
          const raw = await boundedResponse(response);
          record.provider_request_id = response.headers.get('x-request-id');
          record.http_status = response.status;
          // Persist completed provider evidence BEFORE application validation.
          // A lost client connection can GET it without a second generation.
          record.provider_response = raw; await this.save(record);
          const payload = JSON.parse(raw);
          record.response_id = payload.id || null;
          const u = payload.usage, usage = u && { input_tokens: u.input_tokens, output_tokens: u.output_tokens,
            cached_input_tokens: u.input_tokens_details?.cached_tokens ?? 0 };
          const validUsage = usage && Object.values(usage).every(n => Number.isInteger(n) && n >= 0)
            && usage.cached_input_tokens <= usage.input_tokens;
          const evidence = validUsage ? { model: 'gpt-5.4-mini', usage } : undefined;
          record.usage = validUsage ? usage : null;
          record.model = 'gpt-5.4-mini';
          const fail = code => { throw new this.ProviderError('Redaktionelle API-Ausgabe nicht verwendbar.', 502, code, evidence); };
          if (!response.ok) fail('api_editorial_provider_rejected');
          if (payload.status !== 'completed') fail('api_editorial_incomplete');
          const text = (payload.output || []).flatMap(item => item.type === 'message' ? item.content || [] : [])
            .filter(item => item.type === 'output_text').map(item => item.text).join('');
          let output;
          try { output = JSON.parse(text); } catch { fail('api_editorial_invalid_json'); }
          if (!output || Array.isArray(output) || typeof output !== 'object') fail('api_editorial_invalid_json');
          if (output.job_id && output.job_id !== input.job_id || output.input_hash && output.input_hash !== input.input_hash) fail('api_editorial_binding_mismatch');
          // Software-owned bindings/time; no model-generated hashes or approval.
          Object.assign(output, { schema_version: '1.0', job_id: input.job_id, input_hash: input.input_hash, processed_at: this.now() });
          record.output = output;
          return { model: 'gpt-5.4-mini', ...(validUsage ? { usage } : {}) };
        });
        record.status = 'completed'; record.model = result.model;
      } catch (error) {
        const code = error.technicalMessage || '';
        record.error = /^[a-z_]+$/.test(code) ? code : 'API_EDITORIAL_REQUEST_UNKNOWN';
        record.status = !record.provider_called ? 'budget_blocked'
          : record.provider_response ? 'failed' : 'unknown';
      }
      record.updated_at = this.now();
      await this.save(record);
      return record;
    } finally { this.active.delete(input.key); }
  }
}

async function boundedResponse(response) {
  const chunks = []; let bytes = 0;
  for await (const chunk of response.body) {
    bytes += chunk.length; if (bytes > 2 * 1024 * 1024) throw Error('API_EDITORIAL_RESPONSE_TOO_LARGE');
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
}

// Private HTTP responses do not expose the raw provider payload or credentials.
export function publicApiJob(record) {
  if (!record) return null;
  const { provider_response, ...receipt } = record;
  return receipt;
}
