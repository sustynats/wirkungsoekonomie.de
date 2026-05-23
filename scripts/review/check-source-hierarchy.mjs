import { checkSourceHierarchy } from "./live-reference-core.mjs";

const errors = checkSourceHierarchy();
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Source hierarchy check passed.");
