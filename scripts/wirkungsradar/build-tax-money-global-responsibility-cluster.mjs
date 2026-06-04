import fs from "node:fs";
import path from "node:path";

const UPDATED_AT = "2026-06-04";
const ASSET_VERSION = "20260604-ukraine-support-v1";
const clusterSlug = "steuergeld-globale-verantwortung-fairness";
const clusterTitle = "Steuergeld, globale Verantwortung & Fairness";
const clusterSubtitle = "Warum „unser Geld geht weg“ oft die falsche Bilanzgrenze setzt.";
const clusterAbstract =
  "Viele politische Narrative funktionieren über denselben Impuls: Steuergeld wird als knappe Ressource gezeigt, die angeblich „für andere“ ausgegeben wird, während „wir hier“ Probleme haben. Diese Sorge ist nicht falsch: Öffentliche Mittel sind begrenzt und müssen wirksam, transparent und kontrolliert eingesetzt werden. Irreführend wird das Narrativ, wenn es falsche Gegensätze baut: Inland gegen Ausland, Bauern gegen Radwege, Rentner gegen Ukraine, Arme gegen Migrant:innen, Steuerzahler gegen Entwicklungszusammenarbeit, Mittelstand gegen Reiche. Wirkungsökonomisch lautet die bessere Frage: Welche Ausgabe erzeugt welche Netto-Wirkung, welche Risiken vermeidet sie, welche Folgekosten senkt sie und welche Zustände verbessert sie für Mensch, Planet und Demokratie?";

const sources = [
  ["BMZ - Nachhaltige Mobilität in Lima", "bmz_lima_mobilitaet", "https://www.bmz.de/de/laender/peru/nachhaltige-mobilitaet-in-lima", ["Zuschüsse für Radwege und nachhaltige Mobilität", "Projektziele, Umfang und Einbettung in ein Verkehrssystem", "Radwege als Zubringer zu Bus und Metro", "Nutzen für Mobilität, Gesundheit, Klima und Teilhabe"], "BMZ ist Ministeriumsquelle; Umsetzung, Nutzung und Kontrolle zusätzlich mit KfW-Daten, Transparenzportal und unabhängiger Einordnung prüfen."],
  ["KfW - Entwicklungszusammenarbeit", "kfw_entwicklungszusammenarbeit", "https://www.kfw.de/Internationale-Finanzierung/Entwicklungszusammenarbeit/", ["KfW-Finanzierungslogik", "nachhaltiges Mobilitätskonzept für Lima", "Fahrradwege und Metro als gemeinsames Verkehrssystem", "CO₂-Wirkung globaler Mobilitätsprojekte", "Peru als politischer und wirtschaftlicher Partner Deutschlands", "aktuell mehrere deutsche Firmen mit rund 33 Mio. Euro Auftragswert beteiligt"], "KfW ist Umsetzungs- und Finanzierungsakteur; Rückzahlung, Projektfortschritt und Evaluierung müssen je Vorhaben getrennt geprüft werden."],
  ["KfW Projektdatenbank - NAMA nachhaltiger Stadtverkehr", "kfw_nama_stadtverkehr_peru", "https://www.kfw-entwicklungsbank.de/ipfz/Projektdatenbank/Sektorprogramm-Nama-Fuer-Nachhaltigen-Stadtverkehr-44908.htm", ["Transportsektor als großer Emissionsbereich in Peru", "ÖPNV, Busflotten, Lima, Sekundärstädte und nicht-motorisierter Verkehr", "Finanzierungsinstrument Entwicklungskredit", "Umwelt- und Sozialprüfung, Risiken und begrenzte Kontrollmöglichkeiten"], "Diese Quelle zeigt: Das Thema ist größer als Radwege. Sie ersetzt keine Nutzungsdaten einzelner Radwegabschnitte."],
  ["Tagesschau Faktenfinder - Radwege Peru 2025", "tagesschau_radwege_peru_2025", "https://www.tagesschau.de/faktenfinder/entwicklungshilfe-radwege-peru-100.html", ["Einordnung falscher oder irreführender Summen", "Unterscheidung Radwege, Bus, Metro und Mobilitätsprogramme", "20 Mio. Euro Zuschuss 2020, weitere 24 Mio. Euro Zusage 2022, bisherige Auszahlungen", "Einordnung der verbreiteten 315-Mio.-Behauptung"], "Redaktionelle Einordnung; Primärquellen BMZ, KfW und Transparenzportale bleiben maßgeblich."],
  ["Tagesschau Faktenfinder - Finanzierung 2024", "tagesschau_radwege_peru_2024", "https://www.tagesschau.de/faktenfinder/radwege-peru-entwicklungshilfe-100.html", ["Zuschuss versus Kredit", "Kreditlaufzeiten und Rückzahlung", "Förderkredit, Entwicklungskredit und Zuschuss als unterschiedliche Formen", "Finanzierungskontext und ODA-Einordnung"], "Redaktionelle Einordnung; Zahlenstände mit neueren BMZ-/KfW-Angaben abgleichen."],
  ["KfW Projektdatenbank - Fahrradwegnetz Lima", "kfw_projektdatenbank_radweg_lima", "https://www.kfw-entwicklungsbank.de/ipfz/Projektdatenbank/Aufbau-Eines-Fahrradwegnetzes-Im-Metropolbereich-Lima-35874.htm", ["Projektbeschreibung", "Anbindung an Schnellbus- und Metrolinien", "Teilhabe ärmerer Bevölkerung", "Umwelt- und Sozialverträglichkeit", "deutscher Finanzierungsbeitrag 20 Mio. EUR", "Projektpartner Municipalidad Metropolitana de Lima"], "Projektstatus aktiv; Baufortschritt und Nutzung regelmäßig aktualisieren."],
  ["KfW Entwicklungsbank - Transparenzportal", "kfw_transparenzportal", "https://www.kfw-entwicklungsbank.de/Internationale-Finanzierung/KfW-Entwicklungsbank/Transparenz/", ["Projekttransparenz", "Daten zu Finanzierungen", "Kontrolle und Evaluierung"], "Konkrete Projektdaten auffindbar halten."],
  ["BMZ - Transparenzportal", "bmz_transparenzportal", "https://www.bmz.de/de/ministerium/zahlen-fakten/bmz-transparenzportal", ["Transparenz öffentlicher Entwicklungszusammenarbeit", "Projekt- und Finanzdaten"], "Bei jeder Aktualisierung Datenstand prüfen."],
  ["KfW - Evaluierungen", "kfw_evaluierung", "https://www.kfw-entwicklungsbank.de/Evaluierung/", ["Wirkungsprüfung", "Lernen aus Projekten", "Qualitätssicherung"], "Falls keine projektspezifische Evaluierung vorliegt, klar sagen: noch nicht abschließend evaluiert."],
  ["Bundesregierung - So unterstützt Deutschland die Ukraine", "bundesregierung_ukraine_hilfe", "https://www.bundesregierung.de/breg-de/aktuelles/deutschland-hilft-der-ukraine-2160274", ["offizielle Deutschland-Übersicht", "militärische, zivile und humanitäre Unterstützung", "Energieinfrastruktur", "Zahlen und Aktualisierungen"], "Bilanzgrenzen und Aktualisierung prüfen; nicht jede Zusage ist bereits Auszahlung."],
  ["Auswärtiges Amt - Solidarität mit der Ukraine", "auswaertiges_amt_ukraine_solidaritaet", "https://www.auswaertiges-amt.de/de/service/laender/ukraine-node/ukraine-solidaritaet-2513956", ["Stand 24.02.2026", "rund 41 Mrd. Euro zivile Unterstützung", "rund 55,5 Mrd. Euro militärische Unterstützung", "geleistet beziehungsweise für kommende Jahre bereitgestellt"], "AA-Zahlen sind politische Gesamtübersicht; Zusagen, Bereitstellungen und Auszahlungen sauber trennen."],
  ["Bundesregierung - Detailübersicht Ukraine-Unterstützung 2026", "bundesregierung_ukraine_detail_pdf_2026", "https://www.bundesregierung.de/resource/blob/975228/2423058/b49e873efda519b0e6be3a12d1e306ee/2026-04-24-ukraine-unterstuetzung-data.pdf?download=1", ["Detailübersicht Stand 31.03.2026", "Bilanzgrenzen", "reguläre Beiträge teils nicht enthalten", "Länder, Kommunen und private Hilfe teils nicht enthalten", "Garantien und Bürgschaften in zivilen Summen"], "PDF-Stand beachten; bei Aktualisierung immer neue PDF-Version prüfen."],
  ["BMVg - Vier Jahre Ukraine-Unterstützung", "bmvg_vier_jahre_ukraine_unterstuetzung", "https://www.bmvg.de/de/aktuelles/vier-jahre-ukraine-unterstuetzung-6071848", ["militärische Unterstützungslogik", "Ausrüstung, Ausbildung und Fähigkeitsaufbau", "Sicherheits- und Verteidigungsfähigkeit"], "Ministeriumsquelle; mit Haushalts- und Lieferdaten abgleichen."],
  ["BMF Wissenschaftlicher Beirat - Ukraine-Hilfe", "bmf_beirat_ukraine", "https://www.bundesfinanzministerium.de/Content/DE/Downloads/Ministerium/Wissenschaftlicher-Beirat/Gutachten/ukraine-hilfe-der-bundesregierung.pdf", "Finanzpolitische Einordnung, jährliche Kosten, BIP-Anteil, Kosten von Nicht-Unterstützung.", "Gutachtenstand und Annahmen mit neueren Daten abgleichen."],
  ["Kiel Institute - Ukraine Support Tracker", "kiel_ukraine_tracker", "https://www.kielinstitut.de/topics/war-against-ukraine/ukraine-support-tracker/", ["internationaler Vergleich", "militärische, finanzielle und humanitäre Hilfe", "staatliche Zusagen und Leistungen", "faktenbasierte Debatte"], "Methodik und Datenstand beachten; nationale Haushaltslogiken sind nicht vollständig identisch."],
  ["Kiel Institute - Ukraine Support Tracker Data", "kiel_ukraine_tracker_data", "https://www.kielinstitut.de/publications/ukraine-support-tracker-data-6453/", ["Datensatz zum Ukraine Support Tracker", "Vergleichbarkeit", "Update-Methodik"], "Datensatz regelmäßig aktualisieren und Methodikhinweise übernehmen."],
  ["EU-Kommission - Ukraine Facility", "eu_ukraine_facility", "https://enlargement.ec.europa.eu/funding-technical-assistance/ukraine-facility_en", ["bis zu 50 Mrd. Euro 2024-2027", "Resilienz", "Wiederaufbau", "Modernisierung", "Reformen", "laufende Finanzierungsbedarfe"], "EU-Instrument; Zuschüsse, Darlehen, Bedingungen und Zahlungen trennen."],
  ["EU-Kommission - EU assistance to Ukraine", "eu_commission_ukraine_facility_general", "https://commission.europa.eu/topics/eu-solidarity-ukraine/eu-assistance-ukraine/ukraine-facility_en", ["Ukraine Facility", "EU-Solidarität", "Finanzierungslogik und Reformauflagen"], "Mit Facility-Seite und Ratsbeschlüssen abgleichen."],
  ["Rat der EU - Ukraine Facility", "consilium_ukraine_facility", "https://www.consilium.europa.eu/en/policies/ukraine-facility/", ["50 Mrd. Euro 2024-2027", "33 Mrd. Euro Darlehen", "17 Mrd. Euro Zuschüsse", "Audit- und Kontrollrahmen"], "Ratseite kann technische Zugriffssperren für Skripte haben; Browser-/Suchprüfung nutzen."],
  ["UNHCR - Ukraine Refugee Situation", "unhcr_ukraine_situation", "https://data.unhcr.org/en/situations/ukraine", ["Flucht- und Schutzlage", "regionale Daten", "Humanitäre Lage"], "Fluchtdaten ändern sich; immer Datenstand sichtbar machen."],
  ["World Bank - Ukraine RDNA5", "world_bank_ukraine_rdna5", "https://www.worldbank.org/en/news/press-release/2026/02/23/updated-ukraine-recovery-and-reconstruction-needs-assessment-released", ["RDNA5 Stand 23.02.2026", "Wiederaufbau- und Erholungsbedarf", "direkte Schäden", "Folgekosten und Infrastrukturbedarf"], "Aktuellere RDNA5 ersetzt veraltete RDNA4-Linkziele; Zahlen kontextualisieren."],
  ["Bundesbank - Vermögen privater Haushalte", "bundesbank_phf", "https://www.bundesbank.de/de/bundesbank/forschung/studie-zur-wirtschaftlichen-lage-privater-haushalte-phf/ergebnisse-604886", "Vermögensverteilung, Nettovermögen und Ungleichheitsdaten Deutschland.", "Vermögen ist Verteilungsindikator, kein Personenurteil."],
  ["World Inequality Database", "wid", "https://wid.world/", "Internationale Einkommens- und Vermögensungleichheit.", "Länder- und Methodikunterschiede beachten."],
  ["Oxfam - globale Ungleichheit", "oxfam_inequality", "https://www.oxfam.org/", "Globale Vermögenskonzentration, politische Macht durch Vermögen, Klimagerechtigkeit.", "Advocacy-Quelle; Methodik transparent einordnen."],
];

const dossiers = [
  {
    slug: "radwege-in-peru",
    title: "Radwege in Peru - verschenktes Geld oder verkürzte Empörung?",
    subtitle: "Warum Zuschüsse, Kredite, Entwicklungszusammenarbeit und globale Wirkung häufig vermischt werden.",
    judgement: "Verkürzte Empörung statt Finanzierungs- und Wirkungsprüfung.",
    status: "checked_v2_positive_examples",
    claim: "Für Radwege in Peru ist Geld da, aber für Deutschland nicht.",
    claimVariants: [
      "Unser Steuergeld geht nach Peru.",
      "Radwege in Peru statt Schulen in Deutschland.",
      "Für Peru ist Geld da, für uns nicht.",
      "Entwicklungshilfe ist Geldverschwendung.",
      "Wir finanzieren Luxusprojekte im Ausland.",
      "Erst Deutschland, dann die Welt.",
      "Warum zahlen wir Radwege in Lima?",
    ],
    abstract:
      "Diese Seite zeigt, welche Finanzierungsformen tatsächlich vorliegen, welche Wirkungen beabsichtigt sind und welche Fragen berechtigt kritisch gestellt werden dürfen. Der Kernfehler des Narrativs ist nicht die Kritik an Ausgaben, sondern die Vermischung von Zuschüssen, Krediten, ÖPNV, Metro, Radwegen, deutscher Interessenlage und globaler Klimawirkung.",
    points: [
      ["Nicht alles sind Radwege", "Die öffentliche Debatte vermischt Radwege, Busse, ÖPNV-Reformen, Metro-Ausbau und weitere Mobilitätsprogramme. Die Zahl allein erklärt nicht, welcher Teil tatsächlich in Radwege fließt."],
      ["Ein Teil sind Zuschüsse", "BMZ und Faktenfinder nennen für Radwege in Lima einen Zuschuss von 20 Mio. Euro aus 2020 sowie eine weitere Zusage von 24 Mio. Euro aus 2022. Zuschüsse werden nicht zurückgezahlt und brauchen deshalb besonders klare Wirkungsprüfung."],
      ["Ein großer Teil sind rückzahlbare Kredite", "KfW-Finanzierungen sind nicht automatisch Geldgeschenke. Das BMZ nennt für nachhaltige Mobilität Entwicklungskredite von rund 155 Mio. Euro; Entwicklungskredite und Förderkredite müssen von den Kreditnehmern bedient werden. Förderkredite werden überwiegend über den Kapitalmarkt refinanziert."],
      ["Metro und ÖPNV bilden den Hauptteil", "Der größere Mobilitätsrahmen in Lima umfasst Metro, Bus, ÖPNV-Organisation und nicht-motorisierten Verkehr. Radwege sind ein Zubringer im System, nicht das ganze Programm."],
      ["Deutschland hat eigene Interessen", "KfW beschreibt Peru als politischen und wirtschaftlichen Partner. An laufenden KfW-Vorhaben sind aktuell mehrere deutsche Firmen mit rund 33 Mio. Euro Auftragswert beteiligt; weitere Aufträge können folgen. Klimaschutz wirkt zudem global."],
      ["Kontrolle bleibt wichtig", "Nutzung, Baufortschritt, Vergabe, Korruptionsschutz, Umwelt- und Sozialprüfung sowie tatsächliche Wirkung müssen sichtbar bleiben. Gute Kritik fragt nach Daten, nicht nach Spottwert."],
    ],
    answers: {
      ten: "Die Behauptung ist verkürzt. Ein Teil sind Zuschüsse, vieles läuft über Kredite. Entscheidend sind Wirkung, Rückzahlung, Kontrolle und Nutzen für Menschen dort und auch für Deutschland.",
      thirty:
        "Die Rechnung ist verkürzt. Ein Teil sind Zuschüsse, etwa für Radwege. Ein großer Teil nachhaltiger Mobilitätsfinanzierung läuft aber über KfW-Kredite, die zurückgezahlt werden müssen. Außerdem geht es nicht nur um Radwege, sondern um Metro, Bus, ÖPNV und sichere Wege zur Arbeit, Schule und Haltestelle. Kritik ist berechtigt, wenn Nutzung, Vergabe, Baufortschritt oder Wirkung unklar sind. Aber seriös wird sie erst, wenn Zuschuss, Kredit, Rückzahlung, Kontrolle und deutscher Nutzen getrennt geprüft werden.",
      two:
        "Das Radwege-in-Peru-Narrativ wirkt, weil es aus einem komplexen Finanzierungs- und Mobilitätsprogramm ein einziges Spottbild macht: dort Radwege, hier Probleme. Der wahre Kern ist: Öffentliche Mittel müssen begründet, kontrolliert und wirksam eingesetzt werden. Der falsche Sprung ist: Alles werde verschenkt und Deutschland habe nichts davon. Erstens muss man die Finanzierungsform trennen: Zuschüsse sind nicht rückzahlbar; Entwicklungskredite und Förderkredite sind anders zu bewerten, weil sie bedient werden müssen. Zweitens muss man das Projekt trennen: Es geht nicht nur um Radwege, sondern um nachhaltige Stadtmobilität mit Metro, Bus, ÖPNV-Organisation und sicheren Zubringern. Drittens muss man Wirkung prüfen: Kommen Menschen günstiger und sicherer zu Schule, Arbeit, Markt und Metro? Sinken Stau, Luftbelastung und CO₂? Viertens muss man den deutschen Nutzen offenlegen: Klima wirkt global, Peru ist Partner, und KfW nennt Beteiligungen deutscher Unternehmen an laufenden Vorhaben. Fünftens bleibt Kritik notwendig: Nutzung, Vergabe, Korruptionsschutz, Baufortschritt und Evaluation müssen öffentlich prüfbar sein. Die bessere Frage lautet deshalb: Welche Finanzierungsform, welche Wirkung, welche Rückzahlung, welcher Nutzen und welche Risiken liegen tatsächlich vor?",
      comment:
        "Die Rechnung ist verkürzt. Ein Teil sind Zuschüsse, vieles läuft über Kredite. Außerdem gibt es wirtschaftliche, geopolitische und klimapolitische Gründe. Entscheidend ist die Frage nach Wirkung und Kontrolle.",
      calm:
        "Ich verstehe den Reflex: Wenn hier Brücken, Schulen oder Bahnen fehlen, wirkt ein Radweg in Peru absurd. Genau deshalb sollten wir nicht beim Bild stehen bleiben, sondern trennen: Was ist Zuschuss, was Kredit, was wird zurückgezahlt, was bewirkt es, wer kontrolliert es und welchen Nutzen hat es auch für Deutschland?",
    },
    question: "Welche Finanzierungsform, welche Wirkung, welche Rückzahlung, welcher Nutzen und welche Risiken liegen tatsächlich vor?",
    frame: "Die Frage ist nicht Inland gegen Ausland. Die Frage ist: Welche Projekte erzeugen nachweisbare Wirkung - hier und dort?",
    oldFrame: "Deutschland verschenkt Steuergeld für absurde Projekte im Ausland.",
    newFrame: "Internationale Finanzierung muss nach Zuschuss, Kredit, Wirkung, Rückzahlung, Risiko und deutschem Nutzen geprüft werden.",
    better:
      "Ein Haushalt wird nicht besser, wenn wir jedes Auslandsprojekt verspotten. Er wird besser, wenn jede Ausgabe Wirkung, Finanzierung, Rückzahlung und Kontrolle offenlegt.",
    positiveExamples: [
      {
        title: "Der sichere Weg zur Metro",
        situation:
          "In Lima fährt eine Schülerin morgens mit dem Rad zur Metrostation. Der Radweg ist sicher, beleuchtet und an Bus und Bahn angebunden. Ihre Familie spart Fahrgeld. Die Straße wird entlastet. Die Stadt bekommt bessere Mobilität, und Menschen kommen verlässlicher zur Schule, Ausbildung und Arbeit.",
        getsBetter: ["sicherer Schul- und Arbeitsweg", "bessere Anbindung an Bus und Metro", "weniger Stau", "geringere Mobilitätskosten", "weniger Luftbelastung", "mehr Teilhabe für Menschen ohne Auto", "stärkere kommunale Planung"],
        hostLine: "Ein guter Radweg ist nicht nur Asphalt. Er verbindet Schule, Arbeit, Metro, Gesundheit und Teilhabe.",
        whyItWorks: "Das Beispiel startet nicht beim Spottbild. Es zeigt den besseren Alltag, der durch gute Infrastruktur entstehen kann.",
      },
      {
        title: "Die Stadt, die Verkehr neu ordnet",
        situation:
          "Eine Millionenstadt baut Bus, Metro und Radwege als Netz. Menschen fahren nicht mehr jeden kurzen Weg mit dem Auto oder im Stau. Radwege bringen sie sicher zu Haltestellen. Busse und Metro werden besser genutzt. Kleine Geschäfte werden erreichbar. Die Stadt spart Zeit, Abgase und Verkehrsfläche.",
        getsBetter: ["mehr Menschen erreichen den ÖPNV", "weniger Zeitverlust im Stau", "bessere Luft in der Stadt", "günstigere Mobilität", "bessere Erreichbarkeit kleiner Betriebe", "mehr Planungskompetenz in der Kommune"],
        hostLine: "Radwege sind dann stark, wenn sie Teil eines Netzes sind: zu Bus, Metro, Schule, Arbeit und Markt.",
        whyItWorks: "Das Beispiel zeigt Radwege nicht als Einzelmaßnahme, sondern als Teil eines Verkehrssystems.",
      },
      {
        title: "Partnerschaft, die Türen öffnet",
        situation:
          "Deutschland arbeitet mit Peru an nachhaltiger Mobilität. Dabei entstehen Standards, Ausschreibungen, Beratung, Technik und Vertrauen. Deutsche und europäische Unternehmen können sich an Projekten beteiligen. Gleichzeitig wird eine wachsende Stadt klimafreundlicher. Gute Entwicklungspolitik ist nicht Almosen, sondern Partnerschaft.",
        getsBetter: ["verlässliche internationale Beziehungen", "Marktzugang für deutsche und europäische Unternehmen", "gemeinsame Klimawirkung", "mehr Vertrauen in regelbasierte Zusammenarbeit", "weniger Einfluss autoritärer Geldgeber", "bessere Standards bei Stadtentwicklung"],
        hostLine: "Gute Zusammenarbeit ist keine Einbahnstraße. Sie schafft Wirkung vor Ort und Partnerschaft für Deutschland.",
        whyItWorks: "Das Beispiel zeigt den Nutzen für Deutschland, ohne das Projekt nur als Eigennutz zu verkaufen.",
      },
    ],
    impactFan: [
      ["Mobilität", "Sichere Wege verbinden Menschen mit Bus, Metro, Schule und Arbeit.", "Radweg als Zubringer zur Haltestelle."],
      ["Teilhabe", "Günstige Mobilität hilft besonders Menschen ohne eigenes Auto.", "Arbeitsweg ohne hohe Kraftstoffkosten."],
      ["Gesundheit", "Weniger Stau und Abgase verbessern Stadtluft.", "Weniger Feinstaub und Abgase an Hauptstraßen."],
      ["Klima", "Stadtverkehr entscheidet mit über Emissionen.", "Mehr Wege mit Rad, Bus und Metro statt Auto."],
      ["Wirtschaft", "Weniger Stau spart Zeit und stärkt Erreichbarkeit.", "Menschen kommen pünktlicher zu Arbeit und Markt."],
      ["Deutschland", "Kooperation kann Handel, Vertrauen und Aufträge stärken.", "Deutsche Unternehmen beteiligen sich an Verkehrsprojekten."],
      ["Finanzierung", "Zuschüsse, Entwicklungskredite und Förderkredite sind unterschiedliche Dinge.", "Radwege-Zuschuss nicht mit Metro-Kredit vermischen."],
      ["Vertrauen", "Transparenz entscheidet, ob Zusammenarbeit glaubwürdig bleibt.", "Datenstand, Tranchen, Kontrolle, Evaluierung."],
      ["Demokratie", "Spottframes schwächen sachliche Haushaltsdebatten.", "Ein Schlagwort ersetzt Prüfung."],
    ],
    psychology: [
      ["Verfügbarkeitsbild", "Ein einzelner Radweg ist leichter vorstellbar als ein Finanzierungsprogramm.", "Das konkrete Spottbild verdrängt Kreditstruktur, ÖPNV-System, Wirkung und Kontrolle.", "Vom Bild zur Prüfmatrix wechseln: Zuschuss, Kredit, Rückzahlung, Wirkung, Kontrolle."],
      ["Nullsummen-Frame", "Es fühlt sich an, als fehle jeder Euro im Ausland automatisch im Inland.", "Inlandsfrust wird gegen Entwicklungszusammenarbeit ausgespielt.", "Inlandslücken anerkennen und dann Finanzierungsform, Haushaltslogik und Nutzen trennen."],
      ["Kontrollverlust", "Komplexe internationale Programme wirken unübersichtlich.", "Misstrauen wird größer, wenn Summen, Zwecke und Rückzahlung vermischt werden.", "Kontrolle konkret machen: Baufortschritt, Vergabe, Nutzung, Korruptionsschutz, Evaluation."],
    ],
    gate: [
      ["Konkretes Problem", "Verkehrssicherheit, Wasser, Energie, Gesundheit, Bildung oder Klima werden praktisch verbessert."],
      ["Direkte Wirkung für Menschen", "Zum Beispiel sicherer Weg zur Schule, bessere Anbindung an Arbeit oder bezahlbare Mobilität."],
      ["Systembezug", "Radwege sind Zubringer zu Bus, Metro, Schule, Arbeit und Markt - nicht nur Asphalt."],
      ["Transparente Finanzierung", "Zuschuss, Darlehen, Eigenbeitrag, Tranchen und Rückzahlung sind klar ausgewiesen."],
      ["Kontrolle", "Umwelt- und Sozialprüfung, Baufortschritt, Beschwerdemechanismus und Evaluierung sind sichtbar."],
      ["Deutsches Interesse", "Klima, Handelsbeziehungen, Standards, Stabilität, Aufträge und Partnerschaften werden offengelegt."],
      ["Keine Symbolpolitik", "Nutzung, klare Ziele und öffentlicher Bericht müssen prüfbar sein."],
    ],
    subclaims: [
      ["315 Millionen Euro für Radwege in Peru", "Zahl, Zweck und Finanzierung werden vermischt.", "Diese Erzählung funktioniert, weil eine große Zahl mit einem kleinen Bild verbunden wird. Richtig ist: Deutschland unterstützt in Peru nachhaltige Mobilität. Dazu gehören Metro, Bus, integrierte Verkehrssysteme und Radwege. Radwege in Lima sind ein deutlich kleinerer Zuschussbestandteil. Der größere Mobilitätsrahmen enthält Kredite, vor allem für die Metro, die von Peru bedient werden. Deshalb muss man sauber trennen: Was ist Zuschuss? Was ist Kredit? Was ist Metro? Was ist Bus? Was ist Radweg? Und was wird zurückgezahlt?", "Die Zahl allein erklärt nichts. Man muss trennen: Zuschuss, Kredit, Metro, Bus, Radweg und Rückzahlung.", "Welche Summe ist Zuschuss, welche ist Kredit, und welcher Teil geht wirklich in Radwege?"],
      ["Erst Schulen hier, dann Radwege dort", "Berechtigter Frust, falsches Entweder-oder.", "Viele Menschen erleben marode Schulen, kaputte Brücken oder schlechte Bahnverbindungen. Dieser Frust ist real. Aber er wird falsch gelenkt, wenn jedes Auslandsprojekt automatisch als Ursache deutscher Probleme gilt. Deutschland kann und muss im Inland investieren. Gleichzeitig können internationale Projekte sinnvoll sein, wenn sie Klima, Stabilität, Handel, Sicherheit und Partnerschaft stärken.", "Unsere Schulen müssen besser werden. Aber ein gutes Auslandsprojekt ist nicht automatisch der Grund, warum hier etwas kaputt ist.", "Welche Investitionen fehlen hier - und welche internationalen Projekte erzeugen nachweislich Nutzen?"],
      ["Entwicklungshilfe bringt Deutschland nichts", "Zu eng gedacht.", "Deutschland ist stark in internationale Lieferketten, Handel, Sicherheit und Klimafragen eingebunden. Wenn Städte in Partnerländern besser funktionieren, Märkte stabiler werden, Klimaschutz vorankommt und demokratische Partnerschaften wachsen, wirkt das auch auf Deutschland zurück. Das bedeutet nicht, dass jedes Projekt gut ist. Aber es bedeutet: Der Nutzen endet nicht an der Landesgrenze.", "Deutschland lebt von Handel, Stabilität und Kooperation. Gute Entwicklungspolitik ist auch Eigeninteresse.", "Stärkt das Projekt Stabilität, Klima, Handel oder Partnerschaft - und ist die Wirkung belegt?"],
      ["Das Geld wird verschenkt", "Oft falsch oder unvollständig.", "Entwicklungsfinanzierung besteht nicht nur aus Zuschüssen. Es gibt auch Darlehen, Förderkredite, Eigenmittel, Mischfinanzierung und Rückzahlungen. Ein Zuschuss muss besonders gut begründet werden. Ein Kredit muss tragfähig sein und zurückgezahlt werden. Beides muss kontrolliert werden.", "Nicht alles ist Geschenk. Viele Mittel sind Kredite. Und bei Zuschüssen zählt: Was bewirken sie konkret?", "Ist es Zuschuss, Kredit oder Mischfinanzierung - und wie wird die Wirkung geprüft?"],
      ["Solche Projekte sind nur Symbolpolitik", "Prüfbar statt pauschal.", "Symbolpolitik erkennt man nicht am Ort des Projekts, sondern an fehlender Wirkung. Entscheidend sind Nutzung, Kosten, Kontrolle, Systemnutzen, Standards und Evaluierung. Wenn ein Projekt diese Prüfung nicht besteht, muss es verbessert oder beendet werden. Wenn es sie besteht, sollte es nicht durch ein Spottbild entwertet werden.", "Gute Kritik fragt nach Nutzung, Kontrolle und Wirkung - nicht nach Spottwert.", "Welche Ziele, Nutzungsdaten und Kontrollberichte liegen vor?"],
    ],
    solution: [
      ["Wirkungskarte für jedes Auslandsprojekt", "Jedes Projekt zeigt auf einer öffentlichen Seite Zweck, Betrag, Finanzierungsform, Partner, Baufortschritt, Wirkung und Quellen."],
      ["Zuschuss und Kredit sichtbar trennen", "Menschen müssen sofort sehen: Was ist Zuschuss? Was ist Darlehen? Was wird zurückgezahlt? Wer trägt Risiko?"],
      ["Gute Bilder statt Spottbilder", "Kommunikation erklärt nicht nur Zahlen, sondern den besseren Alltag: sicher zur Schule, zur Arbeit, zur Metro, zum Markt."],
      ["Wirkung vor Auszahlung prüfen", "Tranchen werden an Fortschritt, Standards und Wirkung gekoppelt."],
      ["Kontrolle öffentlich machen", "Umwelt- und Sozialprüfung, Vergabe, Beschwerdemechanismus und Evaluierung werden leicht auffindbar."],
      ["Deutschland-Nutzen offenlegen", "Klima, Stabilität, Handel, Partnerschaft, Aufträge und strategische Beziehungen werden transparent erklärt."],
      ["Lernschleife einbauen", "Was funktioniert, wird skaliert. Was nicht funktioniert, wird beendet oder angepasst."],
      ["Kommunikation entgiften", "Nicht moralisch verteidigen, sondern sauber erklären: Wirkung, Kontrolle, Finanzierungsform, Nutzen."],
    ],
    trust: {
      sourceStand: "BMZ/KfW/Tagesschau geprüft am 04.06.2026; ältere Zahlenstände werden als Datenstand, nicht als ewige Wahrheit gelesen.",
      sicher: ["Die 315-Mio.-Erzählung vermischt verschiedene Mobilitätsprojekte.", "Radwege-Zuschüsse und rückzahlbare Kredite sind unterschiedliche Finanzierungsformen.", "Radwege sind in Lima als Zubringer zu Bus- und Metrolinien gedacht.", "KfW beschreibt nachhaltige Mobilität in Lima als System aus Fahrradwegen und Metro.", "KfW nennt aktuell Beteiligungen mehrerer deutscher Firmen mit rund 33 Mio. Euro Auftragswert an laufenden Vorhaben.", "Kontrolle, Nutzung und Baufortschritt bleiben prüfpflichtig."],
      pruefen: ["Konkrete Nutzung der neu gebauten Radwege nach Fertigstellung.", "Auszahlungsstand und Tranche je Projekt.", "Welche Mittel Zuschuss, Entwicklungskredit oder Förderkredit sind.", "Baufortschritt je Abschnitt.", "Vergabe, Korruptionsschutz, Umwelt- und Sozialprüfung.", "Langfristige Verkehrswirkung und CO₂-Minderung.", "Aktuelle deutsche Unternehmensaufträge im weiteren Projektverlauf."],
    },
    criticalQuestions: ["Werden die Projekte tatsächlich genutzt?", "Wie hoch ist der Zuschussanteil?", "Welche Kredite werden zurückgezahlt?", "Wie wird Korruption verhindert?", "Welche Unternehmen profitieren?", "Welche Wirkung wird gemessen?", "Gibt es bessere Alternativen?", "Wie hoch ist der deutsche Nutzen?"],
    sourceKeys: ["bmz_lima_mobilitaet", "kfw_entwicklungszusammenarbeit", "kfw_nama_stadtverkehr_peru", "tagesschau_radwege_peru_2025", "tagesschau_radwege_peru_2024", "kfw_projektdatenbank_radweg_lima", "kfw_transparenzportal", "bmz_transparenzportal", "kfw_evaluierung"],
  },
  {
    slug: "ukraine-unterstuetzung-steuergeld",
    title: "Unser Steuergeld geht in die Ukraine?",
    subtitle: "Hilfe ist kein Loch im Haushalt. Sie ist Schutzleistung.",
    judgement: "Echte Haushaltsfrage. Falsches Verlustbild.",
    status: "checked_v2_positive_examples",
    claim: "Unser Steuergeld geht in die Ukraine?",
    claimVariants: ["Wir könnten das Geld hier besser gebrauchen.", "Erst Deutschland, dann Ukraine.", "Ukraine-Hilfe ist ein Fass ohne Boden.", "Wir bezahlen den Krieg.", "Das Geld versickert in der Ukraine.", "Für die Ukraine ist Geld da, für Rentner nicht.", "Deutschland soll nicht Zahlmeister sein.", "Ukraine-Unterstützung bringt uns nichts."],
    abstract:
      "Das Narrativ enthält einen wahren Punkt: Öffentliche Ausgaben müssen transparent, kontrolliert und begründet sein. Der Denkfehler ist: Ukraine-Unterstützung wird als Geldverlust erzählt, obwohl sie Schutz von Menschenleben, staatliche Handlungsfähigkeit, europäische Sicherheit, regelbasierte Ordnung, Wiederaufbau, Energie- und Wirtschaftsresilienz sowie die Vermeidung größerer Folgekosten berührt.",
    points: [
      ["Was stimmt?", "Deutschland hat hohe Unterstützungsleistungen für die Ukraine zugesagt und geleistet. Öffentliche Gelder müssen transparent, kontrolliert und sinnvoll priorisiert werden."],
      ["Was fehlt?", "Ukraine-Hilfe ist nicht nur Bargeldtransfer. Viele Leistungen sind Ausrüstung, Ausbildung, Industrieaufträge, Garantien, Kredite, europäische Programme oder konkrete zivile Stabilisierung."],
      ["Zivile Wirkung", "Zivile Hilfe hält Energie, Gesundheit, Verwaltung, kommunale Versorgung, Schulen und Wasser stabiler."],
      ["Sicherheitswirkung", "Militärische Unterstützung soll die Verteidigungsfähigkeit eines angegriffenen Staates sichern und europäische Abschreckung stärken."],
      ["Bilanzgrenze", "Nicht jede Zusage ist sofort ausgegebenes Geld. Nicht jede Summe ist Geschenk; Garantien, Kredite, Sachleistungen und Haushaltsmittel unterscheiden sich."],
      ["Kernsatz", "Der wahre Punkt ist Kontrolle. Der falsche Sprung ist Verlustbild."],
    ],
    answers: {
      ten: "Ukraine-Hilfe ist nicht einfach Geld weg. Gute Hilfe hält Kliniken, Strom, Wasser, Verwaltung und Schutz stabil. Die richtige Frage ist: Was bewirkt sie konkret - und wie wird sie kontrolliert?",
      thirty:
        "Der wahre Punkt ist: Steuergeld muss kontrolliert werden. Der falsche Sprung ist: Ukraine-Hilfe sei einfach ein Verlust. Unterstützung hält Infrastruktur, Kliniken, Verwaltung und Verteidigung handlungsfähig. Sie schützt auch Europas Sicherheitsordnung. Darum prüfen wir Wirkung, Kontrolle und Folgekosten - nicht nur die Schlagzeile.",
      two:
        "Ich verstehe den Reflex. In Deutschland fehlen Investitionen in Schulen, Brücken, Pflege, Bahn und Wohnen. Deshalb muss jede Ausgabe gut erklärt und kontrolliert werden. Aber bei der Ukraine-Unterstützung ist der Satz „Unser Geld ist weg“ zu kurz. Ein Teil der Hilfe stabilisiert den ukrainischen Staat: Energie, Verwaltung, Krankenhäuser, Kommunen, Geflüchtete und Wiederaufbau. Ein Teil ist militärische Unterstützung, damit die Ukraine sich verteidigen kann. Ein Teil läuft über europäische Instrumente, Garantien, Kredite, Ausbildung, Industriekooperation oder Wiederaufbauprogramme. Das ist nicht alles dasselbe. Das positive Bild ist: Ein Krankenhaus hat Strom. Wasserpumpen laufen. Eine Kommune kann Menschen versorgen. Ein Staat bleibt handlungsfähig. Und Europa zeigt: Grenzen dürfen nicht mit Gewalt verschoben werden. Das schützt nicht nur die Ukraine, sondern auch unsere Sicherheitsordnung. Natürlich muss man fragen: Welche Summe ist zugesagt, welche schon ausgezahlt? Was ist Zuschuss, Kredit, Garantie, Material oder Ausbildung? Was wird kontrolliert? Was stärkt auch deutsche und europäische Sicherheit? Genau diese Prüfung brauchen wir. Aber ein Pauschalframe „Ukraine frisst unser Geld“ macht die Debatte nicht ehrlicher. Er macht nur die Wirkung unsichtbar.",
      comment:
        "Ukraine-Hilfe ist nicht einfach „Geld weg“. Sie hält Strom, Kliniken, Verwaltung, Schutz und europäische Sicherheit stabil. Die richtige Frage ist: Was bewirkt sie konkret, wie wird sie kontrolliert, und welche Folgekosten verhindert sie?",
      calm:
        "Die Haushaltsfrage ist berechtigt. Lass uns sauber prüfen: Welche Hilfe ist militärisch, welche zivil, welche Kredit oder Garantie, welche schon ausgezahlt - und welche Folgekosten würden entstehen, wenn die Ukraine nicht stabil bleibt?",
    },
    question: "Was bewirkt die Unterstützung konkret - und welche Kosten würden entstehen, wenn wir nicht helfen?",
    frame: "Nicht Inland gegen Ukraine. Sondern: Welche Ausgaben schützen Menschen, Infrastruktur und Sicherheit am wirksamsten?",
    oldFrame: "Deutschland verschenkt Geld, während hier alles fehlt.",
    newFrame: "Öffentliche Hilfe muss Wirkung, Kontrolle und Sicherheitsnutzen zeigen.",
    better:
      "Die Frage nach Kontrolle ist richtig. Aber Ukraine-Hilfe ist nicht einfach Geldverlust. Sie schützt Menschen, Infrastruktur, europäische Sicherheit und die Regel, dass Grenzen nicht mit Gewalt verschoben werden dürfen.",
    positiveExamples: [
      {
        title: "Das Krankenhaus, in dem das Licht anbleibt",
        situation:
          "Eine ukrainische Stadt bekommt Unterstützung für Energie, Ersatzteile und Schutz kritischer Infrastruktur. Das Krankenhaus kann weiter arbeiten. Wasserpumpen laufen. Kinder können zur Schule gehen. Die Verwaltung bleibt erreichbar. Hilfe wird so nicht zu einem abstrakten Betrag, sondern zu funktionierendem Alltag.",
        getsBetter: ["Krankenhäuser bleiben handlungsfähig", "Wasser und Wärme bleiben stabiler", "Kinder und Familien bekommen Alltag zurück", "Kommunen können weiter arbeiten", "weniger Wiederaufbaukosten entstehen später", "Menschen müssen seltener fliehen", "Europa gewinnt Stabilität"],
        hostLine: "Hilfe ist nicht nur Geld. Hilfe heißt: Licht bleibt an, Kliniken arbeiten, Wasser läuft, Verwaltung funktioniert.",
        whyItWorks: "Das Beispiel startet nicht mit Milliarden oder Angst. Es zeigt einen besseren Zustand, den Unterstützung möglich macht.",
      },
      {
        title: "Die gemeinsame Sicherheitskette",
        situation:
          "Mehrere europäische Länder unterstützen ein angegriffenes Nachbarland. Jedes Land trägt einen Teil bei: Energie, Medizin, Ausbildung, Luftverteidigung, Wiederaufbau, Kredite, Garantien. Allein wäre jede Unterstützung schwächer. Gemeinsam entsteht eine Sicherheitskette, die Europa stabiler macht.",
        getsBetter: ["Lasten werden geteilt", "Europa handelt gemeinsam", "Abschreckung wird glaubwürdiger", "kleinere Länder fühlen sich sicherer", "die regelbasierte Ordnung wird gestärkt", "Deutschland steht nicht allein"],
        hostLine: "Sicherheit funktioniert wie eine Kette: Sie hält besser, wenn mehrere Glieder tragen.",
        whyItWorks: "Das Beispiel zeigt Unterstützung als gemeinsame Sicherheitsarchitektur, nicht als einseitige Zahlung.",
      },
      {
        title: "Wiederaufbau, der Zusammenarbeit schafft",
        situation:
          "Ein deutsches Unternehmen liefert Technik für Stromnetze, Wasser, Schienen oder Krankenhäuser. Ukrainische Fachkräfte bauen damit Infrastruktur wieder auf. Deutschland unterstützt Standards, Ausbildung und Finanzierung. Aus Hilfe entsteht Wiederaufbau - und aus Wiederaufbau entsteht Partnerschaft.",
        getsBetter: ["Infrastruktur wird erneuert", "ukrainische Fachkräfte werden gestärkt", "deutsche Unternehmen können mitwirken", "europäische Standards verbreiten sich", "Wirtschaftsbeziehungen entstehen", "Wiederaufbau wird planbarer"],
        hostLine: "Gute Ukraine-Hilfe endet nicht bei Lieferung. Sie baut Fähigkeiten, Standards und Partnerschaft auf.",
        whyItWorks: "Das Beispiel macht sichtbar, dass Unterstützung auch auf europäische Wirtschaft, Standards und Stabilität zurückwirkt.",
      },
    ],
    impactFan: [
      ["Menschen", "Hilfe hält Alltag möglich.", "Kliniken, Schulen, Wasser, Wärme, Verwaltung."],
      ["Sicherheit", "Ein stabileres Nachbarland macht Europa sicherer.", "Grenzen, Abschreckung, Verteidigungsfähigkeit."],
      ["Energie", "Reparierte Netze halten Versorgung aufrecht.", "Transformatoren, Ersatzteile, dezentrale Energie."],
      ["Flucht", "Stabile Versorgung kann Fluchtgründe verringern.", "Wenn Strom, Wasser und Arbeit bleiben, bleiben mehr Menschen vor Ort."],
      ["Wirtschaft", "Wiederaufbau schafft Partnerschaften und Aufträge.", "Energie, Bahn, Bau, Medizin, Digitalisierung."],
      ["Demokratie", "Unterstützung verteidigt die Regel: Gewalt darf Grenzen nicht verschieben.", "Rechtsstaatliche Ordnung statt Machtpolitik."],
      ["Haushalt", "Nicht jede Summe ist dasselbe.", "Zuschuss, Kredit, Garantie, Material, Ausbildung."],
      ["Kontrolle", "Hilfe braucht Nachweis, Prüfung und Bericht.", "Tranchen, Beschaffung, EU-Auflagen, Monitoring."],
      ["Folgekosten", "Nicht-Handeln kann teurer werden.", "Mehr Instabilität, mehr Wiederaufbau, mehr Sicherheitsausgaben."],
    ],
    psychology: [
      ["Nullsummenfehler", "Das Geld fehlt gefühlt hier.", "Jeder Euro für die Ukraine fühlt sich wie ein Euro weniger für die eigene Straße an.", "Inlandslücken anerkennen und dann Wirkung, Finanzierungsform und Folgekosten prüfen."],
      ["Nahbereichsbias", "Der Krieg ist weit weg, die eigene kaputte Brücke ist nah.", "Der sichtbare Mangel vor Ort wirkt stärker als Sicherheitsrisiken außerhalb.", "Ein positives Alltagsbild zeigen: Klinik, Strom, Wasser, Schule, Verwaltung."],
      ["Überforderungsreaktion", "Große Zahlen machen müde.", "Menschen schalten ab oder suchen einfache Schuldige.", "Summen zerlegen: zivil, militärisch, Kredit, Garantie, Sachleistung, Ausbildung."],
    ],
    gate: [
      ["Klarer Zweck", "Energieversorgung, Luftschutz, medizinische Versorgung, kommunale Stabilität, Ausbildung oder Wiederaufbau sind benannt."],
      ["Konkreter Schutz", "Menschen und Infrastruktur werden geschützt: Kliniken, Wasserwerke, Stromnetze, Schulen, Notdienste."],
      ["Verteidigungsfähigkeit", "Die Maßnahme stärkt Schutz, Ausbildung, Wartung, Munition, Luftverteidigung oder Verhandlungsfähigkeit."],
      ["Europäische Sicherheit", "Sie stärkt Abschreckung, regelbasierte Ordnung, Schutz von Grenzen und Stabilität im Nachbarschaftsraum."],
      ["Transparente Finanzierung", "Zuschuss, Kredit, Garantie, Material, Ausbildung, EU-Anteil und Bundeshaushalt sind unterscheidbar."],
      ["Kontrolle", "Bericht, Auflagen, Beschaffungskontrolle, parlamentarische Kontrolle und EU-Reformauflagen sind sichtbar."],
      ["Folgekosten senken", "Weniger Zerstörung, weniger Flucht, weniger späterer Wiederaufbau und weniger Ausweitung des Konflikts sind plausibel."],
      ["Keine blinde Dauerlogik", "Ziel, Wirkung, Kosten, Risiken und Ausstiegspfade werden regelmäßig geprüft."],
    ],
    subclaims: [
      ["Wir könnten das Geld hier besser gebrauchen", "Berechtigter Investitionsfrust, falsches Entweder-oder.", "Viele Menschen erleben in Deutschland marode Schulen, verspätete Bahn, hohe Mieten, Pflegeprobleme und schlechte digitale Verwaltung. Dieser Frust ist real. Falsch wird es, wenn Ukraine-Hilfe als Ursache dieser Probleme erzählt wird. Deutschland braucht Investitionen im Inland und zugleich Sicherheit im europäischen Umfeld.", "Deutschland muss hier investieren. Aber Ukraine-Hilfe ist nicht automatisch der Grund, warum hier eine Brücke kaputt ist.", "Welche Investitionen fehlen hier - und welche Ukraine-Hilfen verhindern größere Folgekosten?"],
      ["Deutschland bezahlt den Krieg", "Falscher Frame: Unterstützung soll Verteidigung, Schutz und Stabilität ermöglichen.", "Deutschland unterstützt nicht den Krieg als Zustand. Deutschland unterstützt die Fähigkeit der Ukraine, sich gegen einen völkerrechtswidrigen Angriff zu verteidigen, Menschen zu schützen und staatliche Handlungsfähigkeit zu erhalten.", "Das Ziel ist nicht Krieg. Das Ziel ist Schutz, Verteidigungsfähigkeit und eine bessere Ausgangslage für Frieden.", "Kommt Frieden eher durch ungeschützte Schwäche oder durch Schutz, Stabilität und Verhandlungsfähigkeit?"],
      ["Das Geld versickert", "Kontrollfrage berechtigt; Pauschalurteil ohne Belege ist Frame-Verstärkung.", "Korruptionsrisiken und Missbrauch müssen ernst genommen werden. Aber ein pauschaler Versickerungsverdacht ersetzt keine Prüfung. Entscheidend ist: Welche Hilfeform, welche Auflage, welche Kontrolle, welche Auszahlung, welche Wirkung?", "Kontrolle ja. Pauschalverdacht nein. Lass uns prüfen, welche Mittel wie kontrolliert werden.", "Welche Mittel sind belegt, welche Risiken bestehen, und welche Kontrollmechanismen greifen?"],
      ["Ukraine-Hilfe bringt Deutschland nichts", "Verkürzt: Sicherheit, Stabilität, Handel, Energie und Regelordnung wirken zurück.", "Deutschland profitiert von einer stabileren europäischen Sicherheitsordnung, weniger Erpressbarkeit, geringeren Folgekosten, gemeinsamen Standards und Wiederaufbaupartnerschaften. Das macht nicht jede Maßnahme automatisch gut, aber der Nutzen endet nicht an der Grenze.", "Sicherheit, Stabilität und regelbasierte Ordnung wirken nach Deutschland zurück.", "Welche konkrete Rückwirkung hat diese Unterstützung auf Sicherheit, Stabilität, Wirtschaft und Folgekosten?"],
      ["Wir sind der Zahlmeister", "Lastenteilung und EU-/NATO-/G7-Kontext fehlen.", "Deutschland trägt viel, aber nicht allein. Unterstützung läuft über EU, NATO, G7 und weitere Partner. Saubere Debatte muss Beiträge, Zusagen, Auszahlungen, Kredite, Garantien und Sachleistungen vergleichbar machen.", "Die Frage ist nicht nur, wer zahlt. Die Frage ist, ob Lasten fair geteilt und wirksam eingesetzt werden.", "Wie sind Beiträge international verteilt - und welche Hilfeform wird verglichen?"],
      ["Frieden statt Waffen", "Friedensziel richtig; Schutz und Verhandlungsfähigkeit müssen mitgedacht werden.", "Frieden ist das Ziel. Die Streitfrage ist, ob weniger Unterstützung die Chancen auf Frieden verbessert oder ob dadurch Schutz, Verteidigungsfähigkeit und Verhandlungsmacht sinken. Das muss sachlich geprüft werden.", "Frieden ist das Ziel. Die schwierige Frage ist, welche Unterstützung Schutz und Verhandlungschancen stärkt.", "Welche Maßnahme verkürzt Leid und erhöht realistische Friedenschancen?"],
    ],
    solution: [
      ["Wirkungskarte für Ukraine-Hilfe", "Jede größere Unterstützung zeigt Zweck, Betrag, Form, Partner, Stand, erwartete Wirkung und Quelle."],
      ["Hilfeformen trennen", "Militärisch, zivil, humanitär, finanziell, Garantie, Kredit, Sachleistung, Ausbildung und Industrieauftrag werden getrennt ausgewiesen."],
      ["Zusage und Auszahlung trennen", "Politische Zusagen, Haushaltsbereitstellungen und tatsächliche Auszahlungen stehen nicht in einer Zahlenschublade."],
      ["Kontrolle öffentlich machen", "Parlamentarische Kontrolle, EU-Auflagen, Beschaffungsprüfung, Audits und Korruptionsschutz werden sichtbar."],
      ["Folgekosten bilanzieren", "Nicht-Hilfe wird als Risiko mitgerechnet: Flucht, Wiederaufbau, Sicherheitsdruck, Erpressbarkeit und Ausweitung."],
      ["Europäische Lastenteilung zeigen", "Deutschlandbeiträge werden im EU-, NATO-, G7- und Partnerkontext eingeordnet."],
      ["Gute Bilder erzählen", "Kommunikation beginnt mit Strom, Kliniken, Wasser, Verwaltung und Schutz - nicht mit Angstbildern."],
      ["Lernschleife einbauen", "Maßnahmen werden beendet, angepasst oder skaliert, wenn Wirkung, Kontrolle oder Lage sich ändern."],
      ["Haushaltsfrust ernst nehmen", "Inlandslücken werden anerkannt, ohne die Ukraine zum Sündenbock für deutsche Investitionsprobleme zu machen."],
    ],
    trust: {
      sourceStand: "AA 24.02.2026; Bundesregierung-Detailübersicht 31.03.2026; EU Ukraine Facility 2024-2027; World Bank RDNA5 23.02.2026.",
      sicher: ["Das Auswärtige Amt weist bis 24.02.2026 rund 41 Mrd. Euro zivile und rund 55,5 Mrd. Euro militärische Unterstützung aus, geleistet beziehungsweise für kommende Jahre bereitgestellt.", "Die Bundesregierung markiert in der Detailübersicht Bilanzgrenzen wie reguläre Beiträge, Länder-/Kommunalhilfe, private Hilfe sowie Garantien und Bürgschaften.", "Die EU Ukraine Facility umfasst bis zu 50 Mrd. Euro für 2024 bis 2027.", "Der Kiel Ukraine Support Tracker ist eine vergleichende Datenbank für militärische, finanzielle und humanitäre staatliche Unterstützung."],
      pruefen: ["Neue Datenstände nach jeder Bundesregierung-, AA-, EU- und Kiel-Aktualisierung.", "Welche Zusagen tatsächlich ausgezahlt wurden.", "Welche Mittel Zuschüsse, Kredite, Garantien oder Sachleistungen sind.", "Wirksamkeit einzelner Maßnahmen vor Ort.", "Korruptionsschutz und Beschaffungskontrolle je Programm."],
    },
    sourceKeys: ["auswaertiges_amt_ukraine_solidaritaet", "bundesregierung_ukraine_hilfe", "bundesregierung_ukraine_detail_pdf_2026", "bmvg_vier_jahre_ukraine_unterstuetzung", "kiel_ukraine_tracker", "kiel_ukraine_tracker_data", "eu_ukraine_facility", "eu_commission_ukraine_facility_general", "consilium_ukraine_facility", "unhcr_ukraine_situation", "world_bank_ukraine_rdna5"],
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
  ["entwicklungskredit", "Entwicklungskredit", "Kredit für ein Entwicklungsprojekt, der zurückgezahlt werden muss und oft zu günstigeren Konditionen vergeben wird.", "Ein Entwicklungskredit ist kein Geschenk. Er muss bedient werden."],
  ["zuschuss", "Zuschuss", "Öffentliche Finanzierung, die nicht zurückgezahlt wird.", "Zuschüsse brauchen besonders klare Begründung und Wirkungsprüfung."],
  ["laecherlichkeitsframe", "Lächerlichkeitsframe", "Kommunikationsmuster, das ein Projekt über ein spöttisches Bild entwertet, bevor seine Wirkung geprüft wird.", "Spott ersetzt keine Wirkungsprüfung."],
  ["nullsummenfehler", "Nullsummenfehler", "Denkfehler, bei dem jede Ausgabe an einem Ort automatisch als Verlust an einem anderen Ort erlebt wird.", "Haushalte brauchen Prioritäten, aber nicht jede internationale Ausgabe ist automatisch ein Verlust im Inland."],
  ["nahbereichsbias", "Nahbereichsbias", "Tendenz, nahe Probleme stärker wahrzunehmen als weiter entfernte Wirkungen, auch wenn diese zurückwirken.", "Das Nahe fühlt sich wichtiger an. Das Ferne kann trotzdem auf uns zurückwirken."],
  ["internationale-zusammenarbeit", "Internationale Zusammenarbeit", "Kooperation zwischen Staaten und Institutionen, um gemeinsame Probleme wie Klima, Gesundheit, Handel, Sicherheit und Entwicklung zu lösen.", "Gute Zusammenarbeit ist kein Almosen, sondern gemeinsame Problemlösung."],
  ["wirkungshaushalt-ausland", "Wirkungshaushalt für Auslandsprojekte", "Haushaltslogik, die Auslandsprojekte nach Zweck, Finanzierungsform, Kontrolle, Rückzahlung, Nutzen und langfristiger Wirkung bewertet.", "Nicht Spott entscheidet, sondern nachweisbare Wirkung."],
  ["sicherheits-t-sroi", "Sicherheits-T-SROI", "Wirkungsbewertung von Sicherheits- und Präventionsausgaben nach vermiedenen Schäden, Resilienz, Stabilität und demokratischer Ordnung.", "Nicht nur fragen: Was kostet Hilfe? Sondern auch: Was kostet Nicht-Hilfe?"],
  ["ukraine-hilfe", "Ukraine-Hilfe", "Sammelbegriff für zivile, humanitäre, finanzielle, militärische und wirtschaftliche Unterstützung der Ukraine.", "Ukraine-Hilfe ist keine einzige Geldart. Zuschüsse, Kredite, Garantien, Sachleistungen, Ausbildung und EU-Programme müssen getrennt werden."],
  ["sachleistung", "Sachleistung", "Unterstützung, die als Material, Ausrüstung, Technik, Ersatzteil, Ausbildung oder Dienstleistung erfolgt statt als direkte Geldzahlung.", "Sachleistungen dürfen nicht so behandelt werden, als wäre es immer ein unkontrollierter Bargeldtransfer."],
  ["garantie", "Garantie", "Finanzielle Absicherung für Risiken, bei der Geld nicht automatisch sofort ausgezahlt wird.", "Garantien sind Haushaltsrisiken, aber nicht identisch mit sofort ausgegebenem Geld."],
  ["verteidigungsfaehigkeit", "Verteidigungsfähigkeit", "Fähigkeit eines Staates, Menschen, Infrastruktur, Gebiet und demokratische Institutionen gegen Angriffe zu schützen.", "Verteidigungsfähigkeit ist ein Sicherheitsnutzen, der in der Steuergelddebatte oft unsichtbar bleibt."],
  ["regelbasierte-ordnung", "Regelbasierte Ordnung", "Internationale Ordnung, in der Grenzen, Verträge und Rechte nicht einfach durch Gewalt ersetzt werden sollen.", "Diese Ordnung schützt auch kleinere und mittlere Staaten, weil Macht nicht allein Recht setzen soll."],
  ["folgekosten", "Folgekosten", "Spätere Kosten, die entstehen, wenn ein Problem nicht stabilisiert, verhindert oder rechtzeitig begrenzt wird.", "Nicht nur Hilfe kostet Geld. Auch Nicht-Hilfe kann teuer werden."],
  ["sicherheitsresilienz", "Sicherheitsresilienz", "Fähigkeit von Gesellschaften, Infrastruktur und Institutionen, unter Druck handlungsfähig zu bleiben.", "Strom, Wasser, Kliniken, Verwaltung und Schutz sind Sicherheitsresilienz im Alltag."],
  ["ukraine-facility", "Ukraine Facility", "EU-Instrument für Unterstützung der Ukraine von 2024 bis 2027 mit Darlehen, Zuschüssen, Reformauflagen, Wiederaufbau- und Resilienzzielen.", "Die Ukraine Facility muss nach Darlehen, Zuschüssen, Bedingungen, Zahlungen und Wirkung gelesen werden."],
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
    <link rel="stylesheet" href="${base}assets/css/style.css?v=20260604-menu-fix}">
  </head>
  <body>
    <header class="site-header" data-search-exclude><a class="brand" href="${base}index.html"><span class="brand-mark"><img src="${base}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span><span class="brand-name">Wirkungsökonomie</span></a><button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav"><span></span><span></span><span></span></button><nav id="site-nav" class="site-nav" aria-label="Hauptnavigation"><a href="${base}kompass.html">Kompass</a><a href="${base}wirkungsradar/">Wirkungsradar</a><a href="${base}begriffe/">Begriffe</a></nav></header>
${main}
    <footer class="footer" data-search-exclude><div class="footer-grid"><div><p class="hero-kicker">Wirkungsökonomie</p><h2>Wirkung statt Symbolbilanz</h2><p>Wirkungsradar: Faktenkern, Narrativ, Psychologie, Wirkungspfad und bessere Handlungsfrage.</p></div><a class="btn btn-primary" href="${base}wirkungsradar/">Wirkungsradar öffnen</a></div></footer>
    <script src="${base}assets/js/main.js?v=20260604-debate-use-order}"></script>
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

function accordionCards(items, label = "Punkt") {
  return `<div class="radar-answer-accordion host-answer-tabs">${items.map(([title, text], index) => `<details class="radar-answer-item"${index === 0 ? " open" : ""}><summary><span class="radar-answer-time">${esc(label)} ${index + 1}</span><span class="radar-answer-label">${esc(title)}</span></summary><p>${esc(text)}</p></details>`).join("")}</div>`;
}

function nav(base) {
  return `<nav class="radar-subnav" aria-label="Wirkungsradar Navigation" data-search-exclude><a href="${base}wirkungsradar/">Überblick</a><a href="${base}wirkungsradar/live/">Live</a><a href="${base}wirkungsradar/themen/">Themen</a><a href="${base}wirkungsradar/narrative/">Narrative</a><a href="${base}wirkungsradar/psychologie/">Psychologie</a></nav>`;
}

function sourceCards(keys) {
  const items = sources.filter(([, key]) => keys.includes(key));
  return `<div class="card-grid">${items.map(([label, key, url, useFor, warning]) => `<article class="card" id="quelle-${esc(key)}"><p class="card-kicker">Quelle vorbereiten</p><h3 class="card-title">${esc(label)}</h3>${Array.isArray(useFor) ? `<ul class="clean-list">${useFor.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>` : `<p class="card-text"><strong>Verwendet für:</strong> ${esc(useFor)}</p>`}<p class="card-text"><strong>Grenze:</strong> ${esc(warning)}</p><p><a class="text-link" href="${esc(url)}">Quelle öffnen</a></p></article>`).join("")}</div>`;
}

function list(items) {
  return `<ul class="clean-list">${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
}

function positiveExamples(examples) {
  return `<div class="card-grid three">${examples.map((item) => `<article class="card"><p class="card-kicker">Ein gutes Bild</p><h3 class="card-title">${esc(item.title)}</h3><p class="card-text">${esc(item.situation)}</p><p class="card-text"><strong>Host-Satz:</strong> ${esc(item.hostLine)}</p><details class="v2-source-drawer"><summary>Was wird besser?</summary>${list(item.getsBetter)}<p class="card-text"><strong>Warum es wirkt:</strong> ${esc(item.whyItWorks)}</p></details></article>`).join("")}</div>`;
}

function impactFan(items) {
  return `<div class="v2-impact-grid">${items.map(([label, sentence, example]) => `<article class="v2-impact-card"><p class="v2-badge">Wirkt mit</p><h3>${esc(label)}</h3><p>${esc(sentence)}</p><small>${esc(example)}</small></article>`).join("")}</div>`;
}

function psychologyLite(items) {
  return `<div class="card-grid three">${items.map(([technical, simple, debateEffect, howToBypass]) => `<article class="card"><p class="v2-badge">${esc(technical)}</p><h3 class="card-title">${esc(simple)}</h3><p class="card-text">${esc(debateEffect)}</p><p class="card-text"><strong>Umgehen:</strong> ${esc(howToBypass)}</p></article>`).join("")}</div>`;
}

function gateCards(items) {
  return `<div class="card-grid">${items.map(([title, text], index) => `<article class="card"><p class="card-kicker">Prüfpunkt ${index + 1}</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(text)}</p></article>`).join("")}</div>`;
}

function subclaimAccordion(items) {
  return `<div class="radar-answer-accordion host-answer-tabs">${items.map(([title, judgement, text, answer, question], index) => `<details class="radar-answer-item"${index === 0 ? " open" : ""}><summary><span class="radar-answer-time">${esc(title)}</span><span class="radar-answer-label">${esc(judgement)}</span></summary><p>${esc(text)}</p><p><strong>Host-Antwort:</strong> ${esc(answer)}</p><p><strong>Bessere Frage:</strong> ${esc(question)}</p></details>`).join("")}</div>`;
}

function solutionCards(items) {
  return `<div class="card-grid">${items.map(([title, text]) => `<article class="card"><p class="card-kicker">Lösung</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(text)}</p></article>`).join("")}</div>`;
}

function radwegePage(dossier, detail = false) {
  const pageType = detail ? "Detail" : "Live";
  const financeQuestion = "Welche Finanzierungsform, welche Wirkung, welche Rückzahlung, welcher Nutzen und welche Risiken liegen tatsächlich vor?";
  const consequences = [
    ["Wirkung 1. Ordnung", "Menschen glauben: Deutschland verschenkt wahllos Steuergeld ins Ausland."],
    ["Wirkung 2. Ordnung", "Vertrauen in Entwicklungszusammenarbeit sinkt. Internationale Kooperation wird pauschal negativ bewertet."],
    ["Wirkung 3. Ordnung", "Politische Debatten verschieben sich weg von Wirksamkeit und Kontrolle hin zu nationaler Empörung."],
    ["Mensch", "Mensch: Entwicklungs-, Bildungs- und Mobilitätswirkungen werden unsichtbar."],
    ["Planet", "Planet: CO₂ wird national statt global betrachtet, obwohl Klimawirkung nicht an Landesgrenzen endet."],
    ["Demokratie", "Demokratie: Komplexe Zusammenhänge werden auf Empörungsbilder reduziert."],
  ];
  const wirkpfad = [
    ["Auslöser", "Bild oder Schlagzeile über Radwege in Peru"],
    ["Wirkungspotenzial", "Empörung über angebliche Geldverschwendung"],
    ["Wirkmechanismus", "Zuschüsse, Kredite, Mobilitätsprojekte und Entwicklungszusammenarbeit werden vermischt"],
    ["Zustandsveränderung", "Misstrauen gegen internationale Kooperation"],
    ["Rückkopplung", "Komplexe Entwicklungs- und Klimapolitik wird schwieriger vermittelbar"],
    ["Gegensteuerung", "Finanzierungsform, Wirkung, Nutzen und Kontrolle getrennt betrachten"],
  ];
  const dontSay = ["Das ist Quatsch.", "Das ist rechte Hetze.", "Das stimmt überhaupt nicht."];
  const betterQuestions = [
    "Weißt du, welcher Teil Zuschuss und welcher Teil Kredit ist?",
    "Weißt du, ob die Kredite zurückgezahlt werden?",
    "Sollte man Wirkung, Rückzahlung und Nutzen nicht getrennt betrachten?",
  ];
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero"><div class="radar-hero-copy"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Debatten-Kompass</a> / ${pageType}</nav><p class="hero-kicker">Steuergeld, Entwicklung &amp; Mobilität</p><h1 class="hero-title">${esc(dossier.title)}</h1><p class="hero-subtitle">${esc(dossier.subtitle)}</p><p class="radar-abstract"><strong>Kurznutzen:</strong> ${esc(dossier.abstract)}</p><p class="radar-status-line"><span>Kernfrage: ${esc(financeQuestion)}</span><span>Datenstand: ${UPDATED_AT}</span></p></div></section>
      ${nav("../../../")}
      <section class="section" id="was-wird-behauptet"><div><div class="section-header"><p class="hero-kicker">Was wird behauptet?</p><h2>Die Aussage und ihre Wirkung.</h2></div><article class="card"><p class="card-kicker">Narrativ</p><h3 class="card-title">${esc(dossier.claim)}</h3><p class="card-text"><strong>Implizite Botschaft:</strong> Deutschland verschenkt Steuergeld ins Ausland, während Probleme im Inland ungelöst bleiben.</p><p class="card-text"><strong>Emotionale Stoßrichtung:</strong> Ungerechtigkeit, Frustration, Kontrollverlust und Verteilungskonflikt.</p><p class="card-text"><strong>Kurzantwort:</strong> ${esc(dossier.answers.ten)}</p><button class="copy-chip" type="button" data-copy-text="${esc(dossier.answers.ten)}">Kurzantwort kopieren</button></article></div></section>
      <section class="section section-soft" id="host-antworten"><div><div class="section-header"><p class="hero-kicker">So antwortest du</p><h2>Kurz, mittellang und vertieft.</h2><p>Nicht moralisch abwerten. Finanzierung, Wirkung, Rückzahlung, Nutzen und Risiko trennen.</p></div><div class="radar-answer-accordion host-answer-tabs"><details class="radar-answer-item" open><summary><span class="radar-answer-time">Kurzantwort</span><span class="radar-answer-label">${words(dossier.answers.comment)} Wörter</span></summary><p>${esc(dossier.answers.comment)}</p><button class="copy-chip" type="button" data-copy-text="${esc(dossier.answers.comment)}">Antwort kopieren</button></details><details class="radar-answer-item"><summary><span class="radar-answer-time">Längere Antwort</span><span class="radar-answer-label">${words(dossier.answers.thirty)} Wörter</span></summary><p>${esc(dossier.answers.thirty)}</p><button class="copy-chip" type="button" data-copy-text="${esc(dossier.answers.thirty)}">Antwort kopieren</button></details><details class="radar-answer-item"><summary><span class="radar-answer-time">Vertiefung</span><span class="radar-answer-label">${words(dossier.answers.two)} Wörter</span></summary><p>${esc(dossier.answers.two)}</p><button class="copy-chip" type="button" data-copy-text="${esc(dossier.answers.two)}">Antwort kopieren</button></details><details class="radar-answer-item"><summary><span class="radar-answer-time">Ruhig kontern</span><span class="radar-answer-label">${words(dossier.answers.calm)} Wörter</span></summary><p>${esc(dossier.answers.calm)}</p><button class="copy-chip" type="button" data-copy-text="${esc(dossier.answers.calm)}">Antwort kopieren</button></details></div><div class="card-grid two"><article class="card"><p class="card-kicker">Nicht sagen</p>${list(dontSay)}</article><article class="card"><p class="card-kicker">Besser fragen</p>${list(betterQuestions)}</article></div></div></section>
      <section class="section" id="faktenkern"><div><div class="section-header"><p class="hero-kicker">Faktenkern</p><h2>Was man sauber trennen muss.</h2></div>${accordionCards(dossier.points, "Fakt")}</div></section>
      <section class="section section-soft" id="folgencheck"><div><div class="section-header"><p class="hero-kicker">Folgencheck</p><h2>Was dieses Narrativ bewirkt.</h2></div>${accordionCards(consequences, "Folge")}<article class="card"><p class="card-kicker">Ergebnis</p><p class="card-text">Das Narrativ reduziert eine komplexe internationale Finanzierungs- und Wirkungsfrage auf ein einzelnes Spottbild. Dadurch gehen wichtige Informationen über Rückzahlung, Kontrolle, Nutzen und globale Wirkung verloren.</p></article></div></section>
      <section class="section" id="wirkpfad"><div><div class="section-header"><p class="hero-kicker">Wirkpfad</p><h2>Vom Bild zur Wirkung.</h2></div>${accordionCards(wirkpfad, "Schritt")}</div></section>
      <section class="section section-soft" id="kritische-fragen"><div><div class="section-header"><p class="hero-kicker">Kritik richtig stellen</p><h2>Was berechtigt kritisch gefragt werden darf.</h2></div><article class="card">${list(dossier.criticalQuestions)}</article></div></section>
      <section class="section" id="psychologie"><div><div class="section-header"><p class="hero-kicker">Warum zieht dieses Narrativ?</p><h2>Drei Mechanismen, nicht mehr.</h2></div><div class="radar-answer-accordion host-answer-tabs">${dossier.psychology.map(([technical, simple, debateEffect, howToBypass], index) => `<details class="radar-answer-item"${index === 0 ? " open" : ""}><summary><span class="radar-answer-time">${esc(technical)}</span><span class="radar-answer-label">${esc(simple)}</span></summary><p>${esc(debateEffect)}</p><p><strong>Umgehen:</strong> ${esc(howToBypass)}</p></details>`).join("")}</div></div></section>
      <section class="section section-soft v2-trust-block" id="vertrauen"><div class="card"><p class="hero-kicker">Wirkungsökonomische Einordnung</p><p class="card-text">Die relevante Frage lautet nicht, ob ein Radweg im Ausland emotional provoziert. Die relevante Frage lautet, welche Wirkung entsteht, welche Finanzierungsform vorliegt, welche Rückzahlungen erfolgen, welche Risiken bestehen und welchen Nutzen Mensch, Planet und Demokratie daraus ziehen.</p><details class="v2-source-drawer"><summary>Sicher / prüfpflichtig anzeigen</summary><div class="card-grid two"><article class="card"><h3 class="card-title">Sicher</h3>${list(dossier.trust.sicher)}</article><article class="card"><h3 class="card-title">Prüfpflichtig</h3>${list(dossier.trust.pruefen)}</article></div></details></div></section>
      <section class="section dossier-tab-panel" id="deep-dive-quellen"><div><div class="section-header"><p class="hero-kicker">Quellenlage</p><h2>Quelle → was belegt sie?</h2><p>Datenstand: ${UPDATED_AT}. Jede Quelle ist mit Verwendung und Grenze eingeordnet.</p></div>${sourceCards(dossier.sourceKeys)}</div></section>
    </main>`;
  const folder = detail ? "detail" : "live";
  return shell({ title: `${dossier.title} | Debatten-Kompass ${pageType}`, description: dossier.subtitle, canonical: `https://wirkungsoekonomie.de/wirkungsradar/${folder}/${dossier.slug}/`, base: "../../../", main });
}

function ukrainePage(dossier, detail = false) {
  const pageType = detail ? "Detail" : "Live";
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero"><div class="radar-hero-copy"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / ${pageType}</nav><p class="hero-kicker">Steuergeld, Sicherheit &amp; Resilienz · geprüft mit positiven Beispielen</p><h1 class="hero-title">${esc(dossier.title)}</h1><p class="hero-subtitle">${esc(dossier.subtitle)}</p><p class="radar-abstract"><strong>Kurzformel:</strong> Nicht Geld weg. Sicherheit, Stabilität und Ordnung erhalten.</p><p class="radar-abstract">${esc(dossier.abstract)}</p><p class="radar-status-line"><span>Kurzurteil: ${esc(dossier.judgement)}</span><span>Datenstand: ${UPDATED_AT}</span><span>Quellenstand: AA 24.02.2026 · Bundesregierung 31.03.2026 · EU 2024-2027</span></p></div></section>
      ${nav("../../../")}
      <section class="section v2-host-cockpit" id="host-cockpit" data-v2-host-cockpit><div class="v2-cockpit-shell"><div class="v2-cockpit-head"><p class="hero-kicker">Host-Cockpit · positiv starten</p><h2>Was wurde gesagt?</h2><p class="v2-claim-line">Jemand sagt: <strong>${esc(dossier.claim)}</strong></p></div><div class="v2-cockpit-grid"><article class="v2-cockpit-card v2-card-strong"><p class="v2-badge">Kurzurteil</p><h3>${esc(dossier.judgement)}</h3></article><article class="v2-cockpit-card"><p class="v2-badge">Sag das jetzt</p><p>${esc(dossier.answers.ten)}</p><button class="copy-chip" type="button" data-copy-text="${esc(dossier.answers.ten)}">Kopieren</button></article><article class="v2-cockpit-card"><p class="v2-badge">Ein gutes Bild</p><h3>${esc(dossier.positiveExamples[0].title)}</h3><p>${esc(dossier.positiveExamples[0].hostLine)}</p><button class="copy-chip" type="button" data-copy-text="${esc(dossier.positiveExamples[0].hostLine)}">Bild kopieren</button></article><article class="v2-cockpit-card"><p class="v2-badge">Bessere Frage</p><p>${esc(dossier.question)}</p><button class="copy-chip" type="button" data-copy-text="${esc(dossier.question)}">Frage kopieren</button></article></div><div class="v2-frame-card" id="frame-nicht-uebernehmen"><p class="v2-badge">Frame nicht übernehmen</p><div><strong>Alter Frame:</strong> ${esc(dossier.oldFrame)}</div><div><strong>Neuer Frame:</strong> ${esc(dossier.newFrame)}</div><div><strong>Besser:</strong> ${esc(dossier.better)}</div><div><strong>Warum:</strong> Die Antwort nimmt Steuergeld-Sorgen ernst, bleibt aber nicht im Verlustbild. Sie öffnet Schutz, Stabilität, Sicherheit, Regeln und Folgekosten.</div></div></div></section>
      <section class="section" id="positive-beispiele"><div><div class="section-header"><p class="hero-kicker">Gute Bilder</p><h2>Erst zeigen, was stabil bleibt.</h2><p>Keine Angstbilder oben. Die Seite startet mit Alltag, Schutz, Infrastruktur und gemeinsamer Sicherheit.</p></div>${positiveExamples(dossier.positiveExamples)}</div></section>
      <section class="section section-soft" id="antwortformate"><div><div class="section-header"><p class="hero-kicker">Antwortformate</p><h2>Kurz anerkennen, sauber trennen, Wirkung prüfen.</h2></div><div class="radar-answer-accordion host-answer-tabs"><details class="radar-answer-item" open><summary><span class="radar-answer-time">Kommentar</span><span class="radar-answer-label">${words(dossier.answers.comment)} Wörter</span></summary><p>${esc(dossier.answers.comment)}</p></details><details class="radar-answer-item"><summary><span class="radar-answer-time">Live</span><span class="radar-answer-label">${words(dossier.answers.thirty)} Wörter</span></summary><p>${esc(dossier.answers.thirty)}</p></details><details class="radar-answer-item"><summary><span class="radar-answer-time">Panel</span><span class="radar-answer-label">${words(dossier.answers.two)} Wörter</span></summary><p>${esc(dossier.answers.two)}</p></details><details class="radar-answer-item"><summary><span class="radar-answer-time">Konter ohne Streit</span><span class="radar-answer-label">${words(dossier.answers.calm)} Wörter</span></summary><p>${esc(dossier.answers.calm)}</p></details></div></div></section>
      <section class="section" id="was-stimmt-was-fehlt"><div><div class="section-header"><p class="hero-kicker">Was stimmt? Was fehlt?</p><h2>Wahren Punkt anerkennen, Verlustbild öffnen.</h2></div>${cardGrid(dossier.points, "Prüfung")}</div></section>
      <section class="section section-soft v2-impact-fan" id="impact-fan" data-v2-impact-fan><div><div class="section-header"><p class="hero-kicker">Impact-Fan</p><h2>Was wirkt alles mit?</h2><p>Ukraine-Unterstützung berührt Alltag, Sicherheit, Energie, Flucht, Wirtschaft, Demokratie, Haushalt, Kontrolle und Folgekosten.</p></div>${impactFan(dossier.impactFan)}</div></section>
      <section class="section v2-psychology-lite" id="psychologie"><div><div class="section-header"><p class="hero-kicker">Psychologischer Wirkungscheck</p><h2>Warum der Satz zieht.</h2></div>${psychologyLite(dossier.psychology)}<div class="card"><p class="card-kicker">Host-Control-Moves</p>${list(["Die Frage nach Kontrolle ist richtig.", "Lass uns die Summe zerlegen.", "Was ist Zuschuss, was Kredit, was Sachleistung?", "Was schützt diese Ausgabe konkret?", "Welche Folgekosten entstehen ohne Stabilisierung?", "Nicht Deutschland gegen Ukraine - sondern Wirkung und Kontrolle."])}</div></div></section>
      <section class="section section-soft v2-consequence-stack" id="folgenkarte"><div><div class="section-header"><p class="hero-kicker">Folgenkarte</p><h2>Was passiert, wenn man dem Verlustframe folgt?</h2></div><div class="card-grid three"><article class="card"><p class="v2-badge">Sofort</p><p class="card-text">Ukraine-Hilfe wirkt wie Geldverlust. Die konkrete Wirkung verschwindet.</p></article><article class="card"><p class="v2-badge">Danach</p><p class="card-text">Zivile Stabilisierung, Schutz, Wiederaufbau und europäische Sicherheit werden gegeneinander ausgespielt.</p></article><article class="card"><p class="v2-badge">Auf Dauer</p><p class="card-text">Europa verliert Handlungsfähigkeit, Partnervertrauen und Abschreckung. Die späteren Kosten können steigen.</p></article></div><div class="section-header"><h2>Was passiert, wenn man richtig prüft?</h2></div><div class="card-grid three"><article class="card"><p class="v2-badge">Sofort</p><p class="card-text">Hilfe wird nach Zweck, Form und Wirkung sortiert.</p></article><article class="card"><p class="v2-badge">Danach</p><p class="card-text">Gute Unterstützung wird gestärkt, schlechte oder unklare Maßnahmen werden korrigiert.</p></article><article class="card"><p class="v2-badge">Auf Dauer</p><p class="card-text">Europa wird sicherer, Unterstützung wird transparenter und öffentliche Debatten werden fairer.</p></article></div></div></section>
      <section class="section" id="wirkungsgate"><div><div class="section-header"><p class="hero-kicker">Wirkungsgate</p><h2>Wann ist Ukraine-Unterstützung sinnvoll?</h2><p>Nicht jede Hilfe ist automatisch gut. Jede Hilfe muss nach Wirkung, Kontrolle und Sicherheitsnutzen geprüft werden.</p></div>${gateCards(dossier.gate)}</div></section>
      <section class="section section-soft" id="subclaims"><div><div class="section-header"><p class="hero-kicker">Subclaims</p><h2>Häufige Varianten aufklappen.</h2></div>${subclaimAccordion(dossier.subclaims)}</div></section>
      <section class="section" id="loesung"><div><div class="section-header"><p class="hero-kicker">Wirkungsökonomische Lösung</p><h2>Aus dem Verlustbild eine Wirkungskarte machen.</h2><p>Gute Kommunikation trennt Hilfeformen, zeigt Kontrolle und erklärt den besseren Zustand: Strom, Kliniken, Wasser, Verwaltung, Schutz.</p></div>${solutionCards(dossier.solution)}</div></section>
      <section class="section section-soft v2-trust-block" id="warum-vertrauen"><div class="card"><p class="hero-kicker">Warum diese Einordnung vertrauenswürdig sein soll</p><div class="v2-trust-grid"><div><strong>Datenstand</strong><span>${UPDATED_AT}</span></div><div><strong>Quellenstand</strong><span>${esc(dossier.trust.sourceStand)}</span></div><div><strong>Bilanzgrenze</strong><span>Militärisch, zivil, humanitär, finanziell, Garantie, Kredit, Sachleistung, Ausbildung, Industrieauftrag, EU-Programm.</span></div><div><strong>Gegenposition</strong><span>Kontrollkritik ist legitim. Pauschale Verlustbilder ersetzen aber keine Wirkungsprüfung.</span></div></div><details class="v2-source-drawer" open><summary>Sicher / prüfpflichtig anzeigen</summary><div class="card-grid two"><article class="card"><h3 class="card-title">Sicher</h3>${list(dossier.trust.sicher)}</article><article class="card"><h3 class="card-title">Prüfpflichtig</h3>${list(dossier.trust.pruefen)}</article></div></details></div></section>
      <section class="section dossier-tab-panel" id="deep-dive-quellen"><div><div class="section-header"><p class="hero-kicker">Quellen</p><h2>Quellenkarten statt Linkliste.</h2><p>Datenstand: ${UPDATED_AT}. Jede Quelle ist mit Verwendung und Grenze eingeordnet.</p></div>${sourceCards(dossier.sourceKeys)}</div></section>
    </main>`;
  const folder = detail ? "detail" : "live";
  return shell({ title: `${dossier.title} | Wirkungsradar ${pageType}`, description: dossier.subtitle, canonical: `https://wirkungsoekonomie.de/wirkungsradar/${folder}/${dossier.slug}/`, base: "../../../", main });
}

function livePage(dossier, detail = false) {
  if (dossier.slug === "radwege-in-peru") return radwegePage(dossier, detail);
  if (dossier.slug === "ukraine-unterstuetzung-steuergeld") return ukrainePage(dossier, detail);
  const pageType = detail ? "Detail" : "Live";
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero"><div class="radar-hero-copy"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / ${pageType}</nav><p class="hero-kicker">Steuergeld, globale Verantwortung &amp; Fairness</p><h1 class="hero-title">${esc(dossier.title)}</h1><p class="hero-subtitle">${esc(dossier.subtitle)}</p><p class="radar-abstract"><strong>Abstract:</strong> ${esc(dossier.abstract)}</p><p class="radar-status-line"><span>Kurzurteil: ${esc(dossier.judgement)}</span><span>Datenstand: ${UPDATED_AT}</span><span>Bilanzgrenze prüfen</span></p></div></section>
      ${summaryGrid([["Kurzurteil", dossier.judgement, "warning"], ["Kernregel", "Steuergeld ist nicht weg, wenn Wirkung entsteht.", "positive"], ["Noch kürzer", "Nicht Ort zählt. Wirkung zählt.", "positive"], ["Claim", dossier.claim, "neutral"]], `${dossier.title} Summary`)}
      ${nav("../../../")}
      <section class="section" id="sechs-punkte"><div><div class="section-header"><p class="hero-kicker">Das Wichtigste</p><h2>Sechs Punkte für die Wirkungsbilanz.</h2></div>${cardGrid(dossier.points, "Kernpunkt")}</div></section>
      <nav class="dossier-tab-nav" aria-label="Dossierbereiche" data-search-exclude><a href="#live-antworten">Live antworten</a><a href="#bilanzgrenze">Bilanzgrenze</a><a href="#deep-dive-quellen">Quellen</a></nav>
      <section class="section dossier-tab-panel" id="live-antworten"><div><div class="section-header"><p class="hero-kicker">Live antworten</p><h2>Wahren Kern anerkennen, falschen Gegensatz öffnen.</h2></div><div class="radar-answer-accordion host-answer-tabs"><details class="radar-answer-item" open><summary><span class="radar-answer-time">10 Sekunden</span><span class="radar-answer-label">${words(dossier.answers.ten)} Wörter</span></summary><p>„${esc(dossier.answers.ten)}“</p></details><details class="radar-answer-item"><summary><span class="radar-answer-time">30 Sekunden</span><span class="radar-answer-label">${words(dossier.answers.thirty)} Wörter</span></summary><p>„${esc(dossier.answers.thirty)}“</p></details><details class="radar-answer-item"><summary><span class="radar-answer-time">2 Minuten</span><span class="radar-answer-label">${words(dossier.answers.two)} Wörter</span></summary><p>„${esc(dossier.answers.two)}“</p></details></div><div class="card-grid two"><article class="card"><p class="card-kicker">Die bessere Frage</p><p class="card-text">${esc(dossier.question)}</p></article><article class="card"><p class="card-kicker">Frame sichtbar machen</p><p class="card-text">${esc(dossier.frame)}</p></article></div></div></section>
      <section class="section section-soft dossier-tab-panel" id="bilanzgrenze"><div><div class="section-header"><p class="hero-kicker">Bilanzgrenze prüfen</p><h2>Ausgabe, Wirkung, Rückfluss, Risiko und Unterlassungskosten.</h2><p>Der Wirkstoff dieser Narrative ist fast immer gleich: Sichtbares Steuergeld wird gegen unsichtbare Wirkungsgewinne ausgespielt. Wirkungsökonomisch zählt die Netto-Wirkung, nicht der Ort der Ausgabe allein.</p></div>${cardGrid([["Was stimmt?", "Öffentliche Mittel sind begrenzt. Ausgaben brauchen Transparenz, Priorisierung, Wirkungskontrolle und Missbrauchsschutz."], ["Was fehlt?", "Systemnutzen, Risikovermeidung, Rückflüsse, Kredite, Sicherheit, Klima, Handel, Stabilität und Unterlassungskosten verschwinden oft."], ["WÖk-Lösung", "Wirkungshaushalt, T-SROI, Additionality, Kredite/Zuschüsse trennen, Rückflüsse zeigen, Unterlassungskosten berechnen, Missbrauchsschutz sichern."]], "Prüfschritt")}</div></section>
      <section class="section dossier-tab-panel" id="psychologie"><div><div class="section-header"><p class="hero-kicker">Psychologischer Wirkungscheck</p><h2>Warum der Satz zieht.</h2></div>${summaryGrid([["Verlustaversion", "Geldabfluss wirkt stärker als abstrakter Nutzen.", "warning"], ["Nullsummendenken", "Ausgabe dort wirkt automatisch wie Verlust hier.", "warning"], ["Ingroup/Outgroup", "„Wir“ gegen „die anderen“ macht Verteilung emotional.", "warning"], ["Kontrolle zurückholen", "Zuschuss, Kredit, Wirkung und Unterlassungskosten getrennt prüfen.", "positive"]], "Psychologie Steuergeld")}</div></section>
      <section class="section section-soft dossier-tab-panel" id="deep-dive-quellen"><div><div class="section-header"><p class="hero-kicker">Quellen</p><h2>Quellenkarten statt Linkliste.</h2><p>Datenstand: ${UPDATED_AT}. Jede Quelle ist mit Verwendung und Grenze eingeordnet.</p></div>${sourceCards(dossier.sourceKeys)}</div></section>
    </main>`;
  const folder = detail ? "detail" : "live";
  return shell({ title: `${dossier.title} | Wirkungsradar ${pageType}`, description: dossier.subtitle, canonical: `https://wirkungsoekonomie.de/wirkungsradar/${folder}/${dossier.slug}/`, base: "../../../", main });
}

function clusterPage() {
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero"><div class="radar-hero-copy"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / Themen</nav><p class="hero-kicker">Themencluster</p><h1 class="hero-title">${esc(clusterTitle)}</h1><p class="hero-subtitle">${esc(clusterSubtitle)}</p><p class="radar-abstract"><strong>Abstract:</strong> ${esc(clusterAbstract)}</p><p class="radar-status-line"><span>v2-Prüfung läuft</span><span>Datenstand: ${UPDATED_AT}</span><span>Nicht Ort zählt. Wirkung zählt.</span></p></div></section>
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
  const withoutOld = html.replace(new RegExp(`\\n?<section class="section(?: section-soft)?" id="${marker}"[\\s\\S]*?<\\/section>\\n?`, "g"), "\n");
  if (withoutOld.includes(marker)) return;
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
  const sourceMap = Object.fromEntries(sources.map(([label, key, url, useFor, warning]) => [key, { label, url, use_for: Array.isArray(useFor) ? useFor : [useFor], warning }]));
  writeFile("content/wirkungsradar/source-packs/tax-money-global-responsibility-v1.yaml", `# Generated by scripts/wirkungsradar/build-tax-money-global-responsibility-cluster.mjs\n${toYaml({ id: "tax-money-global-responsibility-v1", last_verified: UPDATED_AT, update_frequency: "quarterly", sources: sourceMap }).trim()}\n`);
}

function writeRadwegeSourcePack() {
  const radwege = dossiers.find((item) => item.slug === "radwege-in-peru");
  const sourceMap = Object.fromEntries(sources
    .filter(([, key]) => radwege.sourceKeys.includes(key))
    .map(([label, key, url, useFor, warning]) => [key, { label, url, use_for: Array.isArray(useFor) ? useFor : [useFor], warning }]));
  writeFile("content/wirkungsradar/source-packs/radwege-peru-v1.yaml", `# Generated by scripts/wirkungsradar/build-tax-money-global-responsibility-cluster.mjs\n${toYaml({ id: "radwege-peru-v1", last_verified: UPDATED_AT, update_frequency: "quarterly", sources: sourceMap }).trim()}\n`);
}

function writeUkraineSourcePack() {
  const ukraine = dossiers.find((item) => item.slug === "ukraine-unterstuetzung-steuergeld");
  const sourceMap = Object.fromEntries(sources
    .filter(([, key]) => ukraine.sourceKeys.includes(key))
    .map(([label, key, url, useFor, warning]) => [key, { label, url, use_for: Array.isArray(useFor) ? useFor : [useFor], warning }]));
  writeFile("content/wirkungsradar/source-packs/ukraine-support-v1.yaml", `# Generated by scripts/wirkungsradar/build-tax-money-global-responsibility-cluster.mjs\n${toYaml({ id: "ukraine-support-v1", last_verified: UPDATED_AT, update_frequency: "quarterly", sources: sourceMap }).trim()}\n`);
}

function augmentIndexes() {
  injectBeforeMainEnd("wirkungsradar/themen/index.html", clusterSlug, `<section class="section section-soft" id="${clusterSlug}"><div><div class="section-header"><p class="hero-kicker">Steuergeld &amp; globale Verantwortung</p><h2>Neuer Themencluster.</h2></div><div class="card-grid"><a class="card text-link-card" href="${clusterSlug}/"><p class="card-kicker">Nicht Ort zählt. Wirkung zählt.</p><h3 class="card-title">${esc(clusterTitle)}</h3><p class="card-text">${esc(clusterSubtitle)}</p></a></div></div></section>`);
  injectBeforeMainEnd("wirkungsradar/live/index.html", "steuergeld-globale-verantwortung-live", `<section class="section section-soft" id="steuergeld-globale-verantwortung-live"><div><div class="section-header"><p class="hero-kicker">Steuergeld, globale Verantwortung &amp; Fairness</p><h2>4 neue Live-Karten.</h2></div><div class="card-grid">${dossiers.map((item) => `<a class="card text-link-card radar-live-card" href="${esc(item.slug)}/"><p class="card-kicker">${esc(item.judgement)}</p><h3 class="card-title">${esc(item.title)}</h3><p class="card-text"><strong>10 Sekunden:</strong> ${esc(item.answers.ten)}</p></a>`).join("")}</div></div></section>`);
  injectBeforeMainEnd("wirkungsradar/detail/index.html", "steuergeld-globale-verantwortung-detail", `<section class="section section-soft" id="steuergeld-globale-verantwortung-detail"><div><div class="section-header"><p class="hero-kicker">Steuergeld, globale Verantwortung &amp; Fairness</p><h2>4 neue Deep Dives.</h2></div><div class="card-grid">${dossiers.map((item) => `<a class="card text-link-card" href="${esc(item.slug)}/"><p class="card-kicker">${esc(item.judgement)}</p><h3 class="card-title">${esc(item.title)}</h3><p class="card-text">${esc(item.subtitle)}</p></a>`).join("")}</div></div></section>`);
  updateLiveIndexCount();
}

writeSourcePack();
writeRadwegeSourcePack();
writeUkraineSourcePack();
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

console.log(`Built tax-money-global-responsibility cluster: ${dossiers.length} live dossiers, ${dossiers.length} detail pages, 1 topic cluster, 1 narrative, ${glossaryTerms.length} glossary pages.`);
