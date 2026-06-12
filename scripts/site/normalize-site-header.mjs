import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const CSS_VERSION = "20260612-mobile-table-fix";
const navigation = JSON.parse(fs.readFileSync(path.join(ROOT, "assets/data/navigation.json"), "utf8"));

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
  })[char]);
}

function navMatch(item) {
  return (item.match || [item.href]).join("|");
}

function prefixFor(filePath) {
  const relative = path.relative(ROOT, filePath).replace(/\\/g, "/");
  const dir = path.dirname(relative);
  return dir === "." ? "" : dir.split("/").map(() => "../").join("");
}

function utilityClass(item) {
  if (item.label === "WÖk-KI") return "woek-ki";
  return item.label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ö/g, "oe")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function renderUtilityLink(base, item) {
  const text = item.label === "WÖk-KI" ? "KI" : item.label;
  const primary = item.label === "Mein Wirkungsraum" ? ' data-utility-primary="true"' : "";
  return `        <a class="site-utility-link site-utility-link--${escapeHtml(utilityClass(item))}" href="${base}${escapeHtml(item.href)}" data-nav-match="${escapeHtml(navMatch(item))}" data-utility-label="${escapeHtml(item.label)}"${primary}>${escapeHtml(text)}</a>`;
}

function renderMainLink(base, item) {
  return `        <a href="${base}${escapeHtml(item.href)}" data-nav-match="${escapeHtml(navMatch(item))}">${escapeHtml(item.label)}</a>`;
}

function renderHeader(base) {
  const utilityLinks = (navigation.more || []).map((item) => renderUtilityLink(base, item)).join("\n");
  const mainLinks = (navigation.header || []).map((item) => renderMainLink(base, item)).join("\n");

  return `<header class="site-header" data-search-exclude>
      <a class="brand" href="${base}index.html" aria-label="Wirkungsökonomie Startseite">
        <span class="brand-mark"><img src="${base}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span>
        <span class="brand-name">Wirkungsökonomie</span>
      </a>
      <nav class="site-utility-nav" aria-label="Schnellzugriffe" data-search-exclude>
${utilityLinks}
      </nav>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav">
        <span class="nav-toggle-icon" aria-hidden="true">☰</span>
        <span class="sr-only">Menü</span>
      </button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation" data-search-exclude>
${mainLinks}
        <div class="site-nav-utility" aria-label="Schnellzugriffe">
${utilityLinks}
        </div>
      </nav>
    </header>`;
}

function headerFiles() {
  const output = execFileSync("git", ["ls-files", "*.html"], {
    cwd: ROOT,
    encoding: "utf8",
  }).trim();

  if (!output) return [];

  return output
    .split("\n")
    .map((file) => path.join(ROOT, file))
    .filter((file) => {
      const html = fs.readFileSync(file, "utf8");
      return html.includes('<header class="site-header"');
    });
}

let changed = 0;

for (const filePath of headerFiles()) {
  const before = fs.readFileSync(filePath, "utf8");
  const afterHeader = before.replace(/<header class="site-header"[\s\S]*?<\/header>/, renderHeader(prefixFor(filePath)));
  const after = afterHeader
    .replaceAll("20260612-shell-audio-fix", CSS_VERSION)
    .replaceAll("20260612-nav-restore", CSS_VERSION)
    .replaceAll("20260612-journal-mobile-fix", CSS_VERSION)
    .replaceAll("20260612-mobile-headline-fix", CSS_VERSION);
  if (after !== before) {
    fs.writeFileSync(filePath, after);
    changed += 1;
  }
}

console.log(`normalized site headers: ${changed}`);
