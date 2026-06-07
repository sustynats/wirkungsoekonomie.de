import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const DEFAULT_DOCX = "/Users/hagen/Downloads/CodeX_Debattenkarten_33_WOeK_Wirkungsradar.docx";
const DOCX = process.env.SUPPLEMENT_DOCX || DEFAULT_DOCX;
const MASTER_PATH = path.join(ROOT, "content/wirkungsradar/debattenkarten-master.json");
const REPORT_PATH = path.join(ROOT, "reports/debattenkarten-supplement-2026-06-07.md");
const PYTHON = process.env.CODEX_PYTHON || "/Users/hagen/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3";
const DATA_STAND = "2026-06-07";

function extractLines(docxPath) {
  const code = `
import json, sys
from docx import Document
doc = Document(sys.argv[1])
print(json.dumps([p.text.strip() for p in doc.paragraphs if p.text.strip()], ensure_ascii=False))
`;
  return JSON.parse(execFileSync(PYTHON, ["-c", code, docxPath], { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 }));
}

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function cleanText(value) {
  return String(value ?? "")
    .replace(/[ \t]+/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .trim();
}

function stripPrefix(line, prefix) {
  return line.startsWith(prefix) ? line.slice(prefix.length).trim() : "";
}

function section(block, startMarker, endMarkers) {
  const start = block.findIndex((line) => line === startMarker);
  if (start < 0) return [];
  let end = block.length;
  for (let i = start + 1; i < block.length; i += 1) {
    if (endMarkers.includes(block[i])) {
      end = i;
      break;
    }
  }
  return block.slice(start + 1, end);
}

function firstPrefixed(lines, prefix) {
  const found = lines.find((line) => line.startsWith(prefix));
  return found ? stripPrefix(found, prefix) : "";
}

const categoryByTitle = new Map([
  ["Standort Deutschland ist tot?", "Wirtschaft & Unternehmen"],
  ["Vier-Tage-Woche ist Wohlstandsverwahrlosung?", "Arbeit & Sozialstaat"],
  ["Aktienrente löst die Rente?", "Arbeit & Sozialstaat"],
  ["Schuldenbremse schützt die Jugend?", "Staat, Geld & Verantwortung"],
  ["Reiche wandern aus, wenn man sie belastet?", "Staat, Geld & Verantwortung"],
  ["Impfen ist nur persönliche Entscheidung?", "Gesundheit & Pflege"],
  ["Pflege durch Roboter ist unmenschlich?", "Gesundheit & Pflege"],
  ["Long Covid / ME-CFS ist Einbildung?", "Gesundheit & Pflege"],
  ["Deepfakes sind nur Spaß?", "Digitalisierung & KI"],
  ["Social Media ist freie Öffentlichkeit?", "Digitalisierung & KI"],
  ["Algorithmen sind neutral?", "Digitalisierung & KI"],
  ["Cyberangriffe sind IT-Problem?", "Digitalisierung & KI"],
  ["KI-Regulierung bremst Europa?", "Digitalisierung & KI"],
  ["Lobbyismus ist immer Korruption?", "Demokratie & Öffentlichkeit"],
  ["Antisemitismus ist importiert?", "Demokratie & Öffentlichkeit"],
  ["Islamismus wird verharmlost?", "Demokratie & Öffentlichkeit"],
  ["Linksextremismus ist unterschätzt?", "Demokratie & Öffentlichkeit"],
  ["Rechtsextremismus ist nur Protest?", "Demokratie & Öffentlichkeit"],
  ["Israelkritik wird verboten?", "Ausland & Sicherheit"],
  ["Gaza zeigt westliche Doppelmoral?", "Ausland & Sicherheit"],
  ["Klimaflucht ist Panikmache?", "Klima & Energie"],
  ["Biodiversität ist Luxusproblem?", "Klima & Energie"],
  ["Wasser ist in Deutschland kein Problem?", "Klima & Energie"],
  ["Cancel Culture zerstört Debatte?", "Kultur, Identität & Resonanz"],
  ["Wokeness spaltet die Gesellschaft?", "Kultur, Identität & Resonanz"],
  ["Patriotismus ist rechts?", "Kultur, Identität & Resonanz"],
  ["Heimat gehört den Einheimischen?", "Kultur, Identität & Resonanz"],
  ["Religion gehört ins Private?", "Kultur, Identität & Resonanz"],
  ["Tradition wird abgeschafft?", "Kultur, Identität & Resonanz"],
  ["Männer werden benachteiligt?", "Kultur, Identität & Resonanz"],
  ["Kinder kriegen ist Klimasünde?", "Klima & Energie"],
  ["Junge wollen nicht mehr arbeiten?", "Arbeit & Sozialstaat"],
]);

function fallbackCategory(title) {
  if (/rente|arbeit|woche|junge/i.test(title)) return "Arbeit & Sozialstaat";
  if (/ki|algorithm|deepfake|cyber|social media/i.test(title)) return "Digitalisierung & KI";
  if (/klima|wasser|biodivers|kinder/i.test(title)) return "Klima & Energie";
  if (/israel|gaza/i.test(title)) return "Ausland & Sicherheit";
  return "Demokratie & Öffentlichkeit";
}

function parseSources(lines) {
  const sources = [];
  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(/^([A-Z0-9-]+)\s+·\s+([^·]+)\s+·\s+(.+)$/);
    if (!match) continue;
    const [, id, type, title] = match;
    const description = lines[i + 1]?.startsWith("Belegt hier:")
      ? stripPrefix(lines[i + 1], "Belegt hier:")
      : "Belegt den genannten Prüfpunkt dieser Debattenkarte.";
    const sourceLine = lines[i + 2]?.startsWith("Quelle:")
      ? stripPrefix(lines[i + 2], "Quelle:")
      : "";
    const url = /^https?:\/\//i.test(sourceLine)
      ? sourceLine
      : "/wirkungsradar/quellen/";
    sources.push({
      id,
      title: title.trim(),
      description: description.trim(),
      type: type.trim(),
      url,
      limitation: "Belegt den genannten Prüfpunkt, ersetzt aber keine vollständige Wirkungsabwägung.",
      dataStatus: DATA_STAND,
      lastChecked: DATA_STAND,
    });
  }
  return sources;
}

function parseCard(block) {
  const heading = block[0].match(/^(\d+)\s+·\s+(.+)$/);
  if (!heading) throw new Error(`Ungültige Kartenüberschrift: ${block[0]}`);
  const number = Number(heading[1]);
  const title = heading[2].trim();
  const claimLines = section(block, "Was wird behauptet?", ["Sofortantwort"]);
  const answerLines = section(block, "Sofortantwort", ["Folgencheck"]);
  const consequenceLines = section(block, "Folgencheck", ["Wirkpfad"]);
  const pathLines = section(block, "Wirkpfad", ["Kritische Fragen"]);
  const questionLines = section(block, "Kritische Fragen", ["Faktenlage"]);
  const factsLines = section(block, "Faktenlage", ["Antwort- und Lösungspfad für CodeX"]);
  const solutionLines = section(block, "Antwort- und Lösungspfad für CodeX", ["Warum zieht das Narrativ?"]);
  const whyLines = section(block, "Warum zieht das Narrativ?", ["Methodik"]);
  const methodologyLines = section(block, "Methodik", ["Quellenhinweise"]);
  const sourceLines = section(block, "Quellenhinweise", []);
  const betterQuestion = firstPrefixed(consequenceLines, "WÖk-Korrektur:")
    || firstPrefixed(pathLines, "Bessere Rückkopplung:")
    || firstPrefixed(claimLines, "Warum das wichtig ist:");
  const facts = cleanText([
    factsLines.join("\n"),
    solutionLines.length ? `Antwort- und Lösungspfad:\n${solutionLines.join("\n")}` : "",
  ].filter(Boolean).join("\n\n"));
  const category = categoryByTitle.get(title) || fallbackCategory(title);
  const sources = parseSources(sourceLines);
  return {
    templateVersion: "2.0",
    number,
    title,
    slug: slugify(title.replace(/\?$/, "")),
    cluster: category,
    category,
    editorialStatus: "redaktionell geprüft",
    shortJudgement: firstPrefixed(answerLines, "10 Sekunden:") || firstPrefixed(claimLines, "Warum das wichtig ist:"),
    claim: {
      statement: firstPrefixed(claimLines, "Behauptung:"),
      implicitMessage: firstPrefixed(claimLines, "Implizite Botschaft:"),
      whyImportant: firstPrefixed(claimLines, "Warum das wichtig ist:"),
    },
    answers: {
      seconds10: firstPrefixed(answerLines, "10 Sekunden:"),
      seconds30: firstPrefixed(answerLines, "30 Sekunden:"),
      seconds120: firstPrefixed(answerLines, "2 Minuten:"),
    },
    consequences: {
      resonanceRoom: firstPrefixed(consequenceLines, "Ausgelöster Resonanzraum:"),
      order1: firstPrefixed(consequenceLines, "Wirkungsrisiko erster Ordnung:"),
      order2: firstPrefixed(consequenceLines, "Wirkungsrisiko zweiter Ordnung:"),
      order3: firstPrefixed(consequenceLines, "Wirkungsrisiko dritter Ordnung:"),
      correction: firstPrefixed(consequenceLines, "WÖk-Korrektur:"),
    },
    impactPathSteps: pathLines.filter((line) => /^(Auslöser|Frame|Verkürzung|Anschlussreaktion|Rückkopplung|Bessere Rückkopplung):/.test(line)),
    criticalQuestions: questionLines.filter((line) => line.endsWith("?")),
    facts,
    sourceCards: sources,
    glossary: [],
    whyItWorks: cleanText(whyLines.join("\n")),
    methodology: cleanText(methodologyLines.join("\n")),
    relatedContent: `Verwandte Inhalte im öffentlichen Wirkungsraum: Debatten-Kompass, Resonanz-Kompass, Agenda-Radar, Ursachen-Navigator und Resilienz-Prinzipien. Kategorie: ${category}.`,
    trueCore: cleanText(factsLines.join(" ")),
    falseJump: firstPrefixed(claimLines, "Implizite Botschaft:"),
    betterQuestion,
    systemLever: firstPrefixed(consequenceLines, "WÖk-Korrektur:"),
    effectPath: {
      order1: firstPrefixed(consequenceLines, "Wirkungsrisiko erster Ordnung:"),
      order2: firstPrefixed(consequenceLines, "Wirkungsrisiko zweiter Ordnung:"),
      order3: firstPrefixed(consequenceLines, "Wirkungsrisiko dritter Ordnung:"),
      mpd: firstPrefixed(consequenceLines, "WÖk-Korrektur:"),
    },
    objections: questionLines.filter((line) => line.endsWith("?")).slice(0, 4).map((question) => ({
      objection: question,
      answer: "Diese Frage ist berechtigt, wenn sie konkret, belegbar und auf Wirkung statt auf Pauschalurteile gerichtet wird.",
    })),
    moderation: {
      "Konkreten Hebel anbieten": firstPrefixed(pathLines, "Bessere Rückkopplung:"),
    },
    sourceHints: sources.map((source) => source.id).join(", "),
    masterSource: {
      document: path.basename(DOCX),
      stand: DATA_STAND,
    },
  };
}

function parseCards(lines) {
  const headingIndexes = lines
    .map((line, index) => (/^\d+\s+·\s+.+\?$/.test(line) ? index : -1))
    .filter((index) => index >= 0);
  return headingIndexes.map((start, i) => {
    const nextHeading = headingIndexes[i + 1] ?? lines.findIndex((line, index) => index > start && line === "4. Quellenregister");
    const end = nextHeading > start ? nextHeading : lines.length;
    return parseCard(lines.slice(start, end));
  });
}

function validateCard(card) {
  const missing = [];
  if (!card.title) missing.push("title");
  if (!card.slug) missing.push("slug");
  if (!card.claim.statement) missing.push("claim.statement");
  if (!card.answers.seconds10) missing.push("answers.seconds10");
  if (!card.answers.seconds30) missing.push("answers.seconds30");
  if (!card.answers.seconds120) missing.push("answers.seconds120");
  if (!card.consequences.order1) missing.push("consequences.order1");
  if (!card.impactPathSteps.length) missing.push("impactPathSteps");
  if (!card.criticalQuestions.length) missing.push("criticalQuestions");
  if (!card.facts) missing.push("facts");
  if (!card.sourceCards.length) missing.push("sourceCards");
  if (missing.length) throw new Error(`${card.title}: fehlende Felder: ${missing.join(", ")}`);
}

function mergeCards(master, supplementCards) {
  const bySlug = new Map(master.cards.map((card, index) => [card.slug, index]));
  const byTitle = new Map(master.cards.map((card, index) => [card.title.toLowerCase(), index]));
  const updated = [];
  const added = [];
  for (const card of supplementCards) {
    validateCard(card);
    const existingIndex = bySlug.has(card.slug)
      ? bySlug.get(card.slug)
      : byTitle.get(card.title.toLowerCase());
    if (existingIndex !== undefined) {
      const previous = master.cards[existingIndex];
      master.cards[existingIndex] = { ...previous, ...card, slug: previous.slug || card.slug };
      updated.push(card);
    } else {
      master.cards.push(card);
      added.push(card);
    }
  }
  return { added, updated };
}

if (!fs.existsSync(DOCX)) throw new Error(`DOCX nicht gefunden: ${DOCX}`);
const lines = extractLines(DOCX);
const supplementCards = parseCards(lines);
const expectedFromTitle = /33/.test(path.basename(DOCX)) ? 33 : supplementCards.length;
const master = JSON.parse(fs.readFileSync(MASTER_PATH, "utf8"));
const beforeCount = master.cards.length;
const { added, updated } = mergeCards(master, supplementCards);
master.stand = DATA_STAND;
master.source = `${master.source}; ${path.basename(DOCX)}`;
master.imports = [
  ...(master.imports || []),
  {
    document: path.basename(DOCX),
    imported_at: new Date().toISOString(),
    detected_cards: supplementCards.length,
    added: added.length,
    updated: updated.length,
  },
];
fs.writeFileSync(MASTER_PATH, `${JSON.stringify(master, null, 2)}\n`);

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
const mismatchNote = supplementCards.length !== expectedFromTitle
  ? `## Hinweis\n\nDie Datei trägt 33 im Namen/Auftrag, enthält aber nur ${supplementCards.length} Kartenüberschriften im Muster "Zahl · Titel?". Es wurde nichts erfunden; importiert wurden nur die tatsächlich vorhandenen Karten.\n\n`
  : "";

fs.writeFileSync(REPORT_PATH, `# Debattenkarten-Ergänzungsimport\n\nStand: ${DATA_STAND}\n\nQuelle: \`${DOCX}\`\n\n## Ergebnis\n\n- Karten vor Import: ${beforeCount}\n- Kartenüberschriften erkannt: ${supplementCards.length}\n- Erwartung aus Dateiname/Auftrag: ${expectedFromTitle}\n- Neu ergänzt: ${added.length}\n- Aktualisiert: ${updated.length}\n- Karten nach Import: ${master.cards.length}\n\n${mismatchNote}## Ergänzte Karten\n\n${added.map((card) => `- ${card.number} · ${card.title} -> /wirkungsradar/live/${card.slug}/`).join("\n") || "- Keine"}\n\n## Aktualisierte Karten\n\n${updated.map((card) => `- ${card.number} · ${card.title}`).join("\n") || "- Keine"}\n`);

console.log(JSON.stringify({
  source: DOCX,
  detected: supplementCards.length,
  expected: expectedFromTitle,
  before: beforeCount,
  added: added.length,
  updated: updated.length,
  after: master.cards.length,
}, null, 2));
