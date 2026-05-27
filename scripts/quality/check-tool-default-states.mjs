import fs from "node:fs";

const files = [
  "erleben.html",
  "erleben/automatisierungs-wirkungseinkommensrechner/index.html",
  "anwendungen/scanner.html",
];

const forbidden = [
  /Score Beispiel/i,
  /Beispiel wählen oder Werte ändern/i,
  /Beispiel wählen oder Text prüfen/i,
  /wird berechnet/i,
  />Beispiel</,
  /Beispielwerte aktiv/i,
  /\bFTE\b/,
];

const failures = [];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, "utf8");
  for (const pattern of forbidden) {
    if (pattern.test(text)) {
      failures.push(`${file}: ${pattern}`);
    }
  }
}

if (failures.length) {
  console.error("Tool default-state placeholders remain:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Tool default-state check passed.");
