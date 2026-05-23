import { checkLogicConsistency } from "./live-reference-core.mjs";

const errors = checkLogicConsistency();
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Logic consistency check passed.");
