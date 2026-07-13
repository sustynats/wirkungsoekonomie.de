import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const root = process.cwd();
const ignoredDirectories = new Set([".git", "node_modules", "vendor"]);
const failures = [];

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(path));
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(path);
  }

  return files;
}

for (const file of await htmlFiles(root)) {
  const html = await readFile(file, "utf8");
  const fileName = relative(root, file);
  const videos = html.matchAll(/<video\b([^>]*)>([\s\S]*?)<\/video>/gi);

  for (const match of videos) {
    const attributes = match[1];
    const body = match[2];
    const line = html.slice(0, match.index).split("\n").length;

    if (!/\bplaysinline\b/i.test(attributes)) {
      failures.push(`${fileName}:${line} video fehlt playsinline`);
    }
    if (/\bsrc\s*=\s*["'][^"']+\.mp4(?:[?"'])/i.test(attributes)) {
      failures.push(`${fileName}:${line} MP4 muss als <source type="video/mp4"> eingebunden werden`);
    }
    if (!/<source\b[^>]*\bsrc\s*=\s*["'][^"']+\.mp4[^>]*\btype\s*=\s*["']video\/mp4["'][^>]*>/i.test(body)) {
      failures.push(`${fileName}:${line} MP4-Quelle mit type="video/mp4" fehlt`);
    }
  }
}

if (failures.length) {
  console.error(["Mobile Video-Markup-Prüfung fehlgeschlagen:", ...failures.map((failure) => `- ${failure}`)].join("\n"));
  process.exit(1);
}

console.log("Mobile Video-Markup-Prüfung bestanden.");
