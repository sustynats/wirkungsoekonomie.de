// Two paid URL/headline editions of stern/dpa article 38451374. The old
// publisher URL redirects to the new canonical URL; the free full article was
// read in the ordinary browser on 26 October. Other Mannheim sources remain
// outside this source-bound mapping. No paid text or assessment is replaced.
import { isDeepStrictEqual } from 'node:util';
import { sourceReviewFingerprint } from './evidence-packets.mjs';
import { unchangedCapacityReview } from './unchanged-capacity-review.mjs';

const oldUrl = 'https://www.stern.de/gesellschaft/regional/baden-wuerttemberg/kriminalpolizei-ermittelt--explosion-in-mannheimer-caf%C3%A9---angriff-mit-sprengkoerper--38451374.html';
const url = 'https://www.stern.de/gesellschaft/regional/baden-wuerttemberg/kriminalpolizei-ermittelt--verletzter-bei-explosion-in-caf%C3%A9---wer-steckt-dahinter--38451374.html';
const bindings = [
  { id: 'wt-a20c5882ecfee0cf', url: oldUrl, event: 'event-1351b3d83809d23417ab',
    slug: 'kriminalpolizei-ermittelt-explosion-in-mannheimer-cafe-angriff-mit-sprengkorper-fee0cf', at: '2026-10-26T06:54:13.788Z',
    content: '173c233826e90a54c68cfd810e8395ab644a5b2079afd1ef8f3bfe069a2e1649',
    source: 'd9ceb0f51389b5fca747e657f74c5e30963b1c84aa34ef4015af33800c2b24b3' },
  { id: 'wt-2c796868270ba89b', url, event: 'event-1959b6efd600e274030b',
    slug: 'kriminalpolizei-ermittelt-verletzter-bei-explosion-in-cafe-wer-steckt-dahinter-0ba89b', at: '2026-10-26T10:57:28.879Z',
    content: '52f3c8401faa1f0dc594b6c71f041fa1b222cfa9f7d3b8ecfd6e03bfa23392c9',
    source: '4c66a523162689bbf4f6a9269f3a10d8531d1dd79a951147f4f96979321b46db' },
];
const editionMatches = (story, binding) => story?.published === true && !story.manual_only && !story.editorial_approval_hash
  && story.analysis_status === 'veröffentlicht'
  && story.current_version === 1 && story.event_id === binding.event && story.slug === binding.slug
  && story.published_at === binding.at && story.updated_at === binding.at && story.content_hash === binding.content
  && story.sources?.length === 1 && story.sources[0]?.url === binding.url
  && story.sources[0].source_id === 'stern-schlagzeilen' && story.sources[0].content_hash === binding.source;
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

export function consolidateMannheimSternDuplicates(stories, at) {
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
    reason: 'Zwei Quellfassungen desselben stern/dpa-Artikels 38451374 zur Explosion in Mannheim-Neckarstadt-West am 26. Oktober 2026',
  }] };
  duplicate.listed = false;
  duplicate.retired_at = at;
  duplicate.retirement = { at, reason_code: 'MERGED_INTO_LIVING_FILE', preserve_full_publication: true,
    canonical_story_ids: [canonical.story_id],
    canonical_stories: [{ story_id: canonical.story_id, slug: canonical.slug, title: canonical.title }],
    note: 'Diese separat vorbereitete Fassung betrifft denselben stern/dpa-Quellartikel wie die verlinkte Wirkungsakte. Beide vollstaendigen Texte, Quellen, Bewertungen und historischen Fassungen bleiben erhalten. Die technische Zusammenfuehrung ist keine neue fachliche Pruefung oder unabhaengige Bestaetigung.' };
  return { status: 'applied', changes: [{ story_id: duplicate.story_id, canonical_story_id: canonical.story_id,
    reason: 'source_bound_mannheim_stern_duplicate_2026_10_26' }] };
}

// Alias routing may combine both paid packets. Unchanged packets must never
// commission a replacement; new evidence and explicit followups keep all gates.
export function retainedMannheimSternPaidInput(candidate, stories) {
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
  if (!Array.isArray(sources) || !sources.length || sources.some(source => !source || ![oldUrl, url].includes(source.url)
    || source.article_excerpt || source.evidence_segments)) return false;
  const fingerprint = source => sourceReviewFingerprint({ ...source, published_at: null, source_published_at: null });
  const paid = new Set([...canonical.sources, ...duplicate.sources].map(fingerprint));
  return sources.every(source => paid.has(fingerprint(source)));
}
