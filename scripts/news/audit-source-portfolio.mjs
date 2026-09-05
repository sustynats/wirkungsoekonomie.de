import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadNewsRegistry, registryErrors } from "./registry.mjs";
import { buildSourcePortfolioAudit, SOURCE_PORTFOLIO_AUDIT_DATE } from "./source-portfolio.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (relative, fallback) => {
  const filename = path.join(root, relative);
  return fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename, "utf8")) : fallback;
};
const registry = loadNewsRegistry(root);
const errors = registryErrors(registry);
if (errors.length) throw new Error(errors.join(","));
const usage = read("data/news/usage.json", { runs: [] });
const state = read("data/news/state.json", {});
const report = buildSourcePortfolioAudit(registry, usage, state, SOURCE_PORTFOLIO_AUDIT_DATE);
const currentDate = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const currentReport = buildSourcePortfolioAudit(registry, usage, state, currentDate);
const output = path.join(root, "data/wirkungsticker", `source-audit-${SOURCE_PORTFOLIO_AUDIT_DATE}.json`);
const currentOutput = path.join(root, "reports/wirkungsticker-source-portfolio.json");
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`, "utf8");
fs.mkdirSync(path.dirname(currentOutput), { recursive: true });
fs.writeFileSync(currentOutput, `${JSON.stringify(currentReport, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ output, current_output: currentOutput, ...currentReport.summary, changes: currentReport.changes.length, do_not_activate: currentReport.do_not_activate.length }, null, 2));
if (process.argv.includes("--strict") && (errors.length || report.changes.length > 20)) process.exitCode = 1;
