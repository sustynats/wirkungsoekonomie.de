import fs from "node:fs";
import path from "node:path";

const UPDATED_AT = "2026-06-04";
const ASSET_VERSION = "20260604-radwege-peru-v2";
const clusterSlug = "steuergeld-globale-verantwortung-fairness";
const clusterTitle = "Steuergeld, globale Verantwortung & Fairness";
const clusterSubtitle = "Warum „unser Geld geht weg“ oft die falsche Bilanzgrenze setzt.";
const clusterAbstract =
  "Viele politische Narrative funktionieren über denselben Impuls: Steuergeld wird als knappe Ressource gezeigt, die angeblich „für andere“ ausgegeben wird, während „wir hier“ Probleme haben. Diese Sorge ist nicht falsch: Öffentliche Mittel sind begrenzt und müssen wirksam, transparent und kontrolliert eingesetzt werden. Irreführend wird das Narrativ, wenn es falsche Gegensätze baut: Inland gegen Ausland, Bauern gegen Radwege, Rentner gegen Ukraine, Arme gegen Migrant:innen, Steuerzahler gegen Entwicklungszusammenarbeit, Mittelstand gegen Reiche. Wirkungsökonomisch lautet die bessere Frage: Welche Ausgabe erzeugt welche Netto-Wirkung, welche Risiken vermeidet sie, welche Folgekosten senkt sie und welche Zustände verbessert sie für Mensch, Planet und Demokratie?";

const sources = [
  ["BMZ - Nachhaltige Mobilität in Lima", "bmz_lima_mobilitaet", "https://www.bmz.de/de/laender/peru/nachhaltige-mobilitaet-in-lima", ["20 Mio. Euro Zuschuss für Radwege in Lima", "bis zu 24 Mio. Euro weitere Zusage 2022", "114 km Radwege geplant; erste rund 30 km gebaut", "Radwege als Teil integrierter Verkehrssysteme und Zubringer zu Bus und Metro", "Nutzen für Mobilität, Gesundheit, Klima, Wirtschaft und internationale Beziehungen"], "BMZ ist Ministeriumsquelle; bei Kritik und Umsetzung zusätzlich KfW-Projektdaten und unabhängige Evaluierungen prüfen."],
  ["KfW - Fakten zur Entwicklungszusammenarbeit", "kfw_entwicklungszusammenarbeit", "https://www.kfw.de/%C3%9Cber-die-KfW/Newsroom/Aktuelles/Entwicklungszusammenarbeit.html", ["KfW-Förderkredite", "weniger als die Hälfte der KfW-Zusagen stammt aus Bundeshaushalt", "überwiegend Kredite", "Kreditnehmer zahlen verzinst zurück", "Metro als Hauptposten in Lima", "Radwege als ergänzende Maßnahme", "deutsche Unternehmen mit Aufträgen", "internationale Kooperation im deutschen Interesse"], "KfW ist Umsetzungs- und Finanzierungsakteur; Angaben durch externe Evaluierungen ergänzen."],
  ["KfW Projektdatenbank - Fahrradwegnetz Lima", "kfw_projektdatenbank_radweg_lima", "https://www.kfw-entwicklungsbank.de/ipfz/Projektdatenbank/Aufbau-Eines-Fahrradwegnetzes-Im-Metropolbereich-Lima-35874.htm", ["Projektbeschreibung", "Anbindung an Schnellbus- und Metrolinien", "Teilhabe ärmerer Bevölkerung", "Umwelt- und Sozialverträglichkeit", "deutscher Finanzierungsbeitrag 20 Mio. EUR", "Projektpartner Municipalidad Metropolitana de Lima"], "Projektstatus aktiv; Baufortschritt und Nutzung regelmäßig aktualisieren."],
  ["KfW Entwicklungsbank - Transparenzportal", "kfw_transparenzportal", "https://www.kfw-entwicklungsbank.de/Internationale-Finanzierung/KfW-Entwicklungsbank/Transparenz/", ["Projekttransparenz", "Daten zu Finanzierungen", "Kontrolle und Evaluierung"], "Konkrete Projektdaten auffindbar halten."],
  ["BMZ - Transparenzportal", "bmz_transparenzportal", "https://www.bmz.de/de/ministerium/zahlen-fakten/bmz-transparenzportal", ["Transparenz öffentlicher Entwicklungszusammenarbeit", "Projekt- und Finanzdaten"], "Bei jeder Aktualisierung Datenstand prüfen."],
  ["KfW - Evaluierungen", "kfw_evaluierung", "https://www.kfw-entwicklungsbank.de/Evaluierung/", ["Wirkungsprüfung", "Lernen aus Projekten", "Qualitätssicherung"], "Falls keine projektspezifische Evaluierung vorliegt, klar sagen: noch nicht abschließend evaluiert."],
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
    subtitle: "Nicht Spottbild. Wirkungsfrage.",
    judgement: "Spottbild statt Wirkungsprüfung.",
    status: "checked_v2_positive_examples",
    claim: "Deutschland bezahlt Radwege in Peru?",
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
      "Das Radwege-in-Peru-Narrativ macht ein einzelnes, leicht verspottbares Bild zum Symbol angeblicher Steuergeldverschwendung. Der wahre Kern ist: Öffentliche Mittel im Ausland müssen gut begründet, transparent, kontrolliert und wirksam eingesetzt werden. Der Denkfehler ist: Aus einem Infrastrukturprojekt wird ein Lächerlichkeitsbild gemacht, während Nutzen, Finanzierungsform, Kredite, Rückzahlungen, Klimaeffekte, Verkehrssicherheit, Entwicklungswirkung, deutsche Wirtschaftsinteressen und internationale Partnerschaft unsichtbar werden.",
    points: [
      ["Was stimmt?", "Öffentliche Mittel müssen transparent, kontrolliert und wirksam eingesetzt werden. Zuschüsse und Kredite müssen klar unterschieden werden. Nicht jedes Entwicklungsprojekt ist automatisch gut."],
      ["Was fehlt?", "Radwege in Lima sind Teil eines integrierten Verkehrssystems. Es geht um sichere Wege zu Bus, Metro, Schule, Ausbildung, Arbeit und Markt."],
      ["Zuschuss und Kredit trennen", "Deutschland bezuschusst Radwege in Lima mit 20 Mio. Euro. Größere Mobilitätsbestandteile laufen als Entwicklungskredite und sind rückzahlbar."],
      ["Nicht nur Peru profitiert", "Kooperation kann Klima, Handel, Standards, Aufträge, Partnerschaft und Stabilität stärken. Gute Entwicklungspolitik ist kein Almosen, sondern Partnerschaft."],
      ["Kritik bleibt möglich", "Schlecht geplante, schlecht genutzte oder intransparente Projekte muss man kritisieren. Aber Kritik braucht Projektdaten, nicht Spottwert."],
      ["Kernsatz", "Der wahre Punkt ist Kontrolle. Der falsche Sprung ist Spott statt Prüfung."],
    ],
    answers: {
      ten: "Bei Radwegen in Peru geht es nicht um Luxus, sondern um sichere Wege zu Metro, Bus, Schule und Arbeit. Entscheidend ist: Was bewirkt das Projekt - und wird es sauber kontrolliert?",
      thirty:
        "Der wahre Punkt ist: Öffentliches Geld muss gut geprüft werden. Der falsche Sprung ist, ein Projekt im Ausland lächerlich zu machen, bevor man seine Wirkung anschaut. Bei Lima geht es um sichere Wege zu Bus, Metro, Schule und Arbeit. Entscheidend ist: Zuschuss oder Kredit, Kontrolle, Nutzen und Wirkung.",
      two:
        "Das Radwege-in-Peru-Narrativ funktioniert, weil es ein einfaches Spottbild liefert: Dort Radwege, hier Probleme. Aber so einfach ist die Rechnung nicht. In Lima geht es nicht um ein paar beliebige Fahrradstreifen, sondern um nachhaltige Mobilität in einer Millionenstadt: Radwege als Zubringer zu Bus, Metro, Schule, Arbeit und Ausbildung. Ein Teil ist Zuschuss, andere Mobilitätsbestandteile laufen über rückzahlbare Entwicklungskredite. Das muss transparent sein und geprüft werden. Die bessere Frage lautet also nicht: Warum zahlen wir für Peru? Sondern: Was bewirkt das Projekt konkret? Hilft es Menschen, günstiger und sicherer zur Arbeit zu kommen? Senkt es Stau und Luftbelastung? Ist es Teil eines Verkehrssystems? Wird das Geld in Tranchen und nach Fortschritt ausgezahlt? Gibt es Kontrolle? Und hat Deutschland dadurch auch Klima-, Wirtschafts- und Partnerschaftsnutzen? Gute Entwicklungspolitik ist kein Wegwerfen von Geld. Sie ist ein Werkzeug für Stabilität, Klimaschutz, Handel, Vertrauen und Zusammenarbeit. Schlechte Projekte muss man kritisieren. Aber aus einem einzelnen Schlagwort ein Pauschalurteil gegen internationale Zusammenarbeit zu machen, ist keine Haushaltskontrolle. Es ist ein Frame.",
      comment:
        "Radwege in Lima sind kein Luxusbild, sondern Teil eines Verkehrssystems zu Bus, Metro, Schule und Arbeit. Die richtige Frage ist nicht Spott, sondern Wirkung: Was bewirkt es, wer zahlt was, und wie wird es kontrolliert?",
      calm:
        "Ich verstehe den Reflex: Man fragt sich, warum Geld ins Ausland geht, wenn hier auch viel fehlt. Aber lass uns das Projekt prüfen: Ist es Zuschuss oder Kredit? Was bewirkt es? Wird es kontrolliert? Und welchen Nutzen hat es auch für Deutschland?",
    },
    question: "Was bewirkt das Projekt konkret - und wird es transparent, kontrolliert und wirksam umgesetzt?",
    frame: "Die Frage ist nicht Inland gegen Ausland. Die Frage ist: Welche Projekte erzeugen nachweisbare Wirkung - hier und dort?",
    oldFrame: "Deutschland verschenkt Steuergeld für absurde Projekte im Ausland.",
    newFrame: "Deutschland investiert in geprüfte Wirkung, wenn ein Projekt transparent, kontrolliert und nützlich ist.",
    better:
      "Ein Haushalt wird nicht besser, wenn wir jedes Auslandsprojekt verspotten. Er wird besser, wenn jede Ausgabe Wirkung nachweist.",
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
      ["Finanzierung", "Zuschüsse und Kredite sind unterschiedliche Dinge.", "Rückzahlbare Entwicklungskredite sind kein Geschenk."],
      ["Vertrauen", "Transparenz entscheidet, ob Zusammenarbeit glaubwürdig bleibt.", "Datenstand, Tranchen, Kontrolle, Evaluierung."],
      ["Demokratie", "Spottframes schwächen sachliche Haushaltsdebatten.", "Ein Schlagwort ersetzt Prüfung."],
    ],
    psychology: [
      ["Lächerlichkeitsframe", "Das Beispiel klingt sofort lächerlich.", "Menschen prüfen nicht mehr die Wirkung, sondern lachen über das Bild.", "Nicht das Spottbild wiederholen. Den konkreten Nutzen zeigen."],
      ["Nullsummenfehler", "Es fühlt sich an, als würde uns etwas weggenommen.", "Aus jedem Euro im Ausland wird gefühlt ein fehlender Euro in der eigenen Straße.", "Zuschuss, Kredit, Budget, Rückzahlung und Wirkung trennen."],
      ["Nahbereichsbias", "Das Nahe fühlt sich wichtiger an als das Ferne.", "Globale Klima-, Handels- und Stabilitätswirkungen wirken abstrakt.", "Ein positives Alltagsbild zeigen: sicher zur Schule, Arbeit, Metro."],
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
      ["315 Millionen Euro für Radwege in Peru", "Zahl, Zweck und Finanzierung werden vermischt.", "Diese Erzählung funktioniert, weil eine große Zahl mit einem kleinen Bild verbunden wird. Richtig ist: Deutschland unterstützt in Peru nachhaltige Mobilität. Dazu gehören Metro, Bus, integrierte Verkehrssysteme und Radwege. Radwege in Lima sind ein deutlich kleinerer Zuschussbestandteil. Andere Mittel sind Kredite oder betreffen andere Verkehrsprojekte. Deshalb muss man sauber trennen: Was ist Zuschuss? Was ist Kredit? Was ist Metro? Was ist Bus? Was ist Radweg? Und was wird zurückgezahlt?", "Die Zahl allein erklärt nichts. Man muss trennen: Zuschuss, Kredit, Metro, Bus, Radweg und Rückzahlung.", "Welche Summe ist Zuschuss, welche ist Kredit, und welcher Teil geht wirklich in Radwege?"],
      ["Erst Schulen hier, dann Radwege dort", "Berechtigter Frust, falsches Entweder-oder.", "Viele Menschen erleben marode Schulen, kaputte Brücken oder schlechte Bahnverbindungen. Dieser Frust ist real. Aber er wird falsch gelenkt, wenn jedes Auslandsprojekt automatisch als Ursache deutscher Probleme gilt. Deutschland kann und muss im Inland investieren. Gleichzeitig können internationale Projekte sinnvoll sein, wenn sie Klima, Stabilität, Handel, Sicherheit und Partnerschaft stärken.", "Unsere Schulen müssen besser werden. Aber ein gutes Auslandsprojekt ist nicht automatisch der Grund, warum hier etwas kaputt ist.", "Welche Investitionen fehlen hier - und welche internationalen Projekte erzeugen nachweislich Nutzen?"],
      ["Entwicklungshilfe bringt Deutschland nichts", "Zu eng gedacht.", "Deutschland ist stark in internationale Lieferketten, Handel, Sicherheit und Klimafragen eingebunden. Wenn Städte in Partnerländern besser funktionieren, Märkte stabiler werden, Klimaschutz vorankommt und demokratische Partnerschaften wachsen, wirkt das auch auf Deutschland zurück. Das bedeutet nicht, dass jedes Projekt gut ist. Aber es bedeutet: Der Nutzen endet nicht an der Landesgrenze.", "Deutschland lebt von Handel, Stabilität und Kooperation. Gute Entwicklungspolitik ist auch Eigeninteresse.", "Stärkt das Projekt Stabilität, Klima, Handel oder Partnerschaft - und ist die Wirkung belegt?"],
      ["Das Geld wird verschenkt", "Oft falsch oder unvollständig.", "Entwicklungsfinanzierung besteht nicht nur aus Zuschüssen. Es gibt auch Darlehen, Förderkredite, Eigenmittel, Mischfinanzierung und Rückzahlungen. Ein Zuschuss muss besonders gut begründet werden. Ein Kredit muss tragfähig sein und zurückgezahlt werden. Beides muss kontrolliert werden.", "Nicht alles ist Geschenk. Viele Mittel sind Kredite. Und bei Zuschüssen zählt: Was bewirken sie konkret?", "Ist es Zuschuss, Kredit oder Mischfinanzierung - und wie wird die Wirkung geprüft?"],
      ["Solche Projekte sind nur Symbolpolitik", "Prüfbar statt pauschal.", "Symbolpolitik erkennt man nicht am Ort des Projekts, sondern an fehlender Wirkung. Entscheidend sind Nutzung, Kosten, Kontrolle, Systemnutzen, Standards und Evaluierung. Wenn ein Projekt diese Prüfung nicht besteht, muss es verbessert oder beendet werden. Wenn es sie besteht, sollte es nicht durch ein Spottbild entwertet werden.", "Gute Kritik fragt nach Nutzung, Kontrolle und Wirkung - nicht nach Spottwert.", "Welche Ziele, Nutzungsdaten und Kontrollberichte liegen vor?"],
    ],
    solution: [
      ["Wirkungskarte für jedes Auslandsprojekt", "Jedes Projekt zeigt auf einer öffentlichen Seite Zweck, Betrag, Finanzierungsform, Partner, Baufortschritt, Wirkung und Quellen."],
      ["Zuschuss und Kredit sichtbar trennen", "Menschen müssen sofort sehen: Was ist Zuschuss? Was ist Darlehen? Was wird zurückgezahlt? Wer trägt Risiko?"],
      ["Positive Beispiele statt Spottbilder", "Kommunikation erklärt nicht nur Zahlen, sondern den besseren Alltag: sicher zur Schule, zur Arbeit, zur Metro, zum Markt."],
      ["Wirkung vor Auszahlung prüfen", "Tranchen werden an Fortschritt, Standards und Wirkung gekoppelt."],
      ["Kontrolle öffentlich machen", "Umwelt- und Sozialprüfung, Vergabe, Beschwerdemechanismus und Evaluierung werden leicht auffindbar."],
      ["Deutschland-Nutzen offenlegen", "Klima, Stabilität, Handel, Partnerschaft, Aufträge und strategische Beziehungen werden transparent erklärt."],
      ["Lernschleife einbauen", "Was funktioniert, wird skaliert. Was nicht funktioniert, wird beendet oder angepasst."],
      ["Kommunikation entgiften", "Nicht moralisch verteidigen, sondern sauber erklären: Wirkung, Kontrolle, Finanzierungsform, Nutzen."],
    ],
    trust: {
      sourceStand: "BMZ-Seite Stand 14.02.2025; KfW-Seite Stand 25.09.2025.",
      sicher: ["Radwege in Lima sind Teil eines integrierten Verkehrssystems.", "Deutschland bezuschusst Radwege in Lima mit 20 Mio. Euro.", "Weitere bis zu 24 Mio. Euro wurden 2022 für integrierte Verkehrssysteme einschließlich Radwegen in weiteren Städten zugesagt.", "Entwicklungskredite für das Schnellbussystem sind rückzahlbar.", "KfW-Förderkredite werden überwiegend über den Kapitalmarkt refinanziert und von Kreditnehmern verzinst zurückgezahlt."],
      pruefen: ["Konkrete Nutzung der neu gebauten Radwege nach Fertigstellung.", "Baufortschritt je Abschnitt.", "Langfristige Verkehrswirkung.", "Wirtschaftliche Aufträge im weiteren Projektverlauf.", "Qualität der lokalen Umsetzung."],
    },
    sourceKeys: ["bmz_lima_mobilitaet", "kfw_entwicklungszusammenarbeit", "kfw_projektdatenbank_radweg_lima", "kfw_transparenzportal", "bmz_transparenzportal", "kfw_evaluierung"],
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
  ["entwicklungskredit", "Entwicklungskredit", "Kredit für ein Entwicklungsprojekt, der zurückgezahlt werden muss und oft zu günstigeren Konditionen vergeben wird.", "Ein Entwicklungskredit ist kein Geschenk. Er muss bedient werden."],
  ["zuschuss", "Zuschuss", "Öffentliche Finanzierung, die nicht zurückgezahlt wird.", "Zuschüsse brauchen besonders klare Begründung und Wirkungsprüfung."],
  ["laecherlichkeitsframe", "Lächerlichkeitsframe", "Kommunikationsmuster, das ein Projekt über ein spöttisches Bild entwertet, bevor seine Wirkung geprüft wird.", "Spott ersetzt keine Wirkungsprüfung."],
  ["nullsummenfehler", "Nullsummenfehler", "Denkfehler, bei dem jede Ausgabe an einem Ort automatisch als Verlust an einem anderen Ort erlebt wird.", "Haushalte brauchen Prioritäten, aber nicht jede internationale Ausgabe ist automatisch ein Verlust im Inland."],
  ["nahbereichsbias", "Nahbereichsbias", "Tendenz, nahe Probleme stärker wahrzunehmen als weiter entfernte Wirkungen, auch wenn diese zurückwirken.", "Das Nahe fühlt sich wichtiger an. Das Ferne kann trotzdem auf uns zurückwirken."],
  ["internationale-zusammenarbeit", "Internationale Zusammenarbeit", "Kooperation zwischen Staaten und Institutionen, um gemeinsame Probleme wie Klima, Gesundheit, Handel, Sicherheit und Entwicklung zu lösen.", "Gute Zusammenarbeit ist kein Almosen, sondern gemeinsame Problemlösung."],
  ["wirkungshaushalt-ausland", "Wirkungshaushalt für Auslandsprojekte", "Haushaltslogik, die Auslandsprojekte nach Zweck, Finanzierungsform, Kontrolle, Rückzahlung, Nutzen und langfristiger Wirkung bewertet.", "Nicht Spott entscheidet, sondern nachweisbare Wirkung."],
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
  return `<div class="card-grid">${items.map(([label, key, url, useFor, warning]) => `<article class="card" id="quelle-${esc(key)}"><p class="card-kicker">Quelle vorbereiten</p><h3 class="card-title">${esc(label)}</h3>${Array.isArray(useFor) ? `<ul class="clean-list">${useFor.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>` : `<p class="card-text"><strong>Verwendet für:</strong> ${esc(useFor)}</p>`}<p class="card-text"><strong>Grenze:</strong> ${esc(warning)}</p><p><a class="text-link" href="${esc(url)}">Quelle öffnen</a></p></article>`).join("")}</div>`;
}

function list(items) {
  return `<ul class="clean-list">${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
}

function positiveExamples(examples) {
  return `<div class="card-grid three">${examples.map((item) => `<article class="card"><p class="card-kicker">Positives Beispiel</p><h3 class="card-title">${esc(item.title)}</h3><p class="card-text">${esc(item.situation)}</p><p class="card-text"><strong>Host-Satz:</strong> ${esc(item.hostLine)}</p><details class="v2-source-drawer"><summary>Was wird besser?</summary>${list(item.getsBetter)}<p class="card-text"><strong>Warum es wirkt:</strong> ${esc(item.whyItWorks)}</p></details></article>`).join("")}</div>`;
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
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero"><div class="radar-hero-copy"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / ${pageType}</nav><p class="hero-kicker">Steuergeld, Entwicklung &amp; Mobilität · ${esc(dossier.status)}</p><h1 class="hero-title">${esc(dossier.title)}</h1><p class="hero-subtitle">${esc(dossier.subtitle)}</p><p class="radar-abstract"><strong>Kurzformel:</strong> Nicht Geld weg. Wirkung prüfen.</p><p class="radar-abstract">${esc(dossier.abstract)}</p><p class="radar-status-line"><span>Kurzurteil: ${esc(dossier.judgement)}</span><span>Datenstand: ${UPDATED_AT}</span><span>Quellenstand: BMZ 14.02.2025 · KfW 25.09.2025</span></p></div></section>
      ${nav("../../../")}
      <section class="section v2-host-cockpit" id="host-cockpit" data-v2-host-cockpit><div class="v2-cockpit-shell"><div class="v2-cockpit-head"><p class="hero-kicker">Host-Cockpit · Maus-Modus</p><h2>Was wurde gesagt?</h2><p class="v2-claim-line">Jemand sagt: <strong>${esc(dossier.claim)}</strong></p></div><div class="v2-cockpit-grid"><article class="v2-cockpit-card v2-card-strong"><p class="v2-badge">Kurzurteil</p><h3>${esc(dossier.judgement)}</h3></article><article class="v2-cockpit-card"><p class="v2-badge">Sag das jetzt</p><p>${esc(dossier.answers.ten)}</p><button class="copy-chip" type="button" data-copy-text="${esc(dossier.answers.ten)}">Kopieren</button></article><article class="v2-cockpit-card"><p class="v2-badge">Positives Beispiel</p><h3>${esc(dossier.positiveExamples[0].title)}</h3><p>${esc(dossier.positiveExamples[0].hostLine)}</p><button class="copy-chip" type="button" data-copy-text="${esc(dossier.positiveExamples[0].hostLine)}">Beispiel kopieren</button></article><article class="v2-cockpit-card"><p class="v2-badge">Bessere Frage</p><p>${esc(dossier.question)}</p><button class="copy-chip" type="button" data-copy-text="${esc(dossier.question)}">Frage kopieren</button></article></div><div class="v2-frame-card" id="frame-nicht-uebernehmen"><p class="v2-badge">Frame nicht übernehmen</p><div><strong>Alter Frame:</strong> ${esc(dossier.oldFrame)}</div><div><strong>Neuer Frame:</strong> ${esc(dossier.newFrame)}</div><div><strong>Besser:</strong> ${esc(dossier.better)}</div><div><strong>Warum:</strong> Die Antwort verteidigt nicht blind. Sie verschiebt vom Spottbild zur Wirkungsprüfung.</div></div></div></section>
      <section class="section" id="positive-beispiele"><div><div class="section-header"><p class="hero-kicker">Positive Beispiele</p><h2>Erst den besseren Alltag zeigen.</h2><p>Nicht beim Spottbild starten. Zeigen, was ein gutes Projekt konkret verändert.</p></div>${positiveExamples(dossier.positiveExamples)}</div></section>
      <section class="section section-soft" id="antwortformate"><div><div class="section-header"><p class="hero-kicker">Antwortformate</p><h2>Kurz sagen. Dann vertiefen.</h2></div><div class="radar-answer-accordion host-answer-tabs"><details class="radar-answer-item" open><summary><span class="radar-answer-time">Kommentar</span><span class="radar-answer-label">${words(dossier.answers.comment)} Wörter</span></summary><p>${esc(dossier.answers.comment)}</p></details><details class="radar-answer-item"><summary><span class="radar-answer-time">Live</span><span class="radar-answer-label">${words(dossier.answers.thirty)} Wörter</span></summary><p>${esc(dossier.answers.thirty)}</p></details><details class="radar-answer-item"><summary><span class="radar-answer-time">Panel</span><span class="radar-answer-label">${words(dossier.answers.two)} Wörter</span></summary><p>${esc(dossier.answers.two)}</p></details><details class="radar-answer-item"><summary><span class="radar-answer-time">Konter ohne Streit</span><span class="radar-answer-label">${words(dossier.answers.calm)} Wörter</span></summary><p>${esc(dossier.answers.calm)}</p></details></div></div></section>
      <section class="section" id="was-stimmt-was-fehlt"><div><div class="section-header"><p class="hero-kicker">Was stimmt? Was fehlt?</p><h2>Wahren Punkt anerkennen, falschen Sprung öffnen.</h2></div>${cardGrid(dossier.points, "Prüfung")}</div></section>
      <section class="section section-soft v2-impact-fan" id="impact-fan" data-v2-impact-fan><div><div class="section-header"><p class="hero-kicker">Was wirkt alles mit?</p><h2>Die ganze Rechnung öffnen.</h2><p>Radwege sind hier nicht das Spottbild, sondern ein Teil von Mobilität, Teilhabe, Gesundheit, Klima, Wirtschaft und Partnerschaft.</p></div>${impactFan(dossier.impactFan)}</div></section>
      <section class="section v2-psychology-lite" id="psychologie"><div><div class="section-header"><p class="hero-kicker">Psychologischer Wirkungscheck</p><h2>Warum der Satz zieht.</h2></div>${psychologyLite(dossier.psychology)}<div class="card"><p class="card-kicker">Host-Control-Moves</p>${list(["Lass uns nicht über das Schlagwort lachen, sondern die Wirkung prüfen.", "Ist es Zuschuss oder Kredit?", "Wird es kontrolliert?", "Was verbessert sich konkret?", "Welchen Nutzen hat das für Menschen dort und für Deutschland?"])}</div></div></section>
      <section class="section section-soft v2-consequence-stack" id="folgenkarte"><div><div class="section-header"><p class="hero-kicker">Folgenkarte</p><h2>Was passiert, wenn man dem Frame folgt?</h2></div><div class="card-grid three"><article class="card"><p class="v2-badge">Sofort</p><p class="card-text">Ein Projekt wird zum Spottbild. Die genaue Wirkung interessiert kaum noch.</p></article><article class="card"><p class="v2-badge">Danach</p><p class="card-text">Internationale Zusammenarbeit wirkt wie Verschwendung, auch wenn Kredite zurückfließen oder Projekte Nutzen erzeugen.</p></article><article class="card"><p class="v2-badge">Auf Dauer</p><p class="card-text">Deutschland verliert Vertrauen, Partner, Einfluss und gemeinsame Lösungskraft bei Klima, Handel und Sicherheit.</p></article></div><div class="section-header"><h2>Was passiert, wenn man richtig prüft?</h2></div><div class="card-grid three"><article class="card"><p class="v2-badge">Sofort</p><p class="card-text">Zuschuss, Kredit, Zweck, Kontrolle und Nutzen werden getrennt.</p></article><article class="card"><p class="v2-badge">Danach</p><p class="card-text">Gute Projekte werden verbessert, schlechte Projekte gestoppt.</p></article><article class="card"><p class="v2-badge">Auf Dauer</p><p class="card-text">Internationale Zusammenarbeit wird wirksamer, transparenter und glaubwürdiger.</p></article></div></div></section>
      <section class="section" id="wirkungsgate"><div><div class="section-header"><p class="hero-kicker">Wirkungsgate</p><h2>Wann ist ein Auslandsprojekt sinnvoll?</h2><p>Nicht jeder Euro im Ausland ist gut. Aber jeder Euro muss nach Wirkung geprüft werden - nicht nach Spottwert.</p></div>${gateCards(dossier.gate)}</div></section>
      <section class="section section-soft" id="subclaims"><div><div class="section-header"><p class="hero-kicker">Subclaims</p><h2>Häufige Varianten aufklappen.</h2></div>${subclaimAccordion(dossier.subclaims)}</div></section>
      <section class="section" id="loesung"><div><div class="section-header"><p class="hero-kicker">Wirkungsökonomische Lösung</p><h2>Auslandsprojekte sichtbar prüfen.</h2><p>Gute Projekte zeigen klar: Was wird besser? Wer profitiert? Wer zahlt? Was wird zurückgezahlt? Welche Kontrolle gibt es? Was lernt man daraus?</p></div>${solutionCards(dossier.solution)}</div></section>
      <section class="section section-soft v2-trust-block" id="warum-vertrauen"><div class="card"><p class="hero-kicker">Warum diese Einordnung vertrauenswürdig sein soll</p><div class="v2-trust-grid"><div><strong>Datenstand</strong><span>${UPDATED_AT}</span></div><div><strong>Quellenstand</strong><span>${esc(dossier.trust.sourceStand)}</span></div><div><strong>Bilanzgrenze</strong><span>Finanzierungsform, Rückzahlung, Mobilitätsnutzen, Klima, Gesundheit, Teilhabe, Partnerschaft und deutsche Interessen.</span></div><div><strong>Gegenposition</strong><span>Kritik ist legitim, wenn Projekte schlecht geplant, schlecht genutzt, intransparent oder zu teuer sind.</span></div></div><details class="v2-source-drawer" open><summary>Sicher / prüfpflichtig anzeigen</summary><div class="card-grid two"><article class="card"><h3 class="card-title">Sicher</h3>${list(dossier.trust.sicher)}</article><article class="card"><h3 class="card-title">Prüfpflichtig</h3>${list(dossier.trust.pruefen)}</article></div></details></div></section>
      <section class="section dossier-tab-panel" id="deep-dive-quellen"><div><div class="section-header"><p class="hero-kicker">Quellen</p><h2>Quellenkarten statt Linkliste.</h2><p>Datenstand: ${UPDATED_AT}. Jede Quelle ist mit Verwendung und Grenze eingeordnet.</p></div>${sourceCards(dossier.sourceKeys)}</div></section>
    </main>`;
  const folder = detail ? "detail" : "live";
  return shell({ title: `${dossier.title} | Wirkungsradar ${pageType}`, description: dossier.subtitle, canonical: `https://wirkungsoekonomie.de/wirkungsradar/${folder}/${dossier.slug}/`, base: "../../../", main });
}

function livePage(dossier, detail = false) {
  if (dossier.slug === "radwege-in-peru") return radwegePage(dossier, detail);
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

function augmentIndexes() {
  injectBeforeMainEnd("wirkungsradar/themen/index.html", clusterSlug, `<section class="section section-soft" id="${clusterSlug}"><div><div class="section-header"><p class="hero-kicker">Steuergeld &amp; globale Verantwortung</p><h2>Neuer Themencluster.</h2></div><div class="card-grid"><a class="card text-link-card" href="${clusterSlug}/"><p class="card-kicker">Nicht Ort zählt. Wirkung zählt.</p><h3 class="card-title">${esc(clusterTitle)}</h3><p class="card-text">${esc(clusterSubtitle)}</p></a></div></div></section>`);
  injectBeforeMainEnd("wirkungsradar/live/index.html", "steuergeld-globale-verantwortung-live", `<section class="section section-soft" id="steuergeld-globale-verantwortung-live"><div><div class="section-header"><p class="hero-kicker">Steuergeld, globale Verantwortung &amp; Fairness</p><h2>4 neue Live-Karten.</h2></div><div class="card-grid">${dossiers.map((item) => `<a class="card text-link-card radar-live-card" href="${esc(item.slug)}/"><p class="card-kicker">${esc(item.judgement)}</p><h3 class="card-title">${esc(item.title)}</h3><p class="card-text"><strong>10 Sekunden:</strong> ${esc(item.answers.ten)}</p></a>`).join("")}</div></div></section>`);
  injectBeforeMainEnd("wirkungsradar/detail/index.html", "steuergeld-globale-verantwortung-detail", `<section class="section section-soft" id="steuergeld-globale-verantwortung-detail"><div><div class="section-header"><p class="hero-kicker">Steuergeld, globale Verantwortung &amp; Fairness</p><h2>4 neue Deep Dives.</h2></div><div class="card-grid">${dossiers.map((item) => `<a class="card text-link-card" href="${esc(item.slug)}/"><p class="card-kicker">${esc(item.judgement)}</p><h3 class="card-title">${esc(item.title)}</h3><p class="card-text">${esc(item.subtitle)}</p></a>`).join("")}</div></div></section>`);
  updateLiveIndexCount();
}

writeSourcePack();
writeRadwegeSourcePack();
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
