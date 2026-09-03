export type RecommendationVersionLike = {
  impact_case_id: string;
  recommendation_version: string;
  supersedes_recommendation_version: string | null;
  triggering_evidence_event_ids: string[];
};

export type RecommendationReviewCandidate = {
  candidate_id: string;
  impact_case_id: string;
  current_recommendation_version: string | null;
  triggering_evidence_event_ids: string[];
  status: "RECOMMENDATION_REVIEW_REQUIRED";
  created_at: string;
  review_note: string | null;
};

export function recommendationVersionCanFollow(current: RecommendationVersionLike | null, next: RecommendationVersionLike) {
  if (!current) return next.supersedes_recommendation_version === null;
  return current.impact_case_id === next.impact_case_id
    && next.recommendation_version !== current.recommendation_version
    && next.supersedes_recommendation_version === current.recommendation_version;
}

export function recommendationReviewCandidate(input: {
  impactCaseId: string;
  currentRecommendationVersion: string | null;
  evidenceEventIds: string[];
  createdAt: string;
}): RecommendationReviewCandidate {
  if (input.evidenceEventIds.length === 0) throw new Error("Recommendation review requires at least one EvidenceEvent.");
  const suffix = input.evidenceEventIds.join("-").replace(/[^a-zA-Z0-9]+/g, "-").slice(0, 80);
  return {
    candidate_id: `recommendation-review:${input.impactCaseId}:${suffix}`,
    impact_case_id: input.impactCaseId,
    current_recommendation_version: input.currentRecommendationVersion,
    triggering_evidence_event_ids: [...new Set(input.evidenceEventIds)],
    status: "RECOMMENDATION_REVIEW_REQUIRED",
    created_at: input.createdAt,
    review_note: null,
  };
}
