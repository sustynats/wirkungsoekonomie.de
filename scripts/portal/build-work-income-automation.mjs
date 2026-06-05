import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://wirkungsoekonomie.de";
const DATE = "2026-05-24";
const CSS_VERSION = "20260525-result-interpretation";
const JS_VERSION = "20260525-sprint-2";
const SRC = "docs/arbeit-einkommen/docx-extracts";
const WEB = "docs/arbeit-einkommen/source";

const pages = [
  ["arbeit-einkommen-wirkung", "Arbeit, Einkommen und Wirkung", "Arbeit ist nicht automatisch Wirkung. Einkommen beweist nicht automatisch Leistung.", "woek_detailkonzept_arbeit-einkommen-wirkung_v0_1.md", "woek_einzeldossier_arbeit-einkommen-wirkung_v0_1.md", "woek_detailkonzept_arbeit-einkommen-wirkung_v0_1.docx", "woek_einzeldossier_arbeit-einkommen-wirkung_v0_1.docx"],
  ["automatisierung-maschinenleistung", "Automatisierung und Maschinenleistung", "Maschinenleistung erzeugt Produktivität, muss aber gesellschaftlich rückgekoppelt werden.", "woek_detailkonzept_automatisierung-maschinenleistung_v0_1.md", "woek_einzeldossier_automatisierung-maschinenleistung_v0_1.md", "woek_detailkonzept_automatisierung-maschinenleistung_v0_1.docx", "woek_einzeldossier_automatisierung-maschinenleistung_v0_1.docx"],
  ["sozialabgaben-entkoppeln", "Sozialabgaben entkoppeln", "Menschliche Arbeit wird entlastet; automatisierte Wertschöpfung beteiligt sich an sozialer Stabilität.", "woek_detailkonzept_sozialabgaben-entkopplung_v0_1.md", "woek_einzeldossier_sozialabgaben-entkopplung_v0_1.md", "woek_detailkonzept_sozialabgaben-entkopplung_v0_1.docx", "woek_einzeldossier_sozialabgaben-entkopplung_v0_1.docx"],
  ["wirkungseinkommen", "Wirkungseinkommen", "Wirkungseinkommen verbindet Grunddividende, Markteinkommen, Wirkungsbonus und Transformationsschutz.", "woek_detailkonzept_wirkungseinkommen_v0_1.md", "woek_einzeldossier_wirkungseinkommen_v0_1.md", "woek_detailkonzept_wirkungseinkommen_v0_1.docx", "woek_einzeldossier_wirkungseinkommen_v0_1.docx"],
  ["wirkungseinkommensteuer", "Wirkungseinkommensteuer WEstG", "Einkommen wird nicht nur nach Höhe, sondern nach Entstehungskontext und Wirkung betrachtet.", "woek_detailkonzept_wirkungseinkommensteuer-westg_v0_1.md", "woek_einzeldossier_wirkungseinkommensteuer-westg_v0_1.md", "woek_detailkonzept_wirkungseinkommensteuer-westg_v0_1.docx", "woek_einzeldossier_wirkungseinkommensteuer-westg_v0_1.docx"],
  ["wirkungsfonds-dividende", "Wirkungsfonds und Automatisierungsdividende", "Automatisierungsüberschüsse und negative Wirkung fließen in Fonds, aus denen Sicherheit, Weiterbildung, Care und positive Wirkleistung finanziert werden.", "woek_arbeit_einkommen_detailkonzepte_umfangreich_v0_1.md", "woek_arbeit_einkommen_einzeldossier_set_v0_1.md", "woek_arbeit_einkommen_detailkonzepte_umfangreich_v0_1.docx", "woek_arbeit_einkommen_einzeldossier_set_v0_1.docx"],
  ["care-bildung-ehrenamt", "Care, Bildung, Ehrenamt und Gemeinwesen", "Unbezahlte oder unterbezahlte Wirkleistungen werden sichtbar, ohne Personen-Scoring.", "woek_detailkonzept_care-bildung-ehrenamt-wirkleistung_v0_1.md", "woek_einzeldossier_care-bildung-ehrenamt-wirkleistung_v0_1.md", "woek_detailkonzept_care-bildung-ehrenamt-wirkleistung_v0_1.docx", "woek_einzeldossier_care-bildung-ehrenamt-wirkleistung_v0_1.docx"],
  ["unternehmen-roboter-mitbestimmung", "Unternehmen, Roboter und Mitbestimmung", "Automatisierung wird Teil der Unternehmenswirkung: Weiterbildung, Verteilung, Arbeitszeit, Produktqualität und Resilienz werden mitbewertet.", "woek_detailkonzept_plattform-daten-ki-arbeit_v0_1.md", "woek_einzeldossier_plattform-daten-ki-arbeit_v0_1.md", "woek_detailkonzept_plattform-daten-ki-arbeit_v0_1.docx", "woek_einzeldossier_plattform-daten-ki-arbeit_v0_1.docx"],
  ["uebergangsarbeitsmarkt-weiterbildung", "Übergangsarbeitsmarkt und Weiterbildung", "Qualifizierung, Tätigkeitswandel und Resilienz werden als Transformationsaufgabe statt als individuelles Scheitern gelesen.", "woek_detailkonzept_uebergang-qualifizierung-resilienz_v0_1.md", "woek_einzeldossier_uebergang-qualifizierung-resilienz_v0_1.md", "woek_detailkonzept_uebergang-qualifizierung-resilienz_v0_1.docx", "woek_einzeldossier_uebergang-qualifizierung-resilienz_v0_1.docx"],
  ["politische-anschlussfaehigkeit", "Politische Anschlussfähigkeit", "Arbeit, Einkommen und Automatisierung bleiben demokratisch gestaltbar: marktbasiert, sozialstaatlich, fondsorientiert, kommunal, gewerkschaftlich oder bürgerzentriert.", "woek_arbeit_einkommen_automatisierung_konzeptpapier_v0_1.md", "woek_arbeit_einkommen_automatisierung_gesamtdossier_v0_1.md", "woek_arbeit_einkommen_automatisierung_konzeptpapier_v0_1.docx", "woek_arbeit_einkommen_automatisierung_gesamtdossier_v0_1.docx"],
];

const tools = [
  ["Automatisierungs- und Wirkungseinkommensrechner", "Demo", "Zeigt Beitragslücken, Maschinenwertschöpfungsbeitrag, Transformationsbonus und Wirkungseinkommensmodell.", "erleben/automatisierungs-wirkungseinkommensrechner/"],
  ["Wirkungseinkommensteuer", "Steuerkonzept", "Ordnet Einkommen nach Höhe, Entstehungskontext, Wirkung und Schutzgrenzen ein.", "werkzeuge/wirkungseinkommensteuer/"],
  ["Wirkungsfonds", "Finanzierungsarchitektur", "Bündelt Mittel aus Automatisierung, Kapitalwirkung und Wirkungssteuern für soziale Stabilität und Transformation.", "werkzeuge/wirkungsfonds/"],
  ["Maschinenwertschöpfungsbeitrag", "Rückkopplungsbeitrag", "Beteiligt automatisierte Wertschöpfung an sozialer Sicherung, ohne Innovation pauschal zu bestrafen.", "werkzeuge/maschinenwertschoepfungsbeitrag/"],
  ["Automatisierungsdividende", "Verteilungslogik", "Führt Produktivitätsgewinne teilweise in Weiterbildung, Sicherheit, Wirkungsfonds und gesellschaftliche Resilienz zurück.", "werkzeuge/automatisierungsdividende/"],
  ["T-SROI", "Impact Controlling", "Bewertet Transformationsinvestitionen in Qualifizierung, Care, Weiterbildung und Arbeitszeitmodelle.", "werkzeuge/impact-controlling/t-sroi/"],
  ["NWI", "Kennzahl", "Ordnet positive, negative und neutrale Arbeits- und Automatisierungswirkung ein.", "werkzeuge/netto-wirkungs-index/"],
  ["WÖk-IDs", "Datenarchitektur", "Verbinden SDGs, SDG+, Arbeitsmarktdaten, Automatisierungsrisiken und Wirkungsindikatoren.", "werkzeuge/woek-ids/"],
  ["Scorecards", "Bewertungsraster", "Übersetzen Arbeit, Maschinenleistung, Care, Weiterbildung und Schutzgrenzen in nachvollziehbare Bewertung.", "werkzeuge/scorecards/"],
  ["Reverse Merit Order", "Schutzlogik", "Verhindert, dass Verdrängung, Ausbeutung oder Grundrechtsverletzungen durch Effizienzgewinne schöngerechnet werden.", "werkzeuge/reverse-merit-order/"],
];

const sdgs = ["SDG 1 Keine Armut", "SDG 3 Gesundheit und Wohlergehen", "SDG 4 Hochwertige Bildung", "SDG 5 Geschlechtergleichstellung", "SDG 8 Menschenwürdige Arbeit", "SDG 9 Industrie, Innovation und Infrastruktur", "SDG 10 Weniger Ungleichheiten", "SDG 12 Nachhaltige/r Konsum und Produktion", "SDG 16 Frieden, Gerechtigkeit und starke Institutionen", "SDG 17 Partnerschaften"];
const sdgPlus = ["SDG+ Demokratie", "SDG+ Rechtsstaatlichkeit", "SDG+ digitale Selbstbestimmung", "SDG+ institutionelles Vertrauen", "SDG+ gesellschaftlicher Zusammenhalt"];
const bookAnchors = [
  ["Kapitel 15 - Leistung neu definieren", "referenz/kapitel-015-leistung-neu-definieren/"],
  ["Kapitel 23 - Wirkungsrisiko und Wirkungsresilienz", "referenz/kapitel-023-wirkungsrisiko-und-wirkungsresilienz/"],
  ["Kapitel 56 - Automatisierung, Arbeit und Maschinenleistung", "referenz/kapitel-056-arbeit-automatisierung-und-maschinenleistung/"],
  ["Kapitel 57 - Wirkungseinkommen", "referenz/kapitel-057-wirkungseinkommen/"],
  ["Kapitel 58 - Wirkungsrente", "referenz/kapitel-058-wirkungsrente/"],
  ["Kapitel 92 ff. - Finanzsystem, Wirkungsfonds und Kapitalwirkung", "referenz/teil-15-internationale-ordnung-globalisierung-und-geopolitik/"],
];
const sources = [
  ["OECD - AI and work", "https://www.oecd.org/en/topics/artificial-intelligence-and-work.html"],
  ["OECD - Future of Work", "https://www.oecd.org/en/topics/future-of-work.html"],
  ["ILO - Generative AI and jobs", "https://www.ilo.org/publications/generative-ai-and-jobs-global-analysis-potential-effects-job-quantity-and"],
  ["European Union - AI Act", "https://artificialintelligenceact.eu/"],
  ["European Commission - Platform Work Directive", "https://ec.europa.eu/social/main.jsp?catId=89&furtherNews=yes&newsId=11055&langId=en"],
  ["Destatis - Arbeitsmarkt", "https://www.destatis.de/DE/Themen/Arbeit/Arbeitsmarkt/_inhalt.html"],
  ["IAB - Job-Futuromat", "https://job-futuromat.iab.de/"],
  ["Bundesagentur für Arbeit - BERUFENET", "https://web.arbeitsagentur.de/berufenet/"],
];

const topDocuments = [
  ["konzeptpapier", "Konzeptpapier", "woek_arbeit_einkommen_automatisierung_konzeptpapier_v0_1.md", "woek_arbeit_einkommen_automatisierung_konzeptpapier_v0_1.docx", "Grundlogik des Wirkungsfelds Arbeit & Einkommen: Automatisierung, Maschinenleistung, Wirkungseinkommen, Sozialabgaben-Entkopplung und politische Anschlussfähigkeit."],
  ["gesamtdossier", "Gesamtdossier", "woek_arbeit_einkommen_automatisierung_gesamtdossier_v0_1.md", "woek_arbeit_einkommen_automatisierung_gesamtdossier_v0_1.docx", "Arbeitsdossier mit Modelllogik, Annahmen, Quellen, Querverlinkungen und Umsetzungspfaden."],
  ["detailkonzepte", "Detailkonzepte", "woek_arbeit_einkommen_detailkonzepte_umfangreich_v0_1.md", "woek_arbeit_einkommen_detailkonzepte_umfangreich_v0_1.docx", "Langfassung der Detailkonzepte für die Unterbereiche des Portals."],
  ["dossiers", "Einzeldossiers", "woek_arbeit_einkommen_einzeldossier_set_v0_1.md", "woek_arbeit_einkommen_einzeldossier_set_v0_1.docx", "Einzeldossiers mit Praxisfragen, Bewertungslogik, Annahmen, Grenzen, Toolbezug und politischer Umsetzung."],
];

const downloadLabels = {
  "woek_arbeit_einkommen_automatisierung_konzeptpapier_v0_1.docx": "Konzeptpapier herunterladen",
  "woek_arbeit_einkommen_automatisierung_gesamtdossier_v0_1.docx": "Gesamtdossier herunterladen",
  "woek_arbeit_einkommen_detailkonzepte_umfangreich_v0_1.docx": "Detailkonzepte herunterladen",
  "woek_arbeit_einkommen_einzeldossier_set_v0_1.docx": "Einzeldossiers herunterladen",
};

const sdgRefs = {
  "SDG 1 Keine Armut": ["sdg-1", "verstehen/sdgs-sdgplus/sdg-1-keine-armut/", "SDG 1 macht Armut, Existenzsicherung, Teilhabe und soziale Schutzsysteme als Wirkungsgrenze sichtbar."],
  "SDG 3 Gesundheit und Wohlergehen": ["sdg-3", "verstehen/sdgs-sdgplus/sdg-3-gesundheit-wohlergehen/", "SDG 3 verknüpft Arbeit, Einkommen und Automatisierung mit Gesundheit, Stress, Sicherheit und Wohlergehen."],
  "SDG 4 Hochwertige Bildung": ["sdg-4", "verstehen/sdgs-sdgplus/sdg-4-hochwertige-bildung/", "SDG 4 ist der Referenzrahmen für Weiterbildung, Wirkungskompetenz und Transformationsfähigkeit."],
  "SDG 5 Geschlechtergleichstellung": ["sdg-5", "verstehen/sdgs-sdgplus/sdg-5-geschlechtergleichstellung/", "SDG 5 macht sichtbar, wie Care-Arbeit, Einkommen, Rollenbilder und Zugang zu Arbeit Geschlechtergerechtigkeit prägen."],
  "SDG 8 Menschenwürdige Arbeit": ["sdg-8", "verstehen/sdgs-sdgplus/sdg-8-menschenwuerdige-arbeit-wirtschaftswachstum/", "SDG 8 ist der direkte Anker für menschenwürdige Arbeit, produktive Beschäftigung und faire Transformation."],
  "SDG 9 Industrie, Innovation und Infrastruktur": ["sdg-9", "verstehen/sdgs-sdgplus/sdg-9-industrie-innovation-infrastruktur/", "SDG 9 verbindet Automatisierung, Infrastruktur, Innovation und resiliente Wertschöpfung."],
  "SDG 10 Weniger Ungleichheiten": ["sdg-10", "verstehen/sdgs-sdgplus/sdg-10-weniger-ungleichheiten/", "SDG 10 macht Verteilungswirkung, Zugangschancen und soziale Mobilität entscheidungsrelevant."],
  "SDG 12 Nachhaltige/r Konsum und Produktion": ["sdg-12", "verstehen/sdgs-sdgplus/sdg-12-nachhaltiger-konsum-produktion/", "SDG 12 verbindet Produktionslogik, Produktwirkung, Arbeitsbedingungen und Ressourcennutzung."],
  "SDG 16 Frieden, Gerechtigkeit und starke Institutionen": ["sdg-16", "verstehen/sdgs-sdgplus/sdg-16-frieden-gerechtigkeit-starke-institutionen/", "SDG 16 sichert Rechtsstaatlichkeit, Zugang zu Recht, Institutionen und demokratische Korrektur."],
  "SDG 17 Partnerschaften": ["sdg-17", "verstehen/sdgs-sdgplus/sdg-17-partnerschaften/", "SDG 17 macht Kooperation, Daten, Finanzierung und Umsetzungskraft sichtbar."],
  "SDG+ Demokratie": ["sdgplus-demokratie", "verstehen/sdgs-sdgplus/#sdgplus-demokratie", "SDG+ Demokratie ist eine WÖk-Erweiterung für demokratische Stabilität, Teilhabe und Korrekturfähigkeit."],
  "SDG+ Rechtsstaatlichkeit": ["sdgplus-rechtsstaatlichkeit", "verstehen/sdgs-sdgplus/#sdgplus-rechtsstaatlichkeit", "SDG+ Rechtsstaatlichkeit schützt Wirkungssteuerung vor Willkür und sichert Grundrechte."],
  "SDG+ digitale Selbstbestimmung": ["sdgplus-digitale-selbstbestimmung", "verstehen/sdgs-sdgplus/#sdgplus-digitale-selbstbestimmung", "SDG+ digitale Selbstbestimmung schützt Datenrechte, digitale Teilhabe und Freiheit vor Manipulation."],
  "SDG+ institutionelles Vertrauen": ["sdgplus-institutionelles-vertrauen", "verstehen/sdgs-sdgplus/#sdgplus-institutionelles-vertrauen", "SDG+ institutionelles Vertrauen beschreibt faire, kompetente, transparente und korrigierbare Institutionen."],
  "SDG+ gesellschaftlicher Zusammenhalt": ["sdgplus-gesellschaftlicher-zusammenhalt", "verstehen/sdgs-sdgplus/#sdgplus-gesellschaftlicher-zusammenhalt", "SDG+ gesellschaftlicher Zusammenhalt macht Teilhabe, Zugehörigkeit, Sicherheit und Schutz vor Spaltung sichtbar."],
};

function esc(v) { return String(v).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"); }
function slug(v) { return String(v).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }
function route(rel) { return rel.endsWith("/index.html") ? `/${rel.slice(0, -"/index.html".length)}/` : `/${rel}`; }
function base(rel) { return "../".repeat(path.dirname(rel).split("/").filter(Boolean).length); }
function href(b, target) { return /^(https?:|mailto:|#)/.test(target) ? target : `${b}${target.replace(/^\/+/, "")}`; }
function exists(rel) { return fs.existsSync(path.join(ROOT, rel)); }
function read(rel) { return fs.existsSync(path.join(ROOT, rel)) ? fs.readFileSync(path.join(ROOT, rel), "utf8") : ""; }
function write(rel, html) { const out = path.join(ROOT, rel); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, html.replace(/[ \t]+$/gm, ""), "utf8"); }
function cite(id) { return `<a class="cite-anchor no-print" href="#${esc(id)}" aria-label="Zitierlink zu diesem Abschnitt">#</a>`; }
function h2(id, text) { return `<h2 id="${esc(id)}">${esc(text)} ${cite(id)}</h2>`; }
function publicText(value) {
  return String(value || "")
    .replace(/\bInputs\b/g, "Eingaben")
    .replace(/\bOutputs\b/g, "Ergebnisse")
    .replace(/\bv0\.1\b/g, "Modellfassung")
    .replace(/Einzeldossier-Set/g, "Einzeldossiers");
}

function page({ rel, title, description, section = "Wirkungsfelder", type = "Portal", body }) {
  const b = base(rel);
  const canonical = `${SITE}${route(rel)}`;
  write(rel, `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <meta name="search_title" content="${esc(title.replace(/\s+\|.*$/, ""))}">
    <meta name="search_description" content="${esc(description)}">
    <meta name="search_section" content="${esc(section)}">
    <meta name="search_type" content="${esc(type)}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="website"><meta property="og:locale" content="de_DE"><meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="${esc(title.replace(/\s+\|.*$/, ""))}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${SITE}/assets/img/generated/hero-systemgrafik-wirkungsoekonomie.png">
    <link rel="icon" href="${b}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${b}assets/css/style.css?v=20260604-menu-fix">
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="${b}index.html" aria-label="Wirkungsökonomie Startseite"><span class="brand-mark"><img src="${b}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span><span class="brand-name">Wirkungsökonomie</span></a>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav"><span class="nav-toggle-icon" aria-hidden="true">☰</span><span class="sr-only">Menü</span></button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation"><a href="${b}index.html">Start</a></nav>
    </header>
    <main>
      <p class="print-meta">Wirkungsökonomie · ${esc(title.replace(/\s+\|.*$/, ""))} · ${canonical} · Druckdatum: ${DATE}</p>
${body(b)}
    </main>
    <script src="${b}assets/js/main.js?v=20260605-wirkungsraum-stage1"></script>
  </body>
</html>`);
}

function mdToHtml(markdown, prefix = "") {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  const toc = [];
  let p = [];
  let table = [];
  const flush = () => {
    if (!p.length) return;
    const id = `${prefix}absatz-${String(html.length + 1).padStart(3, "0")}`;
    html.push(`<p id="${id}">${esc(publicText(p.join(" ").replace(/\*\*/g, "")))} ${cite(id)}</p>`);
    p = [];
  };
  const flushTable = () => {
    if (!table.length) return;
    const rows = table.map((line) => line.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim())).filter((row) => !row.every((c) => /^:?-{3,}:?$/.test(c)));
    if (rows.length > 1) {
      const [head, ...body] = rows;
      html.push(`<div class="table-wrap"><table class="data-table"><thead><tr>${head.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
    }
    table = [];
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flush(); flushTable(); continue; }
    if (line.startsWith("|") && line.endsWith("|")) { flush(); table.push(line); continue; }
    flushTable();
    const m = line.match(/^(#{1,4})\s+(.+)$/);
    if (m) {
      flush();
      const level = Math.max(2, Math.min(4, m[1].length));
      const text = publicText(m[2].trim());
      const id = `${prefix}${slug(text)}`;
      toc.push({ level, text, id });
      html.push(`<h${level} id="${id}">${esc(text)} ${cite(id)}</h${level}>`);
    } else if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      flush();
      html.push(`<p>${esc(publicText(line.replace(/^([-*]|\d+\.)\s+/, "").replace(/\*\*/g, "")))}</p>`);
    } else {
      p.push(line);
    }
  }
  flush(); flushTable();
  return { toc, html: html.join("\n") };
}
function stripPortalOperationalSections(markdown) {
  const cut = markdown.search(/^##\s+(Werkzeuge in diesem Bereich|Politische Anschlussfähigkeit|SDG-|Anker im Online-Buch|Online lesen)/m);
  return cut >= 0 ? markdown.slice(0, cut).trim() : markdown;
}

function toc(t) {
  if (!t.length) return "";
  return `<details class="toc-card no-print" aria-label="Inhaltsverzeichnis"><summary class="card-title">Auf dieser Seite</summary><ol>${t.map((i) => `<li class="toc-level-${esc(i.level)}"><a href="#${esc(i.id)}">${esc(i.text)}</a></li>`).join("")}</ol></details>`;
}
function ctaLabelFor(url, fallback = "Vertiefung lesen") {
  const value = String(url || "");
  if (/erleben\/automatisierungs-wirkungseinkommensrechner/.test(value)) return "Rechner nutzen";
  if (/\/dossiers\/|\/dossier\//.test(value)) return "Dossier lesen";
  if (/detailkonzepte|konzept/.test(value)) return "Konzept lesen";
  if (/werkzeuge\//.test(value)) return "Methodik lesen";
  if (/wirkungsfelder\/arbeit-einkommen\/.+/.test(value)) return "Vertiefung lesen";
  if (/wirkungsfelder\//.test(value)) return "Wirkungsfeld ansehen";
  return fallback;
}
function cards(b, items, fallbackLabel = "Vertiefung lesen") {
  return `<div class="card-grid three">${items.map(([title, type, text, url, label]) => `<article class="card"><p class="card-kicker">${esc(type || "Kontext")}</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(text || "")}</p>${url ? `<div class="portal-card-actions"><a class="text-link" href="${href(b, url)}">${esc(label || ctaLabelFor(url, fallbackLabel))}</a></div>` : ""}</article>`).join("")}</div>`;
}
function downloads(b, files) {
  const labelForDownload = (file) => {
    if (downloadLabels[file]) return downloadLabels[file];
    if (file.startsWith("woek_detailkonzept_")) return "Detailkonzept herunterladen";
    if (file.startsWith("woek_einzeldossier_")) return "Dossier herunterladen";
    return file.replace(/^woek_/, "").replaceAll("_", " ").replace(/\.docx$/, "");
  };
  const links = files.filter(Boolean).filter((file) => exists(`assets/downloads/${file}`)).map((file) => `<a class="btn btn-secondary" href="${href(b, `assets/downloads/${file}`)}">${esc(labelForDownload(file))}</a>`);
  return `<section class="section" aria-labelledby="downloads"><div class="card"><p class="hero-kicker">Arbeitsmaterial</p>${h2("downloads", "Vertiefung und Arbeitsmaterial")}<p>Hier findest du ergänzende Downloadfassungen und die Druckfunktion. Die inhaltliche Orientierung steht auf der Seite selbst.</p><div class="portal-card-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button>${links.join("")}</div></div></section>`;
}
function publicationAccess(b, heading = "Online lesen und herunterladen") {
  const items = topDocuments.map(([slugName, title, , doc, text]) => [
    title,
    "Online-Volltext",
    text,
    `wirkungsfelder/arbeit-einkommen/${slugName}/`,
  ]);
  return `<section class="section" id="publikationszugang" aria-labelledby="publikationszugang-title"><div class="section-header"><p class="hero-kicker">Publikationszugang</p>${h2("publikationszugang-title", heading)}<p>Alle zentralen Dokumente sind online lesbar und gezielt über Abschnittsanker zitierbar. Downloads bleiben ergänzende Export- und Archivfassungen.</p></div>${cards(b, items)}<div class="download-card compact no-print"><div><p class="card-kicker">Downloads</p><h3 class="card-title">Word-Export und Archiv</h3><p class="card-text">Konzeptpapier, Gesamtdossier, Detailkonzepte und Einzeldossiers bleiben als Dateien verfügbar.</p></div><div class="portal-card-actions">${topDocuments.map(([, , , doc]) => exists(`assets/downloads/${doc}`) ? `<a class="btn btn-secondary" href="${href(b, `assets/downloads/${doc}`)}">${esc(downloadLabels[doc] || "Download")}</a>` : "").join("")}</div></div></section>`;
}
function pagePublicationAccess(b, detailDoc, dossierDoc) {
  return `<section class="section" id="publikationszugang" aria-labelledby="publikationszugang-title"><div class="download-card"><div><p class="card-kicker">Online lesen, gezielt zitieren</p>${h2("publikationszugang-title", "Detailkonzept und Dossier")}<p class="card-text">Diese Unterseite enthält Detailkonzept und Einzeldossier vollständig online. Die Abschnittsanker können direkt zitiert werden; Downloads bleiben ergänzende Exportfassungen.</p></div><div class="portal-card-actions no-print"><a class="btn btn-primary" href="#detailkonzept">Detailkonzept online lesen</a><a class="btn btn-secondary" href="#dossier">Dossier online lesen</a>${exists(`assets/downloads/${detailDoc}`) ? `<a class="btn btn-secondary" href="${href(b, `assets/downloads/${detailDoc}`)}">Detailkonzept herunterladen</a>` : ""}${exists(`assets/downloads/${dossierDoc}`) ? `<a class="btn btn-secondary" href="${href(b, `assets/downloads/${dossierDoc}`)}">Dossier herunterladen</a>` : ""}</div></div></section>`;
}

function articleFromFirstHeading(html, id) {
  const index = html.indexOf(`<h2 id="${id}"`);
  return index >= 0 ? html.slice(index) : html;
}

function detailReadingIntro(b, slugName, title, summary, detailDoc, dossierDoc) {
  return `<section class="section" aria-labelledby="kurzfassung">
    <div class="section-header">
      <p class="hero-kicker">Kurzfassung</p>
      ${h2("kurzfassung", "Auf einen Blick")}
      <p>${esc(summary)}</p>
    </div>
    <div class="card-grid three">
      <article class="card"><h3 class="card-title">Leitfrage</h3><p class="card-text">Wie wird sichtbar, ob Arbeit, Einkommen oder Automatisierung reale Zustandsveränderungen erzeugen, statt nur Tätigkeit oder Lohnsumme zu zählen?</p></article>
      <article class="card"><h3 class="card-title">Perspektivwechsel</h3><p class="card-text">Bewertet wird nicht die Person, sondern der Wirkungszusammenhang: Tätigkeit, Organisation, Maschinenleistung, Finanzierung, Übergangsschutz und Rückkopplung.</p></article>
      <article class="card"><h3 class="card-title">Schutzgrenze</h3><p class="card-text">Keine Personenbewertung, keine Leistungsüberwachung einzelner Beschäftigter und keine automatische Entscheidung.</p></article>
    </div>
  </section>
  <section class="section" aria-labelledby="old-vs-woek"><div class="section-header"><p class="hero-kicker">Systemblick</p>${h2("old-vs-woek", "Alte Logik vs. WÖk-Logik")}</div><div class="comparison-grid"><article class="card"><p class="card-kicker">Alte Logik</p><h3 class="card-title">Was oft zu eng gemessen wird</h3><ul class="clean-list"><li>Arbeit wird über Stunden, Lohn und Beschäftigung gezählt.</li><li>Einkommen gilt schnell als Beweis für Leistung.</li><li>Unbezahlte Wirkleistung und automatisierte Wertschöpfung bleiben schwach rückgekoppelt.</li></ul></article><article class="card"><p class="card-kicker">WÖk-Logik</p><h3 class="card-title">Was zusätzlich sichtbar wird</h3><ul class="clean-list"><li>Entscheidend ist die tatsächliche Wirkung auf Mensch, Planet und Demokratie.</li><li>Automatisierung wird nach Übergangsschutz, Beteiligung und Wertschöpfungsrückfluss bewertet.</li><li>Wirkungsdaten bereiten Entscheidungen vor, ersetzen sie aber nicht.</li></ul></article></div></section>
  <section class="section" aria-labelledby="hebel"><div class="section-header"><p class="hero-kicker">Wirkungshebel</p>${h2("hebel", "Zentrale Wirkungshebel")}</div><div class="card-grid three"><article class="card"><h3 class="card-title">Leistung als Wirkung</h3><p class="card-text">Leistung wird daran gelesen, welche Zustände verbessert, stabilisiert oder geschädigt werden.</p></article><article class="card"><h3 class="card-title">Maschinenleistung rückkoppeln</h3><p class="card-text">Automatisierte Wertschöpfung kann Sicherung, Weiterbildung, Beteiligung und Wirkungsfonds mittragen.</p></article><article class="card"><h3 class="card-title">Wirkungseinkommen</h3><p class="card-text">Einkommen wird als Mischung aus Grundsicherheit, Marktanteil, Wirkungsbonus und Fondsanteil modellhaft lesbar.</p></article></div></section>
  <section class="section" aria-labelledby="politik"><div class="card"><p class="hero-kicker">Politische Anschlussfähigkeit</p>${h2("politik", "Was muss Politik hier klären?")}<p>Politik muss Übergangsschutz, Sozialfinanzierung, Datenqualität, Mitbestimmung, KMU-Tauglichkeit, Rechtsschutz und demokratische Kontrolle zusammenbringen. Die Wirkungsökonomie liefert dafür einen Bewertungsrahmen, keinen fertigen Parteibeschluss.</p></div></section>
  <section class="section" aria-labelledby="risiken"><div class="card"><p class="hero-kicker">Schutzgrenzen</p>${h2("risiken", "Risiken und Schutzgrenzen")}<p>Risiken liegen in Personen-Scoring, Scheingenauigkeit, Überwachung, ungerechten Übergängen, technokratischer Steuerung und nicht geprüften Modellannahmen. Schutz brauchen Menschenwürde, Datenschutz, Beteiligung, Einspruchsrechte und transparente Annahmen.</p></div></section>`;
}

function detailReadingOutro(b, slugName, detailDoc, dossierDoc) {
  return `<section class="section" id="materialien" aria-labelledby="materialien-title"><div class="section-header"><p class="hero-kicker">Materialien</p>${h2("materialien-title", "Materialien und Downloads")}</div><div class="card-grid three"><article class="card"><h3 class="card-title">Dossier lesen</h3><p class="card-text">Das Dossier dokumentiert Anwendung, Annahmen, Datenlogik und Beispiele auf einer eigenen Seite.</p><div class="portal-card-actions"><a class="text-link" href="${href(b, `wirkungsfelder/arbeit-einkommen/${slugName}/dossier/`)}">Dossier lesen</a></div></article>${exists(`assets/downloads/${detailDoc}`) ? `<article class="card"><h3 class="card-title">Detailkonzept herunterladen</h3><p class="card-text">Ergänzende Exportfassung für Druck und Weiterarbeit.</p><div class="portal-card-actions"><a class="text-link" href="${href(b, `assets/downloads/${detailDoc}`)}">Herunterladen</a></div></article>` : ""}${exists(`assets/downloads/${dossierDoc}`) ? `<article class="card"><h3 class="card-title">Dossier herunterladen</h3><p class="card-text">Ergänzende Exportfassung für Druck und Weiterarbeit.</p><div class="portal-card-actions"><a class="text-link" href="${href(b, `assets/downloads/${dossierDoc}`)}">Herunterladen</a></div></article>` : ""}</div></section>
  <section class="section" aria-labelledby="transparenz"><div class="meta-box"><h2 id="transparenz">Dokumentstand und Transparenz</h2><p>Stand: Mai 2026. Modellhafte Arbeitsfassung der Wirkungsökonomie. Autorin: Natalie Weber. Diese Seite ist keine amtliche Bewertung und keine Rechts-, Steuer- oder Sozialberatung.</p></div></section>`;
}
function sdgBadge(b, label, index) {
  const [id, url, text] = sdgRefs[label] || [slug(label), "verstehen/sdgs-sdgplus/", `${label} im SDG-/SDG+-Referenzrahmen der Wirkungsökonomie.`];
  const popover = `sdg-popover-${id}-arbeit-${index}`;
  return `<span class="sdg-ref" data-sdg-id="${esc(id)}"><a class="sdg-ref-link" href="${href(b, url)}" aria-label="${esc(label)}: ${esc(text)}" aria-describedby="${esc(popover)}">${esc(label)}</a><button class="sdg-ref-info" type="button" aria-label="Kurzbeschreibung zu ${esc(label)}: ${esc(text)}" aria-describedby="${esc(popover)}">i</button><span class="sdg-ref-popover" id="${esc(popover)}" role="tooltip">${esc(text)} <span class="sdg-ref-more">Details öffnen</span></span></span>`;
}
function referenceBlock(b) {
  return `<section class="section" aria-labelledby="sdg-ref"><div class="portal-reference-block"><p class="hero-kicker">Referenzrahmen</p>${h2("sdg-ref", "SDG-/SDG+-Bezug")}<div class="model-strip">${[...sdgs, ...sdgPlus].map((label, index) => sdgBadge(b, label, index)).join("")}</div><p>SDG+ ist keine offizielle UN-Kategorie, sondern eine transparente Erweiterung der Wirkungsökonomie für Demokratie, Rechtsstaatlichkeit, digitale Selbstbestimmung, institutionelles Vertrauen und gesellschaftlichen Zusammenhalt.</p><a class="text-link" href="${href(b, "verstehen/sdgs-sdgplus/")}">Alle SDGs und SDG+ im Referenzrahmen ansehen</a></div></section>`;
}
function political() {
  const rows = [
    ["Aufgabe der Politik", "Sozial- und Steuerbasis über menschliche Erwerbsarbeit hinaus erweitern und Automatisierungsgewinne rückkoppeln."],
    ["Politische Rahmenbedingungen", "WStG, WEstG, Maschinenwertschöpfungsbeitrag, Wirkungsfonds, Datenschutz, Mitbestimmung, Weiterbildung und Rechtsschutz schaffen."],
    ["Ausgestaltungsspielraum", "Unterschiedliche demokratische Wege bleiben möglich: marktbasiert, sozialstaatlich, kommunal, fondsorientiert, unternehmensbezogen, gewerkschaftlich oder bürgerzentriert."],
    ["Zielkonflikte", "Innovation, Sozialbeitrag, Datenschutz, Bürokratie, Wettbewerbsfähigkeit, Beschäftigungsschutz und Produktivitätsgewinne müssen offen abgewogen werden."],
    ["Rollenverteilung", "EU, Bund, Länder, Kommunen, Unternehmen, Gewerkschaften, Sozialversicherung, Wissenschaft und Zivilgesellschaft tragen je eigene Verantwortung."],
    ["Übergang und Schutz", "Pilotmodelle, Härtefallregeln, Transformationskonten, KMU-Schutz, Schutz vor Personen-Scoring und klare Rechtswege sichern den Übergang."],
    ["Evaluation und Korrektur", "Wirkungsberichte, Beitragslückenmonitoring, Automatisierungsmonitor, öffentliche Konsultation und Wirkungsrat halten das System lernfähig."],
    ["Schutz vor Technokratie", "Wirkungsdaten bereiten Entscheidungen vor, ersetzen sie aber nicht. Normative Entscheidungen bleiben demokratisch legitimiert."],
  ];
  return `<section class="section" aria-labelledby="politik"><div class="section-header"><p class="hero-kicker">Demokratische Umsetzung</p>${h2("politik", "Politische Anschlussfähigkeit und Umsetzungsoptionen")}<p>Die folgenden politischen Anforderungen beschreiben keinen fertigen Parteibeschluss. Sie markieren den notwendigen Rahmen, damit Arbeit, Einkommen und Automatisierung demokratisch, rechtsstaatlich und praktisch umgesetzt werden können.</p></div><div class="table-wrap"><table class="data-table"><tbody>${rows.map(([a, c]) => `<tr><th scope="row">${esc(a)}</th><td>${esc(c)}</td></tr>`).join("")}</tbody></table></div></section>`;
}
function bookBlock(b) {
  return `<section class="section" aria-labelledby="buch"><div class="section-header"><p class="hero-kicker">Online-Buch</p>${h2("buch", "Anker im Online-Buch")}</div><div class="model-strip">${bookAnchors.map(([label, url]) => `<a href="${href(b, url)}">${esc(label)}</a>`).join("")}</div></section>`;
}
function sourceBlock() {
  return `<section class="section" aria-labelledby="quellen"><div class="card"><p class="hero-kicker">Quellen</p>${h2("quellen", "Datenquellen und Annahmen")}<p>Modellwerte sind Arbeitsannahmen und keine amtliche Steuer-, Rechts- oder Sozialberatung. Externe Quellen öffnen in einem neuen Tab.</p><div class="model-strip">${sources.map(([label, url]) => `<a class="text-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} <span class="sr-only">(externe Quelle)</span></a>`).join("")}</div></div></section>`;
}
function toolRefs(b) {
  return `<section class="section" aria-labelledby="tools"><div class="section-header"><p class="hero-kicker">Kontext-Werkzeuge</p>${h2("tools", "Werkzeuge in diesem Bereich")}</div>${cards(b, tools)}</section>`;
}
function crossLinks(b) {
  const links = [
    ["Staat, Recht & Demokratie", "", "WStG, WEstG, Wirkungshaushalt und Wirkungsrat als Rechts- und Institutionenrahmen.", "wirkungsfelder/staat-recht-demokratie/"],
    ["Wirtschaft & Unternehmen", "", "Automatisierung, Mitbestimmung, Finanzmarktanforderungen und Unternehmenswirkung.", "wirkungsfelder/wirtschaft-unternehmen/"],
    ["Rente & soziale Sicherung", "", "Wirkungsrente, Lebensleistung und soziale Sicherung jenseits reiner Beitragsbiografie.", "wirkungsfelder/rente-soziale-sicherung/"],
    ["Finanzsystem & Kapital", "", "Wirkungsfonds, Kapitalwirkung, Automatisierungsdividende und Finanzierbarkeit.", "wirkungsfelder/finanzsystem-kapital/finanzierbarkeit-wirkungsfonds/"],
  ];
  return `<section class="section" aria-labelledby="vernetzung"><div class="section-header"><p class="hero-kicker">Vernetzung</p>${h2("vernetzung", "Querverlinkungen")}</div>${cards(b, links)}</section>`;
}

function portal() {
  const conceptCards = [
    ["Arbeit, Einkommen und Wirkung", "Konzept", "Arbeit ist nicht automatisch Wirkung. Einkommen beweist nicht automatisch Leistung. Sichtbar wird, welche Tätigkeiten Zustände wirklich verbessern.", "wirkungsfelder/arbeit-einkommen/arbeit-einkommen-wirkung/"],
    ["Automatisierung und Maschinenleistung", "Konzept", "Automatisierung ersetzt Tätigkeiten, aber nicht zwingend Wertschöpfung. Entscheidend ist, wie Produktivitätsgewinne rückgekoppelt werden.", "wirkungsfelder/arbeit-einkommen/automatisierung-maschinenleistung/"],
    ["Sozialabgaben entkoppeln", "Konzept", "Soziale Sicherung darf nicht nur an menschlicher Lohnarbeit hängen, wenn Maschinen und KI einen wachsenden Teil der Wertschöpfung übernehmen.", "wirkungsfelder/arbeit-einkommen/sozialabgaben-entkoppeln/"],
    ["Wirkungseinkommen", "Konzept", "Einkommen kann aus Grundsicherheit, Markteinkommen, Wirkungsbonus und Fondsanteil zusammengedacht werden.", "wirkungsfelder/arbeit-einkommen/wirkungseinkommen/"],
    ["Wirkungsfonds und Automatisierungsdividende", "Konzept", "Automatisierungsüberschüsse und negative Wirkung können in Fonds zurückfließen, die Weiterbildung, Care und soziale Stabilität finanzieren.", "wirkungsfelder/arbeit-einkommen/wirkungsfonds-dividende/"],
    ["Care, Bildung, Ehrenamt und Gemeinwesen", "Konzept", "Unbezahlte oder unterbezahlte Wirkleistungen werden sichtbar, ohne Menschen zu überwachen oder zu bewerten.", "wirkungsfelder/arbeit-einkommen/care-bildung-ehrenamt/"],
  ];
  const whyCards = [
    ["Arbeit finanziert mehr als Lohn", "Aus Erwerbsarbeit entstehen Einkommen, Sozialbeiträge, Rentenansprüche, Status und Teilhabe. Wenn diese Basis schrumpft, betrifft das das ganze System."],
    ["Automatisierung verschiebt Wertschöpfung", "KI und Maschinen können Produktivität erhalten oder steigern, während Lohnsumme und klassische Beitragsbasis sinken."],
    ["Wirkleistung bleibt oft unsichtbar", "Care, Bildung, Ehrenamt, Weiterbildung und Stabilisierung erzeugen gesellschaftliche Wirkung, erscheinen aber häufig nicht als Einkommen oder Investition."],
  ];
  const policyCards = [
    ["Rahmen schaffen", "Automatisierung, Maschinenwertschöpfung, Wirkungseinkommen und Wirkungsfonds rechtlich und demokratisch gestaltbar machen."],
    ["Finanzierung an Wirkung koppeln", "Sozialfinanzierung nicht allein über Lohnarbeit organisieren, sondern Wertschöpfung, Wirkung und Transformationsschutz berücksichtigen."],
    ["Datenzugang und Datenschutz sichern", "Arbeitsmarkt-, Automatisierungs- und Wirkungsdaten nutzen, ohne Personen-Scoring, Überwachung oder Diskriminierung zu erzeugen."],
    ["Piloträume ermöglichen", "Kommunen, Branchen, Sozialversicherungen und Unternehmen mit klaren Schutzregeln erproben lassen."],
    ["Evaluation und Korrektur festlegen", "Beitragslücken, Verdrängung, Weiterbildung und Fondslogik regelmäßig prüfen und demokratisch korrigieren."],
    ["Grundrechte schützen", "Wirkungsdaten bereiten Entscheidungen vor, ersetzen aber keine Mitbestimmung, keinen Rechtsschutz und keine politische Verantwortung."],
  ];
  page({
    rel: "wirkungsfelder/arbeit-einkommen/index.html",
    title: "Arbeit & Einkommen | Automatisierung und Wirkungseinkommen",
    description: "Arbeit, Einkommen, Automatisierung, Maschinenleistung, Wirkungseinkommen, Sozialabgaben-Entkopplung und Wirkungsfonds wirkungsökonomisch einordnen.",
    body: (b) => `<section class="hero portal-hero"><div class="hero-grid"><div><nav class="breadcrumb"><a href="${b}index.html">Start</a> / <a href="${b}wirkungsfelder/">Wirkungsfelder</a></nav><p class="hero-kicker">Wirkungsfeld</p><h1>Arbeit & Einkommen</h1><p class="hero-subtitle">Automatisierung, Maschinenleistung, Wirkungseinkommen und soziale Sicherung neu rückkoppeln.</p><p>Die alte Ordnung koppelt Einkommen, soziale Sicherung, Renten und staatliche Finanzierung stark an menschliche Erwerbsarbeit. KI, Robotik, Plattformen und Automatisierung verändern diese Grundlage. Die Wirkungsökonomie fragt, wie Wertschöpfung, Teilhabe und soziale Sicherung neu rückgekoppelt werden können.</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="${href(b, "erleben/automatisierungs-wirkungseinkommensrechner/")}">Rechner nutzen</a></div></div><aside class="card"><p class="card-kicker">Leitsatz</p><h2 class="card-title">Nicht die Maschine ist das Problem.</h2><p class="card-text">Das Problem ist eine Ordnung, die soziale Sicherung fast nur an menschlicher Arbeit festmacht.</p></aside></div></section>
<section class="section" aria-labelledby="warum-wichtig"><div class="section-header"><p class="hero-kicker">Warum wichtig?</p>${h2("warum-wichtig", "Warum Arbeit und Einkommen ein Wirkungsfeld sind")}<p>Arbeit, Einkommen und Automatisierung entscheiden darüber, ob Produktivität in Teilhabe, Sicherheit und Zukunftsfähigkeit übersetzt wird.</p></div><div class="card-grid three">${whyCards.map(([title, text]) => `<article class="card"><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(text)}</p></article>`).join("")}</div></section>
<section class="section" aria-labelledby="alte-logik"><div class="section-header"><p class="hero-kicker">Systemwechsel</p>${h2("alte-logik", "Alte Logik vs. WÖk-Logik")}</div><div class="comparison-grid"><article class="card"><p class="card-kicker">Alte Logik</p><ul><li>Arbeit wird vor allem als Erwerbsarbeit gezählt.</li><li>Soziale Sicherung hängt an Lohnsumme und Beiträgen.</li><li>Automatisierung erscheint als Effizienz- oder Jobrisiko.</li><li>Care, Bildung und Gemeinwesen bleiben oft unterbewertet.</li><li>Kapital- und Maschinenwertschöpfung tragen weniger direkt zur Sozialbasis bei.</li></ul></article><article class="card"><p class="card-kicker">WÖk-Logik</p><ul><li>Entscheidend ist die tatsächliche Zustandsveränderung.</li><li>Wertschöpfung wird mit Wirkung und sozialer Stabilität rückgekoppelt.</li><li>Automatisierung wird nach Verdrängung, Entlastung und Beteiligung unterschieden.</li><li>Wirkleistung wird sichtbar, ohne Personen zu bewerten.</li><li>Fonds, Boni und Beiträge können Produktivitätsgewinne gesellschaftlich zurückführen.</li></ul></article></div></section>
<section class="section" aria-labelledby="konzepte"><div class="section-header"><p class="hero-kicker">Zentrale Konzepte</p>${h2("konzepte", "Konzepte kurz erklärt")}<p>Diese Konzepte sind Einstiege. Die Langfassungen stehen unten als Arbeitsmaterial und auf eigenen Vertiefungsseiten.</p></div>${cards(b, conceptCards, "Konzept lesen")}</section>
<section class="section" aria-labelledby="politik"><div class="section-header"><p class="hero-kicker">Umsetzung</p>${h2("politik", "Was muss Politik hier tun?")}<p>Politik muss einen Rahmen schaffen, der Automatisierung ermöglicht, soziale Sicherung stabilisiert und Menschen vor Überwachung oder Personenbewertung schützt.</p></div><div class="card-grid three">${policyCards.map(([title, text]) => `<article class="card"><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(text)}</p></article>`).join("")}</div></section>
${toolRefs(b)}${referenceBlock(b)}<section class="section" aria-labelledby="unterbereiche"><div class="section-header"><p class="hero-kicker">Vertiefende Unterbereiche</p>${h2("unterbereiche", "Vertiefungen lesen")}</div>${cards(b, pages.map(([slug, title, text]) => [title, "Vertiefung", text, `wirkungsfelder/arbeit-einkommen/${slug}/`, "Vertiefung lesen"]))}</section>${crossLinks(b)}${bookBlock(b)}${sourceBlock()}<section class="section" aria-labelledby="arbeitsmaterial"><div class="section-header"><p class="hero-kicker">Arbeitsmaterial</p>${h2("arbeitsmaterial", "Vertiefung und Arbeitsmaterial")}<p>Für längere Onlinefassungen, Konzeptpapier, Dossiers und ergänzende Materialien.</p></div>${cards(b, [["Konzeptpapier", "Onlinefassung", "Grundlogik des Wirkungsfelds Arbeit & Einkommen.", "wirkungsfelder/arbeit-einkommen/konzeptpapier/", "Onlinefassung lesen"], ["Gesamtdossier", "Dossier", "Arbeitsdossier mit Modelllogik, Annahmen, Quellen und Umsetzungspfaden.", "wirkungsfelder/arbeit-einkommen/gesamtdossier/", "Dossier lesen"], ["Detailkonzepte", "Vertiefung", "Langfassung der Detailkonzepte für die Unterbereiche.", "wirkungsfelder/arbeit-einkommen/detailkonzepte/", "Konzept lesen"], ["Einzeldossiers", "Dossier", "Einzeldossiers mit Praxisfragen, Bewertungslogik und Grenzen.", "wirkungsfelder/arbeit-einkommen/dossiers/", "Dossier lesen"]])}</section>${downloads(b, ["woek_arbeit_einkommen_automatisierung_konzeptpapier_v0_1.docx", "woek_arbeit_einkommen_automatisierung_gesamtdossier_v0_1.docx", "woek_arbeit_einkommen_detailkonzepte_umfangreich_v0_1.docx", "woek_arbeit_einkommen_einzeldossier_set_v0_1.docx"])}`,
  });
}

function topicPage(item) {
  const [slugName, title, summary, detailMd, dossierMd, detailDoc, dossierDoc] = item;
  const detail = mdToHtml(read(`${SRC}/${detailMd}`), "detail-");
  const dossier = mdToHtml(read(`${SRC}/${dossierMd}`), "dossier-");
  page({
    rel: `wirkungsfelder/arbeit-einkommen/${slugName}/index.html`,
    title: `${title} | Arbeit & Einkommen`,
    description: summary,
    body: (b) => `<section class="hero portal-hero"><div class="hero-content"><nav class="breadcrumb"><a href="${b}index.html">Start</a> / <a href="${b}wirkungsfelder/arbeit-einkommen/">Arbeit & Einkommen</a></nav><p class="hero-kicker">Detailkonzept</p><h1>${esc(title)}</h1><p class="hero-subtitle">${esc(summary)}</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="#detailkonzept">Konzept lesen</a><a class="btn btn-secondary" href="#materialien">Materialien</a></div></div></section>${toc(detail.toc)}${detailReadingIntro(b, slugName, title, summary, detailDoc, dossierDoc)}<section class="section" aria-labelledby="detailkonzept"><div class="prose"><p class="hero-kicker">Detailkonzept</p>${h2("detailkonzept", title)} ${articleFromFirstHeading(detail.html, "detail-leitfrage")}</div></section>${toolRefs(b)}${crossLinks(b)}${referenceBlock(b)}${bookBlock(b)}${sourceBlock()}${detailReadingOutro(b, slugName, detailDoc, dossierDoc)}`,
  });
  page({
    rel: `wirkungsfelder/arbeit-einkommen/${slugName}/dossier/index.html`,
    title: `${title} | Dossier`,
    description: `Dossier zu ${title}: Anwendung, Annahmen, Datenlogik, Grenzen und Anschlussstellen.`,
    section: "Wirkungsfelder",
    type: "Dossier",
    body: (b) => `<section class="hero portal-hero"><div class="hero-content"><nav class="breadcrumb"><a href="${b}index.html">Start</a> / <a href="${b}wirkungsfelder/arbeit-einkommen/">Arbeit & Einkommen</a> / <a href="${b}wirkungsfelder/arbeit-einkommen/${slugName}/">${esc(title)}</a></nav><p class="hero-kicker">Dossier</p><h1>${esc(title)}: Dossier</h1><p class="hero-subtitle">Anwendung, Annahmen, Datenlogik, Grenzen und Anschlussstellen.</p><div class="hero-actions no-print"><a class="btn btn-primary" href="${b}wirkungsfelder/arbeit-einkommen/${slugName}/">Detailkonzept lesen</a>${exists(`assets/downloads/${dossierDoc}`) ? `<a class="btn btn-secondary" href="${href(b, `assets/downloads/${dossierDoc}`)}">Dossier herunterladen</a>` : ""}</div></div></section>${toc(dossier.toc)}<section class="section" aria-labelledby="dossier"><div class="prose"><p class="hero-kicker">Dossier</p>${h2("dossier", "Dossier lesen")} ${articleFromFirstHeading(dossier.html, "dossier-kurzfassung")}</div></section><section class="section" aria-labelledby="transparenz"><div class="meta-box"><h2 id="transparenz">Dokumentstand und Transparenz</h2><p>Stand: Mai 2026. Modellhafte Arbeitsfassung der Wirkungsökonomie. Autorin: Natalie Weber. Diese Seite ist keine amtliche Bewertung und keine Rechts-, Steuer- oder Sozialberatung.</p></div></section>${toolRefs(b)}${referenceBlock(b)}${sourceBlock()}`,
  });
}

function toolPage([slugName, title, type, summary]) {
  const rel = slugName === "automatisierungs-wirkungseinkommensrechner" ? `erleben/${slugName}/index.html` : `werkzeuge/${slugName}/index.html`;
  const isCalculator = slugName === "automatisierungs-wirkungseinkommensrechner";
  page({
    rel,
    title: `${title} | Wirkungsökonomie`,
    description: summary,
    section: isCalculator ? "Erleben" : "Werkzeuge",
    type: isCalculator ? "Interaktiver Rechner" : "Methodenseite",
    body: (b) => isCalculator
      ? `<section class="hero portal-hero"><div class="hero-content"><nav class="breadcrumb"><a href="${b}index.html">Start</a> / <a href="${b}wirkungsfelder/arbeit-einkommen/">Arbeit & Einkommen</a></nav><p class="hero-kicker">Interaktiver Rechner</p><h1>${esc(title)}</h1><p class="hero-subtitle">Diese Demo zeigt modellhaft, wie Automatisierung die alte Kette Arbeit - Einkommen - Sozialbeiträge belastet und wie eine wirkungsökonomische Rückkopplung aussehen könnte.</p><p class="scanner-notice">Modellhafte Demonstration. Keine amtliche Einstufung. Keine Rechts-, Steuer- oder Sozialberatung. Keine Personenbewertung.</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="#rechner">Rechner nutzen</a></div></div></section>${automationIntro()}${automationCalculator(b)}${crossLinks(b)}${political()}${referenceBlock(b)}${bookBlock(b)}${sourceBlock()}${downloads(b, ["woek_arbeit_einkommen_automatisierung_konzeptpapier_v0_1.docx"])}`
      : `<section class="hero portal-hero"><div class="hero-content"><nav class="breadcrumb"><a href="${b}index.html">Start</a> / <a href="${b}wirkungsfelder/arbeit-einkommen/">Arbeit & Einkommen</a></nav><p class="hero-kicker">Methodenseite</p><h1>${esc(title)}</h1><p class="hero-subtitle">${esc(summary)}</p><p class="scanner-notice">Methodische Einordnung. Keine amtliche Einstufung. Keine Rechts-, Steuer- oder Sozialberatung. Keine Personenbewertung.</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="#methodik">Methodik lesen</a></div></div></section>${methodToolPage(title, summary)}${crossLinks(b)}${political()}${referenceBlock(b)}${bookBlock(b)}${sourceBlock()}${downloads(b, ["woek_arbeit_einkommen_automatisierung_konzeptpapier_v0_1.docx"])}`,
  });
}

function documentPage([slugName, title, mdFile, docFile, summary]) {
  const content = mdToHtml(read(`${SRC}/${mdFile}`), "doc-");
  page({
    rel: `wirkungsfelder/arbeit-einkommen/${slugName}/index.html`,
    title: `${title} | Arbeit & Einkommen`,
    description: summary,
    type: "Online-Volltext",
    body: (b) => `<section class="hero portal-hero"><div class="hero-content"><nav class="breadcrumb"><a href="${b}index.html">Start</a> / <a href="${b}wirkungsfelder/arbeit-einkommen/">Arbeit & Einkommen</a></nav><p class="hero-kicker">Online-Volltext</p><h1>${esc(title)}</h1><p class="hero-subtitle">${esc(summary)}</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="#volltext">Online lesen</a>${exists(`assets/downloads/${docFile}`) ? `<a class="btn btn-secondary" href="${href(b, `assets/downloads/${docFile}`)}">${esc(downloadLabels[docFile] || "Download")}</a>` : ""}</div></div></section>${toc(content.toc)}<section class="section" id="publikationszugang" aria-labelledby="publikationszugang-title"><div class="download-card"><div><p class="card-kicker">Zitierfähig</p>${h2("publikationszugang-title", "Online lesen, gezielt zitieren")}<p class="card-text">Diese Fassung ist vollständig online lesbar. Abschnittsanker können direkt zitiert werden; die Word-Datei bleibt Export- und Archivfassung.</p></div><div class="portal-card-actions no-print"><a class="btn btn-primary" href="#volltext">Zum Volltext</a>${exists(`assets/downloads/${docFile}`) ? `<a class="btn btn-secondary" href="${href(b, `assets/downloads/${docFile}`)}">${esc(downloadLabels[docFile] || "Download")}</a>` : ""}</div></div></section><section class="section" aria-labelledby="volltext"><div class="prose"><p class="hero-kicker">Arbeit & Einkommen</p>${h2("volltext", `${title} online lesen`)}${content.html}</div></section><section class="section" aria-labelledby="unterbereiche"><div class="section-header"><p class="hero-kicker">Vertiefungen</p>${h2("unterbereiche", "Unterbereiche mit Detailkonzept und Dossier")}</div>${cards(b, pages.map(([slug, pageTitle, text]) => [pageTitle, "Unterbereich", text, `wirkungsfelder/arbeit-einkommen/${slug}/`]))}</section>${toolRefs(b)}${crossLinks(b)}${political()}${referenceBlock(b)}${bookBlock(b)}${sourceBlock()}${downloads(b, [docFile])}`,
  });
}

function toolDemo(b, slugName) {
  if (slugName !== "automatisierungs-wirkungseinkommensrechner") return `<section class="section"><div class="card"><p class="hero-kicker">Methodik</p><h2>Erklärseite</h2><p>Diese Seite ordnet die Methode ein und verweist auf nutzbare Demos, sobald eine Bedienoberfläche vorhanden ist.</p></div></section>`;
  return `<section class="section" aria-labelledby="rechner"><div class="section-header"><p class="hero-kicker">Modellhafte Demo</p>${h2("rechner", "Automatisierungs- und Wirkungseinkommensrechner")}</div><div class="table-wrap"><table class="data-table"><tbody><tr><th>Beitragslückenrechner</th><td>Beschäftigte, umgerechnet auf Vollzeitstellen, Bruttolohn, Sozialbeiträge und Automatisierungsquote zeigen modellhaft die wegfallende Lohnsumme.</td></tr><tr><th>Maschinenwertschöpfungsbeitrag</th><td>Automatisierte Wertschöpfung × Rückkopplungsquote × Wirkungsfaktor-Anpassung.</td></tr><tr><th>Transformationsbonus</th><td>Weiterbildung, interne Versetzung, Arbeitszeitmodelle und regionale Stabilisierung können entlastend wirken.</td></tr><tr><th>Wirkungseinkommensmodell</th><td>Grunddividende, Markteinkommen, Wirkungsbonus und Fondsanteil werden als Einkommensarchitektur sichtbar.</td></tr></tbody></table></div></section>`;
}

function methodToolPage(title, summary) {
  return `<section class="section" id="methodik" aria-labelledby="methodik-title">
    <div class="section-header">
      <p class="hero-kicker">Methodik</p>
      ${h2("methodik-title", `${title} verstehen`)}
      <p>${esc(summary)} Diese Seite beschreibt den methodischen Zusammenhang und verweist auf den interaktiven Automatisierungs- und Wirkungseinkommensrechner.</p>
    </div>
    <div class="card-grid three">
      <article class="card"><h3 class="card-title">Was wird betrachtet?</h3><p class="card-text">Automatisierte Wertschöpfung, Lohnsummenwirkung, Sozialfinanzierung, Transformationsschutz und Fondslogik werden als Systemzusammenhang gelesen.</p></article>
      <article class="card"><h3 class="card-title">Was entscheidet die Seite nicht?</h3><p class="card-text">Sie berechnet keine amtlichen Beiträge, keine Steuerlast, keine Unternehmensbewertung und keine personenbezogene Einstufung.</p></article>
      <article class="card"><h3 class="card-title">Wie weiter?</h3><p class="card-text">Für eine modellhafte Berechnung steht der Rechner als Demo bereit; rechtliche und politische Ausgestaltung bleiben demokratische Aufgabe.</p></article>
    </div>
    <div class="portal-card-actions no-print">
      <a class="btn btn-primary" href="../../erleben/automatisierungs-wirkungseinkommensrechner/">Rechner nutzen</a>
    </div>
  </section>`;
}

function termTip(label, text) {
  return `<span class="inline-help" tabindex="0" aria-label="${esc(`${label}: ${text}`)}" data-help="${esc(text)}">${esc(label)}</span>`;
}

function automationIntro() {
  const contributionGap = termTip("Beitragslücke", "Die modellhafte Lücke, die entsteht, wenn Lohnsumme und damit Sozialbeiträge wegfallen.");
  const machineContribution = termTip("Maschinenwertschöpfungsbeitrag", "Ein modellhafter Beitrag aus automatisierter Wertschöpfung, der soziale Sicherung, Weiterbildung oder Fonds stabilisieren könnte.");
  const feedbackRate = termTip("Rückkopplungsquote", "Der Anteil automatisierter Wertschöpfung, der in soziale Sicherung oder Wirkungsfonds zurückgeführt wird.");
  const impactFactor = termTip("Wirkungsfaktor", "Ein Zu- oder Abschlag, der zeigt, ob Automatisierung eher entlastet, neutral wirkt, verdrängt oder extraktiv ist.");
  const transformationBonus = termTip("Transformationsbonus", "Eine modellhafte Entlastung, wenn Unternehmen Weiterbildung, Versetzung, Arbeitszeitmodelle oder faire Beteiligung ermöglichen.");
  const impactIncome = termTip("Wirkungseinkommen", "Ein Einkommensmodell aus Grundsicherheit, Markteinkommen, Wirkungsbonus und Fondsanteil.");
  const impactFund = termTip("Wirkungsfonds", "Ein Fonds, der Rückflüsse aus Wertschöpfung in Bildung, Sicherung, Weiterbildung und Transformation lenken könnte.");

  return `<section class="section automation-explainer" data-static-tool-intro="automation-income" aria-labelledby="warum-rechner">
    <div class="prose">
      ${h2("warum-rechner", "Warum dieser Rechner?")}
      <p>Unser heutiges Sozialsystem hängt stark an menschlicher Erwerbsarbeit. Aus Löhnen entstehen Einkommensteuer, Sozialbeiträge und Rentenansprüche. Wenn Automatisierung menschliche Arbeit ersetzt, verschwindet nicht unbedingt Wertschöpfung. Aber ein Teil der alten Finanzierungsbasis bricht weg.</p>
      <p><strong>Die zentrale Frage lautet deshalb:</strong> Wenn Maschinen, KI und Automatisierung produktiver werden, wie bleibt gesellschaftliche Teilhabe, Einkommen und soziale Sicherung finanzierbar?</p>

      ${h2("was-macht-woek-anders", "Was macht die Wirkungsökonomie anders?")}
      <p>Die Wirkungsökonomie koppelt Einkommen und soziale Sicherung nicht nur an Erwerbsarbeit, sondern an Wirkung und Wertschöpfung. Automatisierungsgewinne würden nicht einfach vollständig beim Kapital verbleiben, sondern teilweise in eine gesellschaftliche Rückkopplung fließen: etwa über ${machineContribution}, Wirkungssteuer, ${transformationBonus} oder ein ${impactIncome}.</p>
      <p><strong>Wichtig:</strong> Das Tool erzeugt kein Geld. Es zeigt modellhaft, wie bestehende und neue Wertschöpfung anders verteilt und rückgekoppelt werden könnte.</p>
    </div>

    <div class="section-header">
      ${h2("woher-kommt-das-geld", "Woher kommt das Geld?")}
      <p>Das Schaubild zeigt den Unterschied zwischen alter Sozialfinanzierung, Automatisierungsbruch und wirkungsökonomischer Rückkopplung.</p>
    </div>
    <figure class="system-visual">
    <div class="system-flow-diagram" role="img" aria-label="Altes System vs. WÖk-System">
      <article class="flow-lane">
        <p class="card-kicker">Alte Logik</p>
        <h3>Menschliche Arbeit trägt Sicherung</h3>
        <div class="flow-steps">
          <span>Menschliche Arbeit</span><span>Lohn</span><span>Sozialbeiträge</span><span>Rente, Gesundheit, Pflege, Arbeitslosenversicherung</span>
        </div>
      </article>
      <article class="flow-lane flow-lane-warning">
        <p class="card-kicker">Problem bei Automatisierung</p>
        <h3>Wert bleibt, Beiträge sinken</h3>
        <div class="flow-steps">
          <span>Maschine / KI ersetzt Arbeit</span><span>Lohnsumme sinkt</span><span>Sozialbeiträge sinken</span><span>${contributionGap} entsteht</span>
        </div>
      </article>
      <article class="flow-lane flow-lane-positive">
        <p class="card-kicker">WÖk-Logik</p>
        <h3>Wertschöpfung wird rückgekoppelt</h3>
        <div class="flow-steps">
          <span>Automatisierte Wertschöpfung</span><span>${machineContribution} / Wirkungssteuer / ${impactFund}</span><span>soziale Sicherung, ${impactIncome}, Weiterbildung, Transformation</span>
        </div>
      </article>
    </div>
    <figcaption>Automatisierung ist nicht das Problem. Die Rückkopplung entscheidet, ob Wertschöpfung soziale Sicherung, Weiterbildung, Wirkungsfonds und Wirkungseinkommen mitträgt.</figcaption>
    </figure>
    <div class="funding-source-box automation-money-note">
      <p class="hero-kicker">Finanzierungslogik</p>
      <h3>Woher kommt das Geld?</h3>
      <p>Aus der Wertschöpfung, die durch Automatisierung entsteht. Wenn Maschinen Arbeit ersetzen, verschwindet nicht automatisch der wirtschaftliche Nutzen. Er verschiebt sich nur: weg von Lohnarbeit hin zu Kapital- und Produktivitätsgewinnen. Die Wirkungsökonomie fragt, welcher Teil dieser Gewinne in soziale Sicherung, Weiterbildung, Transformation und Wirkungseinkommen zurückgeführt werden müsste.</p>
      <p>Je nach Ausgestaltung kann das als Steuer-, Beitrags-, Bonus-, Fonds- oder Kapitalrückkopplung gedacht werden. Negative Wirkung könnte höher belastet werden, positive Wirkung entlastet. Die Demo ist keine fertige Finanzierungszusage.</p>
    </div>

    <div class="section-header">
      ${h2("was-berechnet-das-tool", "Was berechnet das Tool?")}
      <p>Die vier Module zeigen unterschiedliche Stellen derselben Wirkungsfrage: Was fällt im alten System weg, was könnte neu rückgekoppelt werden, und wie würde soziale Abfederung sichtbar?</p>
    </div>
    <div class="card-grid four module-explainer-grid">
      <article class="card"><p class="card-kicker">1</p><h3>${contributionGap}</h3><p>Zeigt, wie viel klassische Sozialfinanzierung wegfallen könnte, wenn Lohnarbeit automatisiert wird.</p></article>
      <article class="card"><p class="card-kicker">2</p><h3>${machineContribution}</h3><p>Zeigt modellhaft, welcher Anteil automatisierter Wertschöpfung in soziale Sicherung oder Wirkungsfonds zurückgeführt werden könnte. Grundlage sind ${feedbackRate} und ${impactFactor}.</p></article>
      <article class="card"><p class="card-kicker">3</p><h3>${transformationBonus}</h3><p>Zeigt, warum nicht jede Automatisierung gleich behandelt würde. Unternehmen, die Weiterbildung, Versetzung, Arbeitszeitverkürzung oder faire Beteiligung ermöglichen, würden entlastet.</p></article>
      <article class="card"><p class="card-kicker">4</p><h3>${impactIncome}</h3><p>Zeigt, wie Einkommen aus mehreren Quellen bestehen könnte: Grundsicherung, Markteinkommen, Wirkungsbonus und Fondsanteil.</p></article>
    </div>

    <div class="prose">
      ${h2("was-bedeuten-die-ergebnisse", "Was bedeuten die Ergebnisse?")}
      <p>Die Ergebniswerte sind keine amtlichen Beträge. Sie sind Lesespuren: Sie zeigen, wo das alte System anfällig wird und wie eine Rückkopplung aus Wertschöpfung, Wirkung und Übergangsschutz aussehen könnte.</p>

      <article class="tool-special-box section" aria-label="Warum ist das besonders?">
        <p class="hero-kicker">WÖk-Unterschied</p>
        <h2 id="warum-ist-das-besonders">Warum ist das besonders?</h2>
        <p>Klassische Systeme fragen: Wie viele Menschen arbeiten, und wie hoch sind ihre Löhne? Die Wirkungsökonomie fragt zusätzlich: Welche Wertschöpfung entsteht, welche Wirkung hat sie, und wie wird sie in gesellschaftliche Stabilität zurückgeführt?</p>
        <p>Damit wird Automatisierung nicht einfach bestraft. Entscheidend ist, ob sie Menschen verdrängt, stärkt, beteiligt oder entlastet.</p>
      </article>

      ${h2("was-diese-demo-nicht-sagt", "Was diese Demo nicht sagt")}
      <p>Diese Demo ist kein fertiges Steuer- oder Sozialmodell. Sie berechnet keine amtlichen Ansprüche, keine echte Steuerlast und keine persönliche Bewertung. Sie zeigt nur die Logik einer möglichen Rückkopplung: Wenn Arbeit als Finanzierungsbasis sinkt, muss Wertschöpfung selbst stärker in Verantwortung genommen werden.</p>
    </div>
  </section>`;
}

function automationCalculator(b) {
  return `<section class="section" id="rechner" aria-labelledby="rechner-title">
    <div class="section-header">
      <p class="hero-kicker">Rechner</p>
      ${h2("rechner-title", "Automatisierung modellhaft durchrechnen")}
      <p>Alle Werte werden lokal im Browser berechnet. Es werden keine Eingaben gespeichert oder übertragen.</p>
    </div>
    <div class="hero-actions no-print">
      <button class="btn btn-primary" type="button" data-auto-example>Beispielwerte laden</button>
      <button class="btn btn-secondary" type="button" data-auto-reset>Zurücksetzen</button>
    </div>
    <div class="card-grid two" data-auto-calculator>
      <article class="card">
        <p class="card-kicker">Modul 1</p>
        <h3 class="card-title">${termTip("Beitragslücke", "Die modellhafte Lücke, die entsteht, wenn Lohnsumme und damit Sozialbeiträge wegfallen.")}</h3>
        <label>Beschäftigte, umgerechnet auf Vollzeitstellen<input type="number" min="0" step="1" value="120" data-auto-input="fte"><small class="field-help">Eine Vollzeitstelle = 1. Zwei halbe Stellen = 1. Dieser Wert ist eine Modellannahme.</small></label>
        <label>durchschnittlicher Bruttolohn pro Jahr<input type="number" min="0" step="1000" value="52000" data-auto-input="wage"></label>
        <label>Arbeitgeber-Sozialbeitrag in Prozent<input type="number" min="0" max="100" step="0.1" value="20.5" data-auto-input="employerRate"></label>
        <label>Arbeitnehmer-Sozialbeitrag in Prozent<input type="number" min="0" max="100" step="0.1" value="20.0" data-auto-input="employeeRate"></label>
        <label>erwartete Automatisierungsquote in Prozent<input type="range" min="0" max="100" step="1" value="35" data-auto-input="automationRate"></label>
        <div class="impact-kpis">
          <div class="impact-kpi"><span>Betroffene Vollzeitstellen</span><strong data-auto-result="affectedFte">42</strong></div>
          <div class="impact-kpi"><span>wegfallende Lohnsumme</span><strong data-auto-result="lostPayroll">2.184.000 €</strong></div>
          <div class="impact-kpi"><span>potenzielle Beitragslücke</span><strong data-auto-result="contributionGap">884.520 €</strong></div>
        </div>
        <p class="interpretation-note"><strong>Was bedeutet das?</strong> Dieser Wert zeigt, welcher Finanzierungsanteil im alten System gefährdet wäre, wenn Lohnarbeit wegfällt.</p>
        <p class="why-relevant"><strong>Warum relevant?</strong> Sozialstaatliche Stabilität hängt heute stark an Lohnsumme und Erwerbsarbeit.</p>
        <p class="card-text">Betroffene Sozialbereiche: Rente, Gesundheit, Pflege und Arbeitslosenversicherung.</p>
      </article>
      <article class="card">
        <p class="card-kicker">Modul 2</p>
        <h3 class="card-title">${termTip("Maschinenwertschöpfungsbeitrag", "Ein modellhafter Beitrag aus automatisierter Wertschöpfung, der soziale Sicherung, Weiterbildung oder Fonds stabilisieren könnte.")}</h3>
        <label>automatisierte Wertschöpfung pro Jahr<input type="number" min="0" step="10000" value="3800000" data-auto-input="machineValue"></label>
        <label>${termTip("Rückkopplungsquote", "Der Anteil automatisierter Wertschöpfung, der in soziale Sicherung oder Wirkungsfonds zurückgeführt wird.")} in Prozent<input type="number" min="0" max="100" step="0.1" value="6" data-auto-input="feedbackRate"></label>
        <label>${termTip("Wirkungsfaktor", "Ein Zu- oder Abschlag, der zeigt, ob Automatisierung eher entlastet, neutral wirkt, verdrängt oder extraktiv ist.")} von -3 bis +3<input type="range" min="-3" max="3" step="1" value="0" data-auto-input="impactFactor"></label>
        <div class="impact-kpis">
          <div class="impact-kpi"><span>Beitrag</span><strong data-auto-result="machineContribution">228.000 €</strong></div>
          <div class="impact-kpi"><span>Faktor</span><strong data-auto-result="impactFactorLabel">0 / Anpassung 1</strong></div>
        </div>
        <p class="card-text" data-auto-result="impactReason">Der Wirkungsfaktor verändert den Beitrag je nach Entlastung oder Belastung.</p>
        <p class="interpretation-note"><strong>Was bedeutet das?</strong> Dieser Wert zeigt, welcher Betrag modellhaft aus automatisierter Wertschöpfung zurückgeführt werden könnte.</p>
        <p class="why-relevant"><strong>Warum relevant?</strong> Produktivitätsgewinne werden als gesellschaftliche Finanzierungsfrage sichtbar, nicht nur als Kapitalrendite.</p>
      </article>
      <article class="card">
        <p class="card-kicker">Modul 3</p>
        <h3 class="card-title">${termTip("Transformationsbonus", "Eine modellhafte Entlastung, wenn Unternehmen Weiterbildung, Versetzung, Arbeitszeitmodelle oder faire Beteiligung ermöglichen.")}</h3>
        <label>Weiterbildungsquote in Prozent<input type="number" min="0" max="100" step="1" value="45" data-auto-input="trainingRate"></label>
        <label>interne Versetzungsquote in Prozent<input type="number" min="0" max="100" step="1" value="25" data-auto-input="redeploymentRate"></label>
        <label>Arbeitszeitmodell vorhanden<select data-auto-input="workingTimeModel"><option value="yes">ja</option><option value="no">nein</option></select></label>
        <label>Anteil Produktivitätsgewinn an Beschäftigte / Kund:innen / Fonds<input type="number" min="0" max="100" step="1" value="35" data-auto-input="sharedGain"></label>
        <label>regionale Stabilisierung<select data-auto-input="regionalStability"><option value="low">niedrig</option><option value="medium" selected>mittel</option><option value="high">hoch</option></select></label>
        <div class="impact-kpis">
          <div class="impact-kpi"><span>Transformationsbonus</span><strong data-auto-result="bonus">16,8 %</strong></div>
          <div class="impact-kpi"><span>reduzierter Beitrag</span><strong data-auto-result="reducedContribution">189.696 €</strong></div>
          <div class="impact-kpi"><span>Wirkungsprofil</span><strong data-auto-result="profile">neutral</strong></div>
        </div>
        <p class="interpretation-note"><strong>Was bedeutet das?</strong> Dieser Wert zeigt, ob Automatisierung sozial abgefedert wird oder eher verdrängend wirkt.</p>
        <p class="why-relevant"><strong>Warum relevant?</strong> Die WÖk unterscheidet zwischen entlastender und verdrängender Automatisierung.</p>
      </article>
      <article class="card">
        <p class="card-kicker">Modul 4</p>
        <h3 class="card-title">${termTip("Wirkungseinkommen", "Ein Einkommensmodell aus Grundsicherheit, Markteinkommen, Wirkungsbonus und Fondsanteil.")}</h3>
        <label>Grunddividende<input type="number" min="0" step="100" value="900" data-auto-input="baseDividend"></label>
        <label>Markteinkommen<input type="number" min="0" step="100" value="2400" data-auto-input="marketIncome"></label>
        <label>Wirkungsbonus<input type="number" min="0" step="50" value="250" data-auto-input="impactBonus"></label>
        <label>Fondsanteil (${termTip("Wirkungsfonds", "Ein Fonds, der Rückflüsse aus Wertschöpfung in Bildung, Sicherung, Weiterbildung und Transformation lenken könnte.")})<input type="number" min="0" step="50" value="150" data-auto-input="fundShare"></label>
        <div class="impact-kpis">
          <div class="impact-kpi"><span>Gesamteinkommen</span><strong data-auto-result="totalIncome">3.700 €</strong></div>
          <div class="impact-kpi"><span>Grundsicherheit</span><strong data-auto-result="baseShare">24,3 %</strong></div>
          <div class="impact-kpi"><span>Markt</span><strong data-auto-result="marketShare">64,9 %</strong></div>
          <div class="impact-kpi"><span>Wirkung/Fonds</span><strong data-auto-result="impactShare">10,8 %</strong></div>
        </div>
        <p class="interpretation-note"><strong>Was bedeutet das?</strong> Dieser Wert zeigt ein mögliches Einkommensmodell, das nicht nur Erwerbsarbeit berücksichtigt, sondern auch Grundsicherheit, Wirkung und gesellschaftliche Rückkopplung.</p>
        <p class="why-relevant"><strong>Warum relevant?</strong> Einkommen wird als Teilhabe-, Sicherungs- und Wirkungsfrage lesbar, nicht nur als Lohnfrage.</p>
      </article>
    </div>
  </section>
  <section class="section" aria-labelledby="annahmen">
    <details class="card" open>
      <summary><h2 id="annahmen" class="card-title">Methodik und Annahmen</h2></summary>
      <p>Die Demo nutzt lineare Modellannahmen. Beitragslücken, Rückkopplungsquoten und Boni sind keine amtlichen Werte, sondern zeigen die Logik einer möglichen Rückkopplung.</p>
      <p>Grenzen: keine Rechts-, Steuer- oder Sozialberatung, keine Personenbewertung, keine Leistungsüberwachung einzelner Beschäftigter, keine automatische Entscheidung.</p>
    </details>
  </section>
  <aside class="section related-questions-block" aria-labelledby="automation-related-title">
    <div class="section-header">
      <p class="hero-kicker">Passende Fragen</p>
      ${h2("automation-related-title", "Wirkungseinkommen und Automatisierung einordnen")}
    </div>
    <div class="related-question-grid">
      <article class="related-question-card"><span>Finanzierung</span><strong>Woher kommt das Geld?</strong><a class="text-link" href="${href(b, "fragen/#geld")}">Antwort lesen</a></article>
      <article class="related-question-card"><span>Abgrenzung</span><strong>Ist Wirkungseinkommen BGE?</strong><a class="text-link" href="${href(b, "fragen/#bge")}">Antwort lesen</a></article>
      <article class="related-question-card"><span>Anreizfrage</span><strong>Wird Automatisierung bestraft?</strong><a class="text-link" href="${href(b, "fragen/#automatisierung")}">Antwort lesen</a></article>
    </div>
  </aside>
  <script>
  (() => {
    const root = document.querySelector("[data-auto-calculator]");
    if (!root) return;
    const defaults = {
      fte: 120, wage: 52000, employerRate: 20.5, employeeRate: 20, automationRate: 35,
      machineValue: 3800000, feedbackRate: 6, impactFactor: 0,
      trainingRate: 45, redeploymentRate: 25, workingTimeModel: "yes", sharedGain: 35, regionalStability: "medium",
      baseDividend: 900, marketIncome: 2400, impactBonus: 250, fundShare: 150
    };
    const examples = { ...defaults, fte: 250, wage: 58000, automationRate: 42, machineValue: 9200000, feedbackRate: 7.5, impactFactor: 1, trainingRate: 68, redeploymentRate: 44, sharedGain: 55, regionalStability: "high", baseDividend: 1050, marketIncome: 2200, impactBonus: 420, fundShare: 260 };
    const factorMap = { "-3": 1.30, "-2": 1.20, "-1": 1.10, "0": 1.00, "1": 0.85, "2": 0.70, "3": 0.50 };
    const money = (value) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value || 0);
    const number = (value) => new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(value || 0);
    const percent = (value) => number(value) + " %";
    const input = (name) => root.querySelector("[data-auto-input=\\"" + name + "\\"]");
    const output = (name, value) => { const el = root.querySelector("[data-auto-result=\\"" + name + "\\"]"); if (el) el.textContent = value; };
    const value = (name) => {
      const el = input(name);
      if (!el) return 0;
      if (el.tagName === "SELECT") return el.value;
      return Number(el.value || 0);
    };
    const setValues = (values) => {
      Object.entries(values).forEach(([name, val]) => { const el = input(name); if (el) el.value = val; });
      calculate();
    };
    const calculate = () => {
      const affectedFte = value("fte") * value("automationRate") / 100;
      const lostPayroll = affectedFte * value("wage");
      const employerGap = lostPayroll * value("employerRate") / 100;
      const employeeGap = lostPayroll * value("employeeRate") / 100;
      const contributionGap = employerGap + employeeGap;
      const impactFactor = String(value("impactFactor"));
      const adjustment = factorMap[impactFactor] || 1;
      const machineContribution = value("machineValue") * value("feedbackRate") / 100 * adjustment;
      let bonusScore = Math.min(30, value("trainingRate") * 0.08 + value("redeploymentRate") * 0.07 + value("sharedGain") * 0.07);
      if (value("workingTimeModel") === "yes") bonusScore += 5;
      if (value("regionalStability") === "medium") bonusScore += 4;
      if (value("regionalStability") === "high") bonusScore += 8;
      bonusScore = Math.max(0, Math.min(30, bonusScore));
      const reducedContribution = machineContribution * (1 - bonusScore / 100);
      const profile = bonusScore >= 24 && Number(impactFactor) > 0 ? "entlastend" : bonusScore >= 14 ? "neutral" : Number(impactFactor) < 0 ? "extraktiv" : "verdrängend";
      const totalIncome = value("baseDividend") + value("marketIncome") + value("impactBonus") + value("fundShare");
      output("affectedFte", number(affectedFte));
      output("lostPayroll", money(lostPayroll));
      output("contributionGap", money(contributionGap));
      output("machineContribution", money(machineContribution));
      output("impactFactorLabel", impactFactor + " / Anpassung " + number(adjustment));
      output("impactReason", Number(impactFactor) < 0 ? "Negative Wirkung erhöht den Beitrag, weil Verdrängung und Folgekosten stärker rückgekoppelt werden." : Number(impactFactor) > 0 ? "Positive Wirkung senkt den Beitrag, weil Weiterbildung, Teilhabe oder Resilienz entlastend wirken." : "Neutraler Wirkungsfaktor: Die Rückkopplungsquote wird ohne Zu- oder Abschlag angewendet.");
      output("bonus", percent(bonusScore));
      output("reducedContribution", money(reducedContribution));
      output("profile", profile);
      output("totalIncome", money(totalIncome));
      output("baseShare", percent(totalIncome ? value("baseDividend") / totalIncome * 100 : 0));
      output("marketShare", percent(totalIncome ? value("marketIncome") / totalIncome * 100 : 0));
      output("impactShare", percent(totalIncome ? (value("impactBonus") + value("fundShare")) / totalIncome * 100 : 0));
    };
    root.querySelectorAll("[data-auto-input]").forEach((el) => el.addEventListener("input", calculate));
    root.querySelectorAll("[data-auto-input]").forEach((el) => el.addEventListener("change", calculate));
    document.querySelector("[data-auto-example]")?.addEventListener("click", () => setValues(examples));
    document.querySelector("[data-auto-reset]")?.addEventListener("click", () => setValues(defaults));
    calculate();
  })();
  </script>`;
}

function workLibrary() {
  page({
    rel: "werkstatt/arbeitsbibliothek/wirkungsfelder/arbeit-einkommen/index.html",
    title: "Arbeitsbibliothek Arbeit & Einkommen | Wirkungsökonomie",
    description: "Konzeptpapier, Gesamtdossier, Detailkonzepte, Einzeldossiers und Methodenmaterial zum Wirkungsfeld Arbeit & Einkommen.",
    section: "Werkstatt",
    type: "Arbeitsbibliothek",
    body: (b) => `<section class="hero portal-hero"><div class="hero-content"><nav class="breadcrumb"><a href="${b}index.html">Start</a> / <a href="${b}werkstatt/">Werkstatt</a></nav><p class="hero-kicker">Arbeitsbibliothek</p><h1>Arbeit & Einkommen</h1><p class="hero-subtitle">Konzeptpapier, Gesamtdossier, Detailkonzepte, Einzeldossiers und Methodenmaterial.</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="${href(b, "wirkungsfelder/arbeit-einkommen/")}">Zur Übersicht</a></div></div></section>${publicationAccess(b, "Dokumente online lesen")}<section class="section" aria-labelledby="docs"><div class="section-header"><p class="hero-kicker">Unterbereiche</p>${h2("docs", "Detailkonzepte und Einzeldossiers")}</div>${cards(b, pages.map(([slugName, title, summary]) => [title, "Onlinefassung", summary, `wirkungsfelder/arbeit-einkommen/${slugName}/`]))}</section>${downloads(b, ["woek_arbeit_einkommen_automatisierung_konzeptpapier_v0_1.docx", "woek_arbeit_einkommen_automatisierung_gesamtdossier_v0_1.docx", "woek_arbeit_einkommen_detailkonzepte_umfangreich_v0_1.docx", "woek_arbeit_einkommen_einzeldossier_set_v0_1.docx"])}`,
  });
}

function patchPortalLinks() {
  const patches = [
    ["wirkungsfelder/wirtschaft-unternehmen/index.html", "Arbeit & Einkommen", "Automatisierung, Maschinenleistung und Wirkungseinkommen beeinflussen Unternehmensführung, Mitbestimmung und Finanzierungsarchitektur."],
    ["wirkungsfelder/produkte-konsum/index.html", "Arbeit & Einkommen", "Produktpreise, Lieferketten und Wirkungsumsatzsteuer berühren Löhne, Sozialabgaben, Automatisierung und Kaufkraftschutz."],
    ["wirkungsfelder/wohnen-stadt/index.html", "Arbeit & Einkommen", "Wohnkosten, Sanierung und Wirkungsfonds hängen mit Einkommen, Beschäftigung, Automatisierung und sozialer Sicherung zusammen."],
    ["wirkungsfelder/staat-recht-demokratie/index.html", "Arbeit & Einkommen", "WStG, WEstG, Wirkungshaushalt und Wirkungsrat schaffen den demokratischen Rahmen für Arbeit, Einkommen und Automatisierung."],
    ["werkzeuge/impact-controlling/index.html", "Arbeit & Einkommen", "Impact Controlling bewertet Automatisierung, Qualifizierung, Maschinenleistung und soziale Rückkopplung als Transformationswirkung."],
  ];
  for (const [rel, title, text] of patches) {
    const file = path.join(ROOT, rel);
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, "utf8");
    if (html.includes('id="arbeit-einkommen-link"')) continue;
    const b = base(rel);
    const block = `<section class="section" aria-labelledby="arbeit-einkommen-link"><div class="download-card"><div><p class="card-kicker"></p>${h2("arbeit-einkommen-link", title)}<p class="card-text">${esc(text)}</p></div><a class="btn btn-secondary no-print" href="${href(b, "wirkungsfelder/arbeit-einkommen/")}">Arbeit & Einkommen öffnen</a></div></section>`;
    html = html.replace("</main>", `${block}\n    </main>`);
    fs.writeFileSync(file, html, "utf8");
  }
}

function updateSitemap() {
  const sitemap = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(sitemap)) return;
  let xml = fs.readFileSync(sitemap, "utf8");
  const urls = [
    "wirkungsfelder/arbeit-einkommen/",
    ...topDocuments.map(([slugName]) => `wirkungsfelder/arbeit-einkommen/${slugName}/`),
    ...pages.map(([slugName]) => `wirkungsfelder/arbeit-einkommen/${slugName}/`),
    "erleben/automatisierungs-wirkungseinkommensrechner/",
    "werkzeuge/wirkungsfonds/",
    "werkzeuge/maschinenwertschoepfungsbeitrag/",
    "werkzeuge/automatisierungsdividende/",
    "werkstatt/arbeitsbibliothek/wirkungsfelder/arbeit-einkommen/",
  ];
  const additions = urls.filter((url) => !xml.includes(`${SITE}/${url}`)).map((url) => `  <url>\n    <loc>${SITE}/${url}</loc>\n    <lastmod>${DATE}</lastmod>\n  </url>`).join("\n");
  if (additions) fs.writeFileSync(sitemap, xml.replace("</urlset>", `${additions}\n</urlset>`), "utf8");
}

function run() {
  portal();
  for (const item of topDocuments) documentPage(item);
  for (const item of pages) topicPage(item);
  toolPage(["automatisierungs-wirkungseinkommensrechner", "Automatisierungs- und Wirkungseinkommensrechner", "Demo", "Modellhafte Demo zu Beitragslücke, Maschinenwertschöpfungsbeitrag, Transformationsbonus und Wirkungseinkommen."]);
  toolPage(["wirkungsfonds", "Wirkungsfonds", "Werkzeug", "Fondsarchitektur für Automatisierungsdividende, Wirkungseinkommen, Bildung, Gesundheit, Wohnen, Rente und Demokratie."]);
  toolPage(["maschinenwertschoepfungsbeitrag", "Maschinenwertschöpfungsbeitrag", "Werkzeug", "Rückkopplung automatisierter Wertschöpfung in soziale Sicherung und Wirkungsfonds."]);
  toolPage(["automatisierungsdividende", "Automatisierungsdividende", "Werkzeug", "Verteilung von Produktivitätsgewinnen in Grundsicherheit, Weiterbildung, Wirkungsfonds und Transformationsschutz."]);
  workLibrary();
  patchPortalLinks();
  updateSitemap();
  console.log("Work income automation portal generated.");
}

run();
