import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOpenAiRequest, finalOutputText, decodeUsage, normalizeAnalysisOutput, callOpenAiDirect, newsModel, SINGLE_CALL_INSTRUCTIONS, resolveSourceId, assessmentIssues, repairAddendum, repairHeadlineAttribution, repairFields, fieldRepairFormat, fieldFromFinding } from '../../scripts/news/openai-transport.mjs';
import { releaseDeterministicImpact, deterministicGateIssues, secondPassComplete } from '../../scripts/news/impact-gate.mjs';
import { paidAttemptsExhausted, AI_PROCESSING_VERSION, pendingRecord } from '../../scripts/news/run.mjs';
import { validateAnalysis, sha256 } from '../../scripts/news/lib.mjs';
import { publicImpactAssessment } from '../../scripts/news/impact-release.mjs';
import { syntheticPotentialAssessment, syntheticPotentialPath } from './fixtures/impact21.mjs';
import { impactAssessmentResponseFormat, IMPACT_ASSESSMENT_JSON_SCHEMA } from '../../scripts/news/impact-json-schema.mjs';
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
  assert.equal(record.impact_semantic_review.status, 'ready'); assert.equal(record.impact_semantic_review.mode, 'deterministic-gate-2');
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
  const candidate = { title: 'T', sources, existing_story: { current_version: 0, ai_retry: { version: AI_PROCESSING_VERSION, retry_count: 1, fingerprint: sha256(JSON.stringify({ title: 'T', published_version: 0, sources: sources.map(sourceReviewFingerprint).sort() })) } } };
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
  assert.equal('analysis_complete' in normalizeAnalysisOutput({ analysis_complete: true }), false, 'completion marker is stripped before the gate');
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

test('abbreviated or invented source ids are mapped back to the supplied sources before the gate', () => {
  const sources = [
    { source_id: 'rbb24-nachrichten', publisher: 'rbb24', url: 'https://example.org/r', title: 'R', summary: 'R' },
    { source_id: 'dlf-nachrichten', publisher: 'Deutschlandfunk', url: 'https://example.org/d', title: 'D', summary: 'D' },
    { source_id: 'dlf-kultur', publisher: 'Deutschlandfunk Kultur', url: 'https://example.org/k', title: 'K', summary: 'K' },
  ];
  assert.equal(resolveSourceId('rbb24-nachrichten', sources), 'rbb24-nachrichten');
  assert.equal(resolveSourceId('rbb24', sources), 'rbb24-nachrichten', 'unique prefix');
  assert.equal(resolveSourceId('RBB24 Nachrichten', sources), 'rbb24-nachrichten', 'normalized spelling');
  assert.equal(resolveSourceId('deutschlandfunk', sources), 'dlf-nachrichten', 'unique publisher name');
  assert.equal(resolveSourceId('tagesschau-access', sources), null, 'a source that was never supplied is dropped');
  assert.equal(resolveSourceId('dlf', sources), null, 'an ambiguous fragment never picks a source');
  const story = { story_id: 'wt-1', sources, claims: [{ claim_id: 'c', claim: 'x', source_id: 'rbb24-nachrichten' }] };
  const abbreviated = JSON.parse(JSON.stringify(syntheticPotentialAssessment()).replaceAll('"official"', '"rbb24"'));
  abbreviated.dimensions.human.primary_paths[0].magnitude_factors.reach.source_ids.push('tagesschau-access');
  const followups = () => [{ claim: 'x', source_id: 'rbb24', measurable_indicator: 'y' }];
  const before = validateAnalysis({ story_id: 'wt-1', impact_assessment: structuredClone(abbreviated), followups: followups() }, story, { requireImpactAssessment: true });
  assert.ok(before.includes('IMPACT_PATH_SOURCE_BINDING_REQUIRED:human') && before.includes('IMPACT_FACTOR_REQUIRED:reach:human') && before.includes('IMPACT_SOURCE_FUNCTION_INVALID'), before.join(','));
  const analysis = normalizeAnalysisOutput({ story_id: 'wt-1', impact_assessment: abbreviated, followups: followups() }, story);
  const after = validateAnalysis(analysis, story, { requireImpactAssessment: true });
  assert.equal(after.some((e) => e.startsWith('IMPACT_') || e === 'FOLLOWUP_INVALID'), false, after.join(','));
  assert.equal(analysis.followups[0].source_id, 'rbb24-nachrichten');
  assert.deepEqual(analysis.impact_assessment.dimensions.human.primary_paths[0].magnitude_factors.reach.source_ids, ['rbb24-nachrichten']);
  assert.deepEqual(analysis.impact_assessment.research_check.source_functions.map((s) => s.source_id), ['rbb24-nachrichten']);
  assert.ok(analysis.transport_repairs.includes('human.paths[0].reach:tagesschau-access->dropped'));
  assert.ok(analysis.transport_repairs.includes('followups[0]:rbb24->rbb24-nachrichten'));
  const clean = normalizeAnalysisOutput({ story_id: 'wt-1', impact_assessment: syntheticPotentialAssessment() }, { story_id: 'wt-1', sources: [{ source_id: 'official' }] });
  assert.equal('transport_repairs' in clean, false, 'correct ids leave no trace');
  const unknownStory = normalizeAnalysisOutput({ story_id: 'wt-1', impact_assessment: JSON.parse(JSON.stringify(syntheticPotentialAssessment()).replaceAll('"official"', '"rbb24"')) }, null);
  assert.deepEqual(unknownStory.impact_assessment.dimensions.human.primary_paths[0].source_ids, ['rbb24'], 'without supplied sources nothing is dropped');
  assert.ok(SINGLE_CALL_INSTRUCTIONS.includes('"rbb24-nachrichten", nicht "rbb24"'));
});

test('side paths listed as primary move to secondary_paths and a missing data status becomes modelled', () => {
  const assessment = syntheticPotentialAssessment();
  const human = assessment.dimensions.human;
  human.primary_paths.push(syntheticPotentialPath({ direction: 'negative', magnitude: 2, type: 'side_risk' }));
  Object.assign(human, { direction: 'mixed', magnitude: 2, dominance: 'balanced' });
  const planet = assessment.dimensions.planet;
  planet.primary_paths = [syntheticPotentialPath({ direction: 'open', magnitude: 1, type: 'side_effect' })];
  planet.data_status = 'missing';
  const story = { story_id: 'wt-1', sources: [{ source_id: 'official', url: 'https://example.org/a', title: 'Q', summary: 'Q' }], claims: [{ claim_id: 'c', claim: 'x', source_id: 'official' }] };
  const before = validateAnalysis({ story_id: 'wt-1', impact_assessment: structuredClone(assessment) }, story, { requireImpactAssessment: true });
  assert.ok(before.includes('IMPACT_MAIN_SCOPE_REQUIRED:human') && before.includes('IMPACT_POTENTIAL_STATUS_INVALID:planet'), before.join(','));
  const analysis = normalizeAnalysisOutput({ story_id: 'wt-1', impact_assessment: assessment }, story);
  const after = validateAnalysis(analysis, story, { requireImpactAssessment: true });
  assert.equal(after.some((e) => e.startsWith('IMPACT_')), false, after.join(','));
  const h = analysis.impact_assessment.dimensions.human;
  assert.equal(h.primary_paths.length, 1); assert.equal(h.secondary_paths[0].type, 'side_risk');
  assert.equal(h.direction, 'positive'); assert.equal(h.magnitude, 3); assert.equal(h.dominance, 'dominant_positive');
  const p = analysis.impact_assessment.dimensions.planet;
  assert.equal(p.primary_paths[0].type, 'main_path'); assert.equal(p.data_status, 'modelled'); assert.equal(p.direction, 'open'); assert.equal(p.magnitude, 1);
  assert.deepEqual(analysis.transport_repairs, ['human.primary_paths:side_risk->secondary_paths', 'planet.data_status:missing->modelled', 'planet.primary_paths:side_effect->main_path']);
  assert.ok(SINGLE_CALL_INSTRUCTIONS.includes('side_effect und side_risk gehören in secondary_paths'));
  assert.ok(SINGLE_CALL_INSTRUCTIONS.includes('Textlängen sind harte Grenzen'));
});

test('fragments where paths belong are discarded, incomplete paths stay for the gate', () => {
  const assessment = syntheticPotentialAssessment();
  assessment.dimensions.human.secondary_paths = '],';
  assessment.dimensions.planet.primary_paths.push({ label: 'nur Etikett, kein Mechanismus' }, 'text', null);
  assessment.dimensions.democracy.secondary_paths = [{ direction: 'open' }, syntheticPotentialPath({ type: 'side_effect' })];
  const story = { story_id: 'wt-1', sources: [{ source_id: 'official', url: 'https://example.org/a', title: 'Q', summary: 'Q' }], claims: [{ claim_id: 'c', claim: 'x', source_id: 'official' }] };
  const analysis = normalizeAnalysisOutput({ story_id: 'wt-1', impact_assessment: assessment }, story);
  const d = analysis.impact_assessment.dimensions;
  assert.deepEqual(d.human.secondary_paths, []);
  assert.equal(d.planet.primary_paths.length, 1); assert.equal(d.planet.secondary_paths.length, 0, 'a labelled path without factors gives way once a scored main path remains; text and null are fragments');
  assert.equal(d.democracy.secondary_paths.length, 1); assert.equal(d.democracy.secondary_paths[0].type, 'side_effect');
  assert.deepEqual(analysis.transport_repairs, ['human.secondary_paths:1 fragment(s) discarded', 'planet.primary_paths:2 fragment(s) discarded', 'planet.primary_paths:1 unscored path(s) discarded', 'democracy.secondary_paths:1 fragment(s) discarded']);
  const errors = validateAnalysis(analysis, story, { requireImpactAssessment: true });
  assert.equal(errors.some((e) => e.startsWith('IMPACT_')), false, errors.join(','));
  const alone = syntheticPotentialAssessment(); alone.dimensions.planet.primary_paths = [{ label: 'nur Etikett, kein Mechanismus', type: 'main_path' }];
  const kept = normalizeAnalysisOutput({ story_id: 'wt-1', impact_assessment: alone }, story);
  assert.equal(kept.impact_assessment.dimensions.planet.primary_paths.length, 1, 'without a scored main path the incomplete path stays for the gate');
  assert.ok(validateAnalysis(kept, story, { requireImpactAssessment: true }).includes('IMPACT_POTENTIAL_SCOPE_REQUIRED:planet'));
  assert.ok(SINGLE_CALL_INSTRUCTIONS.includes('Datum der Berichterstattung wird nicht ergänzt'));
});

test('a queued potential reassessment survives a deferral hold of the published story', () => {
  const existing = { story_id: 'wt-old', published: true, content_hash: 'old', sources: [{ url: 'https://example.org/old', source_id: 'official' }],
    pending_update: { detected_at: '2026-09-15T18:00:00Z', reason: 'IMPACT_REASSESSMENT_REQUESTED', impact_reassessment: true, quality_errors: [], quality_retry_count: 0 } };
  const candidate = { story_id: 'wt-old', content_hash: 'old', fresh: false, reassessment: false, impact_reassessment: true, existing_story: existing,
    sources: [{ url: 'https://example.org/old', source_id: 'official', title: 'Q', summary: 'Q', content_hash: 'c' }], preanalysis: { internal_relevance_score: 40 } };
  const held = pendingRecord(candidate, 'AI_BUDGET_OR_BATCH_LIMIT', '2026-09-16T00:00:00Z');
  assert.equal(held.pending_update.impact_reassessment, true);
  assert.equal(held.pending_update.reason, 'AI_BUDGET_OR_BATCH_LIMIT');
  const plain = pendingRecord({ ...candidate, impact_reassessment: false, existing_story: { ...existing, pending_update: { detected_at: '2026-09-15T18:00:00Z' } } }, 'AI_BUDGET_OR_BATCH_LIMIT', '2026-09-16T00:00:00Z');
  assert.equal('impact_reassessment' in plain.pending_update, false, 'an ordinary update never gains the flag');
});

test('unscored side paths are discarded and a decisive boundary on a positive path is cleared', () => {
  const assessment = syntheticPotentialAssessment();
  const human = assessment.dimensions.human;
  human.secondary_paths = [{ ...syntheticPotentialPath({ type: 'side_risk', direction: 'negative', magnitude: 2 }), magnitude_factors: { reach: { value: 2, rationale: 'nur ein Faktor geliefert', source_ids: ['official'] } } }, syntheticPotentialPath({ type: 'side_effect', direction: 'positive', magnitude: 1 })];
  human.primary_paths[0].protection_boundary = { decisive: true, status: 'conditional', rationale: 'Schutzgrenze fälschlich auf dem positiven Hauptpfad.', reference_frame: 'Leben', source_ids: ['official'] };
  const story = { story_id: 'wt-1', sources: [{ source_id: 'official', url: 'https://example.org/a', title: 'Q', summary: 'Q' }], claims: [{ claim_id: 'c', claim: 'x', source_id: 'official' }] };
  assert.ok(validateAnalysis({ story_id: 'wt-1', impact_assessment: structuredClone(assessment) }, story, { requireImpactAssessment: true }).some((e) => e === 'IMPACT_BOUNDARY_UNSUPPORTED:human' || e.startsWith('IMPACT_FACTOR_REQUIRED:')));
  const analysis = normalizeAnalysisOutput({ story_id: 'wt-1', impact_assessment: assessment }, story);
  const h = analysis.impact_assessment.dimensions.human;
  assert.equal(h.secondary_paths.length, 1); assert.equal(h.secondary_paths[0].type, 'side_effect');
  assert.equal(h.primary_paths[0].protection_boundary.decisive, false); assert.equal(h.primary_paths[0].protection_boundary.status, 'not_decisive');
  assert.deepEqual(analysis.transport_repairs, ['human.secondary_paths:1 unscored path(s) discarded', 'human.protection_boundary:decisive on positive path cleared']);
  assert.equal(validateAnalysis(analysis, story, { requireImpactAssessment: true }).some((e) => e.startsWith('IMPACT_')), false);
  assert.deepEqual(assessmentIssues(analysis, story), []);
  assert.ok(assessmentIssues({ story_id: 'wt-1' }, story).includes('IMPACT_ASSESSMENT_REQUIRED'));
});

test('an answer without a usable assessment gets exactly one focused follow-up in the same call, a complete one none', async () => {
  const texts = () => ({ story_id: 'wt-1', publication_recommendation: true, headline: 'H', summary: 'S' });
  const repairedAssessment = syntheticPotentialAssessment();
  const bodies = [];
  const fetchImpl = async (url, init) => {
    const body = JSON.parse(init.body); bodies.push(body);
    const text = bodies.length === 1 ? JSON.stringify({ analyses: [texts()] }) : JSON.stringify({ analyses: [{ story_id: 'wt-1', impact_assessment: repairedAssessment }] });
    return { ok: true, status: 200, json: async () => responsePayload(text) };
  };
  const result = await callOpenAiDirect(stories, { apiKey: 'test', fetchImpl, model: 'gpt-5.6-luna' });
  assert.equal(bodies.length, 2, 'one answer, one follow-up');
  assert.ok(bodies[1].input.includes('NACHLIEFERUNG für story_id wt-1')); assert.ok(bodies[1].input.includes('IMPACT_ASSESSMENT_REQUIRED')); assert.equal(bodies[1].max_output_tokens, 24000);
  assert.equal(result.repair_calls, 1); assert.equal(result.request_attempts, 1);
  assert.deepEqual(result.reported_usage, { input_tokens: 2400, output_tokens: 1600, cached_input_tokens: 400 });
  assert.equal(result.analyses[0].impact_assessment.version, '2.1'); assert.equal(result.analyses[0].headline, 'H');
  assert.ok(result.analyses[0].transport_repairs.some((r) => r.startsWith('impact_assessment:nachgeliefert')));
  assert.deepEqual(assessmentIssues(result.analyses[0], stories[0]), []);
  const complete = await callOpenAiDirect(stories, { apiKey: 'test', model: 'gpt-5.6-luna', fetchImpl: async () => ({ ok: true, status: 200, json: async () => responsePayload(JSON.stringify({ analyses: [{ ...texts(), impact_assessment: syntheticPotentialAssessment() }] })) }) });
  assert.equal(complete.repair_calls, 0); assert.equal('transport_repairs' in complete.analyses[0], false);
  let calls = 0;
  const failing = await callOpenAiDirect(stories, { apiKey: 'test', model: 'gpt-5.6-luna', fetchImpl: async () => { calls += 1; return calls === 1 ? { ok: true, status: 200, json: async () => responsePayload(JSON.stringify({ analyses: [texts()] })) } : { ok: false, status: 500, json: async () => ({}) }; } });
  assert.equal(calls, 2); assert.equal(failing.repair_calls, 1); assert.equal('impact_assessment' in failing.analyses[0], false);
  assert.ok(failing.analyses[0].transport_repairs[0].startsWith('impact_assessment:nachlieferung ohne Ergebnis'));
  const off = await callOpenAiDirect(stories, { apiKey: 'test', model: 'gpt-5.6-luna', repair: false, fetchImpl: async () => ({ ok: true, status: 200, json: async () => responsePayload(JSON.stringify({ analyses: [texts()] })) }) });
  assert.equal(off.repair_calls, 0);
  assert.ok(repairAddendum('wt-9', ['IMPACT_X'], null).includes('Es lag noch kein impact_assessment vor.'));
});

test('an attributed headline claim without its qualifier in the title gets the attribution prefixed from the model\'s own words', () => {
  const analysis = normalizeAnalysisOutput({ story_id: 'wt-1', headline: 'Sonderzug in Grenzregion nach Drohnenangriff teilweise geräumt',
    event_claims: [{ claim: 'Ein Sonderzug hielt an', attribution_required: true, headline_claim: true, attributed_to: 'Bericht der Bahn', headline_qualifier: null }] }, null);
  assert.equal(analysis.headline, 'Laut Bericht der Bahn: Sonderzug in Grenzregion nach Drohnenangriff teilweise geräumt');
  assert.equal(analysis.event_claims[0].headline_qualifier, 'laut Bericht der Bahn');
  assert.deepEqual(analysis.transport_repairs, ['headline:attribution prefixed (laut Bericht der Bahn)', 'event_claims:headline_qualifier set (laut Bericht der Bahn)']);
  const fine = normalizeAnalysisOutput({ story_id: 'wt-1', headline: 'Laut Polizei: Brand gelöscht', event_claims: [{ claim: 'x', attribution_required: true, headline_claim: true, headline_qualifier: 'laut Polizei' }] }, null);
  assert.equal(fine.headline, 'Laut Polizei: Brand gelöscht'); assert.equal('transport_repairs' in fine, false);
  const noClaim = repairHeadlineAttribution({ headline: 'Titel ohne Zuordnung', event_claims: [{ claim: 'x', attribution_required: true, headline_claim: false }, { claim: 'y', attribution_required: true, headline_claim: true }] });
  assert.equal(noClaim.headline, 'Titel ohne Zuordnung', 'without any attribution wording nothing is invented');
  assert.ok(SINGLE_CALL_INSTRUCTIONS.includes('rationale (Begründungstext) und balance') && SINGLE_CALL_INSTRUCTIONS.includes('mehr als 20 Wörtern wörtlich'));
  for (const rule of ['bei deepened 100 bis 180 Wörter', 'bei deepened 500 bis 1200 Zeichen und 5 bis 7 Sätze', 'Zu kurz ist genauso ungültig wie zu lang']) assert.ok(SINGLE_CALL_INSTRUCTIONS.includes(rule), rule);
});

test('a missing dimension time status is derived from its paths and an unscored counter path gives way to a scored main path', () => {
  const assessment = syntheticPotentialAssessment();
  const human = assessment.dimensions.human, planet = assessment.dimensions.planet;
  delete human.temporal_status; planet.temporal_status = 'ex_post';
  planet.primary_paths.push({ ...syntheticPotentialPath({ type: 'counter_path', direction: 'negative', magnitude: 1 }), magnitude_factors: undefined });
  const story = { story_id: 'wt-1', sources: [{ source_id: 'official', url: 'https://example.org/a', title: 'Q', summary: 'Q' }], claims: [{ claim_id: 'c', claim: 'x', source_id: 'official' }] };
  const before = validateAnalysis({ story_id: 'wt-1', impact_assessment: structuredClone(assessment) }, story, { requireImpactAssessment: true });
  assert.ok(before.includes('IMPACT_POTENTIAL_STATUS_INVALID:human') && before.includes('IMPACT_FACTOR_REQUIRED:reach:planet'), before.join(','));
  const analysis = normalizeAnalysisOutput({ story_id: 'wt-1', impact_assessment: assessment }, story);
  assert.equal(analysis.impact_assessment.dimensions.human.temporal_status, 'ex_ante'); assert.equal(analysis.impact_assessment.dimensions.planet.temporal_status, 'ex_ante');
  assert.equal(analysis.impact_assessment.dimensions.planet.primary_paths.length, 1);
  assert.ok(analysis.transport_repairs.includes('human.temporal_status:undefined->ex_ante') && analysis.transport_repairs.includes('planet.primary_paths:1 unscored path(s) discarded'), analysis.transport_repairs.join(','));
  assert.equal(validateAnalysis(analysis, story, { requireImpactAssessment: true }).some((e) => e.startsWith('IMPACT_')), false);
  const signal = syntheticPotentialAssessment(); const dim = signal.dimensions.democracy; delete dim.temporal_status;
  dim.primary_paths[0].temporal_status = 'ongoing'; dim.primary_paths[0].observed_signal = { change: 'Ein erstes beobachtetes Signal liegt vor.', source_ids: ['official'] };
  assert.equal(normalizeAnalysisOutput({ story_id: 'wt-1', impact_assessment: signal }, story).impact_assessment.dimensions.democracy.temporal_status, 'ongoing');
  assert.ok(SINGLE_CALL_INSTRUCTIONS.includes('Wirkungen als Möglichkeit formulieren'));
});

test('after a completed second pass a central dimension may stay explicitly open in the deterministic gate', () => {
  const record = releasableRecord();
  const assessment = record.impact_assessment;
  assessment.systemic_relevance = 'high'; assessment.system_check.central_dimensions = ['human', 'planet'];
  const planet = assessment.dimensions.planet;
  planet.primary_paths = [syntheticPotentialPath({ direction: 'open', magnitude: 1 })]; planet.direction = 'open'; planet.dominance = 'none'; planet.magnitude = 1;
  assert.equal(secondPassComplete(assessment), true);
  assert.equal(deterministicGateIssues(record).some((e) => e.startsWith('IMPACT_CENTRAL_DIMENSION_UNRESOLVED')), false, deterministicGateIssues(record).join(','));
  assert.deepEqual(assessmentIssues({ impact_assessment: assessment }, record), []);
  planet.primary_paths[0].research_pass = 'initial'; delete planet.primary_paths[0].research_result; planet.primary_paths[0].evidence = 'medium';
  assert.equal(secondPassComplete(assessment), false);
  assert.ok(deterministicGateIssues(record).includes('IMPACT_CENTRAL_DIMENSION_UNRESOLVED:planet'), 'without the second pass an open central dimension still holds');
  assert.equal(secondPassComplete({ ...assessment, research_check: { ...assessment.research_check, status: 'needs_research' } }), false);
});

test('the strict schema covers the contract and every object forbids extra keys', () => {
  const format = impactAssessmentResponseFormat();
  assert.equal(format.type, 'json_schema'); assert.equal(format.strict, true);
  const problems = [], seen = [];
  const walk = (node, path, depth) => {
    if (!node || typeof node !== 'object') return;
    seen.push(depth);
    const isObject = node.type === 'object' || (Array.isArray(node.type) && node.type.includes('object'));
    if (isObject) {
      if (node.additionalProperties !== false) problems.push(`${path}: additionalProperties`);
      const properties = Object.keys(node.properties || {}), required = node.required || [];
      if (properties.length !== required.length || properties.some((key) => !required.includes(key))) problems.push(`${path}: required`);
    }
    for (const [key, value] of Object.entries(node.properties || {})) walk(value, `${path}.${key}`, depth + 1);
    if (node.items) walk(node.items, `${path}[]`, depth + 1);
  };
  walk(format.schema, 'root', 1);
  assert.deepEqual(problems, [], problems.join(' | '));
  assert.ok(Math.max(...seen) <= 10, `Verschachtelung ${Math.max(...seen)} überschreitet die Anbietergrenze`);
  const dimension = IMPACT_ASSESSMENT_JSON_SCHEMA.properties.dimensions.properties;
  assert.deepEqual(Object.keys(dimension), ['human', 'planet', 'democracy']);
  for (const key of ['rationale', 'balance', 'temporal_status', 'research_pass', 'primary_paths', 'secondary_paths', 'data_status']) assert.ok(key in dimension.human.properties, key);
  const path = dimension.human.properties.primary_paths.items.properties;
  for (const factor of ['reach', 'intensity', 'duration', 'irreversibility', 'vulnerability', 'system_depth']) assert.ok(factor in path.magnitude_factors.properties, factor);
  assert.deepEqual(path.type.enum, ['main_path', 'counter_path', 'side_effect', 'side_risk']);
  assert.deepEqual(dimension.human.properties.data_status.enum, ['modelled', 'estimated']);
  // A synthetic contract-valid assessment satisfies the schema's own key sets.
  const assessment = syntheticPotentialAssessment();
  const missing = Object.keys(IMPACT_ASSESSMENT_JSON_SCHEMA.properties).filter((key) => !(key in assessment));
  assert.deepEqual(missing, [], `Schema verlangt Felder, die der Vertrag nicht kennt: ${missing.join(',')}`);
});

test('the follow-up asks with the strict schema and falls back to JSON mode when the provider rejects it', async () => {
  const texts = () => ({ story_id: 'wt-1', publication_recommendation: true, headline: 'H', summary: 'S' });
  const assessment = syntheticPotentialAssessment();
  const bodies = [];
  const schemaRun = await callOpenAiDirect(stories, { apiKey: 'test', model: 'gpt-5.6-luna', fetchImpl: async (url, init) => {
    const body = JSON.parse(init.body); bodies.push(body);
    return { ok: true, status: 200, json: async () => responsePayload(bodies.length === 1 ? JSON.stringify({ analyses: [texts()] }) : JSON.stringify(assessment)) };
  } });
  assert.equal(bodies[0].text.format.type, 'json_schema', 'der erste Aufruf ist schemagebunden');
  assert.equal(bodies[0].text.format.name, 'wirkungsticker_analyse_1');
  assert.equal(bodies[1].text.format.type, 'json_schema'); assert.equal(bodies[1].text.format.strict, true);
  assert.equal(schemaRun.analyses[0].impact_assessment.version, '2.1', 'a bare assessment object is accepted');
  assert.ok(schemaRun.analyses[0].transport_repairs[0].includes('mit Schema'));
  const rejected = [];
  const fallback = await callOpenAiDirect(stories, { apiKey: 'test', model: 'gpt-5.6-luna', fetchImpl: async (url, init) => {
    const body = JSON.parse(init.body); rejected.push(body.text.format.type);
    if (rejected.length === 1) return { ok: true, status: 200, json: async () => responsePayload(JSON.stringify({ analyses: [texts()] })) };
    if (body.text.format.type === 'json_schema') return { ok: false, status: 400, json: async () => ({ error: { message: 'Unsupported response format' } }) };
    return { ok: true, status: 200, json: async () => responsePayload(JSON.stringify({ analyses: [{ story_id: 'wt-1', impact_assessment: assessment }] })) };
  } });
  assert.deepEqual(rejected, ['json_schema', 'json_schema', 'json_object'], 'erster Aufruf mit Schema, Nachlieferung mit Schema, danach ein Rückfall');
  assert.equal(fallback.repair_calls, 1, 'the fallback stays one follow-up');
  assert.equal(fallback.analyses[0].impact_assessment.version, '2.1');
  assert.ok(!fallback.analyses[0].transport_repairs[0].includes('mit Schema'));
  const off = [];
  await callOpenAiDirect(stories, { apiKey: 'test', model: 'gpt-5.6-luna', repairSchema: false, fetchImpl: async (url, init) => {
    off.push(JSON.parse(init.body).text.format.type);
    return { ok: true, status: 200, json: async () => responsePayload(off.length === 1 ? JSON.stringify({ analyses: [texts()] }) : JSON.stringify(assessment)) };
  } });
  assert.deepEqual(off, ['json_schema', 'json_object'], 'nur die Nachlieferung lässt sich abschalten');
});

test('der erste Aufruf ist schemagebunden, fällt bei Ablehnung einmal zurück und akzeptiert die Analyse als Wurzel', async () => {
  const { ANALYSIS_JSON_SCHEMA, schemaEligible, analysisResponseFormat } = await import('../../scripts/news/analysis-json-schema.mjs');
  // Das Schema deckt jedes Feld, das eine veröffentlichte Analyse trägt.
  const complete = { story_id: 'wt-1', publication_recommendation: true, rejection: null, headline: 'Ein Titel mit genug Zeichen',
    news_status: 'developing', publication_depth: 'initial', event_claims: [], followups: [], source_summary: 'S', summary: 'S', detail_summary: 'D',
    why_relevant: 'W', status: 'angekündigt', analysis_type: 'ex_ante', importance: 'hoch', impact_potential: 'P', impact_risks: [], mechanisms: [],
    first_order: [], second_order: [], third_order: [], systemic_relevance: 'R', transformation_potential: 'T', resilience: 'R', side_effects: [],
    uncertainties: ['u'], evidence_level: 'low', attribution: 'A', watch_next: ['w'], reference_frameworks: [],
    publication_gate: { news_value: 'new_evidence', materiality_factors: ['affected_scope', 'distribution'], exceptional_factor: 'none', evidence_basis: 'attributed_single_source', duplicate_status: 'new_story', rationale: 'R' },
    visuals: null, media_impact: null, impact_assessment: syntheticPotentialAssessment() };
  assert.deepEqual(Object.keys(ANALYSIS_JSON_SCHEMA.properties).filter((key) => !(key in complete)), [], 'das Schema verlangt nur Felder, die der Vertrag kennt');
  assert.deepEqual(Object.keys(complete).filter((key) => !(key in ANALYSIS_JSON_SCHEMA.properties)), [], 'jedes Vertragsfeld steht im Schema');
  assert.deepEqual(ANALYSIS_JSON_SCHEMA.required, Object.keys(ANALYSIS_JSON_SCHEMA.properties));
  assert.equal(ANALYSIS_JSON_SCHEMA.additionalProperties, false);
  assert.equal(JSON.stringify(analysisResponseFormat()).includes('"description"'), false, 'ohne Beschreibungen bleibt das Schema klein');
  // Ein lokal erkannter Medienanlass braucht das offene media_impact-Objekt.
  assert.equal(schemaEligible(stories), true);
  assert.equal(schemaEligible([{ ...stories[0], media_trigger: { relevant: true } }]), false);
  assert.equal(schemaEligible([]), false);
  // Die Analyse kommt als Wurzel zurück und wird wieder verpackt.
  const bare = { ...complete, impact_assessment: syntheticPotentialAssessment() };
  const bodies = [];
  const result = await callOpenAiDirect(stories, { apiKey: 'test', model: 'gpt-5.6-luna', fetchImpl: async (url, init) => {
    bodies.push(JSON.parse(init.body));
    return { ok: true, status: 200, json: async () => responsePayload(JSON.stringify(bare)) };
  } });
  assert.equal(bodies.length, 1, 'eine vollständige Antwort braucht keine Nachlieferung');
  assert.equal(bodies[0].text.format.type, 'json_schema');
  assert.ok(!bodies[0].input.includes('VISUALS'), 'ohne Schemazwang für visuals bleibt der Prompt kürzer');
  assert.equal(result.analyses.length, 1); assert.equal(result.analyses[0].story_id, 'wt-1');
  assert.equal(result.analysis_schema, true);
  // Lehnt der Anbieter das Schema ab, läuft derselbe Versuch ohne Schema weiter.
  const formats = [];
  const fallback = await callOpenAiDirect(stories, { apiKey: 'test', model: 'gpt-5.6-luna', fetchImpl: async (url, init) => {
    const body = JSON.parse(init.body); formats.push(body.text.format.type);
    if (body.text.format.type === 'json_schema') return { ok: false, status: 400, json: async () => ({ error: { message: 'Invalid schema' } }) };
    return { ok: true, status: 200, json: async () => responsePayload(JSON.stringify({ analyses: [bare] })) };
  } });
  assert.deepEqual(formats, ['json_schema', 'json_object'], 'genau ein Rückfall, kein dritter Aufruf');
  assert.equal(fallback.request_attempts, 1, 'die Ablehnung zählt nicht als bezahlter Versuch');
  assert.equal(fallback.analysis_schema, false);
  assert.equal(fallback.analyses[0].story_id, 'wt-1');
});

test('bei Textbefunden liefert die eine Nachlieferung genau die betroffenen Felder nach', async () => {
  const assessment = syntheticPotentialAssessment();
  const texts = () => ({ story_id: 'wt-1', publication_recommendation: true, headline: 'H', summary: 'S',
    source_summary: 'zu kurz', detail_summary: 'kurz', impact_assessment: structuredClone(assessment) });
  assert.deepEqual(repairFields(['AI_SOURCE_SUMMARY_LENGTH', 'AI_DETAIL_SUMMARY_LENGTH']), ['source_summary', 'detail_summary']);
  assert.deepEqual(repairFields(['CLAIM_NUMBER_NOT_IN_EVIDENCE']), ['event_claims']);
  assert.deepEqual(repairFields(['IMPACT_RATIONALE_REQUIRED:human']), [], 'Bewertungsbefunde laufen über das Bewertungsschema');
  const format = fieldRepairFormat(['source_summary', 'detail_summary']);
  assert.deepEqual(format.schema.required, ['story_id', 'source_summary', 'detail_summary']);
  assert.equal(format.schema.additionalProperties, false); assert.equal(format.strict, true);
  const bodies = [];
  const result = await callOpenAiDirect(stories, { apiKey: 'test', model: 'gpt-5.6-luna',
    findIssues: (analysis) => analysis.source_summary === 'zu kurz' ? ['AI_SOURCE_SUMMARY_LENGTH', 'AI_DETAIL_SUMMARY_LENGTH'] : [],
    fetchImpl: async (url, init) => {
      const body = JSON.parse(init.body); bodies.push(body);
      const answer = bodies.length === 1 ? JSON.stringify({ analyses: [texts()] })
        : JSON.stringify({ story_id: 'wt-1', source_summary: 'Ein deutlich längerer Quellenabsatz.\n\nUnd ein zweiter Absatz.', detail_summary: 'Ausführlicher Text.' });
      return { ok: true, status: 200, json: async () => responsePayload(answer) };
    } });
  assert.equal(bodies.length, 2); assert.equal(result.repair_calls, 1);
  assert.equal(bodies[1].text.format.name, 'wirkungsticker_nachlieferung_1');
  assert.deepEqual(bodies[1].text.format.schema.required, ['story_id', 'source_summary', 'detail_summary']);
  assert.ok(bodies[1].input.includes('Liefere ausschließlich diese Felder neu: source_summary, detail_summary'));
  assert.ok(bodies[1].input.includes('zwei bis drei Absätze'), 'die Längenregel steht im Klartext dabei');
  assert.equal(result.analyses[0].source_summary, 'Ein deutlich längerer Quellenabsatz.\n\nUnd ein zweiter Absatz.');
  assert.equal(result.analyses[0].detail_summary, 'Ausführlicher Text.');
  assert.equal(result.analyses[0].headline, 'H', 'nicht betroffene Felder bleiben unverändert');
  assert.equal(result.analyses[0].impact_assessment.version, '2.1');
  assert.ok(result.analyses[0].transport_repairs.some((r) => r.startsWith('source_summary+detail_summary:nachgeliefert mit Schema')));
  // Fehlt das Bewertungsobjekt, hat es Vorrang: nur ein Aufruf, nur die Bewertung.
  const priority = [];
  await callOpenAiDirect(stories, { apiKey: 'test', model: 'gpt-5.6-luna',
    findIssues: () => ['AI_SOURCE_SUMMARY_LENGTH'],
    fetchImpl: async (url, init) => {
      const body = JSON.parse(init.body); priority.push(body.text.format.name || body.text.format.type);
      const answer = priority.length === 1 ? JSON.stringify({ analyses: [{ story_id: 'wt-1', publication_recommendation: true, headline: 'H', summary: 'S' }] }) : JSON.stringify(assessment);
      return { ok: true, status: 200, json: async () => responsePayload(answer) };
    } });
  assert.deepEqual(priority, ['wirkungsticker_analyse_1', 'wirkungspotenzial_2_1'], 'das Bewertungsobjekt zuerst, danach kein weiterer Aufruf');
});

test('ein Medienbefund wird ohne Schema nachgeliefert, weil media_impact offen bleibt', async () => {
  const assessment = syntheticPotentialAssessment();
  const answered = () => ({ story_id: 'wt-1', publication_recommendation: true, headline: 'H', summary: 'S',
    media_impact: { relevant: true, public_explanation: 'zu kurz' }, impact_assessment: structuredClone(assessment) });
  assert.deepEqual(repairFields(['MEDIA_PUBLIC_EXPLANATION_LENGTH', 'MEDIA_IMPACT_REQUIRED_STRING:reason']), ['media_impact']);
  assert.equal(fieldRepairFormat(['media_impact']), null, 'für ein offenes Objekt gibt es kein erzwingbares Schema');
  const bodies = [];
  const result = await callOpenAiDirect(stories, { apiKey: 'test', model: 'gpt-5.6-luna',
    findIssues: (analysis) => analysis.media_impact?.public_explanation === 'zu kurz' ? ['MEDIA_PUBLIC_EXPLANATION_LENGTH'] : [],
    fetchImpl: async (url, init) => {
      const body = JSON.parse(init.body); bodies.push(body);
      const answer = bodies.length === 1 ? JSON.stringify({ analyses: [answered()] })
        : JSON.stringify({ story_id: 'wt-1', media_impact: { relevant: true, public_explanation: 'Eine ausreichend lange Erklärung.', reason: 'R' } });
      return { ok: true, status: 200, json: async () => responsePayload(answer) };
    } });
  assert.equal(bodies.length, 2); assert.equal(result.repair_calls, 1);
  assert.equal(bodies[1].text.format.type, 'json_object', 'genau ein Aufruf, ohne Schema-Ablehnung davor');
  assert.ok(bodies[1].input.includes('Liefere ausschließlich diese Felder neu: media_impact'));
  assert.ok(bodies[1].input.includes('80 bis 200 Wörter'));
  assert.equal(result.analyses[0].media_impact.public_explanation, 'Eine ausreichend lange Erklärung.');
  assert.equal(result.analyses[0].headline, 'H');
  assert.ok(result.analyses[0].transport_repairs.some((r) => r === 'media_impact:nachgeliefert (1 Befunde)'));
});

test('ein Befund, der sein Feld selbst nennt, bestimmt die Nachlieferung ohne Tabelle', () => {
  assert.deepEqual(repairFields(['AI_ARRAY_REQUIRED:uncertainties']), ['uncertainties']);
  assert.deepEqual(repairFields(['AI_REQUIRED_STRING:resilience', 'AI_ARRAY_REQUIRED:mechanisms']), ['resilience', 'mechanisms']);
  assert.deepEqual(repairFields(['AI_IMPORTANCE_INVALID', 'AI_PUBLICATION_GATE_REQUIRED', 'AI_WATCH_NEXT_REQUIRED']), ['importance', 'publication_gate', 'watch_next']);
  assert.deepEqual(repairFields(['AI_ARRAY_REQUIRED:visuals']), [], 'Titelbilder laufen nicht über die Nachlieferung');
  assert.deepEqual(repairFields(['AI_REQUIRED_STRING:impact_assessment']), [], 'das Bewertungsobjekt hat seinen eigenen Weg');
  assert.deepEqual(repairFields(['AI_ARRAY_REQUIRED:erfundenes_feld']), [], 'nur Felder des Analyseschemas');
  assert.equal(fieldFromFinding('AI_ARRAY_REQUIRED:first_order'), 'first_order');
  assert.equal(fieldFromFinding('AI_MATERIALITY_TOO_LOW'), null);
  const format = fieldRepairFormat(repairFields(['AI_ARRAY_REQUIRED:uncertainties', 'AI_REQUIRED_STRING:evidence_level']));
  assert.deepEqual(format.schema.required, ['story_id', 'uncertainties', 'evidence_level']);
});

test('das Analyseschema bleibt innerhalb aller Anbietergrenzen, sonst fällt der Lauf unbemerkt in den freien Modus', async () => {
  const { analysisResponseFormat } = await import('../../scripts/news/analysis-json-schema.mjs');
  const format = analysisResponseFormat();
  let properties = 0, enumValues = 0, longestEnum = 0, depth = 0;
  const walk = (node, level) => {
    if (!node || typeof node !== 'object') return;
    depth = Math.max(depth, level);
    if (Array.isArray(node.enum)) { enumValues += node.enum.length; for (const value of node.enum) longestEnum = Math.max(longestEnum, String(value).length); }
    for (const value of Object.values(node.properties || {})) { properties += 1; walk(value, level + 1); }
    if (node.items) walk(node.items, level + 1);
  };
  walk(format.schema, 1);
  const bytes = JSON.stringify(format).length;
  // Grenzen der Structured Outputs: 120 000 Zeichen, 5000 Eigenschaften,
  // 10 Verschachtelungsebenen, 1000 Enum-Werte (ab 250 Werten höchstens 250
  // Zeichen je Wert). Wird eine überschritten, lehnt der Anbieter das Schema
  // ab und der Lauf läuft wieder ungebunden - ohne dass es jemand merkt.
  assert.ok(bytes <= 120000, `Schema ${bytes} Zeichen`);
  assert.ok(properties <= 5000, `Schema ${properties} Eigenschaften`);
  assert.ok(depth <= 10, `Verschachtelung ${depth}`);
  assert.ok(enumValues <= 1000, `${enumValues} Enum-Werte`);
  if (enumValues > 250) assert.ok(longestEnum <= 250, `längster Enum-Wert ${longestEnum} Zeichen`);
});

test('die Veröffentlichungstiefe kommt vom Server, weil die Textlängen daran hängen', async () => {
  const { repairPublicationDepth } = await import('../../scripts/news/openai-transport.mjs');
  const { buildAnalysisPrompt, validateAnalysis } = await import('../../scripts/news/lib.mjs');
  // Eine neue Meldung ist initial, eine bestehende Akte vertieft.
  const fresh = { publication_depth: 'deepened' }, repairs = [];
  repairPublicationDepth(fresh, { existing_story: { published: false } }, repairs);
  assert.equal(fresh.publication_depth, 'initial');
  assert.deepEqual(repairs, ['publication_depth:deepened->initial']);
  const known = { publication_depth: 'initial' };
  repairPublicationDepth(known, { existing_story: { published: true } }, []);
  assert.equal(known.publication_depth, 'deepened');
  // Eine Neubewertung behält ihre Tiefe, ein unbekannter Zustand ebenfalls.
  for (const story of [{ existing_story: { published: true }, impact_reassessment: true }, {}, null]) {
    const keep = { publication_depth: 'initial' };
    repairPublicationDepth(keep, story, []);
    assert.equal(keep.publication_depth, 'initial');
  }
  // Die Anweisung nennt die Tiefe als Vorgabe, ohne den Meldungsteil zu vergrößern.
  assert.ok(SINGLE_CALL_INSTRUCTIONS.includes('publication_depth ist vorgegeben'), 'die Vorgabe steht in der Anweisung');
  const prompt = buildAnalysisPrompt([{ ...stories[0], existing_story: { published: false } }], { transport: 'api' });
  assert.ok(prompt.includes('already_published'), 'der Stand der Akte steht im Auftrag');
  // Und damit greift die richtige Längenregel: 105 Wörter sind initial gültig.
  const words = Array.from({ length: 52 }, (_, i) => `Wort${i}`).join(' ');
  const analysis = normalizeAnalysisOutput({ story_id: 'wt-1', publication_recommendation: true, publication_depth: 'deepened',
    source_summary: `${words}\n\n${words}`, summary: 'Ein Satz. Noch ein Satz.' }, { ...stories[0], existing_story: { published: false } });
  assert.equal(analysis.publication_depth, 'initial');
  const found = validateAnalysis(analysis, { ...stories[0], claims: [] }, {});
  assert.equal(found.includes('AI_SOURCE_SUMMARY_LENGTH'), false, found.filter((f) => f.includes('SOURCE_SUMMARY')).join(' '));
});
test('der Auftrag nennt genau eine Zielspanne je Meldung, damit ein Aufruf reicht', async () => {
  const { storyBriefing } = await import('../../scripts/news/openai-transport.mjs');
  const initial = storyBriefing({ existing_story: { published: false } });
  assert.match(initial, /publication_depth: initial/);
  assert.match(initial, /90 bis 160 Wörter in genau drei Absätzen/);
  assert.match(initial, /4 bis 6 Sätze, 350 bis 900 Zeichen/);
  const deepened = storyBriefing({ existing_story: { published: true } });
  assert.match(deepened, /publication_depth: deepened/);
  assert.match(deepened, /120 bis 170 Wörter/);
  assert.match(deepened, /600 bis 1100 Zeichen/);
  // Die Zielspannen liegen komfortabel innerhalb der Prüfgrenzen.
  assert.ok(initial.includes('90 bis 160') && !initial.includes('60 bis 180'), 'kein Zielwert am Rand der Prüfgrenze');
  // Zahlen: die Regel nennt den Mechanismus, den die Prüfung anwendet.
  assert.match(initial, /wörtlich in dem Beleg-Ausschnitt stehen, den du für genau diese Aussage zitierst/);
  // Eine Neubewertung behält ihre Tiefe, ein unbekannter Aktenstand bekommt keine Vorgabe.
  assert.equal(storyBriefing({ existing_story: { published: true }, impact_reassessment: true }), '');
  assert.equal(storyBriefing({}), '');
  assert.equal(storyBriefing(null), '');
  // Vorgabe und nachträgliche Korrektur teilen dieselbe Ableitung.
  const { requiredPublicationDepth, repairPublicationDepth } = await import('../../scripts/news/openai-transport.mjs');
  for (const story of [{ existing_story: { published: false } }, { existing_story: { published: true } }]) {
    const depth = requiredPublicationDepth(story);
    assert.ok(storyBriefing(story).includes(`publication_depth: ${depth}.`));
    const answer = { publication_depth: depth === 'initial' ? 'deepened' : 'initial' };
    repairPublicationDepth(answer, story, []);
    assert.equal(answer.publication_depth, depth);
  }
  assert.equal(requiredPublicationDepth({ existing_story: { published: true }, impact_reassessment: true }), null);
  // Die Nachlieferung nennt dieselbe konkrete Spanne wie der erste Aufruf.
  const deep = repairAddendum('wt-1', ['AI_SOURCE_SUMMARY_LENGTH'], null, ['source_summary'], 'deepened');
  assert.match(deep, /120 bis 170 Wörter in genau drei Absätzen/);
  assert.match(deep, /Zähle die Wörter/);
  assert.match(repairAddendum('wt-1', ['AI_DETAIL_SUMMARY_LENGTH'], null, ['detail_summary'], 'initial'), /4 bis 6 Sätze, 350 bis 900 Zeichen/);
  // Ohne bekannte Tiefe bleibt die bisherige Formulierung.
  assert.match(repairAddendum('wt-1', ['AI_SOURCE_SUMMARY_LENGTH'], null, ['source_summary']), /60 bis 180 Wörter bei publication_depth initial/);

  // Beim einzelnen Aufruf steht die Vorgabe in der Anweisung, nicht im Meldungsteil.
  const bodies = [];
  await callOpenAiDirect([{ ...stories[0], existing_story: { published: false } }], { apiKey: 'test', model: 'gpt-5.6-luna', repair: false,
    fetchImpl: async (url, init) => { bodies.push(JSON.parse(init.body)); return { ok: true, status: 200, json: async () => responsePayload(JSON.stringify({ analyses: [{ story_id: 'wt-1', publication_recommendation: false, rejection: { code: 'not_material', reason: 'Test' } }] })) }; } });
  assert.match(bodies[0].instructions, /VORGABEN FÜR DIESE MELDUNG/);
  assert.match(bodies[0].instructions, /90 bis 160 Wörter/);
  assert.equal(bodies[0].input.includes('VORGABEN FÜR DIESE MELDUNG'), false, 'der Meldungsteil bleibt unverändert groß');
  // Bei mehreren Meldungen in einem Aufruf gibt es keine Einzelvorgabe.
  const many = [];
  await callOpenAiDirect([{ ...stories[0], existing_story: { published: false } }, { ...stories[0], story_id: 'wt-2', existing_story: { published: true } }], { apiKey: 'test', model: 'gpt-5.6-luna', repair: false,
    fetchImpl: async (url, init) => { many.push(JSON.parse(init.body)); return { ok: true, status: 200, json: async () => responsePayload(JSON.stringify({ analyses: [] })) }; } });
  assert.equal(many[0].instructions.includes('VORGABEN FÜR DIESE MELDUNG'), false);
});
