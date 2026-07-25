import fs from "node:fs";

const glossary = JSON.parse(fs.readFileSync("public/data/glossary.terms.json", "utf8"));
const formulaTerms = [
  ["nwi", "NWI = Summe gewichteter positiver Wirkungen − Summe gewichteter negativer Wirkungen"],
  ["t-sroi", "T-SROI = diskontierter bewerteter Transformationsnutzen / Investitionssumme"],
  ["oeffentlicher-t-sroi", "Öffentlicher T-SROI = diskontierter bewerteter Transformationsnutzen / klar abgegrenzter öffentlicher Mitteleinsatz"],
  ["wirkungseffizienz", "Wirkungseffizienz = bewertete positive Netto-Wirkung / klar benannter Ressourceneinsatz"],
  ["wirkungsrendite", "Netto-Wirkungsrendite = bewertete positive Netto-Wirkung / eingesetztes Kapital"],
  ["wirkungsrendite-oeffentlicher-ausgaben", "Wirkungsrendite öffentlicher Ausgaben = bewertete positive Netto-Wirkung / klar abgegrenzte öffentliche Ausgaben"],
  ["gestehungskosten", "Gestehungskosten je Einheit = abgezinste Gesamtkosten / abgezinste erzeugte oder bereitgestellte Einheiten"],
];
const calculationTerms = ["impact-controlling", "key-impact-indicator", "kii", "scorecard", "finalscore"];
const errors = [];

for (const [slug, expression] of formulaTerms) {
  const term = glossary.terms.find((entry) => entry.slug === slug);
  if (term?.formula?.expression !== expression) errors.push(`${slug}: Formel fehlt oder ist nicht die freigegebene Rechenlogik`);
  const page = `begriffe/${slug}/index.html`;
  if (!fs.existsSync(page) || !fs.readFileSync(page, "utf8").includes(expression)) {
    errors.push(`${slug}: Formel fehlt auf der Detailseite`);
  }
}

for (const slug of calculationTerms) {
  const term = glossary.terms.find((entry) => entry.slug === slug);
  if (!term?.calculationModel) errors.push(`${slug}: Rechenfolge fehlt im Glossar-Register`);
  const page = `begriffe/${slug}/index.html`;
  if (!fs.existsSync(page) || !fs.readFileSync(page, "utf8").includes("Berechnungslogik")) {
    errors.push(`${slug}: Rechenfolge fehlt auf der Detailseite`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Impact-Controlling Rechenlogik check passed for ${formulaTerms.length} Formeln and ${calculationTerms.length} Berechnungsfolgen.`);
