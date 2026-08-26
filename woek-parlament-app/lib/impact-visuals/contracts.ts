import { z } from "zod";

export const impactVisualDirectionSchema = z.enum(["POSITIVE", "NEGATIVE", "AMBIVALENT", "OPEN"]);
export const impactVisualEvidenceSchema = z.enum(["HIGH", "MEDIUM", "LOW", "NOT_ASSESSABLE"]);

export const impactVisualVisibleElementSchema = z.object({
  id: z.string().min(1),
  impact_path_id: z.string().min(1),
  effect_order: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  state_change: z.string().min(1),
  affected_group_or_system: z.string().min(1),
  time_horizon: z.string().min(1),
  direction: impactVisualDirectionSchema,
  evidence_level: impactVisualEvidenceSchema,
  uncertainty: z.string().min(1),
  depiction_status: z.enum(["DIRECTLY_VISIBLE", "SYMBOLIC_WITH_LABEL", "NOT_VISUALIZABLE"]),
  analysis_href: z.string().startsWith("/"),
  marker_position: z.object({
    x_percent: z.number().min(0).max(100),
    y_percent: z.number().min(0).max(100),
  }),
});

const sourceLocationSchema = z.object({
  page: z.union([z.number().int().positive(), z.string().min(1)]),
  section: z.string().nullable(),
});

const sourceReferenceSchema = z.object({
  source_key: z.string().min(1),
  location: sourceLocationSchema,
  source_text: z.string().min(1),
});

const canonicalRiskSchema = z.object({
  risk: z.string().min(1),
  trigger_or_condition: z.string().min(1),
  affected_groups_or_goods: z.array(z.string().min(1)),
  evidence_status: z.string().min(1),
});

const nonCompensableBoundarySchema = z.object({
  concern: z.string().min(1),
  rationale: z.string().min(1),
  status: z.string().min(1),
});

export const impactVisualCaseAnalysisBindingSchema = z.object({
  approval_provenance: z.object({
    approval_basis: z.literal("DELEGATED_WOEK_EDITORIAL_REVIEW_PROTOCOL_2026-08-26"),
    approval_authority: z.literal("PROJECT_OWNER_DELEGATED_PROTOCOL"),
    review_mode: z.literal("SOURCE_BOUND_OBJECT_LEVEL"),
    human_individual_record_review_claimed: z.literal(false),
  }),
  selected_case_id: z.string().min(1),
  canonical_record_path: z.string().min(1),
  canonical_editorial_path: z.string().min(1),
  decision_or_measure: z.string().min(1),
  intended_change: z.string().min(1),
  source_statement_refs: z.array(sourceReferenceSchema).min(1),
  affected_group_or_system: z.array(z.string().min(1)),
  mechanism: z.array(z.string().min(1)),
  potential_state_change: z.array(z.string().min(1)),
  key_finding: z.string().min(1),
  impact_core_summary: z.string().min(1),
  editorial_summary: z.string().min(1),
  direction_rationale: z.string().min(1),
  impact_direction: impactVisualDirectionSchema,
  evidence_level: impactVisualEvidenceSchema,
  competence_and_system_boundary: z.object({
    responsible_actors: z.array(z.string().min(1)),
    competence_note: z.string().nullable(),
    implementation_conditions: z.array(z.string().min(1)),
  }),
  material_risks: z.array(canonicalRiskSchema),
  impact_orders: z.object({
    first_order: z.string().min(1),
    second_order: z.array(z.string().min(1)),
    third_order: z.string().min(1),
    status: z.string().min(1),
  }),
  time_horizon: z.object({
    short_term: z.string().min(1),
    medium_term: z.string().min(1),
    long_term: z.string().min(1),
    intergenerational_relevance: z.string().min(1),
  }),
  materiality: z.string().min(1),
  uncertainty: z.array(z.string().min(1)),
  falsification_or_reality_check: z.object({
    baseline_required: z.string().min(1),
    primary_indicator: z.string().min(1),
    unit: z.string().min(1),
    counterfactual_required: z.string().nullable(),
    earliest_review: z.string().min(1),
    correction_trigger: z.string().min(1),
  }),
  noncompensation: z.array(nonCompensableBoundarySchema),
  marker_decision: z.enum(["ALLOWED_IF_CANONICAL_PATH_BINDING_PASSES", "NULL_MARKER_APPROVED"]),
  editorial_input_status: z.object({
    approved_case_selection: z.literal("APPROVED"),
    reviewed_visual_brief: z.literal("APPROVED"),
    alt_text_review: z.literal("APPROVED"),
    editorial_brief_signoff: z.literal("APPROVED"),
    image_asset: z.literal("NOT_YET_SUPPLIED"),
    final_image_signoff: z.literal("PENDING_ASSET"),
  }),
});

export const impactVisualScenarioRecordSchema = z.object({
  id: z.string().min(1),
  object_type: z.enum(["PROGRAM", "COMMITMENT", "IMPACT_CASE", "GOVERNMENT_ACTION"]),
  object_id: z.string().min(1),
  source_key: z.string().min(1),
  analysis_version: z.string().min(1),
  knowledge_cutoff: z.string().date(),
  stage: z.enum(["EX_ANTE", "EX_POST"]),
  visual_scope: z.enum(["PROGRAM_SCENARIO", "CASE_SCENARIO"]),
  title: z.string().min(1),
  normalized_subject: z.string().min(1),
  source_statement_refs: z.array(z.string().min(1)),
  selected_impact_path_ids: z.array(z.string().min(1)),
  eligible_approved_analysis_refs: z.array(z.string().min(1)),
  selection_rationale: z.string().min(1),
  visible_elements: z.array(impactVisualVisibleElementSchema),
  case_analysis_binding: impactVisualCaseAnalysisBindingSchema.nullable(),
  non_visual_effects: z.array(z.string().min(1)),
  non_visual_effects_review_status: z.enum(["PENDING_APPROVAL", "REVIEWED_COMPLETE"]),
  omitted_material_effects: z.array(z.string().min(1)),
  omitted_marker_candidates: z.array(z.string().min(1)),
  system_boundary: z.string().nullable(),
  scenario_assumptions: z.array(z.string().min(1)),
  evidence_summary: z.string().min(1),
  disclaimer: z.literal("Visualisiertes Wirkungsszenario auf Basis der WÖk-Analyse. Keine Prognose."),
  asset_path: z.string().startsWith("/visuals/impact-scenarios/").nullable(),
  alt_text: z.string().min(1).nullable(),
  visual_brief: z.object({
    id: z.string().min(1),
    version: z.string().min(1),
    content_sha256: z.string().regex(/^[a-f0-9]{64}$/),
    review_status: z.literal("APPROVED"),
  }).nullable(),
  generator_metadata: z.object({
    generator: z.string().min(1),
    model_version: z.string().min(1),
    generated_at: z.string().datetime({ offset: true }),
    prompt_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  }).nullable(),
  asset_sha256: z.string().regex(/^[a-f0-9]{64}$/).nullable(),
  asset_metadata: z.object({
    mime_type: z.literal("image/webp"),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    byte_size: z.number().int().positive(),
    original_filename: z.string().min(1),
    original_sha256: z.string().regex(/^[a-f0-9]{64}$/),
    optimization: z.object({
      format: z.literal("WEBP_LOSSY_Q90"),
      full_composition_preserved: z.literal(true),
      metadata_published: z.literal(false),
    }),
    integrated_at: z.string().date(),
  }).nullable(),
  editorial_review_status: z.enum(["NO_APPROVED_VISUAL_SCENARIO", "PREPARED_AWAITING_ASSET", "APPROVED_FOR_PUBLICATION"]),
  source_fidelity_status: z.enum(["FAIL_CLOSED_NO_PUBLIC_ASSET", "PASS_APPROVED_ANALYSIS_ONLY_AWAITING_ASSET", "PASS_APPROVED_ANALYSIS_ONLY"]),
  missing_approved_inputs: z.array(z.object({
    code: z.enum([
      "APPROVED_CASE_SELECTION",
      "REVIEWED_VISUAL_BRIEF",
      "VISIBLE_ELEMENT_MAPPING",
      "NON_VISUAL_EFFECT_SELECTION",
      "ALT_TEXT_REVIEW",
      "EDITORIAL_VISUAL_SIGNOFF",
      "IMAGE_ASSET",
      "FINAL_IMAGE_SIGNOFF",
    ]),
    description: z.string().min(1),
    required_for: z.enum(["PROGRAM_SCENARIO", "CASE_SCENARIO", "BOTH"]),
  })),
  change_history: z.array(z.object({
    version: z.string().min(1),
    date: z.string().date(),
    status: z.enum(["FAIL_CLOSED_CREATED", "APPROVED", "CORRECTED", "SUPERSEDED"]),
    note: z.string().min(1),
  })).min(1),
});

export const impactVisualDescriptorSchema = z.object({
  schema_version: z.literal("woek-impact-visual-scenarios-1.0"),
  manifest_id: z.string().min(1),
  manifest_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  base_main_commit: z.string().regex(/^[a-f0-9]{40}$/),
  source_release: z.object({
    manifest_id: z.string().min(1),
    manifest_path: z.string().min(1),
    descriptor_sha256: z.string().regex(/^[a-f0-9]{64}$/),
    published_commit: z.string().regex(/^[a-f0-9]{40}$/),
  }),
  generation_policy: z.object({
    input_mode: z.literal("APPROVED_VISUAL_BRIEF_ONLY"),
    raw_programme_text_allowed: z.literal(false),
    campaign_slogan_allowed: z.literal(false),
    party_valence_style: z.literal("PORTAL_NEUTRAL"),
    fachdata_backpropagation_allowed: z.literal(false),
    automatic_generation_allowed: z.literal(false),
  }),
  public_contract: z.object({
    label: z.literal("Wirkungsbild"),
    disclaimer: z.literal("Visualisiertes Wirkungsszenario auf Basis der WÖk-Analyse. Keine Prognose."),
    image_is_evidence: z.literal(false),
  }),
  records: z.array(impactVisualScenarioRecordSchema),
});

export type ImpactVisualDirection = z.infer<typeof impactVisualDirectionSchema>;
export type ImpactVisualEvidence = z.infer<typeof impactVisualEvidenceSchema>;
export type ImpactVisualVisibleElement = z.infer<typeof impactVisualVisibleElementSchema>;
export type ImpactVisualCaseAnalysisBinding = z.infer<typeof impactVisualCaseAnalysisBindingSchema>;
export type ImpactVisualScenarioRecord = z.infer<typeof impactVisualScenarioRecordSchema>;
export type ImpactVisualDescriptor = z.infer<typeof impactVisualDescriptorSchema>;
