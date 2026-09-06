import test from 'node:test';
import assert from 'node:assert/strict';
import { budgetStage } from '../../scripts/news/lib.mjs';
import { aiDeferralReason, catchUpQueueStage, partitionAiQueue, queuePriority } from '../../scripts/news/run.mjs';
import { NEWS_AI_BUDGET_EUR, newsBudget } from '../../scripts/news/budget.mjs';

const candidates = () => Array.from({ length: 28 }, (_, index) => ({ story_id: `waiting-${index}`, fresh: false,
  existing_story: { published: false, pending_reason: 'AI_BUDGET_BLOCKED', updated_at: `2026-09-05T${String(index % 24).padStart(2, '0')}:00:00Z` },
  preanalysis: { internal_relevance_score: 30 + index % 18 } }));

test('persisted fresh flags decay and cannot outrank new first publications indefinitely', () => {
  const now = '2026-09-06T18:00:00Z';
  const old = { fresh:true, content_hash:'new', existing_story:{published:true,content_hash:'old'}, sources:[{published_at:'2026-09-06T10:00:00Z'}],preanalysis:{internal_relevance_score:50} };
  const fresh = { ...old, existing_story:null, sources:[{published_at:now}] };
  assert.ok(queuePriority(fresh,now) > queuePriority(old,now));
  assert.equal(queuePriority(old,now),queuePriority({...old,fresh:false},now));
});

test('setup spend throttles volume, not eligibility: all 28 candidates progress across bounded runs', () => {
  for (const [spend, cap] of [[13.42, 8], [16.1, 4]]) {
    const stage = budgetStage(spend, 18.9);
    assert.equal(stage.threshold, 30);
    let queue = candidates();
    const processed = [];
    while (queue.length) {
      const result = partitionAiQueue(queue, stage, 12);
      assert.ok(result.selected.length > 0 && result.selected.length <= cap);
      processed.push(...result.selected.map(item => item.story_id));
      queue = result.deferred;
      for (const candidate of queue) assert.equal(aiDeferralReason(candidate, stage, 40), 'AI_BUDGET_OR_BATCH_LIMIT');
    }
    assert.equal(new Set(processed).size, 28);
    assert.equal(processed.length, 28);
  }
});

test('budget reserves, lower capacity limits, and local relevance rejection remain binding', () => {
  const queue = [...candidates(), { story_id: 'noise', preanalysis: { internal_relevance_score: 29 } }];
  for (const spend of [17.96, 18.9, 100, NaN, -1]) {
    const result = partitionAiQueue(queue, budgetStage(spend, 18.9), 12);
    assert.equal(result.selected.length, 0);
    assert.equal(result.deferred.length, queue.length);
  }
  for (const budget of [0, -1, NaN, Infinity]) assert.equal(budgetStage(0, budget).stage, 3);
  for (const limit of [0, 1, 2]) assert.equal(partitionAiQueue(queue, budgetStage(13.42, 18.9), limit).selected.length, limit);
  assert.ok(!partitionAiQueue(queue, budgetStage(0, 18.9), 40).selected.some(item => item.story_id === 'noise'));
  assert.equal(NEWS_AI_BUDGET_EUR, 25);
  assert.equal(newsBudget({ rate_date: '2026-09-04', rate_usd_per_eur: 1.16 }, '2026-09-06T06:00:00Z', 500).authorized_eur, 25);
});

test('soft-budget runs reserve older work while fresh material keeps the majority', () => {
  const fresh = Array.from({ length: 12 }, (_, index) => ({ story_id: `fresh-${index}`, fresh: true, preanalysis: { internal_relevance_score: 90 } }));
  const result = partitionAiQueue([...fresh, ...candidates()], budgetStage(13.42, 18.9), 12);
  assert.equal(result.selected.length, 8);
  assert.equal(result.selected.filter(item => !item.fresh).length, 2);
});

const catchupNow = '2026-09-06T20:00:00Z';
const cheapUsage = () => ({runs: Array.from({length: 3}, (_, i) => ({
  run_id: `news-run-sample-${i}`, started_at: `2026-09-06T19:${i}0:00Z`, completed_at: `2026-09-06T19:${i}2:00Z`,
  ai: {requests: 4, estimated_cost_usd: 0.032, token_source: 'provider_reported_usage'}
}))});
const catchup = (queue = candidates(), usage = cheapUsage(), spend = 16.8) =>
  catchUpQueueStage(budgetStage(spend, 18.9), queue, usage, catchupNow, 18.9, spend);

test('measured cheap checks unlock six bounded slots, with two reserved for older work', () => {
  const fresh = Array.from({length: 12}, (_, i) => ({story_id: `fresh-${i}`, fresh: true, preanalysis: {internal_relevance_score: 90}}));
  const queue = [...fresh, ...candidates()];
  const result = catchup(queue);
  assert.equal(result.control.enabled, true);
  assert.equal(result.control.sample_calls, 12);
  assert.equal(result.control.mean_check_cost_usd, 0.008);
  const selected = partitionAiQueue(queue, result.stage, 12).selected;
  assert.equal(selected.length, 6);
  assert.equal(selected.filter(item => item.existing_story).length, 2);
  for (const limit of [0, 1, 3, 4]) assert.equal(partitionAiQueue(queue, result.stage, limit).selected.length, limit);
});

test('catchup never overrides hard stop, request reserve, fresh/small queue or other budget stages', () => {
  for (const spend of [0, 14, 17.6, 17.96, NaN, Infinity]) assert.equal(catchup(candidates(), cheapUsage(), spend).control.enabled, false);
  assert.equal(catchup(candidates().slice(0, 11)).control.enabled, false);
  assert.equal(catchup(candidates().map(c => ({...c, fresh: true}))).control.enabled, false);
  assert.equal(catchup(candidates().map(c => ({...c, existing_story: {...c.existing_story, updated_at: catchupNow}}))).control.enabled, false);
});

test('catchup requires a complete recent provider-cost sample, never editorial costs or estimates', () => {
  for (const change of [
    r => {r.ai.estimated_cost_usd = 0.2;},
    r => {delete r.ai.estimated_cost_usd;},
    r => {r.ai.estimated_cost_usd = -1;},
    r => {r.ai.token_source = 'conservative_reservation_usage_unavailable';},
    r => {r.run_id = 'editorial-example';},
    r => {r.completed_at = '2026-09-06T21:00:00Z';},
    r => {r.started_at = '2026-09-06T17:00:00Z';},
  ]) {
    const usage = cheapUsage(); change(usage.runs[0]);
    assert.equal(catchup(candidates(), usage).control.enabled, false);
  }
  const duplicate = cheapUsage(); duplicate.runs = Array(3).fill(duplicate.runs[0]);
  assert.equal(catchup(candidates(), duplicate).control.enabled, false);
  const conflict = cheapUsage(); conflict.runs.push({...conflict.runs[0], ai: {...conflict.runs[0].ai, estimated_cost_usd: 0}});
  assert.equal(catchup(candidates(), conflict).control.enabled, false);
});
