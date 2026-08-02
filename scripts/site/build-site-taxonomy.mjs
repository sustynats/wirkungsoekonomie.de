import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outFile = path.join(root, "content", "taxonomy", "site-map.json");
const ignoredDirs = new Set([".git", "_site", "node_modules", "templates", "woek-institut-app"]);
const ignoredRoutePatterns = [
  /^\/(?:_debug|admin)\//,
  /^\/404\.html$/,
];
const htmlFiles = [];

function walk(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(item.name)) continue;
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      walk(full);
    } else if (item.isFile() && item.name.endsWith(".html")) {
      htmlFiles.push(full);
    }
  }
}

function decode(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function meta(html, name) {
  const pattern = new RegExp(`<meta\\s+[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["'][^>]*>`, "i");
  return decode(html.match(pattern)?.[1] || "");
}

function isIndexablePublicPage(html) {
  const noindex = /<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*\bcontent=["'][^"']*\bnoindex\b[^"']*["'])[^>]*>/iu;
  const redirect = /<meta\b(?=[^>]*\bhttp-equiv=["']refresh["'])[^>]*>/iu;
  return !noindex.test(html) && !redirect.test(html);
}

function titleOf(html) {
  return meta(html, "search_title") || decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").replace(/\s*\|\s*Wirkungsökonomie\s*$/i, "").trim();
}

function routeFor(file) {
  const rel = path.relative(root, file).split(path.sep).join("/");
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"index.html".length)}`;
  return `/${rel}`;
}

function classifyType(route, searchType) {
  const value = String(searchType || "").toLowerCase();
  if (/tool|werkzeug|app|ki|check|rechner/.test(value) || /^\/(app|woek-ki|werkzeuge|tools)\//.test(route)) return "tool";
  if (/artikel|journal|blog|podcast/.test(value) || /^\/(blog|journal|podcast)\//.test(route)) return "artikel";
  if (/dokument|publikation|working paper|bibliothek|referenz|dossier/.test(value) || /^\/(bibliothek|dokumente|referenz|wissen\/working-papers)\//.test(route)) return "dokument";
  if (/portal|rubrik|hub/.test(value) || route.split("/").filter(Boolean).length <= 1) return route === "/" ? "hub" : "portal";
  return "dokument";
}

function rubrikFor(route, section) {
  const s = String(section || "");
  if (route === "/") return "Start";
  if (/^\/verstehen|Wirkungswissenschaften/i.test(`${route} ${s}`)) return "Verstehen";
  if (/^\/fuer\//.test(route)) return "Für wen?";
  if (/^\/wirkungsfelder|Wirkungsfelder/i.test(`${route} ${s}`)) return "Wirkungsfelder";
  if (/^\/(wirkungssteuerung|werkzeuge|tools|praxis-tools|praxis-und-tools|app|woek-ki)\//.test(route)) return "Wirkung steuern";
  if (/^\/(oeffentlicher-wirkungsraum|wirkungsradar)\//.test(route)) return "Debatte & Radar";
  if (/^\/(lernen|akademie)\//.test(route) || route === "/akademie.html") return "Lernen";
  if (/^\/(bibliothek|dokumente|referenz|blog|journal|podcast|quellenarchiv|begriffe)\//.test(route)) return "Bibliothek";
  if (/^\/(mitmachen|mein-wirkungsraum|institut)\//.test(route)) return "Mitmachen";
  return s || "Sonstiges";
}

function sammlungFor(route, section) {
  const parts = route.split("/").filter(Boolean);
  if (parts.length >= 2) return parts[0];
  return section || parts[0] || "Start";
}

walk(root);

const entries = htmlFiles
  .map((file) => {
    const html = fs.readFileSync(file, "utf8");
    const route = routeFor(file);
    const title = titleOf(html);
    const searchSection = meta(html, "search_section");
    const searchType = meta(html, "search_type");
    return {
      url: route,
      title: title || route,
      rubrik: rubrikFor(route, searchSection),
      sammlung: sammlungFor(route, searchSection),
      typ: classifyType(route, searchType),
      indexable: isIndexablePublicPage(html),
    };
  })
  .filter((entry) => !ignoredRoutePatterns.some((pattern) => pattern.test(entry.url)))
  .filter((entry) => !entry.url.includes(" 2."))
  .filter((entry) => entry.indexable)
  .map(({ indexable, ...entry }) => entry)
  .sort((a, b) => a.url.localeCompare(b.url, "de"));

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, `${JSON.stringify({ schemaVersion: 1, entries }, null, 2)}\n`);
console.log(`built site taxonomy: ${entries.length} entries`);
