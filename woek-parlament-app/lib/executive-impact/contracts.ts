import { z } from "zod";

export const impactDirectionSchema = z.enum(["POSITIVE", "NEGATIVE", "NEUTRAL", "AMBIVALENT", "OPEN"]);
export const impactMaterialitySchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL", "OPEN"]);
export const executiveEvidenceSchema = z.enum(["HIGH", "MEDIUM", "LOW", "NOT_ASSESSABLE"]);

export const impactDimensionSummarySchema = z.object({
  direction: impactDirectionSchema,
  materiality: impactMaterialitySchema,
  evidence: executiveEvidenceSchema,
  headline: z.string().min(1),
  state_changes: z.array(z.string().min(1)),
  rationale: z.string().min(1),
  source_path_ids: z.array(z.string().min(1)).min(1),
});

export const sdgImpactSchema = z.object({
  sdg_id: z.string().min(1),
  label: z.string().min(1),
  framework: z.enum(["UN_SDG", "WOEK_SDG_PLUS"]),
  direction: impactDirectionSchema,
  materiality: impactMaterialitySchema,
  evidence: executiveEvidenceSchema,
  rationale: z.string().min(1),
  source_path_ids: z.array(z.string().min(1)).min(1),
});

export const materialImpactPathSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  affected_group_or_system: z.string().min(1).nullable(),
  state_change: z.string().min(1),
  mechanism: z.string().min(1),
  direction: impactDirectionSchema,
  materiality: impactMaterialitySchema,
  evidence: executiveEvidenceSchema,
  effect_order: z.union([z.literal(1), z.literal(2), z.literal(3)]).nullable(),
  time_horizon: z.enum(["SHORT", "MEDIUM", "LONG", "MULTI_GENERATIONAL"]).nullable(),
  why_relevant: z.string().min(1),
  source_path_ids: z.array(z.string().min(1)).min(1),
});

export const nonCompensableRiskSchema = z.object({
  protected_interest: z.string().min(1),
  severity: z.enum(["MATERIAL", "HIGH", "CRITICAL"]),
  reason: z.string().min(1),
  source_path_ids: z.array(z.string().min(1)).min(1),
});

export const executiveImpactSummarySchema = z.object({
  schema_version: z.literal("woek-executive-impact-summary-1.0"),
  id: z.string().min(1),
  object_type: z.enum(["PROGRAMME", "COMMITMENT", "LAW", "PARLIAMENT_CASE", "GOVERNMENT_ACTION", "COALITION_AGREEMENT", "JURISDICTION", "EU_CASE", "OTHER"]),
  object_id: z.string().min(1),
  stage: z.enum(["EX_ANTE", "IMPLEMENTATION", "EX_POST"]),
  analysis_version: z.string().min(1),
  knowledge_cutoff: z.string().date(),
  bottom_line: z.string().min(1),
  editorial_summary: z.string().min(1).nullable(),
  key_finding: z.string().min(1).nullable(),
  direction_label: z.string().min(1),
  overall_character: z.enum(["PREDOMINANTLY_POSITIVE", "PREDOMINANTLY_NEGATIVE", "MIXED", "OPEN", "NO_SINGLE_DIRECTION"]),
  overall_materiality: impactMaterialitySchema,
  why_it_matters: z.string().min(1),
  system_boundary: z.string().min(1),
  mpd: z.object({
    human: impactDimensionSummarySchema,
    planet: impactDimensionSummarySchema,
    democracy: impactDimensionSummarySchema,
  }),
  sdg_impacts: z.array(sdgImpactSchema),
  material_paths: z.array(materialImpactPathSchema).max(5),
  materiality_selection_status: z.enum(["APPROVED_MATERIALITY_SELECTION", "FAIL_CLOSED_NO_APPROVED_RANKING"]),
  materiality_selection_rationale: z.string().min(1),
  noncompensable_risks: z.array(nonCompensableRiskSchema),
  noncompensation_status: z.enum(["APPROVED_BOUNDARIES", "REVIEWED_NONE", "NOT_AVAILABLE"]),
  key_tradeoffs: z.array(z.object({ title: z.string().min(1), explanation: z.string().min(1), source_path_ids: z.array(z.string().min(1)) })),
  evidence_summary: z.string().min(1),
  uncertainty_summary: z.string().min(1),
  open_questions: z.array(z.string().min(1)),
  reality_check_indicators: z.array(z.string().min(1)),
  source_refs: z.array(z.object({ id: z.string().min(1), label: z.string().min(1), href: z.string().startsWith("/").or(z.string().url()) })).min(1),
  communication_preview: z.object({
    assessment_label: z.string().min(1),
    summary: z.string().min(1),
    evidence_summary: z.string().min(1),
    noncompensation: z.string().min(1),
    href: z.string().startsWith("#").or(z.string().startsWith("/")),
  }).nullable(),
  editorial_status: z.enum(["APPROVED", "PARTIAL", "FAIL_CLOSED"]),
});

export type ImpactDirection = z.infer<typeof impactDirectionSchema>;
export type ImpactMateriality = z.infer<typeof impactMaterialitySchema>;
export type ExecutiveEvidence = z.infer<typeof executiveEvidenceSchema>;
export type ImpactDimensionSummary = z.infer<typeof impactDimensionSummarySchema>;
export type ExecutiveImpactSummary = z.infer<typeof executiveImpactSummarySchema>;
