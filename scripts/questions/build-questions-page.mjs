import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "assets/data/questions-registry.json");
const navigationPath = path.join(root, "assets/data/navigation.json");
const headerTemplatePath = path.join(root, "templates/header.html");
const footerTemplatePath = path.join(root, "templates/footer.html");
const gapsPath = path.join(root, "docs/questions-related-content-gaps.md");
const sitemapPath = path.join(root, "sitemap.xml");
const outDir = path.join(root, "fragen");
const outFile = path.join(outDir, "index.html");

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const navigation = JSON.parse(fs.readFileSync(navigationPath, "utf8"));
const headerTemplate = fs.readFileSync(headerTemplatePath, "utf8");
const footerTemplate = fs.readFileSync(footerTemplatePath, "utf8");
const siteUrl = "https://wirkungsoekonomie.de";
const contextTargets = new Map([
  ["index.html", ["planwirtschaft", "wirkung-statt-kapital", "esg-unterschied"]],
  ["wirkungsfelder/produkte-konsum/index.html", ["wird-alles-teurer", "wer-entscheidet", "daten-fehlen"]],
  ["werkzeuge/wirkungsumsatzsteuer/index.html", ["wird-alles-teurer", "co2-preis-unterschied", "daten-fehlen"]],
  ["erleben/automatisierungs-wirkungseinkommensrechner/index.html", ["geld-wirkungseinkommen", "bge", "automatisierung-bestrafen"]],
  ["wirkungsfelder/arbeit-einkommen/wirkungseinkommen/index.html", ["geld-wirkungseinkommen", "bge", "arbeit-entwertet"]],
  ["wirkungsfelder/medien-oeffentlichkeit/index.html", ["faktencheck-folgencheck", "zensur", "scanner"]],
  ["anwendungen/scanner.html", ["faktencheck-folgencheck", "zensur", "scanner"]],
  ["akademie.html", ["akademie-kostenlos", "zertifikate", "idgs-wirkungskompetenz"]],
  ["erleben.html", ["tool-demo", "wirkung-messen", "social-credit"]],
  ["werkzeuge/impact-controlling/index.html", ["tool-demo", "wirkung-messen", "esg-unterschied"]],
]);

const questionById = new Map(registry.questions.map((question) => [question.id, question]));
const gaps = [];

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripHash(url) {
  return String(url || "").split("#")[0];
}

function pathForUrl(url) {
  if (!url || /^https?:\/\//.test(url) || url.startsWith("mailto:")) return "";
  const cleanUrl = stripHash(url).replace(/^\//, "");
  if (!cleanUrl) return "index.html";
  if (cleanUrl.endsWith("/")) return `${cleanUrl}index.html`;
  return cleanUrl;
}

function linkExists(url) {
  if (!url || /^https?:\/\//.test(url) || url.startsWith("mailto:")) return true;
  if (url.startsWith("/fragen/#")) return true;
  const candidate = pathForUrl(url);
  return fs.existsSync(path.join(root, candidate));
}

function relationGroup(question, key, label, fallback = []) {
  const items = [...(question.related?.[key] || []), ...fallback];
  const valid = [];
  for (const item of items) {
    if (!item?.url) continue;
    if (linkExists(item.url)) valid.push(item);
    else {
      gaps.push({
        question: question.id,
        label: item.label,
        url: item.url,
        type: key,
      });
    }
  }
  if (!valid.length) return "";
  return `<div class="qa-related-group"><span>${esc(label)}</span>${valid
    .map((item) => `<a href="${esc(item.url)}">${esc(item.label)}</a>`)
    .join("")}</div>`;
}

function ensureMinimumRelations(question) {
  const hasTerm = (question.related?.terms || []).some((item) => linkExists(item.url));
  const hasPage = (question.related?.pages || []).some((item) => linkExists(item.url));
  return {
    terms: hasTerm ? [] : [{ label: "Wirkung", url: "/begriffe/wirkung/" }],
    pages: hasPage ? [] : [{ label: "Modell", url: "/modell.html" }],
  };
}

function relatedBox(question) {
  const fallback = ensureMinimumRelations(question);
  return `<aside class="qa-related" aria-label="Weiterlesen und ausprobieren">
      <h4>Weiterlesen und ausprobieren</h4>
      ${relationGroup(question, "terms", "Begriffe", fallback.terms)}
      ${relationGroup(question, "pages", "Seiten", fallback.pages)}
      ${relationGroup(question, "tools", "Tools")}
      ${relationGroup(question, "documents", "Bibliothek")}
    </aside>`;
}

function questionCard(question, level = "h3", options = {}) {
  const searchText = [
    question.question,
    question.shortAnswer,
    question.longAnswer,
    question.whyItMatters,
    question.limits,
    question.category,
    ...(question.keywords || []),
  ].join(" ");
  const cardId = `${options.idPrefix || ""}${question.id}`;
  const searchAttributes = options.searchable === false
    ? ""
    : ` data-question-card data-category="${esc(question.category)}" data-search="${esc(searchText.toLocaleLowerCase("de"))}"`;
  return `<article class="qa-card" id="${esc(cardId)}"${searchAttributes}>
      <div class="qa-card-head">
        <span class="qa-category">${esc(question.category)}</span>
        <${level}>${esc(question.question)}</${level}>
      </div>
      <p class="qa-short"><strong>Kurzantwort:</strong> ${esc(question.shortAnswer)}</p>
      <details class="qa-details">
        <summary>Ausführliche Antwort lesen</summary>
        <div class="qa-detail-grid">
          <section>
            <h4>Ausführliche Einordnung</h4>
            <p>${esc(question.longAnswer)}</p>
          </section>
          <section>
            <h4>Warum die Frage wichtig ist</h4>
            <p>${esc(question.whyItMatters)}</p>
          </section>
          <section>
            <h4>Grenze / offener Punkt</h4>
            <p>${esc(question.limits)}</p>
          </section>
          ${relatedBox(question)}
        </div>
      </details>
      <p class="qa-anchor"><a href="#${esc(question.id)}">Direktlink zu dieser Frage</a></p>
    </article>`;
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
  return headerTemplate
    .replaceAll("{{BASE}}", base)
    .replace("{{HEADER_NAV}}", navigation.header.map((item) => navLink(item, base)).join("\n    "));
}

function renderFooter(base) {
  return footerTemplate
    .replaceAll("{{BASE}}", base)
    .replace("{{FOOTER_NAV}}", navigation.footerGroups.map((group) => footerGroup(group, base)).join("\n    "))
    .replace("{{FOOTER_LEGAL_NAV}}", (navigation.footerLegal || []).map((item) => navLink(item, base)).join("\n"));
}

function faqJsonLd(topQuestions) {
  return `<script type="application/ld+json">${JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: topQuestions.map((question) => ({
        "@type": "Question",
        name: question.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: question.shortAnswer,
        },
      })),
    },
    null,
    2,
  )}</script>`;
}

function pageShell(body, faqSchema) {
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(registry.title)} - Wirkungsökonomie</title>
    <meta name="description" content="${esc(registry.subline)}">
    <link rel="canonical" href="${siteUrl}/fragen/">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="${esc(registry.title)}">
    <meta property="og:description" content="${esc(registry.subline)}">
    <meta property="og:url" content="${siteUrl}/fragen/">
    <link rel="stylesheet" href="../assets/css/style.css?v=20260527-questions">
    ${faqSchema}
  </head>
  <body>
${renderHeader("../")}
    <main>
${body}
    </main>
${renderFooter("../")}
    <script src="../assets/js/main.js?v=20260525-sprint-2"></script>
    <script>
      (() => {
        const search = document.querySelector("[data-question-search]");
        const cards = Array.from(document.querySelectorAll("[data-question-card]"));
        const chips = Array.from(document.querySelectorAll("[data-question-category]"));
        const status = document.querySelector("[data-question-status]");
        let activeCategory = "Alle";
        function applyFilters() {
          const query = (search?.value || "").trim().toLocaleLowerCase("de");
          let visible = 0;
          for (const card of cards) {
            const categoryMatch = activeCategory === "Alle" || card.dataset.category === activeCategory;
            const searchMatch = !query || (card.dataset.search || "").includes(query);
            const show = categoryMatch && searchMatch;
            card.hidden = !show;
            if (show) visible += 1;
          }
          if (status) status.textContent = visible + " Fragen sichtbar";
        }
        search?.addEventListener("input", applyFilters);
        for (const chip of chips) {
          chip.addEventListener("click", () => {
            activeCategory = chip.dataset.questionCategory || "Alle";
            chips.forEach((item) => item.classList.toggle("active", item === chip));
            applyFilters();
          });
        }
        document.querySelector("[data-open-all]")?.addEventListener("click", () => {
          document.querySelectorAll(".qa-details").forEach((details) => details.open = true);
        });
        document.querySelector("[data-close-all]")?.addEventListener("click", () => {
          document.querySelectorAll(".qa-details").forEach((details) => details.open = false);
        });
        applyFilters();
      })();
    </script>
  </body>
</html>
`;
}

function buildPage() {
  const questions = [...registry.questions].sort((a, b) => Number(a.priority || 100) - Number(b.priority || 100));
  const top = questions.slice(0, 12);
  const chips = ["Alle", ...registry.categories];
  const body = `
      <section class="hero questions-hero">
        <div>
          <p class="hero-kicker">Fragen & Einwände</p>
          <h1 class="hero-title">${esc(registry.title)}</h1>
          <p class="hero-subtitle">${esc(registry.intro)}</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="#top-fragen">Schnellstart ansehen</a>
            <a class="btn btn-secondary" href="#alle-fragen">Alle Fragen ansehen</a>
          </div>
        </div>
      </section>

      <section class="section" id="top-fragen">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Schnellstart</p>
            <h2>Die 12 wichtigsten Fragen</h2>
            <p>Die Kurzantwort ist sofort sichtbar. Die Einordnung klappt dort auf, wo mehr Kontext nötig ist.</p>
          </div>
          <div class="qa-top-grid">
            ${top.map((question) => questionCard(question, "h3", { idPrefix: "top-", searchable: false })).join("\n")}
          </div>
        </div>
      </section>

      <section class="section section-muted" id="alle-fragen">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Frage suchen</p>
            <h2>Antworten nach Thema filtern.</h2>
          </div>
          <div class="qa-controls">
            <label class="qa-search">
              <span>Frage oder Stichwort suchen</span>
              <input type="search" placeholder="z. B. Planwirtschaft, Social Credit, Bürokratie, ESG" data-question-search>
            </label>
            <div class="qa-chip-row" aria-label="Kategorien">
              ${chips.map((category, index) => `<button class="pill ${index === 0 ? "active" : ""}" type="button" data-question-category="${esc(category)}">${esc(category)}</button>`).join("")}
            </div>
            <div class="qa-control-actions">
              <button class="btn btn-secondary" type="button" data-open-all>Alle öffnen</button>
              <button class="btn btn-secondary" type="button" data-close-all>Alle schließen</button>
              <p class="download-filter-status" data-question-status aria-live="polite"></p>
            </div>
          </div>
          <div class="qa-list">
            ${questions.map((question) => questionCard(question)).join("\n")}
          </div>
        </div>
      </section>

      <section class="section" id="kritik">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Kritik</p>
            <h2>Berechtigte Kritik und offene Punkte</h2>
            <p>Die Wirkungsökonomie ist kein fertiger perfekter Apparat. Sie ist eine lernende Architektur. Deshalb gehören Kritik, Unsicherheit und Grenzen ausdrücklich dazu.</p>
          </div>
          <div class="qa-criticism-grid">
            ${(registry.criticism || []).map((item) => `<article class="card compact"><h3>${esc(item.title)}</h3><p>${esc(item.answer)}</p></article>`).join("\n")}
          </div>
        </div>
      </section>

      <section class="section section-muted">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Weitergehen</p>
            <h2>Vertiefung nach deinem Einstiegspunkt.</h2>
          </div>
          <div class="library-overview-grid">
            <a class="library-overview-card" href="../wirkungsoekonomie.html"><span>Start</span><strong>In 5 Minuten verstehen</strong><em>Der kurze Einstieg in Wirkung, Preise und neue Maßstäbe.</em></a>
            <a class="library-overview-card" href="../kompass.html"><span>Orientierung</span><strong>WÖk-Kompass</strong><em>Fragen beantworten und passenden Einstieg finden.</em></a>
            <a class="library-overview-card" href="../wirkungsfelder/"><span>Anwendung</span><strong>Wirkungsfelder</strong><em>Bildung, Gesundheit, Arbeit, Produkte, Wohnen, Medien und mehr.</em></a>
            <a class="library-overview-card" href="../erleben.html"><span>Tools</span><strong>Ausprobieren</strong><em>Demos, Rechner und Scanner mit klaren Grenzen.</em></a>
            <a class="library-overview-card" href="../begriffe/"><span>Lernen</span><strong>Begriffe</strong><em>Zentrale Begriffe als Lernseiten.</em></a>
            <a class="library-overview-card" href="../downloads.html"><span>Material</span><strong>Bibliothek</strong><em>Onlinefassungen, PDFs und Ausarbeitungen.</em></a>
            <a class="library-overview-card" href="../akademie.html"><span>Kompetenz</span><strong>Akademie</strong><em>Wirkungskompetenz aufbauen.</em></a>
            <a class="library-overview-card" href="../mitmachen.html"><span>Kontakt</span><strong>Mitmachen</strong><em>Feedback, Pilotideen und fachliche Hinweise einbringen.</em></a>
          </div>
        </div>
      </section>`;
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, pageShell(body, faqJsonLd(top)).replace(/[ \t]+$/gm, ""));
}

function contextBlock(ids) {
  const questions = ids.map((id) => questionById.get(id)).filter(Boolean);
  if (!questions.length) return "";
  return `<!-- related-questions:start -->
<section class="related-questions-block" aria-labelledby="related-questions-title">
  <div>
    <p class="hero-kicker">Fragen & Einwände</p>
    <h2 id="related-questions-title">Häufige Fragen zu diesem Thema</h2>
    <div class="related-questions-grid">
      ${questions.map((question) => `<a class="related-question-card" href="/fragen/#${esc(question.id)}"><span>${esc(question.category)}</span><strong>${esc(question.question)}</strong><em>${esc(question.shortAnswer)}</em></a>`).join("\n      ")}
    </div>
    <p><a class="text-link" href="/fragen/">Alle Fragen und Einwände lesen</a></p>
  </div>
</section>
<!-- related-questions:end -->`;
}

function applyContextBlocks() {
  for (const [target, ids] of contextTargets) {
    const file = path.join(root, target);
    if (!fs.existsSync(file)) {
      gaps.push({ question: "context-block", label: target, url: `/${target}`, type: "missing-page" });
      continue;
    }
    const block = contextBlock(ids);
    let html = fs.readFileSync(file, "utf8");
    html = html.replace(/\n?<!-- related-questions:start -->[\s\S]*?<!-- related-questions:end -->\n?/g, "\n");
    if (html.includes("</main>")) html = html.replace("</main>", `${block}\n</main>`);
    else html = html.replace("</body>", `${block}\n</body>`);
    html = html.replace(/[ \t]+$/gm, "");
    fs.writeFileSync(file, html);
  }
}

function writeGaps() {
  const grouped = new Map();
  for (const gap of gaps) {
    const key = `${gap.type}:${gap.url}`;
    if (!grouped.has(key)) grouped.set(key, { ...gap, questions: new Set() });
    grouped.get(key).questions.add(gap.question);
  }
  const unique = Array.from(grouped.values());
  const rows = unique.length
    ? unique.map((gap) => `| ${esc(gap.type)} | ${esc(gap.label)} | \`${esc(gap.url)}\` | ${esc(Array.from(gap.questions).join(", "))} | ${gap.url.includes("maschinenwertschoepfungsbeitrag") || gap.url.includes("folgencheck-faktencheck") ? "hoch" : "mittel"} |`).join("\n")
    : "| - | Keine Lücken gefunden | - | - | - |";
  fs.writeFileSync(gapsPath, `# Fragenbereich: Related-Content-Gaps

Stand: 2026-05-27

Diese Liste wird aus \`assets/data/questions-registry.json\` erzeugt. Sie enthält Verlinkungen, deren Ziel noch nicht als öffentliche Seite existiert oder für die ein eigener Ausbau sinnvoll ist.

| Typ | Fehlender Inhalt | Empfohlene URL | Frage / Kontext | Priorität |
| --- | --- | --- | --- | --- |
${rows}
`);
}

function updateSitemap() {
  if (!fs.existsSync(sitemapPath)) return;
  const loc = `${siteUrl}/fragen/`;
  let sitemap = fs.readFileSync(sitemapPath, "utf8");
  sitemap = sitemap.replace(new RegExp(`\\s*<url>\\s*<loc>${loc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</loc>\\s*<lastmod>[^<]+</lastmod>\\s*</url>`, "g"), "");
  sitemap = sitemap.replace("</urlset>", `  <url><loc>${loc}</loc><lastmod>2026-05-27</lastmod></url>\n</urlset>`);
  fs.writeFileSync(sitemapPath, sitemap, "utf8");
}

buildPage();
applyContextBlocks();
writeGaps();
updateSitemap();
console.log(`Questions page built: ${registry.questions.length} questions -> fragen/index.html`);
