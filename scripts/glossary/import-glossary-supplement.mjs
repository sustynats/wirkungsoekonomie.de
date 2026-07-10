import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DEFAULT_IMPORT_FILE = "content/glossary/imports/recht-wirtschaft-innovation-klima.json";
const IMPORT_FILE = process.env.GLOSSARY_IMPORT_FILE || DEFAULT_IMPORT_FILE;
const REGISTRY_FILE = path.join(ROOT, "assets/data/term-registry.json");
const DEFAULT_DATA_STAND = "2026-06-07";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(ROOT, filePath), "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function unique(values) {
  return Array.from(new Set((values || []).filter(Boolean).map((value) => String(value).trim()).filter(Boolean)));
}

function slugify(value) {
  return String(value || "")
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

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("de")
    .replace(/ß/g, "ss")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitList(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value || "")
    .split(/[,;·]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function aliasesForTitle(title) {
  const parts = String(title || "").split("/").map((item) => item.trim()).filter(Boolean);
  const aliases = [title, ...parts];
  if (/^Kipppunkte/i.test(title)) aliases.push("ökologische Kipppunkte", "Kipppunkte");
  if (/^Fremdenfeindlichkeit/i.test(title)) aliases.push("Xenophobie");
  if (/^Arbitrageur/i.test(title)) aliases.push("Arbitrageunternehmer", "Arbitrage");
  if (/^Schumpetersche Innovation/i.test(title)) aliases.push("Neue Kombination", "Innovation nach Schumpeter");
  if (/^Evolutionstheorie/i.test(title)) aliases.push("evolutorische Ökonomik", "evolutorische Oekonomik");
  if (/^St\. Galler/i.test(title)) aliases.push("St. Galler Management-Modell", "St. Gallen Management-Modell", "SGMM");
  if (/^Externalitäten/i.test(title)) aliases.push("externe Kosten", "Externalitaeten");
  if (/^Präventionsdividende/i.test(title)) aliases.push("vermiedene Schäden", "Praeventionsdividende");
  if (/^No-regret/i.test(title)) aliases.push("No regret Maßnahme", "No-regret-Massnahme");
  return unique(aliases);
}

function categoryForSection(section) {
  if (/WÖMS|Methodensystem|Kernmethoden|Canvas-Mindeststandard/i.test(section)) return "WÖMS Methodensystem";
  if (/WÖMM|Managementmodell|Managementarchitektur/i.test(section)) return "WÖMM Managementmodell";
  if (/Demokratie|Ausgrenzung/i.test(section)) return "Demokratie, Recht und gesellschaftliche Resilienz";
  if (/Unternehmertypen|Schumpeter|Röpke/i.test(section)) return "Innovation, Evolution und Unternehmertum";
  if (/Ökonomische Schulen|Ordnungspolitik|Management/i.test(section)) return "Wirtschaftssysteme, Kapitalmythen und Verteilungslogiken";
  if (/Strategie|Klimabegriffe/i.test(section)) return "Transformation, Innovation und Klimarisiken";
  return "Glossar-Erweiterung";
}

function typeForTerm(term) {
  if (/Walter Eucken|Ludwig Erhard/i.test(term.title)) return "Bezugslinie";
  if (/Wirkungspionier|Eigentum mit Wirkungspflicht|Produkt-Markt-Wirkungs-Fit/i.test(term.title)) return "WÖk-Präzisierungsbegriff";
  if (/WÖMS|Canvas|Persona|Design Thinking|Value Proposition|Methodenkreislauf|Workshop-Journey|Wirkungskompass|Systemlandkarte/i.test(`${term.title} ${term.section || ""}`)) return "Methodenbegriff";
  return "Anschlussbegriff";
}

const sourceCatalog = [
  {
    match: /Rechtsextremismus|Faschismus|Extremismus/i,
    sources: [
      "Bundeszentrale für politische Bildung: Rechtsextremismus|https://www.bpb.de/themen/rechtsextremismus/",
      "Bundesamt für Verfassungsschutz: Rechtsextremismus|https://www.verfassungsschutz.de/DE/themen/rechtsextremismus/rechtsextremismus_node.html",
    ],
  },
  {
    match: /Rassismus|Fremdenfeindlichkeit|Antidiskriminierung|gruppenbezogene Menschenfeindlichkeit|Xenophobie/i,
    sources: [
      "Antidiskriminierungsstelle des Bundes|https://www.antidiskriminierungsstelle.de/",
      "Bundeszentrale für politische Bildung: Rassismus|https://www.bpb.de/themen/rassismus-diskriminierung/",
    ],
  },
  {
    match: /Antisemitismus/i,
    sources: [
      "International Holocaust Remembrance Alliance: Working Definition of Antisemitism|https://holocaustremembrance.com/resources/working-definition-antisemitism",
      "Bundeszentrale für politische Bildung: Antisemitismus|https://www.bpb.de/themen/antisemitismus/",
    ],
  },
  {
    match: /Schumpeter|Innovation|Unternehmer|Röpke|Arbitrage|Kreislaufinnovation/i,
    sources: [
      "Joseph A. Schumpeter: Theorie der wirtschaftlichen Entwicklung (Bezugslinie)",
      "Jochen Röpke: Der lernende Unternehmer (Bezugslinie)",
    ],
  },
  {
    match: /Eucken|Ordoliberalismus|Soziale Marktwirtschaft|Ludwig Erhard/i,
    sources: [
      "Walter Eucken Institut|https://www.eucken.de/",
      "Bundeszentrale für politische Bildung: Soziale Marktwirtschaft|https://www.bpb.de/kurz-knapp/lexika/lexikon-der-wirtschaft/20592/soziale-marktwirtschaft/",
    ],
  },
  {
    match: /St\. Galler|Management/i,
    sources: [
      "Universität St. Gallen: St. Galler Management-Modell|https://www.unisg.ch/",
    ],
  },
  {
    match: /Value Proposition|Business Model Canvas|Design Thinking|Persona/i,
    sources: [
      "Strategyzer: Business Model Canvas|https://www.strategyzer.com/library/the-business-model-canvas",
      "Strategyzer: Value Proposition Canvas|https://www.strategyzer.com/library/the-value-proposition-canvas",
      "Stanford d.school|https://dschool.stanford.edu/",
    ],
  },
  {
    match: /Klimafolgeschäden|Klimarisiko|Kipppunkte|Handlungsfenster|Vorsorgeprinzip|No-regret|Präventionsdividende|Tipping Point/i,
    sources: [
      "IPCC AR6 Synthesis Report|https://www.ipcc.ch/report/ar6/syr/",
      "Umweltbundesamt: Gesellschaftliche Kosten von Umweltbelastungen|https://www.umweltbundesamt.de/themen/wirtschaft-konsum/wirtschaft-umwelt/gesellschaftliche-kosten-von-umweltbelastungen",
      "Potsdam-Institut für Klimafolgenforschung|https://www.pik-potsdam.de/",
    ],
  },
];

const manualReferenceMap = new Map([
  ["sdg 5", "sdgs"],
  ["sdg 10", "sdgs"],
  ["sdg 16", "sdgs"],
  ["sdg", "sdgs"],
  ["sdgs", "sdgs"],
  ["sdg+", "mensch-planet-demokratie"],
  ["agenda 2030", "sdgs"],
  ["wök", "wirkungsoekonomie"],
  ["woek", "wirkungsoekonomie"],
  ["dpp", "dpp"],
  ["digitaler produktpass", "dpp"],
  ["wök-id", "woek-id-2"],
  ["woek-id", "woek-id-2"],
  ["wustg", "wirkungsumsatzsteuer"],
  ["wstg", "wirkungssteuergesetz"],
  ["t-sroi", "t-sroi"],
  ["reverse merit order", "reverse-merit-order"],
  ["5. p = planet", "fuenftes-p-planet"],
  ["fuenftes p planet", "fuenftes-p-planet"],
  ["planetare grenzen", "planetare-grenzen"],
  ["nichtkompensation", "reverse-merit-order"],
  ["netto-wirkung", "netto-wirkung-2"],
  ["positive netto-wirkung", "positive-netto-wirkung"],
  ["wirkungspreis", "wirkungsrueckkopplung"],
  ["wirkungsstaat", "staat"],
  ["resilienzstaat", "staat"],
  ["anreizarchitektur", "wirkungsarchitektur"],
  ["bildung", "politische-bildung"],
  ["biodiversität", "biodiversitaet"],
  ["biodiversitaet", "biodiversitaet"],
  ["eu-rechtsanker", "eu-climate-law"],
  ["freiheit", "freiheit-markt-planwirtschaftsvorwurf"],
  ["gemeinwohlökonomie", "gemeinwohloekonomie"],
  ["gemeinwohloekonomie", "gemeinwohloekonomie"],
  ["generationenverantwortung", "generationengerechtigkeit"],
  ["governance", "wirkungsgovernance"],
  ["identitätspluralität", "pluralitaet"],
  ["identitaetspluralitaet", "pluralitaet"],
  ["identitätspluralitätsindex", "pluralitaet"],
  ["identitaetspluralitaetsindex", "pluralitaet"],
  ["kommune", "kommunale-energie"],
  ["kultur", "kultur-als-resonanzsystem"],
  ["kulturindustrie", "aufmerksamkeitsoekonomie"],
  ["lieferkette", "lieferkettenwirkung"],
  ["marktordnung", "ordoliberalismus"],
  ["migration", "integration-als-infrastruktur"],
  ["ökologische resilienz", "resilienz"],
  ["oekologische resilienz", "resilienz"],
  ["plattformökonomie", "plattformkapitalismus"],
  ["plattformoekonomie", "plattformkapitalismus"],
  ["polyzentrische governance", "wirkungsgovernance"],
  ["prototyp", "pilotprojekte"],
  ["rechtsstaat", "rechtsstaatlichkeit"],
  ["transformation", "transformationswirkung"],
  ["unternehmenszweck", "unternehmen-als-wirkungssystem"],
  ["verschwörungserzählung", "verschwoerungserzaehlung"],
  ["verschwoerungserzaehlung", "verschwoerungserzaehlung"],
  ["wachstum innerhalb planetarer grenzen", "regeneratives-wachstum"],
  ["wettbewerb", "wettbewerb-als-suchverfahren"],
  ["wettbewerbsordnung", "ordoliberalismus"],
  ["wirkung statt kapital", "kapitalwirkung"],
  ["wirkungsmarkt", "wirkungsrueckkopplung"],
  ["wirkungsökonomie", "wirkungsoekonomie"],
  ["wirkungsoekonomie", "wirkungsoekonomie"],
  ["wirkungswachstum", "regeneratives-wachstum"],
  ["wirtschaftswunder", "soziale-marktwirtschaft"],
  ["wkostg", "wirkungssteuergesetz"],
  ["wohlstand", "neue-ordnung-des-wohlstands"],
  ["wohnen", "wohnwirkung"],
  ["kommunale wirkung", "soziale-infrastruktur"],
  ["teilgabe", "teilhabe"],
  ["öffentlichkeit", "demokratische-oeffentlichkeit"],
  ["oeffentlichkeit", "demokratische-oeffentlichkeit"],
  ["diskursraum", "demokratische-oeffentlichkeit"],
  ["medienqualität", "medienfreiheit"],
  ["medienqualitaet", "medienfreiheit"],
  ["menschenbild", "mensch-planet-demokratie"],
  ["begrenzte rationalität", "rationalitaet"],
  ["begrenzte rationalitaet", "rationalitaet"],
  ["österreichische schule", "oesterreichische-schule"],
  ["oekosoziale marktwirtschaft", "oekosoziale-marktwirtschaft"],
  ["evolutorischer unternehmer", "evolutorischer-unternehmer"],
  ["innovativer unternehmer", "innovativer-unternehmer"],
  ["schumpeter", "joseph-schumpeter"],
  ["röpke", "jochen-roepke"],
  ["roepke", "jochen-roepke"],
  ["hayek", "friedrich-hayek"],
  ["ostrom", "elinor-ostrom"],
  ["luhmann", "niklas-luhmann"],
  ["bateson", "gregory-bateson"],
]);

function sourcesForTerm(term) {
  const haystack = `${term.title} ${term["Quellenhinweise"] || ""} ${term.section || ""}`;
  return unique(sourceCatalog.flatMap((entry) => entry.match.test(haystack) ? entry.sources : []));
}

function buildAliasMap(terms, importTerms) {
  const map = new Map(manualReferenceMap);
  const add = (label, slug) => {
    const key = normalizeKey(label);
    if (key && slug) map.set(key, slug);
  };
  for (const term of terms) {
    const slug = term.slug || slugify(term.canonicalLabel || term.label);
    add(term.canonicalLabel || term.label, slug);
    add(term.label, slug);
    add(slug, slug);
    for (const alias of [...(term.aliases || []), ...(term.synonyms || [])]) add(alias, slug);
  }
  for (const term of importTerms) {
    const slug = term.slug || slugify(term.title);
    add(term.title, slug);
    add(slug, slug);
    for (const alias of [...aliasesForTitle(term.title), ...(term.aliases || [])]) add(alias, slug);
  }
  return map;
}

function resolveRelatedTerms(value, aliasMap, missing) {
  return unique(splitList(value).map((label) => {
    const cleaned = label.replace(/\.$/, "").trim();
    const key = normalizeKey(cleaned);
    const direct = aliasMap.get(key);
    if (direct) return direct;
    const slug = slugify(cleaned);
    if (aliasMap.has(slug)) return aliasMap.get(slug);
    if (cleaned && !/^(intern|extern|kapitel|quelle|systemmodell|begriff|bezugslinie)$/i.test(cleaned)) {
      missing.add(cleaned);
    }
    return "";
  }));
}

function validateImport(data) {
  if (!Array.isArray(data.terms) || data.terms.length === 0) {
    throw new Error("Glossar-Import enthält keine terms.");
  }
  for (const [index, term] of data.terms.entries()) {
    for (const field of ["title", "Kurzdefinition", "WÖk-Verwendung", "Abgrenzung", "Querverweise"]) {
      if (!String(term[field] || "").trim()) {
        throw new Error(`Pflichtfeld fehlt in term ${index + 1}: ${field}`);
      }
    }
  }
}

function normalizeImportedTerm(raw, aliasMap, missingRelated) {
  const label = raw.title.trim();
  const slug = raw.slug || slugify(label);
  const aliases = unique([...aliasesForTitle(label), ...(raw.aliases || [])]);
  const relatedTerms = resolveRelatedTerms(raw.Querverweise, aliasMap, missingRelated);
  return {
    id: slug,
    termId: slug,
    label,
    canonicalLabel: label,
    slug,
    aliases,
    synonyms: aliases,
    shortDefinition: raw.Kurzdefinition.trim(),
    hoverDefinition: raw.Kurzdefinition.trim(),
    definition: raw.Kurzdefinition.trim(),
    longDefinition: raw.Kurzdefinition.trim(),
    woekRelation: raw["WÖk-Verwendung"].trim(),
    usageNote: raw["WÖk-Verwendung"].trim(),
    doNotConfuseWith: [raw.Abgrenzung.trim()],
    relatedTerms,
    officialSources: sourcesForTerm(raw),
    sourceNotes: raw.Quellenhinweise || "",
    category: categoryForSection(raw.section),
    type: typeForTerm(raw),
    status: "approved",
    version: "2.0",
    source: raw.section || "Glossar-Erweiterung Recht, Wirtschaft, Innovation, Klima",
    reviewStatus: "redaktionell synchronisiert",
    glossaryOrderKey: label,
    lastReviewed: DATA_STAND,
    sourceDocument: importData.sourceDocument || "",
    sourceSection: raw.section || "",
    importSource: IMPORT_FILE,
    importAction: raw.action,
    priority: /\bPriorität\s+A\b/i.test(raw.action) ? 10 : /\bPriorität\s+B\b/i.test(raw.action) ? 20 : 30,
    classicGlossary: true,
    showInHub: true,
    showHover: true,
    autoLinkAllowed: true,
    maxAutoLinksPerPage: 1,
  };
}

function mergeTerm(existing, imported) {
  const officialSources = imported.officialSources.length ? imported.officialSources : (existing.officialSources || []);
  return {
    ...existing,
    ...imported,
    aliases: unique([...(existing.aliases || []), ...(imported.aliases || [])]),
    synonyms: unique([...(existing.synonyms || []), ...(imported.synonyms || [])]),
    relatedTerms: unique([...(existing.relatedTerms || []), ...(imported.relatedTerms || [])]),
    officialSources,
    sourceNotes: imported.sourceNotes || existing.sourceNotes || "",
  };
}

const importData = readJson(IMPORT_FILE);
const DATA_STAND = importData.stand || process.env.GLOSSARY_IMPORT_STAND || DEFAULT_DATA_STAND;
validateImport(importData);

const registry = readJson(REGISTRY_FILE);
const terms = Array.isArray(registry) ? registry : registry.terms || [];
const aliasMap = buildAliasMap(terms, importData.terms);
const missingRelated = new Set();
const importedTerms = importData.terms.map((term) => normalizeImportedTerm(term, aliasMap, missingRelated));

const bySlug = new Map();
for (const [index, term] of terms.entries()) {
  bySlug.set(term.slug || slugify(term.canonicalLabel || term.label), index);
}

const added = [];
const updated = [];
for (const term of importedTerms) {
  const index = bySlug.get(term.slug);
  if (index >= 0) {
    terms[index] = mergeTerm(terms[index], term);
    updated.push(term.slug);
  } else {
    terms.push(term);
    bySlug.set(term.slug, terms.length - 1);
    added.push(term.slug);
  }
}

registry.generatedAt = new Date().toISOString();
const existingSourceNotes = String(registry.sourceNote || "").split(/\s*·\s*/);
const supersededSourceDocuments = importData.supersedesSourceDocuments || [];
registry.sourceNote = unique([
  ...existingSourceNotes.filter((note) => !supersededSourceDocuments.some((document) => note.startsWith(`${document} synchronisiert am `))),
  `${importData.sourceDocument || path.basename(IMPORT_FILE)} synchronisiert am ${DATA_STAND}`,
]).join(" · ");
registry.terms = terms;
writeJson(REGISTRY_FILE, registry);

function reportSlugForImport(filePath) {
  return path.basename(filePath, path.extname(filePath))
    .toLocaleLowerCase("de")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "glossar-import";
}

fs.mkdirSync(path.join(ROOT, "reports"), { recursive: true });
const reportTitle = importData.sourceDocument || path.basename(IMPORT_FILE);
const reportPath = path.join(ROOT, "reports", `glossary-import-${reportSlugForImport(IMPORT_FILE)}.md`);
fs.writeFileSync(reportPath, `# Glossar-Import ${reportTitle}

Stand: ${DATA_STAND}

- Importquelle: \`${IMPORT_FILE}\`
- Redaktionsquelle: ${importData.sourceDocument || "unbekannt"}
- Neue Begriffe: ${added.length}
- Aktualisierte Begriffe: ${updated.length}
- Offene Querverweise ohne Glossarziel: ${missingRelated.size}

## Neu angelegt

${added.map((slug) => `- /begriffe/${slug}/`).join("\n") || "- keine"}

## Aktualisiert

${updated.map((slug) => `- /begriffe/${slug}/`).join("\n") || "- keine"}

## Offene Querverweise

${Array.from(missingRelated).sort(new Intl.Collator("de", { sensitivity: "base" }).compare).map((label) => `- ${label}`).join("\n") || "- keine"}

## Standardprozess

1. Redaktionsquelle in eine strukturierte Importdatei unter \`content/glossary/imports/\` überführen.
2. \`GLOSSARY_IMPORT_FILE=... node scripts/glossary/import-glossary-supplement.mjs\` ausführen.
3. \`npm run glossary:build\` ausführen.
4. \`npm run check:glossary && npm run check:glossary-alpha && npm run check:hover-definitions && npm run check:search\` ausführen.
5. Commit, Push auf \`main\`, GitHub Pages Deploy abwarten, Live-URLs prüfen.
`);

console.log(JSON.stringify({
  importFile: IMPORT_FILE,
  added: added.length,
  updated: updated.length,
  missingRelated: missingRelated.size,
  report: path.relative(ROOT, reportPath),
}, null, 2));
