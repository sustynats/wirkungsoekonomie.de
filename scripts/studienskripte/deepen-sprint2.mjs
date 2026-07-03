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

const lectures = [
  {
    slug: "woek-g-v21",
    code: "V21",
    title: "Produkte, Technologien und Institutionen als Auslöser",
    thesis:
      "Produkte, Technologien und Institutionen sind in der WÖk keine neutralen Kulissen. Sie setzen Wirkpfade in Gang, verändern Möglichkeitsräume und stabilisieren oder blockieren Rückkopplung.",
    pages: [
      "referenz/kapitel-048-produkte-als-wirkungstraeger/index.html",
      "referenz/kapitel-035-digitale-produktpaesse-und-wirkungsdatenraeume/index.html",
      "referenz/kapitel-042-unternehmen-als-wirkungssysteme/index.html",
      "referenz/kapitel-080-digitalisierung-als-infrastruktur-der-wirkungsoekonomie/index.html",
      "referenz/kapitel-098-pilotprojekte/index.html",
    ],
    matrix: [
      ["Produkt", "Lebenszyklus, Nutzung, Reparierbarkeit, Entsorgung, Lieferkette", "Produktimage oder Preis mit Wirkung verwechseln", "Produkt als Wirkungsträger mit Daten- und Rückkopplungspflicht lesen"],
      ["Technologie", "Möglichkeitsraum, Skalierung, Daten, Abhängigkeiten, neue Routinen", "Technikoptimismus oder Technikangst als Bewertung ausgeben", "Wirkmechanismus, Zugang, Macht, Risiken und Lernfähigkeit trennen"],
      ["Institution", "Regeln, Zuständigkeiten, Vertrauen, Verfahren, Rechte, Standards", "Institution als Gebäude oder Behörde verkürzen", "Institution als stabilisierten Wirkungsraum analysieren"],
      ["Infrastruktur", "Dauerhafte Bedingungen des Handelns", "Infrastruktur nur als Kostenblock sehen", "Infrastruktur als Träger von Prävention, Resilienz und Rückkopplung bewerten"],
    ],
    cases: [
      "Ein digitales Lernsystem ist kein Wirkungsnachweis. Es kann Zugang verbessern, Lehrkräfte entlasten und Lernstände sichtbar machen. Es kann aber auch Datenrisiken, Abhängigkeit von Plattformen, soziale Spaltung oder didaktische Verarmung erzeugen. Die WÖk fragt deshalb nicht, ob das System modern ist, sondern welche Zustände es bei Lernenden, Lehrenden, Schulen und demokratischer Bildungsfähigkeit verändert.",
      "Ein reparierbares Haushaltsgerät kann teurer wirken als ein kurzlebiges Billigprodukt. Wirkungsökonomisch verschiebt sich der Vergleich, wenn Haltbarkeit, Ersatzteile, Energieverbrauch, Elektroschrott, Lieferkettenrisiken und soziale Zugänglichkeit einbezogen werden. Der Auslöser ist nicht der Kauf, sondern die Produktarchitektur über den Lebenszyklus.",
    ],
    formula: "A_{wirk} = f(P_{daten}, T_{zugang}, I_{regeln}, R_{resonanz}, K_{korrektur})",
    formulaNote:
      "Das Wirkungspotenzial eines Auslösers steigt nur dann in Richtung tatsächlicher Wirkung, wenn Produktdaten, technologischer Zugang, institutionelle Regeln, gesellschaftliche Resonanz und Korrekturfähigkeit zusammenkommen.",
    backflow: [
      "Produktwirkung stärker als Brücke zwischen DPP, WÖk-ID und öffentlicher Beschaffung erklären.",
      "Technologie in Glossar und Akademie konsequent als Möglichkeitsraum statt als Selbstzweck führen.",
      "Institutionen als Wirkungsräume in späteren Management- und Controlling-Skripten wieder aufnehmen.",
    ],
  },
  {
    slug: "woek-g-v22",
    code: "V22",
    title: "Wirkungssprache und Quellenklarheit",
    thesis:
      "Wirkungssprache ist eine Schutztechnik gegen Impact-Washing: Sie trennt Zustandsveränderung, Potenzial, Risiko, Annahme und Quelle, ohne die WÖk in Sprachpolizei zu verwandeln.",
    pages: [
      "referenz/kapitel-016-das-begriffssystem-der-wirkungsoekonomie/index.html",
      "referenz/kapitel-030-von-wirkung-zu-messung/index.html",
      "referenz/kapitel-074-oeffentlichkeit-als-wirkungsraum/index.html",
      "referenz/kapitel-076-framing-sprache-und-tonalitaet/index.html",
      "dokumente/von-der-wissensgesellschaft-zur-wirkungsgesellschaft/index.html",
    ],
    matrix: [
      ["Wirkung", "belegte oder plausibel nachgewiesene Zustandsveränderung", "\"Wir wirken\" ohne Zustandsdaten", "\"Die Maßnahme veränderte Zustand X bei Gruppe Y im Zeitraum Z.\""],
      ["Wirkungspotenzial", "Möglichkeit künftiger Wirkung unter Bedingungen", "Potenzial als Ergebnis verkaufen", "\"Die Maßnahme kann unter Bedingungen A/B zu X beitragen.\""],
      ["Wirkungsrisiko", "mögliche negative oder unbeabsichtigte Zustandsveränderung", "Risiken aus der Kommunikation entfernen", "\"Das Risiko liegt in Verdrängung, Rebound oder Vertrauensverlust.\""],
      ["Quelle", "Daten, Studie, Modell, Erfahrungswissen oder begründete Annahme", "alle Evidenzarten gleich stark behandeln", "\"Diese Aussage beruht auf Modellannahmen; empirische Prüfung steht aus.\""],
    ],
    cases: [
      "Die Aussage \"Unser Projekt rettet Demokratie\" ist wirkungsökonomisch zu groß. Sauberer ist: Das Projekt kann demokratische Teilhabe stärken, wenn es Zugang, Verständlichkeit, Moderation und Rückkopplung sichert; belegt sind bislang Teilnahmezahlen und qualitative Rückmeldungen, offen bleiben dauerhafte Vertrauens- und Beteiligungseffekte.",
      "Ein Unternehmen, das \"klimapositiv\" kommuniziert, muss zeigen, ob reale Emissionen sinken, ob Kompensation verwendet wird, welche Scope-Grenzen gelten, welche Datenqualität vorliegt und welche Wirkungsrisiken verbleiben. Sonst wird Sprache zum Ersatz für Wirkung.",
    ],
    formula: "Aussagestaerke = Evidenzgrad \\times Begriffspräzision \\times Quellenklarheit \\times Unsicherheitsklarheit",
    formulaNote:
      "Eine Wirkungsaussage wird nicht dadurch stärker, dass sie lauter formuliert wird. Sie wird stärker, wenn Evidenz, Begriff, Quelle und Unsicherheit zusammenpassen.",
    backflow: [
      "Website-weite Formulierungsregel ergänzen: Wirkung behaupten nur mit Zustandsveränderung, sonst Wirkungspotenzial oder Wirkungsrisiko.",
      "Glossarverweise zu Impact-Washing, Wirkungspotenzial und Quellenklarheit verdichten.",
      "Journal- und Dossiertexte auf Reichweite-als-Wirkung-Verwechslung prüfen.",
    ],
  },
  {
    slug: "woek-g-v23",
    code: "V23",
    title: "Unsicherheit, Ambivalenz und transparente Bewertung",
    thesis:
      "Ambivalenz ist kein Defekt der Wirkungsbewertung. Sie ist der Normalfall komplexer Systeme und muss durch Profile, Datenqualitätsklassen, Nichtkompensation und Rückkopplung entscheidungsfähig werden.",
    pages: [
      "referenz/kapitel-023-wirkungsrisiko-und-wirkungsresilienz/index.html",
      "referenz/kapitel-030-von-wirkung-zu-messung/index.html",
      "referenz/kapitel-032-benchmarks-skalen-und-scorecards/index.html",
      "referenz/kapitel-034-t-sroi-und-systemische-transformationsmessung/index.html",
      "referenz/kapitel-106-die-fehlbarkeit-der-wirkungsoekonomie/index.html",
    ],
    matrix: [
      ["Datenunsicherheit", "Daten fehlen, sind alt, indirekt oder schwer vergleichbar", "Score als exakte Wahrheit ausgeben", "Datenqualitätsklasse und Annahmen ausweisen"],
      ["Wirkungsambivalenz", "positive und negative Zustandsveränderungen treten gleichzeitig auf", "eine Seite rhetorisch unsichtbar machen", "Profil statt Einzahlwert, Zielkonflikt offenlegen"],
      ["Modellunsicherheit", "Gewichtungen, Benchmarks und Kausalannahmen sind begründet, aber vorläufig", "Modell als Naturgesetz behandeln", "Version, Quelle und Korrekturweg nennen"],
      ["Entscheidungsunsicherheit", "Handeln ist nötig, obwohl Erkenntnis unvollständig bleibt", "Unsicherheit als Stillstandsargument nutzen", "Vorsorge, Pilot, Monitoring und Rückkopplung verbinden"],
    ],
    cases: [
      "Energetische Sanierung kann Klima und Gesundheit verbessern, aber Verdrängung auslösen. Eine transparente Bewertung muss Emissionsminderung, Heizkosten, Mieten, Sozialschutz, Gebäudezustand, Förderlogik und Beteiligung getrennt ausweisen. Erst dann wird der Konflikt steuerbar.",
      "Eine KI-Anwendung in der Verwaltung kann Wartezeiten senken, aber Fehler, Diskriminierung oder Intransparenz erzeugen. Die WÖk darf weder den Effizienzgewinn romantisieren noch die Technologie pauschal verwerfen; sie braucht Prüfpfad, Datenqualität, Beschwerdewege und Audit.",
    ],
    formula: "Bewertbarkeit = Datenqualitaet + Profilklarheit + Risikotransparenz + Rueckkopplungsfaehigkeit",
    formulaNote:
      "Unsicherheit wird nicht wegaddiert. Sie wird als Eigenschaft der Bewertung sichtbar gemacht und über Lernschleifen reduziert.",
    backflow: [
      "Datenqualitätsklassen und Unsicherheitsampel in Scorecard-Dokumente einheitlich übernehmen.",
      "Nichtkompensation nicht nur als Bewertungsregel, sondern als Kommunikationsschutz erklären.",
      "Fehlbarkeit der WÖk in Prüfungsfällen explizit abfragen: Korrektur ist Stärke, nicht Schwäche.",
    ],
  },
  {
    slug: "woek-g-v24",
    code: "V24",
    title: "Deeskalierende und demokratiestärkende Kommunikation",
    thesis:
      "WÖk-Kommunikation muss Wirkung klar benennen und zugleich Würde, Lernfähigkeit und demokratische Konfliktfähigkeit schützen. Deeskalation bedeutet Klarheit ohne Entmenschlichung.",
    pages: [
      "referenz/kapitel-074-oeffentlichkeit-als-wirkungsraum/index.html",
      "referenz/kapitel-075-plattformlogik-und-algorithmen/index.html",
      "referenz/kapitel-076-framing-sprache-und-tonalitaet/index.html",
      "referenz/kapitel-077-desinformation-und-hybride-kriegsfuehrung/index.html",
      "referenz/kapitel-079-diskurskultur/index.html",
      "referenz/kapitel-103-technokratie-ueberwachung-und-die-angst-vor-steuerung/index.html",
    ],
    matrix: [
      ["Person", "Würde, Lernfähigkeit, Rechte", "Menschen moralisch sortieren", "Keine Personenbewertung, kein Social Credit"],
      ["Handlung", "konkreter Auslöser mit möglichem Wirkpfad", "Handlung sofort mit Charakter gleichsetzen", "Handlung und Wirkfolge beschreiben"],
      ["Struktur", "Regel, Plattform, Institution, Marktlogik", "nur individuelle Schuld suchen", "Fehlanreiz und Rückkopplung analysieren"],
      ["Öffentlichkeit", "Resonanzraum für Vertrauen, Konflikt und Entscheidung", "Aufmerksamkeit mit Wirkung verwechseln", "Orientierung, Quellenklarheit und Beteiligung stärken"],
    ],
    cases: [
      "In der Verkehrspolitik eskaliert die Aussage \"Autofahrer sind das Problem\". Wirkungssprache verschiebt die Analyse: Der aktuelle Verkehrsraum erzeugt Emissionen, Unfallrisiken, Flächenkonkurrenz und Ungleichheit der Bewegungsfreiheit. Die Lösung liegt in sicheren Alternativen, Preis- und Raumlogik, Beteiligung und Übergängen.",
      "In Debatten über Desinformation reicht es nicht, falsche Inhalte zu korrigieren. Entscheidend ist, welche Resonanzräume, Plattformanreize, Vertrauensverluste und Feindbilder entstehen. Demokratiestärkende Kommunikation muss Korrektur, Quellenklarheit, Würde und Konfliktfähigkeit verbinden.",
    ],
    formula: "D_{kom} = Klarheit_{Sache} + Wuerde_{Person} + Quelle + Handlungspfad - Eskalationsrisiko",
    formulaNote:
      "Die Formel ist eine didaktische Merkhilfe: Demokratische Kommunikation wird stärker, wenn sachliche Klarheit, Personenwürde, Quellen und Handlungspfade sichtbar sind und unnötige Eskalation sinkt.",
    backflow: [
      "Die rote Linie 'keine Personenbewertung' in allen öffentlichen WÖk-Erklärseiten prominent halten.",
      "Medienwirkungscheck und Sprach-/Framing-Analyse mit deeskalierenden Formulierungsbeispielen ergänzen.",
      "Einwände gegen Technokratie und Social Credit in Video- und Studienskript-Lane konsistent verknüpfen.",
    ],
  },
];

function decode(text) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&auml;/g, "ä")
    .replace(/&ouml;/g, "ö")
    .replace(/&uuml;/g, "ü")
    .replace(/&Auml;/g, "Ä")
    .replace(/&Ouml;/g, "Ö")
    .replace(/&Uuml;/g, "Ü")
    .replace(/&szlig;/g, "ß");
}

function cleanText(text) {
  return decode(text)
    .replace(/\s+([.,;:!?])/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\s+/g, " ")
    .trim();
}

function textFromHtml(path, maxBlocks = 26) {
  if (!existsSync(path)) return [];
  let html = readFileSync(path, "utf8");
  html = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "");
  const main = (html.match(/<main[\s\S]*?<\/main>/i) || [html])[0];
  const raw = [...main.matchAll(/<(h[23]|p|li)[^>]*>([\s\S]*?)<\/\1>/gi)]
    .map((match) =>
      cleanText(
        match[2]
          .replace(/<a[^>]+class="source-chip"[^>]*>[\s\S]*?<\/a>/gi, "")
          .replace(/<[^>]+>/g, " ")
      ),
    )
    .filter(Boolean);

  const skip = /^(Inhaltsverzeichnis|Stand dieser Onlinefassung|Live-Reference-Hinweis|Changelog|Betroffene Begriffe|Quelle der Aktualisierung|Aktualisierung der lebenden Online-Referenz|Teil |Kapitel \d+$)/;
  const useful = raw.filter((line) => !skip.test(line) && !line.includes("Diese Seite ist Teil der lebenden Online-Referenz"));
  const start = useful.findIndex((line) => /^Kapitel \d+ - /.test(line));
  const blocks = (start >= 0 ? useful.slice(start) : useful).filter((line) => !/^Quellen\b/i.test(line));
  return blocks.slice(0, maxBlocks);
}

function blockToMarkdown(path) {
  const blocks = textFromHtml(path);
  if (!blocks.length) return "";
  const rel = path.replace(`${ROOT}/`, "");
  const [heading, ...rest] = blocks;
  const body = rest
    .map((line) => {
      if (/^\d+\.\d+/.test(line)) return `### ${line}`;
      if (/^Kapitel \d+ - /.test(line)) return `### ${line}`;
      return line;
    })
    .join("\n\n");
  return `### Quellenanker: ${heading}\n\n*Interne Quelle:* \`${rel}\`\n\n${body}`;
}

function matrixMarkdown(rows) {
  return [
    "| Analyseobjekt | Woran es wirkt | Typischer Fehler | Saubere WÖk-Lesart |",
    "|---|---|---|---|",
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

function buildDeepening(lecture) {
  const sourceBlocks = lecture.pages.map(blockToMarkdown).filter(Boolean).join("\n\n");
  return `## 7. Tiefenskript-Erweiterung Sprint 2

**Status dieser Erweiterung:** ausgebaute Arbeitsfassung für Claude-CI/CD, Word-Rohfassung und Reader-Spiegel. Sie ersetzt noch nicht die spätere Satz-, Quellen- und PDF-Finalisierung, bringt die Vorlesung aber aus der Kurzfassung in eine substanzielle Studienskriptfassung.

### 7.1 Leitthese

${lecture.thesis}

Die Vorlesung bleibt dabei an die Grundregel gebunden: Wirkung ist neutral und relational. Erst die Bewertung im Referenzrahmen Mensch, Planet, Demokratie, SDGs, Agenda 2030 und SDG+ entscheidet, ob eine Veränderung positiv, negativ oder ambivalent einzuordnen ist. Wenn eine Zielgröße gemeint ist, sprechen wir von positiver Netto-Wirkung.

### 7.2 Didaktische Einordnung im Studiengang

${lecture.code} liegt an der Schwelle zwischen begrifflicher Grundlegung und Bewertungsarchitektur. Die Studierenden sollen nicht nur Begriffe wiedergeben, sondern an Fällen erkennen, welche Aussage schon Wirkung behauptet, welche nur Wirkungspotenzial beschreibt und wo ein Wirkungsrisiko offenliegt. Der Tiefensinn dieser Vorlesung liegt deshalb nicht in zusätzlicher Komplexität, sondern in besserer Unterscheidungsfähigkeit.

Für die spätere Praxis ist entscheidend, dass jede Analyse vier Ebenen getrennt hält:

1. **Beschreibung:** Was geschieht tatsächlich oder soll geschehen?
2. **Kausalannahme:** Über welchen Mechanismus könnte daraus eine Zustandsveränderung entstehen?
3. **Bewertung:** Welche Richtung hat diese Veränderung im Referenzrahmen?
4. **Rückkopplung:** Welche Entscheidung, Regel, Ressource oder Kommunikation wird dadurch verändert?

Wo diese Ebenen vermischt werden, entstehen typische WÖk-Fehler: Aktivität wird als Wirkung ausgegeben, Reichweite ersetzt Zustandsveränderung, gute Absicht verdeckt Nebenwirkungen oder Reporting wird mit Lernen verwechselt.

### 7.3 Analysemodell

${matrixMarkdown(lecture.matrix)}

### 7.4 Modellformel

Die folgende Formel ist ein didaktisches Denkmodell, kein amtlicher Bewertungsstandard:

$$
${lecture.formula}
$$

${lecture.formulaNote}

Die Formel soll gerade keine Scheingenauigkeit erzeugen. Sie zwingt dazu, die Faktoren offen zu legen, die eine Aussage tragen. In einem echten Bewertungsprozess müssten Datenquelle, Aktualität, Datenqualitätsklasse, Unsicherheitsgrad und Rückkopplungsregel ergänzt werden.

### 7.5 Fallfenster

${lecture.cases.map((text, idx) => `**Fall ${idx + 1}.** ${text}`).join("\n\n")}

### 7.6 Prüfungsnahe Fallfragen ohne geschützte Antwortlogik

Diese Fragen sind öffentlich und dienen dem Lernen. Die geschützte Antwortlogik, Scoring-Regeln und CorrectAnswer-Felder bleiben in der Prüfungs-Lane der App.

1. Beschreibe den Auslöser im Fall und trenne ihn von Absicht, Image oder Reichweite.
2. Formuliere einen plausiblen Wirkpfad mit Wirkungsempfängern, Zustandsveränderung und Rückkopplung.
3. Benenne mindestens ein Wirkungspotenzial und ein Wirkungsrisiko.
4. Zeige, welche Quelle oder Datenart nötig wäre, um von Potenzial zu belastbarer Wirkungsaussage zu kommen.
5. Prüfe, ob Nichtkompensation oder Reverse Merit Order einschlägig sein könnten.
6. Formuliere eine saubere Wirkungsaussage in einem Satz: Was wissen wir, was nehmen wir an, was bleibt offen?

### 7.7 Auswertung aus der lebenden Website-Referenz

${sourceBlocks}

### 7.8 Konsequenzen für die WÖk-Architektur

Aus dieser Vorlesung fließen drei Punkte zurück in den WÖk-Korpus:

${lecture.backflow.map((item) => `- ${item}`).join("\n")}

### 7.9 Kurzfazit

${lecture.title} ist kein Randthema. Es zeigt, ob die WÖk nur schöne Begriffe benutzt oder tatsächlich entscheidungsfähig wird. Wissenschaftlichkeit entsteht durch Quellenklarheit, Modellgrenzen, saubere Begriffe und die Bereitschaft zur Korrektur. Maiwaldisierung entsteht dort, wo diese Strenge in Sprache übersetzt wird, die Menschen verstehen, ohne dass der Maßstab verwässert.
`;
}

function replaceOrInsert(markdown, lecture) {
  let next = markdown
    .replace(/\*\*Status:\*\* Rohfassung V0 · Sprint-Produktionslauf · muss im nächsten Tiefensprint auf 40-50 Seiten erweitert werden/, `**Status:** Tiefenskript-Sprint 2 · substanzielle Arbeitsfassung, Claude-CI/CD-Finalisierung offen`)
    .replace(/\*\*Lesezeit:\*\* ca\. 45–60 Minuten/, "**Lesezeit:** ca. 120–180 Minuten");

  const deepening = buildDeepening(lecture).trim();
  const marker = "## 7. Tiefenskript-Erweiterung Sprint 2";
  if (next.includes(marker)) {
    next = next.replace(new RegExp(`${marker}[\\s\\S]*?(?=\\n## 8\\. Prüfungsrelevanz|\\n## 7\\. Prüfungsrelevanz)`), deepening + "\n\n");
  } else {
    next = next.replace(/\n## 7\. Prüfungsrelevanz/, `\n${deepening}\n\n## 8. Prüfungsrelevanz`);
  }
  next = next
    .replace(/\n## 8\. Quellen/g, "\n## 9. Quellen")
    .replace(/\n## 9\. Rückfluss/g, "\n## 10. Rückfluss");
  return next;
}

function updateIndex(slugs) {
  const indexPath = join(MASTER_DIR, "index.json");
  const index = JSON.parse(readFileSync(indexPath, "utf8"));
  for (const item of index.scripts) {
    if (slugs.includes(item.slug)) {
      item.status = "tiefensprint-arbeitsfassung";
      item.notes = "Tiefenskript-Sprint 2: substanzielle Arbeitsfassung mit Website-Referenzmaterial; Claude-CI/CD-Finalisierung offen.";
    }
  }
  writeFileSync(indexPath, JSON.stringify(index, null, 2) + "\n");
}

function main() {
  const touched = [];
  for (const lecture of lectures) {
    const master = join(MASTER_DIR, `${lecture.slug}.md`);
    const appMirror = join(APP, "content", "lehrgaenge", `${lecture.slug}.md`);
    const word = join(WORD_DIR, `${lecture.slug}.docx`);
    const markdown = readFileSync(master, "utf8");
    const next = replaceOrInsert(markdown, lecture);
    writeFileSync(master, next, "utf8");
    mkdirSync(dirname(appMirror), { recursive: true });
    copyFileSync(master, appMirror);
    mkdirSync(dirname(word), { recursive: true });
    execFileSync(PYTHON, [EXPORTER, master, "--out", word], { stdio: "inherit" });
    touched.push(lecture.slug);
  }
  updateIndex(touched);
  console.log(JSON.stringify({ deepened: touched }, null, 2));
}

main();
