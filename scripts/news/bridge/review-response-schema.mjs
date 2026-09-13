import { IMPACT_VERSION, TARGET_TYPES, TEMPORAL, EVIDENCE, LIKELIHOOD } from '../impact-assessment.mjs';
import { POTENTIAL_REVISION, PATH_QUALITIES } from '../impact-potential.mjs';
import { FACTOR_KEYS } from '../impact-magnitude.mjs';
import { SEMANTIC_CHECKS } from '../impact-publication.mjs';
import { RESEARCH_FUNCTIONS } from './research-source-schema.mjs';

const string={type:'string'}, boolean={type:'boolean'}, score={type:'integer',enum:[0,1,2,3,4,5]};
const en=values=>({type:'string',enum:values});
const array=items=>({type:'array',items});
const object=properties=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
const strings=array(string), ref=name=>({$ref:'#/$defs/'+name});
const direction=en(['positive','negative','neutral','open']);
const factors=object(Object.fromEntries(FACTOR_KEYS.map(key=>[key,ref('factor')])));
const boundary=object({decisive:boolean,rationale:string,reference_frame:string,source_ids:strings,status:en(['observed','conditional','not_decisive'])});
const pathProperties={
 direction,label:string,mechanism:string,recipients:strings,evidence:en(Object.keys(EVIDENCE)),
 temporal_status:en(['ex_ante','ongoing']),same_target:boolean,same_baseline:boolean,
 type:en(['main_path','counter_path','side_effect','side_risk']),likelihood:en(Object.keys(LIKELIHOOD)),source_ids:strings,
 condition:string,reference_space:string,time_horizon:string,path_quality:array(en(PATH_QUALITIES)),
 epistemic_basis:en(['supported_mechanism','model_hypothesis']),assumptions:string,source_support:string,limitations:string,
 first_order:string,second_order:string,third_order:string,
 magnitude_range:object({lower:score,upper:score,rationale:string}),negligibility_rationale:string,
 observed_signal:object({change:{type:['string','null']},source_ids:strings}),
 research_pass:en(['initial','second_pass']),research_result:string,magnitude_factors:factors,protection_boundary:boundary,
};
const dimension=object({path_status:en(['modelled']),likelihood:en(Object.keys(LIKELIHOOD)),evidence:en(Object.keys(EVIDENCE)),
 data_status:en(['modelled','estimated']),temporal_status:en(['ex_ante','ongoing']),
 primary_paths:array(ref('main_path')),secondary_paths:array(ref('path')),rationale:string,
 balance:{anyOf:[object({rationale:string}),{type:'null'}]},
});
const assessment=object({version:en([IMPACT_VERSION]),semantics_revision:en([POTENTIAL_REVISION]),news_event:string,
 evaluation_target:object({label:string,type:en(TARGET_TYPES)}),baseline:string,temporal_status:en(TEMPORAL),
 systemic_relevance:{type:['string','null'],enum:['low','medium','high','very_high','critical',null]},
 counterfactual:string,reference_frame:strings,
 system_check:object({cross_dimension_review:object({human:string,planet:string,democracy:string}),
  central_dimensions:array(en(['human','planet','democracy'])),first_order:string,second_order:string,third_order:string,
  enablement:strings,counter_evidence:strings,source_independence:string,institutional_status:string}),
 research_check:object({status:{...en(['completed','needs_research']),description:'completed: konkrete Fragen tatsächlich geprüft, auch wenn keine zusätzliche Quelle gefunden wurde. Wissensgrenzen separat in gaps und searches dokumentieren. needs_research: notwendige Prüfung noch nicht durchgeführt.'},
  source_functions:array(object({source_id:string,functions:array(en(RESEARCH_FUNCTIONS)),supported_claim:string})),gaps:strings,
  searches:array(object({question:string,result:string,source_ids:strings}))}),
 observed_effects:array(object({dimension:en(['human','planet','democracy']),change:string,
  direction:en(['positive','negative','mixed','neutral','open']),source_ids:strings,data_status:en(['measured','observed','secondary_source']),
  evidence:en(['high','medium','low']),attribution:en(['established','open']),reference_frame:string,reference_space:string,
  observed_at:string,temporal_status:en(['ongoing','ex_post']),mechanism:string,recipients:strings,time_horizon:string,
  same_target:boolean,same_baseline:boolean,magnitude_factors:factors,protection_boundary:boundary})),
 dimensions:object({human:ref('dimension'),planet:ref('dimension'),democracy:ref('dimension')}),
});

// Arithmetic and dimension aggregates are software-owned. Empty paths/strings
// can express an incomplete blocked review; only the domain gate can publish.
export const REVIEW_RESPONSE_FORMAT={type:'json_schema',name:'impact_review_factors_v1',strict:true,
 schema:{...object({
  review:object({status:en(['ready','needs_review','blocked']),checks:object(Object.fromEntries(SEMANTIC_CHECKS.map(key=>[key,
   object({status:en(['pass','fail']),rationale:string})]))),findings:strings}),
  impact_assessment:assessment,
  research_sources:array(object({source_id:string,url:string,title:string,publisher:string,source_function:en(RESEARCH_FUNCTIONS),quote:string,supports:string,published_at:{type:['string','null']}})),
 }),$defs:{factor:object({value:score,rationale:string,source_ids:strings}),path:object(pathProperties),
  main_path:object({...pathProperties,type:en(['main_path','counter_path']),same_target:{type:'boolean',enum:[true]},same_baseline:{type:'boolean',enum:[true]}}),dimension}},
};
