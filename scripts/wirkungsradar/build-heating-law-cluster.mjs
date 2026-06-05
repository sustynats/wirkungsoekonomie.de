import fs from "node:fs";
import path from "node:path";

const UPDATED_AT = "2026-06-04";
const ASSET_VERSION = "20260604-heating-law-cluster";
const slug = "heizgesetz-heizhammer-narrativ";
const topicSlug = "wohnen-gebaeude-waerme";
const title = "Heizgesetz oder Heizhammer?";
const publicTitle = "Heizgesetz oder Heizhammer? Wie Sprache eine Wärmewende in Verlustangst verwandelt hat";
const subtitle = "Wie Sprache eine Wärmewende in Verlustangst verwandelt hat.";
const judgement = "Wahrer Belastungskern, massiver Verzerrungsframe.";
const abstract =
  "Das sogenannte Heizgesetz ist ein Referenzfall dafür, wie Sprache Transformation blockieren kann. Der wahre Kern: Wärmewende kostet Geld, erzeugt Planungsunsicherheit und betrifft private Lebensbereiche wie Haus, Eigentum, Miete und Alterssicherung. Irreführend wurde die Debatte, als aus einer komplexen Regelung zu neuen Heizungen, kommunaler Wärmeplanung, Übergangsfristen, Förderung und Technologieoptionen ein Heizhammer-Frame wurde. Wirkungsökonomisch zeigt der Fall: Wenn der erste Frame verloren geht, wird aus Transformationspolitik ein Bedrohungsnarrativ.";

const sources = [
  ["Bundesregierung - Gesetz zum Erneuerbaren Heizen", "bundesregierung_geg", "https://www.bundesregierung.de/breg-de/aktuelles/neues-gebaeudeenergiegesetz-2184942", "GEG, 65-Prozent-Regel, Übergangslogik und politische Einordnung.", "Regierungsquelle; mit Verbraucher- und Fachquellen gegenlesen."],
  ["BMWSB - Gebäudeenergiegesetz", "bmwsb_geg", "https://www.bmwsb.bund.de/DE/bauen/innovation-klimaschutz/gebaeudeenergiegesetz/gebaeudeenergiegesetz_node.html", "Gebäudeenergiegesetz, Pflichten, Fristen, Förderung und Bestandsschutz.", "Gesetzesstand regelmäßig prüfen."],
  ["BMWSB - Kommunale Wärmeplanung", "bmwsb_waermeplanung", "https://www.bmwsb.bund.de/DE/stadtentwicklung/klimagerechte-stadtentwicklung/kommunale-waermeplanung/kommunale-waermeplanung_node.html", "Kommunale Wärmeplanung und Planungssicherheit für Eigentümer:innen.", "Kommunale Umsetzung ist lokal unterschiedlich."],
  ["BMWE - Wärmeplanung FAQ", "bmwe_waermeplanung_faq", "https://www.energiewechsel.de/KAENEF/Redaktion/DE/FAQ/Waermeplanung/faq-waermeplanung-wpg.html", "FAQ zu Wärmeplanung, Fristen und Zusammenspiel mit GEG.", "FAQ-Stand beachten."],
  ["Verbraucherzentrale - GEG", "verbraucherzentrale_geg", "https://www.verbraucherzentrale.de/wissen/energie/energetische-sanierung/geg-was-steht-im-gebaeudeenergiegesetz-13886", "Verbrauchernahe Einordnung zu Heizungstausch, Bestand, Fristen und Förderung.", "Beratungsperspektive; regionale Fälle separat prüfen."],
  ["Umweltbundesamt - fossile und erneuerbare Wärme", "uba_waerme", "https://www.umweltbundesamt.de/daten/umweltzustand-trends/energie/energieverbrauch-fuer-fossile-erneuerbare-waerme", "Wärmeanteil am Energieverbrauch und fossile Wärmeabhängigkeit.", "Datenstand und Methodik beachten."],
  ["Umweltbundesamt - energiesparende Gebäude", "uba_gebaeude", "https://www.umweltbundesamt.de/themen/klima-energie/energiesparen/energiesparende-gebaeude", "Gebäudebereich, Energieverbrauch, Emissionen und Einsparpotenziale.", "Nicht jede Zahl gilt für jedes Gebäude."],
  ["dena - Gebäudereport 2025", "dena_gebaeudereport_2025", "https://www.dena.de/infocenter/gebaeudereport-2025/", "Gebäudebestand, Heizungsstruktur und Transformationsstand.", "Branchen- und Marktdaten einordnen."],
  ["BDEW - Heizungsbestand", "bdew_heizungsbestand", "https://www.bdew.de/service/daten-und-grafiken/beheizung-des-wohnungsbestandes-in-deutschland/", "Heizungsbestand in Wohngebäuden und fossile Dominanz.", "Statistik mit anderen Datenquellen abgleichen."],
  ["Das Progressive Zentrum - Aufgeheizte Debatte?", "progressives_zentrum", "https://www.progressives-zentrum.org/publication/heizungsgesetz-2024-aufgeheizte-debatte/", "Kommunikationsanalyse zum GEG, Leak, Frame-Setting und Deutungshoheit.", "Think-Tank-Analyse; als Kommunikationsquelle nutzen."],
  ["RIFS - Wie Populisten das Heizungsgesetz behinderten", "rifs_heizungsgesetz", "https://www.rifs-potsdam.de/de/news/wie-populisten-das-heizungsgesetz-behinderten", "Einordnung von Populismus, Zuspitzung und politischer Blockadewirkung.", "Analysequelle; nicht als Gesetzesquelle verwenden."],
];

const keyPoints = [
  ["Der Gebäudebereich ist ein echter Klimahebel", "Wärme macht mehr als die Hälfte des deutschen Endenergieverbrauchs aus. Gebäude sind deshalb kein Nebenschauplatz, sondern ein zentraler Ort für Energie, Kosten und Emissionen."],
  ["Der wahre Kern war real", "Heizungstausch, Sanierung, Förderung, Fachkräfte, Mieterschutz, Finanzierung und Wärmeplanung sind echte Belastungs- und Steuerungsfragen."],
  ["Der Frame war stärker als die Fakten", "Begriffe wie Heizhammer machten aus einer Wärmewende-Regel ein Bedrohungsbild für Eigentum, Zuhause und finanzielle Sicherheit."],
  ["Viele Aussagen waren verkürzt", "Funktionierende Heizungen mussten nicht pauschal herausgerissen werden. Bestand, Neubau, neue Heizungen, Wärmeplanung und Übergangsfristen wurden oft vermischt."],
  ["Die psychologische Wirkung war enorm", "Verlustaversion, Reaktanz, Eigentumsangst, Statusbedrohung und Misstrauen machten die Debatte hoch anschlussfähig."],
  ["WÖk-Lösung: Wärmewende als Wirkungsinfrastruktur", "Gebäude, Wärmeplanung, Finanzierung, Mieterschutz, Handwerk, Netze, Wärmepumpen, Fernwärme, Sanierung und soziale Abfederung müssen zusammen gedacht werden."],
];

const answers = {
  ten: "Der Heizhammer-Frame war stärker als das Gesetz. Es ging nicht darum, funktionierende Heizungen pauschal rauszureißen, sondern neue Heizungen schrittweise auf erneuerbare Wärme umzustellen.",
  thirty:
    "Der wahre Kern ist: Wärmewende kostet Geld und muss sozial abgefedert werden. Der Denkfehler ist: daraus Enteignung oder Zwangsheizung zu machen. Das Gesetz betraf vor allem neue Heizungen, Übergangsfristen und Wärmeplanung. Die bessere Frage lautet: Wie machen wir Wärme bezahlbar, planbar und klimaneutral?",
  two:
    "Ich ordne das sauber ein. Beim Heizgesetz gab es reale Probleme: schlechte Kommunikation, Planungsunsicherheit, Kostenangst, komplizierte Förderung, Mieterschutzfragen und echte Belastung für Eigentümer:innen. Aber der Begriff Heizhammer hat aus dieser komplexen Wärmewende-Frage ein Bedrohungsbild gemacht. Viele Menschen hatten plötzlich das Gefühl, der Staat komme in den Keller und reiße die Heizung raus. Das war nicht die sachliche Grundlogik. Es ging um neue Heizungen, 65 Prozent erneuerbare Wärme, Übergangsfristen und die Kopplung an kommunale Wärmeplanung. Wirkungsökonomisch muss man deshalb trennen: Der reale Punkt ist bezahlbare, soziale und planbare Wärmewende. Der schädliche Frame ist Enteignung, Zwang und Panik. Die bessere Frage ist: Welche Lösung senkt Heizkostenrisiken, schützt Mieter:innen, gibt Eigentümer:innen Planungssicherheit und reduziert fossile Abhängigkeit?",
};

const whatIsTrue = [
  "Der Heizungstausch kann teuer sein.",
  "Viele Eigentümer:innen hatten Angst vor finanzieller Überforderung.",
  "Mieter:innen können über Modernisierungskosten belastet werden, wenn soziale Regeln nicht greifen.",
  "Nicht jedes Gebäude ist sofort gut für eine Wärmepumpe geeignet.",
  "Fachkräfte, Lieferketten, Netzanschlüsse und Beratungsqualität sind echte Engpässe.",
  "Förderregeln können kompliziert und unsicher wirken.",
  "Kommunale Wärmeplanung war anfangs für viele Menschen abstrakt.",
  "Die Regierungskommunikation war zu spät, zu technisch und nicht ausreichend alltagsnah.",
  "Der Leak und die frühe mediale Rahmung haben die Deutung stark geprägt.",
  "Technologiepfade wie Fernwärme, Wärmepumpe, Biomasse, Hybrid oder perspektivisch Wasserstoff müssen realistisch unterschieden werden.",
];

const whatIsMissing = [
  "Funktionierende Heizungen mussten nicht pauschal sofort herausgerissen werden.",
  "Neubau, Bestand, neue Heizungen, bestehende Heizungen und kommunale Wärmeplanung wurden oft vermischt.",
  "Übergangsfristen, Härtefallregelungen und Förderungen wurden wenig sichtbar.",
  "Fossile Heizungen erzeugen langfristige Preis-, CO₂- und Abhängigkeitsrisiken.",
  "Gasheizungen können zu Kostenfallen werden, wenn Gasnetze schrumpfen, CO₂-Preise steigen oder Wasserstoffversprechen nicht realistisch sind.",
  "Wärmewende ist nicht nur Wärmepumpe: Fernwärme, Gebäudenetze, Solarthermie, Biomasse, Hybridlösungen und Effizienz spielen je nach Gebäude und Kommune unterschiedliche Rollen.",
  "Kommunale Wärmeplanung soll gerade verhindern, dass Eigentümer:innen blind investieren.",
  "Der Gebäudesektor ist für Klimaziele, Heizkosten, Energieimporte und soziale Stabilität zentral.",
  "Die soziale Frage lautet nicht: keine Wärmewende. Sie lautet: faire Finanzierung und Schutz vor Kostenüberforderung.",
];

const boundaryRows = [
  ["Einzelhaushalt", "Was kostet mich die neue Heizung?", "reale Belastung und Finanzierungsfrage", "Förderung, Betriebskosten, CO₂-Preis, fossile Preisrisiken"],
  ["Gebäude", "Welche Lösung passt zum Haus?", "Dämmung, Heizlast, Heizkörper, Wärmebedarf", "kommunale Wärmeplanung und Netzoptionen"],
  ["Kommune", "Welche Wärmeoptionen gibt es vor Ort?", "Fernwärme, Quartierslösung, Abwärme, Wärmepumpe", "individuelle Kostenlage"],
  ["Energiesystem", "Welche Infrastruktur braucht Wärme?", "Stromnetze, Gasnetze, Wärmenetze, Speicher", "Eigentumsangst und soziale Akzeptanz"],
  ["Klima", "Welche Emissionen entstehen bis 2045?", "CO₂-Pfad, fossile Lock-ins", "kurzfristige Haushaltskosten"],
  ["Sozialstaat", "Wer kann sich den Umbau leisten?", "Förderung, Mieterschutz, Härtefälle", "Klimarisiko und Betriebskosten"],
  ["Demokratie", "Welche Wirkung hat Sprache?", "Vertrauen, Angst, Reaktanz, Polarisierung", "technische Details"],
];

const triggerWords = [
  ["Heizhammer", "Macht aus Gesetzgebung Gewalt. Der Staat erscheint als Schlagwerkzeug gegen Bürger:innen."],
  ["Zwangswärmepumpe", "Macht aus Technologieoptionen ein Symbol für Bevormundung."],
  ["Enteignung", "Aktiviert Eigentumsangst und Existenzbedrohung, obwohl es nicht um Eigentumsentzug ging."],
  ["Energie-Stasi", "Delegitimiert Verwaltung, Beratung und Vollzug als Überwachung."],
  ["Habeck reißt eure Heizung raus", "Personalisiert eine Systemfrage und baut ein Feindbild."],
  ["100.000 Euro Kosten", "Setzt eine Maximalzahl als Angstanker, auch wenn Fälle, Förderung und Gebäudezustand variieren."],
  ["Verbot", "Aktiviert Reaktanz: Menschen verteidigen zuerst Freiheit, bevor sie Regeln prüfen."],
  ["Technologieoffenheit", "Kann berechtigt sein, wird aber manchmal als Schutzschild für fossile Verzögerung genutzt."],
];

const psychology = [
  ["Verlustaversion", "Die mögliche Ausgabe wirkt stärker als die spätere Einsparung oder das vermiedene Risiko.", "Kostenangst anerkennen, dann Lebenszyklus, Förderung und fossile Preisrisiken zeigen."],
  ["Reaktanz", "Der Begriff Zwang macht aus einer Regel einen Angriff auf Freiheit.", "Nicht über Gehorsam reden, sondern Optionen, Fristen und lokale Wärmeplanung erklären."],
  ["Status-quo-Bias", "Die bestehende Heizung fühlt sich sicher an, auch wenn sie langfristig teuer oder riskant werden kann.", "Bestand, Reparatur, Austausch und Zukunftskosten getrennt prüfen."],
  ["Eigentumsangst", "Das Zuhause steht für Lebensleistung, Alterssicherung und Kontrolle.", "Eigentum respektieren und die Wärmelösung als Schutz des Hauses erklären."],
  ["Verfügbarkeitsheuristik", "Ein Extremfall oder eine Maximalzahl wirkt wie der Normalfall.", "Beispiel, Standardfall und Härtefall sauber trennen."],
  ["Identitätsschutz", "Handwerkliche Praxis, ländliches Wohnen oder Eigentümerstatus werden gegen Politik verteidigt.", "Nicht beschämen. Lokales Gebäude, lokale Kommune, realistische Technikpfade in den Mittelpunkt stellen."],
];

const effectPath = [
  ["Ausgangslage", "Gebäude sind fossil geprägt; Wärme ist teuer, technisch komplex und privat nah."],
  ["Politikmaßnahme", "Neue Heizungen sollten schrittweise stärker erneuerbare Wärme nutzen."],
  ["Kommunikationsbruch", "Leak, technische Sprache und verspätete Alltagserklärung öffneten den Deutungsraum."],
  ["Wirkstoff", "Heizhammer als Eigentums- und Verlustangst-Verstärker."],
  ["Resonanz", "Kostenangst, Misstrauen, Reaktanz und Schutz des Zuhauses griffen ineinander."],
  ["Narrativ", "Der Staat greift in dein Zuhause ein und macht dich arm."],
  ["Folge", "Wärmewende wurde schwerer erklärbar; fossile Lock-ins wirkten vertrauter als Transformation."],
];

const narratives = [
  ["heizhammer-frame", "Heizhammer-Frame", "Wenn Wärmewende als Gewalt gegen Eigentum und Zuhause erzählt wird.", "Macht aus einer komplexen Infrastruktur- und Kostenfrage ein unmittelbares Bedrohungsbild."],
  ["zwangswaermepumpe", "Zwangswärmepumpe", "Wenn eine Technologieoption zur Bevormundungsformel wird.", "Verdeckt, dass Wärmeplanung, Fernwärme, Effizienz, Hybridlösungen und Gebäudezustand mitentscheiden."],
  ["enteignungsframe", "Enteignungsframe", "Wenn Regulierung als Eigentumsentzug erscheint.", "Aktiviert Existenzangst, obwohl es sachlich um Regeln für neue Heizungen, Fristen und Förderlogik ging."],
  ["technologieoffenheit-als-verzoegerung", "Technologieoffenheit als Verzögerung", "Wenn ein berechtigtes Prinzip fossile Lock-ins schützt.", "Technologieoffenheit ist sinnvoll, wenn Optionen realistisch sind; sie wird problematisch, wenn unrealistische Pfade Planung verhindern."],
  ["zuhause-als-angriffsort", "Zuhause als Angriffsort", "Wenn politische Regeln im emotionalsten Raum der Menschen landen.", "Das Zuhause ist Sicherheit, Identität, Eigentum und Alterssicherung; deshalb brauchen Wärmeregeln andere Kommunikation."],
];

const glossaryTerms = [
  ["heizhammer", "Heizhammer", "Zuspitzender Frame, der eine Wärmewende-Regel als Gewalt, Zwang und Angriff auf Eigentum erzählt.", "Der Begriff organisiert Verlustangst, bevor Bestand, Fristen, Förderung und Wärmeplanung geprüft werden."],
  ["waermewende", "Wärmewende", "Umbau der Wärmeversorgung von Gebäuden, Quartieren und Kommunen hin zu weniger fossiler Abhängigkeit und klimaverträglicher Wärme.", "Wärmewende ist nicht nur Heizungstausch, sondern Infrastrukturpolitik im Zuhause."],
  ["kommunale-waermeplanung", "Kommunale Wärmeplanung", "Planungsinstrument, mit dem Städte und Gemeinden klären, wo Fernwärme, dezentrale Lösungen, Abwärme oder andere Wärmeoptionen sinnvoll sind.", "Sie soll blinde Einzelinvestitionen vermeiden und lokale Planungssicherheit schaffen."],
  ["fossiler-lock-in", "Fossiler Lock-in", "Pfadabhängigkeit, bei der neue fossile Anlagen oder Netze langfristig Kosten, Emissionen und Abhängigkeiten festschreiben.", "Billig im Moment kann teuer im System werden."],
  ["waerme-t-sroi", "Wärme-T-SROI", "Wirkungsbewertung von Wärmelösungen nach Kosten, Emissionen, Versorgungssicherheit, sozialer Fairness, Gesundheit und Resilienz.", "Nicht nur Anschaffungskosten zählen, sondern Netto-Wirkung über Zeit."],
  ["heizkostenrisiko", "Heizkostenrisiko", "Risiko steigender oder unsicherer Wärmekosten durch Energiepreise, CO₂-Preise, Netzentwicklung, Gebäudeeffizienz und Technikpfad.", "Fossile Heizungen können vertraut wirken und trotzdem langfristig riskant sein."],
  ["eigentumsangst", "Eigentumsangst", "Emotionale Sorge, dass politische Regeln Haus, Wohnung, Erspartes oder Alterssicherung gefährden.", "Die Sorge muss ernst genommen werden, ohne sie als Blockadeframe zu übernehmen."],
];

const subclaims = [
  ["staat-reisst-heizungen-raus", "Der Staat reißt Heizungen raus", "Falsche Pauschalisierung von Bestand, Reparatur und neuer Heizung."],
  ["waermepumpe-ist-zwang", "Die Wärmepumpe ist Zwang", "Technologieoptionen werden zu einem Bevormundungsbild verdichtet."],
  ["heizungstausch-ruiniert-hausbesitzer", "Heizungstausch ruiniert Hausbesitzer", "Realer Kostenkern, aber Förderung, Fristen, Gebäudezustand und Betriebskosten fehlen."],
  ["gasheizung-technologieoffen-sicher", "Gas bleibt technologieoffen und sicher", "Kann ein fossiler Lock-in sein, wenn Gasnetze, CO₂-Preise und Wasserstoffversprechen unrealistisch bleiben."],
];

function esc(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function words(value) {
  return String(value).trim().split(/\s+/).filter(Boolean).length;
}

function writeFile(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function toYaml(value, indent = 0) {
  const pad = " ".repeat(indent);
  if (Array.isArray(value)) {
    return value.map((item) => `${pad}- ${typeof item === "object" && item ? `\n${toYaml(item, indent + 2)}` : JSON.stringify(item)}`).join("\n");
  }
  if (typeof value === "object" && value !== null) {
    return Object.entries(value).map(([key, item]) => {
      if (typeof item === "object" && item !== null) return `${pad}${key}:\n${toYaml(item, indent + 2)}`;
      return `${pad}${key}: ${JSON.stringify(item)}`;
    }).join("\n");
  }
  return `${pad}${JSON.stringify(value)}`;
}

function shell({ pageTitle, description, canonical, base, main }) {
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(pageTitle)}</title>
    <meta name="description" content="${esc(description)}">
    <link rel="canonical" href="${esc(canonical)}">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=20260605-debate-tool-order}">
  </head>
  <body>
    <header class="site-header" data-search-exclude><a class="brand" href="${base}index.html"><span class="brand-mark"><img src="${base}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span><span class="brand-name">Wirkungsökonomie</span></a><button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav"><span></span><span></span><span></span></button><nav id="site-nav" class="site-nav" aria-label="Hauptnavigation"><a href="${base}kompass.html">Kompass</a><a href="${base}wirkungsradar/">Wirkungsradar</a><a href="${base}begriffe/">Begriffe</a></nav></header>
${main}
    <footer class="footer" data-search-exclude><div class="footer-grid"><div><p class="hero-kicker">Wirkungsökonomie</p><h2>Wirkung statt Verlustangst</h2><p>Wirkungsradar: Faktenkern, Narrativ, Psychologie, Wirkungspfad und bessere Handlungsfrage.</p></div><a class="btn btn-primary" href="${base}wirkungsradar/">Wirkungsradar öffnen</a></div></footer>
    <script src="${base}assets/js/main.js?v=20260605-debate-tool-order"></script>
  </body>
</html>
`;
}

function nav(base) {
  return `<nav class="radar-subnav" aria-label="Wirkungsradar Navigation" data-search-exclude><a href="${base}wirkungsradar/">Überblick</a><a href="${base}wirkungsradar/live/">Live</a><a href="${base}wirkungsradar/themen/">Themen</a><a href="${base}wirkungsradar/narrative/">Narrative</a><a href="${base}wirkungsradar/psychologie/">Psychologie</a></nav>`;
}

function summaryGrid(items, label = "") {
  return `<div class="radar-summary-grid" aria-label="${esc(label)}">${items.map(([itemTitle, value, tone = "neutral"]) => `<article class="radar-summary-item" data-tone="${esc(tone)}"><p class="radar-summary-label">${esc(itemTitle)}</p><p class="radar-summary-value">${esc(value)}</p></article>`).join("")}</div>`;
}

function cardGrid(items, kicker = "Baustein") {
  return `<div class="card-grid">${items.map(([itemTitle, text]) => `<article class="card"><p class="card-kicker">${esc(kicker)}</p><h3 class="card-title">${esc(itemTitle)}</h3><p class="card-text">${esc(text)}</p></article>`).join("")}</div>`;
}

function list(items) {
  return `<ul class="clean-list">${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
}

function matrix(rows) {
  return `<div class="table-wrap"><table><thead><tr><th>Bilanzgrenze</th><th>Leitfrage</th><th>Was sie zeigt</th><th>Was sie ausblenden kann</th></tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function sourceCards(keys = sources.map((source) => source[1])) {
  const allowed = new Set(keys);
  return `<div class="card-grid">${sources.filter(([, key]) => allowed.has(key)).map(([label, key, url, useFor, warning]) => `<article class="card" id="quelle-${esc(key)}"><p class="card-kicker">Quelle vorbereiten</p><h3 class="card-title">${esc(label)}</h3><p class="card-text"><strong>Verwendet für:</strong> ${esc(useFor)}</p><p class="card-text"><strong>Grenze:</strong> ${esc(warning)}</p><p><a class="text-link" href="${esc(url)}">Quelle öffnen</a></p></article>`).join("")}</div>`;
}

function livePage(detail = false) {
  const pageType = detail ? "Detail" : "Live";
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero"><div class="radar-hero-copy"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / ${pageType}</nav><p class="hero-kicker">Klima, Gebäude, Demokratie &amp; Transformation</p><h1 class="hero-title">${esc(title)}</h1><p class="hero-subtitle">${esc(subtitle)}</p><p class="radar-abstract"><strong>Abstract:</strong> ${esc(abstract)}</p><p class="radar-status-line"><span>Kurzurteil: ${esc(judgement)}</span><span>Datenstand: ${UPDATED_AT}</span><span>Sachthema und Kommunikationslehrstück</span></p></div></section>
      ${summaryGrid([["Kurzurteil", judgement, "warning"], ["Leitsatz", "Aus Wärmewende wurde Heizhammer. Aus Planung wurde Zwang. Aus Zukunftsschutz wurde Verlustangst.", "critical"], ["Nicht falsch", "Kosten, Unsicherheit und soziale Härten waren reale Punkte.", "neutral"], ["Bessere Frage", "Wie wird Wärme bezahlbar, planbar, sozial fair und klimaneutral?", "positive"]], "Heizgesetz Summary")}
      ${nav("../../../")}
      <section class="section" id="das-wichtigste"><div><div class="section-header"><p class="hero-kicker">Das Wichtigste</p><h2>Sechs Punkte für die Wirkungsbilanz.</h2></div>${cardGrid(keyPoints, "Kernpunkt")}</div></section>
      <nav class="dossier-tab-nav" aria-label="Dossierbereiche" data-search-exclude><a href="#live-antworten">Live antworten</a><a href="#waermewende-verstehen">Wärmewende verstehen</a><a href="#deep-dive-quellen">Deep Dive &amp; Quellen</a></nav>
      <section class="section dossier-tab-panel" id="live-antworten"><div><div class="section-header"><p class="hero-kicker">Live antworten</p><h2>Kosten ernst nehmen, Frame nicht übernehmen.</h2></div><div class="radar-answer-accordion host-answer-tabs"><details class="radar-answer-item" open><summary><span class="radar-answer-time">10 Sekunden</span><span class="radar-answer-label">${words(answers.ten)} Wörter</span></summary><p>„${esc(answers.ten)}“</p></details><details class="radar-answer-item"><summary><span class="radar-answer-time">30 Sekunden</span><span class="radar-answer-label">${words(answers.thirty)} Wörter</span></summary><p>„${esc(answers.thirty)}“</p></details><details class="radar-answer-item"><summary><span class="radar-answer-time">2 Minuten</span><span class="radar-answer-label">${words(answers.two)} Wörter</span></summary><p>„${esc(answers.two)}“</p></details></div><div class="card-grid two"><article class="card"><p class="card-kicker">Die bessere Frage</p><p class="card-text">Redest du über echte Kosten und Planungssicherheit - oder über den Frame, dass der Staat funktionierende Heizungen pauschal verbietet?</p></article><article class="card"><p class="card-kicker">Frame sichtbar machen</p><p class="card-text">Ich beantworte das, aber ich übernehme nicht den Heizhammer-Frame. Der Frame macht aus Wärmewende Enteignungsangst. Die sachliche Frage ist: Wie wird Heizen langfristig bezahlbar, fossilfrei und sozial fair?</p></article></div><article class="card"><p class="card-kicker">Nicht ins Stöckchen springen</p>${list(["Nicht sagen: Es gab gar kein Problem.", "Nicht soziale Härten kleinreden.", "Nicht Eigentums- und Mietfragen abtun.", "Nicht den Begriff Heizhammer ständig wiederholen.", "Nicht Wärmepumpe als einzige Lösung verkaufen.", "Nicht behaupten, jede fossile Heizung müsse sofort raus.", "Nicht Menschen beschämen, die Angst vor Kosten haben.", "Nicht Regierungskommunikation automatisch verteidigen.", "Nicht in Habeck-Personalisierung hängen bleiben."])}</article></div></section>
      <section class="section section-soft dossier-tab-panel" id="waermewende-verstehen"><div><div class="section-header"><p class="hero-kicker">Wärmewende verstehen</p><h2>Nicht nur Heizungstausch. Infrastrukturpolitik im Zuhause.</h2><p>Die Debatte wurde oft so geführt, als gehe es nur um die Frage: Darf ich meine Heizung behalten oder nicht? Tatsächlich geht es um Gebäudeenergie, fossile Abhängigkeit, Heizkostenrisiken, Klimaziele, kommunale Wärmeplanung, Handwerk, Fördermittel, Mieterschutz, Fernwärme, Wärmepumpen, Biomasse, Hybridlösungen, Wasserstoffversprechen, Sanierung und soziale Fairness.</p></div>${summaryGrid([["Kernsatz", "Wärmewende ist nicht nur Heizungstausch. Wärmewende ist Infrastrukturpolitik im Zuhause.", "positive"], ["Zweiter Kernsatz", "Das Zuhause ist Sicherheit, Identität, Eigentum, Alterssicherung und soziale Stabilität.", "warning"]], "Waermewende Kernsaetze")}<div class="card-grid two"><article class="card"><p class="card-kicker">Was stimmt?</p>${list(whatIsTrue)}</article><article class="card"><p class="card-kicker">Was fehlt?</p>${list(whatIsMissing)}</article></div></div></section>
      <section class="section dossier-tab-panel" id="bilanzgrenzen"><div><div class="section-header"><p class="hero-kicker">Bilanzgrenzen</p><h2>Welche Systemgrenze wurde falsch gesetzt?</h2><p>Keine Ebene allein reicht. Das Heizgesetz wurde politisch so explosiv, weil die Einzelhaushaltsangst nicht rechtzeitig mit der Systemlogik verbunden wurde.</p></div>${matrix(boundaryRows)}</div></section>
      <section class="section section-soft dossier-tab-panel" id="sprache-trigger"><div><div class="section-header"><p class="hero-kicker">Sprache</p><h2>Welche Wörter haben die Debatte aufgeheizt?</h2><p>Host-Satz: Ich markiere den Begriff, aber ich übernehme nicht seine Wirkung.</p></div>${cardGrid(triggerWords, "Triggerwort")}</div></section>
      <section class="section dossier-tab-panel" id="psychologie"><div><div class="section-header"><p class="hero-kicker">Psychologie</p><h2>Warum der Frame so gut funktioniert.</h2></div><div class="card-grid">${psychology.map(([name, effect, move]) => `<article class="card"><p class="card-kicker">${esc(name)}</p><p class="card-text">${esc(effect)}</p><p class="card-text"><strong>Umgehen:</strong> ${esc(move)}</p></article>`).join("")}</div></div></section>
      <section class="section section-soft dossier-tab-panel" id="wirkungspfad"><div><div class="section-header"><p class="hero-kicker">Wirkungspfad</p><h2>Wie aus Regelung Bedrohungsnarrativ wurde.</h2></div>${cardGrid(effectPath, "Pfad")}</div></section>
      <section class="section dossier-tab-panel" id="deep-dive-quellen"><div><div class="section-header"><p class="hero-kicker">Deep Dive &amp; Quellen</p><h2>Quellenkarten statt Linkliste.</h2><p>Datenstand: ${UPDATED_AT}. Jede Quelle ist mit Verwendung und Grenze eingeordnet.</p></div>${sourceCards()}</div></section>
    </main>`;
  const folder = detail ? "detail" : "live";
  return shell({ pageTitle: `${publicTitle} | Wirkungsradar ${pageType}`, description: subtitle, canonical: `https://wirkungsoekonomie.de/wirkungsradar/${folder}/${slug}/`, base: "../../../", main });
}

function topicPage() {
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero"><div class="radar-hero-copy"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / Themen</nav><p class="hero-kicker">Themencluster</p><h1 class="hero-title">Wohnen, Gebäude &amp; Wärme</h1><p class="hero-subtitle">Wärmewende als Infrastrukturpolitik im Zuhause.</p><p class="radar-abstract"><strong>Abstract:</strong> Gebäude, Heizung, Miete, Eigentum, kommunale Wärmeplanung, Netze, Handwerk und soziale Abfederung gehören in eine gemeinsame Wirkungsbilanz.</p><p class="radar-status-line"><span>v2-Prüfung läuft</span><span>Datenstand: ${UPDATED_AT}</span><span>Heizen ist Systemfrage</span></p></div></section>
      ${summaryGrid([["Kernthese", "Wärmewende ist nicht nur Heizungstausch.", "positive"], ["Wirkstoff", "Das Zuhause ist emotional und politisch nicht neutral.", "warning"], ["Risiko", "Fossile Lock-ins, Kostenangst und Vertrauensverlust.", "critical"], ["Werkzeug", "Wärme-T-SROI, Wärmeplanung, Mieterschutz und Förderung.", "positive"]], "Wohnen Waerme Summary")}
      ${nav("../../../")}
      <section class="section"><div><div class="section-header"><p class="hero-kicker">Leuchtturm-Dossier</p><h2>Heizgesetz oder Heizhammer?</h2></div><div class="card-grid"><a class="card text-link-card" href="../../live/${slug}/"><p class="card-kicker">${esc(judgement)}</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(answers.ten)}</p></a></div></div></section>
      <section class="section section-soft"><div><div class="section-header"><p class="hero-kicker">Subclaims</p><h2>Vier Sätze, die in die Tiefe springen.</h2></div>${cardGrid(subclaims, "Wirkungscheck")}</div></section>
      <section class="section"><div><div class="section-header"><p class="hero-kicker">WÖk-Lösung</p><h2>Wärme als Wirkungssystem bauen.</h2></div>${cardGrid([["Gebäude statt Schlagwort", "Heizlast, Dämmung, Technikpfad, Betriebsrisiko und Lebenszykluskosten pro Gebäude sichtbar machen."], ["Kommune statt Blindkauf", "Wärmeplanung so kommunizieren, dass Eigentümer:innen wissen, ob Fernwärme, Quartierslösung oder dezentrale Wärme plausibel ist."], ["Sozial statt symbolisch", "Förderung, Mieterschutz und Härtefälle früh erklären, bevor Angstanker den Raum füllen."], ["Fossile Risiken mitzählen", "Gaspreis, CO₂-Preis, Netzrückbau, Importabhängigkeit und Wasserstoffrealismus in die Kostenbilanz holen."]], "Maßnahme")}</div></section>
    </main>`;
  return shell({ pageTitle: "Wohnen, Gebäude & Wärme | Wirkungsradar Themen", description: "Wirkungsradar-Themencluster zu Gebäude, Heizen, Miete, Eigentum und kommunaler Wärmeplanung.", canonical: `https://wirkungsoekonomie.de/wirkungsradar/themen/${topicSlug}/`, base: "../../../", main });
}

function narrativePage([nSlug, nTitle, nSubtitle, definition]) {
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero narrative-hero"><div class="radar-hero-copy"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / Narrative</nav><p class="hero-kicker">Narrativfamilie · Wärmewende</p><h1 class="hero-title">${esc(nTitle)}</h1><p class="hero-subtitle">${esc(nSubtitle)}</p><p class="radar-abstract"><strong>Definition:</strong> ${esc(definition)}</p><p class="radar-status-line"><span>Wirkungsrisiko: hoch</span><span>Datenstand: ${UPDATED_AT}</span><span>Frame prüfen</span></p></div></section>
      ${summaryGrid([["Wirkstoff", "Komplexität wird in Eigentums-, Kosten- oder Kontrollangst übersetzt.", "critical"], ["Souveräne Antwort", "Wahren Kern anerkennen, falsche Pauschalisierung trennen, lokale Wärmelösung prüfen.", "positive"], ["Psychologie", "Verlustaversion, Reaktanz, Eigentumsangst, Status-quo-Bias.", "warning"]], "Narrativ Summary")}
      ${nav("../../../")}
      <section class="section"><div><div class="section-header"><p class="hero-kicker">Typische Sätze</p><h2>Woran man das Narrativ erkennt.</h2></div>${list(["Der Staat reißt dir die Heizung raus.", "Das ist Enteignung durch die Hintertür.", "Alle müssen eine Wärmepumpe kaufen.", "Das kostet jeden 100.000 Euro.", "Technologieoffenheit heißt: Gas bleibt sicher.", "Berlin entscheidet über deinen Keller."])}</div></section>
      <section class="section section-soft"><div><article class="card"><p class="card-kicker">Gegenbewegung</p><h2 class="card-title">Kosten ernst nehmen, Frame öffnen.</h2><p class="card-text">Nicht beschämen und nicht reflexhaft verteidigen. Erst Kosten, Bestand, Fristen, Förderung und lokale Wärmeplanung trennen. Dann fossile Preis- und Abhängigkeitsrisiken sichtbar machen.</p><p><a class="btn btn-primary" href="../../live/${slug}/">Dossier öffnen</a></p></article></div></section>
    </main>`;
  return shell({ pageTitle: `${nTitle} | Wirkungsradar Narrative`, description: nSubtitle, canonical: `https://wirkungsoekonomie.de/wirkungsradar/narrative/${nSlug}/`, base: "../../../", main });
}

function glossaryPage([termSlug, label, definition, hover]) {
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero term-hero"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Begriffe</a></nav><p class="hero-kicker">Glossar · Wärmewende</p><h1>${esc(label)}</h1><p class="hero-subtitle">${esc(hover)}</p></div></section>
      <section class="section"><div><article class="article-shell glossary-detail"><h2>Definition</h2><p>${esc(definition)}</p><p><a class="btn btn-primary" href="../../wirkungsradar/live/${slug}/">Heizgesetz-Dossier öffnen</a></p></article></div></section>
    </main>`;
  return shell({ pageTitle: `${label} | Glossar`, description: definition, canonical: `https://wirkungsoekonomie.de/begriffe/${termSlug}/`, base: "../../", main });
}

function injectBeforeMainEnd(file, marker, section) {
  if (!fs.existsSync(file)) return;
  const html = fs.readFileSync(file, "utf8");
  if (html.includes(marker)) return;
  const withoutOld = html.replace(new RegExp(`\\n?<section class="section(?: section-soft)?" id="${marker}"[\\s\\S]*?<\\/section>\\n?`, "g"), "\n");
  fs.writeFileSync(file, withoutOld.replace(/\s*<\/main>/, `\n${section}\n    </main>`));
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
  const html = fs.readFileSync(file, "utf8")
    .replace(/<p class="radar-summary-value">\d+ Karten(?: [^<]*)?<\/p>/, `<p class="radar-summary-value">${count} Karten im Wirkungsradar.</p>`)
    .replace(/<h2>\d+ kurze Antworten im Wirkungsradar\.<\/h2>/, `<h2>${count} kurze Antworten im Wirkungsradar.</h2>`);
  fs.writeFileSync(file, html);
}

function writeSourcePack() {
  const sourceMap = Object.fromEntries(sources.map(([label, key, url, useFor, warning]) => [key, { label, url, use_for: [useFor], warning }]));
  writeFile("content/wirkungsradar/source-packs/heating-law-warmth-transition-v1.yaml", `# Generated by scripts/wirkungsradar/build-heating-law-cluster.mjs\n${toYaml({ id: "heating-law-warmth-transition-v1", last_verified: UPDATED_AT, update_frequency: "quarterly", sources: sourceMap }).trim()}\n`);
}

function augmentIndexes() {
  injectBeforeMainEnd("wirkungsradar/themen/index.html", topicSlug, `<section class="section section-soft" id="${topicSlug}"><div><div class="section-header"><p class="hero-kicker">Wohnen, Gebäude &amp; Wärme</p><h2>Neuer Themencluster.</h2></div><div class="card-grid"><a class="card text-link-card" href="${topicSlug}/"><p class="card-kicker">Wärmewende im Zuhause</p><h3 class="card-title">Wohnen, Gebäude &amp; Wärme</h3><p class="card-text">Heizen, Miete, Eigentum, kommunale Wärmeplanung, Förderlogik und fossile Lock-ins als Wirkungsbilanz.</p></a></div></div></section>`);
  injectBeforeMainEnd("wirkungsradar/live/index.html", "heizgesetz-waermewende-live", `<section class="section section-soft" id="heizgesetz-waermewende-live"><div><div class="section-header"><p class="hero-kicker">Wohnen, Gebäude &amp; Wärme</p><h2>Neue Live-Karte.</h2></div><div class="card-grid"><a class="card text-link-card radar-live-card" href="${slug}/"><p class="card-kicker">${esc(judgement)}</p><h3 class="card-title">${esc(title)}</h3><p class="card-text"><strong>10 Sekunden:</strong> ${esc(answers.ten)}</p></a></div></div></section>`);
  injectBeforeMainEnd("wirkungsradar/detail/index.html", "heizgesetz-waermewende-detail", `<section class="section section-soft" id="heizgesetz-waermewende-detail"><div><div class="section-header"><p class="hero-kicker">Wohnen, Gebäude &amp; Wärme</p><h2>Neuer Deep Dive.</h2></div><div class="card-grid"><a class="card text-link-card" href="${slug}/"><p class="card-kicker">${esc(judgement)}</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(subtitle)}</p></a></div></div></section>`);
  injectBeforeMainEnd("wirkungsradar/themen/klima-energie/index.html", "heizgesetz-klima-energie", `<section class="section section-soft" id="heizgesetz-klima-energie"><div><div class="section-header"><p class="hero-kicker">Gebäude &amp; Wärme</p><h2>Wärmewende als Klimahebel.</h2></div><div class="card-grid"><a class="card text-link-card" href="../../live/${slug}/"><p class="card-kicker">${esc(judgement)}</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">Gebäudeenergie, Heizkosten, fossile Abhängigkeit und Sprache gehören in eine gemeinsame Wirkungsbilanz.</p></a></div></div></section>`);
  injectBeforeMainEnd("wirkungsradar/themen/demokratie-oeffentlichkeit/index.html", "heizgesetz-demokratie-oeffentlichkeit", `<section class="section section-soft" id="heizgesetz-demokratie-oeffentlichkeit"><div><div class="section-header"><p class="hero-kicker">Kommunikation &amp; Vertrauen</p><h2>Wenn ein Frame Deutungshoheit gewinnt.</h2></div><div class="card-grid"><a class="card text-link-card" href="../../live/${slug}/"><p class="card-kicker">Sprachwirkung</p><h3 class="card-title">Heizhammer als Kommunikationslehrstück</h3><p class="card-text">Der Fall zeigt, wie Verlustangst, Reaktanz und Misstrauen eine Sachdebatte verschieben können.</p></a></div></div></section>`);
  injectBeforeMainEnd("wirkungsradar/themen/wirtschaft-transformation/index.html", "heizgesetz-wirtschaft-transformation", `<section class="section section-soft" id="heizgesetz-wirtschaft-transformation"><div><div class="section-header"><p class="hero-kicker">Transformation &amp; Investition</p><h2>Wärme als Investitionspfad.</h2></div><div class="card-grid"><a class="card text-link-card" href="../../live/${slug}/"><p class="card-kicker">Fossile Lock-ins vermeiden</p><h3 class="card-title">Heizkostenrisiko, Netze und Kapitalbindung</h3><p class="card-text">Wärmewende entscheidet über Betriebskosten, Handwerk, Netze, Resilienz und langfristige Kapitalwirkung.</p></a></div></div></section>`);
  updateLiveIndexCount();
}

writeSourcePack();
writeFile(`wirkungsradar/live/${slug}/index.html`, livePage(false));
writeFile(`wirkungsradar/detail/${slug}/index.html`, livePage(true));
writeFile(`wirkungsradar/themen/${topicSlug}/index.html`, topicPage());
for (const narrative of narratives) writeFile(`wirkungsradar/narrative/${narrative[0]}/index.html`, narrativePage(narrative));
for (const term of glossaryTerms) {
  const file = `begriffe/${term[0]}/index.html`;
  if (!fs.existsSync(file)) writeFile(file, glossaryPage(term));
}
augmentIndexes();

console.log("Built heating-law cluster: 1 live dossier, 1 detail page, 1 topic cluster, 5 narratives, 7 glossary pages.");
