import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();
const source = fs.readFileSync(path.join(root, "assets/js/impact-calculations.js"), "utf8");
const sandbox = { module: { exports: {} }, globalThis: {} };
vm.createContext(sandbox);
vm.runInContext(source, sandbox);
const calc = sandbox.module.exports;

function assert(condition, message) {
  if (!condition) {
    console.error(`Tool example check failed: ${message}`);
    process.exit(1);
  }
}

const final = calc.calculateFinalScore({ klima: 2, arbeit: -1, demokratie: 1 }, false);
assert(final.finalScore === -1, "calculateFinalScore must use the minimum critical score.");

const blockedFinal = calc.calculateFinalScore({ klima: 2, arbeit: 2 }, true);
assert(blockedFinal.finalScore === -3 && blockedFinal.status === "blocked", "red line must block positive FinalScore.");

const blockedNwi = calc.calculateTSROI({ nwi: -0.1, transformation: 100, investment: 100 });
assert(blockedNwi.status === "blocked", "T-SROI must block negative NWI.");

const blockedRedLine = calc.calculateTSROI({ nwi: 1, redLineActive: true, transformation: 100, investment: 100 });
assert(blockedRedLine.status === "blocked", "T-SROI must block active red line.");

const zeroSafe = calc.calculateTSROI({ nwi: 1, transformation: 10, systemLeverage: 2, timeFactor: 1, resilienceFactor: 1, dataQuality: 1, investment: 0 });
assert(Number.isFinite(zeroSafe.tsroi), "T-SROI must prevent division by zero.");

const computed = calc.calculateTSROI({ nwi: 1, transformation: 10, systemLeverage: 2, timeFactor: 1.5, resilienceFactor: 1, dataQuality: 0.5, investment: 5 });
assert(Math.abs(computed.tsroi - 3) < 0.0001, "T-SROI model value must be calculated correctly.");

const examples = JSON.parse(fs.readFileSync(path.join(root, "assets/data/tool-examples.json"), "utf8"));
assert(examples.length >= 12, "tool example data must include the required core examples.");
assert(fs.existsSync(path.join(root, "werkzeuge/dashboard/index.html")), "tool dashboard route must exist.");
assert(fs.readFileSync(path.join(root, "werkzeuge/t-sroi/index.html"), "utf8").includes("data-tool-example-tsroi"), "T-SROI page must include interactive example.");

console.log(`Tool example checks passed: ${examples.length} examples.`);
