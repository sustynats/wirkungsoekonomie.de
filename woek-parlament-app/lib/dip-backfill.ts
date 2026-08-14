import { createHash } from "node:crypto";
import { fetchAllDipPages } from "@/lib/dip";

export const historicalWoeKBackfillStart = "2025-05-06";
export const legislativeTermStart = "2025-03-25";
export const governmentTermStart = "2025-05-06";

type DipRecord = Record<string, unknown>;

export type ImportedDipCase = {
  externalCaseId: string;
  slug: string;
  title: string;
  decisionDate: string | null;
  parliamentaryStatus: string | null;
  sourceUrl: string;
  sourceHash: string;
  raw: DipRecord;
};

export type ImportedDipDocument = {
  externalDocumentId: string;
  linkedExternalCaseId: string | null;
  title: string;
  documentDate: string | null;
  documentType: "DIP_DRUCKSACHE" | "CANDIDATE_FINAL_DECISION";
  sourceUrl: string;
  sourceHash: string;
  extractedText: string | null;
  raw: DipRecord;
};

function firstText(record: DipRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return null;
}

function linkedVorgangId(record: DipRecord) {
  const direct = firstText(record, ["vorgang_id", "vorgangId"]);
  if (direct) return direct;
  const related = record.vorgangsbezug ?? record.vorgaenge ?? record.vorgang;
  if (Array.isArray(related)) {
    for (const item of related) {
      if (typeof item === "string" && item.trim()) return item.trim();
      if (item && typeof item === "object" && !Array.isArray(item)) {
        const id = firstText(item as DipRecord, ["id", "vorgang_id", "vorgangId"]);
        if (id) return id;
      }
    }
  }
  if (related && typeof related === "object" && !Array.isArray(related)) return firstText(related as DipRecord, ["id", "vorgang_id", "vorgangId"]);
  return typeof related === "string" && related.trim() ? related.trim() : null;
}

function dateOnly(value: string | null) {
  if (!value) return null;
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value);
  return match?.[1] ?? null;
}

function shortHash(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

function extractedDocumentText(record: DipRecord) {
  return firstText(record, ["pdf_text", "volltext", "text", "dokumenttext", "inhalt"]);
}

/**
 * DIP response field names are treated defensively. Unknown or incomplete
 * records remain importable as source records, but they never become a
 * published parliamentary status without later fact-package verification.
 */
export function normalizeDipVorgang(value: unknown): ImportedDipCase | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as DipRecord;
  const externalCaseId = firstText(raw, ["id", "vorgang_id", "vorgangId"]);
  if (!externalCaseId) return null;
  const title = firstText(raw, ["titel", "vorgangstitel", "title"]) ?? `DIP-Vorgang ${externalCaseId}`;
  const decisionDate = dateOnly(firstText(raw, ["datum", "beratungsdatum", "aktualisiert"]));
  const parliamentaryStatus = firstText(raw, ["beratungsstand", "status", "vorgangstyp"]);
  const sourceUrl = `https://dip.bundestag.de/vorgang/${externalCaseId}`;
  const sourceHash = createHash("sha256").update(JSON.stringify(raw)).digest("hex");
  return {
    externalCaseId,
    slug: `bt21-dip-${shortHash(externalCaseId)}`,
    title,
    decisionDate,
    parliamentaryStatus,
    sourceUrl,
    sourceHash,
    raw
  };
}

export function normalizeDipDrucksache(value: unknown): ImportedDipDocument | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as DipRecord;
  const externalDocumentId = firstText(raw, ["id", "drucksache_id", "drucksacheId"]);
  if (!externalDocumentId) return null;
  const title = firstText(raw, ["titel", "title", "kurzbezeichnung"]) ?? `DIP-Drucksache ${externalDocumentId}`;
  const documentDate = dateOnly(firstText(raw, ["datum", "verteildatum", "aktualisiert"]));
  const documentCategory = firstText(raw, ["dokumentart", "typ", "art"]) ?? "";
  const linkedExternalCaseId = linkedVorgangId(raw);
  const sourceUrl = firstText(raw, ["url", "dokument_url", "fundstelle"]) ?? `https://dip.bundestag.de/drucksache/${externalDocumentId}`;
  const sourceHash = createHash("sha256").update(JSON.stringify(raw)).digest("hex");
  return {
    externalDocumentId,
    linkedExternalCaseId,
    title,
    documentDate,
    documentType: /beschlussempfehlung|bericht/i.test(documentCategory) ? "CANDIDATE_FINAL_DECISION" : "DIP_DRUCKSACHE",
    sourceUrl,
    sourceHash,
    extractedText: extractedDocumentText(raw),
    raw
  };
}

export async function fetchHistoricalDipCases({
  startDate = historicalWoeKBackfillStart,
  endDate
}: { startDate?: string; endDate?: string } = {}) {
  const params: Record<string, string> = {
    "f.wahlperiode": "21",
    "f.datum.start": startDate
  };
  if (endDate) params["f.datum.end"] = endDate;
  const response = await fetchAllDipPages("vorgang", params);
  const cases = response.documents.map(normalizeDipVorgang).filter((item): item is ImportedDipCase => Boolean(item));
  return { ...response, cases };
}

export async function fetchHistoricalDipDocuments({
  startDate = historicalWoeKBackfillStart,
  endDate
}: { startDate?: string; endDate?: string } = {}) {
  const params: Record<string, string> = {
    "f.wahlperiode": "21",
    "f.zuordnung": "BT",
    "f.datum.start": startDate
  };
  if (endDate) params["f.datum.end"] = endDate;
  const response = await fetchAllDipPages("drucksache", params);
  const documents = response.documents.map(normalizeDipDrucksache).filter((item): item is ImportedDipDocument => Boolean(item));
  return { ...response, documents };
}
