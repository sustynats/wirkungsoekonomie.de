import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const navigation = JSON.parse(fs.readFileSync(path.join(ROOT, "assets/data/navigation.json"), "utf8"));
const mainJs = fs.readFileSync(path.join(ROOT, "assets/js/main.js"), "utf8");

const expectedMainNav = [
  "Start",
  "Verstehen",
  "So wirkt WÖk",
  "Wirkungsfelder",
  "Methoden & Werkzeuge",
  "Erleben",
  "Akademie",
  "Bibliothek",
  "Mitmachen",
  "Suche",
];

const errors = [];

function fail(message) {
  errors.push(message);
}

const headerLabels = (navigation.header || []).map((item) => item.label);
if (JSON.stringify(headerLabels) !== JSON.stringify(expectedMainNav)) {
  fail(`MAIN_NAV order mismatch: ${headerLabels.join(" | ")}`);
}

if (headerLabels.includes("Wirkungsradar")) {
  fail("Wirkungsradar must not be a primary main-navigation item.");
}

if ((navigation.footerGroups || []).length > 5) {
  fail(`Footer has ${(navigation.footerGroups || []).length} groups; max is 5.`);
}

for (const group of navigation.footerGroups || []) {
  const count = (group.items || []).length;
  if (count > 8) {
    fail(`Footer group "${group.title}" has ${count} links; max is 8.`);
  }
}

if (/const\s+navItems\s*=/.test(mainJs) || /siteNav\.innerHTML\s*=\s*navItems/.test(mainJs)) {
  fail("assets/js/main.js must not hardcode MAIN_NAV; render it from templates/navigation data.");
}

if (errors.length) {
  console.error("Online-Styleguide P0 check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Online-Styleguide P0 check OK.");
