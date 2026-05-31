import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const blogDir = path.join(root, "blog");
const indexPath = path.join(root, "assets", "data", "blog-index.json");

function readExistingIndex() {
  if (!fs.existsSync(indexPath)) return new Map();
  const entries = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  return new Map(entries.map((entry) => [normalizeUrl(entry.url), entry]));
}

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

function normalizeUrl(url) {
  if (!url) return "";
  return url.startsWith("/") ? url : `/${url}`;
}

function firstMatch(html, patterns) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtml(match[1].trim());
  }
  return "";
}

function allMatches(html, pattern) {
  return Array.from(html.matchAll(pattern), (match) => decodeHtml(match[1].trim())).filter(Boolean);
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function stripTags(value) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function cleanTitle(value) {
  return String(value || "")
    .replace(/\s+-\s+Journal der Wirkungsökonomie$/, "")
    .replace(/\s+\|\s+Wirkungsökonomie$/, "")
    .trim();
}

function toDateOnly(value) {
  const match = String(value || "").match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : "";
}

function relativeUrl(file) {
  const relative = path.relative(root, file).split(path.sep).join("/");
  return `/${relative}`;
}

function entryFromHtml(file, existing) {
  const html = fs.readFileSync(file, "utf8");
  const published = firstMatch(html, [
    /<meta\s+property=["']article:published_time["']\s+content=["']([^"']+)["']/i,
    /"datePublished"\s*:\s*"([^"]+)"/i
  ]);
  if (!published) return null;

  const url = relativeUrl(file);
  const previous = existing.get(url) || {};
  const title = cleanTitle(
    previous.title ||
      firstMatch(html, [/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i, /<h1[^>]*>([\s\S]*?)<\/h1>/i, /<title>([\s\S]*?)<\/title>/i])
  );
  const excerpt =
    previous.excerpt ||
    firstMatch(html, [/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i, /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i]);
  const heroKicker = stripTags(firstMatch(html, [/<p\s+class=["']hero-kicker["']>([\s\S]*?)<\/p>/i]));
  const readingTime = previous.readingTime || heroKicker.match(/(\d+\s*Min\.)/)?.[1] || "";
  const category =
    previous.category ||
    firstMatch(html, [/<meta\s+property=["']article:section["']\s+content=["']([^"']+)["']/i]) ||
    heroKicker.split("·")[0]?.trim() ||
    "Journal";
  const tags = previous.tags?.length ? previous.tags : allMatches(html, /<meta\s+property=["']article:tag["']\s+content=["']([^"']+)["']/gi);

  return {
    title,
    url,
    date: toDateOnly(published),
    category,
    readingTime,
    excerpt,
    tags,
    type: previous.type || "Blogartikel",
    featured: Boolean(previous.featured),
    status: previous.status || "published",
    relatedPages: previous.relatedPages || [],
    relatedTerms: previous.relatedTerms || []
  };
}

const existing = readExistingIndex();
const entries = walk(blogDir)
  .filter((file) => !["blog/index.html", "blog/linkedin-artikel.html"].includes(path.relative(root, file).split(path.sep).join("/")))
  .map((file) => entryFromHtml(file, existing))
  .filter(Boolean)
  .filter((entry) => entry.status === "published" && entry.date)
  .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title, "de"));

fs.mkdirSync(path.dirname(indexPath), { recursive: true });
fs.writeFileSync(indexPath, `${JSON.stringify(entries, null, 2)}\n`);
console.log(`Wrote ${entries.length} current blog entries to assets/data/blog-index.json.`);
