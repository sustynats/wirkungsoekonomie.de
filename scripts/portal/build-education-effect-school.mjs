import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://wirkungsoekonomie.de";
const DATE = "2026-05-24";
const CSS_VERSION = "20260524-bildung-reader-table-fix";
const JS_VERSION = "20260523-nachhaltigkeit";
const SRC = "docs/bildung-wirkungsschule";
const SOURCE = `${SRC}/source`;
const EXTRACT = `${SRC}/docx-extracts`;

const portalMatrix = JSON.parse(fs.readFileSync(path.join(ROOT, SOURCE, "bildung_wirkungsschule_modules_v0_1.json"), "utf8"));
const modules = portalMatrix.modules.map((module, index) => ({ ...module, index }));

const documents = {
  concept: {
    title: "Konzeptpapier Bildung & Wirkungsschule",
    shortTitle: "Konzeptpapier",
    md: `${EXTRACT}/woek_bildung_wirkungsschule_konzeptpapier_v0_1.md`,
    download: "assets/downloads/woek_bildung_wirkungsschule_konzeptpapier_v0_1.docx",
    route: "wirkungsfelder/bildung/konzept/index.html",
  },
  dossier: {
    title: "Gesamtdossier Bildung & Wirkungsschule",
    shortTitle: "Gesamtdossier",
    md: `${EXTRACT}/woek_bildung_wirkungsschule_gesamtdossier_v0_1.md`,
    download: "assets/downloads/woek_bildung_wirkungsschule_gesamtdossier_v0_1.docx",
    route: "wirkungsfelder/bildung/dossier/index.html",
  },
  details: {
    title: "Detailkonzepte Bildung & Wirkungsschule",
    shortTitle: "Detailkonzepte",
    md: `${EXTRACT}/woek_bildung_wirkungsschule_detailkonzepte_umfangreich_v0_1.md`,
    download: "assets/downloads/woek_bildung_wirkungsschule_detailkonzepte_umfangreich_v0_1.docx",
    route: "wirkungsfelder/bildung/detailkonzepte/index.html",
  },
  singleDossiers: {
    title: "Einzeldossiers Bildung & Wirkungsschule",
    shortTitle: "Einzeldossiers",
    md: `${EXTRACT}/woek_bildung_wirkungsschule_einzeldossier_set_v0_1.md`,
    download: "assets/downloads/woek_bildung_wirkungsschule_einzeldossier_set_v0_1.docx",
    route: "wirkungsfelder/bildung/dossiers/index.html",
  },
  toolSuite: {
    title: "Methodik Wirkungsschule-Tool-Suite",
    shortTitle: "Methodik",
    md: `${SOURCE}/tool_spezifikation_wirkungsschule_tool_suite.md`,
    download: "assets/downloads/tool_spezifikation_wirkungsschule_tool_suite.md",
    route: "wirkungsfelder/bildung/tools/index.html",
  },
};

const toolEntries = [
  ["wirkungsschule-check", "Wirkungsschule-Check", "Erleben", "Reifegrad-Check für Schulentwicklung, Unterricht, Förderung, Räume, Demokratiepraxis und Datenethik. Keine personenbezogene Bewertung.", "erleben/wirkungsschule-check/"],
  ["wirkungsportfolio-generator", "Wirkungsportfolio-Generator", "Erleben", "Erstellt eine Struktur für Lernweg, Projektarbeit, Feedback, Reflexion und Kompetenzprofil. Das Portfolio bleibt Lerninstrument, kein Ranking.", "erleben/wirkungsportfolio-generator/"],
  ["fach-zukunft-generator", "Fach-Zukunft-Modulgenerator", "Erleben", "Verbindet Jahrgang, Thema, lokale Frage, Fächer, SDGs/SDG+ und Ergebnisformat zu einem Projektmodul.", "erleben/fach-zukunft-generator/"],
  ["wirkungsfoerderungs-check", "Wirkungsförderungs-Check", "Erleben", "Strukturiert präventive Förderung, Potenzialförderung, Mentoring und außerschulische Unterstützung ohne Stigmatisierung.", "erleben/wirkungsfoerderungs-check/"],
  ["schulraum-wirkungscheck", "Schulraum-Wirkungscheck", "Werkzeug", "Prüft Licht, Lärm, Temperatur, Pausen, Ernährung, Bewegung, Sicherheit, Barrierefreiheit, Hitzeschutz und Zugehörigkeit.", "werkzeuge/schulraum-wirkungscheck/"],
  ["bildungswirkungsindex-bwk", "Bildungswirkungsindex / BWK", "Werkzeug", "Rahmen für Bildungswirkung auf Wissen, Selbstwirksamkeit, Demokratie, Gesundheit, Teilhabe, digitale Mündigkeit und Resilienz.", "werkzeuge/bildungswirkungsindex-bwk/"],
  ["woek-ids", "WÖk-IDs", "Datenarchitektur", "Verbinden SDG-/SDG+-Referenzen mit messbaren Bildungsindikatoren, Schutzgrenzen und Datenqualität.", "werkzeuge/woek-ids/"],
  ["scorecards", "Scorecards", "Methode", "Übersetzen Wirkungsdaten in transparente Bewertungsraster. Im Bildungsbereich nur für Strukturen und Maßnahmen, nicht für Menschen.", "werkzeuge/scorecards/"],
];

const conceptCards = [
  {
    title: "Bildung als Wirkungsinfrastruktur",
    text: "Bildung wirkt nicht erst am Arbeitsmarkt. Sie stärkt Selbstwirksamkeit, Urteilskraft, Teilhabe, Gesundheit, Demokratie und Zukunftsfähigkeit.",
    why: "So wird Bildung als gesellschaftliche Infrastruktur sichtbar, nicht nur als Unterrichtsleistung.",
    tags: ["SDG 4", "Teilhabe", "Wirkungskompetenz"],
    url: "wirkungsfelder/bildung/bildung-als-wirkungsinfrastruktur/",
  },
  {
    title: "Die Wirkungsschule",
    text: "Schule wird als Lern-, Lebens-, Demokratie-, Gesundheits- und Wirkungsraum verstanden. Entscheidend sind Strukturen, Schutz, Beziehung und Lernentwicklung.",
    why: "Schule erzeugt Wirkung weit über Noten und Abschlüsse hinaus.",
    tags: ["Schulraum", "Demokratie", "Gesundheit"],
    url: "wirkungsfelder/bildung/wirkungsschule/",
  },
  {
    title: "Wirkungspädagogik",
    text: "Wirkungspädagogik verbindet Fachlernen, Reflexion, Verantwortung und konkrete Veränderung. Kinder und Jugendliche werden nicht gerankt.",
    why: "Lernen wird mit Selbstwirksamkeit und Verantwortung verbunden.",
    tags: ["Pädagogik", "Selbstwirksamkeit", "Schutz"],
    url: "wirkungsfelder/bildung/wirkungspaedagogik/",
  },
  {
    title: "Fächer neu denken und vernetzen",
    text: "Fächer behalten Tiefe, werden aber stärker mit realen Fragen verbunden: Klima, Gesundheit, Medien, Arbeit, Demokratie und Technik.",
    why: "Komplexe Probleme lassen sich selten aus einem Fach allein verstehen.",
    tags: ["Fächer", "Systemdenken", "Transfer"],
    url: "wirkungsfelder/bildung/faecher-neu-denken/",
  },
  {
    title: "Fach oder Lernfeld Zukunft",
    text: "Ein Zukunftslernfeld bündelt Wirkungskompetenz, Medienkompetenz, Demokratiepraxis, KI-Verständnis und nachhaltige Entwicklung.",
    why: "Zukunftsfähigkeit braucht Raum im Curriculum.",
    tags: ["Zukunft", "KI", "SDG+"],
    url: "wirkungsfelder/bildung/fach-zukunft/",
  },
  {
    title: "Bewertung, Noten und Wirkungsportfolio",
    text: "Bewertung soll Leistung sichtbar machen, ohne Entwicklung zu beschämen. Portfolios können Lernwege, Reflexion und Wirkung dokumentieren.",
    why: "Das reduziert die Verengung auf Einzelleistungen und Momentaufnahmen.",
    tags: ["Portfolio", "Bewertung", "Lernweg"],
    url: "wirkungsfelder/bildung/bewertung-wirkungsportfolio/",
  },
  {
    title: "Wirkungsförderung",
    text: "Förderung beginnt nicht erst beim Defizit. Sie erkennt Potenziale, Belastungen, Teilhaberisiken und Unterstützungsbedarfe früher.",
    why: "Prävention wird sichtbarer und fairer finanzierbar.",
    tags: ["Förderung", "Prävention", "Teilhabe"],
    url: "wirkungsfelder/bildung/wirkungsfoerderung/",
  },
  {
    title: "Digitale Mündigkeit und KI-Kompetenz",
    text: "Digitale Bildung meint nicht nur Geräte. Sie umfasst Datenverständnis, Quellenklarheit, Plattformlogik, KI, Datenschutz und Selbstbestimmung.",
    why: "Digitale Räume prägen Lernen, Öffentlichkeit und Demokratie.",
    tags: ["KI", "Datenschutz", "Medienqualität"],
    url: "wirkungsfelder/bildung/digitale-muendigkeit-ki-kompetenz/",
  },
  {
    title: "Demokratie-, Medien- und Wirkungskompetenz",
    text: "Schüler:innen lernen, Informationen zu prüfen, Konflikte auszuhalten, Wirkung zu reflektieren und demokratisch handlungsfähig zu bleiben.",
    why: "Demokratie braucht gelernte Urteilskraft und Diskursfähigkeit.",
    tags: ["Demokratie", "Medien", "Diskurs"],
    url: "wirkungsfelder/bildung/demokratie-medien-wirkungskompetenz/",
  },
  {
    title: "Schule als Lebens-, Gesundheits- und Wirkungsraum",
    text: "Räume, Pausen, Bewegung, Ernährung, Lärm, Hitze, Sicherheit und Beziehung wirken direkt auf Lernen und Wohlbefinden.",
    why: "Gesundheit und Bildung werden gemeinsam steuerbar.",
    tags: ["Gesundheit", "Raum", "Resilienz"],
    url: "wirkungsfelder/bildung/schule-als-lebensraum/",
  },
  {
    title: "Inklusion, Vielfalt, Migration und Begabung",
    text: "Vielfalt wird als Bildungswirklichkeit verstanden. Entscheidend sind Sprache, Teilhabe, Schutz, Förderung und hohe Erwartungen ohne Beschämung.",
    why: "Gerechte Bildung hängt an Zugängen, nicht an Herkunft.",
    tags: ["Inklusion", "Vielfalt", "Migration"],
    url: "wirkungsfelder/bildung/inklusion-vielfalt-migration-begabung/",
  },
  {
    title: "Lehrkräfte, Schulleitung, Teams und Bildungsnetzwerke",
    text: "Wirkung entsteht nicht durch Einzelheld:innen. Lehrkräfte, multiprofessionelle Teams, Leitung, Eltern, Kommune und Partner brauchen passende Strukturen.",
    why: "Entlastung und Kooperation sind Wirkungsvoraussetzungen.",
    tags: ["Teams", "Netzwerke", "Entlastung"],
    url: "wirkungsfelder/bildung/lehrkraefte-schulleitung-teams-netzwerke/",
  },
];

const sdgRefs = [
  ["sdg-4", "SDG 4 Hochwertige Bildung", "Direkter Zielrahmen für inklusive, chancengerechte und hochwertige Bildung sowie lebenslanges Lernen.", "verstehen/sdgs-sdgplus/sdg-4-hochwertige-bildung/"],
  ["sdg-3", "SDG 3 Gesundheit und Wohlergehen", "Schulstress, Bewegung, Ernährung, mentale Gesundheit, Sicherheit und Beziehung wirken auf Lernen.", "verstehen/sdgs-sdgplus/sdg-3-gesundheit-wohlergehen/"],
  ["sdg-5", "SDG 5 Geschlechtergleichstellung", "Rollenbilder, Zugang, Schutz vor Diskriminierung und faire Förderung prägen Bildungswirkung.", "verstehen/sdgs-sdgplus/sdg-5-geschlechtergleichstellung/"],
  ["sdg-8", "SDG 8 Menschenwürdige Arbeit", "Bildung beeinflusst Future Skills, Berufsorientierung, Care-Arbeit, KI-Transformation und gute Arbeit.", "verstehen/sdgs-sdgplus/sdg-8-menschenwuerdige-arbeit-wirtschaftswachstum/"],
  ["sdg-10", "SDG 10 Weniger Ungleichheiten", "Soziale Herkunft, Armut, Behinderung, Migration, Sprache und Förderung entscheiden über Teilhabe.", "verstehen/sdgs-sdgplus/sdg-10-weniger-ungleichheiten/"],
  ["sdg-11", "SDG 11 Nachhaltige Städte und Gemeinden", "Schulen sind kommunale Räume: Quartier, Mobilität, Hitzeschutz, Kultur, Gesundheit und Sozialraum wirken mit.", "verstehen/sdgs-sdgplus/sdg-11-nachhaltige-staedte-gemeinden/"],
  ["sdg-16", "SDG 16 Frieden, Gerechtigkeit und starke Institutionen", "Demokratiebildung, Rechtsstaatlichkeit, Streitfähigkeit, Beteiligung und Medienqualität werden gelernt und praktiziert.", "verstehen/sdgs-sdgplus/sdg-16-frieden-gerechtigkeit-starke-institutionen/"],
  ["sdg-17", "SDG 17 Partnerschaften", "Bildung gelingt durch Partnerschaften zwischen Schule, Eltern, Kommune, Wissenschaft, Kultur, Wirtschaft und Zivilgesellschaft.", "verstehen/sdgs-sdgplus/sdg-17-partnerschaften/"],
  ["sdgplus-demokratie", "SDG+ Demokratie", "Demokratische Teilhabe, Minderheitenschutz, Streitfähigkeit und Korrekturfähigkeit als Bildungswirkung.", "verstehen/sdgs-sdgplus/#sdgplus-demokratie"],
  ["sdgplus-medienqualitaet", "SDG+ Medienqualität", "Quellenklarheit, Desinformation, journalistische Qualität und öffentliche Wahrheit als Lern- und Schutzdimension.", "verstehen/sdgs-sdgplus/#sdgplus-medienqualitaet"],
  ["sdgplus-diskursfaehigkeit", "SDG+ Diskursfähigkeit", "Die Fähigkeit, Konflikte faktenbasiert, respektvoll und demokratisch zu bearbeiten.", "verstehen/sdgs-sdgplus/#sdgplus-diskursfaehigkeit"],
  ["sdgplus-institutionelles-vertrauen", "SDG+ institutionelles Vertrauen", "Vertrauen entsteht durch faire Verfahren, transparente Daten, Rechtsschutz und lernende Institutionen.", "verstehen/sdgs-sdgplus/#sdgplus-institutionelles-vertrauen"],
  ["sdgplus-digitale-selbstbestimmung", "SDG+ digitale Selbstbestimmung", "KI, Daten, Plattformen, algorithmische Fairness und digitale Souveränität als Bildungs- und Schutzdimension.", "verstehen/sdgs-sdgplus/#sdgplus-digitale-selbstbestimmung"],
];

const bookAnchors = [
  ["Kapitel 67 - Bildung als Wirkungsinfrastruktur", "referenz/kapitel-067-bildung/"],
  ["Kapitel 15 - Leistung neu definieren", "referenz/kapitel-015-leistung-neu-definieren/"],
  ["Kapitel 16 - Begriffssystem der Wirkungsökonomie", "referenz/kapitel-016-das-begriffssystem-der-wirkungsoekonomie/"],
  ["Kapitel 28 - Demokratie als Wirkungsraum", "referenz/kapitel-028-demokratie-als-wirkungsraum/"],
  ["Kapitel 31 - WÖk-IDs und Indikatorenarchitektur", "referenz/kapitel-031-woek-ids-und-indikatorenarchitektur/"],
  ["Kapitel 32 - Benchmarks, Skalen und Scorecards", "referenz/kapitel-032-benchmarks-skalen-und-scorecards/"],
  ["Kapitel 39 - Wirkungshaushalt und öffentliche Mittel", "referenz/kapitel-039-wirkungshaushalt-und-oeffentliche-mittel/"],
  ["Kapitel 56 - Arbeit, Automatisierung und Maschinenleistung", "referenz/kapitel-056-arbeit-automatisierung-und-maschinenleistung/"],
  ["Kapitel 68 - Gesundheit", "referenz/kapitel-068-gesundheit/"],
  ["Kapitel 74 - Öffentlichkeit als Wirkungsraum", "referenz/kapitel-074-oeffentlichkeit-als-wirkungsraum/"],
  ["Online-Buch Hauptseite", "referenz/"],
];

const relatedLinks = [
  ["Staat, Recht & Demokratie", "Politische Umsetzung, Grundrechte, Datenschutz, Wirkungshaushalt, Wirkungsrat und Rechtsschutz.", "wirkungsfelder/staat-recht-demokratie/"],
  ["Arbeit & Einkommen", "Future Skills, KI, Automatisierung, Care, Wirkungseinkommen und Übergänge in gute Arbeit.", "wirkungsfelder/arbeit-einkommen/"],
  ["Gesundheit & Pflege", "Mentale Gesundheit, Prävention, Schulraum, Ernährung, Bewegung und Pflege als Bildungsumfeld.", "wirkungsfelder/gesundheit-pflege/"],
  ["Medien & Öffentlichkeit", "Medienqualität, Desinformation, Plattformen, demokratische Sprache und digitale Öffentlichkeit.", "wirkungsfelder/medien-oeffentlichkeit/"],
  ["Wissenschaft, Innovation & Digitalisierung", "Open Science, KI-Kompetenz, Datenräume, digitale Souveränität und Forschungskompetenz.", "wirkungsfelder/wissenschaft-innovation-digitalisierung/"],
  ["SDG-/SDG+-Referenzrahmen", "Der öffentliche Bewertungsrahmen für positive, negative und neutrale Wirkung.", "verstehen/sdgs-sdgplus/"],
];

const sources = [
  ["Bildung in Deutschland 2024", "Nationaler Bildungsbericht als Daten- und Problemrahmen.", "https://www.bildungsbericht.de/de/bildungsberichte-seit-2006/bildungsbericht-2024"],
  ["Destatis: Bildung in Deutschland 2024", "Offizielle Publikationsseite des Bildungsberichts.", "https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Bildung-Forschung-Kultur/Bildungsstand/Publikationen/Downloads-Bildungsstand/bildung-deutschland-hauptbericht-5210001.html"],
  ["IQB-Bildungstrend 2024", "Kompetenzstände in Mathematik und Naturwissenschaften in der Sekundarstufe I.", "https://www.iqb.hu-berlin.de/de/schule/sekundarstufe-i/bildungstrend/2024/"],
  ["OECD PISA 2022 Germany Country Note", "Internationaler Vergleich und soziale Disparitäten.", "https://www.oecd.org/en/publications/pisa-2022-results-volume-i-and-ii-country-notes_ed6fbcc5-en/germany_1a2cf137-en.html"],
  ["KMK: Bildung in der digitalen Welt", "Strategie und Weiterentwicklung für digitale Bildung.", "https://www.kmk.org/bildungsministerkonferenz/bildungsthemen/bildung-in-der-digitalen-welt.html"],
  ["KMK: Demokratiebildung", "Demokratiebildung als wesentlicher Bildungsauftrag.", "https://www.kmk.org/bildungsministerkonferenz/bildungsthemen/demokratiebildung.html"],
  ["KMK: Bildung für nachhaltige Entwicklung", "BNE-Empfehlung und Anschluss an SDG 4.7.", "https://www.kmk.org/bildungsministerkonferenz/vertiefende-bildungsinhalte/allgemeinbildende-schulen/bildung-fuer-nachhaltige-entwicklung.html"],
  ["BMBFSFJ: Startchancen-Programm", "Bund-Länder-Programm für Schulen in herausfordernden sozialen Lagen.", "https://www.bmbfsfj.bund.de/bmbfsfj/themen/bildung/schule/startchancen-programm-274440"],
  ["UNESCO: Reimagining our futures together", "Bildung als gemeinsamer Zukunftsvertrag.", "https://www.unesco.org/en/articles/reimagining-our-futures-together-new-social-contract-education"],
  ["OECD Learning Compass 2030", "Zukunftskompetenzen, student agency und transformative competencies.", "https://www.oecd.org/education/2030-project/"],
];

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function read(rel) {
  return exists(rel) ? fs.readFileSync(path.join(ROOT, rel), "utf8") : "";
}

function write(rel, html) {
  const out = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${html.replace(/[ \t]+$/gm, "")}\n`, "utf8");
}

function routeFor(rel) {
  return rel.endsWith("/index.html") ? `/${rel.slice(0, -"/index.html".length)}/` : `/${rel}`;
}

function baseFor(rel) {
  return "../".repeat(path.dirname(rel).split("/").filter(Boolean).length);
}

function href(base, target) {
  if (!target) return "";
  if (/^(https?:|mailto:|#)/.test(target)) return target;
  return `${base}${target.replace(/^\/+/, "")}`;
}

function cite(id, label = "Zitierlink zu diesem Abschnitt") {
  return `<a class="cite-anchor no-print" href="#${esc(id)}" aria-label="${esc(label)}">#</a>`;
}

function h2(id, text) {
  return `<h2 id="${esc(id)}">${esc(text)} ${cite(id)}</h2>`;
}

function cleanPublicText(text) {
  let value = String(text || "").replace(/\r\n/g, "\n").replace(/^\uFEFF/, "");
  value = value
    .replaceAll("Öffentliche Konzept- und Dossierfassung. Interne Umsetzungsanweisungen sind nicht Bestandteil dieses Dokuments.", "Öffentliche Konzept- und Dossierfassung.")
    .replaceAll("Publikationsstandard Dieses Dokument bündelt die umfangreichen Detailkonzepte der Unterbereiche. Auf der Website sollen daraus jeweils eigenständige Online-Volltextseiten und Download-Dokumente entstehen. Es enthält keine internen technischen Anweisungen.", "Publikationsstandard Dieses Dokument bündelt die umfangreichen Detailkonzepte der Unterbereiche.")
    .replaceAll("Website-Pfad:", "Online-Zugang:")
    .replaceAll("Das Dossier soll dort vollständig online lesbar sein und zusätzlich als Word/PDF downloadbar bleiben.", "Die Dossierfassung ist online lesbar; Downloads dienen als Export und Archiv.");
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => !/CodeX|Codex|Repository|Build|Sitemap|Dateien anlegen|bitte prüfen|Toolaufruf|Prompt|ChatGPT|Python|interne Aufgabe|Abschlussbericht|interne Umsetzungsanweisung|internen technischen/i.test(line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function plainMarkdownText(value) {
  return String(value)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .trim();
}

function inlineHtml(value) {
  const text = String(value).replace(/\*\*([^*]+)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1");
  const parts = [];
  let last = 0;
  const pattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = pattern.exec(text))) {
    parts.push(esc(text.slice(last, match.index)));
    const label = plainMarkdownText(match[1]);
    const url = match[2].trim();
    if (url && !/^javascript:/i.test(url)) {
      const external = /^https?:/.test(url);
      parts.push(`<a class="text-link" href="${esc(url)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${esc(label)}</a>`);
    } else {
      parts.push(esc(label));
    }
    last = pattern.lastIndex;
  }
  parts.push(esc(text.slice(last)));
  return parts.join("");
}

function markdownishToHtml(markdown) {
  const lines = cleanPublicText(markdown).split("\n");
  const toc = [];
  const html = [];
  let list = [];
  let table = [];
  let paragraph = [];
  let count = 0;
  const used = new Set();
  const unique = (raw) => {
    const base = slugify(raw) || "abschnitt";
    let id = base;
    let suffix = 2;
    while (used.has(id)) {
      id = `${base}-${suffix}`;
      suffix += 1;
    }
    used.add(id);
    return id;
  };
  const flushParagraph = () => {
    if (!paragraph.length) return;
    count += 1;
    const id = unique(`absatz-${String(count).padStart(3, "0")}`);
    html.push(`<p id="${id}">${inlineHtml(paragraph.join(" "))} ${cite(id, "Zitierlink zu diesem Absatz")}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    html.push(`<ul>${list.map((item) => `<li>${inlineHtml(item)}</li>`).join("")}</ul>`);
    list = [];
  };
  const flushTable = () => {
    if (!table.length) return;
    const rows = table
      .map((row) => row.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()))
      .filter((row) => !row.every((cell) => /^:?-{3,}:?$/.test(cell)));
    if (rows.length > 1) {
      const [head, ...body] = rows;
      html.push(`<div class="table-wrap"><table class="data-table"><thead><tr>${head.map((cell) => `<th>${inlineHtml(cell)}</th>`).join("")}</tr></thead><tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${inlineHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
    } else if (rows.length === 1) {
      html.push(`<p>${inlineHtml(rows[0].join(" "))}</p>`);
    }
    table = [];
  };
  const heading = (level, text) => {
    flushParagraph();
    flushList();
    flushTable();
    const cleanText = plainMarkdownText(text);
    const id = unique(cleanText);
    toc.push({ level, text: cleanText, id });
    html.push(`<h${level} id="${id}">${esc(cleanText)} ${cite(id)}</h${level}>`);
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushParagraph();
      flushList();
      flushTable();
      continue;
    }
    if (/^WIRKUNGSÖKONOMIE/.test(line)) continue;
    if (line.startsWith("|") && line.endsWith("|")) {
      flushParagraph();
      flushList();
      table.push(line);
      continue;
    }
    const mdHeading = line.match(/^(#{1,4})\s+(.+)$/);
    if (mdHeading) {
      heading(Math.max(2, Math.min(4, mdHeading[1].length + 1)), mdHeading[2]);
      continue;
    }
    if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      flushParagraph();
      flushTable();
      list.push(line.replace(/^([-*]|\d+\.)\s+/, ""));
      continue;
    }
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  flushTable();
  return { toc, html: html.join("\n") };
}

function sectionFor(docText, module, kind) {
  const lines = cleanPublicText(docText).split("\n");
  const startLabel = kind === "dossier" ? `# Dossier ${module.index + 1}:` : `# ${module.index + 1}. ${module.name}`;
  const nextLabel = kind === "dossier" ? `# Dossier ${module.index + 2}:` : `# ${module.index + 2}. `;
  const start = lines.findIndex((line) => line.trim().startsWith(startLabel));
  if (start < 0) return "";
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (lines[i].trim().startsWith(nextLabel) || /^# Quellen und Referenzen/.test(lines[i].trim())) {
      end = i;
      break;
    }
  }
  return lines.slice(start, end).join("\n");
}

function page({ rel, title, description, section = "Wirkungsfelder", type = "Portal", body }) {
  const base = baseFor(rel);
  const canonical = `${SITE}${routeFor(rel)}`;
  write(rel, `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <meta name="search_title" content="${esc(title.replace(/\s+\|.*$/, ""))}">
    <meta name="search_description" content="${esc(description)}">
    <meta name="search_section" content="${esc(section)}">
    <meta name="search_type" content="${esc(type)}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="${esc(title.replace(/\s+\|.*$/, ""))}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${SITE}/assets/img/generated/hero-systemgrafik-wirkungsoekonomie.png">
    <link rel="icon" href="${base}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=20260605-wirkungsraum-stage6">
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="${base}index.html" aria-label="Wirkungsökonomie Startseite"><span class="brand-mark"><img src="${base}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span><span class="brand-name">Wirkungsökonomie</span></a>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav"><span class="nav-toggle-icon" aria-hidden="true">☰</span><span class="sr-only">Menü</span></button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation"><a href="${base}index.html">Start</a></nav>
    </header>
    <main>
      <p class="print-meta">Wirkungsökonomie · ${esc(title.replace(/\s+\|.*$/, ""))} · ${canonical} · Druckdatum: ${DATE}</p>
${body(base, canonical)}
    </main>
    <script src="${base}assets/js/main.js?v=20260605-wirkungsraum-stage6"></script>
  </body>
</html>`);
}

function tocBlock(items) {
  if (!items.length) return "";
  return `<nav class="toc-card no-print" aria-label="Inhaltsverzeichnis"><h2 class="card-title">Inhaltsverzeichnis</h2><ol class="toc-links">${items.slice(0, 60).map((item) => `<li class="toc-level-${item.level}"><a href="#${esc(item.id)}">${esc(item.text)}</a></li>`).join("")}</ol></nav>`;
}

function cards(base, items) {
  return `<div class="card-grid three">${items.map(([title, kicker, text, url, label = "Mehr lesen"]) => `<article class="card"><p class="card-kicker">${esc(kicker)}</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(text || "")}</p>${url ? `<div class="portal-card-actions"><a class="text-link" href="${href(base, url)}">${esc(label)}</a></div>` : ""}</article>`).join("")}</div>`;
}

function chipList(items) {
  return `<div class="model-strip">${items.map((item) => `<span class="badge">${esc(item)}</span>`).join("")}</div>`;
}

function conceptCardGrid(base) {
  return `<div class="card-grid three">${conceptCards.map((item) => `<article class="card concept-card"><p class="card-kicker">Konzept</p><h3 class="card-title">${esc(item.title)}</h3><p class="card-text">${esc(item.text)}</p><p class="card-text"><strong>Warum relevant?</strong> ${esc(item.why)}</p>${chipList(item.tags)}${exists(`${item.url}index.html`) ? `<div class="portal-card-actions"><a class="text-link" href="${href(base, item.url)}">Konzept lesen</a></div>` : ""}</article>`).join("")}</div>`;
}

function politicsLandingBox() {
  const points = [
    ["Bildung als Wirkungsinfrastruktur anerkennen", "Schule, Förderung, Ganztag, Sozialraum, Demokratiebildung und digitale Mündigkeit gehören zusammen."],
    ["Lehrpläne an Wirkungskompetenz anbinden", "Standards müssen Wissen, Urteilskraft, Medienkompetenz, Selbstwirksamkeit und demokratische Handlungsfähigkeit verbinden."],
    ["Förderung präventiv finanzieren", "Unterstützung darf nicht erst einsetzen, wenn Defizite verfestigt sind."],
    ["Datenschutz und Schutz vor Kinder-Scoring sichern", "Daten dürfen Lernen unterstützen, aber keine Kinder, Familien oder Lehrkräfte ranken."],
    ["Teams entlasten", "Lehrkräfte, Schulleitungen und multiprofessionelle Teams brauchen Zeit, Ressourcen und klare Zuständigkeiten."],
    ["Modellschulen und Pilotregionen ermöglichen", "Wirkungsschulen brauchen erprobte Räume, Evaluation und lernende Korrektur."],
    ["Wirkung demokratisch kontrollieren", "Wirkungsdaten bereiten Entscheidungen vor, ersetzen aber keine pädagogische und demokratische Verantwortung."],
  ];
  return `<section class="section" aria-labelledby="politik-landing"><div class="section-header"><p class="hero-kicker">Umsetzung</p>${h2("politik-landing", "Was muss Politik hier tun?")}<p>Bildung verändert sich nicht durch ein einzelnes Gesetz. Politik muss den Rahmen schaffen, damit Wirkungskompetenz, Prävention, Schutz und Teilhabe praktisch möglich werden.</p></div><div class="card-grid three">${points.map(([title, text]) => `<article class="card"><p class="card-kicker">Handlungspunkt</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(text)}</p></article>`).join("")}</div></section>`;
}

function logicComparisonBox() {
  const oldItems = ["Schule als Stoffvermittlung", "Noten als Hauptmaßstab", "Förderung erst bei Defiziten", "Digitalisierung als Gerätefrage", "Bildung als Kostenblock"];
  const newItems = ["Schule als Wirkungsraum", "Kompetenzen, Urteilskraft und Selbstwirksamkeit", "Prävention und Potenzialförderung", "digitale Mündigkeit und KI-Kompetenz", "Bildung als gesellschaftliche Infrastruktur"];
  return `<section class="section" aria-labelledby="alte-logik"><div class="section-header"><p class="hero-kicker">Vergleich</p>${h2("alte-logik", "Alte Logik vs. WÖk-Logik")}</div><div class="comparison-grid"><article class="card"><h3 class="card-title">Was das heutige System oft falsch sieht</h3><ul>${oldItems.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></article><article class="card"><h3 class="card-title">Was die Wirkungsökonomie anders betrachtet</h3><ul>${newItems.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></article></div></section>`;
}

function downloadBlock(base, entries) {
  const links = entries.filter(Boolean).filter((entry) => exists(entry.href)).map((entry) => `<a class="btn btn-secondary" href="${href(base, entry.href)}">${esc(entry.label)}</a>`);
  return `<section class="section" aria-labelledby="downloads"><div class="card"><p class="hero-kicker">Arbeitsmaterial</p>${h2("downloads", "Downloads und Druck")}<p>Du liest die Onlinefassung. Die Dateien stehen ergänzend für Druck, Weitergabe und Arbeitsmaterial bereit.</p><div class="portal-card-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button>${links.join("")}</div></div></section>`;
}

function publicationAccess(base, mode = "portal") {
  const online = [
    ["Konzeptpapier", "Onlinefassung", "Das Konzeptpapier als vertiefende Onlinefassung lesen.", "wirkungsfelder/bildung/konzept/"],
    ["Gesamtdossier", "Dossier", "Das Gesamtdossier mit Beispielen, Bewertungslogik, Datenquellen und Grenzen lesen.", "wirkungsfelder/bildung/dossier/"],
    ["Detailkonzepte", "Vertiefung", "Die Detailkonzepte zu allen Unterbereichen lesen.", "wirkungsfelder/bildung/detailkonzepte/"],
    ["Einzeldossiers", "Dossier", "Einzeldossiers mit Praxisfrage, Bewertungslogik, Annahmen und Grenzen.", "wirkungsfelder/bildung/dossiers/"],
    ["Methodik", "Methode", "Die Methodik der Wirkungsschule-Tool-Suite lesen.", "wirkungsfelder/bildung/tools/"],
  ];
  const downloadLinks = [
    ["Konzeptpapier herunterladen", documents.concept.download],
    ["Gesamtdossier herunterladen", documents.dossier.download],
    ["Detailkonzepte herunterladen", documents.details.download],
    ["Einzeldossiers herunterladen", documents.singleDossiers.download],
    ["Methodik herunterladen", documents.toolSuite.download],
  ];
  return `<section class="section" id="vertiefung-arbeitsmaterial" aria-labelledby="vertiefung-arbeitsmaterial-title"><div class="section-header"><p class="hero-kicker">Vertiefung</p>${h2("vertiefung-arbeitsmaterial-title", mode === "subpage" ? "Weiterführende Fassungen und Downloads" : "Vertiefung und Arbeitsmaterial")}<p>Die Übersicht führt in das Wirkungsfeld ein. Langfassungen, Dossiers und Downloads stehen hier für vertiefendes Lesen bereit.</p></div>${cards(base, online.map((item) => [...item, item[1] === "Methode" ? "Methodik lesen" : item[1] === "Dossier" ? "Dossier lesen" : "Onlinefassung lesen"]))}<div class="download-card compact no-print"><div><p class="card-kicker">Downloads</p><h3 class="card-title">Dateien herunterladen</h3><p class="card-text">Die Dateien ergänzen die Onlinefassungen als Arbeitsmaterial.</p></div><div class="portal-card-actions">${downloadLinks.map(([label, file]) => exists(file) ? `<a class="btn btn-secondary" href="${href(base, file)}">${esc(label)}</a>` : "").join("")}</div></div></section>`;
}

function sdgBadge(base, [id, label, text, url], index) {
  const popover = `sdg-bildung-popover-${index}-${slugify(id)}`;
  return `<span class="sdg-ref" data-sdg-id="${esc(id)}"><a class="sdg-ref-link" href="${href(base, url)}" aria-label="${esc(`${label}: ${text}`)}" aria-describedby="${popover}">${esc(label)}</a><button class="sdg-ref-info" type="button" aria-label="${esc(`Kurzbeschreibung zu ${label}: ${text}`)}" aria-describedby="${popover}">i</button><span class="sdg-ref-popover" id="${popover}" role="tooltip">${esc(text)} <span class="sdg-ref-more">Details öffnen</span></span></span>`;
}

function referenceBlock(base) {
  return `<section class="section" aria-labelledby="sdg-ref"><div class="portal-reference-block"><p class="hero-kicker">Referenzrahmen</p>${h2("sdg-ref", "SDG-/SDG+-Bezug")}<div class="model-strip">${sdgRefs.map((item, index) => sdgBadge(base, item, index)).join("")}</div><p>Wirkung ist neutral und relational. Bildungswirkung kann positiv, negativ oder neutral sein. Bewertet wird sie am Referenzrahmen der SDGs, der Agenda 2030 und SDG+. SDG+ ist keine offizielle UN-Kategorie, sondern eine transparente Erweiterung der Wirkungsökonomie für Demokratie, Medienqualität, Rechtsstaatlichkeit, Diskursfähigkeit, institutionelles Vertrauen, gesellschaftlichen Zusammenhalt und digitale Selbstbestimmung.</p><a class="text-link" href="${href(base, "verstehen/sdgs-sdgplus/")}">Alle SDGs und SDG+ im Referenzrahmen ansehen</a></div></section>`;
}

function politicalBlock() {
  const rows = portalMatrix.politics || [
    ["Aufgabe der Politik", "Bildung als Wirkungsinfrastruktur ermöglichen: Basiskompetenzen sichern, Wirkungskompetenz aufbauen, Teilhabe stärken und Schulentwicklung systematisch unterstützen."],
    ["Politische Rahmenbedingungen", "Lehrpläne, Bildungsstandards, Bewertungsrecht, Ganztag, Startchancen, Lehrkräftebildung, digitale Infrastruktur, Datenschutz, Schulsozialarbeit und Förderlogiken müssen wirkungsorientiert anschlussfähig werden."],
    ["Ausgestaltungsspielraum", "Parteien können unterschiedlich gewichten: Noten oder Portfolios, Schulautonomie oder Standards, Ganztag oder Wahlfreiheit, staatliche Förderung oder Trägerpluralität, Pilotierung oder flächendeckende Einführung."],
    ["Zielkonflikte", "Vergleichbarkeit, Datenschutz, Lernunterstützung, Leistungsprinzip, Inklusion, Entlastung, Schulautonomie und Mindeststandards müssen demokratisch abgewogen werden."],
    ["Rollenverteilung", "Länder, Kommunen, Bund, Schulen, Lehrkräfte, Eltern, Schüler:innen, Wissenschaft, Kultur, Wirtschaft und Zivilgesellschaft tragen unterschiedliche Verantwortung."],
    ["Übergang und Schutz", "Modellschulen, Pilotregionen, Lehrkräfteentlastung, Schutz vor Kinder-Scoring, klare Datenregeln, Fortbildung und finanzierte Übergänge sind notwendig."],
    ["Evaluation und Korrektur", "Bildungswirkungsberichte, Schulklima, Lernentwicklung, Teilhabe, Übergänge, Demokratiekompetenz und Wirkungskompetenz müssen überprüft werden, ohne Kinder zu bewerten."],
    ["Parteipolitische Anschlussfähigkeit", "Unterschiedliche demokratische Perspektiven können innerhalb des Rahmens verschiedene Wege wählen."],
    ["Schutz vor Technokratie", "Wirkungsdaten bereiten Entscheidungen vor, ersetzen sie aber nicht. Normative Entscheidungen bleiben demokratisch legitimiert."],
  ];
  return `<section class="section" aria-labelledby="politik"><div class="section-header"><p class="hero-kicker">Demokratische Umsetzung</p>${h2("politik", "Politische Anschlussfähigkeit und Umsetzungsoptionen")}<p>Die folgenden politischen Anforderungen beschreiben keinen fertigen Parteibeschluss. Sie markieren den notwendigen Rahmen, damit Bildung demokratisch, rechtsstaatlich und praktisch umgesetzt werden kann.</p></div><div class="table-wrap"><table class="data-table"><tbody>${rows.map(([a, b]) => `<tr><th scope="row">${esc(a)}</th><td>${esc(b)}</td></tr>`).join("")}</tbody></table></div></section>`;
}

function toolBlock(base, excludeUrl = "") {
  const visibleTools = toolEntries.filter(([, , , , url]) => url !== excludeUrl.replace(/index\.html$/, "").replace(/\/$/, "/"));
  return `<section class="section" aria-labelledby="tools"><div class="section-header"><p class="hero-kicker">Methoden</p>${h2("tools", "Werkzeuge und Methoden")}<p>Die Karten zeigen Reflexionshilfen für Schulen, Kommunen, Träger und Politik. Sie treffen keine Schulaufsichtsentscheidung und bewerten keine Kinder, Lehrkräfte oder Familien.</p></div><div class="card-grid three">${visibleTools.map(([, title, kicker, text, url]) => {
    const isInteractive = url.startsWith("erleben/");
    const cta = isInteractive ? "Tool testen" : "Methodik lesen";
    const type = isInteractive ? "Tool" : "Methode";
    return `<article class="card"><p class="card-kicker">${esc(type)}</p><h3 class="card-title">${esc(title)}</h3><p class="card-text"><strong>Was zeigt es?</strong> ${esc(text)}</p><p class="card-text"><strong>Für wen?</strong> Schulen, Träger, Kommunen, Politik und Bildungsnetzwerke.</p><p class="card-text"><strong>Was ist keine Bewertung?</strong> Keine Bewertung einzelner Kinder, Familien oder Lehrkräfte.</p><div class="portal-card-actions"><a class="text-link" href="${href(base, url)}">${esc(cta)}</a></div></article>`;
  }).join("")}</div></section>`;
}

function bookBlock(base) {
  return `<section class="section" aria-labelledby="buch"><div class="section-header"><p class="hero-kicker">Online-Buch</p>${h2("buch", "Anker im Online-Buch")}</div><div class="model-strip">${bookAnchors.map(([label, url]) => `<a href="${href(base, url)}">${esc(label)}</a>`).join("")}</div></section>`;
}

function relatedBlock(base) {
  return `<section class="section" aria-labelledby="vernetzung"><div class="section-header"><p class="hero-kicker">Vernetzung</p>${h2("vernetzung", "Verwandte Wirkungsfelder und Werkzeuge")}</div>${cards(base, relatedLinks.map(([title, text, url]) => [title, "Querverlinkung", text, url]))}</section>`;
}

function sourceBlock() {
  return `<section class="section" aria-labelledby="quellen"><div class="card"><p class="hero-kicker">Quellen</p>${h2("quellen", "Quellen und externe Referenzen")}<p>Externe Quellen öffnen in einem neuen Tab. Sie dienen als Daten-, Methoden- und Politikanschluss; die wirkungsökonomische Einordnung bleibt eigenständig.</p><div class="table-wrap"><table class="data-table"><tbody>${sources.map(([title, text, url]) => `<tr><th scope="row">${esc(title)}</th><td>${esc(text)}<br><a class="text-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Externe Quelle öffnen</a></td></tr>`).join("")}</tbody></table></div></div></section>`;
}

function statusBox(status) {
  return "";
}

function protectionBlock() {
  const items = [
    ["Keine Personenbewertung", "Die Wirkungsschule bewertet keine Kinder, Lehrkräfte oder Familien. Bewertet werden Lernräume, Unterstützung, Strukturen und Wirkungspfade."],
    ["Datenschutz und Zweckbindung", "Daten dienen der Verbesserung von Bildung und Förderung. Lernanalytik braucht Transparenz, Löschfristen, Beteiligung und klare Schutzgrenzen."],
    ["Politische Pluralität", "Fach Zukunft und Wirkungskompetenz sind keine moralische Belehrung. Sie müssen forschend, widerspruchsfähig und demokratisch plural bleiben."],
  ];
  return `<section class="section" aria-labelledby="schutz"><div class="section-header"><p class="hero-kicker">Schutzlinien</p>${h2("schutz", "Schutz vor Kinder-Scoring und Überwachung")}</div><div class="card-grid three">${items.map(([title, text]) => `<article class="card"><p class="card-kicker">Rote Linie</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(text)}</p></article>`).join("")}</div></section>`;
}

function portalPage() {
  page({
    rel: "wirkungsfelder/bildung/index.html",
    title: "Bildung & Wirkungsschule | Wirkungsökonomie",
    description: "Bildung als Wirkungsinfrastruktur: Wirkungsschule, Wirkungspädagogik, Fach Zukunft, Portfolios, Wirkungsförderung, digitale Mündigkeit und Demokratiekompetenz.",
    body: (base) => `<section class="hero portal-hero"><div class="hero-grid"><div><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "wirkungsfelder/")}">Wirkungsfelder</a></nav><p class="hero-kicker">Wirkungsfeld</p><h1>Bildung als Wirkungsinfrastruktur</h1><p class="hero-subtitle">Wie die Wirkungsökonomie Schule, Förderung, Fächer, Bewertung und Zukunftskompetenz neu denkt.</p><p>Bildung ist nicht nur Schule, Noten oder Arbeitsmarktfähigkeit. Sie stärkt Selbstwirksamkeit, Urteilskraft, Demokratie, Gesundheit, Teilhabe, digitale Mündigkeit, systemisches Denken und Zukunftsfähigkeit.</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button></div></div>${statusBox("Wirkungsfeld")}</div></section><nav class="toc-card no-print" aria-label="Seitennavigation"><h2 class="card-title">Auf dieser Seite</h2><ol class="toc-links"><li><a href="#warum-bildung">Warum wichtig?</a></li><li><a href="#alte-logik">WÖk-Logik</a></li><li><a href="#konzepte">Konzepte</a></li><li><a href="#politik-landing">Politik</a></li><li><a href="#tools">Werkzeuge</a></li><li><a href="#vertiefung-arbeitsmaterial">Vertiefung</a></li></ol></nav><section class="section" aria-labelledby="warum-bildung"><div class="section-header"><p class="hero-kicker">Relevanz</p>${h2("warum-bildung", "Warum Bildung ein Wirkungsfeld ist")}</div><div class="card-grid three"><article class="card"><h3 class="card-title">Bildung wirkt vor dem Arbeitsmarkt</h3><p class="card-text">Sie prägt Sprache, Selbstwirksamkeit, Gesundheit, Teilhabe, Vertrauen und Zukunftsfähigkeit lange bevor Erwerbsarbeit beginnt.</p></article><article class="card"><h3 class="card-title">Schule ist auch Lebensraum</h3><p class="card-text">Schule wirkt auf Gesundheit, Demokratie, Beziehung, Sicherheit, Medienkompetenz und soziale Stabilität.</p></article><article class="card"><h3 class="card-title">Wirkungskompetenz wird Zukunftskompetenz</h3><p class="card-text">Menschen müssen Folgen, Zielkonflikte, Daten, Medien und Systeme verstehen, um handlungsfähig zu bleiben.</p></article></div></section>${logicComparisonBox()}<section class="section" aria-labelledby="konzepte"><div class="section-header"><p class="hero-kicker">Konzepte</p>${h2("konzepte", "Zentrale Konzepte")}<p>Die Konzepte geben Orientierung. Langfassungen, Dossiers und Downloads stehen am Ende der Seite.</p></div>${conceptCardGrid(base)}</section>${politicsLandingBox()}<section class="section" aria-labelledby="sdg-chips"><div class="portal-reference-block"><p class="hero-kicker">Referenzrahmen</p>${h2("sdg-chips", "SDG-/SDG+-Bezug")}<div class="model-strip">${sdgRefs.map(([, label]) => `<span class="badge">${esc(label)}</span>`).join("")}</div><p>SDG+ ist keine UN-Kategorie, sondern eine transparente Erweiterung der Wirkungsökonomie für Demokratie, Medienqualität, Rechtsstaatlichkeit, Diskursfähigkeit, institutionelles Vertrauen, gesellschaftlichen Zusammenhalt und digitale Selbstbestimmung.</p></div></section>${toolBlock(base)}<section class="section" aria-labelledby="unterbereiche"><div class="section-header"><p class="hero-kicker">Vertiefung</p>${h2("unterbereiche", "Vertiefende Unterbereiche")}<p>Die Unterbereiche führen jeweils zu einer eigenen Vertiefung mit Detailkonzept und Dossier.</p></div>${cards(base, modules.map((module) => [module.name, "Vertiefung", module.thesis, `wirkungsfelder/bildung/${module.slug}/`, "Vertiefung lesen"]))}</section>${publicationAccess(base)}${referenceBlock(base)}${bookBlock(base)}${relatedBlock(base)}${sourceBlock()}`,
  });
}

function modulePage(module) {
  const detail = markdownishToHtml(sectionFor(read(documents.details.md), module, "detail") || `# ${module.index + 1}. ${module.name}\n${module.thesis}\n\n## Konzeptbausteine\n${module.sections.map((section) => `- ${section}`).join("\n")}`);
  const dossier = markdownishToHtml(sectionFor(read(documents.singleDossiers.md), module, "dossier") || `# Dossier ${module.index + 1}: ${module.name}\nKurzfassung: ${module.thesis}`);
  page({
    rel: `wirkungsfelder/bildung/${module.slug}/index.html`,
    title: `${module.name} | Bildung & Wirkungsschule`,
    description: module.thesis,
    type: "Unterbereich",
    body: (base) => `<section class="hero portal-hero"><div class="hero-content"><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "wirkungsfelder/bildung/")}">Bildung</a></nav><p class="hero-kicker">Bildung & Wirkungsschule</p><h1>${esc(module.name)}</h1><p class="hero-subtitle">${esc(module.thesis)}</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="#detailkonzept">Detailkonzept online lesen</a><a class="btn btn-secondary" href="#dossier">Dossier online lesen</a></div></div></section><section class="section" id="publikationszugang" aria-labelledby="publikationszugang-title"><div class="download-card"><div><p class="card-kicker">Online lesen, gezielt zitieren</p>${h2("publikationszugang-title", "Detailkonzept und Dossier")}<p class="card-text">Diese Unterseite enthält Detailkonzept und Einzeldossier vollständig online. Downloads bleiben ergänzende Exportfassungen.</p></div><div class="portal-card-actions no-print"><a class="btn btn-primary" href="#detailkonzept">Detailkonzept online lesen</a><a class="btn btn-secondary" href="#dossier">Dossier online lesen</a><a class="btn btn-secondary" href="${href(base, documents.details.download)}">Detailkonzepte herunterladen</a><a class="btn btn-secondary" href="${href(base, documents.singleDossiers.download)}">Einzeldossier-Set herunterladen</a></div></div></section>${tocBlock([...detail.toc, ...dossier.toc])}<section class="section" aria-labelledby="kurzfassung"><div class="section-header"><p class="hero-kicker">Kurzfassung</p>${h2("kurzfassung", "Kurzfassung und Wirkungspfad")}</div><div class="card-grid three"><article class="card"><h3 class="card-title">Worum es geht</h3><p class="card-text">${esc(module.thesis)}</p></article><article class="card"><h3 class="card-title">Werkzeugbezug</h3><p class="card-text">${esc(module.tool)}</p></article><article class="card"><h3 class="card-title">Schutzlinie</h3><p class="card-text">Bewertet werden Lernräume, Strukturen, Unterstützungsangebote und Wirkungspfade. Keine Kinder-, Lehrkräfte- oder Familien-Scores.</p></article></div></section><section class="section article-section" aria-labelledby="detailkonzept"><article class="article-body fulltext-reader"><p class="hero-kicker">Detailkonzept</p>${h2("detailkonzept", "Detailkonzept online lesen")}${detail.html}</article></section><section class="section article-section" aria-labelledby="dossier"><article class="article-body fulltext-reader"><p class="hero-kicker">Einzeldossier</p>${h2("dossier", "Dossier online lesen")}${dossier.html}</article></section>${toolBlock(base)}${protectionBlock()}${politicalBlock()}${referenceBlock(base)}${bookBlock(base)}${relatedBlock(base)}${sourceBlock()}${downloadBlock(base, [{ label: "Detailkonzepte Word", href: documents.details.download }, { label: "Einzeldossier-Set Word", href: documents.singleDossiers.download }])}`,
  });
}

function fulltextPage(key, rel, status) {
  const doc = documents[key];
  const rendered = markdownishToHtml(read(doc.md));
  const publicStatus = status.replaceAll("Online-Volltext", "Onlinefassung").replaceAll("Einzeldossier-Set", "Einzeldossiers");
  page({
    rel,
    title: `${doc.title} | Wirkungsökonomie`,
    description: `${doc.title} als öffentliche Onlinefassung mit Zitierankern, Druckfunktion und Download.`,
    type: publicStatus,
    body: (base) => `<section class="hero portal-hero"><div class="hero-content"><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "wirkungsfelder/bildung/")}">Bildung</a></nav><p class="hero-kicker">${esc(publicStatus)}</p><h1>${esc(doc.title)}</h1><p class="hero-subtitle">Du liest die Onlinefassung. Downloads stehen am Ende der Seite bereit.</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-secondary" href="${href(base, doc.download)}">Download</a></div></div></section><section class="section narrow"><aside class="citation-note" role="note"><p class="card-kicker">Zitierfähig</p><h2>Onlinefassung</h2><p>Abschnittsanker können direkt zitiert werden. Die Seitenadresse bleibt stabil.</p></aside></section><section class="section narrow">${statusBox(publicStatus)}</section><section class="section narrow">${tocBlock(rendered.toc)}</section><section class="section article-section" aria-labelledby="volltext"><article class="article-body fulltext-reader"><p class="hero-kicker">Onlinefassung</p>${h2("volltext", `${doc.title} lesen`)}${rendered.html}</article></section>${toolBlock(base)}${protectionBlock()}${politicalBlock()}${referenceBlock(base)}${bookBlock(base)}${relatedBlock(base)}${sourceBlock()}${downloadBlock(base, [{ label: `${doc.title} herunterladen`, href: doc.download }])}`,
  });
}

function toolSpecPage() {
  const rendered = markdownishToHtml(read(documents.toolSuite.md));
  page({
    rel: documents.toolSuite.route,
    title: `${documents.toolSuite.title} | Wirkungsökonomie`,
    description: "Methodik der Wirkungsschule-Tool-Suite als Onlinefassung mit Download.",
    section: "Werkzeuge",
    type: "Methodik",
    body: (base) => `<section class="hero portal-hero"><div class="hero-content"><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "wirkungsfelder/bildung/")}">Bildung</a></nav><p class="hero-kicker">Methodik</p><h1>${esc(documents.toolSuite.title)}</h1><p class="hero-subtitle">Modellhafte Methoden zur Schulentwicklung, Unterrichtsplanung, Förderlogik und Portfolioarbeit.</p><p class="scanner-notice">Keine Schulaufsichtsentscheidung, keine Rechtsberatung und keine personenbezogene Bewertung.</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-secondary" href="${href(base, documents.toolSuite.download)}">Download</a></div></div></section>${tocBlock(rendered.toc)}<section class="section article-section" aria-labelledby="volltext"><article class="article-body fulltext-reader"><p class="hero-kicker">Onlinefassung</p>${h2("volltext", "Methodik lesen")}${rendered.html}</article></section>${toolBlock(base)}${politicalBlock()}${referenceBlock(base)}${bookBlock(base)}${downloadBlock(base, [{ label: "Methodik Markdown", href: documents.toolSuite.download }])}`,
  });
}

function simpleToolPage(slug, title, description, route) {
  page({
    rel: route,
    title: `${title} | Wirkungsökonomie`,
    description,
    section: route.startsWith("erleben/") ? "Erleben" : "Werkzeuge",
    type: route.startsWith("erleben/") ? "Demo" : "Werkzeug",
    body: (base) => `<section class="hero portal-hero"><div class="hero-content"><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "wirkungsfelder/bildung/")}">Bildung</a></nav><p class="hero-kicker">${route.startsWith("erleben/") ? "Demo" : "Methode"} · Wirkungsschule</p><h1>${esc(title)}</h1><p class="hero-subtitle">${esc(description)}</p><p class="scanner-notice">Modellhafte Demonstration. Keine Schulaufsichtsentscheidung. Keine Rechtsberatung. Keine personenbezogene Bewertung.</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="#demo">Demo ansehen</a><a class="btn btn-secondary" href="${href(base, "wirkungsfelder/bildung/tools/")}">Methodik lesen</a></div></div></section><nav class="toc-card no-print" aria-label="Inhaltsverzeichnis"><h2 class="card-title">Inhaltsverzeichnis</h2><ol class="toc-links"><li><a href="#demo-title">Modellhafte Struktur</a></li><li><a href="#schutz">Schutzlinien</a></li><li><a href="#politik">Politische Anschlussfähigkeit</a></li></ol></nav><section class="section" id="demo" aria-labelledby="demo-title"><div class="section-header"><p class="hero-kicker">Arbeitsmodell</p>${h2("demo-title", "Modellhafte Struktur")}</div><div class="card-grid three"><article class="card"><p class="card-kicker">Eingabe</p><h3 class="card-title">Systemebene wählen</h3><p class="card-text">Schule, Klasse, Projekt, Förderangebot, Raum, Curriculum oder kommunales Bildungsnetzwerk. Keine Person wird gerankt.</p></article><article class="card"><p class="card-kicker">Bewertung</p><h3 class="card-title">Reifegrad statt Score für Menschen</h3><p class="card-text">0 = nicht angelegt, 1 = punktuell, 2 = strukturiert, 3 = integriert, 4 = lernend evaluiert.</p></article><article class="card"><p class="card-kicker">Ausgabe</p><h3 class="card-title">Verbesserungspfad</h3><p class="card-text">Das Ergebnis zeigt Schutzgrenzen, nächste Schritte, Datenqualität und Korrekturrunde.</p></article></div><div class="card"><form class="calculator-form"><label>Basiskompetenzen und Lernentwicklung <input type="range" min="0" max="4" value="2"></label><label>Teilhabe und Schutz vor Beschämung <input type="range" min="0" max="4" value="2"></label><label>Demokratie-, Medien- und Wirkungskompetenz <input type="range" min="0" max="4" value="2"></label><label>Datenethik und Datenschutz <input type="range" min="0" max="4" value="2"></label></form><p class="card-text"><strong>Hinweis:</strong> Die Demo ist bewusst einfach. Sie ersetzt keine pädagogische, rechtliche oder schulaufsichtliche Prüfung.</p></div></section>${toolBlock(base, route)}${protectionBlock()}${politicalBlock()}${referenceBlock(base)}${bookBlock(base)}${relatedBlock(base)}${downloadBlock(base, [{ label: "Methodik Markdown", href: documents.toolSuite.download }])}`,
  });
}

function libraryPage() {
  page({
    rel: "werkstatt/dossiers/bildung/index.html",
    title: "Dossiers Bildung & Wirkungsschule | Wirkungsökonomie",
    description: "Arbeitsbibliothek und Dossierhub zu Bildung, Wirkungsschule, Detailkonzepten, Einzeldossiers und Methodik.",
    section: "Werkstatt",
    type: "Dossier",
    body: (base) => `<section class="hero portal-hero"><div class="hero-content"><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "werkstatt/")}">Werkstatt</a></nav><p class="hero-kicker">Werkstatt · Dossiers</p><h1>Bildung & Wirkungsschule</h1><p class="hero-subtitle">Konzeptpapier, Gesamtdossier, Detailkonzepte, Einzeldossiers, Methodik und Onlinefassungen.</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="${href(base, "wirkungsfelder/bildung/")}">Zur Übersicht Bildung</a></div></div></section>${publicationAccess(base)}<section class="section" aria-labelledby="unterbereiche"><div class="section-header"><p class="hero-kicker">Unterbereiche</p>${h2("unterbereiche", "Detailkonzepte und Einzeldossiers")}</div>${cards(base, modules.map((module) => [module.name, "Onlinefassung", module.thesis, `wirkungsfelder/bildung/${module.slug}/`, "Vertiefung lesen"]))}</section>${toolBlock(base)}${downloadBlock(base, [{ label: "Konzeptpapier Word", href: documents.concept.download }, { label: "Gesamtdossier Word", href: documents.dossier.download }, { label: "Detailkonzepte Word", href: documents.details.download }, { label: "Einzeldossiers Word", href: documents.singleDossiers.download }, { label: "Methodik Markdown", href: documents.toolSuite.download }])}`,
  });
}

function workLibraryPage() {
  page({
    rel: "werkstatt/arbeitsbibliothek/wirkungsfelder/bildung/index.html",
    title: "Bildung in der Arbeitsbibliothek | Wirkungsökonomie",
    description: "Arbeitsbibliothek zu Bildung, Wirkungsschule, Konzeptpapier, Gesamtdossier, Detailkonzepten, Einzeldossiers und Methodik.",
    section: "Werkstatt",
    type: "Arbeitsbibliothek",
    body: (base) => `<section class="hero portal-hero"><div class="hero-content"><nav class="breadcrumb"><a href="${href(base, "werkstatt/")}">Werkstatt</a> / <a href="${href(base, "werkstatt/arbeitsbibliothek/")}">Arbeitsbibliothek</a></nav><p class="hero-kicker">Arbeitsbibliothek · Wirkungsfeld</p><h1>Bildung & Wirkungsschule</h1><p class="hero-subtitle">Alle öffentlichen Konzepte, Dossiers, Detailkonzepte, Einzeldossiers und Methoden zur Bildung.</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="${href(base, "wirkungsfelder/bildung/")}">Zur Übersicht Bildung</a><a class="btn btn-secondary" href="${href(base, "werkstatt/dossiers/bildung/")}">Dossiers ansehen</a></div></div></section>${publicationAccess(base)}<section class="section" aria-labelledby="unterbereiche"><div class="section-header"><p class="hero-kicker">Unterbereiche</p>${h2("unterbereiche", "Detailkonzepte und Einzeldossiers in der Arbeitsbibliothek")}</div>${cards(base, modules.map((module) => [module.name, "Onlinefassung", module.thesis, `wirkungsfelder/bildung/${module.slug}/`, "Vertiefung lesen"]))}</section>${toolBlock(base)}${referenceBlock(base)}${bookBlock(base)}${downloadBlock(base, [{ label: "Konzeptpapier Word", href: documents.concept.download }, { label: "Gesamtdossier Word", href: documents.dossier.download }, { label: "Detailkonzepte Word", href: documents.details.download }, { label: "Einzeldossiers Word", href: documents.singleDossiers.download }, { label: "Methodik Markdown", href: documents.toolSuite.download }])}`,
  });
  page({
    rel: "werkstatt/arbeitsbibliothek/wirkungsfelder/bildung/wirkungsschule/index.html",
    title: "Wirkungsschule in der Arbeitsbibliothek | Wirkungsökonomie",
    description: "Arbeitsbibliothek zur Wirkungsschule mit Onlinefassungen, Detailkonzept, Dossier und Downloads.",
    section: "Werkstatt",
    type: "Arbeitsbibliothek",
    body: (base) => `<section class="hero portal-hero"><div class="hero-content"><nav class="breadcrumb"><a href="${href(base, "werkstatt/arbeitsbibliothek/wirkungsfelder/bildung/")}">Bildung in der Arbeitsbibliothek</a></nav><p class="hero-kicker">Arbeitsbibliothek · Unterbereich</p><h1>Die Wirkungsschule</h1><p class="hero-subtitle">Detailkonzept und Einzeldossier zur Schule als Wirkungsraum lesen und als Arbeitsmaterial herunterladen.</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="${href(base, "wirkungsfelder/bildung/wirkungsschule/")}">Vertiefung lesen</a><a class="btn btn-secondary" href="${href(base, documents.details.download)}">Detailkonzepte herunterladen</a></div></div></section><section class="section" aria-labelledby="zugang"><div class="download-card"><div><p class="card-kicker">Onlinefassung</p>${h2("zugang", "Detailkonzept und Dossier lesen")}<p class="card-text">Die öffentliche Langfassung liegt auf der Unterseite. Diese Arbeitsbibliothek-Seite bündelt Arbeitsmaterial und Verweise.</p></div><div class="portal-card-actions no-print"><a class="btn btn-primary" href="${href(base, "wirkungsfelder/bildung/wirkungsschule/")}">Wirkungsschule lesen</a><a class="btn btn-secondary" href="${href(base, documents.details.download)}">Detailkonzepte Word</a><a class="btn btn-secondary" href="${href(base, documents.singleDossiers.download)}">Einzeldossiers Word</a></div></div></section>${publicationAccess(base, "subpage")}${toolBlock(base)}${referenceBlock(base)}${bookBlock(base)}${downloadBlock(base, [{ label: "Detailkonzepte Word", href: documents.details.download }, { label: "Einzeldossiers Word", href: documents.singleDossiers.download }])}`,
  });
}

function updateSitemap() {
  const sitemap = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(sitemap)) return;
  let xml = fs.readFileSync(sitemap, "utf8");
  const urls = [
    "wirkungsfelder/bildung/",
    "wirkungsfelder/bildung/konzept/",
    "wirkungsfelder/bildung/dossier/",
    "wirkungsfelder/bildung/detailkonzepte/",
    "wirkungsfelder/bildung/dossiers/",
    "wirkungsfelder/bildung/tools/",
    ...modules.map((module) => `wirkungsfelder/bildung/${module.slug}/`),
    "erleben/wirkungsschule-check/",
    "erleben/wirkungsportfolio-generator/",
    "erleben/fach-zukunft-generator/",
    "erleben/wirkungsfoerderungs-check/",
    "werkzeuge/schulraum-wirkungscheck/",
    "werkzeuge/bildungswirkungsindex-bwk/",
    "werkstatt/dossiers/bildung/",
    "werkstatt/arbeitsbibliothek/wirkungsfelder/bildung/",
    "werkstatt/arbeitsbibliothek/wirkungsfelder/bildung/wirkungsschule/",
  ];
  const additions = urls
    .filter((url) => !xml.includes(`${SITE}/${url}`))
    .map((url) => `  <url>\n    <loc>${SITE}/${url}</loc>\n    <lastmod>${DATE}</lastmod>\n  </url>`)
    .join("\n");
  if (additions) {
    fs.writeFileSync(sitemap, xml.replace("</urlset>", `${additions}\n</urlset>`), "utf8");
  }
}

function run() {
  portalPage();
  fulltextPage("concept", documents.concept.route, "Konzeptpapier / Onlinefassung");
  fulltextPage("dossier", documents.dossier.route, "Gesamtdossier / Onlinefassung");
  fulltextPage("details", documents.details.route, "Detailkonzepte / Onlinefassung");
  fulltextPage("singleDossiers", documents.singleDossiers.route, "Einzeldossiers / Onlinefassung");
  toolSpecPage();
  modules.forEach(modulePage);
  simpleToolPage("wirkungsschule-check", "Wirkungsschule-Check", "Schulentwicklung wirkungsorientiert prüfen: Basiskompetenzen, Wirkungskompetenz, Förderung, Räume, Demokratiepraxis und Datenethik.", "erleben/wirkungsschule-check/index.html");
  simpleToolPage("wirkungsportfolio-generator", "Wirkungsportfolio-Generator", "Lernwege, Projektarbeit, Feedback und Reflexion strukturieren, ohne Kinder zu ranken.", "erleben/wirkungsportfolio-generator/index.html");
  simpleToolPage("fach-zukunft-generator", "Fach-Zukunft-Modulgenerator", "Fächer, lokale Fragen, SDGs/SDG+ und Ergebnisformate zu einem Lernfeld Zukunft verbinden.", "erleben/fach-zukunft-generator/index.html");
  simpleToolPage("wirkungsfoerderungs-check", "Wirkungsförderungs-Check", "Präventive Förderung, Potenzialförderung, Mentoring und Teilhabe würdig strukturieren.", "erleben/wirkungsfoerderungs-check/index.html");
  simpleToolPage("schulraum-wirkungscheck", "Schulraum-Wirkungscheck", "Räume, Zeit, Bewegung, Ernährung, Hitzeschutz, Barrierefreiheit und Sicherheit als Bildungswirkung prüfen.", "werkzeuge/schulraum-wirkungscheck/index.html");
  simpleToolPage("bildungswirkungsindex-bwk", "Bildungswirkungsindex / BWK", "Bildungswirkung auf Wissen, Selbstwirksamkeit, Demokratie, Gesundheit, Teilhabe, digitale Mündigkeit und Resilienz strukturieren.", "werkzeuge/bildungswirkungsindex-bwk/index.html");
  libraryPage();
  workLibraryPage();
  updateSitemap();
  console.log("Education effect school portal generated.");
}

run();
