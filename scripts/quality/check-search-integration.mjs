import fs from "node:fs";
import { gzipSync } from "node:zlib";
import { compactSearchEntries } from "../search/build-browser-search-index.mjs";

const indexPath = "assets/search/search-index.json";
const metaPath = "public/data/woek-search-meta.json";
if (!fs.existsSync(indexPath)) throw new Error("Missing existing search index.");
if (!fs.existsSync(metaPath)) throw new Error("Missing WÖk search meta.");

const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
const browserIndex = compactSearchEntries(index);
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
  "iooi",
];

for (const term of requiredTerms) {
  if (!haystack.includes(term.toLowerCase())) errors.push(`No search hit for required term: ${term}`);
}

const browserHaystack = browserIndex
  .map((entry) => `${entry.title} ${entry.description} ${entry.body} ${(entry.aliases || []).join(" ")}`)
  .join("\n")
  .toLowerCase();
for (const term of requiredTerms) {
  if (!browserHaystack.includes(term.toLowerCase())) errors.push(`No browser search hit for required term: ${term}`);
}

const browserIndexBytes = Buffer.byteLength(JSON.stringify(browserIndex));
const browserIndexGzipBytes = gzipSync(Buffer.from(JSON.stringify(browserIndex)), { level: 9, mtime: 0 }).length;
if (browserIndex.length < 1000) errors.push("Browser search index is unexpectedly small.");
if (browserIndexGzipBytes > 5 * 1024 * 1024) errors.push(`Compressed browser search index exceeds 5 MiB: ${browserIndexGzipBytes} bytes.`);
if (browserIndex.some((entry) => String(entry.url || "").includes("#"))) errors.push("Browser search index contains fragment routes.");
if (!browserIndex.some((entry) => /^\/(?:bibliothek|quellenarchiv)\/.+/.test(String(entry.url || "")))) {
  errors.push("Browser search index is missing lazy archive detail routes.");
}

if (!index.some((entry) => String(entry.id || "").startsWith("woek-term-"))) {
  errors.push("No WÖk glossary term entries integrated.");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  `Search integration check passed for ${index.length} full entries and ${browserIndex.length} browser entries (${(
    browserIndexBytes /
    1024 /
    1024
  ).toFixed(2)} MiB raw, ${(browserIndexGzipBytes / 1024 / 1024).toFixed(2)} MiB gzip).`,
);
