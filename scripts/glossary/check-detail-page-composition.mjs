import fs from "node:fs";

const glossary = JSON.parse(fs.readFileSync("public/data/glossary.terms.json", "utf8"));
const specialPages = new Set([
  "sexarbeit",
  "soziale-infrastruktur",
  "staat",
  "wirkungsfinanzpolitik",
  "impact-of-investment",
  "oeffentliche-finanzen-schulden-wirkung",
  "wirkschulden",
  "blindschulden",
  "verlustschulden",
  "reparaturschulden",
  "praeventionsschulden",
  "transformationsschulden",
  "zukunftsschulden",
  "nicht-finanzielle-staatsschulden",
]);
const errors = [];

function decode(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .toLowerCase()
    .replace(/[.,;:!?]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

for (const term of glossary.terms || []) {
  const file = `begriffe/${term.slug}/index.html`;
  if (!fs.existsSync(file)) {
    errors.push(`${term.slug}: Detailseite fehlt`);
    continue;
  }
  const html = fs.readFileSync(file, "utf8");
  const formula = term.formula?.expression || term.calculation?.expression || (typeof term.formula === "string" ? term.formula : "");
  if (formula && !html.includes(formula)) errors.push(`${term.slug}: Rechenformel fehlt auf der Detailseite`);
  if (specialPages.has(term.slug)) continue;

  const lead = decode(html.match(/<p class="lead">([\s\S]*?)<\/p>/i)?.[1]);
  if (!lead) {
    errors.push(`${term.slug}: Kurzdefinition im Einstieg fehlt`);
    continue;
  }
  const matchingParagraphs = Array.from(html.matchAll(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/gi))
    .map((match) => decode(match[1]))
    .filter((paragraph) => paragraph === lead).length;
  if (matchingParagraphs > 1) errors.push(`${term.slug}: Kurzdefinition wird ${matchingParagraphs}-mal wörtlich wiederholt`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Glossary detail composition check passed for ${(glossary.terms || []).length} terms.`);
