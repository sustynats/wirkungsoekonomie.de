import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "en/search/index.html");
const SITEMAP = path.join(ROOT, "sitemap.xml");
const SITE = "https://wirkungsoekonomie.de";
const TODAY = new Date().toISOString().slice(0, 10);

const sectionOptions = [
  ["", "All"],
  ["Begriff", "Term"],
  ["Werkzeug", "Tool"],
  ["Wirkungsfeld", "Impact field"],
  ["Dokument", "Document"],
  ["Demo", "Demo"],
  ["Einwand", "Objection"],
  ["Seiten", "Pages"],
  ["Glossar", "Glossary"],
  ["Wissenskarten", "Knowledge cards"],
  ["Anwendungen", "Applications"],
  ["Zielgruppen", "Audiences"],
  ["Akademie", "Academy"],
  ["Journal", "Journal"],
  ["Evidenz", "Evidence"],
  ["Downloads", "Downloads"],
  ["Audio", "Audio"],
];

const formatOptions = [
  ["", "All"],
  ["Seite", "Page"],
  ["Journalartikel", "Journal article"],
  ["Glossarbegriff", "Glossary term"],
  ["Wissenskarte", "Knowledge card"],
  ["Download / Paper", "Download / paper"],
  ["Tool / Demo", "Tool / demo"],
  ["Akademie-Modul", "Academy module"],
  ["Fallbeispiel", "Case example"],
  ["Workflow", "Workflow"],
  ["Vergleich", "Comparison"],
  ["Narrativanalyse", "Narrative analysis"],
];

const impactOptions = [
  ["", "All"],
  ["Mensch", "People"],
  ["Planet", "Planet"],
  ["Demokratie", "Democracy"],
  ["Mensch + Planet", "People + planet"],
  ["Mensch + Demokratie", "People + democracy"],
  ["Planet + Demokratie", "Planet + democracy"],
  ["Mensch + Planet + Demokratie", "People + planet + democracy"],
];

const standardOptions = [
  ["", "All"],
  ["SDG", "SDG"],
  ["SDG+", "SDG+"],
  ["GRI", "GRI"],
  ["CSRD", "CSRD"],
  ["ESRS", "ESRS"],
  ["EU-Taxonomie", "EU Taxonomy"],
  ["NACE", "NACE"],
  ["Digitaler Produktpass / DPP", "Digital Product Passport / DPP"],
  ["Lieferkettendaten", "Supply-chain data"],
  ["ESG", "ESG"],
  ["WÖk-IDs", "WÖk IDs"],
  ["Scorecards", "Scorecards"],
  ["Benchmarks", "Benchmarks"],
  ["Archetypen", "Archetypes"],
];

const instrumentOptions = [
  ["", "All"],
  ["Wirkung", "Impact"],
  ["Wirkungspotenzial", "Impact potential"],
  ["Scorecard", "Scorecard"],
  ["Netto-Wirkungs-Index / NWI", "Net Impact Index / NWI"],
  ["Reverse Merit Order", "Reverse Merit Order"],
  ["Wirkungssteuer", "Impact tax"],
  ["Wirkungshaushalt", "Impact budget"],
  ["T-SROI", "T-SROI"],
  ["Wirkungsrat", "Impact council"],
  ["Wirkungseinkommen", "Impact income"],
  ["Wirkungsrente", "Impact pension"],
  ["Wirkungsdatenräume", "Impact data spaces"],
];

const tagOptions = [
  ["", "All"],
  ["Kapital", "Capital"],
  ["Markt", "Market"],
  ["Sozialismus / Planwirtschaft", "Socialism / planned economy"],
  ["Gemeinwohlökonomie", "Common good economy"],
  ["Donut-Ökonomie", "Doughnut economy"],
  ["Wellbeing Economy", "Wellbeing economy"],
  ["Degrowth / Postwachstum", "Degrowth / post-growth"],
  ["Medien", "Media"],
  ["Sprache", "Language"],
  ["Narrative", "Narratives"],
  ["Demokratie", "Democracy"],
  ["Migration", "Migration"],
  ["Wohnen", "Housing"],
  ["KI", "AI"],
  ["Pflege", "Care"],
  ["Bildung", "Education"],
  ["Klima", "Climate"],
  ["Energie", "Energy"],
  ["Lieferketten", "Supply chains"],
  ["Produkte", "Products"],
  ["Steuern", "Taxes"],
  ["Bürokratieabbau", "Bureaucracy reduction"],
];

const quickFilters = [
  ["Begriff", "Term"],
  ["Werkzeug", "Tool"],
  ["Wirkungsfeld", "Impact field"],
  ["Dokument", "Document"],
  ["Demo", "Demo"],
  ["Einwand", "Objection"],
];

const suggestions = [
  ["Was ist Wirkungsökonomie?", "What is Wirkungsökonomie?"],
  ["In 5 Minuten verstehen", "Understand in 5 minutes"],
  ["Fragen Einwände Planwirtschaft", "Questions & objections"],
  ["Begriffe Wirkung", "Terms"],
  ["Wirkungsfelder", "Impact fields"],
  ["Produktwirkung", "Try product impact"],
  ["Bibliothek Onlinefassung", "Library"],
  ["Wirkungseinkommen", "Impact income"],
  ["Green Deal", "Green Deal"],
  ["T-SROI", "T-SROI"],
];

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function options(items) {
  return items
    .map(([value, label]) => value ? `<option value="${esc(value)}">${esc(label)}</option>` : `<option value="">${esc(label)}</option>`)
    .join("\n");
}

function updateSitemap() {
  if (!fs.existsSync(SITEMAP)) return;
  let xml = fs.readFileSync(SITEMAP, "utf8");
  const loc = `${SITE}/en/search/`;
  xml = xml.replace(new RegExp(`\\s*<url>\\s*<loc>${loc.replaceAll("/", "\\/")}</loc>\\s*<lastmod>[^<]+</lastmod>\\s*</url>`, "g"), "");
  xml = xml.replace("</urlset>", `  <url><loc>${loc}</loc><lastmod>${TODAY}</lastmod></url>\n</urlset>`);
  fs.writeFileSync(SITEMAP, xml);
}

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Search | Wirkungsökonomie</title>
    <meta name="description" content="Search the Wirkungsökonomie knowledge base for terms, foundations, tools, library texts, SDGs, SDG+, impact governance and applications.">
    <meta name="search_title" content="Search | Wirkungsökonomie">
    <meta name="search_description" content="English search interface for the Wirkungsökonomie knowledge base.">
    <meta name="search_section" content="English">
    <meta name="search_type" content="Search">
    <link rel="canonical" href="${SITE}/en/search/">
    <link rel="alternate" hreflang="en" href="${SITE}/en/search/">
    <link rel="alternate" hreflang="de" href="${SITE}/suche.html">
    <link rel="stylesheet" href="../../assets/css/style.css?v=20260704-en-search">
    <link rel="stylesheet" href="../../assets/css/search.css?v=20260704-en-search">
  </head>
  <body data-site-locale="en">
    <header class="site-header" data-search-exclude>
      <a class="brand" href="../" aria-label="Wirkungsökonomie English homepage">
        <span class="brand-mark"><img src="../../assets/img/brand/signet.svg" alt="Wirkungsökonomie logo"></span>
        <span class="brand-name">Wirkungsökonomie</span>
      </a>
      <nav class="site-utility-nav" aria-label="Quick links" data-search-exclude>
        <a class="site-utility-link site-utility-link--suche" href="./" data-nav-match="en/search/" data-utility-label="Search" aria-current="page">Search</a>
        <a class="site-utility-link site-utility-link--woek-ki" href="../woek-ai/" data-nav-match="en/woek-ai/" data-utility-label="WÖk AI">AI</a>
        <a class="site-utility-link site-utility-link--wok-app" href="../app/" data-nav-match="en/app/" data-utility-label="WÖk App">WÖk App</a>
        <a class="site-utility-link site-utility-link--mein-wirkungsraum" href="../my-impact-space/" data-nav-match="en/my-impact-space/" data-utility-label="My Impact Space" data-utility-primary="true">My Impact Space</a>
        <a class="site-utility-link site-utility-link--language" href="../../suche.html" hreflang="de" lang="de" data-lang-switch="de" data-utility-label="Deutsch">DE</a>
      </nav>
      <button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="site-nav">
        <span class="nav-toggle-icon" aria-hidden="true">☰</span>
        <span class="sr-only">Menu</span>
      </button>
      <nav class="site-nav" id="site-nav" aria-label="Main navigation" data-search-exclude>
        <a href="../" data-nav-match="en/">Home</a>
        <a href="../#understand" data-nav-match="en/">Understand</a>
        <a href="../#audiences" data-nav-match="en/">For whom?</a>
        <a href="../#impact-fields" data-nav-match="en/">Impact fields</a>
        <a href="../#governance" data-nav-match="en/">Impact governance</a>
        <a href="../#public-impact-space" data-nav-match="en/">Public impact space</a>
        <a href="../tools/" data-nav-match="en/tools/">Tools</a>
        <a href="../#learn" data-nav-match="en/">Learn</a>
        <a href="../library/" data-nav-match="en/library/">Library</a>
        <a href="../#join" data-nav-match="en/">Join</a>
      </nav>
    </header>

    <main class="search-page" data-pagefind-body data-search-content>
      <section class="search-hero">
        <p class="hero-kicker">Knowledge search</p>
        <h1>Find the right entry point.</h1>
        <p class="hero-subtitle">Search is the navigation layer of Wirkungsökonomie. It starts with terms, groups results by knowledge area and leads from foundations to tools, impact fields and publications.</p>
      </section>

      <section class="search-shell" aria-label="Search website">
        <form class="search-box" role="search" data-search-form>
          <label class="search-label" for="site-search-input">Search term</label>
          <div class="search-input-row">
            <input id="site-search-input" name="q" type="search" autocomplete="off" spellcheck="true" placeholder="For example: impact tax, SDG, GRI, NWI, narratives, common good..." aria-describedby="search-help search-status">
            <button class="search-submit" type="submit">Search</button>
          </div>
          <p id="search-help" class="search-help">Without input, you see curated starting points. From 2 characters onward, the search shows suggestions, related topics and grouped results instead of one long raw list.</p>
          <p id="search-status" class="search-status" data-search-status aria-live="polite">Enter a search term.</p>
          <div class="search-live-suggestions" data-search-suggestions hidden role="region" aria-label="Search suggestions"></div>
        </form>

        <div class="search-quick-filter-panel" aria-label="Quick filters">
          <p class="hero-kicker">Quick filters</p>
          <div class="search-filter-chips">
            ${quickFilters.map(([value, label]) => `<button type="button" data-search-quick-filter="section" data-search-value="${esc(value)}">${esc(label)}</button>`).join("\n")}
          </div>
        </div>

        <div class="search-layout">
          <aside class="search-filters" aria-label="Search filters">
            <details>
              <summary>Show advanced filters</summary>
              <div class="filter-stack">
                <label>Type
                  <select data-search-filter="section">
                    ${options(sectionOptions)}
                  </select>
                </label>
                <label>Format
                  <select data-search-filter="format">
                    ${options(formatOptions)}
                  </select>
                </label>
                <label>Impact space
                  <select data-search-filter="impactSpaces">
                    ${options(impactOptions)}
                  </select>
                </label>
                <label>Standards / data sources
                  <select data-search-filter="standards">
                    ${options(standardOptions)}
                  </select>
                </label>
                <label>Instruments
                  <select data-search-filter="instruments">
                    ${options(instrumentOptions)}
                  </select>
                </label>
                <label>Topics
                  <select data-search-filter="tags">
                    ${options(tagOptions)}
                  </select>
                </label>
                <button class="filter-reset" type="button" data-search-reset>Reset filters</button>
              </div>
            </details>
          </aside>

          <section class="search-results-panel" aria-label="Search results">
            <div class="search-recommended" data-search-recommended hidden></div>
            <div class="search-related" data-search-related hidden></div>

            <div class="search-empty" data-search-empty>
              <h2>Frequently searched topics</h2>
              <div class="search-suggestion-grid">
                ${suggestions.map(([value, label]) => `<button type="button" data-search-suggestion="${esc(value)}">${esc(label)}</button>`).join("\n")}
              </div>
            </div>

            <h2 class="search-results-heading">Top results</h2>
            <ol class="search-result-list" data-search-results></ol>
          </section>
        </div>
      </section>
      <section class="section section-soft wirkungsraum-query-inline" aria-labelledby="search-history-title">
        <div>
          <div class="section-header">
            <p class="hero-kicker">My Impact Space</p>
            <h2 id="search-history-title">My past search queries</h2>
            <p>Past queries and their results stay local in this browser. You can reopen a search directly or sort it further in My Impact Space.</p>
          </div>
          <div class="wirkungsraum-history-list" data-search-history-inline-list>
            <article class="card"><p class="card-text">No past search queries in this browser yet.</p></article>
          </div>
        </div>
      </section>
    </main>
    <footer class="footer" data-search-exclude>
      <div class="footer-grid">
        <div>
          <p class="hero-kicker">Wirkungsökonomie</p>
          <h2>The new order of prosperity</h2>
          <p>Wirkungsökonomie is an independent social and economic model that makes impact on people, planet and democracy visible, assessable and relevant for decisions.</p>
        </div>
        <a class="btn btn-primary" href="../tools/">Open English tools</a>
        <nav class="footer-legal-nav" aria-label="Footer" data-search-exclude>
          <a href="../library/">Library</a>
          <a href="../../suche.html" hreflang="de">German search page</a>
          <a href="../../impressum.html" hreflang="de">German legal notice</a>
          <a href="../../datenschutz.html" hreflang="de">German privacy</a>
        </nav>
        <p>© 2026 Natalie Weber - Wirkungsökonomie</p>
      </div>
    </footer>
    <script src="../../assets/js/main.js?v=20260704-en-search"></script>
    <script src="../../assets/js/search.js?v=20260704-en-search"></script>
  </body>
</html>
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html);
updateSitemap();
console.log("English search page written: en/search/index.html");
