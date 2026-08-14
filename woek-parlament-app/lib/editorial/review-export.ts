import { notifyReviewPackageReady } from "@/lib/notifications/discord";
import { reviewBatchPackageSchema, type ReviewBatchPackage } from "@/lib/review/contracts";
import { createReviewZip } from "@/lib/review/zip";
import { supabaseRest } from "@/lib/database/supabase-admin";

type BatchRow = {
  id: string;
  batch_code: string;
  review_type: "FULL_REVIEW" | "INCREMENTAL_REVIEW" | "EXCEPTION_REVIEW";
  package_schema_version: string;
  package_hash: string;
  created_at: string;
  status: "READY" | "EXPORTED" | "RESULT_RECEIVED" | "VALIDATED" | "PARTIALLY_ACCEPTED" | "REJECTED" | "PREPARING";
};

type BatchCaseRow = { case_id: string; package_payload: unknown };

async function loadBatch(batchId: string) {
  const batches = await supabaseRest<BatchRow[]>(`parliament.review_batches?select=id,batch_code,review_type,package_schema_version,package_hash,created_at,status&id=eq.${encodeURIComponent(batchId)}&limit=1`);
  const batch = batches[0];
  if (!batch) throw new Error("Review batch was not found.");
  const batchCases = await supabaseRest<BatchCaseRow[]>(`parliament.review_batch_cases?select=case_id,package_payload&review_batch_id=eq.${encodeURIComponent(batchId)}`);
  return { batch, batchCases };
}

export async function exportReviewBatch(batchId: string) {
  const { batch, batchCases } = await loadBatch(batchId);
  const packageForExport: ReviewBatchPackage = reviewBatchPackageSchema.parse({
    schema_version: batch.package_schema_version,
    batch_code: batch.batch_code,
    review_type: batch.review_type,
    created_at: batch.created_at,
    cases: batchCases.map((item) => item.package_payload),
    package_hash: batch.package_hash
  });
  const zip = await createReviewZip(packageForExport);

  await supabaseRest(`parliament.review_batches?id=eq.${encodeURIComponent(batchId)}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "EXPORTED", exported_at: new Date().toISOString() })
  });
  for (const item of batchCases) {
    await supabaseRest(`parliament.cases?id=eq.${encodeURIComponent(item.case_id)}`, {
      method: "PATCH",
      body: JSON.stringify({ review_status: "EXTERNAL_REVIEW_PENDING" })
    });
  }
  const notification = batch.status === "EXPORTED"
    ? { status: "SKIPPED" as const, reason: "Review batch was already exported." }
    : await notifyReviewPackageReady({
      batchCode: batch.batch_code,
      caseCount: batchCases.length,
      reviewType: batch.review_type,
      attachment: { bytes: zip.bytes, filename: zip.filename }
    });
  return { zip, batchCode: batch.batch_code, notification };
}
