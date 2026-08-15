import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("public/data/glossary.terms.json", "utf8"));
const errors = [];
for (const term of data.terms) {
  if (!term.reviewStatus) errors.push(`${term.canonicalLabel}: missing reviewStatus`);
  if (term.termId === "wirkstoff" && !/Analogie|analogie/.test(`${term.shortDefinition} ${term.hoverDefinition} ${term.longDefinition}`)) {
    errors.push("Wirkstoff missing analogy framing.");
  }
  if (term.termId === "wirkung" && !/positiv, negativ oder neutral/.test(term.hoverDefinition)) {
    errors.push("Wirkung hover must include positive, negative or neutral.");
  }
  if (term.termId === "positive-netto-wirkung" && !/Zielgröße|Zielgroesse/i.test(`${term.shortDefinition} ${term.usageNote}`)) {
    errors.push("Positive Netto-Wirkung must be marked as target size.");
  }
  if (term.termId === "sdg-plus" && !/keine offizielle UN-Kategorie/i.test(term.hoverDefinition)) {
    errors.push("SDG+ must be framed as not official UN category.");
  }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Current terminology check passed.");

