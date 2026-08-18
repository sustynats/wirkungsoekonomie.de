import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import publicationSources from "@/data/generated/release-1/publication-sources.json";

type SourceRecord = { kind: string; sha256: string };

export type CompletePublicationSource = {
  id: string;
  kind: string;
  sourceKey: string | null;
  caseId: string | null;
  title: string;
  renderedRoute: string;
  markdownSha256: string;
  sourceRecords: SourceRecord[];
  terminologyVersion: string;
  verifiedAt: string;
  suppliedContentPathsCount: number;
  overview: unknown;
  markdown: string;
};

type RawSource = {
  id?: unknown;
  kind?: unknown;
  source_key?: unknown;
  case_id?: unknown;
  title?: unknown;
  rendered_route?: unknown;
  markdown_file?: unknown;
  markdown_sha256?: unknown;
  source_records?: unknown;
  terminology_version?: unknown;
  verified_at?: unknown;
  supplied_content_paths_count?: unknown;
  overview?: unknown;
};

const contentDirectory = path.resolve(process.cwd(), "data/fachakten/release-1");
const records = Array.isArray((publicationSources as { documents?: unknown }).documents)
  ? (publicationSources as { documents: RawSource[] }).documents
  : [];

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function sourceRecords(value: unknown): SourceRecord[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const record = item as Record<string, unknown>;
    const kind = text(record.kind);
    const sha256 = text(record.sha256);
    return kind && /^[a-f0-9]{64}$/i.test(sha256) ? [{ kind, sha256 }] : [];
  });
}

async function materialize(record: RawSource): Promise<CompletePublicationSource | null> {
  const relativeFile = text(record.markdown_file);
  if (!relativeFile || relativeFile.includes("..") || path.isAbsolute(relativeFile) || !relativeFile.endsWith(".md")) return null;
  const absoluteFile = path.resolve(contentDirectory, relativeFile);
  if (!absoluteFile.startsWith(`${contentDirectory}${path.sep}`)) return null;
  let markdown: string;
  try {
    markdown = await readFile(absoluteFile, "utf8");
  } catch {
    return null;
  }
  const id = text(record.id);
  const markdownSha256 = text(record.markdown_sha256);
  if (!id || !markdown.trim() || !/^[a-f0-9]{64}$/i.test(markdownSha256)) return null;
  return {
    id,
    kind: text(record.kind),
    sourceKey: text(record.source_key) || null,
    caseId: text(record.case_id) || null,
    title: text(record.title, "Vollständige Fachakte"),
    renderedRoute: text(record.rendered_route),
    markdownSha256,
    sourceRecords: sourceRecords(record.source_records),
    terminologyVersion: text(record.terminology_version, "1.5"),
    verifiedAt: text(record.verified_at),
    suppliedContentPathsCount: Number(record.supplied_content_paths_count) || 0,
    overview: record.overview ?? null,
    markdown
  };
}

async function findOne(predicate: (record: RawSource) => boolean) {
  const record = records.find(predicate);
  return record ? materialize(record) : null;
}

export function allPublicationSourceRecords() {
  return records.map((record) => ({
    id: text(record.id),
    kind: text(record.kind),
    sourceKey: text(record.source_key) || null,
    caseId: text(record.case_id) || null,
    title: text(record.title, "Vollständige Fachakte"),
    renderedRoute: text(record.rendered_route),
    overview: record.overview ?? null
  }));
}

export function getCasePublicationSource(caseId: string) {
  return findOne((record) => text(record.kind) === "PARLIAMENTARY_CASE" && text(record.case_id) === caseId);
}

export function getFederalPublicationSource(sourceKey: string) {
  return findOne((record) => ["FEDERAL_ELECTION_PROGRAMME", "COALITION_AGREEMENT"].includes(text(record.kind)) && text(record.source_key) === sourceKey);
}

export function getSaxonyAnhaltPublicationSources(sourceKey: string) {
  return Promise.all([
    findOne((record) => text(record.kind) === "SAXONY_ANHALT_ELECTION_PROGRAMME_REVIEW" && text(record.source_key) === sourceKey),
    findOne((record) => text(record.kind) === "SAXONY_ANHALT_COMMITMENT_REGISTER" && text(record.source_key) === sourceKey)
  ]);
}

export function getSpecialistPublicationSource(id: string) {
  return findOne((record) => text(record.id) === id && text(record.kind) === "SPECIALIST_ANALYSIS");
}

export function getPublicationSource(id: string) {
  return findOne((record) => text(record.id) === id);
}
