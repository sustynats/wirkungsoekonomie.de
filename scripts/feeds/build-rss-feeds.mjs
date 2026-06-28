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
    file: "startseite.xml",
    title: "Aktuelles auf der Startseite - Wirkungsökonomie",
    link: `${site}/`,
    description: "Neue Inhalte, die auf der Startseite der Wirkungsökonomie erscheinen: aktuelle Journalbeiträge, Podcastfolgen und zentrale Einstiege.",
    fromHomeIndex: true,
  },
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

function htmlAttribute(tag, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`${escaped}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i").exec(tag);
  return match ? entityDecode(match[1] || match[2] || "") : "";
}

function htmlMetaAll(html, name) {
  const matches = [];
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<meta\\s+[^>]*(?:name|property)\\s*=\\s*(?:"${escaped}"|'${escaped}')[^>]*>`, "gi");
  for (const match of html.matchAll(pattern)) {
    const content = htmlAttribute(match[0], "content");
    if (content) matches.push(content);
  }
  return matches;
}

function absoluteUrl(value, baseUrl = site) {
  const raw = entityDecode(value).trim();
  if (!raw) return "";
  try {
    const url = new URL(raw, baseUrl);
    return /^https?:$/.test(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function isGenericFeedImage(value) {
  try {
    const pathname = new URL(value, site).pathname.toLowerCase();
    return (
      pathname.includes("/assets/img/brand/") ||
      pathname.endsWith("/assets/img/generated/hero-systemgrafik-wirkungsoekonomie.png") ||
      pathname.endsWith("/assets/img/generated/hero-systemgrafik-wirkungsoekonomie.webp")
    );
  } catch {
    return true;
  }
}

const genericTagKeys = new Set([
  "aktuelles auf der startseite - wirkungsökonomie",
  "bibliothek und veröffentlichungen - wirkungsökonomie",
  "der neue kompass - podcast der wirkungsökonomie",
  "der neue kompass - wirkungsökonomie einfach erklärt",
  "journal der wirkungsökonomie",
  "öffentlicher wirkungsraum - wirkungsökonomie",
  "wirkungsoekonomie",
  "wirkungsökonomie",
  "podcast",
  "journalartikel",
  "dokument",
  "dokumente",
  "dokumentenbibliothek",
  "werkstatt",
  "arbeitsbibliothek",
  "arbeitspapier",
  "aktuell",
  "online-version",
  "führend",
  "einsteiger",
  "fortgeschritten",
  "expert",
  "grundlagen & orientierung",
  "alltag & grundbedürfnisse",
  "mensch",
  "planet",
  "demokratie"
]);

function isSpecificTag(value) {
  const key = stripTags(value).replace(/\s+/g, " ").trim().toLocaleLowerCase("de-DE");
  return key.length >= 3 && !genericTagKeys.has(key);
}

function jsonLdObjects(html) {
  const blocks = [...html.matchAll(/<script\b[^>]+type=(?:"application\/ld\+json"|'application\/ld\+json')[^>]*>([\s\S]*?)<\/script>/gi)];
  return blocks.flatMap((match) => {
    try {
      const parsed = JSON.parse(entityDecode(match[1] || ""));
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [];
    }
  });
}

function valuesFromJsonLd(value, keys) {
  const results = [];
  const visit = (node) => {
    if (!node) return;
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (typeof node !== "object") return;
    for (const key of keys) {
      const found = node[key];
      if (Array.isArray(found)) {
        for (const item of found) {
          if (typeof item === "string") results.push(item);
          else if (item && typeof item === "object") results.push(item.name || item.label || item.headline || "");
        }
      } else if (typeof found === "string") {
        results.push(found);
      } else if (found && typeof found === "object") {
        results.push(found.url || found.contentUrl || found.name || "");
      }
    }
    for (const child of Object.values(node)) {
      if (child && typeof child === "object") visit(child);
    }
  };
  visit(value);
  return results.filter(Boolean);
}

function splitTags(value) {
  return String(value || "")
    .split(/[,;|]/)
    .map((tag) => stripTags(entityDecode(tag)).trim())
    .filter(Boolean);
}

function uniqueTags(tags, limit = 18) {
  const seen = new Set();
  const cleaned = [];
  for (const tag of tags.flatMap((value) => Array.isArray(value) ? value : splitTags(value))) {
    const clean = stripTags(tag).replace(/\s+/g, " ").trim();
    const key = clean.toLocaleLowerCase("de-DE");
    if (!clean || clean.length > 80 || seen.has(key) || !isSpecificTag(clean)) continue;
    seen.add(key);
    cleaned.push(clean);
    if (cleaned.length >= limit) break;
  }
  return cleaned;
}

function imageFromHtml(rel, html, pageUrl) {
  const baseUrl = pageUrl || `${site}/${rel}`;
  const candidates = [
    htmlMeta(html, "og:image"),
    htmlMeta(html, "twitter:image"),
    htmlMeta(html, "search_image"),
    ...jsonLdObjects(html).flatMap((block) => valuesFromJsonLd(block, ["image", "thumbnailUrl"])),
  ];
  for (const candidate of candidates) {
    const url = absoluteUrl(candidate, baseUrl);
    if (url && !isGenericFeedImage(url)) return url;
  }
  return "";
}

function tagsFromHtml(html) {
  return uniqueTags([
    htmlMeta(html, "search_tags"),
    htmlMeta(html, "search_section"),
    htmlMeta(html, "search_type"),
    ...htmlMetaAll(html, "article:tag"),
    ...jsonLdObjects(html).flatMap((block) => valuesFromJsonLd(block, ["keywords", "about"]))
  ], 10);
}

const pathTagMap = new Map(Object.entries({
  "agenda-radar": ["Agenda-Radar", "Agenda-Setting", "öffentliche Gewichtung"],
  "antwort-playbooks": ["Antwort-Playbooks", "Reframing", "Debattenführung"],
  "arbeit-einkommen": ["Arbeit & Einkommen", "Arbeit", "Einkommen"],
  "architektur": ["Wirkungsarchitektur", "Systemarchitektur"],
  "bildung": ["Bildung", "Wissenschaft, Bildung & Lernen"],
  "debattenkarten": ["Debatten-Kompass", "Debattenkarten", "Frameanalyse"],
  "finanzsystem-kapital": ["Finanzsystem & Kapital", "Kapital & Finanzierung"],
  "gesetze": ["Staat, Recht & Demokratie", "Recht", "Demokratie"],
  "gesundheit-pflege": ["Gesundheit & Pflege", "Mensch & Teilhabe"],
  "historische-dokumente": ["Historische Dokumente", "Archiv"],
  "instrumente": ["Instrumente", "WÖk-Werkzeuge"],
  "klima-energie-ressourcen": ["Klima, Energie & Ressourcen", "Planet & Resilienz"],
  "konzepte-dossiers": ["Konzepte & Dossiers", "Dossiers", "Arbeitsmaterial"],
  "kultur-identitaet-resonanz": ["Kultur, Identität & Resonanz", "Resonanz", "Identität"],
  "medien-oeffentlichkeit": ["Medien & Öffentlichkeit", "Öffentlichkeit & Wissen", "Faktencheck & Folgencheck"],
  "methodik": ["Methodik", "Wirkungsmethodik"],
  "narrative": ["Narrative", "Frames", "Resonanzräume"],
  "praxis": ["Praxisbeispiele", "Fallbeispiele"],
  "produkte-konsum": ["Produkte & Konsum", "Produktwirkung", "Wirkungsumsatzsteuer"],
  "rente-soziale-sicherung": ["Rente & soziale Sicherung", "Soziale Sicherung"],
  "resilienz-prinzipien": ["Resilienz-Prinzipien", "Demokratische Resilienz"],
  "resonanz-kompass": ["Resonanz-Kompass", "Resonanzprofil", "öffentliche Wirkung"],
  "soziales": ["Soziales", "Mensch & Teilhabe"],
  "ursachen-navigator": ["Ursachen-Navigator", "Ursachenprüfung", "Systemfrage"],
  "whitepaper": ["Whitepaper", "Arbeitsmaterial"],
  "wirkungsfelder": ["Wirkungsfelder", "Wirkungsanalyse"],
  "wirkungsrat": ["Wirkungsrat", "Evaluation", "Rechtsschutz"],
  "woek-ids": ["WÖk-IDs", "Wirkungsdaten", "Datenqualität"],
  "wohnen-stadt": ["Wohnen & Stadt", "Wohnwirkung", "Stadt"]
}));

function tagsFromPathAndText(rel, title, description, rawText) {
  const tags = [];
  const lowerRel = rel.toLowerCase();
  const combined = `${title} ${description} ${rawText}`;

  if (lowerRel.startsWith("wirkungsradar/") || lowerRel.startsWith("oeffentlicher-wirkungsraum/")) {
    tags.push("Öffentlicher Wirkungsraum", "Wirkungsradar");
  }
  if (lowerRel.startsWith("wirkungsradar/live/")) {
    tags.push("Debatten-Kompass", "Debattenkarte", "Frameanalyse", "Folgencheck");
    const debateCategory = extractDebateCategory(combined);
    if (debateCategory) tags.push(debateCategory);
  }
  if (lowerRel.startsWith("bibliothek/")) {
    tags.push("WÖk-Wissensbibliothek", "Publikation", "Wirkungsökonomie");
  }
  if (lowerRel.startsWith("dokumente/")) {
    tags.push("Online-Dokumente", "WÖk-Wissensbibliothek", "Arbeitsmaterial");
  }
  if (lowerRel.startsWith("werkstatt/arbeitsbibliothek/")) {
    tags.push("WÖk-Arbeitsbibliothek", "Arbeitsmaterial");
  }
  if (lowerRel.startsWith("referenz/kapitel-")) {
    const chapter = lowerRel.match(/kapitel-(\d+)/)?.[1];
    tags.push("Hauptwerk", "Referenzkapitel", "Die neue Ordnung des Wohlstands");
    if (chapter) tags.push(`Kapitel ${chapter}`);
  }

  for (const [segment, segmentTags] of pathTagMap) {
    if (lowerRel.includes(`/${segment}/`) || lowerRel.includes(`${segment}/`)) {
      tags.push(...segmentTags);
    }
  }

  return uniqueTags(tags, 10);
}

function extractDebateCategory(value) {
  const patterns = [
    /Debattenkarte\s*[·-]\s*([^?!.|]{3,80}?)(?=\s+[A-ZÄÖÜ0-9])/,
    /Debattenkarten\s*\/\s*([^/]{3,80}?)\s+Debattenkarte/i
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(value);
    const clean = stripTags(match?.[1] || "").replace(/\s+/g, " ").trim();
    if (clean && !/[?!.]$/.test(clean)) return clean;
  }
  return "";
}

function tagsFromJournalText(title, description, url) {
  const textValue = `${title} ${description} ${url}`.toLocaleLowerCase("de-DE");
  const tags = [];
  if (url.includes("/linkedin/")) tags.push("LinkedIn-Archiv");
  if (/demokr/.test(textValue)) tags.push("Demokratie", "Politische Wirkung", "demokratische Resilienz");
  if (/klima|energie|wärme|waerme|gebäude|gebaeude/.test(textValue)) tags.push("Klima & Energie");
  if (/wirtschaft|unternehmen|markt|finanz/.test(textValue)) tags.push("Wirtschaft & Unternehmen");
  if (/medien|kommunikation|fakten|diskurs|öffentlich/.test(textValue)) tags.push("Medien & Öffentlichkeit");
  if (/wirkung|wirkungsökonomie|wirkungsoekonomie/.test(textValue)) tags.push("Wirkungslogik");
  return uniqueTags(tags, 8);
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
  const url = canonicalFor(rel, html);
  const raw = stripTags(html).slice(0, 500);
  const cleanTitle = stripTags(title);
  const cleanDescription = stripTags(description).slice(0, 320);
  return {
    rel,
    title: cleanTitle,
    description: cleanDescription,
    url,
    date: dateFromHtml(html, stat),
    image: imageFromHtml(rel, html, url),
    tags: uniqueTags([...tagsFromHtml(html), ...tagsFromPathAndText(rel, cleanTitle, cleanDescription, raw)], 10),
    raw,
    isRedirect: /<meta[^>]+http-equiv=["']refresh["']/i.test(html) || /window\.location\.(replace|href)/i.test(html) || /<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html),
  };
}

function loadDocumentTagMap() {
  const sources = [
    path.join(root, "assets", "data", "document-library.json"),
    path.join(root, "assets", "data", "library-version-registry.json"),
  ];
  const map = new Map();
  for (const source of sources) {
    if (!fs.existsSync(source)) continue;
    const data = JSON.parse(fs.readFileSync(source, "utf8"));
    const documents = Array.isArray(data) ? data : Array.isArray(data.documents) ? data.documents : [];
    for (const doc of documents) {
      const rawUrl = doc.url || doc.urls?.primary || "";
      if (!rawUrl || /^https?:\/\//i.test(rawUrl) && !rawUrl.startsWith(site)) continue;
      const url = absoluteUrl(rawUrl, `${site}/`);
      if (!url) continue;
      const tags = uniqueTags([
        ...(doc.topics || []),
        ...(doc.methods || []),
        ...(doc.relatedMethods || []),
        ...(doc.impactFields || []),
        ...(doc.relatedImpactFields || []),
      ], 8);
      if (tags.length) map.set(url.replace(/\/$/, ""), tags);
    }
  }
  return map;
}

const documentTagsByUrl = loadDocumentTagMap();

function enrichItemTags(item, fallbackTags = []) {
  const mapped = documentTagsByUrl.get(String(item.url || "").replace(/\/$/, "")) || [];
  return {
    ...item,
    tags: uniqueTags([...(item.tags || []), ...mapped, ...fallbackTags]),
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
      const url = new URL(post.url || "/blog.html", site).href;
      return {
        title: stripTags(post.title || "Journalbeitrag"),
        description: stripTags(post.excerpt || post.description || "").slice(0, 320),
        url,
        date: Number.isNaN(date.getTime()) ? new Date() : date,
        image: (() => {
          const image = absoluteUrl(post.image || "", url);
          return image && !isGenericFeedImage(image) ? image : "";
        })(),
        tags: uniqueTags([post.category, ...(post.tags || []), ...tagsFromJournalText(post.title || "", post.excerpt || post.description || "", url)], 8),
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
        tags: uniqueTags([
          episode.subtitle,
          ...(episode.keywords || []),
          ...(episode.relatedTerms || []).map((term) => term.label),
        ], 8),
      };
    })
    .filter((item, index, all) => all.findIndex((other) => other.url === item.url) === index)
    .sort((a, b) => b.date - a.date)
    .slice(0, 120);
}

function itemsFromHomeIndex() {
  const journalItems = itemsFromBlogIndex().map((item) => ({
    ...item,
    title: `Journal: ${item.title}`,
  }));
  const podcastItems = itemsFromPodcastIndex().map((item) => ({
    ...item,
    title: `Podcast: ${item.episodeTitle || item.title}`,
    description: item.description || item.subtitle || "",
  }));
  return [...journalItems, ...podcastItems]
    .filter((item, index, all) => all.findIndex((other) => other.url === item.url) === index)
    .sort((a, b) => b.date - a.date)
    .slice(0, 80);
}

function imageMimeType(value) {
  try {
    const ext = path.extname(new URL(value).pathname).toLowerCase();
    if (ext === ".png") return "image/png";
    if (ext === ".webp") return "image/webp";
    if (ext === ".gif") return "image/gif";
    if (ext === ".svg") return "image/svg+xml";
  } catch {
    return "image/jpeg";
  }
  return "image/jpeg";
}

function renderImageTags(item) {
  const image = item.image || "";
  if (!image) return "";
  return `
      <media:content url="${xml(image)}" medium="image" type="${xml(imageMimeType(image))}" />
      <media:thumbnail url="${xml(image)}" />`;
}

function renderCategoryTags(item, spec) {
  const tags = uniqueTags(item.tags || [], 8);
  return tags.map((tag) => `\n      <category>${xml(tag)}</category>`).join("");
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
      <itunes:image href="${xml(item.image)}" />${renderImageTags(item)}${renderCategoryTags(item, spec)}${season}${episode}${duration}${enclosure}
    </item>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:media="http://search.yahoo.com/mrss/">
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
      <description>${xml(item.description)}</description>${renderImageTags(item)}${renderCategoryTags(item, spec)}
    </item>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
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
  const marker = html.match(/\n([ \t]*)(<link\s+rel="(?:icon|stylesheet)"[^\n]*>)/i);
  if (!marker) return;
  const indent = marker[1]?.length ? marker[1] : "    ";
  const tags = specs.map((spec) => `${indent}${feedLinkTag(spec)}`).join("\n");
  html = html.replace(marker[0], `\n${tags}\n${indent}${marker[2]}`);
  html = html.replace(/\n{3,}/g, "\n\n");
  fs.writeFileSync(file, html);
}

fs.mkdirSync(feedDir, { recursive: true });

for (const spec of feedSpecs) {
  const items = (spec.fromHomeIndex ? itemsFromHomeIndex() : spec.fromBlogIndex ? itemsFromBlogIndex() : spec.fromPodcastIndex ? itemsFromPodcastIndex() : itemsFor(spec.patterns))
    .map((item) => enrichItemTags(item));
  fs.writeFileSync(path.join(feedDir, spec.file), spec.fromPodcastIndex ? renderPodcastFeed(spec, items) : renderFeed(spec, items));
  console.log(`rss: ${spec.file} (${items.length} Einträge)`);
}

upsertHeadLinks(path.join(root, "index.html"), feedSpecs);
upsertHeadLinks(path.join(root, "updates", "index.html"), feedSpecs);
upsertHeadLinks(path.join(root, "oeffentlicher-wirkungsraum", "index.html"), [feedSpecs[1]]);
upsertHeadLinks(path.join(root, "wirkungsradar", "index.html"), [feedSpecs[1]]);
upsertHeadLinks(path.join(root, "wirkungsradar", "live", "index.html"), [feedSpecs[1]]);
upsertHeadLinks(path.join(root, "wirkungsradar", "debattenkarten", "index.html"), [feedSpecs[1]]);
upsertHeadLinks(path.join(root, "downloads.html"), [feedSpecs[2]]);
upsertHeadLinks(path.join(root, "bibliothek", "index.html"), [feedSpecs[2]]);
upsertHeadLinks(path.join(root, "dokumente", "index.html"), [feedSpecs[2]]);
upsertHeadLinks(path.join(root, "blog.html"), [feedSpecs[3]]);
upsertHeadLinks(path.join(root, "blog", "index.html"), [feedSpecs[3]]);
upsertHeadLinks(path.join(root, "journal", "index.html"), [feedSpecs[3]]);
upsertHeadLinks(path.join(root, "podcast", "index.html"), [feedSpecs[4]]);
