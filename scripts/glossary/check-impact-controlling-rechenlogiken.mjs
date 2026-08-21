import fs from "node:fs";

const glossary = JSON.parse(fs.readFileSync("public/data/glossary.terms.json", "utf8"));
const formulaTerms = [
  ["nwi", "WÖk-Netto-Wirkungsindex = Summe gewichteter positiver Wirkungen − Summe gewichteter negativer Wirkungen; positive Ausweisung nur bei G = 1"],
  ["t-sroi", "T-SROI = Σ(t=1…T)[((Bdirekt,t + Btransformativ,t) · aₜ · (1 − dₜ) · (1 − vₜ) − Sₜ) / (1 + r)ᵗ] ÷ Σ(t=0…T)[(Iₜ + Kₜ) / (1 + rₖ)ᵗ]; PV_N^L = Σ(t=1…T)[((Bdirekt,t + Btransformativ,t) · aₜ · (1 − dₜ) · (1 − vₜ) · (1 − uₜ) − Sₜ) / (1 + r)ᵗ]"],
  ["oeffentlicher-t-sroi", "Öffentlicher T-SROI = diskontierter, kausal zugerechneter Netto-Nutzen / diskontierter klar abgegrenzter öffentlicher Mitteleinsatz"],
  ["wirkungseffizienz", "Wirkungsintensität_U = dokumentierte Netto-Wirkungsgröße ΔZ_U / klar benannter Ressourceneinsatz R"],
  ["wirkungsrendite", "Netto-Wirkungsrendite = Barwert des kausal zugerechneten direkten Nettonutzens in EUR / Barwert des eingesetzten Kapitals in EUR"],
  ["wirkungsrendite-oeffentlicher-ausgaben", "Wirkungsrendite öffentlicher Ausgaben = Barwert des kausal zugerechneten direkten Nettonutzens in EUR / Barwert klar abgegrenzter öffentlicher Ausgaben in EUR"],
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

const ioi = glossary.terms.find((entry) => entry.slug === "impact-of-investment");
if (!ioi?.formula?.expression?.includes("Bdirekt,t · aₜ · (1 − dₜ) · (1 − vₜ) − Sₜ")
  || !ioi.formula.expression.includes("Σ(t=1…T)")
  || !ioi.formula.expression.includes("Σ(t=0…T)")) {
  errors.push("impact-of-investment: kausale Faktoren oder explizite Zeitgrenzen fehlen in der IOI-Formel");
}

const tsroi = glossary.terms.find((entry) => entry.slug === "t-sroi");
if (!tsroi?.formula?.expression?.includes("PV_N^L")
  || !tsroi.formula.expression.includes("(1 − uₜ) − Sₜ")
  || !tsroi.formula.variables?.some((entry) => String(entry).includes("T ist eine ganze Zahl"))
  || !tsroi.formula.variables?.some((entry) => String(entry).includes("nicht mit dem Nutzenfaktor oder mit u reduziert"))) {
  errors.push("t-sroi: konservative Untergrenze, ganzzahliger Zeitraum oder unveränderte Schäden sind nicht vollständig dokumentiert");
}

for (const slug of calculationTerms) {
  const term = glossary.terms.find((entry) => entry.slug === slug);
  if (!term?.calculationModel) errors.push(`${slug}: Rechenfolge fehlt im Glossar-Register`);
  const page = `begriffe/${slug}/index.html`;
  if (!fs.existsSync(page) || !fs.readFileSync(page, "utf8").includes("Berechnungslogik")) {
    errors.push(`${slug}: Rechenfolge fehlt auf der Detailseite`);
  }
}

for (const term of glossary.terms.filter((entry) => entry.formula?.expression || entry.calculation?.expression)) {
  const mathml = String(term.formula?.mathml || term.calculation?.mathml || "").trim();
  if (!/^<math\b[^>]*>[\s\S]*<\/math>$/.test(mathml)) {
    errors.push(`${term.slug}: Formel ist nicht als MathML hinterlegt`);
    continue;
  }
  const page = `begriffe/${term.slug}/index.html`;
  if (!fs.existsSync(page) || !fs.readFileSync(page, "utf8").includes("<math")) {
    errors.push(`${term.slug}: mathematische Darstellung fehlt auf der Detailseite`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Impact-Controlling Rechenlogik check passed for ${formulaTerms.length} priorisierten Formeln, ${calculationTerms.length} Berechnungsfolgen und ${glossary.terms.filter((entry) => entry.formula?.expression || entry.calculation?.expression).length} MathML-Formeln.`);
