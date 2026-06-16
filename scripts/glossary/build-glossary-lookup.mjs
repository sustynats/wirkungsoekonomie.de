import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const inputPath = path.join(root, "public", "data", "glossary.terms.json");
const outputPath = path.join(root, "assets", "data", "glossary-lookup.json");

function unique(values) {
  return Array.from(new Set((values || []).map((value) => String(value || "").trim()).filter(Boolean)));
}

const source = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const terms = Array.isArray(source?.terms) ? source.terms : [];

const payload = {
  generatedAt: source?.generatedAt || new Date().toISOString(),
  count: terms.length,
  terms: terms.map((term) => ({
    id: term.id || term.termId || term.slug,
    label: term.canonicalLabel || term.label || "",
    canonicalLabel: term.canonicalLabel || term.label || "",
    slug: term.slug || "",
    url: `/begriffe/${term.slug || ""}/`,
    aliases: unique([
      ...(term.aliases || []),
      ...(term.synonyms || []),
      term.label,
      term.canonicalLabel,
    ]).slice(0, 24),
    shortDefinition: term.shortDefinition || term.definition || "",
    definition: term.definition || term.shortDefinition || "",
  })),
};

fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));
console.log(`[glossary] glossary-lookup.json aktualisiert: ${payload.count} Eintraege`);
