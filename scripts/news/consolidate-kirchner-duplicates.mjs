// Source-bound listing repair, not a general political-topic matching rule.
// The two public originals were read on 18 October: both reproduce the same
// statement at the same Magdeburg event (MDR also credits dpa). These exact
// stored source editions are the only permitted pair. No quote is copied here.
const bindings = [
  { id: 'wt-c40c82d4edfed764',
    slug: 'afd-fraktionschef-kirchner-will-zusammenarbeit-mit-bsw-schriftlich-festhalten-fed764',
    published_at: '2026-10-18T12:23:08.354Z',
    url: 'https://www.mdr.de/nachrichten/sachsen-anhalt/landtagswahl/zusammenarbeit,afd-bsw-164.html',
    hash: '2e8cf6e54719dc14cd5a5f1688fd800254ec7f547359a0f2e8064bc19233c393' },
  { id: 'wt-08bdfc8f10adf883',
    slug: 'sachsen-anhalt-kirchner-will-afd-bsw-zusammenarbeit-schriftlich-regeln-adf883',
    published_at: '2026-10-18T12:24:10.218Z',
    url: 'https://www.stern.de/gesellschaft/regional/sachsen-anhalt/sachsen-anhalt--kirchner-will-afd-bsw-zusammenarbeit-schriftlich-regeln-38414802.html',
    hash: '91a19ae2a2e5060e0c899eb68de0ebfdeccdfcd160c376fb6667655f85290f85' },
];

export function consolidateKirchnerDuplicates(stories, at) {
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
    && canonical.living_file?.merged_story_ids?.includes(duplicate.story_id)
    && duplicate.listed === false && canonical.published && canonical.listed !== false && !canonical.retirement) {
    return { status: 'already_applied', changes: [] };
  }
  const matches = records.every((story, i) => story.published && story.listed !== false
    && story.current_version === 1 && story.slug === bindings[i].slug
    && story.published_at === bindings[i].published_at && Date.parse(at) >= Date.parse(story.published_at)
    && story.sources?.length === 1 && story.sources[0].url === bindings[i].url
    && story.sources[0].content_hash === bindings[i].hash
    && !story.pending_update && !story.retirement);
  if (!matches || duplicate.living_file?.merged_story_ids?.length
    || canonical.living_file?.merged_story_ids?.includes(duplicate.story_id)) {
    return { status: 'held', reason: 'SOURCE_EDITION_OR_ROUTING_CHANGED', changes: [] };
  }
  // Listing/routing only: retain each article, claims, exact source bindings,
  // dates, versions, original/current assessments and paid receipts unchanged.
  // Unlike a new analysis, this repair never creates a pending_update.
  canonical.living_file = {
    ...canonical.living_file,
    merged_story_ids: [...(canonical.living_file?.merged_story_ids || []), duplicate.story_id],
    consolidations: [...(canonical.living_file?.consolidations || []), {
      at, story_id: duplicate.story_id, slug: duplicate.slug, title: duplicate.title,
      reason: 'Quellengebunden dieselbe Kirchner-Aeusserung in Magdeburg am 18. Oktober 2026',
    }],
  };
  duplicate.listed = false;
  duplicate.retired_at = at;
  duplicate.retirement = {
    at, reason_code: 'MERGED_INTO_LIVING_FILE', canonical_story_ids: [canonical.story_id],
    canonical_stories: [{ story_id: canonical.story_id, slug: canonical.slug, title: canonical.title }],
    note: 'Diese Meldung berichtet ueber dieselbe Aeusserung wie die verlinkte fortgefuehrte Wirkungsakte. Der veroeffentlichte historische Stand und seine Quellen bleiben erhalten.',
  };
  return { status: 'applied', changes: [{ story_id: duplicate.story_id,
    canonical_story_id: canonical.story_id, reason: 'source_bound_kirchner_duplicate_2026_10_18' }] };
}
