import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const file = path.join(root, "public/data/glossary.terms.json");
const glossaryHtmlFile = path.join(root, "glossar.html");
const required = [
  "termId",
  "canonicalLabel",
  "slug",
  "status",
  "version",
  "source",
  "shortDefinition",
  "hoverDefinition",
  "longDefinition",
  "reviewStatus",
  "glossaryOrderKey",
];

if (!fs.existsSync(file)) {
  console.error("Missing public/data/glossary.terms.json. Run glossary:build first.");
  process.exit(1);
}

const { terms } = JSON.parse(fs.readFileSync(file, "utf8"));
const collator = new Intl.Collator("de", { sensitivity: "base", numeric: true });
const errors = [];
const labels = new Set();
const slugs = new Set();

terms.forEach((term, index) => {
  required.forEach((field) => {
    if (term[field] === undefined || term[field] === "" || (Array.isArray(term[field]) && !term[field].length && field !== "reviewStatus")) {
      errors.push(`${term.termId || term.canonicalLabel || `term-${index}`}: missing ${field}`);
    }
  });
  const labelKey = String(term.canonicalLabel || "").toLocaleLowerCase("de");
  if (labels.has(labelKey)) errors.push(`Duplicate canonicalLabel: ${term.canonicalLabel}`);
  labels.add(labelKey);
  if (slugs.has(term.slug)) errors.push(`Duplicate slug: ${term.slug}`);
  slugs.add(term.slug);
  if (term.status === "führender-begriff" && !term.hoverDefinition) {
    errors.push(`${term.canonicalLabel}: leading term without hoverDefinition`);
  }
  if (term.termId === "wirkstoff" && !/analogie/i.test(`${term.shortDefinition} ${term.hoverDefinition} ${term.longDefinition}`)) {
    errors.push("Wirkstoff must be framed as analogy.");
  }
  if (term.termId === "wirkung" && /positiv[^,.]+veränderung/i.test(term.hoverDefinition)) {
    errors.push("Wirkung hover may imply automatically positive meaning.");
  }
  if (term.termId === "sdg-plus" && /offizielle?\s+UN/i.test(term.longDefinition) && !/keine offizielle/i.test(term.hoverDefinition)) {
    errors.push("SDG+ must not be presented as official UN category.");
  }
});

for (let i = 1; i < terms.length; i += 1) {
  const previous = terms[i - 1].glossaryOrderKey || terms[i - 1].canonicalLabel;
  const current = terms[i].glossaryOrderKey || terms[i].canonicalLabel;
  if (collator.compare(previous, current) > 0) {
    errors.push(`Glossary order error: ${terms[i - 1].canonicalLabel} before ${terms[i].canonicalLabel}`);
  }
}

function firstLetter(label) {
  const normalized = String(label || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleUpperCase("de");
  const letter = normalized[0] || "#";
  if (/[0-9]/.test(letter)) return "0-9";
  if (/[A-Z]/.test(letter)) return letter;
  return "#";
}

function anchorForLetter(letter) {
  return letter === "0-9" ? "ziffern" : letter.toLocaleLowerCase("de");
}

function parseNavLetters(html, className, labelPattern = "") {
  const nav = html.match(new RegExp(`<nav class="${className}"${labelPattern}[\\s\\S]*?</nav>`))?.[0] || "";
  return Array.from(nav.matchAll(/href="#glossar-([^"]+)">([^<]+)<\/a>/g), (match) => ({
    anchor: match[1],
    label: match[2],
  }));
}

if (fs.existsSync(glossaryHtmlFile)) {
  const glossaryHtml = fs.readFileSync(glossaryHtmlFile, "utf8");
  const expectedLetters = Array.from(new Set(terms.map((term) => firstLetter(term.glossaryOrderKey || term.canonicalLabel))))
    .sort((a, b) => collator.compare(a, b));
  const expected = expectedLetters.map((letter) => ({ anchor: anchorForLetter(letter), label: letter }));
  const navs = [
    ["alphabet-nav", ' aria-label="Alphabetische Schnellnavigation im Glossar"'],
    ["glossary-standard-nav", ' aria-label="Alphabetische Glossar-Navigation"'],
  ];
  for (const [className, labelPattern] of navs) {
    const actual = parseNavLetters(glossaryHtml, className, labelPattern);
    const actualKey = actual.map((item) => `${item.anchor}:${item.label}`).join("|");
    const expectedKey = expected.map((item) => `${item.anchor}:${item.label}`).join("|");
    if (actualKey !== expectedKey) {
      errors.push(`${className} mismatch. Expected ${expectedKey}; got ${actualKey || "(empty)"}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Glossary check passed for ${terms.length} terms.`);
