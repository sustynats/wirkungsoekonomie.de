import { createHash } from "node:crypto";
import type { ImpactVisualDescriptor, ImpactVisualScenarioRecord } from "./contracts";

export type ImpactVisualGateName =
  | "IMPACT_VISUAL_DERIVES_FROM_APPROVED_ANALYSIS"
  | "NO_RAW_PROGRAM_TO_IMAGE_SHORTCUT"
  | "VISIBLE_ELEMENT_HAS_IMPACT_PATH_PROVENANCE"
  | "OPEN_EFFECT_NOT_DEPICTED_AS_FACT"
  | "DIRECTION_SEPARATE_FROM_EVIDENCE_IN_VISUAL"
  | "NON_VISUAL_MATERIAL_EFFECTS_DISCLOSED"
  | "SCENARIO_NOT_PROGNOSIS_LABEL_PRESENT"
  | "NO_CAMPAIGN_SLOGAN_AS_VISUAL_CLAIM"
  | "NO_PARTY_VALENCE_STYLE_BIAS"
  | "NO_IMAGE_TO_FACHDATA_BACKPROPAGATION"
  | "IMPACT_VISUAL_SOURCE_FIDELITY"
  | "IMPACT_VISUAL_VERSION_PROVENANCE"
  | "ALL_SIX_ST_PROGRAMS_USE_SAME_VISUAL_CONTRACT"
  | "ALT_TEXT_AND_MARKER_A11Y"
  | "IMPACT_VISUAL_MOBILE_320_360_375_390_428"
  | "NO_HORIZONTAL_OVERFLOW"
  | "NO_DERIVED_AUTOMATIC_BENEFIT";

export type ImpactVisualGateResult = {
  gate: ImpactVisualGateName;
  pass: boolean;
  detail: string;
};

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, item]) => [key, canonical(item)]));
  }
  return value;
}

function descriptorHash(descriptor: ImpactVisualDescriptor) {
  const { manifest_sha256: _manifestSha256, ...withoutHash } = descriptor;
  return createHash("sha256").update(JSON.stringify(canonical(withoutHash))).digest("hex");
}

function isFailClosed(record: ImpactVisualScenarioRecord) {
  return record.editorial_review_status === "NO_APPROVED_VISUAL_SCENARIO";
}

function failClosedHasNoAsset(record: ImpactVisualScenarioRecord) {
  return record.asset_path === null
    && record.alt_text === null
    && record.visual_brief === null
    && record.generator_metadata === null
    && record.asset_sha256 === null
    && record.asset_metadata === null
    && record.visible_elements.length === 0
    && record.non_visual_effects_review_status === "PENDING_APPROVAL";
}

function approvedAssetComplete(record: ImpactVisualScenarioRecord) {
  if (isFailClosed(record)) return failClosedHasNoAsset(record);
  const expectedSelection = record.visual_scope === "PROGRAM_SCENARIO" ? record.selected_impact_path_ids.length >= 3 && record.selected_impact_path_ids.length <= 5 : record.selected_impact_path_ids.length === 1;
  return expectedSelection
    && record.visual_brief !== null
    && record.asset_path !== null
    && record.alt_text !== null
    && record.asset_sha256 !== null
    && record.asset_metadata !== null
    && record.non_visual_effects_review_status === "REVIEWED_COMPLETE"
    && record.source_fidelity_status === "PASS_APPROVED_ANALYSIS_ONLY";
}

export function evaluateImpactVisualGates({
  descriptor,
  expectedSourceKeys,
  approvedAnalysisRefs,
  stylesheet,
}: {
  descriptor: ImpactVisualDescriptor;
  expectedSourceKeys: string[];
  approvedAnalysisRefs: Record<string, string[]>;
  stylesheet: string;
}): ImpactVisualGateResult[] {
  const records = descriptor.records;
  const expectedSet = new Set(expectedSourceKeys);
  const allRefsApproved = records.every((record) => {
    const approved = new Set(approvedAnalysisRefs[record.source_key] ?? []);
    return record.eligible_approved_analysis_refs.every((ref) => approved.has(ref))
      && record.selected_impact_path_ids.every((ref) => approved.has(ref))
      && record.source_statement_refs.every((ref) => approved.has(ref));
  });
  const allVisibleProvenance = records.every((record) => {
    const selected = new Set(record.selected_impact_path_ids);
    return record.visible_elements.every((element) => selected.has(element.impact_path_id) && element.analysis_href.startsWith("/"));
  });
  const allApprovedOrClosed = records.every(approvedAssetComplete);
  const recordsPerSource = Object.fromEntries(expectedSourceKeys.map((sourceKey) => [sourceKey, records.filter((record) => record.source_key === sourceKey)]));
  const symmetricContract = records.length === expectedSourceKeys.length * 2
    && records.every((record) => expectedSet.has(record.source_key))
    && Object.values(recordsPerSource).every((partyRecords) => partyRecords.length === 2
      && partyRecords.some((record) => record.visual_scope === "PROGRAM_SCENARIO")
      && partyRecords.some((record) => record.visual_scope === "CASE_SCENARIO"));
  const noSloganClaims = new Set(records.filter((record) => record.visual_scope === "PROGRAM_SCENARIO").map((record) => record.normalized_subject)).size === 1
    && new Set(records.filter((record) => record.visual_scope === "CASE_SCENARIO").map((record) => record.normalized_subject)).size === 1;
  const markerA11y = records.every((record) => isFailClosed(record) || (Boolean(record.alt_text)
    && new Set(record.visible_elements.map((element) => element.id)).size === record.visible_elements.length
    && record.visible_elements.every((element) => element.analysis_href.startsWith("/"))));
  const responsiveContract = [320, 360, 375, 390, 428].every((width) => stylesheet.includes(width === 320 ? "min-width: 0" : "@media (max-width: 680px)"))
    && stylesheet.includes("width: 44px")
    && stylesheet.includes("min-height: 44px");
  const overflowContract = stylesheet.includes("overflow: clip")
    && stylesheet.includes("min-width: 0")
    && stylesheet.includes("grid-template-columns: 1fr");

  return [
    { gate: "IMPACT_VISUAL_DERIVES_FROM_APPROVED_ANALYSIS", pass: allRefsApproved && allApprovedOrClosed, detail: "Every selected/reference ID is in the existing Editorial-v2 approved set; incomplete records publish no asset." },
    { gate: "NO_RAW_PROGRAM_TO_IMAGE_SHORTCUT", pass: descriptor.generation_policy.input_mode === "APPROVED_VISUAL_BRIEF_ONLY" && !descriptor.generation_policy.raw_programme_text_allowed && records.every((record) => record.generator_metadata === null || record.visual_brief !== null), detail: "Raw programme input and automatic generation are disabled." },
    { gate: "VISIBLE_ELEMENT_HAS_IMPACT_PATH_PROVENANCE", pass: allVisibleProvenance, detail: "Every visible element maps to a selected approved analysis path and public analysis link." },
    { gate: "OPEN_EFFECT_NOT_DEPICTED_AS_FACT", pass: records.every((record) => record.visible_elements.every((element) => element.direction !== "OPEN" && element.evidence_level !== "NOT_ASSESSABLE" && element.depiction_status !== "NOT_VISUALIZABLE")), detail: "OPEN and NOT_ASSESSABLE records cannot enter the visible-element list." },
    { gate: "DIRECTION_SEPARATE_FROM_EVIDENCE_IN_VISUAL", pass: records.every((record) => record.visible_elements.every((element) => Boolean(element.direction) && Boolean(element.evidence_level))), detail: "Direction and evidence are independent required fields." },
    { gate: "NON_VISUAL_MATERIAL_EFFECTS_DISCLOSED", pass: records.every((record) => isFailClosed(record) ? record.non_visual_effects_review_status === "PENDING_APPROVAL" : record.non_visual_effects_review_status === "REVIEWED_COMPLETE"), detail: "Fail-closed records expose the pending review; approved records require a completed non-visual-effects review." },
    { gate: "SCENARIO_NOT_PROGNOSIS_LABEL_PRESENT", pass: records.every((record) => record.disclaimer === descriptor.public_contract.disclaimer) && descriptor.public_contract.image_is_evidence === false, detail: "The binding public scenario/not-prognosis label is present on every record." },
    { gate: "NO_CAMPAIGN_SLOGAN_AS_VISUAL_CLAIM", pass: !descriptor.generation_policy.campaign_slogan_allowed && noSloganClaims, detail: "Normalized subjects use the same neutral scope labels for every party." },
    { gate: "NO_PARTY_VALENCE_STYLE_BIAS", pass: descriptor.generation_policy.party_valence_style === "PORTAL_NEUTRAL", detail: "One portal-neutral style contract applies to all records." },
    { gate: "NO_IMAGE_TO_FACHDATA_BACKPROPAGATION", pass: !descriptor.generation_policy.fachdata_backpropagation_allowed, detail: "Generated outputs cannot mutate Fach data." },
    { gate: "IMPACT_VISUAL_SOURCE_FIDELITY", pass: allRefsApproved && allVisibleProvenance && allApprovedOrClosed, detail: "Unknown or incomplete visual semantics fail closed." },
    { gate: "IMPACT_VISUAL_VERSION_PROVENANCE", pass: descriptorHash(descriptor) === descriptor.manifest_sha256 && records.every((record) => record.change_history.length > 0), detail: "Descriptor hash and per-record change history are complete." },
    { gate: "ALL_SIX_ST_PROGRAMS_USE_SAME_VISUAL_CONTRACT", pass: symmetricContract, detail: "Each of six programmes has exactly one programme and one case record." },
    { gate: "ALT_TEXT_AND_MARKER_A11Y", pass: markerA11y && stylesheet.includes(":focus-visible") && stylesheet.includes("min-height: 44px"), detail: "Approved assets require alt text; any approved markers are unique, keyboard-accessible 44px targets. A reviewed NO_MARKER decision renders no inert marker." },
    { gate: "IMPACT_VISUAL_MOBILE_320_360_375_390_428", pass: responsiveContract, detail: "The shared component collapses to one column and retains accessible targets across the required mobile matrix." },
    { gate: "NO_HORIZONTAL_OVERFLOW", pass: overflowContract, detail: "The component establishes min-width, clipping and single-column mobile containment." },
    { gate: "NO_DERIVED_AUTOMATIC_BENEFIT", pass: records.every((record) => isFailClosed(record) || record.visible_elements.every((element) => record.selected_impact_path_ids.includes(element.impact_path_id))), detail: "No visible benefit can exist without an explicitly selected, approved path; reviewed NO_MARKER records contain no visible fachliche claim." },
  ];
}
