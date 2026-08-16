import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const SOURCE_VERSION = "2026.0";
export const IMPORT_VERSION = "2026.1-import";
export const LIVE_REFERENCE_VERSION = "2026.2-live-reference";
export const TERMINOLOGY_BASE = "WOeK_Begriffsleitfaden_fuehrend_v1.0.md";
export const TERMINOLOGY_BASE_DATE = "2026-05-21";

const htmlRoots = ["referenz", "dokumente"];

function publicReferenceWording(value = "") {
  return String(value)
    .replace(/\blebenden Referenz\b/giu, "fortgeschriebenen Onlinefassung")
    .replace(/\blebende Referenz\b/giu, "fortgeschriebene Onlinefassung")
    .replace(/\blebenden Online-Referenzfassung\b/giu, "fortgeschriebenen Onlinefassung")
    .replace(/\blebende Online-Referenz\b/giu, "fortgeschriebene Onlinefassung")
    .replace(/\bLebende Online-Referenz\b/gu, "Fortgeschriebene Onlinefassung")
    .replace(/\bLive-Referenz\b/gu, "Onlinefassung")
    .replace(/\bLive-Reference\b/gu, "Onlinefassung")
    .replace(/\bReviewstatus\b/gu, "Prüfstatus")
    .replace(/\bReview-Status\b/gu, "Prüfstatus");
}

const priorityChapters = new Map([
  [6, {
    cluster: "Systemarchitektur",
    terms: ["Nachhaltigkeit", "Wirkungsarchitektur", "interdependente Netto-Wirkung", "Wirkungsrückkopplung"],
    source: "Nachhaltigkeit-Systemarchitektur / führender Begriffsleitfaden",
    text: "Nachhaltigkeit wird in der lebenden Referenz nicht als Zusatzlabel, ESG-Ersatz oder Berichtspflicht gelesen, sondern als Ergebnis gelingender Wirkungsrückkopplung. Maßgeblich bleibt positive Netto-Wirkung für Mensch, Planet und Demokratie; Nachhaltigkeit beschreibt die resiliente Systemfähigkeit, die daraus entstehen kann."
  }],
  [10, {
    cluster: "Begriffssystem",
    terms: ["Wirkung", "positive Netto-Wirkung", "Wirkungspotenzial"],
    source: "WOeK_Begriffsleitfaden_fuehrend_v1.0.md",
    text: "Wirkung ist in der Wirkungsökonomie neutral und relational: die tatsächliche Veränderung von Zuständen. Wenn eine Zielgröße gemeint ist, lautet sie positive Netto-Wirkung für Mensch, Planet und Demokratie. Eine Absicht, ein Output, ein Bericht oder ein Image ist noch keine Wirkung."
  }],
  [11, {
    cluster: "Begriffssystem",
    terms: ["Wirkungspotenzial", "Wirkstoff", "Wirkmechanismus", "Wirkungspfad"],
    source: "WOeK_Begriffsleitfaden_fuehrend_v1.0.md",
    text: "Wirkungspotenzial bezeichnet die Möglichkeit, dass Wirkung eintreten kann. Es ist noch keine eingetretene Wirkung. Der Begriff Wirkstoff wird nur als didaktische Analogie verwendet: Ein gesellschaftlicher Wirkstoff kann etwas auslösen, muss aber über Wirkmechanismus, Wirkungspfad, Kontext, Dosis, Nebenwirkung und Wechselwirkung geprüft werden."
  }],
  [12, {
    cluster: "Begriffssystem",
    terms: ["Wirkungsrückkopplung", "Wirkungslenkung", "Wirkungsrisiko"],
    source: "WOeK_Begriffsleitfaden_fuehrend_v1.0.md",
    text: "Wirkungslenkung und Wirkungsrückkopplung sind verschiedene Dinge. Wirkungslenkung legt Richtung, Ziele, Schutzgrenzen, Prioritäten und Instrumentregeln fest. Wirkungsrückkopplung führt beobachtete Zustandsveränderungen, Evidenz und Unsicherheit in spätere Entscheidungen zurück. Erst die Rückkopplung zeigt, ob die Lenkung beibehalten, verändert oder beendet werden muss."
  }],
  [13, {
    cluster: "Begriffssystem",
    terms: ["Wirkungsträger", "Wirkungsempfänger", "Wirkungsraum", "Resonanzraum"],
    source: "WOeK_Begriffsleitfaden_fuehrend_v1.0.md",
    text: "Wirkungsraum, Resonanzraum, Wirkungsträger und Wirkungsempfänger werden getrennt geführt. Ein Wirkungsraum ist der Bereich, in dem Zustände verändert werden; ein Resonanzraum ist ein sozialer oder kultureller Raum, in dem Deutungen, Zugehörigkeit und Reaktionen entstehen können."
  }],
  [16, {
    cluster: "Begriffssystem",
    terms: ["Wirkungsarchitektur", "Wirkungsgrenze", "Wirkungswahrheit", "Wirkungsnetz"],
    source: "WOeK_Begriffsleitfaden_fuehrend_v1.0.md",
    text: "Wirkungsarchitektur meint nicht eine Website oder ein Diagramm, sondern das Gesamtsystem aus Daten, Regeln, Institutionen, Anreizen, Preisen, Steuern, Governance, Kontrolle, Lernen und Rückkopplung. Wirkungswahrheit meint Wirkungsnähe und Transparenz über Folgen, kein Wahrheitsmonopol."
  }],
  [20, {
    cluster: "Systemarchitektur",
    terms: ["Interdependenz", "Engpasslogik", "Systemhebel", "Wirkungsgrenze"],
    source: "Systemmodell der Wirkungsökonomie / führender Begriffsleitfaden",
    text: "Die lebende Referenz betont die Interdependenzlogik: Mensch, Planet und Demokratie sind keine additiven Spalten, sondern gekoppelte Systembedingungen. Engpässe und Wirkungsgrenzen dürfen nicht durch Durchschnittslogik verdeckt werden."
  }],
  [22, {
    cluster: "Begriffssystem",
    terms: ["Wirkungslenkung", "Wirkungsrückkopplung"],
    source: "WOeK_Begriffsleitfaden_fuehrend_v1.0.md",
    text: "Wirkungslenkung beschreibt die bewusste Ausrichtung von Anreizen und Entscheidungen: Ziele, Schutzgrenzen, Prioritäten und Instrumente. Wirkungsrückkopplung ist der Lernmechanismus: Beobachtungen über tatsächliche Zustandsveränderungen, Datenqualität und Unsicherheit fließen in die nächste Entscheidung ein. Eine Preis-, Steuer- oder Förderregel kann ein Instrument der Lenkung sein; sie ist nicht mit der Rückkopplung selbst gleichzusetzen."
  }],
  [23, {
    cluster: "Begriffssystem",
    terms: ["Wirkungsrisiko", "Wirkungsresilienz", "Resilienz"],
    source: "WOeK_Begriffsleitfaden_fuehrend_v1.0.md",
    text: "Wirkungsresilienz wird als positive, normativ gebundene Resilienz verstanden: Ein System bleibt unter Stress handlungsfähig, lernt und stärkt tragende Lebens-, Sozial- und Demokratiefunktionen. Robustheit allein reicht nicht; auch destruktive Systeme können robust sein."
  }],
  [30, {
    cluster: "Mess- und Bewertungslogik",
    terms: ["Wirkungsbewertung", "Datenqualität", "Wirkungsindikator"],
    source: "Technische Leitlinien WUStG / WÖk-Masterregister v1.4",
    text: "Die Messlogik der lebenden Referenz unterscheidet Berichtsdaten, Steuerungsdaten und Wirkungsdaten. Daten werden erst dann wirkungsökonomisch relevant, wenn sie auf Zustandsveränderungen, Datenqualität, Systemgrenzen und Rückkopplung bezogen werden."
  }],
  [31, {
    cluster: "Mess- und Bewertungslogik",
    terms: ["WÖk-ID", "Wirkungsindikator", "WÖk Master Items"],
    source: "WOeK_Masterregister_v1.4_FINAL_2026-08-16.xlsx",
    text: "Die WÖk-ID ist ein technischer und fachlicher Anker für Indikatoren, SDG/SDG+-Zuordnung, Regelzuweisung, Systemgrenze, Datenqualität, Assurance und Scorecards. Sie kennzeichnet Gegenstände, Prozesse oder Indikatoren - keine Menschen und keine persönliche Wertigkeit. Leere Eingaben bleiben unbewertet; eine ID ersetzt weder eine Wirkungsgrenze noch eine begründete Bewertung."
  }],
  [32, {
    cluster: "Mess- und Bewertungslogik",
    terms: ["Scorecard", "Benchmark", "Archetyp", "FinalScore"],
    source: "Technische Leitlinien WUStG / WÖk-Masterregister v1.4",
    text: "Scorecards bleiben Bewertungsinstrumente, nicht die Wirkung selbst. Benchmarks, Regeln und FinalScores müssen mit Datenqualität, Wirkungsgrenzen, Assurance und Nichtkompensation verbunden werden. Nicht aktiv validierte Benchmarks werden nicht als aktive Bewertungsgrundlage ausgegeben."
  }],
  [33, {
    cluster: "Mess- und Bewertungslogik",
    terms: ["Reverse Merit Order", "Nichtkompensationsprinzip", "Wirkungsgrenze"],
    source: "Technische Leitlinien WUStG / Apfelbeispiel / Lieferkettenpapier",
    text: "Die Reverse Merit Order wird als Schutzregel gegen Schönrechnung bestätigt: Schwere negative Wirkungen dürfen nicht durch positive Teilwirkungen verdeckt werden. Netto-Wirkung ist keine einfache Addition; rote Linien und Wirkungsgrenzen begrenzen Kompensation."
  }],
  [34, {
    cluster: "Mess- und Bewertungslogik",
    terms: ["T-SROI", "NWI", "Netto-Wirkung", "Transformationswirkung"],
    source: "T-SROI-Rechenstandard v1.1 (WÖK-Q-1024)",
    text: "NWI und T-SROI beantworten unterschiedliche Fragen. Der NWI beschreibt ein nichtmonetäres Wirkungsprofil: gewichtete positive minus gewichtete negative Wirkungen, nur bei erfüllten Schutzgrenzen. Der T-SROI ist ein Geldverhältnis: Der Barwert kausal zurechenbarer direkter und transformativer Nutzen minus Schäden wird durch den Barwert der Kosten geteilt. Transformationswirkung ist dabei eine getrennt belegte Nutzenreihe, kein frei wählbarer Multiplikator. Attribution, Deadweight, Verdrängung, Diskontsatz, Systemgrenze und Unsicherheit müssen offen gelegt werden."
  }],
  [37, {
    cluster: "Steuerlogik",
    terms: ["WStG", "Wirkungssteuergesetz", "Wirkungsrat"],
    source: "WStG_Oktober2025",
    text: "Das WStG wird als Rahmengesetz der wirkungsbasierten Steuerordnung geführt. Es ersetzt nicht jedes Einzelsteuergesetz, sondern setzt den gemeinsamen Maßstab, an den WUStG, WEstG und weitere Steuerlogiken anschließen."
  }],
  [38, {
    cluster: "Steuerlogik",
    terms: ["WUStG", "Wirkungsumsatzsteuer", "Vorsteuerlogik", "Score-Skalen"],
    source: "Technische Leitlinien WUStG / WP_Produkte / Apfelbeispiel",
    text: "Das WUStG ist die Produkt- und Umsatzsteuerlogik der Wirkungsökonomie. Produkt-Scorecards können in Beispielrechnungen mit -3 bis +3 arbeiten, während rahmengesetzliche Wirkungswerte anders skaliert sein können; die Skalen sind als Anwendungsebenen zu unterscheiden."
  }],
  [39, {
    cluster: "Steuerlogik",
    terms: ["Wirkungshaushalt", "Haushaltsneutralität", "Rückkopplung"],
    source: "WStG_Oktober2025 / WP_Einkommen",
    text: "Haushaltsneutralität wird als Steuerungsprinzip und politisch zu prüfende Modellannahme geführt: Die Wirkungsökonomie verschiebt Bemessung und Verteilung, ohne automatisch zusätzliche Verschuldung zu unterstellen. Konkrete Haushaltswirkungen bleiben pilot- und modellprüfungspflichtig."
  }],
  [48, {
    cluster: "Produkt- und Lieferkettenlogik",
    terms: ["Produktwirkung", "Digitaler Produktpass", "Wirkungsträger"],
    source: "WP_Produkte / Lieferkettenpapier / DPP-Logik",
    text: "Produkte werden als Wirkungsträger verstanden. Entscheidend ist nicht ein einzelnes grünes Merkmal, sondern die Netto-Wirkung entlang Wertschöpfung, Nutzung, Risiken, Datenqualität und Rückkopplung."
  }],
  [49, {
    cluster: "Produkt- und Lieferkettenlogik",
    terms: ["Ehrliche Preise", "Wirkungsrückkopplung", "Folgekosten"],
    source: "WP_Produkte / FAZ-Beitrag",
    text: "Ehrliche Preise bedeuten in der Live-Referenz nicht moralische Verteuerung, sondern Rückkopplung verdrängter Folgekosten in Preise, Steuern, Kapitalzugang, Beschaffung und Entscheidungen."
  }],
  [50, {
    cluster: "Produkt- und Lieferkettenlogik",
    terms: ["Scorecard", "Reverse Merit Order", "Datenqualität"],
    source: "Technische Leitlinien WUStG / WÖk-Masterregister v1.4",
    text: "Produktscorecards werden mit WÖk-IDs, Datenqualität, Benchmarkstatus, Assurance und Reverse Merit Order verbunden. Sie sind Beispiel- und Steuerungsinstrumente, keine endgültige Rechtsanwendung und keine automatische Entscheidung ohne geprüfte Datenbasis."
  }],
  [51, {
    cluster: "Produkt- und Lieferkettenlogik",
    terms: ["Apfelbeispiel", "Reverse Merit Order", "Bonuslogik"],
    source: "Beispiel_Apfel_Wirkungssteuer_Bonusregel",
    text: "Das Apfelbeispiel bleibt eine Beispielrechnung. Es zeigt die Logik von Daten, Scorecard, Reverse Merit Order, Steuerklasse und Bonus-/Vorsteuerlogik, ersetzt aber keine rechtliche Einzelfallentscheidung."
  }],
  [56, {
    cluster: "Automatisierung, Arbeit, Einkommen, Rente",
    terms: ["Maschinenleistung", "Arbeit", "Wirkungseinkommen"],
    source: "Wenn Maschinen arbeiten / WP_Einkommen",
    text: "Arbeit verliert in der Live-Referenz nicht Würde oder Bedeutung, sondern ihre Exklusivität als Einkommensanker. Automatisierung verschiebt die Frage vom Arbeitsvolumen zum wirksamen Beitrag für Mensch, Planet und Demokratie."
  }],
  [57, {
    cluster: "Automatisierung, Arbeit, Einkommen, Rente",
    terms: ["Wirkungseinkommen", "Wirkungsdividende", "WEstG"],
    source: "WP_Einkommen / Wenn Maschinen arbeiten",
    text: "Wirkungseinkommen ist ein modellhafter Ansatz für die Rückkopplung gesellschaftlicher Wertschöpfung, keine Personenbewertung und kein individualisiertes Belohnungssystem. WEstG und Wirkungseinkommensteuer sind von Wirkungseinkommen und Wirkungsdividende sprachlich zu trennen. Konkrete Ausgestaltung, Rechtsgrundlage, Verteilungswirkung und Missbrauchsschutz wären jeweils eigenständig zu prüfen."
  }],
  [58, {
    cluster: "Automatisierung, Arbeit, Einkommen, Rente",
    terms: ["Wirkungsrente", "Lebensleistung", "Wirkungseinkommen"],
    source: "WP_Rente / WP_Einkommen",
    text: "Wirkungsrente ist ein modellhafter Finanzierungs- und Verteilungsansatz, keine moralische Rangliste von Lebensläufen und keine Bewertung einzelner Personen. Sie wäre vom Wirkungseinkommen und von Steuerinstrumenten zu unterscheiden; Ansprüche, Bedarfe, Gleichbehandlung, Datenschutz und demokratische Regeln dürften nicht durch einen individuellen Wirkungswert ersetzt werden."
  }],
  [80, {
    cluster: "Systemarchitektur",
    terms: ["Digitalisierung", "Wirkungsdatenraum", "Governance"],
    source: "Systemmodell der Wirkungsökonomie",
    text: "Digitalisierung wird als Infrastruktur der Wirkungsökonomie geführt, nicht als Selbstzweck. Datenräume, Schnittstellen, IDs und Prüfregeln dienen Rückkopplung, nicht Überwachung."
  }],
  [81, {
    cluster: "Systemarchitektur",
    terms: ["Wirkungsdatenraum", "Datenstandard", "Interoperabilität"],
    source: "Systemmodell der Wirkungsökonomie / technische Leitlinien",
    text: "Wirkungsdatenräume verbinden Datenstandards, Interoperabilität, Rechte, Prüfstatus und Rückkopplung. Sie sollen Doppelerhebungen reduzieren und Steuerungsfähigkeit erhöhen, ohne eine zentrale Datenmacht zu schaffen."
  }],
  [85, {
    cluster: "Produkt- und Lieferkettenlogik",
    terms: ["Digitaler Produktpass", "DPP", "WÖk-ID", "NACE"],
    source: "WP_Produkte / technische Leitlinien / WÖk-Masterregister v1.4",
    text: "Der digitale Produktpass wird als technische Brücke zwischen Produktdaten, WÖk-ID, Scorecards, Lieferkette und Rückkopplung verstanden. Er ersetzt keine Bewertung, sondern transportiert prüfbare Daten und Versionen."
  }],
  [104, {
    cluster: "Mess- und Bewertungslogik",
    terms: ["Gaming the System", "Impact Washing", "Datenqualität", "Wirkungsgrenze"],
    source: "Führender Begriffsleitfaden / technische Leitlinien",
    text: "Wirkungsmessung braucht Schutz vor Scheingenauigkeit, Impact Washing, Datenmanipulation und Gaming the System. Datenqualität, Audits, Einspruchslogik, Wirkungsgrenzen und Nichtkompensation sind deshalb Bestandteil der Referenz."
  }],
  [106, {
    cluster: "Governance und Fehlbarkeit",
    terms: ["Fehlbarkeit", "Wirkungswahrheit", "demokratische Kontrolle"],
    source: "Führender Begriffsleitfaden / Wirkungsrat_Konzept",
    text: "Die Wirkungsökonomie beansprucht kein Wahrheitsmonopol. Ihre Fehlbarkeit ist eine Governance-Anforderung: nachvollziehbare Daten, Kritikfähigkeit, Einspruch, Korrektur, demokratische Kontrolle und dokumentierte Änderungen gehören zur Architektur."
  }]
]);

const draftingPatterns = [
  {
    label: "next-section-chat-prompt",
    regex: /Soll ich jetzt den nächsten Abschnitt schreiben.*?Endpreis\?/gis,
    severity: "high"
  },
  {
    label: "next-section-chat-prompt",
    regex: /Möchtest du, dass ich jetzt Abschnitt 1\.2.*?Stil\)\?/gis,
    severity: "high"
  },
  {
    label: "generic-chat-prompt",
    regex: /(?:Soll ich jetzt|Möchtest du|weiter im gleichen Stil|Hier ist der nächste Abschnitt)/gi,
    severity: "medium"
  },
  {
    label: "todo-marker",
    regex: /\b(?:TODO|noch ergänzen|Quelle fehlt)\b/gi,
    severity: "medium"
  }
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

function clean(text = "") {
  return String(text)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hash(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, 16);
}

function titleFrom(html, file) {
  return clean(html.match(/<h1[^>]*>(.*?)<\/h1>/is)?.[1] || path.basename(path.dirname(file)) || file);
}

function chapterNumberFromFile(file) {
  const match = file.match(/kapitel-(\d{3})-/);
  return match ? Number(match[1]) : undefined;
}

function routeFor(file) {
  const rel = file.replace(/\\/g, "/");
  return rel.endsWith("/index.html") ? `/${rel.slice(0, -"/index.html".length)}/` : `/${rel}`;
}

function addendumHtml(chapterNumber, update) {
  const sectionId = `woek-main-2026-k${String(chapterNumber).padStart(3, "0")}-lr-2026-2`;
  const terms = update.terms.map((term) => `<li>${term}</li>`).join("");
  return `<aside id="${sectionId}" class="callout fachliche-einordnung">
          <h2>${update.cluster}: fachliche Einordnung</h2>
          <p>${publicReferenceWording(update.text)}</p>
          <p><strong>Weiterführende Grundlage:</strong> ${update.source}</p>
          <p><strong>Zentrale Begriffe:</strong></p>
          <ul>${terms}</ul>
        </aside>`;
}

function removeNestedElementByClass(html, className) {
  const escaped = String(className).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const startPattern = new RegExp(`<([a-z][\\w-]*)\\b[^>]*\\bclass=(["'])[^"']*\\b${escaped}\\b[^"']*\\2[^>]*>`, "ig");
  let match;
  while ((match = startPattern.exec(html))) {
    const tag = match[1];
    const tokenPattern = new RegExp(`<\\/?${tag}\\b[^>]*>`, "ig");
    tokenPattern.lastIndex = match.index + match[0].length;
    let depth = 1;
    let token;
    let end = -1;
    while ((token = tokenPattern.exec(html))) {
      if (token[0].startsWith("</")) depth -= 1;
      else if (!/\/\s*>$/.test(token[0])) depth += 1;
      if (depth === 0) {
        end = tokenPattern.lastIndex;
        break;
      }
    }
    if (end < 0) break;
    html = `${html.slice(0, match.index)}${html.slice(end)}`;
    startPattern.lastIndex = 0;
  }
  return html;
}

function ensureMeta(html) {
  const citationSummary = `<section class="meta-box citation-summary">
      <h2>Lesen und zitieren</h2>
      <p>Die Webfassung ist nach Kapiteln und Abschnitten gegliedert. Quellen und Begriffe sind an den jeweiligen Fundstellen verlinkt.</p>
    </section>`;
  let cleaned = removeNestedElementByClass(html, "version-summary");
  cleaned = removeNestedElementByClass(cleaned, "fulltext-status-summary");
  cleaned = removeNestedElementByClass(cleaned, "live-reference-notice");
  cleaned = removeNestedElementByClass(cleaned, "technical-meta");
  return cleaned
    .replace(/<section class="callout live-reference-notice">[\s\S]*?<\/section>/gi, "")
    .replace(/<aside\b[^>]*class="[^"]*live-reference-addendum[^"]*"[^>]*>[\s\S]*?<\/aside>/gi, "")
    .replace(/<section\b[^>]*class="[^"]*\b(?:version-summary|fulltext-status-summary|live-reference-notice)[^"]*"[^>]*>[\s\S]*?<\/section>/gi, citationSummary)
    .replace(/<section class="meta-box">\s*<h2>(?:Version und Reviewstatus|Stand dieser Onlinefassung|Versionsinformationen)<\/h2>[\s\S]*?<\/section>/gi, citationSummary)
    .replace(/<details\b[^>]*class="[^"]*\btechnical-meta\b[^"]*"[^>]*>[\s\S]*?<\/details>/gi, "")
    .replace(/<dt>(?:Onlinefassung-(?:Version|Stand)|Web-Version)<\/dt><dd>[\s\S]*?<\/dd>/gi, "")
    .replace(/\sdata-(?:document-id|section-id|paragraph-id|version|content-hash)=(?:"[^"]*"|'[^']*')/gi, "")
    .replace(/\b(\d+\.\d+)-live-reference\b/gi, "$1")
    .replace(/(<section class="meta-box citation-summary">[\s\S]*?<\/section>)\s*<\/section>/gi, "$1");
}

function replaceParagraphById(html, id, body) {
  const pattern = new RegExp(`(<p\\b[^>]*\\bid="${id}"[^>]*)>[\\s\\S]*?<\\/p>`, "i");
  return html.replace(pattern, `$1>${body}</p>`);
}

// Das Whitepaper von 2025 bleibt als historische Quelle erhalten. In einer
// aktuellen Referenz darf es aber weder als "neuer Standard" erscheinen noch
// eine überholte Multiplikatorformel stillschweigend stützen. Diese Korrektur
// ändert nur Quellenabsätze des Online-Buchs; die historische Originalfassung
// unter /dokumente/ wird separat und sichtbar als Archivfassung behandelt.
//
// Wichtig: Diese Konstanten sind zugleich das kanonische Ziel jeder
// Normalisierung. Ein Build darf denselben Hinweis beliebig oft anwenden,
// ohne erneut "Historisches" oder den Verweis auf den Rechenstandard
// anzuhängen.
const RETIRED_T_SROI_CITATION = "Historisches Whitepaper T-SROI, 2025; für aktuelle Rechenregeln: T-SROI-Rechenstandard v1.1, 2026 (WÖK-Q-1024)";
const RETIRED_T_SROI_MULTIPLIER_NOTE = "historisch verwendete Multiplikatorlogik (durch v1.1 ersetzt)";

const retiredTSroiCitationPattern = /(?:\bHistorisches\s+)*(?:Whitepaper\s+T[-‑–]SROI(?:\s*-\s*[^,;<]+)?(?:,?\s*(?:September\s*)?2025)?)(?:\s*;\s*für\s+aktuelle\s+Rechenregeln:\s*T[-‑–]SROI-Rechenstandard\s+v1\.1,\s*2026\s*\(W[ÖO]K-Q-1024\))*/giu;
const retiredTSroiMultiplierPattern = /(?:\bhistorisch\s+verwendete\s+)*(?:Transformationsmultiplikator|Multiplikatorlogik)(?:\s*\(durch\s+v1\.1\s+ersetzt\))*/giu;
const referenceSourceIdPattern = /^\[?((?:I|E)-[A-Z0-9]+(?:-[A-Z0-9]+)*)\]?\s*/iu;

export function normalizeRetiredTSroiSourceCitation(body = "") {
  return String(body)
    .replace(retiredTSroiCitationPattern, RETIRED_T_SROI_CITATION)
    .replace(retiredTSroiMultiplierPattern, RETIRED_T_SROI_MULTIPLIER_NOTE)
    .replace(/\bMultiplikatoreffekte\b/giu, "belegte Wirkpfade (keine Rechenmultiplikatoren)");
}

function updateRetiredTSroiSourceCitations(html) {
  return html.replace(/<p\b([^>]*)>([\s\S]*?)<\/p>/gi, (whole, attributes, body) => {
    const text = body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const sourceId = text.match(referenceSourceIdPattern)?.[1];
    if (!sourceId || !/Whitepaper\s+T[-‑–]SROI/i.test(text)) return whole;

    const revised = normalizeRetiredTSroiSourceCitation(body);

    return revised === body ? whole : `<p${attributes}>${revised}</p>`;
  });
}

function updateCurrentTSroiMethodLinks(html) {
  return html
    .replace(
      /<a\b([^>]*?)href=(['"])\.\.\/\.\.\/dokumente\/whitepaper-t-sroi\/\2([^>]*)>\s*Whitepaper T-SROI\s*<\/a>/gi,
      '<a$1href=$2../../quellenarchiv/wok-q-1024/$2$3>T-SROI-Rechenstandard v1.1</a>'
    )
    .replace(
      /(<strong>Weiterführende Grundlage:<\/strong>)\s*Whitepaper T-SROI/gi,
      '$1 <a href="../../quellenarchiv/wok-q-1024/">T-SROI-Rechenstandard v1.1</a> (das Whitepaper von 2025 ist als historische Vorfassung dokumentiert)'
    );
}

export function applyCurrentMethodologyCorrections(html, chapterNumber, { currentReference = false } = {}) {
  let next = currentReference ? updateCurrentTSroiMethodLinks(updateRetiredTSroiSourceCitations(html)) : html;
  const corrections = {
    32: {
      "woek-main-2026-k032-s004-p004": "Der NWI trennt zwei Aufgaben, die leicht verwechselt werden. Zuerst übersetzt die Scorecard Rohdaten in dimensionsgleiche Feldscores s<sub>i</sub> auf einer vorher dokumentierten Skala, zum Beispiel von −3 bis +3. Daraus kann ein beschreibender Profilwert P = Σ<sub>i</sub> w<sub>i</sub>s<sub>i</sub> mit vorab festgelegten Gewichten w<sub>i</sub> und Σw<sub>i</sub> = 1 entstehen. Danach prüft das Schutz-Gate G die roten Linien, kritischen Felder, Systemgrenze, Zurechnung und Datenqualität. NWI = P darf nur bei G = 1 ausgewiesen werden. Datenqualität und Unsicherheit verändern nicht still die Punkte; sie bestimmen Evidenzstatus, Intervall und gegebenenfalls die Blockade.",
      "woek-main-2026-k032-s004-p005": "Ein positiver NWI bedeutet deshalb nur bei offenem Gate: Das dokumentierte Profil ist im definierten Wirkungsraum netto tragfähig. Ein niedriger oder negativer Profilwert bleibt kritisch. Fehlende Evidenz ist etwas Drittes: Sie ist nicht der neutrale Messwert 0 und auch kein versteckter Minuspunkt, sondern „nicht bewertbar“ oder „Prüfung nötig“. So wird Unsicherheit sichtbar, ohne Datenlücken zu belohnen oder kleine Akteure pauschal zu bestrafen.",
      "woek-main-2026-k032-s004-p010": "Vom T-SROI unterscheidet sich der NWI klar. Der NWI verdichtet ein nichtmonetäres, dimensionsgleiches Wirkungsprofil und seine Schutzprüfung. Der T-SROI rechnet ausschließlich belegte Nutzen, Schäden und Ressourcen in Euro derselben Preisbasis. Transformationswirkung wird dort nur als separat nachgewiesener zukünftiger Nutzenstrom berücksichtigt, nicht als Multiplikator für ein Profil.",
      "woek-main-2026-k032-s004-p011": "Ein einfaches Beispiel macht die Reihenfolge greifbar: Klima +2, Arbeit +1 und Gesundheit 0 ergeben bei Gewichten 0,4, 0,4 und 0,2 den Profilwert P = 1,2. Liegt Arbeit als kritisches Feld jedoch bei −1 und verlangt die vorab gesetzte Schwelle mindestens 0, bleibt G = 0: Die Scorecard zeigt die Werte, aber ein positiver NWI wird nicht ausgegeben. Erst wenn das kritische Feld und die Evidenzlage verbessert sind, kann der Profilwert als NWI dienen.",
      "woek-main-2026-k032-s004-p013": "Damit wird aus der Scorecard ein steuerungsfähiges Instrument. Die Scorecard zeigt Rohdaten, Einheiten, Feldscores, Evidenz und Grenzen. Der NWI verdichtet nur das geprüfte, dimensionsgleiche Profil bei offenem Gate. Der T-SROI fragt anschließend und getrennt, ob belegte direkte und transformative Nettonutzenströme in Euro einen Transformationspfad tragen.",
      "woek-main-2026-k032-s007-p008": "<a class=\"source-chip\" href=\"../../quellenarchiv/wok-q-1024/\" data-source-id=\"I-K32-7\">[I-K32-7]</a> Weber, Natalie: T-SROI-Rechenstandard v1.1, 2026. Grundlage für die Trennung von NWI, IOI und T-SROI, die monetäre Nutzen-, Schaden- und Kostenlogik, das Schutz-Gate sowie die Regel, dass Transformationswirkung nur als separat belegter Nutzenstrom in Euro in die Rechnung eingeht."
    },
    33: {
      "woek-main-2026-k033-s002-p005": "RMO-Grenzwert = min<sub>i ∈ C</sub>(s<sub>i</sub>), wenn keine rote Linie aktiv ist. C ist die vor der Bewertung dokumentierte Menge kritischer Wirkungsfelder; s<sub>i</sub> ist der gemessene Feldscore. Der RMO-Grenzwert begrenzt eine Gesamtentscheidung, ist aber nicht selbst der NWI und keine Durchschnittsnote.",
      "woek-main-2026-k033-s002-p006": "Für jedes kritische Feld wird vorab eine Schwelle τ<sub>i</sub> dokumentiert. Liegt s<sub>i</sub> unter τ<sub>i</sub>, bleibt das Schutz-Gate geschlossen; bei roter Linie ebenfalls. Ein fehlender Messwert ist nicht 0, sondern „Evidenz fehlt“ und löst je nach Risiko einen Nachweispfad oder die Blockade aus. Die Skala von −3 bis +3 ist nur eine klar markierte Modellskala; ihre Anker und Schwellen müssen je Anwendung veröffentlicht werden.",
      "woek-main-2026-k033-s002-p009": "Ein einfaches Beispiel: Ein Produkt erhält Klima +2, Ressourcen +1, Arbeit und Fairness −1, Gesundheit +2. Wenn Arbeit und Fairness zum kritischen Set C gehören und die vorab gesetzte Schwelle τ<sub>Arbeit</sub> = 0 lautet, ist der RMO-Grenzwert −1 und das Schutz-Gate bleibt geschlossen. Ein Durchschnitt könnte positiv sein; er darf die Blockade nicht überschreiben. Erst nach belegter Verbesserung des kritischen Feldes ist eine positive Gesamtentscheidung möglich."
    },
    34: {
    "woek-main-2026-k034-s002-p001": "T-SROI macht nur den Teil einer Transformationswirkung rechenbar, der als eigener künftiger Nutzenstrom in Euro belegt ist. Er ersetzt den NWI nicht: Der NWI beschreibt das operative Wirkungsprofil und die Schutzprüfung. T-SROI fragt anschließend, welcher diskontierte direkte und transformative Nettonutzen je diskontiertem Ressourceneuro entsteht.",
    "woek-main-2026-k034-s002-p003": "NWI = Σᵢ wᵢ sᵢ, nur bei offenem Schutz-Gate G = 1. Die Feldscores sᵢ liegen auf derselben vorher dokumentierten Skala; die Gewichte wᵢ sind vor der Bewertung festzulegen und zu dokumentieren. Bei G = 0 ist der NWI nicht positiv ausweisbar.",
    "woek-main-2026-k034-s002-p004": "IOI<sub>EUR</sub> = Σ<sub>t=1…T</sub>[(B<sub>direkt,t</sub> · a<sub>t</sub> · (1 − d<sub>t</sub>) · (1 − v<sub>t</sub>) − S<sub>t</sub>) / (1 + r)<sup>t</sup>] ÷ Σ<sub>t=0…T</sub>[(I<sub>t</sub> + K<sub>t</sub>) / (1 + r<sub>k</sub>)<sup>t</sup>]. Der IOI bezieht sich auf den kausal zugerechneten direkten Nettonutzen in Euro je Ressourceneuro. Die Anfangsinvestition I<sub>0</sub> steht im Nenner bei t = 0 und wird nicht abgezinst. Ein NWI-Punktwert oder eine qualitative Bilanz darf nicht unbemerkt als Euro-Zähler verwendet werden.",
    "woek-main-2026-k034-s002-p005": "T-SROI = Σ<sub>t=1…T</sub>[((B<sub>direkt,t</sub> + B<sub>transformativ,t</sub>) · a<sub>t</sub> · (1 − d<sub>t</sub>) · (1 − v<sub>t</sub>) − S<sub>t</sub>) / (1 + r)<sup>t</sup>] ÷ Σ<sub>t=0…T</sub>[(I<sub>t</sub> + K<sub>t</sub>) / (1 + r<sub>k</sub>)<sup>t</sup>]. Für das Gate gilt zusätzlich PV<sub>N</sub><sup>L</sup> = Σ<sub>t=1…T</sub>[((B<sub>direkt,t</sub> + B<sub>transformativ,t</sub>) · a<sub>t</sub> · (1 − d<sub>t</sub>) · (1 − v<sub>t</sub>) · (1 − u<sub>t</sub>) − S<sub>t</sub>) / (1 + r)<sup>t</sup>]. T ist eine ganze Zahl von Jahren mit T ≥ 1; I<sub>0</sub> steht bei t = 0 und wird nicht abgezinst.",
    "woek-main-2026-k034-s002-p006": "Das Schutz-Gate G ist kein Multiplikator in der Formel. Es ist die Veröffentlichungsvoraussetzung: Eine positive T-SROI- oder IOI-Aussage ist nur bei G = 1 zulässig. G bleibt geschlossen bei roter Linie, negativem kritischem Kernfeld, nicht dokumentierter Systemgrenze oder Zurechnung, unzureichender Datenqualität, nicht positiver Ressourcenbasis oder PV<sub>N</sub><sup>L</sup> ≤ 0. u ist ein dokumentierter konservativer Szenarioabschlag auf den beanspruchten Nutzen; er reduziert nicht den Schaden S. PV<sub>N</sub><sup>L</sup> ist keine statistische Konfidenzgrenze. Dann lautet das Ergebnis „blockiert“ oder „nicht bewertbar“, nicht null und nicht positiv.",
    "woek-main-2026-k034-s002-p007": "Formelkasten 34-2: monetäre Arbeitsformel",
    "woek-main-2026-k034-s002-p008": "Der Zähler enthält für jedes Jahr den kausal reduzierten direkten Nutzen B<sub>direkt</sub> und den separat belegten transformativen Nutzen B<sub>transformativ</sub>, abzüglich der konservativ angesetzten Schäden S. Der Nenner enthält Investition I und inkrementelle Kosten K. Alle Terme sind Euro derselben Preisbasis und werden mit offengelegten Diskontsätzen abgezinst. PV<sub>N</sub><sup>L</sup> bildet dieselbe Rechnung als vorsichtige Szenariountergrenze, indem u nur den beanspruchten Nutzen kürzt.",
    "woek-main-2026-k034-s002-p009": "a steht für Attribution, d für Counterfactual beziehungsweise Deadweight und v für Verdrängung des beanspruchten Nutzens. Diese Faktoren reduzieren nur den beanspruchten Nutzen. Auch u reduziert nur diesen Nutzen. Schäden S werden weder mit a, d, v noch mit u pauschal verringert: Eine geringere Schaden-Zurechnung braucht eine eigene belegte Gegenfaktik. Datenqualität, Unsicherheit, Diffusion, Resilienz und Zeitwirkung sind keine frei wählbaren Multiplikatoren. Sie werden als Evidenz, Sensitivität, Intervall, Wirkpfad und Schutz-Gate dokumentiert; ein monetärer transformativer Nutzenstrom entsteht erst mit eigener Ursache-Wirkungs-Begründung und Preisbasis.",
      "woek-main-2026-k034-s002-p010": "Die Kennzahlen bleiben damit getrennt: Der NWI verdichtet ein dimensionsgleiches Wirkungsprofil auf einer dokumentierten Skala. Der IOI setzt nur monetär bewerteten direkten Nettonutzen in Euro ins Verhältnis zu Kapital in Euro. Der T-SROI ergänzt zusätzlich separat belegte transformative Nutzenströme in Euro. Reichweite, Datenqualität, Resilienz oder ein überzeugendes Narrativ sind wichtig für die Prüfung, aber keine Rechenfaktoren, die aus sich heraus einen höheren Geldwert erzeugen.",
      "woek-main-2026-k034-s008-p002": "<a class=\"source-chip\" href=\"../../quellenarchiv/wok-q-1024/\" data-source-id=\"I-K34-1\">[I-K34-1]</a> Weber, Natalie: T-SROI-Rechenstandard v1.1, 2026. Grundlage für die Abgrenzung von ROI, SROI, NWI, IOI und T-SROI sowie für die Euro-zu-Euro-Formel mit separat belegten transformativen Nutzenströmen.",
      "woek-main-2026-k034-s008-p006": "<a class=\"source-chip\" href=\"../../quellenarchiv/wok-q-1024/\" data-source-id=\"I-K34-5\">[I-K34-5]</a> Weber, Natalie: T-SROI-Rechenstandard v1.1, 2026. Grundlage für die Prüfung von Diffusion, Standardsetzung, Infrastruktur und Resilienz als Wirkpfad-Evidenz. Sie werden nur bei eigenständigem Nachweis und gleicher Preisbasis als Nutzenstrom in Euro berücksichtigt, nicht als Multiplikator.",
      "woek-main-2026-k034-s008-p007": "<a class=\"source-chip\" href=\"../../quellenarchiv/wok-q-1024/\" data-source-id=\"I-K34-6\">[I-K34-6]</a> Weber, Natalie: T-SROI-Rechenstandard v1.1, 2026. Grundlage für die Anwendung in Unternehmen, öffentlicher Finanzierung und Portfolios: Systemgrenze, Zurechnung, Unsicherheit, Diskontierung und Schutz-Gate sind offen zu legen.",
      "woek-main-2026-k034-s008-p008": "<a class=\"source-chip\" href=\"../../quellenarchiv/wok-q-1024/\" data-source-id=\"I-K34-7\">[I-K34-7]</a> Weber, Natalie: T-SROI-Rechenstandard v1.1, 2026. Grundlage für die gestufte Impact-Controlling-Architektur aus KII, Scorecard, NWI, IOI und T-SROI sowie für die Trennung von Profilwert, monetärem direkten Nettonutzen und transformativem Nutzenstrom."
    },
    35: {
      "woek-main-2026-k035-s001-p005": "Für die Wirkungsökonomie ist diese technische Idee grundlegend, aber nicht ausreichend. Der DPP speichert Daten. Die WÖk-ID ordnet Wirkungsindikatoren. Benchmarks und Skalen bewerten Daten. Scorecards bündeln sie. T-SROI kann daraus nur dann eine monetäre Transformationsrechnung bilden, wenn direkte und transformative Nutzenströme, Schäden und Ressourcen in Euro derselben Preisbasis belegt sind. Diffusion, Resilienz und Reichweite bleiben Wirkpfad-Evidenz, solange sie nicht selbst als getrennte Nutzenströme nachgewiesen sind.",
      "woek-main-2026-k035-s004-p004": "Steuerungsdaten entstehen, wenn diese Informationen entscheidungsrelevant werden. Ein Produktpass macht Daten am Produkt verfügbar. Ein Datenraum macht sie verknüpfbar. WÖk-IDs machen sie adressierbar. Benchmarks und Scorecards machen sie bewertbar. Sie liefern auch die Evidenz, um mögliche direkte oder transformative Nutzenströme, Schäden und Risiken getrennt zu prüfen. T-SROI darf erst danach und nur für monetär dokumentierte Ströme berechnet werden. Damit können Daten in Entscheidungen zurückkehren.",
      "woek-main-2026-k035-s005-p001": "Teil V hat die Mess- und Datenarchitektur der Wirkungsökonomie aufgebaut. Kapitel 30 hat gezeigt, warum Wirkung messbar werden muss, ohne auf Zahlen reduziert zu werden. Kapitel 31 hat die WÖk-ID als Adresse der Wirkung eingeführt. Kapitel 32 hat Benchmarks, Skalen und Scorecards als Übersetzung von Daten in Bewertung erklärt. Kapitel 33 hat mit der Reverse Merit Order klargestellt, dass schwere Schäden nicht durch gute Werte an anderer Stelle verdeckt werden dürfen. Kapitel 34 hat die Bedingungen einer monetären T-SROI-Rechnung geklärt: separat belegte direkte und transformative Nutzenströme, Schäden, Ressourcen, Zurechnung, Preisbasis und Schutz-Gate. Kapitel 35 zeigt nun, wie digitale Produktpässe und Wirkungsdatenräume die dazu nötigen Daten verfügbar, prüfbar, verknüpfbar und entscheidungsrelevant machen."
    }
  };
  const paragraphs = corrections[chapterNumber];
  if (!paragraphs) return next;

  for (const [id, body] of Object.entries(paragraphs)) next = replaceParagraphById(next, id, body);
  return next;
}

function insertAfterFirstMeta(html, addition) {
  if (html.includes(addition.match(/class="([^"]+)"/)?.[1] || "live-reference-notice")) return html;
  return html.replace(/(<\/section>\s*)/, `$1\n        ${addition}\n`);
}

function dedupeHtmlIds(html) {
  const seen = new Map();
  return html.replace(/\sid="([^"]+)"/g, (full, id) => {
    const count = seen.get(id) || 0;
    seen.set(id, count + 1);
    if (count === 0) return full;
    return ` id="${id}-dup${count + 1}"`;
  });
}

function stripTrailingWhitespace(value) {
  return value.replace(/[ \t]+$/gm, "");
}

function finalText(value) {
  return `${stripTrailingWhitespace(value).replace(/\n+$/g, "")}\n`;
}

function issueForChange(change) {
  return {
    documentId: change.documentId,
    route: change.affectedRoute,
    sectionId: change.affectedSectionId,
    paragraphId: change.affectedParagraphId || null,
    originalText: change.previousText || "",
    issueType: change.type,
    severity: change.severity,
    suggestedAction: change.reason,
    suggestedLiveReferenceText: change.newText || "",
    sourceForUpdate: change.sourceForChange,
    affectedTerms: change.affectedTerms || [],
    affectedDocuments: change.affectedDocuments || [],
    reviewStatus: change.reviewStatus === "applied" ? "applied-as-live-reference-update" : change.reviewStatus
  };
}

function formatChangeLog(changes) {
  const lines = [
    "# Live-Reference-Changelog",
    "",
    `Version: ${LIVE_REFERENCE_VERSION}`,
    `Stand: ${new Date().toISOString().slice(0, 10)}`,
    "",
    "Dieses Changelog dokumentiert Aktualisierungen gegenüber der Source-Original-Fassung. Die Originaldateien bleiben unverändert zitierfähig.",
    ""
  ];
  for (const change of changes) {
    lines.push(`## ${change.changeId} - ${change.type}`);
    lines.push("");
    lines.push(`- Route: \`${change.affectedRoute}\``);
    lines.push(`- Abschnitt: \`${change.affectedSectionId}\``);
    lines.push(`- Schweregrad: ${change.severity}`);
    lines.push(`- Status: ${change.reviewStatus}`);
    lines.push(`- Grund: ${change.reason}`);
    lines.push(`- Quelle: ${change.sourceForChange}`);
    if (change.previousText) lines.push(`- Vorher: ${change.previousText}`);
    if (change.newText) lines.push(`- Live-Referenz: ${change.newText}`);
    lines.push("");
  }
  return finalText(lines.join("\n"));
}

function sourceHierarchyDoc() {
  return `# Live-Reference-Quellenhierarchie

Stand: ${new Date().toISOString().slice(0, 10)}

## Ebene 1: Original / Source

- bestätigte DOCX-Fassung des Hauptwerks
- Original-PDF des Hauptwerks
- bleibt unverändert zitierfähig
- dient als historische und kanonische Source-Original-Fassung

## Ebene 2: Führende Terminologie

- ${TERMINOLOGY_BASE}
- Stand: 21. Mai 2026
- maßgeblich für Begriffe, Glossar, Hovers, Crosslinks, Sprachregeln und Terminologieprüfung

## Ebene 3: Neuere Logik- und Systemweiterentwicklungen

Diese Dokumente werden als mögliche Aktualisierungsquellen der lebenden Referenz geprüft:

- WStG_Oktober2025
- Technische_Leitlinien_WUStG_Vollversion_Extended_v2
- Beispiel_Apfel_Wirkungssteuer_Bonusregel
- WOeK_Masterregister_v1.4_FINAL_2026-08-16.xlsx
- WOeK_Master_Items_final_v1.2.pdf (historische Fassung)
- Wirkungsrat_Konzept
- Whitepaper-T-SROI
- Wirkungsökonomie in der Lieferkette
- WP_Produkte
- WP_Rente
- WP_Einkommen
- WP_Wohnungsmarkt_
- Wenn Maschinen arbeiten
- Systemmodell-der-Wirkungsökonomie
- Nachhaltigkeit-Systemarchitektur
- Leitbild für Mensch Planet und Demokratie
- FAZ-Beitrag
- Beispiel-Konzern

## Ebene 4: Archiv-/Frühfassungen

- Grundlagenpapier-Wirkungsökonomie WÖk
- WÖk-Manifest
- Minifest
- WÖK-Partei
- NATS WÖk allgemein
- ältere Leitbildfassungen
- ältere Whitepaper

Archiv- und Frühfassungen bleiben sichtbar, gelten aber nicht ungeprüft als aktueller Stand der lebenden Referenz.

## Regel

Wenn ein neueres Dokument eine Logik präzisiert, wird diese Präzisierung in der Online-Referenz sichtbar gemacht. Wenn ein älteres Dokument abweicht, wird es nicht gelöscht, sondern als ältere Fassung, Archiv oder Arbeitspapier gekennzeichnet.
`;
}

export function applyLiveReferenceLayer() {
  const changes = [];
  const existingChanges = fs.existsSync("public/data/live-reference-changelog.json")
    ? JSON.parse(fs.readFileSync("public/data/live-reference-changelog.json", "utf8")).changes || []
    : [];
  let counter = 1;
  const addChange = (change) => {
    changes.push({
      changeId: `lr-2026-2-${String(counter).padStart(4, "0")}`,
      version: LIVE_REFERENCE_VERSION,
      originalVersion: SOURCE_VERSION,
      importVersion: IMPORT_VERSION,
      reviewStatus: "applied",
      ...change
    });
    counter += 1;
  };

  for (const file of htmlRoots.flatMap((root) => walk(root))) {
    let html = fs.readFileSync(file, "utf8");
    const original = html;
    const route = routeFor(file);
    const chapterNumber = chapterNumberFromFile(file);
    const hasPriorityAddendum = chapterNumber && priorityChapters.has(chapterNumber);
    html = ensureMeta(html);
    html = applyCurrentMethodologyCorrections(html, chapterNumber, { currentReference: route.startsWith("/referenz/") });

    if (hasPriorityAddendum) {
      const update = priorityChapters.get(chapterNumber);
      const marker = `woek-main-2026-k${String(chapterNumber).padStart(3, "0")}-lr-2026-2`;
      if (!html.includes(marker)) {
        html = insertAfterFirstMeta(html, addendumHtml(chapterNumber, update));
      }
      addChange({
        type: "addendum",
        severity: "medium",
        documentId: "woek-main-2026",
        affectedRoute: route,
        affectedSectionId: marker,
        previousText: "",
        newText: update.text,
        reason: `Delta-Review-Ergänzung für Cluster ${update.cluster}.`,
        sourceForChange: update.source,
        affectedTerms: update.terms,
        affectedDocuments: [update.source]
      });
    }

    for (const pattern of draftingPatterns.slice(0, 2)) {
      const before = html;
      html = html.replace(pattern.regex, "");
      if (before !== html) {
        addChange({
          type: "drafting-artifact-removal",
          severity: pattern.severity,
          documentId: route.split("/").filter(Boolean).at(-1) || "unknown",
          affectedRoute: route,
          affectedSectionId: "document",
          previousText: pattern.label,
          newText: "",
          reason: "Entfernung eines Chat-/Arbeitsartefakts aus der Live-Referenzfassung; Originaldatei bleibt unverändert.",
          sourceForChange: "Drafting-Artefakt-Check 2026.2",
          affectedTerms: [],
          affectedDocuments: []
        });
      }
    }

    html = publicReferenceWording(html);
    html = stripTrailingWhitespace(dedupeHtmlIds(html));

    if (html !== original) fs.writeFileSync(file, html);
  }

  if (!changes.some((change) => change.type === "structural-update")) {
    addChange({
      type: "structural-update",
      severity: "medium",
      documentId: "woek-reference-system",
      affectedRoute: "/referenz/",
      affectedSectionId: "live-reference-layer",
      previousText: IMPORT_VERSION,
      newText: LIVE_REFERENCE_VERSION,
      reason: "Einführung der sichtbaren Live-Reference-Schicht mit Importversion, Live-Version, Reviewstatus und Changelog.",
      sourceForChange: "Phase-1-Live-Reference-Review",
      affectedTerms: ["Versionierung", "Terminologiebasis", "Delta-Review"],
      affectedDocuments: ["Hauptwerk", "Arbeitspapiere", "Glossar"]
    });
  }

  for (const oldChange of existingChanges.filter((change) => change.type === "drafting-artifact-removal")) {
    const exists = changes.some((change) => change.type === oldChange.type && change.affectedRoute === oldChange.affectedRoute && change.previousText === oldChange.previousText);
    if (!exists) changes.push({ ...oldChange, version: LIVE_REFERENCE_VERSION, reviewStatus: "applied" });
  }

  changes.forEach((change, index) => {
    change.changeId = `lr-2026-2-${String(index + 1).padStart(4, "0")}`;
    change.version = LIVE_REFERENCE_VERSION;
    change.originalVersion = SOURCE_VERSION;
    change.importVersion = IMPORT_VERSION;
  });

  if (fs.existsSync("public/data/mainwork-reference.json")) {
    const mainwork = JSON.parse(fs.readFileSync("public/data/mainwork-reference.json", "utf8"));
    mainwork.importVersion = IMPORT_VERSION;
    mainwork.liveReferenceVersion = LIVE_REFERENCE_VERSION;
    mainwork.webVersion = LIVE_REFERENCE_VERSION;
    mainwork.reviewStatus = "partially-delta-reviewed";
    mainwork.terminologyBase = TERMINOLOGY_BASE;
    mainwork.terminologyBaseDate = TERMINOLOGY_BASE_DATE;
    mainwork.acceptanceNotes = {
      ...(mainwork.acceptanceNotes || {}),
      liveReferenceLayer: true,
      commentsImplemented: false,
      backendImplemented: false
    };
    fs.writeFileSync("public/data/mainwork-reference.json", `${JSON.stringify(mainwork, null, 2)}\n`);
  }

  writeLiveReferenceReports(changes);
  return changes;
}

export function scanDraftingArtifacts() {
  const findings = [];
  for (const file of htmlRoots.flatMap((root) => walk(root))) {
    const html = fs.readFileSync(file, "utf8");
    const text = clean(html);
    for (const pattern of draftingPatterns.slice(2)) {
      const matches = Array.from(text.matchAll(pattern.regex));
      for (const match of matches) {
        findings.push({
          documentId: routeFor(file).split("/").filter(Boolean).at(-1) || "unknown",
          route: routeFor(file),
          sectionId: "document",
          paragraphId: null,
          originalText: match[0],
          issueType: "drafting-artifact",
          severity: pattern.severity,
          suggestedAction: "Als needs-human-review markieren oder aus Live-Referenz entfernen, sofern es ein Arbeitsartefakt ist.",
          suggestedLiveReferenceText: "",
          sourceForUpdate: "Drafting-Artefakt-Scan",
          affectedTerms: [],
          affectedDocuments: [],
          reviewStatus: "needs-human-review"
        });
      }
    }
  }
  return findings;
}

export function buildLogicFindings() {
  const findings = [];
  const checks = [
    {
      route: "/referenz/kapitel-010-wirkung/",
      sectionId: "woek-main-2026-k010-lr-2026-2",
      term: "Wirkung",
      required: "neutral und relational",
      issueType: "terminology-outdated",
      source: TERMINOLOGY_BASE
    },
    {
      route: "/referenz/kapitel-011-wirkungspotenzial/",
      sectionId: "woek-main-2026-k011-lr-2026-2",
      term: "Wirkungspotenzial",
      required: "noch keine eingetretene Wirkung",
      issueType: "logic-inconsistency",
      source: TERMINOLOGY_BASE
    },
    {
      route: "/referenz/kapitel-034-t-sroi-und-systemische-transformationsmessung/",
      sectionId: "woek-main-2026-k034-lr-2026-2",
      term: "T-SROI",
      required: "T-SROI und NWI",
      issueType: "logic-inconsistency",
      source: "T-SROI-Rechenstandard v1.1 (WÖK-Q-1024)"
    },
    {
      route: "/referenz/kapitel-038-das-wustg-und-die-produktwirkungssteuer/",
      sectionId: "woek-main-2026-k038-lr-2026-2",
      term: "WUStG",
      required: "WStG",
      issueType: "cross-document-consistency",
      source: "WStG_Oktober2025 / technische Leitlinien"
    },
    {
      route: "/referenz/kapitel-057-wirkungseinkommen/",
      sectionId: "woek-main-2026-k057-lr-2026-2",
      term: "Wirkungseinkommen",
      required: "nicht als altes BGE",
      issueType: "logic-inconsistency",
      source: "WP_Einkommen / Wenn Maschinen arbeiten"
    }
  ];
  for (const check of checks) {
    const file = path.join(check.route.slice(1), "index.html");
    const html = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
    findings.push({
      documentId: "woek-main-2026",
      route: check.route,
      sectionId: check.sectionId,
      paragraphId: null,
      originalText: "",
      issueType: check.issueType,
      severity: html.includes(check.required) ? "low" : "high",
      suggestedAction: html.includes(check.required) ? "confirmed-current" : "update-required",
      suggestedLiveReferenceText: html.includes(check.required) ? "Live-Reference-Addendum vorhanden." : `Addendum mit ${check.required} ergänzen.`,
      sourceForUpdate: check.source,
      affectedTerms: [check.term],
      affectedDocuments: [check.source],
      reviewStatus: html.includes(check.required) ? "confirmed-current" : "needs-human-review"
    });
  }
  return findings;
}

export function buildCrossDocumentFindings() {
  const docs = [
    ["WStG Oktober 2025", "/dokumente/wstg-oktober-2025/"],
    ["Technische Leitlinien WUStG", "/dokumente/technische-leitlinien-wustg-v2/"],
    ["Apfelbeispiel", "/dokumente/beispiel-apfel-wirkungssteuer-bonusregel/"],
    ["WÖk-Masterregister v1.4", "/bibliothek/woek-master-items-register/"],
    ["Wirkungsrat", "/dokumente/wirkungsrat-konzept/"],
    ["Whitepaper T-SROI", "/dokumente/whitepaper-t-sroi/"],
    ["Lieferkette", "/dokumente/wirkungsoekonomie-in-der-lieferkette/"],
    ["WP Produkte", "/dokumente/wp-produkte/"],
    ["WP Einkommen", "/dokumente/wp-einkommen/"],
    ["WP Wohnungsmarkt", "/dokumente/wp-wohnungsmarkt/"],
    ["Wenn Maschinen arbeiten", "/dokumente/wenn-maschinen-arbeiten/"],
    ["Systemmodell", "/dokumente/systemmodell-der-wirkungsoekonomie/"],
    ["Leitbild", "/dokumente/leitbild-mensch-planet-demokratie/"]
  ];
  return docs.map(([label, route]) => {
    const file = path.join(route.slice(1), "index.html");
    const html = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
    const hasOriginal = /Original(?:datei|-XLSX|-PDF)? öffnen/.test(html);
    return {
      documentId: route.split("/").filter(Boolean).at(-1),
      route,
      sectionId: "document",
      paragraphId: null,
      originalText: "",
      issueType: fs.existsSync(file) ? "confirmed-current" : "source-missing",
      severity: fs.existsSync(file) && hasOriginal ? "low" : "high",
      suggestedAction: fs.existsSync(file) && hasOriginal ? "confirmed-current" : "Originaldatei-Link oder Webfassung ergänzen.",
      suggestedLiveReferenceText: label,
      sourceForUpdate: "Source-Logic-Review",
      affectedTerms: [],
      affectedDocuments: [label],
      reviewStatus: fs.existsSync(file) && hasOriginal ? "confirmed-current" : "needs-human-review"
    };
  });
}

function writeMarkdownReport(file, title, findings, intro) {
  const lines = [`# ${title}`, "", `Stand: ${new Date().toISOString().slice(0, 10)}`, "", intro, ""];
  const byStatus = findings.reduce((acc, finding) => {
    acc[finding.reviewStatus] = (acc[finding.reviewStatus] || 0) + 1;
    return acc;
  }, {});
  lines.push("## Zusammenfassung", "");
  for (const [status, count] of Object.entries(byStatus)) lines.push(`- ${status}: ${count}`);
  lines.push("");
  lines.push("## Fundstellen", "");
  for (const finding of findings) {
    lines.push(`### ${finding.route} - ${finding.issueType}`);
    lines.push("");
    lines.push(`- Status: ${finding.reviewStatus}`);
    lines.push(`- Schweregrad: ${finding.severity}`);
    lines.push(`- Abschnitt: \`${finding.sectionId}\``);
    lines.push(`- Quelle: ${finding.sourceForUpdate}`);
    lines.push(`- Aktion: ${finding.suggestedAction}`);
    if (finding.suggestedLiveReferenceText) lines.push(`- Live-Referenztext/Hinweis: ${finding.suggestedLiveReferenceText}`);
    lines.push("");
  }
  fs.writeFileSync(file, finalText(lines.join("\n")));
}

export function writeLiveReferenceReports(changes = []) {
  fs.mkdirSync("docs", { recursive: true });
  fs.mkdirSync("public/data", { recursive: true });
  fs.writeFileSync("docs/LIVE_REFERENCE_SOURCE_HIERARCHY.md", finalText(sourceHierarchyDoc()));

  const deltaFindings = changes.map(issueForChange);
  const draftingFindings = scanDraftingArtifacts();
  const logicFindings = buildLogicFindings();
  const crossFindings = buildCrossDocumentFindings();
  const sourceFindings = crossFindings.map((finding) => ({ ...finding, issueType: finding.issueType === "confirmed-current" ? "confirmed-current" : "source-missing" }));

  fs.writeFileSync(
    "public/data/live-reference-changelog.json",
    `${JSON.stringify({ version: LIVE_REFERENCE_VERSION, generatedAt: new Date().toISOString(), changes }, null, 2)}\n`
  );
  fs.writeFileSync(
    "public/data/delta-review.json",
    `${JSON.stringify({ version: LIVE_REFERENCE_VERSION, generatedAt: new Date().toISOString(), findings: [...deltaFindings, ...logicFindings, ...draftingFindings, ...crossFindings] }, null, 2)}\n`
  );
  fs.writeFileSync("docs/LIVE_REFERENCE_CHANGELOG.md", formatChangeLog(changes));
  writeMarkdownReport("docs/DELTA_REVIEW_REPORT.md", "Delta-Review-Report", deltaFindings, "Dokumentiert angewandte und vorgeschlagene Änderungen der Live-Reference-Schicht.");
  writeMarkdownReport("docs/LOGIC_CONSISTENCY_REPORT.md", "Logic-Consistency-Report", logicFindings, "Prüft zentrale Logikfelder: Wirkung, Wirkungspotenzial, T-SROI/NWI, WStG/WUStG/WEstG und Wirkungseinkommen.");
  writeMarkdownReport("docs/DRAFTING_ARTIFACTS_REPORT.md", "Drafting-Artifacts-Report", draftingFindings, "Sucht nach Chat-, Prompt-, TODO- und Rohentwurfsartefakten in der Live-Referenz.");
  writeMarkdownReport("docs/CROSS_DOCUMENT_CONSISTENCY_REPORT.md", "Cross-Document-Consistency-Report", crossFindings, "Prüft, ob prioritäre Dokumente als Webfassung mit Originaldatei-Link vorhanden sind.");
  writeMarkdownReport("docs/SOURCE_LOGIC_REVIEW.md", "Source-Logic-Review", sourceFindings, "Ordnet interne Quellen nach Webfassung, Originaldatei und Status ein.");

  const completion = `# Phase 1 Live-Reference Completion

Stand: ${new Date().toISOString().slice(0, 10)}

## Was war 2026.1-import?

2026.1-import war der technische Erstimport: Hauptwerk, Kapitelrouten, Dokumentenbibliothek, Glossar, Suche, Originaldateien, IDs und Manifest wurden statisch erzeugt.

## Was ist 2026.2-live-reference?

2026.2-live-reference ist die erste sichtbare Live-Reference-Schicht. Sie erhält die Source-Original-Fassung, ergänzt aber Versionierung, Delta-Review, prioritäre Logik-Addenda, Bereinigung erkannter Arbeitsartefakte, Changelog und neue Qualitätschecks.

## Delta-reviewed Kapitel

${Array.from(priorityChapters.keys()).sort((a, b) => a - b).map((chapter) => `- Kapitel ${chapter}: ${priorityChapters.get(chapter).cluster}`).join("\n")}

## Kapitel, die source-original bleiben

Alle nicht oben genannten Kapitel bleiben inhaltlich Source-Original mit Live-Reference-Metadaten und Status \`partially-delta-reviewed\`. Sie sind weiterhin verlinkbar und manifestiert, aber noch nicht vollständig fachlich delta-reviewed.

## Aktualisierte Begriffe und Logikfelder

- Wirkung, Wirkungspotenzial, Wirkstoff, Wirkmechanismus, Wirkungspfad
- Netto-Wirkung, positive Netto-Wirkung, Transformationswirkung
- Wirkungslenkung, Wirkungsrückkopplung, Wirkungsarchitektur, Wirkungsgrenze, Wirkungswahrheit
- WÖk-ID, Scorecard, Reverse Merit Order, NWI, T-SROI
- WStG, WUStG, WEstG, Wirkungseinkommen, Wirkungsdividende, Wirkungsrente
- DPP, Lieferkette, Produktwirkung, Nachhaltigkeit als Systemarchitektur

## Gefundene und behobene Fehler/Drafting-Artefakte

${changes.filter((change) => change.type === "drafting-artifact-removal").map((change) => `- ${change.affectedRoute}: ${change.previousText}`).join("\n") || "- Keine angewandten Artefaktentfernungen."}

## Human Review

PDF-Importe mit komplexen Tabellen, ältere Archivdokumente und nicht priorisierte Kapitel bleiben \`partially-delta-reviewed\` oder \`needs-human-review\`, sofern im jeweiligen Report markiert.

## Suche

Die bestehende Website-Suche wird weiterverwendet. Suchranking priorisiert \`${LIVE_REFERENCE_VERSION}\`, aktuelle Glossarbegriffe und Kapitelrouten vor älteren Importvorkommen.

## Phase 2 bleibt ausgeschlossen

- keine Kommentare
- keine Discord-Auth
- keine Datenbank
- kein Backend
- keine Moderation
- kein dynamischer Dossier-Export
`;
  fs.writeFileSync("docs/PHASE_1_LIVE_REFERENCE_COMPLETION.md", finalText(completion));
}

export function checkLiveReferenceVersion() {
  const required = [
    "docs/LIVE_REFERENCE_SOURCE_HIERARCHY.md",
    "docs/LIVE_REFERENCE_CHANGELOG.md",
    "docs/PHASE_1_LIVE_REFERENCE_COMPLETION.md",
    "public/data/live-reference-changelog.json",
    "public/data/delta-review.json"
  ];
  const errors = required.filter((file) => !fs.existsSync(file)).map((file) => `Missing ${file}`);
  const portal = fs.existsSync("referenz/index.html") ? fs.readFileSync("referenz/index.html", "utf8") : "";
  if (/\b(?:Live-Reference|Import-Version|Source-Hash)\b/i.test(portal)) {
    errors.push("/referenz/ still exposes internal production metadata.");
  }
  const manifest = fs.existsSync("public/data/content-manifest.json") ? JSON.parse(fs.readFileSync("public/data/content-manifest.json", "utf8")) : { entries: [] };
  if (!manifest.entries?.some((entry) => entry.webVersion === LIVE_REFERENCE_VERSION)) errors.push("content-manifest does not include live-reference entries.");
  return errors;
}

export function checkLogicConsistency() {
  const errors = [];
  for (const [chapterNumber, update] of priorityChapters) {
    const matches = fs.readdirSync("referenz").filter((name) => name.startsWith(`kapitel-${String(chapterNumber).padStart(3, "0")}-`));
    const file = matches.length ? path.join("referenz", matches[0], "index.html") : "";
    const html = file && fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
    if (!html.includes(`woek-main-2026-k${String(chapterNumber).padStart(3, "0")}-lr-2026-2`)) errors.push(`Kapitel ${chapterNumber} missing live-reference addendum.`);
    for (const term of update.terms.slice(0, 2)) {
      if (!html.includes(term)) errors.push(`Kapitel ${chapterNumber} missing term in addendum/context: ${term}`);
    }
  }
  const k34 = fs.readFileSync("referenz/kapitel-034-t-sroi-und-systemische-transformationsmessung/index.html", "utf8");
  if (!k34.includes("NWI = Σᵢ wᵢ sᵢ") || !k34.includes("T-SROI = Σ<sub>t=1…T</sub>[((B<sub>direkt,t</sub> + B<sub>transformativ,t</sub>)") || !k34.includes("Σ<sub>t=0…T</sub>[(I<sub>t</sub> + K<sub>t</sub>)") || !k34.includes("PV<sub>N</sub><sup>L</sup>") || !k34.includes("(1 − u<sub>t</sub>)")) {
    errors.push("T-SROI and NWI distinction missing.");
  }
  if (/T-SROI\s*=\s*Transformationswirkung\s*[×*]|\(T_struktur\s*[×*]\s*H_sys/i.test(k34)) {
    errors.push("Chapter 34 still contains the retired T-SROI multiplier formula.");
  }
  const k38 = fs.readFileSync("referenz/kapitel-038-das-wustg-und-die-produktwirkungssteuer/index.html", "utf8");
  if (!/WStG/.test(k38) || !/WUStG/.test(k38)) errors.push("WStG/WUStG distinction missing.");
  return errors;
}

export function checkDraftingArtifacts() {
  return scanDraftingArtifacts().map((finding) => `${finding.route}: ${finding.originalText}`);
}

export function checkCrossDocumentConsistency() {
  const findings = buildCrossDocumentFindings();
  return findings.filter((finding) => finding.reviewStatus !== "confirmed-current").map((finding) => `${finding.route}: ${finding.suggestedAction}`);
}

export function checkSourceHierarchy() {
  const errors = [];
  if (!fs.existsSync("docs/LIVE_REFERENCE_SOURCE_HIERARCHY.md")) errors.push("Missing LIVE_REFERENCE_SOURCE_HIERARCHY.md");
  const hierarchy = fs.existsSync("docs/LIVE_REFERENCE_SOURCE_HIERARCHY.md") ? fs.readFileSync("docs/LIVE_REFERENCE_SOURCE_HIERARCHY.md", "utf8") : "";
  for (const needle of ["Ebene 1", "Ebene 2", "Ebene 3", "Ebene 4", TERMINOLOGY_BASE, "WOeK_Masterregister_v1.4_FINAL_2026-08-16.xlsx"]) {
    if (!hierarchy.includes(needle)) errors.push(`Source hierarchy missing ${needle}`);
  }
  return errors;
}

export function checkLiveReferenceChangelog() {
  const errors = [];
  if (!fs.existsSync("public/data/live-reference-changelog.json")) return ["Missing public/data/live-reference-changelog.json"];
  const data = JSON.parse(fs.readFileSync("public/data/live-reference-changelog.json", "utf8"));
  if (data.version !== LIVE_REFERENCE_VERSION) errors.push("Changelog has wrong version.");
  if (!Array.isArray(data.changes) || data.changes.length < priorityChapters.size) errors.push("Changelog is too small for priority clusters.");
  for (const type of ["addendum", "structural-update"]) {
    if (!data.changes.some((change) => change.type === type)) errors.push(`Changelog missing ${type}`);
  }
  return errors;
}
