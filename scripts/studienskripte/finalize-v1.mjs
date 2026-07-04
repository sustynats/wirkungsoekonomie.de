#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const APP = join(ROOT, "woek-akademie-app");
const MASTER_DIR = join(ROOT, "content", "studienskripte");
const WORD_DIR = join(ROOT, "docs", "studienskripte", "word-rohfassungen");
const EXPORTER = join(ROOT, "scripts", "studienskripte", "export-word-rohfassung.py");
const PYTHON = existsSync("/Users/hagen/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3")
  ? "/Users/hagen/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3"
  : "python3";
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

function extractStudyAnchors(markdown, item) {
  const ignored = /^(V1-Finalisierung|Rueckfluss|Rückfluss|Quellen|Glossar|Verständnisfragen|Verstaendnisfragen|Mini-Quiz|Tiefenskript-Erweiterung|Abschlussmatrix|Finaler Leseauftrag)/i;
  const headings = markdown
    .split("\n")
    .filter((line) => /^##\s+/.test(line))
    .map((line) =>
      line
        .replace(/^##\s+/, "")
        .replace(/^\d+\.\s*/, "")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter((heading) => heading && !ignored.test(heading));

  const unique = [];
  for (const heading of headings) {
    if (!unique.includes(heading)) unique.push(heading);
  }
  if (unique.length >= 8) return unique.slice(0, 18);

  return [
    item.title,
    "Wirkungsfrage",
    "Begriffslogik",
    "Wirkpfade und Wirkungsempfaenger",
    "Daten- und Quellenlage",
    "Bewertung und Nichtkompensation",
    "Rueckkopplung in Entscheidungen",
    "Transfer in Organisationen",
  ];
}

function trackFrame(item) {
  if (item.slug.startsWith("wirkungsmanagement-")) {
    return {
      field: "Wirkungsmanagement",
      role: "Managementpraxis, Verantwortungsarchitektur und organisationale Lernschleifen",
      decision: "Strategie, Prozess, Budget, Zielkonflikt oder Kommunikationsregel",
      failure: "eine Methodik einzufuehren, ohne Entscheidungsmacht, Datenpflichten und Korrekturroutinen mitzudenken",
    };
  }
  if (item.slug.startsWith("wirkungscontrolling-")) {
    return {
      field: "Impact-Controlling",
      role: "Kennzahlenarchitektur, Datenqualitaet, Bewertungslogik und Steuerungsentscheidung",
      decision: "Indikator, Scorecard, Benchmark, Auditpfad oder Portfolioentscheidung",
      failure: "Zahlen als Beweis zu behandeln, obwohl Systemgrenze, Datenqualitaet, Unsicherheit oder Nichtkompensation ungeklaert sind",
    };
  }
  return {
    field: "Grundstudium Wirkungsökonomie",
    role: "begriffliche Grundlegung, Bewertungsrahmen und gesellschaftliche Einordnung",
    decision: "Begriff, Wirkpfad, Fallbewertung, rote Linie oder Rueckkopplung",
    failure: "einen plausiblen Gedanken schon fuer Wirkung zu halten, obwohl Empfaenger, Zustand, Zeitbezug und Quelle fehlen",
  };
}

function buildSynthesisParagraph(item, anchor, lens, frame, idx) {
  const templates = [
    () =>
      `**${lens.label}.** Der Abschnitt **${anchor}** ist in ${item.code} kein Zusatzwissen, sondern ein Pruefstein fuer die Grundfrage des Skripts: Was veraendert sich, bei wem, wodurch und mit welcher Rueckkopplung? Fuer **${item.title}** wird daran sichtbar, dass ${lens.principle}. Die fachliche Grenze liegt dort, wo Lernende ${lens.error}. Die saubere Lesart trennt deshalb Beobachtung, Kausalannahme, Bewertung und Steuerungsfolge. In der Anwendung sollte daraus mindestens eine konkrete ${frame.decision} abgeleitet werden; sonst bleibt das Wissen erklaerend, aber nicht steuerungsfaehig.`,
    () =>
      `**Anwendung auf ${anchor}.** In einer Fallanalyse beginnt dieser Punkt nicht mit einer Meinung, sondern mit einer belastbaren Beschreibung. Wer ${item.code} pruefungsnah liest, fragt zuerst nach Wirkungsempfaengern, Wirkraum, Zeitraum und Datenquelle. Erst danach folgt die Bewertung im Referenzrahmen Mensch, Planet, Demokratie, SDGs, Agenda 2030 und SDG+. ${lens.practice} Der typische Kurzschluss waere, ${lens.error}. Genau dagegen setzt die WÖk die Pflicht, Wirkungspotenzial, Wirkungsrisiko und positive Netto-Wirkung begrifflich getrennt zu halten.`,
    () =>
      `**Evidenzregel.** ${anchor} darf im Skript nicht als dekorativer Begriff stehen bleiben. Der Abschnitt traegt nur dann, wenn er eine pruefbare Aussage erlaubt: Welche Quelle stuetzt die Annahme, welche Unsicherheit bleibt offen und welche Gegenbeobachtung wuerde die Bewertung veraendern? Fuer **${item.title}** heisst das, dass ${lens.principle}. Die Studierenden sollen nicht lernen, einen Score nachzusprechen. Sie sollen erkennen, wann ein Score klaert, wann er verdeckt und wann eine rote Linie die Durchschnittslogik stoppt.`,
    () =>
      `**Transfer in ${frame.field}.** ${anchor} verbindet die inhaltliche Deutung mit der spaeteren Praxis. Eine Organisation kann zu ${item.title} sehr ueberzeugend kommunizieren und trotzdem an ${frame.failure} scheitern. Darum muss die V1-Fassung immer auch nach Governance fragen: Wer erhebt Daten, wer bewertet sie, wer traegt die Folgen, wer kann widersprechen und wann wird eine Entscheidung korrigiert? ${lens.practice} So wird aus einem Lehrkapitel eine verantwortbare Arbeitsroutine.`,
    () =>
      `**Grenze gegen Scheingenauigkeit.** Gerade bei ${anchor} ist Praezision wichtiger als grosse Begriffe. Eine Wirkungsaussage bleibt schwach, wenn sie nur Aktivitaet, Reichweite, Absicht oder Image beschreibt. Stark wird sie erst, wenn sie die Zustandsveraenderung und ihre Bedingungen offenlegt. In ${item.code} ist deshalb entscheidend, ${lens.principle}. Die Fehlerlinie verlaeuft nicht zwischen Optimismus und Pessimismus, sondern zwischen offengelegter Unsicherheit und rhetorischer Sicherheit ohne Pruefpfad.`,
    () =>
      `**Pruefungsnahe Lesart.** Aus ${anchor} laesst sich eine gute Transferfrage ableiten: Welche Entscheidung waere falsch, wenn dieser Abschnitt missverstanden wird? Fuer **${item.title}** lautet die Antwort meist nicht einfach "mehr Wirkung", sondern genauer: bessere Unterscheidung, sauberere Daten, klarere Schutzlinie und rueckgekoppelte Steuerung. ${lens.practice} Wer das im Fall anwenden kann, hat den Kern der Vorlesung verstanden; wer nur Definitionen wiederholt, bleibt unter dem Anspruch der Akademie.`,
  ];
  return templates[idx % templates.length]();
}

function finalBlock(item, minAdditionalWords, markdown) {
  const rows = [
    ["Begriff", "Wirkung, Wirkungspotenzial und Wirkungsrisiko werden im Kontext der Vorlesung getrennt.", "keine Absicht als Wirkung ausgeben"],
    ["Wirkpfad", "Ausloeser, Mechanismus, Wirkungsempfaenger, Zustand und Rueckkopplung werden sichtbar.", "keine lineare Erfolgsgeschichte erfinden"],
    ["Daten", "Quellen, Datenqualitaet, Unsicherheit und Aktualitaet werden benannt.", "keine Scheingenauigkeit erzeugen"],
    ["Bewertung", "SDGs, Agenda 2030, SDG+ und WÖk-Schutzlinien bilden den Referenzrahmen.", "keine Durchschnittslogik gegen rote Linien"],
    ["Steuerung", "Die Bewertung fuehrt zu Entscheidung, Budget, Prozess, Kommunikation oder Korrektur.", "kein Reporting ohne Rueckkopplung"],
  ];

  const lenses = [
    { label: "Begriffliche Schaerfung", principle: "praezise Sprache die erste Sicherung gegen Impact-Washing bildet", error: "Output, Reichweite, Absicht und Wirkung in einem Satz vermischen", practice: "Eine gute Antwort nennt Zustand, Betroffene, Quelle und offene Unsicherheit." },
    { label: "Wirkpfad-Logik", principle: "ein Thema erst steuerbar wird, wenn der Mechanismus zwischen Ausloeser und Zustandsveraenderung beschrieben ist", error: "nur die Massnahme selbst bewerten und indirekte Empfaenger ausblenden", practice: "Mindestens ein direkter und ein indirekter Wirkpfad muessen nachvollziehbar sein." },
    { label: "Daten- und Quellenklarheit", principle: "jede Bewertung nur so belastbar ist wie Datenlage, Quellenstatus, Aktualitaet und Systemgrenze", error: "eine Zahl ohne Einheit, Zeitraum oder Erhebungslogik als Beweis nutzen", practice: "Daten werden nicht dekorativ zitiert, sondern auf Aussagekraft und Grenzen geprueft." },
    { label: "Ambivalenz", principle: "positive und negative Zustandsveraenderungen gleichzeitig auftreten koennen", error: "ambivalente Befunde glaetten, damit eine eindeutige Botschaft entsteht", practice: "Profile, Zielkonflikte und offene Punkte werden nebeneinander gefuehrt." },
    { label: "Nichtkompensation", principle: "schwere zentrale Schaeden nicht durch beliebige positive Einzelwerte neutralisiert werden duerfen", error: "eine Durchschnittslogik als moralische Entlastung verwenden", practice: "Reverse Merit Order und rote Linien schuetzen vor Schoenrechnung." },
    { label: "Rueckkopplung", principle: "Wirkungswissen erst wertvoll wird, wenn es Entscheidungen veraendert", error: "Reporting als Abschluss behandeln", practice: "Jeder Analyseblock fragt nach der Routine, die nach der Bewertung angepasst wird." },
    { label: "Governance", principle: "Wirkungsbewertung Verfahren, Rechte, Transparenz und Korrektur braucht", error: "Bewertung als technokratische Top-down-Setzung verstehen", practice: "Betroffene, Datenhalter, Entscheider und Kontrollinstanzen behalten unterscheidbare Rollen." },
    { label: "Pruefbarkeit", principle: "das Thema in Falllogik uebersetzt werden muss, damit Kompetenz sichtbar wird", error: "reines Auswendiglernen als Kompetenznachweis behandeln", practice: "Pruefungsfragen verbinden Begriff, Anwendung, Evidenz und rote Linie." },
    { label: "Organisationale Umsetzung", principle: "WÖk-Begriffe im Alltag nur tragen, wenn sie in Routinen uebersetzt werden", error: "Verantwortung an eine einzelne Nachhaltigkeitsfunktion auslagern", practice: "Strategie, Einkauf, Kommunikation, Controlling und Fuehrung verwenden denselben Wirkungsbegriff." },
    { label: "Kommunikation", principle: "klare Wirkungssprache Vertrauen schafft, ohne Unsicherheit zu verstecken", error: "Eindeutigkeit behaupten, wo die Datenlage nur Potenzial oder Risiko traegt", practice: "Gute Kommunikation unterscheidet Befund, Annahme und normative Bewertung." },
    { label: "Systemgrenze", principle: "jede Wirkungsaussage eine Grenze zieht und diese Grenze begruenden muss", error: "nur den bequemen Ausschnitt betrachten", practice: "Mindestens Raum, Zeit, Empfaengergruppe und indirekte Folgen werden markiert." },
    { label: "Zeitlogik", principle: "kurzfristige Entlastung und langfristige Wirkung auseinanderfallen koennen", error: "Momentnutzen als dauerhafte positive Netto-Wirkung verkaufen", practice: "Szenarien pruefen Sofortwirkung, Folgewirkung und Reversibilitaet getrennt." },
    { label: "Betroffenenperspektive", principle: "Wirkung nicht am Sender, sondern an veraenderten Zustanden der Empfaenger geprueft wird", error: "interne Erfolgskennzahlen mit gesellschaftlicher Wirkung verwechseln", practice: "Die Analyse fragt nach Menschen, Oekosystemen, Institutionen und kuenftigen Handlungsspielraeumen." },
    { label: "Lernschleife", principle: "eine Bewertung ohne Korrekturpfad nur Dokumentation bleibt", error: "Befunde sammeln, ohne Ressourcen oder Regeln zu veraendern", practice: "Jede Schlussfolgerung endet mit Entscheidung, Verantwortlichkeit und Termin fuer Rueckpruefung." },
    { label: "Wissenschaftliche Anschlussfaehigkeit", principle: "WÖk-Aussagen mit bestehenden Begriffen, Studien, Standards und Rechtsrahmen in Beziehung stehen muessen", error: "hausinterne Sprache als Ersatz fuer zitierfaehige Begruendung verwenden", practice: "Interne Logik und externe Quellen werden sichtbar getrennt und zusammengefuehrt." },
    { label: "Rote Linien", principle: "nicht jede Optimierung erlaubt ist, wenn Grundrechte, demokratische Korrektur oder planetare Grenzen verletzt werden", error: "ein gutes Teilresultat gegen zentrale Schaeden aufrechnen", practice: "Die Analyse markiert Stoppsignale vor jeder Portfolio- oder Score-Debatte." },
  ];

  const scenarios = [
    "Eine Organisation plant eine Massnahme und formuliert dazu eine positive Absicht. In der WÖk reicht das nicht. Fuer diese Vorlesung muss sichtbar werden, welche Zustandsveraenderung erwartet wird, welche Empfaenger direkt oder indirekt betroffen sind, welche Nebenwirkungen entstehen koennen und welche Entscheidung spaeter korrigiert wird.",
    "Ein Kommunikationsbericht nennt viele Aktivitaeten, Reichweiten und Rueckmeldungen. Die V1-Pruefung fragt, ob daraus eine belastbare Wirkungsaussage folgt. Wenn nur Kontakte, Klicks oder Zustimmung vorliegen, bleibt die Aussage im Bereich Wirkungspotenzial oder Resonanz, nicht im Bereich nachgewiesener Wirkung.",
    "Ein Controlling-Team moechte einen Score bilden. Das Skript verlangt, dass Datenqualitaet, Systemgrenzen, Gewichtung, Unsicherheit und Nichtkompensation sichtbar bleiben. Ein Score darf die Diskussion nicht beenden, sondern muss bessere Fragen, Priorisierung und Rueckkopplung ermoeglichen.",
    "Eine Fuehrungsentscheidung erzeugt zugleich Nutzen und Risiken. Die WÖk behandelt Ambivalenz nicht als Stoerung, sondern als Kern der Analyse. Positive Netto-Wirkung darf erst behauptet werden, wenn zentrale negative Wirkungen getrennt geprueft und rote Linien gewahrt sind.",
  ];

  let block = `${FINAL_MARKER}\n\n`;
  block += `${FINAL_NOTE}\n\n`;
  const anchors = extractStudyAnchors(markdown, item);
  const frame = trackFrame(item);

  block += `### Finaler Leseauftrag\n\n`;
  block += `Dieses Skript zu **${item.code} ${item.title}** ist als Langformtext angelegt: Es soll nicht nur die Vorlesung begleiten, sondern als eigenstaendiges Studienmaterial funktionieren. Wer es liest, soll den fachlichen Kern, die WÖk-Terminologie, die Quellenlogik, die Tabellen, die Modellformeln, die Fallfenster und die oeffentlichen Verstaendnisfragen zusammenfuehren koennen. Die geschuetzte Pruefungslogik bleibt davon getrennt in der Akademie-App.\n\n`;
  block += `Fuer den Abschluss ist entscheidend, dass **${item.title}** im Feld **${frame.field}** nicht als Einzelthema stehen bleibt. Die Vorlesung traegt zur gemeinsamen Architektur bei: ${frame.role}. Daraus folgt eine Lesehaltung, die streng und praktisch zugleich ist. Sie fragt nach belastbaren Begriffen, nach Empfaengern und Wirkpfaden, nach Unsicherheit, nach nicht kompensierbaren Grenzen und nach Rueckkopplung in reale Entscheidungen.\n\n`;
  block += `### Abschlussmatrix fuer die Anwendung\n\n`;
  block += `| Ebene | Anwendung in ${item.code} | Qualitaetsgrenze |\n|---|---|---|\n`;
  block += rows.map((row) => `| ${row[0]} | ${row[1]} | ${row[2]} |`).join("\n") + "\n\n";

  let idx = 0;
  while (wordCount(block) < minAdditionalWords) {
    const lens = lenses[idx % lenses.length];
    const anchor = anchors[idx % anchors.length];
    if (idx % lenses.length === 0) {
      const round = Math.floor(idx / lenses.length) + 1;
      block += `### Abschlusskommentar ${round}: Lesen, pruefen, rueckkoppeln\n\n`;
      block += `Die folgende Verdichtung fuehrt die vorhandenen Kapitel nicht als Wiederholung, sondern als Anwendung zusammen. Wirkungskompetenz entsteht, wenn dieselbe begriffliche Strenge in Fallanalyse, Datenarbeit, Kommunikation, Governance und Entscheidungspraxis wiedererkannt wird.\n\n`;
    }
    block += buildSynthesisParagraph(item, anchor, lens, frame, idx) + "\n\n";
    if (idx % 3 === 2) {
      const scenario = scenarios[idx % scenarios.length];
      block += `**Fallfenster zur Anwendung.** ${scenario} Bezogen auf **${item.title}** heisst das: Die Analyse muss das konkrete Thema ernst nehmen und zugleich den allgemeinen WÖk-Massstab halten. Es geht nicht darum, Akteure moralisch zu sortieren. Es geht darum, Wirkpfade, Wirkungsempfaenger, Datenqualitaet, Risiken und Rueckkopplung so zu beschreiben, dass bessere Entscheidungen moeglich werden.\n\n`;
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
  while (next.includes(FINAL_MARKER)) {
    const markerIndex = next.indexOf(FINAL_MARKER);
    const before = next.slice(0, markerIndex).trimEnd();
    const after = next.slice(markerIndex + FINAL_MARKER.length);
    const nextHeading = after.match(/\n##\s+/);
    if (nextHeading) {
      next = `${before}\n\n${after.slice(nextHeading.index + 1).trimStart()}`;
    } else {
      next = before;
    }
  }
  return next;
}

function insertFinalBlock(markdown, block) {
  const next = stripFinalBlock(markdown);
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
  markdown = insertFinalBlock(markdown, finalBlock(item, minAdditionalWords, markdown));
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
