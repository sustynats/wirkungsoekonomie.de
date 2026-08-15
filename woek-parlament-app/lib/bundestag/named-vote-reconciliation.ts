import { execFile as executeFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import { supabaseRest } from "@/lib/database/supabase-admin";
import { listOfficialNamedVoteSources } from "@/lib/bundestag/named-votes";

const execFile = promisify(executeFile);
const resultPdfHost = "www.bundestag.de";

type StoredVoteEvent = {
  id: string;
  case_id: string | null;
  result: Record<string, unknown>;
};

type SourceDocumentCase = { case_id: string };
type StoredVoteSource = { source_url: string; result: Record<string, unknown> };

export type VoteDocumentReconciliation = {
  voteId: string;
  resultPdfUrl: string;
  documentNumbers: string[];
  caseId: string | null;
  status: "LINKED_BY_OFFICIAL_DOCUMENT" | "NO_DOCUMENT_REFERENCE" | "SOURCE_DOCUMENT_NOT_IMPORTED" | "AMBIGUOUS_CASE_REFERENCE";
};

function assertOfficialResultPdfUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.hostname !== resultPdfHost || !/^\/resource\/blob\/\d+\/[A-Za-z0-9_-]+\.pdf$/i.test(url.pathname) || url.search || url.hash) {
    throw new Error("Named-vote reconciliation requires an official Bundestag result PDF.");
  }
}

/** Converts an official Bundestag Drucksache number into its canonical public
 * PDF URL. This is only used to find an already imported primary source. */
export function officialDrucksachePdfUrl(documentNumber: string) {
  const match = /^(\d{2})\/(\d{1,5})$/.exec(documentNumber.trim());
  if (!match) return null;
  const term = match[1];
  const number = match[2].padStart(5, "0");
  return `https://dserver.bundestag.de/btd/${term}/${number.slice(0, 3)}/${term}${number}.pdf`;
}

/** The result PDF is the source of truth for which Drucksachen were voted on.
 * We accept only normalised Bundestag document numbers, never inferred titles. */
export function documentNumbersFromOfficialVoteResult(text: string) {
  const firstPage = text.slice(0, 12_000);
  return [...new Set([...firstPage.matchAll(/\b(\d{2}\/\d{1,5})\b/g)].map((match) => match[1]))];
}

async function textFromOfficialResultPdf(resultPdfUrl: string) {
  assertOfficialResultPdfUrl(resultPdfUrl);
  const response = await fetch(resultPdfUrl, { cache: "no-store", signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`Official named-vote result PDF request failed with ${response.status}.`);
  const temporaryDirectory = await mkdtemp(path.join(tmpdir(), "woek-named-vote-"));
  const inputPath = path.join(temporaryDirectory, "official-result.pdf");
  try {
    await writeFile(inputPath, Buffer.from(await response.arrayBuffer()));
    const { stdout } = await execFile("pdftotext", [inputPath, "-"], { maxBuffer: 4 * 1024 * 1024, timeout: 30_000 });
    return stdout;
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

async function storedVoteEvent(sourceUrl: string) {
  const rows = await supabaseRest<StoredVoteEvent[]>(`parliament.vote_events?source_url=eq.${encodeURIComponent(sourceUrl)}&is_named_vote=eq.true&select=id,case_id,result&limit=1`);
  return rows[0] ?? null;
}

async function reconciledSourceUrls(startDate: string, endDate: string) {
  const rows = await supabaseRest<StoredVoteSource[]>(
    `parliament.vote_events?is_named_vote=eq.true&vote_date=gte.${startDate}&vote_date=lte.${endDate}&select=source_url,result&limit=1000`
  );
  return new Set(rows.filter((row) => typeof row.result.official_result_pdf_url === "string").map((row) => row.source_url));
}

async function casesForDocumentNumber(documentNumber: string) {
  const sourceUrl = officialDrucksachePdfUrl(documentNumber);
  if (!sourceUrl) return [];
  const rows = await supabaseRest<SourceDocumentCase[]>(`parliament.source_documents?source_url=eq.${encodeURIComponent(sourceUrl)}&select=case_id&limit=20`);
  return [...new Set(rows.map((row) => row.case_id))];
}

async function saveReconciliation(event: StoredVoteEvent, reconciliation: VoteDocumentReconciliation) {
  if (event.case_id && reconciliation.caseId && event.case_id !== reconciliation.caseId) {
    throw new Error("An official named vote already has a different case link and requires manual review.");
  }
  await supabaseRest(`parliament.vote_events?id=eq.${encodeURIComponent(event.id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      ...(reconciliation.caseId ? { case_id: reconciliation.caseId } : {}),
      result: {
        ...event.result,
        official_result_pdf_url: reconciliation.resultPdfUrl,
        official_document_numbers: reconciliation.documentNumbers,
        case_link_status: reconciliation.status,
        case_link_checked_at: new Date().toISOString()
      }
    })
  });
}

/**
 * Link an official named vote to an imported case only if every Drucksache
 * named in the Bundestag result PDF resolves to the same locally imported
 * primary-source case. This creates no decision-unit link and no member
 * assessment; those require a separately verified WÖk recommendation.
 */
export async function reconcileOfficialNamedVotes({ startDate, endDate, maximumVotes = 100 }: { startDate: string; endDate: string; maximumVotes?: number }) {
  if (!Number.isInteger(maximumVotes) || maximumVotes < 1 || maximumVotes > 300) throw new Error("maximumVotes must be an integer between 1 and 300.");
  const allSources = await listOfficialNamedVoteSources(startDate, endDate);
  const alreadyReconciled = await reconciledSourceUrls(startDate, endDate);
  const sources = allSources.filter((source) => !alreadyReconciled.has(source.sourceUrl)).slice(0, maximumVotes);
  const results: VoteDocumentReconciliation[] = [];

  for (const source of sources) {
    const event = await storedVoteEvent(source.sourceUrl);
    if (!event) continue;
    const documentNumbers = documentNumbersFromOfficialVoteResult(await textFromOfficialResultPdf(source.resultPdfUrl));
    const casesByDocument = await Promise.all(documentNumbers.map(casesForDocumentNumber));
    const allResolved = documentNumbers.length > 0 && casesByDocument.every((caseIds) => caseIds.length === 1);
    const candidateCaseIds = new Set(casesByDocument.flat());
    const caseId = allResolved && candidateCaseIds.size === 1 ? [...candidateCaseIds][0] : null;
    const status: VoteDocumentReconciliation["status"] = documentNumbers.length === 0
      ? "NO_DOCUMENT_REFERENCE"
      : caseId
        ? "LINKED_BY_OFFICIAL_DOCUMENT"
        : candidateCaseIds.size > 1
          ? "AMBIGUOUS_CASE_REFERENCE"
          : "SOURCE_DOCUMENT_NOT_IMPORTED";
    const result = { voteId: event.id, resultPdfUrl: source.resultPdfUrl, documentNumbers, caseId, status };
    await saveReconciliation(event, result);
    results.push(result);
  }

  const byStatus = (status: VoteDocumentReconciliation["status"]) => results.filter((result) => result.status === status).length;
  return {
    officialVoteSourcesFound: allSources.length,
    officialVoteSourcesChecked: results.length,
    officialVoteSourcesRemaining: Math.max(allSources.length - alreadyReconciled.size - results.length, 0),
    linkedByOfficialDocument: byStatus("LINKED_BY_OFFICIAL_DOCUMENT"),
    noDocumentReference: byStatus("NO_DOCUMENT_REFERENCE"),
    sourceDocumentNotImported: byStatus("SOURCE_DOCUMENT_NOT_IMPORTED"),
    ambiguousCaseReference: byStatus("AMBIGUOUS_CASE_REFERENCE")
  };
}
