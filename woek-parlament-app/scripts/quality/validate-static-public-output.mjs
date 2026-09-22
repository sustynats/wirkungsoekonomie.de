import { lstat, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const outputRoot = path.resolve(process.argv[2] ?? "_static-public-site");
const files = [];
async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) await visit(target);
    else if (entry.isFile()) files.push({ path: path.relative(outputRoot, target), bytes: (await lstat(target)).size });
  }
}
await visit(outputRoot);
files.sort((left, right) => right.bytes - left.bytes || left.path.localeCompare(right.path));

const required = [
  "index.html",
  "CNAME",
  "robots.txt",
  "wirkungsakten/index.html",
  "pruefstandard/quellen/index.html",
  "wirkungsakten/fachakten/sachsen-anhalt:ltw-2026-st-cdu:commitments/index.html",
];
const paths = new Set(files.map((file) => file.path));
for (const filename of required) if (!paths.has(filename)) throw new Error(`Missing static publication file: ${filename}`);
if ([...paths].some((filename) => filename.startsWith("api/"))) throw new Error("Static publication must not contain API routes.");
const transportFiles = [...paths].filter((filename) => filename.endsWith(".txt") && filename !== "robots.txt");
if (transportFiles.length) throw new Error(`React Server navigation payloads remain: ${transportFiles.slice(0, 5).join(", ")}`);
if ((await readFile(path.join(outputRoot, "CNAME"), "utf8")).trim() !== "parlament.wirkungsoekonomie.de") throw new Error("Unexpected CNAME.");

const expectedProgrammeCounts = {
  "ltw-2026-st-cdu": 344,
  "ltw-2026-st-spd": 174,
  "ltw-2026-st-gruene": 740,
  "ltw-2026-st-linke": 886,
  "ltw-2026-st-bsw": 311,
  "ltw-2026-st-afd": 466,
};
for (const [sourceKey, expected] of Object.entries(expectedProgrammeCounts)) {
  const filename = path.join(outputRoot, "ebenen", "laender", "sachsen-anhalt", "wahlprogramme", sourceKey, "index.json");
  const payload = JSON.parse(await readFile(filename, "utf8"));
  if (payload.total !== expected || payload.entries?.length !== expected) throw new Error(`Invalid programme index ${sourceKey}: ${payload.total}/${payload.entries?.length} != ${expected}`);
}

const totalBytes = files.reduce((sum, file) => sum + file.bytes, 0);
if (totalBytes > 900 * 1024 * 1024) throw new Error(`Static site exceeds 900 MiB: ${(totalBytes / 1024 / 1024).toFixed(1)} MiB.`);
if (files[0]?.bytes > 75 * 1024 * 1024) throw new Error(`Static file exceeds 75 MiB: ${files[0].path}`);
const previousManifestPath = path.join(outputRoot, "_woek-build-manifest.json");
let previous = {};
try { previous = JSON.parse(await readFile(previousManifestPath, "utf8")); } catch { /* The validator can create the first manifest. */ }
const manifest = {
  ...previous,
  schema_version: "woek-static-public-build-v1",
  generated_at: new Date().toISOString(),
  canonical_origin: "https://parlament.wirkungsoekonomie.de",
  file_count: files.length,
  total_bytes: totalBytes,
  largest_files: files.slice(0, 20),
  programme_index_entries: Object.values(expectedProgrammeCounts).reduce((sum, count) => sum + count, 0),
  react_server_navigation_included: false,
  server_runtime_included: false,
};
await writeFile(previousManifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log("STATIC_PUBLIC_OUTPUT=PASS");
console.log(`STATIC_PUBLIC_FILES=${files.length}`);
console.log(`STATIC_PUBLIC_MIB=${(totalBytes / 1024 / 1024).toFixed(1)}`);
console.log(`STATIC_PROGRAMME_INDEX_ENTRIES=${manifest.programme_index_entries}`);
