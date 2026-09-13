import test from 'node:test';
import assert from 'node:assert/strict';
import { REVIEW_RESPONSE_FORMAT } from '../../scripts/news/bridge/review-response-schema.mjs';
import { deriveAssessmentCalculations, impactAssessmentErrors } from '../../scripts/news/impact-assessment.mjs';
import { syntheticPotentialAssessment, syntheticPotentialPath } from './fixtures/impact21.mjs';
import { SEMANTIC_CHECKS } from '../../scripts/news/impact-publication.mjs';
import { FACTOR_KEYS } from '../../scripts/news/impact-magnitude.mjs';

test('review decoding has a closed fully required domain schema instead of unrestricted nested objects',()=>{
 const format=REVIEW_RESPONSE_FORMAT, root=format.schema;
 assert.equal(format.strict,true);assert.ok(JSON.stringify(format).length<40000);
 const visit=value=>{
  if (!value || typeof value!=='object') return;
  if (value.type==='object') {
   assert.equal(value.additionalProperties,false);
   assert.deepEqual(value.required,Object.keys(value.properties));
  }
  if (value.$ref) assert.ok(root.$defs[value.$ref.split('/').at(-1)]);
  Object.values(value).forEach(visit);
 };visit(root);
 assert.deepEqual(root.properties.review.properties.checks.required,SEMANTIC_CHECKS);
 assert.deepEqual(root.$defs.path.properties.magnitude_factors.required,FACTOR_KEYS);
 assert.ok(root.$defs.path.required.includes('protection_boundary'));
 assert.ok(root.properties.impact_assessment.required.includes('research_check'));
 assert.equal(root.$defs.path.properties.magnitude,undefined);
 for(const key of ['magnitude','direction','dominance']) assert.equal(root.$defs.dimension.properties[key],undefined);
 assert.deepEqual(root.$defs.main_path.properties.type.enum,['main_path','counter_path']);
});

test('arithmetic and aggregation follow given factors and path roles without inventing editorial judgments',()=>{
 const a=syntheticPotentialAssessment();const human=a.dimensions.human;
 human.primary_paths=[syntheticPotentialPath({direction:'positive',magnitude:2}),syntheticPotentialPath({direction:'negative',magnitude:4,type:'counter_path'})];
 human.balance={rationale:'Die beiden konkreten Testpfade werden anhand ihrer Tragweiten verglichen.'};
 const values=structuredClone(human.primary_paths.map(p=>({factors:p.magnitude_factors,direction:p.direction,source_ids:p.source_ids})));
 for(const d of Object.values(a.dimensions)){delete d.magnitude;delete d.direction;delete d.dominance;
  for(const p of d.primary_paths) delete p.magnitude;}
 deriveAssessmentCalculations(a);
 assert.equal(human.direction,'mixed');assert.equal(human.dominance,'dominant_negative');assert.equal(human.magnitude,4);
 assert.equal(human.primary_paths[0].magnitude,2);assert.equal(human.primary_paths[1].magnitude,4);
 assert.deepEqual(human.primary_paths.map(p=>({factors:p.magnitude_factors,direction:p.direction,source_ids:p.source_ids})),values);
 assert.deepEqual(impactAssessmentErrors(a,[{source_id:'official'}],{required:true}),[]);
});
test('missing factors and wrongly placed side risks remain invalid, never inferred from an old bar',()=>{
 const a=syntheticPotentialAssessment(),p=a.dimensions.human.primary_paths[0];
 p.magnitude=null;delete p.magnitude_factors.reach;
 a.dimensions.planet.primary_paths[0].type='side_risk';a.dimensions.planet.direction='open';
 deriveAssessmentCalculations(a);
 assert.equal(p.magnitude,null);assert.equal(a.dimensions.planet.direction,'open');
 const errors=impactAssessmentErrors(a,[{source_id:'official'}],{required:true});
 assert.ok(errors.includes('IMPACT_FACTOR_REQUIRED:reach:human'));assert.ok(errors.includes('IMPACT_MAIN_SCOPE_REQUIRED:planet'));
});
test('a software-calculated protection floor cannot manufacture support for that boundary',()=>{
 const a=syntheticPotentialAssessment(),p=a.dimensions.human.primary_paths[0];
 p.protection_boundary.decisive=true;
 deriveAssessmentCalculations(a);
 assert.equal(p.magnitude,4);
 assert.ok(impactAssessmentErrors(a,[{source_id:'official'}],{required:true}).includes('IMPACT_BOUNDARY_UNSUPPORTED:human'));
});
