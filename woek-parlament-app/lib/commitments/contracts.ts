import { z } from "zod";

const locationSchema = z.object({
  page: z.string().max(80).optional(),
  section: z.string().max(500).optional(),
  paragraph: z.string().max(160).optional(),
  anchor: z.string().max(500).optional()
}).refine((location) => Object.keys(location).length > 0, "A concrete source location is required.");

export const commitmentRegisterSchema = z.object({
  schema_version: z.literal("1.0.0"),
  source_key: z.string().min(1).max(160),
  source_hash: z.string().regex(/^[a-f0-9]{64}$/),
  // Extraction time is useful provenance when the source format supplies it,
  // but the protected importer does not invent one when a source register
  // contains only the document hash and source-bound locations.
  extracted_at: z.string().datetime().optional(),
  commitments: z.array(z.object({
    commitment_key: z.string().min(1).max(180).regex(/^[a-z0-9][a-z0-9-]*$/),
    title: z.string().min(1).max(500),
    commitment_text: z.string().min(1).max(12_000),
    policy_domain: z.string().max(160).nullable(),
    source_location: locationSchema,
    temporal_scope: z.string().max(320).nullable()
  // The supplied 2025 programme register contains up to 489 source-bound
  // commitments. The limit remains bounded but must not reject a complete
  // primary-source register merely because it is more detailed than a small
  // policy dossier.
  })).min(1).max(650)
});
export type CommitmentRegister = z.infer<typeof commitmentRegisterSchema>;

export const commitmentLinkImportSchema = z.object({
  commitment_key: z.string().min(1).max(180),
  // A concrete parliamentary case exists only once a commitment has entered a
  // verifiable decision process.  `null` is an explicit, useful status for a
  // commitment that is not yet decided; it must not be fabricated as a case.
  case_id: z.string().uuid().nullable(),
  decision_unit_id: z.string().uuid().nullable(),
  relationship_status: z.enum(["ADVANCES", "PARTIALLY_ADVANCES", "DEVIATES", "NOT_YET_DECIDED", "NOT_COMPARABLE", "EVIDENCE_OPEN"]),
  factual_rationale: z.string().min(1).max(8_000),
  source_refs: z.array(z.string().min(1).max(180)).min(1).max(80),
  implementation_scope: z.string().max(500).nullable(),
  impact_path_refs: z.array(z.string().min(1).max(180)).max(80).default([]),
  official_status_check: z.string().max(160).nullable().default(null),
  effect_assessment: z.string().max(2_000).nullable().default(null)
});
export type CommitmentLinkImport = z.infer<typeof commitmentLinkImportSchema>;

export const commitmentAssessmentImportSchema = z.object({
  schema_version: z.literal("1.0.0"),
  commitment_key: z.string().min(1).max(180),
  assessment_scope: z.enum(["PROGRAM", "COALITION_AGREEMENT", "IMPLEMENTATION"]),
  assessment_status: z.enum(["NOT_STARTED", "DATA_GAP", "RULE_BASED_ASSESSMENT", "QUANTIFIED_EXPECTED_EFFECT", "QUANTIFIED_OBSERVED_EFFECT", "READY_FOR_APPROVAL"]),
  linked_case_id: z.string().uuid().nullable(),
  calculation_record_ids: z.array(z.string().uuid()).max(300),
  normative_mapping_ids: z.array(z.string().uuid()).max(300),
  boundary_status: z.string().max(160).nullable(),
  reference_snapshot: z.record(z.unknown()),
  assessment_note: z.string().max(12_000).nullable(),
  source_refs: z.array(z.string().min(1).max(180)).min(1).max(80),
  generated_at: z.string().datetime()
});
export type CommitmentAssessmentImport = z.infer<typeof commitmentAssessmentImportSchema>;
