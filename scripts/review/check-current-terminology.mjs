import fs from "node:fs";
import path from "node:path";

const glossaryPath = "public/data/glossary.terms.json";
const errors = [];

if (!fs.existsSync(glossaryPath)) {
  console.error(`Missing generated glossary registry: ${glossaryPath}`);
  process.exit(1);
}

const terms = JSON.parse(fs.readFileSync(glossaryPath, "utf8")).terms || [];
const byId = new Map(terms.map((term) => [term.termId || term.id || term.slug, term]));

function allText(term) {
  return [
    term.shortDefinition,
    term.hoverDefinition,
    term.definition,
    term.longDefinition,
    term.woekRelation,
    term.statusNote,
    term.usageNote,
    term.preferredUsage,
    ...(term.doNotConfuseWith || []),
  ].filter(Boolean).join(" ");
}

function requireTerm(id) {
  const term = byId.get(id);
  if (!term) errors.push(`${id}: missing canonical glossary term`);
  return term;
}

function expectText(id, description, pattern) {
  const term = requireTerm(id);
  if (term && !pattern.test(allText(term))) {
    errors.push(`${id}: ${description}`);
  }
}

function sourceUrl(value) {
  if (value && typeof value === "object") return String(value.url || value.href || value.pageUrl || "").trim();
  const raw = String(value || "").trim();
  return raw.includes("|") ? raw.slice(raw.lastIndexOf("|") + 1).trim() : raw;
}

function sourceEntries(term) {
  return [
    ...(term.officialSources || []),
    ...(term.curatedSources || term.curated_sources || []),
    ...(term.sourceLinks || term.source_links || []),
  ];
}

function requireArchiveSources(id) {
  const term = requireTerm(id);
  if (!term) return;
  const entries = sourceEntries(term);
  if (!entries.length) {
    errors.push(`${id}: needs at least one linked source`);
    return;
  }
  for (const entry of entries) {
    const url = sourceUrl(entry);
    if (!/^\/quellenarchiv\/[a-z0-9-]+\/$/i.test(url)) {
      errors.push(`${id}: public source must use a Quellenarchiv detail page, found ${url || "no URL"}`);
    }
  }
}

function pageFile(term) {
  const route = String(term.pageUrl || `/begriffe/${term.slug}/`).replace(/^\/+|\/+$/g, "");
  return path.join(route, "index.html");
}

function requirePublishedPage(id) {
  const term = requireTerm(id);
  if (!term) return null;
  const file = pageFile(term);
  if (!fs.existsSync(file)) {
    errors.push(`${id}: missing published detail page ${file}`);
    return null;
  }
  return { term, file, html: fs.readFileSync(file, "utf8") };
}

function requirePageLink(fromId, toId) {
  const page = requirePublishedPage(fromId);
  const target = requireTerm(toId);
  if (!page || !target) return;
  const targetRoute = `/begriffe/${target.slug}/`;
  if (!new RegExp(`href=["'][^"']*${targetRoute.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i").test(page.html)) {
    errors.push(`${fromId}: missing visible cross-link to ${toId}`);
  }
}

// The core assertions deliberately use the public generated registry. That is
// the layer from which detail pages, hover definitions, search and exports are
// made; old import fragments must never be able to alter these distinctions.
const requiredPhrases = [
  ["wirkung", "must define Wirkung as a real state change", /tatsächliche Veränderung von Zuständen/i],
  ["wirkung", "must state that Wirkung is neutral and relational", /neutral und relational/i],
  ["wirkung", "must allow positive, negative and neutral Wirkung", /positiv, negativ oder neutral/i],
  ["wirkungspotenzial", "must identify a possibility rather than a fact", /Möglichkeit|mögliche künftige/i],
  ["wirkungspotenzial", "must state that it is not yet entered Wirkung", /noch keine eingetretene Wirkung/i],
  ["wirkungsrisiko", "must describe a possibility of negative change", /Möglichkeit[\s\S]{0,180}(?:negativ|schädlich|destabilisierend)/i],
  ["positive-netto-wirkung", "must be the target size", /Zielgröße|Zielgroesse/i],
  ["positive-netto-wirkung", "must retain the non-compensation protection", /(?:ohne schwere nicht kompensierbare Schäden|kritische Schäden[\s\S]{0,80}(?:nicht|ohne)[\s\S]{0,50}(?:kompens|überdeck))/i],
  ["reichweite", "must define a contact or distribution metric", /Kontakt|Verteilung|Outputkennzahl/i],
  ["reichweite", "must explicitly separate reach from Wirkung", /(?:nicht|weder)[\s\S]{0,80}Wirkung|Wirkung[\s\S]{0,80}(?:nicht|weder)/i],
  ["reporting", "must identify documentation rather than Wirkung", /dokumentiert|Dokumentation|Offenlegung/i],
  ["reporting", "must explicitly separate reporting from Wirkungsrückkopplung", /(?:weder|nicht)[\s\S]{0,100}Wirkungsrückkopplung|Wirkungsrückkopplung[\s\S]{0,100}(?:erst|nicht)/i],
  ["wirkungslenkung", "must name goals, protection limits and instruments", /Ziele[\s\S]{0,120}Schutzgrenzen[\s\S]{0,120}Instrument/i],
  ["wirkungslenkung", "must distinguish itself from later feedback", /nicht[\s\S]{0,80}(?:Rückmeldung|Rückkopplung)/i],
  ["wirkungsrueckkopplung", "must describe a learning mechanism based on observations", /Lernmechanismus|Beobachtung/i],
  ["wirkungsrueckkopplung", "must not set goals or instruments itself", /(?:nicht|keine)[\s\S]{0,100}(?:Ziele|Instrumente)/i],
  ["wirkungsrueckkopplung", "must distinguish itself from reporting", /Reporting/i],
  ["transformationswirkung", "must require an actual structural state change", /(?:tatsächlich|eingetreten)[\s\S]{0,180}(?:Struktur|Regeln|Standards|Anreize|Infrastruktur)/i],
  ["transformationswirkung", "must mark expected structural change as potential or scenario", /(?:Erwartung|erwartete|Szenario)[\s\S]{0,120}(?:Potenzial|keine Transformationswirkung)/i],
  ["transformationswirkung", "must state that T-SROI is not proof of transformation", /T-SROI[\s\S]{0,180}(?:nicht|keine)[\s\S]{0,90}(?:beweist|Beweis|Nachweis)/i],
  ["wirkstoff", "must frame Wirkstoff as an analogy", /Analogie|analogie/i],
  ["wirkstoff", "must state that Wirkstoff is not Wirkung", /nicht selbst Wirkung|kein Nachweis eingetretener Wirkung/i],
  ["social-credit", "must exclude Social-Credit and behaviour scores from WÖk", /kein Social-Credit-System|Social-Credit-[\s\S]{0,60}ausgeschlossen|bewertet keine Menschen/i],
  ["personenbewertung", "must exclude person scoring from WÖk", /keine Personen-[, ]|keine Personenbewertung|niemals[\s\S]{0,80}Person/i],
];

for (const [id, description, pattern] of requiredPhrases) expectText(id, description, pattern);

const coreIds = [
  "wirkung",
  "wirkungspotenzial",
  "wirkungsrisiko",
  "positive-netto-wirkung",
  "reichweite",
  "reporting",
  "wirkungslenkung",
  "wirkungsrueckkopplung",
  "transformationswirkung",
  "wirkstoff",
  "social-credit",
  "personenbewertung",
];
for (const id of coreIds) requireArchiveSources(id);

const crossLinks = [
  ["wirkung", "wirkungspotenzial"],
  ["wirkung", "wirkungsrisiko"],
  ["wirkung", "positive-netto-wirkung"],
  ["wirkungspotenzial", "wirkung"],
  ["wirkungspotenzial", "wirkungsrisiko"],
  ["wirkungsrisiko", "wirkung"],
  ["reichweite", "wirkung"],
  ["reichweite", "wirkungspotenzial"],
  ["reporting", "wirkungsbewertung"],
  ["reporting", "wirkungslenkung"],
  ["reporting", "wirkungsrueckkopplung"],
  ["wirkungslenkung", "reporting"],
  ["wirkungslenkung", "wirkungsrueckkopplung"],
  ["wirkungsrueckkopplung", "reporting"],
  ["wirkungsrueckkopplung", "wirkungslenkung"],
  ["transformationswirkung", "wirkungspotenzial"],
  ["transformationswirkung", "t-sroi"],
  ["social-credit", "personenbewertung"],
  ["personenbewertung", "social-credit"],
];
for (const [from, to] of crossLinks) requirePageLink(from, to);

const ignoredDirectories = new Set([".git", "node_modules", "_site"]);
const htmlFiles = [];
function collectHtml(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirectories.has(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) collectHtml(file);
    else if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(file);
  }
}
collectHtml(".");

function isNoindex(html) {
  return /<meta\b[^>]*\bname=["']robots["'][^>]*\bcontent=["'][^"']*\bnoindex\b/i.test(html)
    || /<meta\b[^>]*\bcontent=["'][^"']*\bnoindex\b[^"']*["'][^>]*\bname=["']robots["']/i.test(html);
}

function cleanHtml(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&(?:amp|quot|apos|lt|gt);/gi, " ")
    .replace(/\s+/g, " ");
}

function hasNegationNear(text, start, end) {
  const context = text.slice(Math.max(0, start - 130), Math.min(text.length, end + 130));
  return /\b(?:nicht|nie|kein(?:e|en|em|er|es)?|weder|ohne|ausgeschlossen|verboten)\b/i.test(context);
}

function isExplicitlyFramedClaim(text, start, end) {
  const context = text.slice(Math.max(0, start - 150), Math.min(text.length, end + 150));
  // Debattenkarten may quote a claim precisely in order to analyse and reject
  // it. A question, a labelled claim or a frame is not an editorial assertion.
  return /\?|\b(?:Behauptung|Frame|Narrativ|Frage|Sprechsatz|Nicht übernehmen|Auslöser|Verkürzung)\b/i.test(context);
}

const publicContradictions = [
  {
    id: "wirkung-automatically-positive",
    pattern: /\bWirkung\s+(?:ist|bleibt|wird)\s+(?:immer|grundsätzlich|per\s+se)\s+positiv\b/gi,
  },
  {
    id: "wirkungspotenzial-as-entered-wirkung",
    pattern: /\bWirkungspotenzial\s*(?:ist|=|bedeutet)\s*(?:eine\s+)?(?:tatsächliche|eingetretene)\s+Wirkung\b/gi,
  },
  {
    id: "wirkungsrisiko-as-entered-harm",
    pattern: /\bWirkungsrisiko\s*(?:ist|=|bedeutet)\s*(?:eine\s+)?(?:eingetretene\s+)?(?:negative|schädliche)\s+Wirkung\b/gi,
  },
  {
    id: "reichweite-equals-wirkung",
    pattern: /\b(?:hohe\s+)?Reichweite\s*(?:=|ist|bedeutet)\s*(?:eine\s+)?(?:hohe\s+)?Wirkung\b/gi,
  },
  {
    id: "reporting-equals-feedback",
    pattern: /\bReporting\s*(?:=|ist|bedeutet)\s*(?:eine\s+)?(?:Wirkungs)?Rückkopplung\b/gi,
  },
  {
    id: "t-sroi-proves-transformation",
    pattern: /\bT-SROI\s+(?:beweist|belegt|weist\s+nach|garantiert)\s+(?:eine\s+)?Transformationswirkung\b/gi,
  },
  {
    id: "woek-rates-people",
    pattern: /\b(?:die\s+)?Wirkungsökonomie\s+(?:bewertet|bewerte|bewerten)\s+(?:Menschen|Personen|Gesinnungen|Lebensstile)\b/gi,
  },
];

let indexedPageCount = 0;
for (const file of htmlFiles) {
  const raw = fs.readFileSync(file, "utf8");
  if (isNoindex(raw)) continue;
  indexedPageCount += 1;
  const text = cleanHtml(raw);
  for (const { id, pattern } of publicContradictions) {
    for (const match of text.matchAll(pattern)) {
      if (hasNegationNear(text, match.index, match.index + match[0].length)) continue;
      if (id === "woek-rates-people" && isExplicitlyFramedClaim(text, match.index, match.index + match[0].length)) continue;
      errors.push(`${file}: indexable page contains ${id}: “${match[0]}”`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Current terminology guardrail passed (${coreIds.length} core terms; ${indexedPageCount} indexable HTML pages scanned).`);
