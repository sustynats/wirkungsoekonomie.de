import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const auditPath = path.join(root, "docs/public-docx-audit.md");
const htmlTargets = [
  "akademie.html",
  "anwendungen.html",
  "assets/downloads",
  "audio",
  "bibliothek/folgencheck-faktencheck",
  "begriffe",
  "blog",
  "blog.html",
  "buch.html",
  "datenschutz.html",
  "dokumente",
  "downloads",
  "downloads.html",
  "erleben",
  "erleben.html",
  "fachbibliothek",
  "fuer",
  "funktionsweise",
  "glossar.html",
  "index.html",
  "kompass.html",
  "methodik",
  "mitmachen.html",
  "modell.html",
  "portale",
  "referenz",
  "referenzrahmen",
  "suche.html",
  "verstehen",
  "werkstatt",
  "werkzeuge",
  "website-1-0-release",
  "wirkungsoekonomie.html",
  "wirkungsfelder",
];

const blockedPhrases = [
  "DOCX herunterladen",
  "Word herunterladen",
  "Dokument als Word",
  "Word-Version",
  "Word-Datei",
  "Word-Dateien",
  "Word-Export",
  "Arbeitsfassung herunterladen",
  "Dokument bearbeiten",
  "Dateiformat DOCX",
  "Dateiformat Word",
  "Konzept-Download",
  "Detail-Download",
  "Dossier-Download",
  "Weiterarbeit",
];

const publicDocxExceptionRe = /folgencheck|faktencheck|WOeK_Folgencheck_und_Faktencheck/i;

function allowsPublicDocxException(value) {
  return publicDocxExceptionRe.test(value);
}

function walk(entry, predicate, out = []) {
  const full = path.join(root, entry);
  if (!fs.existsSync(full)) return out;
  const stat = fs.statSync(full);
  if (stat.isDirectory()) {
    for (const child of fs.readdirSync(full, { withFileTypes: true })) {
      if (child.name === ".git" || child.name === "node_modules") continue;
      walk(path.join(entry, child.name), predicate, out);
    }
    return out;
  }
  if (predicate(full)) out.push(full);
  return out;
}

function allFiles(entry, predicate, out = []) {
  const full = path.join(root, entry);
  if (!fs.existsSync(full)) return out;
  const stat = fs.statSync(full);
  if (stat.isDirectory()) {
    for (const child of fs.readdirSync(full, { withFileTypes: true })) {
      if (child.name === ".git" || child.name === "node_modules") continue;
      allFiles(path.join(entry, child.name), predicate, out);
    }
  } else if (predicate(full)) {
    out.push(full);
  }
  return out;
}

function rel(file) {
  return path.relative(root, file);
}

function sanitizeText(value) {
  return value
    .replace(/PDF und DOCX/gi, "PDF")
    .replace(/PDF\/DOCX/gi, "PDF")
    .replace(/DOCX und PDF/gi, "PDF")
    .replace(/Word und PDF/gi, "PDF")
    .replace(/DOCX-Dateien/gi, "PDF-Dateien")
    .replace(/Word-Dateien/gi, "PDF-Dateien")
    .replace(/DOCX-Datei/gi, "PDF-Datei")
    .replace(/Word-Datei/gi, "PDF-Datei")
    .replace(/Word-Download/gi, "PDF-Download")
    .replace(/Word-Export/gi, "PDF-Export")
    .replace(/Word bleibt Download/gi, "PDF bleibt Download")
    .replace(/Dateiformat DOCX/gi, "Dateiformat PDF")
    .replace(/Dateiformat Word/gi, "Dateiformat PDF")
    .replace(/Konzept-Download/gi, "Konzept als PDF")
    .replace(/Detail-Download/gi, "Konzept-PDF")
    .replace(/Dossier-Download/gi, "Dossier als PDF")
    .replace(/Weiterarbeit/gi, "Vertiefung")
    .replace(/Herunterladen(?=<\/a>)/gi, "PDF herunterladen")
    .replace(/PDF\s+PDF herunterladen/gi, "PDF herunterladen")
    .replace(/\b(Konzept-PDF|Dossier-PDF|Methodik-PDF|PDF-Sammlung)(?: PDF)+ herunterladen/gi, "$1 herunterladen")
    .replace(/DOCX herunterladen/gi, "PDF herunterladen")
    .replace(/Word herunterladen/gi, "PDF herunterladen")
    .replace(/Arbeitsfassung herunterladen/gi, "PDF herunterladen")
    .replace(/Dokument bearbeiten/gi, "Feedback geben")
    .replace(/Dokument als Word/gi, "PDF")
    .replace(/Word-Version/gi, "PDF-Fassung")
    .replace(/\bDOCX\b/g, "PDF")
    .replace(/\bWord\b/g, "PDF")
    .replace(/\.docx\b/gi, ".pdf")
    .replace(/\.doc\b/gi, ".pdf");
}

function sanitizeHtml(html, file) {
  let removedLinks = 0;
  const allowPublicDocx = allowsPublicDocxException(html) && /(?:downloads\.html|bibliothek[\\/]+folgencheck-faktencheck[\\/]+index\.html)$/i.test(file);
  let changed = html.replace(/<a\b[^>]*href=["'][^"']+\.(?:docx|doc)(?:[#?][^"']*)?["'][^>]*>[\s\S]*?<\/a>/gi, (match) => {
    if (allowPublicDocx && allowsPublicDocxException(match)) return match;
    removedLinks += 1;
    return "";
  });
  const beforeTerms = blockedPhrases.reduce((sum, term) => sum + (changed.match(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")) || []).length, 0);
  const protectedTags = [];
  changed = changed.replace(/<[^>]+>/g, (match) => {
    const token = `@@WOEK-TAG-${protectedTags.length}@@`;
    protectedTags.push(match);
    return token;
  });
  if (allowPublicDocx) {
    changed = changed.replace(/(?:https:\/\/wirkungsoekonomie\.de)?\/assets\/documents\/WOeK_Folgencheck_und_Faktencheck_Paper_v1\.1\.docx|WOeK_Folgencheck_und_Faktencheck_Paper_v1\.1\.docx|DOCX herunterladen|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document/g, (match) => {
      const token = `@@WOEK-TAG-${protectedTags.length}@@`;
      protectedTags.push(match);
      return token;
    });
  }
  changed = sanitizeText(changed);
  changed = changed.replace(/@@WOEK-TAG-(\d+)@@/g, (_, index) => protectedTags[Number(index)] || "");
  const visibleDocx = (changed.match(/(?:href=["'][^"']+\.docx|\.docx\b|\.doc\b)/gi) || []).length;
  return {
    html: changed,
    removedLinks,
    beforeTerms,
    visibleDocx,
    allowPublicDocx,
    changed: changed !== html,
    file: rel(file),
  };
}

function sanitizeSearchIndex(file) {
  if (!fs.existsSync(file)) return { changed: false, docxHits: 0 };
  const before = fs.readFileSync(file, "utf8");
  const after = sanitizeText(before).replace(/https?:\/\/[^"\\\s]+?\.(?:docx|doc)\b/gi, "");
  if (after !== before) fs.writeFileSync(file, after, "utf8");
  return {
    changed: after !== before,
    docxHits: (before.match(/\.docx\b|\.doc\b|DOCX herunterladen|Word herunterladen/gi) || []).length,
  };
}

const htmlFiles = [...new Set(htmlTargets.flatMap((target) => walk(target, (file) => file.endsWith(".html"))))].sort();
const publicDocxFiles = [
  ...allFiles("assets/downloads", (file) => /\.(docx|doc)$/i.test(file)),
  ...allFiles("public/downloads", (file) => /\.(docx|doc)$/i.test(file)),
].sort();

const htmlFindings = [];
let removedLinks = 0;
for (const file of htmlFiles) {
  const original = fs.readFileSync(file, "utf8");
  const result = sanitizeHtml(original, file);
  removedLinks += result.removedLinks;
  if (result.changed) fs.writeFileSync(file, result.html, "utf8");
  if (result.removedLinks || result.beforeTerms || result.visibleDocx) htmlFindings.push(result);
}

const searchResult = sanitizeSearchIndex(path.join(root, "assets/search/search-index.json"));
sanitizeSearchIndex(path.join(root, "public/data/woek-search-meta.json"));

for (const file of publicDocxFiles) {
  fs.rmSync(file, { force: true });
}

const remainingHtmlDocx = [];
const allowedHtmlDocx = [];
for (const file of htmlFiles) {
  const text = fs.readFileSync(file, "utf8");
  if (/href=["'][^"']+\.(?:docx|doc)\b|DOCX herunterladen|Word herunterladen|Dateiformat DOCX|Dateiformat Word/i.test(text)) {
    if (allowsPublicDocxException(text) && /(?:downloads\.html|bibliothek[\\/]+folgencheck-faktencheck[\\/]+index\.html)$/i.test(file)) {
      allowedHtmlDocx.push(rel(file));
    } else {
      remainingHtmlDocx.push(rel(file));
    }
  }
}

const lines = [
  "# Public DOCX Audit",
  "",
  `Stand: ${new Date().toISOString()}`,
  "",
  "## Policy",
  "",
  "- Öffentliche Dokumentformate: Onlinefassung und PDF.",
  "- Nicht öffentliche Formate: DOCX, Word, Markdown, Roh-Export und editierbare Arbeitsfassungen.",
  "- DOCX darf intern als Quelle bleiben, wird aber nicht öffentlich verlinkt oder als Download gerendert.",
  "- Ausnahme: Folgencheck/Faktencheck v1.1 darf laut Integrationsauftrag öffentlich als DOCX angeboten werden.",
  "",
  "## Zusammenfassung",
  "",
  `- Geprüfte HTML-Dateien: ${htmlFiles.length}`,
  `- Gefundene öffentliche DOCX-/Word-Assets: ${publicDocxFiles.length}`,
  `- Entfernte öffentliche DOCX-/Word-Links: ${removedLinks}`,
  `- HTML-Dateien mit bereinigten DOCX-/Word-Begriffen: ${htmlFindings.length}`,
  `- Suchindex DOCX-/Word-Treffer vor Bereinigung: ${searchResult.docxHits}`,
  `- Erlaubte öffentliche DOCX-Ausnahme-Dateien: ${allowedHtmlDocx.length}`,
  `- Verbleibende nicht erlaubte HTML-Dateien mit öffentlichen DOCX-Downloadmustern: ${remainingHtmlDocx.length}`,
  "",
  "## Öffentliche DOCX-/Word-Assets",
  "",
  publicDocxFiles.length ? publicDocxFiles.map((file) => `- \`${rel(file)}\``).join("\n") : "- Keine",
  "",
  "## Bereinigte HTML-Dateien",
  "",
  htmlFindings.length ? "| Datei | entfernte Links | Begriffe vor Bereinigung | Restmuster |\n| --- | ---: | ---: | ---: |\n" + htmlFindings.map((finding) => `| \`${finding.file}\` | ${finding.removedLinks} | ${finding.beforeTerms} | ${finding.visibleDocx} |`).join("\n") : "- Keine",
  "",
  "## Erlaubte öffentliche DOCX-Ausnahme",
  "",
  allowedHtmlDocx.length ? allowedHtmlDocx.map((file) => `- \`${file}\``).join("\n") : "- Keine",
  "",
  "## Verbleibende nicht erlaubte öffentliche DOCX-Downloadmuster",
  "",
  remainingHtmlDocx.length ? remainingHtmlDocx.map((file) => `- \`${file}\``).join("\n") : "- Keine",
  "",
];

fs.writeFileSync(auditPath, `${lines.join("\n")}\n`, "utf8");

console.log(`Public document policy: ${removedLinks} DOCX links removed, ${publicDocxFiles.length} public DOCX assets removed from public paths -> docs/public-docx-audit.md`);

if (remainingHtmlDocx.length > 0) {
  console.error("Public DOCX download patterns remain in HTML.");
  process.exit(1);
}
