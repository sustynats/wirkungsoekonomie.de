import { prepareFactPackage } from "@/lib/editorial/fact-packages";
import { supabaseRest } from "@/lib/database/supabase-admin";
import { currentReferenceSnapshot } from "@/lib/review/reference-snapshot";
import { sha256 } from "@/lib/review/privacy";
import { reviewPackageSchemaVersion, type ReviewBatchPackage, type ReviewCasePackage, type ReviewType } from "@/lib/review/contracts";

type BatchRow = { id: string };

function sourceTitle(source: { document_type: string; source_metadata: Record<string, unknown> }) {
  const title = source.source_metadata.title;
  return typeof title === "string" && title.trim() ? title.trim() : source.document_type;
}

function sourceVersion(source: { source_hash: string | null }) {
  return source.source_hash ? `sha256:${source.source_hash}` : null;
}

function buildReviewRequest(reviewType: ReviewType, dataGapMessages: string[]) {
  const incremental = reviewType === "INCREMENTAL_REVIEW";
  return {
    questions_to_answer: incremental
      ? ["Prüfe ausschließlich die im Faktenpaket als geändert oder abhängig markierten Wirkpfade, Claims und Berechnungsanforderungen."]
      : ["Strukturiere die fachlich relevanten Wirkpfade, Datenanforderungen, Risiken, Gegenfaktumfragen und normativen Zuordnungen für die abgegrenzte Entscheidung."],
    required_outputs: [
      "Ex-ante- und Ex-post-Perspektive getrennt ausweisen.",
      "Keine fehlenden Zahlen schätzen; stattdessen DATA_GAP dokumentieren.",
      "Quellen nur über die mitgelieferten source_id referenzieren.",
      "Berechnungsanforderungen statt freier Rechenprosa liefern."
    ],
    known_data_gaps: dataGapMessages,
    known_source_conflicts: [],
    calculation_inputs_available: [],
    calculation_inputs_missing: dataGapMessages
  };
}

function addCaseHash(input: Omit<ReviewCasePackage, "package_hash">): ReviewCasePackage {
  return { ...input, package_hash: sha256(input) };
}

async function nextBatchCode() {
  const year = new Date().getUTCFullYear();
  const rows = await supabaseRest<Array<{ id: string }>>(`parliament.review_batches?select=id&batch_code=like.WOEK-REVIEW-${year}-%`);
  return `WOEK-REVIEW-${year}-${String(rows.length + 1).padStart(4, "0")}`;
}

export async function createReviewBatch({
  caseIds,
  reviewType,
  createdBy
}: {
  caseIds: string[];
  reviewType: ReviewType;
  createdBy: string;
}) {
  const uniqueCaseIds = [...new Set(caseIds)];
  if (uniqueCaseIds.length === 0) throw new Error("At least one case is required for a review batch.");
  if (uniqueCaseIds.length > 15) throw new Error("A review batch may contain at most 15 cases.");

  const cases: ReviewCasePackage[] = [];
  for (const caseId of uniqueCaseIds) {
    const fact = await prepareFactPackage(caseId);
    if (fact.completenessStatus !== "READY_FOR_REVIEW") {
      throw new Error(`Case ${caseId} is not ready for external review: required source data is missing.`);
    }
    const decisionObject = String(fact.factPackage.decision_object ?? "");
    const reviewRequest = buildReviewRequest(reviewType, Array.isArray(fact.factPackage.uncertainties) ? fact.factPackage.uncertainties.map(String) : []);
    cases.push(addCaseHash({
      case_id: caseId,
      case_title: decisionObject,
      review_type: reviewType,
      previous_review_id: null,
      decision: {
        decision_unit_id: null,
        decision_object: decisionObject,
        decision_date: typeof fact.factPackage.decision_date === "string" ? fact.factPackage.decision_date : null,
        parliamentary_status: String(fact.factPackage.parliamentary_status ?? "STATUS_UNVERIFIED"),
        final_version: null,
        actual_outcome: null,
        vote_type: typeof fact.factPackage.vote_type === "string" ? fact.factPackage.vote_type : null,
        vote_result: typeof fact.factPackage.vote_result === "object" && fact.factPackage.vote_result ? fact.factPackage.vote_result as Record<string, unknown> : {}
      },
      fact_package: fact.factPackage,
      source_manifest: fact.sourceRows.map((source) => ({
        source_id: source.id,
        title: sourceTitle(source),
        institution: source.source_attribution,
        url: source.source_url,
        document_date: source.document_date,
        retrieved_at: source.retrieved_at,
        document_type: source.document_type,
        version: sourceVersion(source),
        temporal_class: source.temporal_class,
        relevant_locations: []
      })),
      excerpts: [],
      evidence: {
        ex_ante_source_ids: fact.sourceRows.filter((source) => source.temporal_class === "AVAILABLE_AT_DECISION_TIME").map((source) => source.id),
        ex_post_source_ids: fact.sourceRows.filter((source) => source.temporal_class === "PUBLISHED_AFTER_DECISION").map((source) => source.id)
      },
      woek_reference_snapshot: currentReferenceSnapshot(),
      review_request: reviewRequest
    }));
  }

  const batchCode = await nextBatchCode();
  const batchWithoutHash = {
    schema_version: reviewPackageSchemaVersion as typeof reviewPackageSchemaVersion,
    batch_code: batchCode,
    review_type: reviewType,
    created_at: new Date().toISOString(),
    cases
  };
  const batch: ReviewBatchPackage = { ...batchWithoutHash, package_hash: sha256(batchWithoutHash) };

  const batchRows = await supabaseRest<BatchRow[]>("parliament.review_batches", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      batch_code: batch.batch_code,
      review_type: batch.review_type,
      status: "READY",
      package_schema_version: batch.schema_version,
      package_hash: batch.package_hash,
      source_reference_snapshot: currentReferenceSnapshot(),
      created_by: createdBy
    })
  });
  const persisted = batchRows[0];
  if (!persisted) throw new Error("Could not persist review batch.");

  for (const casePackage of batch.cases) {
    const fact = await prepareFactPackage(casePackage.case_id);
    await supabaseRest("parliament.review_batch_cases", {
      method: "POST",
      body: JSON.stringify({
        review_batch_id: persisted.id,
        case_id: casePackage.case_id,
        decision_fact_package_id: fact.factPackageId,
        review_request: casePackage.review_request,
        package_payload: casePackage,
        package_hash: casePackage.package_hash
      })
    });
    await supabaseRest(`parliament.cases?id=eq.${encodeURIComponent(casePackage.case_id)}`, {
      method: "PATCH",
      body: JSON.stringify({ review_status: "REVIEW_PACKAGE_READY" })
    });
  }
  return { id: persisted.id, batch };
}
