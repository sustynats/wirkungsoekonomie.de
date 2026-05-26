import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const targets = [
  "index.html",
  "buch.html",
  "downloads.html",
  "glossar.html",
  "akademie.html",
  "erleben.html",
  "anwendungen",
  "begriffe",
  "bibliothek",
  "blog",
  "downloads",
  "fachbibliothek",
  "fuer",
  "portale",
  "referenz",
  "verstehen",
  "werkstatt",
  "werkzeuge",
  "wirkungsfelder",
  "website-1-0-release",
];

const pathReplacements = [
  ["Konzeptpapiere", "Detailkonzepte"],
  ["Konzeptpapier", "Detailkonzept"],
  ["konzeptpapiere", "detailkonzepte"],
  ["konzeptpapier", "detailkonzept"],
  ["Praxisdossiers", "Einzeldossiers"],
  ["Praxisdossier", "Einzeldossier"],
  ["praxisdossiers", "einzeldossiers"],
  ["praxisdossier", "einzeldossier"],
  ["Übersicht", "Portalstartseite"],
  ["Uebersicht", "Portalstartseite"],
  ["uebersicht", "portalstartseite"],
];

function walk(entry, out = []) {
  const full = path.join(root, entry);
  if (!fs.existsSync(full)) return out;
  const stat = fs.statSync(full);
  if (stat.isDirectory()) {
    for (const child of fs.readdirSync(full, { withFileTypes: true })) {
      if (child.name === ".git" || child.name === "node_modules") continue;
      walk(path.join(entry, child.name), out);
    }
  } else if (full.endsWith(".html")) {
    out.push(full);
  }
  return out;
}

function isLocalUrl(value) {
  return (
    value &&
    !value.startsWith("#") &&
    !value.startsWith("http://") &&
    !value.startsWith("https://") &&
    !value.startsWith("mailto:") &&
    !value.startsWith("tel:") &&
    !value.startsWith("javascript:")
  );
}

function splitUrl(value) {
  const hashIndex = value.indexOf("#");
  const queryIndex = value.indexOf("?");
  const cut = [hashIndex, queryIndex].filter((index) => index >= 0).sort((a, b) => a - b)[0] ?? value.length;
  return {
    pathname: value.slice(0, cut),
    suffix: value.slice(cut),
  };
}

function normalizeAssetDepth(fromFile, pathname, suffix) {
  const assetMatch = pathname.match(/^(\.\.\/)+assets\//);
  if (!assetMatch) return null;
  const depth = path.relative(root, path.dirname(fromFile)).split(path.sep).filter(Boolean).length;
  return `${"../".repeat(depth)}assets/${pathname.slice(assetMatch[0].length)}${suffix}`;
}

function targetExists(fromFile, href) {
  const { pathname } = splitUrl(href);
  if (!pathname || pathname.endsWith("/")) {
    return fs.existsSync(path.resolve(path.dirname(fromFile), pathname, "index.html"));
  }
  return fs.existsSync(path.resolve(path.dirname(fromFile), pathname));
}

function repairHref(fromFile, href) {
  if (!isLocalUrl(href) || targetExists(fromFile, href)) return href;
  const { pathname, suffix } = splitUrl(href);
  const normalizedAsset = normalizeAssetDepth(fromFile, pathname, suffix);
  if (normalizedAsset && targetExists(fromFile, normalizedAsset)) return normalizedAsset;
  for (const [current, original] of pathReplacements) {
    if (!pathname.includes(current)) continue;
    const repairedPath = pathname.replaceAll(current, original);
    const candidate = `${repairedPath}${suffix}`;
    if (targetExists(fromFile, candidate)) return candidate;
    const normalizedCandidate = normalizeAssetDepth(fromFile, repairedPath, suffix);
    if (normalizedCandidate && targetExists(fromFile, normalizedCandidate)) return normalizedCandidate;
  }
  return href;
}

const files = [...new Set(targets.flatMap((target) => walk(target)))].sort();
const changed = [];
let repairedLinks = 0;

for (const file of files) {
  const before = fs.readFileSync(file, "utf8");
  const after = before.replace(/\b(href|src)=["']([^"']+)["']/g, (match, attr, value) => {
    const repaired = repairHref(file, value);
    if (repaired !== value) {
      repairedLinks += 1;
      return `${attr}="${repaired}"`;
    }
    return match;
  });
  if (after !== before) {
    fs.writeFileSync(file, after, "utf8");
    changed.push(path.relative(root, file));
  }
}

console.log(`Repaired ${repairedLinks} asset links in ${changed.length} files.`);
