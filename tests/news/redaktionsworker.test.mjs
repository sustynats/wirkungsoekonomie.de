import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
import { hash, bridgePath } from '../../scripts/news/bridge/contract.mjs';
import { selectEditorialRequests, processEditorialRequest, runRedaktionsworker, draftEditorialOutput, researchInstructions, NO_TOOLS_SENTENCE, WEB_SEARCH_USD_PER_CALL, WORKER_ACTOR, fetchLinkExcerpt, collectSourceExcerpts, normalizeEditorialPreview, supersededCandidates } from '../../scripts/news/redaktionsworker.mjs';
import { buildCandidateRequest, selectEditorialCandidates, proposeEditorialCandidates } from '../../scripts/news/redaktions-kandidaten.mjs';
import { supplementBrief } from '../../scripts/news/editorial-supplement.mjs';

const owner = '123456789012345678';
const knowledge = { hash: 'a'.repeat(64), instructions: 'Synthetische Redaktionsanweisung für den Test.', compatibleHashes: [] };
// Unit tests never reach the network: source excerpts are switched on per test.
process.env.WOEK_EDITORIAL_SOURCE_EXCERPTS = 'false';
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
  // Eine abgewiesene Ausgabe bekommt genau eine Nachlieferung im selben Lauf,
  // danach ist der Auftrag für diese Workerversion verbraucht.
  assert.equal(result.status, 'validation_failed'); assert.equal(calls, 2); assert.equal(result.repair_calls, 1);
  assert.ok(!session.files.has(bridgePath('20_OUTPUT_READY', `${jobId}.output.json`)));
  assert.equal(session.observations.get(`github-attempt:${jobId}`).status, 'validation_failed');
  assert.match(session.observations.get(`github-attempt:${jobId}`).error, /Nachlieferung blieb erfolglos/);
  const again = await processEditorialRequest(session, { input: { job_id: jobId, job_type: 'editorial_request' }, status: 'queued' }, { knowledge, draft, now });
  assert.equal(again.status, 'attempt_exhausted'); assert.equal(calls, 2);
  // Abschaltbar: ohne Nachlieferung bleibt es bei einem Aufruf.
  const plain = fakeSession([queuedJob()]);
  plain.files.set(bridgePath('00_INBOX', `${jobId}.input.json`), JSON.stringify(packetFor(jobId)));
  let single = 0;
  const once = async () => { single++; return { output: { preview: { ...preview(), checks: { source_binding: false } } }, usage: { input_tokens: 1, output_tokens: 1 }, model: 'gpt-5.6-luna', cost: 0.001, answer: '{}' }; };
  const off = await processEditorialRequest(plain, { input: { job_id: jobId, job_type: 'editorial_request' }, status: 'queued' }, { knowledge, draft: once, now, repairPass: false });
  assert.equal(off.status, 'validation_failed'); assert.equal(single, 1); assert.equal(off.repair_calls, 0);
});

test('die Nachlieferung im selben Lauf rettet eine formal abgewiesene Ausgabe', async () => {
  const { editorialRepairAddendum } = await import('../../scripts/news/redaktionsworker.mjs');
  const session = fakeSession([queuedJob()]);
  session.files.set(bridgePath('00_INBOX', `${jobId}.input.json`), JSON.stringify(packetFor(jobId)));
  const prompts = [];
  const draft = async (request) => {
    prompts.push(request.prompt);
    return prompts.length === 1
      ? { output: { preview: { ...preview(), checks: { source_binding: false } } }, usage: { input_tokens: 9000, output_tokens: 3000 }, model: 'gpt-5.6-luna', cost: 0.012, answer: '{}' }
      : { output: { preview: preview() }, usage: { input_tokens: 9500, output_tokens: 3200 }, model: 'gpt-5.6-luna', cost: 0.013, answer: '{}' };
  };
  const result = await processEditorialRequest(session, { input: { job_id: jobId, job_type: 'editorial_request' }, status: 'queued' }, { knowledge, draft, now });
  assert.equal(result.status, 'output_delivered');
  assert.equal(result.repair_calls, 1);
  assert.equal(result.cost_usd, 0.025, 'beide Aufrufe zusammen');
  assert.equal(prompts.length, 2);
  assert.ok(prompts[1].startsWith(prompts[0]), 'die Nachlieferung hängt an denselben Auftrag an');
  assert.ok(prompts[1].includes('NACHLIEFERUNG'));
  assert.match(prompts[1], /Befunde: [A-Z][A-Z_]+/, 'der Befund steht im Klartext dabei');
  assert.ok(session.files.has(bridgePath('20_OUTPUT_READY', `${jobId}.output.json`)));
  assert.equal(session.observations.get(`github-attempt:${jobId}`).repair_calls, 1);
  const addendum = editorialRepairAddendum(['EDITORIAL_MARKDOWN_DUPLICATE_TITLE'], ['markdown:doppelter Titel entfernt']);
  assert.ok(addendum.includes('Bereits automatisch angeglichen: markdown:doppelter Titel entfernt.'));
  assert.ok(addendum.includes('Keine neuen Behauptungen'));
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
  // Seit 17.09.2026 haengt der Vorschlag standardmaessig am staerksten Eintrag
  // der jUengsten Lage (Natalie: „Zu den Top Lagen gibt es dann jeweils eine
  // Meinung&Analyse"). Dieser Test prueft den Weg ohne Bindung, deshalb
  // ausdruecklich restrictTo: null. Die Bindung selbst deckt
  // tests/news/lage-analyse.test.mjs ab.
  const report = await proposeEditorialCandidates({ session, now: now(), env: {}, stories: [story], assess, restrictTo: null });
  assert.equal(report.status, 'ok'); assert.equal(report.proposed.length, 1);
  assert.ok(session.files.has(bridgePath('00_INBOX', `${report.proposed[0].job_id}.input.json`)));
  const second = await proposeEditorialCandidates({ session, now: now(), env: {}, stories: [story], assess, restrictTo: null });
  assert.equal(second.proposed.length, 0, 'same story is never proposed twice');
  assert.equal((await proposeEditorialCandidates({ session: fakeSession([]), now: now(), env: {}, stories: [story], assess, restrictTo: null })).status, 'owner_unknown');
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
  assert.equal('text' in bodies[0], false, 'the provider refuses JSON mode together with web search');
  assert.ok(!bodies[0].instructions.includes(NO_TOOLS_SENTENCE)); assert.ok(bodies[0].instructions.includes('höchstens 4 Zugriffe')); assert.ok(bodies[0].instructions.includes('Regel B.'));
  assert.ok(bodies[0].instructions.includes('bevor Du einen HOLD ausgibst'), 'Suche ist Pflicht vor einem Belege-HOLD');
  assert.equal(result.web_searches, 2); assert.equal(result.cost, Number((((10000 * 0.2) + (3000 * 1.2)) / 1e6 + 2 * WEB_SEARCH_USD_PER_CALL).toFixed(6)));
  assert.equal(researchInstructions('ohne Satz', 5).startsWith('In diesem Aufruf steht'), true, 'a profile without the sentence still receives the rule');
  const off = await draftEditorialOutput(request, { apiKey: 'test', model: 'gpt-5.6-luna', webSearch: false, fetchImpl: async (url, init) => { bodies.push(JSON.parse(init.body)); return { ok: true, status: 200, json: async () => payload }; } });
  assert.equal('tools' in bodies[1], false); assert.equal(bodies[1].instructions, request.instructions); assert.equal(off.web_searches, 2);
  assert.deepEqual(bodies[1].text, { format: { type: 'json_object' } }, 'without the tool JSON mode stays on');
  const fenced = { ...payload, output: [{ type: 'message', role: 'assistant', status: 'completed', content: [{ type: 'output_text', text: '```json\n' + answer + '\n```' }] }] };
  const parsed = await draftEditorialOutput(request, { apiKey: 'test', model: 'gpt-5.6-luna', fetchImpl: async () => ({ ok: true, status: 200, json: async () => fenced }) });
  assert.equal(parsed.output.preview.format, 'opinion_analysis', 'a fenced JSON answer is still read');
  await assert.rejects(draftEditorialOutput(request, { apiKey: 'test', model: 'gpt-5.6-luna', fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({ ...payload, output: [{ type: 'message', role: 'assistant', status: 'completed', content: [{ type: 'output_text', text: 'Hier ist kein JSON.' }] }] }) }) }), /AI_MALFORMED_JSON/);
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

test('a rejected web-search request is retried once with the older tool spelling, and the provider error text is kept', async () => {
  const bodies = [];
  const answer = JSON.stringify({ preview: preview() });
  const ok = { model: 'gpt-5.6-luna', usage: { input_tokens: 1000, output_tokens: 500 }, output: [{ type: 'message', role: 'assistant', status: 'completed', content: [{ type: 'output_text', text: answer }] }] };
  const request = { instructions: 'Regel.', prompt: '{"assignment":{}}' };
  const result = await draftEditorialOutput(request, { apiKey: 'test', model: 'gpt-5.6-luna', maxSearches: 3, fetchImpl: async (url, init) => { const b = JSON.parse(init.body); bodies.push(b); return bodies.length === 1 ? { ok: false, status: 400, json: async () => ({ error: { message: "Invalid value: 'web_search'. Supported values are: 'web_search_preview'." } }) } : { ok: true, status: 200, json: async () => ok }; } });
  assert.equal(bodies.length, 2); assert.deepEqual(bodies[0].tools, [{ type: 'web_search' }]); assert.equal(bodies[0].max_tool_calls, 3);
  assert.deepEqual(bodies[1].tools, [{ type: 'web_search_preview' }]); assert.equal('max_tool_calls' in bodies[1], false); assert.equal(result.web_search_variant, 1);
  let calls = 0;
  const error = await draftEditorialOutput(request, { apiKey: 'test', fetchImpl: async () => { calls += 1; return { ok: false, status: 400, json: async () => ({ error: { message: 'Unknown parameter: tools[0].type sk-secret123' } }) }; } }).catch((e) => e);
  assert.equal(calls, 2); assert.equal(error.providerNotCalled, true); assert.equal(error.detail, 'Unknown parameter: tools[0].type ***');
  calls = 0;
  const plain = await draftEditorialOutput(request, { apiKey: 'test', webSearch: false, fetchImpl: async () => { calls += 1; return { ok: false, status: 400, json: async () => ({ error: { message: 'x' } }) }; } }).catch((e) => e);
  assert.equal(calls, 1, 'without web search a 400 is never retried'); assert.equal(plain.detail, 'x');
  const session = fakeSession([queuedJob()]);
  session.files.set(bridgePath('00_INBOX', `${jobId}.input.json`), JSON.stringify(packetFor(jobId)));
  const out = await processEditorialRequest(session, { input: { job_id: jobId, job_type: 'editorial_request' }, status: 'queued' }, { knowledge, draft: async () => { throw Object.assign(new Error('AI_PROVIDER_ERROR:400'), { providerNotCalled: true, detail: 'Unsupported parameter' }); }, now });
  assert.equal(out.status, 'provider_unavailable'); assert.equal(out.error, 'AI_PROVIDER_ERROR:400 · Unsupported parameter');
  assert.equal(session.observations.get(`github-attempt:${jobId}`).provider_called, false, 'a rejected request stays unpaid and retryable');
});

const page = (text) => ({ ok: true, status: 200, headers: { get: (k) => k.toLowerCase() === 'content-type' ? 'text/html; charset=utf-8' : null }, text: async () => `<html><head><title>Bericht über den Sachverhalt</title></head><body><article><p>${text}</p></article></body></html>` });
test('linked sources travel as fetched excerpts inside the prompt copy while the stored packet stays bound', async () => {
  const session = fakeSession([queuedJob()]);
  const packet = packetFor(jobId);
  session.files.set(bridgePath('00_INBOX', `${jobId}.input.json`), JSON.stringify(packet));
  const links = packet.request.links || [];
  assert.ok(links.length >= 1, 'fixture request carries links');
  const body = 'Der Artikel beschreibt den Sachverhalt ausführlich. '.repeat(12);
  let seen;
  const draft = async (request) => { seen = request; return { output: { preview: preview() }, usage: { input_tokens: 5000, output_tokens: 2000 }, model: 'gpt-5.6-luna', cost: 0.003, answer: '{}', web_searches: 0 }; };
  const result = await processEditorialRequest(session, { input: { job_id: jobId, job_type: 'editorial_request' }, status: 'queued' }, { knowledge, draft, now, excerpts: true, fetchImpl: async () => page(body) });
  assert.equal(result.status, 'output_delivered'); assert.equal(result.source_excerpts, Math.min(links.length, 6));
  assert.ok(seen.prompt.includes('source_excerpts') && seen.prompt.includes('Der Artikel beschreibt den Sachverhalt'), 'excerpt text reaches the model');
  assert.ok(researchInstructions('Regel.', 3).includes('origin.source_excerpts'), 'the tool rule names the excerpts');
  const stored = JSON.parse(session.files.get(bridgePath('10_CLAIMED', `${jobId}.input.json`)));
  assert.equal('source_excerpts' in (stored.origin || {}), false, 'the bound packet is not rewritten');
  assert.equal(stored.input_hash, packet.input_hash);
  const attempt = session.observations.get(`github-attempt:${jobId}`);
  assert.equal(attempt.disposition, 'preview'); assert.equal(attempt.hold_code, null); assert.equal(attempt.source_excerpts, Math.min(links.length, 6));
  assert.equal(await fetchLinkExcerpt('http://example.org/plain'), null, 'only https');
  assert.equal(await fetchLinkExcerpt('https://192.168.1.5/intern'), null, 'no private hosts');
  const pdf = await fetchLinkExcerpt('https://example.org/a.pdf', async () => ({ ok: true, status: 200, headers: { get: () => 'application/pdf' }, text: async () => '' }));
  assert.equal(pdf.excerpt, null);
  const short = await fetchLinkExcerpt('https://example.org/kurz', async () => page('Zu kurz.'));
  assert.equal(short.excerpt, null);
  const down = await collectSourceExcerpts(['https://example.org/x', 'https://example.org/x'], async () => ({ ok: false, status: 503, headers: { get: () => 'text/html' }, text: async () => '' }));
  assert.deepEqual(down.map((e) => e.status), [503], 'each link once');
});

test('the editorial steps wait for a busy import lane instead of skipping the cycle', async () => {
  const session = fakeSession([queuedJob()]);
  session.files.set(bridgePath('00_INBOX', `${jobId}.input.json`), JSON.stringify(packetFor(jobId)));
  let attempts = 0;
  session.store.acquire = async () => { attempts += 1; if (attempts < 3) throw new Error('BRIDGE_RUN_LOCKED'); };
  const report = await runRedaktionsworker({ session, knowledge, draft: async () => ({ output: { preview: preview() }, usage: { input_tokens: 1, output_tokens: 1 }, model: 'gpt-5.6-luna', cost: 0.001, answer: '{}' }), now, env: {}, maxJobsPerRun: 1, maxJobsPerDay: 10, laneWait: { retries: 5, waitMs: 0 }, fetchImpl: async () => page('Text '.repeat(40)) });
  assert.equal(report.status, 'ok'); assert.equal(attempts, 3);
  attempts = 0;
  session.store.acquire = async () => { attempts += 1; throw new Error('BRIDGE_RUN_LOCKED'); };
  const skipped = await runRedaktionsworker({ session, knowledge, draft: async () => { throw new Error('must not draft'); }, now, env: {}, laneWait: { retries: 2, waitMs: 0 } });
  assert.equal(skipped.status, 'skipped'); assert.equal(skipped.reason, 'BRIDGE_RUN_LOCKED'); assert.equal(attempts, 3);
});

test('der Redaktionsvertrag nennt die Felder der Ablage, ohne einen fertigen Text daran scheitern zu lassen', async () => {
  const { validateApiOutput } = await import('../../scripts/news/bridge/api-processor.mjs');
  const { EDITORIAL_REQUEST_CONTRACT_V4 } = await import('../../scripts/news/bridge/intake-processing.mjs');
  const packet = packetFor(jobId);
  const wrap = (preview) => ({ schema_version: '1.0', job_id: jobId, input_hash: packet.input_hash, processed_at: now(), preview });
  const episode = () => ({ ...preview(), format: 'listened',
    sources: [{ url: 'https://neu-denken.example/s6e5', title: 'Folgenseite', publisher: 'Mission Wertvoll' }],
    source_media: { show: 'NEU DENKEN', episode_title: 'Den Westen NEU DENKEN', original_release_date: '2026-09-15', original_url: 'https://neu-denken.example/s6e5' } });
  const episodePacket = { ...packet, request: { ...packet.request, kind: 'listened' } };
  assert.ok(validateApiOutput(wrap(episode()), episodePacket, now()), 'vollständige Folge besteht');
  const schema = EDITORIAL_REQUEST_CONTRACT_V4.output_schema.properties.preview.properties;
  assert.deepEqual(schema.sources.items.required, ['url', 'title'], 'der Verlagsname wird erwartet, aber nicht erzwungen');
  assert.ok('publisher' in schema.sources.items.properties, 'er steht als Feld im Schema');
  for (const key of ['show', 'episode_title', 'original_release_date', 'original_url']) assert.ok(key in schema.source_media.properties, key);
  assert.ok(EDITORIAL_REQUEST_CONTRACT_V4.instructions.some((line) => line.includes('episode_title')), 'die Anweisung nennt die Schlüssel');
  const raw = episode(); delete raw.source_media;
  assert.throws(() => validateApiOutput(wrap(raw), episodePacket, now()), /BRIDGE|EDITORIAL/, 'ohne Sendungsangaben hält die Freigabeprüfung weiterhin');
});

test('kein Test und kein Skript enthält einen absoluten Pfad dieser Maschine', () => {
  // Ein absoluter Pfad lief lokal und scheiterte in der Werkbank; der
  // Nachrichtenlauf stand dadurch 50 Minuten (16.09.). Zugleich dürfen private
  // Pfade ohnehin nicht im Repository stehen.
  const fs = require('node:fs'), path = require('node:path');
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const findings = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      const rel = path.join(dir, entry.name);
      if (entry.isDirectory()) { if (!['node_modules', '.git'].includes(entry.name)) walk(rel); continue; }
      if (!/\.(mjs|js|json|yml|yaml)$/.test(entry.name)) continue;
      const text = fs.readFileSync(path.join(root, rel), 'utf8');
      for (const match of text.matchAll(/(?:\/Users\/[a-z0-9._-]+|\/home\/(?!runner)[a-z0-9._-]+)\/[A-Za-z0-9._/-]*/g)) findings.push(`${rel}: ${match[0].slice(0, 60)}`);
    }
  };
  for (const dir of ['tests/news', 'tests/ops', 'scripts/news', '.github/workflows']) walk(dir);
  assert.deepEqual(findings, [], `absolute Pfade gefunden: ${findings.slice(0, 5).join(' | ')}`);
});

test('eine an unseren Formvorgaben gescheiterte Ablage darf nach der Vertragskorrektur genau einmal nachlaufen', async () => {
  const { WORKER_VERSION } = await import('../../scripts/news/redaktionsworker.mjs');
  const { EDITORIAL_REQUEST_CONTRACT_V4 } = await import('../../scripts/news/bridge/intake-processing.mjs');
  assert.ok(EDITORIAL_REQUEST_CONTRACT_V4.instructions.some((line) => line.includes('beginnt NICHT mit einer Hauptüberschrift')), 'der Vertrag nennt die Formatregel');
  const attemptKey = `github-attempt:${jobId}`;
  const setup = (attempt) => {
    const session = fakeSession([queuedJob()]);
    session.files.set(bridgePath('00_INBOX', `${jobId}.input.json`), JSON.stringify(packetFor(jobId)));
    session.observations.set(attemptKey, attempt);
    return session;
  };
  const draft = async () => ({ output: { preview: preview() }, usage: { input_tokens: 5000, output_tokens: 2000 }, model: 'gpt-5.6-luna', cost: 0.003, answer: '{}' });
  const row = { input: { job_id: jobId, job_type: 'editorial_request' }, status: 'queued' };
  // Alte Version, an der Form gescheitert: ein Nachlauf.
  const fixed = setup({ job_id: jobId, provider_called: true, status: 'validation_failed', version: 'redaktionsworker-4', error: 'EDITORIAL_MARKDOWN_DUPLICATE_TITLE' });
  const retried = await processEditorialRequest(fixed, row, { knowledge, draft, now });
  assert.equal(retried.status, 'output_delivered');
  assert.equal(fixed.observations.get(attemptKey).retried_after_contract_fix, true);
  assert.equal(fixed.observations.get(attemptKey).version, WORKER_VERSION);
  // Derselbe Nachlauf passiert nicht zweimal.
  const again = await processEditorialRequest(setup({ ...fixed.observations.get(attemptKey) }), row, { knowledge, draft: async () => assert.fail('kein zweiter Nachlauf'), now });
  assert.equal(again.status, 'attempt_exhausted');
  // Gleiche Version bleibt verbraucht, und eine inhaltliche Rückfrage ebenso.
  for (const attempt of [{ provider_called: true, status: 'validation_failed', version: WORKER_VERSION },
    { provider_called: true, status: 'output_delivered', version: 'redaktionsworker-4' }]) {
    const done = await processEditorialRequest(setup(attempt), row, { knowledge, draft: async () => assert.fail('kein Nachlauf'), now });
    assert.equal(done.status, 'attempt_exhausted');
  }
});

test('Formales gleicht die Software an: der fertige Entwurf geht nicht an einer Darstellungsregel verloren', async () => {
  const session = fakeSession([queuedJob()]);
  session.files.set(bridgePath('00_INBOX', `${jobId}.input.json`), JSON.stringify(packetFor(jobId)));
  const raw = preview();
  raw.markdown = `# ${raw.title}\n\n${raw.markdown}\n\n# Nachtrag\n\nEin weiterer belegter Abschnitt zum Test der Angleichung.`;
  raw.sources = [{ url: 'https://apnews.com/article/x', title: 'Female athletes accuse' }];
  const result = await processEditorialRequest(session, { input: { job_id: jobId, job_type: 'editorial_request' }, status: 'queued' },
    { knowledge, draft: async () => ({ output: { preview: raw }, usage: { input_tokens: 5000, output_tokens: 2000 }, model: 'gpt-5.6-luna', cost: 0.003, answer: '{}' }), now });
  assert.equal(result.status, 'output_delivered', 'der Entwurf wird abgelegt statt verworfen');
  assert.deepEqual(result.preview_repairs, ['markdown:doppelter Titel entfernt', 'markdown:Hauptüberschrift zur Abschnittsebene', 'sources:publisher aus der Adresse (The Associated Press)']);
  const delivered = JSON.parse(session.files.get(bridgePath('20_OUTPUT_READY', `${jobId}.output.json`)));
  assert.equal(delivered.preview.markdown.startsWith('## '), true);
  assert.equal(/^# /m.test(delivered.preview.markdown), false, 'keine Hauptüberschrift mehr im Text');
  assert.ok(delivered.preview.markdown.includes('## Nachtrag'), 'die zweite Überschrift bleibt als Abschnitt');
  assert.equal(delivered.preview.sources[0].publisher, 'The Associated Press');
  assert.equal(JSON.parse(session.files.get(bridgePath('95_LOGS', `processor-github-${jobId}.json`))).preview_repairs.length, 3);
});

test('die Angleichung berührt nur Mechanisches und erfindet nichts', () => {
  const repairs = [];
  const clean = { format: 'opinion_analysis', title: 'Ein Titel', markdown: '## Abschnitt\n\nText.', sources: [{ url: 'https://beispiel.de/a', title: 'A', publisher: 'Beispiel' }] };
  const before = structuredClone(clean);
  normalizeEditorialPreview(clean, { links: [], repairs });
  assert.deepEqual(clean, before); assert.deepEqual(repairs, [], 'ein sauberer Entwurf wird nicht angefasst');
  const media = { format: 'watched', title: 'Nachgesehen: X', markdown: '## A\n\nText.', sources: [{ url: 'https://www.zdf.de/a', title: 'A', publisher: 'ZDF' }],
    source_media: { show_name: 'Markus Lanz', episode: 'Folge vom 15. September', published_at: '2026-09-15T20:45:00.000Z' } };
  const mediaRepairs = [];
  normalizeEditorialPreview(media, { links: ['https://cdn.example/lanz.mp4', 'https://www.zdf.de/video/talk/lanz-99'], repairs: mediaRepairs });
  assert.equal(media.source_media.show, 'Markus Lanz'); assert.equal(media.source_media.episode_title, 'Folge vom 15. September');
  assert.equal(media.source_media.original_release_date, '2026-09-15');
  assert.equal(media.source_media.original_url, 'https://www.zdf.de/video/talk/lanz-99', 'die Mediendatei ist nicht die Sendungsseite');
  assert.equal(mediaRepairs.length, 5);
  const missing = { format: 'opinion_analysis', title: 'T', markdown: '## A\n\nText.', sources: [{ url: 'nichts', title: 'A' }], checks: {} };
  const missingRepairs = [];
  normalizeEditorialPreview(missing, { links: [], repairs: missingRepairs });
  assert.equal(missing.sources[0].publisher, undefined, 'ohne gültige Adresse wird kein Verlag erfunden');
  assert.deepEqual(missing.checks, {}, 'Prüfvermerke werden nie gesetzt');
  assert.deepEqual(missingRepairs, []);
});
test('eine Nachlieferung trägt den früheren Auftrag samt bisheriger Fassung und der frühere läuft nicht mehr allein', async () => {
  const original = queuedJob();
  const supplementId = 'wt_20260916T090000Z_' + 'a'.repeat(24);
  const supplementInput = packetFor(supplementId);
  supplementInput.request = { ...supplementInput.request, brief: supplementBrief(jobId, 'Zusatz: die politische Ebene als Wirkungsanalyse.'), links: ['https://example.org/zusatz'] };
  supplementInput.input_hash = hash(supplementInput.request);
  const supplementJob = { input: supplementInput, status: 'queued', created_at: '2026-09-16T09:00:00.000Z', intake: { owner, kind: 'opinion_analysis', fingerprint: 'a'.repeat(64) } };
  const session = fakeSession([original, supplementJob]);
  // Die bisher gelieferte Fassung des früheren Auftrags liegt in der Ablage.
  session.files.set(bridgePath('20_OUTPUT_READY', `${jobId}.output.json`), JSON.stringify({ preview: { ...preview(), title: 'Erste Fassung' } }));
  session.files.set(bridgePath('00_INBOX', `${supplementId}.input.json`), JSON.stringify(supplementInput));
  let seen = null;
  const draft = async (request) => { seen = request; return { output: { preview: preview() }, model: 'gpt-5.6-luna', usage: { input_tokens: 10, output_tokens: 10 }, cost: 0.01, answer: '{}' }; };
  const result = await processEditorialRequest(session, { input: { job_id: supplementId, job_type: 'editorial_request' }, status: 'queued' }, { knowledge, draft, now: () => '2026-09-16T09:05:00.000Z' });
  assert.equal(result.status, 'output_delivered');
  assert.equal(result.supplement_of, jobId);
  assert.equal(result.supplement_previous_version, true);
  const sent = JSON.stringify(seen);
  assert.ok(sent.includes('Zusatz: die politische Ebene'), 'der Zusatz ist der Auftrag');
  assert.ok(!sent.includes('Nachlieferung zu Auftrag'), 'die technische Bindung steht nicht im Auftragstext');
  assert.ok(sent.includes('Bitte diesen synthetischen Testfall vorbereiten'), 'der frühere Auftrag liegt als Material bei');
  assert.ok(sent.includes('Erste Fassung'), 'die bisherige Fassung liegt als Material bei');
  assert.ok(sent.includes('https://example.org/zusatz') && sent.includes('https://example.org/source'), 'beide Linkbestände');
  // Das abgelegte Paket bleibt unberührt.
  assert.equal(JSON.parse(session.files.get(bridgePath('10_CLAIMED', `${supplementId}.input.json`))).input_hash, supplementInput.input_hash);
  // Der frühere Auftrag läuft nicht mehr allein.
  const rows = await session.store.all();
  const superseded = await supersededCandidates(session, selectEditorialRequests(rows, { limit: 10 }));
  assert.deepEqual([...superseded], [jobId]);
});

test('eine Nachlieferung auf eine unbekannte Kennung bleibt ein gewöhnlicher Auftrag', async () => {
  const strayId = 'wt_20260916T093000Z_' + 'c'.repeat(24);
  const input = packetFor(strayId);
  input.request = { ...input.request, brief: supplementBrief('wt_20200101T000000Z_' + '9'.repeat(24), 'Zusatz ohne Ziel.') };
  input.input_hash = hash(input.request);
  const session = fakeSession([{ input, status: 'queued', created_at: '2026-09-16T09:30:00.000Z', intake: { owner, kind: 'opinion_analysis', fingerprint: 'c'.repeat(64) } }]);
  session.files.set(bridgePath('00_INBOX', `${strayId}.input.json`), JSON.stringify(input));
  let seen = null;
  const draft = async (request) => { seen = request; return { output: { preview: preview() }, model: 'gpt-5.6-luna', usage: { input_tokens: 10, output_tokens: 10 }, cost: 0.01, answer: '{}' }; };
  const result = await processEditorialRequest(session, { input: { job_id: strayId, job_type: 'editorial_request' }, status: 'queued' }, { knowledge, draft, now: () => '2026-09-16T09:35:00.000Z' });
  assert.equal(result.status, 'output_delivered');
  assert.equal('supplement_of' in result, false);
  assert.ok(JSON.stringify(seen).includes('Zusatz ohne Ziel'));
});

test('kein Auftrag bleibt liegen: jeder Versuch ohne Ergebnis läuft nach einer Korrektur genau einmal je Version nach', async () => {
  const { WORKER_VERSION } = await import('../../scripts/news/redaktionsworker.mjs');
  const attemptKey = `github-attempt:${jobId}`;
  const setup = (attempt) => {
    const session = fakeSession([queuedJob()]);
    session.files.set(bridgePath('00_INBOX', `${jobId}.input.json`), JSON.stringify(packetFor(jobId)));
    session.observations.set(attemptKey, { job_id: jobId, provider_called: true, ...attempt });
    return session;
  };
  const draft = async () => ({ output: { preview: preview() }, usage: { input_tokens: 5000, output_tokens: 2000 }, model: 'gpt-5.6-luna', cost: 0.003, answer: '{}' });
  const row = { input: { job_id: jobId, job_type: 'editorial_request' }, status: 'queued' };
  // 16.09.: drei Aufträge standen auf „Versuch verbraucht, nichts geliefert",
  // einer seit dem 13.09. Jede dieser Ursachen ist technisch oder formal.
  for (const status of ['validation_failed', 'output_unusable', 'started']) {
    const session = setup({ status, version: 'redaktionsworker-4' });
    const retried = await processEditorialRequest(session, row, { knowledge, draft, now });
    assert.equal(retried.status, 'output_delivered', status);
    assert.equal(session.observations.get(attemptKey).retried_for_version, WORKER_VERSION);
  }
  // Ein Altvermerk ohne Versionsangabe gilt ebenfalls als ältere Version.
  const legacy = setup({ status: 'output_unusable' });
  assert.equal((await processEditorialRequest(legacy, row, { knowledge, draft, now })).status, 'output_delivered');
  // Ein geliefertes Ergebnis ist ein Ergebnis, auch als begründeter HOLD.
  const delivered = setup({ status: 'output_delivered', disposition: 'hold', version: 'redaktionsworker-4' });
  assert.equal((await processEditorialRequest(delivered, row, { knowledge, draft: async () => assert.fail('kein Nachlauf nach geliefertem Ergebnis'), now })).status, 'attempt_exhausted');
  // Pro Version genau ein Nachlauf, auch wenn dieser wieder scheitert.
  const twice = setup({ status: 'validation_failed', version: 'redaktionsworker-4', retried_for_version: WORKER_VERSION });
  assert.equal((await processEditorialRequest(twice, row, { knowledge, draft: async () => assert.fail('kein zweiter Nachlauf je Version'), now })).status, 'attempt_exhausted');
});

test('ein Bild ohne belegte Freigabe wird entfernt statt den Entwurf zu verwerfen', async () => {
  const { clearedVisual, VISUAL_RIGHTS } = await import('../../scripts/news/redaktionsworker.mjs');
  const cleared = { url: 'https://wirkungsoekonomie.de/assets/img/news/eigen.png', alt: 'Eigenes Motiv', credit: 'Wirkungsökonomie', rights_status: 'OWN', allow_website: true };
  assert.equal(clearedVisual(cleared), true);
  for (const broken of [{ url: 'https://example.org/fremd.jpg' }, { allow_website: false }, { rights_status: 'UNKNOWN' }, { alt: '' }, { credit: ' ' }, { expires_at: '2020-01-01T00:00:00.000Z' }, { url: '' }])
    assert.equal(clearedVisual({ ...cleared, ...broken }), false, JSON.stringify(broken));
  assert.ok(VISUAL_RIGHTS.includes('CC_LICENSED'));
  // Der Entwurf bleibt vollständig, nur der Bildverweis fällt weg.
  const draftPreview = { ...preview(), visual: { url: 'https://example.org/erfunden.jpg', alt: 'x', credit: 'y', rights_status: 'OWN', allow_website: true } };
  const repairs = [];
  normalizeEditorialPreview(draftPreview, { links: [], repairs });
  assert.equal(draftPreview.visual, null);
  assert.deepEqual(repairs, ['visual:ohne belegte Freigabe entfernt']);
  assert.equal(draftPreview.markdown, preview().markdown, 'am Text ändert sich nichts');
  // Ein freigegebenes Bild bleibt unangetastet.
  const keep = { ...preview(), visual: { ...cleared } };
  const kept = [];
  normalizeEditorialPreview(keep, { links: [], repairs: kept });
  assert.deepEqual(keep.visual, cleared);
  assert.deepEqual(kept, []);
  // Und die Ablage nimmt den angeglichenen Entwurf an.
  const session = fakeSession([queuedJob()]);
  session.files.set(bridgePath('00_INBOX', `${jobId}.input.json`), JSON.stringify(packetFor(jobId)));
  const draft = async () => ({ output: { preview: { ...preview(), visual: { url: 'https://example.org/erfunden.jpg', alt: 'x', credit: 'y', rights_status: 'OWN', allow_website: true } } },
    usage: { input_tokens: 5000, output_tokens: 2000 }, model: 'gpt-5.6-luna', cost: 0.004, answer: '{}' });
  const result = await processEditorialRequest(session, { input: { job_id: jobId, job_type: 'editorial_request' }, status: 'queued' }, { knowledge, draft, now });
  assert.equal(result.status, 'output_delivered');
  assert.deepEqual(result.preview_repairs, ['visual:ohne belegte Freigabe entfernt']);
});

// 16.09.: Vier veröffentlichte Ausgaben trugen den Satz "Vorschlag zur
// Bestätigung durch Natalie" im Lesertext - eine Werkstattnotiz, die auf der
// fertigen Seite nicht nur störte, sondern falsch war: freigegeben war sie da.
test('der Freigabevorbehalt bleibt im Entwurf und nicht im veröffentlichten Text', async () => {
  const { withoutProcessNotes } = await import('../../scripts/news/editorial-markdown.mjs');
  const repairs = [];
  const preview = normalizeEditorialPreview({
    title: 'Der Westen als Streitbegriff', format: 'listened',
    markdown: ['Ein Begriff, drei Bedeutungen.', '',
      'Der Beitrag ist ein Vorschlag zur abschließenden Bestätigung durch Natalie. Die Aussagen des Podcasts und die Wirkungsanalyse bleiben getrennt.', '',
      '## Meine Einordnung', '', '**Vorschlag zur Bestätigung durch Natalie:**', '',
      'An diesem Gespräch ist die Entscheidung interessant, den Begriff nicht mehr selbstverständlich zu nehmen.'].join('\n'),
  }, { repairs });
  assert.ok(!/Bestätigung durch Natalie/.test(preview.markdown), 'der Vorbehalt steht nicht im Text');
  assert.ok(/Die Aussagen des Podcasts und die Wirkungsanalyse bleiben getrennt\./.test(preview.markdown), 'der Transparenzhinweis im selben Absatz bleibt');
  assert.ok(/## Meine Einordnung/.test(preview.markdown) && /An diesem Gespräch/.test(preview.markdown), 'Abschnitt und Inhalt bleiben');
  assert.ok(!/\n\n\n/.test(preview.markdown), 'keine Lücke, wo die Zeile stand');
  assert.equal(repairs.filter((r) => /Freigabevermerk entfernt/.test(r)).length, 2, 'beide Fundstellen werden protokolliert');

  // Eine Überschrift trägt den Vorbehalt genauso wie eine fette Zeile.
  assert.equal(withoutProcessNotes('## Meine Einordnung\n\n### Vorschlag zur Bestätigung durch Natalie\n\nMich überzeugt die Unterscheidung.'),
    '## Meine Einordnung\n\nMich überzeugt die Unterscheidung.');
  // Ein Satz am Absatzende geht, der Absatz bleibt.
  assert.equal(withoutProcessNotes('Mein Urteil steht. Dieser Abschnitt ist ein Vorschlag zur abschließenden Bestätigung durch Natalie Weber.'),
    'Mein Urteil steht.');
  // Text ohne Vorbehalt wird nicht angefasst - auch nicht in Formatierung.
  const untouched = '## Meine Einordnung\n\nNatalie Weber hört jede Folge selbst.\n\n- Ein Punkt\n- Noch einer';
  assert.equal(withoutProcessNotes(untouched), untouched);

  // Eine Korrekturfassung muss ihren Patch mitführen, sonst verwirft die Ablage
  // den Entwurf an patch.body_markdown !== preview.markdown.
  const revised = normalizeEditorialPreview({
    title: 'Fassung 2', format: 'listened',
    markdown: '## Meine Einordnung\n\n**Vorschlag zur Bestätigung durch Natalie**\n\nKorrigierte Einordnung.',
    editorial_revision: { patch: { body_markdown: '## Meine Einordnung\n\n**Vorschlag zur Bestätigung durch Natalie**\n\nKorrigierte Einordnung.', correction_note: 'Zahl berichtigt.' } },
  });
  assert.equal(revised.editorial_revision.patch.body_markdown, revised.markdown, 'Patch und Vorschau bleiben deckungsgleich');
});

// 17.09.2026: Ein Auftrag in der Ablage ohne Paket im Postfach nahm den ganzen
// Lauf mit - processEditorialRequest brach mit BRIDGE_DROPBOX_NOT_FOUND ab, und
// damit lag anderthalb Stunden auch die automatische Spur. Zwei Lehren: der
// Lauf legt fehlende Pakete selbst nach, und ein einzelner kaputter Auftrag
// darf die anderen nicht mitnehmen.
test('der Lauf legt fehlende Pakete nach und ueberlebt einen kaputten Auftrag', async () => {
  const fs = await import('node:fs');
  const quelle = fs.readFileSync('scripts/news/redaktionsworker.mjs', 'utf8');
  // Die Reparatur laeuft im Lauf, der die Auftraege zieht.
  assert.match(quelle, /import \{ repairMissingPackets \} from '\.\/auftrag-einreichen\.mjs'/);
  const reparatur = quelle.indexOf('await repairMissingPackets(live, rows, now())');
  assert.ok(reparatur > 0, 'die Reparatur wird aufgerufen');
  assert.ok(reparatur < quelle.indexOf('const superseded'), 'bevor Auftraege gezogen werden');
  // Ein Fehlschlag je Auftrag wird gefangen und protokolliert, nicht geworfen.
  const schleife = quelle.slice(quelle.indexOf('for (const row of candidates)'), quelle.indexOf('if (PAID_STATUS.has(result.status))'));
  assert.match(schleife, /try \{ result = await processEditorialRequest/, 'der Aufruf ist abgesichert');
  assert.match(schleife, /status: 'request_failed'/, 'der Fehlschlag wird als Ergebnis geführt');
  assert.match(schleife, /github-editorial-failure:/, 'und vermerkt');
  assert.ok(!/throw/.test(schleife), 'und nicht weitergeworfen');
  assert.match(quelle, /repaired_packets: repairedPackets/, 'der Bericht nennt nachgelegte Pakete');
});
