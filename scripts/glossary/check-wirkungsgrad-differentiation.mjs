import fs from "node:fs";

const registry = JSON.parse(fs.readFileSync("public/data/glossary.terms.json", "utf8"));
const expected = [
  ["wirkungsgrad", "Wirkungsgrad", "klar definierten Ergebnis"],
  ["physikalischer-wirkungsgrad", "Physikalischer Wirkungsgrad", "nutzbar abgegebener"],
  ["wirkungsoekonomischer-wirkungsgrad", "Wirkungsökonomischer Wirkungsgrad", "positive Netto-Wirkung"],
  ["fiskalischer-wirkungsgrad", "Fiskalischer Wirkungsgrad", "öffentlichen Euro"],
  ["impact-of-investment", "Impact-of-Investment / IOI", "investiertem Kapital"],
];
const errors = [];

for (const [slug, label, phrase] of expected) {
  const term = registry.terms.find((entry) => entry.slug === slug);
  if (!term) {
    errors.push(`${slug}: Begriff fehlt im Glossar-Register`);
    continue;
  }
  if (term.canonicalLabel !== label) errors.push(`${slug}: unerwartete Bezeichnung ${term.canonicalLabel}`);
  if (!String(term.shortDefinition || "").includes(phrase)) errors.push(`${slug}: Kurzdefinition ohne Pflichtabgrenzung`);

  const file = `begriffe/${slug}/index.html`;
  if (!fs.existsSync(file)) {
    errors.push(`${slug}: Detailseite fehlt`);
    continue;
  }
  const html = fs.readFileSync(file, "utf8");
  if (!html.includes(phrase)) errors.push(`${slug}: Detailseite ohne Pflichtabgrenzung`);
}

const ioiPage = fs.readFileSync("begriffe/impact-of-investment/index.html", "utf8");
if (!ioiPage.includes("Wirkungsökonomischer Wirkungsgrad") || !ioiPage.includes("Fiskalischer Wirkungsgrad")) {
  errors.push("impact-of-investment: explizite Abgrenzung zu WÖk- und fiskalischem Wirkungsgrad fehlt");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Wirkungsgrad differentiation check passed for 5 terms.");
