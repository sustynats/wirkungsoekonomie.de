import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const site = "https://wirkungsoekonomie.de";
const feedDir = path.join(root, "feeds");
const podcastMeta = {
  title: "Der neue Kompass - Podcast der Wirkungsökonomie",
  link: `${site}/podcast/`,
  description: "Wirkungsökonomie einfach erklärt: kurze Wege in ein Denken, das Preise, Wirkung und Verantwortung neu zusammensetzt.",
  author: "Wirkungsökonomie",
  language: "de-de",
  image: `${site}/assets/img/podcast/der-neue-kompass-cover.jpeg`,
  category: "Education",
  type: "episodic",
  explicit: "false",
};

const feedSpecs = [
  {
    file: "oeffentlicher-wirkungsraum.xml",
    title: "Öffentlicher Wirkungsraum - Wirkungsökonomie",
    link: `${site}/oeffentlicher-wirkungsraum/`,
    description: "Neue und aktualisierte Inhalte zum öffentlichen Wirkungsraum: Debatten-Kompass, Resonanz-Kompass, Agenda-Radar, Ursachen-Navigator und Resilienz-Prinzipien.",
    patterns: [
      "oeffentlicher-wirkungsraum/index.html",
      "oeffentlicher-wirkungsraum/*/index.html",
      "wirkungsradar/index.html",
      "wirkungsradar/live/index.html",
      "wirkungsradar/live/*/index.html",
      "wirkungsradar/debattenkarten/index.html",
      "wirkungsradar/antwort-playbooks/index.html",
      "wirkungsradar/narrative/index.html",
      "wirkungsradar/resonanz-kompass/index.html",
      "wirkungsradar/agenda-radar/index.html",
      "wirkungsradar/ursachen-navigator/index.html",
      "wirkungsradar/resilienz-prinzipien/index.html",
      "wirkungsradar/methode/index.html",
    ],
  },
  {
    file: "bibliothek.xml",
    title: "Bibliothek und Veröffentlichungen - Wirkungsökonomie",
    link: `${site}/downloads.html`,
    description: "Neue und aktualisierte Veröffentlichungen, Online-Dokumente, Bibliothekseinträge und Arbeitsmaterialien der Wirkungsökonomie.",
    patterns: [
      "downloads.html",
      "bibliothek/index.html",
      "bibliothek/*/index.html",
      "dokumente/index.html",
      "dokumente/*/index.html",
      "referenz/index.html",
      "referenz/kapitel-*/index.html",
      "werkstatt/arbeitsbibliothek/*/index.html",
      "werkstatt/arbeitsbibliothek/*/*/index.html",
    ],
  },
  {
    file: "journal.xml",
    title: "Journal der Wirkungsökonomie",
    link: `${site}/blog.html`,
    description: "Neue Journalartikel und Einordnungen der Wirkungsökonomie zu Politik, Wirtschaft, Medien, Klima, Demokratie und Wirkung.",
    fromBlogIndex: true,
    patterns: [
      "blog/*/index.html",
      "journal/*/index.html",
    ],
  },
  {
    file: "podcast.xml",
    title: "Der neue Kompass - Podcast der Wirkungsökonomie",
    link: `${site}/podcast/`,
    description: "Podcast-Folgen der Wirkungsökonomie mit Player, Transkript, Glossarbegriffen und Anschlussseiten.",
    fromPodcastIndex: true,
    patterns: [
      "podcast/index.html",
      "podcast/*/index.html",
    ],
  },
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.name === ".git" || entry.name === "_site" || entry.name === "node_modules") return [];
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() && entry.name.endsWith(".html") ? [full] : [];
  });
}

function patternToRegExp(pattern) {
  const escaped = pattern
    .split("*")
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("[^/]+");
  return new RegExp(`^${escaped}$`);
}

function stripTags(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function entityDecode(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function xml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function htmlMeta(html, name) {
  const patterns = [
    new RegExp(`<meta\\s+name="${name}"\\s+content="([^"]*)"`, "i"),
    new RegExp(`<meta\\s+property="${name}"\\s+content="([^"]*)"`, "i"),
    new RegExp(`<meta\\s+content="([^"]*)"\\s+name="${name}"`, "i"),
    new RegExp(`<meta\\s+content="([^"]*)"\\s+property="${name}"`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return entityDecode(match[1]);
  }
  return "";
}

function canonicalFor(rel, html) {
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
  if (canonical) return canonical;
  const clean = rel.endsWith("/index.html") ? rel.replace(/index\.html$/, "") : rel;
  return `${site}/${clean}`.replace(/\/$/, "/");
}

function dateFromHtml(html, stat) {
  const candidates = [
    htmlMeta(html, "search_date"),
    htmlMeta(html, "date"),
    htmlMeta(html, "article:published_time"),
    htmlMeta(html, "article:modified_time"),
    html.match(/datetime="(\d{4}-\d{2}-\d{2})"/i)?.[1],
    html.match(/data-date="(\d{4}-\d{2}-\d{2})"/i)?.[1],
    html.match(/Datenstand:\s*(\d{4}-\d{2}-\d{2})/i)?.[1],
  ].filter(Boolean);
  for (const candidate of candidates) {
    const parsed = new Date(candidate);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return stat.mtime;
}

function pageData(file) {
  const rel = path.relative(root, file).split(path.sep).join("/");
  const html = fs.readFileSync(file, "utf8");
  const title = entityDecode(htmlMeta(html, "search_title") || html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || rel);
  const description = entityDecode(htmlMeta(html, "description") || htmlMeta(html, "search_description") || stripTags(html.match(/<main[\s\S]*?<\/main>/i)?.[0] || "").slice(0, 240));
  const stat = fs.statSync(file);
  return {
    rel,
    title: stripTags(title),
    description: stripTags(description).slice(0, 320),
    url: canonicalFor(rel, html),
    date: dateFromHtml(html, stat),
    raw: stripTags(html).slice(0, 500),
    isRedirect: /<meta[^>]+http-equiv=["']refresh["']/i.test(html) || /window\.location\.(replace|href)/i.test(html) || /<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html),
  };
}

function itemsFor(patterns) {
  const regexes = patterns.map(patternToRegExp);
  const matched = walk(root)
    .map((file) => path.relative(root, file).split(path.sep).join("/"))
    .filter((rel) => regexes.some((regex) => regex.test(rel)))
    .map((rel) => path.join(root, rel))
    .map(pageData)
    .filter((item) => !item.isRedirect)
    .filter((item) => !/^Weiterleitung\b/i.test(item.title))
    .filter((item) => !/Diese Aussage wurde zusammengef[uü]hrt|alte Adresse|Zentrale Seite [öo]ffnen/i.test(`${item.title} ${item.description} ${item.raw}`))
    .filter((item, index, all) => all.findIndex((other) => other.url === item.url) === index)
    .sort((a, b) => b.date - a.date);
  return matched.slice(0, 120);
}

function itemsFromBlogIndex() {
  const indexFile = path.join(root, "assets", "data", "blog-index.json");
  if (!fs.existsSync(indexFile)) return [];
  const posts = JSON.parse(fs.readFileSync(indexFile, "utf8"));
  return posts
    .filter((post) => post.status === "published")
    .map((post) => {
      const date = new Date(post.publishedAt || `${post.date || ""}T00:00:00`);
      return {
        title: stripTags(post.title || "Journalbeitrag"),
        description: stripTags(post.excerpt || post.description || "").slice(0, 320),
        url: new URL(post.url || "/blog.html", site).href,
        date: Number.isNaN(date.getTime()) ? new Date() : date,
      };
    })
    .filter((item, index, all) => all.findIndex((other) => other.url === item.url) === index)
    .sort((a, b) => b.date - a.date)
    .slice(0, 120);
}

function itemsFromPodcastIndex() {
  const indexFile = path.join(root, "assets", "data", "podcast-index.json");
  if (!fs.existsSync(indexFile)) return [];
  const episodes = JSON.parse(fs.readFileSync(indexFile, "utf8"));
  return episodes
    .filter((episode) => episode.status === "published")
    .map((episode) => {
      const date = new Date(episode.publishedAt || `${episode.date || ""}T00:00:00`);
      return {
        title: stripTags(`${episode.series || "Podcast"}: ${episode.title || "Episode"}`),
        episodeTitle: stripTags(episode.title || "Episode"),
        subtitle: stripTags(episode.subtitle || ""),
        description: stripTags(episode.description || episode.subtitle || "").slice(0, 320),
        summary: stripTags((Array.isArray(episode.longDescription) ? episode.longDescription.join("\n\n") : episode.description) || "").slice(0, 4000),
        url: new URL(`/podcast/${episode.slug}/`, site).href,
        date: Number.isNaN(date.getTime()) ? new Date() : date,
        season: episode.season,
        episode: episode.episode,
        duration: episode.durationSeconds || episode.duration || "",
        image: episode.cover ? new URL(episode.cover, `${site}/`).href : podcastMeta.image,
        audioUrl: episode.audio ? new URL(episode.audio, `${site}/`).href : "",
        audioType: episode.audioType || "audio/mpeg",
        audioBytes: episode.audioBytes || 0,
      };
    })
    .filter((item, index, all) => all.findIndex((other) => other.url === item.url) === index)
    .sort((a, b) => b.date - a.date)
    .slice(0, 120);
}

function renderPodcastFeed(spec, items) {
  const now = new Date().toUTCString();
  const itemXml = items.map((item) => {
    const enclosure = item.audioUrl && item.audioBytes
      ? `\n      <enclosure url="${xml(item.audioUrl)}" length="${xml(item.audioBytes)}" type="${xml(item.audioType)}" />`
      : "";
    const season = item.season ? `\n      <itunes:season>${xml(item.season)}</itunes:season>` : "";
    const episode = item.episode ? `\n      <itunes:episode>${xml(item.episode)}</itunes:episode>` : "";
    const duration = item.duration ? `\n      <itunes:duration>${xml(item.duration)}</itunes:duration>` : "";
    return `    <item>
      <title>${xml(item.episodeTitle || item.title)}</title>
      <link>${xml(item.url)}</link>
      <guid isPermaLink="true">${xml(item.url)}</guid>
      <pubDate>${item.date.toUTCString()}</pubDate>
      <description>${xml(item.description)}</description>
      <itunes:title>${xml(item.episodeTitle || item.title)}</itunes:title>
      <itunes:summary>${xml(item.summary || item.description)}</itunes:summary>
      <itunes:subtitle>${xml(item.subtitle || item.description)}</itunes:subtitle>
      <itunes:author>${xml(podcastMeta.author)}</itunes:author>
      <itunes:explicit>${podcastMeta.explicit}</itunes:explicit>
      <itunes:episodeType>full</itunes:episodeType>
      <itunes:image href="${xml(item.image)}" />${season}${episode}${duration}${enclosure}
    </item>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>${xml(podcastMeta.title)}</title>
    <link>${xml(podcastMeta.link)}</link>
    <description>${xml(podcastMeta.description)}</description>
    <language>${xml(podcastMeta.language)}</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${xml(`${site}/feeds/${spec.file}`)}" rel="self" type="application/rss+xml" />
    <itunes:title>${xml(podcastMeta.title)}</itunes:title>
    <itunes:author>${xml(podcastMeta.author)}</itunes:author>
    <itunes:summary>${xml(podcastMeta.description)}</itunes:summary>
    <itunes:subtitle>${xml(podcastMeta.description)}</itunes:subtitle>
    <itunes:explicit>${podcastMeta.explicit}</itunes:explicit>
    <itunes:type>${xml(podcastMeta.type)}</itunes:type>
    <itunes:image href="${xml(podcastMeta.image)}" />
    <itunes:category text="${xml(podcastMeta.category)}" />
${itemXml}
  </channel>
</rss>
`;
}

function renderFeed(spec, items) {
  const now = new Date().toUTCString();
  const itemXml = items.map((item) => `    <item>
      <title>${xml(item.title)}</title>
      <link>${xml(item.url)}</link>
      <guid isPermaLink="true">${xml(item.url)}</guid>
      <pubDate>${item.date.toUTCString()}</pubDate>
      <description>${xml(item.description)}</description>
    </item>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xml(spec.title)}</title>
    <link>${xml(spec.link)}</link>
    <description>${xml(spec.description)}</description>
    <language>de-de</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${xml(`${site}/feeds/${spec.file}`)}" rel="self" type="application/rss+xml" />
${itemXml}
  </channel>
</rss>
`;
}

function feedLinkTag(spec) {
  return `<link rel="alternate" type="application/rss+xml" title="${xml(spec.title)}" href="${site}/feeds/${spec.file}">`;
}

function upsertHeadLinks(file, specs) {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, "utf8");
  html = html
    .replace(/[ \t]*<link\s+rel="alternate"\s+type="application\/rss\+xml"\s+title="[^"]+"\s+href="https:\/\/wirkungsoekonomie\.de\/feeds\/[^"]+">\s*\n?/g, "")
    .replace(/\n{3,}/g, "\n\n");
  const marker = html.match(/\n(\s*)<link\s+rel="(?:icon|stylesheet)"/i);
  if (!marker) return;
  const indent = marker[1]?.length ? marker[1] : "    ";
  const tags = specs.map((spec) => `${indent}${feedLinkTag(spec)}`).join("\n");
  html = html.replace(marker[0], `\n${tags}${marker[0]}`);
  html = html.replace(/\n{3,}/g, "\n\n");
  fs.writeFileSync(file, html);
}

fs.mkdirSync(feedDir, { recursive: true });

for (const spec of feedSpecs) {
  const items = spec.fromBlogIndex ? itemsFromBlogIndex() : spec.fromPodcastIndex ? itemsFromPodcastIndex() : itemsFor(spec.patterns);
  fs.writeFileSync(path.join(feedDir, spec.file), spec.fromPodcastIndex ? renderPodcastFeed(spec, items) : renderFeed(spec, items));
  console.log(`rss: ${spec.file} (${items.length} Einträge)`);
}

upsertHeadLinks(path.join(root, "index.html"), feedSpecs);
upsertHeadLinks(path.join(root, "updates", "index.html"), feedSpecs);
upsertHeadLinks(path.join(root, "oeffentlicher-wirkungsraum", "index.html"), [feedSpecs[0]]);
upsertHeadLinks(path.join(root, "wirkungsradar", "index.html"), [feedSpecs[0]]);
upsertHeadLinks(path.join(root, "wirkungsradar", "live", "index.html"), [feedSpecs[0]]);
upsertHeadLinks(path.join(root, "wirkungsradar", "debattenkarten", "index.html"), [feedSpecs[0]]);
upsertHeadLinks(path.join(root, "downloads.html"), [feedSpecs[1]]);
upsertHeadLinks(path.join(root, "bibliothek", "index.html"), [feedSpecs[1]]);
upsertHeadLinks(path.join(root, "dokumente", "index.html"), [feedSpecs[1]]);
upsertHeadLinks(path.join(root, "blog.html"), [feedSpecs[2]]);
upsertHeadLinks(path.join(root, "blog", "index.html"), [feedSpecs[2]]);
upsertHeadLinks(path.join(root, "journal", "index.html"), [feedSpecs[2]]);
upsertHeadLinks(path.join(root, "podcast", "index.html"), [feedSpecs[3]]);
