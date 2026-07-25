import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, "assets/data/term-registry.json");
const supplementSources = [
  path.join(root, "content/glossary/imports/wirkungsfinanzpolitik-term-definitions.json"),
  path.join(root, "content/glossary/imports/legacy-detail-definitions.json"),
];
const out = path.join(root, "public/data/glossary.terms.json");
const historyOut = path.join(root, "public/data/glossary-version-history.json");
const hoverOut = path.join(root, "assets/js/glossaryTerms.js");

const collator = new Intl.Collator("de", { sensitivity: "base", numeric: true });
const allowedContexts = ["home", "page", "reference", "blog", "academy", "method", "glossary"];

const groupAliases = new Map([
  ["Lieferketten und Sorgfalt", "Lieferketten und Sorgfaltspflichten"],
  ["Kommunikation und Greenwashing", "Kommunikation, Claims und Greenwashing"],
]);

function unique(values) {
  return Array.from(new Set((values || []).filter(Boolean).map((value) => String(value).trim()).filter(Boolean)));
}

function stripTags(value) {
  return String(value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeKey(value) {
  return stripTags(value)
    .toLocaleLowerCase("de")
    .replace(/ß/g, "ss")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return stripTags(value)
    .replace(/\([^)]*\)/g, "")
    .split("/")[0]
    .trim()
    .toLocaleLowerCase("de")
    .replace(/&/g, " und ")
    .replace(/ß/g, "ss")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-") || "begriff";
}

function categoryFor(term) {
  const section = String(term.sourceSection || "").toLowerCase();
  const id = String(term.termId || term.id || "").toLowerCase();
  if (section.includes("governance") || ["wirkungsrat", "wirkungswahrheit", "social-credit"].includes(id)) return "Schutzbegriff";
  if (
    section.includes("daten") ||
    ["woek-id", "digitaler-produktpass", "wirkungsdaten", "wirkungsdatenraum", "nace", "esrs", "gri", "csrd"].includes(id)
  ) {
    return "Datenbegriff";
  }
  if (section.includes("instrument") || ["nwi", "t-sroi", "finalscore", "scorecard", "benchmark", "host-wirkungsscore"].includes(id)) return "Messbegriff";
  if (["wirkungssteuer", "wirkungssteuergesetz", "wirkungsumsatzsteuer", "wirkungslenkung", "wirkungshaushalt"].includes(id)) return "Steuerungsbegriff";
  if (["wirkungsarchitektur", "wirkungsnetz", "wirkungsraum", "resonanzraum", "resonanzarchitektur", "social-taxonomy"].includes(id)) return "Architekturbegriff";
  if (["sdg-plus", "mensch-planet-demokratie", "demokratie"].includes(id)) return "Demokratiebegriff";
  if (
    [
      "positive-netto-wirkung",
      "netto-wirkung",
      "positive-wirkung",
      "negative-wirkung",
      "neutrale-wirkung",
      "reverse-merit-order",
      "nichtkompensationsprinzip",
      "wirkungsgrenze",
    ].includes(id)
  ) {
    return "Bewertungsbegriff";
  }
  if (["wirkungseinkommen", "wirkungsrente", "wirkungspunkte", "wirkungsorientiertes-hosting"].includes(id)) return "Praxisbegriff";
  return "Grundbegriff";
}

function normalizeGroup(group) {
  return groupAliases.get(group) || group || "";
}

function isDataStandardsTerm(term) {
  return (
    term.showInCategoryGlossary === true ||
    Boolean(term.dataStandardsGroup) ||
    (term.categories || []).includes("daten-standards-regularien")
  );
}

function normalizeTerm(rawTerm, index) {
  const label = rawTerm.canonicalLabel || rawTerm.label || rawTerm.term || rawTerm.id || `Begriff ${index + 1}`;
  const id = rawTerm.termId || rawTerm.id || slugify(label);
  const slug = rawTerm.slug || slugify(label);
  const dataStandardsGroup = normalizeGroup(rawTerm.dataStandardsGroup);
  const aliases = unique([label, ...(rawTerm.aliases || []), ...(rawTerm.synonyms || [])]);
  const categories = unique(rawTerm.categories || []);
  const shortDefinition = rawTerm.shortDefinition || rawTerm.hoverDefinition || rawTerm.definition || rawTerm.longDefinition || rawTerm.woekRelation || "";
  const longDefinition = rawTerm.longDefinition || rawTerm.definition || rawTerm.woekRelation || rawTerm.shortDefinition || rawTerm.hoverDefinition || "";
  const sourceFallback = rawTerm.source
    || rawTerm.sourceSection
    || rawTerm.sourceDocument
    || rawTerm.importSource
    || rawTerm.sourceNote
    || rawTerm.sourceNotes
    || (rawTerm.officialSources || [])[0]
    || rawTerm.category
    || "WÖk-Begriffsleitfaden";
  const normalized = {
    ...rawTerm,
    id,
    termId: id,
    label,
    canonicalLabel: label,
    slug,
    aliases,
    synonyms: aliases,
    status: rawTerm.status || "approved",
    version: rawTerm.version || "1.0",
    source: sourceFallback,
    shortDefinition,
    hoverDefinition: rawTerm.hoverDefinition || shortDefinition,
    definition: rawTerm.definition || longDefinition || shortDefinition,
    longDefinition,
    woekRelation: rawTerm.woekRelation || longDefinition || rawTerm.definition || shortDefinition,
    reviewStatus: rawTerm.reviewStatus || "redaktionell synchronisiert",
    statusNote: rawTerm.statusNote || "",
    usageNote: rawTerm.usageNote || rawTerm.statusNote || "",
    pageUrl: rawTerm.pageUrl || `/begriffe/${slug}/`,
    classicGlossary: rawTerm.classicGlossary !== false,
    showInCategoryGlossary: rawTerm.showInCategoryGlossary === true,
    dataStandardsGroup,
    category: rawTerm.category || categoryFor(rawTerm),
    sourceSection: rawTerm.sourceSection || (dataStandardsGroup ? `Daten, Standards und Regularien · ${dataStandardsGroup}` : rawTerm.source || ""),
    glossaryOrderKey: rawTerm.glossaryOrderKey || label,
    priority: Number.isFinite(rawTerm.priority) ? rawTerm.priority : index + 1,
    relatedTerms: unique(rawTerm.relatedTerms || []),
    officialSources: unique(rawTerm.officialSources || []),
    relatedDocuments: unique(rawTerm.relatedDocuments || []),
    doNotConfuseWith: unique(rawTerm.doNotConfuseWith || []),
    deprecatedUsage: unique(rawTerm.deprecatedUsage || []),
  };

  if (isDataStandardsTerm(normalized)) {
    normalized.categories = unique([...categories, "daten-standards-regularien"]);
    normalized.showInCategoryGlossary = true;
    normalized.classicGlossary = true;
  } else {
    normalized.categories = categories.length ? categories : [slugify(normalized.category)];
  }

  return normalized;
}

function termCompletenessScore(term) {
  return [
    term.status,
    term.version,
    term.source,
    term.hoverDefinition,
    term.reviewStatus,
    term.longDefinition,
    term.woekRelation,
  ].filter(Boolean).length
    + (term.version === "2.0" ? 5 : 0)
    + (term.status === "approved" ? 3 : 0)
    + (Array.isArray(term.deepGlossarySections) ? Math.min(term.deepGlossarySections.length, 6) : 0)
    + (Array.isArray(term.officialSources) ? Math.min(term.officialSources.length, 6) : 0)
    + (Array.isArray(term.relatedTerms) ? Math.min(term.relatedTerms.length, 6) : 0);
}

function mergeTermData(primary, secondary) {
  const merged = {
    ...secondary,
    ...primary,
    aliases: unique([...(primary.aliases || []), ...(secondary.aliases || [])]),
    synonyms: unique([...(primary.synonyms || []), ...(secondary.synonyms || [])]),
    categories: unique([...(primary.categories || []), ...(secondary.categories || [])]),
    relatedTerms: unique([...(primary.relatedTerms || []), ...(secondary.relatedTerms || [])]),
    officialSources: unique([...(primary.officialSources || []), ...(secondary.officialSources || [])]),
    relatedDocuments: unique([...(primary.relatedDocuments || []), ...(secondary.relatedDocuments || [])]),
    doNotConfuseWith: unique([...(primary.doNotConfuseWith || []), ...(secondary.doNotConfuseWith || [])]),
    deprecatedUsage: unique([...(primary.deprecatedUsage || []), ...(secondary.deprecatedUsage || [])]),
  };
  if (!merged.deepGlossarySections?.length && secondary.deepGlossarySections?.length) {
    merged.deepGlossarySections = secondary.deepGlossarySections;
  }
  if (!merged.examples?.length && secondary.examples?.length) {
    merged.examples = secondary.examples;
  }
  return merged;
}

function dedupeCanonicalLabels(terms) {
  const byLabel = new Map();
  for (const term of terms) {
    const key = normalizeKey(term.canonicalLabel);
    if (!key || !byLabel.has(key)) {
      byLabel.set(key, term);
      continue;
    }
    const existing = byLabel.get(key);
    const primary = termCompletenessScore(term) >= termCompletenessScore(existing) ? term : existing;
    const secondary = primary === term ? existing : term;
    byLabel.set(key, mergeTermData(primary, secondary));
  }
  return Array.from(byLabel.values());
}

const raw = JSON.parse(fs.readFileSync(source, "utf8"));
const rawTerms = [
  ...(Array.isArray(raw) ? raw : raw.terms || []),
  ...supplementSources.flatMap((file) => {
    if (!fs.existsSync(file)) return [];
    const supplement = JSON.parse(fs.readFileSync(file, "utf8"));
    return Array.isArray(supplement) ? supplement : supplement.terms || [];
  }),
];
const terms = dedupeCanonicalLabels(rawTerms.map(normalizeTerm))
  .sort((a, b) => collator.compare(a.glossaryOrderKey || a.canonicalLabel, b.glossaryOrderKey || b.canonicalLabel));

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify({ generatedAt: new Date().toISOString(), terms }, null, 2)}\n`);

const hoverTerms = terms
  .filter((term) => term.classicGlossary !== false)
  .map((term, index) => ({
    key: term.termId,
    label: term.canonicalLabel,
    aliases: term.autoLinkAliases || term.synonyms || [],
    definition: term.hoverDefinition || term.shortDefinition,
    url: term.pageUrl || `/begriffe/${term.slug}/`,
    priority: index + 1,
    autoLinkAllowed: term.autoLinkAllowed !== false,
    maxAutoLinksPerPage: Number.isFinite(term.maxAutoLinksPerPage) ? term.maxAutoLinksPerPage : undefined,
    allowedContexts,
  }));

fs.mkdirSync(path.dirname(hoverOut), { recursive: true });
fs.writeFileSync(hoverOut, `window.WIRKUNG_GLOSSARY_TERMS = ${JSON.stringify(hoverTerms, null, 2)};\n`);

const history = {
  generatedAt: new Date().toISOString(),
  entries: [
    {
      date: "2026-05-27",
      type: "single-source-term-registry",
      source: path.relative(root, source),
      status: "approved",
      reason: "Klassisches Glossar und thematische Glossarbereiche werden aus derselben Term-Registry erzeugt.",
      affectedTerms: terms.map((term) => term.termId),
    },
  ],
};
fs.writeFileSync(historyOut, `${JSON.stringify(history, null, 2)}\n`);

const dataCount = terms.filter(isDataStandardsTerm).length;
console.log(
  `Wrote ${terms.length} glossary terms (${dataCount} data/standards terms) to ${path.relative(root, out)} and hover terms to ${path.relative(root, hoverOut)}.`
);
