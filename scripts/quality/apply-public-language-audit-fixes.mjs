import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const HTML_TARGETS = [
  "akademie.html",
  "anwendungen.html",
  "audio",
  "begriffe",
  "bibliothek",
  "blog.html",
  "blog",
  "buch.html",
  "dokumente",
  "erleben",
  "fachbibliothek",
  "fuer",
  "index.html",
  "journal",
  "lernen",
  "methodik",
  "mitmachen.html",
  "oeffentlicher-wirkungsraum",
  "portale",
  "referenz",
  "referenzrahmen",
  "tools",
  "verstehen",
  "werkstatt",
  "werkzeuge",
  "wirkungsfelder",
  "wissen",
  "woek-ki",
];

function walk(entry, files = []) {
  const full = path.join(ROOT, entry);
  if (!fs.existsSync(full)) return files;
  const stat = fs.statSync(full);
  if (stat.isDirectory()) {
    for (const child of fs.readdirSync(full, { withFileTypes: true })) {
      if (child.name === ".git" || child.name === "node_modules") continue;
      walk(path.join(entry, child.name), files);
    }
  } else if (entry.endsWith(".html")) {
    files.push(full);
  }
  return files;
}

function cleanPublicLanguage(html) {
  return html
    .replace(/Aktuelle Einordnungen werden geladen\./g, "Aktuelle Einordnungen findest du im Journal.")
    .replace(/Dein Browser kann diese Audiodatei nicht direkt abspielen\./g, "")
    .replace(
      /Jedes Portal erhält: Portalübersicht, Konzeptpapier, Gesamtdossier, Detailkonzepte zu allen Unterbereichen, Einzeldossiers zu allen Unterbereichen, Online-HTML\/Volltext, Download\/Export, Tool-Spezifikation, Codex-Anweisung und politische\./g,
      "Jedes Portal bündelt Übersicht, Konzeptpapier, Dossier, Detailtexte, Onlinefassung, Downloads, methodische Einordnung und politische Anschlussfragen.",
    )
    .replace(/Tool-Spezifikation/g, "Methodenbeschreibung")
    .replace(/Codex-Anweisung/g, "redaktionelle Arbeitsnotiz")
    .replace(/CodeX-Anweisung/g, "redaktionelle Arbeitsnotiz")
    .replace(/PDF-Fassung in Produktion/g, "Vertiefungsmaterial wird ergänzt, sobald eine geprüfte Fassung vorliegt")
    .replace(/PDF wird ergänzt/g, "Vertiefungsmaterial wird ergänzt, sobald eine geprüfte Fassung vorliegt")
    .replace(/ergänzende ergänzende/g, "ergänzende")
    .replace(/Umfang der Quellfassung: rund 0 Wörter\.?/g, "")
    .replace(/Auszug aus der umfangreichen Korrekturfassung/g, "Fachliche Vertiefung")
    .replace(/Kernformel\./g, "Der Perspektivwechsel in einem Satz.")
    .replace(
      /Du liest die Onlinefassung dieses Konzeptpapiers\. Die Downloadfassung und die Druckfunktion findest du am Ende der Seite\./g,
      "Diese Onlinefassung ist der lesbare Hauptzugang. Downloads dienen der Weiterarbeit und werden nur angezeigt, wenn eine geprüfte Datei vorliegt.",
    )
    .replace(
      /([A-ZÄÖÜ][^<.]{2,180}?) wird als fachlicher Unterbereich der Wirkungsökonomie online erklärt\. Ziel ist eine öffentliche Langfassung mit fachlicher Einordnung, Bewertungspfad, politischem Rahmen und zitierfähigen Ankern\./g,
      (_match, topic) =>
        `Dieses Konzept erklärt ${String(topic).trim()} als Wirkungsfrage: Welche Zustände verändern sich, wer ist betroffen und wie kann Bewertung in Entscheidungen zurückwirken?`,
    )
    .replace(
      /([A-ZÄÖÜ][^<.]{2,180}?) wird als fachlicher Unterbereich der Wirkungsökonomie online erklärt\./g,
      (_match, topic) => `Dieses Konzept erklärt ${String(topic).trim()} als Wirkungsfrage.`,
    )
    .replace(/\s+·\s+Druckdatum:\s*\d{1,2}\.\d{1,2}\.\d{4}/g, "")
    .replace(/\s+·\s+Druckdatum:\s*\d{4}-\d{2}-\d{2}/g, "")
    .replace(/Druckdatum:\s*\d{1,2}\.\d{1,2}\.\d{4}/g, "")
    .replace(/Druckdatum:\s*\d{4}-\d{2}-\d{2}/g, "")
    .replace(/[ \t]+\n/g, "\n");
}

const files = [...new Set(HTML_TARGETS.flatMap((target) => walk(target)))];
let touched = 0;

for (const file of files) {
  const before = fs.readFileSync(file, "utf8");
  const after = cleanPublicLanguage(before);
  if (after === before) continue;
  fs.writeFileSync(file, after);
  touched += 1;
}

console.log(`Public language audit fixes applied to ${touched} HTML files.`);
