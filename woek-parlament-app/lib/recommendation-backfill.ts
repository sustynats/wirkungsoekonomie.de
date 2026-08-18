export const CODEX_MUST_NOT_GENERATE_RECOMMENDATIONS = true as const;

export const allowedRecommendationStatuses = [
  "PREFERRED_OPTION",
  "PREFERRED_DESIGN",
  "DECISION_CORRIDOR",
  "PILOT_AND_LEARN",
  "KEEP_CURRENT_WITH_MODIFICATIONS",
  "STOP_OR_REVERSE",
  "NO_ROBUST_RECOMMENDATION",
  "OPEN",
] as const;

export type AllowedRecommendationStatus = (typeof allowedRecommendationStatuses)[number];

export type RecommendationLedgerStatus =
  | "COMPLETED_APPROVED"
  | "REVIEW_REQUIRED"
  | "BLOCKED"
  | string;

export type RecommendationLedgerRecord = {
  impact_case_id: string;
  recommendation_id?: string | null;
  recommendation_version?: string | null;
  status: RecommendationLedgerStatus;
};

export type RecommendationIdentity = {
  impact_case_id: string;
  recommendation_id: string;
  recommendation_version: string;
};

export type RecommendationQueueEntry = {
  impact_case_id: string;
  [key: string]: unknown;
};

export type RecommendationBackfillDisposition =
  | "PROCESS"
  | "SKIP_COMPLETED_APPROVED"
  | "IDEMPOTENT_ALREADY_CANONICAL"
  | "CONFLICT_WITH_COMPLETED_APPROVED"
  | "CONFLICTING_CANONICAL_VERSION";

export function shouldSkipRecommendationQueueEntry(
  impactCaseId: string,
  ledgerRecords: RecommendationLedgerRecord[],
) {
  return ledgerRecords.some((record) =>
    record.impact_case_id === impactCaseId && record.status === "COMPLETED_APPROVED");
}

export function nextOpenRecommendationQueueEntries<T extends RecommendationQueueEntry>(
  queue: T[],
  ledgerRecords: RecommendationLedgerRecord[],
  limit: number,
) {
  if (!Number.isInteger(limit) || limit < 1) throw new Error("Recommendation batch limit must be a positive integer.");
  return queue
    .filter((entry) => !shouldSkipRecommendationQueueEntry(entry.impact_case_id, ledgerRecords))
    .slice(0, limit);
}

export function recommendationBackfillDisposition(input: {
  incoming: RecommendationIdentity;
  ledgerRecords: RecommendationLedgerRecord[];
  canonicalRecommendations: RecommendationIdentity[];
}): RecommendationBackfillDisposition {
  const completed = input.ledgerRecords.find((record) =>
    record.impact_case_id === input.incoming.impact_case_id && record.status === "COMPLETED_APPROVED");

  if (completed) {
    const exactCompletedIdentity = completed.recommendation_id === input.incoming.recommendation_id
      && completed.recommendation_version === input.incoming.recommendation_version;
    return exactCompletedIdentity ? "SKIP_COMPLETED_APPROVED" : "CONFLICT_WITH_COMPLETED_APPROVED";
  }

  const canonicalForImpactCase = input.canonicalRecommendations.find((record) =>
    record.impact_case_id === input.incoming.impact_case_id);

  if (!canonicalForImpactCase) return "PROCESS";

  const exactCanonicalIdentity = canonicalForImpactCase.recommendation_id === input.incoming.recommendation_id
    && canonicalForImpactCase.recommendation_version === input.incoming.recommendation_version;

  return exactCanonicalIdentity ? "IDEMPOTENT_ALREADY_CANONICAL" : "CONFLICTING_CANONICAL_VERSION";
}

const forbiddenTechnicalDerivationFields = new Set([
  "auto_generated_recommendation",
  "generated_by_codex",
  "net_score",
  "mpd_score",
  "party_score",
  "person_score",
  "government_score",
  "score_winner",
]);

export function assertRecommendationIsFachApprovedRecord(record: Record<string, unknown>) {
  if (!allowedRecommendationStatuses.includes(record.recommendation_status as AllowedRecommendationStatus)) {
    throw new Error(`Unsupported recommendation_status: ${String(record.recommendation_status)}`);
  }

  for (const field of forbiddenTechnicalDerivationFields) {
    if (Object.hasOwn(record, field)) {
      throw new Error(`Technical recommendation derivation field is forbidden: ${field}`);
    }
  }

  const fachStatus = String(record.fach_status ?? "");
  if (!["APPROVED", "APPROVED_WITH_OPEN_DATA", "APPROVED_FOR_CODEX_INTEGRATION"].includes(fachStatus)) {
    throw new Error(`Recommendation record is not fach-approved: ${fachStatus || "MISSING"}`);
  }

  return true;
}
