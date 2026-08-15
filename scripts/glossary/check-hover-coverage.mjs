import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("public/data/glossary.terms.json", "utf8"));
const missing = data.terms.filter((term) => term.status === "führender-begriff" && !String(term.hoverDefinition || "").trim());
if (missing.length) {
  console.error(`Missing hover definitions: ${missing.map((term) => term.canonicalLabel).join(", ")}`);
  process.exit(1);
}
console.log(`Hover coverage passed for ${data.terms.length} glossary terms.`);

