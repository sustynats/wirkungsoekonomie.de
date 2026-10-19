import { expandPacketTransport, expandEvidenceSegments } from './evidence-packets.mjs';
import { isProgrammeListing } from './programme-listing.mjs';

export const NEWS_INPUT_READINESS_VERSION = '2026-09-14.1';
const normalized = value => String(value || '').replace(/\s+/g, ' ').trim();
const begin = '\nUNTRUSTED_SOURCE_DATA_BEGIN\n', end = '\nUNTRUSTED_SOURCE_DATA_END';

function inputPackets(prompt) {
  const start = prompt.indexOf(begin), finish = prompt.indexOf(end, start + begin.length);
  if (start < 0 || finish < 0 || prompt.indexOf(begin, start + begin.length) >= 0) throw Error();
  const packets = JSON.parse(prompt.slice(start + begin.length, finish));
  if (!Array.isArray(packets) || !packets.length) throw Error();
  return packets;
}

// Free input-completeness check, NOT factual/editorial approval. Check the
// actual bounded model input, not a richer pre-truncation source. RSS can supply
// enough evidence; downloading a full article is not mandatory.
export function newsInputReadiness(prompt) {
  const issues = [];
  const add = (code, source_id = null) => issues.push({ code, ...(source_id ? { source_id } : {}) });
  let packets;
  try {
    packets = inputPackets(prompt);
    if (packets.length !== 1) { packets = null; throw Error(); }
  } catch { add('NEWS_INPUT_PACKET_INVALID'); }
  let story, usableSources = 0;
  if (packets) try {
    story = expandPacketTransport(packets[0]);
    const sources = expandEvidenceSegments(packets[0]).map(source => ({ ...story.source_defaults, ...source }));
    if (!normalized(story.story_id) || !normalized(story.canonical_title)) add('NEWS_INPUT_EVENT_MISSING');
    if (/^\s*\+{2,}.*\+{2,}.+\+{2,}\s*$/.test(story.canonical_title || '')) add('NEWS_INPUT_EVENT_NOT_SCOPED');
    if (isProgrammeListing({title:story.canonical_title})) add('NEWS_INPUT_PROGRAMME_LISTING');
    if (!sources.length) add('NEWS_INPUT_SOURCES_MISSING');
    const evidenceIds = new Set(), sourceIds = new Set();
    for (const source of sources) {
      sourceIds.add(source.source_id);
      let valid = Boolean(normalized(source.source_id) && normalized(source.title));
      try { const url = new URL(source.url); valid &&= url.protocol === 'https:' && !url.username && !url.password; }
      catch { valid = false; }
      if (!valid) add('NEWS_INPUT_SOURCE_IDENTITY_INVALID', source.source_id);
      if (!Number.isFinite(Date.parse(source.published_at))) add('NEWS_INPUT_SOURCE_DATE_MISSING', source.source_id);
      const texts = [];
      for (const segment of source.evidence_segments || []) {
        if (!normalized(segment.evidence_id) || evidenceIds.has(segment.evidence_id) || !normalized(segment.excerpt)) add('NEWS_INPUT_EVIDENCE_INVALID', source.source_id);
        evidenceIds.add(segment.evidence_id);
        if (normalized(segment.excerpt) !== normalized(source.title)) texts.push(normalized(segment.excerpt));
      }
      const evidence = [...new Set(texts)].join(' ').replace(normalized(source.title), '').trim();
      // Player configuration is not article text. No topic/party heuristics.
      if (/"(?:params|legal|embedUrl|playerConfig)"\s*:|\?startTime=\$start\$|window\.__|<script\b/i.test(evidence)) add('NEWS_INPUT_EXTRACTION_CONTAMINATED', source.source_id);
      if (valid && evidence.length >= 120 && evidence.split(/\s+/).length >= 18) usableSources++;
    }
    if (!usableSources) add('NEWS_INPUT_EVIDENCE_TOO_THIN');
    if (!story.claims?.length) add('NEWS_INPUT_CLAIMS_MISSING');
    for (const claim of story.claims || []) {
      const sourceId = claim.source_id ?? story.claim_defaults?.source_id;
      if (!sourceIds.has(sourceId)) add('NEWS_INPUT_CLAIM_UNBOUND', sourceId);
      if (!normalized(claim.claim) && !(Number.isInteger(claim.claim_from_source) && sources[claim.claim_from_source])) add('NEWS_INPUT_CLAIM_EMPTY', sourceId);
    }
  } catch { add('NEWS_INPUT_EVIDENCE_INVALID'); }
  return { version: NEWS_INPUT_READINESS_VERSION, status: issues.length ? 'NEEDS_PREPARATION' : 'READY_FOR_DRAFT',
    scope: 'input_completeness_not_editorial_approval', story_id: story?.story_id || null, usable_sources: usableSources, issues };
}

// Native requests can contain several events. Inspect each exact, already
// bounded packet; do not rebuild it from richer source data or admit multiple
// events through the single-event bridge gate. Dictionaries are packet-local.
export function newsBatchInputReadiness(prompt) {
  let stories;
  try {
    stories = inputPackets(prompt).map(packet => newsInputReadiness(`${begin}${JSON.stringify([packet])}${end}`));
    const ids = stories.map(story => story.story_id);
    if (ids.some(id => !id) || new Set(ids).size !== ids.length) throw Error();
  } catch {
    stories = [newsInputReadiness('invalid packet')];
  }
  return { version: NEWS_INPUT_READINESS_VERSION,
    status: stories.every(story => story.status === 'READY_FOR_DRAFT') ? 'READY_FOR_DRAFT' : 'NEEDS_PREPARATION',
    scope: 'input_completeness_not_editorial_approval', stories };
}
