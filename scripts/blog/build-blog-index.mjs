import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const blogDir = path.join(root, "blog");
const indexPath = path.join(root, "assets", "data", "blog-index.json");
const entryOverrides = new Map([
  ["/blog/von-der-wissensgesellschaft-zur-wirkungsgesellschaft.html", {
    excerpt: "Journal-Beitrag zum Übergang von der Wissensgesellschaft zur Wirkungsgesellschaft: Labels, Zertifikate, Scores, Faktenchecks und Berichte machen Wirkung sichtbar, aber erst Rückkopplung in Preise, Regeln, Kapital, Beschaffung und Öffentlichkeit macht daraus reale Steuerung.",
    tags: [
      "Wissensgesellschaft",
      "Wirkungsgesellschaft",
      "Labels",
      "Zertifikate",
      "Scores",
      "Faktencheck",
      "Folgencheck",
      "Wirkungsrückkopplung",
      "positive Netto-Wirkung",
      "6. Kondratieff"
    ],
    relatedPages: [
      "/verstehen/wissensgesellschaft-wirkungsgesellschaft/",
      "/dokumente/von-der-wissensgesellschaft-zur-wirkungsgesellschaft/",
      "/begriffe/wissensgesellschaft/",
      "/begriffe/wirkungsgesellschaft/"
    ],
    relatedTerms: [
      "Wissensgesellschaft",
      "Wirkungsgesellschaft",
      "Wirkungsrückkopplung",
      "positive Netto-Wirkung"
    ]
  }]
]);

function readExistingIndex() {
  if (!fs.existsSync(indexPath)) return new Map();
  const entries = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  return new Map(entries.map((entry) => [normalizeUrl(entry.url), entry]));
}

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

function normalizeUrl(url) {
  if (!url) return "";
  return url.startsWith("/") ? url : `/${url}`;
}

function firstMatch(html, patterns) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtml(match[1].trim());
  }
  return "";
}

function mainHtml(html) {
  const match = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  return match?.[1] || html;
}

function allMatches(html, pattern) {
  return Array.from(html.matchAll(pattern), (match) => decodeHtml(match[1].trim())).filter(Boolean);
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function stripTags(value) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeType(value) {
  if (!value || value === "Journalartikel" || value === "Journal") return "Journalartikel";
  return value;
}

function normalizeAssetUrl(value) {
  if (!value) return "";
  return value.replace(/^https?:\/\/wirkungsoekonomie\.de\//, "/");
}

function cleanTitle(value) {
  return String(value || "")
    .replace(/\s+-\s+Journal der Wirkungsökonomie$/, "")
    .replace(/\s+\|\s+Wirkungsökonomie$/, "")
    .trim();
}

function toDateOnly(value) {
  const match = String(value || "").match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : "";
}

function relativeUrl(file) {
  const relative = path.relative(root, file).split(path.sep).join("/");
  return `/${relative}`;
}

function entryFromHtml(file, existing) {
  const html = fs.readFileSync(file, "utf8");
  const published = firstMatch(html, [
    /<meta\s+property=["']article:published_time["']\s+content=["']([^"']+)["']/i,
    /"datePublished"\s*:\s*"([^"]+)"/i
  ]);
  if (!published) return null;

  const url = relativeUrl(file);
  const previous = existing.get(url) || {};
  const title = cleanTitle(
    previous.title ||
      firstMatch(html, [/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i, /<h1[^>]*>([\s\S]*?)<\/h1>/i, /<title>([\s\S]*?)<\/title>/i])
  );
  const excerpt =
    previous.excerpt ||
    firstMatch(html, [/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i, /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i]);
  const heroKicker = stripTags(firstMatch(html, [/<p\s+class=["']hero-kicker["']>([\s\S]*?)<\/p>/i]));
  const readingTime = previous.readingTime || heroKicker.match(/(\d+\s*Min\.)/)?.[1] || "";
  const category =
    previous.category ||
    firstMatch(html, [/<meta\s+property=["']article:section["']\s+content=["']([^"']+)["']/i]) ||
    heroKicker.split("·")[0]?.trim() ||
    "Journal";
  const tags = previous.tags?.length ? previous.tags : allMatches(html, /<meta\s+property=["']article:tag["']\s+content=["']([^"']+)["']/gi);
  const imageFromHtml = normalizeAssetUrl(
    firstMatch(html, [
      /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i,
      /<img[^>]+src=["']([^"']+)["'][^>]*>/i
    ])
  );
  const image = imageFromHtml || previous.image || "";
  const imageAltFromHtml =
    firstMatch(html, [
      /<meta\s+property=["']og:image:alt["']\s+content=["']([^"']+)["']/i,
      /<meta\s+name=["']twitter:image:alt["']\s+content=["']([^"']+)["']/i
    ]) ||
    firstMatch(mainHtml(html), [/<img[^>]+alt=["']([^"']+)["'][^>]*>/i]);
  const previousAlt = previous.imageAlt === "Wirkungsökonomie Logo" ? "" : previous.imageAlt;
  const imageAlt = imageAltFromHtml || previousAlt || title;
  const override = entryOverrides.get(url) || {};

  return {
    title,
    url,
    date: toDateOnly(published),
    publishedAt: published,
    category,
    readingTime,
    excerpt: override.excerpt || excerpt,
    tags: override.tags || tags,
    type: normalizeType(previous.type),
    image,
    imageAlt,
    featured: Boolean(previous.featured),
    status: previous.status || "published",
    relatedPages: override.relatedPages || previous.relatedPages || [],
    relatedTerms: override.relatedTerms || previous.relatedTerms || []
  };
}

const existing = readExistingIndex();
const entries = walk(blogDir)
  .filter((file) => !["blog/index.html", "blog/linkedin-artikel.html"].includes(path.relative(root, file).split(path.sep).join("/")))
  .map((file) => entryFromHtml(file, existing))
  .filter(Boolean)
  .filter((entry) => entry.status === "published" && entry.date)
  .sort((a, b) => (b.publishedAt || b.date).localeCompare(a.publishedAt || a.date) || a.title.localeCompare(b.title, "de"));

fs.mkdirSync(path.dirname(indexPath), { recursive: true });
fs.writeFileSync(indexPath, `${JSON.stringify(entries, null, 2)}\n`);

function siteRelative(url = "") {
  return String(url || "#").replace(/^\//, "");
}

function pageRelative(url = "", prefix = "") {
  const clean = siteRelative(url);
  if (!prefix || clean === "#") return clean;
  return `${prefix}${clean}`;
}

function formatDateLabel(date = "") {
  const match = String(date).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return date;
  const [, year, month, day] = match;
  return `${day}.${month}.${year}`;
}

function renderImage(entry, eager = false) {
  if (!entry.image) return "";
  return `<div class="blog-image"><img src="${escapeHtml(siteRelative(entry.image))}" alt="${escapeHtml(entry.imageAlt || entry.title)}" decoding="async" loading="${eager ? "eager" : "lazy"}"></div>`;
}

function renderLibraryImage(entry) {
  if (!entry.image) return "";
  const href = pageRelative(entry.url, "../");
  const image = pageRelative(entry.image, "../");
  return `<a class="journal-library-image" href="${escapeHtml(href)}"><img src="${escapeHtml(image)}" alt="${escapeHtml(entry.imageAlt || entry.title)}" loading="lazy"></a>`;
}

function renderBadges(entry) {
  const badges = [entry.type || "Journal", entry.category || ""].filter(Boolean).slice(0, 2);
  return `<div class="blog-badge-row">${badges.map((badge) => `<span class="blog-origin-badge">${escapeHtml(badge)}</span>`).join("")}</div>`;
}

function renderFeature(entry) {
  return `<article class="blog-card editorial-feature-card journal-feature-card" data-origin="redaktion" data-category="${escapeHtml(entry.category || "journal")}">
              ${renderImage(entry, true)}
              <div class="journal-feature-copy">
                ${renderBadges(entry)}
                <p class="card-kicker">${escapeHtml(entry.category || "Journal")} · ${escapeHtml(formatDateLabel(entry.date))}${entry.readingTime ? ` · ${escapeHtml(entry.readingTime)}` : ""}</p>
                <h3 class="card-title">${escapeHtml(entry.title)}</h3>
                ${entry.excerpt ? `<p class="card-text">${escapeHtml(entry.excerpt)}</p>` : ""}
                <a class="text-link" href="${escapeHtml(siteRelative(entry.url))}">Aktuellen Beitrag lesen</a>
              </div>
            </article>`;
}

function renderSideEntry(entry) {
  return `<article class="journal-card">
              <p class="card-kicker">${escapeHtml(entry.category || "Journal")} · ${escapeHtml(formatDateLabel(entry.date))}</p>
              <h3 class="card-title">${escapeHtml(entry.title)}</h3>
              ${entry.excerpt ? `<p class="card-text">${escapeHtml(entry.excerpt).slice(0, 180)}</p>` : ""}
              <a class="text-link" href="${escapeHtml(siteRelative(entry.url))}">Beitrag lesen</a>
            </article>`;
}

function renderHomeJournal(entries) {
  const [featured, ...rest] = entries;
  if (!featured) return "";
  return `<div class="journal-home" data-journal-home aria-live="polite">
            <div class="journal-home-grid">
              ${renderFeature(featured)}
              <div class="journal-side-list" aria-label="Weitere aktuelle Journalartikel">
                ${rest.slice(0, 2).map(renderSideEntry).join("\n                ")}
                <article class="journal-card journal-archive-card">
                  <p class="card-kicker">Archiv</p>
                  <h3 class="card-title">Alle Journalartikel durchsuchen.</h3>
                  <p class="card-text">Suche, Filter und Schlagworte führen gezielt durch das vollständige Archiv.</p>
                  <a class="text-link" href="blog.html#beitraege">Zum Archiv</a>
                </article>
              </div>
            </div>
          </div>`;
}

function renderBlogJournal(entries) {
  const [featured, ...rest] = entries;
  if (!featured) return "";
  return `<div class="journal-home" data-journal-home>
            <div class="journal-home-grid">
              ${renderFeature(featured)}
              <div class="journal-side-list" aria-label="Weitere aktuelle Journalartikel">
                ${rest.slice(0, 2).map(renderSideEntry).join("\n                ")}
                <article class="journal-card journal-archive-card">
                  <p class="card-kicker">Archiv</p>
                  <h3 class="card-title">Alle Journalartikel durchsuchen.</h3>
                  <p class="card-text">Suche, Filter und Schlagworte führen gezielt durch das vollständige Archiv.</p>
                  <a class="text-link" href="#beitraege">Zum Archiv</a>
                </article>
              </div>
            </div>
          </div>`;
}

function renderBlogLatestSection(entries) {
  return `      <section class="section" aria-labelledby="leitartikel-title">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Aktuell</p>
            <h2 id="leitartikel-title">Aktuell im Journal</h2>
            <p>Der neueste veröffentlichte Journalartikel steht automatisch vorn. Darunter folgen weitere aktuelle Einordnungen und das vollständige Archiv.</p>
          </div>
          ${renderBlogJournal(entries)}
        </div>
      </section>`;
}

function renderStructuredBlogItems(entries) {
  return entries.slice(0, 18).map((entry, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: `https://wirkungsoekonomie.de/${siteRelative(entry.url)}`,
    name: entry.title,
  }));
}

function updateBlogStructuredData(html, entries) {
  if (!entries.length) return html;
  const items = JSON.stringify(renderStructuredBlogItems(entries), null, 40)
    .split("\n")
    .map((line, index) => index === 0 ? line : `                                        ${line}`)
    .join("\n");
  return html.replace(
    /("@id": "https:\/\/wirkungsoekonomie\.de\/blog\.html#leitartikel"[\s\S]*?"numberOfItems": )\d+([\s\S]*?"itemListElement": )\[[\s\S]*?\](\s*\n\s*})/,
    `$1${Math.min(entries.length, 18)}$2${items}$3`
  );
}

function renderLibraryCard(entry) {
  return `<article class="journal-library-card">
      ${renderLibraryImage(entry)}
      <div class="journal-library-card-body">
        <p class="card-kicker">${escapeHtml(entry.category || "Journal")} · ${escapeHtml(formatDateLabel(entry.date))}${entry.readingTime ? ` · ${escapeHtml(entry.readingTime)}` : ""}</p>
        <h3>${escapeHtml(entry.title)}</h3>
        ${entry.excerpt ? `<p>${escapeHtml(entry.excerpt)}</p>` : ""}
        <a class="text-link" href="${escapeHtml(pageRelative(entry.url, "../"))}">Artikel lesen</a>
      </div>
    </article>`;
}

function replaceLatestJournalBlock(html, replacement) {
  return html.replace(
    /<div class="journal-home" data-journal-home(?:\s+aria-live="polite")?>[\s\S]*?<\/div>\s*(?=<noscript>|<\/section>)/,
    replacement
  );
}

function updateBlogJournal(entries) {
  const blogHtmlPath = path.join(root, "blog.html");
  if (!fs.existsSync(blogHtmlPath) || !entries.length) return;
  const current = fs.readFileSync(blogHtmlPath, "utf8");
  const withLatest = current.replace(
    /      <section class="section" aria-labelledby="leitartikel-title">[\s\S]*?(?=\n      <section class="section section-muted" id="dossiers")/,
    renderBlogLatestSection(entries)
  );
  const next = updateBlogStructuredData(withLatest, entries);
  if (next !== current) fs.writeFileSync(blogHtmlPath, next, "utf8");
}

function updateHomepageJournal(entries) {
  const homePath = path.join(root, "index.html");
  if (!fs.existsSync(homePath) || !entries.length) return;
  const current = fs.readFileSync(homePath, "utf8");
  const next = replaceLatestJournalBlock(current, renderHomeJournal(entries));
  if (next !== current) fs.writeFileSync(homePath, next, "utf8");
}

function updateLibraryJournal(entries) {
  const libraryPath = path.join(root, "bibliothek", "index.html");
  if (!fs.existsSync(libraryPath) || !entries.length) return;
  const current = fs.readFileSync(libraryPath, "utf8");
  const cards = entries.slice(0, 2).map(renderLibraryCard).join("\n");
  const next = current.replace(
    /<div class="journal-library-grid">[\s\S]*?<\/div>\s*(?=<div class="section-actions">)/,
    `<div class="journal-library-grid">${cards}</div>\n        `
  );
  if (next !== current) fs.writeFileSync(libraryPath, next, "utf8");
}

updateBlogJournal(entries);
updateHomepageJournal(entries);
updateLibraryJournal(entries);
console.log(`Wrote ${entries.length} current blog entries to assets/data/blog-index.json.`);
