import { reviewCasePackageSchema, type ReviewResult } from "@/lib/review/contracts";
import { assertExternalReviewSafe, sha256, stableJson } from "@/lib/review/privacy";
import { supabaseRest } from "@/lib/database/supabase-admin";
import { normalizeExternalReviewResult, reviewResultIdentity } from "@/lib/review/external-result-adapter";
import { queueEvidenceCandidates } from "@/lib/editorial/evidence-candidates";

type BatchCaseRow = {
  review_batch_id: string;
  case_id: string;
  package_payload: unknown;
  package_hash: string;
};

type StoredExternalReview = { id: string; result_hash: string };
type StoredExternalReviewRevision = { id: string };

function validateResultAgainstPackage(result: ReviewResult, packagePayload: unknown) {
  const reviewPackage = reviewCasePackageSchema.parse(packagePayload);
  const errors: string[] = [];
  if (result.case_id !== reviewPackage.case_id) errors.push("Case ID does not belong to the supplied package.");
  if (result.review_type !== reviewPackage.review_type) errors.push("Review type does not match the supplied package.");
  if (result.input_package_hash !== reviewPackage.package_hash) errors.push("Input package hash does not match the supplied package.");
  if (stableJson(result.woek_reference_snapshot) !== stableJson(reviewPackage.woek_reference_snapshot)) {
    errors.push("Reference snapshot does not match the supplied package.");
  }
  const knownSourceIds = new Set(reviewPackage.source_manifest.map((source) => source.source_id));
  for (const sourceId of result.provenance.source_refs_used) {
    if (!knownSourceIds.has(sourceId)) errors.push(`Unknown source reference: ${sourceId}.`);
  }
  for (const tile of result.normative_mapping.tile_mappings) {
    for (const sourceId of tile.source_refs) {
      if (!knownSourceIds.has(sourceId)) {
        errors.push(`Unknown source reference in normative mapping ${tile.id}: ${sourceId}.`);
      }
    }
  }
  return errors;
}

export async function importReviewResult(resultInput: unknown) {
  assertExternalReviewSafe(resultInput, "review-result");
  const identity = reviewResultIdentity(resultInput);
  const rows = await supabaseRest<BatchCaseRow[]>(`parliament.review_batch_cases?select=review_batch_id,case_id,package_payload,package_hash&case_id=eq.${encodeURIComponent(identity.caseId)}&package_hash=eq.${identity.inputPackageHash}&limit=1`);
  const batchCase = rows[0];
  if (!batchCase) throw new Error("No matching exported review package was found.");
  const reviewPackage = reviewCasePackageSchema.parse(batchCase.package_payload);
  const result = normalizeExternalReviewResult(resultInput, reviewPackage);
  const validationErrors = validateResultAgainstPackage(result, batchCase.package_payload);
  const resultHash = sha256(result);
  const importStatus = validationErrors.length === 0 ? "REVIEW_PROPOSAL" : "SOURCE_CONFLICT";

  const matchingResults = await supabaseRest<StoredExternalReview[]>(`parliament.external_review_results?result_hash=eq.${resultHash}&select=id,result_hash&limit=1`);
  let storedReview = matchingResults[0];
  let storedRevisionId: string | null = null;
  if (!storedReview) {
    const sameReview = await supabaseRest<StoredExternalReview[]>(`parliament.external_review_results?review_batch_id=eq.${encodeURIComponent(batchCase.review_batch_id)}&case_id=eq.${encodeURIComponent(result.case_id)}&review_id=eq.${encodeURIComponent(result.review_id)}&select=id,result_hash&limit=1`);
    storedReview = sameReview[0];
    if (storedReview) {
      const existingRevision = await supabaseRest<StoredExternalReviewRevision[]>(`parliament.external_review_result_revisions?external_review_result_id=eq.${encodeURIComponent(storedReview.id)}&result_hash=eq.${resultHash}&select=id&limit=1`);
      if (existingRevision[0]) {
        storedRevisionId = existingRevision[0].id;
      } else {
        const insertedRevision = await supabaseRest<StoredExternalReviewRevision[]>("parliament.external_review_result_revisions", {
          method: "POST",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({
            external_review_result_id: storedReview.id,
            result_hash: resultHash,
            result_payload: result,
            import_status: importStatus,
            validation_errors: validationErrors,
            imported_at: new Date().toISOString()
          })
        });
        storedRevisionId = insertedRevision[0]?.id ?? null;
      }
    } else {
      const inserted = await supabaseRest<StoredExternalReview[]>("parliament.external_review_results", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          review_batch_id: batchCase.review_batch_id,
          case_id: result.case_id,
          review_id: result.review_id,
          review_type: result.review_type,
          input_package_hash: result.input_package_hash,
          reference_snapshot: result.woek_reference_snapshot,
          result_payload: result,
          result_hash: resultHash,
          import_status: importStatus,
          validation_errors: validationErrors,
          imported_at: new Date().toISOString()
        })
      });
      storedReview = inserted[0];
    }
  }
  if (!storedReview) throw new Error("Review result could not be stored.");

  // A review remains a valid, source-bound proposal even when it names a
  // later research lead that has not been supplied in the strict
  // CANDIDATE_ONLY contract.  Such a lead must never be promoted to evidence
  // or a public citation, but it must not cause us to drop the complete
  // review (and all its already validated impact paths) on the floor.
  let evidenceQueue = { queued: 0 };
  if (validationErrors.length === 0) {
    try {
      evidenceQueue = await queueEvidenceCandidates(result, storedReview.id, storedRevisionId);
    } catch (error) {
      console.warn(`Evidence leads for ${result.case_id} were retained only inside the protected review payload: ${error instanceof Error ? error.message : "invalid candidate payload"}`);
    }
  }

  if (validationErrors.length === 0) {
    await supabaseRest(`parliament.cases?id=eq.${encodeURIComponent(result.case_id)}`, {
      method: "PATCH",
      body: JSON.stringify({ review_status: "REVIEW_IMPORTED" })
    });
    await supabaseRest(`parliament.review_batches?id=eq.${encodeURIComponent(batchCase.review_batch_id)}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "RESULT_RECEIVED", imported_at: new Date().toISOString() })
    });
  }
  return { reviewId: result.review_id, caseId: result.case_id, importStatus, validationErrors, evidenceCandidatesQueued: evidenceQueue.queued };
}
