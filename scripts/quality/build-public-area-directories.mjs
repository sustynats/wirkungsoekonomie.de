import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_MANIFEST, SITE_ORIGIN } from "../lib/public-routes.mjs";
import { pageBase, renderFooterNewsletter, renderSiteFooter, renderSiteHeader } from "../lib/site-shell.mjs";

const ROUTES_PER_PAGE = 50;
const CARDS_PER_PAGE = 20;
const MAX_HUB_BYTES = 300_000;
const DIRECTORY_MANIFEST = "assets/data/public-area-directories.json";
const GENERATED_MARKER = "data-public-area-directory";
const GENERATED_PAGE_MARKER = "data-generated-public-directory-page";

const HEAVY_CARD_CLASSES = new Map([
  ["begriffe", "glossary-result-card"],
  ["bibliothek", "knowledge-library-card"],
  ["blog", "blog-card"],
  ["quellenarchiv", "quellenarchiv-card"],
]);

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function chunks(values, size) {
  const result = [];
  for (let index = 0; index < values.length; index += size) result.push(values.slice(index, index + size));
  return result;
}

function routeToFile(root, route) {
  if (route === "/") return path.join(root, "index.html");
  if (route.endsWith("/")) return path.join(root, decodeURIComponent(route.slice(1)), "index.html");
  return path.join(root, decodeURIComponent(route.slice(1)));
}

function routeDepth(route) {
  return route.split("/").filter(Boolean).length;
}

function generatedPageRoute(hubRoute, page) {
  if (hubRoute === "/suche.html") return `/seiten/${page}/`;
  const area = hubRoute.match(/^\/([^/.]+)(?:\/|\.html$)/)?.[1];
  if (!area) throw new Error(`Cannot derive area directory route from hub: ${hubRoute}`);
  return `/${area}/seite/${page}/`;
}

function removeGeneratedPages(root) {
  const removed = new Set();
  const cardsByArea = new Map();
  const visit = (directory) => {
    if (!fs.existsSync(directory)) return;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(file);
      else if (entry.isFile() && entry.name === "index.html") {
        const html = fs.readFileSync(file, "utf8");
        if (!html.includes(`${GENERATED_PAGE_MARKER}="true"`)) continue;
        const canonical = html.match(/<link\b[^>]*\brel=["']canonical["'][^>]*\bhref=["']([^"']+)["'][^>]*>/i)?.[1];
        if (canonical) {
          const route = new URL(canonical, SITE_ORIGIN).pathname;
          removed.add(route);
          const match = route.match(/^\/([^/]+)\/seite\/(\d+)\/$/);
          if (match && HEAVY_CARD_CLASSES.has(match[1])) {
            const extracted = extractHeavyCards(html, match[1], "/");
            const pages = cardsByArea.get(match[1]) || [];
            pages.push({ page: Number(match[2]), cards: extracted.cards });
            cardsByArea.set(match[1], pages);
          }
        }
        fs.unlinkSync(file);
      }
    }
  };
  visit(root);
  const removeEmpty = (directory) => {
    if (!fs.existsSync(directory)) return;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory()) removeEmpty(path.join(directory, entry.name));
    }
    if (directory !== root && fs.readdirSync(directory).length === 0) fs.rmdirSync(directory);
  };
  removeEmpty(root);
  return {
    removed,
    cardsByArea: new Map([...cardsByArea].map(([area, pages]) => [
      area,
      pages.sort((left, right) => left.page - right.page).flatMap((item) => item.cards),
    ])),
  };
}

function cardPattern(className) {
  const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`<article\\b(?=[^>]*\\bclass=["'][^"']*\\b${escaped}\\b[^"']*["'])[^>]*>[\\s\\S]*?<\\/article>`, "gi");
}

function absolutizeFragment(fragment, baseRoute) {
  return fragment.replace(/\b(href|src)=("([^"]*)"|'([^']*)')/gi, (match, attribute, quoted, doubleValue, singleValue) => {
    const value = doubleValue ?? singleValue ?? "";
    if (!value || value.startsWith("#") || /^(?:[a-z]+:|\/\/)/i.test(value)) return match;
    const absolute = new URL(value, `${SITE_ORIGIN}${baseRoute}`);
    const target = absolute.origin === SITE_ORIGIN ? `${absolute.pathname}${absolute.search}${absolute.hash}` : absolute.href;
    return `${attribute}="${esc(target)}"`;
  });
}

function extractHeavyCards(html, area, baseRoute) {
  const className = HEAVY_CARD_CLASSES.get(area);
  if (!className) return { html, cards: [] };
  const pattern = cardPattern(className);
  const cards = [...html.matchAll(pattern)].map((match) => absolutizeFragment(match[0], baseRoute));
  return { html: html.replace(pattern, ""), cards };
}

function removeExistingDirectory(html) {
  return html.replace(
    /<section\b(?=[^>]*\bdata-public-area-directory=["']true["'])[^>]*>[\s\S]*?<\/section>/gi,
    "",
  );
}

function removeLargeRegisterRuntime(html) {
  let result = html.replace(/<script\b(?=[^>]*\bid=["']woekRegisterData["'])[^>]*>[\s\S]*?<\/script>/gi, "");
  result = result.replace(/<script\b[^>]*>[\s\S]*?getElementById\(["']woekRegisterData["']\)[\s\S]*?<\/script>/gi, "");
  return result;
}

function routeList(items) {
  if (!items.length) return "";
  return `<ol class="public-directory-list">${items.map((item) => (
    `<li><a href="${esc(item.url)}">${esc(item.title || item.url)}</a></li>`
  )).join("")}</ol>`;
}

function pager(hubRoute, page, pages) {
  if (pages <= 1) return "";
  const links = [];
  for (let number = 1; number <= pages; number += 1) {
    const href = number === 1 ? hubRoute : generatedPageRoute(hubRoute, number);
    links.push(number === page
      ? `<span aria-current="page">${number}</span>`
      : `<a href="${esc(href)}">${number}</a>`);
  }
  return `<nav class="public-directory-pagination" aria-label="Verzeichnisseiten">${links.join(" ")}</nav>`;
}

function directorySection({ areaLabel, hubRoute, page, pages, routes, cards }) {
  const cardsHtml = cards.length
    ? `<div class="card-grid public-directory-cards">${cards.join("\n")}</div>`
    : "";
  return `<section class="section public-area-directory" ${GENERATED_MARKER}="true" aria-labelledby="public-directory-title">
  <div class="section-header">
    <p class="hero-kicker">Alle Inhalte</p>
    <h2 id="public-directory-title">${esc(areaLabel)}</h2>
    <p>Seite ${page} von ${pages}. Alle Einträge sind direkt über diese Seiten erreichbar.</p>
  </div>
  ${routeList(routes)}
  ${cardsHtml}
  ${pager(hubRoute, page, pages)}
</section>`;
}

function replaceOrAppendMain(html, section, { replaceWithHero = false, route = "" } = {}) {
  const match = html.match(/(<main\b[^>]*>)([\s\S]*?)(<\/main>)/i);
  if (!match) {
    if (/<\/body>/i.test(html)) return html.replace(/<\/body>/i, `<main id="main-content">${section}</main>\n</body>`);
    throw new Error(`Public hub has no main element: ${route || "unknown route"}`);
  }
  let body = match[2];
  if (replaceWithHero) {
    const hero = body.match(/<section\b[^>]*\bclass=["'][^"']*\bhero\b[^"']*["'][^>]*>[\s\S]*?<\/section>/i)?.[0] || "";
    body = hero;
  }
  body = body.replace(/\s+$/, "");
  return html.replace(match[0], `${match[1]}${body}\n${section}\n${match[3]}`);
}

function cssVersion(root) {
  const css = path.join(root, "assets/css/style.css");
  if (!fs.existsSync(css)) return "";
  return `?v=${crypto.createHash("sha256").update(fs.readFileSync(css)).digest("hex").slice(0, 12)}`;
}

function renderDirectoryPage(root, { areaLabel, hubRoute, page, pages, routes, cards }) {
  const route = generatedPageRoute(hubRoute, page);
  const relative = route.slice(1) + "index.html";
  const base = pageBase(relative);
  const title = `${areaLabel}: Seite ${page}`;
  const section = directorySection({ areaLabel, hubRoute, page, pages, routes, cards });
  // The English edition stays offline. These pages are generated after the
  // general artifact cleanup, so remove only the generated legal link here.
  const footer = renderSiteFooter(base).replace(
    `<a href="${base}en/" data-nav-match="en/">English</a>\n`,
    "",
  );
  return `<!doctype html>
<html lang="de" ${GENERATED_PAGE_MARKER}="true">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} | Wirkungsökonomie</title>
  <meta name="description" content="Verzeichnis aller öffentlichen Inhalte im Bereich ${esc(areaLabel)}.">
  <link rel="canonical" href="${SITE_ORIGIN}${route}">
  <link rel="stylesheet" href="/assets/css/style.css${cssVersion(root)}">
</head>
<body>
  <a class="skip-link" href="#main-content">Zum Inhalt springen</a>
  ${renderSiteHeader(base)}
  <main id="main-content">
    <section class="hero compact-hero">
      <nav class="breadcrumb" aria-label="Brotkrumen"><a href="${esc(hubRoute)}">${esc(areaLabel)}</a> / Seite ${page}</nav>
      <p class="hero-kicker">Verzeichnis</p>
      <h1>${esc(title)}</h1>
    </section>
    ${section}
  </main>
  ${footer}
  ${renderFooterNewsletter(base)}
  <script src="/assets/js/newsletter.js?v=20260815-landing" defer></script>
  <script src="/assets/js/main.js" defer></script>
</body>
</html>
`;
}

function writeDirectoryPage(root, definition) {
  const route = generatedPageRoute(definition.hubRoute, definition.page);
  const file = routeToFile(root, route);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, renderDirectoryPage(root, definition));
  return { url: route, file: path.relative(root, file).split(path.sep).join("/"), bytes: fs.statSync(file).size };
}

function areaGroups(routes) {
  const byHub = new Map();
  const urls = new Set(routes.map((route) => route.url));
  const areas = new Set(routes.map((route) => route.area).filter((area) => area && area !== "start"));
  const hubs = new Map();
  for (const area of areas) {
    const hubRoute = [`/${area}/`, `/${area}.html`].find((candidate) => urls.has(candidate));
    if (hubRoute) hubs.set(area, hubRoute);
  }
  const rootRoutes = routes.filter((route) => (
    (routeDepth(route.url) === 1 || (route.area !== "start" && !hubs.has(route.area)))
    && route.url !== "/suche.html"
  ));
  if (rootRoutes.length) byHub.set("/suche.html", { area: "start", hubRoute: "/suche.html", routes: rootRoutes });
  for (const area of [...areas].sort((left, right) => left.localeCompare(right, "de"))) {
    const directoryPrefix = `/${area}/`;
    const hubRoute = hubs.get(area);
    if (!hubRoute) continue;
    const children = routes.filter((route) => route.url.startsWith(directoryPrefix) && route.url !== hubRoute);
    if (children.length) byHub.set(hubRoute, { area, hubRoute, routes: children });
  }
  return byHub;
}

export function buildPublicAreaDirectories(root) {
  const absoluteRoot = path.resolve(root);
  const previous = removeGeneratedPages(absoluteRoot);
  const routeManifestPath = path.join(absoluteRoot, DEFAULT_MANIFEST);
  if (!fs.existsSync(routeManifestPath)) throw new Error(`Public route manifest is missing: ${routeManifestPath}`);
  const routeManifest = JSON.parse(fs.readFileSync(routeManifestPath, "utf8"));
  const routes = (routeManifest.routes || []).filter((route) => !previous.removed.has(route.url));
  const groups = areaGroups(routes);
  const output = [];
  const covered = new Set();

  for (const group of groups.values()) {
    const hubFile = routeToFile(absoluteRoot, group.hubRoute);
    if (!fs.existsSync(hubFile)) throw new Error(`Public area hub is missing: ${group.hubRoute}`);
    const original = fs.readFileSync(hubFile, "utf8");
    const hubTitle = original.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
      || group.area;
    const extracted = extractHeavyCards(original, group.area, group.hubRoute);
    extracted.cards.push(...(previous.cardsByArea.get(group.area) || []));
    extracted.html = removeExistingDirectory(extracted.html);
    const routePages = chunks(group.routes, ROUTES_PER_PAGE);
    const cardPages = chunks(extracted.cards, CARDS_PER_PAGE);
    const pages = Math.max(routePages.length, cardPages.length, 1);
    let hubHtml = group.area === "woek-id-register" ? removeLargeRegisterRuntime(extracted.html) : extracted.html;
    const firstSection = directorySection({
      areaLabel: hubTitle,
      hubRoute: group.hubRoute,
      page: 1,
      pages,
      routes: routePages[0] || [],
      cards: cardPages[0] || [],
    });
    hubHtml = replaceOrAppendMain(hubHtml, firstSection, {
      replaceWithHero: group.area === "woek-id-register",
      route: group.hubRoute,
    });
    fs.writeFileSync(hubFile, hubHtml);
    if (fs.statSync(hubFile).size > MAX_HUB_BYTES) {
      throw new Error(`Public area hub exceeds ${MAX_HUB_BYTES} bytes after pagination: ${group.hubRoute}`);
    }
    for (const route of group.routes) covered.add(route.url);
    const generatedPages = [];
    for (let page = 2; page <= pages; page += 1) {
      generatedPages.push(writeDirectoryPage(absoluteRoot, {
        areaLabel: hubTitle,
        hubRoute: group.hubRoute,
        page,
        pages,
        routes: routePages[page - 1] || [],
        cards: cardPages[page - 1] || [],
      }));
    }
    output.push({
      area: group.area,
      hub: group.hubRoute,
      routes: group.routes.length,
      cards: extracted.cards.length,
      pages,
      hubBytes: fs.statSync(hubFile).size,
      generatedPages,
    });
  }

  const expected = routes.filter((route) => route.url !== "/" && route.url !== "/suche.html");
  const uncovered = expected.filter((route) => !covered.has(route.url));
  if (uncovered.length) throw new Error(`Public routes are missing from area directories: ${uncovered.slice(0, 20).map((route) => route.url).join(", ")}`);
  const manifest = {
    schemaVersion: 1,
    pageSize: ROUTES_PER_PAGE,
    cardPageSize: CARDS_PER_PAGE,
    maxHubBytes: MAX_HUB_BYTES,
    sourceRoutes: routes.length,
    coveredRoutes: covered.size,
    excluded: ["/", "/suche.html"],
    areas: output,
  };
  const manifestFile = path.join(absoluteRoot, DIRECTORY_MANIFEST);
  fs.mkdirSync(path.dirname(manifestFile), { recursive: true });
  fs.writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Built ${output.length} public area directories: ${covered.size} routes across ${output.reduce((sum, area) => sum + area.pages, 0)} pages.`);
  return manifest;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildPublicAreaDirectories(path.resolve(process.argv.includes("--artifact") ? "_site" : "."));
}
