import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const RADAR_ROOT = path.join(ROOT, "wirkungsradar");
const SITE_URL = "https://wirkungsoekonomie.de";
const VERSION = "20260604-radar-canonical-p0";

const manualCanonical = {
  "fuenfzehn-minuten-stadt-klimakaefig": "15-minuten-stadt-oder-klimakaefig",
  "sdgs-weltregierung": "sdgs-sind-weltregierung",
  "oerr-oder-staatsfunk": "oeffentlicher-rundfunk-staatsfunk",
  "verfassungsschutz-regierungsschutz": "verfassungsschutz-oder-regierungsschutz",
  "windraeder-zerstoeren-natur": "windraeder-voegel-wald-beton-rueckbau",
  "genderismus": "gender-ideologie",
  "sozialtourismus-frame": "migration-kostet-nur",
  "masseneinwanderung": "migration-kostet-nur",
  "medien-zensur": "das-ist-zensur",
  "kernenergie-einfache-loesung": "kernenergie-wieder-in-deutschland",
};

const manualSynonyms = {
  "15-minuten-stadt-oder-klimakaefig": [
    "Klimakäfig",
    "Klimakaefig",
    "15 Minuten Stadt",
    "15-Minuten-Stadt",
    "Fünfzehn-Minuten-Stadt",
    "Fuenfzehn-Minuten-Stadt",
    "Smart-City-Kontrolle",
    "Bewegungsverbote",
  ],
  "sdgs-sind-weltregierung": ["SDGs Weltregierung", "Agenda 2030 Weltregierung", "UN Weltregierung"],
  "oeffentlicher-rundfunk-staatsfunk": ["ÖRR Staatsfunk", "OERR Staatsfunk", "öffentlich-rechtlicher Rundfunk", "Staatsfunk"],
  "verfassungsschutz-oder-regierungsschutz": ["Verfassungsschutz Regierungsschutz", "Regierungsschutz"],
  "windraeder-voegel-wald-beton-rueckbau": ["Windräder zerstören Natur", "Windräder Sondermüll", "Windkraft Vögel", "Windkraft Wald", "SF6 Windrad"],
  "gender-ideologie": ["Genderismus", "Gender-Ideologie", "Gender Ideologie"],
  "migration-kostet-nur": ["Sozialtourismus", "Masseneinwanderung", "Ausländer plündern Sozialstaat", "Migration kostet", "nie eingezahlt"],
  "das-ist-zensur": ["Medien Zensur", "Zensur", "Faktenchecker Zensur"],
  "kernenergie-wieder-in-deutschland": ["Kernenergie einfache Lösung", "Atomkraft zurück", "Kernkraft Rettung"],
};

const relatedNarratives = {
  "15-minuten-stadt-oder-klimakaefig": [
    ["Smart Meter Überwachung", "/wirkungsradar/live/wirkungsoekonomie-social-credit/"],
    ["WHO-Weltregierung", "/wirkungsradar/live/sdgs-sind-weltregierung/"],
    ["Social Credit", "/wirkungsradar/live/wirkungsoekonomie-social-credit/"],
    ["Great Reset", "/wirkungsradar/live/das-ist-alles-gesteuert/"],
  ],
  "migration-kostet-nur": [
    ["Kriminalität und Migration", "/wirkungsradar/live/kriminalitaet-und-migration/"],
    ["Arbeit lohnt sich nicht mehr", "/wirkungsradar/live/arbeit-lohnt-sich-nicht-mehr/"],
    ["Wohnungsnot wegen Migration", "/wirkungsradar/live/wohnungsnot-wegen-migration/"],
    ["Fachkräftemangel ohne Zuwanderung", "/wirkungsradar/live/fachkraeftemangel-ohne-zuwanderung/"],
  ],
  "gender-ideologie": [
    ["Queere Sichtbarkeit bedroht Kinder", "/wirkungsradar/live/queere-sichtbarkeit-bedroht-kinder/"],
    ["Feminismus zerstört Familie", "/wirkungsradar/live/feminismus-zerstoert-familie/"],
    ["Man darf ja nichts mehr sagen", "/wirkungsradar/live/man-darf-ja-nichts-mehr-sagen/"],
    ["Das ist Zensur", "/wirkungsradar/live/das-ist-zensur/"],
  ],
};

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() && entry.name === "index.html" ? [full] : [];
  });
}

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripHtml(value) {
  return String(value ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/co₂/g, "co2")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function cleanTitle(value) {
  return stripHtml(value)
    .replace(/\s*[|–-]\s*(Wirkungsradar|Debatten-Kompass)\s*(Live|Detail|Narrative)?\s*$/i, "")
    .replace(/\s*[|–-]\s*Wirkungsradar\s*$/i, "")
    .replace(/^Wirkungsradar\s*[-–]\s*/i, "")
    .trim();
}

function titleOf(html, fallback) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  return cleanTitle(h1 || title || fallback);
}

function descriptionOf(html) {
  const meta = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1];
  const subtitle = html.match(/<p[^>]*class="[^"]*(?:hero-subtitle|card-text)[^"]*"[^>]*>([\s\S]*?)<\/p>/i)?.[1];
  return stripHtml(meta || subtitle || "");
}

function tagsOf(html) {
  const tags = new Set();
  for (const match of html.matchAll(/<span[^>]*class="[^"]*(?:chip|badge)[^"]*"[^>]*>([\s\S]*?)<\/span>/gi)) {
    const tag = stripHtml(match[1]);
    if (tag) tags.add(tag);
  }
  for (const match of html.matchAll(/<span>([^<]{2,80})<\/span>/gi)) {
    const tag = stripHtml(match[1]);
    if (tag && !/^(Antwort öffnen|Seite öffnen|Mehr anzeigen)$/i.test(tag)) tags.add(tag);
  }
  return [...tags].slice(0, 12);
}

function relPath(file) {
  return path.relative(ROOT, file).split(path.sep).join("/");
}

function urlFromFile(file) {
  return `/${relPath(file).replace(/index\.html$/, "")}`;
}

function slugFromUrl(url) {
  return url.match(/^\/wirkungsradar\/(?:live|detail)\/([^/]+)\//)?.[1] || "";
}

function canonicalSlug(slug) {
  let current = slug;
  const seen = new Set();
  while (manualCanonical[current] && !seen.has(current)) {
    seen.add(current);
    current = manualCanonical[current];
  }
  return current;
}

function canonicalUrlFor(url) {
  const live = url.match(/^\/wirkungsradar\/live\/([^/]+)\//)?.[1];
  const detail = url.match(/^\/wirkungsradar\/detail\/([^/]+)\//)?.[1];
  if (live) return `/wirkungsradar/live/${canonicalSlug(live)}/`;
  if (detail) return `/wirkungsradar/live/${canonicalSlug(detail)}/`;
  return url;
}

function redirectPage({ title, fromUrl, toUrl }) {
  const absolute = `${SITE_URL}${toUrl}`;
  const pageTitle = "Diese Aussage wurde zusammengeführt";
  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex, follow">
  <meta http-equiv="refresh" content="0; url=${esc(toUrl)}">
  <link rel="canonical" href="${esc(absolute)}">
  <title>${esc(pageTitle)} · Debatten-Kompass</title>
</head>
<body>
  <main class="section" data-search-exclude>
    <article class="card">
      <p class="card-kicker">Zentrale Debattenkarte</p>
      <h1>${esc(pageTitle)}</h1>
      <p>Diese alte Adresse ist keine eigene Karte mehr. Sie führt auf die zentrale Debattenkarte.</p>
      <p><a href="${esc(toUrl)}">Zentrale Seite öffnen</a></p>
      <p><small>${esc(fromUrl)} → ${esc(toUrl)}</small></p>
    </article>
  </main>
</body>
</html>
`;
}

function ensureCanonicalLink(html, canonicalUrl) {
  const absolute = `${SITE_URL}${canonicalUrl}`;
  if (/<link\s+rel="canonical"/i.test(html)) {
    return html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${esc(absolute)}">`);
  }
  return html.replace(/<\/head>/i, `  <link rel="canonical" href="${esc(absolute)}">\n</head>`);
}

function insertRelated(html, slug) {
  const items = relatedNarratives[slug];
  if (!items?.length || html.includes('id="verwandte-narrative"')) return html;
  const section = `<section class="section radar-related-narratives" id="verwandte-narrative">
  <div>
    <div class="section-header"><p class="hero-kicker">Verwandte Narrative</p><h2>Welche Frames häufig danebenlaufen.</h2></div>
    <div class="card-grid four">${items.map(([title, href]) => `<a class="card text-link-card" href="${esc(href)}"><h3 class="card-title">${esc(title)}</h3><p class="card-text">Zur zentralen Debattenkarte springen.</p></a>`).join("")}</div>
  </div>
</section>`;
  return html.replace(/\s*<\/main>/i, `\n${section}\n</main>`);
}

function cardHrefToCanonical(href, currentDir) {
  if (!href || href.startsWith("#") || /^https?:/i.test(href)) return href;
  const absolutePath = path.posix.normalize(path.posix.join("/", currentDir, href));
  const withSlash = absolutePath.endsWith("/") ? absolutePath : `${absolutePath}/`;
  const canonical = canonicalUrlFor(withSlash);
  if (canonical === withSlash) return href;
  let relative = path.posix.relative(`/${currentDir}`, canonical);
  if (!relative.startsWith(".")) relative = relative || ".";
  return relative.endsWith("/") ? relative : `${relative}/`;
}

function rewriteLinksAndDropDuplicateCards(file, html) {
  const currentDir = path.posix.dirname(urlFromFile(file).replace(/^\//, ""));
  const seenCards = new Set();
  return html.replace(/<a\b([^>]*?)href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/gi, (full, before, href, after, body) => {
    const newHref = cardHrefToCanonical(href, currentDir);
    const absolute = newHref.startsWith("/") ? newHref : path.posix.normalize(path.posix.join("/", currentDir, newHref));
    const key = canonicalUrlFor(absolute.endsWith("/") ? absolute : `${absolute}/`);
    const isCard = /class="[^"]*(?:card|radar-search-result|text-link-card|radar-live-card)[^"]*"/i.test(full) || /data-radar-card/i.test(full);
    if (isCard && key.startsWith("/wirkungsradar/live/")) {
      if (seenCards.has(key)) return "";
      seenCards.add(key);
    }
    return `<a${before}href="${esc(newHref)}"${after}>${body}</a>`;
  });
}

function textSimilarity(a, b) {
  const aw = new Set(normalize(a).split(/\s+/).filter((word) => word.length > 2));
  const bw = new Set(normalize(b).split(/\s+/).filter((word) => word.length > 2));
  if (!aw.size || !bw.size) return 0;
  const intersection = [...aw].filter((word) => bw.has(word)).length;
  const union = new Set([...aw, ...bw]).size;
  return intersection / union;
}

const files = walk(RADAR_ROOT);
const inventory = files.map((file) => {
  const html = read(file);
  const url = urlFromFile(file);
  const slug = slugFromUrl(url) || url.replace(/^\/wirkungsradar\/|\/$/g, "");
  const canonicalUrl = canonicalUrlFor(url);
  return {
    url,
    title: titleOf(html, slug),
    slug,
    tags: tagsOf(html),
    synonyms: manualSynonyms[canonicalSlug(slugFromUrl(url))] || [],
    category: url.match(/^\/wirkungsradar\/([^/]+)/)?.[1] || "wirkungsradar",
    canonicalTarget: canonicalUrl,
    description: descriptionOf(html),
    text: stripHtml(html).slice(0, 4000),
  };
});

const exact = [];
const probable = [];
const byTitle = new Map();
for (const item of inventory) {
  const key = normalize(item.title);
  if (!key) continue;
  const list = byTitle.get(key) || [];
  list.push(item);
  byTitle.set(key, list);
}
for (const list of byTitle.values()) {
  if (list.length > 1) {
    exact.push({ type: "exakte Dublette", urls: list.map((item) => item.url), canonicalTarget: list[0].canonicalTarget });
  }
}
const claimPages = inventory.filter((item) => /^\/wirkungsradar\/(?:live|detail)\//.test(item.url));
for (let i = 0; i < claimPages.length; i += 1) {
  for (let j = i + 1; j < claimPages.length; j += 1) {
    const a = claimPages[i];
    const b = claimPages[j];
    if (a.canonicalTarget === b.canonicalTarget) continue;
    const titleScore = textSimilarity(a.title, b.title);
    const textScore = textSimilarity(a.text, b.text);
    if (titleScore >= 0.8 || textScore >= 0.8) {
      probable.push({
        type: titleScore >= 0.8 ? "wahrscheinliche Dublette" : "Struktur-Dublette",
        score: Number(Math.max(titleScore, textScore).toFixed(3)),
        urls: [a.url, b.url],
        titles: [a.title, b.title],
      });
    }
  }
}

const canonicalSlugs = new Set();
const redirects = [];
for (const item of inventory) {
  const canonical = item.canonicalTarget;
  if (/^\/wirkungsradar\/live\/[^/]+\//.test(canonical)) {
    canonicalSlugs.add(canonical.match(/^\/wirkungsradar\/live\/([^/]+)\//)?.[1]);
  }
  const file = path.join(ROOT, item.url.replace(/^\//, ""), "index.html");
  if (!fs.existsSync(file)) continue;
  if (item.url !== canonical && /^\/wirkungsradar\/(?:live|detail)\//.test(item.url)) {
    write(file, redirectPage({ title: item.title, fromUrl: item.url, toUrl: canonical }));
    redirects.push({ from: item.url, to: canonical, title: item.title });
    continue;
  }
  let html = read(file);
  html = html.replace(/Zur kanonischen Debattenkarte springen\./g, "Zur zentralen Debattenkarte springen.");
  html = rewriteLinksAndDropDuplicateCards(file, html);
  html = ensureCanonicalLink(html, canonical);
  const slug = canonical.match(/^\/wirkungsradar\/live\/([^/]+)\//)?.[1];
  if (slug && item.url === canonical) html = insertRelated(html, slug);
  write(file, html);
}

const map = {
  version: VERSION,
  rule: "Eine Aussage = eine kanonische Seite. Tags und Synonyme erzeugen keine Karten.",
  canonicalBase: "/wirkungsradar/live/",
  aliases: Object.fromEntries(Object.entries(manualCanonical).map(([from, to]) => [`/wirkungsradar/live/${from}/`, `/wirkungsradar/live/${canonicalSlug(to)}/`])),
  detailPattern: { from: "/wirkungsradar/detail/{slug}/", to: "/wirkungsradar/live/{canonicalSlug}/" },
  synonyms: Object.fromEntries([...canonicalSlugs].sort().map((slug) => [slug, [...new Set([...(manualSynonyms[slug] || [])])]])),
};
for (const slug of canonicalSlugs) {
  map.aliases[`/wirkungsradar/detail/${slug}/`] = `/wirkungsradar/live/${slug}/`;
}

write(path.join(ROOT, "assets/data/wirkungsradar-canonical-map.json"), `${JSON.stringify(map, null, 2)}\n`);

const canonicalTargets = new Set(claimPages.map((item) => item.canonicalTarget).filter((url) => /^\/wirkungsradar\/live\//.test(url)));
const report = {
  version: VERSION,
  generatedAt: new Date().toISOString(),
  counts: {
    radarPages: inventory.length,
    claimPages: claimPages.length,
    canonicalNarratives: canonicalTargets.size,
    duplicates: redirects.length + exact.length + probable.length,
    merged: redirects.length,
    synonyms: Object.values(map.synonyms).reduce((sum, items) => sum + items.length, 0),
    redirects: redirects.length,
  },
  inventory: inventory.map(({ text, description, ...item }) => item),
  duplicates: [
    ...exact,
    ...Object.entries(manualCanonical).map(([from, to]) => ({
      type: "Synonym-Dublette",
      from: `/wirkungsradar/live/${from}/`,
      canonicalTarget: `/wirkungsradar/live/${canonicalSlug(to)}/`,
    })),
    ...probable,
  ],
  redirects,
};

const mergeRows = redirects
  .map((item) => `| ${item.from} | ${item.to} | ${item.title.replace(/\|/g, "\\|")} |`)
  .join("\n");
write(
  path.join(ROOT, "reports/wirkungsradar-canonicalization-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);
write(
  path.join(ROOT, "reports/wirkungsradar-canonicalization-report.md"),
  `# Debatten-Kompass Kanonisierung\n\n` +
    `Stand: ${report.generatedAt}\n\n` +
    `| Kennzahl | Wert |\n|---|---:|\n` +
    `| Radar-Seiten | ${report.counts.radarPages} |\n` +
    `| Claim-Seiten | ${report.counts.claimPages} |\n` +
    `| Kanonische Narrative | ${report.counts.canonicalNarratives} |\n` +
    `| Dubletten / Kandidaten | ${report.counts.duplicates} |\n` +
    `| Zusammengeführt | ${report.counts.merged} |\n` +
    `| Synonyme | ${report.counts.synonyms} |\n` +
    `| Redirects | ${report.counts.redirects} |\n\n` +
    `## Zusammenführungen\n\n| Von | Nach | Titel |\n|---|---|---|\n${mergeRows || "| - | - | - |"}\n`,
);

console.log(`Radar-Kanonisierung: ${canonicalTargets.size} kanonische Narrative, ${redirects.length} Redirects, ${report.counts.synonyms} Synonyme.`);
