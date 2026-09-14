import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiEditorialProcessor, prepareApiJob, selectApiJobs, apiProcessorPreflight } from '../../scripts/news/bridge/api-processor.mjs';
import { bridgePath, outputSchema } from '../../scripts/news/bridge/contract.mjs';
import { preparedNewsPrompt } from './fixtures/api-news-input.mjs';
import { NEWS_INPUT_READINESS_VERSION } from '../../scripts/news/news-input-readiness.mjs';
const now = '2026-09-13T10:00:00Z';
const id = 'wt_20260913T093000Z_' + 'a'.repeat(24);
const input = { job_id: id, input_hash: 'b'.repeat(64), created_at: '2026-09-13T09:30:00Z', job_type: 'new_story', sources: [{ published_at: '2026-09-13T09:30:00Z' }], wirkungsticker:{story_id:'test-news',analysis_prompt:preparedNewsPrompt()} };
const knowledge = { hash: 'c'.repeat(64), instructions: 'Quellen und WÖk prüfen. Vollständiges JSON.' };
function shape(schema) {
  if ('const' in schema) return schema.const;
  if (schema.enum) return schema.enum[0];
  const type = [].concat(schema.type)[0];
  if (type === 'array') return [];
  if (type === 'boolean') return false;
  if (type === 'integer' || type === 'number') return schema.minimum || 0;
  if (type === 'object') return Object.fromEntries((schema.required || []).map(key => [key, shape(schema.properties[key])]));
  return 'Fachlich begründeter Befund';
}
function fixture() {
  const files = new Map([[bridgePath('00_INBOX', id + '.input.json'), JSON.stringify(input)]]), observations = new Map();
  const job = { status: 'queued', input: structuredClone(input), candidate: { sources: input.sources } };
  const output = { ...shape(outputSchema), schema_version: '1.0', job_id: id, input_hash: input.input_hash, processed_at: now,
    decision: { status: 'hold', reason: 'Konkrete Quelle fehlt zur geprüften Nachricht.', merge_into: null, priority: 50 } };
  const calls = [];
  const store = { get: () => job, observation: key => observations.get(key), observe: (key, value) => observations.set(key, value) };
  const transport = { list: async () => [], metadata: async p => files.has(p) ? { name: p.split('/').at(-1) } : null,
    read: async p => { if (!files.has(p)) throw Error('NOT_FOUND'); return files.get(p); },
    move: async (a, b) => { if (files.has(b)) throw Error('CONFLICT'); files.set(b, files.get(a)); files.delete(a); },
    writeAtomic: async (p, v) => { const value = JSON.stringify(v); if (files.has(p)) assert.equal(files.get(p), value); files.set(p, value); } };
  const results = new Map();
  const api = { health: async () => ({ protocol: 'woek-editorial-api-1', enabled: true, budget_guards: true, execution_policy: {max_paid_attempts_per_job:1,automatic_rewrites:false,input_readiness_version:NEWS_INPUT_READINESS_VERSION} }),
    get: async key => results.get(key), submit: async req => { calls.push(req); const result = { status: 'completed', output }; results.set(req.key, result); return result; } };
  const processor = new ApiEditorialProcessor({ store, transport, api, knowledge, now: () => now });
  return { job, files, observations, calls, output, api, transport, processor };
}
test('Oracle preflight is a distinct real read/write proof, not a ChatGPT attestation', async () => {
  const f = fixture(), receipt = await apiProcessorPreflight(f.transport, f.api, now);
  assert.equal(receipt.actor, 'oracle_api'); assert.equal(receipt.status, 'PASS'); assert.equal(receipt.write_ok, true);
  assert.equal(f.calls.length, 0);
});
test('a worker refuses an old or unverified retry policy before touching Dropbox', async () => {
  for (const policy of [undefined, {max_paid_attempts_per_job:3,automatic_rewrites:false}, {max_paid_attempts_per_job:1,automatic_rewrites:true}, {max_paid_attempts_per_job:1,automatic_rewrites:false}]) {
    const f=fixture(), before=[...f.files];
    f.api.health=async()=>({protocol:'woek-editorial-api-1',enabled:true,budget_guards:true,execution_policy:policy});
    await assert.rejects(apiProcessorPreflight(f.transport,f.api,now),/EXECUTION_POLICY_UNAVAILABLE/);
    assert.deepEqual([...f.files],before);assert.equal(f.calls.length,0);
  }
});
test('native output is delivered atomically once, never called a publication', async () => {
  const f = fixture(), receipt = await apiProcessorPreflight(f.transport, f.api, now);
  assert.equal((await f.processor.process(f.job, receipt)).status, 'output_delivered');
  assert.equal((await f.processor.process(f.job, receipt)).status, 'already_delivered');
  assert.equal(f.calls.length, 1); assert.equal(f.job.accepted, undefined); assert.equal(f.job.ack, undefined);
  assert.ok(f.files.has(bridgePath('20_OUTPUT_READY', id + '.output.json')));
});
test('unfinished source preparation neither claims nor submits a news job',async()=>{
 const f=fixture();f.job.input.wirkungsticker.analysis_prompt='A headline without sources';
 f.files.set(bridgePath('00_INBOX',id+'.input.json'),JSON.stringify(f.job.input));
 const result=await f.processor.process(f.job,await apiProcessorPreflight(f.transport,f.api,now));
 assert.equal(result.status,'preparation_failed');assert.equal(result.provider_attempts,0);assert.equal(f.calls.length,0);
 assert.ok(f.files.has(bridgePath('00_INBOX',id+'.input.json')));
 assert.equal(f.files.has(bridgePath('10_CLAIMED',id+'.input.json')),false);
 assert.equal(f.observations.get('api-input-preparation:'+id).status,'NEEDS_PREPARATION');
});
test('corrupt review paths are held before claim and do not block later prepared work',async()=>{
 const f=fixture();
 Object.assign(f.job.input,{job_type:'impact_semantic_review',proposed_assessment:{dimensions:{democracy:{primary_paths:[{label:'Retained path'},...Array(77).fill('stray output')]}}}});
 f.files.set(bridgePath('00_INBOX',id+'.input.json'),JSON.stringify(f.job.input));
 const result=await f.processor.process(f.job,await apiProcessorPreflight(f.transport,f.api,now));
 assert.equal(result.status,'preparation_failed');assert.equal(result.provider_attempts,0);assert.equal(f.calls.length,0);
 assert.equal(f.observations.get('api-attention:'+id).error,'API_EDITORIAL_REVIEW_INPUT_INVALID');
 assert.ok(f.files.has(bridgePath('00_INBOX',id+'.input.json')));assert.equal(f.files.has(bridgePath('10_CLAIMED',id+'.input.json')),false);
 assert.equal(f.job.input.proposed_assessment.dimensions.democracy.primary_paths.length,78);
 const next=fixture();assert.equal((await next.processor.process(next.job,await apiProcessorPreflight(next.transport,next.api,now))).status,'output_delivered');
});
test('an existing foreign claim, ACK or output cannot trigger generation', async () => {
  for (const [folder, name] of [['10_CLAIMED', id + '.input.json'], ['30_ACK', id + '.ack.json'], ['20_OUTPUT_READY', id + '.output.json']]) {
    const f = fixture(); f.files.set(bridgePath(folder, name), '{}');
    await f.processor.process(f.job, await apiProcessorPreflight(f.transport, f.api, now)); assert.equal(f.calls.length, 0);
  }
});
test('atomic claim conflict is not mistaken for ownership even with identical content', async () => {
  const f = fixture();
  const receipt = await apiProcessorPreflight(f.transport, f.api, now);
  f.transport.move = async (a,b) => { f.files.set(b, f.files.get(a)); f.files.delete(a); throw Error('AMBIGUOUS'); };
  assert.equal((await f.processor.process(f.job, receipt)).status, 'claim_unknown');
  assert.equal((await f.processor.process(f.job, receipt)).status, 'claimed_elsewhere'); assert.equal(f.calls.length, 0);
});
test('invalid output is retained upstream and never retried or uploaded as an article', async () => {
  const f = fixture(); f.output.job_id = 'wrong';
  const receipt = await apiProcessorPreflight(f.transport, f.api, now);
  await assert.rejects(f.processor.process(f.job, receipt));
  await assert.rejects(f.processor.process(f.job, receipt));
  assert.equal(f.calls.length, 1); assert.equal(f.files.has(bridgePath('20_OUTPUT_READY', id + '.output.json')), false);
});
test('blocked files and historical news are excluded; fresh news sorted LIFO', async () => {
  const f = fixture(); f.observations.set('api-excluded:' + id, { reason: 'prior_export_block' });
  assert.equal((await f.processor.process(f.job, await apiProcessorPreflight(f.transport, f.api, now))).status, 'excluded');
  assert.equal(f.calls.length, 0);
  const older = { input: { ...input, job_id: id.replace(/a/g, 'd') }, candidate: { sources: [{ published_at: '2026-09-12T09:30:00Z' }] } };
  const newest = { input: { ...input, job_id: id.replace(/a/g, 'e') }, candidate: { sources: [{ published_at: '2026-09-13T09:59:00Z' }] } };
  assert.deepEqual(selectApiJobs([older, f.job, newest], now).map(j => j.input.job_id), [newest.input.job_id, id]);
});
test('unsafe legacy automatic analyses and unbounded repairs never reach the API', () => {
  assert.throws(() => prepareApiJob({ ...input, job_type: 'editorial_analysis' }, knowledge), /UNSUPPORTED/);
  assert.throws(() => prepareApiJob({ ...input, original_input: input, correction_attempt: 3 }, knowledge), /INPUT_INVALID/);
});
test('personal topics use the final approval contract and remain separate from ordinary news', () => {
  const request = prepareApiJob({ ...input, job_type: 'editorial_request', request: { kind: 'watched', author_notes: 'Meine wirkliche Vorgabe.' } }, knowledge);
  assert.equal(request.kind, 'personal'); assert.match(request.prompt, /single_final_approval/); assert.match(request.prompt, /Meine wirkliche Vorgabe/);
});
test('invalid shape spends once and never triggers a paid correction on subsequent runs', async () => {
  const f = fixture(); delete f.output.decision;
  const receipt = await apiProcessorPreflight(f.transport, f.api, now);
  assert.equal((await f.processor.process(f.job, receipt)).status, 'validation_failed');
  assert.equal((await f.processor.process(f.job, receipt)).status, 'validation_failed');
  assert.equal(f.calls.length, 1);
  assert.equal(f.observations.get('api-attention:'+id).status,'validation_failed');
  assert.equal(f.files.has(bridgePath('20_OUTPUT_READY', id + '.output.json')), false);
});
test('current independent reviews cannot be starved by a constant inflow of fresh drafts', () => {
  const f = fixture(), review = { input: { ...input, job_id: id.replace(/a/g,'f'), job_type: 'impact_semantic_review' }, candidate: { sources: [{ published_at: '2026-09-13T09:10:00Z' }] } };
  assert.equal(selectApiJobs([f.job, review], now)[0].input.job_type, 'impact_semantic_review');
});
test('a targeted canary selects only its existing job and cannot bypass freshness or exclusions', () => {
  const f=fixture(), other={...f.job,input:{...input,job_id:id.replace(/a/g,'f')}};
  assert.deepEqual(selectApiJobs([other,f.job],now,{onlyJobId:id}).map(j=>j.input.job_id),[id]);
  assert.deepEqual(selectApiJobs([f.job],now,{onlyJobId:id,excludedIds:[id]}),[]);
  assert.deepEqual(selectApiJobs([f.job],'2026-09-14T10:00:00Z',{onlyJobId:id}),[]);
  assert.throws(()=>selectApiJobs([f.job],now,{onlyJobId:'invalid'}),/TARGET_INVALID/);
});
test('fresh-start cutoff leaves the old queue intact and lets selected news finish review after an hour',()=>{
 const make=(digit,date,kind='new_story')=>({input:{...input,job_id:id.replace(/a/g,digit),job_type:kind},candidate:{sources:[{published_at:date}]}});
 const old=make('c','2026-09-13T08:00:00Z','impact_semantic_review'),review=make('d','2026-09-13T10:13:00Z','impact_semantic_review'),fresh=make('e','2026-09-13T11:20:00Z');
 assert.deepEqual(selectApiJobs([old,fresh,review],'2026-09-13T11:30:00Z',{newsNotBefore:'2026-09-13T10:00:00Z'}).map(j=>j.input.job_id),[review.input.job_id,fresh.input.job_id]);
 assert.equal(old.input.job_type,'impact_semantic_review');
});
test('native analysis is wrapped without changing its content or skipping downstream gates', async () => {
  const { wrapNativeNewsOutput, validateApiOutput } = await import('../../scripts/news/bridge/api-processor.mjs');
  const original = { ...input, wirkungsticker: { story_id: 'wt-example' }, sources: [{source_id:'source-a',url:'https://example.com/story'}] };
  const analysis = { story_id:'wt-example', publication_recommendation:true, publication_gate:{rationale:'Belegte neue Entwicklung mit materieller Bedeutung.'}, summary:'Kurze Zusammenfassung.',source_summary:'Quellengebundener Text.' };
  const native = { schema_version:'1.0',job_id:id,input_hash:input.input_hash,processed_at:now,analyses:[analysis] };
  const wrapped = validateApiOutput(native, original, now);
  assert.deepEqual(wrapped.wirkungsticker.analysis, analysis);
  assert.equal(wrapped.story.short_summary, analysis.summary); assert.equal(wrapped.story.detailed_summary, analysis.source_summary);
  assert.equal(wrapped.wirkungsticker.analysis.impact_assessment, undefined); // importer MUST reject missing MPD; converter never invents it
  assert.throws(() => wrapNativeNewsOutput({...native,analyses:[{...analysis,story_id:'other'}]}, original), /BINDING/);
  const rejected={...analysis,publication_recommendation:false,rejection:{code:'insufficient_evidence',reason:'Der Beleg für die zentrale Behauptung fehlt.'}};
  assert.equal(wrapNativeNewsOutput({...native,analyses:[rejected]},original).decision.status,'hold');
});
test('native news request has one output contract, not a competing bridge schema', () => {
  const request=prepareApiJob({...input,wirkungsticker:{story_id:'native-id',analysis_prompt:'Native analysis contract and original evidence.'}},knowledge);
  assert.ok(request.prompt.startsWith('Native analysis contract'));
  assert.equal(request.prompt.includes('output_schema'),false);
  assert.match(request.prompt,/Keine Bridge-Hülle/);
});
test('misplaced native sibling fields are copied losslessly and never used to invent an assessment', async () => {
  const {wrapNativeNewsOutput}=await import('../../scripts/news/bridge/api-processor.mjs');
  const analysis={story_id:'native-id',publication_recommendation:true,impact_assessment:{version:'2.1',publication_gate:{rationale:'Konkrete neue Änderung ist durch den Beleg gestützt.'},importance:'hoch'}};
  const result=wrapNativeNewsOutput({analyses:[analysis]}, {...input,wirkungsticker:{story_id:'native-id'}});
  assert.deepEqual(result.wirkungsticker.analysis.publication_gate,analysis.impact_assessment.publication_gate);
  assert.deepEqual(result.wirkungsticker.analysis.impact_assessment,analysis.impact_assessment);
  assert.equal(analysis.publication_gate,undefined);
});
test('numeric transport preserves scores and never fills nulls or rewrites textual evidence',async()=>{
 const {canonicalAssessmentNumbers}=await import('../../scripts/news/bridge/api-processor.mjs');
 const a={dimensions:{human:{magnitude:'3',primary_paths:[{magnitude:'3',magnitude_range:{lower:'2',upper:'4'},magnitude_factors:{reach:{value:'2',source_ids:['3'],rationale:'3'}},direction:'negative'}],secondary_paths:[]},planet:{magnitude:null,primary_paths:[{magnitude:'unknown'}],secondary_paths:[]}},observed_effects:[{magnitude:'4'}]};
 canonicalAssessmentNumbers(a);
 assert.equal(a.dimensions.human.magnitude,3);assert.equal(a.dimensions.human.primary_paths[0].magnitude_factors.reach.value,2);
 assert.deepEqual(a.dimensions.human.primary_paths[0].magnitude_factors.reach.source_ids,['3']);assert.equal(a.dimensions.human.primary_paths[0].magnitude_factors.reach.rationale,'3');
 assert.equal(a.dimensions.planet.magnitude,null);assert.equal(a.dimensions.planet.primary_paths[0].magnitude,'unknown');assert.equal(a.observed_effects[0].magnitude,4);
});
test('misplaced complete MPD fields move to their sole contract location without changing values or resolving conflicts',async()=>{
 const {wrapNativeNewsOutput}=await import('../../scripts/news/bridge/api-processor.mjs');
 const original={...input,wirkungsticker:{story_id:'native-id'}};
 const analysis={story_id:'native-id',publication_recommendation:true,publication_gate:{rationale:'Belegtes neues Ereignis.'},impact_assessment:{version:'2.1'},dimensions:{human:{direction:'negative'}},research_check:{status:'needs_research'},observed_effects:[]};
 const snapshot=structuredClone(analysis),r=wrapNativeNewsOutput({analyses:[analysis]},original).wirkungsticker.analysis;
 for(const field of ['dimensions','research_check','observed_effects']){assert.deepEqual(r.impact_assessment[field],snapshot[field]);assert.equal(field in r,false);}
 assert.deepEqual(analysis,snapshot);
 analysis.impact_assessment.dimensions={human:{direction:'open'}};
 const conflict=wrapNativeNewsOutput({analyses:[analysis]},original).wirkungsticker.analysis;
 assert.deepEqual(conflict.impact_assessment.dimensions,analysis.impact_assessment.dimensions);
 assert.deepEqual(conflict.dimensions,analysis.dimensions);
});
test('failed article preflight keeps the result private without another paid attempt', async () => {
  const f=fixture(); let checked=0;
  f.processor.preflightOutput=async()=>{ if (++checked === 1) throw Object.assign(Error('BRIDGE_PUBLICATION_GATE_FAILED'),{issues:['AI_REQUIRED_STRING:systemic_relevance']}); };
  const result=await f.processor.process(f.job,await apiProcessorPreflight(f.transport,f.api,now));
  assert.equal(result.status,'validation_failed'); assert.equal(f.calls.length,1);
  assert.match(f.observations.get('api-attention:'+id).error,/AI_REQUIRED_STRING:systemic_relevance/);
  assert.equal(checked,1);
  assert.equal(f.files.has(bridgePath('20_OUTPUT_READY',id+'.output.json')),false);
});
test('technical validation failures resume the paid result without buying a rewritten article', async () => {
  for (const error of [Object.assign(Error('spawnSync pdftotext ENOENT'),{code:'ENOENT'}),
    Object.assign(Error('IMPACT_RESEARCH_REQUEST_TIMEOUT'),{retryable:true}), Error('ARTICLE_HTTP_503:research-context')]) {
    const f=fixture(), receipt=await apiProcessorPreflight(f.transport,f.api,now);
    f.processor.preflightOutput=async()=>{throw error;};
    await assert.rejects(f.processor.process(f.job,receipt), /VALIDATION_DEPENDENCY_UNAVAILABLE/);
    assert.equal(f.calls.length,1);
    assert.equal(f.files.has(bridgePath('20_OUTPUT_READY',id+'.output.json')),false);
    f.processor.preflightOutput=async()=>{};
    assert.equal((await f.processor.process(f.job,receipt)).status,'output_delivered');
    assert.equal(f.calls.length,1);
  }
});
test('deep schema ordering retains all fields and supplied evidence unchanged', async () => {
  const {orderNativePrompt}=await import('../../scripts/news/bridge/api-processor.mjs');
  const schema={analyses:[{story_id:'string',impact_assessment:{dimensions:{human:{}}},systemic_relevance:'string',publication_gate:{news_value:'new_evidence'}}],$defs:{path:{}}};
  const evidence='UNTRUSTED_SOURCE_DATA_BEGIN\n'+JSON.stringify(schema)+'\n{"quoted":"source text"}\nUNTRUSTED_SOURCE_DATA_END';
  const result=orderNativePrompt(JSON.stringify(schema)+'\n'+evidence);
  assert.deepEqual(JSON.parse(result.split('\n')[0]),schema);
  assert.equal(Object.keys(JSON.parse(result.split('\n')[0]).analyses[0]).at(-1),'impact_assessment');
  assert.ok(result.endsWith(evidence));
});
test('transport-compatible completed response retains its paid request key and usage without another call',async()=>{
  const f=fixture(),oldKey='d'.repeat(64),oldProfile='e'.repeat(64);
  const receipt=await apiProcessorPreflight(f.transport,f.api,now);
  const request=prepareApiJob(input,knowledge);
  await f.transport.move(bridgePath('00_INBOX',id+'.input.json'),bridgePath('10_CLAIMED',id+'.input.json'));
  f.observations.set('api-claim:'+id+'.input.json',{state:'claimed',key:oldKey});
  f.processor.knowledge={...knowledge,compatibleHashes:[oldProfile]};
  f.api.get=async()=>({key:oldKey,profile_hash:oldProfile,packet_hash:request.packet_hash,status:'completed',output:f.output,usage:{input_tokens:100,output_tokens:200}});
  assert.equal((await f.processor.process(f.job,receipt)).status,'output_delivered');
  assert.equal(f.calls.length,0);
  const proof=JSON.parse(f.files.get(bridgePath('95_LOGS','processor-api-'+oldKey+'.json')));
  assert.equal(proof.key,oldKey); assert.equal(proof.profile_hash,oldProfile); assert.equal(proof.usage.output_tokens,200);
});
test('a negative independent review is delivered once, never challenged through a paid clarification',async()=>{
 const {semanticOutputSchema}=await import('../../scripts/news/bridge/semantic-review.mjs');
 const f=fixture();f.job.input.job_type='impact_semantic_review';
 f.files.set(bridgePath('00_INBOX',id+'.input.json'),JSON.stringify(f.job.input));
 const review={...shape(semanticOutputSchema),schema_version:'1.0',job_id:id,input_hash:input.input_hash,processed_at:now};
 review.review.status='blocked';for(const check of Object.values(review.review.checks))check.status='fail';
 for(const key of Object.keys(f.output))delete f.output[key];Object.assign(f.output,review);
 const result=await f.processor.process(f.job,await apiProcessorPreflight(f.transport,f.api,now));
 assert.equal(result.status,'output_delivered');assert.equal(f.calls.length,1);
 assert.equal(JSON.parse(f.files.get(bridgePath('20_OUTPUT_READY',id+'.output.json'))).review.status,'blocked');
 assert.equal(f.calls.some(c=>c.attempt>0),false);
});
test('current corrections finish before new drafts while independent review remains first',()=>{
  const f=fixture(),repair={...f.job,status:'correction_pending',input:{...input,job_id:id.replace(/a/g,'e')}};
  const review={...f.job,input:{...input,job_id:id.replace(/a/g,'f'),job_type:'impact_semantic_review'}};
  assert.deepEqual(selectApiJobs([f.job,repair,review],now),[review,repair,f.job]);
});
