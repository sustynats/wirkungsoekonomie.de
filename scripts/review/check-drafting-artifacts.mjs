import { checkDraftingArtifacts } from "./live-reference-core.mjs";

const errors = checkDraftingArtifacts();
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Drafting artifact check passed.");
