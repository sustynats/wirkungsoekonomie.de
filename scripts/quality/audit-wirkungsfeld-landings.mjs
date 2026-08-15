import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = path.join(ROOT, "docs/landing-page-audit.md");

const blocked = [
  "Portaltext",
  "Portalstruktur",
  "Publikationszugang",
  "Online-Volltext",
  "Online lesen und herunterladen",
  "Detailkonzept + Dossier",
  "Einzeldossier-Set",
  "Export und Archiv",
  "kanonisch",
  "kanonische",
  "Kanonisch",
  "Spezifikation online",
  "Konzept vorhanden",
  "in Ausarbeitung",
  "Tool-Spezifikation",
  "Inputs",
  "Outputs",
];

function stripNonVisible(html) {
  return html
    .replace(/<head[\s\S]*?<\/head>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ");
}

function textContext(text, index, length) {
  return text
    .slice(Math.max(0, index - 80), Math.min(text.length, index + length + 80))
    .replace(/\s+/g, " ")
    .trim();
}

function landingFiles() {
  const fieldRoot = path.join(ROOT, "wirkungsfelder");
  const files = [path.join(fieldRoot, "index.html")];
  if (!fs.existsSync(fieldRoot)) return files.filter(fs.existsSync);
  for (const entry of fs.readdirSync(fieldRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = path.join(fieldRoot, entry.name, "index.html");
    if (fs.existsSync(file)) files.push(file);
  }
  return files;
}

const findings = [];
for (const file of landingFiles()) {
  const html = stripNonVisible(fs.readFileSync(file, "utf8"));
  for (const term of blocked) {
    const needle = term.toLowerCase();
    let start = 0;
    while (true) {
      const index = html.toLowerCase().indexOf(needle, start);
      if (index === -1) break;
      findings.push({
        file: path.relative(ROOT, file),
        term,
        context: textContext(html, index, term.length),
      });
      start = index + term.length;
    }
  }
}

const lines = [
  "# Landingpage-Audit Wirkungsfelder",
  "",
  `Stand: ${new Date().toISOString()}`,
  "",
  `Geprüfte Seiten: ${landingFiles().length}`,
  `Treffer: ${findings.length}`,
  "",
];

if (findings.length) {
  lines.push("| Datei | Begriff | Kontext |", "| --- | --- | --- |");
  for (const finding of findings) {
    lines.push(`| ${finding.file} | ${finding.term} | ${finding.context.replace(/\|/g, "\\|")} |`);
  }
} else {
  lines.push("Keine sichtbaren Sperrbegriffe auf Wirkungsfeld-Landingpages gefunden.");
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${lines.join("\n")}\n`, "utf8");

if (findings.length) {
  console.error(`Landingpage audit failed with ${findings.length} findings. See docs/landing-page-audit.md.`);
  process.exit(1);
}

console.log(`Landingpage audit passed for ${landingFiles().length} pages.`);
