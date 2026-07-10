import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8");
}

function exists(relative) {
  return fs.existsSync(path.join(ROOT, relative));
}

const fulltext = read("referenz/volltext/index.html");
assert(!/href="\.\.\/quellen\/#/.test(fulltext), "Volltext enthält noch alte Quellenanker ../quellen/#.");
assert(fulltext.includes('data-source-id="I-K1-1"') && fulltext.includes("../../quellenarchiv/woek-q-0576/"), "I-K1-1 verlinkt nicht direkt auf WÖK-Q-0576.");
assert(fulltext.includes('data-source-id="E-K1-4"') && fulltext.includes("../../referenz/quellen/e-k1-4/"), "E-K1-4 verlinkt nicht auf die Quellen-Vorschaltseite.");

const sourceIndex = read("referenz/quellen/index.html");
const cards = [...sourceIndex.matchAll(/<article class="source-card" id="([^"]+)"/g)].map((match) => match[1]);
assert(cards.length >= 1500, `Quellenregister enthält zu wenige Karten (${cards.length}).`);
for (const id of cards) {
  assert(exists(`referenz/quellen/${id}/index.html`), `Quellen-Detailseite fehlt: ${id}`);
}

const eK14 = read("referenz/quellen/e-k1-4/index.html");
assert(eK14.includes("WÖK-Q-0070") || eK14.includes("WÖK-Q-0772"), "E-K1-4 enthält keinen Meadows-Quellenarchiv-Link.");

const iK11 = read("referenz/quellen/i-k1-1/index.html");
assert(iK11.includes("WÖK-Q-0576"), "I-K1-1 Detailseite enthält keinen Buch-Quellenarchiv-Link.");

if (failures.length) {
  console.error(["Referenz-Quellenarchiv-Linkcheck fehlgeschlagen:", ...failures.map((failure) => `- ${failure}`)].join("\n"));
  process.exit(1);
}

console.log(`Referenz-Quellenarchiv-Linkcheck bestanden: ${cards.length} Quellenkarten mit Detailseiten.`);
