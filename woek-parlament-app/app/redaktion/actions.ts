"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireEditorialSession } from "@/lib/editorial/auth";
import { getEditorialTask, recordEditorialDecision } from "@/lib/editorial/workbench";
import { createHistoricalReviewBatch, stageHistoricalReviewImport } from "@/lib/editorial/historical-review-pipeline";
import { supabaseRpc } from "@/lib/supabase-rest";

const uuid = z.string().uuid();

function sourceRefs(value: FormDataEntryValue | null) {
  const raw = typeof value === "string" ? value : "";
  if (!raw.trim()) return [];
  return raw.split(/[\s,]+/).filter(Boolean).map((id) => uuid.parse(id));
}

function selectedValue(formData: FormData) {
  const matrix = [...formData.entries()]
    .filter(([key, value]) => key.startsWith("resolution.") && typeof value === "string")
    .map(([key, value]) => ({ field: key.slice("resolution.".length), value }));
  if (matrix.length) return JSON.stringify(matrix);
  return z.string().trim().min(1).max(120).parse(formData.get("selectedValue"));
}

export async function resolveEditorialTask(formData: FormData) {
  const session = await requireEditorialSession();
  const taskId = uuid.parse(formData.get("taskId"));
  const task = await getEditorialTask(taskId);
  if (!task) throw new Error("EDITORIAL_TASK_NOT_FOUND");
  await recordEditorialDecision({
    taskId,
    selectedValue: selectedValue(formData),
    rationale: z.string().trim().max(1_000).parse(formData.get("rationale") ?? ""),
    sourceRefs: sourceRefs(formData.get("sourceRefs")),
    reviewerId: session.user.id,
    reviewerLabel: session.user.email ?? session.user.id,
    methodVersion: "parliament-method-v0.2"
  });
  revalidatePath("/redaktion");
  redirect(`/redaktion/aufgaben/${taskId}?saved=1`);
}

export async function createMethodGap(formData: FormData) {
  const session = await requireEditorialSession();
  const taskId = uuid.parse(formData.get("taskId"));
  const problem = z.string().trim().min(8).max(1_000).parse(formData.get("problem"));
  const desiredBehavior = z.string().trim().min(8).max(1_000).parse(formData.get("desiredBehavior"));
  await supabaseRpc("create_method_change_request_from_task", {
    p_task_id: taskId,
    p_problem: problem,
    p_desired_behavior: desiredBehavior,
    p_reviewer_id: session.user.id,
    p_priority: "NORMAL"
  });
  revalidatePath("/redaktion");
  redirect("/redaktion?methodGap=1");
}

export async function createHistoricalReviewBatchAction(formData: FormData) {
  const session = await requireEditorialSession();
  const requestedSize = z.coerce.number().int().min(1).max(15).parse(formData.get("requestedSize") ?? "10");
  const batch = await createHistoricalReviewBatch({ createdBy: session.user.id, requestedSize });
  revalidatePath("/redaktion/historischer-aufbau");
  redirect(`/redaktion/historischer-aufbau?batch=${encodeURIComponent(batch.id)}`);
}

export async function importHistoricalReviewResultAction(formData: FormData) {
  const session = await requireEditorialSession();
  const batchId = uuid.parse(formData.get("batchId"));
  const upload = formData.get("reviewResult");
  if (!(upload instanceof File) || upload.size === 0) throw new Error("HISTORICAL_REVIEW_RESULT_FILE_REQUIRED");
  if (upload.size > 2_000_000) throw new Error("HISTORICAL_REVIEW_RESULT_FILE_TOO_LARGE");
  if (upload.type && !["application/json", "text/json", "text/plain"].includes(upload.type)) throw new Error("HISTORICAL_REVIEW_RESULT_MUST_BE_JSON");
  let rawResult: unknown;
  try {
    rawResult = JSON.parse(await upload.text());
  } catch {
    throw new Error("HISTORICAL_REVIEW_RESULT_INVALID_JSON");
  }
  const result = await stageHistoricalReviewImport({ batchId, rawResult, importedBy: session.user.id });
  revalidatePath("/redaktion");
  revalidatePath("/redaktion/historischer-aufbau");
  redirect(`/redaktion/historischer-aufbau?reviewImport=${encodeURIComponent(result.status)}&tasks=${result.taskCount}`);
}
