import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runWirkungsticker } from '../../scripts/news/run.mjs';
import { callOpenAiDirect } from '../../scripts/news/openai-transport.mjs';

const now = '2026-10-18T06:00:00.000Z';
const source = { source_id: 'test', publisher_id: 'test', name: 'Test', url: 'https://example.org/',
  feed_url: 'https://example.org/rss', enabled: true, source_type: 'official_rss', primary_source: true,
  access: { status: 'public', article: 'metadata_only', cost_usd: 0 }, frequency_class: 'high_frequency' };
const item = { source_id: 'test', publisher_id: 'test', publisher: 'Test',
  url: 'https://example.org/klimagesetz', title: 'Bund beschließt Klimagesetz zur Energieversorgung',
  summary: 'Neue verbindliche Regeln verändern Investitionen in Energie und Infrastruktur.',
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
