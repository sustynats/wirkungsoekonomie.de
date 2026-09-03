import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, "assets/data/blog-index.json");
const forbidden = /\b(armin\s+maiwald|linkedin-fassung|redaktionsanweisung|todo:|platzhalter)\b/i;

function read(pathname) {
  return fs.readFileSync(path.join(root, pathname), "utf8");
}

function expectedRelativeUrl(pagePath, journalUrl) {
  const target = String(journalUrl || "").replace(/^\//, "");
  return path.posix.relative(path.posix.dirname(pagePath), target);
}

function assertLatestJournalFeature(pagePath, entry, cardClass = "journal-feature-card") {
  const html = read(pagePath);
  const feature = html.match(new RegExp(`<article\\b[^>]*class=["'][^"']*\\b${cardClass}\\b[^"']*["'][^>]*>[\\s\\S]*?<\\/article>`, "i"))?.[0] || "";
  const expectedHref = expectedRelativeUrl(pagePath, entry.url);
  if (!feature.includes(`href="${expectedHref}"`)) {
    throw new Error(`${pagePath}: Der hervorgehobene Journal-Teaser ist nicht der neueste veröffentlichte Beitrag (${entry.url}).`);
  }
}

function assertJournalBreadcrumbs() {
  const blogRoot = path.join(root, "blog");
  const stack = [blogRoot];
  const missing = [];
  while (stack.length) {
    const directory = stack.pop();
    for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, item.name);
      if (item.isDirectory()) stack.push(absolute);
      else if (item.isFile() && item.name.endsWith(".html")) {
        const relative = path.relative(root, absolute).split(path.sep).join("/");
        if (relative === "blog/index.html") continue;
        const html = fs.readFileSync(absolute, "utf8");
        if (!/<(?:article|section)\b[^>]*class=["'][^"']*\bhero\b/i.test(html)) continue;
        const crumbs = Array.from(html.matchAll(/<nav\b[^>]*class=["'][^"']*\bbreadcrumb\b[^"']*["'][^>]*>([\s\S]*?)<\/nav>/gi));
        const base = `https://wirkungsoekonomie.de/${relative}`;
        const linksBackToJournal = crumbs.some((crumb) => Array.from(crumb[1].matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi))
          .some((link) => {
            const pathname = new URL(link[1], base).pathname;
            return pathname === "/blog.html" || pathname === "/blog/";
          }));
        if (!linksBackToJournal) missing.push(relative);
      }
    }
  }
  if (missing.length) {
    throw new Error(`Fehlende obere Journal-Breadcrumbs:\n${missing.join("\n")}`);
  }
}

if (!fs.existsSync(source)) {
  throw new Error("assets/data/blog-index.json fehlt. Bitte zuerst scripts/blog/build-blog-index.mjs ausführen.");
}

const entries = JSON.parse(fs.readFileSync(source, "utf8"));
if (!Array.isArray(entries)) {
  throw new Error("Journal-Index muss eine Liste sein.");
}

const seen = new Set();
const findings = [];
for (const [index, entry] of entries.entries()) {
  if (!entry.title || !entry.url) findings.push(`Eintrag ${index} ohne title/url`);
  if (entry.url && seen.has(entry.url)) findings.push(`Doppelte URL: ${entry.url}`);
  if (entry.url) seen.add(entry.url);
  const publicText = [entry.title, entry.excerpt, ...(entry.tags || [])].join(" ");
  if (forbidden.test(publicText)) findings.push(`Redaktionsartefakt im Index: ${entry.url || entry.title}`);
}

if (findings.length) {
  console.error(findings.join("\n"));
  process.exit(1);
}

const latest = entries.find((entry) => entry.status === "published");
if (!latest) throw new Error("Kein veröffentlichter Journalartikel im Index.");
const homepage = read("index.html");
if (!homepage.includes('id="neues-aus-der-wirkungsoekonomie"') || !homepage.includes('href="news/"')) {
  throw new Error("index.html: Die Startseite enthält keine funktionsfähige Sektion ‚Neues aus der Wirkungsökonomie‘.");
}
assertLatestJournalFeature("blog.html", latest);
assertLatestJournalFeature("bibliothek/index.html", latest, "journal-library-card");
assertJournalBreadcrumbs();

console.log(`Journal index check OK: ${entries.length} entries.`);
