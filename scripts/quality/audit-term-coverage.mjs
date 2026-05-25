import fs from "node:fs";

const OUT = "docs/term-coverage-audit.md";
const data = JSON.parse(fs.readFileSync("public/data/glossary.terms.json", "utf8"));
const terms = new Map(data.terms.map((term) => [term.slug, term]));
const required = [
  ["wirkung", "Wirkung"],
  ["wirkungspotenzial", "Wirkungspotenzial"],
  ["positive-netto-wirkung", "Positive Netto-Wirkung"],
  ["wirkungsbewertung", "Wirkungsbewertung"],
  ["wirkungsrueckkopplung", "Wirkungsrückkopplung"],
  ["wirkungsblindheit", "Wirkungsblindheit"],
  ["wirkungswahrheit", "Wirkungswahrheit"],
  ["sdg-plus", "SDG+"],
  ["woek-id", "WÖk-ID"],
  ["scorecard", "Scorecard"],
  ["nwi", "Netto-Wirkungs-Index / NWI"],
  ["reverse-merit-order", "Reverse Merit Order"],
  ["nichtkompensationsprinzip", "Nicht-Kompensation"],
  ["t-sroi", "T-SROI"],
  ["wirkungssteuer", "Wirkungssteuer"],
  ["wirkungsrat", "Wirkungsrat"],
  ["wirkungseinkommen", "Wirkungseinkommen"],
  ["maschinenwertschoepfungsbeitrag", "Maschinenwertschöpfungsbeitrag"],
  ["wirkungsfonds", "Wirkungsfonds"],
  ["wirkungshaushalt", "Wirkungshaushalt"],
  ["wirkungsdatenraum", "Wirkungsdatenräume"],
  ["digitaler-produktpass", "Digitaler Produktpass"],
  ["medienwirkung", "Medienwirkung"],
  ["resonanzraum", "Resonanzraum"],
  ["wirkungskompetenz", "Wirkungskompetenz"],
];

const rows = required.map(([slug, label]) => {
  const page = `begriffe/${slug}/index.html`;
  return {
    slug,
    label,
    inRegistry: terms.has(slug),
    pageExists: fs.existsSync(page),
  };
});

const lines = [
  "# Term Coverage Audit",
  "",
  `Stand: ${new Date().toISOString()}`,
  "",
  `- Pflichtbegriffe: ${rows.length}`,
  `- Im Begriffsregister: ${rows.filter((row) => row.inRegistry).length}`,
  `- Begriffseiten vorhanden: ${rows.filter((row) => row.pageExists).length}`,
  "",
  "| Begriff | Slug | Register | Seite |",
  "| --- | --- | --- | --- |",
  ...rows.map((row) => `| ${row.label} | \`${row.slug}\` | ${row.inRegistry ? "ja" : "nein"} | ${row.pageExists ? "ja" : "nein"} |`),
  "",
];

fs.writeFileSync(OUT, `${lines.join("\n")}\n`, "utf8");
console.log(`Term coverage audit: ${rows.filter((row) => row.pageExists).length}/${rows.length} pages -> docs/term-coverage-audit.md`);
if (rows.some((row) => !row.inRegistry || !row.pageExists)) process.exitCode = 1;
