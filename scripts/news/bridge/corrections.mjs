import { bridgePath, hash } from './contract.mjs';

export const CORRECTION_LIMIT = 2;
const correctable = /^(?:BRIDGE_SCHEMA_INVALID(?::|$)|BRIDGE_SUMMARY_MISMATCH$|BRIDGE_PRODUCTION_ANALYSIS_REQUIRED$|BRIDGE_PUBLICATION_GATE_FAILED$|BRIDGE_EDITORIAL_PUBLICATION_GATE_FAILED$|BRIDGE_MERGE_EVENT_MISMATCH$|BRIDGE_CORRECTION_NOTE_REQUIRED$)/;
export function canRequestCorrection(job, stage, error) {
  return stage === 'import' && !job.input.test_only && !job.ack && !job.accepted
    && correctable.test(error.error_code) && (job.corrections?.length || 0) < CORRECTION_LIMIT;
}

// A correction belongs to the original job and uses its immutable evidence.
// Persist before moving anything; every interrupted step can be resumed.
export async function prepareCorrection(provider, job, error, now, { sourcePath: explicitSourcePath } = {}) {
  const attempt = (job.corrections?.length || 0) + 1;
  const id = job.input.job_id;
  const outputPath = bridgePath('20_OUTPUT_READY', `${id}.output.json`);
  const legacyPath = bridgePath('90_ERRORS', `${id}.output.json`);
  if (explicitSourcePath && explicitSourcePath !== legacyPath) throw Error('BRIDGE_CORRECTION_SOURCE_INVALID');
  const sourcePath = explicitSourcePath || (await provider.transport.metadata(outputPath) ? outputPath : legacyPath);
  const raw = await provider.transport.read(sourcePath);
  const correction = {
    attempt, requested_at: now, original_output_hash: hash(raw),
    source_path: sourcePath, error,
    error_output_path: sourcePath === legacyPath ? legacyPath : bridgePath('90_ERRORS', `${id}.correction-${attempt}.output.json`),
    request_path: bridgePath('00_INBOX', `${id}.repair-${attempt}.json`),
  };
  job.corrections = [...(job.corrections || []), correction];
  job.status = 'correction_prepared';
  await provider.store.put(job);
  return finishCorrection(provider, job, now);
}

export async function finishCorrection(provider, job, now = new Date().toISOString()) {
  const correction = job.corrections.at(-1), transport = provider.transport;
  try {
    if (!await transport.metadata(correction.error_output_path)) {
      const raw = await transport.read(correction.source_path);
      if (hash(raw) !== correction.original_output_hash) throw Error('BRIDGE_CORRECTION_SOURCE_CHANGED');
      await transport.move(correction.source_path, correction.error_output_path);
    }
    if (hash(await transport.read(correction.error_output_path)) !== correction.original_output_hash) throw Error('BRIDGE_CORRECTION_HISTORY_CHANGED');
    const packet = {
      schema_version: '1.0', job_type: 'correction', job_id: job.input.job_id,
      input_hash: job.input.input_hash, correction_attempt: correction.attempt,
      created_at: correction.requested_at, test_only: job.input.test_only,
      contract_path: bridgePath('98_CONFIG', 'correction-protocol-20260910-1.json'),
      original_input: job.input, original_output_path: correction.error_output_path,
      validation_errors: correction.error,
      instructions: 'Gezielte Nachbearbeitung desselben Jobs. Originalinput und Quellen unverändert. Vorhandenes ACK prüfen, dann diesen repair-Auftrag nach 10_CLAIMED verschieben. Alle benannten Fehler und die vollständige native Analyse prüfen. Keine Belege, Hashes oder Wirkpfade erfinden. Korrigiertes vollständiges output.json atomar nach 20_OUTPUT_READY schreiben. Bei unzureichender Beleglage hold/reject. Keine API-Aufrufe und keine ChatGPT-Bilder. Während eines aktiven Durchlaufs neue repair-Aufträge mit abholen; ansonsten bestehender Stundenlauf. Kein neuer Server-Trigger.',
    };
    await transport.writeAtomic(correction.request_path, packet);
    job.status = 'correction_pending';
    correction.delivered_at = now;
    delete job.correction_delivery_error;
    delete job.correction_retry_at;
    await provider.store.put(job);
    return true;
  } catch (error) {
    correction.delivery_attempts = (correction.delivery_attempts || 0) + 1;
    job.correction_delivery_error = { code: 'BRIDGE_CORRECTION_DELIVERY_FAILED', attempts: correction.delivery_attempts };
    const temporary = error.retryable === true && /^BRIDGE_DROPBOX_HTTP_(?:429|5\d\d)$/.test(error.message);
    if (temporary) {
      const delay = Math.max(Math.min(3600, 300 * 2 ** Math.min(correction.delivery_attempts - 1, 4)), Number(error.retry_after_seconds) || 0);
      job.correction_retry_at = new Date(Date.parse(now) + delay * 1000).toISOString();
    } else if (correction.delivery_attempts >= 3 || /_CHANGED$/.test(error.message)) job.status = 'quarantined';
    await provider.store.put(job);
    return false;
  }
}

export async function recoverCorrections(provider, now = new Date().toISOString()) {
  for (const job of await provider.store.all()) if (job.status === 'correction_prepared'
    && !(Date.parse(job.correction_retry_at) > Date.parse(now))) await finishCorrection(provider, job, now);
}
