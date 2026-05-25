import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("public/data/glossary.terms.json", "utf8"));
const links = {};
for (const term of data.terms) {
  links[term.termId] = {
    label: term.canonicalLabel,
    slug: term.slug,
    url: `/begriffe/${term.slug}/`,
    hoverDefinition: term.hoverDefinition,
    shortDefinition: term.shortDefinition,
    category: term.category || "",
    synonyms: term.synonyms || [],
    relatedTerms: term.relatedTerms || [],
  };
}
fs.writeFileSync("public/data/glossary-term-links.json", `${JSON.stringify({ generatedAt: new Date().toISOString(), links }, null, 2)}\n`);
console.log(`Wrote term link manifest for ${Object.keys(links).length} terms.`);
