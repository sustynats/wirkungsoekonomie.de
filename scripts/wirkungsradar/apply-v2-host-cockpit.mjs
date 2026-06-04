import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const LIVE_DIR = path.join(ROOT, "wirkungsradar/live");
const UPDATED_AT = "03.06.2026";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripHtml(value) {
  return String(value ?? "")
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

function cleanClaim(value) {
  return stripHtml(value)
    .replace(/[„“"]/g, "")
    .replace(/\s+-\s+Wirkungsradar.*$/i, "")
    .trim();
}

function firstMatch(html, regex) {
  return regex.exec(html)?.[1] || "";
}

function shortText(value, max = 220) {
  const text = stripHtml(value);
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.replace(/\s+\S*$/, "")}…`;
}

function sentence(value, max = 220) {
  const text = stripHtml(value);
  const first = text.match(/(.+?[.!?])\s/)?.[1] || text;
  return shortText(first, max);
}

function hostLanguage(value) {
  return stripHtml(value);
}

const overrides = {
  "klima-hat-sich-schon-immer-veraendert": {
    short: "Richtig. Aber kein Entwarnungssatz.",
    say:
      "Ja, Klima hat sich immer verändert. Aber unsere Städte, Ernten, Wasserleitungen und Versicherungen sind für das heutige Klima gebaut.",
    exampleTitle: "Eiszeit ist kein Stadtplan",
    example:
      "In Eiszeiten lagen große Teile Nordeuropas unter Eis. Der Planet kommt mit anderem Klima klar. Unsere Städte, Ernten, Kliniken und Bahnlinien nicht automatisch.",
    question: "Für welches Klima sind unsere Städte, Ernten und Versicherungen gebaut?",
    oldFrame: "Klima hat sich immer verändert, also ist es harmlos.",
    better: "Doch, Klima änderte sich. Die Frage ist: Verkraften Menschen und Infrastruktur diese Geschwindigkeit?",
    impacts: [
      ["Ernährung", "Ernten hängen an Temperatur und Wasser.", "Supermarktpreise zeigen Klimastress schnell."],
      ["Gesundheit", "Hitze belastet Körper und Kliniken.", "Besonders Alte, Kinder und Kranke sind betroffen."],
      ["Infrastruktur", "Straßen und Schienen sind für alte Muster gebaut.", "Hitze verformt Gleise und Asphalt."],
      ["Versicherung", "Schäden werden teurer.", "Manche Risiken werden schwer versicherbar."],
      ["Wasser", "Zu viel oder zu wenig Wasser wird zum Standortproblem.", "Dürre und Starkregen treffen dieselbe Region."],
      ["Demokratie", "Krisenstress macht Gesellschaften anfälliger.", "Wenn Schutz zu spät kommt, wächst Misstrauen."],
    ],
  },
  "e-autos-schlimmer-als-verbrenner": {
    short: "Nicht perfekt. Aber die Bilanz kippt klar.",
    exampleTitle: "Der Auspuff ist nur das Ende",
    example:
      "Beim Verbrenner kommen vor dem Auspuff Ölquelle, Tanker, Raffinerie und Tankstelle. Danach kommen CO₂, NOx, Lärm und Gesundheitskosten.",
    question: "Zählst du nur den Akku oder auch Ölimporte, Abgase, Lärm und Abhängigkeit?",
    oldFrame: "Nur der Akku zählt.",
    better: "Das E-Auto ist nicht perfekt. Aber es trennt Mobilität Schritt für Schritt vom dauernden Verbrennen.",
    impacts: [
      ["Klima", "Verbrennen setzt laufend CO₂ frei.", "Der Akku wird einmal gebaut, Benzin wird ständig verbrannt."],
      ["Gesundheit", "NOx und Feinstaub belasten Lungen.", "Stadtluft ist auch eine Gesundheitsfrage."],
      ["Geld", "Jeder Liter bezahlt fossile Lieferketten.", "Importe verlassen die regionale Wertschöpfung."],
      ["Sicherheit", "Ölimporte schaffen Abhängigkeit.", "Preisschocks treffen Alltag und Industrie."],
      ["Lärm", "Verkehrslärm stresst Menschen.", "Leisere Antriebe helfen vor allem in Städten."],
      ["Industrie", "Batterien, Laden und Recycling schaffen neue Ketten.", "Mobilität wird Standortpolitik."],
    ],
  },
  "klimaschutz-deindustrialisiert-deutschland": {
    short: "Echter Druck, falscher Niedergangsframe.",
    question: "Reden wir über Standortprobleme oder über die Geschichte, dass Klimaschutz Industrie zerstört?",
  },
  "schulden-machen-oder-sparen": {
    short: "Wahrer Stabilitätskern, falsche Haushaltsanalogie.",
    say:
      "Der Steuerzahler zahlt Staatsschulden nicht wie einen Privatkredit zurück. Der Staat refinanziert fällige Anleihen. Entscheidend ist, ob Schulden Zukunftswirkung erzeugen.",
    live:
      "Der wahre Kern ist: Zinsen und Tragfähigkeit sind wichtig. Der Denkfehler ist, Staatsschulden wie private Haushaltskredite zu erzählen. Der Staat rollt fällige Anleihen in der Regel über neue Anleihen weiter. Schädlich sind Schulden dann, wenn sie Blindleistung finanzieren. Wirtschaftsschädlich kann aber auch die Schwarze Null sein, wenn sie Investitionen verhindert.",
    panel:
      "Bürger:innen zahlen Staatsschulden nicht wie einen Privatkredit zurück. Der Bund gibt Anleihen aus; wenn alte Anleihen fällig werden, werden sie häufig durch neue Anleihen refinanziert. Das heißt nicht, dass Schulden egal sind. Zinsen, Vertrauen, Bonität und Mittelverwendung sind real. Aber die Vorstellung, der Steuerzahler müsse irgendwann die ganze Staatsschuld wie eine private Rechnung begleichen, ist eine Nebelkerze. Entscheidend ist: Was macht der Staat mit dem Geld? Wenn Schulden Brücken, Schulen, Netze, Digitalisierung, Klimaanpassung und Produktivität finanzieren, können sie Zukunft ermöglichen. Wenn die Schwarze Null dagegen Investitionen verhindert, wird sie wirtschaftsfeindlich, weil sie Unterlassungsschulden erzeugt.",
    exampleTitle: "Refinanzierung statt Familienkredit",
    example:
      "Eine fällige Bundesanleihe wird formal zurückgezahlt. Praktisch kann der Bund dafür neue Anleihen begeben. Belastend sind dann nicht eine private Gesamtrechnung, sondern Zinslast, Vertrauen, Tragfähigkeit und die Frage, ob das Geld Wirkung erzeugt hat.",
    question: "Geht es dir um Zinsen und Tragfähigkeit - oder benutzt du gerade die Privatkredit-Analogie, die bei Staaten nicht passt?",
    oldFrame: "Staatsschulden seien wie ein Familienkredit, den Bürger:innen später komplett tilgen müssten.",
    better: "Staatsschulden anders erklären: Refinanzierung, Zinslast, Tragfähigkeit und Wirkung der Ausgaben.",
  },
  "heizgesetz-heizhammer-narrativ": {
    claim: "Heizgesetz oder Heizhammer?",
    short: "Wahrer Belastungskern, massiver Verzerrungsframe.",
    say:
      "Der Heizhammer-Frame war stärker als das Gesetz. Es ging nicht darum, funktionierende Heizungen pauschal rauszureißen, sondern neue Heizungen schrittweise auf erneuerbare Wärme umzustellen.",
    live:
      "Der wahre Kern ist: Wärmewende kostet Geld und muss sozial abgefedert werden. Der Denkfehler ist, daraus Enteignung oder Zwangsheizung zu machen. Das Gesetz betraf vor allem neue Heizungen, Übergangsfristen und Wärmeplanung.",
    panel:
      "Beim Heizgesetz gab es reale Probleme: schlechte Kommunikation, Planungsunsicherheit, Kostenangst, komplizierte Förderung, Mieterschutzfragen und echte Belastung für Eigentümer:innen. Aber der Begriff Heizhammer hat aus dieser komplexen Wärmewende-Frage ein Bedrohungsbild gemacht. Viele Menschen hatten plötzlich das Gefühl, der Staat komme in den Keller und reiße die Heizung raus. Sachlich ging es um neue Heizungen, 65 Prozent erneuerbare Wärme, Übergangsfristen und die Kopplung an kommunale Wärmeplanung. Wirkungsökonomisch muss man trennen: Der reale Punkt ist bezahlbare, soziale und planbare Wärmewende. Der schädliche Frame ist Enteignung, Zwang und Panik.",
    exampleTitle: "Wärmewende statt Heizhammer",
    example:
      "Eine funktionierende Heizung ist nicht dasselbe wie eine neue Heizung im Rahmen künftiger Regeln. Bestand, Reparatur, Austausch, Wärmeplanung und Förderung müssen getrennt werden.",
    question: "Redest du über echte Kosten und Planungssicherheit - oder über den Frame, dass der Staat funktionierende Heizungen pauschal verbietet?",
    oldFrame: "Aus Wärmewende wird Heizhammer, aus Planung wird Zwang, aus Zukunftsschutz wird Verlustangst.",
    notThis: "Es gab gar kein Problem, und wer Kostenangst hat, hat es nicht verstanden.",
    better: "Kosten ernst nehmen, Bestand und neue Heizung trennen, lokale Wärmeoption und Lebenszykluskosten prüfen.",
    impacts: [
      ["Gebäude", "Heizung, Dämmung und Wärmebedarf entscheiden gemeinsam.", "Nicht jede Lösung passt zu jedem Haus."],
      ["Haushalt", "Anschaffungskosten, Förderung und Betriebskosten müssen zusammen gerechnet werden.", "Maximalkosten sind nicht automatisch Normalfall."],
      ["Miete", "Modernisierung kann belasten, wenn Mieterschutz und Förderung nicht greifen.", "Soziale Abfederung ist Teil der Wirkung."],
      ["Kommune", "Wärmeplanung soll zeigen, wo Fernwärme, Quartierslösung oder dezentrale Wärme plausibel ist.", "Planung verhindert Blindinvestitionen."],
      ["Klima", "Fossile Wärme bindet Emissionen bis weit in die Zukunft.", "2045 ist für Heizungszyklen nicht weit weg."],
      ["Abhängigkeit", "Gaspreise, CO2-Preis und Netzumbau können fossile Heizungen riskanter machen.", "Vertraut heißt nicht automatisch sicher."],
      ["Demokratie", "Verlorene Deutungshoheit schwächt Vertrauen in Transformationspolitik.", "Sprache entscheidet, ob Menschen Wirkung oder Bedrohung sehen."],
    ],
    psychology: [
      ["Das Zuhause wird verteidigt.", "Eigentumsangst", "Haus und Heizung stehen für Sicherheit, Lebensleistung und Alterssicherung.", "Erst die Sorge anerkennen, dann Bestand, Fristen und Optionen trennen."],
      ["Zwang löst Gegendruck aus.", "Reaktanz", "Der Frame macht aus Planung Bevormundung.", "Nicht Gehorsam verlangen, sondern Wahlräume und lokale Wärmeplanung zeigen."],
      ["Eine Maximalzahl wird Normalfall.", "Ankereffekt", "100.000 Euro bleibt hängen, auch wenn Förderung, Gebäudezustand und Fälle variieren.", "Standardfall, Härtefall und Extremfall sauber auseinanderhalten."],
    ],
  },
  "arbeit-lohnt-sich-nicht-mehr": {
    claim: "Arbeit lohnt sich nicht mehr?",
    short: "Wahrer Lohnabstands- und Frustkern, falsches Faulheitsnarrativ.",
    say:
      "Arbeit muss sich stärker lohnen. Aber die Lösung ist bessere Arbeit, Wohnen und Anreize - nicht Menschen im Bürgergeld arm oder würdelos zu machen.",
    live:
      "Der Frust ist real: Niedrige Löhne, hohe Mieten, Betreuung und Pendeln können Arbeit zu wenig spürbar machen. Der Denkfehler ist, daraus zu schließen, Bürgergeld sei Luxus oder Menschen seien faul.",
    panel:
      "Der wahre Kern ist: Arbeit muss sich klar lohnen. Aber das Problem liegt oft nicht beim Bürgergeld, sondern bei Niedriglohn, Miete, Kinderbetreuung, Pendelkosten und Transferentzug. Wenn jemand 40 Stunden arbeitet, aber hohe Miete, Kita, Bus, wegfallende Leistungen und Bürokratie den Vorteil auffressen, entsteht berechtigter Frust. Dann ist die Lösung nicht, die Grundsicherung zu drücken, sondern Arbeit, Wohnen, Betreuung, Qualifikation, Mobilität und Transfers so zu bauen, dass mehr Arbeit echte Teilhabe schafft.",
    exampleTitle: "Der Lohn-Eimer mit Löchern",
    example:
      "Mehr Arbeit füllt den Eimer. Miete, Kinderbetreuung, Pendeln, wegfallende Leistungen, Bürokratie und Stress können ihn wieder leeren. Wer Arbeit stärken will, muss diese Löcher schließen.",
    question: "Meinst du, dass Bürgergeld zu hoch ist - oder dass Löhne, Mieten, Kinderbetreuung, Pendeln und Transferentzug Arbeit zu wenig spürbar machen?",
    oldFrame: "Bürgergeld macht faul.",
    notThis: "Bürgergeld ist zu hoch, also muss man Druck nach unten machen.",
    better: "Welche Kombination aus Lohn, Wohnen, Betreuung, Mobilität, Qualifikation und Transferregeln sorgt dafür, dass Arbeit echte Teilhabe schafft?",
    impacts: [
      ["Lohn", "Niedrige Löhne schwächen Teilhabe.", "Living-Wage-Logik statt bloßer Beschäftigungszählung."],
      ["Wohnen", "Hohe Mieten können den Arbeitsvorteil auffressen.", "Wohnpolitik ist auch Arbeitsmarktpolitik."],
      ["Betreuung", "Ohne Kita, Pflegeentlastung und Planbarkeit bleibt Mehrarbeit theoretisch.", "Care ist Teil des Arbeitsanreizes."],
      ["Transferentzug", "Wenn Leistungen zu schnell sinken, kommt Mehrarbeit kaum an.", "Übergänge müssen einfacher und glatter werden."],
      ["Jobcenter", "Kontrolle ersetzt keine Qualifikation und kein gutes Matching.", "Jobcenter als Wirkungszentren denken."],
      ["Demokratie", "Faulheitsframes spalten Erwerbstätige und Leistungsbeziehende.", "Frust ernst nehmen, Sündenbocklogik stoppen."],
    ],
    psychology: [
      ["Der Vergleich schmerzt.", "Relative Deprivation", "Menschen vergleichen reale Haushaltslagen, nicht abstrakte Tabellen.", "Frust anerkennen und die echte Haushaltsrechnung öffnen."],
      ["Struktur wird Charakter.", "Fundamentaler Attributionsfehler", "Miete, Gesundheit, Qualifikation und Betreuung verschwinden hinter dem Wort faul.", "Von der Person zur Barriere wechseln."],
      ["Die anderen nehmen mir etwas weg.", "Zero-Sum-Bias", "Grundsicherung erscheint als Verlust der Arbeitenden.", "Zeigen, dass gute Arbeit und gute Sicherung zusammen wirken."],
    ],
  },
  "windraeder-voegel-wald-beton-rueckbau": {
    claim: "Windräder zerstören Natur?",
    variants: ["Windräder sind Sondermüll", "Rotorblätter kann man nicht recyceln", "Windräder werden vergraben", "Die Betonsockel bleiben für immer im Boden", "Windräder sind wegen SF₆ klimaschädlich", "Windkraft ist gar nicht grün"],
    short: "Echte Prüfpflicht. Falsches Gesamturteil.",
    say:
      "Ja, Windkraft braucht Artenschutz und sauberen Rückbau. Aber Windräder sind kein Sondermüll-Argument gegen Windstrom: Über 90 Prozent der Masse ist gut recycelbar, Rotorblatt-Recycling wächst, und SF₆ wird aus neuen Schaltanlagen schrittweise verdrängt.",
    live:
      "Der wahre Punkt ist: Windkraft braucht gute Standorte, Artenschutz und Rückbau. Der falsche Sprung ist: Deshalb sei Windenergie Naturzerstörung. Der Großteil einer Anlage ist recycelbar, Rotorblatt-Recycling entwickelt sich, und SF₆ ist ein Schaltanlagen-Thema mit Ausstiegspfad. Die faire Frage ist: Welche Stromquelle liefert stattdessen - und welche Folgen hat sie?",
    panel:
      "Ich würde das nicht wegwischen. Windenergie hat echte Prüfaufgaben: Standorte, Vögel, Fledermäuse, Wald, Rückbau, Rotorblätter und SF₆ in Schaltanlagen. Aber das sind lösbare Aufgaben, kein Pauschalargument gegen Windstrom. Der größte Teil einer Windenergieanlage besteht aus Stahl, Beton, Kupfer und Aluminium und ist gut recycelbar. Die schwierigere Fraktion sind Rotorblätter aus Faserverbundstoffen. Dort gibt es bereits Verwertungswege, neue Verfahren und kommerziell verfügbare recyclebare Blattdesigns. Bei SF₆ gilt: Das Gas ist klimaschädlich, wenn es entweicht. Aber es steckt nicht im Rotorblatt, sondern in Schaltanlagen. Neue EU-Regeln drängen F-Gase in neuen Schaltanlagen schrittweise zurück. Deshalb lautet die seriöse Antwort nicht: alles egal. Sie lautet: Artenschutz, SF₆-freie Technik, Rückbaupflichten, Recyclingstandards und Materialpässe. Und dann vergleichen wir mit der realen Alternative: Kohle, Gas, Atom, Importstrom oder weniger Versorgungssicherheit. Fossile Energie ist nicht Natur pur. Sie verursacht Tagebau, Methan, CO₂, Feinstaub, Luftschadstoffe, Wasserbelastung und Abhängigkeit. Der faire Vergleich ist Gesamtwirkung gegen Gesamtwirkung.",
    exampleTitle: "Ein Windrad ist kein großer Müllklotz",
    example:
      "Der größte Teil besteht aus Stahl, Beton, Kupfer und Aluminium - also aus Materialien, die Recyclinghöfe gut kennen. Schwieriger waren vor allem die Rotorblätter. Genau dort entstehen neue Verfahren und recyclebare Harze.",
    question: "Welche Stromquelle soll stattdessen liefern - und wie schneiden Rückbau, Schadstoffe, Klima, Gesundheit und Abhängigkeit dort ab?",
    oldFrame: "Windrad gegen Natur, Windräder als Sondermüll, Windkraft wegen SF₆ als heuchlerisch.",
    notThis: "Windräder sind völlig grün, SF₆ ist nicht schlimm oder Rotorblätter sind gar kein Problem.",
    better: "Die Prüfaufgaben sind real. Daraus folgt: gute Standorte, Artenschutz, SF₆-freie Schaltanlagen, Rückbaupflicht, Materialpässe und Recycling.",
    impacts: [
      ["Artenschutz", "Vögel und Fledermäuse brauchen gute Standortwahl und Schutzregeln.", "Abschaltungen, Monitoring, Brutplatzdaten, Antikollisionssysteme."],
      ["Recycling", "Der Großteil der Anlage geht in etablierte Recyclingkreisläufe.", "Stahl, Beton, Kupfer, Aluminium."],
      ["Rotorblätter", "Sie waren die schwierigere Fraktion, werden aber zunehmend verwertet und recyclebar designt.", "GFK in Zementwerken, neue Harzsysteme, RecyclableBlade."],
      ["SF₆", "SF₆ ist ein Schaltanlagen-Thema, kein Rotorblatt-Thema.", "EU-Ausstieg aus F-Gasen in neuen Schaltanlagen."],
      ["Rückbau", "Fundamente und Türme können zurückgebaut und recycelt werden.", "Betonbruch im Wegebau, Stahl zurück in die Stahlproduktion."],
      ["Fossile Alternative", "Kohle und Gas sind nicht naturschonend.", "Tagebau, Luftschadstoffe, Methan, CO₂, Wasserbelastung."],
      ["Gesundheit", "Weniger fossiler Strom bedeutet weniger Luftschadstoffe.", "NOx, Feinstaub, Quecksilber, Ozonbildung."],
      ["Abhängigkeit", "Windstrom senkt Import- und Erpressungsrisiken.", "Weniger Gas- und Kohleimporte."],
      ["Demokratie", "Lokale Konflikte brauchen Beteiligung, nicht Angstbilder.", "Bürgerenergie, kommunale Einnahmen, offene Daten."],
    ],
    psychology: [
      ["Man sieht das Windrad. Die fossilen Schäden sind oft weit weg.", "Verfügbarkeitsheuristik", "Das Sichtbare wirkt größer als das Verteilte.", "Den Vergleich öffnen: Welche Stromquelle stattdessen?"],
      ["Tiere und Wald lösen Schutzinstinkt aus.", "moralischer Schutzimpuls", "Aus einem Standortkonflikt wird schnell ein Total-Nein.", "Artenschutz anerkennen, aber Pauschalblockade trennen."],
      ["Das Wort „Sondermüll“ macht aus Recycling ein Angstbild.", "Angstanker", "Menschen erinnern den Müll, nicht die Recyclingquote.", "Erst sagen: Die Anlage ist größtenteils recycelbar. Dann Rotorblätter differenzieren."],
    ],
  },
  "fusion-loest-das-energieproblem": {
    claim: "Warum jetzt teure Energiewende, wenn bald Fusion kommt?",
    short: "Wahrer Forschungsoptimismus, falscher Verzögerungsframe.",
    say:
      "Fusion erforschen. Aber nicht auf Fusion warten.",
    live:
      "Fusion ist wichtig und soll erforscht werden. Aber sie löst nicht unsere 2030er-Klimaprobleme. Forschung ja - Aufschub nein.",
    panel:
      "Fusion ist faszinierend und wichtig. Aber ein Laborerfolg, ein Target Gain oder ein geplanter Prototyp ist noch kein kommerzielles Kraftwerk, das zuverlässig, bezahlbar und massenhaft Strom liefert. Dafür braucht es kontinuierlichen Betrieb, Tritium-Selbstversorgung, Materialien, Wartung, Netzintegration, Sicherheitskonzepte, Finanzierung und industrielle Skalierung. Wenn Fusion später kommt, wunderbar. Aber heute verfügbare Lösungen zu verzögern, wäre ein Wirkungsfehler.",
    exampleTitle: "Target Gain ist nicht Netzstrom",
    example:
      "Ein erfolgreicher Fusionsschuss kann ein echter Meilenstein sein. Für das Energiesystem zählt aber, ob ein Kraftwerk dauerhaft Strom ins Netz liefert - mit Wartung, Kosten, Brennstoffkreislauf und Verfügbarkeit.",
    question: "Redest du über Fusionsforschung - oder benutzt du Fusion als Grund, heute verfügbare Maßnahmen zu verschieben?",
    oldFrame: "Fusion statt Energiewende.",
    notThis: "Fusion ist Unsinn und wird nie funktionieren.",
    better: "Forschung ja. Aber welche Maßnahme senkt bis 2030 und 2035 real Emissionen und Risiken?",
    impacts: [
      ["Zeitfenster", "Klimawirkung entscheidet sich bis 2030, 2035 und 2045.", "Jahreszahlen statt Zukunftsgefühl."],
      ["Netzstrom", "Target Gain ist nicht Kraftwerks-Nettoleistung.", "Target, Anlage, Turbine und Netz trennen."],
      ["Tritium", "Deuterium ist verfügbarer; Tritium-Selbstversorgung bleibt eine zentrale Hürde.", "Brennstoffkreislauf benennen."],
      ["Material", "Neutronen belasten und aktivieren Komponenten.", "Wartung und Entsorgung mitzählen."],
      ["Opportunitätskosten", "Geld und Aufmerksamkeit können nur einmal eingesetzt werden.", "Was wirkt mit demselben Einsatz schneller?"],
      ["Forschung", "Überhype kann Wissenschaftsvertrauen beschädigen.", "Ehrliche Stufenlogik schützt Forschung."],
    ],
    psychology: [
      ["Technik löst alles.", "Technological Fix Bias", "Eine spätere technische Lösung wirkt einfacher als heutige Systemarbeit.", "Forschung anerkennen und Zeitfenster abfragen."],
      ["Der Durchbruch kommt bald.", "Optimism Bias", "Zeit-, Kosten- und Skalierungsrisiken werden unterschätzt.", "Demonstrator, Kraftwerk und Markt trennen."],
      ["Wir können warten.", "Status-quo-Bias", "Zukunftshoffnung schützt bestehende Routinen.", "Kosten des Wartens sichtbar machen."],
    ],
  },
  "wasserstoff-fuer-alles": {
    claim: "Wir machen das einfach mit Wasserstoff.",
    short: "Wahrer Schlüsseltechnologie-Kern, falsches Allzwecknarrativ.",
    say:
      "Wasserstoff ist zu wertvoll, um ihn überall zu verschwenden.",
    live:
      "Wasserstoff ist wichtig - aber zu knapp und zu wertvoll für alles. Wir brauchen ihn zuerst dort, wo direkte Elektrifizierung nicht reicht: Stahl, Chemie, Schiffe, Flugverkehr und Langzeitspeicher.",
    panel:
      "Wasserstoff ist nicht falsch - im Gegenteil. Ohne grünen Wasserstoff wird Klimaneutralität in Stahl, Chemie, Ammoniak, Methanol, bestimmten Hochtemperaturprozessen, Luftfahrt, Schifffahrt und saisonaler Stromspeicherung sehr schwierig. Aber Wasserstoff ist knapp, braucht erneuerbaren Strom, Infrastruktur, Speicher, Transport und oft weitere Umwandlungsschritte. Deshalb ist die Frage nicht Wasserstoff ja oder nein, sondern: Wo wirkt er besser als direkte Elektrifizierung?",
    exampleTitle: "H2-ready ist nicht H2-verfügbar",
    example:
      "Eine Heizung kann technisch auf Wasserstoff vorbereitet sein. Das sagt aber noch nicht, ob in dieser Straße grüner Wasserstoff verfügbar, bezahlbar und sinnvoll sein wird.",
    question: "Redest du über Wasserstoff für Stahl, Chemie und Langzeitspeicher - oder über Wasserstoff als Ausrede, Elektrifizierung zu verschieben?",
    oldFrame: "Wasserstoff löst alles.",
    notThis: "Wasserstoff ist Unsinn.",
    better: "Wasserstoff ja. Aber dort, wo er wirkt.",
    impacts: [
      ["Knappheit", "Emissionsarmer Wasserstoff ist global bisher knapp.", "Priorität statt Wunschliste."],
      ["Effizienz", "Direkte Elektrifizierung ist oft schneller und effizienter.", "Direktpfad immer mitprüfen."],
      ["Industrie", "Stahl, Chemie, Ammoniak und Methanol sind No-Regret-Felder.", "Nicht mit Pkw-Heizung vermischen."],
      ["Wärme", "H2-ready ist keine Versorgungsgarantie.", "Straße, Netz und Preis konkret prüfen."],
      ["Mobilität", "H2-Pkw und E-Fuels sind im Massenmarkt meist ineffizient.", "Spezialfälle getrennt bewerten."],
      ["Kernnetz", "Das Kernnetz ist kein Versprechen für jedes Gasverteilnetz.", "Kernnetz, Verteilnetz und Hausanschluss trennen."],
      ["Importe", "Importe können neue Abhängigkeiten schaffen.", "Standards und Diversifizierung verlangen."],
    ],
    psychology: [
      ["Alles kann bleiben.", "Status-quo-Bias", "Wasserstoff verspricht Gasheizung, Verbrenner und Tanklogik ohne großen Umbau.", "Knappheit und lokalen Versorgungspfad sichtbar machen."],
      ["Technik macht es bequem.", "Technological Fix Bias", "Technische Möglichkeit wirkt wie eine Systemlösung.", "Effizienz, Kosten und Alternativen vergleichen."],
      ["Verlustangst sinkt.", "Loss Aversion", "Wasserstoff beruhigt Angst vor Heizungs- oder Autoverlust.", "Sorge anerkennen und No-Regret-Priorität erklären."],
    ],
  },
  "e-fuels-retten-den-verbrenner": {
    claim: "E-Fuels retten den Verbrenner.",
    short: "Wahrer Spezialanwendungs-Kern, falsches Verbrenner-Rettungsnarrativ.",
    say: "E-Fuels ja - aber nicht als Ausrede für den Verbrenner-Massenmarkt.",
    live:
      "E-Fuels funktionieren technisch. Der Denkfehler ist, daraus eine Massenlösung für Pkw zu machen. Für Autos nutzt der Akku denselben grünen Strom viel effizienter; E-Fuels brauchen wir eher für Flugzeuge, Schiffe und Spezialfälle.",
    panel:
      "E-Fuels sind nicht Unsinn. Sie sind wichtig für Anwendungen, die sich schwer direkt elektrifizieren lassen: Luftfahrt, Schifffahrt, Spezialmaschinen, kritische Infrastruktur oder begrenzte Bestandsflotten. Aber der Pkw-Massenmarkt ist der falsche Hauptpfad, weil der Umweg über Wasserstoff, CO2, Synthese, Transport und Verbrennung sehr viel erneuerbaren Strom verliert.",
    exampleTitle: "Flugzeug vs. Stadtauto",
    example:
      "Ein Flugzeug braucht vielleicht synthetische Moleküle, weil Batterien zu schwer sind. Ein Stadtauto kann direkt mit Strom geladen werden. Dass E-Fuels für Flugzeuge sinnvoll sein können, heißt nicht, dass sie für Millionen Pkw sinnvoll sind.",
    question: "Redest du über E-Fuels für Flugzeuge und Schiffe - oder über E-Fuels als Vorwand, den normalen Pkw-Verbrenner weiterzuführen?",
    oldFrame: "E-Fuels retten den Verbrenner.",
    notThis: "E-Fuels sind Unsinn.",
    better: "Wo erzeugt dieselbe Kilowattstunde erneuerbarer Strom die höchste Netto-Wirkung?",
    impacts: [
      ["Effizienz", "Der Pkw-E-Fuel-Pfad verliert über mehrere Umwandlungsschritte viel Energie.", "Direktpfad mitprüfen."],
      ["Knappheit", "Synthetische Kraftstoffe bleiben absehbar knapp und teuer.", "Priorität statt Wunschliste."],
      ["Luftfahrt", "E-Kerosin kann für Flugverkehr wichtig sein.", "Spezialanwendung anerkennen."],
      ["Schifffahrt", "Methanol, Ammoniak oder andere Derivate können relevant werden.", "Molekül-Hierarchie anwenden."],
      ["Industrie", "Autojobs schützt man durch neue Wertschöpfung, nicht durch Restlauf-Rhetorik.", "Batterie, Software, Leistungselektronik, Laden und Recycling nennen."],
      ["Demokratie", "Technologieoffenheit darf nicht zur Unentschiedenheit werden.", "Wirkungsoffenheit verlangen."],
    ],
    psychology: [
      ["Alles kann bleiben.", "Status-quo-Bias", "E-Fuels versprechen Auto, Motor, Tankstelle und Fahrgefühl ohne großen Umbau.", "Spezialfall und Massenmarkt trennen."],
      ["Verlustangst sinkt.", "Loss Aversion", "Der Frame beruhigt Angst vor Wertverlust, Verboten und Industriebruch.", "Sorge anerkennen, aber Wirkungspfad prüfen."],
      ["Technik rettet es.", "Technological Fix Bias", "Technische Machbarkeit wird zur Systemlösung überdehnt.", "Effizienz, Menge, Kosten und Zeitfenster sichtbar machen."],
    ],
  },
  "radwege-in-peru": {
    claim: "Für Radwege in Peru ist Geld da, aber für unsere Probleme nicht.",
    short: "Wahrer Prioritätenkern, falscher Steuergeld-Frame.",
    say: "Steuergeld muss geprüft werden. Aber die Peru-Zahl ist falsch verkürzt: Entscheidend sind Zuschuss, Kredit, Wirkung, Rückflüsse und T-SROI.",
    exampleTitle: "Zuschuss oder Kredit?",
    example: "Bei Peru wird aus einem Mobilitätsprogramm schnell ein Symbolbild. Der saubere Einstieg ist: Was ist Zuschuss, was Kredit, was Verkehrssystem, was Wirkung?",
    question: "Vergleichst du gerade eine falsche Schlagzeile mit einem deutschen Problem - oder prüfst du Zuschuss, Kredit, Wirkung und Rückflüsse?",
    oldFrame: "Peru gegen Deutschland.",
    better: "Nicht Ort zählt. Wirkung zählt.",
  },
  "ukraine-unterstuetzung-steuergeld": {
    claim: "Unser Steuergeld geht in die Ukraine, während wir es hier brauchen.",
    short: "Wahrer Kostenkern, falscher Geld-weg-Frame.",
    say: "Ukraine-Hilfe ist nicht einfach Geld weg. Sie ist Sicherheits- und Präventionspolitik. Entscheidend ist: Was kostet Unterstützung - und was kostet Nicht-Unterstützung?",
    exampleTitle: "Kosten von Nicht-Hilfe",
    example: "Wenn Unterstützung größere Sicherheits-, Flucht-, Energie- und Verteidigungskosten verhindert, ist sie nicht nur Ausgabe, sondern Risikovermeidung.",
    question: "Reden wir über die Haushaltsausgabe - oder über die Kosten einer ukrainischen Niederlage für Deutschland und Europa?",
    oldFrame: "Ukraine gegen Deutschland.",
    better: "Sicherheitswirkung, Risikovermeidung und Kontrolle gemeinsam prüfen.",
  },
  "die-boesen-reichen": {
    claim: "Die Reichen sind an allem schuld.",
    short: "Wahrer Ungleichheitskern, falsche Personalisierung.",
    say: "Nicht Reiche bestrafen. Kapital nach Wirkung lesen: Schafft es gute Arbeit und Innovation - oder verknappt es Wohnen, kauft Einfluss und externalisiert Schäden?",
    exampleTitle: "Kapitalwirkung statt Personenschuld",
    example: "Ein Unternehmer mit guter Arbeit und Innovation wirkt anders als Kapital, das Wohnungen verknappt, Steuern vermeidet oder fossile Schäden externalisiert.",
    question: "Reden wir über Menschen als Sündenbock - oder über Kapitalwirkung, Steuerfairness und demokratische Machtverteilung?",
    oldFrame: "Reiche sind böse.",
    better: "Kapitalwirkung, Steuerfairness und demokratische Resilienz prüfen.",
  },
  "leistungstraeger-werden-ausgepresst": {
    claim: "Leistungsträger werden ausgepresst.",
    short: "Wahrer Leistungs- und Investitionskern, aber Kapitalwirkung und Steuerfairness fehlen.",
    say: "Leistung soll sich lohnen. Aber nicht jede Rendite ist Leistung. Wirkleistung stärken, Blindleistung senken, schädliche Renten begrenzen.",
    exampleTitle: "Arbeit oder Bodenrente?",
    example: "Facharbeit, Gründung und Innovation sind andere Wirkungen als Erbschaft, Bodenrente, Monopolmacht oder Spekulation.",
    question: "Meinst du Arbeit, Unternehmertum und Innovation - oder schützt der Satz auch Erbschaft, Bodenrente, Monopolmacht und Spekulation?",
    oldFrame: "Staat gegen Leistung.",
    better: "Regeln daran messen, ob sie Wirkleistung stärken oder leistungsloses Abschöpfen schützen.",
  },
};

const defaultImpacts = [
  ["Mensch", "Menschen spüren Folgen im Alltag.", "Preise, Gesundheit, Arbeit oder Sicherheit verändern sich."],
  ["Geld", "Kosten verschwinden nicht, sie wechseln oft nur den Ort.", "Was heute billig wirkt, kann morgen teuer werden."],
  ["Infrastruktur", "Entscheidungen bauen Wege, Netze und Gewohnheiten.", "Was gebaut ist, bleibt oft lange."],
  ["Vertrauen", "Verkürzte Sätze machen Misstrauen größer.", "Dann wird jede Quelle zur Lagerfrage."],
  ["Demokratie", "Schlechte Frames erschweren faire Entscheidungen.", "Streit wird härter, Lösungen werden langsamer."],
  ["Zukunft", "Aufschub verengt spätere Optionen.", "Je später wir handeln, desto teurer wird Anpassung."],
];

function inferImpacts(slug, text) {
  if (overrides[slug]?.impacts) return overrides[slug].impacts;
  const lower = text.toLowerCase();
  const items = [];
  const add = (label, line, example) => {
    if (!items.some((item) => item[0] === label)) items.push([label, line, example]);
  };
  if (/klima|co₂|co2|energie|wind|batter|e-auto|kern|fusion|industrie/.test(lower)) {
    add("Klima", "Emissionen und Klimarisiken werden mitgezählt.", "Nicht nur ein Preis zählt, sondern auch spätere Schäden.");
    add("Energie", "Versorgung, Netze und Preise hängen zusammen.", "Stromrechnung und Industriepreis gehören in dieselbe Debatte.");
  }
  if (/auto|mobil|verkehr|verbrenner|batter|laden|lkw/.test(lower)) {
    add("Gesundheit", "Luftschadstoffe und Lärm wirken direkt.", "Ein Schulweg ist auch eine Gesundheitsfrage.");
    add("Abhängigkeit", "Öl, Rohstoffe und Lieferketten schaffen Macht.", "Tanker, Pipeline und Raffinerie gehören zur Bilanz.");
  }
  if (/medien|zensur|wissenschaft|sdg|social|regierung|demokratie|meinung/.test(lower)) {
    add("Vertrauen", "Der Satz verändert, wem Menschen glauben.", "Wenn jede Quelle verdächtig ist, wird Prüfung schwer.");
    add("Demokratie", "Misstrauen kann Regeln und Institutionen schwächen.", "Dann wirkt Kontrolle schnell wie Unterdrückung.");
  }
  if (/kosten|preis|geld|steuer|bürgergeld|industrie/.test(lower)) {
    add("Geld", "Sichtbare Preise verdecken oft Folgekosten.", "Die Rechnung steht nur an einer anderen Stelle.");
  }
  defaultImpacts.forEach(([label, line, example]) => add(label, line, example));
  return items.slice(0, 7);
}

function extractListAfter(html, heading) {
  const index = html.toLowerCase().indexOf(heading.toLowerCase());
  if (index < 0) return [];
  const part = html.slice(index, index + 2600);
  return [...part.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((match) => stripHtml(match[1])).filter(Boolean).slice(0, 6);
}

function sourceCards(html) {
  const sourcePart = html.slice(Math.max(0, html.toLowerCase().lastIndexOf("quelle")));
  const links = [...sourcePart.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)]
    .map((match) => [match[1], stripHtml(match[2])])
    .filter(([href, label]) => href && label && !href.startsWith("#"))
    .slice(0, 4);
  return links.length ? links : [["#deep-dive-quellen", "Quellen im Deep Dive"]];
}

function renderImpactFan(items) {
  return `<section class="section v2-impact-fan" id="versteckte-wirkungen" data-v2-impact-fan>
        <div>
          <div class="section-header"><p class="hero-kicker">Versteckte Wirkungen</p><h2>Was der Satz ausblendet.</h2><p>Nicht nur ein Faktor. Gute Antworten öffnen die ganze Rechnung.</p></div>
          <div class="v2-impact-grid">
            ${items
              .map(([label, line, example]) => `<article class="v2-impact-card"><p class="v2-badge">Folge</p><h3>${escapeHtml(label)}</h3><p>${escapeHtml(line)}</p><small>${escapeHtml(example)}</small></article>`)
              .join("\n            ")}
          </div>
        </div>
      </section>`;
}

function renderCockpit(slug, data) {
  const copy = (text) => escapeHtml(text).replace(/'/g, "&#039;");
  return `<section class="section v2-host-cockpit" id="host-cockpit" data-v2-host-cockpit>
        <div class="v2-cockpit-shell">
          <div class="v2-cockpit-head">
            <p class="hero-kicker">Host-Cockpit · Einfach erklärt</p>
            <h2>Was wurde gesagt?</h2>
            <p class="v2-claim-line">Jemand sagt: <strong>${escapeHtml(data.claim)}</strong></p>
          </div>
          <div class="v2-cockpit-grid">
            <article class="v2-cockpit-card v2-card-strong"><p class="v2-badge">Kurzurteil</p><h3>${escapeHtml(data.short)}</h3></article>
            <article class="v2-cockpit-card"><p class="v2-badge">Sag das jetzt</p><p>${escapeHtml(data.say)}</p><button class="copy-chip" type="button" data-copy-text='${copy(data.say)}'>Kopieren</button></article>
            <article class="v2-cockpit-card"><p class="v2-badge">Beispiel</p><h3>${escapeHtml(data.exampleTitle)}</h3><p>${escapeHtml(data.example)}</p><button class="copy-chip" type="button" data-copy-text='${copy(data.example)}'>Beispiel kopieren</button></article>
            <article class="v2-cockpit-card"><p class="v2-badge">Gute Rückfrage</p><p>${escapeHtml(data.question)}</p><button class="copy-chip" type="button" data-copy-text='${copy(data.question)}'>Rückfrage kopieren</button></article>
          </div>
          <div class="v2-frame-card" id="frame-nicht-uebernehmen">
            <p class="v2-badge">Frame nicht übernehmen</p>
            <div><strong>Alter Frame:</strong> ${escapeHtml(data.oldFrame)}</div>
            <div><strong>Nicht so:</strong> ${escapeHtml(data.notThis)}</div>
            <div><strong>Besser:</strong> ${escapeHtml(data.better)}</div>
            <div><strong>Warum:</strong> Die Antwort streitet nicht im alten Rahmen. Sie zeigt, was mitgezählt werden muss.</div>
          </div>
        </div>
      </section>`;
}

function renderPsychology(slug, data) {
  const hooks = data.psychology;
  return `<section class="section v2-psychology-lite" id="warum-der-satz-zieht">
        <div>
          <div class="section-header"><p class="hero-kicker">Warum der Satz zieht</p><h2>Psychologie, ohne Fachwortwand.</h2></div>
          <div class="card-grid three">
            ${hooks
              .map(([simple, badge, effect, move]) => `<article class="card"><p class="v2-badge">${escapeHtml(badge)}</p><h3 class="card-title">${escapeHtml(simple)}</h3><p class="card-text">${escapeHtml(effect)}</p><p class="card-text"><strong>Umgehen:</strong> ${escapeHtml(move)}</p></article>`)
              .join("\n            ")}
          </div>
        </div>
      </section>`;
}

function renderConsequences(data) {
  return `<section class="section section-soft v2-consequence-stack" id="was-passiert-danach">
        <div>
          <div class="section-header"><p class="hero-kicker">Folgenkarte</p><h2>Was passiert, wenn man danach handelt?</h2></div>
          <div class="card-grid three">
            <article class="card"><p class="v2-badge">Sofort</p><p class="card-text">${escapeHtml(data.consequences[0])}</p></article>
            <article class="card"><p class="v2-badge">Danach</p><p class="card-text">${escapeHtml(data.consequences[1])}</p></article>
            <article class="card"><p class="v2-badge">Auf Dauer</p><p class="card-text">${escapeHtml(data.consequences[2])}</p></article>
          </div>
        </div>
      </section>`;
}

function renderTrustBlock(data) {
  return `<section class="section v2-trust-block" id="warum-vertrauen">
        <div class="card">
          <p class="hero-kicker">Warum du dieser Einordnung vertrauen kannst</p>
          <div class="v2-trust-grid">
            <div><strong>Datenstand</strong><span>${escapeHtml(data.date)}</span></div>
            <div><strong>Sicher</strong><span>${escapeHtml(data.sure)}</span></div>
            <div><strong>Unsicher</strong><span>${escapeHtml(data.unsure)}</span></div>
            <div><strong>Was wird mitgezählt?</strong><span>${escapeHtml(data.boundary)}</span></div>
          </div>
          <details class="v2-source-drawer"><summary>Quellen und Grenzen anzeigen</summary>
            <div class="v2-source-grid">
              ${data.sources
                .map(([href, label]) => `<a href="${escapeHtml(href)}"><strong>${escapeHtml(label)}</strong><span>Belegt einen Teil der Einordnung. Grenze: Datenstand und Bilanzgrenze prüfen.</span></a>`)
                .join("\n              ")}
            </div>
          </details>
        </div>
      </section>`;
}

function renderAnswerTabs(data) {
  return `<section class="section v2-answer-tabs" id="antwortformate-v2">
        <div>
          <div class="section-header"><p class="hero-kicker">Antwortformate</p><h2>Kurz sagen. Dann vertiefen.</h2></div>
          <div class="radar-answer-accordion host-answer-tabs">
            <details class="radar-answer-item" open><summary><span class="radar-answer-time">Kommentar</span><span class="radar-answer-label">bis 280 Zeichen</span></summary><p>${escapeHtml(shortText(data.say, 280))}</p></details>
            <details class="radar-answer-item"><summary><span class="radar-answer-time">Live</span><span class="radar-answer-label">20–35 Sekunden</span></summary><p>${escapeHtml(data.live)}</p></details>
            <details class="radar-answer-item"><summary><span class="radar-answer-time">Beispiel</span><span class="radar-answer-label">anschaulich</span></summary><p>${escapeHtml(data.example)}</p></details>
            <details class="radar-answer-item"><summary><span class="radar-answer-time">Panel</span><span class="radar-answer-label">längere Antwort</span></summary><p>${escapeHtml(data.panel)}</p></details>
            <details class="radar-answer-item"><summary><span class="radar-answer-time">Rückfrage</span><span class="radar-answer-label">Frame öffnen</span></summary><p>${escapeHtml(data.question)}</p></details>
          </div>
        </div>
      </section>`;
}

function buildData(slug, html) {
  const h1 = cleanClaim(firstMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i));
  const title = h1 || cleanClaim(firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i));
  const pageText = stripHtml(html);
  const answer = hostLanguage(
    firstMatch(html, /<span class="radar-answer-time">10 Sekunden<\/span>[\s\S]*?<p>[„"]?([\s\S]*?)[“"]?<\/p>/i) ||
      firstMatch(html, /<p class="radar-summary-label">Live-Antwort<\/p><p class="radar-summary-value">([\s\S]*?)<\/p>/i) ||
      sentence(firstMatch(html, /<p class="radar-abstract">([\s\S]*?)<\/p>/i), 220),
  );
  const thirty = hostLanguage(
    firstMatch(html, /<span class="radar-answer-time">30 Sekunden<\/span>[\s\S]*?<p>[„"]?([\s\S]*?)[“"]?<\/p>/i) ||
      answer,
  );
  const two = hostLanguage(
    firstMatch(html, /<span class="radar-answer-time">2 Minuten<\/span>[\s\S]*?<p>[„"]?([\s\S]*?)[“"]?<\/p>/i) ||
      thirty,
  );
  const judgement = hostLanguage(
    firstMatch(html, /<p class="radar-summary-label">Kurzurteil<\/p><p class="radar-summary-value">([\s\S]*?)<\/p>/i) ||
      firstMatch(html, /<p class="card-kicker">([^<]+)<\/p>/i) ||
      "Wahrer Kern, aber wichtige Folgen fehlen.",
  );
  const doNot = extractListAfter(html, "Nicht").slice(0, 5);
  const consequences = extractListAfter(html, "Folgen").slice(0, 3);
  const override = overrides[slug] || {};
  const claim = override.claim || title;
  return {
    claim,
    short: override.short || shortText(judgement, 90),
    say: override.say || shortText(answer, 260),
    live: override.live || shortText(thirty, 520),
    panel: override.panel || shortText(two, 900),
    exampleTitle: override.exampleTitle || "Das einfache Bild",
    example: override.example || sentence(firstMatch(html, /<p class="radar-abstract">([\s\S]*?)<\/p>/i) || answer, 520),
    question: override.question || shortText(firstMatch(html, /<p class="card-kicker">Gute Rückfrage<\/p>[\s\S]*?<p class="card-text">([\s\S]*?)<\/p>/i) || "Was wird hier mitgezählt, und was bleibt unsichtbar?", 180),
    oldFrame: override.oldFrame || `${claim} - und damit sei die Sache erledigt.`,
    notThis: doNot[0] || "Das ist einfach falsch.",
    better: override.better || shortText(answer, 260),
    impacts: inferImpacts(slug, `${title} ${pageText}`),
    psychology: [
      ["Er macht die Sache einfacher.", "Vereinfachung", "Ein komplexes Problem wirkt wie ein einzelner Punkt.", "Beispiel nennen und die Rechnung öffnen."],
      ["Er gibt ein Gefühl von Kontrolle.", "Kontrollgefühl", "Der Satz sortiert Unsicherheit schnell.", "Wahren Kern anerkennen, dann die fehlenden Folgen zeigen."],
      ["Er schützt die alte Sicht.", "Status-quo-Bias", "Veränderung wirkt wie Verlust.", "Nicht beschämen. Bessere Sicherheit zeigen."],
    ],
    consequences: [
      consequences[0] || "Das Problem wirkt kleiner, als es ist.",
      consequences[1] || "Wichtige Folgen verschwinden aus der Debatte.",
      consequences[2] || "Alte Regeln, Kosten oder Abhängigkeiten verfestigen sich.",
    ],
    date: firstMatch(html, /Datenstand:\s*([^<]+)</i) || UPDATED_AT,
    sure: "Der Satz hat einen prüfbaren Kern, aber die Schlussfolgerung ist verkürzt.",
    unsure: "Zahlen, Preise, Technikpfade und politische Folgen müssen regelmäßig geprüft werden.",
    boundary: "Fakten, Folgekosten, Vertrauen, Alltag, Infrastruktur und Demokratie.",
    sources: sourceCards(html),
  };
}

function insertAfterHero(html, block) {
  if (html.includes("data-v2-host-cockpit")) return html;
  const heroStart = html.indexOf("<section class=\"hero");
  if (heroStart < 0) return html;
  const after = html.indexOf("</section>", heroStart);
  if (after < 0) return html;
  const insertAt = after + "</section>".length;
  return `${html.slice(0, insertAt)}\n      ${block}\n${html.slice(insertAt)}`;
}

function transformLivePage(file) {
  const slug = path.basename(path.dirname(file));
  if (slug === "live") return false;
  let html = fs.readFileSync(file, "utf8");
  const data = buildData(slug, html);
  const v2 = [
    renderCockpit(slug, data),
    renderImpactFan(data.impacts),
    renderAnswerTabs(data),
    renderPsychology(slug, data),
    renderConsequences(data),
    renderTrustBlock(data),
  ].join("\n      ");
  const next = insertAfterHero(html, v2);
  if (next === html) return false;
  fs.writeFileSync(file, next);
  return true;
}

function walkLivePages() {
  if (!fs.existsSync(LIVE_DIR)) return [];
  return fs
    .readdirSync(LIVE_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(LIVE_DIR, entry.name, "index.html"))
    .filter((file) => fs.existsSync(file));
}

let changed = 0;
for (const file of walkLivePages()) {
  if (transformLivePage(file)) changed += 1;
}

console.log(`Applied Wirkungsradar v2 Host-Cockpit to ${changed} live pages.`);
