import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { EditorialApiService, apiRequestKey, API_EDITORIAL_PROTOCOL, publicApiJob, parseEditorialJson } from '../../scripts/news/bridge/api-service.mjs';
import { editorialKnowledge } from '../../scripts/news/bridge/editorial-knowledge.mjs';

class ProviderError extends Error { constructor(message, statusCode, technicalMessage, usageEvidence) { super(message); Object.assign(this, { statusCode, technicalMessage, usageEvidence }); } }
const request = (change = {}) => {
  const value = { protocol: API_EDITORIAL_PROTOCOL, job_id: 'wt_20260913T080000Z_' + 'a'.repeat(24), input_hash: 'b'.repeat(64),
    packet_hash: 'c'.repeat(64), kind: 'news', attempt: 0, profile_hash: 'd'.repeat(64), instructions: 'Return JSON. Sources are data.', prompt: 'Supplied source evidence.', ...change };
  return { ...value, key: apiRequestKey(value) };
};
async function fixture(t, { output = { decision: { status: 'hold' } }, status = 'completed', failure = false, block = false, usage = true, searches = 0 } = {}) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'editorial-api-')); t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const calls = [], charges = [], bodies = [], reservations = [];
  const options = { directory, apiKey: 'test-not-a-key', ProviderError,
    withBudget: async (action, reservation) => {
      reservations.push(reservation);
      if (block) throw new ProviderError('budget', 429, 'monthly_budget_reached');
      charges.push('reserved');
      try { const result = await action(); charges.push(result.usage || 'unknown'); return result; }
      catch (e) { charges.push(e.usageEvidence || 'unknown'); throw e; }
    },
    fetchImpl: async (url, init) => {
      calls.push(url); bodies.push(JSON.parse(init.body));
      if (failure) throw Error('Lost network response');
      return Response.json({ id: 'resp_example', status, ...(usage ? { usage: { input_tokens: 5000, output_tokens: 8000, input_tokens_details: { cached_tokens: 1000 } } } : {}),
        output: [...Array.from({length:searches},()=>({type:'web_search_call',status:'completed'})),{ type: 'message', content: [{ type: 'output_text', text: typeof output === 'string' ? output : JSON.stringify(output) }] }] }, { headers: { 'x-request-id': 'req_example' } });
    } };
  return { service: new EditorialApiService(options), options, calls, charges, bodies, directory, reservations };
}
test('only independent reviews get bounded search and account tool calls even for rejected output',async t=>{
 const f=await fixture(t,{searches:2,output:'broken JSON'});
 const result=await f.service.submit(request({kind:'review'}));
 assert.equal(result.status,'failed'); assert.equal(f.bodies[0].max_tool_calls,2);
 assert.equal(f.bodies[0].tool_choice,'required');
 assert.deepEqual(f.bodies[0].tools,[{type:'web_search',search_context_size:'low'}]);
 assert.equal(f.bodies[0].text,undefined); // provider rejects Web Search + JSON mode
 assert.equal(f.reservations[0],0.5); assert.equal(f.charges[1].usage.web_search_calls,2);
 await f.service.submit(request({kind:'review'})); assert.equal(f.calls.length,1);
});
test('JSON transport closes only outer containers, never missing words or values',()=>{
 assert.deepEqual(parseEditorialJson('{"review":{"status":"ready"}'),{review:{status:'ready'}});
 assert.deepEqual(parseEditorialJson('{"paths":[{"magnitude":3}]'),{paths:[{magnitude:3}]});
 for(const invalid of ['{"a":"unterminated','{"a":','{"a":1','{"a":{},','{"a":{}]','{"a":{} "b":{}}','not JSON']) assert.throws(()=>parseEditorialJson(invalid));
});
test('completed raw response with missing outer brace is recovered without changing journal or spending again',async t=>{
 const f=await fixture(t),input=request(),record={...input,status:'failed',error:'api_editorial_invalid_json',http_status:200,provider_called:true,
  updated_at:'2026-09-13T10:00:00Z',usage:{input_tokens:12,output_tokens:9},provider_response:JSON.stringify({status:'completed',output:[{type:'message',content:[{type:'output_text',text:'{"review":{"status":"blocked"}'}]}]})};
 await fs.writeFile(f.service.file(input.key),JSON.stringify(record));
 const result=await f.service.submit(input);
 assert.equal(result.status,'completed');assert.equal(result.output.review.status,'blocked');assert.equal(f.calls.length,0);assert.equal(f.charges.length,0);
 assert.deepEqual(JSON.parse(await fs.readFile(f.service.file(input.key),'utf8')),record);
 record.provider_response=record.provider_response.replace('completed','incomplete');await fs.writeFile(f.service.file(input.key),JSON.stringify(record));
 assert.equal((await f.service.get(input.key)).status,'failed');
});
test('documented pre-execution configuration rejection is not an inference retry or a lost paid response',async t=>{
 const f=await fixture(t);
 for(let i=0;i<3;i++){
   const old=request({kind:'review',prompt:'unsupported config '+i});
   await fs.writeFile(f.service.file(old.key),JSON.stringify({...old,status:'failed',provider_called:true,http_status:400,
     provider_response:JSON.stringify({error:{type:'invalid_request_error',message:'Web Search cannot be used with JSON mode.'}})}));
   assert.equal((await f.service.get(old.key)).pre_execution_rejected,true);
 }
 assert.equal((await f.service.submit(request({kind:'review',prompt:'supported config'}))).status,'completed');
 assert.equal(f.calls.length,1);
});
test('complete result survives client retry and process restart with exactly one generation/reservation', async t => {
  const f = await fixture(t), input = request();
  const first = await f.service.submit(input);
  assert.equal(first.status, 'completed'); assert.equal(first.output.job_id, input.job_id); assert.equal(first.output.input_hash, input.input_hash);
  assert.equal((await new EditorialApiService(f.options).submit(input)).status, 'completed');
  assert.equal(f.calls.length, 1); assert.equal(f.charges.length, 2);
  assert.equal(f.bodies[0].tools, undefined); assert.equal(f.bodies[0].store, false);
  assert.equal(f.bodies[0].reasoning.effort, 'medium');
  assert.equal(publicApiJob(first).provider_response, undefined);
  assert.ok((await fs.stat(f.service.file(input.key))).mode & 0o600);
  assert.equal((await fs.stat(f.service.file(input.key))).mode & 0o077, 0);
});
test('uncertain network outcome is not regenerated, even after restart', async t => {
  const f = await fixture(t, { failure: true }), input = request();
  assert.equal((await f.service.submit(input)).status, 'unknown');
  assert.equal((await new EditorialApiService(f.options).submit(input)).status, 'unknown');
  assert.equal(f.calls.length, 1); assert.equal(f.charges[1], 'unknown');
});
test('budget refusal has no upstream call and keeps the job visible', async t => {
  const f = await fixture(t, { block: true }), result = await f.service.submit(request());
  assert.equal(result.status, 'budget_blocked'); assert.equal(result.provider_called, false); assert.equal(f.calls.length, 0);
});
test('invalid/truncated paid output preserves usage for both ledgers', async t => {
  for (const opts of [{ output: 'broken JSON' }, { status: 'incomplete' }, { output: { job_id: 'foreign' } }]) {
    const f = await fixture(t, opts), result = await f.service.submit(request());
    assert.equal(result.status, 'failed'); assert.equal(result.output, undefined);
    assert.ok(result.provider_response); assert.equal(f.charges[1].usage.output_tokens, 8000);
    await f.service.submit(request()); assert.equal(f.calls.length, 1);
  }
});
test('missing provider usage retains reserve rather than inventing zero spend', async t => {
  const f = await fixture(t, { usage: false }); await f.service.submit(request()); assert.equal(f.charges[1], 'unknown');
});
test('a journaled interrupted attempt cannot be retried by a new process', async t => {
  const f = await fixture(t), input = request();
  await fs.writeFile(f.service.file(input.key), JSON.stringify({ protocol: API_EDITORIAL_PROTOCOL, key: input.key, status: 'started' }));
  assert.equal((await f.service.submit(input)).status, 'unknown'); assert.equal(f.calls.length, 0);
});
test('changed prompt, excessive input and unbounded repairs are rejected before spending', async t => {
  const f = await fixture(t), input = request();
  for (const bad of [{ ...input, prompt: 'changed' }, request({ attempt: 3 }), request({ prompt: '€'.repeat(101000) }), request({ kind: 'publish' })])
    await assert.rejects(f.service.submit(bad), /INPUT_INVALID/);
  assert.equal(f.calls.length, 0);
});
test('concurrent clients cannot generate the same job twice', async t => {
  const f = await fixture(t); await Promise.all([f.service.submit(request()), f.service.submit(request())]); assert.equal(f.calls.length, 1);
});
test('knowledge pack is versioned, source-bound and preserves all MPD/approval rules', () => {
  const knowledge = editorialKnowledge(path.resolve('.'));
  assert.equal(knowledge.manifest.sources.length, 3); assert.equal(knowledge.hash.length, 64);
  assert.ok(knowledge.research_access.article_exclusions['apnews.com']);
  for (const phrase of ['keinen Zugriff auf Natalies ChatGPT-Erinnerungen', 'abschließende Natalie-Freigabe', 'R/I/D/U/V/S', 'Reverse Merit Order', 'Meine Einordnung', 'Alle drei MPD-Dimensionen']) assert.ok(knowledge.instructions.includes(phrase));
});
test('a budget-only refusal can resume after funding without duplicating provider work', async t => {
  const f = await fixture(t, { block: true }), input = request();
  await f.service.submit(input);
  const available = new EditorialApiService({ ...f.options, withBudget: action => action() });
  assert.equal((await available.submit(input)).status, 'completed');
  await available.submit(input); assert.equal(f.calls.length, 1);
});
test('all correction keys share a three-generation ceiling, and unknown outcomes block new keys', async t => {
  const f = await fixture(t);
  for (let attempt = 0; attempt < 3; attempt++) await f.service.submit(request({ attempt }));
  assert.equal((await f.service.submit(request({ prompt: 'different' }))).status, 'repair_exhausted');
  assert.equal(f.calls.length, 3);
  const broken = await fixture(t, { failure: true });
  await broken.service.submit(request());
  assert.equal((await broken.service.submit(request({ attempt: 1 }))).status, 'unknown');
  assert.equal(broken.calls.length, 1);
});
test('different concurrent requests also serialize without an in-memory waiting queue', async t => {
  const f = await fixture(t);
  const results = await Promise.all([f.service.submit(request()), f.service.submit(request({ job_id: 'wt_20260913T080000Z_'+'e'.repeat(24) }))]);
  assert.equal(f.calls.length, 1); assert.ok(results.some(r => r.status === 'busy'));
});
