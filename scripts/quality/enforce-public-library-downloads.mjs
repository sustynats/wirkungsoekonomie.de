import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const targets = [
  "downloads.html",
  "downloads",
  "fachbibliothek",
  "bibliothek",
  "portale",
].map((item) => path.join(root, item)).filter((item) => fs.existsSync(item));

const artifactPattern = /\.(?:json|md|zip|xlsx|xls|csv)\b|content_index|toolcards_|Bestands-und-Nachlieferliste|Nachlieferliste|README_Rang\d+|Import pruefen|Import prüfen|ZIP-Gesamtpaket/i;

function walk(entry, out = []) {
  const stat = fs.statSync(entry);
  if (stat.isDirectory()) {
    for (const child of fs.readdirSync(entry, { withFileTypes: true })) {
      if (child.name === ".git" || child.name === "node_modules") continue;
      walk(path.join(entry, child.name), out);
    }
  } else if (entry.endsWith(".html")) {
    out.push(entry);
  }
  return out;
}

function removeArtifactBlocks(html) {
  let changed = html;
  let removed = 0;

  changed = changed.replace(/<tr\b[\s\S]*?<\/tr>/gi, (match) => {
    if (!artifactPattern.test(match)) return match;
    removed += 1;
    return "";
  });

  changed = changed.replace(/<article\b[\s\S]*?<\/article>/gi, (match) => {
    if (!artifactPattern.test(match)) return match;
    removed += 1;
    return "";
  });

  changed = changed.replace(/<a\b[^>]*href=["'][^"']+\.zip(?:[#?][^"']*)?["'][^>]*>[\s\S]*?<\/a>/gi, () => {
    removed += 1;
    return "";
  });

  changed = changed.replace(/<a\b[^>]*href=["'][^"']*(?:bestands-und-nachlieferliste|Bestands-und-Nachlieferliste|Nachlieferliste)[^"']*["'][^>]*>[\s\S]*?<\/a>/gi, () => {
    removed += 1;
    return "";
  });

  changed = changed
    .replace(/ZIP-Gesamtpaket,\s*/g, "")
    .replace(/,\s*ZIP-Gesamtpaket/g, "")
    .replace(/\s*sowie das bereinigte ZIP-Gesamtpaket/gi, "")
    .replace(/PDF- und PDF-Downloads/gi, "PDF-Downloads")
    .replace(/PDF- und DOCX-Downloads/gi, "PDF-Downloads")
    .replace(/ergänzende ergänzende Downloadfassungen/gi, "ergänzende Downloadfassungen")
    .replace(/<div class="hero-actions(?: no-print)?">\s*<\/div>/gi, "");

  return { html: changed, removed };
}

let changedFiles = 0;
let removedBlocks = 0;

for (const file of targets.flatMap((target) => walk(target))) {
  const before = fs.readFileSync(file, "utf8");
  const result = removeArtifactBlocks(before);
  if (result.html !== before) {
    fs.writeFileSync(file, result.html, "utf8");
    changedFiles += 1;
    removedBlocks += result.removed;
  }
}

console.log(`Public library downloads sanitized: ${removedBlocks} artifact blocks/links removed from ${changedFiles} file(s).`);
