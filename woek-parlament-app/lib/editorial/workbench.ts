import "server-only";

import { z } from "zod";
import { supabaseRest, supabaseRpc } from "@/lib/supabase-rest";

const activeTaskStatuses = "in.(OPEN,IN_PROGRESS,WAITING_EVIDENCE,AI_REQUESTED)";

export const editorialDecisionInput = z.object({
  taskId: z.string().uuid(),
  selectedValue: z.string().trim().min(1).max(120),
  rationale: z.string().trim().max(1_000).optional().default(""),
  sourceRefs: z.array(z.string().uuid()).max(12).default([]),
  reviewerId: z.string().uuid().nullable().default(null),
  reviewerLabel: z.string().trim().min(1).max(120),
  methodVersion: z.string().trim().min(1).max(120)
});

export type EditorialDecisionInput = z.infer<typeof editorialDecisionInput>;

export type EditorialTaskSummary = {
  id: string;
  parliamentary_case_id: string;
  task_type: string;
  router_status: string;
  question: string;
  reason_manual: string;
  priority: "BLOCKING" | "HIGH" | "NORMAL" | "OPTIONAL";
  blocking: boolean;
  status: string;
  due_by: string | null;
  created_at: string;
  parliamentary_cases: { title: string; next_confirmed_event_on: string | null } | null;
};

export type EditorialTaskDetail = EditorialTaskSummary & {
  decision_unit_id: string | null;
  impact_assessment_id: string | null;
  context_refs: Record<string, unknown>;
  candidate_options: unknown[];
  impact_preview: Record<string, unknown>;
  ai_eligible: boolean;
  estimated_ai_tokens: number | null;
  dependency_ids: string[];
};

export async function listEditorialTasks(limit = 40): Promise<EditorialTaskSummary[]> {
  const cappedLimit = Math.min(Math.max(limit, 1), 100);
  return supabaseRest<EditorialTaskSummary[]>(
    `editorial_tasks?status=${activeTaskStatuses}&select=id,parliamentary_case_id,task_type,router_status,question,reason_manual,priority,blocking,status,due_by,created_at,parliamentary_cases(title,next_confirmed_event_on)&order=blocking.desc,priority.asc,due_by.asc.nullslast,created_at.asc&limit=${cappedLimit}`
  );
}

export async function getEditorialTask(taskId: string): Promise<EditorialTaskDetail | null> {
  const rows = await supabaseRest<EditorialTaskDetail[]>(
    `editorial_tasks?id=eq.${encodeURIComponent(taskId)}&select=id,parliamentary_case_id,decision_unit_id,impact_assessment_id,task_type,router_status,question,reason_manual,priority,blocking,status,due_by,created_at,context_refs,candidate_options,impact_preview,ai_eligible,estimated_ai_tokens,dependency_ids,parliamentary_cases(title,next_confirmed_event_on)&limit=1`
  );
  return rows[0] ?? null;
}

export async function recordEditorialDecision(input: EditorialDecisionInput) {
  const parsed = editorialDecisionInput.parse(input);
  const result = await supabaseRpc<Array<{ id: string; parliamentary_case_id: string }>>("record_editorial_decision", {
    p_task_id: parsed.taskId,
    p_selected_value: parsed.selectedValue,
    p_rationale: parsed.rationale,
    p_source_refs: parsed.sourceRefs,
    p_reviewer_id: parsed.reviewerId,
    p_reviewer_label: parsed.reviewerLabel,
    p_method_version: parsed.methodVersion
  });
  const decision = result[0];
  if (!decision) throw new Error("EDITORIAL_DECISION_CREATE_FAILED");
  return decision;
}

export async function editorialDashboardCounts() {
  const [tasks, methodRequests, states] = await Promise.all([
    supabaseRest<Array<{ priority: string; blocking: boolean }>>(
      `editorial_tasks?status=${activeTaskStatuses}&select=priority,blocking`
    ),
    supabaseRest<Array<{ status: string }>>("method_change_requests?status=in.(NEW,REVIEWED,READY_FOR_CODEX)&select=status"),
    supabaseRest<Array<{ readiness: string }>>("case_analysis_states?select=readiness")
  ]);
  return {
    openTasks: tasks.length,
    blockingTasks: tasks.filter((task) => task.blocking).length,
    highPriorityTasks: tasks.filter((task) => task.priority === "HIGH").length,
    openMethodGaps: methodRequests.length,
    readyForApproval: states.filter((state) => state.readiness === "READY_FOR_APPROVAL").length
  };
}
