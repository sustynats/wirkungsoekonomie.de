import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveImpactPresentation, migrateImpactAssessment, impactAssessmentErrors, IMPACT_RULE } from '../../scripts/news/impact-assessment.mjs';
import { retainPotentialHistory } from '../../scripts/news/impact-potential.mjs';
import { renderDimensionMeters } from '../../scripts/news/visuals.mjs';
import { syntheticPotentialAssessment as profile, syntheticPotentialPath as path, syntheticFactors } from './fixtures/impact21.mjs';
const sources=[{source_id:'official',url:'https://example.org/original'}];
const check=a=>impactAssessmentErrors(a,sources);
const render=a=>renderDimensionMeters({impact_assessment:a,sources},{context:{privateImpactPreview:true}});

test('future proposal separates event, evaluation target, direction, likelihood and three numeric potentials',()=>{
 const a=profile();assert.deepEqual(check(a),[]);const p=deriveImpactPresentation(a);
 assert.equal(p.show_target,true);assert.equal(p.dimensions.human.label,'+ Potenzial');
 for(const key of ['human','planet','democracy']){assert.ok(a.dimensions[key].primary_paths.length);assert.equal(a.dimensions[key].magnitude,3);}
 assert.equal((render(a).match(/data-magnitude="3"/g)||[]).length,3);
});
test('a zero pathway stays documented, displayed and separate from direction',()=>{
 const a=profile(),d=a.dimensions.planet;d.direction='open';d.dominance='none';d.magnitude=0;d.primary_paths=[path({direction:'open',magnitude:0})];
 assert.deepEqual(check(a),[]);const html=render(a);assert.match(html,/data-magnitude="0"/);assert.match(html,/Richtung offen/);assert.doesNotMatch(html,/kein(?: belastbarer| wesentlicher)? Wirkpfad/iu);
 delete d.primary_paths[0].negligibility_rationale;assert.ok(check(a).includes('IMPACT_ZERO_SCOPE_REQUIRED:planet'));
});
test('null, missing paths and old not_material/insufficient_basis cannot pass as a completed assessment',()=>{
 for(const key of ['human','planet','democracy']){
  const a=profile();a.dimensions[key].magnitude=null;assert.ok(check(a).includes('IMPACT_POTENTIAL_MAGNITUDE_REQUIRED:'+key));
  a.dimensions[key].magnitude=3;a.dimensions[key].primary_paths=[];assert.ok(check(a).includes('IMPACT_POTENTIAL_PATH_REQUIRED:'+key));
  for(const status of ['not_material','insufficient_basis']){a.dimensions[key].path_status=status;assert.ok(check(a).includes('IMPACT_POTENTIAL_PATH_REQUIRED:'+key));}
 }
});
test('large potential retains size with uncertain direction and likelihood',()=>{
 const a=profile(),d=a.dimensions.human;Object.assign(d,{direction:'open',dominance:'none',magnitude:5,evidence:'low',likelihood:'very_low'});
 d.primary_paths=[path({direction:'open',magnitude:5,evidence:'low',likelihood:'very_low',epistemic_basis:'model_hypothesis',path_quality:['high_uncertainty']})];
 assert.deepEqual(check(a),[]);const p=deriveImpactPresentation(a);assert.equal(p.dimensions.human.magnitude,5);assert.equal(p.dimensions.human.evidence_label,'gering');
 d.primary_paths[0].research_pass='initial';assert.ok(check(a).includes('IMPACT_POTENTIAL_SECOND_PASS_REQUIRED:human'));
});
test('a model hypothesis cannot be promoted to high evidence by filling a compulsory field',()=>{
 const a=profile();a.dimensions.planet.primary_paths[0].epistemic_basis='model_hypothesis';
 assert.ok(check(a).includes('IMPACT_HYPOTHESIS_EVIDENCE_CONFLICT:planet'));
});
test('range must contain the calculated score and sources cannot be invented',()=>{
 const a=profile(),p=a.dimensions.planet.primary_paths[0];p.magnitude_range.upper=2;
 assert.ok(check(a).includes('IMPACT_POTENTIAL_RANGE_REQUIRED:planet'));p.magnitude_range.upper=3;p.source_ids=['invented'];
 assert.ok(check(a).includes('IMPACT_PATH_SOURCE_BINDING_REQUIRED:planet'));
});
test('minor secondary risk does not create a balanced main verdict',()=>{
 const a=profile();a.dimensions.democracy.secondary_paths=[path({direction:'negative',magnitude:1,type:'side_risk',evidence:'low'})];
 assert.deepEqual(check(a),[]);assert.equal(deriveImpactPresentation(a).dimensions.democracy.direction,'positive');
});
test('genuinely opposing main paths need justified balance and dominance',()=>{
 const a=profile(),d=a.dimensions.human;d.primary_paths.push(path({direction:'negative',magnitude:3}));d.direction='mixed';d.dominance='balanced';
 assert.ok(check(a).includes('IMPACT_BALANCE_REQUIRED:human'));d.balance={comparable_material_paths:true,protection_boundary_decisive:false,rationale:'Die vorgegebenen Testpfade sind im gleichen Referenzraum gleich stark.'};assert.deepEqual(check(a),[]);
});
test('forest fire consequences are observed while future ecosystem potentials remain; attribution stays separate',()=>{
 const a=profile();a.temporal_status='ex_post';a.observed_effects=[{...path({direction:'negative',magnitude:4}),temporal_status:'ex_post',dimension:'planet',change:'Eine abgegrenzte Waldfläche ist im synthetischen Testfall verbrannt.',direction:'negative',source_ids:['official'],data_status:'observed',evidence:'high',attribution:'open',reference_frame:'Erhalt der im Test definierten Ökosystemfunktionen.',reference_space:'Die abgegrenzte Waldfläche des synthetischen Testfalls.',observed_at:'Der dokumentierte Ereignistag im synthetischen Test.'}];
 assert.deepEqual(check(a),[]);const html=render(a);assert.match(html,/beobachtete Wirkung/);assert.match(html,/Ursachenattribution bleibt gesondert offen/);assert.equal((html.match(/class="wt-dim wt-dim--/g)||[]).length,3);assert.equal((html.match(/data-magnitude=/g)||[]).length,4,'observation and retained potential have independent bars');
 assert.equal(deriveImpactPresentation(a).dimensions.planet.label,'+ Potenzial','future restoration potential is not overwritten by observed harm');
 a.observed_effects[0].source_ids=['invented'];assert.ok(check(a).includes('IMPACT_OBSERVED_EFFECT_INVALID'));
});
test('an ex-post enum alone never creates observed effects',()=>{
 const a=profile();a.temporal_status='ex_post';assert.deepEqual(check(a),[]);assert.doesNotMatch(render(a),/beobachtete Wirkung:/);
 a.dimensions.human.temporal_status='ex_post';assert.ok(check(a).includes('IMPACT_POTENTIAL_STATUS_INVALID:human'));
});
test('original potential survives later revisions without backdating a retrospective prediction',()=>{
 const record={},a=profile();retainPotentialHistory(record,a,{at:'2026-09-10T10:00:00Z',jobId:'first',retrospective:true});
 const original=JSON.stringify(record.original_potential_assessment);a.dimensions.human.rationale='Neue belastbare Erkenntnisse verändern die heutige Einordnung.';
 retainPotentialHistory(record,a,{at:'2026-09-10T11:00:00Z',jobId:'second'});
 assert.equal(JSON.stringify(record.original_potential_assessment),original);assert.equal(record.original_potential_assessment.origin,'retrospective_reassessment');assert.equal(record.current_potential_assessment.job_id,'second');
});
test('legacy migration preserves original data and never fabricates completed potential values',()=>{
 const raw={analysis_type:'ex_ante',human:{relevance:'sehr hoch',tendency:'gemischt'}};const before=JSON.stringify(raw),a=migrateImpactAssessment(raw,{title:'Originaltitel bleibt unverändert'});
 assert.equal(a.review.status,'needs_reassessment');assert.equal(a.dimensions.human.magnitude,null);assert.ok(check(a).length);assert.equal(JSON.stringify(raw),before);assert.deepEqual(migrateImpactAssessment({impact_assessment:a}),a);
});
test('communication and dossier targets are supported without political identity rules',()=>{
 const a=profile();a.evaluation_target={label:'Verbreitung eines wiederholten öffentlichen Narrativs',type:'communication'};assert.deepEqual(check(a),[]);
 a.evaluation_target={label:'Der fortbestehende Gegenstand einer übergeordneten Lageakte',type:'dossier'};assert.deepEqual(check(a),[]);
 assert.match(IMPACT_RULE,/ALLE DREI/);assert.match(IMPACT_RULE,/original\/current_potential_assessment/);
});
test('the six factors, not the direction or prior relevance, determine magnitude',()=>{
 const a=profile(),p=a.dimensions.human.primary_paths[0];p.magnitude_factors=syntheticFactors(1,['official']);
 assert.ok(check(a).includes('IMPACT_MAGNITUDE_CALCULATION_MISMATCH:human'));
});
