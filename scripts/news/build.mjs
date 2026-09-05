import { renderStoryVisual, renderEditorialClaimMap } from "./story-visual.mjs";
import fs from "node:fs";
import { publicTitleImage } from "./title-image/pipeline.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ANALYSIS_TYPES, sanitizeVisuals, renderIconSprite, renderIcon, topicIcon, renderStatusChip, renderAnalysisTypeChip,
  renderDimensionMeters, renderImpactPath, renderAtAGlance, renderKeyFigures, renderAffectedGroups, renderTimeline,
  renderChart, publisherInitials,
} from "./visuals.mjs";
import { loadNewsRegistry } from "./registry.mjs";
import { buildSourcePages } from "./source-pages.mjs";
import { canonicalizeUrl } from "./lib.mjs";
import { relatedStories } from "./living-files.mjs";
import { formatReferenceFramework } from "./reference-frameworks.mjs";
import { buildCaseFiles } from "./case-files.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://wirkungsoekonomie.de";
const PUBLIC_RELEASE = "20260905-explanations1";
const STORIES_FILE = path.join(ROOT, "data/news/stories.json");
const EDITORIAL_ANALYSES_FILE = path.join(ROOT, "data/news/editorial-analyses.json");
const TICKER_DIR = path.join(ROOT, "wirkungsticker");
const LEGACY_NEWS_DIR = path.join(ROOT, "news");
const MANIFEST_FILE = path.join(TICKER_DIR, ".generated-story-slugs.json");
const LEGACY_MANIFEST_FILE = path.join(LEGACY_NEWS_DIR, ".generated-story-slugs.json");
const EDITORIAL_MANIFEST_FILE = path.join(TICKER_DIR, "analyse/.generated-analysis-slugs.json");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const normalized = content.replace(/[ \t]+$/gm, "");
  const temporaryFile = `${file}.tmp-${process.pid}`;
  try {
    fs.writeFileSync(temporaryFile, normalized.endsWith("\n") ? normalized : `${normalized}\n`, "utf8");
    fs.renameSync(temporaryFile, file);
  } finally {
    fs.rmSync(temporaryFile, { force: true });
  }
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeXml(value = "") {
  return escapeHtml(value);
}

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function navLink(item, base) {
  const match = (item.match || []).join("|");
  return `<a href="${escapeHtml(`${base}${item.href}`)}" data-nav-match="${escapeHtml(match)}">${escapeHtml(item.label)}</a>`;
}

function renderLayout(base) {
  const navigation = readJson(path.join(ROOT, "assets/data/navigation.json"));
  const header = fs.readFileSync(path.join(ROOT, "templates/header.html"), "utf8")
    .replaceAll("{{BASE}}", base);
  const footerNav = (navigation.footerGroups || []).map((group) => `
<div class="footer-nav-group">
  <h3>${escapeHtml(group.title)}</h3>
  <div class="footer-nav-links">
    ${(group.items || []).map((item) => navLink(item, base)).join("\n    ")}
  </div>
</div>`).join("\n");
  const legal = (navigation.footerLegal || []).map((item) => navLink(item, base)).join("\n");
  const footer = fs.readFileSync(path.join(ROOT, "templates/footer.html"), "utf8")
    .replaceAll("{{BASE}}", base)
    .replace("{{FOOTER_NAV}}", footerNav)
    .replace("{{FOOTER_LEGAL_NAV}}", legal);
  return { header, footer };
}

function formatDate(value, options = {}) {
  if (!value) return "noch kein erfolgreicher Lauf";
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    dateStyle: options.dateOnly ? "medium" : "medium",
    ...(options.dateOnly ? {} : { timeStyle: "short" }),
  }).format(new Date(value));
}

function firstSourceDate(story) {
  const timestamps = (story.sources || [])
    .filter(source => !["legal_context", "election_calendar", "background"].includes(source.source_role))
    .map((source) => Date.parse(source.published_at || ""))
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  return timestamps.length ? new Date(timestamps[0]).toISOString() : story.first_seen;
}

function list(items, className = "") {
  if (!Array.isArray(items) || !items.length) return '<p class="news-analysis-copy">Offen – die Quellenlage reicht für eine belastbare Konkretisierung noch nicht aus.</p>';
  return `<ul${className ? ` class="${className}"` : ""}>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function prose(items, fallback = "Offen – die Quellenlage reicht für eine belastbare Konkretisierung noch nicht aus.") {
  if (!Array.isArray(items) || !items.length) return escapeHtml(fallback);
  return items.map((item) => {
    const sentence = String(item || "").trim();
    return /[.!?]$/.test(sentence) ? sentence : `${sentence}.`;
  }).map(escapeHtml).join(" ");
}

function sourceSummaryParagraphs(value) {
  return String(value || "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
}

function sentenceFragment(value, fallback, maxLength = 96) {
  const text = String(value || fallback || "").trim().replace(/[.!?]+$/, "");
  if (text.length <= maxLength) return text.replace(/[,;:–-]+$/, "").trim();
  const shortened = text.slice(0, maxLength + 1).replace(/\s+\S*$/, "").replace(/[,;:–-]+$/, "").trim();
  return shortened || text.slice(0, maxLength).trim();
}

function expandedDetailSummary(analysis) {
  const direct = String(analysis.detail_summary || "").trim();
  if (direct.length >= 500) return direct;
  const mechanism = sentenceFragment(analysis.mechanisms?.[0], analysis.impact_potential);
  const immediate = sentenceFragment(analysis.first_order?.[0], analysis.impact_potential);
  const downstream = sentenceFragment(analysis.second_order?.[0], analysis.side_effects?.[0]);
  const systemic = sentenceFragment(analysis.systemic_relevance, analysis.third_order?.[0]);
  const uncertainty = sentenceFragment(analysis.uncertainties?.[0], analysis.attribution);
  return [
    String(analysis.summary || "").trim(),
    `Die Relevanzbegründung lautet: ${sentenceFragment(analysis.why_relevant)}.`,
    `Als möglicher Wirkmechanismus gilt: ${mechanism}.`,
    `Als unmittelbare Folge kommt in Betracht: ${immediate}; nachgelagert ist zu prüfen: ${downstream}.`,
    `Für die systemische Perspektive gilt: ${systemic}.`,
    `Die Evidenzgrenze bleibt: ${sentenceFragment(evidenceLevelLabel(analysis.evidence_level))}; zur Zurechnung gilt: ${sentenceFragment(analysis.attribution)}; offen bleibt: ${uncertainty}.`,
  ].filter(Boolean).join(" ");
}

function dimensionLabel(key) {
  return { human: "Mensch", planet: "Planet", democracy: "Demokratie" }[key];
}

function dimensions(story) {
  return ["human", "planet", "democracy"].map((key) => {
    const value = story.analysis[key] || { relevance: "offen", rationale: "Noch nicht belastbar eingeordnet." };
    return `<div class="news-dimension"><strong>${dimensionLabel(key)}</strong><span>${escapeHtml(value.relevance)}</span><span>${escapeHtml(value.rationale)}</span></div>`;
  }).join("");
}

function storyHref(story) {
  return `./${story.slug}/`;
}

function analysisTypeLabel(type) {
  return (ANALYSIS_TYPES[type] || ANALYSIS_TYPES.monitoring).label;
}

export function evidenceLevelLabel(value) {
  const raw = String(value || "").trim();
  const exact = {
    attributed_single_source: "Einer Quelle zugeschrieben; keine unabhängige Bestätigung",
    single_source_attributed: "Einer Quelle zugeschrieben; keine unabhängige Bestätigung",
    single_source_primary_statement: "Primärquelle / Selbstauskunft; keine unabhängige Bestätigung",
    single_source_secondary_report: "Ein journalistischer Bericht; keine unabhängige Bestätigung",
    "single primary-source statement with caveats": "Primärquelle / Selbstauskunft mit Vorbehalten",
  };
  if (exact[raw]) return exact[raw];
  return raw
    .replace(/\battributed_single_source\b/gi, "zugeschriebene Quellenlage")
    .replace(/\bsingle_source_attributed\b/gi, "zugeschriebene Einzelquelle")
    .replace(/\bsingle_source_primary_statement\b/gi, "Primärquelle / Selbstauskunft")
    .replace(/\bsingle_source_secondary_report\b/gi, "ein journalistischer Bericht")
    .replace(/\bsingle_source_claim\b/gi, "einer Quelle zugeschrieben")
    .replace(/\bsingle[-_]source\b/gi, "Einzelquelle")
    .replace(/\bprimary-source statement\b/gi, "Primärquelle / Selbstauskunft")
    .replace(/\bsingle secondary source\b/gi, "ein journalistischer Bericht")
    .replace(/\bsingle journalistische Quelle\b/gi, "einzelne journalistische Quelle");
}

function shareControl(story, suffix = "top", label = "Nachricht teilen") {
  const statusId = `news-share-status-${story.slug}-${suffix}`;
  const shareUrl = `${SITE}/wirkungsticker/${story.slug}/`;
  const shareText = `Wirkungsticker: ${story.analysis.summary}`;
  return `<div class="news-share" data-news-share data-search-exclude><button class="btn btn-secondary news-share__button" type="button" data-news-share-button data-share-title="${escapeHtml(story.title)}" data-share-text="${escapeHtml(shareText)}" data-share-url="${escapeHtml(shareUrl)}" aria-label="${escapeHtml(`Nachricht teilen: ${story.title}`)}" aria-describedby="${escapeHtml(statusId)}"><svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path d="M18 8a3 3 0 1 0-2.83-4A3 3 0 0 0 15 5c0 .18.02.35.05.52L8.91 9.1A3 3 0 0 0 7 8.42a3 3 0 1 0 1.91 5.49l6.14 3.58A3 3 0 0 0 15 18a3 3 0 1 0 .83-2.07l-6.14-3.58c.2-.55.2-1.15 0-1.7l6.14-3.58A3 3 0 0 0 18 8Z" fill="currentColor"/></svg><span>${escapeHtml(label)}</span></button><p class="news-share__status" id="${escapeHtml(statusId)}" data-news-share-status aria-live="polite"></p></div>`;
}

function saveControl(story) {
  return `<button class="btn btn-secondary news-save-button" type="button" data-search-exclude data-wirkungsraum-save-url="/wirkungsticker/${escapeHtml(story.slug)}/" data-wirkungsraum-save-title="${escapeHtml(story.title)}" data-wirkungsraum-save-tags="${escapeHtml((story.topic || []).join(" · "))}" aria-pressed="false" hidden>☆ Merken</button>`;
}

function editorialSaveControl(analysis) {
  return `<button class="btn btn-secondary news-save-button" type="button" data-search-exclude data-wirkungsraum-save-url="/wirkungsticker/analyse/${escapeHtml(analysis.slug)}/" data-wirkungsraum-save-title="${escapeHtml(analysis.title)}" data-wirkungsraum-save-tags="WÖk-Analyse" aria-pressed="false" hidden>☆ Merken</button>`;
}

function editorialShareControl(analysis, suffix = "card") {
  const statusId = `news-share-status-analysis-${analysis.slug}-${suffix}`;
  const url = `${SITE}/wirkungsticker/analyse/${analysis.slug}/`;
  return `<div class="news-share" data-news-share data-search-exclude><button class="btn btn-secondary news-share__button" type="button" data-news-share-button data-share-title="${escapeHtml(analysis.title)}" data-share-text="${escapeHtml(`WÖk-Analyse: ${analysis.teaser}`)}" data-share-url="${escapeHtml(url)}" aria-label="${escapeHtml(`WÖk-Analyse teilen: ${analysis.title}`)}" aria-describedby="${statusId}">${renderIcon("meldung")}<span>Teilen</span></button><p class="news-share__status" id="${statusId}" data-news-share-status aria-live="polite"></p></div>`;
}

function overviewHref(story) {
  return `../#story-${story.case_file?.representative_slug || story.slug}`;
}

function matchesFilter(story, value) {
  if (value === "all") return true;
  if (value === "high") return ["hoch", "sehr hoch"].includes(story.analysis?.importance);
  const topics = (story.topic || []).map((topic) => String(topic).toLowerCase());
  const dimensions = Object.entries({ human: "mensch", planet: "planet", democracy: "demokratie" })
    .filter(([key]) => story.analysis?.[key]?.relevance !== "gering")
    .map(([, label]) => label);
  return [...topics, ...dimensions].includes(value);
}

function caseFileBadge(story) {
  const caseFile = story.case_file;
  if (!caseFile) return "";
  return `<span class="news-badge news-badge--case">Lageakte · ${escapeHtml(caseFile.member_count)} Entwicklungen</span>`;
}

function card(story, index) {
  const a = story.analysis;
  const topics = (story.topic || []).join(" ").toLowerCase();
  const dimensionKeys = Object.entries({ human: "mensch", planet: "planet", democracy: "demokratie" })
    .filter(([key]) => a?.[key]?.relevance !== "gering")
    .map(([, label]) => label)
    .join(" ");
  const high = ["hoch", "sehr hoch"].includes(a.importance);
  const searchText = [
    story.title,
    story.source_summary,
    a.summary,
    a.why_relevant,
    "Faktencheck",
    "Folgencheck",
    ...(story.topic || []),
    ...[a.human, a.planet, a.democracy]
      .filter(Boolean)
      .flatMap((dimension) => [dimension.relevance, dimension.rationale]),
    ...story.sources.map((source) => source.publisher),
  ].join(" ").toLowerCase().slice(0, 2400);
  const visuals = sanitizeVisuals(a.visuals, story).visuals;
  const publishers = [...new Set(story.sources.map((source) => source.publisher).filter(Boolean))];
  const publisherLabel = `${publishers.slice(0, 2).join(", ")}${publishers.length > 2 ? " u. a." : ""}`;
  const version = Number(story.current_version || 1);
  const href = storyHref(story);
  return `<article class="news-card${publicTitleImage(story.title_image)?.wide ? " news-card--visual" : ""}${index === 0 ? " news-card--lead" : ""}" id="story-${escapeHtml(story.slug)}" data-news-card data-news-story-id="${escapeHtml(story.slug)}" data-news-href="${escapeHtml(href)}" data-topic="${escapeHtml(topics)}" data-dimensions="${escapeHtml(dimensionKeys)}" data-high-impact="${high}" data-news-search="${escapeHtml(searchText)}" data-news-updated-at="${escapeHtml(story.last_updated)}">
  <div class="news-card__topline">
    <span class="news-card__topic">${renderIcon(topicIcon(story.topic), "wt-icon--topic")}<span class="card-kicker">${escapeHtml((story.topic || []).slice(0, 3).join(" · "))}</span></span>
    <span class="news-card__flags"><span class="news-badge news-badge--new" data-news-new-badge hidden>Neu</span>${caseFileBadge(story)}${version > 1 ? `<span class="news-badge news-badge--update">Akte aktualisiert · v${version}</span>` : ""}${high ? '<span class="news-badge news-badge--high">Hohe systemische Relevanz</span>' : ""}</span>
  </div>
  ${renderStoryVisual(story, { href, loading: index === 0 ? "eager" : "lazy", sourceLabel: `${publisherLabel} · Ausgangsmeldung ${formatDate(firstSourceDate(story), { dateOnly: true })}` })}
  <div class="news-card__body">
    ${publicTitleImage(story.title_image)?.wide ? "" : `<h2><a href="${escapeHtml(href)}">${escapeHtml(story.title)}</a></h2>`}
    ${story.case_file ? `<p class="news-case-card__meta"><strong>Aktueller Stand</strong> · ${escapeHtml(story.case_file.member_count)} Entwicklungen aus ${escapeHtml(story.case_file.publisher_count)} Medien und Institutionen werden gemeinsam fortgeführt.</p>` : ""}
    <p class="news-card__summary">${escapeHtml(a.summary)}</p>
    <p class="news-card__why"><strong>Warum relevant:</strong> ${escapeHtml(a.why_relevant)}</p>
  </div>
  ${publicTitleImage(story.title_image)?.wide ? "" : `<div class="news-card__signals">
    <div class="news-card__chips">${renderStatusChip(a.status)}${renderAnalysisTypeChip(a.analysis_type, { note: false })}</div>
    ${renderDimensionMeters(a, { compact: index !== 0, tendency: visuals?.tendency || null })}
  </div>`}
  <div class="news-card__footer">
    <span class="news-card__source">${renderIcon("quelle")}<span>${escapeHtml(publisherLabel)} · Ausgangsmeldung vom ${escapeHtml(formatDate(firstSourceDate(story), { dateOnly: true }))}</span></span>
    <span class="news-card__meta">${renderIcon("uhr")}<span>WÖk-Einordnung aktualisiert ${escapeHtml(formatDate(story.last_updated))}</span></span>
    <a class="btn btn-secondary news-card__cta" href="${escapeHtml(href)}">${story.case_file ? "Lageakte öffnen" : "Fakten- &amp; Folgencheck öffnen"}${renderIcon("pfeil")}</a>
    <div class="news-card__actions">${saveControl(story)}${shareControl(story, "card", "Teilen")}</div>
  </div>
</article>`;
}

function editorialCard(analysis, story, index) {
  const href = `./analyse/${analysis.slug}/`;
  const topic = (story?.topic || []).join(" ").toLowerCase();
  const searchText = [analysis.title, analysis.subtitle, analysis.teaser, analysis.analysis_type, ...(story?.topic || [])].join(" ").toLowerCase();
  return `<article class="news-editorial-card${index === 0 ? " news-editorial-card--lead" : ""}" data-news-card data-news-editorial-analysis data-news-story-id="analysis-${escapeHtml(analysis.analysis_id)}" data-news-href="${escapeHtml(href)}" data-topic="${escapeHtml(topic)}" data-dimensions="mensch planet demokratie" data-high-impact="true" data-news-search="${escapeHtml(searchText)}" data-news-updated-at="${escapeHtml(analysis.updated_at)}">
  <div class="news-editorial-card__content"><p class="hero-kicker">WÖk-Analyse</p><h2><a href="${escapeHtml(href)}">${escapeHtml(analysis.title)}</a></h2><p class="news-editorial-card__subtitle">${escapeHtml(analysis.subtitle)}</p><p>${escapeHtml(analysis.teaser)}</p><p class="news-editorial-card__origin">Entstanden aus: <a class="text-link" href="./${escapeHtml(story?.slug || "")}/">${escapeHtml(story?.title || "Wirkungsticker-Story")}</a></p><div class="news-editorial-card__byline"><img src="../assets/img/people/natalie-weber-woek-analyse.jpg" alt="Natalie Weber" width="72" height="72" loading="lazy" decoding="async"><span><strong>Natalie Weber</strong><small><a class="text-link" href="../methodik/">${escapeHtml(analysis.transparency_note)}</a></small><small>${escapeHtml(`${analysis.reading_time_minutes || 8} Min. · veröffentlicht ${formatDate(analysis.published_at, { dateOnly: true })}`)}</small></span></div></div>
  <div class="news-editorial-card__actions"><a class="btn btn-primary" href="${escapeHtml(href)}">Analyse lesen${renderIcon("pfeil")}</a>${editorialSaveControl(analysis)}${editorialShareControl(analysis)}</div>
</article>`;
}

function mixedFeedItems(stories, analyses) {
  if (!analyses.length) return stories.map((story) => ({ type: "story", value: story }));
  const slots = new Map();
  analyses.forEach((analysis, index) => {
    // Analysen sind redaktionell in den Nachrichtenfluss eingestreut. Die
    // Position beeinflusst nicht das wahrheitsgemäße Veröffentlichungsdatum.
    // Gleichmäßige relative Abstände verhindern auch bei mehr als drei
    // relevanten Analysen einen zusammenhängenden Autorenblock.
    const slot = Math.min(stories.length, Math.max(1, Math.floor(((index + 1) * (stories.length + 1)) / (analyses.length + 1))));
    slots.set(slot, [...(slots.get(slot) || []), analysis]);
  });
  const output = [];
  for (let index = 0; index <= stories.length; index += 1) {
    for (const analysis of slots.get(index) || []) output.push({ type: "analysis", value: analysis });
    if (stories[index]) output.push({ type: "story", value: stories[index] });
  }
  return output;
}

function mixedCards(stories, analyses, storiesById) {
  return mixedFeedItems(stories, analyses).map((item, index) => item.type === "analysis"
    ? editorialCard(item.value, storiesById.get(item.value.story_id), index)
    : card(item.value, index)).join("\n");
}

function pageShell({ title, description, canonical, base, body, jsonLd, feedLinks = true, extraScript = "", robots = "", titleImage = null, publicUpdatedAt = "", ogType = "website" }) {
  const { header, footer } = renderLayout(base);
  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | Wirkungsökonomie</title>
  <meta name="description" content="${escapeHtml(description)}">
  ${publicUpdatedAt ? `<meta name="woek-news-revision" content="${PUBLIC_RELEASE}:${escapeHtml(publicUpdatedAt)}">` : ""}
  <link rel="canonical" href="${escapeHtml(canonical)}">
  ${robots ? `<meta name="robots" content="${escapeHtml(robots)}">` : ""}
  <meta property="og:type" content="${escapeHtml(ogType)}">
  <meta property="og:locale" content="de_DE">
  <meta property="og:site_name" content="Wirkungsökonomie">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:image" content="${escapeHtml(titleImage?.og?.url?.startsWith("https://") ? titleImage.og.url : `${SITE}/assets/img/generated/hero-systemgrafik-wirkungsoekonomie.png`)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(titleImage ? `${title} – ${titleImage.label}` : "Wirkungsökonomie")}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${escapeHtml(titleImage?.og?.url?.startsWith("https://") ? titleImage.og.url : `${SITE}/assets/img/generated/hero-systemgrafik-wirkungsoekonomie.png`)}">
  <meta name="theme-color" content="#f7f1e8">
  <meta name="application-name" content="Wirkungsticker">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-title" content="Wirkungsticker">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <link rel="manifest" href="${base}wirkungsticker/manifest.webmanifest">
  <link rel="apple-touch-icon" href="${base}assets/img/brand/apple-touch-icon.png">
  ${feedLinks ? `<link rel="alternate" type="application/rss+xml" title="Wirkungsticker RSS" href="${SITE}/wirkungsticker/feed.xml">
  <link rel="alternate" type="application/atom+xml" title="Wirkungsticker Atom" href="${SITE}/wirkungsticker/feed.atom">
  <link rel="alternate" type="application/feed+json" title="Wirkungsticker JSON Feed" href="${SITE}/wirkungsticker/feed.json">` : ""}
  <link rel="icon" href="${base}assets/img/brand/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${base}assets/css/style.css?v=20260830-news">
  <link rel="stylesheet" href="${base}assets/css/news.css?v=${PUBLIC_RELEASE}">
  <script type="application/ld+json">${safeJson(jsonLd)}</script>
</head>
<body>
${header}
${renderIconSprite()}
${body}
${footer.replace("</footer>", `<nav class="footer-nav-links" aria-label="Wirkungsticker-Transparenz"><a href="${base}wirkungsticker/quellen/">Quellen &amp; Auswahlkriterien</a></nav></footer>`)}
<script src="${base}assets/js/main.js?v=20260904-actions1"></script>
<script src="${base}assets/js/news-install.js?v=20260904-reader2"></script>
<script src="${base}assets/js/news-pwa.js?v=${PUBLIC_RELEASE}"></script>
<script src="${base}assets/js/news-navigation.js?v=20260905-reader3"></script>
${extraScript}
</body>
</html>`;
}

function indexPage(stories, updatedAt, { totalStories = stories.length, caseCount = 0, editorialAnalyses = [], storiesById = new Map() } = {}) {
  const filterGroups = [
    { label: "Auswahl", filters: [["all", "Alle"], ["high", "Hohe systemische Relevanz"]] },
    { label: "Dimension", filters: [["mensch", "Mensch"], ["planet", "Planet"], ["demokratie", "Demokratie"]] },
    { label: "Thema", filters: [
      ["politik", "Politik"], ["wirtschaft", "Wirtschaft"], ["finanzen", "Finanzen"], ["klima", "Klima"], ["energie", "Energie"],
      ["arbeit", "Arbeit"], ["soziales", "Soziales"], ["gesundheit", "Gesundheit"], ["digitalisierung", "Digitalisierung"], ["ki", "KI"],
      ["europa", "Europa"], ["geopolitik", "Geopolitik"], ["bildung", "Bildung"],
    ] },
  ];
  const highCount = stories.filter((story) => matchesFilter(story, "high")).length;
  const filterBar = filterGroups.map((group) => `<div class="news-filter-group" role="group" aria-label="${escapeHtml(group.label)}"><span class="news-filter-group__label" aria-hidden="true">${escapeHtml(group.label)}</span>${group.filters.map(([value, label]) => {
    const count = stories.filter((story) => matchesFilter(story, value)).length;
    return `<button class="news-filter" type="button" data-news-filter="${value}" aria-pressed="${value === "all"}"${count === 0 && value !== "all" ? " hidden" : ""}>${label}<span class="news-filter__count" data-news-filter-count data-total="${count}">${count}</span></button>`;
  }).join("")}</div>`).join("");
  const cards = stories.length ? mixedCards(stories, editorialAnalyses, storiesById) : `<div class="news-empty"><h2>Gerade keine ausreichend belegte Wirkungsnachricht.</h2><p>Der Ticker füllt keine Ausgabe künstlich. Eine Story erscheint erst, wenn Relevanz, Quellenlage und Qualitätsgate tragen.</p></div>`;
  const body = `<main id="main-content" data-search-content data-no-glossary data-news-reader="list">
  <section class="hero news-hero">
    <div class="hero-copy">
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../index.html">Start</a><span aria-hidden="true">/</span><a href="../oeffentlicher-wirkungsraum/">Öffentlicher Wirkungsraum</a></nav>
      <p class="hero-kicker news-hero__kicker">${renderIcon("folgen")}<span>Wirkungsticker</span></p>
      <h1 class="hero-title">Wichtige Nachrichten. Fakten, Folgen, Zusammenhänge.</h1>
      <p class="hero-subtitle">Aus Politik, Wirtschaft, Gesellschaft, Umwelt und Technik. Der Wirkungsticker erklärt, was passiert ist, was belegt ist und welche Folgen möglich sind. Er zeigt Zusammenhänge und prüft auch, wie über Ereignisse gesprochen wird.</p>
      <ul class="news-hero__stats"><li><strong>${stories.length}</strong> aktuelle Lagen und Einzelakten</li><li><strong>${totalStories}</strong> geprüfte Wirkungsakten${caseCount ? ` · ${caseCount} automatisch gebündelte ${caseCount === 1 ? "Lageakte" : "Lageakten"}` : ""}</li>${editorialAnalyses.length ? `<li><strong>${editorialAnalyses.length}</strong> eigenständige WÖk-${editorialAnalyses.length === 1 ? "Analyse" : "Analysen"}</li>` : ""}<li><strong>${highCount}</strong> mit hoher systemischer Relevanz</li><li>${renderIcon("uhr")}<span>Stand ${escapeHtml(formatDate(updatedAt))} · automatische Quellenprüfung</span></li><li><a class="text-link" href="#methodik">Methodik und Qualitätsgate</a> · <a class="text-link" href="quellen/">Quellen &amp; Auswahl</a></li></ul>
    </div>
  </section>
  <section class="section news-reading-guide" aria-labelledby="ticker-reading-title">
    <h2 id="ticker-reading-title">So liest du den Ticker</h2>
    <dl class="news-reading-guide__formats">
      <div><dt>Wirkungsakte</dt><dd>Eine Nachricht wird bei neuen belastbaren Entwicklungen weitergeführt, statt jedes Mal neu erzählt zu werden.</dd></div>
      <div><dt>Lageakte</dt><dd>Mehrere eigenständige Entwicklungen werden erst zusammengeführt, wenn ihr Zusammenhang belastbar ist.</dd></div>
      <div><dt>WÖk-Analyse</dt><dd>Eine Vertiefung ordnet Mechanismen, mögliche Folgen, Unsicherheit und systemische Zusammenhänge ein. Sie bleibt von der Nachrichtenmeldung getrennt.</dd></div>
    </dl>
    <details><summary>Relevanz und Wissensstand richtig lesen</summary><dl class="news-reading-guide__legend">
      <div><dt>hoch / mittel / gering</dt><dd>Relevanz, nicht gut oder schlecht.</dd></div>
      <div><dt>Wirkungspotenzial / Wirkungsrisiko</dt><dd>Mögliche Folge, noch keine eingetretene Wirkung.</dd></div>
      <div><dt>Beobachtete Wirkung</dt><dd>Festgestellte Zustandsveränderung mit entsprechender Evidenz.</dd></div>
      <div><dt>offen</dt><dd>Derzeit nicht ausreichend belegt.</dd></div>
    </dl></details>
  </section>
  <aside class="news-install-promo" data-news-install-promo data-search-exclude hidden aria-labelledby="news-install-promo-title">
    <img src="../assets/img/brand/app-icon-192.png" alt="" width="64" height="64">
    <div class="news-install-promo__copy"><p class="hero-kicker">Deine Nachrichten. Direkt auf dem Startbildschirm.</p><h2 id="news-install-promo-title">Der Wirkungsticker als kostenlose Web-App</h2><p data-news-install-copy>Schnell öffnen, Artikel merken und auf Wunsch Push bei neuen Nachrichten erhalten. Ohne App-Store.</p><div class="news-app-tools__actions" data-news-install-actions><button class="btn btn-primary" type="button" data-news-install-button>Web-App hinzufügen</button><button class="btn btn-secondary" type="button" data-news-install-dismiss>Später</button></div></div>
  </aside>
  <section class="section news-toolbar" aria-label="Wirkungsticker durchsuchen">
    <p class="news-saved-link" data-search-exclude><a class="text-link" href="../mein-wirkungsraum/#gemerkte-inhalte">☆ Meine Merkliste</a></p>
    <div class="news-toolbar__inner">
      <form class="news-search" role="search" onsubmit="return false"><label class="sr-only" for="ticker-search-input">Im Ticker suchen</label><div class="news-search__field">${renderIcon("suche")}<input id="ticker-search-input" type="search" autocomplete="off" placeholder="Im Ticker suchen, z. B. Energie, Arbeit, Demokratie" data-news-search-input></div><p class="news-search__hint"><span>Durchsucht Titel, Kurzanalysen, Themen und Wirkungsdimensionen.</span><a class="text-link" href="../suche.html" data-news-site-search-link>Gesamte Website durchsuchen</a></p></form>
      <div class="news-toolbar__status"><button class="wt-iconbtn" type="button" data-news-refresh-button>${renderIcon("aktualisieren")}<span>Aktualisieren</span></button><span class="news-app-status" data-news-refresh-status aria-live="polite">Stand ${escapeHtml(formatDate(updatedAt))}</span></div>
    </div>
  </section>
  <nav class="news-filter-bar" aria-label="Wirkungsticker filtern"><div class="news-filter-bar__inner">${filterBar}</div></nav>
  <section class="section" aria-labelledby="ticker-stories-title"><div class="section-header"><p class="hero-kicker">Aktuelle Wirkungsakten und Vertiefungen</p><h2 id="ticker-stories-title">Die wichtigsten Wirkungsnachrichten seit dem letzten Update</h2><p data-news-results-status aria-live="polite">${stories.length} belastbar veröffentlichte Lagen und Einzelakten${editorialAnalyses.length ? ` sowie ${editorialAnalyses.length} vertiefende WÖk-${editorialAnalyses.length === 1 ? "Analyse" : "Analysen"}` : ""}. Analysen erscheinen nur bei zusätzlichem systemischem Erkenntnisgewinn und werden zwischen die Meldungen gestreut.</p></div><div class="news-grid">${cards}</div><div class="news-empty" data-news-filter-empty hidden><p>Für diesen Filter und Suchbegriff gibt es derzeit keine veröffentlichte Story.</p></div><div class="news-load-more" data-news-load-more-wrap hidden><button class="btn btn-secondary" type="button" data-news-load-more aria-expanded="false">Weitere Meldungen laden</button></div></section>
  <section class="section news-app-tools" data-news-app-tools hidden aria-labelledby="news-app-title"><article class="card news-app-tools__card"><div><p class="hero-kicker">Wirkungsticker für unterwegs</p><h2 id="news-app-title">${renderIcon("app")}<span>Als Web-App installieren</span></h2><p data-news-install-copy>Lege den Wirkungsticker auf deinen Startbildschirm. Er öffnet dann wie eine eigene App und hält die zuletzt geladenen Inhalte offline bereit.</p><div class="news-app-tools__actions" data-news-install-actions><button class="btn btn-primary" type="button" data-news-install-button>Installieren</button><button class="btn btn-secondary" type="button" data-news-install-dismiss>Später</button></div></div><div class="news-notification-settings"><h3>${renderIcon("glocke")}<span>Aktualisierung und Push</span></h3><p>Die App prüft beim Öffnen, Zurückkehren und regelmäßig während der Nutzung automatisch auf neue oder aktualisierte Wirkungsakten. Du kannst die Prüfung auch sofort anstoßen.</p><div class="news-app-tools__actions"><button class="btn btn-primary" type="button" data-news-refresh-button>Jetzt aktualisieren</button><button class="btn btn-secondary" type="button" data-news-notification-toggle aria-pressed="false">Push aktivieren</button><button class="btn btn-secondary" type="button" data-news-mark-read hidden>Neue als gesehen markieren</button></div><p class="news-app-status" data-news-refresh-status aria-live="polite">Beim Öffnen und danach automatisch aktuell.</p><p>Push-Benachrichtigungen sind nur nach deiner Zustimmung aktiv und jederzeit wieder abschaltbar. Dafür wird eine technische Zustelladresse geschützt gespeichert; Name und E-Mail-Adresse sind nicht erforderlich. <a href="../datenschutz.html#wirkungsticker-push">Datenschutzhinweise zu Push</a>. Unterstützte Smartphones melden neue Inhalte im Hintergrund und zeigen die Zahl ungelesener Meldungen am App-Icon.</p><p class="news-app-status" data-news-notification-status aria-live="polite">Push-Benachrichtigungen sind aus.</p></div></article></section>
  <section class="section section-soft" id="methodik" aria-labelledby="ticker-method-title"><div class="news-method-grid"><article class="card news-principle"><p class="hero-kicker">Was hier anders ist</p><h2>Aufmerksamkeit ist kein Relevanzbeweis.</h2><p>Der Wirkungsticker führt dieselbe Nachricht als lebende Wirkungsakte fort. Ab drei sicher zusammenhängenden Entwicklungen ordnet er auch mehrere getrennte Ereignisse automatisch in einer Lageakte; ihre Fakten, Quellen und Analysen bleiben einzeln nachvollziehbar. Wirkungspotenzial wird nicht als eingetretene Wirkung ausgegeben, und offene Evidenz bleibt offen.</p><p><strong>Was bedeutet Medien- &amp; Sprachwirkung?</strong> Bei relevanten Meldungen prüft der Ticker zusätzlich, wie Wortwahl, Frames, Überschriften und mediale Wiederholung den öffentlichen Resonanzraum beeinflussen können. Kommunikatives Wirkungspotenzial, tatsächlich belegte Wirkung und politische Bewertung bleiben strikt getrennt.</p><p class="news-method-note">Feeds: <a class="text-link" href="feed.xml">RSS</a> · <a class="text-link" href="feed.atom">Atom</a> · <a class="text-link" href="feed.json">JSON Feed</a></p><p class="wirkungsraum-save-row" data-wirkungsraum-actions-row></p></article><div><div class="section-header"><p class="hero-kicker">Qualität vor Takt</p><h2 id="ticker-method-title">So entsteht eine Veröffentlichung.</h2></div><div class="impact-process"><article class="impact-process__step"><span class="impact-process__index">1</span><h3>Breit recherchieren</h3><p>Medien, institutionelle Originalquellen und gezielte offene Forschungssuche liefern Recherchehinweise. Nur kostenlose öffentliche Zugänge, keine Paywall-Umgehung.</p></article><article class="impact-process__step"><span class="impact-process__index">2</span><h3>Vorprüfen und bündeln</h3><p>Doppelte Meldungen, zusammengehörende Entwicklungen, Aktualität und Relevanz werden vor der Analyse geprüft.</p></article><article class="impact-process__step"><span class="impact-process__index">3</span><h3>Gezielt analysieren</h3><p>Nur materialitätsstarke Storys werden einzeln, quellengebunden und getaktet KI-gestützt analysiert. Ein lokaler Trigger aktiviert den Medien- und Sprachcheck nur bei konkreten Auffälligkeiten. Nachrichteninhalte gelten dabei als Daten, nie als Anweisung.</p></article><article class="impact-process__step"><span class="impact-process__index">4</span><h3>Nur Belastbares veröffentlichen</h3><p>Zentrale Behauptungen, Quellenbelege, Attribution, erkennbare Abhängigkeiten und die eigene Sprache werden automatisch geprüft. Unzureichend belegte Aussagen werden zurückgestellt; gekennzeichnete offene Fragen dürfen offen bleiben.</p></article><article class="impact-process__step"><span class="impact-process__index">5</span><h3>Lernen</h3><p>Neue Quellen ergänzen dieselbe Story; frühere Analysen bleiben versioniert. Monitoring und Ex-post-Einordnung folgen erst mit neuen Daten.</p></article></div><p class="notice"><strong>Einordnung, kein amtliches Angebot:</strong> Die Analysen sind unabhängige WÖk-Einordnungen. Ziel- oder Indikatorbezug allein ist weder Wirkung noch Kausalitätsnachweis. Visuelle Anker wie Meter, Verfahrensstand oder Kennzahlen werden aus derselben quellengebundenen Analyse abgeleitet; Kennzahlen verweisen auf die zugrunde liegenden Quellen. Diagramme brauchen vergleichbare Messgrößen, eindeutige Einheiten und konkrete Einzelbelege; unzureichend belegte Diagramme entfallen.</p></div></div></section>
</main>`;
  return pageShell({
    title: "Wirkungsticker",
    publicUpdatedAt: updatedAt,
    description: "Automatisch aktualisierte Nachrichten, quellengebunden geprüft und wirkungsökonomisch eingeordnet: Fakten, mögliche Folgen, Risiken und beobachtete Veränderungen für Mensch, Planet und Demokratie.",
    canonical: `${SITE}/wirkungsticker/`,
    base: "../",
    body,
    jsonLd: {
      "@context": "https://schema.org", "@type": "CollectionPage", "@id": `${SITE}/wirkungsticker/#page`, url: `${SITE}/wirkungsticker/`, name: "Wirkungsticker", inLanguage: "de",
      dateModified: updatedAt, mainEntity: { "@type": "ItemList", itemListElement: stories.map((story, index) => ({ "@type": "ListItem", position: index + 1, url: `${SITE}/wirkungsticker/${story.slug}/`, name: story.title })) },
    },
    extraScript: '<script src="../assets/js/news.js?v=20260904-reader2"></script><script src="../assets/js/news-share.js?v=20260904-actions1"></script>',
  });
}

export function renderClaimEvidenceLinks(claim, sources = []) {
  const articles = new Map();
  for (const proof of claim.evidence || []) {
    const url = canonicalizeUrl(proof.url);
    if (!url) continue;
    if (!articles.has(url)) {
      const source = sources.find((item) => canonicalizeUrl(item.url) === url);
      articles.set(url, { source, excerpts: new Set() });
    }
    const excerpt = proof.excerpt_hash || proof.evidence_id || proof.excerpt;
    if (excerpt) articles.get(url).excerpts.add(excerpt);
  }
  return [...articles].map(([url, { source, excerpts }]) => {
    const publisher = source?.publisher || new URL(url).hostname;
    const count = excerpts.size;
    const label = `${publisher}${count ? ` · ${count} ${count === 1 ? "Textstelle" : "Textstellen"}` : ""}`;
    return `<a class="text-link" href="${escapeHtml(url)}"${source?.title ? ` title="${escapeHtml(source.title)}"` : ""} target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
  }).join("; ");
}

const NEWS_STATUS_LABELS = { developing: "Sich entwickelnde Nachrichtenlage", preliminary: "Vorläufiger Nachrichtenstand", confirmed: "Bestätigter Nachrichtenkern", disputed: "Widersprüchliche Quellenlage", corrected: "Korrigierter Stand", updated: "Aktualisierter Stand" };

function renderNewsStatusNotice(story) {
  if (!story.news_status) return "";
  const label = NEWS_STATUS_LABELS[story.news_status] || "Offener Stand";
  const note = { developing: "Weitere Erkenntnisse können diesen Stand verändern.", preliminary: "Wesentliche Angaben sind noch vorläufig.", disputed: "Die Quellen widersprechen sich in wesentlichen Punkten.", corrected: "Bitte den Korrekturhinweis zu diesem Artikel beachten." }[story.news_status];
  return `<aside class="news-status-notice" role="note" aria-label="Nachrichtenstand"><strong>${escapeHtml(label)}.</strong>${note ? ` ${escapeHtml(note)}` : ""} <a class="text-link" href="#belegstand">Belegstand ansehen</a></aside>`;
}

function renderNewsroomEvidence(story) {
  if (!story.news_status) return "";
  const status = NEWS_STATUS_LABELS[story.news_status] || "Offener Stand";
  const labels = { single_source_claim: "Einer Quelle zugeschrieben", confirmed_claim: "Durch mehrere Belege gestützt", disputed_claim: "Strittig", primary_source_claim: "Primärbeleg / Selbstauskunft", uncertain_claim: "Ungeklärt" };
  const claims = (story.claims || []).filter((claim) => claim.status).map((claim) => `<li><strong>${escapeHtml(labels[claim.status] || "Offen")}:</strong> ${escapeHtml(claim.claim)} ${renderClaimEvidenceLinks(claim, story.sources)}</li>`).join("");
  const followups = (story.followups || []).map((followup) => `<li>${escapeHtml(followup.claim)} – Prüfpunkt: ${escapeHtml(followup.measurable_indicator)}. Nächste Recherche: ${escapeHtml(formatDate(followup.follow_up_date, { dateOnly: true }))}${followup.expected_by ? `; in der Quelle genannter Termin: ${escapeHtml(formatDate(followup.expected_by, { dateOnly: true }))}` : "; kein verbindlicher Quellentermin bekannt"}.</li>`).join("");
  return `<article class="news-story-section news-evidence-status" id="belegstand" aria-label="Nachrichten- und Belegstand"><p class="hero-kicker">${escapeHtml(status)}</p><h2>Was ist wie belegt?</h2><ul>${claims}</ul><p class="news-method-note">Jeder Link führt zu einem Quellartikel. Mehrere Textstellen aus demselben Artikel sind keine voneinander unabhängigen Quellen.</p><p class="news-method-note">Automatische quellengebundene Prüfung, keine Garantie vollständiger oder fehlerfreier Berichterstattung. Abhängigkeiten zwischen Quellen können unerkannt bleiben; eine institutionelle Aussage belegt nicht automatisch den behaupteten Erfolg.</p>${followups ? `<details><summary>Geplante Folgeprüfungen</summary><ul>${followups}</ul></details>` : ""}</article>`;
}

export function renderRelatedStories(story, stories) {
  const related = relatedStories(story, stories);
  if (!related.length) return "";
  return `<section class="section news-related" data-news-related data-search-exclude aria-labelledby="news-related-title"><div class="section-header"><p class="hero-kicker">Im Zusammenhang</p><h2 id="news-related-title">Weitere Nachrichten zum Thema</h2><p>Andere Vorgänge und Hintergründe mit konkretem Themenbezug. Neue Entwicklungen zu diesem Vorgang werden in dieser Akte fortgeschrieben.</p></div><ul class="news-related__list">${related.map(({ story: item, reason }) => `<li><article class="news-story-section"><p class="news-method-note">${escapeHtml(reason)}</p><h3><a class="text-link" href="../${escapeHtml(item.slug)}/">${escapeHtml(item.title)}</a></h3><p>${escapeHtml(item.analysis.summary)}</p><p class="news-method-note">WÖk-Einordnung aktualisiert ${escapeHtml(formatDate(item.last_updated))}</p></article></li>`).join("")}</ul></section>`;
}

function renderConsolidations(story) {
  const entries = story.living_file?.consolidations || [];
  if (!entries.length) return "";
  return `<aside class="notice news-consolidation" role="note"><strong>Zusammengeführte Berichterstattung:</strong> Frühere Meldungen zum selben Vorgang werden in dieser Akte fortgeführt. Die Zusammenführung selbst ist keine neue Nachricht. Frühere Stände bleiben nachvollziehbar:<ul>${entries.map((entry) => `<li><a class="text-link" href="../${escapeHtml(entry.slug)}/">${escapeHtml(entry.title)}</a> · zusammengeführt ${escapeHtml(formatDate(entry.at))}</li>`).join("")}</ul>${story.pending_update?.consolidation ? "<p>Zusätzliche Quellen aus der Zusammenführung stehen zur erneuten Prüfung an. Der angezeigte Nachrichten- und Analysestand bleibt bis dahin unverändert.</p>" : ""}</aside>`;
}

export function renderCaseFile(story, caseFile) {
  if (!caseFile) return "";
  const representative = caseFile.members.find((member) => member.story_id === caseFile.representative_id);
  const isCurrent = story.story_id === caseFile.representative_id;
  const history = caseFile.members.map((member) => `<li${member.current ? ' class="is-current"' : ""}>
    <div class="news-case-file__time"><time datetime="${escapeHtml(member.updated_at)}">${escapeHtml(formatDate(member.updated_at))}</time><span class="news-badge news-badge--update">${escapeHtml(member.kind)}</span></div>
    <h3>${member.story_id === story.story_id ? escapeHtml(member.title) : `<a class="text-link" href="../${escapeHtml(member.slug)}/">${escapeHtml(member.title)}</a>`}</h3>
    <p>${escapeHtml(member.summary)}</p>
  </li>`).join("");
  return `<article class="news-story-section news-case-file" id="lageakte" data-news-case-id="${escapeHtml(caseFile.case_id)}">
    <p class="hero-kicker">${renderIcon("version")}<span>Entwickelnde Nachrichtenlage</span></p>
    <h2>${isCurrent ? "Diese Lageakte bündelt den fortlaufenden Stand" : "Diese Meldung gehört zu einer fortgeführten Lageakte"}</h2>
    <p class="news-analysis-copy">${escapeHtml(caseFile.member_count)} zusammenhängende Entwicklungen aus ${escapeHtml(caseFile.publisher_count)} Medien und Institutionen. Einzelereignisse, Belege und Analysen bleiben getrennt; die Bündelung ordnet nur den gemeinsamen Nachrichtenverlauf.</p>
    ${!isCurrent && representative ? `<p><a class="btn btn-primary" href="../${escapeHtml(representative.slug)}/">Zum aktuellen Stand der Lageakte${renderIcon("pfeil")}</a></p>` : ""}
    <details${isCurrent ? " open" : ""}><summary>Chronologischen Verlauf ${isCurrent ? "anzeigen" : "öffnen"}</summary><ol class="news-case-file__timeline">${history}</ol></details>
  </article>`;
}

function renderMediaImpact(story) {
  const media = story.analysis?.media_impact;
  if (!media?.relevant) return "";
  const framing = media.frame_analysis || media.framing || {};
  const attribution = media.attribution || {};
  const statement = media.speaker_statement || {};
  const resonance = media.discourse_effect || media.resonance || {};
  const path = media.impact_path || {};
  const evidence = media.evidence || {};
  const placement = attribution.placement || [framing.media_usage].filter(Boolean);
  const usage = placement.map((item) => ({ headline: "Überschrift", teaser: "Teaser", body: "Fließtext", quote: "Zitat", caption: "Bildunterschrift", comment: "Kommentar", editorial: "redaktionelle Formulierung", multiple: "mehrere Platzierungen" }[item] || "Platzierung offen")).join(" · ") || "offen";
  const frameTypes = (framing.frame_type || []).join(" · ");
  const detected = framing.frame_detected ?? framing.detected;
  const term = framing.frame_term || framing.term || attribution.original_term;
  const frameSource = attribution.frame_source || framing.origin_in_story;
  const quality = attribution.attribution_quality || framing.attribution_quality;
  const attributionQuality = ({ clear: "klar zugeordnet", clear_but_prominent: "klar zugeordnet, aber stark hervorgehoben", late: "Zuordnung erst im weiteren Text erkennbar", unclear: "unklare Zuordnung", editorial: "redaktionelle Formulierung", unknown: "Zuordnung nicht ausreichend feststellbar", "eindeutig attribuiert": "klar zugeordnet", "grundsätzlich attribuiert": "grundsätzlich zugeordnet", "Attribution erst später sichtbar": "Zuordnung erst im weiteren Text erkennbar", "unklare Attribution": "unklare Zuordnung", "erscheint wie redaktioneller Fakt": "erscheint wie eine redaktionelle Tatsachenfeststellung" })[quality] || "Zuordnung nicht ausreichend feststellbar";
  // The source of a frame is not necessarily the speaker of the reported statement.
  const speakerBlock = statement.present && statement.statement ? `<section><h3>Akteursaussage</h3><p><strong>${escapeHtml(statement.speaker || "Akteur nicht eindeutig benannt")}:</strong> ${escapeHtml(statement.statement)}</p><p class="news-method-note">Die Akteursaussage bleibt vom belegten Ereignis und von der redaktionellen Vermittlung getrennt.</p></section>` : "";
  const frameBlock = detected ? `<section><h3>Sprachlicher Befund</h3><p>Die Bezeichnung <strong>„${escapeHtml(term)}“</strong> setzt einen <a class="text-link" href="../../begriffe/frame/">Deutungsrahmen</a>${frameTypes ? ` (${escapeHtml(frameTypes)})` : ""}. Quelle der Formulierung ist ${escapeHtml(frameSource || "noch nicht eindeutig feststellbar")}.</p><p><strong>Mediale Verwendung:</strong> ${escapeHtml(usage)} · ${escapeHtml(attributionQuality || "Attribution offen")}.</p>${framing.problem_definition ? `<p><strong>Problemdefinition:</strong> ${escapeHtml(framing.problem_definition)}</p>` : ""}${(framing.material_omissions || []).length ? `<p><strong>Materialitätsrelevanter Kontext:</strong> ${escapeHtml(framing.material_omissions.join(" "))}</p>` : ""}</section>` : "";
  const political = media.political_context || {};
  const history = political.relevant && political.evidence_based && political.classification ? `<p><strong>Belegte Verwendungsgeschichte:</strong> ${escapeHtml(political.classification)}${political.uncertainty ? ` ${escapeHtml(political.uncertainty)}` : ""}</p>` : (framing.political_history_relevant && framing.political_history ? `<p><strong>Belegte Verwendungsgeschichte:</strong> ${escapeHtml(framing.political_history)}</p>` : "");
  const comparison = media.source_comparison?.sufficient_basis && media.source_comparison.finding ? `<p><strong>Quellenvergleich:</strong> ${escapeHtml(media.source_comparison.finding)}</p>` : "";
  const resonanceParts = [["Resonanzraum", resonance.resonance_space], ["Resonanzrisiko", resonance.resonance_risk], ["Normalisierung", resonance.normalization_potential], ["Wiederholung / Illusory-Truth-Risiko", resonance.repetition_risk || resonance.repetition_effect], ["Vertrauen", resonance.trust_effect_potential || resonance.trust_effect], ["Polarisierung", resonance.polarization_potential], ["Diskurs", resonance.discourse_effect_potential || resonance.discourse_effect]].filter(([, value]) => value && !["none", "open"].includes(value)).map(([label, value]) => [label, ({ low: "gering", medium: "mittel", high: "hoch", very_high: "sehr hoch" })[value] || value]);
  const pathItems = [["1. Ordnung", path.first_order], ["2. Ordnung", path.second_order], ["3. Ordnung", path.third_order]].filter(([, value]) => value);
  const known = (evidence.facts || []).join(" ") || evidence.what_is_known || "Offen";
  const inferred = (evidence.inferences || []).join(" ") || evidence.what_is_inferred || "Keine zusätzliche Inferenz ausgewiesen.";
  const limitations = (evidence.limitations || []).join(" ") || evidence.what_is_open || "Weitere Wirkungsevidenz bleibt offen.";
  const observed = media.observed_impact || {};
  const observedNotice = observed.present ? `<p><strong>Empirisch beobachtete Kommunikationswirkung:</strong> ${escapeHtml(observed.description)}</p>` : '<p><strong>Wissensgrenze:</strong> Es handelt sich um kommunikatives Wirkungspotenzial beziehungsweise ein Resonanzrisiko; eine konkrete gesellschaftliche Wirkung ist hier nicht nachgewiesen.</p>';
  const alternative = media.fact_first_alternative || media.fact_first_reframe?.summary || media.factual_core;
  return `<article class="news-story-section news-media-impact" id="medienwirkung"><p class="hero-kicker">${renderIcon("meldung")}<span>Frame- &amp; Diskurscheck</span></p><h2>Medien- &amp; Sprachwirkung</h2><p class="news-method-note">Dieser Check untersucht die konkrete Vermittlung, nicht die Gesinnung eines Mediums. Er trennt kommunikatives <a class="text-link" href="../../begriffe/wirkungspotenzial/">Wirkungspotenzial</a>, Wirkungsrisiko und empirisch belegte Wirkung.</p>${media.public_explanation ? `<p class="news-lead">${escapeHtml(media.public_explanation)}</p>` : ""}<div class="news-check-prose"><section><h3>${renderIcon("wahrheit")}Belegter Sachverhalt</h3><p>${escapeHtml(media.factual_core)}</p></section>${frameBlock}${speakerBlock}<section><h3>${renderIcon("folgen")}Mögliches Resonanzrisiko</h3>${resonanceParts.map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`).join("") || "<p>Kein substanzieller Wirkungspfad aus den verfügbaren Belegen ableitbar.</p>"}${history}${comparison}${observedNotice}</section></div>${pathItems.length ? `<h3>Möglicher kommunikativer Wirkpfad</h3><div class="wt-path"><ol class="wt-path__steps">${pathItems.map(([label, value], index) => `<li class="wt-path__step" data-order="${index + 1}"><span class="wt-path__badge"><b>${index + 1}</b><span>${label}</span></span><p>${escapeHtml(value)}</p></li>`).join("")}</ol><p class="wt-path__legend">${renderIcon("folgen")}<span>Mit jeder Ordnung wächst der Abstand zum belegten Sachverhalt und damit die Unsicherheit.</span></p></div>` : ""}<div class="wt-questions"><div><h3>Was ist bekannt?</h3><p>${escapeHtml(known)}</p></div><div><h3>Was ist Inferenz – und was bleibt offen?</h3><p>${escapeHtml(inferred)}</p><p>${escapeHtml(limitations)}</p></div></div>${media.editorial_assessment ? `<p><strong>Einordnung der konkreten Vermittlung:</strong> ${escapeHtml(media.editorial_assessment)}</p>` : ""}<p class="notice"><strong>Sachliche Alternative:</strong> ${escapeHtml(alternative)}</p><p class="news-method-note">Wissensstatus: ${escapeHtml({ high: "hohe Belegnähe", medium: "mittlere Belegnähe", low: "geringe Belegnähe", open: "offen" }[evidence.level || evidence.status] || "offen")}. Keine Absichtszuschreibung und keine Bewertung des Medienhauses.</p></article>`;
}

export function storyPage(story, { newerStory = null, nextStory = null, allStories = [], caseFile = null, editorialAnalysis = null } = {}) {
  const titleImage = publicTitleImage(story.title_image);
  const a = story.analysis;
  const detailSummary = expandedDetailSummary(a);
  const factStatement = String(story.source_summary || detailSummary || a.summary || "").match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || a.summary;
  const truthOpening = story.news_status
    ? `Nach dem derzeit belegten Quellenstand: ${factStatement}`
    : /^(fakt|gesichert|belegt)\b/i.test(factStatement) ? factStatement : `Gesichert ist: ${factStatement}`;
  const primarySourceCount = story.sources.filter((source) => source.primary_source).length;
  const primarySourceNames = [...new Set(story.sources.filter((source) => source.primary_source).map((source) => source.publisher))].join(", ");
  const primary = story.sources.find((source) => source.primary_source && !["legal_context", "election_calendar"].includes(source.source_role)) || story.sources[0];
  const visuals = sanitizeVisuals(a.visuals, story).visuals;
  const originalSources = [...story.sources]
    .filter((source) => source === primary || (source.primary_source && !["legal_context", "election_calendar"].includes(source.source_role)))
    .sort((left, right) => Date.parse(right.published_at || 0) - Date.parse(left.published_at || 0));
  const sourceSummaryLinks = originalSources.map((source, index) => `<a class="text-link" href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer"><span>${index === 0 ? "Originalquelle ansehen" : `Weitere Originalquelle bei ${escapeHtml(source.publisher)}`}</span>${renderIcon("extern")}</a>`).join("");
  const sources = story.sources.map((source) => `<li class="news-source"><span class="news-source__avatar${source.primary_source ? "" : " news-source__avatar--secondary"}" aria-hidden="true">${escapeHtml(publisherInitials(source.publisher))}</span><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer"><span>${escapeHtml(source.publisher)}: ${escapeHtml(source.title)}</span>${renderIcon("extern")}</a><div class="news-source-meta"><span class="news-badge${source.primary_source ? "" : " news-badge--update"}">${source.primary_source ? "Primärbeleg / Selbstauskunft" : "Journalistischer Bericht / Kontext"}</span><span>${escapeHtml(source.date_status === "undated_reference" ? `Ohne Veröffentlichungsdatum · geprüft ${formatDate(source.retrieved_at, { dateOnly: true })}` : formatDate(source.published_at, { dateOnly: true }))}</span>${source.publisher_id ? `<a class="text-link" href="../quellen/${escapeHtml(source.publisher_id)}/">Quellenprofil</a>` : ""}</div></li>`).join("");
  const history = [...(story.versions || [])].reverse().map((version, index) => `<li${index === 0 ? ' class="is-current"' : ""}><strong>Version ${escapeHtml(version.version)} · ${escapeHtml(analysisTypeLabel(version.analysis?.analysis_type))}</strong><span>WÖk-Einordnung ${escapeHtml(formatDate(version.analyzed_at))}</span></li>`).join("")
    + `<li><strong>Ausgangsmeldung</strong><span>${escapeHtml(formatDate(firstSourceDate(story), { dateOnly: true }))}${primary ? ` · ${escapeHtml(primary.publisher)}` : ""}</span></li>`;
  const risks = [...(a.impact_risks || []), ...(a.side_effects || [])];
  const riskList = risks.length
    ? `<ul class="wt-risks">${risks.map((item) => `<li>${renderIcon("risiko")}<span>${escapeHtml(item)}</span></li>`).join("")}</ul>`
    : '<p class="news-analysis-copy">Offen – die Quellenlage reicht für eine belastbare Konkretisierung noch nicht aus.</p>';
  const newerLink = newerStory ? `<a class="news-story-pagination__link news-story-pagination__link--newer" href="${escapeHtml(newerStory.href || `../${newerStory.slug}/`)}"><span aria-hidden="true">←</span><span><small>Neuerer Beitrag</small><strong>${escapeHtml(newerStory.title)}</strong></span></a>` : "";
  const nextLink = nextStory ? `<a class="news-story-pagination__link news-story-pagination__link--next" href="${escapeHtml(nextStory.href || `../${nextStory.slug}/`)}"><span><small>Nächster Beitrag</small><strong>${escapeHtml(nextStory.title)}</strong></span><span aria-hidden="true">→</span></a>` : "";
  const returnLink = `<a class="btn btn-secondary news-return-link" href="${escapeHtml(overviewHref(story))}" data-news-return-to-list><span aria-hidden="true">←</span><span>Zur Übersicht</span></a>`;
  const body = `<main id="main-content" data-search-content data-no-glossary data-news-reader="detail">
  <section class="hero news-hero news-hero--story"><div class="hero-copy"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a><span aria-hidden="true">/</span><a href="../">Wirkungsticker</a></nav><p class="hero-kicker news-hero__kicker">${renderIcon(topicIcon(story.topic))}<span>${escapeHtml((story.topic || []).join(" · "))}</span></p>${titleImage?.wide ? renderStoryVisual(story, { detail: true, loading: "eager", sourceLabel: `${primary?.publisher || ""} · Ausgangsmeldung ${formatDate(firstSourceDate(story), { dateOnly: true })}` }) : `<h1 class="hero-title">${escapeHtml(story.title)}</h1>`}<div class="news-hero__meta">${renderStatusChip(a.status)}${renderAnalysisTypeChip(a.analysis_type, { note: false })}<span>Ausgangsmeldung vom ${escapeHtml(formatDate(firstSourceDate(story), { dateOnly: true }))}</span><span>WÖk-Einordnung: ${escapeHtml(formatDate(story.last_updated))} · Version ${escapeHtml(story.current_version)}</span></div><div class="hero-actions news-hero__actions">${returnLink}${primary ? `<a class="btn btn-primary news-hero__source" href="${escapeHtml(primary.url)}" target="_blank" rel="noopener noreferrer">${renderIcon("extern")}<span>${primary.primary_source ? "Primärquelle" : "Quellbericht"} öffnen: ${escapeHtml(primary.publisher)}</span></a>` : ""}${shareControl(story, "top")}</div></div></section>

  ${renderNewsStatusNotice(story)}
  ${(story.corrections || []).map((correction) => `<aside class="notice" role="note"><strong>Korrektur vom ${escapeHtml(formatDate(correction.at, { dateOnly: true }))}:</strong> ${escapeHtml(correction.note)}</aside>`).join("")}
  <nav class="wt-subnav" aria-label="Abschnitte dieser Wirkungsakte"><div class="wt-subnav__inner"><a href="#nachricht">Nachricht</a><a href="#faktencheck">Belege</a><a href="#folgencheck">Folgen</a><a href="#bedeutung">Vertiefung</a></div></nav>
  <section class="section"><div class="news-story-layout"><div class="news-story-main">
    <article class="news-story-section news-source-summary" data-news-source-summary id="nachricht"><p class="hero-kicker">${renderIcon("meldung")}<span>Nachricht</span></p><h2>Worum geht es?</h2><div class="news-source-summary__copy">${sourceSummaryParagraphs(story.source_summary)}</div>${renderKeyFigures(visuals, story)}${renderChart(visuals)}${renderTimeline(visuals)}<div class="news-source-summary__links">${sourceSummaryLinks}</div></article>
    ${editorialAnalysis ? `<aside class="news-editorial-link" id="woek-analyse" aria-labelledby="woek-analysis-link-title"><p class="hero-kicker">Vertiefung</p><h2 id="woek-analysis-link-title">WÖk-Analyse zu diesem Thema</h2><p><strong>${escapeHtml(editorialAnalysis.title)}</strong></p><p>${escapeHtml(editorialAnalysis.teaser)}</p><a class="btn btn-primary" href="../analyse/${escapeHtml(editorialAnalysis.slug)}/">Systemischen Zusammenhang lesen${renderIcon("pfeil")}</a></aside>` : ""}
    ${renderCaseFile(story, caseFile)}
    ${renderNewsroomEvidence(story)}
    <article class="news-story-section news-fact-check" id="faktencheck"><p class="hero-kicker">${renderIcon("wahrheit")}<span>Quellenprüfung</span></p><h2>Faktencheck</h2><p class="news-method-note"><strong>Wahrheit zuerst:</strong> Der belastbar bestätigte Sachverhalt steht vor Behauptungen, offenen Punkten und möglichen Folgen. So soll bloße Wiederholung keinen falschen Wahrheits­eindruck erzeugen.</p><div class="news-check-prose"><section><h3>${renderIcon("check")}Gesicherter Ausgangspunkt</h3><p>${escapeHtml(truthOpening)}</p><p>Die Prüfung stützt sich auf ${primarySourceCount} ${primarySourceCount === 1 ? "Primärquelle" : "Primärquellen"}${primarySourceNames ? ` von ${escapeHtml(primarySourceNames)}` : ""} und ${story.claims.length} ${story.claims.length === 1 ? "tragenden, quellengebundenen Claim" : "tragende, quellengebundene Claims"}. Der Evidenzstand lautet: ${escapeHtml(evidenceLevelLabel(a.evidence_level))}</p></section><section><h3>${renderIcon("offen")}Was dieser Stand nicht belegt</h3><p>${escapeHtml(a.attribution)} ${escapeHtml(story.claims[0]?.uncertainty || "Vollständiger Kontext und spätere Wirkungsdaten bleiben zu prüfen.")}</p></section></div></article>
    ${renderConsolidations(story)}
    ${renderAtAGlance(story, { formatDate })}
    <article class="news-story-section news-story-summary" id="analyse"><p class="hero-kicker">${renderIcon("systemisch")}<span>Wirkungsökonomische Analyse</span></p><h2>Einordnung im Überblick</h2><p class="news-analysis-copy">${escapeHtml(detailSummary)}</p>${renderAffectedGroups(visuals)}</article>
    <article class="news-story-section" id="einordnung"><p class="hero-kicker">${renderIcon("folgen")}<span>Einordnung</span></p><h2>Warum diese Meldung relevant ist</h2><p class="news-analysis-copy">${escapeHtml(a.why_relevant)}</p>${renderDimensionMeters(a, { tendency: visuals?.tendency || null })}${visuals?.tendency ? '<p class="news-method-note">Tendenz je Dimension: analytische Einschätzung, ob Wirkungspotenzial oder Wirkungsrisiko überwiegt. Kein Nachweis eingetretener Wirkung.</p>' : ""}</article>
    <article class="news-story-section news-consequence-check" id="folgencheck"><p class="hero-kicker">${renderIcon("folgen")}<span>Folgencheck</span></p><h2>Wirkpfad und mögliche Folgen</h2><p class="news-method-note">Ausgangspunkt ist ausschließlich der oben gesicherte Sachverhalt. Der Folgencheck formuliert daraus begründete Wirkungspfade und Unsicherheiten; er ist kein Nachweis bereits eingetretener Wirkung.</p><p class="news-lead"><strong>Wirkungspotenzial:</strong> ${escapeHtml(a.impact_potential)}</p>${renderImpactPath(a, prose)}<h3>Risiken, Gegenläufe und Prüfgrenzen</h3>${riskList}</article>
    <article class="news-story-section" id="bedeutung"><p class="hero-kicker">${renderIcon("transformation")}<span>Systemische Bedeutung</span></p><h2>Was die Meldung für das System bedeutet</h2><div class="wt-meaning"><div class="wt-meaning__item"><h3>${renderIcon("systemisch")}Systemrelevanz</h3><p>${escapeHtml(a.systemic_relevance)}</p></div><div class="wt-meaning__item"><h3>${renderIcon("transformation")}Transformationspotenzial</h3><p>${escapeHtml(a.transformation_potential)}</p></div><div class="wt-meaning__item"><h3>${renderIcon("resilienz")}Resilienz</h3><p>${escapeHtml(a.resilience)}</p></div></div></article>
    ${renderMediaImpact(story)}
    <article class="news-story-section" id="offen"><p class="hero-kicker">${renderIcon("offen")}<span>Offen</span></p><h2>Offene Fragen und Beobachtungspunkte</h2><div class="wt-questions"><div><h3>${renderIcon("offen")}Unsicherheiten</h3>${list(a.uncertainties)}</div><div><h3>${renderIcon("beobachten")}Worauf jetzt zu achten ist</h3>${list(a.watch_next)}</div></div></article>
  </div><aside class="news-story-aside">
    <article class="news-story-section" id="quellen"><p class="hero-kicker">${renderIcon("quelle")}<span>Quellenakte</span></p><h2>Quellen und Belegrollen</h2><ul class="news-source-list">${sources}</ul><div class="wt-evidence"><div class="wt-evidence__item"><strong>${renderIcon("wahrheit")}Evidenzgrad</strong><span>${escapeHtml(evidenceLevelLabel(a.evidence_level))}</span></div><div class="wt-evidence__item"><strong>${renderIcon("check")}Zurechnung</strong><span>${escapeHtml(a.attribution)}</span></div><div class="wt-evidence__item"><strong>${renderIcon("bildung")}Referenzrahmen</strong><span>${escapeHtml((a.reference_frameworks || []).map(formatReferenceFramework).join(" · ") || "objektspezifisch offen")}</span></div></div><p class="news-method-note">Das interne Claim-Ledger bindet ${story.claims.length} ${story.claims.length === 1 ? "tragenden Claim" : "tragende Claims"} an die oben genannten Quellen. Feed-Kurztexte werden nicht als Originalartikel gespiegelt.</p></article>
    <article class="news-story-section"><p class="hero-kicker">${renderIcon("version")}<span>Verlauf</span></p><h2>Versionsverlauf</h2><ol class="wt-versions">${history}</ol><p><a class="text-link" href="${escapeHtml(overviewHref(story))}" data-news-return-to-list>Zurück zur Übersicht an die vorige Leseposition</a></p></article>
  </aside></div></section>
  ${renderRelatedStories(story, allStories)}
  <section class="section news-story-footer" aria-label="Weitere Wirkungsnachrichten"><div class="news-story-footer__inner"><div class="news-story-footer__share"><p class="hero-kicker">Behalten &amp; weitergeben</p><h2>Nachricht merken oder teilen</h2><div class="news-reader-actions">${saveControl(story)}${shareControl(story, "bottom")}<a class="text-link" href="../../mein-wirkungsraum/#gemerkte-inhalte">Meine Merkliste</a></div></div><div class="news-reader-actions" data-search-exclude><button class="btn btn-secondary" type="button" data-news-reader-back hidden>← Zurück im Leseweg</button><p class="news-swipe-hint" data-news-swipe-hint hidden>Wischen: rechts zurück${nextStory ? ", links zur nächsten Meldung" : ""}.</p></div><nav class="news-story-pagination" aria-label="Zwischen Wirkungsnachrichten blättern">${newerLink}<a class="news-story-pagination__overview" href="${escapeHtml(overviewHref(story))}" data-news-return-to-list><span aria-hidden="true">↑</span><span>Zur Übersicht und Leseposition</span></a>${nextLink}</nav></div></section>
</main>`;
  return pageShell({
    title: story.title,
    description: a.summary.slice(0, 158),
    titleImage,
    canonical: `${SITE}/wirkungsticker/${story.slug}/`,
    base: "../../",
    body,
    jsonLd: {
      "@context": "https://schema.org", "@type": "AnalysisNewsArticle", "@id": `${SITE}/wirkungsticker/${story.slug}/#article`,
      url: `${SITE}/wirkungsticker/${story.slug}/`, headline: story.title, description: a.summary, abstract: story.source_summary, inLanguage: "de",
      datePublished: story.published_at, dateModified: story.last_updated,
      ...(titleImage?.og ? { image: titleImage.og.url.startsWith("/") ? `${SITE}${titleImage.og.url}` : titleImage.og.url } : {}),
      author: { "@type": "Organization", name: "Wirkungsökonomie", url: SITE },
      publisher: { "@type": "Organization", name: "Wirkungsökonomie", url: SITE },
      articleSection: story.topic, citation: story.sources.map((source) => source.url),
    },
    extraScript: '<script src="../../assets/js/news-share.js?v=20260904-actions1"></script>',
  });
}

const CLAIM_TYPE_LABELS = {
  fact: "Fakt", observation: "Beobachtung", woek_definition: "WÖk-Definition",
  analytical_inference: "Analytische Inferenz", impact_potential: "Wirkungspotenzial",
  impact_risk: "Wirkungsrisiko", observed_impact: "Beobachtete Wirkung",
  attribution: "Zurechnung", normative_assessment: "Normative Bewertung",
};

export function editorialAnalysisPage(analysis, story, { nextItem = null } = {}) {
  const sourcesById = new Map((analysis.source_snapshot || []).map((source) => [source.source_id, source]));
  const storyAnalysis = story.analysis || {};
  const storyVisuals = sanitizeVisuals(storyAnalysis.visuals, story).visuals;
  const sourceVisuals = [
    renderKeyFigures(storyVisuals, story),
    renderChart(storyVisuals),
    renderTimeline(storyVisuals),
  ].filter(Boolean).join("");
  const visualAnchors = `<section class="news-editorial-visuals" aria-labelledby="analysis-visuals-title">
    <p class="hero-kicker">${renderIcon("systemisch")}<span>Visuelle Einordnung</span></p>
    <h2 id="analysis-visuals-title">Die Wirkungsstruktur auf einen Blick</h2>
    <p class="news-method-note">Die Balken zeigen die Relevanz für Mensch, Planet und Demokratie, nicht eine bereits eingetretene positive oder negative Wirkung. Weiterführende Zahlen und Zeitverläufe erscheinen nur, wenn sie quellengebunden vorliegen.</p>
    ${sourceVisuals ? `<div class="news-editorial-visuals__source-data">${sourceVisuals}</div>` : ""}
    <div class="news-editorial-visuals__dimensions"><h3>Relevanz für Mensch, Planet und Demokratie</h3>${renderDimensionMeters(storyAnalysis)}</div>
    <div class="news-editorial-visuals__path"><h3>Vom Ereignis zur systemischen Folge</h3>${renderImpactPath(storyAnalysis, prose)}</div>
  </section>`;
  const claimMap = renderEditorialClaimMap(analysis);
  const sections = (analysis.sections || []).map((section) => `<section class="news-editorial-article__section" id="${escapeHtml(section.id)}"><h2>${escapeHtml(section.title)}</h2>${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}${section.id === "system" ? claimMap : ""}</section>`).join("");
  const contents = `<nav class="news-editorial-toc" aria-label="Inhaltsverzeichnis der Analyse"><details><summary>In dieser Analyse</summary><ol>${(analysis.sections || []).map(section => `<li><a class="text-link" href="#${escapeHtml(section.id)}">${escapeHtml(section.title)}</a></li>`).join("")}<li><a class="text-link" href="#quellen">Quellen und Belege</a></li></ol></details></nav>`;
  const sourceList = (analysis.source_snapshot || []).map((source) => `<li><a class="text-link" href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.publisher)}: ${escapeHtml(source.title)}</a><span>${source.primary_source ? "Primärquelle / Selbstauskunft" : "Journalistische oder fachliche Kontextquelle"} · ${escapeHtml(formatDate(source.published_at, { dateOnly: true }))}</span></li>`).join("");
  const ledger = (analysis.claim_ledger || []).map((claim) => {
    const linkedSources = (claim.source_ids || []).map((sourceId) => sourcesById.get(sourceId)).filter(Boolean);
    return `<li><div><strong>${escapeHtml(CLAIM_TYPE_LABELS[claim.type] || "Einordnung")}</strong><p>${escapeHtml(claim.claim)}</p></div><p class="news-method-note">Evidenz: ${escapeHtml({ high: "hoch", medium: "mittel", low: "gering", open: "offen" }[claim.evidence_level] || "offen")}${linkedSources.length ? ` · ${linkedSources.map((source) => `<a class="text-link" href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.publisher)}</a>`).join(" · ")}` : ""}${claim.uncertainty ? ` · Grenze: ${escapeHtml(claim.uncertainty)}` : ""}</p></li>`;
  }).join("");
  const counterEvidence = (analysis.counter_evidence || []).map((item) => `<li><strong>${escapeHtml(item.finding)}</strong>${item.effect_on_assessment ? `<span>${escapeHtml(item.effect_on_assessment)}</span>` : ""}</li>`).join("");
  const watch = (analysis.what_changes_the_assessment || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const canonical = `${SITE}/wirkungsticker/analyse/${analysis.slug}/`;
  const storyUrl = `${SITE}/wirkungsticker/${story.slug}/`;
  const nextLink = nextItem ? `<a class="news-story-pagination__link news-story-pagination__link--next" href="${escapeHtml(nextItem.href)}"><span><small>Nächster Beitrag</small><strong>${escapeHtml(nextItem.title)}</strong></span><span aria-hidden="true">→</span></a>` : "";
  const body = `<main id="main-content" data-search-content data-no-glossary data-news-reader="analysis">
  <article class="news-editorial-article">
    <header class="hero news-editorial-hero"><div class="hero-copy"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a><span aria-hidden="true">/</span><a href="../../">Wirkungsticker</a><span aria-hidden="true">/</span><span>WÖk-Analyse</span></nav><p class="hero-kicker">WÖk-Analyse</p><h1 class="hero-title">${escapeHtml(analysis.title)}</h1><p class="hero-subtitle">${escapeHtml(analysis.subtitle)}</p><div class="news-editorial-byline"><img src="../../../assets/img/people/natalie-weber-woek-analyse.jpg" alt="Natalie Weber" width="144" height="144"><div><strong>Natalie Weber</strong><span><a class="text-link" href="../../../methodik/">${escapeHtml(analysis.transparency_note)}</a></span><span>${escapeHtml(analysis.reading_time_minutes || 8)} Min. Lesezeit · veröffentlicht ${escapeHtml(formatDate(analysis.published_at, { dateOnly: true }))}${analysis.updated_at !== analysis.published_at ? ` · aktualisiert ${escapeHtml(formatDate(analysis.updated_at, { dateOnly: true }))}` : ""}</span></div></div><div class="hero-actions"><a class="btn btn-secondary" href="../../${escapeHtml(story.slug)}/">Zur Ursprungsgeschichte</a>${editorialSaveControl(analysis)}${editorialShareControl(analysis, "top")}</div></div></header>
    <section class="section"><div class="news-editorial-layout"><div class="news-editorial-article__main">${analysis.teaser.trim() === analysis.subtitle.trim() ? "" : `<p class="news-editorial-deck">${escapeHtml(analysis.teaser)}</p>`}<aside class="news-editorial-origin" role="note"><strong>Ausgangspunkt dieser Analyse</strong><a class="text-link" href="../../${escapeHtml(story.slug)}/">${escapeHtml(story.title)}</a><span>Aktueller Nachrichten-, Fakten- und Folgencheck</span></aside>${contents}${sections}<details class="news-editorial-toc"><summary>Visuelle Einordnung der Ursprungsgeschichte</summary>${visualAnchors}</details><section class="news-editorial-article__section" id="beobachtungspunkte"><h2>Was die Einschätzung verändern würde</h2><ul>${watch}</ul></section></div><aside class="news-editorial-article__aside"><section class="news-story-section"><p class="hero-kicker">Autorin &amp; Methode</p><img class="news-editorial-author-image" src="../../../assets/img/people/natalie-weber-woek-analyse.jpg" alt="Natalie Weber" width="320" height="429" loading="lazy"><h2>Natalie Weber</h2><p>Gründerin der Wirkungsökonomie. Methodik und redaktionelle Verantwortung für dieses Format.</p><p><a class="btn btn-secondary" href="../../../so-wirkt-wirkungsoekonomie/">Wirkungsökonomie einfach erklärt</a></p><p class="news-method-note"><a class="text-link" href="../../../methodik/">Methodik hinter dieser Analyse</a><br><a class="text-link" href="../../#methodik">So arbeitet der Wirkungsticker</a></p></section><section class="news-story-section" id="quellen"><p class="hero-kicker">Recherchebasis</p><h2>Quellen</h2><ul class="news-editorial-sources">${sourceList}</ul><p class="news-method-note">Quellenrollen und Abhängigkeiten werden getrennt geprüft. Eine institutionelle Aussage belegt nicht automatisch ihre Wirkung.</p></section></aside></div></section>
    <section class="section section-soft"><article class="news-story-section"><p class="hero-kicker">Transparenz</p><h2>Was ist Fakt, was Analyse?</h2><p>Das Claim Ledger trennt Tatsachen, Beobachtungen, analytische Inferenzen, Potenziale, Risiken und belegte Zustandsveränderungen. Es ist keine Rangliste und kein wissenschaftlich exakter Gesamtscore.</p><details><summary>Beleglogik dieser Analyse öffnen</summary><ol class="news-editorial-ledger">${ledger}</ol></details>${counterEvidence ? `<h3>Gegenbefunde und Grenzen</h3><ul class="news-editorial-counterevidence">${counterEvidence}</ul>` : ""}</article></section>
    <section class="section news-story-footer" aria-label="Weitere Wirkungsnachrichten"><div class="news-story-footer__inner"><div><p class="hero-kicker">Aktuelle Lage</p><h2>Zurück zur Wirkungsakte</h2><p>Die Nachricht wird weiter aktualisiert, wenn neue belastbare Entwicklungen hinzukommen.</p><a class="btn btn-primary" href="../../${escapeHtml(story.slug)}/">Aktuelle Wirkungsakte öffnen${renderIcon("pfeil")}</a></div><div class="news-reader-actions">${editorialSaveControl(analysis)}${editorialShareControl(analysis, "bottom")}<a class="text-link" href="../../" data-news-return-to-list>Alle Wirkungsnachrichten</a></div><div class="news-reader-actions" data-search-exclude><button class="btn btn-secondary" type="button" data-news-reader-back hidden>← Zurück im Leseweg</button><p class="news-swipe-hint" data-news-swipe-hint hidden>Wischen: rechts zurück${nextItem ? ", links zum nächsten Beitrag" : ""}.</p></div>${nextItem ? `<nav class="news-story-pagination" aria-label="Zwischen Beiträgen blättern">${nextLink}</nav>` : ""}</div></section>
  </article>
</main>`;
  return pageShell({
    title: analysis.title, description: analysis.seo_description.replaceAll("WÖK-Analyse", "WÖk-Analyse"), canonical, base: "../../../", body, ogType: "article",
    jsonLd: {
      "@context": "https://schema.org", "@type": "Article", "@id": `${canonical}#article`, url: canonical,
      headline: analysis.title, alternativeHeadline: analysis.subtitle, description: analysis.seo_description.replaceAll("WÖK-Analyse", "WÖk-Analyse"),
      inLanguage: "de", datePublished: analysis.published_at, dateModified: analysis.updated_at,
      author: { "@type": "Person", name: "Natalie Weber", url: `${SITE}/ueber-mich.html` },
      publisher: { "@type": "Organization", name: "Wirkungsökonomie", url: SITE },
      isBasedOn: storyUrl, citation: (analysis.source_snapshot || []).map((source) => source.url),
      articleSection: "WÖk-Analyse", wordCount: (analysis.sections || []).flatMap((section) => section.paragraphs || []).join(" ").split(/\s+/).filter(Boolean).length,
    },
    extraScript: '<script src="../../../assets/js/news-share.js?v=20260904-actions1"></script>',
  });
}

function retiredStoryPage(story) {
  const retirement = story.retirement || {};
  const canonicalTargets = (retirement.canonical_story_ids || []).map((storyId) => {
    const target = retirement.canonical_stories?.find((entry) => entry.story_id === storyId);
    return target ? `<li><a href="../${escapeHtml(target.slug)}/">${escapeHtml(target.title)}</a></li>` : "";
  }).filter(Boolean).join("");
  const sources = (story.sources || []).map((source) => `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.publisher)}: ${escapeHtml(source.title)}</a></li>`).join("");
  const body = `<main id="main-content" data-no-glossary>
  <section class="hero news-hero"><div class="hero-copy"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a><span aria-hidden="true">/</span><a href="../">Wirkungsticker</a></nav><p class="hero-kicker">Transparenzhinweis</p><h1 class="hero-title">${escapeHtml(story.title)}</h1><p class="hero-subtitle">Diese Meldung gehört nicht mehr zur laufenden Auswahl des Wirkungstickers.</p><div class="news-hero__meta"><span>Historisch veröffentlicht: ${escapeHtml(formatDate(story.published_at))}</span><span>Erneut geprüft: ${escapeHtml(formatDate(story.retired_at || retirement.at))}</span></div></div></section>
  <section class="section"><article class="news-story-section"><h2>Warum die Meldung nicht mehr gelistet wird</h2><p class="news-analysis-copy">${escapeHtml(retirement.note || "Die erneute Prüfung hat keinen hinreichend neuen und materiellen Nachrichtenwert für die laufende Auswahl bestätigt.")}</p><p>Die frühere Veröffentlichung wird nicht still gelöscht. Sie bleibt als transparenter historischer Stand erhalten, erscheint aber weder auf der aktuellen Übersicht noch in RSS, Atom oder JSON Feed.</p>${canonicalTargets ? `<h3>Fortgeführte Wirkungsakte</h3><ul>${canonicalTargets}</ul>` : ""}</article>
  <article class="news-story-section"><h2>Historische Einordnung</h2><p>${escapeHtml(story.analysis?.summary || "Keine historische Kurzfassung vorhanden.")}</p><h3>Quellen des damaligen Stands</h3><ul class="news-source-list">${sources}</ul><p><a class="text-link" href="../">Zur aktuellen Auswahl</a></p></article></section>
</main>`;
  return pageShell({
    title: `${story.title} – historischer Stand`,
    description: "Transparenzhinweis zu einer nach erneuter Relevanzprüfung nicht mehr gelisteten Wirkungsnachricht.",
    canonical: `${SITE}/wirkungsticker/${story.slug}/`,
    base: "../../",
    body,
    robots: "noindex,follow",
    feedLinks: false,
    jsonLd: {
      "@context": "https://schema.org", "@type": "WebPage", "@id": `${SITE}/wirkungsticker/${story.slug}/#historical`,
      url: `${SITE}/wirkungsticker/${story.slug}/`, name: story.title, inLanguage: "de", dateModified: story.retired_at || retirement.at,
    },
  });
}

function feedXml(items, updatedAt, atom = false) {
  if (atom) return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom"><title>Wirkungsticker</title><subtitle>Wirkungsnachrichten und WÖk-Analysen für Mensch, Planet und Demokratie</subtitle><link href="${SITE}/wirkungsticker/"/><link rel="self" href="${SITE}/wirkungsticker/feed.atom"/><id>${SITE}/wirkungsticker/</id><updated>${updatedAt || new Date(0).toISOString()}</updated>${items.map((item) => `<entry><title>${escapeXml(item.title)}</title><link href="${item.url}"/><id>${item.url}</id><published>${item.published_at}</published><updated>${item.updated_at}</updated><summary>${escapeXml(item.summary)}</summary></entry>`).join("")}</feed>`;
  return `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Wirkungsticker</title><link>${SITE}/wirkungsticker/</link><description>Wirkungsnachrichten und WÖk-Analysen für Mensch, Planet und Demokratie</description><language>de-de</language><lastBuildDate>${new Date(updatedAt || 0).toUTCString()}</lastBuildDate><atom:link href="${SITE}/wirkungsticker/feed.xml" rel="self" type="application/rss+xml"/>${items.map((item) => `<item><title>${escapeXml(item.title)}</title><link>${item.url}</link><guid isPermaLink="true">${item.url}</guid><pubDate>${new Date(item.updated_at).toUTCString()}</pubDate><description>${escapeXml(item.summary)}</description></item>`).join("")}</channel></rss>`;
}

function combinedFeedItems(stories, analyses) {
  return [
    ...stories.map((story) => ({ id: story.story_id, url: `${SITE}/wirkungsticker/${story.slug}/`, title: story.title, summary: story.analysis.summary, published_at: story.published_at, updated_at: story.last_updated, tags: story.topic, type: "Wirkungsakte" })),
    ...analyses.map((analysis) => ({ id: analysis.analysis_id, url: `${SITE}/wirkungsticker/analyse/${analysis.slug}/`, title: `WÖk-Analyse: ${analysis.title}`, summary: analysis.teaser, published_at: analysis.published_at, updated_at: analysis.updated_at, tags: ["WÖk-Analyse"], type: "WÖk-Analyse" })),
  ].sort((left, right) => Date.parse(right.updated_at || 0) - Date.parse(left.updated_at || 0));
}

function legacyRedirect(target, title = "Wirkungsticker") {
  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} – neue Adresse</title><link rel="canonical" href="${escapeHtml(`${SITE}${target}`)}">
<meta http-equiv="refresh" content="0;url=${escapeHtml(target)}"><script>location.replace(${JSON.stringify(target)} + location.search + location.hash)</script></head>
<body><main><h1>${escapeHtml(title)}</h1><p>Der Wirkungsticker hat eine eigene Adresse. <a href="${escapeHtml(target)}">Jetzt öffnen</a>.</p></main></body></html>`;
}

function publicStory(story, editorialAnalysis = null) {
  return {
    story_id: story.story_id,
    title_image: publicTitleImage(story.title_image),
    slug: story.slug,
    title: story.title,
    source_summary: story.source_summary,
    summary: story.analysis.summary,
    detail_summary: story.analysis.detail_summary || null,
    why_relevant: story.analysis.why_relevant,
    topic: story.topic,
    status: story.analysis.status,
    analysis_type: story.analysis.analysis_type,
    importance: story.analysis.importance,
    dimensions: { human: story.analysis.human, planet: story.analysis.planet, democracy: story.analysis.democracy },
    visuals: sanitizeVisuals(story.analysis.visuals, story).visuals,
    media_impact: story.analysis.media_impact?.relevant ? story.analysis.media_impact : null,
    media_analysis_version: story.analysis.media_analysis_version || null,
    media_checked_at: story.analysis.media_checked_at || null,
    editorial_analysis: editorialAnalysis ? { analysis_id: editorialAnalysis.analysis_id, slug: editorialAnalysis.slug, title: editorialAnalysis.title, teaser: editorialAnalysis.teaser, published_at: editorialAnalysis.published_at, updated_at: editorialAnalysis.updated_at } : null,
    first_seen: story.first_seen,
    last_updated: story.last_updated,
    version: story.current_version,
    news_status: story.news_status || null,
    event_id: story.event_id || null,
    case_file: story.case_file ? {
      case_id: story.case_file.case_id,
      member_count: story.case_file.member_count,
      publisher_count: story.case_file.publisher_count,
      members: story.case_file.members,
    } : null,
    source_published_at: firstSourceDate(story),
    published_at: story.published_at,
    evidence_groups: story.evidence_groups || null,
    followups: story.followups || [],
    sources: story.sources.map(({ publisher, url, source_type, published_at, primary_source }) => ({ publisher, url, source_type, published_at, primary_source })),
  };
}

function updateSitemap(stories, updatedAt, oldSlugs, extraRoutes = []) {
  const file = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(file)) return;
  let xml = fs.readFileSync(file, "utf8");
  const routes = new Set([
    "news/wirkungsticker/", "wirkungsticker/",
    ...extraRoutes,
    ...stories.flatMap((story) => [`news/${story.slug}/`, `wirkungsticker/${story.slug}/`]),
    ...oldSlugs.flatMap((slug) => [`news/${slug}/`, `wirkungsticker/${slug}/`]),
  ]);
  for (const route of routes) {
    const escaped = `${SITE}/${route}`.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    xml = xml.replace(new RegExp(`\\s*<url>\\s*<loc>${escaped}<\\/loc>[\\s\\S]*?<\\/url>`, "g"), "");
  }
  const lastmod = String(updatedAt || new Date().toISOString()).slice(0, 10);
  const entries = ["wirkungsticker/", ...stories.map((story) => `wirkungsticker/${story.slug}/`), ...extraRoutes].map((route) => `  <url><loc>${SITE}/${route}</loc><lastmod>${lastmod}</lastmod></url>`).join("\n");
  xml = xml.replace("</urlset>", `${entries}\n</urlset>`);
  write(file, xml);
}

export function buildNewsSite() {
  const data = readJson(STORIES_FILE);
  const editorialStore = fs.existsSync(EDITORIAL_ANALYSES_FILE) ? readJson(EDITORIAL_ANALYSES_FILE) : { analyses: [] };
  const publicationUpdatedAt = [data.public_updated_at || data.updated_at, editorialStore.updated_at].filter(Boolean).sort((left, right) => Date.parse(right) - Date.parse(left))[0];
  const activeStories = (data.stories || []).filter((story) => story.published && story.analysis && story.listed !== false).sort((a, b) => Date.parse(b.last_updated) - Date.parse(a.last_updated));
  const grouping = buildCaseFiles(activeStories);
  const stories = grouping.visibleStories;
  const pageStories = activeStories.map((story) => {
    const caseFile = grouping.caseByStory.get(story.story_id);
    return caseFile ? { ...story, case_file: caseFile } : story;
  });
  const storiesById = new Map(pageStories.map((story) => [story.story_id, story]));
  const editorialAnalyses = (editorialStore.analyses || []).filter((analysis) => analysis.status === "published" && storiesById.has(analysis.story_id)).sort((left, right) => Date.parse(right.updated_at) - Date.parse(left.updated_at));
  const editorialByStory = new Map(editorialAnalyses.map((analysis) => [analysis.story_id, analysis]));
  const readerSequence = mixedFeedItems(stories, editorialAnalyses);
  const readerKey = (item) => `${item.type}:${item.value.story_id || item.value.analysis_id}`;
  const readerNeighbor = (item, offset, fromAnalysis = false) => {
    const index = readerSequence.findIndex((candidate) => readerKey(candidate) === readerKey(item));
    const neighbor = index >= 0 ? readerSequence[index + offset] : null;
    if (!neighbor) return null;
    const prefix = fromAnalysis ? (neighbor.type === "analysis" ? "../" : "../../") : (neighbor.type === "analysis" ? "../analyse/" : "../");
    return { href: `${prefix}${neighbor.value.slug}/`, slug: neighbor.value.slug, title: neighbor.value.title };
  };
  const retiredStories = (data.stories || []).filter((story) => story.published && story.analysis && story.listed === false);
  const sourceManifest = fs.existsSync(MANIFEST_FILE) ? MANIFEST_FILE : LEGACY_MANIFEST_FILE;
  const oldSlugs = fs.existsSync(sourceManifest) ? readJson(sourceManifest).slugs || [] : [];
  const currentSlugs = new Set([...pageStories, ...retiredStories].map((story) => story.slug));
  for (const slug of oldSlugs) {
    if (!currentSlugs.has(slug) && /^[a-z0-9-]+$/.test(slug)) {
      fs.rmSync(path.join(TICKER_DIR, slug), { recursive: true, force: true });
      fs.rmSync(path.join(LEGACY_NEWS_DIR, slug), { recursive: true, force: true });
    }
  }
  const previousEditorialSlugs = fs.existsSync(EDITORIAL_MANIFEST_FILE) ? readJson(EDITORIAL_MANIFEST_FILE).slugs || [] : [];
  const currentEditorialSlugs = new Set(editorialAnalyses.map((analysis) => analysis.slug));
  for (const slug of previousEditorialSlugs) if (!currentEditorialSlugs.has(slug) && /^[a-z0-9-]+$/.test(slug)) fs.rmSync(path.join(TICKER_DIR, "analyse", slug), { recursive: true, force: true });
  write(path.join(TICKER_DIR, "index.html"), indexPage(stories, publicationUpdatedAt, { totalStories: activeStories.length, caseCount: grouping.cases.length, editorialAnalyses, storiesById }));
  for (const story of pageStories) {
    const representativeIndex = stories.findIndex((item) => item.story_id === (story.case_file?.representative_id || story.story_id));
    const sameCaseIds = new Set(story.case_file?.members.map((member) => member.story_id) || []);
    const sequenceItem = { type: "story", value: stories[representativeIndex] || story };
    write(path.join(TICKER_DIR, story.slug, "index.html"), storyPage(story, {
      newerStory: representativeIndex >= 0 ? readerNeighbor(sequenceItem, -1) : null,
      nextStory: representativeIndex >= 0 ? readerNeighbor(sequenceItem, 1) : null,
      allStories: pageStories.filter((item) => !sameCaseIds.has(item.story_id)),
      caseFile: story.case_file || null,
      editorialAnalysis: editorialByStory.get(story.story_id) || null,
    }));
  }
  for (const analysis of editorialAnalyses) {
    const nextItem = readerNeighbor({ type: "analysis", value: analysis }, 1, true);
    write(path.join(TICKER_DIR, "analyse", analysis.slug, "index.html"), editorialAnalysisPage(analysis, storiesById.get(analysis.story_id), { nextItem }));
  }
  for (const story of retiredStories) write(path.join(TICKER_DIR, story.slug, "index.html"), retiredStoryPage(story));
  const feedItems = combinedFeedItems(stories, editorialAnalyses);
  write(path.join(TICKER_DIR, "feed.xml"), feedXml(feedItems, publicationUpdatedAt));
  write(path.join(TICKER_DIR, "feed.atom"), feedXml(feedItems, publicationUpdatedAt, true));
  write(path.join(TICKER_DIR, "feed.json"), JSON.stringify({
    _woek_revision: `${PUBLIC_RELEASE}:${publicationUpdatedAt}`,
    version: "https://jsonfeed.org/version/1.1", title: "Wirkungsticker", home_page_url: `${SITE}/wirkungsticker/`, feed_url: `${SITE}/wirkungsticker/feed.json`, language: "de",
    items: feedItems.map((item) => ({ id: item.url, url: item.url, title: item.title, summary: item.summary, date_published: item.published_at, date_modified: item.updated_at, tags: item.tags, _woek_type: item.type })),
  }, null, 2));
  write(path.join(TICKER_DIR, "data/stories.json"), JSON.stringify({ schema_version: "1.2", updated_at: publicationUpdatedAt, stories: stories.map((story) => publicStory(story, editorialByStory.get(story.story_id))), editorial_analyses: editorialAnalyses.map((analysis) => ({ analysis_id: analysis.analysis_id, story_id: analysis.story_id, slug: analysis.slug, title: analysis.title, subtitle: analysis.subtitle, teaser: analysis.teaser, published_at: analysis.published_at, updated_at: analysis.updated_at, reading_time_minutes: analysis.reading_time_minutes })) }, null, 2));
  write(MANIFEST_FILE, JSON.stringify({ slugs: [...currentSlugs].sort() }, null, 2));
  write(EDITORIAL_MANIFEST_FILE, JSON.stringify({ slugs: [...currentEditorialSlugs].sort() }, null, 2));
  write(path.join(LEGACY_NEWS_DIR, "wirkungsticker/index.html"), legacyRedirect("/wirkungsticker/"));
  for (const story of stories) write(path.join(LEGACY_NEWS_DIR, story.slug, "index.html"), legacyRedirect(`/wirkungsticker/${story.slug}/`, story.title));
  for (const story of retiredStories) write(path.join(LEGACY_NEWS_DIR, story.slug, "index.html"), legacyRedirect(`/wirkungsticker/${story.slug}/`, story.title));
  write(path.join(LEGACY_NEWS_DIR, "feed.xml"), feedXml(feedItems, publicationUpdatedAt));
  write(path.join(LEGACY_NEWS_DIR, "feed.atom"), feedXml(feedItems, publicationUpdatedAt, true));
  write(path.join(LEGACY_NEWS_DIR, "feed.json"), JSON.stringify({
    version: "https://jsonfeed.org/version/1.1", title: "Wirkungsticker", home_page_url: `${SITE}/wirkungsticker/`, feed_url: `${SITE}/wirkungsticker/feed.json`, language: "de",
    items: feedItems.map((item) => ({ id: item.url, url: item.url, title: item.title, summary: item.summary, date_published: item.published_at, date_modified: item.updated_at, tags: item.tags, _woek_type: item.type })),
  }, null, 2));
  const sourceRoutes = buildSourcePages(loadNewsRegistry(ROOT), readJson(path.join(ROOT, "data/news/state.json")), { pageShell, write, escapeHtml, root: ROOT, site: SITE, formatDate });
  const editorialRoutes = editorialAnalyses.map((analysis) => `wirkungsticker/analyse/${analysis.slug}/`);
  updateSitemap(pageStories, publicationUpdatedAt, oldSlugs, [...sourceRoutes, ...editorialRoutes]);
  console.log(`Wirkungsticker gebaut: ${stories.length} aktuelle Lagen und Einzelakten aus ${activeStories.length} Wirkungsakten; ${editorialAnalyses.length} WÖk-Analyse(n), ${grouping.cases.length} Lageakte(n), ${retiredStories.length} transparent archivierte Storys, RSS/Atom/JSON.`);
  return { stories: stories.length, underlying_stories: activeStories.length, editorial_analyses: editorialAnalyses.length, case_files: grouping.cases.length, retired_stories: retiredStories.length, updated_at: publicationUpdatedAt };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) buildNewsSite();
