/** Reproducible text preservation proof. Reads Git; never edits Fachdata. */
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import ts from "typescript";

const base = process.env.PORTAL_TEXT_BASE ?? "4d57b24dab20fa1daf63a661cdcd69dd04cc195c";
const repository = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
const app = resolve(repository, "woek-parlament-app/app");
function texts(content: string, name: string) {
  const file = ts.createSourceFile(name, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const result: string[] = [];
  function walk(node: ts.Node) {
    // JSX text and long literals cover prose as well as data-bound section copy.
    if (ts.isJsxText(node) || (ts.isStringLiteral(node) && node.text.length >= 35 && /[ .!?]/.test(node.text))) {
      const text = node.text.replace(/\s+/g, " ").trim();
      if (text && !text.startsWith("@/") && !text.startsWith("https:") && !text.startsWith("/")) result.push(text);
    }
    ts.forEachChild(node, walk);
  }
  walk(file);
  return [...new Set(result)];
}
function files(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((item) => item.isDirectory() ? files(resolve(root, item.name)) : item.name.endsWith(".tsx") ? [resolve(root, item.name)] : []);
}
const current = new Map<string, string[]>();
for (const file of files(app)) for (const text of texts(readFileSync(file, "utf8"), file)) current.set(text, [...(current.get(text) ?? []), file.slice(repository.length + 1)]);
const changed = execFileSync("git", ["diff", "--name-only", base, "--", "woek-parlament-app/app"], { cwd: repository, encoding: "utf8" }).trim().split("\n").filter((file) => file.endsWith(".tsx"));
const records = changed.flatMap((file) => {
  let old: string;
  try { old = execFileSync("git", ["show", `${base}:${file}`], { cwd: repository, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }); } catch { return []; }
  return texts(old, file).map((text) => {
    const targets = current.get(text) ?? [];
    const fixedTitle = / [·|] Wirkungsportal Parlament$/.test(text) && readFileSync(resolve(repository, file), "utf8").includes(`title: "${text.replace(/ [·|] Wirkungsportal Parlament$/, "")}"`);
    return { source: file, text, status: targets.includes(file) ? "UNCHANGED" : targets.length ? "MOVED_EXACT" : fixedTitle ? "TITLE_SUFFIX_DEDUPLICATED" : "MISSING", destinations: targets.length ? targets : fixedTitle ? [file] : [] };
  });
});
const missing = records.filter((record) => record.status === "MISSING");
const report = { base_commit: base, phase: "P5", policy: "No published paragraph removed; navigation labels may be regrouped. Canonical data untouched.", total_text_objects: records.length, missing: missing.length, records };
const output = process.env.PORTAL_TEXT_REPORT;
if (output) { mkdirSync(dirname(output), { recursive: true }); writeFileSync(output, JSON.stringify(report, null, 2) + "\n"); }
if (missing.length) { console.error(JSON.stringify(missing, null, 2)); process.exitCode = 1; }
else console.log(`PORTAL_TEXT_INVENTORY=PASS (${records.length} text objects, 0 missing; base ${base})`);
