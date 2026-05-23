import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const indexPath = "assets/search/search-index.json";
const metaPath = "public/data/woek-search-meta.json";
const glossaryPath = "public/data/glossary.terms.json";

function clean(text) {
  return String(text || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function entryFromTerm(term) {
  const body = [
    term.canonicalLabel,
    term.shortDefinition,
    term.hoverDefinition,
    term.longDefinition,
    term.usageNote,
    ...(term.synonyms || []),
    ...(term.relatedTerms || []),
  ].join(" ");
  return {
    id: `woek-term-${term.slug}`,
    title: term.canonicalLabel,
    description: term.shortDefinition,
    url: `/begriffe/${term.slug}/`,
    section: "Begriffe",
    type: term.status === "anschlussbegriff" ? "Anschlussbegriff" : "Begriff",
    format: "Glossarbegriff",
    impactSpaces: ["Mensch", "Planet", "Demokratie"],
    standards: term.relatedTerms?.filter((item) => /sdg|csrd|esrs|taxonomie|gri|nace/i.test(item)) || [],
    instruments: term.relatedTerms || [],
    tags: [term.status, term.version, term.reviewStatus, ...(term.synonyms || [])].filter(Boolean),
    aliases: [...(term.synonyms || []), term.hoverDefinition],
    body,
    priority: term.status === "führender-begriff" ? 140 : 110,
  };
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(md|mdx|html)$/i.test(entry.name)) files.push(full);
  }
  return files;
}

function routeFor(file) {
  const rel = file.replace(/\\/g, "/");
  if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"/index.html".length)}/`;
  if (rel.endsWith(".html")) return `/${rel}`;
  if (rel.startsWith("src/content/docs/")) return `/${rel.replace(/^src\/content\/docs\//, "").replace(/\.(md|mdx)$/i, "/")}`;
  return `/${rel}`;
}

function entriesFromContent(file) {
  const text = fs.readFileSync(file, "utf8");
  const title =
    text.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1] ||
    clean(text.match(/<h1[^>]*>(.*?)<\/h1>/i)?.[1]) ||
    path.basename(file).replace(/\.[^.]+$/, "");
  const documentType = text.match(/^documentType:\s*["']?(.+?)["']?\s*$/m)?.[1] || "Referenz";
  const status = text.match(/^status:\s*["']?(.+?)["']?\s*$/m)?.[1] || "online-reviewed";
  const version =
    text.match(/<dt>Web-Version<\/dt><dd>(.*?)<\/dd>/i)?.[1] ||
    text.match(/^webVersion:\s*["']?(.+?)["']?\s*$/m)?.[1] ||
    "2026.1";
  const liveBoost = version === "2026.2-live-reference" ? 25 : 0;
  const isReferenceChapter = /referenz\/kapitel-\d{3}-/.test(file);
  const isRegister = /woek-master-items-final-v1-2/.test(file);
  const body = clean(text).slice(0, 18000);
  if (body.length < 80) return [];
  const sectionMatches = Array.from(text.matchAll(/<h([2-3])[^>]*id=["']([^"']+)["'][^>]*>(.*?)<\/h\1>/gi));
  const base = {
    documentType,
    status,
    version,
    sourceFile: file,
    contentHash: hash(text),
  };
  const pageEntry = {
    id: `woek-page-${hash(file)}`,
    title,
    description: body.slice(0, 240),
    url: routeFor(file),
    section: documentType,
    type: documentType,
    format: documentType,
    impactSpaces: [],
    standards: [],
    instruments: [],
    tags: [status, version, "WÖk-Referenz"],
    aliases: [],
    body,
    priority: 70 + liveBoost + (isReferenceChapter ? 15 : 0) + (isRegister ? 20 : 0),
  };
  const entries = [pageEntry];
  for (const match of sectionMatches) {
    const sectionId = match[2];
    entries.push({
      ...pageEntry,
      id: `woek-section-${sectionId}`,
      title: `${title}: ${clean(match[3])}`,
      url: `${routeFor(file)}#${sectionId}`,
      priority: 85 + liveBoost + (isReferenceChapter ? 15 : 0) + (isRegister ? 20 : 0),
    });
  }
  return entries.map((entry) => ({ entry, meta: { ...base, sectionId: entry.id.replace(/^woek-section-/, "") } }));
}

const existing = fs.existsSync(indexPath) ? JSON.parse(fs.readFileSync(indexPath, "utf8")) : [];
const glossary = fs.existsSync(glossaryPath) ? JSON.parse(fs.readFileSync(glossaryPath, "utf8")).terms : [];
const generated = [];
const meta = {};

for (const term of glossary) {
  const entry = entryFromTerm(term);
  generated.push(entry);
  meta[entry.url] = {
    documentType: "begriff",
    status: term.status,
    version: term.version,
    sectionId: `begriff-${term.slug}`,
    documentId: term.termId,
    relatedTerms: term.relatedTerms || [],
    relatedDocuments: term.relatedDocuments || [],
    sourceFile: term.sourceDocument,
    searchBoost: entry.priority,
  };
}

const contentFiles = ["src/content/docs", "referenz", "dokumente", "instrumente", "beispiele", "quellen", "export"]
  .flatMap((dir) => walk(dir));
for (const file of contentFiles) {
  for (const { entry, meta: itemMeta } of entriesFromContent(file)) {
    generated.push(entry);
    meta[entry.url] = itemMeta;
  }
}

const byUrl = new Map(existing.filter((entry) => !String(entry.id || "").startsWith("woek-")).map((entry) => [entry.url, entry]));
for (const entry of generated) byUrl.set(entry.url, entry);
const merged = Array.from(byUrl.values()).sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0) || String(a.title).localeCompare(String(b.title), "de"));

fs.writeFileSync(indexPath, `${JSON.stringify(merged, null, 2)}\n`);
fs.writeFileSync(metaPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), entries: meta }, null, 2)}\n`);
console.log(`Integrated ${generated.length} WÖk search entries into existing search index.`);
