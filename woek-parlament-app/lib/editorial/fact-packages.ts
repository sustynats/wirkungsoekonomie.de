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

type DecisionUnitRow = {
  id: string;
  decision_date: string | null;
  parliamentary_stage: string | null;
  final_decision_text: string | null;
  final_document_version_id: string | null;
  actual_outcome: string | null;
  vote_type: string | null;
  vote_result: Record<string, unknown>;
  named_vote_available: boolean;
};

type DocumentVersionRow = {
  id: string;
  document_id: string;
  normalized_text: string | null;
  normalized_text_truncated: boolean;
};

type DocumentChunkRow = {
  chunk_key: string;
  heading_path: string;
  page_or_location: string | null;
  normalized_text: string;
};

export type FactPackageExcerpt = {
  sourceId: string;
  location: string;
  text: string;
  whyRequired: string;
};

type FactPackageRow = { id: string; package_version: number; fact_package: Record<string, unknown>; completeness_status: "INCOMPLETE" | "READY_FOR_REVIEW" | "DATA_GAP"; content_hash: string };

export type PreparedFactPackage = {
  factPackageId: string;
  packageVersion: number;
  decisionUnitId: string | null;
  factPackage: Record<string, unknown>;
  sourceSnapshot: Record<string, unknown>;
  sourceRows: SourceRow[];
  sourceExcerpts: FactPackageExcerpt[];
  completenessStatus: FactPackageRow["completeness_status"];
  contentHash: string;
};

export type ReviewContext = "HISTORICAL" | "EX_ANTE";

async function loadFinalDocumentExcerpts(finalDocumentVersionId: string | null, sources: SourceRow[]) {
  if (!finalDocumentVersionId) return [] as FactPackageExcerpt[];
  const versions = await supabaseRest<DocumentVersionRow[]>(
    `parliament.document_versions?id=eq.${encodeURIComponent(finalDocumentVersionId)}&select=id,document_id,normalized_text,normalized_text_truncated&limit=1`
  );
  const version = versions[0];
  if (!version) return [] as FactPackageExcerpt[];
  const source = sources.find((item) => item.id === version.document_id);
  if (!source) return [] as FactPackageExcerpt[];
  const chunks = await supabaseRest<DocumentChunkRow[]>(
    `parliament.document_chunks?document_version_id=eq.${encodeURIComponent(version.id)}&select=chunk_key,heading_path,page_or_location,normalized_text&order=chunk_key.asc&limit=3`
  );
  if (chunks.length > 0) {
    return chunks.map((chunk) => ({
      sourceId: source.id,
      location: chunk.page_or_location || chunk.heading_path || `Textabschnitt ${chunk.chunk_key}`,
      text: chunk.normalized_text,
      whyRequired: "Amtliche Entscheidungsfassung: Dieser Auszug begrenzt den fachlichen Review auf den tatsächlichen Entscheidungsgegenstand."
    }));
  }
  if (!version.normalized_text) return [] as FactPackageExcerpt[];
  return [{
    sourceId: source.id,
    location: version.normalized_text_truncated ? "Beginn der amtlichen Entscheidungsfassung (gespeichert gekürzt)" : "Amtliche Entscheidungsfassung",
    text: version.normalized_text.slice(0, 20_000),
    whyRequired: "Amtliche Entscheidungsfassung: Dieser Auszug begrenzt den fachlichen Review auf den tatsächlichen Entscheidungsgegenstand."
  }];
}

async function loadCurrentDraftExcerpts(sources: SourceRow[]) {
  // Before a vote there is intentionally no "final decision". The official
  // government or parliamentary draft is the accountable basis for an ex-ante
  // assessment and must never be rejected merely because it is still mutable.
  const draftSources = sources.filter((source) =>
    source.document_type === "DIP_DRUCKSACHE" ||
    source.document_type === "CANDIDATE_FINAL_DECISION"
  );
  for (const source of draftSources) {
    const versions = await supabaseRest<DocumentVersionRow[]>(
      `parliament.document_versions?document_id=eq.${encodeURIComponent(source.id)}&select=id,document_id,normalized_text,normalized_text_truncated&order=retrieved_at.desc&limit=1`
    );
    const version = versions[0];
    if (!version?.normalized_text) continue;
    const chunks = await supabaseRest<DocumentChunkRow[]>(
      `parliament.document_chunks?document_version_id=eq.${encodeURIComponent(version.id)}&select=chunk_key,heading_path,page_or_location,normalized_text&order=chunk_key.asc&limit=8`
    );
    if (chunks.length > 0) {
      return chunks.map((chunk) => ({
        sourceId: source.id,
        location: chunk.page_or_location || chunk.heading_path || `Amtlicher Entwurf, Abschnitt ${chunk.chunk_key}`,
        text: chunk.normalized_text,
        whyRequired: "Amtlicher Entwurf vor der Entscheidung: Dieser Auszug markiert den überprüfbaren Ausgangspunkt; spätere parlamentarische Änderungen werden als Diff erneut geprüft."
      }));
    }
    return [{
      sourceId: source.id,
      location: version.normalized_text_truncated ? "Beginn des amtlichen Entwurfs (gespeichert gekürzt)" : "Amtlicher Entwurf",
      text: version.normalized_text.slice(0, 20_000),
      whyRequired: "Amtlicher Entwurf vor der Entscheidung: Dieser Auszug markiert den überprüfbaren Ausgangspunkt; spätere parlamentarische Änderungen werden als Diff erneut geprüft."
    }];
  }
  return [] as FactPackageExcerpt[];
}

async function loadCase(caseId: string) {
  const rows = await supabaseRest<CaseRow[]>(`parliament.cases?select=id,title,official_title,decision_date,current_stage,vote_type,vote_result,source_snapshot&id=eq.${encodeURIComponent(caseId)}&limit=1`);
  const item = rows[0];
  if (!item) throw new Error("Parliamentary case was not found.");
  return item;
}

async function loadSources(caseId: string) {
  return supabaseRest<SourceRow[]>(`parliament.source_documents?select=id,document_type,source_url,source_attribution,document_date,retrieved_at,source_hash,temporal_class,source_metadata&case_id=eq.${encodeURIComponent(caseId)}&order=retrieved_at.asc`);
}

async function loadDecisionUnits(caseId: string) {
  return supabaseRest<DecisionUnitRow[]>(`parliament.decision_units?case_id=eq.${encodeURIComponent(caseId)}&select=id,decision_date,parliamentary_stage,final_decision_text,final_document_version_id,actual_outcome,vote_type,vote_result,named_vote_available&order=decision_date.desc.nullslast,id.asc`);
}

function calculateCompleteness(
  caseRow: CaseRow,
  sources: SourceRow[],
  decisionUnits: DecisionUnitRow[],
  reviewContext: ReviewContext,
  requestedDecisionUnitId?: string
) {
  const gaps: string[] = [];
  if (reviewContext === "EX_ANTE") {
    if (!caseRow.current_stage) gaps.push("Amtlicher parlamentarischer Stand fehlt.");
    const currentDraft = sources.find((source) =>
      source.document_type === "DIP_DRUCKSACHE" || source.document_type === "CANDIDATE_FINAL_DECISION"
    );
    if (!currentDraft) gaps.push("Aktuelle amtliche Beratungsfassung fehlt.");
    if (currentDraft && !currentDraft.source_url.startsWith("https://")) gaps.push("Aktuelle amtliche Beratungsfassung hat keine sichere Originalquelle.");
    if (!caseRow.decision_date && !currentDraft?.document_date) gaps.push("Datum der aktuellen Beratungsfassung fehlt.");
    return { status: gaps.length === 0 ? "READY_FOR_REVIEW" as const : "DATA_GAP" as const, gaps, decisionUnit: null };
  }
  if (decisionUnits.length === 0) gaps.push("Amtlich dokumentierte Entscheidungsposition fehlt.");
  const decisionUnit = requestedDecisionUnitId
    ? decisionUnits.find((item) => item.id === requestedDecisionUnitId) ?? null
    : decisionUnits.length === 1 ? decisionUnits[0] : null;
  if (requestedDecisionUnitId && !decisionUnit) gaps.push("Die angeforderte amtliche Entscheidungsposition gehört nicht zu diesem Fall.");
  if (!requestedDecisionUnitId && decisionUnits.length > 1) gaps.push("Mehrere amtliche Entscheidungspositionen müssen vor dem Review getrennt abgegrenzt werden.");
  if (!decisionUnit?.decision_date && !caseRow.decision_date) gaps.push("Entscheidungsdatum fehlt.");
  if (decisionUnit && !decisionUnit.final_document_version_id) gaps.push("Tatsächlich relevante finale Entscheidungsfassung fehlt.");
  if (!sources.some((source) => source.document_type === "FINAL_DECISION")) gaps.push("Tatsächlich relevante finale Entscheidungsfassung fehlt.");
  const decisionDate = decisionUnit?.decision_date ?? caseRow.decision_date;
  const hasSourceAvailableAtDecisionTime = sources.some((source) =>
    source.temporal_class === "AVAILABLE_AT_DECISION_TIME" || Boolean(decisionDate && source.document_date && source.document_date <= decisionDate)
  );
  if (!hasSourceAvailableAtDecisionTime) gaps.push("Quellenlage zum Entscheidungszeitpunkt fehlt.");
  return { status: gaps.length === 0 ? "READY_FOR_REVIEW" as const : "DATA_GAP" as const, gaps, decisionUnit };
}

export async function prepareFactPackage(
  caseId: string,
  { decisionUnitId, reviewContext = "HISTORICAL" }: { decisionUnitId?: string; reviewContext?: ReviewContext } = {}
): Promise<PreparedFactPackage> {
  const caseRow = await loadCase(caseId);
  const sourceRows = await loadSources(caseId);
  const decisionUnits = await loadDecisionUnits(caseId);
  const completeness = calculateCompleteness(caseRow, sourceRows, decisionUnits, reviewContext, decisionUnitId);
  const decision = completeness.decisionUnit;
  const sourceExcerpts = reviewContext === "EX_ANTE"
    ? await loadCurrentDraftExcerpts(sourceRows)
    : await loadFinalDocumentExcerpts(decision?.final_document_version_id ?? null, sourceRows);
  const factPackage = {
    case_id: caseRow.id,
    review_context: reviewContext,
    decision_unit_id: decision?.id ?? null,
    decision_object: caseRow.official_title ?? caseRow.title,
    parliamentary_status: decision?.parliamentary_stage ?? caseRow.current_stage ?? "STATUS_UNVERIFIED",
    decision_date: reviewContext === "EX_ANTE" ? null : decision?.decision_date ?? caseRow.decision_date,
    current_version_date: reviewContext === "EX_ANTE" ? caseRow.decision_date : null,
    decision_state: reviewContext === "EX_ANTE" ? "PENDING_PARLIAMENTARY_DECISION" : "DECIDED_OR_HISTORICAL",
    final_decision_text: decision?.final_decision_text ?? null,
    actual_outcome: decision?.actual_outcome ?? null,
    vote_type: decision?.vote_type ?? caseRow.vote_type,
    vote_result: decision?.vote_result ?? caseRow.vote_result,
    named_vote_available: decision?.named_vote_available ?? false,
    final_document_version_id: decision?.final_document_version_id ?? null,
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
    return { factPackageId: existing.id, packageVersion: existing.package_version, decisionUnitId: decision?.id ?? null, factPackage: existing.fact_package, sourceSnapshot, sourceRows, sourceExcerpts, completenessStatus: existing.completeness_status, contentHash: existing.content_hash };
  }

  const versions = await supabaseRest<Array<{ package_version: number }>>(`parliament.decision_fact_packages?select=package_version&case_id=eq.${encodeURIComponent(caseId)}&order=package_version.desc&limit=1`);
  const packageVersion = (versions[0]?.package_version ?? 0) + 1;
  const insertedRows = await supabaseRest<FactPackageRow[]>("parliament.decision_fact_packages", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      case_id: caseRow.id,
      decision_unit_id: decision?.id ?? null,
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
  return { factPackageId: inserted.id, packageVersion, decisionUnitId: decision?.id ?? null, factPackage, sourceSnapshot, sourceRows, sourceExcerpts, completenessStatus: completeness.status, contentHash };
}
