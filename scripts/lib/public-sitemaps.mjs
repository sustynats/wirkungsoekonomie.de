import fs from "node:fs";
import path from "node:path";
import { DEFAULT_MANIFEST, SITE_ORIGIN } from "./public-routes.mjs";

export const SITEMAP_DIRECTORY = "sitemaps";

function xmlEscape(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  })[character]);
}

function sitemapName(area) {
  const name = String(area || "start").toLowerCase();
  if (!/^[a-z0-9-]+$/.test(name)) {
    throw new Error(`Public route area cannot be used as a sitemap filename: ${area}`);
  }
  return `${name}.xml`;
}

function urlset(routes) {
  const rows = routes.map((route) => `  <url><loc>${xmlEscape(`${SITE_ORIGIN}${route.url}`)}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>\n`;
}

function sitemapIndex(files) {
  const rows = files.map((file) => `  <sitemap><loc>${xmlEscape(`${SITE_ORIGIN}/${SITEMAP_DIRECTORY}/${file}`)}</loc></sitemap>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</sitemapindex>\n`;
}

function expectedFiles(manifest) {
  const groups = new Map();
  for (const route of manifest.routes || []) {
    if (!route.url || !route.area) throw new Error("Public route manifest contains an incomplete route entry.");
    const items = groups.get(route.area) || [];
    items.push(route);
    groups.set(route.area, items);
  }

  const names = new Set();
  const files = new Map();
  for (const [area, routes] of [...groups].sort(([left], [right]) => left.localeCompare(right, "de"))) {
    const name = sitemapName(area);
    if (names.has(name)) throw new Error(`More than one public route area maps to ${name}`);
    names.add(name);
    routes.sort((left, right) => left.url.localeCompare(right.url, "de"));
    files.set(name, urlset(routes));
  }
  return files;
}

function loadManifest(root, manifestPath) {
  const file = path.resolve(manifestPath || path.join(root, DEFAULT_MANIFEST));
  if (!fs.existsSync(file)) throw new Error(`Public route manifest is missing: ${file}`);
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function assertManifestCoverage(manifest, files) {
  const manifestUrls = (manifest.routes || []).map((route) => route.url).sort();
  const sitemapUrls = [];
  for (const xml of files.values()) {
    for (const match of xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<\/url>/g)) {
      const parsed = new URL(match[1].replaceAll("&amp;", "&"));
      sitemapUrls.push(parsed.pathname);
    }
  }
  sitemapUrls.sort();
  if (new Set(sitemapUrls).size !== sitemapUrls.length) throw new Error("Public sitemaps contain duplicate URLs.");
  if (JSON.stringify(sitemapUrls) !== JSON.stringify(manifestUrls)) {
    throw new Error(`Public sitemap coverage differs from the route manifest (${sitemapUrls.length}/${manifestUrls.length}).`);
  }
}

export function buildPublicSitemaps(root, { check = false, manifestPath } = {}) {
  const absoluteRoot = path.resolve(root);
  const manifest = loadManifest(absoluteRoot, manifestPath);
  const files = expectedFiles(manifest);
  assertManifestCoverage(manifest, files);
  const sitemapDirectory = path.join(absoluteRoot, SITEMAP_DIRECTORY);
  const rootSitemap = path.join(absoluteRoot, "sitemap.xml");
  const index = sitemapIndex([...files.keys()]);

  if (check) {
    const actualNames = fs.existsSync(sitemapDirectory)
      ? fs.readdirSync(sitemapDirectory).filter((name) => name.endsWith(".xml")).sort()
      : [];
    const expectedNames = [...files.keys()].sort();
    if (JSON.stringify(actualNames) !== JSON.stringify(expectedNames)) {
      throw new Error("Public sitemap files are missing or stale.");
    }
    if (!fs.existsSync(rootSitemap) || fs.readFileSync(rootSitemap, "utf8") !== index) {
      throw new Error(`Public sitemap index is missing or stale: ${rootSitemap}`);
    }
    for (const [name, xml] of files) {
      const file = path.join(sitemapDirectory, name);
      if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== xml) {
        throw new Error(`Public area sitemap is missing or stale: ${file}`);
      }
    }
  } else {
    fs.rmSync(sitemapDirectory, { recursive: true, force: true });
    fs.mkdirSync(sitemapDirectory, { recursive: true });
    for (const [name, xml] of files) fs.writeFileSync(path.join(sitemapDirectory, name), xml, "utf8");
    fs.writeFileSync(rootSitemap, index, "utf8");
  }

  return { routes: manifest.routes.length, areas: files.size, files: [...files.keys()] };
}

export function readPublicSitemapRoutes(root) {
  const absoluteRoot = path.resolve(root);
  const indexPath = path.join(absoluteRoot, "sitemap.xml");
  if (!fs.existsSync(indexPath)) return [];
  const index = fs.readFileSync(indexPath, "utf8");
  const routes = [];
  // Older GitHub Pages builds use a single flat urlset instead of the newer
  // sitemap index plus area files. Read that form as well so the same
  // indexability gates cover both publication layouts.
  const urlPattern = /<url>\s*<loc>([^<]+)<\/loc>(?:\s*<lastmod>[^<]*<\/lastmod>)?\s*<\/url>/g;
  if (!/<sitemap>\s*<loc>/u.test(index)) {
    for (const urlMatch of index.matchAll(urlPattern)) {
      const url = new URL(urlMatch[1].replaceAll("&amp;", "&"));
      if (url.origin === SITE_ORIGIN) routes.push(url.pathname);
    }
    return routes;
  }
  for (const match of index.matchAll(/<sitemap>\s*<loc>([^<]+)<\/loc>\s*<\/sitemap>/g)) {
    const parsed = new URL(match[1].replaceAll("&amp;", "&"));
    if (parsed.origin !== SITE_ORIGIN) continue;
    const file = path.join(absoluteRoot, decodeURIComponent(parsed.pathname).replace(/^\/+/, ""));
    if (!fs.existsSync(file)) throw new Error(`Sitemap index target is missing: ${file}`);
    const xml = fs.readFileSync(file, "utf8");
    for (const urlMatch of xml.matchAll(urlPattern)) {
      const url = new URL(urlMatch[1].replaceAll("&amp;", "&"));
      if (url.origin === SITE_ORIGIN) routes.push(url.pathname);
    }
  }
  return routes;
}
