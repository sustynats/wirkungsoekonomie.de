import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const inputPath = path.join(root, "public", "data", "glossary.terms.json");
const outputPath = path.join(root, "assets", "data", "glossary-relations.json");

function unique(values) {
  return Array.from(new Set((values || []).map((value) => String(value || "").trim()).filter(Boolean)));
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("de")
    .replace(/&/g, " und ")
    .replace(/ß/g, "ss")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function lookupKeys(term) {
  return unique([
    term.slug,
    term.id,
    term.termId,
    term.label,
    term.canonicalLabel,
    ...(term.aliases || []),
    ...(term.synonyms || []),
  ]).flatMap((value) => unique([value, slugify(value)]));
}

const source = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const terms = Array.isArray(source?.terms) ? source.terms : [];

const slugByKey = new Map();
for (const term of terms) {
  const slug = term.slug || slugify(term.canonicalLabel || term.label || term.id || term.termId);
  if (!slug) continue;
  for (const key of lookupKeys(term)) {
    slugByKey.set(key, slug);
  }
}

function resolveRelation(value, ownSlug) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const resolved = slugByKey.get(raw) || slugByKey.get(slugify(raw)) || slugify(raw);
  return resolved && resolved !== ownSlug ? resolved : "";
}

const relations = {};
for (const term of terms) {
  const slug = term.slug || slugify(term.canonicalLabel || term.label || term.id || term.termId);
  if (!slug) continue;
  relations[slug] = {
    related: unique(unique(term.relatedTerms || [])
      .map((value) => resolveRelation(value, slug))
      .filter(Boolean)),
    doNotConfuse: unique(unique(term.doNotConfuseWith || [])
      .map((value) => resolveRelation(value, slug))
      .filter(Boolean)),
  };
}

const payload = {
  generatedAt: source?.generatedAt || new Date().toISOString(),
  count: terms.length,
  relations,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`[glossary] glossary-relations.json aktualisiert: ${payload.count} Eintraege`);
