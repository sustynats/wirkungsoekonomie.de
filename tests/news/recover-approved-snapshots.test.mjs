import test from 'node:test';
import assert from 'node:assert/strict';
import { recoverApprovedSnapshots, recoverSnapshotUsage } from '../../scripts/news/recover-approved-snapshots.mjs';
const now = '2026-09-22T05:30:00Z';
const story = (id, extra = {}) => ({ story_id: id, title: id, slug: id, published: true,
  analysis: { publication_recommendation: true, summary: 'Checked source-based result' }, ...extra });
const snapshot = (stories, at = '2026-09-22T04:00:00Z') => ({ at, run_id: '123', artifact_id: '456', stories });
const recover = (baseline, current, snapshots) => recoverApprovedSnapshots({ baseline: { stories: baseline }, current: { stories: current }, snapshots, now,
  validate: row => row.invalid ? ['INVALID'] : [] });
test('only approved complete records are restored and checked again without generation', () => {
  const result = recover([], [], [snapshot([story('ok'), story('draft', { published: false }),
    story('rejected', { analysis: { publication_recommendation: false } }), story('invalid', { invalid: true }),
    story('book', { manual_only: true }), story('retired', { listed: false })])]);
  assert.deepEqual(result.accepted.map(row => row.story_id), ['ok']);
  assert.equal(result.held[0].reason, 'QUALITY_GATE');
  assert.deepEqual(result.store.stories[0].analysis, story('ok').analysis);
  assert.equal(result.store.stories[0].publication_recovery.github_run_id, '123');
});
test('a later unchanged snapshot cannot erase earlier approved work or an editor on main', () => {
  const base = story('existing'), edited = story('existing', { title: 'Manual correction' });
  const result = recover([base], [edited], [snapshot([story('new'), story('existing', { analysis: { publication_recommendation: true, summary: 'other' } })]),
    snapshot([base], '2026-09-22T05:00:00Z')]);
  assert.deepEqual(result.store.stories.find(row => row.story_id === 'existing'), edited);
  assert.equal(result.store.stories.filter(row => row.story_id === 'new').length, 1);
  assert.equal(result.held[0].reason, 'CURRENT_EDITORIAL_CHANGE');
});
test('last approved edition wins; recovery is idempotent and does not touch manual formats', () => {
  const a = snapshot([story('one')]), b = snapshot([story('one', { title: 'Latest approved title' })], '2026-09-22T05:00:00Z');
  const result = recover([], [], [b, a]);
  assert.equal(result.store.stories[0].title, 'Latest approved title');
  assert.equal(recover([], result.store.stories, [a, b]).accepted.length, 0);
});
test('costs are recovered once, never counted as already published', () => {
  const usage = { run_id: 'r1', started_at: now, ai: { estimated_cost_usd: 0.012 }, counts: { published_stories: 1, updated_stories: 2, ai_requests: 1 } };
  const input = { run_id: '123', artifact_id: '456', usage: [usage] };
  const result = recoverSnapshotUsage({ runs: [] }, [input, input], now);
  assert.equal(result.usage.runs.length, 1);
  assert.equal(result.usage.runs[0].counts.published_stories, 0);
  assert.equal(result.usage.runs[0].recovery.report_published_stories, 1);
  assert.equal(result.usage.runs[0].ai.estimated_cost_usd, 0.012);
  assert.equal(recoverSnapshotUsage(result.usage, [input], now).recovered.length, 0);
  const noCall = { ...input, usage: [{ ...usage, ai: null, counts: { ai_requests: 0 } }] };
  assert.equal(recoverSnapshotUsage({ runs: [] }, [noCall], now).usage.runs[0].ai, null);
  assert.throws(() => recoverSnapshotUsage({ runs: [] }, [{ ...input, usage: [{ ...usage, ai: null }] }], now), /COST_INVALID/);
});
