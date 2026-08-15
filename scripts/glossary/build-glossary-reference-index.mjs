import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, "public/data/glossary.terms.json");
const publicOut = path.join(root, "public/data/glossary-reference-index.json");
const assetsOut = path.join(root, "assets/data/glossary-reference-index.json");
const collator = new Intl.Collator("de", { sensitivity: "base", numeric: true });

function firstLetter(label) {
  const first = String(label || "").trim().charAt(0).toLocaleUpperCase("de");
  return /^[A-ZÄÖÜ]$/.test(first) ? first : "#";
}

const glossary = JSON.parse(fs.readFileSync(source, "utf8"));
const terms = Array.isArray(glossary.terms) ? glossary.terms : [];
const items = terms
  .filter((term) => term.classicGlossary !== false)
  .map((term) => ({
    id: term.termId || term.id,
    label: term.canonicalLabel || term.label,
    slug: term.slug,
    url: term.pageUrl || `/begriffe/${term.slug}/`,
    category: term.category || "Grundbegriff",
    shortDefinition: term.shortDefinition || term.definition || "",
    aliases: term.aliases || term.synonyms || [],
  }))
  .filter((item) => item.id && item.label && item.slug)
  .sort((a, b) => collator.compare(a.label, b.label));

const byLetter = {};
for (const item of items) {
  const letter = firstLetter(item.label);
  if (!byLetter[letter]) byLetter[letter] = [];
  byLetter[letter].push(item.slug);
}

const index = {
  generatedAt: new Date().toISOString(),
  count: items.length,
  letters: Object.keys(byLetter).sort((a, b) => {
    if (a === "#") return -1;
    if (b === "#") return 1;
    return collator.compare(a, b);
  }),
  byLetter,
  items,
};

for (const out of [publicOut, assetsOut]) {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${JSON.stringify(index, null, 2)}\n`);
}

console.log(`Wrote glossary reference index for ${items.length} terms.`);
