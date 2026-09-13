// The existing media-analysis input, expressed as a strict generation contract.
// Normalization and publication validation remain in media-impact.mjs.
const text={type:'string'}, bool={type:'boolean'};
const en=values=>({type:'string',enum:values.split('|')});
const arr=items=>({type:'array',items});
const obj=properties=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
const texts=arr(text), refs=arr(obj({source:text,claim_supported:text}));
const level=en('none|low|medium|high|open');
export const MEDIA_REVIEW_SCHEMA={anyOf:[
 obj({relevant:{type:'boolean',enum:[false]},reason:{...text,minLength:30}}),
 obj({relevant:{type:'boolean',enum:[true]},reason:{...text,minLength:30},
  relevance_level:en('low|medium|high|very_high'),factual_core:text,
  epistemic_status:obj({confirmed:{...texts,minItems:1},actor_claims:texts,open:{...texts,minItems:1}}),
  attribution:obj({frame_source:text,speaker:text,original_term:text,usage_type:en('direct_quote|indirect_quote|paraphrase|editorial|unknown'),
   placement:arr(en('headline|teaser|body|quote|caption|comment')),attribution_quality:en('clear|clear_but_prominent|late|unclear|editorial|unknown')}),
  frame_analysis:obj({frame_detected:bool,frame_term:text,frame_type:texts,problem_definition:text,implied_cause:text,
   implied_responsibility:text,implied_threat:text,implied_solution_space:text,material_omissions:texts}),
  political_context:obj({relevant:bool,classification:text,evidence_based:bool,evidence:refs,uncertainty:text}),
  discourse_effect:obj({impact_status:en('potential|risk|observed|open'),resonance_space:text,normalization_potential:level,
   repetition_risk:level,polarization_potential:text,trust_effect_potential:text,discourse_effect_potential:text}),
  impact_path:obj({first_order:text,second_order:text,third_order:text}),
  evidence:obj({level:en('high|medium|low|open'),facts:{...texts,minItems:1},observations:texts,inferences:{...texts,minItems:1},
   impact_potentials:texts,impact_risks:texts,observed_impacts:texts,limitations:{...texts,minItems:1}}),
  observed_impact:obj({present:bool,description:{type:['string','null']},evidence:refs}),
  public_explanation:{...text,description:'100–180 Wörter, eigene quellengebundene Erklärung; keine gemessene Medienwirkung ohne Beleg.'},
  fact_first_alternative:text,
  self_frame_check:obj({problem_detected:bool,problems:texts,frame_repetition_count:{type:'integer',minimum:0},rewrite_required:bool,
   recommended_title:text,recommended_summary:text,recommended_meta_description:text}),
  source_comparison:obj({sufficient_basis:bool,finding:text}),
 }),
]};
