import fs from "node:fs";

const history = {
  generatedAt: new Date().toISOString(),
  versions: [
    {
      version: "2026.0",
      state: "source-original",
      meaning: "Unveränderte Fassung aus Quelldokumenten.",
    },
    {
      version: "2026.1",
      state: "online-reviewed",
      meaning: "Erste gegen den führenden Begriffsleitfaden geprüfte Online-Referenzfassung.",
    },
  ],
};
fs.writeFileSync("public/data/version-history.json", `${JSON.stringify(history, null, 2)}\n`);
console.log("Wrote version history.");

