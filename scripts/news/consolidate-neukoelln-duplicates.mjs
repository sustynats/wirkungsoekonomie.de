// Exact public source editions at 9e6001cad42fca83cf19eb16c4428c46daed92cf.
// Both records contain the same Tagesspiegel article 16197031, exact URL and
// content hash below. Berlin-Neukoelln/Neukoelln split their place anchors.
// Preserve the general place guard: this is not a city/borough alias rule,
// independent corroboration, an injury-count decision or a new paid review.
import { isDeepStrictEqual } from 'node:util';
import { sourceReviewFingerprint } from './evidence-packets.mjs';

const tag = 'https://www.tagesspiegel.de/berlin/';
const sharedUrl = tag + 'dpa-drei-verletzte-in-der-pannierstrasse--polizei-sucht-tater-16197031.html';
const sharedHash = 'f28075d2cbe169b3ddbaca7a8ea4208c7cc0b1ff5959a8875e7f71497539a5e3';
const bindings = [
  { id: 'wt-d9a097da62f6699b', event: 'event-0493619e207611e60822',
    slug: 'messerangriff-vor-einer-bar-in-berlin-neukolln-zwei-verletzte-in-der-pannierstrasse-tate-f6699b',
    at: '2026-10-24T10:36:55.302Z',
    content: 'a8569f8d24bd77195f9b054fa971ad58ce24345fd8ebfc9de36db08d407ac8b4',
    sources: [
      [tag + 'dpa-zwei-verletzte-in-der-pannierstrasse--tater-geflohen-16197031.html', 'f0e7c2b6d04d1613933cfaf43704c286858bec765ef255b5586c32f9ea20aefa'],
      [sharedUrl, sharedHash],
    ] },
  { id: 'wt-80497942dbedf5d8', event: 'event-625ad1a6b2aa1ff958d4',
    slug: 'angriff-vor-bar-messerangriff-in-neukollner-pannierstrasse-zwei-verletzte-edf5d8',
    at: '2026-10-24T10:38:00.025Z',
    content: 'e7609b59820021497aa83bb5f2fd9ae0ed16f30f7788b42c12e1665a20905510',
    sources: [
      ['https://www.stern.de/gesellschaft/regional/berlin-brandenburg/angriff-vor-bar--messerangriff-in-neukoellner-pannierstrasse---zwei-verletzte-38445606.html', '47a6bfe1394cab737369b3bd09bfe820162cc03b6eb35e4dbf2f131b2aeb55e6'],
      [tag + 'dpa-angriff-vor-bar-messerangriff-in-neukollner-pannierstrasse-zwei-verletzte-16197031.html', 'b034c194e5eb2dac6c8d6464027651358e0d1907bf5597ba6e5356e1c5af0ef3'],
      [sharedUrl, sharedHash],
    ] },
];
const editionMatches = (s, b) => s?.published === true && !s.manual_only && !s.editorial_approval_hash
  && s.current_version === 1 && s.event_id === b.event && s.slug === b.slug && s.content_hash === b.content
  && s.published_at === b.at && s.updated_at === b.at && Array.isArray(s.sources)
  && s.sources.length === b.sources.length
  && b.sources.every(([url, hash], i) => s.sources[i]?.url === url && s.sources[i]?.content_hash === hash);
const routed = (a, b) => a?.published && a.listed !== false && !a.retirement
  && isDeepStrictEqual(a.living_file?.merged_story_ids, [bindings[1].id])
  && a.living_file.consolidations?.length === 1 && a.living_file.consolidations[0].story_id === b?.story_id
  && b?.published && b.listed === false && !b.living_file
  && b.retirement?.reason_code === 'MERGED_INTO_LIVING_FILE' && b.retirement.preserve_full_publication === true
  && isDeepStrictEqual(b.retirement.canonical_story_ids, [bindings[0].id]);

export function consolidateNeukoellnDuplicates(stories, at) {
  if (!Number.isFinite(Date.parse(at))) throw Error('INVALID_CONSOLIDATION_TIME');
  const pair = bindings.map(b => stories.filter(s => s.story_id === b.id));
  if (pair.some(items => !items.length)) return { status: 'not_present', changes: [] };
  if (pair.some(items => items.length !== 1)) return { status: 'held', reason: 'STORY_ID_AMBIGUOUS', changes: [] };
  const [canonical, duplicate] = pair.map(items => items[0]);
  if (![canonical, duplicate].every((s, i) => editionMatches(s, bindings[i]) && Date.parse(s.updated_at) <= Date.parse(at))) {
    return { status: 'held', reason: 'SOURCE_EDITION_OR_ROUTING_CHANGED', changes: [] };
  }
  if (routed(canonical, duplicate)) return { status: 'already_applied', changes: [] };
  // Preflight both before mutation; an open/unknown review is never completed,
  // removed or silently converted into an already assessed source union.
  if ([canonical, duplicate].some(s => s.listed === false || s.retirement || s.living_file || s.pending_update != null)) {
    return { status: 'held', reason: 'SOURCE_EDITION_OR_ROUTING_CHANGED', changes: [] };
  }
  canonical.living_file = { merged_story_ids: [duplicate.story_id], consolidations: [{
    at, story_id: duplicate.story_id, slug: duplicate.slug, title: duplicate.title,
    reason: 'Dieselbe quellengebundene Meldung zum Messerangriff vor einer Bar in der Pannierstrasse am 24. Oktober 2026',
  }] };
  duplicate.listed = false;
  duplicate.retired_at = at;
  duplicate.retirement = { at, reason_code: 'MERGED_INTO_LIVING_FILE', canonical_story_ids: [canonical.story_id],
    preserve_full_publication: true,
    canonical_stories: [{ story_id: canonical.story_id, slug: canonical.slug, title: canonical.title }],
    note: 'Diese separat vorbereitete Fassung betrifft denselben Vorgang wie die verlinkte Wirkungsakte. Beide vollstaendigen Texte, Quellen und historischen Bewertungen bleiben erhalten. Die technische Zusammenfuehrung ist keine neue fachliche Pruefung, keine unabhaengige Bestaetigung und keine Klaerung abweichender Angaben zur Verletztenzahl.' };
  return { status: 'applied', changes: [{ story_id: duplicate.story_id, canonical_story_id: canonical.story_id,
    reason: 'source_bound_neukoelln_article_duplicate_2026_10_24' }] };
}

// Never buy a replacement for the unchanged union of these paid packets.
// New evidence, new excerpts and explicit or pending reviews retain all gates.
export function retainedNeukoellnPaidInput(candidate, stories) {
  if (candidate.story_id !== bindings[0].id || candidate.existing_story?.story_id !== bindings[0].id
    || candidate.reassessment || candidate.impact_reassessment || candidate.followup_due
    || candidate.deepening_due || candidate.consolidation || candidate.existing_story.pending_update != null) return false;
  const pair = bindings.map(b => stories.filter(s => s.story_id === b.id));
  if (pair.some(items => items.length !== 1)) return false;
  const [a, b] = pair.map(items => items[0]);
  if (!editionMatches(a, bindings[0]) || !editionMatches(b, bindings[1]) || !routed(a, b)
    || !editionMatches(candidate.existing_story, bindings[0])) return false;
  const sources = candidate.sources;
  if (!Array.isArray(sources) || !sources.length || !sources.some(s => s?.url === sharedUrl)
    || sources.some(s => !s || s.article_excerpt || s.evidence_segments)) return false;
  const fingerprint = s => sourceReviewFingerprint({ ...s, published_at: null, source_published_at: null });
  const paid = new Set([...a.sources, ...b.sources].map(fingerprint));
  return sources.every(s => paid.has(fingerprint(s)));
}
