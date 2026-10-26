import test from 'node:test';
import assert from 'node:assert/strict';
import { consolidateMannheimSternDuplicates as consolidate, retainedMannheimSternPaidInput as retained } from '../../scripts/news/consolidate-mannheim-stern-duplicates.mjs';
import { clusterItems } from '../../scripts/news/lib.mjs';
import { runWirkungsticker } from '../../scripts/news/run.mjs';
import { retiredStoryPage, storyPage } from '../../scripts/news/build.mjs';
import { readRepositoryJson } from '../../scripts/news/newsroom-store.mjs';
import {capacityReview} from './fixtures/capacity-review.mjs';

const at = '2026-10-26T11:40:00.000Z';
const canonicalId = 'wt-a20c5882ecfee0cf', duplicateId = 'wt-2c796868270ba89b';
const oldUrl = 'https://www.stern.de/gesellschaft/regional/baden-wuerttemberg/kriminalpolizei-ermittelt--explosion-in-mannheimer-caf%C3%A9---angriff-mit-sprengkoerper--38451374.html';
const url = 'https://www.stern.de/gesellschaft/regional/baden-wuerttemberg/kriminalpolizei-ermittelt--verletzter-bei-explosion-in-caf%C3%A9---wer-steckt-dahinter--38451374.html';
// Public identity bindings only; manuscripts, claims and paid fields are synthetic.
function fixture() {
  return [
    { story_id: canonicalId, event_id: 'event-1351b3d83809d23417ab',
      title: 'Explosion in Mannheimer Café: Kriminalpolizei ermittelt, Hintergründe offen',
      slug: 'kriminalpolizei-ermittelt-explosion-in-mannheimer-cafe-angriff-mit-sprengkorper-fee0cf', at: '2026-10-26T06:54:13.788Z',
      content_hash: '173c233826e90a54c68cfd810e8395ab644a5b2079afd1ef8f3bfe069a2e1649',
      source_title: 'Kriminalpolizei ermittelt: Explosion in Mannheimer Café - Angriff mit Sprengkörper?',
      source_hash: 'd9ceb0f51389b5fca747e657f74c5e30963b1c84aa34ef4015af33800c2b24b3' },
    { story_id: duplicateId, event_id: 'event-1959b6efd600e274030b',
      title: 'Laut stern: Mann bei Explosion in Mannheimer Café verletzt – Hintergründe offen',
      slug: 'kriminalpolizei-ermittelt-verletzter-bei-explosion-in-cafe-wer-steckt-dahinter-0ba89b', at: '2026-10-26T10:57:28.879Z',
      content_hash: '52f3c8401faa1f0dc594b6c71f041fa1b222cfa9f7d3b8ecfd6e03bfa23392c9',
      source_title: 'Kriminalpolizei ermittelt: Verletzter bei Explosion in Café - Wer steckt dahinter?',
      source_hash: '4c66a523162689bbf4f6a9269f3a10d8531d1dd79a951147f4f96979321b46db' },
  ].map(({ at: publishedAt, source_title, source_hash, ...story }, i) => ({
    ...story, published: true, listed: true, current_version: 1, analysis_status: 'veröffentlicht',
    published_at: publishedAt, updated_at: publishedAt, first_seen: publishedAt, last_updated: publishedAt,
    sources: [{ source_id: 'stern-schlagzeilen', publisher: 'Synthetic publisher', url: i ? url : oldUrl, title: source_title,
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

test('the exact stern pair consolidates in either order, preserving every paid field and its dates', () => {
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
  assert.equal(first.mannheim_stern_duplicate_consolidation.status, 'applied'); assert.equal(first.retired_stories, 1); assert.equal(first.public_changed, true);
  const second = await runWirkungsticker({ ...options, storyStore: captured.storyStore, state: captured.state });
  assert.equal(second.mannheim_stern_duplicate_consolidation.status, 'already_applied'); assert.equal(second.retired_stories, 0); assert.equal(calls, 0);
});

test('a later unchanged capacity review is preserved and never marked as assessed by the stern routing fix', () => {
  const pair = fixture(); pair.forEach(story => {story.pending_update = capacityReview(story, at);});
  const before = structuredClone(pair);
  assert.equal(consolidate(pair, at).status, 'applied');
  pair.forEach((story, i) => {assert.deepEqual(story.pending_update, before[i].pending_update); assert.deepEqual(story.versions, before[i].versions);});
  assert.equal(retained({story_id: canonicalId, existing_story: pair[0], sources: pair[0].sources}, pair), false, 'queued assessments keep the normal gates');
});
