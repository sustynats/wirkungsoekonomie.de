import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { decodeHtmlText, DEFAULT_MANIFEST, SITE_ORIGIN } from "../lib/public-routes.mjs";

const DESCRIPTION_LIMIT = 320;
const BODY_LIMIT = 480;
const ARRAY_LIMIT = 14;
const SUGGESTION_LIMIT_BYTES = 180_000;

const AREA_LABELS = {
  start: "Start & Orientierung",
  akademie: "Akademie",
  anwendungen: "Anwendungen",
  begriffe: "Begriffe",
  bibliothek: "Bibliothek",
  blog: "Journal",
  dokumente: "Dokumente",
  downloads: "Downloads",
  erleben: "Erleben",
  faq: "Fragen",
  fuer: "Für wen",
  institut: "Institut",
  journal: "Journal",
  methodenraum: "Methodenraum",
  methodik: "Methodik",
  ordnung: "Ordnung",
  podcast: "Podcast",
  portale: "Portale",
  quellen: "Quellen",
  quellenarchiv: "Quellenarchiv",
  referenz: "Referenz",
  verstehen: "Verstehen",
  werkstatt: "Werkstatt",
  werkzeuge: "Werkzeuge",
  wirkungsfelder: "Wirkungsfelder",
  wirkungsradar: "Wirkungsradar",
  wirkungssteuerung: "Wirkungssteuerung",
  wirkungsticker: "Wirkungsticker",
  wirkungswissenschaften: "Wirkungswissenschaften",
  wissen: "Wissen",
  "woek-id-register": "WÖk-ID-Register",
};

function hash(value, length = 16) {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, length);
}

function clean(value, limit = Number.POSITIVE_INFINITY) {
  return decodeHtmlText(String(value || "")).replace(/\s+/g, " ").trim().slice(0, limit);
}

function unique(values, limit = ARRAY_LIMIT) {
  return Array.from(new Set((values || []).map((value) => clean(value, 100)).filter(Boolean))).slice(0, limit);
}

export function canonicalRoute(url) {
  const value = String(url || "").trim();
  if (!value) return "";
  try {
    const parsed = new URL(value, SITE_ORIGIN);
    if (parsed.origin !== SITE_ORIGIN && parsed.origin !== "https://www.wirkungsoekonomie.de") return "";
    return parsed.pathname.replace(/\/index\.html$/, "/");
  } catch {
    return value.split(/[?#]/, 1)[0].replace(/\/index\.html$/, "/");
  }
}

function typeForRoute(url) {
  if (/^\/begriffe\//.test(url)) return "Begriff";
  if (/^\/(?:werkzeuge|erleben|anwendungen)\//.test(url)) return "Werkzeug";
  if (/^\/wirkungsfelder\//.test(url)) return "Wirkungsfeld";
  if (/^\/(?:blog|journal)\//.test(url)) return "Journalbeitrag";
  if (/^\/wirkungsticker\//.test(url)) return "Meldung";
  if (/^\/quellenarchiv\//.test(url)) return "Quelle";
  if (/^\/(?:bibliothek|dokumente|downloads)\//.test(url)) return "Publikation";
  if (/^\/(?:referenz|methodenraum|methodik)\//.test(url)) return "Methode & Referenz";
  if (/^\/akademie\//.test(url)) return "Akademie";
  if (/^\/fuer\//.test(url)) return "Zielgruppe";
  if (/^\/(?:fragen|faq|einwaende)(?:\/|\.html)/.test(url)) return "Frage & Einwand";
  return "Seite";
}

function labelFromSlug(value) {
  return decodeURIComponent(String(value || ""))
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toLocaleUpperCase("de-DE"));
}

function taxonomy(route, primary = {}) {
  const url = route.url;
  const area = route.area || "start";
  const roleMatch = url.match(/^\/fuer\/([^/]+)\/?/);
  const type = typeForRoute(url);
  const priority = area === "wirkungsticker"
    ? Math.min(Number(primary.priority || 10), 20)
    : Math.max(Number(primary.priority || 0), type === "Begriff" ? 70 : type === "Methode & Referenz" ? 60 : 30);
  return {
    section: AREA_LABELS[area] || labelFromSlug(area),
    type,
    format: type,
    raum: AREA_LABELS[area] || labelFromSlug(area),
    typ: type,
    rolle: roleMatch ? [labelFromSlug(roleMatch[1])] : [],
    priority,
  };
}

function selectPrimaryEntry(entries) {
  return [...entries].sort((left, right) => {
    const leftHasFragment = String(left.url || "").includes("#") ? 1 : 0;
    const rightHasFragment = String(right.url || "").includes("#") ? 1 : 0;
    return leftHasFragment - rightHasFragment
      || Number(right.priority || 0) - Number(left.priority || 0)
      || String(left.title || "").localeCompare(String(right.title || ""), "de");
  })[0];
}

function textFromHtml(html) {
  return clean(String(html || "")
    .replace(/<(?:script|style|header|footer|nav|aside)\b[\s\S]*?<\/(?:script|style|header|footer|nav|aside)>/gi, " ")
    .replace(/<[^>]+>/g, " "), BODY_LIMIT);
}

function syntheticEntry(root, route) {
  const file = path.join(root, route.file);
  const html = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  const description = clean(html.match(/<meta\b[^>]*\bname=["']description["'][^>]*\bcontent=["']([^"']*)["'][^>]*>/i)?.[1], DESCRIPTION_LIMIT);
  return {
    id: `public-route-${hash(route.url)}`,
    title: clean(route.title || labelFromSlug(route.url.split("/").filter(Boolean).at(-1) || "Wirkungsökonomie"), 180),
    description,
    url: route.url,
    tags: [],
    aliases: [],
    impactSpaces: [],
    standards: [],
    instruments: [],
    semanticTerms: [],
    body: textFromHtml(html),
    priority: 20,
  };
}

function compactGroup(root, route, entries) {
  const primary = entries.length ? selectPrimaryEntry(entries) : syntheticEntry(root, route);
  const sections = entries.filter((entry) => entry !== primary);
  const sectionTitles = sections.map((entry) => entry.title);
  const body = clean(
    [primary.body, ...sectionTitles, ...sections.map((entry) => entry.description)].filter(Boolean).join(" "),
    BODY_LIMIT,
  );
  const routeTaxonomy = taxonomy(route, primary);
  const tags = unique(entries.flatMap((entry) => entry.tags || primary.tags || []));

  return {
    id: primary.id || `public-route-${hash(route.url)}`,
    title: clean(primary.title || route.title, 180),
    description: clean(primary.description || body, DESCRIPTION_LIMIT),
    url: route.url,
    ...routeTaxonomy,
    impactSpaces: unique(entries.flatMap((entry) => entry.impactSpaces || []), 8),
    standards: unique(entries.flatMap((entry) => entry.standards || []), 8),
    instruments: unique(entries.flatMap((entry) => entry.instruments || [])),
    tags,
    thema: tags,
    aliases: unique([
      ...(primary.aliases || []),
      ...sectionTitles,
      ...sections.flatMap((entry) => entry.aliases || []),
    ]),
    body,
    semanticTerms: unique(entries.flatMap((entry) => entry.semanticTerms || []), 12),
  };
}

export function compactSearchEntries(entries, routes = [], root = process.cwd()) {
  if (!Array.isArray(entries)) throw new TypeError("Search index must be an array.");
  const routeRecords = routes.length
    ? routes
    : [...new Set(entries.map((entry) => canonicalRoute(entry?.url)).filter(Boolean))].map((url) => ({
      url,
      file: url === "/" ? "index.html" : `${url.replace(/^\//, "")}index.html`,
      area: url === "/" ? "start" : url.split("/").filter(Boolean)[0],
      title: "",
    }));
  const allowed = new Set(routeRecords.map((route) => route.url));
  const groups = new Map(routeRecords.map((route) => [route.url, []]));
  for (const entry of entries) {
    const route = canonicalRoute(entry?.url);
    if (allowed.has(route)) groups.get(route).push(entry);
  }
  return routeRecords
    .map((route) => compactGroup(root, route, groups.get(route.url) || []))
    .sort((left, right) => Number(right.priority || 0) - Number(left.priority || 0)
      || String(left.title || "").localeCompare(String(right.title || ""), "de")
      || left.url.localeCompare(right.url, "de"));
}

function writeDataFile(directory, prefix, entries) {
  const json = Buffer.from(JSON.stringify(entries));
  const gzip = gzipSync(json, { level: 9, mtime: 0 });
  const version = hash(json);
  const stem = `${prefix}-${version}`;
  fs.writeFileSync(path.join(directory, `${stem}.json`), json);
  fs.writeFileSync(path.join(directory, `${stem}.json.gz`), gzip);
  return { id: prefix, entries: entries.length, version, json: `${stem}.json`, gzip: `${stem}.json.gz`, bytes: json.length, gzipBytes: gzip.length };
}

function buildSuggestions(entries) {
  const candidates = entries
    .filter((entry) => !["Meldung", "Quelle"].includes(entry.typ) && !/:\s*Seite\s+\d+/i.test(entry.title))
    .sort((left, right) => Number(right.priority || 0) - Number(left.priority || 0) || left.title.localeCompare(right.title, "de"));
  const suggestions = [];
  for (const entry of candidates) {
    const suggestion = {
      title: entry.title,
      url: entry.url,
      type: entry.typ,
      raum: entry.raum,
      snippet: entry.description.slice(0, 160),
      aliases: entry.aliases.slice(0, 4),
    };
    const next = [...suggestions, suggestion];
    if (Buffer.byteLength(JSON.stringify(next)) > SUGGESTION_LIMIT_BYTES) break;
    suggestions.push(suggestion);
  }
  return suggestions;
}

function curatedRoutes(root) {
  const routes = new Set();
  const entrypointsPath = path.join(root, "assets/search/search-curated-entrypoints.json");
  if (fs.existsSync(entrypointsPath)) {
    for (const entry of JSON.parse(fs.readFileSync(entrypointsPath, "utf8"))) routes.add(canonicalRoute(entry.url));
  }
  const searchRuntimePath = path.join(root, "assets/js/search.js");
  if (fs.existsSync(searchRuntimePath)) {
    const runtime = fs.readFileSync(searchRuntimePath, "utf8");
    const start = runtime.indexOf("const CURATED_QUERY_ROUTES");
    const end = runtime.indexOf("const RECOMMENDED_QUERY_ENTRYPOINTS", start);
    const block = start >= 0 && end > start ? runtime.slice(start, end) : "";
    for (const match of block.matchAll(/"(\/[^"#?]*(?:#[^"]*)?)"/g)) routes.add(canonicalRoute(match[1]));
  }
  return [...routes].filter(Boolean).sort();
}

function assertCuratedCoverage(root, entries) {
  const indexed = new Set(entries.map((entry) => entry.url));
  const missing = curatedRoutes(root).filter((route) => !indexed.has(route));
  if (missing.length) throw new Error(`Curated search routes are missing from the public index: ${missing.join(", ")}`);
}

function cleanOldSearchFiles(directory, keep) {
  for (const name of fs.readdirSync(directory)) {
    if (!/^(?:browser-index|search-core|search-archive-[a-z0-9-]+|search-suggestions)-[a-f0-9]{16}\.json(?:\.gz)?$/.test(name)) continue;
    if (!keep.has(name)) fs.unlinkSync(path.join(directory, name));
  }
}

export function readBuiltSearchEntries(root) {
  const directory = path.join(root, "assets/search");
  const manifestPath = path.join(directory, "browser-index-manifest.json");
  if (!fs.existsSync(manifestPath)) return [];
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const files = [manifest.core, ...(manifest.archives || [])].map((part) => part?.json).filter(Boolean);
  return files.flatMap((file) => JSON.parse(fs.readFileSync(path.join(directory, file), "utf8")));
}

export function buildBrowserSearchIndex(root, { pruneFullIndex = false } = {}) {
  const directory = path.join(root, "assets/search");
  const fullPath = path.join(directory, "search-index.json");
  const routeManifestPath = path.join(root, DEFAULT_MANIFEST);
  if (!fs.existsSync(fullPath)) throw new Error(`Full source search index is missing: ${fullPath}`);
  const full = fs.readFileSync(fullPath);
  const sourceEntries = JSON.parse(full);
  if (pruneFullIndex && !fs.existsSync(routeManifestPath)) {
    throw new Error(`Public route manifest is missing: ${routeManifestPath}`);
  }
  const routeManifest = fs.existsSync(routeManifestPath)
    ? JSON.parse(fs.readFileSync(routeManifestPath, "utf8"))
    : { routes: [], counts: { routes: new Set(sourceEntries.map((entry) => canonicalRoute(entry?.url)).filter(Boolean)).size } };
  const entries = compactSearchEntries(sourceEntries, routeManifest.routes || [], root);
  if (entries.length !== routeManifest.counts.routes) {
    throw new Error(`Search coverage is incomplete: ${entries.length}/${routeManifest.counts.routes}`);
  }
  if (new Set(entries.map((entry) => entry.url)).size !== entries.length) throw new Error("Public search contains duplicate routes.");
  assertCuratedCoverage(root, entries);

  const archives = new Map([
    ["bibliothek", []],
    ["quellenarchiv", []],
  ]);
  const coreEntries = [];
  for (const entry of entries) {
    const match = entry.url.match(/^\/(bibliothek|quellenarchiv)\/.+/);
    if (match) archives.get(match[1]).push(entry);
    else coreEntries.push(entry);
  }

  const core = writeDataFile(directory, "search-core", coreEntries);
  const archiveFiles = [...archives]
    .filter(([, records]) => records.length)
    .map(([area, records]) => ({ ...writeDataFile(directory, `search-archive-${area}`, records), area }));
  const suggestions = writeDataFile(directory, "search-suggestions", buildSuggestions(coreEntries));
  const version = hash(JSON.stringify([core.version, ...archiveFiles.map((item) => item.version), suggestions.version]));
  const manifest = {
    schemaVersion: 2,
    version,
    entries: entries.length,
    routeManifest: `/${DEFAULT_MANIFEST}`,
    coverage: { routes: routeManifest.counts.routes, searchable: entries.length, ratio: 1 },
    core,
    archives: archiveFiles,
    suggestions,
    taxonomy: { fields: ["raum", "typ", "thema", "rolle"], source: "public route URL" },
  };
  fs.writeFileSync(path.join(directory, "browser-index-manifest.json"), `${JSON.stringify(manifest)}\n`);
  const keep = new Set([core.json, core.gzip, suggestions.json, suggestions.gzip]);
  for (const item of archiveFiles) {
    keep.add(item.json);
    keep.add(item.gzip);
  }
  cleanOldSearchFiles(directory, keep);
  if (pruneFullIndex) fs.unlinkSync(fullPath);

  const transferred = core.gzipBytes + archiveFiles.reduce((sum, item) => sum + item.gzipBytes, 0);
  console.log(
    `Browser search: ${entries.length}/${routeManifest.counts.routes} routes in ${1 + archiveFiles.length} lazy index files; `
    + `${(transferred / 1e6).toFixed(2)} MB transferred, ${(suggestions.bytes / 1e3).toFixed(1)} KB suggestions.`,
  );
  return manifest;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const artifact = process.argv.includes("--artifact");
  buildBrowserSearchIndex(path.resolve(artifact ? "_site" : "."), { pruneFullIndex: artifact });
}
