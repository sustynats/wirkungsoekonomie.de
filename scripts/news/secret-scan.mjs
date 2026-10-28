// Keep every existing credential pattern. A reviewed public article identifier
// is not a credential; neither a company prefix nor an entire domain is exempt.
const patterns = [/\bsk-[A-Za-z0-9_-]{20,}\b/, /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, /\bAKIA[0-9A-Z]{16}\b/];
export const hasSecretPattern = text => patterns.some(pattern => pattern.test(text));

// The failed serial run 39933045712 contained precisely these two matches.
// Keep the source and article bytes untouched: this is only a scan projection.
const publicIdentifier = Object.freeze({
  story_id: 'wt-4d25b6e225eeafc4',
  source_id: 'manager-magazin-news',
  seen_key: 'dde74846bf7ac1435ddba77ebdc73a45075ce34e8cc777451e556fec2524b4e5',
  slug: 'sk-hynix-chipriese-sagt-borsengang-seiner-chip-sparte-in-den-usa-ab-eeafc4',
  url: 'https://www.manager-magazin.de/unternehmen/tech/sk-hynix-chipriese-sagt-boersengang-seiner-chip-sparte-in-den-usa-ab-a-657a2c87-be9b-4612-9171-b2d1b7a74b2f',
});

// Run 40618944489 found one further public company headline in its exact
// story and two retained RSS sources. These are complete identifiers, never
// a company-prefix/domain exception. Keep both deduplication records scoped.
const publicIdentifiers = [
  {...publicIdentifier, sources: [publicIdentifier]},
  {
    story_id: 'wt-22212d0a64c1c7eb',
    slug: 'ki-boom-sudkoreas-chipproduzent-sk-hynix-erzielt-erneut-rekordgewinn-c1c7eb',
    sources: [
      {
        source_id: 'stern-schlagzeilen',
        seen_key: 'd4eca2891eb94ae8bc3a0920b8bd1ba877d1c69060513f851711c839e5174247',
        url: 'https://www.stern.de/wirtschaft/news/ki-boom--suedkoreas-chipproduzent-sk-hynix-erzielt-erneut-rekordgewinn-38461416.html',
      },
      {
        source_id: 'tagesspiegel-home',
        seen_key: 'aa83375b04fa5886e289f99fbb747d67316f68fd4c16ff576273621c445e82f1',
        url: 'https://www.tagesspiegel.de/wirtschaft/dpa-ki-boom-sudkoreas-chipproduzent-sk-hynix-erzielt-erneut-rekordgewinn-16208091.html',
      },
    ],
  },
];

// Run 40651102046 retained this public RSS permalink only in seen_items,
// without an accepted story. Exempt that exact row, not any story or domain.
const publicSeenSources = [
  ...publicIdentifiers.flatMap(identifier => identifier.sources),
  {
    source_id: 'stern-schlagzeilen',
    seen_key: 'ed3f30127d2175830133a4f201903278da58dda23618303bf4ed5461e32227da',
    url: 'https://www.stern.de/news/suedkoreas-chip-hersteller-sk-hynix-verbucht-erneuten-umsatz--und-gewinnrekord-38462334.html',
  },
];

export function newsroomSecretScanText(store) {
  const approvedSources = new WeakMap();
  const approvedStories = new WeakMap();
  for (const story of store?.stories || []) {
    const identifier = publicIdentifiers.find(item => story?.story_id === item.story_id && story.slug === item.slug);
    if (!identifier) continue;
    const sources = (story.sources || []).filter(source => identifier.sources.some(item => source?.source_id === item.source_id && source.url === item.url));
    if (!sources.length) continue;
    approvedStories.set(story, identifier.slug);
    for (const source of sources) approvedSources.set(source, source.url);
  }
  return JSON.stringify(store, function (key, value) {
    if (key === 'slug' && approvedStories.has(this) && value === approvedStories.get(this)) return '[reviewed public article slug]';
    if (key === 'url' && approvedSources.has(this) && value === approvedSources.get(this)) return '[reviewed public source URL]';
    return value;
  });
}

// Run 39948979901 passed the story scan, then found the very same URL in
// state.seen_items. Keep every URL bound to its exact deduplication record.
export function stateSecretScanText(state) {
  const approved = new WeakMap();
  for (const source of publicSeenSources) {
    const seen = state?.seen_items?.[source.seen_key];
    if (seen?.source_id === source.source_id && seen.url === source.url) approved.set(seen, source.url);
  }
  return JSON.stringify(state, function (key, value) {
    if (key === 'url' && approved.has(this) && value === approved.get(this)) return '[reviewed public source URL]';
    return value;
  });
}
