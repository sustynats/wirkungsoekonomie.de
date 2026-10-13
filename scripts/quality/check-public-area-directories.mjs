import fs from "node:fs";
import path from "node:path";
import { DEFAULT_MANIFEST, SITE_ORIGIN } from "../lib/public-routes.mjs";

const root = path.resolve(process.argv.includes("--artifact") ? "_site" : ".");
const directoryManifestPath = path.join(root, "assets/data/public-area-directories.json");
const routeManifestPath = path.join(root, DEFAULT_MANIFEST);
const failures = [];

if (!fs.existsSync(directoryManifestPath)) failures.push("Public area directory manifest is missing.");
if (!fs.existsSync(routeManifestPath)) failures.push("Public route manifest is missing.");

const directoryManifest = fs.existsSync(directoryManifestPath)
  ? JSON.parse(fs.readFileSync(directoryManifestPath, "utf8"))
  : { areas: [], maxHubBytes: 0 };
const routeManifest = fs.existsSync(routeManifestPath)
  ? JSON.parse(fs.readFileSync(routeManifestPath, "utf8"))
  : { routes: [] };
const publicRoutes = new Set((routeManifest.routes || []).map((route) => route.url));
const listedRoutes = new Set();
const generatedRoutes = new Set();

function routeToFile(route) {
  if (route === "/") return path.join(root, "index.html");
  if (route.endsWith("/")) return path.join(root, decodeURIComponent(route.slice(1)), "index.html");
  return path.join(root, decodeURIComponent(route.slice(1)));
}

function linksFromDirectory(html, baseRoute) {
  const sections = [...html.matchAll(/<section\b(?=[^>]*\bdata-public-area-directory=["']true["'])[^>]*>[\s\S]*?<\/section>/gi)];
  if (sections.length !== 1) failures.push(`${baseRoute}: expected one public area directory, found ${sections.length}.`);
  for (const section of sections) {
    for (const match of section[0].matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)) {
      try {
        const url = new URL(match[1], `${SITE_ORIGIN}${baseRoute}`);
        if (url.origin === SITE_ORIGIN) listedRoutes.add(url.pathname);
      } catch {
        failures.push(`${baseRoute}: invalid directory link ${match[1]}`);
      }
    }
  }
}

if (directoryManifest.schemaVersion !== 1) failures.push("Unsupported public area directory schema.");
if (directoryManifest.pageSize !== 50) failures.push("Public area directories must use 50 routes per page.");

for (const area of directoryManifest.areas || []) {
  const hubFile = routeToFile(area.hub);
  if (!fs.existsSync(hubFile)) {
    failures.push(`Area hub is missing: ${area.hub}`);
    continue;
  }
  const hubBytes = fs.statSync(hubFile).size;
  if (hubBytes > directoryManifest.maxHubBytes) failures.push(`${area.hub}: ${hubBytes} bytes exceed the hub limit.`);
  linksFromDirectory(fs.readFileSync(hubFile, "utf8"), area.hub);
  if ((area.generatedPages || []).length !== Math.max(0, area.pages - 1)) {
    failures.push(`${area.hub}: incomplete generated page list.`);
  }
  for (const page of area.generatedPages || []) {
    generatedRoutes.add(page.url);
    const file = routeToFile(page.url);
    if (!fs.existsSync(file)) {
      failures.push(`Generated directory page is missing: ${page.url}`);
      continue;
    }
    const bytes = fs.statSync(file).size;
    if (bytes > directoryManifest.maxHubBytes) failures.push(`${page.url}: ${bytes} bytes exceed the page limit.`);
    const html = fs.readFileSync(file, "utf8");
    if (!html.includes('data-generated-public-directory-page="true"')) failures.push(`${page.url}: generated page marker is missing.`);
    linksFromDirectory(html, page.url);
  }
}

for (const route of generatedRoutes) {
  if (!publicRoutes.has(route)) failures.push(`Generated directory route is missing from the final route manifest: ${route}`);
}
const expected = (routeManifest.routes || [])
  .map((route) => route.url)
  .filter((route) => route !== "/" && route !== "/suche.html" && !generatedRoutes.has(route));
const missing = expected.filter((route) => !listedRoutes.has(route));
if (missing.length) failures.push(`Public routes missing from static area directories: ${missing.slice(0, 20).join(", ")}`);

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Public area directories passed: ${expected.length} routes, ${generatedRoutes.size} pagination pages, every page below ${directoryManifest.maxHubBytes} bytes.`);
