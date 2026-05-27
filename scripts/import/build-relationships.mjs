import fs from "node:fs";

const glossary = JSON.parse(fs.readFileSync("public/data/glossary.terms.json", "utf8"));
const journalRelationships = fs.existsSync("assets/data/journal-related-content.json")
  ? JSON.parse(fs.readFileSync("assets/data/journal-related-content.json", "utf8"))
  : { terms: {} };
const relationships = {};
for (const term of glossary.terms) {
  const journalArticles = (journalRelationships.terms?.[term.slug] || []).map((article) => article.url);
  relationships[term.termId] = {
    terms: term.relatedTerms || [],
    documents: term.relatedDocuments || [],
  };
  if (journalArticles.length) {
    relationships[term.termId].journalArticles = journalArticles;
  }
}
fs.writeFileSync("public/data/relationship-manifest.json", `${JSON.stringify({ generatedAt: new Date().toISOString(), relationships }, null, 2)}\n`);
console.log(`Wrote relationships for ${Object.keys(relationships).length} terms.`);
