import test from 'node:test';
import assert from 'node:assert/strict';
import { consolidateTrumpSanctionsDuplicates, retainedSanctionsPaidInput } from '../../scripts/news/consolidate-trump-sanctions-duplicates.mjs';
import { clusterItems } from '../../scripts/news/lib.mjs';
import { renderConsolidations, retiredStoryPage, storyPage } from '../../scripts/news/build.mjs';
import { runWirkungsticker } from '../../scripts/news/run.mjs';
import { readRepositoryJson } from '../../scripts/news/newsroom-store.mjs';

const at = '2026-10-19T09:30:00.000Z';
const canonicalId = 'wt-f166cf89aff14781', duplicateId = 'wt-e6f5bced9f7c773a';
const oldUrl = 'https://www.deutschlandfunk.de/trump-verteidigt-aussetzen-von-sanktionen-gegen-russland-100.html';
const newUrl = 'https://www.deutschlandfunk.de/trump-verteidigt-aussetzen-von-russland-sanktionen-will-moskau-am-verhandlungstisch-halten-100.html';

// Synthetic reader content; only already-public identity bindings are real.
function fixture() {
  return [
    { story_id: canonicalId,
      slug: 'trump-verteidigt-aussetzen-von-sanktionen-gegen-russland-gegen-kritik-f14781',
      published_at: '2026-10-19T07:07:24.430Z',
      content_hash: '1d1e86e5cf579f7e80a9b6cd9ca02ad3a4f7ad8f56a6fef51dfe09d4406bb4fc',
      sources: [
        { url: 'https://www.stern.de/news/trump-verteidigt-aussetzen-von-sanktionen-gegen-russland-gegen-kritik-38416436.html',
          content_hash: 'fbda795f190afb93e34f90bef9574ec15498f6aa9445f595eeb6db03f98afa5b' },
        { url: oldUrl, content_hash: '7082659af0d00f21a4efdb44a69749a778421ee3b38e40fc34b022212edf109e' },
      ] },
    { story_id: duplicateId,
      slug: 'ukraine-krieg-trump-verteidigt-aussetzen-von-russland-sanktionen-will-moskau-am-verhandl-7c773a',
      published_at: '2026-10-19T07:54:51.732Z',
      content_hash: 'f06ce20671e3d1bfe96c7b30e61daab17230b8e7d4208dd4606220d5d1bc13f1',
      sources: [{ url: newUrl, content_hash: 'e29d6085b92842f756b9d74426ac75a6a95714c1eebb48eb3efae43b64c516d0' }] },
  ].map(s => ({ ...s, title: 'Synthetic retained headline', published: true, listed: true,
    sources: s.sources.map(source => ({ ...source, title: 'Synthetic retained headline',
      summary: 'Synthetic retained summary.', published_at: s.published_at })),
    updated_at: s.published_at, last_updated: s.published_at, current_version: 1,
    source_summary: 'Synthetic retained summary.', analysis: { marker: 'paid-analysis' },
    versions: [{ version: 1, analyzed_at: s.published_at }], claims: [{ claim_id: 'retained' }],
    publication_history: [{ version: 1, published_at: s.published_at }],
    original_potential_assessment: { marker: 'original' }, current_potential_assessment: { marker: 'current' },
    observed_effects: [{ marker: 'retained' }], ai_retry: { fingerprint: 'paid', retry_count: 1 },
    ai_retry_history: [{ fingerprint: 'older-paid', retry_count: 1 }],
    followups: [{ followup_id: 'existing' }], unknown_retained_field: { marker: 'keep' },
  }));
}

test('only the exact DLF URL-change pair is listed once, with all paid fields unchanged', () => {
  for (const reverse of [false, true]) {
    const pair = fixture(), before = structuredClone(pair);
    assert.equal(consolidateTrumpSanctionsDuplicates(reverse ? [...pair].reverse() : pair, at).status, 'applied');
    assert.equal(pair.filter(s => s.listed !== false).length, 1);
    assert.deepEqual(pair[0].living_file.merged_story_ids, [duplicateId]);
    assert.deepEqual(pair[1].retirement.canonical_story_ids, [canonicalId]);
    assert.equal(pair[1].retirement.preserve_full_publication, true);
    for (const [i, s] of pair.entries()) for (const key of Object.keys(before[i])) {
      if (key !== 'listed') assert.deepEqual(s[key], before[i][key], key);
    }
    assert.equal(pair[0].pending_update, undefined);
    assert.equal(pair[1].pending_update, undefined);
    const applied = structuredClone(pair);
    assert.equal(consolidateTrumpSanctionsDuplicates(pair, '2026-10-20T00:00:00Z').status, 'already_applied');
    assert.deepEqual(pair, applied);
  }
});

for (const mutate of [
  p => { p[0].content_hash = 'changed'; }, p => { p[1].sources[0].content_hash = 'changed'; },
  p => { p[0].sources[1].url = 'https://example.org/other'; },
  p => { p[1].sources.push({ url: oldUrl }); }, p => { p[0].sources[1] = p[0].sources[0]; },
  p => { p[0].current_version = 2; }, p => { p[1].updated_at = at; },
  p => { p[0].published_at = at; }, p => { p[1].slug = 'changed'; },
  p => { p[0].pending_update = { reason: 'AI_BUDGET_OR_BATCH_LIMIT' }; },
  p => { p[1].pending_update = { reason: 'QUALITY_GATE_FAILED' }; },
  p => { p[0].living_file = { merged_story_ids: ['other'] }; },
  p => { p[1].retirement = { reason_code: 'OTHER' }; },
  p => { p[0].published = false; }, p => { p[1].listed = false; },
  p => { p[0].manual_only = true; }, p => { p[1].editorial_approval_hash = 'private-edition'; },
]) test('changed editions, pending work and unrelated routing are held atomically', () => {
  const pair = fixture(); mutate(pair); const before = structuredClone(pair);
  assert.equal(consolidateTrumpSanctionsDuplicates(pair, at).status, 'held');
  assert.deepEqual(pair, before);
});

test('missing or ambiguous IDs, early times and corrupt prior routing never change a publication', () => {
  for (const pair of [[], fixture().slice(0, 1)]) {
    const before = structuredClone(pair);
    assert.equal(consolidateTrumpSanctionsDuplicates(pair, at).status, 'not_present');
    assert.deepEqual(pair, before);
  }
  const pair = fixture(); pair.push(structuredClone(pair[0])); const before = structuredClone(pair);
  assert.equal(consolidateTrumpSanctionsDuplicates(pair, at).reason, 'STORY_ID_AMBIGUOUS');
  assert.deepEqual(pair, before);
  assert.throws(() => consolidateTrumpSanctionsDuplicates(fixture(), 'invalid'), /INVALID_CONSOLIDATION_TIME/);
  const early = fixture(), earlyBefore = structuredClone(early);
  assert.equal(consolidateTrumpSanctionsDuplicates(early, '2026-10-19T07:30:00Z').status, 'held');
  assert.deepEqual(early, earlyBefore);
  const corrupt = fixture(); consolidateTrumpSanctionsDuplicates(corrupt, at);
  corrupt[1].retirement.canonical_story_ids = ['another']; const corruptBefore = structuredClone(corrupt);
  assert.equal(consolidateTrumpSanctionsDuplicates(corrupt, at).status, 'held');
  assert.deepEqual(corrupt, corruptBefore);
});

test('both exact source URLs route to the canonical file without treating a common topic as identity', () => {
  const pair = fixture(); consolidateTrumpSanctionsDuplicates(pair, at);
  for (const s of pair.flatMap(s => s.sources)) {
    assert.equal(clusterItems([{ ...s, title: pair[0].title, published_at: at }], pair, at)[0].story_id, canonicalId);
  }
  const other = { title: 'Neues anderes Ereignis', summary: 'Neue Lage in einem anderen Land.',
    url: 'https://www.deutschlandfunk.de/andere-sanktionsentscheidung-100.html', published_at: at };
  assert.notEqual(clusterItems([other], pair, at)[0].story_id, canonicalId);
  assert.match(renderConsolidations(pair[0], new Set(pair.map(s => s.slug))), new RegExp(pair[1].slug));
});

test('an archived paid input is held across publisher clock changes, never called a new assessment', () => {
  const pair = fixture(); consolidateTrumpSanctionsDuplicates(pair, at);
  const candidate = { story_id: canonicalId, existing_story: pair[0],
    sources: structuredClone(pair.flatMap(s => s.sources)) };
  const before = structuredClone(pair);
  assert.equal(retainedSanctionsPaidInput(candidate, pair), true);
  candidate.sources.forEach(s => { s.published_at = at; s.source_published_at = at; s.ingested_at = at; });
  assert.equal(retainedSanctionsPaidInput(candidate, pair), true);
  assert.deepEqual(pair, before);
  for (const mutate of [
    c => { c.sources[2].summary = 'Genuinely changed evidence'; },
    c => { c.sources[2].title = 'Changed claim'; },
    c => { c.sources[2].content_hash = 'changed'; },
    c => { c.sources[2].url = 'https://example.org/new'; },
    c => { c.sources[2].source_role = 'primary_source'; },
    c => { c.sources[2].provenance = { publisher_id: 'another' }; },
    c => { c.sources.push({ url: 'https://example.org/addition' }); },
    c => { c.reassessment = true; }, c => { c.impact_reassessment = true; },
  ]) { const changed = structuredClone(candidate); mutate(changed); assert.equal(retainedSanctionsPaidInput(changed, pair), false); }
  assert.equal(retainedSanctionsPaidInput({ ...candidate, sources: pair[0].sources }, pair), false);
  assert.equal(retainedSanctionsPaidInput(candidate, [pair[0]]), false);
  assert.equal(retainedSanctionsPaidInput(candidate, [...pair, structuredClone(pair[1])]), false);
  for (const mutate of [
    p => { p[0].sources = undefined; }, p => { p[1].sources = []; },
    p => { p[1].retirement.preserve_full_publication = false; },
    p => { p[0].listed = false; }, p => { p[1].retirement.canonical_story_ids = ['other']; },
  ]) { const changed = structuredClone(pair); mutate(changed);
    assert.equal(retainedSanctionsPaidInput({ ...candidate, existing_story: changed[0] }, changed), false); }
});

test('a normal queued review containing the archived source is held without losing the review', async () => {
  const pair = fixture();
  pair.forEach(s => { s.title = 'Trump verteidigt Aussetzen von Sanktionen gegen Russland';
    s.sources.forEach(source => { const stern = source.url.includes('stern.de');
      source.title = s.title; source.source_id = stern ? 'stern-schlagzeilen' : 'dlf-nachrichten';
      source.publisher_id = stern ? 'stern' : 'deutschlandfunk';
      source.publisher = stern ? 'stern' : 'Deutschlandfunk'; source.source_role = 'journalistic_report';
      source.primary_source = false; source.requires_corroboration = false;
      source.provenance = { origin: `publisher:${source.publisher_id}`, basis: 'publisher_only_origin_unverified', independence_established: false };
    }); });
  consolidateTrumpSanctionsDuplicates(pair, at);
  pair[0].pending_update = { reason: 'AI_BUDGET_OR_BATCH_LIMIT', detected_at: at,
    sources: structuredClone(pair.flatMap(s => s.sources)) };
  const before = structuredClone(pair); let calls = 0, captured;
  const report = await runWirkungsticker({ dryRun: true, now: at,
    registry: { schema_version: '1.0', sources: [], policy: {} },
    state: { source_status: {}, seen_items: {}, pending_story_ids: [canonicalId], relevance_filter_version: '4.0' },
    storyStore: { stories: pair }, usage: { runs: [] },
    newsroom: { source_items: {}, events: {}, event_sources: [], discovery_candidates: [] },
    budgetFx: { rate_date: '2026-10-16', rate_usd_per_eur: 1.16 },
    callAiImpl: async () => { calls += 1; throw Error('Unexpected paid replacement'); },
    fetchArticleImpl: async () => { throw Error('No live network'); },
    captureState: value => { captured = value; } });
  assert.equal(report.retained_published_source_inputs?.length, 1);
  assert.equal(calls, 0);
  assert.deepEqual(captured.storyStore.stories.find(s => s.story_id === canonicalId).pending_update, before[0].pending_update);
  assert.deepEqual(pair, before);
});

test('the archive keeps the entire prior reader body, claims, profile and history byte-for-byte', () => {
  const sample = readRepositoryJson(new URL('../../data/news/stories.json', import.meta.url))
    .stories.find(s => s.published && s.listed !== false && s.analysis);
  const pair = fixture().map(s => ({ ...structuredClone(sample), ...s, retirement: undefined,
    living_file: undefined, pending_update: undefined, analysis: structuredClone(sample.analysis),
    sources: s.sources.map(source => ({ ...source, publisher: 'Synthetic publisher', title: 'Synthetic source' })) }));
  const original = storyPage(pair[1]);
  assert.equal(consolidateTrumpSanctionsDuplicates(pair, at).status, 'applied');
  const before = structuredClone(pair[1]), archived = retiredStoryPage(pair[1]);
  const body = html => html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
  assert.equal(body(archived).replace(/<aside\b[^>]*data-merged-publication-notice[\s\S]*?<\/aside>/, ''), body(original));
  assert.match(archived, /name="robots" content="noindex,follow"/);
  assert.ok(archived.includes(`href="../${pair[0].slug}/"`));
  assert.deepEqual(pair[1], before);
});

test('the ordinary serial runner applies and replays the repair with zero provider calls', async () => {
  let captured, calls = 0;
  const pair = fixture();
  const options = { dryRun: true, now: at, registry: { schema_version: '1.0', sources: [], policy: {} },
    state: { source_status: {}, seen_items: {}, pending_story_ids: [], relevance_filter_version: '4.0' },
    storyStore: { stories: pair }, usage: { runs: [] },
    newsroom: { source_items: {}, events: {}, event_sources: [], discovery_candidates: [] },
    budgetFx: { rate_date: '2026-10-16', rate_usd_per_eur: 1.16 },
    callAiImpl: async () => { calls += 1; throw Error('Unexpected paid replacement'); },
    fetchArticleImpl: async () => { throw Error('No live network'); },
    captureState: value => { captured = value; } };
  const first = await runWirkungsticker(options);
  assert.equal(first.trump_sanctions_duplicate_consolidation.status, 'applied');
  assert.equal(first.retired_stories, 1); assert.equal(first.public_changed, true);
  assert.equal(first.published_stories, 0); assert.equal(first.updated_stories, 0);
  assert.equal(calls, 0); assert.deepEqual(pair, fixture());
  const second = await runWirkungsticker({ ...options, ...captured });
  assert.equal(second.trump_sanctions_duplicate_consolidation.status, 'already_applied');
  assert.equal(second.retired_stories, 0); assert.equal(second.public_changed, false);
  assert.equal(calls, 0);
});
