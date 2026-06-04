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
  "scanner.html",
  "scorecard-dashboard.html",
  "so-wirkt-wirkungsoekonomie",
  "suche.html",
  "tools",
  "verstehen",
  "werkstatt",
  "werkzeuge",
  "wirkungsoekonomie.html",
  "wirkungsradar",
  "wirkungsfelder",
  "wissen",
  "woek-ki",
  "woek-id-register",
  "workflow.html",
  "assets/downloads",
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
  "ProtectionNotice",
  "fachoeffentlich",
  "wirkungsoekonomisch",
  "Wirkungsoekonomisch",
  "Oeffentlichkeit",
  "oeffentlich",
  "Oeffentlich",
  "Pruef",
  "pruef",
  "E`ekt",
  "scha`",
];

const BLOCKED_PATTERNS = [
  {
    label: "sichtbarer wortinterner Backtick aus PDF-Extraktion",
    pattern: /[A-Za-zÄÖÜäöüß]`[A-Za-zÄÖÜäöüß]/g,
    recommendation: "PDF-Extraktion normalisieren; Backtick im Wort meist zu ff korrigieren",
  },
  {
    label: "sichtbarer Markup-Rest",
    pattern: /(?:">|<\/[a-z][^>]*>)/gi,
    recommendation: "HTML/Markdown-Sanitizer prüfen; sichtbare Markup-Reste entfernen",
  },
];

const TECHNICAL_CANONICAL_RE = /<link\b[^>]*rel=["']canonical["'][^>]*>/gi;
const HIDDEN_FROM_SCREEN_RE = /<([a-z0-9:-]+)\b(?=[^>]*(?:data-search-exclude|class=["'][^"']*(?:no-print|print-meta|sr-only)[^"']*["']))[^>]*>[\s\S]*?<\/\1>/gi;

function walk(entry, files = []) {
  const full = path.join(ROOT, entry);
  if (!fs.existsSync(full)) return files;
  const stat = fs.statSync(full);
  if (stat.isDirectory()) {
    for (const child of fs.readdirSync(full, { withFileTypes: true })) {
      if (child.name === "node_modules" || child.name === ".git") continue;
      walk(path.join(entry, child.name), files);
    }
  } else if (entry.endsWith(".html")) {
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
  const body = (bodyMatch ? bodyMatch[1] : withoutTechnicalCanonical).replace(HIDDEN_FROM_SCREEN_RE, " ");
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
  for (const blockedPattern of BLOCKED_PATTERNS) {
    for (const match of text.matchAll(blockedPattern.pattern)) {
      const index = match.index || 0;
      findings.push({
        file: path.relative(ROOT, file),
        term: blockedPattern.label,
        context: text.slice(Math.max(0, index - 90), Math.min(text.length, index + String(match[0]).length + 90)),
        recommendation: blockedPattern.recommendation,
      });
      if (findings.length >= 5000) break;
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
