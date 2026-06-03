import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const LIVE_VERSION = "2026.2-live-reference";
const IMPORT_VERSION = "2026.1-import";
const SOURCE_VERSION = "2026.0";
const TERM_BASE = "WOeK_Begriffsleitfaden_fuehrend_v1.0.md";
const TERM_BASE_DATE = "2026-05-21";
const referenceReaderAssetVersion = "20260603-reference-reader-toc";

const navigation = JSON.parse(fs.readFileSync("assets/data/navigation.json", "utf8"));
const footerTemplate = fs.readFileSync("templates/footer.html", "utf8");
const headerTemplate = fs.readFileSync("templates/header.html", "utf8");
const changelog = fs.existsSync("public/data/live-reference-changelog.json")
  ? JSON.parse(fs.readFileSync("public/data/live-reference-changelog.json", "utf8"))
  : { changes: [] };
const glossary = fs.existsSync("public/data/glossary.terms.json")
  ? JSON.parse(fs.readFileSync("public/data/glossary.terms.json", "utf8")).terms || []
  : [];
const glossaryById = new Map(glossary.map((term) => [term.termId, term]));
const glossaryByLabel = new Map(glossary.map((term) => [String(term.canonicalLabel || "").toLowerCase(), term]));
const workpapers = fs.existsSync("public/data/workpaper-imports.json")
  ? JSON.parse(fs.readFileSync("public/data/workpaper-imports.json", "utf8")).documents || []
  : [];

const priorityChapters = new Set([
  10, 11, 12, 13, 16, 18, 21, 22,
  30, 31, 32, 33, 34, 35,
  36, 37, 38, 39, 40, 41,
  48, 49, 50, 51, 52, 53,
  56, 57, 58,
  101, 102, 103, 104, 105, 106,
]);

const clusterRules = [
  { key: "grundlagen", label: "Grundlagen", range: [1, 9] },
  { key: "begriffe", label: "Begriffe", range: [10, 23] },
  { key: "methodik", label: "Methodik", range: [30, 35] },
  { key: "recht-staat", label: "Recht/Staat", range: [36, 41] },
  { key: "unternehmen", label: "Unternehmen", range: [42, 47] },
  { key: "produkte", label: "Produkte", range: [48, 53] },
  { key: "arbeit-einkommen-rente", label: "Arbeit/Einkommen/Rente", range: [56, 58] },
  { key: "demokratie-medien", label: "Demokratie/Medien", range: [61, 79] },
  { key: "digitalisierung-ki", label: "Digitalisierung/KI", range: [80, 85] },
  { key: "internationales", label: "Internationales", range: [91, 96] },
  { key: "umsetzung", label: "Umsetzung", range: [97, 100] },
  { key: "kritik", label: "Kritik", range: [101, 106] },
];

const termByCluster = {
  grundlagen: ["Wirkung", "Wohlstand", "Nachhaltigkeit", "Wirkungsblindheit"],
  begriffe: ["Wirkung", "Wirkungspotenzial", "Wirkstoff", "Wirkungsarchitektur", "Wirkungsrisiko"],
  methodik: ["WÖk-ID", "Scorecard", "Reverse Merit Order", "NWI", "T-SROI"],
  "recht-staat": ["WStG", "WUStG", "Wirkungsrat", "Wirkungshaushalt", "Rechtsschutz"],
  unternehmen: ["Wirkungscontrolling", "Wirkungsdaten", "Lieferkette", "Transformation"],
  produkte: ["Produktwirkung", "FinalScore", "Digitaler Produktpass", "Ehrliche Preise"],
  "arbeit-einkommen-rente": ["Wirkungseinkommen", "Wirkungsdividende", "Wirkungsrente", "Maschinenleistung"],
  "demokratie-medien": ["Resonanzraum", "Wirkungspotenzial", "Wirkungswahrheit", "Diskursfähigkeit"],
  "digitalisierung-ki": ["Wirkungsdatenraum", "DPP", "KI-Governance", "Cyberresilienz"],
  internationales: ["Europa", "Lieferketten", "Wirkungsgovernance", "Multipolare Ordnung"],
  umsetzung: ["Piloträume", "Transformation", "Wirkungshaushalt", "Beschaffung"],
  kritik: ["Technokratie", "Wirkungssimulation", "Fehlbarkeit", "Gaming the System"],
};

const partTitleCorrections = {
  15: "Internationale Ordnung, Globalisierung und Geopolitik",
  17: "Kritik, Missverständnisse und ideologische Projektionen",
};

const partSlugCorrections = {
  15: "teil-15-internationale-ordnung-globalisierung-und-geopolitik",
  17: "teil-17-kritik-missverstaendnisse-und-ideologische-projektionen",
};

const chapterTitleCorrections = {
  17: "Wirkungsökonomie im Vergleich",
  96: "Wirkungsökonomie als weltfähige Ordnung",
  99: "Wirkungsökonomie im Alltag",
};

const chapterTermOverrides = {
  10: ["wirkung", "positive-wirkung", "negative-wirkung", "neutrale-wirkung", "wirkungsbewertung", "wirkungsempfaenger", "wirkungsraum"],
  11: ["wirkungspotenzial", "wirkungsrisiko", "resonanzraum", "wirkungspfad", "wirkmechanismus", "wirkung"],
  16: ["netto-wirkung", "positive-netto-wirkung", "transformationswirkung", "wirkungslenkung", "wirkungsarchitektur", "wirkungsdaten", "wirkungsrisiko"],
  31: ["woek-id", "wirkungsdaten", "sdg-plus", "nace", "esrs", "gri"],
  32: ["scorecard", "finalscore", "nwi", "benchmark", "netto-wirkung"],
  33: ["reverse-merit-order", "nichtkompensationsprinzip", "wirkungsgrenze", "netto-wirkung"],
  34: ["t-sroi", "nwi", "transformationswirkung"],
  35: ["digitaler-produktpass", "wirkungsdatenraum", "woek-id"],
  37: ["wstg", "wirkungssteuergesetz", "wirkungsrat", "positive-netto-wirkung", "nichtkompensationsprinzip"],
  38: ["finalscore", "nwi", "reverse-merit-order", "wirkungsumsatzsteuer"],
  40: ["wirkungsrat", "benchmark", "woek-id", "wirkungswahrheit"],
  52: ["wirkungspunkte", "social-credit", "positive-netto-wirkung", "wirkungsbewertung"],
  57: ["wirkungseinkommen", "positive-netto-wirkung", "social-credit"],
  103: ["social-credit", "wirkungswahrheit", "wirkungsrat", "wirkungsdatenraum"],
  105: ["wirkungslenkung", "positive-netto-wirkung", "wirkungsarchitektur"],
  106: ["wirkungswahrheit", "wirkungsrat", "wirkungsrisiko", "wirkungspotenzial"],
};

const relatedDocsByCluster = {
  methodik: ["WOeK_Master_Items_final_v1.2", "Whitepaper-T-SROI", "Technische Leitlinien WUStG"],
  "recht-staat": ["WStG_Oktober2025", "Wirkungsrat_Konzept", "Technische Leitlinien WUStG"],
  produkte: ["Beispiel_Apfel_Wirkungssteuer_Bonusregel", "WP_Produkte", "Wirkungsökonomie in der Lieferkette"],
  "arbeit-einkommen-rente": ["WP_Einkommen", "WP_Rente", "Wenn Maschinen arbeiten"],
  "digitalisierung-ki": ["WOeK_Master_Items_final_v1.2", "Systemmodell der Wirkungsökonomie"],
  begriffe: ["WOeK_Begriffsleitfaden_fuehrend_v1.0", "Systemmodell der Wirkungsökonomie"],
};

function esc(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripTags(value = "") {
  return value.replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanTitle(value = "") {
  return stripTags(value).replace(/\s+-\s+Wirkungsökonomie.*$/i, "").trim();
}

function cleanChapterTitle(number, value = "") {
  const corrected = chapterTitleCorrections[number];
  const base = cleanTitle(value)
    .replace(/^Kapitel\s+\d+\s*[-:]\s*/i, "")
    .replace(/^Kapitel\s+\d+\s+Kapitel\s+\d+\s*[-:]\s*/i, "")
    .trim();
  if (corrected) return corrected;
  return base || `Kapitel ${number}`;
}

function slugify(value = "") {
  return value.toLowerCase()
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function roman(number) {
  const map = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let rest = number;
  let out = "";
  for (const [value, numeral] of map) {
    while (rest >= value) {
      out += numeral;
      rest -= value;
    }
  }
  return out;
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${content.replace(/[ \t]+$/gm, "").replace(/\n+$/g, "")}\n`);
}

function internalReferenceRedirectHtml(title, destination = "../") {
  const safeTitle = esc(title);
  const safeDestination = esc(destination);
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <meta http-equiv="refresh" content="0; url=${safeDestination}">
    <link rel="canonical" href="${safeDestination}">
    <title>${safeTitle} - nicht öffentlich gelistet</title>
    <script>window.location.replace("${safeDestination}");</script>
  </head>
  <body>
    <main>
      <h1>${safeTitle}</h1>
      <p>Diese interne Versions-/Exportseite wird nicht öffentlich ausgespielt.</p>
      <p><a href="${safeDestination}">Zur öffentlichen Referenz</a></p>
    </main>
  </body>
</html>`;
}

function baseFor(file) {
  const relativeParent = path.relative(ROOT, path.dirname(path.resolve(ROOT, file)));
  if (!relativeParent || relativeParent === ".") return "";
  return "../".repeat(relativeParent.split(path.sep).length);
}

function navMatch(item) {
  return (item.match || []).join("|");
}

function navLink(item, base) {
  return `<a href="${base}${esc(item.href)}" data-nav-match="${esc(navMatch(item))}">${esc(item.label)}</a>`;
}

function footerGroup(group, base) {
  return `<div class="footer-nav-group">
      <h3>${esc(group.title)}</h3>
      <div class="footer-nav-links">
${group.items.map((item) => `          ${navLink(item, base)}`).join("\n")}
      </div>
    </div>`;
}

function renderHeader(base) {
  const headerNav = navigation.header.map((item) => navLink(item, base)).join("\n    ");
  return headerTemplate
    .replaceAll("{{BASE}}", base)
    .replace("{{HEADER_NAV}}", headerNav);
}

function renderFooter(base) {
  const footerNav = navigation.footerGroups.map((group) => footerGroup(group, base)).join("\n    ");
  const footerLegal = (navigation.footerLegal || []).map((item) => navLink(item, base)).join("\n");
  return footerTemplate
    .replaceAll("{{BASE}}", base)
    .replace("{{FOOTER_NAV}}", footerNav)
    .replace("{{FOOTER_LEGAL_NAV}}", footerLegal);
}

function scriptsFor(base) {
  return `<script src="${base}assets/js/main.js?v=20260523-reference-ux"></script>
    <script src="${base}assets/js/reference-reader.js?v=${referenceReaderAssetVersion}"></script>`;
}

function page(file, { title, description, section = "Hauptwerk", type = "Live-Referenz", body, bodyClass = "" }) {
  const base = baseFor(file);
  return `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)} - Wirkungsökonomie</title>
    <meta name="description" content="${esc(description)}">
    <meta name="search_title" content="${esc(title)}">
    <meta name="search_description" content="${esc(description)}">
    <meta name="search_section" content="${esc(section)}">
    <meta name="search_type" content="${esc(type)}">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=${referenceReaderAssetVersion}">
  </head>
  <body class="${bodyClass}">
${renderHeader(base)}
${body}
${renderFooter(base)}
    ${scriptsFor(base)}
  </body>
</html>`;
}

function clusterFor(number) {
  return clusterRules.find((rule) => number >= rule.range[0] && number <= rule.range[1]) || { key: "sonstige", label: "Weitere Kapitel" };
}

function readingTime(text) {
  const words = stripTags(text).split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.ceil(words / 260));
}

function extractSections(html) {
  return [...html.matchAll(/<h3\b([^>]*)>(.*?)<\/h3>/gis)]
    .map((match) => ({
      id: (match[1].match(/\sid=["']([^"']+)["']/i) || [])[1] || "",
      title: cleanTitle(match[2]),
    }))
    .filter((item) => item.id && item.title)
    .slice(0, 12);
}

function collectParts() {
  const dirs = fs.readdirSync("referenz", { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("teil-"))
    .map((entry) => entry.name)
    .sort((a, b) => {
      const aNumber = Number(a.match(/^teil-(\d+)/)?.[1] || 0);
      const bNumber = Number(b.match(/^teil-(\d+)/)?.[1] || 0);
      if (aNumber === bNumber) {
        if (a === partSlugCorrections[aNumber]) return 1;
        if (b === partSlugCorrections[bNumber]) return -1;
      }
      return a.localeCompare(b);
    });
  const seen = new Set();
  const parts = [];
  for (const dir of dirs) {
    const file = `referenz/${dir}/index.html`;
    const html = read(file);
    const number = Number(dir.match(/^teil-(\d+)/)?.[1] || 0);
    if (!number || seen.has(number)) continue;
    seen.add(number);
    const rawTitle = cleanTitle(html.match(/<h1[^>]*>(.*?)<\/h1>/is)?.[1] || `Teil ${roman(number)}`);
    const title = partTitleCorrections[number] || rawTitle;
    const slug = partSlugCorrections[number] || dir;
    const chapterSlugs = [...html.matchAll(/href=["']\.\.\/(kapitel-[^/"']+)\/["']/g)].map((m) => m[1]);
    parts.push({ number, roman: roman(number), title, slug, legacySlug: dir, route: `/referenz/${slug}/`, chapterSlugs });
  }
  return parts.sort((a, b) => a.number - b.number);
}

function collectChapters(parts) {
  const partByChapterSlug = new Map();
  for (const part of parts) {
    for (const slug of part.chapterSlugs) partByChapterSlug.set(slug, part);
  }
  return fs.readdirSync("referenz", { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("kapitel-"))
    .map((entry) => {
      const file = `referenz/${entry.name}/index.html`;
      const html = read(file);
      const h1 = cleanTitle(html.match(/<h1[^>]*>(.*?)<\/h1>/is)?.[1] || entry.name);
      const number = Number(entry.name.match(/^kapitel-(\d+)/)?.[1] || h1.match(/Kapitel\s+(\d+)/)?.[1] || 0);
      const title = cleanChapterTitle(number, h1);
      const cluster = clusterFor(number);
      const part = partByChapterSlug.get(entry.name) || null;
      const reviewStatus = stripTags(html.match(/<dt>Reviewstatus<\/dt><dd>(.*?)<\/dd>/i)?.[1] || "partially-delta-reviewed");
      const terms = (chapterTermOverrides[number] || (termByCluster[cluster.key] || ["Wirkung", "Mensch, Planet und Demokratie"]))
        .map((termIdOrLabel) => glossaryById.get(termIdOrLabel)?.canonicalLabel || termIdOrLabel);
      return {
        number,
        title,
        slug: entry.name,
        file,
        route: `/referenz/${entry.name}/`,
        part,
        cluster,
        reviewStatus,
        terms,
        sections: extractSections(html),
        minutes: readingTime(html),
        priority: priorityChapters.has(number),
      };
    })
    .sort((a, b) => a.number - b.number);
}

function statusBadges(reviewStatus = "partially-delta-reviewed") {
  return `<div class="version-ribbon" aria-label="Versionen">
      <span>Originalfassung ${SOURCE_VERSION}</span>
      <span>Import-Version ${IMPORT_VERSION}</span>
      <span>Online-Referenz ${LIVE_VERSION}</span>
      <strong>${esc(reviewStatusLabel(reviewStatus))}</strong>
    </div>`;
}

function reviewStatusLabel(status = "") {
  const normalized = String(status).trim().toLowerCase();
  if (normalized === "delta-reviewed") return "fachlich geprüft";
  if (normalized === "partially-delta-reviewed") return "erste Online-Prüfung";
  if (normalized === "needs-human-review") return "redaktionelle Prüfung offen";
  if (normalized === "source-only") return "Originalfassung";
  if (normalized === "partially-reviewed") return "teilweise geprüft";
  if (normalized === "reviewed") return "geprüft";
  return status || "erste Online-Prüfung";
}

function versionStatusBox(html) {
  return html.replace(/<section class="meta-box">\s*<h2>Version und Reviewstatus<\/h2>\s*<dl>([\s\S]*?)<\/dl>([\s\S]*?)<\/section>/g, (match, dl, trailingContent) => {
    const value = (label, fallback = "") => stripTags(dl.match(new RegExp(`<dt>${label}<\\/dt><dd>(.*?)<\\/dd>`, "i"))?.[1] || fallback).trim();
    const reviewStatus = value("Reviewstatus", "partially-delta-reviewed");
    const sourceVersion = value("Source-Version", SOURCE_VERSION);
    const importVersion = value("Import-Version", IMPORT_VERSION);
    const liveVersion = value("Live-Reference-Version", value("Web-Version", LIVE_VERSION));
    const terminologyBase = value("Terminologiebasis", "WOeK_Begriffsleitfaden_fuehrend_v1.0.md");
    const terminologyDate = value("Terminologiebasis-Stand", "2026-05-21");
    const documentId = value("Dokument-ID", "woek-main-2026");
    const sourceHash = value("Source-Hash", "");
    const statusText = reviewStatusLabel(reviewStatus);
    const note = trailingContent.trim();
    return `<section class="meta-box version-summary">
      <h2>Stand dieser Onlinefassung</h2>
      <p>Diese Seite ist Teil der lebenden Online-Referenz. Der Text basiert auf der zitierfähigen Originalfassung und wurde für die Webfassung strukturiert, verlinkt und gegen den aktuellen Begriffsstand eingeordnet.</p>
      <div class="version-summary-grid" aria-label="Versionsinformationen">
        <div><span>Original</span><strong>${esc(sourceVersion)}</strong><small>bleibt zitierfähig</small></div>
        <div><span>Onlinefassung</span><strong>${esc(liveVersion)}</strong><small>lesbar, verlinkt, versioniert</small></div>
        <div><span>Prüfstand</span><strong>${esc(statusText)}</strong><small>weitere Delta-Reviews laufen</small></div>
      </div>
      ${note ? `<div class="version-summary-note">${note}</div>` : ""}
      <details class="technical-meta">
        <summary>Technische Versionsdaten anzeigen</summary>
        <dl>
          <dt>Dokument-ID</dt><dd>${esc(documentId)}</dd>
          <dt>Import-Version</dt><dd>${esc(importVersion)}</dd>
          <dt>Terminologiebasis</dt><dd>${esc(terminologyBase)}</dd>
          <dt>Terminologiebasis-Stand</dt><dd>${esc(terminologyDate)}</dd>
          ${sourceHash ? `<dt>Source-Hash</dt><dd>${esc(sourceHash)}</dd>` : ""}
        </dl>
      </details>
    </section>`;
  });
}

function pillList(items, className = "reference-pill-list") {
  return `<ul class="${className}">${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
}

function termFor(item) {
  const normalized = String(item || "").toLowerCase();
  return glossaryById.get(normalized) || glossaryByLabel.get(normalized) || null;
}

function termLink(item, prefix = "../../") {
  const term = termFor(item);
  if (!term) return `<span>${esc(item)}</span>`;
  return `<a class="glossary-term" href="${prefix}begriffe/${esc(term.slug)}/" data-glossary-key="${esc(term.termId)}" data-glossary-label="${esc(term.canonicalLabel)}" data-glossary-definition="${esc(term.hoverDefinition)}" data-glossary-url="${prefix}begriffe/${esc(term.slug)}/">${esc(term.canonicalLabel)}</a>`;
}

function termPillList(items, prefix = "../../", className = "reference-pill-list") {
  return `<ul class="${className}">${items.map((item) => `<li>${termLink(item, prefix)}</li>`).join("")}</ul>`;
}

function chapterCard(chapter, relativePrefix = "") {
  const href = `${relativePrefix}${chapter.slug}/`;
  return `<article class="chapter-card" data-cluster="${chapter.cluster.key}" data-title="${esc(`${chapter.number} ${chapter.title}`.toLowerCase())}">
      <a class="chapter-card-main" href="${href}">
        <span class="chapter-number">Kapitel ${chapter.number}</span>
        <h3>${esc(chapter.title)}</h3>
        <p>${esc(chapter.part?.title || "Hauptwerk")} · ${chapter.minutes} Min. Lesedauer</p>
      </a>
      <div class="chapter-card-meta">
        <span>${esc(chapter.cluster.label)}</span>
        <span>${chapter.priority ? "UX-priorisiert" : "strukturiert"}</span>
        <span>${esc(reviewStatusLabel(chapter.reviewStatus))}</span>
      </div>
      ${termPillList(chapter.terms.slice(0, 4), relativePrefix ? "../../" : "../")}
    </article>`;
}

function chapterFilters() {
  return `<div class="reference-filterbar" data-reference-filterbar>
      <label>
        <span class="sr-only">Kapitel filtern</span>
        <input type="search" placeholder="Kapitel filtern: Wirkung, T-SROI, Apfel..." data-chapter-query>
      </label>
      <div class="filter-chip-row" aria-label="Kapitelbereiche">
        <button type="button" class="active" data-chapter-filter="all">Alle</button>
        ${clusterRules.map((rule) => `<button type="button" data-chapter-filter="${rule.key}">${esc(rule.label)}</button>`).join("")}
      </div>
      <p class="reference-filter-status" data-chapter-filter-status></p>
    </div>`;
}

function portalHtml(chapters, parts) {
  const totalMinutes = chapters.reduce((sum, chapter) => sum + chapter.minutes, 0);
  const latestChanges = changelog.changes.slice(0, 5);
  return `<main class="reference-portal" data-pagefind-body>
    <section class="reference-hero" data-no-glossary>
      <div class="reference-hero-copy">
        <p class="hero-kicker">Wirkungsökonomie Online</p>
        <h1>Die neue Ordnung des Wohlstands</h1>
        <p class="hero-subtitle">Lebende Online-Referenz der Wirkungsökonomie.</p>
        <p>Diese Onlinefassung enthält den vollständigen Inhalt des Grundlagenwerks und wird als lebende Referenz versioniert fortgeführt: mit Originalfassung, Importstand, Delta-Review, Glossar, Quellen, Arbeitspapieren und Exportpfaden.</p>
        ${statusBadges("partially-delta-reviewed")}
        <div class="hero-actions reference-actions">
          <a class="btn btn-primary" href="lesen/">Werk lesen</a>
          <a class="btn btn-secondary" href="kapitel/">Kapitel erkunden</a>
          <a class="btn btn-secondary" href="../begriffe/">Begriffe nachschlagen</a>
          <a class="btn btn-secondary" href="../dokumente/">Arbeitspapiere öffnen</a>
          <a class="btn btn-secondary" href="quellen/">Quellen prüfen</a>
          <a class="btn btn-secondary" href="export/">Stand exportieren</a>
        </div>
      </div>
      <aside class="reference-hero-panel" aria-label="Referenzstatus">
        <strong>${chapters.length} Kapitel</strong>
        <span>${parts.length} Teile</span>
        <span>${Math.round(totalMinutes / 60)} Stunden geschätzte Lesezeit</span>
        <span>70 Abbildungen · 30 Tabellen · vollständiger Volltext</span>
      </aside>
    </section>
    ${terminologyNotice()}

    <section class="reference-section">
      <div class="section-header">
        <p class="hero-kicker">Einstieg</p>
        <h2>Sechs Wege in die Referenz</h2>
      </div>
      <div class="reference-card-grid six">
        ${[
          ["In 10 Minuten verstehen", "Ein kurzer geführter Einstieg in These, Modell und Navigationslogik.", "lesen/#kurzpfad"],
          ["Vollständiges Werk lesen", "Die lange Volltextansicht bleibt als vollständige Source-Lesefassung erhalten.", "volltext/"],
          ["Nach Kapiteln navigieren", "Alle Kapitel 1 bis 108 mit Filtern, Status und zentralen Begriffen.", "kapitel/"],
          ["Begriffe & Glossar", "Die führende Begriffsschicht mit Hovers, Synonymen und Crosslinks.", "../begriffe/"],
          ["Instrumente & Gesetze", "WStG, WUStG, WÖk-ID, Scorecards, Wirkungsrat, T-SROI und DPP.", "../dokumente/"],
          ["Beispiele & Arbeitspapiere", "Apfel, Lieferkette, Produkte, Rente, Einkommen und Systemmodell.", "../dokumente/"],
        ].map(([title, text, href]) => `<a class="reference-entry-card" href="${href}"><h3>${title}</h3><p>${text}</p></a>`).join("")}
      </div>
    </section>

    <section class="reference-section" id="teile">
      <div class="section-header">
        <p class="hero-kicker">Atlas</p>
        <h2>Teil I bis XVIII</h2>
        <p>Die Buchstruktur wird als Wirkungsökonomie-Atlas lesbar: von der Maßstabskrise über Begriffe, Daten, Recht, Märkte und Gesellschaft bis zu Umsetzung und Fehlbarkeit.</p>
      </div>
      <div class="part-card-grid">
        ${parts.map((part) => `<a class="part-card" href="${part.slug}/"><span>Teil ${part.roman}</span><h3>${esc(part.title.replace(/^Teil\s+[IVXLCDM]+\s*[-:]\s*/i, ""))}</h3><p>${part.chapterSlugs.length} Kapitel</p></a>`).join("")}
      </div>
    </section>

    <section class="reference-section" id="kapitel">
      <div class="section-header">
        <p class="hero-kicker">Navigator</p>
        <h2>Kapitel 1 bis 108</h2>
        <p>Direkte Kapitelrouten ersetzen Scroll-Zwang. Priorisierte Kapitel tragen Live-Reference-Addenda, Kontextpanel und Abschnitts-IDs.</p>
      </div>
      ${chapterFilters()}
      <div class="chapter-card-grid" data-chapter-grid>
        ${chapters.map((chapter) => chapterCard(chapter)).join("")}
      </div>
    </section>

    <section class="reference-section reference-split">
      <div>
        <p class="hero-kicker">Live-Reference</p>
        <h2>Aktuelle Aktualisierungen</h2>
        <div class="update-list">
          ${latestChanges.map((change) => `<article><span>${esc(change.changeId)}</span><h3>${esc(change.type)}</h3><p>${esc(change.reason)}</p><a href="versionen/">Versionen ansehen</a></article>`).join("")}
        </div>
      </div>
      <aside class="reference-emphasis">
        <p class="hero-kicker">Wichtige neue Begriffe</p>
        ${pillList(["Wirkstoff", "Wirkungspotenzial", "positive Netto-Wirkung", "Wirkungsarchitektur", "Wirkungsgrenze", "interdependente Netto-Wirkung", "Wirkungsrückkopplung"])}
        <a class="text-link" href="../begriffe/">Zum Glossar</a>
      </aside>
    </section>
  </main>`;
}

function chapterIndexHtml(chapters) {
  return `<main class="reference-portal" data-pagefind-body>
    <section class="reference-hero compact-reference-hero">
      <div>
        <nav class="breadcrumb"><a href="../">Referenz</a> / Kapitel</nav>
        <p class="hero-kicker">Kapitel-Navigator</p>
        <h1>Kapitel 1 bis 108</h1>
        <p class="hero-subtitle">Alle Kapitel als direkt verlinkbare Referenzkarten mit Themenfilter, Status und Lesedauer.</p>
        ${statusBadges("partially-delta-reviewed")}
      </div>
    </section>
    ${terminologyNotice()}
    <section class="reference-section">
      ${chapterFilters()}
      <div class="chapter-card-grid" data-chapter-grid>
        ${chapters.map((chapter) => chapterCard(chapter, "../")).join("")}
      </div>
    </section>
  </main>`;
}

function partsIndexHtml(parts) {
  return `<main class="reference-portal" data-pagefind-body>
    <section class="reference-hero compact-reference-hero">
      <div>
        <nav class="breadcrumb"><a href="../">Referenz</a> / Teile</nav>
        <p class="hero-kicker">Teil-Navigator</p>
        <h1>Teil I bis XVIII</h1>
        <p class="hero-subtitle">Die Architektur des Grundlagenwerks als Atlas der Wirkungsökonomie.</p>
      </div>
    </section>
    ${terminologyNotice()}
    <section class="reference-section">
      <div class="part-card-grid">
        ${parts.map((part) => `<a class="part-card" href="../${part.slug}/"><span>Teil ${part.roman}</span><h3>${esc(part.title.replace(/^Teil\s+[IVXLCDM]+\s*[-:]\s*/i, ""))}</h3><p>${part.chapterSlugs.length} Kapitel</p></a>`).join("")}
      </div>
    </section>
  </main>`;
}

function guidedReadingHtml(chapters) {
  const path = [1, 6, 10, 11, 16, 23, 31, 33, 34, 37, 38, 51, 57, 58, 85, 104, 106]
    .map((number) => chapters.find((chapter) => chapter.number === number))
    .filter(Boolean);
  return `<main class="reference-portal" data-pagefind-body>
    <section class="reference-hero compact-reference-hero">
      <div>
        <nav class="breadcrumb"><a href="../">Referenz</a> / Lesen</nav>
        <p class="hero-kicker">Geführter Buchmodus</p>
        <h1>Das Werk lesen</h1>
        <p class="hero-subtitle">Ein ruhiger Einstieg in das Grundlagenwerk mit Kurzpfad, Volltext und priorisierten Lesestrecken.</p>
      </div>
    </section>
    <section class="reference-section" id="kurzpfad">
      <div class="section-header">
        <p class="hero-kicker">In 10 Minuten verstehen</p>
        <h2>Die kürzeste sinnvolle Lesestrecke</h2>
        <p>Diese Route führt durch These, Begriffe, Messlogik, Institutionen, Beispiele und Fehlbarkeit. Sie ersetzt nicht den Volltext, sondern öffnet ihn.</p>
      </div>
      <div class="reading-path">
        ${path.map((chapter, index) => `<a href="../${chapter.slug}/"><span>${String(index + 1).padStart(2, "0")}</span><strong>Kapitel ${chapter.number}</strong><em>${esc(chapter.title)}</em></a>`).join("")}
      </div>
    </section>
    <section class="reference-section reference-split">
      <div>
        <h2>Volltext oder Kapitelmodus?</h2>
        <p>Die Volltextfassung bleibt für Suche, Prüfung und kontinuierliches Lesen erhalten. Für Arbeit, Zitation und Diskussion ist der Kapitelmodus die führende UX.</p>
      </div>
      <aside class="reference-emphasis">
        <a class="btn btn-primary" href="../volltext/">Volltext öffnen</a>
        <a class="btn btn-secondary" href="../kapitel/">Kapitel-Navigator öffnen</a>
      </aside>
    </section>
  </main>`;
}

function sourcesHtml(chapters) {
  const sourceMap = new Map();
  function sourceCategory(id, text) {
    if (id.startsWith("I-")) return "WÖk-interne Quelle";
    const normalized = text.toLowerCase();
    if (/\b(csrd|esrs|gri|nace|taxonomie|taxonomy|produktpass|dpp|verordnung|richtlinie|standard|iso|eu)\b/i.test(normalized)) return "Daten-/Standardquelle";
    if (/\b(working paper|whitepaper|wirkungsökonomie|wök|hauptwerk|manifest|leitfaden)\b/i.test(normalized)) return "Historische Quelle";
    return "Anschlussquelle";
  }
  for (const chapter of chapters) {
    const html = read(chapter.file);
    for (const paragraph of html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)) {
      const text = stripTags(paragraph[1]);
      const match = text.match(/^\[((?:I|E)-K\d{1,3}-\d+)\]\s*(.*)$/);
      if (!match) continue;
      const id = match[1];
      let sourceText = match[2].trim();
      if (!sourceText || sourceText === "." || sourceText.startsWith("[I-") || sourceText.startsWith("[E-")) {
        sourceText = "Quelle im Kapitelquellenblock des Hauptwerks. Die Originalformulierung bleibt im Kapitel erhalten.";
      }
      if (!sourceMap.has(id)) {
        const category = sourceCategory(id, sourceText);
        sourceMap.set(id, {
          id,
          type: id.startsWith("I-") ? "Interne Quelle" : "Externe Quelle",
          category,
          text: sourceText.slice(0, 420),
          chapter,
        });
      }
    }
  }
  return `<main class="reference-portal" data-pagefind-body>
    <section class="reference-hero compact-reference-hero">
      <div>
        <nav class="breadcrumb"><a href="../">Referenz</a> / Quellen</nav>
        <p class="hero-kicker">Quellenregister</p>
        <h1>Quellen und Backlinks</h1>
        <p class="hero-subtitle">Interne und externe Quellen werden als Karten sichtbar gemacht. Roh-URLs bleiben im Original erhalten; im Reader erscheinen Quellen-IDs als Chips.</p>
        <p class="notice">Quellenkategorien ordnen Lesbarkeit, nicht Beweiskraft: Kernquelle, Anschlussquelle, WÖk-interne Quelle, Daten-/Standardquelle und historische Quelle bleiben unterscheidbar. Interne Quellen dokumentieren Projektentwicklung und ersetzen keine externen Belege.</p>
        <p class="notice">Interne Quellen dokumentieren die Entwicklung der Wirkungsökonomie. Externe Quellen belegen Anschlussfähigkeit, Standards, Daten oder regulatorische Rahmen. Einige Quellen und Rechtsfragen bleiben für spätere Prüfungen markiert. Die finale Quellenfassung liegt als Dokumentation unter <code>docs/release/WOeK_v1.1_Quellenregister_final.md</code>.</p>
      </div>
    </section>
    <section class="reference-section">
      <div class="source-card-grid">
        ${[...sourceMap.values()].map((source) => `<article class="source-card" id="${slugify(source.id)}">
          <span>${esc(source.category)} · ${esc(source.type)}</span>
          <h2>${esc(source.id)}</h2>
          <p>${esc(source.text || "Quelle im Kapitelquellenblock des Hauptwerks.")}</p>
          <a href="../${source.chapter.slug}/#woek-main-2026-k${String(source.chapter.number).padStart(3, "0")}">Verwendet in Kapitel ${source.chapter.number}</a>
        </article>`).join("")}
      </div>
    </section>
  </main>`;
}

function glossaryHtml() {
  return `<main class="reference-portal" data-pagefind-body>
    <section class="reference-hero compact-reference-hero">
      <div>
        <nav class="breadcrumb"><a href="../">Referenz</a> / Glossar</nav>
        <p class="hero-kicker">Begriffsschicht</p>
        <h1>Glossar und Hoverdefinitionen</h1>
        <p class="hero-subtitle">Das Glossar ist die führende Begriffsschicht der Online-Referenz. Die bestehenden Begriffseiten, Hovers, Synonyme und Crosslinks bleiben zentral unter /begriffe/ gepflegt und werden hier als Referenzmodus eingebunden.</p>
        <p class="notice">Die Begriffe folgen dem Führenden Begriffsleitfaden der Wirkungsökonomie, Version 1.0, Stand 21. Mai 2026. Ältere Projektdateien können frühere Begriffsverwendungen enthalten.</p>
        <div class="hero-actions reference-actions">
          <a class="btn btn-primary" href="../../begriffe/">Alphabetisches Glossar öffnen</a>
          <a class="btn btn-secondary" href="../../glossar.html">Klassisches Glossar öffnen</a>
          <a class="btn btn-secondary" href="../kapitel/">Kapitel mit Begriffen erkunden</a>
        </div>
      </div>
    </section>
    <section class="reference-section reference-split">
      <div>
        <h2>Führende Begriffe</h2>
        ${pillList(["Wirkung", "Wirkungspotenzial", "Wirkstoff", "positive Netto-Wirkung", "Wirkungsarchitektur", "Reverse Merit Order", "WÖk-ID", "T-SROI", "Wirkungsrückkopplung"])}
      </div>
      <aside class="reference-emphasis">
        <p>Hoverdefinitionen und Crosslinks werden aus der zentralen Glossarstruktur erzeugt. Ältere Dokumente können frühere Begriffsstände enthalten und bleiben als Originalfassung sichtbar.</p>
      </aside>
    </section>
  </main>`;
}

function versionsHtml() {
  return `<main class="reference-portal" data-pagefind-body>
    <section class="reference-hero compact-reference-hero">
      <div>
        <nav class="breadcrumb"><a href="../">Referenz</a> / Versionen</nav>
        <p class="hero-kicker">Versionierung</p>
        <h1>Originalfassung, Import und Live-Referenz</h1>
        <p class="hero-subtitle">Die Originalfassung bleibt zitierfähig. Die Online-Referenz macht Aktualisierungen, Logikschärfungen und Korrekturen sichtbar.</p>
        ${statusBadges("partially-delta-reviewed")}
      </div>
    </section>
    <section class="reference-section">
      <div class="timeline-grid">
        <article><span>${SOURCE_VERSION}</span><h2>Source-Original</h2><p>Bestätigte DOCX-/PDF-Fassung des Hauptwerks. Unverändert zitierfähig.</p></article>
        <article><span>${IMPORT_VERSION}</span><h2>Technischer Import</h2><p>Volltext, Kapitelrouten, Dokumentenbibliothek, Suchindex, Bilder und Manifest.</p></article>
        <article><span>${LIVE_VERSION}</span><h2>Lebende Online-Referenz</h2><p>Delta-Review, Glossar- und Logikschärfung, Changelog und sichtbare Addenda.</p></article>
        <article><span>1.1 RC</span><h2>Begriffliche Präzisierung und Referenzordnung</h2><p>Release Candidate auf Grundlage des Führenden Begriffsleitfadens v1.0. Wirkung wird neutral verstanden, Zielgröße ist positive Netto-Wirkung, NWI und T-SROI werden getrennt, ältere Dokumente werden historisch eingeordnet.</p><a class="text-link" href="../version-1-1/">Release-Seite öffnen</a></article>
      </div>
    </section>
    <section class="reference-section">
      <div class="section-header"><h2>Changelog</h2><p>Die wichtigsten Änderungen der Live-Reference-Schicht.</p></div>
      <div class="update-list">
        ${(changelog.changes || []).map((change) => `<article id="${esc(change.changeId)}"><span>${esc(change.changeId)}</span><h3>${esc(change.type)}</h3><p>${esc(change.reason)}</p><small>${esc(change.sourceForChange || "")}</small></article>`).join("")}
      </div>
    </section>
  </main>`;
}

function releaseV11Html() {
  return `<main class="reference-portal" data-pagefind-body>
    <section class="reference-hero compact-reference-hero">
      <div>
        <nav class="breadcrumb"><a href="../">Referenz</a> / <a href="../versionen/">Versionen</a> / Version 1.1</nav>
        <p class="hero-kicker">Release Candidate</p>
        <h1>Version 1.1 – Begriffliche Präzisierung und Referenzordnung</h1>
        <p class="hero-subtitle">Release Candidate der Wirkungsökonomie auf Grundlage des Führenden Begriffsleitfadens, Stand 21. Mai 2026.</p>
      </div>
    </section>
    ${terminologyNotice()}
    <section class="reference-section reference-split">
      <div>
        <h2>Status</h2>
        <p>Version 1.1 ist eine begriffliche, methodische und dokumentarische Aktualisierung der Wirkungsökonomie. Sie ist kein geltendes Recht und keine amtliche Methodik.</p>
        <h2>Warum Version 1.1?</h2>
        <p>Diese Version präzisiert zentrale Begriffe, ordnet ältere Projektdateien ein und macht Quellen, offene Prüfungen, Changelog und Release-Dokumentation sichtbar.</p>
      </div>
      <aside class="reference-emphasis">
        <strong>Terminologiebasis</strong>
        <p>Führender Begriffsleitfaden der Wirkungsökonomie, Version 1.0, Stand 21. Mai 2026.</p>
      </aside>
    </section>
    <section class="reference-section">
      <div class="section-header"><h2>Wichtigste Änderungen</h2></div>
      <ul class="reference-check-list">
        <li>Wirkung wird neutral definiert.</li>
        <li>Zielgröße ist positive Netto-Wirkung für Mensch, Planet und Demokratie.</li>
        <li>Wirkungspotenzial wird von Wirkung getrennt.</li>
        <li>Wirkstoff wird als Analogie eingeordnet.</li>
        <li>SDG+ wird als WÖk-Erweiterung erklärt, nicht als offizielle UN-Kategorie.</li>
        <li>NWI und T-SROI werden getrennt.</li>
        <li>FinalScore, NWI, T-SROI und WIF werden eingeordnet.</li>
        <li>WStG wird als Rahmengesetz verstanden; WUStG und WEstG werden als Module eingeordnet.</li>
        <li>Personenbewertung, Gesinnungsbewertung, Lebensstilbewertung und Social Credit werden ausgeschlossen.</li>
        <li>Fehlbarkeit, Pilotierung, Evaluation und Reversibilität werden hervorgehoben.</li>
        <li>Glossar, Hoverdefinitionen, Quellenregister, Referenz-Metadaten und Changelog wurden verbessert.</li>
      </ul>
    </section>
    <section class="reference-section reference-split">
      <div>
        <h2>Führende Dokumente</h2>
        ${pillList(["Führender Begriffsleitfaden v1.0", "Die neue Ordnung des Wohlstands / Online-Referenz", "WÖk Master Items v1.2", "WStG 2.0", "WUStG v2.1", "T-SROI v2.0", "Schutzrahmen Social Credit"])}
      </div>
      <aside class="reference-emphasis">
        <h2>Was Version 1.1 nicht ist</h2>
        <ul>
          <li>kein geltendes Recht</li>
          <li>keine verbindlichen Steuersätze</li>
          <li>keine finale juristische Prüfung</li>
          <li>keine amtliche Methodik</li>
          <li>keine Finanzierungszusage</li>
          <li>keine Personenbewertung</li>
          <li>kein Social-Credit-System</li>
        </ul>
      </aside>
    </section>
    <section class="reference-section">
      <div class="section-header"><h2>Offene Punkte</h2></div>
      ${pillList(["juristische Vertiefungsprüfung", "EU-Steuerrechtsprüfung", "Datenschutzprüfung", "externe Quellenvalidierung", "finale Linkprüfung", "PDF/EPUB/Druckexport", "Barrierefreiheitsprüfung", "Lektorat"])}
    </section>
    <section class="reference-section">
      <div class="section-header"><h2>Dokumentationsdateien</h2></div>
      <div class="export-card-grid">
        <article class="export-card"><h3>Release Notes</h3><p><code>docs/release/WOeK_v1.1_Release_Notes_final.md</code></p></article>
        <article class="export-card"><h3>Quellenregister</h3><p><code>docs/release/WOeK_v1.1_Quellenregister_final.md</code></p></article>
        <article class="export-card"><h3>Offene Prüfungen</h3><p><code>docs/release/WOeK_v1.1_Offene_Pruefungen.md</code></p></article>
        <article class="export-card"><h3>Historische Dokumente</h3><p><code>docs/release/WOeK_v1.1_Historische_Dokumente.md</code></p></article>
      </div>
    </section>
  </main>`;
}

function exportHtml() {
  const priorityOriginals = workpapers.slice(0, 16);
  return `<main class="reference-portal" data-pagefind-body>
    <section class="reference-hero compact-reference-hero">
      <div>
        <nav class="breadcrumb"><a href="../">Referenz</a> / Export</nav>
        <p class="hero-kicker">Export und Zitierfähigkeit</p>
        <h1>Referenzstände exportieren</h1>
        <p class="hero-subtitle">Originalfassungen, Web-Lesefassung, Druckansicht und Arbeitspapier-Originale bleiben getrennt sichtbar.</p>
      </div>
    </section>
    <section class="reference-section reference-split">
      <div>
        <h2>Standardexporte Phase 1</h2>
        <div class="export-card-grid">
          <a class="export-card" href="../../assets/pdf/die-neue-ordnung-des-wohlstands.pdf"><h3>Hauptwerk Original-PDF</h3><p>Zitierfähige Source-Original-Fassung.</p></a>
          <a class="export-card" href="../volltext/"><h3>Hauptwerk Web-Volltext</h3><p>Vollständige Onlinefassung als Druckansicht nutzbar.</p></a>
          <a class="export-card" href="../../begriffe/"><h3>Glossar</h3><p>Alphabetische Begriffsschicht für Hover, Crosslinks und Export.</p></a>
          <a class="export-card" href="../../dokumente/"><h3>Dokumentenbibliothek</h3><p>Webfassungen und Originaldateien aller importierten Arbeitspapiere.</p></a>
        </div>
      </div>
      <aside class="reference-emphasis">
        <p>Individuelle Dossier-Exporte folgen in Phase 2. GitHub Pages bleibt in Phase 1 vollständig statisch.</p>
      </aside>
    </section>
    <section class="reference-section">
      <div class="section-header"><h2>Arbeitspapier-Originale</h2></div>
      <div class="document-link-grid">
        ${priorityOriginals.map((doc) => `<a href="../../${doc.originalUrl.replace(/^\.\.\//, "")}"><strong>${esc(doc.title)}</strong><span>${esc(doc.documentType)} · ${esc(doc.status)}</span></a>`).join("")}
      </div>
    </section>
  </main>`;
}

function partPageHtml(part, chapters) {
  const partChapters = chapters.filter((chapter) => chapter.part?.slug === part.slug);
  const terms = [...new Set(partChapters.flatMap((chapter) => chapter.terms))].slice(0, 10);
  const docs = [...new Set(partChapters.flatMap((chapter) => relatedDocsByCluster[chapter.cluster.key] || []))].slice(0, 8);
  return `<main class="reference-portal part-reader" data-pagefind-body>
    <section class="reference-hero compact-reference-hero">
      <div>
        <nav class="breadcrumb"><a href="../">Referenz</a> / <a href="../teile/">Teile</a> / Teil ${part.roman}</nav>
        <p class="hero-kicker">Teil ${part.roman}</p>
        <h1>${esc(part.title.replace(/^Teil\s+[IVXLCDM]+\s*[-:]\s*/i, ""))}</h1>
        <p class="hero-subtitle">${partChapters.length} Kapitel im Grundlagenwerk. Als Teilübersicht mit zentralen Begriffen, Kontext und Exportpfad gestaltet.</p>
        ${statusBadges("partially-delta-reviewed")}
      </div>
    </section>
    <section class="reference-section reference-split">
      <div>
        <h2>Kapitel in diesem Teil</h2>
        <div class="chapter-card-grid compact">
          ${partChapters.map((chapter) => chapterCard(chapter, "../")).join("")}
        </div>
      </div>
      <aside class="reference-context-rail static">
        <h2>Kontext</h2>
        <h3>Zentrale Begriffe</h3>
        ${pillList(terms)}
        <h3>Relevante Dokumente</h3>
        ${pillList(docs.length ? docs : ["Hauptwerk", "Glossar", "Dokumentenbibliothek"])}
        <h3>Export</h3>
        <a class="text-link" href="../export/">Exportbereich öffnen</a>
      </aside>
    </section>
  </main>`;
}

function legacyPartRedirectHtml(part) {
  return `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="refresh" content="0; url=../${esc(part.slug)}/">
    <title>Teil ${esc(part.roman)} - ${esc(part.title)} - Wirkungsökonomie</title>
    <meta name="description" content="Weiterleitung zur korrigierten Referenzroute für Teil ${esc(part.roman)}.">
    <meta name="robots" content="noindex">
    <link rel="canonical" href="../${esc(part.slug)}/">
  </head>
  <body>
    <main>
      <h1>Teil ${esc(part.roman)} - ${esc(part.title)}</h1>
      <p>Diese frühere Referenzroute wurde durch eine sprechende Route ersetzt.</p>
      <p><a href="../${esc(part.slug)}/">Zur korrigierten Teilseite wechseln</a></p>
    </main>
  </body>
</html>`;
}

function sourceChips(html) {
  const saved = [];
  let next = html.replace(/<a\b[^>]*class=["'][^"']*source-chip[^"']*["'][\s\S]*?<\/a>/gi, (match) => {
    const key = `__SOURCE_CHIP_${saved.length}__`;
    saved.push(match);
    return key;
  });
  next = next.replace(/\[((?:I|E)-K\d{1,3}-\d+)\]/g, (match, id) => {
    const href = `../quellen/#${slugify(id)}`;
    return `<a class="source-chip" href="${href}" data-source-id="${esc(id)}">${match}</a>`;
  });
  saved.forEach((value, index) => {
    next = next.replace(`__SOURCE_CHIP_${index}__`, value);
  });
  return next;
}

function scriptTagForPage(file) {
  const base = baseFor(file);
  return scriptsFor(base);
}

function ensureScripts(html, file) {
  let next = html
    .replace(/style\.css\?v=[^"']+/g, `style.css?v=${referenceReaderAssetVersion}`)
    .replace(/reference-reader\.js\?v=[^"']+/g, `reference-reader.js?v=${referenceReaderAssetVersion}`);
  if (next.includes("reference-reader.js")) return next;
  return next.replace("</body>", `    ${scriptTagForPage(file)}\n  </body>`);
}

function stripUxMarkers(html) {
  return html.replace(/<!-- reference-ux:start -->[\s\S]*?<!-- reference-ux:end -->/g, "");
}

function uniqueClasses(...values) {
  return [...new Set(values.join(" ").split(/\s+/).filter(Boolean))].join(" ");
}

function cleanMainRest(rest, attribute) {
  return rest.replace(new RegExp(`\\s${attribute}\\b`, "g"), "");
}

function applyChapterMetadataCorrections(html, chapter) {
  const corrected = chapterTitleCorrections[chapter.number];
  if (!corrected) return html;
  const full = `Kapitel ${chapter.number} - ${corrected}`;
  let next = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(full)} - Wirkungsökonomie</title>`);
  next = next.replace(/<meta name="search_title" content="[^"]*">/, `<meta name="search_title" content="${esc(full)}">`);
  next = next.replace(/<h1\b([^>]*)>[\s\S]*?<\/h1>/, `<h1$1>${esc(full)}</h1>`);
  next = next.replace(
    new RegExp(`(<h2\\b[^>]*>\\s*)Kapitel\\s+${chapter.number}(?:\\s+Kapitel\\s+${chapter.number})?(\\s*</h2>)`, "i"),
    `$1${esc(full)}$2`
  );
  return next;
}

function modeBar(chapter) {
  return `<!-- reference-ux:start --><div class="reading-progress" aria-hidden="true"><span></span></div>
      <div class="reader-mode-dock" data-reader-modes>
        <span>Modus</span>
        <button type="button" class="active" data-reader-mode="lesen">Lesen</button>
        <button type="button" data-reader-mode="referenz">Referenz</button>
        <button type="button" data-reader-mode="quellen">Quellen</button>
        <button type="button" data-reader-mode="updates">Updates</button>
        <button type="button" data-reader-mode="print">Druck</button>
      </div>
      <nav class="chapter-mini-map" aria-label="Abschnitte in Kapitel ${chapter.number}">
        <p class="chapter-mini-map-kicker">Kapitel ${chapter.number}</p>
        <h2>Inhaltsverzeichnis</h2>
        <div class="chapter-mini-map-actions">
          <a href="../">Referenzportal</a>
          <a href="../kapitel/">Alle Kapitel</a>
        </div>
        <div class="chapter-mini-map-list">
          ${chapter.sections.map((section) => `<a href="#${esc(section.id)}">${esc(section.title)}</a>`).join("")}
        </div>
      </nav><!-- reference-ux:end -->`;
}

function chapterToolbar(chapter) {
  return `<!-- reference-ux:start --><div class="chapter-reader-tools">
      <a class="btn btn-primary" href="../../assets/pdf/die-neue-ordnung-des-wohlstands.pdf">Originalfassung</a>
      <a class="btn btn-secondary" href="../volltext/#woek-main-2026-k${String(chapter.number).padStart(3, "0")}">Volltextposition</a>
      <a class="btn btn-secondary" href="../quellen/">Quellen</a>
      <a class="btn btn-secondary" href="../../begriffe/">Glossar</a>
      <button class="btn btn-secondary" type="button" data-print-page>Drucken</button>
      <button class="btn btn-secondary" type="button" data-copy-current-url>Diese Stelle zitieren</button>
    </div><!-- reference-ux:end -->`;
}

function terminologyNotice() {
  return `<!-- reference-ux:start --><aside class="reference-term-notice" data-no-glossary>
      <strong>Terminologiebasis</strong>
      <p>Diese Online-Referenz folgt dem Führenden Begriffsleitfaden der Wirkungsökonomie, Version 1.0, Stand 21. Mai 2026. Wo Zielgrößen gemeint sind, spricht die aktuelle Fassung von positiver Netto-Wirkung für Mensch, Planet und Demokratie.</p>
    </aside><!-- reference-ux:end -->`;
}

function chapterGlossary(chapter) {
  const terms = chapter.terms
    .map((label) => termFor(label))
    .filter(Boolean)
    .slice(0, 8);
  if (!terms.length) return "";
  return `<!-- reference-ux:start --><section class="chapter-glossary" aria-labelledby="chapter-glossary-${chapter.number}">
      <h2 id="chapter-glossary-${chapter.number}">Zentrale Begriffe dieses Kapitels</h2>
      <div class="chapter-glossary-grid">
        ${terms.map((term) => `<article>
          <h3><a href="../../begriffe/${esc(term.slug)}/">${esc(term.canonicalLabel)}</a></h3>
          <p>${esc(term.shortDefinition || term.hoverDefinition)}</p>
        </article>`).join("")}
      </div>
    </section><!-- reference-ux:end -->`;
}

function chapterFooter(chapter, previous, next) {
  return `<!-- reference-ux:start --><nav class="chapter-bottom-nav" aria-label="Kapitel Navigation">
      ${previous ? `<a href="../${previous.slug}/"><span>Vorheriges Kapitel</span><strong>${previous.number}. ${esc(previous.title)}</strong></a>` : "<span></span>"}
      <a href="#top" data-scroll-top><span>Zurück nach oben</span><strong>Kapitelanfang</strong></a>
      ${next ? `<a href="../${next.slug}/"><span>Nächstes Kapitel</span><strong>${next.number}. ${esc(next.title)}</strong></a>` : "<span></span>"}
    </nav><!-- reference-ux:end -->`;
}

function contextAdditions(chapter) {
  const docs = relatedDocsByCluster[chapter.cluster.key] || ["Hauptwerk", "Glossar", "Dokumentenbibliothek"];
  return `<!-- reference-ux:start --><section class="context-module">
      <h3>Lesemodi</h3>
      <p>Lesen für ruhigen Text, Referenz für Glossar und Kontext, Quellen für Belege, Updates für Live-Reference-Addenda.</p>
    </section>
    <section class="context-module">
      <h3>Zentrale Begriffe</h3>
      ${termPillList(chapter.terms, "../../")}
    </section>
    <section class="context-module">
      <h3>Verwandte Kapitel</h3>
      <a href="../kapitel/">Kapitelübersicht öffnen</a>
    </section>
    <section class="context-module">
      <h3>Arbeitspapiere</h3>
      ${pillList(docs)}
    </section>
    <section class="context-module">
      <h3>Version</h3>
      <a href="../versionen/">Changelog und Reviewstatus</a>
    </section><!-- reference-ux:end -->`;
}

function enhanceChapter(chapter, chapters) {
  let html = stripUxMarkers(read(chapter.file));
  html = applyChapterMetadataCorrections(html, chapter);
  html = sourceChips(html);
  html = html.replace(
    /<main class="([^"]*reference-work[^"]*)"([^>]*)>/,
    (match, classes, rest) => `<main class="${uniqueClasses(classes, "chapter-reader reference-reader")}" data-reference-reader${cleanMainRest(rest, "data-reference-reader")}>${modeBar(chapter)}`
  );
  html = html.replace(/<nav class="breadcrumb">([\s\S]*?)<\/nav>/, (match) => `${match}
            <!-- reference-ux:start -->${statusBadges(chapter.reviewStatus)}<!-- reference-ux:end -->`);
  html = html.replace(/(<h1\b[\s\S]*?<\/h1>)/, `$1
            ${chapterToolbar(chapter)}`);
  html = html.replace(/class="meta-box related-panel"/g, 'class="reference-context-rail related-panel"');
  html = html.replace(/(<aside class="reference-context-rail related-panel"[\s\S]*?)(<\/aside>\s*<\/main>)/, `$1${contextAdditions(chapter)}
        $2`);
  html = versionStatusBox(html);
  const index = chapters.findIndex((item) => item.number === chapter.number);
  const previous = chapters[index - 1];
  const next = chapters[index + 1];
  html = html.replace("</article>", `${terminologyNotice()}
          ${chapterGlossary(chapter)}
          ${chapterFooter(chapter, previous, next)}
          </article>`);
  html = ensureScripts(html, chapter.file);
  write(chapter.file, html);
}

function enhanceDocument(file) {
  let html = stripUxMarkers(read(file));
  const title = cleanTitle(html.match(/<h1[^>]*>(.*?)<\/h1>/is)?.[1] || path.basename(path.dirname(file)));
  const headings = [...html.matchAll(/<h2\b([^>]*)>(.*?)<\/h2>/gis)]
    .map((match) => ({ id: match[1].match(/\sid=["']([^"']+)["']/i)?.[1] || "", title: cleanTitle(match[2]) }))
    .filter((item) => item.id && item.title)
    .slice(0, 12);
  html = sourceChips(html);
  html = html.replace(/<main class="([^"]*reference-work[^"]*)"([^>]*)>/, (match, classes, rest) => {
    if (classes.includes("workpaper-reader")) return match;
    return `<main class="${uniqueClasses(classes, "workpaper-reader reference-reader")}" data-reference-reader${cleanMainRest(rest, "data-reference-reader")}>`;
  });
  html = html.replace(/(<h1\b[\s\S]*?<\/h1>)/, `$1
        <!-- reference-ux:start --><div class="document-reader-tools">
          <a class="btn btn-secondary" href="../">Dokumentenbibliothek</a>
          <a class="btn btn-secondary" href="../../referenz/">Referenzportal</a>
          <a class="btn btn-secondary" href="../../begriffe/">Glossar</a>
          <button class="btn btn-secondary" type="button" data-print-page>Drucken</button>
        </div><!-- reference-ux:end -->`);
  const toc = headings.length
    ? `<aside class="document-mini-map"><h2>Inhalt</h2>${headings.map((heading) => `<a href="#${heading.id}">${esc(heading.title)}</a>`).join("")}</aside>`
    : "";
  html = html.replace(/(<article class="article-shell">)/, `$1
        <!-- reference-ux:start -->${toc}<!-- reference-ux:end -->`);
  html = ensureScripts(html, file);
  write(file, html);
}

function enhanceFullText() {
  const file = "referenz/volltext/index.html";
  if (!fs.existsSync(file)) return;
  let html = stripUxMarkers(read(file));
  html = html.replace(/style\.css\?v=[^"']+/g, `style.css?v=${referenceReaderAssetVersion}`);
  html = html.replace(/reference-reader\.js\?v=[^"']+/g, `reference-reader.js?v=${referenceReaderAssetVersion}`);
  html = html.replace(/<main class="([^"]*reference-work[^"]*)"([^>]*)>/, (match, classes, rest) => {
    const merged = [classes, "reference-fulltext"].join(" ").replace(/\s+/g, " ").trim();
    const clean = [...new Set(merged.split(" "))].join(" ");
    const withReader = rest.includes("data-reference-reader") ? rest : ` data-reference-reader${rest}`;
    return `<main class="${clean}"${withReader}>`;
  });
  html = html.replace(/<main class="([^"]*reference-work[^"]*)"([^>]*)>/, (match) => {
    if (html.includes("class=\"reading-progress\"")) return match;
    return `${match}
      <!-- reference-ux:start --><div class="reading-progress" aria-hidden="true"><span></span></div><!-- reference-ux:end -->`;
  });
  if (!html.includes("fulltext-toolbar")) {
    html = html.replace(/(<\/section>\s*)(<section class="version-summary")/, `$1
      <!-- reference-ux:start --><nav class="fulltext-toolbar" aria-label="Volltext-Navigation">
        <span>Volltext</span>
        <a href="../">Referenzportal</a>
        <a href="../kapitel/">Kapitelübersicht</a>
        <a href="#woek-main-fulltext">Zum Text</a>
        <a href="../../assets/pdf/die-neue-ordnung-des-wohlstands.pdf">Original-PDF</a>
        <button type="button" data-print-page>Drucken</button>
      </nav><!-- reference-ux:end -->
      $2`);
  }
  html = html.replace(/<article class="([^"]*article-shell[^"]*)" id="woek-main-fulltext">/, (match, classes) => {
    const merged = [classes, "fulltext-reader"].join(" ").replace(/\s+/g, " ").trim();
    const clean = [...new Set(merged.split(" "))].join(" ");
    return `<article class="${clean}" id="woek-main-fulltext">`;
  });
  html = html.replace(/<details class="technical-meta">[\s\S]*?<\/details>/g, "");
  html = html.replace(
    /<div class="version-summary-note"><p>Absätze: ([^<]+)<\/p><\/div>/,
    `<p class="version-summary-note"><a class="text-link" href="../versionen/">Versionen ansehen</a></p>`
  );
  html = ensureScripts(versionStatusBox(html), file);
  write(file, html);
}

function writeDesignDocs(chapters) {
  write("docs/CORPORATE_DESIGN_INTEGRATION.md", `# Corporate-Design-Integration der WÖk-Referenz

Stand: ${new Date().toISOString().slice(0, 10)}

## Bestehende CSS- und Designbasis

- Hauptdatei: \`assets/css/style.css\`
- Navigation: \`assets/data/navigation.json\`, \`templates/header.html\`, \`templates/footer.html\`
- Bestehende Suche: \`assets/search/search-index.json\`, \`assets/js/search.js\`, ergänzt über \`tools/build_search_index.py\` und \`scripts/search/build-woek-search-index.mjs\`
- Bestehende Interaktion: \`assets/js/main.js\` für Navigation, Glossar-Hovers und Seitengrundlogik

## Farben

- Navy: \`#0B1020\`
- Ivory: \`#F6F1E8\`
- Green: \`#2F7D5C\`
- Gold: \`#9A6F12\`
- Coral: \`#C85A4A\`
- Linien: \`#E8E4DC\`

## Typografie

- Headlines: \`Source Serif 4\` mit Georgia-Fallback
- Fließtext/UI: \`Inter\` mit System-Fallback
- Die Referenz nutzt diese bestehende Hierarchie weiter und begrenzt die Lesespalte stärker als allgemeine Seiten.

## Übernommene UI-Muster

- Hero-Kicker, große Serifentitel, ruhige Ivory-Flächen
- bestehende Button-Klassen \`.btn\`, \`.button\`
- Kartenlogik mit 8px Radius und feiner Linie
- grüne Akzentlinien für geprüfte Live-Reference-Hinweise
- Header, Footer und Suche bleiben die vorhandenen Website-Systeme

## Neu ergänzte Referenz-Komponenten

- \`ReferencePortal\` als gestaltete Portal-Startseite unter \`/referenz/\`
- \`ChapterCard\`, \`PartCard\`, \`ChapterReaderLayout\`
- \`ReferenceContextRail\`, \`ReadingProgress\`, \`ChapterMiniMap\`
- \`VersionRibbon\`, \`LiveReferenceAddendum\`, \`SourceCard\`, \`ExportDock\`
- \`reference-reader.js\` für Lesemodi, lokale Kapitel-Filter, Quellenchips, Bild-Lightbox und Anchor-Copy

## Bewusst nicht eingeführt

- kein generisches Starlight-/Docs-Theme
- keine zweite Suche
- keine neue globale Navigation mit vielen Punkten
- kein Backend, keine Kommentare, kein Login, keine Datenbank
`);

  const uxReady = chapters.filter((chapter) => chapter.priority).map((chapter) => `- Kapitel ${chapter.number}: ${chapter.title}`).join("\n");
  write("docs/PHASE_1_UX_COMPLETION_REPORT.md", `# Phase 1 UX Completion Report

Stand: ${new Date().toISOString().slice(0, 10)}

## Corporate Design

Die Referenz verwendet die bestehende visuelle Sprache der Website: Navy, Ivory, Green, Gold, Source-Serif-Headlines, Inter-Fließtext, 8px-Karten, bestehende Buttons, Header und Footer. Kein fremdes Docs-Theme wurde eingeführt.

## Neue Struktur

- \`/referenz/\`: gestaltetes Portal mit Hero, sechs Einstiegskarten, Teilatlas, Kapitel-Navigator, Changelog und Begriffsschärfungen
- \`/referenz/lesen/\`: geführter Buchmodus
- \`/referenz/volltext/\`: lange Volltextansicht bleibt erhalten
- \`/referenz/teile/\`: Teilübersicht
- \`/referenz/kapitel/\`: Kapitelübersicht mit lokalem Filter
- \`/referenz/glossar/\`: Einbindung der zentralen Begriffsschicht
- \`/referenz/quellen/\`: Quellenkarten mit Backlinks
- \`/referenz/versionen/\`: Versionen und Changelog
- \`/referenz/export/\`: Export- und Zitierbereich

## Kapitelrouten

Alle 108 Kapitelrouten existieren. Priorisierte Kapitel wurden als Reader-Seiten mit linker Abschnittsnavigation, rechter Kontextleiste, Lesemodi, Quellenchips, VersionRibbon, Live-Reference-Addenda und Vor-/Zurück-Navigation gestaltet.

## UX-perfektionierte Kapitelcluster

${uxReady}

## Nur technisch strukturierte Kapitel

Nicht priorisierte Kapitel behalten vollständigen Text, Kapitelroute, Abschnitts-IDs, Versionierung, Quellen und Grund-Reader-UX, sind aber fachlich noch nicht vollständig delta-reviewed.

## Arbeitspapiere

Prioritäre Arbeitspapiere erscheinen als gestaltete Webdokumente mit Dokument-Hero, Metadaten, Originaldatei, Druck-/Glossar-/Referenzaktionen und Inhaltsminiatur. Einzelne PDF-Importe enthalten weiterhin technische Seitenumbrüche und zusammengezogene Tabellen. Diese Stellen sind als Importstatus sichtbar und bleiben Nacharbeit für die redaktionelle Konsolidierung.

## Glossar-Hovers

Die bestehenden Glossar-Hovers aus \`assets/js/main.js\` werden auf Referenz- und Dokumentseiten geladen. Zentrale Begriffe werden clientseitig kontrolliert beim ersten Vorkommen verlinkt; mobile Nutzung öffnet ein Sheet.

## Quellenkarten

Quellen-IDs werden im Reader als \`source-chip\` dargestellt und auf \`/referenz/quellen/\` verlinkt. Das Quellenregister erzeugt Karten mit intern/extern-Markierung und Kapitel-Backlink.

## Kontextpanels

Kapitel enthalten eine rechte Kontextleiste mit Begriffen, verwandten Dokumenten, Version, Original/Export und Diskurs-Platzhalter. Auf Mobile wird sie als normale Sektion unter dem Text lesbar.

## Suche

Die bestehende Suche bleibt die einzige Suche. Neue Referenzrouten, Kapitel, Quellen, Versionen, Export und Dokumente werden in den bestehenden Index übernommen.

## Mobile UX

Die Kapitel-Navigation wird oberhalb des Texts kompakt, Tabellen bleiben horizontal scrollbar, Kontextleisten werden einspaltig, Glossar-Hovers öffnen mobil als Sheet.

## Exportoptionen

Der Exportbereich unterscheidet Originalfassungen, Web-Volltext, Glossar, Dokumentenbibliothek und Arbeitspapier-Originale. Kein dynamischer Composer in Phase 1.

## Offen

- Einige Arbeitspapier-Webfassungen brauchen redaktionelle Tabellenrekonstruktion.
- Nicht priorisierte Kapitel sind strukturell, aber noch nicht fachlich vollständig delta-reviewed.
- Der Suchindex ist groß und sollte perspektivisch gesplittet oder komprimiert werden.
`);
}

function main() {
  const parts = collectParts();
  const chapters = collectChapters(parts);

  write("referenz/index.html", page("referenz/index.html", {
    title: "Die neue Ordnung des Wohlstands",
    description: "Lebende Online-Referenz der Wirkungsökonomie mit Portal, Kapitel-Navigator, Glossar, Quellen und Export.",
    type: "Live-Referenz",
    body: portalHtml(chapters, parts),
    bodyClass: "reference-ux-page",
  }));

  write("referenz/kapitel/index.html", page("referenz/kapitel/index.html", {
    title: "Kapitel 1 bis 108",
    description: "Kapitel-Navigator des Grundlagenwerks.",
    body: chapterIndexHtml(chapters),
    bodyClass: "reference-ux-page",
  }));

  write("referenz/teile/index.html", page("referenz/teile/index.html", {
    title: "Teil I bis XVIII",
    description: "Teil-Navigator des Grundlagenwerks.",
    body: partsIndexHtml(parts),
    bodyClass: "reference-ux-page",
  }));

  write("referenz/lesen/index.html", page("referenz/lesen/index.html", {
    title: "Das Werk lesen",
    description: "Geführter Buchmodus der Online-Referenz.",
    body: guidedReadingHtml(chapters),
    bodyClass: "reference-ux-page",
  }));

  write("referenz/quellen/index.html", page("referenz/quellen/index.html", {
    title: "Quellenregister",
    description: "Quellenkarten und Backlinks der Online-Referenz.",
    section: "Quellen",
    type: "Quellenregister",
    body: sourcesHtml(chapters),
    bodyClass: "reference-ux-page",
  }));

  write("referenz/glossar/index.html", page("referenz/glossar/index.html", {
    title: "Glossar der Online-Referenz",
    description: "Einbindung der zentralen Begriffsschicht, Hoverdefinitionen und Crosslinks.",
    section: "Glossar",
    type: "Begriffsschicht",
    body: glossaryHtml(),
    bodyClass: "reference-ux-page",
  }));

  write("referenz/versionen/index.html", internalReferenceRedirectHtml("Versionen der Online-Referenz"));
  write("referenz/version-1-1/index.html", internalReferenceRedirectHtml("Version 1.1 - Begriffliche Präzisierung und Referenzordnung"));
  write("referenz/version-1-1/index 2.html", internalReferenceRedirectHtml("Version 1.1 - Begriffliche Präzisierung und Referenzordnung"));
  write("referenz/export/index.html", internalReferenceRedirectHtml("Export und Zitierfähigkeit"));

  for (const part of parts) {
    write(`referenz/${part.slug}/index.html`, page(`referenz/${part.slug}/index.html`, {
      title: part.title,
      description: `Teil ${part.roman} des Grundlagenwerks als Referenzübersicht.`,
      body: partPageHtml(part, chapters),
      bodyClass: "reference-ux-page",
    }));
    if (part.legacySlug && part.legacySlug !== part.slug) {
      write(`referenz/${part.legacySlug}/index.html`, legacyPartRedirectHtml(part));
    }
  }

  for (const chapter of chapters) enhanceChapter(chapter, chapters);
  enhanceFullText();
  for (const doc of fs.readdirSync("dokumente", { withFileTypes: true }).filter((entry) => entry.isDirectory())) {
    const file = `dokumente/${doc.name}/index.html`;
    if (fs.existsSync(file)) enhanceDocument(file);
  }

  writeDesignDocs(chapters);
  console.log(`Enhanced reference UX for ${chapters.length} chapters, ${parts.length} parts and generated reference portals.`);
}

main();
