import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { syntheticImpact21 } from './fixtures/impact21.mjs';
import { SEMANTIC_CHECKS } from '../../scripts/news/impact-publication.mjs';
import { reviewPreflight } from '../../scripts/news/bridge/review-preflight.mjs';

const now='2026-09-13T12:00:00Z';
function fixture() {
 const r=JSON.parse(fs.readFileSync('content/news/reviews/2026-09-10-impact-semantics.json')).reviews[0];
 const record=structuredClone(JSON.parse(fs.readFileSync('data/news/stories.json')).stories.find(s=>s.story_id===r.story_id));
 record.impact_sources=r.assessment_sources;
 const output={impact_assessment:syntheticImpact21(r.impact_assessment),
  review:{status:'ready',checks:Object.fromEntries(SEMANTIC_CHECKS.map(k=>[k,{status:'pass',rationale:'Dieser konkrete Prüfpunkt wurde anhand der gelieferten Belege geprüft.'}])),findings:[]},
  research_sources:[]};
 const cache=new Map();
 return {record,output,cache,bridge:{store:{observation:async k=>cache.get(k),observe:async(k,v)=>cache.set(k,v)}}};
}
const research={source_id:'research-preflight-test',url:'https://independent-research.example/record',title:'Public research document',publisher:'Research publisher',
 source_function:'mechanism',quote:'A specific quoted mechanism must exist in the actual public research source.',supports:'This excerpt would support the described mechanism in the specified setting.'};
test('review feedback combines source failure, missing factors and missing research documentation in one pass',async()=>{
 const f=fixture();f.output.research_sources=[research];
 delete f.output.impact_assessment.dimensions.human.primary_paths[0].magnitude_factors;
 delete f.output.impact_assessment.research_check;
 await assert.rejects(reviewPreflight(f.bridge,f.output,f.record,now,{fetchDocument:async()=>({body:'Unrelated original text.'})}),e=>{
  assert.equal(e.message,'BRIDGE_PUBLICATION_GATE_FAILED');
  assert.ok(e.issues.includes('IMPACT_RESEARCH_QUOTE_NOT_FOUND:research-preflight-test'));
  assert.ok(e.issues.includes('IMPACT_FACTOR_REQUIRED:reach:human'));
  assert.ok(e.issues.includes('IMPACT_RESEARCH_CHECK_REQUIRED'));
  const context=e.issues.find(i=>i.startsWith('SOURCE_REPAIR_CONTEXT:'));
  assert.ok(context.includes('Unrelated original text.'));
  assert.ok(context.includes('"claim_verified":false'));
  return true;
 });
 assert.equal(f.cache.size,0);assert.ok(!f.record.impact_sources.some(s=>s.source_id===research.source_id));
});
test('complete verified review passes the same gate used by the importer',async()=>{
 const f=fixture(),result=await reviewPreflight(f.bridge,f.output,f.record,now);
 assert.equal(result.gate.status,'ready');assert.deepEqual(result.gate.issues,[]);
});
test('valid structure never substitutes for a verified research source',async()=>{
 const f=fixture();f.output.research_sources=[research];
 await assert.rejects(reviewPreflight(f.bridge,f.output,f.record,now,{fetchDocument:async()=>({body:'Unrelated original text.'})}),/BRIDGE_PUBLICATION_GATE_FAILED/);
 assert.equal(f.cache.size,0);
});
test('temporary source outages preserve retry classification instead of asking for a new article',async()=>{
 const f=fixture();f.output.research_sources=[research];
 const unavailable=Object.assign(Error('SOURCE_TEMPORARILY_UNAVAILABLE'),{retryable:true,retry_after_seconds:120});
 await assert.rejects(reviewPreflight(f.bridge,f.output,f.record,now,{fetchDocument:async()=>{throw unavailable;}}),e=>e===unavailable);
});
test('a genuine failed editorial check remains held, never automatically changed to ready',async()=>{
 const f=fixture();f.output.review.status='needs_review';f.output.review.checks.source_fidelity.status='fail';
 const result=await reviewPreflight(f.bridge,f.output,f.record,now);
 assert.equal(result.gate.status,'needs_review');assert.equal(f.output.review.checks.source_fidelity.status,'fail');
});
