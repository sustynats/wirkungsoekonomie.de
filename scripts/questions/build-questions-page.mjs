import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "assets/data/questions-registry.json");
const navigationPath = path.join(root, "assets/data/navigation.json");
const headerTemplatePath = path.join(root, "templates/header.html");
const footerTemplatePath = path.join(root, "templates/footer.html");
const gapsPath = path.join(root, "docs/questions-related-content-gaps.md");
const distributionAuditPath = path.join(root, "docs/questions-distribution-audit.md");
const sitemapPath = path.join(root, "sitemap.xml");
const outDir = path.join(root, "fragen");
const outFile = path.join(outDir, "index.html");

const registryRaw = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const navigation = JSON.parse(fs.readFileSync(navigationPath, "utf8"));
const headerTemplate = fs.readFileSync(headerTemplatePath, "utf8");
const footerTemplate = fs.readFileSync(footerTemplatePath, "utf8");
const siteUrl = "https://wirkungsoekonomie.de";
const questionSubmitBaseUrl = "https://akademie.wirkungsoekonomie.de/fragen/einreichen";
const gaps = [];
const distributionRows = [];

const routeDefaults = new Map([
  ["/", { questionsInclude: ["planwirtschaft", "social-credit", "esg-unterschied"], questionsMax: 3 }],
  ["/wirkungsfelder/produkte-konsum/", { questionsInclude: ["wird-alles-teurer", "wer-entscheidet", "daten-fehlen"], questionsMax: 5 }],
  ["/werkzeuge/wirkungsumsatzsteuer/", { questionsInclude: ["wird-alles-teurer", "co2-preis-unterschied", "daten-fehlen"], questionsMax: 5 }],
  ["/erleben/automatisierungs-wirkungseinkommensrechner/", { questionsInclude: ["geld-wirkungseinkommen", "bge", "automatisierung-bestrafen", "tool-demo"], questionsMax: 5 }],
  ["/wirkungsfelder/arbeit-einkommen/wirkungseinkommen/", { questionsInclude: ["geld-wirkungseinkommen", "bge", "arbeit-entwertet"], questionsMax: 5 }],
  ["/wirkungsfelder/medien-oeffentlichkeit/", { questionsInclude: ["faktencheck-folgencheck", "zensur", "scanner"], questionsMax: 5 }],
  ["/anwendungen/scanner.html", { questionsInclude: ["faktencheck-folgencheck", "zensur", "scanner", "tool-demo"], questionsMax: 5 }],
  ["/akademie.html", { questionsInclude: ["akademie-kostenlos", "zertifikate", "idgs-wirkungskompetenz"], questionsMax: 4 }],
  ["/erleben.html", { questionsInclude: ["tool-demo", "wirkung-messen", "social-credit"], questionsMax: 4 }],
  ["/erleben/", { questionsInclude: ["tool-demo", "wirkung-messen", "social-credit"], questionsMax: 4 }],
  ["/blog.html", { questionsInclude: ["faktencheck-folgencheck", "zensur", "wirkung-messen"], questionsMax: 3 }],
  ["/werkzeuge/impact-controlling/", { questionsInclude: ["tool-demo", "wirkung-messen", "esg-unterschied", "greenwashing"], questionsMax: 5 }],
]);

const relationKeys = [
  ["terms", "relatedTerms", "Begriffe"],
  ["pages", "relatedPages", "Seiten"],
  ["tools", "relatedTools", "Tools"],
  ["documents", "relatedDocuments", "Bibliothek"],
];

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function contextTypeForPage(pageType, route) {
  if (route === "/fragen/") return "Fragen & Einwände";
  if (route === "/") return "Startseite";
  if (pageType === "begriff") return "Begriff / Glossar";
  if (pageType === "wirkungsfeld" || String(route || "").startsWith("/wirkungsfelder/")) return "Wirkungsfeld";
  if (pageType === "tool") return "Tool / Rechner";
  if (pageType === "journal") return "Journal-Artikel";
  if (pageType === "akademie") return "Akademie";
  if (pageType === "bibliothek" || String(route || "").startsWith("/downloads")) return "Bibliothek / Dokument";
  return "Allgemein";
}

function submitQuestionUrl(context) {
  const route = normalizeRoute(context.route || "/fragen/");
  const params = new URLSearchParams({
    context: context.contextType || contextTypeForPage(context.pageType, route),
    url: `${siteUrl}${route}`,
    title: context.title || registry.title,
    topic: context.topic || context.topics?.[0] || toToken(context.title || route || "fragen"),
    pageType: context.pageType || "questions-hub",
  });
  return `${questionSubmitBaseUrl}?${params.toString()}`;
}

function stripHash(url) {
  return String(url || "").split("#")[0].split("?")[0];
}

function normalizeRoute(route) {
  if (!route) return "";
  let clean = stripHash(String(route).replace(/^https?:\/\/wirkungsoekonomie\.de/, ""));
  if (!clean.startsWith("/")) clean = `/${clean}`;
  if (clean === "/index.html") return "/";
  if (clean.endsWith("/index.html")) clean = clean.slice(0, -"index.html".length);
  return clean;
}

function routeForFile(relativeFile) {
  const rel = relativeFile.replaceAll(path.sep, "/");
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"index.html".length)}`;
  return `/${rel}`;
}

function pathForUrl(url) {
  if (!url || /^https?:\/\//.test(url) || url.startsWith("mailto:") || url.startsWith("tel:")) return "";
  const cleanUrl = stripHash(url).replace(/^\//, "");
  if (!cleanUrl) return "index.html";
  if (cleanUrl.endsWith("/")) return `${cleanUrl}index.html`;
  return cleanUrl;
}

function linkExists(url) {
  if (!url || /^https?:\/\//.test(url) || url.startsWith("mailto:") || url.startsWith("tel:")) return true;
  if (url.startsWith("/fragen/#")) return true;
  const candidate = pathForUrl(url);
  return fs.existsSync(path.join(root, candidate));
}

function toToken(value) {
  return String(value || "")
    .toLocaleLowerCase("de")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function tokenizeText(value) {
  return String(value || "")
    .split(/[^A-Za-z0-9ÄÖÜäöüß+]+/u)
    .map(toToken)
    .filter((token) => token.length > 2);
}

function unique(values) {
  return [...new Set((values || []).filter(Boolean).map((value) => String(value).trim()).filter(Boolean))];
}

function relationItems(question, key, topKey) {
  const items = [...(question.related?.[key] || []), ...(question[topKey] || [])]
    .map((item) => {
      if (typeof item === "string") return { label: item, url: item.startsWith("/") ? item : `/begriffe/${toToken(item)}/` };
      return item;
    })
    .filter((item) => item?.label && item?.url);
  return items.filter((item, index) => items.findIndex((other) => other.url === item.url && other.label === item.label) === index);
}

function normalizeQuestion(question) {
  const normalized = {
    ...question,
    status: question.status || "published",
    priority: Number(question.priority || 100),
    misconceptions: question.misconceptions || [],
    relatedQuestions: question.relatedQuestions || [],
    topics: unique(question.topics || []),
    terms: unique(question.terms || []),
    audiences: unique(question.audiences || []),
    pageTypes: unique(question.pageTypes || []),
    includeRoutes: unique((question.includeRoutes || question.showOnPages || []).map(normalizeRoute)),
    excludeRoutes: unique((question.excludeRoutes || []).map(normalizeRoute)),
    journalTopics: unique(question.journalTopics || question.topics || []),
    triggerWords: unique(question.triggerWords || question.keywords || []),
    schemaEligible: question.schemaEligible !== false,
    showAs: unique(question.showAs || ["faq-hub", "context-block"]),
    updatedAt: question.updatedAt || "2026-05-27",
  };
  const related = {
    terms: relationItems(normalized, "terms", "relatedTerms"),
    pages: relationItems(normalized, "pages", "relatedPages"),
    tools: relationItems(normalized, "tools", "relatedTools"),
    documents: relationItems(normalized, "documents", "relatedDocuments"),
  };
  return {
    ...normalized,
    related,
    relatedTerms: related.terms,
    relatedPages: related.pages,
    relatedTools: related.tools,
    relatedDocuments: related.documents,
  };
}

const registry = {
  ...registryRaw,
  questions: (registryRaw.questions || []).map(normalizeQuestion),
};
const questionById = new Map(registry.questions.map((question) => [question.id, question]));

function relationGroup(question, key, label, fallback = []) {
  const topKey = key === "terms" ? "relatedTerms" : key === "pages" ? "relatedPages" : key === "tools" ? "relatedTools" : "relatedDocuments";
  const items = [...relationItems(question, key, topKey), ...fallback];
  const valid = [];
  for (const item of items) {
    if (!item?.url) continue;
    if (linkExists(item.url)) valid.push(item);
    else gaps.push({ question: question.id, label: item.label, url: item.url, type: key });
  }
  const uniqueValid = valid.filter((item, index) => valid.findIndex((other) => other.url === item.url && other.label === item.label) === index);
  if (!uniqueValid.length) return "";
  return `<div class="qa-related-group"><span>${esc(label)}</span>${uniqueValid
    .map((item) => `<a href="${esc(item.url)}">${esc(item.label)}</a>`)
    .join("")}</div>`;
}

function collectQuestionLinkGaps() {
  for (const question of registry.questions) {
    for (const [key, topKey] of relationKeys) {
      for (const item of relationItems(question, key, topKey)) {
        if (!linkExists(item.url)) gaps.push({ question: question.id, label: item.label, url: item.url, type: key });
      }
    }
  }
}

function ensureMinimumRelations(question) {
  const hasTerm = relationItems(question, "terms", "relatedTerms").some((item) => linkExists(item.url));
  const hasPage = relationItems(question, "pages", "relatedPages").some((item) => linkExists(item.url));
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
    ...(question.topics || []),
    ...(question.terms || []),
    ...(question.triggerWords || []),
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
      mainEntity: topQuestions
        .filter((question) => question.schemaEligible !== false)
        .map((question) => ({
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
  const submitUrl = submitQuestionUrl({
    route: "/fragen/",
    title: registry.title,
    topic: "fragen-einwaende",
    pageType: "questions-hub",
    contextType: "Fragen & Einwände",
  });
  const body = `
      <section class="hero questions-hero">
        <div>
          <p class="hero-kicker">Fragen & Einwände</p>
          <h1 class="hero-title">${esc(registry.title)}</h1>
          <p class="hero-subtitle">${esc(registry.intro)}</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="#top-fragen">Schnellstart ansehen</a>
            <a class="btn btn-secondary" href="#alle-fragen">Alle Fragen ansehen</a>
            <a class="btn btn-secondary" href="${esc(submitUrl)}">Eigene Frage einreichen</a>
          </div>
        </div>
      </section>

      <section class="section section-muted" aria-labelledby="frage-einreichen-title">
        <div class="section-header">
          <p class="hero-kicker">Mitdenken</p>
          <h2 id="frage-einreichen-title">Eine Frage fehlt?</h2>
          <p>Fragen werden im Akademie-Lernraum eingereicht, redaktionell geprüft und können später anonym in diesen öffentlichen Bereich zurückgespielt werden.</p>
        </div>
        <div class="card">
          <h3 class="card-title">Öffentlich anonym, intern moderierbar.</h3>
          <p class="card-text">Zur Einreichung nutzt du einen Discord-Login. Du musst keinem Discord-Server beitreten. Die Frage-Funktion ist nicht an eine Akademie-Freischaltung gekoppelt. Öffentlich erscheinen später nur die Frage und Antwort - ohne Namen, Profil oder Discord-ID.</p>
          <a class="btn btn-primary" href="${esc(submitUrl)}">Frage einreichen</a>
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

function stripQuestionBlocks(html) {
  return html
    .replace(/\n?<!-- related-questions:start -->[\s\S]*?<!-- related-questions:end -->\n?/g, "\n")
    .replace(/\n?<!-- inline-question:start -->[\s\S]*?<!-- inline-question:end -->\n?/g, "\n");
}

function blockTitleForPage(context) {
  const pageType = context.pageType;
  if (pageType === "tool") return "Fragen zu dieser Demo";
  if (pageType === "journal" && context.isJournalArticle) return "Fragen zu diesem Artikel";
  if (pageType === "journal") return "Einwände und Fragen aus dem Journal";
  if (pageType === "detailkonzept" || pageType === "dossier") return "Einwände, die hier oft auftauchen";
  if (pageType === "begriff") return "Was Nutzer:innen dazu wissen wollen";
  if (pageType === "akademie") return "Fragen zur Akademie";
  return "Häufige Fragen zu diesem Thema";
}

function contextBlock(matches, context) {
  if (!matches.length) return "";
  const titleId = `related-questions-title-${toToken(context.route || context.file) || "seite"}`;
  const submitUrl = submitQuestionUrl(context);
  return `<!-- related-questions:start -->
<section class="related-questions-block related-questions-${esc(context.pageType)}" aria-labelledby="${esc(titleId)}">
  <div>
    <p class="hero-kicker">Fragen & Einwände</p>
    <h2 id="${esc(titleId)}">${esc(blockTitleForPage(context))}</h2>
    <div class="related-questions-grid">
      ${matches.map(({ question }) => `<a class="related-question-card" href="/fragen/#${esc(question.id)}"><span>${esc(question.category)}</span><strong>${esc(question.question)}</strong><em>${esc(question.shortAnswer)}</em></a>`).join("\n      ")}
    </div>
    <p><a class="text-link" href="/fragen/">Alle Fragen und Einwände lesen</a> | <a class="text-link" href="${esc(submitUrl)}">Frage zu diesem Thema einreichen</a></p>
  </div>
</section>
<!-- related-questions:end -->`;
}

function inlineQuestionCallout(match) {
  if (!match?.question) return "";
  const question = match.question;
  return `<!-- inline-question:start -->
<aside class="article-inline-question" aria-label="Einwand zum Artikel">
  <p class="hero-kicker">Einwand dazu</p>
  <h3>${esc(question.question)}</h3>
  <p>${esc(question.shortAnswer)}</p>
  <a class="text-link" href="/fragen/#${esc(question.id)}">Ausführliche Antwort lesen</a>
</aside>
<!-- inline-question:end -->`;
}

function insertBeforeClose(html, block) {
  if (!block) return html;
  if (html.includes("</main>")) return html.replace("</main>", `${block}\n</main>`);
  return html.replace("</body>", `${block}\n</body>`);
}

function insertJournalInline(html, block) {
  if (!block) return html;
  const mainStart = html.search(/<main\b/i);
  const mainEnd = html.search(/<\/main>/i);
  if (mainStart === -1 || mainEnd === -1 || mainEnd <= mainStart) return insertBeforeClose(html, block);
  const main = html.slice(mainStart, mainEnd);
  const paragraphEnds = [...main.matchAll(/<\/p>/gi)].map((match) => mainStart + match.index + match[0].length);
  if (paragraphEnds.length < 8) return html;
  const insertAt = paragraphEnds[Math.floor(paragraphEnds.length * 0.55)];
  return `${html.slice(0, insertAt)}\n${block}\n${html.slice(insertAt)}`;
}

function decodeEntities(value) {
  return String(value || "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function plainText(html) {
  return decodeEntities(
    String(html || "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function extractTitle(html) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  return plainText(h1 || title || "");
}

function extractMetaKeywords(html) {
  const content = html.match(/<meta[^>]+name=["']keywords["'][^>]+content=["']([^"']+)["']/i)?.[1] || "";
  return tokenizeText(content);
}

function extractLinkedTerms(html) {
  return [...String(html || "").matchAll(/href=["'][^"']*\/begriffe\/([^/#?"']+)\/?[^"']*["']/g)]
    .map((match) => match[1])
    .filter(Boolean);
}

function extractQuestionMeta(html) {
  const blocks = [];
  const script = html.match(/<script[^>]+type=["']application\/json["'][^>]+data-questions-meta[^>]*>([\s\S]*?)<\/script>/i)?.[1];
  if (script) blocks.push(script);
  const comment = html.match(/<!--\s*questions-meta:\s*({[\s\S]*?})\s*-->/i)?.[1];
  if (comment) blocks.push(comment);
  const merged = {};
  for (const block of blocks) {
    try {
      Object.assign(merged, JSON.parse(block));
    } catch {
      // Invalid page-local metadata is ignored and surfaced through missing matches rather than breaking the site build.
    }
  }
  return merged;
}

function inferPageType(relativeFile) {
  const rel = relativeFile.replaceAll(path.sep, "/");
  if (rel === "index.html" || rel === "wirkungsoekonomie.html" || rel === "anwendungen.html") return "landing";
  if (rel === "akademie.html") return "akademie";
  if (rel === "kompass.html") return "kompass";
  if (rel === "downloads.html" || rel.startsWith("bibliothek/")) return "bibliothek";
  if (rel === "blog.html" || rel.startsWith("blog/")) return "journal";
  if (rel.startsWith("begriffe/") && rel !== "begriffe/index.html") return "begriff";
  if (rel.startsWith("werkzeuge/") || rel.startsWith("erleben/") || rel.startsWith("anwendungen/")) return "tool";
  if (rel.startsWith("fuer/")) return "usecase";
  if (rel.includes("/dossier") || rel.includes("/dossiers/")) return "dossier";
  if (rel.includes("/detailkonzepte/")) return "detailkonzept";
  if (rel.startsWith("wirkungsfelder/")) {
    const parts = rel.split("/");
    return parts.length <= 3 && rel.endsWith("/index.html") ? "wirkungsfeld" : "detailkonzept";
  }
  if (rel.startsWith("ordnung/") || rel.startsWith("wissen/") || rel.startsWith("werkstatt/")) return "methode";
  return "landing";
}

function inferAudience(relativeFile, html) {
  const rel = relativeFile.replaceAll(path.sep, "/");
  const text = `${rel} ${plainText(html).slice(0, 5000)}`.toLocaleLowerCase("de");
  const audiences = [];
  const pairs = [
    ["journalismus", /journalismus|medien|redaktion|öffentlichkeit/],
    ["politik", /politik|parteien|gesetz|regierung|parlament/],
    ["verwaltung", /verwaltung|kommune|kommunal|ministerium/],
    ["unternehmen", /unternehmen|wirtschaft|kmu|betrieb|management/],
    ["buerger", /bürger|buerger|verbraucher|konsument|alltag/],
    ["wissenschaft", /wissenschaft|forschung|akademie|studium/],
  ];
  for (const [audience, pattern] of pairs) {
    if (pattern.test(text)) audiences.push(audience);
  }
  return unique(audiences);
}

function pageMax(context) {
  const explicit = Number(context.meta.questionsMax || 0);
  if (explicit > 0) return explicit;
  if (context.route === "/") return 3;
  if (context.pageType === "journal") return context.text.length > 12000 ? 5 : 3;
  if (context.pageType === "dossier") return 8;
  if (context.pageType === "detailkonzept") return 6;
  if (context.pageType === "wirkungsfeld" || context.pageType === "tool") return 5;
  if (context.pageType === "bibliothek" || context.pageType === "begriff") return 4;
  return 3;
}

function inferPageContext(relativeFile, html) {
  const route = routeForFile(relativeFile);
  const meta = { ...(routeDefaults.get(route) || {}), ...extractQuestionMeta(html) };
  const title = extractTitle(html);
  const text = plainText(html);
  const pathTokens = tokenizeText(relativeFile.replace(/\.html$/, "").replace(/index$/, ""));
  const titleTokens = tokenizeText(title);
  const linkedTerms = extractLinkedTerms(html);
  const pageType = meta.pageType || inferPageType(relativeFile);
  const isJournalArticle = pageType === "journal" && /class=["'][^"']*\barticle-body\b/i.test(html);
  const audience = unique([...(meta.audience || meta.audiences || []), ...inferAudience(relativeFile, html)]);
  const topics = unique([...(meta.topics || []), ...pathTokens, ...titleTokens.slice(0, 10)]);
  const terms = unique([...(meta.terms || []), ...linkedTerms, ...pathTokens]);
  const journalTopics = unique([...(meta.journalTopics || []), ...(pageType === "journal" ? [...topics, ...extractMetaKeywords(html)] : [])]);
  return {
    file: relativeFile.replaceAll(path.sep, "/"),
    route,
    title,
    text,
    textLower: text.toLocaleLowerCase("de"),
    pageType,
    isJournalArticle,
    topics,
    terms,
    audience,
    journalTopics,
    meta: {
      ...meta,
      questionsInclude: unique(meta.questionsInclude || []),
      questionsExclude: unique(meta.questionsExclude || []),
      questionsMax: pageMax({ route, pageType, text, meta }),
    },
  };
}

function intersect(a, b) {
  const bSet = new Set((b || []).map(toToken));
  return unique((a || []).map(toToken).filter((item) => bSet.has(item)));
}

function routeMatches(routes, route) {
  return (routes || []).map(normalizeRoute).includes(route);
}

function scoreQuestionForPage(question, context) {
  if (question.status !== "published") return null;
  if (routeMatches(question.excludeRoutes, context.route)) return null;
  if (context.meta.questionsExclude.includes(question.id)) return null;

  let score = 0;
  const reasons = [];
  const manualIndex = context.meta.questionsInclude.indexOf(question.id);
  if (manualIndex >= 0) {
    score += 100;
    reasons.push("manual include");
  }
  if (routeMatches(question.includeRoutes, context.route)) {
    score += 100;
    reasons.push("includeRoutes exact match");
  }
  if ((question.pageTypes || []).includes(context.pageType)) {
    score += 15;
    reasons.push(`pageType:${context.pageType}`);
  }
  const termMatches = intersect(question.terms, context.terms);
  if (termMatches.length) {
    score += termMatches.length * 30;
    reasons.push(`terms:${termMatches.slice(0, 5).join(",")}`);
  }
  const topicMatches = intersect(question.topics, context.topics);
  if (topicMatches.length) {
    score += topicMatches.length * 20;
    reasons.push(`topics:${topicMatches.slice(0, 5).join(",")}`);
  }
  const audienceMatches = intersect(question.audiences, context.audience);
  if (audienceMatches.length) {
    score += audienceMatches.length * 10;
    reasons.push(`audience:${audienceMatches.slice(0, 4).join(",")}`);
  }
  const journalMatches = context.pageType === "journal" ? intersect(question.journalTopics, context.journalTopics) : [];
  if (journalMatches.length) {
    score += journalMatches.length * 20;
    reasons.push(`journal:${journalMatches.slice(0, 5).join(",")}`);
  }
  const triggerMatches = unique((question.triggerWords || []).filter((word) => word && context.textLower.includes(String(word).toLocaleLowerCase("de"))));
  if (triggerMatches.length) {
    score += Math.min(triggerMatches.length, 5) * 5;
    reasons.push(`trigger:${triggerMatches.slice(0, 5).join(",")}`);
  }

  const hardIncluded = manualIndex >= 0 || routeMatches(question.includeRoutes, context.route);
  if (!hardIncluded && score < 20) return null;
  return {
    question,
    score,
    reasons,
    manualIndex: manualIndex >= 0 ? manualIndex : 999,
  };
}

function selectQuestionsForPage(context) {
  const scored = registry.questions
    .map((question) => scoreQuestionForPage(question, context))
    .filter(Boolean)
    .sort((a, b) => a.manualIndex - b.manualIndex || b.score - a.score || a.question.priority - b.question.priority || a.question.question.localeCompare(b.question.question, "de"));
  const max = pageMax(context);
  return {
    all: scored,
    selected: scored.slice(0, max),
    max,
  };
}

function walkHtml(dir = root, prefix = "") {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const relative = path.join(prefix, entry.name);
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", "templates", "assets", "public", "docs", "data"].includes(entry.name)) continue;
      files.push(...walkHtml(full, relative));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(relative.replaceAll(path.sep, "/"));
    }
  }
  return files;
}

function isEligibleForContext(relativeFile) {
  const rel = relativeFile.replaceAll(path.sep, "/");
  if (rel === "fragen/index.html" || rel === "suche.html" || rel === "glossar.html") return false;
  if (rel.startsWith("referenz/") || rel.startsWith("export/")) return false;
  if (rel.includes("/print/")) return false;
  if (rel === "404.html") return false;
  return [
    "index.html",
    "wirkungsoekonomie.html",
    "kompass.html",
    "akademie.html",
    "downloads.html",
    "anwendungen.html",
    "blog.html",
  ].includes(rel)
    || /^(wirkungsfelder|begriffe|werkzeuge|erleben|bibliothek|blog|fuer|ordnung|anwendungen|wissen|werkstatt)\//.test(rel);
}

function isRedirectPage(html) {
  return /<meta[^>]+http-equiv=["']refresh["']/i.test(html) || /window\.location\.replace\(/i.test(html);
}

function auditRow(context, selected, all, max) {
  const selectedText = selected.length
    ? selected.map((match) => `${match.question.id} (${match.reasons.join("; ")})`).join("<br>")
    : "-";
  const warning = selected.length === 0
    ? "keine Fragen gefunden"
    : all.length > max
      ? `gekürzt von ${all.length} auf ${max}`
      : "";
  distributionRows.push({
    page: context.route,
    pageType: context.pageType,
    title: context.title,
    selectedText,
    include: context.meta.questionsInclude.join(", ") || "-",
    exclude: context.meta.questionsExclude.join(", ") || "-",
    count: selected.length,
    warning,
  });
}

function applyContextBlocks() {
  for (const relativeFile of walkHtml()) {
    const file = path.join(root, relativeFile);
    let html = fs.readFileSync(file, "utf8");
    const stripped = stripQuestionBlocks(html);
    if (!isEligibleForContext(relativeFile) || isRedirectPage(stripped)) {
      if (stripped !== html) fs.writeFileSync(file, stripped.replace(/[ \t]+$/gm, ""));
      continue;
    }
    const context = inferPageContext(relativeFile, stripped);
    const { selected, all, max } = selectQuestionsForPage(context);
    auditRow(context, selected, all, max);
    let next = stripped;
    if (selected.length) {
      if (context.isJournalArticle) {
        const inline = selected.find((match) => match.question.showAs.includes("inline-callout") && match.score >= 55);
        next = insertJournalInline(next, inlineQuestionCallout(inline));
      }
      next = insertBeforeClose(next, contextBlock(selected, context));
    }
    next = next.replace(/[ \t]+$/gm, "");
    if (next !== html) fs.writeFileSync(file, next);
  }
}

function writeGaps() {
  const grouped = new Map();
  for (const gap of gaps) {
    const key = `${gap.type}:${gap.url}`;
    if (!grouped.has(key)) grouped.set(key, { ...gap, questions: new Set() });
    grouped.get(key).questions.add(gap.question);
  }
  const uniqueRows = Array.from(grouped.values());
  const rows = uniqueRows.length
    ? uniqueRows.map((gap) => `| ${esc(gap.type)} | ${esc(gap.label)} | \`${esc(gap.url)}\` | ${esc(Array.from(gap.questions).join(", "))} | ${gap.url.includes("maschinenwertschoepfungsbeitrag") || gap.url.includes("folgencheck-faktencheck") ? "hoch" : "mittel"} |`).join("\n")
    : "| - | Keine Lücken gefunden | - | - | - |";
  fs.writeFileSync(gapsPath, `# Fragenbereich: Related-Content-Gaps

Stand: 2026-05-27

Diese Liste wird aus \`assets/data/questions-registry.json\` erzeugt. Sie enthält Verlinkungen, deren Ziel noch nicht als öffentliche Seite existiert oder für die ein eigener Ausbau sinnvoll ist. Das Frontend zeigt diese Links nicht an, solange das Ziel fehlt.

| Typ | Fehlender Inhalt | Empfohlene URL | Frage / Kontext | Priorität |
| --- | --- | --- | --- | --- |
${rows}
`);
}

function writeDistributionAudit() {
  const rows = distributionRows
    .sort((a, b) => a.page.localeCompare(b.page, "de"))
    .map((row) => `| \`${esc(row.page)}\` | ${esc(row.pageType)} | ${esc(row.selectedText)} | ${esc(row.include)} | ${esc(row.exclude)} | ${row.count} | ${esc(row.warning)} |`)
    .join("\n");
  fs.writeFileSync(distributionAuditPath, `# Fragenbereich: Distribution-Audit

Stand: 2026-05-27

Dieser Report wird automatisch aus \`assets/data/questions-registry.json\` und den öffentlichen HTML-Seiten erzeugt. Er zeigt, welche Fragen kontextsensitiv auf welcher Seite ausgespielt werden und warum.

| Seite | Seitentyp | Angezeigte Fragen und Matching-Grund | Manuell included | Manuell excluded | Anzahl | Warnung |
| --- | --- | --- | --- | --- | ---: | --- |
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

collectQuestionLinkGaps();
buildPage();
applyContextBlocks();
writeGaps();
writeDistributionAudit();
updateSitemap();
console.log(`Questions page built and distributed: ${registry.questions.length} questions -> fragen/index.html`);
