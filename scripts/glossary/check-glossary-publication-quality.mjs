import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const glossaryPath = path.join(root, "public/data/glossary.terms.json");
const reportPath = path.join(root, "reports/glossary-publication-quality.json");
const relationReportPath = path.join(root, "reports/glossary-relation-curation.json");
const glossarySourceRecordsPath = path.join(root, "content/quellenarchiv/glossary-source-records.json");
const glossary = JSON.parse(fs.readFileSync(glossaryPath, "utf8"));
const terms = Array.isArray(glossary.terms) ? glossary.terms : [];
const errors = [];
const warnings = [];
const glossarySourceRecords = fs.existsSync(glossarySourceRecordsPath)
  ? (JSON.parse(fs.readFileSync(glossarySourceRecordsPath, "utf8")).sources || [])
  : [];
const generatedGlossarySourceSlugs = new Set(glossarySourceRecords.map((source) => String(source.code || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")));

function asArray(value) {
  return Array.isArray(value) ? value : value === undefined || value === null || value === "" ? [] : [value];
}

function key(value) {
  return String(value || "")
    .toLocaleLowerCase("de")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function valueText(value) {
  return value && typeof value === "object"
    ? String(value.termId || value.id || value.slug || value.label || value.title || "")
    : String(value || "");
}

function normalizedDefinition(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[.,;:!?]+$/g, "")
    .trim()
    .toLocaleLowerCase("de");
}

function definitionWordCount(value) {
  return normalizedDefinition(value).split(/\s+/).filter(Boolean).length;
}

function hasLinkedSource(term) {
  return sourceUrls(term).length > 0;
}

function sourceUrls(term) {
  return [
    ...asArray(term.curatedSources || term.curated_sources),
    ...asArray(term.sourceLinks || term.source_links),
    ...asArray(term.officialSources),
  ].map((source) => {
    if (source && typeof source === "object") return String(source.url || source.href || source.pageUrl || "").trim();
    const raw = String(source || "").trim();
    return raw.includes("|") ? raw.slice(raw.lastIndexOf("|") + 1).trim() : raw;
  }).filter((url) => /^(?:https?:\/\/|\/)/i.test(url));
}

function localTargetExists(url) {
  if (!url || /^https?:\/\//i.test(url)) return true;
  const normalized = String(url).split(/[?#]/)[0].replace(/^\/+/, "");
  if (!normalized) return true;
  const candidates = normalized.endsWith("/")
    ? [path.join(root, normalized, "index.html")]
    : [path.join(root, normalized), path.join(root, normalized, "index.html")];
  return candidates.some((candidate) => fs.existsSync(candidate));
}

function archivePath(url) {
  return String(url || "").split(/[?#]/)[0].replace(/\/+$/, "/");
}

const publicEditorialMarkers = [
  /Redaktionelle Metadaten/i,
  /Review[- ]?Status/i,
  /Aktualisiert durch:\s*(?:Codex|Claude)/i,
  /(?:Glossar[- ]?Pack|Import[- ]?Version|Source[- ]?Hash)/i,
  /No[- ]?Delete/i,
];

const termByKey = new Map();
const termIds = new Set();
const termSlugs = new Set();
for (const term of terms) {
  const id = term.termId || term.id;
  if (id && termIds.has(id)) errors.push(`${id}: doppelte kanonische ID`);
  if (id) termIds.add(id);
  if (term.slug && termSlugs.has(term.slug)) errors.push(`${id || term.slug}: doppelter kanonischer Slug`);
  if (term.slug) termSlugs.add(term.slug);
  for (const candidate of [term.termId, term.id, term.slug]) {
    const normalized = key(candidate);
    if (normalized) termByKey.set(normalized, term);
  }
}

for (const source of glossarySourceRecords) {
  const code = String(source.code || "").trim();
  const slug = code
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const url = String(source.url || (source.doi ? `https://doi.org/${source.doi}` : "")).trim();
  if (!code || !slug) {
    errors.push("Glossar-Quellenarchiv: Quellen-ID fehlt");
    continue;
  }
  if (!url) {
    errors.push(`${code}: externe oder interne Fundstelle fehlt; ein transparenter Katalog- oder Literaturnachweis ist erforderlich`);
    continue;
  }
  if (/^\/(?!\/)/.test(url)) {
    if (!localTargetExists(url)) {
      errors.push(`${code}: interne Fundstelle existiert nicht (${url})`);
      continue;
    }
  } else {
    try {
      const parsed = new URL(url);
      if (!/^https?:$/.test(parsed.protocol)) throw new Error("kein HTTP(S)-Locator");
    } catch {
      errors.push(`${code}: Fundstelle ist keine gültige HTTP(S)- oder interne URL (${url})`);
      continue;
    }
  }
  const page = path.join(root, "quellenarchiv", slug, "index.html");
  if (!fs.existsSync(page)) {
    errors.push(`${code}: Quellenarchiv-Detailseite fehlt`);
    continue;
  }
  const html = fs.readFileSync(page, "utf8");
  const escapedUrl = url.replace(/&/g, "&amp;");
  if (!html.includes(`href="${url}"`) && !html.includes(`href='${url}'`) && !html.includes(`href="${escapedUrl}"`) && !html.includes(`href='${escapedUrl}'`)) {
    errors.push(`${code}: Fundstelle ist auf der Quellenarchiv-Detailseite nicht verlinkt`);
  }
}

for (const term of terms) {
  const id = term.termId || term.id || term.slug;
  if (!id || !term.slug) {
    errors.push(`${id || "[ohne ID]"}: kanonische ID oder Slug fehlt`);
    continue;
  }
  if (!term.sourceProvenance || !hasLinkedSource(term)) warnings.push(`${id}: verlinkte Quellenprovenienz noch nicht vollständig`);
  const shortDefinition = String(term.shortDefinition || "").trim();
  const longDefinition = String(term.longDefinition || term.definition || "").trim();
  const repeatedDefinition = normalizedDefinition(shortDefinition) === normalizedDefinition(longDefinition);
  if (!term.definitionDetailStatus || !["vertieft", "konzis"].includes(term.definitionDetailStatus)) {
    errors.push(`${id}: Status der Langdefinition fehlt oder ist ungültig`);
  } else if (term.definitionDetailStatus === "vertieft" && repeatedDefinition) {
    errors.push(`${id}: als vertieft markierte Langdefinition wiederholt die Kurzdefinition`);
  } else if (term.definitionDetailStatus === "konzis" && (!repeatedDefinition || definitionWordCount(shortDefinition) < 8 || !hasLinkedSource(term))) {
    errors.push(`${id}: als konzise markierte Definition erfüllt die Mindesttransparenz nicht`);
  }
  const page = path.join(root, "begriffe", term.slug, "index.html");
  if (!fs.existsSync(page)) {
    errors.push(`${id}: Detailseite fehlt`);
  } else {
    const html = fs.readFileSync(page, "utf8");
    if (/\[object Object\]/i.test(html)) errors.push(`${id}: technisches Objektartefakt auf Detailseite`);
    if (!/<link\s+rel=["']canonical["']/i.test(html)) errors.push(`${id}: Canonical fehlt auf Detailseite`);
    for (const marker of publicEditorialMarkers) {
      if (marker.test(html)) errors.push(`${id}: redaktioneller Hinweis auf Detailseite (${marker})`);
    }
    for (const url of sourceUrls(term)) {
      const expected = archivePath(url);
      if (expected && !html.includes(`href="${expected}"`) && !html.includes(`href='${expected}'`)) {
        errors.push(`${id}: veröffentlichter Quellenarchiv-Link fehlt auf Detailseite (${expected})`);
      }
    }
    for (const relation of asArray(term.relatedTerms)) {
      const target = termByKey.get(key(valueText(relation)));
      if (target?.slug && !html.includes(`../../begriffe/${target.slug}/`)) {
        errors.push(`${id}: veröffentlichter Querverweis ist nicht verlinkt (${target.slug})`);
      }
    }
  }
  const related = asArray(term.relatedTerms);
  if (!related.length) {
    errors.push(`${id}: veröffentlichter Querverweis fehlt`);
  }
  for (const relation of related) {
    const target = termByKey.get(key(valueText(relation)));
    if (!target) errors.push(`${id}: Querverweis nicht auflösbar (${valueText(relation)})`);
    else if ((target.termId || target.id) === id) errors.push(`${id}: Selbstverweis veröffentlicht (${valueText(relation)})`);
  }
  for (const url of sourceUrls(term)) {
    if (!/^\/quellenarchiv\/[a-z0-9-]+\/?$/i.test(url)) {
      errors.push(`${id}: Quelle führt nicht über eine Detailseite im Quellenarchiv (${url})`);
    } else if (!localTargetExists(url)) {
      errors.push(`${id}: Quellenarchiv-Detailseite fehlt (${url})`);
    }
  }
}

if (JSON.stringify(terms).includes("[object Object]")) errors.push("Glossar-Register enthält [object Object]");
const relationReport = fs.existsSync(relationReportPath)
  ? JSON.parse(fs.readFileSync(relationReportPath, "utf8"))
  : { unresolvedRelations: [] };
for (const entry of relationReport.unresolvedRelations || []) {
  errors.push(`${entry.termId}: deklarierte Querverweise nicht eindeutig aufgelöst (${entry.unresolved.join(", ")})`);
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  terms: terms.length,
  errors,
  warnings,
  sourceCoverage: {
    linked: terms.filter(hasLinkedSource).length,
    missing: terms.filter((term) => !hasLinkedSource(term)).length,
  },
  sourceArchive: {
    generatedGlossaryRecords: generatedGlossarySourceSlugs.size,
    recordsWithResolvableLocator: glossarySourceRecords.filter((source) => String(source.url || source.doi || "").trim()).length,
    allPublishedSourceLinksUseArchive: errors.every((entry) => !entry.includes("Quelle führt nicht über eine Detailseite im Quellenarchiv")),
  },
  unresolvedRelationCount: (relationReport.unresolvedRelations || []).reduce((sum, entry) => sum + asArray(entry.unresolved).filter(Boolean).length, 0),
}, null, 2)}\n`);

if (errors.length) {
  console.error(`Glossar-Publikationsqualität fehlgeschlagen (${errors.length} Befunde):`);
  for (const error of errors.slice(0, 120)) console.error(`- ${error}`);
  if (errors.length > 120) console.error(`… ${errors.length - 120} weitere Befunde`);
  process.exit(1);
}

console.log(`Glossar-Publikationsqualität bestanden: ${terms.length} Begriffe, Canonicals, veröffentlichte Querverweise und Quellen-URLs geprüft.`);
if (warnings.length) console.warn(`Glossar-Qualitätsbacklog: ${warnings.length} transparent protokollierte Quellen-/Zuordnungsaufgaben in reports/glossary-publication-quality.json.`);
