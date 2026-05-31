import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://wirkungsoekonomie.de";
const DATE = "2026-05-24";
const CSS_VERSION = "20260525-gesundheit-pflege-landing";
const JS_VERSION = "20260523-nachhaltigkeit";
const SRC = "docs/gesundheit-pflege";
const EXTRACT = `${SRC}/docx-extracts`;
const SOURCE = `${SRC}/source`;

const documents = [
  {
    key: "konzept",
    title: "Konzeptpapier Gesundheit & Pflege",
    shortTitle: "Konzeptpapier",
    md: `${EXTRACT}/woek_gesundheit_pflege_konzeptpapier_v0_1.md`,
    download: "woek_gesundheit_pflege_konzeptpapier_v0_1.docx",
    description: "Grundkonzept für Prävention, Pflege, Lebensqualität, Gesundheitsräume, One Health und Wirkungshaushalt.",
  },
  {
    key: "dossier",
    title: "Gesamtdossier Gesundheit & Pflege",
    shortTitle: "Gesamtdossier",
    md: `${EXTRACT}/woek_gesundheit_pflege_gesamtdossier_v0_1.md`,
    download: "woek_gesundheit_pflege_gesamtdossier_v0_1.docx",
    description: "Dossier mit Modelllogik, Quellen, Wirkungsarchitektur, Umsetzungsoptionen und Schutzgrenzen.",
  },
  {
    key: "detailkonzepte",
    title: "Detailkonzepte Gesundheit & Pflege",
    shortTitle: "Detailkonzepte",
    md: `${EXTRACT}/woek_gesundheit_pflege_detailkonzepte_umfangreich_v0_2.md`,
    download: "woek_gesundheit_pflege_detailkonzepte_umfangreich_v0_2.docx",
    description: "Umfangreiche Detailkonzepte für alle Unterbereiche des Gesundheits- und Pflegeportals.",
  },
  {
    key: "dossiers",
    title: "Einzeldossiers Gesundheit & Pflege",
    shortTitle: "Einzeldossiers",
    md: `${EXTRACT}/woek_gesundheit_pflege_einzeldossier_set_v0_2.md`,
    download: "woek_gesundheit_pflege_einzeldossier_set_v0_2.docx",
    description: "Einzeldossiers mit Praxisfragen, Bewertungslogik, Datenquellen, Annahmen, Toolbezug und Grenzen.",
  },
];

const modules = [
  ["gesundheit-gesellschaftliches-wirkungsfeld", "Gesundheit als gesellschaftliches Wirkungsfeld", "Gesundheit entsteht in Lebensbedingungen, Versorgung, Arbeit, Wohnen, Ernährung, Bildung, Kultur, Umwelt, digitaler Öffentlichkeit und Vertrauen."],
  ["praevention-gesundheitskassen-wirkungshaushalt", "Prävention, Gesundheitskassen und Wirkungshaushalt", "Prävention wird zur ersten Wirkleistung: vermiedene Schäden, längere Autonomie, weniger Pflegebedarf und geringere Krisenlast werden sichtbar."],
  ["pflege-wirkungsinfrastruktur", "Pflege als Wirkungsinfrastruktur", "Pflege ist Wirkleistung für Würde, Autonomie, Beziehung, Angehörigenentlastung und soziale Stabilität."],
  ["psychische-gesundheit-soziale-stabilitaet", "Psychische Gesundheit und soziale Stabilität", "Erschöpfung, Einsamkeit, Angst, digitale Gewalt und Wohn- oder Arbeitsstress werden als systemische Gesundheitsrisiken gelesen."],
  ["kommunale-gesundheitsraeume-quartiere", "Kommunale Gesundheitsräume und Quartiere", "Gesundheit entsteht im Nahraum: durch Grün, Schatten, Begegnung, Mobilität, Versorgung, Sicherheit, Barrierefreiheit und soziale Einbettung."],
  ["one-health-klima-umwelt-ernaehrung", "One Health, Klima, Umwelt und Ernährung", "Menschliche Gesundheit hängt mit Tieren, Pflanzen, Ökosystemen, Klima, Wasser, Boden, Biodiversität und Ernährungssystemen zusammen."],
  ["gesundheitsdaten-ki-datenschutz", "Gesundheitsdaten, KI und Datenschutz", "Daten dienen Prävention, Frühwarnung und Versorgungsgerechtigkeit, aber nur unter Schutz von Würde, Zweckbindung und digitaler Selbstbestimmung."],
  ["arbeitswelt-unternehmen-gesundheitswirkung", "Arbeitswelt, Unternehmen und Gesundheitswirkung", "Arbeit ist ein Gesundheitsraum: Führung, Arbeitszeit, KI-Druck, Lohn, Sicherheit, Mitbestimmung und psychische Kultur wirken direkt."],
  ["gesundheitsgerechtigkeit-inklusion-migration", "Gesundheitsgerechtigkeit, Inklusion und Migration", "Vermeidbare Gesundheitsunterschiede werden nicht privatisiert; Zugang, Sprache, Einkommen, Wohnort und Diskriminierung werden sichtbar."],
  ["versorgung-kliniken-gesundheitsnetzwerke", "Versorgung, Kliniken und Gesundheitsnetzwerke", "Kliniken, Hausärzt:innen, Pflege, Psychotherapie, Apotheken, mobile Dienste und Quartierszentren werden wirkungsorientiert vernetzt."],
  ["finanzierung-wirkungsfonds-gesundheitsgrundsicherung", "Finanzierung, Wirkungsfonds und Gesundheitsgrundsicherung", "Gesundheit braucht Fonds, Budgets und Kassenlogiken, die Prävention und Pflege nicht schlechter stellen als Reparatur."],
  ["governance-wirkungsrat-politische-anschlussfaehigkeit", "Governance, Wirkungsrat und politische Anschlussfähigkeit", "Wirkungsdaten bereiten Entscheidungen vor, ersetzen sie aber nicht. Rechtsschutz, Pilotierung und demokratische Kontrolle bleiben zentral."],
];

const moduleAnchorTargets = {
  "Pflege als Wirkungsinfrastruktur": "Pflege als Wirkleistung und Pflegeökosystem",
  "Kommunale Gesundheitsräume und Quartiere": "Versorgungsräume, Kliniken und Gesundheitsnetzwerke",
  "Gesundheitsdaten, KI und Datenschutz": "Gesundheitsdaten, KI und Bürgerkontrolle",
  "Finanzierung, Wirkungsfonds und Gesundheitsgrundsicherung": "Finanzierung, Wirkungsfonds und Gesundheitskassen",
};

const tools = [
  ["gesundheitswirkungscheck", "Gesundheitswirkungscheck", "Check", "Bewertet Programme, Räume oder Maßnahmen nach Gesundheitsgewinn, Prävention, Teilhabe, Resilienz, Datenqualität und Nebenwirkungen."],
  ["praeventionswirkungsrechner", "Präventionswirkungslogik", "Methode", "Macht vermiedene Schäden, Lebensqualitätsnutzen, Resilienzbeitrag, Umsetzungskosten und Unsicherheit modellhaft sichtbar."],
  ["pflegewirkungscheck", "Pflegewirkungscheck", "Check", "Prüft Pflege als Würde-, Autonomie-, Beziehungs- und Stabilitätsinfrastruktur, ohne Menschen zu bewerten."],
  ["kommunaler-gesundheitsraum-check", "Kommunaler Gesundheitsraum-Check", "Check", "Verbindet Hitze, Lärm, Grün, Versorgung, Begegnung, Barrierefreiheit und soziale Lage in einem Quartiersblick."],
  ["mental-health-reflexionstool", "Mental-Health-Reflexionstool", "Reflexion", "Nicht-diagnostisches Reflexionsmodul für Belastungsräume, Schutzfaktoren und niedrigschwellige Unterstützungswege.", "Nicht-diagnostisch"],
  ["one-health-score", "One-Health-Logik", "Modell", "Verbindet Klima, Umwelt, Ernährung, Wasser, Biodiversität und Gesundheit in einer gemeinsamen Wirkungslogik."],
  ["gesundheitsdatenraum-privacy-by-design", "Gesundheitsdatenraum / Privacy-by-Design", "Datenlogik", "Prüft Zweckbindung, Datensparsamkeit, Pseudonymisierung, Einwilligung, Governance und Korrekturwege."],
  ["wirkungshaushalt-gesundheit", "Wirkungshaushalt Gesundheit", "Wirkungshaushalt", "Macht Prävention, Pflegeentlastung und Gesundheitsresilienz haushaltsfähig statt nur Reparaturkosten sichtbar."],
  ["wirkungsfonds-gesundheit-pflege", "Wirkungsfonds Gesundheit & Pflege", "Fondsmodell", "Bündelt Mittel für Prävention, Pflege, Quartiere, psychische Stabilität und Gesundheitsgerechtigkeit."],
  ["t-sroi-praevention-gesundheitsinvestitionen", "T-SROI für Präventions- und Gesundheitsinvestitionen", "Methode", "Bewertet Transformationsnutzen über vermiedene Schäden, Resilienz, Teilhabe und Folgekosten."],
];

const conceptCards = [
  {
    title: "Gesundheit als gesellschaftliches Wirkungsfeld",
    text: "Gesundheit entsteht nicht erst in Arztpraxen oder Kliniken. Sie entsteht in Lebensbedingungen: Wohnen, Arbeit, Bildung, Umwelt, Ernährung, Sicherheit, Beziehung und Vertrauen.",
    relevance: "Das macht Gesundheit politisch, kommunal und wirtschaftlich steuerbar.",
    tags: ["SDG 3", "One Health", "Wirkungshaushalt", "Gesundheitswirkungsindex"],
    anchor: "gesundheit-als-gesellschaftliches-wirkungsfeld",
  },
  {
    title: "Prävention, Gesundheitskassen und Wirkungshaushalt",
    text: "Prävention wird sichtbar, obwohl der vermiedene Schaden nicht eintritt. Die WÖk fragt, wie vermiedene Krankheit, Pflegebedarf und Krisenlast haushaltsfähig werden.",
    relevance: "Heute wird Reparatur oft besser finanziert als Vorbeugung.",
    tags: ["Prävention", "Wirkungshaushalt", "Gesundheitsfonds", "kommunale Budgets"],
    anchor: "pravention-gesundheitskassen-und-wirkungshaushalt",
  },
  {
    title: "Pflege als Wirkungsinfrastruktur",
    text: "Pflege ist keine private Restzuständigkeit, sondern Wirkleistung für Würde, Autonomie, Beziehung und soziale Stabilität.",
    relevance: "Gute Pflege verhindert Eskalationen, entlastet Angehörige und stabilisiert Gemeinschaften.",
    tags: ["Pflegewirkung", "Care-Arbeit", "Würde", "soziale Stabilität"],
    anchor: "pflege-als-wirkleistung-und-pflegeokosystem",
  },
  {
    title: "Psychische Gesundheit und soziale Stabilität",
    text: "Erschöpfung, Einsamkeit, Angst, digitale Gewalt, Mobbing, Armut, Wohnstress und Diskursvergiftung sind nicht nur private Belastungen. Sie wirken auf Arbeit, Bildung, Familien, Vertrauen und Demokratie.",
    relevance: "Psychische Stabilität ist auch ein demokratischer und wirtschaftlicher Stabilitätsfaktor.",
    tags: ["Mental Health", "Resilienz", "Medienwirkung", "Arbeit"],
    anchor: "psychische-gesundheit-und-soziale-stabilitat",
  },
  {
    title: "Kommunale Gesundheitsräume und Quartiere",
    text: "Gesundheit entsteht im Nahraum: durch Grün, Schatten, Begegnung, Mobilität, Versorgung, Sicherheit, Barrierefreiheit und soziale Einbettung.",
    relevance: "Kommunen sind natürliche Reallabore für Gesundheitswirkung.",
    tags: ["Quartier", "Hitze", "Mobilität", "Versorgung", "Teilhabe"],
    anchor: "versorgungsraume-kliniken-und-gesundheitsnetzwerke",
  },
  {
    title: "One Health, Klima, Umwelt und Ernährung",
    text: "Menschliche Gesundheit hängt mit Klima, Wasser, Boden, Biodiversität, Tieren, Pflanzen und Ernährungssystemen zusammen.",
    relevance: "Umweltpolitik, Landwirtschaft, Ernährung und Gesundheit können nicht getrennt gesteuert werden.",
    tags: ["One Health", "Klima", "Ernährung", "Biodiversität", "Wasser"],
    anchor: "one-health-klima-umwelt-und-ernahrung",
  },
  {
    title: "Gesundheitsdaten, KI und Datenschutz",
    text: "Gesundheitsdaten können Prävention, Frühwarnung und Versorgungsgerechtigkeit verbessern, aber nur unter strengem Schutz von Würde, Zweckbindung und digitaler Selbstbestimmung.",
    relevance: "Gesundheitsdaten dürfen nicht zu Kontrolle oder Personenbewertung werden.",
    tags: ["Privacy by Design", "KI", "Datenraum", "Rechtsstaatlichkeit"],
    anchor: "gesundheitsdaten-ki-und-burgerkontrolle",
  },
  {
    title: "Finanzierung, Wirkungsfonds und Gesundheitsgrundsicherung",
    text: "Gesundheit braucht eine Finanzierungslogik, die Prävention, Pflege, psychische Stabilität und kommunale Resilienz nicht schlechter stellt als Reparatur.",
    relevance: "Sonst investiert eine Stelle, während eine andere Stelle spart.",
    tags: ["Wirkungsfonds", "Gesundheitshaushalt", "Sozialabgaben", "Prävention"],
    anchor: "finanzierung-wirkungsfonds-und-gesundheitskassen",
  },
];

const sdgRefs = [
  ["sdg-3", "SDG 3 Gesundheit und Wohlergehen", "SDG 3 ist der direkte Referenzrahmen für Gesundheit, Prävention, Pflege, Wohlergehen und Versorgungssicherheit.", "verstehen/sdgs-sdgplus/sdg-3-gesundheit-wohlergehen/"],
  ["sdg-1", "SDG 1 Keine Armut", "Armut wirkt auf Krankheit, Pflegebedarf, Zugang, Ernährung, Wohnen und psychische Stabilität.", "verstehen/sdgs-sdgplus/sdg-1-keine-armut/"],
  ["sdg-2", "SDG 2 Kein Hunger", "Ernährungssicherheit, gesunde Ernährung und resiliente Ernährungssysteme sind Gesundheitsvoraussetzungen.", "verstehen/sdgs-sdgplus/sdg-2-kein-hunger/"],
  ["sdg-4", "SDG 4 Hochwertige Bildung", "Bildung stärkt Gesundheitskompetenz, Prävention, digitale Mündigkeit und Zugang zu Hilfe.", "verstehen/sdgs-sdgplus/sdg-4-hochwertige-bildung/"],
  ["sdg-8", "SDG 8 Menschenwürdige Arbeit", "Arbeitsbedingungen, Pflegearbeit, Stress, Sicherheit und faire Übergänge prägen Gesundheit.", "verstehen/sdgs-sdgplus/sdg-8-menschenwuerdige-arbeit-wirtschaftswachstum/"],
  ["sdg-10", "SDG 10 Weniger Ungleichheiten", "Gesundheitsgerechtigkeit macht vermeidbare und systematisch erzeugte Unterschiede sichtbar.", "verstehen/sdgs-sdgplus/sdg-10-weniger-ungleichheiten/"],
  ["sdg-11", "SDG 11 Nachhaltige Städte und Gemeinden", "Quartiere, Wohnraum, Mobilität, Grün, Hitze- und Lärmschutz sind Gesundheitsräume.", "verstehen/sdgs-sdgplus/sdg-11-nachhaltige-staedte-gemeinden/"],
  ["sdg-12", "SDG 12 Nachhaltiger Konsum und Produktion", "Produkte, Ernährung, Schadstoffe, Lieferketten und Beschaffung wirken auf Gesundheit.", "verstehen/sdgs-sdgplus/sdg-12-nachhaltiger-konsum-produktion/"],
  ["sdg-13", "SDG 13 Klimaschutz", "Hitze, Extremwetter, Luftqualität und Klimaanpassung sind Gesundheits- und Pflegerisiken.", "verstehen/sdgs-sdgplus/sdg-13-klimaschutz/"],
  ["sdg-16", "SDG 16 Frieden, Gerechtigkeit und starke Institutionen", "Vertrauen, Rechtsschutz, Zugang und starke Institutionen sichern faire Gesundheitssteuerung.", "verstehen/sdgs-sdgplus/sdg-16-frieden-gerechtigkeit-starke-institutionen/"],
  ["sdgplus-demokratie", "SDG+ Demokratie", "Demokratische Kontrolle verhindert, dass Gesundheitsdaten oder Wirkungslogik zur Technokratie werden.", "verstehen/sdgs-sdgplus/#sdgplus-demokratie"],
  ["sdgplus-digitale-selbstbestimmung", "SDG+ digitale Selbstbestimmung", "Gesundheitsdaten brauchen Datensparsamkeit, Zweckbindung, Einwilligung, Auskunft und Korrektur.", "verstehen/sdgs-sdgplus/#sdgplus-digitale-selbstbestimmung"],
  ["sdgplus-gesellschaftlicher-zusammenhalt", "SDG+ gesellschaftlicher Zusammenhalt", "Gesundheit, Pflege und psychische Stabilität sind Voraussetzungen für Zugehörigkeit und soziale Resilienz.", "verstehen/sdgs-sdgplus/#sdgplus-gesellschaftlicher-zusammenhalt"],
  ["sdgplus-institutionelles-vertrauen", "SDG+ institutionelles Vertrauen", "Menschen müssen Gesundheits- und Pflegeinstitutionen als fair, wirksam und korrigierbar erleben.", "verstehen/sdgs-sdgplus/#sdgplus-institutionelles-vertrauen"],
  ["sdgplus-medienqualitaet", "SDG+ Medienqualität", "Gesundheitsinformation, Quellenklarheit und Schutz vor Desinformation beeinflussen Entscheidungen und Vertrauen.", "verstehen/sdgs-sdgplus/#sdgplus-medienqualitaet"],
  ["sdgplus-rechtsstaatlichkeit", "SDG+ Rechtsstaatlichkeit", "Rechtsstaatlichkeit schützt Würde, Datenschutz, Zugang, Widerspruch und Verhältnismäßigkeit.", "verstehen/sdgs-sdgplus/#sdgplus-rechtsstaatlichkeit"],
];

const bookAnchors = [
  ["Kapitel 68 - Gesundheit", "referenz/kapitel-068-gesundheit/"],
  ["Kapitel 69 - Pflege", "referenz/kapitel-069-pflege/"],
  ["Kapitel 39 - Wirkungshaushalt", "referenz/kapitel-039-wirkungshaushalt-und-oeffentliche-mittel/"],
  ["Kapitel 65 - Resilienzstaat", "referenz/kapitel-065-resilienzstaat/"],
  ["Kapitel 15 - Leistung neu definieren", "referenz/kapitel-015-leistung-neu-definieren/"],
  ["Kapitel 16 - Begriffssystem", "referenz/kapitel-016-das-begriffssystem-der-wirkungsoekonomie/"],
  ["Kapitel 73 - Migration, Vielfalt und Zugehörigkeit", "referenz/kapitel-073-migration-und-gesellschaftliche-zugehoerigkeit/"],
  ["Kapitel 98 - Pilotierung und Kommunen", "referenz/kapitel-098-pilotprojekte/"],
];

const sources = [
  ["WHO - Social determinants of health", "https://www.who.int/health-topics/social-determinants-of-health"],
  ["WHO - One Health", "https://www.who.int/health-topics/one-health"],
  ["OECD - Health at a Glance 2025: Germany", "https://www.oecd.org/en/publications/health-at-a-glance-2025_15a55280-en/germany_99d672fb-en.html"],
  ["Destatis - Gesundheitsausgaben", "https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Gesundheit/Gesundheitsausgaben/_inhalt.html"],
  ["Destatis - Pflege", "https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Gesundheit/Pflege/_inhalt.html"],
  ["BMG - Gesundheitsberichterstattung und Monitoring", "https://www.bundesgesundheitsministerium.de/themen/gesundheitswesen/gesundheitsberichterstattung-und-gesundheitsmonitoring"],
  ["BMG - Prävention in der Pflege", "https://www.bundesgesundheitsministerium.de/themen/praevention/frueherkennung-vorsorge/praevention-in-der-pflege/"],
  ["European Commission - European Health Data Space", "https://health.ec.europa.eu/ehealth-digital-health-and-care/european-health-data-space_en"],
];

function esc(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
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
    .slice(0, 90);
}

function routeFor(rel) {
  return rel.endsWith("/index.html") ? `/${rel.slice(0, -"/index.html".length)}/` : `/${rel}`;
}

function baseFor(rel) {
  const parent = path.dirname(rel).split("/").filter(Boolean);
  return "../".repeat(parent.length);
}

function href(base, target) {
  if (!target) return "";
  if (/^(https?:|mailto:|#)/.test(target)) return target;
  return `${base}${target.replace(/^\/+/, "")}`;
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

function cite(id) {
  return `<a class="cite-anchor no-print" href="#${esc(id)}" aria-label="Zitierlink zu diesem Abschnitt">#</a>`;
}

function h2(id, text) {
  return `<h2 id="${esc(id)}">${esc(text)} ${cite(id)}</h2>`;
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
    <link rel="stylesheet" href="${base}assets/css/style.css?v=${CSS_VERSION}">
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="${base}index.html" aria-label="Wirkungsökonomie Startseite"><span class="brand-mark"><img src="${base}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span><span class="brand-name">Wirkungsökonomie</span></a>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav"><span class="nav-toggle-icon" aria-hidden="true">☰</span><span class="sr-only">Menü</span></button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation"><a href="${base}index.html">Start</a></nav>
    </header>
    <main>
      <p class="print-meta">Wirkungsökonomie · ${esc(title.replace(/\s+\|.*$/, ""))} · ${canonical} · Druckdatum: ${DATE}</p>
${body(base)}
    </main>
    <script src="${base}assets/js/main.js?v=${JS_VERSION}"></script>
  </body>
</html>`);
}

function safeLines(text) {
  const forbidden = /(CodeX|Codex|Repository|Build|Sitemap|Dateien anlegen|bitte prüfen|Toolaufruf|Prompt|ChatGPT|Python|interne Aufgabe|Abschlussbericht)/i;
  return String(text)
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !forbidden.test(line))
    .filter((line) => !/^Online- und Tool-Umsetzung$/i.test(line))
    .filter((line) => !/^Für die Website soll/i.test(line));
}

function trimCover(text, markers = []) {
  const lines = safeLines(text);
  const index = lines.findIndex((line) => markers.some((marker) => line === marker || line.startsWith(marker)));
  return (index >= 0 ? lines.slice(index) : lines).join("\n\n");
}

function mdToHtml(markdown, prefix = "") {
  const rawLines = safeLines(markdown);
  const knownHeadings = new Set([
    ...modules.map(([, title]) => title),
    ...Object.values(moduleAnchorTargets),
  ]);
  const toc = [];
  const html = [];
  const used = new Set();
  let paragraph = [];
  let list = [];
  let table = [];
  let paraIndex = 0;

  const unique = (raw) => {
    const base = `${prefix}${slugify(raw) || "abschnitt"}`;
    let id = base;
    let n = 2;
    while (used.has(id)) {
      id = `${base}-${n}`;
      n += 1;
    }
    used.add(id);
    return id;
  };

  const flushParagraph = () => {
    if (!paragraph.length) return;
    paraIndex += 1;
    const id = unique(`absatz-${String(paraIndex).padStart(3, "0")}`);
    html.push(`<p id="${id}">${esc(paragraph.join(" ").replace(/\*\*/g, ""))} ${cite(id)}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    html.push(`<ul>${list.map((item) => `<li>${esc(item.replace(/\*\*/g, ""))}</li>`).join("")}</ul>`);
    list = [];
  };
  const flushTable = () => {
    if (!table.length) return;
    const rows = table.map((line) => line.replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim())).filter((row) => !row.every((cell) => /^:?-{3,}:?$/.test(cell)));
    if (rows.length > 1) {
      const [head, ...body] = rows;
      html.push(`<div class="table-wrap"><table class="data-table"><thead><tr>${head.map((cell) => `<th>${esc(cell)}</th>`).join("")}</tr></thead><tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
    }
    table = [];
  };
  const heading = (level, text) => {
    flushParagraph(); flushList(); flushTable();
    const id = unique(text);
    toc.push({ level, text, id });
    html.push(`<h${level} id="${id}">${esc(text)} ${cite(id)}</h${level}>`);
  };

  for (const line of rawLines) {
    if (line.startsWith("|") && line.endsWith("|")) {
      flushParagraph(); flushList();
      table.push(line);
      continue;
    }
    const mdHeading = line.match(/^(#{1,4})\s+(.+)$/);
    if (mdHeading) {
      heading(Math.max(2, Math.min(4, mdHeading[1].length)), mdHeading[2]);
      continue;
    }
    if (knownHeadings.has(line)) {
      heading(2, line);
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const numberedHeading = line.replace(/^\d+\.\s+/, "");
      if (/^Online- und Tool-Umsetzung$/i.test(numberedHeading)) {
        continue;
      }
      heading(3, numberedHeading);
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      flushParagraph(); flushTable();
      list.push(line.replace(/^[-*]\s+/, ""));
      continue;
    }
    if (/^(Kurzfassung|Leitsatz|Dossier-Methodik|Kernformel|Alte Logik|Wirkungsökonomische Logik|Datenquellen|Quellen und externe Referenzen)$/i.test(line)) {
      heading(3, line);
      continue;
    }
    flushList(); flushTable();
    paragraph.push(line);
  }
  flushParagraph(); flushList(); flushTable();
  return { toc, html: html.join("\n") };
}

function toc(items) {
  if (!items.length) return "";
  return `<details class="toc-card no-print" aria-label="Inhaltsverzeichnis"><summary class="card-title">Inhaltsverzeichnis anzeigen</summary><ol>${items.map((item) => `<li class="toc-level-${esc(item.level)}"><a href="#${esc(item.id)}">${esc(item.text)}</a></li>`).join("")}</ol></details>`;
}

function cards(base, items) {
  return `<div class="card-grid three">${items.map(([title, kicker, text, url, extra = "Öffnen"]) => `<article class="card"><p class="card-kicker">${esc(kicker)}</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(text)}</p><div class="portal-card-actions">${url ? `<a class="text-link" href="${href(base, url)}">${esc(extra)}</a>` : `<span class="badge">in Vorbereitung</span>`}</div></article>`).join("")}</div>`;
}

function downloads(base) {
  const links = documents
    .filter((doc) => exists(`assets/downloads/${doc.download}`))
    .map((doc) => `<a class="btn btn-secondary" href="${href(base, `assets/downloads/${doc.download}`)}">${esc(doc.shortTitle)} herunterladen</a>`)
    .join("");
  return `<section class="section" aria-labelledby="downloads"><div class="card"><p class="hero-kicker">Arbeitsmaterial</p>${h2("downloads", "Downloads und Druck")}<p>Die Seite bleibt der Einstieg. Word-Dateien und Druckfassung sind ergänzende Arbeitsmaterialien für Vertiefung, Zitation und Weiterarbeit.</p><div class="portal-card-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button>${links}</div></div></section>`;
}

function publicationAccess(base) {
  const items = documents.map((doc) => [doc.shortTitle, "Vertiefung", doc.description, `wirkungsfelder/gesundheit-pflege/${doc.key}/`, "Online lesen"]);
  return `<section class="section" id="publikationszugang" aria-labelledby="publikationszugang-title"><div class="section-header"><p class="hero-kicker">Vertiefung</p>${h2("publikationszugang-title", "Vertiefung und Arbeitsmaterial")}<p>Hier liegen die ausführlichen Online-Fassungen, Dossiers, Methodik und ergänzende Downloads. Sie vertiefen die Landingpage, ohne den Einstieg zu überladen.</p></div>${cards(base, items)}<div class="download-card compact no-print"><div><p class="card-kicker">Downloads</p><h3 class="card-title">Word-Fassungen</h3><p class="card-text">Konzeptpapier, Gesamtdossier, Detailkonzepte und Einzeldossiers bleiben als Dateien verfügbar.</p></div><div class="portal-card-actions">${documents.map((doc) => exists(`assets/downloads/${doc.download}`) ? `<a class="btn btn-secondary" href="${href(base, `assets/downloads/${doc.download}`)}">${esc(doc.shortTitle)} herunterladen</a>` : "").join("")}</div></div></section>`;
}

function sdgBadge(base, [id, label, text, url], index) {
  const popover = `sdg-popover-${id}-gesundheit-${index}`;
  return `<span class="sdg-ref" data-sdg-id="${esc(id)}"><a class="sdg-ref-link" href="${href(base, url)}" aria-label="${esc(label)}: ${esc(text)}" aria-describedby="${esc(popover)}">${esc(label)}</a><button class="sdg-ref-info" type="button" aria-label="Kurzbeschreibung zu ${esc(label)}: ${esc(text)}" aria-describedby="${esc(popover)}">i</button><span class="sdg-ref-popover" id="${esc(popover)}" role="tooltip">${esc(text)} <span class="sdg-ref-more">Details öffnen</span></span></span>`;
}

function referenceBlock(base) {
  return `<section class="section" aria-labelledby="sdg-ref"><div class="portal-reference-block"><p class="hero-kicker">Referenzrahmen</p>${h2("sdg-ref", "SDG-/SDG+-Bezug")}<div class="model-strip">${sdgRefs.map((item, index) => sdgBadge(base, item, index)).join("")}</div><p>SDG+ ist keine offizielle UN-Kategorie, sondern eine transparente Erweiterung der Wirkungsökonomie für Demokratie, digitale Selbstbestimmung, gesellschaftlichen Zusammenhalt, institutionelles Vertrauen, Medienqualität und Rechtsstaatlichkeit.</p><a class="text-link" href="${href(base, "verstehen/sdgs-sdgplus/")}">Alle SDGs und SDG+ im Referenzrahmen ansehen</a></div></section>`;
}

function politicalBlock() {
  const rows = [
    ["Aufgabe der Politik", "Rahmen schaffen, damit Gesundheit als präventive, soziale, ökologische und demokratische Systemleistung sichtbar und finanzierbar wird."],
    ["Politische Rahmenbedingungen", "Gesundheitswirkungshaushalte, Präventionsbudgets, Pflegewirkung, kommunale Gesundheitsräume, Datenstandards, Datenschutz und Evaluation."],
    ["Ausgestaltungsspielraum", "Kassenmodelle, kommunale Pilotierung, öffentliche Fonds, Versicherungsmodelle, gesetzliche Mindeststandards oder Förderprogramme bleiben demokratisch offen."],
    ["Zielkonflikte", "Freiheit und Schutz, Datenschutz und Frühwarnung, Kosten und Qualität, Zentralisierung und Nahversorgung, Innovation und Solidarität müssen abgewogen werden."],
    ["Rollenverteilung", "EU, Bund, Länder, Kommunen, Kassen, Pflegeeinrichtungen, Kliniken, Unternehmen, Wissenschaft und Zivilgesellschaft tragen unterschiedliche Verantwortung."],
    ["Übergang und Schutz", "Keine Personen-Scores, keine Sanktionierung von Krankheit, keine Diagnostik durch Website-Tools, Pilotregionen, Härtefallregeln und Schutz vulnerabler Gruppen."],
    ["Evaluation und Korrektur", "Gesundheitswirkungsberichte, Präventionsrechner, Pflegestabilitätsindikatoren, öffentliche Revisionszyklen und Wirkungsrat halten das System lernfähig."],
    ["Schutz vor Technokratie", "Wirkungsdaten bereiten Entscheidungen vor, ersetzen sie aber nicht. Normative Entscheidungen bleiben demokratisch legitimiert."],
  ];
  return `<section class="section" aria-labelledby="politik"><div class="section-header"><p class="hero-kicker">Demokratische Umsetzung</p>${h2("politik", "Politische Anschlussfähigkeit und Umsetzungsoptionen")}<p>Die folgenden politischen Anforderungen beschreiben keinen fertigen Parteibeschluss. Sie markieren den notwendigen Rahmen, damit Gesundheit & Pflege demokratisch, rechtsstaatlich und praktisch umgesetzt werden können.</p></div><div class="table-wrap"><table class="data-table"><tbody>${rows.map(([a, b]) => `<tr><th scope="row">${esc(a)}</th><td>${esc(b)}</td></tr>`).join("")}</tbody></table></div></section>`;
}

function policyActionBox() {
  const actions = [
    ["Prävention haushaltsfähig machen", "Vermiedene Schäden, vermiedene Pflegebedarfe und gewonnene Lebensqualität müssen in Haushalten sichtbar werden."],
    ["Pflege als Infrastruktur behandeln", "Pflege darf nicht nur als Kostenstelle verwaltet werden. Sie ist Würde-, Autonomie-, Beziehungs- und Stabilitätsleistung."],
    ["Kommunen stärken", "Quartiere, Hitzeschutz, Mobilität, Grünflächen, Begegnungsräume, Versorgung und Barrierefreiheit müssen gemeinsam geplant werden."],
    ["Gesundheitsdaten schützen und nutzen", "Daten dürfen Prävention und Frühwarnung ermöglichen, aber keine Personenbewertung, keine Diskriminierung und keine Überwachung erzeugen."],
    ["Finanzierungslogik ändern", "Kassen, Kommunen, Bund, Länder und Fonds müssen so gekoppelt werden, dass Prävention nicht an Zuständigkeitsgrenzen scheitert."],
    ["Wirkung demokratisch kontrollieren", "Wirkungsdaten bereiten Entscheidungen vor, ersetzen sie aber nicht. Rechtsschutz, Pilotierung, Evaluation und Wirkungsrat bleiben notwendig."],
  ];
  return `<section class="section policy-action-section" aria-labelledby="politik-handeln"><div class="section-header"><p class="hero-kicker">Umsetzung</p>${h2("politik-handeln", "Was muss Politik hier tun?")}<p>Gesundheit & Pflege werden nicht durch ein einzelnes Gesetz gelöst. Politik muss den Rahmen schaffen, damit Prävention, Pflege, psychische Stabilität und kommunale Gesundheitsräume als Wirkung sichtbar und finanzierbar werden.</p></div><div class="card-grid three">${actions.map(([title, text]) => `<article class="card"><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(text)}</p></article>`).join("")}</div><p class="section-link-row"><a class="text-link" href="#political-implementation">Umsetzungsoptionen lesen</a></p></section>`;
}

function conceptGrid(base) {
  return `<section class="section" aria-labelledby="zentrale-konzepte"><div class="section-header"><p class="hero-kicker">Konzepte</p>${h2("zentrale-konzepte", "Zentrale Konzepte")}<p>Die Konzepte sind Einstiegspunkte. Die Langfassungen liegen in den Vertiefungen am Seitenende.</p></div><div class="card-grid two concept-card-grid">${conceptCards.map((item) => `<article class="card concept-card"><h3 class="card-title">${esc(item.title)}</h3><p class="card-text">${esc(item.text)}</p><p class="card-text"><strong>Warum relevant?</strong> ${esc(item.relevance)}</p><div class="chip-list" aria-label="Anschluss">${item.tags.map((tag) => `<span class="badge">${esc(tag)}</span>`).join("")}</div><div class="portal-card-actions"><a class="text-link" href="${href(base, `wirkungsfelder/gesundheit-pflege/detailkonzepte/#detail-${item.anchor}`)}">Konzept ansehen</a></div></article>`).join("")}</div></section>`;
}

function comparisonBox() {
  const oldLogic = [
    "Krankheit wird finanziert, wenn sie eingetreten ist.",
    "Prävention erscheint als Kostenblock.",
    "Pflege gilt als Kostenstelle.",
    "Psychische Gesundheit wird reaktiv behandelt.",
    "Daten dienen oft Abrechnung und Kontrolle.",
  ];
  const woekLogic = [
    "Gesundheit wird erzeugt, erhalten und präventiv geschützt.",
    "Vermiedene Schäden werden als Wirkung sichtbar.",
    "Pflege ist Wirkleistung für Würde, Autonomie und Stabilität.",
    "Psychische Stabilität wird als Systembedingung betrachtet.",
    "Daten dienen Prävention, Frühwarnung und gerechter Ressourcensteuerung.",
  ];
  return `<section class="section" aria-labelledby="alte-logik"><div class="section-header"><p class="hero-kicker">Systemwechsel</p>${h2("alte-logik", "Was das heutige System falsch sieht")}</div><div class="comparison-grid"><article class="card"><p class="card-kicker">Alte Logik</p><ul class="clean-list">${oldLogic.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></article><article class="card"><p class="card-kicker">WÖk-Logik</p><ul class="clean-list">${woekLogic.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></article></div></section>`;
}

function toolGrid(base) {
  const items = tools.map(([slug, title, type, text]) => [title, type, text, `wirkungsfelder/gesundheit-pflege/tools/${slug}/`, "Methodik lesen"]);
  return `<section class="section" aria-labelledby="tools"><div class="section-header"><p class="hero-kicker">Methoden</p>${h2("tools", "Werkzeuge und Methoden in diesem Bereich")}<p>Die folgenden Ansätze sind Modell- und Planungshilfen. Sie sind keine medizinische Diagnostik, keine Therapieempfehlung und keine Personenbewertung.</p></div>${cards(base, items)}</section>`;
}

function moduleGrid(base) {
  return `<section class="section" aria-labelledby="unterbereiche"><div class="section-header"><p class="hero-kicker">Vertiefung</p>${h2("unterbereiche", "Vertiefende Unterbereiche")}<p>Diese Unterbereiche führen tiefer in die Wirkungslogik, ohne die Einstiegsseite zu überladen.</p></div><div class="card-grid three">${modules.map(([, title, text]) => {
    const anchor = slugify(moduleAnchorTargets[title] || title);
    return `<article class="card"><p class="card-kicker">Vertiefung</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(text)}</p><div class="portal-card-actions"><a class="text-link" href="${href(base, `wirkungsfelder/gesundheit-pflege/detailkonzepte/#detail-${anchor}`)}">Vertiefung lesen</a></div></article>`;
  }).join("")}</div></section>`;
}

function bookBlock(base) {
  return `<section class="section" aria-labelledby="buch"><div class="section-header"><p class="hero-kicker">Online-Buch</p>${h2("buch", "Anker im Online-Buch")}</div><div class="model-strip">${bookAnchors.map(([label, url]) => `<a href="${href(base, url)}">${esc(label)}</a>`).join("")}</div></section>`;
}

function sourcesBlock() {
  return `<section class="section" aria-labelledby="quellen"><div class="card"><p class="hero-kicker">Quellen</p>${h2("quellen", "Quellen und Datenbezüge")}<p>Die externen Referenzen dienen als belastbare Anschlussquellen. Externe Links öffnen in einem neuen Tab.</p><div class="model-strip">${sources.map(([label, url]) => `<a class="text-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} <span class="sr-only">(externe Quelle)</span></a>`).join("")}</div></div></section>`;
}

function protectionBlock() {
  return `<section class="section" aria-labelledby="schutz"><div class="card"><p class="hero-kicker">Schutzgrenzen</p>${h2("schutz", "Keine medizinische Beratung und kein Personen-Scoring")}<p>Diese Seiten ersetzen keine medizinische Beratung, keine Diagnostik und keine Therapie. Bewertet werden Programme, Räume, Strukturen, Regeln und Finanzierungslogiken, nicht Menschen. Krankheit darf nicht sanktioniert werden. Datenschutz und Würde sind rote Linien.</p></div></section>`;
}

function crossLinks(base) {
  const items = [
    ["Wohnen & Stadt", "Wirkungsfeld", "Wohnraum, Hitze, Lärm, Barrierefreiheit und Quartier prägen Gesundheit.", "wirkungsfelder/wohnen-stadt/"],
    ["Arbeit & Einkommen", "Wirkungsfeld", "Arbeitsbedingungen, Automatisierung, Einkommen und Care wirken direkt auf Gesundheit.", "wirkungsfelder/arbeit-einkommen/"],
    ["Bildung", "Wirkungsfeld", "Gesundheitskompetenz, Schulgesundheit, psychische Stabilität und digitale Mündigkeit beginnen früh.", "wirkungsfelder/bildung/"],
    ["Staat, Recht & Demokratie", "Wirkungsfeld", "Rechtsschutz, Wirkungshaushalt, Wirkungsrat und Datenschutz sichern demokratische Umsetzung.", "wirkungsfelder/staat-recht-demokratie/"],
    ["Finanzsystem & Kapital", "Wirkungsfeld", "Gesundheitsfonds, Präventionsdividende und Wirkungsfinanzierung brauchen Kapitalarchitektur.", "wirkungsfelder/finanzsystem-kapital/"],
    ["Impact Controlling", "Werkzeug", "T-SROI, NWI, WÖk-IDs und Scorecards machen Gesundheitswirkung prüfbar.", "werkzeuge/impact-controlling/"],
  ];
  return `<section class="section" aria-labelledby="vernetzung"><div class="section-header"><p class="hero-kicker">Vernetzung</p>${h2("vernetzung", "Verwandte Wirkungsfelder und Werkzeuge")}</div>${cards(base, items)}</section>`;
}

function healthCentralPage() {
  const t = [
    { level: 2, text: "Gesundheit als zentrales Wirkungsfeld", id: "gesundheit-wirkungsfeld-title" },
    { level: 2, text: "Vom Krankheitssystem zum Gesundheitssystem", id: "krankheit-gesundheit-title" },
    { level: 2, text: "Prävention als Wirkleistung", id: "praevention-title" },
    { level: 2, text: "One Health", id: "one-health-title" },
    { level: 2, text: "Pflege und Care", id: "pflege-care-title" },
    { level: 2, text: "Psychische Gesundheit", id: "psychische-gesundheit-title" },
    { level: 2, text: "Produkte, Gebäude und Städte", id: "produkte-gebaeude-staedte-title" },
    { level: 2, text: "Umwelt und Gesundheitsrisiken", id: "umwelt-risiken-title" },
    { level: 2, text: "Daten, Datenschutz und Messbarkeit", id: "daten-messbarkeit-title" },
    { level: 2, text: "SDG 3 und SDG+", id: "sdg3-sdgplus-title" },
    { level: 2, text: "Weiterlesen", id: "weiterlesen-title" },
  ];
  const methodLinks = [
    ["Wirkung", "begriffe/wirkung/"],
    ["positive Netto-Wirkung", "begriffe/positive-netto-wirkung/"],
    ["SDGs & SDG+", "verstehen/sdgs-sdgplus/"],
    ["T-SROI", "werkzeuge/impact-controlling/t-sroi/"],
    ["Wirkungssteuer", "werkzeuge/wirkungssteuergesetz/"],
    ["WÖk-ID", "werkzeuge/woek-ids/"],
    ["Reverse Merit Order", "werkzeuge/reverse-merit-order/"],
    ["Prävention", "begriffe/praevention/"],
    ["One Health", "begriffe/one-health/"],
    ["Gesundheitssystem", "begriffe/gesundheitssystem/"],
    ["Gesundheitswirkung", "begriffe/gesundheitswirkung/"],
  ];
  const topicCards = [
    ["Gesundheit als Wirkungsfeld", "Gesundheit ist kein medizinisches Einzelereignis. Sie entsteht durch Wohnen, Arbeit, Ernährung, Bildung, Umwelt, Pflege, Versorgung, Kultur, Vertrauen und digitale Räume."],
    ["Krankheitssystem zu Gesundheitssystem", "Die Wirkungsökonomie macht sichtbar, wo Strukturen Krankheit verwalten, statt Gesundheit, Autonomie, Resilienz und Teilhabe zu erzeugen."],
    ["Prävention", "Vermiedene Krankheit, vermiedener Pflegebedarf, psychische Stabilisierung und geringere Krisenlast sind Wirkleistungen, auch wenn der Schaden gerade nicht eintritt."],
    ["One Health", "Menschliche Gesundheit hängt mit Tieren, Pflanzen, Ökosystemen, Klima, Wasser, Boden, Biodiversität und Ernährung zusammen."],
    ["Pflege und Care", "Pflege ist Wirkleistung für Würde, Beziehung, Autonomie, Angehörigenentlastung und gesellschaftliche Stabilität."],
    ["Psychische Gesundheit", "Einsamkeit, Stress, Wohnunsicherheit, digitale Gewalt, Arbeitsdruck und Diskursvergiftung sind Wirkfaktoren, nicht nur private Belastungen."],
  ];
  const environmentCards = [
    ["Gesunde Produkte", "Produkte wirken über Inhaltsstoffe, Materialgesundheit, Lieferketten, Nutzung, Entsorgung und Information auf Mensch, Planet und Demokratie."],
    ["Gesunde Gebäude", "Gebäude wirken über Luft, Licht, Lärm, Hitze, Barrierefreiheit, Schimmel, Energie, Sicherheit und soziale Einbettung."],
    ["Gesunde Städte", "Quartiere wirken über Grün, Schatten, Mobilität, Begegnung, Versorgung, Wasser, Lärm, Hitze und demokratische Teilhabe."],
    ["NOx, Feinstaub und Luftqualität", "Luftschadstoffe sind Gesundheitswirkung, Umweltwirkung und Gerechtigkeitsfrage zugleich."],
    ["Chemikaliensicherheit", "Chemikalien, Materialdaten und rote Linien dürfen nicht durch gute Werte an anderer Stelle kompensiert werden."],
    ["Lärm und Hitze", "Lärm, Hitzeinseln und Klimarisiken werden als gesundheitliche, soziale und infrastrukturelle Wirkungen sichtbar."],
  ];

  page({
    rel: "wirkungsfelder/gesundheit/index.html",
    title: "Gesundheit in der Wirkungsökonomie - Prävention statt Krankheitsverwaltung",
    description: "Gesundheit als zentrales Wirkungsfeld der Wirkungsökonomie: Prävention, Pflege, One Health, psychische Gesundheit, Umwelt, Daten und positive Netto-Wirkung.",
    body: (base) => `<section class="hero portal-hero"><div class="hero-grid"><div><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "wirkungsfelder/")}">Wirkungsfelder</a></nav><p class="hero-kicker">Wirkungsfeld</p><h1>Gesundheit in der Wirkungsökonomie</h1><p class="hero-subtitle">Prävention statt Krankheitsverwaltung.</p><p class="hero-text"><strong>Das heutige System finanziert Krankheit. Die Wirkungsökonomie finanziert Gesundheit.</strong></p><p>Gemeint ist keine medizinische Beratung und kein Personen-Scoring. Die Seite ordnet Strukturen, Räume, Produkte, Daten, Pflege, Prävention und politische Rückkopplung als Gesundheitswirkung ein.</p><div class="hero-actions no-print"><a class="btn btn-primary" href="#gesundheit-wirkungsfeld-title">Gesamtlogik lesen</a><a class="btn btn-secondary" href="${href(base, "wirkungsfelder/gesundheit-pflege/")}">Gesundheit &amp; Pflege vertiefen</a><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button></div></div><aside class="card"><p class="card-kicker">Schutzlinie</p><h2 class="card-title">Strukturen bewerten, nicht Menschen.</h2><p class="card-text">Keine Diagnostik, keine medizinische Beratung, keine automatische Entscheidung, keine Personenbewertung. Datenqualität, Datenschutz, Rechtsschutz und demokratische Verantwortung bleiben rote Linien.</p></aside></div></section>${toc(t)}
      <section class="section" id="gesundheit-wirkungsfeld" aria-labelledby="gesundheit-wirkungsfeld-title"><div class="section-header"><p class="hero-kicker">Zentraler Wirkungsraum</p>${h2("gesundheit-wirkungsfeld-title", "Gesundheit als zentrales Wirkungsfeld")}<p>Gesundheit ist in der Wirkungsökonomie ein Querschnittsfeld. Sie verbindet körperliche und psychische Gesundheit, Pflege, Prävention, Versorgung, Umwelt, Wohnen, Arbeit, Bildung, Ernährung, Daten und Vertrauen. Positive Netto-Wirkung entsteht, wenn Lebensbedingungen Gesundheit wahrscheinlicher machen und negative Gesundheitswirkungen nicht verdeckt werden.</p></div>${cards(base, topicCards.map(([title, text]) => [title, "Baustein", text, "", ""]))}</section>
      <section class="section" id="krankheit-gesundheit" aria-labelledby="krankheit-gesundheit-title"><div class="section-header"><p class="hero-kicker">Systemwechsel</p>${h2("krankheit-gesundheit-title", "Vom Krankheitssystem zum Gesundheitssystem")}<p>Das Krankheitssystem reagiert, wenn Schäden eingetreten sind. Ein Gesundheitssystem macht Schutz, Prävention, Pflege, gute Lebensbedingungen und resiliente Versorgung entscheidungsrelevant. Behandlung bleibt unverzichtbar, aber sie ist nicht der einzige Maßstab.</p></div>${comparisonBox()}</section>
      <section class="section" id="praevention" aria-labelledby="praevention-title"><div class="section-header"><p class="hero-kicker">Wirkleistung</p>${h2("praevention-title", "Prävention als Wirkleistung")}<p>Prävention erzeugt Wirkung, obwohl der vermiedene Schaden nicht sichtbar eintritt. Wirkungsökonomisch relevant sind vermiedene Erkrankungen, vermiedener Pflegebedarf, längere Autonomie, geringere Krisenlast, bessere Lebensqualität und weniger Folgekosten.</p></div>${cards(base, [["Präventionsökonomie", "Glossar", "Warum vermiedene Schäden und Schutzfaktoren haushalts- und steuerungsfähig werden müssen.", "begriffe/praeventionsoekonomie/"], ["Wirkungshaushalt Gesundheit", "Werkzeug", "Prävention, Pflegeentlastung und Gesundheitsresilienz haushaltsfähig machen.", "wirkungsfelder/gesundheit-pflege/tools/wirkungshaushalt-gesundheit/"], ["T-SROI Prävention", "Methode", "Transformationsnutzen über vermiedene Schäden, Resilienz, Teilhabe und Folgekosten bewerten.", "wirkungsfelder/gesundheit-pflege/tools/t-sroi-praevention-gesundheitsinvestitionen/"]])}</section>
      <section class="section" id="one-health" aria-labelledby="one-health-title"><div class="section-header"><p class="hero-kicker">One Health</p>${h2("one-health-title", "Mensch, Tiere, Ökosysteme und Ernährung zusammen denken")}<p>One Health verbindet Gesundheit mit Klima, Wasser, Boden, Biodiversität, Tieren, Pflanzen, Ernährungssystemen und Chemikaliensicherheit. Diese Perspektive verhindert, dass Gesundheitswirkung künstlich von Umweltwirkung getrennt wird.</p></div>${cards(base, [["One Health", "Glossar", "Gesundheit von Menschen, Tieren und Ökosystemen als verbundene Wirkungslogik.", "begriffe/one-health/"], ["One-Health-Logik", "Werkzeug", "Klima, Umwelt, Ernährung, Wasser, Biodiversität und Gesundheit gemeinsam betrachten.", "wirkungsfelder/gesundheit-pflege/tools/one-health-score/"], ["Planetary Health", "Glossar", "Gesundheit innerhalb planetarer Grenzen und ökologischer Belastbarkeit.", "begriffe/planetary-health/"]])}</section>
      <section class="section" id="pflege-care" aria-labelledby="pflege-care-title"><div class="section-header"><p class="hero-kicker">Pflege &amp; Care</p>${h2("pflege-care-title", "Pflege und Care als Wirkleistung")}<p>Pflege und Care sind keine privaten Restgrößen. Sie stabilisieren Würde, Autonomie, Beziehungen, Angehörige, Erwerbsfähigkeit, Nachbarschaften und demokratische Teilhabe. Die Wirkungsökonomie macht diese Leistungen sichtbar, ohne Menschen nach Krankheit, Alter oder Unterstützungsbedarf zu bewerten.</p></div>${cards(base, [["Pflege als Wirkleistung", "Glossar", "Pflege als Würde-, Autonomie-, Beziehungs- und Stabilitätsleistung.", "begriffe/pflege-als-wirkleistung/"], ["Pflegewirkungscheck", "Werkzeug", "Pflege als Infrastruktur prüfen, ohne Menschen zu bewerten.", "wirkungsfelder/gesundheit-pflege/tools/pflegewirkungscheck/"], ["Kapitel Pflege", "Online-Buch", "Buchanker zur Pflege in der Wirkungsökonomie.", "referenz/kapitel-069-pflege/"]])}</section>
      <section class="section" id="psychische-gesundheit" aria-labelledby="psychische-gesundheit-title"><div class="section-header"><p class="hero-kicker">Mental Health</p>${h2("psychische-gesundheit-title", "Psychische Gesundheit und soziale Stabilität")}<p>Psychische Gesundheit ist kein Randthema. Erschöpfung, Einsamkeit, Angst, digitale Gewalt, Arbeitsstress, Armut, Wohnstress und Vertrauensverlust wirken auf Bildung, Arbeit, Familie, Pflege, Öffentlichkeit und Demokratie.</p></div>${cards(base, [["Mental-Health-Reflexionstool", "Reflexion", "Nicht-diagnostische Orientierung zu Belastungsräumen, Schutzfaktoren und Unterstützungswegen.", "wirkungsfelder/gesundheit-pflege/tools/mental-health-reflexionstool/"], ["Medien & Öffentlichkeit", "Wirkungsfeld", "Informationsräume, Desinformation und Diskursqualität wirken auf psychische Stabilität und Vertrauen.", "wirkungsfelder/medien-oeffentlichkeit/"], ["Arbeit & Einkommen", "Wirkungsfeld", "Arbeitsbedingungen, Sinn, Sicherheit und Übergänge sind Gesundheitsräume.", "wirkungsfelder/arbeit-einkommen/"]])}</section>
      <section class="section" id="produkte-gebaeude-staedte" aria-labelledby="produkte-gebaeude-staedte-title"><div class="section-header"><p class="hero-kicker">Alltagsräume</p>${h2("produkte-gebaeude-staedte-title", "Gesunde Produkte, Gebäude und Städte")}<p>Gesundheit entsteht auch in Produktdesign, Gebäuden, Quartieren, Mobilität, öffentlichem Raum und Beschaffung. Diese Wirkungen müssen mit Scorecards, WÖk-IDs, Datenqualität und roten Linien prüfbar werden.</p></div>${cards(base, environmentCards.slice(0, 3).map(([title, text]) => [title, "Gesundheitswirkung", text, "", ""]))}</section>
      <section class="section" id="umwelt-risiken" aria-labelledby="umwelt-risiken-title"><div class="section-header"><p class="hero-kicker">Umweltwirkung</p>${h2("umwelt-risiken-title", "NOx, Feinstaub, Chemikalien, Lärm und Hitze")}<p>Umweltbelastungen sind keine abstrakten Nebenfolgen. Sie wirken auf Atemwege, Herz-Kreislauf-System, Pflegebedarf, psychische Belastung, Arbeitsfähigkeit, Lernfähigkeit, soziale Ungleichheit und institutionelles Vertrauen.</p></div>${cards(base, environmentCards.slice(3).map(([title, text]) => [title, "Gesundheitsrisiko", text, "", ""]))}</section>
      <section class="section" id="daten-messbarkeit" aria-labelledby="daten-messbarkeit-title"><div class="section-header"><p class="hero-kicker">Messbarkeit</p>${h2("daten-messbarkeit-title", "Gesundheitsdaten, Datenschutz und Prüfpfade")}<p>Gesundheitswirkung wird über Indikatoren, Quellen, Einheiten, Datenqualität, Unsicherheit, Schwellen, Reviewstatus und Prüfpfade nachvollziehbar. Gesundheitsdaten dürfen aber nicht zu Überwachung, Diskriminierung oder automatischen Entscheidungen führen.</p></div>${cards(base, [["WÖk-ID Register", "Register", "Indikatoren, Quellen, Berechnungslogik und Datenqualität versionierbar prüfen.", "woek-id-register/"], ["Gesundheitsdatenraum", "Werkzeug", "Zweckbindung, Datensparsamkeit, Pseudonymisierung, Einwilligung, Governance und Korrekturwege prüfen.", "wirkungsfelder/gesundheit-pflege/tools/gesundheitsdatenraum-privacy-by-design/"], ["Gesundheitswirkungscheck", "Werkzeug", "Programme, Räume oder Maßnahmen nach Gesundheitsgewinn, Prävention, Teilhabe und Nebenwirkungen prüfen.", "wirkungsfelder/gesundheit-pflege/tools/gesundheitswirkungscheck/"]])}</section>
      <section class="section" id="sdg3-sdgplus" aria-labelledby="sdg3-sdgplus-title"><div class="portal-reference-block"><p class="hero-kicker">Referenzrahmen</p>${h2("sdg3-sdgplus-title", "SDG 3, Agenda 2030 und SDG+")}<p>SDG 3 ist der direkte Referenzrahmen für Gesundheit und Wohlergehen. SDG+ ergänzt transparent WÖk-Dimensionen wie Demokratiequalität, institutionelles Vertrauen, Rechtsstaatlichkeit, Medienqualität, digitale Selbstbestimmung und gesellschaftlichen Zusammenhalt. SDG+ ist keine offizielle UN-Kategorie.</p><div class="model-strip">${methodLinks.map(([label, url]) => `<a href="${href(base, url)}">${esc(label)}</a>`).join("")}</div></div></section>
      <section class="section" id="weiterlesen" aria-labelledby="weiterlesen-title"><div class="section-header"><p class="hero-kicker">Vertiefung</p>${h2("weiterlesen-title", "Weiterlesen und anwenden")}<p>Die Gesundheitsseite ist der Einstieg. Die bestehende Detailstruktur bleibt erhalten und wird von hier aus zugänglich.</p></div>${cards(base, [["Gesundheit & Pflege", "Portal", "Vollständiges Portal mit Dossiers, Detailkonzepten, Tools und Quellen.", "wirkungsfelder/gesundheit-pflege/"], ["Journal: Gesundheit erzeugen", "Journal", "Vorbereiteter Artikel zur Verschiebung von Krankheitsverwaltung zu Gesundheitswirkung.", "journal/gesundheit-erzeugen-statt-krankheit-verwalten/"], ["Arbeitsbibliothek Gesundheit & Pflege", "Bibliothek", "Konzeptpapier, Gesamtdossier, Detailkonzepte, Einzeldossiers und Methodiken.", "werkstatt/arbeitsbibliothek/wirkungsfelder/gesundheit-pflege/"]])}</section>${protectionBlock()}${sourcesBlock()}`,
  });
}

function portalPage() {
  const t = [
    { level: 2, text: "Leitsatz", id: "leitsatz" },
    { level: 2, text: "Was das heutige System falsch sieht", id: "alte-logik" },
    { level: 2, text: "Zentrale Konzepte", id: "zentrale-konzepte" },
    { level: 2, text: "Was muss Politik hier tun?", id: "politik-handeln" },
    { level: 2, text: "Vertiefende Unterbereiche", id: "unterbereiche" },
    { level: 2, text: "Werkzeuge und Methoden", id: "tools" },
    { level: 2, text: "Vertiefung und Arbeitsmaterial", id: "publikationszugang-title" },
    { level: 2, text: "SDG-/SDG+-Bezug", id: "sdg-ref" },
    { level: 2, text: "Schutzgrenzen", id: "schutz" },
  ];
  page({
    rel: "wirkungsfelder/gesundheit-pflege/index.html",
    title: "Gesundheit & Pflege | Wirkungsökonomie",
    description: "Gesundheit & Pflege als Wirkungsfeld: Prävention, Pflege, Lebensqualität, Gesundheitsräume, One Health, Datenschutz und Wirkungshaushalt.",
    body: (base) => `<section class="hero portal-hero"><div class="hero-grid"><div><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "wirkungsfelder/")}">Wirkungsfelder</a></nav><p class="hero-kicker">Wirkungsfeld</p><h1>Gesundheit & Pflege</h1><p class="hero-subtitle">Vom System, das Krankheit finanziert, zu einem System, das Gesundheit, Prävention, Pflege, Resilienz und Teilhabe erzeugt.</p><p>Gesundheit ist kein medizinisches Einzelereignis, sondern ein gesellschaftlicher Zustand. Pflege ist keine Kostenstelle, sondern Beziehungs-, Würde- und Stabilitätsinfrastruktur.</p></div><aside class="card" id="leitsatz"><p class="card-kicker">Leitsatz</p><h2 class="card-title">Gesundheit wird erzeugt, geschützt und gerecht zugänglich gemacht.</h2><p class="card-text">Behandlung bleibt notwendig. Aber Prävention, Pflege, psychische Stabilität, kommunale Gesundheitsräume und One Health müssen entscheidungsrelevant werden.</p></aside></div></section>${toc(t)}${comparisonBox()}${conceptGrid(base)}${policyActionBox()}${moduleGrid(base)}${toolGrid(base)}${publicationAccess(base)}${referenceBlock(base)}${bookBlock(base)}${crossLinks(base)}${protectionBlock()}${sourcesBlock()}${downloads(base)}`,
  });
}

function documentPage(doc) {
  const raw = read(doc.md);
  const markers = doc.key === "konzept" ? ["1. Executive Summary"] : doc.key === "dossier" ? ["1. Praxisfrage"] : ["Gesundheit als gesellschaftliches Wirkungsfeld"];
  const prefix = doc.key === "detailkonzepte" ? "detail-" : `${doc.key}-`;
  const { toc: t, html } = mdToHtml(trimCover(raw, markers), prefix);
  page({
    rel: `wirkungsfelder/gesundheit-pflege/${doc.key}/index.html`,
    title: `${doc.title} | Wirkungsökonomie`,
    description: `${doc.title} online lesen: zitierfähige Volltextfassung mit Download, SDG-/SDG+-Bezug, Buchankern, Quellen und Druckfunktion.`,
    type: "Online-Volltext",
    body: (base) => `<section class="hero portal-hero"><div class="hero-grid"><div><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "wirkungsfelder/gesundheit-pflege/")}">Gesundheit & Pflege</a></nav><p class="hero-kicker">Online-Volltext</p><h1>${esc(doc.title)}</h1><p class="hero-subtitle">${esc(doc.description)}</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="#volltext">Online lesen</a>${exists(`assets/downloads/${doc.download}`) ? `<a class="btn btn-secondary" href="${href(base, `assets/downloads/${doc.download}`)}">${esc(doc.shortTitle)} herunterladen</a>` : ""}</div></div><aside class="card"><p class="card-kicker">Zitierfähig</p><h2 class="card-title">Online lesen, gezielt zitieren</h2><p class="card-text">Diese Fassung ist vollständig online lesbar. Abschnittsanker können direkt zitiert werden; die Word-Datei bleibt Export- und Archivfassung.</p></aside></div></section>${toc(t)}<section class="section" id="volltext" aria-labelledby="volltext-title"><div class="prose">${h2("volltext-title", `${doc.shortTitle} online lesen`)}${html}</div></section>${toolGrid(base)}${politicalBlock()}${referenceBlock(base)}${bookBlock(base)}${protectionBlock()}${sourcesBlock()}${downloads(base)}`,
  });
}

function toolPage([slug, title, type, description]) {
  const spec = read(`${SOURCE}/tool_spezifikation_gesundheitswirkungs_tool_suite.md`);
  const { toc: t, html } = mdToHtml(trimCover(spec, ["Zweck"]), `tool-${slug}-`);
  page({
    rel: `wirkungsfelder/gesundheit-pflege/tools/${slug}/index.html`,
    title: `${title} | Gesundheit & Pflege`,
    description: `${title} im Gesundheits- und Pflegeportal der Wirkungsökonomie: Modelllogik, Schutzgrenzen, Datenannahmen und Umsetzungshinweise.`,
    type: "Werkzeug",
    body: (base) => `<section class="hero portal-hero"><div class="hero-grid"><div><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "wirkungsfelder/gesundheit-pflege/")}">Gesundheit & Pflege</a></nav><p class="hero-kicker">${esc(type)}</p><h1>${esc(title)}</h1><p class="hero-subtitle">${esc(description)}</p><p>Modellhafte Methodenseite. Keine medizinische Beratung, keine Diagnostik, keine Rechts- oder Förderberatung und keine Personenbewertung.</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="#methodik">Methodik lesen</a><a class="btn btn-secondary" href="${href(base, "wirkungsfelder/gesundheit-pflege/")}">Zurück zum Wirkungsfeld</a></div></div><aside class="card"><p class="card-kicker">Schutzgrenze</p><h2 class="card-title">Strukturen bewerten, nicht Menschen.</h2><p class="card-text">Die Methode betrachtet Programme, Räume, Organisationen oder politische Maßnahmen. Gesundheitsdaten brauchen Datenschutz, Zweckbindung und Korrekturwege.</p></aside></div></section>${toc(t)}<section class="section" id="methodik" aria-labelledby="methodik-title"><div class="prose">${h2("methodik-title", "Methodik lesen")}${html}</div></section>${toolGrid(base)}${politicalBlock()}${referenceBlock(base)}${bookBlock(base)}${protectionBlock()}${sourcesBlock()}${downloads(base)}`,
  });
}

function libraryPage() {
  page({
    rel: "werkstatt/arbeitsbibliothek/wirkungsfelder/gesundheit-pflege/index.html",
    title: "Arbeitsbibliothek Gesundheit & Pflege | Wirkungsökonomie",
    description: "Arbeitsbibliothek zum Wirkungsfeld Gesundheit & Pflege mit Konzeptpapier, Gesamtdossier, Detailkonzepten, Einzeldossiers und Tool-Spezifikation.",
    section: "Werkstatt",
    type: "Arbeitsbibliothek",
    body: (base) => `<section class="hero portal-hero"><div class="hero-grid"><div><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "werkstatt/arbeitsbibliothek/")}">Arbeitsbibliothek</a></nav><p class="hero-kicker">Werkstatt · Wirkungsfeld</p><h1>Gesundheit & Pflege</h1><p class="hero-subtitle">Konzeptpapier, Gesamtdossier, Detailkonzepte, Einzeldossiers und Methodiken online lesen und herunterladen.</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="${href(base, "wirkungsfelder/gesundheit-pflege/")}">Wirkungsfeld öffnen</a></div></div><aside class="card"><p class="card-kicker">Arbeitsbibliothek</p><h2 class="card-title">Online-Volltext vor Download.</h2><p class="card-text">Die Werkstatt sammelt die öffentlichen Fassungen, ohne die Website zum Dateiablageort zu machen.</p></aside></div></section>${publicationAccess(base)}${moduleGrid(base)}${toolGrid(base)}${referenceBlock(base)}${bookBlock(base)}${downloads(base)}`,
  });
}

function updateSitemap() {
  const sitemap = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(sitemap)) return;
  const rels = [
    "wirkungsfelder/gesundheit/",
    "wirkungsfelder/gesundheit-pflege/",
    "wirkungsfelder/gesundheit-pflege/konzept/",
    "wirkungsfelder/gesundheit-pflege/dossier/",
    "wirkungsfelder/gesundheit-pflege/detailkonzepte/",
    "wirkungsfelder/gesundheit-pflege/dossiers/",
    "werkstatt/arbeitsbibliothek/wirkungsfelder/gesundheit-pflege/",
    ...tools.map(([slug]) => `wirkungsfelder/gesundheit-pflege/tools/${slug}/`),
  ];
  let xml = fs.readFileSync(sitemap, "utf8");
  for (const rel of rels) {
    xml = xml.replace(new RegExp(`\\s*<url>\\s*<loc>${SITE}/${rel}</loc>\\s*<lastmod>[^<]+</lastmod>\\s*</url>`, "g"), "");
  }
  const entries = rels.map((rel) => `  <url><loc>${SITE}/${rel}</loc><lastmod>${DATE}</lastmod></url>`).join("\n");
  fs.writeFileSync(sitemap, xml.replace("</urlset>", `${entries}\n</urlset>`), "utf8");
}

healthCentralPage();
portalPage();
for (const doc of documents) documentPage(doc);
for (const tool of tools) toolPage(tool);
libraryPage();
updateSitemap();

console.log("Gesundheit & Pflege portal generated.");
