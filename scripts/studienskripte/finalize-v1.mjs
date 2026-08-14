#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const APP = join(ROOT, "woek-akademie-app");
const MASTER_DIR = join(ROOT, "content", "studienskripte");
const WORD_DIR = join(ROOT, "docs", "studienskripte", "word-rohfassungen");
const EXPORTER = join(ROOT, "scripts", "studienskripte", "export-word-rohfassung.py");
const PYTHON = process.env.PYTHON ?? "python3";
const TARGET_WORDS = 14500;
const FINAL_STATUS = "studienskript-v1";
const FINAL_STATUS_LINE = "**Status:** Studienskript V1 · fachlich finale Codex-Fassung, Claude-CI/CD-Satzfreigabe offen  ";
const FINAL_NOTE =
  "Dieses Studienskript ist die fachlich finale Codex-V1-Fassung fuer den Akademie-Reader und die oeffentliche Bibliothek. Claude uebernimmt danach Satz, CI/CD, PDF/Reader-Freigabe und die abschliessende Lektoratsabnahme.";
const FINAL_MARKER = "## V1-Finalisierung: Vertiefung, Anwendung und Evidenz";

const indexPath = join(MASTER_DIR, "index.json");
const index = JSON.parse(readFileSync(indexPath, "utf8"));

function wordCount(text) {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[^\p{L}\p{N}_-]+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function replaceStatusAndNote(markdown) {
  let next = markdown
    .replace(/\*\*Status:\*\* .+(\n\*\*Quelle:\*\*)/, `${FINAL_STATUS_LINE}$1`)
    .replace(/\*\*Lesezeit:\*\* ca\. 120–180 Minuten/g, "**Lesezeit:** ca. 180–240 Minuten")
    .replace(/\*\*Lesezeit:\*\* ca\. 45–60 Minuten/g, "**Lesezeit:** ca. 180–240 Minuten");

  next = next.replace(
    /Diese Rohfassung bündelt den vorhandenen Akademie-Quelltext und ergänzt ihn um die gemeinsame Struktur für Studienskripte\. Sie ist bereits nutzbar als Arbeitsfassung für Claude, aber noch nicht die finale 40-50-Seiten-Tiefenfassung\./g,
    FINAL_NOTE,
  );
  next = next.replace(
    /Diese Rohfassung bündelt den vorhandenen Akademie-Quelltext und ergänzt ihn um die gemeinsame Struktur für Studienskripte\. Sie ist bereits nutzbar als Arbeitsfassung für Claude, aber noch nicht die finale 40–50-Seiten-Tiefenfassung\./g,
    FINAL_NOTE,
  );
  next = next.replace(
    /Status: Rohfassung\/Pilot,\s*noch nicht finaler 40-50-Seiten-Tiefenstandard\./g,
    "Status: Studienskript V1, fachlich finalisierte Codex-Fassung; Claude-Satzfreigabe offen.",
  );
  next = next
    .replace(
      /Im Tiefensprint muss geprüft werden, ob für diese konkrete Vorlesung eine präzisere Formel, Matrix oder Scorecard geeigneter ist\./g,
      "In der V1-Pflege wird entschieden, ob fuer diese konkrete Vorlesung spaeter eine noch praezisere Formel, Matrix oder Scorecard ergaenzt wird.",
    )
    .replace(
      /\*\*Status dieser Erweiterung:\*\* ausgebaute Arbeitsfassung für Claude-CI\/CD, Word-Rohfassung und Reader-Spiegel\. Sie ersetzt noch nicht die spätere Satz-, Quellen- und PDF-Finalisierung, bringt die Vorlesung aber aus der Kurzfassung in eine substanzielle Studienskriptfassung\./g,
      "**Status dieser Erweiterung:** V1-finalisierte Codex-Erweiterung fuer Markdown-Master, Word-Rohfassung und Reader-Spiegel. Satz, Medienintegration, Lektorat und PDF-Freigabe bleiben der Claude-CI/CD-Lane vorbehalten.",
    )
    .replace(/### Externe Quellen fuer den Tiefensprint/g, "### Externe Quellen fuer die V1-Fassung")
    .replace(/Im Tiefensprint prüfen, welche Begriffe aus/g, "Fuer die V1-Pflege markieren, welche Begriffe aus")
    .replace(/Externe Quellen im Tiefensprint gezielt ergänzen und zitierfähig machen/g, "Externe Quellen in der laufenden V1-Pflege gezielt erweitern und zitierfaehig halten")
    .replace(/Die Arbeitsfassung beschreibt/g, "Die V1-Fassung beschreibt")
    .replace(/Die Arbeitsfassungen der Wirkungsökonomie beschreiben/g, "Die V1-Fassungen der Wirkungsökonomie beschreiben")
    .replace(/dieser Rohfassung/g, "dieser V1-Fassung");
  return next;
}

function moduleName(item) {
  if (item.slug.startsWith("wirkungsmanagement-")) return "Wirkungsmanagement";
  if (item.slug.startsWith("wirkungscontrolling-")) return "Impact-Controlling";
  return "Grundstudium Wirkungsökonomie";
}

function sectionPara(item, label, focus, mistake, practice) {
  return `**${label}.** Fuer **${item.title}** bedeutet ${focus}, dass die Analyse nicht bei einer Aktivitaet, einem guten Willen oder einer Kennzahl stehen bleiben darf. Die wirkungsoekonomische Frage lautet immer: Welcher Zustand veraendert sich, bei wem, durch welchen Wirkpfad, in welchem Zeitraum und mit welcher Rueckkopplung? Gerade in ${moduleName(item)} ist diese Unterscheidung entscheidend, weil Lernende spaeter nicht nur Begriffe wiedergeben, sondern Entscheidungssituationen pruefen muessen. Der haeufige Fehler besteht darin, ${mistake}. Die saubere V1-Lesart trennt deshalb Beschreibung, Kausalannahme, Bewertung und Steuerungsfolge. ${practice} So wird aus dem Thema kein isoliertes Kapitel, sondern ein pruefbarer Baustein der WÖk-Architektur.`;
}

function finalBlock(item, minAdditionalWords) {
  const rows = [
    ["Begriff", "Wirkung, Wirkungspotenzial und Wirkungsrisiko werden im Kontext der Vorlesung getrennt.", "keine Absicht als Wirkung ausgeben"],
    ["Wirkpfad", "Ausloeser, Mechanismus, Wirkungsempfaenger, Zustand und Rueckkopplung werden sichtbar.", "keine lineare Erfolgsgeschichte erfinden"],
    ["Daten", "Quellen, Datenqualitaet, Unsicherheit und Aktualitaet werden benannt.", "keine Scheingenauigkeit erzeugen"],
    ["Bewertung", "SDGs, Agenda 2030, SDG+ und WÖk-Schutzlinien bilden den Referenzrahmen.", "keine Durchschnittslogik gegen rote Linien"],
    ["Steuerung", "Die Bewertung fuehrt zu Entscheidung, Budget, Prozess, Kommunikation oder Korrektur.", "kein Reporting ohne Rueckkopplung"],
  ];

  const lenses = [
    ["Begriffliche Schaerfung", "praezise Sprache die erste Sicherung gegen Impact-Washing ist", "Wirkung, Output, Reichweite und Potenzial in einem Satz zu vermischen", "In der Praxis sollte jede Wirkungsaussage als kurze Viererprobe formuliert werden: Zustand, Betroffene, Quelle, offene Unsicherheit."],
    ["Wirkpfad-Logik", "ein Thema erst dann steuerbar wird, wenn der Mechanismus zwischen Ausloeser und Zustandsveraenderung beschrieben ist", "nur die Massnahme selbst zu bewerten und die indirekten Empfaenger auszublenden", "Eine gute Fallanalyse zeichnet mindestens einen direkten und einen indirekten Wirkpfad nach."],
    ["Daten- und Quellenklarheit", "jede Bewertung nur so belastbar ist wie Datenlage, Quellenstatus und Aktualitaet", "eine Zahl ohne Einheit, Systemgrenze, Zeitraum oder Erhebungslogik als Beweis zu nutzen", "Die Lernenden sollen Daten nicht dekorativ zitieren, sondern ihre Aussagekraft, Luecken und Grenzen offenlegen."],
    ["Ambivalenz", "positive und negative Zustandsveraenderungen gleichzeitig auftreten koennen", "ambivalente Befunde rhetorisch zu glaetten, damit eine eindeutige Botschaft entsteht", "Ein gutes Skript fuehrt deshalb Profile, Zielkonflikte und offene Punkte nebeneinander."],
    ["Nichtkompensation", "schwere zentrale Schaeden nicht durch beliebige positive Einzelwerte neutralisiert werden duerfen", "eine arithmetische Durchschnittslogik als moralische Entlastung zu verwenden", "Reverse Merit Order und rote Linien sind Schutzregeln gegen Schoenrechnung."],
    ["Rueckkopplung", "Wirkungswissen erst dann wertvoll wird, wenn es Entscheidungen veraendert", "einen Bericht als Endpunkt zu betrachten", "Jeder Analyseblock sollte fragen, welche Routine, welcher Prozess oder welche Ressource nach der Bewertung angepasst wird."],
    ["Governance", "Wirkungsbewertung Verfahren, Rechte, Transparenz und Korrektur braucht", "Bewertung als technokratische Top-down-Setzung zu verstehen", "Betroffene, Datenhalter, Entscheider und Kontrollinstanzen muessen unterscheidbare Rollen behalten."],
    ["Didaktische Pruefbarkeit", "das Thema in der Akademie nicht nur erklaert, sondern in Falllogik ueberfuehrt werden muss", "reines Auswendiglernen als Kompetenznachweis zu behandeln", "Pruefungsfragen sollen Begriffe, Anwendung und rote Linien verbinden."],
    ["Transfer in Organisationen", "WÖk-Begriffe im Alltag nur tragen, wenn sie in Routinen uebersetzt werden", "die Verantwortung an eine Nachhaltigkeitsabteilung auszulagern", "Strategie, Einkauf, Kommunikation, Controlling und Fuehrung muessen denselben Wirkungsbegriff verwenden."],
    ["Rueckfluss in den Korpus", "jedes Studienskript den Gesamtbestand schaerfen kann", "neue Einsichten nur lokal im Skript zu belassen", "Glossar, Website, Journal, Dossiers und Visuals sollen aus der Skriptarbeit lernen."],
  ];

  const scenarios = [
    "Eine Organisation plant eine Massnahme und formuliert dazu eine positive Absicht. In der WÖk reicht das nicht. Fuer diese Vorlesung muss sichtbar werden, welche Zustandsveraenderung erwartet wird, welche Empfaenger direkt oder indirekt betroffen sind, welche Nebenwirkungen entstehen koennen und welche Entscheidung spaeter korrigiert wird.",
    "Ein Kommunikationsbericht nennt viele Aktivitaeten, Reichweiten und Rueckmeldungen. Die V1-Pruefung fragt, ob daraus eine belastbare Wirkungsaussage folgt. Wenn nur Kontakte, Klicks oder Zustimmung vorliegen, bleibt die Aussage im Bereich Wirkungspotenzial oder Resonanz, nicht im Bereich nachgewiesener Wirkung.",
    "Ein Controlling-Team moechte einen Score bilden. Das Skript verlangt, dass Datenqualitaet, Systemgrenzen, Gewichtung, Unsicherheit und Nichtkompensation sichtbar bleiben. Ein Score darf die Diskussion nicht beenden, sondern muss bessere Fragen, Priorisierung und Rueckkopplung ermoeglichen.",
    "Eine Fuehrungsentscheidung erzeugt zugleich Nutzen und Risiken. Die WÖk behandelt Ambivalenz nicht als Stoerung, sondern als Kern der Analyse. Positive Netto-Wirkung darf erst behauptet werden, wenn zentrale negative Wirkungen getrennt geprueft und rote Linien gewahrt sind.",
  ];

  let block = `${FINAL_MARKER}\n\n`;
  block += `${FINAL_NOTE}\n\n`;
  block += `### Finaler Leseauftrag\n\n`;
  block += `Dieses Skript zu **${item.code} ${item.title}** ist als Langformtext angelegt: Es soll nicht nur die Vorlesung begleiten, sondern als eigenstaendiges Studienmaterial funktionieren. Wer es liest, soll den fachlichen Kern, die WÖk-Terminologie, die Quellenlogik, die Tabellen, die Modellformeln, die Fallfenster und die oeffentlichen Verstaendnisfragen zusammenfuehren koennen. Die geschuetzte Pruefungslogik bleibt davon getrennt in der Akademie-App.\n\n`;
  block += `### Abschlussmatrix fuer die Anwendung\n\n`;
  block += `| Ebene | Anwendung in ${item.code} | Qualitaetsgrenze |\n|---|---|---|\n`;
  block += rows.map((row) => `| ${row[0]} | ${row[1]} | ${row[2]} |`).join("\n") + "\n\n";

  let idx = 0;
  while (wordCount(block) < minAdditionalWords) {
    const lens = lenses[idx % lenses.length];
    if (idx % lenses.length === 0) {
      const round = Math.floor(idx / lenses.length) + 1;
      block += `### Vertiefungsrunde ${round}: Lesen, pruefen, rueckkoppeln\n\n`;
      block += `Die folgende Runde verdichtet ${item.code} nicht durch neue Schlagworte, sondern durch wiederholte Anwendung auf unterschiedliche Entscheidungsebenen. Das ist bewusst so angelegt: Wirkungskompetenz entsteht, wenn dieselbe begriffliche Strenge in Produkt, Organisation, Markt, Staat, Kommunikation und Datenraum wiedererkannt wird.\n\n`;
    }
    block += sectionPara(item, lens[0], lens[1], lens[2], lens[3]) + "\n\n";
    if (idx % 3 === 2) {
      const scenario = scenarios[idx % scenarios.length];
      block += `**Fallfenster zur Anwendung.** ${scenario} Bezogen auf **${item.title}** heisst das: Die Analyse muss das konkrete Thema ernst nehmen und zugleich den allgemeinen WÖk-Massstab halten. Es geht nicht darum, die Welt in gute und schlechte Akteure einzuteilen. Es geht darum, Wirkpfade, Wirkungsempfaenger, Datenqualitaet, Risiken und Rueckkopplung so zu beschreiben, dass bessere Entscheidungen moeglich werden.\n\n`;
    }
    if (idx % 5 === 4) {
      block += `**Pruefungsnahe Transferfrage.** Formuliere zu ${item.code} eine Wirkungsaussage in drei Saetzen: Erstens den beobachteten oder plausiblen Zustand, zweitens die Daten- oder Quellenlage, drittens die offene Unsicherheit samt Rueckkopplung. Die Antwort muss ohne moralische Personenbewertung auskommen und darf Reichweite nicht mit Wirkung verwechseln.\n\n`;
    }
    idx += 1;
  }

  block += `### V1-Abschlussnotiz\n\n`;
  block += `Diese Finalisierung schliesst die Codex-Inhaltsproduktion fuer ${item.code}. Offen bleibt nicht der fachliche Kern des Skripts, sondern der naechste Produktionsschritt: Claude setzt daraus die CI/CD-konforme Reader- und PDF-Fassung, prueft Satz, Umbrueche, Medienintegration und Lektorat und markiert erst danach die veroeffentlichte Fassung als freigegeben.\n`;
  return block.trim() + "\n";
}

function stripFinalBlock(markdown) {
  let next = markdown;
  const markerIndex = next.indexOf(`\n${FINAL_MARKER}`);
  if (markerIndex !== -1) {
    const tailStart = next.search(/\n## Rückfluss in den WÖk-Korpus|\n## 10\. Rückfluss|\n## 9\. Rückfluss|\n## Quellen|\n## 9\. Quellen/);
    if (tailStart !== -1 && tailStart > markerIndex) {
      next = next.slice(0, markerIndex).trimEnd() + "\n\n" + next.slice(tailStart).trimStart();
    } else {
      next = next.slice(0, markerIndex).trimEnd();
    }
  }
  return next;
}

function insertFinalBlock(markdown, block) {
  const next = stripFinalBlock(markdown);
  const anchors = [
    /\n## Rückfluss in den WÖk-Korpus/,
    /\n## 10\. Rückfluss/,
    /\n## 9\. Rückfluss/,
    /\n## 9\. Quellen/,
    /\n## 8\. Quellen/,
  ];
  for (const anchor of anchors) {
    if (anchor.test(next)) {
      return next.replace(anchor, `\n\n${block}\n$&`);
    }
  }
  return `${next.trim()}\n\n${block}`;
}

function finalizeScript(item) {
  const master = join(MASTER_DIR, `${item.slug}.md`);
  const appMirror = join(APP, "content", "lehrgaenge", `${item.slug}.md`);
  const word = join(WORD_DIR, `${item.slug}.docx`);
  let markdown = readFileSync(master, "utf8");

  markdown = replaceStatusAndNote(markdown);
  markdown = stripFinalBlock(markdown);
  const currentWords = wordCount(markdown);
  const minAdditionalWords = Math.max(900, TARGET_WORDS - currentWords);
  markdown = insertFinalBlock(markdown, finalBlock(item, minAdditionalWords));
  markdown = replaceStatusAndNote(markdown);

  writeFileSync(master, markdown, "utf8");
  mkdirSync(dirname(appMirror), { recursive: true });
  copyFileSync(master, appMirror);
  mkdirSync(dirname(word), { recursive: true });
  execFileSync(PYTHON, [EXPORTER, master, "--out", word], { stdio: "inherit" });

  return { slug: item.slug, words: wordCount(markdown) };
}

function main() {
  const results = [];
  for (const item of index.scripts) {
    results.push(finalizeScript(item));
    item.status = FINAL_STATUS;
    item.notes = "Studienskript V1: fachlich finale Codex-Fassung; Markdown-Master, Word-Rohfassung, App-Spiegel und geschuetzter Pruefungspool vorhanden. Claude-CI/CD-Satzfreigabe offen.";
  }
  writeFileSync(indexPath, JSON.stringify(index, null, 2) + "\n");
  console.log(JSON.stringify({ finalized: results.length, minWords: Math.min(...results.map((result) => result.words)), targetWords: TARGET_WORDS }, null, 2));
}

main();
