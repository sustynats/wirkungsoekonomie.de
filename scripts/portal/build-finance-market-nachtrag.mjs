import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://wirkungsoekonomie.de";
const DATE = "2026-05-24";
const CSS_VERSION = "20260524-finanzmarkt-fonds";
const JS_VERSION = "20260529-glossary-hover-audit";
const SRC = "docs/finanzmarkt-steuern-fonds/docx-extracts";

const docs = {
  financeDetail: {
    rel: `${SRC}/woek_wirtschaft_unternehmen_finanzmarktanforderungen_detailkonzept_v0_2.md`,
    download: "assets/downloads/woek_wirtschaft_unternehmen_finanzmarktanforderungen_detailkonzept_v0_2.docx",
  },
  financeDossier: {
    rel: `${SRC}/woek_wirtschaft_unternehmen_finanzmarktanforderungen_dossier_v0_2.md`,
    download: "assets/downloads/woek_wirtschaft_unternehmen_finanzmarktanforderungen_dossier_v0_2.docx",
  },
  fundsDetail: {
    rel: `${SRC}/woek_steuer_fonds_finanzierungsarchitektur_detailkonzept_v0_1.md`,
    download: "assets/downloads/woek_steuer_fonds_finanzierungsarchitektur_detailkonzept_v0_1.docx",
  },
  fundsDossier: {
    rel: `${SRC}/woek_steuer_fonds_finanzierungsarchitektur_dossier_v0_1.md`,
    download: "assets/downloads/woek_steuer_fonds_finanzierungsarchitektur_dossier_v0_1.docx",
  },
};

const externalSources = [
  ["EBA Guidelines on management of ESG risks", "https://www.eba.europa.eu/node/17625"],
  ["EBA Guidelines on loan origination and monitoring", "https://www.eba.europa.eu/regulation-and-policy/credit-risk/guidelines-loan-origination-and-monitoring"],
  ["European Commission - Corporate sustainability reporting", "https://finance.ec.europa.eu/financial-markets/company-reporting-and-auditing/company-reporting/corporate-sustainability-reporting_en"],
  ["EFRAG - ESRS", "https://www.efrag.org/en/sustainability-reporting"],
  ["European Commission - EU Taxonomy", "https://finance.ec.europa.eu/sustainable-finance/tools-and-standards/eu-taxonomy-sustainable-activities_en"],
  ["ESMA - ESG Rating Providers", "https://www.esma.europa.eu/esma-activities/sustainable-finance/esg-rating-providers"],
  ["EIOPA - Sustainability risks", "https://www.eiopa.europa.eu/browse/sustainable-finance_en"],
  ["European Commission - Corporate sustainability due diligence", "https://commission.europa.eu/business-economy-euro/doing-business-eu/corporate-sustainability-due-diligence_en"],
  ["OECD Due Diligence Guidance", "https://mneguidelines.oecd.org/OECD-Due-Diligence-Guidance-for-Responsible-Business-Conduct.pdf"],
];

const financeTools = [
  ["Impact Controlling", "werkzeuge/impact-controlling/", "Dachbereich, der ESG-, Risiko- und Wirkungsdaten in Steuerung übersetzt."],
  ["T-SROI", "werkzeuge/impact-controlling/t-sroi/", "Bewertet Transformationswirkung im Verhältnis zum Ressourceneinsatz."],
  ["NWI", "werkzeuge/netto-wirkungs-index/", "Ordnet positive, negative und neutrale Wirkung operativ ein."],
  ["WÖk-IDs", "werkzeuge/woek-ids/", "Verbinden Standards, Quellen, SDGs, SDG+ und Wirkungsindikatoren."],
  ["Scorecards", "werkzeuge/scorecards/", "Übersetzen Daten und Benchmarks in nachvollziehbare Bewertungsraster."],
  ["Wirkungsumsatzsteuer", "werkzeuge/wirkungsumsatzsteuer/", "Koppelt Produktwirkung an Steuer- und Preisrückkopplung."],
  ["Wirkungseinkommensteuer", "werkzeuge/wirkungseinkommensteuer/", "Ordnet Einkommen nach Entstehungskontext und Wirkung ein."],
  ["Wirkungsfonds", "wirkungsfelder/finanzsystem-kapital/finanzierbarkeit-wirkungsfonds/", "Bündeln Mittel für Bildung, Gesundheit, Wohnen, Rente, Innovation und Demokratie."],
];

const rankRows = [
  ["Produktbesteuerung / WUStG", "Produkte & Konsum + Staat/Recht"],
  ["Impact Controlling / WÖk-IDs", "Werkzeuge"],
  ["WStG / Wirkungsrat / Wirkungshaushalt", "Staat, Recht & Demokratie"],
  ["Unternehmenssteuern / Kapitalmarktdruck", "Wirtschaft & Unternehmen + Finanzsystem & Kapital"],
  ["Sozialabgaben-Entkopplung / Automatisierung", "Arbeit & Einkommen + Unternehmen + Finanzierbarkeit"],
  ["Wirkungsrente", "Rente & soziale Sicherung"],
  ["Bildung, Gesundheit, Wohnen", "Jeweilige Wirkungsfelder plus Finanzierungsseite"],
  ["Wirkungsvermögensteuer / Wirkungserbschaftsteuer", "Finanzsystem & Kapital + Staat/Recht"],
  ["Wirkungsfonds", "Finanzsystem & Kapital als Querschnitt, zusätzlich in Fachportalen verlinkt"],
];

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
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
    .slice(0, 80);
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

function write(rel, content) {
  const out = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, content.replace(/[ \t]+$/gm, ""), "utf8");
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function citeAnchor(id, label = "Zitierlink zu diesem Abschnitt") {
  return `<a class="cite-anchor no-print" href="#${escapeHtml(id)}" aria-label="${escapeHtml(label)}">#</a>`;
}

function sectionTitle(id, text) {
  return `<h2 id="${escapeHtml(id)}">${escapeHtml(text)} ${citeAnchor(id)}</h2>`;
}

function page({ rel, title, description, searchSection = "Wirkungsfelder", searchType = "Volltext", body }) {
  const base = baseFor(rel);
  const route = routeFor(rel);
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
    <link rel="stylesheet" href="${base}assets/css/style.css?v=${CSS_VERSION}">
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
    <script src="${base}assets/js/main.js?v=20260529-glossary-hover-audit"></script>
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

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const toc = [];
  const html = [];
  const used = new Set();
  let paragraph = [];
  let paragraphCount = 0;
  const uniqueId = (value) => {
    const base = slugify(value) || "abschnitt";
    let id = base;
    let n = 2;
    while (used.has(id)) {
      id = `${base}-${n}`;
      n += 1;
    }
    used.add(id);
    return id;
  };
  const flush = () => {
    if (!paragraph.length) return;
    paragraphCount += 1;
    const id = uniqueId(`absatz-${String(paragraphCount).padStart(3, "0")}`);
    html.push(`<p id="${id}">${escapeHtml(paragraph.join(" "))} ${citeAnchor(id, "Zitierlink zu diesem Absatz")}</p>`);
    paragraph = [];
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
      const text = heading[2].replace(/\*\*/g, "").trim();
      const id = uniqueId(text);
      toc.push({ level, text, id });
      html.push(`<h${level} id="${id}">${escapeHtml(text)} ${citeAnchor(id)}</h${level}>`);
      continue;
    }
    paragraph.push(line.replace(/\*\*/g, ""));
  }
  flush();
  return { toc, html: html.join("\n") };
}

function tocBlock(toc) {
  return `<nav class="toc-card" aria-label="Inhaltsverzeichnis"><h2>Inhaltsverzeichnis</h2><div class="toc-links">${toc.slice(0, 28).map((item) => `<a class="toc-level-${item.level}" href="#${item.id}">${escapeHtml(item.text)}</a>`).join("")}</div></nav>`;
}

function citationNotice(route) {
  return `<aside class="citation-note" role="note"><p class="card-kicker">Zitierfähig</p><h2>Online lesen, gezielt zitieren</h2><p>Online-Volltext ist der Hauptzugang. Abschnittsanker können direkt zitiert werden; Downloads bleiben ergänzende Export- und Archivfassungen.</p><p><a class="text-link" href="${route}">Kanonische Seitenadresse öffnen</a></p></aside>`;
}

function metaBox(status) {
  return `<aside class="card status-meta" aria-label="Dokumentstatus"><p class="card-kicker">Dokumentstatus</p><dl><div><dt>Autorin</dt><dd>Natalie Weber</dd></div><div><dt>Referenz</dt><dd>Wirkungsökonomie</dd></div><div><dt>Version</dt><dd>Webfassung v0.1</dd></div><div><dt>Stand</dt><dd>24.05.2026</dd></div><div><dt>Status</dt><dd>${escapeHtml(status)}</dd></div></dl></aside>`;
}

function cardGrid(base, items) {
  return `<div class="card-grid three">${items.map((item) => `<article class="card">${item.kicker ? `<p class="card-kicker">${escapeHtml(item.kicker)}</p>` : ""}<h3 class="card-title">${escapeHtml(item.title)}</h3><p class="card-text">${escapeHtml(item.text)}</p>${item.href ? `<div class="portal-card-actions"><a class="text-link" href="${href(base, item.href)}">${escapeHtml(item.label || "Online lesen")}</a></div>` : ""}</article>`).join("")}</div>`;
}

function table(headers, rows) {
  return `<div class="table-wrap"><table class="data-table"><thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function politicalBlock() {
  return `<section class="section" aria-labelledby="political-implementation"><div class="card"><p class="hero-kicker">Umsetzung</p>${sectionTitle("political-implementation", "Politische Anschlussfähigkeit und Umsetzungsoptionen")}<p>Die folgenden politischen Anforderungen beschreiben keinen fertigen Parteibeschluss. Sie markieren den notwendigen Rahmen, damit dieses Wirkungsfeld demokratisch, rechtsstaatlich und praktisch umgesetzt werden kann. Wirkungsdaten bereiten Entscheidungen vor, ersetzen sie aber nicht. Normative Entscheidungen bleiben demokratisch legitimiert.</p>${table(["Ebene", "Ausgestaltungsspielraum"], [
    ["Aufgabe der Politik", "Datenstandards, Rechtsschutz, Transparenz, KMU-Schutz, soziale Abfederung und Missbrauchsschutz sichern."],
    ["Rahmenbedingungen", "CSRD/ESRS-Anschluss, Finanzaufsicht, Förderlogik, Steuerrecht, Fondsarchitektur und öffentliche Beschaffung kohärent verbinden."],
    ["Ausgestaltungsspielraum", "Tempo, Verbindlichkeit, Freibeträge, Fondsstrukturen, Übergangsfristen, Eigentumsschutz und Sozialausgleich bleiben demokratisch gestaltbar."],
    ["Zielkonflikte", "Bürokratie und Datenqualität, Innovation und Schutz, Kapitalzugang und Gemeinwohl, Automatisierung und soziale Sicherung müssen offen verhandelt werden."],
    ["Schutz vor Technokratie", "Scores liefern Entscheidungsgrundlagen; sie dürfen demokratische Verantwortung, Grundrechte und Einzelfallprüfung nicht ersetzen."],
  ])}</div></section>`;
}

function sdgBlock(base) {
  const refs = [
    ["SDG 8", "verstehen/sdgs-sdgplus/sdg-8-menschenwuerdige-arbeit-wirtschaftswachstum/"],
    ["SDG 9", "verstehen/sdgs-sdgplus/sdg-9-industrie-innovation-infrastruktur/"],
    ["SDG 10", "verstehen/sdgs-sdgplus/sdg-10-weniger-ungleichheiten/"],
    ["SDG 12", "verstehen/sdgs-sdgplus/sdg-12-nachhaltiger-konsum-produktion/"],
    ["SDG 16", "verstehen/sdgs-sdgplus/sdg-16-frieden-gerechtigkeit-starke-institutionen/"],
    ["SDG+ Demokratie", "verstehen/sdgs-sdgplus/#sdgplus-demokratie"],
    ["SDG+ institutionelles Vertrauen", "verstehen/sdgs-sdgplus/#sdgplus-institutionelles-vertrauen"],
  ];
  return `<section class="section" aria-labelledby="sdg-title"><div class="portal-reference-block"><p class="hero-kicker">Referenzrahmen</p>${sectionTitle("sdg-title", "SDG-/SDG+-Bezug")}<div class="model-strip">${refs.map(([label, link]) => `<a href="${href(base, link)}">${escapeHtml(label)}</a>`).join("")}</div><p>SDG+ ist keine offizielle UN-Kategorie, sondern eine transparente Erweiterung der Wirkungsökonomie.</p></div></section>`;
}

function toolGrid(base) {
  return `<section class="section" aria-labelledby="tools"><div class="section-header"><p class="hero-kicker">Werkzeuge</p>${sectionTitle("tools", "Kontext-Werkzeuge")}</div>${cardGrid(base, financeTools.map(([title, href, text]) => ({ title, href, text, label: "Öffnen" })))}</section>`;
}

function sourcesBlock() {
  return `<section class="section" aria-labelledby="sources"><div class="card"><p class="hero-kicker">Quellen</p>${sectionTitle("sources", "Offizielle externe Referenzen")}<p>Externe Referenzen öffnen in einem neuen Tab. Die wirkungsökonomische Einordnung bleibt auf wirkungsoekonomie.de online lesbar.</p><div class="model-strip">${externalSources.map(([label, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)} <span class="sr-only">(externe Quelle)</span></a>`).join("")}</div></div></section>`;
}

function bookBlock(base) {
  const anchors = [
    ["Kapitel 30 - Von Wirkung zu Messung", "referenz/kapitel-030-von-wirkung-zu-messung/"],
    ["Kapitel 31 - WÖk-IDs und Indikatorenarchitektur", "referenz/kapitel-031-woek-ids-und-indikatorenarchitektur/"],
    ["Kapitel 34 - T-SROI", "referenz/kapitel-034-t-sroi-und-systemische-transformationsmessung/"],
    ["Kapitel 42 - Unternehmen als Wirkungssysteme", "referenz/kapitel-042-unternehmen-als-wirkungssysteme/"],
    ["Kapitel 44 - Wirkungscontrolling im Unternehmen", "referenz/kapitel-044-wirkungscontrolling-im-unternehmen/"],
    ["Kapitel 59 - Kapitalmärkte und Fonds", "referenz/kapitel-059-kapitalmaerkte-und-fonds/"],
  ];
  return `<section class="section" aria-labelledby="book-anchors"><div class="section-header"><p class="hero-kicker">Online-Buch</p>${sectionTitle("book-anchors", "Anker im Online-Buch")}</div><div class="model-strip">${anchors.map(([label, link]) => `<a href="${href(base, link)}">${escapeHtml(label)}</a>`).join("")}</div></section>`;
}

function downloadBlock(base, items) {
  const available = items.filter((item) => item.href && exists(item.href));
  return `<section class="section" aria-labelledby="downloads"><div class="card"><p class="hero-kicker">Dossier & Export</p>${sectionTitle("downloads", "Downloads und Druck")}<p>Online-Volltext ist der Hauptzugang. Word-Dateien bleiben Export und Archiv.</p><div class="portal-card-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button>${available.map((item) => `<a class="btn btn-secondary" href="${href(base, item.href)}">${escapeHtml(item.label)}</a>`).join("")}</div></div></section>`;
}

function fulltextPage({ rel, title, subtitle, source, status, downloads, backHref, searchSection = "Wirkungsfelder" }) {
  const rendered = markdownToHtml(read(source.rel));
  page({
    rel,
    title: `${title} | Wirkungsökonomie`,
    description: subtitle,
    searchSection,
    searchType: status,
    body: (base, route) => `${hero(base, { kicker: status, title, subtitle, text: subtitle, action: `<a class="btn btn-primary" href="${href(base, backHref)}">Zur Übersicht</a>` })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section narrow">${metaBox(status)}</section>
    <section class="section narrow">${tocBlock(rendered.toc)}</section>
    <section class="section article-section"><article class="article-body fulltext-reader">${sectionTitle("online-volltext", "Online-Volltext")}${rendered.html}</article></section>
    ${toolGrid(base)}
    ${politicalBlock()}
    ${sdgBlock(base)}
    ${bookBlock(base)}
    ${sourcesBlock()}
    ${downloadBlock(base, downloads)}`,
  });
}

function financeMarketPage() {
  page({
    rel: "wirkungsfelder/wirtschaft-unternehmen/finanzmarktanforderungen/index.html",
    title: "Finanzmarktanforderungen an Unternehmen | Wirkungsökonomie",
    description: "Warum Banken, Börse, ESG-Ratings, Versicherungen und Lieferketten Wirkung schon heute finanzierungsrelevant machen.",
    body: (base, route) => `${hero(base, {
      kicker: "Wirtschaft & Unternehmen",
      title: "Finanzmarktanforderungen an Unternehmen",
      subtitle: "Warum Banken, Börse, ESG-Ratings, Versicherungen und Lieferketten Wirkung schon heute finanzierungsrelevant machen.",
      text: "Unternehmen werden nicht mehr nur durch Märkte und Regulierung gesteuert. Banken, Versicherungen, ESG-Ratinganbieter, Investoren, Großkund:innen und Lieferketten übersetzen Nachhaltigkeits- und Transformationsrisiken in Kapitalzugang, Kreditkonditionen, Versicherbarkeit, Ratings, Beschaffung und Unternehmenswert.",
      action: `<a class="btn btn-primary" href="${href(base, "wirkungsfelder/wirtschaft-unternehmen/detailkonzepte/finanzmarktanforderungen/")}">Detailkonzept online lesen</a>`,
    })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section narrow">${metaBox("Portalunterbereich / Online-Einstieg")}</section>
    <section class="section" aria-labelledby="finance-demands"><div class="section-header"><p class="hero-kicker">Finanzmarkt</p>${sectionTitle("finance-demands", "Was heute bereits verlangt wird")}<p>CSRD/ESRS, ESG-Ratings, Bankleitlinien, Versicherbarkeit, ORSA, Lieferkettenanforderungen und Sorgfaltspflichten erzeugen bereits heute finanzielle Rückkopplungen.</p></div>${cardGrid(base, [
      { title: "Banken und Kreditvergabe", text: "ESG- und Transformationsrisiken werden Teil von Kreditpolitik, Monitoring, Pricing und Portfolioanalyse." },
      { title: "Börse und Ratings", text: "ESG-Ratings, Indexlogiken und Investorenkommunikation beeinflussen Kapitalzugang und Unternehmenswert." },
      { title: "Versicherbarkeit", text: "Klimarisiken, Lieferketten, Standorte, Haftung, Cyberrisiken und Resilienz wirken auf Prämien und Deckung." },
      { title: "Lieferketten", text: "Großkund:innen und Abnehmer:innen ziehen Datenpflichten, Fragebögen und Nachweise in KMU-Strukturen hinein." },
    ])}</section>
    <section class="section" aria-labelledby="online-read"><div class="section-header"><p class="hero-kicker">Online lesen</p>${sectionTitle("online-read", "Detailkonzept und Dossier")}</div>${cardGrid(base, [
      { title: "Detailkonzept Finanzmarktanforderungen", text: "Systemische Einordnung von Banken, Börsen, ESG-Ratings, Versicherungen und Wirkungsökonomie.", href: "wirkungsfelder/wirtschaft-unternehmen/detailkonzepte/finanzmarktanforderungen/" },
      { title: "Dossier Finanzmarktanforderungen", text: "Beispiele, Datenquellen, Modellrechnungen, Finance Readiness Score und WÖk-Einordnung.", href: "wirkungsfelder/wirtschaft-unternehmen/dossiers/finanzmarktanforderungen/" },
      { title: "Finanzierbarkeit & Wirkungsfonds", text: "Querschnittsseite zu Sozialabgaben-Entkopplung, Automatisierung, Steuern und Wirkungsfonds.", href: "wirkungsfelder/finanzsystem-kapital/finanzierbarkeit-wirkungsfonds/" },
    ])}</section>
    ${toolGrid(base)}
    ${politicalBlock()}
    ${sdgBlock(base)}
    ${bookBlock(base)}
    ${sourcesBlock()}
    ${downloadBlock(base, [
      { label: "Detailkonzept Word", href: docs.financeDetail.download },
      { label: "Dossier Word", href: docs.financeDossier.download },
    ])}`,
  });
}

function fundsPage() {
  page({
    rel: "wirkungsfelder/finanzsystem-kapital/finanzierbarkeit-wirkungsfonds/index.html",
    title: "Finanzierbarkeit & Wirkungsfonds | Wirkungsökonomie",
    description: "Wie Wirkungseinkommen, Wirkungsrente, Gesundheit, Bildung, Wohnen und Transformation finanziert werden können.",
    body: (base, route) => `${hero(base, {
      kicker: "Finanzsystem & Kapital",
      title: "Finanzierbarkeit & Wirkungsfonds",
      subtitle: "Wie Wirkungseinkommen, Wirkungsrente, Gesundheit, Bildung, Wohnen und Transformation finanziert werden können.",
      text: "Die Wirkungsökonomie benötigt eine Finanzierungsarchitektur, die nicht ausschließlich an menschliche Erwerbsarbeit gekoppelt bleibt. Wirkung, automatisierte Wertschöpfung, Kapitalwirkung, Produktwirkung, Unternehmenswirkung und öffentliche Wirkungshaushalte werden als Finanzierungsbasis sichtbar.",
      action: `<a class="btn btn-primary" href="${href(base, "wirkungsfelder/finanzsystem-kapital/detailkonzepte/steuer-fondsarchitektur/")}">Detailkonzept online lesen</a>`,
    })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section narrow">${metaBox("Querschnittsportal / Online-Einstieg")}</section>
    <section class="section" aria-labelledby="finance-modules"><div class="section-header"><p class="hero-kicker">Architektur</p>${sectionTitle("finance-modules", "Kernmodule")}</div>${cardGrid(base, [
      { title: "Sozialabgaben entkoppeln", text: "Finanzierung sozialer Systeme darf nicht allein an menschlicher Lohnsumme hängen." },
      { title: "Automatisierungsbeitrag", text: "Maschinen- und KI-Wertschöpfung werden als gesellschaftliche Finanzierungsbasis diskutierbar." },
      { title: "Unternehmens- und Kapitalsteuern", text: "Wirkungskörperschaftsteuer, Gewerbesteuer, Vermögen, Erbschaft und Kapitalerträge werden wirkungsbezogen lesbar." },
      { title: "Wirkungsfonds", text: "Fonds bündeln Mittel für Bildung, Gesundheit, Wohnen, Rente, Innovation, Demokratie, Medien und Regeneration." },
    ])}</section>
    <section class="section" aria-labelledby="rank-map"><div class="section-header"><p class="hero-kicker">Portalzuordnung</p>${sectionTitle("rank-map", "Rank- und Portalzuordnung")}</div>${table(["Thema", "Zuordnung"], rankRows)}</section>
    <section class="section" aria-labelledby="funds-online"><div class="section-header"><p class="hero-kicker">Online lesen</p>${sectionTitle("funds-online", "Detailkonzept und Dossier")}</div>${cardGrid(base, [
      { title: "Detailkonzept Steuer- und Fondsarchitektur", text: "Finanzierbarkeit, Sozialabgaben-Entkopplung, Unternehmenssteuern, Vermögen und Wirkungsfonds.", href: "wirkungsfelder/finanzsystem-kapital/detailkonzepte/steuer-fondsarchitektur/" },
      { title: "Dossier Steuer- und Fondsarchitektur", text: "Modellrechnungen, Fondslandkarte, Mittelquellen und Umsetzungspfade.", href: "wirkungsfelder/finanzsystem-kapital/dossiers/steuer-fondsarchitektur/" },
      { title: "Wirkungssteuergesetz", text: "Rechtsrahmen und gesetzliche Dachlogik.", href: "werkstatt/gesetze/wirkungssteuergesetz/" },
    ])}</section>
    ${toolGrid(base)}
    ${politicalBlock()}
    ${sdgBlock(base)}
    ${bookBlock(base)}
    ${downloadBlock(base, [
      { label: "Detailkonzept Word", href: docs.fundsDetail.download },
      { label: "Dossier Word", href: docs.fundsDossier.download },
    ])}`,
  });
}

function updateIndexPage(rel, marker, cardHtml) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, "utf8");
  if (html.includes(marker)) return;
  const insertAfter = html.indexOf('<div class="card-grid three">');
  if (insertAfter < 0) return;
  const pos = html.indexOf("</article>", insertAfter);
  if (pos < 0) return;
  html = `${html.slice(0, pos + "</article>".length)}${cardHtml}${html.slice(pos + "</article>".length)}`;
  fs.writeFileSync(file, html, "utf8");
}

function indexCards() {
  updateIndexPage(
    "wirkungsfelder/wirtschaft-unternehmen/index.html",
    "finanzmarktanforderungen-card",
    `<article class="card" id="finanzmarktanforderungen-card"><p class="card-kicker">Kapitalzugang</p><h3 class="card-title">Finanzmarktanforderungen</h3><p class="card-text">Banken, Börse, ESG-Ratings, Versicherungen und Lieferketten machen Wirkung bereits heute finanzierungsrelevant.</p><div class="portal-card-actions"><a class="text-link" href="../../wirkungsfelder/wirtschaft-unternehmen/finanzmarktanforderungen/">Unterbereich öffnen</a></div></article>`,
  );
  updateIndexPage(
    "wirkungsfelder/finanzsystem-kapital/index.html",
    "finanzierbarkeit-wirkungsfonds-card",
    `<article class="card" id="finanzierbarkeit-wirkungsfonds-card"><p class="card-kicker">Querschnitt</p><h3 class="card-title">Finanzierbarkeit & Wirkungsfonds</h3><p class="card-text">Sozialabgaben-Entkopplung, Automatisierungsbeitrag, Wirkungssteuern und Fondsarchitektur als Finanzierungsbasis der Wirkungsökonomie.</p><div class="portal-card-actions"><a class="text-link" href="../../wirkungsfelder/finanzsystem-kapital/finanzierbarkeit-wirkungsfonds/">Querschnitt öffnen</a></div></article>`,
  );
}

function build() {
  financeMarketPage();
  fundsPage();
  fulltextPage({
    rel: "wirkungsfelder/wirtschaft-unternehmen/detailkonzepte/finanzmarktanforderungen/index.html",
    title: "Detailkonzept Finanzmarktanforderungen an Unternehmen",
    subtitle: "Einordnung von Banken, Börse, ESG-Ratings, Versicherungen und Wirkungsökonomie.",
    source: docs.financeDetail,
    status: "Detailkonzept / Online-Volltext",
    downloads: [{ label: "Detailkonzept Word", href: docs.financeDetail.download }],
    backHref: "wirkungsfelder/wirtschaft-unternehmen/finanzmarktanforderungen/",
  });
  fulltextPage({
    rel: "wirkungsfelder/wirtschaft-unternehmen/dossiers/finanzmarktanforderungen/index.html",
    title: "Dossier Finanzmarktanforderungen an Unternehmen",
    subtitle: "Beispiele, Datenquellen, Berechnungslogiken und WÖk-Einordnung.",
    source: docs.financeDossier,
    status: "Dossier / Online-Volltext",
    downloads: [{ label: "Dossier Word", href: docs.financeDossier.download }],
    backHref: "wirkungsfelder/wirtschaft-unternehmen/finanzmarktanforderungen/",
  });
  fulltextPage({
    rel: "wirkungsfelder/finanzsystem-kapital/detailkonzepte/steuer-fondsarchitektur/index.html",
    title: "Detailkonzept Steuer- und Fondsarchitektur",
    subtitle: "Finanzierbarkeit, Sozialabgaben-Entkopplung, Unternehmenssteuern, Vermögen und Wirkungsfonds.",
    source: docs.fundsDetail,
    status: "Detailkonzept / Online-Volltext",
    downloads: [{ label: "Detailkonzept Word", href: docs.fundsDetail.download }],
    backHref: "wirkungsfelder/finanzsystem-kapital/finanzierbarkeit-wirkungsfonds/",
  });
  fulltextPage({
    rel: "wirkungsfelder/finanzsystem-kapital/dossiers/steuer-fondsarchitektur/index.html",
    title: "Dossier Steuer- und Fondsarchitektur",
    subtitle: "Modellrechnungen, Fondslandkarte und Umsetzungspfade.",
    source: docs.fundsDossier,
    status: "Dossier / Online-Volltext",
    downloads: [{ label: "Dossier Word", href: docs.fundsDossier.download }],
    backHref: "wirkungsfelder/finanzsystem-kapital/finanzierbarkeit-wirkungsfonds/",
  });
  indexCards();
}

build();
