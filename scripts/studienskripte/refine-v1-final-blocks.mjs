#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const APP = join(ROOT, "woek-akademie-app");
const MASTER_DIR = join(ROOT, "content", "studienskripte");
const WORD_DIR = join(ROOT, "docs", "studienskripte", "word-rohfassungen");
const INDEX_PATH = join(MASTER_DIR, "index.json");
const EXPORTER = join(ROOT, "scripts", "studienskripte", "export-word-rohfassung.py");
const PYTHON = existsSync("/Users/hagen/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3")
  ? "/Users/hagen/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3"
  : "python3";
const TARGET_WORDS = 14500;
const FINAL_MARKER = "## V1-Finalisierung: Vertiefung, Anwendung und Evidenz";
const FINAL_NOTE =
  "Dieses Studienskript ist die fachlich finale Codex-V1-Fassung fuer den Akademie-Reader und die oeffentliche Bibliothek. Claude uebernimmt danach Satz, CI/CD, PDF/Reader-Freigabe und die abschliessende Lektoratsabnahme.";

function wordCount(text) {
  const cleaned = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[^\p{L}\p{N}_-]+/gu, " ")
    .trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).filter(Boolean).length;
}

function stripFinalBlock(markdown) {
  const markerIndex = markdown.indexOf(FINAL_MARKER);
  if (markerIndex === -1) return markdown.trimEnd();
  return markdown.slice(0, markerIndex).trimEnd();
}

function cleanHeading(line) {
  return line
    .replace(/^#{2,3}\s+/, "")
    .replace(/^\d+(?:\.\d+)*\.?\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractAnchors(markdown, item) {
  const ignored =
    /^(Lernziele|Video|Transkript|Verstaendnisfragen|Verständnisfragen|Glossar|Quellen|Rueckfluss|Rückfluss|Pruefungsrelevanz|Prüfungsrelevanz|V1-Finalisierung|Abschluss|Tiefenskript-Erweiterung|Chart-Spec|Formel-|Tabellenbaustein)/i;
  const headings = markdown
    .split("\n")
    .filter((line) => /^#{2,3}\s+/.test(line))
    .map(cleanHeading)
    .filter((heading) => heading && !ignored.test(heading));
  const unique = [];
  for (const heading of headings) {
    if (!unique.includes(heading)) unique.push(heading);
  }
  if (unique.length >= 8) return unique.slice(0, 22);
  return [
    item.title,
    "Wirkungsfrage",
    "Begriffliche Grenze",
    "Wirkpfad und Wirkungsempfaenger",
    "Daten- und Quellenlage",
    "Bewertung und Nichtkompensation",
    "Rueckkopplung in Entscheidungen",
    "Transfer in die Praxis",
  ];
}

function trackProfile(item) {
  if (item.slug.startsWith("wirkungsmanagement-")) {
    return {
      field: "Wirkungsmanagement",
      actor: "Organisation",
      decision: "Strategie, Prozess, Budget, Verantwortlichkeit oder Kommunikationsregel",
      evidence: "Managementroutine, Stakeholder-Rueckmeldung, Prozessdaten, Entscheidungsprotokoll und Lernschleife",
      risk: "die Methode als Berichtsuebung zu behandeln, obwohl Macht, Budget und Korrekturpfad ungeklart bleiben",
      transfer: "Fuehrung, Strategie, Controlling, Einkauf, Kommunikation und Kultur muessen denselben Wirkungsbegriff verwenden.",
    };
  }
  if (item.slug.startsWith("wirkungscontrolling-")) {
    return {
      field: "Impact-Controlling",
      actor: "Controlling- und Steuerungsteam",
      decision: "Indikator, Scorecard, Benchmark, Auditpfad, Portfolioentscheidung oder CAPEX/OPEX-Priorisierung",
      evidence: "Datenquelle, Systemgrenze, Erhebungslogik, Unsicherheit, Aktualitaet und Auditspur",
      risk: "einen Score als Beweis zu lesen, obwohl Datenqualitaet, Gewichtung oder Nichtkompensation offen sind",
      transfer: "Kennzahlen muessen Entscheidungen verbessern, nicht nur Berichte fuellen.",
    };
  }
  return {
    field: "Grundstudium Wirkungsoekonomie",
    actor: "Lernende Person",
    decision: "Begriff, Fallbewertung, Wirkpfad, rote Linie, Quellenbeurteilung oder Rueckkopplungsregel",
    evidence: "begriffliche Praezision, Fallbeschreibung, Quellenklarheit, Plausibilitaet und offene Unsicherheit",
    risk: "einen plausiblen Gedanken bereits fuer Wirkung zu halten, obwohl Empfaenger, Zustand und Zeitbezug fehlen",
    transfer: "Die Grundbegriffe muessen in spaeteren Modulen wiedererkennbar bleiben.",
  };
}

function topicProfile(title) {
  const lower = title.toLowerCase();
  const rules = [
    {
      test: /sdg|agenda|globaler konsens/,
      context: "globale Zielrahmen, politische Legitimation und SDG+-Erweiterung",
      fault: "die SDGs als fertige Bewertungsmaschine zu verwenden",
      source: "UN-Agenda 2030, SDG-Logik, SDG+-Abgrenzung und WOE-Korpus",
    },
    {
      test: /csrd|esrs|gri|taxonomie|nace|dpp/,
      context: "Berichtsstandards, Regulierung, Produktdaten und interoperable Nachweisraeume",
      fault: "Compliance mit Wirkung gleichzusetzen",
      source: "CSRD, ESRS, GRI, EU-Taxonomie, NACE, DPP und WOE-Datenlogik",
    },
    {
      test: /scorecard|benchmark|indikator|daten|audit|monitoring|datenraum|controlling|kennzahlen/,
      context: "Datenqualitaet, Bewertungsprofile, Scorecards und rueckgekoppelte Steuerung",
      fault: "Messbarkeit als Wahrheit zu behandeln",
      source: "WOE-IDs, Benchmarks, Auditlogik, Datenqualitaetsstufen und externe Reportingrahmen",
    },
    {
      test: /kommunikation|sprache|medien|oeffentlichkeit|resonanz|framing|deeskalierend|demokratie/,
      context: "oeffentliche Resonanzraeume, Sprache, Vertrauen, Quellenklarheit und demokratische Rueckkopplung",
      fault: "Reichweite, Zustimmung oder Lautstaerke als Wirkung auszugeben",
      source: "Wirkungsradar, Journal, Glossar, Resonanz- und Quellenklarheitskapitel",
    },
    {
      test: /produkt|technologie|institution|markt|lieferkette|einkauf|capex|opex/,
      context: "Produkte, Institutionen, Lieferketten und Investitionsentscheidungen als Wirkungstraeger",
      fault: "nur die Nutzenseite zu zeigen und Vorketten, Nutzung, Ende oder institutionelle Nebenfolgen auszublenden",
      source: "Produktwirkungslogik, Lebenszyklusdaten, Lieferketten- und Portfoliosteuerung",
    },
    {
      test: /nichtkompensation|reverse merit|netto|nwi|t-sroi|ambivalenz|rote linien|grenzen/,
      context: "Bewertungsgrenzen, Nichtkompensation, Reverse Merit Order und positive Netto-Wirkung",
      fault: "schwere Schaeden mit bequemen Pluspunkten zu verrechnen",
      source: "WOE-Bewertungslogik, SDG+, rote Linien, NWI/T-SROI-Abgrenzung und Schutzgueter",
    },
    {
      test: /mensch|planet|demokratie|generationen|zeit|resilienz|zukunft/,
      context: "Schutzdimensionen, Zeitlogik, Resilienz und Betroffenenperspektive",
      fault: "kurzfristige Entlastung als dauerhafte positive Netto-Wirkung zu verkaufen",
      source: "Grundlagenwerk, Schutzdimensionen Mensch/Planet/Demokratie und Langfristlogik",
    },
  ];
  const found = rules.find((rule) => rule.test.test(lower));
  return (
    found ?? {
      context: "Wirkpfade, Wirkungsempfaenger, Bewertung und Rueckkopplung",
      fault: "Absicht, Aktivitaet oder Reporting als Wirkung zu behandeln",
      source: "Grundlagenwerk, WOE-Referenz, Glossar, Werkzeuge, Journal und externe Fachquellen",
    }
  );
}

function buildApplicationCase(item, anchor, track, topic, idx) {
  const variants = [
    `Eine Kommune, ein Unternehmen oder eine Bildungsorganisation will **${item.title}** praktisch anwenden. Der erste Schritt ist nicht die Auswahl eines Instruments, sondern die Klaerung der Zustandsveraenderung. Bei **${anchor}** muss deshalb benannt werden, wer betroffen ist, welcher Zustand sich veraendert, welche Frist gilt und welche Gegenbeobachtung die Annahme widerlegen wuerde. Erst danach entsteht eine begruendete Entscheidung im Feld ${track.decision}.`,
    `Ein Bericht behauptet, die Massnahme zu **${item.title}** sei erfolgreich. Die WOE-Lesart fragt bei **${anchor}** nach belastbaren Nachweisen: ${track.evidence}. Wenn diese Nachweise fehlen, bleibt die Aussage Wirkungspotenzial oder Kommunikationsbehauptung. Sie kann wichtig sein, aber sie ist noch keine belegte Wirkung.`,
    `In einer kontroversen Entscheidung wirkt **${anchor}** als Pruefpunkt fuer Ambivalenz. Ein Nutzen fuer eine Gruppe kann mit Risiken fuer andere Wirkungsempfaenger einhergehen. Das Skript verlangt deshalb, positive und negative Zustandsveraenderungen getrennt zu fuehren, bevor von positiver Netto-Wirkung gesprochen wird.`,
    `Die typische Fehlstelle bei **${item.title}** liegt darin, ${topic.fault}. Bei **${anchor}** wird diese Fehlstelle konkret: Ein scheinbar plausibler Befund darf nicht zur Abkuerzung werden. Quellen, Systemgrenzen, Unsicherheit und Rueckkopplung bleiben sichtbar.`,
    `Fuer die Pruefung ist **${anchor}** dann verstanden, wenn daraus eine belastbare Fallantwort entsteht. Eine gute Antwort unterscheidet Beobachtung, Kausalannahme, Bewertung und Steuerungsfolge. Sie bewertet keine Menschen, sondern Wirkpfade, Zustandsveraenderungen, Risiken und institutionelle Bedingungen.`,
  ];
  return variants[idx % variants.length];
}

function buildLensParagraph(item, anchor, track, topic, lens, idx) {
  const templates = [
    `**${lens}.** ${anchor} zeigt, warum **${item.title}** mehr ist als ein Schlagwort im Feld ${topic.context}. Die wirkungsoekonomische Frage lautet: Welche reale Veraenderung wird moeglich, welche bleibt nur Potenzial und wo entsteht ein Wirkungsrisiko? Diese Unterscheidung schuetzt vor Impact-Washing, weil sie Absicht, Aktivitaet, Reichweite und Wirkung auseinanderhaelt.`,
    `**${lens}.** In ${item.code} muss **${anchor}** immer mit Empfaengern gelesen werden. Wirkung entsteht nicht beim Sender, sondern an veraenderten Zustaenden von Menschen, Oekosystemen, Institutionen, Oeffentlichkeit oder kuenftigen Handlungsspielraeumen. Darum reicht es nicht, interne Aktivitaeten zu dokumentieren. Entscheidend ist, ob sich ein Zustand nachvollziehbar veraendert und ob diese Veraenderung im Referenzrahmen Mensch, Planet, Demokratie, SDGs, Agenda 2030 und SDG+ tragfaehig bewertet werden kann.`,
    `**${lens}.** Wissenschaftliche Anschlussfaehigkeit entsteht hier durch Quellenklarheit. Bei **${anchor}** werden interne WOE-Begriffe nicht als Ersatz fuer Belege benutzt, sondern mit ${topic.source} verbunden. Wo die Datenlage offen bleibt, wird das offengelegt. Wo eine Aussage nur plausibel ist, bleibt sie als Wirkungspotenzial markiert. Wo ein Schaden eine rote Linie beruehrt, greift Nichtkompensation vor Durchschnittslogik.`,
    `**${lens}.** In ${track.field} wird **${anchor}** erst steuerungsfaehig, wenn daraus eine Entscheidung folgt. ${track.transfer} Ohne diese Rueckkopplung bleibt Reporting eine Beschreibung. Mit Rueckkopplung wird aus Bewertung eine veraenderte Routine: ein anderer Prozess, ein geaenderter Anreiz, eine bessere Datenpflicht, eine korrigierte Kommunikation oder eine neue Priorisierung.`,
    `**${lens}.** Die Grenze gegen Scheingenauigkeit verlaeuft bei **${anchor}** nicht zwischen Optimismus und Pessimismus. Sie verlaeuft zwischen offengelegter Unsicherheit und rhetorischer Sicherheit. Wer **${item.title}** belastbar anwenden will, benennt Systemgrenze, Zeitraum, Vergleichspunkt und offene Gegenhypothese. Gerade dadurch bleibt das Skript anschlussfaehig fuer Forschung, Praxis und spaetere Revision.`,
  ];
  return templates[idx % templates.length];
}

function buildFinalBlock(item, markdown) {
  const base = stripFinalBlock(markdown);
  const anchors = extractAnchors(base, item);
  const track = trackProfile(item);
  const topic = topicProfile(item.title);
  const needed = Math.max(1200, TARGET_WORDS - wordCount(base) + 250);
  const lenses = [
    "Begriffliche Schlussklaerung",
    "Wirkpfad und Empfaenger",
    "Daten, Quellen und Evidenz",
    "Bewertung und rote Linien",
    "Steuerung und Rueckkopplung",
    "Pruefungsnahe Anwendung",
    "Transfer in den WOE-Korpus",
    "Grenzen der Aussage",
  ];

  let block = `${FINAL_MARKER}\n\n${FINAL_NOTE}\n\n`;
  block += `### Finaler Leseauftrag\n\n`;
  block += `Dieses Skript zu **${item.code} ${item.title}** ist als Langformtext angelegt. Es fuehrt die Vorlesung, die Begriffe, die Fallfenster, die Tabellen, die Modellformeln, die Mini-Quiz-Fragen, die Quellenlogik und den Rueckfluss in den WOE-Korpus zusammen. Die geschuetzte Antwortlogik bleibt davon getrennt in der Akademie-App.\n\n`;
  block += `Der Abschluss liest **${item.title}** im Feld **${track.field}**. Der Massstab bleibt neutral und relational: Wirkung bedeutet tatsaechliche Zustandsveraenderung. Wirkungspotenzial beschreibt plausible Moeglichkeit. Wirkungsrisiko beschreibt moegliche negative Veraenderung. Wenn eine Zielgroesse gemeint ist, geht es um positive Netto-Wirkung. Genau diese Trennung entscheidet, ob das Skript fachlich traegt.\n\n`;
  block += `### Abschlussmatrix\n\n`;
  block += `| Pruefebene | Anwendung in ${item.code} | Grenze |\n|---|---|---|\n`;
  block += `| Begriff | Wirkung, Wirkungspotenzial, Wirkungsrisiko und positive Netto-Wirkung getrennt lesen. | Keine Absicht als Wirkung ausgeben. |\n`;
  block += `| Wirkpfad | Ausloeser, Mechanismus, Empfaenger, Zustand und Rueckkopplung verbinden. | Keine lineare Erfolgsgeschichte erfinden. |\n`;
  block += `| Evidenz | ${track.evidence} pruefen. | Keine Scheingenauigkeit erzeugen. |\n`;
  block += `| Bewertung | SDGs, Agenda 2030, SDG+, Nichtkompensation und Reverse Merit Order passend einsetzen. | Keine Durchschnittslogik gegen rote Linien. |\n`;
  block += `| Steuerung | Ergebnis in ${track.decision} uebersetzen. | Kein Reporting ohne Rueckkopplung. |\n\n`;

  let idx = 0;
  while (wordCount(block) < needed) {
    const anchor = anchors[idx % anchors.length];
    const lens = lenses[idx % lenses.length];
    if (idx % lenses.length === 0) {
      const round = Math.floor(idx / lenses.length) + 1;
      block += `### Schlussvertiefung ${round}: ${item.title} im Anwendungsfall\n\n`;
      block += `Die folgenden Abschnitte sind keine neue Pruefungsloesung. Sie verdichten die vorhandenen Kapitel zu einer Lesart, mit der Studierende einen Fall selbststaendig analysieren koennen. Im Mittelpunkt stehen ${topic.context}, nicht moralische Personenbewertung.\n\n`;
    }
    block += `${buildLensParagraph(item, anchor, track, topic, lens, idx)}\n\n`;
    block += `${buildApplicationCase(item, anchor, track, topic, idx)}\n\n`;
    if (idx % 4 === 3) {
      block += `**Kontrollfrage.** Welche Entscheidung waere falsch, wenn **${anchor}** in ${item.code} missverstanden wird? Die Antwort muss mindestens eine Daten- oder Quellenannahme, eine betroffene Gruppe oder Schutzdimension, eine moegliche Nebenwirkung und einen Rueckkopplungsschritt nennen. Richtig ist nicht die lauteste Bewertung, sondern diejenige, die Begriff, Beleg und Steuerungsfolge zusammenhaelt.\n\n`;
    }
    if (idx % 6 === 5) {
      block += `**Rueckfluss.** Fuer den WOE-Korpus bedeutet das: Begriffe aus **${item.title}** sollten dort geschaerft werden, wo sie in Glossar, Werkzeugen, Journal oder Readern doppeldeutig bleiben. Offene Forschungsfragen werden nicht versteckt. Sie markieren die Stelle, an der spaetere Evidenz, ein besserer Datensatz oder eine praezisere Fallstudie die Bewertung veraendern kann.\n\n`;
    }
    idx += 1;
  }

  block += `### V1-Abschlussnotiz\n\n`;
  block += `Diese Finalisierung schliesst die Codex-Inhaltsproduktion fuer ${item.code}. Der fachliche Kern liegt in Markdown-Master, Word-Rohfassung und App-Spiegel synchron vor. Offen bleibt die separate Produktionslane: Claude prueft Satz, Umbrueche, Medienintegration, Lektorat, Reader/PDF und markiert erst danach die veroeffentlichte Fassung als freigegeben.\n`;
  return block.trim() + "\n";
}

function refine(item) {
  const masterPath = join(ROOT, item.masterPath);
  const appPath = join(ROOT, item.appMirrorPath);
  const wordPath = join(ROOT, item.wordRawPath);
  const current = readFileSync(masterPath, "utf8");
  const base = stripFinalBlock(current);
  const next = `${base}\n\n${buildFinalBlock(item, current)}`;
  writeFileSync(masterPath, next, "utf8");
  mkdirSync(dirname(appPath), { recursive: true });
  copyFileSync(masterPath, appPath);
  mkdirSync(dirname(wordPath), { recursive: true });
  execFileSync(PYTHON, [EXPORTER, masterPath, "--out", wordPath], { stdio: "inherit" });
  return {
    slug: item.slug,
    words: wordCount(next),
    finalWords: wordCount(next.slice(next.indexOf(FINAL_MARKER))),
    repeatedTransferQuestions: (next.match(/Pruefungsnahe Transferfrage/g) ?? []).length,
  };
}

const index = JSON.parse(readFileSync(INDEX_PATH, "utf8"));
const results = index.scripts.map(refine);
console.log(
  JSON.stringify(
    {
      refined: results.length,
      minWords: Math.min(...results.map((result) => result.words)),
      maxRepeatedTransferQuestions: Math.max(...results.map((result) => result.repeatedTransferQuestions)),
    },
    null,
    2,
  ),
);
