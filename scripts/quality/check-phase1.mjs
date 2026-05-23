import fs from "node:fs";
import path from "node:path";

const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));

const requiredFiles = [
  "referenz/index.html",
  "referenz/volltext/index.html",
  "dokumente/index.html",
  "glossar.html",
  "public/data/content-manifest.json",
  "public/data/glossary.terms.json",
  "assets/search/search-index.json",
  "docs/PHASE_1_STATUS.md",
  "docs/ASSET_REVIEW.md",
  "docs/GLOSSARY_REVIEW_NOTES.md",
  "docs/SEARCH_INTEGRATION_NOTES.md",
  "docs/IMPORT_REVIEW_NOTES.md",
  "docs/PHASE_1_COMPLETION_REPORT.md",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) fail(`Missing required Phase 1 file: ${file}`);
}

const mainwork = readJson("public/data/mainwork-reference.json");
if (mainwork.stats?.chapters !== 108) fail(`Expected 108 chapter routes, got ${mainwork.stats?.chapters}`);
if (mainwork.stats?.parts !== 18) fail(`Expected 18 part routes, got ${mainwork.stats?.parts}`);

for (let index = 1; index <= 108; index += 1) {
  const padded = String(index).padStart(3, "0");
  const matches = fs.readdirSync("referenz").filter((name) => name.startsWith(`kapitel-${padded}-`));
  if (!matches.some((name) => fs.existsSync(path.join("referenz", name, "index.html")))) {
    fail(`Missing chapter route for Kapitel ${padded}`);
  }
}

for (let index = 1; index <= 18; index += 1) {
  const padded = String(index).padStart(2, "0");
  const matches = fs.readdirSync("referenz").filter((name) => name.startsWith(`teil-${padded}-`));
  if (!matches.some((name) => fs.existsSync(path.join("referenz", name, "index.html")))) {
    fail(`Missing part route for Teil ${padded}`);
  }
}

const manifest = readJson("public/data/content-manifest.json");
if (!Array.isArray(manifest.entries) || manifest.entries.length < 1000) fail("Content manifest is missing or too small.");
const seenSections = new Set();
for (const entry of manifest.entries) {
  if (!entry.documentId) fail(`Manifest entry without documentId: ${JSON.stringify(entry).slice(0, 160)}`);
  if (!entry.sectionId) fail(`Manifest entry without sectionId: ${entry.route}`);
  if (!entry.sourceVersion) fail(`Manifest entry without sourceVersion: ${entry.route}`);
  if (!entry.webVersion) fail(`Manifest entry without webVersion: ${entry.route}`);
  if (!entry.reviewStatus) fail(`Manifest entry without reviewStatus: ${entry.route}`);
  if (entry.sectionId) seenSections.add(`${entry.documentId}:${entry.sectionId}`);
  if (entry.paragraphId && !entry.sectionId) fail(`Paragraph entry without sectionId: ${entry.paragraphId}`);
}

const fulltext = fs.readFileSync("referenz/volltext/index.html", "utf8");
for (const needle of ["data-section-id=\"woek-main-2026-k033-s002\"", "data-paragraph-id=", "data-content-hash="]) {
  if (!fulltext.includes(needle)) fail(`Fulltext missing expected stable ID marker: ${needle}`);
}

const glossary = readJson("public/data/glossary.terms.json");
for (const term of glossary.terms || []) {
  if (term.status === "führender-begriff" && !term.hoverDefinition) fail(`Leading term without hoverDefinition: ${term.termId}`);
}

const search = readJson("assets/search/search-index.json");
for (const term of ["Reverse Merit Order", "WÖk-ID", "T-SROI", "Wirkungsrat", "Apfel"]) {
  if (!JSON.stringify(search).includes(term)) fail(`Search index does not include ${term}`);
}

if (process.exitCode) process.exit(process.exitCode);
console.log(`Phase 1 check passed with ${manifest.entries.length} manifest entries.`);
