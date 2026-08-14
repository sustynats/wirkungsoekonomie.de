import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://wirkungsoekonomie.de";
const DATE = "2026-06-01";
const CSS_VERSION = "20260525-result-interpretation";
const JS_VERSION = "20260525-cta-cleanup";

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
    status: "Rechenstandard v1.1",
    href: "werkzeuge/t-sroi/",
    dossier: "werkzeuge/impact-controlling/methodenpapiere/t-sroi-transformationsmessung/",
    short: "T-SROI ergänzt eine direkte IOI-Geldrechnung nur um einen separat belegten, monetarisierten Transformationsnutzen.",
    why: "Er macht direkte und transformative Nutzenströme, Schäden, Zurechnung und Unsicherheit getrennt nachvollziehbar.",
  },
  {
    title: "Impact-of-Investment (IOI)",
    type: "Investitionskennzahl",
    status: "Dossier vorhanden",
    href: "werkzeuge/impact-controlling/impact-of-investment/",
    dossier: "werkzeuge/impact-controlling/dossiers/impact-of-investment/",
    short: "IOI setzt direkt monetarisierten, kausal begrenzten Nettonutzen in Euro ins Verhältnis zu Investition und inkrementellen Kosten.",
    why: "Er zeigt den dokumentierten direkten Nettonutzen je Ressourceneuro, ohne Profilpunkte in Geld umzuwandeln.",
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

const go10MethodPapers = [
  {
    number: 21,
    slug: "woek-ids-indikatorenarchitektur",
    title: "WÖk-IDs und Indikatorenarchitektur",
    subtitle: "Wie Wirkungsdaten eindeutig, prüfbar, vergleichbar und rückkoppelbar werden",
    source: "docs/impact-controlling/go10-methodenpapiere/online_volltext_21_woek_impact_controlling_woek_ids_indikatorenarchitektur_methodenpapier_v1_0.md",
    docx: null,
    pdf: "assets/downloads/21_woek_impact_controlling_woek_ids_indikatorenarchitektur_methodenpapier_v1_0.pdf",
    relatedTools: ["WÖk-IDs", "Scorecards", "Datenqualität & Assurance"],
    relatedPages: ["werkzeuge/woek-ids/", "werkzeuge/impact-controlling/", "werkzeuge/scorecards/"],
  },
  {
    number: 22,
    slug: "scorecards-benchmarks-nwi",
    title: "Scorecards, Benchmarks und Netto-Wirkungs-Index",
    subtitle: "Wie Wirkungsdaten zu prüfbaren Entscheidungen werden - ohne Kompensation, Scheingenauigkeit oder Personenbewertung",
    source: "docs/impact-controlling/go10-methodenpapiere/online_volltext_22_woek_impact_controlling_scorecards_benchmarks_nwi_methodenpapier_v1_0.md",
    docx: null,
    pdf: "assets/downloads/22_woek_impact_controlling_scorecards_benchmarks_nwi_methodenpapier_v1_0.pdf",
    relatedTools: ["Scorecards", "Netto-Wirkungs-Index", "Reverse Merit Order", "Benchmarks & Archetypen"],
    relatedPages: ["werkzeuge/scorecards/", "werkzeuge/netto-wirkungs-index/", "werkzeuge/reverse-merit-order/"],
  },
  {
    number: 23,
    slug: "t-sroi-transformationsmessung",
    title: "T-SROI-Rechenstandard",
    subtitle: "Kausale, diskontierte Netto-Nutzenrechnung für Transformationsinvestitionen",
    source: "docs/impact-controlling/go10-methodenpapiere/t-sroi-rechenstandard-v1_1.md",
    docx: null,
    pdf: "assets/downloads/23_woek_impact_controlling_t_sroi_transformationsmessung_methodenpapier_v1_1.pdf",
    pdfLabel: "PDF v1.1",
    currentMathStandard: true,
    relatedTools: ["T-SROI", "Netto-Wirkungs-Index", "WÖk-IDs", "Scorecards"],
    relatedPages: ["werkzeuge/t-sroi/", "werkzeuge/impact-controlling/"],
  },
];

const currentTsroiRechenstandard = go10MethodPapers.find((paper) => paper.currentMathStandard);

const wirkungscontrollingDetailDossier = {
  slug: "t-sroi-rechenstandard-v1-1",
  title: "T-SROI-Rechenstandard v1.1",
  text: "Aktuelle Rechenlogik für kausal zugerechnete, diskontierte Netto-Nutzen: getrennte direkte und transformative Nutzenströme, konservativ angesetzte Schäden und ein Schutz-Gate.",
  href: "werkzeuge/impact-controlling/methodenpapiere/t-sroi-transformationsmessung/",
};

const doubleMaterialityWorkpaper = {
  title: "Doppelte Wesentlichkeit, Impact-Controlling und Wirkungsökonomie",
  text: "Arbeitspapier zur Brücke von CSRD-/ESRS-Wesentlichkeitsprüfung über Impact-Management und Impact-Controlling bis zur wirkungsökonomischen Rückkopplung.",
  href: "dokumente/arbeitspapier-doppelte-wesentlichkeit-impact-controlling/",
  pdf: "public/downloads/originals/Arbeitspapier_Doppelte_Wesentlichkeit_Impact_Controlling_Wirkungsoekonomie.pdf",
};

const go10ToolCards = [
  ["WÖk-ID-Browser", "Methodenseite vorhanden", "werkzeuge/woek-ids/", "Wirkungsindikatoren, Quellen, SDG-Bezüge, Datenqualität und Versionen nachvollziehbar ordnen."],
  ["Scorecard-Generator", "Methodik", "werkzeuge/scorecards/", "Aus WÖk-IDs, Benchmarks und Datenqualität eine prüfbare Bewertungsoberfläche ableiten."],
  ["NWI-Rechner", "Methodik", "werkzeuge/netto-wirkungs-index/", "Positive, negative und neutrale Wirkung ohne freie Kompensation zusammenführen."],
  ["IOI-Rechner", "Methodik", "werkzeuge/impact-controlling/impact-of-investment/", "Positive Netto-Wirkung je investiertem Euro, Budget oder Kapitaleinsatz sichtbar machen."],
  ["T-SROI-Rechner", "Methodik", "werkzeuge/t-sroi/", "Direkten und separat belegten transformativen Nettonutzen, Schäden und Ressourcen in Euro getrennt abgrenzen und diskontieren; Datenqualität bleibt ein Prüfmerkmal."],
  ["Reverse-Merit-Order-Demo", "Methodik", "werkzeuge/reverse-merit-order/", "Rote Linien und schwächste kritische Wirkungsfelder sichtbar machen."],
  ["Datenqualitäts-/Assurance-Check", "Methodik", "werkzeuge/datenqualitaet-assurance/", "Prüfstatus, Datenherkunft, Schätzungen und Revisionsbedarf transparent markieren."],
];

const dossierPages = [
  ["impact-of-investment", "Impact-of-Investment (IOI)", "Kennzahl für positive Netto-Wirkung je investiertem Euro, Budget oder Kapitaleinsatz.", "IOI verbindet NWI, Investitionssumme und Entscheidungsvorlage: Er zeigt, ob Kapital in reale Zustandsverbesserung übersetzt wird, ohne rote Linien, Datenqualität oder demokratische Abwägung zu ersetzen."],
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
  ["werkzeuge/impact-controlling/impact-of-investment/index.html", "Impact-of-Investment (IOI)", "Direkt monetarisierter Nettonutzen je Ressourceneuro.", "IOI setzt direkt monetarisierten, kausal begrenzten Nettonutzen in Euro ins Verhältnis zu Investition und inkrementellen Kosten. Er ist keine Umrechnung von NWI-Punkten.", "werkzeuge/impact-controlling/dossiers/impact-of-investment/"],
  ["werkzeuge/t-sroi/index.html", "T-SROI", "Transformational Social Return on Investment.", "T-SROI ergänzt eine direkte IOI-Geldrechnung nur um einen separat belegten, monetarisierten Transformationsnutzen innerhalb derselben Systemgrenze und Preisbasis.", "werkzeuge/impact-controlling/methodenpapiere/t-sroi-transformationsmessung/"],
  ["werkzeuge/netto-wirkungs-index/index.html", "Netto-Wirkungs-Index", "Kennzahl für positive, negative und neutrale Wirkung.", "Der Netto-Wirkungs-Index ordnet Wirkung im Referenzrahmen der SDGs, Agenda 2030 und SDG+ ein.", "werkzeuge/impact-controlling/dossiers/nwi/"],
  ["werkzeuge/woek-ids/index.html", "WÖk-IDs", "Indikatorenarchitektur der Wirkungsökonomie.", "WÖk-IDs verbinden Referenzrahmen, Datenquellen, Einheiten, Schwellen, Versionen und Prüfstatus.", "werkzeuge/impact-controlling/dossiers/woek-ids/"],
  ["werkzeuge/scorecards/index.html", "Scorecards", "Bewertungsraster für Wirkung.", "Scorecards machen Zustandsveränderungen, Nebenwirkungen, Datenqualität und Zielkonflikte entscheidungsfähig.", "werkzeuge/impact-controlling/dossiers/scorecards/", { href: "begriffe/scorecard/", label: "Scorecard / Wirkungsscorecard" }],
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

function page({ rel, title, description, searchSection, searchType = "Werkzeug", body, extraScript = "", extraScripts = [], canonicalUrl = "", robots = "", redirectTarget = "" }) {
  const route = routeFor(rel);
  const base = baseFor(rel);
  const canonical = canonicalUrl || `${SITE}${route}`;
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
    ${robots ? `<meta name="robots" content="${escapeHtml(robots)}">` : ""}
    ${redirectTarget ? `<meta http-equiv="refresh" content="0; url=${escapeHtml(redirectTarget)}">` : ""}
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
    <link rel="stylesheet" href="${base}assets/css/style.css?v=20260612-mobile-table-fix">
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
    <script src="${base}assets/js/main.js?v=20260612-mobile-table-fix"></script>
    ${[extraScript, ...extraScripts].filter(Boolean).map((script) => `<script src="${base}${script}"></script>`).join("\n    ")}
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
      <p class="card-kicker">Onlinefassung</p>
      <h2>Du liest die Onlinefassung</h2>
      <p>Diese Seite ist der öffentliche Einstieg in die Methodik. Vertiefungen, Downloads und Arbeitsmaterial stehen weiter unten gesammelt bereit.</p>
    </aside>`;
}

function statusMeta(status) {
  return "";
}

function cardGrid(base, items, cols = "three") {
  return `<div class="card-grid ${cols}">
    ${items.map((item) => `<article class="card">
      ${item.kicker ? `<p class="card-kicker">${escapeHtml(item.kicker)}</p>` : ""}
      <h3 class="card-title">${escapeHtml(item.title)}</h3>
      <p class="card-text">${escapeHtml(item.text)}</p>
      ${item.href ? `<div class="portal-card-actions"><a class="text-link" href="${href(base, item.href)}">${escapeHtml(item.label || "Mehr erfahren")}</a></div>` : ""}
    </article>`).join("")}
  </div>`;
}

function dataTable(headers, rows) {
  return `<div class="table-wrap"><table class="data-table">
    <thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead>
    <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
  </table></div>`;
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a class="text-link" href="$2" target="_blank" rel="noopener noreferrer">$1 <span class="sr-only">(externe Quelle)</span></a>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function markdownBlocks(source, prefix) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let paragraph = [];
  let list = [];
  let table = [];
  const headings = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    blocks.push(`<ul>${list.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</ul>`);
    list = [];
  };
  const flushTable = () => {
    if (!table.length) return;
    const rows = table.map((line) => line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()));
    const separator = rows[1] || [];
    const hasHeader = rows.length > 1 && separator.length === rows[0].length && separator.every((cell) => /^:?-{3,}:?$/.test(cell));
    if (!hasHeader) {
      blocks.push(`<p>${table.map((line) => inlineMarkdown(line)).join(" ")}</p>`);
      table = [];
      return;
    }
    const header = rows[0];
    const body = rows.slice(2);
    blocks.push(`<div class="table-wrap"><table class="data-table"><thead><tr>${header.map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join("")}</tr></thead><tbody>${body.map((row) => `<tr>${header.map((_, index) => `<td>${inlineMarkdown(row[index] || "")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
    table = [];
  };
  const flushBlocks = () => {
    flushParagraph();
    flushList();
    flushTable();
  };

  // Die öffnende YAML-Zeile wird vor der Schleife entfernt. Sonst würde sie
  // fälschlich zugleich als schließende Zeile gelesen und die Metadaten als
  // Fließtext in der öffentlichen Onlinefassung erscheinen.
  let inFrontmatter = lines[0]?.trim() === "---";
  if (inFrontmatter) lines.shift();
  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (inFrontmatter) {
      if (line.trim() === "---") inFrontmatter = false;
      continue;
    }
    if (!line.trim()) {
      flushBlocks();
      continue;
    }
    if (line.trimStart().startsWith("|")) {
      flushParagraph();
      flushList();
      table.push(line);
      continue;
    }
    flushTable();
    const heading = /^(#{1,4})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      const outputLevel = Math.min(level + 1, 4);
      const text = heading[2].trim();
      const id = `${prefix}-${slugify(text)}`;
      headings.push({ level: outputLevel, text, id });
      blocks.push(`<h${outputLevel} id="${id}">${inlineMarkdown(text)} ${citeAnchor(id)}</h${outputLevel}>`);
      continue;
    }
    const quote = /^>\s*(.+)$/.exec(line);
    if (quote) {
      flushParagraph();
      flushList();
      blocks.push(`<aside class="citation-note" role="note"><p>${inlineMarkdown(quote[1])}</p></aside>`);
      continue;
    }
    const displayFormula = /^\$\$\s*(.+?)\s*\$\$$/.exec(line);
    if (displayFormula) {
      flushParagraph();
      flushList();
      blocks.push(`<div class="formula-box"><p><code>${inlineMarkdown(displayFormula[1])}</code></p></div>`);
      continue;
    }
    const bullet = /^[-*]\s+(.+)$/.exec(line);
    if (bullet) {
      flushParagraph();
      list.push(bullet[1]);
      continue;
    }
    paragraph.push(line.trim());
  }
  flushBlocks();
  return { html: blocks.join("\n"), headings };
}

function tocFromHeadings(headings) {
  const filtered = headings.filter((heading) => heading.level >= 2 && heading.level <= 3);
  if (!filtered.length) return "";
  return `<details class="toc-card no-print" aria-label="Inhaltsverzeichnis">
    <summary class="card-title">Inhaltsverzeichnis anzeigen</summary>
    <ol>${filtered.map((heading) => `<li class="toc-level-${heading.level}"><a href="#${heading.id}">${escapeHtml(heading.text)}</a></li>`).join("")}</ol>
  </details>`;
}

function hero(base, { kicker, title, subtitle, text, action, supporting = "" }) {
  return `<section class="hero portal-hero">
    <div class="hero-content">
      <nav class="breadcrumb"><a href="${base}index.html">Start</a> / <a href="${base}werkzeuge/">Werkzeuge</a></nav>
      <p class="hero-kicker">${escapeHtml(kicker)}</p>
      <h1>${escapeHtml(title)}</h1>
      <p class="hero-subtitle">${escapeHtml(subtitle)}</p>
      ${supporting}
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
      <p>Impact Controlling ist der Methodenrahmen. Interaktive Rechner werden als Rechner bezeichnet; statische Zielseiten führen als Methodik oder Dossier weiter.</p>
    </div>
    <div class="card-grid three context-tool-grid">
      ${selected.map((tool) => `<article class="card context-tool-card">
        <p class="card-kicker">${escapeHtml(tool.type)}</p>
        <h3 class="card-title">${escapeHtml(tool.title)}</h3>
        <p class="card-text">${escapeHtml(tool.short)}</p>
        <p class="card-text"><strong>Warum hier relevant?</strong> ${escapeHtml(tool.why)}</p>
        <div class="portal-card-actions">
          <a class="text-link" href="${href(base, tool.href)}">Methodik lesen</a>
          <a class="text-link" href="${href(base, tool.dossier)}">${tool.dossier.includes("methodenpapiere/") ? "Rechenstandard lesen" : "Dossier lesen"}</a>
        </div>
      </article>`).join("")}
    </div>
  </section>`;
}

function go10ToolGrid(base) {
  return `<section class="section" aria-labelledby="go10-tools">
    <div class="section-header">
      <p class="hero-kicker">Tool-Suite</p>
      ${sectionTitle("go10-tools", "Methoden in Werkzeuglogik übersetzen")}
      <p>Die Methodenpapiere beschreiben die fachliche Logik. Die Karten führen zu Methodenseiten; sie versprechen keine Interaktion, wenn keine Bedienoberfläche vorhanden ist.</p>
    </div>
    <div class="card-grid three context-tool-grid">
      ${go10ToolCards.map(([title, status, link, text]) => `<article class="card context-tool-card">
        <p class="card-kicker">${escapeHtml(status)}</p>
        <h3 class="card-title">${escapeHtml(title)}</h3>
        <p class="card-text">${escapeHtml(text)}</p>
        <div class="portal-card-actions"><a class="text-link" href="${href(base, link)}">Methodik lesen</a></div>
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
        ["Politische Rahmenbedingungen", "WÖk-IDs, Scorecards, NWI, IOI, T-SROI, Datenqualität und Assurance müssen in Gesetze, Haushalte, Förderlogiken und Berichtspflichten übersetzbar sein."],
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
      <p>Diese Kapitel bilden die methodische Grundlage für Wirkungsmessung, WÖk-IDs, Scorecards, NWI, IOI, T-SROI und Wirkungsdatenräume.</p>
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
      <p class="hero-kicker">Downloads</p>
      ${sectionTitle("downloads", "Vertiefung und Arbeitsmaterial")}
      <p class="card-text">Du liest die Onlinefassung. Word/PDF-Dateien und Druckfunktion ergänzen sie als Arbeitsmaterial.</p>
      <div class="portal-card-actions no-print">
        <button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button>
        ${available.map((item) => `<a class="btn btn-secondary" href="${href(base, item.href)}">${escapeHtml(item.label)}</a>`).join("")}
      </div>
      ${missing.length ? `<p class="card-text">Noch nicht als Download vorhanden: ${missing.map((item) => escapeHtml(item.label)).join(", ")}. Es wird kein kaputter Downloadlink gesetzt.</p>` : ""}
    </div>
  </section>`;
}

function methodPaperCardGrid(base) {
  return `<div class="card-grid three">
    ${go10MethodPapers.map((paper) => `<article class="card">
      <p class="card-kicker">Methodenpapier ${paper.number}</p>
      <h3 class="card-title">${escapeHtml(paper.title)}</h3>
      <p class="card-text">${escapeHtml(paper.subtitle)}</p>
      <div class="portal-card-actions">
        <a class="text-link" href="${href(base, `werkzeuge/impact-controlling/methodenpapiere/${paper.slug}/`)}">Methodenpapier lesen</a>
        ${paper.docx && fileExists(paper.docx) ? `<a class="text-link" href="${href(base, paper.docx)}">DOCX</a>` : ""}
        ${paper.pdf && fileExists(paper.pdf) ? `<a class="text-link" href="${href(base, paper.pdf)}">${escapeHtml(paper.pdfLabel || "PDF")}</a>` : ""}
      </div>
    </article>`).join("")}
  </div>`;
}

function impactCrossLinks(base) {
  return `<section class="section" aria-labelledby="impact-crosslinks">
    <div class="section-header">
      <p class="hero-kicker">Querverlinkung</p>
      ${sectionTitle("impact-crosslinks", "Methodenanschluss in Wirkungsfeldern")}
      <p>Impact Controlling ist eine Querschnittsmethodik. Die folgenden Bereiche zeigen typische Anwendungsräume.</p>
    </div>
    ${cardGrid(base, [
      { title: "SDG-/SDG+-Referenzrahmen", text: "Ziel- und Risikorahmen für positive, negative und neutrale Wirkung.", href: "verstehen/sdgs-sdgplus/", label: "Öffnen" },
      { title: "Produkte & Konsum", text: "WUStG, Produktscorecards, Lieferketten und Produktpässe.", href: "wirkungsfelder/produkte-konsum/", label: "Öffnen" },
      { title: "Wirtschaft & Unternehmen", text: "Wirkungscontrolling, Risiko, Finanzierung, Führung und Transformation.", href: "wirkungsfelder/wirtschaft-unternehmen/", label: "Öffnen" },
      { title: "Staat, Recht & Demokratie", text: "Wirkungsrat, Wirkungshaushalt, WStG und rechtsstaatliche Korrektur.", href: "wirkungsfelder/staat-recht-demokratie/", label: "Öffnen" },
      { title: "Finanzsystem & Kapital", text: "Kapitalwirkung, Wirkungsfonds, Banken, Versicherungen und Portfolio-Steuerung.", href: "wirkungsfelder/finanzsystem-kapital/", label: "Öffnen" },
      { title: "Bildung", text: "Wirkungskompetenz, Bildungswirkung, Schulentwicklung und Schutz vor Personenbewertung.", href: "wirkungsfelder/bildung/", label: "Öffnen" },
      { title: "Gesundheit & Pflege", text: "Prävention, Pflege, Gesundheitswirkung und T-SROI für öffentliche Investitionen.", href: "wirkungsfelder/gesundheit-pflege/", label: "Öffnen" },
      { title: "Wohnen & Stadt", text: "Wohnwirkungsindex, Warmmietenneutralität, Sanierung und Quartierswirkung.", href: "wirkungsfelder/wohnen-stadt/", label: "Öffnen" },
      { title: "Klima, Energie & Ressourcen", text: "Emissionspfade, Ressourcenwirkung, Energieinfrastruktur und Systemgrenzen.", href: "wirkungsfelder/klima-energie-ressourcen/", label: "Öffnen" },
    ])}
  </section>`;
}

function methodPaperDownloadItems(paper) {
  return [
    ...(paper.docx && fileExists(paper.docx) ? [{ label: `${paper.title} DOCX`, href: paper.docx, required: true }] : []),
    ...(paper.pdf && fileExists(paper.pdf) ? [{ label: `${paper.title} ${paper.pdfLabel || "PDF"}`, href: paper.pdf, required: true }] : []),
    { label: "Impact Controlling öffnen", href: "werkzeuge/impact-controlling/" },
    { label: "Impact-Controlling-Demo öffnen", href: "erleben/impact-controlling-rechner/" },
  ];
}

function methodPaperDownloadActions(base, paper) {
  const actions = [];
  if (paper.docx && fileExists(paper.docx)) actions.push(`<a class="btn btn-primary" href="${href(base, paper.docx)}">DOCX herunterladen</a>`);
  if (paper.pdf && fileExists(paper.pdf)) actions.push(`<a class="btn btn-secondary" href="${href(base, paper.pdf)}">${escapeHtml(paper.pdfLabel || "PDF")} herunterladen</a>`);
  return actions.join("");
}

function tsroiRechenstandardLink(base, className = "text-link", label = "T-SROI-Rechenstandard PDF v1.1") {
  if (!currentTsroiRechenstandard?.pdf || !fileExists(currentTsroiRechenstandard.pdf)) return "";
  return `<a class="${className}" href="${href(base, currentTsroiRechenstandard.pdf)}">${escapeHtml(label)}</a>`;
}

function tsroiRechenstandardSourceLink(base, className = "text-link") {
  return `<a class="${className}" href="${href(base, "quellenarchiv/wok-q-1024/")}">Quellenarchiv WÖK-Q-1024</a>`;
}

function currentTsroiRechenstandardBlock(base, paper) {
  if (!paper.currentMathStandard) return "";
  return `<section class="section narrow"><aside class="citation-note" role="note">
    <p class="card-kicker">Aktueller Rechenstandard</p>
    <h2>Die Geldrechnung bleibt kausal und diskontiert</h2>
    <p>Für aktuelle T-SROI-Rechnungen gelten getrennt belegte direkte und transformative Nutzenströme, Schäden innerhalb der Bilanzgrenze und ein Schutz-Gate. Freie Transformations-, Resilienz- oder Datenqualitätsmultiplikatoren gehören nicht in den Quotienten.</p>
    <p>${tsroiRechenstandardLink(base, "text-link")} · ${tsroiRechenstandardSourceLink(base)}</p>
  </aside></section>`;
}

function methodPapersForTool(title) {
  const normalized = title.toLowerCase();
  return go10MethodPapers.filter((paper) => {
    const paperTitle = paper.title.toLowerCase();
    return paperTitle.includes(normalized)
      || (normalized.includes("wök") && paper.slug.includes("woek-ids"))
      || (normalized.includes("score") && paper.slug.includes("scorecards"))
      || (normalized.includes("netto") && paper.slug.includes("nwi"))
      || (normalized.includes("t-sroi") && paper.slug.includes("t-sroi"))
      || (normalized.includes("impact-of-investment") && paper.slug.includes("t-sroi"))
      || (normalized.includes("ioi") && paper.slug.includes("t-sroi"))
      || (normalized.includes("reverse") && paper.slug.includes("scorecards"));
  });
}

function overviewPage() {
  page({
    rel: "werkzeuge/impact-controlling/index.html",
    title: "Impact Controlling | Wirkungsökonomie",
    description: "Impact Controlling übersetzt Wirkung in Steuerung, Controlling, Reporting, Risiko, IOI, T-SROI, Investition und Entscheidung.",
    searchSection: "Werkzeuge",
    body: (base, route) => `${hero(base, {
      kicker: "Methodenbereich",
      title: "Impact Controlling",
      subtitle: "Wirkung sichtbar, bewertbar und entscheidungsrelevant machen.",
      text: "Impact Controlling ist der methodische Dachbereich der Wirkungsökonomie. Es verbindet WÖk-IDs, Scorecards, NWI, IOI, T-SROI, Datenqualität, Benchmarks und Wirkungsdatenräume.",
      action: `<a class="btn btn-primary" href="${href(base, wirkungscontrollingDetailDossier.href)}">T-SROI-Rechenstandard lesen</a>${tsroiRechenstandardLink(base, "btn btn-secondary", "T-SROI-Rechenstandard PDF v1.1")}<a class="btn btn-secondary" href="${href(base, "werkzeuge/impact-controlling/dossier/")}">Gesamtdossier lesen</a>`,
    })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section narrow">${statusMeta("Methodenportal / Online-Volltext")}</section>
    <section class="section" aria-labelledby="logic">
      <div class="section-header">
        <p class="hero-kicker">Methodik</p>
        ${sectionTitle("logic", "Von Wirkung zu Entscheidung")}
        <p>Wirkung ist neutral und relational. Impact Controlling macht sichtbar, welche Zustände sich verändern, welche Nebenwirkungen entstehen, welche Daten belastbar sind und wie Entscheidungen auf positive Netto-Wirkung, wirksamen Kapitaleinsatz und lernende Rückkopplung ausgerichtet werden können.</p>
      </div>
    ${cardGrid(base, [
        { title: "Messen", text: "WÖk-IDs, Datenquellen, Einheiten und Schwellen machen Wirkung adressierbar." },
        { title: "Bewerten", text: "Scorecards, Benchmarks, NWI, IOI und Reverse Merit Order ordnen Wirkung ein." },
        { title: "Steuern", text: "IOI, T-SROI, KII, Assurance und Wirkungsdatenräume machen Wirkung entscheidungsrelevant." },
      ])}
    </section>
    <section class="section section-soft" aria-labelledby="iooi-evidenz">
      <div class="section-header">
        <p class="hero-kicker">Evidenzlogik</p>
        ${sectionTitle("iooi-evidenz", "Vom Projektmodell zur steuerungsfähigen Wirkung")}
        <p>IOOI und Theory of Change ordnen den Wirkpfad: Welche Inputs ermöglichen welche Aktivitäten, welche Outputs entstehen, welche Outcomes werden beobachtet und welcher Impact ist plausibel oder nachweisbar? Das ist keine Ersatzmessung für Wirkung, sondern die Grundlage, um Annahmen, Datenlücken, Attribution und Nebenwirkungen offen zu legen.</p>
      </div>
      ${cardGrid(base, [
        { title: "Vor der Wirkung", text: "Auslöser, Wirkungspotenzial, Wirkungsrisiko und Wirkmechanismus werden als Annahmen oder Risiken gekennzeichnet – nicht als eingetretene Wirkung." },
        { title: "IOOI und Evidenz", text: "Input → Aktivität → Output → Outcome → Impact trennt Ressourceneinsatz, Leistung und Veränderung. Output ist keine Wirkung; Outcome ist eine Wirkungsebene." },
        { title: "Bewertung und Steuerung", text: "Die WÖk bewertet nach SDGs, Agenda 2030 und SDG+, schützt durch Nichtkompensation und übersetzt Ergebnisse in Investitions-, Beschaffungs- und Managemententscheidungen." },
      ])}
      <p><a class="text-link" href="${href(base, "verstehen/iooi-und-wirkungsoekonomie/")}">IOOI und Wirkungsökonomie im vollständigen Überblick</a></p>
    </section>
    ${toolGrid(base)}
    <section class="section" aria-labelledby="methodenpapiere">
      <div class="section-header">
        <p class="hero-kicker">Go 10 · Methodenpapiere</p>
        ${sectionTitle("methodenpapiere", "Ausführliche Methodenpapiere")}
        <p>Diese Veröffentlichungen sind Methodenpapiere für Impact Controlling, WÖk-IDs, Scorecards, NWI, IOI und T-SROI. Sie sind keine Ausarbeitungen eines einzelnen Wirkungsfelds, sondern methodische Grundlagen für mehrere Wirkungsfelder.</p>
      </div>
      <div class="card-grid three">
        <article class="card">
          <p class="card-kicker">Aktuelle Rechenfassung · v1.1</p>
          <h3 class="card-title">${escapeHtml(wirkungscontrollingDetailDossier.title)}</h3>
          <p class="card-text">Kausale, diskontierte Netto-Nutzenrechnung mit klarer Trennung von Profilwerten, Geldströmen und Schutz-Gate.</p>
          <div class="portal-card-actions"><a class="text-link" href="${href(base, wirkungscontrollingDetailDossier.href)}">Rechenstandard lesen</a>${tsroiRechenstandardLink(base)}</div>
        </article>
        <article class="card">
          <p class="card-kicker">Arbeitspapier · CSRD-Brücke</p>
          <h3 class="card-title">${escapeHtml(doubleMaterialityWorkpaper.title)}</h3>
          <p class="card-text">${escapeHtml(doubleMaterialityWorkpaper.text)}</p>
          <div class="portal-card-actions"><a class="text-link" href="${href(base, doubleMaterialityWorkpaper.href)}">Einordnung lesen</a><a class="text-link" href="${href(base, doubleMaterialityWorkpaper.pdf)}">PDF</a></div>
        </article>${methodPaperCardGrid(base).replace(/^<div class="card-grid three">|<\/div>$/g, "")}
      </div>
    </section>
    ${go10ToolGrid(base)}
    ${impactCrossLinks(base)}
    <section class="section" aria-labelledby="dossiers">
      <div class="section-header">
        <p class="hero-kicker">Online-Volltexte</p>
        ${sectionTitle("dossiers", "Dossiers online lesen")}
        <p>Alle Dossiers sind als Webfassung mit Ankern angelegt. Downloads stehen gesammelt am Seitenende.</p>
      </div>
      <div class="card-grid three">
        <article class="card">
          <p class="card-kicker">Aktuelle Rechenfassung · v1.1</p>
          <h3 class="card-title">${escapeHtml(wirkungscontrollingDetailDossier.title)}</h3>
          <p class="card-text">${escapeHtml(wirkungscontrollingDetailDossier.text)}</p>
          <div class="portal-card-actions"><a class="text-link" href="${href(base, wirkungscontrollingDetailDossier.href)}">Rechenstandard lesen</a>${tsroiRechenstandardLink(base)}</div>
        </article>
        <article class="card">
          <p class="card-kicker">Arbeitspapier · Doppelte Wesentlichkeit</p>
          <h3 class="card-title">${escapeHtml(doubleMaterialityWorkpaper.title)}</h3>
          <p class="card-text">${escapeHtml(doubleMaterialityWorkpaper.text)}</p>
          <div class="portal-card-actions"><a class="text-link" href="${href(base, doubleMaterialityWorkpaper.href)}">Einordnung lesen</a><a class="text-link" href="${href(base, doubleMaterialityWorkpaper.pdf)}">PDF</a></div>
        </article>${cardGrid(base, dossierPages.map(([slug, title, text]) => ({
        title,
        text,
        href: `werkzeuge/impact-controlling/dossiers/${slug}/`,
        label: "Dossier lesen",
      }))).replace(/^<div class="card-grid three">|<\/div>$/g, "")}
      </div>
    </section>
    ${politicalBlock(base)}
    ${sdgBlock()}
    ${bookBlock(base)}
    ${externalSourcesBlock()}
    ${downloadBlock(base, [
      ...impactDownloads,
      { label: doubleMaterialityWorkpaper.title, href: doubleMaterialityWorkpaper.pdf },
      ...go10MethodPapers.flatMap(methodPaperDownloadItems),
    ])}`,
  });
}

function dossierOverview() {
  page({
    rel: "werkzeuge/impact-controlling/dossier/index.html",
    title: "Gesamtdossier Impact Controlling | Wirkungsökonomie",
    description: "Online-Gesamtdossier zu Impact Controlling, IOI, T-SROI, NWI, WÖk-IDs, Scorecards, Reverse Merit Order, Benchmarks, Assurance und KII.",
    searchSection: "Werkzeuge",
    searchType: "Dossier",
    body: (base, route) => `${hero(base, {
      kicker: "Gesamtdossier",
      title: "Gesamtdossier Impact Controlling",
      subtitle: "NWI, IOI, T-SROI, WÖk-IDs, Scorecards und Wirkungsdatenräume.",
      text: "Dieses Dossier bündelt die Methodenarchitektur des Impact Controllings und verweist auf passende Demos, Einzeldossiers, Investitionskennzahlen und Arbeitsmaterialien.",
      action: `<a class="btn btn-primary" href="${href(base, "erleben/impact-controlling-rechner/")}">Demo öffnen</a>`,
    })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section narrow">${statusMeta("Gesamtdossier / Webfassung")}</section>
    <section class="section narrow">
      <details class="toc-card no-print" aria-label="Inhaltsverzeichnis">
        <summary class="card-title">Inhaltsverzeichnis anzeigen</summary>
        <ol>
          <li><a href="#methodenarchitektur">Methodenarchitektur</a></li>
          <li><a href="#rechenlogik">Rechenlogik</a></li>
          <li><a href="#einzeldossiers">Einzeldossiers</a></li>
          <li><a href="#methodik-demo">Methodik und Demo-Grenzen</a></li>
        </ol>
      </details>
    </section>
    <section class="section article-section">
      <article class="article-body fulltext-reader">
        ${sectionTitle("methodenarchitektur", "Methodenarchitektur")}
        <p>Impact Controlling beginnt beim Referenzrahmen aus SDGs, Agenda 2030 und SDG+. Daraus werden WÖk-IDs, Scorecards, Benchmarks, NWI, IOI, T-SROI und Governance-Mechanismen abgeleitet.</p>
        ${sectionTitle("rechenlogik", "Rechenlogik")}
        ${dataTable(["Baustein", "Aufgabe", "Grenze"], [
          ["Scorecard", "Mehrdimensionale Bewertung von Wirkung", "Keine Schönrechnung kritischer Felder"],
          ["NWI", "Verdichtung positiver und negativer Wirkung", "Nur so belastbar wie Daten und Schwellen"],
          ["IOI", "Positive Netto-Wirkung je investiertem Euro oder Budget", "Nicht als Autopilot für Investitionsentscheidungen verwenden"],
          ["T-SROI", "Verhältnis von Ressourceneinsatz und Transformationswirkung", "Keine monetäre Totalsimulation von Würde, Demokratie oder Natur"],
          ["Assurance", "Prüfstatus und Datenqualität", "Prüfung ersetzt keine politische Bewertung"],
        ])}
        ${sectionTitle("einzeldossiers", "Einzeldossiers")}
        <p>Die Einzeldossiers vertiefen die Methodik. Jede Seite ist online lesbar, druckbar und mit Buchankern verbunden.</p>
        <div class="card-grid three">
          <article class="card">
            <p class="card-kicker">Aktuelle Rechenfassung · v1.1</p>
            <h3 class="card-title">${escapeHtml(wirkungscontrollingDetailDossier.title)}</h3>
            <p class="card-text">${escapeHtml(wirkungscontrollingDetailDossier.text)}</p>
            <div class="portal-card-actions"><a class="text-link" href="${href(base, wirkungscontrollingDetailDossier.href)}">Rechenstandard lesen</a>${tsroiRechenstandardLink(base)}</div>
          </article>${cardGrid(base, dossierPages.map(([slug, title, text]) => ({ title, text, href: `werkzeuge/impact-controlling/dossiers/${slug}/`, label: "Einzeldossier lesen" }))).replace(/^<div class="card-grid three">|<\/div>$/g, "")}
        </div>
        ${sectionTitle("methodik-demo", "Methodik und Demo-Grenzen")}
        <p>Der Impact-Controlling-Rechner startet als einfache Demo mit Scorecard-, NWI-, IOI- und T-SROI-Modul. Er ist keine Prüfung, keine Beratung und keine amtliche Einstufung.</p>
      </article>
    </section>
    <section class="section" aria-labelledby="methodenpapiere">
      <div class="section-header">
        <p class="hero-kicker">Go 10 · Methodenpapiere</p>
        ${sectionTitle("methodenpapiere", "Methodenpapiere als Grundlage")}
        <p>Die folgenden Papiere vertiefen die Methodenlogik hinter WÖk-IDs, Scorecards, NWI, IOI und T-SROI.</p>
      </div>
      ${methodPaperCardGrid(base)}
    </section>
    ${toolGrid(base)}
    ${politicalBlock(base)}
    ${sdgBlock()}
    ${bookBlock(base)}
    ${externalSourcesBlock()}
    ${downloadBlock(base, [
      ...impactDownloads,
      ...go10MethodPapers.flatMap(methodPaperDownloadItems),
    ])}`,
  });
}

function methodPaperOverviewPage() {
  page({
    rel: "werkzeuge/impact-controlling/methodenpapiere/index.html",
    title: "Methodenpapiere Impact Controlling | Wirkungsökonomie",
    description: "Ausführliche Methodenpapiere zu WÖk-IDs, Scorecards, NWI, IOI und T-SROI als Online-Volltext mit DOCX- und PDF-Downloads.",
    searchSection: "Werkzeuge",
    searchType: "Methodenpapier",
    body: (base, route) => `${hero(base, {
      kicker: "Methodenpapiere · Go 10",
      title: "Methodenpapiere Impact Controlling",
      subtitle: "WÖk-IDs, Scorecards, NWI, IOI und T-SROI als methodische Grundlage.",
      text: "Diese Papiere sind keine Lebensbereichs-Detailkonzepte. Sie erklären die Methodenarchitektur, die in Produkten, Unternehmen, Staat, Kapital, Bildung, Gesundheit, Wohnen, Klima und weiteren Wirkungsfeldern genutzt wird.",
      action: `<a class="btn btn-primary" href="${href(base, "werkzeuge/impact-controlling/")}">Impact Controlling öffnen</a>`,
    })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section" aria-labelledby="methodenpapier-liste">
      <div class="section-header">
        <p class="hero-kicker">Online-Volltexte</p>
        ${sectionTitle("methodenpapier-liste", "Methodenpapiere online lesen")}
        <p>Online-Volltext ist der Hauptzugang; DOCX und PDF sind ergänzende Downloadfassungen.</p>
      </div>
      ${methodPaperCardGrid(base)}
    </section>
    ${go10ToolGrid(base)}
    ${impactCrossLinks(base)}
    ${politicalBlock(base, "das Methodenpaket Impact Controlling")}
    ${sdgBlock()}
    ${bookBlock(base)}
    ${externalSourcesBlock()}
    ${downloadBlock(base, go10MethodPapers.flatMap(methodPaperDownloadItems))}`,
  });
}

function methodPaperPages() {
  for (const paper of go10MethodPapers) {
    const sourcePath = path.join(ROOT, paper.source);
    const source = fs.existsSync(sourcePath) ? fs.readFileSync(sourcePath, "utf8") : `# ${paper.title}\n\n${paper.subtitle}`;
    const rendered = markdownBlocks(source, `method-${paper.number}`);
    const relatedTools = tools.filter((tool) => paper.relatedTools.includes(tool.title));
    page({
      rel: `werkzeuge/impact-controlling/methodenpapiere/${paper.slug}/index.html`,
      title: `${paper.title} | Methodenpapier Impact Controlling`,
      description: `${paper.subtitle}. Online-Volltext des Methodenpapiers der Wirkungsökonomie.`,
      searchSection: "Werkzeuge",
      searchType: "Methodenpapier",
      body: (base, route) => `${hero(base, {
        kicker: `Methodenpapier ${paper.number} · Go 10`,
        title: paper.title,
        subtitle: paper.subtitle,
        text: "Dieses Dokument ist ein ausführliches Methodenpapier für den Werkzeugbereich Impact Controlling. Es ist keine fachliche Ausarbeitung eines einzelnen Wirkungsfelds.",
        action: methodPaperDownloadActions(base, paper),
      })}
      <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
      ${currentTsroiRechenstandardBlock(base, paper)}
      <section class="section narrow">${tocFromHeadings(rendered.headings)}</section>
      <section class="section article-section" aria-labelledby="volltext">
        <article class="article-body fulltext-reader">
          <h2 id="volltext">Online-Volltext ${citeAnchor("volltext")}</h2>
          ${rendered.html}
        </article>
      </section>
      <section class="section" aria-labelledby="querverweise">
        <div class="section-header">
          <p class="hero-kicker">Querverlinkung</p>
          ${sectionTitle("querverweise", "Verwandte Methoden und Wirkungsfelder")}
          <p>Methodenpapiere dienen als Rückgrat für mehrere Wirkungsfelder. Die folgenden Links führen zu den wichtigsten Anschlussstellen.</p>
        </div>
        ${cardGrid(base, [
          ...paper.relatedPages.map((link) => ({ title: link.replaceAll("/", " ").trim(), text: "Anschlussseite der Methodik.", href: link, label: "Öffnen" })),
          { title: "SDG-/SDG+-Referenzrahmen", text: "Referenzrahmen für positive, negative und neutrale Wirkung.", href: "verstehen/sdgs-sdgplus/", label: "Öffnen" },
          { title: "Produkte & Konsum", text: "Wirkungsumsatzsteuer, Produktwirkung und Scorecards.", href: "wirkungsfelder/produkte-konsum/", label: "Öffnen" },
          { title: "Wirtschaft & Unternehmen", text: "Impact Controlling im Unternehmen, Risiko, Lieferketten und Transformation.", href: "wirkungsfelder/wirtschaft-unternehmen/", label: "Öffnen" },
          { title: "Staat, Recht & Demokratie", text: "Wirkungsrat, Wirkungshaushalt, WStG und demokratische Korrektur.", href: "wirkungsfelder/staat-recht-demokratie/", label: "Öffnen" },
          { title: "Finanzsystem & Kapital", text: "Kapitalwirkung, Wirkungsfonds und Finanzmarktanschluss.", href: "wirkungsfelder/finanzsystem-kapital/", label: "Öffnen" },
        ])}
      </section>
      ${toolGrid(base, relatedTools.length ? relatedTools : tools.slice(0, 4))}
      ${go10ToolGrid(base)}
      ${impactCrossLinks(base)}
      ${politicalBlock(base, `das Methodenpapier ${paper.title}`)}
      ${sdgBlock()}
      ${bookBlock(base)}
      ${externalSourcesBlock()}
      ${downloadBlock(base, methodPaperDownloadItems(paper))}`,
    });
  }
}

function singleDossiersIndexPage() {
  page({
    rel: "werkzeuge/impact-controlling/dossiers/index.html",
    title: "Einzeldossiers Impact Controlling | Wirkungsökonomie",
    description: "Übersicht der Einzeldossiers zu T-SROI, NWI, WÖk-IDs, Scorecards, Reverse Merit Order, Datenqualität und Beispielrechnungen.",
    searchSection: "Werkzeuge",
    searchType: "Dossier-Übersicht",
    body: (base) => `${hero(base, {
      kicker: "Einzeldossiers",
      title: "Einzeldossiers Impact Controlling",
      subtitle: "Praxisfragen, Bewertungswege, Annahmen, Datenquellen und Grenzen.",
      text: "Diese Übersicht führt zu den einzelnen Dossiers des Impact Controllings. Jedes Dossier vertieft eine Methode oder ein Anwendungsmuster.",
      action: `<a class="btn btn-primary" href="${href(base, "werkzeuge/impact-controlling/")}">Zur Übersicht Impact Controlling</a>`,
    })}
    <section class="section narrow">${citationNotice(`${SITE}/werkzeuge/impact-controlling/dossiers/`)}</section>
    <section class="section">
      <div class="section-header">
        <p class="hero-kicker">Dossiers</p>
        ${sectionTitle("dossier-list", "Dossiers auswählen")}
        <p>Die Karten führen zu eigenständigen Dossierseiten. Downloads stehen auf den jeweiligen Seiten am Ende.</p>
      </div>
      <div class="card-grid three">
    <article class="card">
      <p class="card-kicker">Aktuelle Rechenfassung · v1.1</p>
      <h3 class="card-title">${escapeHtml(wirkungscontrollingDetailDossier.title)}</h3>
      <p class="card-text">${escapeHtml(wirkungscontrollingDetailDossier.text)}</p>
      <div class="portal-card-actions"><a class="text-link" href="${href(base, wirkungscontrollingDetailDossier.href)}">Rechenstandard lesen</a>${tsroiRechenstandardLink(base)}</div>
    </article>
    <article class="card">
      <p class="card-kicker">Arbeitspapier · CSRD-Brücke</p>
      <h3 class="card-title">${escapeHtml(doubleMaterialityWorkpaper.title)}</h3>
      <p class="card-text">${escapeHtml(doubleMaterialityWorkpaper.text)}</p>
      <div class="portal-card-actions"><a class="text-link" href="${href(base, doubleMaterialityWorkpaper.href)}">Einordnung lesen</a><a class="text-link" href="${href(base, doubleMaterialityWorkpaper.pdf)}">PDF</a></div>
    </article>${cardGrid(base, dossierPages.map(([slug, title, text]) => ({
        title,
        text,
        href: `werkzeuge/impact-controlling/dossiers/${slug}/`,
        label: "Dossier lesen",
      }))).replace(/^<div class="card-grid three">|<\/div>$/g, "")}
  </div>
    </section>
    ${politicalBlock(base)}
    ${sdgBlock()}
    ${bookBlock(base)}
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
        <details class="toc-card no-print" aria-label="Inhaltsverzeichnis">
          <summary class="card-title">Inhaltsverzeichnis anzeigen</summary>
          <ol>
            <li><a href="#definition">Definition</a></li>
            <li><a href="#warum-noetig">Warum nötig?</a></li>
            <li><a href="#anwendung">Anwendung</a></li>
            <li><a href="#grenzen">Wirkungsgrenzen</a></li>
            <li><a href="#quellen">Quellen und Daten</a></li>
          </ol>
        </details>
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
        { label: "Gesamtdossier lesen", href: "werkzeuge/impact-controlling/dossier/" },
        { label: "Impact-Controlling-Demo öffnen", href: "erleben/impact-controlling-rechner/" },
        { label: `Einzeldossier ${title} Word`, href: `assets/downloads/woek_einzeldossier_${slug.replaceAll("-", "_")}_v0_1.docx`, required: true },
      ])}`,
    });
  }
}

function tsroiInteractiveExample() {
  return `<section class="section product-calculator-section" id="interaktives-beispiel" aria-labelledby="tsroi-example-title">
    <div class="product-calculator" data-tool-example-tsroi>
      <div class="section-header">
        <p class="hero-kicker">Rechenbeispiel</p>
        ${sectionTitle("tsroi-example-title", "T-SROI Schritt für Schritt prüfen")}
        <p>Das Beispiel rechnet nur gleichpreisige Euro-Ströme. Als Demo-Annahme gilt r = r_K; in einer Prüfung können Nutzen- und Ressourcendiskontsätze getrennt begründet werden. Es verwendet konstante Jahresströme und konstante Kausalfaktoren; eine reale Prüfung braucht gegebenenfalls Jahresreihen und Sensitivitäten. Der konservative Szenarioabschlag reduziert nur den beanspruchten Nutzen, nicht Schäden. Das Profil für Mensch, Planet und Demokratie und die Datenqualität bleiben als Schutzprüfung sichtbar. Ein freier Multiplikator kommt nicht vor.</p>
      </div>
      <div class="calculator-grid">
        <form class="card calculator-form">
          <label>Investition heute in EUR <input name="investment" type="number" min="0" step="1000" value="1000000"></label>
          <label>Direkter Nutzen pro Jahr in EUR <input name="annualDirectBenefit" type="number" min="0" step="1000" value="500000"></label>
          <label>Zusätzlich belegter transformativer Nutzen pro Jahr in EUR <input name="annualTransformativeBenefit" type="number" min="0" step="1000" value="200000"></label>
          <label>Schäden pro Jahr in EUR <input name="annualHarm" type="number" min="0" step="1000" value="100000"></label>
          <label>Zusätzliche Betriebskosten pro Jahr in EUR <input name="annualOperatingCost" type="number" min="0" step="1000" value="0"></label>
          <label>Betrachtungszeitraum in Jahren <input name="years" type="number" min="1" max="30" step="1" value="2"></label>
          <label>Diskontsatz in Prozent (Demo: r = r_K) <input name="discountRate" type="number" min="0" max="100" step="0.1" value="5"></label>
          <label>Attribution in Prozent <input name="attribution" type="number" min="0" max="100" step="1" value="100"></label>
          <label>Counterfactual / Deadweight in Prozent <input name="deadweight" type="number" min="0" max="100" step="1" value="0"></label>
          <label>Verdrängung in Prozent <input name="displacement" type="number" min="0" max="100" step="1" value="0"></label>
          <label>Pauschaler konservativer Szenarioabschlag in Prozent <input name="uncertainty" type="number" min="0" max="100" step="1" value="10"></label>
          <label>Datenqualität (0 bis 1) <input name="dataQuality" type="number" min="0" max="1" step="0.05" value="0.8"></label>
          <div class="score-inputs" aria-label="Schutzprofil">
            <label>Mensch <input name="mensch" type="number" min="-3" max="3" step="1" value="2"></label>
            <label>Planet <input name="planet" type="number" min="-3" max="3" step="1" value="1"></label>
            <label>Demokratie <input name="demokratie" type="number" min="-3" max="3" step="1" value="1"></label>
          </div>
          <fieldset class="score-inputs" aria-label="Nachweise für das Schutz-Gate">
            <legend>Nachweise für das Schutz-Gate</legend>
            <label class="checkbox-row"><input name="systemBoundaryDefined" type="checkbox"> Systemgrenze, Zeitpunkt und Preisbasis sind für diese Modellrechnung dokumentiert.</label>
            <label class="checkbox-row"><input name="attributionDefined" type="checkbox"> Kausalpfad, Attribution, Counterfactual und Verdrängung sind für diese Modellrechnung dokumentiert.</label>
            <p class="muted">Die Häkchen kennzeichnen nur die Angaben dieser Rechenvorschau. Sie sind keine unabhängige Prüfung.</p>
          </fieldset>
          <label class="checkbox-row"><input name="redLineActive" type="checkbox"> Rote Linie aktiv</label>
        </form>
        <aside class="card calculator-result" aria-live="polite"><div data-tsroi-output></div></aside>
      </div>
    </div>
  </section>`;
}

function toolExplanationPages() {
  for (const [rel, title, subtitle, description, dossier, glossaryTerm] of toolPages) {
    const relatedPapers = methodPapersForTool(title);
    const isPublicTSROIPage = rel === "werkzeuge/t-sroi/index.html";
    const resourceLabel = dossier.includes("methodenpapiere/") ? "Rechenstandard lesen" : "Dossier lesen";
    const supporting = glossaryTerm
      ? `<p><a class="text-link" href="${href(baseFor(rel), glossaryTerm.href)}">Begriffsgrundlage: ${escapeHtml(glossaryTerm.label)} im Glossar</a></p>`
      : "";
    page({
      rel,
      title: `${title} | Wirkungsökonomie`,
      description,
      searchSection: "Werkzeuge",
      searchType: "Werkzeug",
      extraScripts: isPublicTSROIPage ? [
        "assets/js/impact-calculations.js?v=20260802-fail-closed-v2",
        "assets/js/tool-examples-dashboard.js?v=20260802-fail-closed-v2",
      ] : [],
      body: (base, route) => `${hero(base, {
        kicker: "Methodenregister",
        title,
        subtitle,
        text: description,
        action: `<a class="btn btn-primary" href="${href(base, dossier)}">${resourceLabel}</a>`,
        supporting,
      })}
      <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
      <section class="section narrow">${statusMeta("Methodenseite / Webfassung")}</section>
      <section class="section">
        <div class="feature-grid">
          <article class="card" id="was-es-leistet"><p class="card-kicker">Funktion</p><h2 class="card-title">Was es leistet ${citeAnchor("was-es-leistet")}</h2><p class="card-text">${escapeHtml(description)}</p></article>
          <article class="card" id="angewendet-in"><p class="card-kicker">Anwendung</p><h2 class="card-title">Angewendet in ${citeAnchor("angewendet-in")}</h2><p class="card-text">Impact Controlling, Produkte & Konsum, Wirtschaft & Unternehmen, Lieferketten und öffentlichen Steuerungsfragen.</p></article>
          <article class="card" id="grenze"><p class="card-kicker">Grenze</p><h2 class="card-title">Nicht als Schönrechnung ${citeAnchor("grenze")}</h2><p class="card-text">Das Werkzeug darf negative Wirkung, Datenlücken oder rote Linien nicht verdecken.</p></article>
        </div>
      </section>
      ${isPublicTSROIPage ? tsroiInteractiveExample() : ""}
      ${relatedPapers.length ? `<section class="section" aria-labelledby="methodenpapier">
        <div class="section-header">
          <p class="hero-kicker">Methodenpapier</p>
          ${sectionTitle("methodenpapier", "Ausführliches Methodenpapier")}
          <p>Die kurze Toolseite bleibt Einstieg. Das Methodenpapier ist die ausführliche fachliche Grundlage mit DOCX- und PDF-Download.</p>
        </div>
        <div class="card-grid three">${relatedPapers.map((paper) => `<article class="card">
          <p class="card-kicker">Methodenpapier ${paper.number}</p>
          <h3 class="card-title">${escapeHtml(paper.title)}</h3>
          <p class="card-text">${escapeHtml(paper.subtitle)}</p>
          <div class="portal-card-actions">
            <a class="text-link" href="${href(base, `werkzeuge/impact-controlling/methodenpapiere/${paper.slug}/`)}">Methodenpapier lesen</a>
            ${paper.docx && fileExists(paper.docx) ? `<a class="text-link" href="${href(base, paper.docx)}">DOCX</a>` : ""}
            ${paper.pdf && fileExists(paper.pdf) ? `<a class="text-link" href="${href(base, paper.pdf)}">${escapeHtml(paper.pdfLabel || "PDF")}</a>` : ""}
          </div>
        </article>`).join("")}</div>
      </section>` : ""}
      ${toolGrid(base, tools.filter((tool) => tool.href === rel.replace("index.html", "") || tool.title === title).length ? tools.filter((tool) => tool.href === rel.replace("index.html", "") || tool.title === title) : tools.slice(0, 4))}
      ${go10ToolGrid(base)}
      ${impactCrossLinks(base)}
      ${politicalBlock(base)}
    ${sdgBlock()}
      ${bookBlock(base)}
      ${downloadBlock(base, [
        { label: resourceLabel, href: dossier },
        { label: "Gesamtdossier öffnen", href: "werkzeuge/impact-controlling/dossier/" },
        ...relatedPapers.flatMap(methodPaperDownloadItems),
      ])}`,
    });
  }
}

function tsroiLegacyAliasPage() {
  const destination = `${SITE}/werkzeuge/t-sroi/`;
  page({
    rel: "werkzeuge/impact-controlling/t-sroi/index.html",
    title: "T-SROI – weiter zur führenden Toolseite | Wirkungsökonomie",
    description: "Diese frühere Werkzeugadresse führt zur aktuellen T-SROI-Toolseite mit Rechenbeispiel und Rechenstandard.",
    searchSection: "Werkzeuge",
    searchType: "Weiterleitung",
    canonicalUrl: destination,
    robots: "noindex,follow",
    redirectTarget: destination,
    body: (base) => `<section class="section narrow"><article class="article-body"><h1>T-SROI</h1><p>Diese frühere Adresse wurde auf die führende T-SROI-Toolseite zusammengeführt.</p><p><a class="btn btn-primary" href="${href(base, "werkzeuge/t-sroi/")}">Zur T-SROI-Toolseite</a></p></article></section>`,
  });
}

function calculatorPage() {
  const description = "Einfache Demo für Scorecard, Netto-Wirkungs-Index, IOI und T-SROI. Modellhaft, keine Prüfung und keine Beratung.";

  page({
    rel: "erleben/impact-controlling-rechner/index.html",
    title: "Impact-Controlling-Rechner | Wirkungsökonomie erleben",
    description,
    searchSection: "Erleben",
    searchType: "Demo",
    extraScripts: [
      "assets/js/impact-calculations.js?v=20260802-fail-closed-v2",
      "assets/js/impact-controlling-rechner.js?v=20260802-fail-closed-v2",
    ],
    body: (base, route) => `${hero(base, {
      kicker: "Demo",
      title: "Impact-Controlling-Rechner",
      subtitle: "Scorecard, NWI, IOI und T-SROI modellhaft ausprobieren.",
      text: "Die Demo zeigt die Grundlogik der Methoden. Sie ist keine Prüfung, keine Beratung und keine amtliche Einstufung.",
      action: `<a class="btn btn-primary" href="${href(base, "werkzeuge/impact-controlling/")}">Methodik öffnen</a>`,
    })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section narrow">${statusMeta("Demo")}</section>
    <section class="section product-calculator-section" aria-labelledby="impact-calculator-title">
      <div class="product-calculator" data-impact-controlling-calculator>
        <div class="section-header">
          <p class="hero-kicker">Rechner</p>
          ${sectionTitle("impact-calculator-title", "Impact Controlling simulieren")}
          <p>Erst wird geprüft, ob die Schutzbedingungen erfüllt sind. Dann werden kausal zugerechnete Nutzen und Schäden in derselben Euro-Preisbasis abgezinst. Die drei Profilfelder und die Datenqualität bleiben getrennt: Reichweite, Datenqualität oder ein guter Wert in einem anderen Feld heben keinen Schaden auf. Der NWI ist ein eigener Profilwert mit eigenem Schutz-Gate; er braucht keinen Euro-Nenner. Der konservative Szenarioabschlag reduziert ausschließlich beanspruchte Nutzen, nicht Schäden. Die Demo setzt zur Vereinfachung r = r_K sowie konstante Jahresströme und Kausalfaktoren; in einer Prüfung können Nutzen- und Ressourcendiskontsätze getrennt begründet und Jahresreihen verwendet werden.</p>
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
            <label>Investition heute in EUR
              <input name="investment" type="number" min="0" step="1000" value="1000000">
            </label>
            <label>Direkter jährlicher Nutzen in EUR
              <input name="annualDirectBenefit" type="number" min="0" step="1000" value="500000">
            </label>
            <label>Zusätzlich belegter transformativer Nutzen pro Jahr in EUR
              <input name="annualTransformativeBenefit" type="number" min="0" step="1000" value="200000">
            </label>
            <label>Jährliche Schäden in EUR
              <input name="annualHarm" type="number" min="0" step="1000" value="100000">
            </label>
            <label>Zusätzliche Betriebskosten pro Jahr in EUR
              <input name="annualOperatingCost" type="number" min="0" step="1000" value="0">
            </label>
            <label>Wirkungsdauer in Jahren
              <input name="years" type="number" min="1" max="20" step="1" value="2">
            </label>
            <label>Diskontsatz in Prozent (Demo: r = r_K)
              <input name="discountRate" type="number" min="0" max="100" step="0.1" value="5">
            </label>
            <label>Attribution in Prozent
              <input name="attribution" type="number" min="0" max="100" step="1" value="100">
            </label>
            <label>Counterfactual / Deadweight in Prozent
              <input name="deadweight" type="number" min="0" max="100" step="1" value="0">
            </label>
            <label>Verdrängung in Prozent
              <input name="displacement" type="number" min="0" max="100" step="1" value="0">
            </label>
            <label>Pauschaler konservativer Szenarioabschlag in Prozent
              <input name="uncertainty" type="number" min="0" max="100" step="1" value="10">
            </label>
            <label>Datenqualität (0 bis 1)
              <input name="dataQuality" type="number" min="0" max="1" step="0.05" value="0.8">
            </label>
            <div class="score-inputs" aria-label="Scorecard-Scores">
              ${["mensch", "planet", "demokratie"].map((field) => `<label>${field[0].toUpperCase()}${field.slice(1)}
                <input name="${field}" type="number" min="-3" max="3" step="1" value="0">
              </label>`).join("")}
            </div>
            <fieldset class="score-inputs" aria-label="Nachweise für das Schutz-Gate">
              <legend>Nachweise für das Schutz-Gate</legend>
              <label class="checkbox-row"><input name="systemBoundaryDefined" type="checkbox"> Systemgrenze, Zeitpunkt und Preisbasis sind für diese Modellrechnung dokumentiert.</label>
              <label class="checkbox-row"><input name="attributionDefined" type="checkbox"> Kausalpfad, Attribution, Counterfactual und Verdrängung sind für diese Modellrechnung dokumentiert.</label>
              <p class="muted">Die Häkchen kennzeichnen nur die Angaben dieser Rechenvorschau. Sie sind keine unabhängige Prüfung.</p>
            </fieldset>
            <label class="checkbox-row"><input name="redLine" type="checkbox"> Rote Linie aktiv</label>
          </form>
          <aside class="card calculator-result" aria-live="polite">
            <p class="card-kicker">Ergebnis</p>
            <h2 data-impact-result="presetName">Präventionsprojekt</h2>
            <div class="calculator-metrics" role="list">
              <article class="calculator-metric" role="listitem">
                <span>FinalScore</span>
                <strong data-impact-result="finalScore">0</strong>
                <small>schwächste Kernwirkung</small>
              </article>
              <article class="calculator-metric" role="listitem">
                <span>NWI Demo</span>
                <strong data-impact-result="nwi">0,00</strong>
                <small>gleichgewichteter Profilwert, kein Geldwert</small>
              </article>
              <article class="calculator-metric" role="listitem">
                <span>Schutz-Gate</span>
                <strong data-impact-result="gate">blockiert</strong>
                <small>RMO, Daten, Grenze, Zurechnung</small>
              </article>
              <article class="calculator-metric" role="listitem">
                <span>IOI Demo</span>
                <strong data-impact-result="ioi">blockiert</strong>
                <small>direkter Netto-Nutzen je Ressourceneuro</small>
              </article>
              <article class="calculator-metric" role="listitem">
                <span>T-SROI Demo</span>
                <strong data-impact-result="tsroi">blockiert</strong>
                <small>diskontierter Netto-Nutzen je Ressourceneuro</small>
              </article>
              <article class="calculator-metric calculator-metric--wide" role="listitem">
                <span>Diskontierter Netto-Nutzen</span>
                <strong data-impact-result="totalValue">0 EUR</strong>
                <small data-impact-result="positiveNetValue">konservative Szenario-Untergrenze: 0 EUR</small>
              </article>
            </div>
            <p data-impact-result="explanation">Modellhafte Demonstration.</p>
            <ol class="impact-calc-steps" data-impact-result="steps"></ol>
            <p class="scanner-notice"><strong>Hinweis:</strong> Modellhafte Demonstration. Keine Prüfung, keine Investitionsberatung, keine amtliche Einstufung.</p>
          </aside>
        </div>
      </div>
    </section>
    ${toolGrid(base)}
    ${politicalBlock(base)}
    ${sdgBlock()}
    ${bookBlock(base)}
    ${downloadBlock(base, [{ label: "Methodik und Grenzen lesen", href: "werkzeuge/impact-controlling/dossier/#methodik-demo" }])}`,
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
      text: "Diese Arbeitsbibliothek bündelt Onlinefassungen, Dossiers, Methodenpapiere und ergänzende Downloads.",
      action: `<a class="btn btn-primary" href="${href(base, "werkzeuge/impact-controlling/")}">Methodenbereich öffnen</a>`,
    })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section">
      <div class="section-header">
        <p class="hero-kicker">Arbeitsbibliothek</p>
        ${sectionTitle("impact-library", "Onlinefassungen und Arbeitsmaterial")}
        <p>Die Webfassungen führen in die Inhalte. Downloads ergänzen sie dort, wo Dateien vorhanden sind.</p>
      </div>
      ${cardGrid(base, [
        { title: "Impact Controlling", text: "Methodenbereich und Einstieg.", href: "werkzeuge/impact-controlling/" },
        { title: "Gesamtdossier Impact Controlling", text: "Methodenarchitektur, Rechenlogik, Einzeldossiers und Demo-Grenzen.", href: "werkzeuge/impact-controlling/dossier/" },
        { title: "Methodenpapiere Go 10", text: "Ausführliche Methodenpapiere zu WÖk-IDs, Scorecards, NWI, IOI und T-SROI.", href: "werkzeuge/impact-controlling/methodenpapiere/" },
        { title: "Impact-Controlling-Rechner", text: "Scorecard-, NWI-, IOI- und T-SROI-Demo.", href: "erleben/impact-controlling-rechner/" },
        ...go10MethodPapers.map((paper) => ({ title: paper.title, text: paper.subtitle, href: `werkzeuge/impact-controlling/methodenpapiere/${paper.slug}/` })),
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
      subtitle: "Onlinefassungen, Dossiers, Methodenpapiere und Downloads.",
      text: "Konzepte und Dossiers sind online lesbar. Downloads ergänzen den Online-Zugang, ersetzen ihn aber nicht.",
      action: `<a class="btn btn-primary" href="${href(base, "werkstatt/arbeitsbibliothek/")}">Arbeitsbibliothek öffnen</a>`,
    })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section">
      <div class="section-header">
        <p class="hero-kicker">Grundsatz</p>
        ${sectionTitle("online-first", "Onlinefassungen und Arbeitsmaterial")}
        <p>Konzepte und Dossiers haben stabile Online-Adressen mit Abschnittsankern. Word/PDF-Dateien ergänzen sie als Arbeitsmaterial.</p>
      </div>
      ${cardGrid(base, [
        { kicker: "", title: "Produktbesteuerung durch Wirkung", text: "Konzeptpapier im Bereich Produkte & Konsum.", href: "wirkungsfelder/produkte-konsum/produktbesteuerung-durch-wirkung/" },
        { kicker: "", title: "Dossier Produkte & Konsum", text: "Rechenmodell, Tarifmatrix, Beispiele und Quellen.", href: "wirkungsfelder/produkte-konsum/dossier/" },
        { kicker: "", title: "Impact Controlling", text: "Methodenbereich zu T-SROI, NWI, WÖk-IDs und Scorecards.", href: "werkzeuge/impact-controlling/" },
        { kicker: "", title: "Gesamtdossier Impact Controlling", text: "Gesamtdossier mit Einzeldossiers und Demo-Grenzen.", href: "werkzeuge/impact-controlling/dossier/" },
        { kicker: "Methodenpapier", title: "WÖk-IDs und Indikatorenarchitektur", text: "Go-10-Methodenpapier online lesen.", href: "werkzeuge/impact-controlling/methodenpapiere/woek-ids-indikatorenarchitektur/" },
        { kicker: "Methodenpapier", title: "Scorecards, Benchmarks und NWI", text: "Go-10-Methodenpapier online lesen.", href: "werkzeuge/impact-controlling/methodenpapiere/scorecards-benchmarks-nwi/" },
        { kicker: "Methodenpapier", title: "T-SROI und Impact Controlling", text: "Go-10-Methodenpapier online lesen.", href: "werkzeuge/impact-controlling/methodenpapiere/t-sroi-transformationsmessung/" },
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
    "werkzeuge/impact-controlling/methodenpapiere/",
    ...go10MethodPapers.map((paper) => `werkzeuge/impact-controlling/methodenpapiere/${paper.slug}/`),
    wirkungscontrollingDetailDossier.href,
    ...dossierPages.map(([slug]) => `werkzeuge/impact-controlling/dossiers/${slug}/`),
    "werkzeuge/impact-controlling/impact-of-investment/",
    "werkzeuge/t-sroi/",
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
methodPaperOverviewPage();
methodPaperPages();
singleDossiersIndexPage();
singleDossierPages();
toolExplanationPages();
tsroiLegacyAliasPage();
calculatorPage();
  workshopPages();
  updateSitemap();
}

build();
