import test from 'node:test';
import assert from 'node:assert/strict';
import { editionPlan, editionTiming } from '../../scripts/news/edition-plan.mjs';
import { schreibeLage } from '../../scripts/news/lage-schreiben.mjs';

test('preparation belongs to upcoming edition with ten minute reserve in summer and winter', () => {
  for (const [date, offset] of [['2026-09-30', 2], ['2026-10-25', 1], ['2026-03-29', 2]]) {
    for (const [slot, hour] of [['morgenlage', 6], ['mittagslage', 12], ['abendlage', 18]]) {
      const p = editionPlan({ isoDate: date, slot });
      assert.equal(p.publication_at, date + 'T' + String(hour - offset).padStart(2, '0') + ':00:00.000Z');
      assert.equal(Date.parse(p.publication_at) - Date.parse(p.preparation_at), 3600000);
      assert.equal(Date.parse(p.publication_at) - Date.parse(p.ready_deadline_at), 600000);
      assert.equal(p.edition_id, date + '-' + slot);
    }
  }
});
test('explicit future slot cannot write an early public edition, even with missing repository data', () => {
  const r = schreibeLage({ slot: 'morgenlage', now: '2026-09-30T03:00:00Z', root: '/nonexistent-edition-test' });
  assert.equal(r.status, 'keine_lage_faellig');
  assert.equal(r.publication_at, '2026-09-30T04:00:00.000Z');
});
test('queue, processing, source cutoff and publication are independent measured fields', () => {
  const p = editionPlan({ isoDate: '2026-09-30', slot: 'morgenlage' });
  const facts = { requestedAt: p.preparation_at, startedAt: '2026-09-30T03:02:00Z',
    sourceCutoffAt: '2026-09-30T03:01:00Z', readyAt: '2026-09-30T03:48:00Z' };
  const waiting = editionTiming(p, facts);
  assert.equal(waiting.queue_ms, 120000);
  assert.equal(waiting.processing_ms, 46 * 60000);
  assert.equal(waiting.total_to_ready_ms, 48 * 60000);
  assert.equal(waiting.ready_in_time, true);
  assert.equal(waiting.status, 'ready_awaiting_release');
  assert.equal(editionTiming(p, { ...facts, publishedAt: '2026-09-30T03:49:00Z' }).status, 'early_release_error');
  assert.equal(editionTiming(p, { ...facts, publishedAt: p.publication_at }).status, 'published');
  assert.equal(editionTiming(p, { ...facts, readyAt: '2026-09-30T03:51:00Z' }).ready_in_time, false);
});
