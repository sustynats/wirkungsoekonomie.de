import { verifyImpactResearch, researchSourceSchema } from './impact-research.mjs';
import { hash, bridgePath, parsePacket } from './contract.mjs';
import { IMPACT_VERSION, IMPACT_CONTRACT_FILE, IMPACT_RULE, IMPACT_SCHEMA, IMPACT_DEFS } from '../impact-assessment.mjs';
import { POTENTIAL_REVISION } from '../impact-potential.mjs';
import { derivePublicationStatus, semanticIssues, structuredSemanticChecks, SEMANTIC_CHECKS } from '../impact-publication.mjs';

export const SEMANTIC_JOB_TYPE = 'impact_semantic_review';
const terminal = new Set(['acknowledged', 'quarantined', 'archive_failed']);
export const semanticOutputSchema = {
  type: 'object', additionalProperties: false, required: ['schema_version', 'job_id', 'input_hash', 'processed_at', 'review', 'impact_assessment'],
  properties: {
    research_sources: researchSourceSchema,
    schema_version: { const: '1.0' }, job_id: { type: 'string', pattern: '^wt_\\d{8}T\\d{6}Z_[a-f0-9]{24}$' },
    input_hash: { type: 'string', pattern: '^[a-f0-9]{64}$' }, processed_at: { type: 'string', format: 'date-time' },
    review: { type: 'object', additionalProperties: false, required: ['status', 'checks', 'findings'], properties: {
      status: { enum: ['ready', 'needs_review', 'blocked'] }, checks: { type: 'object', additionalProperties: false,
        required: SEMANTIC_CHECKS, properties: Object.fromEntries(SEMANTIC_CHECKS.map(key => [key, {
          type: 'object', additionalProperties: false, required: ['status','rationale'], properties: {
            status: { enum: ['pass','fail'] }, rationale: { type: 'string', minLength: 12, maxLength: 3000 },
          },
        }])) }, findings: { type: 'array', maxItems: 50, items: { type: 'string', maxLength: 3000 } },
    } }, impact_assessment: { type: 'object' },
  },
};

export async function ensureSemanticReview(bridge, job, output, record, proposed, now) {
  const outputHash = hash(output), receipt = job.semantic_review;
  if (output.research_sources?.length) {
    if (job.verified_research?.output_hash !== outputHash) {
      try {
        const sources = await verifyImpactResearch(bridge, output.research_sources, [...(record.sources || record.source_snapshot || []), ...(record.impact_sources || [])], now);
        job.verified_research = {output_hash:outputHash,sources}; await bridge.store.put(job);
      } catch (error) { throw Object.assign(Error('BRIDGE_PUBLICATION_GATE_FAILED'), {issues:[error.message]}); }
    }
    record = {...record,impact_sources:[...(record.impact_sources||[]),...job.verified_research.sources]};
  }
  if (receipt?.output_hash === outputHash && receipt?.research_sources?.length) record = {...record,impact_sources:[...(record.impact_sources||[]),...receipt.research_sources]};
  if (receipt?.output_hash === outputHash && receipt.assessment?.version === IMPACT_VERSION
    && receipt.assessment.semantics_revision === POTENTIAL_REVISION && structuredSemanticChecks(receipt.review)) {
    const gate = derivePublicationStatus(receipt.assessment, record, { review: receipt.review, secondPassComplete: true });
    job.publication_gate = gate; await bridge.store.put(job);
    return { ...gate, assessment: receipt.assessment, receipt, record };
  }
  // Old acknowledgments remain immutable. A malformed legacy check list gets
  // a new, protocol-bound review job; it never becomes an editorial approval.
  const reviewRecord = { title: record.title, source_summary: record.source_summary || record.research_summary || '',
        analysis: record.analysis || { sections: record.sections, claim_ledger: record.claim_ledger },
        sources: [...(record.sources || record.source_snapshot || []), ...(record.impact_sources || [])].map(s => ({ source_id: s.source_id, url: s.url, title: s.title, publisher: s.publisher, excerpt: s.article_excerpt || s.summary || '', source_role: s.source_role || s.source_function || null })) };
  // Only editorial content belongs in the identity. Discovery check timestamps
  // and other operational fields must not create a new review every five minutes.
  const existing = (await bridge.store.all()).find(j => j.input.job_type === SEMANTIC_JOB_TYPE
    && !terminal.has(j.status) && j.input.review_protocol === "impact-2.1-potential-1"
    && j.input.parent_job_id === job.input.job_id && j.input.parent_output_hash === outputHash
    && hash(j.input.record) === hash(reviewRecord) && hash(j.input.proposed_assessment) === hash(proposed));
  const inputHash = hash({ protocol: 'impact-2.1-potential-1', parent: job.input.job_id, outputHash, assessment: proposed, record: reviewRecord });
  const id = existing?.input.job_id || `${job.input.job_id.slice(0, 20)}${hash({ kind: SEMANTIC_JOB_TYPE, inputHash }).slice(0, 24)}`;
  let reviewJob = await bridge.store.get(id);
  if (!reviewJob) {
    const input = {
      schema_version: '1.0', job_id: id, job_type: SEMANTIC_JOB_TYPE, input_hash: inputHash, created_at: now, test_only: job.input.test_only,
      processing_mode: 'dropbox_chatgpt_bridge', contract_path: bridgePath('98_CONFIG', IMPACT_CONTRACT_FILE),
      impact_version: IMPACT_VERSION, semantics_revision: POTENTIAL_REVISION,
      parent_job_id: job.input.job_id, parent_output_hash: outputHash,
      instructions: `Unabhängiger zweiter fachlicher Prüfpass: Beurteile Quellen und Wirkungsmetadaten neu, ohne die Entscheidung des ersten Autors zu übernehmen. ${IMPACT_RULE} Prüfe auch Quelle gegen Zusammenfassung, Überzeichnung, unterschlagene Gegenpfade und begründete Nichtkompensation. Eine amtliche Einstufung ist kein Verbot und ein Programm kein Folgenbeweis. Korrigiere ausschließlich impact_assessment, keine Originalnachricht oder persönliche Meinung. Bei Kernfehlern, die sich aus den gebundenen Quellen nicht beheben lassen: needs_review. Keine Bilder, keine Anbieter-API. Prüfe alle aufgeführten Checks einzeln mit Begründung. Ein Prüflabel ohne fachliche Prüfung genügt nicht. Gib das vollständige geprüfte impact_assessment zurück. output.json atomar zuletzt; Claim-/ACK-Regeln bleiben erhalten.`,
      record: reviewRecord,
      proposed_assessment: proposed,
      validation_findings: semanticIssues(proposed, record),
      review_protocol: 'impact-2.1-potential-1',
      review_format_rule: 'Jeder der 14 Checks ist ein Objekt {"status":"pass" oder "fail","rationale":"konkrete fachliche Begründung"}. Ein Wort wie geprüft, true oder ein allgemeines Gesamturteil genügt nicht. Alle gebundenen Quellen anhand ihrer Belegfunktion prüfen, auch ergänzte amtliche/programmatische/wissenschaftliche Quellen. Ein fehlender Umsetzungsbeschluss macht einen belegten bedingten Wirkungspfad nicht richtungslos.',
      requested_output: { schema_version: '1.0', job_id: id, input_hash: inputHash, processed_at: 'ISO timestamp',
        review: { status: 'ready|needs_review|blocked', checks: Object.fromEntries(SEMANTIC_CHECKS.map(k => [k, { status: 'pass|fail', rationale: 'fachliche Begründung' }])), findings: ['verbleibende Befunde oder leere Liste'] },
        research_sources: [], impact_assessment: IMPACT_SCHEMA, $defs: IMPACT_DEFS },
    };
    reviewJob = { input, candidate: record, proposed, status: 'prepared_semantic', attempts: {}, created_at: now };
    await bridge.store.put(reviewJob);
  }
  job.publication_gate = { status: 'needs_second_pass', review_job_id: id }; await bridge.store.put(job);
  if (reviewJob.status === 'prepared_semantic') {
    try {
      await bridge.transport.writeAtomic(bridgePath('00_INBOX', id + '.input.json'), reviewJob.input);
      reviewJob.status = 'queued'; reviewJob.queued_at = now; await bridge.store.put(reviewJob);
    } catch (error) { await bridge.failure(reviewJob, 'enqueue', error, now); }
  }
  if (reviewJob.status === 'queued') {
    // A semantic-version replacement is an explicit cancellation, not a
    // timeout or a failed editorial verdict. Keep its input/output and ACK
    // history, and point the reader of the old job to the new bound review.
    for (const old of await bridge.store.all()) {
      if (old.input.job_type !== SEMANTIC_JOB_TYPE || old.input.parent_job_id !== job.input.job_id
        || old.input.job_id === id || old.ack || old.accepted || terminal.has(old.status)) continue;
      old.superseded_by = id; old.superseded_at = now;
      old.status = 'accepted'; old.accepted_at = now;
      old.accepted = { job_id:old.input.job_id,decision:'hold',record:null,staged:false,output_hash:null,accepted_at:now };
      old.ack = {schema_version:'1.0',job_id:old.input.job_id,status:'hold',imported_at:now,publication_id:null,url:null,output_hash:null,test_only:old.input.test_only,
        reason:'Der neue versionierte Fachprüfauftrag ersetzt diesen offenen Auftrag. Kein fachliches Ablehnungsurteil.',replacement_job_id:id};
      await bridge.store.put(old);
    }
  }
  return { status: 'needs_second_pass', assessment: proposed };
}

export async function importSemanticReviews(bridge, now) {
  const names = new Set((await bridge.transport.list('20_OUTPUT_READY')).map(e => e.name));
  const results = [];
  for (const job of await bridge.store.all()) {
    if (job.input.job_type !== SEMANTIC_JOB_TYPE || terminal.has(job.status) || !names.has(job.input.job_id + '.output.json')) continue;
    if (job.input.impact_version !== IMPACT_VERSION || job.input.semantics_revision !== POTENTIAL_REVISION || job.superseded_by) continue;
    try {
      const output = parsePacket(await bridge.transport.read(bridgePath('20_OUTPUT_READY', job.input.job_id + '.output.json')), semanticOutputSchema);
      if (output.job_id !== job.input.job_id || output.input_hash !== job.input.input_hash) throw Error('BRIDGE_JOB_BINDING_MISMATCH');
      if (Date.parse(output.processed_at) < Date.parse(job.input.created_at) || Date.parse(output.processed_at) > Date.parse(now) + 300000) throw Error('BRIDGE_OUTPUT_TIME_INVALID');
      const parent = await bridge.store.get(job.input.parent_job_id);
      if (!parent || parent.ack || parent.accepted) continue;
      let research = [];
      try { research = await verifyImpactResearch(bridge, output.research_sources || [], [...(job.candidate.sources || job.candidate.source_snapshot || []), ...(job.candidate.impact_sources || [])], now); }
      catch (error) { throw Object.assign(Error('BRIDGE_PUBLICATION_GATE_FAILED'),{issues:[error.message]}); }
      const reviewRecord = {...job.candidate,impact_sources:[...(job.candidate.impact_sources||[]),...research]};
      const gate = derivePublicationStatus(output.impact_assessment, reviewRecord, { review: output.review, secondPassComplete: true });
      if (gate.issues.some(issue => /IMPACT_(?:VERSION|MATERIAL_MAGNITUDE|FACTOR_|MAGNITUDE_CALCULATION|MAIN_AGGREGATE|OBSERVED_DIRECTION|SOURCE_FUNCTION|RESEARCH_RESULT|RESEARCH_CHECK|BOUNDARY_)/.test(issue))) throw Object.assign(Error('BRIDGE_PUBLICATION_GATE_FAILED'),{issues:gate.issues});
      parent.semantic_review = { review_job_id: job.input.job_id, output_hash: job.input.parent_output_hash, reviewed_at: now,
        assessment: output.impact_assessment, review: output.review, research_sources: research, verified_context_sources: reviewRecord.impact_sources, gate };
      parent.publication_gate = gate;
      await bridge.store.put(parent);
      job.status = 'accepted'; job.accepted_at = now;
      job.accepted = { job_id: job.input.job_id, decision: gate.status === 'ready' ? 'reviewed' : 'hold', record: null, staged: job.input.test_only || bridge.stageOnly, output_hash: hash(output), accepted_at: now };
      job.output_detected_at = (await bridge.store.observation(`output:${job.input.job_id}`))?.at || now;
      await bridge.store.put(job); results.push({ job_id: job.input.job_id, parent_job_id: parent.input.job_id, ...gate });
    } catch (error) { await bridge.failure(job, 'import', error, now); }
  }
  return results;
}
