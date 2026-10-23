// One source-bound announcement, not a generic city/ceasefire matching rule.
// The tagesschau original read on 23 October and the registered SPIEGEL RSS
// excerpt identify the same White House announcement about Oleschky evacuation.
// https://www.tagesschau.de/ausland/melania-trump-waffenruhe-oleschky-100.html
// This routing correction establishes neither implementation nor corroboration.
import { isDeepStrictEqual } from 'node:util';
import { sourceReviewFingerprint } from './evidence-packets.mjs';

const bindings = [
  { id: 'wt-d3c8c9e82ec31eda', event: 'event-ae811193ac69dda92ffe',
    slug: 'waffenruhe-fur-von-russland-besetzter-ukrainischer-stadt-c31eda',
    at: '2026-10-23T18:33:55.798Z',
    content: 'c93dbc6e5c0449fa33f6f68ba4412de85a178a4834b5baefe534c332de784335',
    url: 'https://www.tagesschau.de/ausland/melania-trump-waffenruhe-oleschky-100.html',
    hash: 'f1827e3bab2c42b9b8355f5e098d0313dbcfd0049f4c5321f2ec27e4399ca818' },
  { id: 'wt-fff6aabad12c6e77', event: 'event-3c497cc5aba03182d892',
    slug: 'ukraine-russland-krieg-melania-trump-verkundet-lokale-waffenruhe-verkunden-kreml-und-kyj-2c6e77',
    at: '2026-10-23T19:00:21.102Z',
    content: '8a23d8538c09bab3f3f3bf3ec8f53dc97326699d2f44160799fdfc0fd0fd7ef8',
    url: 'https://www.spiegel.de/ausland/ukraine-russland-krieg-melania-trump-verkuendet-lokale-waffenruhe-verkuenden-kreml-und-kyjiw-bestaetigen-a-7c266a41-621e-4d77-80d8-cc4dd675ecf6',
    hash: '229438fd9d4de75980ae406a16be295bcd6f4078ca54a20687d7d741dde1531a' },
];
const before = (value, at) => Number.isFinite(Date.parse(value)) && Date.parse(value) <= Date.parse(at);
const editionMatches = (s, b) => s?.published === true && !s.manual_only && !s.editorial_approval_hash
  && s.current_version === 1 && s.event_id === b.event && s.slug === b.slug && s.content_hash === b.content
  && s.published_at === b.at && s.updated_at === b.at && Array.isArray(s.sources) && s.sources.length === 1
  && s.sources[0]?.url === b.url && s.sources[0]?.content_hash === b.hash;
const routed = (a, b) => a?.published && a.listed !== false && !a.retirement
  && isDeepStrictEqual(a.living_file?.merged_story_ids, [bindings[1].id])
  && a.living_file.consolidations?.length === 1 && a.living_file.consolidations[0].story_id === b?.story_id
  && b?.published && b.listed === false && !b.living_file
  && b.retirement?.reason_code === 'MERGED_INTO_LIVING_FILE' && b.retirement.preserve_full_publication === true
  && isDeepStrictEqual(b.retirement.canonical_story_ids, [bindings[0].id]);
const paidFingerprint = s => sourceReviewFingerprint({ ...s, published_at: null, source_published_at: null });

export function consolidateOleschkyDuplicates(stories, at) {
  if (!Number.isFinite(Date.parse(at))) throw Error('INVALID_CONSOLIDATION_TIME');
  const pair = bindings.map(b => stories.filter(s => s.story_id === b.id));
  if (pair.some(items => !items.length)) return { status: 'not_present', changes: [] };
  if (pair.some(items => items.length !== 1)) return { status: 'held', reason: 'STORY_ID_AMBIGUOUS', changes: [] };
  const [canonical, duplicate] = pair.map(items => items[0]);
  if (![canonical, duplicate].every((s, i) => editionMatches(s, bindings[i]) && before(s.updated_at, at))) {
    return { status: 'held', reason: 'SOURCE_EDITION_OR_ROUTING_CHANGED', changes: [] };
  }
  if (routed(canonical, duplicate)) return { status: 'already_applied', changes: [] };
  // Unknown pending work or prior routing needs another explicit review.
  // Preflight both records before mutating either; never clear an open review.
  if ([canonical, duplicate].some(s => s.listed === false || s.retirement || s.living_file || s.pending_update != null)) {
    return { status: 'held', reason: 'SOURCE_EDITION_OR_ROUTING_CHANGED', changes: [] };
  }
  canonical.living_file = { merged_story_ids: [duplicate.story_id], consolidations: [{
    at, story_id: duplicate.story_id, slug: duplicate.slug, title: duplicate.title,
    reason: 'Dieselbe am 23. Oktober 2026 berichtete Ankuendigung einer lokalen Waffenruhe fuer die Evakuierung aus Oleschky',
  }] };
  duplicate.listed = false;
  duplicate.retired_at = at;
  duplicate.retirement = { at, reason_code: 'MERGED_INTO_LIVING_FILE', canonical_story_ids: [canonical.story_id],
    preserve_full_publication: true,
    canonical_stories: [{ story_id: canonical.story_id, slug: canonical.slug, title: canonical.title }],
    note: 'Diese separat vorbereitete Fassung betrifft dieselbe Ankuendigung wie die verlinkte Wirkungsakte. Beide vollstaendigen Texte, Quellen und historischen Bewertungen bleiben erhalten. Die technische Zusammenfuehrung ist keine neue fachliche Pruefung und kein Nachweis einer eingehaltenen Waffenruhe oder erfolgten Evakuierung.' };
  return { status: 'applied', changes: [{ story_id: duplicate.story_id, canonical_story_id: canonical.story_id,
    reason: 'source_bound_oleschky_announcement_duplicate_2026_10_23' }] };
}

// Routing can create a union of two already paid source packets. That is not
// new evidence and must not buy a replacement answer. Leave pending work intact;
// genuinely new evidence and scheduled followups retain their ordinary gates.
export function retainedOleschkyPaidInput(candidate, stories) {
  if (candidate.story_id !== bindings[0].id || candidate.existing_story?.story_id !== bindings[0].id
    || candidate.reassessment || candidate.impact_reassessment || candidate.followup_due
    || candidate.deepening_due || candidate.consolidation) return false;
  const pair = bindings.map(b => stories.filter(s => s.story_id === b.id));
  if (pair.some(items => items.length !== 1)) return false;
  const [a, b] = pair.map(items => items[0]);
  if (!editionMatches(a, bindings[0]) || !editionMatches(b, bindings[1]) || !routed(a, b)
    || !editionMatches(candidate.existing_story, bindings[0])) return false;
  const sources = candidate.sources;
  if (!Array.isArray(sources) || !sources.length || !sources.some(s => s?.url === bindings[1].url)
    || sources.some(s => !s || s.article_excerpt || s.evidence_segments)) return false;
  const paid = new Set([...a.sources, ...b.sources].map(paidFingerprint));
  return sources.every(s => paid.has(paidFingerprint(s)));
}
