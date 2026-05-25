import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const TARGETS = ["erleben", "anwendungen", "werkzeuge", "wirkungsfelder"];

const replacements = [
  [/Tool-Spezifikation und Rechenmodell/g, "Methodik und Annahmen"],
  [/Tool-Spezifikation:/g, "Methodik:"],
  [/Tool-Spezifikation/g, "Methodik"],
  [/\bInputs\b/g, "Eingaben"],
  [/\bOutputs\b/g, "Ergebnisse"],
  [/Website-Integration/g, "Einordnung auf der Website"],
  [/Nächster Entwicklungsschritt/g, "Methodik und Grenzen"],
  [/Demo in Vorbereitung/g, "Methodenseite"],
  [/Methodendokumentation folgt/g, "Methodik und Annahmen"],
  [/Datenquellen vorbereitet/g, "Datenquellen und Grenzen"],
  [/Version v0\.1/g, "Modellhafte Fassung"],
  [/Version: v0\.1/g, "Modellhafte Fassung"],
  [/Prototypen/g, "Demos"],
  [/Prototyp/g, "Modellhafte Demo"],
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

let changed = 0;
for (const file of TARGETS.flatMap((target) => walk(path.join(ROOT, target)))) {
  const before = fs.readFileSync(file, "utf8");
  const after = replacements.reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), before);
  if (after !== before) {
    fs.writeFileSync(file, after, "utf8");
    changed += 1;
  }
}

console.log(`Sanitized public tool language in ${changed} files.`);
