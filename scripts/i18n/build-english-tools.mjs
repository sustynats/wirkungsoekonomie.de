import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "en/tools/index.html");
const SITEMAP = path.join(ROOT, "sitemap.xml");
const SITE = "https://wirkungsoekonomie.de";
const TODAY = new Date().toISOString().slice(0, 10);

const toolCards = [
  {
    kicker: "Public impact space",
    title: "Debate Compass",
    text: "Respond to public narratives by separating claim, frame, consequence check, impact pathway and democratic response.",
    href: "../../wirkungsradar/",
    status: "Live German source",
  },
  {
    kicker: "Orientation",
    title: "WÖk Compass",
    text: "Understand impact, impact potential, impact risk, positive net impact, feedback and safeguards in a few minutes.",
    href: "../../kompass.html",
    status: "German source",
  },
  {
    kicker: "Tool finder",
    title: "WÖk Scanner",
    text: "Move from a user question to the right method, demo, calculator, register or deeper reference page.",
    href: "../../anwendungen/scanner.html",
    status: "German source",
  },
  {
    kicker: "Product logic",
    title: "Product Impact Scorecards",
    text: "Connect product data, impact fields, data quality, non-compensation and reverse merit order logic.",
    href: "../../werkzeuge/produktscorecards/",
    status: "German source",
  },
  {
    kicker: "Prioritization",
    title: "Reverse Merit Order",
    text: "Prioritize options by positive net impact while keeping severe negative impacts visible instead of offsetting them away.",
    href: "../../werkzeuge/reverse-merit-order/",
    status: "German source",
  },
  {
    kicker: "Impact controlling",
    title: "Net Impact Index, IOI and T-SROI",
    text: "Distinguish operational net impact, investment impact, transformative leverage, data quality and learning loops.",
    href: "../../werkzeuge/impact-controlling/",
    status: "German source",
  },
  {
    kicker: "Governance",
    title: "Impact Audit and Impact Council",
    text: "Keep impact assessment reviewable, contestable and democratically correctable without turning it into person scoring.",
    href: "../../werkzeuge/wirkungsaudit/",
    status: "German source",
  },
  {
    kicker: "Registers",
    title: "WÖk IDs and Public Research Register",
    text: "Connect indicators, sources, methods, versions and review status so impact data remains traceable.",
    href: "../../werkzeuge/woek-id-register/",
    status: "German source",
  },
  {
    kicker: "Media and language",
    title: "Media Impact and Framing Checks",
    text: "Assess resonance spaces, framing, source clarity and democratic risk without pretending to police opinions.",
    href: "../../werkzeuge/medienwirkungscheck/",
    status: "German source",
  },
  {
    kicker: "Public procurement",
    title: "Impact-Oriented Procurement",
    text: "Use purchasing decisions as impact levers by connecting requirements, evidence, follow-up costs and public purpose.",
    href: "../../werkzeuge/oeffentliche-beschaffung/",
    status: "German source",
  },
  {
    kicker: "Capital",
    title: "Impact Funds and Capital Impact Checks",
    text: "Review capital allocation, portfolio risk, insurability and impact-oriented financing without reducing impact to return.",
    href: "../../werkzeuge/kapitalwirkungscheck/",
    status: "German source",
  },
  {
    kicker: "Resilience",
    title: "Resilience Radar and Critical Infrastructure",
    text: "Make dependencies, vulnerabilities, public capacity and democratic resilience visible before damage occurs.",
    href: "../../werkzeuge/resilienz-radar-kommune/",
    status: "German source",
  },
];

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderCard(card) {
  return `<article class="card method-tool-card">
    <div class="method-tool-card-head">
      <p class="card-kicker">${esc(card.kicker)}</p>
      <span class="status-badge">${esc(card.status)}</span>
    </div>
    <h3 class="card-title">${esc(card.title)}</h3>
    <p class="card-text">${esc(card.text)}</p>
    <p class="method-tool-notice">Model-based orientation only. No automatic decision, no official rating and no person scoring.</p>
    <div class="portal-card-actions"><a class="text-link" href="${esc(card.href)}" hreflang="de" lang="en">Open source page</a></div>
  </article>`;
}

function updateSitemap() {
  if (!fs.existsSync(SITEMAP)) return;
  let xml = fs.readFileSync(SITEMAP, "utf8");
  const loc = `${SITE}/en/tools/`;
  xml = xml.replace(new RegExp(`\\s*<url>\\s*<loc>${loc.replaceAll("/", "\\/")}</loc>\\s*<lastmod>[^<]+</lastmod>\\s*</url>`, "g"), "");
  xml = xml.replace("</urlset>", `  <url><loc>${loc}</loc><lastmod>${TODAY}</lastmod></url>\n</urlset>`);
  fs.writeFileSync(SITEMAP, xml);
}

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Tools | Wirkungsökonomie</title>
    <meta name="description" content="English overview of Wirkungsökonomie tools, methods, scorecards, registers, impact controlling and public impact space demos.">
    <meta name="search_title" content="Tools | Wirkungsökonomie">
    <meta name="search_description" content="English overview of Wirkungsökonomie tools, methods, scorecards and registers.">
    <meta name="search_section" content="English">
    <meta name="search_type" content="Tools">
    <link rel="canonical" href="${SITE}/en/tools/">
    <link rel="alternate" hreflang="en" href="${SITE}/en/tools/">
    <link rel="alternate" hreflang="de" href="${SITE}/werkzeuge/">
    <link rel="stylesheet" href="../../assets/css/style.css?v=20260704-en-tools">
  </head>
  <body data-site-locale="en">
    <header class="site-header" data-search-exclude>
      <a class="brand" href="../" aria-label="Wirkungsökonomie English homepage">
        <span class="brand-mark"><img src="../../assets/img/brand/signet.svg" alt="Wirkungsökonomie logo"></span>
        <span class="brand-name">Wirkungsökonomie</span>
      </a>
      <nav class="site-utility-nav" aria-label="Quick links" data-search-exclude>
        <a class="site-utility-link site-utility-link--suche" href="./" data-nav-match="en/tools/" data-utility-label="Search">Search</a>
        <a class="site-utility-link site-utility-link--woek-ki" href="../#tools" data-nav-match="en/" data-utility-label="WÖk AI">AI</a>
        <a class="site-utility-link site-utility-link--wok-app" href="../#tools" data-nav-match="en/" data-utility-label="WÖk App">WÖk App</a>
        <a class="site-utility-link site-utility-link--mein-wirkungsraum" href="../#join" data-nav-match="en/" data-utility-label="My impact room" data-utility-primary="true">My impact room</a>
        <a class="site-utility-link site-utility-link--language" href="../../werkzeuge/" hreflang="de" lang="de" data-lang-switch="de" data-utility-label="Deutsch">DE</a>
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
        <a href="./" data-nav-match="en/tools/">Tools</a>
        <a href="../#learn" data-nav-match="en/">Learn</a>
        <a href="../library/" data-nav-match="en/library/">Library</a>
        <a href="../#join" data-nav-match="en/">Join</a>
      </nav>
    </header>
    <main data-pagefind-body>
      <section class="hero method-map-hero">
        <div class="hero-grid">
          <div>
            <p class="hero-kicker">Tools and methods</p>
            <h1 class="hero-title">Impact tools without person scoring</h1>
            <p class="hero-subtitle">The tool layer translates Wirkungsökonomie into practical checks, scorecards, registers, calculators and demos. Each tool remains model-based unless explicitly published as an audited method.</p>
            <p class="hero-text">The English rollout covers all visible tools on the website. This hub is the first English entry point; individual tool pages are tracked in the route coverage and will move below <code>/en/</code> step by step.</p>
            <div class="hero-actions no-print">
              <a class="btn btn-primary" href="#tool-map">Explore tool map</a>
              <a class="btn btn-secondary" href="../../public/data/en-route-coverage.json">Open route coverage</a>
            </div>
          </div>
          <aside class="protection-notice" role="note" aria-label="Tool safeguards">
            <p class="card-kicker">Safeguards</p>
            <h2 class="card-title">Model-based. Reviewable. No social credit.</h2>
            <ul class="protection-notice-list">
              <li>Demos show impact logic, not official certification.</li>
              <li>Scores never replace review, democratic decision-making or human responsibility.</li>
              <li>No tool rates people or creates moral rankings of persons.</li>
            </ul>
          </aside>
        </div>
      </section>
      <section class="section" id="tool-map">
        <div class="section-header">
          <p class="hero-kicker">Tool map</p>
          <h2>From user question to method</h2>
          <p>These entry points cover the visible tool families. German source pages remain linked until their full English counterparts are available.</p>
        </div>
        <div class="card-grid three">
          ${toolCards.map(renderCard).join("\n")}
        </div>
      </section>
    </main>
    <footer class="footer" data-search-exclude>
      <div class="footer-grid">
        <div>
          <p class="hero-kicker">Wirkungsökonomie</p>
          <h2>Tools and methods</h2>
          <p>Tools support impact learning, feedback and governance. They do not automate moral judgment or person-level assessment.</p>
        </div>
        <nav class="footer-nav" aria-label="Footer Navigation" data-search-exclude>
          <div class="footer-nav-group">
            <h3>English</h3>
            <div class="footer-nav-links">
              <a href="../">English homepage</a>
              <a href="./">Tools</a>
              <a href="../library/">Library</a>
            </div>
          </div>
          <div class="footer-nav-group">
            <h3>German source</h3>
            <div class="footer-nav-links">
              <a href="../../werkzeuge/" hreflang="de">German tools source</a>
              <a href="../../erleben/" hreflang="de" lang="de">Demos</a>
              <a href="../../wirkungsradar/" hreflang="de" lang="de">Wirkungsradar</a>
            </div>
          </div>
        </nav>
        <p>© 2026 Natalie Weber - Wirkungsökonomie</p>
      </div>
    </footer>
    <script src="../../assets/js/main.js?v=20260704-i18n-en-nav"></script>
  </body>
</html>
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html);
updateSitemap();
console.log("English tools hub written.");
