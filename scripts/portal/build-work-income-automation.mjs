import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://wirkungsoekonomie.de";
const DATE = "2026-05-24";
const CSS_VERSION = "20260524-arbeit-einkommen-qgate";
const JS_VERSION = "20260523-nachhaltigkeit";
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
  ["dossiers", "Einzeldossier-Set", "woek_arbeit_einkommen_einzeldossier_set_v0_1.md", "woek_arbeit_einkommen_einzeldossier_set_v0_1.docx", "Einzeldossiers mit Praxisfragen, Bewertungslogik, Annahmen, Grenzen, Toolbezug und politischer Umsetzung."],
];

const downloadLabels = {
  "woek_arbeit_einkommen_automatisierung_konzeptpapier_v0_1.docx": "Konzeptpapier herunterladen",
  "woek_arbeit_einkommen_automatisierung_gesamtdossier_v0_1.docx": "Gesamtdossier herunterladen",
  "woek_arbeit_einkommen_detailkonzepte_umfangreich_v0_1.docx": "Detailkonzepte herunterladen",
  "woek_arbeit_einkommen_einzeldossier_set_v0_1.docx": "Einzeldossier-Set herunterladen",
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
    <link rel="stylesheet" href="${b}assets/css/style.css?v=${CSS_VERSION}">
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
    <script src="${b}assets/js/main.js?v=${JS_VERSION}"></script>
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
    html.push(`<p id="${id}">${esc(p.join(" ").replace(/\*\*/g, ""))} ${cite(id)}</p>`);
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
      const text = m[2].trim();
      const id = `${prefix}${slug(text)}`;
      toc.push({ level, text, id });
      html.push(`<h${level} id="${id}">${esc(text)} ${cite(id)}</h${level}>`);
    } else if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      flush();
      html.push(`<p>${esc(line.replace(/^([-*]|\d+\.)\s+/, "").replace(/\*\*/g, ""))}</p>`);
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
  return `<nav class="toc-card no-print" aria-label="Inhaltsverzeichnis"><h2 class="card-title">Inhaltsverzeichnis</h2><ol>${t.map((i) => `<li class="toc-level-${esc(i.level)}"><a href="#${esc(i.id)}">${esc(i.text)}</a></li>`).join("")}</ol></nav>`;
}
function cards(b, items) {
  return `<div class="card-grid three">${items.map(([title, type, text, url]) => `<article class="card"><p class="card-kicker">${esc(type || "Kontext")}</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(text || "")}</p><div class="portal-card-actions"><a class="text-link" href="${href(b, url)}">Öffnen</a></div></article>`).join("")}</div>`;
}
function downloads(b, files) {
  const labelForDownload = (file) => {
    if (downloadLabels[file]) return downloadLabels[file];
    if (file.startsWith("woek_detailkonzept_")) return "Detailkonzept herunterladen";
    if (file.startsWith("woek_einzeldossier_")) return "Dossier herunterladen";
    return file.replace(/^woek_/, "").replaceAll("_", " ").replace(/\.docx$/, "");
  };
  const links = files.filter(Boolean).filter((file) => exists(`assets/downloads/${file}`)).map((file) => `<a class="btn btn-secondary" href="${href(b, `assets/downloads/${file}`)}">${esc(labelForDownload(file))}</a>`);
  return `<section class="section" aria-labelledby="downloads"><div class="card"><p class="hero-kicker">Dossier & Export</p>${h2("downloads", "Downloads und Druck")}<p>Online-Volltext ist der Hauptzugang. Word-Dateien bleiben Export und Archiv.</p><div class="portal-card-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button>${links.join("")}</div></div></section>`;
}
function publicationAccess(b, heading = "Online lesen und herunterladen") {
  const items = topDocuments.map(([slugName, title, , doc, text]) => [
    title,
    "Online-Volltext",
    text,
    `wirkungsfelder/arbeit-einkommen/${slugName}/`,
  ]);
  return `<section class="section" id="publikationszugang" aria-labelledby="publikationszugang-title"><div class="section-header"><p class="hero-kicker">Publikationszugang</p>${h2("publikationszugang-title", heading)}<p>Alle zentralen Dokumente sind online lesbar und gezielt über Abschnittsanker zitierbar. Downloads bleiben ergänzende Export- und Archivfassungen.</p></div>${cards(b, items)}<div class="download-card compact no-print"><div><p class="card-kicker">Downloads</p><h3 class="card-title">Word-Export und Archiv</h3><p class="card-text">Konzeptpapier, Gesamtdossier, Detailkonzepte und Einzeldossier-Set bleiben als Dateien verfügbar.</p></div><div class="portal-card-actions">${topDocuments.map(([, , , doc]) => exists(`assets/downloads/${doc}`) ? `<a class="btn btn-secondary" href="${href(b, `assets/downloads/${doc}`)}">${esc(downloadLabels[doc] || "Download")}</a>` : "").join("")}</div></div></section>`;
}
function pagePublicationAccess(b, detailDoc, dossierDoc) {
  return `<section class="section" id="publikationszugang" aria-labelledby="publikationszugang-title"><div class="download-card"><div><p class="card-kicker">Online lesen, gezielt zitieren</p>${h2("publikationszugang-title", "Detailkonzept und Dossier")}<p class="card-text">Diese Unterseite enthält Detailkonzept und Einzeldossier vollständig online. Die Abschnittsanker können direkt zitiert werden; Downloads bleiben ergänzende Exportfassungen.</p></div><div class="portal-card-actions no-print"><a class="btn btn-primary" href="#detailkonzept">Detailkonzept online lesen</a><a class="btn btn-secondary" href="#dossier">Dossier online lesen</a>${exists(`assets/downloads/${detailDoc}`) ? `<a class="btn btn-secondary" href="${href(b, `assets/downloads/${detailDoc}`)}">Detailkonzept herunterladen</a>` : ""}${exists(`assets/downloads/${dossierDoc}`) ? `<a class="btn btn-secondary" href="${href(b, `assets/downloads/${dossierDoc}`)}">Dossier herunterladen</a>` : ""}</div></div></section>`;
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
    ["Staat, Recht & Demokratie", "Rang 3", "WStG, WEstG, Wirkungshaushalt und Wirkungsrat als Rechts- und Institutionenrahmen.", "wirkungsfelder/staat-recht-demokratie/"],
    ["Wirtschaft & Unternehmen", "Rang 4", "Automatisierung, Mitbestimmung, Finanzmarktanforderungen und Unternehmenswirkung.", "wirkungsfelder/wirtschaft-unternehmen/"],
    ["Rente & soziale Sicherung", "Rang 7", "Wirkungsrente, Lebensleistung und soziale Sicherung jenseits reiner Beitragsbiografie.", "wirkungsfelder/rente-soziale-sicherung/"],
    ["Finanzsystem & Kapital", "Rang 12", "Wirkungsfonds, Kapitalwirkung, Automatisierungsdividende und Finanzierbarkeit.", "wirkungsfelder/finanzsystem-kapital/finanzierbarkeit-wirkungsfonds/"],
  ];
  return `<section class="section" aria-labelledby="vernetzung"><div class="section-header"><p class="hero-kicker">Vernetzung</p>${h2("vernetzung", "Querverlinkungen")}</div>${cards(b, links)}</section>`;
}

function portal() {
  const intro = stripPortalOperationalSections(read(`${WEB}/website_inhalt_arbeit_einkommen_automatisierung.md`));
  const { toc: t, html } = mdToHtml(intro);
  page({
    rel: "wirkungsfelder/arbeit-einkommen/index.html",
    title: "Arbeit & Einkommen | Automatisierung und Wirkungseinkommen",
    description: "Arbeit, Einkommen, Automatisierung, Maschinenleistung, Wirkungseinkommen, Sozialabgaben-Entkopplung und Wirkungsfonds wirkungsökonomisch einordnen.",
    body: (b) => `<section class="hero portal-hero"><div class="hero-grid"><div><nav class="breadcrumb"><a href="${b}index.html">Start</a> / <a href="${b}wirkungsfelder/">Wirkungsfelder</a></nav><p class="hero-kicker">Wirkungsfeld · Rang 6</p><h1>Arbeit & Einkommen</h1><p class="hero-subtitle">Automatisierung, Maschinenleistung, Wirkungseinkommen und soziale Sicherung neu rückkoppeln.</p><p>Die alte Ordnung koppelt Einkommen, soziale Sicherung, Renten und staatliche Finanzierung an menschliche Erwerbsarbeit. KI, Robotik, Plattformen und Automatisierung verändern diese Grundlage. Die Wirkungsökonomie antwortet nicht mit Maschinenfeindschaft, sondern mit Rückkopplung.</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="${href(b, "erleben/automatisierungs-wirkungseinkommensrechner/")}">Rechner öffnen</a><a class="btn btn-secondary" href="#publikationszugang">Online lesen</a></div></div><aside class="card"><p class="card-kicker">Leitsatz</p><h2 class="card-title">Nicht die Maschine ist das Problem.</h2><p class="card-text">Das Problem ist eine Ordnung, die soziale Sicherung fast nur an menschlicher Arbeit festmacht.</p></aside></div></section>${publicationAccess(b)}${toc(t)}<section class="section" aria-labelledby="online-volltext"><div class="prose">${h2("online-volltext", "Portaltext online lesen")} ${html}</div></section><section class="section" aria-labelledby="unterbereiche"><div class="section-header"><p class="hero-kicker">Unterbereiche</p>${h2("unterbereiche", "Unterbereiche online lesen")}</div>${cards(b, pages.map(([slug, title, text]) => [title, "Detailkonzept + Dossier", text, `wirkungsfelder/arbeit-einkommen/${slug}/`]))}</section>${toolRefs(b)}${crossLinks(b)}${political()}${referenceBlock(b)}${bookBlock(b)}${sourceBlock()}${downloads(b, ["woek_arbeit_einkommen_automatisierung_konzeptpapier_v0_1.docx", "woek_arbeit_einkommen_automatisierung_gesamtdossier_v0_1.docx", "woek_arbeit_einkommen_detailkonzepte_umfangreich_v0_1.docx", "woek_arbeit_einkommen_einzeldossier_set_v0_1.docx"])}`,
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
    body: (b) => `<section class="hero portal-hero"><div class="hero-content"><nav class="breadcrumb"><a href="${b}index.html">Start</a> / <a href="${b}wirkungsfelder/arbeit-einkommen/">Arbeit & Einkommen</a></nav><p class="hero-kicker">Arbeit & Einkommen</p><h1>${esc(title)}</h1><p class="hero-subtitle">${esc(summary)}</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="#detailkonzept">Detailkonzept online lesen</a><a class="btn btn-secondary" href="#dossier">Dossier online lesen</a></div></div></section>${pagePublicationAccess(b, detailDoc, dossierDoc)}${toc([...detail.toc, ...dossier.toc])}<section class="section" aria-labelledby="kurzfassung"><div class="section-header"><p class="hero-kicker">Kurzfassung</p>${h2("kurzfassung", "Kurzfassung")}</div><div class="card-grid three"><article class="card"><h3 class="card-title">Alte Logik</h3><p class="card-text">Menschliche Erwerbsarbeit trägt Einkommen, Sozialabgaben und Status, während unbezahlte Wirkleistung und automatisierte Wertschöpfung nur teilweise sichtbar werden.</p></article><article class="card"><h3 class="card-title">Perspektivwechsel</h3><p class="card-text">Bewertet wird die tatsächliche Zustandsveränderung. Maschinenleistung, Care, Weiterbildung, Einkommen und Kapitalwirkung werden in eine gemeinsame Rückkopplung gebracht.</p></article><article class="card"><h3 class="card-title">Schutzgrenze</h3><p class="card-text">Keine Personenbewertung, keine Leistungsüberwachung einzelner Beschäftigter und keine Robotersteuer als Fortschrittsstrafe.</p></article></div></section><section class="section" aria-labelledby="detailkonzept"><div class="prose"><p class="hero-kicker">Detailkonzept</p>${h2("detailkonzept", "Detailkonzept online lesen")} ${detail.html}</div></section><section class="section" aria-labelledby="dossier"><div class="prose"><p class="hero-kicker">Dossier</p>${h2("dossier", "Dossier online lesen")} ${dossier.html}</div></section>${toolRefs(b)}${crossLinks(b)}${political()}${referenceBlock(b)}${bookBlock(b)}${sourceBlock()}${downloads(b, [detailDoc, dossierDoc])}`,
  });
}

function toolPage([slugName, title, type, summary]) {
  const rel = slugName === "automatisierungs-wirkungseinkommensrechner" ? `erleben/${slugName}/index.html` : `werkzeuge/${slugName}/index.html`;
  const spec = slugName === "automatisierungs-wirkungseinkommensrechner"
    ? mdToHtml(read(`${WEB}/tool_spezifikation_automatisierung_wirkungseinkommen_rechner.md`))
    : mdToHtml(read(`${WEB}/tool_spezifikation_wirkungseinkommen_automatisierungsdividende.md`));
  page({
    rel,
    title: `${title} | Wirkungsökonomie`,
    description: summary,
    section: slugName === "automatisierungs-wirkungseinkommensrechner" ? "Erleben" : "Werkzeuge",
    type,
    body: (b) => `<section class="hero portal-hero"><div class="hero-content"><nav class="breadcrumb"><a href="${b}index.html">Start</a> / <a href="${b}wirkungsfelder/arbeit-einkommen/">Arbeit & Einkommen</a></nav><p class="hero-kicker">${esc(type)}</p><h1>${esc(title)}</h1><p class="hero-subtitle">${esc(summary)}</p><p class="scanner-notice">Modellhafte Demonstration. Keine amtliche Einstufung. Keine Rechts-, Steuer- oder Sozialberatung.</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="#modell">Modell ansehen</a></div></div></section>${toolDemo(b, slugName)}<section class="section" aria-labelledby="modell"><div class="prose">${h2("modell", "Tool-Spezifikation und Rechenmodell")} ${spec.html}</div></section>${crossLinks(b)}${political()}${referenceBlock(b)}${bookBlock(b)}${sourceBlock()}${downloads(b, ["woek_arbeit_einkommen_automatisierung_konzeptpapier_v0_1.docx"])}`,
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
  if (slugName !== "automatisierungs-wirkungseinkommensrechner") return `<section class="section"><div class="card"><p class="hero-kicker">Status</p><h2>Erklärseite</h2><p>Die Demo-Logik ist in Vorbereitung. Der methodische Anschluss ist bereits online lesbar.</p></div></section>`;
  return `<section class="section" aria-labelledby="rechner"><div class="section-header"><p class="hero-kicker">Demo V0.1</p>${h2("rechner", "Automatisierungs- und Wirkungseinkommensrechner")}</div><div class="table-wrap"><table class="data-table"><tbody><tr><th>Beitragslückenrechner</th><td>FTE, Bruttolohn, Sozialbeiträge und Automatisierungsquote zeigen modellhaft die wegfallende Lohnsumme.</td></tr><tr><th>Maschinenwertschöpfungsbeitrag</th><td>Automatisierte Wertschöpfung × Rückkopplungsquote × Wirkungsfaktor-Anpassung.</td></tr><tr><th>Transformationsbonus</th><td>Weiterbildung, interne Versetzung, Arbeitszeitmodelle und regionale Stabilisierung können entlastend wirken.</td></tr><tr><th>Wirkungseinkommensmodell</th><td>Grunddividende, Markteinkommen, Wirkungsbonus und Fondsanteil werden als Einkommensarchitektur sichtbar.</td></tr></tbody></table></div></section>`;
}

function workLibrary() {
  page({
    rel: "werkstatt/arbeitsbibliothek/wirkungsfelder/arbeit-einkommen/index.html",
    title: "Arbeitsbibliothek Arbeit & Einkommen | Wirkungsökonomie",
    description: "Konzeptpapier, Gesamtdossier, Detailkonzepte, Einzeldossiers und Tool-Spezifikationen zum Wirkungsfeld Arbeit & Einkommen.",
    section: "Werkstatt",
    type: "Arbeitsbibliothek",
    body: (b) => `<section class="hero portal-hero"><div class="hero-content"><nav class="breadcrumb"><a href="${b}index.html">Start</a> / <a href="${b}werkstatt/">Werkstatt</a></nav><p class="hero-kicker">Arbeitsbibliothek</p><h1>Arbeit & Einkommen</h1><p class="hero-subtitle">Konzeptpapier, Gesamtdossier, Detailkonzepte, Einzeldossiers und Tool-Spezifikationen.</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button><a class="btn btn-primary" href="${href(b, "wirkungsfelder/arbeit-einkommen/")}">Portal öffnen</a></div></div></section>${publicationAccess(b, "Dokumente online lesen")}<section class="section" aria-labelledby="docs"><div class="section-header"><p class="hero-kicker">Unterbereiche</p>${h2("docs", "Detailkonzepte und Einzeldossiers")}</div>${cards(b, pages.map(([slugName, title, summary]) => [title, "Online-Volltext", summary, `wirkungsfelder/arbeit-einkommen/${slugName}/`]))}</section>${downloads(b, ["woek_arbeit_einkommen_automatisierung_konzeptpapier_v0_1.docx", "woek_arbeit_einkommen_automatisierung_gesamtdossier_v0_1.docx", "woek_arbeit_einkommen_detailkonzepte_umfangreich_v0_1.docx", "woek_arbeit_einkommen_einzeldossier_set_v0_1.docx"])}`,
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
    const block = `<section class="section" aria-labelledby="arbeit-einkommen-link"><div class="download-card"><div><p class="card-kicker">Rang 6</p>${h2("arbeit-einkommen-link", title)}<p class="card-text">${esc(text)}</p></div><a class="btn btn-secondary no-print" href="${href(b, "wirkungsfelder/arbeit-einkommen/")}">Arbeit & Einkommen öffnen</a></div></section>`;
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
