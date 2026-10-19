import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runWirkungsticker, paidAttemptsExhausted, pendingRecord } from '../../scripts/news/run.mjs';
import { callOpenAiDirect } from '../../scripts/news/openai-transport.mjs';

const now = '2026-10-18T06:00:00.000Z';
const source = { source_id: 'test', publisher_id: 'test', name: 'Test', url: 'https://example.org/',
  feed_url: 'https://example.org/rss', enabled: true, source_type: 'official_rss', primary_source: true,
  access: { status: 'public', article: 'metadata_only', cost_usd: 0 }, frequency_class: 'high_frequency' };
const item = { source_id: 'test', publisher_id: 'test', publisher: 'Test',
  url: 'https://example.org/klimagesetz', title: 'Bund beschließt Klimagesetz zur Energieversorgung',
  summary: 'Neue verbindliche Regeln verändern Investitionen in Energie und Infrastruktur. Die zuständige Behörde erläutert die geplanten Maßnahmen an öffentlichen Gebäuden und nennt die beteiligten Einrichtungen sowie den vorgesehenen Beginn im kommenden Jahr.',
  primary_source: true, published_at: now };

function fixture(published) {
  const story = { story_id: 'wt-one-paid', slug: 'klimagesetz', title: item.title,
    published, listed: true, first_seen: now, last_updated: now, sources: [{ ...item }],
    ...(published ? { published_at: '2026-10-01T10:00:00.000Z', current_version: 1,
      versions: [{ version: 1, analysis: { summary: 'Unveränderter veröffentlichter Erststand.' } }],
      analysis: { summary: 'Unveränderter veröffentlichter Erststand.' },
      original_potential_assessment: { test_marker: 'preserve-exactly' },
      pending_update: { sources: [{ ...item }], detected_at: now, reason: 'AI_BUDGET_OR_BATCH_LIMIT' } }
      : { fresh: true, versions: [], pending_reason: 'AI_BUDGET_OR_BATCH_LIMIT' }) };
  return { dryRun: true, now, registry: { schema_version: '1.0', sources: [source], policy: {} },
    state: { source_status: {}, seen_items: {}, pending_story_ids: [], relevance_filter_version: '4.0' },
    storyStore: { stories: [story] }, usage: { runs: [] },
    newsroom: { source_items: {}, events: {}, event_sources: [], discovery_candidates: [] },
    budgetFx: { rate_date: '2026-10-16', rate_usd_per_eur: 1.16 },
    fetchFeedImpl: async () => ({ not_modified: true, final_url: source.feed_url }),
    fetchArticleImpl: async () => { throw new Error('No live network in this regression'); },
    aiBatchDelayImpl: async () => {} };
}

test('the scheduled worker enforces the same single-paid-input rule as the local runner', t => {
  const workflow = fs.readFileSync(new URL('../../.github/workflows/wirkungsticker.yml', import.meta.url), 'utf8');
  const configured = workflow.match(/^\s+WOEK_NEWS_MAX_PAID_ATTEMPTS_PER_INPUT:\s*"(\d+)"\s*$/m)?.[1];
  assert.ok(configured, 'the worker must declare its paid-input contract explicitly');
  const previous = process.env.WOEK_NEWS_MAX_PAID_ATTEMPTS_PER_INPUT;
  process.env.WOEK_NEWS_MAX_PAID_ATTEMPTS_PER_INPUT = configured;
  t.after(() => previous === undefined ? delete process.env.WOEK_NEWS_MAX_PAID_ATTEMPTS_PER_INPUT
    : process.env.WOEK_NEWS_MAX_PAID_ATTEMPTS_PER_INPUT = previous);
  const original = fixture(false).storyStore.stories[0];
  const candidate = { ...original, existing_story: original };
  const paid = pendingRecord(candidate, 'QUALITY_GATE_FAILED', now);
  assert.equal(paidAttemptsExhausted({ ...candidate, existing_story: paid }), true,
    'the real workflow environment must block a replacement after the first paid receipt');
  assert.equal(configured, '1');
});

for (const published of [false, true]) for (const reason of ['AI_OUTPUT_INVALID', 'QUALITY_GATE_FAILED']) {
  test(`a paid input stays exhausted after evidence changes away and back (${published ? 'published update' : 'first publication'}, ${reason})`, () => {
    const original = fixture(published).storyStore.stories[0];
    const firstInput = { ...original, existing_story: original, sources: original.pending_update?.sources || original.sources };
    // A legacy record has only its most recent retry, with no history yet.
    const first = pendingRecord(firstInput, reason, now);
    const firstAttempt = structuredClone(first.ai_retry);
    const legacy = structuredClone(first);
    delete legacy.ai_retry_history;
    const secondInput = { ...firstInput, existing_story: legacy,
      sources: firstInput.sources.map(s => ({ ...s, summary: s.summary + ' Neue belegte Entwicklung B.' })) };
    assert.equal(paidAttemptsExhausted(secondInput, 1), false, 'genuinely changed evidence remains eligible');
    const second = pendingRecord(secondInput, reason, '2026-10-18T08:00:00.000Z');
    assert.notEqual(second.ai_retry.fingerprint, firstAttempt.fingerprint);
    // Simulate persistence and an unrelated free capacity hold before returning to A.
    const persisted = JSON.parse(JSON.stringify(pendingRecord({ ...secondInput, existing_story: second },
      'AI_BUDGET_OR_BATCH_LIMIT', '2026-10-18T10:00:00.000Z')));
    assert.equal(paidAttemptsExhausted({ ...firstInput, existing_story: persisted }, 1), true,
      'returning to an older paid input must not authorize a replacement');
    assert.equal(paidAttemptsExhausted({ ...secondInput, existing_story: persisted }, 1), true);
    assert.deepEqual(first.ai_retry, firstAttempt, 'the original receipt is not modified');
    assert.deepEqual(persisted.ai_retry_history.find(a => a.fingerprint === firstAttempt.fingerprint), firstAttempt);
    assert.equal(persisted.ai_retry_history.length, 2, 'free holds do not duplicate paid receipts');
    assert.equal(paidAttemptsExhausted({ ...secondInput, existing_story: persisted,
      sources: secondInput.sources.map(s => ({ ...s, summary: s.summary + ' Neue belegte Entwicklung C.' })) }, 1), false);
    for (const key of ['published', 'published_at', 'current_version', 'versions', 'analysis', 'original_potential_assessment']) {
      assert.deepEqual(persisted[key], original[key], `preserve ${key}`);
    }
  });
}

for (const published of [false, true]) test(`one paid output is held without a second generation (${published ? 'published update' : 'first publication'})`, async t => {
  const previousMode = process.env.WIRKUNGSTICKER_PROCESSING_MODE;
  process.env.WIRKUNGSTICKER_PROCESSING_MODE = 'api';
  t.after(() => previousMode === undefined ? delete process.env.WIRKUNGSTICKER_PROCESSING_MODE
    : process.env.WIRKUNGSTICKER_PROCESSING_MODE = previousMode);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'woek-one-paid-regression-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const input = fixture(published), before = structuredClone(input.storyStore.stories[0]);
  let calls = 0, saved;
  // This intentionally incomplete but completed paid reply must stay incomplete.
  // Missing model fields are a hold, not permission to buy a replacement.
  const analysis = { story_id: before.story_id, publication_recommendation: true,
    summary: 'Synthetischer unvollständiger Entwurf für die lokale Regression.',
    source_summary: 'Synthetische Quellenzusammenfassung, unverändert zu archivieren.' };
  const answer = JSON.stringify({ analyses: [analysis] });
  const callAiImpl = (stories, options) => callOpenAiDirect(stories, { ...options,
    apiKey: 'test-only', model: 'gpt-5.4-mini', rawOutputDir: dir,
    retryDelayImpl: async () => assert.fail('No uncertain retry in this regression'),
    fetchImpl: async () => {
      calls++;
      return Response.json({ model: 'gpt-5.4-mini', status: 'completed',
        usage: { input_tokens: 100, output_tokens: 50 },
        output: [{ type: 'message', role: 'assistant', content: [{ type: 'output_text', text: answer }] }] });
    } });
  const report = await runWirkungsticker({ ...input, callAiImpl, captureState: value => saved = value });
  assert.equal(calls, 1, 'the completed first reply must never trigger a paid repair');
  assert.equal(report.ai_calls, 1); assert.equal(report.ai_request_attempts, 1);
  assert.equal(report.ai_repair_calls, 0);
  assert.equal(report.published_stories, 0); assert.equal(report.updated_stories, 0);
  assert.ok(report.quality_holds.length, 'the unchanged quality gates still hold the incomplete reply');
  const held = saved.storyStore.stories.find(s => s.story_id === before.story_id);
  for (const key of ['published', 'published_at', 'current_version', 'versions', 'analysis', 'original_potential_assessment']) {
    assert.deepEqual(held[key], before[key], `preserve ${key}`);
  }
  const archives = fs.readdirSync(dir);
  assert.equal(archives.length, 1);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir, archives[0]), 'utf8')).answer, answer);
  // A fresh hour does not authorize regeneration of the unchanged paid input.
  const again = await runWirkungsticker({ ...input, ...saved, now: '2026-10-18T08:00:00.000Z',
    callAiImpl, captureState: value => saved = value });
  assert.equal(calls, 1); assert.equal(again.ai_calls, 0);
  assert.equal(fs.readdirSync(dir).length, 1);
});

for (const published of [false, true]) for (const malformed of [false, true]) {
  test(`invalid paid output cannot buy a later replacement (${published ? 'published update' : 'first publication'}, ${malformed ? 'malformed JSON' : 'empty incomplete reply'})`, async t => {
    const previousMode = process.env.WIRKUNGSTICKER_PROCESSING_MODE;
    process.env.WIRKUNGSTICKER_PROCESSING_MODE = 'api';
    t.after(() => previousMode === undefined ? delete process.env.WIRKUNGSTICKER_PROCESSING_MODE
      : process.env.WIRKUNGSTICKER_PROCESSING_MODE = previousMode);
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'woek-invalid-paid-regression-'));
    t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
    const input = fixture(published), before = structuredClone(input.storyStore.stories[0]);
    const answer = malformed ? '{"analyses":[' : null;
    let calls = 0, saved;
    const callAiImpl = (stories, options) => callOpenAiDirect(stories, { ...options,
      apiKey: 'test-only', model: 'gpt-5.4-mini', rawOutputDir: dir,
      retryDelayImpl: async () => assert.fail('No transport retry in this regression'),
      fetchImpl: async () => {
        calls++;
        return Response.json({ model: 'gpt-5.4-mini', status: 'incomplete',
          incomplete_details: { reason: 'max_output_tokens' },
          usage: { input_tokens: 100, output_tokens: 4000 },
          output: malformed ? [{ type: 'message', role: 'assistant',
            content: [{ type: 'output_text', text: answer }] }] : [] });
      } });
    const report = await runWirkungsticker({ ...input, callAiImpl, captureState: value => saved = value });
    assert.equal(calls, 1); assert.equal(report.ai_calls, 1);
    assert.equal(report.ai_output_invalid, 1);
    assert.ok(report.estimated_cost_usd > 0, 'reported paid usage remains accounted for');
    assert.equal(report.published_stories, 0); assert.equal(report.updated_stories, 0);
    const held = saved.storyStore.stories.find(s => s.story_id === before.story_id);
    const sameInput = { ...held, existing_story: held, sources: held.pending_update?.sources || held.sources };
    assert.equal(paidAttemptsExhausted(sameInput, 1), true);
    const changedInput = { ...sameInput, sources: sameInput.sources.map(s => ({ ...s,
      summary: s.summary + ' Eine neue belegte Entwicklung verändert den Eingabestand.' })) };
    assert.equal(paidAttemptsExhausted(changedInput, 1), false, 'new evidence remains distinct from a paid replacement');
    const archive = fs.readFileSync(path.join(dir, fs.readdirSync(dir)[0]), 'utf8');
    assert.equal(JSON.parse(archive).answer, answer);
    assert.equal(JSON.parse(archive).status, 'incomplete');
    for (const next of ['2026-10-18T08:00:00.000Z', '2026-10-18T10:00:00.000Z']) {
      const again = await runWirkungsticker({ ...input, ...saved, now: next,
        callAiImpl, captureState: value => saved = value });
      assert.equal(calls, 1, 'unchanged paid input stays held after the retry time and a fresh hour');
      assert.equal(again.ai_calls, 0);
      const held = saved.storyStore.stories.find(s => s.story_id === before.story_id);
      for (const key of ['published', 'published_at', 'current_version', 'versions', 'analysis', 'original_potential_assessment']) {
        assert.deepEqual(held[key], before[key], `preserve ${key}`);
      }
      assert.equal(fs.readdirSync(dir).length, 1);
      assert.equal(fs.readFileSync(path.join(dir, fs.readdirSync(dir)[0]), 'utf8'), archive);
    }
  });
}
