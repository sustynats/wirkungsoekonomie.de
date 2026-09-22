import { lstat, mkdir, readFile, readdir, rename } from "node:fs/promises";
import path from "node:path";

const outputRoot = process.argv[2];
if (!outputRoot || !path.isAbsolute(outputRoot)) throw new Error("Expected an absolute static output directory.");

const candidates = [];
async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) await collect(target);
    else if (entry.isFile() && !path.extname(entry.name)) candidates.push(target);
  }
}

await collect(outputRoot);
let normalized = 0;
for (const filename of candidates) {
  const prefix = (await readFile(filename, "utf8")).slice(0, 80).toLocaleLowerCase();
  if (!prefix.includes("<!doctype html")) continue;
  const temporary = `${filename}.woek-static-html`;
  await rename(filename, temporary);
  await mkdir(filename, { recursive: true });
  await rename(temporary, path.join(filename, "index.html"));
  normalized += 1;
}

const remaining = await Promise.all(candidates.map(async (filename) => {
  try { return (await lstat(filename)).isFile() ? filename : null; } catch { return null; }
}));
console.log(`STATIC_HTML_ROUTES_NORMALIZED=${normalized}`);
console.log(`STATIC_EXTENSIONLESS_FILES_REMAINING=${remaining.filter(Boolean).length}`);
