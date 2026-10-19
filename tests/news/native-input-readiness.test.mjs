import test from 'node:test';
import assert from 'node:assert/strict';
import { newsBatchInputReadiness, newsInputReadiness } from '../../scripts/news/news-input-readiness.mjs';
import { buildAnalysisPrompt } from '../../scripts/news/lib.mjs';
import { serializeEvidencePackets } from '../../scripts/news/evidence-packets.mjs';
import { callOpenAiDirect } from '../../scripts/news/openai-transport.mjs';
import { failedRequestCost } from '../../scripts/news/budget.mjs';
import { runWirkungsticker } from '../../scripts/news/run.mjs';
import { preparedNewsStory } from './fixtures/api-news-input.mjs';

const now = '2026-09-04T12:00:00.000Z';
const excerpt = preparedNewsStory().sources[0].evidence_segments[0].excerpt;
const source = { source_id: 'test', publisher_id: 'test', name: 'Test', url: 'https://example.org/',
  feed_url: 'https://example.org/rss', enabled: true, source_type: 'official_rss', primary_source: true,
  access: { status: 'public', article: 'metadata_only', cost_usd: 0 }, frequency_class: 'high_frequency' };
const story = (id = 'wt-test', summary = '') => ({ story_id: id, slug: id,
  title: 'Bund beschließt Klimagesetz zur Energieversorgung', first_seen: now, last_updated: now,
  sources: [{ ...source, title: 'Bund beschließt Klimagesetz zur Energieversorgung',
    publisher: 'Test', published_at: now, url: `https://example.org/${id}`, summary }],
  claims: [{ claim_id: 'c1', source_id: 'test', claim: 'Bund beschließt Klimagesetz zur Energieversorgung' }] });
const payload = { model: 'gpt-5.4-mini', output: [{ type: 'message', role: 'assistant', status: 'completed',
  content: [{ type: 'output_text', text: '{"analyses":[]}' }] }], usage: { input_tokens: 100, output_tokens: 10 } };
const fakeResponse = () => ({ ok: true, status: 200, json: async () => payload });

test('native headline-only input refuses before provider, billing or retry receipt', async () => {
  let calls = 0;
  const candidate = story();
  const before = structuredClone(candidate);
  await assert.rejects(callOpenAiDirect([candidate], { apiKey: 'test-only', repair: false,
    fetchImpl: async () => { calls++; return fakeResponse(); } }), error => {
    assert.equal(error.message, 'NEWS_INPUT_NEEDS_PREPARATION');
    assert.equal(error.requestAttempts, 0);
    assert.equal(error.providerNotCalled, true);
    assert.equal(error.localRefusal, true);
    assert.equal(error.newsPreparation.stories[0].story_id, candidate.story_id);
    assert.ok(error.newsPreparation.stories[0].issues.some(issue => issue.code === 'NEWS_INPUT_EVIDENCE_TOO_THIN'));
    assert.equal(failedRequestCost(error).estimated_cost_usd, 0);
    assert.equal(error.promptChars, undefined, 'nothing was sent');
    assert.equal(error.billingEvidence, undefined);
    return true;
  });
  assert.equal(calls, 0);
  assert.deepEqual(candidate, before);
});

for (const kind of ['RSS', 'article']) test(`native input admits one attributed ${kind} excerpt without requiring another source`, async () => {
  const candidate = story();
  candidate.sources[0][kind === 'RSS' ? 'summary' : 'article_excerpt'] = excerpt;
  let calls = 0;
  await callOpenAiDirect([candidate], { apiKey: 'test-only', repair: false, fetchImpl: async (_url, init) => {
    calls++;
    const request = JSON.parse(init.body);
    assert.equal(newsBatchInputReadiness(request.input).status, 'READY_FOR_DRAFT');
    assert.equal(request.text.format.type, 'json_schema');
    return fakeResponse();
  } });
  assert.equal(calls, 1);
});

test('batch gate checks every bounded packet and leaves the bridge single-event contract strict', async () => {
  const packets = [preparedNewsStory(), { ...preparedNewsStory(), story_id: 'second' }];
  packets[1].sources[0].evidence_segments[0].excerpt = packets[1].sources[0].title;
  const packed = serializeEvidencePackets(packets, true);
  const prompt = `Contract\nUNTRUSTED_SOURCE_DATA_BEGIN\n${packed}\nUNTRUSTED_SOURCE_DATA_END`;
  const result = newsBatchInputReadiness(prompt);
  assert.deepEqual(result.stories.map(item => [item.story_id, item.status]), [
    ['test-news', 'READY_FOR_DRAFT'], ['second', 'NEEDS_PREPARATION']]);
  assert.equal(newsInputReadiness(prompt).status, 'NEEDS_PREPARATION');
  // Changing the bounded packet must win over a richer unbounded source.
  assert.equal(newsBatchInputReadiness(buildAnalysisPrompt([story('rich', excerpt)])).status, 'READY_FOR_DRAFT');
  assert.equal(newsBatchInputReadiness(prompt).status, 'NEEDS_PREPARATION');
  for (const malformed of ['metadata', prompt.replace('UNTRUSTED_SOURCE_DATA_END', 'broken'),
    prompt.replace('"second"', '"test-news"')]) {
    assert.equal(newsBatchInputReadiness(malformed).status, 'NEEDS_PREPARATION');
  }
  let calls = 0;
  await assert.rejects(callOpenAiDirect([story('complete', excerpt), story('thin')], {
    apiKey: 'test-only', fetchImpl: async () => { calls++; return fakeResponse(); },
  }), error => error.message === 'NEWS_INPUT_NEEDS_PREPARATION' && error.requestAttempts === 0);
  assert.equal(calls, 0);
});

test('custom private editorial contract is not interpreted as a regular news packet', async () => {
  let calls = 0;
  await callOpenAiDirect([story()], { apiKey: 'test-only', prompt: 'Synthetic private editorial contract.', repair: false,
    fetchImpl: async (_url, init) => {
      calls++;
      assert.equal(JSON.parse(init.body).input, 'Synthetic private editorial contract.');
      return fakeResponse();
    } });
  assert.equal(calls, 1);
});

test('normal native worker records source preparation with zero cost and preserves a complete batch neighbour', async () => {
  const thin = { ...story('thin'), published: true, listed: true, current_version: 2, published_at: now,
    analysis: { summary: 'Unveränderter bezahlter Alttext.' }, versions: [{ version: 2, analysis: { summary: 'Unveränderter bezahlter Alttext.' } }] };
  thin.pending_update = { reason: 'AI_BUDGET_OR_BATCH_LIMIT', detected_at: now, sources: thin.sources };
  const complete = { ...story('complete', excerpt), published: true, listed: true, current_version: 1,
    published_at: now, analysis: { summary: 'Anderer bezahlter Alttext.' }, versions: [{ version: 1 }] };
  complete.title = 'Bund beschließt Gesetz zur Trinkwasserversorgung und öffentlichen Infrastruktur';
  complete.sources[0].title = complete.title;
  complete.pending_update = { reason: 'AI_BUDGET_OR_BATCH_LIMIT', detected_at: now, sources: complete.sources };
  const before = structuredClone([thin, complete]);
  let captured, calls = 0;
  const report = await runWirkungsticker({ dryRun: true, now,
    registry: { schema_version: '1.0', sources: [source], policy: {} },
    state: { source_status: {}, seen_items: {}, pending_story_ids: [], relevance_filter_version: '4.0' },
    storyStore: { stories: [thin, complete] }, usage: { runs: [] },
    newsroom: { source_items: {}, events: {}, event_sources: [], decisions: [], discovery_candidates: [] },
    budgetFx: { rate_date: '2026-09-04', rate_usd_per_eur: 1.16 },
    fetchFeedImpl: async () => ({ not_modified: true, final_url: source.feed_url }),
    fetchArticleImpl: async () => assert.fail('Metadata-only source must not fetch an article'),
    aiBatchDelayImpl: async () => {},
    callAiImpl: (candidates, options) => callOpenAiDirect(candidates, { ...options, apiKey: 'test-only',
      fetchImpl: async () => { calls++; return fakeResponse(); } }),
    captureState: value => captured = value });
  assert.equal(report.ai_batch_size, 2);
  assert.equal(report.ai_stories, 2, 'both events reached the same bounded request');
  assert.ok(report.news_preparation_holds, JSON.stringify({ holds: report.quality_holds, errors: report.ai_provider_errors, calls: report.ai_calls, selected: report.ai_batches_planned }));
  assert.equal(report.news_preparation_holds.length, 1);
  assert.equal(report.news_preparation_holds[0].story_id, 'thin');
  assert.equal(report.ai_calls, 0);
  assert.equal(report.ai_failed_calls, 0);
  assert.equal(report.ai_provider_failures, 0);
  assert.equal(report.prompt_chars_sent, 0);
  assert.equal(report.estimated_cost_usd, 0);
  assert.equal(calls, 0);
  const saved = captured.storyStore.stories;
  assert.equal(saved.find(item => item.story_id === 'thin').pending_update.reason, 'NEWS_INPUT_NEEDS_PREPARATION');
  assert.equal(saved.find(item => item.story_id === 'complete').pending_update.reason, 'AI_BUDGET_OR_BATCH_LIMIT', JSON.stringify({ stories: report.ai_stories, holds: report.quality_holds }));
  for (const original of before) {
    const current = saved.find(item => item.story_id === original.story_id);
    for (const key of ['analysis', 'versions', 'current_version', 'published_at', 'sources', 'title']) assert.deepEqual(current[key], original[key], key);
    assert.equal(current.ai_retry, undefined, 'a free refusal is not a paid attempt');
  }
  assert.ok(captured.newsroom.decisions.some(item => item.story_id === 'thin' && item.decision === 'needs_source_preparation'));
  let selectedIds;
  const followup = await runWirkungsticker({ dryRun: true, ...captured, now: '2026-09-04T12:16:00.000Z',
    registry: { schema_version: '1.0', sources: [source], policy: {} },
    budgetFx: { rate_date: '2026-09-04', rate_usd_per_eur: 1.16 },
    fetchFeedImpl: async () => ({ not_modified: true, final_url: source.feed_url }),
    fetchArticleImpl: async () => assert.fail('No live fetch in tests'), aiBatchDelayImpl: async () => {},
    callAiImpl: (candidates, options) => {
      selectedIds = candidates.map(item => item.story_id);
      return callOpenAiDirect(candidates, { ...options, apiKey: 'test-only', fetchImpl: async () => { calls++; return fakeResponse(); } });
    } });
  assert.deepEqual(selectedIds, ['complete'], 'the complete neighbour resumes normally; thin input needs changed source evidence');
  assert.equal(followup.ai_calls, 1);
  assert.equal(calls, 1);
});
