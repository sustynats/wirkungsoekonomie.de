import test from 'node:test';
import assert from 'node:assert/strict';
import { REVIEW_RESPONSE_FORMAT } from '../../scripts/news/bridge/review-response-schema.mjs';
import { deriveAssessmentCalculations, impactAssessmentErrors } from '../../scripts/news/impact-assessment.mjs';
import { syntheticPotentialAssessment, syntheticPotentialPath } from './fixtures/impact21.mjs';
import { SEMANTIC_CHECKS } from '../../scripts/news/impact-publication.mjs';
import { FACTOR_KEYS } from '../../scripts/news/impact-magnitude.mjs';
import { researchSourceSchema } from '../../scripts/news/bridge/research-source-schema.mjs';
import { canonicalResearchIdentifiers } from '../../scripts/news/bridge/api-processor.mjs';

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
 assert.ok(root.properties.impact_assessment.anyOf[0].required.includes('research_check'));
 assert.equal(root.properties.impact_assessment.anyOf[1].type,'null');
 assert.ok(root.properties.assessment_confirmation.anyOf[0].required.includes('path_research'));
 assert.equal(root.$defs.path.properties.magnitude,undefined);
 for(const key of ['magnitude','direction','dominance']) assert.equal(root.$defs.dimension.properties[key],undefined);
 assert.deepEqual(root.$defs.main_path.properties.type.enum,['main_path','counter_path']);
 assert.equal(root.properties.research_sources.maxItems,2);
 assert.equal(root.$defs.factor.properties.source_ids.minItems,1);
 for(const key of ['source_id','title','publisher','quote','supports'])
  assert.deepEqual(root.properties.research_sources.items.properties[key],researchSourceSchema.items.properties[key]);
});

test('exact research URL identifiers normalize throughout references without changing the evidence or text',()=>{
 const url='https://example.org/report',a={research_sources:[{source_id:url,url,quote:'Unchanged original quotation'}],impact_assessment:{source_functions:[{source_id:url}],dimensions:{human:{primary_paths:[{source_ids:[url,'original'],mechanism:url}]}}}};
 canonicalResearchIdentifiers(a);
 const id=a.research_sources[0].source_id;
 assert.match(id,/^research-[a-f0-9]{32}$/);
 assert.equal(a.research_sources[0].url,url);assert.equal(a.research_sources[0].quote,'Unchanged original quotation');
 assert.equal(a.impact_assessment.source_functions[0].source_id,id);
 assert.deepEqual(a.impact_assessment.dimensions.human.primary_paths[0].source_ids,[id,'original']);
 assert.equal(a.impact_assessment.dimensions.human.primary_paths[0].mechanism,url);
 const duplicate={research_sources:[{source_id:url,url},{source_id:url,url}]};
 canonicalResearchIdentifiers(duplicate);assert.equal(duplicate.research_sources[0].source_id,url);
 const informal={research_sources:[{source_id:'publisher-id',url}],source_ids:['publisher-id']};
 canonicalResearchIdentifiers(informal,[{source_id:'publisher-id',url}]);
 assert.equal(informal.source_ids[0],id);
 const retarget={research_sources:[{source_id:'publisher-id',url:'https://other.example.org/report'}]};
 canonicalResearchIdentifiers(retarget,[{source_id:'publisher-id',url}]);
 assert.equal(retarget.research_sources[0].source_id,'publisher-id');
 const exact={research_sources:[{source_id:'research-actual-source',url,quote:'Exact source words.'}],source_ids:[url,'nonexistent']};
 canonicalResearchIdentifiers(exact);
 assert.deepEqual(exact.source_ids,['research-actual-source','nonexistent']);
 assert.equal(exact.research_sources[0].quote,'Exact source words.');
 const ambiguous={research_sources:[{source_id:'research-one',url},{source_id:'research-two',url}],source_ids:[url]};
 canonicalResearchIdentifiers(ambiguous);assert.deepEqual(ambiguous.source_ids,[url]);
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
