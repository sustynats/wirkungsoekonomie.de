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
    <script src="${base}assets/js/main.js?v=${JS_VERSION}"></script>
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
  return `<aside class="card status-meta" aria-label="Dokumentstatus"><p class="card-kicker">Dokumentstatus</p><dl><div><dt>Autorin</dt><dd>Natalie Weber</dd></div><div><dt>Referenz</dt><dd>Wirkungsökonomie</dd></div><div><dt>Stand</dt><dd>24.05.2026</dd></div><div><dt>Version</dt><dd>v0.1 / Webfassung</dd></div><div><dt>Status</dt><dd>${escapeHtml(status)}</dd></div></dl></aside>`;
}

function mdToHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  const toc = [];
  let p = [];
  const flush = () => {
    if (!p.length) return;
    const text = p.join(" ");
    const id = `absatz-${String(html.length + 1).padStart(3, "0")}`;
    html.push(`<p id="${id}">${escapeHtml(text)} ${citeAnchor(id)}</p>`);
    p = [];
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    const h = line.match(/^(#{1,4})\s+(.+)$/);
    if (h) {
      flush();
      const level = Math.min(4, Math.max(2, h[1].length));
      const text = h[2].trim();
      const id = slugify(text);
      toc.push({ level, text, id });
      html.push(`<h${level} id="${id}">${escapeHtml(text)} ${citeAnchor(id)}</h${level}>`);
      continue;
    }
    if (/^\d+\.\s+/.test(line) || /^[-*]\s+/.test(line)) {
      flush();
      html.push(`<p>${escapeHtml(line.replace(/^(\d+\.\s+|[-*]\s+)/, ""))}</p>`);
      continue;
    }
    p.push(line);
  }
  flush();
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
    <section class="section narrow">${statusMeta("Portal / Rang 3")}</section>
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
        { kicker: "Rang 1", title: "Produktbesteuerung durch Wirkung", text: "Konzeptpapier online im Portal Produkte & Konsum.", href: "wirkungsfelder/produkte-konsum/produktbesteuerung-durch-wirkung/" },
        { kicker: "Rang 1", title: "Dossier Produkte & Konsum", text: "Rechenmodell, Tarifmatrix, Beispiele und Quellen.", href: "wirkungsfelder/produkte-konsum/dossier/" },
        { kicker: "Rang 2", title: "Impact Controlling", text: "Methodenportal zu T-SROI, NWI, WÖk-IDs und Scorecards.", href: "werkzeuge/impact-controlling/" },
        { kicker: "Rang 2", title: "Gesamtdossier Impact Controlling", text: "Gesamtdossier mit Einzeldossiers und Tool-Spezifikation.", href: "werkzeuge/impact-controlling/dossier/" },
        { kicker: "Rang 3", title: "Staat, Recht & Demokratie", text: "Portal zu Wirkung als Rechtsprinzip, WStG, Wirkungsrat und Wirkungshaushalt.", href: "wirkungsfelder/staat-recht-demokratie/" },
        { kicker: "Rang 3", title: "Gesamtdossier Staat, Recht & Demokratie", text: "Gesetzesarchitektur, politische Anschlussfähigkeit, Wirkungsrat und Umsetzungsoptionen.", href: "werkstatt/dossiers/staat-recht-demokratie/" },
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
