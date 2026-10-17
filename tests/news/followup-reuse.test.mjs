import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { followupEvidenceFingerprint, unchangedPublishedFollowup, waitForFollowupEvidence } from '../../scripts/news/followup-reuse.mjs';
import { dueFollowups } from '../../scripts/news/newsroom.mjs';
import { publishedRecord } from '../../scripts/news/run.mjs';

const now = '2026-10-17T08:00:00.000Z';
const source = { source_id: 'official', url: 'https://example.org/a', content_hash: 'source-1', title: 'Original', summary: 'Bound evidence', published_at: '2026-10-02T06:47:03Z' };
function fixture() {
  const old = { published: true, listed: true, story_id: 's', title: 'Generated headline', content_hash: 'story-1', current_version: 28,
    sources: [source], impact_assessment: { publication_status: 'ready' }, impact_semantic_review: { status: 'ready' },
    versions: [{ version: 28, analyzed_at: '2026-10-17T07:38:05Z', content_hash: 'story-1', source_versions: [{ source_id: source.source_id, url: source.url, content_hash: source.content_hash }] }],
    followups: [{ claim: 'Unresolved court decision', status: 'scheduled', follow_up_date: '2026-10-09T07:19:42Z' },
      { claim: 'Future', status: 'scheduled', follow_up_date: '2026-10-21T07:19:42Z' },
      { claim: 'Resolved', status: 'resolved', follow_up_date: '2026-10-09T07:19:42Z' }] };
  return { existing_story: structuredClone(old), sources: structuredClone(old.sources), content_hash: old.content_hash, followup_due: true };
}
test('an overdue date does not buy a new wording of a published answer', () => {
  const c = fixture(), before = JSON.stringify(c);
  assert.equal(unchangedPublishedFollowup(c), true);
  c.title = 'Another generated title';
  assert.equal(unchangedPublishedFollowup(c), true);
  const record = waitForFollowupEvidence(c, now);
  assert.equal(record.followups[0].status, 'scheduled');
  assert.equal(record.followups[0].follow_up_date, c.existing_story.followups[0].follow_up_date);
  assert.equal(record.followups[0].last_checked_at, undefined);
  assert.equal(record.followups[0].evidence_wait.last_paid_version, 28);
  assert.equal(dueFollowups([record], now).length, 0);
  assert.deepEqual(record.versions, c.existing_story.versions);
  assert.deepEqual(record.followups.slice(1), c.existing_story.followups.slice(1));
  delete c.title; assert.equal(JSON.stringify(c), before);
});
test('new source facts, role, provenance or publication time always reopen the check', () => {
  for (const change of [s => s.summary += ' Changed', s => s.content_hash = 'source-2', s => s.primary_source = true,
    s => s.provenance = { origin: 'new' }, s => s.published_at = now, s => s.url += '/new']) {
    const c = fixture(), record = waitForFollowupEvidence(c, now);
    change(c.sources[0]); assert.equal(unchangedPublishedFollowup(c), false);
    change(record.sources[0]); assert.equal(dueFollowups([record], now).length, 1);
  }
});
test('ingestion clocks and source ordering are not new substantive evidence', () => {
  const c = fixture(); c.sources[0].ingested_at = now;
  assert.equal(unchangedPublishedFollowup(c), true);
  assert.equal(followupEvidenceFingerprint([source, { ...source, url: source.url + '/b' }]), followupEvidenceFingerprint([{ ...source, url: source.url + '/b' }, source]));
  assert.equal(followupEvidenceFingerprint([]), null);
});
test('incomplete, changed, explicit repair and unbound versions are never silently completed', () => {
  for (const change of [c => c.followup_due = false, c => c.impact_reassessment = true, c => c.reassessment = true,
    c => c.deepening_due = true, c => c.consolidation = true, c => c.existing_story.published = false,
    c => c.existing_story.impact_semantic_review.status = 'incomplete', c => c.existing_story.current_version++,
    c => c.existing_story.versions[0].source_versions = [], c => c.existing_story.versions[0].content_hash = 'changed',
    c => c.existing_story.pending_update = { reason: 'SOURCE_INTEGRITY_OPEN' },
    c => c.existing_story.pending_update = { reason: 'AI_HOURLY_CALL_LIMIT', quality_errors: ['UNRESOLVED'] }]) {
    const c = fixture(); change(c); assert.equal(unchangedPublishedFollowup(c), false);
    assert.throws(() => waitForFollowupEvidence(c, now), /FOLLOWUP_REUSE_NOT_ESTABLISHED/);
  }
});
test('a capacity-only pending flag is cleared without editing the paid publication', () => {
  const c = fixture(); c.existing_story.pending_update = { reason: 'AI_HOURLY_CALL_LIMIT', sources: c.sources };
  const record = waitForFollowupEvidence(c, now);
  assert.equal(record.pending_update, undefined);
  assert.equal(record.current_version, 28); assert.equal(record.title, c.existing_story.title);
  assert.equal(record.followups[0].evidence_wait.reason, 'NO_NEW_SOURCE_EVIDENCE');
});
test('a free followup comparison preserves pending evidence excluded from this candidate', () => {
  const c = fixture();
  c.existing_story.pending_update = { reason: 'AI_HOURLY_CALL_LIMIT', content_hash: 'new-future-input',
    sources: [...structuredClone(c.sources), { ...source, url: source.url + '/future', content_hash: 'future-1', published_at: '2026-10-18T08:00:00Z' }] };
  const before = structuredClone(c.existing_story.pending_update);
  const record = waitForFollowupEvidence(c, now);
  assert.deepEqual(record.pending_update, before, 'unexamined source bytes and their binding must not disappear');
  assert.deepEqual(c.existing_story.pending_update, before);
  assert.equal(record.followups[0].status, 'scheduled');
  assert.equal(record.followups[0].last_checked_at, undefined);
  assert.deepEqual(record.versions, c.existing_story.versions);
});
test('derived candidate metadata does not make an entirely examined source packet look unconsumed', () => {
  const c = fixture();
  c.existing_story.pending_update = { reason: 'AI_HOURLY_CALL_LIMIT', content_hash: c.content_hash, sources: structuredClone(c.sources) };
  c.sources[0].registry_only_note = 'Derived locally, not an extra pending source.';
  const record = waitForFollowupEvidence(c, now);
  assert.equal(record.pending_update, undefined);
  assert.equal(record.followups[0].status, 'scheduled');
});
test('explicit pending repair flags survive a candidate that did not copy them', () => {
  for (const flag of ['reassessment', 'impact_reassessment']) {
    const c = fixture(); c.existing_story.pending_update = { reason: 'AI_HOURLY_CALL_LIMIT', [flag]: true };
    assert.equal(unchangedPublishedFollowup(c), false);
  }
});
test('the reuse gate precedes queue slots, article requests and provider calls', () => {
  const code = fs.readFileSync('scripts/news/run.mjs', 'utf8');
  const gate = code.indexOf('if (unchangedPublishedFollowup(candidate))');
  assert.ok(gate > code.indexOf('if (candidate.source_integrity?.status !== "verified")'));
  assert.ok(gate < code.indexOf('partitionAiQueue(ready,'));
  assert.ok(gate < code.indexOf('const analysisBatch = await Promise.all'));
  assert.match(code, /last_check_result: 'assessed_in_published_version'/);
});
test('newly collected evidence reopens the original questions before the paid packet is built', () => {
  const c = fixture(), waiting = waitForFollowupEvidence(c, now);
  assert.equal(dueFollowups([waiting], now).length, 0);
  const sources = structuredClone(waiting.sources); sources[0].summary += ' A new verified development.';
  const reopened = dueFollowups([{ ...waiting, sources }], now);
  assert.equal(reopened.length, 1);
  assert.equal(reopened[0].claim, waiting.followups[0].claim);
  const code = fs.readFileSync('scripts/news/run.mjs', 'utf8');
  assert.match(code, /candidateFollowups = dueFollowups\(\[\{ \.\.\.candidate\.existing_story, sources: candidate\.sources \}\], now\)/);
  assert.match(code, /if \(candidate\.followup_due\) dueFollowupIds\.add\(candidate\.story_id\)/);
  assert.match(code, /followups_due: candidateFollowups/);
});
test('a successful publication acknowledges only due checks, preserving dates and future questions', () => {
  const c = fixture(); c.story_id = 's'; c.slug = 'original';
  c.existing_story.published_at = '2026-10-02T07:19:42.557Z';
  const future = structuredClone(c.existing_story.followups.slice(1));
  const result = publishedRecord(c, { source_summary: 'Original evidence.', headline: 'Original title', followups: [] }, { provider: 'synthetic', model: 'synthetic' }, now);
  assert.equal(result.published_at, c.existing_story.published_at);
  assert.equal(result.followups[0].status, 'scheduled');
  assert.equal(result.followups[0].last_checked_version, 29);
  assert.equal(result.followups[0].follow_up_date, '2026-10-24T08:00:00.000Z');
  assert.deepEqual(result.followups.slice(1), future);
  assert.equal(result.versions.length, 2);
});
