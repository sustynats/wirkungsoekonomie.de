import test from 'node:test';
import assert from 'node:assert/strict';
import { consolidateObersontheimDuplicates as consolidate, retainedObersontheimPaidInput as retained } from '../../scripts/news/consolidate-obersontheim-duplicates.mjs';
import { duplicateGroups } from '../../scripts/news/living-files.mjs';
import { runWirkungsticker } from '../../scripts/news/run.mjs';

const at = '2026-10-20T07:00:00Z';
const url = 'https://www.stern.de/gesellschaft/regional/baden-wuerttemberg/kreis-schwaebisch-hall--schuesse-mit-schreckschusspistole-loesen-sek-einsatz-aus-38421916.html';
function fixture() {
  return [
    ['wt-ccc96fc0c7d39047', 'd39047', '2026-10-20T00:19:37.498Z', '86f14afdb543b849906393f9589d134d7e9182276cf770986a33b75853ea2697', '3278db82c5ae4ad30d9d3e3fbd3a676b4c1e5abe7b576e1e89536c6762e894c3'],
    ['wt-9909c1676a2f8602', '2f8602', '2026-10-20T06:20:25.471Z', '8ecf20d5ce8065f2bba46671a059473ecc2c3a35b99bd018e2e3ff79ab0552f9', '121313df7ebd74c783f9c1f50ba4ef5d1584d5ff700c6a03bee8d4aee762fe92'],
  ].map(([story_id, suffix, date, content_hash, hash], i) => ({
    story_id, slug: `kreis-schwabisch-hall-schusse-mit-schreckschusspistole-losen-sek-einsatz-aus-${suffix}`,
    title: 'Synthetic retained headline', event_id: 'event-d8affb4c9b67f7ac3792',
    published: true, listed: true, current_version: 1, published_at: date, updated_at: date,
    first_seen: date, last_updated: date, content_hash,
    sources: [{ url, content_hash: hash, title: 'Synthetic source', summary: `Retained source ${i}`,
      source_id: 'stern-schlagzeilen', publisher: 'Synthetic publisher', published_at: date }],
    source_summary: `Retained complete manuscript ${i}.`, analysis: { marker: `paid-${i}` },
    versions: [{ version: 1, marker: `original-${i}` }], claims: [{ marker: `claims-${i}` }],
    followups: [{ marker: 'open' }], ai_retry_history: [{ fingerprint: 'paid-original' }],
    pending_update: i === 0 ? { reason: 'QUALITY_GATE_FAILED', quality_errors: ['IMPACT_PATH_TIME_CONFLICT:planet', 'AI_SOURCE_SUMMARY_LENGTH'], owner_note: 'keep this pending review' } : null,
    unknown_retained: { marker: 'keep' },
  }));
}

test('exact source-bound routing keeps the original public URL and every paid field and pending review', () => {
  for (const reverseInput of [false, true]) {
    const pair = fixture(), before = structuredClone(pair);
    assert.equal(consolidate(reverseInput ? [...pair].reverse() : pair, at).status, 'applied');
    assert.deepEqual(pair.filter(s => s.listed !== false).map(s => s.story_id), [before[0].story_id]);
    assert.equal(pair[1].retirement.preserve_full_publication, true);
    assert.deepEqual(pair[1].retirement.canonical_story_ids, [pair[0].story_id]);
    for (const [i, s] of pair.entries()) for (const key of Object.keys(before[i])) {
      if (key !== 'listed') assert.deepEqual(s[key], before[i][key], key);
    }
    assert.deepEqual(duplicateGroups(pair), []);
    const applied = structuredClone(pair);
    assert.equal(consolidate(pair, at).status, 'already_applied');
    assert.deepEqual(pair, applied);
  }
});

test('only the exact inverse two-member routing can be restored, with its metadata history retained', () => {
  const pair = fixture(), pending = structuredClone(pair[0].pending_update);
  pair[0].listed = false; pair[0].retired_at = at; pair[0].analysis_status = 'mit fortgeführter Wirkungsakte zusammengeführt';
  pair[0].retirement = { reason_code: 'MERGED_INTO_LIVING_FILE', canonical_story_ids: [pair[1].story_id] };
  pair[1].living_file = { merged_story_ids: [pair[0].story_id], consolidations: [{ marker: 'keep wrong routing history' }] };
  const before = structuredClone(pair);
  assert.equal(consolidate(pair, at).status, 'applied');
  assert.equal(pair[0].listed, true); assert.equal(pair[0].retirement, undefined);
  assert.deepEqual(pair[0].retirement_history, [before[0].retirement]);
  assert.deepEqual(pair[1].living_file_history, [before[1].living_file]);
  assert.deepEqual(pair[0].pending_update, pending);
  for (const [i, s] of pair.entries()) for (const key of ['sources', 'analysis', 'versions', 'claims', 'source_summary', 'published_at', 'updated_at', 'ai_retry_history']) {
    assert.deepEqual(s[key], before[i][key], key);
  }
});

test('changed editions, source evidence, manual approvals and unrelated routing fail closed atomically', () => {
  for (const mutate of [
    p => p.push(structuredClone(p[0])), p => { p[0].current_version = 2; },
    p => { p[1].content_hash = 'changed'; }, p => { p[1].event_id = 'another-event'; },
    p => { p[1].sources[0].content_hash = 'changed'; }, p => { p[1].sources[0].url = 'https://example.org/other'; },
    p => { p[0].published_at = at; }, p => { p[1].updated_at = at; },
    p => { p[0].manual_only = true; }, p => { p[1].editorial_approval_hash = 'owner-approved'; },
    p => { p[1].living_file = { merged_story_ids: ['unknown'] }; },
    p => { p[0].retirement = { reason_code: 'OTHER' }; },
  ]) {
    const pair = fixture(); mutate(pair); const before = structuredClone(pair);
    assert.equal(consolidate(pair, at).status, 'held'); assert.deepEqual(pair, before);
  }
  assert.equal(consolidate([], at).status, 'not_present');
  assert.equal(consolidate(fixture().slice(0, 1), at).status, 'not_present');
  assert.throws(() => consolidate(fixture(), 'invalid'), /INVALID_CONSOLIDATION_TIME/);
});

test('archived exact paid source editions are not purchased again, while new evidence and explicit reviews remain eligible', () => {
  const pair = fixture(); consolidate(pair, at);
  const candidate = { story_id: pair[0].story_id, existing_story: pair[0], sources: [structuredClone(pair[1].sources[0])] };
  assert.equal(retained(candidate, pair), true);
  assert.deepEqual(pair[0].pending_update.quality_errors, ['IMPACT_PATH_TIME_CONFLICT:planet', 'AI_SOURCE_SUMMARY_LENGTH']);
  for (const flag of ['reassessment', 'impact_reassessment', 'followup_due', 'deepening_due', 'consolidation']) {
    assert.equal(retained({ ...candidate, [flag]: true }, pair), false);
  }
  for (const key of ['content_hash', 'summary', 'title', 'url']) {
    const changed = structuredClone(candidate); changed.sources[0][key] = 'changed';
    assert.equal(retained(changed, pair), false, key);
  }
});

test('normal dry worker applies the pinned routing before automatic merging without a provider or network call', async () => {
  const pair = fixture(); let calls = 0, captured;
  const report = await runWirkungsticker({ dryRun: true, now: at,
    registry: { schema_version: '1.0', sources: [], policy: {} },
    state: { source_status: {}, seen_items: {}, pending_story_ids: [], relevance_filter_version: '4.0' },
    storyStore: { stories: pair }, usage: { runs: [] },
    newsroom: { source_items: {}, events: {}, event_sources: [], discovery_candidates: [] },
    budgetFx: { rate_date: '2026-10-16', rate_usd_per_eur: 1.16 },
    callAiImpl: async () => { calls++; throw Error('No paid replacement'); },
    fetchArticleImpl: async () => { throw Error('No live network'); }, captureState: x => { captured = x; } });
  assert.equal(report.obersontheim_duplicate_consolidation.status, 'applied');
  assert.equal(captured.storyStore.stories.find(s => s.story_id === pair[0].story_id).listed, true);
  assert.equal(captured.storyStore.stories.find(s => s.story_id === pair[1].story_id).listed, false);
  assert.equal(calls, 0);
});
