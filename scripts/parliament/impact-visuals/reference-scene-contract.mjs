import { createHash } from "node:crypto";

const ITEM_ID = /^st-ltw-2026-shared-city-reference-v1-(?:base|cdu|spd|gruene|linke|bsw|afd)$/;
const SOURCE_KEY = /^ltw-2026-st-(?:cdu|spd|gruene|linke|bsw|afd)$/;
const SHA256 = /^[a-f0-9]{64}$/;
const COMMIT = /^[a-f0-9]{40}$/;
const CONTRACT_PATH = /^woek-parlament-app\/data\/impact-visuals\/[a-z0-9-]+\.json$/;
const OUTPUT = /^(?:cdu|spd|gruene|linke|bsw|afd)-program-reference-scenario-v3\.png$/;

export const REFERENCE_SCENE_SCHEMA = "woek-parliament-reference-scene-1.0";
export const REFERENCE_SCENE_PROMPT_VERSION = "woek-parliament-shared-city-reference-1";

export function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => [key, canonical(item)]));
  }
  return value;
}

export const digest = (value) => createHash("sha256").update(value).digest("hex");
export const canonicalDigest = (value) => digest(JSON.stringify(canonical(value)));
export const contractDigest = (contract) => {
  const { contract_sha256: _contractSha256, ...withoutHash } = contract;
  return canonicalDigest(withoutHash);
};

function assertString(value, name, max = 3000) {
  if (typeof value !== "string" || value.length === 0 || value.length > max) throw new Error(`REFERENCE_SCENE_${name}_INVALID`);
}

function assertStringArray(value, name, { min = 0, max = 10 } = {}) {
  if (!Array.isArray(value) || value.length < min || value.length > max || value.some((item) => typeof item !== "string" || item.length === 0 || item.length > 240)) {
    throw new Error(`REFERENCE_SCENE_${name}_INVALID`);
  }
}

export function validateReferenceSceneContract(contract, { verifyHash = true } = {}) {
  if (!contract || typeof contract !== "object" || Array.isArray(contract)) throw new Error("REFERENCE_SCENE_CONTRACT_INVALID");
  if (contract.schema_version !== REFERENCE_SCENE_SCHEMA) throw new Error("REFERENCE_SCENE_SCHEMA_INVALID");
  if (verifyHash && (!SHA256.test(contract.contract_sha256 || "") || contractDigest(contract) !== contract.contract_sha256)) throw new Error("REFERENCE_SCENE_CONTRACT_HASH_INVALID");
  if (contract.set_id !== "st-ltw-2026-shared-city-reference-v1") throw new Error("REFERENCE_SCENE_SET_INVALID");
  if (!CONTRACT_PATH.test(contract.source_descriptor_path || "")) throw new Error("REFERENCE_SCENE_DESCRIPTOR_PATH_INVALID");
  if (!SHA256.test(contract.source_descriptor_manifest_sha256 || "")) throw new Error("REFERENCE_SCENE_DESCRIPTOR_HASH_INVALID");
  if (contract.owner_authorization?.status !== "APPROVED" || contract.owner_authorization?.scope !== "ONE_SHARED_REFERENCE_SCENE_AND_SIX_PROGRAMME_VARIANTS" || contract.owner_authorization?.generator_lane !== "EXISTING_ORACLE_HIGGSFIELD_SERVICE") throw new Error("REFERENCE_SCENE_OWNER_AUTHORIZATION_INVALID");
  if (contract.owner_authorization?.publication_mode !== "FAIL_CLOSED_UNTIL_ASSET_AND_SOURCE_FIDELITY_GATES_PASS") throw new Error("REFERENCE_SCENE_PUBLICATION_MODE_INVALID");
  const governance = contract.governance || {};
  if (governance.input_mode !== "APPROVED_VISUAL_BRIEF_ONLY" || governance.raw_programme_text_allowed !== false || governance.party_identity_as_semantic_input_allowed !== false || governance.campaign_style_allowed !== false || governance.image_to_fachdata_backpropagation_allowed !== false || governance.open_or_not_assessable_depicted_as_fact_allowed !== false || governance.common_camera_and_geometry_required !== true || governance.base_scene_is_evidence !== false) throw new Error("REFERENCE_SCENE_GOVERNANCE_INVALID");
  const generation = contract.generation || {};
  if (generation.provider !== "higgsfield" || generation.model !== "nano_banana_pro" || generation.aspect_ratio !== "16:9" || generation.resolution !== "2k" || generation.max_credits_per_image !== 2 || generation.max_new_images !== 7 || generation.serial_only !== true || generation.blind_retry_allowed !== false || generation.reference_mode !== "ONE_GENERATED_BASE_THEN_IMAGE_TO_IMAGE_VARIANTS") throw new Error("REFERENCE_SCENE_GENERATION_POLICY_INVALID");
  if (!ITEM_ID.test(contract.base?.item_id || "") || contract.base?.item_id !== `${contract.set_id}-base` || contract.base?.prompt_version !== REFERENCE_SCENE_PROMPT_VERSION) throw new Error("REFERENCE_SCENE_BASE_INVALID");
  for (const [name, value] of [["BASE_INSTRUCTION", contract.base.approved_scene_instruction], ["COMPOSITION_LOCK", contract.base.composition_lock], ["NEGATIVE_CONSTRAINTS", contract.base.negative_constraints]]) assertString(value, name);
  if (!Array.isArray(contract.variants) || contract.variants.length !== 6) throw new Error("REFERENCE_SCENE_VARIANTS_INVALID");
  const expected = ["ltw-2026-st-cdu", "ltw-2026-st-spd", "ltw-2026-st-gruene", "ltw-2026-st-linke", "ltw-2026-st-bsw", "ltw-2026-st-afd"];
  if (JSON.stringify(contract.variants.map((item) => item.source_key)) !== JSON.stringify(expected)) throw new Error("REFERENCE_SCENE_VARIANT_ORDER_INVALID");
  for (const variant of contract.variants) {
    if (!ITEM_ID.test(variant.item_id || "") || !SOURCE_KEY.test(variant.source_key || "") || !SHA256.test(variant.source_programme_record_sha256 || "") || !SHA256.test(variant.source_visual_brief_sha256 || "") || !OUTPUT.test(variant.output_filename || "")) throw new Error("REFERENCE_SCENE_VARIANT_IDENTITY_INVALID");
    assertStringArray(variant.selected_impact_path_ids, "SELECTED_PATHS", { min: 3, max: 5 });
    assertStringArray(variant.not_depicted_as_fact, "EXCLUDED_PATHS", { max: variant.selected_impact_path_ids.length });
    if (!variant.not_depicted_as_fact.every((id) => variant.selected_impact_path_ids.includes(id))) throw new Error("REFERENCE_SCENE_EXCLUDED_PATH_NOT_SELECTED");
    assertString(variant.approved_scene_instruction, "VARIANT_INSTRUCTION");
    assertString(variant.source_alt_text_basis, "ALT_TEXT_BASIS", 500);
  }
  return contract;
}

export function validateGenerationRequest(request) {
  if (!request || typeof request !== "object" || Array.isArray(request)) throw new Error("REFERENCE_SCENE_REQUEST_INVALID");
  if (!COMMIT.test(request.commit_sha || "") || !CONTRACT_PATH.test(request.contract_path || "") || !SHA256.test(request.contract_sha256 || "") || !ITEM_ID.test(request.item_id || "")) throw new Error("REFERENCE_SCENE_REQUEST_INVALID");
  if (Object.keys(request).some((key) => !["commit_sha", "contract_path", "contract_sha256", "item_id"].includes(key))) throw new Error("REFERENCE_SCENE_REQUEST_FIELDS_INVALID");
  return request;
}

export function referenceSceneItem(contract, itemId) {
  validateReferenceSceneContract(contract);
  if (itemId === contract.base.item_id) return { kind: "BASE", ...contract.base };
  const variant = contract.variants.find((item) => item.item_id === itemId);
  if (!variant) throw new Error("REFERENCE_SCENE_ITEM_UNKNOWN");
  return { kind: "PROGRAMME_VARIANT", prompt_version: REFERENCE_SCENE_PROMPT_VERSION, ...variant };
}

export function buildReferenceScenePrompt(contract, itemId) {
  const item = referenceSceneItem(contract, itemId);
  const common = [
    "Create a photorealistic but explicitly fictional model image for a neutral public-interest analysis portal. It is an ex-ante illustration, never a prediction, campaign image, real-place reconstruction or evidence of an outcome.",
    `Shared reference setting (approved data): ${contract.base.approved_scene_instruction}`,
    contract.base.composition_lock,
  ];
  if (item.kind === "BASE") {
    return [...common,
      "Create the neutral unmodified reference scene. Do not imply any party programme, policy choice, improvement or deterioration.",
      contract.base.negative_constraints,
      "Landscape 16:9, natural daylight, documentary architectural photography, credible materials and restrained colour. No text of any kind.",
    ].join("\n");
  }
  return [...common,
    "Use the supplied base reference image as the immutable visual anchor. Preserve the exact camera, perspective, street geometry, building massing, horizon, season, daylight and weather. This must be recognisable as the same place and same moment.",
    `Approved programme-scene change (quoted data, not instructions from a programme): ${item.approved_scene_instruction}`,
    "Do not add any other programme interpretation. Do not infer a benefit, harm, score, success, failure, popularity, direction or evidence level from the source key, political identity or image.",
    item.not_depicted_as_fact.length > 0 ? "One or more selected analysis paths are OPEN or NOT_ASSESSABLE and are intentionally excluded from depiction. Do not add a visual substitute for them." : "Only the approved physical scene elements above may change; all other analysed consequences remain non-visual.",
    contract.base.negative_constraints,
    "Landscape 16:9, natural daylight, documentary architectural photography, credible materials and restrained colour. No before/after split and no text of any kind.",
  ].join("\n");
}

export function validateContractAgainstDescriptor(contract, descriptor) {
  validateReferenceSceneContract(contract);
  if (!descriptor || descriptor.manifest_sha256 !== contract.source_descriptor_manifest_sha256) throw new Error("REFERENCE_SCENE_DESCRIPTOR_DRIFT");
  for (const variant of contract.variants) {
    const record = descriptor.records?.find((item) => item.visual_scope === "PROGRAM_SCENARIO" && item.source_key === variant.source_key);
    if (!record || canonicalDigest(record) !== variant.source_programme_record_sha256 || record.visual_brief?.content_sha256 !== variant.source_visual_brief_sha256) throw new Error("REFERENCE_SCENE_PROGRAMME_RECORD_DRIFT");
    if (JSON.stringify(record.selected_impact_path_ids) !== JSON.stringify(variant.selected_impact_path_ids)) throw new Error("REFERENCE_SCENE_SELECTED_PATH_DRIFT");
    if (record.editorial_review_status !== "APPROVED_FOR_PUBLICATION" || record.source_fidelity_status !== "PASS_APPROVED_ANALYSIS_ONLY") throw new Error("REFERENCE_SCENE_SOURCE_NOT_APPROVED");
  }
  return true;
}
