import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareApiJob, validateApiOutput } from '../../scripts/news/bridge/api-processor.mjs';
import { derivePublicationStatus, SEMANTIC_CHECKS } from '../../scripts/news/impact-publication.mjs';
import { syntheticPotentialAssessment } from './fixtures/impact21.mjs';
import { reviewResponseFormat, reviewPathAddresses } from '../../scripts/news/bridge/review-response-schema.mjs';
import { parsePacket } from '../../scripts/news/bridge/contract.mjs';

function fixture() {
  const assessment = syntheticPotentialAssessment();
  const p = assessment.dimensions.human.primary_paths[0];
  p.evidence = 'low'; p.epistemic_basis = 'model_hypothesis'; p.research_pass = 'initial';
  const packet = {job_type:'impact_semantic_review', job_id:'wt_20260913T120000Z_'+'a'.repeat(24),
    input_hash:'b'.repeat(64), created_at:'2026-09-13T12:00:00Z',
    proposed_assessment:assessment, record:{analysis:{impact_assessment:structuredClone(assessment)},sources:[{source_id:'official',excerpt:'Original source bytes.'}]}};
  const output = {schema_version:'1.0',job_id:packet.job_id,input_hash:packet.input_hash,processed_at:'2026-09-13T12:05:00Z',
    review:{status:'ready',checks:Object.fromEntries(SEMANTIC_CHECKS.map(k=>[k,{status:'pass',rationale:'Konkreter, unabhängiger synthetischer Prüfbefund für '+k+'.'}])),findings:[]},
    impact_assessment:null,research_sources:[],assessment_confirmation:{research_check:structuredClone(assessment.research_check),
      path_research:[{dimension:'human',path_set:'primary_paths',path_index:0,search_indices:[0],result:'Erneute synthetische Prüfung: Wissensgrenze bleibt offen; der Pfad ist ausdrücklich eine Modellannahme.'}]}};
  return {packet,output};
}
const now='2026-09-13T12:06:00Z';
function boundFixture() {
  const f=fixture();
  f.packet.proposed_assessment.dimensions.human.secondary_paths=[structuredClone(f.packet.proposed_assessment.dimensions.human.primary_paths[0])];
  const old=f.output.assessment_confirmation;
  f.output.assessment_result={action:'confirm',confirmation:{research_check:old.research_check,
    path_research:Object.fromEntries(reviewPathAddresses(f.packet.proposed_assessment).map(({key})=>[key,{search_indices:[0],result:old.path_research[0].result}]))}};
  delete f.output.assessment_confirmation;delete f.output.impact_assessment;
  return f;
}
test('the generation contract requires every actual main and secondary path before paying for a response',()=>{
  const f=boundFixture(), format=reviewResponseFormat(f.packet.proposed_assessment);
  const branch=format.schema.properties.assessment_result.anyOf[0];
  assert.deepEqual(branch.properties.confirmation.properties.path_research.required,
    ['human_primary_paths_0','human_secondary_paths_0','planet_primary_paths_0','democracy_primary_paths_0']);
  assert.doesNotThrow(()=>parsePacket(JSON.stringify(f.output.assessment_result),branch));
  delete f.output.assessment_result.confirmation.path_research.human_secondary_paths_0;
  assert.throws(()=>parsePacket(JSON.stringify(f.output.assessment_result),branch));
  assert.throws(()=>validateApiOutput(f.output,f.packet,now));
});
test('bound confirmation expands exactly once and cannot mix replacement and confirmation',()=>{
  const f=boundFixture(), before=structuredClone(f);
  const result=validateApiOutput(f.output,f.packet,now);
  assert.deepEqual(f,before);
  assert.equal(result.assessment_result,undefined);
  assert.equal(result.impact_assessment.dimensions.human.secondary_paths[0].research_pass,'second_pass');
  f.output.assessment_result.impact_assessment=f.packet.proposed_assessment;
  assert.throws(()=>validateApiOutput(f.output,f.packet,now));
});
test('confirmation preserves every judgment and raw record while documenting the independent research',()=>{
  const {packet,output}=fixture(), original=structuredClone({packet,output});
  const result=validateApiOutput(output,packet,now);
  assert.deepEqual({packet,output},original);
  assert.equal(result.assessment_confirmation,undefined);
  const actual=result.impact_assessment.dimensions.human.primary_paths[0];
  assert.equal(actual.research_pass,'second_pass');
  assert.equal(actual.research_result,output.assessment_confirmation.path_research[0].result);
  for(const key of ['magnitude_factors','direction','evidence','mechanism','source_ids','magnitude_range','condition'])
    assert.deepEqual(actual[key],packet.proposed_assessment.dimensions.human.primary_paths[0][key]);
  assert.equal(derivePublicationStatus(result.impact_assessment,packet.record,{review:result.review,secondPassComplete:true}).status,'ready');
});
test('confirmation cannot bypass a negative review, missing research, binding or a changed path address',()=>{
  for(const change of [
    f=>{f.output.review.checks.source_fidelity.status='fail';},
    f=>{f.output.assessment_confirmation.research_check.status='needs_research';},
    f=>{f.output.assessment_confirmation.path_research=[];},
    f=>{f.output.assessment_confirmation.path_research[0].path_index=8;},
    f=>{f.output.assessment_confirmation.path_research[0].search_indices=[9];},
    f=>{f.output.assessment_confirmation.path_research.push(f.output.assessment_confirmation.path_research[0]);},
    f=>{f.output.impact_assessment=f.packet.proposed_assessment;},
    f=>{f.output.input_hash='e'.repeat(64);},
  ]) {const f=fixture();change(f);assert.throws(()=>validateApiOutput(f.output,f.packet,now));}
});
test('confirmation does not rescue unknown sources or invalid factors from the proposal',()=>{
  const f=fixture();f.packet.proposed_assessment.dimensions.human.primary_paths[0].source_ids=['invented'];
  delete f.packet.proposed_assessment.dimensions.planet.primary_paths[0].magnitude_factors.reach;
  const result=validateApiOutput(f.output,f.packet,now);
  const gate=derivePublicationStatus(result.impact_assessment,f.packet.record,{review:result.review,secondPassComplete:true});
  assert.notEqual(gate.status,'ready');assert.ok(gate.issues.some(i=>i.includes('SOURCE')));assert.ok(gate.issues.some(i=>i.includes('FACTOR_REQUIRED')));
});
test('existing full reviews remain compatible; contradictory confirmation stays invalid',()=>{
  for(const legacy of [true,false]) {
    const f=fixture();f.output.impact_assessment=structuredClone(f.packet.proposed_assessment);
    if(legacy)delete f.output.assessment_confirmation;else f.output.assessment_confirmation=null;
    assert.ok(validateApiOutput(f.output,f.packet,now).impact_assessment);
  }
});
test('only an identical duplicate proposal is omitted from the prompt, never source data or differing history',()=>{
  const {packet}=fixture(), before=structuredClone(packet), knowledge={hash:'c'.repeat(64),instructions:'Prüfe anhand der gebundenen Belege.'};
  let prompt=JSON.parse(prepareApiJob(packet,knowledge).prompt);
  assert.equal(prompt.assignment.record.analysis.impact_assessment,undefined);
  assert.deepEqual(prompt.assignment.proposed_assessment,packet.proposed_assessment);
  assert.deepEqual(prompt.assignment.record.sources,packet.record.sources);
  assert.deepEqual(packet,before);
  packet.record.analysis.impact_assessment.baseline='A different historical baseline.';
  prompt=JSON.parse(prepareApiJob(packet,knowledge).prompt);
  assert.deepEqual(prompt.assignment.record.analysis.impact_assessment,packet.record.analysis.impact_assessment);
});
