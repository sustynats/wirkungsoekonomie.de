import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const CSS_VERSION = "20260628-radar-toc";
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

function isEnglishFile(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, "/").startsWith("en/");
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

function germanSwitchHref(base, filePath) {
  const relative = path.relative(ROOT, filePath).replace(/\\/g, "/");
  if (relative === "en/library/index.html") return `${base}bibliothek/`;
  if (relative === "en/tools/index.html") return `${base}werkzeuge/`;
  if (relative === "en/app/index.html") return `${base}app/`;
  if (relative === "en/woek-ai/index.html") return `${base}woek-ki/`;
  if (relative === "en/my-impact-space/index.html") return `${base}mein-wirkungsraum/`;
  return `${base}index.html`;
}

function renderLanguageSwitch(base, locale, filePath) {
  if (locale === "en") {
    return `        <a class="site-utility-link site-utility-link--language" href="${germanSwitchHref(base, filePath)}" hreflang="de" lang="de" data-lang-switch="de" data-utility-label="Deutsch">DE</a>`;
  }
  return `        <a class="site-utility-link site-utility-link--language" href="${base}en/" hreflang="en" lang="en" data-lang-switch="en" data-utility-label="English">EN</a>`;
}

function renderMainLink(base, item) {
  return `        <a href="${base}${escapeHtml(item.href)}" data-nav-match="${escapeHtml(navMatch(item))}">${escapeHtml(item.label)}</a>`;
}

function renderEnglishUtilityLink(base, item) {
  const labels = new Map([
    ["Suche", ["Search", "Search", "en/#tools"]],
    ["WÖk-KI", ["AI", "WÖk AI", "en/woek-ai/"]],
    ["WÖk-App", ["WÖk App", "WÖk App", "en/app/"]],
    ["Mein Wirkungsraum", ["My Impact Space", "My Impact Space", "en/my-impact-space/"]],
  ]);
  const [text, utilityLabel, href] = labels.get(item.label) || [item.label, item.label, "en/"];
  const primary = item.label === "Mein Wirkungsraum" ? ' data-utility-primary="true"' : "";
  return `        <a class="site-utility-link site-utility-link--${escapeHtml(utilityClass(item))}" href="${base}${escapeHtml(href)}" data-nav-match="en/" data-utility-label="${escapeHtml(utilityLabel)}"${primary}>${escapeHtml(text)}</a>`;
}

function englishMainLinks() {
  return [
    ["Home", "en/", "en/"],
    ["Understand", "en/#understand", "en/"],
    ["For whom?", "en/#audiences", "en/"],
    ["Impact fields", "en/#impact-fields", "en/"],
    ["Impact governance", "en/#governance", "en/"],
    ["Public impact space", "en/#public-impact-space", "en/"],
    ["Tools", "en/tools/", "en/tools/"],
    ["Learn", "en/#learn", "en/"],
    ["Library", "en/library/", "en/library/"],
    ["Join", "en/#join", "en/"],
  ].map(([label, href, match]) => `        <a href="../${escapeHtml(href)}" data-nav-match="${escapeHtml(match)}">${escapeHtml(label)}</a>`).join("\n");
}

function renderHeader(base, locale = "de", filePath = "") {
  const utilityLinks = (navigation.more || [])
    .map((item) => locale === "en" ? renderEnglishUtilityLink(base, item) : renderUtilityLink(base, item))
    .join("\n");
  const languageSwitch = renderLanguageSwitch(base, locale, filePath);
  const mainLinks = locale === "en" ? englishMainLinks() : (navigation.header || []).map((item) => renderMainLink(base, item)).join("\n");
  const brandHref = locale === "en" ? `${base}en/` : `${base}index.html`;
  const brandLabel = locale === "en" ? "Wirkungsökonomie English homepage" : "Wirkungsökonomie Startseite";
  const utilityLabel = locale === "en" ? "Quick links" : "Schnellzugriffe";
  const menuOpen = locale === "en" ? "Open menu" : "Menü öffnen";
  const menuText = locale === "en" ? "Menu" : "Menü";
  const navLabel = locale === "en" ? "Main navigation" : "Hauptnavigation";

  return `<header class="site-header" data-search-exclude>
      <a class="brand" href="${brandHref}" aria-label="${brandLabel}">
        <span class="brand-mark"><img src="${base}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span>
        <span class="brand-name">Wirkungsökonomie</span>
      </a>
      <nav class="site-utility-nav" aria-label="${utilityLabel}" data-search-exclude>
${utilityLinks}
${languageSwitch}
      </nav>
      <button class="nav-toggle" type="button" aria-label="${menuOpen}" aria-expanded="false" aria-controls="site-nav">
        <span class="nav-toggle-icon" aria-hidden="true">☰</span>
        <span class="sr-only">${menuText}</span>
      </button>
      <nav class="site-nav" id="site-nav" aria-label="${navLabel}" data-search-exclude>
${mainLinks}
        <div class="site-nav-utility" aria-label="${utilityLabel}">
${utilityLinks}
${languageSwitch}
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
    .filter((file) => !path.relative(ROOT, file).replace(/\\/g, "/").startsWith("templates/"))
    .filter((file) => fs.existsSync(file))
    .filter((file) => {
      const html = fs.readFileSync(file, "utf8");
      return html.includes('<header class="site-header"');
    });
}

let changed = 0;

for (const filePath of headerFiles()) {
  const before = fs.readFileSync(filePath, "utf8");
  const afterHeader = before.replace(/<header class="site-header"[\s\S]*?<\/header>/, renderHeader(prefixFor(filePath), isEnglishFile(filePath) ? "en" : "de", filePath));
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
