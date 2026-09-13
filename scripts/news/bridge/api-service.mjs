import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, rename, open, readdir } from 'node:fs/promises';
import path from 'node:path';

export const API_EDITORIAL_PROTOCOL = 'woek-editorial-api-1';
const sha = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const ID = /^wt_\d{8}T\d{6}Z_[a-f0-9]{24}$/;
const digest = /^[a-f0-9]{64}$/;
const kinds = ['news', 'review', 'personal'];
// Only close unfinished outer containers after a complete value. No missing
// text, number, property, quote or separator is inferred. Full content gates
// still reject incomplete records; the provider's raw bytes remain immutable.
export function parseEditorialJson(text) {
  try { return JSON.parse(text); } catch {}
  const trimmed = text.trim(), stack = []; let quoted = false, escaped = false;
  if (!trimmed.startsWith('{') || !/[}\]]$/.test(trimmed)) throw Error('API_EDITORIAL_JSON_INVALID');
  for (const char of trimmed) {
    if (quoted) { if (escaped) escaped = false; else if (char === '\\') escaped = true; else if (char === '"') quoted = false; continue; }
    if (char === '"') quoted = true;
    else if (char === '{' || char === '[') stack.push(char === '{' ? '}' : ']');
    else if (char === '}' || char === ']') { if (stack.pop() !== char) throw Error('API_EDITORIAL_JSON_INVALID'); }
  }
  if (quoted || !stack.length || stack.length > 8) throw Error('API_EDITORIAL_JSON_INVALID');
  return JSON.parse(trimmed + stack.reverse().join(''));
}
function rejectedBeforeExecution(record) {
  if (record.http_status !== 400 || !record.provider_response) return false;
  try {
    const value = JSON.parse(record.provider_response);
    return !value.id && !value.usage && value.error?.type === 'invalid_request_error'
      && value.error.message === 'Web Search cannot be used with JSON mode.';
  } catch { return false; }
}
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
    || Buffer.byteLength(input.instructions + input.prompt) > 300000
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
      if (rejectedBeforeExecution(record)) return { ...record, pre_execution_rejected: true };
      if (record.status === 'failed' && ['api_editorial_invalid_json','api_editorial_tool_limit'].includes(record.error) && record.http_status === 200) {
        try {
          const payload = JSON.parse(record.provider_response);
          if (payload.status !== 'completed') return record;
          if (record.error === 'api_editorial_tool_limit'
            && (record.kind !== 'review' || completedSearchCalls(payload) > 2)) return record;
          const text = (payload.output || []).flatMap(item => item.type === 'message' ? item.content || [] : [])
            .filter(item => item.type === 'output_text').map(item => item.text).join('');
          const output = parseEditorialJson(text);
          if (!output || Array.isArray(output) || typeof output !== 'object'
            || output.job_id && output.job_id !== record.job_id || output.input_hash && output.input_hash !== record.input_hash) return record;
          Object.assign(output, {schema_version:'1.0',job_id:record.job_id,input_hash:record.input_hash,processed_at:record.updated_at});
          return {...record,status:'completed',output,transport_recovery:record.error === 'api_editorial_tool_limit'
            ? 'completed_tool_calls_v1' : 'close_outer_containers_v1'};
        } catch { /* Preserve the original failure; never infer missing content. */ }
      }
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
        if (old.job_id !== input.job_id || !old.provider_called || old.pre_execution_rejected) continue;
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
        const researched = input.kind === 'review';
        const model = researched ? 'gpt-5.4-mini' : 'gpt-5.6-luna';
        let researchHosts, responseFormat;
        if (researched) {
          let packet = input.prompt;
          for (let depth=0; depth<3 && typeof packet==='string'; depth++) {
            try { packet=JSON.parse(packet); } catch { break; }
            if (packet?.output_contract?.response_format?.name === 'impact_review_factors_v1') {
              const proposed=packet.output_contract.response_format;
              if (proposed.type !== 'json_schema' || proposed.strict !== true || proposed.schema?.type !== 'object'
                || JSON.stringify(proposed).length>40000) throw Error('API_EDITORIAL_RESPONSE_CONTRACT_INVALID');
              const inspect=value=>{
                if (!value || typeof value!=='object') return;
                if (value.$ref && !/^#\/\$defs\/[a-z_]+$/.test(value.$ref)) throw Error('API_EDITORIAL_RESPONSE_CONTRACT_INVALID');
                if (value.type==='object' && (value.additionalProperties!==false || !Array.isArray(value.required)
                  || Object.keys(value.properties || {}).some(key=>!value.required.includes(key)))) throw Error('API_EDITORIAL_RESPONSE_CONTRACT_INVALID');
                Object.values(value).forEach(inspect);
              };
              inspect(proposed.schema);responseFormat=proposed;
            }
            if (packet?.research_access?.article_candidates) {
              const hosts=packet.research_access.article_candidates;
              if (Array.isArray(hosts) && hosts.length>0 && hosts.length<=100
                && hosts.every(host=>typeof host==='string' && /^(?:[a-z0-9-]+\.)+[a-z]{2,}$/.test(host))) researchHosts=[...new Set(hosts)];
              break;
            }
            packet=packet?.assignment;
          }
        }
        const result = await this.withBudget(async () => {
          record.provider_called = true; await this.save(record);
          // Fixed priced model, no hidden retries/fallback. Ordinary drafting
          // reserves USD .25. A review reserves .50, covering even the model's
          // bounded 300KB input, 48k output and two USD .01 search calls.
          const response = await this.fetch('https://api.openai.com/v1/responses', {
            method: 'POST', redirect: 'error', signal: AbortSignal.timeout(180000),
            headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json', 'X-Client-Request-Id': input.key },
            body: JSON.stringify({ model, store: false, reasoning: { effort: 'medium' },
              max_output_tokens: 48000, instructions: input.instructions, input: input.prompt,
              ...(researched ? { tools: [{ type: 'web_search', search_context_size: 'low',
                ...(researchHosts ? {filters:{allowed_domains:researchHosts}} : {}) }], tool_choice: 'required', max_tool_calls: 2,
                include: ['web_search_call.action.sources'] } : {}),
              text: { format: researched ? responseFormat || { type: 'json_schema', name: 'impact_review', strict: false,
                schema: { type: 'object', properties: { review: {type: 'object'}, impact_assessment: {type: 'object'},
                  research_sources: {type: 'array', items: {type: 'object'}} },
                  required: ['review','impact_assessment'], additionalProperties: true } }
                : { type: 'json_object' } } }),
          });
          const raw = await boundedResponse(response);
          record.provider_request_id = response.headers.get('x-request-id');
          record.http_status = response.status;
          // Persist completed provider evidence BEFORE application validation.
          // A lost client connection can GET it without a second generation.
          record.provider_response = raw; await this.save(record);
          const payload = JSON.parse(raw);
          record.response_id = payload.id || null;
          const searchCalls = (payload.output || []).filter(item => item.type === 'web_search_call').length;
          const u = payload.usage, usage = u && { input_tokens: u.input_tokens, output_tokens: u.output_tokens,
            cached_input_tokens: u.input_tokens_details?.cached_tokens ?? 0, ...(researched ? { web_search_calls: searchCalls } : {}) };
          const validUsage = usage && Object.values(usage).every(n => Number.isInteger(n) && n >= 0)
            && usage.cached_input_tokens <= usage.input_tokens;
          const evidence = validUsage ? { model, usage } : undefined;
          record.usage = validUsage ? usage : null;
          record.model = model;
          const fail = code => { throw new this.ProviderError('Redaktionelle API-Ausgabe nicht verwendbar.', 502, code, evidence); };
          if (!response.ok) fail('api_editorial_provider_rejected');
          // max_tool_calls can leave a nonexecuted "searching" placeholder in a
          // completed response. Count completed operations for the execution
          // limit, while conservatively accounting every reported call above.
          if (completedSearchCalls(payload) > (researched ? 2 : 0)) fail('api_editorial_tool_limit');
          if (payload.status !== 'completed') fail('api_editorial_incomplete');
          const text = (payload.output || []).flatMap(item => item.type === 'message' ? item.content || [] : [])
            .filter(item => item.type === 'output_text').map(item => item.text).join('');
          let output;
          try { output = parseEditorialJson(text); } catch { fail('api_editorial_invalid_json'); }
          if (!output || Array.isArray(output) || typeof output !== 'object') fail('api_editorial_invalid_json');
          if (output.job_id && output.job_id !== input.job_id || output.input_hash && output.input_hash !== input.input_hash) fail('api_editorial_binding_mismatch');
          // Software-owned bindings/time; no model-generated hashes or approval.
          Object.assign(output, { schema_version: '1.0', job_id: input.job_id, input_hash: input.input_hash, processed_at: this.now() });
          record.output = output;
          return { model, ...(validUsage ? { usage } : {}) };
        }, researched ? 0.5 : 0.25);
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

function completedSearchCalls(payload) {
  return (payload.output || []).filter(item => item.type === 'web_search_call'
    && !['searching','in_progress','failed'].includes(item.status)).length;
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
