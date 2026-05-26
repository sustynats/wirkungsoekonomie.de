import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const auditPath = path.join(root, "docs/usability-audit.md");
const targets = [
  "index.html",
  "buch.html",
  "downloads.html",
  "glossar.html",
  "akademie.html",
  "erleben.html",
  "assets/search/search-index.json",
  "assets/data/document-online",
  "assets/downloads",
  "public/data/woek-search-meta.json",
  "anwendungen",
  "begriffe",
  "bibliothek",
  "blog",
  "data",
  "downloads",
  "fachbibliothek",
  "fuer",
  "portale",
  "referenz",
  "verstehen",
  "werkstatt",
  "werkzeuge",
  "wirkungsfelder",
  "website-1-0-release",
];

const replacements = [
  [/Zum Detailkonzept/g, "Konzeptpapier lesen"],
  [/Detailkonzept online lesen/g, "Konzeptpapier online lesen"],
  [/Detailkonzept herunterladen/g, "Konzeptpapier als PDF herunterladen"],
  [/Detailkonzept lesen/g, "Konzeptpapier lesen"],
  [/Detailkonzepte lesen/g, "Konzeptpapiere lesen"],
  [/Detailkonzept \+ Dossier/g, "Konzeptpapier und Praxisdossier"],
  [/Fachdetailkonzepte/g, "fachliche Konzeptpapiere"],
  [/Fachdetailkonzept/g, "fachliches Konzeptpapier"],
  [/fachdetailkonzepte/g, "fachliche Konzeptpapiere"],
  [/fachdetailkonzept/g, "fachliches Konzeptpapier"],
  [/Echte Detailkonzepte/g, "Ausführliche Konzeptpapiere"],
  [/echte Detailkonzepte/g, "ausführliche Konzeptpapiere"],
  [/Detailkonzepte/g, "Konzeptpapiere"],
  [/Detailkonzept/g, "Konzeptpapier"],
  [/Einzeldossier-Set/g, "Praxisdossiers"],
  [/Einzeldossier/g, "Praxisdossier"],
  [/Online-Volltext/g, "Onlinefassung"],
  [/Online-Volltexte/g, "Onlinefassungen"],
  [/Online-Volltext ist der Hauptzugang/g, "Die Onlinefassung ist der Hauptzugang"],
  [/Portalstartseite/g, "Übersicht"],
  [/Portal öffnen/g, "Zur Übersicht"],
  [/Portaltext/g, "Onlinefassung"],
  [/Portalstruktur/g, "zentrale Übersicht"],
  [/Portalarchitektur/g, "Struktur"],
  [/portaltext/g, "onlinefassung"],
  [/portalstruktur/g, "zentrale Übersicht"],
  [/portalarchitektur/g, "struktur"],
  [/([A-ZÄÖÜ][A-Za-zÄÖÜäöüß-]+)portals/g, "$1bereichs"],
  [/([a-zäöüß-]+)portals/g, "$1bereichs"],
  [/kanonische Seitenadresse/gi, "zitierfähige Onlinefassung"],
  [/Kanonische Übersicht/g, "Zentrale Übersicht"],
  [/kanonisch/gi, "zentral"],
  [/PDF(?:\s+PDF){1,}\s+herunterladen/g, "PDF herunterladen"],
  [/PDF(?:\s+PDF){1,}/g, "PDF"],
];

function walk(entry, out = []) {
  const full = path.join(root, entry);
  if (!fs.existsSync(full)) return out;
  const stat = fs.statSync(full);
  if (stat.isDirectory()) {
    for (const child of fs.readdirSync(full, { withFileTypes: true })) {
      if (child.name === ".git" || child.name === "node_modules") continue;
      walk(path.join(entry, child.name), out);
    }
  } else if (full.endsWith(".html") || full.endsWith(".json")) {
    out.push(full);
  }
  return out;
}

function normalizeText(input) {
  let output = input;
  for (const [pattern, replacement] of replacements) {
    output = output.replace(pattern, replacement);
  }
  return output;
}

const files = [...new Set(targets.flatMap((target) => walk(target)))].sort();
const changed = [];
const beforeCounts = new Map();

for (const file of files) {
  const before = fs.readFileSync(file, "utf8");
  const after = normalizeText(before);
  let hits = 0;
  for (const [pattern] of replacements) {
    hits += before.match(pattern)?.length || 0;
  }
  if (hits) beforeCounts.set(path.relative(root, file), hits);
  if (after !== before) {
    fs.writeFileSync(file, after, "utf8");
    changed.push(path.relative(root, file));
  }
}

const remainingChecks = [
  ["öffentliche DOCX-/Word-Downloads", /DOCX herunterladen|Word herunterladen|Word-Datei|Word-Version|Word-Export|Weiterarbeit|Dateiformat DOCX|Dateiformat Word|href=["'][^"']+\.(?:docx|doc)/i],
  ["alte Detailkonzept-CTAs", /Zum Detailkonzept|Detailkonzept lesen|Detailkonzept online lesen|Detailkonzept herunterladen|Detailkonzept \+ Dossier|Detailkonzept ·|Detailkonzept v/i],
  ["Portal-/kanonisch-Sprache", /Portaltext|Portalstruktur|Portalarchitektur|Portal öffnen|kanonisch|Kanonisch/i],
  ["mehrfache PDF-Labels", /PDF(?:\s+PDF){1,}/i],
  ["generische Öffnen-CTAs", />\s*Öffnen\s*</i],
];

const remaining = remainingChecks.map(([label, pattern]) => {
  let hitFiles = 0;
  let hitCount = 0;
  for (const file of files.filter((item) => item.endsWith(".html"))) {
    const text = fs.readFileSync(file, "utf8");
    const matches = text.match(new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`));
    if (matches?.length) {
      hitFiles += 1;
      hitCount += matches.length;
    }
  }
  return { label, hitFiles, hitCount };
});

const audit = [
  "# Usability Audit",
  "",
  `Stand: ${new Date().toISOString()}`,
  "",
  "## Durchgeführte Korrekturen",
  "",
  "- alte öffentliche Labels wie „Detailkonzept“ wurden in nutzerverständlichere „Konzeptpapier“-Sprache überführt.",
  "- „Einzeldossier“ wurde zu „Praxisdossier“ geglättet.",
  "- „Online-Volltext“ wurde zu „Onlinefassung“ vereinheitlicht.",
  "- „Portal“- und „kanonisch“-Sprache wurde im öffentlichen Text reduziert.",
  "- mehrfach erzeugte PDF-Labels wurden bereinigt.",
  "- globale CSS/JS-UX-Schicht unterscheidet Link-, Info- und Dokumentkarten, klappt lange Inhaltsverzeichnisse mobil ein und schützt Tabellen vor Abschneiden.",
  "",
  "## Prüfumfang und Ergebnis",
  "",
  `- Geprüfte Dateien: ${files.length}`,
  `- In diesem finalen Prüflauf neu geänderte Dateien: ${changed.length}`,
  "- Die bereits angewendeten Korrekturen bleiben im Git-Diff dieses Releases nachvollziehbar.",
  "",
  ...changed.slice(0, 80).map((file) => `- \`${file}\``),
  changed.length > 80 ? `- ... ${changed.length - 80} weitere Dateien` : "",
  "",
  "## Restmuster nach Korrektur",
  "",
  "| Prüfung | Treffer | Dateien |",
  "| --- | ---: | ---: |",
  ...remaining.map((item) => `| ${item.label} | ${item.hitCount} | ${item.hitFiles} |`),
  "",
  "## Hinweise",
  "",
  "- Lange Onlinefassungen bleiben absichtlich online lesbar; die neue UX-Schicht macht Inhaltsverzeichnisse, Tabellen und Karten auf Mobile ruhiger.",
  "- Tiefere Fachbibliothek-Seiten enthalten weiterhin fachliche Langfassungen. Sie sind keine Landingpages, aber werden durch Begriffs- und Kartenpolitur lesbarer.",
  "- Vollständige redaktionelle Neuordnung aller Langtexte bleibt ein eigener Content-Sprint; dieser Audit beseitigt die sichtbarsten Template- und UX-Brüche.",
  "",
].filter(Boolean).join("\n");

fs.writeFileSync(auditPath, `${audit}\n`, "utf8");
console.log(`Public UX polish: ${changed.length} files changed -> docs/usability-audit.md`);
