import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const baseArchivePath = path.join(root, "content/quellenarchiv/sources.json");
const glossaryArchivePath = path.join(root, "content/quellenarchiv/glossary-source-records.json");
const evidenceArchivePath = path.join(root, "content/quellenarchiv/evidence-source-records.json");
const legalArchivePath = path.join(root, "content/quellenarchiv/legal-source-records.json");
const glossaryPath = path.join(root, "public/data/glossary.terms.json");
const reportPath = path.join(root, "reports/quellenarchiv-quality.json");
const siteHosts = new Set(["wirkungsoekonomie.de", "www.wirkungsoekonomie.de"]);
const errors = [];
const warnings = [];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function asSources(data) {
  return Array.isArray(data) ? data : Array.isArray(data?.sources) ? data.sources : [];
}

function slug(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function locatorFor(source) {
  if (String(source?.url || "").trim()) return String(source.url).trim();
  if (String(source?.doi || "").trim()) return `https://doi.org/${String(source.doi).trim()}`;
  return "";
}

function locatorType(source, locator) {
  if (source?.locatorType) return String(source.locatorType);
  if (/^https:\/\/search\.worldcat\.org\/search\?/i.test(locator)) return "katalog";
  if (/^https:\/\/api\.openalex\.org\/works\?search=/i.test(locator)) return "literatursuche";
  return "direkt";
}

function archivePath(value) {
  const match = String(value || "").match(/(?:^|\/)quellenarchiv\/([a-z0-9-]+)\/?$/i);
  return match ? `/quellenarchiv/${match[1].toLowerCase()}/` : "";
}

function localPathFromLocator(locator) {
  const raw = String(locator || "").trim();
  if (/^\/(?!\/)/.test(raw)) return raw;
  try {
    const parsed = new URL(raw);
    return siteHosts.has(parsed.hostname.toLowerCase()) ? parsed.pathname : "";
  } catch {
    return "";
  }
}

function localTargetExists(locator) {
  const route = decodeURIComponent(localPathFromLocator(locator).split(/[?#]/)[0]);
  if (!route) return true;
  const relative = route.replace(/^\/+/, "");
  if (!relative) return fs.existsSync(path.join(root, "index.html"));
  const candidates = relative.endsWith("/")
    ? [path.join(root, relative, "index.html")]
    : [path.join(root, relative), path.join(root, relative, "index.html")];
  return candidates.some((candidate) => fs.existsSync(candidate));
}

function safeHttpUrl(value) {
  try {
    const url = new URL(value);
    return /^https?:$/.test(url.protocol);
  } catch {
    return false;
  }
}

function hrefContains(html, url) {
  const raw = String(url || "");
  const escaped = raw.replace(/&/g, "&amp;");
  return [raw, escaped].some((candidate) => (
    html.includes(`href="${candidate}"`) || html.includes(`href='${candidate}'`)
  ));
}

function archiveHrefExists(html, url) {
  const expected = archivePath(url);
  if (!expected) return false;
  const sourceSlug = expected.split("/").filter(Boolean).pop();
  const pattern = new RegExp(`<a\\b[^>]*\\bhref=["'][^"']*quellenarchiv/${sourceSlug}/?["']`, "i");
  return pattern.test(html);
}

function sourceUrls(term) {
  // The snake_case fields preserve imported raw metadata.  The page generator
  // deliberately prefers their normalized camelCase counterparts, whose URLs
  // point to the public archive records.  Check that same published contract;
  // otherwise this gate would mistake non-rendered provenance metadata for a
  // visible direct source link.
  const fields = [
    term?.curatedSources || term?.curated_sources,
    term?.sourceLinks || term?.source_links,
    term?.officialSources,
  ];
  const values = fields.flatMap((value) => Array.isArray(value) ? value : value ? [value] : []);
  return values.map((value) => {
    if (value && typeof value === "object") return String(value.url || value.href || value.pageUrl || "").trim();
    const raw = String(value || "").trim();
    return raw.includes("|") ? raw.slice(raw.lastIndexOf("|") + 1).trim() : raw;
  }).filter(Boolean);
}

function writeReport(sources, glossaryTerms) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    sources: sources.length,
    glossaryTerms: glossaryTerms.length,
    errors,
    warnings,
  }, null, 2)}\n`);
}

for (const requiredPath of [baseArchivePath, glossaryArchivePath, evidenceArchivePath, legalArchivePath, glossaryPath]) {
  if (!fs.existsSync(requiredPath)) {
    errors.push(`Erforderliche Build-Datei fehlt: ${path.relative(root, requiredPath)}`);
  }
}

if (!errors.length) {
  const baseData = readJson(baseArchivePath);
  const glossaryData = readJson(glossaryArchivePath);
  const evidenceData = readJson(evidenceArchivePath);
  const legalData = readJson(legalArchivePath);
  const glossaryDataTerms = readJson(glossaryPath);
  const baseSources = asSources(baseData);
  const generatedGlossarySources = asSources(glossaryData);
  const evidenceSources = asSources(evidenceData);
  const legalSources = asSources(legalData);
  const glossaryTerms = Array.isArray(glossaryDataTerms?.terms) ? glossaryDataTerms.terms : [];

  if (Number.isFinite(baseData?.count) && baseData.count !== baseSources.length) {
    errors.push(`Quellenarchiv-Snapshot: count (${baseData.count}) stimmt nicht mit sources (${baseSources.length}) überein`);
  }
  const glossaryClusterCount = glossaryData?.clusters?.find((cluster) => cluster.key === "M")?.count;
  if (Number.isFinite(glossaryClusterCount) && glossaryClusterCount !== generatedGlossarySources.length) {
    errors.push(`Glossar-Quellenarchiv: Clusterzählung (${glossaryClusterCount}) stimmt nicht mit sources (${generatedGlossarySources.length}) überein`);
  }

  const sourceByCode = new Map();
  for (const [origin, entries] of [
    ["Basisarchiv", baseSources],
    ["Glossararchiv", generatedGlossarySources],
    ["Evidenzregister-Archiv", evidenceSources],
    ["Amtliche Rechtsquellen", legalSources]
  ]) {
    for (const source of entries) {
      const code = String(source?.code || "").trim();
      if (!code) {
        errors.push(`${origin}: Quellen-ID fehlt`);
        continue;
      }
      if (sourceByCode.has(code)) {
        errors.push(`${origin}: doppelte Quellen-ID ${code}`);
        continue;
      }
      sourceByCode.set(code, source);
    }
  }

  const sourceByArchivePath = new Map([...sourceByCode.entries()].map(([code, source]) => [`/quellenarchiv/${slug(code)}/`, source]));
  for (const [code, source] of sourceByCode) {
    const title = String(source?.title || "").trim();
    const summary = String(source?.summary || "").trim();
    const classification = String(source?.einordnung || "").trim();
    const locator = locatorFor(source);
    const sourceSlug = slug(code);
    const detailPath = path.join(root, "quellenarchiv", sourceSlug, "index.html");

    if (!sourceSlug) errors.push(`${code}: Quellen-ID ist nicht routbar`);
    if (!title) errors.push(`${code}: Titel fehlt`);
    if (!summary) errors.push(`${code}: Kurzbeschreibung fehlt`);
    if (!classification) errors.push(`${code}: wirkungsökonomische Einordnung fehlt`);
    if (!locator) {
      errors.push(`${code}: Originalquelle oder transparenter bibliografischer Locator fehlt`);
      continue;
    }
    const ownRoute = localPathFromLocator(locator);
    if (ownRoute) {
      if (!localTargetExists(locator)) errors.push(`${code}: interne Fundstelle existiert nicht (${locator})`);
    } else if (!safeHttpUrl(locator)) {
      errors.push(`${code}: Locator ist keine gültige HTTP(S)- oder interne URL (${locator})`);
      continue;
    }

    if (!fs.existsSync(detailPath)) {
      errors.push(`${code}: Quellenarchiv-Detailseite fehlt (${path.relative(root, detailPath)})`);
      continue;
    }
    const html = fs.readFileSync(detailPath, "utf8");
    const canonical = `https://wirkungsoekonomie.de/quellenarchiv/${sourceSlug}/`;
    if (!html.includes(`rel="canonical" href="${canonical}"`)) errors.push(`${code}: Canonical der Detailseite fehlt oder ist falsch`);
    if (!hrefContains(html, locator)) errors.push(`${code}: Locator ist auf der Detailseite nicht verlinkt`);
    if (!/target="_blank"[^>]*rel="noopener noreferrer"|rel="noopener noreferrer"[^>]*target="_blank"/i.test(html)) {
      errors.push(`${code}: externe Fundstelle ist nicht sicher als externer Link markiert`);
    }
    const kind = locatorType(source, locator);
    if (kind === "katalog" && !/Bibliografische Fundstelle öffnen|bibliografische Katalogsuche/i.test(html)) {
      errors.push(`${code}: Katalog-Locator ist auf der Detailseite nicht als bibliografische Fundstelle erläutert`);
    }
    if (kind === "literatursuche" && !/Literatursuche öffnen|Literatursuche/i.test(html)) {
      errors.push(`${code}: Literatursuche ist auf der Detailseite nicht transparent erläutert`);
    }
    if (kind === "nachfolge" && !/Nachfolgeangebot öffnen|Nachfolgeangebot/i.test(html)) {
      errors.push(`${code}: Nachfolge-Locator ist auf der Detailseite nicht als Nachfolgeangebot erläutert`);
    }
    if (kind === "recherchehinweis" && !/Recherchehinweis|Offizielle Recherche öffnen/i.test(html)) {
      errors.push(`${code}: Recherchehinweis ist auf der Detailseite nicht transparent erläutert`);
    }
  }

  for (const term of glossaryTerms) {
    const termId = String(term?.termId || term?.id || term?.slug || "[ohne ID]");
    const termSlug = String(term?.slug || "");
    const termPath = path.join(root, "begriffe", termSlug, "index.html");
    const seen = new Set();
    for (const url of sourceUrls(term)) {
      const expected = archivePath(url);
      if (!expected) {
        errors.push(`${termId}: Glossarquelle führt nicht über eine Quellenarchiv-Detailseite (${url})`);
        continue;
      }
      if (seen.has(expected)) continue;
      seen.add(expected);
      if (!sourceByArchivePath.has(expected)) errors.push(`${termId}: Glossarquelle verweist auf nicht registrierte Detailseite (${expected})`);
      if (!fs.existsSync(path.join(root, expected.replace(/^\//, ""), "index.html"))) errors.push(`${termId}: Glossarquelle verweist auf nicht erzeugte Detailseite (${expected})`);
      if (!fs.existsSync(termPath)) {
        errors.push(`${termId}: Glossar-Detailseite fehlt`);
      } else if (!archiveHrefExists(fs.readFileSync(termPath, "utf8"), expected)) {
        errors.push(`${termId}: deklarierter Quellenarchiv-Link ist nicht auf der Glossar-Detailseite sichtbar (${expected})`);
      }
    }
  }

  writeReport([...sourceByCode.values()], glossaryTerms);
  if (errors.length) {
    console.error(`Quellenarchiv-Qualität fehlgeschlagen (${errors.length} Befunde):`);
    for (const error of errors.slice(0, 150)) console.error(`- ${error}`);
    if (errors.length > 150) console.error(`… ${errors.length - 150} weitere Befunde`);
    process.exit(1);
  }
  console.log(`Quellenarchiv-Qualität bestanden: ${sourceByCode.size} Detailseiten, ${glossaryTerms.length} Glossarbegriffe und alle veröffentlichten Locator-Ketten geprüft.`);
} else {
  writeReport([], []);
  console.error(`Quellenarchiv-Qualität fehlgeschlagen (${errors.length} Befunde):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
