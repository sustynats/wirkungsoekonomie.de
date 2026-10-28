// Two separately paid stern RSS editions describe the same reported Regensburg
// apartment-house explosion on 28 October. This exact source-packet mapping is
// routing only: no independent factual confirmation, union review or paid retry.
import { isDeepStrictEqual } from 'node:util';
import { sourceReviewFingerprint } from './evidence-packets.mjs';
import { unchangedCapacityReview as capacityReview } from './unchanged-capacity-review.mjs';

const oldUrl = "https://www.stern.de/news/explosion-in-mehrfamilienhaus-in-regensburg--mehrere-vermisste-und-verletzte-38464170.html";
const url = "https://www.stern.de/gesellschaft/regional/bayern/vier-verletzte-bewohner--zwei-vermisste-nach-explosion-noch-im-haus-vermutet-38463982.html";
const bindings = [
  {
    "id": "wt-41df57c52e467296",
    "url": "https://www.stern.de/news/explosion-in-mehrfamilienhaus-in-regensburg--mehrere-vermisste-und-verletzte-38464170.html",
    "event": "event-f5055de2284b2e0b87f9",
    "slug": "explosion-in-mehrfamilienhaus-in-regensburg-mehrere-vermisste-und-verletzte-467296",
    "at": "2026-10-28T12:05:34.775Z",
    "content": "f87c84db3c94a81e2bf40f7a5795f648e69060ce109e4c66480dbd6b5bfcd0a1",
    "source": "dd6c57150c04983dc4e522942301fa409e8bf914e73e43b485c1b8ef1783d343"
  },
  {
    "id": "wt-5dd3a4504b51a73e",
    "url": "https://www.stern.de/gesellschaft/regional/bayern/vier-verletzte-bewohner--zwei-vermisste-nach-explosion-noch-im-haus-vermutet-38463982.html",
    "event": "event-46932b7402c538e75f58",
    "slug": "vier-verletzte-bewohner-zwei-vermisste-nach-explosion-noch-im-haus-vermutet-51a73e",
    "at": "2026-10-28T12:06:41.166Z",
    "content": "e7d8a598102434908828215ee91289d3edbfb2f04ba70694250a6b053ad6d808",
    "source": "44e6d97d7a13d76119c592750922b8fc243f749bfd91c6f3f872a6d743c60ebb"
  }
];
const editionMatches = (story, binding) => story?.published === true && !story.manual_only && !story.editorial_approval_hash
  && story.analysis_status === 'veröffentlicht'
  && story.current_version === 1 && story.event_id === binding.event && story.slug === binding.slug
  && story.published_at === binding.at && story.updated_at === binding.at && story.content_hash === binding.content
  && story.sources?.length === 1 && story.sources[0]?.url === binding.url
  && story.sources[0].source_id === 'stern-schlagzeilen' && story.sources[0].content_hash === binding.source;
// Only the existing verified capacity envelope is admitted. Its stored fields
// remain untouched; changed evidence and all other holds keep their gates.
const openWork = (story, at) => story.provider_request_hold != null || story.review_checkpoint != null
  || (story.pending_update != null && !capacityReview(story, at));
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

export function consolidateRegensburgDuplicates(stories, at) {
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
    || (story.pending_update != null && !capacityReview(story, at))
    || !sourceGateClear(story) || Date.parse(story.source_integrity.checked_at) > Date.parse(at))) {
    return { status: 'held', reason: 'SOURCE_EDITION_OR_ROUTING_CHANGED', changes: [] };
  }
  canonical.living_file = { merged_story_ids: [duplicate.story_id], consolidations: [{
    at, story_id: duplicate.story_id, slug: duplicate.slug, title: duplicate.title,
    reason: 'Zwei stern-RSS-Meldungen zum selben berichteten Regensburger Explosionsereignis am 28. Oktober 2026',
  }] };
  duplicate.listed = false;
  duplicate.retired_at = at;
  duplicate.retirement = { at, reason_code: 'MERGED_INTO_LIVING_FILE', preserve_full_publication: true,
    canonical_story_ids: [canonical.story_id],
    canonical_stories: [{ story_id: canonical.story_id, slug: canonical.slug, title: canonical.title }],
    note: 'Diese separat vorbereitete Fassung betrifft denselben von stern berichteten Regensburger Vorfall wie die verlinkte Wirkungsakte. Beide vollstaendigen Texte, Quellen, Bewertungen und historischen Fassungen bleiben erhalten. Die technische Zusammenfuehrung ist keine neue fachliche Pruefung oder unabhaengige Bestaetigung.' };
  return { status: 'applied', changes: [{ story_id: duplicate.story_id, canonical_story_id: canonical.story_id,
    reason: 'source_bound_regensburg_duplicate_2026_10_28' }] };
}

// Alias routing may combine both paid packets. Unchanged packets must never
// commission a replacement; new evidence and explicit followups keep all gates.
export function retainedRegensburgPaidInput(candidate, stories, at) {
  if (!Number.isFinite(Date.parse(at))) return false;
  if (candidate.story_id !== bindings[0].id || candidate.existing_story?.story_id !== bindings[0].id
    || candidate.reassessment || candidate.impact_reassessment || candidate.followup_due
    || candidate.deepening_due || candidate.consolidation) return false;
  const pair = bindings.map(binding => stories.filter(story => story.story_id === binding.id));
  if (pair.some(items => items.length !== 1)) return false;
  const [canonical, duplicate] = pair.map(items => items[0]);
  if (!editionMatches(canonical, bindings[0]) || !editionMatches(duplicate, bindings[1])
    || !editionMatches(candidate.existing_story, bindings[0]) || !routed(canonical, duplicate)
    || [canonical, duplicate, candidate.existing_story].some(story => openWork(story, at) || !sourceGateClear(story) || Date.parse(story.source_integrity.checked_at) > Date.parse(at))) return false;
  const sources = candidate.sources;
  if (!Array.isArray(sources) || !sources.length || sources.some(source => !source || ![oldUrl, url].includes(source.url)
    || source.article_excerpt || source.evidence_segments)) return false;
  const fingerprint = source => sourceReviewFingerprint({ ...source, published_at: null, source_published_at: null });
  const paid = new Set([...canonical.sources, ...duplicate.sources].map(fingerprint));
  return sources.every(source => paid.has(fingerprint(source)));
}
