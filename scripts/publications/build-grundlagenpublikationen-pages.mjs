import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const sourcePath = path.join(root, "content/publications/grundlagenpublikationen.json");
const outputRoot = path.join(root, "bibliothek/eintraege");

const data = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function list(items = []) {
  const values = items.filter(Boolean);
  if (!values.length) return "";
  return `<ul>${values.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
}

function chips(items = []) {
  const values = items.filter(Boolean);
  if (!values.length) return "";
  return `<div class="document-chip-row">${values.map((item) => `<span>${esc(item)}</span>`).join("")}</div>`;
}

function publicHref(rawUrl = "") {
  if (!rawUrl) return "";
  if (/^https?:\/\//i.test(rawUrl) || rawUrl.startsWith("/")) return rawUrl;
  return `/${rawUrl.replace(/^\.?\//, "")}`;
}

function relatedPublicationLinks(publication) {
  const siblings = (data.publications || []).filter((candidate) => candidate.id !== publication.id);
  if (!siblings.length) return "";
  return `<h2>Verknüpfte Grundlagen</h2>
          <ul>${siblings.map((candidate) => `<li><a href="/bibliothek/eintraege/${esc(candidate.id)}/">${esc(candidate.title)}</a></li>`).join("")}</ul>`;
}

function renderPublication(publication) {
  const pdfHref = publicHref(publication.urls?.primary || "");
  const title = `${publication.title} ${publication.version || ""}`.trim();
  const description = publication.shortDescription || publication.abstract || "";
  const metaTitle = `${title} | Bibliothek der Wirkungsökonomie`;
  const actionLinks = [
    pdfHref ? `<a class="btn btn-primary" href="${esc(pdfHref)}">PDF öffnen</a>` : "",
    `<a class="btn btn-secondary" href="/bibliothek/">Zur Bibliothek</a>`,
  ].filter(Boolean).join("");

  return `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(metaTitle)}</title>
    <meta name="description" content="${esc(description)}">
    <meta name="search_title" content="${esc(metaTitle)}">
    <meta name="search_description" content="${esc(description)}">
    <meta name="search_section" content="Bibliothek">
    <meta name="search_type" content="Dokument">
    <link rel="stylesheet" href="/assets/css/style.css?v=20260612-mobile-table-fix">
  </head>
  <body>
    <header class="site-header" data-search-exclude>
      <a class="brand" href="/" aria-label="Wirkungsökonomie Startseite">
        <span class="brand-mark"><img src="/assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span>
        <span class="brand-name">Wirkungsökonomie</span>
      </a>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav">
        <span class="nav-toggle-icon" aria-hidden="true">☰</span>
        <span class="sr-only">Menü</span>
      </button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation" data-search-exclude>
        <a href="/">Start</a>
        <a href="/verstehen/">Verstehen</a>
        <a href="/wirkungsfelder/">Wirkungsfelder</a>
        <a href="/werkzeuge/">Praxis &amp; Tools</a>
        <a href="/lernen/">Lernen</a>
        <a href="/bibliothek/">Bibliothek</a>
      </nav>
    </header>
    <main data-pagefind-body>
      <section class="hero compact-hero document-detail-hero">
        <p class="hero-kicker">${esc(publication.type || "Publikation")} · ${esc(publication.status || "Referenz")}</p>
        <h1>${esc(title)}</h1>
        <p class="hero-subtitle">${esc(publication.subtitle || description)}</p>
        <div class="document-card-badges">
          <span class="status-badge">${esc(publication.type || "Dokument")}</span>
          <span class="status-badge">${esc(publication.status || "Referenz")}</span>
          <span class="status-badge">Version ${esc(publication.version || "n/a")}</span>
        </div>
      </section>
      <section class="section document-detail-grid">
        <aside class="document-detail-aside" data-search-exclude>
          <dl>
            <dt>Autorin</dt><dd>${esc(publication.author || "Natalie Weber")}</dd>
            <dt>Herausgeber</dt><dd>${esc(publication.publisher || "Wirkungsökonomie")}</dd>
            <dt>Stand</dt><dd>${esc(publication.dateOrStand || publication.publicationDate || "")}</dd>
            <dt>Umfang</dt><dd>${publication.pages ? `${esc(publication.pages)} Seiten` : "n/a"} · ${esc((publication.formats || []).join(", ") || "Online")}</dd>
            <dt>Sprache</dt><dd>${esc(publication.language || "de")}</dd>
            <dt>Reviewstatus</dt><dd>${esc(publication.reviewStatus || "")}</dd>
          </dl>
          ${chips(publication.topics)}
          <div class="document-action-row">${actionLinks}</div>
        </aside>
        <article class="document-detail-main">
          <h2>Kurz gesagt</h2>
          <p>${esc(description)}</p>
          <h2>Einordnung</h2>
          <p>${esc(publication.impactClassification || publication.abstract || "")}</p>
          <h2>Kernpunkte</h2>
          ${list(publication.keyPoints)}
          <h2>Inhaltsüberblick</h2>
          ${list(publication.contentOutline)}
          <h2>Zitierhinweis</h2>
          <p>${esc(publication.citation || "")}</p>
          ${relatedPublicationLinks(publication)}
        </article>
      </section>
    </main>
    <script src="/assets/js/main.js"></script>
  </body>
</html>
`;
}

for (const publication of data.publications || []) {
  if (!publication.id) continue;
  const outputDir = path.join(outputRoot, publication.id);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, "index.html"), renderPublication(publication), "utf8");
}

console.log(`Wrote ${(data.publications || []).length} Grundlagenpublikationen detail pages.`);
