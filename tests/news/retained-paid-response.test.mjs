import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {retainedResponseNeeded,prepareRetainedResponse,applyRetainedResponse,recoveryHash} from '../../scripts/news/recover-st-pauli-paid.mjs';

const at='2026-10-17T06:30:00.000Z';
function fixture(){
  const sources=[{source_id:'synthetic',title:'Synthetic source',url:'https://example.org/test',published_at:'2026-10-16T09:37:38.000Z'}];
  const row={story_id:'synthetic-recovery',sources,published:false,pending_reason:'AI_ATTEMPT_LIMIT_REACHED',quality_errors:['AI_SUMMARY_SENTENCE_COUNT']};
  return {store:{stories:[row,{story_id:'unrelated',published:true,listed:true,sources:[]}]},binding:{story_id:row.story_id,sources_sha256:recoveryHash(JSON.stringify(sources)),raw_sha256:'0'.repeat(64),model:'synthetic'}};
}
test('recovery requires the same exact input and the one repaired format error',()=>{
  const {store,binding}=fixture();assert.equal(retainedResponseNeeded(store,at,binding,{}),true);
  for(const change of [s=>s.published=true,s=>s.listed=false,s=>s.pending_reason='AI_HOURLY_CALL_LIMIT',s=>s.quality_errors.push('CLAIM_EVIDENCE_NOT_IN_SOURCE'),s=>s.sources[0].title+=' changed']){
    const copy=structuredClone(store);change(copy.stories[0]);assert.equal(retainedResponseNeeded(copy,at,binding,{}),false);
  }
  assert.equal(retainedResponseNeeded(store,'2026-10-18T06:30:00Z',binding,{}),false);
  assert.equal(retainedResponseNeeded(store,'not-a-date',binding,{}),false);
});
test('a changed paid original fails before any source or provider activity',async()=>{
  const {store,binding}=fixture();let fetched=0;
  await assert.rejects(prepareRetainedResponse({store,binding,raw:Buffer.from('{}'),registry:{sources:[]},at,env:{},fetchArticle:async()=>{fetched++;}}),/PAID_RECOVERY_ORIGINAL_CHANGED/);
  assert.equal(fetched,0);assert.equal(store.stories[0].published,false);
});
test('a complete raw hash cannot override job, model or completion binding',async()=>{
  const {store,binding}=fixture();const raw=Buffer.from(JSON.stringify({model:'different',status:'completed',answer:JSON.stringify({story_id:binding.story_id}),story_ids:[binding.story_id]}));
  binding.raw_sha256=recoveryHash(raw);
  await assert.rejects(prepareRetainedResponse({store,binding,raw,registry:{sources:[]},at,env:{}}),/PAID_RECOVERY_BINDING_INVALID/);
});
test('fresh source gates fail closed and never rewrite the candidate',async()=>{
  const {store,binding}=fixture(),before=JSON.stringify(store);
  const raw=Buffer.from(JSON.stringify({model:binding.model,status:'completed',answer:JSON.stringify({story_id:binding.story_id}),story_ids:[binding.story_id]}));
  binding.raw_sha256=recoveryHash(raw);binding.excerpt_sha256='0'.repeat(64);
  const registry={sources:[{source_id:'synthetic',enabled:true}],policy:{}};
  await assert.rejects(prepareRetainedResponse({store,binding,raw,registry,at,env:{},fetchArticle:async()=>{throw Error('ROBOTS_DISALLOWED');}}),/ROBOTS_DISALLOWED/);
  await assert.rejects(prepareRetainedResponse({store,binding,raw,registry,at,env:{},fetchArticle:async()=>({excerpt:'Different current evidence'})}),/PAID_RECOVERY_SOURCE_CHANGED/);
  registry.sources[0].enabled=false;
  await assert.rejects(prepareRetainedResponse({store,binding,raw,registry,at,env:{}}),/PAID_RECOVERY_SOURCE_NOT_ACTIVE/);
  assert.equal(JSON.stringify(store),before);
});
test('free publication updates its queue receipt but not paid usage or unrelated records',()=>{
  const {store,binding}=fixture(),other=JSON.stringify(store.stories[1]);
  const state={pending_story_ids:[binding.story_id,'other-pending'],budget:{unchanged:true}};
  const report={ai_calls:4,ai_stories:4,estimated_cost_usd:1.25,queue:{before:2},quality_holds:[{story_id:binding.story_id},{story_id:'other-pending'}],source_integrity_holds:[]};
  const result={changed:true,record:{...store.stories[0],published:true,pending_reason:undefined},receipt:{story_id:binding.story_id,revalidated_at:at,provider_called:false,cost_usd:0}};
  assert.equal(applyRetainedResponse(store,state,report,result),true);
  assert.equal(JSON.stringify(store.stories[1]),other);assert.deepEqual(state.pending_story_ids,['other-pending']);
  assert.equal(report.public_changed,true);assert.equal(report.published_stories,1);assert.equal(report.reviews_reused,1);
  assert.equal(report.ai_calls,4);assert.equal(report.ai_stories,4);assert.equal(report.estimated_cost_usd,1.25);
  assert.deepEqual(state.budget,{unchanged:true});assert.equal(report.quality_holds.length,1);
  assert.throws(()=>applyRetainedResponse(store,state,report,result),/PAID_RECOVERY_STATE_CHANGED/);
});
test('the ordinary serial workflow replays before outcome/build and reports recovery failures',()=>{
  const workflow=fs.readFileSync('.github/workflows/wirkungsticker.yml','utf8');
  const pos=workflow.indexOf('id: paid_answer_recovery');
  assert.ok(pos>workflow.indexOf('Take over editions approved'));
  assert.ok(pos<workflow.indexOf('name: Read public ticker outcome'));
  assert.ok(pos<workflow.indexOf('name: Redaktionelle Lage schreiben'));
  assert.match(workflow,/gh run download 38888277070 .*--name ai-raw-output-38888277070-1/);
  assert.match(workflow,/steps\.paid_answer_recovery\.outcome == 'failure'/);
  assert.match(workflow,/group: wirkungsticker-main\n  cancel-in-progress: false/);
  assert.match(workflow,/id: paid_answer_recovery\n        if: steps\.slot\.outputs\.should_run == 'true' && inputs\.dry_run != true/);
});
