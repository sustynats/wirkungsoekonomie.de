// Operational estimate, not a provider invoice. This window never changes the
// historical usage ledger or the budget calculation that includes setup spend.
export function operatingCostSummary(usage, startedAt, fx, now) {
  const start = Date.parse(startedAt);
  const end = Date.parse(now);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) return null;
  const runs = [...new Map((usage?.runs || []).map(run => [run.run_id || `${run.started_at}:${run.berlin_slot}`, run])).values()]
    .filter(run => Date.parse(run.started_at) >= start && Date.parse(run.started_at) <= end);
  const fxAge = end - Date.parse(fx?.rate_date);
  const validFx = Number.isFinite(fxAge) && fxAge >= 0 && fxAge <= 7 * 86400000
    && Number.isFinite(fx?.rate_usd_per_eur) && fx.rate_usd_per_eur >= 0.5 && fx.rate_usd_per_eur <= 2;
  const summarize = rows => {
    const cost = rows.reduce((sum, run) => sum + (Number.isFinite(run.ai?.estimated_cost_usd) && run.ai.estimated_cost_usd >= 0 ? run.ai.estimated_cost_usd : 0), 0);
    const requests = run => Number(run.ai?.requests ?? run.counts?.ai_requests ?? run.counts?.ai_stories ?? 0);
    const missing = rows.filter(run => requests(run) > 0 && (!Number.isFinite(run.ai?.estimated_cost_usd) || run.ai.estimated_cost_usd < 0)).length;
    const fallback = rows.filter(run => requests(run) > 0 && !['provider_reported_usage', 'provider_cache_hit'].includes(run.ai?.token_source)).length;
    const publications = rows.reduce((sum, run) => sum + Number(run.counts?.published_stories ?? run.counts?.editorial_analyses_published ?? 0), 0);
    const updates = rows.reduce((sum, run) => sum + Number(run.counts?.updated_stories ?? run.counts?.editorial_analyses_updated ?? 0), 0);
    const euros = validFx && !missing ? cost / fx.rate_usd_per_eur * 1.19 : null;
    return { runs: rows.length, ai_requests: rows.reduce((sum, run) => sum + requests(run), 0), first_publications: publications,
      updates, estimated_cost_usd: Number(cost.toFixed(6)), estimated_cost_eur_with_tax_reserve: euros,
      missing_cost_runs: missing, fallback_estimate_runs: fallback,
      cost_per_first_publication_eur: euros !== null && publications > 0 ? euros / publications : null,
      cost_per_publication_or_update_eur: euros !== null && publications + updates > 0 ? euros / (publications + updates) : null };
  };
  const editorial = run => String(run.run_id).startsWith('editorial-');
  const news = summarize(runs.filter(run => !editorial(run)));
  const target = 0.04;
  return { schema_version: '1.0', started_at: startedAt, measured_at: now, basis: 'usage_estimate_not_invoice',
    scope: 'news_ai_including_rejections_retries_and_media_checks;editorial_separate;excluding_images_and_hosting',
    target_eur_per_first_publication: target, fx_rate_date: validFx ? fx.rate_date : null,
    target_status: news.missing_cost_runs || !validFx ? 'cost_data_incomplete' : !news.first_publications ? 'no_publications_yet'
      : news.cost_per_first_publication_eur < target ? 'estimated_below_target' : 'estimated_at_or_above_target',
    news, editorial: summarize(runs.filter(editorial)) };
}
