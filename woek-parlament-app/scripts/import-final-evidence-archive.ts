import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { importReviewResult } from "@/lib/editorial/review-results";

function loadLocalEnvironment() {
  try {
    for (const line of readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8").split(/\r?\n/)) {
      if (!line || line.startsWith("#")) continue;
      const separator = line.indexOf("=");
      if (separator < 1) continue;
      const name = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
      if (name && process.env[name] === undefined) process.env[name] = value;
    }
  } catch {
    // Production supplies its environment directly.
  }
}

async function main() {
  loadLocalEnvironment();
  const inputArgument = process.argv.find((argument) => argument.startsWith("--input="));
  if (!inputArgument) throw new Error("Usage: review:import-final-evidence -- --input=/absolute/path/to/final-evidence.zip");

  const input = path.resolve(inputArgument.slice("--input=".length));
  const archive = await readFile(input);
  if (archive.byteLength === 0 || archive.byteLength > 20 * 1024 * 1024) throw new Error("Evidence archive has an invalid size.");
  const zip = await JSZip.loadAsync(archive);
  const entries = Object.values(zip.files).filter((entry) => !entry.dir && /(^|\/)review-result\.json$/i.test(entry.name));
  if (entries.length === 0 || entries.length > 15) throw new Error("Evidence archive has an invalid number of review results.");

  const imported = [];
  for (const entry of entries) {
    const raw = await entry.async("string");
    imported.push(await importReviewResult(JSON.parse(raw)));
  }

  console.log(JSON.stringify({ input: path.basename(input), imported: imported.length, results: imported }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Could not import evidence archive.");
  process.exit(1);
});
