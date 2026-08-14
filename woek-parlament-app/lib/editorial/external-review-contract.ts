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

const impactDomainSchema = z.object({
  domain: z.enum([
    "HOUSING", "HEALTH_CARE", "EDUCATION_PARTICIPATION", "WORK_SKILLS",
    "ECONOMY_TRANSFORMATION", "ENERGY_GRIDS", "MOBILITY", "CLIMATE_RESILIENCE",
    "DIGITAL_STATE_INFRASTRUCTURE", "STATE_ADMINISTRATION", "HUMAN", "PLANET", "DEMOCRACY"
  ]),
  status: z.enum(["MATERIAL", "INDIRECT", "NOT_MATERIAL_IDENTIFIED", "EVIDENCE_OPEN"]),
  reason: z.string().min(1),
  source_refs: z.array(z.string().min(1))
});

const sourceConflictSchema = z.object({
  question: z.string().min(1),
  source_refs: z.array(z.string().min(1)).min(1),
  why_unresolved: z.string().min(1)
});

export const historicalReviewResultSchema = z.object({
  case_id: z.string().min(1),
  review_type: z.literal("HISTORICAL_WOEK_REVIEW").default("HISTORICAL_WOEK_REVIEW"),
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
  // A top-level list deliberately mirrors the two temporal partitions. It
  // makes an import easier to route while the nested items preserve whether a
  // path was available at decision time or observed only later.
  impact_paths: z.array(impactPathSchema).default([]),
  impact_domains: z.array(impactDomainSchema).default([]),
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
  risks: z.array(evidenceItemSchema).default([]),
  non_compensable_boundaries: z.array(evidenceItemSchema).default([]),
  counterfactuals: z.array(counterfactualSchema).default([]),
  data_gaps: z.array(z.object({ question: z.string().min(1), impact: z.string().min(1), source_refs_checked: z.array(z.string().min(1)) })),
  counterarguments: z.array(evidenceItemSchema),
  source_conflicts: z.array(sourceConflictSchema).default([]),
  cross_case_links: z.array(z.object({ case_id: z.string().min(1), relation: z.string().min(1), note: z.string().min(1) })),
  retrospective: z.object({
    candidate_preferred_option_ex_ante: candidateAssessmentSchema,
    candidate_preferred_option_ex_post: candidateAssessmentSchema,
    status_candidate: z.enum(["DECISION_CONFIRMED", "DECISION_MOSTLY_CONFIRMED", "JUSTIFIABLE_AT_TIME_NOT_CONFIRMED_EX_POST", "ALTERNATIVE_PREFERABLE", "NO_ROBUST_RETROSPECTIVE_ASSESSMENT", "UNRESOLVED"]),
    learning_points: z.array(z.string().min(1))
  }),
  provenance: z.object({
    woek_reference_snapshot: z.string().min(1),
    exported_package_hash: z.string().min(1),
    review_generated_at: z.string().datetime(),
    source_refs_used: z.array(z.string().min(1)).min(1),
    review_system: z.string().min(1)
  })
}).strict();

export type HistoricalReviewResult = z.infer<typeof historicalReviewResultSchema>;

export type HistoricalReviewPackageBoundary = {
  caseId: string;
  decisionDate: string;
  referenceSnapshot: string;
  packageHash: string;
  sourceIds: readonly string[];
};

export type HistoricalReviewValidation = {
  valid: boolean;
  result: HistoricalReviewResult;
  errors: string[];
  warnings: string[];
};

export function validateHistoricalReviewResult(input: unknown): HistoricalReviewResult {
  return historicalReviewResultSchema.parse(input);
}

function collectSourceReferences(value: unknown, references: string[]) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectSourceReferences(item, references));
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if ((key === "source_refs" || key === "source_refs_checked" || key === "source_refs_used") && Array.isArray(nested)) {
      nested.forEach((sourceId) => {
        if (typeof sourceId === "string") references.push(sourceId);
      });
    } else if (key === "sources" && Array.isArray(nested)) {
      nested.forEach((source) => {
        if (source && typeof source === "object" && typeof (source as { source_id?: unknown }).source_id === "string") {
          references.push((source as { source_id: string }).source_id);
        }
      });
    } else {
      collectSourceReferences(nested, references);
    }
  }
}

/**
 * A schema-valid review can still point to a source that was not in the
 * exported package. That is a validation failure, not an invitation to add an
 * unreviewed source silently. The caller stores these messages and stages no
 * public content in either case.
 */
export function validateHistoricalReviewAgainstPackage(input: unknown, boundary: HistoricalReviewPackageBoundary): HistoricalReviewValidation {
  const result = validateHistoricalReviewResult(input);
  const errors: string[] = [];
  const warnings: string[] = [];
  const allowedSources = new Set(boundary.sourceIds);

  if (result.case_id !== boundary.caseId) errors.push("CASE_ID_MISMATCH");
  if (result.provenance.woek_reference_snapshot !== boundary.referenceSnapshot) errors.push("REFERENCE_SNAPSHOT_MISMATCH");
  if (result.provenance.exported_package_hash !== boundary.packageHash) errors.push("PACKAGE_HASH_MISMATCH");
  if (result.ex_ante.knowledge_cutoff !== boundary.decisionDate) errors.push("EX_ANTE_KNOWLEDGE_CUTOFF_MISMATCH");

  const referencedSources: string[] = [];
  collectSourceReferences(result, referencedSources);
  for (const sourceId of new Set(referencedSources)) {
    if (!allowedSources.has(sourceId)) errors.push(`UNKNOWN_SOURCE_REFERENCE:${sourceId}`);
  }
  for (const requirement of result.calculation_requirements) {
    for (const operand of requirement.required_operands) {
      if (operand.status === "AI_GENERATED_NUMERIC_VALUE") warnings.push(`AI_NUMERIC_VALUE_NOT_USABLE:${requirement.impact_id}:${operand.name}`);
    }
  }

  return { valid: errors.length === 0, result, errors, warnings };
}
