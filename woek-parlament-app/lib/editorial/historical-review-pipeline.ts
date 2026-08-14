import "server-only";

import { createHash, randomUUID } from "node:crypto";
import {
  buildHistoricalReviewPackage,
  decisionRegistryMarkdown,
  HISTORICAL_REVIEW_METHOD_VERSION,
  listHistoricalRegistryEntries,
  WOEK_REFERENCE_SNAPSHOT,
  type HistoricalReviewPackage
} from "@/lib/editorial/historical-review-package";
import {
  validateHistoricalReviewAgainstPackage,
  type HistoricalReviewResult
} from "@/lib/editorial/external-review-contract";
import { supabaseRest, supabaseRpc } from "@/lib/supabase-rest";

type ActiveTerm = {
  id: string;
  label: string;
  historical_woek_backfill_start: string;
};

type RegistryCandidate = {
  id: string;
  parliamentary_case_id: string;
  decision_date: string;
  materiality_assessment: string;
  selection_status: string;
  review_package_status: string;
  review_import_status: string | null;
};

type BatchRow = {
  id: string;
  batch_key: string;
  government_term_id: string;
  status: string;
  batch_size: number;
  export_count: number;
  last_exported_at: string | null;
  created_at: string;
  woek_reference_snapshot: string;
  method_version: string;
};

type BatchCaseRow = {
  id: string;
  batch_id: string;
  historical_decision_registry_id: string;
  position: number;
  review_package_status: string;
  package_manifest: {
    case_id?: string;
    registry_id?: string;
    decision_date?: string;
    reference_snapshot?: string;
    source_ids?: string[];
    package_status?: string;
  };
  package_hash: string | null;
};

type RegistryImportBoundary = {
  id: string;
  parliamentary_case_id: string;
  decision_date: string;
  review_package_status: string;
};

export type HistoricalReviewBatchSummary = BatchRow & {
  case_count: number;
  cases_ready: number;
  cases_imported: number;
};

function nowKey() {
  return new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
}

function jsonLine(value: unknown) {
  return JSON.stringify(value);
}

function resultHash(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

async function activeGovernmentTerm(): Promise<ActiveTerm> {
  const terms = await supabaseRest<ActiveTerm[]>(
    "government_terms?jurisdiction=eq.DE&government_term_end=is.null&select=id,label,historical_woek_backfill_start&order=government_term_start.desc&limit=1"
  );
  const term = terms[0];
  if (!term) throw new Error("HISTORICAL_GOVERNMENT_TERM_NOT_CONFIGURED");
  return term;
}

async function updatePackageState(pkg: HistoricalReviewPackage) {
  const timestamp = new Date().toISOString();
  await supabaseRest(`historical_decision_registry?id=eq.${encodeURIComponent(pkg.registryId)}`, {
    method: "PATCH",
    body: { review_package_status: pkg.status, review_package_checked_at: timestamp },
    prefer: "return=minimal"
  });
}

/**
 * Creates a small review batch from cases with the same public materiality
 * screen. No party, proposer or vote metadata is queried or used for the
 * selection. Cases whose primary decision package is incomplete stay visible
 * as SOURCE_INCOMPLETE and are not exported for substantive review.
 */
export async function createHistoricalReviewBatch(input: { createdBy: string; requestedSize?: number }) {
  const term = await activeGovernmentTerm();
  const requestedSize = Math.min(Math.max(input.requestedSize ?? 10, 1), 15);
  const candidates = await supabaseRest<RegistryCandidate[]>(
    `historical_decision_registry?government_term_id=eq.${encodeURIComponent(term.id)}&materiality_assessment=in.(POTENTIAL_MATERIAL,MATERIAL)&selection_status=in.(PENDING_SCREEN,FULL_IMPACT_REVIEW,DATA_GAP,NOT_YET_ASSESSABLE)&review_import_status=is.null&select=id,parliamentary_case_id,decision_date,materiality_assessment,selection_status,review_package_status,review_import_status&order=materiality_assessment.desc,decision_date.asc&limit=30`
  );
  const prepared: HistoricalReviewPackage[] = [];
  for (const candidate of candidates) {
    if (prepared.length >= requestedSize) break;
    const pkg = await buildHistoricalReviewPackage(candidate.id);
    await updatePackageState(pkg);
    if (pkg.status === "READY") prepared.push(pkg);
  }
  if (!prepared.length) {
    throw new Error("NO_HISTORICAL_REVIEW_PACKAGE_READY");
  }
  const batchKey = `woek-historical-review-${nowKey()}-${randomUUID().slice(0, 8)}`;
  const batches = await supabaseRest<BatchRow[]>("historical_review_batches", {
    method: "POST",
    body: [{
      batch_key: batchKey,
      government_term_id: term.id,
      status: "READY_FOR_EXPORT",
      selection_criteria: {
        historical_woek_backfill_start: term.historical_woek_backfill_start,
        materiality: ["POTENTIAL_MATERIAL", "MATERIAL"],
        party_independent: true,
        requires_primary_decision_package: true,
        requested_size: requestedSize
      },
      woek_reference_snapshot: WOEK_REFERENCE_SNAPSHOT,
      method_version: HISTORICAL_REVIEW_METHOD_VERSION,
      batch_size: prepared.length,
      created_by: input.createdBy
    }],
    prefer: "return=representation"
  });
  const batch = batches[0];
  if (!batch) throw new Error("HISTORICAL_REVIEW_BATCH_CREATE_FAILED");
  await supabaseRest("historical_review_batch_cases", {
    method: "POST",
    body: prepared.map((pkg, index) => ({
      batch_id: batch.id,
      historical_decision_registry_id: pkg.registryId,
      position: index + 1,
      review_package_status: "READY",
      package_manifest: pkg.manifest,
      package_hash: pkg.packageHash
    })),
    prefer: "return=minimal"
  });
  return batch;
}

export async function listHistoricalReviewBatches(limit = 16): Promise<HistoricalReviewBatchSummary[]> {
  const batches = await supabaseRest<BatchRow[]>(
    `historical_review_batches?select=id,batch_key,government_term_id,status,batch_size,export_count,last_exported_at,created_at,woek_reference_snapshot,method_version&order=created_at.desc&limit=${Math.min(Math.max(limit, 1), 50)}`
  );
  if (!batches.length) return [];
  const batchIds = batches.map((batch) => batch.id).join(",");
  const batchCases = await supabaseRest<Array<Pick<BatchCaseRow, "batch_id" | "review_package_status">>>(
    `historical_review_batch_cases?batch_id=in.(${encodeURIComponent(batchIds)})&select=batch_id,review_package_status&limit=500`
  );
  return batches.map((batch) => {
    const cases = batchCases.filter((entry) => entry.batch_id === batch.id);
    return {
      ...batch,
      case_count: cases.length,
      cases_ready: cases.filter((entry) => entry.review_package_status === "READY" || entry.review_package_status === "EXPORTED").length,
      cases_imported: cases.filter((entry) => entry.review_package_status === "PROPOSAL_STAGED" || entry.review_package_status === "TASKS_GENERATED").length
    };
  });
}

async function loadBatch(batchId: string) {
  const batches = await supabaseRest<BatchRow[]>(
    `historical_review_batches?id=eq.${encodeURIComponent(batchId)}&select=id,batch_key,government_term_id,status,batch_size,export_count,last_exported_at,created_at,woek_reference_snapshot,method_version&limit=1`
  );
  const batch = batches[0];
  if (!batch) throw new Error("HISTORICAL_REVIEW_BATCH_NOT_FOUND");
  const cases = await supabaseRest<BatchCaseRow[]>(
    `historical_review_batch_cases?batch_id=eq.${encodeURIComponent(batch.id)}&select=id,batch_id,historical_decision_registry_id,position,review_package_status,package_manifest,package_hash&order=position.asc&limit=20`
  );
  return { batch, cases };
}

export async function createHistoricalReviewZipPayload(batchId: string) {
  const { batch, cases } = await loadBatch(batchId);
  if (!cases.length) throw new Error("HISTORICAL_REVIEW_BATCH_EMPTY");
  if (batch.status === "SUPERSEDED") throw new Error("HISTORICAL_REVIEW_BATCH_SUPERSEDED");
  const packages = await Promise.all(cases.map((entry) => buildHistoricalReviewPackage(entry.historical_decision_registry_id)));
  for (const pkg of packages) {
    const batchCase = cases.find((entry) => entry.historical_decision_registry_id === pkg.registryId);
    if (!batchCase || pkg.status !== "READY") throw new Error("HISTORICAL_REVIEW_PACKAGE_NO_LONGER_READY");
    if (batchCase.package_hash !== pkg.packageHash) throw new Error("HISTORICAL_REVIEW_PACKAGE_CHANGED_RECREATE_BATCH");
    if (batchCase.package_manifest.reference_snapshot !== WOEK_REFERENCE_SNAPSHOT) throw new Error("HISTORICAL_REVIEW_PACKAGE_REFERENCE_SNAPSHOT_CHANGED");
  }
  const entries = await listHistoricalRegistryEntries(batch.government_term_id);
  const selectedIds = new Set(packages.map((pkg) => pkg.caseId));
  const selectedEntries = entries.filter((entry) => selectedIds.has(entry.case_id));
  const files: Record<string, string> = {
    "ALL_DECISIONS.md": decisionRegistryMarkdown(entries),
    "decision-registry.jsonl": entries.map(jsonLine).join("\n") + "\n",
    "BATCH.md": `# ${batch.batch_key}\n\n- Fälle: ${packages.length}\n- Referenzsnapshot: ${batch.woek_reference_snapshot}\n- Methodenversion: ${batch.method_version}\n- Stichtag der Wirkungsbilanz: 2025-05-06\n\nDieses ZIP enthält nur die ausgewählten Detailpakete. Das vollständige Register steht in \`ALL_DECISIONS.md\`. Jede fachliche Aussage ist als Vorschlag zu behandeln; fehlende Werte bleiben DATA_GAP.\n`,
    "cases.json": `${JSON.stringify(selectedEntries, null, 2)}\n`,
    "batch-manifest.json": `${JSON.stringify({
      batch_id: batch.id,
      batch_key: batch.batch_key,
      reference_snapshot: batch.woek_reference_snapshot,
      method_version: batch.method_version,
      cases: packages.map((pkg) => ({ case_id: pkg.caseId, registry_id: pkg.registryId, package_hash: pkg.packageHash, source_ids: pkg.manifest.source_ids }))
    }, null, 2)}\n`
  };
  for (const pkg of packages) Object.assign(files, pkg.files);
  return { fileName: `${batch.batch_key}.zip`, files, batch, packages };
}

export async function markHistoricalReviewBatchExported(batchId: string) {
  const { batch, cases } = await loadBatch(batchId);
  const timestamp = new Date().toISOString();
  await Promise.all([
    supabaseRest(`historical_review_batches?id=eq.${encodeURIComponent(batch.id)}`, {
      method: "PATCH",
      body: { status: "EXPORTED", export_count: batch.export_count + 1, last_exported_at: timestamp },
      prefer: "return=minimal"
    }),
    ...cases.map((entry) => supabaseRest(`historical_review_batch_cases?id=eq.${encodeURIComponent(entry.id)}`, {
      method: "PATCH",
      body: { review_package_status: "EXPORTED" },
      prefer: "return=minimal"
    })),
    ...cases.map((entry) => supabaseRest(`historical_decision_registry?id=eq.${encodeURIComponent(entry.historical_decision_registry_id)}`, {
      method: "PATCH",
      body: { review_package_status: "EXPORTED" },
      prefer: "return=minimal"
    }))
  ]);
}

function importStatusForErrors(errors: string[]) {
  if (errors.some((error) => error === "CASE_ID_MISMATCH")) return "CASE_MISMATCH";
  if (errors.some((error) => error === "REFERENCE_SNAPSHOT_MISMATCH")) return "SNAPSHOT_MISMATCH";
  if (errors.some((error) => error.startsWith("UNKNOWN_SOURCE_REFERENCE"))) return "SOURCE_REFERENCE_INVALID";
  return "SCHEMA_INVALID";
}

function taskRows(input: { caseId: string; decisionUnitId: string | null; reviewImportId: string; result: HistoricalReviewResult }) {
  const baseContext = {
    review_import_id: input.reviewImportId,
    review_proposal: input.result,
    source_refs: input.result.provenance.source_refs_used,
    provenance: "CHATGPT_REVIEW_PROPOSAL",
    note: "Dieser Inhalt ist kein Fachvotum. Eine Entscheidung, Berechnung oder Veröffentlichung entsteht erst aus Quellenprüfung, Regeln und redaktioneller Freigabe."
  };
  const tasks: Array<Record<string, unknown>> = [];
  const evidenceItems = [...input.result.data_gaps, ...input.result.source_conflicts];
  if (evidenceItems.length || input.result.review_status === "SOURCE_INCOMPLETE" || input.result.review_status === "DATA_GAP") {
    tasks.push({
      parliamentary_case_id: input.caseId,
      decision_unit_id: input.decisionUnitId,
      task_type: "EVIDENCE_GRADE_REVIEW",
      router_status: "EVIDENCE_REQUIRED",
      question: "Welche Quellen- und Evidenzlücken müssen vor einer historischen WÖk-Einordnung geschlossen oder transparent ausgewiesen werden?",
      reason_manual: "Der externe strukturierte Review hat offene Quellen- oder Datenlücken gemeldet. Das System ersetzt sie nicht durch Annahmen.",
      priority: "HIGH",
      blocking: true,
      context_refs: { ...baseContext, data_gaps: input.result.data_gaps, source_conflicts: input.result.source_conflicts },
      candidate_options: ["Quelle ergänzen", "DATA_GAP bestätigen", "Evidenzkonflikt dokumentieren"],
      impact_preview: { affects: ["Evidenzstatus", "historische Einordnung"] },
      ai_eligible: false,
      dependency_ids: []
    });
  }
  if (input.result.calculation_requirements.length) {
    tasks.push({
      parliamentary_case_id: input.caseId,
      decision_unit_id: input.decisionUnitId,
      task_type: "CALCULATION_INPUT_REVIEW",
      router_status: "EVIDENCE_REQUIRED",
      question: "Welche belegten Eingabewerte, Gegenfaktualszenarien und Attributionsgrundlagen fehlen für die deterministische Berechnung?",
      reason_manual: "Der Review benennt Berechnungsanforderungen; er liefert keine produktiven Rechenwerte.",
      priority: "HIGH",
      blocking: true,
      context_refs: { ...baseContext, calculation_requirements: input.result.calculation_requirements },
      candidate_options: ["Quellenwert ergänzen", "Intervall mit Quelle", "ohne Attribution ausweisen", "nicht belastbar quantifizierbar"],
      impact_preview: { affects: ["Calculation Records", "Transparenzbox", "Empfehlungsgate"] },
      ai_eligible: false,
      dependency_ids: []
    });
  }
  const counterfactuals = [...input.result.ex_ante.counterfactuals, ...input.result.counterfactuals];
  if (counterfactuals.length) {
    tasks.push({
      parliamentary_case_id: input.caseId,
      decision_unit_id: input.decisionUnitId,
      task_type: "COUNTERFACTUAL_REVIEW",
      router_status: "HUMAN_REQUIRED",
      question: "Ist das Gegenfaktum für die historische Ex-ante-/Ex-post-Einordnung ausreichend bestimmt?",
      reason_manual: "Eine nicht gewählte Alternative ist nicht unmittelbar beobachtbar und darf nicht wie ein Fakt behandelt werden.",
      priority: "HIGH",
      blocking: true,
      context_refs: { ...baseContext, counterfactuals },
      candidate_options: ["Status quo", "Trendfortschreibung", "Kontroll-/Vergleichsgruppe", "extern evaluiert", "nicht auflösbar"],
      impact_preview: { affects: ["Kausalität", "historische Einordnung"] },
      ai_eligible: false,
      dependency_ids: []
    });
  }
  const boundaries = [...input.result.non_compensable_boundaries, ...input.result.risks_and_boundaries];
  if (boundaries.length || input.result.normative_mapping.woek_ids.length || input.result.normative_mapping.sdgs.length || input.result.normative_mapping.sdg_plus.length) {
    tasks.push({
      parliamentary_case_id: input.caseId,
      decision_unit_id: input.decisionUnitId,
      task_type: "NORMATIVE_MAPPING_REVIEW",
      router_status: "HUMAN_REQUIRED",
      question: "Welche WÖk-/SDG-/SDG+-Zuordnungen und Wirkungsgrenzen sind fachlich tragfähig?",
      reason_manual: "Normative Zuordnung, Nichtkompensation und finale historische Einordnung bleiben menschlich verantwortet.",
      priority: "NORMAL",
      blocking: true,
      context_refs: { ...baseContext, normative_mapping: input.result.normative_mapping, boundaries },
      candidate_options: ["Zuordnung bestätigen", "Zuordnung ändern", "Evidenz offen", "Methodenlücke markieren"],
      impact_preview: { affects: ["Mensch–Planet–Demokratie", "Nichtkompensations-Gate"] },
      ai_eligible: false,
      dependency_ids: []
    });
  }
  return tasks;
}

/**
 * Stores a verified external review as a proposal and creates at most four
 * focused, batched editorial tasks. It never writes calculation operands,
 * impact claims, historical decisions or public workflow statuses.
 */
export async function stageHistoricalReviewImport(input: {
  batchId: string;
  rawResult: unknown;
  importedBy: string;
}) {
  const parsedCaseId = typeof input.rawResult === "object" && input.rawResult !== null && typeof (input.rawResult as { case_id?: unknown }).case_id === "string"
    ? (input.rawResult as { case_id: string }).case_id
    : null;
  if (!parsedCaseId) throw new Error("HISTORICAL_REVIEW_RESULT_CASE_ID_MISSING");
  const { batch, cases } = await loadBatch(input.batchId);
  const batchCase = cases.find((entry) => entry.package_manifest.case_id === parsedCaseId);
  if (!batchCase) throw new Error("HISTORICAL_REVIEW_RESULT_NOT_IN_BATCH");
  const registryRows = await supabaseRest<RegistryImportBoundary[]>(
    `historical_decision_registry?id=eq.${encodeURIComponent(batchCase.historical_decision_registry_id)}&select=id,parliamentary_case_id,decision_date,review_package_status&limit=1`
  );
  const registry = registryRows[0];
  if (!registry) throw new Error("HISTORICAL_REVIEW_REGISTRY_NOT_FOUND");
  const boundary = {
    caseId: registry.parliamentary_case_id,
    decisionDate: registry.decision_date,
    referenceSnapshot: batchCase.package_manifest.reference_snapshot ?? batch.woek_reference_snapshot,
    packageHash: batchCase.package_hash ?? "",
    sourceIds: batchCase.package_manifest.source_ids ?? []
  };
  let validation;
  try {
    validation = validateHistoricalReviewAgainstPackage(input.rawResult, boundary);
  } catch (error) {
    const message = error instanceof Error ? error.message : "SCHEMA_VALIDATION_FAILED";
    const safeInvalidResult = input.rawResult && typeof input.rawResult === "object" && !Array.isArray(input.rawResult)
      ? input.rawResult
      : { invalid_payload_type: Array.isArray(input.rawResult) ? "array" : typeof input.rawResult };
    await supabaseRest("historical_review_imports", {
      method: "POST",
      body: [{
        batch_id: batch.id,
        historical_decision_registry_id: registry.id,
        parliamentary_case_id: registry.parliamentary_case_id,
        status: "SCHEMA_INVALID",
        proposal_status: "CHATGPT_REVIEW_PROPOSAL",
        review_system: "EXTERNAL_STRUCTURED_REVIEW",
        reference_snapshot: null,
        package_hash: batchCase.package_hash,
        proposed_result: safeInvalidResult,
        validation_messages: ["SCHEMA_INVALID", message],
        imported_by: input.importedBy,
        result_hash: resultHash(input.rawResult)
      }],
      prefer: "return=minimal"
    });
    throw new Error("HISTORICAL_REVIEW_SCHEMA_INVALID");
  }
  const existing = await supabaseRest<Array<{ id: string }>>(
    `historical_review_imports?parliamentary_case_id=eq.${encodeURIComponent(registry.parliamentary_case_id)}&result_hash=eq.${encodeURIComponent(resultHash(validation.result))}&status=in.(VALIDATED,APPLIED_TO_TASKS)&select=id&limit=1`
  );
  if (existing[0]) throw new Error("HISTORICAL_REVIEW_RESULT_ALREADY_IMPORTED");
  const status = validation.valid ? "VALIDATED" : importStatusForErrors(validation.errors);
  const imports = await supabaseRest<Array<{ id: string }>>("historical_review_imports", {
    method: "POST",
    body: [{
      batch_id: batch.id,
      historical_decision_registry_id: registry.id,
      parliamentary_case_id: registry.parliamentary_case_id,
      status,
      proposal_status: "CHATGPT_REVIEW_PROPOSAL",
      review_system: validation.result.provenance.review_system,
      reference_snapshot: validation.result.provenance.woek_reference_snapshot,
      package_hash: batchCase.package_hash,
      proposed_result: validation.result,
      validation_messages: [...validation.errors, ...validation.warnings],
      imported_by: input.importedBy,
      validated_at: validation.valid ? new Date().toISOString() : null,
      result_hash: resultHash(validation.result)
    }],
    prefer: "return=representation"
  });
  const reviewImport = imports[0];
  if (!reviewImport) throw new Error("HISTORICAL_REVIEW_IMPORT_CREATE_FAILED");
  if (!validation.valid) {
    await Promise.all([
      supabaseRest(`historical_decision_registry?id=eq.${encodeURIComponent(registry.id)}`, {
        method: "PATCH",
        body: { review_import_status: status, review_imported_at: new Date().toISOString() },
        prefer: "return=minimal"
      }),
      supabaseRest(`historical_review_batches?id=eq.${encodeURIComponent(batch.id)}`, {
        method: "PATCH",
        body: { status: "VALIDATION_FAILED" },
        prefer: "return=minimal"
      }),
      supabaseRest("editorial_notification_outbox", {
        method: "POST",
        body: [{
          event_key: `historical-review-validation:${reviewImport.id}`,
          event_type: "HISTORICAL_REVIEW_VALIDATION_FAILED",
          parliamentary_case_id: registry.parliamentary_case_id,
          historical_review_import_id: reviewImport.id,
          payload: { case_id: registry.parliamentary_case_id, status, error_count: validation.errors.length },
          delivery_status: "PENDING"
        }],
        prefer: "return=minimal"
      })
    ]);
    return { status, importId: reviewImport.id, taskCount: 0, messages: [...validation.errors, ...validation.warnings] };
  }
  const tasks = taskRows({
    caseId: registry.parliamentary_case_id,
    decisionUnitId: null,
    reviewImportId: reviewImport.id,
    result: validation.result
  });
  if (tasks.length) {
    await supabaseRest("editorial_tasks", {
      method: "POST",
      body: tasks,
      prefer: "return=minimal"
    });
  }
  const timestamp = new Date().toISOString();
  await Promise.all([
    supabaseRest(`historical_review_imports?id=eq.${encodeURIComponent(reviewImport.id)}`, {
      method: "PATCH",
      body: { status: "APPLIED_TO_TASKS", task_generation_at: timestamp },
      prefer: "return=minimal"
    }),
    supabaseRest(`historical_review_batch_cases?id=eq.${encodeURIComponent(batchCase.id)}`, {
      method: "PATCH",
      body: { review_package_status: "TASKS_GENERATED" },
      prefer: "return=minimal"
    }),
    supabaseRest(`historical_decision_registry?id=eq.${encodeURIComponent(registry.id)}`, {
      method: "PATCH",
      body: { review_package_status: "TASKS_GENERATED", review_import_status: "APPLIED_TO_TASKS", review_imported_at: timestamp },
      prefer: "return=minimal"
    }),
    supabaseRest(`historical_review_batches?id=eq.${encodeURIComponent(batch.id)}`, {
      method: "PATCH",
      body: { status: "TASKS_GENERATED" },
      prefer: "return=minimal"
    }),
    supabaseRest("editorial_notification_outbox", {
      method: "POST",
      body: [{
        event_key: `historical-review-tasks:${reviewImport.id}`,
        event_type: "HISTORICAL_REVIEW_TASKS_READY",
        parliamentary_case_id: registry.parliamentary_case_id,
        historical_review_import_id: reviewImport.id,
        payload: { case_id: registry.parliamentary_case_id, task_count: tasks.length, deep_link: "/redaktion" },
        delivery_status: "PENDING"
      }],
      prefer: "return=minimal"
    }),
    supabaseRpc("recompute_case_analysis_state", {
      p_case_id: registry.parliamentary_case_id,
      p_trigger_kind: "IMPORT",
      p_trigger_ref: reviewImport.id
    })
  ]);
  return { status: "APPLIED_TO_TASKS", importId: reviewImport.id, taskCount: tasks.length, messages: validation.warnings };
}
