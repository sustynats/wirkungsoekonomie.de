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
  if (story.published) {
    const errors = validateAnalysis(story.analysis, story);
    if (errors.length) fail(`PUBLISHED_STORY_QUALITY_INVALID:${story.story_id}:${errors.join(",")}`);
    if (!fs.existsSync(path.join(ROOT, "wirkungsticker", story.slug, "index.html"))) fail(`STORY_PAGE_MISSING:${story.slug}`);
  }
}

for (const relative of ["news/index.html", "wirkungsticker/index.html", "wirkungsticker/manifest.webmanifest", "wirkungsticker/sw.js", "wirkungsticker/offline.html", "wirkungsticker/feed.xml", "wirkungsticker/feed.atom", "wirkungsticker/feed.json", "wirkungsticker/data/stories.json"]) {
  if (!fs.existsSync(path.join(ROOT, relative))) fail(`GENERATED_FILE_MISSING:${relative}`);
}
const index = fs.readFileSync(path.join(ROOT, "wirkungsticker/index.html"), "utf8");
if (!index.includes("https://wirkungsoekonomie.de/wirkungsticker/") || !index.includes("Methodik und Qualitätsgate")) fail("NEWS_INDEX_INVALID");
if (!index.includes("data-news-search-input") || !index.includes("data-news-load-more") || !index.includes("wirkungsticker/manifest.webmanifest") || !index.includes("Fakten- &amp; Folgencheck öffnen") || !index.includes("Ausgangsmeldung vom") || !index.includes("WÖk-Analyse aktualisiert")) fail("NEWS_APP_UI_INVALID");
for (const story of store.stories.filter((item) => item.published)) {
  const detail = fs.readFileSync(path.join(ROOT, "wirkungsticker", story.slug, "index.html"), "utf8");
  const truthAt = detail.indexOf("Gesicherter Ausgangspunkt");
  const uncertaintyAt = detail.indexOf("Was dieser Stand nicht belegt");
  if (!detail.includes("Wahrheit zuerst:") || truthAt < 0 || uncertaintyAt < 0 || truthAt > uncertaintyAt) fail(`NEWS_TRUTH_FIRST_INVALID:${story.story_id}`);
  if (!detail.includes("Ausgangsmeldung vom") || !detail.includes("WÖk-Analyse:")) fail(`NEWS_SOURCE_DATE_MISSING:${story.story_id}`);
  if (!detail.includes("Erste Ordnung – unmittelbar") || !detail.includes("Risiken, Gegenläufe und Prüfgrenzen")) fail(`NEWS_CONSEQUENCE_PROSE_INVALID:${story.story_id}`);
}
const manifest = readJson("wirkungsticker/manifest.webmanifest");
if (manifest.id !== "/wirkungsticker/" || manifest.scope !== "/wirkungsticker/" || manifest.start_url !== "/wirkungsticker/?source=pwa" || manifest.display !== "standalone" || !Array.isArray(manifest.icons) || manifest.icons.length < 2) fail("NEWS_MANIFEST_INVALID");
const serviceWorker = fs.readFileSync(path.join(ROOT, "wirkungsticker/sw.js"), "utf8");
if (!serviceWorker.includes("NEWS_NOTIFICATIONS_ENABLE") || !serviceWorker.includes("periodicsync") || !serviceWorker.includes("/wirkungsticker/feed.json")) fail("NEWS_SERVICE_WORKER_INVALID");
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
