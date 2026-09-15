import test from 'node:test';
import assert from 'node:assert/strict';
import { hash, bridgePath } from '../../scripts/news/bridge/contract.mjs';
import { selectEditorialRequests, processEditorialRequest, runRedaktionsworker, draftEditorialOutput, researchInstructions, NO_TOOLS_SENTENCE, WEB_SEARCH_USD_PER_CALL, WORKER_ACTOR } from '../../scripts/news/redaktionsworker.mjs';
import { buildCandidateRequest, selectEditorialCandidates, proposeEditorialCandidates } from '../../scripts/news/redaktions-kandidaten.mjs';

const owner = '123456789012345678';
const knowledge = { hash: 'a'.repeat(64), instructions: 'Synthetische Redaktionsanweisung für den Test.', compatibleHashes: [] };
const now = () => '2026-09-15T20:30:00.000Z';
function packetFor(id) {
  const content = { kind: 'opinion_analysis', brief: 'Bitte diesen synthetischen Testfall vorbereiten.', links: ['https://example.org/source'], author_notes: '', urgent: false, publication_intent: 'final_approval_required', attachments: [] };
  return { schema_version: '1.0', job_type: 'editorial_request', job_id: id, created_at: '2026-09-15T20:00:00.000Z', input_hash: hash(content), processing_mode: 'dropbox_chatgpt_bridge', test_only: false, manual_only: true, request: content,
    contract_path: bridgePath('98_CONFIG', 'editorial-request-contract-4.json'), instructions: 'Bearbeite ausschließlich den konkreten Nutzerauftrag.' };
}
const preview = () => ({ format: 'opinion_analysis', title: 'Ein ausdrücklich fiktiver Vorschautext', subtitle: 'Prüfung des privaten Freigabewegs',
  markdown: '## Test der Freigabe\n\nDieser synthetische Text beschreibt ausschließlich den technischen Test einer Vorschau. Er ist kein wirklicher Beitrag und enthält keine persönliche Position oder Erfahrung der Autorin.\n\n## Meine Einordnung\n\nAuch dieser Schlussabschnitt ist ausschließlich eine synthetische Prüfung des Freigabewegs.',
  sources: [{ url: 'https://example.org/source', title: 'Synthetische Testquelle', publisher: 'Test' }], checks: { source_binding: true, editorial_validation: true, personal_experiences_invented: false } });

function fakeSession(jobs) {
  const files = new Map(), observations = new Map(), calls = [];
  const store = {
    acquire: async (...a) => { calls.push(['acquire', a[1]]); }, release: async (ok) => { calls.push(['release', ok]); },
    all: async () => jobs.map((job) => ({ input: { job_id: job.input.job_id, job_type: job.input.job_type }, status: job.status, created_at: job.created_at, ack: job.ack, accepted: job.accepted })),
    get: async (id) => structuredClone(jobs.find((job) => job.input.job_id === id) || null),
    put: async (job) => { calls.push(['put', job.input.job_id]); const i = jobs.findIndex((j) => j.input.job_id === job.input.job_id); if (i >= 0) jobs[i] = job; else jobs.push(job); },
    observe: async (key, value) => { observations.set(key, value); }, observation: async (key) => observations.get(key) ?? null,
  };
  const transport = {
    metadata: async (p) => files.has(p) ? { name: p.split('/').at(-1) } : null, read: async (p) => { if (!files.has(p)) throw new Error('BRIDGE_DROPBOX_NOT_FOUND'); return files.get(p); },
    writeAtomic: async (p, v) => { calls.push(['write', p]); files.set(p, JSON.stringify(v)); }, move: async (a, b) => { if (!files.has(a)) throw new Error('BRIDGE_DROPBOX_NOT_FOUND'); files.set(b, files.get(a)); files.delete(a); calls.push(['move', b]); },
    list: async (folder) => [...files.keys()].filter((p) => p.includes('/' + folder + '/')).map((p) => ({ name: p.split('/').at(-1) })),
  };
  return { store, transport, files, observations, calls };
}
const jobId = 'wt_20260915T200000Z_' + 'b'.repeat(24);
function queuedJob(id = jobId) { const input = packetFor(id); return { input, candidate: { story_id: 'wt-test', sources: [] }, status: 'queued', created_at: input.created_at, attempts: {}, intake: { owner, kind: 'opinion_analysis', fingerprint: 'f'.repeat(64) } }; }

test('only queued editorial requests are selected, oldest first, bounded', () => {
  const rows = [
    { input: { job_id: 'wt_20260915T200100Z_' + 'c'.repeat(24), job_type: 'editorial_request' }, status: 'queued', created_at: '2026-09-15T20:01:00Z' },
    { input: { job_id: jobId, job_type: 'editorial_request' }, status: 'queued', created_at: '2026-09-15T20:00:00Z' },
    { input: { job_id: 'wt_20260915T200200Z_' + 'd'.repeat(24), job_type: 'new_story' }, status: 'queued', created_at: '2026-09-15T20:02:00Z' },
    { input: { job_id: 'wt_20260915T200300Z_' + 'e'.repeat(24), job_type: 'editorial_request' }, status: 'accepted', created_at: '2026-09-15T20:03:00Z' },
  ];
  assert.deepEqual(selectEditorialRequests(rows, { limit: 5 }).map((r) => r.input.job_id), [jobId, rows[0].input.job_id]);
  assert.equal(selectEditorialRequests(rows, { limit: 1 }).length, 1);
});

test('a queued request is claimed, drafted with one call, validated and delivered as a private preview', async () => {
  const session = fakeSession([queuedJob()]);
  session.files.set(bridgePath('00_INBOX', `${jobId}.input.json`), JSON.stringify(packetFor(jobId)));
  let calls = 0, seen;
  const draft = async (request) => { calls++; seen = request; return { output: { preview: preview() }, usage: { input_tokens: 5000, output_tokens: 2000 }, model: 'gpt-5.6-luna', cost: 0.0034, answer: '{}' }; };
  const result = await processEditorialRequest(session, { input: { job_id: jobId, job_type: 'editorial_request' }, status: 'queued' }, { knowledge, draft, now });
  assert.equal(result.status, 'output_delivered'); assert.equal(calls, 1);
  assert.equal(seen.kind, 'personal'); assert.equal(seen.instructions, knowledge.instructions); assert.ok(seen.prompt.includes('opinion_analysis'));
  assert.ok(session.files.has(bridgePath('10_CLAIMED', `${jobId}.input.json`)), 'input claimed');
  assert.ok(!session.files.has(bridgePath('00_INBOX', `${jobId}.input.json`)));
  const delivered = JSON.parse(session.files.get(bridgePath('20_OUTPUT_READY', `${jobId}.output.json`)));
  assert.equal(delivered.job_id, jobId); assert.equal(delivered.input_hash, packetFor(jobId).input_hash); assert.equal(delivered.schema_version, '1.0'); assert.equal(delivered.preview.format, 'opinion_analysis');
  assert.equal(session.observations.get(`github-attempt:${jobId}`).status, 'output_delivered');
  assert.ok(session.files.has(bridgePath('95_LOGS', `processor-github-${jobId}.json`)));
  // Second run: no second paid call, nothing rewritten.
  const again = await processEditorialRequest(session, { input: { job_id: jobId, job_type: 'editorial_request' }, status: 'queued' }, { knowledge, draft, now });
  assert.equal(again.status, 'attempt_exhausted'); assert.equal(calls, 1);
});

test('an unusable or invalid answer is recorded once and never paid again; nothing is delivered', async () => {
  const session = fakeSession([queuedJob()]);
  session.files.set(bridgePath('00_INBOX', `${jobId}.input.json`), JSON.stringify(packetFor(jobId)));
  let calls = 0;
  const draft = async () => { calls++; return { output: { preview: { ...preview(), checks: { source_binding: false } } }, usage: { input_tokens: 1, output_tokens: 1 }, model: 'gpt-5.6-luna', cost: 0.001, answer: '{}' }; };
  const result = await processEditorialRequest(session, { input: { job_id: jobId, job_type: 'editorial_request' }, status: 'queued' }, { knowledge, draft, now });
  assert.equal(result.status, 'validation_failed'); assert.equal(calls, 1);
  assert.ok(!session.files.has(bridgePath('20_OUTPUT_READY', `${jobId}.output.json`)));
  assert.equal(session.observations.get(`github-attempt:${jobId}`).status, 'validation_failed');
  const again = await processEditorialRequest(session, { input: { job_id: jobId, job_type: 'editorial_request' }, status: 'queued' }, { knowledge, draft, now });
  assert.equal(again.status, 'attempt_exhausted'); assert.equal(calls, 1);
});

test('the worker holds the import lane, respects the daily cap and releases the lane', async () => {
  const session = fakeSession([queuedJob()]);
  session.files.set(bridgePath('00_INBOX', `${jobId}.input.json`), JSON.stringify(packetFor(jobId)));
  const draft = async () => ({ output: { preview: preview() }, usage: { input_tokens: 1, output_tokens: 1 }, model: 'gpt-5.6-luna', cost: 0.002, answer: '{}' });
  const report = await runRedaktionsworker({ session, knowledge, draft, now, env: { GITHUB_RUN_ID: '7' }, maxJobsPerRun: 2, maxJobsPerDay: 10 });
  assert.equal(report.status, 'ok'); assert.equal(report.results[0].status, 'output_delivered'); assert.equal(report.paid_today, 1);
  assert.deepEqual(session.calls.filter(([k]) => k === 'acquire' || k === 'release'), [['acquire', 'import'], ['release', true]]);
  session.observations.set('github-editorial-day:2026-09-15', { day: '2026-09-15', paid: 10, cost_usd: 1 });
  assert.equal((await runRedaktionsworker({ session, knowledge, draft, now, env: {}, maxJobsPerDay: 10 })).status, 'daily_limit');
  assert.equal((await runRedaktionsworker({ env: {} })).status, 'skipped');
});

test('Meinung-und-Analyse candidates become regular private requests bound to the desk owner, at most once per story', async () => {
  const story = { story_id: 'wt-origin1', title: 'Eine folgenreiche Entscheidung', published: true, listed: true, published_at: '2026-09-15T18:00:00.000Z', current_version: 1, event_id: 'ev-1',
    analysis: { why_relevant: 'Weil sie Regeln verändert.' }, sources: [{ url: 'https://example.org/a' }, { url: 'https://example.org/b' }] };
  const assess = () => ({ candidate: true, evidence_gate: { passed: true }, editorial_analysis_score: 80, analysis_gain_score: 55 });
  assert.equal(selectEditorialCandidates([story], now(), { assess }).length, 1);
  assert.equal(selectEditorialCandidates([{ ...story, published_at: '2026-09-01T00:00:00Z' }], now(), { assess }).length, 0);
  const { job } = buildCandidateRequest(story, assess(), { owner, now: now() });
  assert.match(job.input.job_id, /^wt_\d{8}T\d{6}Z_[a-f0-9]{24}$/); assert.equal(job.input.input_hash, hash(job.input.request)); assert.equal(job.intake.owner, owner);
  assert.equal(job.input.request.author_notes, ''); assert.equal(job.input.request.kind, 'opinion_analysis'); assert.equal(job.status, 'queued');
  const session = fakeSession([queuedJob()]);
  const report = await proposeEditorialCandidates({ session, now: now(), env: {}, stories: [story], assess });
  assert.equal(report.status, 'ok'); assert.equal(report.proposed.length, 1);
  assert.ok(session.files.has(bridgePath('00_INBOX', `${report.proposed[0].job_id}.input.json`)));
  const second = await proposeEditorialCandidates({ session, now: now(), env: {}, stories: [story], assess });
  assert.equal(second.proposed.length, 0, 'same story is never proposed twice');
  assert.equal((await proposeEditorialCandidates({ session: fakeSession([]), now: now(), env: {}, stories: [story], assess })).status, 'owner_unknown');
});

test('the worker workflow uses only contexts that GitHub allows at job level', async () => {
  const fs = await import('node:fs');
  const yaml = fs.readFileSync(new URL('../../.github/workflows/redaktionsworker.yml', import.meta.url), 'utf8');
  const jobEnv = yaml.split('\n    env:\n')[1].split('\n    steps:')[0];
  assert.doesNotMatch(jobEnv, /\$\{\{\s*runner\./, 'runner.* is a step-level context only');
  assert.match(yaml, /OPENAI_API_KEY: \$\{\{ secrets\.WIRKUNGSTICKER \}\}/);
  assert.match(yaml, /node scripts\/news\/redaktionsworker\.mjs/);
  assert.doesNotMatch(yaml, /contents: write/, 'the worker never commits');
});

test('the editorial call carries a bounded web search and a rejected request is not a paid attempt', async () => {
  const bodies = [];
  const answer = JSON.stringify({ preview: preview() });
  const payload = { model: 'gpt-5.6-luna', usage: { input_tokens: 10000, output_tokens: 3000 }, output: [
    { type: 'web_search_call', status: 'completed' }, { type: 'web_search_call', status: 'completed' },
    { type: 'message', role: 'assistant', status: 'completed', content: [{ type: 'output_text', text: answer }] }] };
  const request = { instructions: `Regel A.\n${NO_TOOLS_SENTENCE} URLs allein bedeuten nicht, dass eine Quelle gelesen wurde.\nRegel B.`, prompt: '{"assignment":{}}' };
  const result = await draftEditorialOutput(request, { apiKey: 'test', model: 'gpt-5.6-luna', maxSearches: 4, fetchImpl: async (url, init) => { bodies.push(JSON.parse(init.body)); return { ok: true, status: 200, json: async () => payload }; } });
  assert.deepEqual(bodies[0].tools, [{ type: 'web_search' }]); assert.equal(bodies[0].max_tool_calls, 4); assert.equal(bodies[0].store, false);
  assert.ok(!bodies[0].instructions.includes(NO_TOOLS_SENTENCE)); assert.ok(bodies[0].instructions.includes('höchstens 4 Zugriffe')); assert.ok(bodies[0].instructions.includes('Regel B.'));
  assert.equal(result.web_searches, 2); assert.equal(result.cost, Number((((10000 * 0.2) + (3000 * 1.2)) / 1e6 + 2 * WEB_SEARCH_USD_PER_CALL).toFixed(6)));
  assert.equal(researchInstructions('ohne Satz', 5).startsWith('In diesem Aufruf steht'), true, 'a profile without the sentence still receives the rule');
  const off = await draftEditorialOutput(request, { apiKey: 'test', model: 'gpt-5.6-luna', webSearch: false, fetchImpl: async (url, init) => { bodies.push(JSON.parse(init.body)); return { ok: true, status: 200, json: async () => payload }; } });
  assert.equal('tools' in bodies[1], false); assert.equal(bodies[1].instructions, request.instructions); assert.equal(off.web_searches, 2);
  for (const status of [400, 401, 422, 429]) {
    const error = await draftEditorialOutput(request, { apiKey: 'test', fetchImpl: async () => ({ ok: false, status, json: async () => ({}) }) }).catch((e) => e);
    assert.equal(error.providerNotCalled, true, `${status} produced nothing and is not paid`);
  }
  const server = await draftEditorialOutput(request, { apiKey: 'test', fetchImpl: async () => ({ ok: false, status: 500, json: async () => ({}) }) }).catch((e) => e);
  assert.equal(server.providerNotCalled, false);
});

test('a claim left behind by a decommissioned worker is adopted after the stale window, a fresh one is respected', async () => {
  for (const [age, expected] of [[8, 'output_delivered'], [1, 'claimed_elsewhere']]) {
    const session = fakeSession([queuedJob()]);
    const claimPath = bridgePath('10_CLAIMED', `${jobId}.input.json`);
    session.files.set(claimPath, JSON.stringify(packetFor(jobId)));
    const metadata = session.transport.metadata;
    session.transport.metadata = async (p) => p === claimPath ? { name: p.split('/').at(-1), server_modified: new Date(Date.parse(now()) - age * 3600e3).toISOString() } : metadata(p);
    let calls = 0;
    const draft = async () => { calls++; return { output: { preview: preview() }, usage: { input_tokens: 5000, output_tokens: 2000 }, model: 'gpt-5.6-luna', cost: 0.003, answer: '{}', web_searches: 1 }; };
    const result = await processEditorialRequest(session, { input: { job_id: jobId, job_type: 'editorial_request' }, status: 'queued' }, { knowledge, draft, now });
    assert.equal(result.status, expected, `claim age ${age}h`);
    assert.equal(calls, expected === 'output_delivered' ? 1 : 0);
    if (expected === 'output_delivered') {
      assert.equal(session.observations.get(`github-claim:${jobId}.input.json`).state, 'claimed');
      assert.ok(session.observations.get(`github-claim:${jobId}.input.json`).adopted_stale_claim_from);
      assert.ok(session.files.has(bridgePath('20_OUTPUT_READY', `${jobId}.output.json`)));
      assert.equal(JSON.parse(session.files.get(bridgePath('95_LOGS', `processor-github-${jobId}.json`))).web_searches, 1);
    }
  }
});

test('rows that cost no model call do not use up the paid slots of a run', async () => {
  const delivered = 'wt_20260915T195800Z_' + 'a'.repeat(24), claimed = 'wt_20260915T195900Z_' + 'c'.repeat(24);
  const session = fakeSession([queuedJob(delivered), queuedJob(claimed), queuedJob()]);
  session.files.set(bridgePath('20_OUTPUT_READY', `${delivered}.output.json`), '{}');
  session.files.set(bridgePath('10_CLAIMED', `${claimed}.input.json`), JSON.stringify(packetFor(claimed)));
  session.files.set(bridgePath('00_INBOX', `${jobId}.input.json`), JSON.stringify(packetFor(jobId)));
  const drafted = [];
  const draft = async (request) => { drafted.push(request.job_id); return { output: { preview: preview() }, usage: { input_tokens: 5000, output_tokens: 2000 }, model: 'gpt-5.6-luna', cost: 0.003, answer: '{}' }; };
  const report = await runRedaktionsworker({ session, knowledge, draft, now, env: {}, maxJobsPerRun: 1, maxJobsPerDay: 10 });
  assert.deepEqual(report.results.map((r) => r.status), ['already_delivered', 'claimed_elsewhere', 'output_delivered']);
  assert.deepEqual(drafted, [jobId]); assert.equal(report.paid_this_run, 1); assert.equal(report.paid_today, 1); assert.equal(report.selected, 3);
});
