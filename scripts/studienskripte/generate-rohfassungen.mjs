#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const APP = join(ROOT, "woek-akademie-app");
const MASTER_DIR = join(ROOT, "content", "studienskripte");
const WORD_DIR = join(ROOT, "docs", "studienskripte", "word-rohfassungen");
const EXPORTER = join(ROOT, "scripts", "studienskripte", "export-word-rohfassung.py");
const PYTHON = "/Users/hagen/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3";

const lectures = [
  ["woek-g-v01", "Grundstudium Wirkungsökonomie", "woek-g", "V01", "Die Maßstabskrise", "G1.1"],
  ["woek-g-v02", "Grundstudium Wirkungsökonomie", "woek-g", "V02", "Wirkung statt Kapital", "G1.1"],
  ["woek-g-v03", "Grundstudium Wirkungsökonomie", "woek-g", "V03", "Die Wirkungsökonomie als neue Steuerungslogik", "G1.1"],
  ["woek-g-v04", "Grundstudium Wirkungsökonomie", "woek-g", "V04", "Gewinn, Wachstum und Reichweite als unvollständige Erfolgsgrößen", "G1.2"],
  ["woek-g-v05", "Grundstudium Wirkungsökonomie", "woek-g", "V05", "Wirkleistung, Scheinleistung, Blindleistung und Verlustleistung", "G1.2"],
  ["woek-g-v06", "Grundstudium Wirkungsökonomie", "woek-g", "V06", "Zukunftsfähigkeit, Risiko und Resilienz", "G1.2"],
  ["woek-g-v07", "Grundstudium Wirkungsökonomie", "woek-g", "V07", "Mensch als Wirkungsdimension", "G1.3"],
  ["woek-g-v08", "Grundstudium Wirkungsökonomie", "woek-g", "V08", "Planet als Wirkungsdimension", "G1.3"],
  ["woek-g-v09", "Grundstudium Wirkungsökonomie", "woek-g", "V09", "Demokratie als Wirkungsdimension", "G1.3"],
  ["woek-g-v10", "Grundstudium Wirkungsökonomie", "woek-g", "V10", "Wirkung ist nicht Absicht", "G1.4"],
  ["woek-g-v11", "Grundstudium Wirkungsökonomie", "woek-g", "V11", "Positive, negative und neutrale Wirkung", "G1.4"],
  ["woek-g-v12", "Grundstudium Wirkungsökonomie", "woek-g", "V12", "Wirkungsempfänger und Wirkungsräume", "G1.4"],
  ["woek-g-v13", "Grundstudium Wirkungsökonomie", "woek-g", "V13", "Handlung, Unterlassen und Zustandsveränderung", "G2.1"],
  ["woek-g-v14", "Grundstudium Wirkungsökonomie", "woek-g", "V14", "Wirkung erster, zweiter und dritter Ordnung", "G2.1"],
  ["woek-g-v15", "Grundstudium Wirkungsökonomie", "woek-g", "V15", "Nebenwirkungen, Rebound und Zielkonflikte", "G2.1"],
  ["woek-g-v16", "Grundstudium Wirkungsökonomie", "woek-g", "V16", "Märkte, Produkte und Lieferketten als Wirkungsräume", "G2.2"],
  ["woek-g-v17", "Grundstudium Wirkungsökonomie", "woek-g", "V17", "Medien, Sprache und Öffentlichkeit als Wirkungsräume", "G2.2"],
  ["woek-g-v18", "Grundstudium Wirkungsökonomie", "woek-g", "V18", "Zeit, Generationen und unsichtbare Betroffene", "G2.2"],
  ["woek-g-v19", "Grundstudium Wirkungsökonomie", "woek-g", "V19", "Wirkstoff, Wirkmechanismus und Wirkungspotenzial", "G2.3"],
  ["woek-g-v20", "Grundstudium Wirkungsökonomie", "woek-g", "V20", "Gesellschaftliche Resonanzfaktoren", "G2.3"],
  ["woek-g-v21", "Grundstudium Wirkungsökonomie", "woek-g", "V21", "Produkte, Technologien und Institutionen als Auslöser", "G2.3"],
  ["woek-g-v22", "Grundstudium Wirkungsökonomie", "woek-g", "V22", "Wirkungssprache und Quellenklarheit", "G2.4"],
  ["woek-g-v23", "Grundstudium Wirkungsökonomie", "woek-g", "V23", "Unsicherheit, Ambivalenz und transparente Bewertung", "G2.4"],
  ["woek-g-v24", "Grundstudium Wirkungsökonomie", "woek-g", "V24", "Deeskalierende und demokratiestärkende Kommunikation", "G2.4"],
  ["woek-g-v25", "Grundstudium Wirkungsökonomie", "woek-g", "V25", "SDGs und Agenda 2030 als globaler Konsens der 193 Staaten", "G3.1"],
  ["woek-g-v26", "Grundstudium Wirkungsökonomie", "woek-g", "V26", "SDG+: Warum die SDGs für offene Gesellschaften nicht reichen", "G3.1"],
  ["woek-g-v27", "Grundstudium Wirkungsökonomie", "woek-g", "V27", "Kernfelder, Wirkungsgrenzen und rote Linien", "G3.1"],
  ["woek-g-v28", "Grundstudium Wirkungsökonomie", "woek-g", "V28", "CSRD, ESRS, GRI, EU-Taxonomie, NACE und DPP", "G3.2"],
  ["woek-g-v29", "Grundstudium Wirkungsökonomie", "woek-g", "V29", "WÖk-IDs, Benchmarks und Archetypen", "G3.2"],
  ["woek-g-v30", "Grundstudium Wirkungsökonomie", "woek-g", "V30", "Datenqualität, Audit und Unsicherheit", "G3.2"],
  ["woek-g-v31", "Grundstudium Wirkungsökonomie", "woek-g", "V31", "Von Einzelwirkung zu Netto-Wirkung", "G3.3"],
  ["woek-g-v32", "Grundstudium Wirkungsökonomie", "woek-g", "V32", "Scorecards und Bewertungsprofile", "G3.3"],
  ["woek-g-v33", "Grundstudium Wirkungsökonomie", "woek-g", "V33", "NWI und T-SROI unterscheiden", "G3.3"],
  ["woek-g-v34", "Grundstudium Wirkungsökonomie", "woek-g", "V34", "Reverse Merit Order", "G3.4"],
  ["woek-g-v35", "Grundstudium Wirkungsökonomie", "woek-g", "V35", "Nichtkompensation gegen Greenwashing", "G3.4"],
  ["woek-g-v36", "Grundstudium Wirkungsökonomie", "woek-g", "V36", "Scorecard lesen und begründen", "G3.4"],
  ...Array.from({ length: 10 }, (_, idx) => [`wirkungsmanagement-v${idx + 1}`, "Wirkungsmanagement", "wirkungsmanagement", `WM-V${idx + 1}`, "", "WM"]),
  ...Array.from({ length: 10 }, (_, idx) => [`wirkungscontrolling-wc-v${idx + 1}`, "Impact-Controlling", "wirkungscontrolling", `WC-V${idx + 1}`, "", "WC"])
];

function readIfExists(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function findDocSource(slug, code, trackCode) {
  const docsDir = join(APP, "docs", "lehrgaenge");
  const files = existsSync(docsDir) ? readdirSync(docsDir) : [];
  const lowerCode = code.toLowerCase();
  if (trackCode === "woek-g") {
    const direct = files.find((file) => file.toLowerCase().startsWith(`${slug}-`) && file.endsWith(".md"));
    if (direct) return join(docsDir, direct);
  }
  if (trackCode === "wirkungsmanagement") {
    const index = code.replace("WM-V", "");
    const direct = files.find((file) => file.startsWith(`wirkungsmanagement-v${index}-`) && file.endsWith(".md"));
    if (direct) return join(docsDir, direct);
  }
  if (trackCode === "wirkungscontrolling") {
    const index = code.replace("WC-V", "");
    const direct = files.find((file) => file.startsWith(`wirkungscontrolling-v${index}-`) && file.endsWith(".md"));
    if (direct) return join(docsDir, direct);
  }
  return null;
}

function existingAppPath(slug) {
  return join(APP, "content", "lehrgaenge", `${slug}.md`);
}

function contentFallbackPath(slug, code, trackCode) {
  if (trackCode === "woek-g") return existingAppPath(slug);
  if (trackCode === "wirkungsmanagement") {
    const index = code.replace("WM-V", "");
    const preferred = join(APP, "content", "lehrgaenge", `wirkungsmanagement-v${index}.md`);
    return existsSync(preferred) ? preferred : existingAppPath(slug);
  }
  if (trackCode === "wirkungscontrolling") {
    const index = code.replace("WC-V", "");
    const preferred = join(APP, "content", "lehrgaenge", `wirkungscontrolling-wc-v${index}.md`);
    return existsSync(preferred) ? preferred : join(APP, "content", "lehrgaenge", `wirkungscontrolling-v${index}.md`);
  }
  return existingAppPath(slug);
}

function sourceTitle(markdown, fallback) {
  const match = markdown.match(/^#\s+(.+)$/m);
  if (!match) return fallback;
  return match[1].replace(/^.*Vorlesung\s+\d+:\s*/i, "").replace(/^.*Vorlesung\s+[A-Z-]*\d+:\s*/i, "").trim() || fallback;
}

function stripImplementationTail(markdown) {
  return markdown
    .replace(/\n---\n\n### Datenmodell-Zuordnung[\s\S]*$/m, "")
    .replace(/\n## 10\. Abschlussstatus im Lernraum[\s\S]*$/m, "")
    .trim();
}

function extractMiniQuiz(markdown, title) {
  const match = markdown.match(/##\s+\d*\.?\s*Verständnisfragen[\s\S]*?(?=\n##\s+\d|$)/i);
  if (match) return match[0].replace(/^##[^\n]+\n/, "").trim();
  return `1. **Was ist die zentrale Wirkungsfrage dieser Vorlesung?**
   - A) Wie hoch ist die Reichweite?  B) Welche tatsächliche Zustandsveränderung entsteht und bei wem?  C) Wer wirkt sympathisch?  D) Welche Absicht wurde formuliert?
   - ✅ **Richtig: B** — Wirkung meint tatsächliche Veränderung von Zuständen, nicht Absicht, Aktivität oder Reichweite.

2. **Warum reicht ein guter Auslöser noch nicht aus?**
   - A) Weil Wirkung immer zufällig ist  B) Weil erst Wirkpfad, Empfänger, Resonanz und Rückkopplung klären, ob Wirkung entsteht  C) Weil Daten unwichtig sind  D) Weil Bewertung verboten ist
   - ✅ **Richtig: B** — Ein Auslöser erzeugt höchstens Wirkungspotenzial, solange keine tatsächliche Veränderung nachvollziehbar ist.

3. **Welche rote Linie gilt auch bei „${title}"?**
   - A) Menschen dürfen moralisch sortiert werden  B) Reichweite gilt als Wirkung  C) Keine Personenbewertung, kein Social Credit, keine Vermischung von Wirkung und Meinung  D) Reporting ersetzt Rückkopplung
   - ✅ **Richtig: C** — Die WÖk bewertet Wirkpfade und Zustandsveränderungen, nicht den Wert von Menschen.

4. **Wann ist eine Aussage prüfbar?**
   - A) Wenn Quelle, Begriff, Wirkpfad und Unsicherheit benannt sind  B) Wenn sie oft geteilt wurde  C) Wenn sie gut klingt  D) Wenn sie keine Gegenfragen zulässt
   - ✅ **Richtig: A** — Quellenklarheit und begriffliche Präzision sind Voraussetzungen für prüfbare Wirkungsaussagen.

5. **Was unterscheidet Reporting von Rückkopplung?**
   - A) Nichts  B) Reporting beschreibt, Rückkopplung verändert Steuerung nach beobachteter Wirkung  C) Reporting ist immer falsch  D) Rückkopplung ist nur Marketing
   - ✅ **Richtig: B** — Rückkopplung bedeutet Lernen und Nachsteuern anhand tatsächlicher Zustandsveränderungen.

6. **Welche Zielgröße bleibt leitend?**
   - A) Positive Netto-Wirkung  B) Maximale Aktivität  C) Maximale Reichweite  D) Geringste Kritik
   - ✅ **Richtig: A** — Wenn eine Zielgröße gemeint ist, geht es um positive Netto-Wirkung im Referenzrahmen Mensch, Planet und Demokratie.`;
}

function extractGlossary(markdown) {
  const match = markdown.match(/##\s+\d*\.?\s*Glossar[\s\S]*?(?=\n##\s+\d|$)/i);
  if (match) return match[0].replace(/^##[^\n]+\n/, "").trim();
  return `| Begriff | Kurzdefinition |
|---|---|
| Wirkung | Tatsächliche Veränderung von Zuständen bei Wirkungsempfängern. |
| Wirkungspotenzial | Plausible Möglichkeit künftiger Wirkung; noch keine beobachtete Wirkung. |
| Wirkungsrisiko | Möglichkeit negativer Zustandsveränderung oder schädlicher Nebenwirkung. |
| positive Netto-Wirkung | Bewertete Zielgröße nach positiven und negativen Wirkungen im Referenzrahmen Mensch, Planet und Demokratie. |
| Rückkopplung | Lern- und Steuerungsprozess, der Wirkungsergebnisse in Entscheidungen zurückführt. |`;
}

function sourceBlock(markdown) {
  const cleaned = stripImplementationTail(markdown);
  return cleaned.replace(/^#\s+.+\n/, "").trim();
}

function leadFor(track, code, title) {
  if (track === "Wirkungsmanagement") {
    return `Diese Vorlesung übersetzt die Grundlagen der Wirkungsökonomie in organisationale Steuerung. Der Schwerpunkt liegt darauf, ${title} nicht als Berichtsübung, sondern als praktische Führungs- und Lernaufgabe zu behandeln.`;
  }
  if (track === "Impact-Controlling") {
    return `Diese Vorlesung übersetzt Wirkung in Daten-, Bewertungs- und Steuerungslogik. Der Schwerpunkt liegt darauf, ${title} so zu strukturieren, dass Entscheidungen prüfbar, auditierbar und rückkopplungsfähig werden.`;
  }
  return `Diese Vorlesung gehört zum Grundstudium der Wirkungsökonomie. Sie baut die begriffliche und methodische Fähigkeit auf, ${title} wirkungsökonomisch zu lesen: nicht nach Absicht, Lautstärke oder Image, sondern nach tatsächlichen Zustandsveränderungen.`;
}

function buildMarkdown(meta, sourceMarkdown, sourcePath, fallbackPath) {
  const [slug, track, trackCode, code, listedTitle, module] = meta;
  const title = sourceTitle(sourceMarkdown, listedTitle || basename(slug));
  const source = sourceBlock(sourceMarkdown);
  const quiz = extractMiniQuiz(sourceMarkdown, title);
  const glossary = extractGlossary(sourceMarkdown);
  const lectureNo = code.match(/\d+/)?.[0] ?? code;

  return `# ${track} · Vorlesung ${lectureNo}: ${title}

**Track:** ${track}  
**Kurscode:** ${trackCode}  
**Vorlesungscode:** ${code}  
**Modul/Abschnitt:** ${module}  
**Titel:** ${title}  
**Status:** Rohfassung V0 · Sprint-Produktionslauf · muss im nächsten Tiefensprint auf 40-50 Seiten erweitert werden  
**Primäre WÖk-Quellen:** [Die neue Ordnung des Wohlstands](https://wirkungsoekonomie.de/buch.html) · [WÖk-Referenz](https://wirkungsoekonomie.de/referenz/) · [Glossar der Wirkungsökonomie](https://wirkungsoekonomie.de/glossar.html) · [WÖk-Werkzeuge](https://wirkungsoekonomie.de/werkzeuge/)  
**Ausgabe:** Markdown-Master, Word-Rohfassung und Akademie-Reader-Spiegel  
**Wissensbasis:** aktuelles Grundlagenwerk, öffentliche WÖk-Referenz, Wirkungsfelder, Werkzeuge, Glossar, Bibliothek, Journal und externe Fachquellen

## Lernziele

Nach dieser Vorlesung kannst du:

1. die Kernfrage von **${title}** in der Sprache der Wirkungsökonomie erklären.
2. Wirkung, Wirkungspotenzial und Wirkungsrisiko im Themenfeld sauber unterscheiden.
3. typische Verwechslungen erkennen, insbesondere Reichweite, Aktivität, Absicht oder Reporting als Wirkung auszugeben.
4. den Bezug zu Mensch, Planet und Demokratie sowie zur positiven Netto-Wirkung herstellen.
5. eine einfache Tabelle, Formel oder Scorecard-Logik für das Thema lesen und begründen.
6. offene Daten-, Quellen- und Unsicherheitsfragen benennen, ohne Scheingenauigkeit zu erzeugen.

## 1. Einleitung / Wirkungsfrage

${leadFor(track, code, title)}

Die Leitfrage lautet:

> Welche tatsächlichen Zustandsveränderungen werden durch **${title}** möglich, wahrscheinlich oder riskant - und welche Bedingungen entscheiden darüber, ob aus Wirkungspotenzial tatsächliche Wirkung wird?

Diese Rohfassung bündelt den vorhandenen Akademie-Quelltext und ergänzt ihn um die gemeinsame Struktur für Studienskripte. Sie ist bereits nutzbar als Arbeitsfassung für Claude, aber noch nicht die finale 40-50-Seiten-Tiefenfassung.

## 2. Kernaussage

**${title}** ist für die Wirkungsökonomie relevant, weil es zeigt, dass Wirkung nicht aus einem einzelnen Wunsch, Signal oder Instrument entsteht. Wirkung entsteht in Wirkpfaden: Auslöser, Wirkmechanismus, Wirkungsempfänger, Resonanzraum, Datenlage, Bewertung und Rückkopplung müssen zusammen betrachtet werden.

Die praktische Pointe ist schlicht: Wer nur misst, was leicht sichtbar ist, verwechselt oft Oberfläche mit Wirkung. Wer dagegen Wirkpfade, Empfänger, Risiken und Rückkopplung sauber beschreibt, kann Entscheidungen verbessern.

## 3. Quelltext und fachliche Grundlegung

${source || "Für diese Vorlesung liegt noch kein ausformulierter Quelltext vor. Der Tiefensprint muss die Inhalte aus Grundlagenwerk, Website-Korpus, Journal, Glossar und internen Dossiers neu ausarbeiten."}

## 4. Wirkungsökonomische Vertiefung

### 4.1 Begriffliche Präzision

In dieser Vorlesung gilt die Grundregel der WÖk-Terminologie: **Wirkung ist neutral und relational.** Sie beschreibt zunächst nur eine tatsächliche Veränderung von Zuständen. Ob diese Veränderung positiv, negativ oder ambivalent ist, wird erst am Referenzrahmen bewertet. Wenn eine Zielgröße gemeint ist, sprechen wir von **positiver Netto-Wirkung**.

Deshalb darf **${title}** nicht verkürzt werden auf Absicht, Aktivität, Reichweite, Symbolik oder moralische Selbstauskunft. Entscheidend bleibt: Wer oder was ist betroffen, welcher Zustand verändert sich, welcher Wirkpfad ist plausibel, welche Nebenwirkungen entstehen und welche Unsicherheit bleibt?

### 4.2 Wirkpfad

Ein erster Wirkpfad für diese Vorlesung lässt sich als Arbeitsmodell beschreiben:

1. **Auslöser:** ein Produkt, eine Regel, eine Entscheidung, eine Kommunikation, eine Investition oder eine institutionelle Praxis.
2. **Mechanismus:** der Zusammenhang, über den der Auslöser Verhalten, Ressourcen, Anreize, Rechte, Belastungen oder Schutz verändert.
3. **Wirkungsempfänger:** Menschen, Ökosysteme, demokratische Öffentlichkeit, Organisationen oder künftige Generationen.
4. **Zustandsveränderung:** beobachtbare oder plausibel belegbare Veränderung, nicht nur Output.
5. **Bewertung:** Einordnung nach SDGs, Agenda 2030, SDG+ und WÖk-Schutzlinien.
6. **Rückkopplung:** Anpassung von Entscheidung, Prozess, Anreiz oder Kommunikation.

### 4.3 Formel-/Modellbaustein

Die folgende Formel ist ein didaktisches Arbeitsmodell, kein amtlicher Bewertungsstandard:

$$
NW_{pos} = \\sum_{i=1}^{n} w_i \\cdot \\Delta Z_i^{+} - \\sum_{j=1}^{m} r_j \\cdot \\Delta Z_j^{-}
$$

Dabei steht $NW_{pos}$ für positive Netto-Wirkung als Zielgröße, $\\Delta Z$ für Zustandsveränderungen, $w_i$ für begründete Gewichtungen positiver Wirkungen und $r_j$ für Risiken oder negative Zustandsveränderungen. Im Tiefensprint muss geprüft werden, ob für diese konkrete Vorlesung eine präzisere Formel, Matrix oder Scorecard geeigneter ist.

### 4.4 Tabellenbaustein

| Prüffrage | Bedeutung für diese Vorlesung | Typischer Fehler | Saubere WÖk-Formulierung |
|---|---|---|---|
| Was ist der Auslöser? | Klärt, wodurch ein Wirkpfad beginnt. | Absicht mit Auslöser verwechseln. | "Der Auslöser ist ..., nicht die behauptete gute Absicht." |
| Wer ist betroffen? | Bestimmt Wirkungsempfänger und Wirkungsraum. | Nur Kund:innen oder Entscheider:innen betrachten. | "Betroffen sind direkte, indirekte und stimmlose Empfänger." |
| Was verändert sich? | Trennt Wirkung von Aktivität und Reichweite. | Output als Wirkung ausgeben. | "Wirkung liegt erst bei Zustandsveränderung vor." |
| Welche Risiken entstehen? | Macht Nebenwirkungen und Zielkonflikte sichtbar. | Positive Wirkung behaupten und Schäden ausblenden. | "Wirkungsrisiken werden getrennt ausgewiesen." |
| Wie wird rückgekoppelt? | Verbindet Bewertung mit Steuerung. | Reporting als Abschluss betrachten. | "Ergebnisse verändern Entscheidung und Prozess." |

### 4.5 Chart-Spec

\`\`\`chart-spec
slug: ${slug}-wirkpfad
type: wirkpfad
reuse_first: true
preferred_asset: content/studienskripte/assets/${slug}/${slug}-wirkpfad.svg
message: ${title} wird als Wirkpfad von Auslöser über Mechanismus, Wirkungsempfänger und Zustandsveränderung bis zur Rückkopplung dargestellt.
source: WÖk-Grundlagenwerk, Website-Korpus, Akademie-Quelltexte, Glossar
\`\`\`

> **Bildvorgabe:** Wirkpfadgrafik mit sechs Stationen: Auslöser, Mechanismus, Wirkungsempfänger, Zustandsveränderung, Bewertung, Rückkopplung. Bestehende WÖk-Wirkpfad- oder Scorecard-Visuals sollen wiederverwendet werden, bevor ein neues Chart entsteht.

## 5. Verständnisfragen (Mini-Quiz)

${quiz}

## 6. Glossar der Kernbegriffe

${glossary}

## 7. Prüfungsrelevanz

Diese Vorlesung ist prüfungsrelevant, aber die eigentliche Antwortlogik gehört **nicht** in das öffentliche Studienskript. Zertifikatsfragen, CorrectAnswer, Scoring-Regeln und Fallrubrics werden separat in einem geschützten, nicht öffentlichen Prüfungsbereich der Akademie-App gepflegt.

Für den Fragenpool sind besonders geeignet:

- Begriffstrennung: Wirkung, Wirkungspotenzial, Wirkungsrisiko.
- Anwendungsszenarien: Auslöser, Wirkpfad, Wirkungsempfänger und Rückkopplung an einem Fall.
- Missverständnisse: Reichweite, Aktivität, Reporting oder Absicht als Wirkung auszugeben.
- Transfer: positive Netto-Wirkung unter Nichtkompensation und, wo passend, Reverse Merit Order begründen.

## 8. Quellen

### WÖk-Quellen

- [Die neue Ordnung des Wohlstands](https://wirkungsoekonomie.de/buch.html) — aktuelles Grundlagenwerk der Wirkungsökonomie.
- [WÖk-Referenz](https://wirkungsoekonomie.de/referenz/) — öffentliche Kapitel- und Volltextreferenz.
- [Glossar der Wirkungsökonomie](https://wirkungsoekonomie.de/glossar.html) — öffentliche Begriffsdefinitionen und Abgrenzungen.
- [WÖk-Werkzeuge](https://wirkungsoekonomie.de/werkzeuge/) — öffentliche Methoden-, Scorecard- und Controlling-Werkzeuge.
- [WÖk-Journal](https://wirkungsoekonomie.de/blog.html) — Dossiers und Fallanalysen.

### Externe Quellen fuer den Tiefensprint

- United Nations (2015): [*Transforming our world: the 2030 Agenda for Sustainable Development*](https://sdgs.un.org/2030agenda).
- European Commission: [Corporate sustainability reporting](https://finance.ec.europa.eu/financial-markets/company-reporting-and-auditing/company-reporting/corporate-sustainability-reporting_en), [EU taxonomy for sustainable activities](https://finance.ec.europa.eu/sustainable-finance/tools-and-standards/eu-taxonomy-sustainable-activities_en) und [Digital Product Passport](https://single-market-economy.ec.europa.eu/news/commission-launches-consultation-digital-product-passport-2025-04-09_en), soweit fuer das Thema einschlägig.
- EFRAG: [Sustainability reporting und ESRS](https://www.efrag.org/en/sustainability-reporting), soweit fuer das Thema einschlägig.
- Global Reporting Initiative: [GRI Standards](https://www.globalreporting.org/standards/), soweit fuer Berichts- und Indikatorenfragen einschlägig.
- Fachliteratur zu Wirkungslogik, Evaluation, Systemtheorie, Resilienz, Governance, Diffusion, Vertrauen oder Controlling je nach Thema.

## 9. Rückfluss in den WÖk-Korpus

- **Glossar/Begriffe:** Im Tiefensprint prüfen, welche Begriffe aus **${title}** eigene Glossarseiten oder präzisere Verweise brauchen.
- **Website/Erklärseiten:** Prüfen, ob eine kurze öffentliche Erklärseite oder ein Baustein für die Bibliothek fehlt.
- **Journal/Dossiers:** Geeignete Praxisfälle aus Website und Journal als Fallpool markieren.
- **Visuals/Charts:** Wirkpfad- oder Scorecard-Chart aus vorhandenen Visuals wiederverwenden oder als neues Asset spezifizieren.
- **Methodik/Standards:** Datenqualität, Unsicherheit, Nichtkompensation und Reverse Merit Order nur dort einsetzen, wo sie fachlich tragen.
- **Offene Forschungs- oder Quellenfrage:** Externe Quellen im Tiefensprint gezielt ergänzen und zitierfähig machen.
`;
}

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function writeIfDifferent(path, content) {
  if (existsSync(path) && readFileSync(path, "utf8") === content) return false;
  ensureDir(dirname(path));
  writeFileSync(path, content, "utf8");
  return true;
}

function generate() {
  ensureDir(MASTER_DIR);
  ensureDir(WORD_DIR);
  const records = [];
  let mastersWritten = 0;
  let appMirrorsWritten = 0;
  let wordsWritten = 0;

  for (const meta of lectures) {
    const [slug, track, trackCode, code, listedTitle] = meta;
    const docSource = findDocSource(slug, code, trackCode);
    const fallbackPath = contentFallbackPath(slug, code, trackCode);
    const sourcePath = docSource || (existsSync(fallbackPath) ? fallbackPath : null);
    const sourceMarkdown = sourcePath ? readIfExists(sourcePath) : "";
    const markdown = slug === "woek-g-v20" && existsSync(join(MASTER_DIR, `${slug}.md`))
      ? readIfExists(join(MASTER_DIR, `${slug}.md`))
      : buildMarkdown(meta, sourceMarkdown, sourcePath, fallbackPath);
    const masterPath = join(MASTER_DIR, `${slug}.md`);
    if (slug !== "woek-g-v20" && writeIfDifferent(masterPath, markdown)) mastersWritten += 1;

    const appPath = existingAppPath(slug);
    if (!existsSync(appPath)) {
      writeIfDifferent(appPath, markdown);
      appMirrorsWritten += 1;
    }

    const wordPath = join(WORD_DIR, `${slug}.docx`);
    execFileSync(PYTHON, [EXPORTER, masterPath, "--out", wordPath], { stdio: "inherit" });
    wordsWritten += 1;

    records.push({
      slug,
      track,
      code,
      title: listedTitle || sourceTitle(sourceMarkdown, slug),
      status: slug === "woek-g-v20" ? "pilot-arbeitsfassung" : "rohfassung-v0",
      masterPath: `content/studienskripte/${slug}.md`,
      wordRawPath: `docs/studienskripte/word-rohfassungen/${slug}.docx`,
      appMirrorPath: `woek-akademie-app/content/lehrgaenge/${slug}.md`,
      publicPath: `bibliothek/studienskripte/${slug}/`,
      sourcePath: sourcePath ? sourcePath.replace(`${ROOT}/`, "") : null,
      notes: slug === "woek-g-v20"
        ? "Pilot-Arbeitsfassung vorhanden; muss auf Tiefen-Umfang erweitert werden."
        : "Rohfassung V0 aus vorhandenen Akademie-Quellen; Tiefensprint und Claude-CI-Finalisierung offen."
    });
  }

  writeIfDifferent(join(MASTER_DIR, "index.json"), `${JSON.stringify({
    schemaVersion: "2026-07-studienskripte-library",
    purpose: "Zentrales Masterverzeichnis der oeffentlich lesbaren Studienskripte. Die Akademie-App spiegelt diese Inhalte in ihre Reader-Slots.",
    publicLibraryBase: "bibliothek/studienskripte/",
    appMirrorBase: "woek-akademie-app/content/lehrgaenge/",
    wordRawBase: "docs/studienskripte/word-rohfassungen/",
    scripts: records
  }, null, 2)}\n`);

  console.log(JSON.stringify({ mastersWritten, appMirrorsWritten, wordsWritten, records: records.length }, null, 2));
}

generate();
