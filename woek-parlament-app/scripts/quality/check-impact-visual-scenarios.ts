import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
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
const schema = JSON.parse(readFileSync(fileURLToPath(new URL("../../data/impact-visuals/contracts/impact-visual-scenario.schema.json", import.meta.url)), "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);
if (!validate(saxonyAnhaltImpactVisualDescriptor)) {
  console.error("IMPACT_VISUAL_JSON_SCHEMA=FAIL", validate.errors);
  process.exit(1);
}
console.log("IMPACT_VISUAL_JSON_SCHEMA=PASS TypeScript/Zod and JSON Schema contracts agree");

for (const result of results) console.log(`${result.gate}=${result.pass ? "PASS" : "FAIL"} ${result.detail}`);
if (results.some((result) => !result.pass)) process.exit(1);
