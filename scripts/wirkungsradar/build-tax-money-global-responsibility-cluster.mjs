import fs from "node:fs";
import path from "node:path";

const UPDATED_AT = "2026-06-03";
const ASSET_VERSION = "20260603-tax-money-global";
const clusterSlug = "steuergeld-globale-verantwortung-fairness";
const clusterTitle = "Steuergeld, globale Verantwortung & Fairness";
const clusterSubtitle = "Warum „unser Geld geht weg“ oft die falsche Bilanzgrenze setzt.";
const clusterAbstract =
  "Viele politische Narrative funktionieren über denselben Impuls: Steuergeld wird als knappe Ressource gezeigt, die angeblich „für andere“ ausgegeben wird, während „wir hier“ Probleme haben. Diese Sorge ist nicht falsch: Öffentliche Mittel sind begrenzt und müssen wirksam, transparent und kontrolliert eingesetzt werden. Irreführend wird das Narrativ, wenn es falsche Gegensätze baut: Inland gegen Ausland, Bauern gegen Radwege, Rentner gegen Ukraine, Arme gegen Migrant:innen, Steuerzahler gegen Entwicklungszusammenarbeit, Mittelstand gegen Reiche. Wirkungsökonomisch lautet die bessere Frage: Welche Ausgabe erzeugt welche Netto-Wirkung, welche Risiken vermeidet sie, welche Folgekosten senkt sie und welche Zustände verbessert sie für Mensch, Planet und Demokratie?";

const sources = [
  ["BMZ FAQ - Radwege in Peru", "bmz_radwege_faq", "https://www.bmz.de/de/fragen-an-das-entwicklungsministerium", "Korrektur der 315-Millionen-Zahl; 20 Mio. Euro Zuschuss Lima; 24 Mio. Euro weitere Zusage.", "BMZ ist Regierungsquelle; KfW und unabhängige Einordnung ergänzen."],
  ["BMZ - Nachhaltige Mobilität in Lima", "bmz_lima_mobilitaet", "https://www.bmz.de/de/laender/peru/nachhaltige-mobilitaet-in-lima", "Integriertes Verkehrssystem, Kredite vs. Zuschüsse, Radwege als Zubringer.", "Projekt- und Finanzierungsstand regelmäßig prüfen."],
  ["KfW - Stellungnahme zu Peru", "kfw_peru_stellungnahme", "https://www.kfw.de/%C3%9Cber-die-KfW/Newsroom/Aktuelles/News-Details_843072.html", "Radwege als Teil des Verkehrskonzepts, CO2- und Teilhabewirkung, deutsche Unternehmensaufträge.", "KfW ist Umsetzungs-/Finanzierungsakteur; Wirkungsdaten ergänzen."],
  ["KfW - Fakten zur Entwicklungszusammenarbeit", "kfw_entwicklungszusammenarbeit", "https://www.kfw.de/%C3%9Cber-die-KfW/Newsroom/Aktuelles/Entwicklungszusammenarbeit.html", "Kredite vs. Zuschüsse, Rückzahlung, Evaluation und deutsches Interesse.", "Allgemeine Einordnung; konkrete Projektbilanz separat prüfen."],
  ["Bundesregierung - So unterstützt Deutschland die Ukraine", "bundesregierung_ukraine_hilfe", "https://www.bundesregierung.de/breg-de/aktuelles/deutschland-hilft-der-ukraine-2160274", "Offizielle Zahlen, zivile und militärische Unterstützung, Energieinfrastruktur, humanitäre Hilfe.", "Bilanzgrenzen und Aktualisierung prüfen."],
  ["BMF Wissenschaftlicher Beirat - Ukraine-Hilfe", "bmf_beirat_ukraine", "https://www.bundesfinanzministerium.de/Content/DE/Downloads/Ministerium/Wissenschaftlicher-Beirat/Gutachten/ukraine-hilfe-der-bundesregierung.pdf", "Finanzpolitische Einordnung, jährliche Kosten, BIP-Anteil, Kosten von Nicht-Unterstützung.", "Gutachtenstand und Annahmen mit neueren Daten abgleichen."],
  ["Kiel Institute - Ukraine Support Tracker", "kiel_ukraine_tracker", "https://www.kielinstitut.de/topics/war-against-ukraine/ukraine-support-tracker/", "Internationaler Vergleich, militärische, finanzielle und humanitäre Hilfe.", "Methodik und Datenstand beachten."],
  ["Bundesbank - Vermögen privater Haushalte", "bundesbank_phf", "https://www.bundesbank.de/de/bundesbank/forschung/studie-zur-wirtschaftlichen-lage-privater-haushalte-phf/ergebnisse-604886", "Vermögensverteilung, Nettovermögen und Ungleichheitsdaten Deutschland.", "Vermögen ist Verteilungsindikator, kein Personenurteil."],
  ["World Inequality Database", "wid", "https://wid.world/", "Internationale Einkommens- und Vermögensungleichheit.", "Länder- und Methodikunterschiede beachten."],
  ["Oxfam - globale Ungleichheit", "oxfam_inequality", "https://www.oxfam.org/", "Globale Vermögenskonzentration, politische Macht durch Vermögen, Klimagerechtigkeit.", "Advocacy-Quelle; Methodik transparent einordnen."],
];

const dossiers = [
  {
    slug: "radwege-in-peru",
    title: "Radwege in Peru?",
    subtitle: "Warum dieses Beispiel größer ist als ein Fahrradweg.",
    judgement: "Wahrer Prioritätenkern, falscher Steuergeld-Frame.",
    claim: "Für Radwege in Peru ist Geld da, aber für unsere Probleme nicht.",
    abstract:
      "Das Narrativ „Deutschland zahlt Radwege in Peru, während hier Geld fehlt“ enthält einen wahren Kern: Bürger:innen dürfen fragen, wofür öffentliche Mittel eingesetzt werden und ob Projekte wirksam, transparent und zusätzlich sind. Irreführend wird das Narrativ, wenn falsche Zahlen, falsche Gegensätze und eine zu enge Bilanzgrenze verwendet werden. Bei Peru geht es nicht um ein isoliertes Luxusprojekt, sondern um nachhaltige urbane Mobilität, Klimaschutz, Luftqualität, Teilhabe, Stadtentwicklung, internationale Kooperation und teilweise auch wirtschaftliche Rückwirkungen nach Deutschland.",
    points: [
      ["Die 315-Millionen-Zahl ist falsch verkürzt", "Für Radwege nennt das BMZ 20 Mio. Euro Zuschuss für Lima und weitere 24 Mio. Euro Zusage für Radwege in Peru."],
      ["Nicht alles ist Zuschuss", "Größere Mobilitätsbestandteile laufen als Entwicklungskredite und sind rückzahlbar."],
      ["Radwege sind Teil eines Verkehrssystems", "Sie dienen als Zubringer zu Metro- und Schnellbussystemen."],
      ["Nutzen entsteht durch Klima, Luft und Teilhabe", "Weniger Emissionen, weniger Luftverschmutzung und günstigere Mobilität wirken auf Gesundheit und soziale Teilhabe."],
      ["Deutschland profitiert auch strategisch", "Klimaschutz, Handelsbeziehungen, Exportchancen und globale Stabilität liegen im deutschen Interesse."],
      ["WÖk verlangt Wirkungskontrolle", "Nicht Symbolpolitik, sondern T-SROI, Evaluierung, Transparenz und Additionality."],
    ],
    answers: {
      ten: "Die 315-Millionen-Zahl für Radwege ist falsch. Tatsächlich geht es um 20 Mio. Euro Zuschuss plus weitere 24 Mio. Euro Zusage - als Teil eines Verkehrssystems mit Klima-, Luft- und Teilhabewirkung.",
      thirty:
        "Der wahre Kern ist: Steuergeld muss geprüft werden. Der Denkfehler ist: Radwege in Peru als Luxusprojekt gegen deutsche Probleme auszuspielen. Es geht um ein integriertes Verkehrssystem, weniger CO2, weniger Luftverschmutzung, günstigere Mobilität und internationale Stabilität. Die bessere Frage ist: Welche Wirkung hat das Projekt - und wird sie geprüft?",
      two:
        "Ich würde zuerst die Bilanzgrenze prüfen. Reden wir über Zuschuss oder Kredit? Über einen isolierten Radweg oder ein Verkehrssystem? Über Kosten oder Wirkung? Das Peru-Beispiel wirkt als Stöckchen, weil ein konkretes fremdes Projekt gegen ein nahes deutsches Problem gestellt wird. Aber laut BMZ geht es bei den Radwegen nicht um 315 Millionen Euro Zuschuss, sondern um deutlich kleinere Zuschüsse und um ein größeres Mobilitätspaket mit Krediten. Wirkungsökonomisch ist die Frage deshalb nicht: Peru oder Deutschland? Sondern: Welche Ausgabe erzeugt welche Wirkung, welche Rückflüsse oder Stabilitätsgewinne entstehen, und wird die Wirkung transparent kontrolliert?",
    },
    question: "Vergleichst du gerade eine falsche Schlagzeile mit einem deutschen Problem - oder prüfst du Zuschuss, Kredit, Wirkung und Rückflüsse?",
    frame: "Ich beantworte das, aber ich übernehme nicht den Frame „Peru gegen Deutschland“. Die bessere Wirkungsfrage ist: Welche Ausgabe erzeugt welche Wirkung - hier und global?",
    sourceKeys: ["bmz_radwege_faq", "bmz_lima_mobilitaet", "kfw_peru_stellungnahme", "kfw_entwicklungszusammenarbeit"],
  },
  {
    slug: "ukraine-unterstuetzung-steuergeld",
    title: "Unser Steuergeld geht in die Ukraine?",
    subtitle: "Warum Unterstützung auch Sicherheits- und Präventionspolitik ist.",
    judgement: "Wahrer Kostenkern, falscher Geld-weg-Frame.",
    claim: "Wir könnten das Geld selbst besser gebrauchen.",
    abstract:
      "Die Aussage „Unser Steuergeld geht in die Ukraine, während wir es hier besser brauchen könnten“ enthält einen wahren Kern: Ukraine-Unterstützung kostet reales Geld, und Deutschland hat große eigene Aufgaben. Irreführend wird sie, wenn die Unterstützung als reiner Geldabfluss dargestellt wird. Wirkungsökonomisch ist Ukraine-Hilfe eine Sicherheits-, Stabilitäts-, Rechtsstaats- und Präventionsfrage.",
    points: [
      ["Es geht um reales Geld", "Ukraine-Hilfe muss transparent, kontrolliert und europäisch fair verteilt werden."],
      ["Es ist kein reiner Geldabfluss", "Unterstützung wirkt auf Sicherheit, Völkerrecht, Energieinfrastruktur, Flüchtlingskosten und europäische Stabilität."],
      ["Nicht-Unterstützung hätte Kosten", "Eine militärische Niederlage der Ukraine könnte höhere Sicherheits-, Flüchtlings-, Handels- und Verteidigungskosten erzeugen."],
      ["Zahlen sauber trennen", "Militärhilfe, zivile Hilfe, EU-Kredite, Geflüchtetenkosten und künftige Verpflichtungen sind verschiedene Bilanzgrenzen."],
      ["Kontrolle bleibt Pflicht", "Korruptionsschutz, Beschaffungsprüfung, Priorisierung und europäische Lastenteilung sind zentral."],
      ["WÖk-Antwort: Sicherheits-T-SROI", "Jede Unterstützung wird nach Risiko, Wirkung, Prävention, Resilienz und demokratischer Ordnung bewertet."],
    ],
    answers: {
      ten: "Ukraine-Hilfe ist nicht einfach Geld weg. Sie ist Sicherheits- und Präventionspolitik. Die bessere Frage ist: Was kostet Unterstützung - und was kostet Nicht-Unterstützung?",
      thirty:
        "Der wahre Kern ist: Deutschland hat eigene Probleme und Ukraine-Hilfe kostet Geld. Der Denkfehler ist: sie als reinen Geldabfluss zu sehen. Wenn die Ukraine verliert, können die Kosten für Europa höher werden: mehr Sicherheitsdruck, mehr Flucht, mehr Verteidigungsausgaben, mehr Erpressbarkeit. Wirkung heißt hier: Risiko vermeiden.",
      two:
        "Natürlich muss Ukraine-Hilfe kontrolliert werden. Es geht um reale Haushaltsmittel, reale Prioritäten und reale Beschaffung. Aber der Satz „das Geld geht weg“ setzt eine zu enge Bilanzgrenze. Unterstützung kann Sicherheitskosten vermeiden, Völkerrecht schützen, europäische Stabilität sichern, Energie- und Versorgungsinfrastruktur stabilisieren, weitere Fluchtbewegungen begrenzen und Abschreckung stärken. Wirkungsökonomisch fragt man deshalb nicht nur: Was kostet die Hilfe? Sondern auch: Was kostet Nicht-Hilfe? Entscheidend sind Transparenz, europäische Lastenteilung, Korruptionsschutz, Beschaffungswirkung, Resilienz und eine klare Friedens- und Sicherheitslogik.",
    },
    question: "Reden wir über die Haushaltsausgabe - oder über die Kosten einer ukrainischen Niederlage für Deutschland und Europa?",
    frame: "Ich übernehme nicht den Frame „Ukraine gegen Deutschland“. Die Wirkungsfrage lautet: Welche Unterstützung verhindert größere Schäden für Europa, Rechtsstaat und Sicherheit?",
    sourceKeys: ["bundesregierung_ukraine_hilfe", "bmf_beirat_ukraine", "kiel_ukraine_tracker"],
  },
  {
    slug: "die-boesen-reichen",
    title: "Sind die Reichen schuld?",
    subtitle: "Warum Vermögen eine Wirkungsfrage ist - keine Personenbeschimpfung.",
    judgement: "Wahrer Ungleichheitskern, falsche Personalisierung.",
    claim: "Die Reichen sind an allem schuld.",
    abstract:
      "Die Aussage „Die Reichen sind schuld“ enthält einen wahren Kern: Extreme Vermögenskonzentration, Steuervermeidung, Erbschaftsprivilegien, Spekulation, Lobbyeinfluss, Monopolmacht und klimaschädlicher Luxuskonsum können Demokratie, Sozialstaat, Klima und Zusammenhalt belasten. Irreführend wird die Aussage, wenn daraus pauschale Personenschuld entsteht. Wirkungsökonomisch ist nicht Reichtum als solcher der Maßstab, sondern Kapitalwirkung.",
    points: [
      ["Ungleichheit ist real", "Vermögenskonzentration, Erbschaften und Kapitalmacht sind reale Wirkungsfragen."],
      ["Nicht Personenschuld", "Nicht jeder reiche Mensch wirkt gleich; entscheidend ist, was Kapital verändert."],
      ["Kapital kann produktiv wirken", "Innovation, gute Arbeit, klimaneutrale Produktion und regionale Wertschöpfung stärken Gesellschaft."],
      ["Kapital kann extraktiv wirken", "Wohnungsverknappung, Monopolrenditen, Steuervermeidung und fossile Externalisierung schwächen Gesellschaft."],
      ["Steuerfairness bleibt zentral", "Leistung, Risiko und Innovation schützen - Renten, Machtmissbrauch und Schäden begrenzen."],
      ["WÖk-Satz", "Nicht Reiche bestrafen. Kapital nach Wirkung lesen."],
    ],
    answers: {
      ten: "Nicht Reiche bestrafen. Kapital nach Wirkung lesen. Vermögen ist nicht automatisch schlecht - aber Steuervermeidung, Monopolmacht und schädliche Externalisierung sind echte Wirkungsfragen.",
      thirty:
        "Der wahre Kern ist: Vermögen kann Macht, Lobbyeinfluss, Spekulation und Ungleichheit verstärken. Der Denkfehler ist: daraus pauschale Personenschuld zu machen. Wirkungsökonomisch zählt Kapitalwirkung: Schafft Kapital gute Arbeit, Innovation und Resilienz - oder verknappt es Wohnen, kauft Einfluss und externalisiert Schäden?",
      two:
        "Ich würde die moralische Abkürzung vermeiden. Es gibt reale Probleme: Vermögenskonzentration, Erbschaftsvorteile, Steuervermeidung, Bodenrenten, Monopolmacht, Lobbyeinfluss und klimaschädlicher Luxuskonsum können Demokratie, Sozialstaat und Klima belasten. Aber „die Reichen“ als Personengruppe zum Schuldigen zu machen, hilft nicht. Wirkungsökonomisch zählt: Welche Wirkung hat Kapital? Ein Unternehmen, das gute Arbeit, Innovation und klimaneutrale Produktion schafft, wirkt anders als Kapital, das Wohnungen verknappt, Steuern vermeidet oder Schäden externalisiert. Die Lösung ist nicht Neid und nicht Freibrief, sondern Kapitalwirkung, Steuerfairness, Wettbewerbsordnung und demokratische Resilienz.",
    },
    question: "Reden wir über Menschen als Sündenbock - oder über Kapitalwirkung, Steuerfairness und demokratische Machtverteilung?",
    frame: "Ich übernehme weder „Reiche sind böse“ noch „Leistungsträger werden ausgepresst“. Die bessere Frage lautet: Welche Kapitalwirkung stärkt Mensch, Planet und Demokratie?",
    sourceKeys: ["bundesbank_phf", "wid", "oxfam_inequality"],
  },
  {
    slug: "leistungstraeger-werden-ausgepresst",
    title: "Werden Leistungsträger ausgepresst?",
    subtitle: "Warum Leistung geschützt werden muss - und trotzdem nicht jede Rendite Wirkleistung ist.",
    judgement: "Wahrer Leistungs- und Investitionskern, aber Kapitalwirkung und Steuerfairness fehlen.",
    claim: "Leistungsträger werden ausgepresst.",
    abstract:
      "Die Aussage „Leistungsträger werden ausgepresst“ enthält einen wahren Kern: Leistung, Unternehmertum, Risiko, Innovation, Facharbeit und Investitionen dürfen nicht durch schlechte Regeln, Überbürokratie oder wirkungsarme Abgaben erstickt werden. Irreführend wird sie, wenn Einkommen und Vermögen automatisch als Leistung gelesen werden und Erbschaft, Bodenrente, Monopolmacht, Spekulation, Steuergestaltung oder Externalisierung unsichtbar bleiben.",
    points: [
      ["Leistung braucht Schutz", "Arbeit, Unternehmertum, Innovation und Risiko dürfen nicht entmutigt werden."],
      ["Nicht jede Rendite ist Leistung", "Erbschaft, Bodenrente, Monopolmacht und Spekulation erzeugen nicht automatisch Wirkleistung."],
      ["Bürokratie kann Blindleistung erzeugen", "Regeln müssen Schutz und Wirkung schaffen, nicht nur Aufwand."],
      ["Steuern brauchen Legitimität", "Wer zahlt, muss sehen können, welche Wirkung öffentliche Ausgaben erzeugen."],
      ["Kapitalwirkung entscheidet", "Investition in gute Arbeit wirkt anders als Extraktion ohne Zustandsverbesserung."],
      ["WÖk-Antwort", "Leistung stärken, Blindleistung senken, schädliche Renten begrenzen."],
    ],
    answers: {
      ten: "Leistung soll sich lohnen. Aber nicht jede Rendite ist Leistung. Die bessere Frage ist: Welche Abgaben bremsen Wirkleistung - und welche begrenzen Spekulation, Monopolmacht oder Schäden?",
      thirty:
        "Der wahre Kern ist: Arbeit, Unternehmertum und Innovation dürfen nicht durch schlechte Regeln und Blindleistung erdrückt werden. Der Denkfehler ist: jedes hohe Einkommen oder Vermögen automatisch als Leistung zu lesen. Wirkungsökonomisch trennen wir Wirkleistung von Erbschaft, Bodenrente, Monopolmacht, Spekulation und externalisierten Schäden.",
      two:
        "Ich nehme den Punkt ernst: Wer arbeitet, gründet, investiert, ausbildet, pflegt, forscht oder Verantwortung trägt, darf nicht durch sinnlose Bürokratie und wirkungsarme Abgaben blockiert werden. Aber der Satz wird irreführend, wenn er jede Vermögensrendite als Leistung schützt. Erbschaft, Bodenrente, Monopolmacht, Steuervermeidung, Spekulation und Externalisierung sind andere Wirkungen als Innovation, gute Arbeit und Produktivität. Wirkungsökonomisch lautet die Lösung: Leistung stärken, Blindleistung abbauen, Investitionen erleichtern, aber schädliche Renten, Machtkonzentration und ökologische oder soziale Folgekosten fair einpreisen.",
    },
    question: "Meinst du Arbeit, Unternehmertum und Innovation - oder schützt der Satz auch Erbschaft, Bodenrente, Monopolmacht und Spekulation?",
    frame: "Ich übernehme nicht den Frame „Staat gegen Leistung“. Die bessere Wirkungsfrage lautet: Welche Regeln stärken Wirkleistung und welche begrenzen leistungsloses Abschöpfen?",
    sourceKeys: ["bundesbank_phf", "wid"],
  },
];

const backlog = [
  ["entwicklungshilfe-warum-nicht-zuerst-deutschland", "Warum Entwicklungshilfe, wenn wir hier Probleme haben?", "Wahrer Prioritätenkern, falsche Inland-Ausland-Trennung."],
  ["klimafinanzierung-wir-zahlen-fuer-andere", "Klimafinanzierung: Zahlen wir für andere?", "Wahrer Kostenkern, aber globale Verantwortung und Eigeninteresse fehlen."],
  ["eu-nettozahler-deutschland-zahlt-alles", "Deutschland zahlt für die ganze EU?", "Nettozahler-Zahl greift zu kurz; Binnenmarkt, Stabilität und Exportnutzen fehlen."],
  ["entwicklungshilfe-china-indien", "Warum Geld für China und Indien?", "Meist verkürzt: Kredite, Klimaprojekte und globale Hebel müssen getrennt werden."],
  ["ngos-kassieren-steuergeld", "NGOs kassieren unser Steuergeld?", "Wahrer Kontrollkern, falscher Pauschalverdacht."],
  ["kultur-gender-luxusprojekte", "Geld für Kultur und Gender statt echte Probleme?", "Wahrer Prioritätenkern, aber Demokratie-, Gewaltpräventions- und Teilhabewirkung fehlen."],
  ["waffenlieferungen-verlaengern-den-krieg", "Waffenlieferungen verlängern den Krieg?", "Echte Friedensfrage, aber ohne Abschreckung, Verteidigungsfähigkeit und Verhandlungsmacht verkürzt."],
  ["steuerverschwendung-buerokratie", "Der Staat verschwendet unser Geld?", "Wahrer Effizienzkern, aber Lösung ist Wirkungshaushalt statt pauschaler Staatsverachtung."],
];

const glossaryTerms = [
  ["steuergeld-frame", "Steuergeld-Frame", "Deutungsrahmen, der öffentliche Ausgaben primär als Wegnahme oder Verlust darstellt.", "Der Frame ist berechtigt, wenn Transparenz fehlt. Er wird problematisch, wenn Wirkung, Rückflüsse und Risikovermeidung ausgeblendet werden."],
  ["ausland-statt-inland-narrativ", "Ausland-statt-Inland-Narrativ", "Narrativ, das Ausgaben im Ausland gegen Probleme im Inland ausspielt.", "Nicht jede Auslandsausgabe ist sinnvoll. Aber nicht jede Inlandsausgabe ist wirksam. Entscheidend ist die Netto-Wirkung."],
  ["globale-oeffentliche-gueter", "Globale öffentliche Güter", "Güter und Stabilitätsbedingungen, von denen viele Länder profitieren, etwa Klima, Frieden, Biodiversität, Pandemievorsorge, Handelswege und internationale Ordnung.", "Globale öffentliche Güter schützen auch Deutschland, weil Klima, Sicherheit, Handel und Gesundheit nicht an Grenzen enden."],
  ["sicherheits-t-sroi", "Sicherheits-T-SROI", "Wirkungsbewertung von Sicherheits- und Präventionsausgaben nach vermiedenen Schäden, Resilienz, Stabilität und demokratischer Ordnung.", "Nicht nur fragen: Was kostet Hilfe? Sondern auch: Was kostet Nicht-Hilfe?"],
  ["kapitalwirkung", "Kapitalwirkung", "Wirkung von Kapital auf Innovation, Arbeit, Klima, Wohnen, Demokratie, Machtverteilung und gesellschaftliche Resilienz.", "Kapital ist nicht gut oder schlecht. Entscheidend ist, welche Zustände es verändert."],
  ["wirkungsausgabe", "Wirkungsausgabe", "Öffentliche Ausgabe, die eine nachvollziehbare positive Netto-Wirkung erzeugt.", "Eine Wirkungsausgabe braucht Ziel, Daten, Wirkungspfad, Kontrolle und Evaluation."],
  ["symbolausgabe", "Symbolausgabe", "Ausgabe, die politisch gut klingt, aber keine ausreichende Zustandsveränderung erzeugt.", "Symbolausgaben bewegen Geld, aber erzeugen wenig Wirkung."],
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
    <footer class="footer" data-search-exclude><div class="footer-grid"><div><p class="hero-kicker">Wirkungsökonomie</p><h2>Wirkung statt Symbolbilanz</h2><p>Wirkungsradar: Faktenkern, Narrativ, Psychologie, Wirkungspfad und bessere Handlungsfrage.</p></div><a class="btn btn-primary" href="${base}wirkungsradar/">Wirkungsradar öffnen</a></div></footer>
    <script src="${base}assets/js/main.js?v=${ASSET_VERSION}"></script>
  </body>
</html>
`;
}

function summaryGrid(items, label = "") {
  return `<div class="radar-summary-grid" aria-label="${esc(label)}">${items.map(([title, value, tone = "neutral"]) => `<article class="radar-summary-item" data-tone="${esc(tone)}"><p class="radar-summary-label">${esc(title)}</p><p class="radar-summary-value">${esc(value)}</p></article>`).join("")}</div>`;
}

function cardGrid(items, kicker = "Baustein") {
  return `<div class="card-grid">${items.map(([title, text, tone = ""]) => `<article class="card"><p class="card-kicker">${esc(kicker)}</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(text)}</p>${tone ? `<p class="card-text"><strong>Status:</strong> ${esc(tone)}</p>` : ""}</article>`).join("")}</div>`;
}

function nav(base) {
  return `<nav class="radar-subnav" aria-label="Wirkungsradar Navigation" data-search-exclude><a href="${base}wirkungsradar/">Überblick</a><a href="${base}wirkungsradar/live/">Live</a><a href="${base}wirkungsradar/themen/">Themen</a><a href="${base}wirkungsradar/narrative/">Narrative</a><a href="${base}wirkungsradar/psychologie/">Psychologie</a></nav>`;
}

function sourceCards(keys) {
  const items = sources.filter(([, key]) => keys.includes(key));
  return `<div class="card-grid">${items.map(([label, key, url, useFor, warning]) => `<article class="card" id="quelle-${esc(key)}"><p class="card-kicker">Quelle vorbereiten</p><h3 class="card-title">${esc(label)}</h3><p class="card-text"><strong>Verwendet für:</strong> ${esc(useFor)}</p><p class="card-text"><strong>Grenze:</strong> ${esc(warning)}</p><p><a class="text-link" href="${esc(url)}">Quelle öffnen</a></p></article>`).join("")}</div>`;
}

function livePage(dossier, detail = false) {
  const pageType = detail ? "Detail" : "Live";
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero"><div class="radar-hero-copy"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / ${pageType}</nav><p class="hero-kicker">Steuergeld, globale Verantwortung &amp; Fairness · checked_candidate</p><h1 class="hero-title">${esc(dossier.title)}</h1><p class="hero-subtitle">${esc(dossier.subtitle)}</p><p class="radar-abstract"><strong>Abstract:</strong> ${esc(dossier.abstract)}</p><p class="radar-status-line"><span>Kurzurteil: ${esc(dossier.judgement)}</span><span>Datenstand: ${UPDATED_AT}</span><span>Bilanzgrenze prüfen</span></p></div></section>
      ${summaryGrid([["Kurzurteil", dossier.judgement, "warning"], ["Kernregel", "Steuergeld ist nicht weg, wenn Wirkung entsteht.", "positive"], ["Noch kürzer", "Nicht Ort zählt. Wirkung zählt.", "positive"], ["Claim", dossier.claim, "neutral"]], `${dossier.title} Summary`)}
      ${nav("../../../")}
      <section class="section" id="sechs-punkte"><div><div class="section-header"><p class="hero-kicker">Das Wichtigste</p><h2>Sechs Punkte für die Wirkungsbilanz.</h2></div>${cardGrid(dossier.points, "Kernpunkt")}</div></section>
      <nav class="dossier-tab-nav" aria-label="Dossierbereiche" data-search-exclude><a href="#live-antworten">Live antworten</a><a href="#bilanzgrenze">Bilanzgrenze</a><a href="#deep-dive-quellen">Quellen</a></nav>
      <section class="section dossier-tab-panel" id="live-antworten"><div><div class="section-header"><p class="hero-kicker">Live antworten</p><h2>Wahren Kern anerkennen, falschen Gegensatz öffnen.</h2></div><div class="radar-answer-accordion host-answer-tabs"><details class="radar-answer-item" open><summary><span class="radar-answer-time">10 Sekunden</span><span class="radar-answer-label">${words(dossier.answers.ten)} Wörter</span></summary><p>„${esc(dossier.answers.ten)}“</p></details><details class="radar-answer-item"><summary><span class="radar-answer-time">30 Sekunden</span><span class="radar-answer-label">${words(dossier.answers.thirty)} Wörter</span></summary><p>„${esc(dossier.answers.thirty)}“</p></details><details class="radar-answer-item"><summary><span class="radar-answer-time">2 Minuten</span><span class="radar-answer-label">${words(dossier.answers.two)} Wörter</span></summary><p>„${esc(dossier.answers.two)}“</p></details></div><div class="card-grid two"><article class="card"><p class="card-kicker">Gute Rückfrage</p><p class="card-text">${esc(dossier.question)}</p></article><article class="card"><p class="card-kicker">Frame sichtbar machen</p><p class="card-text">${esc(dossier.frame)}</p></article></div></div></section>
      <section class="section section-soft dossier-tab-panel" id="bilanzgrenze"><div><div class="section-header"><p class="hero-kicker">Bilanzgrenze prüfen</p><h2>Ausgabe, Wirkung, Rückfluss, Risiko und Unterlassungskosten.</h2><p>Der Wirkstoff dieser Narrative ist fast immer gleich: Sichtbares Steuergeld wird gegen unsichtbare Wirkungsgewinne ausgespielt. Wirkungsökonomisch zählt die Netto-Wirkung, nicht der Ort der Ausgabe allein.</p></div>${cardGrid([["Was stimmt?", "Öffentliche Mittel sind begrenzt. Ausgaben brauchen Transparenz, Priorisierung, Wirkungskontrolle und Missbrauchsschutz."], ["Was fehlt?", "Systemnutzen, Risikovermeidung, Rückflüsse, Kredite, Sicherheit, Klima, Handel, Stabilität und Unterlassungskosten verschwinden oft."], ["WÖk-Lösung", "Wirkungshaushalt, T-SROI, Additionality, Kredite/Zuschüsse trennen, Rückflüsse zeigen, Unterlassungskosten berechnen, Missbrauchsschutz sichern."]], "Prüfschritt")}</div></section>
      <section class="section dossier-tab-panel" id="psychologie"><div><div class="section-header"><p class="hero-kicker">Psychologischer Wirkungscheck</p><h2>Warum der Satz zieht.</h2></div>${summaryGrid([["Verlustaversion", "Geldabfluss wirkt stärker als abstrakter Nutzen.", "warning"], ["Nullsummendenken", "Ausgabe dort wirkt automatisch wie Verlust hier.", "warning"], ["Ingroup/Outgroup", "„Wir“ gegen „die anderen“ macht Verteilung emotional.", "warning"], ["Kontrolle zurückholen", "Zuschuss, Kredit, Wirkung und Unterlassungskosten getrennt prüfen.", "positive"]], "Psychologie Steuergeld")}</div></section>
      <section class="section section-soft dossier-tab-panel" id="deep-dive-quellen"><div><div class="section-header"><p class="hero-kicker">Quellen</p><h2>Quellenkarten statt Linkliste.</h2><p>Datenstand: ${UPDATED_AT}. Jede Quelle ist mit Verwendung und Grenze eingeordnet.</p></div>${sourceCards(dossier.sourceKeys)}</div></section>
    </main>`;
  const folder = detail ? "detail" : "live";
  return shell({ title: `${dossier.title} | Wirkungsradar ${pageType}`, description: dossier.subtitle, canonical: `https://wirkungsoekonomie.de/wirkungsradar/${folder}/${dossier.slug}/`, base: "../../../", main });
}

function clusterPage() {
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero"><div class="radar-hero-copy"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / Themen</nav><p class="hero-kicker">Themencluster · checked_candidate</p><h1 class="hero-title">${esc(clusterTitle)}</h1><p class="hero-subtitle">${esc(clusterSubtitle)}</p><p class="radar-abstract"><strong>Abstract:</strong> ${esc(clusterAbstract)}</p><p class="radar-status-line"><span>Status: checked_candidate</span><span>Datenstand: ${UPDATED_AT}</span><span>Nicht Ort zählt. Wirkung zählt.</span></p></div></section>
      ${summaryGrid([["Kurzclaim", "Steuergeld ist nicht weg, wenn Wirkung entsteht.", "positive"], ["Kernthese", "Nicht jede Inlandsausgabe ist wirksam. Nicht jede Auslandsausgabe ist verschenkt.", "warning"], ["Wirkstoff", "Sichtbare Haushaltskosten werden gegen unsichtbare Systemwirkung ausgespielt.", "critical"], ["Werkzeug", "T-SROI, Wirkungshaushalt, Additionality und Unterlassungskosten.", "positive"]], "Cluster Summary")}
      ${nav("../../../")}
      <section class="section"><div><div class="section-header"><p class="hero-kicker">Leuchtturm-Dossiers</p><h2>Priorität 1 bis 4.</h2></div><div class="card-grid">${dossiers.map((item) => `<a class="card text-link-card" href="../../live/${esc(item.slug)}/"><p class="card-kicker">${esc(item.judgement)}</p><h3 class="card-title">${esc(item.title)}</h3><p class="card-text">${esc(item.answers.ten)}</p></a>`).join("")}</div></div></section>
      <section class="section section-soft"><div><div class="section-header"><p class="hero-kicker">Backlog</p><h2>Nächste Dossiers als Ausbaustufe.</h2></div>${cardGrid(backlog, "draft/subclaim")}</div></section>
      <section class="section"><div><div class="section-header"><p class="hero-kicker">Gemeinsame WÖk-Lösung</p><h2>Öffentliche Ausgaben nach Wirkung prüfen.</h2></div>${cardGrid([["Wirkungshaushalt", "Jede größere Ausgabe zeigt Ziel, Wirkungspfad, Datenstand, Risiken und erwartete Netto-Wirkung."], ["T-SROI für öffentliche Ausgaben", "Entwicklungsprojekte, Ukraine-Hilfe, Klimafinanzierung, EU-Beiträge und Sozialausgaben werden nach Transformationswirkung bewertet."], ["Additionality prüfen", "Geld darf nicht nur umetikettiert werden. Es muss zusätzliche Wirkung erzeugen."], ["Kredite, Zuschüsse und Garantien trennen", "Nicht jede internationale Finanzierung ist ein verlorener Zuschuss."], ["Rückflüsse sichtbar machen", "Aufträge, Handelsbeziehungen, Stabilität, Klimanutzen und Sicherheitsgewinne werden mitbilanziert."], ["Unterlassungskosten zeigen", "Was kostet es, nicht zu helfen, nicht zu stabilisieren, nicht zu kooperieren?"], ["Missbrauchsschutz", "Korruptionsschutz, Vergabeprüfung, Evaluierung, Wirkungsberichte und Transparenzportale sind Pflicht."], ["Keine Sündenbocklogik", "Ausgabenkritik ja. Gruppenabwertung nein."]], "Maßnahme")}</div></section>
    </main>`;
  return shell({ title: `${clusterTitle} | Wirkungsradar Themen`, description: clusterSubtitle, canonical: `https://wirkungsoekonomie.de/wirkungsradar/themen/${clusterSlug}/`, base: "../../../", main });
}

function narrativePage() {
  const typical = ["Für Radwege in Peru ist Geld da, aber für uns nicht.", "Unser Steuergeld geht in die Ukraine.", "Wir retten die ganze Welt, aber nicht unsere Rentner.", "Deutschland zahlt für alle.", "Erst das eigene Land.", "Die da oben verschenken unser Geld.", "Die Reichen sollen einfach alles zahlen.", "Der Staat verbrennt unser Geld."];
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero narrative-hero"><div class="radar-hero-copy"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / Narrative</nav><p class="hero-kicker">Narrativfamilie</p><h1 class="hero-title">Steuergeld-geht-weg-Narrativ</h1><p class="hero-subtitle">Wenn öffentliche Ausgaben als Verlust erscheinen, ohne ihre Wirkung zu prüfen.</p><p class="radar-abstract"><strong>Definition:</strong> Ein Narrativ, das sichtbare Haushaltsausgaben emotionalisiert und sie gegen naheliegende inländische Probleme ausspielt, ohne Systemnutzen, Risikovermeidung, Rückflüsse, Kredite, internationale Stabilität oder langfristige Folgekosten zu bilanzieren.</p><p class="radar-status-line"><span>Wirkungsrisiko: hoch</span><span>Datenstand: ${UPDATED_AT}</span><span>Steuergeld muss wirken</span></p></div></section>
      ${summaryGrid([["Wirkstoff", "Sichtbare Ausgabe wird mit Verlust verwechselt; unsichtbare Wirkung und Unterlassungskosten verschwinden.", "critical"], ["Souveräne Antwort", "Der wahre Kern ist: Steuergeld muss wirken. Der Denkfehler ist: Wirkung nur nach Inland oder Ausland zu bewerten.", "positive"], ["Psychologie", "Verlustaversion, Nullsummendenken, Ingroup/Outgroup, Knappheitsdenken.", "warning"]], "Narrativ Summary")}
      ${nav("../../../")}
      <section class="section"><div><div class="section-header"><p class="hero-kicker">Typische Sätze</p><h2>Woran man das Narrativ erkennt.</h2></div><ul class="clean-list">${typical.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></div></section>
      <section class="section section-soft"><div><article class="card"><p class="card-kicker">Gegenbewegung</p><h2 class="card-title">Bilanzgrenze öffnen.</h2><p class="card-text">Sorge um Steuergeld anerkennen. Dann trennen: Zuschuss oder Kredit? Ausgabe oder Wirkung? Symbolprojekt oder T-SROI? Kosten heute oder Unterlassungskosten morgen?</p><p><a class="btn btn-primary" href="../../themen/${clusterSlug}/">Themencluster öffnen</a></p></article></div></section>
    </main>`;
  return shell({ title: "Steuergeld-geht-weg-Narrativ | Wirkungsradar Narrative", description: "Narrativanalyse zu Steuergeld, globaler Verantwortung und Fairness.", canonical: "https://wirkungsoekonomie.de/wirkungsradar/narrative/steuergeld-geht-weg/", base: "../../../", main });
}

function glossaryPage([slug, label, definition, hover]) {
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero term-hero"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Begriffe</a></nav><p class="hero-kicker">Glossar · Steuergeld &amp; Wirkung</p><h1>${esc(label)}</h1><p class="hero-subtitle">${esc(hover)}</p></div></section>
      <section class="section"><div><article class="article-shell glossary-detail"><h2>Definition</h2><p>${esc(definition)}</p><p><a class="btn btn-primary" href="../../wirkungsradar/themen/${clusterSlug}/">Steuergeld-Cluster öffnen</a></p></article></div></section>
    </main>`;
  return shell({ title: `${label} | Glossar`, description: definition, canonical: `https://wirkungsoekonomie.de/begriffe/${slug}/`, base: "../../", main });
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
    .replace(/<p class="radar-summary-value">\d+ Karten(?: aus Klima, Energie, Demokratie und Öffentlichkeit)? im Wirkungsradar\.<\/p>|<p class="radar-summary-value">\d+ Karten aus Klima, Energie, Demokratie und Öffentlichkeit\.<\/p>/, `<p class="radar-summary-value">${count} Karten im Wirkungsradar.</p>`)
    .replace(/<h2>\d+ kurze Antworten im Wirkungsradar\.<\/h2>/, `<h2>${count} kurze Antworten im Wirkungsradar.</h2>`);
  fs.writeFileSync(file, html);
}

function writeSourcePack() {
  const sourceMap = Object.fromEntries(sources.map(([label, key, url, useFor, warning]) => [key, { label, url, use_for: [useFor], warning }]));
  writeFile("content/wirkungsradar/source-packs/tax-money-global-responsibility-v1.yaml", `# Generated by scripts/wirkungsradar/build-tax-money-global-responsibility-cluster.mjs\n${toYaml({ id: "tax-money-global-responsibility-v1", last_verified: UPDATED_AT, update_frequency: "quarterly", sources: sourceMap }).trim()}\n`);
}

function augmentIndexes() {
  injectBeforeMainEnd("wirkungsradar/themen/index.html", clusterSlug, `<section class="section section-soft" id="${clusterSlug}"><div><div class="section-header"><p class="hero-kicker">Steuergeld &amp; globale Verantwortung</p><h2>Neuer Themencluster.</h2></div><div class="card-grid"><a class="card text-link-card" href="${clusterSlug}/"><p class="card-kicker">Nicht Ort zählt. Wirkung zählt.</p><h3 class="card-title">${esc(clusterTitle)}</h3><p class="card-text">${esc(clusterSubtitle)}</p></a></div></div></section>`);
  injectBeforeMainEnd("wirkungsradar/live/index.html", "steuergeld-globale-verantwortung-live", `<section class="section section-soft" id="steuergeld-globale-verantwortung-live"><div><div class="section-header"><p class="hero-kicker">Steuergeld, globale Verantwortung &amp; Fairness</p><h2>4 neue Live-Karten.</h2></div><div class="card-grid">${dossiers.map((item) => `<a class="card text-link-card radar-live-card" href="${esc(item.slug)}/"><p class="card-kicker">${esc(item.judgement)}</p><h3 class="card-title">${esc(item.title)}</h3><p class="card-text"><strong>10 Sekunden:</strong> ${esc(item.answers.ten)}</p></a>`).join("")}</div></div></section>`);
  injectBeforeMainEnd("wirkungsradar/detail/index.html", "steuergeld-globale-verantwortung-detail", `<section class="section section-soft" id="steuergeld-globale-verantwortung-detail"><div><div class="section-header"><p class="hero-kicker">Steuergeld, globale Verantwortung &amp; Fairness</p><h2>4 neue Deep Dives.</h2></div><div class="card-grid">${dossiers.map((item) => `<a class="card text-link-card" href="${esc(item.slug)}/"><p class="card-kicker">${esc(item.judgement)}</p><h3 class="card-title">${esc(item.title)}</h3><p class="card-text">${esc(item.subtitle)}</p></a>`).join("")}</div></div></section>`);
  updateLiveIndexCount();
}

writeSourcePack();
writeFile(`wirkungsradar/themen/${clusterSlug}/index.html`, clusterPage());
for (const item of dossiers) {
  writeFile(`wirkungsradar/live/${item.slug}/index.html`, livePage(item));
  writeFile(`wirkungsradar/detail/${item.slug}/index.html`, livePage(item, true));
}
writeFile("wirkungsradar/narrative/steuergeld-geht-weg/index.html", narrativePage());
for (const term of glossaryTerms) {
  const file = `begriffe/${term[0]}/index.html`;
  if (!fs.existsSync(file)) writeFile(file, glossaryPage(term));
}
augmentIndexes();

console.log("Built tax-money-global-responsibility cluster: 4 live dossiers, 4 detail pages, 1 topic cluster, 1 narrative, 7 glossary pages.");
