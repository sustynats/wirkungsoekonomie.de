import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "content/sources/evidence-source-registry.json");
const archivePaths = [
  path.join(root, "content/quellenarchiv/sources.json"),
  path.join(root, "content/quellenarchiv/glossary-source-records.json"),
  path.join(root, "content/quellenarchiv/evidence-source-records.json")
];
const bibliographyJsonPath = path.join(root, "content/sources/bibliography.json");
const bibliographyMarkdownPath = path.join(root, "content/sources/bibliography.md");
const sourcePagePaths = [
  "quellen/bibliografie.html",
  "quellen/grundlagen-denker.html",
  "quellen/nachhaltigkeit-sdgs-planetare-grenzen.html",
  "quellen/oekonomie-innovation.html",
  "quellen/systemtheorie-kybernetik.html",
  "quellen/vergleichsmodelle.html"
].map((file) => path.join(root, file));
const reportPath = path.join(root, "reports/evidence-source-archive-quality.json");
const errors = [];
const warnings = [];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function sourcesOf(value) {
  return Array.isArray(value) ? value : Array.isArray(value?.sources) ? value.sources : [];
}

function normalizeText(value) {
  return String(value || "")
    .toLocaleLowerCase("de")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function archiveSlug(value) {
  return String(value || "")
    .toLocaleLowerCase("de")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function expectedArchiveUrl(code) {
  return `/quellenarchiv/${archiveSlug(code)}/`;
}

function validHttpUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return /^https?:$/.test(url.protocol);
  } catch {
    return false;
  }
}

function normalizeUrl(value) {
  try {
    const url = new URL(String(value || ""));
    url.hash = "";
    url.hostname = url.hostname.toLowerCase();
    url.pathname = url.pathname.replace(/\/+$/, "") || "/";
    return url.toString();
  } catch {
    return "";
  }
}

function locatorForRegistry(source) {
  if (validHttpUrl(source.official_url)) return String(source.official_url);
  if (validHttpUrl(source.catalog_url)) return String(source.catalog_url);
  if (String(source.doi || "").trim()) return `https://doi.org/${String(source.doi).trim()}`;
  return "";
}

function locatorForArchive(source) {
  if (validHttpUrl(source.url)) return String(source.url);
  if (String(source.doi || "").trim()) return `https://doi.org/${String(source.doi).trim()}`;
  return "";
}

function locatorKind(locator, source = {}) {
  if (source.catalog_url || source.locatorType === "katalog") return "catalog";
  try {
    const url = new URL(locator);
    return /(^|\.)worldcat\.org$/i.test(url.hostname) ? "catalog" : "direct";
  } catch {
    return "invalid";
  }
}

function doiFrom(value) {
  const decoded = decodeURIComponent(String(value || ""));
  const match = decoded.match(/10\.\d{4,9}\/[\w.()/:;-]+/i);
  return match ? match[0].replace(/[),.;]+$/, "").toLowerCase() : "";
}

function legalActKey(value) {
  const decoded = decodeURIComponent(String(value || "")).toUpperCase();
  const celex = decoded.match(/CELEX:\s*3(\d{4})[A-Z](\d+)/);
  if (celex) return `${celex[1]}/${celex[2]}`;
  const eli = decoded.match(/\/ELI\/(?:DIR|REG|REG_DEL|DEC)\/(\d{4})\/(\d+)/);
  return eli ? `${eli[1]}/${eli[2]}` : "";
}

function sourceHostsMatch(a, b) {
  try {
    return new URL(a).hostname.toLowerCase() === new URL(b).hostname.toLowerCase();
  } catch {
    return false;
  }
}

function locatorCompatibility(registrySource, archiveSource) {
  const registryLocator = locatorForRegistry(registrySource);
  const archiveLocator = locatorForArchive(archiveSource);
  if (!registryLocator || !archiveLocator) return { ok: false, reason: "fehlender Locator" };
  if (normalizeUrl(registryLocator) === normalizeUrl(archiveLocator)) return { ok: true, reason: "identischer Locator" };

  const registryDoi = doiFrom(registrySource.doi || registryLocator);
  const archiveDoi = doiFrom(archiveSource.doi || archiveLocator);
  if (registryDoi && registryDoi === archiveDoi) return { ok: true, reason: "identischer DOI" };

  const registryLegalAct = legalActKey(registryLocator);
  const archiveLegalAct = legalActKey(archiveLocator);
  if (registryLegalAct && registryLegalAct === archiveLegalAct) return { ok: true, reason: "identischer EU-Rechtsakt" };

  if (locatorKind(registryLocator, registrySource) === "catalog" && locatorKind(archiveLocator, archiveSource) === "catalog") {
    return { ok: true, reason: "gleichwertiger bibliografischer Katalognachweis" };
  }

  const relation = String(registrySource.archive_locator_relation || "").trim();
  const note = String(registrySource.archive_locator_note || "").trim();
  if (!relation || !note) return { ok: false, reason: "abweichender Locator ohne dokumentierte Relation" };

  if (relation === "catalog_to_official_publisher_page" || relation === "catalog_to_official_resource_page") {
    return locatorKind(registryLocator, registrySource) === "catalog" && locatorKind(archiveLocator, archiveSource) === "direct"
      ? { ok: true, reason: relation }
      : { ok: false, reason: `${relation} passt nicht zu den Locator-Typen` };
  }
  if (relation === "alternative_official_landing_page") {
    return locatorKind(registryLocator, registrySource) === "direct"
      && locatorKind(archiveLocator, archiveSource) === "direct"
      && sourceHostsMatch(registryLocator, archiveLocator)
      ? { ok: true, reason: relation }
      : { ok: false, reason: `${relation} verlangt zwei offizielle Locator derselben Domain` };
  }
  if (relation === "doi_resolver") {
    return registryDoi && registryDoi === archiveDoi
      ? { ok: true, reason: relation }
      : { ok: false, reason: "doi_resolver ohne identischen DOI" };
  }
  return { ok: false, reason: `unbekannte Locator-Relation ${relation}` };
}

function sourceCardIncludes(html, source) {
  const id = String(source.id).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const code = String(source.archive_code).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const idPattern = new RegExp(`data-source-id=["']${id}["']`, "i");
  const archivePattern = new RegExp(`data-source-archive-code=["']${code}["']`, "i");
  return idPattern.test(html) && archivePattern.test(html);
}

function htmlHrefExists(html, href) {
  const escaped = String(href).replace(/&/g, "&amp;");
  return html.includes(`href="${href}"`) || html.includes(`href='${href}'`)
    || html.includes(`href="${escaped}"`) || html.includes(`href='${escaped}'`);
}

function writeReport(registrySources, archiveSources, checks) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    publishedRegistrySources: registrySources.length,
    availableArchiveSources: archiveSources.length,
    checks,
    errors,
    warnings
  }, null, 2)}\n`);
}

for (const file of [registryPath, bibliographyJsonPath, bibliographyMarkdownPath, ...archivePaths, ...sourcePagePaths]) {
  if (!fs.existsSync(file)) errors.push(`Erforderliche Datei fehlt: ${path.relative(root, file)}`);
}

if (!errors.length) {
  const registry = readJson(registryPath);
  const registrySources = sourcesOf(registry).filter((source) => source.public_display !== false);
  const archiveSources = archivePaths.flatMap((file) => sourcesOf(readJson(file)));
  const archiveByCode = new Map();
  const archiveByRegistryId = new Map();
  const bibliography = readJson(bibliographyJsonPath);
  const bibliographyById = new Map((bibliography.items || []).map((source) => [source.id, source]));
  const bibliographyMarkdown = fs.readFileSync(bibliographyMarkdownPath, "utf8");
  const sourcePagesHtml = sourcePagePaths.map((file) => fs.readFileSync(file, "utf8")).join("\n");
  const checks = [];

  for (const archiveSource of archiveSources) {
    const code = String(archiveSource.code || "").trim();
    if (!code) {
      errors.push("Quellenarchiv enthält einen Eintrag ohne Quellen-ID.");
      continue;
    }
    if (archiveByCode.has(code)) errors.push(`Quellenarchiv enthält doppelte Quellen-ID: ${code}`);
    archiveByCode.set(code, archiveSource);
    if (archiveSource.registryId) {
      if (archiveByRegistryId.has(archiveSource.registryId)) errors.push(`Mehrere Ergänzungssteckbriefe für Evidenzregister-ID ${archiveSource.registryId}`);
      archiveByRegistryId.set(archiveSource.registryId, archiveSource);
    }
  }

  for (const source of registrySources) {
    const code = String(source.archive_code || "").trim();
    const archiveUrl = String(source.archive_url || "").trim();
    const expectedUrl = expectedArchiveUrl(code);
    const archiveSource = archiveByCode.get(code);
    const sourceId = String(source.id || "[ohne ID]");

    if (!code || !archiveUrl) {
      errors.push(`${sourceId}: archive_code oder archive_url fehlt.`);
      continue;
    }
    if (archiveUrl !== expectedUrl) errors.push(`${sourceId}: archive_url muss ${expectedUrl} sein, ist aber ${archiveUrl}.`);
    if (!archiveSource) {
      errors.push(`${sourceId}: Quellenarchiv-ID ${code} fehlt.`);
      continue;
    }
    if (archiveByRegistryId.has(sourceId) && archiveByRegistryId.get(sourceId).code !== code) {
      errors.push(`${sourceId}: Ergänzungssteckbrief verweist auf ${archiveByRegistryId.get(sourceId).code}, Registry auf ${code}.`);
    }
    if (!locatorForRegistry(source)) errors.push(`${sourceId}: Originalquelle oder transparenter Katalognachweis fehlt.`);
    if (!locatorForArchive(archiveSource)) errors.push(`${sourceId}: verknüpfter Quellensteckbrief hat keinen Locator.`);

    const titleMatches = normalizeText(source.title) === normalizeText(archiveSource.title);
    if (!titleMatches && !String(source.archive_title_relation || "").trim()) {
      errors.push(`${sourceId}: abweichender Archivtitel ohne archive_title_relation.`);
    }
    const compatibility = locatorCompatibility(source, archiveSource);
    if (!compatibility.ok) errors.push(`${sourceId}: Locator-Kette ist nicht transparent (${compatibility.reason}).`);

    const detailPath = path.join(root, archiveUrl.replace(/^\//, ""), "index.html");
    if (!fs.existsSync(detailPath)) {
      errors.push(`${sourceId}: Quellenarchiv-Detailseite fehlt (${path.relative(root, detailPath)}).`);
    } else {
      const detailHtml = fs.readFileSync(detailPath, "utf8");
      const canonical = `https://wirkungsoekonomie.de${archiveUrl}`;
      if (!detailHtml.includes(`rel="canonical" href="${canonical}"`)) errors.push(`${sourceId}: Canonical des Quellensteckbriefs fehlt oder ist falsch.`);
      if (!detailHtml.includes(String(archiveSource.title))) errors.push(`${sourceId}: Titel fehlt im Quellensteckbrief.`);
      if (!htmlHrefExists(detailHtml, locatorForArchive(archiveSource))) errors.push(`${sourceId}: Locator fehlt sichtbar im Quellensteckbrief.`);
      if (!detailHtml.includes(sourceId)) errors.push(`${sourceId}: Evidenzregister-ID fehlt sichtbar im Quellensteckbrief.`);
      if (locatorKind(locatorForArchive(archiveSource), archiveSource) === "catalog" && !/kein Volltext|bibliografische Katalogsuche/i.test(detailHtml)) {
        errors.push(`${sourceId}: Katalognachweis ist im Quellensteckbrief nicht als kein Volltext erläutert.`);
      }
    }

    const bibliographyItem = bibliographyById.get(sourceId);
    if (!bibliographyItem) errors.push(`${sourceId}: fehlt in bibliography.json.`);
    else if (bibliographyItem.archive_code !== code || bibliographyItem.archive_url !== archiveUrl) {
      errors.push(`${sourceId}: archive_code/archive_url in bibliography.json sind nicht synchron.`);
    }
    if (!bibliographyMarkdown.includes(source.title) || !bibliographyMarkdown.includes(`](${archiveUrl})`)) {
      errors.push(`${sourceId}: Quellensteckbrief fehlt in bibliography.md.`);
    }
    if (!sourceCardIncludes(sourcePagesHtml, source)) errors.push(`${sourceId}: sichtbarer Quellensteckbrief-Link fehlt auf den öffentlichen Quellenkarten.`);

    checks.push({ id: sourceId, code, archiveUrl, titleMatches, locatorRule: compatibility.reason });
  }

  writeReport(registrySources, archiveSources, checks);
  if (errors.length) {
    console.error(`Evidenzregister-Quellenarchiv-Prüfung fehlgeschlagen (${errors.length} Befunde):`);
    for (const error of errors.slice(0, 120)) console.error(`- ${error}`);
    if (errors.length > 120) console.error(`… ${errors.length - 120} weitere Befunde`);
    process.exit(1);
  }
  console.log(`Evidenzregister-Quellenarchiv-Prüfung bestanden: ${registrySources.length} veröffentlichte Quellen sind bis zum sichtbaren Quellensteckbrief rückverfolgbar.`);
} else {
  writeReport([], [], []);
  console.error(`Evidenzregister-Quellenarchiv-Prüfung fehlgeschlagen (${errors.length} Befunde):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
