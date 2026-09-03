#!/usr/bin/env node

import fs from "node:fs";

const fail = (message) => { throw new Error(message); };
const read = (file) => fs.readFileSync(file, "utf8");
const data = JSON.parse(read("public/data/site-updates.json"));

if (data.schemaVersion !== "1.0" || !Array.isArray(data.updates)) fail("SITE_UPDATES_SCHEMA_INVALID");
if (data.updates.length < 50) fail(`SITE_UPDATES_TOO_FEW:${data.updates.length}`);
if (new Set(data.updates.map((item) => item.id)).size !== data.updates.length) fail("SITE_UPDATES_DUPLICATE_IDS");
for (const item of data.updates) {
  if (!item.id || !item.title || !item.summary || !item.url || !item.date || !item.area || !item.kind) fail(`SITE_UPDATE_INCOMPLETE:${item.id || "unknown"}`);
  if (!String(item.date).startsWith("2026")) fail(`SITE_UPDATE_OUTSIDE_2026:${item.id}`);
  if (String(item.url).startsWith("/")) {
    const pathname = String(item.url).split(/[?#]/, 1)[0].replace(/^\//, "");
    const target = pathname.endsWith("/") ? `${pathname}index.html` : pathname;
    if (!fs.existsSync(target)) fail(`SITE_UPDATE_TARGET_MISSING:${item.id}:${item.url}`);
  }
}

const page = read("news/index.html");
if (!page.includes("<h1 class=\"hero-title\">Neues aus der Wirkungsökonomie</h1>")) fail("SITE_UPDATES_PAGE_TITLE_MISSING");
if (!page.includes("data-woek-newsletter-control") || !page.includes("/feeds/neuigkeiten.xml")) fail("SITE_UPDATES_SUBSCRIPTIONS_MISSING");
if (!page.includes("href=\"wirkungsticker/\"")) fail("SITE_UPDATES_TICKER_LINK_MISSING");
if (!page.includes('rel="manifest" href="manifest.webmanifest"') || !page.includes("data-news-app-install")) fail("SITE_UPDATES_PWA_OFFER_MISSING");
if (!read("assets/js/site-updates.js").includes("const pageSize = 10;")) fail("SITE_UPDATES_PAGE_SIZE_INVALID");
for (const file of ["news/manifest.webmanifest", "news/sw.js", "news/offline.html"]) {
  if (!fs.existsSync(file)) fail(`SITE_UPDATES_PWA_FILE_MISSING:${file}`);
}

const home = read("index.html");
if (!home.includes('id="neues-aus-der-wirkungsoekonomie"') || home.includes('id="aktuell-journal"')) fail("HOMEPAGE_UPDATES_SECTION_INVALID");

const rss = read("feeds/neuigkeiten.xml");
if (!rss.startsWith("<?xml") || !rss.includes("<rss ") || !rss.includes("Neues aus der Wirkungsökonomie")) fail("SITE_UPDATES_RSS_INVALID");
const rssItems = (rss.match(/<item>/g) || []).length;
if (rssItems !== data.updates.length) fail(`SITE_UPDATES_RSS_COUNT:${rssItems}:${data.updates.length}`);

console.log(`Neuigkeiten validiert: ${data.updates.length} Einträge, Homepage, Landingpage und RSS.`);
