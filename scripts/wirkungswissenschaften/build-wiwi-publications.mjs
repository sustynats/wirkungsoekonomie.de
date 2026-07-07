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
  const flush = () => {
    if (listBuf.length) { html.push(`<ul>${listBuf.map((li) => `<li>${inline(li)}</li>`).join("")}</ul>`); listBuf = []; }
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
    const li = b.match(/^[-•]\s+(.*)$/s);
    if (li) { listBuf.push(li[1].replace(/\s*\n[-•]\s+/g, " ").trim()); continue; }
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

function pageHead({ route, title, description, base, section, ogType, extraMeta = "" }) {
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
    <main>`;
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
const JOURNAL_ROUTE = `/blog/${JOURNAL_SLUG}/`;
const DOSSIER_ROUTE = `/dokumente/${DOSSIER_SLUG}/`;

function publicationBox({ base, self }) {
  const dossierBtn = self === "dossier"
    ? ""
    : `<a class="btn btn-secondary" href="${base}dokumente/${DOSSIER_SLUG}/">Dossier lesen</a>`;
  const journalBtn = self === "journal"
    ? ""
    : `<a class="btn btn-secondary" href="${base}blog/${JOURNAL_SLUG}/">Journalbeitrag lesen</a>`;
  const dl = self === "dossier"
    ? `<a class="btn btn-primary" href="${base}downloads/wirkungswissenschaften/dossier-wirkungswissenschaften.pdf">PDF herunterladen</a>
            <a class="btn btn-ghost" href="${base}downloads/wirkungswissenschaften/dossier-wirkungswissenschaften.docx">Word (Arbeitsfassung)</a>`
    : `<a class="btn btn-primary" href="${base}downloads/wirkungswissenschaften/journalbeitrag-wirkungswissenschaften.pdf">PDF herunterladen</a>
            <a class="btn btn-ghost" href="${base}downloads/wirkungswissenschaften/journalbeitrag-wirkungswissenschaften.docx">Word (Arbeitsfassung)</a>`;
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
  const base = "../../";
  const md = fs.readFileSync(path.join(ROOT, "content/wirkungswissenschaften/journal.md"), "utf8");
  void HUB;
  const fm = frontMatter(parseBlocks(md));
  const { body, sections } = renderBody(fm.body);
  const description = "Konzeptioneller Journalbeitrag von Natalie Weber: Wirkungswissenschaften als neuer Dachrahmen, Wirkungsforschung als methodische Teildisziplin und die Wirkungsökonomie als erste ausgearbeitete Ordnungsdisziplin.";
  const extraMeta = `    <meta property="article:published_time" content="2026-07-07">
    <meta property="article:author" content="Natalie Weber">
    <meta property="article:section" content="Wirkungswissenschaften">
    <meta property="article:tag" content="Wirkungswissenschaften">
    <meta property="article:tag" content="Wirkungsforschung">
    <meta property="article:tag" content="Wirkungsökonomie">
`;
  const head = pageHead({
    route: JOURNAL_ROUTE, title: "Wirkungswissenschaften als neuer Bezugsrahmen | Journal der Wirkungsökonomie",
    description, base, section: "Journal", ogType: "article", extraMeta,
  });
  const lead = fm.leadBlocks[0] || fm.subtitle;
  const thesis = fm.leadBlocks.slice(1).map((b) => `<p>${inline(b)}</p>`).join("\n            ");
  const article = `      <article class="article-shell">
        <nav class="breadcrumb"><a href="${base}index.html">Start</a> / <a href="${base}journal/">Journal</a> / <a href="${base}wirkungswissenschaften/">Wirkungswissenschaften</a></nav>
        <header class="term-detail-hero">
          <p class="hero-kicker">Journal · Grundlagenbeitrag</p>
          <h1>${esc(fm.title)}</h1>
          <p class="lead">${esc(fm.subtitle)}</p>
          <div class="term-meta-row" aria-label="Artikelstatus">
            <span>Konzeptioneller Journalbeitrag</span>
            <span>Autorin: Natalie Weber</span>
            <span>Stand 7. Juli 2026</span>
            <span>Arbeitsfassung</span>
          </div>
        </header>
${thesis ? `        <section class="term-summary-card"><p class="section-eyebrow">Kurzthese</p>\n            ${thesis}\n        </section>` : ""}
${tableOfContents(sections, base)}
        <section class="term-prose">
          ${body}
        </section>
${citationBox("Weber, Natalie (2026): Wirkungswissenschaften als neuer Bezugsrahmen. Von der Wirkungsforschung zur Wirkungsökonomie und zur systemischen Architektur von Wirkung. Konzeptioneller Journalbeitrag, Stand 7. Juli 2026.")}
${publicationBox({ base, self: "journal" })}
${relatedChips(base)}
      </article>`;
  const out = path.join(ROOT, `blog/${JOURNAL_SLUG}/index.html`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, head + "\n" + article + "\n" + pageTail(base));
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
  });
  const thesis = fm.leadBlocks.map((b) => `<p>${inline(b)}</p>`).join("\n            ");
  const article = `      <article class="article-shell">
        <nav class="breadcrumb"><a href="${base}index.html">Start</a> / <a href="${base}bibliothek/">Bibliothek</a> / <a href="${base}wirkungswissenschaften/">Wirkungswissenschaften</a></nav>
        <header class="term-detail-hero">
          <p class="hero-kicker">Grundlagendossier</p>
          <h1>${esc(fm.title)}</h1>
          <p class="lead">${esc(fm.subtitle)}</p>
          <div class="term-meta-row" aria-label="Dokumentstatus">
            <span>Dossier</span>
            <span>Autorin: Natalie Weber</span>
            <span>Version 1.0 · Stand 7. Juli 2026</span>
            <span>Arbeitsfassung</span>
          </div>
        </header>
${thesis ? `        <section class="term-summary-card"><p class="section-eyebrow">Kernthese</p>\n            ${thesis}\n        </section>` : ""}
${publicationBox({ base, self: "dossier" })}
${tableOfContents(sections, base)}
        <section class="term-prose">
          ${body}
        </section>
${citationBox("Weber, Natalie (2026): Wirkungswissenschaften, Wirkungsforschung und Wirkungsökonomie. Dossier zur systemischen Einordnung, Version 1.0, Stand 7. Juli 2026.")}
${relatedChips(base)}
      </article>`;
  const out = path.join(ROOT, `dokumente/${DOSSIER_SLUG}/index.html`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, head + "\n" + article + "\n" + pageTail(base));
  return { sections: sections.length };
}

const j = buildJournal();
const d = buildDossier();
console.log(`[wiwi] Journalbeitrag (${j.sections} Sektionen) + Dossier (${d.sections} Sektionen) erzeugt.`);
