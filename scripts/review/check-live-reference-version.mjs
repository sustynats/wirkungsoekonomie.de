import { checkLiveReferenceVersion } from "./live-reference-core.mjs";

const errors = checkLiveReferenceVersion();
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Live reference version check passed.");
