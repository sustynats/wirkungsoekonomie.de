// Audited on 19 October in the freely readable Stern/dpa and hessenschau
// originals: the same Monday 03:45 explosion at the Hofheim/Main-Taunus
// kebab shop, damaged entrance/windows and no reported injuries. This is
// incident identity, not independent corroboration or a new factual review.
import { sourceReviewFingerprint } from './evidence-packets.mjs';

const bindings = [
  { id: 'wt-6345bdbaf4e8fd51', version: 2,
    slug: 'einsatz-explosion-in-donerimbiss-in-hofheim-e8fd51',
    published_at: '2026-10-19T07:33:00.805Z', updated_at: '2026-10-19T13:43:06.205Z',
    content_hash: '65d21e70faf0b1bc2d619265cb1c3849f7b2a1ee6a09acdd39d9d5979151ec3b',
    sources: [
      ['https://www.stern.de/gesellschaft/regional/hessen/einsatz--explosion-in-doenerimbiss-in-hofheim-38417234.html',
        '1b66ecf99f047357ba2987e672a63d3a8f8cc3612759022621dcc8dbffcb5e51'],
      ['https://www.stern.de/gesellschaft/regional/hessen/einsatz--explosion-in-doenerimbiss---polizei-vermutet-vorsatz-38417234.html',
        'a951f6774890bf7ec4fac5f4488f98d7d221bd69f944b6df401f12afd50d13ee'],
    ] },
  { id: 'wt-e083b8d828fa80c8', version: 1,
    slug: 'anschlag-auf-doner-imbiss-in-hofheim-glasturen-und-fenster-zerstort-fa80c8',
    published_at: '2026-10-19T10:01:38.056Z', updated_at: '2026-10-19T10:01:38.056Z',
    content_hash: 'ed73e2e862ee3660ab0adb202f3310fdb7b430a50b578b9acaf24a5e647df42f',
    sources: [
      ['https://www.hessenschau.de/panorama/anschlag-auf-doener-imbiss-in-hofheim---glastueren-und-fenster-zerstoert-v1,hofheim-explosion-104.html',
        '448b78d37838b9b989dcc9ec2ca8247fbd31c543c56330b35f377245a2793801'],
    ] },
];

const sourcesMatch = (sources, binding) => Array.isArray(sources) && sources.length === binding.sources.length
  && binding.sources.every(([url, hash]) => sources.filter(source => source?.url === url
    && source.content_hash === hash).length === 1);
const editionMatches = (story, binding) => story?.published && !story.manual_only && !story.editorial_approval_hash
  && story.current_version === binding.version && story.slug === binding.slug
  && story.published_at === binding.published_at && story.updated_at === binding.updated_at
  && story.content_hash === binding.content_hash && sourcesMatch(story.sources, binding);
const routed = (canonical, duplicate) => canonical?.published && canonical.listed !== false && !canonical.retirement
  && duplicate?.published && duplicate.listed === false
  && duplicate.retirement?.reason_code === 'MERGED_INTO_LIVING_FILE'
  && duplicate.retirement.preserve_full_publication === true
  && duplicate.retirement.canonical_story_ids?.length === 1
  && duplicate.retirement.canonical_story_ids[0] === canonical.story_id
  && canonical.living_file?.merged_story_ids?.includes(duplicate.story_id);

export function consolidateHofheimDuplicates(stories, at) {
  if (!Number.isFinite(Date.parse(at))) throw Error('INVALID_CONSOLIDATION_TIME');
  const pair = bindings.map(binding => stories.find(story => story.story_id === binding.id));
  if (pair.some(story => !story)) return { status: 'not_present', changes: [] };
  if (bindings.some(binding => stories.filter(story => story.story_id === binding.id).length !== 1)) {
    return { status: 'held', reason: 'STORY_ID_AMBIGUOUS', changes: [] };
  }
  const [canonical, duplicate] = pair;
  if (routed(canonical, duplicate)) return { status: 'already_applied', changes: [] };
  if (!pair.every((story, i) => editionMatches(story, bindings[i]) && story.listed !== false
    && Date.parse(at) >= Date.parse(story.updated_at) && story.pending_update == null
    && !story.retirement && !story.living_file)) {
    return { status: 'held', reason: 'SOURCE_EDITION_OR_ROUTING_CHANGED', changes: [] };
  }
  // Routing only. Keep both paid texts, sources, dates, versions and receipts;
  // do not create a merged analysis or commission another paid union review.
  canonical.living_file = { merged_story_ids: [duplicate.story_id],
    consolidations: [{ at, story_id: duplicate.story_id, slug: duplicate.slug, title: duplicate.title,
      reason: 'Quellengebunden dieselbe Explosion an einem Hofheimer Imbiss am 19. Oktober 2026 gegen 03:45 Uhr' }] };
  duplicate.listed = false;
  duplicate.retired_at = at;
  duplicate.retirement = { at, reason_code: 'MERGED_INTO_LIVING_FILE',
    canonical_story_ids: [canonical.story_id], preserve_full_publication: true,
    canonical_stories: [{ story_id: canonical.story_id, slug: canonical.slug, title: canonical.title }],
    note: 'Diese Meldung beschreibt denselben Hofheimer Vorfall wie die verlinkte fortgefuehrte Wirkungsakte. Beide vollstaendigen historischen Fassungen, Quellen und Bewertungen bleiben erhalten. Diese Zusammenfuehrung ist keine neue inhaltliche Pruefung oder unabhaengige Bestaetigung.' };
  return { status: 'applied', changes: [{ story_id: duplicate.story_id,
    canonical_story_id: canonical.story_id, reason: 'source_bound_hofheim_duplicate_2026_10_19' }] };
}

export function retainedHofheimPaidInput(candidate, stories) {
  const canonical = candidate.existing_story;
  if (candidate.story_id !== bindings[0].id || canonical?.story_id !== bindings[0].id
    || !editionMatches(canonical, bindings[0]) || candidate.reassessment || candidate.impact_reassessment) return false;
  const duplicates = stories.filter(story => story.story_id === bindings[1].id);
  if (duplicates.length !== 1 || !editionMatches(duplicates[0], bindings[1]) || !routed(canonical, duplicates[0])) return false;
  const sources = candidate.sources || [];
  if (!Array.isArray(sources) || sources.some(source => !source)
    || !sources.some(source => source.url === bindings[1].sources[0][0])) return false;
  const fingerprint = source => sourceReviewFingerprint({ ...source, published_at: null, source_published_at: null });
  const paid = new Set([...canonical.sources, ...duplicates[0].sources].map(fingerprint));
  return sources.every(source => paid.has(fingerprint(source)));
}
