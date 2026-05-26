import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://wirkungsoekonomie.de";
const DATE = "2026-05-26";
const CSS_VERSION = "20260526-regulatory-reference";
const JS_VERSION = "20260525-cta-cleanup";
const REGISTRY_PATH = path.join(ROOT, "assets/data/regulatory-standards-reference.json");

const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
const categories = new Map(registry.categories.map((category) => [category.id, category]));
const entries = registry.entries;

const relatedPageLabels = new Map([
  ["/verstehen/sdgs-sdgplus/", "SDG-/SDG+-Referenzrahmen"],
  ["/wirkungsfelder/wirtschaft-unternehmen/", "Wirkungsfeld Wirtschaft & Unternehmen"],
  ["/wirkungsfelder/produkte-konsum/", "Wirkungsfeld Produkte & Konsum"],
  ["/wirkungsfelder/finanzsystem-kapital/", "Wirkungsfeld Finanzsystem & Kapital"],
  ["/wirkungsfelder/staat-recht-demokratie/", "Wirkungsfeld Staat, Recht & Demokratie"],
  ["/wirkungsfelder/wissenschaft-innovation-digitalisierung/", "Wirkungsfeld Wissenschaft, Innovation & Digitalisierung"],
  ["/werkzeuge/impact-controlling/", "Methode Impact Controlling"],
  ["/werkzeuge/woek-ids/", "Methode WÖk-IDs"],
  ["/werkzeuge/scorecards/", "Methode Scorecards"],
  ["/werkzeuge/reverse-merit-order/", "Methode Reverse Merit Order"],
  ["/werkzeuge/t-sroi/", "Methode T-SROI"],
  ["/begriffe/wirkung/", "Begriff Wirkung"],
  ["/begriffe/wirkungspotenzial/", "Begriff Wirkungspotenzial"],
  ["/begriffe/wirkungsrueckkopplung/", "Begriff Wirkungsrückkopplung"],
  ["/begriffe/wirkungsdatenraum/", "Begriff Wirkungsdatenraum"],
  ["/begriffe/scorecard/", "Begriff Scorecard"],
  ["/begriffe/woek-id/", "Begriff WÖk-ID"],
  ["/downloads.html", "Bibliothek"],
]);

const inferredTerms = [
  ["CSRD", "/begriffe/wirkungsbewertung/"],
  ["ESRS", "/begriffe/woek-id/"],
  ["Taxonomie", "/begriffe/wirkungsbewertung/"],
  ["EBA", "/begriffe/wirkungsrueckkopplung/"],
  ["ESG", "/begriffe/wirkungsbewertung/"],
  ["Produktpass", "/begriffe/wirkungsdatenraum/"],
  ["Batterie", "/begriffe/wirkungsdatenraum/"],
  ["Reporting", "/begriffe/scorecard/"],
  ["Score", "/begriffe/scorecard/"],
  ["Wirkung", "/begriffe/wirkung/"],
  ["Netto", "/begriffe/positive-netto-wirkung/"],
  ["T-SROI", "/begriffe/t-sroi/"],
  ["NWI", "/begriffe/nwi/"],
  ["WÖk-ID", "/begriffe/woek-id/"],
];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function routeFor(rel) {
  return rel.endsWith("/index.html") ? `/${rel.slice(0, -"/index.html".length)}/` : `/${rel}`;
}

function baseFor(rel) {
  const depth = path.dirname(rel).split("/").filter(Boolean).length;
  return "../".repeat(depth);
}

function href(base, target) {
  if (!target) return "";
  if (/^(https?:|mailto:)/.test(target)) return target;
  return `${base}${target.replace(/^\/+/, "")}`;
}

function nav(base) {
  return `<header class="site-header">
      <a class="brand" href="${base}index.html" aria-label="Wirkungsökonomie Startseite">
        <span class="brand-mark"><img src="${base}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span>
        <span class="brand-name">Wirkungsökonomie</span>
      </a>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav">
        <span class="nav-toggle-icon" aria-hidden="true">☰</span>
        <span class="sr-only">Menü</span>
      </button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation">
        <a href="${base}index.html">Start</a>
        <a href="${base}verstehen.html">Verstehen</a>
        <a href="${base}wirkungsfelder/">Wirkungsfelder</a>
        <a href="${base}werkzeuge/">Werkzeuge</a>
        <a href="${base}erleben.html">Erleben</a>
        <a href="${base}downloads.html">Bibliothek</a>
        <a href="${base}akademie.html">Akademie</a>
        <a href="${base}suche.html">Suche</a>
      </nav>
    </header>`;
}

function footer(base) {
  return `<footer class="footer">
      <div class="footer-grid">
        <div>
          <p class="hero-kicker">Wirkungsökonomie</p>
          <h2>Wissens- und Anwendungsraum</h2>
          <p>Die Wirkungsökonomie macht Wirkung auf Mensch, Planet und Demokratie sichtbar und führt sie in Entscheidungen zurück.</p>
          <p>Kontakt: <a class="text-link" href="mailto:impact@wirkungsoekonomie.org">impact@wirkungsoekonomie.org</a></p>
        </div>
        <a class="btn btn-primary" href="${base}kompass.html">WÖk-Kompass nutzen</a>
        <nav class="footer-nav" aria-label="Footer Navigation">
          <div class="footer-nav-group">
            <h3>Verstehen</h3>
            <div class="footer-nav-links">
              <a href="${base}verstehen.html">Grundlagen</a>
              <a href="${base}kompass.html">Kompass</a>
              <a href="${base}glossar.html">Glossar</a>
              <a href="${base}verstehen/sdgs-sdgplus/">SDG-/SDG+</a>
              <a href="${base}verstehen/regulierung-standards/">Regulierung & Standards</a>
            </div>
          </div>
          <div class="footer-nav-group">
            <h3>Wirkungsfelder</h3>
            <div class="footer-nav-links">
              <a href="${base}wirkungsfelder/wirtschaft-unternehmen/">Wirtschaft & Unternehmen</a>
              <a href="${base}wirkungsfelder/produkte-konsum/">Produkte & Konsum</a>
              <a href="${base}wirkungsfelder/finanzsystem-kapital/">Finanzsystem & Kapital</a>
              <a href="${base}wirkungsfelder/staat-recht-demokratie/">Staat, Recht & Demokratie</a>
            </div>
          </div>
          <div class="footer-nav-group">
            <h3>Methoden</h3>
            <div class="footer-nav-links">
              <a href="${base}werkzeuge/impact-controlling/">Impact Controlling</a>
              <a href="${base}werkzeuge/woek-ids/">WÖk-IDs</a>
              <a href="${base}werkzeuge/scorecards/">Scorecards</a>
              <a href="${base}werkzeuge/reverse-merit-order/">Reverse Merit Order</a>
            </div>
          </div>
          <div class="footer-nav-group">
            <h3>Bibliothek</h3>
            <div class="footer-nav-links">
              <a href="${base}downloads.html">Dokumente</a>
              <a href="${base}referenz/">Online-Buch</a>
              <a href="${base}suche.html">Suche</a>
            </div>
          </div>
        </nav>
        <p>© 2026 Natalie Weber - Wirkungsökonomie</p>
      </div>
    </footer>`;
}

function page({ rel, title, description, searchType = "Referenz", searchTags = "", body }) {
  const base = baseFor(rel);
  const route = routeFor(rel);
  const canonical = `${SITE}${route}`;
  const out = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const html = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="search_title" content="${escapeHtml(title.replace(/\s+\|.*$/, ""))}">
    <meta name="search_description" content="${escapeHtml(description)}">
    <meta name="search_section" content="Verstehen">
    <meta name="search_type" content="${escapeHtml(searchType)}">
    <meta name="search_tags" content="${escapeHtml(searchTags)}">
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
    ${nav(base)}
    <main data-pagefind-body>
${body(base, route)}
    </main>
    ${footer(base)}
    <script src="${base}assets/js/main.js?v=${JS_VERSION}" defer></script>
  </body>
</html>
`;
  fs.writeFileSync(out, html.replace(/[ \t]+$/gm, ""), "utf8");
}

function chipList(values, className = "regulatory-chip-list") {
  const list = (values || []).filter(Boolean);
  if (!list.length) return "";
  return `<ul class="${className}">${list.map((value) => `<li>${escapeHtml(value)}</li>`).join("")}</ul>`;
}

function sourceList(sources) {
  if (!sources?.length) return "<p>Keine Quelle hinterlegt. Dieser Eintrag muss fachlich nachgeprüft werden.</p>";
  return `<ul class="source-list">${sources.map((source) => `<li><a class="text-link" href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)} <span class="sr-only">(externe Quelle)</span></a></li>`).join("")}</ul>`;
}

function relatedLinks(base, links) {
  const clean = [...new Set((links || []).filter(Boolean))].filter(localTargetExists);
  if (!clean.length) return "<p>Keine internen Verweise hinterlegt.</p>";
  return `<div class="topic-subnav">${clean.map((url) => `<a href="${href(base, url)}">${escapeHtml(relatedPageLabels.get(url) || labelFromUrl(url))}</a>`).join("")}</div>`;
}

function inferredTermLinks(base, entry) {
  const text = `${entry.title} ${entry.shortTitle} ${entry.summary} ${entry.whatItDoes} ${entry.woekAnalysis}`;
  const urls = [];
  for (const [needle, url] of inferredTerms) {
    if (text.toLowerCase().includes(needle.toLowerCase())) urls.push(url);
  }
  return relatedLinks(base, urls.slice(0, 6));
}

function labelFromUrl(url) {
  const clean = url.replace(/^\/|\/$/g, "");
  const part = clean.split("/").pop() || clean;
  return part
    .split("-")
    .map((word) => word ? `${word[0].toUpperCase()}${word.slice(1)}` : word)
    .join(" ");
}

function localTargetExists(url) {
  if (!url || /^(https?:|mailto:)/.test(url)) return true;
  const clean = url.replace(/[?#].*$/, "");
  if (!clean.startsWith("/")) return true;
  const rel = clean.replace(/^\/+/, "");
  const full = path.join(ROOT, rel);
  return fs.existsSync(full) || fs.existsSync(`${full}.html`) || fs.existsSync(path.join(full, "index.html"));
}

function categoryFor(entry) {
  return categories.get(entry.category) || { id: entry.category, title: entry.category, summary: "" };
}

function cardFor(entry, base) {
  const category = categoryFor(entry);
  return `<article class="card regulatory-reference-card">
      <p class="card-kicker">${escapeHtml(category.title)}</p>
      <h3 class="card-title">${escapeHtml(entry.shortTitle || entry.title)}</h3>
      <p class="regulatory-meta">${escapeHtml(entry.type)} · ${escapeHtml(entry.status)}</p>
      <p class="card-text">${escapeHtml(entry.summary)}</p>
      <p class="card-text"><strong>WÖk-Anschluss:</strong> ${escapeHtml(entry.relevance)}</p>
      ${chipList([...(entry.sdgs || []), ...(entry.sdgPlus || []).map((item) => `SDG+ ${item}`)])}
      <div class="portal-card-actions">
        <a class="btn btn-secondary" href="${href(base, `verstehen/regulierung-standards/${entry.slug}/`)}">Detailseite lesen</a>
      </div>
    </article>`;
}

function overviewPage() {
  page({
    rel: "verstehen/regulierung-standards/index.html",
    title: "Regulierung, Standards und Reports | Wirkungsökonomie",
    description:
      "Referenzlandkarte zu Nachhaltigkeitsregulierung, Standards, Produktdaten, Finanzmarktanforderungen, Reports, Ratings und ihrer Bedeutung für die Wirkungsökonomie.",
    searchType: "Referenzlandkarte",
    searchTags: entries.map((entry) => entry.shortTitle || entry.title).join(", "),
    body: (base) => `<section class="hero portal-hero regulatory-hero" aria-labelledby="regulatory-title">
        <div class="hero-content">
          <p class="hero-kicker">Referenzlandkarte</p>
          <h1 id="regulatory-title">Regulierung, Standards und Reports verstehen</h1>
          <p class="hero-subtitle">CSRD, ESRS, EU-Taxonomie, EBA, Produktpässe, Batterieregeln, IPCC, IPBES, Ratings und Datenquellen in einer öffentlichen Übersicht.</p>
          <p>Diese Seite bündelt etablierte Rahmenwerke, Gesetze, Standards und wissenschaftliche Reports, die für Wirkung, Nachhaltigkeit, Kapitalmärkte, Produktdaten, Lieferketten und öffentliche Steuerung relevant sind.</p>
          <p>Die Wirkungsökonomie ersetzt diese Rahmen nicht. Sie ordnet ein, welche Daten, Schutzregeln und Entscheidungsanschlüsse daraus für Wirkung sichtbar werden.</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="#referenzen">Referenzen ansehen</a>
            <a class="btn btn-secondary" href="${href(base, "verstehen/sdgs-sdgplus/")}">SDG-/SDG+-Rahmen verstehen</a>
            <a class="text-link" href="${href(base, "werkzeuge/impact-controlling/")}">Impact Controlling einordnen</a>
          </div>
        </div>
      </section>

      <section class="section section-muted" aria-labelledby="regulatory-purpose">
        <div class="section-header">
          <p class="hero-kicker">Worum geht es?</p>
          <h2 id="regulatory-purpose">Regeln, Daten und Berichte sind noch keine Wirkung</h2>
          <p>Viele Standards erzeugen Transparenz, Meldepflichten oder Risikodaten. Die WÖk-Frage ist der nächste Schritt: Welche Zustände verändern sich wirklich, welche Zielkonflikte bleiben offen und wie fließt diese Erkenntnis in Preise, Kapital, Beschaffung, Politik und Produkte zurück?</p>
        </div>
        <div class="card-grid three">
          <article class="card"><h3>Was ist geregelt?</h3><p>Berichtspflichten, Sorgfalt, Produktdaten, Taxonomie, Risikoaufsicht, Ratings, wissenschaftliche Grundlagen und Dateninfrastruktur.</p></article>
          <article class="card"><h3>Was bleibt offen?</h3><p>Regeln liefern nicht automatisch positive Netto-Wirkung. Datenqualität, Nicht-Kompensation, Schutzgrenzen und Rückkopplung müssen gesondert geprüft werden.</p></article>
          <article class="card"><h3>Was macht die WÖk?</h3><p>Sie verbindet Standards mit Wirkungsfeldern, SDGs/SDG+, WÖk-IDs, Scorecards, NWI, T-SROI und demokratischer Kontrolle.</p></article>
        </div>
      </section>

      <section class="section" aria-labelledby="regulatory-categories">
        <div class="section-header">
          <p class="hero-kicker">Themencluster</p>
          <h2 id="regulatory-categories">Sechs Einstiege statt einer Linkliste</h2>
        </div>
        <div class="card-grid three">
          ${registry.categories.map((category) => `<article class="card">
            <p class="card-kicker">${escapeHtml(category.title)}</p>
            <h3 class="card-title">${escapeHtml(entries.filter((entry) => entry.category === category.id).length)} Einträge</h3>
            <p class="card-text">${escapeHtml(category.summary)}</p>
            <div class="portal-card-actions"><a class="text-link" href="#${escapeHtml(category.id)}">Cluster ansehen</a></div>
          </article>`).join("")}
        </div>
      </section>

      <section class="section section-muted" aria-labelledby="reference-logic">
        <div class="card">
          <p class="hero-kicker">Leselogik</p>
          <h2 id="reference-logic">Wie diese Referenz zu lesen ist</h2>
          <div class="reference-meta-grid">
            <div><h3>Bestehende Welt</h3><p>Regulierung und Standards legen fest, was berichtet, geprüft, beaufsichtigt, markiert, finanziert oder gemessen wird.</p></div>
            <div><h3>WÖk-Frage</h3><p>Welche Wirkung wird dadurch sichtbar, welche bleibt blind, und wie kann sie in Entscheidungen zurückgeführt werden?</p></div>
            <div><h3>Grenze</h3><p>Diese Seiten sind Orientierung. Sie ersetzen keine Rechts-, Steuer-, Anlage-, Förder- oder Nachhaltigkeitsberatung.</p></div>
          </div>
        </div>
      </section>

      <section class="section" id="referenzen" aria-labelledby="reference-list">
        <div class="section-header">
          <p class="hero-kicker">Referenzen</p>
          <h2 id="reference-list">Regulatorische, methodische und wissenschaftliche Anschlüsse</h2>
          <p>${entries.length} kuratierte Einträge mit Kurzbeschreibung, Regelungslogik, WÖk-Analyse, SDG-Bezug, Quellen und internen Verweisen.</p>
        </div>
        ${registry.categories.map((category) => {
          const grouped = entries.filter((entry) => entry.category === category.id);
          return `<section class="subsection" aria-labelledby="${escapeHtml(category.id)}">
            <div class="section-header compact">
              <p class="hero-kicker">${escapeHtml(category.title)}</p>
              <h3 id="${escapeHtml(category.id)}">${escapeHtml(category.title)}</h3>
              <p>${escapeHtml(category.summary)}</p>
            </div>
            <div class="card-grid three">${grouped.map((entry) => cardFor(entry, base)).join("")}</div>
          </section>`;
        }).join("")}
      </section>

      <section class="section section-muted" aria-labelledby="source-note">
        <div class="card">
          <p class="hero-kicker">Quellen und Rechtsstand</p>
          <h2 id="source-note">Rechtsstand immer am Original prüfen</h2>
          <p>EU-Rechtsakte, Aufsichtserwartungen und Standards ändern sich. Diese Übersicht verweist deshalb auf offizielle Quellen und kennzeichnet die wirkungsökonomische Einordnung als Orientierung, nicht als amtliche Auslegung.</p>
        </div>
      </section>`,
  });
}

function detailPage(entry) {
  const category = categoryFor(entry);
  page({
    rel: `verstehen/regulierung-standards/${entry.slug}/index.html`,
    title: `${entry.shortTitle || entry.title} | Regulierung, Standards und Reports`,
    description: `${entry.shortTitle || entry.title}: ${entry.summary}`,
    searchType: "Referenzdetail",
    searchTags: [entry.shortTitle, entry.title, entry.type, ...(entry.sdgs || []), ...(entry.sdgPlus || [])].filter(Boolean).join(", "),
    body: (base) => `<section class="hero portal-hero regulatory-detail-hero" aria-labelledby="detail-title">
        <div class="hero-content">
          <nav class="topic-subnav" aria-label="Brotkrumen">
            <a href="${href(base, "verstehen.html")}">Verstehen</a>
            <a href="${href(base, "verstehen/regulierung-standards/")}">Regulierung & Standards</a>
          </nav>
          <p class="hero-kicker">${escapeHtml(category.title)}</p>
          <h1 id="detail-title">${escapeHtml(entry.title)}</h1>
          <p class="hero-subtitle">${escapeHtml(entry.summary)}</p>
          <div class="reference-meta-grid">
            <div><h2>Typ</h2><p>${escapeHtml(entry.type)}</p></div>
            <div><h2>Status</h2><p>${escapeHtml(entry.status)}</p></div>
            <div><h2>WÖk-Anschluss</h2><p>${escapeHtml(entry.relevance)}</p></div>
          </div>
          <div class="hero-actions">
            <a class="btn btn-secondary" href="${href(base, "verstehen/regulierung-standards/")}">Zur Übersicht</a>
            ${entry.sources?.[0] ? `<a class="text-link" href="${escapeHtml(entry.sources[0].url)}" target="_blank" rel="noopener noreferrer">Offizielle Quelle</a>` : ""}
          </div>
        </div>
      </section>

      <section class="section" aria-labelledby="purpose">
        <div class="section-header">
          <p class="hero-kicker">Kurz erklärt</p>
          <h2 id="purpose">Wofür ist das da?</h2>
          <p>${escapeHtml(entry.whatItDoes)}</p>
        </div>
        <div class="card-grid two">
          <article class="card">
            <h3>Was wird geregelt oder standardisiert?</h3>
            <p>${escapeHtml(entry.regulates)}</p>
          </article>
          <article class="card">
            <h3>Warum ist es relevant?</h3>
            <p>${escapeHtml(entry.relevance)}</p>
          </article>
        </div>
      </section>

      <section class="section section-muted" aria-labelledby="woek-analysis">
        <div class="card">
          <p class="hero-kicker">Wirkungsökonomische Analyse</p>
          <h2 id="woek-analysis">Was bedeutet das für die Wirkungsökonomie?</h2>
          <p>${escapeHtml(entry.woekAnalysis)}</p>
          <div class="reference-meta-grid">
            <div><h3>Datenanschluss</h3><p>Welche Informationen können in WÖk-IDs, Scorecards, NWI, T-SROI oder Risikoprüfung einfließen?</p></div>
            <div><h3>Entscheidungsanschluss</h3><p>Wie verändert der Rahmen Kapital, Beschaffung, Berichterstattung, Produktdaten, Aufsicht oder Politik?</p></div>
            <div><h3>Schutzgrenze</h3><p>Regulierung ersetzt nicht die Prüfung von Wirkung, Zielkonflikten, Datenschutz, Grundrechten und Nicht-Kompensation.</p></div>
          </div>
        </div>
      </section>

      <section class="section" aria-labelledby="limits">
        <div class="card-grid two">
          <article class="card">
            <p class="hero-kicker">Grenzen</p>
            <h2 id="limits">Was diese Einordnung nicht leistet</h2>
            <p>${escapeHtml(entry.limitations)}</p>
            <p>Diese Seite ist keine Rechts-, Steuer-, Anlage- oder Nachhaltigkeitsberatung. Verbindlich sind die jeweils geltenden Originalquellen und zuständigen Stellen.</p>
          </article>
          <article class="card">
            <p class="hero-kicker">SDG-/SDG+-Bezug</p>
            <h2>Normativer Rahmen</h2>
            ${chipList([...(entry.sdgs || []), ...(entry.sdgPlus || []).map((item) => `SDG+ ${item}`)])}
            <p><a class="text-link" href="${href(base, "verstehen/sdgs-sdgplus/")}">SDG-/SDG+-Rahmen lesen</a></p>
          </article>
        </div>
      </section>

      <section class="section section-muted" aria-labelledby="connections">
        <div class="section-header">
          <p class="hero-kicker">Querverweise</p>
          <h2 id="connections">Wirkungsfelder, Methoden und Begriffe</h2>
        </div>
        <div class="card-grid two">
          <article class="card">
            <h3>Passende Seiten</h3>
            ${relatedLinks(base, entry.relatedPages)}
          </article>
          <article class="card">
            <h3>Verwandte Begriffe</h3>
            ${inferredTermLinks(base, entry)}
          </article>
        </div>
      </section>

      <section class="section" aria-labelledby="book-sources">
        <div class="card-grid two">
          <article class="card">
            <p class="hero-kicker">Buch- und Dokumentbezug</p>
            <h2 id="book-sources">Wo es in der WÖk anschließt</h2>
            ${chipList(entry.bookRefs || [], "regulatory-chip-list soft")}
            <p class="card-text">Die Buch- und Dokumentverweise sind inhaltliche Anker. Sie ersetzen keine direkte Quellenprüfung des jeweiligen Standards oder Rechtsakts.</p>
          </article>
          <article class="card">
            <p class="hero-kicker">Offizielle Quellen</p>
            <h2>Originalquellen prüfen</h2>
            ${sourceList(entry.sources)}
          </article>
        </div>
      </section>

      <section class="section section-muted" aria-labelledby="next-reading">
        <div class="card">
          <p class="hero-kicker">Weiterlesen</p>
          <h2 id="next-reading">Vom Standard zur Wirkung</h2>
          <div class="topic-subnav">
            <a href="${href(base, "verstehen/regulierung-standards/")}">Zur Referenzlandkarte</a>
            <a href="${href(base, "werkzeuge/impact-controlling/")}">Impact Controlling lesen</a>
            <a href="${href(base, "wirkungsfelder/wirtschaft-unternehmen/")}">Wirtschaft & Unternehmen</a>
            <a href="${href(base, "wirkungsfelder/produkte-konsum/")}">Produkte & Konsum</a>
            <a href="${href(base, "suche.html")}">Suche nutzen</a>
          </div>
        </div>
      </section>`,
  });
}

function writeAudit() {
  const docsDir = path.join(ROOT, "docs");
  fs.mkdirSync(docsDir, { recursive: true });
  const lines = [
    "# Regulierungs- und Standards-Referenz Audit",
    "",
    `Stand: ${DATE}`,
    "",
    "## Ergebnis",
    `- Kategorien: ${registry.categories.length}`,
    `- Einträge: ${entries.length}`,
    `- Detailseiten erzeugt: ${entries.length}`,
    "- Übersicht erzeugt: /verstehen/regulierung-standards/",
    "",
    "## Kategorien",
    ...registry.categories.map((category) => `- ${category.title}: ${entries.filter((entry) => entry.category === category.id).length} Einträge`),
    "",
    "## Einträge",
    ...entries.map((entry) => `- ${entry.shortTitle || entry.title} (${entry.type}) -> /verstehen/regulierung-standards/${entry.slug}/`),
    "",
    "## Hinweise",
    "- Rechtsstand und offizielle Quellen müssen bei Nutzung fachlich geprüft werden.",
    "- Die Seiten sind öffentliche Orientierung, keine Rechts-, Steuer-, Anlage- oder Nachhaltigkeitsberatung.",
    "- Weitere Dokumente aus Dropbox/Rechner können über dieselbe Registry ergänzt werden.",
  ];
  fs.writeFileSync(path.join(docsDir, "regulatory-standards-audit.md"), `${lines.join("\n")}\n`, "utf8");
}

function updateSitemap() {
  const sitemapPath = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(sitemapPath)) return;
  let sitemap = fs.readFileSync(sitemapPath, "utf8");
  const urls = ["verstehen/regulierung-standards/", ...entries.map((entry) => `verstehen/regulierung-standards/${entry.slug}/`)];
  const additions = urls
    .filter((url) => !sitemap.includes(`${SITE}/${url}`))
    .map((url) => `  <url>\n    <loc>${SITE}/${url}</loc>\n    <lastmod>${DATE}</lastmod>\n  </url>`)
    .join("\n");
  if (additions) sitemap = sitemap.replace("</urlset>", `${additions}\n</urlset>`);
  fs.writeFileSync(sitemapPath, sitemap, "utf8");
}

function run() {
  overviewPage();
  for (const entry of entries) detailPage(entry);
  writeAudit();
  updateSitemap();
  console.log(`Regulatory standards reference built: ${entries.length} entries`);
}

run();
