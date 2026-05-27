import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const textExtensions = new Set([".html", ".css", ".js", ".mjs", ".json"]);
const skipSegments = ["/assets/visuals/hero/", "/assets/visuals/rejected/", "/assets/visuals/icons/", "/assets/visuals/diagrams/"];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    if (entry.isFile() && textExtensions.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

function isSkippedUrl(url) {
  const normalized = url.replaceAll("\\", "/");
  return skipSegments.some((segment) => normalized.includes(segment.replace(/^\//, "")));
}

function resolveAsset(file, url) {
  const clean = url.split("#")[0].split("?")[0];
  const absolute = clean.startsWith("/")
    ? path.join(root, clean.slice(1))
    : clean.startsWith("assets/visuals/")
      ? path.join(root, clean)
    : path.resolve(path.dirname(file), clean);
  return absolute;
}

function normalizePublicVisualUrl(url) {
  if (url.startsWith("assets/visuals/")) return `/${url}`;
  return url;
}

function replacementFor(file, url) {
  if (!url.includes("assets/visuals/") || !url.endsWith(".svg") || isSkippedUrl(url)) {
    return url;
  }
  const resolved = resolveAsset(file, url);
  const png = resolved.replace(/\.svg$/, ".png");
  if (!fs.existsSync(png)) return url;
  return url.replace(/\.svg$/, ".png");
}

function rewriteSourceTag(tag) {
  if (!/assets\/visuals\/[^"']+\.png/.test(tag)) return tag;
  return tag.replace(/type=(["'])image\/svg\+xml\1/g, 'type=$1image/png$1');
}

let fileCount = 0;
let replacementCount = 0;
const changedFiles = [];

for (const file of walk(root)) {
  let text = fs.readFileSync(file, "utf8");
  const original = text;
  text = text.replace(/((?:src|srcset|href)=["'])([^"']*assets\/visuals\/[^"']+\.svg)(["'])/g, (match, prefix, url, suffix) => {
    const next = replacementFor(file, url);
    if (next !== url) replacementCount += 1;
    return `${prefix}${normalizePublicVisualUrl(next)}${suffix}`;
  });
  text = text.replace(/((?:src|srcset|href)=["'])(assets\/visuals\/[^"']+\.png)(["'])/g, (match, prefix, url, suffix) => {
    replacementCount += 1;
    return `${prefix}${normalizePublicVisualUrl(url)}${suffix}`;
  });
  text = text.replace(/((?:src|srcset|href)=["'])(assets\/visuals\/[^"']+)(["'])/g, (match, prefix, url, suffix) => {
    replacementCount += 1;
    return `${prefix}${normalizePublicVisualUrl(url)}${suffix}`;
  });
  text = text.replace(/<source\b[^>]*>/g, rewriteSourceTag);

  if (text !== original) {
    fs.writeFileSync(file, text);
    fileCount += 1;
    changedFiles.push(path.relative(root, file));
  }
}

console.log(`Professional visual asset links applied: ${replacementCount} reference(s) in ${fileCount} file(s).`);
if (changedFiles.length) {
  console.log(changedFiles.sort().join("\n"));
}
