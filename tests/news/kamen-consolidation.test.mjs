import test from 'node:test';
import assert from 'node:assert/strict';
import { consolidateKamenDuplicates } from '../../scripts/news/consolidate-kamen-duplicates.mjs';
import { clusterItems } from '../../scripts/news/lib.mjs';
import { renderConsolidations, retiredStoryPage, storyPage } from '../../scripts/news/build.mjs';
import { runWirkungsticker } from '../../scripts/news/run.mjs';
import { readRepositoryJson } from '../../scripts/news/newsroom-store.mjs';

const at = '2026-10-18T18:45:00.000Z';
const canonicalId = 'wt-7d2d5761df9f3147', duplicateId = 'wt-be36f8fa07ed8fe5';

// Synthetic content; only the already-public identity bindings are real.
function fixture() {
  return [
    [canonicalId, 'kriminalitat-messerangriff-in-unterkunft-60-jahriger-schwer-verletzt-9f3147',
      'https://www.stern.de/gesellschaft/regional/nordrhein-westfalen/kriminalitaet--messerangriff-in-unterkunft--60-jaehriger-schwer-verletzt-38415532.html',
      'e72285cb1f4fda5a494294aeb5a5e25d0ea52f7d24311cbc6887f8ad4dec692a', '2026-10-18T14:50:10.442Z'],
    [duplicateId, 'messerangriff-in-obdachlosenheim-mann-schwer-verletzt-ed8fe5',
      'https://www1.wdr.de/nrw/ruhrgebiet/kreis-unna/kamen-messeangriff-wohnheim-obdachlose-100.html',
      '6f087b2e8cd62e906038d462bf06eb5a855801ba11074188962c3d89c75dcbc9', '2026-10-18T17:02:27.848Z'],
  ].map(([story_id, slug, url, content_hash, published_at]) => ({ story_id, slug,
    title: 'Synthetic retained headline', published: true, listed: true, current_version: 1,
    published_at, updated_at: published_at, source_summary: 'Synthetic retained summary.',
    sources: [{ url, content_hash }], analysis: { marker: 'paid-analysis' },
    claims: [{ claim_id: 'retained' }], versions: [{ version: 1, analyzed_at: published_at }],
    original_potential_assessment: { marker: 'original' }, current_potential_assessment: { marker: 'current' },
    observed_effects: [{ marker: 'retained' }], publication_history: [{ version: 1, published_at }],
    ai_retry: { fingerprint: 'retained-paid-receipt', retry_count: 1 },
    ai_retry_history: [{ fingerprint: 'older-paid-receipt', retry_count: 1 }],
    title_image: { marker: 'retained-image' }, unknown_retained_field: { marker: 'do-not-drop' },
  }));
}

function capacityFixture() {
  return fixture().map((story, i) => ({ ...story, pending_update: {
    detected_at: '2026-10-18T18:26:17.401Z',
    content_hash: ['1eb32bfea0265f2d8e794b3cd6916c6000effd5d5369b5b43b731a8356fd6346',
      'c4e6e7ee2017612da9d53b59239b217ead5c972c7f81c0660351ba75fc510a17'][i],
    sources: structuredClone(story.sources), reason: 'AI_BUDGET_OR_BATCH_LIMIT',
    quality_errors: [], quality_retry_count: 0, quality_retry_after: null,
    reassessment: false, fresh: false, consolidation: false,
    source_integrity: { status: 'verified', publication_status: 'eligible', version: '1.2',
      fingerprint: ['e3c53f74624eaee44d072f929448e057d2066e12b2e417d9e8f7fd63e7abcbad',
        '4e31710d83a9ddb33f8b01f0dfcc8cc88f74635a79d45367afe17743ee1314fd'][i],
      issue_codes: [], warning_codes: [] },
  } }));
}

test('the observed unchanged-source capacity records remain intact, including the canonical open review', () => {
  for (const reason of ['AI_BUDGET_OR_BATCH_LIMIT', 'AI_HOURLY_CALL_LIMIT']) {
    const pair = capacityFixture(); for (const story of pair) story.pending_update.reason = reason;
    const before = structuredClone(pair);
    assert.equal(consolidateKamenDuplicates(pair, at).status, 'applied');
    for (const [i, story] of pair.entries()) for (const key of Object.keys(before[i])) {
      if (key !== 'listed') assert.deepEqual(story[key], before[i][key], key);
    }
    assert.equal(pair[0].pending_update.reason, reason);
    assert.equal(pair[1].pending_update.reason, reason);
  }
});

for (const mutate of [
  p => { p[0].pending_update.content_hash = 'new-input'; },
  p => { p[1].pending_update.sources[0].content_hash = 'new-source'; },
  p => { p[0].pending_update.sources[0].url = 'https://example.org/new'; },
  p => { p[1].pending_update.sources.push({ url: 'https://example.org/addition' }); },
  p => { p[0].pending_update.reason = 'QUALITY_GATE_FAILED'; },
  p => { p[1].pending_update.quality_errors = ['NEEDS_REVIEW']; },
  p => { p[0].pending_update.quality_retry_count = 1; },
  p => { p[1].pending_update.quality_retry_after = at; },
  p => { p[0].pending_update.fresh = true; },
  p => { p[1].pending_update.reassessment = true; },
  p => { p[0].pending_update.consolidation = true; },
  p => { p[1].pending_update.impact_reassessment = true; },
  p => { p[0].pending_update.detected_at = '2026-10-19T00:00:00.000Z'; },
  p => { p[1].pending_update.source_integrity.status = 'hold'; },
  p => { p[0].pending_update.source_integrity.fingerprint = 'new-source-package'; },
  p => { p[1].pending_update.source_integrity.version = 'unknown'; },
  p => { p[0].pending_update.source_integrity.publication_status = 'held'; },
  p => { p[1].pending_update.source_integrity.issue_codes = ['UNKNOWN_SOURCE']; },
  p => { p[0].pending_update.source_integrity.warning_codes = ['REVIEW']; },
]) test('unreviewed pending work never borrows the capacity-only exception', () => {
  const pair = capacityFixture(); mutate(pair); const before = structuredClone(pair);
  assert.equal(consolidateKamenDuplicates(pair, at).status, 'held');
  assert.deepEqual(pair, before);
});

test('only the exact Kamen pair is listed once, with all prior fields and paid originals retained', () => {
  for (const reversed of [false, true]) {
    const pair = fixture(), before = structuredClone(pair);
    const result = consolidateKamenDuplicates(reversed ? [...pair].reverse() : pair, at);
    assert.equal(result.status, 'applied');
    assert.equal(pair.filter(s => s.published && s.listed !== false).length, 1);
    assert.deepEqual(pair[0].living_file.merged_story_ids, [duplicateId]);
    assert.deepEqual(pair[1].retirement.canonical_story_ids, [canonicalId]);
    for (const [i, story] of pair.entries()) for (const key of Object.keys(before[i])) {
      if (key !== 'listed') assert.deepEqual(story[key], before[i][key], key);
    }
    assert.equal(pair[0].pending_update, undefined, 'no replacement analysis is commissioned');
    assert.equal(pair[1].pending_update, undefined);
    const applied = structuredClone(pair);
    assert.equal(consolidateKamenDuplicates(pair, '2026-10-19T00:00:00.000Z').status, 'already_applied');
    assert.deepEqual(pair, applied, 'no repeat archive entries or changed dates');
  }
});

for (const mutate of [
  p => { p[0].sources[0].content_hash = 'new-edition'; },
  p => { p[1].sources[0].url = 'https://example.org/another-incident'; },
  p => { p[0].sources.push({ url: 'https://example.org/new-evidence' }); },
  p => { p[1].current_version = 2; },
  p => { p[0].updated_at = '2026-10-18T18:00:00.000Z'; },
  p => { p[1].pending_update = { reason: 'NEW_EVIDENCE' }; },
  p => { p[0].pending_update = { reason: 'AI_HOURLY_CALL_LIMIT' }; },
  p => { p[0].published = false; },
  p => { p[1].listed = false; },
  p => { p[0].slug = 'new-target'; },
  p => { p[1].published_at = '2026-10-19T00:00:00.000Z'; },
  p => { p[0].living_file = { merged_story_ids: ['unreviewed-member'] }; },
  p => { p[1].living_file = { merged_story_ids: ['unreviewed-member'] }; },
  p => { p[0].retirement = { reason_code: 'OTHER' }; },
  p => { p[1].retirement = { reason_code: 'OTHER' }; },
]) test('changed editions, pending work and conflicting routing stay held without partial mutation', () => {
  const pair = fixture(); mutate(pair); const before = structuredClone(pair);
  assert.equal(consolidateKamenDuplicates(pair, at).status, 'held');
  assert.deepEqual(pair, before);
});

test('missing records, reused IDs, early times and inconsistent prior routing cannot change data', () => {
  for (const pair of [[], [fixture()[0]], fixture().map(s => ({ ...s, story_id: `${s.story_id}-other` }))]) {
    const before = structuredClone(pair);
    assert.equal(consolidateKamenDuplicates(pair, at).status, 'not_present');
    assert.deepEqual(pair, before);
  }
  const pair = fixture(); pair.push(structuredClone(pair[0]));
  const before = structuredClone(pair);
  assert.equal(consolidateKamenDuplicates(pair, at).reason, 'STORY_ID_AMBIGUOUS');
  assert.deepEqual(pair, before);
  assert.throws(() => consolidateKamenDuplicates(fixture(), 'invalid'), /INVALID_CONSOLIDATION_TIME/);
  const early = fixture(), earlyBefore = structuredClone(early);
  assert.equal(consolidateKamenDuplicates(early, '2026-10-18T15:00:00.000Z').status, 'held');
  assert.deepEqual(early, earlyBefore);
  const inconsistent = fixture(); consolidateKamenDuplicates(inconsistent, at);
  inconsistent[1].listed = true;
  const relisted = structuredClone(inconsistent);
  assert.equal(consolidateKamenDuplicates(inconsistent, at).status, 'held');
  assert.deepEqual(inconsistent, relisted);
});

test('future use of the archived source routes to the canonical file, with historical links retained', () => {
  const pair = fixture(); consolidateKamenDuplicates(pair, at);
  const [routed] = clusterItems([{ ...pair[1].sources[0], title: pair[1].title,
    published_at: pair[1].published_at }], pair, at);
  assert.equal(routed.story_id, canonicalId);
  assert.match(renderConsolidations(pair[0], new Set(pair.map(s => s.slug))),
    /href="\.\.\/messerangriff-in-obdachlosenheim-mann-schwer-verletzt-ed8fe5\/"/);
});

test('the explicit merged archive preserves the entire prior reader body, sources, profile and history', () => {
  const sample = readRepositoryJson(new URL('../../data/news/stories.json', import.meta.url))
    .stories.find(s => s.published && s.listed !== false && s.analysis);
  const pair = fixture().map(s => ({ ...structuredClone(sample), ...s,
    retirement: undefined, pending_update: undefined, living_file: undefined,
    analysis: structuredClone(sample.analysis), last_updated: s.published_at,
    sources: s.sources.map(source => ({ ...source, publisher: 'Synthetic publisher', title: 'Synthetic source' })),
  }));
  const original = storyPage(pair[1]);
  assert.equal(consolidateKamenDuplicates(pair, at).status, 'applied');
  const before = structuredClone(pair[1]), archived = retiredStoryPage(pair[1]);
  const body = html => html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
  assert.equal(body(archived).replace(/<aside\b[^>]*data-merged-publication-notice[\s\S]*?<\/aside>/, ''),
    body(original), 'every prior reader section stays byte-for-byte, not only a short summary');
  assert.match(archived, /name="robots" content="noindex,follow"/);
  assert.match(archived, /Transparenzhinweis: historischer Stand/);
  assert.match(archived, /Zusammengeführt am 18\.10\.2026/);
  assert.ok(archived.includes(`href="../${pair[0].slug}/"`));
  assert.deepEqual(pair[1], before, 'rendering never alters the paid edition');
  const legacy = structuredClone(pair[1]); delete legacy.retirement.preserve_full_publication;
  assert.doesNotMatch(retiredStoryPage(legacy), /data-merged-publication-notice/);
  assert.match(retiredStoryPage(legacy), /Historische Einordnung/);
});

test('the ordinary serial runner persists listing-only repair without a provider call or new version', async () => {
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
  assert.equal(first.kamen_duplicate_consolidation.status, 'applied');
  assert.equal(first.retired_stories, 1); assert.equal(first.public_changed, true);
  assert.equal(first.published_stories, 0); assert.equal(first.updated_stories, 0);
  assert.equal(calls, 0); assert.deepEqual(pair, fixture(), 'caller-owned records remain unchanged');
  assert.equal(captured.storyStore.stories.filter(s => s.listed !== false).length, 1);
  const second = await runWirkungsticker({ ...options, ...captured });
  assert.equal(second.kamen_duplicate_consolidation.status, 'already_applied');
  assert.equal(second.retired_stories, 0); assert.equal(second.public_changed, false);
  assert.equal(calls, 0);
});
