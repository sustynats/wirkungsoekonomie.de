import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const glossaryFile = path.join(ROOT, "assets/data/wirkungsradar-glossary.json");
const reportFile = path.join(ROOT, "reports/glossary-check.md");
const entries = JSON.parse(fs.readFileSync(glossaryFile, "utf8"));
const findings = [];
const bySlug = new Map(entries.map((entry) => [entry.slug, entry]));

for (const entry of entries) {
  for (const field of ["shortDefinition", "hoverDefinition", "fullDefinition", "plainLanguageExample", "lastReviewed"]) {
    if (!entry[field]) findings.push([entry.slug, "missing_field", field]);
  }
  if (!Array.isArray(entry.relatedTerms) || !entry.relatedTerms.length) findings.push([entry.slug, "missing_relations", "relatedTerms fehlt"]);
  if (entry.hoverDefinition?.length > 240) findings.push([entry.slug, "hover_too_long", `${entry.hoverDefinition.length} Zeichen`]);
  if (entry.shortDefinition?.length > 180) findings.push([entry.slug, "short_definition_too_long", `${entry.shortDefinition.length} Zeichen`]);
  for (const related of entry.relatedTerms || []) {
    if (!bySlug.has(related) && related !== "quelle" && related !== "positive-netto-wirkung") findings.push([entry.slug, "unknown_related_term", related]);
  }
}

const effect = bySlug.get("wirkung");
if (!effect?.shortDefinition?.includes("positiv, negativ oder neutral")) {
  findings.push(["wirkung", "effect_not_neutral", "führende neutrale Definition fehlt"]);
}

const lines = [
  "# Glossary Check",
  "",
  `Einträge: ${entries.length}`,
  `Findings: ${findings.length}`,
  "",
  ...(findings.length ? findings.map(([slug, type, detail]) => `- ${slug}: ${type} - ${detail}`) : ["Keine Findings."]),
  "",
];

fs.mkdirSync(path.dirname(reportFile), { recursive: true });
fs.writeFileSync(reportFile, lines.join("\n"));

if (findings.length) {
  console.error(`Glossary check failed with ${findings.length} findings.`);
  process.exit(1);
}

console.log(`Glossary check OK: ${entries.length} entries.`);
