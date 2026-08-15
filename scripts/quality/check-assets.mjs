import fs from "node:fs";
import path from "node:path";

const roots = ["src/content/docs", "referenz", "dokumente", "begriffe", "instrumente", "beispiele"];
const missing = [];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(md|mdx|html)$/i.test(entry.name)) files.push(full);
  }
  return files;
}

for (const file of roots.flatMap((dir) => walk(dir))) {
  const text = fs.readFileSync(file, "utf8");
  for (const match of text.matchAll(/(?:src=|!\[[^\]]*\]\()["']?([^"')]+\.(?:png|jpe?g|webp|svg))["']?/gi)) {
    const ref = match[1];
    if (/^https?:/.test(ref)) continue;
    const candidate = path.resolve(path.dirname(file), ref);
    const rootCandidate = path.resolve(ref.replace(/^\//, ""));
    if (!fs.existsSync(candidate) && !fs.existsSync(rootCandidate)) missing.push(`${file}: ${ref}`);
  }
}

if (missing.length) {
  console.error(missing.join("\n"));
  process.exit(1);
}
console.log("Asset reference check passed.");

