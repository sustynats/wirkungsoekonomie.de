#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const targets = [".next/output/static", ".next/static", "public"];
const blockedAuthoringMarker = new RegExp(
  [
    ["chat", "gpt"],
    ["open", "ai"],
    ["cla", "ude"],
    ["co", "dex"],
    ["anth", "ropic"],
    ["gem", "ini"],
    ["co", "pilot"],
  ]
    .map((parts) => parts.join(""))
    .join("|"),
  "i",
);
const blockedPatterns = [
  { label: "local macOS path", pattern: /\/Users\/[A-Za-z0-9._-]+\// },
  { label: "local Linux home path", pattern: /\/home\/[A-Za-z0-9._-]+\// },
  { label: "local volume path", pattern: /\/Volumes\/[A-Za-z0-9._ -]+\// },
  { label: "private temporary path", pattern: /\/(?:private\/)?(?:tmp|var\/folders)\// },
  { label: "local file URL", pattern: /file:\/{2,3}\/(?:Users|home)\/[A-Za-z0-9._-]+\//i },
  { label: "external authoring-system marker", pattern: blockedAuthoringMarker },
];
const ignoredDirectories = new Set(["cache"]);
const failures = [];
let filesScanned = 0;

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) files.push(...walk(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

for (const target of targets) {
  for (const file of walk(path.join(root, target))) {
    const content = fs.readFileSync(file).toString("latin1");
    const relative = path.relative(root, file).split(path.sep).join("/");
    filesScanned += 1;
    for (const { label, pattern } of blockedPatterns) {
      if (pattern.test(content)) failures.push(`${relative}: ${label}`);
    }
  }
}

if (failures.length) {
  console.error("Public release safety gate failed:");
  for (const failure of failures.slice(0, 80)) console.error(`- ${failure}`);
  if (failures.length > 80) console.error(`... ${failures.length - 80} more`);
  process.exit(1);
}

console.log(`Public release safety gate passed (${filesScanned} files scanned).`);
