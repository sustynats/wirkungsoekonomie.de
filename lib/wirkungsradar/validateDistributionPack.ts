import type { DistributionPack } from "../../content/wirkungsradar/schema/distribution-pack";

export type DistributionSafetyResult = {
  passed: boolean;
  status: DistributionPack["status"];
  issues: string[];
};

const blockedDossierStatuses = new Set([
  "draft_dehumanization_risk",
  "draft_example_amplifies_frame",
  "draft_core_error",
]);

const hostileLabels = [
  "dumm",
  "boese",
  "böse",
  "nazi",
  "schwurbler",
  "schmarotzer",
  "parasiten",
];

const rageHooks = [
  "skandal",
  "wahnsinn",
  "irre",
  "die wahrheit ist",
  "sie wollen",
  "du wirst belogen",
];

export function validateDistributionPack(
  pack: DistributionPack,
  sourceDossierStatus: string
): DistributionSafetyResult {
  const issues: string[] = [];
  const output = JSON.stringify(pack.platformAssets).toLowerCase();

  if (blockedDossierStatuses.has(sourceDossierStatus)) {
    issues.push("source_dossier_status_blocked");
  }

  if (!pack.safety.usesPositiveExample) issues.push("positive_example_missing");
  if (!pack.safety.includesBetterQuestion) issues.push("better_question_missing");
  if (!pack.safety.includesSourceHint) issues.push("source_hint_missing");
  if (!pack.safety.avoidsFrameAmplification) issues.push("frame_shift_missing");
  if (!pack.safety.avoidsDehumanization) issues.push("dehumanization_guard_missing");
  if (!pack.safety.noUnverifiedNumbers) issues.push("unverified_numbers_guard_missing");
  if (!pack.safety.noRageHook) issues.push("rage_hook_guard_missing");

  for (const label of hostileLabels) {
    if (output.includes(label)) issues.push(`hostile_label:${label}`);
  }

  for (const marker of rageHooks) {
    if (output.includes(marker)) issues.push(`rage_marker:${marker}`);
  }

  if (!output.includes("bessere frage")) issues.push("better_question_removed_in_output");
  if (!output.includes("quellen") && !output.includes("datenstand")) issues.push("source_layer_removed_in_output");

  return {
    passed: issues.length === 0,
    status: issues.length === 0 ? pack.status : "blocked_frame_risk",
    issues,
  };
}
