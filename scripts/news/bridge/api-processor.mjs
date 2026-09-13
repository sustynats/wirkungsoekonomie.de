import { randomUUID } from 'node:crypto';
import { hash, JOB_ID, bridgePath, parsePacket, outputSchema } from './contract.mjs';
import { semanticOutputSchema } from './semantic-review.mjs';
import { EDITORIAL_REQUEST_CONTRACT_V4 } from './intake-processing.mjs';
import { validateEditorialPreview } from './editorial-approval.mjs';
import { apiRequestKey, API_EDITORIAL_PROTOCOL, validateApiRequest } from './api-service.mjs';
import { processorPriority, isHistoricalJob } from './processor.mjs';
import { latestEvidenceTime } from '../discovery-admission.mjs';

// Keep the deep MPD schema last so it cannot swallow the remaining article
// fields. Reordering preserves every field, rule and immutable source byte.
export function orderNativePrompt(prompt) {
  let untrusted = false;
  return prompt.split('\n').map(line => {
    if (line === 'UNTRUSTED_SOURCE_DATA_BEGIN') untrusted = true;
    if (untrusted) return line;
    if (!line.startsWith('{"analyses":')) return line;
    const schema = JSON.parse(line);
    schema.analyses = schema.analyses.map(({ impact_assessment, ...article }) => ({ ...article, impact_assessment }));
    return JSON.stringify(schema);
  }).join('\n');
}

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
  const prompt = kind === 'news' && original.wirkungsticker?.analysis_prompt ? [
    orderNativePrompt(original.wirkungsticker.analysis_prompt),
    'TRANSPORT: Nur das oben definierte native Objekt {analyses:[...]} zurückgeben. Keine Bridge-Hülle, keine zusätzlichen facts/story/editorial/wirkungsticker-Felder. Die Software verpackt die Analyse nachträglich. Ablehnungen im oben definierten kurzen rejection-Format.',
    'NESTING: publication_gate, importance, impact_potential, mechanisms, first_order, second_order, third_order, transformation_potential, resilience, side_effects, uncertainties, evidence_level, attribution, watch_next, reference_frameworks, visuals und media_impact sind Geschwister von impact_assessment im analyses-Eintrag. Sie gehören NICHT in impact_assessment.',
    'PRÜFUNG: analyses[0].systemic_relevance ist ein eigener begründender String, zusätzlich zum strukturierten impact_assessment.systemic_relevance. publication_recommendation:true ist mit news_value:context_only unvereinbar. Ein neues belegtes Ereignis kann new_evidence sein; reine Einordnung ohne neue Tatsachen wird kurz abgelehnt. summary genau zwei Sätze. Ex-ante-Folgen als bedingtes Potenzial formulieren und vom beobachteten Anlass trennen.',
    'QUELLENGATE: Zwei unabhängige Quellen sind KEINE allgemeine Veröffentlichungsvoraussetzung. Eine verlässliche Einzelquelle kann einen klar zugeschriebenen neuen Ereigniskern als initial/preliminary und single_source_claim tragen. Bestätigt/confirmed_claim ist etwas anderes. Nicht nur wegen fehlender unabhängiger Bestätigung ablehnen; benenne bei HOLD die konkret unzureichend belegte Kernbehauptung oder den fehlenden materiellen Nachrichtenwert. Bei strittigen schweren Vorwürfen und requires_corroboration bleiben Originalbeleg und unabhängige Prüfung erforderlich. Keine fehlenden Tatsachen ergänzen, nur um eine Textlänge zu erreichen.',
    ...(packet.original_input ? ['VALIDATOR_FEEDBACK: ' + JSON.stringify({ validation_errors: packet.validation_errors, attempt: packet.correction_attempt, prior_output: priorOutput })] : []),
  ].join('\n\n') : JSON.stringify({
    task: 'Erzeuge eine vollständige neue Ausgabe für diesen unveränderten Rechercheauftrag. Keine Tools aufrufen. Keine Veröffentlichung oder Freigabe ausführen.',
    ...(kind === 'review' ? { review_scope: 'Prüfe das modellierte Wirkungspotenzial, nicht ob eine vorgeschlagene Maßnahme bereits umgesetzt wurde. Unabhängiger Fachpass bedeutet unabhängiges Prüfurteil; es ist keine pauschale Zwei-Quellen-Pflicht. Eine korrekt zugeschriebene vorläufige Meldung kann auf einer verlässlichen Einzelquelle beruhen. confirmed_claim und schwere strittige Vorwürfe brauchen die jeweils strengeren Belege. Fehlender Beschluss, unbekannte Konditionen oder fehlende gemessene Folgen dürfen eine korrekt als Vorschlag und ex ante bezeichnete Analyse nicht allein blockieren. institutional_status prüft die zutreffende Bezeichnung des realen Status, nicht das Vorliegen einer endgültigen Entscheidung. magnitude prüft Faktoren, Wirkungsraum und Berechnung; geringe Evidenz gehört nach evidence und darf nicht mit Tragweite vermischt werden. Keine Quellen erfinden. Echte Beleglücken, unbedingte Behauptungen oder fehlerhafte Pfade bleiben Sperrgründe; korrigiere den Assessment-Entwurf nur quellengebunden.' } : {}),
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
  if (kind === 'news' && Array.isArray(output.analyses)) output = wrapNativeNewsOutput(output, original);
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

// The established analysis prompt returns {analyses:[...]}. Convert that native
// result into the existing transport envelope without asking a model to repeat
// every fact and paragraph. All editorial values are copied, never re-scored.
// The unchanged importer still validates the native analysis and second pass.
export function wrapNativeNewsOutput(output, original) {
  if (output.analyses.length !== 1 || output.analyses[0]?.story_id !== original.wirkungsticker?.story_id) throw Error('BRIDGE_ANALYSIS_BINDING_MISMATCH');
  const a = structuredClone(output.analyses[0]), publish = a.publication_recommendation;
  // Recognize only unambiguous native siblings sometimes placed one level too
  // deep by the model. No score, source, text or review decision is invented.
  // Keep the original raw response and nested copy as audit evidence.
  for (const field of ['publication_gate','importance','impact_potential','impact_risks','mechanisms','first_order','second_order','third_order','transformation_potential','resilience','side_effects','uncertainties','evidence_level','attribution','watch_next','reference_frameworks','visuals','media_impact']) {
    if (!(field in a) && a.impact_assessment && field in a.impact_assessment) a[field] = structuredClone(a.impact_assessment[field]);
  }
  if (typeof publish !== 'boolean') throw Error('API_EDITORIAL_NATIVE_DECISION_REQUIRED');
  const reason = publish ? a.publication_gate?.rationale : a.rejection?.reason || a.publication_gate?.rationale;
  if (typeof reason !== 'string' || !reason.trim()) throw Error('API_EDITORIAL_NATIVE_REASON_REQUIRED');
  const string = v => typeof v === 'string' ? v : '';
  const list = v => Array.isArray(v) ? v : [];
  const claims = list(a.event_claims);
  const dimensions = Object.fromEntries(['human','planet','democracy'].map(key => {
    const d = a.impact_assessment?.dimensions?.[key];
    return [key, { direction: string(d?.direction) || 'not_assessed', analysis: string(d?.rationale) || reason,
      evidence: string(d?.evidence) || 'not_assessable' }];
  }));
  return {
    schema_version: output.schema_version, job_id: output.job_id, input_hash: output.input_hash, processed_at: output.processed_at,
    decision: { status: publish ? 'publish' : !a.rejection?.code || a.rejection.code === 'insufficient_evidence' ? 'hold' : 'reject', reason, merge_into: null, priority: 50 },
    story: { headline: original.event?.canonical_title || '', subheadline: '', short_summary: string(a.summary),
      detailed_summary: string(a.source_summary), what_happened: string(a.source_summary), why_it_matters: string(a.why_relevant) },
    facts: { confirmed: claims.filter(c => c.status === 'confirmed_claim'), uncertain: claims.filter(c => c.status === 'uncertain_claim'), contradictions: [], missing_information: list(a.uncertainties) },
    fact_check: { status: string(a.news_status) || 'not_assessed', summary: string(a.attribution), claims },
    consequence_check: { direct: list(a.first_order), second_order: list(a.second_order), third_order: list(a.third_order), time_horizon: [] },
    impact: { ...dimensions, net_assessment: string(a.impact_potential), uncertainty: list(a.uncertainties).join(' ') || reason },
    frame_check: { relevant: Boolean(a.media_impact), frames: [], resonance_risks: [], notes: '' },
    sources: original.sources.map(s => ({ source_id: s.source_id, url: s.url })),
    editorial: { category: original.event?.category || '', tags: [], location: null, people: [], organisations: [], publishable: publish },
    quality: { source_quality: string(a.publication_gate?.evidence_basis) || 'not_assessed', evidence_strength: string(a.evidence_level) || 'not_assessed', needs_human_review: false, warnings: [] },
    wirkungsticker: { analysis: a },
    ...(output.research_sources ? { research_sources: output.research_sources } : {}),
  };
}

export function selectApiJobs(jobs, now, { maxJobs = 5, maxNewsAgeHours = 6, excludedIds = [] } = {}) {
  // Finish the independent gate for current prepared news before opening more
  // new drafts. Otherwise a constant inflow can starve actual publication.
  const priority = job => job.input?.job_type === 'impact_semantic_review' ? 595 : job.status === 'correction_pending' ? 585 : processorPriority(job, now);
  return jobs.filter(job => {
    const input = job.input || job;
    if (job.ack || job.accepted || ['quarantined', 'archive_failed'].includes(job.status)
      || !JOB_ID.test(input.job_id || '') || excludedIds.includes(input.job_id) || isHistoricalJob(job)) return false;
    let kind; try { kind = apiJobKind(input); } catch { return false; }
    if (kind === 'personal') return true;
    const evidence = latestEvidenceTime(job.candidate || input.record || input, now);
    return Number.isFinite(evidence) && evidence <= Date.parse(now) + 300000
      && evidence >= Date.parse(now) - maxNewsAgeHours * 3600000;
  }).sort((a, b) => priority(b) - priority(a)
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
  // Keep immutable proof, but do not let daily probes fill the live output
  // folder until its bounded listing stops the entire publication pipeline.
  await transport.move(probePath, bridgePath('95_LOGS', `preflight-api-${runId}.probe.json`));
  receipt.write_ok = true;
  const capability = await api.health();
  if (capability.protocol !== API_EDITORIAL_PROTOCOL || capability.enabled !== true || capability.budget_guards !== true) throw Error('API_EDITORIAL_ENDPOINT_UNAVAILABLE');
  receipt.status = 'PASS';
  await transport.writeAtomic(bridgePath('95_LOGS', `processor-api-preflight-${runId}.json`), receipt);
  return receipt;
}

export class ApiEditorialProcessor {
  constructor({ store, transport, api, knowledge, preflightOutput = () => {}, now = () => new Date().toISOString() }) {
    Object.assign(this, { store, transport, api, knowledge, preflightOutput, now });
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
    // A previously completed response remains recoverable after a transport
    // encoder update, but source packet and leading methodology must match.
    let recovered;
    if (ownership && ownership.key !== request.key) {
      recovered = await this.api.get(ownership.key);
      if (recovered?.status !== 'completed' || recovered.packet_hash !== request.packet_hash
        || ![request.profile_hash, ...(this.knowledge.compatibleHashes || [])].includes(recovered.profile_hash)) return { status: 'legacy_claim_attention', job_id: id };
    }
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
    let attemptRequest = request, result, output, providerAttempts = 0;
    // A malformed response is repaired at most twice, using the immutable
    // packet and validator feedback. The API also caps ALL paid attempts per
    // job, including later importer corrections, at three. GET recovers every
    // completed attempt; a retry of this loop never buys the same attempt twice.
    for (;;) {
      result = recovered || await this.api.get(attemptRequest.key); recovered = null;
      if (!result || result.status === 'budget_blocked' && result.provider_called === false) {
        result = await this.api.submit(attemptRequest);
        if (result.provider_called !== false) providerAttempts++;
      }
      const resultKey = result.key || attemptRequest.key;
      this.store.observe(`api-result:${resultKey}`, { job_id: id, key: resultKey, at: this.now(), status: result.status, usage: result.usage || null });
      let validationError;
      if (result.status === 'completed') {
        if (result.output?.job_id !== id || result.output?.input_hash !== request.input_hash) throw Error('BRIDGE_JOB_BINDING_MISMATCH');
        try {
          output = validateApiOutput(result.output, packet, this.now());
          await this.preflightOutput(output, current, this.now());
          // One bounded clarification of a provisional negative review. This
          // never flips a verdict: the model must re-examine its actual reasons;
          // a remaining negative verdict is delivered unchanged as a HOLD.
          if (request.kind === 'review' && attemptRequest.attempt === 0 && output.review.status !== 'ready') {
            throw Object.assign(Error('API_EDITORIAL_REVIEW_CLARIFICATION_REQUIRED'), { issues: [
              'Prüfe deine Sperrgründe noch einmal am review_scope. Ein Vorschlag braucht keinen Umsetzungsnachweis; Tragweite ist nicht Evidenz. Behebe behebbaren Assessment-Fehler. Verbleibende echte Fehler und fehlende Belege ausdrücklich beibehalten, niemals automatisch PASS setzen.',
            ] });
          }
          break;
        }
        catch (error) {
          validationError = [String(error.message), ...(error.issues || [])].join('\n').slice(0, 6000);
          this.store.observe(`api-validation:${resultKey}`, {job_id:id,key:resultKey,at:this.now(),error:validationError});
        }
      } else if (result.status === 'failed' && ['api_editorial_invalid_json', 'api_editorial_incomplete'].includes(result.error)) validationError = result.error;
      else return { job_id: id, status: result.status, provider_attempts: providerAttempts };
      if (attemptRequest.attempt >= 2) return { job_id: id, status: 'repair_exhausted', provider_attempts: providerAttempts };
      attemptRequest = { ...request, attempt: attemptRequest.attempt + 1,
        prompt: JSON.stringify({ assignment: request.prompt, repair: {
          attempt: attemptRequest.attempt + 1, validation_error: validationError,
          prior_output: result.output || null, instruction: 'Behebe diese konkreten Formatfehler. Quellenbindung und inhaltliche Qualitätsanforderungen bleiben unverändert. Vollständiges JSON liefern.' } }) };
      attemptRequest.key = apiRequestKey(attemptRequest); validateApiRequest(attemptRequest);
    }
    const latest = this.store.get(id);
    if (latest.ack || latest.accepted) return { status: 'already_processed', job_id: id };
    if (await this.transport.metadata(outputPath)) return { status: 'already_delivered', job_id: id };
    await this.transport.writeAtomic(outputPath, output);
    if (hash(JSON.parse(await this.transport.read(outputPath))) !== hash(output)) throw Error('API_EDITORIAL_DELIVERY_READBACK_FAILED');
    await this.transport.writeAtomic(bridgePath('95_LOGS', `processor-api-${result.key || attemptRequest.key}.json`), {
      actor: 'oracle_api', job_id: id, key: result.key || attemptRequest.key, output_hash: hash(output), delivered_at: this.now(),
      profile_hash: result.profile_hash || request.profile_hash, validated_profile_hash: request.profile_hash, usage: result.usage || null, status: 'OUTPUT_DELIVERED_NOT_PUBLISHED',
    });
    return { status: 'output_delivered', job_id: id, provider_attempts: providerAttempts };
  }
}
