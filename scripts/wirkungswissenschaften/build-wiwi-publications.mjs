import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Rendert die beiden Grundlagen-Publikationen (Journalbeitrag + Dossier) zu
// "Wirkungswissenschaften / Wirkungsforschung / Wirkungsökonomie" aus den
// committeten Markdown-Quellen unter content/wirkungswissenschaften/.
// Volles Site-Chrome via templates/header.html + footer.html + navigation.json.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://wirkungsoekonomie.de";
const CSS_VERSION = "20260612-mobile-table-fix";

const navigation = JSON.parse(fs.readFileSync(path.join(ROOT, "assets/data/navigation.json"), "utf8"));
const headerTemplate = fs.readFileSync(path.join(ROOT, "templates/header.html"), "utf8");
const footerTemplate = fs.readFileSync(path.join(ROOT, "templates/footer.html"), "utf8");

function esc(v) {
  return String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function slugify(v) {
  return String(v || "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/ö/g, "oe").replace(/ä/g, "ae").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
const navMatch = (item) => (item.match || [item.href]).join("|");
const navLink = (item, base) => `<a href="${base}${esc(item.href)}" data-nav-match="${esc(navMatch(item))}">${esc(item.label)}</a>`;
const footerGroup = (g, base) => `<div class="footer-nav-group">
      <h3>${esc(g.title)}</h3>
      <div class="footer-nav-links">
${g.items.map((i) => `          ${navLink(i, base)}`).join("\n")}
      </div>
    </div>`;
function renderHeader(base) {
  return headerTemplate.replaceAll("{{BASE}}", base);
}
function renderFooter(base) {
  return footerTemplate.replaceAll("{{BASE}}", base)
    .replace("{{FOOTER_NAV}}", navigation.footerGroups.map((g) => footerGroup(g, base)).join("\n    "))
    .replace("{{FOOTER_LEGAL_NAV}}", (navigation.footerLegal || []).map((i) => navLink(i, base)).join("\n"));
}

// --- Mini-Markdown -> HTML (Überschriften, Absätze, Listen, bare URLs) -------
function inline(text) {
  let out = esc(text);
  out = out.replace(/\bhttps?:\/\/[^\s)]+/g, (u) => `<a href="${u}" rel="noopener">${u.replace(/^https?:\/\//, "")}</a>`);
  return out;
}
function parseBlocks(md) {
  return md.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
}
// Baut Body-HTML + Sektionsliste (für TOC/Suche) aus den Blöcken ab dem ersten "## ".
function renderBody(blocks) {
  const html = [];
  const sections = [];
  let listBuf = [];
  let listType = null; // "ul" | "ol"
  const flush = () => {
    if (!listBuf.length) return;
    const tag = listType === "ol" ? "ol" : "ul";
    html.push(`<${tag}>${listBuf.map((li) => `<li>${inline(li)}</li>`).join("")}</${tag}>`);
    listBuf = []; listType = null;
  };
  let skipUntilH2 = false;
  for (const b of blocks) {
    const h = b.match(/^(#{2,4})\s+(.*)$/);
    if (h) {
      flush();
      const level = h[1].length;
      const title = h[2].trim();
      if (level === 2 && /Inhaltsübersicht|Inhaltsverzeichnis/i.test(title)) { skipUntilH2 = true; continue; }
      skipUntilH2 = false;
      if (level === 2) {
        const id = slugify(title);
        sections.push({ id, title });
        html.push(`<h2 id="${id}">${inline(title)}</h2>`);
      } else if (level === 3) {
        html.push(`<h3 id="${slugify(title)}">${inline(title)}</h3>`);
      } else {
        html.push(`<h4>${inline(title)}</h4>`);
      }
      continue;
    }
    if (skipUntilH2) continue;
    const uli = b.match(/^[-•]\s+(.*)$/s);
    if (uli) { if (listType && listType !== "ul") flush(); listType = "ul"; listBuf.push(uli[1].replace(/\s*\n[-•]\s+/g, " ").trim()); continue; }
    const oli = b.match(/^\d+\.\s+(.*)$/s);
    if (oli) { if (listType && listType !== "ol") flush(); listType = "ol"; listBuf.push(oli[1].replace(/\s*\n\d+\.\s+/g, " ").trim()); continue; }
    flush();
    const kw = b.match(/^(Schlüsselwörter|Keywords):\s*(.*)$/s);
    if (kw) { html.push(`<p class="muted"><strong>${esc(kw[1])}:</strong> ${inline(kw[2])}</p>`); continue; }
    html.push(`<p>${inline(b)}</p>`);
  }
  flush();
  return { body: html.join("\n          "), sections };
}

function tableOfContents(sections, base) {
  if (sections.length < 3) return "";
  const items = sections.map((s) => `            <li><a href="#${s.id}">${esc(s.title)}</a></li>`).join("\n");
  return `        <nav class="term-summary-card" aria-label="Inhaltsübersicht">
          <p class="section-eyebrow">Inhaltsübersicht</p>
          <ol class="toc-list">
${items}
          </ol>
        </nav>`;
}

function pageHead({ route, title, description, base, section, ogType, extraMeta = "", mainAttrs = "" }) {
  const canonical = `${SITE}${route}`;
  const shortTitle = title.replace(/\s+[|·].*$/, "");
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <meta name="search_title" content="${esc(shortTitle)}">
    <meta name="search_description" content="${esc(description)}">
    <meta name="search_section" content="${esc(section)}">
    <meta name="search_type" content="${esc(section)}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="${ogType}">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="${esc(shortTitle)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:url" content="${canonical}">
${extraMeta}    <link rel="icon" href="${base}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=${CSS_VERSION}">
  </head>
  <body>
${renderHeader(base)}
    <main${mainAttrs}>`;
}
function pageTail(base) {
  return `    </main>
${renderFooter(base)}
    <script src="${base}assets/js/main.js?v=${CSS_VERSION}"></script>
  </body>
</html>
`;
}

function frontMatter(blocks) {
  // Alles vor dem ersten "## " ist Front-Matter.
  const idx = blocks.findIndex((b) => /^##\s/.test(b));
  const head = idx === -1 ? blocks : blocks.slice(0, idx);
  const rest = idx === -1 ? [] : blocks.slice(idx);
  const title = head[0] || "";
  const subtitle = head[1] || "";
  const leadBlocks = head.slice(2).filter((b) => !/^(Konzeptioneller|Arbeitsfassung|Autorin|Stand)/i.test(b) && b.length > 40);
  return { title, subtitle, leadBlocks, body: rest };
}

// --- Seiten-Definitionen -----------------------------------------------------
const HUB = "wirkungswissenschaften/";
const JOURNAL_SLUG = "wirkungswissenschaften-wirkungsforschung-wirkungsoekonomie";
const DOSSIER_SLUG = "dossier-wirkungswissenschaften-wirkungsforschung-wirkungsoekonomie";
const JOURNAL_ROUTE = `/blog/${JOURNAL_SLUG}.html`;
const DOSSIER_ROUTE = `/dokumente/${DOSSIER_SLUG}/`;

function publicationBox({ base, self }) {
  const dossierBtn = self === "dossier"
    ? ""
    : `<a class="btn btn-secondary" href="${base}dokumente/${DOSSIER_SLUG}/">Dossier lesen</a>`;
  const journalBtn = self === "journal"
    ? ""
    : `<a class="btn btn-secondary" href="${base}blog/${JOURNAL_SLUG}.html">Journalbeitrag lesen</a>`;
  const dl = self === "dossier"
    ? `<a class="btn btn-primary" href="${base}downloads/wirkungswissenschaften/dossier-wirkungswissenschaften.pdf">PDF herunterladen</a>`
    : `<a class="btn btn-primary" href="${base}downloads/wirkungswissenschaften/journalbeitrag-wirkungswissenschaften.pdf">PDF herunterladen</a>`;
  return `        <section class="term-link-section">
          <div>
            <p class="section-eyebrow">Publikation</p>
            <h2>Herunterladen &amp; weiterlesen</h2>
          </div>
          <div class="document-action-row">
            ${dl}
            ${dossierBtn}
            ${journalBtn}
            <a class="btn btn-ghost" href="${base}wirkungswissenschaften/">Grundlagenbereich</a>
          </div>
        </section>`;
}

function citationBox(text) {
  return `        <section class="term-summary-card" id="zitierempfehlung">
          <p class="section-eyebrow">Zitierempfehlung</p>
          <p>${esc(text)}</p>
        </section>`;
}

function relatedChips(base) {
  const chips = [
    ["wirkungswissenschaften/", "Wirkungswissenschaften"],
    ["begriffe/wirkung/", "Wirkung"],
    ["begriffe/wirkungsarchitektur/", "Wirkungsarchitektur"],
    ["begriffe/netto-wirkung/", "Netto-Wirkung"],
    ["begriffe/", "Glossar"],
    ["verstehen/", "Wirkungsökonomie verstehen"],
  ];
  return `        <section class="term-link-section">
          <div><p class="section-eyebrow">Weiterlesen</p><h2>Verwandte Seiten</h2></div>
          <div class="term-chip-row">
${chips.map(([h, l]) => `            <a class="term-chip" href="${base}${h}">${esc(l)}</a>`).join("\n")}
          </div>
        </section>`;
}

function buildJournal() {
  const base = "../";
  void HUB; void pageHead; void pageTail; void publicationBox; void citationBox; void relatedChips; void tableOfContents; void JOURNAL_ROUTE;
  const md = fs.readFileSync(path.join(ROOT, "content/wirkungswissenschaften/journal.md"), "utf8");
  const fm = frontMatter(parseBlocks(md));
  let { body } = renderBody(fm.body);
  const { sections } = renderBody(fm.body);
  // Zitier-Anker an h2 anhängen (wie in den anderen Journalartikeln)
  body = body.replace(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g,
    (m, id, txt) => `<h2 id="${id}">${txt} <a class="cite-anchor no-print" href="#${id}" aria-label="Zitierlink zu diesem Abschnitt">#</a></h2>`);
  const wordCount = fm.body.join(" ").split(/\s+/).filter(Boolean).length;
  const readingMin = Math.max(1, Math.round(wordCount / 200));
  const title = "Wirkungswissenschaften als neuer Bezugsrahmen";
  const subtitle = fm.subtitle || "Von der Wirkungsforschung zur Wirkungsökonomie und zur systemischen Architektur von Wirkung";
  const description = "Konzeptioneller Journalbeitrag von Natalie Weber: Wirkungswissenschaften als neuer Dachrahmen, Wirkungsforschung als methodische Teildisziplin und die Wirkungsökonomie als erste ausgearbeitete Ordnungsdisziplin.";
  const category = "Wirkungswissenschaften";
  const publishedIso = "2026-07-07T12:00:00+02:00";
  const publishedLabel = "7. Juli 2026";
  const imageName = "2026-07-07-wirkungswissenschaften-wirkungsforschung-wirkungsoekonomie.webp";
  const imageUrl = `${SITE}/assets/img/blog/${imageName}`;
  const imageAlt = "Von der Wirkungsforschung zu den Wirkungswissenschaften: der wissenschaftliche Rahmen der Wirkungsökonomie mit Analyse, Evaluation und Steuerung.";
  const figcaption = "Wirkungswissenschaften als Bezugsrahmen: Analyse, Evaluation und Steuerung im Kreislauf aus Wissenschaft, Wissen, Planet, Gesellschaft, Demokratie und Wirtschaft.";
  const canonical = `${SITE}/blog/${JOURNAL_SLUG}.html`;
  const tags = ["Wirkungswissenschaften", "Wirkungsforschung", "Wirkungsökonomie", "Wirkung", "Netto-Wirkung", "Wirkungsarchitektur", "systemische Wirkungsforschung", "SDG+"];
  const tagMeta = tags.map((t) => `    <meta property="article:tag" content="${esc(t)}">`).join("\n");
  const thesis = fm.leadBlocks.map((b) => `<p>${inline(b)}</p>`).join("\n            ");
  const ld = JSON.stringify({
    "@context": "https://schema.org", "@type": "BlogPosting", headline: title, alternativeHeadline: subtitle,
    description, url: canonical, image: imageUrl, inLanguage: "de",
    datePublished: publishedIso, dateModified: publishedIso,
    author: { "@type": "Person", name: "Natalie Weber" },
    publisher: { "@type": "Organization", name: "Wirkungsökonomie", url: SITE },
    articleSection: category, keywords: tags,
  });
  const html = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)} - Journal der Wirkungsökonomie</title>
    <meta name="description" content="${esc(description)}">
    <meta name="search_title" content="${esc(title)}">
    <meta name="search_description" content="${esc(description)}">
    <meta name="search_section" content="Journal">
    <meta name="search_type" content="Journalartikel">
    <meta name="search_tags" content="${esc(tags.join(", "))}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:alt" content="${esc(imageAlt)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(description)}">
    <meta name="twitter:image" content="${imageUrl}">
    <meta name="twitter:image:alt" content="${esc(imageAlt)}">
    <meta property="article:published_time" content="${publishedIso}">
    <meta property="article:modified_time" content="${publishedIso}">
    <meta property="article:author" content="Natalie Weber">
    <meta property="article:section" content="${esc(category)}">
${tagMeta}
    <link rel="alternate" type="application/rss+xml" title="Journal der Wirkungsökonomie" href="${SITE}/feeds/journal.xml">
    <link rel="icon" href="${base}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=${CSS_VERSION}">
    <script type="application/ld+json">${ld}</script>
  </head>
  <body>
${renderHeader(base)}
    <main id="inhalt" data-pagefind-body>
      <article class="hero">
        <div class="hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="${base}index.html">Start</a> / <a href="${base}blog.html">Journal</a> / ${esc(category)}</nav>
          <p class="hero-kicker">Journal · ${esc(category)} · ${publishedLabel} · ${readingMin} Min.</p>
          <h1 class="hero-title">${esc(title)}</h1>
          <p class="hero-subtitle">${esc(subtitle)}</p>
          <p class="meta">Von Natalie Weber · Konzeptioneller Journalbeitrag</p>
        </div>
        <figure class="hero-system-visual article-visual">
          <img src="${base}assets/img/blog/${imageName}" width="1672" height="941" alt="${esc(imageAlt)}" decoding="async" fetchpriority="high">
          <figcaption>${esc(figcaption)}</figcaption>
        </figure>
      </article>
      <section class="article-page">
        <div class="article-body">
          <div class="status-note"><strong>Einordnung:</strong> Konzeptioneller Journalbeitrag / Arbeitsfassung, Stand ${publishedLabel}. Autorin: Natalie Weber.</div>
${thesis ? `          <div class="callout">
            ${thesis}
          </div>` : ""}
          ${body}
          <section class="article-sources" id="download-und-weiterfuehrendes">
            <h2>Download &amp; weiterführend <a class="cite-anchor no-print" href="#download-und-weiterfuehrendes" aria-label="Zitierlink zu diesem Abschnitt">#</a></h2>
            <p class="document-action-row">
              <a class="btn btn-primary" href="${base}downloads/wirkungswissenschaften/journalbeitrag-wirkungswissenschaften.pdf">Beitrag als PDF</a>
              <a class="btn btn-secondary" href="${base}dokumente/${DOSSIER_SLUG}/">Ausführliches Dossier</a>
              <a class="btn btn-secondary" href="${base}wirkungswissenschaften/">Grundlagenbereich</a>
              <a class="btn btn-secondary" href="${base}begriffe/">Glossar</a>
            </p>
            <p class="citation-note"><strong>Zitierempfehlung:</strong> Weber, Natalie (2026): Wirkungswissenschaften als neuer Bezugsrahmen. Von der Wirkungsforschung zur Wirkungsökonomie und zur systemischen Architektur von Wirkung. Konzeptioneller Journalbeitrag, Stand ${publishedLabel}.</p>
          </section>
        </div>
      </section>
    </main>
${renderFooter(base)}
    <script src="${base}assets/js/main.js?v=${CSS_VERSION}"></script>
  </body>
</html>
`;
  fs.writeFileSync(path.join(ROOT, `blog/${JOURNAL_SLUG}.html`), html);
  fs.rmSync(path.join(ROOT, `blog/${JOURNAL_SLUG}`), { recursive: true, force: true });
  return { sections: sections.length };
}

function buildDossier() {
  const base = "../../";
  const md = fs.readFileSync(path.join(ROOT, "content/wirkungswissenschaften/dossier.md"), "utf8");
  const fm = frontMatter(parseBlocks(md));
  const { body, sections } = renderBody(fm.body);
  const description = "Grundlagendossier von Natalie Weber: systemische Einordnung von Wirkungswissenschaften, Wirkungsforschung und Wirkungsökonomie – Disziplinenlandkarte, Begriffsarchitektur der Wirkung und Glossarbasis.";
  const extraMeta = `    <meta property="article:published_time" content="2026-07-07">
    <meta property="article:author" content="Natalie Weber">
    <meta property="article:section" content="Wirkungswissenschaften">
`;
  const head = pageHead({
    route: DOSSIER_ROUTE, title: "Dossier Wirkungswissenschaften | Bibliothek der Wirkungsökonomie",
    description, base, section: "Bibliothek", ogType: "article", extraMeta,
    mainAttrs: ` class="reference-work reference-reader workpaper-reader" data-pagefind-body`,
  });
  const thesis = fm.leadBlocks.map((b) => `<p>${inline(b)}</p>`).join("\n            ");
  void sections; void publicationBox; void tableOfContents; void citationBox; void relatedChips;
  const article = `      <article class="article-shell">
        <nav class="breadcrumb"><a href="${base}dokumente/">Dokumente</a> / Dossier</nav>
        <p class="hero-kicker">Dossier · Grundlagendossier · Version 1.0 · Stand 7. Juli 2026</p>
        <h1>${esc(fm.title)}</h1>
        <p class="lead">${esc(fm.subtitle)}</p>
        <div class="document-reader-tools">
          <a class="btn btn-secondary" href="${base}dokumente/">Dokumentenbibliothek</a>
          <a class="btn btn-secondary" href="${base}wirkungswissenschaften/">Grundlagenbereich</a>
          <a class="btn btn-secondary" href="${base}blog/${JOURNAL_SLUG}.html">Journalbeitrag</a>
          <a class="btn btn-secondary" href="${base}begriffe/">Glossar</a>
          <button class="btn btn-secondary" type="button" data-print-page>Drucken</button>
        </div>
        <div class="hero-actions">
          <a class="btn btn-primary" href="${base}downloads/wirkungswissenschaften/dossier-wirkungswissenschaften.pdf">Herunterladen (PDF)</a>
        </div>
${thesis ? `        <section class="callout">
          <h2>Kernthese</h2>
          ${thesis}
        </section>` : ""}
        <aside class="citation-note" role="note">
          <p class="card-kicker">Zitierempfehlung</p>
          <h2>So wird dieses Dossier zitiert</h2>
          <p>Weber, Natalie (2026): Wirkungswissenschaften, Wirkungsforschung und Wirkungsökonomie. Dossier zur systemischen Einordnung, Version 1.0, Stand 7. Juli 2026.</p>
        </aside>
        <section class="live-reference-notice">
          <h2>Versionshinweis</h2>
          <p>Autorin: Natalie Weber · Status: Grundlagenpapier / Arbeitsfassung · Version 1.0 · Stand 7. Juli 2026.</p>
        </section>
        <section class="article-body">
          ${body}
        </section>
      </article>`;
  const out = path.join(ROOT, `dokumente/${DOSSIER_SLUG}/index.html`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, head + "\n" + article + "\n" + pageTail(base));
  return { sections: sections.length };
}

const j = buildJournal();
const d = buildDossier();
console.log(`[wiwi] Journalbeitrag (${j.sections} Sektionen) + Dossier (${d.sections} Sektionen) erzeugt.`);
