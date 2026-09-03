import fs from "node:fs";
import path from "node:path";

export const SITE_ORIGIN = "https://wirkungsoekonomie.de";

// These are the public entry points that explain the currently valid methods.
// They must remain searchable and appear exactly once in the sitemap.
export const CURRENT_METHOD_ROUTES = [
  "/werkzeuge/impact-controlling/methodenpapiere/t-sroi-transformationsmessung/",
  "/wirkungsfelder/gesundheit-pflege/dossiers/",
];

// Die aktuelle staatliche Nachhaltigkeitsarchitektur ist kein Methodenpaket.
// Ihre Glossar-, Register- und Quellenrouten bleiben deshalb separat typisiert,
// werden aber ebenso verpflichtend in der Sitemap gehalten.
export const CURRENT_STATE_ARCHITECTURE_ROUTES = [
  "/wirkungswissenschaften/",
  "/begriffe/nwi/",
  "/begriffe/nationaler-wohlfahrtsindex/",
  "/bibliothek/woek-begriffsleitfaden-fuehrend/",
  "/bibliothek/woek-master-items-register/",
  "/woek-id-register/",
  "/woek-id-register/methodik/",
  "/begriffe/deutsche-nachhaltigkeitsstrategie/",
  "/begriffe/gemeinsame-geschaeftsordnung-der-bundesministerien/",
  "/begriffe/gesetzesfolgenabschaetzung/",
  "/begriffe/nachhaltigkeitspruefung-des-bundes/",
  "/begriffe/elektronische-nachhaltigkeitspruefung/",
  "/begriffe/e-gesetzgebung/",
  "/begriffe/dns-indikator/",
  "/begriffe/zielbezug-und-wirkung/",
  "/begriffe/ex-ante-folgenpruefung-und-reality-check/",
  "/begriffe/staatliche-nachhaltigkeitsarchitektur/",
  "/begriffe/parlamentarischer-beirat-fuer-nachhaltige-entwicklung-und-zukunftsfragen/",
  "/begriffe/state-assessment-benchmark/",
  "/begriffe/state-gfa-enap-benchmark/",
  "/begriffe/wirkungsblindheit/",
  "/quellenarchiv/wok-q-9029/",
  "/quellenarchiv/wok-q-9030/",
  "/quellenarchiv/wok-q-9031/",
  "/quellenarchiv/wok-q-9032/",
  "/quellenarchiv/wok-q-9033/",
  "/quellenarchiv/wok-q-9034/",
  "/quellenarchiv/wok-q-9035/",
  "/quellenarchiv/wok-q-9036/",
  "/quellenarchiv/wok-q-9037/",
  "/quellenarchiv/wok-q-9048/",
  "/quellenarchiv/wok-q-9049/",
  "/quellenarchiv/wok-q-9050/",
];

// Diese vier bereits ersetzten PDF-Fassungen dokumentieren den früheren
// multiplikativen T-SROI-Ansatz. Sie bleiben wegen vorhandener Fundstellen
// erreichbar, dürfen aber weder als aktuelle Methode noch als Suchtreffer
// auftreten. `hasOnlineReader` macht bewusst sichtbar, ob eine Fassung eine
// eigene Online-Lesefassung besitzt; eine reine PDF-Quellenfassung braucht
// keinen künstlich erzeugten Reader.
export const RETIRED_T_SROI_MULTIPLIER_ARCHIVES = [
  {
    route: "/bibliothek/eintraege/download-or-document-assets-downloads-08-woek-wirtschaft-unternehmen-risikomanagement-resilienz-2/",
    pdfPath: "assets/downloads/08_woek_wirtschaft_unternehmen_risikomanagement_resilienz_finanzmarkt_detailkonzept_v1_0 2.pdf",
    hasOnlineReader: true,
  },
  {
    route: "/bibliothek/eintraege/download-or-document-assets-downloads-30-woek-finanzsystem-kapital-kapitalwirkung-statt-kapitalr-2/",
    pdfPath: "assets/downloads/30_woek_finanzsystem_kapital_kapitalwirkung_statt_kapitalrendite_detailkonzept_v1_0 2.pdf",
    hasOnlineReader: true,
  },
  {
    route: "/bibliothek/eintraege/download-or-document-assets-downloads-31-woek-finanzsystem-kapital-wirkungsfonds-dacharchitektur-2/",
    pdfPath: "assets/downloads/31_woek_finanzsystem_kapital_wirkungsfonds_dacharchitektur_detailkonzept_v1_0 2.pdf",
    hasOnlineReader: true,
  },
  {
    route: "/bibliothek/eintraege/download-or-document-assets-downloads-23-woek-impact-controlling-t-sroi-transformationsmessung-m-3/",
    pdfPath: "assets/downloads/23_woek_impact_controlling_t_sroi_transformationsmessung_methodenpapier_v1_0.pdf",
    hasOnlineReader: false,
  },
  {
    route: "/bibliothek/eintraege/download-or-document-assets-downloads-23-woek-impact-controlling-t-sroi-transformationsmessung-m-2/",
    pdfPath: "assets/downloads/23_woek_impact_controlling_t_sroi_transformationsmessung_methodenpapier_v1_0 2.pdf",
    hasOnlineReader: true,
  },
  {
    route: "/bibliothek/eintraege/download-or-document-assets-downloads-impact-controlling-einfach-erklaert-pdf/",
    pdfPath: "assets/downloads/impact-controlling-einfach-erklaert.pdf",
    hasOnlineReader: true,
  },
  {
    route: "/bibliothek/eintraege/download-or-document-assets-downloads-wirkungscontrolling-detailkonzept-dossier-v1-0-pdf/",
    pdfPath: "assets/downloads/wirkungscontrolling_detailkonzept_dossier_v1_0.pdf",
    hasOnlineReader: true,
  },
];

// Rückwärtskompatibler Export für Prüfungen, die ausdrücklich nur die drei
// macOS-Duplikate adressieren. Die vollständige Archivabdeckung verwendet
// oben `RETIRED_T_SROI_MULTIPLIER_ARCHIVES`.
export const RETIRED_T_SROI_MULTIPLIER_DUPLICATES = RETIRED_T_SROI_MULTIPLIER_ARCHIVES.slice(0, 3);

// Historical documents remain addressable for citations. Keeping the list in
// one place prevents an older mirror or duplicate PDF reader from silently
// becoming a competing search result after a future library rebuild.
export const HISTORICAL_METHOD_ROUTE_PREFIXES = [
  "/dokumente/whitepaper-t-sroi/",
  "/bibliothek/whitepaper-t-sroi/",
  "/bibliothek/eintraege/online-version-dokumente-whitepaper-t-sroi-index-html/",
  "/bibliothek/eintraege/download-or-document-assets-downloads-23-woek-impact-controlling-t-sroi-transformationsmessung-m-2/",
  "/bibliothek/eintraege/download-or-document-assets-downloads-23-woek-impact-controlling-t-sroi-transformationsmessung-m-3/",
  "/bibliothek/eintraege/download-or-document-assets-downloads-woek-gesundheit-pflege-einzeldossier-set-v0-2-pdf/",
  "/bibliothek/eintraege/download-or-document-assets-downloads-woek-gesundheit-pflege-einzeldossier-set-v0-2-2-pdf/",
  ...RETIRED_T_SROI_MULTIPLIER_ARCHIVES.map(({ route }) => route),
];

const ROBOTS_META = /<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/iu;
const URL_BLOCK = /<url\b[^>]*>[\s\S]*?<\/url>/giu;
const LASTMOD = "2026-08-21";

export function normalizeRoute(value = "") {
  let route = String(value || "").trim().replace(/[?#].*$/u, "");
  if (!route) return "/";
  if (!route.startsWith("/")) route = `/${route}`;
  route = route.replace(/\/index\.html$/iu, "/").replace(/\/+/gu, "/");
  return route;
}

export function routeForHtmlFile(siteRoot, file) {
  const relative = path.relative(siteRoot, file).split(path.sep).join("/");
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) return `/${relative.slice(0, -"index.html".length)}`;
  return `/${relative}`;
}

export function htmlFileForRoute(siteRoot, route) {
  const normalized = normalizeRoute(route);
  const relative = normalized.slice(1);
  if (relative.split("/").includes("..")) return null;
  if (normalized === "/") return path.join(siteRoot, "index.html");
  if (normalized.endsWith("/")) return path.join(siteRoot, relative, "index.html");
  if (/\.html?$/iu.test(normalized)) return path.join(siteRoot, relative);
  return path.join(siteRoot, relative, "index.html");
}

export function hasNoindex(html = "") {
  const tag = String(html).match(ROBOTS_META)?.[0] || "";
  return /\bnoindex\b/iu.test(tag);
}

export function hasNoindexFollow(html = "") {
  const tag = String(html).match(ROBOTS_META)?.[0] || "";
  return /\bnoindex\b/iu.test(tag) && /\bfollow\b/iu.test(tag);
}

export function ensureNoindexFollow(html = "") {
  const source = String(html);
  if (ROBOTS_META.test(source)) {
    return source.replace(ROBOTS_META, (tag) => {
      if (/\bcontent=["'][^"']*["']/iu.test(tag)) {
        return tag.replace(/\bcontent=["'][^"']*["']/iu, 'content="noindex,follow"');
      }
      return tag.replace(/\/?\s*>$/u, ' content="noindex,follow">');
    });
  }
  return source.replace(/<head(\s[^>]*)?>/iu, (head) => `${head}\n    <meta name="robots" content="noindex,follow">`);
}

function walkIndexHtml(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walkIndexHtml(file, files);
    else if (entry.isFile() && entry.name === "index.html") files.push(file);
  }
  return files;
}

export function historicalMethodFiles(siteRoot) {
  const files = new Set();
  const missingPrefixes = [];
  for (const prefix of HISTORICAL_METHOD_ROUTE_PREFIXES) {
    const directory = path.join(siteRoot, prefix.slice(1));
    if (!fs.existsSync(directory)) {
      missingPrefixes.push(prefix);
      continue;
    }
    for (const file of walkIndexHtml(directory)) files.add(file);
  }
  return { files: [...files].sort(), missingPrefixes };
}

export function normalizeHistoricalMethodRobots(siteRoot, { write = true } = {}) {
  const { files, missingPrefixes } = historicalMethodFiles(siteRoot);
  const changed = [];
  const unresolved = [];

  for (const file of files) {
    const before = fs.readFileSync(file, "utf8");
    const after = ensureNoindexFollow(before);
    if (!hasNoindexFollow(after)) {
      unresolved.push(routeForHtmlFile(siteRoot, file));
      continue;
    }
    if (write && after !== before) {
      fs.writeFileSync(file, after, "utf8");
      changed.push(routeForHtmlFile(siteRoot, file));
    }
  }

  return { files: files.map((file) => routeForHtmlFile(siteRoot, file)), changed, missingPrefixes, unresolved };
}

export function sitemapRoutes(xml = "") {
  const routes = [];
  for (const match of String(xml).matchAll(URL_BLOCK)) {
    const loc = match[0].match(/<loc>\s*([^<]+?)\s*<\/loc>/iu)?.[1];
    if (!loc) continue;
    try {
      const parsed = new URL(loc);
      if (parsed.origin === SITE_ORIGIN) routes.push(normalizeRoute(parsed.pathname));
    } catch {
      // A malformed third-party or legacy entry remains untouched by the
      // normalizer and is handled by the general sitemap/link quality gates.
    }
  }
  return routes;
}

function routeFromSitemapBlock(block) {
  const loc = String(block).match(/<loc>\s*([^<]+?)\s*<\/loc>/iu)?.[1];
  if (!loc) return null;
  try {
    const parsed = new URL(loc);
    if (parsed.origin !== SITE_ORIGIN) return null;
    return normalizeRoute(parsed.pathname);
  } catch {
    return null;
  }
}

function sitemapEntry(route) {
  return `  <url><loc>${SITE_ORIGIN}${route}</loc><lastmod>${LASTMOD}</lastmod></url>`;
}

// Remove robots-excluded routes and duplicate locations from a sitemap. The
// explicit current routes are added back if a generator accidentally omitted
// them. This works for the source tree and for the deploy artifact.
export function synchronizeSitemapIndexability({
  siteRoot,
  sitemapPath = path.join(siteRoot, "sitemap.xml"),
  requiredRoutes = [...CURRENT_METHOD_ROUTES, ...CURRENT_STATE_ARCHITECTURE_ROUTES],
  excludedRoutes = [],
  write = true,
} = {}) {
  if (!siteRoot) throw new Error("siteRoot is required for sitemap synchronization.");
  if (!fs.existsSync(sitemapPath)) throw new Error(`Missing sitemap: ${sitemapPath}`);

  const before = fs.readFileSync(sitemapPath, "utf8");
  const excluded = new Set(excludedRoutes.map(normalizeRoute));
  const seen = new Set();
  const removedNoindex = [];
  const removedDuplicates = [];
  const removedExcluded = [];

  let after = before.replace(URL_BLOCK, (block) => {
    const route = routeFromSitemapBlock(block);
    if (!route) return block;
    if (excluded.has(route)) {
      removedExcluded.push(route);
      return "";
    }
    const file = htmlFileForRoute(siteRoot, route);
    if (file && fs.existsSync(file) && hasNoindex(fs.readFileSync(file, "utf8"))) {
      removedNoindex.push(route);
      return "";
    }
    if (seen.has(route)) {
      removedDuplicates.push(route);
      return "";
    }
    seen.add(route);
    return block;
  });
  after = after.replace(/^[\t ]+$/gmu, "");

  const added = [];
  for (const route of requiredRoutes.map(normalizeRoute)) {
    const file = htmlFileForRoute(siteRoot, route);
    if (!file || !fs.existsSync(file)) {
      throw new Error(`Current method route is missing from the public tree: ${route}`);
    }
    if (hasNoindex(fs.readFileSync(file, "utf8"))) {
      throw new Error(`Current method route is incorrectly noindex: ${route}`);
    }
    if (!seen.has(route)) {
      after = after.replace("</urlset>", `${sitemapEntry(route)}\n</urlset>`);
      seen.add(route);
      added.push(route);
    }
  }

  if (write && after !== before) fs.writeFileSync(sitemapPath, after, "utf8");
  return { changed: after !== before, removedNoindex, removedDuplicates, removedExcluded, added, routes: [...seen].sort() };
}
