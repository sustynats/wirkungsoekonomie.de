import fs from "node:fs";

const indexPath = "assets/search/search-index.json";
const metaPath = "public/data/woek-search-meta.json";
if (!fs.existsSync(indexPath)) throw new Error("Missing existing search index.");
if (!fs.existsSync(metaPath)) throw new Error("Missing WÖk search meta.");

const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
const urls = new Set();
const errors = [];

for (const entry of index) {
  if (!entry.title) errors.push(`Empty title: ${entry.id || entry.url}`);
  if (!entry.url) errors.push(`Empty URL: ${entry.id || entry.title}`);
  if (!entry.body && !entry.description && !String(entry.id || "").startsWith("glossar-")) {
    errors.push(`Empty searchable text: ${entry.id || entry.url}`);
  }
  if (urls.has(entry.url)) errors.push(`Duplicate URL: ${entry.url}`);
  urls.add(entry.url);
}

const haystack = index.map((entry) => `${entry.title} ${entry.description} ${entry.body} ${(entry.aliases || []).join(" ")}`).join("\n").toLowerCase();
const requiredTerms = [
  "wirkung",
  "positive netto-wirkung",
  "reverse merit order",
  "wök-id",
  "wirkungsrat",
  "wustg",
  "wstg",
  "t-sroi",
  "apfel",
  "wirkungseinkommen",
  "wirkungsrente",
  "wohnungsmarkt",
  "lieferkette",
  "digitaler produktpass",
];

for (const term of requiredTerms) {
  if (!haystack.includes(term.toLowerCase())) errors.push(`No search hit for required term: ${term}`);
}

if (!index.some((entry) => String(entry.id || "").startsWith("woek-term-"))) {
  errors.push("No WÖk glossary term entries integrated.");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Search integration check passed for ${index.length} entries.`);

