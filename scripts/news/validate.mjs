import fs from "node:fs";
import { editorialLabel } from "./systemic-analysis.mjs";
import { readerHtmlHasEditorialResidue } from "./reader-copy.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateAnalysis } from "./lib.mjs";
import { loadNewsRegistry, registryErrors } from "./registry.mjs";
import { isMerged, relatedStories } from "./living-files.mjs";
import { buildCaseFiles, caseIntegrityErrors } from "./case-files.mjs";
import { editorialAnalysisValidationErrors, editorialResearchSourceErrors } from "./editorial-analysis.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(ROOT, relative), "utf8"));
const fail = (message) => { throw new Error(message); };

const registry = loadNewsRegistry(ROOT);
const state = readJson("data/news/state.json");
const store = readJson("data/news/stories.json");
const usage = readJson("data/news/usage.json");
const editorialStore = fs.existsSync(path.join(ROOT, "data/news/editorial-analyses.json")) ? readJson("data/news/editorial-analyses.json") : { candidates: [], analyses: [] };

if (registry.schema_version !== "1.0" || !Array.isArray(registry.sources) || registry.sources.length < 5) fail("SOURCE_REGISTRY_INVALID");
const sourceErrors = registryErrors(registry);
if (sourceErrors.length) fail(sourceErrors.join(","));
if (!state.seen_items || !state.source_status || !Array.isArray(state.pending_story_ids)) fail("STATE_SCHEMA_INVALID");
if (!Array.isArray(store.stories) || !Array.isArray(usage.runs) || !Array.isArray(editorialStore.candidates) || !Array.isArray(editorialStore.analyses)) fail("DATA_SCHEMA_INVALID");
const storiesById = new Map(store.stories.map((story) => [story.story_id, story]));
if (storiesById.size !== store.stories.length) fail("DUPLICATE_STORY_ID");

for (const story of store.stories) {
  if (!story.story_id || !story.slug || !Array.isArray(story.sources) || !Array.isArray(story.claims)) fail(`STORY_SCHEMA_INVALID:${story.story_id || "unknown"}`);
  if (story.sources.some((source) => Object.hasOwn(source, "article_excerpt"))) fail(`TRANSIENT_ARTICLE_TEXT_PERSISTED:${story.story_id}`);
  if (isMerged(story)) {
    if (story.listed !== false || state.pending_story_ids.includes(story.story_id)) fail(`MERGED_STORY_STILL_QUEUED:${story.story_id}`);
    const targets = story.retirement.canonical_story_ids || [];
    if (!targets.length || targets.some((id) => id === story.story_id || !storiesById.get(id)?.published || isMerged(storiesById.get(id)))) fail(`MERGED_STORY_TARGET_INVALID:${story.story_id}`);
  }
  for (const id of isMerged(story) ? [] : story.living_file?.merged_story_ids || []) {
    if (!isMerged(storiesById.get(id) || {}) || !storiesById.get(id).retirement.canonical_story_ids.includes(story.story_id)) fail(`LIVING_FILE_ALIAS_INVALID:${story.story_id}:${id}`);
  }
  if (story.published && story.listed !== false) {
    const sourceSummaryWords = String(story.source_summary || "").trim().split(/\s+/).filter(Boolean).length;
    const sourceSummaryParagraphs = String(story.source_summary || "").trim().split(/\n\s*\n/).filter((paragraph) => paragraph.trim()).length;
    if (sourceSummaryWords < (story.analysis.publication_depth === "initial" ? 60 : 100) || sourceSummaryWords > 180 || sourceSummaryParagraphs < 2 || sourceSummaryParagraphs > 3) fail(`STORY_SOURCE_SUMMARY_INVALID:${story.story_id}:${sourceSummaryWords}:${sourceSummaryParagraphs}`);
    const errors = validateAnalysis({ source_summary: story.source_summary, ...story.analysis }, story, { validateSourceSummaryNumbers: false, persisted: true });
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
if (!index.includes("data-news-search-input") || !index.includes("data-news-load-more") || !index.includes("wirkungsticker/manifest.webmanifest") || !index.includes("Fakten- &amp; Folgencheck öffnen") || !index.includes("Ausgangsmeldung vom") || !index.includes("WÖk-Einordnung aktualisiert") || !index.includes("data-news-refresh-button") || !index.includes("Push-Benachrichtigungen") || !index.includes("data-news-story-id")) fail("NEWS_APP_UI_INVALID");
const activeStories = store.stories.filter((item) => item.published && item.listed !== false).sort((a, b) => Date.parse(b.last_updated) - Date.parse(a.last_updated));
const grouping = buildCaseFiles(activeStories);
const readerOrder = [...index.matchAll(/data-news-href="\.\/([^"]+\/)"/g)].map((match) => match[1]);
const detailReaderHref = (href) => href.startsWith("analyse/") ? `../${href}` : `../${href}`;
for (const story of activeStories) {
  const detail = fs.readFileSync(path.join(ROOT, "wirkungsticker", story.slug, "index.html"), "utf8");
  if (readerHtmlHasEditorialResidue(detail)) fail(`NEWS_PUBLIC_EDITORIAL_RESIDUE:${story.story_id}`);
  const caseFile = grouping.caseByStory.get(story.story_id);
  const sameCaseIds = new Set(caseFile?.members.map((member) => member.story_id) || []);
  const expectedRelated = relatedStories(story, activeStories.filter((item) => !sameCaseIds.has(item.story_id)));
  const relatedBlock = detail.match(/<section\b[^>]*data-news-related[\s\S]*?<\/section>/)?.[0] || "";
  if (Boolean(expectedRelated.length) !== Boolean(relatedBlock) || (relatedBlock.match(/<li>/g) || []).length !== expectedRelated.length
    || expectedRelated.some(({ story: item }) => !relatedBlock.includes(`../${item.slug}/`)) || (relatedBlock && !relatedBlock.includes("data-search-exclude"))) fail(`NEWS_RELATED_UI_INVALID:${story.story_id}`);
  const shareUrl = `https://wirkungsoekonomie.de/wirkungsticker/${story.slug}/`;
  if ((detail.match(/data-news-share-button/g) || []).length < 2 || !detail.includes(`data-share-url="${shareUrl}"`) || !detail.includes("assets/js/news-share.js")) fail(`NEWS_SHARE_UI_INVALID:${story.story_id}`);
  const representativeSlug = caseFile?.representative_slug || story.slug;
  if (!detail.includes("data-news-return-to-list") || !detail.includes(`#story-${representativeSlug}`) || !detail.includes("Zur Übersicht und Leseposition")) fail(`NEWS_RETURN_NAVIGATION_INVALID:${story.story_id}`);
  const indexPosition = readerOrder.indexOf(`${representativeSlug}/`);
  const newerHref = readerOrder[indexPosition - 1];
  const nextHref = readerOrder[indexPosition + 1];
  if (newerHref && (!detail.includes("Neuerer Beitrag") || !detail.includes(`href="${detailReaderHref(newerHref)}"`))) fail(`NEWS_NEWER_NAVIGATION_INVALID:${story.story_id}`);
  if (nextHref && (!detail.includes("Nächster Beitrag") || !detail.includes(`href="${detailReaderHref(nextHref)}"`))) fail(`NEWS_NEXT_NAVIGATION_INVALID:${story.story_id}`);
  if (caseFile && (!detail.includes(`data-news-case-id="${caseFile.case_id}"`) || !detail.includes("Einzelereignisse, Belege und Analysen bleiben getrennt")
    || caseFile.members.some((member) => !detail.includes(`../${member.slug}/`) && member.story_id !== story.story_id))) fail(`NEWS_CASE_FILE_UI_INVALID:${story.story_id}`);
  if (!caseFile && detail.includes("data-news-case-id=")) fail(`NEWS_STALE_CASE_MEMBERSHIP:${story.story_id}`);
  const sourceSummaryAt = detail.indexOf("data-news-source-summary");
  const factCheckAt = detail.indexOf("news-fact-check");
  const analysisAt = detail.indexOf("news-story-summary");
  const consequenceAt = detail.indexOf("news-consequence-check");
  if (sourceSummaryAt < 0 || !detail.includes("Worum geht es?") || !detail.includes("Originalquelle ansehen") || !(sourceSummaryAt < factCheckAt && factCheckAt < analysisAt && analysisAt < consequenceAt)) fail(`NEWS_SOURCE_ANALYSIS_ORDER_INVALID:${story.story_id}`);
  const mediaAt = detail.indexOf('id="medienwirkung"');
  if (story.analysis.media_impact?.relevant) {
    if (mediaAt < consequenceAt || !detail.includes("Medien- &amp; Sprachwirkung") || !detail.includes("Belegter Sachverhalt") || !detail.includes("Mögliches Resonanzrisiko") || !detail.includes('href="../../begriffe/frame/"') || (!story.analysis.media_impact.observed_impact?.present && !detail.includes('href="../../begriffe/wirkungspotenzial/"'))) fail(`NEWS_MEDIA_IMPACT_UI_INVALID:${story.story_id}`);
  } else if (mediaAt >= 0 || detail.includes('href="#medienwirkung"')) fail(`NEWS_MEDIA_IMPACT_UI_UNTRIGGERED:${story.story_id}`);
  const renderedSummary = detail.match(/news-story-summary[\s\S]*?<p class="news-analysis-copy">([\s\S]*?)<\/p>/)?.[1]
    ?.replace(/<[^>]*>/g, " ")
    .replace(/&(?:#\d+|#x[\da-f]+|\w+);/gi, " ")
    .replace(/\s+/g, " ")
    .trim() || "";
  if (renderedSummary.length < (story.analysis.publication_depth === "initial" ? 300 : 500)) fail(`NEWS_DETAIL_SUMMARY_TOO_SHORT:${story.story_id}:${renderedSummary.length}`);
  if (renderedSummary.length > 1200) fail(`NEWS_DETAIL_SUMMARY_TOO_LONG:${story.story_id}:${renderedSummary.length}`);
  const truthAt = detail.indexOf("Gesicherter Ausgangspunkt");
  const uncertaintyAt = detail.indexOf("Was dieser Stand nicht belegt");
  if (truthAt < factCheckAt || uncertaintyAt < truthAt || uncertaintyAt > analysisAt) fail(`NEWS_TRUTH_FIRST_INVALID:${story.story_id}`);
  if (!detail.includes("Ausgangsmeldung vom") || !detail.includes("WÖk-Einordnung:")) fail(`NEWS_SOURCE_DATE_MISSING:${story.story_id}`);
  if (!detail.includes("Erste Ordnung – unmittelbar") || !detail.includes("Risiken, Gegenläufe und Prüfgrenzen")) fail(`NEWS_CONSEQUENCE_PROSE_INVALID:${story.story_id}`);
}
for (const caseFile of grouping.cases) {
  const integrityErrors = caseIntegrityErrors(caseFile, activeStories);
  if (integrityErrors.length) fail(integrityErrors.join(","));
  if (caseFile.member_count < 3 || !caseFile.members.some((member) => member.current) || caseFile.members.filter((member) => member.current).length !== 1) fail(`NEWS_CASE_FILE_INVALID:${caseFile.case_id}`);
  if (!index.includes(`story-${caseFile.representative_slug}`) || caseFile.members.filter((member) => index.includes(`story-${member.slug}`)).length !== 1) fail(`NEWS_CASE_FILE_INDEX_INVALID:${caseFile.case_id}`);
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
for (const analysis of editorialStore.analyses.filter((item) => item.status === "published")) {
  const story = storiesById.get(analysis.story_id);
  if (!story?.published || story.listed === false) fail(`EDITORIAL_STORY_INVALID:${analysis.analysis_id}`);
  const errors = editorialAnalysisValidationErrors(analysis, story, { candidate: true, evidence_gate: { passed: Boolean(analysis.evidence_gate?.passed) } });
  if (errors.length) fail(`EDITORIAL_ANALYSIS_QUALITY_INVALID:${analysis.analysis_id}:${errors.join(",")}`);
  const sourceIds = new Set((analysis.source_snapshot || []).map((source) => source.source_id));
  for (const source of (analysis.source_snapshot || []).filter(source => source.editorial_review)) {
    const researchErrors = editorialResearchSourceErrors(source, story.story_id);
    if (researchErrors.length) fail(`EDITORIAL_RESEARCH_INVALID:${analysis.analysis_id}:${researchErrors.join(",")}`);
  }
  if ((analysis.sections || []).some(section => (section.source_ids || []).some(id => !sourceIds.has(id)))) fail(`EDITORIAL_SECTION_SOURCE_INVALID:${analysis.analysis_id}`);
  if (sourceIds.size < 2 || (analysis.claim_ledger || []).some((claim) => (claim.source_ids || []).some((sourceId) => !sourceIds.has(sourceId)))) fail(`EDITORIAL_SOURCE_LEDGER_INVALID:${analysis.analysis_id}`);
  const analysisFile = path.join(ROOT, "wirkungsticker/analyse", analysis.slug, "index.html");
  if (!fs.existsSync(analysisFile)) fail(`EDITORIAL_PAGE_MISSING:${analysis.analysis_id}`);
  const html = fs.readFileSync(analysisFile, "utf8");
  if (readerHtmlHasEditorialResidue(html)) fail(`EDITORIAL_PAGE_EDITORIAL_RESIDUE:${analysis.analysis_id}`);
  if (!html.includes(editorialLabel(analysis)) || !html.includes("Natalie Weber") || !html.includes("natalie-weber-woek-analyse.jpg") || !html.includes(analysis.transparency_note) || !html.includes(`wirkungsticker/analyse/${analysis.slug}/`) || !html.includes(`../../${story.slug}/`) || !html.includes('"@type":"Article"')) fail(`EDITORIAL_PAGE_INVALID:${analysis.analysis_id}`);
  const readerIndex = readerOrder.indexOf(`analyse/${analysis.slug}/`);
  const nextHref = readerOrder[readerIndex + 1];
  const analysisNextHref = nextHref?.startsWith("analyse/") ? `../${nextHref.slice("analyse/".length)}` : nextHref ? `../../${nextHref}` : null;
  if (readerIndex < 0 || !html.includes('data-news-reader="analysis"') || !html.includes("data-news-reader-back") || (nextHref && (!html.includes("Nächster Beitrag") || !html.includes(`href="${analysisNextHref}"`)))) fail(`EDITORIAL_READER_NAVIGATION_INVALID:${analysis.analysis_id}`);
  const storyHtml = fs.readFileSync(path.join(ROOT, "wirkungsticker", story.slug, "index.html"), "utf8");
  if (!storyHtml.includes(`../analyse/${analysis.slug}/`) || !rss.includes(`/wirkungsticker/analyse/${analysis.slug}/`)) fail(`EDITORIAL_BACKLINK_OR_FEED_INVALID:${analysis.analysis_id}`);
}
const portal = fs.readFileSync(path.join(ROOT, "news/index.html"), "utf8");
if (portal.includes('rel="manifest"') || portal.includes("data-news-app-install")) fail("NEWS_PORTAL_MUST_NOT_SHARE_TICKER_APP");
const legacyIndex = fs.readFileSync(path.join(ROOT, "news/wirkungsticker/index.html"), "utf8");
if (!legacyIndex.includes("/wirkungsticker/")) fail("NEWS_LEGACY_REDIRECT_INVALID");

const sensitiveFiles = [
  "scripts/news/lib.mjs", "scripts/news/run.mjs", "scripts/news/build.mjs", "scripts/news/schedule.mjs",
  "scripts/news/living-files.mjs", "scripts/news/case-files.mjs",
  "content/news/source-registry.json", "data/news/stories.json", "data/news/state.json", "data/news/usage.json",
];
const secretPatterns = [/\bsk-[A-Za-z0-9_-]{20,}\b/, /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, /\bAKIA[0-9A-Z]{16}\b/];
for (const relative of sensitiveFiles) {
  const text = fs.readFileSync(path.join(ROOT, relative), "utf8");
  if (secretPatterns.some((pattern) => pattern.test(text))) fail(`SECRET_PATTERN_FOUND:${relative}`);
}

console.log(`Wirkungsticker validiert: ${registry.sources.length} Quellen, ${store.stories.filter((story) => story.published).length} veröffentlichte Storys, ${usage.runs.length} protokollierte Läufe.`);
