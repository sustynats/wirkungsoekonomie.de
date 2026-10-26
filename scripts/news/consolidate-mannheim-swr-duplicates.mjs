// Two paid editions of one specific SWR article, audited on 26 October.
// The free original identifies the same early-morning Neckarstadt-West cafe
// explosion. A changed headline must not turn this into another first report.
// This mapping does not infer relationships to other Mannheim publications.
import { isDeepStrictEqual } from 'node:util';
import { sourceReviewFingerprint } from './evidence-packets.mjs';
import { unchangedCapacityReview } from './unchanged-capacity-review.mjs';

const url = 'https://www.swr.de/swraktuell/baden-wuerttemberg/mannheim/explosion-in-mannheim-neckarstadt-100.html';
const bindings = [
  { id: 'wt-9a186192b81f5883', event: 'event-b6cc7e9734cc380bf263',
    slug: 'explosion-in-einem-cafe-in-mannheim-1f5883', at: '2026-10-26T09:22:51.186Z',
    content: '7ffde1ba1e3e4a9a182333f3277ab3ea2f20d4fd83f1370f239c21b5ddf7b89e',
    source: '8eb3892ad3c3ae2659a5bfee9d5ad2e28cb996b6aa356c6a7a1f228dd6efb931' },
  { id: 'wt-aab7a43e50d1d749', event: 'event-ccb0ff67e0f34b396dc3',
    slug: 'explosion-in-mannheimer-cafe-hintergrunde-noch-unklar-d1d749', at: '2026-10-26T09:46:35.533Z',
    content: 'cd6d6a8226120614513b236822ebe1110f94e10517afc425aa974ee27cb5206a',
    source: '51f7d9f13a46376d79943c9c8920a6613541d186b845a2064f043f644490e81f' },
];
const editionMatches = (story, binding) => story?.published === true && !story.manual_only && !story.editorial_approval_hash
  && story.analysis_status === 'veröffentlicht'
  && story.current_version === 1 && story.event_id === binding.event && story.slug === binding.slug
  && story.published_at === binding.at && story.updated_at === binding.at && story.content_hash === binding.content
  && story.sources?.length === 1 && story.sources[0]?.url === url
  && story.sources[0].source_id === 'swr-aktuell' && story.sources[0].content_hash === binding.source;
const openWork = story => story.provider_request_hold != null || story.pending_update != null || story.review_checkpoint != null;
const sourceGateClear = story => story.source_integrity?.status === 'verified'
  && story.source_integrity.publication_status === 'eligible'
  && Array.isArray(story.source_integrity.issue_codes) && !story.source_integrity.issue_codes.length
  && Array.isArray(story.source_integrity.warning_codes) && !story.source_integrity.warning_codes.length
  && Number.isFinite(Date.parse(story.source_integrity.checked_at));
const routed = (canonical, duplicate) => canonical?.published && canonical.listed !== false && !canonical.retirement
  && isDeepStrictEqual(canonical.living_file?.merged_story_ids, [bindings[1].id])
  && canonical.living_file.consolidations?.length === 1
  && canonical.living_file.consolidations[0].story_id === duplicate?.story_id
  && duplicate?.published && duplicate.listed === false && !duplicate.living_file
  && duplicate.retirement?.reason_code === 'MERGED_INTO_LIVING_FILE'
  && duplicate.retirement.preserve_full_publication === true
  && isDeepStrictEqual(duplicate.retirement.canonical_story_ids, [bindings[0].id]);

export function consolidateMannheimSwrDuplicates(stories, at) {
  if (!Number.isFinite(Date.parse(at))) throw Error('INVALID_CONSOLIDATION_TIME');
  const pair = bindings.map(binding => stories.filter(story => story.story_id === binding.id));
  if (pair.some(items => !items.length)) return { status: 'not_present', changes: [] };
  if (pair.some(items => items.length !== 1)) return { status: 'held', reason: 'STORY_ID_AMBIGUOUS', changes: [] };
  const [canonical, duplicate] = pair.map(items => items[0]);
  if (![canonical, duplicate].every((story, i) => editionMatches(story, bindings[i])
    && Date.parse(at) >= Date.parse(story.updated_at))) {
    return { status: 'held', reason: 'SOURCE_EDITION_OR_ROUTING_CHANGED', changes: [] };
  }
  if (routed(canonical, duplicate)) return { status: 'already_applied', changes: [] };
  // Preserve an unchanged capacity envelope; no queued assessment is completed.
  // Every provider/review hold and every changed or unclassified input still blocks.
  if ([canonical, duplicate].some(story => story.listed === false || story.retirement || story.living_file
    || story.provider_request_hold != null || story.review_checkpoint != null
    || (story.pending_update != null && !unchangedCapacityReview(story, at))
    || !sourceGateClear(story) || Date.parse(story.source_integrity.checked_at) > Date.parse(at))) {
    return { status: 'held', reason: 'SOURCE_EDITION_OR_ROUTING_CHANGED', changes: [] };
  }
  canonical.living_file = { merged_story_ids: [duplicate.story_id], consolidations: [{
    at, story_id: duplicate.story_id, slug: duplicate.slug, title: duplicate.title,
    reason: 'Zwei Quellfassungen desselben SWR-Artikels zur Explosion in Mannheim-Neckarstadt-West am 26. Oktober 2026',
  }] };
  duplicate.listed = false;
  duplicate.retired_at = at;
  duplicate.retirement = { at, reason_code: 'MERGED_INTO_LIVING_FILE', preserve_full_publication: true,
    canonical_story_ids: [canonical.story_id],
    canonical_stories: [{ story_id: canonical.story_id, slug: canonical.slug, title: canonical.title }],
    note: 'Diese separat vorbereitete Fassung betrifft denselben SWR-Quellartikel wie die verlinkte Wirkungsakte. Beide vollstaendigen Texte, Quellen, Bewertungen und historischen Fassungen bleiben erhalten. Die technische Zusammenfuehrung ist keine neue fachliche Pruefung oder unabhaengige Bestaetigung.' };
  return { status: 'applied', changes: [{ story_id: duplicate.story_id, canonical_story_id: canonical.story_id,
    reason: 'source_bound_mannheim_swr_duplicate_2026_10_26' }] };
}

// Alias routing may combine both paid packets. Unchanged packets must never
// commission a replacement; new evidence and explicit followups keep all gates.
export function retainedMannheimSwrPaidInput(candidate, stories) {
  if (candidate.story_id !== bindings[0].id || candidate.existing_story?.story_id !== bindings[0].id
    || candidate.reassessment || candidate.impact_reassessment || candidate.followup_due
    || candidate.deepening_due || candidate.consolidation) return false;
  const pair = bindings.map(binding => stories.filter(story => story.story_id === binding.id));
  if (pair.some(items => items.length !== 1)) return false;
  const [canonical, duplicate] = pair.map(items => items[0]);
  if (!editionMatches(canonical, bindings[0]) || !editionMatches(duplicate, bindings[1])
    || !editionMatches(candidate.existing_story, bindings[0]) || !routed(canonical, duplicate)
    || [canonical, duplicate, candidate.existing_story].some(story => openWork(story) || !sourceGateClear(story))) return false;
  const sources = candidate.sources;
  if (!Array.isArray(sources) || !sources.length || sources.some(source => !source || source.url !== url
    || source.article_excerpt || source.evidence_segments)) return false;
  const fingerprint = source => sourceReviewFingerprint({ ...source, published_at: null, source_published_at: null });
  const paid = new Set([...canonical.sources, ...duplicate.sources].map(fingerprint));
  return sources.every(source => paid.has(fingerprint(source)));
}
