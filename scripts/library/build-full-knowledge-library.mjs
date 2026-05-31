import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const REGISTRY_PATH = path.join(ROOT, "assets/data/library-version-registry.json");
const OUT = path.join(ROOT, "bibliothek/index.html");

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function slug(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function siteHref(primary = "") {
  if (!primary) return "#";
  if (/^(https?:|mailto:|tel:)/.test(primary)) return primary;
  return `../${primary.replace(/^\/+/, "")}`;
}

function fileSize(relPath = "") {
  const abs = path.join(ROOT, relPath);
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) return "";
  const size = fs.statSync(abs).size;
  if (size > 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  if (size > 1024) return `${Math.round(size / 1024)} KB`;
  return `${size} B`;
}

function pdfPages(relPath = "") {
  const abs = path.join(ROOT, relPath);
  if (!fs.existsSync(abs) || path.extname(abs).toLowerCase() !== ".pdf") return "";
  try {
    const data = fs.readFileSync(abs, "latin1");
    const pages = (data.match(/\/Type\s*\/Page\b/g) || []).length;
    return pages ? String(pages) : "";
  } catch {
    return "";
  }
}

function officePages(relPath = "") {
  const abs = path.join(ROOT, relPath);
  const ext = path.extname(abs).toLowerCase();
  if (!fs.existsSync(abs) || ![".docx", ".pptx"].includes(ext)) return "";
  try {
    const xml = execFileSync("unzip", ["-p", abs, "docProps/app.xml"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    const tag = ext === ".pptx" ? "Slides" : "Pages";
    const match = xml.match(new RegExp(`<${tag}>(\\d+)</${tag}>`));
    return match?.[1] || "";
  } catch {
    return "";
  }
}

function extent(doc) {
  const primary = doc.urls?.sourcePath || doc.urls?.primary || "";
  const formats = doc.formats?.join(", ") || "Online";
  const pages = pdfPages(primary) || officePages(primary);
  const size = fileSize(primary);
  const bits = [];
  if (pages) bits.push(`${pages} Seiten`);
  bits.push(formats);
  if (size) bits.push(size);
  if (!pages && !size && doc.source === "online-version") bits.push("Onlinefassung");
  return bits.join(" · ");
}

function normalizedPairKey(value = "") {
  return slug(String(value)
    .replace(/\bPDF\b/gi, "")
    .replace(/\bOnlinefassung\b/gi, "")
    .replace(/\bOnline\b/gi, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim());
}

function actionLinks(doc, onlineByKey) {
  const primary = doc.urls?.primary || "";
  const sourcePath = doc.urls?.sourcePath || primary;
  const isPdf = /\.pdf$/i.test(primary);
  const isOnline = doc.source === "online-version" || /\.html$/i.test(primary) || /\/$/.test(primary);
  const links = [];
  const onlineMatch = !isOnline ? onlineByKey.get(normalizedPairKey(doc.title)) : "";
  if (isOnline) {
    links.push(`<a class="btn btn-secondary" href="${esc(siteHref(primary))}">Online lesen</a>`);
  } else if (isPdf) {
    links.push(`<a class="btn btn-secondary" href="${esc(siteHref(primary))}">PDF öffnen</a>`);
    if (onlineMatch) links.push(`<a class="btn btn-ghost" href="${esc(siteHref(onlineMatch))}">Online lesen</a>`);
  } else if (/\.(xlsx|csv|json)$/i.test(primary)) {
    links.push(`<a class="btn btn-secondary" href="${esc(siteHref(primary))}">Daten öffnen</a>`);
  } else if (/\.(pptx)$/i.test(primary)) {
    links.push(`<a class="btn btn-secondary" href="${esc(siteHref(primary))}">Präsentation öffnen</a>`);
  } else if (/\.(md)$/i.test(primary)) {
    links.push(`<a class="btn btn-secondary" href="${esc(siteHref(primary))}">Quelle lesen</a>`);
  } else if (/\.docx$/i.test(sourcePath)) {
    links.push(`<span class="btn btn-ghost" aria-disabled="true">PDF wird vorbereitet</span>`);
  } else {
    links.push(`<a class="btn btn-secondary" href="${esc(siteHref(primary))}">Eintrag öffnen</a>`);
  }
  return `<div class="document-action-row">${links.join("")}</div>`;
}

function optionList(values) {
  return [...values].sort((a, b) => a.localeCompare(b, "de")).map((value) => `<option value="${esc(value)}">${esc(value)}</option>`).join("");
}

function typeIntro(type) {
  const map = {
    Grundlagenwerk: "Tragende Referenzen, Bücher und Systemdarstellungen.",
    Whitepaper: "Fachliche Einordnung mit Argumentations- und Methodenfokus.",
    Arbeitspapier: "Arbeits- und Diskussionsmaterial, oft mit Entwurfs- oder Vertiefungscharakter.",
    Gesetzesentwurf: "Rechtliche Entwürfe, Begründungen und regulatorische Arbeitsstände.",
    Beispiel: "Fallbeispiele, Rechenbeispiele und Anwendungsszenarien.",
    Methodik: "Bewertungslogik, Datenqualität, Register, Scorecards und Prüfpfade.",
    Leitbild: "Normative Orientierung und Schutzlinien.",
    Glossar: "Begriffe, Definitionen und semantische Infrastruktur.",
    Präsentation: "Folien und Lern-/Vortragsmaterial."
  };
  return map[type] || "Dokumente und Onlinefassungen der Wirkungsökonomie.";
}

function card(doc, index, onlineByKey) {
  const primary = doc.urls?.primary || "";
  const topics = doc.topics || [];
  const methods = doc.relatedMethods || [];
  const fields = doc.relatedImpactFields || [];
  const searchable = [doc.title, doc.shortDescription, doc.type, doc.status, topics.join(" "), methods.join(" "), fields.join(" ")].join(" ");
  return `<article class="knowledge-library-card" data-library-card data-type="${esc(doc.type)}" data-status="${esc(doc.status)}" data-source="${esc(doc.source)}" data-query="${esc(searchable.toLowerCase())}" data-index="${index}">
      <div class="document-card-badges">
        <span class="status-badge status-badge--${slug(doc.type)}">${esc(doc.type)}</span>
        <span class="status-badge status-badge--${slug(doc.status)}">${esc(doc.status)}</span>
        ${doc.isLeadingReference ? '<span class="status-badge status-badge--fuhrend">führende Referenz</span>' : ""}
      </div>
      <h3>${esc(doc.title)}</h3>
      <p>${esc(doc.shortDescription || typeIntro(doc.type))}</p>
      <dl class="document-card-meta">
        <dt>Umfang</dt><dd>${esc(extent(doc) || "Umfang wird nachgetragen")}</dd>
        <dt>Themen</dt><dd>${esc(topics.slice(0, 4).join(", ") || "nicht verschlagwortet")}</dd>
      </dl>
      <div class="document-chip-row muted">${[...methods.slice(0, 3), ...fields.slice(0, 2)].map((item) => `<span>${esc(item)}</span>`).join("")}</div>
      ${actionLinks(doc, onlineByKey)}
    </article>`;
}

const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
const documents = registry.documents.filter((doc) => doc.urls?.primary && !/\.docx$/i.test(doc.urls?.primary || ""));
const typeValues = new Set(documents.map((doc) => doc.type).filter(Boolean));
const statusValues = new Set(documents.map((doc) => doc.status).filter(Boolean));
const sourceValues = new Set(documents.map((doc) => doc.source).filter(Boolean));
const onlineByKey = new Map();
for (const doc of documents) {
  const primary = doc.urls?.primary || "";
  if (doc.source === "online-version" || /\.html$/i.test(primary) || /\/$/.test(primary)) {
    const key = normalizedPairKey(doc.title);
    if (key && !onlineByKey.has(key)) onlineByKey.set(key, primary);
  }
}

const leadingCards = documents.filter((doc) => doc.isLeadingReference).slice(0, 12).map((doc, index) => card(doc, index, onlineByKey)).join("\n");
const pathCards = registry.readingPaths.map((item) => `
  <article class="document-reading-path">
    <h3>${esc(item.title)}</h3>
    <p>${esc(item.summary)}</p>
    <ol>${item.links.map(([label, href]) => `<li><a href="${esc(siteHref(href))}">${esc(label)}</a></li>`).join("")}</ol>
  </article>`).join("\n");
const typeCards = [...typeValues].sort((a, b) => a.localeCompare(b, "de")).map((type) => {
  const count = documents.filter((doc) => doc.type === type).length;
  return `<article class="library-type-card"><strong>${esc(type)}</strong><span>${count} Einträge</span><p>${esc(typeIntro(type))}</p></article>`;
}).join("\n");
const allCards = documents.map((doc, index) => card(doc, index, onlineByKey)).join("\n");

const html = `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Bibliothek | Vollständige Wissensbibliothek der Wirkungsökonomie</title>
    <meta name="description" content="Vollständige geführte Wissensbibliothek der Wirkungsökonomie mit Dokumentart, Status, Kurzbeschreibung, Umfang, Lesepfaden und Vollregister.">
    <meta name="search_title" content="Bibliothek | Vollständige Wissensbibliothek der Wirkungsökonomie">
    <meta name="search_description" content="Vollständige geführte Wissensbibliothek der Wirkungsökonomie mit Dokumentart, Status, Kurzbeschreibung, Umfang, Lesepfaden und Vollregister.">
    <meta name="search_section" content="Bibliothek">
    <meta name="search_type" content="Dokument">
    <link rel="stylesheet" href="../assets/css/style.css?v=20260531-full-knowledge-library">
  </head>
  <body>
    <header class="site-header" data-search-exclude>
      <a class="brand" href="../index.html" aria-label="Wirkungsökonomie Startseite">
        <span class="brand-mark"><img src="../assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span>
        <span class="brand-name">Wirkungsökonomie</span>
      </a>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav">
        <span class="nav-toggle-icon" aria-hidden="true">☰</span>
        <span class="sr-only">Menü</span>
      </button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation" data-search-exclude></nav>
    </header>
    <main data-pagefind-body>
      <section class="hero compact-hero document-library-hero">
        <p class="hero-kicker">Vollständige Wissensbibliothek</p>
        <h1>Alle Dokumente bleiben sichtbar</h1>
        <p class="hero-subtitle">Die Bibliothek ist keine Dateiablage: Vor dem Klick steht, ob du eine Kurzfassung, ein Manifest, ein Whitepaper, ein Working Paper, ein technisches Register, ein Fallbeispiel, ein Grundlagenwerk oder einen Gesetzesentwurf öffnest und welchen Status der Eintrag hat.</p>
        <div class="library-count-strip" aria-label="Bibliotheksumfang">
          <span><strong>${registry.counts.total}</strong> Einträge</span>
          <span><strong>${registry.counts.downloadFiles}</strong> Dateien</span>
          <span><strong>${registry.counts.onlineVersions}</strong> Onlinefassungen</span>
          <span><strong>${registry.counts.byStatus["führend"] || 0}</strong> führende Referenzen</span>
        </div>
      </section>
      <section class="section section-muted">
        <div class="section-header">
          <p class="hero-kicker">Lesepfade</p>
          <h2>Geführte Wege durch das Archiv</h2>
        </div>
        <div class="document-reading-path-grid">${pathCards}</div>
      </section>
      <section class="section">
        <div class="section-header">
          <p class="hero-kicker">Dokumentarten</p>
          <h2>Was öffne ich?</h2>
        </div>
        <div class="library-type-grid">${typeCards}</div>
      </section>
      <section class="section section-muted">
        <div class="section-header">
          <p class="hero-kicker">Führende Referenzen</p>
          <h2>Orientierung zuerst</h2>
        </div>
        <div class="knowledge-library-grid">${leadingCards}</div>
      </section>
      <section class="section document-library-section" id="vollregister">
        <div class="section-header">
          <p class="hero-kicker">Vollregister</p>
          <h2>Alle Bibliothekseinträge</h2>
        </div>
        <div class="document-filter-grid full-library-controls" data-search-exclude>
          <label>Suche<input type="search" data-library-search placeholder="Titel, Thema, Methode oder Beschreibung"></label>
          <label>Dokumentart<select data-library-filter="type"><option value="">Alle</option>${optionList(typeValues)}</select></label>
          <label>Status<select data-library-filter="status"><option value="">Alle</option>${optionList(statusValues)}</select></label>
          <label>Quelle<select data-library-filter="source"><option value="">Alle</option>${optionList(sourceValues)}</select></label>
        </div>
        <p class="library-result-count" data-library-count>${documents.length} Einträge sichtbar</p>
        <div class="knowledge-library-grid" data-library-results>${allCards}</div>
      </section>
    </main>
    <script src="../assets/js/main.js?v=20260531-full-knowledge-library"></script>
    <script src="../assets/js/full-library.js?v=20260531-full-knowledge-library"></script>
  </body>
</html>`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html);
console.log(`Full knowledge library written: ${documents.length} entries -> bibliothek/index.html`);
