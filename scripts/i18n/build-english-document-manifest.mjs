import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DOCUMENTS_PATH = path.join(ROOT, "content/documents/documents.json");
const PUBLIC_PDF_DOWNLOADS_PATH = path.join(ROOT, "public/data/public-pdf-downloads.json");
const OUT_JSON = path.join(ROOT, "public/data/en-document-translation-manifest.json");
const OUT_MD = path.join(ROOT, "docs/english-document-translation-plan.md");

const PUBLIC_EXTENSIONS = new Set([".pdf", ".pptx", ".xlsx"]);
const EXCLUDED_PATTERNS = [
  /^assets\/downloads\/zertifikate\//i,
  /^outputs\//i,
  /^content\/internal-documents\//i,
  /^templates\//i,
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function existsFile(relPath) {
  return Boolean(relPath) && fs.existsSync(path.join(ROOT, relPath)) && fs.statSync(path.join(ROOT, relPath)).isFile();
}

function walk(dir) {
  if (!fs.existsSync(path.join(ROOT, dir))) return [];
  const entries = [];
  const base = path.join(ROOT, dir);
  const visit = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      const rel = path.relative(ROOT, full).replace(/\\/g, "/");
      if (entry.isDirectory()) {
        if (entry.name === "en") continue;
        visit(full);
        continue;
      }
      if (!entry.isFile()) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (!PUBLIC_EXTENSIONS.has(ext)) continue;
      if (EXCLUDED_PATTERNS.some((pattern) => pattern.test(rel))) continue;
      entries.push(rel);
    }
  };
  visit(base);
  return entries;
}

function normalizeKey(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+2(?=\.[a-z0-9]+$)/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function englishTargetFor(sourcePath) {
  const ext = path.extname(sourcePath);
  const dir = path.dirname(sourcePath).replace(/\\/g, "/");
  const base = path.basename(sourcePath, ext);
  if (sourcePath.startsWith("public/downloads/")) {
    const rest = sourcePath.slice("public/downloads/".length);
    const restDir = path.dirname(rest).replace(/\\/g, "/");
    const targetDir = restDir === "." ? "public/downloads/en" : `public/downloads/en/${restDir}`;
    return `${targetDir}/${base}.en${ext}`;
  }
  if (sourcePath.startsWith("assets/downloads/")) {
    const rest = sourcePath.slice("assets/downloads/".length);
    const restDir = path.dirname(rest).replace(/\\/g, "/");
    const targetDir = restDir === "." ? "assets/downloads/en" : `assets/downloads/en/${restDir}`;
    return `${targetDir}/${base}.en${ext}`;
  }
  if (sourcePath.startsWith("assets/pdf/")) {
    const rest = sourcePath.slice("assets/pdf/".length);
    const restDir = path.dirname(rest).replace(/\\/g, "/");
    const targetDir = restDir === "." ? "assets/pdf/en" : `assets/pdf/en/${restDir}`;
    return `${targetDir}/${base}.en${ext}`;
  }
  if (sourcePath.startsWith("docs/studienskripte/")) {
    const rest = sourcePath.slice("docs/studienskripte/".length);
    const restDir = path.dirname(rest).replace(/\\/g, "/");
    const targetDir = restDir === "." ? "docs/studienskripte/en" : `docs/studienskripte/en/${restDir}`;
    return `${targetDir}/${base}.en${ext}`;
  }
  return `${dir}/en/${base}.en${ext}`;
}

function documentKind(sourcePath) {
  if (sourcePath.startsWith("docs/studienskripte/")) return "study-script";
  if (sourcePath.startsWith("assets/downloads/")) return "download";
  if (sourcePath.startsWith("public/downloads/")) return "public-original";
  if (sourcePath.startsWith("assets/pdf/")) return "pdf-asset";
  return "document";
}

function publicUrlForPath(relPath) {
  return `/${relPath}`;
}

function collectHtmlReferences(paths) {
  const references = new Map(paths.map((item) => [item, []]));
  const pathSet = new Set(paths);
  const htmlFiles = walkHtml(ROOT);
  for (const file of htmlFiles) {
    const relHtml = path.relative(ROOT, file).replace(/\\/g, "/");
    if (relHtml.startsWith("en/")) continue;
    const html = fs.readFileSync(file, "utf8");
    for (const sourcePath of referencedDownloadPaths(html)) {
      if (!pathSet.has(sourcePath)) continue;
      references.get(sourcePath).push(relHtml);
    }
  }
  return references;
}

function referencedDownloadPaths(html) {
  const paths = new Set();
  const attributePattern = /\b(?:href|src)=["']([^"']+)["']/gi;
  let match;
  while ((match = attributePattern.exec(html))) {
    const normalized = normalizeReferencedPath(match[1]);
    if (normalized) paths.add(normalized);
  }
  return paths;
}

function normalizeReferencedPath(value = "") {
  let candidate = String(value).split("#")[0].split("?")[0];
  if (!candidate) return "";
  try {
    candidate = decodeURIComponent(candidate);
  } catch {
    // Keep the original candidate when malformed escaping appears in static HTML.
  }
  candidate = candidate.replace(/^https?:\/\/(?:www\.)?wirkungsoekonomie\.de\//i, "");
  candidate = candidate.replace(/^\/+/, "");
  while (candidate.startsWith("../")) candidate = candidate.slice(3);
  if (!/^(assets\/downloads|assets\/pdf|public\/downloads)\//i.test(candidate)) return "";
  return candidate;
}

function walkHtml(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", "node_modules", "outputs"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkHtml(full));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

function translationStatus(targetPath) {
  return existsFile(targetPath) ? "available" : "missing";
}

function priorityFor(item) {
  if (item.libraryVisibility === "public" || item.libraryVisibility === "expert_public") return "P0";
  if (item.kind === "study-script") return "P1";
  if (item.referencedBy.length > 0) return "P1";
  return "P2";
}

function targetContentRule(ext) {
  if (ext === ".pdf") return "Translate all selectable document text; keep raster images and image-internal German text unchanged for now.";
  if (ext === ".pptx") return "Translate editable slide text and SVG/text layers; keep raster images and image-internal German text unchanged for now.";
  if (ext === ".xlsx") return "Translate visible labels, sheet names and documentation cells; keep formulas, ids, register keys and data structures stable.";
  return "Translate editable text; keep embedded raster image content unchanged for now.";
}

const documentsRegistry = readJson(DOCUMENTS_PATH).documents || [];
const libraryDocs = new Map();
for (const doc of documentsRegistry) {
  if (!doc.filePath) continue;
  libraryDocs.set(doc.filePath, doc);
}

const inventoryPaths = new Set([
  ...walk("assets/downloads"),
  ...walk("assets/pdf"),
  ...walk("public/downloads"),
  ...walk("docs/studienskripte"),
]);

if (fs.existsSync(PUBLIC_PDF_DOWNLOADS_PATH)) {
  for (const pdf of readJson(PUBLIC_PDF_DOWNLOADS_PATH).pdfs || []) {
    if (pdf.path && !EXCLUDED_PATTERNS.some((pattern) => pattern.test(pdf.path))) inventoryPaths.add(pdf.path);
  }
}

for (const doc of documentsRegistry) {
  if (!doc.filePath) continue;
  if (doc.downloadAllowed === false) continue;
  if (!["public", "expert_public", "archive"].includes(doc.visibility)) continue;
  if (EXCLUDED_PATTERNS.some((pattern) => pattern.test(doc.filePath))) continue;
  inventoryPaths.add(doc.filePath);
}

const allPaths = [...inventoryPaths].sort((a, b) => a.localeCompare(b, "de"));
const references = collectHtmlReferences(allPaths);

const items = allPaths.map((sourcePath) => {
  const libraryDoc = libraryDocs.get(sourcePath);
  const targetPath = englishTargetFor(sourcePath);
  const ext = path.extname(sourcePath).toLowerCase();
  const item = {
    id: libraryDoc?.id || normalizeKey(sourcePath),
    sourcePath,
    englishTargetPath: targetPath,
    sourceUrl: publicUrlForPath(sourcePath),
    englishUrl: publicUrlForPath(targetPath),
    fileType: ext.slice(1),
    kind: documentKind(sourcePath),
    titleDe: libraryDoc?.title || path.basename(sourcePath, ext),
    titleEn: libraryDoc?.titleEn || "",
    libraryVisibility: libraryDoc?.visibility || "",
    librarySection: libraryDoc?.section || "",
    downloadAllowed: libraryDoc ? libraryDoc.downloadAllowed !== false : true,
    referencedBy: references.get(sourcePath) || [],
    status: translationStatus(targetPath),
    contentRule: targetContentRule(ext),
  };
  item.priority = priorityFor(item);
  return item;
});

const counts = {
  total: items.length,
  available: items.filter((item) => item.status === "available").length,
  missing: items.filter((item) => item.status === "missing").length,
  p0: items.filter((item) => item.priority === "P0").length,
  p1: items.filter((item) => item.priority === "P1").length,
  p2: items.filter((item) => item.priority === "P2").length,
  library: items.filter((item) => item.libraryVisibility === "public" || item.libraryVisibility === "expert_public").length,
  studyScripts: items.filter((item) => item.kind === "study-script").length,
};

const manifest = {
  schemaVersion: "2026-07-english-download-documents",
  generatedAt: new Date().toISOString().slice(0, 10),
  locale: "en",
  targetBaseRule: "English downloadable document variants live next to public download roots under an en/ subfolder and use the .en file-name suffix.",
  imagePolicy: "Raster images and German text embedded inside raster images remain unchanged for the first English release. SVG and editable text layers may be translated.",
  routingPolicy: "English pages must prefer englishUrl when status is available. If status is missing, English pages should not silently label the German source as English.",
  counts,
  items,
};

fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
fs.writeFileSync(OUT_JSON, `${JSON.stringify(manifest, null, 2)}\n`);

const p0Rows = items
  .filter((item) => item.priority === "P0")
  .map((item) => `| ${item.status} | ${item.titleDe.replaceAll("|", "\\|")} | \`${item.sourcePath}\` | \`${item.englishTargetPath}\` |`)
  .join("\n");

const md = `# English Download Document Translation Plan

Generated by \`scripts/i18n/build-english-document-manifest.mjs\`.

## Policy

- English website pages use English document variants for downloads.
- Raster images and German text embedded inside raster images remain unchanged for the first English release.
- SVGs, editable text layers, selectable PDF text, slide text and spreadsheet labels may be translated.
- German source URLs remain unchanged.
- English variants are stored below an \`en/\` folder inside the existing public download root and use a \`.en\` suffix.
- English pages must not present a German source file as an English download.

## Inventory

- Total public downloadable document candidates: ${counts.total}
- Already available in English target paths: ${counts.available}
- Missing English variants: ${counts.missing}
- P0 library downloads: ${counts.p0}
- P1 referenced downloads and study scripts: ${counts.p1}
- P2 remaining public download files: ${counts.p2}

## P0 Library Downloads

| Status | German title | Source | English target |
| --- | --- | --- | --- |
${p0Rows}
`;

fs.mkdirSync(path.dirname(OUT_MD), { recursive: true });
fs.writeFileSync(OUT_MD, md);

console.log(`English document manifest written: ${counts.total} files (${counts.p0} P0, ${counts.p1} P1, ${counts.p2} P2).`);
