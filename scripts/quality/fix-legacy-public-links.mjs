import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.name === ".git" || entry.name === "_site" || entry.name === "node_modules") continue;
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.isFile() && entry.name.endsWith(".html")) acc.push(full);
  }
  return acc;
}

function normalizeHtml(file, html) {
  const rel = path.relative(ROOT, file).replaceAll(path.sep, "/");
  let next = html
    .replaceAll('href="../tools/"', 'href="../werkzeuge/"')
    .replaceAll('href="../../tools/"', 'href="../../werkzeuge/"')
    .replaceAll('href="../../../tools/"', 'href="../../../werkzeuge/"')
    .replaceAll('href="/tools/"', 'href="/werkzeuge/"')
    .replaceAll('href="tools/"', 'href="werkzeuge/"')
    .replaceAll('href="../begriffe/wirkpfad/"', 'href="../begriffe/wirkungspfad/"');

  if (/^dokumente\/[^/]+\/index\.html$/.test(rel)) {
    next = next.replace(/href="bibliothek\//g, 'href="../../bibliothek/');
  }

  return next;
}

let changed = 0;
for (const file of walk(ROOT)) {
  const before = fs.readFileSync(file, "utf8");
  const after = normalizeHtml(file, before);
  if (after !== before) {
    fs.writeFileSync(file, after, "utf8");
    changed += 1;
  }
}

console.log(`Legacy public links normalized: ${changed} files.`);
