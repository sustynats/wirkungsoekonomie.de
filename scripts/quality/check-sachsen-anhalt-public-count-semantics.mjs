import fs from "node:fs";
import path from "node:path";

const pagePath = path.join(
  process.cwd(),
  "woek-parlament-app",
  "app",
  "laender",
  "sachsen-anhalt",
  "page.tsx",
);

const source = fs.readFileSync(pagePath, "utf8");

const forbiddenWhileDenominatorOpen = [
  "fachlich analysierte Zusageeinheiten",
  "vollständige Quellen- und Fachdatensätze",
];

const requiredWhileDenominatorOpen = [
  "Zusageeinheiten im aktuellen Quellenregister",
  "Primärquellen-Paritätsabgleich und Editorial-v2+-Vollreaudit laufen",
  "der finale Nenner ist noch nicht eingefroren",
];

const failures = [];

for (const phrase of forbiddenWhileDenominatorOpen) {
  if (source.includes(phrase)) {
    failures.push(`forbidden unresolved-parity completion wording: ${phrase}`);
  }
}

for (const phrase of requiredWhileDenominatorOpen) {
  if (!source.includes(phrase)) {
    failures.push(`missing unresolved-parity public wording: ${phrase}`);
  }
}

if (failures.length > 0) {
  console.error("Sachsen-Anhalt public count semantics gate failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "Sachsen-Anhalt public count semantics gate PASS: working register counts are not presented as terminal fach completion while primary-source parity/final denominator remain unresolved.",
);
