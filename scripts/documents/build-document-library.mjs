import fs from "node:fs";
import path from "node:path";

const registryPath = "assets/data/document-registry.json";
const auditPath = "docs/document-registry-audit.md";
const downloadsPath = "downloads.html";
const libraryRoot = "bibliothek";
const siteUrl = "https://wirkungsoekonomie.de";

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const publicDocuments = registry.filter((document) => document.isPublic !== false);
const currentDocuments = publicDocuments.filter((document) => document.status === "current" && !document.isArchive);
const archiveDocuments = publicDocuments.filter((document) => document.status !== "current" || document.isArchive);
const labelBySlug = new Map([
  ["sdg-plus", "SDG+"],
  ["woek-id", "WÖk-ID"],
  ["t-sroi", "T-SROI"],
  ["nwi", "NWI"],
  ["wstg", "WStG"],
  ["wirkungseinkommen", "Wirkungseinkommen"],
  ["wirkungsfonds", "Wirkungsfonds"],
  ["wirkungsrueckkopplung", "Wirkungsrückkopplung"],
  ["positive-netto-wirkung", "Positive Netto-Wirkung"],
  ["mensch-planet-demokratie", "Mensch, Planet und Demokratie"],
]);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizePath(value) {
  if (!value) return "";
  return value.startsWith("/") ? value : `/${value}`;
}

function siteLink(value) {
  if (!value) return "";
  if (/^https?:\/\//.test(value)) return value;
  return `${siteUrl}${normalizePath(value)}`;
}

function slugToLabel(value) {
  return String(value || "")
    .replace(/^\/|\/$/g, "")
    .split("/")
    .filter(Boolean)
    .pop()
    ?.replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase()) || "Seite";
}

function tagList(items) {
  if (!items?.length) return "";
  return `<div class="document-tag-list">${items.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>`;
}

function linkList(items, labeler = slugToLabel) {
  if (!items?.length) return `<p class="card-text">Keine direkte Verknüpfung hinterlegt.</p>`;
  return `<ul class="clean-list document-link-list">${items
    .map((item) => `<li><a class="text-link" href="${escapeHtml(item)}">${escapeHtml(labeler(item))}</a></li>`)
    .join("")}</ul>`;
}

function relationLabelFromTerm(term) {
  if (labelBySlug.has(term)) return labelBySlug.get(term);
  return String(term || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function termHref(term) {
  const route = `/begriffe/${term}/`;
  return fs.existsSync(path.join(route.replace(/^\/|\/$/g, ""), "index.html")) ? route : "/glossar.html";
}

function relatedActionLabel(url) {
  if (!url) return "Vertiefung lesen";
  if (/\/erleben\/automatisierungs-wirkungseinkommensrechner\/|\/anwendungen\/scanner\.html/.test(url)) return "Passendes Tool testen";
  if (/\/werkzeuge\//.test(url)) return "Methodik lesen";
  if (/\/erleben/.test(url)) return "Beispiele ansehen";
  return "Vertiefung lesen";
}

function relationLinks(document) {
  const terms = (document.relatedTerms || []).map((term) => ({ term, href: termHref(term) }));
  return `
    <div class="document-related-grid">
      <article class="card compact">
        <p class="card-kicker">Begriffe</p>
        ${terms.length ? `<ul class="clean-list document-link-list">${terms.map(({ term, href }) => `<li><a class="text-link" href="${escapeHtml(href)}">${escapeHtml(relationLabelFromTerm(term))}</a></li>`).join("")}</ul>` : `<p class="card-text">Keine direkte Verknüpfung hinterlegt.</p>`}
      </article>
      <article class="card compact">
        <p class="card-kicker">Wirkungsfelder</p>
        ${linkList(document.relatedFields || [])}
      </article>
      <article class="card compact">
        <p class="card-kicker">Tools und Methoden</p>
        ${linkList(document.relatedTools || [])}
      </article>
    </div>`;
}

function documentOnlineText(document) {
  if (document.contentHtmlPath && fs.existsSync(document.contentHtmlPath)) {
    return `<div class="readable-prose document-online-text">
      ${fs.readFileSync(document.contentHtmlPath, "utf8")}
    </div>`;
  }
  return `
    <p>${escapeHtml(document.summary)}</p>
    <h3>Warum ist das relevant?</h3>
    <p>Das Dokument hilft, Wirkung nicht als Nebenthema zu behandeln, sondern als Grundlage für bessere Entscheidungen. Es verbindet Begriffe, Bewertungslogik und Anwendung so, dass Nutzer:innen den Zusammenhang zwischen Problem, Wirkung und möglicher Rückkopplung nachvollziehen können.</p>
    <h3>Für wen ist das Material gedacht?</h3>
    <p>${escapeHtml((document.audience || []).join(", "))}. Die Onlinefassung dient als schneller Einstieg. Die PDF-Fassung bleibt für vertiefte Lektüre, Ablage und Weitergabe verfügbar.</p>
    <h3>Wie wird es in der Wirkungsökonomie genutzt?</h3>
    <p>Die Veröffentlichung verknüpft fachliche Begriffe mit Wirkungsfeldern, Methoden und passenden Anwendungen. Dadurch bleibt das Dokument nicht nur ein Download, sondern wird Teil der öffentlichen Wissensstruktur der Wirkungsökonomie.</p>`;
}

function pageShell({ title, description, canonicalPath, main, extraHead = "" }) {
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)} - Wirkungsökonomie</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${siteLink(canonicalPath)}">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${siteLink(canonicalPath)}">
    <link rel="icon" href="/assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="/assets/css/style.css?v=20260526-document-library">
    ${extraHead}
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="/" aria-label="Wirkungsökonomie Startseite">
        <span class="brand-mark"><img src="/assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span>
        <span class="brand-name">Wirkungsökonomie</span>
      </a>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav">
        <span class="nav-toggle-icon" aria-hidden="true">☰</span>
        <span class="sr-only">Menü</span>
      </button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation">
        <a href="/">Start</a>
        <a href="/verstehen.html">Verstehen</a>
        <a href="/wirkungsfelder/">Wirkungsfelder</a>
        <a href="/erleben.html">Ausprobieren</a>
        <a href="/akademie.html">Akademie</a>
        <a href="/downloads.html">Bibliothek</a>
        <a href="/suche.html">Suche</a>
      </nav>
    </header>
    <main>
${main}
    </main>
    <footer class="site-footer">
      <p><strong>Wirkungsökonomie</strong> - Wissens- und Anwendungsraum für Wirkung auf Mensch, Planet und Demokratie.</p>
      <nav aria-label="Footer">
        <a href="/downloads.html">Bibliothek</a>
        <a href="/glossar.html">Glossar</a>
        <a href="/suche.html">Suche</a>
        <a href="/impressum.html">Impressum</a>
      </nav>
    </footer>
    <script src="/assets/js/main.js" defer></script>
  </body>
</html>
`;
}

function documentJsonLd(document) {
  return `<script type="application/ld+json">${JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: document.title,
      author: { "@type": "Person", name: "Natalie Weber" },
      about: { "@type": "Thing", name: "Wirkungsökonomie" },
      isAccessibleForFree: true,
      url: siteLink(document.onlineUrl),
      downloadUrl: document.pdfUrl ? siteLink(document.pdfUrl) : undefined,
      encodingFormat: document.pdfUrl ? "application/pdf" : "text/html",
      dateModified: document.stand,
      description: document.summary,
    },
    null,
    2,
  )}</script>`;
}

function documentActions(document, primary = true) {
  return `<div class="download-actions">
    ${primary && document.onlineUrl ? `<a class="btn btn-primary" href="${escapeHtml(document.onlineUrl)}">Onlinefassung lesen</a>` : ""}
    ${document.pdfUrl ? `<a class="btn btn-secondary" href="${escapeHtml(document.pdfUrl)}" target="_blank" rel="noopener">PDF herunterladen</a>` : ""}
    ${document.docxUrl ? `<a class="btn btn-secondary" href="${escapeHtml(document.docxUrl)}" target="_blank" rel="noopener">DOCX herunterladen</a>` : ""}
    ${document.relatedTools?.[0] ? `<a class="text-link" href="${escapeHtml(document.relatedTools[0])}">${escapeHtml(relatedActionLabel(document.relatedTools[0]))}</a>` : ""}
  </div>`;
}

function documentCard(document) {
  const searchText = [
    document.title,
    document.summary,
    document.type,
    ...(document.category || []),
    ...(document.relatedTerms || []),
    ...(document.audience || []),
  ].join(" ");
  return `<article class="download-card compact" data-download-card data-download-category="${escapeHtml((document.category || []).join(" ").toLowerCase())}" data-download-title="${escapeHtml(document.title)}" data-download-description="${escapeHtml(searchText)}">
    <p class="card-kicker">${escapeHtml(document.type)} · ${document.isArchive ? "Archiv" : "Aktuell"}</p>
    <h3 class="card-title">${escapeHtml(document.title)}</h3>
    <dl class="download-meta">
      <div><dt>Typ</dt><dd>${escapeHtml(document.type)}</dd></div>
      <div><dt>Stand</dt><dd>${escapeHtml(document.stand)}</dd></div>
      ${document.fileSize ? `<div><dt>Dateigröße</dt><dd>${escapeHtml(document.fileSize)}</dd></div>` : ""}
    </dl>
    <p class="card-text">${escapeHtml(document.summary)}</p>
    ${tagList(document.category)}
    <div class="download-related"><span>Passend dazu</span>${(document.relatedTerms || []).slice(0, 3).map((term) => `<a href="${escapeHtml(termHref(term))}">${escapeHtml(relationLabelFromTerm(term))}</a>`).join("")}${(document.relatedFields || []).slice(0, 1).map((field) => `<a href="${escapeHtml(field)}">${escapeHtml(slugToLabel(field))}</a>`).join("")}</div>
    ${document.isArchive || !document.onlineUrl ? `<p class="document-archive-badge">Archivmaterial · PDF-only</p>` : ""}
    ${documentActions(document, !document.isArchive && Boolean(document.onlineUrl))}
  </article>`;
}

function buildDownloadsPage() {
  const jsonLd = `<script type="application/ld+json">${JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Bibliothek der Wirkungsökonomie",
      url: siteLink("/downloads.html"),
      inLanguage: "de",
      description: "Zentrale Dokumentenbibliothek der Wirkungsökonomie mit Onlinefassungen, PDFs, Dossiers und verwandten Begriffen.",
      hasPart: publicDocuments.map((document) => ({
        "@type": "CreativeWork",
        name: document.title,
        url: siteLink(document.onlineUrl),
        downloadUrl: document.pdfUrl ? siteLink(document.pdfUrl) : undefined,
        encodingFormat: document.pdfUrl ? "application/pdf" : "text/html",
      })),
    },
    null,
    2,
  )}</script>`;

  const archiveSection = archiveDocuments.length
    ? `<details class="archive-library"><summary>Archiv und ältere Arbeitsstände</summary>
        <p class="card-text">Diese Materialien bleiben zur Nachvollziehbarkeit erhalten. Der aktuelle Begriffs- und Modellstand liegt in den Onlinefassungen, Begriffseiten und aktuellen Dossiers.</p>
        <div class="download-library-grid">${archiveDocuments.map(documentCard).join("\n")}</div>
      </details>`
    : `<section class="section section-muted"><div class="section-header"><p class="hero-kicker">Archiv</p><h2>Archiv und ältere Arbeitsstände</h2><p>Aktuell sind keine PDF-only Archivdokumente in der öffentlichen Kernbibliothek markiert. Rangpakete und Arbeitsmaterialien bleiben in den jeweiligen Downloadbereichen auffindbar.</p></div></section>`;

  const main = `
      <section class="hero">
        <div>
          <p class="hero-kicker">Bibliothek</p>
          <h1 class="hero-title">Dokumente online lesen und herunterladen.</h1>
          <p class="hero-subtitle">Diese Bibliothek bündelt die öffentlichen Materialien der Wirkungsökonomie als Wissensobjekte: mit Onlinefassung, PDF, passenden Begriffen, Wirkungsfeldern und Tools.</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="#dokumente">Aktuelle Dokumente ansehen</a>
            <a class="btn btn-secondary" href="/suche.html">Inhalte suchen</a>
          </div>
        </div>
      </section>

      <section class="section section-muted" aria-labelledby="reading-path-title">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Lesepfade</p>
            <h2 id="reading-path-title">Vom Einstieg zur Anwendung.</h2>
            <p>Für den schnellen Einstieg helfen diese Pfade. Wer ein einzelnes Dokument sucht, nutzt die Suche oder die Dokumentkarten darunter.</p>
          </div>
          <ol class="reading-order">
            <li><span>1</span><strong>Grundlagen</strong><em>Leitbild, Grundlagenwerk und Wirkung statt Kapital lesen.</em></li>
            <li><span>2</span><strong>Methodik</strong><em>Prozessarchitektur, Master Items und Scorecard-Logik verstehen.</em></li>
            <li><span>3</span><strong>Anwendungen</strong><em>Arbeit, Produkte, Wohnen, Medien und Kommunen vertiefen.</em></li>
            <li><span>4</span><strong>Recht und Steuerung</strong><em>Gesetzesentwürfe und Use Cases als Arbeitsmaterial nutzen.</em></li>
          </ol>
        </div>
      </section>

      <section class="section" id="dokumente">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Aktuelle Dokumente</p>
            <h2>Onlinefassungen zuerst, PDFs als Download.</h2>
            <p>Aktuelle Veröffentlichungen haben eine lesbare Onlinefassung. PDFs bleiben als Download und Zitierfassung verfügbar.</p>
          </div>
          <div class="download-library-controls" aria-label="Bibliothek filtern">
            <label class="download-search" for="download-search">
              <span>Titel und Kurzbeschreibung durchsuchen</span>
              <input id="download-search" type="search" placeholder="z. B. Wirkungseinkommen, Medien, Produkte" data-download-search>
            </label>
            <div class="category-row" aria-label="Dokumentkategorien">
              <button class="pill active" type="button" data-download-filter="all">Alle Dokumente</button>
              <button class="pill" type="button" data-download-filter="grundlagen">Grundlagen</button>
              <button class="pill" type="button" data-download-filter="methodik">Methodik</button>
              <button class="pill" type="button" data-download-filter="arbeit">Arbeit</button>
              <button class="pill" type="button" data-download-filter="produkte">Produkte</button>
              <button class="pill" type="button" data-download-filter="medien">Medien</button>
              <button class="pill" type="button" data-download-filter="kommunen">Kommunen</button>
            </div>
            <p class="download-filter-status" aria-live="polite"></p>
          </div>
          <div class="download-library-grid" data-download-list>
            ${currentDocuments.map(documentCard).join("\n")}
          </div>
        </div>
      </section>

      ${archiveSection}
`;
  fs.writeFileSync(
    downloadsPath,
    pageShell({
      title: "Bibliothek der Wirkungsökonomie",
      description: "Zentrale Dokumentenbibliothek der Wirkungsökonomie mit Onlinefassungen, PDFs und passenden Begriffen, Wirkungsfeldern und Tools.",
      canonicalPath: "/downloads.html",
      main,
      extraHead: jsonLd,
    }),
  );
}

function buildDocumentPage(document) {
  const keyPoints = (document.keyPoints || [])
    .map((point) => `<li>${escapeHtml(point)}</li>`)
    .join("");
  const sourceLink = document.sourceOnlineUrl
    ? `<p class="card-text">Für weiterführende Kapitel und bestehende Lesefassungen siehe auch <a class="text-link" href="${escapeHtml(document.sourceOnlineUrl)}">die thematisch passende Onlinefassung</a>.</p>`
    : "";
  const main = `
      <section class="hero document-hero">
        <div>
          <p class="hero-kicker">${escapeHtml(document.type)}</p>
          <h1 class="hero-title">${escapeHtml(document.title)}</h1>
          <p class="hero-subtitle">${escapeHtml(document.summary)}</p>
          <dl class="download-meta document-hero-meta">
            <div><dt>Stand</dt><dd>${escapeHtml(document.stand)}</dd></div>
            <div><dt>Status</dt><dd>${document.isArchive ? "Archiv" : "Aktuelle Onlinefassung"}</dd></div>
            <div><dt>Autorin</dt><dd>Natalie Weber</dd></div>
          </dl>
          ${tagList(document.category)}
          <div class="hero-actions">
            ${document.pdfUrl ? `<a class="btn btn-primary" href="${escapeHtml(document.pdfUrl)}" target="_blank" rel="noopener">PDF herunterladen</a>` : ""}
            <a class="btn btn-secondary" href="/downloads.html">Zur Bibliothek</a>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="reading-layout">
          <aside class="toc-card">
            <details>
              <summary>Auf dieser Seite</summary>
              <nav aria-label="Inhaltsverzeichnis">
                <a href="#auf-einen-blick">Auf einen Blick</a>
                <a href="#online-text">Online-Text</a>
                <a href="#verknuepfungen">Verknüpfungen</a>
                <a href="#downloads">Downloads und Quellen</a>
              </nav>
            </details>
          </aside>
          <article class="reading-content">
            <section id="auf-einen-blick" class="summary-box">
              <p class="hero-kicker">Auf einen Blick</p>
              <h2>Worum geht es?</h2>
              <ul class="clean-list">${keyPoints}</ul>
            </section>

            <section id="online-text">
              <p class="hero-kicker">Online-Text</p>
              <h2>${escapeHtml(document.title)} verständlich eingeordnet</h2>
              ${documentOnlineText(document)}
              ${sourceLink}
            </section>

            <section id="verknuepfungen">
              <p class="hero-kicker">Passend dazu</p>
              <h2>Begriffe, Wirkungsfelder und Tools</h2>
              ${relationLinks(document)}
            </section>

            <section id="downloads" class="material-section">
              <p class="hero-kicker">Downloads und Quellen</p>
              <h2>Material herunterladen oder weiter lesen.</h2>
              <p>Diese Onlinefassung ist der öffentliche Einstieg. Die Downloadfassung steht ergänzend zur Verfügung.</p>
              ${documentActions(document, false)}
              <p class="card-text">Referenz: Wirkungsökonomie. Autorin: Natalie Weber. Stand: ${escapeHtml(document.stand)}.</p>
            </section>
          </article>
        </div>
      </section>
`;
  const outDir = path.join(libraryRoot, document.slug);
  ensureDir(outDir);
  fs.writeFileSync(
    path.join(outDir, "index.html"),
    pageShell({
      title: document.title,
      description: document.summary,
      canonicalPath: document.onlineUrl,
      main,
      extraHead: documentJsonLd(document),
    }),
  );
}

function buildLibraryIndex() {
  ensureDir(libraryRoot);
  fs.writeFileSync(
    path.join(libraryRoot, "index.html"),
    pageShell({
      title: "Bibliothek",
      description: "Zentrale Bibliothek der Wirkungsökonomie.",
      canonicalPath: "/bibliothek/",
      main: `<section class="hero"><div><p class="hero-kicker">Bibliothek</p><h1 class="hero-title">Alle Dokumente an einem Ort.</h1><p class="hero-subtitle">Die zentrale Übersicht liegt auf der Download- und Bibliotheksseite.</p><div class="hero-actions"><a class="btn btn-primary" href="/downloads.html">Zur Bibliothek</a></div></div></section>`,
    }),
  );
}

function scanPdfLinks() {
  const htmlFiles = [];
  const ignoreDirs = new Set([".git", "node_modules"]);
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ignoreDirs.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".html")) htmlFiles.push(full);
    }
  }
  walk(".");
  const links = new Map();
  for (const file of htmlFiles) {
    const text = fs.readFileSync(file, "utf8");
    for (const match of text.matchAll(/href=["']([^"']+\.pdf)["']/gi)) {
      const href = match[1].replace(/^https:\/\/wirkungsoekonomie\.de/, "");
      if (!links.has(href)) links.set(href, new Set());
      links.get(href).add(file.replace(/^\.\//, ""));
    }
  }
  return links;
}

function writeAudit() {
  const pdfFiles = fs
    .readdirSync("assets/pdf")
    .filter((file) => file.endsWith(".pdf"))
    .map((file) => `/assets/pdf/${file}`)
    .sort();
  const linkedPdfs = scanPdfLinks();
  const registryByPdf = new Map(publicDocuments.map((document) => [document.pdfUrl, document]));
  const missingFromRegistry = pdfFiles.filter((file) => !registryByPdf.has(file));
  const registryRows = publicDocuments
    .map((document) => {
      const pdfExists = document.pdfUrl ? fs.existsSync(document.pdfUrl.replace(/^\//, "")) : false;
      const onlineExists = document.onlineUrl ? fs.existsSync(path.join(document.onlineUrl.replace(/^\/|\/$/g, ""), "index.html")) : false;
      const linkedOnPages = document.pdfUrl && linkedPdfs.has(document.pdfUrl) ? linkedPdfs.get(document.pdfUrl).size : 0;
      const status = pdfExists && onlineExists ? "ok" : !onlineExists ? "fehlt online" : "fehlt PDF";
      return `| ${document.id} | ${document.title} | ${pdfExists ? "ja" : "nein"} | ${onlineExists ? "ja" : "nein"} | ja | ${linkedOnPages} | ${status} |`;
    })
    .join("\n");

  const packageCount = (() => {
    let count = 0;
    function walk(dir) {
      if (!fs.existsSync(dir)) return;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.(pdf|docx|zip)$/i.test(entry.name)) count += 1;
      }
    }
    walk("assets/downloads");
    return count;
  })();

  const audit = `# Document Registry Audit

Stand: ${new Date().toISOString().slice(0, 10)}

## Zusammenfassung

- PDFs in \`assets/pdf/\`: ${pdfFiles.length}
- Dokumente in der Registry: ${publicDocuments.length}
- Aktuelle Dokumente: ${currentDocuments.length}
- Archivdokumente: ${archiveDocuments.length}
- Dokumente mit Onlinefassung: ${publicDocuments.filter((document) => Boolean(document.onlineUrl)).length}
- Aktuelle PDF-only Dokumente: ${currentDocuments.filter((document) => !document.onlineUrl).length}
- Rang- und Paketdateien in \`assets/downloads/\`: ${packageCount}

Die Registry bündelt die öffentlichen Kernmaterialien aus \`assets/pdf/\`. Rangpakete, ZIPs und umfangreiche Arbeitsmaterialien bleiben in den bestehenden Downloadbereichen und werden als separater Paketbestand geführt.

## Registry-Prüfung

| id | Titel | PDF vorhanden | Onlinefassung vorhanden | Bibliothek | PDF auf Einzelseiten verlinkt | Status |
| --- | --- | --- | --- | --- | --- | --- |
${registryRows}

## PDFs ohne Registry-Eintrag

${missingFromRegistry.length ? missingFromRegistry.map((file) => `- ${file}`).join("\n") : "- Keine"}

## Hinweise

- Aktuelle Bibliothekskarten nutzen \`Onlinefassung lesen\` als Primäraktion.
- PDFs bleiben als sekundäre Downloadaktion erhalten.
- Archivmaterial ist für die öffentliche Kernbibliothek derzeit nicht als PDF-only markiert.
`;
  fs.writeFileSync(auditPath, audit);
}

buildLibraryIndex();
for (const document of publicDocuments) {
  buildDocumentPage(document);
}
buildDownloadsPage();
writeAudit();

console.log(`Document library built: ${publicDocuments.length} documents, ${currentDocuments.length} current, ${archiveDocuments.length} archive.`);
