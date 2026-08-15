import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("public/data/glossary.terms.json", "utf8"));
const body = [`# Glossar der Wirkungsökonomie`, "", `Stand: ${new Date().toISOString()}`, ""];
for (const term of data.terms) {
  body.push(`## ${term.canonicalLabel}`, "", term.shortDefinition, "", term.longDefinition, "");
}
fs.mkdirSync("public/downloads/exports", { recursive: true });
fs.writeFileSync("public/downloads/exports/glossar.md", body.join("\n"));
console.log("Wrote public/downloads/exports/glossar.md.");

