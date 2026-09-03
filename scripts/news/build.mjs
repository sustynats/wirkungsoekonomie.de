import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://wirkungsoekonomie.de";
const STORIES_FILE = path.join(ROOT, "data/news/stories.json");
const NEWS_DIR = path.join(ROOT, "news");
const MANIFEST_FILE = path.join(NEWS_DIR, ".generated-story-slugs.json");

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
  return `../${story.slug}/`;
}

function card(story, index) {
  const topics = (story.topic || []).join(" ").toLowerCase();
  const dimensionKeys = Object.entries({ human: "mensch", planet: "planet", democracy: "demokratie" })
    .filter(([key]) => story.analysis?.[key]?.relevance !== "gering")
    .map(([, label]) => label)
    .join(" ");
  const high = ["hoch", "sehr hoch"].includes(story.analysis.importance);
  const searchText = [
    story.title,
    story.analysis.summary,
    story.analysis.why_relevant,
    "Faktencheck",
    "Folgencheck",
    ...(story.topic || []),
    ...Object.values(story.analysis)
      .filter((value) => value && typeof value === "object" && !Array.isArray(value))
      .flatMap((value) => Object.values(value).filter((item) => typeof item === "string")),
    ...story.sources.map((source) => source.publisher),
  ].join(" ").toLowerCase().slice(0, 2400);
  return `<article class="news-card${index === 0 ? " news-card--lead" : ""}" data-news-card data-topic="${escapeHtml(topics)}" data-dimensions="${escapeHtml(dimensionKeys)}" data-high-impact="${high}" data-news-search="${escapeHtml(searchText)}" data-news-updated-at="${escapeHtml(story.last_updated)}">
  <div class="news-card__eyebrow">
    <span class="news-badge news-badge--new" data-news-new-badge hidden>Neu</span>
    <span class="news-badge">${escapeHtml(story.analysis.status)}</span>
    <span class="news-badge">${escapeHtml(story.analysis.analysis_type === "ex_ante" ? "Ex ante" : story.analysis.analysis_type === "ex_post" ? "Ex post" : "Monitoring")}</span>
    ${high ? '<span class="news-badge news-badge--high">Hohe systemische Relevanz</span>' : ""}
  </div>
  <div>
    <p class="card-kicker">${escapeHtml((story.topic || []).slice(0, 3).join(" · "))}</p>
    <h2><a href="${escapeHtml(storyHref(story))}">${escapeHtml(story.title)}</a></h2>
    <p class="news-card__summary">${escapeHtml(story.analysis.summary)}</p>
    <p><strong>Warum relevant:</strong> ${escapeHtml(story.analysis.why_relevant)}</p>
  </div>
  <div class="news-dimensions">${dimensions(story)}</div>
  <div class="news-card__footer">
    <small>Aktualisiert ${escapeHtml(formatDate(story.last_updated))} · Version ${escapeHtml(story.current_version)}</small>
    <a class="btn btn-secondary" href="${escapeHtml(storyHref(story))}">Fakten- &amp; Folgencheck öffnen</a>
  </div>
</article>`;
}

function pageShell({ title, description, canonical, base, body, jsonLd, feedLinks = true, extraScript = "" }) {
  const { header, footer } = renderLayout(base);
  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | Wirkungsökonomie</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="de_DE">
  <meta property="og:site_name" content="Wirkungsökonomie">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:image" content="${SITE}/assets/img/generated/hero-systemgrafik-wirkungsoekonomie.png">
  <meta name="theme-color" content="#f7f1e8">
  <meta name="application-name" content="Wirkungsticker">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-title" content="Wirkungsticker">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <link rel="manifest" href="${base}news/manifest.webmanifest">
  <link rel="apple-touch-icon" href="${base}assets/img/brand/apple-touch-icon.png">
  ${feedLinks ? `<link rel="alternate" type="application/rss+xml" title="Wirkungsticker RSS" href="${SITE}/news/feed.xml">
  <link rel="alternate" type="application/atom+xml" title="Wirkungsticker Atom" href="${SITE}/news/feed.atom">
  <link rel="alternate" type="application/feed+json" title="Wirkungsticker JSON Feed" href="${SITE}/news/feed.json">` : ""}
  <link rel="icon" href="${base}assets/img/brand/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${base}assets/css/style.css?v=20260830-news">
  <link rel="stylesheet" href="${base}assets/css/news.css?v=20260903-2">
  <script type="application/ld+json">${safeJson(jsonLd)}</script>
</head>
<body>
${header}
${body}
${footer}
<script src="${base}assets/js/main.js?v=20260612-mobile-table-fix"></script>
<script src="${base}assets/js/news-pwa.js?v=20260903-1"></script>
${extraScript}
</body>
</html>`;
}

function indexPage(stories, updatedAt) {
  const filters = [
    ["all", "Alle"], ["high", "Hohe systemische Relevanz"], ["politik", "Politik"], ["wirtschaft", "Wirtschaft"],
    ["mensch", "Mensch"], ["planet", "Planet"], ["demokratie", "Demokratie"], ["klima", "Klima"], ["energie", "Energie"],
    ["arbeit", "Arbeit"], ["soziales", "Soziales"], ["digitalisierung", "Digitalisierung"], ["ki", "KI"], ["europa", "Europa"], ["geopolitik", "Geopolitik"],
  ];
  const cards = stories.length ? stories.map(card).join("\n") : `<div class="news-empty"><h2>Gerade keine ausreichend belegte Wirkungsnachricht.</h2><p>Der Ticker füllt keine Ausgabe künstlich. Eine Story erscheint erst, wenn Relevanz, Quellenlage und Qualitätsgate tragen.</p></div>`;
  const body = `<main id="main-content" data-search-content data-no-glossary>
  <section class="hero news-hero">
    <div class="hero-copy">
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a><span aria-hidden="true">/</span><a href="../">Neues</a><span aria-hidden="true">/</span><a href="../../oeffentlicher-wirkungsraum/">Öffentlicher Wirkungsraum</a></nav>
      <p class="hero-kicker">Wirkungsticker</p>
      <h1 class="hero-title">Die Nachrichten, bei denen zählt, was daraus folgt.</h1>
      <p class="hero-subtitle">Weniger Meldungen, mehr Relevanz: quellengebundene Einordnung von Wirkungspotenzial, Wirkungsrisiken und beobachteten Zustandsveränderungen für Mensch, Planet und Demokratie.</p>
      <div class="news-hero__meta"><span>Zuletzt aktualisiert: ${escapeHtml(formatDate(updatedAt))}</span><span>Automatische Läufe: 07:00 · 12:00 · 16:00 · 20:00 Uhr, Europe/Berlin</span></div>
    </div>
  </section>
  <section class="section"><article class="card news-principle"><p class="hero-kicker">Was hier anders ist</p><h2>Aufmerksamkeit ist kein Relevanzbeweis.</h2><p>Der Wirkungsticker bündelt Meldungen zum selben Ereignis in einer lebenden Wirkungsakte. Er trennt Fakt, Beobachtung und analytische Inferenz. Wirkungspotenzial wird nicht als eingetretene Wirkung ausgegeben, und offene Evidenz bleibt offen.</p><p class="news-method-note"><a class="text-link" href="#methodik">Methodik und Qualitätsgate</a> · <a class="text-link" href="../feed.xml">RSS</a> · <a class="text-link" href="../feed.atom">Atom</a> · <a class="text-link" href="../feed.json">JSON Feed</a></p></article></section>
  <section class="section news-app-tools" data-news-app-tools hidden aria-labelledby="news-app-title"><article class="card news-app-tools__card"><div><p class="hero-kicker">Wirkungsticker für unterwegs</p><h2 id="news-app-title">Als Web-App installieren</h2><p data-news-install-copy>Lege den Wirkungsticker auf deinen Startbildschirm. Er öffnet dann wie eine eigene App und hält die zuletzt geladenen Inhalte offline bereit.</p><div class="news-app-tools__actions" data-news-install-actions><button class="btn btn-primary" type="button" data-news-install-button>Installieren</button><button class="btn btn-secondary" type="button" data-news-install-dismiss>Später</button></div></div><div class="news-notification-settings"><h3>Neue Meldungen anzeigen</h3><p>Optional und jederzeit abschaltbar. Auf unterstützten Geräten erscheint ein Zähler am App-Icon; Hintergrundmeldungen hängen von den Möglichkeiten des Betriebssystems ab.</p><div class="news-app-tools__actions"><button class="btn btn-secondary" type="button" data-news-notification-toggle aria-pressed="false">Benachrichtigungen aktivieren</button><button class="btn btn-secondary" type="button" data-news-mark-read hidden>Neue als gesehen markieren</button></div><p class="news-app-status" data-news-notification-status aria-live="polite">Benachrichtigungen sind aus.</p></div></article></section>
  <section class="section news-search" aria-labelledby="ticker-search-title"><div><p class="hero-kicker">Im Ticker suchen</p><h2 id="ticker-search-title">Wirkungsnachrichten schnell finden</h2><p>Die Suche filtert Titel, Kurzanalysen, Themen und Wirkungsdimensionen direkt auf dieser Seite.</p></div><div class="news-search__controls"><label for="ticker-search-input">Suchbegriff</label><input id="ticker-search-input" type="search" autocomplete="off" placeholder="Zum Beispiel: Energie, Arbeit, Demokratie" data-news-search-input><a class="text-link" href="../../suche.html" data-news-site-search-link>Gesamte Website durchsuchen</a></div></section>
  <nav class="news-filter-bar" aria-label="Wirkungsticker filtern"><div class="news-filter-bar__inner">${filters.map(([value, label], index) => `<button class="news-filter" type="button" data-news-filter="${value}" aria-pressed="${index === 0}">${label}</button>`).join("")}</div></nav>
  <section class="section" aria-labelledby="ticker-stories-title"><div class="section-header"><p class="hero-kicker">Aktuelle Wirkungsakten</p><h2 id="ticker-stories-title">Die wichtigsten Wirkungsnachrichten seit dem letzten Update</h2><p data-news-results-status aria-live="polite">${stories.length} belastbar veröffentlichte ${stories.length === 1 ? "Story" : "Storys"}. Neue Informationen aktualisieren bestehende Akten.</p></div><div class="news-grid">${cards}</div><div class="news-empty" data-news-filter-empty hidden><p>Für diesen Filter und Suchbegriff gibt es derzeit keine veröffentlichte Story.</p></div><div class="news-load-more" data-news-load-more-wrap hidden><button class="btn btn-secondary" type="button" data-news-load-more aria-expanded="false">Weitere Meldungen laden</button></div></section>
  <section class="section section-soft" id="methodik" aria-labelledby="ticker-method-title"><div class="section-header"><p class="hero-kicker">Qualität vor Takt</p><h2 id="ticker-method-title">So entsteht eine Veröffentlichung.</h2></div><div class="impact-process"><article class="impact-process__step"><span class="impact-process__index">1</span><h3>Primärquellen</h3><p>Offizielle RSS-/Atom-Feeds liefern Titel, Kurztext, Zeit und Original-Link. Keine Paywall und kein Volltext-Scraping.</p></article><article class="impact-process__step"><span class="impact-process__index">2</span><h3>Lokal reduzieren</h3><p>URL-/Hash-Deduplizierung, Story-Clustering, Zeitfilter, Themenzuordnung und WÖk-Relevanzvoranalyse laufen ohne KI.</p></article><article class="impact-process__step"><span class="impact-process__index">3</span><h3>Gezielt analysieren</h3><p>Nur materialitätsstarke Storys gehen gebündelt an die bestehende Oracle-WÖk-KI. Nachrichteninhalte gelten dort als Daten, nie als Anweisung.</p></article><article class="impact-process__step"><span class="impact-process__index">4</span><h3>Fail closed</h3><p>Claim-Ledger, Primärquelle, Terminologie, Kausalitätsgrenzen, Unsicherheit und Textübernahme werden automatisch geprüft. Konflikte bleiben zurückgestellt.</p></article><article class="impact-process__step"><span class="impact-process__index">5</span><h3>Lernen</h3><p>Neue Quellen ergänzen dieselbe Story; frühere Analysen bleiben versioniert. Monitoring und Ex-post-Einordnung folgen erst mit neuen Daten.</p></article></div><p class="notice"><strong>Einordnung, kein amtliches Angebot:</strong> Die Analysen sind unabhängige WÖk-Einordnungen. Ziel- oder Indikatorbezug allein ist weder Wirkung noch Kausalitätsnachweis.</p></section>
</main>`;
  return pageShell({
    title: "Wirkungsticker",
    description: "Automatisch aktualisierte, quellengebundene Wirkungsnachrichten für Mensch, Planet und Demokratie.",
    canonical: `${SITE}/news/wirkungsticker/`,
    base: "../../",
    body,
    jsonLd: {
      "@context": "https://schema.org", "@type": "CollectionPage", "@id": `${SITE}/news/wirkungsticker/#page`, url: `${SITE}/news/wirkungsticker/`, name: "Wirkungsticker", inLanguage: "de",
      dateModified: updatedAt, mainEntity: { "@type": "ItemList", itemListElement: stories.map((story, index) => ({ "@type": "ListItem", position: index + 1, url: `${SITE}/news/${story.slug}/`, name: story.title })) },
    },
    extraScript: '<script src="../../assets/js/news.js?v=20260903-2"></script>',
  });
}

function storyPage(story) {
  const a = story.analysis;
  const analysisType = a.analysis_type === "ex_ante" ? "Ex ante" : a.analysis_type === "ex_post" ? "Ex post" : "Monitoring";
  const detailSummary = a.detail_summary || [
    a.summary,
    a.why_relevant,
    `Der ausgewiesene Wirkpfad beschreibt ein Potenzial: ${a.impact_potential}`,
    `Evidenzgrenze: ${a.evidence_level}`,
  ].join(" ");
  const factStatement = String(detailSummary || a.summary || "").match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || a.summary;
  const truthOpening = /^(fakt|gesichert|belegt)\b/i.test(factStatement)
    ? factStatement
    : `Gesichert ist: ${factStatement}`;
  const primarySourceCount = story.sources.filter((source) => source.primary_source).length;
  const primarySourceNames = [...new Set(story.sources.filter((source) => source.primary_source).map((source) => source.publisher))].join(", ");
  const sources = story.sources.map((source) => `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.publisher)}: ${escapeHtml(source.title)}</a><div class="news-source-meta"><span>${source.primary_source ? "Primärquelle" : "ergänzende Quelle"}</span><span>${escapeHtml(formatDate(source.published_at, { dateOnly: true }))}</span></div></li>`).join("");
  const history = [...(story.versions || [])].reverse().map((version) => `<li><strong>Version ${escapeHtml(version.version)}</strong> · ${escapeHtml(formatDate(version.analyzed_at))} · ${escapeHtml(version.analysis.analysis_type === "ex_ante" ? "Ex ante" : version.analysis.analysis_type === "ex_post" ? "Ex post" : "Monitoring")}</li>`).join("");
  const body = `<main id="main-content" data-search-content data-no-glossary>
  <section class="hero news-hero"><div class="hero-copy"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a><span aria-hidden="true">/</span><a href="../">Neues</a><span aria-hidden="true">/</span><a href="../wirkungsticker/">Wirkungsticker</a></nav><p class="hero-kicker">${escapeHtml((story.topic || []).join(" · "))}</p><h1 class="hero-title">${escapeHtml(story.title)}</h1><p class="hero-subtitle">${escapeHtml(a.summary)}</p><div class="news-hero__meta"><span>${escapeHtml(a.status)} · ${analysisType}</span><span>Analyse: ${escapeHtml(formatDate(story.last_updated))} · Version ${escapeHtml(story.current_version)}</span></div></div></section>
  <section class="section"><div class="news-story-layout"><div class="news-story-main">
    <article class="news-story-section news-story-summary"><p class="hero-kicker">Kurzüberblick</p><h2>Was passiert ist und was daraus folgen kann</h2><p class="news-analysis-copy">${escapeHtml(detailSummary)}</p></article>
    <article class="news-story-section news-fact-check"><p class="hero-kicker">Quellenprüfung</p><h2>Faktencheck</h2><p class="news-method-note"><strong>Wahrheit zuerst:</strong> Der belastbar bestätigte Sachverhalt steht vor Behauptungen, offenen Punkten und möglichen Folgen. So soll bloße Wiederholung keinen falschen Wahrheits­eindruck erzeugen.</p><div class="news-check-prose"><section><h3>Gesicherter Ausgangspunkt</h3><p>${escapeHtml(truthOpening)}</p><p>Die Prüfung stützt sich auf ${primarySourceCount} ${primarySourceCount === 1 ? "Primärquelle" : "Primärquellen"}${primarySourceNames ? ` von ${escapeHtml(primarySourceNames)}` : ""} und ${story.claims.length} ${story.claims.length === 1 ? "tragenden, quellengebundenen Claim" : "tragende, quellengebundene Claims"}. Der Evidenzstand lautet: ${escapeHtml(a.evidence_level)}</p></section><section><h3>Was dieser Stand nicht belegt</h3><p>${escapeHtml(a.attribution)} ${escapeHtml(story.claims[0]?.uncertainty || "Vollständiger Kontext und spätere Wirkungsdaten bleiben zu prüfen.")}</p></section></div></article>
    <article class="news-story-section"><p class="hero-kicker">Einordnung</p><h2>Warum diese Meldung relevant ist</h2><p class="news-analysis-copy">${escapeHtml(a.why_relevant)}</p><div class="news-dimensions">${dimensions(story)}</div></article>
    <article class="news-story-section"><h2>Wirkungspotenzial</h2><p class="news-analysis-copy">${escapeHtml(a.impact_potential)}</p><h3>Wirkungsrisiken und Nebenfolgen</h3>${list([...(a.impact_risks || []), ...(a.side_effects || [])])}</article>
    <article class="news-story-section news-consequence-check"><p class="hero-kicker">Folgencheck</p><h2>Wirkpfad und mögliche Folgen</h2><p class="news-method-note">Ausgangspunkt ist ausschließlich der oben gesicherte Sachverhalt. Der Folgencheck formuliert daraus begründete Wirkungspfade und Unsicherheiten; er ist kein Nachweis bereits eingetretener Wirkung.</p><div class="news-consequence-stack"><section><h3>Wirkmechanismus</h3><p>${prose(a.mechanisms)}</p></section><section><h3>Erste Ordnung – unmittelbar</h3><p>${prose(a.first_order)}</p></section><section><h3>Zweite Ordnung – nachgelagert</h3><p>${prose(a.second_order)}</p></section><section><h3>Dritte Ordnung – systemisch</h3><p>${prose(a.third_order)}</p></section><section><h3>Risiken, Gegenläufe und Prüfgrenzen</h3><p>${prose([...(a.impact_risks || []), ...(a.side_effects || []), ...(a.uncertainties || [])])}</p></section></div></article>
    <article class="news-story-section"><h2>Systemische Bedeutung</h2><p class="news-analysis-copy">${escapeHtml(a.systemic_relevance)}</p><h3>Transformationspotenzial</h3><p class="news-analysis-copy">${escapeHtml(a.transformation_potential)}</p><h3>Resilienz</h3><p class="news-analysis-copy">${escapeHtml(a.resilience)}</p></article>
    <article class="news-story-section"><h2>Offene Fragen und Unsicherheiten</h2>${list(a.uncertainties)}<h3>Worauf jetzt zu achten ist</h3>${list(a.watch_next)}</article>
  </div><aside class="news-story-aside">
    <article class="news-story-section"><p class="hero-kicker">Quellenakte</p><h2>Primärquellen</h2><ul class="news-source-list">${sources}</ul><p><strong>Evidenzgrad:</strong> ${escapeHtml(a.evidence_level)}</p><p><strong>Zurechnung:</strong> ${escapeHtml(a.attribution)}</p><p><strong>Referenzrahmen:</strong> ${escapeHtml((a.reference_frameworks || []).join(" · ") || "objektspezifisch offen")}</p><p class="news-method-note">Das interne Claim-Ledger bindet ${story.claims.length} ${story.claims.length === 1 ? "tragenden Claim" : "tragende Claims"} an die oben genannten Quellen. Feed-Kurztexte werden nicht als Originalartikel gespiegelt.</p></article>
    <article class="news-story-section"><h2>Versionsverlauf</h2><ol>${history}</ol><p><a class="text-link" href="../wirkungsticker/">Zurück zum Wirkungsticker</a></p></article>
  </aside></div></section>
</main>`;
  return pageShell({
    title: story.title,
    description: a.summary.slice(0, 158),
    canonical: `${SITE}/news/${story.slug}/`,
    base: "../../",
    body,
    jsonLd: {
      "@context": "https://schema.org", "@type": "AnalysisNewsArticle", "@id": `${SITE}/news/${story.slug}/#article`,
      url: `${SITE}/news/${story.slug}/`, headline: story.title, description: a.summary, inLanguage: "de",
      datePublished: story.published_at, dateModified: story.last_updated,
      author: { "@type": "Organization", name: "Wirkungsökonomie", url: SITE },
      publisher: { "@type": "Organization", name: "Wirkungsökonomie", url: SITE },
      articleSection: story.topic, citation: story.sources.map((source) => source.url),
    },
  });
}

function feedXml(stories, updatedAt, atom = false) {
  if (atom) return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom"><title>Wirkungsticker</title><subtitle>Wirkungsnachrichten für Mensch, Planet und Demokratie</subtitle><link href="${SITE}/news/wirkungsticker/"/><link rel="self" href="${SITE}/news/feed.atom"/><id>${SITE}/news/wirkungsticker/</id><updated>${updatedAt || new Date(0).toISOString()}</updated>${stories.map((story) => `<entry><title>${escapeXml(story.title)}</title><link href="${SITE}/news/${story.slug}/"/><id>${SITE}/news/${story.slug}/</id><published>${story.published_at}</published><updated>${story.last_updated}</updated><summary>${escapeXml(story.analysis.summary)}</summary></entry>`).join("")}</feed>`;
  return `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Wirkungsticker</title><link>${SITE}/news/wirkungsticker/</link><description>Wirkungsnachrichten für Mensch, Planet und Demokratie</description><language>de-de</language><lastBuildDate>${new Date(updatedAt || 0).toUTCString()}</lastBuildDate><atom:link href="${SITE}/news/feed.xml" rel="self" type="application/rss+xml"/>${stories.map((story) => `<item><title>${escapeXml(story.title)}</title><link>${SITE}/news/${story.slug}/</link><guid isPermaLink="true">${SITE}/news/${story.slug}/</guid><pubDate>${new Date(story.last_updated).toUTCString()}</pubDate><description>${escapeXml(story.analysis.summary)}</description></item>`).join("")}</channel></rss>`;
}

function publicStory(story) {
  return {
    story_id: story.story_id,
    slug: story.slug,
    title: story.title,
    summary: story.analysis.summary,
    detail_summary: story.analysis.detail_summary || null,
    why_relevant: story.analysis.why_relevant,
    topic: story.topic,
    status: story.analysis.status,
    analysis_type: story.analysis.analysis_type,
    importance: story.analysis.importance,
    dimensions: { human: story.analysis.human, planet: story.analysis.planet, democracy: story.analysis.democracy },
    first_seen: story.first_seen,
    last_updated: story.last_updated,
    version: story.current_version,
    sources: story.sources.map(({ publisher, url, source_type, published_at, primary_source }) => ({ publisher, url, source_type, published_at, primary_source })),
  };
}

function updateSitemap(stories, updatedAt, oldSlugs) {
  const file = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(file)) return;
  let xml = fs.readFileSync(file, "utf8");
  const routes = new Set(["news/wirkungsticker/", ...stories.map((story) => `news/${story.slug}/`), ...oldSlugs.map((slug) => `news/${slug}/`)]);
  for (const route of routes) {
    const escaped = `${SITE}/${route}`.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    xml = xml.replace(new RegExp(`\\s*<url>\\s*<loc>${escaped}<\\/loc>[\\s\\S]*?<\\/url>`, "g"), "");
  }
  const lastmod = String(updatedAt || new Date().toISOString()).slice(0, 10);
  const entries = ["news/wirkungsticker/", ...stories.map((story) => `news/${story.slug}/`)].map((route) => `  <url><loc>${SITE}/${route}</loc><lastmod>${lastmod}</lastmod></url>`).join("\n");
  xml = xml.replace("</urlset>", `${entries}\n</urlset>`);
  write(file, xml);
}

export function buildNewsSite() {
  const data = readJson(STORIES_FILE);
  const stories = (data.stories || []).filter((story) => story.published && story.analysis).sort((a, b) => Date.parse(b.last_updated) - Date.parse(a.last_updated));
  const oldSlugs = fs.existsSync(MANIFEST_FILE) ? readJson(MANIFEST_FILE).slugs || [] : [];
  const currentSlugs = new Set(stories.map((story) => story.slug));
  for (const slug of oldSlugs) {
    if (!currentSlugs.has(slug) && /^[a-z0-9-]+$/.test(slug)) fs.rmSync(path.join(NEWS_DIR, slug), { recursive: true, force: true });
  }
  write(path.join(NEWS_DIR, "wirkungsticker/index.html"), indexPage(stories, data.updated_at));
  for (const story of stories) write(path.join(NEWS_DIR, story.slug, "index.html"), storyPage(story));
  write(path.join(NEWS_DIR, "feed.xml"), feedXml(stories, data.updated_at));
  write(path.join(NEWS_DIR, "feed.atom"), feedXml(stories, data.updated_at, true));
  write(path.join(NEWS_DIR, "feed.json"), JSON.stringify({
    version: "https://jsonfeed.org/version/1.1", title: "Wirkungsticker", home_page_url: `${SITE}/news/wirkungsticker/`, feed_url: `${SITE}/news/feed.json`, language: "de",
    items: stories.map((story) => ({ id: `${SITE}/news/${story.slug}/`, url: `${SITE}/news/${story.slug}/`, title: story.title, summary: story.analysis.summary, date_published: story.published_at, date_modified: story.last_updated, tags: story.topic })),
  }, null, 2));
  write(path.join(NEWS_DIR, "data/stories.json"), JSON.stringify({ schema_version: "1.0", updated_at: data.updated_at, stories: stories.map(publicStory) }, null, 2));
  write(MANIFEST_FILE, JSON.stringify({ slugs: [...currentSlugs].sort() }, null, 2));
  updateSitemap(stories, data.updated_at, oldSlugs);
  console.log(`Wirkungsticker gebaut: ${stories.length} veröffentlichte Storys, RSS/Atom/JSON.`);
  return { stories: stories.length, updated_at: data.updated_at };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) buildNewsSite();
