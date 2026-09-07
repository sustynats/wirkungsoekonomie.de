import test from 'node:test';
import assert from 'node:assert/strict';
import { backgroundBatchEligibility, batchStoryFingerprint, batchJobKey, createNewsBatchClient } from '../../scripts/news/batch.mjs';
import { sha256 } from '../../scripts/news/lib.mjs';

const now = '2026-09-07T12:00:00Z';
const story = { story_id: 'wt-test', published: true, listed: true, published_at: '2026-09-05T10:00:00Z', updated_at: '2026-09-05T10:00:00Z', analysis: { title: 'Existing verified analysis' }, sources: [], claims: [], current_version: 1 };
const args = { kind: 'media_backfill', methodVersion: '1.0', prompt: 'Use this verified story only. UNTRUSTED_SOURCE_DATA_BEGIN {} UNTRUSTED_SOURCE_DATA_END' };
function fixture() {
  const state = {}, usage = { runs: [] }, remotes = new Map(), methods = [];
  let at = now, mode = 'normal', allow = true;
  const fetchImpl = async (url, options) => {
    methods.push(options.method);
    assert.equal(options.headers.Authorization, 'Bearer test-only');
    if (options.method === 'POST') {
      if (mode === 'refusal') return Response.json({ ok: false, code: 'BATCH_CAPACITY' }, { status: 429 });
      if (mode === 'lost-before') { mode = 'normal'; throw Error('offline'); }
      const input = JSON.parse(options.body); assert.equal(batchJobKey(input), input.key);
      remotes.set(input.key, { ...input, question: undefined, prompt_hash: sha256(input.question), created_at: at, processing_mode: 'batch', status: 'submitted', billing_status: 'reserved', estimated_cost_usd: .125, model: 'gpt-5.4-mini' });
      if (mode === 'lost-after') { mode = 'normal'; throw Error('response lost'); }
      return Response.json({ ok: true, job: remotes.get(input.key) });
    }
    if (url.endsWith('/batches')) return Response.json({ ok: true, jobs: [...remotes.values()].map(({ answer, ...metadata }) => metadata) });
    const job = remotes.get(url.split('/').at(-1));
    return Response.json(job ? { ok: true, job } : { ok: false, code: 'BATCH_NOT_FOUND' }, { status: job ? 200 : 404 });
  };
  const client = () => createNewsBatchClient({ state, usage, now: at, authToken: 'test-only', fetchImpl, save: () => {}, canSubmit: () => allow });
  return { state, usage, remotes, methods, client,
    advance: () => { at = '2026-09-07T12:20:00Z'; }, mode: value => { mode = value; }, disallow: () => { allow = false; },
    complete: () => {
      const job = [...remotes.values()][0];
      Object.assign(job, { status: 'completed', billing_status: 'settled', usage: { input_tokens: 101, output_tokens: 77, cached_input_tokens: 10 }, estimated_cost_usd: .000208, answer: JSON.stringify({ analyses: [{ story_id: story.story_id }] }) });
      return job;
    },
  };
}
test('Batch is restricted to non-urgent published background work, not news dispatch', () => {
  const options = { kind: args.kind, now };
  assert.equal(backgroundBatchEligibility(story, options).eligible, true);
  for (const changes of [{ published: false }, { listed: false }, { urgent: true }, { breaking: true }, { analysis_variant: 'systemic' }, { updated_at: now }, { next_event_at: '2026-09-08T18:00:00Z' }, { sources: [{ published_at: now }] }, { updated_at: 'invalid' }]) assert.equal(backgroundBatchEligibility({ ...story, ...changes }, options).eligible, false, JSON.stringify(changes));
  assert.equal(backgroundBatchEligibility(story, { ...options, kind: 'news' }).eligible, false);
  assert.equal(backgroundBatchEligibility(story, { ...options, state: { pending_story_ids: [story.story_id] } }).eligible, false);
});
test('fact, analysis, source and method changes invalidate a late result', () => {
  const fp = batchStoryFingerprint(story, args.kind, args.methodVersion);
  for (const changed of [{ ...story, current_version: 2 }, { ...story, analysis: { revised: true } }, { ...story, claims: ['new fact'] }, { ...story, sources: ['new source'] }]) assert.notEqual(batchStoryFingerprint(changed, args.kind, args.methodVersion), fp);
  assert.notEqual(batchStoryFingerprint(story, args.kind, '2.0'), fp);
});
test('pending is normal; collection books exact half-price once and applies once', async () => {
  const f = fixture();
  await assert.rejects(f.client().call(story, args), { batchDeferred: true, message: 'AI_BATCH_PENDING' });
  assert.equal(f.usage.runs.length, 1); assert.equal(f.usage.runs[0].ai.estimated_cost_usd, .125);
  f.complete(); f.advance(); f.disallow(); // No new budget needed for paid retrieval.
  const client = f.client(); await client.reconcile();
  const result = await client.call(story, args);
  assert.equal(result.processing_mode, 'batch'); assert.equal(result.request_attempts, 0);
  assert.equal(f.usage.runs[0].ai.estimated_cost_usd, .000208);
  client.applied(result, { updated_stories: 1 }); client.applied(result, { updated_stories: 1 });
  assert.equal(f.usage.runs[0].counts.updated_stories, 1);
  await assert.rejects(f.client().call(story, args), { message: 'BATCH_ALREADY_APPLIED' });
  assert.equal(f.methods.filter(x => x === 'POST').length, 1);
});
test('changed source snapshot never receives the old paid answer', async () => {
  const f = fixture(); await assert.rejects(f.client().call(story, args)); f.complete(); f.advance(); f.disallow();
  await assert.rejects(f.client().call({ ...story, analysis: { corrected: true } }, args), { message: 'BATCH_BUDGET_DEFERRED' });
  assert.ok(!Object.values(f.state.batch_jobs).some(job => job.applied_at));
});
for (const mode of ['lost-before', 'lost-after']) test(`lost submission recovery: ${mode}`, async () => {
  const f = fixture(); f.mode(mode); await assert.rejects(f.client().call(story, args));
  f.advance(); await assert.rejects(f.client().call(story, args));
  assert.equal(f.remotes.size, 1); assert.equal(f.usage.runs.length, 1);
  f.complete(); assert.equal((await f.client().call(story, args)).analyses[0].story_id, story.story_id);
});
test('local capacity refusals are free and do not permanently exhaust quality attempts', async () => {
  const f = fixture(); f.mode('refusal'); await assert.rejects(f.client().call(story, args));
  assert.equal(f.usage.runs[0].ai.estimated_cost_usd, 0); assert.equal(f.usage.runs[0].ai.requests, 0);
  f.mode('normal'); f.advance(); await assert.rejects(f.client().call(story, args), { message: 'AI_BATCH_PENDING' });
  assert.equal(f.remotes.size, 1); assert.equal(f.usage.runs.length, 1); assert.equal(f.usage.runs[0].ai.estimated_cost_usd, .125);
});
test('missing authentication never creates a phantom paid reservation', async () => {
  const state = {}, usage = { runs: [] };
  await assert.rejects(createNewsBatchClient({ state, usage, now, save: () => {}, fetchImpl: () => assert.fail() }).call(story, args), { message: 'BATCH_AUTH_MISSING' });
  assert.equal(usage.runs.length, 0);
});
test('a failed runner can recover its paid jobs and cost from the private Oracle journal', async () => {
  const f = fixture(); await assert.rejects(f.client().call(story, args)); f.complete();
  f.state.batch_jobs = {}; f.usage.runs = []; f.advance();
  const recovered = f.client(); await recovered.reconcile();
  assert.equal(f.usage.runs[0].ai.estimated_cost_usd, .000208);
  assert.equal((await recovered.call(story, args)).analyses[0].story_id, story.story_id);
  assert.equal(f.methods.filter(x => x === 'POST').length, 1);
});
test('foreign result identity and false tariff never reach model decoding', async () => {
  const f = fixture(); await assert.rejects(f.client().call(story, args)); const remote = f.complete();
  remote.story_id = 'foreign'; await assert.rejects(f.client().call(story, args), /IDENTITY_MISMATCH/);
  remote.story_id = story.story_id; remote.estimated_cost_usd = 0; await assert.rejects(f.client().call(story, args), /BILLING_MISMATCH/);
  assert.equal(f.usage.runs[0].ai.estimated_cost_usd, .125);
});
