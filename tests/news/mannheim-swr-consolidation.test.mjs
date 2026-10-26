import test from 'node:test';
import assert from 'node:assert/strict';
import { consolidateMannheimSwrDuplicates as consolidate, retainedMannheimSwrPaidInput as retained } from '../../scripts/news/consolidate-mannheim-swr-duplicates.mjs';
import { clusterItems } from '../../scripts/news/lib.mjs';
import { runWirkungsticker } from '../../scripts/news/run.mjs';
import { retiredStoryPage, storyPage } from '../../scripts/news/build.mjs';
import { readRepositoryJson } from '../../scripts/news/newsroom-store.mjs';

const at = '2026-10-26T10:30:00.000Z';
const canonicalId = 'wt-9a186192b81f5883', duplicateId = 'wt-aab7a43e50d1d749';
const url = 'https://www.swr.de/swraktuell/baden-wuerttemberg/mannheim/explosion-in-mannheim-neckarstadt-100.html';
// Public identity bindings only; manuscripts, claims and paid fields are synthetic.
function fixture() {
  return [
    { story_id: canonicalId, event_id: 'event-b6cc7e9734cc380bf263',
      title: 'Laut SWR Aktuell: Explosion in Café im Mannheimer Stadtteil Neckarstadt-West',
      slug: 'explosion-in-einem-cafe-in-mannheim-1f5883', at: '2026-10-26T09:22:51.186Z',
      content_hash: '7ffde1ba1e3e4a9a182333f3277ab3ea2f20d4fd83f1370f239c21b5ddf7b89e',
      source_title: 'Explosion in einem Café in Mannheim',
      source_hash: '8eb3892ad3c3ae2659a5bfee9d5ad2e28cb996b6aa356c6a7a1f228dd6efb931' },
    { story_id: duplicateId, event_id: 'event-ccb0ff67e0f34b396dc3',
      title: 'Explosion in Mannheimer Café: Hintergründe offen',
      slug: 'explosion-in-mannheimer-cafe-hintergrunde-noch-unklar-d1d749', at: '2026-10-26T09:46:35.533Z',
      content_hash: 'cd6d6a8226120614513b236822ebe1110f94e10517afc425aa974ee27cb5206a',
      source_title: 'Explosion in Mannheimer Café: Hintergründe noch unklar',
      source_hash: '51f7d9f13a46376d79943c9c8920a6613541d186b845a2064f043f644490e81f' },
  ].map(({ at: publishedAt, source_title, source_hash, ...story }, i) => ({
    ...story, published: true, listed: true, current_version: 1, analysis_status: 'veröffentlicht',
    published_at: publishedAt, updated_at: publishedAt, first_seen: publishedAt, last_updated: publishedAt,
    sources: [{ source_id: 'swr-aktuell', publisher: 'Synthetic broadcaster', url, title: source_title,
      summary: `Synthetic evidence packet ${i}.`, content_hash: source_hash, published_at: publishedAt }],
    source_summary: `Synthetic paid summary ${i}.`, analysis: { marker: `paid-analysis-${i}` },
    source_integrity: { status: 'verified', publication_status: 'eligible', checked_at: publishedAt, issue_codes: [], warning_codes: [] },
    claims: [{ marker: `claim-${i}` }], versions: [{ version: 1, marker: `paid-version-${i}` }],
    publication_history: [{ version: 1, published_at: publishedAt }],
    original_potential_assessment: { marker: 'original' }, current_potential_assessment: { marker: 'current' },
    observed_effects: [{ marker: 'observed' }], ai_retry: { fingerprint: 'paid', retry_count: 1 },
    followups: [], unknown_retained_field: { marker: 'preserve' },
  }));
}

test('the exact SWR pair consolidates in either order, preserving every paid field and its dates', () => {
  for (const reverse of [false, true]) {
    const pair = fixture(), before = structuredClone(pair);
    assert.equal(consolidate(reverse ? [...pair].reverse() : pair, at).status, 'applied');
    assert.deepEqual(pair[0].living_file.merged_story_ids, [duplicateId]);
    assert.equal(pair[1].listed, false); assert.equal(pair[1].retirement.preserve_full_publication, true);
    for (const [i, story] of pair.entries()) for (const key of Object.keys(before[i])) {
      if (key !== 'listed') assert.deepEqual(story[key], before[i][key], key);
    }
    assert.equal(pair[0].pending_update, undefined, 'routing buys no union assessment');
    const once = structuredClone(pair);
    assert.equal(consolidate(pair, '2026-10-27T00:00:00Z').status, 'already_applied');
    assert.deepEqual(pair, once);
  }
});

test('changed editions, holds, failed gates and ambiguous routing fail atomically', () => {
  for (const change of [
    pair => { pair[0].current_version++; }, pair => { pair[1].content_hash = 'changed'; },
    pair => { pair[0].event_id = 'other-event'; }, pair => { pair[1].updated_at = at; },
    pair => { pair[1].sources[0].url += '?another'; }, pair => { pair[1].sources[0].content_hash = 'new'; },
    pair => { pair[1].sources[0].source_id = 'other'; }, pair => { pair[0].manual_only = true; },
    pair => { pair[0].editorial_approval_hash = 'human-edition'; }, pair => { pair[0].pending_update = { reason: 'AI_HOURLY_CALL_LIMIT' }; },
    pair => { pair[1].review_checkpoint = { reason: 'open-review' }; }, pair => { pair[0].provider_request_hold = {}; },
    pair => { pair[1].provider_request_hold = {}; }, pair => { pair[0].living_file = { merged_story_ids: ['other'] }; },
    pair => { pair[1].retirement = { reason_code: 'other' }; }, pair => { pair[1].listed = false; },
    pair => { pair[0].source_integrity.status = 'blocked'; }, pair => { pair[1].source_integrity.warning_codes.push('OPEN'); },
    pair => { pair[1].source_integrity.checked_at = '2027-01-01T00:00:00Z'; },
  ]) {
    const pair = fixture(); change(pair); const before = structuredClone(pair);
    assert.equal(consolidate(pair, at).status, 'held'); assert.deepEqual(pair, before);
  }
  assert.equal(consolidate([], at).status, 'not_present');
  assert.equal(consolidate(fixture().slice(0, 1), at).status, 'not_present');
  const ambiguous = fixture(); ambiguous.push(structuredClone(ambiguous[1]));
  assert.equal(consolidate(ambiguous, at).reason, 'STORY_ID_AMBIGUOUS');
  assert.equal(consolidate(fixture(), '2026-10-26T09:30:00Z').status, 'held');
  assert.throws(() => consolidate(fixture(), 'invalid'), /INVALID_CONSOLIDATION_TIME/);
});

test('a paid article alias fixes the actual headline/place split without broadening location matching', () => {
  const pair = fixture(), incoming = pair[1].sources[0];
  assert.equal(clusterItems([incoming], [pair[0]], at)[0].existing_story, null);
  consolidate(pair, at);
  const [cluster] = clusterItems([incoming], pair, at);
  assert.equal(cluster.story_id, canonicalId); assert.equal(cluster.existing_story, pair[0]);
});

test('retained source packets cannot buy another answer; new evidence or followups retain their gates', () => {
  const pair = fixture(); consolidate(pair, at);
  const candidate = { story_id: canonicalId, existing_story: pair[0], sources: structuredClone(pair.flatMap(s => s.sources)) };
  const before = structuredClone(pair);
  assert.equal(retained(candidate, pair), true);
  candidate.sources.forEach(source => { source.published_at = at; source.source_published_at = at; source.ingested_at = at; });
  assert.equal(retained(candidate, pair), true); assert.deepEqual(pair, before);
  for (const change of [
    item => { item.sources[1].summary = 'New facts'; }, item => { item.sources[1].title = 'New title'; },
    item => { item.sources[1].content_hash = 'new'; }, item => { item.sources[1].url += '?new'; },
    item => { item.sources[1].article_excerpt = 'Additional evidence'; }, item => { item.sources[1].evidence_segments = []; },
    item => { item.reassessment = true; }, item => { item.impact_reassessment = true; },
    item => { item.followup_due = true; }, item => { item.deepening_due = true; }, item => { item.consolidation = true; },
    item => { item.existing_story.pending_update = { reason: 'open' }; }, item => { item.existing_story.provider_request_hold = {}; },
  ]) { const changed = structuredClone(candidate); change(changed); assert.equal(retained(changed, pair), false); }
  assert.equal(retained(candidate, [pair[0]]), false);
  assert.equal(retained(candidate, [...pair, structuredClone(pair[1])]), false);
});

test('the complete archived public text remains, with only a canonical notice added', () => {
  const sample = readRepositoryJson(new URL('../../data/news/stories.json', import.meta.url)).stories.find(s => s.published && s.listed !== false && s.analysis);
  const pair = fixture().map(story => ({ ...structuredClone(sample), ...story, analysis: structuredClone(sample.analysis), pending_update: undefined, review_checkpoint: undefined, retirement: undefined, living_file: undefined }));
  const original = storyPage(pair[1]); assert.equal(consolidate(pair, at).status, 'applied');
  const body = html => html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
  const archived = retiredStoryPage(pair[1]);
  assert.equal(body(archived).replace(/<aside\b[^>]*data-merged-publication-notice[\s\S]*?<\/aside>/, ''), body(original));
  assert.match(archived, /name="robots" content="noindex,follow"/);
  assert.ok(archived.includes(`href="../${pair[0].slug}/"`));
});

test('the normal serial runner applies and repeats the repair without a provider call', async () => {
  let captured, calls = 0;
  const options = { dryRun: true, now: at, registry: { schema_version: '1.0', sources: [], policy: {} },
    state: { source_status: {}, seen_items: {}, pending_story_ids: [], relevance_filter_version: '4.0' }, storyStore: { stories: fixture() }, usage: { runs: [] },
    newsroom: { source_items: {}, events: {}, event_sources: [], discovery_candidates: [] }, budgetFx: { rate_date: '2026-10-23', rate_usd_per_eur: 1.1193 },
    callAiImpl: async () => { calls++; throw Error('Unexpected paid replacement'); }, fetchArticleImpl: async () => { throw Error('No live network'); },
    captureState: value => { captured = value; } };
  const first = await runWirkungsticker(options);
  assert.equal(first.mannheim_swr_duplicate_consolidation.status, 'applied'); assert.equal(first.retired_stories, 1); assert.equal(first.public_changed, true);
  const second = await runWirkungsticker({ ...options, storyStore: captured.storyStore, state: captured.state });
  assert.equal(second.mannheim_swr_duplicate_consolidation.status, 'already_applied'); assert.equal(second.retired_stories, 0); assert.equal(calls, 0);
});
