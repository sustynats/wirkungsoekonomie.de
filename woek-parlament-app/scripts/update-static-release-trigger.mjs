import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const appRoot = process.cwd();
const repositoryRoot = path.resolve(appRoot, "..");
const triggerPath = path.join(repositoryRoot, ".github", "static-release-trigger.json");
const { stdout } = await execFileAsync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "--", "woek-parlament-app"], { cwd: repositoryRoot, maxBuffer: 50 * 1024 * 1024 });
const excluded = [
  /^woek-parlament-app\/tests\//,
  /^woek-parlament-app\/docs\//,
  /^woek-parlament-app\/data\/generated\/autopilot-health\.json$/,
  /^woek-parlament-app\/\.env/,
];
const files = stdout.split(/\r?\n/).filter(Boolean).filter((filename) => !excluded.some((pattern) => pattern.test(filename))).sort();
const hash = createHash("sha256");
for (const filename of files) {
  hash.update(filename);
  hash.update("\0");
  hash.update(await readFile(path.join(repositoryRoot, filename)));
  hash.update("\0");
}
const fingerprint = hash.digest("hex");
let previous = null;
try { previous = JSON.parse(await readFile(triggerPath, "utf8")); } catch { /* First release trigger. */ }
if (previous?.fingerprint === fingerprint) {
  console.log(`Static release trigger unchanged: ${fingerprint}`);
  process.exit(0);
}
await writeFile(triggerPath, `${JSON.stringify({ schema_version: "1.0", generated_at: new Date().toISOString(), fingerprint, file_count: files.length }, null, 2)}\n`);
console.log(`Static release trigger updated: ${fingerprint} (${files.length} files)`);
