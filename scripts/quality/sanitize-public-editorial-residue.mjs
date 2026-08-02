import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checkOnly = process.argv.includes("--check");
const excludedDirectories = new Set([
  ".git",
  ".github",
  "_site",
  "docs",
  "node_modules",
  "reports",
  "scripts",
  "tmp",
]);
const eligibleExtensions = new Set([".htm", ".html", ".md"]);
const residualPatterns = [
  /Auszug aus der umfangreichen Korrekturfassung\.?/i,
  /ergänzende\s+ergänzende/i,
];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      if (excludedDirectories.has(entry.name)) return [];
      return walk(path.join(directory, entry.name));
    }
    if (!entry.isFile() || !eligibleExtensions.has(path.extname(entry.name).toLowerCase())) return [];
    return [path.join(directory, entry.name)];
  });
}

function sanitize(content) {
  return content
    .replace(/Auszug aus der umfangreichen Korrekturfassung\.?/gi, "Fachliche Vertiefung")
    .replace(/ergänzende\s+ergänzende/gi, "ergänzende");
}

const affected = [];
for (const file of walk(root)) {
  const content = fs.readFileSync(file, "utf8");
  if (!residualPatterns.some((pattern) => pattern.test(content))) continue;
  affected.push(path.relative(root, file));
  if (!checkOnly) fs.writeFileSync(file, sanitize(content), "utf8");
}

if (checkOnly && affected.length) {
  console.error(`Öffentliche Redaktionsreste gefunden:\n${affected.join("\n")}`);
  process.exit(1);
}

console.log(
  checkOnly
    ? "Öffentliche Redaktionsreste: keine gefunden."
    : `Öffentliche Redaktionsreste bereinigt: ${affected.length} Datei(en).`,
);
