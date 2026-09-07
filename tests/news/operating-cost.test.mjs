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

test('Batch costs, reservations and applied updates are separate from immediate publication costs', () => {
  const batch = (id, cost, settled, counts = {}) => ({ ...run(id, cost), counts,
    ai: { requests: 1, processing_mode: 'batch', estimated_cost_usd: cost,
      token_source: settled ? 'batch_provider_usage' : 'batch_reserved_pending' },
    batch_status: settled ? 'completed' : 'submitted' });
  const usage = { runs: [run('news-run-1', .03, 1), run('media-backfill-sync', .01, 0, 1),
    { ...batch('media-backfill-batch-paid', .006, true, { updated_stories: 1 }), publication_applied_at: now },
    batch('media-backfill-batch-rejected', .004, true),
    batch('media-backfill-batch-pending', .125, false),
    { ...batch('editorial-batch-paid', .02, true, { editorial_analyses_published: 1 }), publication_applied_at: now },
    run('editorial-sync', .05)] };
  const saved = structuredClone(usage);
  const result = operatingCostSummary(usage, start, fx, now);
  assert.equal(result.news.first_publications, 1);
  assert.equal(result.news.updates, 1);
  assert.equal(result.news.estimated_cost_usd, .04);
  assert.equal(result.editorial.estimated_cost_usd, .05);
  assert.equal(result.batch.estimated_cost_usd, .155);
  assert.equal(result.batch.settled_cost_usd, .03);
  assert.equal(result.batch.reserved_cost_usd, .125);
  assert.equal(result.batch.settled_jobs, 3);
  assert.equal(result.batch.reserved_jobs, 1);
  assert.equal(result.batch.applied_jobs, 2);
  assert.equal(result.batch.media.estimated_cost_usd, .135);
  assert.equal(result.batch.editorial.estimated_cost_usd, .02);
  assert.equal(result.batch.media.fallback_estimate_runs, 1, 'settled provider usage is not an unknown reserve');
  assert.equal(result.total.estimated_cost_usd, .245, 'all costs remain in the total');
  assert.equal(result.total.estimated_cost_usd,
    Number((result.news.estimated_cost_usd + result.editorial.estimated_cost_usd + result.batch.estimated_cost_usd).toFixed(6)));
  assert.deepEqual(usage, saved, 'reporting never changes the usage journal');
});

test('a zero-request capacity refusal is not a completed provider job and never removes costs', () => {
  const rows = [
    { ...run('batch-local-refusal', 0), ai: { processing_mode: 'batch', requests: 0, estimated_cost_usd: 0, token_source: 'batch_provider_usage' } },
    { ...run('batch-paid', .006), ai: { processing_mode: 'batch', requests: 1, estimated_cost_usd: .006, token_source: 'batch_provider_usage' } },
    { ...run('batch-unknown-requests', 0), ai: { processing_mode: 'batch', estimated_cost_usd: 0, token_source: 'batch_provider_usage' } },
    { ...run('batch-cost-anomaly', .01), ai: { processing_mode: 'batch', requests: 0, estimated_cost_usd: .01, token_source: 'batch_provider_usage' } },
  ];
  const before = structuredClone(rows);
  const result = operatingCostSummary({ runs: rows }, start, fx, now);
  assert.equal(result.batch.zero_request_jobs, 1);
  assert.equal(result.batch.settled_jobs, 3);
  assert.equal(result.batch.runs, 4);
  assert.equal(result.total.estimated_cost_usd, .016);
  assert.equal(result.batch.settled_cost_usd, .016);
  assert.deepEqual(rows, before);
});
