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

const nwi = calc.calculateNWI({ positive: 2.4, negative: 0.9, gatePassed: true });
assert(Math.abs(nwi.nwi - 1.5) < 0.000001 && nwi.status === "tragfaehig", "NWI must remain the documented difference on one scale, not a percentage or a currency amount.");

const undocumentedNwi = calc.calculateNWI({ positive: 2.4, negative: 0.9 });
assert(undocumentedNwi.nwi === null && undocumentedNwi.status === "blocked", "NWI must fail closed without an explicit passed protection gate.");

const blockedNwi = calc.calculateNWI({ positive: 2.4, negative: 0.9, redLineActive: true });
assert(blockedNwi.nwi === null && blockedNwi.raw === 1.5 && blockedNwi.status === "blocked", "A red line must retain the visible raw profile but block a positive NWI claim.");

const independentNwiGate = calc.calculateNwiGate({
  scores: { mensch: 2, planet: 1, demokratie: 1 },
  dataQuality: 0.8,
  systemBoundaryDefined: true,
  attributionDefined: true,
});
assert(independentNwiGate.passed, "NWI must have its own documented protection gate without a monetary resource denominator.");

const evaluated = calc.calculateTSROI({
  investment: 1000000,
  annualDirectBenefit: 500000,
  annualTransformativeBenefit: 200000,
  annualHarm: 100000,
  years: 2,
  benefitDiscountRate: 0.05,
  scores: { mensch: 2, planet: 1, demokratie: 1 },
  dataQuality: 0.8,
  uncertainty: 0,
  systemBoundaryDefined: true,
  attributionDefined: true,
});
assert(evaluated.gate.passed, "A complete positive profile and conservative lower net benefit must open the gate.");
assert(Math.abs(evaluated.benefitPv - 1115646.2585) < 0.01, "T-SROI must discount net benefit cash flows correctly.");
assert(Math.abs(evaluated.tsroi - 1.1156462585) < 0.000001, "T-SROI must be a EUR/EUR ratio of discounted net benefit and resources.");

const blockedRedLine = calc.calculateTSROI({
  investment: 100,
  annualDirectBenefit: 200,
  years: 1,
  scores: { mensch: 2, planet: 2, demokratie: 2 },
  dataQuality: 1,
  redLineActive: true,
});
assert(blockedRedLine.status === "blocked" && blockedRedLine.tsroi === null, "T-SROI must block an active red line instead of showing a positive value.");

const blockedProfile = calc.calculateTSROI({
  investment: 100,
  annualDirectBenefit: 200,
  years: 1,
  scores: { mensch: 2, planet: -1, demokratie: 2 },
  dataQuality: 1,
});
assert(blockedProfile.status === "blocked" && blockedProfile.ioi === null, "A negative core profile must block IOI and T-SROI.");

const lowQuality = calc.calculateTSROI({
  investment: 100,
  annualDirectBenefit: 200,
  annualHarm: 50,
  years: 1,
  scores: { mensch: 2, planet: 1, demokratie: 1 },
  dataQuality: 0.4,
});
assert(lowQuality.status === "blocked", "Insufficient data quality must close the gate.");
assert(Math.abs(lowQuality.harmPv - (50 / 1.05)) < 0.001, "Data quality must not attenuate a monetary harm value.");

const conservativeHarm = calc.calculateTSROI({
  investment: 1000,
  annualDirectBenefit: 1000,
  annualHarm: 200,
  years: 1,
  attribution: 0.5,
  scores: { mensch: 2, planet: 1, demokratie: 1 },
  dataQuality: 1,
  systemBoundaryDefined: true,
  attributionDefined: true,
});
assert(Math.abs(conservativeHarm.directPv - (500 / 1.05)) < 0.001, "The causal share must reduce the claimed benefit.");
assert(Math.abs(conservativeHarm.harmPv - (200 / 1.05)) < 0.001, "The base model must not silently reduce conservative harms with the benefit factor.");

const conservativeScenario = calc.calculateTSROI({
  investment: 1000,
  annualDirectBenefit: 100,
  annualHarm: 60,
  years: 1,
  uncertainty: 0.2,
  scores: { mensch: 2, planet: 1, demokratie: 1 },
  dataQuality: 1,
  systemBoundaryDefined: true,
  attributionDefined: true,
});
assert(Math.abs(conservativeScenario.lowerNetBenefitPv - (20 / 1.05)) < 0.001, "The conservative scenario must reduce only claimed benefits and leave harm unchanged.");
assert(conservativeScenario.lowerNetBenefitPv < conservativeScenario.benefitPv, "A conservative benefit reduction must never make the lower net benefit more favorable.");

const separateTransformation = calc.calculateTSROI({
  investment: 100,
  annualDirectBenefit: 100,
  annualTransformativeBenefit: 50,
  annualHarm: 10,
  years: 1,
  scores: { mensch: 2, planet: 1, demokratie: 1 },
  dataQuality: 1,
  systemBoundaryDefined: true,
  attributionDefined: true,
});
assert(Math.abs(separateTransformation.transformativePv - (50 / 1.05)) < 0.001, "A documented transformative benefit must be a separate discounted EUR stream, not a multiplier.");
assert(Math.abs(separateTransformation.tsroi - (140 / 1.05 / 100)) < 0.000001, "T-SROI must add separately evidenced benefits and subtract harm before division by resources.");

const zeroSafe = calc.calculateTSROI({
  investment: 0,
  annualDirectBenefit: 10,
  years: 1,
  scores: { mensch: 2, planet: 2, demokratie: 2 },
  dataQuality: 1,
  systemBoundaryDefined: true,
  attributionDefined: true,
});
assert(zeroSafe.status === "blocked" && zeroSafe.tsroi === null && !zeroSafe.gate.passed, "Zero resources must close the gate and block the ratio instead of inventing a denominator.");
assert(independentNwiGate.passed && zeroSafe.status === "blocked", "A documented NWI profile must remain independently evaluable when a separate monetary T-SROI ratio has no denominator.");

const undocumentedGate = calc.calculateTSROI({
  investment: 100,
  annualDirectBenefit: 200,
  years: 1,
  scores: { mensch: 2, planet: 1, demokratie: 1 },
  dataQuality: 0.8,
});
assert(undocumentedGate.status === "blocked" && !undocumentedGate.gate.passed, "T-SROI must fail closed without explicit system-boundary and attribution evidence.");

const incompleteProfile = calc.calculateTSROI({
  investment: 100,
  annualDirectBenefit: 200,
  years: 1,
  scores: { mensch: 2, planet: 1 },
  dataQuality: 0.8,
  systemBoundaryDefined: true,
  attributionDefined: true,
});
assert(incompleteProfile.status === "blocked" && !incompleteProfile.gate.passed, "T-SROI must require all three core profile fields.");

const validGateInput = {
  investment: 100,
  annualDirectBenefit: 200,
  years: 1,
  scores: { mensch: 2, planet: 1, demokratie: 1 },
  dataQuality: 0.8,
  systemBoundaryDefined: true,
  attributionDefined: true,
};
for (const [label, patch] of Object.entries({
  emptyProfile: { scores: { mensch: "", planet: "", demokratie: "" } },
  nullProfile: { scores: { mensch: null, planet: null, demokratie: null } },
  zeroHorizon: { years: 0 },
  fractionalHorizon: { years: 1.6 },
  excessiveHorizon: { years: 101 },
  negativeDiscountRate: { benefitDiscountRate: -0.1 },
  emptyDiscountRate: { benefitDiscountRate: "" },
  excessiveAttribution: { attribution: 1.5 },
  negativeDeadweight: { deadweight: -0.2 },
  excessiveDisplacement: { displacement: 1.2 },
  negativeInvestment: { investment: -100 },
  negativeDirectBenefit: { annualDirectBenefit: -200 },
  negativeHarm: { annualHarm: -100 },
  negativeOperatingCost: { annualOperatingCost: -100 },
})) {
  const invalid = calc.calculateTSROI({ ...validGateInput, ...patch });
  assert(invalid.status === "blocked" && !invalid.gate.passed && invalid.tsroi === null, `${label} must fail closed instead of being normalized into a favorable result.`);
}

const examples = JSON.parse(fs.readFileSync(path.join(root, "assets/data/tool-examples.json"), "utf8"));
assert(examples.length >= 12, "tool example data must include the required core examples.");
assert(fs.existsSync(path.join(root, "werkzeuge/dashboard/index.html")), "tool dashboard route must exist.");
assert(fs.readFileSync(path.join(root, "werkzeuge/t-sroi/index.html"), "utf8").includes("data-tool-example-tsroi"), "T-SROI page must include interactive example.");

console.log(`Tool example checks passed: ${examples.length} examples.`);
