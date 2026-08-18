import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const requiredFiles = [
  "app/tokens.css",
  "docs/parlament/design-tokens/tokens.json",
  "public/fonts/source-serif-4-400.woff2",
  "public/fonts/source-sans-3-400.woff2"
];

const failures = requiredFiles.filter((path) => !existsSync(resolve(root, path))).map((path) => `fehlt: ${path}`);
const globals = read("app/globals.css");
const tokens = read("app/tokens.css");

if (!globals.startsWith('@import "./tokens.css";')) failures.push("app/tokens.css wird nicht als erstes Stylesheet geladen");
if (/\bInter\b/i.test(`${globals}\n${tokens}`)) failures.push("nicht freigegebene Schrift Inter gefunden");
for (const token of ["--groesse-h1", "--tippziel-min", "--spalten-kachel-min", "--farbe-fokus"]) {
  if (!tokens.includes(token)) failures.push(`verbindlicher Token fehlt: ${token}`);
}

if (failures.length) {
  console.error("Design-Token-Prüfung fehlgeschlagen:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log("Design-Token-Prüfung bestanden.");
