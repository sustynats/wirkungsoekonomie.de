export const relationshipStatuses = [
  "ADVANCES",
  "PARTIALLY_ADVANCES",
  "DEVIATES",
  "NOT_YET_DECIDED",
  "NOT_COMPARABLE",
  "EVIDENCE_OPEN"
] as const;

export type RelationshipStatus = (typeof relationshipStatuses)[number];

export const impactAssessmentStatuses = [
  "NOT_STARTED",
  "DATA_GAP",
  "RULE_BASED_ASSESSMENT",
  "QUANTIFIED_EXPECTED_EFFECT",
  "QUANTIFIED_OBSERVED_EFFECT",
  "READY_FOR_APPROVAL",
  "PUBLISHED"
] as const;

export type ImpactAssessmentStatus = (typeof impactAssessmentStatuses)[number];

export type CommitmentComparison = {
  relationshipStatus: RelationshipStatus;
  verificationStatus: "PROPOSED" | "EDITORIALLY_VERIFIED";
  sourceRefs: string[];
  factualRationale: string;
};

/**
 * A traceability result is not a WÖk result.  This guard prevents a UI or an
 * import from presenting a commitment-to-decision relationship as a positive
 * impact assessment before independent evidence and methods are available.
 */
export function canPublishComparison(comparison: CommitmentComparison) {
  return comparison.verificationStatus === "EDITORIALLY_VERIFIED"
    && comparison.sourceRefs.length > 0
    && comparison.factualRationale.trim().length > 0;
}

export function impactLabel(status: ImpactAssessmentStatus) {
  const labels: Record<ImpactAssessmentStatus, string> = {
    NOT_STARTED: "Wirkungscheck noch nicht begonnen",
    DATA_GAP: "Datenlage reicht noch nicht aus",
    RULE_BASED_ASSESSMENT: "regelbasiert eingeordnet",
    QUANTIFIED_EXPECTED_EFFECT: "Wirkungspotenzial quantifiziert",
    QUANTIFIED_OBSERVED_EFFECT: "beobachtete Wirkung quantifiziert",
    READY_FOR_APPROVAL: "fachlich zur Freigabe vorbereitet",
    PUBLISHED: "Wirkungscheck veröffentlicht"
  };
  return labels[status];
}
