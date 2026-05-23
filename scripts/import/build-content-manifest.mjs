import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const roots = ["src/content/docs", "referenz", "dokumente", "begriffe", "instrumente", "beispiele", "quellen", "export"];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(md|mdx|html)$/i.test(entry.name)) files.push(full);
  }
  return files;
}

function hash(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function routeFor(file) {
  const rel = file.replace(/\\/g, "/");
  if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"/index.html".length)}/`;
  if (rel.endsWith(".html")) return `/${rel}`;
  if (rel.startsWith("src/content/docs/")) return `/${rel.replace(/^src\/content\/docs\//, "").replace(/\.(md|mdx)$/i, "/")}`;
  return `/${rel}`;
}

const entries = [];
for (const file of roots.flatMap((dir) => walk(dir))) {
  const text = fs.readFileSync(file, "utf8");
  const title = text.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1] || text.match(/<h1[^>]*>(.*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, "") || path.basename(file);
  const documentId = text.match(/^documentId:\s*["']?(.+?)["']?\s*$/m)?.[1] || path.basename(file).replace(/\.[^.]+$/, "");
  const sectionIds = Array.from(text.matchAll(/\bid=["']([^"']+)["']/g)).map((match) => match[1]);
  if (!sectionIds.length) sectionIds.push(documentId);
  for (const sectionId of sectionIds) {
    entries.push({
      documentId,
      documentSlug: documentId,
      documentType: text.match(/^documentType:\s*["']?(.+?)["']?\s*$/m)?.[1] || "referenz",
      title,
      sectionId,
      heading: title,
      route: routeFor(file),
      sourceFile: file,
      version: text.match(/^webVersion:\s*["']?(.+?)["']?\s*$/m)?.[1] || "2026.1",
      status: text.match(/^status:\s*["']?(.+?)["']?\s*$/m)?.[1] || "online-reviewed",
      contentHash: hash(text),
      relatedTerms: [],
      relatedDocuments: [],
    });
  }
}

fs.writeFileSync("public/data/content-manifest.json", `${JSON.stringify({ generatedAt: new Date().toISOString(), entries }, null, 2)}\n`);
console.log(`Wrote ${entries.length} content manifest entries.`);
