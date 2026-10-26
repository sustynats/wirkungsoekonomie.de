import test from 'node:test';
import assert from 'node:assert/strict';
import {unchangedCapacityReview} from '../../scripts/news/unchanged-capacity-review.mjs';
import {capacityReview} from './fixtures/capacity-review.mjs';
const at = '2026-10-26T12:00:00.000Z';
function fixture() {
  const story = {content_hash: 'published-content', updated_at: '2026-10-26T10:00:00.000Z',
    sources: [0, 1].map(i => ({source_id: `synthetic-${i}`, url: `https://example.org/${i}`, content_hash: `paid-${i}`,
      title: `Synthetischer Bericht ${i}`, summary: `Synthetischer unveränderter Quellenstand ${i}.`}))};
  story.pending_update = capacityReview(story, at); return story;
}
test('only an unchanged, healthy capacity envelope is recognised without modifying it', () => {
  const s = fixture(), before = structuredClone(s);
  assert.equal(unchangedCapacityReview(s, at), true); assert.deepEqual(s, before);
  s.pending_update.sources.reverse(); s.pending_update.sources.forEach(source => {
    source.published_at = at; source.source_published_at = at; source.ingested_at = at;
  });
  assert.equal(unchangedCapacityReview(s, at), true);
});
test('changed evidence, quality failures, new requests and unknown write states remain blocking', () => {
  for (const change of [
    p => {p.reason = 'AI_PROVIDER_OUTCOME_UNKNOWN';}, p => {p.content_hash = 'changed';},
    p => {p.sources[0].summary += ' new evidence';}, p => {p.sources[0].url += '?new';},
    p => {p.sources[0].content_hash = 'new';}, p => {p.sources[0].title += ' changed';},
    p => {p.sources[0].article_excerpt = 'New full text';}, p => {p.sources[0].evidence_segments = [];},
    p => {p.sources.pop();}, p => {p.sources[0] = null;}, p => {p.quality_errors.push('OPEN');},
    p => {p.quality_retry_count = 1;}, p => {p.quality_retry_after = at;}, p => {p.fresh = true;},
    p => {p.reassessment = true;}, p => {p.consolidation = true;}, p => {p.provider_request_id = 'unknown';},
    p => {p.source_integrity.status = 'blocked';}, p => {p.source_integrity.issue_codes.push('OPEN');},
    p => {p.source_integrity.warning_codes.push('OPEN');}, p => {delete p.source_integrity.warning_codes;},
    p => {p.source_integrity.checked_at = '2027-01-01T00:00:00Z';}, p => {p.detected_at = '2027-01-01T00:00:00Z';},
    p => {p.detected_at = '2026-01-01T00:00:00Z';},
  ]) {
    const s = fixture(); change(s.pending_update); const before = structuredClone(s);
    assert.equal(unchangedCapacityReview(s, at), false); assert.deepEqual(s, before);
  }
  assert.equal(unchangedCapacityReview(fixture(), 'invalid'), false);
  assert.equal(unchangedCapacityReview({...fixture(), pending_update: null}, at), false);
});
