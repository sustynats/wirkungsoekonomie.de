import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://wirkungsoekonomie.de";
const DATE = "2026-05-24";
const CSS_VERSION = "20260524-wissenschaft-digitalisierung";
const JS_VERSION = "20260523-nachhaltigkeit";
const SRC = "docs/wissenschaft-innovation-digitalisierung";
const SOURCE = `${SRC}/source`;
const ONLINE = `${SRC}/online-volltexte`;
const EXTRACT = `${SRC}/docx-extracts`;

const documents = [
  {
    key: "konzept",
    title: "Konzeptpapier Wissenschaft, Innovation & Digitalisierung",
    shortTitle: "Konzeptpapier",
    md: `${EXTRACT}/woek_wissenschaft_innovation_digitalisierung_konzeptpapier_v0_1.md`,
    downloads: ["woek_wissenschaft_innovation_digitalisierung_konzeptpapier_v0_1.docx"],
    description: "Grundkonzept für Wissenschaft, Open Science, Wirkungsinnovation, KI, Datenräume und digitale Souveränität.",
  },
  {
    key: "dossier",
    title: "Gesamtdossier Wissenschaft, Innovation & Digitalisierung",
    shortTitle: "Gesamtdossier",
    md: `${EXTRACT}/woek_wissenschaft_innovation_digitalisierung_gesamtdossier_v0_1.md`,
    downloads: ["woek_wissenschaft_innovation_digitalisierung_gesamtdossier_v0_1.docx"],
    description: "Dossier mit Systemlogik, Bewertungswegen, Quellen, politischen Optionen und Schutzgrenzen.",
  },
  {
    key: "detailkonzepte",
    title: "Detailkonzepte Wissenschaft, Innovation & Digitalisierung",
    shortTitle: "Detailkonzepte",
    md: `${EXTRACT}/woek_wissenschaft_innovation_digitalisierung_detailkonzepte_umfangreich_v0_2.md`,
    downloads: [
      "woek_wissenschaft_innovation_digitalisierung_detailkonzepte_umfangreich_v0_2.docx",
      "woek_wissenschaft_innovation_digitalisierung_detailkonzepte_umfangreich_v0_1.docx",
    ],
    description: "Umfangreiche Detailkonzepte für alle Unterbereiche des Wissenschafts-, Innovations- und Digitalisierungsportals.",
  },
  {
    key: "dossiers",
    title: "Einzeldossier-Set Wissenschaft, Innovation & Digitalisierung",
    shortTitle: "Einzeldossier-Set",
    md: `${EXTRACT}/woek_wissenschaft_innovation_digitalisierung_einzeldossier_set_v0_2.md`,
    downloads: [
      "woek_wissenschaft_innovation_digitalisierung_einzeldossier_set_v0_2.docx",
      "woek_wissenschaft_innovation_digitalisierung_einzeldossier_set_v0_1.docx",
    ],
    description: "Einzeldossiers mit Anwendungsfällen, Bewertungsmatrix, Datenquellen, Annahmen, Toolbezug und Grenzen.",
  },
  {
    key: "toolspezifikation",
    title: "Tool-Spezifikation Wissenschaft, Innovation & Digitalisierung",
    shortTitle: "Tool-Spezifikation",
    md: `${SOURCE}/tool_spezifikation_wissenschaft_innovation_digitalisierung_tool_suite.md`,
    downloads: ["tool_spezifikation_wissenschaft_innovation_digitalisierung_tool_suite.md"],
    description: "Spezifikation der Tool-Suite für Forschung, Open Science, KI, Datenräume, Innovation und digitale Souveränität.",
  },
];

const modules = [
  ["wissenschaft-als-wirkungsinfrastruktur", "Wissenschaft als Wirkungsinfrastruktur", "Wissenschaft erzeugt geprüfte Wirklichkeit, Unsicherheitsbewusstsein, Korrektur, Frühwarnung und langfristige Orientierung.", "Forschungs-Wirkungscheck"],
  ["open-science-replikation-integritaet", "Open Science, Replikation und Forschungsintegrität", "Open Science macht Forschung prüfbarer, gerechter und anschlussfähiger - mit Schutzgrenzen für Datenschutz, Sicherheit, geistige Rechte und Missbrauch.", "Open-Science- und Replikationscheck"],
  ["wirkungsorientierte-forschung-missionen", "Wirkungsorientierte Forschung und Missionen", "Missionen geben Richtung, ohne Lösungen vorzuschreiben: klare Ziele, offene Wege, Evaluation, Interdisziplinarität und Wissenschaftsfreiheit.", "Forschungs-Wirkungscheck"],
  ["innovation-systemlernen-transfer", "Innovation als Systemlernen und Transfer", "Wirkungsinnovation ist nicht bloß Neuheit, sondern Rekombination mit Richtung: mehr Netto-Wirkung, weniger Verlustleistung, mehr Resilienz.", "Innovations-Wirkungsportfolio"],
  ["ki-algorithmische-verantwortung", "KI und algorithmische Verantwortung", "KI ist Werkzeug, nicht Akteur. Sie braucht Transparenz, Auditierbarkeit, Fairness, menschliche Verantwortung und Schutz vor Manipulation.", "KI-Wirkungsrisiko-Check"],
  ["datenraeume-interoperabilitaet-wirkungsdaten", "Datenräume, Interoperabilität und Wirkungsdaten", "Wirkungsdatenräume machen Daten mehrfach nutzbar, prüfbar und rückkoppelbar - ohne Datenmacht zu zentralisieren.", "Datenraum-Reifegradcheck"],
  ["digitale-oeffentliche-infrastruktur-souveraenitaet", "Digitale öffentliche Infrastruktur und Souveränität", "Digitalisierung ist in Kernbereichen öffentliche Infrastruktur: sicher, barrierefrei, interoperabel und souverän.", "Digital-Souveränitätscheck"],
  ["cyberresilienz-kritische-wissensinfrastruktur", "Cyberresilienz und kritische Wissensinfrastruktur", "Wissenschaft, Datenräume, KI und digitale Verwaltung werden kritische Infrastruktur und brauchen Resilienz gegen Angriffe, Ausfälle und Manipulation.", "Digital-Souveränitätscheck"],
  ["forschungsfoerderung-wissensrat-politikberatung", "Forschungsförderung, Wissensrat und Politikberatung", "Wissenschaftliche Politikberatung unterstützt Entscheidungen, ersetzt sie aber nicht. Der Wissensrat sichert Integrität, Methode und offene Korrektur.", "Wissensrat-/Integritätsregister"],
  ["startups-deeptech-wirkungsinnovation", "Start-ups, Deep Tech und Wirkungsinnovation", "Start-ups und Deep-Tech-Unternehmen werden nach Wirkungspfad, Skalierungsrisiko und Systemnutzen bewertet, nicht nur nach Wachstum.", "Innovations-Wirkungsportfolio"],
  ["wissenschaftskommunikation-vertrauen", "Wissenschaftskommunikation und Vertrauensbildung", "Wissenschaftliche Unsicherheit ist kein Versagen. Sie muss verständlich kommuniziert werden, ohne Beliebigkeit oder Scheinsicherheit zu erzeugen.", "Wissensrat-/Integritätsregister"],
  ["digitale-teilhabe-kompetenz-bildung", "Digitale Teilhabe, Kompetenz und Bildung", "Digitale Mündigkeit verbindet Zugang, Kompetenz, Selbstbestimmung, KI-Verständnis und Wirkungskompetenz über alle Lebensphasen.", "Digital-Souveränitätscheck"],
];

const tools = [
  ["forschungs-wirkungscheck", "Forschungs-Wirkungscheck", "Check", "Bewertet Erkenntniswirkung, Systemwirkung, Freiheitswirkung, Integrität, Replikation und Wirkungspfad eines Forschungsvorhabens.", "Spezifikation online"],
  ["open-science-und-replikationscheck", "Open-Science- und Replikationscheck", "Check", "Prüft Datenoffenheit, Methodentransparenz, Replikationsfähigkeit, Schutzgrenzen und Interessenkonflikte.", "Spezifikation online"],
  ["ki-wirkungsrisiko-check", "KI-Wirkungsrisiko-Check", "Risikocheck", "Bewertet KI-Systeme nach Risiko, Fairness, Erklärbarkeit, Menschenaufsicht, Manipulationsgefahr und SDG+/Demokratiebezug.", "Spezifikation online"],
  ["datenraum-reifegradcheck", "Datenraum-Reifegradcheck", "Reifegradcheck", "Bewertet Interoperabilität, Datenqualität, Rollenrechte, Datenschutz, Audit-Trail und Rückkopplungspfad.", "Spezifikation online"],
  ["innovations-wirkungsportfolio", "Innovations-Wirkungsportfolio", "Portfolio", "Ordnet Innovationsprojekte nach Netto-Wirkung, Nebenwirkungen, Skalierbarkeit, Transformationspfad und Resilienzbeitrag.", "Spezifikation online"],
  ["wissensrat-integritaetsregister", "Wissensrat-/Integritätsregister", "Register", "Macht Interessenbindungen, Methodik, Replikationsstatus und Korrekturverfahren nachvollziehbar.", "Spezifikation online"],
  ["digital-souveraenitaetscheck", "Digital-Souveränitätscheck", "Check", "Prüft digitale Infrastruktur auf offene Standards, Exit-Optionen, Barrierefreiheit, Datenschutz und öffentliche Kontrolle.", "Spezifikation online"],
];

const sdgRefs = [
  ["sdg-4", "SDG 4 Hochwertige Bildung", "Bildung, Wissenschaftskompetenz, digitale Mündigkeit und lebenslanges Lernen bilden die Lernbasis dieses Wirkungsfelds.", "verstehen/sdgs-sdgplus/sdg-4-hochwertige-bildung/"],
  ["sdg-8", "SDG 8 Menschenwürdige Arbeit", "Innovation, KI und digitale Infrastruktur verändern Arbeit, Qualifizierung, Transformation und Teilhabe.", "verstehen/sdgs-sdgplus/sdg-8-menschenwuerdige-arbeit-wirtschaftswachstum/"],
  ["sdg-9", "SDG 9 Industrie, Innovation und Infrastruktur", "Forschung, Infrastruktur, Datenräume und Innovationssysteme sind der direkte SDG-Anschluss.", "verstehen/sdgs-sdgplus/sdg-9-industrie-innovation-infrastruktur/"],
  ["sdg-10", "SDG 10 Weniger Ungleichheiten", "Zugang zu Wissen, Daten, digitalen Räumen und Innovationschancen entscheidet über Teilhabe.", "verstehen/sdgs-sdgplus/sdg-10-weniger-ungleichheiten/"],
  ["sdg-11", "SDG 11 Nachhaltige Städte und Gemeinden", "Wissenschaft und Daten helfen Kommunen bei Resilienz, Infrastruktur, Gesundheit, Mobilität und Planung.", "verstehen/sdgs-sdgplus/sdg-11-nachhaltige-staedte-gemeinden/"],
  ["sdg-12", "SDG 12 Nachhaltiger Konsum und Produktion", "Produktdaten, Kreislaufwirtschaft, Wirkungsdatenräume und Innovation verändern Konsum- und Produktionsmuster.", "verstehen/sdgs-sdgplus/sdg-12-nachhaltiger-konsum-produktion/"],
  ["sdg-13", "SDG 13 Klimaschutz", "Klimaforschung, Frühwarnung, Anpassung, Emissionsdaten und Resilienzmodelle sind zentrale Wirkungspfade.", "verstehen/sdgs-sdgplus/sdg-13-klimaschutz/"],
  ["sdg-16", "SDG 16 Frieden, Gerechtigkeit und starke Institutionen", "Institutionelle Wahrheit, Datenschutz, KI-Aufsicht und Rechtsschutz sichern demokratische Korrektur.", "verstehen/sdgs-sdgplus/sdg-16-frieden-gerechtigkeit-starke-institutionen/"],
  ["sdg-17", "SDG 17 Partnerschaften", "Forschungskooperation, Datenräume, offene Standards und internationale Anschlussfähigkeit brauchen Partnerschaften.", "verstehen/sdgs-sdgplus/sdg-17-partnerschaften/"],
  ["sdgplus-demokratie", "SDG+ Demokratie", "Wissenschaft, Daten und KI sollen demokratische Korrekturfähigkeit stärken statt Manipulation zu skalieren.", "verstehen/sdgs-sdgplus/#sdgplus-demokratie"],
  ["sdgplus-digitale-selbstbestimmung", "SDG+ digitale Selbstbestimmung", "Datenrechte, digitale Souveränität, algorithmische Fairness und Exit-Optionen sind rote Linien.", "verstehen/sdgs-sdgplus/#sdgplus-digitale-selbstbestimmung"],
  ["sdgplus-medienqualitaet", "SDG+ Medienqualität", "Wissenschaftskommunikation, Quellenklarheit und Schutz vor Desinformation prägen öffentliche Wirklichkeit.", "verstehen/sdgs-sdgplus/#sdgplus-medienqualitaet"],
  ["sdgplus-institutionelles-vertrauen", "SDG+ institutionelles Vertrauen", "Vertrauen entsteht, wenn Wissenschaft, Daten und KI nachvollziehbar, korrigierbar und unabhängig bleiben.", "verstehen/sdgs-sdgplus/#sdgplus-institutionelles-vertrauen"],
];

const bookAnchors = [
  ["Kapitel 80 - Digitalisierung als Infrastruktur der Wirkungsökonomie", "referenz/kapitel-080-digitalisierung-als-infrastruktur-der-wirkungsoekonomie/"],
  ["Kapitel 81 - Wirkungsdatenräume", "referenz/kapitel-081-wirkungsdatenraeume/"],
  ["Kapitel 82 - Datenqualität, Register und Audit-Trails", "referenz/"],
  ["Kapitel 83 - KI, algorithmische Fairness und digitale Selbstbestimmung", "referenz/"],
  ["Kapitel 85 - Digitale Produktpässe und Wirkungsscanner", "referenz/"],
  ["Kapitel 86 - Wissenschaft als Wirkungsinfrastruktur", "referenz/kapitel-086-wissenschaft-als-wirkungsinfrastruktur/"],
  ["Kapitel 87 - Wirkungsorientierte Forschung und Innovation", "referenz/"],
  ["Kapitel 88 - Disziplinen im Wirkungswechsel", "referenz/"],
  ["Kapitel 89 - Wissenschaftliche Politikberatung und institutionelle Wahrheit", "referenz/"],
  ["Systemmodell - Spalte 9 Wissen, Innovation & Digitalisierung", "werkstatt/arbeitsbibliothek/architektur/"],
];

const sources = [
  ["AI Act", "EU-Rahmen für KI-Risiken.", "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai"],
  ["Data Act", "EU-Regelwerk für Datenzugang und Datennutzung.", "https://digital-strategy.ec.europa.eu/en/policies/data-act"],
  ["Digital Decade", "EU-Zielrahmen für digitale Kompetenzen, Infrastruktur, Unternehmen und öffentliche Dienste.", "https://digital-strategy.ec.europa.eu/en/policies/europes-digital-decade"],
  ["UNESCO Open Science", "Globaler Rahmen für offene Wissenschaft.", "https://www.unesco.org/en/open-science"],
  ["EU Open Science / EOSC", "Europäische Open-Science-Politik und European Open Science Cloud.", "https://research-and-innovation.ec.europa.eu/strategy/strategy-research-and-innovation/our-digital-future/open-science_en"],
  ["Horizon Europe", "EU-Forschungs- und Innovationsprogramm.", "https://commission.europa.eu/funding-tenders/find-funding/eu-funding-programmes/horizon-europe_en"],
  ["OECD Mission-Oriented Innovation", "Missionsorientierte Innovationspolitik für komplexe gesellschaftliche Herausforderungen.", "https://www.oecd.org/en/topics/sub-issues/mission-oriented-innovation.html"],
];

const related = [
  ["Bildung", "Wirkungsfeld", "Digitale Mündigkeit, Wissenschaftskompetenz, KI-Kompetenz und Bildung für nachhaltige Entwicklung.", "wirkungsfelder/bildung/"],
  ["Wirtschaft & Unternehmen", "Wirkungsfeld", "Forschung, KI, Datenräume und Innovation werden in Geschäftsmodellen, Risiko und Transformation relevant.", "wirkungsfelder/wirtschaft-unternehmen/"],
  ["Staat, Recht & Demokratie", "Wirkungsfeld", "Wissenschaftliche Politikberatung, Wirkungsrat, Rechtsschutz, KI-Aufsicht und Wirkungshaushalt.", "wirkungsfelder/staat-recht-demokratie/"],
  ["Medien & Öffentlichkeit", "Wirkungsfeld", "Wissenschaftskommunikation, Desinformation, Quellenklarheit und öffentliche Wahrheit.", "wirkungsfelder/medien-oeffentlichkeit/"],
  ["Produkte & Konsum", "Wirkungsfeld", "Digitale Produktpässe, Wirkungsdatenräume, Scorecards und Verbraucherinformation.", "wirkungsfelder/produkte-konsum/"],
  ["Impact Controlling", "Werkzeug", "WÖk-IDs, Scorecards, NWI und T-SROI übersetzen Daten in steuerungsfähige Wirkung.", "werkzeuge/impact-controlling/"],
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

function cite(id) {
  return `<a class="cite-anchor no-print" href="#${esc(id)}" aria-label="Zitierlink zu diesem Abschnitt">#</a>`;
}

function h2(id, text) {
  return `<h2 id="${esc(id)}">${esc(text)} ${cite(id)}</h2>`;
}

function safeLines(text) {
  const forbidden = /(CodeX|Codex|Repository|Build|Sitemap|Dateien anlegen|bitte prüfen|Toolaufruf|Prompt|ChatGPT|Python|interne Aufgabe|Abschlussbericht|Umsetzungsanweisung|öffentliche Lesefassung|Website-Unterseite|für die Website)/i;
  const instructionCuts = [
    "Die Online-Version braucht",
    "Die Werkzeugkarten müssen",
    "Der Unterbereich sollte",
    "Online-Volltext mit Inhaltsverzeichnis",
    "Primärer Toolbezug:",
    "Verwandte Werkzeuge:",
    "Verwandte Portale:",
  ];
  return String(text)
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => {
      let cleaned = line.trim();
      for (const cut of instructionCuts) {
        const index = cleaned.indexOf(cut);
        if (index >= 0) cleaned = cleaned.slice(0, index).trim();
      }
      return cleaned;
    })
    .filter((line) => line && !forbidden.test(line))
    .filter((line) => !/^\*\*Online lesen \/ Download/i.test(line))
    .filter((line) => !/^Online lesen \/ Download/i.test(line))
    .filter((line) => !/^Online- und Tool-Umsetzung$/i.test(line))
    .filter((line) => !/^Online-Version braucht/i.test(line))
    .filter((line) => !/^Der Unterbereich sollte/i.test(line))
    .filter((line) => !/^Online-Volltext mit Inhaltsverzeichnis/i.test(line));
}

function trimCover(text, markers = []) {
  const lines = safeLines(text);
  const index = lines.findIndex((line) => markers.some((marker) => line === marker || line.startsWith(marker)));
  return (index >= 0 ? lines.slice(index) : lines).join("\n\n");
}

function extractBlock(text, startMatchers, stopMatchers) {
  const lines = safeLines(text);
  const start = lines.findIndex((line) => startMatchers.some((match) => line === match || line.startsWith(match)));
  if (start < 0) return "";
  const stop = lines.findIndex((line, index) => index > start && stopMatchers.some((match) => line === match || line.startsWith(match)));
  return lines.slice(start, stop > start ? stop : undefined).join("\n\n");
}

function mdToHtml(markdown, prefix = "") {
  const rawLines = safeLines(markdown);
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

  const inline = (value) => {
    const source = String(value).replace(/\*\*/g, "");
    const parts = [];
    const pattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    let last = 0;
    let match;
    while ((match = pattern.exec(source))) {
      parts.push(esc(source.slice(last, match.index)));
      const label = esc(match[1]);
      const link = esc(match[2]);
      parts.push(`<a href="${link}">${label}</a>`);
      last = match.index + match[0].length;
    }
    parts.push(esc(source.slice(last)));
    return parts.join("");
  };
  const flushParagraph = () => {
    if (!paragraph.length) return;
    paraIndex += 1;
    const id = unique(`absatz-${String(paraIndex).padStart(3, "0")}`);
    html.push(`<p id="${id}">${inline(paragraph.join(" "))} ${cite(id)}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    html.push(`<ul>${list.map((item) => `<li>${inline(item)}</li>`).join("")}</ul>`);
    list = [];
  };
  const flushTable = () => {
    if (!table.length) return;
    const rows = table
      .map((line) => line.replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()))
      .filter((row) => !row.every((cell) => /^:?-{3,}:?$/.test(cell)));
    if (rows.length > 1) {
      const [head, ...body] = rows;
      html.push(`<div class="table-wrap" role="region" aria-label="Tabelle: ${esc(head.join(", "))}" tabindex="0"><table class="data-table"><thead><tr>${head.map((cell) => `<th>${inline(cell)}</th>`).join("")}</tr></thead><tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
    }
    table = [];
  };
  const heading = (level, text) => {
    flushParagraph(); flushList(); flushTable();
    const clean = text.replace(/\*\*/g, "");
    const id = unique(clean);
    toc.push({ level, text: clean, id });
    html.push(`<h${level} id="${id}">${esc(clean)} ${cite(id)}</h${level}>`);
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
    if (/^Dossier\s+\d+:\s+/.test(line)) {
      heading(2, line);
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const text = line.replace(/^\d+\.\s+/, "");
      const level = modules.some(([, title]) => text === title) ? 2 : 3;
      heading(level, text);
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      flushParagraph(); flushTable();
      list.push(line.replace(/^[-*]\s+/, ""));
      continue;
    }
    if (/^>\s+/.test(line)) {
      flushParagraph(); flushList(); flushTable();
      html.push(`<blockquote><p>${inline(line.replace(/^>\s+/, ""))}</p></blockquote>`);
      continue;
    }
    if (/^(Kurzfassung|Leitsatz|Leitfragen|Datenquellen|Beispielhafte Bewertungsmatrix|Beispielrechnung v0\.1|Politische und organisatorische Umsetzung|Tool- und Onlinebezug|Quellen und externe Referenzen)$/i.test(line)) {
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
  return `<nav class="toc-card no-print" aria-label="Inhaltsverzeichnis"><h2 class="card-title">Inhaltsverzeichnis</h2><ol>${items.map((item) => `<li class="toc-level-${esc(item.level)}"><a href="#${esc(item.id)}">${esc(item.text)}</a></li>`).join("")}</ol></nav>`;
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
    <link rel="stylesheet" href="${base}assets/css/style.css?v=20260604-menu-fix">
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
    <script src="${base}assets/js/main.js?v=20260605-wirkungsraum-stage2"></script>
  </body>
</html>`);
}

function cards(base, items) {
  return `<div class="card-grid three">${items.map(([title, kicker, text, url, extra = "Öffnen"]) => `<article class="card"><p class="card-kicker">${esc(kicker)}</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(text)}</p><div class="portal-card-actions">${url ? `<a class="text-link" href="${href(base, url)}">${esc(extra)}</a>` : `<span class="badge">in Vorbereitung</span>`}</div></article>`).join("")}</div>`;
}

function downloadLinks(base, doc) {
  return doc.downloads
    .filter((file) => exists(`assets/downloads/${file}`))
    .map((file) => `<a class="btn btn-secondary" href="${href(base, `assets/downloads/${file}`)}">${esc(file.endsWith(".md") ? `${doc.shortTitle} herunterladen` : `${doc.shortTitle} herunterladen`)}</a>`)
    .join("");
}

function downloads(base) {
  const links = documents.map((doc) => downloadLinks(base, doc)).join("");
  return `<section class="section" aria-labelledby="downloads"><div class="card"><p class="hero-kicker">Dossier & Export</p>${h2("downloads", "Downloads und Druck")}<p>Online-Volltext ist der Hauptzugang. Word- und Markdown-Dateien bleiben ergänzende Export- und Archivfassungen.</p><div class="portal-card-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button>${links}</div></div></section>`;
}

function publicationAccess(base) {
  const items = documents.map((doc) => [doc.shortTitle, "Online-Volltext", doc.description, doc.key === "toolspezifikation" ? "wirkungsfelder/wissenschaft-innovation-digitalisierung/tools/" : `wirkungsfelder/wissenschaft-innovation-digitalisierung/${doc.key}/`, "Online lesen"]);
  const tableRows = documents.map((doc) => `<tr><th scope="row">${esc(doc.shortTitle)}</th><td><a href="${href(base, doc.key === "toolspezifikation" ? "wirkungsfelder/wissenschaft-innovation-digitalisierung/tools/" : `wirkungsfelder/wissenschaft-innovation-digitalisierung/${doc.key}/`)}">online lesen</a></td><td>${doc.downloads.filter((file) => exists(`assets/downloads/${file}`)).map((file) => `<a href="${href(base, `assets/downloads/${file}`)}">${esc(file)}</a>`).join("<br>")}</td></tr>`).join("");
  return `<section class="section" id="publikationszugang" aria-labelledby="publikationszugang-title"><div class="section-header"><p class="hero-kicker">Publikationszugang</p>${h2("publikationszugang-title", "Online lesen und herunterladen")}<p>Alle zentralen Dokumente sind online lesbar und über Abschnittsanker zitierfähig. Downloads sind Export und Archiv, nicht der Hauptzugang.</p></div>${cards(base, items)}<div class="table-wrap no-print" role="region" aria-label="Publikationszugang: Online lesen und herunterladen" tabindex="0"><table class="data-table"><thead><tr><th>Dokument</th><th>Online lesen</th><th>Download</th></tr></thead><tbody>${tableRows}</tbody></table></div></section>`;
}

function sdgBadge(base, [id, label, text, url], index) {
  const popover = `sdg-popover-${id}-wissenschaft-${index}`;
  return `<span class="sdg-ref" data-sdg-id="${esc(id)}"><a class="sdg-ref-link" href="${href(base, url)}" aria-label="${esc(label)}: ${esc(text)}" aria-describedby="${esc(popover)}">${esc(label)}</a><button class="sdg-ref-info" type="button" aria-label="Kurzbeschreibung zu ${esc(label)}: ${esc(text)}" aria-describedby="${esc(popover)}">i</button><span class="sdg-ref-popover" id="${esc(popover)}" role="tooltip">${esc(text)} <span class="sdg-ref-more">Details öffnen</span></span></span>`;
}

function referenceBlock(base) {
  return `<section class="section" aria-labelledby="sdg-ref"><div class="portal-reference-block"><p class="hero-kicker">Referenzrahmen</p>${h2("sdg-ref", "SDG-/SDG+-Bezug")}<div class="model-strip">${sdgRefs.map((item, index) => sdgBadge(base, item, index)).join("")}</div><p>SDG+ ist keine offizielle UN-Kategorie, sondern eine transparente Erweiterung der Wirkungsökonomie für Demokratie, Medienqualität, institutionelles Vertrauen und digitale Selbstbestimmung.</p><a class="text-link" href="${href(base, "verstehen/sdgs-sdgplus/")}">Alle SDGs und SDG+ im Referenzrahmen ansehen</a></div></section>`;
}

function politicalBlock() {
  const rows = [
    ["Aufgabe der Politik", "Forschung, Innovation und Digitalisierung als freie, prüfbare, souveräne und demokratisch kontrollierbare Wirkungsinfrastruktur sichern."],
    ["Politische Rahmenbedingungen", "Open-Science-Regeln, Forschungsintegrität, KI- und Datenraumregulierung, digitale öffentliche Infrastruktur, Cyberresilienz und wirkungsorientierte Forschungsförderung."],
    ["Ausgestaltungsspielraum", "Parteien können Tempo, Institutionen, Förderprioritäten, Reallabore, Steueranreize, öffentlich-private Kooperationen und Schutzgrenzen unterschiedlich setzen."],
    ["Zielkonflikte", "Wissenschaftsfreiheit und Missionsorientierung, Offenheit und Schutz, Innovation und Missbrauchsrisiko, Geschwindigkeit und Prüfung, Souveränität und globale Kooperation."],
    ["Rollenverteilung", "EU, Bund, Länder, Hochschulen, Forschungsorganisationen, Unternehmen, Start-ups, Zivilgesellschaft, Kommunen und Bürger:innen tragen unterschiedliche Verantwortung."],
    ["Übergang und Schutz", "Pilotprogramme, Reallabore, Replikationsfonds, KI-Sandboxes, Datenschutz-by-Design, KMU-Entlastung und Schutz vor Wissenschaftsfeindlichkeit."],
    ["Evaluation und Korrektur", "Wissenschafts-Wirkungsberichte, Revisionszyklen, öffentliche Datenräume, Wirkungsindikatoren, unabhängige Assurance und offene Korrekturverfahren."],
    ["Schutz vor Technokratie", "Wissenschaft und Daten liefern geprüfte Wirklichkeit und Optionen. Politische Entscheidungen bleiben demokratisch legitimiert."],
  ];
  return `<section class="section" aria-labelledby="political-implementation"><div class="section-header"><p class="hero-kicker">Demokratische Umsetzung</p>${h2("political-implementation", "Politische Anschlussfähigkeit und Umsetzungsoptionen")}<p>Die folgenden Anforderungen beschreiben keinen fertigen Parteibeschluss. Sie markieren den Rahmen, damit Wissenschaft, Innovation und Digitalisierung demokratisch, rechtsstaatlich und praktisch umgesetzt werden können.</p></div><div class="table-wrap" role="region" aria-label="Politische Anschlussfähigkeit" tabindex="0"><table class="data-table"><tbody>${rows.map(([a, b]) => `<tr><th scope="row">${esc(a)}</th><td>${esc(b)}</td></tr>`).join("")}</tbody></table></div></section>`;
}

function toolGrid(base) {
  const items = tools.map(([slug, title, type, text, status]) => [title, `${type} · ${status}`, text, `werkzeuge/${slug}/`, "Toolseite öffnen"]);
  return `<section class="section" aria-labelledby="tools"><div class="section-header"><p class="hero-kicker">Kontext-Werkzeuge</p>${h2("tools", "Werkzeuge in diesem Bereich")}<p>Die Werkzeuge sind Modell- und Planungshilfen. Sie ersetzen keine Förderentscheidung, Rechtsberatung, Auditierung oder wissenschaftliche Begutachtung.</p></div>${cards(base, items)}</section>`;
}

function moduleGrid(base) {
  return `<section class="section" aria-labelledby="unterbereiche"><div class="section-header"><p class="hero-kicker">Unterbereiche</p>${h2("unterbereiche", "Zentrale Unterbereiche online lesen")}<p>Jeder Unterbereich besitzt eine eigene Online-Seite mit Detailkonzept, Dossier, Downloads, SDG-/SDG+-Block, Buchankern und Toolbezug.</p></div><div class="card-grid three">${modules.map(([slug, title, text]) => `<article class="card"><p class="card-kicker">Detailkonzept + Dossier</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(text)}</p><div class="portal-card-actions"><a class="text-link" href="${href(base, `wirkungsfelder/wissenschaft-innovation-digitalisierung/${slug}/`)}">Online lesen</a><a class="text-link" href="${href(base, `wirkungsfelder/wissenschaft-innovation-digitalisierung/detailkonzepte/#detail-${slugify(title)}`)}">Detailkonzept</a><a class="text-link" href="${href(base, `wirkungsfelder/wissenschaft-innovation-digitalisierung/dossiers/#dossier-${slugify(title)}`)}">Dossier</a></div></article>`).join("")}</div></section>`;
}

function bookBlock(base) {
  return `<section class="section" aria-labelledby="buch"><div class="section-header"><p class="hero-kicker">Online-Buch</p>${h2("buch", "Anker im Online-Buch")}</div><div class="model-strip">${bookAnchors.map(([label, url]) => `<a href="${href(base, url)}">${esc(label)}</a>`).join("")}</div></section>`;
}

function sourcesBlock() {
  return `<section class="section" aria-labelledby="quellen"><div class="card"><p class="hero-kicker">Quellen</p>${h2("quellen", "Quellen und Datenbezüge")}<p>Externe Referenzen dienen als belastbare Anschlussquellen. Externe Links öffnen in einem neuen Tab.</p><div class="card-grid three">${sources.map(([label, text, url]) => `<article class="card"><h3 class="card-title">${esc(label)}</h3><p class="card-text">${esc(text)}</p><a class="text-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Externe Quelle öffnen</a></article>`).join("")}</div></div></section>`;
}

function relatedBlock(base) {
  return `<section class="section" aria-labelledby="vernetzung"><div class="section-header"><p class="hero-kicker">Vernetzung</p>${h2("vernetzung", "Verwandte Wirkungsfelder und Werkzeuge")}</div>${cards(base, related)}</section>`;
}

function protectionBlock() {
  return `<section class="section" aria-labelledby="schutz"><div class="card"><p class="hero-kicker">Schutzgrenzen</p>${h2("schutz", "Wissenschaftsfreiheit, Datenschutz und digitale Selbstbestimmung")}<p>Bewertet werden Vorhaben, Systeme, Datenräume, Organisationen und politische Rahmenbedingungen, nicht Menschen. KI bleibt Werkzeug, Verantwortung bleibt menschlich und institutionell. Grundrechte, Datenschutz, Wissenschaftsfreiheit, offene Korrektur und demokratische Kontrolle sind rote Linien.</p></div></section>`;
}

function portalPage() {
  const md = read(`${SOURCE}/website_inhalt_wissenschaft_innovation_digitalisierung.md`);
  const usable = md
    .split("\n## Werkzeuge in diesem Bereich")[0]
    .replace(/\n## Inhaltsverzeichnis[\s\S]*?(?=\n## Zentrale Konzepte)/, "");
  const { toc: t, html } = mdToHtml(usable, "portal-");
  page({
    rel: "wirkungsfelder/wissenschaft-innovation-digitalisierung/index.html",
    title: "Wissenschaft, Innovation & Digitalisierung | Wirkungsökonomie",
    description: "Wissenschaft, Innovation, Datenräume, KI und Digitalisierung als Infrastruktur gesellschaftlicher Lernfähigkeit in der Wirkungsökonomie.",
    body: (base) => `<section class="hero portal-hero"><div class="hero-grid"><div><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "wirkungsfelder/")}">Wirkungsfelder</a></nav><p class="hero-kicker">Wirkungsfeld</p><h1>Wissenschaft, Innovation & Digitalisierung</h1><p class="hero-subtitle">Wissen, Innovation, Datenräume, KI und Digitalisierung als Infrastruktur gesellschaftlicher Lernfähigkeit.</p><p>Digitalisierung ist kein Selbstzweck. Sie ist in der Wirkungsökonomie die Infrastruktur, durch die Systeme wahrnehmen, lernen und demokratisch kontrollierbar bleiben.</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="#publikationszugang">Online lesen</a><a class="btn btn-secondary" href="#tools">Tools öffnen</a></div></div><aside class="card"><p class="card-kicker">Leitsatz</p><h2 class="card-title">Wissen wird zur Rückkopplungsinfrastruktur.</h2><p class="card-text">Wissenschaft hält Wirklichkeit prüfbar. Innovation übersetzt Erkenntnis in bessere Zustände. Digitalisierung macht Wirkung sichtbar, anschlussfähig und korrigierbar.</p></aside></div></section>${publicationAccess(base)}${toc(t)}<section class="section" aria-labelledby="portaltext"><div class="prose">${h2("portaltext", "Portaltext online lesen")}${html}</div></section>${moduleGrid(base)}${toolGrid(base)}${politicalBlock()}${referenceBlock(base)}${bookBlock(base)}${relatedBlock(base)}${protectionBlock()}${sourcesBlock()}${downloads(base)}`,
  });
}

function documentPage(doc) {
  const raw = read(doc.md);
  const markers = doc.key === "konzept" ? ["Kurzfassung"] : doc.key === "dossier" ? ["Kurzfassung", "1. Praxisfrage"] : doc.key === "detailkonzepte" ? ["1. Wissenschaft als Wirkungsinfrastruktur"] : doc.key === "dossiers" ? ["Dossier 1: Wissenschaft als Wirkungsinfrastruktur"] : ["# Tool-Spezifikation"];
  const prefix = doc.key === "detailkonzepte" ? "detail-" : doc.key === "dossiers" ? "dossier-" : `${doc.key}-`;
  const { toc: t, html } = mdToHtml(trimCover(raw, markers), prefix);
  const rel = doc.key === "toolspezifikation" ? "wirkungsfelder/wissenschaft-innovation-digitalisierung/tools/index.html" : `wirkungsfelder/wissenschaft-innovation-digitalisierung/${doc.key}/index.html`;
  page({
    rel,
    title: `${doc.title} | Wirkungsökonomie`,
    description: `${doc.title} online lesen: zitierfähige Volltextfassung mit Download, SDG-/SDG+-Bezug, Buchankern, Quellen und Druckfunktion.`,
    type: "Online-Volltext",
    body: (base) => `<section class="hero portal-hero"><div class="hero-grid"><div><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "wirkungsfelder/wissenschaft-innovation-digitalisierung/")}">Wissenschaft, Innovation & Digitalisierung</a></nav><p class="hero-kicker">Online-Volltext</p><h1>${esc(doc.title)}</h1><p class="hero-subtitle">${esc(doc.description)}</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="#volltext">Online lesen</a>${downloadLinks(base, doc)}</div></div><aside class="card"><p class="card-kicker">Zitierfähig</p><h2 class="card-title">Online lesen, gezielt zitieren</h2><p class="card-text">Diese Fassung ist vollständig online lesbar. Abschnittsanker können direkt zitiert werden; Dateien bleiben Export- und Archivfassungen.</p></aside></div></section>${toc(t)}<section class="section" id="volltext" aria-labelledby="volltext-title"><div class="prose">${h2("volltext-title", `${doc.shortTitle} online lesen`)}${html}</div></section>${doc.key === "toolspezifikation" ? "" : moduleGrid(base)}${toolGrid(base)}${politicalBlock()}${referenceBlock(base)}${bookBlock(base)}${relatedBlock(base)}${protectionBlock()}${sourcesBlock()}${downloads(base)}`,
  });
}

function modulePage([slug, title, summary, toolTitle], index) {
  const overview = read(`${ONLINE}/${slug}.md`);
  const detailRaw = read(`${EXTRACT}/woek_wissenschaft_innovation_digitalisierung_detailkonzepte_umfangreich_v0_2.md`);
  const dossierRaw = read(`${EXTRACT}/woek_wissenschaft_innovation_digitalisierung_einzeldossier_set_v0_2.md`);
  const next = modules[index + 1]?.[1];
  const detail = extractBlock(detailRaw, [`${index + 1}. ${title}`], next ? [`${index + 2}. ${next}`] : []);
  const dossier = extractBlock(dossierRaw, [`Dossier ${index + 1}: ${title}`], modules[index + 1] ? [`Dossier ${index + 2}: ${modules[index + 1][1]}`] : []);
  const { toc: t1, html: overviewHtml } = mdToHtml(overview, `${slug}-ueberblick-`);
  const { toc: t2, html: detailHtml } = mdToHtml(detail, `detail-${slug}-`);
  const { toc: t3, html: dossierHtml } = mdToHtml(dossier, `dossier-${slug}-`);
  const tool = tools.find(([, name]) => name === toolTitle) || tools[0];
  page({
    rel: `wirkungsfelder/wissenschaft-innovation-digitalisierung/${slug}/index.html`,
    title: `${title} | Wissenschaft, Innovation & Digitalisierung`,
    description: `${title} online lesen: Detailkonzept, Dossier, Toolbezug, politische Anschlussfähigkeit, SDG-/SDG+-Bezug und Downloads.`,
    type: "Detailkonzept und Dossier",
    body: (base) => `<section class="hero portal-hero"><div class="hero-grid"><div><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "wirkungsfelder/wissenschaft-innovation-digitalisierung/")}">Wissenschaft, Innovation & Digitalisierung</a></nav><p class="hero-kicker">Unterbereich · Online-Volltext</p><h1>${esc(title)}</h1><p class="hero-subtitle">${esc(summary)}</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="#detailkonzept">Detailkonzept lesen</a><a class="btn btn-secondary" href="#einzeldossier">Dossier lesen</a></div></div><aside class="card"><p class="card-kicker">Primäres Werkzeug</p><h2 class="card-title">${esc(toolTitle)}</h2><p class="card-text">${esc(tool[3])}</p><a class="text-link" href="${href(base, `werkzeuge/${tool[0]}/`)}">Toolseite öffnen</a></aside></div></section><nav class="toc-card no-print" aria-label="Inhaltsverzeichnis"><h2 class="card-title">Inhaltsverzeichnis</h2><ol>${[...t1, ...t2, ...t3].map((item) => `<li class="toc-level-${esc(item.level)}"><a href="#${esc(item.id)}">${esc(item.text)}</a></li>`).join("")}</ol></nav><section class="section" aria-labelledby="kurzfassung"><div class="prose">${h2("kurzfassung", "Kurzfassung online lesen")}${overviewHtml}</div></section><section class="section" id="detailkonzept" aria-labelledby="detailkonzept-title"><div class="prose">${h2("detailkonzept-title", "Detailkonzept online lesen")}${detailHtml}</div></section><section class="section" id="einzeldossier" aria-labelledby="einzeldossier-title"><div class="prose">${h2("einzeldossier-title", "Einzeldossier online lesen")}${dossierHtml}</div></section>${toolGrid(base)}${politicalBlock()}${referenceBlock(base)}${bookBlock(base)}${relatedBlock(base)}${protectionBlock()}${sourcesBlock()}${downloads(base)}`,
  });
}

function toolPage([slug, title, type, description, status]) {
  const spec = read(`${SOURCE}/tool_spezifikation_wissenschaft_innovation_digitalisierung_tool_suite.md`);
  const toolIndex = tools.findIndex(([s]) => s === slug);
  const next = tools[toolIndex + 1]?.[1];
  const section = extractBlock(spec, [`## ${title}`], next ? [`## ${next}`] : ["## Beispiel-Score"]) || spec;
  const { toc: t, html } = mdToHtml(section, `tool-${slug}-`);
  page({
    rel: `werkzeuge/${slug}/index.html`,
    title: `${title} | Wirkungsökonomie`,
    description: `${title}: Modellhafte Werkzeugseite für Wissenschaft, Innovation und Digitalisierung mit Spezifikation, Schutzgrenzen und Portalbezug.`,
    section: "Werkzeuge",
    type: "Werkzeug",
    body: (base) => `<section class="hero portal-hero"><div class="hero-grid"><div><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "werkzeuge/")}">Werkzeuge</a></nav><p class="hero-kicker">${esc(type)} · ${esc(status)}</p><h1>${esc(title)}</h1><p class="hero-subtitle">${esc(description)}</p><p>Modellhafte Demonstration. Keine Förderentscheidung, keine Rechtsberatung, keine Auditierung und keine wissenschaftliche Begutachtung.</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="#spezifikation">Spezifikation online lesen</a><a class="btn btn-secondary" href="${href(base, "wirkungsfelder/wissenschaft-innovation-digitalisierung/")}">Portal öffnen</a></div></div><aside class="card"><p class="card-kicker">Schutzgrenze</p><h2 class="card-title">Werkzeug unterstützt, entscheidet aber nicht.</h2><p class="card-text">Wirkungsdaten bereiten Entscheidungen vor. Verantwortung, Prioritäten und Zumutungen bleiben menschlich, institutionell und demokratisch legitimiert.</p></aside></div></section>${toc(t)}<section class="section" id="spezifikation" aria-labelledby="spezifikation-title"><div class="prose">${h2("spezifikation-title", "Tool-Spezifikation online lesen")}${html}</div></section>${toolGrid(base)}${politicalBlock()}${referenceBlock(base)}${bookBlock(base)}${relatedBlock(base)}${protectionBlock()}${sourcesBlock()}${downloads(base)}`,
  });
}

function libraryPage() {
  page({
    rel: "werkstatt/arbeitsbibliothek/wirkungsfelder/wissenschaft-innovation-digitalisierung/index.html",
    title: "Arbeitsbibliothek Wissenschaft, Innovation & Digitalisierung | Wirkungsökonomie",
    description: "Arbeitsbibliothek zum Wirkungsfeld Wissenschaft, Innovation & Digitalisierung mit Konzeptpapier, Gesamtdossier, Detailkonzepten, Einzeldossiers und Tool-Spezifikation.",
    section: "Werkstatt",
    type: "Arbeitsbibliothek",
    body: (base) => `<section class="hero portal-hero"><div class="hero-grid"><div><nav class="breadcrumb"><a href="${href(base, "index.html")}">Start</a> / <a href="${href(base, "werkstatt/arbeitsbibliothek/")}">Arbeitsbibliothek</a></nav><p class="hero-kicker">Werkstatt · Wirkungsfeld</p><h1>Wissenschaft, Innovation & Digitalisierung</h1><p class="hero-subtitle">Konzeptpapier, Gesamtdossier, Detailkonzepte, Einzeldossiers und Tool-Spezifikation online lesen und herunterladen.</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="${href(base, "wirkungsfelder/wissenschaft-innovation-digitalisierung/")}">Portal öffnen</a></div></div><aside class="card"><p class="card-kicker">Arbeitsbibliothek</p><h2 class="card-title">Online-Volltext vor Download.</h2><p class="card-text">Die Werkstatt sammelt die öffentlichen Fassungen, ohne die Website zum Dateiablageort zu machen.</p></aside></div></section>${publicationAccess(base)}${moduleGrid(base)}${toolGrid(base)}${referenceBlock(base)}${bookBlock(base)}${downloads(base)}`,
  });
}

function updateSitemap() {
  const sitemap = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(sitemap)) return;
  const rels = [
    "wirkungsfelder/wissenschaft-innovation-digitalisierung/",
    "wirkungsfelder/wissenschaft-innovation-digitalisierung/konzept/",
    "wirkungsfelder/wissenschaft-innovation-digitalisierung/dossier/",
    "wirkungsfelder/wissenschaft-innovation-digitalisierung/detailkonzepte/",
    "wirkungsfelder/wissenschaft-innovation-digitalisierung/dossiers/",
    "wirkungsfelder/wissenschaft-innovation-digitalisierung/tools/",
    "werkstatt/arbeitsbibliothek/wirkungsfelder/wissenschaft-innovation-digitalisierung/",
    ...modules.map(([slug]) => `wirkungsfelder/wissenschaft-innovation-digitalisierung/${slug}/`),
    ...tools.map(([slug]) => `werkzeuge/${slug}/`),
  ];
  let xml = fs.readFileSync(sitemap, "utf8");
  for (const rel of rels) {
    xml = xml.replace(new RegExp(`\\s*<url>\\s*<loc>${SITE}/${rel}</loc>\\s*<lastmod>[^<]+</lastmod>\\s*</url>`, "g"), "");
  }
  const entries = rels.map((rel) => `  <url><loc>${SITE}/${rel}</loc><lastmod>${DATE}</lastmod></url>`).join("\n");
  fs.writeFileSync(sitemap, xml.replace("</urlset>", `${entries}\n</urlset>`), "utf8");
}

portalPage();
for (const doc of documents) documentPage(doc);
modules.forEach(modulePage);
for (const tool of tools) toolPage(tool);
libraryPage();
updateSitemap();

console.log("Wissenschaft, Innovation & Digitalisierung portal generated.");
