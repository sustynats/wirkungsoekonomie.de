import fs from "node:fs";

const glossary = JSON.parse(fs.readFileSync("public/data/glossary.terms.json", "utf8"));
const relationships = {};
for (const term of glossary.terms) {
  relationships[term.termId] = {
    terms: term.relatedTerms || [],
    documents: term.relatedDocuments || [],
    methods: term.relatedMethods || [],
    tools: term.relatedTools || [],
    demos: term.relatedDemos || [],
    impactFields: term.relatedImpactFields || [],
    academyModules: term.relatedAcademyModules || [],
    dataRegisters: term.relatedDataRegisters || [],
  };
}
fs.writeFileSync("public/data/relationship-manifest.json", `${JSON.stringify({ generatedAt: new Date().toISOString(), relationships }, null, 2)}\n`);
console.log(`Wrote relationships for ${Object.keys(relationships).length} terms.`);
