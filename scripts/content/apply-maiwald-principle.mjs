import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const AUDIT_DIR = path.join(ROOT, "docs", "content-audit");
const UPDATED_AT = "2026-06-04";

const ROOT_TARGETS = new Set([
  "index.html",
  "verstehen.html",
  "wirkungsoekonomie.html",
  "modell.html",
  "kompass.html",
  "vergleich.html",
  "workflow.html",
  "scanner.html",
  "scorecard-dashboard.html",
  "sdg-plus.html",
  "akademie.html",
  "erleben.html",
  "anwendungen.html",
  "mitmachen.html",
  "funktionsweise.html",
  "glossar.html",
]);

const TARGET_PREFIXES = [
  "verstehen/",
  "wirkungsfelder/",
  "werkzeuge/",
  "methodik/",
  "fuer/",
  "erleben/",
  "akademie/",
  "einwaende/",
  "fragen/",
  "so-wirkt-wirkungsoekonomie/",
  "sdg-plus/",
  "sdg-sdgplus/",
  "sdg-und-sdg-plus/",
  "wirkungsradar/",
  "portale/",
  "anwendungen/",
  "ausprobieren/",
  "glossar/",
];

const EXCLUDE_PARTS = [
  "/referenz/",
  "/buch/",
  "/blog/",
  "/journal/",
  "/bibliothek/",
  "/fachbibliothek/",
  "/downloads/",
  "/dokumente/",
  "/quellen/",
  "/reports/",
  "/docs/",
  "/werkstatt/dossiers/",
  "/detailkonzepte/",
  "/methodenpapiere/",
  "/dossier/",
  "/dossiers/",
  "/gesamtdossier/",
  "/konzeptpapier/",
  "/working-papers/",
  "/whitepaper/",
  "/gesetz",
  "/leitlinien",
  "/online-volltext",
  "/volltext",
  "/quellen-glossar/",
  "/quellen-",
  "-quellen",
  "/buchanker",
  "/publikationsuebersicht/",
  "/bestands-und-nachlieferliste/",
  "/pdf",
  "/source/",
  "/docx-extracts/",
  "/wirkungsradar/live/",
  "/wirkungsradar/detail/",
];

const CORE_TERMS = new Set([
  "wirkung",
  "positive-netto-wirkung",
  "netto-wirkung",
  "wirkungspotenzial",
  "wirkungsrisiko",
  "wirkungsbewertung",
  "wirkungsrueckkopplung",
  "wirkungsblindheit",
  "wirkungswahrheit",
  "wirkungsgrenze",
  "reverse-merit-order",
  "nichtkompensationsprinzip",
  "woek-id",
  "scorecard",
  "t-sroi",
  "netto-wirkungs-index",
  "sdgs",
  "sdg",
  "sdg-plus",
  "agenda-2030",
  "csrd",
  "esrs",
  "gri",
  "digitaler-produktpass",
  "digitale-produktpaesse",
  "impact-controlling",
  "wirkungsrat",
  "wirkungsarchitektur",
  "klimawandel",
]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    if (entry.isFile() && entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

function rel(file) {
  return path.relative(ROOT, file).replaceAll(path.sep, "/");
}

function routeFromRel(relative) {
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) return `/${relative.replace(/\/index\.html$/, "/")}`;
  return `/${relative}`;
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function textBetween(html, pattern) {
  const match = html.match(pattern);
  return match ? stripHtml(match[1]) : "";
}

function countWords(html) {
  const text = stripHtml(html);
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

function areaFor(relative) {
  if (relative === "index.html") return "Start";
  const first = relative.split("/")[0];
  const map = {
    verstehen: "Verstehen",
    wirkungsfelder: "Wirkungsfelder",
    werkzeuge: "Methoden & Werkzeuge",
    methodik: "Methoden & Werkzeuge",
    fuer: "Für wen",
    akademie: "Akademie",
    erleben: "Erleben",
    ausprobieren: "Erleben",
    anwendungen: "Erleben",
    begriffe: "Glossar/Begriffe",
    glossar: "Glossar/Begriffe",
    wirkungsradar: "Methoden & Werkzeuge",
    portale: "Portale / Schutzarchitektur",
    fragen: "Fragen & Einwände",
    einwaende: "Fragen & Einwände",
    bibliothek: "Bibliothek",
    blog: "Journal",
    journal: "Journal",
    referenz: "Referenz/Buch",
    buch: "Referenz/Buch",
    downloads: "Bibliothek",
    dokumente: "Bibliothek",
    quellen: "Bibliothek",
  };
  if (map[first]) return map[first];
  if (relative.endsWith(".html") && ROOT_TARGETS.has(relative)) return "Verstehen";
  return "Projekt / Sonstige";
}

function classify(relative) {
  const normalized = `/${relative}`;
  if (EXCLUDE_PARTS.some((part) => normalized.includes(part))) {
    return ["Ausschlussseite", "Quellen-, Dossier-, Buch-, Artikel-, Download- oder dokumentarischer Volltext."];
  }
  if (relative.startsWith("begriffe/")) {
    const slug = relative.split("/")[1] || "";
    if (CORE_TERMS.has(slug)) return ["Zielseite", "Kernbegriff: kurze Verständlichkeitsbrücke sinnvoll."];
    return ["Grenzfall", "Glossar-Detailseite mit bestehender Lernpfadstruktur; nicht pauschal aufblähen."];
  }
  if (ROOT_TARGETS.has(relative)) return ["Zielseite", "Öffentliche Einstiegs- oder Erklärseite."];
  if (TARGET_PREFIXES.some((prefix) => relative.startsWith(prefix))) return ["Zielseite", "Erklär-, Methoden-, Zielgruppen-, Wirkungsfeld- oder Portalbereich."];
  return ["Grenzfall", "Öffentliche HTML-Seite ohne klare Ziel- oder Ausschlussklasse."];
}

function pageType(relative, html) {
  const area = areaFor(relative);
  if (relative.startsWith("begriffe/") || relative === "glossar.html" || relative.startsWith("glossar/")) return "Begriff / Glossar";
  if (relative.startsWith("werkzeuge/") || relative.startsWith("methodik/") || relative.includes("scanner") || relative.includes("dashboard")) return "Methode / Werkzeug";
  if (relative.startsWith("wirkungsfelder/")) return "Wirkungsfeld";
  if (relative.startsWith("fuer/")) return "Zielgruppe";
  if (relative.startsWith("wirkungsradar/")) return "Wirkungsradar";
  if (relative.startsWith("akademie/") || relative === "akademie.html") return "Lernseite";
  if (relative.startsWith("erleben/") || relative.startsWith("anwendungen/") || relative === "erleben.html") return "Demo / Erleben";
  if (relative.startsWith("einwaende/") || relative.startsWith("fragen/") || relative.startsWith("portale/")) return "Einwand / Schutzarchitektur";
  if (area === "Verstehen") return "Grundlagen";
  const h1 = textBetween(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return h1 ? "Seite" : "HTML";
}

function templateFor(type) {
  if (type === "Methode / Werkzeug") {
    return {
      kicker: "Einfach erklärt",
      title: "Erst das Alltagsproblem, dann die Methode.",
      intro: "Eine Methode ist kein Selbstzweck. Sie soll helfen, eine Entscheidung besser zu sehen: Was verändert sich wirklich, wer ist betroffen, welche Daten tragen die Aussage und wo bleiben Grenzen?",
      cards: [
        ["Alltag", "Ein günstiges Produkt wirkt nur dann wirklich günstig, wenn Wasser, Arbeit, Gesundheit, Klima und Entsorgung nicht ausgelagert werden."],
        ["Fachbegriff", "Die Methode übersetzt diese Folgen in Indikatoren, Scorecards, NWI, T-SROI oder Rückkopplung."],
        ["Grenze", "Die Seite ist eine fachliche Orientierung. Sie ersetzt keine amtliche Bewertung und keine Rechts-, Steuer- oder Anlageberatung."],
      ],
    };
  }
  if (type === "Wirkungsfeld") {
    return {
      kicker: "Einfach erklärt",
      title: "So wird ein Wirkungsfeld lesbar.",
      intro: "Ein Wirkungsfeld ist ein Bereich des Alltags, in dem Entscheidungen Zustände verändern. Die WÖk fragt dort nicht nur nach Kosten, Zuständigkeit oder Image, sondern nach positiver Netto-Wirkung für Mensch, Planet und Demokratie.",
      cards: [
        ["Alltag", "Bei Wohnen geht es nicht nur um Quadratmeter. Es geht auch um Miete, Gesundheit, Energie, Nachbarschaft, Boden und Sicherheit."],
        ["WÖk-Logik", "Zuerst wird beschrieben, was sich verändert. Dann wird bewertet, ob diese Veränderung stärkt, schwächt oder Risiken verschiebt."],
        ["Rückkopplung", "Gute Daten sollen in Entscheidungen zurückwirken: in Preise, Förderung, Beschaffung, Kapital, Management oder Politik."],
      ],
    };
  }
  if (type === "Zielgruppe") {
    return {
      kicker: "Einfach erklärt",
      title: "Was heißt das für diese Zielgruppe?",
      intro: "Die Seite übersetzt Wirkungsökonomie in eine konkrete Rolle. Entscheidend ist nicht, ob jemand gut gemeint handelt, sondern welche Zustände durch Entscheidungen tatsächlich verändert werden.",
      cards: [
        ["Alltag", "Eine Kommune, ein Unternehmen oder ein Haushalt sieht oft zuerst Budget, Pflichten und Druck. WÖk ergänzt die Frage: Welche Wirkung entsteht dadurch?"],
        ["Fachlich", "Wirkung bleibt neutral. Erst der Referenzrahmen zeigt, ob eine Veränderung positiv, negativ oder ambivalent ist."],
        ["Nächster Schritt", "Prüfbar wird es, wenn Ziele, Datenqualität, Betroffene, Zeitraum und Rückkopplung offen genannt werden."],
      ],
    };
  }
  if (type === "Begriff / Glossar") {
    return {
      kicker: "Einfach gesagt",
      title: "Erst das Bild, dann der Begriff.",
      intro: "Ein Begriff ist nützlich, wenn er im Alltag etwas sichtbar macht. Deshalb gilt hier: erst ein konkretes Beispiel, dann die fachliche Definition und danach die Grenze des Begriffs.",
      cards: [
        ["Beispiel", "Ein Bericht kann gut aussehen und trotzdem nichts verändern. Wirkung beginnt erst dort, wo sich Zustände tatsächlich ändern."],
        ["Fachlich", "Wirkung ist neutral und relational. Positive Netto-Wirkung ist die Zielgröße der Wirkungsökonomie."],
        ["Missverständnis", "Der Begriff ist kein Gütesiegel. Er muss mit Bezugspunkt, Zeitraum, Systemebene und Referenzrahmen beschrieben werden."],
      ],
    };
  }
  if (type === "Demo / Erleben") {
    return {
      kicker: "Einfach erklärt",
      title: "Eine Demo zeigt eine Logik, kein amtliches Urteil.",
      intro: "Demos und Rechner machen Wirkungslogik greifbar. Sie sind modellhaft: Sie zeigen, wie Daten, Annahmen und Bewertung zusammenhängen, aber sie ersetzen keine Prüfung und keine Beratung.",
      cards: [
        ["Was du siehst", "Ein Ergebnis zeigt eine modellhafte Ersteinschätzung."],
        ["Was du nicht siehst", "Datenlücken, Kontext, Rechtsfragen und politische Festlegungen müssen gesondert geprüft werden."],
        ["Wofür es hilft", "Die Demo hilft, bessere Fragen zu stellen: Welche Wirkung entsteht, wie sicher sind die Daten, was müsste entschieden werden?"],
      ],
    };
  }
  if (type === "Einwand / Schutzarchitektur") {
    return {
      kicker: "Einfach erklärt",
      title: "Einwände ernst nehmen, Missverständnisse trennen.",
      intro: "Ein guter Einwand zeigt ein echtes Risiko. Die WÖk muss deshalb ruhig erklären, was gemeint ist, was nicht gemeint ist und welche Schutzregel nötig bleibt.",
      cards: [
        ["Der Kern", "Viele Einwände drehen sich um Macht, Kontrolle, Daten, Bürokratie oder Fehlbarkeit. Diese Sorgen sind prüfbar."],
        ["Die Grenze", "WÖk bewertet keine Menschen und trifft keine automatische Entscheidung. Demokratische Institutionen müssen Regeln festlegen."],
        ["Schutzregel", "Datenqualität, Widerspruch, Transparenz, Nichtkompensation und menschliche Verantwortung müssen sichtbar bleiben."],
      ],
    };
  }
  if (type === "Wirkungsradar") {
    return {
      kicker: "Einfach erklärt",
      title: "Erst prüfen, dann antworten.",
      intro: "Der Wirkungsradar hilft, Aussagen ruhig zu sortieren: Was stimmt daran, was wird daraus falsch abgeleitet und welche Wirkung hätte es, wenn man dem Satz folgt?",
      cards: [
        ["Wahrer Kern", "Fast jede starke Aussage enthält einen prüfbaren Punkt."],
        ["Denkfehler", "Aus einem Punkt wird oft eine zu große Schlussfolgerung."],
        ["Bessere Frage", "Statt den Frame zu wiederholen, führt der Radar zur überprüfbaren Wirkungsfrage zurück."],
      ],
    };
  }
  return {
    kicker: "Einfach erklärt",
    title: "Erst Alltag, dann Fachbegriff.",
    intro: "Wirkungsökonomie wird verständlich, wenn man zuerst fragt, was sich im Alltag verändert. Danach kommen die Begriffe, Daten und Bewertungsregeln.",
    cards: [
      ["Alltag", "Ein Preis zeigt, was bezahlt wird. Er zeigt nicht automatisch, welche Folgen bei Arbeit, Gesundheit, Klima oder Demokratie entstehen."],
      ["Fachbegriff", "Wirkung ist die tatsächliche Veränderung von Zuständen. Sie kann positiv, negativ oder neutral sein."],
      ["Zielgröße", "Ziel der WÖk ist positive Netto-Wirkung für Mensch, Planet und Demokratie. Schwere Schäden dürfen nicht schöngerechnet werden."],
    ],
  };
}

function renderExplainer(type) {
  const t = templateFor(type);
  return `<section class="section section-soft maiwald-explainer" data-maiwald-explainer>
        <div>
          <div class="section-header">
            <p class="hero-kicker">${t.kicker}</p>
            <h2>${t.title}</h2>
            <p>${t.intro}</p>
          </div>
          <div class="card-grid three">
            ${t.cards.map(([title, body]) => `<article class="card"><h3 class="card-title">${title}</h3><p class="card-text">${body}</p></article>`).join("\n            ")}
          </div>
        </div>
      </section>`;
}

function stripExistingExplainer(html) {
  return html.replace(/\n\s*<section class="section section-soft maiwald-explainer" data-maiwald-explainer>[\s\S]*?<\/section>\s*/g, "\n");
}

function insertExplainer(html, block) {
  if (html.includes("term-detail-hero")) {
    const start = html.indexOf("<header class=\"term-detail-hero\"");
    const end = html.indexOf("</header>", start);
    if (start >= 0 && end > start) {
      const insertAt = end + "</header>".length;
      return `${html.slice(0, insertAt)}\n        ${block}\n${html.slice(insertAt)}`;
    }
  }
  const heroStart = html.search(/<section class="hero[^"]*"/);
  if (heroStart >= 0) {
    const end = html.indexOf("</section>", heroStart);
    if (end > heroStart) {
      const insertAt = end + "</section>".length;
      return `${html.slice(0, insertAt)}\n      ${block}\n${html.slice(insertAt)}`;
    }
  }
  const mainStart = html.indexOf("<main");
  if (mainStart >= 0) {
    const close = html.indexOf(">", mainStart);
    if (close > mainStart) {
      return `${html.slice(0, close + 1)}\n      ${block}\n${html.slice(close + 1)}`;
    }
  }
  return html;
}

function shouldEdit(record) {
  if (record.classification !== "Zielseite") return false;
  if (record.relative.startsWith("begriffe/")) return CORE_TERMS.has(record.relative.split("/")[1] || "");
  return true;
}

function auditRows(files) {
  return files.map((file) => {
    const relative = rel(file);
    const html = fs.readFileSync(file, "utf8");
    const [classification, reason] = classify(relative);
    const type = pageType(relative, html);
    return {
      relative,
      route: routeFromRel(relative),
      title: textBetween(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
      h1: textBetween(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i),
      type,
      area: areaFor(relative),
      wordsBefore: countWords(html),
      h2h3Before: (html.match(/<h[23][^>]*>/gi) || []).length,
      classification,
      reason,
    };
  });
}

function writeAudit(rows, edited) {
  fs.mkdirSync(AUDIT_DIR, { recursive: true });
  const counts = rows.reduce((acc, row) => {
    acc[row.classification] = (acc[row.classification] || 0) + 1;
    return acc;
  }, {});
  const editedSet = new Set(edited.map((item) => item.relative));
  const header = `# Erklärseiten-Audit\n\nStand: ${UPDATED_AT}\n\n## Technische Struktur\n\n- Framework/Build: statische HTML-Site mit Node-/Python-Generatoren in \`scripts/\`.\n- Öffentliche Inhalte liegen überwiegend als HTML im Repository; fachliche Datenquellen liegen zusätzlich in \`content/\`, \`data/\`, \`src/data/\` und \`docs/\`.\n- Zentrale Generatoren: Glossar, Portale, Wirkungsradar, Suche, Bibliothek und Referenzseiten.\n- Bestehende Komponenten/Klassen: \`section\`, \`section-soft\`, \`section-header\`, \`card\`, \`card-grid\`, \`term-summary-card\`, \`clean-list\`.\n- Leitregel: Es wurden keine Slugs, Routen oder SEO-Metadaten verändert.\n\n## Klassifikation\n\n- Zielseiten: ${counts.Zielseite || 0}\n- Ausschlussseiten: ${counts.Ausschlussseite || 0}\n- Grenzfälle: ${counts.Grenzfall || 0}\n- Bearbeitet in diesem Lauf: ${edited.length}\n\n## Inventar\n\n| Route | Quellpfad | Titel / H1 | Typ | Bereich | Wörter vorher | H2/H3 vorher | Einstufung | Grund |\n|---|---|---|---|---|---:|---:|---|---|\n`;
  const table = rows
    .map((row) => {
      const title = (row.h1 || row.title || "(ohne Titel)").replaceAll("|", "\\|");
      return `| ${row.route} | \`${row.relative}\` | ${title} | ${row.type} | ${row.area} | ${row.wordsBefore} | ${row.h2h3Before} | ${row.classification}${editedSet.has(row.relative) ? " / bearbeitet" : ""} | ${row.reason.replaceAll("|", "\\|")} |`;
    })
    .join("\n");
  fs.writeFileSync(path.join(AUDIT_DIR, "erklaerseiten-audit.md"), `${header}${table}\n`);
}

function writeReport(rows, edited) {
  const excluded = rows.filter((row) => row.classification === "Ausschlussseite");
  const borderline = rows.filter((row) => row.classification === "Grenzfall");
  const target = rows.filter((row) => row.classification === "Zielseite");
  const editedLines = edited.map((item) => `- ${item.route} — \`${item.relative}\` (${item.type})`).join("\n");
  const report = `# Abschlussbericht Erklärseiten nach Maiwald-Prinzip\n\nStand: ${UPDATED_AT}\n\n## Ergebnis\n\n- Geprüfte HTML-Seiten: ${rows.length}\n- Zielseiten: ${target.length}\n- Bearbeitete Zielseiten in diesem Lauf: ${edited.length}\n- Ausschlussseiten: ${excluded.length}\n- Grenzfälle: ${borderline.length}\n\n## Was technisch umgesetzt wurde\n\n- Eine idempotente Erklärsektion \`data-maiwald-explainer\` wurde auf Zielseiten eingefügt.\n- Die Sektion arbeitet mit vorhandenen CSS-Klassen: \`section\`, \`section-soft\`, \`section-header\`, \`card-grid\`, \`card\`.\n- Inhalte wurden nicht gelöscht und nicht gekürzt; bestehende Abschnitte, Links, Slugs, Anker und Metadaten bleiben erhalten.\n- Dossiers, Buch-/Referenzseiten, Artikel, Bibliotheks- und Downloadtexte wurden nicht inhaltlich umgeschrieben.\n- Glossar-Detailseiten wurden nicht pauschal aufgebläht; bearbeitet wurden nur Kernbegriffe, weil viele Begriffseiten bereits Lernpfad, Beispiel und Missverständnis enthalten.\n\n## Bearbeitete Seiten\n\n${editedLines || "- Keine Seiten bearbeitet."}\n\n## Ausschlusslogik\n\nNicht bearbeitet wurden Seiten aus Bereichen wie \`referenz/\`, \`buch/\`, \`blog/\`, \`journal/\`, \`bibliothek/\`, \`downloads/\`, \`dokumente/\`, \`quellen/\`, \`dossier/\`, \`dossiers/\`, \`online-volltext\`, \`volltext\`, \`working-papers\`, \`whitepaper\`, \`gesetz\`, \`leitlinien\` und \`wirkungsradar/live/\`.\n\n## Wichtigste Verbesserungsmuster\n\n- Erst Alltag, dann Fachbegriff.\n- Erst Beispiel, dann Systemlogik.\n- Wirkung bleibt neutral und relational.\n- Positive Netto-Wirkung bleibt die Zielgröße.\n- Demos werden als modellhaft und nicht amtlich erklärt.\n- Methoden werden mit Problem, Fachbegriff und Grenze erklärt.\n- Einwände werden ruhig behandelt: Kern, Grenze, Schutzregel.\n\n## Vorher/Nachher-Beispiele\n\n1. Methodenseiten: Vorher stand häufig sofort die Instrumentenlogik. Nachher beginnt die Seite mit dem Alltagsproblem und erklärt dann Methode, Fachbegriff und Grenze.\n2. Wirkungsfelder: Vorher standen Cluster und Links im Vordergrund. Nachher wird zuerst erklärt, was ein Wirkungsfeld im Alltag sichtbar macht.\n3. Zielgruppenseiten: Vorher war die Rolle teils abstrakt. Nachher wird erklärt, was sich für Kommune, Unternehmen oder Bürger:innen praktisch ändert.\n4. Demos: Vorher war Modellhaftigkeit vorhanden, aber nicht immer direkt am Einstieg. Nachher steht klar: Demo, nicht amtliche Bewertung.\n5. Kernbegriffe: Vorher war die Fachdefinition korrekt. Nachher ergänzt eine kurze Brücke: Beispiel, fachliche Genauigkeit, Missverständnis.\n\n## Qualitätssicherung\n\n- Build-/Suchindex-Check muss nach diesem Lauf ausgeführt werden: \`npm run check:links\`.\n- Größencheck muss ausgeführt werden: \`npm run check:size\`.\n- Bekannte offene Baustelle: Die Site-Größe liegt bereits über dem Zielwert; zusätzliche Erklärsektionen erhöhen den Druck, Assets später zu optimieren.\n\n## Künftige Content-Regel\n\nAlle Erklärungstexte der Wirkungsökonomie müssen nach dem Maiwald-Prinzip geschrieben sein: erst anschaulich, dann fachlich; erst Beispiel, dann Begriff; einfache Ursache-Wirkung-Kette; wissenschaftlich korrekt; keine Verniedlichung; keine Kürzung fachlicher Substanz. Wirkung ist neutral, positive Netto-Wirkung ist die Zielgröße.\n`;
  fs.writeFileSync(path.join(AUDIT_DIR, "erklaerseiten-abschlussbericht.md"), report);
}

const files = walk(ROOT).sort();
const rows = auditRows(files);
const edited = [];

for (const row of rows) {
  const file = path.join(ROOT, row.relative);
  const html = fs.readFileSync(file, "utf8");
  const cleaned = stripExistingExplainer(html);
  if (!shouldEdit(row)) {
    if (cleaned !== html) fs.writeFileSync(file, cleaned);
    continue;
  }
  const next = insertExplainer(cleaned, renderExplainer(row.type));
  if (next !== html) {
    fs.writeFileSync(file, next);
    edited.push({
      relative: row.relative,
      route: row.route,
      type: row.type,
    });
  }
}

writeAudit(rows, edited);
writeReport(rows, edited);

console.log(`Audited ${rows.length} HTML pages.`);
console.log(`Edited ${edited.length} target pages.`);
console.log(`Wrote ${path.relative(ROOT, path.join(AUDIT_DIR, "erklaerseiten-audit.md"))}.`);
console.log(`Wrote ${path.relative(ROOT, path.join(AUDIT_DIR, "erklaerseiten-abschlussbericht.md"))}.`);
