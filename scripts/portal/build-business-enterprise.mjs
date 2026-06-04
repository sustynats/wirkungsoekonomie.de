import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://wirkungsoekonomie.de";
const DATE = "2026-05-24";
const CSS_VERSION = "20260524-wirtschaft-unternehmen";
const JS_VERSION = "20260525-sprint-2";
const SRC = "docs/wirtschaft-unternehmen/docx-extracts";

const areas = [
  ["unternehmen_als_wirkungssysteme", "Unternehmen als Wirkungssysteme", "Wirkungsökonomisch ist ein Unternehmen ein organisierter Wirkungsraum: Es beschafft, produziert, führt, kommuniziert, investiert, verkauft, berichtet und verändert dadurch Zustände."],
  ["wirkungsorientierte_unternehmensfuehrung", "Wirkungsorientierte Unternehmensführung", "Führung gestaltet Orientierung, Entscheidung, Beziehung, Rückkopplung und Korrektur auf positive Netto-Wirkung für Mensch, Planet und Demokratie."],
  ["wirkungsorientierte_mitarbeiterfuehrung", "Wirkungsorientierte Mitarbeiterführung", "Mitarbeitende werden nicht als Ressourcen gelesen, sondern als Wirkungsträger:innen, Frühwarnsensoren und Mitgestalter:innen von Verantwortung."],
  ["impact_controlling_im_unternehmen", "Impact Controlling im Unternehmen: KII statt nur KPI", "Key Impact Indicators ergänzen KPIs in Strategie, Investition, Budgetierung, Einkauf, Risiko, Boni und Finanzkommunikation."],
  ["risikomanagement_wirkungsrisiko_erm", "Risikomanagement: Wirkungsrisiko im ERM", "Wirkungsrisiko macht sichtbar, wo Unternehmen negative Zustandsveränderungen erzeugen oder selbst von ihnen abhängig werden."],
  ["resiliente_wertschoepfungskette", "Resiliente Wertschöpfungskette und Lieferantenentwicklung", "Wertschöpfungsketten sind Wirkungsräume; Lieferantenentwicklung wird Teil von Resilienz, Menschenrechten, Klima, Wasser und Versorgungssicherheit."],
  ["produktportfolio_produktentwicklung", "Produktportfolio und Produktentwicklung nach Wirkung", "Produktentwicklung prüft Lebenszyklus, Reparierbarkeit, Kreislauffähigkeit, Sicherheit, Lieferkette, Datenfähigkeit und Transformationsrisiko."],
  ["marketing_fuenftes_p_planet", "Marketing und das fünfte P: Planet", "Marketing wird Nachfragearchitektur für positive Netto-Wirkung: Product, Price, Place, Promotion und Planet."],
  ["organisation_kultur_verantwortung", "Organisation, Kultur und Verantwortung", "Wirkungsorganisationen schaffen Schnittstellenverantwortung, Fehlerkultur, Datenfähigkeit und Wirkungskompetenz im gesamten Unternehmen."],
  ["transformation_geschaeftsmodellpruefung", "Transformation und Geschäftsmodellprüfung", "Geschäftsmodelle werden danach geprüft, ob sie von negativer Wirkung abhängen oder positive Netto-Wirkung skalieren können."],
  ["governance_boni_anreizsysteme", "Governance, Boni und Anreizsysteme", "Governance koppelt Managementziele und Boni an Netto-Wirkung, Transformation, Lieferkettenqualität, Resilienz und demokratische Integrität."],
  ["kmu_tauglichkeit_pilotierung", "KMU-Tauglichkeit und Pilotierung", "Verhältnismäßige Verfahren, Branchenarchetypen, Standardwerte, Verbandslösungen und Pilotprojekte machen Wirkungsökonomie anschlussfähig."],
];

const tools = [
  ["Unternehmens-Wirkungscheck", "Demo / Prüfwerkzeug", "Prüft modellhaft, wo ein Unternehmen bereits Wirkung steuert und wo Risiken, Datenlücken oder Transformationspotenziale liegen.", "erleben/unternehmens-wirkungscheck/"],
  ["Wirkungsrisiko-Check im ERM", "Risikowerkzeug", "Ergänzt Enterprise Risk Management um Wirkungsschwere, Rückkopplungsnähe und Datenunsicherheit.", "wirkungsfelder/wirtschaft-unternehmen/detailkonzepte/risikomanagement_wirkungsrisiko_erm/"],
  ["Lieferketten-Resilienzscore", "Lieferkettenlogik", "Macht Lieferantenentwicklung, Datenqualität, Abhängigkeiten und Vorleistungswirkung sichtbar.", "wirkungsfelder/wirtschaft-unternehmen/detailkonzepte/resiliente_wertschoepfungskette/"],
  ["KII-Dashboard", "Steuerungslogik", "Verbindet KPI mit Key Impact Indicators, NWI, Scorecards und T-SROI.", "wirkungsfelder/wirtschaft-unternehmen/detailkonzepte/impact_controlling_im_unternehmen/"],
  ["Marketing-5P-Check", "Marketing-Tool", "Erweitert Product, Price, Place und Promotion um Planet und ehrliche Wirkungsinformation.", "wirkungsfelder/wirtschaft-unternehmen/detailkonzepte/marketing_fuenftes_p_planet/"],
  ["T-SROI", "Bewertungsmethode", "Bewertet Transformationswirkung im Verhältnis zum Ressourceneinsatz.", "werkzeuge/impact-controlling/t-sroi/"],
  ["NWI", "Kennzahl", "Ordnet positive, negative und neutrale Wirkung operativ ein.", "werkzeuge/netto-wirkungs-index/"],
  ["Scorecards", "Bewertungsraster", "Übersetzen Daten, Benchmarks und Zielkonflikte in nachvollziehbare Entscheidungsvorlagen.", "werkzeuge/scorecards/"],
  ["WÖk-IDs", "Datenarchitektur", "Verbinden SDGs, SDG+, Standards, Quellen, Schwellen, Versionen und Prüfstatus.", "werkzeuge/woek-ids/"],
  ["Digitale Produktpässe und Wirkungsdatenräume", "Dateninfrastruktur", "Machen Produkt-, Lieferketten-, Prüf- und Wirkungsdaten interoperabel.", "werkzeuge/digitale-produktpaesse-wirkungsdatenraeume/"],
  ["Wirkungsrat", "Institution", "Sichert Indikatorenpflege, Benchmarks, Evaluation und Missbrauchsschutz.", "werkzeuge/wirkungsrat/"],
];

const bookAnchors = [
  ["Kapitel 34 - T-SROI und systemische Transformationsmessung", "referenz/kapitel-034-t-sroi-und-systemische-transformationsmessung/"],
  ["Kapitel 35 - Digitale Produktpässe und Wirkungsdatenräume", "referenz/kapitel-035-digitale-produktpaesse-und-wirkungsdatenraeume/"],
  ["Kapitel 42 - Unternehmen als Wirkungssysteme", "referenz/kapitel-042-unternehmen-als-wirkungssysteme/"],
  ["Kapitel 43 - Wirkungsorientierte Unternehmensführung", "referenz/kapitel-043-wirkungsorientierte-unternehmensfuehrung/"],
  ["Kapitel 44 - Wirkungscontrolling im Unternehmen", "referenz/kapitel-044-wirkungscontrolling-im-unternehmen/"],
  ["Kapitel 45 - Organisation, Kultur und Verantwortung", "referenz/kapitel-045-organisation-kultur-und-verantwortung/"],
  ["Kapitel 46 - Interne Wertschöpfung und Lieferkettensteuerung", "referenz/kapitel-046-interne-wertschoepfung-und-lieferkettensteuerung/"],
  ["Kapitel 47 - Unternehmensrisiko und Transformation", "referenz/kapitel-047-unternehmensrisiko-und-transformation/"],
  ["Kapitel 50-53 - Produkte, Scorecards, Konsumwirkung und Markttransformation", "referenz/teil-08-produkte-maerkte-und-preise/"],
];

const sdgs = ["SDG 8 Menschenwürdige Arbeit", "SDG 9 Industrie, Innovation und Infrastruktur", "SDG 10 Weniger Ungleichheiten", "SDG 12 Nachhaltige/r Konsum und Produktion", "SDG 13 Klimaschutz", "SDG 16 Frieden, Gerechtigkeit und starke Institutionen", "SDG 17 Partnerschaften"];
const sdgPlus = ["SDG+ Demokratie", "SDG+ Medienqualität", "SDG+ Rechtsstaatlichkeit", "SDG+ Diskursfähigkeit", "SDG+ institutionelles Vertrauen", "SDG+ gesellschaftlicher Zusammenhalt", "SDG+ digitale Selbstbestimmung"];

const retro = [
  {
    label: "Produkte & Konsum",
    base: "wirkungsfelder/produkte-konsum",
    items: [
      ["wirkungsumsatzsteuer", "Wirkungsumsatzsteuer / Produktwirkungssteuer"],
      ["produktscorecards", "Produktscorecards"],
      ["woek-ids-im-produktbereich", "WÖk-IDs im Produktbereich"],
      ["reverse-merit-order", "Reverse Merit Order"],
      ["apfelbeispiel", "Apfelbeispiel"],
      ["lieferketten", "Lieferketten"],
      ["basf-polyamid", "BASF Polyamid / Konzernbeispiel"],
      ["verbraucherinformation", "Verbraucherinformation"],
      ["unternehmen-produktentwicklung", "Unternehmen & Produktentwicklung"],
      ["politische-rahmenbedingungen", "Politische Rahmenbedingungen"],
    ],
    tools: ["Wirkungsumsatzsteuer", "Produktscorecards", "WÖk-IDs", "Reverse Merit Order"],
  },
  {
    label: "Impact Controlling",
    base: "werkzeuge/impact-controlling",
    items: [
      ["t-sroi", "T-SROI"],
      ["nwi", "Netto-Wirkungs-Index"],
      ["woek-ids", "WÖk-IDs"],
      ["scorecards", "Scorecards"],
      ["reverse-merit-order", "Reverse Merit Order"],
      ["benchmarks-archetypen", "Benchmarks & Archetypen"],
      ["datenqualitaet-assurance", "Datenqualität & Assurance"],
      ["digitale-produktpaesse-wirkungsdatenraeume", "Digitale Produktpässe & Wirkungsdatenräume"],
      ["kii-statt-kpi", "KII statt KPI"],
      ["beispielrechnungen", "Beispielrechnungen"],
    ],
    tools: ["T-SROI", "NWI", "Scorecards", "WÖk-IDs"],
  },
  {
    label: "Staat, Recht & Demokratie",
    base: "werkstatt/dossiers/staat-recht-demokratie",
    items: [
      ["wirkung-als-rechtsprinzip", "Wirkung als Rechtsprinzip"],
      ["wirkungssteuergesetz-wstg", "Wirkungssteuergesetz WStG"],
      ["wirkungsumsatzsteuer-rechtsrahmen", "Wirkungsumsatzsteuer im Rechtsrahmen"],
      ["wirkungseinkommensteuer-westg", "Wirkungseinkommensteuer WEstG"],
      ["wirkungshaushalt", "Wirkungshaushalt"],
      ["wirkungsrat", "Wirkungsrat"],
      ["verwaltung-rechtsschutz-korrektur", "Verwaltung, Rechtsschutz und Korrekturverfahren"],
      ["politische-wirkungspruefung", "Politische Wirkungsprüfung"],
      ["lobbyismus-machtkonzentration", "Lobbyismus, Machtkonzentration und Schutz der Wirkungslogik"],
      ["buergerbeteiligung-wirkungsdemokratie", "Bürgerbeteiligung und Wirkungsdemokratie"],
    ],
    tools: ["Wirkungsrat", "Wirkungshaushalt", "Politische Wirkungsprüfung", "WStG"],
  },
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
function slugify(value) {
  return String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function citeAnchor(id) {
  return `<a class="cite-anchor no-print" href="#${id}" aria-label="Zitierlink zu diesem Abschnitt">#</a>`;
}
function sectionTitle(id, text) {
  return `<h2 id="${id}">${escapeHtml(text)} ${citeAnchor(id)}</h2>`;
}
function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}
function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}
function cleanPublicMarkdown(markdown) {
  return String(markdown)
    .split(/\r?\n/)
    .filter((line) => !/Arbeitsfassung für Onlinefassung|Arbeitsfassung für Webfassung|Arbeitsfassung für .*Portal/i.test(line))
    .join("\n")
    .replace(/Unterbereiche des Portals/g, "Zentrale Unterbereiche")
    .replace(/Online- und Dossierlogik/g, "Vertiefung und Dossierlogik")
    .replace(/Interne und externe Referenzen/g, "Referenzen und Quellen")
    .replace(/Die Portalseite erklärt/g, "Die Übersicht erklärt")
    .replace(/Portal und/g, "Umsetzung und")
    .replace(/Portal-/g, "Bereichs-")
    .replace(/Portal/g, "Übersicht")
    .replace(/HTML\/Volltext/g, "HTML")
    .replace(/PDF dienen/g, "PDFs dienen");
}
function write(rel, content) {
  const out = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, content, "utf8");
}

function page({ rel, title, description, searchSection = "Wirkungsfelder", searchType = "Portal", body }) {
  const route = routeFor(rel);
  const base = baseFor(rel);
  const canonical = `${SITE}${route}`;
  write(rel, `<!doctype html>
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
    <link rel="stylesheet" href="${base}assets/css/style.css?v=20260604-menu-fix">
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="${base}index.html" aria-label="Wirkungsökonomie Startseite"><span class="brand-mark"><img src="${base}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span><span class="brand-name">Wirkungsökonomie</span></a>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav"><span class="nav-toggle-icon" aria-hidden="true">☰</span><span class="sr-only">Menü</span></button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation"><a href="${base}index.html">Start</a></nav>
    </header>
    <main>
      <p class="print-meta">Wirkungsökonomie · ${escapeHtml(title.replace(/\s+\|.*$/, ""))} · ${canonical} · Druckdatum: 24.05.2026</p>
${body(base, route)}
    </main>
    <script src="${base}assets/js/main.js?v=20260604-debate-use-order}"></script>
  </body>
</html>
`);
}

function hero(base, { kicker, title, subtitle, text, action = "" }) {
  return `<section class="hero portal-hero"><div class="hero-content">
      <nav class="breadcrumb"><a href="${base}index.html">Start</a> / <a href="${base}wirkungsfelder/">Wirkungsfelder</a></nav>
      <p class="hero-kicker">${escapeHtml(kicker)}</p>
      <h1>${escapeHtml(title)}</h1>
      <p class="hero-subtitle">${escapeHtml(subtitle)}</p>
      <p>${escapeHtml(text)}</p>
      <div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button>${action}</div>
    </div></section>`;
}

function mdToHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  const toc = [];
  let p = [];
  const flush = () => {
    if (!p.length) return;
    const id = `absatz-${String(html.length + 1).padStart(3, "0")}`;
    html.push(`<p id="${id}">${escapeHtml(p.join(" ").replace(/\*\*/g, ""))} ${citeAnchor(id)}</p>`);
    p = [];
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flush();
      const level = Math.max(2, Math.min(4, heading[1].length));
      const text = heading[2].trim();
      const id = slugify(text);
      toc.push({ level, text, id });
      html.push(`<h${level} id="${id}">${escapeHtml(text)} ${citeAnchor(id)}</h${level}>`);
      continue;
    }
    if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      flush();
      const text = line.replace(/^([-*]|\d+\.)\s+/, "");
      html.push(`<p>${escapeHtml(text.replace(/\*\*/g, ""))}</p>`);
      continue;
    }
    p.push(line);
  }
  flush();
  return { html: html.join("\n"), toc };
}

function tocBlock(toc) {
  return `<nav class="toc-card no-print reader-toc-card" aria-label="Inhaltsverzeichnis"><h2 class="card-title">Inhaltsverzeichnis</h2><ol>${toc.slice(0, 22).map((x) => `<li class="toc-level-${x.level}"><a href="#${x.id}">${escapeHtml(x.text)}</a></li>`).join("")}</ol></nav>`;
}
function citationNotice(route) {
  return `<aside class="citation-note" role="note"><p class="card-kicker">Onlinefassung</p><h2>Du liest die Onlinefassung.</h2><p>Abschnittsanker können direkt zitiert werden. Ergänzende Downloadfassungen stehen am Ende der Seite.</p></aside>`;
}
function statusMeta(status) {
  return "";
}
function cardGrid(base, items) {
  return `<div class="card-grid three">${items.map((x) => `<article class="card">${x.kicker ? `<p class="card-kicker">${escapeHtml(x.kicker)}</p>` : ""}<h3 class="card-title">${escapeHtml(x.title)}</h3><p class="card-text">${escapeHtml(x.text)}</p>${x.href ? `<div class="portal-card-actions"><a class="text-link" href="${href(base, x.href)}">${escapeHtml(x.label || "Online lesen")}</a></div>` : ""}</article>`).join("")}</div>`;
}
function dataTable(headers, rows) {
  return `<div class="table-wrap"><table class="data-table"><thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}
function politicalBlock() {
  return `<section class="section" aria-labelledby="political-implementation"><div class="card"><p class="hero-kicker">Umsetzung</p>${sectionTitle("political-implementation", "Aufgaben der Politik und Ausgestaltungsspielräume")}<p>Die Wirkungsökonomie ersetzt nicht den politischen Diskurs. Sie schafft einen messbaren Referenzrahmen für demokratische Aushandlung.</p>${dataTable(["Ebene", "Ausgestaltung"], [
    ["Rahmenbedingungen", "Datenstandards, Greenwashing-Schutz, KMU-taugliche Verfahren, öffentliche Beschaffung nach Wirkung, Übergangsfristen und Rechtsschutz."],
    ["Unternehmensaufgaben", "Strategie, Einkauf, Produktentwicklung, Führung, Risikomanagement, Kultur, Boni und Berichterstattung an realen Zustandsveränderungen ausrichten."],
    ["Politische Spielräume", "Parteien können Förderung, Berichtspflichten, Steuerung, Pilotierung, Standards und Beschaffung unterschiedlich kombinieren."],
    ["Mindeststandards", "Datenqualität, Nicht-Kompensation schwerer negativer Wirkung, Einspruchsrechte, Datenschutz und nachvollziehbare Prüfung."],
    ["KMU-Schutz", "Branchenarchetypen, Standardwerte, Verbandslösungen, gestufte Pflichten und geförderte Pilotprogramme."],
    ["Evaluation", "Wirkungsberichte, Wirkungsrat, öffentliche Konsultation und lernende Korrekturzyklen."],
  ])}</div></section>`;
}
function sdgBlock() {
  return `<section class="section" aria-labelledby="sdg-title"><div class="portal-reference-block"><p class="hero-kicker">Referenzrahmen</p>${sectionTitle("sdg-title", "SDG-/SDG+-Bezug")}<h3>Relevante SDGs</h3><div class="model-strip">${sdgs.map((x) => `<span>${escapeHtml(x)}</span>`).join("")}</div><h3>Relevante SDG+-Dimensionen</h3><div class="model-strip">${sdgPlus.map((x) => `<span>${escapeHtml(x)}</span>`).join("")}</div><p>SDG+ ist keine offizielle UN-Kategorie, sondern eine transparente Erweiterung der Wirkungsökonomie.</p></div></section>`;
}
function bookBlock(base) {
  return `<section class="section" aria-labelledby="book-anchors"><div class="section-header"><p class="hero-kicker">Online-Buch</p>${sectionTitle("book-anchors", "Anker im Online-Buch")}</div><div class="model-strip">${bookAnchors.map(([label, link]) => `<a href="${href(base, link)}">${escapeHtml(label)}</a>`).join("")}</div></section>`;
}
function toolGrid(base) {
  return `<section class="section" aria-labelledby="tools"><div class="section-header"><p class="hero-kicker">Werkzeuge</p>${sectionTitle("tools", "Werkzeuge in diesem Bereich")}<p>Werkzeuge erklären Methoden. Entscheidungen bleiben unternehmerisch, rechtlich und demokratisch verantwortet.</p></div>${cardGrid(base, tools.map(([title, kicker, text, link]) => ({ title, kicker, text, href: link, label: link.includes("erleben/") ? "Tool testen" : "Methodik lesen" })))}</section>`;
}
function downloadBlock(base, items) {
  const links = items.filter((x) => x.href && exists(x.href));
  return `<section class="section" aria-labelledby="downloads"><div class="card"><p class="hero-kicker">Arbeitsmaterial</p>${sectionTitle("downloads", "Vertiefung und Arbeitsmaterial")}<p>Ergänzende Downloadfassungen und Druckfunktion stehen hier am Ende der Seite.</p><div class="portal-card-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button>${links.map((x) => `<a class="btn btn-secondary" href="${href(base, x.href)}">${escapeHtml(x.label)}</a>`).join("")}</div></div></section>`;
}

function docName(prefix, slug) {
  return `${prefix}_${slug}_v0_1`;
}
function areaBySlug(slug) {
  const area = areas.find(([s]) => s === slug);
  if (!area) throw new Error(`Unknown area ${slug}`);
  return { slug: area[0], title: area[1], text: area[2] };
}

function fulltextPage({ rel, title, subtitle, mdRel, status, downloads = [], cards = [], searchSection = "Wirkungsfelder", searchType = "Volltext", backHref = "wirkungsfelder/wirtschaft-unternehmen/" }) {
  const rendered = mdToHtml(cleanPublicMarkdown(read(mdRel)));
  page({
    rel,
    title: `${title} | Wirkungsökonomie`,
    description: subtitle,
    searchSection,
    searchType,
    body: (base, route) => `${hero(base, { kicker: status.replace(/\/\s*Online-Volltext/g, ""), title, subtitle, text: subtitle, action: `<a class="btn btn-primary" href="${href(base, backHref)}">Zur Übersicht</a>` })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section narrow">${statusMeta(status)}</section>
    <section class="section no-print detail-concept-toc-section">${tocBlock(rendered.toc)}</section>
    <section class="section article-section"><article class="article-body fulltext-reader detail-concept-reader">${sectionTitle("online-volltext", "Onlinefassung")}${rendered.html}</article></section>
    ${cards.length ? `<section class="section" aria-labelledby="related">${sectionTitle("related", "Verwandte Online-Bereiche")}${cardGrid(base, cards)}</section>` : ""}
    ${toolGrid(base)}
    ${politicalBlock()}
    ${sdgBlock()}
    ${bookBlock(base)}
    ${downloadBlock(base, downloads)}`,
  });
}

function portalPage() {
  page({
    rel: "wirkungsfelder/wirtschaft-unternehmen/index.html",
    title: "Wirtschaft & Unternehmen | Wirkungsökonomie",
    description: "Unternehmen als Wirkungssysteme: Führung, Controlling, Wertschöpfung, Marketing und Risiko neu denken.",
    body: (base, route) => `${hero(base, {
      kicker: "Wirkungsfeld",
      title: "Wirtschaft & Unternehmen",
      subtitle: "Unternehmen als Wirkungssysteme: Führung, Controlling, Wertschöpfung, Marketing und Risiko neu denken.",
      text: "Unternehmen organisieren Wirkung täglich. Die Wirkungsökonomie fragt, welche Zustandsveränderungen entstehen und wie Strategie, Kapital, Daten, Führung und Wertschöpfung auf positive Netto-Wirkung für Mensch, Planet und Demokratie ausgerichtet werden können.",
      action: `<a class="btn btn-primary" href="#subareas">Konzepte ansehen</a><a class="btn btn-secondary" href="#material">Arbeitsmaterial</a>`,
    })}
    <section class="section" aria-labelledby="why-business"><div class="section-header"><p class="hero-kicker">Warum wichtig?</p>${sectionTitle("why-business", "Warum Wirtschaft & Unternehmen ein Wirkungsfeld sind")}<p>Unternehmen treffen täglich Entscheidungen über Produkte, Arbeit, Kapital, Daten, Einkauf, Kommunikation und Risiko. Damit prägen sie, welche Folgen für Menschen, Ökosysteme, Institutionen und Demokratie entstehen.</p></div>${cardGrid(base, [
      { title: "Unternehmen steuern Wirkungsströme", text: "Beschaffung, Produktion, Vertrieb und Finanzierung erzeugen Zustandsveränderungen weit über die Organisation hinaus." },
      { title: "Wertschöpfung braucht Rückkopplung", text: "Gewinn bleibt wichtig, reicht als alleiniger Maßstab aber nicht aus, wenn Schäden externalisiert werden." },
      { title: "Management wird lernfähig", text: "Daten, Controlling und Governance können Wirkung sichtbar machen, ohne Entscheidungen zu automatisieren." },
    ])}</section>
    <section class="section" aria-labelledby="business-logic"><div class="section-header"><p class="hero-kicker">Systemblick</p>${sectionTitle("business-logic", "Alte Logik vs. WÖk-Logik")}</div><figure class="system-visual" role="img" aria-label="Alte Unternehmenslogik verglichen mit WÖk-Logik. Alte Logik misst Gewinn, Wachstum und Output. WÖk-Logik bewertet positive Netto-Wirkung, Schutzgrenzen und Rückkopplung."><div class="system-visual-compare"><div class="visual-lane" data-tone="warning"><strong>Alte Logik</strong><div class="visual-chip-list"><span>Gewinn</span><span>Wachstum</span><span>Output</span><span>Reporting</span></div></div><div class="visual-lane" data-tone="positive"><strong>WÖk-Logik</strong><div class="visual-chip-list"><span>positive Netto-Wirkung</span><span>Schutzgrenzen</span><span>Risikoresilienz</span><span>Rückkopplung</span></div></div></div><figcaption>Unternehmen bleiben wirtschaftlich handlungsfähig. Der zusätzliche Maßstab zeigt, wo Wertschöpfung Zukunft stärkt oder Risiken erzeugt.</figcaption></figure><div class="comparison-grid"><article class="card"><p class="card-kicker">Heutige Logik</p><h3 class="card-title">Was oft zu eng gemessen wird</h3><ul class="clean-list"><li>Erfolg wird primär über Umsatz, Marge und Wachstum gelesen.</li><li>Risiken erscheinen oft erst in Berichtspflichten oder Krisen.</li><li>Lieferketten- und Produktwirkung bleiben vom Steuerungsalltag getrennt.</li></ul></article><article class="card"><p class="card-kicker">WÖk-Logik</p><h3 class="card-title">Was zusätzlich steuerbar wird</h3><ul class="clean-list"><li>Strategie, Risiko, Kapital und Controlling werden an Wirkung gekoppelt.</li><li>Negative Wirkung wird als Kosten-, Vertrauens- und Zukunftsrisiko sichtbar.</li><li>Positive Netto-Wirkung wird zu einem Management- und Investitionssignal.</li></ul></article></div></section>
    <section class="section" id="subareas" aria-labelledby="subareas-title"><div class="section-header"><p class="hero-kicker">Zentrale Konzepte</p>${sectionTitle("subareas-title", "Zentrale Unterbereiche")}<p>Die Karten führen in die wichtigsten Konzepte. Downloadfassungen und Dossiers stehen am Ende.</p></div>${cardGrid(base, areas.map(([slug, title, text]) => ({ title, text: `${text} Warum relevant? Der Unterbereich zeigt, wie Unternehmensentscheidungen an Wirkung rückgekoppelt werden können.`, href: `wirkungsfelder/wirtschaft-unternehmen/detailkonzepte/${slug}/`, label: "Konzept lesen" })))}</section>
    <aside class="section related-questions-block" aria-labelledby="business-related-title"><div class="section-header"><p class="hero-kicker">Passende Fragen</p>${sectionTitle("business-related-title", "Einwände zu Unternehmen, Reporting und Steuerung")}</div><div class="related-question-grid"><article class="related-question-card"><span>Abgrenzung</span><strong>Ist das nur ESG mit neuem Namen?</strong><a class="text-link" href="${href(base, "fragen/#esg")}">Antwort lesen</a></article><article class="related-question-card"><span>Bürokratie</span><strong>Wird das nicht zu viel Aufwand?</strong><a class="text-link" href="${href(base, "fragen/#buerokratie")}">Antwort lesen</a></article><article class="related-question-card"><span>Daten</span><strong>Was passiert bei fehlenden Daten?</strong><a class="text-link" href="${href(base, "fragen/#fehlende-daten")}">Antwort lesen</a></article></div></aside>
    ${toolGrid(base)}
    ${politicalBlock()}
    ${sdgBlock()}
    ${bookBlock(base)}
    <section class="section" id="material" aria-labelledby="material-title"><div class="section-header"><p class="hero-kicker">Vertiefung und Arbeitsmaterial</p>${sectionTitle("material-title", "Onlinefassungen, Dossiers und Downloads")}<p>Hier findest du die fachlichen Langfassungen und Downloadmaterialien.</p></div>${cardGrid(base, [
      { title: "Praxispaper Impact-Strategie im Unternehmenseinkauf", text: "Anonymisiertes Paper zur Verankerung von Impact-Management, Impact-Controlling, KII, Scorecards und Impact-Marketing im Einkauf eines Industrieunternehmens.", href: "dokumente/impact-strategie-controlling-marketing-management-einkauf-chemieindustrie/", label: "Online lesen" },
      { title: "Gesamtdossier Wirtschaft & Unternehmen", text: "Praxisfragen, Bewertungslogik und politische Anschlussfähigkeit.", href: "werkstatt/dossiers/wirtschaft-unternehmen/", label: "Dossier lesen" },
      { title: "Arbeitsbibliothek", text: "Übersicht der Materialien zu diesem Wirkungsfeld.", href: "werkstatt/arbeitsbibliothek/wirkungsfelder/wirtschaft-unternehmen/", label: "Arbeitsmaterial ansehen" },
    ])}</section>
    ${downloadBlock(base, [
      { label: "Praxispaper Impact-Strategie im Unternehmenseinkauf", href: "public/downloads/originals/woek-paper-impact-strategie-controlling-marketing-management-einkauf-chemieindustrie.pdf" },
      { label: "Konzeptpapier Word", href: "assets/downloads/woek_wirtschaft_unternehmen_konzeptpapier_v0_1.docx" },
      { label: "Gesamtdossier Word", href: "assets/downloads/woek_wirtschaft_unternehmen_gesamtdossier_v0_1.docx" },
      { label: "Standard Detailkonzepte Word", href: "assets/downloads/woek_standard_detailkonzepte_einzeldossiers_v0_2.docx" },
    ])}`,
  });
}

function businessPages() {
  fulltextPage({
    rel: "wirkungsfelder/wirtschaft-unternehmen/konzeptpapier/index.html",
    title: "Konzeptpapier Wirtschaft & Unternehmen",
    subtitle: "Unternehmen als Wirkungssysteme im Rahmen der Wirkungsökonomie.",
    mdRel: `${SRC}/woek_wirtschaft_unternehmen_konzeptpapier_v0_1.md`,
    status: "Konzeptpapier",
    downloads: [{ label: "Konzeptpapier Word", href: "assets/downloads/woek_wirtschaft_unternehmen_konzeptpapier_v0_1.docx" }],
  });
  fulltextPage({
    rel: "werkstatt/dossiers/wirtschaft-unternehmen/index.html",
    title: "Gesamtdossier Wirtschaft & Unternehmen",
    subtitle: "Beispiele, Datenquellen, Berechnungslogik, Tools und politische Anschlussfähigkeit.",
    mdRel: `${SRC}/woek_wirtschaft_unternehmen_gesamtdossier_v0_1.md`,
    status: "Gesamtdossier",
    searchSection: "Werkstatt",
    searchType: "Dossier",
    downloads: [{ label: "Gesamtdossier Word", href: "assets/downloads/woek_wirtschaft_unternehmen_gesamtdossier_v0_1.docx" }],
    cards: areas.map(([slug, title, text]) => ({ title, text, href: `wirkungsfelder/wirtschaft-unternehmen/dossiers/${slug}/`, label: "Einzeldossier lesen" })),
  });
  for (const [slug, title, text] of areas) {
    const detailName = docName("woek_detailkonzept", slug);
    const dossierName = docName("woek_einzeldossier", slug);
    fulltextPage({
      rel: `wirkungsfelder/wirtschaft-unternehmen/detailkonzepte/${slug}/index.html`,
      title: `Detailkonzept ${title}`,
      subtitle: text,
      mdRel: `${SRC}/${detailName}.md`,
      status: "Detailkonzept",
      downloads: [{ label: "Detailkonzept Word", href: `assets/downloads/${detailName}.docx` }],
      cards: [{ title: `Einzeldossier ${title}`, text: "Vertiefung mit Beispielen, Datenquellen und Umsetzungshinweisen.", href: `wirkungsfelder/wirtschaft-unternehmen/dossiers/${slug}/`, label: "Einzeldossier lesen" }],
    });
    fulltextPage({
      rel: `wirkungsfelder/wirtschaft-unternehmen/dossiers/${slug}/index.html`,
      title: `Einzeldossier ${title}`,
      subtitle: text,
      mdRel: `${SRC}/${dossierName}.md`,
      status: "Einzeldossier",
      downloads: [{ label: "Einzeldossier Word", href: `assets/downloads/${dossierName}.docx` }],
      cards: [{ title: `Detailkonzept ${title}`, text: "Konzeptuelle Grundlegung des Unterbereichs.", href: `wirkungsfelder/wirtschaft-unternehmen/detailkonzepte/${slug}/`, label: "Detailkonzept lesen" }],
    });
  }
}

function demoPage() {
  const spec = mdToHtml(read("docs/wirtschaft-unternehmen/tool_spezifikation_unternehmens_wirkungscheck.md"));
  page({
    rel: "erleben/unternehmens-wirkungscheck/index.html",
    title: "Unternehmens-Wirkungscheck | Wirkungsökonomie erleben",
    description: "Methodische Demo-Struktur für Unternehmenswirkung, Risiko, Lieferketten, KII und Transformation.",
    searchSection: "Erleben",
    searchType: "Demo",
    body: (base, route) => `${hero(base, { kicker: "Methodik", title: "Unternehmens-Wirkungscheck", subtitle: "Unternehmenswirkung, Wirkungsrisiko und Transformationsreife modellhaft verstehen.", text: "Diese Seite erklärt die Methodik. Sie ist keine Prüfung, keine Beratung und keine amtliche Einstufung.", action: `<a class="btn btn-primary" href="${href(base, "wirkungsfelder/wirtschaft-unternehmen/")}">Zur Übersicht</a>` })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section article-section"><article class="article-body fulltext-reader">${sectionTitle("methodik", "Methodik und Annahmen")}${spec.html}</article></section>
    ${toolGrid(base)}
    ${politicalBlock()}
    ${sdgBlock()}
    ${bookBlock(base)}
    ${downloadBlock(base, [])}`,
  });
}

function toolPage() {
  page({
    rel: "werkzeuge/unternehmens-wirkungscheck/index.html",
    title: "Unternehmens-Wirkungscheck | Wirkungsökonomie",
    description: "Werkzeugseite für den Unternehmens-Wirkungscheck als kontextbezogenes Prüf- und Lernwerkzeug.",
    searchSection: "Werkzeuge",
    searchType: "Werkzeug",
    body: (base, route) => `${hero(base, { kicker: "Methode", title: "Unternehmens-Wirkungscheck", subtitle: "Wirkungsprofil, Risikologik, Lieferkette, KII und Transformation.", text: "Der Check macht Unternehmenswirkung sichtbar, ohne Unternehmen automatisch moralisch zu sortieren. Bewertet werden Wirkungsräume, Datenqualität, Risiken und Veränderungspfade.", action: `<a class="btn btn-primary" href="${href(base, "erleben/unternehmens-wirkungscheck/")}">Methodik lesen</a>` })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section">${cardGrid(base, [
      { kicker: "Modul", title: "Wirkungsprofil", text: "Ordnet Geschäftsmodell, Produkte, Lieferketten, Führung und Risiko ein." },
      { kicker: "Modul", title: "ERM-Erweiterung", text: "Verbindet Wirkungsschwere, Eintrittswahrscheinlichkeit, Rückkopplungsnähe und Datenunsicherheit." },
      { kicker: "Modul", title: "KII-Dashboard", text: "Verknüpft KPIs mit Key Impact Indicators für Steuerung und Reporting." },
    ])}</section>
    ${toolGrid(base)}
    ${politicalBlock()}
    ${sdgBlock()}
    ${bookBlock(base)}
    ${downloadBlock(base, [])}`,
  });
}

function retroDetailPages() {
  for (const group of retro) {
    for (const [slug, title] of group.items) {
      const rel = `${group.base}/detailkonzepte/${slug}/index.html`;
      page({
        rel,
        title: `Detailkonzept ${title} | ${group.label}`,
        description: `Rückwirkend ergänztes Online-Detailkonzept zu ${title}.`,
        searchSection: group.label.includes("Impact") ? "Werkzeuge" : "Wirkungsfelder",
        searchType: "Detailkonzept",
        body: (base, route) => `${hero(base, { kicker: `Fachvertiefung · ${group.label}`, title: `${title}`, subtitle: "Onlinefassung und zitierfähige Fassung.", text: `Diese Fachvertiefung ergänzt den bestehenden Bereich ${group.label}. Sie ordnet Zweck, Einsatz, Datenbedarf, Grenzen und politische Ausgestaltungsspielräume ein.`, action: `<a class="btn btn-primary" href="${href(base, `${group.base}/dossiers/${slug}/`)}">Dossier lesen</a>` })}
        <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
        <section class="section narrow">${statusMeta("Rückwirkend ergänztes Detailkonzept / Webfassung")}</section>
        <section class="section article-section"><article class="article-body fulltext-reader">
          ${sectionTitle("definition", "Definition und Zweck")}
          <p>${escapeHtml(title)} beschreibt den fachlichen Teilbereich, der im bestehenden Dossier bereits angelegt ist. Das Detailkonzept macht die Logik online zitierfähig und trennt Konzept, Dossier und Download sauber.</p>
          ${sectionTitle("daten-und-methodik", "Daten, Methodik und Grenzen")}
          <p>Relevant sind der SDG-/SDG+-Referenzrahmen, WÖk-IDs, Scorecards, Datenqualität, Wirkungsrisiken und Nicht-Kompensation schwerer negativer Wirkung. Fehlende Daten müssen sichtbar bleiben.</p>
          ${sectionTitle("werkzeuge", "Werkzeuge")}
          <p>${escapeHtml(group.tools.join(", "))} werden kontextbezogen eingesetzt. Werkzeuge bereiten Entscheidungen vor, ersetzen sie aber nicht.</p>
          ${sectionTitle("politische-anschlussfaehigkeit", "Aufgaben der Politik und Ausgestaltungsspielräume")}
          <p>Politik schafft Mindeststandards, Rechtsschutz, Datenschutz, KMU-Schutz, Förderung, Übergangslogik und Evaluation. Unterschiedliche demokratische Wege bleiben möglich.</p>
        </article></section>
        ${politicalBlock()}
        ${sdgBlock()}
        ${bookBlock(base)}
        ${downloadBlock(base, [{ label: "Einzeldossier online lesen", href: `${group.base}/dossiers/${slug}/` }])}`,
      });
    }
  }
}

function workshopPages() {
  page({
    rel: "werkstatt/arbeitsbibliothek/wirkungsfelder/wirtschaft-unternehmen/index.html",
    title: "Wirtschaft & Unternehmen in der Arbeitsbibliothek | Werkstatt",
    description: "Arbeitsbibliothek zu Wirtschaft & Unternehmen: Konzept, Gesamtdossier, Detailkonzepte, Einzeldossiers, Methodik und Downloads.",
    searchSection: "Werkstatt",
    searchType: "Arbeitsbibliothek",
    body: (base, route) => `${hero(base, { kicker: "Arbeitsbibliothek · Wirkungsfeld", title: "Wirtschaft & Unternehmen", subtitle: "Konzept, Dossiers, Detailkonzepte und Unternehmens-Wirkungscheck.", text: "Diese Bibliothek bündelt Vertiefungen und Materialien zu Wirtschaft & Unternehmen.", action: `<a class="btn btn-primary" href="${href(base, "wirkungsfelder/wirtschaft-unternehmen/")}">Zur Übersicht</a>` })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section">${cardGrid(base, [
      { title: "Wirtschaft & Unternehmen", text: "Übersicht mit zentralen Unterbereichen.", href: "wirkungsfelder/wirtschaft-unternehmen/", label: "Zur Übersicht" },
      { title: "Konzeptpapier Wirtschaft & Unternehmen", text: "Konzeptpapier online lesbar.", href: "wirkungsfelder/wirtschaft-unternehmen/konzeptpapier/" },
      { title: "Gesamtdossier Wirtschaft & Unternehmen", text: "Gesamtdossier online lesbar.", href: "werkstatt/dossiers/wirtschaft-unternehmen/" },
      { title: "Unternehmens-Wirkungscheck", text: "Methodische Demo-Struktur.", href: "erleben/unternehmens-wirkungscheck/", label: "Methodik lesen" },
      ...areas.map(([slug, title, text]) => ({ title, text, href: `wirkungsfelder/wirtschaft-unternehmen/detailkonzepte/${slug}/` })),
    ])}</section>
    ${downloadBlock(base, [
      { label: "Konzeptpapier Word", href: "assets/downloads/woek_wirtschaft_unternehmen_konzeptpapier_v0_1.docx" },
      { label: "Gesamtdossier Word", href: "assets/downloads/woek_wirtschaft_unternehmen_gesamtdossier_v0_1.docx" },
      { label: "Standard Detailkonzepte Word", href: "assets/downloads/woek_standard_detailkonzepte_einzeldossiers_v0_2.docx" },
    ])}`,
  });

  page({
    rel: "werkstatt/arbeitsbibliothek/konzepte-dossiers/index.html",
    title: "Konzepte & Dossiers | Arbeitsbibliothek der Wirkungsökonomie",
    description: "Online lesbare Konzeptpapiere, Gesamtdossiers, Detailkonzepte und Einzeldossiers der Wirkungsökonomie.",
    searchSection: "Werkstatt",
    searchType: "Arbeitsbibliothek",
    body: (base, route) => `${hero(base, { kicker: "Arbeitsbibliothek", title: "Konzepte & Dossiers", subtitle: "Online lesen, zitieren und drucken.", text: "Konzepte, Detailkonzepte und Dossiers sind als Onlinefassungen und Arbeitsmaterial geordnet.", action: `<a class="btn btn-primary" href="${href(base, "werkstatt/arbeitsbibliothek/")}">Zur Arbeitsbibliothek</a>` })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section">${cardGrid(base, [
      { kicker: "", title: "Produkte & Konsum", text: "Produktbesteuerung durch Wirkung, Dossier und Detailkonzepte.", href: "wirkungsfelder/produkte-konsum/" },
      { kicker: "", title: "Impact Controlling", text: "Methodenportal mit Dossier und Detailkonzepten.", href: "werkzeuge/impact-controlling/" },
      { kicker: "", title: "Staat, Recht & Demokratie", text: "Gesetzesarchitektur und Dossiers.", href: "wirkungsfelder/staat-recht-demokratie/" },
      { kicker: "", title: "Wirtschaft & Unternehmen", text: "Unternehmen als Wirkungssysteme mit Detailkonzepten und Dossiers.", href: "wirkungsfelder/wirtschaft-unternehmen/" },
      { kicker: "", title: "Gesamtdossier Wirtschaft & Unternehmen", text: "Gesamtdossier online lesen.", href: "werkstatt/dossiers/wirtschaft-unternehmen/" },
    ])}</section>
    ${downloadBlock(base, [
      { label: "Wirtschaft-Konzeptpapier Word", href: "assets/downloads/woek_wirtschaft_unternehmen_konzeptpapier_v0_1.docx" },
      { label: "Wirtschaft-Gesamtdossier Word", href: "assets/downloads/woek_wirtschaft_unternehmen_gesamtdossier_v0_1.docx" },
    ])}`,
  });
}

function updateSitemap() {
  const sitemapPath = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(sitemapPath)) return;
  const urls = [
    "wirkungsfelder/wirtschaft-unternehmen/",
    "wirkungsfelder/wirtschaft-unternehmen/konzeptpapier/",
    "werkstatt/dossiers/wirtschaft-unternehmen/",
    "erleben/unternehmens-wirkungscheck/",
    "werkzeuge/unternehmens-wirkungscheck/",
    "werkstatt/arbeitsbibliothek/wirkungsfelder/wirtschaft-unternehmen/",
    ...areas.flatMap(([slug]) => [
      `wirkungsfelder/wirtschaft-unternehmen/detailkonzepte/${slug}/`,
      `wirkungsfelder/wirtschaft-unternehmen/dossiers/${slug}/`,
    ]),
    ...retro.flatMap((g) => g.items.map(([slug]) => `${g.base}/detailkonzepte/${slug}/`)),
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
  businessPages();
  demoPage();
  toolPage();
  retroDetailPages();
  workshopPages();
  updateSitemap();
}

build();
