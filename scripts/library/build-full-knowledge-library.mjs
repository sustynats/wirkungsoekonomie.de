import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const REGISTRY_PATH = path.join(ROOT, "assets/data/library-version-registry.json");
const BLOG_INDEX_PATH = path.join(ROOT, "assets/data/blog-index.json");
const PODCAST_INDEX_PATH = path.join(ROOT, "assets/data/podcast-index.json");
const GLOSSARY_INDEX_PATH = path.join(ROOT, "begriffe/index.html");
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
    Journalartikel: "Aktuelle Einordnungen, Kommentare und Leitartikel aus dem Journal.",
    Buch: "Vollständige Bücher, Handbücher und online lesbare Gesamtfassungen.",
    Grundlagenwerk: "Tragende Referenzen, Bücher und Systemdarstellungen.",
    Dossier: "Systematische Vertiefungen mit Kontext, Einordnung und Online-/PDF-Fassung.",
    Whitepaper: "Fachliche Einordnung mit Argumentations- und Methodenfokus.",
    Arbeitspapier: "Arbeits- und Diskussionsmaterial, oft mit Entwurfs- oder Vertiefungscharakter.",
    Gesetzesentwurf: "Rechtliche Entwürfe, Begründungen und regulatorische Arbeitsstände.",
    Beispiel: "Fallbeispiele, Rechenbeispiele und Anwendungsszenarien.",
    Methodik: "Bewertungslogik, Datenqualität, Register, Scorecards und Prüfpfade.",
    Leitbild: "Normative Orientierung und Schutzlinien.",
    Glossar: "Begriffe, Definitionen und semantische Infrastruktur.",
    Podcast: "Hörfolgen mit Player, Transkript, Glossarbegriffen und Anschlussseiten.",
    Präsentation: "Folien und Lern-/Vortragsmaterial."
  };
  return map[type] || "Dokumente und Onlinefassungen der Wirkungsökonomie.";
}

function formatCount(value) {
  return new Intl.NumberFormat("de-DE").format(value);
}

function glossaryTermCount() {
  if (fs.existsSync(GLOSSARY_INDEX_PATH)) {
    const glossaryHtml = fs.readFileSync(GLOSSARY_INDEX_PATH, "utf8");
    const renderedCards = (glossaryHtml.match(/data-glossary-card/g) || []).length;
    if (renderedCards > 0) return renderedCards;
  }
  return 0;
}

function formatDate(value = "") {
  if (!value) return "";
  const [year, month, day] = String(value).split("-");
  if (!year || !month || !day) return value;
  return `${day}.${month}.${year}`;
}

function normalizeSitePath(value = "") {
  return String(value).replace(/^\/+/, "");
}

function loadJournalArticles() {
  if (!fs.existsSync(BLOG_INDEX_PATH)) return [];
  const articles = JSON.parse(fs.readFileSync(BLOG_INDEX_PATH, "utf8"));
  return articles
    .filter((item) => item.status !== "draft" && item.url)
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
}

function journalToLibraryDoc(article) {
  const tags = article.tags || [];
  return {
    id: `journal-${slug(article.url || article.title)}`,
    title: article.title,
    shortDescription: article.excerpt || "Journalartikel der Wirkungsökonomie.",
    type: "Journalartikel",
    status: "aktuell",
    source: "Journal",
    formats: ["Online"],
    urls: {
      primary: normalizeSitePath(article.url),
    },
    topics: [...new Set([article.category, ...tags].filter(Boolean))],
    relatedMethods: tags.filter((tag) => /wirk|debatte|resonanz|agenda|frame|folge/i.test(tag)).slice(0, 4),
    relatedImpactFields: [article.category].filter(Boolean),
    isLeadingReference: false,
    journalDate: article.date || "",
    readingTime: article.readingTime || "",
  };
}

function loadPodcastEpisodes() {
  if (!fs.existsSync(PODCAST_INDEX_PATH)) return [];
  return JSON.parse(fs.readFileSync(PODCAST_INDEX_PATH, "utf8"))
    .filter((episode) => episode.status === "published" && episode.slug);
}

function podcastToLibraryDocs(episodes) {
  const publishedEpisodes = episodes.map((episode) => ({
    id: `podcast-${episode.id || episode.slug}`,
    title: `${episode.series || "Podcast"}: ${episode.title}`,
    shortDescription: episode.description || episode.subtitle || "Podcast-Folge der Wirkungsökonomie.",
    type: "Podcast",
    status: "aktuell",
    source: "Podcast",
    formats: ["Online", "Audio", "Transkript"],
    urls: {
      primary: `podcast/${episode.slug}/`,
    },
    topics: [...new Set([...(episode.keywords || []), "Podcast"].filter(Boolean))],
    relatedMethods: (episode.relatedTerms || []).map((term) => term.label).filter(Boolean).slice(0, 6),
    relatedImpactFields: ["Grundlagen & Orientierung"],
    isLeadingReference: false,
    journalDate: episode.publishedAt || "",
    readingTime: episode.duration || "",
  }));
  if (!publishedEpisodes.length) return [];
  return [
    {
      id: "podcast-der-neue-kompass",
      title: "Podcast - Der neue Kompass",
      shortDescription: "Podcast-Rubrik der Wirkungsökonomie mit Folgen, Player, Transkripten, Glossarbegriffen, Anschlussseiten und RSS-Feed.",
      type: "Podcast",
      status: "aktuell",
      source: "Podcast",
      formats: ["Online", "Audio", "RSS"],
      urls: {
        primary: "podcast/",
      },
      topics: ["Grundlagen & Orientierung", "Wirkungsökonomie einfach erklärt", "Podcast"],
      relatedMethods: ["Wirkung", "Positive Netto-Wirkung", "Wirkungsrückkopplung"],
      relatedImpactFields: ["Grundlagen & Orientierung"],
      isLeadingReference: false,
    },
    ...publishedEpisodes,
  ];
}

function journalCard(article) {
  const image = article.image ? `<a class="journal-library-image" href="${esc(siteHref(normalizeSitePath(article.url)))}"><img src="${esc(siteHref(normalizeSitePath(article.image)))}" alt="${esc(article.imageAlt || article.title)}" loading="lazy"></a>` : "";
  const meta = [article.category, formatDate(article.date), article.readingTime].filter(Boolean).join(" · ");
  return `<article class="journal-library-card">
      ${image}
      <div class="journal-library-card-body">
        <p class="card-kicker">${esc(meta || "Journal")}</p>
        <h3>${esc(article.title)}</h3>
        <p>${esc(article.excerpt || "")}</p>
        <a class="text-link" href="${esc(siteHref(normalizeSitePath(article.url)))}">Artikel lesen</a>
      </div>
    </article>`;
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
const journalArticles = loadJournalArticles();
const podcastEpisodes = loadPodcastEpisodes();
const rawDocuments = registry.documents.filter((doc) => doc.urls?.primary && isPublicLibraryFormat(doc.urls.primary));
const documents = mergeDocumentVariants([...rawDocuments, ...journalArticles.map(journalToLibraryDoc), ...podcastToLibraryDocs(podcastEpisodes)]);
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
const latestJournalCards = journalArticles.slice(0, 2).map(journalCard).join("\n");
const pathCards = registry.readingPaths.map((item) => `
  <article class="document-reading-path">
    <h3>${esc(item.title)}</h3>
    <p>${esc(item.summary)}</p>
    <ol>${item.links.map(([label, href]) => `<li><a href="${esc(siteHref(href))}">${esc(label)}</a></li>`).join("")}</ol>
  </article>`).join("\n");
const typeCards = [...typeValues].sort((a, b) => a.localeCompare(b, "de")).map((type) => {
  if (type === "Glossar") {
    const count = glossaryTermCount();
    const countLabel = count ? `${formatCount(count)} Begriffe` : "Glossar öffnen";
    return `<a class="library-type-card library-type-card--link" href="../begriffe/" aria-label="Glossar mit ${esc(countLabel)} öffnen"><strong>${esc(type)}</strong><span>${esc(countLabel)}</span><p>${esc(typeIntro(type))}</p></a>`;
  }
  const count = documents.filter((doc) => displayType(doc) === type).length;
  return `<article class="library-type-card"><strong>${esc(type)}</strong><span>${formatCount(count)} Einträge</span><p>${esc(typeIntro(type))}</p></article>`;
}).join("\n");
const quellenarchivCard = (() => {
  const snapshotPath = path.join(ROOT, "content/quellenarchiv/sources.json");
  let count = 0;
  try {
    if (fs.existsSync(snapshotPath)) {
      count = (JSON.parse(fs.readFileSync(snapshotPath, "utf8")).sources || []).length;
    }
  } catch { /* Snapshot fehlt beim Erstbuild – Karte ohne Zähler */ }
  const countLabel = count ? `${formatCount(count)} Quellen` : "Quellenarchiv öffnen";
  return `<a class="library-type-card library-type-card--link" href="../quellenarchiv/" aria-label="Quellenarchiv mit ${esc(countLabel)} öffnen"><strong>Quellenarchiv</strong><span>${esc(countLabel)}</span><p>Kuratierte, wirkungsökonomisch eingeordnete Quellen – gespiegelt aus dem Wirkungsinstitut, hier read-only.</p></a>`;
})();
const typeCardsWithArchive = `${quellenarchivCard}\n${typeCards}`;
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
    <link rel="stylesheet" href="../assets/css/style.css?v=20260612-mobile-table-fix">
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
      <section class="section section-muted" id="journal">
        <div class="section-header">
          <p class="hero-kicker">Journal</p>
          <h2>Aktuelle Einordnungen aus dem Journal</h2>
          <p>Das Journal gehört zur Bibliothek: Es ordnet neue Texte, Debatten und Veröffentlichungen ein und macht sichtbar, was zuletzt hinzugekommen ist.</p>
        </div>
        <div class="journal-library-grid">${latestJournalCards}</div>
        <div class="section-actions">
          <a class="btn btn-primary" href="../blog.html">Alle Journalartikel öffnen</a>
          <a class="btn btn-secondary" href="../updates/">RSS &amp; Updates</a>
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
        <div class="library-type-grid">${typeCardsWithArchive}</div>
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
    <script src="../assets/js/main.js?v=20260612-mobile-table-fix"></script>
    <script src="../assets/js/full-library.js?v=20260531-full-knowledge-library"></script>
  </body>
</html>`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html.replace(/[ \t]+$/gm, ""));
console.log(`Full knowledge library written: ${documents.length} entries -> bibliothek/index.html`);
