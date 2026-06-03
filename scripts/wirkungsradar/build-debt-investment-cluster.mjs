import fs from "node:fs";
import path from "node:path";

const UPDATED_AT = "2026-06-03";
const ASSET_VERSION = "20260603-debt-investment";

const sourceCards = [
  ["Bundesfinanzministerium - Finanzierungspaket 2025", "Sondervermögen Infrastruktur von bis zu 500 Mrd. Euro über zwölf Jahre; Mittel sollen zusätzlich zu Investitionen im Bundeshaushalt eingesetzt werden.", "Faktenbasis zur neuen deutschen Finanzlage.", "Zusätzlichkeit und Wirkung müssen kontrolliert werden.", "https://www.bundesfinanzministerium.de/Monatsberichte/Ausgabe/2025/04/Kapitel/kapitel-2a-finanzierungspaket.html", "2025-04"],
  ["Bundestag - Grundgesetzänderungen 2025", "Höhere Verteidigungsausgaben, Sondervermögen Infrastruktur und Verschuldungsspielraum für Länder.", "Verfassungs- und Haushaltsrahmen.", "Politische Beschlüsse ersetzen keine Wirkungsprüfung.", "https://www.bundestag.de/dokumente/textarchiv/2025/kw11-de-sondersitzung-1056228", "2025-03"],
  ["Bundesbank - deutsche Staatsschulden 2025", "Staatsschulden stiegen 2025 auf 2,84 Billionen Euro.", "Faktenbasis zur Finanzschuld.", "Absolute Schuldenhöhe allein sagt nichts über Verwendungswirkung.", "https://www.bundesbank.de/en/press/press-releases/deutsche-staatsschulden-992720", "2026"],
  ["KfW-Kommunalpanel 2025", "Wahrgenommener kommunaler Investitionsrückstand stieg auf 215,7 Mrd. Euro.", "Begründung für Infrastrukturschuld und kommunale Unterlassungskosten.", "Befragungsbasierter Investitionsrückstand; nicht identisch mit geprüftem Finanzierungsbedarf.", "https://www.kfw.de/%C3%9Cber-die-KfW/Newsroom/Aktuelles/News-Details_855744.html", "2025-07"],
  ["OECD Economic Survey Germany 2025", "Reform der Fiskalregeln kann Verteidigung und Infrastruktur stärken; nötig sind Effizienz, Umschichtung und breitere Steuerbasis.", "Internationale Einordnung: Investieren plus Tragfähigkeit.", "OECD-Empfehlung ist kein Freibrief für beliebige Schulden.", "https://www.oecd.org/content/dam/oecd/en/publications/reports/2025/06/oecd-economic-surveys-germany-2025_b395dc9b/39d62aed-en.pdf", "2025-06"],
  ["IMF Article IV Germany 2025/2026", "IMF begrüßt Reform zur Erhöhung öffentlicher Investitionen, betont aber hochwertige fiskalische Lockerung und langfristiges Wachstum.", "Einordnung: Schulden nur für wachstums- und wirkungsstarke Zwecke.", "IMF verlangt Qualität und fiskalische Tragfähigkeit.", "https://www.imf.org/en/news/articles/2026/02/11/pr26042-germany-imf-executive-board-concludes-2025-article-iv-consultation", "2026-02"],
  ["Bundesrechnungshof - Kritik an Sondervermögen", "Warnt vor Umgehung solider Haushaltsregeln und fordert echte Zusätzlichkeit, Wirtschaftlichkeit, Nachhaltigkeit und Zielgerichtetheit.", "Gegenpol: Missbrauchsschutz und Additionality.", "Kritik nicht als Anti-Investitionsargument missverstehen; sie betrifft Wirkung und Kontrolle.", "https://www.bundesrechnungshof.de/SharedDocs/Kurzmeldungen/DE/2025/aenderung-grundgesetz/kurzmeldung-1.html", "2025"],
];

const dossier = {
  title: "Schulden machen oder sparen?",
  subtitle: "Warum die richtige Frage nicht Schuldenhöhe, sondern Wirkungsbilanz ist.",
  judgement: "Wahrer Stabilitätskern, falsche Haushaltsanalogie.",
  status: "checked_candidate",
  abstract: "Die Aussage „Deutschland muss sparen“ enthält einen wahren Kern: Staatsschulden sind nicht egal. Zinsen, Tragfähigkeit, Haushaltsdisziplin, Generationengerechtigkeit und Vertrauen in öffentliche Finanzen sind reale Wirkungsfragen. Irreführend wird die Aussage, wenn der Staat wie ein Privathaushalt dargestellt wird und nur sichtbare Finanzschulden zählen. Dann verschwinden unsichtbare Zukunftsschulden: marode Brücken, kaputte Schulen, fehlende Bahn- und Stromnetze, Klimaschäden, Digitalisierungsrückstand, Pflegenotstand, Bildungsarmut, Wohnungsnot, Verteidigungs- und Resilienzlücken. Wirkungsökonomisch lautet die bessere Frage nicht: Schulden ja oder nein? Sondern: Welche Ausgabe erzeugt welche positive Netto-Wirkung - und was kostet Unterlassen?",
  note: "Der Staat ist kein Privathaushalt. Aber er darf auch kein Wirkungsblindhaushalt sein.",
  principle: "Jeder Euro muss wirken. Auch jeder geliehene.",
  answers: {
    ten: "Nicht jede Schuld ist schlecht und nicht jedes Sparen ist gut. Entscheidend ist: Erzeugt das Geld Zukunftswirkung - oder finanziert es Blindleistung?",
    thirty: "Der wahre Kern ist: Schulden können gefährlich werden, wenn sie nur Konsum, Haushaltslöcher oder Wahlgeschenke finanzieren. Der Denkfehler ist: Investitionen in Brücken, Schulen, Netze, Klima, Digitalisierung oder Pflege wie private Konsumschulden zu behandeln. Wirkungsökonomisch zählt: Was kostet Unterlassen, und welche Ausgabe erzeugt positive Netto-Wirkung?",
    two: "Ich ordne das sauber ein. Natürlich sind Staatsschulden nicht egal. Zinsen, Tragfähigkeit und Generationengerechtigkeit sind reale Themen. Aber der Staat ist kein Privathaushalt. Wenn ein Staat eine Schule saniert, ein Stromnetz ausbaut, eine Brücke repariert, Klimaschäden verhindert, Pflege stabilisiert oder digitale Infrastruktur schafft, entsteht Zukunftswirkung. Wenn er das unterlässt, verschwindet die Rechnung nicht. Sie taucht später auf: als kaputte Infrastruktur, schlechtere Bildung, höhere Klimaschäden, geringere Produktivität, soziale Spaltung und Vertrauensverlust. Wirkungsökonomisch ist die Frage deshalb nicht: Schulden machen oder sparen? Sondern: Welche Ausgabe verbessert Zustände messbar, welche Folgekosten vermeidet sie, und welche Ausgaben sind Blindleistung? Kredite für positive Netto-Wirkung können sinnvoll sein. Schulden für wirkungsarme Ausgaben nicht.",
  },
};

const keyPoints = [
  ["Schulden sind nicht automatisch schlecht", "Kredite können Zukunftsinvestitionen ermöglichen: Infrastruktur, Bildung, Klimaschutz, Digitalisierung, Sicherheit, Gesundheit und Resilienz."],
  ["Sparen ist nicht automatisch gut", "Wer heute an Brücken, Schulen, Netzen, Pflege oder Klimaanpassung spart, erzeugt oft höhere Folgekosten."],
  ["Der Staat ist kein Privathaushalt", "Ein Staat investiert in kollektive Infrastruktur, erhebt Steuern, beeinflusst Wachstum und trägt Verantwortung über Generationen."],
  ["Aber Schulden brauchen Wirkungsgate", "Kreditfinanzierung darf nicht für Blindleistung, Dauerzuschüsse, Wahlgeschenke oder Haushaltslöcher genutzt werden."],
  ["Unterlassen ist auch eine Schuld", "Marode Infrastruktur, Klimaschäden, Bildungsdefizite und digitale Rückstände sind versteckte Schulden."],
  ["WÖk-Antwort: Wirkungshaushalt", "Öffentliche Ausgaben werden nach Netto-Wirkung, Resilienz, Folgekostenvermeidung, sozialer Fairness und demokratischer Kontrolle bewertet."],
];

const truePoints = [
  "Schulden erzeugen Zinskosten.",
  "Hohe Schulden können Handlungsspielräume künftiger Haushalte einschränken.",
  "Kreditfinanzierung kann Fehlanreize erzeugen, wenn Politik unbequeme Priorisierungen vermeidet.",
  "Sondervermögen können Transparenz und parlamentarische Kontrolle schwächen, wenn sie schlecht konstruiert sind.",
  "Nicht jede Ausgabe ist eine Investition.",
  "Investitionsmittel können wirkungslos bleiben, wenn Planung, Genehmigung, Fachkräfte, Vergabe oder Verwaltungskapazität fehlen.",
  "Schulden können inflationär oder kapazitätsbelastend wirken, wenn die Wirtschaft an Angebotsgrenzen stößt.",
  "Generationengerechtigkeit ist ein echtes Kriterium.",
];

const missingPoints = [
  "Unterlassene Investitionen erzeugen ebenfalls Schulden: kaputte Brücken, schlechte Schulen, Klimaschäden, Pflegekrisen, Digitalisierungsrückstand.",
  "Der Staat investiert in öffentliche Güter, die private Haushalte nicht allein bereitstellen können.",
  "Schulden für produktive Investitionen können künftiges Wachstum, Resilienz und Einnahmen erhöhen.",
  "Schulden für Prävention können spätere Schäden senken.",
  "Generationengerechtigkeit bedeutet auch funktionsfähige Infrastruktur, stabiles Klima, Bildung, Gesundheit und Demokratie.",
  "Die Schuldenhöhe sagt wenig über Wirkung aus, wenn nicht geprüft wird, wofür das Geld verwendet wird.",
  "Sparen an falscher Stelle kann teurer sein als Kreditfinanzierung.",
  "Der relevante Vergleich lautet: Finanzierungskosten gegen vermiedene Folgekosten und erzeugte Netto-Wirkung.",
];

const balanceRows = [
  ["Finanzschuld", "Wie hoch ist die staatliche Verschuldung?", "Zinslast, Tragfähigkeit, fiskalische Risiken", "Infrastruktur, Klima, Bildung, Resilienz"],
  ["Haushaltsdefizit", "Gibt der Staat mehr aus als er einnimmt?", "kurzfristige Haushaltslage", "Investitionsqualität, Zukunftswirkung"],
  ["Investitionsschuld", "Welche Zukunftsinvestitionen fehlen?", "Infrastruktur-, Bildungs-, Digital- und Klimarückstand", "Zins- und Refinanzierungsrisiken"],
  ["Unterlassungsschuld", "Was kostet Nicht-Handeln?", "Folgekosten, Schäden, Risikoanstieg", "unmittelbare Haushaltsentlastung"],
  ["Generationenbilanz", "Was hinterlassen wir künftigen Generationen?", "Finanzschuld plus Zustand von Klima, Infrastruktur, Bildung, Sozialstaat", "kurzfristige politische Haushaltslogik"],
  ["Wirkungshaushalt", "Welche Zustände verändert eine Ausgabe?", "Netto-Wirkung, Resilienz, Folgekostenvermeidung", "nur mit Daten, Evaluation und Lernen möglich"],
];

const debtTypes = [
  ["Konsumschuld", "Kreditfinanzierung für laufende Ausgaben ohne dauerhafte positive Wirkung.", "kritisch"],
  ["Blindleistungsschuld", "Schulden für Programme, die zwar Geld bewegen, aber keine messbare Zustandsverbesserung erzeugen.", "ablehnen"],
  ["Investitionsschuld", "Schulden für Infrastruktur, Bildung, Klima, Digitalisierung, Gesundheit oder Sicherheit mit positiver Netto-Wirkung.", "möglich, wenn T-SROI positiv ist"],
  ["Präventionsschuld", "Kreditfinanzierung, die größere spätere Schäden vermeidet.", "oft sinnvoll, wenn Folgekostenvermeidung plausibel und messbar ist"],
  ["Transformationsschuld", "Schulden für den Umbau von Energie, Industrie, Verkehr, Gebäuden, Verwaltung und Sozialstaat.", "gerechtfertigt, wenn sie Lock-ins vermeidet und Resilienz aufbaut"],
  ["Unterlassungsschuld", "Nicht sichtbare Schuld, die entsteht, wenn der Staat notwendige Investitionen verschiebt.", "im Haushalt sichtbar machen"],
  ["Demokratieschuld", "Folgekosten von Vertrauensverlust, Desinformation, maroden Institutionen, schlechter Verwaltung und fehlender Teilhabe.", "als SDG+-Wirkungsrisiko erfassen"],
];

const manipulationPatterns = [
  ["Staat als Privathaushalt", "Der Staat wird so dargestellt, als müsse er wie ein einzelner Haushalt sparen.", "Unterschied zwischen privatem Konsum und öffentlicher Investition erklären."],
  ["Finanzschuld ohne Unterlassungsschuld", "Nur aufgenommene Kredite werden gezählt, nicht Schäden durch Nicht-Investieren.", "Infrastruktur-, Klima-, Bildungs- und Demokratieschulden sichtbar machen."],
  ["Generationengerechtigkeit verkürzt", "Kinder sollen keine Schulden erben, aber marode Infrastruktur und Klimaschäden werden ausgeblendet.", "Generationenbilanz breit lesen: Geld plus Zustand der Systeme."],
  ["Investition als Konsum framen", "Zukunftsinvestitionen werden als staatliches Geldausgeben dargestellt.", "T-SROI und Folgekostenvermeidung verlangen."],
  ["Sparen als moralischer Selbstzweck", "Sparen gilt unabhängig von Wirkung als verantwortungsvoll.", "Sparen an falscher Stelle als Wirkungsrisiko markieren."],
  ["Sondervermögen als Freibrief", "Kreditspielräume werden genutzt, ohne Wirkung, Zusätzlichkeit und Kontrolle zu sichern.", "Wirkungsgate, Datenstand, Additionality, parlamentarische Kontrolle."],
];

const effectPath = [
  ["Aussage", "„Deutschland muss sparen. Schulden sind Generationenraub.“"],
  ["Wirkstoff", "Finanzschuld als moralischer Kurzschluss."],
  ["Verkürzung", "Sichtbare Staatsschuld wird mit Gesamtverantwortung verwechselt."],
  ["Ausblendung", "Infrastrukturschäden, Klimafolgekosten, Bildungsdefizite, Digitalisierungsrückstand, Pflegekrisen und Resilienzverlust verschwinden."],
  ["Resonanz", "Sicherheitsbedürfnis, Schuldangst, Misstrauen, Sparmoral."],
  ["Narrativ", "„Gute Politik macht keine Schulden.“"],
  ["Wirkungspotenzial", "Investitionen werden verzögert oder politisch delegitimiert."],
  ["Wirkungsrisiko", "Unterlassungskosten steigen und künftige Handlungsspielräume sinken."],
  ["Wirkung dritter Ordnung", "Der Staat bleibt im Haushaltskontrollmodus und verpasst den Umbau zur Wirkungsarchitektur."],
];

const falseActions = [
  ["Infrastruktur", "Brücken, Schulen, Bahn, Netze, Wasser, Verwaltung und digitale Infrastruktur verfallen weiter."],
  ["Klima", "Klimaanpassung und Emissionsminderung werden verschoben; spätere Schäden steigen."],
  ["Wirtschaft", "Produktivität, Standortqualität und private Investitionen leiden."],
  ["Soziales", "Pflege, Bildung, Wohnen und kommunale Daseinsvorsorge geraten stärker unter Druck."],
  ["Demokratie", "Bürger:innen erleben Staat als handlungsunfähig; Vertrauen sinkt."],
  ["Finanzen", "Scheinbar gesparte Ausgaben tauchen später als höhere Reparatur-, Krisen- oder Sozialkosten wieder auf."],
];

const woekMeasures = [
  ["Wirkungshaushalt einführen", "Haushaltstitel werden nach erwarteter Zustandsveränderung, Wirkungsrisiko und Datenstand bewertet."],
  ["Goldene Wirkungsregel", "Kreditfinanzierung nur für Investitionen mit positiver Netto-Wirkung, Resilienzgewinn oder nachweisbarer Folgekostenvermeidung."],
  ["Unterlassungskosten sichtbar machen", "Bei jeder großen Sparentscheidung wird geprüft, welche Schäden durch Nicht-Handeln entstehen."],
  ["Additionality sichern", "Sondervermögen dürfen reguläre Haushaltsmittel nicht ersetzen. Sie müssen zusätzliche Wirkung erzeugen."],
  ["Blindleistung abbauen", "Wirkungsarme Subventionen, Doppelstrukturen, ineffiziente Programme und Fehlanreize werden gestrichen oder umgebaut."],
  ["Prävention priorisieren", "Investitionen in Klimaanpassung, Gesundheit, Bildung, Pflege, IT-Sicherheit und Infrastruktur als Folgekostenvermeidung bewerten."],
  ["Demokratische Kontrolle stärken", "Jährliche Wirkungsberichte zeigen, welche kreditfinanzierten Ausgaben welche Zustände verändert haben."],
  ["Schuldenampel nach Wirkung", "Rot für Blindleistung, gelb für unsichere Wirkung, grün für geprüfte Zukunftsinvestitionen."],
];

const narrativePages = [
  ["schuldenangst", "Schuldenangst", "Wenn sichtbare Finanzschulden unsichtbare Zukunftsschulden verdrängen.", "hoch", "Schuldenangst schützt einen echten Stabilitätswert, kann aber notwendige Zukunftsinvestitionen blockieren."],
  ["schwaebische-hausfrau", "Schwäbische-Hausfrau-Frame", "Wenn Staatshaushalt mit Privathaushalt verwechselt wird.", "mittel", "Der Frame macht öffentliche Investitionen moralisch klein, obwohl Staaten anders wirken als private Haushalte."],
  ["generationenraub", "Generationenraub-Frame", "Wenn Generationengerechtigkeit nur als Schuldenstand gelesen wird.", "hoch", "Künftige Generationen erben nicht nur Finanzschulden, sondern auch Infrastruktur, Klima, Bildung und Demokratiezustand."],
  ["unterlassungskostenblindheit", "Unterlassungskostenblindheit", "Wenn Nicht-Investieren fälschlich als Sparen erscheint.", "hoch", "Unterlassungskosten sind zeitverzögert und weniger sichtbar, können aber höher sein als Finanzierungskosten."],
  ["investitionsblindheit", "Investitionsblindheit", "Wenn Ausgaben nicht nach Zukunftswirkung unterschieden werden.", "hoch", "Ohne Wirkungsgate werden produktive Investitionen und wirkungsarme Ausgaben gleich behandelt."],
];

const glossaryTerms = [
  ["finanzschuld", "Finanzschuld", "Formale Verschuldung eines Staates oder Haushalts durch aufgenommene Kredite.", "Finanzschulden sind sichtbar und messbar, sagen aber allein noch nichts über die Wirkung der finanzierten Ausgaben."],
  ["unterlassungsschuld", "Unterlassungsschuld", "Verdeckte Zukunftslast, die entsteht, wenn notwendige Investitionen oder Prävention unterbleiben.", "Kaputte Brücken, Klimaschäden, Bildungsdefizite oder digitale Rückstände sind Formen von Unterlassungsschuld."],
  ["blindleistung", "Blindleistung", "Ausgabe, Aktivität oder Regelung, die Ressourcen bindet, aber keine relevante positive Zustandsveränderung erzeugt.", "Blindleistung kann auch schuldenfinanziert sein. Dann wird sie doppelt problematisch."],
  ["goldene-wirkungsregel", "Goldene Wirkungsregel", "Prinzip, nach dem Kreditfinanzierung nur für Ausgaben zulässig ist, die positive Netto-Wirkung, Resilienz oder Folgekostenvermeidung erzeugen.", "Nicht jede Investition ist gut. Aber jede kreditfinanzierte Ausgabe braucht eine Wirkungsprüfung."],
  ["generationenbilanz", "Generationenbilanz", "Gesamtbewertung dessen, was eine Generation hinterlässt: Finanzschulden, Infrastruktur, Klima, Bildung, Gesundheit, Sozialstaat und Demokratie.", "Generationengerechtigkeit ist mehr als Schuldenstand."],
  ["investitionsschuld", "Investitionsschuld", "Rückstand an notwendigen Investitionen in Infrastruktur, Bildung, Klima, Digitalisierung, Gesundheit oder Sicherheit.", "Investitionsschuld entsteht, wenn Substanzverzehr als Sparsamkeit erscheint."],
];

function esc(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function slugify(value) {
  return value.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function words(value) {
  return String(value).trim().split(/\s+/).filter(Boolean).length;
}

function writeFile(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function list(items) {
  return `<ul class="clean-list">${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
}

function summaryGrid(items, label = "") {
  return `<div class="radar-summary-grid" aria-label="${esc(label)}">${items.map(([title, value, tone = "neutral"]) => `<article class="radar-summary-item" data-tone="${esc(tone)}"><p class="radar-summary-label">${esc(title)}</p><p class="radar-summary-value">${esc(value)}</p></article>`).join("")}</div>`;
}

function cardGrid(items, kicker = "Baustein") {
  return `<div class="card-grid">${items.map(([title, text, extra = ""]) => `<article class="card"><p class="card-kicker">${esc(kicker)}</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(text)}</p>${extra ? `<p class="card-text"><strong>Bewertung:</strong> ${esc(extra)}</p>` : ""}</article>`).join("")}</div>`;
}

function matrix(rows) {
  return `<div class="matrix-wrap"><table class="dossier-matrix"><thead><tr><th>Bilanzgrenze</th><th>Leitfrage</th><th>Was sie zeigt</th><th>Was sie ausblenden kann</th></tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function sourceCardsHtml() {
  return `<div class="card-grid">${sourceCards.map(([title, shows, useFor, warning, url, stand]) => `<article class="card"><p class="card-kicker">Quelle · ${esc(stand)}</p><h3 class="card-title">${esc(title)}</h3><p class="card-text"><strong>Zeigt:</strong> ${esc(shows)}</p><p class="card-text"><strong>Verwendung:</strong> ${esc(useFor)}</p><p class="card-text"><strong>Grenze:</strong> ${esc(warning)}</p><p><a class="text-link" href="${esc(url)}">Quelle öffnen</a></p></article>`).join("")}</div>`;
}

function nav(base) {
  return `<nav class="radar-subnav" aria-label="Wirkungsradar Navigation"><a href="${base}wirkungsradar/">Überblick</a><a href="${base}wirkungsradar/live/">Live</a><a href="${base}wirkungsradar/themen/">Themen</a><a href="${base}wirkungsradar/narrative/">Narrative</a><a href="${base}wirkungsradar/psychologie/">Psychologie</a></nav>`;
}

function shell({ title, description, canonical, base, main }) {
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <link rel="canonical" href="${esc(canonical)}">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=${ASSET_VERSION}">
  </head>
  <body>
    <header class="site-header" data-search-exclude><a class="brand" href="${base}index.html"><span class="brand-mark"><img src="${base}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span><span class="brand-name">Wirkungsökonomie</span></a><button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav"><span></span><span></span><span></span></button><nav id="site-nav" class="site-nav" aria-label="Hauptnavigation"><a href="${base}kompass.html">Kompass</a><a href="${base}wirkungsradar/">Wirkungsradar</a><a href="${base}begriffe/">Begriffe</a></nav></header>
${main}
    <footer class="footer" data-search-exclude><div class="footer-grid"><div><p class="hero-kicker">Wirkungsökonomie</p><h2>Die neue Ordnung des Wohlstands</h2><p>Wirkungsradar: Faktenkern, Narrativ, Psychologie, Wirkungspfad und bessere Handlungsfrage.</p></div><a class="btn btn-primary" href="${base}wirkungsradar/">Wirkungsradar öffnen</a></div></footer>
    <script src="${base}assets/js/main.js?v=${ASSET_VERSION}"></script>
  </body>
</html>
`;
}

function livePage({ detail = false } = {}) {
  const pageType = detail ? "Detail" : "Live";
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero"><div class="radar-hero-copy"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / ${pageType}</nav><p class="hero-kicker">Staat, Haushalt, Infrastruktur &amp; Zukunft</p><h1 class="hero-title">${esc(dossier.title)}</h1><p class="hero-subtitle">${esc(dossier.subtitle)}</p><p class="radar-abstract"><strong>Abstract:</strong> ${esc(dossier.abstract)}</p><p class="radar-status-line"><span>Status: ${esc(dossier.status)}</span><span>Datenstand: ${UPDATED_AT}</span><span>Finanzschuld und Unterlassungsschuld unterscheiden</span></p></div></section>
      ${summaryGrid([["Kurzurteil", dossier.judgement, "warning"], ["Kurzformel", "Nicht Schulden oder Sparen. Wirkung oder Blindleistung.", "positive"], ["Hero-Hinweis", dossier.note, "neutral"], ["Leitsatz", dossier.principle, "positive"]], "Schulden Summary")}
      ${nav("../../../")}
      <section class="section" id="sechs-punkte"><div><div class="section-header"><p class="hero-kicker">Das Wichtigste</p><h2>Sechs Punkte für die Wirkungsbilanz.</h2></div>${cardGrid(keyPoints, "Kernpunkt")}</div></section>
      <nav class="dossier-tab-nav" aria-label="Dossierbereiche" data-search-exclude><a href="#live-antworten">Live antworten</a><a href="#schulden-wirkung-verstehen">Schulden &amp; Wirkung verstehen</a><a href="#deep-dive-quellen">Deep Dive &amp; Quellen</a></nav>
      <section class="section dossier-tab-panel" id="live-antworten"><div><div class="section-header"><p class="hero-kicker">Tab 1</p><h2>Live antworten.</h2></div><div class="radar-answer-accordion host-answer-tabs" aria-label="Host-Antworten nach Länge"><details class="radar-answer-item" open><summary><span class="radar-answer-time">10 Sekunden</span> <span class="radar-answer-label">${words(dossier.answers.ten)} Wörter</span></summary><p>„${esc(dossier.answers.ten)}“</p></details><details class="radar-answer-item"><summary><span class="radar-answer-time">30 Sekunden</span> <span class="radar-answer-label">${words(dossier.answers.thirty)} Wörter</span></summary><p>„${esc(dossier.answers.thirty)}“</p></details><details class="radar-answer-item"><summary><span class="radar-answer-time">2 Minuten</span> <span class="radar-answer-label">${words(dossier.answers.two)} Wörter</span></summary><p>„${esc(dossier.answers.two)}“</p></details></div><div class="card-grid two"><article class="card"><p class="card-kicker">Gute Rückfrage</p><h3 class="card-title">Redest du von Schulden für Konsum und Haushaltslöcher - oder von Investitionen, die künftige Schäden und Kosten vermeiden?</h3></article><article class="card"><p class="card-kicker">Frame sichtbar machen</p><p class="card-text">Ich beantworte das, aber ich übernehme nicht den Haushaltsframe. Der Frame lautet: Staatsschulden seien wie private Konsumschulden. Die bessere Wirkungsfrage lautet: Welche öffentlichen Investitionen schaffen mehr Zukunftswirkung, als sie Finanzierungskosten erzeugen?</p></article></div><article class="card"><p class="card-kicker">Nicht ins Stöckchen springen</p>${list(["Nicht sagen: Schulden sind egal.", "Nicht sagen: Sparen ist immer falsch.", "Nicht jede Ausgabe „Investition“ nennen.", "Nicht Zinskosten kleinreden.", "Nicht Schuldenbremse pauschal dämonisieren.", "Nicht Privathaushalt und Staatshaushalt gleichsetzen.", "Nicht Infrastrukturverfall als „Sparen“ beschönigen.", "Nicht Generationengerechtigkeit nur finanziell lesen."])}</article></div></section>
      <section class="section section-soft dossier-tab-panel" id="schulden-wirkung-verstehen"><div><div class="section-header"><p class="hero-kicker">Tab 2</p><h2>Schulden &amp; Wirkung verstehen.</h2><p>Das Schulden-Narrativ wirkt stark, weil es eine einfache moralische Ordnung anbietet: Schulden schlecht, Sparen gut. Aber öffentliche Haushalte verwalten nicht nur Geld, sondern Infrastruktur, Sicherheit, Bildung, Gesundheit, Klima, Vertrauen, Resilienz und Zukunftsfähigkeit.</p></div>${summaryGrid([["Kernsatz", "Sparen kann teuer werden, wenn es Zukunftsschäden erzeugt.", "warning"], ["Zweiter Kernsatz", "Schulden können gerechtfertigt sein, wenn sie positive Netto-Wirkung finanzieren.", "positive"]], "Schulden Kernsätze")}<div class="card-grid two"><article class="card"><p class="card-kicker">Was stimmt?</p><h3 class="card-title">Schuldenrisiken fair anerkennen.</h3>${list(truePoints)}</article><article class="card"><p class="card-kicker">Was fehlt?</p><h3 class="card-title">Das Spar-Narrativ blendet Zukunftsschulden aus.</h3>${list(missingPoints)}<p class="formula-note"><strong>Kernsatz:</strong> Der Denkfehler ist nicht, Schulden zu prüfen. Der Denkfehler ist, nur Finanzschulden zu prüfen.</p></article></div></div></section>
      <section class="section dossier-tab-panel" id="bilanzgrenzen"><div><div class="section-header"><p class="hero-kicker">Bilanzgrenzen</p><h2>Welche Schuld wird betrachtet?</h2></div>${matrix(balanceRows)}</div></section>
      <section class="section section-soft dossier-tab-panel" id="schuldenarten"><div><div class="section-header"><p class="hero-kicker">Schuldenarten</p><h2>Nicht jede Schuld wirkt gleich.</h2></div>${cardGrid(debtTypes, "Schuldenart")}</div></section>
      <section class="section dossier-tab-panel" id="wirkstoffanalyse"><div><div class="section-header"><p class="hero-kicker">Wirkstoffanalyse</p><h2>Finanzschuld als moralischer Kurzschluss.</h2><p>Sichtbare Staatsschulden werden als alleiniger Beweis für Verantwortungslosigkeit genutzt, während Unterlassungs- und Wirkungsfolgen ausgeblendet werden.</p></div>${cardGrid([["Mechanismus", "Das Narrativ verschiebt Aufmerksamkeit von Zustandsqualität auf Kontostand."], ["Verdeckte Ebenen", "Infrastrukturzustand, Bildungsqualität, Klimaschäden, Digitalisierungsrückstand, Pflege- und Gesundheitsresilienz, Verteidigungsfähigkeit, kommunale Handlungsfähigkeit, Verwaltungskapazität, Folgekosten des Unterlassens, T-SROI und Wirkungshaushalt."], ["Narrativ-Hinweis", "Das Narrativ ist stark, weil es einen echten Stabilitätswert schützt. Problematisch wird es, wenn es nur Finanzschulden sieht und Zukunftsschäden ausblendet."]], "Wirkstoff")}</div></section>
      <section class="section section-soft dossier-tab-panel" id="psychologie"><div><div class="section-header"><p class="hero-kicker">Psychologischer Wirkungscheck</p><h2>Warum Schuldenangst wirkt.</h2><p>Schulden sind sichtbar, bezifferbar und moralisch leicht anschlussfähig. Unterlassungskosten sind verstreut, zeitverzögert und weniger sichtbar.</p></div>${summaryGrid([["Primäre Effekte", "Verlustaversion, Status-quo-Bias, Haushaltsanalogie, moralisches Framing, Verfügbarkeitsheuristik", "warning"], ["Sekundär", "Present Bias, Debt Aversion, Scarcity Mindset, False Equivalence", "warning"], ["Trigger", "Kontrollverlust, Sorge um Kinder und Enkel, Scham über Schulden, Sicherheitsbedürfnis, Misstrauen gegen Politik, Angst vor Verschwendung", "critical"], ["Bessere Frage", "Welche Investition erzeugt mehr positive Netto-Wirkung, als sie Finanzierungskosten und Risiken verursacht?", "positive"]], "Psychologie Schulden")}</div></section>
      <section class="section dossier-tab-panel" id="manipulationsmuster"><div><div class="section-header"><p class="hero-kicker">Manipulationsmuster</p><h2>Wie der Haushaltsframe arbeitet.</h2></div><div class="card-grid">${manipulationPatterns.map(([label, description, counter]) => `<article class="card"><p class="card-kicker">Muster</p><h3 class="card-title">${esc(label)}</h3><p class="card-text">${esc(description)}</p><p class="card-text"><strong>Gegenmove:</strong> ${esc(counter)}</p></article>`).join("")}</div></div></section>
      <section class="section section-soft dossier-tab-panel" id="wirkungspfad"><div><div class="section-header"><p class="hero-kicker">Wirkungspfad</p><h2>Vom Satz zur Systemwirkung.</h2></div><ol class="timeline radar-flow radar-effect-path">${effectPath.map(([label, text], index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${esc(label)}</strong><p>${esc(text)}</p></div></li>`).join("")}</ol></div></section>
      <section class="section dossier-tab-panel" id="folgen"><div><div class="section-header"><p class="hero-kicker">Folgen falschen Handelns</p><h2>Was scheinbares Sparen kosten kann.</h2></div>${cardGrid(falseActions, "Dimension")}</div></section>
      <section class="section section-soft dossier-tab-panel" id="mpd"><div><div class="section-header"><p class="hero-kicker">Mensch · Planet · Demokratie</p><h2>MPD-Bewertung.</h2></div>${cardGrid([["Mensch", "Sparen an Bildung, Pflege, Wohnen, Gesundheit und Infrastruktur erzeugt soziale Folgekosten. Lösung: Wirkungsinvestitionen priorisieren, Kaufkraftschutz und soziale Fairness sichern."], ["Planet", "Unterlassene Investitionen in Klima, Energie, Wärme, Verkehr und Anpassung erhöhen ökologische Schäden. Lösung: Klimaschutz und Klimaanpassung als Präventionsinvestitionen mit T-SROI bewerten."], ["Demokratie", "Haushaltsmoralismus kann Handlungsfähigkeit blockieren; unkontrollierte Schulden können Vertrauen ebenfalls zerstören. Lösung: transparenter Wirkungshaushalt, parlamentarische Kontrolle, Wirkungsberichte, Additionality und Missbrauchsschutz."]], "MPD")}</div></section>
      <section class="section dossier-tab-panel" id="woek-loesung"><div><div class="section-header"><p class="hero-kicker">WÖk-Lösung</p><h2>Wirkungshaushalt statt Schuldenromantik oder Sparmoralismus.</h2><p>Jeder Euro - auch jeder kreditfinanzierte - muss nach Netto-Wirkung, Resilienz, Folgekostenvermeidung und demokratischer Kontrolle bewertet werden.</p></div>${cardGrid(woekMeasures, "Maßnahme")}</div></section>
      <section class="section section-soft dossier-tab-panel" id="deep-dive-quellen"><div><div class="section-header"><p class="hero-kicker">Tab 3</p><h2>Deep Dive &amp; Quellen.</h2><p>Datenstand: ${UPDATED_AT}. Quellenkarten statt Linkliste: Jede Quelle zeigt, wofür sie verwendet wird und wo ihre Grenze liegt.</p></div>${sourceCardsHtml()}</div></section>
    </main>`;
  const pathType = detail ? "detail" : "live";
  return shell({ title: `${dossier.title} | Wirkungsradar ${pageType}`, description: "Wirkungsradar-Dossier zu Schulden, Sparen, Zukunftsinvestitionen, Unterlassungskosten und Wirkungshaushalt.", canonical: `https://wirkungsoekonomie.de/wirkungsradar/${pathType}/schulden-machen-oder-sparen/`, base: "../../../", main });
}

function narrativePage([slug, title, subtitle, risk, abstract]) {
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero narrative-hero"><div class="radar-hero-copy"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / Narrative</nav><p class="hero-kicker">Narrativfamilie</p><h1 class="hero-title">${esc(title)}</h1><p class="hero-subtitle">${esc(subtitle)}</p><p class="radar-abstract"><strong>Abstract:</strong> ${esc(abstract)}</p><p class="radar-status-line"><span>Risiko: ${esc(risk)}</span><span>Datenstand: ${UPDATED_AT}</span><span>Kontext: Schulden &amp; Zukunftsinvestitionen</span></p></div></section>
      ${summaryGrid([["Wirkstoff", "Finanzschuld als moralischer Kurzschluss", "warning"], ["Bessere Frage", "Welche Ausgabe erzeugt welche Netto-Wirkung - und was kostet Unterlassen?", "positive"], ["Schutzregel", "Schuldenrisiken anerkennen, Unterlassungskosten sichtbar machen.", "positive"], ["Status", "checked_candidate", "neutral"]], `${title} Summary`)}
      ${nav("../../../")}
      <section class="section"><div><div class="section-header"><p class="hero-kicker">Definition</p><h2>Wie dieses Narrativ wirkt.</h2></div><p class="lead">${esc(abstract)}</p><p>Problematisch wird der Frame, wenn er Finanzschulden moralisch absolut setzt und Zukunftsschulden aus Infrastruktur, Klima, Bildung, Pflege, Sicherheit oder Demokratie ausblendet.</p></div></section>
      <section class="section section-soft"><div><div class="section-header"><p class="hero-kicker">Gegenstrategie</p><h2>Wirkungsbilanz öffnen.</h2></div>${cardGrid([["Wahren Kern anerkennen", "Staatsschulden, Zinsen und Tragfähigkeit sind reale Wirkungsfragen."], ["Bilanzgrenze erweitern", "Finanzschuld, Investitionsschuld und Unterlassungsschuld getrennt prüfen."], ["Wirkungsgate verlangen", "Keine Schuldenromantik: Kreditfinanzierung braucht T-SROI, Additionality, Evaluation und Kontrolle."]], "Move")}</div></section>
    </main>`;
  return shell({ title: `${title} | Wirkungsradar Narrative`, description: subtitle, canonical: `https://wirkungsoekonomie.de/wirkungsradar/narrative/${slug}/`, base: "../../../", main });
}

function glossaryPage([slug, label, definition, hover]) {
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero term-hero"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Begriffe</a></nav><p class="hero-kicker">Glossar · Schulden &amp; Wirkungshaushalt</p><h1>${esc(label)}</h1><p class="hero-subtitle">${esc(hover)}</p></div></section>
      <section class="section"><div><article class="article-shell glossary-detail"><h2>Definition</h2><p>${esc(definition)}</p><p><a class="btn btn-primary" href="../../wirkungsradar/live/schulden-machen-oder-sparen/">Schulden-Dossier öffnen</a></p></article></div></section>
    </main>`;
  return shell({ title: `${label} | Glossar`, description: definition, canonical: `https://wirkungsoekonomie.de/begriffe/${slug}/`, base: "../../", main });
}

function topicPage(slug, title, subtitle) {
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero"><div class="radar-hero-copy"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / Themen</nav><p class="hero-kicker">Themencluster</p><h1 class="hero-title">${esc(title)}</h1><p class="hero-subtitle">${esc(subtitle)}</p><p class="radar-abstract"><strong>Abstract:</strong> Dieses Cluster bündelt Wirkungsradar-Karten zu Haushalt, Investitionen, Infrastruktur, Transformation, Resilienz und demokratischer Handlungsfähigkeit.</p><p class="radar-status-line"><span>Status: checked_candidate</span><span>Datenstand: ${UPDATED_AT}</span><span>Leuchtturm: Schulden machen oder sparen?</span></p></div></section>
      ${nav("../../../")}
      <section class="section"><div><div class="section-header"><p class="hero-kicker">Leuchtturm</p><h2>Erstes Dossier.</h2></div><div class="card-grid"><a class="card text-link-card" href="../../live/schulden-machen-oder-sparen/"><p class="card-kicker">${esc(dossier.judgement)}</p><h3 class="card-title">${esc(dossier.title)}</h3><p class="card-text">${esc(dossier.subtitle)}</p></a></div></div></section>
    </main>`;
  return shell({ title: `${title} | Wirkungsradar`, description: subtitle, canonical: `https://wirkungsoekonomie.de/wirkungsradar/themen/${slug}/`, base: "../../../", main });
}

function injectBeforeMainEnd(file, marker, section) {
  if (!fs.existsSync(file)) return;
  const html = fs.readFileSync(file, "utf8");
  if (html.includes(marker)) return;
  fs.writeFileSync(file, html.replace(/\s*<\/main>/, `\n${section}\n    </main>`));
}

function currentLiveCardCount() {
  const dir = path.join("wirkungsradar", "live");
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isDirectory() && fs.existsSync(path.join(dir, entry.name, "index.html"))).length;
}

function updateLiveIndexCount() {
  const file = path.join("wirkungsradar", "live", "index.html");
  if (!fs.existsSync(file)) return;
  const count = currentLiveCardCount();
  if (!count) return;
  const html = fs.readFileSync(file, "utf8")
    .replace(/<p class="radar-summary-value">\d+ Karten(?: aus Klima, Energie, Demokratie und Öffentlichkeit)? im Wirkungsradar\.<\/p>|<p class="radar-summary-value">\d+ Karten aus Klima, Energie, Demokratie und Öffentlichkeit\.<\/p>/, `<p class="radar-summary-value">${count} Karten im Wirkungsradar.</p>`)
    .replace(/<h2>\d+ kurze Antworten im Wirkungsradar\.<\/h2>/, `<h2>${count} kurze Antworten im Wirkungsradar.</h2>`);
  fs.writeFileSync(file, html);
}

function sourcePackYaml() {
  return `id: debt-investment-v1
last_verified: "${UPDATED_AT}"
status: checked_candidate
sources:
${sourceCards.map(([title, shows, useFor, warning, url, stand]) => `  ${slugify(title)}:
    label: "${title}"
    url: "${url}"
    data_stand: "${stand}"
    shows: "${shows}"
    use_for: "${useFor}"
    warning: "${warning}"`).join("\n")}
`;
}

writeFile("content/wirkungsradar/source-packs/debt-investment-v1.yaml", `# Generated by scripts/wirkungsradar/build-debt-investment-cluster.mjs\n${sourcePackYaml()}`);
writeFile("wirkungsradar/live/schulden-machen-oder-sparen/index.html", livePage());
writeFile("wirkungsradar/detail/schulden-machen-oder-sparen/index.html", livePage({ detail: true }));
writeFile("wirkungsradar/themen/wirtschaft-transformation/index.html", topicPage("wirtschaft-transformation", "Wirtschaft & Transformation", "Investitionen, Kapital, Produktivität, Transformation und Zukunftsfähigkeit."));
writeFile("wirkungsradar/themen/staat-haushalt-demokratie/index.html", topicPage("staat-haushalt-demokratie", "Staat, Haushalt & Demokratie", "Haushaltsregeln, Wirkungshaushalt, Kontrolle, Vertrauen und demokratische Handlungsfähigkeit."));
writeFile("wirkungsradar/themen/infrastruktur/index.html", topicPage("infrastruktur", "Infrastruktur", "Brücken, Schulen, Bahn, Netze, Verwaltung, digitale Infrastruktur und Resilienz."));
for (const page of narrativePages) writeFile(`wirkungsradar/narrative/${page[0]}/index.html`, narrativePage(page));
for (const term of glossaryTerms) writeFile(`begriffe/${term[0]}/index.html`, glossaryPage(term));
injectBeforeMainEnd("wirkungsradar/live/index.html", "schulden-machen-oder-sparen", `<section class="section section-soft" id="schulden-investitionen-live"><div><div class="section-header"><p class="hero-kicker">Staat, Haushalt &amp; Zukunft</p><h2>Neues Leuchtturm-Dossier.</h2></div><div class="card-grid"><a class="card text-link-card" href="schulden-machen-oder-sparen/"><p class="card-kicker">${esc(dossier.judgement)}</p><h3 class="card-title">${esc(dossier.title)}</h3><p class="card-text"><strong>10 Sekunden:</strong> ${esc(dossier.answers.ten)}</p></a></div></div></section>`);
injectBeforeMainEnd("wirkungsradar/detail/index.html", "schulden-machen-oder-sparen", `<section class="section section-soft" id="schulden-investitionen-detail"><div><div class="section-header"><p class="hero-kicker">Staat, Haushalt &amp; Zukunft</p><h2>Neuer Deep Dive.</h2></div><div class="card-grid"><a class="card text-link-card" href="schulden-machen-oder-sparen/"><p class="card-kicker">${esc(dossier.judgement)}</p><h3 class="card-title">${esc(dossier.title)}</h3><p class="card-text">${esc(dossier.subtitle)}</p></a></div></div></section>`);
injectBeforeMainEnd("wirkungsradar/themen/index.html", "wirtschaft-transformation", `<section class="section section-soft" id="wirtschaft-transformation"><div><div class="section-header"><p class="hero-kicker">Wirtschaft, Haushalt &amp; Infrastruktur</p><h2>Neue Themencluster.</h2></div><div class="card-grid"><a class="card text-link-card" href="wirtschaft-transformation/"><p class="card-kicker">Investitionen und Zukunftsfähigkeit</p><h3 class="card-title">Wirtschaft &amp; Transformation</h3><p class="card-text">Kapital, Produktivität, Transformation und positive Netto-Wirkung.</p></a><a class="card text-link-card" href="staat-haushalt-demokratie/"><p class="card-kicker">Haushalt und Kontrolle</p><h3 class="card-title">Staat, Haushalt &amp; Demokratie</h3><p class="card-text">Wirkungshaushalt, Tragfähigkeit, Additionality und demokratische Kontrolle.</p></a><a class="card text-link-card" href="infrastruktur/"><p class="card-kicker">Unterlassungskosten</p><h3 class="card-title">Infrastruktur</h3><p class="card-text">Brücken, Schulen, Netze, Verwaltung und Resilienz als Generationenbilanz.</p></a></div></div></section>`);
updateLiveIndexCount();

console.log("Built debt-investment cluster: 1 live dossier, 1 detail page, 3 topic clusters, 5 narratives, 6 glossary pages.");
