import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const indexPath = "assets/search/search-index.json";
const metaPath = "public/data/woek-search-meta.json";
const glossaryPath = "public/data/glossary.terms.json";
const contentRegistryPath = "assets/data/content-registry.json";
const PAGE_BODY_LIMIT = 1600;
const SECTION_BODY_LIMIT = 900;
const FULLTEXT_BODY_LIMIT = 500;
const PUBLIC_SEARCH_REPLACEMENTS = [
  [/Bildungsportal öffnen/g, "Wirkungsfeld öffnen"],
  [/Produktportal öffnen/g, "Produktwirkung verstehen"],
  [/[A-Za-zÄÖÜäöüß-]*portal öffnen/gi, "Zur Übersicht"],
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
  [/Toolkarte öffnen/g, "Toolkarte ansehen"],
  [/Audio verfügbar\. Transkript in Bearbeitung\./g, "Audio verfügbar."],
  [/Methodendokumentation folgt/g, "Methodik und Annahmen"],
  [/Datenquellen vorbereitet/g, "Datenquellen und Grenzen"],
  [/Version v0\.1/g, "Modellhafte Fassung"],
  [/\bv0\.1\b/g, "Modellfassung"],
  [/Toolseite öffnen/g, "Methodik lesen"],
  [/Publikationszugang/g, "Vertiefung"],
  [/Portaltexts?/g, "Onlinefassung"],
  [/Portalstruktur/g, "Übersicht"],
  [/Tool-Architektur/g, "Werkzeuglogik"],
  [/Detailkonzept \+ Dossier/g, "Vertiefung"],
  [/Einzeldossier-Set/g, "Einzeldossiers"],
  [/Dossier & Export/g, "Vertiefung"],
  [/Export- und Archivfassungen/g, "ergänzende Downloadfassungen"],
  [/Export- und Archiv/g, "Download"],
  [/Export und Archiv/g, "Download"],
  [/kanonische Seitenadresse/gi, "Seitenadresse"],
  [/Kanonische Seite öffnen/g, "Seite öffnen"],
  [/kanonisch/gi, "öffentlich"],
  [/in Vorbereitung/g, "wird ergänzt"],
  [/Prototypen/g, "Demos"],
  [/Prototyp/g, "Modellhafte Demo"],
];

function clean(text) {
  return String(text || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
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

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function entryFromTerm(term) {
  const body = [
    term.canonicalLabel,
    term.shortDefinition,
    term.hoverDefinition,
    term.longDefinition,
    term.usageNote,
    ...(term.synonyms || []),
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
    tags: [term.status, term.version, term.reviewStatus, ...(term.synonyms || [])].filter(Boolean),
    aliases: [...(term.synonyms || []), term.hoverDefinition],
    body,
    priority: term.status === "führender-begriff" ? 1000 : 900,
  };
}

function entryFromRegistry(item) {
  if (!item?.url || item.pageType === "begriff" || !item.isSearchable) return null;
  const priority = {
    wirkungsfeld: 820,
    tool: item.status === "interactive" ? 780 : 520,
    kompass: 720,
    verstehen: 680,
    akademie: 620,
    landing: item.url === "/" ? 700 : 540,
    methode: 500,
    detailkonzept: 420,
    dossier: 340,
    "download-bibliothek": 300,
    journal: 260,
    legal: 80,
    suche: 100,
  }[item.pageType] || 300;
  return {
    id: `woek-registry-${hash(item.url)}`,
    title: item.title,
    description: item.description || item.title,
    url: item.url,
    section: publicSectionLabel(item.pageType, item.pageType),
    type: item.pageType,
    format: item.pageType,
    impactSpaces: [],
    standards: (item.topics || []).filter((topic) => /^SDG/i.test(topic)),
    instruments: item.relatedTools || [],
    tags: [item.pageType, item.status, ...(item.terms || []), ...(item.topics || [])].filter(Boolean),
    aliases: [...(item.terms || []), ...(item.relatedTerms || [])],
    body: [item.title, item.description, ...(item.terms || []), ...(item.topics || [])].join(" "),
    priority,
  };
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
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
  const registryItem = contentRegistryByUrl.get(route);
  if (registryItem && ["hidden", "draft"].includes(registryItem.status)) return [];
  const title =
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
  const sectionMatches = Array.from(text.matchAll(/<h([2-3])[^>]*id=["']([^"']+)["'][^>]*>(.*?)<\/h\1>/gi));
  const base = {
    documentType,
    status,
    version,
    sourceFile: file,
    contentHash: hash(text),
  };
  const pageType = registryItem?.pageType || documentType;
  const statusForSearch = registryItem?.status || status;
  const registryBoost =
    pageType === "begriff" ? 80 :
    pageType === "wirkungsfeld" ? 45 :
    pageType === "tool" && statusForSearch === "interactive" ? 50 :
    pageType === "methode" ? 20 :
    pageType === "akademie" || pageType === "kompass" || pageType === "verstehen" ? 30 :
    pageType === "dossier" || pageType === "download-bibliothek" ? -20 :
    statusForSearch === "archive" ? -35 : 0;
  const pageEntry = {
    id: `woek-page-${hash(file)}`,
    title,
    description: body.slice(0, 240),
    url: route,
    section: publicSectionLabel(pageType, documentType),
    type: pageType,
    format: documentType,
    impactSpaces: [],
    standards: [],
    instruments: [],
    tags: [statusForSearch, pageType, version, "WÖk-Referenz"],
    aliases: [],
    body,
    priority: 70 + liveBoost + registryBoost + (isReferenceChapter ? 15 : 0) + (isRegister ? 20 : 0),
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
    entries.push({
      ...pageEntry,
      id: `woek-section-${sectionId}`,
      title: `${title}: ${sectionTitle}`,
      description: sectionBody.slice(0, 240) || pageEntry.description,
      url: `${route}#${sectionId}`,
      body: sectionBody || pageEntry.body,
      priority: 85 + liveBoost + registryBoost + (isReferenceChapter ? 15 : 0) + (isRegister ? 20 : 0),
    });
  }
  return entries.map((entry) => ({ entry, meta: { ...base, pageType, status: statusForSearch, sectionId: entry.id.replace(/^woek-section-/, "") } }));
}

const existing = fs.existsSync(indexPath) ? JSON.parse(fs.readFileSync(indexPath, "utf8")) : [];
const glossary = fs.existsSync(glossaryPath) ? JSON.parse(fs.readFileSync(glossaryPath, "utf8")).terms : [];
const contentRegistry = fs.existsSync(contentRegistryPath) ? JSON.parse(fs.readFileSync(contentRegistryPath, "utf8")).entries || [] : [];
const contentRegistryByUrl = new Map(contentRegistry.map((entry) => [entry.url, entry]));
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

for (const item of contentRegistry) {
  const entry = entryFromRegistry(item);
  if (!entry) continue;
  generated.push(entry);
  meta[entry.url] = {
    documentType: item.pageType,
    pageType: item.pageType,
    status: item.status,
    version: "2026.1",
    sectionId: item.id,
    documentId: item.id,
    relatedTerms: item.relatedTerms || [],
    relatedDocuments: [],
    sourceFile: item.sourceFile,
    searchBoost: entry.priority,
  };
}

const contentFiles = ["src/content/docs", "referenz", "dokumente", "instrumente", "beispiele", "quellen", "export"]
  .flatMap((dir) => walk(dir));
for (const file of contentFiles) {
  for (const { entry, meta: itemMeta } of entriesFromContent(file)) {
    generated.push(entry);
    meta[entry.url] = itemMeta;
  }
}

const byUrl = new Map(existing.filter((entry) => !String(entry.id || "").startsWith("woek-")).map((entry) => [entry.url, entry]));
for (const entry of generated) byUrl.set(entry.url, entry);
const merged = Array.from(byUrl.values())
  .filter((entry) => {
    const registryItem = contentRegistryByUrl.get(String(entry.url || "").replace(/#.*$/, ""));
    return !registryItem || !["hidden", "draft"].includes(registryItem.status);
  })
  .map(publicSearchValue)
  .sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0) || String(a.title).localeCompare(String(b.title), "de"));

fs.writeFileSync(indexPath, `${JSON.stringify(merged, null, 2)}\n`);
fs.writeFileSync(metaPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), entries: meta }, null, 2)}\n`);
console.log(`Integrated ${generated.length} WÖk search entries into existing search index.`);

function publicSectionLabel(pageType, fallback) {
  return {
    begriff: "Begriffe",
    wirkungsfeld: "Wirkungsfelder",
    tool: "Werkzeuge",
    methode: "Methoden",
    akademie: "Akademie",
    kompass: "Verstehen",
    verstehen: "Verstehen",
    dossier: "Veröffentlichungen",
    detailkonzept: "Detailkonzepte",
    "download-bibliothek": "Bibliothek",
    suche: "Suche",
    landing: "Grundlagen",
  }[pageType] || fallback;
}
