import { checkLiveReferenceChangelog } from "./live-reference-core.mjs";

const errors = checkLiveReferenceChangelog();
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Live reference changelog check passed.");
