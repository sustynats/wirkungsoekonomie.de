import test from 'node:test';
import assert from 'node:assert/strict';
import { consolidateKirchnerDuplicates } from '../../scripts/news/consolidate-kirchner-duplicates.mjs';
import { clusterItems } from '../../scripts/news/lib.mjs';
import { renderConsolidations } from '../../scripts/news/build.mjs';
import { runWirkungsticker } from '../../scripts/news/run.mjs';

const at = '2026-10-18T14:00:00.000Z';
const canonicalId = 'wt-c40c82d4edfed764', duplicateId = 'wt-08bdfc8f10adf883';
const mdr = 'https://www.mdr.de/nachrichten/sachsen-anhalt/landtagswahl/zusammenarbeit,afd-bsw-164.html';
const stern = 'https://www.stern.de/gesellschaft/regional/sachsen-anhalt/sachsen-anhalt--kirchner-will-afd-bsw-zusammenarbeit-schriftlich-regeln-38414802.html';

// Synthetic copy; exact public source bindings are the reviewed migration key.
function fixture() {
  return [
    [canonicalId, 'afd-fraktionschef-kirchner-will-zusammenarbeit-mit-bsw-schriftlich-festhalten-fed764', mdr,
      '2e8cf6e54719dc14cd5a5f1688fd800254ec7f547359a0f2e8064bc19233c393', '2026-10-18T12:23:08.354Z'],
    [duplicateId, 'sachsen-anhalt-kirchner-will-afd-bsw-zusammenarbeit-schriftlich-regeln-adf883', stern,
      '91a19ae2a2e5060e0c899eb68de0ebfdeccdfcd160c376fb6667655f85290f85', '2026-10-18T12:24:10.218Z'],
  ].map(([story_id, slug, url, content_hash, published_at]) => ({ story_id, slug,
    title: 'Synthetic retained headline', published: true, listed: true, current_version: 1,
    published_at, updated_at: published_at, source_summary: 'Synthetic retained summary.',
    analysis: { summary: 'Synthetic retained analysis.' }, claims: [{ claim_id: 'retained' }],
    sources: [{ url, content_hash }], versions: [{ version: 1, analyzed_at: published_at }],
    original_potential_assessment: { marker: 'original' }, current_potential_assessment: { marker: 'current' },
    observed_effects: [{ marker: 'retained' }], publication_history: [{ version: 1, published_at }],
    ai_retry: { fingerprint: 'retained-paid-receipt', retry_count: 1 },
    ai_retry_history: [{ fingerprint: 'older-paid-receipt', retry_count: 1 }],
    title_image: { marker: 'retained-image' },
  }));
}

test('the exact source-bound pair is listed once without rewriting either paid article', () => {
  for (const reversed of [false, true]) {
    const pair = fixture(), before = structuredClone(pair);
    const result = consolidateKirchnerDuplicates(reversed ? [...pair].reverse() : pair, at);
    assert.equal(result.status, 'applied');
    assert.equal(result.changes.length, 1);
    assert.equal(result.changes[0].canonical_story_id, canonicalId);
    assert.equal(pair.filter(s => s.published && s.listed !== false).length, 1);
    assert.deepEqual(pair[0].living_file.merged_story_ids, [duplicateId]);
    assert.deepEqual(pair[1].retirement.canonical_story_ids, [canonicalId]);
    for (const [i, record] of pair.entries()) for (const key of Object.keys(before[i])) {
      if (key !== 'listed') assert.deepEqual(record[key], before[i][key], key);
    }
    assert.equal(pair[0].pending_update, undefined, 'metadata repair cannot commission a replacement analysis');
    assert.equal(pair[1].pending_update, undefined);
    const applied = structuredClone(pair);
    assert.equal(consolidateKirchnerDuplicates(pair, '2026-10-19T00:00:00.000Z').status, 'already_applied');
    assert.deepEqual(pair, applied, 'no repeated history entries or new dates');
  }
});

test('absent, unrelated or incomplete pairs are not regrouped by political keywords', () => {
  for (const pair of [[], [fixture()[0]], fixture().map(s => ({ ...s, story_id: `${s.story_id}-other` }))]) {
    const before = structuredClone(pair);
    assert.equal(consolidateKirchnerDuplicates(pair, at).status, 'not_present');
    assert.deepEqual(pair, before);
  }
});

for (const mutate of [
  p => { p[0].sources[0].content_hash = 'unreviewed'; },
  p => { p[1].sources[0].url = 'https://example.org/another-statement'; },
  p => { p[0].published = false; },
  p => { p[1].current_version = 2; },
  p => { p[1].listed = false; },
  p => { p[0].pending_update = { reason: 'NEW_EVIDENCE' }; },
  p => { p[1].living_file = { merged_story_ids: ['another-event'] }; },
  p => { p[1].retirement = { reason_code: 'OTHER' }; },
  p => { p[0].slug = 'changed-target'; },
  p => { p[1].sources.push({ url: 'https://example.org/new-evidence' }); },
  p => { p[0].published_at = '2026-10-19T12:00:00.000Z'; },
]) test('changed evidence, edition or routing is held without any partial mutation', () => {
  const pair = fixture(); mutate(pair); const before = structuredClone(pair);
  assert.equal(consolidateKirchnerDuplicates(pair, at).status, 'held');
  assert.deepEqual(pair, before);
});

test('invalid timestamps and conflicting existing assignments cannot overwrite history', () => {
  const pair = fixture(), before = structuredClone(pair);
  assert.throws(() => consolidateKirchnerDuplicates(pair, 'invalid'), /INVALID_CONSOLIDATION_TIME/);
  assert.deepEqual(pair, before);
  pair[1].retirement = { reason_code: 'MERGED_INTO_LIVING_FILE', canonical_story_ids: ['other'] };
  const conflict = structuredClone(pair);
  assert.equal(consolidateKirchnerDuplicates(pair, at).status, 'held');
  assert.deepEqual(pair, conflict);
  const ambiguous = fixture(); ambiguous.push(structuredClone(ambiguous[0]));
  const duplicateIds = structuredClone(ambiguous);
  assert.equal(consolidateKirchnerDuplicates(ambiguous, at).status, 'held');
  assert.deepEqual(ambiguous, duplicateIds);
  const inconsistent = fixture(); consolidateKirchnerDuplicates(inconsistent, at);
  inconsistent[1].listed = true;
  const relisted = structuredClone(inconsistent);
  assert.equal(consolidateKirchnerDuplicates(inconsistent, at).status, 'held');
  assert.deepEqual(inconsistent, relisted, 'an inconsistent old assignment is not silently accepted');
});

test('the archived source routes to the existing canonical page and history stays linked', () => {
  const pair = fixture();
  consolidateKirchnerDuplicates(pair, at);
  const [routed] = clusterItems([{ ...pair[1].sources[0], title: pair[1].title, published_at: pair[1].published_at }], pair, at);
  assert.equal(routed.story_id, canonicalId);
  assert.match(renderConsolidations(pair[0], new Set(pair.map(s => s.slug))),
    /href="\.\.\/sachsen-anhalt-kirchner-will-afd-bsw-zusammenarbeit-schriftlich-regeln-adf883\/"/);
});

test('the normal runner persists listing-only consolidation without any provider call or new publication', async () => {
  let captured, calls = 0;
  const pair = fixture();
  const options = { dryRun: true, now: at, registry: { schema_version: '1.0', sources: [], policy: {} },
    state: { source_status: {}, seen_items: {}, pending_story_ids: [], relevance_filter_version: '4.0' },
    storyStore: { stories: pair }, usage: { runs: [] },
    newsroom: { source_items: {}, events: {}, event_sources: [], discovery_candidates: [] },
    budgetFx: { rate_date: '2026-10-16', rate_usd_per_eur: 1.16 },
    callAiImpl: async () => { calls += 1; throw new Error('Unexpected paid replacement'); },
    fetchArticleImpl: async () => { throw new Error('No live network'); },
    captureState: value => { captured = value; } };
  const first = await runWirkungsticker(options);
  assert.equal(calls, 0);
  assert.equal(first.kirchner_duplicate_consolidation.status, 'applied');
  assert.equal(first.retired_stories, 1);
  assert.equal(first.public_changed, true);
  assert.equal(first.published_stories, 0);
  assert.equal(first.updated_stories, 0);
  assert.equal(captured.storyStore.stories.filter(s => s.listed !== false).length, 1);
  assert.deepEqual(pair, fixture(), 'runner must not mutate caller-owned inputs');
  const second = await runWirkungsticker({ ...options, ...captured });
  assert.equal(second.kirchner_duplicate_consolidation.status, 'already_applied');
  assert.equal(second.retired_stories, 0);
  assert.equal(second.public_changed, false);
  assert.equal(calls, 0);
});
