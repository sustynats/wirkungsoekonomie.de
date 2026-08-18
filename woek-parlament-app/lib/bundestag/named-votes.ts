import JSZip from "jszip";

import type { MemberVote } from "@/lib/members/vote-ledger";

const officialHost = "www.bundestag.de";
const listEndpoint = "https://www.bundestag.de/ajax/filterlist/de/parlament/plenum/abstimmung/liste/462112-462112";
const expectedHeaders = [
  "Wahlperiode", "Sitzungnr", "Abstimmnr", "Fraktion/Gruppe", "Name", "Vorname", "Titel",
  "ja", "nein", "Enthaltung", "ungültig", "nichtabgegeben", "Bezeichnung", "Bemerkung"
] as const;

export type OfficialNamedVoteRow = {
  legislativeTerm: string;
  sittingNumber: string;
  voteNumber: string;
  parliamentaryGroup: string | null;
  familyName: string;
  givenName: string;
  actualVote: MemberVote;
  sourceUrl: string;
};

export type ParsedNamedVoteWorkbook = {
  externalVoteId: string;
  legislativeTerm: string;
  sittingNumber: string;
  voteNumber: string;
  rows: OfficialNamedVoteRow[];
  unassignableRows: number;
};

export type OfficialNamedVoteSource = {
  sourceUrl: string;
  resultPdfUrl: string;
  voteDate: string;
  officialTitle: string;
  sourcePageUrl: string;
};

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function cellColumn(reference: string) {
  return reference.replace(/\d+/g, "");
}

function parseSharedStrings(xml: string) {
  return [...xml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((match) =>
    decodeXml([...match[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((text) => text[1]).join(""))
  );
}

function parseSpreadsheetRows(xml: string, sharedStrings: string[]) {
  return [...xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)].map((row) => {
    const cells = new Map<string, string>();
    for (const cell of row[1].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
      const reference = /\br="([A-Z]+\d+)"/.exec(cell[1])?.[1];
      const rawValue = /<v>([\s\S]*?)<\/v>/.exec(cell[2])?.[1] ?? "";
      const inlineValue = /<is>([\s\S]*?)<\/is>/.exec(cell[2])?.[1];
      if (!reference) continue;
      const isSharedString = /\bt="s"/.test(cell[1]);
      const value = isSharedString && /^\d+$/.test(rawValue)
        ? sharedStrings[Number(rawValue)] ?? ""
        : inlineValue
          ? decodeXml([...inlineValue.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((text) => text[1]).join(""))
          : decodeXml(rawValue);
      cells.set(cellColumn(reference), value.trim());
    }
    return cells;
  });
}

function columnIndex(column: string) {
  return column.split("").reduce((total, character) => total * 26 + character.charCodeAt(0) - 64, 0) - 1;
}

function normalizedHeader(value: string) {
  return value.trim().toLocaleLowerCase("de-DE");
}

function officialNumber(value: string | undefined) {
  return value === "1";
}

/** Only an official direct XLSX source is accepted; public list pages, mirrors
 * and user-provided URLs cannot be used as a source for individual votes. */
export function isOfficialNamedVoteXlsxUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:"
      && url.hostname === officialHost
      && /^\/resource\/blob\/\d+\/[A-Za-z0-9_-]+\.xlsx$/i.test(url.pathname)
      && !url.search
      && !url.hash;
  } catch {
    return false;
  }
}

export function mapOfficialNamedVoteCells(headers: string[], values: string[], sourceUrl: string): OfficialNamedVoteRow | null {
  if (!isOfficialNamedVoteXlsxUrl(sourceUrl)) throw new Error("Named vote source must be an official Bundestag XLSX URL.");
  const indexes = new Map(headers.map((header, index) => [normalizedHeader(header), index]));
  const value = (header: string) => values[indexes.get(normalizedHeader(header)) ?? -1]?.trim() ?? "";
  const legislativeTerm = value("Wahlperiode");
  const sittingNumber = value("Sitzungnr");
  const voteNumber = value("Abstimmnr");
  const familyName = value("Name");
  const givenName = value("Vorname");
  if (!legislativeTerm || !sittingNumber || !voteNumber || !familyName || !givenName) return null;

  const selected = [
    officialNumber(value("ja")) ? "YES" : null,
    officialNumber(value("nein")) ? "NO" : null,
    officialNumber(value("Enthaltung")) ? "ABSTENTION" : null,
    officialNumber(value("nichtabgegeben")) ? "DID_NOT_VOTE" : null
  ].filter((vote): vote is MemberVote => vote !== null);
  // A ballot marked invalid or a contradictory source row remains explicitly
  // unresolved.  It must never be silently converted into an absence.
  if (officialNumber(value("ungültig")) || selected.length !== 1) return null;
  return {
    legislativeTerm,
    sittingNumber,
    voteNumber,
    parliamentaryGroup: value("Fraktion/Gruppe") || null,
    familyName,
    givenName,
    actualVote: selected[0],
    sourceUrl
  };
}

export async function parseOfficialNamedVoteWorkbook(sourceUrl: string, file: ArrayBuffer): Promise<ParsedNamedVoteWorkbook> {
  if (!isOfficialNamedVoteXlsxUrl(sourceUrl)) throw new Error("Named vote source must be an official Bundestag XLSX URL.");
  const zip = await JSZip.loadAsync(file);
  const sheetFile = zip.file("xl/worksheets/sheet1.xml");
  if (!sheetFile) throw new Error("Official named vote workbook is missing required worksheet data.");
  const sharedStringsFile = zip.file("xl/sharedStrings.xml");
  const [sharedStringsXml, worksheetXml] = await Promise.all([sharedStringsFile?.async("text") ?? Promise.resolve(""), sheetFile.async("text")]);
  const rows = parseSpreadsheetRows(worksheetXml, sharedStringsXml ? parseSharedStrings(sharedStringsXml) : []);
  const headerCells = rows.shift();
  if (!headerCells) throw new Error("Official named vote workbook has no header row.");
  const headerEntries = [...headerCells.entries()].sort(([left], [right]) => columnIndex(left) - columnIndex(right));
  const headers = headerEntries.map(([, value]) => value);
  if (expectedHeaders.some((header) => !headers.includes(header))) throw new Error("Official named vote workbook schema is not recognized.");

  const parsedRows = rows.map((row) => {
    const values = headerEntries.map(([column]) => row.get(column) ?? "");
    return mapOfficialNamedVoteCells(headers, values, sourceUrl);
  });
  const votes = parsedRows.filter((row): row is OfficialNamedVoteRow => row !== null);
  const first = votes[0];
  if (!first) throw new Error("Official named vote workbook has no assignable vote rows.");
  if (votes.some((vote) => vote.legislativeTerm !== first.legislativeTerm || vote.sittingNumber !== first.sittingNumber || vote.voteNumber !== first.voteNumber)) {
    throw new Error("Official named vote workbook contains more than one vote event.");
  }
  return {
    externalVoteId: `bt${first.legislativeTerm}-s${first.sittingNumber}-a${first.voteNumber}`,
    legislativeTerm: first.legislativeTerm,
    sittingNumber: first.sittingNumber,
    voteNumber: first.voteNumber,
    rows: votes,
    unassignableRows: parsedRows.length - votes.length
  };
}

function toEpochMilliseconds(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Dates must use YYYY-MM-DD.");
  return Date.parse(`${date}T00:00:00.000Z`).toString();
}

function stripMarkup(value: string) {
  return decodeXml(value.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function parseGermanDate(value: string) {
  const match = /^(\d{1,2})\.\s*(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\s+(\d{4})$/i.exec(value.trim());
  if (!match) return null;
  const months = ["januar", "februar", "märz", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "dezember"];
  const month = months.indexOf(match[2].toLocaleLowerCase("de-DE"));
  if (month < 0) return null;
  return `${match[3]}-${String(month + 1).padStart(2, "0")}-${match[1].padStart(2, "0")}`;
}

function sourcesFromListHtml(html: string) {
  const entries = [] as OfficialNamedVoteSource[];
  for (const rowMatch of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const row = rowMatch[1];
    const cells = [...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)];
    const voteDate = cells[0] ? parseGermanDate(stripMarkup(cells[0][1])) : null;
    const xlsx = /https:\/\/www\.bundestag\.de\/resource\/blob\/\d+\/[A-Za-z0-9_-]+\.xlsx/gi.exec(row)?.[0];
    const pdfMatch = /<a\s+href="(https:\/\/www\.bundestag\.de\/resource\/blob\/\d+\/[A-Za-z0-9_-]+\.pdf)"[^>]*>([\s\S]*?)<\/a>/i.exec(row);
    const resultPdfUrl = pdfMatch?.[1];
    const officialTitle = pdfMatch ? stripMarkup(pdfMatch[2]).replace(/^\d{2}\.\d{2}\.\d{4}:\s*/, "") : "";
    if (xlsx && resultPdfUrl && voteDate && officialTitle && isOfficialNamedVoteXlsxUrl(xlsx)) {
      entries.push({ sourceUrl: xlsx, resultPdfUrl, voteDate, officialTitle, sourcePageUrl: "https://www.bundestag.de/parlament/plenum/abstimmung/liste" });
    }
  }
  return entries;
}

/** Lists only sources made available on the Bundestag’s official named-vote
 * index. The caller still validates each downloaded workbook before use. */
export async function listOfficialNamedVoteSources(startDate: string, endDate: string) {
  const sources = new Map<string, OfficialNamedVoteSource>();
  let offset = 0;
  while (true) {
    const url = new URL(listEndpoint);
    url.searchParams.set("offset", String(offset));
    url.searchParams.set("limit", "50");
    url.searchParams.set("startdate", toEpochMilliseconds(startDate));
    url.searchParams.set("startfield", "date");
    url.searchParams.set("enddate", toEpochMilliseconds(endDate));
    url.searchParams.set("endfield", "date");
    const response = await fetch(url, { signal: AbortSignal.timeout(15_000), next: { revalidate: 0 } });
    if (!response.ok) throw new Error(`Bundestag named-vote index request failed with ${response.status}.`);
    const html = await response.text();
    for (const source of sourcesFromListHtml(html)) sources.set(source.sourceUrl, source);
    const loaded = Number(response.headers.get("Loaded-Count") ?? "0");
    const hits = Number(response.headers.get("Hits-Count") ?? "0");
    if (!Number.isFinite(loaded) || loaded <= 0 || offset + loaded >= hits) break;
    offset += loaded;
  }
  return [...sources.values()].sort((left, right) => left.voteDate.localeCompare(right.voteDate) || left.sourceUrl.localeCompare(right.sourceUrl));
}

export async function listOfficialNamedVoteXlsxSources(startDate: string, endDate: string) {
  return (await listOfficialNamedVoteSources(startDate, endDate)).map((source) => source.sourceUrl);
}
