#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const targetDir = path.join(repoRoot, "templates");
const required = [
  "WOeK_Dossier_Konzept_Referenztemplate.docx",
  "WOeK_Dossier_Konzept_Template.dotx",
  "WOeK_Dokumentlayout_Style_Map.yml",
  "assets/woek-signet.png",
];

function fail(message) {
  console.error(message);
  process.exit(1);
}

const zipArg = process.argv[2];
if (!zipArg) {
  fail("Usage: node scripts/documents/import-woek-dossier-template.mjs <WOeK_Dossier_Template_Paket.zip>");
}

const zipPath = path.resolve(zipArg);
if (!fs.existsSync(zipPath)) {
  fail(`Template package not found: ${zipPath}`);
}

fs.mkdirSync(targetDir, { recursive: true });
const list = spawnSync("unzip", ["-Z1", zipPath], { encoding: "utf8" });
if (list.status !== 0) {
  fail(`Could not inspect ZIP package: ${list.stderr || list.stdout}`);
}

const entries = list.stdout.split(/\r?\n/).filter(Boolean);
const missing = required.filter((name) => !entries.some((entry) => entry.endsWith(name)));
if (missing.length) {
  fail(`Template package is missing required files:\n- ${missing.join("\n- ")}`);
}

const tmpDir = fs.mkdtempSync(path.join(repoRoot, ".tmp-woek-template-"));
try {
  const unzip = spawnSync("unzip", ["-q", zipPath, "-d", tmpDir], { encoding: "utf8" });
  if (unzip.status !== 0) {
    fail(`Could not extract ZIP package: ${unzip.stderr || unzip.stdout}`);
  }

  for (const requiredFile of required) {
    const source = entries
      .filter((entry) => entry.endsWith(requiredFile))
      .map((entry) => path.join(tmpDir, entry))[0];
    if (!source || !fs.existsSync(source)) {
      fail(`Extracted package did not contain ${requiredFile}`);
    }
    const dest = path.join(targetDir, requiredFile);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(source, dest);
  }
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

console.log(`Imported WÖk dossier template package into ${path.relative(repoRoot, targetDir)}`);
for (const file of required) {
  console.log(`- ${path.join("templates", file)}`);
}
