import { sha256 } from "@/lib/review/privacy";
import { supabaseRest } from "@/lib/database/supabase-admin";

type CaseRow = {
  id: string;
  title: string;
  official_title: string | null;
  decision_date: string | null;
  current_stage: string | null;
  vote_type: string | null;
  vote_result: Record<string, unknown>;
  source_snapshot: Record<string, unknown>;
};

type SourceRow = {
  id: string;
  document_type: string;
  source_url: string;
  source_attribution: string;
  document_date: string | null;
  retrieved_at: string;
  source_hash: string | null;
  temporal_class: "AVAILABLE_AT_DECISION_TIME" | "PUBLISHED_AFTER_DECISION" | "CURRENT_REFERENCE";
  source_metadata: Record<string, unknown>;
};

type FactPackageRow = { id: string; package_version: number; fact_package: Record<string, unknown>; completeness_status: "INCOMPLETE" | "READY_FOR_REVIEW" | "DATA_GAP"; content_hash: string };

export type PreparedFactPackage = {
  factPackageId: string;
  packageVersion: number;
  factPackage: Record<string, unknown>;
  sourceSnapshot: Record<string, unknown>;
  sourceRows: SourceRow[];
  completenessStatus: FactPackageRow["completeness_status"];
  contentHash: string;
};

async function loadCase(caseId: string) {
  const rows = await supabaseRest<CaseRow[]>(`parliament.cases?select=id,title,official_title,decision_date,current_stage,vote_type,vote_result,source_snapshot&id=eq.${encodeURIComponent(caseId)}&limit=1`);
  const item = rows[0];
  if (!item) throw new Error("Parliamentary case was not found.");
  return item;
}

async function loadSources(caseId: string) {
  return supabaseRest<SourceRow[]>(`parliament.source_documents?select=id,document_type,source_url,source_attribution,document_date,retrieved_at,source_hash,temporal_class,source_metadata&case_id=eq.${encodeURIComponent(caseId)}&order=retrieved_at.asc`);
}

function calculateCompleteness(caseRow: CaseRow, sources: SourceRow[]) {
  const gaps: string[] = [];
  if (!caseRow.decision_date) gaps.push("Entscheidungsdatum fehlt.");
  if (!sources.some((source) => source.document_type === "FINAL_DECISION")) gaps.push("Tatsächlich relevante finale Entscheidungsfassung fehlt.");
  if (!sources.some((source) => source.temporal_class === "AVAILABLE_AT_DECISION_TIME")) gaps.push("Quellenlage zum Entscheidungszeitpunkt fehlt.");
  return { status: gaps.length === 0 ? "READY_FOR_REVIEW" as const : "DATA_GAP" as const, gaps };
}

export async function prepareFactPackage(caseId: string): Promise<PreparedFactPackage> {
  const caseRow = await loadCase(caseId);
  const sourceRows = await loadSources(caseId);
  const completeness = calculateCompleteness(caseRow, sourceRows);
  const factPackage = {
    case_id: caseRow.id,
    decision_object: caseRow.official_title ?? caseRow.title,
    parliamentary_status: caseRow.current_stage ?? "STATUS_UNVERIFIED",
    decision_date: caseRow.decision_date,
    vote_type: caseRow.vote_type,
    vote_result: caseRow.vote_result,
    sources: sourceRows.map((source) => ({ source_id: source.id, document_type: source.document_type, source_hash: source.source_hash })),
    uncertainties: completeness.gaps
  };
  const sourceSnapshot = {
    case_source_snapshot: caseRow.source_snapshot,
    sources: sourceRows.map((source) => ({
      source_id: source.id,
      source_hash: source.source_hash,
      retrieved_at: source.retrieved_at,
      temporal_class: source.temporal_class
    }))
  };
  const contentHash = sha256({ factPackage, sourceSnapshot, completeness: completeness.status });

  const existingRows = await supabaseRest<FactPackageRow[]>(`parliament.decision_fact_packages?select=id,package_version,fact_package,completeness_status,content_hash&case_id=eq.${encodeURIComponent(caseId)}&content_hash=eq.${contentHash}&limit=1`);
  const existing = existingRows[0];
  if (existing) {
    return { factPackageId: existing.id, packageVersion: existing.package_version, factPackage: existing.fact_package, sourceSnapshot, sourceRows, completenessStatus: existing.completeness_status, contentHash: existing.content_hash };
  }

  const versions = await supabaseRest<Array<{ package_version: number }>>(`parliament.decision_fact_packages?select=package_version&case_id=eq.${encodeURIComponent(caseId)}&order=package_version.desc&limit=1`);
  const packageVersion = (versions[0]?.package_version ?? 0) + 1;
  const insertedRows = await supabaseRest<FactPackageRow[]>("parliament.decision_fact_packages", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      case_id: caseRow.id,
      package_version: packageVersion,
      fact_package: factPackage,
      source_snapshot: sourceSnapshot,
      completeness_status: completeness.status,
      content_hash: contentHash
    })
  });
  const inserted = insertedRows[0];
  if (!inserted) throw new Error("Could not persist decision fact package.");

  await supabaseRest(`parliament.cases?id=eq.${encodeURIComponent(caseId)}`, {
    method: "PATCH",
    body: JSON.stringify({ review_status: completeness.status === "READY_FOR_REVIEW" ? "REVIEW_PACKAGE_READY" : "DATA_GAP" })
  });
  return { factPackageId: inserted.id, packageVersion, factPackage, sourceSnapshot, sourceRows, completenessStatus: completeness.status, contentHash };
}
