import { prepareFactPackage } from "@/lib/editorial/fact-packages";
import { createReviewBatch } from "@/lib/editorial/review-batches";
import { exportReviewBatch } from "@/lib/editorial/review-export";
import { reviewNotificationDeliveryReady } from "@/lib/notifications/discord";
import { supabaseRest } from "@/lib/database/supabase-admin";

type CandidateCase = {
  id: string;
  title: string;
  current_stage: string | null;
  decision_date: string | null;
};

const pendingParliamentaryStage = /(dem bundestag zugeleitet|noch nicht beraten|überwiesen|beratung|ausschuss)/i;
const closedParliamentaryStage = /(beantwortet|abgeschlossen|erledigt|verkündet|abgelehnt|zurückgezogen)/i;

function isUpcomingCandidate(stage: string | null) {
  return Boolean(stage && pendingParliamentaryStage.test(stage) && !closedParliamentaryStage.test(stage));
}

/**
 * Rules-first preparation for material decisions that are still changeable in
 * Parliament. It intentionally creates a review package, not a public
 * recommendation: a public check appears only after sources and editorial
 * gates are complete.
 */
export async function prepareUpcomingDecisionReviews({
  maximumCases = 15,
  exportWhenPrivateNotificationReady = false
}: {
  maximumCases?: number;
  exportWhenPrivateNotificationReady?: boolean;
} = {}) {
  const cap = Math.max(1, Math.min(maximumCases, 15));
  const candidates = await supabaseRest<CandidateCase[]>(
    "parliament.cases?select=id,title,current_stage,decision_date" +
    "&materiality_status=eq.SELECTED_FOR_FULL_IMPACT_REVIEW" +
    "&review_status=eq.NOT_READY" +
    "&publication_status=eq.DRAFT" +
    "&order=decision_date.desc.nullslast&limit=300"
  );

  const readyCaseIds: string[] = [];
  const dataGaps: Array<{ case_id: string; title: string }> = [];
  for (const candidate of candidates) {
    if (readyCaseIds.length >= cap) break;
    if (!isUpcomingCandidate(candidate.current_stage)) continue;
    const fact = await prepareFactPackage(candidate.id, { reviewContext: "EX_ANTE" });
    if (fact.completenessStatus === "READY_FOR_REVIEW") readyCaseIds.push(candidate.id);
    else dataGaps.push({ case_id: candidate.id, title: candidate.title });
  }

  if (readyCaseIds.length === 0) {
    return {
      candidates_examined: candidates.filter((candidate) => isUpcomingCandidate(candidate.current_stage)).length,
      review_batch: null,
      data_gaps: dataGaps,
      delivery: "NOT_CREATED"
    };
  }

  const created = await createReviewBatch({
    caseIds: readyCaseIds,
    reviewType: "FULL_REVIEW",
    reviewContext: "EX_ANTE",
    createdBy: "SYSTEM_UPCOMING_PREPARATION"
  });
  if (!exportWhenPrivateNotificationReady || !reviewNotificationDeliveryReady()) {
    return {
      candidates_examined: candidates.filter((candidate) => isUpcomingCandidate(candidate.current_stage)).length,
      review_batch: { id: created.id, batch_code: created.batch.batch_code, case_count: created.batch.cases.length },
      data_gaps: dataGaps,
      delivery: "READY_FOR_PROTECTED_EXPORT"
    };
  }

  const exported = await exportReviewBatch(created.id);
  return {
    candidates_examined: candidates.filter((candidate) => isUpcomingCandidate(candidate.current_stage)).length,
    review_batch: { id: created.id, batch_code: created.batch.batch_code, case_count: created.batch.cases.length },
    data_gaps: dataGaps,
    delivery: exported.notification.status
  };
}
