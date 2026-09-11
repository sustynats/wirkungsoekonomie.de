// Public editorial timestamps, never ingestion or build time.
const timestampOrLast = value => Number.isFinite(Date.parse(value)) ? Date.parse(value) : -Infinity;
export function feedDate(value, type = "story") {
  const candidates = type === "analysis"
    ? [value.updated_at, value.published_at]
    : [value.last_updated, value.published_at];
  const dates = candidates.map(date => Date.parse(date)).filter(Number.isFinite);
  return dates.length ? new Date(Math.max(...dates)).toISOString() : "";
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
