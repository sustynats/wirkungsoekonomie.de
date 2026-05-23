import { checkCrossDocumentConsistency } from "./live-reference-core.mjs";

const errors = checkCrossDocumentConsistency();
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Cross-document consistency check passed.");
