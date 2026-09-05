const METRICS = [
  "scheduled", "fetch_successes", "fetch_failures", "feed_items", "new_items",
  "updated_items", "unchanged_items", "future_dated_items", "story_candidates",
  "local_rejections", "eligible_stories", "queue_retries", "ai_selected",
  "capacity_deferred", "source_integrity_holds", "editorial_rejections",
  "technical_retries", "published_stories", "updated_stories",
  "items_seen", "items_local_rejected", "items_duplicate", "items_existing_story",
  "items_short_ai_checked", "items_full_analyzed", "items_published",
  "items_story_updates", "items_primary_source_found",
  "items_source_integrity_failed", "items_corrected_later",
  "ai_input_tokens", "ai_output_tokens", "estimated_ai_cost",
  "parse_failures",
];

const METRIC_ALIASES = Object.freeze({
  feed_items: "items_seen",
  local_rejections: "items_local_rejected",
  unchanged_items: "items_duplicate",
  published_stories: "items_published",
  updated_stories: "items_story_updates",
  source_integrity_holds: "items_source_integrity_failed",
});

function rowFor(source = {}) {
  return {
    source_id: source.source_id,
    name: source.name || source.publisher || source.source_id,
    publisher_id: source.publisher_id || source.source_id,
    source_role: source.source_role || (source.primary_source ? "institutional_statement" : "journalistic_report"),
    topic: source.topic || null,
    ...Object.fromEntries(METRICS.map((metric) => [metric, 0])),
  };
}

export function createSourceFunnel(enabledSources = [], dueSources = []) {
  const rows = new Map(enabledSources.map((source) => [source.source_id, rowFor(source)]));
  for (const source of dueSources) bumpSourceFunnel(rows, source.source_id, "scheduled");
  return rows;
}

export function bumpSourceFunnel(rows, sourceId, metric, amount = 1) {
  if (!sourceId || !METRICS.includes(metric)) return;
  if (!rows.has(sourceId)) rows.set(sourceId, rowFor({ source_id: sourceId }));
  rows.get(sourceId)[metric] += Number(amount || 0);
  const alias = METRIC_ALIASES[metric];
  if (alias) rows.get(sourceId)[alias] += Number(amount || 0);
}

export function bumpCandidateFunnel(rows, candidate, metric, amount = 1) {
  const sourceIds = new Set((candidate?.sources || []).map((source) => source.source_id).filter(Boolean));
  for (const sourceId of sourceIds) bumpSourceFunnel(rows, sourceId, metric, amount);
  if (metric === "story_candidates") {
    if (candidate?.existing_story) for (const sourceId of sourceIds) bumpSourceFunnel(rows, sourceId, "items_existing_story", amount);
    if ((candidate?.sources || []).some((source) => source.primary_source)) for (const sourceId of sourceIds) bumpSourceFunnel(rows, sourceId, "items_primary_source_found", amount);
  }
}

export function finalizeSourceFunnel(rows) {
  return [...rows.values()]
    .filter((row) => METRICS.some((metric) => row[metric] > 0))
    .sort((left, right) => (
      right.published_stories - left.published_stories
      || right.updated_stories - left.updated_stories
      || right.ai_selected - left.ai_selected
      || right.new_items - left.new_items
      || left.source_id.localeCompare(right.source_id)
    ));
}

export function summarizeSourceFunnel(rows = []) {
  const totals = Object.fromEntries(METRICS.map((metric) => [metric, rows.reduce((sum, row) => sum + Number(row?.[metric] || 0), 0)]));
  const productive = rows
    .filter((row) => Number(row.published_stories || 0) + Number(row.updated_stories || 0) > 0)
    .sort((left, right) => (right.published_stories + right.updated_stories) - (left.published_stories + left.updated_stories))
    .slice(0, 5)
    .map((row) => ({ source_id: row.source_id, name: row.name, publications: row.published_stories + row.updated_stories }));
  return { totals, productive };
}
