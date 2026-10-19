import test from 'node:test';
import assert from 'node:assert/strict';
import { consolidateHofheimDuplicates, retainedHofheimPaidInput } from '../../scripts/news/consolidate-hofheim-duplicates.mjs';
import { clusterItems } from '../../scripts/news/lib.mjs';
import { runWirkungsticker } from '../../scripts/news/run.mjs';
import { retiredStoryPage, storyPage } from '../../scripts/news/build.mjs';
import { readRepositoryJson } from '../../scripts/news/newsroom-store.mjs';

const at = '2026-10-19T14:30:00Z', canonicalId = 'wt-6345bdbaf4e8fd51', duplicateId = 'wt-e083b8d828fa80c8';
// Only public identity bindings are real; all manuscripts and paid fields are synthetic.
function fixture() {
  return [
    { story_id: canonicalId, current_version: 2, slug: 'einsatz-explosion-in-donerimbiss-in-hofheim-e8fd51',
      published_at: '2026-10-19T07:33:00.805Z', updated_at: '2026-10-19T13:43:06.205Z',
      content_hash: '65d21e70faf0b1bc2d619265cb1c3849f7b2a1ee6a09acdd39d9d5979151ec3b',
      sources: [
        ['https://www.stern.de/gesellschaft/regional/hessen/einsatz--explosion-in-doenerimbiss-in-hofheim-38417234.html', '1b66ecf99f047357ba2987e672a63d3a8f8cc3612759022621dcc8dbffcb5e51'],
        ['https://www.stern.de/gesellschaft/regional/hessen/einsatz--explosion-in-doenerimbiss---polizei-vermutet-vorsatz-38417234.html', 'a951f6774890bf7ec4fac5f4488f98d7d221bd69f944b6df401f12afd50d13ee'],
      ] },
    { story_id: duplicateId, current_version: 1, slug: 'anschlag-auf-doner-imbiss-in-hofheim-glasturen-und-fenster-zerstort-fa80c8',
      published_at: '2026-10-19T10:01:38.056Z', updated_at: '2026-10-19T10:01:38.056Z',
      content_hash: 'ed73e2e862ee3660ab0adb202f3310fdb7b430a50b578b9acaf24a5e647df42f',
      sources: [['https://www.hessenschau.de/panorama/anschlag-auf-doener-imbiss-in-hofheim---glastueren-und-fenster-zerstoert-v1,hofheim-explosion-104.html', '448b78d37838b9b989dcc9ec2ca8247fbd31c543c56330b35f377245a2793801']] },
  ].map(s => ({ ...s, published: true, listed: true, title: 'Synthetic retained headline',
    source_summary: 'Synthetic retained summary.', analysis: { marker: 'paid-analysis' },
    sources: s.sources.map(([url, content_hash]) => ({ url, content_hash, title: 'Synthetic source', publisher: 'Synthetic publisher', summary: 'Synthetic evidence', published_at: s.published_at })),
    versions: [{ version: s.current_version, retained: true }], publication_history: [{ version: 1, published_at: s.published_at }],
    claims: [{ marker: 'retained' }], original_potential_assessment: { marker: 'original' }, current_potential_assessment: { marker: 'current' },
    observed_effects: [{ marker: 'observed' }], ai_retry: { fingerprint: 'paid', retry_count: 1 },
    ai_retry_history: [{ fingerprint: 'older-paid', retry_count: 1 }], followups: [{ marker: 'open' }], unknown_retained_field: { marker: 'retain' },
  }));
}

test('the exact Hofheim V2/V1 pair is listed once, without changing any paid or historical field', () => {
  for (const reverse of [false, true]) {
    const pair = fixture(), before = structuredClone(pair);
    assert.equal(consolidateHofheimDuplicates(reverse ? [...pair].reverse() : pair, at).status, 'applied');
    assert.equal(pair.filter(s => s.listed !== false).length, 1);
    assert.deepEqual(pair[0].living_file.merged_story_ids, [duplicateId]);
    assert.deepEqual(pair[1].retirement.canonical_story_ids, [canonicalId]);
    assert.equal(pair[1].retirement.preserve_full_publication, true);
    for (const [i, s] of pair.entries()) for (const key of Object.keys(before[i])) {
      if (key !== 'listed') assert.deepEqual(s[key], before[i][key], key);
    }
    assert.equal(pair[0].pending_update, undefined); assert.equal(pair[1].pending_update, undefined);
    const applied = structuredClone(pair);
    assert.equal(consolidateHofheimDuplicates(pair, '2026-10-20T00:00:00Z').status, 'already_applied');
    assert.deepEqual(pair, applied);
  }
});

test('new editions, pending work, ambiguous IDs and changed routing fail closed before any mutation', () => {
  for (const mutate of [
    p => { p[0].current_version = 3; }, p => { p[1].current_version = 2; },
    p => { p[0].content_hash = 'changed'; }, p => { p[1].sources[0].content_hash = 'changed'; },
    p => { p[0].sources[0].url = 'https://example.org/another-event'; }, p => { p[0].sources[1] = p[0].sources[0]; },
    p => { p[1].sources.push({ url: 'https://example.org/new' }); }, p => { p[0].updated_at = at; },
    p => { p[1].published_at = at; }, p => { p[0].slug = 'changed'; },
    p => { p[0].pending_update = { reason: 'AI_HOURLY_CALL_LIMIT' }; },
    p => { p[1].pending_update = { reason: 'QUALITY_GATE_FAILED' }; },
    p => { p[0].manual_only = true; }, p => { p[1].editorial_approval_hash = 'private'; },
    p => { p[0].published = false; }, p => { p[1].listed = false; },
    p => { p[0].living_file = { merged_story_ids: ['other'] }; }, p => { p[1].retirement = { reason_code: 'OTHER' }; },
    p => { p.push(structuredClone(p[0])); },
  ]) { const pair = fixture(); mutate(pair); const before = structuredClone(pair);
    assert.equal(consolidateHofheimDuplicates(pair, at).status, 'held'); assert.deepEqual(pair, before); }
  assert.equal(consolidateHofheimDuplicates([], at).status, 'not_present');
  assert.equal(consolidateHofheimDuplicates(fixture().slice(0, 1), at).status, 'not_present');
  assert.throws(() => consolidateHofheimDuplicates(fixture(), 'invalid'), /INVALID_CONSOLIDATION_TIME/);
  assert.equal(consolidateHofheimDuplicates(fixture(), '2026-10-19T10:30:00Z').status, 'held');
  const corrupt = fixture(); consolidateHofheimDuplicates(corrupt, at);
  corrupt[1].retirement.canonical_story_ids = ['other']; const before = structuredClone(corrupt);
  assert.equal(consolidateHofheimDuplicates(corrupt, at).status, 'held'); assert.deepEqual(corrupt, before);
});

test('exact published URLs route to the canonical file, never a merely similar Hofheim topic', () => {
  const pair = fixture(); consolidateHofheimDuplicates(pair, at);
  for (const source of pair.flatMap(s => s.sources)) assert.equal(clusterItems([{ ...source, published_at: at }], pair, at)[0].story_id, canonicalId);
  assert.notEqual(clusterItems([{ url: 'https://example.org/hofheim-new-incident', title: 'A different synthetic incident', summary: 'Another place and date.', published_at: at }], pair, at)[0].story_id, canonicalId);
});

test('the same retained paid source union never becomes a new paid assessment after routing', () => {
  const pair = fixture(); consolidateHofheimDuplicates(pair, at);
  const candidate = { story_id: canonicalId, existing_story: pair[0], sources: structuredClone(pair.flatMap(s => s.sources)) };
  const before = structuredClone(pair);
  assert.equal(retainedHofheimPaidInput(candidate, pair), true);
  candidate.sources.forEach(s => { s.published_at = at; s.source_published_at = at; s.ingested_at = at; });
  assert.equal(retainedHofheimPaidInput(candidate, pair), true); assert.deepEqual(pair, before);
  for (const mutate of [
    c => { c.sources[2].summary = 'New evidence'; }, c => { c.sources[2].title = 'New claim'; },
    c => { c.sources[2].content_hash = 'new'; }, c => { c.sources[2].url = 'https://example.org/new'; },
    c => { c.sources[2].provenance = { publisher_id: 'other' }; }, c => { c.sources.push({ url: 'https://example.org/addition' }); },
    c => { c.reassessment = true; }, c => { c.impact_reassessment = true; },
  ]) { const changed = structuredClone(candidate); mutate(changed); assert.equal(retainedHofheimPaidInput(changed, pair), false); }
  assert.equal(retainedHofheimPaidInput({ ...candidate, sources: pair[0].sources }, pair), false);
  assert.equal(retainedHofheimPaidInput(candidate, [pair[0]]), false);
  assert.equal(retainedHofheimPaidInput(candidate, [...pair, structuredClone(pair[1])]), false);
});

test('the archive retains the complete paid reader while adding only a transparent canonical notice', () => {
  const sample = readRepositoryJson(new URL('../../data/news/stories.json', import.meta.url)).stories.find(s => s.published && s.listed !== false && s.analysis);
  const pair = fixture().map(s => ({ ...structuredClone(sample), ...s, analysis: structuredClone(sample.analysis), pending_update: undefined, retirement: undefined, living_file: undefined }));
  const original = storyPage(pair[1]); consolidateHofheimDuplicates(pair, at);
  const before = structuredClone(pair[1]), archived = retiredStoryPage(pair[1]);
  const body = html => html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
  assert.equal(body(archived).replace(/<aside\b[^>]*data-merged-publication-notice[\s\S]*?<\/aside>/, ''), body(original));
  assert.match(archived, /name="robots" content="noindex,follow"/);
  assert.ok(archived.includes(`href="../${pair[0].slug}/"`)); assert.deepEqual(pair[1], before);
});

test('the ordinary serial runner applies and repeats the listing-only repair without a provider call', async () => {
  let captured, calls = 0; const pair = fixture();
  const options = { dryRun: true, now: at, registry: { schema_version: '1.0', sources: [], policy: {} },
    state: { source_status: {}, seen_items: {}, pending_story_ids: [], relevance_filter_version: '4.0' }, storyStore: { stories: pair }, usage: { runs: [] },
    newsroom: { source_items: {}, events: {}, event_sources: [], discovery_candidates: [] }, budgetFx: { rate_date: '2026-10-16', rate_usd_per_eur: 1.16 },
    callAiImpl: async () => { calls++; throw Error('Unexpected paid replacement'); }, fetchArticleImpl: async () => { throw Error('No live network'); },
    captureState: value => { captured = value; } };
  const first = await runWirkungsticker(options);
  assert.equal(first.hofheim_duplicate_consolidation.status, 'applied'); assert.equal(first.retired_stories, 1); assert.equal(first.public_changed, true);
  const second = await runWirkungsticker({ ...options, storyStore: captured.storyStore, state: captured.state });
  assert.equal(second.hofheim_duplicate_consolidation.status, 'already_applied'); assert.equal(second.retired_stories, 0); assert.equal(calls, 0);
});
