import type { NarrativeSeed } from "./narrative-seed-types";

export type NarrativeSeedAuditRow = {
  seedId: string;
  publicDisplayAllowed: boolean;
  needsHumanTopicReview: boolean;
  needsConspiracyReview: boolean;
  gapPriority: "P1" | "P2" | "P3";
  note: string;
};

export function auditNarrativeSeed(seed: NarrativeSeed): NarrativeSeedAuditRow {
  const needsHumanTopicReview = seed.riskDimensions.includes("minderheitenschutz");
  const needsConspiracyReview = seed.narrativeFamily === "elitenverschwoerung";
  const publicDisplayAllowed = seed.publicHandling !== "never_public_raw";
  return {
    seedId: seed.id,
    publicDisplayAllowed,
    needsHumanTopicReview,
    needsConspiracyReview,
    gapPriority: seed.status === "candidate_new_dossier" ? "P1" : seed.status === "needs_review" ? "P2" : "P3",
    note: publicDisplayAllowed
      ? "Nur kontextualisiert und mit Frame-Shift nutzen."
      : "Nicht roh öffentlich anzeigen; zuerst in frame-sichere Karte übersetzen.",
  };
}

export function seedRegistryIsInternalOnly(): boolean {
  return true;
}
