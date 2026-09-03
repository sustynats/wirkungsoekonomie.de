import fs from "node:fs";
import path from "node:path";

const legacyPublicGuideDir = path.join(process.cwd(), "werkzeuge/faktencheck-bot");

fs.rmSync(legacyPublicGuideDir, { recursive: true, force: true });

console.log("Oeffentliche Faktencheck-Hilfeseiten bereinigt.");
