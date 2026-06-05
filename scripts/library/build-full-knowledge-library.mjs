import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const REGISTRY_PATH = path.join(ROOT, "assets/data/library-version-registry.json");
const OUT = path.join(ROOT, "bibliothek/index.html");
const NON_PUBLIC_FILE_EXTENSIONS = new Set([".docx", ".md", ".zip"]);

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

function isPublicLibraryFormat(primary = "") {
  const ext = path.extname(primary.split(/[?#]/)[0]).toLowerCase();
  return !NON_PUBLIC_FILE_EXTENSIONS.has(ext);
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
  const formats = [...new Set(doc.formats || ["Online"])].join(", ");
  const publicFiles = doc.variants?.filter((variant) => /\.(pdf|pptx|xlsx|csv|json)$/i.test(variant.primary || "")) || [];
  const sizeSource = publicFiles.find((variant) => /\.pdf$/i.test(variant.primary || ""))?.sourcePath || primary;
  const pages = pdfPages(sizeSource) || pdfPages(primary) || officePages(primary);
  const size = fileSize(sizeSource) || fileSize(primary);
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
  const variants = doc.variants || [];
  const onlineVariant = variants.find((variant) => variant.kind === "online");
  const pdfVariant = variants.find((variant) => variant.kind === "pdf");
  const isPdf = /\.pdf$/i.test(primary);
  const isOnline = doc.source === "online-version" || /\.html$/i.test(primary) || /\/$/.test(primary);
  const links = [];
  if (onlineVariant) links.push(`<a class="btn btn-secondary" href="${esc(siteHref(onlineVariant.primary))}">Onlinefassung lesen</a>`);
  if (pdfVariant) links.push(`<a class="btn btn-primary" href="${esc(siteHref(pdfVariant.primary))}">PDF öffnen</a>`);
  if (links.length) return `<div class="document-action-row">${links.join("")}</div>`;
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
  } else if (/\.docx$/i.test(sourcePath)) {
    links.push(`<span class="btn btn-ghost" aria-disabled="true">PDF wird vorbereitet</span>`);
  } else if (!isPublicLibraryFormat(primary)) {
    links.push(`<span class="btn btn-ghost" aria-disabled="true">Onlinefassung wird vorbereitet</span>`);
  } else {
    links.push(`<a class="btn btn-secondary" href="${esc(siteHref(primary))}">Eintrag öffnen</a>`);
  }
  return `<div class="document-action-row">${links.join("")}</div>`;
}

function optionList(values) {
  return [...values].sort((a, b) => a.localeCompare(b, "de")).map((value) => `<option value="${esc(value)}">${esc(value)}</option>`).join("");
}

function isBookLike(doc) {
  const title = doc.title || "";
  const primary = doc.urls?.primary || "";
  const sourcePath = doc.urls?.sourcePath || "";
  if (/^Die neue Ordnung des Wohlstands(?:\s*\(PDF\))?$/i.test(title)) return true;
  if (/^Handbuch\b/i.test(title)) return true;
  if (doc.isLeadingReference && /buch\.html|^referenz\/?$/i.test(primary)) return true;
  if (/\/(?:handbuch|buch)[^/]*\.pdf$/i.test(sourcePath)) return true;
  return false;
}

function displayType(doc) {
  return isBookLike(doc) ? "Buch" : doc.type;
}

function typeIntro(type) {
  const map = {
    Buch: "Vollständige Bücher, Handbücher und online lesbare Gesamtfassungen.",
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
  const type = displayType(doc);
  const searchableTypes = type === doc.type ? [type] : [type, doc.type];
  const searchable = [doc.title, doc.shortDescription, ...searchableTypes, doc.status, topics.join(" "), methods.join(" "), fields.join(" ")].join(" ");
  return `<article class="knowledge-library-card" data-library-card data-type="${esc(type)}" data-status="${esc(doc.status)}" data-source="${esc(doc.source)}" data-query="${esc(searchable.toLowerCase())}" data-index="${index}">
      <div class="document-card-badges">
        <span class="status-badge status-badge--${slug(type)}">${esc(type)}</span>
        <span class="status-badge status-badge--${slug(doc.status)}">${esc(doc.status)}</span>
        ${doc.isLeadingReference ? '<span class="status-badge status-badge--fuhrend">führende Referenz</span>' : ""}
      </div>
      <h3>${esc(doc.title)}</h3>
      <p>${esc(doc.shortDescription || typeIntro(type))}</p>
      <dl class="document-card-meta">
        <dt>Umfang</dt><dd>${esc(extent(doc) || "Umfang wird nachgetragen")}</dd>
        <dt>Themen</dt><dd>${esc(topics.slice(0, 4).join(", ") || "nicht verschlagwortet")}</dd>
      </dl>
      <div class="document-chip-row muted">${[...methods.slice(0, 3), ...fields.slice(0, 2)].map((item) => `<span>${esc(item)}</span>`).join("")}</div>
      ${actionLinks(doc, onlineByKey)}
    </article>`;
}

function variantKind(doc) {
  const primary = doc.urls?.primary || "";
  if (doc.source === "online-version" || /\.html$/i.test(primary) || /\/$/.test(primary)) return "online";
  if (/\.pdf$/i.test(primary)) return "pdf";
  if (/\.(xlsx|csv|json)$/i.test(primary)) return "data";
  if (/\.pptx$/i.test(primary)) return "presentation";
  return "other";
}

function canonicalOnlinePrimary(doc, primary) {
  if (normalizedPairKey(doc.title) === "die-neue-ordnung-des-wohlstands" && primary === "buch.html") return "referenz/";
  return primary;
}

function mergeDocumentVariants(rawDocuments) {
  const byKey = new Map();
  for (const doc of rawDocuments) {
    const key = normalizedPairKey(doc.title);
    if (!key) continue;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(doc);
  }
  return [...byKey.values()].flatMap((group) => {
    const kinds = new Set(group.map((doc) => variantKind(doc)));
    const hasFormatPair = kinds.has("pdf") && kinds.has("online");
    if (group.length < 2 || !hasFormatPair) return group;
    const online = group.find((doc) => variantKind(doc) === "online");
    const leading = group.find((doc) => doc.isLeadingReference);
    const base = online || leading || group[0];
    const formats = [...new Set(group.flatMap((doc) => doc.formats || []))];
    const variants = group
      .map((doc) => ({
        kind: variantKind(doc),
        title: doc.title,
        primary: canonicalOnlinePrimary(doc, doc.urls?.primary || ""),
        sourcePath: doc.urls?.sourcePath || doc.urls?.primary || "",
        formats: doc.formats || [],
      }))
      .filter((variant, index, variants) => variant.primary && variants.findIndex((item) => item.kind === variant.kind && item.primary === variant.primary) === index);
    return {
      ...base,
      title: base.title.replace(/\s*\((?:PDF|HTML|Onlinefassung)\)\s*$/i, ""),
      shortDescription: base.shortDescription || group.find((doc) => doc.shortDescription)?.shortDescription || "",
      formats: formats.length ? formats : base.formats,
      variants,
      isLeadingReference: group.some((doc) => doc.isLeadingReference),
      topics: [...new Set(group.flatMap((doc) => doc.topics || []))],
      relatedMethods: [...new Set(group.flatMap((doc) => doc.relatedMethods || []))],
      relatedImpactFields: [...new Set(group.flatMap((doc) => doc.relatedImpactFields || []))],
    };
  });
}

const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
const rawDocuments = registry.documents.filter((doc) => doc.urls?.primary && isPublicLibraryFormat(doc.urls.primary));
const documents = mergeDocumentVariants(rawDocuments);
const typeValues = new Set(documents.map((doc) => displayType(doc)).filter(Boolean));
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
  const count = documents.filter((doc) => displayType(doc) === type).length;
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
    <link rel="stylesheet" href="../assets/css/style.css?v=20260605-wirkungsraum-stage4">
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
          <span><strong>${documents.length}</strong> Werke</span>
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
    <script src="../assets/js/main.js?v=20260605-wirkungsraum-stage4"></script>
    <script src="../assets/js/full-library.js?v=20260531-full-knowledge-library"></script>
  </body>
</html>`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html.replace(/[ \t]+$/gm, ""));
console.log(`Full knowledge library written: ${documents.length} entries -> bibliothek/index.html`);
