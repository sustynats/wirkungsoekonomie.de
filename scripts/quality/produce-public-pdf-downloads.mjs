import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const downloadRoots = ["assets/downloads", "downloads", "public/downloads"]
  .map((dir) => path.join(root, dir))
  .filter((dir) => fs.existsSync(dir));
const out = path.join(root, "public/data/public-pdf-downloads.json");
const privatePdfPattern = /(^|\/)assets\/downloads\/zertifikate\//i;

function walk(dir) {
  const entries = [];
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) entries.push(...walk(full));
    if (name.isFile() && name.name.toLowerCase().endsWith(".pdf")) {
      const relativePath = path.relative(root, full).replace(/\\/g, "/");
      if (privatePdfPattern.test(relativePath)) continue;
      const stat = fs.statSync(full);
      entries.push({
        path: relativePath,
        size: stat.size,
        updatedAt: stat.mtime.toISOString(),
      });
    }
  }
  return entries;
}

const pdfs = downloadRoots.flatMap(walk).sort((a, b) => a.path.localeCompare(b.path, "de"));
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify({ generatedAt: new Date().toISOString(), count: pdfs.length, pdfs }, null, 2)}\n`);
console.log(`Public PDF downloads inventoried: ${pdfs.length}.`);
