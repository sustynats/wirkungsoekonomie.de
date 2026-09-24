// Public editorial timestamps, never ingestion or build time.
const timestampOrLast = value => Number.isFinite(Date.parse(value)) ? Date.parse(value) : -Infinity;

export const isEpisodeReview = value => ['listened', 'watched'].includes(value?.subtype);

// Originalfolgen sind nach ihrem Berliner Kalendertag geordnet, nicht nach
// Import, Freigabe oder spaeterer Korrektur der Besprechung. Altdaten enthalten
// sowohl ISO-Zeitstempel als auch ISO- und deutsche Datumsangaben.
export function originalEpisodeDate(value) {
  if (!isEpisodeReview(value)) return '';
  const raw = String(value.source_media?.original_release_date || '').trim();
  const german = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  const iso = german ? `${german[3]}-${german[2].padStart(2, '0')}-${german[1].padStart(2, '0')}` : raw;
  if (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/.test(iso)) return '';
  const day = iso.slice(0, 10), date = new Date(`${day}T00:00:00.000Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== day) return '';
  if (iso.length === 10) return day;
  const instant = new Date(iso);
  if (!Number.isFinite(instant.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', {timeZone:'Europe/Berlin', year:'numeric', month:'2-digit', day:'2-digit'}).format(instant);
}

export function episodeDateLabel(value) {
  if (!isEpisodeReview(value)) return '';
  const date = originalEpisodeDate(value);
  if (!date) return 'Datum der Originalfolge nicht angegeben';
  return `${value.subtype === 'watched' ? 'Sendung' : 'Folge'} vom ${date.slice(8)}.${date.slice(5, 7)}.${date.slice(0, 4)}`;
}

export function originalNewsDate(value) {
  if (Number.isFinite(Date.parse(value.source_published_at))) return new Date(value.source_published_at).toISOString();
  const sourceDates = (value.sources || [])
    .filter(source => !['legal_context', 'election_calendar', 'background', 'context', 'expert_context', 'party_programme'].includes(source.source_role))
    .map(source => Date.parse(source.source_published_at || source.published_at)).filter(Number.isFinite);
  return sourceDates.length ? new Date(Math.min(...sourceDates)).toISOString() : '';
}
export function feedDate(value, type = "story") {
  if (type === 'analysis' && isEpisodeReview(value)) {
    const day = originalEpisodeDate(value);
    // Mitternacht ist nur der gemeinsame Sortierschluessel fuer den Tag,
    // keine behauptete Sendezeit. Publikations- und Aenderungsdaten bleiben erhalten.
    if (day) return `${day}T00:00:00.000Z`;
    return Number.isFinite(Date.parse(value.published_at)) ? new Date(value.published_at).toISOString() : '';
  }
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
