#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://wirkungsoekonomie.de";
const YEAR_START = "2026-01-01";

const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(ROOT, relative), "utf8"));
const write = (relative, content) => {
  const target = path.join(ROOT, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content.endsWith("\n") ? content : `${content}\n`, "utf8");
};

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  })[character]);
}

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function slug(value = "") {
  return String(value).toLocaleLowerCase("de").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function normalizeDate(value) {
  const date = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(date)) return { date: date.slice(0, 10), precision: "day", sort: date };
  if (/^\d{4}-\d{2}$/.test(date)) return { date, precision: "month", sort: `${date}-28T23:59:59+01:00` };
  if (/^\d{4}$/.test(date)) return { date, precision: "year", sort: `${date}-01-01T00:00:00+01:00` };
  return null;
}

function updateRecord({ id, date, kind, area, title, summary, url, source, featured = false }) {
  const normalized = normalizeDate(date);
  if (!normalized || normalized.sort < YEAR_START) return null;
  return {
    id: slug(id), date: normalized.date, datePrecision: normalized.precision, sortDate: normalized.sort,
    kind, area, areaKey: slug(area), title: String(title || "").trim(), summary: String(summary || "").trim(),
    url, source, featured: Boolean(featured),
  };
}

function collectUpdates() {
  const curated = readJson("content/updates/site-updates.json").updates.map((item) => updateRecord({ ...item, source: "curated" }));
  const journals = readJson("assets/data/blog-index.json")
    .filter((item) => item.status === "published")
    .map((item) => updateRecord({
      id: `journal-${item.url}`, date: item.publishedAt || item.date, kind: "journal", area: "Journal",
      title: item.title, summary: item.excerpt, url: item.url, source: "blog-index",
    }));
  const publications = readJson("assets/data/document-library.json").documents
    .filter((item) => item.visibility !== "archive" && item.status !== "archiviert")
    .map((item) => updateRecord({
      id: `publication-${item.id}`, date: item.date, kind: "veroeffentlichung", area: "Bibliothek",
      title: item.title, summary: item.summaryShort || item.subtitle, url: item.url, source: "document-library",
    }));
  const podcasts = readJson("assets/data/podcast-index.json")
    .filter((item) => item.status === "published")
    .map((item) => updateRecord({
      id: `podcast-${item.id}`, date: item.publishedAt, kind: "podcast", area: "Podcast",
      title: `${item.title}${item.subtitle ? `: ${item.subtitle}` : ""}`, summary: item.description,
      url: `/podcast/${item.slug}/`, source: "podcast-index",
    }));

  const byId = new Map();
  [...curated, ...journals, ...publications, ...podcasts].filter(Boolean).forEach((item) => {
    if (item.title && item.summary && item.url) byId.set(item.id, item);
  });
  return [...byId.values()].sort((a, b) => b.sortDate.localeCompare(a.sortDate) || Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title, "de"));
}

function formatDate(item) {
  if (item.datePrecision === "year") return item.date;
  const date = new Date(`${item.datePrecision === "month" ? `${item.date}-01` : item.date}T12:00:00+02:00`);
  return new Intl.DateTimeFormat("de-DE", item.datePrecision === "month"
    ? { month: "long", year: "numeric", timeZone: "Europe/Berlin" }
    : { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Berlin" }).format(date);
}

function monthKey(item) {
  return item.date.length >= 7 ? item.date.slice(0, 7) : `${item.date}-01`;
}

function monthLabel(key) {
  return new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric", timeZone: "Europe/Berlin" })
    .format(new Date(`${key}-01T12:00:00+02:00`));
}

function absoluteUrl(value) {
  return /^https?:\/\//.test(value) ? value : `${SITE}${value.startsWith("/") ? value : `/${value}`}`;
}

function localHref(value) {
  if (/^https?:\/\//.test(value)) return value;
  return `..${value.startsWith("/") ? value : `/${value}`}`;
}

function navLink(item, base) {
  const match = (item.match || [item.href]).join("|");
  return `<a href="${escapeHtml(`${base}${item.href}`)}" data-nav-match="${escapeHtml(match)}">${escapeHtml(item.label)}</a>`;
}

function layout(base) {
  const navigation = readJson("assets/data/navigation.json");
  const header = fs.readFileSync(path.join(ROOT, "templates/header.html"), "utf8").replaceAll("{{BASE}}", base);
  const groups = navigation.footerGroups.map((group) => `<div class="footer-nav-group">
      <h3>${escapeHtml(group.title)}</h3>
      <div class="footer-nav-links">
${group.items.map((item) => `        ${navLink(item, base)}`).join("\n")}
      </div>
    </div>`).join("\n");
  const legal = navigation.footerLegal.map((item) => navLink(item, base)).join("\n");
  const footer = fs.readFileSync(path.join(ROOT, "templates/footer.html"), "utf8")
    .replaceAll("{{BASE}}", base).replace("{{FOOTER_NAV}}", groups).replace("{{FOOTER_LEGAL_NAV}}", legal);
  return { header, footer };
}

function updateCard(item) {
  const search = slug(`${item.title} ${item.summary} ${item.area} ${item.kind}`);
  const external = /^https?:\/\//.test(item.url);
  return `<article class="update-card" id="update-${escapeHtml(item.id)}" data-update-card data-update-area="${escapeHtml(item.areaKey)}" data-update-kind="${escapeHtml(item.kind)}" data-update-search="${escapeHtml(search)}">
        <div class="update-card__meta"><time datetime="${escapeHtml(item.date)}">${escapeHtml(formatDate(item))}</time><span class="update-card__badge">${escapeHtml(item.area)}</span></div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.summary)}</p>
        <p><a class="text-link" href="${escapeHtml(localHref(item.url))}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>Mehr erfahren${external ? " ↗" : ""}</a></p>
      </article>`;
}

function newsPage(updates) {
  const { header, footer } = layout("../");
  const groups = new Map();
  updates.forEach((item) => {
    const key = monthKey(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  });
  const months = [...groups.entries()].map(([key, items]) => `<section class="updates-month" data-update-group aria-labelledby="updates-${key}">
      <h2 class="updates-month__title" id="updates-${key}">${escapeHtml(monthLabel(key))}</h2>
      <div class="updates-grid">${items.map(updateCard).join("\n")}</div>
    </section>`).join("\n");
  const filters = [["alle", "Alle"], ["journal", "Journal"], ["veroeffentlichung", "Veröffentlichungen"], ["podcast", "Podcast"], ["glossar", "Glossar"], ["akademie", "Akademie"], ["institut", "Institut"], ["parlament", "Parlament"], ["funktion", "Funktionen"]];
  const latest = updates[0]?.date || "2026-01-01";
  const jsonLd = {
    "@context": "https://schema.org", "@type": "CollectionPage", "@id": `${SITE}/news/#page`, url: `${SITE}/news/`,
    name: "Neues aus der Wirkungsökonomie", description: "Chronologische Neuigkeiten aus Journal, Bibliothek, Podcast, Akademie, Institut, Parlament und Website.",
    inLanguage: "de", dateModified: latest,
    mainEntity: { "@type": "ItemList", numberOfItems: updates.length, itemListElement: updates.slice(0, 100).map((item, index) => ({ "@type": "ListItem", position: index + 1, url: absoluteUrl(item.url), name: item.title })) },
  };
  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Neues aus der Wirkungsökonomie | Wirkungsökonomie</title>
  <meta name="description" content="Alle Neuigkeiten der Wirkungsökonomie seit 2026: Veröffentlichungen, Journal, Podcast, Glossar, Akademie, Institut, Parlament und neue Funktionen.">
  <link rel="canonical" href="${SITE}/news/">
  <link rel="alternate" type="application/rss+xml" title="Neues aus der Wirkungsökonomie" href="${SITE}/feeds/neuigkeiten.xml">
  <link rel="manifest" href="manifest.webmanifest">
  <meta name="theme-color" content="#10243b">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="WÖk Neues">
  <link rel="apple-touch-icon" href="../assets/img/brand/apple-touch-icon.png">
  <meta property="og:type" content="website"><meta property="og:locale" content="de_DE"><meta property="og:site_name" content="Wirkungsökonomie">
  <meta property="og:title" content="Neues aus der Wirkungsökonomie"><meta property="og:description" content="Veröffentlichungen, Inhalte und Funktionen chronologisch an einem Ort."><meta property="og:url" content="${SITE}/news/">
  <link rel="icon" href="../assets/img/brand/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../assets/css/style.css?v=20260903-news">
  <link rel="stylesheet" href="../assets/css/site-updates.css?v=20260903-2">
  <script type="application/ld+json">${safeJson(jsonLd)}</script>
</head>
<body>
${header}
<main id="main-content" data-search-content>
  <section class="hero updates-hero"><div class="hero-copy">
    <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../index.html">Start</a><span aria-hidden="true">/</span><span>Neues</span></nav>
    <p class="hero-kicker">Seit 2026 fortlaufend dokumentiert</p>
    <h1 class="hero-title">Neues aus der Wirkungsökonomie</h1>
    <p class="hero-subtitle">Neue Analysen, Begriffe, Veröffentlichungen, Lernangebote und Funktionen aus der Wirkungsökonomie, der Akademie, dem Institut und dem Wirkungsportal Parlament.</p>
    <div class="updates-hero__actions"><a class="btn btn-primary" href="../feeds/neuigkeiten.xml">RSS abonnieren</a><a class="btn btn-secondary" href="wirkungsticker/">Zum Wirkungsticker</a></div>
  </div></section>
  <section class="section" aria-label="News-App installieren"><div class="updates-app-offer" data-news-app-offer hidden>
    <div class="updates-app-offer__copy"><p class="hero-kicker">Direkt auf dem Smartphone</p><h2>Neues als Web-App</h2><p>Installiere die Neuigkeiten auf deinem Startbildschirm. Die aktuelle Übersicht bleibt auch bei einer kurzen Unterbrechung der Verbindung erreichbar.</p></div>
    <button class="btn btn-primary" type="button" data-news-app-install>News-App installieren</button>
    <p class="updates-app-offer__help" data-news-app-help tabindex="-1" hidden></p>
  </div></section>
  <section class="section" id="newsletter" aria-labelledby="updates-newsletter-title"><div class="updates-newsletter">
    <p class="hero-kicker">Direkt per E-Mail</p><h2 id="updates-newsletter-title">Der Wirkungsbrief</h2>
    <p>Neue Analysen, erklärte Begriffe und Hinweise zu Werkzeugen, Veröffentlichungen und Kursen. Nur, wenn es etwas Relevantes mitzuteilen gibt.</p>
    <div class="updates-newsletter__actions"><button class="btn btn-primary" type="button" data-woek-newsletter-control data-newsletter-label="Wirkungsbrief abonnieren">Wirkungsbrief abonnieren</button><a class="btn btn-secondary" href="../feeds/">Alle RSS-Feeds</a></div>
  </div></section>
  <section class="section section-soft" aria-labelledby="updates-list-title"><div class="section-header"><p class="hero-kicker">Chronik</p><h2 id="updates-list-title">Was neu hinzugekommen ist</h2><p>${updates.length} Einträge aus den bestehenden Veröffentlichungsregistern und der kuratierten Funktionschronik.</p></div>
    <div class="updates-control"><label class="updates-search" for="updates-search"><span>Neuigkeiten durchsuchen</span><input id="updates-search" type="search" data-update-search placeholder="Zum Beispiel Parlament, Glossar oder Value Pricing"></label>
      <nav class="updates-filters" aria-label="Neuigkeiten filtern">${filters.map(([value, label], index) => `<button class="updates-filter" type="button" data-update-filter="${value}" aria-pressed="${index === 0}">${label}</button>`).join("")}</nav>
    </div>
    <div class="updates-timeline" data-site-updates>${months}</div>
    <div class="updates-empty" data-update-empty hidden><p>Für diese Auswahl gibt es noch keinen Eintrag.</p></div>
    <p><button class="btn btn-secondary" type="button" data-update-more>Weitere Neuigkeiten anzeigen</button></p>
  </section>
</main>
${footer}
<script src="../assets/js/main.js?v=20260903-news"></script>
<script src="../assets/js/site-updates.js?v=20260903-2"></script>
</body>
</html>`;
}

function homepageSection(updates) {
  const cards = updates.slice(0, 4).map((item) => `<article class="card">
              <p class="card-kicker">${escapeHtml(item.area)} · ${escapeHtml(formatDate(item))}</p>
              <h3 class="card-title">${escapeHtml(item.title)}</h3>
              <p class="card-text">${escapeHtml(item.summary)}</p>
              <a class="text-link" href="${escapeHtml(item.url.startsWith("/") ? item.url.slice(1) : item.url)}">Mehr erfahren</a>
            </article>`).join("\n            ");
  return `<section class="section section-soft" id="neues-aus-der-wirkungsoekonomie" aria-labelledby="neues-aus-der-wirkungsoekonomie-title">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Aktuell</p>
            <h2 id="neues-aus-der-wirkungsoekonomie-title">Neues aus der Wirkungsökonomie</h2>
            <p>Die neuesten Veröffentlichungen, Inhalte und Funktionen aus Website, Akademie, Institut und Wirkungsportal Parlament.</p>
          </div>
          <div class="card-grid">
            ${cards}
          </div>
          <div class="section-actions"><a class="btn btn-primary" href="news/">Alle Neuigkeiten</a><a class="btn btn-secondary" href="feeds/neuigkeiten.xml">RSS abonnieren</a></div>
        </div>
      </section>`;
}

function updateHomepage(updates) {
  const file = path.join(ROOT, "index.html");
  const current = fs.readFileSync(file, "utf8");
  const pattern = /<section class="section section-soft" id="(?:aktuell-journal|neues-aus-der-wirkungsoekonomie)"[\s\S]*?<\/section>/;
  if (!pattern.test(current)) throw new Error("Homepage updates section not found.");
  fs.writeFileSync(file, current.replace(pattern, homepageSection(updates)), "utf8");
}

function updateSitemap(updates) {
  const file = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(file)) return;
  let xml = fs.readFileSync(file, "utf8");
  xml = xml.replace(/\s*<url>\s*<loc>https:\/\/wirkungsoekonomie\.de\/news\/<\/loc>[\s\S]*?<\/url>/g, "");
  const lastmod = updates[0]?.date || "2026-01-01";
  xml = xml.replace("</urlset>", `  <url><loc>${SITE}/news/</loc><lastmod>${lastmod}</lastmod></url>\n</urlset>`);
  fs.writeFileSync(file, xml.endsWith("\n") ? xml : `${xml}\n`, "utf8");
}

function buildRss(updates) {
  const latest = updates[0]?.date || "2026-01-01";
  const rssDate = (item) => item.datePrecision === "year" ? `${item.date}-01-01` : item.datePrecision === "month" ? `${item.date}-01` : item.date;
  const items = updates.map((item) => `<item>
      <title>${escapeHtml(item.title)}</title>
      <link>${escapeHtml(absoluteUrl(item.url))}</link>
      <guid isPermaLink="false">${SITE}/news/#update-${escapeHtml(item.id)}</guid>
      <pubDate>${new Date(`${rssDate(item)}T08:00:00+02:00`).toUTCString()}</pubDate>
      <category>${escapeHtml(item.area)}</category>
      <description>${escapeHtml(item.summary)}</description>
    </item>`).join("\n    ");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Neues aus der Wirkungsökonomie</title>
    <link>${SITE}/news/</link>
    <description>Neue Veröffentlichungen, Inhalte und Funktionen der Wirkungsökonomie.</description>
    <language>de-DE</language>
    <lastBuildDate>${new Date(`${latest}T08:00:00+02:00`).toUTCString()}</lastBuildDate>
    <atom:link href="${SITE}/feeds/neuigkeiten.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;
}

export function buildSiteUpdates() {
  const updates = collectUpdates();
  write("public/data/site-updates.json", JSON.stringify({ schemaVersion: "1.0", generatedFrom: ["content/updates/site-updates.json", "assets/data/blog-index.json", "assets/data/document-library.json", "assets/data/podcast-index.json"], updates }, null, 2));
  write("news/index.html", newsPage(updates));
  write("feeds/neuigkeiten.xml", buildRss(updates));
  updateHomepage(updates);
  updateSitemap(updates);
  console.log(`Neuigkeiten gebaut: ${updates.length} Einträge, /news/, Homepage und RSS.`);
  return updates;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) buildSiteUpdates();
