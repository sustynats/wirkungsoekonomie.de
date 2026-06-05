import fs from "node:fs";
import path from "node:path";

const UPDATED_AT = "2026-06-04";
const ASSET_VERSION = "20260604-debt-investment-refinancing";

const sourceCards = [
  ["Deutsche Finanzagentur - Refinanzierung fälliger Bundeswertpapiere", "Fällige Bundeswertpapiere werden formal zurückgezahlt; ohne Haushaltsspielraum zur echten Schuldentilgung werden neue Anleihen im gleichen Umfang begeben.", "Kernbeleg gegen das Privatkredit-Narrativ.", "Refinanzierung heißt nicht: Schulden sind folgenlos. Zinsen, Bonität, Vertrauen und Mittelverwendung bleiben entscheidend.", "https://www.deutsche-finanzagentur.de/bundeswertpapiere/bundeswertpapierarten/ueberblick-bundeswertpapiere", "2026"],
  ["Deutsche Finanzagentur - Bruttokreditbedarf und Schuldenstatistik", "Zeitreihen zu Bruttokreditaufnahme, Tilgungen, Zinsen, Schuldenstand und Umlaufvolumen.", "Erklärung von Brutto- und Nettokreditlogik.", "Zentralstaatliche Statistik; nicht automatisch die gesamte öffentliche Verschuldung.", "https://www.deutsche-finanzagentur.de/finanzierung-des-bundes/schuldenstatistik/bruttokreditbedarf", "2026"],
  ["Bundesrechnungshof - Bruttokreditaufnahme und Umschuldung", "Bruttokreditaufnahme umfasst zusätzliche Kredite und Kredite für Umschuldungen.", "Unterscheidung zwischen Neuverschuldung und Refinanzierung.", "Rechnungshofperspektive betont Haushaltsrisiken, Kontrolle und Transparenz.", "https://www.bundesrechnungshof.de/SharedDocs/Downloads/DE/Berichte/2025/einzelplan-2026/32-volltext.pdf", "2025"],
  ["Bundesbank - deutsche Staatsschulden 2025", "Deutsche Staatsschulden stiegen 2025 auf rund 2,8 Billionen Euro; die Schuldenquote lag bei 63,5 Prozent.", "Aktuelle Größenordnung und Einordnung der Schuldenquote.", "Schuldenstand allein sagt nichts über die Wirkung der finanzierten Ausgaben.", "https://www.bundesbank.de/de/presse/pressenotizen/deutsche-staatsschulden-992718", "2026-03-31"],
  ["Sachverständigenrat - Finanzpaket und Additionality", "Mittel aus dem Finanzpaket sollen zusätzliche Investitionen ermöglichen; Umschichtungen aus dem Kernhaushalt müssen verhindert werden.", "Wirkungsgate für kreditfinanzierte Investitionen.", "Ökonomische Empfehlung, keine politische Freigabe beliebiger Schulden.", "https://www.sachverstaendigenrat-wirtschaft.de/fruehjahrsgutachten-2025-pressemitteilung/kapitel-2.html", "2025"],
  ["Bundesfinanzministerium - Finanzierungspaket 2025", "Sondervermögen Infrastruktur von bis zu 500 Mrd. Euro über zwölf Jahre; Mittel sollen zusätzlich zu Investitionen im Bundeshaushalt eingesetzt werden.", "Faktenbasis zur neuen deutschen Finanzlage.", "Zusätzlichkeit und Wirkung müssen kontrolliert werden.", "https://www.bundesfinanzministerium.de/Monatsberichte/Ausgabe/2025/04/Kapitel/kapitel-2a-finanzierungspaket.html", "2025-04"],
  ["Bundestag - Grundgesetzänderungen 2025", "Höhere Verteidigungsausgaben, Sondervermögen Infrastruktur und Verschuldungsspielraum für Länder.", "Verfassungs- und Haushaltsrahmen.", "Politische Beschlüsse ersetzen keine Wirkungsprüfung.", "https://www.bundestag.de/dokumente/textarchiv/2025/kw11-de-sondersitzung-1056228", "2025-03"],
  ["KfW-Kommunalpanel 2025", "Wahrgenommener kommunaler Investitionsrückstand stieg auf 215,7 Mrd. Euro.", "Begründung für Infrastrukturschuld und kommunale Unterlassungskosten.", "Befragungsbasierter Investitionsrückstand; nicht identisch mit geprüftem Finanzierungsbedarf.", "https://www.kfw.de/%C3%9Cber-die-KfW/Newsroom/Aktuelles/News-Details_855744.html", "2025-07"],
  ["OECD Economic Survey Germany 2025", "Reform der Fiskalregeln kann Verteidigung und Infrastruktur stärken; nötig sind Effizienz, Umschichtung und breitere Steuerbasis.", "Internationale Einordnung: Investieren plus Tragfähigkeit.", "OECD-Empfehlung ist kein Freibrief für beliebige Schulden.", "https://www.oecd.org/content/dam/oecd/en/publications/reports/2025/06/oecd-economic-surveys-germany-2025_b395dc9b/39d62aed-en.pdf", "2025-06"],
  ["IMF Article IV Germany 2025/2026", "IMF begrüßt Reform zur Erhöhung öffentlicher Investitionen, betont aber hochwertige fiskalische Lockerung und langfristiges Wachstum.", "Einordnung: Schulden nur für wachstums- und wirkungsstarke Zwecke.", "IMF verlangt Qualität und fiskalische Tragfähigkeit.", "https://www.imf.org/en/news/articles/2026/02/11/pr26042-germany-imf-executive-board-concludes-2025-article-iv-consultation", "2026-02"],
  ["Bundesrechnungshof - Kritik an Sondervermögen", "Warnt vor Umgehung solider Haushaltsregeln und fordert echte Zusätzlichkeit, Wirtschaftlichkeit, Nachhaltigkeit und Zielgerichtetheit.", "Gegenpol: Missbrauchsschutz und Additionality.", "Kritik nicht als Anti-Investitionsargument missverstehen; sie betrifft Wirkung und Kontrolle.", "https://www.bundesrechnungshof.de/SharedDocs/Kurzmeldungen/DE/2025/aenderung-grundgesetz/kurzmeldung-1.html", "2025"],
];

const dossier = {
  title: "Schulden machen oder sparen?",
  subtitle: "Warum die richtige Frage nicht Schuldenhöhe, sondern Wirkungsbilanz ist.",
  judgement: "Wahrer Stabilitätskern, falsche Haushaltsanalogie.",
  status: "v2-Prüfung läuft",
  abstract: "Die Aussage „Der Steuerzahler muss die Schulden zurückzahlen“ ist als Privatkredit-Bild irreführend. Bürger:innen bekommen keine Rechnung über die gesamte Staatsschuld. Staaten refinanzieren fällige Anleihen in der Regel durch neue Anleihen. Der relevante Unterschied liegt nicht zwischen Schulden und keinen Schulden, sondern zwischen produktiver Staatsverschuldung und wirkungsarmer Verschuldung. Produktive Schulden finanzieren Infrastruktur, Bildung, Klimaresilienz, Digitalisierung, Sicherheit, Netze, Schienen, Gesundheit und Zukunftsfähigkeit. Wirkungsarme Schulden finanzieren Blindleistung, politische Geschenke, Dauerlöcher oder reine Konsumausgaben ohne positive Netto-Wirkung. Die Schwarze Null kann wirtschaftsfeindlich wirken, wenn sie notwendige Investitionen verhindert und Unterlassungskosten erzeugt.",
  note: "Staatsschulden funktionieren nicht wie private Schulden. Fällige Anleihen werden häufig refinanziert; belastend werden Schulden vor allem dann, wenn sie keine Wirkung erzeugen, Zinslasten steigen oder Vertrauen verloren geht.",
  principle: "Nicht der Schuldenstand allein entscheidet, sondern die Wirkung der finanzierten Zukunft.",
  answers: {
    ten: "Der Steuerzahler zahlt Staatsschulden nicht wie einen Privatkredit zurück. Der Staat refinanziert fällige Anleihen. Entscheidend ist, ob Schulden Zukunftswirkung erzeugen.",
    thirty: "Der wahre Kern ist: Zinsen und Tragfähigkeit sind wichtig. Der Denkfehler ist: Staatsschulden wie private Haushaltskredite zu erzählen. Der Staat rollt fällige Anleihen in der Regel über neue Anleihen weiter. Schädlich sind Schulden dann, wenn sie Blindleistung finanzieren. Wirtschaftsschädlich kann aber auch die Schwarze Null sein, wenn sie Investitionen verhindert.",
    two: "Ich ordne das sauber ein. Bürger:innen zahlen Staatsschulden nicht wie einen Privatkredit zurück. Der Bund gibt Anleihen aus; wenn alte Anleihen fällig werden, werden sie häufig durch neue Anleihen refinanziert. Das heißt nicht, dass Schulden egal sind. Zinsen, Vertrauen, Bonität und Mittelverwendung sind real. Aber die Vorstellung, der Steuerzahler müsse irgendwann die ganze Staatsschuld wie eine private Rechnung begleichen, ist eine Nebelkerze. Die entscheidende Frage lautet: Was macht der Staat mit dem Geld? Wenn Schulden marode Brücken, Schulen, Netze, Digitalisierung, Klimaanpassung und Produktivität finanzieren, können sie Zukunft ermöglichen. Wenn die Schwarze Null dagegen Investitionen verhindert, wird sie wirtschaftsfeindlich, weil sie Unterlassungsschulden erzeugt.",
  },
};

const keyPoints = [
  ["Staatsschulden sind kein Privatkredit", "Bürger:innen zahlen die Staatsschuld nicht wie eine Hypothek zurück. Fällige Anleihen werden häufig durch neue Anleihen refinanziert."],
  ["Zinsen sind real", "Schulden sind nicht folgenlos. Zinskosten, Bonität, Vertrauen und Laufzeiten bleiben entscheidend."],
  ["Schwarze Null misst nicht Zukunftsfähigkeit", "Ein Haushalt ohne neue Schulden kann trotzdem Schulen, Netze, Brücken, Klimaresilienz und Verwaltung verfallen lassen."],
  ["Unterlassen ist auch Verschuldung", "Investitionsrückstände, Klimaschäden, Bildungsdefizite und Sicherheitslücken sind verdeckte Zukunftsschulden."],
  ["Schulden müssen Wirkung erzeugen", "Kreditfinanzierung ist sinnvoll, wenn sie positive Netto-Wirkung, Resilienz, Produktivität und Folgekostenvermeidung schafft."],
  ["WÖk-Antwort: Wirkungshaushalt", "Nicht Schwarze Null und nicht Schuldenromantik, sondern T-SROI, Wirkungshaushalt, Additionality und demokratische Kontrolle."],
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
  "Fällige Staatsanleihen werden häufig refinanziert, nicht wie ein privater Kredit aus dem Sparschwein getilgt.",
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
  ["Privatkredit auf Staat übertragen", "Staatsschulden werden so erzählt, als müssten Bürger:innen sie wie einen privaten Kredit direkt zurückzahlen.", "Privat- und Staatsschuld trennen: Fälligkeiten, Refinanzierung, Zinsen, Tragfähigkeit und Wirkung erklären."],
  ["Steuerzahler-muss-zurückzahlen-Frame", "Das Bild einer späteren Gesamtrechnung ersetzt die reale Zins-, Refinanzierungs- und Wirkungslogik.", "Fragen: Geht es um Zinskosten und Tragfähigkeit - oder um eine falsche Privatkredit-Analogie?"],
  ["Staat als Privathaushalt", "Der Staat wird so dargestellt, als müsse er wie ein einzelner Haushalt sparen.", "Unterschied zwischen privatem Konsum, öffentlicher Investition und Refinanzierung erklären."],
  ["Finanzschuld ohne Unterlassungsschuld", "Nur aufgenommene Kredite werden gezählt, nicht Schäden durch Nicht-Investieren.", "Infrastruktur-, Klima-, Bildungs- und Demokratieschulden sichtbar machen."],
  ["Generationengerechtigkeit verkürzt", "Kinder sollen keine Schulden erben, aber marode Infrastruktur und Klimaschäden werden ausgeblendet.", "Generationenbilanz breit lesen: Geld plus Zustand der Systeme."],
  ["Investition als Konsum framen", "Zukunftsinvestitionen werden als staatliches Geldausgeben dargestellt.", "T-SROI und Folgekostenvermeidung verlangen."],
  ["Sparen als moralischer Selbstzweck", "Sparen gilt unabhängig von Wirkung als verantwortungsvoll.", "Sparen an falscher Stelle als Wirkungsrisiko markieren."],
  ["Sondervermögen als Freibrief", "Kreditspielräume werden genutzt, ohne Wirkung, Zusätzlichkeit und Kontrolle zu sichern.", "Wirkungsgate, Datenstand, Additionality, parlamentarische Kontrolle."],
];

const effectPath = [
  ["Aussage", "„Der Steuerzahler muss die Staatsschulden zurückzahlen. Schwarze Null ist solide Politik.“"],
  ["Wirkstoff", "Privatkredit-Analogie als Haushaltsnebel."],
  ["Verkürzung", "Staatsschulden werden wie private Schulden erzählt."],
  ["Ausblendung", "Refinanzierung, Zinslogik, Wachstum, Investitionswirkung, Unterlassungskosten und Infrastrukturzustand verschwinden."],
  ["Resonanz", "Schuldangst, Sparmoral, Sorge um Kinder, Misstrauen gegen Staat."],
  ["Narrativ", "„Keine Schulden = solide Politik.“"],
  ["Wirkungspotenzial", "Investitionen werden politisch delegitimiert."],
  ["Wirkungsrisiko", "Schulen, Brücken, Netze, Schienen, Digitalisierung, Sicherheit und Klimaresilienz verfallen weiter."],
  ["Wirkung dritter Ordnung", "Der Staat bleibt im Buchhaltungsmodus und verliert seine Rolle als Wirkungsarchitektur."],
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
  ["Refinanzierungslogik transparent machen", "Öffentliche Kommunikation muss Bruttokreditaufnahme, Nettokreditaufnahme, Fälligkeiten, Refinanzierung, Zinsen und Tilgung sauber erklären."],
  ["Wirkung statt Schwarze Null", "Haushalte werden nicht nach Defizitfreiheit allein bewertet, sondern nach Infrastrukturzustand, Netto-Wirkung, Resilienz und Folgekostenvermeidung."],
  ["Schuldenampel nach Wirkung", "Grün: Zukunftsinvestition. Gelb: unsichere Wirkung. Rot: Blindleistung oder konsumtive Dauerfinanzierung ohne Wirkung."],
  ["Unterlassungskosten in Haushaltsdebatten einführen", "Jede Sparentscheidung muss zeigen, welche Schäden oder Mehrkosten durch Nicht-Handeln entstehen."],
  ["Additionality sichern", "Kreditspielräume dürfen nicht genutzt werden, um alte Ausgaben umzubuchen. Sie müssen zusätzliche Investitionswirkung erzeugen."],
  ["Wirkungshaushalt einführen", "Haushaltstitel werden nach erwarteter Zustandsveränderung, Wirkungsrisiko und Datenstand bewertet."],
  ["Goldene Wirkungsregel", "Kreditfinanzierung nur für Investitionen mit positiver Netto-Wirkung, Resilienzgewinn oder nachweisbarer Folgekostenvermeidung."],
  ["Wirkungsprüfung vor Kreditfreigabe", "Kreditfinanzierte Projekte müssen Zielzustand, Datenlage, Risiko, Wirkungspfad und Evaluationslogik vorab offenlegen."],
  ["Blindleistung abbauen", "Wirkungsarme Subventionen, Doppelstrukturen, ineffiziente Programme und Fehlanreize werden gestrichen oder umgebaut."],
  ["Prävention priorisieren", "Investitionen in Klimaanpassung, Gesundheit, Bildung, Pflege, IT-Sicherheit und Infrastruktur als Folgekostenvermeidung bewerten."],
  ["Demokratische Kontrolle stärken", "Jährliche Wirkungsberichte zeigen, welche kreditfinanzierten Ausgaben welche Zustände verändert haben."],
  ["Zins- und Tragfähigkeitsprüfung offenlegen", "Jede größere Kreditentscheidung zeigt Finanzierungskosten, Laufzeiten, Refinanzierungsrisiken und Sensitivitäten transparent."],
];

const narrativePages = [
  ["privatkredit-frame", "Privatkredit-Frame", "Wenn Staatsschulden wie private Haushaltskredite erzählt werden.", "hoch", "Der Privatkredit-Frame überträgt private Tilgungslogik auf Staatsfinanzen und verdeckt Refinanzierung, Zinsen, Tragfähigkeit und Investitionswirkung."],
  ["schwarze-null", "Schwarze-Null-Narrativ", "Wenn Defizitfreiheit mit Zukunftsfähigkeit verwechselt wird.", "hoch", "Das Schwarze-Null-Narrativ setzt fehlende Neuverschuldung mit Solidität gleich und blendet aus, ob Infrastruktur, Bildung, Klimaresilienz und Verwaltung funktionsfähig bleiben."],
  ["steuerzahler-zahlt-zurueck", "Steuerzahler-zahlt-zurück-Frame", "Wenn Refinanzierung und Zinslogik durch Privatkreditbilder verdeckt werden.", "hoch", "Dieser Frame behauptet eine direkte Rückzahlungspflicht der Bürger:innen wie bei einem Privatkredit. Tatsächlich sind Zinsen, Refinanzierungsfähigkeit, Vertrauen und Mittelverwendung die relevanten Belastungsfragen."],
  ["schuldenangst", "Schuldenangst", "Wenn sichtbare Finanzschulden unsichtbare Zukunftsschulden verdrängen.", "hoch", "Schuldenangst schützt einen echten Stabilitätswert, kann aber notwendige Zukunftsinvestitionen blockieren."],
  ["schwaebische-hausfrau", "Schwäbische-Hausfrau-Frame", "Wenn Staatshaushalt mit Privathaushalt verwechselt wird.", "mittel", "Der Frame macht öffentliche Investitionen moralisch klein, obwohl Staaten anders wirken als private Haushalte."],
  ["generationenraub", "Generationenraub-Frame", "Wenn Generationengerechtigkeit nur als Schuldenstand gelesen wird.", "hoch", "Künftige Generationen erben nicht nur Finanzschulden, sondern auch Infrastruktur, Klima, Bildung und Demokratiezustand."],
  ["unterlassungskostenblindheit", "Unterlassungskostenblindheit", "Wenn Nicht-Investieren fälschlich als Sparen erscheint.", "hoch", "Unterlassungskosten sind zeitverzögert und weniger sichtbar, können aber höher sein als Finanzierungskosten."],
  ["investitionsblindheit", "Investitionsblindheit", "Wenn Ausgaben nicht nach Zukunftswirkung unterschieden werden.", "hoch", "Ohne Wirkungsgate werden produktive Investitionen und wirkungsarme Ausgaben gleich behandelt."],
];

const glossaryTerms = [
  ["refinanzierung", "Refinanzierung", "Finanzierung fälliger Schulden durch neue Schulden, etwa wenn ein Staat auslaufende Anleihen durch neue Anleihen ersetzt.", "Refinanzierung ist normale Staatsschuldenpraxis. Sie macht Schulden nicht egal, aber sie unterscheidet Staatsschulden fundamental von privaten Krediten."],
  ["bruttokreditaufnahme", "Bruttokreditaufnahme", "Gesamte Kreditaufnahme eines öffentlichen Haushalts einschließlich neuer Schulden und Krediten zur Umschuldung oder Refinanzierung.", "Die Bruttokreditaufnahme ist größer als die Nettokreditaufnahme, weil auch fällige Kredite ersetzt werden."],
  ["nettokreditaufnahme", "Nettokreditaufnahme", "Kreditaufnahme abzüglich Tilgungen; sie zeigt die zusätzliche Neuverschuldung.", "Politisch entscheidend ist oft die Nettokreditaufnahme, während die Bruttokreditaufnahme auch Refinanzierung enthält."],
  ["schwarze-null", "Schwarze Null", "Haushaltsziel ohne neue Nettokreditaufnahme.", "Die Schwarze Null sagt nichts darüber, ob Infrastruktur, Bildung, Klimaresilienz oder Verwaltung in gutem Zustand sind."],
  ["privatkredit-frame", "Privatkredit-Frame", "Narrativ, das Staatsschulden so darstellt, als müssten Bürger:innen sie wie einen privaten Kredit direkt zurückzahlen.", "Staatsschulden funktionieren anders: Fällige Anleihen werden häufig refinanziert."],
  ["zinslast", "Zinslast", "Laufende Zinszahlungen eines Staates für seine Schulden.", "Nicht die gesamte Staatsschuld wird jährlich zurückgezahlt. Aber Zinsen belasten den Haushalt real."],
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

function simpleTable(headers, rows) {
  return `<div class="matrix-wrap"><table class="dossier-matrix"><thead><tr>${headers.map((header) => `<th>${esc(header)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function accordion(items) {
  return `<div class="radar-answer-accordion">${items.map((item, index) => `<details class="radar-answer-item" ${index === 0 ? "open" : ""}><summary><span class="radar-answer-time">${esc(item.title)}</span><span class="radar-answer-label">${esc(item.judgement)}</span></summary><p>${esc(item.text)}</p><p><strong>Wahrer Kern:</strong> ${esc(item.trueCore)}</p><p><strong>Denkfehler:</strong> ${esc(item.error)}</p><p><strong>Host-Antwort:</strong> ${esc(item.host)}</p><p><strong>Die bessere Frage:</strong> ${esc(item.question)}</p></details>`).join("")}</div>`;
}

const privateDebtRows = [
  ["Schuldner", "einzelne Person / Haushalt", "Staat / Bund / Länder"],
  ["Rückzahlung", "aus privatem Einkommen und Vermögen", "durch Haushaltsmittel, Refinanzierung, Wachstum, Einnahmen, fiskalische Steuerung"],
  ["Laufzeitlogik", "Kredit soll individuell getilgt werden", "Anleihen laufen aus und werden häufig durch neue Anleihen refinanziert"],
  ["Insolvenzlogik", "Privatinsolvenz möglich", "Staaten haben andere Souveränitäts-, Markt- und Rechtslogiken"],
  ["Einnahmenbasis", "begrenztes Einkommen", "Steuerbasis, Wirtschaftskraft, Abgaben, Vermögen, Anleihenmarkt"],
  ["Risiko", "Überschuldung des Haushalts", "Zinslast, Vertrauensverlust, Inflation, Refinanzierungsrisiko, Währungs- und Eurozonenrahmen"],
  ["Maßstab", "Kann ich mir das leisten?", "Erzeugt die Ausgabe mehr Zukunftswirkung als Finanzierungskosten und Risiken?"],
  ["WÖk-Frage", "Ist der private Konsum tragfähig?", "Ist die öffentliche Wirkung positiv, resilient und generationsgerecht?"],
];

const debtAccordion = [
  {
    title: "Der Steuerzahler muss es zurückzahlen",
    judgement: "Als Privatkredit-Bild irreführend.",
    text: "Der Satz klingt plausibel, weil er Staatsschulden wie private Schulden darstellt. Aber so funktionieren Staatsfinanzen nicht. Bürger:innen zahlen nicht irgendwann die gesamte Staatsschuld über eine Sonderrechnung zurück. Fällige Staatsanleihen werden in der Regel refinanziert: Der Staat begibt neue Anleihen, um auslaufende Anleihen zu bedienen. Relevant sind deshalb nicht private Rückzahlungsbilder, sondern Zinslast, Refinanzierungsfähigkeit, Bonität, Inflation, Produktivität, Wachstum, Verteilung und Wirkung der finanzierten Ausgaben.",
    trueCore: "Zinsen, Bonität und Tragfähigkeit sind echte Risiken.",
    error: "Die Tilgungslogik privater Kredite wird auf den Staat übertragen.",
    host: "Der Steuerzahler zahlt Staatsschulden nicht wie einen Privatkredit zurück. Staaten refinanzieren fällige Anleihen in der Regel. Entscheidend ist: Was wurde mit dem Geld gemacht? Wenn daraus Infrastruktur, Bildung, Netze und Produktivität entstehen, ist die Wirkung anders als bei Blindleistung.",
    question: "Redest du von Zinskosten und Tragfähigkeit - oder tust du so, als müssten Bürger:innen die gesamte Staatsschuld wie einen Privatkredit tilgen?",
  },
  {
    title: "Schwarze Null",
    judgement: "Symbol für Haushaltsdisziplin, aber kein Wirkungsmaßstab.",
    text: "Die Schwarze Null misst, ob ein Haushalt ohne neue Nettokreditaufnahme auskommt. Sie misst aber nicht, ob Schulen verfallen, Brücken gesperrt werden, Netze fehlen, Schienen überlastet sind, Kommunen Investitionen verschieben oder Klimaschäden steigen. Eine Schwarze Null kann gute Politik sein, wenn der Staat keine relevanten Investitionsrückstände hat. In einer Infrastruktur-, Klima-, Sicherheits- und Transformationskrise kann sie aber wirtschaftsfeindlich werden, weil sie Zukunftskosten versteckt.",
    trueCore: "Haushaltsdisziplin kann sinnvoll sein, wenn Systeme stabil sind und keine relevanten Investitionsrückstände bestehen.",
    error: "Defizitfreiheit wird mit Zukunftsfähigkeit verwechselt.",
    host: "Die Schwarze Null ist keine Wirtschaftsstrategie. Sie ist eine Buchungsgröße. Wenn sie Investitionen verhindert, macht sie das Land ärmer, nicht solider.",
    question: "Welche Investition unterlassen wir - und was kostet uns dieses Unterlassen in fünf, zehn oder zwanzig Jahren?",
  },
];

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
    <link rel="stylesheet" href="${base}assets/css/style.css?v=20260605-wirkungsraum-stage4}">
  </head>
  <body>
    <header class="site-header" data-search-exclude><a class="brand" href="${base}index.html"><span class="brand-mark"><img src="${base}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span><span class="brand-name">Wirkungsökonomie</span></a><button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav"><span></span><span></span><span></span></button><nav id="site-nav" class="site-nav" aria-label="Hauptnavigation"><a href="${base}kompass.html">Kompass</a><a href="${base}wirkungsradar/">Wirkungsradar</a><a href="${base}begriffe/">Begriffe</a></nav></header>
${main}
    <footer class="footer" data-search-exclude><div class="footer-grid"><div><p class="hero-kicker">Wirkungsökonomie</p><h2>Die neue Ordnung des Wohlstands</h2><p>Wirkungsradar: Faktenkern, Narrativ, Psychologie, Wirkungspfad und bessere Handlungsfrage.</p></div><a class="btn btn-primary" href="${base}wirkungsradar/">Wirkungsradar öffnen</a></div></footer>
    <script src="${base}assets/js/main.js?v=20260605-wirkungsraum-stage4"></script>
  </body>
</html>
`;
}

function livePage({ detail = false } = {}) {
  const pageType = detail ? "Detail" : "Live";
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero"><div class="radar-hero-copy"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / ${pageType}</nav><p class="hero-kicker">Staat, Haushalt, Infrastruktur &amp; Zukunft</p><h1 class="hero-title">${esc(dossier.title)}</h1><p class="hero-subtitle">${esc(dossier.subtitle)}</p><p class="radar-abstract"><strong>Abstract:</strong> ${esc(dossier.abstract)}</p><p class="radar-status-line"><span>Status: ${esc(dossier.status)}</span><span>Datenstand: ${UPDATED_AT}</span><span>Finanzschuld und Unterlassungsschuld unterscheiden</span></p></div></section>
      ${summaryGrid([["Kurzurteil", dossier.judgement, "warning"], ["Kurzformel", "Staatsschulden sind kein Familienkredit. Wirkungshaushalt statt Haushaltsmythos.", "positive"], ["Hero-Hinweis", dossier.note, "neutral"], ["Leitsatz", dossier.principle, "positive"]], "Schulden Summary")}
      ${nav("../../../")}
      <section class="section" id="sechs-punkte"><div><div class="section-header"><p class="hero-kicker">Das Wichtigste</p><h2>Sechs Punkte für die Wirkungsbilanz.</h2></div>${cardGrid(keyPoints, "Kernpunkt")}</div></section>
      <nav class="dossier-tab-nav" aria-label="Dossierbereiche" data-search-exclude><a href="#live-antworten">Live antworten</a><a href="#schulden-wirkung-verstehen">Schulden &amp; Wirkung verstehen</a><a href="#staatsschulden-kein-privatkredit">Kein Privatkredit</a><a href="#deep-dive-quellen">Deep Dive &amp; Quellen</a></nav>
      <section class="section dossier-tab-panel" id="live-antworten"><div><div class="section-header"><p class="hero-kicker">Tab 1</p><h2>Live antworten.</h2></div><div class="radar-answer-accordion host-answer-tabs" aria-label="Host-Antworten nach Länge"><details class="radar-answer-item" open><summary><span class="radar-answer-time">10 Sekunden</span> <span class="radar-answer-label">${words(dossier.answers.ten)} Wörter</span></summary><p>„${esc(dossier.answers.ten)}“</p></details><details class="radar-answer-item"><summary><span class="radar-answer-time">30 Sekunden</span> <span class="radar-answer-label">${words(dossier.answers.thirty)} Wörter</span></summary><p>„${esc(dossier.answers.thirty)}“</p></details><details class="radar-answer-item"><summary><span class="radar-answer-time">2 Minuten</span> <span class="radar-answer-label">${words(dossier.answers.two)} Wörter</span></summary><p>„${esc(dossier.answers.two)}“</p></details></div><div class="card-grid two"><article class="card"><p class="card-kicker">Die bessere Frage</p><h3 class="card-title">Geht es dir um Zinsen und Tragfähigkeit - oder benutzt du gerade die Privatkredit-Analogie, die bei Staaten nicht passt?</h3></article><article class="card"><p class="card-kicker">Frame sichtbar machen</p><p class="card-text">Ich beantworte das, aber ich übernehme nicht den Privatkredit-Frame. Der Staat ist kein Familienhaushalt. Die richtige Frage ist: Welche Ausgabe erzeugt welche Netto-Wirkung?</p></article></div><article class="card"><p class="card-kicker">Nicht ins Stöckchen springen</p>${list(["Nicht sagen: Schulden sind egal.", "Nicht sagen: Bürger:innen werden gar nicht belastet.", "Nicht sagen: Der Staat muss nie tilgen.", "Nicht jede Ausgabe Investition nennen.", "Nicht Zinskosten kleinreden.", "Nicht Haushaltsdisziplin verachten.", "Nicht Privathaushalt und Staatshaushalt gleichsetzen.", "Nicht Infrastrukturverfall als Sparen beschönigen."])}</article></div></section>
      <section class="section section-soft dossier-tab-panel" id="schulden-wirkung-verstehen"><div><div class="section-header"><p class="hero-kicker">Tab 2</p><h2>Schulden &amp; Wirkung verstehen.</h2><p>Das Schulden-Narrativ wirkt stark, weil es eine einfache moralische Ordnung anbietet: Schulden schlecht, Sparen gut. Aber öffentliche Haushalte verwalten nicht nur Geld, sondern Infrastruktur, Sicherheit, Bildung, Gesundheit, Klima, Vertrauen, Resilienz und Zukunftsfähigkeit.</p></div>${summaryGrid([["Kernsatz", "Sparen kann teuer werden, wenn es Zukunftsschäden erzeugt.", "warning"], ["Zweiter Kernsatz", "Schulden können gerechtfertigt sein, wenn sie positive Netto-Wirkung finanzieren.", "positive"]], "Schulden Kernsätze")}<div class="card-grid two"><article class="card"><p class="card-kicker">Was stimmt?</p><h3 class="card-title">Schuldenrisiken fair anerkennen.</h3>${list(truePoints)}</article><article class="card"><p class="card-kicker">Was fehlt?</p><h3 class="card-title">Das Spar-Narrativ blendet Zukunftsschulden aus.</h3>${list(missingPoints)}<p class="formula-note"><strong>Kernsatz:</strong> Der Denkfehler ist nicht, Schulden zu prüfen. Der Denkfehler ist, nur Finanzschulden zu prüfen.</p></article></div></div></section>
      <section class="section dossier-tab-panel" id="staatsschulden-kein-privatkredit"><div><div class="section-header"><p class="hero-kicker">Privatkredit-Frame korrigieren</p><h2>Staatsschulden sind kein Privatkredit.</h2><p>Das stärkste Missverständnis in der Schuldendebatte ist die Gleichsetzung von Staatsschulden und privaten Krediten. Ein Privathaushalt muss einen Kredit aus seinem Einkommen zurückzahlen oder verliert irgendwann Zahlungsfähigkeit. Ein Staat funktioniert anders. Er finanziert sich über laufende Einnahmen, Steuern, Abgaben, Gebühren, Vermögen, Wirtschaftskraft und Staatsanleihen. Wenn Bundesanleihen fällig werden, werden sie in der Praxis häufig nicht aus laufenden Steuereinnahmen vollständig getilgt, sondern durch neue Anleihen refinanziert.</p></div>${summaryGrid([["Kernsatz", "Bürger:innen zahlen Staatsschulden nicht wie eine Hypothek zurück. Der Staat rollt fällige Schulden regelmäßig weiter.", "positive"], ["Belastung", "Relevant sind Zinsen, Tragfähigkeit, Vertrauen, Inflation, Verteilung und Wirkung der finanzierten Ausgaben.", "warning"]], "Privatkredit Kernsätze")}<div class="card"><p class="formula-note">Der Staat ist kein Privathaushalt. Aber er ist auch kein Automat ohne Grenzen. Deshalb braucht es Wirkungskontrolle statt Haushaltsmythos.</p></div></div></section>
      <section class="section section-soft dossier-tab-panel" id="privatkredit-vs-staatsschuld"><div><div class="section-header"><p class="hero-kicker">Matrix</p><h2>Privatkredit vs. Staatsschuld.</h2></div>${simpleTable(["Ebene", "Privatkredit", "Staatsschuld"], privateDebtRows)}</div></section>
      <section class="section dossier-tab-panel" id="refinanzierung"><div><div class="section-header"><p class="hero-kicker">Refinanzierung</p><h2>Refinanzierung statt Familienkredit.</h2><p>Bundesanleihen haben feste Laufzeiten. Wenn sie fällig werden, muss der Bund sie formal zurückzahlen. Praktisch geschieht dies häufig durch neue Anleihen. Die Finanzagentur beschreibt genau diesen Mechanismus: Solange im Bundeshaushalt kein Spielraum zur Schuldentilgung besteht, werden fällige Anleihen durch neue Anleihen im gleichen Umfang refinanziert.</p></div>${summaryGrid([["Nicht gleichgültig", "Refinanzierung beseitigt Zins-, Bonitäts- und Vertrauensrisiken nicht.", "warning"], ["Bessere Frage", "Was kostet die Finanzierung - und welche Wirkung erzeugt die Ausgabe?", "positive"]], "Refinanzierung")}</div></section>
      <section class="section section-soft dossier-tab-panel" id="schwarze-null"><div><div class="section-header"><p class="hero-kicker">Schwarze Null</p><h2>Solide oder wirtschaftsfeindlich?</h2><p>Die Schwarze Null wirkt verantwortungsvoll, weil sie eine einfache Haushaltslogik bedient: keine neuen Schulden = solide Politik. Wirkungsökonomisch ist das zu kurz. Wenn der Staat dadurch notwendige Investitionen in Brücken, Schulen, Schiene, Netze, Digitalisierung, Klimaanpassung, Sicherheit, Verwaltung, Gesundheit und Bildung unterlässt, entsteht keine echte Solidität, sondern Substanzverzehr.</p></div>${summaryGrid([["Kernsatz", "Eine Schwarze Null kann rot wirken, wenn sie Zukunftsinfrastruktur verfallen lässt.", "critical"], ["Grenze", "Sie ist nur dann sinnvoll, wenn kein investiver Nachholbedarf besteht und die Systeme stabil sind.", "warning"]], "Schwarze Null")}</div></section>
      <section class="section dossier-tab-panel" id="zentrale-akkordeons"><div><div class="section-header"><p class="hero-kicker">Zentrale Einwände</p><h2>Zwei Sätze sauber beantworten.</h2></div>${accordion(debtAccordion)}</div></section>
      <section class="section dossier-tab-panel" id="bilanzgrenzen"><div><div class="section-header"><p class="hero-kicker">Bilanzgrenzen</p><h2>Welche Schuld wird betrachtet?</h2></div>${matrix(balanceRows)}</div></section>
      <section class="section section-soft dossier-tab-panel" id="schuldenarten"><div><div class="section-header"><p class="hero-kicker">Schuldenarten</p><h2>Nicht jede Schuld wirkt gleich.</h2></div>${cardGrid(debtTypes, "Schuldenart")}</div></section>
      <section class="section dossier-tab-panel" id="wirkstoffanalyse"><div><div class="section-header"><p class="hero-kicker">Wirkstoffanalyse</p><h2>Privatkredit-Analogie als Haushaltsnebel.</h2><p>Staatsschulden werden so erzählt, als müssten Bürger:innen sie wie einen privaten Kredit direkt zurückzahlen. Diese Erzählung aktiviert Schuldangst und Sparmoral, blendet aber Refinanzierung, Zinslogik, Investitionswirkung und Unterlassungskosten aus.</p></div>${cardGrid([["Mechanismus", "Das Narrativ verschiebt Aufmerksamkeit von Zustandsqualität, Refinanzierung und Wirkung auf ein privates Tilgungsbild."], ["Verdeckte Ebenen", "Refinanzierung durch neue Anleihen, Unterschied zwischen Brutto- und Nettokreditaufnahme, Zinslast statt Gesamttilgung, Wachstum und Steuerbasis, öffentliche Investitionswirkung, Unterlassungskosten, Infrastrukturzustand, T-SROI, Wirkungshaushalt, Additionality, Bonität und Vertrauen."], ["Narrativ-Hinweis", "Das Narrativ ist stark, weil fast alle Menschen private Schulden aus eigener Erfahrung kennen. Problematisch wird es, wenn diese Erfahrung auf den Staat übertragen wird."]], "Wirkstoff")}</div></section>
      <section class="section section-soft dossier-tab-panel" id="unterclaims"><div><div class="section-header"><p class="hero-kicker">Unterclaims</p><h2>Drei Varianten desselben Frames.</h2></div>${cardGrid([["„Der Steuerzahler muss Staatsschulden zurückzahlen“", "Irreführende Privatkredit-Analogie: Staaten refinanzieren fällige Anleihen regelmäßig."], ["„Schwarze Null ist solide Politik“", "Nur bei stabiler Infrastruktur plausibel; bei Investitionsstau kann sie wirtschaftsfeindlich sein."], ["„Neue Schulden belasten automatisch unsere Kinder“", "Verkürzt: Kinder erben nicht nur Schuldenstände, sondern auch Infrastruktur, Klima, Bildung, Sicherheit und Wirtschaftskraft."]], "Unterclaim")}</div></section>
      <section class="section section-soft dossier-tab-panel" id="psychologie"><div><div class="section-header"><p class="hero-kicker">Psychologischer Wirkungscheck</p><h2>Warum Schuldenangst wirkt.</h2><p>Schulden sind sichtbar, bezifferbar und moralisch leicht anschlussfähig. Unterlassungskosten sind verstreut, zeitverzögert und weniger sichtbar. Das Privatkredit-Bild macht staatliche Finanzierung intuitiv, aber falsch einfach.</p></div>${summaryGrid([["Primäre Effekte", "Verlustaversion, Haushaltsanalogie, Debt Aversion, moralisches Framing, Status-quo-Bias", "warning"], ["Sekundär", "Present Bias, Verfügbarkeitsheuristik, Scarcity Mindset, False Equivalence", "warning"], ["Trigger", "Angst vor Schulden, Sorge um Kinder, Sparsamkeitsmoral, Misstrauen gegen Staat, Angst vor Kontrollverlust", "critical"], ["Host-Kontrolle", "Privat- und Staatsschuld trennen, Refinanzierung erklären, Zinsen anerkennen, Unterlassungskosten sichtbar machen.", "positive"]], "Psychologie Schulden")}</div></section>
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
      ${summaryGrid([["Wirkstoff", "Finanzschuld als moralischer Kurzschluss", "warning"], ["Bessere Frage", "Welche Ausgabe erzeugt welche Netto-Wirkung - und was kostet Unterlassen?", "positive"], ["Schutzregel", "Schuldenrisiken anerkennen, Unterlassungskosten sichtbar machen.", "positive"], ["Status", "v2-Prüfung läuft", "neutral"]], `${title} Summary`)}
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
      <section class="hero radar-page-hero"><div class="radar-hero-copy"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / Themen</nav><p class="hero-kicker">Themencluster</p><h1 class="hero-title">${esc(title)}</h1><p class="hero-subtitle">${esc(subtitle)}</p><p class="radar-abstract"><strong>Abstract:</strong> Dieses Cluster bündelt Wirkungsradar-Karten zu Haushalt, Investitionen, Infrastruktur, Transformation, Resilienz und demokratischer Handlungsfähigkeit.</p><p class="radar-status-line"><span>v2-Prüfung läuft</span><span>Datenstand: ${UPDATED_AT}</span><span>Leuchtturm: Schulden machen oder sparen?</span></p></div></section>
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
status: draft
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
for (const term of glossaryTerms) {
  const file = `begriffe/${term[0]}/index.html`;
  if (!fs.existsSync(file)) writeFile(file, glossaryPage(term));
}
injectBeforeMainEnd("wirkungsradar/live/index.html", "schulden-machen-oder-sparen", `<section class="section section-soft" id="schulden-investitionen-live"><div><div class="section-header"><p class="hero-kicker">Staat, Haushalt &amp; Zukunft</p><h2>Neues Leuchtturm-Dossier.</h2></div><div class="card-grid"><a class="card text-link-card" href="schulden-machen-oder-sparen/"><p class="card-kicker">${esc(dossier.judgement)}</p><h3 class="card-title">${esc(dossier.title)}</h3><p class="card-text"><strong>10 Sekunden:</strong> ${esc(dossier.answers.ten)}</p></a></div></div></section>`);
injectBeforeMainEnd("wirkungsradar/detail/index.html", "schulden-machen-oder-sparen", `<section class="section section-soft" id="schulden-investitionen-detail"><div><div class="section-header"><p class="hero-kicker">Staat, Haushalt &amp; Zukunft</p><h2>Neuer Deep Dive.</h2></div><div class="card-grid"><a class="card text-link-card" href="schulden-machen-oder-sparen/"><p class="card-kicker">${esc(dossier.judgement)}</p><h3 class="card-title">${esc(dossier.title)}</h3><p class="card-text">${esc(dossier.subtitle)}</p></a></div></div></section>`);
injectBeforeMainEnd("wirkungsradar/themen/index.html", "wirtschaft-transformation", `<section class="section section-soft" id="wirtschaft-transformation"><div><div class="section-header"><p class="hero-kicker">Wirtschaft, Haushalt &amp; Infrastruktur</p><h2>Neue Themencluster.</h2></div><div class="card-grid"><a class="card text-link-card" href="wirtschaft-transformation/"><p class="card-kicker">Investitionen und Zukunftsfähigkeit</p><h3 class="card-title">Wirtschaft &amp; Transformation</h3><p class="card-text">Kapital, Produktivität, Transformation und positive Netto-Wirkung.</p></a><a class="card text-link-card" href="staat-haushalt-demokratie/"><p class="card-kicker">Haushalt und Kontrolle</p><h3 class="card-title">Staat, Haushalt &amp; Demokratie</h3><p class="card-text">Wirkungshaushalt, Tragfähigkeit, Additionality und demokratische Kontrolle.</p></a><a class="card text-link-card" href="infrastruktur/"><p class="card-kicker">Unterlassungskosten</p><h3 class="card-title">Infrastruktur</h3><p class="card-text">Brücken, Schulen, Netze, Verwaltung und Resilienz als Generationenbilanz.</p></a></div></div></section>`);
updateLiveIndexCount();

console.log(`Built debt-investment cluster: 1 live dossier, 1 detail page, 3 topic clusters, ${narrativePages.length} narratives, ${glossaryTerms.length} glossary pages.`);
