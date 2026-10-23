// Keep every existing credential pattern. A reviewed public article identifier
// is not a credential; neither a company prefix nor an entire domain is exempt.
const patterns = [/\bsk-[A-Za-z0-9_-]{20,}\b/, /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, /\bAKIA[0-9A-Z]{16}\b/];
export const hasSecretPattern = text => patterns.some(pattern => pattern.test(text));

// The failed serial run 39933045712 contained precisely these two matches.
// Keep the source and article bytes untouched: this is only a scan projection.
const publicIdentifier = Object.freeze({
  story_id: 'wt-4d25b6e225eeafc4',
  source_id: 'manager-magazin-news',
  slug: 'sk-hynix-chipriese-sagt-borsengang-seiner-chip-sparte-in-den-usa-ab-eeafc4',
  url: 'https://www.manager-magazin.de/unternehmen/tech/sk-hynix-chipriese-sagt-boersengang-seiner-chip-sparte-in-den-usa-ab-a-657a2c87-be9b-4612-9171-b2d1b7a74b2f',
});

export function newsroomSecretScanText(store) {
  const approvedSources = new WeakSet();
  const approvedStories = new WeakSet();
  for (const story of store?.stories || []) {
    if (story?.story_id !== publicIdentifier.story_id || story.slug !== publicIdentifier.slug) continue;
    const sources = (story.sources || []).filter(source => source?.source_id === publicIdentifier.source_id && source.url === publicIdentifier.url);
    if (!sources.length) continue;
    approvedStories.add(story);
    for (const source of sources) approvedSources.add(source);
  }
  return JSON.stringify(store, function (key, value) {
    if (key === 'slug' && approvedStories.has(this) && value === publicIdentifier.slug) return '[reviewed public article slug]';
    if (key === 'url' && approvedSources.has(this) && value === publicIdentifier.url) return '[reviewed public source URL]';
    return value;
  });
}
