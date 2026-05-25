import fs from "node:fs";

const OUT = "docs/search-audit.md";
const index = JSON.parse(fs.readFileSync("assets/search/search-index.json", "utf8"));
const blocked = [/Footer/i, /globale Navigation/i, /Header-Navigation/i, /Portaltext/i, /Tool-Spezifikation/i, /\bInputs\b/, /\bOutputs\b/, /kanonisch/i, /Demo in Vorbereitung/i, /Portal öffnen/i];
const findings = [];
for (const [i, entry] of index.entries()) {
  const blob = [entry.title, entry.description, entry.body, entry.section, entry.type, ...(entry.tags || [])].join(" ");
  for (const pattern of blocked) {
    if (pattern.test(blob)) {
      findings.push({ rank: i + 1, url: entry.url, title: entry.title, term: String(pattern) });
      break;
    }
  }
}
const severe = findings.filter((finding) => finding.rank <= 100 || !/Navigation/i.test(finding.term));

const top = index.slice(0, 20).map((entry, i) => `${i + 1}. ${entry.title} - ${entry.url}`);
const lines = [
  "# Search Index Audit",
  "",
  `Stand: ${new Date().toISOString()}`,
  "",
  `- Indexeinträge: ${index.length}`,
  `- Kontaminationsbefunde: ${findings.length}`,
  `- Prioritäre Befunde: ${severe.length}`,
  "",
  "## Top 20",
  "",
  ...top,
  "",
  "## Befunde",
  "",
];
if (!findings.length) lines.push("Keine Treffer aus der Such-Blockliste gefunden.");
else {
  lines.push("| Rang | URL | Titel | Muster |", "| --- | --- | --- | --- |");
  for (const finding of findings.slice(0, 200)) {
    lines.push(`| ${finding.rank} | ${finding.url} | ${String(finding.title).replace(/\|/g, "\\|")} | ${finding.term} |`);
  }
}

fs.writeFileSync(OUT, `${lines.join("\n")}\n`, "utf8");
console.log(`Search audit: ${findings.length} findings, ${severe.length} priority findings -> docs/search-audit.md`);
if (severe.length) process.exitCode = 1;
