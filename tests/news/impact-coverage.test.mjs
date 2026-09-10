import test from 'node:test';
import assert from 'node:assert/strict';
import { impactCoverage, assertImpactCoverage, prepareImpactPromotion } from '../../scripts/news/impact-coverage.mjs';
import { assessmentBasis } from '../../scripts/news/migrate-impact-assessments.mjs';
import { highStory, validEditorial } from './fixtures/editorial-bridge.mjs';
import { editorialSourceRef } from '../../scripts/news/editorial-analysis.mjs';
import { impactReassessmentInput, applyImpactOutput, importImpactJobs } from '../../scripts/news/bridge/impact.mjs';
import { titleFingerprint } from '../../scripts/news/title-image/pipeline.mjs';
import { publicImpactAssessment } from '../../scripts/news/impact-release.mjs';
import { derivePublicationStatus, SEMANTIC_CHECKS } from '../../scripts/news/impact-publication.mjs';
import { hash } from '../../scripts/news/bridge/contract.mjs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { BridgeStore } from '../../scripts/news/bridge/store.mjs';
const now='2026-09-10T14:00:00Z';
function fixture(){
  const record=highStory('synthetic'),assessment=validEditorial(record).impact_assessment;
  record.sources=record.sources.map(s=>({...s,source_id:editorialSourceRef(s)}));
  record.impact_assessment={...structuredClone(assessment),version:'2.0'};
  const input=impactReassessmentInput(record,now),review={status:'ready',checks:Object.fromEntries(SEMANTIC_CHECKS.map(k=>[k,{status:'pass',rationale:'Die explizite synthetische Grundlage ist für diesen Test geprüft.'}]))};
  const output={schema_version:'1.0',job_id:input.job_id,input_hash:input.input_hash,processed_at:now,decision:{status:'publish',reason:'Synthetische Metadatenkorrektur für die Freigabeprüfung.'},impact_assessment:assessment};
  const gate=derivePublicationStatus(assessment,record,{review,secondPassComplete:true});assert.equal(gate.status,'ready');
  const job={input,candidate:record,semantic_review:{review_job_id:'separate-review',reviewed_at:now,output_hash:hash(output),assessment,review,gate}};
  const staged=applyImpactOutput(output,job,record,now);
  job.accepted_at=now;job.accepted={decision:'publish',output_hash:hash(output)};job.staging={impact_record:staged,impact_record_hash:hash(staged)};
  return {record,job,staged};
}
test('coverage blocks a partial catalog and private staging promotes only fully bound impact metadata',()=>{
  const {record,job}=fixture(),other={...structuredClone(record),story_id:'other'};
  const partial=prepareImpactPromotion([record,other],[job]);assert.equal(partial.report.pass,false);assert.equal(partial.report.fully_assessed,1);
  assert.throws(()=>assertImpactCoverage(partial.report),/RELEASE_BLOCKED/);
  const full=prepareImpactPromotion([record],[job]);assert.equal(full.report.pass,true);assert.equal(full.report.material,3);
  for(const k of ['title','source_summary','analysis','sources','versions'])assert.deepEqual(full.records[0][k],record[k]);
  assert.equal(full.records[0].impact_assessment_basis,assessmentBasis(full.records[0]));
});
test('changed news, changed staged bytes, mismatched receipt and test-only jobs cannot promote',()=>{
  for(const mutation of [
    f=>f.record.content_hash='new revision',
    f=>f.job.staging.impact_record.impact_assessment.dimensions.human.magnitude=1,
    f=>f.job.semantic_review.output_hash='wrong',
    f=>f.job.input.test_only=true,
  ]){const f=fixture();mutation(f);assert.equal(prepareImpactPromotion([f.record],[f.job]).report.fully_assessed,0);}
});
test('missing material magnitude, public diagnostic text and implausible filter collapse block release',()=>{
  const {staged}=fixture();assert.equal(impactCoverage([staged]).pass,true);
  assert.equal(impactCoverage([staged],{publicHtml:['Keine Größenschätzung vorhanden']}).public_debug_fallbacks,1);
  assert.equal(impactCoverage([staged],{minimumMaterialCounts:{human:2}}).pass,false);
  staged.impact_assessment.dimensions.human.magnitude=null;
  const report=impactCoverage([staged]);assert.equal(report.potential_without_magnitude,1);assert.equal(report.pass,false);
});

test('archived staged assessments remain addressable without returning bulky private drafts in routine polls',t=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'impact-staging-index-')),store=new BridgeStore(path.join(dir,'queue.sqlite'));
  t.after(()=>{store.close();fs.rmSync(dir,{recursive:true,force:true});});
  const {job}=fixture();job.status='acknowledged';job.archived_at=now;store.put(job);
  assert.deepEqual(store.all(),[]);
  assert.equal(store.impactStagingIndex()[0].id,job.input.job_id);
  assert.equal(store.get(job.input.job_id).staging.impact_record_hash,job.staging.impact_record_hash);
});

test('one independently reviewed backfill publishes with fresh cards while other legacy stories remain held',async t=>{
  const {record,job}=fixture(),other={...structuredClone(record),story_id:'other'};
  const output={schema_version:'1.0',job_id:job.input.job_id,input_hash:job.input.input_hash,processed_at:now,decision:{status:'publish',reason:'Vollständig geprüfte Wirkungsmetadaten im synthetischen Test.'},impact_assessment:job.semantic_review.assessment};
  job.status='queued';delete job.accepted;delete job.staging;
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'impact-one-record-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
  fs.mkdirSync(path.join(root,'data/news'),{recursive:true});
  const file=path.join(root,'data/news/stories.json');
  const reset=()=>{fs.writeFileSync(file,JSON.stringify({stories:[record,other]}));fs.writeFileSync(path.join(root,'data/news/editorial-analyses.json'),JSON.stringify({analyses:[]}));};reset();
  let current=structuredClone(job),renders=0;
  const bridge={stageOnly:false,store:{all:async()=>[current],put:async j=>{current=structuredClone(j);},observe:async()=>{},observation:async()=>null},transport:{list:async()=>[{name:job.input.job_id+'.output.json'}],read:async()=>JSON.stringify(output)},failure:async(_j,_stage,e)=>{throw e;}};
  const options={semanticReview:async()=>({status:'ready',assessment:job.semantic_review.assessment,record}),prepareImage:async changed=>{
    renders++;assert.ok(publicImpactAssessment(changed));assert.notEqual(titleFingerprint(changed,'impact_card'),titleFingerprint(record,'impact_card'));
    return {title_image:{mode:'impact_card',...Object.fromEntries(['og','wide','square'].map(size=>[size,{url:`https://github.com/sustynats/wirkungsoekonomie.de/releases/download/wirkungsticker-media-2026-09/wt-0123456789abcdef-0123456789abcdef-${size}.png` }]))}};
  }};
  const result=await importImpactJobs(bridge,root,now,options);
  assert.equal(result[0].changed,true);assert.equal(result[0].staged,false);assert.equal(renders,1);
  const saved=JSON.parse(fs.readFileSync(file)).stories;
  assert.ok(publicImpactAssessment(saved[0]));assert.equal(publicImpactAssessment(saved[1]),null);
  for(const k of ['title','source_summary','analysis','sources','versions'])assert.deepEqual(saved[0][k],record[k]);
  assert.equal((await importImpactJobs(bridge,root,now,options)).length,0);assert.equal(renders,1);
  for(const privateCase of ['test_only','stageOnly','manual_authority']){
    reset();current=structuredClone(job);bridge.stageOnly=privateCase==='stageOnly';
    current.input.test_only=privateCase==='test_only';
    if(privateCase==='manual_authority'){const data=JSON.parse(fs.readFileSync(file));data.stories[0].manual_authority=true;fs.writeFileSync(file,JSON.stringify(data));}
    const before=fs.readFileSync(file,'utf8');
    const held=await importImpactJobs(bridge,root,now,options);
    assert.equal(held[0].staged,true);assert.equal(fs.readFileSync(file,'utf8'),before);assert.equal(renders,1);
  }
  reset();current=structuredClone(job);bridge.stageOnly=false;
  const held=await importImpactJobs(bridge,root,now,{...options,semanticReview:async()=>({status:'needs_review'})});
  assert.equal(held.length,0);assert.equal(renders,1);
});
