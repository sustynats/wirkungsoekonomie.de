"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireEditorialSession } from "@/lib/editorial/auth";
import { getEditorialTask, recordEditorialDecision } from "@/lib/editorial/workbench";
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
