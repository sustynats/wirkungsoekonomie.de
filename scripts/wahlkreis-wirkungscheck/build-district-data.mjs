#!/usr/bin/env node
/**
 * Erstellt den lokalen Wahlkreis-Datensatz fuer den Wahlkreis-Wirkungscheck.
 *
 * Die Anwendung laedt keine Daten nach. Dieses Skript holt die amtlichen
 * Ausgangsdateien nur zur Build-Zeit und schreibt eine versionierte statische
 * JavaScript-Datei. PLZ sind eine Suchhilfe auf Basis der Verwaltungs-PLZ der
 * zugeordneten Gemeinden, nicht eine vollstaendige Postleitzahlen-Geometrie.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const output = resolve(root, "assets/js/wahlkreis-wirkungscheck/data-2025.js");

const sources = {
  districts: {
    institution: "Die Bundeswahlleiterin",
    title: "Wahlkreise und zugeordnete Gemeinden bei der Wahl zum 21. Deutschen Bundestag",
    year: "2024",
    level: "Wahlkreis und Gemeinde",
    quality: "amtliche Wahlkreiseinteilung",
    url: "https://www.bundeswahlleiterin.de/dam/jcr/aa868597-0e60-476c-bd2b-279c1e9a142a/btw25_wkr_gemeinden_20241130_utf8.csv",
    territorialNote: "Stand 30.11.2024. Verwaltungs-PLZ sind nur eine Suchhilfe und koennen mehreren Wahlkreisen zugeordnet sein.",
    licence: "Datenlizenz Deutschland Namensnennung 2.0"
  },
  names: {
    institution: "Die Bundeswahlleiterin",
    title: "Wahlkreisnamen zur Bundestagswahl 2025",
    year: "2025",
    level: "Wahlkreis",
    quality: "amtliche Wahlkreiseinteilung",
    url: "https://www.bundeswahlleiterin.de/dam/jcr/17e066f6-a0af-42df-a5d2-365dc87769ab/btw25_wahlkreisnamen_utf8.csv",
    territorialNote: "299 Wahlkreise zur Wahl des 21. Deutschen Bundestags.",
    licence: "Datenlizenz Deutschland Namensnennung 2.0"
  },
  structural: {
    institution: "Die Bundeswahlleiterin",
    title: "Strukturdaten für die Wahlkreise zum 21. Deutschen Bundestag",
    year: "2025",
    level: "Wahlkreis",
    quality: "amtliche Zusammenstellung; Beobachtungszeitpunkte je Kennzahl unterschiedlich",
    url: "https://www.bundeswahlleiterin.de/dam/jcr/181f9e38-38db-4f64-991c-8141dfa0f2cb/btw2025_strukturdaten.csv",
    territorialNote: "Bei Wahlkreisen, die Teile kreisfreier Städte oder Kreise umfassen, werden Angaben laut Quellenhinweis rechnerisch abgegrenzt.",
    licence: "Datenlizenz Deutschland Namensnennung 2.0; Rohdaten teilweise © Bundesagentur für Arbeit"
  }
};

const indicatorCatalog = [
  {
    id: "housing_completion",
    label: "Fertiggestellte Wohnungen",
    column: 19,
    suffix: " je 1.000 Einwohnerinnen und Einwohner",
    observation: "2023",
    source: "structural",
    territorialNote: "Wahlkreiswert; bei räumlichen Teilungen rechnerisch abgegrenzt."
  },
  {
    id: "under3_care",
    label: "Betreuungsquote unter Dreijähriger",
    column: 34,
    suffix: " %",
    observation: "01.03.2023",
    source: "structural",
    territorialNote: "Wahlkreiswert; keine Aussage über Qualität oder ungedeckten Bedarf."
  },
  {
    id: "household_income",
    label: "Verfügbares Einkommen privater Haushalte",
    column: 36,
    suffix: " Euro je Einwohnerin und Einwohner",
    observation: "2021",
    source: "structural",
    territorialNote: "Wahlkreiswert; zeitlich zurückliegende Beobachtung, nicht als aktuelle Kaufkraftmessung zu lesen."
  },
  {
    id: "employment",
    label: "Sozialversicherungspflichtig Beschäftigte",
    column: 37,
    suffix: " je 1.000 Einwohnerinnen und Einwohner",
    observation: "30.06.2023",
    source: "structural",
    territorialNote: "Wahlkreiswert; Arbeitsortbezug und keine Aussage über Arbeitsqualität."
  },
  {
    id: "unemployment",
    label: "Arbeitslosenquote",
    column: 46,
    suffix: " %",
    observation: "November 2024",
    source: "structural",
    territorialNote: "Wahlkreiswert; keine Bewertung einzelner Personen oder Regionen."
  }
];

function parseCsv(text) {
  return text.replace(/^\uFEFF/, "").split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split(";"));
}

function plzFrom(row) {
  return row.slice(15).flatMap((value) => (value || "").match(/\b\d{5}\b/g) || []);
}

function normaliseNumber(value) {
  return String(value || "").trim().replace(/\./g, "").replace(",", ".");
}

async function get(url) {
  const response = await fetch(url, { headers: { "user-agent": "wirkungsoekonomie-district-data-build/1.0" } });
  if (!response.ok) throw new Error(`Abruf fehlgeschlagen (${response.status}): ${url}`);
  return response.text();
}

const [namesText, municipalitiesText, structuralText] = await Promise.all([
  get(sources.names.url),
  get(sources.districts.url),
  get(sources.structural.url)
]);

const nameRows = parseCsv(namesText).slice(1);
const municipalityRows = parseCsv(municipalitiesText).slice(1);
const structuralRows = parseCsv(structuralText).slice(2);
const plzByDistrict = new Map();

for (const row of municipalityRows) {
  const number = String(row[0] || "").padStart(3, "0");
  if (!/^\d{3}$/.test(number)) continue;
  const values = plzByDistrict.get(number) || new Set();
  plzFrom(row).forEach((plz) => values.add(plz));
  plzByDistrict.set(number, values);
}

const structuralByDistrict = new Map();
for (const row of structuralRows) {
  const number = String(row[1] || "").padStart(3, "0");
  if (/^\d{3}$/.test(number)) structuralByDistrict.set(number, row);
}

const districts = nameRows
  .map((row) => ({ nr: String(row[0] || "").padStart(3, "0"), name: row[1], land: row[3] }))
  .filter((district) => /^\d{3}$/.test(district.nr) && Number(district.nr) <= 299)
  .map((district) => ({
    ...district,
    plz: [...(plzByDistrict.get(district.nr) || [])].sort(),
    context: "Amtlicher Wahlkreiszuschnitt 2025",
    indicators: indicatorCatalog.map((definition) => {
      const row = structuralByDistrict.get(district.nr);
      const raw = row ? normaliseNumber(row[definition.column]) : "";
      return {
        id: definition.id,
        label: definition.label,
        value: raw || null,
        suffix: definition.suffix,
        observation: definition.observation,
        source: definition.source,
        evidence: raw ? "amtlich" : "datenluecke",
        territorialNote: definition.territorialNote,
        gapReason: raw ? null : "Für diesen Wahlkreiswert liegt in der amtlichen Zusammenstellung keine Angabe vor."
      };
    })
  }));

const national = (structuralByDistrict.get("999") ? indicatorCatalog.map((definition) => {
  const row = structuralByDistrict.get("999");
  const raw = normaliseNumber(row[definition.column]);
  return {
    id: definition.id,
    label: definition.label,
    value: raw || null,
    suffix: definition.suffix,
    observation: definition.observation,
    source: definition.source,
    evidence: raw ? "amtlich" : "datenluecke",
    territorialNote: "Deutschland insgesamt; keine Aussage über einzelne Wahlkreise.",
    gapReason: raw ? null : "Für Deutschland insgesamt liegt in der amtlichen Zusammenstellung keine Angabe vor."
  };
}) : []);

if (districts.length !== 299) throw new Error(`Erwartet wurden 299 Wahlkreise, erhalten: ${districts.length}`);

const payload = {
  schemaVersion: "2025.1",
  dataAsOf: "Wahlkreiseinteilung: 30.11.2024; Strukturdaten: Veröffentlichung 2025, Beobachtungszeitpunkte je Kennzahl ausgewiesen.",
  generatedAt: new Date().toISOString().slice(0, 10),
  sources,
  indicatorCatalog: indicatorCatalog.map(({ column, ...entry }) => entry),
  districts,
  national
};

await mkdir(dirname(output), { recursive: true });
await writeFile(output, `/* Automatisch erzeugt. Quelle und Aktualisierung: scripts/wahlkreis-wirkungscheck/build-district-data.mjs */\nwindow.WC_DATA = ${JSON.stringify(payload)};\n`, "utf8");
console.log(`Wahlkreis-Datensatz geschrieben: ${output} (${districts.length} Wahlkreise)`);
