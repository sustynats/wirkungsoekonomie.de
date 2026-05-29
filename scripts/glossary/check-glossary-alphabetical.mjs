import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const file = path.join(root, "public/data/glossary.terms.json");
const required = [
  "termId",
  "canonicalLabel",
  "slug",
  "status",
  "version",
  "source",
  "shortDefinition",
  "hoverDefinition",
  "longDefinition",
  "reviewStatus",
  "glossaryOrderKey",
];

if (!fs.existsSync(file)) {
  console.error("Missing public/data/glossary.terms.json. Run glossary:build first.");
  process.exit(1);
}

const { terms } = JSON.parse(fs.readFileSync(file, "utf8"));
const collator = new Intl.Collator("de", { sensitivity: "base", numeric: true });
const errors = [];
const labels = new Set();
const slugs = new Set();

terms.forEach((term, index) => {
  required.forEach((field) => {
    if (term[field] === undefined || term[field] === "" || (Array.isArray(term[field]) && !term[field].length && field !== "reviewStatus")) {
      errors.push(`${term.termId || term.canonicalLabel || `term-${index}`}: missing ${field}`);
    }
  });
  const labelKey = String(term.canonicalLabel || "").toLocaleLowerCase("de");
  if (labels.has(labelKey)) errors.push(`Duplicate canonicalLabel: ${term.canonicalLabel}`);
  labels.add(labelKey);
  if (slugs.has(term.slug)) errors.push(`Duplicate slug: ${term.slug}`);
  slugs.add(term.slug);
  if (term.status === "führender-begriff" && !term.hoverDefinition) {
    errors.push(`${term.canonicalLabel}: leading term without hoverDefinition`);
  }
  if (term.termId === "wirkstoff" && !/analogie/i.test(`${term.shortDefinition} ${term.hoverDefinition} ${term.longDefinition}`)) {
    errors.push("Wirkstoff must be framed as analogy.");
  }
  if (term.termId === "wirkung" && /positiv[^,.]+veränderung/i.test(term.hoverDefinition)) {
    errors.push("Wirkung hover may imply automatically positive meaning.");
  }
  if (term.termId === "sdg-plus" && /offizielle?\s+UN/i.test(term.longDefinition) && !/keine offizielle/i.test(term.hoverDefinition)) {
    errors.push("SDG+ must not be presented as official UN category.");
  }
});

for (let i = 1; i < terms.length; i += 1) {
  const previous = terms[i - 1].glossaryOrderKey || terms[i - 1].canonicalLabel;
  const current = terms[i].glossaryOrderKey || terms[i].canonicalLabel;
  if (collator.compare(previous, current) > 0) {
    errors.push(`Glossary order error: ${terms[i - 1].canonicalLabel} before ${terms[i].canonicalLabel}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Glossary check passed for ${terms.length} terms.`);

