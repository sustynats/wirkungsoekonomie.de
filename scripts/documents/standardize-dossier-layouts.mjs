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
const explicitFiles = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const dryRun = process.argv.includes("--dry-run");
const reportPath = path.join(repoRoot, "layout-standardization-report.md");
const candidatesPath = path.join(repoRoot, "docs", "document-standardization-candidates.md");
const referenceDoc = path.join(repoRoot, "templates", "word", "woek-reference.docx");
const legacyReferenceDoc = path.join(repoRoot, "templates", "WOeK_Dossier_Konzept_Referenztemplate.docx");
const signet = path.join(repoRoot, "templates", "assets", "woek-signet.png");
const outDir = path.join(repoRoot, "dist", "documents");
const comparisonDir = path.join(outDir, "reports");
const fallbackScript = path.join(repoRoot, "scripts", "documents", "markdown_to_docx_fallback.py");
const compareScript = path.join(repoRoot, "scripts", "documents", "compare-document-text.py");
const bundledPython = "/Users/hagen/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3";
const pythonBin = process.env.PYTHON_BIN || (fs.existsSync(bundledPython) ? bundledPython : "python3");

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "__pycache__") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(md|markdown|docx)$/i.test(entry.name)) out.push(full);
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

function readMeta(file) {
  if (/\.(md|markdown)$/i.test(file)) {
    return parseFrontmatter(fs.readFileSync(file, "utf8"));
  }
  return {};
}

function docType(meta) {
  return String(meta.type || meta.document_type || meta.documentType || meta.dokumenttyp || "").trim().toLowerCase();
}

function titleOf(file, meta) {
  if (meta.title) return String(meta.title);
  if (/\.(md|markdown)$/i.test(file)) {
    const text = fs.readFileSync(file, "utf8");
    const heading = text.match(/^#\s+(.+)$/m);
    if (heading) return heading[1].trim();
  }
  return path.basename(file);
}

function commandResult(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
    ...options,
  });
}

function resolvePandoc() {
  const candidates = [];
  if (process.env.PANDOC_BIN) candidates.push(process.env.PANDOC_BIN);
  candidates.push("pandoc");
  for (const candidate of candidates) {
    const result = commandResult(candidate, ["--version"]);
    if (result.status === 0) {
      const versionLine = (result.stdout || "").split(/\r?\n/)[0] || "pandoc";
      return { available: true, bin: candidate, version: versionLine };
    }
  }
  return { available: false, bin: process.env.PANDOC_BIN || "pandoc", version: "" };
}

function inspectReference() {
  if (!fs.existsSync(referenceDoc)) {
    return {
      exists: false,
      path: referenceDoc,
      fileType: path.extname(referenceDoc).slice(1),
      usableAsReferenceDoc: false,
      styles: {},
    };
  }
  const result = commandResult(pythonBin, [
    fallbackScript,
    "--inspect-reference",
    "--reference-doc",
    referenceDoc,
  ]);
  if (result.status !== 0) {
    return {
      exists: true,
      path: referenceDoc,
      fileType: path.extname(referenceDoc).slice(1),
      usableAsReferenceDoc: path.extname(referenceDoc).toLowerCase() === ".docx",
      styles: {},
      error: (result.stderr || result.stdout || "").trim(),
    };
  }
  return { exists: true, ...JSON.parse(result.stdout) };
}

function fallbackAvailable() {
  if (!fs.existsSync(fallbackScript)) return { available: false, reason: "Fallback-Skript fehlt." };
  const result = commandResult(pythonBin, ["-c", "import docx; print(docx.__version__)"]);
  if (result.status !== 0) return { available: false, reason: (result.stderr || result.stdout).trim() };
  return { available: true, version: (result.stdout || "").trim(), bin: pythonBin };
}

function ensureReferenceCopy() {
  if (fs.existsSync(referenceDoc)) return;
  if (!fs.existsSync(legacyReferenceDoc)) return;
  fs.mkdirSync(path.dirname(referenceDoc), { recursive: true });
  fs.copyFileSync(legacyReferenceDoc, referenceDoc);
}

function outputName(file) {
  return path.basename(file).replace(/\.(md|markdown|docx)$/i, "").replace(/[^A-Za-z0-9._-]+/g, "_");
}

function runPandoc(pandoc, input, output) {
  return commandResult(pandoc.bin, [
    "--from",
    "markdown",
    "--to",
    "docx",
    "--reference-doc",
    referenceDoc,
    "--output",
    output,
    input,
  ]);
}

function runFallback(input, output) {
  return commandResult(pythonBin, [
    fallbackScript,
    input,
    output,
    "--reference-doc",
    referenceDoc,
    "--signet",
    signet,
  ]);
}

function runComparison(input, output, report) {
  return commandResult(pythonBin, [compareScript, input, output, "--report", report]);
}

function classify(file) {
  const rel = path.relative(repoRoot, file);
  const ext = path.extname(file).toLowerCase();
  const exists = fs.existsSync(file);
  if (!exists) {
    return { file, rel, title: rel, type: "unbekannt", marked: false, decision: "blockiert", reason: "Datei nicht gefunden." };
  }
  const meta = readMeta(file);
  const type = docType(meta);
  const title = titleOf(file, meta);
  const marked = meta.standardize_layout === true || meta.standardize_layout === "true";
  if (!marked) {
    return { file, rel, title, type: type || "-", marked, decision: "übersprungen", reason: "standardize_layout ist nicht true." };
  }
  if (excludedTypes.has(type)) {
    return { file, rel, title, type, marked, decision: "übersprungen", reason: "Dokumenttyp ist explizit ausgeschlossen." };
  }
  if (!allowedTypes.has(type)) {
    return { file, rel, title, type: type || "unbekannt", marked, decision: "blockiert", reason: "Dokumenttyp ist nicht im erlaubten Scope." };
  }
  if (ext !== ".md" && ext !== ".markdown" && ext !== ".docx") {
    return { file, rel, title, type, marked, decision: "blockiert", reason: "Format wird nicht unterstützt." };
  }
  return { file, rel, title, type, marked, decision: "verarbeitet", reason: "Freigegeben." };
}

ensureReferenceCopy();

const pandoc = resolvePandoc();
const fallback = fallbackAvailable();
const reference = inspectReference();
const files = explicitFiles.length ? explicitFiles.map((file) => path.resolve(file)) : roots.flatMap((root) => walk(path.join(repoRoot, root)));
const candidates = files.map(classify);
const markedCandidates = candidates.filter((item) => item.marked);
const allowedCandidates = candidates.filter((item) => item.decision === "verarbeitet");
const skippedCandidates = candidates.filter((item) => item.decision === "übersprungen");
const blockedCandidates = candidates.filter((item) => item.decision === "blockiert");
const processed = [];
const review = [];
const blocked = [];

if (!reference.exists) {
  blocked.push({ file: "templates/word/woek-reference.docx", reason: "Referenzlayout fehlt." });
}
if (reference.exists && !reference.usableAsReferenceDoc) {
  blocked.push({ file: path.relative(repoRoot, reference.path), reason: "Referenzlayout ist keine DOCX-Datei." });
}

const converterAvailable = pandoc.available || fallback.available;
if (!converterAvailable) {
  blocked.push({ file: pandoc.bin, reason: `Pandoc fehlt und Fallback ist nicht verfügbar: ${fallback.reason || "unbekannt"}` });
}

if (!dryRun && reference.exists && reference.usableAsReferenceDoc && converterAvailable) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(comparisonDir, { recursive: true });
}

for (const item of allowedCandidates) {
  const ext = path.extname(item.file).toLowerCase();
  if (dryRun) {
    review.push({ ...item, reason: "Dry-run: nicht geschrieben." });
    continue;
  }
  if (!reference.exists || !reference.usableAsReferenceDoc || !converterAvailable) {
    blocked.push({ ...item, reason: "Technischer Blocker: Referenzlayout oder Konverter fehlt." });
    continue;
  }
  if (ext === ".docx") {
    review.push({ ...item, conversion: "DOCX -> DOCX", reason: "DOCX-zu-DOCX-Standardisierung ist getrennt auszuarbeiten und wurde nicht ohne gesonderten Inhaltsschutz ausgeführt." });
    continue;
  }

  const output = path.join(outDir, `${outputName(item.file)}.docx`);
  const comparisonReport = path.join(comparisonDir, `${outputName(item.file)}.comparison.md`);
  const conversion = pandoc.available ? runPandoc(pandoc, item.file, output) : runFallback(item.file, output);
  const converter = pandoc.available ? "pandoc" : "python-docx-fallback";
  if (conversion.status !== 0) {
    review.push({ ...item, conversion: "Markdown -> DOCX", converter, reason: `Konvertierung fehlgeschlagen: ${(conversion.stderr || conversion.stdout || "").trim()}` });
    continue;
  }

  const comparison = runComparison(item.file, output, comparisonReport);
  const comparisonPassed = comparison.status === 0;
  const result = {
    ...item,
    conversion: "Markdown -> DOCX",
    converter,
    output: path.relative(repoRoot, output),
    comparisonReport: path.relative(repoRoot, comparisonReport),
    comparisonPassed,
  };
  if (comparisonPassed) processed.push(result);
  else review.push({ ...result, reason: "Textvergleich nicht bestanden." });
}

for (const item of blockedCandidates) blocked.push(item);

function table(rows) {
  if (!rows.length) return "Keine.";
  return [
    "| Datei | Typ | Entscheidung | Grund |",
    "| --- | --- | --- | --- |",
    ...rows.map((item) => `| \`${item.rel || item.file}\` | ${item.type || "-"} | ${item.decision || "-"} | ${String(item.reason || "").replace(/\|/g, "\\|")} |`),
  ].join("\n");
}

const candidateLines = [
  "# Document Standardization Candidates",
  "",
  `Stand: ${new Date().toISOString()}`,
  "",
  `Gefundene Dateien: ${candidates.length}`,
  `Markierte Kandidaten: ${markedCandidates.length}`,
  `Erlaubte Kandidaten: ${allowedCandidates.length}`,
  `Übersprungene Kandidaten: ${skippedCandidates.length}`,
  `Blockierte Kandidaten: ${blockedCandidates.length}`,
  "",
  "## Markierte und erlaubte Kandidaten",
  "",
  table(allowedCandidates),
  "",
  "## Markierte, aber blockierte Kandidaten",
  "",
  table(blockedCandidates),
  "",
  "## Übersprungene Dateien",
  "",
  table(skippedCandidates),
  "",
];
fs.mkdirSync(path.dirname(candidatesPath), { recursive: true });
fs.writeFileSync(candidatesPath, candidateLines.join("\n"), "utf8");

const generatedCount = processed.length + review.filter((item) => item.output).length;
const passedCount = processed.length;
const failedCount = review.filter((item) => item.comparisonPassed === false).length;
let status = "STANDARDISIERT";
let statusReason = "Mindestens eine Datei wurde standardisiert und der Textvergleich wurde bestanden.";
if (!converterAvailable) {
  status = "BLOCKIERT";
  statusReason = "Pandoc fehlt und es ist kein funktionierender Ersatz verfügbar.";
} else if (!reference.exists || !reference.usableAsReferenceDoc) {
  status = "BLOCKIERT";
  statusReason = "Referenzlayout fehlt oder ist nicht als DOCX verwendbar.";
} else if (!markedCandidates.length) {
  status = "KEINE ZIELOBJEKTE";
  statusReason = "Es wurden keine Dateien mit standardize_layout: true gefunden.";
} else if (!allowedCandidates.length) {
  status = "BLOCKIERT";
  statusReason = "Es wurden markierte Dateien gefunden, aber keine davon ist im erlaubten Scope.";
} else if (!processed.length && review.length) {
  status = "REVIEW-PFLICHTIG";
  statusReason = "Es wurden Kandidaten verarbeitet oder geprüft, aber keine Datei wurde freigegeben.";
}

const styles = reference.styles || {};
const requiredStyles = [
  "Title",
  "Subtitle",
  "Heading 1",
  "Heading 2",
  "Heading 3",
  "Normal",
  "Quote",
  "List Paragraph",
  "Caption",
  "Table Text",
  "Footer",
  "Header",
];

const lines = [
  "# Layout Standardization Report",
  "",
  `Stand: ${new Date().toISOString()}`,
  "",
  `## Status: ${status}`,
  "",
  statusReason,
  "",
  "## Preflight",
  "",
  `- Referenzlayout vorhanden: ${reference.exists ? "ja" : "nein"}`,
  `- Referenzlayout: \`${path.relative(repoRoot, reference.path || referenceDoc)}\``,
  `- Referenzlayout-Dateityp: ${reference.fileType || "unbekannt"}`,
  `- Als Pandoc-reference-doc verwendbar: ${reference.usableAsReferenceDoc ? "ja" : "nein"}`,
  `- Pandoc vorhanden: ${pandoc.available ? "ja" : "nein"}`,
  `- Pandoc-Pfad: \`${pandoc.bin}\``,
  `- Pandoc-Version: ${pandoc.version || "-"}`,
  `- Python-Fallback vorhanden: ${fallback.available ? "ja" : "nein"}`,
  `- Python-Fallback: ${fallback.available ? `${fallback.bin} / python-docx ${fallback.version}` : fallback.reason || "-"}`,
  `- Kandidaten gefunden: ${markedCandidates.length}`,
  `- Kandidaten erlaubt: ${allowedCandidates.length}`,
  `- Kandidaten übersprungen: ${skippedCandidates.length}`,
  `- Kandidaten blockiert: ${blocked.length}`,
  "",
  "## Geprüfte Word-Styles im Referenzlayout",
  "",
  ...requiredStyles.map((name) => `- ${name}: ${styles[name] ? "vorhanden" : "nicht gefunden"}`),
  "",
  "## Verarbeitung",
  "",
  `- Markdown -> DOCX erzeugt: ${generatedCount}`,
  `- DOCX -> DOCX erzeugt: 0`,
  `- Übersprungene Dateien: ${skippedCandidates.length}`,
  `- Blockierte Dateien: ${blocked.length}`,
  `- Review-pflichtige Dateien: ${review.length}`,
  "",
  "## Inhaltsschutz",
  "",
  `- Textvergleich ausgeführt: ${generatedCount}`,
  `- Textvergleich bestanden: ${passedCount}`,
  `- Textvergleich nicht bestanden: ${failedCount}`,
  "",
  "## Erfolgreich standardisierte Dateien",
  "",
  processed.length
    ? processed.map((item) => `- ${item.title} (${item.type}) - \`${item.rel}\` -> \`${item.output}\` (${item.converter}, Vergleich: \`${item.comparisonReport}\`)`).join("\n")
    : "Keine Dateien wurden freigegeben.",
  "",
  "## Blockierte Dateien und Voraussetzungen",
  "",
  blocked.length
    ? blocked.map((item) => `- ${item.title ? `${item.title} - ` : ""}\`${item.rel || item.file}\`${item.type ? ` (${item.type})` : ""}: ${item.reason}`).join("\n")
    : "Keine blockierten Dateien.",
  "",
  "## Review-pflichtige Dateien",
  "",
  review.length
    ? review.map((item) => `- ${item.title ? `${item.title} - ` : ""}\`${item.rel || item.file}\`${item.type ? ` (${item.type})` : ""}: ${item.reason || "Review erforderlich."}`).join("\n")
    : "Keine review-pflichtigen Dateien.",
  "",
  "## Kandidatenliste",
  "",
  `Details: \`${path.relative(repoRoot, candidatesPath)}\``,
  "",
];

fs.writeFileSync(reportPath, lines.join("\n"), "utf8");
console.log(`Wrote ${path.relative(repoRoot, reportPath)}`);
console.log(`Wrote ${path.relative(repoRoot, candidatesPath)}`);
if (status === "BLOCKIERT" || status === "REVIEW-PFLICHTIG") process.exitCode = 1;
