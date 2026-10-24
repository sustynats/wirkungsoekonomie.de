import test from 'node:test';
import assert from 'node:assert/strict';
import { consolidateUlm5Duplicates, retainedUlm5PaidInput } from '../../scripts/news/consolidate-ulm5-duplicates.mjs';
import { clusterItems } from '../../scripts/news/lib.mjs';
import { renderConsolidations, retiredStoryPage, storyPage } from '../../scripts/news/build.mjs';
import { runWirkungsticker } from '../../scripts/news/run.mjs';
import { readRepositoryJson } from '../../scripts/news/newsroom-store.mjs';

const at = '2026-10-24T23:00:00.000Z';
const canonicalId = 'wt-a6658440baf04b0d', duplicateId = 'wt-71236d6e6263c885';
// Only public identity bindings are real. No paid manuscript is a test fixture.
function fixture() {
  return [
    [canonicalId, 'event-29b5b691ef3670a83909',
      'nach-angriff-auf-israelische-firma-in-ulm-hunderte-bei-free-the-ulm-5-demo-f04b0d',
      '2026-10-24T19:45:25.452Z', '5307b7ac0232f3cb5bff2fc71a7749185343aa8ffd946a9a9e6ce06799a6ab34',
      'https://www.swr.de/swraktuell/baden-wuerttemberg/demo-free-the-ulm-5-in-stuttgart-100.html',
      '223f1cb06973c62517a6e7fbaf32ad2caceb049eb89ef4f6e65ca47d2669ef4a'],
    [duplicateId, 'event-029ee7167a0853c71bd9',
      'angriff-auf-israelische-firma-mehrere-hundert-menschen-bei-free-the-ulm-5-demo-63c885',
      '2026-10-24T20:56:57.175Z', '57c0b85054e07c7c0f208f0d9c30409a0ed4603159d9f71903bdd7bd9c63530b',
      'https://www.stern.de/gesellschaft/regional/baden-wuerttemberg/angriff-auf-israelische-firma--mehrere-hundert-menschen-bei--free-the-ulm-5---demo-38446666.html',
      'ebe3960eaf40e5f5857b04c3515019ebd08b6b605dd3648d05929192869c953f'],
  ].map(([story_id, event_id, slug, published_at, content_hash, url, hash], i) => ({
    story_id, event_id, slug, published_at, updated_at: published_at, content_hash,
    title: `Synthetic retained headline ${i}`, published: true, listed: true, current_version: 1,
    sources: [{ source_id: `synthetic-${i}`, url, content_hash: hash, title: `Synthetic source ${i}`,
      summary: 'Synthetic source text.', published_at, source_published_at: published_at }],
    source_summary: 'Synthetic retained summary.', analysis: { marker: 'paid' },
    claims: [{ marker: 'claims' }], versions: [{ version: 1, at: published_at }], followups: [],
    original_potential_assessment: { marker: 'original' }, current_potential_assessment: { marker: 'current' },
    observed_effects: [{ marker: 'observed' }], publication_history: [{ at: published_at }],
    ai_retry: { fingerprint: 'paid-receipt' }, ai_retry_history: [{ fingerprint: 'older-receipt' }],
    title_image: { marker: 'retained-image' }, unknown_retained_field: { marker: 'preserve' },
  }));
}

test('the exact paid pair is listed once, retains every prior field except listed, and routes idempotently', () => {
  for (const reverse of [false, true]) {
    const pair = fixture(), before = structuredClone(pair);
    assert.equal(consolidateUlm5Duplicates(reverse ? [...pair].reverse() : pair, at).status, 'applied');
    assert.equal(pair.filter(s => s.listed !== false).length, 1);
    for (const [i, story] of pair.entries()) for (const key of Object.keys(before[i])) {
      if (key !== 'listed') assert.deepEqual(story[key], before[i][key], key);
    }
    assert.equal(pair[0].pending_update, undefined); assert.equal(pair[1].pending_update, undefined);
    const routed = structuredClone(pair);
    assert.equal(consolidateUlm5Duplicates(pair, '2026-10-25T01:00:00.000Z').status, 'already_applied');
    assert.deepEqual(pair, routed);
  }
});

for (const change of [
  p => { p[0].content_hash = 'changed'; }, p => { p[1].event_id = 'other-demonstration'; },
  p => { p[0].current_version = 2; }, p => { p[1].slug += '-changed'; },
  p => { p[0].published_at = at; }, p => { p[1].updated_at = at; },
  p => { p[0].sources[0].content_hash = 'changed'; }, p => { p[1].sources[0].url = 'https://example.org/other'; },
  p => { p[0].sources.push({ url: 'https://example.org/extra' }); }, p => { p[1].sources = [null]; },
  p => { p[0].published = false; }, p => { p[1].manual_only = true; },
  p => { p[0].editorial_approval_hash = 'personal-edition'; }, p => { p[1].listed = false; },
  p => { p[0].pending_update = { reason: 'AI_HOURLY_CALL_LIMIT' }; },
  p => { p[1].pending_update = { reason: 'QUALITY_GATE_FAILED' }; },
  p => { p[0].provider_request_hold = { status: 'unknown', raw_response: 'not_confirmed' }; },
  p => { p[1].provider_request_hold = {}; },
  p => { p[0].living_file = { merged_story_ids: ['unreviewed'] }; },
  p => { p[1].retirement = { reason_code: 'OTHER' }; },
]) test('changed editions, open reviews, unknown writes, personal approvals or prior routing hold atomically', () => {
  const pair = fixture(); change(pair); const before = structuredClone(pair);
  assert.equal(consolidateUlm5Duplicates(pair, at).status, 'held'); assert.deepEqual(pair, before);
});

test('missing/ambiguous records and invalid or premature times never mutate data', () => {
  for (const pair of [[], [fixture()[0]]]) assert.equal(consolidateUlm5Duplicates(pair, at).status, 'not_present');
  const pair = fixture(); pair.push(structuredClone(pair[1])); const before = structuredClone(pair);
  assert.equal(consolidateUlm5Duplicates(pair, at).reason, 'STORY_ID_AMBIGUOUS'); assert.deepEqual(pair, before);
  assert.throws(() => consolidateUlm5Duplicates(fixture(), 'invalid'), /INVALID_CONSOLIDATION_TIME/);
  assert.equal(consolidateUlm5Duplicates(fixture(), '2026-10-24T20:00:00.000Z').status, 'held');
  const routed = fixture(); consolidateUlm5Duplicates(routed, at);
  const unchanged = structuredClone(routed);
  assert.equal(consolidateUlm5Duplicates(routed, '2026-10-24T22:00:00.000Z').status, 'held');
  assert.deepEqual(routed, unchanged);
});

for (const change of [
  p => { p[0].living_file.consolidations[0].reason = 'unknown instruction'; },
  p => { p[1].retirement.note = 'rewritten'; }, p => { p[1].retirement.preserve_full_publication = false; },
  p => { p[1].retirement.canonical_story_ids.push('unknown'); },
]) test('a changed already-routed marker cannot claim successful idempotence', () => {
  const pair = fixture(); consolidateUlm5Duplicates(pair, at); change(pair); const before = structuredClone(pair);
  assert.equal(consolidateUlm5Duplicates(pair, at).status, 'held'); assert.deepEqual(pair, before);
});

test('the archived source aliases to the canonical file and a paid packet union cannot buy a replacement', () => {
  const pair = fixture(); consolidateUlm5Duplicates(pair, at);
  const [candidate] = clusterItems([{ ...pair[1].sources[0], title: pair[1].title }], pair, at);
  assert.equal(candidate.story_id, canonicalId);
  const input = { story_id: canonicalId, existing_story: pair[0], sources: structuredClone(pair.flatMap(s => s.sources)) };
  assert.equal(retainedUlm5PaidInput(input, pair), true);
  for (const source of input.sources) { source.published_at = at; source.source_published_at = at; }
  assert.equal(retainedUlm5PaidInput(input, pair), true, 'feed clocks do not create new evidence');
  pair[0].pending_update = { reason: 'OPEN_REVIEW', untouched: true }; const before = structuredClone(pair);
  assert.equal(retainedUlm5PaidInput(input, pair), true); assert.deepEqual(pair, before);
  assert.ok(renderConsolidations(pair[0], new Set(pair.map(s => s.slug))).includes(pair[1].slug));
});

for (const change of [
  c => { c.sources[1].content_hash = 'new'; }, c => { c.sources[1].summary += ' new'; },
  c => { c.sources[1].title += ' new'; }, c => { c.sources[1].provenance = { origin: 'new' }; },
  c => { c.sources[1].article_excerpt = 'new'; }, c => { c.sources[1].evidence_segments = ['new']; },
  c => { c.sources.push({ url: 'https://example.org/unreviewed' }); },
  c => { c.reassessment = true; }, c => { c.impact_reassessment = true; },
  c => { c.followup_due = true; }, c => { c.deepening_due = true; }, c => { c.consolidation = true; },
]) test('new evidence and explicit followups retain all ordinary review gates', () => {
  const pair = fixture(); consolidateUlm5Duplicates(pair, at);
  const candidate = { story_id: canonicalId, existing_story: pair[0], sources: structuredClone(pair.flatMap(s => s.sources)) };
  change(candidate); assert.equal(retainedUlm5PaidInput(candidate, pair), false);
});

test('historical reader retains its entire previous main body with an explicit archive notice', () => {
  const sample = readRepositoryJson(new URL('../../data/news/stories.json', import.meta.url)).stories.find(s => s.published && s.listed !== false && s.analysis && !s.manual_only);
  const pair = fixture().map(s => ({ ...structuredClone(sample), ...s, analysis: structuredClone(sample.analysis),
    retirement: undefined, living_file: undefined, pending_update: undefined, provider_request_hold: undefined, last_updated: s.published_at }));
  const before = storyPage(pair[1]); assert.equal(consolidateUlm5Duplicates(pair, at).status, 'applied');
  const preserved = structuredClone(pair[1]), after = retiredStoryPage(pair[1]);
  const main = html => html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
  assert.equal(main(after).replace(/<aside\b[^>]*data-merged-publication-notice[\s\S]*?<\/aside>/, ''), main(before));
  assert.match(after, /name="robots" content="noindex,follow"/);
  assert.ok(after.includes(`href="../${pair[0].slug}/"`)); assert.deepEqual(pair[1], preserved);
});

test('ordinary serial runner routes exactly once with no provider call, new edition or changed paid history', async () => {
  let captured, calls = 0; const initial = fixture();
  const options = { dryRun: true, now: at, registry: { schema_version: '1.0', sources: [], policy: {} },
    state: { source_status: {}, seen_items: {}, pending_story_ids: [], relevance_filter_version: '4.0' },
    storyStore: { stories: initial }, usage: { runs: [] },
    newsroom: { source_items: {}, events: {}, event_sources: [], discovery_candidates: [] },
    budgetFx: { rate_date: '2026-10-23', rate_usd_per_eur: 1.16 },
    callAiImpl: async () => { calls++; throw Error('No paid replacement'); },
    fetchArticleImpl: async () => { throw Error('No live source fetch'); }, captureState: v => { captured = v; } };
  const first = await runWirkungsticker(options);
  assert.equal(first.ulm5_duplicate_consolidation.status, 'applied'); assert.equal(first.retired_stories, 1);
  assert.equal(first.public_changed, true); assert.equal(first.published_stories, 0); assert.equal(first.updated_stories, 0);
  assert.equal(calls, 0); assert.deepEqual(options.storyStore.stories, initial);
  const second = await runWirkungsticker({ ...options, ...captured });
  assert.equal(second.ulm5_duplicate_consolidation.status, 'already_applied');
  assert.equal(second.retired_stories, 0); assert.equal(second.public_changed, false); assert.equal(calls, 0);
});
