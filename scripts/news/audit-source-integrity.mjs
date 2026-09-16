import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadNewsRegistry } from "./registry.mjs";
import { auditSourceIntegrity, newlyHeldStories } from "./source-integrity.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const store = JSON.parse(fs.readFileSync(path.join(root, "data/news/stories.json"), "utf8"));
const report = auditSourceIntegrity(store.stories, loadNewsRegistry(root));
const output = path.join(root, "reports/wirkungsticker-source-integrity.json");
// The committed report is the baseline. --strict fails on a NEW finding, which
// is a regression of this run, and records a known finding instead of
// discarding the whole publication cycle: a story that is already public is
// not repaired by stopping every other story and the deploy with it.
// --strict-all keeps the unconditional gate for manual audits.
const previous = fs.existsSync(output) ? JSON.parse(fs.readFileSync(output, "utf8")) : null;
const newlyHeld = newlyHeldStories(report, previous);
fs.writeFileSync(output, `${JSON.stringify({ ...report, known_findings_before: (previous?.findings || []).map((finding) => finding.story_id).sort() }, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ output, stories_checked: report.stories_checked, sources_checked: report.sources_checked, passed: report.passed, held: report.held,
  newly_held: newlyHeld.length, newly_held_stories: newlyHeld.slice(0, 10),
  known_held: report.held - newlyHeld.length }, null, 2));
if (process.argv.includes("--strict") && newlyHeld.length) process.exitCode = 1;
if (process.argv.includes("--strict-all") && report.held) process.exitCode = 1;
