import fs from "node:fs";

const indexPath = "assets/search/search-index.json";
const entries = JSON.parse(fs.readFileSync(indexPath, "utf8"));

const forbiddenTitle = new Set([
  "kontakt",
  "verstehen",
  "referenzrahmen",
  "kontext-werkzeuge",
  "erleben & lernen",
  "werkstatt",
]);

const footerCluster = [
  "wirkung einfach erklärt",
  "sdg-/sdg+-referenzrahmen",
  "interaktive demos",
  "arbeitsbibliothek",
  "dokumentenregistry",
];

const blockedPublicFragments = [
  "druckdatum:",
  "welche wirkungslogik macht",
  "pdf-fassung in produktion",
  "pdf wird ergänzt",
  "auszug aus der umfangreichen korrekturfassung",
  "umfang der quellfassung: rund 0 wörter",
  "ergänzende ergänzende",
  "kernformel.",
  "protectionnotice",
  "[button:",
  "codex-anweisung",
  "dein browser kann diese audiodatei nicht direkt abspielen",
];

const failures = [];

for (const entry of entries) {
  const title = String(entry.title || "").trim().toLowerCase();
  const section = String(entry.section || "").trim().toLowerCase();
  const body = String(entry.body || "").toLowerCase();
  const url = String(entry.url || "");

  if (forbiddenTitle.has(title) && body.length < 900) {
    failures.push(`${url} has navigation/footer-like title "${entry.title}"`);
  }

  if (section.includes("footer") || section.includes("navigation")) {
    failures.push(`${url} has search section "${entry.section}"`);
  }

  if (footerCluster.filter((item) => body.includes(item)).length >= 3) {
    failures.push(`${url} contains repeated footer navigation cluster`);
  }

  if (body.includes("kontakt:") && body.includes("© 2026 natalie weber")) {
    failures.push(`${url} contains footer contact/copyright text`);
  }

  for (const fragment of blockedPublicFragments) {
    if (body.includes(fragment)) {
      failures.push(`${url} contains public-language fragment "${fragment}"`);
    }
  }
}

if (failures.length) {
  console.error("Search index contamination detected:");
  failures.slice(0, 30).forEach((failure) => console.error(`- ${failure}`));
  if (failures.length > 30) console.error(`... ${failures.length - 30} more`);
  process.exit(1);
}

console.log(`Search index contamination check passed for ${entries.length} entries.`);
