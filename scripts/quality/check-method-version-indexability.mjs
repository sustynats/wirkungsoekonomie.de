import fs from "node:fs";
import path from "node:path";
import {
  CURRENT_METHOD_ROUTES,
  HISTORICAL_METHOD_ROUTE_PREFIXES,
  RETIRED_T_SROI_MULTIPLIER_ARCHIVES,
  SITE_ORIGIN,
  hasNoindex,
  hasNoindexFollow,
  historicalMethodFiles,
  htmlFileForRoute,
  normalizeRoute,
  routeForHtmlFile,
  sitemapRoutes,
} from "../lib/method-version-indexability.mjs";

const artifact = process.argv.includes("--artifact");
const root = artifact ? path.join(process.cwd(), "_site") : process.cwd();
const indexPath = path.join(root, "assets", "search", "search-index.json");
const sitemapPath = path.join(root, "sitemap.xml");
const releaseAssetsPath = path.join(process.cwd(), "assets", "data", "public-release-assets.json");
const failures = [];

if (!fs.existsSync(indexPath)) failures.push(`Suchindex fehlt: ${path.relative(process.cwd(), indexPath)}`);
if (!fs.existsSync(sitemapPath)) failures.push(`Sitemap fehlt: ${path.relative(process.cwd(), sitemapPath)}`);

const entries = fs.existsSync(indexPath) ? JSON.parse(fs.readFileSync(indexPath, "utf8")) : [];
const sitemap = fs.existsSync(sitemapPath) ? sitemapRoutes(fs.readFileSync(sitemapPath, "utf8")) : [];

function canonicalFor(html = "") {
  return String(html).match(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*\bhref=["']([^"']+)["'][^>]*>/iu)?.[1] || "";
}

function baseRoute(entry = {}) {
  return normalizeRoute(String(entry.url || "").replace(/[?#].*$/u, ""));
}

function isHistoricalRoute(route) {
  return HISTORICAL_METHOD_ROUTE_PREFIXES.some((prefix) => route.startsWith(prefix));
}

const currentExpectations = new Map([
  [CURRENT_METHOD_ROUTES[0], /t-sroi-rechenstandard/iu],
  [CURRENT_METHOD_ROUTES[1], /einzeldossiers gesundheit\s*(?:&amp;|&|und)\s*pflege/iu],
]);
const CURRENT_T_SROI_STANDARD = "werkzeuge/impact-controlling/methodenpapiere/t-sroi-transformationsmessung/";

for (const route of CURRENT_METHOD_ROUTES) {
  const file = htmlFileForRoute(root, route);
  if (!file || !fs.existsSync(file)) {
    failures.push(`Aktuelle Methode ist nicht öffentlich erreichbar: ${route}`);
    continue;
  }
  const html = fs.readFileSync(file, "utf8");
  if (hasNoindex(html)) failures.push(`Aktuelle Methode ist fälschlich noindex: ${route}`);
  if (canonicalFor(html) !== `${SITE_ORIGIN}${route}`) {
    failures.push(`Aktuelle Methode hat keine eindeutige Canonical-URL: ${route}`);
  }
  const sitemapOccurrences = sitemap.filter((item) => item === route).length;
  if (sitemapOccurrences !== 1) {
    failures.push(`Aktuelle Methode muss genau einmal in der Sitemap stehen (${sitemapOccurrences}): ${route}`);
  }
  const directHits = entries.filter((entry) => baseRoute(entry) === route && !String(entry.url || "").includes("#"));
  if (!directHits.length) {
    failures.push(`Aktuelle Methode fehlt im internen Suchindex: ${route}`);
  } else if (!directHits.some((entry) => currentExpectations.get(route).test(String(entry.title || "")))) {
    failures.push(`Aktuelle Methode ist im Suchindex nicht als aktuelle Fassung benannt: ${route}`);
  }
}

const historical = historicalMethodFiles(root);
for (const prefix of historical.missingPrefixes) {
  failures.push(`Historische Quellenroute ist nicht mehr erreichbar: ${prefix}`);
}
for (const file of historical.files) {
  const route = routeForHtmlFile(root, file);
  const html = fs.readFileSync(file, "utf8");
  if (!hasNoindexFollow(html)) {
    failures.push(`Historische Fassung braucht noindex,follow: ${route}`);
  }
  if (sitemap.includes(route)) {
    failures.push(`Historische Fassung darf nicht in der Sitemap stehen: ${route}`);
  }
}

for (const entry of entries) {
  const route = baseRoute(entry);
  if (isHistoricalRoute(route)) {
    failures.push(`Historische Fassung ist noch im internen Suchindex: ${entry.url}`);
  }
}

// Das ist ein gezieltes Regressions-Gate für historische T-SROI-Fassungen
// mit Verweisen auf die zurückgezogene Multiplikatorlogik. Eine nachfolgende
// Generierung darf sie weder als aktuelle Quellen noch als Suchtreffer
// zurückbringen. Reine PDF-Quellenfassungen müssen keinen künstlichen Reader
// bekommen; vorhandene Reader werden jedoch vollständig geprüft.
const registryPath = path.join(root, "assets", "data", "library-version-registry.json");
const registryDocuments = fs.existsSync(registryPath)
  ? JSON.parse(fs.readFileSync(registryPath, "utf8")).documents || []
  : [];
const releaseAssets = fs.existsSync(releaseAssetsPath)
  ? new Map(Object.entries(JSON.parse(fs.readFileSync(releaseAssetsPath, "utf8")).assets || {}))
  : new Map();

function isRegistryPathFor(document, sourcePath) {
  const primary = String(document?.urls?.primary || "");
  // Im Quellbaum steht der lokale Pfad. Im Auslieferungsartefakt wird
  // derselbe öffentliche Download absichtlich auf den Release-Asset-URL
  // umgeschrieben, damit große PDF-Dateien nicht doppelt ausgeliefert werden.
  return primary === sourcePath || primary === releaseAssets.get(sourcePath);
}

for (const target of RETIRED_T_SROI_MULTIPLIER_ARCHIVES) {
  const document = registryDocuments.find((item) => isRegistryPathFor(item, target.pdfPath));
  if (!document) {
    failures.push(`Historische T-SROI-PDF fehlt im Bibliotheksregister: ${target.pdfPath}`);
  } else {
    if (String(document.status).trim().toLocaleLowerCase("de-DE") !== "ersetzt") {
      failures.push(`Historische T-SROI-PDF muss den Status „ersetzt“ tragen: ${target.pdfPath}`);
    }
    if (String(document.successorUrl || "").replace(/^\/+/, "") !== CURRENT_T_SROI_STANDARD) {
      failures.push(`Historische T-SROI-PDF braucht den aktuellen Nachfolger: ${target.pdfPath}`);
    }
    const methodNotice = `${document.shortDescription || ""} ${document.historicalNotice || ""}`;
    if (!/historisch/iu.test(methodNotice) || !/multiplikativ/iu.test(methodNotice) || !/t-sroi/iu.test(methodNotice)) {
      failures.push(`Historische T-SROI-PDF braucht eine klare Methodeneinordnung: ${target.pdfPath}`);
    }
    if (!/transformativ/iu.test(String(document.historicalNotice || "")) || !/schutz-gate/iu.test(String(document.historicalNotice || ""))) {
      failures.push(`Historische T-SROI-PDF braucht eine präzise Korrektur mit Transformationswirkung und Schutz-Gate: ${target.pdfPath}`);
    }
  }

  const detailFile = htmlFileForRoute(root, target.route);
  if (!detailFile || !fs.existsSync(detailFile)) {
    failures.push(`Historische T-SROI-Archivroute fehlt: ${target.route}`);
    continue;
  }
  const detailHtml = fs.readFileSync(detailFile, "utf8");
  if (!hasNoindexFollow(detailHtml)) {
    failures.push(`Historische T-SROI-Archivroute braucht noindex,follow: ${target.route}`);
  }
  if (!detailHtml.includes(CURRENT_T_SROI_STANDARD) || !/Historische, ersetzte Fassung/iu.test(detailHtml)) {
    failures.push(`Historische T-SROI-Archivroute braucht Warnhinweis und Nachfolger: ${target.route}`);
  }

  const readerDirectory = path.join(path.dirname(detailFile), "lesen");
  const readerFiles = historical.files.filter((file) => file.startsWith(`${readerDirectory}${path.sep}`));
  if (target.hasOnlineReader && !readerFiles.length) {
    failures.push(`Historische T-SROI-Archivroute hat keine prüfbare Onlinefassung: ${target.route}`);
  }
  for (const file of readerFiles) {
    const html = fs.readFileSync(file, "utf8");
    const route = routeForHtmlFile(root, file);
    if (!hasNoindexFollow(html)) {
      failures.push(`Historische T-SROI-Onlinefassung braucht noindex,follow: ${route}`);
    }
    if (!/\bdata-search-exclude\b/iu.test(html)) {
      failures.push(`Historische T-SROI-Onlinefassung muss aus der Suche ausgeschlossen sein: ${route}`);
    }
    if (!html.includes(CURRENT_T_SROI_STANDARD) || !/Historische, ersetzte Fassung/iu.test(html)) {
      failures.push(`Historische T-SROI-Onlinefassung braucht Warnhinweis und Nachfolger: ${route}`);
    }
  }
}

if (failures.length) {
  console.error(`Methoden-/Versions-Indexierbarkeit fehlgeschlagen (${artifact ? "Artefakt" : "Quellbaum"}):`);
  failures.slice(0, 80).forEach((failure) => console.error(`- ${failure}`));
  if (failures.length > 80) console.error(`… ${failures.length - 80} weitere Befunde`);
  process.exit(1);
}

console.log(
  `Methoden-/Versions-Indexierbarkeit bestanden (${artifact ? "Artefakt" : "Quellbaum"}): ${CURRENT_METHOD_ROUTES.length} aktuelle und ${historical.files.length} historische Seiten geprüft.`,
);
