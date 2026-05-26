import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AUDIT_FILE = path.join(ROOT, "docs/public-language-audit.md");

const SCAN_TARGETS = [
  "akademie.html",
  "anwendungen.html",
  "audio",
  "begriffe",
  "blog.html",
  "blog",
  "buch.html",
  "datenschutz.html",
  "dokumente",
  "downloads.html",
  "downloads",
  "erleben.html",
  "erleben",
  "evidenz",
  "fachbibliothek",
  "fuer",
  "funktionsweise",
  "glossar.html",
  "index.html",
  "kompass.html",
  "mehr.html",
  "methodik",
  "mitmachen.html",
  "modell.html",
  "ordnung",
  "portale",
  "referenz",
  "referenzrahmen",
  "suche.html",
  "tools",
  "verstehen",
  "werkstatt",
  "werkzeuge",
  "website-1-0-release",
  "wirkungsoekonomie.html",
  "wirkungsfelder",
  "wissen",
  "workflow.html",
  "assets/downloads",
  "assets/js/main.js",
  "bibliothek/folgencheck-faktencheck",
];

const BLOCKED_TERMS = [
  "kanonisch",
  "kanonische Seitenadresse",
  "Portalstruktur",
  "Portalarchitektur",
  "Portaltext",
  "Tool-Spezifikation",
  "Inputs",
  "Outputs",
  "Website-Integration",
  "Nächster Entwicklungsschritt",
  "Demo in Vorbereitung",
  "Konzept vorhanden",
  "Spezifikation online",
  "Grundstruktur vorhanden",
  "Working Paper vorhanden",
  "v0.1",
  "Arbeitsfassung im Hauptbereich",
  "Detailkonzept + Dossier",
  "Einzeldossier-Set",
  "online zitierfähig als CTA",
  "Export und Archiv im Einstieg",
  "DOCX herunterladen",
  "Word herunterladen",
  "Dokument als Word",
  "Word-Version",
  "Word-Datei",
  "Word-Export",
  "Arbeitsfassung herunterladen",
  "Dokument bearbeiten",
  "Dateiformat DOCX",
  "Dateiformat Word",
  "Konzept-Download",
  "Detail-Download",
  "Dossier-Download",
  "Weiterarbeit",
  "PDF und DOCX",
  "PDF/DOCX",
  "DOCX",
];

const TECHNICAL_CANONICAL_RE = /<link\b[^>]*rel=["']canonical["'][^>]*>/gi;
const PUBLIC_DOCX_EXCEPTION_RE = /folgencheck|faktencheck|WOeK_Folgencheck_und_Faktencheck/i;
const PUBLIC_DOCX_TERMS = new Set([
  "DOCX herunterladen",
  "Word herunterladen",
  "Dokument als Word",
  "Word-Version",
  "Word-Datei",
  "Word-Export",
  "Arbeitsfassung herunterladen",
  "Dokument bearbeiten",
  "Dateiformat DOCX",
  "Dateiformat Word",
  "PDF und DOCX",
  "PDF/DOCX",
  "DOCX",
]);

function isAllowedPublicDocxFinding(file, term, context) {
  const normalized = path.relative(ROOT, file).replaceAll(path.sep, "/");
  if (!["downloads.html", "bibliothek/folgencheck-faktencheck/index.html"].includes(normalized)) return false;
  if (normalized === "bibliothek/folgencheck-faktencheck/index.html" && PUBLIC_DOCX_TERMS.has(term)) return true;
  return PUBLIC_DOCX_TERMS.has(term) && PUBLIC_DOCX_EXCEPTION_RE.test(context);
}

function walk(entry, files = []) {
  const full = path.join(ROOT, entry);
  if (!fs.existsSync(full)) return files;
  const stat = fs.statSync(full);
  if (stat.isDirectory()) {
    for (const child of fs.readdirSync(full, { withFileTypes: true })) {
      if (child.name === "node_modules" || child.name === ".git") continue;
      walk(path.join(entry, child.name), files);
    }
  } else if (entry.endsWith(".html") || entry.endsWith(".js")) {
    files.push(full);
  }
  return files;
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function visibleText(html) {
  const withoutTechnicalCanonical = html.replace(TECHNICAL_CANONICAL_RE, "");
  const bodyMatch = /<body\b[^>]*>([\s\S]*?)<\/body>/i.exec(withoutTechnicalCanonical);
  const body = bodyMatch ? bodyMatch[1] : withoutTechnicalCanonical;
  return decodeEntities(
    body
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function contexts(text, term) {
  const flags = term === term.toLowerCase() ? "gi" : "g";
  const pattern = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
  const out = [];
  for (const match of text.matchAll(pattern)) {
    const index = match.index || 0;
    out.push(text.slice(Math.max(0, index - 90), Math.min(text.length, index + term.length + 90)));
    if (out.length >= 5) break;
  }
  return out;
}

const files = [...new Set(SCAN_TARGETS.flatMap((target) => walk(target)))].sort();
const findings = [];
let technicalCanonicalTags = 0;

for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  technicalCanonicalTags += (html.match(TECHNICAL_CANONICAL_RE) || []).length;
  const text = visibleText(html);
  for (const term of BLOCKED_TERMS) {
    const hits = contexts(text, term);
    for (const context of hits) {
      if (isAllowedPublicDocxFinding(file, term, context)) continue;
      findings.push({
        file: path.relative(ROOT, file),
        term,
        context,
        recommendation: term.toLowerCase().includes("kanonisch")
          ? "ersetzen durch Onlinefassung, zentrale Übersicht oder entfernen"
          : "entfernen oder nutzerverständlich ersetzen",
      });
    }
  }
}

const lines = [
  "# Public Language Audit",
  "",
  `Stand: ${new Date().toISOString()}`,
  "",
  "## Zusammenfassung",
  "",
  `- Geprüfte HTML-Dateien: ${files.length}`,
  `- Sichtbare Blocklist-Treffer: ${findings.length}`,
  `- Technische canonical-Tags: ${technicalCanonicalTags}`,
  "",
  "## Befunde",
  "",
];

if (findings.length === 0) {
  lines.push("Keine sichtbaren Treffer aus der öffentlichen Blockliste gefunden.");
} else {
  lines.push("| Datei | Begriff | Kontext | Empfehlung |");
  lines.push("| --- | --- | --- | --- |");
  for (const finding of findings) {
    lines.push(
      `| \`${finding.file}\` | ${finding.term} | ${finding.context.replaceAll("|", "\\|")} | ${finding.recommendation} |`,
    );
  }
}

fs.writeFileSync(AUDIT_FILE, `${lines.join("\n")}\n`, "utf8");
console.log(`Public language audit: ${files.length} files, ${findings.length} visible findings, ${technicalCanonicalTags} technical canonical tags -> docs/public-language-audit.md`);

if (findings.length > 0) process.exit(1);
