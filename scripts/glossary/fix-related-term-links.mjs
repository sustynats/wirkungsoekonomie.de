import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "public/data/glossary.terms.json");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));

const anchorToUrl = new Map();

for (const term of registry.terms || []) {
  const slug = term.slug;
  if (!slug) continue;
  const url = term.pageUrl || `/begriffe/${slug}/`;
  const anchors = [
    term.glossaryAnchor,
    `klassisch-${slug}`,
    `begriff-${slug}`,
    term.termId ? `klassisch-${term.termId}` : "",
    term.id ? `klassisch-${term.id}` : "",
  ].filter(Boolean);
  for (const anchor of anchors) {
    anchorToUrl.set(anchor, url);
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(fullPath));
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(fullPath);
  }
  return files;
}

const files = [
  path.join(root, "glossar.html"),
  ...walk(path.join(root, "begriffe")),
];

let changed = 0;
let replacements = 0;

for (const file of files) {
  const before = fs.readFileSync(file, "utf8");
  const after = before.replace(/href="(?:(?:\.\.\/)*|\/)?glossar\.html#([^"]+)"/g, (match, anchor) => {
    const url = anchorToUrl.get(anchor);
    if (!url) return match;
    replacements += 1;
    return `href="${url}"`;
  }).replace(/href="#(klassisch-[^"]+)"/g, (match, anchor) => {
    const url = anchorToUrl.get(anchor);
    if (!url) return match;
    replacements += 1;
    return `href="${url}"`;
  });

  if (after !== before) {
    fs.writeFileSync(file, after);
    changed += 1;
  }
}

console.log(`Related glossary links repaired: ${replacements} link(s) in ${changed} file(s).`);
