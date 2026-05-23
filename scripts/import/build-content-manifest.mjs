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

function stripTags(value = "") {
  return value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function firstMatch(text, regex, fallback = "") {
  return text.match(regex)?.[1]?.trim() || fallback;
}

function attrMap(tag) {
  const attrs = {};
  for (const match of tag.matchAll(/\s([a-zA-Z0-9_-]+)=["']([^"']*)["']/g)) attrs[match[1]] = match[2];
  return attrs;
}

const entries = [];
for (const file of roots.flatMap((dir) => walk(dir))) {
  const text = fs.readFileSync(file, "utf8");
  const title = firstMatch(text, /^title:\s*["']?(.+?)["']?\s*$/m) || stripTags(firstMatch(text, /<h1[^>]*>(.*?)<\/h1>/is)) || path.basename(file);
  const defaultDocumentId = firstMatch(text, /^documentId:\s*["']?(.+?)["']?\s*$/m) || path.basename(file).replace(/\.[^.]+$/, "");
  const route = routeFor(file);
  const documentType = firstMatch(text, /^documentType:\s*["']?(.+?)["']?\s*$/m) || firstMatch(text, /<meta name="search_type" content="([^"]+)"/i, "referenz");
  const sourceVersion = firstMatch(text, /<dt>Source-Version<\/dt><dd>(.*?)<\/dd>/i, "2026.0");
  const importVersion = firstMatch(text, /<dt>Import-Version<\/dt><dd>(.*?)<\/dd>/i, "");
  const liveReferenceVersion = firstMatch(text, /<dt>Live-Reference-Version<\/dt><dd>(.*?)<\/dd>/i, "");
  const webVersion = firstMatch(text, /<dt>Web-Version<\/dt><dd>(.*?)<\/dd>/i, firstMatch(text, /^webVersion:\s*["']?(.+?)["']?\s*$/m, "2026.1"));
  const reviewStatus = firstMatch(text, /<dt>Reviewstatus<\/dt><dd>(.*?)<\/dd>/i, "partially-reviewed");
  const status = firstMatch(text, /^status:\s*["']?(.+?)["']?\s*$/m) || firstMatch(text, /<dt>Status<\/dt><dd>(.*?)<\/dd>/i, "online-reviewed");
  const originalFileUrl = firstMatch(text, /<a[^>]+href=["']([^"']+)["'][^>]*>(?:Original(?:datei|-PDF|-XLSX)? öffnen|Original-PDF öffnen|Original-XLSX öffnen)/i);
  const sourceFile = firstMatch(text, /<dt>Quelle<\/dt><dd>(.*?)<\/dd>/i) || firstMatch(text, /<dt>Originaldatei<\/dt><dd>(.*?)<\/dd>/i) || file;
  const chapterNumber = Number(firstMatch(text, /Kapitel\s+(\d{1,3})\s*[-:]/i, "0")) || undefined;

  const anchors = Array.from(text.matchAll(/<(h[1-6]|p|figure|div)\b([^>]*)>/gi))
    .map((match) => ({ tag: match[0], name: match[1].toLowerCase(), attrs: attrMap(match[0]) }))
    .filter((item) => item.attrs.id || item.attrs["data-section-id"] || item.attrs["data-paragraph-id"]);
  if (!anchors.length) anchors.push({ tag: "", name: "document", attrs: { id: defaultDocumentId } });

  for (const item of anchors) {
    const sectionId = item.attrs["data-section-id"] || item.attrs.id || defaultDocumentId;
    const paragraphId = item.attrs["data-paragraph-id"] || (item.name === "p" ? item.attrs.id : undefined);
    const documentId = item.attrs["data-document-id"] || defaultDocumentId;
    entries.push({
      documentId,
      documentSlug: documentId,
      documentType,
      title,
      sectionId,
      paragraphId,
      heading: title,
      route: `${route}${item.attrs.id ? `#${item.attrs.id}` : ""}`,
      chapterNumber,
      sourceVersion,
      importVersion,
      liveReferenceVersion,
      webVersion,
      version: webVersion,
      status,
      reviewStatus,
      sourceFile,
      sourcePageStart: undefined,
      sourcePageEnd: undefined,
      contentHash: item.attrs["data-content-hash"] || hash(text),
      relatedTerms: [],
      relatedDocuments: [],
      originalFileUrl,
    });
  }
}

fs.writeFileSync("public/data/content-manifest.json", `${JSON.stringify({ generatedAt: new Date().toISOString(), entries }, null, 2)}\n`);
console.log(`Wrote ${entries.length} content manifest entries.`);
