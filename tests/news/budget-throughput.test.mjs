import test from 'node:test';
import assert from 'node:assert/strict';
import { budgetStage } from '../../scripts/news/lib.mjs';
import { aiDeferralReason, partitionAiQueue } from '../../scripts/news/run.mjs';
import { NEWS_AI_BUDGET_EUR, newsBudget } from '../../scripts/news/budget.mjs';

const candidates = () => Array.from({ length: 28 }, (_, index) => ({ story_id: `waiting-${index}`, fresh: false,
  existing_story: { published: false, pending_reason: 'AI_BUDGET_BLOCKED', updated_at: `2026-09-05T${String(index % 24).padStart(2, '0')}:00:00Z` },
  preanalysis: { internal_relevance_score: 30 + index % 18 } }));

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
