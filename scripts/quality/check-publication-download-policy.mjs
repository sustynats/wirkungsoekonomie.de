import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "assets/data/document-registry.json");
const auditPath = path.join(root, "docs/publication-download-policy-audit.md");
const publicAssetRoots = ["assets/downloads", "public/downloads"];

function rel(file) {
  return path.relative(root, file);
}

function walk(dir, predicate, out = []) {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) return out;
  for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const child = path.join(full, entry.name);
    if (entry.isDirectory()) {
      walk(path.join(dir, entry.name), predicate, out);
    } else if (predicate(child)) {
      out.push(child);
    }
  }
  return out;
}

function isPdfPath(value) {
  return typeof value === "string" && /\.pdf(?:[#?].*)?$/i.test(value);
}

function isDocxSource(document) {
  const sourceFormat = String(document.sourceFormat || "").toLowerCase();
  const importSource = String(document.importSource || "").toLowerCase();
  return sourceFormat === "docx" || sourceFormat === "doc" || /\.(docx|doc)$/i.test(importSource);
}

function fileExistsForUrl(value) {
  if (!value || /^https?:\/\//i.test(value)) return true;
  return fs.existsSync(path.join(root, String(value).replace(/^\/+/, "")));
}

if (!fs.existsSync(registryPath)) {
  console.error("Missing document registry.");
  process.exit(1);
}

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const publicDocuments = registry.filter((document) => document.isPublic !== false);
const findings = [];

for (const document of publicDocuments) {
  const id = document.id || document.slug || document.title || "(ohne id)";
  const publicFormats = (document.publicFormats || []).map((format) => String(format).toLowerCase());
  const hasOnlineFormat = publicFormats.includes("online") || Boolean(document.onlineUrl);
  const hasPdfFormat = publicFormats.includes("pdf");

  if (document.docxUrl) {
    findings.push({ id, severity: "error", issue: "docxUrl ist öffentlich registriert", detail: document.docxUrl });
  }
  if (document.allowPublicDocx === true) {
    findings.push({ id, severity: "error", issue: "allowPublicDocx ist true", detail: "Öffentliche DOCX-Downloads sind nicht erlaubt." });
  }
  if (publicFormats.some((format) => ["doc", "docx", "word"].includes(format))) {
    findings.push({ id, severity: "error", issue: "publicFormats enthält Word/DOCX", detail: publicFormats.join(", ") });
  }
  if (!document.pdfUrl) {
    findings.push({ id, severity: "error", issue: "pdfUrl fehlt", detail: "Jede öffentliche Publikation braucht eine PDF-Fassung." });
  } else {
    if (!isPdfPath(document.pdfUrl)) {
      findings.push({ id, severity: "error", issue: "pdfUrl ist keine PDF-Datei", detail: document.pdfUrl });
    }
    if (!fileExistsForUrl(document.pdfUrl)) {
      findings.push({ id, severity: "error", issue: "PDF-Datei fehlt im Arbeitsbaum", detail: document.pdfUrl });
    }
  }
  if (!hasPdfFormat) {
    findings.push({ id, severity: "error", issue: "publicFormats enthält nicht pdf", detail: publicFormats.join(", ") || "(leer)" });
  }
  if (hasOnlineFormat && !document.onlineUrl) {
    findings.push({ id, severity: "warning", issue: "Onlineformat ohne onlineUrl", detail: "Onlinefassung ist als Format impliziert, aber keine URL ist hinterlegt." });
  }
  if (isDocxSource(document) && !document.pdfUrl) {
    findings.push({ id, severity: "error", issue: "Word-Quelle ohne PDF", detail: document.importSource || document.sourceFormat });
  }
}

const publicDocxAssets = publicAssetRoots
  .flatMap((dir) => walk(dir, (file) => /\.(docx|doc)$/i.test(file)))
  .sort();

for (const asset of publicDocxAssets) {
  findings.push({ id: rel(asset), severity: "error", issue: "Öffentliche Word-Datei im Downloadpfad", detail: "Word/DOCX darf nur interne Quelle sein." });
}

const errors = findings.filter((finding) => finding.severity === "error");
const lines = [
  "# Publication Download Policy Audit",
  "",
  `Stand: ${new Date().toISOString()}`,
  "",
  "## Regel",
  "",
  "- Öffentliche Publikationen werden als Onlinefassung und PDF angeboten.",
  "- Word/DOCX ist nur internes Quellformat.",
  "- Jede Word-Quelle braucht vor Veröffentlichung eine PDF-Fassung, die aus dem Publikationstemplate beziehungsweise dem templategebundenen DOCX gerendert wurde.",
  "- Öffentliche Downloadpfade dürfen keine DOCX-/Word-Dateien enthalten.",
  "",
  "## Zusammenfassung",
  "",
  `- Öffentliche Registry-Dokumente: ${publicDocuments.length}`,
  `- Öffentliche DOCX-/Word-Assets: ${publicDocxAssets.length}`,
  `- Findings: ${findings.length}`,
  `- Fehler: ${errors.length}`,
  "",
  "## Findings",
  "",
];

if (findings.length) {
  lines.push("| Schwere | Dokument / Datei | Problem | Detail |");
  lines.push("| --- | --- | --- | --- |");
  for (const finding of findings) {
    lines.push(`| ${finding.severity} | \`${String(finding.id).replace(/`/g, "\\`")}\` | ${finding.issue} | ${String(finding.detail || "").replace(/\|/g, "\\|")} |`);
  }
} else {
  lines.push("- Keine");
}

fs.writeFileSync(auditPath, `${lines.join("\n")}\n`, "utf8");

if (errors.length) {
  console.error(`Publication download policy failed: ${errors.length} error(s) -> docs/publication-download-policy-audit.md`);
  process.exit(1);
}

console.log(`Publication download policy passed: ${publicDocuments.length} documents, ${publicDocxAssets.length} public Word assets -> docs/publication-download-policy-audit.md`);
