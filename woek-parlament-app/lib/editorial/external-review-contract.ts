import { z } from "zod";

const sourceRefSchema = z.object({
  source_id: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url(),
  location: z.string().min(1),
  publication_date: z.string().min(1).optional(),
  accessed_at: z.string().min(1).optional()
});

const evidenceItemSchema = z.object({
  statement: z.string().min(1),
  source_refs: z.array(z.string().min(1)).min(1),
  status: z.enum(["OBSERVED", "MODELLED", "ESTIMATED", "UNRESOLVED", "DATA_GAP"]),
  note: z.string().min(1)
});

const impactPathSchema = z.object({
  impact_id: z.string().min(1),
  order: z.enum(["FIRST", "SECOND", "THIRD"]),
  mechanism: z.string().min(1),
  direction: z.enum(["POTENTIALLY_POSITIVE", "POTENTIALLY_NEGATIVE", "MIXED", "UNRESOLVED"]),
  source_refs: z.array(z.string().min(1)).min(1),
  uncertainty: z.string().min(1)
});

const counterfactualSchema = z.object({
  type: z.enum(["STATUS_QUO", "TREND_CONTINUATION", "CONTROL_GROUP", "COMPARISON_REGION", "MODELLED_COUNTERFACTUAL", "EXTERNAL_EVALUATION", "UNKNOWN"]),
  description: z.string().min(1),
  source_refs: z.array(z.string().min(1)),
  limitations: z.string().min(1)
});

const calculationRequirementSchema = z.object({
  impact_id: z.string().min(1),
  baseline: z.object({ description: z.string().min(1), source_refs: z.array(z.string().min(1)) }),
  counterfactual: z.object({ description: z.string().min(1), type: counterfactualSchema.shape.type, source_refs: z.array(z.string().min(1)) }),
  required_operands: z.array(z.object({ name: z.string().min(1), unit: z.string().min(1), source_refs: z.array(z.string().min(1)), status: z.enum(["AVAILABLE", "DATA_GAP", "AI_GENERATED_NUMERIC_VALUE"]) })),
  formula_or_rule: z.string().min(1),
  attribution_requirement: z.string().min(1),
  uncertainty: z.string().min(1),
  source_refs: z.array(z.string().min(1))
});

const candidateAssessmentSchema = z.object({
  status: z.literal("AI_SUGGESTION"),
  candidate_option: z.string().min(1).nullable(),
  reasoning_components: z.array(z.string().min(1)),
  source_refs: z.array(z.string().min(1)),
  uncertainty: z.string().min(1)
});

export const historicalReviewResultSchema = z.object({
  case_id: z.string().min(1),
  review_status: z.enum(["READY_FOR_EDITORIAL_REVIEW", "SOURCE_INCOMPLETE", "DATA_GAP", "METHOD_REVIEW_REQUIRED"]),
  source_completeness: z.object({
    decision_object: z.boolean(),
    final_version: z.boolean(),
    decision_outcome: z.boolean(),
    ex_ante_evidence: z.boolean(),
    ex_post_evidence: z.boolean(),
    woek_reference_snapshot: z.boolean(),
    notes: z.array(z.string())
  }),
  decision: z.object({
    decision_object: z.string().min(1),
    decision_date: z.string().min(1),
    final_version: z.string().min(1),
    actual_outcome: z.string().min(1),
    vote_type: z.string().min(1),
    vote_result: z.record(z.string(), z.unknown()),
    sources: z.array(sourceRefSchema).min(1)
  }),
  ex_ante: z.object({
    knowledge_cutoff: z.string().min(1),
    official_objectives: z.array(evidenceItemSchema),
    available_evidence: z.array(evidenceItemSchema),
    counterfactuals: z.array(counterfactualSchema),
    impact_paths: z.array(impactPathSchema),
    candidate_woek_assessment: candidateAssessmentSchema
  }),
  ex_post: z.object({
    observation_cutoff: z.string().min(1),
    observed_state_changes: z.array(evidenceItemSchema),
    causal_evidence: z.array(evidenceItemSchema),
    side_effects: z.array(evidenceItemSchema),
    impact_paths_confirmed: z.array(z.string().min(1)),
    impact_paths_not_confirmed: z.array(z.string().min(1)),
    candidate_woek_assessment: candidateAssessmentSchema
  }),
  calculation_requirements: z.array(calculationRequirementSchema),
  normative_mapping: z.object({
    woek_ids: z.array(z.string().min(1)),
    sdgs: z.array(z.string().min(1)),
    sdg_plus: z.array(z.string().min(1)),
    human: z.array(z.string().min(1)),
    planet: z.array(z.string().min(1)),
    democracy: z.array(z.string().min(1))
  }),
  risks_and_boundaries: z.array(evidenceItemSchema),
  data_gaps: z.array(z.object({ question: z.string().min(1), impact: z.string().min(1), source_refs_checked: z.array(z.string().min(1)) })),
  counterarguments: z.array(evidenceItemSchema),
  cross_case_links: z.array(z.object({ case_id: z.string().min(1), relation: z.string().min(1), note: z.string().min(1) })),
  retrospective: z.object({
    candidate_preferred_option_ex_ante: candidateAssessmentSchema,
    candidate_preferred_option_ex_post: candidateAssessmentSchema,
    status_candidate: z.enum(["DECISION_CONFIRMED", "DECISION_MOSTLY_CONFIRMED", "JUSTIFIABLE_AT_TIME_NOT_CONFIRMED_EX_POST", "ALTERNATIVE_PREFERABLE", "NO_ROBUST_RETROSPECTIVE_ASSESSMENT", "UNRESOLVED"]),
    learning_points: z.array(z.string().min(1))
  }),
  provenance: z.object({
    woek_reference_snapshot: z.string().min(1),
    review_generated_at: z.string().datetime(),
    source_refs_used: z.array(z.string().min(1)).min(1),
    review_system: z.string().min(1)
  })
}).strict();

export type HistoricalReviewResult = z.infer<typeof historicalReviewResultSchema>;

export function validateHistoricalReviewResult(input: unknown): HistoricalReviewResult {
  return historicalReviewResultSchema.parse(input);
}
