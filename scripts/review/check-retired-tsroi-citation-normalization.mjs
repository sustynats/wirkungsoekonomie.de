import fs from "node:fs";
import path from "node:path";
import {
  applyCurrentMethodologyCorrections,
  normalizeRetiredTSroiSourceCitation,
} from "./live-reference-core.mjs";

const ROOT = process.cwd();
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(file));
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(file);
  }
  return files;
}

function stripTags(value = "") {
  return String(value).replace(/<[^>]+>/gu, " ").replace(/\s+/gu, " ").trim();
}

function matches(value, pattern) {
  return [...value.matchAll(pattern)].length;
}

// Dieses absichtlich beschädigte Beispiel bildet den Fehler nach, der durch
// mehrfache Läufe entstanden war: Der historische Hinweis und die
// Methodenverweisung dürfen je Zitat genau einmal auftreten.
const malformedCitation = `
  <p id="fixture"><a class="source-chip" data-source-id="I-K1-11">[I-K1-11]</a>
  Weber, Natalie: Historisches Historisches Whitepaper T-SROI, 2025;
  für aktuelle Rechenregeln: T-SROI-Rechenstandard v1.1, 2026 (WÖK-Q-1024);
  für aktuelle Rechenregeln: T-SROI-Rechenstandard v1.1, 2026 (WÖK-Q-1024).
  Die historisch verwendete historisch verwendete Multiplikatorlogik
  (durch v1.1 ersetzt) (durch v1.1 ersetzt) bleibt dokumentiert.</p>`;

const once = applyCurrentMethodologyCorrections(malformedCitation, undefined, { currentReference: true });
const twice = applyCurrentMethodologyCorrections(once, undefined, { currentReference: true });
const directOnce = normalizeRetiredTSroiSourceCitation(malformedCitation);
const directTwice = normalizeRetiredTSroiSourceCitation(directOnce);

assert(once === twice, "Die T-SROI-Zitationsnormalisierung ist nicht idempotent: Der zweite Lauf verändert den ersten Lauf.");
assert(directOnce === directTwice, "Die kanonische T-SROI-Zitationsnormalisierung ist nicht idempotent.");
assert(matches(once, /\bHistorisches\s+Whitepaper\s+T-SROI\b/gu) === 1, "Der historische T-SROI-Hinweis ist nicht genau einmal kanonisch vorhanden.");
assert(matches(once, /für\s+aktuelle\s+Rechenregeln:\s*T-SROI-Rechenstandard\s+v1\.1,\s*2026\s*\(WÖK-Q-1024\)/gu) === 1, "Der Verweis auf den aktuellen T-SROI-Rechenstandard ist nicht genau einmal vorhanden.");
assert(matches(once, /historisch\s+verwendete\s+Multiplikatorlogik\s*\(durch\s+v1\.1\s+ersetzt\)/gu) === 1, "Der Hinweis auf die ersetzte Multiplikatorlogik ist nicht genau einmal vorhanden.");
assert(!/\bHistorisches\s+Historisches\b/iu.test(once), "Die Normalisierung lässt doppelte 'Historisches'-Marker zurück.");
assert(!/historisch\s+verwendete\s+historisch\s+verwendete/iu.test(once), "Die Normalisierung lässt doppelte Multiplikatorhinweise zurück.");

const duplicatePatterns = [
  [/(?:\bHistorisches\s+){2,}Whitepaper\s+T[-‑–]SROI/iu, "mehrfaches 'Historisches' vor dem Whitepaper"],
  [/(?:für\s+aktuelle\s+Rechenregeln:\s*T[-‑–]SROI-Rechenstandard\s+v1\.1,\s*2026\s*\(W[ÖO]K-Q-1024\)\s*;?\s*){2,}/iu, "mehrfacher Verweis auf den aktuellen Rechenstandard"],
  [/(?:historisch\s+verwendete\s+){2,}(?:Transformationsmultiplikator|Multiplikatorlogik)/iu, "mehrfacher Hinweis auf die historische Multiplikatorlogik"],
  [/(?:\(durch\s+v1\.1\s+ersetzt\)\s*){2,}/iu, "mehrfacher Klammerhinweis 'durch v1.1 ersetzt'"],
];

let inspectedParagraphs = 0;
for (const file of walk(path.join(ROOT, "referenz"))) {
  const html = fs.readFileSync(file, "utf8");
  const firstPass = applyCurrentMethodologyCorrections(html, undefined, { currentReference: true });
  const secondPass = applyCurrentMethodologyCorrections(firstPass, undefined, { currentReference: true });
  if (firstPass !== secondPass) {
    failures.push(`${path.relative(ROOT, file)}: Der zweite Normalisierungslauf verändert noch Text.`);
  }
  for (const match of html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/giu)) {
    const text = stripTags(match[1]);
    if (!/(?:Whitepaper\s+T[-‑–]SROI|T[-‑–]SROI-Rechenstandard\s+v1\.1)/iu.test(text)) continue;
    inspectedParagraphs += 1;
    for (const [pattern, description] of duplicatePatterns) {
      if (pattern.test(text)) {
        failures.push(`${path.relative(ROOT, file)}: ${description}.`);
      }
    }
  }
}

assert(inspectedParagraphs > 0, "Es wurden keine T-SROI-Quellenabsätze in /referenz/ geprüft.");

if (failures.length) {
  console.error(["T-SROI-Zitationsnormalisierung fehlgeschlagen:", ...failures.map((failure) => `- ${failure}`)].join("\n"));
  process.exit(1);
}

console.log(`T-SROI-Zitationsnormalisierung bestanden: ${inspectedParagraphs} Quellenabsätze geprüft; zweiter Lauf ist textgleich.`);
