// One audited incident, not a general place/name matching rule. Both free
// originals were read on 18 October: the same Friday-evening attack in a Kamen
// shelter, with the same ages, injury and overnight arrest (stern credits dpa;
// WDR cites Dortmund police). This is listing/routing only, not corroboration.
const bindings = [
  { id: 'wt-7d2d5761df9f3147',
    slug: 'kriminalitat-messerangriff-in-unterkunft-60-jahriger-schwer-verletzt-9f3147',
    published_at: '2026-10-18T14:50:10.442Z',
    url: 'https://www.stern.de/gesellschaft/regional/nordrhein-westfalen/kriminalitaet--messerangriff-in-unterkunft--60-jaehriger-schwer-verletzt-38415532.html',
    hash: 'e72285cb1f4fda5a494294aeb5a5e25d0ea52f7d24311cbc6887f8ad4dec692a',
    capacity_input_hash: '1eb32bfea0265f2d8e794b3cd6916c6000effd5d5369b5b43b731a8356fd6346',
    fingerprint: 'e3c53f74624eaee44d072f929448e057d2066e12b2e417d9e8f7fd63e7abcbad' },
  { id: 'wt-be36f8fa07ed8fe5',
    slug: 'messerangriff-in-obdachlosenheim-mann-schwer-verletzt-ed8fe5',
    published_at: '2026-10-18T17:02:27.848Z',
    url: 'https://www1.wdr.de/nrw/ruhrgebiet/kreis-unna/kamen-messeangriff-wohnheim-obdachlose-100.html',
    hash: '6f087b2e8cd62e906038d462bf06eb5a855801ba11074188962c3d89c75dcbc9',
    capacity_input_hash: 'c4e6e7ee2017612da9d53b59239b217ead5c972c7f81c0660351ba75fc510a17',
    fingerprint: '4e31710d83a9ddb33f8b01f0dfcc8cc88f74635a79d45367afe17743ee1314fd' },
];

const empty = value => Array.isArray(value) && value.length === 0;
const pendingKeys = new Set(['detected_at', 'content_hash', 'sources', 'reason', 'quality_errors',
  'quality_retry_count', 'quality_retry_after', 'reassessment', 'fresh', 'consolidation', 'source_integrity']);

function retainedCapacityHold(pending, binding, at) {
  if (pending == null) return true;
  if (typeof pending !== 'object' || Array.isArray(pending)) return false;
  // The regular 18:26 run queued these exact old inputs during preparation.
  // Preserve the open reviews, without clearing a hold or approving evidence.
  return Object.keys(pending).every(key => pendingKeys.has(key))
    && pending.detected_at === '2026-10-18T18:26:17.401Z' && Date.parse(at) >= Date.parse(pending.detected_at)
    && pending.content_hash === binding.capacity_input_hash
    && ['AI_BUDGET_OR_BATCH_LIMIT', 'AI_HOURLY_CALL_LIMIT'].includes(pending.reason)
    && pending.sources?.length === 1 && pending.sources[0].url === binding.url
    && pending.sources[0].content_hash === binding.hash
    && pending.fresh === false && pending.reassessment === false && pending.consolidation === false
    && empty(pending.quality_errors) && pending.quality_retry_count === 0 && pending.quality_retry_after === null
    && pending.source_integrity?.status === 'verified' && pending.source_integrity.publication_status === 'eligible'
    && pending.source_integrity.version === '1.2' && pending.source_integrity.fingerprint === binding.fingerprint
    && empty(pending.source_integrity.issue_codes) && empty(pending.source_integrity.warning_codes);
}

export function consolidateKamenDuplicates(stories, at) {
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
  // New source editions, other pending work or routing changes need a fresh review.
  // Preflight both records before touching either one.
  const matches = records.every((story, i) => story.published && story.listed !== false
    && story.current_version === 1 && story.slug === bindings[i].slug
    && story.published_at === bindings[i].published_at && story.updated_at === bindings[i].published_at
    && Date.parse(at) >= Date.parse(story.published_at)
    && story.sources?.length === 1 && story.sources[0].url === bindings[i].url
    && story.sources[0].content_hash === bindings[i].hash
    && retainedCapacityHold(story.pending_update, bindings[i], at)
    && !story.retirement && !story.living_file?.merged_story_ids?.length);
  if (!matches) return { status: 'held', reason: 'SOURCE_EDITION_OR_ROUTING_CHANGED', changes: [] };

  // Retain both texts, source bindings, histories, judgments and paid receipts.
  // In particular, do not create the pending analysis used by normal merges.
  canonical.living_file = {
    ...canonical.living_file, merged_story_ids: [duplicate.story_id],
    consolidations: [...(canonical.living_file?.consolidations || []), {
      at, story_id: duplicate.story_id, slug: duplicate.slug, title: duplicate.title,
      reason: 'Quellengebunden derselbe Messerangriff in einer Kamener Unterkunft am 16. Oktober 2026',
    }],
  };
  duplicate.listed = false;
  duplicate.retired_at = at;
  duplicate.retirement = {
    at, reason_code: 'MERGED_INTO_LIVING_FILE', canonical_story_ids: [canonical.story_id],
    preserve_full_publication: true,
    canonical_stories: [{ story_id: canonical.story_id, slug: canonical.slug, title: canonical.title }],
    note: 'Diese Meldung beschreibt denselben Vorgang wie die verlinkte fortgeführte Wirkungsakte. Der veröffentlichte historische Stand und seine Quellen bleiben erhalten; weitere Quellen werden vor einer inhaltlichen Aktualisierung erneut geprüft.',
  };
  return { status: 'applied', changes: [{ story_id: duplicate.story_id,
    canonical_story_id: canonical.story_id, reason: 'source_bound_kamen_duplicate_2026_10_18' }] };
}
