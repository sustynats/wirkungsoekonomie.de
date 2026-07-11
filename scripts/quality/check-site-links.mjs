import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const reportFile = path.join(root, "reports", "site-link-integrity.md");
const ignoredDirs = new Set([".git", "_site", "node_modules", "templates", "woek-institut-app"]);
const ignoredRoutePatterns = [
  /^\/(?:_debug|admin)\//,
  /^\/404\.html$/,
];
const files = [];

function walk(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(item.name)) continue;
    const full = path.join(dir, item.name);
    if (item.isDirectory()) walk(full);
    if (item.isFile() && item.name.endsWith(".html")) files.push(full);
  }
}

function routeFor(file) {
  const rel = path.relative(root, file).split(path.sep).join("/");
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"index.html".length)}`;
  return `/${rel}`;
}

function routeToFile(route) {
  const clean = route.split(/[?#]/)[0].replace(/^\/+/, "");
  if (!clean || clean.endsWith("/")) return path.join(root, clean, "index.html");
  if (clean.endsWith(".html")) return path.join(root, clean);
  return path.join(root, clean, "index.html");
}

function normalizeHref(href, sourceFile) {
  if (!href || href.startsWith("#")) return "";
  if (href.includes("${") || href.includes("{{")) return "";
  if (/^(mailto:|tel:|javascript:|data:|https?:\/\/|\/\/)/i.test(href)) return "";
  const clean = href.split("#")[0].split("?")[0];
  if (!clean) return "";
  const basename = clean.split("/").pop() || "";
  if (/\.[a-z0-9]+$/i.test(basename) && !basename.endsWith(".html")) return "";
  if (clean.startsWith("/")) return clean.endsWith("/") || clean.endsWith(".html") ? clean : `${clean}/`;
  const abs = path.resolve(path.dirname(sourceFile), clean);
  const rel = path.relative(root, abs).split(path.sep).join("/");
  return rel.endsWith("/") || rel.endsWith(".html") ? `/${rel}` : `/${rel}/`;
}

function titleOf(html) {
  return (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").replace(/\s+/g, " ").trim();
}

walk(root);

const publicFiles = files.filter((file) => !ignoredRoutePatterns.some((pattern) => pattern.test(routeFor(file))));
const existingRoutes = new Set(publicFiles.map(routeFor));
const incoming = new Map();
const broken = [];
const titleRoutes = new Map();

for (const file of publicFiles) {
  const html = fs.readFileSync(file, "utf8");
  const route = routeFor(file);
  const title = titleOf(html);
  if (title) {
    const bucket = titleRoutes.get(title) || [];
    bucket.push(route);
    titleRoutes.set(title, bucket);
  }
  for (const match of html.matchAll(/\shref=["']([^"']+)["']/gi)) {
    const normalized = normalizeHref(match[1], file);
    if (!normalized) continue;
    const target = routeFor(routeToFile(normalized));
    incoming.set(target, (incoming.get(target) || 0) + 1);
    if (!fs.existsSync(routeToFile(normalized))) {
      broken.push({ from: route, to: normalized });
    }
  }
}

const orphans = [...existingRoutes]
  .filter((route) => route !== "/" && !incoming.has(route))
  .filter((route) => !/^\/(assets|api)\//.test(route))
  .sort();

const duplicates = [...titleRoutes.entries()]
  .filter(([, routes]) => routes.length > 1)
  .map(([title, routes]) => ({ title, routes: routes.sort() }));

const lines = [
  "# Site Link Integrity",
  "",
  "Stand: generiert aus dem aktuellen Arbeitsbaum",
  "",
  `- HTML-Seiten: ${publicFiles.length}`,
  `- Interne Broken Links: ${broken.length}`,
  `- Waisenseiten ohne eingehende Links: ${orphans.length}`,
  `- Doppelte Seitentitel: ${duplicates.length}`,
  "",
  "## Broken Links",
  ...broken.slice(0, 120).map((item) => `- ${item.from} -> ${item.to}`),
  broken.length > 120 ? `- ... ${broken.length - 120} weitere` : "",
  "",
  "## Waisenseiten",
  ...orphans.slice(0, 160).map((route) => `- ${route}`),
  orphans.length > 160 ? `- ... ${orphans.length - 160} weitere` : "",
  "",
  "## Doppelte Seitentitel",
  ...duplicates.slice(0, 80).map((item) => `- ${item.title}: ${item.routes.join(", ")}`),
  duplicates.length > 80 ? `- ... ${duplicates.length - 80} weitere` : "",
  "",
].filter(Boolean);

fs.mkdirSync(path.dirname(reportFile), { recursive: true });
fs.writeFileSync(reportFile, `${lines.join("\n")}\n`);
console.log(`site link integrity: ${broken.length} broken, ${orphans.length} orphans, ${duplicates.length} duplicate titles`);
