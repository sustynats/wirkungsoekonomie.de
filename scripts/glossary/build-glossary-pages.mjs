import fs from "node:fs";
import path from "node:path";

const data = JSON.parse(fs.readFileSync("public/data/glossary.terms.json", "utf8"));
const navigation = JSON.parse(fs.readFileSync("assets/data/navigation.json", "utf8"));
const headerTemplate = fs.readFileSync("templates/header.html", "utf8");
const footerTemplate = fs.readFileSync("templates/footer.html", "utf8");
const outDir = "begriffe";
fs.mkdirSync(outDir, { recursive: true });
const categoryOrder = [
  "Grundbegriff",
  "Bewertungsbegriff",
  "Messbegriff",
  "Steuerungsbegriff",
  "Architekturbegriff",
  "Schutzbegriff",
  "Datenbegriff",
  "Demokratiebegriff",
  "Praxisbegriff",
];

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function navMatch(item) {
  return (item.match || []).join("|");
}

function navLink(item, base) {
  return `<a href="${base}${esc(item.href)}" data-nav-match="${esc(navMatch(item))}">${esc(item.label)}</a>`;
}

function footerGroup(group, base) {
  return `<div class="footer-nav-group">
      <h3>${esc(group.title)}</h3>
      <div class="footer-nav-links">
${group.items.map((item) => `          ${navLink(item, base)}`).join("\n")}
      </div>
    </div>`;
}

function renderHeader(base) {
  return headerTemplate
    .replaceAll("{{BASE}}", base)
    .replace("{{HEADER_NAV}}", navigation.header.map((item) => navLink(item, base)).join("\n    "));
}

function renderFooter(base) {
  return footerTemplate
    .replaceAll("{{BASE}}", base)
    .replace("{{FOOTER_NAV}}", navigation.footerGroups.map((group) => footerGroup(group, base)).join("\n    "))
    .replace("{{FOOTER_LEGAL_NAV}}", (navigation.footerLegal || []).map((item) => navLink(item, base)).join("\n"));
}

function pageShell(title, body, depth = "", options = {}) {
  const metaTitle = options.metaTitle || `${title} - Wirkungsökonomie`;
  const metaDescription = options.metaDescription || `Begriffsreferenz der Wirkungsökonomie: ${title}.`;
  return `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(metaTitle)}</title>
    <meta name="description" content="${esc(metaDescription)}">
    <link rel="stylesheet" href="${depth}assets/css/style.css?v=20260525-sprint-2">
  </head>
  <body>
${renderHeader(depth)}
    <main class="section">
${body}
    </main>
${renderFooter(depth)}
    <script src="${depth}assets/js/main.js?v=20260525-sprint-2"></script>
  </body>
</html>
`;
}

const groups = new Map();
for (const term of data.terms) {
  const letter = (term.glossaryOrderKey || term.canonicalLabel).trim()[0].toLocaleUpperCase("de");
  if (!groups.has(letter)) groups.set(letter, []);
  groups.get(letter).push(term);
}

const nav = Array.from(groups.keys()).sort(new Intl.Collator("de", { sensitivity: "base" }).compare);
const categories = categoryOrder.filter((category) => data.terms.some((term) => term.category === category));
const termsBySlug = new Map(data.terms.map((term) => [term.slug, term]));
const termTargetLinks = new Map([
  ["agenda-2030", "../../verstehen/sdgs-sdgplus/geschichte/"],
  ["sdg-sdgplus-referenzrahmen", "../../verstehen/sdgs-sdgplus/"],
  ["sdg-plus", "../../verstehen/sdgs-sdgplus/#sdgplus"],
  ["sdgs", "../../verstehen/sdgs-sdgplus/"],
  ["positive-netto-wirkung", "../../begriffe/positive-netto-wirkung/"],
  ["woek-id", "../../werkzeuge/woek-ids/"],
  ["scorecard", "../../werkzeuge/scorecards/"],
  ["reverse-merit-order", "../../werkzeuge/reverse-merit-order/"],
  ["t-sroi", "../../werkzeuge/impact-controlling/t-sroi/"],
  ["nwi", "../../werkzeuge/netto-wirkungs-index/"],
  ["wirkungsumsatzsteuer", "../../werkzeuge/wirkungsumsatzsteuer/"],
  ["wirkungssteuer", "../../werkzeuge/wirkungssteuergesetz/"],
  ["wirkungssteuergesetz", "../../werkstatt/gesetze/wirkungssteuergesetz/"],
  ["wstg", "../../werkstatt/gesetze/wirkungssteuergesetz/"],
  ["wustg", "../../werkstatt/gesetze/wirkungsumsatzsteuergesetz/"],
  ["wirkungsrat", "../../werkzeuge/wirkungsrat/"],
  ["wirkungshaushalt", "../../werkzeuge/wirkungshaushalt/"],
  ["wirkungsdatenraum", "../../werkzeuge/digitale-produktpaesse-wirkungsdatenraeume/"],
  ["digitaler-produktpass", "../../werkzeuge/digitale-produktpaesse-wirkungsdatenraeume/"],
  ["wirkungseinkommen", "../../wirkungsfelder/arbeit-einkommen/wirkungseinkommen/"],
  ["wirkungsrente", "../../wirkungsfelder/rente-soziale-sicherung/"],
  ["wohnwirkung", "../../wirkungsfelder/wohnen-stadt/"],
  ["warmmietenneutralitaet", "../../wirkungsfelder/wohnen-stadt/"],
  ["wix-vi", "../../wirkungsfelder/wohnen-stadt/investoren-vermieter/"],
  ["wirkungsvermietung", "../../wirkungsfelder/wohnen-stadt/investoren-vermieter/"],
  ["stranded-assets", "../../wirkungsfelder/wohnen-stadt/investoren-vermieter/"],
  ["spekulationslogik", "../../wirkungsfelder/wohnen-stadt/investoren-vermieter/"],
  ["csrd", "../../wirkungsfelder/wirtschaft-unternehmen/finanzmarktanforderungen/"],
  ["esrs", "../../wirkungsfelder/wirtschaft-unternehmen/finanzmarktanforderungen/"],
  ["eu-taxonomie", "../../wirkungsfelder/finanzsystem-kapital/"],
  ["esg", "../../wirkungsfelder/wirtschaft-unternehmen/finanzmarktanforderungen/"],
  ["social-taxonomy", "../../bibliothek/social-taxonomy-wirkungsoekonomie/"],
]);

function termLink(slug) {
  const term = termsBySlug.get(slug);
  if (!term) return `<span class="term-chip muted">${esc(slug)}</span>`;
  return `<a class="term-chip" href="../../begriffe/${esc(term.slug)}/">${esc(term.canonicalLabel)}</a>`;
}

function listItems(values, fallback = "Keine Einträge") {
  if (!Array.isArray(values) || values.length === 0) return `<p>${esc(fallback)}</p>`;
  return `<ul class="clean-list">${values.map((value) => `<li>${esc(value)}</li>`).join("")}</ul>`;
}

const centralTermDetails = new Map([
  ["wirkung", ["Sie macht sichtbar, ob sich Zustände tatsächlich verändern, statt nur Aktivität, Geld oder Reichweite zu zählen.", "Nicht jede Wirkung ist positiv. Der Begriff ist neutral und braucht Bewertung.", "Ein billiges Produkt kann verkauft werden und trotzdem Wasser, Gesundheit oder Arbeitsrechte belasten.", ["Wirkung ist kein Gütesiegel.", "Wirkung ersetzt keine demokratische Entscheidung."], [["Kompass", "../../kompass.html"], ["WÖk-Scanner", "../../anwendungen/scanner.html"]], [["Wirkungsfelder", "../../wirkungsfelder/"]]]],
  ["wirkungspotenzial", ["Es hilft, frühe Hinweise zu Wirkungspfaden zu erkennen, ohne eine endgültige Bewertung vorzutäuschen.", "Potenzial ist keine Faktenprüfung, keine Zertifizierung und kein fertiger Score.", "Ein Medienbeitrag kann Polarisierungspotenzial haben, ohne dass jede Reaktion vorhergesagt wird.", ["Potenzial ist nicht Ergebnis.", "Ein Prüfhinweis ist kein Urteil."], [["WÖk-Scanner", "../../anwendungen/scanner.html"]], [["Medien & Öffentlichkeit", "../../wirkungsfelder/medien-oeffentlichkeit/"]]]],
  ["positive-netto-wirkung", ["Sie verhindert, dass einzelne gute Effekte schwere Schäden überdecken.", "Positive Netto-Wirkung ist keine Schönrechnung und kein einfacher Durchschnitt.", "Ein klimafreundliches Produkt kann wegen schwerer Arbeitsrechtsprobleme trotzdem kritisch bleiben.", ["Netto heißt nicht, dass alles verrechnet werden darf.", "Wirkungsgrenzen bleiben wirksam."], [["Reverse Merit Order", "../../werkzeuge/reverse-merit-order/"], ["Scorecards", "../../werkzeuge/scorecards/"]], [["Produkte & Konsum", "../../wirkungsfelder/produkte-konsum/"]]]],
  ["wirkungsrueckkopplung", ["Sie macht Wirkung entscheidungsrelevant, indem sie in Preise, Budgets, Kapital oder Regeln zurückgeführt wird.", "Sie ist keine zentrale Planwirtschaft und keine automatische Entscheidung.", "Eine Produktsteuer kann steigen oder sinken, wenn geprüfte Produktwirkung schlechter oder besser wird.", ["Rückkopplung ist nicht nur Strafe.", "Rechtsschutz und demokratische Kontrolle bleiben nötig."], [["Wirkungsumsatzsteuer", "../../werkzeuge/wirkungsumsatzsteuer/"], ["Automatisierungsrechner", "../../erleben/automatisierungs-wirkungseinkommensrechner/"]], [["Arbeit & Einkommen", "../../wirkungsfelder/arbeit-einkommen/"]]]],
  ["wirkungsblindheit", ["Sie erklärt, warum schädliche Folgen wirtschaftlich erfolgreich erscheinen können.", "Wirkungsblindheit ist kein Absichtsvorwurf gegen einzelne Personen.", "Ein Algorithmus optimiert Klicks und übersieht Vertrauen, Diskursqualität oder Polarisierung.", ["Blindheit heißt nicht, dass keine Wirkung existiert.", "Sie heißt: Die Wirkung fehlt im Steuerungssystem."], [["WÖk-Scanner", "../../anwendungen/scanner.html"]], [["Digitalisierung & KI", "../../portale/digitalisierung-ki-wirkungsdatenraeume/"]]]],
  ["reverse-merit-order", ["Sie schützt vor dem Schönrechnen schwerer Schäden durch gute Werte an anderer Stelle.", "Sie ist kein einfacher Durchschnitt und keine Strafliste.", "Gute Klimawerte heben schwere Kinderrechtsverletzungen in einer Lieferkette nicht auf.", ["Nicht jede Schwäche blockiert alles.", "Entscheidend sind definierte Wirkungsgrenzen."], [["Reverse Merit Order", "../../werkzeuge/reverse-merit-order/"], ["Produktwirkung testen", "../../erleben.html#simulator"]], [["Produkte & Konsum", "../../wirkungsfelder/produkte-konsum/"]]]],
  ["nwi", ["Er verdichtet Wirkungsdimensionen zu Orientierung, ohne Detailprüfung zu ersetzen.", "Der NWI ist kein ESG-Rating und keine amtliche Zertifizierung.", "Ein Projekt kann einen NWI als Übersicht erhalten, während kritische Einzelfelder separat sichtbar bleiben.", ["Ein Index ist keine Wahrheitstabelle.", "Datenqualität bleibt entscheidend."], [["NWI Methodik", "../../werkzeuge/netto-wirkungs-index/"], ["Impact Controlling", "../../werkzeuge/impact-controlling/"]], [["Wirtschaft & Unternehmen", "../../wirkungsfelder/wirtschaft-unternehmen/"]]]],
  ["t-sroi", ["Er macht vermiedene Schäden, Transformation und Stabilität als Investitionslogik diskutierbar.", "T-SROI ist keine sichere Renditeprognose und keine Anlageberatung.", "Prävention kann Folgekosten vermeiden, obwohl Kosten und Nutzen in verschiedenen Haushalten liegen.", ["Monetarisierung ist Hilfssprache.", "Unsicherheit muss sichtbar bleiben."], [["T-SROI", "../../werkzeuge/impact-controlling/t-sroi/"]], [["Gesundheit & Pflege", "../../wirkungsfelder/gesundheit-pflege/"]]]],
  ["woek-id", ["Sie macht Indikatoren nachvollziehbar, versioniert und prüfbar.", "Eine WÖk-ID ist keine Personen-ID und kein Trackinginstrument.", "Ein Wasserindikator braucht Einheit, Quelle, Zeitraum, Schwelle und Bewertungslogik.", ["Die ID bewertet nicht selbst.", "Sie macht die Datenbasis prüfbar."], [["WÖk-IDs", "../../werkzeuge/woek-ids/"]], [["Produkte & Konsum", "../../wirkungsfelder/produkte-konsum/"]]]],
  ["scorecard", ["Sie zeigt starke, schwache und kritische Wirkungsfelder nebeneinander.", "Eine Scorecard ist kein Urteil über Menschen und kein endgültiges Gütesiegel.", "Eine Produktscorecard kann Klima, Wasser, Arbeit, Gesundheit und Kreislauf getrennt darstellen.", ["Der Gesamtscore darf Schwachstellen nicht verdecken.", "Scorecards brauchen Interpretation."], [["Scorecards", "../../werkzeuge/scorecards/"], ["Produktwirkung testen", "../../erleben.html#simulator"]], [["Wirtschaft & Unternehmen", "../../wirkungsfelder/wirtschaft-unternehmen/"]]]],
  ["faktencheck", ["Er schützt gemeinsame Wirklichkeit, indem er Behauptungen an Quellen, Daten und Kontext zurückbindet.", "Ein Faktencheck ist keine Folgenbewertung und keine Garantie, dass eine Aussage gesellschaftlich unschädlich wirkt.", "Die Aussage 'Die Arbeitslosenquote ist gesunken' wird mit Statistik, Erhebungsmethode und Kontext abgeglichen.", ["Faktencheck ersetzt nicht Folgencheck.", "Richtigkeit allein beantwortet noch nicht die Wirkungsfrage."], [["WÖk-Scanner", "../../anwendungen/scanner.html"]], [["Medien & Öffentlichkeit", "../../wirkungsfelder/medien-oeffentlichkeit/"]]]],
  ["folgencheck", ["Er macht mögliche Wirkungen sichtbar, bevor Schäden, Nebenwirkungen oder Systemfolgen vollständig eingetreten sind.", "Der Folgencheck ist keine Zensur, keine Personenbewertung und kein Wahrheitsmonopol.", "Eine faktisch richtige Aussage kann trotzdem polarisierend wirken, wenn sie einseitig gerahmt, strategisch wiederholt oder aus dem Kontext gelöst wird.", ["Folgencheck prüft Wirkungspotenziale, keine Gesinnungen.", "Er ersetzt demokratische Entscheidungen nicht, sondern bereitet sie besser vor."], [["WÖk-Scanner", "../../anwendungen/scanner.html"], ["Medienwirkung prüfen", "../../erleben.html#medienwirkung"]], [["Medien & Öffentlichkeit", "../../wirkungsfelder/medien-oeffentlichkeit/"], ["Staat, Recht & Demokratie", "../../wirkungsfelder/staat-recht-demokratie/"]]]],
  ["idgs", ["Sie beschreiben innere und soziale Fähigkeiten, die Menschen und Organisationen brauchen, damit Transformation nicht nur als Ziel, sondern als Fähigkeit entsteht.", "IDGs sind kein Ersatz für SDGs, SDG+ oder Wirkungskompetenz und kein offizieller UN-Zielrahmen.", "Eine Verwaltung kann IDG-Kompetenzen nutzen, um Konflikte, Unsicherheit und Kooperation in Transformationsprozessen besser zu tragen.", ["IDGs sind kein Messsystem für Wirkung.", "Sie erklären Fähigkeiten, nicht Zielerreichung."], [["Akademie", "../../akademie.html"], ["Kompass", "../../kompass.html"]], [["Bildung", "../../wirkungsfelder/bildung/"], ["Wissenschaft & Innovation", "../../wirkungsfelder/wissenschaft-innovation-digitalisierung/"]]]],
  ["wirkungseinkommen", ["Es zeigt, wie Einkommen und Teilhabe auch jenseits reiner Erwerbsarbeit gedacht werden können.", "Es ist kein fertiges Grundeinkommen und keine Finanzierungszusage.", "Automatisierte Wertschöpfung kann modellhaft in Fonds, Weiterbildung und Einkommensanteile zurückgeführt werden.", ["Das Tool erzeugt kein Geld.", "Es zeigt Rückkopplungslogik, keine amtlichen Ansprüche."], [["Automatisierungsrechner", "../../erleben/automatisierungs-wirkungseinkommensrechner/"]], [["Arbeit & Einkommen", "../../wirkungsfelder/arbeit-einkommen/"]]]],
  ["wirkungsfonds", ["Er bündelt Rückflüsse, damit Prävention, Bildung, Transformation oder Sicherung finanzierbar werden.", "Ein Wirkungsfonds ist kein Geld aus dem Nichts und kein Schattenhaushalt.", "Rückflüsse aus automatisierter Wertschöpfung können Weiterbildung und Übergangsschutz finanzieren.", ["Fonds ersetzen keine Haushaltsentscheidungen.", "Finanzierungsquellen müssen offen bleiben."], [["Wirkungsfonds", "../../werkzeuge/wirkungsfonds/"], ["Automatisierungsrechner", "../../erleben/automatisierungs-wirkungseinkommensrechner/"]], [["Arbeit & Einkommen", "../../wirkungsfelder/arbeit-einkommen/"]]]],
  ["wirkungshaushalt", ["Er zeigt, ob öffentliche Mittel Zustände verbessern oder nur ausgegeben werden.", "Ein Wirkungshaushalt ersetzt keine Parlamente und kein Haushaltsrecht.", "Vermiedene Krankheit kann als Präventionswirkung in Haushalten sichtbar werden.", ["Wirkungshaushalte brauchen Evaluation.", "Grundrechte dürfen nicht durch Kennzahlen ersetzt werden."], [["Wirkungshaushalt", "../../werkzeuge/wirkungshaushalt/"]], [["Gesundheit & Pflege", "../../wirkungsfelder/gesundheit-pflege/"]]]],
  ["wirkungsdatenraum", ["Er macht Wirkung prüfbar, ohne Datenschutz und Zweckbindung aufzugeben.", "Ein Wirkungsdatenraum ist kein ungeschützter Datenpool und kein Personen-Scoring.", "Ein Produktpass kann Klima- und Lieferkettendaten bereitstellen, ohne personenbezogene Daten offenzulegen.", ["Mehr Daten sind nicht automatisch bessere Wirkung.", "Rechte und Datenqualität sind Teil der Wirkung."], [["Digitale Produktpässe", "../../werkzeuge/digitale-produktpaesse-wirkungsdatenraeume/"]], [["Digitalisierung & KI", "../../portale/digitalisierung-ki-wirkungsdatenraeume/"]]]],
  ["wirkungskompetenz", ["Sie macht Menschen und Organisationen fähig, Folgen, Zielkonflikte und Datenqualität zu verstehen.", "Wirkungskompetenz ist keine Ideologie und keine zentrale Wissensverwaltung.", "Schüler:innen lernen zu unterscheiden, ob ein Projekt nur Output erzeugt oder Zustände verbessert.", ["Kompetenz heißt nicht Kontrolle.", "Sie stärkt Urteilskraft und Teilhabe."], [["Akademie", "../../akademie.html"], ["Wirkungsschule-Check", "../../erleben/wirkungsschule-check/"]], [["Bildung", "../../wirkungsfelder/bildung/"]]]],
]);

function linkedChips(items, fallback = "Keine Einträge") {
  if (!Array.isArray(items) || items.length === 0) return `<p>${esc(fallback)}</p>`;
  return `<div class="term-chip-row">${items.map(([label, href]) => `<a class="term-chip" href="${esc(href)}">${esc(label)}</a>`).join("")}</div>`;
}

function learningBlock(term) {
  const detail = centralTermDetails.get(term.slug);
  if (!detail) return "";
  const [why, notMeaning, example, misconceptions, tools, fields] = detail;
  return `<section class="term-summary-card" aria-labelledby="learning-${esc(term.slug)}">
          <h2 id="learning-${esc(term.slug)}">Lernpfad zu ${esc(term.canonicalLabel)}</h2>
          <div class="term-section-grid">
            <section class="term-section-card"><p class="section-eyebrow">Warum wichtig?</p><h3>Was macht der Begriff sichtbar?</h3><p>${esc(why)}</p></section>
            <section class="term-section-card"><p class="section-eyebrow">Abgrenzung</p><h3>Was es nicht bedeutet</h3><p>${esc(notMeaning)}</p></section>
            <section class="term-section-card"><p class="section-eyebrow">Beispiel</p><h3>So wird es konkret</h3><p>${esc(example)}</p></section>
            <section class="term-section-card"><p class="section-eyebrow">Missverständnisse</p><h3>Worauf achten?</h3>${listItems(misconceptions)}</section>
          </div>
          <div class="term-section-grid">
            <section class="term-section-card"><h3>Passende Tools</h3>${linkedChips(tools)}</section>
            <section class="term-section-card"><h3>Passende Wirkungsfelder</h3>${linkedChips(fields)}</section>
          </div>
        </section>`;
}

function termExtraBlock(term) {
  if (term.termId === "folgencheck") {
    const steps = [
      ["1. Gegenstand klären", "Was wird geprüft: Aussage, Maßnahme, Gesetz, Produkt, Technologie, Kapitalfluss oder Medienbeitrag?"],
      ["2. Ausgangszustand beschreiben", "Welche Situation besteht vorher und welche Vergleichsbasis ist relevant?"],
      ["3. Wirkungsempfänger bestimmen", "Wer oder was kann betroffen sein: Menschen, Gruppen, Institutionen, Märkte, Ökosysteme oder Demokratie?"],
      ["4. Wirkstoffe erkennen", "Welche Sprache, Anreize, Technik, Preise, Regeln oder Frames können Wirkung auslösen?"],
      ["5. Wirkungspfade sichtbar machen", "Über welche Mechanismen entstehen direkte, indirekte oder zeitverzögerte Folgen?"],
      ["6. Wirkungsräume prüfen", "In welchen Räumen wirkt es: sozial, ökologisch, wirtschaftlich, medial, politisch, digital oder kommunal?"],
      ["7. Nebenwirkungen und Rebound prüfen", "Wird Schaden verlagert, verstärkt oder nur unsichtbar gemacht?"],
      ["8. Datenqualität markieren", "Was ist belegt, plausibel, unklar oder unbekannt?"],
      ["9. Schutzgrenzen prüfen", "Wo dürfen Grundrechte, Würde, Datenschutz, Minderheitenschutz oder demokratische Kontrolle nicht überschritten werden?"],
      ["10. Handlungsoptionen ableiten", "Welche nächsten Fragen, Korrekturen, Gegenmaßnahmen oder Rückkopplungen ergeben sich?"],
    ];
    return `<section class="term-summary-card" aria-labelledby="folgencheck-compare">
          <h2 id="folgencheck-compare">Faktencheck vs. Folgencheck</h2>
          <div class="table-wrap" role="region" aria-label="Faktencheck und Folgencheck im Vergleich" tabindex="0">
            <table>
              <thead><tr><th>Prüfung</th><th>Leitfrage</th><th>Prüft</th><th>Ergebnis</th></tr></thead>
              <tbody>
                <tr><td>Faktencheck</td><td>Stimmt das?</td><td>Quellen, Daten, Belege, Kontext, Richtigkeit.</td><td>Wahr, falsch, unbelegt, verkürzt oder irreführend.</td></tr>
                <tr><td>Folgencheck</td><td>Was kann das auslösen?</td><td>Wirkstoffe, Wirkungspotenziale, Wirkungspfade, Betroffene, Systemfolgen und Datenlücken.</td><td>Positive, negative, neutrale oder ambivalente Wirkungspotenziale sowie Schutzgrenzen.</td></tr>
                <tr><td>Wirkungsbewertung</td><td>Wie ist die Wirkung einzuordnen?</td><td>SDGs, SDG+, Mensch, Planet, Demokratie und definierte Wirkungsgrenzen.</td><td>Einordnung im Referenzrahmen.</td></tr>
                <tr><td>Wirkungsrückkopplung</td><td>Was folgt daraus?</td><td>Entscheidungen, Preise, Regeln, Förderung, Kommunikation oder Korrektur.</td><td>Handlungsoptionen und Verantwortungspunkte.</td></tr>
              </tbody>
            </table>
          </div>
        </section>
        <section class="term-summary-card" aria-labelledby="folgencheck-steps">
          <h2 id="folgencheck-steps">10-Schritte-Modell des Folgenchecks</h2>
          <div class="term-section-grid">
            ${steps.map(([title, text]) => `<section class="term-section-card"><h3>${esc(title)}</h3><p>${esc(text)}</p></section>`).join("")}
          </div>
        </section>
        <section class="term-summary-card" aria-labelledby="folgencheck-examples">
          <h2 id="folgencheck-examples">Beispiele</h2>
          <div class="term-section-grid">
            <section class="term-section-card"><h3>Politische Aussage</h3><p><strong>Faktencheck:</strong> Stimmt die Zahl? <strong>Folgencheck:</strong> Wer wird sichtbar oder unsichtbar, etwa prekäre Beschäftigung, Teilzeit oder stille Reserve?</p></section>
            <section class="term-section-card"><h3>Produkt</h3><p><strong>Faktencheck:</strong> Welche Bilanz liegt vor? <strong>Folgencheck:</strong> Werden Wasser, Biodiversität, Arbeitsrechte oder Gesundheit verdeckt?</p></section>
            <section class="term-section-card"><h3>Gesetz</h3><p><strong>Faktencheck:</strong> Stimmt die fiskalische Annahme? <strong>Folgencheck:</strong> Wer profitiert, wer trägt Kosten und welche Fehlanreize entstehen?</p></section>
            <section class="term-section-card"><h3>Plattform</h3><p><strong>Faktencheck:</strong> Stimmt die Reichweitenzahl? <strong>Folgencheck:</strong> Verstärkt der Mechanismus Polarisierung, Sucht, Desinformation oder demokratische Teilhabe?</p></section>
          </div>
        </section>`;
  }
  if (term.termId === "faktencheck") {
    return `<section class="term-summary-card" aria-labelledby="facts-and-effects">
          <h2 id="facts-and-effects">Warum Faktencheck und Folgencheck zusammengehören</h2>
          <p>Ein Faktencheck ist die Grundlage: Ohne überprüfbare Quellen, Kontext und Richtigkeit entsteht keine belastbare öffentliche Orientierung. Die Wirkungsökonomie ergänzt diese Prüfung um den Folgencheck, weil auch faktisch richtige Aussagen Wirkungen entfalten können.</p>
          <div class="term-section-grid">
            <section class="term-section-card"><h3>Faktencheck fragt</h3><p>Stimmt das? Ist es belegt, verkürzt, irreführend oder aus dem Zusammenhang gerissen?</p></section>
            <section class="term-section-card"><h3>Folgencheck fragt</h3><p>Was kann das auslösen? Welche Wirkungspotenziale, Zielkonflikte, Datenlücken oder Schutzgrenzen werden sichtbar?</p></section>
          </div>
        </section>`;
  }
  if (term.termId === "idgs") {
    return `<section class="term-summary-card" aria-labelledby="idgs-wirkungskompetenz">
          <h2 id="idgs-wirkungskompetenz">Verhältnis zu Wirkungskompetenz</h2>
          <p>Die IDGs beschreiben wichtige innere und soziale Entwicklungsfähigkeiten. Wirkungskompetenz knüpft daran an, geht aber weiter: Sie verbindet innere Entwicklung mit Daten, Systemen, Demokratie, Technologie, Institutionen, Wirkungsmessung und Rückkopplung.</p>
          <p>In der Wirkungsökonomie sind IDGs deshalb ein Anschlussrahmen. Wirkungskompetenz ist die operative Fähigkeit, Wirkungen, Wirkungspotenziale, Nebenwirkungen, Unsicherheit und Verantwortung in konkreten Entscheidungen zu erkennen und zu gestalten.</p>
        </section>`;
  }
  if (term.termId !== "mensch-planet-demokratie") return "";
  return `<section class="term-summary-card" aria-labelledby="sdg-context-title">
          <h2 id="sdg-context-title">Warum nicht einfach nur SDGs sagen?</h2>
          <p>Die SDGs und die Agenda 2030 sind der globale Referenzrahmen. Sie sind fachlich wichtig und politisch anschlussfähig. In der öffentlichen Kommunikation sind sie jedoch oft zu abstrakt. Viele Menschen kennen weder die Agenda 2030 noch die Bedeutung der einzelnen SDGs.</p>
          <p>Die Wirkungsökonomie nutzt deshalb den Dreiklang Mensch, Planet und Demokratie. Er macht verständlich, was die Zielstruktur bedeutet: gutes Leben und Teilhabe für Menschen, Schutz und Regeneration des Planeten sowie starke demokratische Institutionen, Medienqualität, Rechtsstaatlichkeit und gesellschaftlichen Zusammenhalt.</p>
          <p>SDG+ ist keine UN-Kategorie. SDG+ ist eine transparente Erweiterung der Wirkungsökonomie für Demokratie, Medienqualität, Rechtsstaatlichkeit, Diskursfähigkeit, institutionelles Vertrauen, gesellschaftlichen Zusammenhalt und digitale Selbstbestimmung.</p>
          <p>Mensch, Planet und Demokratie ist damit die kommunikative Übersetzung von SDGs, Agenda 2030 und SDG+.</p>
          <div class="table-wrap" role="region" aria-label="Verhältnis von Referenzrahmen, Übersetzung und Zielgröße" tabindex="0">
            <table>
              <thead>
                <tr>
                  <th>Ebene</th>
                  <th>Bezeichnung</th>
                  <th>Bedeutung</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Fachlicher Referenzrahmen</td>
                  <td><a class="text-link" href="../../begriffe/sdgs/">SDGs</a>, <a class="text-link" href="../../begriffe/agenda-2030/">Agenda 2030</a> und <a class="text-link" href="../../begriffe/sdg-plus/">SDG+</a></td>
                  <td>Globale Nachhaltigkeitsziele plus transparente WÖk-Erweiterung für demokratische Voraussetzungen nachhaltiger Entwicklung.</td>
                </tr>
                <tr>
                  <td>Kommunikative Übersetzung</td>
                  <td>Mensch, Planet und Demokratie</td>
                  <td>Drei verständliche Oberbegriffe für soziale, ökologische und demokratische Wirkung.</td>
                </tr>
                <tr>
                  <td>Zielgröße der Wirkungsökonomie</td>
                  <td><a class="text-link" href="../../begriffe/positive-netto-wirkung/">Positive Netto-Wirkung</a> für Mensch, Planet und Demokratie</td>
                  <td>Handlungen, Produkte, Institutionen, Kapitalflüsse und Entscheidungen werden daran ausgerichtet, diese drei Dimensionen zu stärken.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>`;
}

function termLead(term) {
  if (term.termId === "mensch-planet-demokratie") {
    return "Mensch, Planet und Demokratie sind die verständliche Zusammenfassung der SDGs, der Agenda 2030 und der SDG+-Erweiterung der Wirkungsökonomie. Der Dreiklang übersetzt den fachlichen Referenzrahmen in eine Sprache, die öffentlich anschlussfähig ist.";
  }
  return term.shortDefinition;
}

function termSummary(term) {
  if (term.termId === "mensch-planet-demokratie") {
    return "Mensch, Planet und Demokratie sind die drei Oberbegriffe, unter denen die Wirkungsökonomie die SDGs, die Agenda 2030 und SDG+ zusammenfasst. Fachlich bleibt der Referenzrahmen SDGs, Agenda 2030 und SDG+. Kommunikativ wird daraus: Wirkung für Mensch, Planet und Demokratie.";
  }
  return term.hoverDefinition;
}

function termDefinitionHtml(term) {
  if (term.termId === "mensch-planet-demokratie") {
    return `<p>Der Begriff bezeichnet die drei übergeordneten Wirkungsdimensionen der Wirkungsökonomie. Mensch steht für soziale Gerechtigkeit, Gesundheit, Bildung, Teilhabe, Würde und Sicherheit. Planet steht für Klima, Ressourcen, Wasser, Boden, Biodiversität, Energie und Regeneration. Demokratie steht für Rechtsstaatlichkeit, Medienqualität, Diskursfähigkeit, institutionelles Vertrauen, gesellschaftlichen Zusammenhalt und digitale Selbstbestimmung.</p>
            <p>Damit sind Mensch, Planet und Demokratie keine zusätzlichen UN-Ziele. Sie sind die kommunikative Ordnung, mit der die Wirkungsökonomie die SDGs, die Agenda 2030 und SDG+ verständlich zusammenführt.</p>`;
  }
  return `<p>${esc(term.longDefinition)}</p>`;
}

function termWhyHtml(term) {
  if (term.termId === "mensch-planet-demokratie") {
    return `<p>Die SDGs und die Agenda 2030 sind fachlich zentral, aber in der Bevölkerung wenig bekannt. Für öffentliche Kommunikation braucht die Wirkungsökonomie deshalb eine einfache, klare und wiedererkennbare Sprache. Mensch, Planet und Demokratie macht sichtbar, worum es geht: nicht um abstrakte Zielnummern, sondern um Lebensqualität, ökologische Stabilität und demokratische Handlungsfähigkeit.</p>
            <p>Der Dreiklang ersetzt die SDGs nicht. Er übersetzt sie.</p>`;
  }
  return `<p>${esc(term.preferredUsage || term.usageNote || "Der Begriff hilft, Wirkung, Bewertung und Rückkopplung präzise zu unterscheiden.")}</p>`;
}

function termUsageHtml(term) {
  if (term.termId === "mensch-planet-demokratie") {
    return `<p>Mensch, Planet und Demokratie nicht als Zusatz-Ziel neben den SDGs verwenden. Der Dreiklang ist die öffentliche Übersetzung des fachlichen Referenzrahmens und bleibt an Wirkung, Wirkungsbewertung und positive Netto-Wirkung gebunden.</p>`;
  }
  return `<p>${esc(term.usageNote)}</p>`;
}

function detailLinks(term) {
  const links = [];
  const target = termTargetLinks.get(term.slug);
  if (target) links.push({ href: target, label: "Themenseite öffnen" });
  links.push({ href: "../../begriffe/", label: "Alle Begriffe" });
  links.push({ href: `../../suche.html?q=${encodeURIComponent(term.canonicalLabel)}`, label: "Website durchsuchen" });
  return links
    .map((link, index) => `<a class="btn ${index === 0 ? "btn-primary" : "btn-secondary"}" href="${esc(link.href)}">${esc(link.label)}</a>`)
    .join("");
}

const indexBody = `      <section class="hero compact-hero">
        <p class="hero-kicker">WÖk-Referenzsystem</p>
        <h1>Begriffe der Wirkungsökonomie</h1>
        <p class="hero-subtitle">Alphabetische Begriffsschicht für Hoverdefinitionen, Crosslinks, Terminologieprüfung, Suche und spätere PDF-Glossare.</p>
        <p class="notice">Die Begriffe dieser Seite folgen dem Führenden Begriffsleitfaden der Wirkungsökonomie, Version 1.0, Stand 21. Mai 2026. Ältere Projektdateien können frühere Begriffsverwendungen enthalten.</p>
      </section>
      <section class="content-band glossary-filter-panel" aria-labelledby="glossary-filter-title">
        <h2 id="glossary-filter-title">Begriffe filtern</h2>
        <label>
          <span class="sr-only">Glossar durchsuchen</span>
          <input type="search" placeholder="Begriff, Alias oder Definition suchen" data-glossary-search>
        </label>
        <div class="filter-chip-row" aria-label="Begriffskategorien">
          <button type="button" class="active" data-glossary-category="all">Alle</button>
          ${categories.map((category) => `<button type="button" data-glossary-category="${esc(category)}">${esc(category.replace("begriff", ""))}</button>`).join("")}
        </div>
        <p class="reference-filter-status" data-glossary-filter-status></p>
      </section>
      <nav class="az-nav" aria-label="Alphabetische Navigation">
        ${nav.map((letter) => `<a href="#${esc(letter)}">${esc(letter)}</a>`).join(" ")}
      </nav>
      ${nav.map((letter) => {
        const items = groups.get(letter);
        return `<section id="${esc(letter)}" class="content-band">
        <h2>${esc(letter)}</h2>
        <div class="card-grid">${items.map((term) => `<article class="info-card" data-glossary-card data-category="${esc(term.category || "")}" data-search="${esc([term.canonicalLabel, term.shortDefinition, term.hoverDefinition, ...(term.synonyms || [])].join(" ").toLowerCase())}">
          <h3><a href="${esc(term.slug)}/">${esc(term.canonicalLabel)}</a></h3>
          <p>${esc(term.shortDefinition)}</p>
          <p class="meta-line">${esc(term.category || "Begriff")} · ${esc(term.status)} · Version ${esc(term.version)}</p>
        </article>`).join("")}</div>
      </section>`;
      }).join("\n")}
      <script>
        (() => {
          const search = document.querySelector("[data-glossary-search]");
          const buttons = Array.from(document.querySelectorAll("[data-glossary-category]"));
          const cards = Array.from(document.querySelectorAll("[data-glossary-card]"));
          const status = document.querySelector("[data-glossary-filter-status]");
          let active = "all";
          function apply() {
            const q = search instanceof HTMLInputElement ? search.value.trim().toLowerCase() : "";
            let visible = 0;
            cards.forEach((card) => {
              const categoryMatch = active === "all" || card.dataset.category === active;
              const textMatch = !q || (card.dataset.search || card.textContent || "").toLowerCase().includes(q);
              const show = categoryMatch && textMatch;
              card.hidden = !show;
              if (show) visible += 1;
            });
            if (status) status.textContent = visible + " Begriffe sichtbar";
          }
          buttons.forEach((button) => button.addEventListener("click", () => {
            active = button.dataset.glossaryCategory || "all";
            buttons.forEach((item) => item.classList.toggle("active", item === button));
            apply();
          }));
          search?.addEventListener("input", apply);
          apply();
        })();
      </script>`;

fs.writeFileSync(path.join(outDir, "index.html"), pageShell("Begriffe", indexBody, "../"));

for (const term of data.terms) {
  const dir = path.join(outDir, term.slug);
  fs.mkdirSync(dir, { recursive: true });
  const body = `      <article class="article-shell glossary-detail">
        <nav class="breadcrumb"><a href="../">Begriffe</a> / ${esc(term.canonicalLabel)}</nav>
        <header class="term-detail-hero">
          <p class="hero-kicker">${esc(term.category || "Begriff")}</p>
          <h1>${esc(term.canonicalLabel)}</h1>
          <p class="lead">${esc(termLead(term))}</p>
          <div class="term-meta-row" aria-label="Begriffsinformation">
            <span>Version ${esc(term.version)}</span>
          </div>
          <div class="term-action-row">${detailLinks(term)}</div>
        </header>
        <section class="term-summary-card" aria-labelledby="term-summary-title">
          <h2 id="term-summary-title">Auf einen Blick</h2>
          <p>${esc(termSummary(term))}</p>
        </section>
        <div class="term-section-grid">
          <section class="term-section-card">
            <p class="section-eyebrow">Definition</p>
            <h2>Was bedeutet der Begriff?</h2>
            ${termDefinitionHtml(term)}
          </section>
          <section class="term-section-card">
            <p class="section-eyebrow">Wirkungsökonomie</p>
            <h2>Warum ist das wichtig?</h2>
            ${termWhyHtml(term)}
          </section>
          <section class="term-section-card">
            <p class="section-eyebrow">Verwendung</p>
            <h2>So wird der Begriff genutzt</h2>
            ${termUsageHtml(term)}
          </section>
          <section class="term-section-card">
            <p class="section-eyebrow">Abgrenzung</p>
            <h2>Nicht verwechseln mit</h2>
            ${listItems(term.doNotConfuseWith)}
          </section>
        </div>
${termExtraBlock(term)}
${learningBlock(term)}
        <section class="term-link-section" aria-labelledby="related-terms-title">
          <div>
            <p class="section-eyebrow">Verknüpfungen</p>
            <h2 id="related-terms-title">Verwandte Begriffe</h2>
          </div>
          <div class="term-chip-row">
            ${(term.relatedTerms || []).length ? term.relatedTerms.map(termLink).join("") : "<span class=\"term-chip muted\">Keine Einträge</span>"}
          </div>
        </section>
        <section class="term-link-section" aria-labelledby="chapters-title">
          <div>
            <p class="section-eyebrow">Online-Buch</p>
            <h2 id="chapters-title">Relevante Kapitel</h2>
          </div>
          <div class="term-chip-row">
            ${(term.relatedChapters || []).length
              ? term.relatedChapters.map((chapter) => `<span class="term-chip muted">${esc(chapter)}</span>`).join("")
              : `<a class="term-chip" href="../../referenz/">Kapitel-Navigator öffnen</a>`}
          </div>
        </section>
        <section class="meta-box">
          <h2>Version und Quelle</h2>
          <p>Kategorie: ${esc(term.category || "Begriff")} · Version: ${esc(term.version)}</p>
          <p>Quelle: ${esc(term.sourceDocument)} · Abschnitt: ${esc(term.sourceSection)}</p>
        </section>
      </article>`;
  const pageOptions = term.termId === "mensch-planet-demokratie"
    ? {
        metaTitle: "Mensch, Planet und Demokratie - verständliche Übersetzung von SDGs und SDG+",
        metaDescription: "Mensch, Planet und Demokratie sind die drei Oberbegriffe, mit denen die Wirkungsökonomie SDGs, Agenda 2030 und SDG+ öffentlich verständlich zusammenfasst.",
      }
    : {};
  fs.writeFileSync(path.join(dir, "index.html"), pageShell(term.canonicalLabel, body, "../../", pageOptions));
}

console.log(`Wrote glossary index and ${data.terms.length} term pages.`);
