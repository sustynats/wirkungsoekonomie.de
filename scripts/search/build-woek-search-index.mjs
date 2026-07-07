import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const indexPath = "assets/search/search-index.json";
const metaPath = "public/data/woek-search-meta.json";
const glossaryPath = "public/data/glossary.terms.json";
const PAGE_BODY_LIMIT = 1600;
const SECTION_BODY_LIMIT = 900;
const FULLTEXT_BODY_LIMIT = 500;
const INTERNAL_PUBLIC_ROUTE_PATTERNS = [
  /^\/referenz\/version(?:en|-)/,
  /^\/referenz\/export\//,
  // macOS-Duplikat-Artefakte ("… 2.html"): archivierte Redirect-Stubs auf das
  // kanonische Geschwister. Route bleibt erreichbar, wird aber nicht indexiert.
  / \d+\.html$/
];
const LEGACY_SEARCH_ROUTE_REDIRECTS = new Map([
  [
    "/docs/wirtschaft-unternehmen/source-html/detail_impact_controlling_im_unternehmen.html",
    "/wirkungsfelder/wirtschaft-unternehmen/detailkonzepte/impact_controlling_im_unternehmen/",
  ],
]);
const PUBLIC_SEARCH_REPLACEMENTS = [
  [/Kontext-Werkzeuge/g, "Methoden & Werkzeuge"],
  [/Werkstatt:/g, "Bibliothek:"],
  [/Kosten je FTE/g, "Kosten je Vollzeitstelle"],
  [/\bFTE\b/g, "Vollzeitstellen"],
  [/Bildungsportal öffnen/g, "Wirkungsfeld öffnen"],
  [/Portal öffnen/g, "Wirkungsfeld öffnen"],
  [/Portalarchitektur/g, "Systemlandkarte"],
  [/Grundstruktur vorhanden/g, "Wirkungsfeld"],
  [/Working Paper vorhanden/g, "Vertiefung"],
  [/Konzept vorhanden/g, "Vertiefung"],
  [/ausgebaut \/ erster Schwerpunkt/g, "Wirkungsfeld"],
  [/kanonische Portalstruktur/g, "Systemlandkarte"],
  [/Dossier in Vorbereitung/g, "Weiterführende Vertiefung"],
  [/Tool-Spezifikation und Rechenmodell/g, "Methodik und Annahmen"],
  [/Tool-Spezifikation:/g, "Methodik:"],
  [/Tool-Spezifikation/g, "Methodik"],
  [/Spezifikation online lesen/g, "Methodik lesen"],
  [/Spezifikation online/g, "Methodenseite"],
  [/\bInputs\b/g, "Eingaben"],
  [/\bOutputs\b/g, "Ergebnisse"],
  [/Website-Integration/g, "Einordnung auf der Website"],
  [/Nächster Entwicklungsschritt/g, "Methodik und Grenzen"],
  [/Demo in Vorbereitung/g, "Methodenseite"],
  [/Portal der Wirkungsökonomie/g, "Wirkungsökonomie"],
  [/Produktportal/g, "Produktbereich"],
  [/Erklärung vorhanden/g, "Methodik"],
  [/Download wird ergänzt/g, "Arbeitsmaterial"],
  [/Toolkarte öffnen/g, "Toolkarte ansehen"],
  [/Audio verfügbar\. Transkript in Bearbeitung\./g, "Audio verfügbar."],
  [/Methodendokumentation folgt/g, "Methodik und Annahmen"],
  [/Datenquellen vorbereitet/g, "Datenquellen und Grenzen"],
  [/Version v0\.1/g, "Modellhafte Fassung"],
  [/\bv0\.1\b/g, "Modellfassung"],
  [/Toolseite öffnen/g, "Methodik lesen"],
  [/Publikationszugang/g, "Vertiefung"],
  [/Portalstruktur/g, "Übersicht"],
  [/Tool-Architektur/g, "Werkzeuglogik"],
  [/Detailkonzept \+ Dossier/g, "Vertiefung"],
  [/Einzeldossier-Set/g, "Einzeldossiers"],
  [/Dossier & Export/g, "Vertiefung"],
  [/Export & Archiv/g, "Arbeitsmaterial"],
  [/Downloads und Druck/g, "Materialien und Downloads"],
  [/Onlinefassung, Druck und Export/g, "Materialien und Downloads"],
  [/Du liest die Onlinefassung\.?/g, "Die Seite ist online lesbar."],
  [/Der Die Seite ist online lesbar\.?/g, "Die Seite ist online lesbar."],
  [/Der Du liest die Onlinefassung\.?/g, "Die Seite ist online lesbar."],
  [/Online-Volltext/g, "Onlinefassung"],
  [/Dokumentenmatrix/g, "Materialübersicht"],
  [/Export- und Archivfassungen/g, "ergänzende Downloadfassungen"],
  [/Export- und Archiv/g, "Download"],
  [/Export und Archiv/g, "Download"],
  [/Portaltext/g, "Seitentext"],
  [/kanonische Seitenadresse/gi, "Seitenadresse"],
  [/Kanonische Seite öffnen/g, "Seite öffnen"],
  [/kanonisch/gi, "öffentlich"],
  [/in Vorbereitung/g, "wird ergänzt"],
  [/Prototypen/g, "Demos"],
  [/Prototyp/g, "Modellhafte Demo"],
  [/KPI-Rechner/g, "Wirkungsindikatoren-Demo"],
  [/Methodenlandkarte/g, "Methoden & Werkzeuge"],
  [/RSS & Updates|Updates & RSS/g, "Neu auf der Website"],
];

function clean(text) {
  return String(text || "")
    .replace(/<([a-z][\w:-]*)\b[^>]*data-search-exclude[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<([a-z][\w:-]*)\b[^>]*class=["'][^"']*(?:no-print|breadcrumb|side-nav|toc-card|model-strip|footer-nav|site-nav|publication-matrix-wrap)[^"']*["'][^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<aside[\s\S]*?<\/aside>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function publicSearchText(text) {
  return PUBLIC_SEARCH_REPLACEMENTS.reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), String(text || ""));
}

function publicSearchValue(value) {
  if (typeof value === "string") return publicSearchText(value);
  if (Array.isArray(value)) return value.map(publicSearchValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, publicSearchValue(item)]));
  }
  return value;
}

function unique(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

function normalizeSearchRoute(url) {
  return String(url || "").replace(/#.*$/, "").replace(/\/index\.html$/, "/");
}

function canonicalSearchRoute(url) {
  const route = normalizeSearchRoute(url).replace(/^\/wirkungsradar\/detail\//, "/wirkungsradar/live/");
  return LEGACY_SEARCH_ROUTE_REDIRECTS.get(route) || route;
}

function canonicalizeLegacyEntry(entry) {
  const originalRoute = normalizeSearchRoute(entry.url);
  const route = LEGACY_SEARCH_ROUTE_REDIRECTS.get(originalRoute);
  if (!route) return entry;
  return {
    ...entry,
    url: route,
    canonicalUrl: route,
    aliases: unique([...(Array.isArray(entry.aliases) ? entry.aliases : []), originalRoute]),
  };
}

function canonicalizeEntry(entry) {
  const route = canonicalSearchRoute(entry.url);
  const originalRoute = normalizeSearchRoute(entry.url);
  if (!route || route === originalRoute) return entry;
  return {
    ...entry,
    url: route,
    canonicalUrl: route,
    aliases: unique([...(Array.isArray(entry.aliases) ? entry.aliases : []), originalRoute]),
  };
}

function isLocalPrivateUrl(url) {
  const value = String(url || "");
  return (
    value.includes("/.claude/") ||
    value.includes("/worktrees/") ||
    value.includes("/Users/") ||
    value.includes("/private/") ||
    value.includes("file://") ||
    /(^|\/)(?:Users|Volumes|tmp|var\/folders)\//i.test(value)
  );
}

function canonicalEntryKey(entry) {
  const route = canonicalSearchRoute(entry.url);
  if (route) return route;
  return normalizeSemantic(`${entry.title || ""} ${entry.section || ""}`);
}

function isInternalPublicRoute(url) {
  const route = normalizeSearchRoute(url);
  return INTERNAL_PUBLIC_ROUTE_PATTERNS.some((pattern) => pattern.test(route));
}

function isLowValueEntry(entry) {
  const route = normalizeSearchRoute(entry.url);
  const title = String(entry.title || "");
  const section = String(entry.section || "");
  if (/\/(impressum|datenschutz|ueber|mitmachen)(\.html|\/)?$/i.test(route)) return true;
  if (/footer|navigation|kontakt/i.test(title) || /footer|navigation/i.test(section)) return true;
  if (/^\/referenz\/kapitel-\d{3}-.+#/i.test(String(entry.url || "")) && /Endnoten|Quellen/i.test(title)) return true;
  return false;
}

function isSearchNoiseEntry(entry) {
  const title = publicSearchText(String(entry.title || "")).trim().toLowerCase();
  const section = publicSearchText(String(entry.section || "")).trim().toLowerCase();
  const body = publicSearchText(String(entry.body || "")).toLowerCase();
  const noiseTitles = new Set(["kontakt", "verstehen", "referenzrahmen", "kontext-werkzeuge", "methoden & werkzeuge", "erleben & lernen", "werkstatt"]);
  if (noiseTitles.has(title) && body.length < 900) return true;
  if (/footer navigation|hauptnavigation|site-nav|footer-nav/i.test(body)) return true;
  const footerCluster = [
    "wirkung einfach erklärt",
    "sdg-/sdg+-referenzrahmen",
    "interaktive demos",
    "arbeitsbibliothek",
    "dokumentenregistry",
    "dokumentenbibliothek",
  ];
  if (footerCluster.filter((item) => body.includes(item)).length >= 3) return true;
  if (body.includes("kontakt:") && body.includes("© 2026 natalie weber")) return true;
  return section.includes("footer") || section.includes("navigation");
}

function normalizePriority(entry) {
  if (!isLowValueEntry(entry)) return entry;
  return {
    ...entry,
    priority: Math.min(Number(entry.priority || 0), 8),
    tags: unique([...(Array.isArray(entry.tags) ? entry.tags : []), "Suchindex nachrangig"]),
  };
}

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function entryFromTerm(term) {
  const semanticTerms = unique([
    term.canonicalLabel,
    term.label,
    ...(term.aliases || []),
    ...(term.synonyms || []),
    ...(term.searchKeywords || []),
    ...(term.relatedTerms || []),
  ]).slice(0, 48);
  const body = [
    term.canonicalLabel,
    term.shortDefinition,
    term.hoverDefinition,
    term.longDefinition,
    term.usageNote,
    ...(term.synonyms || []),
    ...(term.searchKeywords || []),
    ...(term.relatedTerms || []),
  ].join(" ");
  return {
    id: `woek-term-${term.slug}`,
    title: term.canonicalLabel,
    description: term.shortDefinition,
    url: `/begriffe/${term.slug}/`,
    section: "Begriffe",
    type: term.status === "anschlussbegriff" ? "Anschlussbegriff" : "Begriff",
    format: "Glossarbegriff",
    impactSpaces: ["Mensch", "Planet", "Demokratie"],
    standards: term.relatedTerms?.filter((item) => /sdg|csrd|esrs|taxonomie|gri|nace/i.test(item)) || [],
    instruments: term.relatedTerms || [],
    tags: [term.status, term.version, term.reviewStatus, ...(term.synonyms || []), ...(term.searchKeywords || [])].filter(Boolean),
    aliases: [...(term.synonyms || []), term.hoverDefinition],
    body,
    semanticTerms,
    semanticText: semanticTerms.join(" "),
    priority: term.status === "führender-begriff" ? 140 : 110,
  };
}

function normalizeSemantic(value) {
  return String(value || "")
    .toLocaleLowerCase("de")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9+#\s/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function semanticAliases(term) {
  return unique([
    term.canonicalLabel,
    term.label,
    ...(term.aliases || []),
    ...(term.synonyms || []),
  ])
    .map((value) => normalizeSemantic(value))
    .filter((value) => value.length >= 4 && !/^(und|oder|der|die|das|ein|eine|mit|von|fuer|als|ist)$/.test(value))
    .slice(0, 10);
}

function semanticTermsForText(text, limit = 28) {
  const normalized = normalizeSemantic(text).slice(0, 12000);
  const matches = [];
  for (const term of glossary) {
    const aliases = semanticAliases(term);
    const matchedAlias = aliases.find((alias) => normalized.includes(alias));
    if (!matchedAlias) continue;
    matches.push({
      label: term.canonicalLabel || term.label || term.slug,
      score: matchedAlias.length + (term.status === "führender-begriff" ? 12 : 0),
      related: (term.relatedTerms || []).slice(0, 5),
    });
  }
  matches.sort((a, b) => b.score - a.score || String(a.label).localeCompare(String(b.label), "de"));
  return unique(matches.flatMap((match) => [match.label, ...match.related])).slice(0, limit);
}

const EXCLUDED_WALK_DIRS = new Set([
  ".claude",
  ".git",
  ".next",
  "_site",
  "dist",
  "node_modules",
  "out",
  "woek-akademie-app",
  "woek-institut-app",
]);

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!EXCLUDED_WALK_DIRS.has(entry.name)) walk(full, files);
    }
    else if (/\.(md|mdx|html)$/i.test(entry.name)) files.push(full);
  }
  return files;
}

function routeFor(file) {
  const rel = file.replace(/\\/g, "/");
  if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"/index.html".length)}/`;
  if (rel.endsWith(".html")) return `/${rel}`;
  if (rel.startsWith("src/content/docs/")) return `/${rel.replace(/^src\/content\/docs\//, "").replace(/\.(md|mdx)$/i, "/")}`;
  return `/${rel}`;
}

function entriesFromContent(file) {
  const text = fs.readFileSync(file, "utf8");
  const route = routeFor(file);
  if (isInternalPublicRoute(route)) return [];
  const metaTitle = clean(text.match(/<meta\s+name=["']search_title["']\s+content=["']([^"']+)["']/i)?.[1]);
  const metaDescription =
    clean(text.match(/<meta\s+name=["']search_description["']\s+content=["']([^"']+)["']/i)?.[1]) ||
    clean(text.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1]);
  const title =
    metaTitle ||
    text.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1] ||
    clean(text.match(/<h1[^>]*>(.*?)<\/h1>/i)?.[1]) ||
    path.basename(file).replace(/\.[^.]+$/, "");
  const documentType = text.match(/^documentType:\s*["']?(.+?)["']?\s*$/m)?.[1] || "Referenz";
  const status = text.match(/^status:\s*["']?(.+?)["']?\s*$/m)?.[1] || "online-reviewed";
  const version =
    text.match(/<dt>Web-Version<\/dt><dd>(.*?)<\/dd>/i)?.[1] ||
    text.match(/^webVersion:\s*["']?(.+?)["']?\s*$/m)?.[1] ||
    "2026.1";
  const liveBoost = version === "2026.2-live-reference" ? 25 : 0;
  const isReferenceChapter = /referenz\/kapitel-\d{3}-/.test(file);
  const isRegister = /woek-master-items-final-v1-2/.test(file);
  const isFulltext = route === "/referenz/volltext/";
  const bodyLimit = isFulltext ? FULLTEXT_BODY_LIMIT : PAGE_BODY_LIMIT;
  const body = clean(text).slice(0, bodyLimit);
  if (body.length < 80) return [];
  const pageSemanticTerms = semanticTermsForText(`${title} ${body}`);
  const sectionMatches = Array.from(text.matchAll(/<h([2-3])[^>]*id=["']([^"']+)["'][^>]*>(.*?)<\/h\1>/gi));
  const base = {
    documentType,
    status,
    version,
    sourceFile: file,
    contentHash: hash(text),
  };
  const pageEntry = {
    id: `woek-page-${hash(file)}`,
    title,
    description: metaDescription || body.slice(0, 240),
    url: route,
    section: documentType,
    type: documentType,
    format: documentType,
    impactSpaces: [],
    standards: [],
    instruments: [],
    tags: [status, version, "WÖk-Referenz"],
    aliases: [],
    body,
    semanticTerms: pageSemanticTerms,
    semanticText: pageSemanticTerms.join(" "),
    priority: 70 + liveBoost + (isReferenceChapter ? 15 : 0) + (isRegister ? 20 : 0),
  };
  const entries = [pageEntry];
  if (isFulltext) {
    return entries.map((entry) => ({ entry, meta: { ...base, sectionId: "" } }));
  }
  for (const match of sectionMatches) {
    const sectionId = match[2];
    const sectionTitle = clean(match[3]);
    const matchStart = match.index || 0;
    const nextHeading = text.slice(matchStart + match[0].length).search(/<h[2-3]\b/i);
    const sectionHtml =
      nextHeading >= 0
        ? text.slice(matchStart, matchStart + match[0].length + nextHeading)
        : text.slice(matchStart, matchStart + 9000);
    const sectionBody = clean(sectionHtml).slice(0, SECTION_BODY_LIMIT);
    const sectionSemanticTerms = semanticTermsForText(`${sectionTitle} ${sectionBody}`);
    entries.push({
      ...pageEntry,
      id: `woek-section-${sectionId}`,
      title: `${title}: ${sectionTitle}`,
      description: sectionBody.slice(0, 240) || pageEntry.description,
      url: `${route}#${sectionId}`,
      body: sectionBody || pageEntry.body,
      semanticTerms: sectionSemanticTerms.length ? sectionSemanticTerms : pageSemanticTerms,
      semanticText: (sectionSemanticTerms.length ? sectionSemanticTerms : pageSemanticTerms).join(" "),
      priority: 85 + liveBoost + (isReferenceChapter ? 15 : 0) + (isRegister ? 20 : 0),
    });
  }
  return entries.map((entry) => ({ entry, meta: { ...base, sectionId: entry.id.replace(/^woek-section-/, "") } }));
}

const existing = fs.existsSync(indexPath) ? JSON.parse(fs.readFileSync(indexPath, "utf8")) : [];
const existingMeta = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, "utf8")).entries || {} : {};
const glossary = fs.existsSync(glossaryPath) ? JSON.parse(fs.readFileSync(glossaryPath, "utf8")).terms : [];
const generated = [];
const meta = {};

for (const term of glossary) {
  const entry = entryFromTerm(term);
  generated.push(entry);
  meta[entry.url] = {
    documentType: "begriff",
    status: term.status,
    version: term.version,
    sectionId: `begriff-${term.slug}`,
    documentId: term.termId,
    relatedTerms: term.relatedTerms || [],
    relatedDocuments: term.relatedDocuments || [],
    sourceFile: term.sourceDocument,
    searchBoost: entry.priority,
  };
}

const contentFiles = ["src/content/docs", "blog", "journal", "podcast", "referenz", "bibliothek", "dokumente", "instrumente", "beispiele", "quellen", "quellenarchiv", "export", "werkstatt", "werkzeuge", "anwendungen", "verstehen", "en"]
  .flatMap((dir) => walk(dir));
for (const file of contentFiles) {
  for (const { entry, meta: itemMeta } of entriesFromContent(file)) {
    generated.push(entry);
    meta[entry.url] = itemMeta;
  }
}

const byUrl = new Map(
  existing
    .filter((entry) => !String(entry.id || "").startsWith("woek-"))
    .filter((entry) => !isLocalPrivateUrl(entry.url))
    .map(canonicalizeLegacyEntry)
    .map((entry) => [entry.url, entry]),
);
for (const entry of generated) byUrl.set(entry.url, entry);
for (const entry of existing.filter((item) => !String(item.id || "").startsWith("woek-"))) {
  if (entry.url && !isLocalPrivateUrl(entry.url) && existingMeta[entry.url]) meta[entry.url] = existingMeta[entry.url];
}
const merged = Array.from(byUrl.values())
  .filter((entry) => !isInternalPublicRoute(entry.url))
  .filter((entry) => !isSearchNoiseEntry(entry))
  .map(publicSearchValue)
  .map(normalizePriority)
  .sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0) || String(a.title).localeCompare(String(b.title), "de"));

const generatedAt = process.env.SOURCE_DATE_EPOCH
  ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000).toISOString()
  : "source-derived";

fs.writeFileSync(indexPath, `${JSON.stringify(merged, null, 2)}\n`);
fs.writeFileSync(metaPath, `${JSON.stringify({ generatedAt, entries: meta }, null, 2)}\n`);
console.log(`Integrated ${generated.length} WÖk search entries into existing search index.`);
