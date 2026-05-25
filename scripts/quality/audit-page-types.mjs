import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = path.join(ROOT, "docs/ux-audit.md");
const ROOTS = [
  "index.html",
  "akademie.html",
  "kompass.html",
  "suche.html",
  "begriffe",
  "wirkungsfelder",
  "werkzeuge",
  "erleben",
  "anwendungen",
  "downloads",
  "fachbibliothek",
  "portale",
  "werkstatt",
];

function walk(entry, files = []) {
  const full = path.join(ROOT, entry);
  if (!fs.existsSync(full)) return files;
  const stat = fs.statSync(full);
  if (stat.isFile() && entry.endsWith(".html")) files.push(entry);
  else if (stat.isDirectory()) {
    for (const child of fs.readdirSync(full, { withFileTypes: true })) {
      if (child.name === ".git" || child.name === "node_modules") continue;
      walk(path.join(entry, child.name), files);
    }
  }
  return files;
}

function visibleText(html) {
  return html
    .replace(/<head[\s\S]*?<\/head>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pageType(rel) {
  if (rel === "index.html") return "landing";
  if (rel === "suche.html") return "suche";
  if (rel === "akademie.html" || rel.startsWith("akademie/")) return "akademie";
  if (rel === "kompass.html" || rel.startsWith("kompass/")) return "kompass";
  if (rel.startsWith("begriffe/")) return "begriff";
  if (rel.startsWith("downloads/") || rel.startsWith("fachbibliothek/") || rel === "downloads.html") return "download-bibliothek";
  if (rel.startsWith("erleben/") || rel.startsWith("anwendungen/")) return "tool";
  if (rel.startsWith("werkzeuge/")) {
    if (/\/dossiers?\//.test(rel)) return "dossier";
    if (/\/detailkonzepte?\//.test(rel)) return "detailkonzept";
    return "methode";
  }
  if (rel.startsWith("wirkungsfelder/")) {
    if (/\/dossiers?\//.test(rel)) return "dossier";
    if (/\/detailkonzepte?\//.test(rel)) return "detailkonzept";
    const parts = rel.split("/");
    if (parts.length === 3 && parts[2] === "index.html") return "wirkungsfeld";
    return "detailkonzept";
  }
  if (rel.startsWith("portale/")) {
    if (/\/downloads\//.test(rel)) return "download-bibliothek";
    if (/\/gesamtdossier\//.test(rel) || /\/dossiers?\//.test(rel)) return "dossier";
    if (/\/konzeptpapier\//.test(rel) || /\/detailkonzepte?\//.test(rel)) return "detailkonzept";
    const parts = rel.split("/");
    if (parts.length === 3 && parts[2] === "index.html") return "wirkungsfeld";
    return "detailkonzept";
  }
  return "landing";
}

function routeFor(rel) {
  if (rel === "index.html") return "/";
  return rel.endsWith("/index.html") ? `/${rel.slice(0, -"/index.html".length)}/` : `/${rel}`;
}

function issuesFor(type, rel, html, text) {
  const issues = [];
  const firstThird = text.slice(0, Math.floor(text.length / 3));
  if (["landing", "wirkungsfeld"].includes(type)) {
    if (/Publikationszugang|Portaltext|Online-Volltext|Online lesen und herunterladen/i.test(firstThird)) {
      issues.push("Publikations-/Volltextlogik steht im oberen Seitenbereich.");
    }
    const tocItems = (firstThird.match(/Inhaltsverzeichnis|toc-card|toc-links/gi) || []).length;
    if (tocItems > 1 || /Inhaltsverzeichnis/.test(firstThird)) issues.push("Langes Inhaltsverzeichnis im Einstieg prüfen.");
  }
  if (type === "wirkungsfeld") {
    for (const needed of ["Alte Logik", "Was muss Politik", "Werkzeuge", "SDG"]) {
      if (!text.includes(needed)) issues.push(`Wirkungsfeld-Struktur unvollständig: ${needed}`);
    }
  }
  if (type === "tool") {
    if (/Tool-Spezifikation|Inputs|Outputs|Website-Integration/i.test(text)) issues.push("Interne Tool-Spezifikationssprache sichtbar.");
    if (/Rechner|Scanner|Generator|Check|Simulation/i.test(text) && !/<(form|input|select|textarea|button)\b/i.test(html)) {
      issues.push("Tool-Claim ohne erkennbare Eingabe/Bedienung.");
    }
  }
  if (/href=["']#["']/i.test(html)) issues.push("CTA/Link mit href=\"#\" vorhanden.");
  if (/>Öffnen<\/a>/i.test(html)) issues.push("Generischer CTA \"Öffnen\" sichtbar.");
  return issues;
}

const files = [...new Set(ROOTS.flatMap((root) => walk(root)))].sort();
const rows = [];
const counts = new Map();
for (const rel of files) {
  const html = fs.readFileSync(path.join(ROOT, rel), "utf8");
  const text = visibleText(html);
  const type = pageType(rel);
  counts.set(type, (counts.get(type) || 0) + 1);
  const issues = issuesFor(type, rel, html, text);
  rows.push({ rel, route: routeFor(rel), type, issues });
}

const lines = [
  "# UX-, Seitenrollen- und Template-Audit",
  "",
  `Stand: ${new Date().toISOString()}`,
  "",
  "## Seitentypen",
  "",
  ...Array.from(counts.entries()).sort().map(([type, count]) => `- ${type}: ${count}`),
  "",
  "## Strukturregeln",
  "",
  "- Landingpages orientieren, erklären Problem und Einstieg, zeigen keine Downloads oder Langtexte oben.",
  "- Wirkungsfeldseiten führen über Problem, alte Logik vs. WÖk-Logik, Konzeptkarten, Politikbox, Werkzeuge und Vertiefung unten.",
  "- Begriffseiten erklären Definition, Abgrenzung, Beispiel, Missverständnisse, Anwendung und verwandte Seiten.",
  "- Detailkonzepte und Dossiers dürfen lang sein, müssen aber Downloads unten führen und Self-Links vermeiden.",
  "- Toolseiten brauchen Zweck, heutige Blindstelle, WÖk-Unterschied, Eingabe, Ergebnis, Interpretation, Grenzen und Vertiefung.",
  "",
  "## Befunde",
  "",
];

const findings = rows.filter((row) => row.issues.length);
if (!findings.length) {
  lines.push("Keine prioritären Template-Befunde gefunden.");
} else {
  lines.push("| Route | pageType | Befund |");
  lines.push("| --- | --- | --- |");
  for (const row of findings) {
    lines.push(`| ${row.route} | ${row.type} | ${row.issues.join("<br>")} |`);
  }
}

fs.writeFileSync(OUT, `${lines.join("\n")}\n`, "utf8");
console.log(`UX audit: ${files.length} pages, ${findings.length} findings -> docs/ux-audit.md`);
