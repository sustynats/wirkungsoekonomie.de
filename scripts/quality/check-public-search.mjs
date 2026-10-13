import fs from "node:fs";
import path from "node:path";
import { readBuiltSearchEntries } from "../search/build-browser-search-index.mjs";

const root = path.resolve(process.argv.includes("--artifact") ? "_site" : ".");
const routeManifestPath = path.join(root, "assets/data/public-routes.json");
const searchManifestPath = path.join(root, "assets/search/browser-index-manifest.json");
const fullIndexPath = path.join(root, "assets/search/search-index.json");
const failures = [];

if (!fs.existsSync(routeManifestPath)) failures.push("Public route manifest is missing.");
if (!fs.existsSync(searchManifestPath)) failures.push("Browser search manifest is missing.");

const routes = fs.existsSync(routeManifestPath)
  ? JSON.parse(fs.readFileSync(routeManifestPath, "utf8")).routes || []
  : [];
const manifest = fs.existsSync(searchManifestPath)
  ? JSON.parse(fs.readFileSync(searchManifestPath, "utf8"))
  : {};
const entries = readBuiltSearchEntries(root);
const routeUrls = routes.map((route) => route.url).sort();
const searchUrls = entries.map((entry) => entry.url).sort();

if (manifest.schemaVersion !== 2) failures.push("Browser search manifest must use schema version 2.");
if (manifest.coverage?.ratio < 0.98) failures.push(`Search coverage is below 98%: ${manifest.coverage?.ratio}`);
if (JSON.stringify(routeUrls) !== JSON.stringify(searchUrls)) failures.push(`Search routes differ from the public route manifest (${searchUrls.length}/${routeUrls.length}).`);
if (new Set(searchUrls).size !== searchUrls.length) failures.push("Search routes contain duplicates.");
if (process.argv.includes("--artifact") && fs.existsSync(fullIndexPath)) failures.push("The large source search-index.json remains in the public artifact.");

for (const entry of entries) {
  if (!entry.title || !entry.url || !entry.raum || !entry.typ) failures.push(`Incomplete search entry: ${entry.url || "without URL"}`);
  if (/&(?:amp|quot|apos|lt|gt|#\d+|#x[a-f\d]+);/i.test(entry.title)) failures.push(`Encoded entity remains in search title: ${entry.url}`);
  if (entry.typ === "Meldung" && Number(entry.priority || 0) > 20) failures.push(`Ticker priority is too high: ${entry.url}`);
}

const suggestionPart = manifest.suggestions || {};
if (Number(suggestionPart.bytes || 0) > 200_000) failures.push(`Suggestion index exceeds 200 KB: ${suggestionPart.bytes}`);
if (suggestionPart.json) {
  const file = path.join(root, "assets/search", suggestionPart.json);
  const suggestions = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : [];
  if (!suggestions.length) failures.push("Suggestion index is empty.");
  for (const item of suggestions) {
    if (!item.title || !item.url || !item.type || !item.raum || !("snippet" in item)) {
      failures.push(`Incomplete suggestion entry: ${item.url || "without URL"}`);
    }
  }
}

if (failures.length) {
  console.error("Public search check failed:");
  failures.slice(0, 80).forEach((failure) => console.error(`- ${failure}`));
  if (failures.length > 80) console.error(`… ${failures.length - 80} more`);
  process.exit(1);
}

console.log(
  `Public search passed: ${entries.length}/${routes.length} routes, ${manifest.archives?.length || 0} lazy archive shards, `
  + `${Number(suggestionPart.bytes || 0).toLocaleString("de-DE")} suggestion bytes.`,
);
