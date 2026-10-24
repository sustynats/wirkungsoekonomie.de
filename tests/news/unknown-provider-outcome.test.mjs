import test from 'node:test';
import assert from 'node:assert/strict';
import { runWirkungsticker } from '../../scripts/news/run.mjs';
import { queueSnapshot } from '../../scripts/news/run.mjs';
import { mergeLivingFiles } from '../../scripts/news/living-files.mjs';
import { UNKNOWN_PROVIDER_OUTCOME, unresolvedProviderRequest, providerOutcomeUncertain,
  holdProviderRequest, retainKnownProviderRequests } from '../../scripts/news/provider-outcome.mjs';

const now = '2026-10-24T12:00:00.000Z';
const source = { source_id: 'test', publisher_id: 'test', name: 'Test', url: 'https://example.org/',
  feed_url: 'https://example.org/rss', enabled: true, source_type: 'official_rss', primary_source: true,
  access: { status: 'public', article: 'metadata_only', cost_usd: 0 }, frequency_class: 'high_frequency' };
function fixture() {
  const item = { source_id: 'test', publisher_id: 'test', publisher: 'Test', url: 'https://example.org/klimagesetz',
    title: 'Bund beschließt Klimagesetz zur Energieversorgung',
    summary: 'Neue Regeln verändern Investitionen in Energie und Infrastruktur. Die Verwaltung kündigt neue Anforderungen an öffentliche Gebäude und einen Beginn im kommenden Jahr an.',
    primary_source: true, published_at: now };
  const story = { story_id: 'wt-synthetic-uncertain', slug: 'synthetic-uncertain', title: item.title,
    published: true, listed: true, first_seen: now, last_updated: now, published_at: now, current_version: 2,
    versions: [{ version: 2, analysis: { summary: 'Unveränderte synthetische veröffentlichte Fassung.' } }],
    analysis: { summary: 'Unveränderte synthetische veröffentlichte Fassung.' }, sources: [item],
    pending_update: { sources: [item], detected_at: now, reason: 'AI_BUDGET_OR_BATCH_LIMIT' } };
  return { dryRun: true, now, registry: { schema_version: '1.0', sources: [source], policy: {} },
    state: { source_status: {}, seen_items: {}, pending_story_ids: [], relevance_filter_version: '4.0' },
    storyStore: { stories: [story] }, usage: { runs: [] },
    newsroom: { source_items: {}, events: {}, event_sources: [], discovery_candidates: [], decisions: [] },
    budgetFx: { rate_date: '2026-10-24', rate_usd_per_eur: 1.16 },
    fetchFeedImpl: async () => ({ not_modified: true, final_url: source.feed_url }),
    fetchArticleImpl: async () => { throw Error('No live network in tests'); }, aiBatchDelayImpl: async () => {} };
}
function configure(t) {
  for (const [key, value] of Object.entries({ WIRKUNGSTICKER_PROCESSING_MODE: 'api',
    WOEK_NEWS_AI_BATCH_SIZE: '1', WOEK_NEWS_MAX_AI_STORIES_PER_RUN: '2' })) {
    const previous = process.env[key]; process.env[key] = value;
    t.after(() => previous === undefined ? delete process.env[key] : process.env[key] = previous);
  }
}

test('an unknown started provider request survives the next ordinary worker without another call', async t => {
  configure(t);
  const input = fixture(), original = structuredClone(input.storyStore.stories[0]);
  let firstState, secondState, firstCalls = 0, secondCalls = 0;
  const first = await runWirkungsticker({ ...input, captureState: value => firstState = value,
    callAiImpl: async () => { firstCalls++; throw Object.assign(Error('AI_PROVIDER_ERROR:520'), { requestAttempts: 1 }); } });
  assert.equal(firstCalls, 1); assert.equal(first.ai_failed_calls, 1);
  assert.equal(first.published_stories, 0); assert.equal(first.updated_stories, 0);
  const durable = JSON.parse(JSON.stringify(firstState.storyStore));
  const second = await runWirkungsticker({ ...fixture(), now: '2026-10-24T14:01:00.000Z', storyStore: durable,
    captureState: value => secondState = value, callAiImpl: async () => { secondCalls++;
      throw Object.assign(Error('AI_PROVIDER_ERROR:520'), { requestAttempts: 1 }); } });
  assert.equal(secondCalls, 0, 'an elapsed clock/quota window is not proof of an unexecuted request');
  assert.equal(second.ai_calls, 0);
  const saved = secondState.storyStore.stories.find(s => s.story_id === original.story_id);
  for (const key of ['published_at', 'current_version', 'analysis', 'versions', 'sources']) assert.deepEqual(saved[key], original[key]);
  assert.equal(saved.pending_update.reason, 'AI_PROVIDER_OUTCOME_UNKNOWN');
  assert.deepEqual(saved.provider_request_hold, durable.stories[0].provider_request_hold);
  assert.equal(second.queue.technical, 1); assert.equal(second.queue.retryable, 0);
  assert.equal(second.queue.status, 'technical_delay');
});

for (const makeError of [
  () => Object.assign(Error('AI_PROVIDER_ERROR:503'), { requestAttempts: 1 }),
  () => Object.assign(Error('request timed out'), { name: 'AbortError', requestAttempts: 1 }),
  () => Object.assign(new TypeError('network interrupted'), { requestAttempts: 1 }),
]) test('an interrupted/5xx request receives a durable hold without changing public fields', async t => {
  configure(t); const input = fixture(), before = structuredClone(input.storyStore.stories[0]); let state, submittedSources;
  const report = await runWirkungsticker({ ...input, captureState: value => state = value,
    callAiImpl: async stories => { submittedSources = structuredClone(stories[0].sources); throw makeError(); } });
  const saved = state.storyStore.stories[0];
  assert.equal(saved.provider_request_hold.status, 'unknown');
  assert.equal(saved.provider_request_hold.raw_response, 'not_confirmed');
  assert.equal(report.updated_stories, 0); assert.equal(report.published_stories, 0);
  for (const key of Object.keys(before).filter(k => k !== 'pending_update')) assert.deepEqual(saved[key], before[key]);
  assert.equal(saved.pending_update.sources.length, submittedSources.length);
  for (const [i, submitted] of submittedSources.entries()) {
    for (const [key, value] of Object.entries(submitted)) assert.deepEqual(saved.pending_update.sources[i][key], value);
    // The existing pendingRecord projection adds its redundant original-date
    // field and undefined metadata keys; no submitted source field may change.
    assert.equal(saved.pending_update.sources[i].source_published_at, submitted.source_published_at || submitted.published_at);
  }
});

test('explicit no-provider/local refusals remain distinguishable from uncertain paid effects', () => {
  for (const error of [
    { requestAttempts: 0 }, { requestAttempts: 1, providerNotCalled: true },
    { requestAttempts: 1, localRefusal: true },
    { message: 'AI_PROVIDER_ERROR:429', requestAttempts: 1 },
  ]) assert.equal(providerOutcomeUncertain(error, { started: true, costRecorded: false }), false);
  assert.equal(providerOutcomeUncertain({ message: 'AI_PROVIDER_ERROR:429', requestAttempts: 2 }, { started: true, costRecorded: false }), true);
  assert.equal(providerOutcomeUncertain({ requestAttempts: 1 }, { started: false, costRecorded: false }), false);
  assert.equal(providerOutcomeUncertain({ requestAttempts: 1 }, { started: true, costRecorded: true }), false);
  for (const requestAttempts of ['unknown', -1, Infinity]) assert.equal(
    providerOutcomeUncertain({ requestAttempts }, { started: true, costRecorded: false }), true,
    'malformed request accounting is not proof that no provider work started');
});

test('a proved not-called refusal does not create a hold and may resume normally', async t => {
  configure(t); let first, calls = 0;
  await runWirkungsticker({ ...fixture(), captureState: value => first = value,
    callAiImpl: async () => { throw Object.assign(Error('AI_PROVIDER_ERROR:429'), { requestAttempts: 1, providerNotCalled: true }); } });
  assert.equal(first.storyStore.stories[0].provider_request_hold, undefined);
  await runWirkungsticker({ ...fixture(), now: '2026-10-24T14:01:00.000Z', storyStore: first.storyStore,
    callAiImpl: async () => { calls++; throw Object.assign(Error('AI_PROVIDER_ERROR:429'), { requestAttempts: 1, providerNotCalled: true }); } });
  assert.equal(calls, 1);
});

test('new evidence, a changed clock and explicit reassessment cannot resolve an unknown write', async t => {
  configure(t); const input = fixture(), original = input.storyStore.stories[0];
  const hold = { status: 'unknown', at: now, error_code: 'AI_PROVIDER_ERROR:520', request_attempts: 1 };
  const saved = holdProviderRequest(original, hold);
  saved.pending_update.sources = saved.pending_update.sources.map(s => ({ ...s, content_hash: 'genuinely-new-evidence', summary: s.summary + ' A new source detail.' }));
  saved.pending_update.reassessment = true;
  let state, calls = 0;
  await runWirkungsticker({ ...input, now: '2026-10-24T14:01:00.000Z', storyStore: { stories: [saved] },
    captureState: value => state = value, callAiImpl: async () => { calls++; assert.fail('No provider call'); } });
  assert.equal(calls, 0); assert.deepEqual(state.storyStore.stories[0].provider_request_hold, hold);
  assert.deepEqual(state.storyStore.stories[0].pending_update.sources, saved.pending_update.sources);
});

test('the pinned legacy 520 is fenced idempotently, not reconstructed as a completed response', () => {
  const original = { ...fixture().storyStore.stories[0], story_id: 'wt-a2be1b69b19102aa' };
  const before = structuredClone(original), stories = [original];
  assert.equal(retainKnownProviderRequests(stories).length, 1);
  assert.equal(retainKnownProviderRequests(stories).length, 0);
  const saved = stories[0];
  assert.equal(saved.provider_request_hold.request_binding, 'not_reconstructed');
  assert.equal(saved.provider_request_hold.raw_response, 'not_confirmed');
  assert.equal(saved.provider_request_hold.run_id, '40092521984');
  for (const key of Object.keys(before).filter(k => k !== 'pending_update')) assert.deepEqual(saved[key], before[key]);
  assert.deepEqual(saved.pending_update.sources, before.pending_update.sources);
  assert.equal(unresolvedProviderRequest({ story_id: 'toString' }), null);
  for (const value of [false, 'future-format', {}]) assert.notEqual(unresolvedProviderRequest({ provider_request_hold: value }), null);
});

for (const heldSide of ['canonical', 'duplicate', 'retained-alias', 'duplicate-retained-alias']) test(`a ${heldSide} hold cannot be cleared by a stale merge plan`, () => {
  const base = fixture().storyStore.stories[0];
  const canonical = { ...structuredClone(base), story_id: 'c' }, duplicate = { ...structuredClone(base), story_id: 'd' };
  const alias = { ...structuredClone(base), story_id: 'a', listed: false,
    retirement: { reason_code: 'MERGED_INTO_LIVING_FILE', canonical_story_ids: ['c'] } };
  if (heldSide === 'retained-alias') canonical.living_file = { merged_story_ids: ['a'] };
  if (heldSide === 'duplicate-retained-alias') duplicate.living_file = { merged_story_ids: ['a'] };
  (heldSide === 'canonical' ? canonical : heldSide === 'duplicate' ? duplicate : alias).provider_request_hold = { status: 'unknown' };
  const stories = [canonical, duplicate, alias], before = structuredClone(stories);
  assert.deepEqual(mergeLivingFiles(stories, [{ canonical_id: 'c', duplicate_ids: ['d'], reason: 'stale-plan' }], now), []);
  assert.deepEqual(stories, before);
});

test('an unresolved request is visible as a technical reconciliation hold, never retryable or clear', () => {
  const saved = holdProviderRequest(fixture().storyStore.stories[0], { status: 'unknown', at: now });
  const queue = queueSnapshot([saved], '2026-10-24T12:01:00.000Z');
  assert.equal(queue.by_reason[UNKNOWN_PROVIDER_OUTCOME], 1);
  assert.equal(queue.technical, 1); assert.equal(queue.retryable, 0); assert.equal(queue.status, 'technical_holds');
  delete saved.pending_update;
  assert.equal(queueSnapshot([saved], '2026-10-24T12:01:00.000Z').technical, 1,
    'an absent pending label cannot make an unresolved write invisible');
});

test('an untouched neighbour is not fenced after a later explicit refusal in an uncertain request', async t => {
  configure(t); const input = fixture(), neighbour = structuredClone(input.storyStore.stories[0]);
  neighbour.story_id = 'wt-neighbour'; neighbour.title = 'Bund beschließt Bildungsgesetz nach neuer Vergleichsstudie';
  neighbour.slug = 'bildung';
  const item = { ...neighbour.sources[0], url: 'https://example.org/bildung', title: neighbour.title,
    summary: 'Eine Vergleichsstudie nennt Ergebnisse für Mathematik. Neue Regeln für die Ausbildung von Lehrkräften betreffen Schulen und Unterricht.' };
  neighbour.sources = [item]; neighbour.pending_update.sources = [item];
  input.storyStore.stories.push(neighbour);
  let state, calls = 0, affected;
  await runWirkungsticker({ ...input, captureState: value => state = value, callAiImpl: async stories => {
    calls++; affected = stories[0].story_id;
    throw Object.assign(Error('AI_PROVIDER_ERROR:429'), { requestAttempts: 2, providerNotCalled: false });
  } });
  assert.equal(calls, 1);
  const held = state.storyStore.stories.find(s => s.story_id === affected);
  const untouched = state.storyStore.stories.find(s => s.story_id !== affected);
  assert.equal(held.provider_request_hold.status, 'unknown');
  assert.equal(untouched.provider_request_hold, undefined);
  assert.equal(untouched.pending_update.reason, 'AI_HOURLY_CALL_LIMIT');
});

test('one unresolved write does not consume a paid slot or stop another ordinary candidate', async t => {
  configure(t); const input = fixture(), first = holdProviderRequest(input.storyStore.stories[0], { status: 'unknown', at: now });
  const neighbour = structuredClone(input.storyStore.stories[0]);
  neighbour.story_id = 'wt-school-neighbour'; neighbour.title = 'Bund beschließt Bildungsgesetz nach neuer Vergleichsstudie';
  neighbour.slug = 'bildung';
  const item = { ...neighbour.sources[0], url: 'https://example.org/bildung', title: neighbour.title,
    summary: 'Eine Vergleichsstudie nennt Ergebnisse für Mathematik. Neue Regeln für die Ausbildung von Lehrkräften betreffen Schulen und Unterricht.' };
  neighbour.sources = [item]; neighbour.pending_update.sources = [item];
  input.storyStore.stories = [first, neighbour]; let calls = 0, state;
  await runWirkungsticker({ ...input, captureState: value => state = value, callAiImpl: async stories => {
    calls++; assert.equal(stories[0].story_id, neighbour.story_id);
    throw Object.assign(Error('AI_PROVIDER_ERROR:429'), { requestAttempts: 1, providerNotCalled: true });
  } });
  assert.equal(calls, 1);
  assert.deepEqual(state.storyStore.stories.find(s => s.story_id === first.story_id), first);
});
