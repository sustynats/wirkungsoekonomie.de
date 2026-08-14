import { reviewCasePackageSchema, reviewResultSchema, type ReviewResult } from "@/lib/review/contracts";
import { assertExternalReviewSafe, sha256, stableJson } from "@/lib/review/privacy";
import { supabaseRest } from "@/lib/database/supabase-admin";

type BatchCaseRow = {
  review_batch_id: string;
  case_id: string;
  package_payload: unknown;
  package_hash: string;
};

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
  return errors;
}

export async function importReviewResult(resultInput: unknown) {
  const result = reviewResultSchema.parse(resultInput);
  assertExternalReviewSafe(result, "review-result");
  const rows = await supabaseRest<BatchCaseRow[]>(`parliament.review_batch_cases?select=review_batch_id,case_id,package_payload,package_hash&case_id=eq.${encodeURIComponent(result.case_id)}&package_hash=eq.${result.input_package_hash}&limit=1`);
  const batchCase = rows[0];
  if (!batchCase) throw new Error("No matching exported review package was found.");
  const validationErrors = validateResultAgainstPackage(result, batchCase.package_payload);
  const resultHash = sha256(result);
  const importStatus = validationErrors.length === 0 ? "REVIEW_PROPOSAL" : "SOURCE_CONFLICT";

  await supabaseRest("parliament.external_review_results", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
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
  return { reviewId: result.review_id, caseId: result.case_id, importStatus, validationErrors };
}
