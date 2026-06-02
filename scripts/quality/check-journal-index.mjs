import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const blogDir = path.join(root, "blog");
const indexPath = path.join(root, "assets", "data", "blog-index.json");
const overviewPath = path.join(root, "blog.html");
const journalScriptPath = path.join(root, "assets", "js", "blog-journal.js");

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(full);
    }
  }
  return files;
}

function relativeUrl(file) {
  return `/${path.relative(root, file).split(path.sep).join("/")}`;
}

function hasPublishedDate(file) {
  const html = fs.readFileSync(file, "utf8");
  return /<meta\s+property=["']article:published_time["']\s+content=["'][^"']+["']/i.test(html) || /"datePublished"\s*:\s*"[^"]+"/i.test(html);
}

const ignored = new Set(["/blog/index.html", "/blog/linkedin-artikel.html"]);
const posts = JSON.parse(fs.readFileSync(indexPath, "utf8"));
const indexedUrls = new Set(posts.map((post) => post.url));
const publishedUrls = walk(blogDir).map(relativeUrl).filter((url) => !ignored.has(url));
const expectedUrls = publishedUrls.filter((url) => hasPublishedDate(path.join(root, url)));
const missingUrls = expectedUrls.filter((url) => !indexedUrls.has(url));
const staleUrls = [...indexedUrls].filter((url) => !expectedUrls.includes(url));
const unsorted = posts.filter((post, index) => index > 0 && posts[index - 1].date < post.date);
const overview = fs.readFileSync(overviewPath, "utf8");
const journalScript = fs.readFileSync(journalScriptPath, "utf8");
const failures = [];

if (!overview.includes("data-journal-list")) {
  failures.push("blog.html muss die Journalübersicht mit data-journal-list aus dem Index rendern.");
}

if (!journalScript.includes("[data-journal-list]") || !journalScript.includes("renderJournalArchive")) {
  failures.push("assets/js/blog-journal.js muss die Journalübersicht aus assets/data/blog-index.json rendern.");
}

if (missingUrls.length) {
  failures.push(`Fehlende Journal-Index-Einträge: ${missingUrls.join(", ")}`);
}

if (staleUrls.length) {
  failures.push(`Veraltete Journal-Index-Einträge: ${staleUrls.join(", ")}`);
}

if (unsorted.length) {
  failures.push("assets/data/blog-index.json ist nicht nach Veröffentlichungsdatum absteigend sortiert.");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Journal index check passed: ${posts.length} Beiträge automatisch indexiert, neueste zuerst.`);
