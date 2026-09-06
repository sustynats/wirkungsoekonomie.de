import test from 'node:test';
import assert from 'node:assert/strict';
import { operatingCostSummary } from '../../scripts/news/operating-cost.mjs';

const start = '2026-09-06T06:00:00Z';
const now = '2026-09-06T07:00:00Z';
const fx = { rate_date: '2026-09-04', rate_usd_per_eur: 1.19 };
const run = (id, cost, published = 0, updates = 0) => ({ run_id: id, started_at: start, counts: { published_stories: published, updated_stories: updates }, ai: { requests: 1, estimated_cost_usd: cost, token_source: 'provider_reported_usage' } });

test('unit cost includes rejected attempts and updates, separates setup and deep dives without deleting costs', () => {
  const usage = { runs: [run('news-run-1', .03, 2, 1), run('news-run-rejected', .02), run('media-backfill-1', .01, 0, 1),
    { ...run('setup', 13), started_at: '2026-09-05T06:00:00Z' },
    { ...run('editorial-1', .5), counts: { editorial_analyses_published: 1, editorial_analyses_updated: 0 } }] };
  const saved = structuredClone(usage);
  const result = operatingCostSummary(usage, start, fx, now);
  assert.equal(result.news.first_publications, 2);
  assert.equal(result.news.updates, 2);
  assert.equal(result.news.estimated_cost_usd, .06);
  assert.ok(Math.abs(result.news.cost_per_first_publication_eur - .03) < .000001);
  assert.ok(Math.abs(result.news.cost_per_publication_or_update_eur - .015) < .000001);
  assert.equal(result.editorial.estimated_cost_usd, .5);
  assert.equal(result.target_status, 'estimated_below_target');
  assert.deepEqual(usage, saved);
});
test('zero publications, missing/fallback costs, stale FX and duplicate runs are not disguised as zero cost', () => {
  const failed = run('failure', .25);
  failed.ai.token_source = 'conservative_reservation_usage_unavailable';
  const usage = { runs: [failed, failed] };
  const result = operatingCostSummary(usage, start, fx, now);
  assert.equal(result.target_status, 'no_publications_yet');
  assert.equal(result.news.estimated_cost_usd, .25);
  assert.equal(result.news.cost_per_first_publication_eur, null);
  assert.equal(result.news.fallback_estimate_runs, 1);
  usage.runs.push(run('published', .01, 1));
  assert.equal(operatingCostSummary(usage, start, fx, now).target_status, 'estimated_at_or_above_target');
  usage.runs.push(run('unknown', undefined));
  assert.equal(operatingCostSummary(usage, start, fx, now).target_status, 'cost_data_incomplete');
  assert.equal(operatingCostSummary(usage, start, fx, now).news.cost_per_first_publication_eur, null);
  assert.equal(operatingCostSummary({ runs: [run('x', .01, 1)] }, start, { ...fx, rate_date: '2026-08-01' }, now).target_status, 'cost_data_incomplete');
  assert.equal(operatingCostSummary(usage, undefined, fx, now), null);
});
