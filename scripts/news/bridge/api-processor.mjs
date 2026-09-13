import { randomUUID } from 'node:crypto';
import { hash, JOB_ID, bridgePath, parsePacket, outputSchema } from './contract.mjs';
import { semanticOutputSchema } from './semantic-review.mjs';
import { EDITORIAL_REQUEST_CONTRACT_V4 } from './intake-processing.mjs';
import { validateEditorialPreview } from './editorial-approval.mjs';
import { apiRequestKey, API_EDITORIAL_PROTOCOL, validateApiRequest } from './api-service.mjs';
import { processorPriority, isHistoricalJob } from './processor.mjs';
import { latestEvidenceTime } from '../discovery-admission.mjs';

export function apiJobKind(packet) {
  const original = packet.original_input || packet;
  if (['new_story', 'story_update', 'correction'].includes(original.job_type)) return 'news';
  if (original.job_type === 'impact_semantic_review') return 'review';
  if (original.job_type === 'editorial_request') return 'personal';
  // The old editorial_analysis importer publishes directly. Never route
  // personal topics there. They must use the existing approval intake first.
  throw Error('API_EDITORIAL_JOB_UNSUPPORTED');
}
export function prepareApiJob(packet, knowledge, { priorOutput = null } = {}) {
  const original = packet.original_input || packet, kind = apiJobKind(packet);
  const contract = kind === 'news' ? { output_schema: outputSchema }
    : kind === 'review' ? { output_schema: semanticOutputSchema, requested_output: original.requested_output }
      : EDITORIAL_REQUEST_CONTRACT_V4;
  const prompt = JSON.stringify({
    task: 'Erzeuge eine vollständige neue Ausgabe für diesen unveränderten Rechercheauftrag. Keine Tools aufrufen. Keine Veröffentlichung oder Freigabe ausführen.',
    output_contract: contract,
    assignment: original,
    ...(packet.original_input ? { repair: { validation_errors: packet.validation_errors, attempt: packet.correction_attempt, prior_output: priorOutput } } : {}),
    binding_rule: 'job_id, input_hash, schema_version und processed_at setzt der Server. Keine anderen Bindungen oder Quellen-IDs verändern. Eine native News-Analyse steht einmal unter wirkungsticker.analysis, nicht in einem analyses-Array. Keine technischen Zusatzfelder im Output.',
  });
  const request = { protocol: API_EDITORIAL_PROTOCOL, job_id: original.job_id, input_hash: original.input_hash,
    packet_hash: hash(packet), kind, attempt: packet.correction_attempt || 0, profile_hash: knowledge.hash,
    instructions: knowledge.instructions, prompt };
  request.key = apiRequestKey(request);
  return validateApiRequest(request);
}
export function validateApiOutput(output, packet, now) {
  const original = packet.original_input || packet, kind = apiJobKind(packet);
  const schema = kind === 'news' ? outputSchema : kind === 'review' ? semanticOutputSchema
    : output.disposition === 'hold' ? EDITORIAL_REQUEST_CONTRACT_V4.hold_output_schema : EDITORIAL_REQUEST_CONTRACT_V4.output_schema;
  parsePacket(JSON.stringify(output), schema);
  if (output.job_id !== original.job_id || output.input_hash !== original.input_hash) throw Error('BRIDGE_JOB_BINDING_MISMATCH');
  if (!Number.isFinite(Date.parse(output.processed_at)) || Date.parse(output.processed_at) < Date.parse(original.created_at)
    || Date.parse(output.processed_at) > Date.parse(now) + 300000) throw Error('BRIDGE_OUTPUT_TIME_INVALID');
  if (kind === 'personal' && output.preview) {
    if (output.preview.format !== original.request.kind) throw Error('EDITORIAL_PREVIEW_INPUT_CHANGED');
    // News intake has a separate factual preparation gate before its preview.
    if (output.preview.format !== 'news') validateEditorialPreview(output.preview);
  }
  return output;
}

export function selectApiJobs(jobs, now, { maxJobs = 5, maxNewsAgeHours = 6, excludedIds = [] } = {}) {
  return jobs.filter(job => {
    const input = job.input || job;
    if (job.ack || job.accepted || ['quarantined', 'archive_failed'].includes(job.status)
      || !JOB_ID.test(input.job_id || '') || excludedIds.includes(input.job_id) || isHistoricalJob(job)) return false;
    let kind; try { kind = apiJobKind(input); } catch { return false; }
    if (kind === 'personal') return true;
    const evidence = latestEvidenceTime(job.candidate || input.record || input, now);
    return Number.isFinite(evidence) && evidence <= Date.parse(now) + 300000
      && evidence >= Date.parse(now) - maxNewsAgeHours * 3600000;
  }).sort((a, b) => processorPriority(b, now) - processorPriority(a, now)
    || latestEvidenceTime(b.candidate || b.input, now) - latestEvidenceTime(a.candidate || a.input, now)
    || a.input.job_id.localeCompare(b.input.job_id)).slice(0, maxJobs);
}

// Unlike ChatGPT's connector attestation this explicitly attests an Oracle API
// producer. Read/write proof cannot be reused to pretend a chat has Dropbox.
export async function apiProcessorPreflight(transport, api, now) {
  const runId = randomUUID();
  const receipt = { actor: 'oracle_api', run_id: runId, at: now, status: 'UNAVAILABLE', reads: {}, write_ok: false };
  for (const folder of ['98_CONFIG', '00_INBOX', '10_CLAIMED', '20_OUTPUT_READY', '30_ACK']) {
    if (!Array.isArray(await transport.list(folder))) throw Error('API_EDITORIAL_BRIDGE_UNAVAILABLE');
    receipt.reads[folder] = true;
  }
  const probePath = bridgePath('20_OUTPUT_READY', `preflight-api-${runId}.probe.json`);
  const probe = { actor: 'oracle_api', run_id: runId, purpose: 'transport_preflight_only', at: now };
  await transport.writeAtomic(probePath, probe);
  if (hash(JSON.parse(await transport.read(probePath))) !== hash(probe)) throw Error('API_EDITORIAL_PREFLIGHT_READBACK_FAILED');
  receipt.write_ok = true;
  const capability = await api.health();
  if (capability.protocol !== API_EDITORIAL_PROTOCOL || capability.enabled !== true || capability.budget_guards !== true) throw Error('API_EDITORIAL_ENDPOINT_UNAVAILABLE');
  receipt.status = 'PASS';
  await transport.writeAtomic(bridgePath('95_LOGS', `processor-api-preflight-${runId}.json`), receipt);
  return receipt;
}

export class ApiEditorialProcessor {
  constructor({ store, transport, api, knowledge, now = () => new Date().toISOString() }) {
    Object.assign(this, { store, transport, api, knowledge, now });
  }
  async process(job, receipt) {
    const at = this.now(), age = Date.parse(at) - Date.parse(receipt?.at);
    if (receipt?.actor !== 'oracle_api' || receipt.status !== 'PASS' || !receipt.write_ok || age < 0 || age > 1800000) throw Error('API_EDITORIAL_PREFLIGHT_REQUIRED');
    const id = job.input.job_id;
    // Access-blocked ChatGPT files/outputs are not eligible for retransmission.
    // The exclusion is persisted by operators in the private observation log.
    if (this.store.observation(`api-excluded:${id}`)) return { status: 'excluded', job_id: id };
    const current = this.store.get(id);
    if (!current || current.ack || current.accepted) return { status: 'already_processed', job_id: id };
    const outputPath = bridgePath('20_OUTPUT_READY', `${id}.output.json`);
    if (await this.transport.metadata(outputPath) || await this.transport.metadata(bridgePath('30_ACK', `${id}.ack.json`))) return { status: 'already_delivered', job_id: id };
    const repair = current.corrections?.at(-1);
    const name = current.status === 'correction_pending' && repair ? `${id}.repair-${repair.attempt}.json` : `${id}.input.json`;
    const sourcePath = bridgePath('00_INBOX', name), claimPath = bridgePath('10_CLAIMED', name);
    let ownership = this.store.observation(`api-claim:${name}`);
    if (await this.transport.metadata(claimPath) && ownership?.state !== 'claimed') return { status: 'claimed_elsewhere', job_id: id };
    const packet = JSON.parse(await this.transport.read(await this.transport.metadata(claimPath) ? claimPath : sourcePath));
    if (packet.job_id !== id || packet.input_hash !== current.input.input_hash) throw Error('BRIDGE_JOB_BINDING_MISMATCH');
    const priorOutput = packet.original_output_path ? JSON.parse(await this.transport.read(packet.original_output_path)) : null;
    const request = prepareApiJob(packet, this.knowledge, { priorOutput });
    if (ownership && ownership.key !== request.key) throw Error('API_EDITORIAL_CLAIM_CHANGED');
    if (!ownership) {
      ownership = { job_id: id, key: request.key, packet_hash: hash(packet), claim_path: claimPath, claimed_at: at, actor: 'oracle_api', state: 'intent' };
      this.store.observe(`api-claim:${name}`, ownership);
      try { await this.transport.move(sourcePath, claimPath); }
      catch { return { status: 'claim_unknown', job_id: id }; }
      // Identical content after an ambiguous move does not prove who claimed
      // it. Only the successful atomic MOVE response establishes ownership.
      ownership.state = 'claimed'; this.store.observe(`api-claim:${name}`, ownership);
    }
    if (ownership.state !== 'claimed') return { status: 'claim_unknown', job_id: id };
    if (hash(JSON.parse(await this.transport.read(claimPath))) !== request.packet_hash) throw Error('API_EDITORIAL_CLAIM_CHANGED');
    let attemptRequest = request, result, output;
    // A malformed response is repaired at most twice, using the immutable
    // packet and validator feedback. The API also caps ALL paid attempts per
    // job, including later importer corrections, at three. GET recovers every
    // completed attempt; a retry of this loop never buys the same attempt twice.
    for (;;) {
      result = await this.api.get(attemptRequest.key);
      if (!result || result.status === 'budget_blocked' && result.provider_called === false) result = await this.api.submit(attemptRequest);
      this.store.observe(`api-result:${attemptRequest.key}`, { job_id: id, key: attemptRequest.key, at: this.now(), status: result.status, usage: result.usage || null });
      let validationError;
      if (result.status === 'completed') {
        if (result.output?.job_id !== id || result.output?.input_hash !== request.input_hash) throw Error('BRIDGE_JOB_BINDING_MISMATCH');
        try { output = validateApiOutput(result.output, packet, this.now()); break; }
        catch (error) { validationError = String(error.message).slice(0, 6000); }
      } else if (result.status === 'failed' && ['api_editorial_invalid_json', 'api_editorial_incomplete'].includes(result.error)) validationError = result.error;
      else return { job_id: id, status: result.status };
      if (attemptRequest.attempt >= 2) return { job_id: id, status: 'repair_exhausted' };
      attemptRequest = { ...request, attempt: attemptRequest.attempt + 1,
        prompt: JSON.stringify({ assignment: JSON.parse(request.prompt), repair: {
          attempt: attemptRequest.attempt + 1, validation_error: validationError,
          prior_output: result.output || null, instruction: 'Behebe diese konkreten Formatfehler. Quellenbindung und inhaltliche Qualitätsanforderungen bleiben unverändert. Vollständiges JSON liefern.' } }) };
      attemptRequest.key = apiRequestKey(attemptRequest); validateApiRequest(attemptRequest);
    }
    const latest = this.store.get(id);
    if (latest.ack || latest.accepted) return { status: 'already_processed', job_id: id };
    if (await this.transport.metadata(outputPath)) return { status: 'already_delivered', job_id: id };
    await this.transport.writeAtomic(outputPath, output);
    if (hash(JSON.parse(await this.transport.read(outputPath))) !== hash(output)) throw Error('API_EDITORIAL_DELIVERY_READBACK_FAILED');
    await this.transport.writeAtomic(bridgePath('95_LOGS', `processor-api-${attemptRequest.key}.json`), {
      actor: 'oracle_api', job_id: id, key: attemptRequest.key, output_hash: hash(output), delivered_at: this.now(),
      profile_hash: request.profile_hash, usage: result.usage || null, status: 'OUTPUT_DELIVERED_NOT_PUBLISHED',
    });
    return { status: 'output_delivered', job_id: id };
  }
}
