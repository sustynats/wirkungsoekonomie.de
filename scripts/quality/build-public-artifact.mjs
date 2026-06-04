import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const artifactDir = path.join(root, "_site");

const excludedTopLevelDirs = new Set([
  ".git",
  ".github",
  ".next",
  ".codex-backup",
  "_internal",
  "_site",
  "components",
  "content",
  "data",
  "docs",
  "export",
  "lib",
  "manifest",
  "node_modules",
  "outputs",
  "reports",
  "scripts",
  "source-assets",
  "src",
  "sustynats",
  "templates",
  "tiktok_archive",
  "tiktok_library",
  "tools",
]);

const excludedTopLevelFiles = new Set([
  ".git",
  ".gitignore",
  "AGENTS.md",
  "BLOG-WORKFLOW.md",
  "BRAND-GUIDE.md",
  "README.md",
  "SITE-INVENTORY.md",
  "begruenderin-integration-audit.md",
  "blog-audit.md",
  "glossar-integration-audit.md",
  "linkedin-co2-preis-warum-wir-ihn-ohnehin-zahlen-entwurf.md",
  "linkedin-warum-billig-oft-teuer-ist-entwurf.md",
  "package.json",
  "performance-audit.md",
  "qa-report.md",
  "redirect-map.md",
  "sprach-audit.md",
]);

const allowedRootFileExtensions = new Set([
  ".html",
  ".txt",
  ".xml",
  ".ico",
  ".png",
  ".jpg",
  ".jpeg",
  ".webmanifest",
]);

const allowedRootFiles = new Set(["CNAME"]);

function removeArtifact() {
  fs.rmSync(artifactDir, { recursive: true, force: true });
  fs.mkdirSync(artifactDir, { recursive: true });
}

function shouldCopyRootFile(name) {
  if (excludedTopLevelFiles.has(name)) return false;
  if (allowedRootFiles.has(name)) return true;
  return allowedRootFileExtensions.has(path.extname(name).toLowerCase());
}

function copyEntry(entry) {
  const source = path.join(root, entry.name);
  const destination = path.join(artifactDir, entry.name);

  if (entry.isDirectory()) {
    if (excludedTopLevelDirs.has(entry.name)) return false;
    fs.cpSync(source, destination, { recursive: true, preserveTimestamps: true });
    return true;
  }

  if (entry.isFile() && shouldCopyRootFile(entry.name)) {
    fs.copyFileSync(source, destination);
    return true;
  }

  return false;
}

function collectSize(dir) {
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) total += collectSize(full);
    else if (entry.isFile()) total += fs.statSync(full).size;
  }
  return total;
}

removeArtifact();

let copied = 0;
for (const entry of fs.readdirSync(root, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
  if (copyEntry(entry)) copied += 1;
}

const mb = collectSize(artifactDir) / 1024 / 1024;
console.log(`Built _site with ${copied} top-level entries (${mb.toFixed(1)} MB).`);
