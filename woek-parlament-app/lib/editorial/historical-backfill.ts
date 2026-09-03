import {
  fetchHistoricalDipCases,
  fetchHistoricalDipDocuments,
  historicalWoeKBackfillStart,
  normalizeDipDecisionPosition,
  normalizeDipDrucksache,
  normalizeDipVorgang,
  type ImportedDipCase,
  type ImportedDipDecisionPosition,
  type ImportedDipDocument
} from "@/lib/dip-backfill";
import { fetchDipResource } from "@/lib/dip";
import { supabaseRest } from "@/lib/database/supabase-admin";
import { assessMateriality } from "@/lib/editorial/materiality";
import { persistStructuredDocumentVersion } from "@/lib/editorial/document-structure";

type ImportRun = { id: string };
type StoredCase = {
  id: string;
  decision_date: string | null;
  review_status: string;
  source_snapshot: Record<string, unknown>;
};
type StoredSourceDocument = { id: string };
type StoredDocumentVersion = { id: string };
type HistoricalBackfillStream = "VORGANG" | "DRUCKSACHE" | "VORGANGSPOSITION";
type HistoricalBackfillCheckpoint = {
  id: string;
  stream: HistoricalBackfillStream;
  start_date: string;
  end_date: string;
  next_cursor: string | null;
  status: "PENDING" | "RUNNING" | "COMPLETE" | "FAILED";
  pages_processed: number;
  source_records_processed: number;
  records_stored: number;
  records_skipped: number;
  expected_source_records: number | null;
};

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
  const previous = await findStoredCase(item.externalCaseId);
  const previousSourceHash = typeof previous?.source_snapshot?.source_hash === "string"
    ? previous.source_snapshot.source_hash
    : null;
  // A source refresh with the identical official snapshot must not quietly
  // reset a review already in progress. A changed source snapshot is instead
  // deliberately returned to preparation so the affected analysis can be
  // reviewed as a document change.
  const reviewStatus = previous && previousSourceHash === item.sourceHash
    ? previous.review_status
    : "NOT_READY";
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
      review_status: reviewStatus,
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

function hasFinalDecisionOutcome(outcome: string) {
  return /(annahme|ablehnung|kenntnisnahme|feststellung)/i.test(outcome);
}

async function latestVersionForDocument(document: StoredSourceDocument | undefined) {
  if (!document) return null;
  const versions = await supabaseRest<StoredDocumentVersion[]>(
    `parliament.document_versions?document_id=eq.${encodeURIComponent(document.id)}&select=id&order=retrieved_at.desc&limit=1`
  );
  return { documentId: document.id, versionId: versions[0]?.id ?? null };
}

async function findFinalDocumentVersion({
  caseId,
  externalDocumentId,
  documentKind,
  decisionDate,
  actualOutcome
}: {
  caseId: string;
  externalDocumentId: string | null;
  documentKind: string | null;
  decisionDate: string | null;
  actualOutcome: string;
}) {
  // A source cited directly by the formal position remains the strongest
  // linkage. It is never replaced by a title match.
  if (externalDocumentId && documentKind === "Drucksache") {
    const documents = await supabaseRest<StoredSourceDocument[]>(
      `parliament.source_documents?case_id=eq.${encodeURIComponent(caseId)}&external_document_id=eq.${encodeURIComponent(`dip-drucksache-${externalDocumentId}`)}&select=id&limit=1`
    );
    const direct = await latestVersionForDocument(documents[0]);
    if (direct?.versionId) return direct;
  }

  // Some DIP positions cite only the parliamentary protocol. For a formal
  // adoption, rejection, acknowledgement or finding, the official
  // Beschlussempfehlung from the same case is a transparent fallback.
  // Referrals and process steps deliberately remain unresolved.
  if (!decisionDate || !hasFinalDecisionOutcome(actualOutcome)) return null;
  const candidates = await supabaseRest<StoredSourceDocument[]>(
    `parliament.source_documents?case_id=eq.${encodeURIComponent(caseId)}&document_date=lte.${encodeURIComponent(decisionDate)}&source_metadata-%3E%3Edrucksachetyp=ilike.*Beschlussempfehlung*&select=id&order=document_date.desc.nullslast&limit=1`
  );
  return latestVersionForDocument(candidates[0]);
}

async function saveDecisionUnit(item: ImportedDipDecisionPosition) {
  const storedCase = await findStoredCase(item.linkedExternalCaseId);
  if (!storedCase) return false;
  const finalDocument = await findFinalDocumentVersion({
    caseId: storedCase.id,
    externalDocumentId: item.linkedDocumentId,
    documentKind: item.linkedDocumentKind,
    decisionDate: item.decisionDate,
    actualOutcome: item.actualOutcome
  });
  // Only a decision position that actually cites a Drucksache is allowed to
  // promote that document to the final-decision source role. A Plenarprotokoll
  // records the vote but is not silently substituted for the final text.
  if (finalDocument) {
    await supabaseRest(`parliament.source_documents?id=eq.${encodeURIComponent(finalDocument.documentId)}`, {
      method: "PATCH",
      body: JSON.stringify({ document_type: "FINAL_DECISION" })
    });
  }
  await supabaseRest("parliament.decision_units?on_conflict=case_id,external_decision_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({
      case_id: storedCase.id,
      external_decision_id: item.externalDecisionId,
      title: item.title,
      decision_date: item.decisionDate,
      parliamentary_stage: item.parliamentaryStage,
      final_decision_text: item.actualOutcome,
      final_document_version_id: finalDocument?.versionId ?? null,
      actual_outcome: item.actualOutcome,
      vote_type: item.voteType,
      vote_result: item.voteResult,
      named_vote_available: item.namedVoteAvailable,
      ranking_eligible: false,
      preferred_vote_option: "NO_SCORE"
    })
  });
  return true;
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

function dateToday() {
  return new Date().toISOString().slice(0, 10);
}

function nextCalendarDay(date: string) {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + 1);
  return value.toISOString().slice(0, 10);
}

type BackfillWindow = { startDate: string; endDate: string };

/**
 * Keep the initial historical census on one fixed snapshot window.  Without
 * this, a daily scheduler would create a new start-to-today import whenever
 * the end date changes, re-reading the whole legislative period.  Once every
 * stream for that snapshot is complete, later runs advance only from the
 * following calendar day.
 */
async function resolveBackfillWindow(requestedStartDate: string, requestedEndDate?: string): Promise<BackfillWindow> {
  if (requestedEndDate) return { startDate: requestedStartDate, endDate: requestedEndDate };
  const rows = await supabaseRest<Array<Pick<HistoricalBackfillCheckpoint, "start_date" | "end_date" | "status">>>(
    `parliament.historical_backfill_checkpoints?start_date=eq.${encodeURIComponent(requestedStartDate)}&select=start_date,end_date,status&order=end_date.asc&limit=100`
  );
  const unfinished = rows.find((row) => row.status !== "COMPLETE");
  if (unfinished) return { startDate: requestedStartDate, endDate: unfinished.end_date };

  const latestCompletedEndDate = rows
    .filter((row) => row.status === "COMPLETE")
    .map((row) => row.end_date)
    .sort()
    .at(-1);
  const today = dateToday();
  if (latestCompletedEndDate) {
    const incrementalStartDate = nextCalendarDay(latestCompletedEndDate);
    return incrementalStartDate > today
      ? { startDate: incrementalStartDate, endDate: incrementalStartDate }
      : { startDate: incrementalStartDate, endDate: today };
  }
  return { startDate: requestedStartDate, endDate: today };
}

function checkpointQuery(stream: HistoricalBackfillStream, startDate: string, endDate: string) {
  return `parliament.historical_backfill_checkpoints?stream=eq.${stream}&start_date=eq.${startDate}&end_date=eq.${endDate}&limit=1`;
}

async function getOrCreateCheckpoint(stream: HistoricalBackfillStream, startDate: string, endDate: string) {
  const existing = await supabaseRest<HistoricalBackfillCheckpoint[]>(checkpointQuery(stream, startDate, endDate));
  if (existing[0]) return existing[0];
  const rows = await supabaseRest<HistoricalBackfillCheckpoint[]>("parliament.historical_backfill_checkpoints?on_conflict=stream,start_date,end_date", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({ stream, start_date: startDate, end_date: endDate })
  });
  const checkpoint = rows[0];
  if (!checkpoint) throw new Error(`Could not create ${stream} checkpoint.`);
  return checkpoint;
}

async function updateCheckpoint(checkpoint: HistoricalBackfillCheckpoint, patch: Record<string, unknown>) {
  await supabaseRest(`parliament.historical_backfill_checkpoints?id=eq.${encodeURIComponent(checkpoint.id)}`, {
    method: "PATCH",
    body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() })
  });
}

async function runWithConcurrency<T>(values: T[], limit: number, worker: (value: T) => Promise<void>) {
  let nextIndex = 0;
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, async () => {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= values.length) return;
      await worker(values[index]);
    }
  }));
}

function historicalDipParams(stream: HistoricalBackfillStream, startDate: string, endDate: string, cursor: string | null) {
  const params: Record<string, string> = {
    "f.wahlperiode": "21",
    "f.datum.start": startDate,
    "f.datum.end": endDate
  };
  if (stream === "DRUCKSACHE" || stream === "VORGANGSPOSITION") params["f.zuordnung"] = "BT";
  if (cursor) params.cursor = cursor;
  return params;
}

async function findStoredCase(externalCaseId: string) {
  const rows = await supabaseRest<StoredCase[]>(
    `parliament.cases?parliament_id=eq.${encodeURIComponent(parliament.id)}&external_case_id=eq.${encodeURIComponent(externalCaseId)}&select=id,decision_date,review_status,source_snapshot&limit=1`
  );
  return rows[0] ?? null;
}

type PersistedPage = {
  complete: boolean;
  sourceRecords: number;
  stored: number;
  skipped: number;
  checkpoint: HistoricalBackfillCheckpoint;
};

async function persistCheckpointPage(checkpoint: HistoricalBackfillCheckpoint): Promise<PersistedPage> {
  const resource = checkpoint.stream === "VORGANG"
    ? "vorgang"
    : checkpoint.stream === "DRUCKSACHE"
      ? "drucksache-text"
      : "vorgangsposition";
  const requestCursor = checkpoint.next_cursor;
  const page = await fetchDipResource(resource, historicalDipParams(checkpoint.stream, checkpoint.start_date, checkpoint.end_date, requestCursor));
  let stored = 0;
  let skipped = 0;

  if (checkpoint.stream === "VORGANG") {
    const items = page.documents.map(normalizeDipVorgang).filter((item): item is ImportedDipCase => Boolean(item));
    await runWithConcurrency(items, 6, async (item) => {
      try {
        await saveCase(item);
        stored += 1;
      } catch {
        skipped += 1;
      }
    });
  } else if (checkpoint.stream === "DRUCKSACHE") {
    const items = page.documents.map(normalizeDipDrucksache).filter((item): item is ImportedDipDocument => Boolean(item));
    await runWithConcurrency(items, 6, async (item) => {
      try {
        if (!item.linkedExternalCaseId) {
          skipped += 1;
          return;
        }
        const storedCase = await findStoredCase(item.linkedExternalCaseId);
        if (!storedCase) {
          skipped += 1;
          return;
        }
        await saveLinkedDocument(storedCase.id, storedCase.decision_date, item);
        stored += 1;
      } catch {
        skipped += 1;
      }
    });
  } else {
    const items = page.documents.map(normalizeDipDecisionPosition).filter((item): item is ImportedDipDecisionPosition => Boolean(item));
    await runWithConcurrency(items, 6, async (item) => {
      try {
        if (await saveDecisionUnit(item)) stored += 1;
        else skipped += 1;
      } catch {
        skipped += 1;
      }
    });
  }

  // DIP documents that the cursor is unchanged after this response are the
  // final page for the original query (per its OpenAPI contract).
  const complete = !page.cursor || page.cursor === requestCursor;
  const updatedCheckpoint: HistoricalBackfillCheckpoint = {
    ...checkpoint,
    next_cursor: page.cursor ?? requestCursor,
    status: complete ? "COMPLETE" : "RUNNING",
    pages_processed: checkpoint.pages_processed + 1,
    source_records_processed: checkpoint.source_records_processed + page.documents.length,
    records_stored: checkpoint.records_stored + stored,
    records_skipped: checkpoint.records_skipped + skipped,
    expected_source_records: page.numFound ?? checkpoint.expected_source_records
  };
  await updateCheckpoint(checkpoint, {
    next_cursor: updatedCheckpoint.next_cursor,
    status: updatedCheckpoint.status,
    pages_processed: updatedCheckpoint.pages_processed,
    source_records_processed: updatedCheckpoint.source_records_processed,
    records_stored: updatedCheckpoint.records_stored,
    records_skipped: updatedCheckpoint.records_skipped,
    expected_source_records: updatedCheckpoint.expected_source_records,
    completed_at: complete ? new Date().toISOString() : null,
    last_error: null
  });
  return { complete, sourceRecords: page.documents.length, stored, skipped, checkpoint: updatedCheckpoint };
}

/**
 * Imports a bounded number of official cursor pages and persists the cursor
 * after every page. Re-invocation resumes exactly where the prior step ended.
 */
export async function runHistoricalDipBackfillStep({
  startDate = historicalWoeKBackfillStart,
  endDate,
  pageBudget = 8
}: { startDate?: string; endDate?: string; pageBudget?: number } = {}) {
  const window = await resolveBackfillWindow(startDate, endDate);
  const effectiveStartDate = window.startDate;
  const effectiveEndDate = window.endDate;
  await supabaseRest("parliament.parliaments?on_conflict=id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify(parliament)
  });
  // This stays beneath the five-minute serverless limit in production while
  // allowing a protected editorial/cron run to make meaningful progress on
  // the full-text census.  DIP request concurrency remains capped at six.
  const boundedPageBudget = Math.max(1, Math.min(pageBudget, 100));
  const run = await createImportRun({
    start_date: effectiveStartDate,
    end_date: effectiveEndDate,
    legislative_term: "21",
    mode: "RESUMABLE",
    page_budget: boundedPageBudget
  });

  let sources = 0;
  let stored = 0;
  let skipped = 0;
  let stream: HistoricalBackfillStream = "VORGANG";
  try {
    // Full text is persisted before formal decision positions are processed so
    // a decision unit can link to an actual version instead of an inferred one.
    for (const candidate of ["VORGANG", "DRUCKSACHE", "VORGANGSPOSITION"] as const) {
      const initialCheckpoint = await getOrCreateCheckpoint(candidate, effectiveStartDate, effectiveEndDate);
      if (initialCheckpoint.status === "COMPLETE") continue;
      stream = candidate;
      let checkpoint = initialCheckpoint;
      for (let page = 0; page < boundedPageBudget; page += 1) {
        const result = await persistCheckpointPage(checkpoint);
        sources += result.sourceRecords;
        stored += result.stored;
        skipped += result.skipped;
        checkpoint = result.checkpoint;
        if (result.complete) break;
      }
      const isComplete = checkpoint.status === "COMPLETE";
      await supabaseRest(`parliament.import_runs?id=eq.${encodeURIComponent(run.id)}`, {
        method: "PATCH",
        body: JSON.stringify({
          completed_at: new Date().toISOString(),
          source_count: sources,
          created_count: stored,
          skipped_count: skipped,
          status: isComplete && candidate === "VORGANGSPOSITION" ? "SUCCEEDED" : "PARTIAL"
        })
      });
      return {
        runId: run.id,
        startDate: effectiveStartDate,
        endDate: effectiveEndDate,
        stream: candidate,
        complete: isComplete && candidate === "VORGANGSPOSITION",
        streamComplete: isComplete,
        sourceRecords: sources,
        storedRecords: stored,
        skippedRecords: skipped,
        pagesProcessed: checkpoint.pages_processed,
        nextCursor: checkpoint.next_cursor
      };
    }
    await supabaseRest(`parliament.import_runs?id=eq.${encodeURIComponent(run.id)}`, {
      method: "PATCH",
      body: JSON.stringify({ completed_at: new Date().toISOString(), status: "SUCCEEDED" })
    });
    return { runId: run.id, startDate: effectiveStartDate, endDate: effectiveEndDate, stream, complete: true, streamComplete: true, sourceRecords: 0, storedRecords: 0, skippedRecords: 0, pagesProcessed: 0, nextCursor: null };
  } catch (error) {
    const checkpoint = await getOrCreateCheckpoint(stream, effectiveStartDate, effectiveEndDate);
    await updateCheckpoint(checkpoint, {
      status: "FAILED",
      last_error: error instanceof Error ? error.message : "Unexpected historical import error"
    });
    await supabaseRest(`parliament.import_runs?id=eq.${encodeURIComponent(run.id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        completed_at: new Date().toISOString(),
        source_count: sources,
        created_count: stored,
        skipped_count: skipped,
        status: "FAILED",
        error_summary: error instanceof Error ? error.message : "Unexpected historical import error"
      })
    });
    throw error;
  }
}
