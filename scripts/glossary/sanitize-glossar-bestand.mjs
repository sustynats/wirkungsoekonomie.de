import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const registryPath = path.join(root, "assets/data/term-registry.json");
const masterPath = path.join(root, "assets/data/glossar-bestand-definitionsmaster.json");
const glossaryDir = path.join(root, "begriffe");
const auditPath = path.join(root, "glossar-bestand-audit.json");

const placeholderPatterns = [
  /Glossar-Bestand/i,
  /Version Bestand/i,
  /Begriffsreferenz der Wirkungsökonomie/i,
  /Der Begriff gehört zum Bereich Glossar-Bestand/i,
  /Bestand Stand\s*\/\s*Version Bestand/i,
  /Stand\s*\/\s*Version Bestand/i,
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function stripTags(value) {
  return String(value ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
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

function firstMatch(html, pattern) {
  const match = html.match(pattern);
  return match ? stripTags(match[1]) : "";
}

function trimMeta(value, limit = 180) {
  const text = stripTags(value);
  if (text.length <= limit) return text;
  const shortened = text.slice(0, limit - 1);
  const cut = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, cut > 90 ? cut : shortened.length).trim()}…`;
}

function splitLinks(value) {
  return String(value || "")
    .split(/[;\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function unique(values) {
  return Array.from(new Set((values || []).map((value) => String(value || "").trim()).filter(Boolean)));
}

function categoryFor(master) {
  const raw = String(master.category || "").trim();
  const lower = raw.toLocaleLowerCase("de");
  if (lower.includes("mess")) return "Messbegriff";
  if (lower.includes("steuer")) return "Steuerungsbegriff";
  if (lower.includes("institution") || lower.includes("demokratie")) return "Demokratiebegriff";
  if (lower.includes("finanz") || lower.includes("schulden")) return "Wirkungsfinanzpolitik";
  if (lower.includes("bewert")) return "Bewertungsbegriff";
  if (lower.includes("daten")) return "Datenbegriff";
  if (lower.includes("schutz")) return "Schutzbegriff";
  return raw && !placeholderPatterns.some((pattern) => pattern.test(raw)) ? raw : "Glossarbegriff";
}

function aliasesFor(master) {
  const aliases = [master.term];
  if (master.slug === "woek") aliases.push("Wirkungsökonomie", "WÖk", "Wirkungsoekonomie");
  if (master.slug === "wr") aliases.push("Wirkungsrat", "WR");
  if (master.slug === "dsa") aliases.push("Digital Services Act", "DSA");
  if (master.slug === "dsgvo") aliases.push("Datenschutz-Grundverordnung", "DSGVO");
  if (master.slug === "adoe") aliases.push("Agentur für Digitale Öffentlichkeit", "ADÖ");
  if (master.slug === "waok") aliases.push("Wirkungsaufsicht für Kapital", "WAOK");
  return unique(aliases);
}

function buildRelated(master, slugByLabel, allSlugs) {
  const standard = [
    "wirkung",
    "positive-netto-wirkung",
    "mensch-planet-demokratie",
    "sdgs",
    "agenda-2030",
    "sdg-plus",
    "wirkungsoekonomie",
  ];
  const mapped = splitLinks(master.links)
    .map((label) => slugByLabel.get(normalizeKey(label)) || slugify(label))
    .filter((slug) => allSlugs.has(slug));
  if (master.slug === "woek") mapped.unshift("wirkungsoekonomie");
  if (master.slug === "wr") mapped.unshift("wirkungsrat");
  if (master.slug === "dsa") mapped.unshift("plattformregulierung", "digitale-oeffentlichkeit");
  if (master.slug === "dsgvo") mapped.unshift("datenschutz", "digitale-oeffentlichkeit");
  if (master.slug === "adoe") mapped.unshift("digitale-oeffentlichkeit", "wirkungsrat");
  if (master.slug === "waok") mapped.unshift("wirkungsaufsicht", "wirkungsrat");
  return unique([...mapped, ...standard.filter((slug) => slug !== master.slug && allSlugs.has(slug))]).slice(0, 14);
}

function upsertMasterTerm(existing, master, relatedTerms) {
  const definition = stripTags(master.definition);
  const use = stripTags(master.use);
  const category = categoryFor(master);
  const aliases = aliasesFor(master);
  const label = stripTags(master.term);
  const sourceDocument = "Definitionsmaster WÖk v1";
  const sourceSection = stripTags(master.cluster || "Glossar-Sanierung");
  const longDefinition = use
    ? `${definition}\n\nIn der Wirkungsökonomie wird der Begriff verwendet, um Wirkungen als tatsächliche Zustandsveränderungen sichtbar, bewertbar und rückkopplungsfähig zu machen. Positive Wirkung wird am Referenzrahmen SDGs, Agenda 2030 und SDG+ eingeordnet; als Zielgröße dient positive Netto-Wirkung für Mensch, Planet und Demokratie.`
    : definition;
  return {
    ...(existing || {}),
    id: master.slug,
    termId: master.slug,
    label,
    canonicalLabel: label,
    slug: master.slug,
    aliases: unique([...(existing?.aliases || []), ...aliases]),
    synonyms: unique([...(existing?.synonyms || []), ...aliases]),
    shortDefinition: definition,
    hoverDefinition: definition,
    definition,
    longDefinition,
    woekRelation: use || `Der Begriff wird in der Wirkungsökonomie danach eingeordnet, welche Zustandsveränderung er beschreibt, welche Bilanzgrenze gilt und wie die Wirkung rückgekoppelt werden kann.`,
    usageNote: use || `Den Begriff nur mit klarer Wirkungsfrage, Bilanzgrenze und Bezug zu Mensch, Planet und Demokratie verwenden.`,
    doNotConfuseWith: unique([
      ...(existing?.doNotConfuseWith || []),
      "Nicht als bloße Absicht, Imagewirkung oder Outputkennzahl verwenden.",
      "Nicht mit positiver Netto-Wirkung gleichsetzen; die Bewertung erfolgt erst über Referenzrahmen, Bilanzgrenze, Datenqualität und Rückkopplung.",
      "Nicht als Personenbewertung, moralische Rangliste oder Social-Credit-Logik verwenden.",
    ]),
    category,
    type: category,
    cluster: sourceSection,
    theme: sourceSection,
    source: sourceDocument,
    sourceDocument,
    sourceSection,
    version: "Glossar-Sanierung v1",
    status: "approved",
    reviewStatus: "redaktionell aus Definitionsmaster übernommen",
    conceptStatus: "WÖk-Arbeitsbegriff",
    classicGlossary: true,
    showInCategoryGlossary: existing?.showInCategoryGlossary === true,
    autoLinkAllowed: existing?.autoLinkAllowed !== false,
    relatedTerms,
    categories: unique([...(existing?.categories || []), slugify(category)]),
    metaTitle: `${label} | Glossar der Wirkungsökonomie`,
    metaDescription: trimMeta(definition),
    glossaryOrderKey: existing?.glossaryOrderKey || label,
  };
}

function auditExistingPages(masterBySlug) {
  const results = [];
  if (!fs.existsSync(glossaryDir)) return results;
  for (const entry of fs.readdirSync(glossaryDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = path.join(glossaryDir, entry.name, "index.html");
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, "utf8");
    const problems = placeholderPatterns
      .filter((pattern) => pattern.test(html))
      .map((pattern) => pattern.source.replace(/\\/g, ""));
    if (!problems.length) continue;
    const h1 = firstMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const title = firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i).replace(/\s*[|-]\s*Glossar.*$/i, "");
    const hasMasterDefinition = masterBySlug.has(entry.name);
    results.push({
      slug: entry.name,
      term: h1 || title || entry.name,
      problem: unique(problems),
      has_master_definition: hasMasterDefinition,
      action: hasMasterDefinition ? "replace" : "todo",
    });
  }
  return results.sort((a, b) => a.slug.localeCompare(b.slug, "de"));
}

function auditBaselinePages(masterBySlug) {
  let files = [];
  try {
    files = execFileSync("git", ["ls-tree", "-r", "--name-only", "HEAD", "begriffe"], {
      cwd: root,
      encoding: "utf8",
    }).split("\n").filter((file) => file.endsWith("/index.html"));
  } catch {
    return [];
  }
  const results = [];
  for (const file of files) {
    let html = "";
    try {
      html = execFileSync("git", ["show", `HEAD:${file}`], {
        cwd: root,
        encoding: "utf8",
        maxBuffer: 20 * 1024 * 1024,
      });
    } catch {
      continue;
    }
    const problems = placeholderPatterns
      .filter((pattern) => pattern.test(html))
      .map((pattern) => pattern.source.replace(/\\/g, ""));
    if (!problems.length) continue;
    const slug = file.replace(/^begriffe\//, "").replace(/\/index\.html$/, "");
    const h1 = firstMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const title = firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i).replace(/\s*[|-]\s*Glossar.*$/i, "");
    const hasMasterDefinition = masterBySlug.has(slug);
    results.push({
      slug,
      term: h1 || title || slug,
      problem: unique(problems),
      has_master_definition: hasMasterDefinition,
      action: hasMasterDefinition ? "replace" : "todo",
    });
  }
  return results.sort((a, b) => a.slug.localeCompare(b.slug, "de"));
}

const master = readJson(masterPath);
const registry = readJson(registryPath);
const terms = Array.isArray(registry) ? registry : registry.terms || [];
const masterBySlug = new Map(master.map((item) => [item.slug, item]));
const audit = auditExistingPages(masterBySlug);
const baselineAudit = audit.length ? audit : auditBaselinePages(masterBySlug);

const slugByLabel = new Map();
for (const term of terms) {
  for (const label of [term.canonicalLabel, term.label, ...(term.aliases || []), ...(term.synonyms || [])]) {
    const key = normalizeKey(label);
    if (key && !slugByLabel.has(key)) slugByLabel.set(key, term.slug);
  }
}
for (const item of master) {
  for (const label of aliasesFor(item)) {
    const key = normalizeKey(label);
    if (key) slugByLabel.set(key, item.slug);
  }
}

const allSlugs = new Set([...terms.map((term) => term.slug), ...master.map((term) => term.slug)]);
const bySlug = new Map(terms.map((term) => [term.slug, term]));
for (const item of master) {
  const relatedTerms = buildRelated(item, slugByLabel, allSlugs);
  bySlug.set(item.slug, upsertMasterTerm(bySlug.get(item.slug), item, relatedTerms));
}

const nextTerms = Array.from(bySlug.values()).sort((a, b) =>
  String(a.glossaryOrderKey || a.canonicalLabel || a.slug).localeCompare(String(b.glossaryOrderKey || b.canonicalLabel || b.slug), "de", { sensitivity: "base", numeric: true })
);

if (Array.isArray(registry)) {
  writeJson(registryPath, nextTerms);
} else {
  writeJson(registryPath, {
    ...registry,
    generatedAt: new Date().toISOString(),
    sourceNote: "Single Source Term Registry; ergänzt durch Glossar-Sanierung aus Definitionsmaster v1.",
    terms: nextTerms,
  });
}

writeJson(auditPath, {
  generatedAt: new Date().toISOString(),
  source: "assets/data/glossar-bestand-definitionsmaster.json",
  basis: audit.length ? "working-tree-before-build" : "git-head-before-sanitation",
  summary: {
    found_placeholder_pages: baselineAudit.length,
    with_master_definition: baselineAudit.filter((item) => item.has_master_definition).length,
    open_editorial_todos: baselineAudit.filter((item) => item.action === "todo").length,
    master_terms_imported: master.length,
  },
  entries: baselineAudit,
});

console.log(`Glossar-Bestand-Sanierung: ${master.length} Masterbegriffe importiert, ${baselineAudit.length} Platzhalterseiten auditiert.`);
