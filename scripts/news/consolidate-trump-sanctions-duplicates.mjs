// One audited publisher URL change, not a general Trump/Russia topic rule.
// On 19 October the old DLF URL redirected to the second URL and both pages
// named that same canonical document. Retain both exact paid publications.
import { sourceReviewFingerprint } from './evidence-packets.mjs';

const bindings = [
  { id: 'wt-f166cf89aff14781',
    slug: 'trump-verteidigt-aussetzen-von-sanktionen-gegen-russland-gegen-kritik-f14781',
    published_at: '2026-10-19T07:07:24.430Z',
    content_hash: '1d1e86e5cf579f7e80a9b6cd9ca02ad3a4f7ad8f56a6fef51dfe09d4406bb4fc',
    sources: [
      ['https://www.stern.de/news/trump-verteidigt-aussetzen-von-sanktionen-gegen-russland-gegen-kritik-38416436.html',
        'fbda795f190afb93e34f90bef9574ec15498f6aa9445f595eeb6db03f98afa5b'],
      ['https://www.deutschlandfunk.de/trump-verteidigt-aussetzen-von-sanktionen-gegen-russland-100.html',
        '7082659af0d00f21a4efdb44a69749a778421ee3b38e40fc34b022212edf109e'],
    ] },
  { id: 'wt-e6f5bced9f7c773a',
    slug: 'ukraine-krieg-trump-verteidigt-aussetzen-von-russland-sanktionen-will-moskau-am-verhandl-7c773a',
    published_at: '2026-10-19T07:54:51.732Z',
    content_hash: 'f06ce20671e3d1bfe96c7b30e61daab17230b8e7d4208dd4606220d5d1bc13f1',
    sources: [
      ['https://www.deutschlandfunk.de/trump-verteidigt-aussetzen-von-russland-sanktionen-will-moskau-am-verhandlungstisch-halten-100.html',
        'e29d6085b92842f756b9d74426ac75a6a95714c1eebb48eb3efae43b64c516d0'],
    ] },
];

const sourcesMatch = (sources, binding) => Array.isArray(sources) && sources.length === binding.sources.length
  && binding.sources.every(([url, hash]) => sources.filter(source => source?.url === url
    && source.content_hash === hash).length === 1);

export function consolidateTrumpSanctionsDuplicates(stories, at) {
  if (!Number.isFinite(Date.parse(at))) throw new Error('INVALID_CONSOLIDATION_TIME');
  const records = bindings.map(binding => stories.find(story => story.story_id === binding.id));
  if (records.some(story => !story)) return { status: 'not_present', changes: [] };
  if (bindings.some(binding => stories.filter(story => story.story_id === binding.id).length !== 1)) {
    return { status: 'held', reason: 'STORY_ID_AMBIGUOUS', changes: [] };
  }
  const [canonical, duplicate] = records;
  const targets = duplicate.retirement?.canonical_story_ids;
  if (duplicate.retirement?.reason_code === 'MERGED_INTO_LIVING_FILE'
    && targets?.length === 1 && targets[0] === canonical.story_id
    && duplicate.retirement.preserve_full_publication === true
    && canonical.living_file?.merged_story_ids?.includes(duplicate.story_id)
    && duplicate.listed === false && canonical.published && canonical.listed !== false && !canonical.retirement) {
    return { status: 'already_applied', changes: [] };
  }
  // New editions, pending work and changed routing require a fresh review.
  // Preflight the entire pair before touching either publication.
  const matches = records.every((story, i) => {
    const binding = bindings[i];
    return story.published && story.listed !== false && !story.manual_only && !story.editorial_approval_hash
      && story.current_version === 1 && story.slug === binding.slug
      && story.published_at === binding.published_at && story.updated_at === binding.published_at
      && Date.parse(at) >= Date.parse(story.published_at) && story.content_hash === binding.content_hash
      && sourcesMatch(story.sources, binding)
      && story.pending_update == null && !story.retirement && !story.living_file;
  });
  if (!matches) return { status: 'held', reason: 'SOURCE_EDITION_OR_ROUTING_CHANGED', changes: [] };

  // Listing/routing only. No replacement analysis, pending_update, source
  // rewrite, reset of paid receipts or new claim is created here.
  canonical.living_file = {
    merged_story_ids: [duplicate.story_id],
    consolidations: [{ at, story_id: duplicate.story_id, slug: duplicate.slug, title: duplicate.title,
      reason: 'Derselbe berichtete Sanktionsvorgang nach belegter Adressaenderung der DLF-Quelle' }],
  };
  duplicate.listed = false;
  duplicate.retired_at = at;
  duplicate.retirement = {
    at, reason_code: 'MERGED_INTO_LIVING_FILE', canonical_story_ids: [canonical.story_id],
    preserve_full_publication: true,
    canonical_stories: [{ story_id: canonical.story_id, slug: canonical.slug, title: canonical.title }],
    note: 'Die DLF-Quelle wurde unter einer geaenderten Adresse erneut erfasst. Beide Meldungen betreffen denselben berichteten Vorgang. Die vollstaendigen veroeffentlichten Fassungen und ihre Quellen bleiben erhalten; diese Zusammenfuehrung ist keine neue inhaltliche Pruefung.',
  };
  return { status: 'applied', changes: [{ story_id: duplicate.story_id,
    canonical_story_id: canonical.story_id, reason: 'source_bound_dlf_sanctions_url_change_2026_10_19' }] };
}

// Routing an archived URL must not commission the same paid evidence again
// under the canonical story ID. This is a free input comparison, not a new
// factual assessment or an approval of the union of the two old analyses.
export function retainedSanctionsPaidInput(candidate, stories) {
  const canonical = candidate.existing_story;
  if (candidate.story_id !== bindings[0].id || canonical?.story_id !== bindings[0].id
    || !canonical.published || canonical.listed === false || canonical.retirement
    || canonical.current_version !== 1 || canonical.content_hash !== bindings[0].content_hash
    || !sourcesMatch(canonical.sources, bindings[0])
    || candidate.reassessment || candidate.impact_reassessment) return false;
  const duplicates = stories.filter(story => story.story_id === bindings[1].id);
  if (duplicates.length !== 1) return false;
  const [duplicate] = duplicates;
  if (!duplicate?.published || duplicate.current_version !== 1
    || duplicate.content_hash !== bindings[1].content_hash || duplicate.listed !== false
    || !sourcesMatch(duplicate.sources, bindings[1])
    || duplicate.retirement?.reason_code !== 'MERGED_INTO_LIVING_FILE'
    || duplicate.retirement.preserve_full_publication !== true
    || duplicate.retirement.canonical_story_ids?.length !== 1
    || duplicate.retirement.canonical_story_ids[0] !== canonical.story_id
    || !canonical.living_file?.merged_story_ids?.includes(duplicate.story_id)) return false;
  const sources = candidate.sources || [];
  if (!Array.isArray(sources) || sources.some(source => !source)
    || !sources.some(source => source.url === bindings[1].sources[0][0])) return false;
  const fingerprint = source => sourceReviewFingerprint({ ...source, published_at: null, source_published_at: null });
  const paid = new Set([...canonical.sources, ...duplicate.sources].map(fingerprint));
  return sources.every(source => paid.has(fingerprint(source)));
}
