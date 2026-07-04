import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, "public/data/en-document-translation-manifest.json");
const DOCUMENTS_PATH = path.join(ROOT, "content/documents/documents.json");
const OUT = path.join(ROOT, "en/library/index.html");
const SITEMAP = path.join(ROOT, "sitemap.xml");
const SITE = "https://wirkungsoekonomie.de";
const TODAY = new Date().toISOString().slice(0, 10);

const titleEn = new Map([
  ["folgencheck-wirkungspolitische-sprache", "Consequence Check Instead of Fact Check"],
  ["fuenf-wellen-oeffentlicher-wirkung", "The Five Waves of Public Impact"],
  ["fuenf-wellen-wirkungsentfaltung", "The Five Waves of Impact Unfolding"],
  ["klimawandel-finanzmarkt", "Climate Change and the Financial Market"],
  ["standardwerk-neue-ordnung-wohlstands-2026", "The New Order of Prosperity"],
  ["nachhaltiger-einzelhandel", "Sustainable Retail"],
  ["nachhaltiges-marketing-mix", "Sustainable Marketing Mix"],
  ["nachhaltigkeitsstrategie-mittelstaendische-beratungsunternehmen", "Sustainability Strategy for Medium-Sized Consulting Firms"],
  ["nachhaltigkeitstransformation-im-handwerk", "Sustainability Transformation in Skilled Trades"],
  ["arbeitspapier-doppelte-wesentlichkeit-impact-controlling", "Double Materiality, Impact Controlling and Wirkungsökonomie"],
  ["beispiel-apfel-wirkungssteuer", "Example: Regional Apple vs. Chilean Apple"],
  ["beispiel-konzern", "Case Example: From CSRD to Product Scorecard"],
  ["grundlagenpapier-wirkungsoekonomie", "Foundational Paper on Wirkungsökonomie"],
  ["illusionmaschine-buerokratieabbau", "The Illusion Machine of Bureaucracy Reduction"],
  ["leitbild-mensch-planet-demokratie", "Guiding Vision for People, Planet and Democracy"],
  ["minifest-wirkungsoekonomie", "Mini-Manifesto of Wirkungsökonomie"],
  ["nachhaltigkeit-systemarchitektur", "Sustainability Is Not a Strategy. It Is a System Architecture."],
  ["nats-woek-allgemein", "From Capital to Impact"],
  ["sexarbeit-als-soziale-infrastruktur", "Sex Work as Social Infrastructure"],
  ["systemmodell-wirkungsoekonomie", "System Model of Wirkungsökonomie"],
  ["technische-leitlinien-wustg", "Technical Guidelines for the Impact Value Added Tax"],
  ["von-der-wissensgesellschaft-zur-wirkungsgesellschaft", "From the Knowledge Society to the Impact Society"],
  ["wenn-maschinen-arbeiten", "When Machines Work"],
  ["whitepaper-t-sroi", "White Paper: Transformative Social Return on Investment"],
  ["wirkungsoekonomie-lieferkette", "Wirkungsökonomie in the Supply Chain"],
  ["wirkungsrat-konzept", "Impact Council Concept"],
  ["woek-begriffsleitfaden-fuehrend", "Leading Terminology Guide for Wirkungsökonomie"],
  ["woek-master-items-register", "WÖk Master Items Register"],
  ["impact-strategie-controlling-marketing-management-einkauf-chemieindustrie", "Impact Strategy, Impact Controlling, Impact Marketing and Impact Management in Corporate Purchasing"],
  ["woek-manifest", "WÖk Manifesto"],
  ["wp-einkommen", "Impact Income"],
  ["wp-produkte", "Product Taxation by Impact"],
  ["wp-rente", "Working Paper on Pensions"],
  ["wp-wohnungsmarkt", "Working Paper on the Housing Market"],
  ["wstg-oktober-2025", "Impact Tax Act, October 2025"],
]);

const sectionEn = new Map([
  ["Bücher & Praxisleitfäden", "Books and Practical Guides"],
  ["Einsteiger:innen", "Introduction"],
  ["Einstieg & Vorträge", "Introductions and Talks"],
  ["Empfohlener Einstieg", "Recommended Starting Point"],
  ["Essays & Debatte", "Essays and Debate"],
  ["Führende Referenzen", "Leading References"],
  ["Grundlagen & Leitbild", "Foundations and Guiding Vision"],
  ["Methoden & Werkzeuge", "Methods and Tools"],
  ["Praxisbeispiele", "Practical Examples"],
  ["Recht & Steuerung", "Law and Governance"],
  ["Register & Daten", "Registers and Data"],
  ["Staat & Demokratie", "State and Democracy"],
  ["Technische Anlagen", "Technical Annexes"],
  ["Wirkungsfelder", "Impact Fields"],
  ["Wirkungssteuerung", "Impact Governance"],
]);

const typeEn = new Map([
  ["arbeitspapier", "Working paper"],
  ["buch", "Book"],
  ["datenregister", "Data register"],
  ["dossier", "Dossier"],
  ["essay", "Essay"],
  ["fallbeispiel", "Case example"],
  ["gesetzesentwurf", "Draft law"],
  ["grundlagenpapier", "Foundational paper"],
  ["konzept", "Concept paper"],
  ["kurzfassung", "Short introduction"],
  ["leitbild", "Guiding vision"],
  ["manifest", "Manifesto"],
  ["paper", "Paper"],
  ["standardwerk", "Core reference"],
  ["technische-leitlinie", "Technical guideline"],
  ["whitepaper", "White paper"],
  ["working-paper", "Working paper"],
]);

const sectionIntro = new Map([
  ["Books and Practical Guides", "Applied books and practice-oriented guides for using impact logic in organizations, markets and everyday decision contexts."],
  ["Recommended Starting Point", "The shortest and strongest entry points for readers who are new to Wirkungsökonomie."],
  ["Foundations and Guiding Vision", "Core texts that explain the conceptual foundation, ethical reference frame and systemic purpose of the model."],
  ["Methods and Tools", "Method papers and tool-oriented texts for impact assessment, feedback, prioritization and governance."],
  ["Impact Fields", "Texts that apply impact logic to concrete fields such as finance, housing, work, health, supply chains and social infrastructure."],
]);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function relFromEnglishLibrary(value = "") {
  return `../../${String(value).replace(/^\/+/, "")}`;
}

function germanPageFor(item) {
  return (item.referencedBy || []).find((ref) => ref.startsWith("bibliothek/") && ref.endsWith("/index.html")) || "";
}

function routeFromIndexHtml(value = "") {
  return value.replace(/index\.html$/, "");
}

function docSummary(doc, item) {
  const kind = typeEn.get(doc?.documentType) || "Document";
  const section = sectionEn.get(item.librarySection) || "Library";
  if (doc?.summaryEn) return doc.summaryEn;
  if (section === "Recommended Starting Point") return "A compact entry point into the shift from capital as the dominant signal toward positive net impact as a learning and decision reference.";
  if (section === "Foundations and Guiding Vision") return "A foundational text for understanding how Wirkungsökonomie distinguishes impact, impact potential and impact risk in relation to people, planet and democracy.";
  if (section === "Methods and Tools") return "A method-oriented text for translating impact logic into assessment, steering, feedback or practical governance.";
  if (section === "Impact Fields") return "An applied text that shows how impact logic can be used in a specific field without reducing reach, reporting or intention to actual impact.";
  if (kind === "Book") return "A longer reference text that connects sustainability, SDGs, SDG+ and impact-oriented transformation in practical contexts.";
  return "A public library document of Wirkungsökonomie. The English downloadable version is tracked here and will be linked as soon as it is available.";
}

function actionLinks(item) {
  const links = [];
  if (item.status === "available") {
    links.push(`<a class="btn btn-primary" href="${esc(relFromEnglishLibrary(item.englishTargetPath))}">Open English PDF</a>`);
  } else {
    links.push(`<span class="btn btn-secondary" aria-disabled="true">English PDF in preparation</span>`);
  }
  const germanPage = germanPageFor(item);
  if (germanPage) {
    links.push(`<a class="btn btn-ghost" href="${esc(relFromEnglishLibrary(routeFromIndexHtml(germanPage)))}" hreflang="de" lang="en">German source page</a>`);
  }
  return links.join("");
}

function card(item, doc) {
  const section = sectionEn.get(item.librarySection) || item.librarySection || "Library";
  const type = typeEn.get(doc?.documentType) || item.fileType.toUpperCase();
  const status = item.status === "available" ? "English PDF available" : "English PDF in preparation";
  return `<article class="knowledge-library-card" data-library-card data-type="${esc(type)}" data-status="${esc(status)}" data-source="${esc(section)}" data-query="${esc([titleEn.get(item.id) || item.titleDe, section, type, status].join(" ").toLowerCase())}">
      <div class="document-card-badges">
        <span class="status-badge">${esc(section)}</span>
        <span class="status-badge">${esc(type)}</span>
      </div>
      <h3>${esc(titleEn.get(item.id) || item.titleDe)}</h3>
      <p>${esc(docSummary(doc, item))}</p>
      <dl class="document-card-meta">
        <dt>English version</dt><dd>${esc(status)}</dd>
        <dt>Source</dt><dd>${esc(item.fileType.toUpperCase())} · ${esc(doc?.version || "tracked")}</dd>
      </dl>
      <div class="document-action-row">${actionLinks(item)}</div>
    </article>`;
}

function groupBySection(items) {
  const groups = new Map();
  for (const item of items) {
    const section = sectionEn.get(item.librarySection) || item.librarySection || "Library";
    if (!groups.has(section)) groups.set(section, []);
    groups.get(section).push(item);
  }
  return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0], "en"));
}

function renderHeader() {
  return `<header class="site-header" data-search-exclude>
      <a class="brand" href="../" aria-label="Wirkungsökonomie English homepage">
        <span class="brand-mark"><img src="../../assets/img/brand/signet.svg" alt="Wirkungsökonomie logo"></span>
        <span class="brand-name">Wirkungsökonomie</span>
      </a>
      <nav class="site-utility-nav" aria-label="Quick links" data-search-exclude>
        <a class="site-utility-link site-utility-link--suche" href="../#tools" data-nav-match="en/" data-utility-label="Search">Search</a>
        <a class="site-utility-link site-utility-link--woek-ki" href="../#tools" data-nav-match="en/" data-utility-label="WÖk AI">AI</a>
        <a class="site-utility-link site-utility-link--wok-app" href="../#tools" data-nav-match="en/" data-utility-label="WÖk App">WÖk App</a>
        <a class="site-utility-link site-utility-link--mein-wirkungsraum" href="../#join" data-nav-match="en/" data-utility-label="My impact room" data-utility-primary="true">My impact room</a>
        <a class="site-utility-link site-utility-link--language" href="../../bibliothek/" hreflang="de" lang="de" data-lang-switch="de" data-utility-label="Deutsch">DE</a>
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
        <a href="../#tools" data-nav-match="en/">Tools</a>
        <a href="../#learn" data-nav-match="en/">Learn</a>
        <a href="./" data-nav-match="en/library/">Library</a>
        <a href="../#join" data-nav-match="en/">Join</a>
      </nav>
    </header>`;
}

function renderPage(items, docsByPath, counts) {
  const groups = groupBySection(items);
  const sections = groups.map(([section, group]) => `<section class="section" id="${esc(section.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}">
        <div class="section-header">
          <p class="hero-kicker">${esc(section)}</p>
          <h2>${esc(section)}</h2>
          <p>${esc(sectionIntro.get(section) || "Tracked English library documents. English download files are linked as soon as they exist in the repository.")}</p>
        </div>
        <div class="card-grid three">${group.map((item) => card(item, docsByPath.get(item.sourcePath))).join("\n")}</div>
      </section>`).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>English Library | Wirkungsökonomie</title>
    <meta name="description" content="English library entry point for Wirkungsökonomie documents, with tracked English download status for the public core documents.">
    <meta name="search_title" content="English Library | Wirkungsökonomie">
    <meta name="search_description" content="English library entry point with status for translated PDFs and source pages.">
    <meta name="search_section" content="English">
    <meta name="search_type" content="Library">
    <link rel="canonical" href="${SITE}/en/library/">
    <link rel="alternate" hreflang="en" href="${SITE}/en/library/">
    <link rel="alternate" hreflang="de" href="${SITE}/bibliothek/">
    <link rel="stylesheet" href="../../assets/css/style.css?v=20260704-en-library">
  </head>
  <body data-site-locale="en">
    ${renderHeader()}
    <main data-pagefind-body>
      <section class="hero compact-hero document-library-hero">
        <p class="hero-kicker">English library</p>
        <h1>Documents, translations and source pages</h1>
        <p class="hero-subtitle">The English library tracks the public core documents of Wirkungsökonomie. Download links point to English files when they are available. Until then, each entry clearly marks the English PDF as in preparation and links to the German source page where one exists.</p>
        <div class="library-count-strip" aria-label="English document translation status">
          <span><strong>${counts.p0}</strong> core library documents</span>
          <span><strong>${counts.available}</strong> English downloads available</span>
          <span><strong>${items.length}</strong> tracked here</span>
          <span><strong>${counts.total}</strong> total download candidates</span>
        </div>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#recommended-starting-point">Start reading</a>
          <a class="btn btn-secondary" href="../../public/data/en-document-translation-manifest.json">Open translation manifest</a>
        </div>
      </section>
      <section class="section section-muted">
        <div class="download-card">
          <div>
            <p class="card-kicker">Translation policy</p>
            <h2>Editable text becomes English; image text waits.</h2>
            <p class="card-text">Website text, document text, SVG text and editable layers are part of the English rollout. Raster images and German text embedded inside images remain unchanged for the first English release.</p>
          </div>
          <div class="portal-card-actions no-print">
            <a class="btn btn-secondary" href="../../bibliothek/" hreflang="de" lang="en">German library</a>
          </div>
        </div>
      </section>
      ${sections}
    </main>
    <footer class="footer" data-search-exclude>
      <div class="footer-grid">
        <div>
          <p class="hero-kicker">Wirkungsökonomie</p>
          <h2>English library</h2>
          <p>Documents are being prepared as English versions while German source pages remain available for reference.</p>
        </div>
        <nav class="footer-nav" aria-label="Footer Navigation" data-search-exclude>
          <div class="footer-nav-group">
            <h3>English</h3>
            <div class="footer-nav-links">
              <a href="../">English homepage</a>
              <a href="./">Library</a>
              <a href="../#tools">Tools</a>
              <a href="../#join">Join</a>
            </div>
          </div>
          <div class="footer-nav-group">
            <h3>German source</h3>
            <div class="footer-nav-links">
              <a href="../../bibliothek/" hreflang="de">German library source</a>
              <a href="../../referenz/" hreflang="de" lang="de">Online book</a>
              <a href="../../blog.html" hreflang="de" lang="de">Journal</a>
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
}

function updateSitemap() {
  if (!fs.existsSync(SITEMAP)) return;
  let xml = fs.readFileSync(SITEMAP, "utf8");
  const loc = `${SITE}/en/library/`;
  xml = xml.replace(new RegExp(`\\s*<url>\\s*<loc>${loc.replaceAll("/", "\\/")}</loc>\\s*<lastmod>[^<]+</lastmod>\\s*</url>`, "g"), "");
  xml = xml.replace("</urlset>", `  <url><loc>${loc}</loc><lastmod>${TODAY}</lastmod></url>\n</urlset>`);
  fs.writeFileSync(SITEMAP, xml);
}

const manifest = readJson(MANIFEST_PATH);
const docs = readJson(DOCUMENTS_PATH).documents || [];
const docsByPath = new Map(docs.map((doc) => [doc.filePath, doc]));
const items = manifest.items
  .filter((item) => item.priority === "P0")
  .sort((a, b) => {
    const sectionA = sectionEn.get(a.librarySection) || a.librarySection || "";
    const sectionB = sectionEn.get(b.librarySection) || b.librarySection || "";
    if (sectionA !== sectionB) return sectionA.localeCompare(sectionB, "en");
    return (titleEn.get(a.id) || a.titleDe).localeCompare(titleEn.get(b.id) || b.titleDe, "en");
  });

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, renderPage(items, docsByPath, manifest.counts));
updateSitemap();

console.log(`English library written: ${items.length} core documents.`);
