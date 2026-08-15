import fs from "node:fs";

if (!fs.existsSync("public/data/version-history.json")) {
  console.error("Missing public/data/version-history.json. Run review:versions first.");
  process.exit(1);
}
if (!fs.existsSync("docs/CONTENT_VERSIONING.md")) {
  console.error("Missing docs/CONTENT_VERSIONING.md.");
  process.exit(1);
}
console.log("Versioning check passed.");

