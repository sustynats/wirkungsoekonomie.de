import { createHash } from 'node:crypto';
import net from 'node:net';

export const BRIDGE_ROOT = '/WOEK/WIRKUNGSTICKER-CHATGPT-BRIDGE';
export const FOLDERS = Object.freeze(['00_INBOX', '10_CLAIMED', '20_OUTPUT_READY', '30_ACK', '40_ARCHIVE', '90_ERRORS', '95_LOGS', '98_CONFIG']);
export const MAX_BYTES = 2 * 1024 * 1024;
export const JOB_ID = /^wt_\d{8}T\d{6}Z_[a-f0-9]{24}$/;
export const hash = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const str = (maxLength = 20000) => ({ type: 'string', maxLength });
const text = (maxLength = 20000) => ({ ...str(maxLength), minLength: 1 });
const arr = items => ({ type: 'array', items, maxItems: 200 });
const object = (properties, required = Object.keys(properties)) => ({ type: 'object', properties, required, additionalProperties: false });
const timestamp = { ...text(40), format: 'date-time' };
const nullableString = { type: ['string', 'null'], maxLength: 2000 };
export const visualContextSchema = object({
  required: { const: true }, format: { const: 'editorial_symbolic_image' }, type: { const: 'editorial_symbolic_image' }, aspect_ratio: { const: '16:9' },
  brand: { const: 'Wirkungsticker / Gesellschaft für Wirkungsökonomie' },
  recent_visual_concepts: arr(object({ story_id: text(100), concept: str(4000), image_url: nullableString, description_verified: { type: 'boolean' } })),
  recent_image_descriptions: arr(str(4000)), organisations_relevant: arr(str(500)),
  avoid_concepts: arr(str(2000)), existing_story_images: arr(str(4000)), people_relevant: arr(str(500)), locations_relevant: arr(str(500)), visual_notes: arr(str(4000)),
});
export const visualSchema = object({
  schema_version: { const: '1.0' }, job_id: { ...text(80), pattern: JOB_ID.source }, generated_at: timestamp,
  visual_type: { const: 'editorial_symbolic_image' }, concept: text(4000), visual_reasoning_short: text(4000),
  subjects: arr(str(500)), symbols: arr(str(500)), location_context: nullableString,
  caption: text(1500), alt_text: text(1000), ai_generated: { const: true },
  contains_real_person_depiction: { type: 'boolean' }, contains_text_in_image: { const: false },
  similarity_check: object({ checked_against_recent: { const: true }, possible_duplicate: { const: false }, notes: str(4000) }),
  editorial_safety: object({ photorealistic_event_claim: { const: false }, misleading_documentary_impression: { const: false }, warnings: arr(str(2000)) }),
  input_hash: { ...text(64), pattern: '^[a-f0-9]{64}$' }, image_sha256: { ...text(64), pattern: '^[a-f0-9]{64}$' },
});
export const visualBriefSchema = object({
  required: { type: 'boolean' }, visual_type: { const: 'editorial_symbolic_image' },
  concept: text(4000), subjects: { ...arr(str(500)), maxItems: 12 }, symbols: { ...arr(str(500)), maxItems: 12 },
  avoid: { ...arr(str(500)), maxItems: 20 }, location_context: nullableString,
  contains_real_person: { const: false }, documentary_impression_forbidden: { const: true },
  text_in_image: { const: false }, caption: text(1500), alt_text: text(1000), editorial_notes: str(4000),
});
const source = object({ source_id: text(200), publisher: text(500), title: text(1000), url: { ...text(4000), format: 'https-url' },
  published_at: nullableString, retrieved_at: timestamp, source_type: text(100), is_primary_source: { type: 'boolean' },
  text: str(60000), excerpt: str(20000), language: text(20) });
export const inputSchema = object({
  schema_version: { const: '1.0' }, job_id: { ...text(80), pattern: JOB_ID.source }, created_at: timestamp,
  processing_mode: { const: 'dropbox_chatgpt_bridge' }, job_type: { enum: ['new_story', 'story_update', 'correction'] },
  input_hash: { ...text(64), pattern: '^[a-f0-9]{64}$' }, test_only: { type: 'boolean' },
  event: object({ canonical_title: text(1000), event_summary_machine: str(), first_seen_at: timestamp, latest_seen_at: timestamp,
    category: str(200), region: str(500), entities: arr(str(500)), keywords: arr(str(500)), canonical_fingerprint: text(500) }),
  sources: { ...arr(source), minItems: 1 },
  discovery: object({ source_count: { type: 'integer', minimum: 1 }, independent_source_count: { type: 'integer', minimum: 0 }, duplicate_group: nullableString,
    existing_story_candidates: arr(str(100)), importance_signals: arr(str(1000)), freshness_minutes: { type: ['number', 'null'], minimum: 0 } }),
  requested_output: object(Object.fromEntries(['publication_candidate', 'fact_check', 'consequence_check', 'frame_check', 'impact_analysis', 'title_image'].map(k => [k, { const: true }]))),
  visual_context: visualContextSchema,
  wirkungsticker: object({ story_id: text(100), expected_content_hash: text(200), expected_analysis_hash: nullableString,
    analysis_prompt: text(200000), governance_version: { const: '1.7' }, output_extension: { const: 'wirkungsticker.analysis' } }),
});
const dimension = object({ direction: text(100), analysis: text(), evidence: text() });
// The compact exchange schema is an envelope, not a replacement for the existing
// production analysis contract. Publish/merge additionally require that contract.
export const outputSchema = object({
  visual_brief: visualBriefSchema,
  schema_version: { const: '1.0' }, job_id: { ...text(80), pattern: JOB_ID.source }, processed_at: timestamp,
  input_hash: { ...text(64), pattern: '^[a-f0-9]{64}$' },
  decision: object({ status: { enum: ['publish', 'hold', 'reject', 'merge'] }, reason: text(), merge_into: nullableString, priority: { type: 'integer', minimum: 0, maximum: 100 } }),
  story: object({ headline: str(500), subheadline: str(1000), short_summary: str(), detailed_summary: str(50000), what_happened: str(), why_it_matters: str() }),
  facts: object({ confirmed: arr({}), uncertain: arr({}), contradictions: arr({}), missing_information: arr({}) }),
  fact_check: object({ status: text(100), summary: str(), claims: arr({}) }),
  consequence_check: object({ direct: arr({}), second_order: arr({}), third_order: arr({}), time_horizon: arr({}) }),
  impact: object({ human: dimension, planet: dimension, democracy: dimension, net_assessment: str(), uncertainty: text() }),
  frame_check: object({ relevant: { type: 'boolean' }, frames: arr({}), resonance_risks: arr({}), notes: str() }),
  sources: arr({ ...source, required: ['source_id', 'url'] }),
  editorial: object({ category: str(200), tags: arr(str(200)), location: nullableString, people: arr(str(500)), organisations: arr(str(500)), publishable: { type: 'boolean' } }),
  quality: object({ source_quality: text(1000), evidence_strength: text(1000), needs_human_review: { type: 'boolean' }, warnings: arr(str(2000)) }),
  wirkungsticker: object({ analysis: { type: 'object' }, correction_note: str(1500), merge_expected_content_hash: text(200), merge_expected_analysis_hash: text(200) }, ['analysis']),
}, ['schema_version', 'job_id', 'processed_at', 'input_hash', 'decision', 'story', 'facts', 'fact_check', 'consequence_check', 'impact', 'frame_check', 'sources', 'editorial', 'quality']);

export function safeUrl(raw) {
  let url;
  try { url = new URL(raw); } catch { throw new Error('BRIDGE_SOURCE_URL_INVALID'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.port || net.isIP(url.hostname)
    || !url.hostname.includes('.') || /(?:^|\.)(?:localhost|local|internal|invalid|test)$/.test(url.hostname)
    || /(?:token|secret|password|signature|credential|api[_-]?key)/i.test(url.search)) throw new Error('BRIDGE_SOURCE_URL_INVALID');
  url.hash = '';
  return url.href;
}

export function assertSchema(schema, value, at = '$', depth = 0) {
  const fail = () => { throw new Error(`BRIDGE_SCHEMA_INVALID:${at}`); };
  if (depth > 30) fail();
  const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
  if (schema.type && ![].concat(schema.type).some(t => t === type || t === 'integer' && Number.isInteger(value))) fail();
  if ('const' in schema && value !== schema.const || schema.enum && !schema.enum.includes(value)) fail();
  if (type === 'string') {
    if (value.length > (schema.maxLength ?? 200000) || value.length < (schema.minLength ?? 0) || schema.pattern && !new RegExp(schema.pattern).test(value)) fail();
    if (schema.format === 'date-time' && (!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,9})?(?:Z|[+-]\d\d:\d\d)$/.test(value) || !Number.isFinite(Date.parse(value)))) fail();
    if (schema.format === 'https-url') safeUrl(value);
    if (/\b(?:Bearer\s+\S+|sk-(?:proj-)?[A-Za-z0-9_-]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/i.test(value)) throw new Error('BRIDGE_SECRET_REJECTED');
  }
  if (type === 'number' && (!Number.isFinite(value) || value < (schema.minimum ?? -Infinity) || value > (schema.maximum ?? Infinity))) fail();
  if (type === 'array') {
    if (value.length > (schema.maxItems ?? 500) || value.length < (schema.minItems ?? 0)) fail();
    value.forEach((v, i) => assertSchema(schema.items || {}, v, `${at}[${i}]`, depth + 1));
  }
  if (type === 'object') {
    if ((schema.required || []).some(key => !Object.hasOwn(value, key))) fail();
    for (const [key, v] of Object.entries(value)) {
      if (['__proto__', 'constructor', 'prototype'].includes(key) || /^(?:access_token|refresh_token|api_key|client_secret|authorization|password|credentials)$/i.test(key)) throw new Error('BRIDGE_UNSAFE_KEY');
      if (schema.additionalProperties === false && !Object.hasOwn(schema.properties || {}, key)) fail();
      assertSchema(schema.properties?.[key] || {}, v, `${at}.${key}`, depth + 1);
    }
  }
  return value;
}

export function parsePacket(raw, schema) {
  if (Buffer.byteLength(raw) > MAX_BYTES) throw new Error('BRIDGE_FILE_TOO_LARGE');
  let value;
  try { value = JSON.parse(raw); } catch { throw new Error('BRIDGE_JSON_INVALID'); }
  return assertSchema(schema, value);
}

export function bridgePath(folder, name) {
  if (!FOLDERS.includes(folder) || !/^[A-Za-z0-9_.-]{1,150}$/.test(name) || name.includes('..')) throw new Error('BRIDGE_PATH_INVALID');
  return `${BRIDGE_ROOT}/${folder}/${name}`;
}
