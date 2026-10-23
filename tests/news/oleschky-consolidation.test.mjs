import test from 'node:test';
import assert from 'node:assert/strict';
import { consolidateOleschkyDuplicates, retainedOleschkyPaidInput } from '../../scripts/news/consolidate-oleschky-duplicates.mjs';
import { clusterItems } from '../../scripts/news/lib.mjs';
import { renderConsolidations, retiredStoryPage, storyPage } from '../../scripts/news/build.mjs';
import { runWirkungsticker } from '../../scripts/news/run.mjs';
import { readRepositoryJson } from '../../scripts/news/newsroom-store.mjs';

const at = '2026-10-23T19:50:00.000Z';
const canonicalId = 'wt-d3c8c9e82ec31eda', duplicateId = 'wt-fff6aabad12c6e77';
// Only public identity bindings are real. No paid/private manuscript fixture.
function fixture() {
  return [
    [canonicalId, 'event-ae811193ac69dda92ffe', 'waffenruhe-fur-von-russland-besetzter-ukrainischer-stadt-c31eda',
      '2026-10-23T18:33:55.798Z', 'c93dbc6e5c0449fa33f6f68ba4412de85a178a4834b5baefe534c332de784335',
      'https://www.tagesschau.de/ausland/melania-trump-waffenruhe-oleschky-100.html',
      'f1827e3bab2c42b9b8355f5e098d0313dbcfd0049f4c5321f2ec27e4399ca818'],
    [duplicateId, 'event-3c497cc5aba03182d892', 'ukraine-russland-krieg-melania-trump-verkundet-lokale-waffenruhe-verkunden-kreml-und-kyj-2c6e77',
      '2026-10-23T19:00:21.102Z', '8a23d8538c09bab3f3f3bf3ec8f53dc97326699d2f44160799fdfc0fd0fd7ef8',
      'https://www.spiegel.de/ausland/ukraine-russland-krieg-melania-trump-verkuendet-lokale-waffenruhe-verkuenden-kreml-und-kyjiw-bestaetigen-a-7c266a41-621e-4d77-80d8-cc4dd675ecf6',
      '229438fd9d4de75980ae406a16be295bcd6f4078ca54a20687d7d741dde1531a'],
  ].map(([story_id, event_id, slug, published_at, content_hash, url, hash], i) => ({
    story_id, event_id, slug, published_at, updated_at: published_at, content_hash,
    title: `Synthetic retained headline ${i}`, published: true, listed: true, current_version: 1,
    sources: [{ source_id: `synthetic-${i}`, url, content_hash: hash, title: `Synthetic source ${i}`,
      summary: 'Synthetic source text.', published_at, source_published_at: published_at }],
    source_summary: 'Synthetic retained summary.', analysis: { marker: 'paid' },
    claims: [{ marker: 'claims' }], versions: [{ version: 1, at: published_at }],
    original_potential_assessment: { marker: 'original' }, current_potential_assessment: { marker: 'current' },
    observed_effects: [{ marker: 'observed' }], publication_history: [{ at: published_at }],
    ai_retry: { fingerprint: 'paid-receipt' }, ai_retry_history: [{ fingerprint: 'older-receipt' }],
    title_image: { marker: 'retained-image' }, unknown_retained_field: { marker: 'preserve' },
  }));
}

test('only the exact paid pair is listed once; every previous field except listed remains unchanged', () => {
  for (const reverse of [false, true]) {
    const pair = fixture(), before = structuredClone(pair);
    assert.equal(consolidateOleschkyDuplicates(reverse ? [...pair].reverse() : pair, at).status, 'applied');
    assert.equal(pair.filter(s => s.listed !== false).length, 1);
    for (const [i, s] of pair.entries()) for (const key of Object.keys(before[i])) {
      if (key !== 'listed') assert.deepEqual(s[key], before[i][key], key);
    }
    assert.equal(pair[0].pending_update, undefined);
    assert.equal(pair[1].pending_update, undefined);
    const applied = structuredClone(pair);
    assert.equal(consolidateOleschkyDuplicates(pair, '2026-10-24T00:00:00.000Z').status, 'already_applied');
    assert.deepEqual(pair, applied);
  }
});

for (const change of [
  p => { p[0].content_hash = 'different'; }, p => { p[1].event_id = 'different'; },
  p => { p[0].current_version = 2; }, p => { p[1].slug += '-changed'; },
  p => { p[0].published_at = at; }, p => { p[1].updated_at = at; },
  p => { p[0].sources[0].content_hash = 'different'; }, p => { p[1].sources[0].url = 'https://example.org/new'; },
  p => { p[0].sources.push({ url: 'https://example.org/extra' }); }, p => { p[1].sources = [null]; },
  p => { p[0].published = false; }, p => { p[1].manual_only = true; },
  p => { p[0].editorial_approval_hash = 'personal-edition'; }, p => { p[1].listed = false; },
  p => { p[0].pending_update = { reason: 'AI_HOURLY_CALL_LIMIT' }; },
  p => { p[1].pending_update = { reason: 'QUALITY_GATE_FAILED' }; },
  p => { p[0].living_file = { merged_story_ids: ['unreviewed'] }; },
  p => { p[1].retirement = { reason_code: 'OTHER' }; },
]) test('a changed binding, personal edition, open review or unknown route holds atomically', () => {
  const pair = fixture(); change(pair); const before = structuredClone(pair);
  assert.equal(consolidateOleschkyDuplicates(pair, at).status, 'held'); assert.deepEqual(pair, before);
});

test('missing/ambiguous records and invalid or premature times never change data', () => {
  for (const pair of [[], [fixture()[0]]]) assert.equal(consolidateOleschkyDuplicates(pair, at).status, 'not_present');
  const pair = fixture(); pair.push(structuredClone(pair[1])); const before = structuredClone(pair);
  assert.equal(consolidateOleschkyDuplicates(pair, at).reason, 'STORY_ID_AMBIGUOUS'); assert.deepEqual(pair, before);
  assert.throws(() => consolidateOleschkyDuplicates(fixture(), 'invalid'), /INVALID_CONSOLIDATION_TIME/);
  assert.equal(consolidateOleschkyDuplicates(fixture(), '2026-10-23T18:45:00.000Z').status, 'held');
});

test('the archived source routes to the canonical file and the known paid union cannot buy a replacement', () => {
  const pair = fixture(); consolidateOleschkyDuplicates(pair, at);
  const [candidate] = clusterItems([{ ...pair[1].sources[0], title: pair[1].title }], pair, at);
  assert.equal(candidate.story_id, canonicalId);
  const input = { story_id: canonicalId, existing_story: pair[0], sources: structuredClone(pair.flatMap(s => s.sources)) };
  assert.equal(retainedOleschkyPaidInput(input, pair), true);
  for (const source of input.sources) { source.published_at = at; source.source_published_at = at; }
  assert.equal(retainedOleschkyPaidInput(input, pair), true, 'a feed timestamp is not new evidence');
  pair[0].pending_update = { reason: 'OPEN_REVIEW', untouched: true };
  const before = structuredClone(pair);
  assert.equal(retainedOleschkyPaidInput(input, pair), true);
  assert.deepEqual(pair, before, 'even an existing open review is not removed or marked complete');
  assert.ok(renderConsolidations(pair[0], new Set(pair.map(s => s.slug))).includes(pair[1].slug));
});

for (const change of [
  c => { c.sources[1].content_hash = 'changed'; }, c => { c.sources[1].summary += ' changed'; },
  c => { c.sources[1].title += ' changed'; }, c => { c.sources[1].provenance = { origin: 'changed' }; },
  c => { c.sources[1].article_excerpt = 'new evidence'; }, c => { c.sources[1].evidence_segments = ['new']; },
  c => { c.sources.push({ url: 'https://example.org/unreviewed' }); },
  c => { c.reassessment = true; }, c => { c.impact_reassessment = true; },
  c => { c.followup_due = true; }, c => { c.deepening_due = true; }, c => { c.consolidation = true; },
]) test('new evidence and explicit followups keep all ordinary review gates', () => {
  const pair = fixture(); consolidateOleschkyDuplicates(pair, at);
  const candidate = { story_id: canonicalId, existing_story: pair[0], sources: structuredClone(pair.flatMap(s => s.sources)) };
  change(candidate); assert.equal(retainedOleschkyPaidInput(candidate, pair), false);
});

test('the historical reader keeps its entire prior main body plus a transparent archive notice', () => {
  const sample = readRepositoryJson(new URL('../../data/news/stories.json', import.meta.url)).stories.find(s => s.published && s.listed !== false && s.analysis);
  const pair = fixture().map(s => ({ ...structuredClone(sample), ...s, analysis: structuredClone(sample.analysis),
    retirement: undefined, living_file: undefined, pending_update: undefined, last_updated: s.published_at }));
  const before = storyPage(pair[1]); assert.equal(consolidateOleschkyDuplicates(pair, at).status, 'applied');
  const preserved = structuredClone(pair[1]), after = retiredStoryPage(pair[1]);
  const main = html => html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
  assert.equal(main(after).replace(/<aside\b[^>]*data-merged-publication-notice[\s\S]*?<\/aside>/, ''), main(before));
  assert.match(after, /name="robots" content="noindex,follow"/);
  assert.ok(after.includes(`href="../${pair[0].slug}/"`)); assert.deepEqual(pair[1], preserved);
});

test('the ordinary serial runner applies the listing repair once with no provider call or new edition', async () => {
  let captured, calls = 0;
  const options = { dryRun: true, now: at, registry: { schema_version: '1.0', sources: [], policy: {} },
    state: { source_status: {}, seen_items: {}, pending_story_ids: [], relevance_filter_version: '4.0' },
    storyStore: { stories: fixture() }, usage: { runs: [] },
    newsroom: { source_items: {}, events: {}, event_sources: [], discovery_candidates: [] },
    budgetFx: { rate_date: '2026-10-23', rate_usd_per_eur: 1.16 },
    callAiImpl: async () => { calls++; throw Error('No paid replacement'); },
    fetchArticleImpl: async () => { throw Error('No live source fetch'); }, captureState: v => { captured = v; } };
  const first = await runWirkungsticker(options);
  assert.equal(first.oleschky_duplicate_consolidation.status, 'applied'); assert.equal(first.retired_stories, 1);
  assert.equal(first.public_changed, true); assert.equal(first.published_stories, 0); assert.equal(first.updated_stories, 0);
  assert.equal(calls, 0); assert.deepEqual(options.storyStore.stories, fixture());
  const second = await runWirkungsticker({ ...options, ...captured });
  assert.equal(second.oleschky_duplicate_consolidation.status, 'already_applied');
  assert.equal(second.retired_stories, 0); assert.equal(second.public_changed, false); assert.equal(calls, 0);
});
