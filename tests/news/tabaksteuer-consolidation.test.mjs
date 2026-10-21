import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { consolidateTabaksteuerDuplicates, retainedTabaksteuerPaidInput } from '../../scripts/news/consolidate-tabaksteuer-duplicates.mjs';
import { sourceReviewFingerprint } from '../../scripts/news/evidence-packets.mjs';
import { clusterItems } from '../../scripts/news/lib.mjs';
import { runWirkungsticker } from '../../scripts/news/run.mjs';
import { storyPage, retiredStoryPage, renderConsolidations } from '../../scripts/news/build.mjs';
import { readRepositoryJson } from '../../scripts/news/newsroom-store.mjs';

const at = '2026-10-21T07:30:00Z', canonicalId = 'wt-09a10505ad0c0424', duplicateId = 'wt-120df3585dc5796e';
const sourceBindings = [
  ['https://www.stern.de/wirtschaft/news/zigaretten--nach-ministeriumspatzer--gesetz-tritt-aus-versehen-in-kraft-38427596.html', '38c155d2b3d6f885bde07c224f6d0f9f9334805083c8000132bf6d7d9f1dc30e'],
  ['https://www.tagesspiegel.de/wirtschaft/dpa-zigaretten-nach-ministeriumspatzer-gesetz-tritt-aus-versehen-in-kraft-16181949.html', '8d20bed1663cccba6d5cab25bbd44e87c0adfd408d72253fb1399a924d1ef8d4'],
  ['https://www.deutschlandfunk.de/neues-tabaksteuer-gesetz-tritt-aus-versehen-bereits-in-kraft-102.html', 'fcdc01c915644867975196299182a0c5ae712d95357f79846cb8bf193eaa0330'],
  ['https://www.stern.de/politik/deutschland/gesetz-zur-tabaksteuer-tritt-aus-versehen-zu-frueh-in-kraft-38427596.html', '6eb6b7b0368169faa89e700aabdf31eccac2ce5ea74bd7c144aa5686a88642bc'],
  ['https://www.tagesspiegel.de/politik/dpa-zigaretten-nach-ministeriumspatzer-gesetz-tritt-aus-versehen-in-kraft-16181949.html', 'ecca60be2c9e65c1df58de68867a71600a0b1098d0ef29c2810b93a705022be2'],
];
const source = i => ({ url: sourceBindings[i][0], content_hash: sourceBindings[i][1], source_id: `synthetic-${i}`,
  title: 'Synthetic parliament beschliesst synthetisches Steuergesetz',
  summary: 'Synthetic evidence for the same retained event and its open questions.',
  published_at: '2026-10-21T06:00:00Z', ingested_at: '2026-10-21T06:30:00Z',
  publisher: 'Synthetic publisher', source_role: 'journalistic_report', provenance: { origin: `publisher:synthetic-${i}`, independence_established: false } });

// Public edition/source identity only; all manuscripts and paid payloads are synthetic.
function fixture() {
  return [
    { story_id: canonicalId, slug: 'zigaretten-nach-ministeriumspatzer-gesetz-tritt-aus-versehen-in-kraft-0c0424',
      published_at: '2026-10-21T03:29:25.792Z', content_hash: 'c6c5c07feb3b01a92c653be7d7b8ad2616ed478f5140167d258c7bee93cf0ba1', sources: [source(0), source(1)] },
    { story_id: duplicateId, slug: 'fehler-des-ministeriums-neues-tabaksteuer-gesetz-tritt-aus-versehen-bereits-in-kraft-c5796e',
      published_at: '2026-10-21T06:43:25.525Z', content_hash: 'dbbb5ccb9623d2dc95a6a620161c03dedef913040b67bda408b3d230a8d0dde6', sources: [source(2)] },
  ].map(s => ({ ...s, current_version: 1, updated_at: s.published_at, published: true, listed: true,
    title: 'Synthetic retained headline', source_summary: 'Synthetic retained summary.', analysis: { marker: 'paid' },
    versions: [{ version: 1, retained: true }], publication_history: [{ version: 1, published_at: s.published_at }],
    claims: [{ retained: true }], followups: [{ followup_id: s.story_id, status: 'open' }],
    observed_effects: [{ retained: true }], original_potential_assessment: { retained: true },
    current_potential_assessment: { retained: true }, unknown_retained_field: { retained: true } }));
}

function failedPending(pair) {
  const s = pair[0];
  s.pending_update = { detected_at: '2026-10-21T04:31:56.629Z',
    content_hash: '226657b4a5dc2a2720340644b3b14a7c90ea9423662a0f6bd5e03d3db294b146',
    sources: [source(0), source(1), source(3), source(4)], reason: 'AI_ATTEMPT_LIMIT_REACHED',
    quality_errors: ['AI_SOURCE_SUMMARY_LENGTH'], quality_retry_count: 1, quality_retry_after: null,
    reassessment: false, fresh: true, consolidation: false,
    source_integrity: { version: '1.2', status: 'verified', publication_status: 'eligible',
      checked_at: '2026-10-21T06:30:00Z', fingerprint: 'b'.repeat(64), issue_codes: [], warning_codes: [] } };
  const evidence = { version: 'paid-input-evidence-1', title: s.title, published_version: 1,
    sources: s.pending_update.sources.map(x => sourceReviewFingerprint({ ...x, published_at: null, source_published_at: null })).sort() };
  s.ai_retry = { version: '2026-09-15-direct-3', fingerprint: 'a'.repeat(64),
    evidence_fingerprint_version: 'paid-input-evidence-1',
    evidence_fingerprint: createHash('sha256').update(JSON.stringify(evidence)).digest('hex'),
    first_failed_at: '2026-10-21T05:44:43.778Z', failed_at: '2026-10-21T05:44:43.778Z',
    retry_after: '2026-10-21T05:59:43.778Z', retry_count: 1 };
  s.ai_retry_history = [structuredClone(s.ai_retry)];
  return pair;
}

function assertPreserved(pair, before) {
  for (const [i, s] of pair.entries()) for (const key of Object.keys(before[i])) {
    if (key !== 'listed') assert.deepEqual(s[key], before[i][key], key);
  }
}

test('the exact pair is listed once with both paid editions and all pending work retained verbatim', () => {
  for (const withPending of [false, true]) for (const reverse of [false, true]) {
    const pair = withPending ? failedPending(fixture()) : fixture(), before = structuredClone(pair);
    assert.equal(consolidateTabaksteuerDuplicates(reverse ? [...pair].reverse() : pair, at).status, 'applied');
    assert.equal(pair.filter(s => s.listed !== false).length, 1);
    assert.equal(pair[1].retirement.preserve_full_publication, true);
    assert.deepEqual(pair[0].living_file.merged_story_ids, [duplicateId]);
    assert.deepEqual(pair[1].retirement.canonical_story_ids, [canonicalId]);
    assertPreserved(pair, before);
    const once = structuredClone(pair);
    assert.equal(consolidateTabaksteuerDuplicates(pair, at).status, 'already_applied');
    assert.deepEqual(pair, once);
  }
});

test('unknown editions, changed routing and personal material fail closed without partial writes', () => {
  for (const mutate of [
    p => { p[0].current_version++; }, p => { p[1].content_hash = 'changed'; },
    p => { p[0].sources[0].content_hash = 'changed'; }, p => { p[1].sources[0].url = 'https://example.org/other'; },
    p => { p[0].sources.push(source(3)); }, p => { p[0].sources[1] = p[0].sources[0]; },
    p => { p[0].updated_at = at; }, p => { p[1].published_at = at; }, p => { p[0].slug = 'changed'; },
    p => { p[0].manual_only = true; }, p => { p[1].editorial_approval_hash = 'private'; },
    p => { p[0].published = false; }, p => { p[1].listed = false; },
    p => { p[0].living_file = { merged_story_ids: ['other'] }; },
    p => { p[1].retirement = { reason_code: 'OTHER' }; }, p => { p.push(structuredClone(p[0])); },
  ]) {
    const pair = fixture(); mutate(pair); const before = structuredClone(pair);
    assert.equal(consolidateTabaksteuerDuplicates(pair, at).status, 'held'); assert.deepEqual(pair, before);
  }
  assert.equal(consolidateTabaksteuerDuplicates([], at).status, 'not_present');
  assert.equal(consolidateTabaksteuerDuplicates(fixture().slice(0, 1), at).status, 'not_present');
  assert.equal(consolidateTabaksteuerDuplicates(fixture(), '2026-10-21T04:00:00Z').status, 'held');
  assert.throws(() => consolidateTabaksteuerDuplicates(fixture(), 'invalid'), /INVALID_CONSOLIDATION_TIME/);
});

test('only the verified failed input survives; new evidence, instructions or other gates block routing atomically', () => {
  for (const mutate of [
    p => { p[1].pending_update = structuredClone(p[0].pending_update); },
    p => { p[0].pending_update.reason = 'SOURCE_INTEGRITY_OPEN'; },
    p => { p[0].pending_update.quality_errors.push('ANOTHER_GATE'); },
    p => { p[0].pending_update.quality_retry_count++; }, p => { p[0].pending_update.content_hash = 'changed'; },
    p => { p[0].pending_update.sources[2].summary = 'Changed evidence'; },
    p => { p[0].pending_update.sources[2].provenance.independence_established = true; },
    p => { p[0].pending_update.sources[2].content_hash = 'changed'; },
    p => { p[0].pending_update.sources[2].article_excerpt = 'New full text'; },
    p => { p[0].pending_update.sources.push(source(2)); },
    p => { p[0].pending_update.reassessment = true; }, p => { p[0].pending_update.impact_reassessment = true; },
    p => { p[0].pending_update.fresh = false; }, p => { p[0].pending_update.consolidation = true; },
    p => { p[0].pending_update.owner_instruction = 'Unknown instruction'; },
    p => { p[0].pending_update.detected_at = '2026-10-22T00:00:00Z'; },
    p => { p[0].pending_update.sources[0].ingested_at = '2026-10-22T00:00:00Z'; },
    p => { p[0].pending_update.source_integrity.status = 'held'; },
    p => { p[0].pending_update.source_integrity.warning_codes.push('NEW'); },
    p => { p[0].pending_update.source_integrity.checked_at = '2026-10-22T00:00:00Z'; },
    p => { p[0].ai_retry.evidence_fingerprint = 'c'.repeat(64); },
    p => { p[0].ai_retry.version = 'unknown'; }, p => { p[0].ai_retry_history = []; },
    p => { p[0].ai_retry_history.push(structuredClone(p[0].ai_retry)); },
  ]) {
    const pair = failedPending(fixture()); mutate(pair); const before = structuredClone(pair);
    assert.equal(consolidateTabaksteuerDuplicates(pair, at).status, 'held'); assert.deepEqual(pair, before);
  }
});

test('known source addresses route to the original file, not a merely similar tax event', () => {
  const pair = fixture(); consolidateTabaksteuerDuplicates(pair, at);
  for (const item of pair.flatMap(s => s.sources)) {
    assert.equal(clusterItems([{ ...item, published_at: at }], pair, at)[0].story_id, canonicalId, item.url);
  }
  const other = { url: 'https://example.org/another-law', title: 'Anderes Tabakgesetz in anderem Land',
    summary: 'Ein anderer Vorgang, eine andere institutionelle Entscheidung.', published_at: at };
  assert.notEqual(clusterItems([other], pair, at)[0].story_id, canonicalId);
});

test('retained paid source unions do not buy a new review or silently complete the failed one', () => {
  for (const withPending of [false, true]) {
    const pair = withPending ? failedPending(fixture()) : fixture(); consolidateTabaksteuerDuplicates(pair, at);
    const candidate = { story_id: canonicalId, existing_story: pair[0],
      sources: structuredClone([...pair[0].sources, ...pair[1].sources, ...(pair[0].pending_update?.sources || [])]) };
    const before = structuredClone(pair);
    assert.equal(retainedTabaksteuerPaidInput(candidate, pair, at), true);
    candidate.sources.forEach(s => { s.published_at = at; s.source_published_at = at; s.ingested_at = at; });
    assert.equal(retainedTabaksteuerPaidInput(candidate, pair, at), true); assert.deepEqual(pair, before);
    for (const mutate of [
      c => { c.sources[2].summary = 'New evidence'; }, c => { c.sources[2].content_hash = 'changed'; },
      c => { c.sources[2].provenance.independence_established = true; },
      c => { c.sources[2].article_excerpt = 'New full text'; }, c => { c.sources.push(source(4)); c.sources.at(-1).url = 'https://example.org/new'; },
      c => { c.reassessment = true; }, c => { c.impact_reassessment = true; },
      c => { c.followup_due = true; }, c => { c.deepening_due = true; }, c => { c.consolidation = true; },
    ]) { const changed = structuredClone(candidate); mutate(changed); assert.equal(retainedTabaksteuerPaidInput(changed, pair, at), false); }
    assert.equal(retainedTabaksteuerPaidInput({ ...candidate, sources: pair[0].sources }, pair, at), false);
    assert.equal(retainedTabaksteuerPaidInput(candidate, [pair[0]], at), false);
    assert.equal(retainedTabaksteuerPaidInput(candidate, [...pair, structuredClone(pair[1])], at), false);
    const nested = structuredClone(pair); nested[1].living_file = { merged_story_ids: ['unknown'] };
    assert.equal(retainedTabaksteuerPaidInput({ ...candidate, existing_story: nested[0] }, nested, at), false);
    const unknownPending = structuredClone(pair); unknownPending[0].pending_update = { owner_instruction: 'Unknown work' };
    assert.equal(retainedTabaksteuerPaidInput({ ...candidate, existing_story: unknownPending[0] }, unknownPending, at), false);
  }
});

test('the archived page keeps the complete reader and the canonical page links the later paid edition', () => {
  const sample = readRepositoryJson(new URL('../../data/news/stories.json', import.meta.url)).stories.find(s => s.published && s.listed !== false && s.analysis);
  const pair = fixture().map(s => ({ ...structuredClone(sample), ...s, analysis: structuredClone(sample.analysis), pending_update: undefined, retirement: undefined, living_file: undefined }));
  const body = html => html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
  const original = storyPage(pair[1]); consolidateTabaksteuerDuplicates(pair, at);
  const before = structuredClone(pair[1]), archived = retiredStoryPage(pair[1]);
  assert.equal(body(archived).replace(/<aside\b[^>]*data-merged-publication-notice[\s\S]*?<\/aside>/, ''), body(original));
  assert.match(archived, /name="robots" content="noindex,follow"/);
  assert.ok(archived.includes(`href="../${pair[0].slug}/"`)); assert.deepEqual(pair[1], before);
  assert.ok(renderConsolidations(pair[0], new Set([pair[1].slug])).includes(`href="../${pair[1].slug}/"`));
});

test('the normal serial runner repeats the listing-only repair without clearing a failed review or calling a provider', async () => {
  for (const withPending of [false, true]) {
    let captured, calls = 0; const pair = withPending ? failedPending(fixture()) : fixture();
    const pendingBefore = structuredClone(pair[0].pending_update);
    const options = { dryRun: true, now: at, registry: { schema_version: '1.0', sources: [], policy: {} },
      state: { source_status: {}, seen_items: {}, pending_story_ids: [], relevance_filter_version: '4.0' },
      storyStore: { stories: pair }, usage: { runs: [] },
      newsroom: { source_items: {}, events: {}, event_sources: [], discovery_candidates: [] },
      budgetFx: { rate_date: '2026-10-20', rate_usd_per_eur: 1.16 },
      callAiImpl: async () => { calls++; throw Error('No paid replacement'); },
      fetchArticleImpl: async () => { throw Error('No live network'); }, captureState: x => { captured = x; } };
    const first = await runWirkungsticker(options);
    assert.equal(first.tabaksteuer_duplicate_consolidation.status, 'applied'); assert.equal(first.retired_stories, 1);
    assert.equal(first.public_changed, true);
    assert.deepEqual(captured.storyStore.stories.find(s => s.story_id === canonicalId).pending_update, pendingBefore);
    const second = await runWirkungsticker({ ...options, storyStore: captured.storyStore, state: captured.state });
    assert.equal(second.tabaksteuer_duplicate_consolidation.status, 'already_applied');
    assert.equal(second.retired_stories, 0); assert.equal(calls, 0);
    assert.deepEqual(captured.storyStore.stories.find(s => s.story_id === canonicalId).pending_update, pendingBefore);
  }
});

const ltoId = 'wt-40b9f5e44ed9b503', laterAt = '2026-10-21T17:00:00Z';
function laterFixture(withPending = true) {
  const pair = withPending ? failedPending(fixture()) : fixture();
  consolidateTabaksteuerDuplicates(pair, at);
  const lto = { ...fixture()[1], story_id: ltoId,
    title: 'Synthetic later legal coverage of the same commencement error',
    slug: 'nach-panne-im-bundesfinanzministerium-tabaksteuergesetz-tritt-versehentlich-fruher-in-kr-d9b503',
    published_at: '2026-10-21T16:45:34.517Z', updated_at: '2026-10-21T16:45:34.517Z',
    content_hash: '5bf031a2a8d8b9531ee468d7593f190b042c9b898e9bb5dce31c547991e58b6d',
    sources: [{ ...source(2), source_id: 'synthetic-later',
      url: 'https://www.lto.de/recht/nachrichten/n/tabaksteuer-gesetz-aenderung-versehentlich-bundesfinanzministerium?r=rss',
      content_hash: 'f901d8cf966ce933d76e97dbe1d4c7745d01478bd4a9c845db0b4f1605eea2b7',
      published_at: '2026-10-21T13:43:26Z', ingested_at: '2026-10-21T16:40:12.834Z' }],
  };
  return [...pair, lto];
}

test('the exact later LTO edition extends only the established route and retains all three paid editions', () => {
  for (const withPending of [false, true]) for (const reverse of [false, true]) {
    const stories = laterFixture(withPending), before = structuredClone(stories);
    const result = consolidateTabaksteuerDuplicates(reverse ? [...stories].reverse() : stories, laterAt);
    assert.equal(result.status, 'applied');
    assert.deepEqual(result.changes.map(c => c.story_id), [ltoId]);
    assert.deepEqual(stories[0].living_file.merged_story_ids, [duplicateId, ltoId]);
    assert.deepEqual(stories[0].living_file.consolidations[0], before[0].living_file.consolidations[0]);
    assert.deepEqual(stories[1], before[1]); // Do not reinstall/rewrite the earlier repair.
    assert.deepEqual(stories[2].retirement.canonical_story_ids, [canonicalId]);
    assert.equal(stories[2].retirement.preserve_full_publication, true);
    assert.equal(stories.filter(s => s.listed !== false).length, 1);
    for (const [i, s] of stories.entries()) for (const key of Object.keys(before[i])) {
      if (key !== 'living_file' && key !== 'listed') assert.deepEqual(s[key], before[i][key], key);
    }
    const once = structuredClone(stories);
    assert.equal(consolidateTabaksteuerDuplicates(stories, laterAt).status, 'already_applied');
    assert.deepEqual(stories, once);
  }
});

test('changed later editions, extra work and unknown routes hold atomically', () => {
  for (const mutate of [
    s => { s[2].current_version++; }, s => { s[2].content_hash = 'changed'; },
    s => { s[2].sources[0].content_hash = 'changed'; }, s => { s[2].sources[0].url += '&other=1'; },
    s => { s[2].sources[0].article_excerpt = 'New full text'; },
    s => { s[2].sources[0].evidence_segments = ['New evidence']; },
    s => { s[2].sources[0].ingested_at = '2026-10-22T00:00:00Z'; },
    s => { s[2].sources.push(source(0)); }, s => { s[2].slug = 'changed'; },
    s => { s[2].published_at = laterAt; }, s => { s[2].updated_at = laterAt; },
    s => { s[2].manual_only = true; }, s => { s[2].editorial_approval_hash = 'private'; },
    s => { s[2].published = false; }, s => { s[2].listed = false; },
    s => { s[2].retirement = { reason_code: 'OTHER' }; },
    s => { s[2].living_file = { merged_story_ids: ['unknown'] }; },
    s => { s[2].pending_update = { owner_instruction: 'New work' }; },
    s => { s[0].current_version++; }, s => { s[1].sources[0].content_hash = 'changed'; },
    s => { s[0].pending_update.sources[0].article_excerpt = 'New evidence'; },
    s => { s[0].ai_retry.evidence_fingerprint = 'changed'; },
    s => { s[1].pending_update = { reason: 'New work' }; },
    s => { s[0].living_file.merged_story_ids.push('unknown'); },
    s => { s[0].living_file.consolidations.push({ story_id: 'unknown' }); },
    s => { s.push(structuredClone(s[2])); },
    s => { delete s[0].living_file; delete s[1].retirement; s[1].listed = true; },
  ]) {
    const stories = laterFixture(); mutate(stories); const before = structuredClone(stories);
    assert.equal(consolidateTabaksteuerDuplicates(stories, laterAt).status, 'held');
    assert.deepEqual(stories, before);
  }
  const early = laterFixture(), before = structuredClone(early);
  assert.equal(consolidateTabaksteuerDuplicates(early, at).status, 'held');
  assert.deepEqual(early, before);
});

test('the retained LTO input routes to the canonical file without purchasing another union review', () => {
  const stories = laterFixture(); consolidateTabaksteuerDuplicates(stories, laterAt);
  for (const sources of [stories[2].sources, stories.flatMap(s => s.sources),
    [...stories.flatMap(s => s.sources), ...stories[0].pending_update.sources]]) {
    const candidate = { story_id: canonicalId, existing_story: stories[0], sources: structuredClone(sources) };
    const before = structuredClone(stories);
    assert.equal(retainedTabaksteuerPaidInput(candidate, stories, laterAt), true);
    candidate.sources.forEach(s => { s.published_at = laterAt; s.source_published_at = laterAt; });
    assert.equal(retainedTabaksteuerPaidInput(candidate, stories, laterAt), true);
    for (const mutate of [
      c => { c.sources.at(-1).summary = 'New evidence'; }, c => { c.sources.at(-1).content_hash = 'changed'; },
      c => { c.sources.at(-1).article_excerpt = 'New full text'; }, c => { c.sources.at(-1).evidence_segments = ['New evidence']; },
      c => { c.reassessment = true; }, c => { c.followup_due = true; },
      c => { c.impact_reassessment = true; }, c => { c.deepening_due = true; }, c => { c.consolidation = true; },
    ]) { const changed = structuredClone(candidate); mutate(changed); assert.equal(retainedTabaksteuerPaidInput(changed, stories, laterAt), false); }
    assert.deepEqual(stories, before);
    assert.equal(retainedTabaksteuerPaidInput(candidate, [...stories, structuredClone(stories[2])], laterAt), false);
  }
  assert.equal(clusterItems([{ ...stories[2].sources[0], published_at: laterAt }], stories, laterAt)[0].story_id, canonicalId);
});

test('the later archived reader stays complete and the original file links both editions', () => {
  const sample = readRepositoryJson(new URL('../../data/news/stories.json', import.meta.url)).stories.find(s => s.published && s.listed !== false && s.analysis);
  const stories = laterFixture().map(s => ({ ...structuredClone(sample), ...s, analysis: structuredClone(sample.analysis) }));
  const body = html => html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
  const original = storyPage(stories[2]); consolidateTabaksteuerDuplicates(stories, laterAt);
  const archived = retiredStoryPage(stories[2]);
  assert.equal(body(archived).replace(/<aside\b[^>]*data-merged-publication-notice[\s\S]*?<\/aside>/, ''), body(original));
  assert.match(archived, /name="robots" content="noindex,follow"/);
  assert.ok(archived.includes(`href="../${stories[0].slug}/"`));
  const notice = renderConsolidations(stories[0], new Set(stories.slice(1).map(s => s.slug)));
  for (const s of stories.slice(1)) assert.ok(notice.includes(`href="../${s.slug}/"`));
});

test('the normal serial runner applies the later listing delta once without clearing the failed review or buying a response', async () => {
  let captured, calls = 0; const stories = laterFixture(), before = structuredClone(stories);
  const options = { dryRun: true, now: laterAt, registry: { schema_version: '1.0', sources: [], policy: {} },
    state: { source_status: {}, seen_items: {}, pending_story_ids: [], relevance_filter_version: '4.0' },
    storyStore: { stories }, usage: { runs: [] },
    newsroom: { source_items: {}, events: {}, event_sources: [], discovery_candidates: [] },
    budgetFx: { rate_date: '2026-10-20', rate_usd_per_eur: 1.16 },
    callAiImpl: async () => { calls++; throw Error('No paid replacement'); },
    fetchArticleImpl: async () => { throw Error('No live network'); }, captureState: x => { captured = x; } };
  const first = await runWirkungsticker(options);
  assert.equal(first.tabaksteuer_duplicate_consolidation.status, 'applied');
  assert.equal(first.retired_stories, 1); assert.equal(first.public_changed, true);
  const second = await runWirkungsticker({ ...options, storyStore: captured.storyStore, state: captured.state });
  assert.equal(second.tabaksteuer_duplicate_consolidation.status, 'already_applied');
  assert.equal(second.retired_stories, 0); assert.equal(calls, 0);
  const canonical = captured.storyStore.stories.find(s => s.story_id === canonicalId);
  assert.deepEqual(canonical.pending_update, before[0].pending_update);
  assert.deepEqual(canonical.ai_retry, before[0].ai_retry);
  for (const s of before) {
    const retained = captured.storyStore.stories.find(x => x.story_id === s.story_id);
    for (const key of ['sources', 'analysis', 'versions', 'publication_history', 'content_hash', 'current_version', 'published_at', 'updated_at']) assert.deepEqual(retained[key], s[key]);
  }
});
