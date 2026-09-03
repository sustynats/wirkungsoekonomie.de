import { supabaseRest } from "@/lib/database/supabase-admin";

type JsonRecord = Record<string, unknown>;

type ReviewResultRow = {
  id: string;
  case_id: string;
  result_payload: unknown;
  imported_at: string;
};

type CaseRow = {
  id: string;
  title: string;
  decision_date: string | null;
  current_stage: string | null;
};

type ExistingTask = { case_id: string };

type FollowUp = {
  taskType: string;
  question: string;
  reasonManual: string;
  priority: "BLOCKING" | "HIGH" | "NORMAL";
  blocking: boolean;
  candidateOptions: string[];
};

function object(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function records(value: unknown) {
  return Array.isArray(value) ? value.map(object) : [];
}

export function reviewReadiness(payload: unknown) {
  const result = object(payload);
  return text(object(result.retrospective).publication_readiness, "EVIDENCE_REQUIRED");
}

export function followUpForReview(payload: unknown): FollowUp {
  switch (reviewReadiness(payload)) {
    case "METHOD_REVIEW_REQUIRED":
      return {
        taskType: "METHOD_REVIEW_REQUIRED",
        question: "Welcher Vergleichsmaßstab und welche Schutzgrenzen sind für diese Wirkungsakte fachlich verbindlich?",
        reasonManual: "Die vorhandene Evidenz reicht ohne geklärte Methoden- und Gegenfaktumlogik nicht für eine belastbare Einordnung.",
        priority: "BLOCKING",
        blocking: true,
        candidateOptions: ["Methodenregel präzisieren", "Schutzgrenze festlegen", "Alternativenvergleich definieren", "Als Methodenlücke eskalieren"]
      };
    case "CALCULATION_REQUIRED":
      return {
        taskType: "CALCULATION_INPUT_REVIEW",
        question: "Sind die belegten Eingaben, Einheiten und der Gegenfaktumansatz vollständig genug für eine reproduzierbare Berechnung?",
        reasonManual: "Eine Berechnung darf erst nach Quellen-, Einheiten- und Annahmenprüfung ausgeführt werden.",
        priority: "HIGH",
        blocking: true,
        candidateOptions: ["Eingaben freigeben", "Quelle ergänzen", "Intervall definieren", "Nicht quantifizierbar ausweisen"]
      };
    case "NOT_YET_ASSESSABLE":
      return {
        taskType: "CORRECTION_TRIGGER_REVIEW",
        question: "Welche Indikatoren, Quellen und Zeitpunkte lösen die erste sinnvolle Rückschau aus?",
        reasonManual: "Die Entscheidung ist noch zu jung für eine belastbare Wirkungsrückschau; benötigt wird ein konkreter Monitoring- und Korrekturplan.",
        priority: "NORMAL",
        blocking: false,
        candidateOptions: ["Monitoringplan bestätigen", "Indikator ergänzen", "frühesten Reviewzeitpunkt festlegen", "Datenlücke dokumentieren"]
      };
    case "READY_FOR_EDITORIAL_APPROVAL":
      return {
        taskType: "PUBLICATION_APPROVAL",
        question: "Ist die Wirkungsakte mit ihrem ausgewiesenen Reifegrad öffentlich freigabefähig?",
        reasonManual: "Die fachliche Vorarbeit ist abgeschlossen, die Veröffentlichung benötigt eine redaktionelle Freigabe.",
        priority: "HIGH",
        blocking: true,
        candidateOptions: ["Freigeben", "Überarbeitung anfordern", "weitere Evidenz verlangen"]
      };
    default:
      return {
        taskType: "EVIDENCE_GRADE_REVIEW",
        question: "Welche entscheidungstragenden Quellen, Baselines und Gegenfaktumdaten fehlen noch für diese Wirkungsakte?",
        reasonManual: "Vor einer belastbaren Einordnung müssen die vorhandenen Quellen geprüft und die materiellen Evidenzlücken geschlossen werden.",
        priority: "HIGH",
        blocking: true,
        candidateOptions: ["Quelle verifizieren", "Baseline ergänzen", "Gegenfaktum präzisieren", "Datenlücke bestätigen"]
      };
  }
}

function contextReferences(payload: unknown) {
  const result = object(payload);
  const provenance = object(result.provenance);
  const sourceRefs = Array.isArray(provenance.source_refs_used)
    ? provenance.source_refs_used.filter((value): value is string => typeof value === "string" && value.trim().length > 0).slice(0, 12)
    : [];
  const gapRefs = records(result.data_gaps).map((item) => text(item.gap_id)).filter(Boolean).slice(0, 12);
  return [...new Set([...sourceRefs, ...gapRefs])];
}

/**
 * Materialises one bundled editorial task per imported review. This is
 * intentionally not a task-per-data-gap generator: the reviewer sees the
 * full context and can resolve or split follow-up work deliberately.
 */
export async function materializeReviewFollowUpTasks() {
  const reviewRows = await supabaseRest<ReviewResultRow[]>(
    "parliament.external_review_results?import_status=eq.REVIEW_PROPOSAL&select=id,case_id,result_payload,imported_at&order=imported_at.desc&limit=250"
  );
  const latestByCase = new Map<string, ReviewResultRow>();
  for (const row of reviewRows) if (!latestByCase.has(row.case_id)) latestByCase.set(row.case_id, row);
  const caseIds = [...latestByCase.keys()];
  if (caseIds.length === 0) return { created: 0, existing: 0, byReadiness: {} };
  const caseFilter = caseIds.map(encodeURIComponent).join(",");
  const cases = await supabaseRest<CaseRow[]>(
    `parliament.cases?id=in.(${caseFilter})&select=id,title,decision_date,current_stage&limit=250`
  );
  const existingTasks = await supabaseRest<ExistingTask[]>(
    `parliament.editorial_tasks?case_id=in.(${caseFilter})&status=in.(OPEN,IN_PROGRESS,WAITING_EVIDENCE)&select=case_id&limit=250`
  );
  const alreadyOpen = new Set(existingTasks.map((task) => task.case_id));
  let created = 0;
  let existing = 0;
  const byReadiness: Record<string, number> = {};
  for (const caseRow of cases) {
    const review = latestByCase.get(caseRow.id);
    if (!review) continue;
    const readiness = reviewReadiness(review.result_payload);
    byReadiness[readiness] = (byReadiness[readiness] ?? 0) + 1;
    if (alreadyOpen.has(caseRow.id)) {
      existing += 1;
      continue;
    }
    const followUp = followUpForReview(review.result_payload);
    await supabaseRest("parliament.editorial_tasks", {
      method: "POST",
      body: JSON.stringify({
        case_id: caseRow.id,
        task_type: followUp.taskType,
        question: followUp.question,
        reason_manual: followUp.reasonManual,
        priority: followUp.priority,
        blocking: followUp.blocking,
        context_refs: contextReferences(review.result_payload),
        candidate_options: followUp.candidateOptions,
        dependency_ids: [review.id],
        status: "OPEN"
      })
    });
    await supabaseRest(`parliament.cases?id=eq.${encodeURIComponent(caseRow.id)}`, {
      method: "PATCH",
      body: JSON.stringify({ review_status: "TASKS_OPEN" })
    });
    created += 1;
  }
  return { created, existing, byReadiness };
}
