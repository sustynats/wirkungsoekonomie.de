import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://wirkungsoekonomie.de";
const DATE = "2026-05-24";
const CSS_VERSION = "20260524-staat-recht";
const JS_VERSION = "20260523-nachhaltigkeit";
const SRC = "docs/staat-recht-demokratie/docx-extracts";

const bookAnchors = [
  ["Kapitel 36 - Wirkung als Rechtsprinzip", "referenz/kapitel-036-wirkung-als-rechtsprinzip/"],
  ["Kapitel 37 - Das Wirkungssteuergesetz WStG", "referenz/kapitel-037-das-wirkungssteuergesetz-wstg/"],
  ["Kapitel 38 - Das WUStG und die Produktwirkungssteuer", "referenz/kapitel-038-das-wustg-und-die-produktwirkungssteuer/"],
  ["Kapitel 39 - Wirkungshaushalt und öffentliche Mittel", "referenz/kapitel-039-wirkungshaushalt-und-oeffentliche-mittel/"],
  ["Kapitel 40 - Der Wirkungsrat", "referenz/kapitel-040-der-wirkungsrat/"],
  ["Kapitel 41 - Verwaltung, Rechtsschutz und Körperschaftslogik", "referenz/kapitel-041-verwaltung-rechtsschutz-und-koerperschaftslogik/"],
  ["Kapitel 61 - Politik als Wirkungsraum", "referenz/kapitel-061-politik-als-wirkungsraum/"],
  ["Kapitel 62 - Parteien und Programme", "referenz/kapitel-062-parteien-und-programme/"],
  ["Kapitel 63 - Lobbyismus und Machtkonzentration", "referenz/kapitel-063-lobbyismus-und-machtkonzentration/"],
  ["Kapitel 64 - Verwaltung und Bürgerbeteiligung", "referenz/kapitel-064-verwaltung-und-buergerbeteiligung/"],
  ["Kapitel 65 - Resilienzstaat", "referenz/kapitel-065-resilienzstaat/"],
  ["Kapitel 66 - Sicherheitsarchitektur", "referenz/kapitel-066-sicherheitsarchitektur/"],
];

const sdgs = [
  "SDG 8 Menschenwürdige Arbeit",
  "SDG 9 Industrie, Innovation und Infrastruktur",
  "SDG 10 Weniger Ungleichheiten",
  "SDG 12 Nachhaltige/r Konsum und Produktion",
  "SDG 13 Klimaschutz",
  "SDG 16 Frieden, Gerechtigkeit und starke Institutionen",
  "SDG 17 Partnerschaften",
];

const sdgPlus = [
  "SDG+ Demokratie",
  "SDG+ Rechtsstaatlichkeit",
  "SDG+ Medienqualität",
  "SDG+ Diskursfähigkeit",
  "SDG+ institutionelles Vertrauen",
  "SDG+ gesellschaftlicher Zusammenhalt",
  "SDG+ digitale Selbstbestimmung",
];

const dossiers = [
  {
    slug: "wirkung-als-rechtsprinzip",
    title: "Wirkung als Rechtsprinzip",
    subtitle: "Reale Zustandsveränderungen sichtbar, prüfbar, begründbar und korrigierbar machen.",
    md: "woek_einzeldossier_wirkung_als_rechtsprinzip_v0_1.md",
    docx: "woek_einzeldossier_wirkung_als_rechtsprinzip_v0_1.docx",
    tool: "werkzeuge/politische-wirkungspruefung/",
  },
  {
    slug: "wirkungssteuergesetz-wstg",
    title: "Wirkungssteuergesetz WStG",
    subtitle: "Rahmengesetz für Wirkung als steuerliche Bemessungs- und Steuerungslogik.",
    md: "woek_einzeldossier_wirkungssteuergesetz_wstg_v0_1.md",
    docx: "woek_einzeldossier_wirkungssteuergesetz_wstg_v0_1.docx",
    tool: "werkzeuge/wirkungssteuergesetz/",
  },
  {
    slug: "wirkungsumsatzsteuer-rechtsrahmen",
    title: "Wirkungsumsatzsteuer im Rechtsrahmen",
    subtitle: "Produktwirkungssteuer als rechtlich prüfbare Rückkopplungslogik.",
    md: "woek_einzeldossier_wirkungsumsatzsteuer_rechtsrahmen_v0_1.md",
    docx: "woek_einzeldossier_wirkungsumsatzsteuer_rechtsrahmen_v0_1.docx",
    tool: "werkzeuge/wirkungsumsatzsteuer/",
  },
  {
    slug: "wirkungseinkommensteuer-westg",
    title: "Wirkungseinkommensteuer WEstG",
    subtitle: "Einkommen im Entstehungs- und Wirkungszusammenhang betrachten, ohne Personen zu bewerten.",
    md: "woek_einzeldossier_wirkungseinkommensteuer_westg_v0_1.md",
    docx: "woek_einzeldossier_wirkungseinkommensteuer_westg_v0_1.docx",
    tool: "werkzeuge/wirkungseinkommensteuer/",
  },
  {
    slug: "wirkungshaushalt",
    title: "Wirkungshaushalt",
    subtitle: "Öffentliche Mittel nach Zustandsveränderung, Prävention und Resilienz steuern.",
    md: "woek_einzeldossier_wirkungshaushalt_v0_1.md",
    docx: "woek_einzeldossier_wirkungshaushalt_v0_1.docx",
    tool: "werkzeuge/wirkungshaushalt/",
  },
  {
    slug: "wirkungsrat",
    title: "Wirkungsrat",
    subtitle: "Wächterinstitution für WÖk-IDs, Benchmarks, Evaluation und Missbrauchsschutz.",
    md: "woek_einzeldossier_wirkungsrat_v0_1.md",
    docx: "woek_einzeldossier_wirkungsrat_v0_1.docx",
    tool: "werkzeuge/wirkungsrat/",
  },
  {
    slug: "verwaltung-rechtsschutz-korrektur",
    title: "Verwaltung, Rechtsschutz und Korrekturverfahren",
    subtitle: "Begründung, Einspruch, gerichtliche Kontrolle und lernende Verwaltung.",
    md: "woek_einzeldossier_verwaltung_rechtsschutz_korrektur_v0_1.md",
    docx: "woek_einzeldossier_verwaltung_rechtsschutz_korrektur_v0_1.docx",
    tool: "werkzeuge/politische-wirkungspruefung/",
  },
  {
    slug: "politische-wirkungspruefung",
    title: "Politische Wirkungsprüfung",
    subtitle: "Programme, Gesetze und Haushalte als Wirkungspotenziale prüfen.",
    md: "woek_einzeldossier_politische_wirkungspruefung_v0_1.md",
    docx: "woek_einzeldossier_politische_wirkungspruefung_v0_1.docx",
    tool: "werkzeuge/politische-wirkungspruefung/",
  },
  {
    slug: "lobbyismus-machtkonzentration",
    title: "Lobbyismus, Machtkonzentration und Schutz der Wirkungslogik",
    subtitle: "Schutz vor Vereinnahmung, Datenmanipulation, Greenwashing und Machtasymmetrien.",
    md: "woek_einzeldossier_lobbyismus_machtkonzentration_v0_1.md",
    docx: "woek_einzeldossier_lobbyismus_machtkonzentration_v0_1.docx",
    tool: "werkzeuge/wirkungsrat/",
  },
  {
    slug: "buergerbeteiligung-wirkungsdemokratie",
    title: "Bürgerbeteiligung und Wirkungsdemokratie",
    subtitle: "Beteiligung, Bürger:innenfeedback, Konsultation und demokratische Korrektur.",
    md: "woek_einzeldossier_buergerbeteiligung_wirkungsdemokratie_v0_1.md",
    docx: "woek_einzeldossier_buergerbeteiligung_wirkungsdemokratie_v0_1.docx",
    tool: "werkzeuge/politische-wirkungspruefung/",
  },
];

const go11DetailConcepts = [
  {
    number: 24,
    slug: "wirkung-als-rechtsprinzip-wstg",
    title: "Wirkung als Rechtsprinzip und das Wirkungssteuergesetz als Rahmengesetz",
    subtitle: "Wie Wirkung in Recht, Steuerlogik und demokratische Entscheidungsarchitektur übersetzt werden kann.",
    source: "docs/staat-recht-demokratie/go11-detailkonzepte/online_volltext_24_24_woek_staat_recht_demokratie_wirkung_als_rechtsprinzip_wstg_detailkonzept_v1_0.md",
    docx: "assets/downloads/24_woek_staat_recht_demokratie_wirkung_als_rechtsprinzip_wstg_detailkonzept_v1_0.docx",
    pdf: "assets/downloads/24_woek_staat_recht_demokratie_wirkung_als_rechtsprinzip_wstg_detailkonzept_v1_0.pdf",
    relatedTools: ["LawReader / WStG-Navigator", "WÖk-ID-Browser", "Scorecard-Register"],
    relatedPages: ["werkstatt/gesetze/wirkungssteuergesetz/", "werkzeuge/woek-ids/", "werkzeuge/scorecards/"],
  },
  {
    number: 25,
    slug: "wirkungshaushalt",
    title: "Wirkungshaushalt und Wirkungsfolgenabschätzung",
    subtitle: "Wie öffentliche Mittel, Gesetze und Programme nach positiver Netto-Wirkung geplant, geprüft und korrigiert werden können.",
    source: "docs/staat-recht-demokratie/go11-detailkonzepte/online_volltext_25_25_woek_staat_recht_demokratie_wirkungshaushalt_wirkungsfolgenabschaetzung_detailkonzept_v1_0.md",
    docx: "assets/downloads/25_woek_staat_recht_demokratie_wirkungshaushalt_wirkungsfolgenabschaetzung_detailkonzept_v1_0.docx",
    pdf: "assets/downloads/25_woek_staat_recht_demokratie_wirkungshaushalt_wirkungsfolgenabschaetzung_detailkonzept_v1_0.pdf",
    relatedTools: ["Wirkungsfolgenabschätzungs-Check", "Wirkungshaushalt-Demo", "T-SROI-Modul"],
    relatedPages: ["werkzeuge/politische-wirkungspruefung/", "werkzeuge/wirkungshaushalt/", "werkzeuge/t-sroi/"],
  },
  {
    number: 26,
    slug: "wirkungsrat-governance",
    title: "Wirkungsrat, Governance, Rechtsschutz und demokratische Kontrolle",
    subtitle: "Institutionelle Sicherung der Wirkungsökonomie gegen Lobbyismus, Greenwashing, Technokratie und Messmissbrauch.",
    source: "docs/staat-recht-demokratie/go11-detailkonzepte/online_volltext_26_26_woek_staat_recht_demokratie_wirkungsrat_governance_rechtsschutz_detailkonzept_v1_0.md",
    docx: "assets/downloads/26_woek_staat_recht_demokratie_wirkungsrat_governance_rechtsschutz_detailkonzept_v1_0.docx",
    pdf: "assets/downloads/26_woek_staat_recht_demokratie_wirkungsrat_governance_rechtsschutz_detailkonzept_v1_0.pdf",
    relatedTools: ["Wirkungsrat-Schema", "Scorecard-Register", "WÖk-ID-Browser"],
    relatedPages: ["werkzeuge/wirkungsrat/", "werkzeuge/scorecards/", "werkzeuge/woek-ids/"],
  },
];

const go12DetailConcepts = [
  {
    number: 27,
    cluster: "Go 12",
    slug: "staat-als-wirkungsarchitektur-resilienzstaat",
    title: "Staat als Wirkungsarchitektur und Resilienzstaat",
    subtitle: "Vom Reparaturstaat zur lernenden öffentlichen Rückkopplungsarchitektur für Mensch, Planet und Demokratie.",
    source: "docs/staat-recht-demokratie/go12-detailkonzepte/online_volltext_27_27_woek_staat_recht_demokratie_staat_als_wirkungsarchitektur_resilienzstaat_detailkonzept_v1_0.md",
    docx: "assets/downloads/27_woek_staat_recht_demokratie_staat_als_wirkungsarchitektur_resilienzstaat_detailkonzept_v1_0.docx",
    pdf: "assets/downloads/27_woek_staat_recht_demokratie_staat_als_wirkungsarchitektur_resilienzstaat_detailkonzept_v1_0.pdf",
    relatedTools: ["Resilienzstaat-Check", "Wirkungsfolgenabschätzungs-Check", "Wirkungshaushalt-Demo"],
    relatedPages: ["wirkungsfelder/staat-recht-demokratie/wirkung-als-rechtsprinzip-wstg/", "wirkungsfelder/staat-recht-demokratie/wirkungshaushalt/", "wirkungsfelder/staat-recht-demokratie/wirkungsrat-governance/"],
  },
  {
    number: 28,
    cluster: "Go 12",
    slug: "grundrechte-verhaeltnismaessigkeit-technokratieschutz",
    title: "Grundrechte, Verhältnismäßigkeit und Schutz vor Technokratie",
    subtitle: "Wie eine wirkungsbasierte Ordnung Freiheit, Rechtsschutz, Datenschutz und demokratische Entscheidung schützt.",
    source: "docs/staat-recht-demokratie/go12-detailkonzepte/online_volltext_28_28_woek_staat_recht_demokratie_grundrechte_verhaeltnismaessigkeit_technokratieschutz_detailkonzept_v1_0.md",
    docx: "assets/downloads/28_woek_staat_recht_demokratie_grundrechte_verhaeltnismaessigkeit_technokratieschutz_detailkonzept_v1_0.docx",
    pdf: "assets/downloads/28_woek_staat_recht_demokratie_grundrechte_verhaeltnismaessigkeit_technokratieschutz_detailkonzept_v1_0.pdf",
    relatedTools: ["Verhältnismäßigkeitsmatrix", "Technokratieschutz-Check", "LawReader / WStG-Navigator"],
    relatedPages: ["wirkungsfelder/staat-recht-demokratie/wirkung-als-rechtsprinzip-wstg/", "wirkungsfelder/staat-recht-demokratie/wirkungshaushalt/", "wirkungsfelder/staat-recht-demokratie/wirkungsrat-governance/"],
  },
  {
    number: 29,
    cluster: "Go 12",
    slug: "demokratie-rechtsstaat-sdgplus-wirkungsraum",
    title: "Demokratie, Rechtsstaat und SDG+ als Wirkungsraum",
    subtitle: "Warum demokratische Stabilität, Rechtsstaatlichkeit und SDG+ zentrale Wirkungsbedingungen sind.",
    source: "docs/staat-recht-demokratie/go12-detailkonzepte/online_volltext_29_29_woek_staat_recht_demokratie_demokratie_rechtsstaat_sdgplus_wirkungsraum_detailkonzept_v1_0.md",
    docx: "assets/downloads/29_woek_staat_recht_demokratie_demokratie_rechtsstaat_sdgplus_wirkungsraum_detailkonzept_v1_0.docx",
    pdf: "assets/downloads/29_woek_staat_recht_demokratie_demokratie_rechtsstaat_sdgplus_wirkungsraum_detailkonzept_v1_0.pdf",
    relatedTools: ["Demokratie-Wirkungscheck", "SDG+-Referenzcheck", "Wirkungsrat-Schema"],
    relatedPages: ["wirkungsfelder/staat-recht-demokratie/wirkung-als-rechtsprinzip-wstg/", "wirkungsfelder/staat-recht-demokratie/wirkungshaushalt/", "wirkungsfelder/staat-recht-demokratie/wirkungsrat-governance/"],
  },
];

const stateDetailConcepts = [...go11DetailConcepts.map((concept) => ({ ...concept, cluster: "Go 11" })), ...go12DetailConcepts];

const stateToolCards = [
  ["LawReader / WStG-Navigator", "Online vorhanden", "werkstatt/gesetze/wirkungssteuergesetz/", "Gesetzestext, Paragrafenanker, Begründung und Verweise lesbar machen."],
  ["Wirkungsfolgenabschätzungs-Check", "Demo in Vorbereitung", "werkzeuge/politische-wirkungspruefung/", "Gesetze, Programme und Haushalte vorab auf Wirkungsprofil, Nebenwirkungen und Korrekturbedarf prüfen."],
  ["Wirkungshaushalt-Demo", "Demo in Vorbereitung", "werkzeuge/wirkungshaushalt/", "Öffentliche Mittel nach Zielrahmen, WÖk-ID-Bezug, Wirkungspfad und Evaluation strukturieren."],
  ["Wirkungsrat-Schema", "Konzeptseite vorhanden", "werkzeuge/wirkungsrat/", "Governance, Indikatorenpflege, Konsultation, Rechtsschutz und Missbrauchsschutz zusammenführen."],
  ["WÖk-ID-Browser", "Methodenseite vorhanden", "werkzeuge/woek-ids/", "Indikatoren, Quellen, Versionen und Datenqualität als nachvollziehbare Wirkungsadressen ordnen."],
  ["Scorecard-Register", "Methodenseite vorhanden", "werkzeuge/scorecards/", "Bewertungsraster, Benchmarks und Nichtkompensation für Recht, Haushalt und Regulierung sichtbar machen."],
  ["T-SROI-Modul", "Methodenseite vorhanden", "werkzeuge/t-sroi/", "Prävention, Transformationswirkung und öffentliche Investitionswirkung modellhaft bewerten."],
  ["Resilienzstaat-Check", "Demo in Vorbereitung", "werkzeuge/politische-wirkungspruefung/", "Kritische öffentliche Wirkungsfunktionen, Verwundbarkeit und Vorsorgepfade sichtbar machen."],
  ["Verhältnismäßigkeitsmatrix", "Demo in Vorbereitung", "werkzeuge/politische-wirkungspruefung/", "Eingriff, Zweck, Datenqualität, Alternativen, Rechtsschutz und Zumutbarkeit strukturiert prüfen."],
  ["Technokratieschutz-Check", "Demo in Vorbereitung", "werkzeuge/wirkungsrat/", "Sicherstellen, dass Wirkungsdaten Entscheidungen vorbereiten, aber Demokratie und Gerichte nicht ersetzen."],
  ["Demokratie-Wirkungscheck", "Demo in Vorbereitung", "wirkungsfelder/medien-oeffentlichkeit/", "Demokratische Stabilität, Diskursfähigkeit, Institutionenvertrauen und Schutz vor Manipulation betrachten."],
  ["SDG+-Referenzcheck", "Referenzseite vorhanden", "verstehen/sdgs-sdgplus/", "SDG+ als WÖk-Erweiterung mit Demokratie, Rechtsstaatlichkeit und digitaler Selbstbestimmung einordnen."],
];

const tools = [
  ["Wirkungssteuergesetz WStG", "Gesetz / Rahmeninstrument", "Wirkung als steuerliche Bemessungs- und Steuerungslogik.", "werkzeuge/wirkungssteuergesetz/", "werkstatt/gesetze/wirkungssteuergesetz/"],
  ["Wirkungsumsatzsteuer", "Steuerlogik", "Produktwirkung wird rechtlich prüfbar in Steuerklassen übersetzt.", "werkzeuge/wirkungsumsatzsteuer/", "werkstatt/leitlinien/wustg/"],
  ["Wirkungseinkommensteuer WEstG", "Konzept / Steuerlogik", "Einkommen wird im Entstehungs- und Wirkungskontext betrachtet.", "werkzeuge/wirkungseinkommensteuer/", "werkstatt/dossiers/staat-recht-demokratie/wirkungseinkommensteuer-westg/"],
  ["Wirkungshaushalt", "Haushaltslogik", "Öffentliche Mittel werden an Zustandsveränderung, Prävention und Resilienz rückgekoppelt.", "werkzeuge/wirkungshaushalt/", "werkstatt/dossiers/staat-recht-demokratie/wirkungshaushalt/"],
  ["Wirkungsrat", "Institution", "Unabhängige Evaluation, Indikatorenpflege, Benchmarks und Missbrauchsschutz.", "werkzeuge/wirkungsrat/", "werkstatt/dossiers/staat-recht-demokratie/wirkungsrat/"],
  ["Politische Wirkungsprüfung", "Prüfwerkzeug", "Programme, Gesetze und Haushalte werden auf Wirkungsprofil, Zielkonflikte und Korrekturbedarf geprüft.", "werkzeuge/politische-wirkungspruefung/", "werkstatt/dossiers/staat-recht-demokratie/politische-wirkungspruefung/"],
  ["WÖk-IDs", "Datenarchitektur", "Indikatoren mit Quelle, Einheit, Schwelle, Version und Prüfstatus.", "werkzeuge/woek-ids/", "werkzeuge/impact-controlling/dossiers/woek-ids/"],
  ["Scorecards, NWI und T-SROI", "Methodik", "Bewertung und Rückkopplung von Wirkung für Politik, Haushalt und Regulierung.", "werkzeuge/impact-controlling/", "werkzeuge/impact-controlling/dossier/"],
];

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

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
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
    .replace(/^-+|-+$/g, "");
}

function citeAnchor(id) {
  return `<a class="cite-anchor no-print" href="#${id}" aria-label="Zitierlink zu diesem Abschnitt">#</a>`;
}

function sectionTitle(id, text) {
  return `<h2 id="${id}">${escapeHtml(text)} ${citeAnchor(id)}</h2>`;
}

function fileExists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function sanitizePublicMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const cleaned = [];
  let skipSection = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (/^##\s+Website- und Portalintegration\b/i.test(line)) {
      skipSection = true;
      continue;
    }
    if (skipSection && /^##\s+/.test(line)) skipSection = false;
    if (skipSection) continue;
    if (/^\-\s*Statushinweise:/i.test(line)) continue;
    cleaned.push(raw.replace("Konzeptionelle Arbeitsfassung; ", ""));
  }
  return cleaned.join("\n");
}

function page({ rel, title, description, searchSection = "Wirkungsfelder", searchType = "Portal", body }) {
  const route = routeFor(rel);
  const base = baseFor(rel);
  const canonical = `${SITE}${route}`;
  const out = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="search_title" content="${escapeHtml(title.replace(/\s+\|.*$/, ""))}">
    <meta name="search_description" content="${escapeHtml(description)}">
    <meta name="search_section" content="${escapeHtml(searchSection)}">
    <meta name="search_type" content="${escapeHtml(searchType)}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="${escapeHtml(title.replace(/\s+\|.*$/, ""))}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${SITE}/assets/img/generated/hero-systemgrafik-wirkungsoekonomie.png">
    <link rel="icon" href="${base}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=20260605-wirkungsraum-stage8">
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="${base}index.html" aria-label="Wirkungsökonomie Startseite"><span class="brand-mark"><img src="${base}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span><span class="brand-name">Wirkungsökonomie</span></a>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav"><span class="nav-toggle-icon" aria-hidden="true">☰</span><span class="sr-only">Menü</span></button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation">
        <a href="${base}index.html" data-nav-match="index.html">Start</a>
        <a href="${base}verstehen.html" data-nav-match="verstehen.html|wirkungsoekonomie.html|wirkungsoekonomie/|verstehen/">Verstehen</a>
        <a href="${base}wirkungsfelder/" data-nav-match="wirkungsfelder/|anwendungen.html|fuer/">Wirkungsfelder</a>
        <a href="${base}werkzeuge/" data-nav-match="werkzeuge/|scorecard-dashboard.html|methodik/|workflow.html">Werkzeuge</a>
        <a href="${base}erleben.html" data-nav-match="erleben.html|erleben/|scanner.html|scorecard-dashboard.html">Erleben</a>
        <a href="${base}werkstatt/" data-nav-match="werkstatt/|downloads.html|dokumente/|referenz/|buch.html|evidenz/|quellen/">Werkstatt</a>
        <a href="${base}akademie.html" data-nav-match="akademie.html|akademie/">Akademie</a>
        <a href="${base}blog.html" data-nav-match="blog.html|blog/|wirkung-werte-journal/">Journal</a>
        <a href="${base}suche.html" data-nav-match="suche.html">Suche</a>
      </nav>
    </header>
    <main>
      <p class="print-meta">Wirkungsökonomie · ${escapeHtml(title.replace(/\s+\|.*$/, ""))} · ${canonical} · Druckdatum: 24.05.2026</p>
${body(base, route)}
    </main>
    <script src="${base}assets/js/main.js?v=20260605-wirkungsraum-stage8"></script>
  </body>
</html>
`, "utf8");
}

function printActions(extra = "") {
  return `<div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button>${extra}</div>`;
}

function hero(base, { kicker, title, subtitle, text, action = "" }) {
  return `<section class="hero portal-hero"><div class="hero-content">
      <nav class="breadcrumb"><a href="${base}index.html">Start</a> / <a href="${base}wirkungsfelder/">Wirkungsfelder</a></nav>
      <p class="hero-kicker">${escapeHtml(kicker)}</p>
      <h1>${escapeHtml(title)}</h1>
      <p class="hero-subtitle">${escapeHtml(subtitle)}</p>
      <p>${escapeHtml(text)}</p>
      ${printActions(action)}
    </div></section>`;
}

function citationNotice(route) {
  return `<aside class="citation-note" role="note"><p class="card-kicker">Zitierfähig</p><h2>Online lesen, gezielt zitieren</h2><p>Online-Volltext ist der Hauptzugang. Abschnittsanker können direkt zitiert werden; Downloads bleiben ergänzende Export- und Archivfassungen.</p><p><a class="text-link" href="${route}">Kanonische Seitenadresse öffnen</a></p></aside>`;
}

function statusMeta(status) {
  return "";
}

function mdToHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  const toc = [];
  let p = [];
  let list = [];
  let table = [];
  let tableHeader = null;
  const flush = () => {
    if (!p.length) return;
    const text = p.join(" ");
    const id = `absatz-${String(html.length + 1).padStart(3, "0")}`;
    html.push(`<p id="${id}">${inlineMarkdown(text)} ${citeAnchor(id)}</p>`);
    p = [];
  };
  const flushList = () => {
    if (!list.length) return;
    html.push(`<ul>${list.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</ul>`);
    list = [];
  };
  const flushTable = () => {
    if (!tableHeader) return;
    html.push(`<div class="table-wrap"><table class="data-table"><thead><tr>${tableHeader.map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join("")}</tr></thead><tbody>${table.map((row) => `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
    tableHeader = null;
    table = [];
  };
  const splitTableRow = (line) => line.replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flush();
      flushList();
      flushTable();
      continue;
    }
    const h = line.match(/^(#{1,4})\s+(.+)$/);
    if (h) {
      flush();
      flushList();
      flushTable();
      const level = Math.min(4, Math.max(2, h[1].length));
      const text = h[2].trim();
      const id = slugify(text);
      toc.push({ level, text, id });
      html.push(`<h${level} id="${id}">${inlineMarkdown(text)} ${citeAnchor(id)}</h${level}>`);
      continue;
    }
    if (/^\|.+\|$/.test(line)) {
      flush();
      flushList();
      const cells = splitTableRow(line);
      if (cells.every((cell) => /^:?-{3,}:?$/.test(cell))) continue;
      if (!tableHeader) tableHeader = cells;
      else table.push(cells);
      continue;
    }
    if (/^\d+\.\s+/.test(line) || /^[-*]\s+/.test(line)) {
      flush();
      flushTable();
      list.push(line.replace(/^(\d+\.\s+|[-*]\s+)/, ""));
      continue;
    }
    flushList();
    flushTable();
    p.push(line);
  }
  flush();
  flushList();
  flushTable();
  return { html: html.join("\n"), toc };
}

function tocBlock(toc) {
  return `<nav class="toc-card" aria-label="Inhaltsverzeichnis"><h2>Inhaltsverzeichnis</h2><ol>${toc.slice(0, 18).map((item) => `<li class="toc-level-${item.level}"><a href="#${item.id}">${escapeHtml(item.text)}</a></li>`).join("")}</ol></nav>`;
}

function cardGrid(base, items) {
  return `<div class="card-grid three">${items.map((item) => `<article class="card">${item.kicker ? `<p class="card-kicker">${escapeHtml(item.kicker)}</p>` : ""}<h3 class="card-title">${escapeHtml(item.title)}</h3><p class="card-text">${escapeHtml(item.text)}</p>${item.href ? `<div class="portal-card-actions"><a class="text-link" href="${href(base, item.href)}">${escapeHtml(item.label || "Online lesen")}</a></div>` : ""}</article>`).join("")}</div>`;
}

function dataTable(headers, rows) {
  return `<div class="table-wrap"><table class="data-table"><thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function politicalBlock(base) {
  return `<section class="section" aria-labelledby="political-implementation"><div class="card">
    <p class="hero-kicker">Umsetzung</p>
    ${sectionTitle("political-implementation", "Politische Anschlussfähigkeit und Umsetzungsoptionen")}
    <p>Die folgenden politischen Anforderungen beschreiben keinen fertigen Parteibeschluss. Sie markieren den notwendigen Rahmen, damit dieses Wirkungsfeld demokratisch, rechtsstaatlich und praktisch umgesetzt werden kann. Unterschiedliche Parteien können innerhalb dieses Rahmens verschiedene Wege wählen. Entscheidend ist, dass die Wirkung sichtbar, überprüfbar und korrigierbar bleibt.</p>
    ${dataTable(["Ebene", "Umsetzungsoption"], [
      ["Aufgabe der Politik", "Wirkung als rechtlich relevante Rückkopplung definieren, ohne demokratische Entscheidung durch Scores zu ersetzen."],
      ["Rahmenbedingungen", "WStG, WUStG, WEstG, Wirkungshaushalt, Wirkungsrat, Datenregister, Rechtsschutz und Evaluation rechtsstaatlich ausgestalten."],
      ["Ausgestaltungsspielraum", "Pilotregion, Bundesgesetz, EU-Initiative, Bonus-only, Bonus-Malus, haushaltsneutral, stufenweise oder branchenbezogen."],
      ["Zielkonflikte", "Freiheit, soziale Gerechtigkeit, Bürokratiearmut, Datenschutz, Innovationsfähigkeit, Kaufkraftschutz und Kontrollierbarkeit müssen politisch abgewogen werden."],
      ["Rollenverteilung", "EU, Bund, Länder, Kommunen, Verwaltung, Wirtschaft, Wissenschaft und Zivilgesellschaft teilen Gesetzgebung, Umsetzung, Prüfung und Beteiligung."],
      ["Übergang und Schutz", "Soziale Abfederung, KMU-Schutz, Rechtsschutz, Datenschutz, Kaufkraftschutz, Beteiligung und klare Einspruchswege sind Pflicht."],
      ["Evaluation und Korrektur", "Wirkungsberichte, öffentliche Konsultation, Revisionszyklen und gerichtliche Kontrolle halten die Ordnung lernfähig."],
      ["Parteipolitische Anschlussfähigkeit", "Unterschiedliche politische Lager können verschiedene Wege wählen; entscheidend bleibt sichtbare, überprüfbare und korrigierbare Wirkung."],
    ])}
    <p>Wirkungsdaten bereiten Entscheidungen vor, ersetzen sie aber nicht. Normative Entscheidungen bleiben demokratisch legitimiert.</p>
  </div></section>`;
}

function lawRef(base, label, hrefTarget, text) {
  const id = `lawref-${slugify(label)}`;
  return `<span class="law-reference"><a class="law-reference-link" href="${href(base, hrefTarget)}" aria-describedby="${id}">${escapeHtml(label)}</a><button class="law-reference-info" type="button" aria-label="Kurzbeschreibung zu ${escapeHtml(label)} anzeigen" aria-describedby="${id}">i</button><span class="reference-popover" id="${id}" role="tooltip">${escapeHtml(text)}</span></span>`;
}

function toolGrid(base) {
  return `<section class="section" aria-labelledby="tools"><div class="section-header"><p class="hero-kicker">Werkzeuge</p>${sectionTitle("tools", "Werkzeuge in diesem Bereich")}<p>Diese Werkzeuge erklären Methoden und Institutionen. Sie ersetzen keine demokratische Entscheidung.</p></div>${cardGrid(base, tools.map(([title, type, text, hrefTarget, dossier]) => ({ kicker: type, title, text, href: hrefTarget, label: "Werkzeug öffnen" })).concat([{ kicker: "LawReader", title: "WStG online lesen", text: "Gesetzestext mit Paragrafen, Kurzfassung, Kommentar und Begründung.", href: "werkstatt/gesetze/wirkungssteuergesetz/", label: "LawReader öffnen" }]))}</section>`;
}

function stateToolGrid(base, concept) {
  const selected = concept?.relatedTools?.length ? stateToolCards.filter(([title]) => concept.relatedTools.includes(title)) : stateToolCards;
  return `<section class="section" aria-labelledby="go11-tools"><div class="section-header"><p class="hero-kicker">Tool- und Methodenbezug</p>${sectionTitle("go11-tools", "Kontext-Werkzeuge")}<p>Die Toolkarten zeigen, wo die Detailkonzepte methodisch anschließen. Wo noch keine Demo existiert, ist die Funktion als Vorbereitung gekennzeichnet.</p></div>${cardGrid(base, selected.map(([title, type, hrefTarget, text]) => ({ kicker: type, title, text, href: hrefTarget, label: "Öffnen" })))}</section>`;
}

function detailConceptCardGrid(base) {
  return `<div class="card-grid three">${stateDetailConcepts.map((concept) => `<article class="card">
    <p class="card-kicker">Fachdetailkonzept</p>
    <h3 class="card-title">${escapeHtml(concept.title)}</h3>
    <p class="card-text">${escapeHtml(concept.subtitle)}</p>
    <div class="portal-card-actions">
      <a class="text-link" href="${href(base, `wirkungsfelder/staat-recht-demokratie/${concept.slug}/`)}">Online lesen</a>
      ${fileExists(concept.docx) ? `<a class="text-link" href="${href(base, concept.docx)}">DOCX</a>` : ""}
      ${fileExists(concept.pdf) ? `<a class="text-link" href="${href(base, concept.pdf)}">PDF</a>` : ""}
    </div>
  </article>`).join("")}</div>`;
}

function crossLinkGrid(base) {
  const links = [
    ["SDG-/SDG+-Referenzrahmen", "Referenzrahmen für Wirkung, Agenda 2030 und SDG+.", "verstehen/sdgs-sdgplus/"],
    ["WÖk-IDs", "Indikatorenarchitektur für Rechts-, Haushalts- und Governance-Fragen.", "werkzeuge/woek-ids/"],
    ["Scorecards", "Bewertungsraster, Benchmarks und Nichtkompensation.", "werkzeuge/scorecards/"],
    ["T-SROI", "Transformationsmessung für öffentliche Investitionen und Prävention.", "werkzeuge/t-sroi/"],
    ["Wirkungsumsatzsteuer", "Produktwirkung als steuerlicher Anwendungsfall.", "werkzeuge/wirkungsumsatzsteuer/"],
    ["Produkte & Konsum", "Produktwirkung, WUStG und Lieferkettenlogik.", "wirkungsfelder/produkte-konsum/"],
    ["Wirtschaft & Unternehmen", "Unternehmenswirkung, Governance, Risiko und Finanzmarktanschluss.", "wirkungsfelder/wirtschaft-unternehmen/"],
    ["Finanzsystem & Kapital", "Kapitalwirkung, Wirkungsfonds und Finanzierbarkeit.", "wirkungsfelder/finanzsystem-kapital/"],
    ["Medien & Öffentlichkeit", "Medienqualität, Plattformlogik, Desinformation und demokratische Öffentlichkeit.", "wirkungsfelder/medien-oeffentlichkeit/"],
    ["Wissenschaft, Innovation & Digitalisierung", "Datenräume, KI, Wissenschaftsintegrität und digitale öffentliche Infrastruktur.", "wirkungsfelder/wissenschaft-innovation-digitalisierung/"],
    ["Arbeit & Einkommen", "WEstG, Automatisierung und Sozialabgaben-Entkopplung.", "wirkungsfelder/arbeit-einkommen/"],
    ["Rente & soziale Sicherung", "Wirkungsrente, Lebenswirkungs-Konto und Fondslogik.", "wirkungsfelder/rente-soziale-sicherung/"],
    ["Wohnen & Stadt", "Wirkungshaushalt, kommunale Umsetzung und Rechtsschutz im Wohnraum.", "wirkungsfelder/wohnen-stadt/"],
    ["Bildung", "Demokratische Wirkungskompetenz, Datenschutz und Bildungswirkung.", "wirkungsfelder/bildung/"],
    ["Gesundheit & Pflege", "Prävention, Wirkungshaushalt und Gesundheitswirkung.", "wirkungsfelder/gesundheit-pflege/"],
  ];
  return `<section class="section" aria-labelledby="crosslinks"><div class="section-header"><p class="hero-kicker">Vernetzung</p>${sectionTitle("crosslinks", "Verwandte Portale und Werkzeuge")}</div>${cardGrid(base, links.map(([title, text, hrefTarget]) => ({ title, text, href: hrefTarget, label: "Öffnen" })))}</section>`;
}

function sdgBlock() {
  return `<section class="section" aria-labelledby="sdg-title"><div class="portal-reference-block"><p class="hero-kicker">Referenzrahmen</p>${sectionTitle("sdg-title", "SDG-/SDG+-Bezug")}<h3>Relevante SDGs</h3><div class="model-strip">${sdgs.map((x) => `<span>${escapeHtml(x)}</span>`).join("")}</div><h3>Relevante SDG+-Dimensionen</h3><div class="model-strip">${sdgPlus.map((x) => `<span>${escapeHtml(x)}</span>`).join("")}</div><p>Staat, Recht und Demokratie sind der institutionelle Rahmen, in dem Wirkung sichtbar, prüfbar, anfechtbar und korrigierbar wird.</p><p>SDG+ ist keine offizielle UN-Kategorie, sondern eine transparente Erweiterung der Wirkungsökonomie.</p></div></section>`;
}

function bookBlock(base) {
  return `<section class="section" aria-labelledby="book-anchors"><div class="section-header"><p class="hero-kicker">Online-Buch</p>${sectionTitle("book-anchors", "Anker im Online-Buch")}</div><div class="model-strip">${bookAnchors.map(([label, link]) => `<a href="${href(base, link)}">${escapeHtml(label)}</a>`).join("")}</div></section>`;
}

function downloadBlock(base, items) {
  const available = items.filter((item) => fileExists(item.href));
  return `<section class="section" aria-labelledby="downloads"><div class="card"><p class="hero-kicker">Dossier & Export</p>${sectionTitle("downloads", "Downloads und Druck")}<p class="card-text">Online-Volltext ist der Hauptzugang. Word-Dateien bleiben ergänzende Export- und Archivfassungen.</p><div class="portal-card-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button>${available.map((item) => `<a class="btn btn-secondary" href="${href(base, item.href)}">${escapeHtml(item.label)}</a>`).join("")}</div></div></section>`;
}

function portalPage() {
  page({
    rel: "wirkungsfelder/staat-recht-demokratie/index.html",
    title: "Staat, Recht & Demokratie | Wirkungsökonomie",
    description: "Wirkung als Rechtsprinzip, Wirkungssteuergesetz, Wirkungsrat und demokratische Sicherung.",
    body: (base, route) => `${hero(base, {
      kicker: "Wirkungsfeld",
      title: "Staat, Recht & Demokratie",
      subtitle: "Wirkung als Rechtsprinzip, Wirkungssteuergesetz, Wirkungsrat und demokratische Sicherung",
      text: "Der Staat ist in der Wirkungsökonomie kein zentraler Planer und keine Bewertungsmaschine. Er ist Rückkopplungsarchitekt: Er schafft Regeln, Verfahren, Institutionen und Haushaltslogiken, die positive Netto-Wirkung für Mensch, Planet und Demokratie wahrscheinlicher machen und destruktive Wirkung erschweren.",
      action: `<a class="btn btn-primary" href="${href(base, "werkstatt/dossiers/staat-recht-demokratie/")}">Gesamtdossier lesen</a>`,
    })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section narrow">${statusMeta("Portal")}</section>
    <section class="section" aria-labelledby="go11-detailkonzepte"><div class="section-header"><p class="hero-kicker">Vertiefung</p>${sectionTitle("go11-detailkonzepte", "Neue Detailkonzepte")}<p>Der Staats-/Rechtscluster verbindet die Grundlagen zu WStG, Wirkungshaushalt und Wirkungsrat mit den Vertiefungen zu Resilienzstaat, Grundrechten, Verhältnismäßigkeit, Technokratieschutz, Demokratie und SDG+.</p></div>${detailConceptCardGrid(base)}</section>
    <section class="section" aria-labelledby="concepts"><div class="section-header"><p class="hero-kicker">Unterbereiche</p>${sectionTitle("concepts", "Zentrale Unterbereiche")}<p>Wirkungsdaten bereiten Entscheidungen vor, ersetzen sie aber nicht. Bewertet werden Maßnahmen, Strukturen und Wirkungsräume, nicht Menschen.</p></div>${cardGrid(base, dossiers.map((d) => ({ title: d.title, text: d.subtitle, href: `werkstatt/dossiers/staat-recht-demokratie/${d.slug}/`, label: "Dossier lesen" })))}</section>
    <section class="section narrow"><div class="scanner-notice"><strong>LawReference:</strong> Beispiele: ${lawRef(base, "§ 1 WStG", "werkstatt/gesetze/wirkungssteuergesetz/#paragraf-1", "Zweck des Gesetzes: Steuerung nach Wirkung auf Mensch, Planet und Demokratie.")} ${lawRef(base, "§ 5 WUStG", "werkstatt/leitlinien/wustg/#teil-8-finalscore", "FinalScore bestimmt die Wirkungssteuerklasse im Leitlinienmodell.")} ${lawRef(base, "§ 8 WUStG", "werkstatt/leitlinien/wustg/#teil-13-governance-wirkungsrat-und-evaluation", "Evaluation und Wirkungsrat-Governance im Leitlinienmodell.")}</div></section>
    ${toolGrid(base)}
    ${politicalBlock(base)}
    ${sdgBlock()}
    ${bookBlock(base)}
    ${downloadBlock(base, [
      { label: "Konzeptpapier Staat, Recht & Demokratie", href: "assets/downloads/woek_staat_recht_demokratie_konzeptpapier_v0_1.docx" },
      { label: "Gesamtdossier Staat, Recht & Demokratie", href: "assets/downloads/woek_staat_recht_demokratie_gesamtdossier_v0_1.docx" },
      { label: "Standard politische Anschlussfähigkeit", href: "assets/downloads/woek_standard_politische_anschlussfaehigkeit_v0_1.docx" },
    ])}`,
  });
}

function dossierPage(dossier, isOverview = false) {
  const rel = isOverview ? "werkstatt/dossiers/staat-recht-demokratie/index.html" : `werkstatt/dossiers/staat-recht-demokratie/${dossier.slug}/index.html`;
  const md = isOverview ? "woek_staat_recht_demokratie_gesamtdossier_v0_1.md" : dossier.md;
  const docx = isOverview ? "woek_staat_recht_demokratie_gesamtdossier_v0_1.docx" : dossier.docx;
  const title = isOverview ? "Gesamtdossier Staat, Recht & Demokratie" : `Einzeldossier ${dossier.title}`;
  const subtitle = isOverview ? "Politische Anforderungen, Gesetzesarchitektur, Wirkungsrat, Wirkungshaushalt und Umsetzungspfade." : dossier.subtitle;
  const rendered = mdToHtml(read(`${SRC}/${md}`));
  page({
    rel,
    title: `${title} | Wirkungsökonomie`,
    description: subtitle,
    searchSection: "Werkstatt",
    searchType: "Dossier",
    body: (base, route) => `${hero(base, { kicker: isOverview ? "Werkstatt · Gesamtdossier" : "Werkstatt · Einzeldossier", title, subtitle, text: subtitle, action: `<a class="btn btn-primary" href="${href(base, "wirkungsfelder/staat-recht-demokratie/")}">Portal öffnen</a>` })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section narrow">${statusMeta(isOverview ? "Gesamtdossier / Online-Volltext" : "Einzeldossier / Online-Volltext")}</section>
    <section class="section narrow">${tocBlock(rendered.toc)}</section>
    <section class="section article-section"><article class="article-body fulltext-reader">${sectionTitle("online-volltext", "Online-Volltext")}${rendered.html}</article></section>
    ${!isOverview ? toolGrid(base) : `<section class="section" aria-labelledby="dossier-list"><div class="section-header"><p class="hero-kicker">Einzeldossiers</p>${sectionTitle("dossier-list", "Einzeldossiers online lesen")}</div>${cardGrid(base, dossiers.map((d) => ({ title: d.title, text: d.subtitle, href: `werkstatt/dossiers/staat-recht-demokratie/${d.slug}/`, label: "Einzeldossier lesen" })))}</section>`}
    ${politicalBlock(base)}
    ${sdgBlock()}
    ${bookBlock(base)}
    ${downloadBlock(base, [{ label: isOverview ? "Gesamtdossier Word" : `Einzeldossier ${dossier.title} Word`, href: `assets/downloads/${docx}` }])}`,
  });
}

function detailConceptPage(concept) {
  const rendered = mdToHtml(sanitizePublicMarkdown(read(concept.source)));
  page({
    rel: `wirkungsfelder/staat-recht-demokratie/${concept.slug}/index.html`,
    title: `${concept.title} | Staat, Recht & Demokratie`,
    description: concept.subtitle,
    searchSection: "Wirkungsfelder",
    searchType: "Detailkonzept",
    body: (base, route) => `${hero(base, {
      kicker: "Staat, Recht & Demokratie · Fachdetailkonzept",
      title: concept.title,
      subtitle: concept.subtitle,
      text: "Dieses Fachdetailkonzept vertieft den Portalbereich Staat, Recht & Demokratie. Online-Volltext ist der Hauptzugang; DOCX und PDF sind ergänzende Exportfassungen.",
      action: `<a class="btn btn-primary" href="${href(base, "wirkungsfelder/staat-recht-demokratie/")}">Portal öffnen</a>`,
    })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section"><div class="feature-grid">
      <article class="card"><p class="card-kicker">Einordnung</p><h2 class="card-title">Ausführliches Fachdetailkonzept</h2><p class="card-text">Diese Seite ist keine Kurznotiz und kein Portalintro. Sie enthält die vollständige öffentliche Langfassung mit Kapitelankern, Tabellen, Quellen und Downloads.</p></article>
      <article class="card"><p class="card-kicker">Download</p><h2 class="card-title">DOCX und PDF</h2><p class="card-text">Dokumenttyp: Fachdetailkonzept · Version v1.0 · öffentliche Lesefassung. Die Downloads ergänzen den Online-Volltext als Export und Archiv.</p><div class="portal-card-actions no-print">${fileExists(concept.docx) ? `<a class="text-link" href="${href(base, concept.docx)}">DOCX herunterladen</a>` : ""}${fileExists(concept.pdf) ? `<a class="text-link" href="${href(base, concept.pdf)}">PDF herunterladen</a>` : ""}</div></article>
      <article class="card"><p class="card-kicker">Schutzbox</p><h2 class="card-title">Keine Personenbewertung</h2><p class="card-text">Kein Social Credit, keine automatische Entscheidung, keine Rechtsberatung. Wirkungsdaten bereiten Entscheidungen vor; Grundrechte, Rechtsschutz und demokratische Kontrolle bleiben erhalten.</p></article>
    </div></section>
    <section class="section narrow">${tocBlock(rendered.toc)}</section>
    <section class="section article-section"><article class="article-body fulltext-reader">${sectionTitle("online-volltext", "Online-Volltext")}${rendered.html}</article></section>
    <section class="section" aria-labelledby="state-cluster"><div class="section-header"><p class="hero-kicker">Staats-/Rechtscluster</p>${sectionTitle("state-cluster", "Verknüpfte Detailkonzepte")}</div>${detailConceptCardGrid(base)}</section>
    ${stateToolGrid(base, concept)}
    ${crossLinkGrid(base)}
    ${politicalBlock(base)}
    ${sdgBlock()}
    ${bookBlock(base)}
    ${downloadBlock(base, [
      { label: "Detailkonzept DOCX", href: concept.docx },
      { label: "Detailkonzept PDF", href: concept.pdf },
    ])}`,
  });
}

function toolPage(rel, title, subtitle, description, linkedDossier) {
  page({
    rel,
    title: `${title} | Wirkungsökonomie`,
    description,
    searchSection: "Werkzeuge",
    searchType: "Werkzeug",
    body: (base, route) => `${hero(base, { kicker: "Methodenregister", title, subtitle, text: description, action: `<a class="btn btn-primary" href="${href(base, linkedDossier)}">Dossier lesen</a>` })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section narrow">${statusMeta("Kanonische Toolseite / Webfassung")}</section>
    <section class="section"><div class="feature-grid"><article class="card" id="funktion"><p class="card-kicker">Funktion</p><h2 class="card-title">Was es leistet ${citeAnchor("funktion")}</h2><p class="card-text">${escapeHtml(description)}</p></article><article class="card" id="grenze"><p class="card-kicker">Grenze</p><h2 class="card-title">Keine automatische Politikmaschine ${citeAnchor("grenze")}</h2><p class="card-text">Das Werkzeug bereitet Entscheidungen vor. Es ersetzt weder Parlament, Rechtsschutz noch demokratischen Diskurs.</p></article><article class="card" id="anwendung"><p class="card-kicker">Anwendung</p><h2 class="card-title">Angewendet in ${citeAnchor("anwendung")}</h2><p class="card-text">Staat, Recht & Demokratie, Produktbesteuerung, Impact Controlling, Haushalt, Gesetzgebung und Verwaltung.</p></article></div></section>
    <section class="section" aria-labelledby="tool-detailkonzepte"><div class="section-header"><p class="hero-kicker">Fachgrundlage</p>${sectionTitle("tool-detailkonzepte", "Neue Detailkonzepte")}</div>${detailConceptCardGrid(base)}</section>
    ${politicalBlock(base)}
    ${sdgBlock()}
    ${bookBlock(base)}
    ${downloadBlock(base, [{ label: "Dossier online lesen", href: linkedDossier }])}`,
  });
}

function workshopLibraryPage() {
  page({
    rel: "werkstatt/arbeitsbibliothek/wirkungsfelder/staat-recht-demokratie/index.html",
    title: "Staat, Recht & Demokratie in der Arbeitsbibliothek | Werkstatt",
    description: "Arbeitsbibliothek zu Staat, Recht & Demokratie: Konzept, Gesamtdossier, Einzeldossiers, Gesetzestexte, Tools und Downloads.",
    searchSection: "Werkstatt",
    searchType: "Arbeitsbibliothek",
    body: (base, route) => `${hero(base, { kicker: "Arbeitsbibliothek · Wirkungsfeld", title: "Staat, Recht & Demokratie", subtitle: "Konzept, Dossiers, Gesetzesarchitektur und Umsetzungswerkzeuge.", text: "Konzepte und Dossiers landen automatisch in der Werkstatt. Online lesen ist der Hauptzugang.", action: `<a class="btn btn-primary" href="${href(base, "wirkungsfelder/staat-recht-demokratie/")}">Portal öffnen</a>` })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section"><div class="section-header"><p class="hero-kicker">Arbeitsbibliothek</p>${sectionTitle("library", "Online lesen vor Download")}</div>${cardGrid(base, [
      { title: "Portal Staat, Recht & Demokratie", text: "Rang-3-Portal mit Unterbereichen und Werkzeugen.", href: "wirkungsfelder/staat-recht-demokratie/" },
      { title: "Gesamtdossier Staat, Recht & Demokratie", text: "Gesamtdossier online lesbar.", href: "werkstatt/dossiers/staat-recht-demokratie/" },
      { title: "Wirkungssteuergesetz WStG", text: "LawReader mit Paragrafenankern.", href: "werkstatt/gesetze/wirkungssteuergesetz/" },
      ...stateDetailConcepts.map((concept) => ({ title: concept.title, text: concept.subtitle, href: `wirkungsfelder/staat-recht-demokratie/${concept.slug}/` })),
      ...dossiers.map((d) => ({ title: d.title, text: d.subtitle, href: `werkstatt/dossiers/staat-recht-demokratie/${d.slug}/` })),
    ])}</section>
    ${downloadBlock(base, [
      { label: "Konzeptpapier Word", href: "assets/downloads/woek_staat_recht_demokratie_konzeptpapier_v0_1.docx" },
      { label: "Gesamtdossier Word", href: "assets/downloads/woek_staat_recht_demokratie_gesamtdossier_v0_1.docx" },
    ])}`,
  });

  page({
    rel: "werkstatt/arbeitsbibliothek/konzepte-dossiers/index.html",
    title: "Konzepte & Dossiers | Arbeitsbibliothek der Wirkungsökonomie",
    description: "Online lesbare Konzeptpapiere, Gesamtdossiers und Einzeldossiers der Wirkungsökonomie mit Downloadhinweisen.",
    searchSection: "Werkstatt",
    searchType: "Arbeitsbibliothek",
    body: (base, route) => `${hero(base, {
      kicker: "Arbeitsbibliothek",
      title: "Konzepte & Dossiers",
      subtitle: "Online lesen, zitieren, drucken, später exportieren.",
      text: "Konzepte und Dossiers landen automatisch in der Werkstatt. Downloads sind Archiv und Export, nicht Hauptzugang.",
      action: `<a class="btn btn-primary" href="${href(base, "werkstatt/arbeitsbibliothek/")}">Arbeitsbibliothek öffnen</a>`,
    })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section">
      <div class="section-header">
        <p class="hero-kicker">Grundsatz</p>
        ${sectionTitle("online-first", "Online-Volltext ist Hauptzugang")}
        <p>Alle zitierfähigen Konzepte und Dossiers erhalten stabile Online-Adressen mit Abschnittsankern. Word/PDF-Dateien bleiben ergänzend.</p>
      </div>
      ${cardGrid(base, [
        { kicker: "", title: "Produktbesteuerung durch Wirkung", text: "Konzeptpapier online im Portal Produkte & Konsum.", href: "wirkungsfelder/produkte-konsum/produktbesteuerung-durch-wirkung/" },
        { kicker: "", title: "Dossier Produkte & Konsum", text: "Rechenmodell, Tarifmatrix, Beispiele und Quellen.", href: "wirkungsfelder/produkte-konsum/dossier/" },
        { kicker: "", title: "Impact Controlling", text: "Methodenportal zu T-SROI, NWI, WÖk-IDs und Scorecards.", href: "werkzeuge/impact-controlling/" },
        { kicker: "", title: "Gesamtdossier Impact Controlling", text: "Gesamtdossier mit Einzeldossiers und Tool-Spezifikation.", href: "werkzeuge/impact-controlling/dossier/" },
        { kicker: "", title: "Staat, Recht & Demokratie", text: "Portal zu Wirkung als Rechtsprinzip, WStG, Wirkungsrat und Wirkungshaushalt.", href: "wirkungsfelder/staat-recht-demokratie/" },
        { kicker: "", title: "Gesamtdossier Staat, Recht & Demokratie", text: "Gesetzesarchitektur, politische Anschlussfähigkeit, Wirkungsrat und Umsetzungsoptionen.", href: "werkstatt/dossiers/staat-recht-demokratie/" },
        ...stateDetailConcepts.map((concept) => ({ kicker: "Staat, Recht & Demokratie", title: concept.title, text: concept.subtitle, href: `wirkungsfelder/staat-recht-demokratie/${concept.slug}/` })),
        { kicker: "Bildung", title: "Die Wirkungsschule", text: "Öffentliche Kurzfassung und Konzeptpapier zur Wirkungsschule.", href: "wirkungsfelder/bildung/wirkungsschule/" },
      ])}
    </section>
    ${downloadBlock(base, [
      { label: "Produkt-Konzeptpapier Word", href: "assets/downloads/woek_produkte_konsum_wirkungsumsatzsteuer_konzeptpapier_v0_1.docx" },
      { label: "Produkt-Dossier Word", href: "assets/downloads/woek_produkte_konsum_wirkungsumsatzsteuer_dossier_v0_1.docx" },
      { label: "Impact-Konzeptpapier Word", href: "assets/downloads/woek_impact_controlling_konzeptpapier_v0_1.docx" },
      { label: "Impact-Gesamtdossier Word", href: "assets/downloads/woek_impact_controlling_gesamtdossier_v0_1.docx" },
      { label: "Staat/Recht-Konzeptpapier Word", href: "assets/downloads/woek_staat_recht_demokratie_konzeptpapier_v0_1.docx" },
      { label: "Staat/Recht-Gesamtdossier Word", href: "assets/downloads/woek_staat_recht_demokratie_gesamtdossier_v0_1.docx" },
    ])}`,
  });
}

function updateSitemap() {
  const sitemapPath = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(sitemapPath)) return;
  const urls = [
    "wirkungsfelder/staat-recht-demokratie/",
    ...stateDetailConcepts.map((concept) => `wirkungsfelder/staat-recht-demokratie/${concept.slug}/`),
    "werkstatt/dossiers/staat-recht-demokratie/",
    ...dossiers.map((d) => `werkstatt/dossiers/staat-recht-demokratie/${d.slug}/`),
    "werkstatt/arbeitsbibliothek/wirkungsfelder/staat-recht-demokratie/",
    "werkzeuge/wirkungsrat/",
    "werkzeuge/wirkungshaushalt/",
    "werkzeuge/politische-wirkungspruefung/",
  ];
  let sitemap = fs.readFileSync(sitemapPath, "utf8");
  for (const rel of urls) {
    sitemap = sitemap.replace(new RegExp(`\\s*<url>\\s*<loc>${SITE}/${rel}</loc>\\s*<lastmod>[^<]+</lastmod>\\s*</url>`, "g"), "");
    sitemap = sitemap.replace(new RegExp(`\\s*<url><loc>${SITE}/${rel}</loc><lastmod>[^<]+</lastmod></url>`, "g"), "");
  }
  sitemap = sitemap.replace("</urlset>", `${urls.map((rel) => `  <url><loc>${SITE}/${rel}</loc><lastmod>${DATE}</lastmod></url>`).join("\n")}\n</urlset>`);
  fs.writeFileSync(sitemapPath, sitemap, "utf8");
}

function build() {
  portalPage();
  for (const concept of stateDetailConcepts) detailConceptPage(concept);
  dossierPage({}, true);
  for (const dossier of dossiers) dossierPage(dossier);
  toolPage("werkzeuge/wirkungsrat/index.html", "Wirkungsrat", "Wächterinstitution der Wirkungslogik.", "Der Wirkungsrat pflegt WÖk-IDs, Benchmarks, Archetypen und Evaluationslogik und schützt die Wirkungslogik vor Greenwashing, Lobbyverzerrung und technokratischer Erstarrung.", "werkstatt/dossiers/staat-recht-demokratie/wirkungsrat/");
  toolPage("werkzeuge/wirkungshaushalt/index.html", "Wirkungshaushalt", "Öffentliche Mittel nach realer Zustandsveränderung steuern.", "Der Wirkungshaushalt betrachtet öffentliche Mittel nicht nur nach Ausgabenlogik, sondern nach Prävention, Resilienz, Zielgruppenwirkung und positiver Netto-Wirkung.", "werkstatt/dossiers/staat-recht-demokratie/wirkungshaushalt/");
  toolPage("werkzeuge/politische-wirkungspruefung/index.html", "Politische Wirkungsprüfung", "Programme, Gesetze und Haushalte als Wirkungspotenziale prüfen.", "Politische Wirkungsprüfung macht erwartete Erst-, Zweit- und Drittwirkungen sichtbar, ohne Parteien moralisch zu sortieren oder politische Entscheidung zu automatisieren.", "werkstatt/dossiers/staat-recht-demokratie/politische-wirkungspruefung/");
  toolPage("werkzeuge/wirkungssteuergesetz/index.html", "Wirkungssteuergesetz WStG", "Rahmengesetzliche Logik für Wirkungssteuerung.", "Das WStG verankert Wirkung auf Mensch, Planet und Demokratie als steuerliche Bemessungs- und Steuerungslogik. Es ist ein Rahmeninstrument, kein einzelnes Wirkungsfeld.", "werkstatt/dossiers/staat-recht-demokratie/wirkungssteuergesetz-wstg/");
  workshopLibraryPage();
  updateSitemap();
}

build();
