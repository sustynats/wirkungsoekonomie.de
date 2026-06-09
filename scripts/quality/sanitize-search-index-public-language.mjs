import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const indexPath = path.join(root, "assets/search/search-index.json");

const replacements = [
  [/Druckdatum:\s*\d{1,2}\.\d{1,2}\.\d{4}/g, ""],
  [/Druckdatum:\s*\d{4}-\d{2}-\d{2}/g, ""],
  [/Druckdatum:/g, ""],
  [/Welche Wirkungslogik macht der [^?]+ als Modellrechnung sichtbar\?/g, "Welche Berechnung oder Modellannahme soll hier nachvollziehbar geprüft werden?"],
  [/Ein Rechner macht eine Wirkungsfrage prüfbarer\. Es ersetzt keine amtliche Bewertung, sondern zeigt Annahmen, Grenzen und nächste Prüfschritte\./g, "Ein Rechner macht eine Wirkungsfrage nachvollziehbarer. Die Seite zeigt Annahmen, Datenlage, Grenzen und mögliche nächste Prüfschritte; sie ist keine amtliche Bewertung."],
  [/PDF-Fassung in Produktion/g, "Vertiefungsmaterial wird ergänzt, sobald eine geprüfte Fassung vorliegt"],
  [/PDF wird ergänzt/g, "Vertiefungsmaterial wird ergänzt, sobald eine geprüfte Fassung vorliegt"],
  [/Auszug aus der umfangreichen Korrekturfassung/g, "Fachliche Vertiefung"],
  [/Umfang der Quellfassung: rund 0 Wörter/g, ""],
  [/ergänzende ergänzende/g, "ergänzende"],
  [/Kernformel\./g, "Der Perspektivwechsel in einem Satz."],
  [/Du liest die Onlinefassung dieses Konzeptpapiers/g, "Diese Onlinefassung ist der lesbare Hauptzugang zum Konzeptpapier"],
];

function cleanString(value) {
  let next = value;
  for (const [pattern, replacement] of replacements) {
    next = next.replace(pattern, replacement);
  }
  return next.replace(/[ \t]{2,}/g, " ").trim();
}

function cleanValue(value) {
  if (typeof value === "string") return cleanString(value);
  if (Array.isArray(value)) return value.map(cleanValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, cleanValue(entry)]));
  }
  return value;
}

if (!fs.existsSync(indexPath)) {
  console.warn("Search index not found; skipping public language sanitizer.");
  process.exit(0);
}

const before = fs.readFileSync(indexPath, "utf8");
const parsed = JSON.parse(before);
const cleaned = JSON.stringify(cleanValue(parsed), null, 2);

if (cleaned !== before) {
  fs.writeFileSync(indexPath, `${cleaned}\n`);
}

console.log(`Search index public language sanitizer: ${cleaned === before ? "0 changes" : "updated"}.`);
