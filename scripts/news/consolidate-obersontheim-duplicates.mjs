// Same Stern article and event ID, split by a grammatical "im Kreis" place
// suffix on 20 October. Routing only: no new verdict or paid union review.
import { sourceReviewFingerprint } from './evidence-packets.mjs';

// Pinned audit/containment time for deterministic release-only projections.
// The regular worker records its own actual routing transaction time.
export const OBERSONTHEIM_ROUTING_AUDITED_AT = '2026-10-20T06:40:00Z';
const url = 'https://www.stern.de/gesellschaft/regional/baden-wuerttemberg/kreis-schwaebisch-hall--schuesse-mit-schreckschusspistole-loesen-sek-einsatz-aus-38421916.html';
const event = 'event-d8affb4c9b67f7ac3792';
const bindings = [
  { id: 'wt-ccc96fc0c7d39047', suffix: 'd39047', at: '2026-10-20T00:19:37.498Z',
    content: '86f14afdb543b849906393f9589d134d7e9182276cf770986a33b75853ea2697',
    source: '3278db82c5ae4ad30d9d3e3fbd3a676b4c1e5abe7b576e1e89536c6762e894c3' },
  { id: 'wt-9909c1676a2f8602', suffix: '2f8602', at: '2026-10-20T06:20:25.471Z',
    content: '8ecf20d5ce8065f2bba46671a059473ecc2c3a35b99bd018e2e3ff79ab0552f9',
    source: '121313df7ebd74c783f9c1f50ba4ef5d1584d5ff700c6a03bee8d4aee762fe92' },
];
const slug = suffix => `kreis-schwabisch-hall-schusse-mit-schreckschusspistole-losen-sek-einsatz-aus-${suffix}`;
const editionMatches = (s, b) => s?.published && !s.manual_only && !s.editorial_approval_hash
  && s.current_version === 1 && s.event_id === event && s.slug === slug(b.suffix)
  && s.published_at === b.at && s.updated_at === b.at && s.content_hash === b.content
  && s.sources?.length === 1 && s.sources[0].url === url && s.sources[0].content_hash === b.source;
const pointsTo = (s, target) => s?.listed === false
  && s.retirement?.reason_code === 'MERGED_INTO_LIVING_FILE'
  && s.retirement.canonical_story_ids?.length === 1
  && s.retirement.canonical_story_ids[0] === target.story_id;
const membersAre = (s, target) => s.living_file?.merged_story_ids?.length === 1
  && s.living_file.merged_story_ids[0] === target.story_id;
const routed = (a, b) => a?.published && a.listed !== false && !a.retirement
  && pointsTo(b, a) && b.retirement.preserve_full_publication === true && membersAre(a, b);
const paidFingerprint = s => sourceReviewFingerprint({ ...s, published_at: null, source_published_at: null });
function retainedPending(story, pair, reversed, at) {
  const p = story.pending_update;
  if (!p) return true;
  const allowed = new Set(['detected_at', 'content_hash', 'sources', 'reason', 'quality_errors',
    'quality_retry_count', 'quality_retry_after', 'reassessment', 'fresh', 'consolidation',
    'impact_reassessment', 'source_integrity']);
  if (Object.keys(p).some(k => !allowed.has(k)) || p.reassessment || p.impact_reassessment
    || (p.consolidation && !(reversed && story === pair[1]))
    || !['QUALITY_GATE_FAILED', 'AI_ATTEMPT_LIMIT_REACHED', 'AI_BUDGET_OR_BATCH_LIMIT', 'AI_HOURLY_CALL_LIMIT'].includes(p.reason)
    || !Array.isArray(p.sources) || !p.sources.length
    || (p.content_hash && !bindings.some(b => b.content === p.content_hash))
    || (p.detected_at && (!Number.isFinite(Date.parse(p.detected_at)) || Date.parse(p.detected_at) > Date.parse(at)))) return false;
  const paid = new Set(pair.flatMap(s => s.sources).map(paidFingerprint));
  return p.sources.every(s => s && paid.has(paidFingerprint(s)));
}

export function consolidateObersontheimDuplicates(stories, at) {
  if (!Number.isFinite(Date.parse(at))) throw Error('INVALID_CONSOLIDATION_TIME');
  const pair = bindings.map(b => stories.find(s => s.story_id === b.id));
  if (pair.some(s => !s)) return { status: 'not_present', changes: [] };
  if (bindings.some(b => stories.filter(s => s.story_id === b.id).length !== 1)) {
    return { status: 'held', reason: 'STORY_ID_AMBIGUOUS', changes: [] };
  }
  const [canonical, duplicate] = pair;
  // A subsequent legitimate version must not be blocked by this one-off repair.
  if (routed(canonical, duplicate)) return { status: 'already_applied', changes: [] };
  const untouched = pair.every(s => s.listed !== false && !s.retirement && !s.living_file);
  // A normal older worker can have consolidated in reverse chronological order.
  // Repair only this exact two-member routing; never take over another case file.
  const reversed = pointsTo(canonical, duplicate) && membersAre(duplicate, canonical)
    && duplicate.listed !== false && !duplicate.retirement && !canonical.living_file;
  if (!pair.every((s, i) => editionMatches(s, bindings[i]) && Date.parse(at) >= Date.parse(s.updated_at))
    || (!untouched && !reversed) || !pair.every(s => retainedPending(s, pair, reversed, at))) {
    return { status: 'held', reason: 'SOURCE_EDITION_OR_ROUTING_CHANGED', changes: [] };
  }
  if (reversed) {
    canonical.retirement_history = [...(canonical.retirement_history || []), structuredClone(canonical.retirement)];
    duplicate.living_file_history = [...(duplicate.living_file_history || []), structuredClone(duplicate.living_file)];
    delete canonical.retirement;
    delete canonical.retired_at;
    delete duplicate.living_file;
    canonical.listed = true;
    canonical.analysis_status = 'veröffentlicht';
  }
  // Keep every manuscript, source, version, receipt and pending review verbatim.
  // In particular the failed pending update is NOT marked reviewed or cleared.
  canonical.living_file = { merged_story_ids: [duplicate.story_id], consolidations: [{
    at, story_id: duplicate.story_id, slug: duplicate.slug, title: duplicate.title,
    reason: 'Dieselbe Stern-Dokumentkennung und Ereignis-ID; ursprüngliche öffentliche Adresse bleibt kanonisch',
  }] };
  duplicate.listed = false;
  duplicate.retired_at = at;
  duplicate.retirement = { at, reason_code: 'MERGED_INTO_LIVING_FILE',
    canonical_story_ids: [canonical.story_id], preserve_full_publication: true,
    canonical_stories: [{ story_id: canonical.story_id, slug: canonical.slug, title: canonical.title }],
    note: 'Diese separat vorbereitete Fassung betrifft denselben Vorgang und dasselbe Quelldokument wie die verlinkte ursprüngliche Wirkungsakte. Beide vollständigen Fassungen und ihre Quellen bleiben erhalten. Die technische Zusammenführung ist keine neue fachliche Prüfung oder unabhängige Bestätigung.' };
  return { status: 'applied', changes: [{ story_id: duplicate.story_id,
    canonical_story_id: canonical.story_id, reason: 'source_bound_obersontheim_duplicate_2026_10_20' }] };
}

// Build and validation read the same exact-source publication projection.
// All existing source/content/queue gates continue to run on that view.
export function projectObersontheimPublication(stories) {
  const result = consolidateObersontheimDuplicates(stories, OBERSONTHEIM_ROUTING_AUDITED_AT);
  if (result.status === 'held') throw Error(`OBERSONTHEIM_ROUTING_REPAIR_HELD:${result.reason}`);
  return result;
}

export function retainedObersontheimPaidInput(candidate, stories) {
  const canonical = candidate.existing_story;
  if (candidate.story_id !== bindings[0].id || canonical?.story_id !== bindings[0].id
    || !editionMatches(canonical, bindings[0]) || candidate.reassessment || candidate.impact_reassessment
    || candidate.followup_due || candidate.deepening_due || candidate.consolidation) return false;
  const duplicates = stories.filter(s => s.story_id === bindings[1].id);
  if (duplicates.length !== 1 || !editionMatches(duplicates[0], bindings[1]) || !routed(canonical, duplicates[0])) return false;
  const sources = candidate.sources || [];
  if (!sources.length || sources.some(s => !s || s.url !== url)) return false;
  const paid = new Set([...canonical.sources, ...duplicates[0].sources].map(paidFingerprint));
  return sources.every(s => paid.has(paidFingerprint(s)));
}
