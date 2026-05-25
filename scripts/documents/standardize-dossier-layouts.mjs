#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const allowedTypes = new Set([
  "arbeitspapier",
  "konzeptpapier",
  "dossier",
  "whitepaper",
  "working-paper",
  "technische-leitlinie",
  "fallstudie",
]);
const excludedTypes = new Set([
  "praesentation",
  "präsentation",
  "foliensatz",
  "buch",
  "buchmanuskript",
  "manifest",
  "minifest",
  "parteiprogramm",
  "presseartikel",
  "gastbeitrag",
  "website",
  "blog",
  "social-media",
]);
const roots = ["docs", "content"];
const reportPath = path.join(repoRoot, "layout-standardization-report.md");
const referenceDoc = path.join(repoRoot, "templates", "WOeK_Dossier_Konzept_Referenztemplate.docx");
const signet = path.join(repoRoot, "templates", "assets", "woek-signet.png");
const outDir = path.join(repoRoot, "exports", "layout-standardized");
const explicitFiles = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const dryRun = process.argv.includes("--dry-run");

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(md|markdown)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

function parseFrontmatter(text) {
  if (!text.startsWith("---")) return {};
  const end = text.indexOf("\n---", 3);
  if (end < 0) return {};
  const block = text.slice(3, end).trim();
  const meta = {};
  for (const line of block.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    const key = match[1].trim();
    let value = match[2].trim().replace(/^["']|["']$/g, "");
    if (/^(true|false)$/i.test(value)) value = /^true$/i.test(value);
    meta[key] = value;
  }
  return meta;
}

function docType(meta) {
  return String(meta.type || meta.document_type || meta.documentType || meta.dokumenttyp || "").trim().toLowerCase();
}

function titleOf(file, text, meta) {
  if (meta.title) return meta.title;
  const heading = text.match(/^#\s+(.+)$/m);
  return heading ? heading[1].trim() : path.basename(file);
}

function hasPandoc() {
  return spawnSync("pandoc", ["--version"], { encoding: "utf8" }).status === 0;
}

function runPandoc(input, output) {
  const args = [
    input,
    "--reference-doc",
    referenceDoc,
    "--toc",
    "-o",
    output,
  ];
  return spawnSync("pandoc", args, { encoding: "utf8" });
}

const files = explicitFiles.length ? explicitFiles.map((file) => path.resolve(file)) : roots.flatMap((root) => walk(path.join(repoRoot, root)));
const templateReady = fs.existsSync(referenceDoc) && fs.existsSync(signet);
const pandocReady = hasPandoc();
const processed = [];
const excluded = [];
const review = [];

if (!templateReady) {
  review.push({
    file: "templates/",
    reason: "Referenz-DOCX oder WÖk-Signet fehlt. Importiere zuerst das Template-Paket.",
  });
}

if (!pandocReady) {
  review.push({
    file: "pandoc",
    reason: "Pandoc ist nicht installiert oder nicht im PATH. Markdown-zu-DOCX-Standardisierung wurde nicht ausgeführt.",
  });
}

if (!dryRun && templateReady && pandocReady) {
  fs.mkdirSync(outDir, { recursive: true });
}

for (const file of files) {
  const rel = path.relative(repoRoot, file);
  if (!fs.existsSync(file)) {
    review.push({ file: rel, reason: "Datei nicht gefunden." });
    continue;
  }
  const text = fs.readFileSync(file, "utf8");
  const meta = parseFrontmatter(text);
  const type = docType(meta);
  const marked = meta.standardize_layout === true || meta.standardize_layout === "true";
  const title = titleOf(file, text, meta);

  if (!marked) {
    continue;
  }
  if (excludedTypes.has(type)) {
    excluded.push({ file: rel, title, type, reason: "Dokumenttyp ist explizit ausgeschlossen." });
    continue;
  }
  if (!allowedTypes.has(type)) {
    review.push({ file: rel, title, type: type || "unbekannt", reason: "standardize_layout ist true, aber der Dokumenttyp ist nicht im Scope." });
    continue;
  }
  if (!templateReady || !pandocReady || dryRun) {
    review.push({ file: rel, title, type, reason: dryRun ? "Dry-run: nicht geschrieben." : "Template oder Pandoc fehlt." });
    continue;
  }

  const safeBase = path.basename(file).replace(/\.(md|markdown)$/i, "").replace(/[^A-Za-z0-9._-]+/g, "_");
  const output = path.join(outDir, `${safeBase}.docx`);
  const pandoc = runPandoc(file, output);
  if (pandoc.status !== 0) {
    review.push({ file: rel, title, type, reason: `Pandoc fehlgeschlagen: ${(pandoc.stderr || pandoc.stdout).trim()}` });
    continue;
  }

  processed.push({ file: rel, title, type, output: path.relative(repoRoot, output) });
}

const lines = [
  "# Layout Standardization Report",
  "",
  `Stand: ${new Date().toISOString()}`,
  "",
  "## Ergebnis",
  "",
  `- Bearbeitet: ${processed.length}`,
  `- Ausgeschlossen: ${excluded.length}`,
  `- Review-pflichtig: ${review.length}`,
  `- Referenzlayout vorhanden: ${templateReady ? "ja" : "nein"}`,
  `- Pandoc vorhanden: ${pandocReady ? "ja" : "nein"}`,
  "",
  "## Bearbeitete Dateien",
  "",
  processed.length
    ? processed.map((item) => `- ${item.title} (${item.type}) - \`${item.file}\` -> \`${item.output}\``).join("\n")
    : "Keine Dateien wurden standardisiert.",
  "",
  "## Ausgeschlossene Dateien",
  "",
  excluded.length
    ? excluded.map((item) => `- ${item.title} (${item.type}) - \`${item.file}\`: ${item.reason}`).join("\n")
    : "Keine ausgeschlossenen markierten Dateien gefunden.",
  "",
  "## Review-pflichtige Dateien und Voraussetzungen",
  "",
  review.length
    ? review.map((item) => `- ${item.title ? `${item.title} - ` : ""}\`${item.file}\`${item.type ? ` (${item.type})` : ""}: ${item.reason}`).join("\n")
    : "Keine offenen Review-Punkte.",
  "",
  "## Inhaltsschutz",
  "",
  "Die Pipeline ist so angelegt, dass nur Dokumente mit `standardize_layout: true` und erlaubtem Dokumenttyp verarbeitet werden. Inhaltliche Änderungen sind nicht erlaubt. Vor Freigabe eines erzeugten DOCX muss `scripts/documents/compare-document-text.py` gegen die Originalfassung laufen.",
  "",
];

fs.writeFileSync(reportPath, lines.join("\n"), "utf8");
console.log(`Wrote ${path.relative(repoRoot, reportPath)}`);
if (review.length && !templateReady) process.exitCode = 1;
