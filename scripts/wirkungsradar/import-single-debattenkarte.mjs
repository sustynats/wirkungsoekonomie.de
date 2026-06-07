import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DEFAULT_CARD_FILE = "content/wirkungsradar/imports/afd-kleiner-mann-wohlstandsgrundlagen.json";
const CARD_FILE = process.env.CARD_FILE || DEFAULT_CARD_FILE;
const MASTER_PATH = path.join(ROOT, "content/wirkungsradar/debattenkarten-master.json");
const DATA_STAND = "2026-06-07";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(ROOT, filePath), "utf8"));
}

function assertString(value, label) {
  if (!String(value || "").trim()) {
    throw new Error(`Pflichtfeld fehlt: ${label}`);
  }
}

function validateCard(card) {
  for (const field of ["templateVersion", "title", "slug", "category", "shortJudgement", "facts"]) {
    assertString(card[field], field);
  }
  for (const field of ["statement", "implicitMessage", "whyImportant"]) {
    assertString(card.claim?.[field], `claim.${field}`);
  }
  for (const field of ["seconds10", "seconds30", "seconds120"]) {
    assertString(card.answers?.[field], `answers.${field}`);
  }
  for (const field of ["resonanceRoom", "order1", "order2", "order3", "correction"]) {
    assertString(card.consequences?.[field], `consequences.${field}`);
  }
  if (!Array.isArray(card.impactPathSteps) || card.impactPathSteps.length < 5) {
    throw new Error("impactPathSteps braucht mindestens 5 narrativspezifische Schritte.");
  }
  if (!Array.isArray(card.criticalQuestions) || card.criticalQuestions.length < 5) {
    throw new Error("criticalQuestions braucht mindestens 5 konkrete Fragen.");
  }
  if (!Array.isArray(card.sourceCards) || card.sourceCards.length < 3) {
    throw new Error("sourceCards braucht belastbare Quellen mit Belegfunktion.");
  }
  for (const source of card.sourceCards) {
    for (const field of ["id", "title", "description", "type", "url", "limitation"]) {
      assertString(source[field], `sourceCards.${source.id || "?"}.${field}`);
    }
    if (/^file:|\.md$|\.docx?$|\.rtf$/i.test(source.url)) {
      throw new Error(`Nicht öffentliche Quellen-URL in ${source.id}: ${source.url}`);
    }
  }
}

const card = readJson(CARD_FILE);
validateCard(card);

const master = readJson(MASTER_PATH);
const existingIndex = master.cards.findIndex((item) => item.slug === card.slug || item.title.toLowerCase() === card.title.toLowerCase());

if (existingIndex >= 0) {
  master.cards[existingIndex] = { ...master.cards[existingIndex], ...card };
} else {
  master.cards.push(card);
}

master.stand = DATA_STAND;
const documentName = card.masterSource?.document || path.basename(CARD_FILE);
master.source = master.source.includes(documentName) ? master.source : `${master.source}; ${documentName}`;
master.imports = [
  ...(master.imports || []),
  {
    document: documentName,
    imported_at: new Date().toISOString(),
    detected_cards: 1,
    added: existingIndex >= 0 ? 0 : 1,
    updated: existingIndex >= 0 ? 1 : 0,
    card_file: CARD_FILE,
    slug: card.slug,
  },
];

fs.writeFileSync(MASTER_PATH, `${JSON.stringify(master, null, 2)}\n`);

const reportDir = path.join(ROOT, "reports");
fs.mkdirSync(reportDir, { recursive: true });
const reportPath = path.join(reportDir, `debattenkarte-${card.slug}-2026-06-07.md`);
fs.writeFileSync(reportPath, `# Debattenkarte importiert\n\nStand: ${DATA_STAND}\n\n- Titel: ${card.title}\n- Slug: ${card.slug}\n- Aktion: ${existingIndex >= 0 ? "aktualisiert" : "neu ergänzt"}\n- Strukturquelle: \`${CARD_FILE}\`\n- Redaktionsquelle: \`${documentName}\`\n- Quellenmodule: ${card.sourceCards.length}\n\n## Route\n\n/wirkungsradar/live/${card.slug}/\n\n## Standardprozess\n\n1. Strukturierte Karte unter \`content/wirkungsradar/imports/\` ablegen.\n2. \`CARD_FILE=... node scripts/wirkungsradar/import-single-debattenkarte.mjs\` ausführen.\n3. \`node scripts/wirkungsradar/apply-master-debattenkarten.mjs\` ausführen.\n4. \`npm run check:links && npm run check:search\` ausführen.\n5. Commit, Push auf \`main\`, GitHub Pages Deploy abwarten, Live-URL prüfen.\n`);

console.log(JSON.stringify({
  card: card.title,
  slug: card.slug,
  action: existingIndex >= 0 ? "updated" : "added",
  cards: master.cards.length,
  report: path.relative(ROOT, reportPath),
}, null, 2));
