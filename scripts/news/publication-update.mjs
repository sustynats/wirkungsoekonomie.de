// Presentation-only receipts. A fetch, queue attempt, regrouping or image
// rebuild is not a new public content version and must not refresh the banner.
const time = value => typeof value === "string" ? Date.parse(value) : NaN;

export function publishedContentRevision(story) {
  if (!story?.published || story.listed === false) return null;
  const first = time(story.published_at);
  if (!Number.isFinite(first)) return null;
  const current = Number(story.current_version || 1);
  const valid = (version, at) => Number.isSafeInteger(current) && current >= 1
    && Number(version) === current && Number.isFinite(time(at)) && time(at) >= first;
  const receipt = (story.publication_history || []).filter(entry => valid(entry.version, entry.published_at))
    .sort((a, b) => time(b.published_at) - time(a.published_at))[0];
  const snapshot = (story.versions || []).filter(entry => valid(entry.version, entry.analyzed_at))
    .sort((a, b) => time(b.analyzed_at) - time(a.analyzed_at))[0];
  const at = receipt?.published_at || snapshot?.analyzed_at || story.published_at;
  const version = receipt || snapshot ? current : 1;
  return { at: new Date(at).toISOString(), is_update: version > 1 && time(at) > first };
}

export function caseContentUpdatedAt(members) {
  const unique = [...new Map(members.filter(story => story.story_id).map(story => [story.story_id, story])).values()];
  const published = unique.map(story => ({ first: time(story.published_at), revision: publishedContentRevision(story) })).filter(item => item.revision);
  if (published.length < 2) return null;
  const first = Math.min(...published.map(item => item.first));
  const latest = Math.max(...published.map(item => time(item.revision.at)));
  return latest > first ? new Date(latest).toISOString() : null;
}

export function storyUpdateNotice(story, caseFile = story?.case_file) {
  const revision = publishedContentRevision(story);
  if (!revision) return null;
  if (caseFile && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(caseFile.representative_slug || "") && Number.isFinite(time(caseFile.content_updated_at))) {
    return { at: new Date(caseFile.content_updated_at).toISOString(), scope: "case", slug: caseFile.representative_slug };
  }
  return revision.is_update ? { at: revision.at, scope: "story", slug: story.slug } : null;
}
