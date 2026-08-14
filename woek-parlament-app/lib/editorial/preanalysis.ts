import "server-only";

import { createDeterministicPreAnalysis, type EditorialTaskDraft } from "@/lib/editorial/engine";
import { supabaseRest, supabaseRpc } from "@/lib/supabase-rest";

type CaseRecord = {
  id: string;
  title: string;
  next_confirmed_event_on: string | null;
};

type FactPackageRecord = {
  id: string;
  decision_object: string | null;
  official_objective: string | null;
  parliamentary_status: string | null;
  uncertainties: unknown[];
  source_document_ids: string[];
  fact_status: "DRAFT" | "SOURCE_REQUIRED" | "EDITORIALLY_CONFIRMED";
};

type ImpactAssessmentRecord = { id: string };
type ExistingTask = { id: string };

function daysUntil(date: string | null) {
  if (!date) return null;
  const target = new Date(`${date}T12:00:00Z`).getTime();
  const today = new Date();
  const now = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 12);
  return Math.ceil((target - now) / 86_400_000);
}

function taskPayload(task: EditorialTaskDraft, caseId: string, assessmentId: string | null) {
  return {
    parliamentary_case_id: caseId,
    impact_assessment_id: assessmentId,
    task_type: task.taskType,
    router_status: task.routerStatus,
    question: task.question,
    reason_manual: task.reasonManual,
    priority: task.priority,
    blocking: task.blocking,
    context_refs: task.contextRefs,
    candidate_options: task.candidateOptions,
    impact_preview: task.impactPreview,
    ai_eligible: task.aiEligible,
    dependency_ids: task.dependencyIds
  };
}

async function hasOpenTask(caseId: string, taskType: string) {
  const tasks = await supabaseRest<ExistingTask[]>(
    `editorial_tasks?parliamentary_case_id=eq.${encodeURIComponent(caseId)}&task_type=eq.${taskType}&status=in.(OPEN,IN_PROGRESS,WAITING_EVIDENCE,AI_REQUESTED)&select=id&limit=1`
  );
  return tasks.length > 0;
}

/**
 * Create exactly the next deterministic editorial work package for one case.
 * Import data never becomes a report here.  In particular, an unresolved
 * official source creates an evidence task and stops the analysis.
 */
export async function runDeterministicPreAnalysis(caseId: string) {
  const cases = await supabaseRest<CaseRecord[]>(
    `parliamentary_cases?id=eq.${encodeURIComponent(caseId)}&select=id,title,next_confirmed_event_on&limit=1`
  );
  const caseRecord = cases[0];
  if (!caseRecord) throw new Error("PARLIAMENTARY_CASE_NOT_FOUND");

  const factPackages = await supabaseRest<FactPackageRecord[]>(
    `decision_fact_packages?parliamentary_case_id=eq.${encodeURIComponent(caseId)}&select=id,decision_object,official_objective,parliamentary_status,uncertainties,source_document_ids,fact_status&order=package_version.desc&limit=1`
  );
  const factPackage = factPackages[0];
  const draft = createDeterministicPreAnalysis({
    caseId,
    caseTitle: caseRecord.title,
    factStatus: factPackage?.fact_status ?? "SOURCE_REQUIRED",
    decisionObject: factPackage?.decision_object,
    officialObjective: factPackage?.official_objective,
    parliamentaryStatus: factPackage?.parliamentary_status,
    uncertainties: factPackage?.uncertainties ?? ["Amtliche Originalfassung und Faktpaket fehlen."],
    sourceDocumentIds: factPackage?.source_document_ids ?? [],
    dueInDays: daysUntil(caseRecord.next_confirmed_event_on),
    approvedPattern: null
  });

  let assessmentId: string | null = null;
  if (factPackage?.fact_status === "EDITORIALLY_CONFIRMED") {
    await supabaseRest(
      `impact_assessments?parliamentary_case_id=eq.${encodeURIComponent(caseId)}&assessment_status=in.(DRAFT,RECOMPUTED,EDITORIALLY_REVIEWED)`,
      { method: "PATCH", body: { assessment_status: "SUPERSEDED", superseded_at: new Date().toISOString() }, prefer: "return=minimal" }
    );
    const assessments = await supabaseRest<ImpactAssessmentRecord[]>("impact_assessments", {
      method: "POST",
      body: [{
        parliamentary_case_id: caseId,
        decision_fact_package_id: factPackage.id,
        method_version: "parliament-method-v0.2",
        ruleset_version: "bundestag-v3-router-v0.1",
        assessment_status: "RECOMPUTED",
        provenance: draft.resolver === "PRECEDENT" ? "PRECEDENT" : "RULE",
        summary: { resolver: draft.resolver, explanation: draft.explanation }
      }],
      prefer: "return=representation"
    });
    assessmentId = assessments[0]?.id ?? null;
    if (!assessmentId) throw new Error("IMPACT_ASSESSMENT_CREATE_FAILED");
    await supabaseRest("impact_domain_assessments", {
      method: "POST",
      body: draft.domainStatus.map((item) => ({
        impact_assessment_id: assessmentId,
        domain_key: item.field,
        status: item.status,
        rationale: "Deterministische Voranalyse: bis zur redaktionellen Prüfung evidenzoffen.",
        resolved_by: draft.resolver === "PRECEDENT" ? "PRECEDENT_RESOLVED" : "HUMAN_REQUIRED"
      })),
      prefer: "return=minimal"
    });
  }

  const created: string[] = [];
  for (const task of draft.tasks) {
    if (await hasOpenTask(caseId, task.taskType)) continue;
    const rows = await supabaseRest<Array<{ id: string }>>("editorial_tasks", {
      method: "POST",
      body: [taskPayload(task, caseId, assessmentId)],
      prefer: "return=representation"
    });
    if (rows[0]?.id) created.push(rows[0].id);
  }

  await supabaseRpc("recompute_case_analysis_state", {
    p_case_id: caseId,
    p_trigger_kind: "IMPORT",
    p_trigger_ref: factPackage?.id ?? "NO_FACT_PACKAGE"
  });

  return { caseId, resolver: draft.resolver, createdTaskIds: created, assessmentId, explanation: draft.explanation };
}
