import test from 'node:test';
import assert from 'node:assert/strict';
import { impactCoverage, assertImpactCoverage, prepareImpactPromotion } from '../../scripts/news/impact-coverage.mjs';
import { assessmentBasis } from '../../scripts/news/migrate-impact-assessments.mjs';
import { highStory, validEditorial } from './fixtures/editorial-bridge.mjs';
import { editorialSourceRef } from '../../scripts/news/editorial-analysis.mjs';
import { impactReassessmentInput, applyImpactOutput } from '../../scripts/news/bridge/impact.mjs';
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
