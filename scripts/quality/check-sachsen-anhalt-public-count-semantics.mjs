import fs from "node:fs";
import path from "node:path";

const landingPagePath = path.join(
  process.cwd(),
  "woek-parlament-app",
  "app",
  "laender",
  "sachsen-anhalt",
  "page.tsx",
);
const programmeRendererPath = path.join(
  process.cwd(),
  "woek-parlament-app",
  "app",
  "components",
  "SaxonyAnhaltProgrammeAnalysisV3.tsx",
);

const landingSource = fs.readFileSync(landingPagePath, "utf8");
const programmeSource = fs.readFileSync(programmeRendererPath, "utf8");
const allPublicSources = `${landingSource}\n${programmeSource}`;

const forbiddenWhileDenominatorOpen = [
  "fachlich analysierte Zusageeinheiten",
  "vollständige Quellen- und Fachdatensätze",
  "Das vollständige Register bleibt erhalten",
  "Vollständiges Zusageregister öffnen",
];

const requiredWhileDenominatorOpen = [
  "Zusageeinheiten im aktuellen Quellenregister",
  "Primärquellen-Paritätsabgleich und Editorial-v2+-Vollreaudit laufen",
  "der finale Nenner ist noch nicht eingefroren",
  "finale Source-Unit-Manifest",
];

const failures = [];

for (const phrase of forbiddenWhileDenominatorOpen) {
  if (allPublicSources.includes(phrase)) {
    failures.push(`forbidden unresolved-parity completion wording: ${phrase}`);
  }
}

for (const phrase of requiredWhileDenominatorOpen) {
  if (!allPublicSources.includes(phrase)) {
    failures.push(`missing unresolved-parity public wording: ${phrase}`);
  }
}

if (failures.length > 0) {
  console.error("Sachsen-Anhalt public count semantics gate failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "Sachsen-Anhalt public count semantics gate PASS: working-register counts and programme source lists are not presented as final Fach/source-corpus completeness while primary-source parity/final manifest remain unresolved.",
);
