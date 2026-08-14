import { fetchHistoricalDipCases, fetchHistoricalDipDocuments, historicalWoeKBackfillStart, type ImportedDipCase, type ImportedDipDocument } from "@/lib/dip-backfill";
import { supabaseRest } from "@/lib/database/supabase-admin";
import { assessMateriality } from "@/lib/editorial/materiality";
import { persistStructuredDocumentVersion } from "@/lib/editorial/document-structure";

type ImportRun = { id: string };
type StoredCase = { id: string; decision_date: string | null };
type StoredSourceDocument = { id: string };

const parliament = {
  id: "bundestag-21",
  jurisdiction: "federal",
  country: "DE",
  language: "de",
  legislative_term: "21",
  name: "Deutscher Bundestag · 21. Wahlperiode"
};

function compactSourceMetadata(raw: Record<string, unknown>) {
  const nonDuplicated = Object.fromEntries(Object.entries(raw).filter(([key]) => !["pdf_text", "volltext", "text", "dokumenttext", "inhalt"].includes(key)));
  return nonDuplicated;
}

async function createImportRun(parameters: Record<string, unknown>) {
  const rows = await supabaseRest<ImportRun[]>("parliament.import_runs", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ adapter_name: "DIP", parameters, status: "RUNNING" })
  });
  const run = rows[0];
  if (!run) throw new Error("Could not create historical import run.");
  return run;
}

async function saveCase(item: ImportedDipCase) {
  const materiality = assessMateriality(item.title);
  const caseRows = await supabaseRest<StoredCase[]>("parliament.cases?on_conflict=parliament_id,external_case_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      parliament_id: parliament.id,
      external_case_id: item.externalCaseId,
      slug: item.slug,
      title: item.title,
      official_title: item.title,
      kind: "RETROSPECTIVE_CASE",
      source_status: "STATUS_UNVERIFIED",
      publication_status: "DRAFT",
      current_stage: item.parliamentaryStatus,
      decision_date: item.decisionDate,
      materiality_status: materiality.result,
      review_status: "NOT_READY",
      source_snapshot: {
        source: "Deutscher Bundestag – DIP",
        source_url: item.sourceUrl,
        source_hash: item.sourceHash
      }
    })
  });
  const storedCase = caseRows[0];
  if (!storedCase) throw new Error(`Could not persist DIP case ${item.externalCaseId}.`);

  await supabaseRest("parliament.materiality_assessments?on_conflict=case_id,engine_version", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({
      case_id: storedCase.id,
      engine_version: materiality.engineVersion,
      result: materiality.result,
      reasons: materiality.reasons
    })
  });

  const sources = await supabaseRest<StoredSourceDocument[]>("parliament.source_documents?on_conflict=case_id,external_document_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      case_id: storedCase.id,
      external_document_id: `dip-vorgang-${item.externalCaseId}`,
      document_type: "DIP_VORGANG",
      source_url: item.sourceUrl,
      source_attribution: "Deutscher Bundestag – DIP",
      document_date: item.decisionDate,
      source_hash: item.sourceHash,
      temporal_class: "CURRENT_REFERENCE",
      source_metadata: { ...compactSourceMetadata(item.raw), title: item.title, imported_source_kind: "vorgang" }
    })
  });
  const source = sources[0];
  if (!source) throw new Error(`Could not persist DIP source record for ${item.externalCaseId}.`);
  await persistStructuredDocumentVersion({
    documentId: source.id,
    sourceHash: item.sourceHash,
    sourceUrl: item.sourceUrl,
    documentDate: item.decisionDate,
    rawText: null,
    sourceMetadata: { imported_source_kind: "vorgang", raw: compactSourceMetadata(item.raw) }
  });
  return storedCase;
}

function classifyDocumentTemporally(documentDate: string | null, decisionDate: string | null) {
  if (!documentDate || !decisionDate) return "CURRENT_REFERENCE";
  return documentDate <= decisionDate ? "AVAILABLE_AT_DECISION_TIME" : "PUBLISHED_AFTER_DECISION";
}

async function saveLinkedDocument(caseId: string, decisionDate: string | null, item: ImportedDipDocument) {
  const sources = await supabaseRest<StoredSourceDocument[]>("parliament.source_documents?on_conflict=case_id,external_document_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      case_id: caseId,
      external_document_id: `dip-drucksache-${item.externalDocumentId}`,
      document_type: item.documentType,
      source_url: item.sourceUrl,
      source_attribution: "Deutscher Bundestag – DIP",
      document_date: item.documentDate,
      source_hash: item.sourceHash,
      temporal_class: classifyDocumentTemporally(item.documentDate, decisionDate),
      source_metadata: { ...compactSourceMetadata(item.raw), title: item.title, imported_source_kind: "drucksache" }
    })
  });
  const source = sources[0];
  if (!source) throw new Error(`Could not persist DIP document ${item.externalDocumentId}.`);
  await persistStructuredDocumentVersion({
    documentId: source.id,
    sourceHash: item.sourceHash,
    sourceUrl: item.sourceUrl,
    documentDate: item.documentDate,
    rawText: item.extractedText,
    sourceMetadata: { imported_source_kind: "drucksache", raw: compactSourceMetadata(item.raw) }
  });
}

export async function runHistoricalDipBackfill({
  startDate = historicalWoeKBackfillStart,
  endDate
}: { startDate?: string; endDate?: string } = {}) {
  await supabaseRest("parliament.parliaments?on_conflict=id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify(parliament)
  });

  const run = await createImportRun({ start_date: startDate, end_date: endDate ?? null, legislative_term: "21" });
  try {
    const imported = await fetchHistoricalDipCases({ startDate, endDate });
    let saved = 0;
    let skipped = 0;
    const caseByExternalCaseId = new Map<string, StoredCase>();
    for (const item of imported.cases) {
      try {
        const stored = await saveCase(item);
        caseByExternalCaseId.set(item.externalCaseId, stored);
        saved += 1;
      } catch {
        skipped += 1;
      }
    }
    const importedDocuments = await fetchHistoricalDipDocuments({ startDate, endDate });
    let linkedDocuments = 0;
    for (const document of importedDocuments.documents) {
      if (!document.linkedExternalCaseId) continue;
      const storedCase = caseByExternalCaseId.get(document.linkedExternalCaseId);
      if (!storedCase) continue;
      try {
        await saveLinkedDocument(storedCase.id, storedCase.decision_date, document);
        linkedDocuments += 1;
      } catch {
        skipped += 1;
      }
    }
    await supabaseRest(`parliament.import_runs?id=eq.${encodeURIComponent(run.id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        completed_at: new Date().toISOString(),
        source_count: imported.documents.length + importedDocuments.documents.length,
        created_count: saved,
        skipped_count: skipped,
        status: skipped > 0 ? "PARTIAL" : "SUCCEEDED"
      })
    });
    return {
      runId: run.id,
      sources: imported.documents.length + importedDocuments.documents.length,
      storedCases: saved,
      linkedDocuments,
      skippedCases: skipped,
      pageCount: imported.pageCount + importedDocuments.pageCount
    };
  } catch (error) {
    await supabaseRest(`parliament.import_runs?id=eq.${encodeURIComponent(run.id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        completed_at: new Date().toISOString(),
        status: "FAILED",
        error_summary: error instanceof Error ? error.message : "Unexpected import error"
      })
    });
    throw error;
  }
}
