import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateAnalysis } from "./lib.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(ROOT, relative), "utf8"));
const fail = (message) => { throw new Error(message); };

const registry = readJson("content/news/source-registry.json");
const state = readJson("data/news/state.json");
const store = readJson("data/news/stories.json");
const usage = readJson("data/news/usage.json");

if (registry.schema_version !== "1.0" || !Array.isArray(registry.sources) || registry.sources.length < 5) fail("SOURCE_REGISTRY_INVALID");
const sourceIds = registry.sources.map((source) => source.source_id);
const feedUrls = registry.sources.map((source) => source.feed_url);
if (new Set(sourceIds).size !== sourceIds.length || new Set(feedUrls).size !== feedUrls.length) fail("SOURCE_REGISTRY_DUPLICATES");
for (const source of registry.sources) {
  if (!source.source_id || !source.name || !source.primary_source || !source.enabled) fail(`SOURCE_INVALID:${source.source_id || "unknown"}`);
  if (new URL(source.feed_url).protocol !== "https:" || new URL(source.url).protocol !== "https:") fail(`SOURCE_HTTPS_REQUIRED:${source.source_id}`);
}
if (!state.seen_items || !state.source_status || !Array.isArray(state.pending_story_ids)) fail("STATE_SCHEMA_INVALID");
if (!Array.isArray(store.stories) || !Array.isArray(usage.runs)) fail("DATA_SCHEMA_INVALID");

for (const story of store.stories) {
  if (!story.story_id || !story.slug || !Array.isArray(story.sources) || !Array.isArray(story.claims)) fail(`STORY_SCHEMA_INVALID:${story.story_id || "unknown"}`);
  if (story.sources.some((source) => Object.hasOwn(source, "article_excerpt"))) fail(`TRANSIENT_ARTICLE_TEXT_PERSISTED:${story.story_id}`);
  if (story.published && story.listed !== false) {
    const sourceSummaryWords = String(story.source_summary || "").trim().split(/\s+/).filter(Boolean).length;
    const sourceSummaryParagraphs = String(story.source_summary || "").trim().split(/\n\s*\n/).filter((paragraph) => paragraph.trim()).length;
    if (sourceSummaryWords < 100 || sourceSummaryWords > 180 || sourceSummaryParagraphs < 2 || sourceSummaryParagraphs > 3) fail(`STORY_SOURCE_SUMMARY_INVALID:${story.story_id}:${sourceSummaryWords}:${sourceSummaryParagraphs}`);
    const errors = validateAnalysis({ source_summary: story.source_summary, ...story.analysis }, story, { validateSourceSummaryNumbers: false });
    if (errors.length) fail(`PUBLISHED_STORY_QUALITY_INVALID:${story.story_id}:${errors.join(",")}`);
    if (!fs.existsSync(path.join(ROOT, "wirkungsticker", story.slug, "index.html"))) fail(`STORY_PAGE_MISSING:${story.slug}`);
  }
  if (story.published && story.listed === false) {
    if (!story.retired_at || !story.retirement?.note) fail(`RETIRED_STORY_AUDIT_MISSING:${story.story_id}`);
    const retiredPage = path.join(ROOT, "wirkungsticker", story.slug, "index.html");
    if (!fs.existsSync(retiredPage)) fail(`RETIRED_STORY_PAGE_MISSING:${story.slug}`);
    const retiredHtml = fs.readFileSync(retiredPage, "utf8");
    if (!retiredHtml.includes("Transparenzhinweis") || !retiredHtml.includes('name="robots" content="noindex,follow"')) fail(`RETIRED_STORY_PAGE_INVALID:${story.story_id}`);
  }
}

for (const relative of ["news/index.html", "wirkungsticker/index.html", "wirkungsticker/manifest.webmanifest", "wirkungsticker/sw.js", "wirkungsticker/offline.html", "wirkungsticker/feed.xml", "wirkungsticker/feed.atom", "wirkungsticker/feed.json", "wirkungsticker/data/stories.json"]) {
  if (!fs.existsSync(path.join(ROOT, relative))) fail(`GENERATED_FILE_MISSING:${relative}`);
}
const index = fs.readFileSync(path.join(ROOT, "wirkungsticker/index.html"), "utf8");
if (!index.includes("https://wirkungsoekonomie.de/wirkungsticker/") || !index.includes("Methodik und Qualitätsgate")) fail("NEWS_INDEX_INVALID");
if (!index.includes("data-news-search-input") || !index.includes("data-news-load-more") || !index.includes("wirkungsticker/manifest.webmanifest") || !index.includes("Fakten- &amp; Folgencheck öffnen") || !index.includes("Ausgangsmeldung vom") || !index.includes("WÖk-Analyse aktualisiert") || !index.includes("data-news-refresh-button") || !index.includes("Push-Benachrichtigungen") || !index.includes("data-news-story-id")) fail("NEWS_APP_UI_INVALID");
const activeStories = store.stories.filter((item) => item.published && item.listed !== false).sort((a, b) => Date.parse(b.last_updated) - Date.parse(a.last_updated));
for (const [indexPosition, story] of activeStories.entries()) {
  const detail = fs.readFileSync(path.join(ROOT, "wirkungsticker", story.slug, "index.html"), "utf8");
  const shareUrl = `https://wirkungsoekonomie.de/wirkungsticker/${story.slug}/`;
  if ((detail.match(/data-news-share-button/g) || []).length < 2 || !detail.includes(`data-share-url="${shareUrl}"`) || !detail.includes("assets/js/news-share.js")) fail(`NEWS_SHARE_UI_INVALID:${story.story_id}`);
  if (!detail.includes("data-news-return-to-list") || !detail.includes(`#story-${story.slug}`) || !detail.includes("Zur Übersicht und Leseposition")) fail(`NEWS_RETURN_NAVIGATION_INVALID:${story.story_id}`);
  const newerStory = activeStories[indexPosition - 1];
  const nextStory = activeStories[indexPosition + 1];
  if (newerStory && (!detail.includes("Neuere Meldung") || !detail.includes(`../${newerStory.slug}/`))) fail(`NEWS_NEWER_NAVIGATION_INVALID:${story.story_id}`);
  if (nextStory && (!detail.includes("Nächste Meldung") || !detail.includes(`../${nextStory.slug}/`))) fail(`NEWS_NEXT_NAVIGATION_INVALID:${story.story_id}`);
  const sourceSummaryAt = detail.indexOf("data-news-source-summary");
  const factCheckAt = detail.indexOf("news-fact-check");
  const analysisAt = detail.indexOf("news-story-summary");
  const consequenceAt = detail.indexOf("news-consequence-check");
  if (sourceSummaryAt < 0 || !detail.includes("Worum geht es?") || !detail.includes("Originalquelle ansehen") || !(sourceSummaryAt < factCheckAt && factCheckAt < analysisAt && analysisAt < consequenceAt)) fail(`NEWS_SOURCE_ANALYSIS_ORDER_INVALID:${story.story_id}`);
  const renderedSummary = detail.match(/news-story-summary[\s\S]*?<p class="news-analysis-copy">([\s\S]*?)<\/p>/)?.[1]
    ?.replace(/<[^>]*>/g, " ")
    .replace(/&(?:#\d+|#x[\da-f]+|\w+);/gi, " ")
    .replace(/\s+/g, " ")
    .trim() || "";
  if (renderedSummary.length < 500) fail(`NEWS_DETAIL_SUMMARY_TOO_SHORT:${story.story_id}:${renderedSummary.length}`);
  if (renderedSummary.length > 1200) fail(`NEWS_DETAIL_SUMMARY_TOO_LONG:${story.story_id}:${renderedSummary.length}`);
  const truthAt = detail.indexOf("Gesicherter Ausgangspunkt");
  const uncertaintyAt = detail.indexOf("Was dieser Stand nicht belegt");
  if (!detail.includes("Wahrheit zuerst:") || truthAt < 0 || uncertaintyAt < 0 || truthAt > uncertaintyAt) fail(`NEWS_TRUTH_FIRST_INVALID:${story.story_id}`);
  if (!detail.includes("Ausgangsmeldung vom") || !detail.includes("WÖk-Analyse:")) fail(`NEWS_SOURCE_DATE_MISSING:${story.story_id}`);
  if (!detail.includes("Erste Ordnung – unmittelbar") || !detail.includes("Risiken, Gegenläufe und Prüfgrenzen")) fail(`NEWS_CONSEQUENCE_PROSE_INVALID:${story.story_id}`);
}
const manifest = readJson("wirkungsticker/manifest.webmanifest");
if (manifest.id !== "/wirkungsticker/" || manifest.scope !== "/wirkungsticker/" || manifest.start_url !== "/wirkungsticker/?source=pwa" || manifest.display !== "standalone" || !Array.isArray(manifest.icons) || manifest.icons.length < 2) fail("NEWS_MANIFEST_INVALID");
const serviceWorker = fs.readFileSync(path.join(ROOT, "wirkungsticker/sw.js"), "utf8");
if (!serviceWorker.includes("NEWS_NOTIFICATIONS_ENABLE") || !serviceWorker.includes("NEWS_NOTIFICATIONS_DISABLE") || !serviceWorker.includes("periodicsync") || !serviceWorker.includes('addEventListener("push"') || !serviceWorker.includes("showNotification") || !serviceWorker.includes("setAppBadge") || !serviceWorker.includes("notificationclick") || !serviceWorker.includes("/wirkungsticker/feed.json") || !serviceWorker.includes("/assets/js/news-share.js")) fail("NEWS_SERVICE_WORKER_INVALID");
const pwaScript = fs.readFileSync(path.join(ROOT, "assets/js/news-pwa.js"), "utf8");
if (!pwaScript.includes('window.addEventListener("focus"') || !pwaScript.includes('window.addEventListener("pageshow"') || !pwaScript.includes("feedLatest > pageLatest") || !pwaScript.includes("window.location.reload()") || !pwaScript.includes("pushManager.subscribe") || !pwaScript.includes("/api/news-push") || !pwaScript.includes("${pushApiBase}/subscribe") || !pwaScript.includes("${pushApiBase}/unsubscribe")) fail("NEWS_APP_AUTO_REFRESH_INVALID");
const newsScript = fs.readFileSync(path.join(ROOT, "assets/js/news.js"), "utf8");
if (!newsScript.includes("woek:wirkungsticker:list-state:v1") || !newsScript.includes("sessionStorage") || !newsScript.includes("scrollY") || !newsScript.includes("visibleLimit")) fail("NEWS_LIST_POSITION_RESTORE_INVALID");
const rss = fs.readFileSync(path.join(ROOT, "wirkungsticker/feed.xml"), "utf8");
const atom = fs.readFileSync(path.join(ROOT, "wirkungsticker/feed.atom"), "utf8");
if (!rss.startsWith("<?xml") || !rss.includes("<rss ") || !atom.startsWith("<?xml") || !atom.includes("<feed ")) fail("FEED_INVALID");
const portal = fs.readFileSync(path.join(ROOT, "news/index.html"), "utf8");
if (portal.includes('rel="manifest"') || portal.includes("data-news-app-install")) fail("NEWS_PORTAL_MUST_NOT_SHARE_TICKER_APP");
const legacyIndex = fs.readFileSync(path.join(ROOT, "news/wirkungsticker/index.html"), "utf8");
if (!legacyIndex.includes("/wirkungsticker/")) fail("NEWS_LEGACY_REDIRECT_INVALID");

const sensitiveFiles = [
  "scripts/news/lib.mjs", "scripts/news/run.mjs", "scripts/news/build.mjs", "scripts/news/schedule.mjs",
  "content/news/source-registry.json", "data/news/stories.json", "data/news/state.json", "data/news/usage.json",
];
const secretPatterns = [/\bsk-[A-Za-z0-9_-]{20,}\b/, /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, /\bAKIA[0-9A-Z]{16}\b/];
for (const relative of sensitiveFiles) {
  const text = fs.readFileSync(path.join(ROOT, relative), "utf8");
  if (secretPatterns.some((pattern) => pattern.test(text))) fail(`SECRET_PATTERN_FOUND:${relative}`);
}

console.log(`Wirkungsticker validiert: ${registry.sources.length} Quellen, ${store.stories.filter((story) => story.published).length} veröffentlichte Storys, ${usage.runs.length} protokollierte Läufe.`);
