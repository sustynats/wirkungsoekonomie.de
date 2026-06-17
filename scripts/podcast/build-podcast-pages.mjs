import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const site = "https://wirkungsoekonomie.de";
const assetVersion = "20260617-podcast-cover";
const episodesPath = path.join(root, "assets", "data", "podcast-index.json");
const headerTemplate = fs.readFileSync(path.join(root, "templates", "header.html"), "utf8");
const footerTemplate = fs.readFileSync(path.join(root, "templates", "footer.html"), "utf8");
const navigation = JSON.parse(fs.readFileSync(path.join(root, "assets", "data", "navigation.json"), "utf8"));

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function navMatch(item) {
  return (item.match || []).join("|");
}

function navLink(item, base) {
  return `<a href="${esc(base + item.href)}" data-nav-match="${esc(navMatch(item))}">${esc(item.label)}</a>`;
}

function navSlug(label) {
  return String(label).toLowerCase().replaceAll("ö", "oe").replaceAll("ä", "ae").replaceAll("ü", "ue").replaceAll("ß", "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function headerItem(item, base) {
  if (!item.childrenRef) return navLink(item, base);
  const children = navigation[item.childrenRef] || [];
  const panel = children.map((child) => `        ${navLink(child, base)}`).join("\n");
  return `<details class="nav-more nav-${esc(navSlug(item.label))}" data-nav-match="${esc(navMatch(item))}">
  <summary>${esc(item.label)}</summary>
  <div class="nav-more-panel">
${panel}
  </div>
</details>`;
}

function headerUtilityItems() {
  return (navigation.more || []).filter((item) => ["Suche", "WÖk-KI", "Mein Wirkungsraum"].includes(item.label));
}

function utilityLink(item, base) {
  const slug = navSlug(item.label);
  const primary = item.label === "Mein Wirkungsraum" ? ' data-utility-primary="true"' : "";
  return `<a class="site-utility-link site-utility-link--${esc(slug)}" href="${esc(base + item.href)}" data-nav-match="${esc(navMatch(item))}" data-utility-label="${esc(item.label)}"${primary}>${esc(item.label)}</a>`;
}

function footerGroup(group, base) {
  return `<div class="footer-nav-group">
  <h3>${esc(group.title)}</h3>
  <div class="footer-nav-links">
      ${(group.items || []).map((item) => navLink(item, base)).join("\n      ")}
  </div>
</div>`;
}

function layoutParts(base) {
  const header = headerTemplate
    .replaceAll("{{BASE}}", base)
    .replace("{{HEADER_NAV}}", navigation.header.map((item) => headerItem(item, base)).join("\n        "))
    .replaceAll("{{HEADER_UTILITY_NAV}}", headerUtilityItems().map((item) => utilityLink(item, base)).join("\n        "));
  const footer = footerTemplate
    .replaceAll("{{BASE}}", base)
    .replace("{{FOOTER_NAV}}", navigation.footerGroups.map((group) => footerGroup(group, base)).join("\n    "))
    .replace("{{FOOTER_LEGAL_NAV}}", navigation.footerLegal.map((item) => navLink(item, base)).join("\n    "));
  return { header, footer };
}

function readTranscript(file) {
  const raw = fs.readFileSync(path.join(root, file), "utf8").replace(/\f/g, "\n");
  const start = raw.indexOf("Sprechertext - Sendefassung");
  const end = raw.indexOf("Optional: Shownotes-Text");
  const section = raw.slice(start >= 0 ? start : 0, end >= 0 ? end : raw.length);
  return section
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("[") && !/^Sprechertext - Sendefassung/.test(line) && !/^1\.0 - Stand/.test(line));
}

function transcriptHtml(episode) {
  return readTranscript(episode.transcript).map((line) => {
    const heading = line.match(/^(\d+)\.\s+(.+)/);
    if (heading) return `<h2>${esc(heading[2])}</h2>`;
    return `<p data-no-glossary>${linkTerms(esc(line), "../../")}</p>`;
  }).join("\n");
}

function withBase(base, href) {
  if (/^(https?:|mailto:|#)/.test(href)) return href;
  return `${base}${href}`;
}

function linkTerms(html, base) {
  const replacements = [
    ["positive Netto-Wirkung", "begriffe/positive-netto-wirkung/"],
    ["Wirkungsrückkopplung", "begriffe/wirkungsrueckkopplung/"],
    ["Reverse Merit Order", "begriffe/reverse-merit-order/"],
    ["Scorecard", "begriffe/scorecard/"],
    ["Wirkungsblindheit", "begriffe/wirkungsblindheit/"],
    ["Wirkung", "begriffe/wirkung/"],
    ["SDG+", "begriffe/sdg-plus/"],
  ];
  let result = html;
  const placeholders = [];
  for (const [label, href] of replacements) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(?<![\\p{L}\\p{N}-])${escaped}(?![\\p{L}\\p{N}-])`, "gu");
    result = result.replace(pattern, () => {
      const token = `@@TERM_${placeholders.length}@@`;
      placeholders.push(`<a class="glossary-link" href="${esc(withBase(base, href))}">${esc(label)}</a>`);
      return token;
    });
  }
  return result.replace(/@@TERM_(\d+)@@/g, (_, index) => placeholders[Number(index)] || "");
}

function formatDate(value) {
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

function jsonLd(episode) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    name: `${episode.title} - ${episode.subtitle}`,
    description: episode.description,
    url: `${site}/podcast/${episode.slug}/`,
    datePublished: episode.publishedAt,
    episodeNumber: episode.episode,
    partOfSeries: {
      "@type": "PodcastSeries",
      name: episode.series,
      url: `${site}/podcast/`,
    },
    associatedMedia: {
      "@type": "MediaObject",
      embedUrl: episode.spotifyEmbedUrl,
      contentUrl: episode.spotifyUrl,
    },
    author: {
      "@type": "Person",
      name: episode.host,
    },
  }, null, 2);
}

function episodePage(episode) {
  const base = "../../";
  const { header, footer } = layoutParts(base);
  const title = `${episode.title} - ${episode.series}`;
  const canonical = `${site}/podcast/${episode.slug}/`;
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(episode.description)}">
    <meta name="search_title" content="${esc(episode.title)}">
    <meta name="search_description" content="${esc(episode.description)}">
    <meta name="search_section" content="Podcast">
    <meta name="search_type" content="Podcast-Folge">
    <meta name="search_date" content="${esc(episode.publishedAt.slice(0, 10))}">
    <link rel="canonical" href="${canonical}">
    <link rel="alternate" type="application/rss+xml" title="Der neue Kompass - Podcast" href="${site}/feeds/podcast.xml">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="${esc(episode.title)}">
    <meta property="og:description" content="${esc(episode.description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${site}/${esc(episode.cover)}">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="icon" href="${base}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=${assetVersion}">
    <script type="application/ld+json">${jsonLd(episode)}</script>
  </head>
  <body>
    ${header}
    <main id="inhalt" data-pagefind-body>
      <article class="hero">
        <div class="hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="${base}index.html">Start</a> / <a href="${base}podcast/">Podcast</a> / Folge ${episode.episode}</nav>
          <p class="hero-kicker">Podcast · Folge ${episode.episode} · ${esc(formatDate(episode.publishedAt))} · ${esc(episode.duration)}</p>
          <h1 class="hero-title">${esc(episode.title)}</h1>
          <p class="hero-subtitle">${esc(episode.subtitle)}</p>
          <p class="meta">Host: ${esc(episode.host)} · ${esc(episode.series)}</p>
          <div class="hero-actions no-print">
            <a class="btn btn-primary" href="${esc(episode.spotifyUrl)}">Auf Spotify öffnen</a>
            <a class="btn btn-secondary" href="#transkript">Transkript lesen</a>
          </div>
        </div>
        <figure class="hero-system-visual article-visual podcast-cover-visual">
          <img src="${base}${esc(episode.cover)}" alt="${esc(episode.coverAlt)}" loading="eager" decoding="async">
          <figcaption>${esc(episode.subtitle)}</figcaption>
        </figure>
      </article>

      <section class="section">
        <div class="section-header">
          <p class="hero-kicker">Anhören</p>
          <h2>Folge direkt abspielen</h2>
          <p>${esc(episode.description)}</p>
        </div>
        <div class="card">
          <iframe style="border-radius:12px" src="${esc(episode.spotifyEmbedUrl)}" width="100%" height="232" frameborder="0" allowfullscreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
        </div>
      </section>

      <section class="section section-soft">
        <div class="section-header">
          <p class="hero-kicker">Verknüpfungen</p>
          <h2>Begriffe und Anschlussseiten</h2>
        </div>
        <div class="card-grid two">
          <article class="card">
            <h3 class="card-title">Begriffe der Folge</h3>
            <div class="blog-badge-row">${episode.relatedTerms.map((term) => `<a class="blog-origin-badge" href="${esc(withBase(base, term.href))}">${esc(term.label)}</a>`).join("")}</div>
          </article>
          <article class="card">
            <h3 class="card-title">Weiterlesen</h3>
            <div class="portal-card-actions">${episode.relatedLinks.map((link) => `<a class="text-link" href="${esc(withBase(base, link.href))}">${esc(link.label)}</a>`).join("")}</div>
          </article>
        </div>
      </section>

      <section class="section prose" id="transkript">
        <div class="section-header">
          <p class="hero-kicker">Transkript</p>
          <h2>Sendefassung</h2>
          <p>Das Transkript macht die Folge auch als Text zugänglich und verknüpft zentrale Begriffe mit dem Glossar.</p>
        </div>
        ${transcriptHtml(episode)}
      </section>
    </main>
    ${footer}
    <script src="${base}assets/js/main.js?v=20260612-mobile-table-fix"></script>
  </body>
</html>
`;
}

function indexPage(episodes) {
  const base = "../";
  const { header, footer } = layoutParts(base);
  const latest = episodes[0];
  const cards = episodes.map((episode) => `<article class="card">
    <p class="card-kicker">Folge ${episode.episode} · ${esc(formatDate(episode.publishedAt))}</p>
    <h3 class="card-title">${esc(episode.title)}</h3>
    <p class="card-text">${esc(episode.description)}</p>
    <div class="portal-card-actions"><a class="text-link" href="${esc(episode.slug)}/">Episode öffnen</a><a class="text-link" href="${esc(episode.spotifyUrl)}">Spotify</a></div>
  </article>`).join("\n");
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Podcast - Der neue Kompass</title>
    <meta name="description" content="Der Podcast der Wirkungsökonomie: Der neue Kompass erklärt Wirkung, Preise, Arbeit, Kapital, Demokratie und positive Netto-Wirkung Schritt für Schritt.">
    <meta name="search_title" content="Podcast - Der neue Kompass">
    <meta name="search_description" content="Podcast der Wirkungsökonomie mit Episoden, Transkripten, Begriffen und Anschlussseiten.">
    <meta name="search_section" content="Podcast">
    <meta name="search_type" content="Podcast-Rubrik">
    <link rel="canonical" href="${site}/podcast/">
    <link rel="alternate" type="application/rss+xml" title="Der neue Kompass - Podcast" href="${site}/feeds/podcast.xml">
    <link rel="icon" href="${base}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=${assetVersion}">
  </head>
  <body>
    ${header}
    <main id="inhalt" data-pagefind-body>
      <section class="hero">
        <div class="hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="${base}index.html">Start</a> / Podcast</nav>
          <p class="hero-kicker">Podcast</p>
          <h1 class="hero-title">Der neue Kompass</h1>
          <p class="hero-subtitle">Wirkungsökonomie einfach erklärt: kurze Wege in ein Denken, das Preise, Wirkung und Verantwortung neu zusammensetzt.</p>
          <div class="hero-actions no-print">
            <a class="btn btn-primary" href="${esc(latest.slug)}/">Aktuelle Folge hören</a>
            <a class="btn btn-secondary" href="${base}feeds/podcast.xml">RSS-Feed öffnen</a>
          </div>
        </div>
        <figure class="hero-system-visual article-visual podcast-cover-visual">
          <img src="${base}${esc(latest.cover)}" alt="${esc(latest.coverAlt)}" loading="eager" decoding="async">
          <figcaption>${esc(latest.series)}</figcaption>
        </figure>
      </section>
      <section class="section">
        <div class="section-header">
          <p class="hero-kicker">Episoden</p>
          <h2>Alle Folgen</h2>
          <p>Jede Episode enthält Player, Beschreibung, Transkript, passende Glossarbegriffe und Anschlussseiten.</p>
        </div>
        <div class="card-grid two">${cards}</div>
      </section>
    </main>
    ${footer}
    <script src="${base}assets/js/main.js?v=20260612-mobile-table-fix"></script>
  </body>
</html>
`;
}

const episodes = JSON.parse(fs.readFileSync(episodesPath, "utf8")).filter((episode) => episode.status === "published")
  .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

fs.mkdirSync(path.join(root, "podcast"), { recursive: true });
fs.writeFileSync(path.join(root, "podcast", "index.html"), indexPage(episodes));
for (const episode of episodes) {
  const dir = path.join(root, "podcast", episode.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), episodePage(episode));
}

console.log(`podcast: ${episodes.length} Episoden gebaut`);
