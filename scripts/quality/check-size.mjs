import fs from "node:fs";
import path from "node:path";

const target = fs.existsSync("_site") ? "_site" : fs.existsSync("dist") ? "dist" : ".";
let total = 0;
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", ".codex-backup", ".next", "_site", "docs", "node_modules", "outputs", "reports", "tiktok_archive", "tiktok_library"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (full === path.join("content", "internal-documents")) continue;
    if (entry.isDirectory()) walk(full);
    else total += fs.statSync(full).size;
  }
}
walk(target);
const mb = total / 1024 / 1024;
if (mb > 950) {
  console.error(`Site size ${mb.toFixed(1)} MB exceeds 950 MB hard limit.`);
  process.exit(1);
}
if (mb > 850) console.warn(`Warning: site size ${mb.toFixed(1)} MB exceeds 850 MB.`);
else console.log(`Size check passed: ${mb.toFixed(1)} MB.`);
