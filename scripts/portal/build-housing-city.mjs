import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://wirkungsoekonomie.de";
const DATE = "2026-05-24";
const CSS_VERSION = "20260524-wohnen-stadt";
const JS_VERSION = "20260523-nachhaltigkeit";
const SRC = "docs/wohnen-stadt/docx-extracts";
const WEB = "docs/wohnen-stadt/source";
const INVESTOR_SRC = "docs/wohnen-stadt/investoren-vermieter/docx-extracts";
const INVESTOR_WEB = "docs/wohnen-stadt/investoren-vermieter/source";

const areas = [
  ["wohnen-als-wirkungsraum", "wohnen_als_wirkungsraum", "Wohnen als Wirkungsraum", "Wohnraum als Grundlage von Sicherheit, Gesundheit, Zugehörigkeit, Teilhabe und Vertrauen."],
  ["mietwirkung-bezahlbarkeit", "mietwirkung_bezahlbarkeit", "Mietwirkung und Bezahlbarkeit", "Nicht die Miete allein zählt, sondern Wohnkostenbelastung, Warmmiete, Nebenkosten, Energie und Verdrängungsrisiko."],
  ["wohnwirkungsindex-wix-wohn", "wohnwirkungsindex_wix", "Wohnwirkungsindex WIX-Wohn", "Der WIX-Wohn verbindet Klima/Energie, Mietfairness und Sozialraumwirkung in einer transparenten Arbeitsmatrix."],
  ["sanierung-energie-warmmietenneutralitaet", "sanierung_energie_warmmietenneutralitaet", "Sanierung, Energie und Warmmietenneutralität", "Sanierung ist nur dann voll positiv, wenn ökologische Wirkung nicht durch soziale Überlastung erkauft wird."],
  ["eigentum-vermietung-wirkungspflicht", "eigentum_vermietung_wirkungspflicht", "Eigentum, Vermietung und Wirkungspflicht", "Eigentum bleibt Freiheit, wird aber mit Verantwortung für Wohnwirkung, Transparenz und Schutzgrenzen verbunden."],
  ["boden-leerstand-spekulation", "boden_leerstand_spekulation", "Boden, Leerstand und Spekulation", "Boden ist kein beliebig vermehrbares Kapitalgut, sondern Grundlage von Stadtwirkung und demokratischem Vertrauen."],
  ["quartier-stadt-sozialraumprofil", "quartier_stadt_sozialraumprofil", "Quartier, Stadt und Sozialraumprofil", "Stadtteile werden über Grün, Hitze, Mobilität, Versorgung, soziale Mischung, Bildung, Pflege und Gesundheit lesbar."],
  ["verdraengung-gentrifizierung-teilhabe", "verdraengung_gentrifizierung_teilhabe", "Verdrängung, Gentrifizierung und Teilhabe", "Wirkung im Quartier muss sichtbar machen, wer profitiert, wer verdrängt wird und welche Teilhabe geschützt bleibt."],
  ["kommunale-wohnwirkungspolitik", "kommunale_wohnwirkungspolitik", "Kommunale Wohnwirkungspolitik", "Kommunen verbinden Bodenpolitik, Sozialraumprofile, Sanierungsprioritäten, Beteiligung und Resilienzplanung."],
  ["finanzierung-foerderlogik-wirkungsfonds", "finanzierung_foerderlogik_wirkungsfonds", "Finanzierung, Förderlogik und Wirkungsfonds", "Öffentliche Mittel werden an reale Zustandsveränderung, Schutzgrenzen und lernende Evaluation rückgekoppelt."],
  ["mieterstrom-energie-gemeinschaften", "mieterstrom_energie_gemeinschaften", "Mieterstrom und Energie-Gemeinschaften", "Lokale Energie kann Wohnkosten, Klimawirkung, Resilienz und Teilhabe zugleich verändern."],
  ["gesundes-barrierefreies-resilientes-wohnen", "gesundes_barrierefreies_resilientes_wohnen", "Gesundes, barrierefreies und resilientes Wohnen", "Wohnen wirkt auf Gesundheit, Pflegefähigkeit, Sicherheit, Hitzeresilienz, Barrierefreiheit und Alltagssouveränität."],
  ["investoren-vermieter", "investoren_vermieter", "Investor:innen & Vermieter:innen", "Verantwortliches Eigentum, gute Vermietung, Spekulationsschutz und Stranded-Asset-Prävention im wirkungsökonomischen Wohnungsmarkt."],
];

const tools = [
  ["Wohnwirkungsrechner", "Demo / Rechner", "Berechnet modellhaft Mietbelastung, Klima-/Energiescore, Sozialraumscore und WIX-Wohn.", "erleben/wohnwirkungsrechner/"],
  ["Wohnwirkungsindex WIX-Wohn", "Bewertungslogik", "Verbindet KlimaEnergieScore, MietfairnessScore und SozialraumScore.", "wirkungsfelder/wohnen-stadt/detailkonzepte/wohnwirkungsindex-wix-wohn/"],
  ["WIX-VI Vermietung & Investment", "Bewertungsmodul", "Bewertet Gebäude-, Portfolio- und Bewirtschaftungsentscheidungen, ohne Eigentümer:innen oder Mieter:innen zu scoren.", "wirkungsfelder/wohnen-stadt/investoren-vermieter/#wix-vi"],
  ["Vermieter:innen-Wirkungscheck", "Tool in Vorbereitung", "Ordnet gute Vermietung, Instandhaltung, Transparenz, Sanierung und soziale Stabilität ein.", "erleben/wohnwirkungsrechner/vermieter-check/"],
  ["Stranded-Asset-Check", "Tool in Vorbereitung", "Prüft, ob Gebäude oder Portfolios durch Klima-, Energie-, Sozial-, Finanzierungs- oder Marktrisiken vorzeitig an Nutzbarkeit verlieren.", "erleben/wohnwirkungsrechner/stranded-asset-check/"],
  ["Spekulationsrisiko-Monitor", "Schutzlogik", "Macht Leerstand, Zweckentfremdung, Bodenhortung, Umwandlungsdruck und Verdrängungsrisiken sichtbar.", "wirkungsfelder/wohnen-stadt/investoren-vermieter/#spekulationsschutz"],
  ["Mietbelastungsrechner", "Sozialindikator", "Macht Wohnkostenstress und rote Linien sichtbar, ohne Menschen zu bewerten.", "erleben/wohnwirkungsrechner/#mietbelastung"],
  ["Sanierungswirkungsrechner", "Transformationslogik", "Prüft CO2-Einsparung, Warmmietenneutralität und soziale Schutzgrenzen.", "erleben/wohnwirkungsrechner/#sanierung"],
  ["Warmmietenneutralitätsrechner", "Sozialschutz", "Prüft, ob energetische Sanierung reale Wohnkosten senkt oder soziale Überlastung erzeugt.", "erleben/wohnwirkungsrechner/#sanierung"],
  ["Quartierswirkungscheck", "Sozialraumprofil", "Ordnet Grün, Hitze, Mobilität, Versorgung, Sozialmix, Barrierefreiheit und Teilhabe ein.", "wirkungsfelder/wohnen-stadt/detailkonzepte/quartier-stadt-sozialraumprofil/"],
  ["T-SROI für Sanierung und Quartiersentwicklung", "Impact Controlling", "Bewertet Investitionen in Sanierung, Energie, Gesundheit und Quartier als Transformationswirkung.", "werkzeuge/impact-controlling/t-sroi/"],
  ["WÖk-IDs", "Datenarchitektur", "Verbinden SDGs, SDG+, Wohnindikatoren, Schwellen, Quellen und Prüfstatus.", "werkzeuge/woek-ids/"],
  ["Scorecards", "Bewertungsraster", "Übersetzen Wohn-, Gebäude-, Energie- und Quartiersdaten in nachvollziehbare Entscheidungsvorlagen.", "werkzeuge/scorecards/"],
  ["Wirkungsrat", "Institution", "Sichert Indikatorenpflege, Benchmarks, Evaluation, Missbrauchsschutz und Korrekturzyklen.", "werkzeuge/wirkungsrat/"],
];

const bookAnchors = [
  ["Kapitel 23 - Wirkungsrisiko und Wirkungsresilienz", "referenz/kapitel-023-wirkungsrisiko-und-wirkungsresilienz/"],
  ["Kapitel 31 - WÖk-IDs und Indikatorenarchitektur", "referenz/kapitel-031-woek-ids-und-indikatorenarchitektur/"],
  ["Kapitel 32 - Benchmarks, Skalen und Scorecards", "referenz/kapitel-032-benchmarks-skalen-und-scorecards/"],
  ["Kapitel 39 - Wirkungshaushalt und öffentliche Mittel", "referenz/kapitel-039-wirkungshaushalt-und-oeffentliche-mittel/"],
  ["Kapitel 52 - Konsumwirkung und Verbraucherinformation", "referenz/kapitel-052-konsumwirkung-und-verbraucherinformation/"],
  ["Kapitel 70 - Wohnen", "referenz/kapitel-070-wohnen/"],
  ["Working-Paper Wohnungsmarkt", "dokumente/wp-wohnungsmarkt/"],
  ["Systemmodell der Wirkungsökonomie", "dokumente/systemmodell-der-wirkungsoekonomie/"],
];

const sdgs = ["SDG 1 Keine Armut", "SDG 3 Gesundheit und Wohlergehen", "SDG 6 Sauberes Wasser und Sanitäreinrichtungen", "SDG 7 Bezahlbare und saubere Energie", "SDG 8 Menschenwürdige Arbeit", "SDG 10 Weniger Ungleichheiten", "SDG 11 Nachhaltige Städte und Gemeinden", "SDG 12 Nachhaltige/r Konsum und Produktion", "SDG 13 Klimaschutz", "SDG 16 Frieden, Gerechtigkeit und starke Institutionen", "SDG 17 Partnerschaften"];
const sdgPlus = ["SDG+ Demokratie", "SDG+ Rechtsstaatlichkeit", "SDG+ institutionelles Vertrauen", "SDG+ gesellschaftlicher Zusammenhalt", "SDG+ digitale Selbstbestimmung"];

const sourceLinks = [
  ["Destatis - Wohnen in Deutschland", "https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Wohnen/_inhalt.html"],
  ["Destatis - SDG-Indikatoren Deutschland", "https://sdg-indikatoren.de/"],
  ["Eurostat - Housing cost overburden", "https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Housing_statistics"],
  ["BBSR - Wohnungsmarkt und Wohnungsbedarf", "https://www.bbsr.bund.de/"],
  ["Umweltbundesamt - Gebäude und Wohnen", "https://www.umweltbundesamt.de/themen/klima-energie/gebaeude"],
  ["EU Energy Performance of Buildings Directive", "https://energy.ec.europa.eu/topics/energy-efficiency/energy-efficient-buildings/energy-performance-buildings-directive_en"],
  ["Bundesregierung - Gebäudeenergiegesetz", "https://www.bundesregierung.de/breg-de/aktuelles/neues-gebaeudeenergiegesetz-2184942"],
  ["Gesetze im Internet - CO2KostAufG", "https://www.gesetze-im-internet.de/co2kostaufg/"],
  ["Gesetze im Internet - BGB Mietrecht", "https://www.gesetze-im-internet.de/bgb/"],
  ["Europäische Kommission - EPBD", "https://energy.ec.europa.eu/topics/energy-efficiency/energy-efficient-buildings/energy-performance-buildings-directive_en"],
  ["Europäische Kommission - EU Taxonomy Navigator", "https://ec.europa.eu/sustainable-finance-taxonomy/"],
  ["Berlin - Zweckentfremdungsverbot", "https://www.berlin.de/sen/wohnen/rechtliches/zweckentfremdungsverbot/"],
  ["Bundesfinanzministerium - Grundsteuer FAQ", "https://www.bundesfinanzministerium.de/Content/DE/FAQ/faq-die-neue-grundsteuer.html"],
  ["CRREM - Stranding Risk im Gebäudesektor", "https://crrem.org/"],
  ["UN SDGs", "https://sdgs.un.org/goals"],
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
    <link rel="stylesheet" href="${base}assets/css/style.css?v=20260605-wirkungsraum-stage4">
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
    <script src="${base}assets/js/main.js?v=20260605-wirkungsraum-stage4"></script>
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
  let table = [];
  const flush = () => {
    if (!p.length) return;
    const id = `absatz-${String(html.length + 1).padStart(3, "0")}`;
    html.push(`<p id="${id}">${escapeHtml(p.join(" ").replace(/\*\*/g, ""))} ${citeAnchor(id)}</p>`);
    p = [];
  };
  const flushTable = () => {
    if (!table.length) return;
    const rows = table
      .map((line) => line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()))
      .filter((row) => !row.every((cell) => /^:?-{3,}:?$/.test(cell)));
    if (rows.length) {
      const [head, ...body] = rows;
      html.push(`<div class="table-wrap"><table class="data-table"><thead><tr>${head.map((cell) => `<th>${escapeHtml(cell)}</th>`).join("")}</tr></thead><tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
    }
    table = [];
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flush();
      flushTable();
      continue;
    }
    if (line.startsWith("|") && line.endsWith("|")) {
      flush();
      table.push(line);
      continue;
    }
    flushTable();
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
  flushTable();
  return { html: html.join("\n"), toc };
}

function tocBlock(toc) {
  return `<nav class="toc-card no-print reader-toc-card" aria-label="Inhaltsverzeichnis"><h2 class="card-title">Inhaltsverzeichnis</h2><ol>${toc.slice(0, 24).map((x) => `<li class="toc-level-${x.level}"><a href="#${x.id}">${escapeHtml(x.text)}</a></li>`).join("")}</ol></nav>`;
}
function citationNotice(route) {
  return `<aside class="citation-note" role="note"><p class="card-kicker">Zitierfähig</p><h2>Online lesen, gezielt zitieren</h2><p>Online-Volltext ist der Hauptzugang. Abschnittsanker können direkt zitiert werden; Downloads bleiben ergänzende Export- und Archivfassungen.</p><p><a class="text-link" href="${route}">Kanonische Seitenadresse öffnen</a></p></aside>`;
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
  return `<section class="section" aria-labelledby="political-implementation"><div class="card"><p class="hero-kicker">Umsetzung</p>${sectionTitle("political-implementation", "Politische Anschlussfähigkeit und Ausgestaltungsspielraum")}<p>Die Wirkungsökonomie ersetzt demokratische Aushandlung nicht. Sie macht Wirkungen, Zielkonflikte, Nebenwirkungen und Schutzgrenzen sichtbar.</p>${dataTable(["Ebene", "Ausgestaltung"], [
    ["Politische Optionen", "Parteien können Marktanreize, öffentliche Förderung, kommunale Wohnungswirtschaft, Genossenschaften, Mieterschutz, Eigentumsförderung, Bodenpolitik, Sanierungspflichten, steuerliche Entlastung oder direkte Unterstützung unterschiedlich kombinieren."],
    ["Schutzgrenzen", "Rote Linien wie extreme Mietbelastung, gesundheitsgefährdender Schimmel, aktive Verdrängung, Energiearmut oder fehlender Rechtsschutz dürfen nicht durch andere positive Werte schöngerechnet werden."],
    ["Rollenverteilung", "Bund, Länder, Kommunen, EU, Verwaltung, Wohnungswirtschaft, Genossenschaften, Wissenschaft und Zivilgesellschaft behalten klare Aufgaben und demokratische Verantwortung."],
    ["Übergang", "Soziale Abfederung, Kaufkraftschutz, KMU- und Kleinvermieter:innen-Schutz, Datenschutz, Beteiligung und Einspruchsrechte gehören in jede Umsetzung."],
    ["Evaluation", "Wirkungsberichte, kommunale Sozialraumprofile, Wirkungsrat, öffentliche Konsultation und lernende Korrekturzyklen sichern Anpassungsfähigkeit."],
  ])}</div></section>`;
}
function sdgBlock() {
  return `<section class="section" aria-labelledby="sdg-title"><div class="portal-reference-block"><p class="hero-kicker">Referenzrahmen</p>${sectionTitle("sdg-title", "SDG-/SDG+-Bezug")}<h3>Relevante SDGs</h3><div class="model-strip">${sdgs.map((x) => `<span>${escapeHtml(x)}</span>`).join("")}</div><h3>Relevante SDG+-Dimensionen</h3><div class="model-strip">${sdgPlus.map((x) => `<span>${escapeHtml(x)}</span>`).join("")}</div><p>SDG+ ist keine offizielle UN-Kategorie, sondern eine transparente Erweiterung der Wirkungsökonomie. Wohnen berührt soziale Sicherheit, Gesundheit, Klima, Energie, Stadtentwicklung, Teilhabe und institutionelles Vertrauen.</p></div></section>`;
}
function bookBlock(base) {
  return `<section class="section" aria-labelledby="book-anchors"><div class="section-header"><p class="hero-kicker">Online-Buch</p>${sectionTitle("book-anchors", "Anker im Online-Buch")}</div><div class="model-strip">${bookAnchors.map(([label, link]) => `<a href="${href(base, link)}">${escapeHtml(label)}</a>`).join("")}</div></section>`;
}
function toolGrid(base) {
  return `<section class="section" aria-labelledby="tools"><div class="section-header"><p class="hero-kicker">Werkzeuge</p>${sectionTitle("tools", "Werkzeuge in diesem Bereich")}<p>Werkzeuge machen Wohnwirkung sichtbar. Bewertet werden Wohnbedingungen, Gebäude, Strukturen, Regeln, Finanzierung und Quartierswirkung, nicht Menschen.</p></div>${cardGrid(base, tools.map(([title, kicker, text, link]) => ({ title, kicker, text, href: link, label: "Öffnen" })))}</section>`;
}
function sourceBlock(base) {
  return `<section class="section" aria-labelledby="sources"><div class="card"><p class="hero-kicker">Quellen</p>${sectionTitle("sources", "Quellen und Datenbezug")}<p>Externe Quellen werden als Referenzpunkte verlinkt; die wirkungsökonomische Einordnung bleibt online auf wirkungsoekonomie.de lesbar.</p><ul>${sourceLinks.map(([label, link]) => `<li><a class="text-link" href="${link}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)} (externe Quelle)</a></li>`).join("")}<li><a class="text-link" href="${href(base, "dokumente/wp-wohnungsmarkt/")}">WÖk Working-Paper Wohnungsmarkt</a></li><li><a class="text-link" href="${href(base, "dokumente/systemmodell-der-wirkungsoekonomie/")}">Systemmodell der Wirkungsökonomie</a></li></ul></div></section>`;
}
function legalReferencesBlock() {
  const legal = [
    ["Gebäudeenergiegesetz (GEG)", "https://www.bundesregierung.de/breg-de/aktuelles/neues-gebaeudeenergiegesetz-2184942", "Anforderungen an Energieeffizienz, Heizsysteme und Energieausweise."],
    ["CO2KostAufG", "https://www.gesetze-im-internet.de/co2kostaufg/", "Aufteilung von CO2-Kosten zwischen Vermietenden und Mietenden."],
    ["BGB §§ 535, 555b, 559", "https://www.gesetze-im-internet.de/bgb/", "Erhaltungspflichten, Modernisierung und Modernisierungsmieterhöhung."],
    ["EPBD", "https://energy.ec.europa.eu/topics/energy-efficiency/energy-efficient-buildings/energy-performance-buildings-directive_en", "EU-Rahmen für Dekarbonisierung, Renovierung und Energieperformance von Gebäuden."],
    ["EU Taxonomy Navigator", "https://ec.europa.eu/sustainable-finance-taxonomy/", "Sustainable-Finance-Anschluss für Neubau, Sanierung, Erwerb und Eigentum."],
    ["Zweckentfremdungsverbot Berlin", "https://www.berlin.de/sen/wohnen/rechtliches/zweckentfremdungsverbot/", "Kommunaler Anschluss gegen Leerstand, Feriennutzung, Abriss und Zweckentfremdung."],
    ["Grundsteuer C", "https://www.bundesfinanzministerium.de/Content/DE/FAQ/faq-die-neue-grundsteuer.html", "Anschlussinstrument gegen Spekulation mit baureifen Grundstücken."],
    ["CRREM Stranding Risk", "https://crrem.org/", "Risiko- und Pfadlogik für Stranded Assets im Gebäudesektor."],
    ["Destatis Wohnkostenüberbelastung", "https://www.destatis.de/Europa/DE/Thema/Bevoelkerung-Arbeit-Soziales/Soziales-Lebensbedingungen/Wohnkosten.html", "Referenzdaten zu Wohnkostenbelastung."],
    ["BBSR Wohnungsmarkt", "https://www.bbsr.bund.de/", "Wohnungsmarkt, Bedarf, Stadtentwicklung und Raumbeobachtung."],
    ["Umweltbundesamt Gebäudesektor", "https://www.umweltbundesamt.de/themen/klima-energie/gebaeude", "Emissionen, Energie und Gebäudebestand."],
  ];
  return `<section class="section" aria-labelledby="legal-references"><div class="card"><p class="hero-kicker">Rechtsanschluss</p>${sectionTitle("legal-references", "Bestehende Rechts- und Regulierungsanschlüsse")}<p>Der Unterbereich knüpft an bestehende Regelungen an. Die Verlinkung dient der Orientierung; die Wirkungsökonomie ersetzt keine Rechtsberatung.</p>${dataTable(["Anschluss", "Bedeutung"], legal.map(([label, link, text]) => [`${label} (${link})`, text]))}<ul class="source-list">${legal.map(([label, link]) => `<li><a class="text-link" href="${link}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)} (externe Quelle)</a></li>`).join("")}</ul></div></section>`;
}
function downloadBlock(base, items) {
  const links = items.filter((x) => x.href && (x.href.startsWith("http") || exists(x.href)));
  return `<section class="section" aria-labelledby="downloads"><div class="card"><p class="hero-kicker">Dossier & Export</p>${sectionTitle("downloads", "Downloads und Druck")}<p>Online-Volltext ist der Hauptzugang. Word-Dateien bleiben Export und Archiv.</p><div class="portal-card-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button>${links.map((x) => `<a class="btn btn-secondary" href="${href(base, x.href)}">${escapeHtml(x.label)}</a>`).join("")}</div></div></section>`;
}
function fulltextPage({ rel, title, subtitle, mdRel, status, downloads = [], cards = [], searchSection = "Wirkungsfelder", searchType = "Volltext", backHref = "wirkungsfelder/wohnen-stadt/" }) {
  const rendered = mdToHtml(read(mdRel));
  page({
    rel,
    title: `${title} | Wirkungsökonomie`,
    description: subtitle,
    searchSection,
    searchType,
    body: (base, route) => `${hero(base, { kicker: status, title, subtitle, text: subtitle, action: `<a class="btn btn-primary" href="${href(base, backHref)}">Portal öffnen</a>` })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section narrow">${statusMeta(status)}</section>
    <section class="section no-print detail-concept-toc-section">${tocBlock(rendered.toc)}</section>
    <section class="section article-section"><article class="article-body fulltext-reader detail-concept-reader">${sectionTitle("online-volltext", "Online-Volltext")}${rendered.html}</article></section>
    ${cards.length ? `<section class="section" aria-labelledby="related">${sectionTitle("related", "Verwandte Online-Bereiche")}${cardGrid(base, cards)}</section>` : ""}
    ${toolGrid(base)}
    ${politicalBlock()}
    ${sdgBlock()}
    ${bookBlock(base)}
    ${sourceBlock(base)}
    ${downloadBlock(base, downloads)}`,
  });
}

function investorPortalPage() {
  const rendered = mdToHtml(read(`${INVESTOR_WEB}/website_inhalt_wohnen_investoren_vermieter.md`));
  page({
    rel: "wirkungsfelder/wohnen-stadt/investoren-vermieter/index.html",
    title: "Investor:innen & Vermieter:innen | Wohnen & Stadt",
    description: "Verantwortliches Eigentum, gute Vermietung, Spekulationsschutz und Stranded-Asset-Prävention im wirkungsökonomischen Wohnungsmarkt.",
    searchSection: "Wirkungsfelder",
    searchType: "Unterbereich",
    body: (base, route) => `${hero(base, {
      kicker: "Wohnen & Stadt",
      title: "Investor:innen & Vermieter:innen",
      subtitle: "Verantwortliches Eigentum, gute Vermietung, Spekulationsschutz und Stranded-Asset-Prävention.",
      text: "Die Wirkungsökonomie kritisiert nicht Eigentum und Vermietung als solche. Sie macht sichtbar, ob Wohnraum Bezahlbarkeit, Gesundheit, Energie, Quartier, Teilhabe und Vertrauen stärkt oder schwächt.",
      action: `<a class="btn btn-primary" href="${href(base, "wirkungsfelder/wohnen-stadt/detailkonzepte/investoren-vermieter/")}">Detailkonzept online lesen</a>`,
    })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section narrow">${statusMeta("Unterbereich / Online-Volltext")}</section>
    <section class="section article-section"><article class="article-body fulltext-reader">${rendered.html}</article></section>
    <section class="section" aria-labelledby="read-more">${sectionTitle("read-more", "Online lesen")} ${cardGrid(base, [
      { title: "Detailkonzept Investor:innen & Vermieter:innen", text: "Vollständige Online-Fassung mit Systemarchitektur, WIX-VI, Rechtsanschlüssen und politischer Umsetzung.", href: "wirkungsfelder/wohnen-stadt/detailkonzepte/investoren-vermieter/" },
      { title: "Dossier Investor:innen & Vermieter:innen", text: "Modellrechnungen, Fallstudien, Datenquellen, Annahmen und Anreizlogik online lesen.", href: "wirkungsfelder/wohnen-stadt/dossiers/investoren-vermieter/" },
      { title: "Stranded-Asset-Check", text: "Tool-Spezifikation und erster Zugang zum Gebäuderisiko-Modul.", href: "erleben/wohnwirkungsrechner/stranded-asset-check/" },
    ])}</section>
    ${legalReferencesBlock()}
    ${toolGrid(base)}
    ${politicalBlock()}
    ${sdgBlock()}
    ${bookBlock(base)}
    ${sourceBlock(base)}
    ${downloadBlock(base, [
      { label: "Detailkonzept Word", href: "assets/downloads/woek_wohnen_investoren_vermieter_detailkonzept_v0_3.docx" },
      { label: "Dossier Word", href: "assets/downloads/woek_wohnen_investoren_vermieter_dossier_v0_3.docx" },
    ])}`,
  });
}

function portalPage() {
  page({
    rel: "wirkungsfelder/wohnen-stadt/index.html",
    title: "Wohnen & Stadt | Wirkungsökonomie",
    description: "Wie die Wirkungsökonomie bezahlbare, gesunde, nachhaltige und resiliente Lebensräume neu ordnet.",
    body: (base, route) => `${hero(base, {
      kicker: "Wirkungsfeld",
      title: "Wohnen & Stadt",
      subtitle: "Wie die Wirkungsökonomie bezahlbare, gesunde, nachhaltige und resiliente Lebensräume neu ordnet.",
      text: "Der heutige Wohnungsmarkt fragt zu oft: Wie viel Rendite bringt Wohnraum? Die Wirkungsökonomie fragt: Welche Wirkung entfaltet Wohnraum für Mensch, Planet und Demokratie?",
      action: `<a class="btn btn-primary" href="${href(base, "erleben/wohnwirkungsrechner/")}">Wohnwirkungsrechner öffnen</a>`,
    })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section narrow">${statusMeta("Portal")}</section>
    <section class="section article-section"><article class="article-body fulltext-reader">${mdToHtml(read(`${WEB}/website_inhalt_wohnen_stadt.md`)).html}</article></section>
    <section class="section" aria-labelledby="subareas"><div class="section-header"><p class="hero-kicker">Unterbereiche</p>${sectionTitle("subareas", "Zentrale Unterbereiche")}<p>Jeder Unterbereich hat ein Detailkonzept und ein Einzeldossier als Online-Volltext.</p></div>${cardGrid(base, areas.map(([slug, , title, text]) => ({ title, text, href: `wirkungsfelder/wohnen-stadt/detailkonzepte/${slug}/`, label: "Detailkonzept lesen" })))}</section>
    ${toolGrid(base)}
    ${politicalBlock()}
    ${sdgBlock()}
    ${bookBlock(base)}
    ${sourceBlock(base)}
    ${downloadBlock(base, [
      { label: "Konzeptpapier Word", href: "assets/downloads/woek_wohnen_stadt_konzeptpapier_v0_1.docx" },
      { label: "Gesamtdossier Word", href: "assets/downloads/woek_wohnen_stadt_gesamtdossier_v0_1.docx" },
    ])}`,
  });
}

function contentPages() {
  fulltextPage({
    rel: "wirkungsfelder/wohnen-stadt/konzept/index.html",
    title: "Konzeptpapier Wohnen & Stadt",
    subtitle: "Wohnen als Wirkungsraum im Rahmen der Wirkungsökonomie.",
    mdRel: `${SRC}/woek_wohnen_stadt_konzeptpapier_v0_1.md`,
    status: "Konzeptpapier / Online-Volltext",
    downloads: [{ label: "Konzeptpapier Word", href: "assets/downloads/woek_wohnen_stadt_konzeptpapier_v0_1.docx" }],
  });
  fulltextPage({
    rel: "wirkungsfelder/wohnen-stadt/dossier/index.html",
    title: "Gesamtdossier Wohnen & Stadt",
    subtitle: "Dossier zu Wohnwirkung, WIX-Wohn, Bezahlbarkeit, Sanierung, Quartier, Finanzierung und politischer Umsetzung.",
    mdRel: `${SRC}/woek_wohnen_stadt_gesamtdossier_v0_1.md`,
    status: "Gesamtdossier / Online-Volltext",
    searchType: "Dossier",
    downloads: [{ label: "Gesamtdossier Word", href: "assets/downloads/woek_wohnen_stadt_gesamtdossier_v0_1.docx" }],
    cards: areas.map(([slug, , title, text]) => ({ title, text, href: `wirkungsfelder/wohnen-stadt/dossiers/${slug}/`, label: "Einzeldossier lesen" })),
  });
  page({
    rel: "wirkungsfelder/wohnen-stadt/detailkonzepte/index.html",
    title: "Detailkonzepte Wohnen & Stadt | Wirkungsökonomie",
    description: "Alle Detailkonzepte zu Wohnen & Stadt online lesen, zitieren und drucken.",
    searchType: "Detailkonzepte",
    body: (base, route) => `${hero(base, { kicker: "Detailkonzepte", title: "Detailkonzepte Wohnen & Stadt", subtitle: "Fachliche Unterbereiche online lesen.", text: "Jedes Detailkonzept ist zitierfähig, druckbar und mit seinem Einzeldossier verbunden.", action: `<a class="btn btn-primary" href="${href(base, "wirkungsfelder/wohnen-stadt/")}">Portal öffnen</a>` })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section">${cardGrid(base, areas.map(([slug, , title, text]) => ({ title, text, href: `wirkungsfelder/wohnen-stadt/detailkonzepte/${slug}/`, label: "Detailkonzept lesen" })))}</section>`,
  });
  page({
    rel: "wirkungsfelder/wohnen-stadt/dossiers/index.html",
    title: "Einzeldossiers Wohnen & Stadt | Wirkungsökonomie",
    description: "Alle Einzeldossiers zu Wohnen & Stadt online lesen, zitieren und drucken.",
    searchType: "Dossiers",
    body: (base, route) => `${hero(base, { kicker: "Einzeldossiers", title: "Einzeldossiers Wohnen & Stadt", subtitle: "Vertiefungen, Beispiele, Datenquellen und Umsetzung.", text: "Die Einzeldossiers sind online vollständig lesbar; Word-Dateien dienen als Export und Archiv.", action: `<a class="btn btn-primary" href="${href(base, "wirkungsfelder/wohnen-stadt/dossier/")}">Gesamtdossier öffnen</a>` })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section">${cardGrid(base, areas.map(([slug, , title, text]) => ({ title, text, href: `wirkungsfelder/wohnen-stadt/dossiers/${slug}/`, label: "Einzeldossier lesen" })))}</section>`,
  });
  for (const [slug, sourceSlug, title, text] of areas) {
    if (slug === "investoren-vermieter") continue;
    const detailName = `woek_detailkonzept_${sourceSlug}_v0_1`;
    const dossierName = `woek_einzeldossier_${sourceSlug}_v0_1`;
    fulltextPage({
      rel: `wirkungsfelder/wohnen-stadt/detailkonzepte/${slug}/index.html`,
      title: `Detailkonzept ${title}`,
      subtitle: text,
      mdRel: `${SRC}/${detailName}.md`,
      status: "Detailkonzept / Online-Volltext",
      downloads: [{ label: "Detailkonzept Word", href: `assets/downloads/${detailName}.docx` }],
      cards: [{ title: `Einzeldossier ${title}`, text: "Vertiefung mit Beispielen, Datenquellen, Toolbezug, Grenzen und Umsetzungshinweisen.", href: `wirkungsfelder/wohnen-stadt/dossiers/${slug}/`, label: "Einzeldossier lesen" }],
    });
    fulltextPage({
      rel: `wirkungsfelder/wohnen-stadt/dossiers/${slug}/index.html`,
      title: `Einzeldossier ${title}`,
      subtitle: text,
      mdRel: `${SRC}/${dossierName}.md`,
      status: "Einzeldossier / Online-Volltext",
      searchType: "Dossier",
      downloads: [{ label: "Einzeldossier Word", href: `assets/downloads/${dossierName}.docx` }],
      cards: [{ title: `Detailkonzept ${title}`, text: "Konzeptuelle Grundlegung des Unterbereichs.", href: `wirkungsfelder/wohnen-stadt/detailkonzepte/${slug}/`, label: "Detailkonzept lesen" }],
    });
  }
  investorPortalPage();
  fulltextPage({
    rel: "wirkungsfelder/wohnen-stadt/detailkonzepte/investoren-vermieter/index.html",
    title: "Detailkonzept Investor:innen & Vermieter:innen",
    subtitle: "Verantwortliches Eigentum, gute Vermietung, Spekulationsschutz, WIX-VI und Stranded-Asset-Prävention.",
    mdRel: `${INVESTOR_SRC}/woek_wohnen_investoren_vermieter_detailkonzept_v0_3.md`,
    status: "Detailkonzept / Online-Volltext / v0.3",
    downloads: [{ label: "Detailkonzept Word", href: "assets/downloads/woek_wohnen_investoren_vermieter_detailkonzept_v0_3.docx" }],
    cards: [
      { title: "Unterbereich Investor:innen & Vermieter:innen", text: "Öffentliche Portalunterseite mit Kurzfassung und Rechtsanschlüssen.", href: "wirkungsfelder/wohnen-stadt/investoren-vermieter/" },
      { title: "Einzeldossier Investor:innen & Vermieter:innen", text: "Fallstudien, Modellrechnungen, Datenquellen und Anreizlogik.", href: "wirkungsfelder/wohnen-stadt/dossiers/investoren-vermieter/" },
    ],
  });
  fulltextPage({
    rel: "wirkungsfelder/wohnen-stadt/dossiers/investoren-vermieter/index.html",
    title: "Dossier Investor:innen & Vermieter:innen",
    subtitle: "Beispiele, Berechnungen, Datenquellen, Anreizlogik und politische Umsetzungsoptionen.",
    mdRel: `${INVESTOR_SRC}/woek_wohnen_investoren_vermieter_dossier_v0_3.md`,
    status: "Einzeldossier / Online-Volltext / v0.3",
    searchType: "Dossier",
    downloads: [{ label: "Dossier Word", href: "assets/downloads/woek_wohnen_investoren_vermieter_dossier_v0_3.docx" }],
    cards: [
      { title: "Unterbereich Investor:innen & Vermieter:innen", text: "Öffentliche Portalunterseite mit Kurzfassung und Rechtsanschlüssen.", href: "wirkungsfelder/wohnen-stadt/investoren-vermieter/" },
      { title: "Detailkonzept Investor:innen & Vermieter:innen", text: "Systemarchitektur, WIX-VI und politische Anschlussfähigkeit.", href: "wirkungsfelder/wohnen-stadt/detailkonzepte/investoren-vermieter/" },
    ],
  });
}

function calculatorPage() {
  const spec = mdToHtml(read("docs/wohnen-stadt/tool_spezifikation_wohnwirkungsrechner_wix_wohn.md"));
  page({
    rel: "erleben/wohnwirkungsrechner/index.html",
    title: "Wohnwirkungsrechner WIX-Wohn | Wirkungsökonomie erleben",
    description: "Modellhafte Demo für Mietbelastung, Energie- und Gebäudescore, Warmmietenneutralität, Sozialraum und WIX-Wohn.",
    searchSection: "Erleben",
    searchType: "Demo",
    body: (base, route) => `${hero(base, { kicker: "Demo · Wohnen & Stadt", title: "Wohnwirkungsrechner WIX-Wohn", subtitle: "Mietbelastung, Energie, Sanierung, Sozialraum und Wohnwirkung modellhaft berechnen.", text: "Modellhafte Demonstration. Keine amtliche Einstufung, keine Rechts-, Steuer- oder Förderberatung.", action: `<a class="btn btn-primary" href="${href(base, "wirkungsfelder/wohnen-stadt/")}">Portal öffnen</a>` })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section narrow">${statusMeta("Tool-Demo / v0.1")}</section>
    <section class="section" aria-labelledby="calculator"><div class="card"><p class="hero-kicker">Rechner</p>${sectionTitle("calculator", "WIX-Wohn Arbeitsmatrix v0.1")}
      <p>WIX-Wohn = 0.35 * KlimaEnergieScore + 0.40 * MietfairnessScore + 0.25 * SozialraumScore.</p>
      <form class="calculator-grid" id="wixWohnForm">
        <label>Haushaltseinkommen netto (€)<input class="input" name="income" type="number" value="2800" min="0" step="50"></label>
        <label>Wohnkosten warm (€)<input class="input" name="housingCost" type="number" value="980" min="0" step="10"></label>
        <label>Klima/Energie-Score (-3 bis +3)<input class="input" name="climate" type="number" value="1" min="-3" max="3" step="1"></label>
        <label>Mietfairness-Score (-3 bis +3)<input class="input" name="rent" type="number" value="0" min="-3" max="3" step="1"></label>
        <label>Sozialraum-Score (-3 bis +3)<input class="input" name="social" type="number" value="1" min="-3" max="3" step="1"></label>
        <label><input name="mold" type="checkbox"> Gesundheitsgefährdender Schimmel</label>
        <label><input name="displacement" type="checkbox"> Aktive Verdrängung</label>
        <label><input name="energyPoverty" type="checkbox"> Extreme Energiearmut</label>
      </form>
      <div class="result-panel" id="wixWohnResult" aria-live="polite"></div>
    </div></section>
    <section class="section article-section"><article class="article-body fulltext-reader">${sectionTitle("tool-spezifikation", "Tool-Spezifikation")}${spec.html}</article></section>
    ${toolGrid(base)}
    ${politicalBlock()}
    ${sdgBlock()}
    ${bookBlock(base)}
    ${sourceBlock(base)}
    ${downloadBlock(base, [])}
    <script>
      (() => {
        const form = document.getElementById("wixWohnForm");
        const result = document.getElementById("wixWohnResult");
        if (!form || !result) return;
        const clamp = (value) => Math.max(-3, Math.min(3, Number(value) || 0));
        const fmt = (value) => new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(value);
        const render = () => {
          const data = new FormData(form);
          const income = Number(data.get("income")) || 0;
          const cost = Number(data.get("housingCost")) || 0;
          const burden = income > 0 ? cost / income : 0;
          const climate = clamp(data.get("climate"));
          const rent = clamp(data.get("rent"));
          const social = clamp(data.get("social"));
          const wix = 0.35 * climate + 0.40 * rent + 0.25 * social;
          const redLines = [];
          if (burden > 0.6) redLines.push("Mietbelastung über 60 Prozent");
          if (data.get("mold")) redLines.push("gesundheitsgefährdender Schimmel");
          if (data.get("displacement")) redLines.push("aktive Verdrängung");
          if (data.get("energyPoverty")) redLines.push("extreme Energiearmut");
          const status = redLines.length ? "Rote Linie aktiv: Nicht-Kompensation greift." : wix >= 1 ? "positive Wohnwirkung im Modell" : wix >= 0 ? "neutral bis leicht positiv im Modell" : "Korrekturbedarf im Modell";
          result.innerHTML = '<h3>Ergebnis</h3><p><strong>Mietbelastung:</strong> ' + fmt(burden * 100) + ' %</p><p><strong>WIX-Wohn:</strong> ' + fmt(wix) + '</p><p><strong>Einordnung:</strong> ' + status + '</p>' + (redLines.length ? '<ul>' + redLines.map((x) => '<li>' + x + '</li>').join('') + '</ul>' : '<p>Keine rote Linie aktiviert.</p>');
        };
        form.addEventListener("input", render);
        render();
      })();
    </script>`,
  });
}

function investorToolPages() {
  const checks = [
    {
      rel: "erleben/wohnwirkungsrechner/stranded-asset-check/index.html",
      title: "Stranded-Asset-Check",
      subtitle: "Gebäude- und Portfoliorisiken aus Klima, Energie, Bezahlbarkeit, Gesundheit, Markt und Recht sichtbar machen.",
      text: "Der Check ist als Modul des Wohnwirkungsrechners vorbereitet. Er bewertet keine Eigentümer:innen, sondern Risikopfade von Gebäuden, Portfolios und Bewirtschaftungsentscheidungen.",
      anchor: "stranded-asset-check",
    },
    {
      rel: "erleben/wohnwirkungsrechner/vermieter-check/index.html",
      title: "Vermieter:innen-Wirkungscheck",
      subtitle: "Gute Vermietung, Instandhaltung, Warmmietenneutralität, Transparenz und soziale Stabilität modellhaft einordnen.",
      text: "Der Check ist als WIX-VI-Modul vorbereitet. Er macht Vermietungswirkung sichtbar, ohne Personen zu bewerten oder Rechtsberatung zu ersetzen.",
      anchor: "vermieter-check",
    },
  ];
  for (const item of checks) {
    page({
      rel: item.rel,
      title: `${item.title} | Wohnwirkungsrechner`,
      description: item.subtitle,
      searchSection: "Erleben",
      searchType: "Tool-Spezifikation",
      body: (base, route) => `${hero(base, {
        kicker: "Tool in Vorbereitung · Wohnen & Stadt",
        title: item.title,
        subtitle: item.subtitle,
        text: "Modellhafte Demonstration. Keine amtliche Einstufung, keine Rechts-, Steuer-, Anlage- oder Förderberatung.",
        action: `<a class="btn btn-primary" href="${href(base, "wirkungsfelder/wohnen-stadt/investoren-vermieter/")}">Unterbereich öffnen</a>`,
      })}
      <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
      <section class="section narrow">${statusMeta("Tool-Spezifikation / in Vorbereitung")}</section>
      <section class="section article-section"><article class="article-body fulltext-reader">${sectionTitle(item.anchor, item.title)}<p>${escapeHtml(item.text)}</p><h3 id="wix-vi-modul">WIX-VI-Modul ${citeAnchor("wix-vi-modul")}</h3><p>Das Modul knüpft an Klima & Energie, Bezahlbarkeit & Warmmiete, Gesundheit & Sicherheit, soziale Stabilität, Quartier & Teilhabe, Governance & Transparenz sowie Spekulations- und Leerstandsrisiken an.</p><h3 id="rote-linien">Rote Linien ${citeAnchor("rote-linien")}</h3><p>Nicht kompensierbar sind existenzielle Mietbelastung, gesundheitsgefährdender Schimmel, aktive Verdrängung, extreme Energiearmut, spekulativer Leerstand und fehlender Rechtsschutz.</p></article></section>
      ${toolGrid(base)}
      ${politicalBlock()}
      ${sdgBlock()}
      ${bookBlock(base)}
      ${sourceBlock(base)}
      ${downloadBlock(base, [])}`,
    });
  }
}

function workshopPages() {
  page({
    rel: "werkstatt/arbeitsbibliothek/wirkungsfelder/wohnen-stadt/index.html",
    title: "Wohnen & Stadt in der Arbeitsbibliothek | Werkstatt",
    description: "Arbeitsbibliothek zu Wohnen & Stadt: Konzept, Gesamtdossier, Detailkonzepte, Einzeldossiers, Wohnwirkungsrechner und Downloads.",
    searchSection: "Werkstatt",
    searchType: "Arbeitsbibliothek",
    body: (base, route) => `${hero(base, { kicker: "Arbeitsbibliothek · Wirkungsfeld", title: "Wohnen & Stadt", subtitle: "Konzept, Dossiers, Detailkonzepte und Wohnwirkungsrechner.", text: "Konzepte und Dossiers landen automatisch in der Werkstatt. Online lesen ist der Hauptzugang.", action: `<a class="btn btn-primary" href="${href(base, "wirkungsfelder/wohnen-stadt/")}">Portal öffnen</a>` })}
    <section class="section narrow">${citationNotice(`${SITE}${route}`)}</section>
    <section class="section">${cardGrid(base, [
      { title: "Portal Wohnen & Stadt", text: "Rang-5-Portal mit Unterbereichen.", href: "wirkungsfelder/wohnen-stadt/" },
      { title: "Konzeptpapier Wohnen & Stadt", text: "Konzeptpapier online lesbar.", href: "wirkungsfelder/wohnen-stadt/konzept/" },
      { title: "Gesamtdossier Wohnen & Stadt", text: "Gesamtdossier online lesbar.", href: "wirkungsfelder/wohnen-stadt/dossier/" },
      { title: "Wohnwirkungsrechner WIX-Wohn", text: "Tool-Demo und Spezifikation.", href: "erleben/wohnwirkungsrechner/" },
      { title: "Investor:innen & Vermieter:innen", text: "Verantwortliches Eigentum, gute Vermietung, Spekulationsschutz und Stranded-Asset-Prävention.", href: "wirkungsfelder/wohnen-stadt/investoren-vermieter/" },
      { title: "Detailkonzept Investor:innen & Vermieter:innen", text: "Detailkonzept v0.3 online lesen.", href: "wirkungsfelder/wohnen-stadt/detailkonzepte/investoren-vermieter/" },
      { title: "Dossier Investor:innen & Vermieter:innen", text: "Dossier v0.3 online lesen.", href: "wirkungsfelder/wohnen-stadt/dossiers/investoren-vermieter/" },
      ...areas.map(([slug, , title, text]) => ({ title, text, href: `wirkungsfelder/wohnen-stadt/detailkonzepte/${slug}/` })),
    ])}</section>
    ${downloadBlock(base, [
      { label: "Konzeptpapier Word", href: "assets/downloads/woek_wohnen_stadt_konzeptpapier_v0_1.docx" },
      { label: "Gesamtdossier Word", href: "assets/downloads/woek_wohnen_stadt_gesamtdossier_v0_1.docx" },
    ])}`,
  });

  const conceptsPath = path.join(ROOT, "werkstatt/arbeitsbibliothek/konzepte-dossiers/index.html");
  if (fs.existsSync(conceptsPath)) {
    let html = fs.readFileSync(conceptsPath, "utf8");
    if (!html.includes("")) {
      html = html.replace("</main>", `<section class="section"><div class="section-header"><p class="hero-kicker"></p><h2>Wohnen & Stadt</h2><p>Wohnen & Stadt ist mit Konzept, Dossier, Detailkonzepten, Einzeldossiers und Wohnwirkungsrechner in der Arbeitsbibliothek verfügbar.</p></div>${cardGrid("../../../", [
        { kicker: "", title: "Wohnen & Stadt", text: "Portal mit Detailkonzepten, Dossiers und Wohnwirkungsrechner.", href: "wirkungsfelder/wohnen-stadt/" },
        { kicker: "", title: "Gesamtdossier Wohnen & Stadt", text: "Gesamtdossier online lesen.", href: "wirkungsfelder/wohnen-stadt/dossier/" },
      ])}</section>\n</main>`);
      fs.writeFileSync(conceptsPath, html, "utf8");
    }
  }
}

function updateSitemap() {
  const sitemapPath = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(sitemapPath)) return;
  const urls = [
    "wirkungsfelder/wohnen-stadt/",
    "wirkungsfelder/wohnen-stadt/konzept/",
    "wirkungsfelder/wohnen-stadt/dossier/",
    "wirkungsfelder/wohnen-stadt/detailkonzepte/",
    "wirkungsfelder/wohnen-stadt/dossiers/",
    "erleben/wohnwirkungsrechner/",
    "erleben/wohnwirkungsrechner/stranded-asset-check/",
    "erleben/wohnwirkungsrechner/vermieter-check/",
    "werkstatt/arbeitsbibliothek/wirkungsfelder/wohnen-stadt/",
    "wirkungsfelder/wohnen-stadt/investoren-vermieter/",
    ...areas.flatMap(([slug]) => [
      `wirkungsfelder/wohnen-stadt/detailkonzepte/${slug}/`,
      `wirkungsfelder/wohnen-stadt/dossiers/${slug}/`,
    ]),
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
  contentPages();
  calculatorPage();
  investorToolPages();
  workshopPages();
  updateSitemap();
}

build();
