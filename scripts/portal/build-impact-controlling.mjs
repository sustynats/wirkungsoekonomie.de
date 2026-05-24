import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://wirkungsoekonomie.de";
const DATE = "2026-05-24";
const CSS_VERSION = "20260524-impact-controlling";
const JS_VERSION = "20260523-nachhaltigkeit";

const impactDownloads = [
  { label: "Konzeptpapier Word", href: "assets/downloads/woek_impact_controlling_konzeptpapier_v0_1.docx", required: true },
  { label: "Gesamtdossier Word", href: "assets/downloads/woek_impact_controlling_gesamtdossier_v0_1.docx", required: true },
];

const bookAnchors = [
  ["Kapitel 30 - Von Wirkung zu Messung", "referenz/kapitel-030-von-wirkung-zu-messung/"],
  ["Kapitel 31 - WÖk-IDs und Indikatorenarchitektur", "referenz/kapitel-031-woek-ids-und-indikatorenarchitektur/"],
  ["Kapitel 32 - Benchmarks, Skalen und Scorecards", "referenz/kapitel-032-benchmarks-skalen-und-scorecards/"],
  ["Kapitel 33 - Reverse Merit Order", "referenz/kapitel-033-reverse-merit-order/"],
  ["Kapitel 34 - T-SROI und systemische Transformationsmessung", "referenz/kapitel-034-t-sroi-und-systemische-transformationsmessung/"],
  ["Kapitel 35 - Digitale Produktpässe und Wirkungsdatenräume", "referenz/kapitel-035-digitale-produktpaesse-und-wirkungsdatenraeume/"],
  ["Kapitel 44 - Wirkungscontrolling im Unternehmen", "referenz/kapitel-044-wirkungscontrolling-im-unternehmen/"],
];

const impactSdgs = [
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
  "SDG+ Diskursfähigkeit",
  "SDG+ institutionelles Vertrauen",
  "SDG+ digitale Selbstbestimmung",
];

const externalSources = [
  ["UN SDGs", "https://sdgs.un.org/goals"],
  ["UN SDG Indicators", "https://unstats.un.org/sdgs/indicators/indicators-list/"],
  ["European Commission CSRD", "https://finance.ec.europa.eu/financial-markets/company-reporting-and-auditing/company-reporting/corporate-sustainability-reporting_en"],
  ["EFRAG ESRS", "https://www.efrag.org/en/sustainability-reporting"],
  ["GRI Standards", "https://www.globalreporting.org/standards/"],
  ["Eurostat NACE", "https://ec.europa.eu/eurostat/web/nace"],
  ["Destatis SDG-Indikatoren", "https://sdg-indikatoren.de/"],
];

const tools = [
  {
    title: "T-SROI",
    type: "Bewertungsmethode",
    status: "Dossier vorhanden",
    href: "werkzeuge/impact-controlling/t-sroi/",
    dossier: "werkzeuge/impact-controlling/dossiers/t-sroi/",
    short: "Transformational Social Return on Investment bewertet finanzielle, soziale, ökologische und systemische Transformationswirkung.",
    why: "T-SROI übersetzt Investitionen, Prävention und Transformation in eine nachvollziehbare Wirkungsrendite.",
  },
  {
    title: "Netto-Wirkungs-Index",
    type: "Kennzahl",
    status: "Dossier vorhanden",
    href: "werkzeuge/netto-wirkungs-index/",
    dossier: "werkzeuge/impact-controlling/dossiers/nwi/",
    short: "Der NWI ordnet positive, negative und neutrale Wirkung im WÖk-Rahmen operativ ein.",
    why: "Er verhindert, dass Wirkung nur als Story erzählt wird, und macht Vergleichbarkeit möglich.",
  },
  {
    title: "WÖk-IDs",
    type: "Datenarchitektur",
    status: "Dossier vorhanden",
    href: "werkzeuge/woek-ids/",
    dossier: "werkzeuge/impact-controlling/dossiers/woek-ids/",
    short: "WÖk-IDs verbinden SDGs, SDG+, NACE, ESRS, GRI, Quellen, Einheiten, Schwellen und Versionen.",
    why: "Sie bilden die Brücke zwischen Referenzrahmen und prüfbarer Wirkungsbewertung.",
  },
  {
    title: "Scorecards",
    type: "Bewertungsraster",
    status: "Dossier vorhanden",
    href: "werkzeuge/scorecards/",
    dossier: "werkzeuge/impact-controlling/dossiers/scorecards/",
    short: "Scorecards übersetzen Daten und Benchmarks in nachvollziehbare Skalen und Entscheidungslogik.",
    why: "Sie strukturieren Wirkung über Produkte, Organisationen, Projekte und Portfolios hinweg.",
  },
  {
    title: "Reverse Merit Order",
    type: "Schutzregel",
    status: "Dossier vorhanden",
    href: "werkzeuge/reverse-merit-order/",
    dossier: "werkzeuge/impact-controlling/dossiers/reverse-merit-order/",
    short: "Das schwächste kritische Wirkungsfeld begrenzt die Bewertung, damit negative Wirkung nicht schöngerechnet wird.",
    why: "Sie ist der Missbrauchsschutz gegen reine Durchschnitts- und Kompensationslogik.",
  },
  {
    title: "Benchmarks & Archetypen",
    type: "Vergleichslogik",
    status: "Dossier vorhanden",
    href: "werkzeuge/benchmarks-archetypen/",
    dossier: "werkzeuge/impact-controlling/dossiers/benchmarks-archetypen/",
    short: "Benchmarks und Archetypen ordnen Aktivitäten, Produkte und Organisationen in vergleichbare Wirkungskorridore ein.",
    why: "Ohne Vergleichsrahmen bleiben Scores abstrakt und nicht entscheidungsfähig.",
  },
  {
    title: "Datenqualität & Assurance",
    type: "Prüflogik",
    status: "Dossier vorhanden",
    href: "werkzeuge/datenqualitaet-assurance/",
    dossier: "werkzeuge/impact-controlling/dossiers/datenqualitaet-assurance/",
    short: "Datenqualität, Prüfstatus und Assurance sichern, dass Wirkungsdaten nicht zur Simulation werden.",
    why: "Impact Controlling braucht Verlässlichkeit, Versionierung und auditierbare Quellen.",
  },
  {
    title: "Digitale Produktpässe und Wirkungsdatenräume",
    type: "Dateninfrastruktur",
    status: "Dossier vorhanden",
    href: "werkzeuge/digitale-produktpaesse-wirkungsdatenraeume/",
    dossier: "werkzeuge/impact-controlling/dossiers/digitale-produktpaesse-wirkungsdatenraeume/",
    short: "Datenräume machen Produkt-, Lieferketten-, Prüf- und Wirkungsdaten interoperabel.",
    why: "Sie liefern die Infrastruktur, damit Wirkung nicht manuell zusammengesucht werden muss.",
  },
  {
    title: "KII statt KPI",
    type: "Steuerungslogik",
    status: "Dossier vorhanden",
    href: "werkzeuge/kii-statt-kpi/",
    dossier: "werkzeuge/impact-controlling/dossiers/kii-statt-kpi/",
    short: "Key Impact Indicators ergänzen klassische KPIs um Zustandsveränderungen, Nebenwirkungen und Rückkopplungen.",
    why: "Unternehmen und öffentliche Systeme brauchen Kennzahlen, die nicht nur Leistung, sondern Wirkung zeigen.",
  },
];

const dossierPages = [
  ["t-sroi", "T-SROI", "Transformational Social Return on Investment als Instrument für Investitionswirkung, Prävention, Transformation und systemische Rendite.", "T-SROI macht sichtbar, welche gesellschaftlichen, ökologischen und demokratischen Zustandsveränderungen durch Investitionen entstehen und wie sie im Verhältnis zum Ressourceneinsatz bewertet werden können."],
  ["nwi", "Netto-Wirkungs-Index", "Operative Kennzahl für positive, negative und neutrale Wirkung im WÖk-Rahmen.", "Der NWI verdichtet Wirkung nicht zu einer moralischen Behauptung, sondern ordnet geprüfte positive und negative Zustandsveränderungen transparent ein."],
  ["woek-ids", "WÖk-IDs", "Indikatorenarchitektur für SDGs, SDG+, Standards, Datenquellen und Prüfstatus.", "WÖk-IDs schaffen die methodische Adresse jedes Wirkungsindikators und verhindern Dopplung, Beliebigkeit und unklare Quellen."],
  ["scorecards", "Scorecards", "Bewertungsraster für Produkte, Organisationen, Projekte, Portfolios und Entscheidungen.", "Scorecards übersetzen Daten in Skalen, zeigen Datenqualität und machen Zielkonflikte entscheidungsrelevant."],
  ["reverse-merit-order", "Reverse Merit Order", "Nicht-Kompensation und rote Linien als Schutz gegen Schönrechnung.", "Die Reverse Merit Order begrenzt die Gesamtbewertung, wenn ein kritisches Wirkungsfeld schwere negative Wirkung zeigt."],
  ["benchmarks-archetypen", "Benchmarks & Archetypen", "Vergleichsrahmen für Branchen, Produkte, Aktivitäten und Organisationstypen.", "Benchmarks und Archetypen verhindern, dass Wirkung ohne Kontext bewertet wird."],
  ["datenqualitaet-assurance", "Datenqualität & Assurance", "Prüfstatus, Quellenklarheit, Versionierung, Datenlücken und externe Sicherung.", "Datenqualität entscheidet, ob Impact Controlling Vertrauen schafft oder nur neue Berichtsrhetorik produziert."],
  ["digitale-produktpaesse-wirkungsdatenraeume", "Digitale Produktpässe & Wirkungsdatenräume", "Interoperable Dateninfrastruktur für Produkt-, Lieferketten- und Wirkungsinformationen.", "Wirkungsdatenräume machen Daten anschlussfähig, prüfbar und wiederverwendbar."],
  ["kii-statt-kpi", "KII statt KPI", "Key Impact Indicators als Ergänzung klassischer Leistungskennzahlen.", "KII fragen nicht nur, was geleistet wurde, sondern welche Zustände dadurch verändert wurden."],
  ["beispielrechnungen", "Beispielrechnungen Impact Controlling", "Modellhafte Rechnungen für Scorecard, NWI und T-SROI.", "Beispielrechnungen machen die Methodik erfahrbar, ohne amtliche oder prüferische Einstufungen zu behaupten."],
];

const toolPages = [
  ["werkzeuge/impact-controlling/t-sroi/index.html", "T-SROI", "Transformational Social Return on Investment.", "T-SROI bewertet finanzielle, soziale, ökologische und systemische Transformationswirkung im Verhältnis zum Ressourceneinsatz.", "werkzeuge/impact-controlling/dossiers/t-sroi/"],
  ["werkzeuge/netto-wirkungs-index/index.html", "Netto-Wirkungs-Index", "Kennzahl für positive, negative und neutrale Wirkung.", "Der Netto-Wirkungs-Index ordnet Wirkung im Referenzrahmen der SDGs, Agenda 2030 und SDG+ ein.", "werkzeuge/impact-controlling/dossiers/nwi/"],
  ["werkzeuge/woek-ids/index.html", "WÖk-IDs", "Indikatorenarchitektur der Wirkungsökonomie.", "WÖk-IDs verbinden Referenzrahmen, Datenquellen, Einheiten, Schwellen, Versionen und Prüfstatus.", "werkzeuge/impact-controlling/dossiers/woek-ids/"],
  ["werkzeuge/scorecards/index.html", "Scorecards", "Bewertungsraster für Wirkung.", "Scorecards machen Zustandsveränderungen, Nebenwirkungen, Datenqualität und Zielkonflikte entscheidungsfähig.", "werkzeuge/impact-controlling/dossiers/scorecards/"],
  ["werkzeuge/reverse-merit-order/index.html", "Reverse Merit Order", "Das schwächste kritische Wirkungsfeld entscheidet.", "Die Reverse Merit Order verhindert, dass schwere negative Wirkung durch positive Einzelwerte kompensiert wird.", "werkzeuge/impact-controlling/dossiers/reverse-merit-order/"],
  ["werkzeuge/benchmarks-archetypen/index.html", "Benchmarks & Archetypen", "Vergleichslogik für Wirkungsbewertung.", "Benchmarks und Archetypen übersetzen Branchen-, Produkt- und Organisationstypen in nachvollziehbare Bewertungsräume.", "werkzeuge/impact-controlling/dossiers/benchmarks-archetypen/"],
  ["werkzeuge/datenqualitaet-assurance/index.html", "Datenqualität & Assurance", "Prüfbarkeit der Wirkungsdaten.", "Datenqualität, Prüfstatus und Assurance sichern, dass Wirkungsdaten belastbar bleiben.", "werkzeuge/impact-controlling/dossiers/datenqualitaet-assurance/"],
  ["werkzeuge/digitale-produktpaesse-wirkungsdatenraeume/index.html", "Digitale Produktpässe und Wirkungsdatenräume", "Dateninfrastruktur für prüfbare Wirkung.", "Digitale Produktpässe und Wirkungsdatenräume verbinden Produkt-, Lieferketten-, Prüf- und Wirkungsinformationen.", "werkzeuge/impact-controlling/dossiers/digitale-produktpaesse-wirkungsdatenraeume/"],
  ["werkzeuge/kii-statt-kpi/index.html", "KII statt KPI", "Key Impact Indicators für wirksame Steuerung.", "KII ergänzen klassische KPIs um Zustandsveränderungen, Nebenwirkungen und Rückkopplungen.", "werkzeuge/impact-controlling/dossiers/kii-statt-kpi/"],
];

function routeFor(rel) {
  return rel.endsWith("/index.html") ? `/${rel.slice(0, -"/index.html".length)}/` : `/${rel}`;
}

function baseFor(rel) {
  const depth = path.dirname(rel).split("/").filter(Boolean).length;
  return "../".repeat(depth);
}

function href(base, target) {
  if (!target) return "";
  if (/^(https?:|mailto:|#)/.test(target)) return target;
  return `${base}${target.replace(/^\/+/, "")}`;
}

function fileExists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function escapeHtml(value) {
  return String(value)
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
    .replace(/^-+|-+$/g, "");
}

function citeAnchor(id, label = "Zitierlink zu diesem Abschnitt") {
  return `<a class="cite-anchor no-print" href="#${id}" aria-label="${escapeHtml(label)}">#</a>`;
}

function sectionTitle(id, text) {
  return `<h2 id="${id}">${escapeHtml(text)} ${citeAnchor(id)}</h2>`;
}

function page({ rel, title, description, searchSection, searchType = "Werkzeug", body, extraScript = "" }) {
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
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title.replace(/\s+\|.*$/, ""))}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${SITE}/assets/img/generated/hero-systemgrafik-wirkungsoekonomie.png">
    <link rel="icon" href="${base}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=${CSS_VERSION}">
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="${base}index.html" aria-label="Wirkungsökonomie Startseite">
        <span class="brand-mark"><img src="${base}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span>
        <span class="brand-name">Wirkungsökonomie</span>
      </a>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav">
        <span class="nav-toggle-icon" aria-hidden="true">☰</span>
        <span class="sr-only">Menü</span>
      </button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation"><a href="${base}index.html">Start</a></nav>
    </header>
    <main>
      <p class="print-meta">Wirkungsökonomie · ${escapeHtml(title.replace(/\s+\|.*$/, ""))} · ${canonical} · Druckdatum: 24.05.2026</p>
${body(base, route)}
    </main>
    <script src="${base}assets/js/main.js?v=${JS_VERSION}"></script>
    ${extraScript ? `<script src="${base}${extraScript}"></script>` : ""}
  </body>
</html>
`, "utf8");
}

function printActions(extra = "") {
  return `<div class="hero-actions no-print">
      <button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button>
      ${extra}
    </div>`;
}

function citationNotice(route) {
  return `<aside class="citation-note" role="note">
      <p class="card-kicker">Zitierfähig</p>
      <h2>Online lesen, gezielt zitieren</h2>
      <p>Online-Volltext ist der Hauptzugang. Abschnittsanker können direkt zitiert werden; Downloads sind ergänzende Export- und Archivfassungen.</p>
      <p><a class="text-link" href="${route}">Kanonische Seitenadresse öffnen</a></p>
    </aside>`;
}

function statusMeta(status) {
  return `<aside class="card status-meta" aria-label="Dokumentstatus">
      <p class="card-kicker">Dokumentstatus</p>
      <dl>
        <div><dt>Autorin</dt><dd>Natalie Weber</dd></div>
        <div><dt>Referenz</dt><dd>Wirkungsökonomie</dd></div>
        <div><dt>Stand</dt><dd>24.05.2026</dd></div>
        <div><dt>Version</dt><dd>v0.1 / Webfassung</dd></div>
        <div><dt>Status</dt><dd>${escapeHtml(status)}</dd></div>
      </dl>
    </aside>`;
}

function cardGrid(base, items, cols = "three") {
  return `<div class="card-grid ${cols}">
    ${items.map((item) => `<article class="card">
      ${item.kicker ? `<p class="card-kicker">${escapeHtml(item.kicker)}</p>` : ""}
      <h3 class="card-title">${escapeHtml(item.title)}</h3>
      <p class="card-text">${escapeHtml(item.text)}</p>
      ${item.href ? `<div class="portal-card-actions"><a class="text-link" href="${href(base, item.href)}">${escapeHtml(item.label || "Online lesen")}</a></div>` : ""}
    </article>`).join("")}
  </div>`;
}

function dataTable(headers, rows) {
  return `<div class="table-wrap"><table class="data-table">
    <thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead>
    <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
  </table></div>`;
}

function hero(base, { kicker, title, subtitle, text, action }) {
  return `<section class="hero portal-hero">
    <div class="hero-content">
      <nav class="breadcrumb"><a href="${base}index.html">Start</a> / <a href="${base}werkzeuge/">Werkzeuge</a></nav>
      <p class="hero-kicker">${escapeHtml(kicker)}</p>
      <h1>${escapeHtml(title)}</h1>
      <p class="hero-subtitle">${escapeHtml(subtitle)}</p>
      <p>${escapeHtml(text)}</p>
      ${printActions(action || "")}
    </div>
  </section>`;
}

function toolGrid(base, selected = tools) {
  return `<section class="section" aria-labelledby="context-tools">
    <div class="section-header">
      <p class="hero-kicker">Kontext-Werkzeuge</p>
      ${sectionTitle("context-tools", "Werkzeuge in diesem Bereich")}
      <p>Impact Controlling ist der Methodenrahmen. Die Toolseiten bleiben kanonische Erklärorte; Dossiers vertiefen die jeweilige Anwendung.</p>
    </div>
    <div class="card-grid three context-tool-grid">
      ${selected.map((tool) => `<article class="card context-tool-card">
        <p class="card-kicker">${escapeHtml(tool.type)} · ${escapeHtml(tool.status)}</p>
        <h3 class="card-title">${escapeHtml(tool.title)}</h3>
        <p class="card-text">${escapeHtml(tool.short)}</p>
        <p class="card-text"><strong>Warum hier relevant?</strong> ${escapeHtml(tool.why)}</p>
        <div class="portal-card-actions">
          <a class="text-link" href="${href(base, tool.href)}">Toolseite öffnen</a>
          <a class="text-link" href="${href(base, tool.dossier)}">Dossier lesen</a>
        </div>
      </article>`).join("")}
    </div>
  </section>`;
}

function sdgBlock() {
  return `<section class="section" aria-labelledby="sdg-title">
    <div class="portal-reference-block">
      <p class="hero-kicker">Referenzrahmen</p>
      ${sectionTitle("sdg-title", "SDG-/SDG+-Bezug")}
      <h3>Relevante SDGs</h3>
      <div class="model-strip">${impactSdgs.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
      <h3>Relevante SDG+-Dimensionen</h3>
      <div class="model-strip">${sdgPlus.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
      <p>Impact Controlling bewertet Wirkung nicht als automatisch positiv, sondern als tatsächliche Zustandsveränderung. Zielgröße ist positive Netto-Wirkung für Mensch, Planet und Demokratie.</p>
      <p>SDG+ ist keine offizielle UN-Kategorie, sondern eine transparente Erweiterung der Wirkungsökonomie.</p>
    </div>
  </section>`;
}

function politicalBlock(base, context = "dieser Methodenbereich") {
  return `<section class="section" aria-labelledby="political-implementation">
    <div class="card">
      <p class="hero-kicker">Umsetzung</p>
      ${sectionTitle("political-implementation", "Politische Anschlussfähigkeit und Umsetzungsoptionen")}
      <p>Die folgenden politischen Anforderungen beschreiben keinen fertigen Parteibeschluss. Sie markieren den notwendigen Rahmen, damit dieses Wirkungsfeld demokratisch, rechtsstaatlich und praktisch umgesetzt werden kann. Unterschiedliche Parteien können innerhalb dieses Rahmens verschiedene Wege wählen. Entscheidend ist, dass die Wirkung sichtbar, überprüfbar und korrigierbar bleibt.</p>
      ${dataTable(["Ebene", "Aufgabe für Politik und Umsetzung"], [
        ["Aufgabe der Politik", `${context} braucht Mandat, Datenzugang, Prüfstandards, Verantwortlichkeiten und demokratische Korrekturwege.`],
        ["Politische Rahmenbedingungen", "WÖk-IDs, Scorecards, NWI, T-SROI, Datenqualität und Assurance müssen in Gesetze, Haushalte, Förderlogiken und Berichtspflichten übersetzbar sein."],
        ["Ausgestaltungsspielraum", "Parteien können unterschiedliche Prioritäten bei Tempo, Verbindlichkeit, Pilotierung, Förderung, Sanktionen und Rückverteilung setzen."],
        ["Zielkonflikte", "Präzision, Bürokratiearmut, Datenschutz, KMU-Belastung, Innovationsschutz, Vergleichbarkeit und öffentliche Kontrolle müssen politisch austariert werden."],
        ["Rollenverteilung", "EU, Bund, Länder, Kommunen, Verwaltung, Wirtschaft, Wissenschaft und Zivilgesellschaft tragen Daten, Standards, Evaluation, Beteiligung und Umsetzung gemeinsam."],
        ["Übergang und Schutz", "Soziale Abfederung, KMU-Schutz, Rechtsschutz, Datenschutz, Beteiligung und klare Korrekturverfahren schützen vor Überforderung und technokratischer Verengung."],
        ["Evaluation und Korrektur", "Wirkungsberichte, Revisionszyklen, unabhängige Assurance und öffentliche Konsultation halten die Methodik lernfähig."],
        ["Parteipolitische Anschlussfähigkeit", "Konservative, liberale, sozialdemokratische, grüne, linke, kommunale und wirtschaftsnahe Perspektiven können unterschiedliche Umsetzungsoptionen wählen."],
      ])}
      <p>Wirkungsdaten bereiten Entscheidungen vor, ersetzen sie aber nicht. Normative Entscheidungen bleiben demokratisch legitimiert.</p>
      <p><a class="text-link" href="${href(base, "wirkungsfelder/staat-recht-demokratie/")}">Staat, Recht &amp; Demokratie als Umsetzungsportal öffnen</a></p>
    </div>
  </section>`;
}

function bookBlock(base) {
  return `<section class="section" aria-labelledby="book-anchors">
    <div class="section-header">
      <p class="hero-kicker">Online-Buch</p>
      ${sectionTitle("book-anchors", "Anker im Online-Buch")}
      <p>Diese Kapitel bilden die methodische Grundlage für Wirkungsmessung, WÖk-IDs, Scorecards, T-SROI und Wirkungsdatenräume.</p>
    </div>
    <div class="model-strip">${bookAnchors.map(([label, link]) => `<a href="${href(base, link)}">${escapeHtml(label)}</a>`).join("")}</div>
  </section>`;
}

function externalSourcesBlock() {
  return `<section class="section" aria-labelledby="external-sources">
    <div class="card">
      <p class="hero-kicker">Quellen</p>
      ${sectionTitle("external-sources", "Quellen und Datenquellenregister")}
      <p class="card-text">Externe Quellen werden als Referenzen geführt. Die wirkungsökonomische Einordnung steht online auf dieser Website.</p>
      <div class="model-strip">${externalSources.map(([label, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)} <span class="sr-only">(externe Quelle)</span></a>`).join("")}</div>
    </div>
  </section>`;
}

function downloadBlock(base, items = impactDownloads) {
  const available = items.filter((item) => !item.required || fileExists(item.href));
  const missing = items.filter((item) => item.required && !fileExists(item.href));
  return `<section class="section" aria-labelledby="downloads">
    <div class="card">
      <p class="hero-kicker">Dossier & Export</p>
      ${sectionTitle("downloads", "Downloads und Druck")}
      <p class="card-text">Online-Volltext ist der Hauptzugang. Word/PDF-Dateien werden nur verlinkt, wenn sie im Repository vorhanden sind.</p>
      <div class="portal-card-actions no-print">
        <button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button>
        ${available.map((item) => `<a class="btn btn-secondary" href="${href(base, item.href)}">${escapeHtml(item.label)}</a>`).join("")}
      </div>
      ${missing.length ? `<p class="card-text">Noch nicht im Repository gefunden: ${missing.map((item) => escapeHtml(item.label)).join(", ")}. Es wird kein kaputter Downloadlink gesetzt.</p>` : ""}
    </div>
  </section>`;
}

function overviewPage() {
  page({
    rel: "werkzeuge/impact-controlling/index.html",
    title: "Impact Controlling | Wirkungsökonomie",
    description: "Impact Controlling übersetzt Wirkung in Steuerung, Controlling, Reporting, Risiko, Investition und Entscheidung.",
    searchSection: "Werkzeuge",
    body: (base, route) => `${hero(base, {
      kicker: "Methodenbereich",
      title: "Impact Controlling",
      subtitle: "Wirkung sichtbar, bewertbar und entscheidungsrelevant machen.",
      text: "Impact Controlling ist der methodische Dachbereich der Wirkungsökonomie. Es verbindet WÖk-IDs, Scorecards, NWI, T-SROI, Datenqualität, Benchmarks und Wirkungsdatenräume.",
      action: `<a class="btn btn-primary" href="${href(base, "werkzeuge/impact-controlling/dossier/")}">Gesamtdossier lesen</a>`,
    })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section narrow">${statusMeta("Methodenportal / Online-Volltext")}</section>
    <section class="section" aria-labelledby="logic">
      <div class="section-header">
        <p class="hero-kicker">Methodik</p>
        ${sectionTitle("logic", "Von Wirkung zu Entscheidung")}
        <p>Wirkung ist neutral und relational. Impact Controlling macht sichtbar, welche Zustände sich verändern, welche Nebenwirkungen entstehen, welche Daten belastbar sind und wie Entscheidungen auf positive Netto-Wirkung ausgerichtet werden können.</p>
      </div>
      ${cardGrid(base, [
        { title: "Messen", text: "WÖk-IDs, Datenquellen, Einheiten und Schwellen machen Wirkung adressierbar." },
        { title: "Bewerten", text: "Scorecards, Benchmarks, NWI und Reverse Merit Order ordnen Wirkung ein." },
        { title: "Steuern", text: "T-SROI, KII, Assurance und Wirkungsdatenräume machen Wirkung entscheidungsrelevant." },
      ])}
    </section>
    ${toolGrid(base)}
    <section class="section" aria-labelledby="dossiers">
      <div class="section-header">
        <p class="hero-kicker">Online-Volltexte</p>
        ${sectionTitle("dossiers", "Dossiers online lesen")}
        <p>Alle Dossiers sind als Webfassung mit Ankern angelegt. Die angekündigten Word-Dateien werden ergänzt, sobald sie im Repository vorliegen.</p>
      </div>
      ${cardGrid(base, dossierPages.map(([slug, title, text]) => ({
        title,
        text,
        href: `werkzeuge/impact-controlling/dossiers/${slug}/`,
        label: "Dossier lesen",
      })))}
    </section>
    ${politicalBlock(base)}
    ${sdgBlock()}
    ${bookBlock(base)}
    ${externalSourcesBlock()}
    ${downloadBlock(base)}`,
  });
}

function dossierOverview() {
  page({
    rel: "werkzeuge/impact-controlling/dossier/index.html",
    title: "Gesamtdossier Impact Controlling | Wirkungsökonomie",
    description: "Online-Gesamtdossier zu Impact Controlling, T-SROI, NWI, WÖk-IDs, Scorecards, Reverse Merit Order, Benchmarks, Assurance und KII.",
    searchSection: "Werkzeuge",
    searchType: "Dossier",
    body: (base, route) => `${hero(base, {
      kicker: "Gesamtdossier",
      title: "Gesamtdossier Impact Controlling",
      subtitle: "T-SROI, NWI, WÖk-IDs, Scorecards und Wirkungsdatenräume.",
      text: "Dieses Dossier bündelt die Methodenarchitektur des Impact Controllings. Es ist eine Online-Arbeitsfassung, bis die gelieferten Word-Dokumente im Repository vorliegen.",
      action: `<a class="btn btn-primary" href="${href(base, "erleben/impact-controlling-rechner/")}">Rechner öffnen</a>`,
    })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section narrow">${statusMeta("Gesamtdossier / Webfassung")}</section>
    <section class="section narrow">
      <nav class="toc-card" aria-label="Inhaltsverzeichnis">
        <h2>Inhaltsverzeichnis</h2>
        <ol>
          <li><a href="#methodenarchitektur">Methodenarchitektur</a></li>
          <li><a href="#rechenlogik">Rechenlogik</a></li>
          <li><a href="#einzeldossiers">Einzeldossiers</a></li>
          <li><a href="#tool-spezifikation">Tool-Spezifikation</a></li>
        </ol>
      </nav>
    </section>
    <section class="section article-section">
      <article class="article-body fulltext-reader">
        ${sectionTitle("methodenarchitektur", "Methodenarchitektur")}
        <p>Impact Controlling beginnt beim Referenzrahmen aus SDGs, Agenda 2030 und SDG+. Daraus werden WÖk-IDs, Scorecards, Benchmarks, NWI, T-SROI und Governance-Mechanismen abgeleitet.</p>
        ${sectionTitle("rechenlogik", "Rechenlogik")}
        ${dataTable(["Baustein", "Aufgabe", "Grenze"], [
          ["Scorecard", "Mehrdimensionale Bewertung von Wirkung", "Keine Schönrechnung kritischer Felder"],
          ["NWI", "Verdichtung positiver und negativer Wirkung", "Nur so belastbar wie Daten und Schwellen"],
          ["T-SROI", "Verhältnis von Ressourceneinsatz und Transformationswirkung", "Keine monetäre Totalsimulation von Würde, Demokratie oder Natur"],
          ["Assurance", "Prüfstatus und Datenqualität", "Prüfung ersetzt keine politische Bewertung"],
        ])}
        ${sectionTitle("einzeldossiers", "Einzeldossiers")}
        <p>Die Einzeldossiers vertiefen die Methodik. Jede Seite ist online lesbar, druckbar und mit Buchankern verbunden.</p>
        ${cardGrid(base, dossierPages.map(([slug, title, text]) => ({ title, text, href: `werkzeuge/impact-controlling/dossiers/${slug}/`, label: "Einzeldossier lesen" })))}
        ${sectionTitle("tool-spezifikation", "Tool-Spezifikation")}
        <p>Der Impact-Controlling-Rechner startet als einfache Demo mit Scorecard-, NWI- und T-SROI-Modul. Er ist keine Prüfung, keine Beratung und keine amtliche Einstufung.</p>
      </article>
    </section>
    ${toolGrid(base)}
    ${politicalBlock(base)}
    ${sdgBlock()}
    ${bookBlock(base)}
    ${externalSourcesBlock()}
    ${downloadBlock(base)}`,
  });
}

function singleDossierPages() {
  for (const [slug, title, subtitle, focus] of dossierPages) {
    const related = tools.filter((tool) => tool.dossier.endsWith(`/dossiers/${slug}/`) || title.includes(tool.title) || tool.title.includes(title));
    page({
      rel: `werkzeuge/impact-controlling/dossiers/${slug}/index.html`,
      title: `${title} | Impact Controlling Dossier`,
      description: `${subtitle} Online lesbares Einzeldossier mit SDG-/SDG+-Bezug, Buchankern, Kontext-Werkzeugen und Quellen.`,
      searchSection: "Werkzeuge",
      searchType: "Dossier",
      body: (base, route) => `${hero(base, {
        kicker: "Einzeldossier · Impact Controlling",
        title,
        subtitle,
        text: focus,
        action: `<a class="btn btn-primary" href="${href(base, "werkzeuge/impact-controlling/dossier/")}">Gesamtdossier öffnen</a>`,
      })}
      <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
      <section class="section narrow">${statusMeta("Einzeldossier / Webfassung")}</section>
      <section class="section narrow">
        <nav class="toc-card" aria-label="Inhaltsverzeichnis">
          <h2>Inhaltsverzeichnis</h2>
          <ol>
            <li><a href="#definition">Definition</a></li>
            <li><a href="#warum-noetig">Warum nötig?</a></li>
            <li><a href="#anwendung">Anwendung</a></li>
            <li><a href="#grenzen">Wirkungsgrenzen</a></li>
            <li><a href="#quellen">Quellen und Daten</a></li>
          </ol>
        </nav>
      </section>
      <section class="section article-section">
        <article class="article-body fulltext-reader">
          ${sectionTitle("definition", "Definition")}
          <p>${escapeHtml(focus)}</p>
          ${sectionTitle("warum-noetig", "Warum diese Methode nötig ist")}
          <p>Wirkung bleibt ohne klare Methode unscharf. Dieses Dossier zeigt, wie ${escapeHtml(title)} in der Wirkungsökonomie dazu beiträgt, Zustandsveränderungen sichtbar, bewertbar und entscheidungsrelevant zu machen.</p>
          ${sectionTitle("anwendung", "Anwendung")}
          <p>Angewendet wird die Methode in Unternehmen, Produkten, Lieferketten, öffentlichen Haushalten, Wirkungsfeldern und Dossiers. Entscheidend ist der Kontext: Nicht jede Methode passt zu jedem Wirkungsproblem.</p>
          ${sectionTitle("grenzen", "Wirkungsgrenzen und rote Linien")}
          <p>Die Methode darf nicht so verwendet werden, dass schwere negative Wirkungen unsichtbar werden. Datenlücken, schwache Prüfstände und politische Zielkonflikte müssen erkennbar bleiben.</p>
          ${sectionTitle("quellen", "Quellen und Daten")}
          <p>Grundlagen sind SDGs, SDG+, WÖk-IDs, CSRD/ESRS, GRI, NACE, verfügbare Produkt- und Organisationsdaten sowie die Online-Buchanker. Die angekündigte Word-Datei wird erst verlinkt, sobald sie im Repository liegt.</p>
        </article>
      </section>
      ${toolGrid(base, related.length ? related : tools.slice(0, 4))}
      ${politicalBlock(base)}
    ${sdgBlock()}
      ${bookBlock(base)}
      ${externalSourcesBlock()}
      ${downloadBlock(base, [
        { label: "Gesamtdossier online lesen", href: "werkzeuge/impact-controlling/dossier/" },
        { label: "Impact-Controlling-Rechner öffnen", href: "erleben/impact-controlling-rechner/" },
        { label: `Einzeldossier ${title} Word`, href: `assets/downloads/woek_einzeldossier_${slug.replaceAll("-", "_")}_v0_1.docx`, required: true },
      ])}`,
    });
  }
}

function toolExplanationPages() {
  for (const [rel, title, subtitle, description, dossier] of toolPages) {
    page({
      rel,
      title: `${title} | Wirkungsökonomie`,
      description,
      searchSection: "Werkzeuge",
      searchType: "Werkzeug",
      body: (base, route) => `${hero(base, {
        kicker: "Methodenregister",
        title,
        subtitle,
        text: description,
        action: `<a class="btn btn-primary" href="${href(base, dossier)}">Dossier lesen</a>`,
      })}
      <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
      <section class="section narrow">${statusMeta("Kanonische Toolseite / Webfassung")}</section>
      <section class="section">
        <div class="feature-grid">
          <article class="card" id="was-es-leistet"><p class="card-kicker">Funktion</p><h2 class="card-title">Was es leistet ${citeAnchor("was-es-leistet")}</h2><p class="card-text">${escapeHtml(description)}</p></article>
          <article class="card" id="angewendet-in"><p class="card-kicker">Anwendung</p><h2 class="card-title">Angewendet in ${citeAnchor("angewendet-in")}</h2><p class="card-text">Impact Controlling, Produkte & Konsum, Wirtschaft & Unternehmen, Lieferketten und öffentlichen Steuerungsfragen.</p></article>
          <article class="card" id="grenze"><p class="card-kicker">Grenze</p><h2 class="card-title">Nicht als Schönrechnung ${citeAnchor("grenze")}</h2><p class="card-text">Das Werkzeug darf negative Wirkung, Datenlücken oder rote Linien nicht verdecken.</p></article>
        </div>
      </section>
      ${toolGrid(base, tools.filter((tool) => tool.href === rel.replace("index.html", "") || tool.title === title).length ? tools.filter((tool) => tool.href === rel.replace("index.html", "") || tool.title === title) : tools.slice(0, 4))}
      ${politicalBlock(base)}
    ${sdgBlock()}
      ${bookBlock(base)}
      ${downloadBlock(base, [{ label: "Einzeldossier online lesen", href: dossier }, { label: "Gesamtdossier öffnen", href: "werkzeuge/impact-controlling/dossier/" }])}`,
    });
  }
}

function calculatorPage() {
  page({
    rel: "erleben/impact-controlling-rechner/index.html",
    title: "Impact-Controlling-Rechner | Wirkungsökonomie erleben",
    description: "Einfache Demo für Scorecard, Netto-Wirkungs-Index und T-SROI. Modellhaft, keine Prüfung und keine Beratung.",
    searchSection: "Erleben",
    searchType: "Demo",
    extraScript: "assets/js/impact-controlling-rechner.js?v=20260524-impact",
    body: (base, route) => `${hero(base, {
      kicker: "Demo · Modell V0.1",
      title: "Impact-Controlling-Rechner",
      subtitle: "Scorecard, NWI und T-SROI modellhaft ausprobieren.",
      text: "Die Demo zeigt die Grundlogik der Methoden. Sie ist keine Prüfung, keine Beratung und keine amtliche Einstufung.",
      action: `<a class="btn btn-primary" href="${href(base, "werkzeuge/impact-controlling/")}">Methodik öffnen</a>`,
    })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section narrow">${statusMeta("Demo / Prototyp")}</section>
    <section class="section product-calculator-section" aria-labelledby="impact-calculator-title">
      <div class="product-calculator" data-impact-controlling-calculator>
        <div class="section-header">
          <p class="hero-kicker">Rechner</p>
          ${sectionTitle("impact-calculator-title", "Impact Controlling simulieren")}
          <p>Scores sind von -3 bis +3 modelliert. Der FinalScore folgt der schwächsten Kernwirkung; der NWI zeigt eine einfache Netto-Differenz; T-SROI ist eine Demonstrationsquote.</p>
        </div>
        <div class="calculator-grid">
          <form class="card calculator-form">
            <label>Beispiel
              <select name="preset">
                <option value="praevention">Präventionsprojekt</option>
                <option value="produkt">Produkttransformation</option>
                <option value="lieferkette">Lieferkettenprogramm</option>
              </select>
            </label>
            <label>Investition in EUR
              <input name="investment" type="number" min="0" step="1000" value="100000">
            </label>
            <label>Jährlicher Wirkungswert in EUR
              <input name="annualValue" type="number" min="0" step="1000" value="160000">
            </label>
            <label>Wirkungsdauer in Jahren
              <input name="years" type="number" min="1" max="20" step="1" value="3">
            </label>
            <div class="score-inputs" aria-label="Scorecard-Scores">
              ${["mensch", "planet", "demokratie", "daten"].map((field) => `<label>${field[0].toUpperCase()}${field.slice(1)}
                <input name="${field}" type="number" min="-3" max="3" step="1" value="0">
              </label>`).join("")}
            </div>
          </form>
          <aside class="card calculator-result" aria-live="polite">
            <p class="card-kicker">Ergebnis</p>
            <h2 data-result="presetName">Präventionsprojekt</h2>
            <dl>
              <div><dt>FinalScore</dt><dd data-result="finalScore">0</dd></div>
              <div><dt>NWI Demo</dt><dd data-result="nwi">0,00</dd></div>
              <div><dt>T-SROI Demo</dt><dd data-result="tsroi">0,00 : 1</dd></div>
              <div><dt>Wirkungswert gesamt</dt><dd data-result="totalValue">0 EUR</dd></div>
            </dl>
            <p data-result="explanation">Modellhafte Demonstration.</p>
            <p class="scanner-notice"><strong>Hinweis:</strong> Modellhafte Demonstration. Keine Prüfung, keine Investitionsberatung, keine amtliche Einstufung.</p>
          </aside>
        </div>
      </div>
    </section>
    ${toolGrid(base)}
    ${politicalBlock(base)}
    ${sdgBlock()}
    ${bookBlock(base)}
    ${downloadBlock(base, [{ label: "Tool-Spezifikation online lesen", href: "werkzeuge/impact-controlling/dossier/#tool-spezifikation" }])}`,
  });
}

function workshopPages() {
  page({
    rel: "werkstatt/arbeitsbibliothek/instrumente/impact-controlling/index.html",
    title: "Impact Controlling in der Arbeitsbibliothek | Werkstatt",
    description: "Arbeitsbibliothek zu Impact Controlling: Konzept, Gesamtdossier, Einzeldossiers, Toolseiten, Rechner und Quellen.",
    searchSection: "Werkstatt",
    searchType: "Arbeitsbibliothek",
    body: (base, route) => `${hero(base, {
      kicker: "Arbeitsbibliothek · Instrumente",
      title: "Impact Controlling",
      subtitle: "Konzept, Dossiers, Einzeldossiers und Demo.",
      text: "Konzepte und Dossiers werden hier automatisch als Werkstatt-/Arbeitsbibliothek-Einträge geführt. Online lesen ist der Hauptzugang.",
      action: `<a class="btn btn-primary" href="${href(base, "werkzeuge/impact-controlling/")}">Methodenbereich öffnen</a>`,
    })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section">
      <div class="section-header">
        <p class="hero-kicker">Arbeitsbibliothek</p>
        ${sectionTitle("impact-library", "Online lesen vor Download")}
        <p>Die angekündigten Word-Dokumente werden verlinkt, sobald sie im Repository vorhanden sind. Bis dahin stehen die Webfassungen stabil bereit.</p>
      </div>
      ${cardGrid(base, [
        { title: "Impact Controlling", text: "Portal-/Werkzeug-Startseite.", href: "werkzeuge/impact-controlling/" },
        { title: "Gesamtdossier Impact Controlling", text: "Methodenarchitektur, Rechenlogik, Einzeldossiers und Tool-Spezifikation.", href: "werkzeuge/impact-controlling/dossier/" },
        { title: "Impact-Controlling-Rechner", text: "Scorecard-, NWI- und T-SROI-Demo.", href: "erleben/impact-controlling-rechner/" },
        ...dossierPages.map(([slug, title, text]) => ({ title, text, href: `werkzeuge/impact-controlling/dossiers/${slug}/` })),
      ])}
    </section>
    ${toolGrid(base)}
    ${downloadBlock(base)}`,
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
        { kicker: "Bildung", title: "Die Wirkungsschule", text: "Öffentliche Kurzfassung und Konzeptpapier zur Wirkungsschule.", href: "wirkungsfelder/bildung/wirkungsschule/" },
      ])}
    </section>
    ${downloadBlock(base, [
      ...impactDownloads,
      { label: "Produkt-Konzeptpapier Word", href: "assets/downloads/woek_produkte_konsum_wirkungsumsatzsteuer_konzeptpapier_v0_1.docx", required: true },
      { label: "Produkt-Dossier Word", href: "assets/downloads/woek_produkte_konsum_wirkungsumsatzsteuer_dossier_v0_1.docx", required: true },
    ])}`,
  });
}

function updateSitemap() {
  const sitemapPath = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(sitemapPath)) return;
  const urls = [
    "werkzeuge/impact-controlling/",
    "werkzeuge/impact-controlling/dossier/",
    ...dossierPages.map(([slug]) => `werkzeuge/impact-controlling/dossiers/${slug}/`),
    "werkzeuge/impact-controlling/t-sroi/",
    "werkzeuge/netto-wirkungs-index/",
    "werkzeuge/woek-ids/",
    "werkzeuge/scorecards/",
    "werkzeuge/reverse-merit-order/",
    "werkzeuge/benchmarks-archetypen/",
    "werkzeuge/datenqualitaet-assurance/",
    "werkzeuge/digitale-produktpaesse-wirkungsdatenraeume/",
    "werkzeuge/kii-statt-kpi/",
    "erleben/impact-controlling-rechner/",
    "werkstatt/arbeitsbibliothek/instrumente/impact-controlling/",
    "werkstatt/arbeitsbibliothek/konzepte-dossiers/",
  ];
  let sitemap = fs.readFileSync(sitemapPath, "utf8");
  for (const rel of urls) {
    sitemap = sitemap.replace(new RegExp(`\\s*<url>\\s*<loc>${SITE}/${rel}</loc>\\s*<lastmod>[^<]+</lastmod>\\s*</url>`, "g"), "");
    sitemap = sitemap.replace(new RegExp(`\\s*<url><loc>${SITE}/${rel}</loc><lastmod>[^<]+</lastmod></url>`, "g"), "");
  }
  const entries = urls.map((rel) => `  <url><loc>${SITE}/${rel}</loc><lastmod>${DATE}</lastmod></url>`).join("\n");
  sitemap = sitemap.replace("</urlset>", `${entries}\n</urlset>`);
  fs.writeFileSync(sitemapPath, sitemap, "utf8");
}

function build() {
  overviewPage();
  dossierOverview();
  singleDossierPages();
  toolExplanationPages();
  calculatorPage();
  workshopPages();
  updateSitemap();
}

build();
