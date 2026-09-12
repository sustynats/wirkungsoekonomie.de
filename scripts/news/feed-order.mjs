// Public editorial timestamps, never ingestion or build time.
const timestampOrLast = value => Number.isFinite(Date.parse(value)) ? Date.parse(value) : -Infinity;
export function originalNewsDate(value) {
  if (Number.isFinite(Date.parse(value.source_published_at))) return new Date(value.source_published_at).toISOString();
  const sourceDates = (value.sources || [])
    .filter(source => !['legal_context', 'election_calendar', 'background', 'context', 'expert_context', 'party_programme'].includes(source.source_role))
    .map(source => Date.parse(source.source_published_at || source.published_at)).filter(Number.isFinite);
  return sourceDates.length ? new Date(Math.min(...sourceDates)).toISOString() : '';
}
export function feedDate(value, type = "story") {
  if (type === "story") {
    // A later import or MPD correction is not a new news event. Preserve the
    // original source date; only an explicitly documented news update moves it.
    const explicit = value.news_update_at || value.news_at;
    if (Number.isFinite(Date.parse(explicit))) return new Date(explicit).toISOString();
    const original = originalNewsDate(value);
    if (original) return original;
    if (Number.isFinite(Date.parse(value.published_at))) return new Date(value.published_at).toISOString();
  }
  const candidates = type === "analysis"
    ? [value.updated_at, value.published_at]
    : [value.last_updated, value.published_at];
  const dates = candidates.map(date => Date.parse(date)).filter(Number.isFinite);
  return dates.length ? new Date(Math.max(...dates)).toISOString() : "";
}

export function isLateNewsDelivery(story) {
  return !story.news_update_at && Date.parse(story.published_at) - Date.parse(feedDate(story)) > 3600000;
}

export function mixedFeedItems(stories, analyses) {
  const key = item => `${item.type}:${(item.type === "analysis" ? item.value.analysis_id : item.value.story_id) || item.value.slug || ""}`;
  const timestamp = item => timestampOrLast(feedDate(item.value, item.type));
  return [
    ...stories.map(value => ({ type: "story", value })),
    ...analyses.map(value => ({ type: "analysis", value })),
  ].sort((a, b) => timestamp(b) - timestamp(a) || (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0));
}

export function assertChronologicalFeedHtml(html) {
  let previous = Infinity;
  for (const [card] of html.matchAll(/<article\b(?=[^>]*\sdata-news-card(?:\s|>))[^>]*>/g)) {
    const date = card.match(/\bdata-news-updated-at="([^"]*)"/)?.[1];
    const current = timestampOrLast(date);
    if (current > previous) throw new Error("NEWS_FEED_NOT_CHRONOLOGICAL");
    previous = current;
  }
}
