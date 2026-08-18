import { z } from "zod";
import { constitutionalAnchorTypes, getNormativeReference, normativeFrameworks } from "@/lib/normative/reference-registry";

export const reviewPackageSchemaVersion = "1.0.0";

export const reviewTypeSchema = z.enum(["FULL_REVIEW", "INCREMENTAL_REVIEW", "EXCEPTION_REVIEW"]);
export type ReviewType = z.infer<typeof reviewTypeSchema>;

export const temporalClassSchema = z.enum([
  "AVAILABLE_AT_DECISION_TIME",
  "PUBLISHED_AFTER_DECISION",
  "CURRENT_REFERENCE"
]);

export const sourceReferenceSchema = z.object({
  source_id: z.string().min(1).max(160),
  title: z.string().min(1).max(600),
  institution: z.string().min(1).max(240),
  url: z.string().url().max(2_000),
  document_date: z.string().date().nullable(),
  retrieved_at: z.string().datetime(),
  document_type: z.string().min(1).max(120),
  version: z.string().max(120).nullable(),
  temporal_class: temporalClassSchema,
  relevant_locations: z.array(z.object({
    page: z.string().max(80).optional(),
    section: z.string().max(500).optional(),
    paragraph: z.string().max(160).optional(),
    table: z.string().max(160).optional(),
    anchor: z.string().max(500).optional()
  })).max(40).default([])
});
export type SourceReference = z.infer<typeof sourceReferenceSchema>;

export const sourceExcerptSchema = z.object({
  source_id: z.string().min(1).max(160),
  location: z.string().min(1).max(700),
  text: z.string().min(1).max(20_000),
  why_required: z.string().min(1).max(1_000)
});

export const normativeReferenceSchema = z.object({
  id: z.string().min(1).max(160),
  framework: z.enum(normativeFrameworks),
  code: z.string().min(1).max(100),
  label: z.string().min(1).max(240),
  short_description: z.string().min(1).max(1_000),
  source_slug: z.string().min(1).max(160),
  constitutional_anchor_type: z.enum(constitutionalAnchorTypes).optional(),
  legal_reference: z.string().min(1).max(160).optional()
});

export const reviewCasePackageSchema = z.object({
  case_id: z.string().uuid(),
  case_title: z.string().min(1).max(800),
  review_type: reviewTypeSchema,
  previous_review_id: z.string().max(200).nullable(),
  decision: z.object({
    decision_unit_id: z.string().uuid().nullable(),
    decision_object: z.string().min(1).max(20_000),
    decision_date: z.string().date().nullable(),
    parliamentary_status: z.string().min(1).max(500),
    final_version: z.string().max(500).nullable(),
    actual_outcome: z.string().max(500).nullable(),
    vote_type: z.string().max(160).nullable(),
    vote_result: z.record(z.unknown()).default({})
  }),
  fact_package: z.record(z.unknown()),
  source_manifest: z.array(sourceReferenceSchema).min(1).max(300),
  excerpts: z.array(sourceExcerptSchema).max(20),
  evidence: z.object({
    ex_ante_source_ids: z.array(z.string()).max(300),
    ex_post_source_ids: z.array(z.string()).max(300)
  }),
  woek_reference_snapshot: z.record(z.unknown()),
  /** Canonical IDs for visual mapping; legal anchors remain distinct from SDG+. */
  normative_reference_catalog: z.array(normativeReferenceSchema).max(80).default([]),
  review_request: z.object({
    questions_to_answer: z.array(z.string().min(1).max(2_000)).min(1).max(20),
    required_outputs: z.array(z.string().min(1).max(300)).min(1).max(40),
    known_data_gaps: z.array(z.string().max(1_000)).max(100),
    known_source_conflicts: z.array(z.string().max(1_000)).max(100),
    calculation_inputs_available: z.array(z.string().max(1_000)).max(100),
    calculation_inputs_missing: z.array(z.string().max(1_000)).max(100)
  }),
  package_hash: z.string().regex(/^[a-f0-9]{64}$/)
});
export type ReviewCasePackage = z.infer<typeof reviewCasePackageSchema>;

export const reviewBatchPackageSchema = z.object({
  schema_version: z.literal(reviewPackageSchemaVersion),
  batch_code: z.string().regex(/^WOEK-REVIEW-\d{4}-\d{4}$/),
  review_type: reviewTypeSchema,
  created_at: z.string().datetime(),
  cases: z.array(reviewCasePackageSchema).min(1).max(15),
  package_hash: z.string().regex(/^[a-f0-9]{64}$/)
});
export type ReviewBatchPackage = z.infer<typeof reviewBatchPackageSchema>;

const normativeTileMappingSchema = z.object({
  id: z.string().min(1).max(160),
  framework: z.enum(normativeFrameworks),
  /** Optional duplicate labels are checked against the registry when supplied. */
  code: z.string().min(1).max(80).optional(),
  label: z.string().min(1).max(240).optional(),
  direction: z.enum(["POSITIVE_POTENTIAL", "NEGATIVE_RISK", "AMBIVALENT", "EVIDENCE_OPEN", "OBSERVED_POSITIVE", "OBSERVED_NEGATIVE"]),
  evidence_status: z.string().min(1).max(160),
  rationale: z.string().min(1).max(2_000),
  impact_path_refs: z.array(z.string().min(1).max(160)).max(12).default([]),
  // A mapping can explicitly identify a normative reference while the
  // empirical evidence for the linked impact path is still open.  An empty
  // list is therefore a transparent DATA_GAP, not a reason to discard the
  // whole review.  The UI must label it as such and must not imply evidence.
  source_refs: z.array(z.string().min(1).max(160)).max(24),
  constitutional_anchor_type: z.enum(constitutionalAnchorTypes).optional(),
  legal_reference: z.string().min(1).max(160).optional()
}).superRefine((item, ctx) => {
  const reference = getNormativeReference(item.id);
  if (!reference) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["id"], message: "Unknown normative registry ID." });
    return;
  }
  if (reference.framework !== item.framework) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["framework"], message: "Normative framework does not match the registry." });
  }
  if (item.code && item.code !== reference.code) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["code"], message: "Normative code does not match the registry." });
  }
  if (item.label && item.label !== reference.label) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["label"], message: "Normative label does not match the registry." });
  }
  if (item.constitutional_anchor_type && item.constitutional_anchor_type !== reference.constitutionalAnchorType) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["constitutional_anchor_type"], message: "Anchor type does not match the registry." });
  }
  if (item.legal_reference && item.legal_reference !== reference.legalReference) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["legal_reference"], message: "Legal reference does not match the registry." });
  }
});

export const normativeMappingSchema = z.object({
  reference_frame: z.string().min(1).max(800).optional(),
  mapping_status: z.string().min(1).max(160).optional(),
  sdg_targets: z.array(z.string().min(1).max(100)).max(40).default([]),
  sdg_plus_fields: z.array(z.string().min(1).max(160)).max(40).default([]),
  tile_mappings: z.array(normativeTileMappingSchema).max(80).default([])
}).passthrough();

/**
 * Editorially approved plain-language entry point for a review.  It is kept
 * separate from the analytical payload: it explains the case without turning
 * an open causal question into a finding.
 */
export const publicSummarySchema = z.object({
  headline: z.string().min(1).max(240),
  key_statement: z.string().min(1).max(2_000),
  stage: z.string().min(1).max(160).optional(),
  what_is_known: z.string().min(1).max(2_000).optional(),
  what_is_not_yet_known: z.string().min(1).max(2_000).optional(),
  improvement_options: z.array(z.string().min(1).max(2_000)).max(20).default([]),
  publisher: z.literal("Institut für Wirkungsökonomie").optional(),
  maturity_stage: z.string().min(1).max(160).optional(),
  evidence_boundary: z.string().min(1).max(2_000).optional()
}).optional();

export const reviewResultSchema = z.object({
  schema_version: z.literal(reviewPackageSchemaVersion),
  review_id: z.string().min(1).max(200),
  case_id: z.string().uuid(),
  review_type: reviewTypeSchema,
  input_package_hash: z.string().regex(/^[a-f0-9]{64}$/),
  woek_reference_snapshot: z.record(z.unknown()),
  previous_review_id: z.string().max(200).nullable(),
  analysis_version: z.string().min(1).max(120),
  generated_at: z.string().datetime(),
  review_status: z.enum(["COMPLETE", "DATA_GAP", "SOURCE_CONFLICT", "METHOD_REVIEW_REQUIRED", "PARTIAL"]),
  public_summary: publicSummarySchema,
  source_completeness: z.record(z.unknown()),
  decision: z.record(z.unknown()),
  ex_ante: z.record(z.unknown()),
  ex_post: z.record(z.unknown()),
  impact_paths: z.array(z.record(z.unknown())).max(250),
  impact_domains: z.array(z.record(z.unknown())).max(30),
  normative_mapping: normativeMappingSchema,
  calculation_requirements: z.array(z.record(z.unknown())).max(300),
  risks: z.array(z.record(z.unknown())).max(200),
  non_compensable_boundaries: z.array(z.record(z.unknown())).max(100),
  counterarguments: z.array(z.record(z.unknown())).max(100),
  counterfactuals: z.array(z.record(z.unknown())).max(100),
  data_gaps: z.array(z.record(z.unknown())).max(200),
  source_conflicts: z.array(z.record(z.unknown())).max(100),
  retrospective: z.record(z.unknown()),
  cross_case_links: z.array(z.record(z.unknown())).max(100),
  provenance: z.object({
    source_refs_used: z.array(z.string()).max(300),
    review_generated_at: z.string().datetime()
  })
});
export type ReviewResult = z.infer<typeof reviewResultSchema>;
