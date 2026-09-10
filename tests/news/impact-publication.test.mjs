import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { deriveImpactPresentation, impactAssessmentErrors } from '../../scripts/news/impact-assessment.mjs';
import { derivePublicationStatus, semanticIssues, impactContextRequirements, SEMANTIC_CHECKS } from '../../scripts/news/impact-publication.mjs';
import { migrateImpactCatalog, persistedImpactAssessmentErrors, assessmentBasis } from '../../scripts/news/migrate-impact-assessments.mjs';
import { applyImpactOutput, impactReassessmentInput, discoverImpactJobs } from '../../scripts/news/bridge/impact.mjs';
import { ensureSemanticReview, importSemanticReviews, semanticOutputSchema } from '../../scripts/news/bridge/semantic-review.mjs';
import { bridgePath, hash, parsePacket } from '../../scripts/news/bridge/contract.mjs';
import { assertAutomaticImpactTransport } from '../../scripts/news/processing-mode.mjs';
const reviews = JSON.parse(fs.readFileSync('content/news/reviews/2026-09-10-impact-semantics.json')).reviews;
const catalog = JSON.parse(fs.readFileSync('data/news/stories.json')).stories;
const readyReview = () => ({ status:'ready', checks:Object.fromEntries(SEMANTIC_CHECKS.map(k=>[k,{status:'pass',rationale:'Im unabhängigen Prüfpass am jeweiligen Quellbeleg und Wirkpfad geprüft.'}])), findings:[] });
const bsw = () => { const r=reviews[0], record=structuredClone(catalog.find(s=>s.story_id===r.story_id));record.impact_sources=r.assessment_sources;return {a:structuredClone(r.impact_assessment),record}; };

test('backlog handoff fills a larger batch while reserving current-news and second-review capacity',async()=>{
  const records=Array.from({length:40},(_,i)=>({...structuredClone(bsw().record),story_id:`wt-batch-${i}`}));
  const jobs=new Map(),observations=new Map(),files=new Map();
  const bridge={maxPending:48,store:{all:async()=>[...jobs.values()],get:async id=>jobs.get(id),put:async j=>jobs.set(j.input.job_id,j),
    observe:async(k,v)=>observations.set(k,v),observation:async k=>observations.get(k)},
    transport:{writeAtomic:async(k,v)=>{assert.equal(files.has(k),false);files.set(k,v);}},failure:async(_j,_step,e)=>{throw e;}};
  const now='2026-09-10T12:00:00Z';
  assert.equal((await discoverImpactJobs(bridge,records,now)).length,18,'18 first passes plus 18 later reviews leave 12 slots free');
  assert.equal((await discoverImpactJobs(bridge,records,now)).length,0,'a manual rerun neither duplicates nor exceeds capacity');
  const parent=[...jobs.values()][0];
  jobs.set('review',{input:{job_id:'review',job_type:'impact_semantic_review',parent_job_id:parent.input.job_id},status:'queued'});
  assert.equal((await discoverImpactJobs(bridge,records,now)).length,0,'the actual review consumes its reserved slot, not another first pass');
  parent.status='acknowledged';parent.semantic_review={};jobs.get('review').status='acknowledged';
  await bridge.store.observe(`impact-checkpoint:${parent.candidate.story_id}:${assessmentBasis(parent.candidate)}`,{status:'publish'});
  assert.equal((await discoverImpactJobs(bridge,records,now)).length,1,'completed work immediately frees the next discovery batch slot');
  assert.equal(files.size,19);assert.equal(observations.get('impact-reassessment').reserved_news_slots,12);
});

test('the legacy automatic API path cannot reopen without an independent review transport',()=>{
  assert.throws(()=>assertAutomaticImpactTransport(),e=>e.message==='IMPACT_API_REVIEW_TRANSPORT_UNAVAILABLE' && e.providerNotCalled && e.requestAttempts===0);
});

test('uncertain implementation retains a sourced climate risk, large magnitude and separate evidence',()=>{
  const {a,record}=bsw(); const d=a.dimensions.planet;
  d.direction='negative';d.dominance='dominant_negative';d.secondary_paths=[d.primary_paths.pop()];d.likelihood='low';d.evidence='low';
  assert.deepEqual(semanticIssues(a,record),[]);
  const shown=deriveImpactPresentation(a).dimensions.planet;
  assert.equal(shown.label,'− Risiko');assert.equal(shown.magnitude,4);assert.equal(shown.likelihood_label,'gering');assert.equal(shown.evidence_label,'gering');
  d.magnitude=1;d.primary_paths[0].magnitude=1;d.likelihood='high';assert.equal(deriveImpactPresentation(a).dimensions.planet.magnitude,1);
});
test('known material path can have unresolved direction without losing the path',()=>{
  const {a}=bsw(),d=a.dimensions.human;d.direction='open';d.dominance='none';d.rationale='Die Verteilung zwischen den betrachteten Gruppen ist fachlich noch nicht hinreichend aufgelöst.';
  assert.equal(d.path_status,'material');assert.equal(deriveImpactPresentation(a).dimensions.human.path_status,'material');
  assert.deepEqual(impactAssessmentErrors(a,[...bsw().record.sources,...bsw().record.impact_sources]),[]);
});
test('dominant negative path is not averaged away by a smaller positive result',()=>{
  const {a,record}=bsw();assert.deepEqual(semanticIssues(a,record),[]);
  assert.equal(a.dimensions.human.dominance,'dominant_negative');assert.ok(a.dimensions.human.secondary_paths.some(p=>p.direction==='positive'));
  assert.equal(a.dimensions.planet.direction,'mixed');assert.equal(deriveImpactPresentation(a).dimensions.planet.label,'− überwiegend Risiko');
});
test('BSW power, institutional and both energy paths are present without an invented abolition of renewables',()=>{
  const {a,record}=bsw();assert.equal(impactContextRequirements(record).power,true);
  assert.equal(a.dimensions.democracy.path_status,'material');assert.equal(a.dimensions.democracy.direction,'negative');assert.equal(a.dimensions.democracy.temporal_status,'ex_ante');
  assert.ok(a.system_check.enablement.includes('enables_institutional_control'));
  assert.deepEqual(new Set(a.dimensions.planet.primary_paths.map(p=>p.direction)),new Set(['negative','positive']));
  assert.match(a.dimensions.planet.primary_paths[1].mechanism,/BSW fordert/);
  assert.ok(record.impact_sources.some(s=>s.source_role==='scientific_mechanism'));
  assert.doesNotMatch(a.dimensions.planet.primary_paths.map(p=>p.label+' '+p.mechanism).join(' '),/will.*Erneuerbare.*abschaffen/);
});
test('high relevance with absent central paths fails closed even after a nominally positive review',()=>{
  const {a,record}=bsw();for(const d of Object.values(a.dimensions))Object.assign(d,{path_status:'not_material',direction:'not_material',dominance:'none',magnitude:0,primary_paths:[],secondary_paths:[]});
  const first=derivePublicationStatus(a,record);assert.equal(first.status,'needs_second_pass');assert.ok(first.issues.includes('IMPACT_HIGH_RELEVANCE_WITHOUT_PATH'));
  assert.equal(derivePublicationStatus(a,record,{review:readyReview(),secondPassComplete:true}).status,'needs_review');
});
test('clear emissions rationale cannot hide behind an open direction',()=>{
  const {a,record}=bsw();a.dimensions.planet.direction='open';a.dimensions.planet.dominance='none';a.dimensions.planet.rationale='Die Maßnahme würde die Emissionen erhöhen und lange fossile Bindungen schaffen.';
  assert.ok(semanticIssues(a,record).includes('IMPACT_DIRECTION_RATIONALE_CONFLICT:planet'));
});
test('a recorded casualty cannot be published as a future risk',()=>{
  const r=reviews[2],a=structuredClone(r.impact_assessment),record=catalog.find(s=>s.story_id===r.story_id);
  assert.equal(deriveImpactPresentation(a).dimensions.human.label,'− beobachtet');
  a.dimensions.human.temporal_status='ex_ante';assert.ok(semanticIssues(a,record).includes('IMPACT_OCCURRED_HARM_AS_RISK'));
});
test('migration is idempotent and preserves every original article and source byte',()=>{
  const first=migrateImpactCatalog(catalog),second=migrateImpactCatalog(first.records);
  assert.equal(second.report.changed,0);
  for(let i=0;i<catalog.length;i++)for(const k of ['title','source_summary','analysis','sources','versions'])assert.deepEqual(first.records[i][k],catalog[i][k]);
  assert.ok(first.report.needs_reassessment>0);assert.equal(first.report.errors.length,0);
});
test('historical validation accepts only a reproducible conservative projection',()=>{
  const record=structuredClone(migrateImpactCatalog(catalog).records.find(r=>r.impact_assessment?.review?.status==='needs_reassessment'));
  assert.deepEqual(persistedImpactAssessmentErrors(record),[]);
  record.impact_assessment.dimensions.human.magnitude=5;
  assert.deepEqual(persistedImpactAssessmentErrors(record),['IMPACT_LEGACY_PROJECTION_MODIFIED']);
  record.impact_assessment.review.status='reassessed';
  assert.ok(persistedImpactAssessmentErrors(record).length>0);
});
test('persisted current profiles still require full structure and current source binding',()=>{
  const {a,record}=bsw();record.impact_assessment=a;record.impact_assessment_basis=assessmentBasis(record);
  assert.deepEqual(persistedImpactAssessmentErrors(record),[]);
  record.impact_assessment.dimensions.human.likelihood='invented';
  assert.ok(persistedImpactAssessmentErrors(record).includes('IMPACT_DIMENSION_INVALID:human'));
  record.sources[0].title+=' changed';
  assert.deepEqual(persistedImpactAssessmentErrors(record),['IMPACT_PERSISTED_BASIS_MISMATCH']);
});
test('metadata import refuses stale sources and source-foreign paths and leaves prose untouched',()=>{
  const {a,record}=bsw(),now='2026-09-10T12:00:00Z',input=impactReassessmentInput(record,now),job={input,candidate:record};
  const out={schema_version:'1.0',job_id:input.job_id,input_hash:input.input_hash,processed_at:now,decision:{status:'publish',reason:'Nachrichtenanlass und Wirkungspotenzial fachlich getrennt.'},impact_assessment:a};
  const changed=applyImpactOutput(out,job,record,now);
  for(const key of ['analysis','source_summary','title','sources','versions'])assert.deepEqual(changed[key],record[key]);
  assert.equal(changed.impact_assessment.review.status,'reassessed');
  assert.throws(()=>applyImpactOutput(out,job,{...record,content_hash:'new'},now),/BRIDGE_STALE_ANALYSIS/);
  out.impact_assessment.dimensions.human.primary_paths[0].source_ids=['invented'];assert.throws(()=>applyImpactOutput(out,job,record,now),/BRIDGE_PUBLICATION_GATE_FAILED/);
});
test('separate review job is mandatory, idempotent, source-bound, and cannot be self-approved',async()=>{
  const {a,record}=bsw(),now='2026-09-10T12:00:00Z',input=impactReassessmentInput(record,now),parent={input,candidate:record,attempts:{},status:'queued'};
  const jobs=new Map([[input.job_id,parent]]),files=new Map();
  const bridge={stageOnly:false,store:{get:async id=>jobs.get(id),put:async j=>jobs.set(j.input.job_id,j),all:async()=>[...jobs.values()],observation:async()=>null},
    transport:{writeAtomic:async(p,v)=>{if(files.has(p))assert.equal(files.get(p),JSON.stringify(v));files.set(p,JSON.stringify(v));},list:async folder=>[...files.keys()].filter(p=>p.includes('/'+folder+'/')).map(p=>({name:p.split('/').at(-1)})),read:async p=>files.get(p)},failure:async(_j,_s,e)=>{throw e;}};
  const output={data:'first writer',review:readyReview()};
  assert.equal((await ensureSemanticReview(bridge,parent,output,record,a,now)).status,'needs_second_pass');
  await ensureSemanticReview(bridge,parent,output,record,a,now);assert.equal(jobs.size,2);
  const child=[...jobs.values()].find(j=>j.input.parent_job_id===input.job_id);assert.match(child.input.job_id,/^wt_\d{8}T\d{6}Z_[a-f0-9]{24}$/);
  assert.deepEqual(child.input.validation_findings,[]);
  assert.notEqual(child.input.job_id,input.job_id);
  const result={schema_version:'1.0',job_id:child.input.job_id,input_hash:child.input.input_hash,processed_at:now,review:readyReview(),impact_assessment:a};
  await bridge.transport.writeAtomic(bridgePath('20_OUTPUT_READY',child.input.job_id+'.output.json'),result);
  await importSemanticReviews(bridge,now);
  assert.equal((await ensureSemanticReview(bridge,parent,output,record,a,now)).status,'ready');
  assert.equal((await ensureSemanticReview(bridge,parent,{data:'edited first output'},record,a,now)).status,'needs_second_pass');
  const conflicting=structuredClone(a);conflicting.dimensions.planet.direction='open';
  conflicting.dimensions.planet.rationale='Wenn die Maßnahme umgesetzt wird, würden die CO2-Emissionen steigen.';
  await ensureSemanticReview(bridge,parent,{data:'contradictory first output'},record,conflicting,now);
  const invalidChild=[...jobs.values()].find(j=>j.input.proposed_assessment?.dimensions.planet.direction==='open');
  assert.ok(invalidChild.input.validation_findings.includes('IMPACT_DIRECTION_RATIONALE_CONFLICT:planet'));
  parent.semantic_review={output_hash:hash(output),assessment:a,review:{status:'ready',checks:Object.fromEntries(SEMANTIC_CHECKS.map(key=>[key,'geprüft']))}};
  const oldHash=hash({parent:input.job_id,outputHash:hash(output),assessment:a,record});
  const oldId=`${input.job_id.slice(0,20)}${hash({kind:'impact_semantic_review',inputHash:oldHash}).slice(0,24)}`;
  const oldJob={input:{job_id:oldId,input_hash:oldHash,parent_job_id:input.job_id},status:'acknowledged',ack:{status:'hold'}};
  jobs.set(oldId,structuredClone(oldJob));jobs.delete(child.input.job_id);
  assert.equal((await ensureSemanticReview(bridge,parent,output,record,a,now)).status,'needs_second_pass','malformed legacy receipt is not treated as a completed independent review');
  assert.notEqual(parent.publication_gate.review_job_id,oldId);
  assert.equal(jobs.get(parent.publication_gate.review_job_id).input.review_protocol,'structured-checks-1');
  assert.deepEqual(jobs.get(oldId),oldJob,'old acknowledgment and error history stay unchanged');
});
test('a bare checked label is a repairable output schema error, never a completed semantic review',()=>{
  const {a}=bsw(),o={schema_version:'1.0',job_id:'wt_20260910T120000Z_aaaaaaaaaaaaaaaaaaaaaaaa',input_hash:'a'.repeat(64),processed_at:'2026-09-10T12:00:00Z',review:readyReview(),impact_assessment:a};
  assert.doesNotThrow(()=>parsePacket(JSON.stringify(o),semanticOutputSchema));
  o.review.checks.event_target='geprüft';assert.throws(()=>parsePacket(JSON.stringify(o),semanticOutputSchema),/BRIDGE_SCHEMA_INVALID/);
});
