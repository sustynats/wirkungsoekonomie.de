import fs from "node:fs";
import path from "node:path";

const glossaryPath = "public/data/glossary.terms.json";
const blogIndexPath = "assets/data/blog-index.json";
const outputPath = "assets/data/journal-related-content.json";
const blogRoot = "blog";
const termStart = "<!-- journal-related-content:start -->";
const termEnd = "<!-- journal-related-content:end -->";
const articleStart = "<!-- article-related-terms:start -->";
const articleEnd = "<!-- article-related-terms:end -->";

const glossary = JSON.parse(fs.readFileSync(glossaryPath, "utf8"));
const blogIndex = fs.existsSync(blogIndexPath)
  ? JSON.parse(fs.readFileSync(blogIndexPath, "utf8"))
  : [];
const indexedPosts = new Map(blogIndex.map((post) => [normalizeUrl(post.url), post]));
const terms = glossary.terms.map(normalizeTerm).filter((term) => term.slug && term.label);
const articles = findHtmlFiles(blogRoot)
  .map(readArticle)
  .filter(Boolean);

const termMatches = new Map(terms.map((term) => [term.slug, []]));
const articleMatches = new Map();

for (const article of articles) {
  const matches = terms
    .map((term) => ({ term, score: scoreTermForArticle(term, article) }))
    .filter((entry) => entry.score >= thresholdFor(entry.term))
    .sort((a, b) => b.score - a.score || a.term.label.localeCompare(b.term.label, "de"))
    .slice(0, 8);

  if (matches.length) {
    articleMatches.set(article.url, matches);
  }

  for (const match of matches.slice(0, 6)) {
    termMatches.get(match.term.slug)?.push({
      article,
      score: match.score,
    });
  }
}

const relationshipData = {
  generatedAt: new Date().toISOString(),
  terms: {},
  articles: {},
};

for (const term of terms) {
  const related = uniqueBy(
    (termMatches.get(term.slug) || [])
      .sort((a, b) => b.score - a.score || dateValue(b.article.date) - dateValue(a.article.date))
      .map((entry) => entry.article),
    (article) => article.url,
  ).slice(0, 4);

  relationshipData.terms[term.slug] = related.map(articleCardData);
  updateTermPage(term, related);
}

for (const article of articles) {
  const matches = articleMatches.get(article.url) || [];
  const relatedTerms = matches.slice(0, 7).map(({ term }) => ({
    label: term.label,
    slug: term.slug,
    url: `/begriffe/${term.slug}/`,
  }));

  relationshipData.articles[article.url] = relatedTerms;
  updateArticlePage(article, relatedTerms);
}

fs.writeFileSync(outputPath, `${JSON.stringify(relationshipData, null, 2)}\n`);

const articleCount = Object.values(relationshipData.terms).filter((items) => items.length).length;
const termCount = Object.values(relationshipData.articles).filter((items) => items.length).length;
console.log(`Wrote journal relationships for ${articleCount} term pages and ${termCount} journal articles.`);

function normalizeTerm(term) {
  const labels = uniqueBy([
    term.canonicalLabel,
    ...(term.synonyms || []),
    term.slug?.replace(/-/g, " "),
  ].filter(Boolean), (value) => normalizeText(value));

  const normalizedLabels = uniqueBy(
    labels.flatMap((label) => normalizedLabelVariants(normalizeText(label))),
    (label) => label,
  ).filter((label) => label.length >= 3);

  return {
    id: term.termId,
    slug: term.slug,
    label: term.canonicalLabel,
    category: term.category,
    labels,
    normalizedLabels,
  };
}

function normalizedLabelVariants(label) {
  const variants = [label];
  if (label.endsWith("raum")) {
    variants.push(label.replace(/raum$/, "raeume"), label.replace(/raum$/, "raeumen"));
  }
  if (label.endsWith("pfad")) {
    variants.push(`${label}e`, `${label}en`);
  }
  if (label.endsWith("ung")) {
    variants.push(`${label}en`);
  }
  if (label.endsWith("steuer")) {
    variants.push(`${label}n`);
  }
  if (label.endsWith("rat")) {
    variants.push(`${label}e`, `${label}es`);
  }
  if (label.endsWith("index")) {
    variants.push(`${label}e`);
  }
  return variants;
}

function readArticle(filePath) {
  const html = fs.readFileSync(filePath, "utf8");
  const schema = extractBlogPosting(html);
  if (!schema) return null;

  const url = normalizeUrl(schema.url || filePathToUrl(filePath));
  if (url === "/blog/" || url === "/blog/index.html") return null;

  const indexed = indexedPosts.get(url) || {};
  const title = cleanText(schema.headline || indexed.title || metaContent(html, "og:title") || firstMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i) || path.basename(filePath, ".html"));
  const description = cleanText(schema.description || indexed.excerpt || metaContent(html, "description") || metaContent(html, "og:description") || "");
  const date = normalizeDate(schema.datePublished || indexed.date || metaContent(html, "article:published_time") || "");
  const category = cleanText(schema.articleSection || indexed.category || metaContent(html, "article:section") || "Journal");
  const schemaKeywords = Array.isArray(schema.keywords)
    ? schema.keywords
    : String(schema.keywords || "").split(",");
  const tags = uniqueBy([
    ...schemaKeywords,
    ...metaContents(html, "article:tag"),
    ...(indexed.tags || []),
    ...(indexed.relatedTerms || []),
  ].map(cleanText).filter(Boolean), normalizeText);
  const bodyText = htmlToText(firstMatch(html, /<div class="article-body[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/section>/i) || html);

  return {
    filePath,
    html,
    url,
    title,
    description,
    date,
    category,
    tags,
    haystack: normalizeText([title, description, category, tags.join(" "), bodyText].join(" ")),
    metadataHaystack: normalizeText([title, description, category, tags.join(" ")].join(" ")),
  };
}

function extractBlogPosting(html) {
  const scripts = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const script of scripts) {
    try {
      const data = JSON.parse(script[1].trim());
      const found = findBlogPosting(data);
      if (found) return found;
    } catch {
      // Ignore malformed structured data and fall back to the next script.
    }
  }
  return null;
}

function findBlogPosting(value) {
  if (!value || typeof value !== "object") return null;
  if (isBlogPosting(value)) return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findBlogPosting(item);
      if (found) return found;
    }
  }
  if (Array.isArray(value["@graph"])) {
    return findBlogPosting(value["@graph"]);
  }
  return null;
}

function isBlogPosting(value) {
  const type = value["@type"];
  return type === "BlogPosting" || (Array.isArray(type) && type.includes("BlogPosting"));
}

function scoreTermForArticle(term, article) {
  let score = 0;
  for (const label of term.normalizedLabels) {
    if (!label) continue;
    const metadataOccurrences = countPhrase(article.metadataHaystack, label);
    const allOccurrences = countPhrase(article.haystack, label);
    if (metadataOccurrences > 0) score += 60;
    if (article.title && countPhrase(normalizeText(article.title), label) > 0) score += 30;
    if (article.tags.some((tag) => normalizeText(tag) === label)) score += 70;
    score += Math.min(Math.max(allOccurrences - metadataOccurrences, 0), 6) * 8;
  }
  return score;
}

function thresholdFor(term) {
  const generic = new Set(["wirkung", "wirkungsbewertung", "wirkungspfad", "wirkungspotenzial"]);
  return generic.has(term.slug) ? 76 : 52;
}

function updateTermPage(term, articlesForTerm) {
  const filePath = path.join("begriffe", term.slug, "index.html");
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, "utf8");
  html = stripBlock(html, termStart, termEnd);
  if (!articlesForTerm.length) {
    fs.writeFileSync(filePath, html);
    return;
  }
  const section = renderTermJournalSection(articlesForTerm);
  const marker = "        <section class=\"meta-box\">";
  html = html.includes(marker)
    ? html.replace(marker, `${section}\n${marker}`)
    : html.replace("</article>", `${section}\n      </article>`);
  fs.writeFileSync(filePath, html);
}

function updateArticlePage(article, relatedTerms) {
  let html = stripBlock(article.html, articleStart, articleEnd);
  if (!relatedTerms.length) {
    fs.writeFileSync(article.filePath, html);
    return;
  }
  const section = renderArticleTermSection(relatedTerms);
  html = html.replace(/\s*<\/main>/i, `\n${section}\n    </main>`);
  fs.writeFileSync(article.filePath, html);
}

function renderTermJournalSection(articlesForTerm) {
  return `        ${termStart}
        <section class="term-link-section journal-related-section" aria-labelledby="journal-related-title">
          <div>
            <p class="section-eyebrow">Journal</p>
            <h2 id="journal-related-title">Passende Einordnungen</h2>
            <p>Artikel, die diesen Begriff aus aktueller Perspektive einordnen.</p>
          </div>
          <div class="journal-related-grid">
${articlesForTerm.map((article) => `            ${renderArticleCard(article)}`).join("\n")}
          </div>
        </section>
        ${termEnd}`;
}

function renderArticleTermSection(relatedTerms) {
  return `      ${articleStart}
      <section class="section journal-related-section article-related-terms" aria-labelledby="article-related-terms-title" data-no-glossary="true">
        <div class="section-header compact">
          <p class="hero-kicker">Passend dazu</p>
          <h2 id="article-related-terms-title">Wirkungsthemen zu diesem Artikel</h2>
          <p>Diese Begriffe helfen, den Artikel im Modell der Wirkungsökonomie einzuordnen.</p>
        </div>
        <div class="term-chip-row">
          ${relatedTerms.map((term) => `<a class="term-chip" href="${esc(term.url)}">${esc(term.label)}</a>`).join("\n          ")}
        </div>
      </section>
      ${articleEnd}`;
}

function renderArticleCard(article) {
  const meta = [article.category, formatDate(article.date)].filter(Boolean).join(" · ");
  return `<a class="journal-card" href="${esc(article.url)}">
              <p class="journal-meta"><span>${esc(meta || "Journal")}</span></p>
              <h3 class="card-title">${esc(article.title)}</h3>
              <p class="card-text">${esc(article.description || "Einordnung aus dem Journal der Wirkungsökonomie.")}</p>
            </a>`;
}

function articleCardData(article) {
  return {
    title: article.title,
    url: article.url,
    date: article.date,
    category: article.category,
    excerpt: article.description,
  };
}

function findHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return findHtmlFiles(fullPath);
    if (!entry.isFile() || !entry.name.endsWith(".html")) return [];
    if (entry.name === "index.html" || entry.name === "linkedin-artikel.html") return [];
    return [fullPath];
  });
}

function filePathToUrl(filePath) {
  return `/${filePath.replaceAll(path.sep, "/")}`;
}

function normalizeUrl(url) {
  if (!url) return "";
  try {
    const parsed = new URL(url, "https://wirkungsoekonomie.de");
    return parsed.pathname;
  } catch {
    return url.startsWith("/") ? url : `/${url}`;
  }
}

function normalizeDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function dateValue(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}

function metaContent(html, name) {
  return firstMatch(html, new RegExp(`<meta[^>]+(?:name|property)=["']${escapeRegExp(name)}["'][^>]+content=["']([^"']*)["'][^>]*>`, "i"))
    || firstMatch(html, new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${escapeRegExp(name)}["'][^>]*>`, "i"))
    || "";
}

function metaContents(html, name) {
  return [...html.matchAll(new RegExp(`<meta[^>]+(?:name|property)=["']${escapeRegExp(name)}["'][^>]+content=["']([^"']*)["'][^>]*>`, "gi"))]
    .map((match) => decodeEntities(match[1]));
}

function firstMatch(value, regex) {
  const match = value.match(regex);
  return match ? decodeEntities(match[1]) : "";
}

function htmlToText(html) {
  return decodeEntities(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanText(value) {
  return decodeEntities(String(value ?? ""))
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeText(value) {
  return decodeEntities(String(value ?? ""))
    .toLocaleLowerCase("de")
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " und ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countPhrase(text, phrase) {
  if (!text || !phrase) return 0;
  const regex = new RegExp(`(?:^| )${escapeRegExp(phrase)}(?: |$)`, "g");
  return [...text.matchAll(regex)].length;
}

function stripBlock(html, start, end) {
  const pattern = new RegExp(`\\s*${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}`, "g");
  return html.replace(pattern, "");
}

function decodeEntities(value) {
  return String(value ?? "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function uniqueBy(items, keyFn) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    const key = keyFn(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}
