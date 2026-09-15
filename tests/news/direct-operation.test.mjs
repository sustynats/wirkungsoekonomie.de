import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOpenAiRequest, finalOutputText, decodeUsage, normalizeAnalysisOutput, callOpenAiDirect, newsModel, SINGLE_CALL_INSTRUCTIONS } from '../../scripts/news/openai-transport.mjs';
import { releaseDeterministicImpact, deterministicGateIssues } from '../../scripts/news/impact-gate.mjs';
import { paidAttemptsExhausted } from '../../scripts/news/run.mjs';
import { validateAnalysis, sha256 } from '../../scripts/news/lib.mjs';
import { publicImpactAssessment } from '../../scripts/news/impact-release.mjs';
import { syntheticPotentialAssessment } from './fixtures/impact21.mjs';
import { retireBacklog } from '../../scripts/news/retire-backlog.mjs';
import { queueReassessment, needsPotentialRepair } from '../../scripts/news/queue-reassessment.mjs';
import { costFromUsage, modelRates } from '../../scripts/news/budget.mjs';

const sources = [{ source_id: 'official', url: 'https://example.org/meldung', title: 'Amtliche Meldung', summary: 'Eine Behörde kündigt ein Programm an.', publisher: 'Behörde', primary_source: true, published_at: '2026-09-15T08:00:00.000Z', content_hash: 'h1' }];
const stories = [{ story_id: 'wt-1', slug: 'wt-1', title: 'Eine Behörde kündigt ein Programm an', sources, claims: [{ claim_id: 'c1', claim: 'Programm angekündigt', source_id: 'official' }] }];
const responsePayload = (text, extra = {}) => ({ id: 'resp_1', model: 'gpt-5.4-mini-2026-03-17', status: 'completed',
  output: [{ type: 'reasoning', summary: [] }, { type: 'message', role: 'assistant', status: 'completed', content: [{ type: 'output_text', text }] }],
  usage: { input_tokens: 1200, output_tokens: 800, input_tokens_details: { cached_tokens: 200 } }, ...extra });

test('request carries single-call instructions, JSON mode and no storage', () => {
  const request = buildOpenAiRequest('PROMPT', { model: 'gpt-5.4-mini' });
  assert.equal(request.model, 'gpt-5.4-mini'); assert.equal(request.store, false);
  assert.equal(request.text.format.type, 'json_object'); assert.equal(request.input, 'PROMPT');
  assert.equal(request.instructions, SINGLE_CALL_INSTRUCTIONS);
  assert.ok(SINGLE_CALL_INSTRUCTIONS.includes('genau einen Durchgang'));
  assert.ok(SINGLE_CALL_INSTRUCTIONS.includes('Mensch, Planet und Demokratie'));
});

test('model selection accepts only priced models', () => {
  assert.equal(newsModel({}), 'gpt-5.4-mini');
  assert.equal(newsModel({ WOEK_NEWS_MODEL: 'gpt-5.6-luna' }), 'gpt-5.6-luna');
  assert.throws(() => newsModel({ WOEK_NEWS_MODEL: 'gpt-3.5' }), /NEWS_MODEL_UNSUPPORTED/);
  assert.equal(modelRates('gpt-5.6-luna').outputUsdPerMillion, 1.2);
  assert.equal(costFromUsage({ model: 'gpt-5.6-luna', reported_usage: { input_tokens: 1000, output_tokens: 1000 } }, {}).token_source, 'provider_reported_usage');
});

test('only the final completed assistant message is used', () => {
  assert.equal(finalOutputText(responsePayload('{"analyses":[]}')), '{"analyses":[]}');
  assert.equal(finalOutputText({ output: [{ type: 'message', role: 'assistant', status: 'completed', content: [{ type: 'refusal', refusal: 'no' }] }] }), null);
  assert.equal(finalOutputText({ output: [{ type: 'message', role: 'assistant', status: 'in_progress', content: [{ type: 'output_text', text: '{' }] }] }), null);
  assert.deepEqual(decodeUsage(responsePayload('x')), { input_tokens: 1200, output_tokens: 800, cached_input_tokens: 200 });
  assert.equal(decodeUsage({ usage: { input_tokens: 'x' } }), null);
});

test('magnitudes are derived from the model factors and ranges snap to the point value', () => {
  const assessment = syntheticPotentialAssessment();
  const path = assessment.dimensions.human.primary_paths[0];
  for (const factor of Object.values(path.magnitude_factors)) factor.value = 5;
  path.magnitude = 1; path.magnitude_range = { lower: 0, upper: 1, rationale: 'Spanne aus dem synthetischen Test, wird angepasst.' };
  assessment.dimensions.human.magnitude = 1;
  const analysis = normalizeAnalysisOutput({ impact_assessment: assessment });
  assert.equal(analysis.impact_assessment.dimensions.human.primary_paths[0].magnitude, 5);
  assert.equal(analysis.impact_assessment.dimensions.human.magnitude, 5);
  assert.equal(analysis.impact_assessment.dimensions.human.primary_paths[0].magnitude_range.upper, 5);
});

test('one successful provider call returns analyses with usage and model', async () => {
  const calls = [];
  const result = await callOpenAiDirect(stories, { apiKey: 'test', model: 'gpt-5.4-mini', fetchImpl: async (url, options) => {
    calls.push(JSON.parse(options.body));
    return { ok: true, status: 200, json: async () => responsePayload(JSON.stringify({ analyses: [{ story_id: 'wt-1', publication_recommendation: false, rejection: { code: 'not_material', reason: 'Nur eine Routinemitteilung ohne materielle Veränderung.' } }] })) };
  } });
  assert.equal(calls.length, 1); assert.equal(calls[0].model, 'gpt-5.4-mini');
  assert.ok(calls[0].input.includes('UNTRUSTED_SOURCE_DATA_BEGIN'));
  assert.equal(result.analyses.length, 1); assert.equal(result.model, 'gpt-5.4-mini-2026-03-17');
  assert.equal(result.request_attempts, 1); assert.equal(result.reported_usage.cached_input_tokens, 200);
  assert.equal(result.mode, 'direct-single-call-1');
});

test('transport failures retry at most once, auth failures never, and no third call ever happens', async () => {
  let attempts = 0;
  const result = await callOpenAiDirect(stories, { apiKey: 'test', retryDelayImpl: async () => {}, fetchImpl: async () => {
    attempts += 1;
    if (attempts === 1) return { ok: false, status: 503, json: async () => ({}) };
    return { ok: true, status: 200, json: async () => responsePayload('{"analyses":[]}') };
  } });
  assert.equal(attempts, 2); assert.equal(result.request_attempts, 2);
  attempts = 0;
  await assert.rejects(callOpenAiDirect(stories, { apiKey: 'test', retryDelayImpl: async () => {}, fetchImpl: async () => { attempts += 1; return { ok: false, status: 503, json: async () => ({}) }; } }), /AI_PROVIDER_ERROR:503/);
  assert.equal(attempts, 2);
  attempts = 0;
  await assert.rejects(callOpenAiDirect(stories, { apiKey: 'bad', fetchImpl: async () => { attempts += 1; return { ok: false, status: 401, json: async () => ({}) }; } }), /AI_PROVIDER_AUTH_FAILED/);
  assert.equal(attempts, 1);
  await assert.rejects(callOpenAiDirect(stories, { apiKey: '' , fetchImpl: async () => assert.fail('must not call') }), error => error.message === 'OPENAI_API_KEY_MISSING' && error.requestAttempts === 0);
});

test('an incomplete or refused answer is a paid output failure with billing evidence', async () => {
  await assert.rejects(callOpenAiDirect(stories, { apiKey: 'test', fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({ ...responsePayload('{"analyses":['), status: 'incomplete', incomplete_details: { reason: 'max_output_tokens' }, output: [{ type: 'message', role: 'assistant', status: 'incomplete', content: [{ type: 'output_text', text: '{"analyses":[' }] }] }) }) }),
    error => error.message === 'AI_PROVIDER_OUTPUT_INVALID' && error.requestAttempts === 1 && error.billingEvidence.reported_usage.output_tokens === 800 && error.incompleteReason === 'max_output_tokens');
});

function releasableRecord() {
  const assessment = syntheticPotentialAssessment();
  const analysis = { story_id: 'wt-1', summary: 'Zwei Sätze. Genau zwei.', impact_assessment: structuredClone(assessment) };
  const record = { story_id: 'wt-1', title: 'Test', published: true, sources: [{ source_id: 'official', url: 'https://example.org/a', title: 'Quelle', summary: 'Quelle' }],
    content_hash: 'abc', analysis, impact_assessment: structuredClone(assessment), versions: [{ version: 1, analysis: structuredClone(analysis) }] };
  return record;
}

test('deterministic gate releases a complete modelled profile publicly and refuses blank dimensions', () => {
  const record = releasableRecord();
  assert.deepEqual(deterministicGateIssues(record), []);
  const release = releaseDeterministicImpact(record, { now: '2026-09-15T12:00:00.000Z' });
  assert.equal(release.released, true);
  assert.equal(record.impact_assessment.publication_status, 'ready');
  assert.equal(record.impact_semantic_review.status, 'ready'); assert.equal(record.impact_semantic_review.mode, 'deterministic-gate-1');
  assert.ok(publicImpactAssessment(record), 'profile must be public after the gate');
  assert.equal(record.current_potential_assessment.origin, 'current_assessment');
  const blank = releasableRecord();
  blank.impact_assessment.dimensions.planet = { path_status: 'insufficient_basis', direction: 'open', magnitude: null, evidence: 'not_assessable', data_status: 'missing', temporal_status: 'ex_ante', likelihood: 'unknown', dominance: 'none', primary_paths: [], secondary_paths: [], rationale: 'Keine ausreichende Grundlage im synthetischen Test.', research_pass: 'second_pass', research_result: 'Zweiter Pass ohne belastbares Ergebnis.', reviewed_source_ids: ['official'] };
  blank.analysis.impact_assessment = structuredClone(blank.impact_assessment);
  const refused = releaseDeterministicImpact(blank, { now: '2026-09-15T12:00:00.000Z' });
  assert.equal(refused.released, false);
  assert.ok(refused.issues.includes('IMPACT_FRESH_MODELLED_DIMENSION_REQUIRED:planet'));
  assert.equal(publicImpactAssessment(blank), null);
});

test('a fresh publication requires three modelled dimensions in validateAnalysis', () => {
  const analysis = { story_id: 'wt-1', impact_assessment: syntheticPotentialAssessment() };
  analysis.impact_assessment.dimensions.democracy.magnitude = null; analysis.impact_assessment.dimensions.democracy.path_status = 'insufficient_basis';
  const story = { story_id: 'wt-1', sources: [{ source_id: 'official', url: 'https://example.org/a', title: 'Q', summary: 'Q' }], claims: [{ claim_id: 'c', claim: 'x', source_id: 'official' }] };
  assert.ok(validateAnalysis(analysis, story, { requireImpactAssessment: true }).includes('IMPACT_FRESH_MODELLED_DIMENSION_REQUIRED:democracy'));
  assert.ok(!validateAnalysis(analysis, story, { persisted: true }).includes('IMPACT_FRESH_MODELLED_DIMENSION_REQUIRED:democracy'));
});

test('a story with one exhausted paid attempt is not paid again for the same input', async () => {
  const { sourceReviewFingerprint } = await import('../../scripts/news/evidence-packets.mjs');
  const candidate = { title: 'T', sources, existing_story: { current_version: 0, ai_retry: { version: '2026-09-06-throughput-3', retry_count: 1, fingerprint: sha256(JSON.stringify({ title: 'T', published_version: 0, sources: sources.map(sourceReviewFingerprint).sort() })) } } };
  assert.equal(paidAttemptsExhausted(candidate, 1), true);
  assert.equal(paidAttemptsExhausted(candidate, 2), false);
  assert.equal(paidAttemptsExhausted({ ...candidate, sources: [{ ...sources[0], content_hash: 'changed' }] }, 1), false);
  assert.equal(paidAttemptsExhausted({ title: 'T', sources }, 1), false);
});

test('backlog retirement closes unpublished candidates and drops pending updates, keeping published texts', () => {
  const store = { stories: [
    { story_id: 'p', published: true, listed: true, pending_update: { reason: 'BRIDGE_PENDING' }, ai_retry: {}, analysis: {}, sources: [] },
    { story_id: 'q', published: false, pending_reason: 'BRIDGE_PENDING', sources: [] },
    { story_id: 'r', published: false, listed: false, sources: [] },
  ] };
  const state = { pending_story_ids: ['p', 'q'] };
  const report = retireBacklog(store, state, '2026-09-15T12:00:00.000Z');
  assert.deepEqual([report.retired_candidates, report.dropped_pending_updates, report.kept_published, report.pending_after], [1, 1, 1, 0]);
  assert.equal(store.stories[0].pending_update, undefined); assert.equal(store.stories[0].published, true);
  assert.equal(store.stories[1].listed, false); assert.equal(store.stories[1].rejection.reason_code, 'BACKLOG_RETIRED_DIRECT_OPERATION_2026_09_15');
  assert.deepEqual(state.pending_story_ids, []);
});

test('reassessment queue targets only the newest published stories without a released complete profile', () => {
  const complete = releasableRecord(); releaseDeterministicImpact(complete, { now: '2026-09-15T12:00:00.000Z' });
  complete.published_at = '2026-09-15T10:00:00.000Z'; complete.story_id = 'done';
  const incomplete = releasableRecord(); incomplete.story_id = 'todo'; incomplete.published_at = '2026-09-15T09:00:00.000Z'; incomplete.review_checkpoint = { outcome: 'no_material_update' };
  const older = releasableRecord(); older.story_id = 'old'; older.published_at = '2026-09-01T09:00:00.000Z';
  assert.equal(needsPotentialRepair(complete), false); assert.equal(needsPotentialRepair(incomplete), true);
  const store = { stories: [complete, incomplete, older] }, state = { pending_story_ids: [] };
  const report = queueReassessment(store, state, '2026-09-15T12:00:00.000Z', { limit: 2 });
  assert.deepEqual(report.queued.map(item => item.story_id), ['todo']);
  assert.equal(incomplete.pending_update.impact_reassessment, true); assert.equal(incomplete.review_checkpoint, undefined);
  assert.deepEqual(state.pending_story_ids, ['todo']);
});

test('numeric strings and boolean strings from the provider are coerced before the gate, nothing else changes', async () => {
  const { coerceAssessmentTypes } = await import('../../scripts/news/openai-transport.mjs');
  const assessment = syntheticPotentialAssessment();
  const path = assessment.dimensions.planet.primary_paths[0];
  for (const factor of Object.values(path.magnitude_factors)) factor.value = String(factor.value);
  path.magnitude = '3'; path.magnitude_range = { lower: '2', upper: '4', rationale: 'Spanne als Strings geliefert, wird gewandelt.' };
  path.same_target = 'true'; path.protection_boundary.decisive = 'false';
  assessment.dimensions.planet.magnitude = '3';
  const analysis = normalizeAnalysisOutput({ publication_recommendation: 'true', event_claims: [{ claim: 'x', attribution_required: 'false', headline_claim: 'true' }], impact_assessment: assessment });
  assert.equal(analysis.publication_recommendation, true);
  assert.equal(analysis.event_claims[0].attribution_required, false); assert.equal(analysis.event_claims[0].headline_claim, true);
  const planet = analysis.impact_assessment.dimensions.planet;
  assert.equal(planet.primary_paths[0].magnitude, 3); assert.equal(planet.magnitude, 3);
  assert.deepEqual(Object.values(planet.primary_paths[0].magnitude_factors).map(f => f.value), [3, 3, 3, 3, 3, 3]);
  assert.equal(planet.primary_paths[0].same_target, true); assert.equal(planet.primary_paths[0].protection_boundary.decisive, false);
  assert.equal(planet.primary_paths[0].magnitude_range.lower, 2);
  assert.equal(coerceAssessmentTypes({ dimensions: { human: { magnitude: 'viel' } } }).dimensions.human.magnitude, 'viel', 'non-numeric text is never coerced');
  assert.equal(validateAnalysis({ story_id: 'wt-1', impact_assessment: analysis.impact_assessment }, { story_id: 'wt-1', sources: [{ source_id: 'official', url: 'https://example.org/a', title: 'Q', summary: 'Q' }], claims: [{ claim_id: 'c', claim: 'x', source_id: 'official' }] }, { requireImpactAssessment: true }).some(e => e.startsWith('IMPACT_')), false);
});

test('paid answers are copied to the private diagnosis directory when configured', async () => {
  const fs = await import('node:fs'); const os = await import('node:os'); const path = await import('node:path');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'woek-raw-'));
  await callOpenAiDirect(stories, { apiKey: 'test', rawOutputDir: dir, fetchImpl: async () => ({ ok: true, status: 200, json: async () => responsePayload('{"analyses":[]}') }) });
  const files = fs.readdirSync(dir); assert.equal(files.length, 1);
  const copy = JSON.parse(fs.readFileSync(path.join(dir, files[0]), 'utf8'));
  assert.equal(copy.answer, '{"analyses":[]}'); assert.deepEqual(copy.story_ids, ['wt-1']); assert.equal(copy.usage.output_tokens, 800);
  assert.equal(buildOpenAiRequest('P', { model: 'gpt-5.4-mini' }).reasoning.effort, 'low');
  assert.ok(SINGLE_CALL_INSTRUCTIONS.includes('Checkliste je Eintrag'));
});
