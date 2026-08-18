import "server-only";

import { createHash } from "node:crypto";
import programmeRegistry from "@/data/autopilot/programme-source-registry.json";
import { downloadDropboxTextIfPresent, uploadDropboxBytes, uploadDropboxText } from "@/lib/dropbox/app-client";

type ProgrammeSource = (typeof programmeRegistry.sources)[number];
type ProgrammeLedgerEntry = {
  programme_source_id: string;
  version: number;
  content_hash: string;
  archived_at: string;
  archive_path: string;
  resolved_source_url: string;
  content_type: string;
};
type ProgrammeLedger = { schema_version: string; updated_at: string; entries: ProgrammeLedgerEntry[] };

const root = "/WÖK/WOEK-LAENDER-DAILY";
const ledgerPath = `${root}/ledgers/programme-source-ledger.json`;

function hash(bytes: Uint8Array) {
  return createHash("sha256").update(bytes).digest("hex");
}

function extension(contentType: string, sourceUrl: string) {
  if (/pdf/i.test(contentType) || /\.pdf(?:$|\?)/i.test(sourceUrl)) return "pdf";
  if (/html/i.test(contentType)) return "html";
  if (/json/i.test(contentType)) return "json";
  return "bin";
}

function pdfLinkFromHtml(content: string, sourceUrl: string) {
  const matches = [...content.matchAll(/href=["']([^"']+\.pdf(?:\?[^"']*)?)["']/gi)];
  for (const match of matches) {
    try {
      return new URL(match[1], sourceUrl).toString();
    } catch {
      // Continue to the next official-page link.
    }
  }
  return null;
}

async function fetchOriginal(source: ProgrammeSource) {
  if (!source.source_url) return { status: "SOURCE_URL_REQUIRED" as const, source };
  const headers = { "user-agent": "Institut-fuer-Wirkungsoekonomie-Programmmonitor/2.0 (+https://parlament.wirkungsoekonomie.de/transparenz)" };
  const first = await fetch(source.source_url, { redirect: "follow", cache: "no-store", headers, signal: AbortSignal.timeout(25_000) });
  if (!first.ok) return { status: "SOURCE_FETCH_FAILED" as const, source, reason: `HTTP ${first.status}` };
  let bytes = new Uint8Array(await first.arrayBuffer());
  let contentType = first.headers.get("content-type") ?? "application/octet-stream";
  let resolvedSourceUrl = first.url || source.source_url;
  if (bytes.byteLength > 30 * 1024 * 1024) return { status: "SOURCE_TOO_LARGE" as const, source, reason: `${bytes.byteLength} bytes` };
  if (/html/i.test(contentType)) {
    const html = new TextDecoder("utf-8").decode(bytes);
    const pdfUrl = pdfLinkFromHtml(html, resolvedSourceUrl);
    if (pdfUrl) {
      const pdf = await fetch(pdfUrl, { redirect: "follow", cache: "no-store", headers, signal: AbortSignal.timeout(30_000) });
      if (pdf.ok) {
        const candidate = new Uint8Array(await pdf.arrayBuffer());
        if (candidate.byteLength <= 30 * 1024 * 1024) {
          bytes = candidate;
          contentType = pdf.headers.get("content-type") ?? "application/pdf";
          resolvedSourceUrl = pdf.url || pdfUrl;
        }
      }
    }
  }
  return { status: "FETCHED" as const, source, bytes, contentType, resolvedSourceUrl, contentHash: hash(bytes) };
}

function deliveryBase(source: ProgrammeSource, date: string, slot: "AM" | "PM", version: number) {
  return `${root}/DELIVERIES/${source.jurisdiction_id}/${date}-${slot}/PROGRAMMES/${source.party_id}/v${version}`;
}

export async function processStateProgrammeMonitor(args: { now: Date; date: string; slot: "AM" | "PM" }) {
  const existingText = await downloadDropboxTextIfPresent(ledgerPath);
  const ledger: ProgrammeLedger = existingText ? JSON.parse(existingText) as ProgrammeLedger : { schema_version: "2.0", updated_at: args.now.toISOString(), entries: [] };
  const deltas: Array<Record<string, unknown>> = [];
  const issues: Array<Record<string, unknown>> = [];
  for (const source of programmeRegistry.sources) {
    let fetched: Awaited<ReturnType<typeof fetchOriginal>>;
    try {
      fetched = await fetchOriginal(source);
    } catch (error) {
      issues.push({ programme_source_id: source.programme_source_id, jurisdiction_id: source.jurisdiction_id, code: "SOURCE_FETCH_FAILED", detail: error instanceof Error ? error.message : "Unbekannter Abruffehler" });
      continue;
    }
    if (fetched.status !== "FETCHED") {
      issues.push({ programme_source_id: source.programme_source_id, jurisdiction_id: source.jurisdiction_id, code: fetched.status, detail: "reason" in fetched ? fetched.reason : "Eine finale Original-URL muss fachlich/technisch bestätigt werden." });
      continue;
    }
    const priorEntries = ledger.entries.filter((entry) => entry.programme_source_id === source.programme_source_id).sort((a, b) => b.version - a.version);
    const prior = priorEntries[0];
    if (prior?.content_hash === fetched.contentHash) continue;
    const version = (prior?.version ?? 0) + 1;
    const archivePath = `${root}/ARCHIVE/PROGRAMMES/${source.jurisdiction_id}/${source.party_id}/${fetched.contentHash}.${extension(fetched.contentType, fetched.resolvedSourceUrl)}`;
    await uploadDropboxBytes(archivePath, fetched.bytes);
    const base = deliveryBase(source, args.date, args.slot, version);
    const delivery = {
      document_id: `${source.programme_source_id}-v${version}`,
      party_id: source.party_id,
      jurisdiction_id: source.jurisdiction_id,
      election_cycle_id: source.election_cycle_id,
      version: String(version),
      document_status: source.document_status,
      publication_date: source.publication_date,
      retrieved_at: args.now.toISOString(),
      source_url: source.source_url,
      resolved_source_url: fetched.resolvedSourceUrl,
      content_hash: fetched.contentHash,
      content_type: fetched.contentType,
      archive_path: archivePath,
      supersedes_document_id: prior ? `${source.programme_source_id}-v${prior.version}` : null,
      extraction_status: "ORIGINAL_ARCHIVED_COMMITMENTS_NOT_EXTRACTED",
      impact_analysis_created: false,
    };
    const json = `${JSON.stringify(delivery, null, 2)}\n`;
    const sourceMd = `# Programmquelle ${source.party_name}\n\n- Land: ${source.jurisdiction_id}\n- Wahlzyklus: ${source.election_cycle_id}\n- Dokument: ${source.title}\n- Fassung: ${version}\n- Status: ${source.document_status}\n- Originalquelle: ${source.source_url}\n- Aufgelöste Dokument-URL: ${fetched.resolvedSourceUrl}\n- SHA-256: ${fetched.contentHash}\n- Abruf: ${args.now.toISOString()}\n\nDie Originalfassung ist unverändert archiviert. Diese technische Übergabe enthält noch keine WÖk-Wirkungsbewertung.\n`;
    await uploadDropboxText(`${base}/PROGRAMME-DELIVERY-${source.jurisdiction_id}-${source.party_id}-v${version}.json`, json);
    await uploadDropboxText(`${base}/PROGRAMME-SOURCE-${source.jurisdiction_id}-${source.party_id}-v${version}.md`, sourceMd);
    const manifest = { programme_source_id: source.programme_source_id, version, content_hash: fetched.contentHash, files: [{ name: "delivery", sha256: hash(new TextEncoder().encode(json)) }, { name: "source", sha256: hash(new TextEncoder().encode(sourceMd)) }] };
    const manifestText = `${JSON.stringify(manifest, null, 2)}\n`;
    await uploadDropboxText(`${base}/MANIFEST.json`, manifestText);
    await uploadDropboxText(`${base}/READY.json`, `${JSON.stringify({ ready_at: args.now.toISOString(), manifest_sha256: hash(new TextEncoder().encode(manifestText)), fach_analysis_created: false }, null, 2)}\n`);
    ledger.entries.push({ programme_source_id: source.programme_source_id, version, content_hash: fetched.contentHash, archived_at: args.now.toISOString(), archive_path: archivePath, resolved_source_url: fetched.resolvedSourceUrl, content_type: fetched.contentType });
    deltas.push({ change_type: prior ? "UPDATED" : "NEW", ...delivery });
  }
  ledger.updated_at = args.now.toISOString();
  await uploadDropboxText(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`);
  return { status: issues.length ? "DEGRADED" as const : "OK" as const, deltas, issues };
}
