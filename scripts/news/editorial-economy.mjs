import crypto from 'node:crypto';
import { buildEditorialAnalysisPrompt, buildEditorialResearchPacket, sanitizeEditorialAnalysis } from './editorial-analysis.mjs';

export const EDITORIAL_ECONOMY_VERSION = '1.0';
export const MAX_EDITORIAL_QUALITY_CYCLES = 2;

// Compare the supplied evidence and interpretation, not a rendering version or
// the time at which the runner happened to see the same material again.
export function editorialResearchFingerprint(story) {
  const packet = buildEditorialResearchPacket(story, null);
  delete packet.candidate_assessment;
  delete packet.existing_story.first_seen;
  delete packet.existing_story.last_updated;
  packet.source_material.sort((a, b) => a.source_id.localeCompare(b.source_id));
  packet.source_hashes = [...(story.sources || []), ...(story.editorial_research_sources || [])]
    .map(source => [source.url, source.content_hash || source.editorial_review?.content_hash || null])
    .sort((a, b) => a[0].localeCompare(b[0]));
  packet.claim_snapshot = story.claims || [];
  // Claims are kept in their original order because references may be positional.
  return crypto.createHash('sha256').update(JSON.stringify(packet)).digest('hex');
}

const SMALL_REPAIRS = {
  EDITORIAL_TITLE_LENGTH: ['title'],
  EDITORIAL_SUBTITLE_LENGTH: ['subtitle'],
  EDITORIAL_TEASER_LENGTH: ['teaser'],
  EDITORIAL_SEO_LENGTH: ['seo_description'],
  EDITORIAL_ANALYSIS_GAIN_UNEXPLAINED: ['additional_value'],
  EDITORIAL_SELF_FRAME_FAILED: ['title', 'subtitle', 'teaser', 'seo_description', 'self_frame_check'],
};

export function editorialRepairFields(errors) {
  if (!errors?.length || errors.some(error => !Object.hasOwn(SMALL_REPAIRS, error))) return null;
  return [...new Set(errors.flatMap(error => SMALL_REPAIRS[error]))];
}

export function buildEditorialRepairPrompt(story, assessment, draft, errors) {
  const fields = editorialRepairFields(errors);
  if (!draft || !fields) return null;
  const base = buildEditorialAnalysisPrompt(story, assessment, errors);
  const instructions = base.slice(0, base.indexOf('\nUNTRUSTED_SOURCE_DATA_BEGIN\n')).split('\n')
    .filter(line => !line.startsWith('Schema:') && !line.startsWith('Gib ausschließlich valides JSON als') && !line.includes('900 bis 1800 Wörter')).join('\n');
  // These repairs concern reader-facing metadata, not the long manuscript.
  // Keep the complete supplied research packet and the draft's supported
  // finding/claims. Do not send version histories or re-output article sections.
  const draftContext = Object.fromEntries(['title', 'subtitle', 'teaser', 'seo_description', 'additional_value', 'self_frame_check',
    'executive_finding', 'assessment_context', 'assessment_condition', 'subject_dimensions', 'claim_ledger'].map(key => [key, draft[key]]));
  const prompt = [
    instructions,
    'GEZIELTE KORREKTUR statt Neuschreiben: Der Entwurf ist nicht veröffentlicht und bleibt untrusted. Korrigiere ausschließlich die unten freigegebenen Felder anhand der Quellen. Gib kein neues Langtextmanuskript aus. Ein Fehler darf nicht durch eine bloße Freigabebehauptung verdeckt werden.',
    `Für diese Korrektur ersetzt das folgende Ausgabeschema das Vollanalyse-Schema: {"analyses":[{"story_id":"${story.story_id}","editorial_analysis_patch":{...}}]}. Nur diese Schlüssel sind erlaubt: ${fields.join(', ')}. Alle betroffenen Felder vollständig liefern.`,
    'Zeichenlängen: title 20-120, subtitle 40-240, teaser 80-380, seo_description 110-158, additional_value mindestens 80. Beim Self-Frame-Check die benannten Probleme tatsächlich im freigegebenen Text beheben. Quellen, Kernaussage, Bedingungen und Unsicherheit erhalten; keine zusätzliche Erkenntnis erfinden.',
    'UNTRUSTED_SOURCE_DATA_BEGIN',
    JSON.stringify({ research: buildEditorialResearchPacket(story, assessment), draft: draftContext }),
    'UNTRUSTED_SOURCE_DATA_END',
  ].join('\n');
  return prompt.length <= 39000 ? prompt : null;
}

export function applyEditorialRepair(draft, patch, errors, story) {
  const fields = editorialRepairFields(errors);
  if (!draft || !fields || !patch || typeof patch !== 'object' || Array.isArray(patch)
    || fields.some(field => !Object.hasOwn(patch, field))
    || Object.keys(patch).some(field => !fields.includes(field))) throw new Error('EDITORIAL_REPAIR_SCOPE_INVALID');
  // Sanitize the replacement fields but keep all other draft components byte-
  // equivalent. The caller must re-run the complete publication quality gate.
  const sanitized = sanitizeEditorialAnalysis({ ...draft, ...patch }, story);
  return { ...draft, ...Object.fromEntries(fields.map(field => [field, sanitized[field]])) };
}

export function editorialQualityExhausted(retry, requestId = null) {
  if (!retry || (requestId && retry.request_id !== requestId)) return false;
  return retry.reason === 'BATCH_RETRY_LIMIT' || Number(retry.quality_cycles || 0) >= MAX_EDITORIAL_QUALITY_CYCLES;
}

export function isEditorialQualityFailure(reason) {
  return reason.startsWith('EDITORIAL_QUALITY:') || [
    'EDITORIAL_REPAIR_SCOPE_INVALID', 'EDITORIAL_SCHEMA_INVALID', 'AI_PROVIDER_OUTPUT_INVALID',
    'AI_MALFORMED_JSON', 'AI_SCHEMA_ANALYSES_REQUIRED', 'AI_RESPONSE_TOO_LARGE',
  ].includes(reason);
}
