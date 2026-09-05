import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const MASTER_JSON = path.join(ROOT, "content/wirkungsradar/debattenkarten-master.json");
const MASTER_DOCX_V2 = "Wirkungsoekonomie_Debattenkompass_Textmaster_Codex_v2.docx";
const MASTER_DOCX_LEGACY =
  "Wirkungsradar_Debattenkarten_Langfassung.docx";
const MASTER_DOCX =
  process.env.WOEK_DEBATTENKARTEN_MASTER_DOCX ||
  (fs.existsSync(MASTER_DOCX_V2) ? MASTER_DOCX_V2 : MASTER_DOCX_LEGACY);
const PUBLIC_BASE = "https://wirkungsoekonomie.de";
const DATA_STAND = "2026-06-09";
const CSS_VERSION = "20260605-master-debattenkarten";
const ACADEMY_NARRATIVE_URL = "https://akademie.wirkungsoekonomie.de/narrativ-einreichen/";
const NAVIGATION = JSON.parse(fs.readFileSync(path.join(ROOT, "assets/data/navigation.json"), "utf8"));
const HEADER_TEMPLATE = fs.readFileSync(path.join(ROOT, "templates/header.html"), "utf8");
const FOOTER_TEMPLATE = fs.readFileSync(path.join(ROOT, "templates/footer.html"), "utf8");
const HEADER_UTILITY_LABELS = new Set(["Suche", "WÖk-KI", "Mein Wirkungsraum"]);

const knownSlugByTitle = new Map(Object.entries({
  "Migration kostet nur?": "migration-kostet-nur",
  "Deutschland nur 2 Prozent?": "deutschland-nur-zwei-prozent",
  "Windräder zerstören Natur?": "windraeder-voegel-wald-beton-rueckbau",
  "Fusion löst das Energieproblem?": "fusion-loest-das-energieproblem",
  "Schulden machen oder sparen?": "schulden-machen-oder-sparen",
  "E-Autos schlimmer als Verbrenner?": "e-autos-schlimmer-als-verbrenner",
  "E-Fuels retten den Verbrenner?": "e-fuels-retten-den-verbrenner",
  "Wasserstoff für alles?": "wasserstoff-fuer-alles",
  "Arbeit lohnt sich nicht mehr?": "arbeit-lohnt-sich-nicht-mehr",
  "CO2-Preis oder fossile Systemkosten?": "co2-preis-oder-fossile-systemkosten",
  "CO₂-Preis oder fossile Systemkosten?": "co2-preis-oder-fossile-systemkosten",
  "Kernenergie wieder in Deutschland?": "kernenergie-wieder-in-deutschland",
  "Radwege in Peru - verschenktes Geld oder verkürzte Empörung?": "radwege-in-peru",
  "Ukraine-Unterstützung und Steuergeld?": "ukraine-unterstuetzung-steuergeld",
  "Ausländer plündern den Sozialstaat?": "auslaender-pluendern-sozialstaat",
  "Die haben nie eingezahlt?": "nie-eingezahlt",
  "Sozialtourismus?": "sozialtourismus-frame",
  "Sozialschmarotzer?": "sozialschmarotzer-frame",
  "Integration ist gescheitert?": "integration-ist-gescheitert",
  "Fachkräftemangel ohne Zuwanderung lösen?": "fachkraeftemangel-ohne-zuwanderung",
  "Kriminalität und Migration?": "kriminalitaet-und-migration",
  "Bürgergeld macht faul?": "buergergeld-macht-faul",
  "Rente ist unbezahlbar?": "rente-unbezahlbar",
  "Deutschland zahlt für die ganze EU?": "eu-undemokratisch-deutschland-zahlt-alles",
  "NGOs kassieren Steuergeld?": "ngos-kassieren-steuergeld",
  "Der Staat verschwendet unser Geld?": "steuerverschwendung-buerokratie",
  "Entwicklungshilfe: Warum nicht zuerst Deutschland?": "entwicklungshilfe-warum-nicht-zuerst-deutschland",
  "Klimafinanzierung: Zahlen wir für andere?": "klimafinanzierung-wir-zahlen-fuer-andere",
  "Warum Geld für China und Indien?": "entwicklungshilfe-china-indien",
  "Geld für Kultur und Gender statt echte Probleme?": "kultur-gender-luxusprojekte",
  "Gender-Ideologie?": "gender-ideologie",
  "Queere Sichtbarkeit bedroht Kinder?": "queere-sichtbarkeit-bedroht-kinder",
  "Feminismus zerstört Familie?": "feminismus-zerstoert-familie",
  "E-Lkw funktionieren nicht?": "e-lkw-funktionieren-nicht",
  "Laden dauert viel zu lange?": "laden-dauert-viel-zu-lange",
  "Wohnungsnot wegen Migration?": "wohnungsnot-wegen-migration",
  "15-Minuten-Stadt oder Klimakäfig?": "15-minuten-stadt-oder-klimakaefig",
  "Parkplätze sind Freiheit?": "parkplaetze-sind-freiheit",
  "ÖRR oder Staatsfunk?": "oerr-oder-staatsfunk",
  "Verfassungsschutz oder Regierungsschutz?": "verfassungsschutz-oder-regierungsschutz",
  "Faktenchecker sind Zensur?": "faktenchecker-sind-zensur",
  "KI nimmt uns alle Jobs?": "ki-nimmt-uns-alle-jobs",
  "KI macht Kinder dumm?": "ki-macht-kinder-dumm",
  "Datenschutz verhindert Innovation?": "datenschutz-verhindert-innovation",
  "Prävention ist zu teuer?": "praevention-ist-zu-teuer",
  "Pflege ist unbezahlbar?": "pflege-ist-unbezahlbar",
  "Mehr Krankenhäuser bedeuten bessere Versorgung?": "mehr-krankenhaeuser-bessere-versorgung",
  "Die Bauern werden geopfert?": "die-bauern-werden-geopfert",
  "Bio kann die Welt nicht ernähren?": "bio-kann-die-welt-nicht-ernaehren",
  "Fleischverzicht ist Ideologie?": "fleischverzicht-ist-ideologie",
  "Waffenlieferungen verlängern den Krieg?": "waffenlieferungen-verlaengern-den-krieg",
  "NATO hat Russland provoziert?": "nato-hat-russland-provoziert",
  "Resilienz ist Autarkie?": "resilienz-ist-autarkie",
  "Wirkungsökonomie bewertet Menschen?": "woek-bewertet-menschen",
  "Wirkungsteuer macht alles teurer?": "wirkungsteuer-macht-alles-teurer",
  "Altparteien?": "altparteien",
  "Angst vor AfD-Wahlsieg?": "angst-vor-afd-wahlsieg",
  "Diktatur der Altparteien?": "diktatur-der-altparteien",
  "Remigration / Remigrationslotsen?": "remigration-remigrationslotsen",
  "Kehrtwende um 180 Grad?": "kehrtwende-180-grad",
  "Planwirtschaftliche Energiewende?": "planwirtschaftliche-energiewende",
  "Klimadiktatur / Klimaextremismus / Klimapropaganda?": "klimaschutz-ist-oekodiktatur",
  "Zensurbehörden / betreute Meinung / ÖRR-Frame?": "das-ist-zensur",
  "Batterien sind nicht recyclebar?": "batterien-sind-nicht-recyclebar",
  "CO2 ist nur ein Spurengas?": "co2-ist-nur-ein-spurengas",
  "CO₂ ist nur ein Spurengas?": "co2-ist-nur-ein-spurengas",
  "Das ist alles gesteuert?": "das-ist-alles-gesteuert",
  "Sind die Reichen schuld?": "sind-die-reichen-schuld",
  "Die da oben machen sowieso, was sie wollen?": "die-da-oben",
  "Die Wissenschaft ist gekauft?": "die-wissenschaft-ist-gekauft",
  "Die Energiewende ist gescheitert?": "energiewende-gescheitert",
  "Heizgesetz oder Heizhammer?": "heizgesetz-heizhammer-narrativ",
  "Kernenergie wäre die einfache Lösung?": "kernenergie-einfache-loesung",
  "Klima hat sich schon immer verändert?": "klima-hat-sich-schon-immer-veraendert",
  "Klimaschutz deindustrialisiert Deutschland?": "klimaschutz-deindustrialisiert-deutschland",
  "Klimaschutz ist Ökodiktatur?": "klimaschutz-ist-oekodiktatur",
  "Werden Leistungsträger ausgepresst?": "leistungstraeger-ausgepresst",
  "Mainstreammedien lügen alle?": "mainstreammedien-luegen-alle",
  "Man darf ja nichts mehr sagen?": "man-darf-ja-nichts-mehr-sagen",
  "Man wird doch wohl fragen dürfen?": "man-wird-doch-wohl-fragen-duerfen",
  "SDGs sind Weltregierung?": "sdgs-weltregierung",
  "Windräder zerstören die Natur?": "windraeder-zerstoeren-natur",
  "Wirkungsökonomie ist Planwirtschaft?": "wirkungsoekonomie-planwirtschaft",
  "Wirkungsökonomie ist Social Credit?": "wirkungsoekonomie-social-credit",
  "Wärmepumpe ist unbezahlbar?": "waermepumpe-ist-unbezahlbar",
  "Wärmepumpe ist unbezahlbar? (redaktionelle Ergänzung)": "waermepumpe-ist-unbezahlbar",
  "Solarstrom ist unzuverlässig?": "solarstrom-ist-unzuverlaessig",
  "Solarstrom ist unzuverlässig? (redaktionelle Ergänzung)": "solarstrom-ist-unzuverlaessig",
  "Verbrennerverbot nimmt Freiheit?": "verbrennerverbot-nimmt-freiheit",
  "Verbrennerverbot nimmt Freiheit? (redaktionelle Ergänzung)": "verbrennerverbot-nimmt-freiheit",
  "Tempolimit bringt nichts?": "tempolimit-bringt-nichts",
  "Tempolimit bringt nichts? (redaktionelle Ergänzung)": "tempolimit-bringt-nichts",
  "Klimaschutz ist zu teuer?": "klimaschutz-ist-zu-teuer",
  "Klimaschutz ist zu teuer? (redaktionelle Ergänzung)": "klimaschutz-ist-zu-teuer",
  "Bürokratieabbau statt Wirkung?": "buerokratieabbau-statt-wirkung",
  "Bürokratieabbau statt Wirkung? (redaktionelle Ergänzung)": "buerokratieabbau-statt-wirkung",
  "Deutschland schafft sich ab?": "deutschland-schafft-sich-ab",
  "Deutschland schafft sich ab? (redaktionelle Ergänzung)": "deutschland-schafft-sich-ab",
}));

const clusterLabels = {
  migration: "Migration",
  climate_energy: "Klima & Energie",
  finance_state: "Staat, Geld & Verantwortung",
  mobility: "Mobilität",
  work_social: "Arbeit & Sozialstaat",
  security: "Ausland & Sicherheit",
  gender_culture: "Kultur, Familie & Geschlecht",
  democracy_media: "Demokratie & Öffentlichkeit",
  tech_ai: "Digitalisierung & KI",
  health_care: "Gesundheit & Pflege",
  agri_food: "Landwirtschaft & Ernährung",
  woek: "Wirkungsökonomie",
};

const redirectAliasBySlug = new Map([
  ["windraeder-zerstoeren-natur", "windraeder-voegel-wald-beton-rueckbau"],
  ["klimadiktatur", "klimaschutz-ist-oekodiktatur"],
  ["oeffentlicher-rundfunk-staatsfunk", "oerr-oder-staatsfunk"],
  ["sdgs-sind-weltregierung", "sdgs-weltregierung"],
]);

const redirectAliasTitleBySlug = new Map([
  ["windraeder-zerstoeren-natur", "Windräder zerstören die Natur?"],
  ["klimadiktatur", "Klimadiktatur / Klimaextremismus / Klimapropaganda?"],
  ["oeffentlicher-rundfunk-staatsfunk", "Öffentlicher Rundfunk oder Staatsfunk?"],
  ["sdgs-sind-weltregierung", "SDGs sind Weltregierung?"],
]);

const p0RescueOverlays = {
  "migration-kostet-nur": {
    answers: {
      seconds10:
        "Ja, Ankommen braucht zunächst Geld und Organisation. Menschen sind aber kein Rechnungsposten. Integration entscheidet, ob daraus Arbeit, Beiträge, Versorgung und Teilhabe werden.",
      seconds30:
        "Der wahre Kern ist: Aufnahme, Unterbringung, Schule, Sprache und Verwaltung brauchen am Anfang Geld und Personal. Der Denkfehler ist: Daraus folgt nicht, dass Migration nur kostet oder Menschen als Rechnungsposten gelesen werden dürfen. Entscheidend ist der Zeitpfad. Wenn Verfahren, Sprachkurse, Anerkennung von Abschlüssen, Wohnen, Kita und Arbeitsmarktzugang funktionieren, entstehen Arbeit, Beiträge, Steuern, Fachkräfte, Nachbarschaft und Versorgung. Wenn diese Infrastruktur fehlt, werden Menschen länger abhängig und Kommunen bleiben belastet.",
      seconds120:
        "Ich würde die Kosten nicht wegreden. Kommunen brauchen Unterkünfte, Verwaltung, Schulen, Kitas, Sprachkurse, Beratung und Sicherheit. Das ist realer Startaufwand. Aber die Aussage 'Migration kostet nur' macht aus diesem Startaufwand ein dauerhaftes Pauschalurteil über Menschen. Fachlich sauber ist eine andere Rechnung: Erstens müssen wir Zeit unterscheiden. In den ersten Jahren entstehen höhere Integrations- und Unterstützungsaufgaben. Zweitens müssen wir die Integrationsqualität prüfen: Sprache, Schulbildung, Anerkennung von Abschlüssen, schneller Arbeitsmarktzugang, Wohnen, Kinderbetreuung und klare Verfahren. Drittens müssen wir die Alternative mitzählen: Fachkräftelücken, unbesetzte Pflege- und Ausbildungsstellen, demografischer Druck, Schwarzarbeit, lange Wartezeiten und Vertrauensverlust, wenn Integration schlecht organisiert ist. Das IAB zeigt am Beispiel der 2015 zugezogenen Geflüchteten, dass Erwerbsintegration Zeit braucht, aber deutlich vorankommt: 2024 lag ihre Beschäftigungsquote bei 64 Prozent und damit nahe am Durchschnitt der Gesamtbevölkerung von 70 Prozent. Die Bundesagentur für Arbeit weist außerdem darauf hin, dass absolute Zahlen allein nicht reichen; entscheidend sind Beschäftigungs-, Arbeitslosen- und SGB-II-Quoten. Die bessere Frage lautet deshalb nicht: Kostet Migration? Natürlich kostet Aufnahme am Anfang. Die bessere Frage lautet: Welche Integration macht aus Ankommen möglichst schnell Sprache, Arbeit, Beiträge, Versorgung, Sicherheit und Teilhabe?",
    },
    systemLever:
      "Integrationsqualität messbar machen: Sprache, Schule, Anerkennung, Arbeitsmarktzugang, Wohnen, Kinderbetreuung, kommunale Kapazität und faire Verfahren entscheiden, ob aus Startaufwand gesellschaftliche Wirkleistung wird.",
    mpd:
      "Mensch: Menschen werden nicht als Kostenstelle gelesen, sondern nach Schutz, Sprache, Bildung, Arbeit, Wohnen und Teilhabe. Planet: Nicht der Kern dieser Karte; relevant ist indirekt, ob Kommunen resilient und lernfähig bleiben. Demokratie: Die Debatte bleibt prüfbar, wenn Startkosten, Statusgruppen, Zeitpfade, Quoten und Integrationsbedingungen getrennt werden.",
    facts: [
      {
        title: "Startaufwand ist real",
        text: "Aufnahme, Unterbringung, Verwaltung, Sprachkurse, Schule, Kita und Beratung brauchen am Anfang Geld, Personal und Koordination.",
        proves: "Kosten und kommunale Belastung dürfen nicht beschönigt werden.",
        notProves: "Es beweist nicht, dass Migration dauerhaft nur kostet oder dass Menschen als Kostenstelle gelesen werden dürfen.",
        sources: "SVR Jahresgutachten 2024, BA Migration und Arbeitsmarkt",
      },
      {
        title: "Erwerbsintegration ist ein Zeitpfad",
        text: "Das IAB berichtet, dass die 2015 zugezogenen Geflüchteten 2024 eine Beschäftigungsquote von 64 Prozent erreichten und sich damit dem Durchschnitt der Gesamtbevölkerung von 70 Prozent deutlich angenähert haben.",
        proves: "Integration kann, wenn sie gelingt, aus anfänglicher Unterstützung Erwerbsarbeit machen.",
        notProves: "Es beweist nicht, dass jede Gruppe, jeder Ort und jede politische Maßnahme automatisch erfolgreich ist.",
        sources: "IAB: 10 Jahre Fluchtmigration",
      },
      {
        title: "Indikatoren statt Bauchgefühl",
        text: "Die Bundesagentur für Arbeit betont für Migration und Arbeitsmarkt, dass Beschäftigungs-, Arbeitslosen- und SGB-II-Hilfequoten oft aussagekräftiger sind als absolute Zahlen.",
        proves: "Die Debatte braucht Verhältniswerte, Zeitreihen und Statusgruppen.",
        notProves: "Eine einzelne Quote ersetzt keine Analyse von Bildung, Herkunft, Aufenthaltsstatus, Region und Arbeitsmarkt.",
        sources: "Bundesagentur für Arbeit",
      },
      {
        title: "Kommunale Struktur entscheidet",
        text: "Der SVR beschreibt, dass Kommunen mit aufrechterhaltenen Aufnahme- und Integrationsstrukturen schneller und pragmatischer reagieren konnten.",
        proves: "Integration ist auch eine Frage von Infrastruktur, Zuständigkeiten und Finanzierung.",
        notProves: "Es beweist nicht, dass unbegrenzte Aufnahme ohne Kapazitätsplanung funktioniert.",
        sources: "SVR Jahresgutachten 2024",
      },
      {
        title: "Arbeits- und Fachkräftebedarf gehört in die Rechnung",
        text: "OECD und SVR verweisen auf Arbeitsmarktintegration und Fachkräfteeinwanderung als zentrale politische Felder in Deutschland.",
        proves: "Migration wirkt nicht nur auf Ausgaben, sondern auch auf Arbeit, Versorgung, Beiträge und Standortfähigkeit.",
        notProves: "Es beweist nicht, dass jede Form von Migration kurzfristig fiskalisch positiv ist.",
        sources: "OECD International Migration Outlook 2024, SVR Jahresgutachten 2024",
      },
    ],
    boundaries: [
      ["Zeit", "Startkosten, Übergangskosten, Erwerbsintegration und langfristige Beiträge getrennt betrachten.", "Ohne Zeitpfad wirkt jeder Anfang wie Dauerzustand."],
      ["Statusgruppen", "Schutzmigration, Arbeitsmigration, Familiennachzug, EU-Freizügigkeit und lange ansässige Menschen getrennt auswerten.", "Eine Gruppe erklärt nicht die Wirkung aller Gruppen."],
      ["Alternativen", "Auch die Kosten schlechter Integration, unbesetzter Arbeit und überforderter Kommunen mitzählen.", "Nicht-Handeln ist ebenfalls eine Entscheidung mit Folgekosten."],
    ],
    misuse: [
      ["Startkosten werden als dauerhafte Nettobilanz erzählt.", "Startaufwand, Integrationspfad und spätere Beiträge trennen."],
      ["Absolute Zahlen werden ohne Quoten und Zeitreihen genutzt.", "Beschäftigungs-, Arbeitslosen- und SGB-II-Quoten mit Status und Zeitraum prüfen."],
      ["Kommunale Überlastung wird Menschen zugeschrieben.", "Zuständigkeit, Finanzierung, Verfahren und Wohnungsmarkt als Systemfragen behandeln."],
    ],
    sources: [
      ["IAB: 10 Jahre Fluchtmigration", "https://iab.de/presseinfo/10-jahre-fluchtmigration-beschaeftigungsquote-von-gefluechteten-naehert-sich-dem-durchschnitt-in-deutschland-an/", "Beschäftigungsquote 2015 zugezogener Geflüchteter und Zeitpfad der Erwerbsintegration.", "Primärnah / Forschungsinstitut"],
      ["Bundesagentur für Arbeit: Migration und Arbeitsmarkt", "https://statistik.arbeitsagentur.de/DE/Navigation/Statistiken/Interaktive-Statistiken/Migration-Zuwanderung-Flucht/Migration-Zuwanderung-Flucht-Nav.html", "Beschäftigungs-, Arbeitslosen- und SGB-II-Quoten sowie Indikatorenlogik.", "Primärquelle / Behörde"],
      ["SVR Jahresgutachten 2024", "https://www.svr-migration.de/publikationen/jahresgutachten/2024/", "Kommunale Aufnahmestrukturen, Integrationsbedingungen und Handlungsempfehlungen.", "Fachgutachten"],
      ["OECD International Migration Outlook 2024: Germany", "https://www.oecd.org/en/publications/international-migration-outlook-2024_50b0353e-en/full-report/germany_1c19b40c", "Arbeitsmigration, Integrations- und Rechtsentwicklung im internationalen Kontext.", "Internationale Fachquelle"],
    ],
    secure:
      "Startkosten und kommunale Belastung sind real. Erwerbsintegration ist zeitabhängig und wird durch Institutionen, Sprache, Anerkennung und Arbeitsmarktzugang beeinflusst. Pauschale absolute Zahlen sind ohne Quoten, Gruppen und Zeiträume wenig aussagekräftig.",
    uncertain:
      "Konkrete lokale Kosten, Wohnraumlage, Schulkapazität, Aufenthaltsstatus, Bildungsstand und Arbeitsmarktlage müssen fallbezogen geprüft werden.",
  },
  "radwege-in-peru": {
    answers: {
      seconds10:
        "Die Rechnung ist verkürzt. Ein Teil sind Zuschüsse, vieles läuft über Kredite. Außerdem gibt es wirtschaftliche, geopolitische und klimapolitische Gründe. Entscheidend ist die Frage nach Wirkung und Kontrolle.",
      seconds30:
        "Die Rechnung ist verkürzt. Ein Teil sind Zuschüsse, etwa für Radwege. Ein großer Teil nachhaltiger Mobilitätsfinanzierung läuft aber über KfW-Kredite, die zurückgezahlt werden müssen. Außerdem geht es nicht nur um Radwege, sondern um Metro, Bus, ÖPNV und sichere Wege zur Arbeit, Schule und Haltestelle. Kritik ist berechtigt, wenn Nutzung, Vergabe, Baufortschritt oder Wirkung unklar sind. Aber seriös wird sie erst, wenn Zuschuss, Kredit, Rückzahlung, Kontrolle und deutscher Nutzen getrennt geprüft werden.",
      seconds120:
        "Das Radwege-in-Peru-Narrativ wirkt, weil es aus einem komplexen Finanzierungs- und Mobilitätsprogramm ein einziges Spottbild macht: dort Radwege, hier Probleme. Der wahre Kern ist: Öffentliche Mittel müssen begründet, kontrolliert und wirksam eingesetzt werden. Der falsche Sprung ist: Alles werde verschenkt und Deutschland habe nichts davon. Erstens muss man die Finanzierungsform trennen: Zuschüsse sind nicht rückzahlbar; Entwicklungskredite und Förderkredite sind anders zu bewerten, weil sie bedient werden müssen. Zweitens muss man das Projekt trennen: Es geht nicht nur um Radwege, sondern um nachhaltige Stadtmobilität mit Metro, Bus, ÖPNV-Organisation und sicheren Zubringern. Drittens muss man Wirkung prüfen: Kommen Menschen günstiger und sicherer zu Schule, Arbeit, Markt und Metro? Sinken Stau, Luftbelastung und CO₂? Viertens muss man den deutschen Nutzen offenlegen: Klima wirkt global, Peru ist Partner, und KfW nennt Beteiligungen deutscher Unternehmen an laufenden Vorhaben. Fünftens bleibt Kritik notwendig: Nutzung, Vergabe, Korruptionsschutz, Baufortschritt und Evaluation müssen öffentlich prüfbar sein. Die bessere Frage lautet deshalb: Welche Finanzierungsform, welche Wirkung, welche Rückzahlung, welcher Nutzen und welche Risiken liegen tatsächlich vor?",
    },
    systemLever:
      "Finanzierungsart offenlegen: Kredit, Zuschuss, Rückzahlung, Zweck, Projektträger, beteiligte Unternehmen und messbare Wirkung getrennt prüfen.",
    trueCoreAppend:
      " Konkret wichtig: Die bekannte 315-Mio.-Erzählung vermischt Projektvolumen, Kredit, Zuschuss und verschiedene Mobilitätsbausteine. Ein Kredit ist kein Geschenk; er wird zurückgezahlt. Ein Zuschuss ist anders zu bewerten als ein rückzahlbarer Förderkredit. In geprüften Darstellungen müssen Radwege, Bus- und Metro-Anbindung, Sicherheit, Klimaanpassung und städtische Erreichbarkeit getrennt werden. Für Deutschland ist das nicht nur Wohltätigkeit: Stabilere Städte, weniger Emissionen, weniger Krisen- und Importfolgen sowie mögliche Aufträge für deutsche und europäische Unternehmen sind eigene Wirkungsinteressen.",
    falseJumpAppend:
      " Falsch ist insbesondere, aus einem zusammengeschnittenen 315-Mio.-Bild so zu tun, als sei jeder Euro ein verlorener deutscher Zuschuss für einen einzelnen Radweg. Zahlen wie 315 Mio., 155 Mio. oder 33 Mio. müssen immer nach Finanzierungsart, Zweck, Rückzahlung, Projektträger und Wirkung gelesen werden.",
    mpd:
      "Mensch: sichere Wege, Metro-Erreichbarkeit, weniger Unfall- und Luftbelastung. Planet: weniger lokale Emissionen und bessere Klimaanpassung, wenn der Verkehrsverbund tatsächlich wirkt. Demokratie: bessere Rechenschaft, wenn Kredit, Zuschuss, Rückzahlung, Ausschreibung, deutsche Unternehmensbezüge und Projektwirkung offen getrennt werden.",
    facts: [
      {
        title: "Kredit ist nicht Zuschuss",
        text: "Entwicklungskredite und Förderkredite müssen anders bewertet werden als nicht rückzahlbare Zuschüsse.",
        proves: "Die pauschale Erzählung 'Deutschland verschenkt Geld' ist ohne Finanzierungsart nicht belastbar.",
        notProves: "Es beweist nicht automatisch, dass jedes Projekt wirksam oder gut kontrolliert ist.",
        sources: "KfW Entwicklungsbank, BMZ Transparenzportal",
      },
      {
        title: "Das Projekt ist mehr als ein Symbolbild Radweg",
        text: "Nachhaltige Stadtmobilität umfasst sichere Zubringer, Bus, Metro-Anbindung, Verkehrsorganisation, Erreichbarkeit und Luftqualität.",
        proves: "Der Projektzweck ist breiter als das empörungsstarke Einzelbild.",
        notProves: "Es ersetzt keine Prüfung von Baufortschritt, Nutzung und lokaler Wirkung.",
        sources: "KfW Projektdatenbank Lima, Projekttransparenz",
      },
      {
        title: "Deutscher Nutzen gehört zur Bilanz",
        text: "Deutschland hat ein Eigeninteresse an stabilen Partnern, Klimawirkung, geringeren Krisenfolgen und möglichen Aufträgen für deutsche oder europäische Unternehmen.",
        proves: "Auslandsfinanzierung ist nicht automatisch altruistische Einbahnstraße.",
        notProves: "Es beweist nicht, dass jeder Auftrag oder jede Wirkung automatisch eintritt.",
        sources: "KfW Entwicklungsbank, BMZ Projekt- und Transparenzdaten",
      },
      {
        title: "Kritik bleibt notwendig",
        text: "Nutzung, Vergabe, Korruptionsschutz, Baufortschritt, Evaluation und Rückzahlung müssen öffentlich prüfbar sein.",
        proves: "Seriöse Kritik fragt nach Kontrolle und Wirkung statt nur nach Empörung.",
        notProves: "Die Kontrollfrage ist kein Beleg dafür, dass das Projekt wirkungslos ist.",
        sources: "KfW Evaluierungen, BMZ Transparenzportal",
      },
    ],
    boundaries: [
      ["Finanzierungsform", "Zuschuss, Kredit, Garantie, Rückzahlung und Projektvolumen getrennt betrachten.", "Sonst wird aus einer Finanzierungsstruktur ein Geschenkbild."],
      ["Projektzweck", "Radweg, Bus, Metro, Sicherheit, Erreichbarkeit, Luftqualität und Stadtplanung getrennt prüfen.", "Sonst ersetzt ein Spottbild die Wirkungskette."],
      ["Deutschland-Nutzen", "Klimawirkung, Stabilität, Kooperation, Wirtschaftsbeteiligung und Krisenkosten mitzählen.", "Auslandswirkung kann auch Eigeninteresse sein."],
    ],
    misuse: [
      ["Projektvolumen wird als verlorener Zuschuss erzählt.", "Finanzierungsart und Rückzahlung zuerst klären."],
      ["Ein Radweg-Bild ersetzt Mobilitätswirkung.", "Metro, Bus, Sicherheit und Erreichbarkeit in die Bilanz nehmen."],
      ["Kontrollfragen werden als Totalablehnung genutzt.", "Kontrolle, Vergabe und Evaluation prüfen, ohne Wirkung pauschal abzuschreiben."],
    ],
    sources: [
      ["KfW Entwicklungsbank: Fahrradwegnetz im Metropolbereich Lima", "https://www.kfw-entwicklungsbank.de/ipfz/Projektdatenbank/Aufbau-Eines-Fahrradwegnetzes-Im-Metropolbereich-Lima-35874.htm", "Projektpartner, Projektzweck, Finanzierungsrahmen und Status.", "Primärquelle / Projektbank"],
      ["KfW Entwicklungsbank: Transparenzportal", "https://www.kfw-entwicklungsbank.de/Internationale-Finanzierung/KfW-Entwicklungsbank/Transparenz/", "Projekttransparenz, Finanzierungsdaten und Kontrolllogik.", "Primärquelle / Institution"],
      ["BMZ Transparenzportal", "https://www.bmz.de/de/ministerium/zahlen-fakten/bmz-transparenzportal", "Transparenz öffentlicher Entwicklungszusammenarbeit sowie Projekt- und Finanzdaten.", "Primärquelle / Ministerium"],
      ["KfW Evaluierungen", "https://www.kfw-entwicklungsbank.de/Evaluierung/", "Wirkungsprüfung und Lernen aus Projekten; projektspezifische Evaluierung separat prüfen.", "Institutionelle Evaluierungsquelle"],
    ],
    secure:
      "Zuschüsse, Kredite, Projektvolumen und Rückzahlung müssen getrennt werden. Wirkung entsteht nur, wenn Mobilität, Sicherheit, Erreichbarkeit und Kontrolle tatsächlich verbessert werden.",
    uncertain:
      "Baufortschritt, Nutzung, Vergabe, Korruptionsschutz und messbare Wirkung müssen projektbezogen aktualisiert werden.",
  },
  "e-autos-schlimmer-als-verbrenner": {
    answers: {
      seconds10:
        "Der Akku hat einen CO₂-Rucksack. Fair ist aber der ganze Lebenszyklus: Batterie, Produktionsstrom, Ladestrom, Wartung, Recycling und der Kraftstoff, den der Verbrenner über Jahre verbrennt.",
      seconds30:
        "Das E-Auto ist nicht wirkungsfrei. Der Akku zählt. Aber Benzin, Diesel, Ölimporte, Abgase, Ladestrom, Produktion und Recycling zählen auch. Wer nur die Batterie vergleicht, lässt den dauernden fossilen Verbrauch des Verbrenners aus der Rechnung. Entscheidend ist der Lebenszyklus: Fahrzeuggröße, Batteriechemie, Produktionsstrom, Ladequelle, Laufleistung, Wartung, Luftschadstoffe und Recycling.",
      seconds120:
        "Das E-Auto ist nicht wirkungsfrei. Batterieproduktion, Rohstoffe, Fahrzeuggröße, Produktionsstrom und Recycling müssen in die Bilanz. Aber der Vergleich darf nicht beim Akku stehenbleiben. Der Verbrenner verbrennt über seine Lebensdauer Benzin oder Diesel, verursacht lokale Abgase und hängt an Ölimporten. Bei geförderter öffentlicher Ladeinfrastruktur ist erneuerbarer Strom eine Fördervoraussetzung; Produktionsstrom und Batteriechemie verändern die Startbilanz ebenfalls. Viele Studien rechnen mit Durchschnittsstrommixen, obwohl reale Lade- und Produktionspfade stärker erneuerbar werden können. Das macht die Studien nicht wertlos, aber es zeigt: Annahmen müssen offenliegen. Darum ist die bessere Frage: Welche Mobilität hat über den ganzen Lebenszyklus weniger CO₂, weniger Öl, weniger Abgase, bessere Recyclingpfade und die passendere Infrastruktur?",
    },
    systemLever:
      "Lebenszyklus vollständig öffnen: Rohstoffe, Batterie, Fahrzeugbau, Produktionsstrom, Ladestrom, Nutzung, Wartung, Luftschadstoffe, Recycling, fossile Kraftstoffbereitstellung und Ölimporte fair vergleichen.",
    mpd:
      "Mensch: Stadtluft, Lärm, Betriebskosten, Ladezugang und alltagstaugliche Mobilität prüfen. Planet: CO₂-Rucksack, Strompfad, Batteriegröße, Recycling und dauerhaft vermiedene fossile Verbrennung bilanzieren. Demokratie: Annahmen offenlegen, damit Strommix, Ladequelle, Produktionsstrom und Rohstofffragen nicht als Schlagwort gegeneinander ausgespielt werden.",
    facts: [
      {
        title: "Batterieproduktion braucht Energie und Rohstoffe",
        text: "Akkuherstellung, Batteriegröße, Zellchemie, Produktionsstrom und Lieferketten beeinflussen den Start der CO₂-Bilanz.",
        proves: "Der Akku muss in jede seriöse Lebenszyklusrechnung.",
        notProves: "Es beweist nicht, dass der Verbrenner über den Lebenszyklus besser ist.",
        sources: "ADAC Lebenszyklusanalyse, ICCT, IEA",
      },
      {
        title: "Verbrenner verbrennen dauerhaft fossilen Kraftstoff",
        text: "Benzin und Diesel werden über die ganze Nutzung verbrannt; CO₂, Luftschadstoffe, Ölimporte und Preisrisiken entstehen laufend.",
        proves: "Der Betrieb des Verbrenners ist kein neutraler Restposten.",
        notProves: "Es beweist nicht, dass jedes E-Auto in jeder Größe und Nutzung optimal ist.",
        sources: "ADAC Lebenszyklusanalyse, Umweltbundesamt",
      },
      {
        title: "Lebenszyklusanalysen müssen die ganze Nutzung einbeziehen",
        text: "Herstellung, Nutzung, Stromquelle, Wartung, Recycling und Kraftstoffbereitstellung verändern das Ergebnis.",
        proves: "Halbe Rechnungen können zu falschen Schlussfolgerungen führen.",
        notProves: "Eine einzelne Modellrechnung ersetzt nicht die Prüfung von Fahrzeugklasse, Laufleistung und Strompfad.",
        sources: "ADAC, ICCT",
      },
      {
        title: "Ladestrom und Produktionsstrom verändern die Bilanz",
        text: "Regenerativer Ladestrom und erneuerbarer Produktionsstrom verkürzen den CO₂-Rucksack; alte Durchschnittswerte können Zukunftspfade verzerren.",
        proves: "Stromquelle und Infrastruktur sind entscheidende Bilanzgrößen.",
        notProves: "Es beweist nicht, dass jede private oder ungeförderte Ladesituation automatisch Ökostrom ist.",
        sources: "BMV Förderprogramm Ladeinfrastruktur, ADAC, IEA",
      },
      {
        title: "Recycling und Second Life verändern Materialwirkung",
        text: "Batterien sind Produkte mit Rücknahme-, Wiederverwendungs- und Recyclingpfaden; fossiler Kraftstoff ist nach dem Verbrennen weg.",
        proves: "Materialkreisläufe müssen in die Bewertung.",
        notProves: "Es beweist nicht, dass Rohstoffabbau automatisch unproblematisch ist.",
        sources: "ADAC Fakten zur Elektromobilität, IEA Global EV Outlook",
      },
    ],
    boundaries: [
      ["Lebenszyklus", "Rohstoffe, Batterie, Fahrzeugbau, Produktionsstrom, Ladestrom, Nutzung, Wartung, Recycling und fossile Kraftstoffbereitstellung.", "Nur so werden Akku-Rucksack und dauerhaftes Verbrennen fair verglichen."],
      ["Strompfad", "Strommix, Ökostromvertrag, geförderte Ladeinfrastruktur, eigene PV und realer Produktionsstrom getrennt betrachten.", "Alte Durchschnittswerte dürfen nicht automatisch als Zukunft ausgegeben werden."],
      ["Alltag und Infrastruktur", "Supermarkt, Arbeitsplatz, Depot, Parkhaus, Autobahn und Megawattladen nach Standzeit und Verfügbarkeit bewerten.", "Akzeptanz entsteht, wenn Infrastruktur zum Nutzungsverhalten passt."],
    ],
    misuse: [
      ["Nur der Akku wird gezählt.", "Der Akku zählt, aber Verbrennung, Öl, Wartung, Luft, Stromquelle und Recycling zählen ebenfalls."],
      ["Alter Strommix wird als Zukunft behandelt.", "Strommix, geförderter Ökostrom, eigener Ökostrom und Produktionsstrom müssen getrennt werden."],
      ["Ein Ladeproblem wird zur Gesamtbilanz gemacht.", "Ladeleistung, Standort, Standzeit und Verfügbarkeit sind Umsetzungsfragen, keine automatische Widerlegung der Technologie."],
    ],
    sources: [
      ["ADAC Lebenszyklusanalyse Antriebe", "https://www.adac.de/verkehr/tanken-kraftstoff-antrieb/alternative-antriebe/klimabilanz/", "Lebenszyklusvergleich, Strommix-Sensitivität und Wirkung regenerativen Stroms.", "Fachquelle / Mobilität"],
      ["ADAC Fakten zur Elektromobilität", "https://www.adac.de/rund-ums-fahrzeug/elektromobilitaet/elektroauto/elektroauto-pro-und-contra/", "CO₂-Rucksack, Betrieb, Akku, Garantie und Ladeinfrastruktur.", "Fachquelle / Ratgeber"],
      ["BMV Förderprogramm Ladeinfrastruktur", "https://www.bmv.de/SharedDocs/DE/Artikel/G/infopapier-sechster-foerderaufruf-ladeinfrastruktur.html", "Erneuerbarer Strom als Fördervoraussetzung für geförderte öffentliche Ladeinfrastruktur.", "Primärquelle / Ministerium"],
      ["ICCT Lebenszyklusvergleich Fahrzeuge", "https://theicct.org/publication/a-global-comparison-of-the-life-cycle-greenhouse-gas-emissions-of-combustion-engine-and-electric-passenger-cars/", "Lebenszyklusvergleich von Verbrennern und Elektrofahrzeugen mit Strommix-Sensitivität.", "Wissenschaftsnahe Fachquelle"],
      ["IEA Global EV Outlook 2024", "https://www.iea.org/reports/global-ev-outlook-2024", "Elektromobilität, Batterien, Markt- und Infrastrukturdaten.", "Internationale Fachquelle"],
    ],
    secure:
      "Ein fairer Vergleich muss Lebenszyklus und Energiequelle betrachten. Der Akku zählt, aber der dauerhaft verbrannte fossile Kraftstoff des Verbrenners zählt ebenfalls.",
    uncertain:
      "Konkrete Werte hängen von Fahrzeuggröße, Batterie, Produktionsort, Fahrleistung, Ladestrom, Lebensdauer und Recyclingannahmen ab.",
  },
};

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function attr(value) {
  return esc(value).replace(/'/g, "&#039;");
}

function slugify(value) {
  return String(value ?? "")
    .replace(/\(redaktionelle Ergänzung\)/gi, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/co2/g, "co2")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function cleanText(value) {
  return String(value ?? "")
    .replace(/\u000b/g, "\n")
    .replace(/\u000c/g, "\n")
    .replace(/\u2028/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\bCO2\b/g, "CO₂")
    .replace(/\bAntwort- und Lösungspfad:\s*/gi, "Lösungspfad: ")
    .replace(/CodeX soll daraus einen Antwortblock bauen, der konkrete Schutz-, Steuerungs- und Lernarchitektur beschreibt\./gi, "Die Antwort beschreibt konkrete Schutz-, Steuerungs- und Lernarchitektur.")
    .replace(/CodeX soll Technik nicht romantisieren\./gi, "Technik wird nicht romantisiert.")
    .replace(/CodeX soll keine simple Pro-Schulden-Karte schreiben\./gi, "Die Einordnung ist keine pauschale Pro-Schulden-Position.")
    .replace(/CodeX soll keine EU-Verteidigungsschrift machen\./gi, "Die Einordnung verteidigt Regulierung nicht pauschal.")
    .replace(/CodeX soll diese Karte nicht technisch eng schreiben\./gi, "Die Karte bleibt nicht technisch eng.")
    .replace(/CodeX soll die Karte als ([^.]+) formulieren\./gi, "Die Karte formuliert eine $1.")
    .replace(/CodeX soll die Karte ([^.]+) schreiben\./gi, "Die Karte wird $1 formuliert.")
    .replace(/CodeX soll ([^.]+?) erklären\./gi, "Die Karte erklärt $1.")
    .replace(/CodeX soll ([^.]+?) schreiben\./gi, "Die Karte wird $1 formuliert.")
    .replace(/CodeX soll differenzieren:/gi, "Die Einordnung differenziert:")
    .replace(/CodeX soll ([^.]+)\./gi, "Die Karte setzt um: $1.")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function paragraphize(value) {
  const parts = cleanText(value).split(/\n{2,}|\n(?=\S)/).map((part) => part.trim()).filter(Boolean);
  return parts.map((part) => `<p>${esc(part)}</p>`).join("");
}

function list(items) {
  const rows = (items || []).filter(Boolean);
  if (!rows.length) return "";
  return `<ul class="check-list">${rows.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
}

function extractDocxText(file) {
  const xml = execFileSync("unzip", ["-p", file, "word/document.xml"], { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
  return xml
    .replace(/<w:tab\/>/g, "\t")
    .replace(/<w:br\/>/g, "\n")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/\r/g, "\n");
}

function parseRegister(text) {
  const start = text.indexOf("Kartenregister");
  const end = text.search(/\n1\. Migration kostet nur\?/);
  if (start < 0 || end < 0) return [];
  const lines = text.slice(start, end).split("\n").map((line) => line.trim()).filter(Boolean);
  const rows = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (!/^\d+$/.test(lines[i])) continue;
    const number = Number(lines[i]);
    const title = lines[i + 1];
    const cluster = lines[i + 2];
    if (title && cluster && !/^\d+$/.test(title)) rows.push({ number, title, cluster });
  }
  return rows;
}

function valueBetween(body, label, nextLabels) {
  const start = body.indexOf(label);
  if (start < 0) return "";
  const after = start + label.length;
  const next = nextLabels
    .map((nextLabel) => body.indexOf(nextLabel, after))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];
  return cleanText(body.slice(after, next ?? undefined));
}

function parseSourceLibraryV2(text) {
  const block = valueBetween(text, "4. Quellenbibliothek", ["5. Kartenindex"]);
  const sources = {};
  for (const line of block.split("\n").map((item) => item.trim()).filter(Boolean)) {
    const match = line.match(/^([IE]-[A-Z-]+)\s+[-\u2013\u2014]\s+([^:]+):\s+(.+)$/);
    if (!match) continue;
    const [, id, title, description] = match;
    sources[id] = {
      id,
      title: cleanText(title),
      description: cleanText(description),
      type: id.startsWith("I-") ? "Interne Referenz" : "Externe Quelle",
    };
  }
  return sources;
}

function parseRegisterV2(text) {
  const block = valueBetween(text, "5. Kartenindex", ["Codex-Umsetzung"]);
  const rows = [];
  for (const line of block.split("\n").map((item) => item.trim()).filter(Boolean)) {
    const match = line.match(/^(\d{2})\.\s+(.+?)\s+[-\u2013\u2014]\s+(.+)$/);
    if (!match) continue;
    rows.push({
      number: Number(match[1]),
      numberLabel: match[1],
      title: cleanText(match[2]),
      cluster: cleanText(match[3]),
    });
  }
  return rows;
}

function sectionBetweenV2(body, heading, nextHeadings) {
  return valueBetween(body, heading, nextHeadings);
}

function sourceIdsFromLine(block, label) {
  return valueBetween(block, label, ["Interne Quellen:", "Externe Quellen:", "Glossar-Hover:", "9. Warum zieht das Narrativ?"])
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item && !/^keine$/i.test(item));
}

const debateSourceDirectory = {
  "I-BEG": {
    title: "Führender Begriffsleitfaden der Wirkungsökonomie",
    url: "/referenz/kapitel-016-das-begriffssystem-der-wirkungsoekonomie/",
    type: "Interne WÖk-Quelle",
    limitation: "Belegt die WÖk-Begriffslogik, aber keine externe Tatsachenbehauptung.",
  },
  "I-WOHL": {
    title: "Die neue Ordnung des Wohlstands",
    url: "/referenz/",
    type: "Interne WÖk-Quelle",
    limitation: "Belegt das Modell und die Systemlogik der Wirkungsökonomie, nicht automatisch empirische Einzelfakten.",
  },
  "I-SYS": {
    title: "Systemmodell der Wirkungsökonomie",
    url: "/dokumente/systemmodell-der-wirkungsoekonomie/",
    type: "Interne WÖk-Quelle",
    limitation: "Belegt die Systemarchitektur, nicht die konkrete Datenlage eines Einzelfalls.",
  },
  "I-NACH": {
    title: "Nachhaltigkeit als Systemarchitektur",
    url: "/referenz/kapitel-006-nachhaltigkeit-ist-keine-strategie/",
    type: "Interne WÖk-Quelle",
    limitation: "Belegt die WÖk-Einordnung von Nachhaltigkeit, aber keine tagesaktuellen Emissionsdaten.",
  },
  "I-WSTG": {
    title: "Wirkungssteuergesetz",
    url: "/bibliothek/wirkungssteuer-wstg-3-0/",
    type: "Interne WÖk-Quelle",
    limitation: "Belegt den WÖk-Vorschlag, nicht geltendes Steuerrecht.",
  },
  "I-WUSTG": {
    title: "Technische Leitlinien WUStG",
    url: "/dokumente/technische-leitlinien-wustg-v2/",
    type: "Interne WÖk-Quelle",
    limitation: "Belegt die Modell- und Scorecardlogik, nicht die amtliche Einführung eines Systems.",
  },
  "I-PROD": {
    title: "Produktwirkung und Produktwirkungssteuer",
    url: "/dokumente/wp-produkte/",
    type: "Interne WÖk-Quelle",
    limitation: "Belegt die WÖk-Produktlogik, nicht einzelne Markt- oder Ökobilanzdaten.",
  },
  "I-LIEFER": {
    title: "Wirkungsoekonomie in der Lieferkette",
    url: "/dokumente/wirkungsoekonomie-in-der-lieferkette/",
    type: "Interne WÖk-Quelle",
    limitation: "Belegt die Lieferkettenlogik, nicht jede konkrete Unternehmenspraxis.",
  },
  "I-RAT": {
    title: "Wirkungsrat-Konzept",
    url: "/dokumente/wirkungsrat-konzept/",
    type: "Interne WÖk-Quelle",
    limitation: "Belegt den institutionellen Vorschlag, nicht bestehende Behördenpraxis.",
  },
  "I-TSROI": {
    title: "Whitepaper T-SROI",
    url: "/dokumente/whitepaper-t-sroi/",
    type: "Interne WÖk-Quelle",
    limitation: "Belegt Bewertungslogik und Transformationsmessung, nicht automatisch konkrete Projektdaten.",
  },
  "I-WOHN": {
    title: "Wohnen als Wirkungsfeld",
    url: "/dokumente/wp-wohnungsmarkt/",
    type: "Interne WÖk-Quelle",
    limitation: "Belegt die WÖk-Wohnlogik, nicht jede lokale Wohnungsmarktzahl.",
  },
  "I-RENTE": {
    title: "Wirkungsrente",
    url: "/bibliothek/wp-rente/",
    type: "Interne WÖk-Quelle",
    limitation: "Belegt den WÖk-Vorschlag, nicht geltendes Rentenrecht.",
  },
  "I-WESTG": {
    title: "Wirkungseinkommen",
    url: "/dokumente/wp-einkommen/",
    type: "Interne WÖk-Quelle",
    limitation: "Belegt den WÖk-Vorschlag, nicht geltendes Einkommensteuerrecht.",
  },
  "E-SDG": {
    url: "https://sdgs.un.org/2030agenda",
    type: "Externe Primärquelle",
    limitation: "Belegt Ziele und UN-Rahmen, aber keine geheime Steuerungsabsicht.",
  },
  "E-IPCC": {
    url: "https://www.ipcc.ch/report/ar6/syr/",
    type: "Externe Fachquelle",
    limitation: "Belegt Klimawissenschaft und Risikopfade, nicht jede einzelne nationale Maßnahme.",
  },
  "E-GCP": {
    url: "https://globalcarbonproject.org/carbonbudget/",
    type: "Datensatz / Forschungsquelle",
    limitation: "Belegt globale Emissionsdaten, nicht allein politische Verantwortungsverteilung.",
  },
  "E-EDGAR": {
    url: "https://edgar.jrc.ec.europa.eu/report_2024",
    type: "Datensatz / EU-Fachquelle",
    limitation: "Belegt Emissionsinventare und Vergleiche, nicht die Bewertung einzelner Politikpfade.",
  },
  "E-UBA": {
    url: "https://www.umweltbundesamt.de/daten/klima/treibhausgas-emissionen-in-deutschland",
    type: "Externe Behördenquelle",
    limitation: "Belegt Umwelt- und Emissionsdaten, nicht allein normative Schlussfolgerungen.",
  },
  "E-IEA": {
    url: "https://www.iea.org/reports/world-energy-outlook-2024",
    type: "Externe Fachquelle",
    limitation: "Belegt Energiepfade und Szenarien, die von Annahmen abhängen.",
  },
  "E-FRAUNHOFER": {
    url: "https://www.energy-charts.info/",
    type: "Datensatz / Forschungsquelle",
    limitation: "Belegt Stromdaten und Zeitreihen, nicht die Gesamtwirkung einzelner Maßnahmen.",
  },
  "E-ICCT": {
    url: "https://theicct.org/publication/a-global-comparison-of-the-life-cycle-greenhouse-gas-emissions-of-combustion-engine-and-electric-passenger-cars/",
    type: "Externe Fachquelle",
    limitation: "Belegt Lebenszyklusvergleiche; Annahmen zu Strommix, Batterie und Fahrleistung bleiben relevant.",
  },
  "E-IAB": {
    url: "https://iab.de/presseinfo/10-jahre-fluchtmigration-beschaeftigungsquote-von-gefluechteten-naehert-sich-dem-durchschnitt-in-deutschland-an/",
    type: "Externe Fachquelle",
    limitation: "Belegt Arbeitsmarktintegration und Zeitpfade, nicht jede kommunale Einzelsituation.",
  },
  "E-DEST": {
    url: "https://www.destatis.de/DE/Home/_inhalt.html",
    type: "Externe Statistikquelle",
    limitation: "Belegt amtliche Statistik, aber keine vollständige Wirkungsbewertung.",
  },
  "E-BA": {
    url: "https://statistik.arbeitsagentur.de/DE/Navigation/Statistiken/Interaktive-Statistiken/Migration-Zuwanderung-Flucht/Migration-Zuwanderung-Flucht-Nav.html",
    type: "Externe Behördenquelle",
    limitation: "Belegt Arbeitsmarktdaten; Statusgruppen und Zeiträume müssen getrennt werden.",
  },
  "E-OECD": {
    url: "https://www.oecd.org/en/data.html",
    type: "Externe Fachquelle",
    limitation: "Belegt internationale Vergleichsdaten, nicht automatisch deutsche Detailentscheidungen.",
  },
  "E-BMZ": {
    url: "https://www.bmz.de/de/ministerium/zahlen-fakten/bmz-transparenzportal",
    type: "Externe Behördenquelle",
    limitation: "Belegt Entwicklungszusammenarbeit und Transparenzdaten; Kredit, Zuschuss und Bürgschaft müssen getrennt werden.",
  },
  "E-UN-CHARTER": {
    url: "https://www.un.org/en/about-us/un-charter",
    type: "Externe Primärquelle",
    limitation: "Belegt den UN-Rechtsrahmen, nicht einzelne politische Deutungen.",
  },
  "E-UNESCO": {
    url: "https://www.unesco.org/en/media-information-literacy",
    type: "Externe Fachquelle",
    limitation: "Belegt Medienkompetenz- und Bildungsrahmen, nicht jede konkrete Plattformwirkung.",
  },
  "E-WHO": {
    url: "https://www.who.int/health-topics",
    type: "Externe Fachquelle",
    limitation: "Belegt Gesundheitsrahmen und Fachinformationen, nicht automatisch nationale Priorisierung.",
  },
  "E-DSA": {
    url: "https://digital-strategy.ec.europa.eu/en/policies/digital-services-act-package",
    type: "Externe Rechtsquelle",
    limitation: "Belegt EU-Plattformregeln, nicht die Moderationsentscheidung in jedem Einzelfall.",
  },
  "E-EMFA": {
    url: "https://commission.europa.eu/strategy-and-policy/priorities-2019-2024/new-push-european-democracy/protecting-democracy/european-media-freedom-act_en",
    type: "Externe Rechtsquelle",
    limitation: "Belegt den europäischen Medienfreiheitsrahmen, nicht alle nationalen Medienkonflikte.",
  },
  "E-BFV": {
    url: "https://www.verfassungsschutz.de/DE/themen/desinformation-und-hybride-bedrohungen/desinformation-und-hybride-bedrohungen_node.html",
    type: "Externe Behördenquelle",
    limitation: "Belegt Gefährdungs- und Desinformationsrahmen, nicht die Wahrheit jeder politischen Aussage.",
  },
  "E-BVERFG": {
    url: "https://www.bundesverfassungsgericht.de/DE/Home/home_node.html",
    type: "Externe Rechtsquelle",
    limitation: "Belegt verfassungsrechtliche Orientierung, nicht jede politische Zweckmäßigkeit.",
  },
  "E-BUNDESBANK": {
    url: "https://www.bundesbank.de/de/aufgaben/themen/eu-haushalt-und-finanzbeziehungen-672658",
    type: "Externe Behördenquelle",
    limitation: "Belegt Finanzbeziehungen und Salden, nicht die gesamte Wirkung europäischer Integration.",
  },
  "E-IMF": {
    url: "https://www.imf.org/en/Data",
    type: "Externe Fachquelle",
    limitation: "Belegt makroökonomische Daten, nicht die WÖk-Bewertung sozialer Wirkung.",
  },
  "E-ILO": {
    url: "https://ilostat.ilo.org/",
    type: "Datensatz / Fachquelle",
    limitation: "Belegt Arbeitsmarktdaten, nicht automatisch die Wirkung einzelner nationaler Regeln.",
  },
  "E-FAO": {
    url: "https://www.fao.org/interactive/state-of-food-agriculture/en/",
    type: "Externe Fachquelle",
    limitation: "Belegt Ernährungssysteme und Folgekosten, nicht individuelle Konsumentscheidungen.",
  },
};

function cleanPublicSourceTitle(title) {
  return String(title || "")
    .replace(/WOeK_Begriffsleitfaden_fuehrend_v1\.0\.md/g, "Führender Begriffsleitfaden der Wirkungsökonomie")
    .replace(/Natalie-Weber_Die neue Ordnung des Wohlstands_2026\.pdf/g, "Die neue Ordnung des Wohlstands")
    .replace(/Systemmodell-der-Wirkungsoekonomie\.pdf/g, "Systemmodell der Wirkungsökonomie")
    .replace(/Nachhaltigkeit-Systemarchitektur\.pdf/g, "Nachhaltigkeit als Systemarchitektur")
    .replace(/WStG_Oktober2025\.pdf/g, "Wirkungssteuergesetz")
    .replace(/Technische_Leitlinien_WUStG_Vollversion_Extended_v2\.pdf/g, "Technische Leitlinien WUStG")
    .replace(/WP_Produkte\.pdf/g, "Produktwirkung und Produktwirkungssteuer")
    .replace(/Whitepaper-T-SROI\.pdf/g, "Whitepaper T-SROI")
    .replace(/WP_Wohnungsmarkt_\.pdf/g, "Wohnen als Wirkungsfeld")
    .replace(/WP_Rente\.pdf/g, "Wirkungsrente")
    .replace(/WP_Einkommen\.pdf/g, "Wirkungseinkommen")
    .replace(/_/g, " ")
    .trim();
}

function normalizeDebateSource(source) {
  const directory = debateSourceDirectory[source.id] || {};
  const title = directory.title || cleanPublicSourceTitle(source.title || source.id);
  const url = source.url || directory.url || "/wirkungsradar/quellen/";
  const type = directory.type || source.type || (source.id?.startsWith("I-") ? "Interne WÖk-Quelle" : "Externe Quelle");
  const limitation = directory.limitation || source.limitation || "Belegt den genannten Prüfpunkt, ersetzt aber keine vollständige Wirkungsabwägung.";
  return {
    ...source,
    title,
    url,
    type,
    limitation,
    dataStatus: source.dataStatus || DATA_STAND,
    lastChecked: source.lastChecked || DATA_STAND,
  };
}

function parseQuestionsV2(block) {
  return block
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.endsWith("?"));
}

function publicRelatedText(value) {
  const text = cleanText(value)
    .replace(/^Verknüpfen mit\s+/i, "Passend dazu: ")
    .replace(/\s+sowie mindestens zwei Karten mit ähnlichem Frame oder Gegenframe\.?$/i, ".");
  return text || "Passende Vertiefungen werden über Themenfeld, Glossar und verwandte Debattenkarten erschlossen.";
}

function parsePathStepsV2(block) {
  return block
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^\d+\.\s+/.test(line))
    .map((line) => line.replace(/^\d+\.\s+/, ""));
}

function parseCardsFromTextV2(rawText) {
  const text = cleanText(rawText);
  const register = parseRegisterV2(text);
  if (register.length < 80) throw new Error(`Textmaster 2.0 unvollständig: ${register.length} Karten gefunden.`);
  const sourceLibrary = parseSourceLibraryV2(text);
  const bodyStart = text.indexOf("Codex-Umsetzung:");
  const cardText = text.slice(bodyStart >= 0 ? bodyStart : 0);
  const matches = register.map((row) => {
    const needle = `${row.numberLabel}. ${row.title}`;
    const index = cardText.indexOf(needle);
    if (index < 0) throw new Error(`Karte aus Textmaster 2.0 nicht gefunden: ${needle}`);
    return { ...row, index, headerLength: needle.length };
  }).sort((a, b) => a.index - b.index);
  const cards = [];
  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const next = matches[index + 1];
    const body = cleanText(cardText.slice(match.index + match.headerLength, next ? next.index : cardText.length));
    const hero = sectionBetweenV2(body, "1. Hero", ["2. Was wird behauptet?"]);
    const claim = sectionBetweenV2(body, "2. Was wird behauptet?", ["3. Sofortantwort"]);
    const answers = sectionBetweenV2(body, "3. Sofortantwort", ["4. Folgencheck"]);
    const consequences = sectionBetweenV2(body, "4. Folgencheck", ["5. Wirkpfad"]);
    const impactPath = sectionBetweenV2(body, "5. Wirkpfad", ["6. Kritische Fragen"]);
    const critical = sectionBetweenV2(body, "6. Kritische Fragen", ["7. Faktenlage"]);
    const facts = sectionBetweenV2(body, "7. Faktenlage", ["8. Quellen"]);
    const sourcesBlock = sectionBetweenV2(body, "8. Quellen", ["9. Warum zieht das Narrativ?"]);
    const resonance = sectionBetweenV2(body, "9. Warum zieht das Narrativ?", ["10. Methodik"]);
    const method = sectionBetweenV2(body, "10. Methodik", ["11. Verwandte Inhalte"]);
    const related = sectionBetweenV2(body, "11. Verwandte Inhalte", ["12. Narrativ einreichen"]);
    const title = valueBetween(hero, "Titel:", ["Untertitel:"]) || match.title;
    const subtitle = valueBetween(hero, "Untertitel:", []) || "";
    const rawFacts = valueBetween(facts, "Faktenkern / Prüfhinweis:", []) || facts;
    const sourceIds = [
      ...sourceIdsFromLine(sourcesBlock, "Interne Quellen:"),
      ...sourceIdsFromLine(sourcesBlock, "Externe Quellen:"),
    ];
    const sourceCards = sourceIds.map((id) => normalizeDebateSource(sourceLibrary[id] || {
      id,
      title: id,
      description: "Quellenreferenz aus dem redaktionellen Textmaster.",
      type: id.startsWith("I-") ? "Interne Referenz" : "Externe Quelle",
    }));
    const glossary = sourceIdsFromLine(sourcesBlock, "Glossar-Hover:");
    const slug = knownSlugByTitle.get(title) || knownSlugByTitle.get(match.title) || slugify(title);
    const redirectTarget = redirectAliasBySlug.get(slug);
    const card = {
      templateVersion: "2.0",
      number: match.number,
      title,
      originalTitle: match.title,
      slug,
      redirectTarget,
      cluster: match.cluster,
      category: clusterLabels[match.cluster] || match.cluster,
      editorialStatus: "redaktionell geprüft",
      shortJudgement: subtitle,
      claim: {
        statement: valueBetween(claim, "Behauptung:", ["Implizite Botschaft:"]),
        implicitMessage: valueBetween(claim, "Implizite Botschaft:", ["Warum das wichtig ist:"]),
        whyImportant: valueBetween(claim, "Warum das wichtig ist:", []),
      },
      answers: {
        seconds10: valueBetween(answers, "10 Sekunden:", ["30 Sekunden:"]),
        seconds30: valueBetween(answers, "30 Sekunden:", ["2 Minuten:"]),
        seconds120: valueBetween(answers, "2 Minuten:", []),
      },
      consequences: {
        resonanceRoom: valueBetween(consequences, "Ausgelöster Resonanzraum:", ["Wirkungsrisiko erster Ordnung:"]),
        order1: valueBetween(consequences, "Wirkungsrisiko erster Ordnung:", ["Wirkungsrisiko zweiter Ordnung:"]),
        order2: valueBetween(consequences, "Wirkungsrisiko zweiter Ordnung:", ["Wirkungsrisiko dritter Ordnung:"]),
        order3: valueBetween(consequences, "Wirkungsrisiko dritter Ordnung:", ["Wirkungsökonomische Korrektur:"]),
        correction: valueBetween(consequences, "Wirkungsökonomische Korrektur:", []),
      },
      impactPathSteps: parsePathStepsV2(impactPath),
      criticalQuestions: parseQuestionsV2(critical),
      facts: rawFacts,
      sourceCards,
      glossary,
      whyItWorks: valueBetween(resonance, "Resonanzprofil:", []) || resonance,
      methodology: valueBetween(method, "Methode:", []) || method,
      relatedContent: publicRelatedText(related),
      masterSource: {
        document: path.basename(MASTER_DOCX),
        stand: DATA_STAND,
      },
      trueCore: rawFacts,
      falseJump: valueBetween(claim, "Implizite Botschaft:", ["Warum das wichtig ist:"]),
      betterQuestion: subtitle,
      systemLever: valueBetween(consequences, "Wirkungsökonomische Korrektur:", []),
      effectPath: {
        order1: valueBetween(consequences, "Wirkungsrisiko erster Ordnung:", ["Wirkungsrisiko zweiter Ordnung:"]),
        order2: valueBetween(consequences, "Wirkungsrisiko zweiter Ordnung:", ["Wirkungsrisiko dritter Ordnung:"]),
        order3: valueBetween(consequences, "Wirkungsrisiko dritter Ordnung:", ["Wirkungsökonomische Korrektur:"]),
        mpd: "",
      },
      objections: [],
      moderation: {},
      sourceHints: sourceIds.join(", "),
    };
    applyEditorialOverlays(card);
    cards.push(card);
  }
  return { version: "2.0", stand: DATA_STAND, source: path.basename(MASTER_DOCX), sourceLibrary, cards };
}

function parseObjections(value) {
  const text = cleanText(value);
  if (!text) return [];
  return text
    .split(/\n(?=Einwand: )|(?=Einwand: )/g)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const match = entry.match(/^Einwand:\s*(.+?)(?:\.\s+|\?\s+)([\s\S]*)$/);
      if (!match) return { objection: entry, answer: "" };
      return { objection: match[1].trim(), answer: match[2].trim() };
    });
}

function parseModeration(value) {
  const text = cleanText(value);
  const hints = {};
  for (const line of text.split("\n").map((item) => item.trim()).filter(Boolean)) {
    const match = line.match(/^([^:]+):\s*(.+)$/);
    if (match) hints[match[1].trim()] = match[2].trim();
  }
  return hints;
}

function parseCardsFromText(rawText) {
  const text = cleanText(rawText);
  if (text.includes("WirkungsökonomieDebatten-Kompass 2.0") || text.includes("Finaler Textmaster")) {
    return parseCardsFromTextV2(rawText);
  }
  const register = parseRegister(text);
  if (register.length < 80) throw new Error(`Kartenregister unvollständig: ${register.length} Einträge gefunden.`);
  const start = text.search(/\n1\. Migration kostet nur\?/);
  if (start < 0) throw new Error("Masterquelle enthält keinen erkennbaren Start der Debattenkarten.");
  const cardText = text.slice(start).trim();
  const matches = register.map((row) => {
    const needle = `${row.number}. ${row.title}`;
    const index = cardText.indexOf(needle);
    if (index < 0) throw new Error(`Karte aus Register nicht im Dokument gefunden: ${needle}`);
    return {
      number: row.number,
      title: row.title,
      cluster: row.cluster,
      index,
      headerLength: needle.length,
    };
  }).sort((a, b) => a.index - b.index);
  const cards = [];
  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const next = matches[index + 1];
    const number = Number(match.number);
    const title = match.title.trim();
    const sectionStart = match.index + match.headerLength;
    const sectionEnd = next ? next.index : cardText.length;
    const body = cleanText(cardText.slice(sectionStart, sectionEnd));
    const meta = match;
    const shortJudgement = valueBetween(body, "Kurzurteil:", ["Was an diesem Satz verfängt:", "Wahrer Kern:"]);
    const hook = valueBetween(body, "Was an diesem Satz verfängt:", ["Wahrer Kern:"]);
    const trueCore = valueBetween(body, "Wahrer Kern:", ["Falscher Sprung:"]);
    const falseJump = valueBetween(body, "Falscher Sprung:", ["Bessere Frage:"]);
    const betterQuestion = valueBetween(body, "Bessere Frage:", ["Systemischer Hebel:"]);
    const lever = valueBetween(body, "Systemischer Hebel:", ["Wirkpfad und systemische Einordnung"]);
    const pathBlock = valueBetween(body, "Wirkpfad und systemische Einordnung", ["Antworttexte"]);
    const order1 = valueBetween(pathBlock, "1. Ordnung:", ["2. Ordnung:"]);
    const order2 = valueBetween(pathBlock, "2. Ordnung:", ["3. Ordnung:"]);
    const order3 = valueBetween(pathBlock, "3. Ordnung:", ["Mensch, Planet, Demokratie:"]);
    const mpd = valueBetween(pathBlock, "Mensch, Planet, Demokratie:", []);
    const answersBlock = valueBetween(body, "Antworttexte", ["Einwände und Antwortlinien"]);
    const answer10 = valueBetween(answersBlock, "10 Sekunden:", ["30 Sekunden:"]);
    const answer30 = valueBetween(answersBlock, "30 Sekunden:", ["120 Sekunden:"]);
    const answer120 = valueBetween(answersBlock, "120 Sekunden:", []);
    const objectionsBlock = valueBetween(body, "Einwände und Antwortlinien", ["Moderations- und Quellenhinweise"]);
    const moderationBlock = valueBetween(body, "Moderations- und Quellenhinweise", []);
    const moderation = parseModeration(moderationBlock);
    const rawTitle = meta.title || title;
    const slug = knownSlugByTitle.get(rawTitle) || knownSlugByTitle.get(title) || slugify(title);
    const card = {
      number,
      title: rawTitle.replace(/\s+\(redaktionelle Ergänzung\)$/i, "").trim(),
      originalTitle: rawTitle,
      slug,
      cluster: meta.cluster || "unclustered",
      category: clusterLabels[meta.cluster] || meta.cluster || "Debatten-Kompass",
      editorialStatus: /redaktionelle Ergänzung/.test(rawTitle) ? "redaktionelle Ergänzung aus Masterquelle" : "aus Masterquelle integriert",
      shortJudgement,
      hook,
      trueCore,
      falseJump,
      betterQuestion,
      systemLever: lever,
      effectPath: {
        order1,
        order2,
        order3,
        mpd,
      },
      answers: {
        seconds10: answer10,
        seconds30: answer30,
        seconds120: answer120,
      },
      objections: parseObjections(objectionsBlock),
      moderation,
      sourceHints: moderation.Prüfhinweise || "",
      masterSource: {
        document: "Wirkungsradar_Debattenkarten_Langfassung.docx",
        stand: DATA_STAND,
      },
    };
    applyEditorialOverlays(card);
    cards.push(card);
  }
  return { stand: DATA_STAND, source: "Wirkungsradar_Debattenkarten_Langfassung.docx", cards };
}

function applyEditorialOverlays(card) {
  const overlay = p0RescueOverlays[card.slug];
  if (!overlay) return;
  if (card.templateVersion === "2.0") {
    card.answers = { ...card.answers, ...overlay.answers };
    if (overlay.systemLever) {
      card.systemLever = overlay.systemLever;
      card.consequences.correction = overlay.systemLever;
    }
    if (overlay.trueCoreAppend || overlay.falseJumpAppend || overlay.mpd) {
      card.facts = cleanText([card.facts, overlay.trueCoreAppend, overlay.falseJumpAppend, overlay.mpd].filter(Boolean).join("\n\n"));
      card.trueCore = card.facts;
    }
    if (overlay.sources?.length) {
      card.sourceCards = [
        ...card.sourceCards,
        ...overlay.sources.map(([title, url, description, type], index) => ({
          id: `P0-${card.slug}-${index + 1}`,
          title,
          url,
          description,
          type,
        })),
      ];
    }
    card.p0Rescue = overlay;
    return;
  }
  card.answers = { ...card.answers, ...overlay.answers };
  if (overlay.systemLever) card.systemLever = overlay.systemLever;
  if (overlay.trueCoreAppend) card.trueCore = `${card.trueCore}${overlay.trueCoreAppend}`;
  if (overlay.falseJumpAppend) card.falseJump = `${card.falseJump}${overlay.falseJumpAppend}`;
  if (overlay.mpd) card.effectPath.mpd = overlay.mpd;
  card.p0Rescue = overlay;
  if (!card.editorialStatus.includes("P0 gerettet")) {
    card.editorialStatus = `${card.editorialStatus} · P0 gerettet`;
  }
}

function readMasterData() {
  if (fs.existsSync(MASTER_JSON)) {
    return JSON.parse(fs.readFileSync(MASTER_JSON, "utf8"));
  }
  if (fs.existsSync(MASTER_DOCX)) {
    const parsed = parseCardsFromText(extractDocxText(MASTER_DOCX));
    fs.mkdirSync(path.dirname(MASTER_JSON), { recursive: true });
    fs.writeFileSync(MASTER_JSON, `${JSON.stringify(parsed, null, 2)}\n`);
    return parsed;
  }
  throw new Error(`Keine Masterquelle gefunden: ${MASTER_JSON} oder ${MASTER_DOCX}`);
}

function write(file, html) {
  const full = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, `${html.trim()}\n`);
}

function navMatch(item) {
  return (item.match || []).join("|");
}

function navSlug(label) {
  return label
    .toLowerCase()
    .replaceAll("ö", "oe")
    .replaceAll("ä", "ae")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .replaceAll("&", "und")
    .replaceAll("/", "-")
    .replaceAll("?", "")
    .replaceAll(" ", "-");
}

function navLink(item, base) {
  return `<a href="${esc(`${base}${item.href}`)}" data-nav-match="${esc(navMatch(item))}">${esc(item.label)}</a>`;
}

function navLinks(items, base) {
  return items.map((item) => navLink(item, base)).join("\n");
}

function headerItem(item, base) {
  if (!item.childrenRef) return navLink(item, base);

  const children = NAVIGATION[item.childrenRef] || [];
  const slug = navSlug(item.label);
  const panel = navLinks(children, base)
    .split("\n")
    .map((line) => `        ${line}`)
    .join("\n");
  return `<details class="nav-more nav-${esc(slug)}" data-nav-match="${esc(navMatch(item))}">
  <summary>${esc(item.label)}</summary>
  <div class="nav-more-panel">
${panel}
  </div>
</details>`;
}

function headerNav(base) {
  return NAVIGATION.header.map((item) => headerItem(item, base)).join("\n");
}

function headerUtilityNav(base) {
  return (NAVIGATION.more || [])
    .filter((item) => HEADER_UTILITY_LABELS.has(item.label))
    .map((item) => {
      const label = esc(item.label);
      const primary = item.label === "Mein Wirkungsraum" ? ' data-utility-primary="true"' : "";
      return `<a class="site-utility-link site-utility-link--${esc(navSlug(item.label))}" href="${esc(`${base}${item.href}`)}" data-nav-match="${esc(navMatch(item))}" data-utility-label="${label}"${primary}>${label}</a>`;
    })
    .join("\n");
}

function footerNav(base) {
  return NAVIGATION.footerGroups
    .map((group) => `<div class="footer-nav-group">
  <h3>${esc(group.title)}</h3>
  <div class="footer-nav-links">
${navLinks(group.items, base)
  .split("\n")
  .map((line) => `      ${line}`)
  .join("\n")}
  </div>
</div>`)
    .join("\n");
}

function renderLayoutTemplate(template, base) {
  return template
    .replaceAll("{{BASE}}", base)
    .replaceAll("{{HEADER_NAV}}", headerNav(base))
    .replaceAll("{{HEADER_UTILITY_NAV}}", headerUtilityNav(base))
    .replaceAll("{{FOOTER_NAV}}", footerNav(base))
    .replaceAll("{{FOOTER_LEGAL_NAV}}", navLinks(NAVIGATION.footerLegal, base))
    .split("\n")
    .map((line) => (line ? `    ${line}` : line))
    .join("\n");
}

function siteHeader(base) {
  return renderLayoutTemplate(HEADER_TEMPLATE, base);
}

function siteFooter(base) {
  return renderLayoutTemplate(FOOTER_TEMPLATE, base);
}

function shell({ title, description, canonical, base, main, searchType = "Debattenkarte" }) {
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)} | Debatten-Kompass</title>
    <meta name="description" content="${esc(description)}">
    <meta name="search_section" content="Debatten-Kompass">
    <meta name="search_type" content="${esc(searchType)}">
    <link rel="canonical" href="${esc(canonical)}">
    <link rel="icon" href="${base}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=20260628-radar-toc">
  </head>
  <body>
${siteHeader(base)}
    <main id="inhalt" data-pagefind-body>${main}</main>
${siteFooter(base)}
    <script src="${base}assets/js/main.js?v=20260612-mobile-table-fix"></script>
  </body>
</html>`;
}

function redirectShell({ title, description, canonical, target, base }) {
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)} | Weiterleitung</title>
    <meta name="description" content="${esc(description)}">
    <meta name="robots" content="noindex, follow">
    <link rel="canonical" href="${esc(canonical)}">
    <meta http-equiv="refresh" content="0; url=${esc(target)}">
    <link rel="icon" href="${base}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=20260628-radar-toc">
  </head>
  <body>
    <main class="section" data-search-exclude>
      <div>
        <article class="card">
          <p class="card-kicker">Weiterleitung</p>
          <h1>${esc(title)}</h1>
          <p>Diese Aussage wird kanonisch auf einer zentralen Debattenkarte geführt.</p>
          <p><a class="btn btn-primary" href="${esc(target)}">Kanonische Karte öffnen</a></p>
        </article>
      </div>
    </main>
  </body>
</html>`;
}

function radarNav(base = "") {
  const links = [
    ["Debatten-Kompass", `${base}wirkungsradar/`],
    ["Debattenkarten", `${base}wirkungsradar/debattenkarten/`],
    ["Antwort-Playbooks", `${base}wirkungsradar/antwort-playbooks/`],
    ["Wirkungsradar-Methode", `${base}wirkungsradar/methode/`],
    ["Narrativ einreichen", ACADEMY_NARRATIVE_URL],
  ];
  return `<nav class="topic-subnav radar-sprint-nav" aria-label="Debatten-Kompass Navigation" data-search-exclude>${links.map(([label, href]) => `<a href="${esc(href)}">${esc(label)}</a>`).join("")}</nav>`;
}

function renderToc() {
  const links = [
    ["#behauptung", "Behauptung"],
    ["#frame-erkennen", "Frame erkennen"],
    ["#framewechsel", "Frame wechseln"],
    ["#sofortantwort", "Sofortantwort"],
    ["#10-sekunden", "10 Sekunden"],
    ["#30-sekunden", "30 Sekunden"],
    ["#2-minuten", "2 Minuten"],
    ["#folgencheck", "Folgencheck"],
    ["#fakten-systemgrenzencheck", "Fakten & Systemgrenzen"],
    ["#was-wird-nicht-gesagt", "Was fehlt?"],
    ["#bilanzgrenze", "Bilanzgrenze"],
    ["#wellenprofil", "Fünf Wellen"],
    ["#tiefe", "Tiefe"],
    ["#wirkpfad", "Wirkpfad"],
    ["#kritische-fragen", "Kritische Fragen"],
    ["#quellen", "Quellen"],
    ["#warum-zieht-das", "Warum zieht das?"],
    ["#methodik", "Methodik"],
  ];
  return `<section class="section debate-toc-section" id="inhaltsverzeichnis" data-debate-toc data-search-exclude><div><article class="card debate-toc-card"><p class="card-kicker">Inhaltsverzeichnis</p><nav class="dossier-tab-nav v3-radar-nav" aria-label="Seitenbereiche">${links.map(([href, label]) => `<a href="${href}">${label}</a>`).join(" ")}</nav></article></div></section>`;
}

function answerId(label) {
  if (label === "10 Sekunden") return "10-sekunden";
  if (label === "30 Sekunden") return "30-sekunden";
  if (label === "2 Minuten") return "2-minuten";
  return "";
}

function answerAccordion(card) {
  const rows = [
    ["10 Sekunden", "Pointierte Antwort", card.answers.seconds10],
    ["30 Sekunden", "Faktenkern und Framekorrektur", card.answers.seconds30],
    ["2 Minuten", "Systemische Antwort", card.answers.seconds120],
  ].map(([label, purpose, text]) => [label, purpose, cleanText(text)]);
  return `<section class="section section-soft v3-layer v3-layer-answer debate-immediate-answer" id="sofortantwort" data-debate-immediate-answer><span id="reaktion" class="sr-only">Reaktion</span><div><div class="section-header"><p class="hero-kicker">Sofortantwort</p><h2>Was antworte ich?</h2><p>Wenn du gerade in der Debatte bist. Die Sekunden sind Kommunikationsstufen, keine Stoppuhr.</p><p><a class="btn btn-secondary" href="#folgencheck">Mehr verstehen</a></p></div><div class="radar-answer-accordion host-answer-tabs">${rows.map(([label, purpose, text], index) => `<details class="radar-answer-item"${index === 0 ? " open" : ""} id="${answerId(label)}"><summary><span class="radar-answer-time">${esc(label)}</span><span class="radar-answer-label">${esc(purpose)}</span></summary>${paragraphize(text)}<button class="copy-chip" type="button" data-copy-text='${attr(text)}'>Antwort kopieren</button></details>`).join("")}</div></div></section>`;
}

const reactionOverrides = {
  "deutschland-hat-keine-verfassung": {
    frameLabel: "Legitimitätszweifel-Frame",
    principle: "Nicht im Namensspiel hängen bleiben. Auf Funktion, Geltung, Grundrechte, Art. 20 und Art. 146 GG verschieben.",
    doNotDo: [
      "Nicht nur sagen: „Doch, haben wir.“ Das bleibt im Namensstreit hängen.",
      "Nicht den historischen Provisoriumscharakter leugnen.",
      "Nicht mit Spott reagieren; das stabilisiert oft Misstrauen.",
      "Nicht in eine Paragraphenschlacht geraten, bevor der Frame verschoben ist.",
    ],
    frameShift: {
      from: "Der Name „Grundgesetz“ soll fehlende Verfassungswirkung beweisen",
      to: "Verfassung an ihrer Funktion prüfen: Grundrechte, Staatsorganisation, Bindung und Durchsetzung",
    },
    instantLine:
      "Deutschland hat eine Verfassung: Sie heißt Grundgesetz. Der Name ist historisch, die Wirkung ist verfassungsrechtlich.",
    bridgeQuestion:
      "Welche Ordnung schützt in Deutschland Menschenwürde, Grundrechte, Demokratie, Rechtsstaat und Gewaltenteilung - und wie wird sie durchgesetzt?",
    copyShort:
      "Deutschland hat eine Verfassung: Sie heißt Grundgesetz. Entscheidend ist nicht der Titel, sondern die Wirkung: Grundrechte, Rechtsstaat, Demokratie und Bindung aller Staatsgewalt.",
    copyMedium:
      "Der wahre Kern ist historisch: 1949 sollte das Grundgesetz keine endgültige Verfassung nur für Westdeutschland sein. Heute gilt es gesamtdeutsch als Verfassungsordnung. Art. 146 macht es nicht ungültig, sondern beschreibt eine mögliche Ablösung durch eine frei beschlossene neue Verfassung.",
  },
  "migration-kostet-nur": {
    frameLabel: "Kostenstellen-Frame",
    principle: "Nicht Menschen gegen Haushalt rechnen. Auf Integrationsqualität und Zeitpfad verschieben.",
    doNotDo: [
      "Nicht in eine reine Euro-Debatte einsteigen.",
      "Nicht Menschen als Kostenstelle wiederholen.",
      "Nicht so tun, als seien Anfangskosten die Lebensbilanz.",
    ],
    frameShift: {
      from: "Menschen als dauerhafte Kostenstelle",
      to: "Integrationsarchitektur als Weg zu Sprache, Arbeit, Beiträgen, Versorgung und Teilhabe",
    },
    instantLine:
      "Menschen sind keine Kostenstelle. Ankommen braucht am Anfang Organisation; entscheidend ist, ob daraus schnell Sprache, Arbeit, Beiträge und Teilhabe werden.",
    bridgeQuestion:
      "Welche Integrationsbedingungen machen aus Anfangsaufwand gesellschaftliche Wirkleistung?",
    copyShort:
      "Menschen sind keine Kostenstelle. Die bessere Frage ist: Welche Integrationsbedingungen machen aus Anfangsaufwand Sprache, Arbeit, Beiträge und Teilhabe?",
    copyMedium:
      "Ankommen braucht am Anfang Geld, Personal und Organisation. Der Denkfehler ist, daraus ein dauerhaftes Urteil über Menschen zu machen. Entscheidend ist die Integrationsarchitektur: Sprache, Abschlüsse, Arbeit, Wohnen, Kita, Schule und faire Verfahren.",
  },
  "deutschland-nur-zwei-prozent": {
    frameLabel: "Prozent-Ablenkung",
    principle: "Nicht bei der Prozentzahl stehenbleiben. Auf Hebelwirkung, Standards und Folgekosten verschieben.",
    doNotDo: [
      "Nicht die Prozentzahl als Hauptdebatte akzeptieren.",
      "Nicht Verantwortung mit Alleinwirkung verwechseln.",
      "Nicht direkte Emissionen isoliert betrachten.",
    ],
    frameShift: {
      from: "Deutschland als zu klein, um zu wirken",
      to: "Industrieland mit Hebeln über Technologie, Standards, EU, Lieferketten und vermiedene Folgekosten",
    },
    instantLine:
      "Die Prozentzahl erklärt nicht die Wirkung. Entscheidend ist, welche Hebel ein Industrieland über Technologie, Standards, Märkte und Europa auslöst.",
    bridgeQuestion:
      "Welche Hebel hat ein Industrieland, obwohl sein direkter Anteil begrenzt ist?",
    copyShort:
      "Die Prozentzahl ist nicht die Wirkungsrechnung. Relevant sind Hebel: Technologie, Standards, EU-Regeln, Lieferketten und vermiedene Folgekosten.",
    copyMedium:
      "Der direkte Anteil ist begrenzt, aber daraus folgt nicht Wirkungslosigkeit. Industrieländer wirken über Technologie, Nachfrage, Standards, Infrastruktur, EU-Regeln und Investitionspfade. Die bessere Frage lautet: Welche Hebel senken reale Folgekosten und verschieben Märkte?",
  },
  "windraeder-voegel-wald-beton-rueckbau": {
    frameLabel: "Naturtausch-Frame",
    principle: "Nicht Naturschutz gegen Energiewende ausspielen. Auf naturverträgliche Planung und fossile Dauerfolgen verschieben.",
    doNotDo: [
      "Nicht Eingriffe kleinreden.",
      "Nicht fossile Schäden unsichtbar lassen.",
      "Nicht so argumentieren, als sei Nichtbauen automatisch Naturschutz.",
    ],
    frameShift: {
      from: "Erneuerbare als Naturzerstörung",
      to: "Vergleich realer Alternativen: naturverträglicher Ausbau versus fossile Dauerfolgen",
    },
    instantLine:
      "Windkraft braucht gute Planung und Artenschutz. Aber Nichtbauen ist nicht automatisch Naturschutz, wenn fossile Schäden weiterlaufen.",
    bridgeQuestion:
      "Wie bauen wir erneuerbare Infrastruktur naturverträglich, statt fossile Schäden zu normalisieren?",
    copyShort:
      "Ja, Windkraft braucht Artenschutz und gute Planung. Der Frame kippt aber, wenn fossile Dauerfolgen unsichtbar bleiben. Entscheidend ist naturverträglicher Ausbau.",
    copyMedium:
      "Der Eingriff in Landschaft und Ökosysteme ist real und muss geplant werden. Der Denkfehler ist, daraus zu machen, Nichtbauen sei automatisch Naturschutz. Wirklich sauber ist der Vergleich realer Alternativen: naturverträglicher Ausbau versus fossile Dauerfolgen.",
  },
};

function firstSentence(value) {
  const text = cleanText(value).replace(/^„|“$/g, "");
  const match = text.match(/^(.+?[.!?])(\s|$)/);
  return cleanText(match ? match[1] : text);
}

function limitChars(value, max = 280) {
  const text = cleanText(value);
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, Math.max(0, cut.lastIndexOf(" ")))}…`;
}

function abstractFrame(value, fallback) {
  const text = cleanText(value || fallback);
  if (!text) return "verkürzter Problemrahmen";
  return text
    .replace(/^Die Aussage\s+/i, "")
    .replace(/^Der Frame\s+/i, "")
    .replace(/^Die Karte soll deshalb\s+/i, "")
    .replace(/^Die Aussage wird auf den vollständigen Wirkpfad zurückgeführt:\s*/i, "")
    .replace(/\.$/, "")
    .slice(0, 140);
}

function questionOnly(value, fallback) {
  const text = cleanText(value || fallback)
    .replace(/\s*Die Karte soll deshalb[\s\S]*$/i, "")
    .replace(/\s*Die Aussage wird auf den vollständigen Wirkpfad zurückgeführt:\s*/i, " ");
  const match = text.match(/([^.!?]*\?)/);
  return cleanText(match ? match[1] : text || fallback);
}

function betterToFrame(card, bridgeQuestion) {
  const raw = cleanText(card.systemLever || card.consequences?.correction || "");
  if (!raw || /vollständigen Wirkpfad|Die Karte soll deshalb/i.test(raw)) {
    return bridgeQuestion;
  }
  return abstractFrame(raw, bridgeQuestion);
}

function inferFrameLabel(card) {
  const text = cardTextForMigration(card).toLowerCase();
  if (/kosten|geld|steuer|haushalt|schulden|preis/.test(text)) return "Kosten-Frame";
  if (/prozent|anteil|zu klein|wirkungslos/.test(text)) return "Ablenkungs-Frame";
  if (/natur|wald|vogel|landschaft|artenschutz/.test(text)) return "Naturtausch-Frame";
  if (/freiheit|verbot|kontrolle|zensur/.test(text)) return "Freiheitsverlust-Frame";
  if (/faul|missbrauch|schmarotz|tourismus|eingezahlt/.test(text)) return "Missbrauchs-Generalverdacht";
  if (/technik|fusion|wasserstoff|e-fuel|aufschub/.test(text)) return "Aufschub-Frame";
  if (/medien|wissenschaft|gekauft|lügen|luegen/.test(text)) return "Vertrauensbruch-Frame";
  if (/identität|identitaet|tradition|gender|familie|kultur/.test(text)) return "Identitäts-Frame";
  return "Verkürzungs-Frame";
}

function defaultDoNotDo(card) {
  const listItems = [
    "Nicht die Zuspitzung als Hauptdebatte übernehmen.",
    "Nicht mit moralischer Empörung beginnen.",
    "Nicht so antworten, als müsse nur ein einzelner Satz widerlegt werden.",
  ];
  if (/kosten|geld|steuer|haushalt|schulden|preis/i.test(cardTextForMigration(card))) {
    listItems[1] = "Nicht in eine reine Kostenliste einsteigen.";
  }
  return listItems;
}

function normalizeReaction(card) {
  if (reactionOverrides[card.slug]) {
    card.reaction = { ...reactionOverrides[card.slug], reviewNeeded: false };
    return card.reaction;
  }
  const existing = card.reaction?.reviewNeeded ? {} : (card.reaction || {});
  const bridgeQuestion = questionOnly(existing.bridgeQuestion || card.betterQuestion || card.claim?.whyImportant, "Welche Wirkung entsteht - und welche bessere Frage öffnet den vollständigen Wirkungsraum?");
  const from = cleanText(existing.frameShift?.from || abstractFrame(card.claim?.implicitMessage || card.falseJump || card.hook, "verkürzter Wirkungsrahmen"));
  const to = cleanText(existing.frameShift?.to || betterToFrame(card, bridgeQuestion));
  let instantLine = cleanText(existing.instantLine || card.answers?.seconds10 || card.shortJudgement || bridgeQuestion);
  const statement = cleanText(card.claim?.statement || card.title).replace(/[„“"]/g, "");
  if (statement && instantLine.toLowerCase().startsWith(statement.toLowerCase().slice(0, 24))) {
    instantLine = `Der Satz ist zu eng. Entscheidend ist nicht die Zuspitzung, sondern die Wirkungsfrage: ${bridgeQuestion}`;
  }
  if (/^Der wahre Kern\b/i.test(instantLine)) {
    instantLine = instantLine.replace(/^Der wahre Kern\b[^:]*:\s*/i, "Der prüfbare Punkt ist eng begrenzt: ");
    instantLine = instantLine.replace(/^Der wahre Kern\b[^.]*\.\s*/i, "Der prüfbare Punkt ist eng begrenzt. ");
  }
  instantLine = limitChars(instantLine, 240);
  const principle = cleanText(existing.principle || `Nicht im alten Frame bleiben. Auf die Wirkungsfrage verschieben: ${bridgeQuestion}`);
  const copyShort = limitChars(existing.copyShort || `${instantLine} ${bridgeQuestion}`, 280);
  const mediumBase = cleanText(existing.copyMedium || card.answers?.seconds30 || `${instantLine} ${card.consequences?.correction || card.systemLever || ""}`);
  const reaction = {
    frameLabel: cleanText(existing.frameLabel || inferFrameLabel(card)),
    principle,
    doNotDo: existing.doNotDo?.length ? existing.doNotDo : defaultDoNotDo(card),
    frameShift: { from, to },
    instantLine,
    bridgeQuestion,
    copyShort,
    copyMedium: mediumBase,
    reviewNeeded: !existing.frameLabel || !existing.principle || !existing.frameShift || !existing.instantLine || !existing.copyShort || !existing.copyMedium,
  };
  card.reaction = reaction;
  return reaction;
}

function topReactionPanel(card) {
  const reaction = normalizeReaction(card);
  const avoid = reaction.doNotDo?.length
    ? `<details class="source-panel"><summary>Was ich vermeiden sollte</summary>${list(reaction.doNotDo)}</details>`
    : "";
  return `<section class="section section-soft debate-top-reaction" id="framewechsel" data-top-reaction-panel>
      <div>
        <article class="card">
          <p class="card-kicker">${esc(reaction.frameLabel)} · Frame wechseln</p>
          <h2>${esc(reaction.principle)}</h2>
          <p><strong>Nicht übernehmen:</strong> ${esc(reaction.frameShift.from)}</p>
          <p><strong>Stattdessen öffnen:</strong> ${esc(reaction.frameShift.to)}</p>
          <div class="card-grid two">
            <article class="card"><p class="card-kicker" id="sprechssatz">Sprechsatz</p><p>${esc(reaction.instantLine)}</p><button class="copy-chip" type="button" data-copy-text='${attr(reaction.copyShort)}'>Sofortantwort kopieren</button></article>
            <article class="card"><p class="card-kicker">Bessere Frage</p><p>${esc(reaction.bridgeQuestion)}</p><button class="copy-chip" type="button" data-copy-text='${attr(reaction.copyMedium)}'>30-Sekunden-Antwort kopieren</button></article>
          </div>
          ${avoid}
        </article>
      </div>
    </section>`;
}

function frameRecognitionBlock(card) {
  const reaction = normalizeReaction(card);
  const frame = card.claim?.implicitMessage || card.falseJump || card.hook || "Die Aussage legt eine schnelle Deutung nahe.";
  const conclusion = card.claim?.whyImportant || card.betterQuestion || "Die Debatte wird dadurch auf eine enge Schlussfolgerung geschoben.";
  const mechanism = card.whyItWorks || card.consequences?.resonanceRoom || "Der Satz wird anschlussfähig, weil er einen wahren Kern mit einer verkürzten Gesamtdeutung verbindet.";
  return `<section class="section debate-frame-recognition" id="frame-erkennen" data-frame-recognition-block>
    <div>
      <div class="section-header"><p class="hero-kicker">Frame erkennen</p><h2>Welche Schlussfolgerung soll ich übernehmen?</h2><p>Viele Debattenkarten beginnen nicht bei „wahr oder falsch“, sondern bei der Frage, welcher Deutungsrahmen gesetzt wird.</p></div>
      <div class="card-grid three">
        <article class="card"><p class="card-kicker">Frame</p><h3>${esc(reaction.frameLabel)}</h3>${paragraphize(frame)}</article>
        <article class="card"><p class="card-kicker">Gewünschte Schlussfolgerung</p>${paragraphize(conclusion)}</article>
        <article class="card"><p class="card-kicker">Warum anschlussfähig?</p>${paragraphize(mechanism)}</article>
      </div>
    </div>
  </section>`;
}

function cardTextForMigration(card) {
  return cleanText([
    card.title,
    card.category,
    card.hook,
    card.shortJudgement,
    card.trueCore,
    card.falseJump,
    card.betterQuestion,
    card.systemLever,
    card.claim?.statement,
    card.claim?.implicitMessage,
    card.claim?.whyImportant,
    card.consequences?.resonanceRoom,
    card.consequences?.order1,
    card.consequences?.order2,
    card.consequences?.order3,
    card.whyItWorks,
  ].filter(Boolean).join(" "));
}

function inferWaveDepth(card) {
  const text = cardTextForMigration(card).toLowerCase();
  const emotions = [];
  if (/angst|bedroh|unsicher|kriminal|kontrollverlust|sorge|ueberforderung|überforderung/.test(text)) emotions.push("Angst und Überforderung");
  if (/wut|empoer|empör|abzock|betrug|verrat|ungerecht/.test(text)) emotions.push("Empörung und Kränkung");
  if (/freiheit|verbot|kontrolle|zensur/.test(text)) emotions.push("Autonomie- und Kontrollgefühl");
  if (/zugehoer|zugehör|identitaet|identität|wir gegen|die da oben/.test(text)) emotions.push("Zugehörigkeit und Identität");
  const depth = [];
  if (/grundgesetz|verfassung|art\. 20|art\. 146|rechtsstaat/.test(text)) depth.push("Verfassungsbildung und institutionelles Vertrauen");
  if (/wohn|miete|kommun|verwaltung|infrastruktur/.test(text)) depth.push("Infrastruktur und lokale Umsetzung");
  if (/preis|kosten|schulden|steuer|kapital|rendite/.test(text)) depth.push("Anreize, Preise und Finanzierung");
  if (/plattform|medien|algorithm|reichweite|aufmerksamkeit/.test(text)) depth.push("Plattform- und Aufmerksamkeitslogik");
  if (/vertrauen|institution|demokratie|staat|recht/.test(text)) depth.push("Institutionelles Vertrauen und demokratische Korrekturfähigkeit");
  if (/klima|energie|fossil|co₂|co2|planet|natur/.test(text)) depth.push("Fossile Pfade, Planet und langfristige Folgekosten");
  if (/migration|arbeit|pflege|bildung|sozial/.test(text)) depth.push("Teilhabe, Arbeit, Bildung und soziale Infrastruktur");
  const attentionWeight = /viral|domin|laut|aufmerksamkeit|mainstream|medien|comment|kommentar|talkshow/.test(text) ? "hoch" : "mittel";
  return {
    attention: `Die Aussage bündelt Aufmerksamkeit, weil sie einen komplexen Sachverhalt in eine sofort erkennbare Zuspitzung übersetzt. Aufmerksamkeitsgewicht: ${attentionWeight}.`,
    emotion: emotions.length ? emotions.join(", ") : "Unsicherheit, Vereinfachung und der Wunsch nach Orientierung.",
    interpretation: card.claim?.implicitMessage || card.falseJump || card.hook || "Die Deutung verkürzt den Wirkungsraum und legt eine schnelle Schlussfolgerung nahe.",
    resonance: card.consequences?.resonanceRoom || card.whyItWorks || "Resonanz entsteht dort, wo reale Erfahrungen, Wiederholung und ein einfacher Problemrahmen zusammenkommen.",
    shift: card.consequences?.order2 || card.consequences?.order3 || "Wenn der Frame dominiert, werden bestimmte politische Antworten plausibler und andere Wirkungsfragen leiser.",
    depth: {
      causes: depth.length ? depth : ["Ungelöste Systemfragen, unklare Zuständigkeiten und fehlende Rückkopplung"],
      question: card.betterQuestion || card.effectPath?.betterSystemQuestion || card.systemLever || "Welche Systemfrage liegt unter der sichtbaren Aussage?",
    },
  };
}

function waveDepthBlock(card) {
  const profile = inferWaveDepth(card);
  const waves = [
    ["Aufmerksamkeit", "Was wird sichtbar?", profile.attention],
    ["Emotion", "Was wird gefühlt?", profile.emotion],
    ["Deutung", "Was bedeutet es?", profile.interpretation],
    ["Resonanz", "Wer greift es auf?", profile.resonance],
    ["Verschiebung", "Was verändert sich?", profile.shift],
  ];
  return `<section class="section section-soft" id="wellenprofil" data-wave-depth-block><div><div class="section-header"><p class="hero-kicker">Fünf Wellen öffentlicher Wirkung</p><h2>Wie der Satz im öffentlichen Raum arbeiten kann.</h2><p>Das Wellenprofil ist eine strukturierende Einordnung. Es ersetzt keine Quellenprüfung und unterstellt keine Absicht.</p></div><div class="card-grid two">${waves.map(([kicker, title, text]) => `<article class="card"><p class="card-kicker">${esc(kicker)}</p><h3>${esc(title)}</h3>${paragraphize(text)}</article>`).join("")}</div></div></section>
    <section class="section" id="tiefe" data-depth-structure-block><div><div class="section-header"><p class="hero-kicker">Tiefe</p><h2>Warum konnte diese Aussage anschlussfähig werden?</h2><p>Die Tiefe fragt nach Erfahrungen, Anreizen, Infrastruktur, Plattformlogik und Systemhebeln unter der sichtbaren Debatte.</p></div><article class="card"><p><strong>Unterliegende Struktur:</strong> ${esc(profile.depth.causes.join(", "))}</p><p><strong>Bessere Systemfrage:</strong> ${esc(profile.depth.question)}</p></article></div></section>`;
}

function inferBoundaryProfile(card) {
  const text = cardTextForMigration(card).toLowerCase();
  const category = cleanText(`${card.category || ""} ${card.cluster || ""}`).toLowerCase();
  const title = cleanText(`${card.title || ""} ${card.slug || ""}`).toLowerCase();
  const isTech = /digitalisierung|ki|künstliche intelligenz|kuenstliche intelligenz|ai act|cyber|algorithm|daten|plattform|roboter|automatisierung/.test(`${category} ${title}`);
  const isMigrationSocial = /migration|arbeit|sozialstaat|gesundheit|pflege|rente|wohnen|familie|bildung/.test(category) && !isTech;
  const isNature = /landwirtschaft|ernährung|ernaehrung|biodivers|natur|wald|vogel|arten|ökosystem|oekosystem|boden|wasser|artenschutz/.test(`${category} ${title}`);
  const isClimate = /klima|energie|mobilität|mobilitaet|co₂|co2|emission|fossil|strom|wärme|waerme|batterie|wind|wasserstoff|e-fuel|verkehr|auto|energiewende|energiepreis/.test(`${category} ${title}`);
  const isLegalConstitution = /grundgesetz|verfassung|art\\. 20|art\\. 146|rechtsstaat/.test(`${category} ${title} ${text}`);
  const isDemocracy = /demokratie|öffentlichkeit|oeffentlichkeit|rechtsstaat|recht|zensur|medien|wissenschaft|partei|sdg|weltregierung|social credit|kontrolle|verfassung|grundgesetz/.test(`${category} ${title} ${text}`);
  const categoryIsFinance = /staat, geld|finanz|kapital|steuer/.test(category);
  const isFinance = categoryIsFinance || (!isMigrationSocial && !isDemocracy && /finanz|geld|kosten|steuer|schulden|preis|haushalt|kredit|zuschuss|bürgschaft|buergschaft|förder|foerder|kapital|rendite|steuergeld|auslandsprojekt|peru|entwicklungshilfe|entwicklungszusammenarbeit/.test(`${category} ${title} ${text}`));
  if (isFinance) {
    return {
      current: "Häufig wird Zahlung mit Wirkung verwechselt oder Kredit, Zuschuss, Bürgschaft, Investition und laufende Ausgabe vermischt.",
      better: "Sauber ist die Finanzierungsgrenze: Wer zahlt, wer erhält, ob Rückzahlung erfolgt, welche Gegenleistung entsteht, welche Risiken abgesichert werden und welche Wirkung ohne die Ausgabe verloren ginge.",
      check: "Bei Finanzierungsbehauptungen immer trennen: Zuschuss ist nicht Kredit, Kredit ist nicht Geschenk, Bürgschaft ist nicht Zahlung, Investition ist nicht Konsum.",
    };
  }
  if (isMigrationSocial) {
    return {
      current: "Häufig wird nur der Anfangsaufwand, ein einzelner Haushaltsblock oder ein sichtbarer Konflikt gesehen.",
      better: "Sauber ist die Lebenslauf- und Teilhabebilanz: Sprache, Bildung, Arbeit, Pflege, Steuern, Sozialbeiträge, Wohnen, lokale Infrastruktur, Familienleben und demokratische Zugehörigkeit.",
      check: "Bei Zahlen immer prüfen: Zeitraum, Altersstruktur, Arbeitsmarktzugang, Verfahrensdauer, kommunale Ausstattung, Gegenfinanzierung und Kosten des Nicht-Handelns.",
    };
  }
  if (isNature) {
    return {
      current: "Häufig wird Natur als Einzelkonflikt betrachtet: Fläche, Tierart, Projekt oder Schutzauflage.",
      better: "Sauber ist die ökologische Wirkungsgrenze: Ökosystemleistungen, Böden, Wasser, Artenvielfalt, Klimaresilienz, Landwirtschaft, Gesundheit, regionale Wirtschaft und Wiederherstellbarkeit gemeinsam prüfen.",
      check: "Bei Natur- und Biodiversitätsbehauptungen immer prüfen: lokale Eingriffe, langfristige Systemwirkung, Ersatzmaßnahmen, Alternativen, kumulative Schäden und die Kosten des Nicht-Schützens.",
    };
  }
  if (isTech) {
    return {
      current: "Häufig wird Technik als einzelnes Gerät, Tool oder Innovationsversprechen behandelt.",
      better: "Sauber ist die Technikfolgen-Grenze: Zweck, Daten, Macht, Haftung, Sicherheit, Würde, Arbeit, Abhängigkeit, Energiebedarf, Governance und Rückkopplung auf Entscheidungen.",
      check: "Bei Technikbehauptungen immer prüfen: Wer entscheidet, wer profitiert, wer trägt Risiken, welche Daten fließen, welche Alternativen bestehen und wie Fehler korrigiert werden.",
    };
  }
  if (isClimate) {
    return {
      current: "Häufig wird nur ein sichtbarer Ausschnitt betrachtet: direkte Emissionen, einzelne Anlagen, ein einzelnes Produkt oder ein enger Strommix-Vergleich.",
      better: "Sauber ist die Lebenszyklus- und Systemgrenze: Herstellung, Betrieb, Strommix, Förderbedingungen, Lieferkette, Scope 1/2/3, Importanteile, Ersatz fossiler Pfade und Unterlassungskosten.",
      check: "Bei Studien immer prüfen: Welche Annahmen gelten für Strommix, Nutzungsdauer, Produktionsenergie, Recycling, Import, technische Lernkurven und reale Alternative?",
    };
  }
  if (isLegalConstitution) {
    return {
      current: "Häufig wird eine Namens- und Ursprungsperspektive gesetzt: Titel, Entstehung 1949 und fehlende Volksabstimmung werden betrachtet, nicht die heutige Geltung.",
      better: "Sauber ist die Verfassungsfunktions-Grenze: Grundrechte, Staatsorganisation, Demokratieprinzip, Rechtsstaat, Vorrang vor einfachem Recht, Änderungsregeln, Bundesverfassungsgericht und gesamtdeutsche Geltung seit 1990.",
      check: "Bei Rechtsbehauptungen prüfen: aktueller Wortlaut, heutige Geltung, Rang, Bindungswirkung, institutionelle Durchsetzung, historische Entstehung und demokratische Ablösungsmöglichkeit.",
    };
  }
  if (isDemocracy) {
    return {
      current: "Häufig wird ein Einzelfall als Beleg für totale Steuerung, Zensur oder Systemversagen gesetzt.",
      better: "Sauber ist die demokratische Wirkungsgrenze: Recht, Zuständigkeit, Kontrolle, Beschwerdeweg, Transparenz, Machtkonzentration, Medienlogik und Korrekturfähigkeit getrennt prüfen.",
      check: "Bei Demokratiebehauptungen immer prüfen: Wer entscheidet tatsächlich, auf welcher Rechtsgrundlage, mit welcher Kontrolle und welcher Möglichkeit zum Widerspruch?",
    };
  }
  return {
    current: "Häufig wird ein sichtbarer Ausschnitt als ganze Wirklichkeit behandelt.",
    better: "Sauber ist die vollständige Wirkungsgrenze: Betroffene, Zeitpfad, Alternativen, Nebenwirkungen, Rückkopplungen, Zuständigkeiten und Unterlassungskosten.",
    check: "Bei jeder Studie und Zahl prüfen: Was wird gemessen, was nicht, welcher Zeitraum gilt und welche Alternative als Vergleich dient?",
  };
}

function notSaidItems(card) {
  const items = [
    card.falseJump && `Nicht gesagt wird: ${card.falseJump}`,
    card.systemLever && `Nicht ausreichend sichtbar ist der Systemhebel: ${card.systemLever}`,
    card.consequences?.correction && `Nicht mitgerechnet wird die Korrekturfrage: ${card.consequences.correction}`,
    card.betterQuestion && `Nicht gestellt wird die bessere Frage: ${card.betterQuestion}`,
  ].filter(Boolean);
  const profile = inferBoundaryProfile(card);
  items.push(`Nicht geprüft ist oft die volle Bilanzgrenze: ${profile.better}`);
  return [...new Set(items.map((item) => cleanText(item)).filter(Boolean))].slice(0, 5);
}

function factsSystemBlock(card) {
  const profile = inferBoundaryProfile(card);
  const isV2 = card.templateVersion === "2.0";
  const rescue = card.p0Rescue;
  const factCards = isV2
    ? [
        ["Prüfbarer Kern", card.facts || card.trueCore || "Der prüfbare Kern muss vom Frame getrennt werden.", "Der Punkt gehört in die Debatte.", "Er beweist nicht die verkürzte Gesamtdeutung."],
        ["Falscher Sprung", card.falseJump || card.claim?.implicitMessage || "Die Schlussfolgerung ist enger als die Wirklichkeit.", "Die Grenze der Aussage.", "Er ersetzt keinen Folgencheck."],
        ["Systemgrenzencheck", profile.check, "Welche Annahmen die Aussage tragen.", "Dass eine einzelne Zahl allein ausreicht."],
      ]
    : rescue?.facts?.length
      ? rescue.facts.slice(0, 6).map((fact) => [fact.title, fact.text, fact.proves, fact.notProves])
      : [
          ["Prüfbarer Kern", card.trueCore || "Ein wahrer Punkt kann vorhanden sein.", "Der Punkt gehört in die Rechnung.", "Er beweist nicht die verkürzte Gesamtdeutung."],
          ["Falscher Sprung", card.falseJump || "Die Schlussfolgerung ist zu eng.", "Die Grenze des Frames.", "Er ersetzt keine vollständige Wirkungsprüfung."],
          ["Systemgrenzencheck", profile.check, "Welche Annahmen und Grenzen zu prüfen sind.", "Dass der sichtbare Ausschnitt die ganze Wirklichkeit ist."],
        ];
  const glossary = isV2 && (card.glossary || []).length ? `<p class="card-text"><strong>Verknüpfte Begriffe:</strong> ${esc(card.glossary.join(", "))}</p>` : "";
  return `<section class="section section-soft v3-layer v3-layer-facts" id="fakten-systemgrenzencheck" data-v3-facts-layer>
    <span id="faktenlage" class="sr-only">Faktenlage</span>
    <div>
      <div class="section-header"><p class="hero-kicker">Faktenlage und Systemgrenzencheck</p><h2>Was ist prüfbar - und welche Grenze hat die Aussage?</h2><p>Die Karte trennt Fakten, Annahmen, Studiengrenzen und Wirkung. Eine richtige Einzelbeobachtung ist noch keine vollständige Wirkungsrechnung.</p></div>
      <div class="card-grid three">${factCards.map(([title, text, proves, notProves]) => `<article class="card v3-fact-card"><p class="v2-badge">Prüfpunkt</p><h3 class="card-title">${esc(title)}</h3>${paragraphize(text)}<p class="card-text"><strong>Belegt hier:</strong> ${esc(proves || "Dieser Punkt gehört in die Wirkungsrechnung.")}</p><p class="card-text"><strong>Belegt nicht:</strong> ${esc(notProves || "Er ersetzt keine vollständige Folgen- und Bilanzgrenzenprüfung.")}</p></article>`).join("")}</div>
      <article class="card"><p class="card-kicker">Mensch, Planet, Demokratie</p><p><strong>Mensch:</strong> Wer ist konkret betroffen, geschützt oder belastet?</p><p><strong>Planet:</strong> Welche Ressourcen-, Klima- oder Naturfolgen werden einbezogen oder ausgeblendet?</p><p><strong>Demokratie:</strong> Werden Zuständigkeit, Quellen, Korrekturwege und faire Abwägung gestärkt?</p>${glossary}</article>
    </div>
  </section>`;
}

function notSaidBlock(card) {
  const items = notSaidItems(card);
  return `<section class="section" id="was-wird-nicht-gesagt" data-not-said-block><div><div class="section-header"><p class="hero-kicker">Was wird nicht gesagt?</p><h2>Welche Lücke macht den Frame stark?</h2><p>Der entscheidende Punkt liegt oft nicht in dem, was gesagt wird, sondern in dem, was als selbstverständlich weggelassen wird.</p></div><article class="card"><ul class="content-list">${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></article></div></section>`;
}

function boundaryBlock(card) {
  const profile = inferBoundaryProfile(card);
  return `<section class="section section-soft" id="bilanzgrenze" data-boundary-block><div><div class="section-header"><p class="hero-kicker">Welche Bilanzgrenze wird gesetzt?</p><h2>Welche Rechnung wird geöffnet - und welche geschlossen?</h2></div><div class="card-grid three"><article class="card"><p class="card-kicker">Enge Grenze</p>${paragraphize(profile.current)}</article><article class="card"><p class="card-kicker">Bessere Grenze</p>${paragraphize(profile.better)}</article><article class="card"><p class="card-kicker">Studien- und Annahmencheck</p>${paragraphize(profile.check)}</article></div></div></section>`;
}

function sourcesOnlyBlock(card) {
  if (card.templateVersion === "2.0") {
    const sources = (card.sourceCards || []).map(normalizeDebateSource).map((source) => `<article class="card source-proof-card"><p class="card-kicker">${esc(source.type)} · ${esc(source.id)}</p><h3 class="card-title"><a class="text-link" href="${esc(source.url)}">${esc(source.title)}</a></h3><p class="card-text"><strong>Belegt hier:</strong> ${esc(source.description)}</p><p class="card-text"><strong>Grenze:</strong> ${esc(source.limitation)}</p><p class="card-text"><strong>Datenstand / Prüfung:</strong> ${esc(source.dataStatus || DATA_STAND)} · geprüft ${esc(source.lastChecked || DATA_STAND)}</p><p><a class="text-link" href="${esc(source.url)}">Quelle öffnen</a></p></article>`).join("");
    return `<section class="section section-soft" id="quellen"><div><div class="section-header"><p class="hero-kicker">Quellen &amp; Vertiefung</p><h2>Welche Quelle belegt welchen Fakt?</h2><p>Quellen stehen am Ende. Sie belegen einzelne Fakten, nicht automatisch die gesamte Schlussfolgerung.</p></div><div class="debate-source-stack">${sources || `<article class="card"><p>Diese Karte wird redaktionell mit weiteren Primärquellen verdichtet. Der Quellenblock ersetzt keine Faktenlage.</p></article>`}</div></div></section>`;
  }
  const rescue = card.p0Rescue;
  if (rescue?.sources?.length) {
    const sources = rescue.sources.map(([title, url, proof, type]) => `<a class="card text-link-card" href="${esc(url)}"><p class="card-kicker">${esc(type || "Quelle")}</p><h3 class="card-title">${esc(title)}</h3><p class="card-text"><strong>Was belegt sie?</strong> ${esc(proof)}</p><p class="text-link">Quelle öffnen</p></a>`).join("");
    return `<section class="section section-soft" id="quellen"><div><div class="section-header"><p class="hero-kicker">Quellen &amp; Vertiefung</p><h2>Welche Quelle belegt welchen Fakt?</h2><p>Quellen dienen der Nachvollziehbarkeit und werden nicht vor die Wirkungsprüfung gezogen.</p></div><div class="card-grid two">${sources}</div></div></section>`;
  }
  const hints = card.sourceHints ? list(card.sourceHints.split(/,\s*/)) : "";
  return `<section class="section section-soft" id="quellen"><div><div class="section-header"><p class="hero-kicker">Quellen &amp; Vertiefung</p><h2>Welche Quelle belegt welchen Fakt?</h2></div><article class="card"><p>Die verfügbare Quellenbasis wird hier als Prüfspur dokumentiert. Jede externe Tatsachenbehauptung braucht eine konkrete Belegfunktion.</p>${hints}</article></div></section>`;
}

function primaryWave(card) {
  const text = cardTextForMigration(card).toLowerCase();
  if (/medien|plattform|algorithm|viral|reichweite|aufmerksamkeit|agenda/.test(text)) return "Aufmerksamkeit";
  if (/angst|wut|empoer|empör|kränkung|kraenkung|kontrollverlust|bedroh/.test(text)) return "Emotion";
  if (/frame|narrativ|deutung|botschaft|bedeutet|schlussfolgerung/.test(text)) return "Deutung";
  if (/resonanz|milieu|gruppe|zugehoer|zugehör|identitaet|identität|wiederholung/.test(text)) return "Resonanz";
  return "Verschiebung";
}

function depthLabel(card) {
  const profile = inferWaveDepth(card);
  return profile.depth.causes[0] || "Systemfrage";
}

function rescueFactsAndSources(card) {
  if (card.templateVersion === "2.0") {
    const sources = (card.sourceCards || []).map(normalizeDebateSource).map((source) => `<article class="card source-proof-card"><p class="card-kicker">${esc(source.type)} · ${esc(source.id)}</p><h3 class="card-title"><a class="text-link" href="${esc(source.url)}">${esc(source.title)}</a></h3><p class="card-text"><strong>Belegt hier:</strong> ${esc(source.description)}</p><p class="card-text"><strong>Grenze:</strong> ${esc(source.limitation)}</p><p class="card-text"><strong>Datenstand / Prüfung:</strong> ${esc(source.dataStatus || DATA_STAND)} · geprüft ${esc(source.lastChecked || DATA_STAND)}</p><p><a class="text-link" href="${esc(source.url)}">Quelle öffnen</a></p></article>`).join("");
    const glossary = (card.glossary || []).length ? `<p class="card-text"><strong>Glossar:</strong> ${esc(card.glossary.join(", "))}</p>` : "";
    return `<section class="section" id="faktenlage"><div><div class="section-header"><p class="hero-kicker">Faktenlage</p><h2>Welche Fakten sind wichtig?</h2></div><article class="card">${paragraphize(card.facts)}${glossary}</article></div></section><section class="section section-soft" id="quellen"><div><div class="section-header"><p class="hero-kicker">Quellen &amp; Vertiefung</p><h2>Welche Quelle belegt welchen Fakt?</h2></div><div class="debate-source-stack">${sources}</div></div></section>`;
  }
  const rescue = card.p0Rescue;
  if (!rescue) {
    return `<section class="section section-soft" id="faktenlage"><div><div class="section-header"><p class="hero-kicker">Faktenlage</p><h2>Welche Fakten sind wichtig?</h2></div><article class="card"><p>Diese Karte nennt die verfügbare Quellenbasis und trennt Einordnung von Belegen. Eine Aussage gilt erst als geprüft, wenn die Belegfunktion klar benannt ist.</p><div id="quellen">${card.sourceHints ? list(card.sourceHints.split(/,\s*/)) : ""}</div></article></div></section>`;
  }
  const facts = (rescue.facts || []).map((fact) => `<article class="card v3-fact-card"><p class="v2-badge">Fakt · geprüft</p><h3 class="card-title">${esc(fact.title)}</h3><p class="card-text">${esc(fact.text)}</p><p class="card-text"><strong>Beweist:</strong> ${esc(fact.proves)}</p><p class="card-text"><strong>Beweist nicht:</strong> ${esc(fact.notProves)}</p><p class="card-text"><strong>Quellen:</strong> ${esc(fact.sources)}</p></article>`).join("");
  const boundaries = (rescue.boundaries || []).map(([title, text, why]) => `<article class="card"><p class="card-kicker">Bilanzgrenze</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(text)}</p><p class="card-text"><strong>Warum wichtig:</strong> ${esc(why)}</p></article>`).join("");
  const misuse = (rescue.misuse || []).map(([title, text]) => `<article class="card"><p class="card-kicker">Faktenmissbrauch vermeiden</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(text)}</p></article>`).join("");
  const sources = (rescue.sources || []).map(([title, url, proof, type]) => `<a class="card text-link-card" href="${esc(url)}"><p class="card-kicker">${esc(type)}</p><h3 class="card-title">${esc(title)}</h3><p class="card-text"><strong>Was belegt sie?</strong> ${esc(proof)}</p><p class="text-link">Quelle öffnen</p></a>`).join("");
  return `<section class="section section-soft v3-layer v3-layer-facts" id="faktenlage" data-v3-facts-layer><div><div class="section-header"><p class="hero-kicker">Faktenlage</p><h2>Was ist konkret prüfbar?</h2><p>Jeder Fakt sagt ausdrücklich, was er belegt - und was daraus nicht folgt.</p></div><div class="card-grid three">${facts}</div><div class="card-grid three">${boundaries}</div><div class="card-grid three">${misuse}</div><article class="card"><p class="card-kicker">Einordnung</p><h3 class="card-title">Belege, Grenzen und Datenstand.</h3><p class="card-text"><strong>Sicher:</strong> ${esc(rescue.secure)}</p><p class="card-text"><strong>Unsicher:</strong> ${esc(rescue.uncertain)}</p></article><div id="quellen" class="section-header"><p class="hero-kicker">Quellen &amp; Vertiefung</p><h2>Welche Quelle belegt welchen Fakt?</h2></div><div class="card-grid two">${sources}</div></div></section>`;
}

function renderCardPageV2(card, mode = "live") {
  const base = mode === "live" ? "../../../" : "../../../";
  const canonicalPath = `/wirkungsradar/live/${card.slug}/`;
  const pathSteps = (card.impactPathSteps || []).map((step) => `<li>${esc(cleanText(step))}</li>`).join("");
  const questions = (card.criticalQuestions || []).map((question) => `<li>${esc(question)}</li>`).join("");
  const guardLine = /migration|sozial|arbeit/i.test(`${card.category} ${card.title}`)
    ? `        <p class="radar-status-line"><span>Menschen sind keine Kostenstelle.</span><span>Geprüft wird der Frame, nicht Personen.</span></p>`
    : "";
  const main = `
    <section class="hero radar-page-hero theme-hero">
      <div class="radar-hero-copy">
        <nav class="breadcrumb" aria-label="Breadcrumb"><a href="${base}index.html">Start</a> / <a href="${base}oeffentlicher-wirkungsraum/">Öffentlicher Wirkungsraum</a> / <a href="${base}wirkungsradar/debattenkarten/">Debattenkarten</a> / ${esc(card.category)}</nav>
        <p class="hero-kicker">Debattenkarte · ${esc(card.category)}</p>
        <h1 class="hero-title">${esc(card.title)}</h1>
        <p class="hero-subtitle">${esc(card.shortJudgement)}</p>
        <p class="radar-status-line"><span>Datenstand: ${DATA_STAND}</span></p>
${guardLine}
      </div>
    </section>
    ${radarNav(base)}
    ${renderToc()}
    <span id="host-cockpit" class="sr-only">Debattenhilfe</span>
    <section class="section debate-claim-section" id="behauptung">
      <div>
        <article class="v2-cockpit-shell">
          <div class="v2-cockpit-head">
            <p class="hero-kicker">Einordnung des Frames</p>
            <h2>Was wird behauptet?</h2>
          </div>
          <article class="card"><p class="card-kicker">Behauptung</p>${paragraphize(card.claim.statement)}</article>
          <article class="card"><p class="card-kicker">Implizite Botschaft</p>${paragraphize(card.claim.implicitMessage)}</article>
          <article class="card"><p class="card-kicker">Warum das wichtig ist</p>${paragraphize(card.claim.whyImportant)}</article>
        </article>
      </div>
    </section>
    ${frameRecognitionBlock(card)}
    ${topReactionPanel(card)}
    ${answerAccordion(card)}
    <span id="relevanz" class="sr-only">Warum relevant?</span>
    <section class="section section-soft v3-layer v3-layer-consequences debate-consequence-main" id="folgencheck" data-v3-consequence-check>
      <div>
        <div class="section-header"><p class="hero-kicker">Folgencheck</p><h2>Was dieses Narrativ bewirken kann.</h2><p>Der Folgencheck beschreibt Wirkungspotenzial und Wirkungsrisiken, nicht automatisch eingetretene Schäden.</p></div>
        <article class="card"><p class="card-kicker">Ausgelöster Resonanzraum</p>${paragraphize(card.consequences.resonanceRoom)}</article>
        <article class="card"><p class="card-kicker">Wirkungsrisiko erster Ordnung</p>${paragraphize(card.consequences.order1)}</article>
        <article class="card"><p class="card-kicker">Wirkungsrisiko zweiter Ordnung</p>${paragraphize(card.consequences.order2)}</article>
        <article class="card"><p class="card-kicker">Wirkungsrisiko dritter Ordnung</p>${paragraphize(card.consequences.order3)}</article>
        <article class="card"><p class="card-kicker">Wirkungsökonomische Korrektur</p>${paragraphize(card.consequences.correction)}</article>
      </div>
    </section>
    ${factsSystemBlock(card)}
    ${notSaidBlock(card)}
    ${boundaryBlock(card)}
    ${waveDepthBlock(card)}
    <section class="section" id="wirkpfad"><span id="loesungspfad" class="sr-only">Lösungspfad</span><span id="host-antworten" class="sr-only">Antwortblock</span><div><div class="section-header"><p class="hero-kicker">Wirkpfad</p><h2>Wie aus dem Satz Wirkung entstehen kann.</h2></div><article class="card"><ol class="content-list">${pathSteps}</ol></article></div></section>
    <section class="section section-soft" id="kritische-fragen"><div><div class="section-header"><p class="hero-kicker">Kritische Fragen</p><h2>Was berechtigt gefragt werden darf.</h2></div><article class="card"><ul class="content-list">${questions}</ul></article></div></section>
    ${sourcesOnlyBlock(card)}
    <section class="section" id="warum-zieht-das"><div><details class="source-panel"><summary>Warum zieht dieses Narrativ?</summary>${paragraphize(card.whyItWorks)}</details></div></section>
    <section class="section" id="methodik"><div><details class="source-panel"><summary>Methodik</summary>${paragraphize(card.methodology)}</details></div></section>
    <section class="section section-soft" id="verwandte-inhalte"><div><article class="card"><p class="card-kicker">Verwandte Inhalte</p>${paragraphize(card.relatedContent)}</article></div></section>
    <section class="section" id="narrativ-einreichen" data-community-submission-block><div><article class="card"><p class="card-kicker">Fehlt ein Narrativ?</p><h2>Hast du eine Aussage gesehen, die geprüft werden sollte?</h2><p>Reiche sie über die Akademie-App ein. Dort kann die Redaktion Faktenkern, Frame, Folgencheck, Wirkpfad und Quellenstatus prüfen.</p><p><a class="btn btn-primary" href="${ACADEMY_NARRATIVE_URL}">Narrativ einreichen</a></p></article></div></section>
  `;
  return shell({
    title: card.title,
    description: card.shortJudgement || card.claim.whyImportant,
    canonical: `${PUBLIC_BASE}${canonicalPath}`,
    base,
    main,
  });
}

function renderCardPage(card, mode = "live") {
  if (card.templateVersion === "2.0") return renderCardPageV2(card, mode);
  const base = mode === "live" ? "../../../" : "../../../";
  const canonicalPath = `/wirkungsradar/live/${card.slug}/`;
  const main = `
    <section class="hero radar-page-hero theme-hero">
      <div class="radar-hero-copy">
        <nav class="breadcrumb" aria-label="Breadcrumb"><a href="${base}index.html">Start</a> / <a href="${base}oeffentlicher-wirkungsraum/">Öffentlicher Wirkungsraum</a> / <a href="${base}wirkungsradar/debattenkarten/">Debattenkarten</a> / ${esc(card.category)}</nav>
        <p class="hero-kicker">Debattenkarte · ${esc(card.category)}</p>
        <h1 class="hero-title">${esc(card.title)}</h1>
        <p class="hero-subtitle">${esc(card.shortJudgement)}</p>
        <p class="radar-status-line"><span>${esc(card.editorialStatus)}</span><span>Datenstand: ${DATA_STAND}</span></p>
      </div>
    </section>
    ${radarNav(base)}
    ${renderToc()}
    <span id="host-cockpit" class="sr-only">Debattenhilfe</span>
    <section class="section debate-claim-section" id="behauptung"><div><article class="v2-cockpit-shell"><div class="v2-cockpit-head"><p class="hero-kicker">Einordnung des Frames</p><h2>Was wird behauptet?</h2><p class="v2-claim-line">${esc(card.hook)}</p></div><div class="card-grid two"><article class="card"><p class="card-kicker">Kurzurteil</p><h3>${esc(card.shortJudgement)}</h3></article><article class="card"><p class="card-kicker">Bessere Frage</p><h3>${esc(card.betterQuestion)}</h3></article></div></article></div></section>
    ${frameRecognitionBlock(card)}
    ${topReactionPanel(card)}
    <span id="relevanz" class="sr-only">Warum relevant?</span>
    ${answerAccordion(card)}
    <section class="section section-soft" id="frameanalyse"><div><div class="section-header"><p class="hero-kicker">Frameanalyse</p><h2>Welche Geschichte wird erzählt?</h2></div><article class="card">${paragraphize(card.hook)}<p><strong>Systemischer Hebel:</strong> ${esc(card.systemLever)}</p></article></div></section>
    <section class="section section-soft v3-layer v3-layer-consequences debate-consequence-main" id="folgencheck" data-v3-consequence-check><div><div class="section-header"><p class="hero-kicker">Folgencheck</p><h2>Was dieses Narrativ bewirken kann.</h2><p>Wirkungspotenzial wird nicht automatisch als eingetretene Wirkung gelesen. Entscheidend ist der konkrete Wirkpfad.</p></div><div class="card-grid three v3-consequence-orders"><article class="card v3-order-card"><p class="v2-badge">Mögliche Folge 1. Ordnung</p><h3>Wahrnehmung</h3>${paragraphize(card.effectPath.order1)}<p><strong>Narrativ:</strong> ${esc(card.title)}</p><p><strong>Wirkmechanismus:</strong> ${esc(card.falseJump)}</p><p><strong>Wirkungspfad:</strong> Aufmerksamkeit verschiebt sich vom vollständigen Wirkungsraum auf den verkürzten Frame.</p><p><strong>Begründung:</strong> Dieser mögliche Wirkpfad wird aus dem Inhalt der Aussage hergeleitet. Er ist ohne entsprechende Daten kein Nachweis einer eingetretenen Wirkung.</p></article><article class="card v3-order-card"><p class="v2-badge">Mögliche Folge 2. Ordnung</p><h3>Entscheidung</h3>${paragraphize(card.effectPath.order2)}<p><strong>Narrativ:</strong> ${esc(card.title)}</p><p><strong>Wirkmechanismus:</strong> ${esc(card.hook)}</p><p><strong>Wirkungspfad:</strong> Der Frame macht bestimmte politische Antworten plausibler und andere unsichtbarer.</p><p><strong>Begründung:</strong> Der zweite Schritt beschreibt Anschlussentscheidungen und Nebenwirkungen.</p></article><article class="card v3-order-card"><p class="v2-badge">Mögliche Folge 3. Ordnung</p><h3>Systempfad</h3>${paragraphize(card.effectPath.order3)}<p><strong>Narrativ:</strong> ${esc(card.title)}</p><p><strong>Wirkmechanismus:</strong> Wiederholung stabilisiert die verkürzte Deutung.</p><p><strong>Wirkungspfad:</strong> Ein dauerhaft verkürzter Problemzuschnitt kann Diskurs, Investitionen, Regeln und Vertrauen beeinflussen. Ob und in welchem Umfang dies geschieht, ist empirisch zu prüfen.</p><p><strong>Begründung:</strong> Der Langfristpfad beschreibt eine mögliche Entwicklung. Eintritt, Stärke und Zurechnung müssen empirisch geprüft werden.</p></article></div></div></section>
    ${factsSystemBlock(card)}
    ${notSaidBlock(card)}
    ${boundaryBlock(card)}
    ${waveDepthBlock(card)}
    <section class="section" id="wirkpfad"><span id="loesungspfad" class="sr-only">Lösungspfad</span><span id="host-antworten" class="sr-only">Antwortblock</span><div><div class="section-header"><p class="hero-kicker">Wirkpfad</p><h2>Mensch, Planet und Demokratie.</h2></div><article class="card">${paragraphize(card.effectPath.mpd)}<p><strong>Wirkungsökonomische Einordnung:</strong> Die Karte prüft, ob die Aussage Wahrnehmung, Entscheidung und Rückkopplung so verändert, dass positive Netto-Wirkung für Mensch, Planet und Demokratie wahrscheinlicher oder unwahrscheinlicher wird.</p></article></div></section>
    <section class="section section-soft" id="kritische-fragen"><span id="einwaende" class="sr-only">Einwände</span><div><div class="section-header"><p class="hero-kicker">Einwände und Antwortlinien</p><h2>Was berechtigt kritisch gefragt werden darf.</h2></div><div class="card-grid two">${card.objections.length ? card.objections.map((item) => `<article class="card"><p class="card-kicker">Einwand</p><h3>${esc(item.objection)}</h3>${paragraphize(item.answer)}</article>`).join("") : `<article class="card"><p>Konkrete Einwände werden redaktionell weiter ergänzt. Die bessere Prüfspur steht im Faktenkern, Wirkpfad und in den Prüfhinweisen.</p></article>`}</div></div></section>
    <section class="section" id="loesung"><div><div class="section-header"><p class="hero-kicker">Besserer Frame</p><h2>Was macht den Zustand besser?</h2></div><article class="card"><p><strong>Bessere Frage:</strong> ${esc(card.betterQuestion)}</p><p><strong>Systemischer Hebel:</strong> ${esc(card.systemLever)}</p>${card.moderation["Konkreten Hebel anbieten"] ? `<p><strong>Konkreter Hebel:</strong> ${esc(card.moderation["Konkreten Hebel anbieten"])}</p>` : ""}${card.moderation["Zum Schluss nicht demütigen. Eine gute Antwort lässt dem Gegenüber eine Brücke zurück in eine sachliche Position."] ? "" : "<p>Zum Schluss nicht demütigen. Eine gute Antwort lässt dem Gegenüber eine Brücke zurück in eine sachliche Position.</p>"}</article></div></section>
    ${sourcesOnlyBlock(card)}
    <section class="section" id="narrativ-einreichen" data-community-submission-block><div><article class="card"><p class="card-kicker">Fehlt ein Narrativ?</p><h2>Hast du eine Aussage gesehen, die geprüft werden sollte?</h2><p>Reiche sie über die Akademie-App ein. Dort kann die Redaktion die Aussage prüfen, clustern und in den Debatten-Kompass übernehmen.</p><p><a class="btn btn-primary" href="${ACADEMY_NARRATIVE_URL}">Narrativ einreichen</a></p></article></div></section>
  `;
  return shell({
    title: card.title,
    description: card.shortJudgement || card.trueCore,
    canonical: `${PUBLIC_BASE}${canonicalPath}`,
    base,
    main,
  });
}

function renderIndex(cards, mode = "live") {
  const base = mode === "live" ? "../../" : "../../";
  const clusters = [...new Set(cards.map((card) => card.category))].sort((a, b) => a.localeCompare(b, "de"));
  const cardHtml = cards.map((card) => {
    const reaction = normalizeReaction(card);
    const wave = primaryWave(card);
    const depth = depthLabel(card);
    return `<article class="card radar-sprint-card" data-radar-card data-topic="${attr([card.category, wave, depth, reaction.frameLabel].join(" "))}" data-search="${attr([card.title, reaction.frameLabel, reaction.instantLine, reaction.bridgeQuestion, reaction.frameShift.from, reaction.frameShift.to, card.shortJudgement, card.trueCore, card.falseJump, card.betterQuestion, card.systemLever, card.category, wave, depth].join(" "))}"><div class="radar-card-badges"><span>${esc(card.category)}</span><span>${esc(wave)}</span><span>${esc(card.editorialStatus)}</span></div><h3 class="card-title">${esc(card.title)}</h3><p class="card-text"><strong>Richtige Reaktion:</strong> ${esc(reaction.instantLine)}</p><p class="card-text"><strong>Framewechsel:</strong> Nicht: ${esc(reaction.frameShift.from)} → Sondern: ${esc(reaction.frameShift.to)}</p><p class="card-text"><strong>Bessere Frage:</strong> ${esc(reaction.bridgeQuestion)}</p><div class="radar-card-actions"><a class="btn btn-primary" href="${mode === "live" ? "" : "../live/"}${card.slug}/">Reaktion öffnen</a><button class="copy-chip" type="button" data-copy-text='${attr(reaction.copyShort)}'>Kurzantwort kopieren</button></div></article>`;
  }).join("");
  const waveFilters = ["Aufmerksamkeit", "Emotion", "Deutung", "Resonanz", "Verschiebung"];
  const main = `<section class="hero radar-page-hero radar-sprint-hero"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="${base}index.html">Start</a> / <a href="${base}oeffentlicher-wirkungsraum/">Öffentlicher Wirkungsraum</a> / <a href="${base}wirkungsradar/">Debatten-Kompass</a></nav><p class="hero-kicker">Debattenkarten</p><h1 class="hero-title">Welche Aussage willst du beantworten?</h1><p class="hero-subtitle">${cards.length} Debattenkarten: zuerst richtige Reaktion, dann Frame-Einordnung, Folgencheck, Wellenprofil, Tiefe und Quellen.</p></div></section>${radarNav(base)}<section class="section radar-live-controls radar-answer-first" data-radar-live-filter><div><label class="radar-search-field"><span>Direkt zur passenden Antwort</span><input type="search" placeholder="z. B. Migration kostet nur, Gender-Ideologie, CO₂ ist nur ein Spurengas..." data-live-query autofocus></label><div class="filter-chip-row" aria-label="Themen- und Wellenfilter"><button type="button" data-live-filter="all" aria-pressed="true">Alle Themen</button>${clusters.map((cluster) => `<button type="button" data-live-filter="${attr(cluster)}">${esc(cluster)}</button>`).join("")}${waveFilters.map((wave) => `<button type="button" data-live-filter="${attr(wave)}">${esc(wave)}</button>`).join("")}</div><p class="radar-search-status" data-live-count>${cards.length} Karten gefunden</p></div></section><section class="section" id="debattenkarten"><div><div class="section-header"><p class="hero-kicker">Antworten</p><h2>Erst reagieren. Dann verstehen.</h2><p>Jede Karte beginnt mit Framewechsel, Sprechsatz und besserer Frage. Die Originalbehauptung bleibt dokumentiert, steht aber nicht als erster Handlungsanker im Vordergrund.</p></div><div class="card-grid two" data-live-grid>${cardHtml}</div></div></section>`;
  return shell({
    title: "Debattenkarten",
    description: `${cards.length} Debattenkarten: Behauptung verstehen, Sofortantwort finden, Folgencheck und Wirkpfad vertiefen.`,
    canonical: `${PUBLIC_BASE}/wirkungsradar/${mode}/`,
    base,
    main,
    searchType: "Debattenkarten-Index",
  });
}

function renderReport(cards, routeStateBeforeWrite) {
  const existingLive = cards.filter((card) => routeStateBeforeWrite.get(card.slug));
  const newCards = cards.filter((card) => !routeStateBeforeWrite.get(card.slug));
  const byCluster = Object.entries(cards.reduce((acc, card) => {
    acc[card.category] = (acc[card.category] || 0) + 1;
    return acc;
  }, {})).sort((a, b) => a[0].localeCompare(b[0], "de"));
  const reviewNeeded = cards.filter((card) => normalizeReaction(card).reviewNeeded);
  return `# Debattenkarten-Integration\n\nStand: ${DATA_STAND}\n\n## Ergebnis\n\n- Karten im Textmaster: ${cards.length}\n- Bestehende Live-Routen überschrieben/aktualisiert: ${existingLive.length}\n- Neue Live-Routen angelegt: ${newCards.length}\n- Reaction-Felder sichtbar gerendert: ${cards.length}\n- Reaction-Felder redaktionell automatisch abgeleitet / reviewNeeded: ${reviewNeeded.length}\n- Interne Quelle: \`${path.basename(MASTER_DOCX)}\`\n\n## Cluster\n\n${byCluster.map(([cluster, count]) => `- ${cluster}: ${count}`).join("\n")}\n\n## Neue Routen\n\n${newCards.map((card) => `- /wirkungsradar/live/${card.slug}/ - ${card.title}`).join("\n") || "- Keine"}\n\n## ReviewNeeded\n\n${reviewNeeded.map((card) => `- /wirkungsradar/live/${card.slug}/ - ${card.title}`).join("\n") || "- Keine"}\n\n## Hinweise\n\n- Öffentliche Seiten zeigen keine internen Arbeitslabels.\n- Quellen werden mit Belegfunktion dargestellt, nicht als bloße Linkliste.\n- Bestehende Routen bleiben erhalten und werden in den aktuellen Debatten-Kompass-Aufbau überführt.\n- Die primäre Kommunikationslogik lautet jetzt: richtig reagieren, Frame verschieben, dann analysieren.\n`;
}

function renderReactionMigrationReport(cards) {
  const rows = cards.map((card) => {
    const reaction = normalizeReaction(card);
    return {
      slug: card.slug,
      title: card.title,
      frameLabel: reaction.frameLabel,
      principle: reaction.principle,
      instantLine: reaction.instantLine,
      bridgeQuestion: reaction.bridgeQuestion,
      reviewNeeded: Boolean(reaction.reviewNeeded),
    };
  });
  return {
    stand: DATA_STAND,
    total: rows.length,
    reviewNeeded: rows.filter((row) => row.reviewNeeded).length,
    rows,
  };
}

function isTracked(filePath) {
  try {
    execFileSync("git", ["ls-files", "--error-unmatch", filePath], { cwd: ROOT, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function walkHtml(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkHtml(full);
    return entry.isFile() && entry.name.endsWith(".html") ? [full] : [];
  });
}

function normalizeLegacyPublicLabels() {
  let changed = 0;
  for (const file of walkHtml(path.join(ROOT, "wirkungsradar"))) {
    const before = fs.readFileSync(file, "utf8");
    const after = before
      .replace(/Host-Cockpit/g, "Debattenhilfe")
      .replace(/Wirkungsradar-Live/g, "Debatten-Kompass")
      .replace(/Live-Karten/g, "Antwortkarten")
      .replace(/v3 Antwortformat/g, "Antwortformat")
      .replace(/aus Masterquelle integriert(?: · P0 gerettet)?/g, "redaktionell geprüft")
      .replace(/redaktionelle Ergänzung aus Masterquelle/g, "redaktionell geprüft")
      .replace(/Masterquelle: [^<]+/g, `Datenstand: ${DATA_STAND}`)
      .replace(/Gute Rückfrage/g, "Kritische Frage")
      .replace(/Gute Rueckfrage/g, "Kritische Frage");
    if (after !== before) {
      fs.writeFileSync(file, after);
      changed += 1;
    }
  }
  return changed;
}

const master = readMasterData();
if (!Array.isArray(master.cards) || master.cards.length < 80) {
  throw new Error(`Masterquelle unvollständig: ${master.cards?.length ?? 0} Karten gefunden.`);
}
for (const card of master.cards) {
  const target = redirectAliasBySlug.get(card.slug);
  if (target && target !== card.slug) card.redirectTarget = target;
}
for (const [slug, target] of redirectAliasBySlug.entries()) {
  if (master.cards.some((card) => card.slug === slug)) continue;
  master.cards.push({
    number: 0,
    title: redirectAliasTitleBySlug.get(slug) || slug,
    originalTitle: redirectAliasTitleBySlug.get(slug) || slug,
    slug,
    redirectTarget: target,
    cluster: "Alias",
    category: "Alias",
    editorialStatus: "Alias-Weiterleitung",
    shortJudgement: `Weiterleitung zur kanonischen Debattenkarte ${target}.`,
    answers: { seconds10: "", seconds30: "", seconds120: "" },
  });
}
for (const card of master.cards) normalizeReaction(card);
fs.mkdirSync(path.dirname(MASTER_JSON), { recursive: true });
fs.writeFileSync(MASTER_JSON, `${JSON.stringify(master, null, 2)}\n`);

const routeStateBeforeWrite = new Map(master.cards.map((card) => [
  card.slug,
  isTracked(`wirkungsradar/live/${card.slug}/index.html`),
]));

for (const card of master.cards) {
  if (card.redirectTarget) {
    const liveTarget = `../${card.redirectTarget}/`;
    const detailTarget = `../${card.redirectTarget}/`;
    write(`wirkungsradar/live/${card.slug}/index.html`, redirectShell({
      title: card.title,
      description: `Weiterleitung zur kanonischen Debattenkarte ${card.redirectTarget}.`,
      canonical: `${PUBLIC_BASE}/wirkungsradar/live/${card.redirectTarget}/`,
      target: liveTarget,
      base: "../../../",
    }));
    write(`wirkungsradar/detail/${card.slug}/index.html`, redirectShell({
      title: card.title,
      description: `Weiterleitung zur kanonischen Debattenkarte ${card.redirectTarget}.`,
      canonical: `${PUBLIC_BASE}/wirkungsradar/live/${card.redirectTarget}/`,
      target: detailTarget,
      base: "../../../",
    }));
    continue;
  }
  write(`wirkungsradar/live/${card.slug}/index.html`, renderCardPage(card, "live"));
  write(`wirkungsradar/detail/${card.slug}/index.html`, renderCardPage(card, "detail").replace("</head>", '<meta name="robots" content="noindex, follow">\n</head>'));
}

const canonicalCards = master.cards.filter((card) => !card.redirectTarget);
write("wirkungsradar/live/index.html", renderIndex(canonicalCards, "live"));
write("wirkungsradar/debattenkarten/index.html", renderIndex(canonicalCards, "debattenkarten"));
write("reports/debattenkarten-masterintegration.md", renderReport(canonicalCards, routeStateBeforeWrite));
write("reports/debattenkarten-reaction-migration.json", JSON.stringify(renderReactionMigrationReport(canonicalCards), null, 2));

const normalizedLegacyFiles = normalizeLegacyPublicLabels();

console.log(`Debattenkarten-Masterintegration OK: ${canonicalCards.length} kanonische Karten gerendert, ${master.cards.length - canonicalCards.length} Alias-Weiterleitungen, ${normalizedLegacyFiles} Radar-Dateien normalisiert.`);
