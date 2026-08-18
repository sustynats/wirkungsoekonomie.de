export const CODEX_MUST_NOT_GENERATE_RECOMMENDATIONS = true as const;
export const ZIP_IS_NOT_CANONICAL_SOURCE = true as const;

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

export const recommendationFachStatusEnum = [
  "APPROVED",
  "APPROVED_WITH_OPEN_DATA",
  "OPEN",
  "SUPERSEDED",
  "BLOCKED",
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
  recommendation_content_sha256?: string | null;
  status: RecommendationLedgerStatus;
};

export type RecommendationIdentity = {
  impact_case_id: string;
  recommendation_id: string;
  recommendation_version: string;
  recommendation_content_sha256?: string | null;
  supersedes_recommendation_version?: string | null;
};

export type RecommendationQueueEntry = {
  impact_case_id: string;
  [key: string]: unknown;
};

export type RecommendationBackfillDisposition =
  | "PROCESS"
  | "SKIP_COMPLETED_APPROVED"
  | "IDEMPOTENT_ALREADY_CANONICAL"
  | "PROCESS_NEW_APPROVED_VERSION"
  | "PROCESS_RECONCILED_COMPLETED_APPROVED"
  | "CONFLICT_WITH_COMPLETED_APPROVED"
  | "CONFLICTING_CANONICAL_VERSION"
  | "CONFLICTING_CANONICAL_CONTENT";

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
    if (exactCompletedIdentity) {
      const contentConflict = Boolean(
        completed.recommendation_content_sha256
        && input.incoming.recommendation_content_sha256
        && completed.recommendation_content_sha256 !== input.incoming.recommendation_content_sha256,
      );
      return contentConflict ? "CONFLICTING_CANONICAL_CONTENT" : "SKIP_COMPLETED_APPROVED";
    }
    if (input.incoming.supersedes_recommendation_version === completed.recommendation_version) {
      return "PROCESS_NEW_APPROVED_VERSION";
    }
    return "CONFLICT_WITH_COMPLETED_APPROVED";
  }

  const canonicalForImpactCase = input.canonicalRecommendations.filter((record) =>
    record.impact_case_id === input.incoming.impact_case_id);

  if (!canonicalForImpactCase.length) return "PROCESS";

  const exactCanonicalIdentity = canonicalForImpactCase.find((record) =>
    record.recommendation_id === input.incoming.recommendation_id
    && record.recommendation_version === input.incoming.recommendation_version);

  if (exactCanonicalIdentity) {
    const contentConflict = Boolean(
      exactCanonicalIdentity.recommendation_content_sha256
      && input.incoming.recommendation_content_sha256
      && exactCanonicalIdentity.recommendation_content_sha256 !== input.incoming.recommendation_content_sha256,
    );
    return contentConflict ? "CONFLICTING_CANONICAL_CONTENT" : "IDEMPOTENT_ALREADY_CANONICAL";
  }

  const supersededCanonicalVersion = canonicalForImpactCase.some((record) =>
    record.recommendation_version === input.incoming.supersedes_recommendation_version);

  return supersededCanonicalVersion ? "PROCESS_NEW_APPROVED_VERSION" : "CONFLICTING_CANONICAL_VERSION";
}

export function recommendationBackfillDispositionWithReconciliation(input: {
  incoming: RecommendationIdentity;
  ledgerRecords: RecommendationLedgerRecord[];
  canonicalRecommendations: RecommendationIdentity[];
  reconcileCompletedApproved: boolean;
}): RecommendationBackfillDisposition {
  const disposition = recommendationBackfillDisposition(input);
  return input.reconcileCompletedApproved && disposition === "SKIP_COMPLETED_APPROVED"
    ? "PROCESS_RECONCILED_COMPLETED_APPROVED"
    : disposition;
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

export function assertRecommendationIsFachApprovedRecord(
  record: Record<string, unknown>,
  options: { requiredFachStatus?: "APPROVED" } = {},
) {
  if (!allowedRecommendationStatuses.includes(record.recommendation_status as AllowedRecommendationStatus)) {
    throw new Error(`Unsupported recommendation_status: ${String(record.recommendation_status)}`);
  }

  for (const field of forbiddenTechnicalDerivationFields) {
    if (Object.hasOwn(record, field)) {
      throw new Error(`Technical recommendation derivation field is forbidden: ${field}`);
    }
  }

  const fachStatus = String(record.fach_status ?? "");
  const allowedFachStatuses: readonly string[] = options.requiredFachStatus
    ? [options.requiredFachStatus]
    : recommendationFachStatusEnum.filter((status) => status === "APPROVED" || status === "APPROVED_WITH_OPEN_DATA");
  if (!allowedFachStatuses.includes(fachStatus)) {
    throw new Error(`Recommendation record is not fach-approved: ${fachStatus || "MISSING"}`);
  }

  return true;
}

const requiredRecommendationScalars = [
  "recommendation_id",
  "impact_case_id",
  "recommendation_version",
  "knowledge_cutoff_date",
  "root_cause_or_binding_bottleneck",
  "system_leverage",
  "competence_scope",
  "implementation_route",
  "evidence_grade",
  "uncertainty",
  "hindsight_limitations",
] as const;

const requiredRecommendationArrays = [
  "source_refs",
  "option_set",
  "cascade_effects",
  "safeguards",
  "monitoring_indicators",
  "evidence_available_at_decision_time",
  "evidence_only_available_later",
  "legal_constraints",
] as const;

export function assertRecommendationHandoffRecord(record: Record<string, unknown>) {
  assertRecommendationIsFachApprovedRecord(record, { requiredFachStatus: "APPROVED" });

  for (const field of requiredRecommendationScalars) {
    if (typeof record[field] !== "string" || !String(record[field]).trim()) {
      throw new Error(`Recommendation handoff is missing required field: ${field}`);
    }
  }

  for (const field of requiredRecommendationArrays) {
    if (!Array.isArray(record[field])) {
      throw new Error(`Recommendation handoff field must be an array: ${field}`);
    }
  }

  for (const field of ["source_refs", "option_set", "cascade_effects", "safeguards", "monitoring_indicators"] as const) {
    if ((record[field] as unknown[]).length === 0) {
      throw new Error(`Recommendation handoff field must not be empty: ${field}`);
    }
  }

  if (!Object.hasOwn(record, "woek_preferred_option")) {
    throw new Error("Recommendation handoff is missing preferred option / decision corridor.");
  }
  if (!Object.hasOwn(record, "fallback_option")) {
    throw new Error("Recommendation handoff is missing fallback_option.");
  }
  if (!Object.hasOwn(record, "supersedes_recommendation_version")) {
    throw new Error("Recommendation handoff is missing supersession metadata.");
  }

  return true;
}
