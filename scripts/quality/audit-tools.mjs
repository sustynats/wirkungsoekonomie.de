import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = path.join(ROOT, "docs/tool-audit.md");
const TARGETS = ["erleben.html", "erleben", "anwendungen", "werkzeuge"];
const CLAIM = /Tool testen|Rechner nutzen|Rechner öffnen|Demo ansehen|Simulation starten|Scanner|Generator|Check|Rechner/i;
const INPUT = /<(form|input|select|textarea)\b|data-[a-z0-9-]*(scanner|calculator|tool|quiz|simulation)/i;
const RESULT = /result|ergebnis|auswertung|interpretation|score|ampel|data-result/i;

function walk(entry, files = []) {
  const full = path.join(ROOT, entry);
  if (!fs.existsSync(full)) return files;
  const stat = fs.statSync(full);
  if (stat.isFile() && entry.endsWith(".html")) files.push(entry);
  else if (stat.isDirectory()) {
    for (const child of fs.readdirSync(full, { withFileTypes: true })) walk(path.join(entry, child.name), files);
  }
  return files;
}

function clean(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function routeFor(rel) {
  return rel.endsWith("/index.html") ? `/${rel.slice(0, -"/index.html".length)}/` : `/${rel}`;
}

function title(html, rel) {
  return clean(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || rel);
}

const files = [...new Set(TARGETS.flatMap((target) => walk(target)))].sort();
const rows = [];
for (const rel of files) {
  const html = fs.readFileSync(path.join(ROOT, rel), "utf8");
  const text = clean(html);
  if (!CLAIM.test(text) && !CLAIM.test(html)) continue;
  const hasInput = INPUT.test(html);
  const hasResult = RESULT.test(html) || /Ergebnis|Auswertung|Was bedeutet/i.test(text);
  const hasSpec = /Tool-Spezifikation|Inputs|Outputs|Website-Integration|Demo in Vorbereitung/i.test(text);
  const explicitInteractiveClaim = /Tool testen|Rechner nutzen|Rechner öffnen|Simulation starten|Ersteinschätzung anzeigen/i.test(text);
  let status = "method";
  if (hasInput && hasResult && !hasSpec) status = "interactive";
  if (hasSpec) status = "broken";
  rows.push({
    route: routeFor(rel),
    title: title(html, rel),
    status,
    hasInput,
    hasResult,
    issue: status === "interactive" ? "ok" : status === "method" ? "Methodenseite oder Erklärseite" : "Tool-Claim prüfen oder CTA zurückstufen",
  });
}

const lines = [
  "# Tool-Audit",
  "",
  `Stand: ${new Date().toISOString()}`,
  "",
  "## Zusammenfassung",
  "",
  `- Geprüfte toolnahe Seiten: ${files.length}`,
  `- Interaktiv: ${rows.filter((r) => r.status === "interactive").length}`,
  `- Methodik/Erklärung: ${rows.filter((r) => r.status === "method").length}`,
  `- Broken/prüfen: ${rows.filter((r) => r.status === "broken").length}`,
  "",
  "## Befunde",
  "",
  "| Route | Titel | Status | Eingabe | Ergebnis | Maßnahme |",
  "| --- | --- | --- | --- | --- | --- |",
  ...rows.map((row) => `| ${row.route} | ${row.title.replace(/\|/g, "\\|")} | ${row.status} | ${row.hasInput ? "ja" : "nein"} | ${row.hasResult ? "ja" : "nein"} | ${row.issue} |`),
  "",
];

fs.writeFileSync(OUT, `${lines.join("\n")}\n`, "utf8");
console.log(`Tool audit: ${rows.length} tool-like pages -> docs/tool-audit.md`);
