import fs from "node:fs";
import vm from "node:vm";
import { execFileSync } from "node:child_process";

const root = new URL("../..", import.meta.url);
const file = (path) => new URL(path, root);
const read = (path) => fs.readFileSync(file(path), "utf8");
const fail = (message) => { throw new Error(message); };
const index = read("werkzeuge/wahlkreis-wirkungscheck/index.html");

for (const required of [
  "Wirkungscheck Bundestag",
  "Was soll Bundespolitik tatsächlich bewirken?",
  "Parteiunabhängiger Arbeitscheck",
  "Woran misst der Wirkungscheck Wirkung?",
  "Mensch, Planet und Demokratie",
  "SDG+-Erweiterung der Wirkungsökonomie",
  "Staatsziele und Verfassungsaufträge",
  "Keine Personenbewertung",
  "v3-stage",
  "v3-report",
  "data-no-political-standard",
  "wirkungscheck-bundestag-v3.css",
  "topic-modules-v3.js",
  "rules-v3.js",
  "analytics-v3.js",
  "app-v3.js"
]) if (!index.includes(required)) fail(`Pflichtbestandteil fehlt: ${required}`);

if (/canvas|svg[^>]*chart|chart\.js|prognosekurve/i.test(index)) fail("Die V3 darf keine pseudoquantitative Kurve enthalten.");
if (!/noindex, nofollow/.test(index)) fail("V3 muss bis zur Abnahme noindex bleiben.");

for (const script of [
  "assets/js/wirkungscheck-bundestag-v3/topic-modules-v3.js",
  "assets/js/wirkungscheck-bundestag-v3/rules-v3.js",
  "assets/js/wirkungscheck-bundestag-v3/analytics-v3.js",
  "assets/js/wirkungscheck-bundestag-v3/app-v3.js"
]) execFileSync("node", ["--check", file(script).pathname], { stdio: "inherit" });

const sandbox = { window: {} };
vm.runInNewContext(read("assets/js/wirkungscheck-bundestag-v3/topic-modules-v3.js"), sandbox);
vm.runInNewContext(read("assets/js/wirkungscheck-bundestag-v3/rules-v3.js"), sandbox);
const modules = sandbox.window.WC_V3_MODULES.modules;
if (Object.keys(modules).sort().join(",") !== "health,housing") fail("Der V3-Pilot muss genau die zwei vollständigen Themenmodule enthalten.");
for (const [key, module] of Object.entries(modules)) {
  for (const field of ["goals", "approaches", "redLines", "signals", "regionalPrompts"]) {
    if (!Array.isArray(module[field]) || !module[field].length) fail(`${key}: ${field} ist nicht vollständig.`);
  }
  const derived = sandbox.window.WC_V3_RULES.derive(module, {
    goal: module.goals[0].id,
    approach: module.approaches[0].id,
    bottlenecks: ["rules", "data"],
    redLines: [module.redLines[0].id],
    signals: [module.signals[0].id]
  });
  if (derived.path.length !== 5 || !derived.correction || !derived.roles.length) fail(`${key}: Ableitung ist nicht vollständig.`);
}

console.log("V3 validation passed: modules, rule engine, privacy guardrails and public shell.");
