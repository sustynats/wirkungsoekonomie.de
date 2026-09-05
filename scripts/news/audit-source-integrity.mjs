import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadNewsRegistry } from "./registry.mjs";
import { auditSourceIntegrity } from "./source-integrity.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const store = JSON.parse(fs.readFileSync(path.join(root, "data/news/stories.json"), "utf8"));
const report = auditSourceIntegrity(store.stories, loadNewsRegistry(root));
const output = path.join(root, "reports/wirkungsticker-source-integrity.json");
fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ output, stories_checked: report.stories_checked, sources_checked: report.sources_checked, passed: report.passed, held: report.held }, null, 2));
if (process.argv.includes("--strict") && report.held) process.exitCode = 1;
