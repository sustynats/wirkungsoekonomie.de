import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { saxonyAnhaltElectionProgrammes } from "../../data/sachsen-anhalt-election-programmes";
import { saxonyAnhaltProgrammeEditorial } from "../../data/presentation/sachsen-anhalt-programme-editorial-v2";
import { saxonyAnhaltImpactVisualDescriptor } from "../../lib/impact-visuals/records";
import { evaluateImpactVisualGates } from "../../lib/impact-visuals/gates";

const stylesheet = readFileSync(fileURLToPath(new URL("../../app/components/impact-visuals/ImpactVisualScenario.module.css", import.meta.url)), "utf8");
const expectedSourceKeys = saxonyAnhaltElectionProgrammes.map((programme) => programme.sourceKey);
const approvedAnalysisRefs = Object.fromEntries(expectedSourceKeys.map((sourceKey) => {
  const editorial = saxonyAnhaltProgrammeEditorial(sourceKey);
  if (!editorial) throw new Error(`Missing Editorial-v2 record for ${sourceKey}`);
  return [sourceKey, Object.keys(editorial.centralAssessments)];
}));
const results = evaluateImpactVisualGates({ descriptor: saxonyAnhaltImpactVisualDescriptor, expectedSourceKeys, approvedAnalysisRefs, stylesheet });

for (const result of results) console.log(`${result.gate}=${result.pass ? "PASS" : "FAIL"} ${result.detail}`);
if (results.some((result) => !result.pass)) process.exit(1);
