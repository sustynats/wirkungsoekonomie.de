import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const TARGETS = [
  "blog",
  "dokumente",
  "erleben",
  "anwendungen",
  "werkzeuge",
  "wirkungsfelder",
  "werkstatt",
  "verstehen",
  "referenzrahmen",
  "wissen",
  "akademie",
  "portale",
  "referenz",
  "downloads",
  "assets/downloads",
];
const ROOT_HTML_FILES = ["index.html", "erleben.html", "suche.html", "akademie.html", "downloads.html", "kompass.html", "modell.html", "glossar.html", "anwendungen.html", "workflow.html", "vergleich.html", "wirkungsoekonomie.html", "verstehen.html"];

const replacements = [
  [/Kontext-Werkzeuge/g, "Methoden & Werkzeuge"],
  [/Werkstatt:/g, "Bibliothek:"],
  [/Kosten je FTE/g, "Kosten je Vollzeitstelle"],
  [/\bFTE\b/g, "Vollzeitstellen"],
  [/Tool-Spezifikation und Rechenmodell/g, "Methodik und Annahmen"],
  [/Tool-Spezifikation:/g, "Methodik:"],
  [/Tool-Spezifikation/g, "Methodik"],
  [/Spezifikation online/g, "Methodik"],
  [/\bInputs\b/g, "Eingaben"],
  [/\bOutputs\b/g, "Ergebnisse"],
  [/Inputsteigerung/g, "Steigerung eingesetzter Mittel"],
  [/Website-Integration/g, "Einordnung auf der Website"],
  [/Nächster Entwicklungsschritt/g, "Methodik und Grenzen"],
  [/Demo in Vorbereitung/g, "Methodenseite"],
  [/Methodenseite vorhanden/g, "Methode"],
  [/Portal der Wirkungsökonomie/g, "Wirkungsökonomie"],
  [/Produktportal/g, "Produktbereich"],
  [/Erklärung vorhanden/g, "Methodik"],
  [/Download wird ergänzt/g, "Arbeitsmaterial"],
  [/Konzeptseite vorhanden/g, "Konzept"],
  [/Spezifikation online/g, "Methodik"],
  [/Toolkarte öffnen/g, "Toolkarte ansehen"],
  [/Audio verfügbar\. Transkript in Bearbeitung\./g, "Audio verfügbar."],
  [/Methodendokumentation folgt/g, "Methodik und Annahmen"],
  [/Datenquellen vorbereitet/g, "Datenquellen und Grenzen"],
  [/Version v0\.1/g, "Modellhafte Fassung"],
  [/Version: v0\.1/g, "Modellhafte Fassung"],
  [/\bv0\.1\b/gi, "Modellfassung"],
  [/Toolseite öffnen/g, "Methodik lesen"],
  [/Publikationszugang/g, "Vertiefung"],
  [/Portal öffnen/g, "Zur Übersicht"],
  [/Produktportal öffnen/g, "Produktwirkung verstehen"],
  [/Bildungsportal öffnen/g, "Wirkungsfeld öffnen"],
  [/Erklärung öffnen/g, "Methodik lesen"],
  [/Demo öffnen/g, "Beispiel ansehen"],
  [/Demo testen/g, "Beispiel ansehen"],
  [/Verwandte Portal- und Dossierseiten/g, "Verwandte Seiten und Materialien"],
  [/Portaltext online lesen/g, "Onlinefassung"],
  [/Portaltext/g, "Onlinefassung"],
  [/Online-Volltext ist der Hauptzugang/g, "Die Seite ist online lesbar"],
  [/Online-Volltext ist Hauptzugang/g, "Die Seite ist online lesbar"],
  [/Online-Volltexte/g, "Onlinefassungen"],
  [/Online-Volltext/g, "Onlinefassung"],
  [/Online lesen, gezielt zitieren/g, "Onlinefassung und Quellenarbeit"],
  [/Online lesen und herunterladen/g, "Vertiefung und Arbeitsmaterial"],
  [/online lesen und herunterladen/gi, "Vertiefung und Arbeitsmaterial"],
  [/Online lesen/g, "Onlinefassung lesen"],
  [/Online-Volltext, Druck und Download/g, "Vertiefung und Arbeitsmaterial"],
  [/Portalstruktur/g, "Übersicht"],
  [/Portalarchitektur/g, "Systemlandkarte"],
  [/Tool-Architektur/g, "Werkzeuglogik"],
  [/Einzeldossier-Set/g, "Einzeldossiers"],
  [/Detailkonzept \+ Dossier/g, "Vertiefung"],
  [/Dossier & Export/g, "Vertiefung"],
  [/Export & Archiv/g, "Arbeitsmaterial"],
  [/Dokumentenmatrix/g, "Materialübersicht"],
  [/Export- und Archivfassungen/g, "ergänzende Downloadfassungen"],
  [/Export- und Archiv/g, "Download"],
  [/Export und Archiv/g, "Download"],
  [/kanonische Seitenadresse/gi, "Seitenadresse"],
  [/kanonische Portalstruktur/gi, "öffentliche Systemlandkarte"],
  [/Kanonische Seitenadresse öffnen/g, "Seitenadresse"],
  [/Seitenadresse öffnen/g, "Seitenadresse"],
  [/Kanonische Seite öffnen/g, "Seite öffnen"],
  [/Kanonische Übersicht mit 17 SDGs und SDG\+/g, "Zentrale Übersicht zu SDGs und SDG+"],
  [/Kanonische Übersicht/g, "Zentrale Übersicht"],
  [/kanonische Erklärung liegt jeweils im Methodenregister unter \/werkzeuge\//gi, "ausführliche Methodik findest du im Bereich Werkzeuge"],
  [/kanonische Referenz/gi, "zentrale Referenz"],
  [/kanonische Adresse/gi, "Seitenadresse"],
  [/kanonisch/gi, "öffentlich"],
  [/in Vorbereitung/g, "wird ergänzt"],
  [/in Ausarbeitung/g, "Methodik"],
  [/Prototypen/g, "Demos"],
  [/Prototyp/g, "Modellhafte Demo"],
];

function ctaLabelForHref(href) {
  const value = String(href || "");
  if (!value || value === "#") return "";
  if (/assets\/downloads|\/downloads\/|\.pdf($|#|\?)|\.docx($|#|\?)/i.test(value)) return "Herunterladen";
  if (/\/begriffe\//i.test(value)) return "Glossarbegriff erklären";
  if (/\/wirkungsfelder\//i.test(value)) return "Wirkungsfeld ansehen";
  if (/\/werkzeuge\//i.test(value)) return "Methodik lesen";
  if (/\/erleben\/|\/anwendungen\/scanner\.html|scanner\.html/i.test(value)) return "Tool testen";
  if (/\/?wirkungsradar\/?($|#|\?)/i.test(value)) return "Debatten-Kompass öffnen";
  if (/(^|\/)kompass\.html($|#|\?)/i.test(value)) return "WÖk-Kompass öffnen";
  if (/\/akademie/i.test(value)) return "Lernpfad ansehen";
  if (/\/verstehen\/|\/modell\.html|\/referenz\//i.test(value)) return "Vertiefung lesen";
  if (/\/werkstatt\/|\/fachbibliothek\/|\/downloads/i.test(value)) return "Arbeitsmaterial ansehen";
  return "Mehr erfahren";
}

function sanitizeCtaText(html) {
  return html.replace(/<a\b([^>]*)>(\s*)([^<]*(?:Öffnen|öffnen))(\s*)<\/a>/g, (match, attrs, before, text, after) => {
    const href = attrs.match(/\bhref\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const rawHref = href ? (href[2] || href[3] || href[4] || "") : "";
    let label = ctaLabelForHref(rawHref);
    if (/rechner/i.test(text) && /erleben|werkzeuge/i.test(rawHref)) label = "Rechner nutzen";
    if (/dossier/i.test(text)) label = "Dossier lesen";
    if (/konzept/i.test(text)) label = "Konzept lesen";
    if (/method/i.test(text)) label = "Methodik lesen";
    if (/portal/i.test(text)) label = "Zur Übersicht";
    return label ? `<a${attrs}>${before}${label}${after}</a>` : match;
  });
}

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
const htmlFiles = [
  ...TARGETS.flatMap((target) => walk(path.join(ROOT, target))),
  ...ROOT_HTML_FILES.map((file) => path.join(ROOT, file)).filter((file) => fs.existsSync(file)),
];

for (const file of htmlFiles) {
  const before = fs.readFileSync(file, "utf8");
  const after = sanitizeCtaText(replacements.reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), before));
  if (after !== before) {
    fs.writeFileSync(file, after, "utf8");
    changed += 1;
  }
}

console.log(`Sanitized public tool language in ${changed} files.`);
