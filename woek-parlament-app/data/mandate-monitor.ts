export type CommitmentRelation =
  | "EXPLICITLY_ADDRESSED"
  | "PARTIALLY_ADDRESSED"
  | "MATERIALLY_CHANGED"
  | "NO_DOCUMENTED_DECISION_YET"
  | "NO_CLEAR_MAPPING";

export type MandateSource = {
  sourceId: string;
  sourceType: "ELECTION_PROGRAMME" | "COALITION_AGREEMENT" | "FINAL_DECISION";
  title: string;
  canonicalUrl: string;
  publishedAt: string;
  contentHash: string;
  status: "SOURCE_REQUIRED" | "VERIFIED" | "SUPERSEDED";
};

export type CommitmentComparison = {
  comparisonId: string;
  commitmentId: string;
  sourceIds: string[];
  relation: CommitmentRelation;
  rationale: string;
  sourceLocations: string[];
  editorialStatus: "DRAFT" | "APPROVED" | "PUBLISHED";
  woekAssessmentId?: string;
};

// The public page deliberately starts empty. Real programme, coalition and
// decision texts enter only after an official source snapshot and an editorial
// approval; no party-document claim is generated from a model response.
export const mandateSources: MandateSource[] = [];
export const commitmentComparisons: CommitmentComparison[] = [];
