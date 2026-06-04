import fs from "node:fs";
import path from "node:path";
import { p0DossiersV2 } from "../../lib/wirkungsradar/p0-dossiers-v2.mjs";
import { renderDossierV2Sections } from "../../components/wirkungsradar/v2/renderers.mjs";

const ROOT = process.cwd();
const LIVE_DIR = path.join(ROOT, "wirkungsradar/live");
const UPDATED_AT = "03.06.2026";
const p0DossiersBySlug = new Map(p0DossiersV2.map((dossier) => [dossier.slug, dossier]));

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
      "Klima war nie egal. Gute Politik schützt Städte, Ernten, Wasser und Gesundheit vor der Erwärmung, die wir heute verursachen.",
    exampleTitle: "Die Stadt, die sich vorbereitet",
    example:
      "Eine Stadt pflanzt Schattenbäume, entsiegelt Schulhöfe, kühlt Pflegeheime, baut Regenrückhalt und warnt früh vor Hitze. Gleichzeitig senkt sie Emissionen. So schützt sie Menschen heute und macht die Zukunft sicherer.",
    question: "Welche Vorbereitung schützt Menschen heute und senkt zugleich die Ursache der Erwärmung?",
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
    exampleTitle: "Der Supermarkt-Lader",
    example:
      "Ein Supermarkt baut Schnelllader auf den Parkplatz. Das Dach hat Solarmodule. Menschen laden, während sie einkaufen. Der Liefer-Lkw kommt elektrisch. Die Luft vor Ort wird sauberer, und Mobilität hängt weniger am Öl.",
    question: "Welche Mobilität funktioniert im Alltag mit weniger Öl, weniger Lärm und besserer Luft?",
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
  "deutschland-nur-zwei-prozent": {
    short: "Wahrer Territorialkern, falscher Verantwortungsframe.",
    say:
      "Deutschlands Anteil ist nur ein Teil der Rechnung. Gute Wirkung entsteht, wenn Lieferketten, Produkte und Standards sichtbar besser werden.",
    live:
      "Die 2-Prozent-Zahl zählt nur Emissionen im Inland. Wirkung entsteht aber auch über Produkte, Lieferketten, Einkauf, Standards und Technik. Wenn diese Daten sichtbar werden, kann Verantwortung nicht mehr an der Grenze verschwinden.",
    panel:
      "Die 2-Prozent-Zahl ist als territoriale Zahl nicht frei erfunden. Aber sie ist keine vollständige Wirkungsrechnung. Deutschland wirkt auch über Importprodukte, Maschinen, Fahrzeuge, Kapital, Standards, Einkauf, Technologie und Lieferketten. Wenn ein Unternehmen Vorprodukte nach sauberem Strom, fairen Löhnen und belastbaren Daten einkauft, verändert sich Wirkung weit über die Landesgrenze hinaus. Die bessere Frage lautet deshalb nicht: Wie klein ist unser Anteil? Sondern: Welche Hebel machen Produkte, Lieferketten und Investitionen messbar besser?",
    exampleTitle: "Der Produktpass im Laden",
    example:
      "Ein T-Shirt hängt im Laden. Auf dem Produktpass sieht man: Wo wurde Baumwolle angebaut? Womit wurde gefärbt? Welche Energie nutzte die Fabrik? Wurden Menschen fair bezahlt? Plötzlich ist nicht nur der Preis sichtbar, sondern die Wirkung.",
    question: "Wie machen wir Lieferketten sichtbar und besser, statt Verantwortung an der Grenze enden zu lassen?",
    oldFrame: "Deutschland ist nur klein, also ist unser Handeln egal.",
    notThis: "Deutschland allein rettet die Welt oder ist allein schuld.",
    better: "Territoriale Emissionen, Lieferketten, Produktdesign, Standards und Kapitalwirkung nebeneinander sichtbar machen.",
  },
  "migration-kostet-nur": {
    claim: "Migration kostet nur?",
    short: "Echter Startaufwand. Falsches Lastbild.",
    say:
      "Ankommen braucht Organisation. Gute Integration macht daraus Sprache, Schule, Arbeit, Wohnen, Anerkennung und Teilhabe.",
    live:
      "Am Anfang braucht Ankommen gute Organisation. Entscheidend ist, ob daraus Teilhabe wird: Sprache, Schule, Arbeit, Wohnen, Anerkennung und klare Regeln.",
    panel:
      "Ich würde den Startaufwand nicht leugnen. Kommunen brauchen Geld, Personal und gute Verfahren. Aber Menschen sind keine Kostenstelle. Die faire Frage ist, ob Integration funktioniert: Sprache, Schule, Arbeit, Wohnen, Anerkennung, Kita, klare Regeln und schnelle Verfahren. Wenn das klappt, entstehen Pflege, Arbeit, Steuern, Nachbarschaft und Zusammenhalt.",
    exampleTitle: "Der Sprachkurs, der zur Pflegekraft führt",
    example:
      "Eine Frau kommt nach Deutschland. Ihr Abschluss wird schnell geprüft. Sie lernt Deutsch im Betrieb. Eine Kommune hilft bei Wohnung, Kita und Anmeldung. Ein Jahr später arbeitet sie in der Pflege. Ein Team ist entlastet. Menschen werden versorgt. Sie zahlt Steuern und ist Teil der Nachbarschaft.",
    question: "Welche Integration macht aus Ankommen Teilhabe?",
    oldFrame: "Migration = Last.",
    notThis: "Migration kostet gar nichts.",
    better:
      "Am Anfang braucht Integration Geld und Organisation. Entscheidend ist, ob Sprache, Arbeit, Schule, Wohnen und Anerkennung funktionieren.",
    impacts: [
      ["Sprache", "Menschen kommen schneller in Kontakt und Arbeit.", "Deutsch im Alltag und im Betrieb lernen."],
      ["Arbeit", "Fähigkeiten werden nutzbar.", "Anerkennung und Matching statt Wartezeit."],
      ["Pflege", "Teams werden entlastet.", "Versorgung wird stabiler."],
      ["Kommune", "Gute Verfahren schaffen Ordnung.", "Anmeldung, Kita, Wohnen und Beratung greifen zusammen."],
      ["Sozialstaat", "Aus Startaufwand können Beiträge werden.", "Arbeit stärkt Steuern und Kassen."],
      ["Nachbarschaft", "Teilhabe entsteht im Alltag.", "Menschen werden sichtbar als Kolleg:innen und Nachbar:innen."],
    ],
    psychology: [
      ["Startaufwand sieht man sofort.", "Gegenwartsbias", "Spätere Beiträge wirken weiter weg als heutige Aufgaben.", "Den gelingenden Pfad zeigen: Sprache, Arbeit, Beitrag."],
      ["Eine Gruppe wird zum Bild.", "Sündenbocklogik", "Strukturprobleme werden auf Menschen geschoben.", "Auf Verfahren, Wohnen, Schule und Arbeit zurückführen."],
      ["Einzelfälle bleiben hängen.", "Verfügbarkeitsheuristik", "Auffällige Fälle wirken wie das Ganze.", "Einzelfall prüfen, aber Systemlösung zeigen."],
    ],
    consequences: [
      "Menschen erscheinen als Last, bevor Lösungen sichtbar werden.",
      "Kommunale Aufgaben werden mit Gruppenabwertung verwechselt.",
      "Integration wird schwerer, weil Vertrauen, Sprache und Arbeit später beginnen.",
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
    exampleTitle: "Die sanierte Schule",
    example:
      "Eine Kommune saniert eine Schule: dichte Fenster, gute Räume, digitale Ausstattung, sichere Wege. Kinder lernen besser, Energie wird gespart, Handwerk vor Ort bekommt Arbeit. Die Frage ist nicht nur, was es kostet. Die Frage ist, welche Wirkung bleibt.",
    question: "Welche Ausgabe verbessert den Zustand von Bildung, Infrastruktur und Zukunft wirklich?",
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
    exampleTitle: "Die Straße mit Wärmeplan",
    example:
      "Eine Kommune zeigt jeder Straße, was kommt: Fernwärme, Wärmepumpe, Gebäudenetz oder Sanierung. Ein Haushalt weiß vor dem Heizungskauf, welcher Weg passt. Förderung ist klar. Handwerker beraten nach Plan. So wird aus Unsicherheit eine Entscheidung.",
    question: "Welche Wärmeoption passt zu diesem Haus, dieser Straße und diesem Zeitplan?",
    oldFrame: "Aus Wärmewende wird Heizhammer, aus Planung wird Zwang, aus Zukunftsschutz wird Verlustangst.",
    notThis: "Es gab gar kein Problem, und wer Kostenangst hat, hat es nicht verstanden.",
    better: "Kosten ernst nehmen, Bestand und neue Heizung trennen, lokale Wärmeoption und Lebenszykluskosten prüfen.",
    impacts: [
      ["Gebäude", "Heizung, Dämmung und Wärmebedarf entscheiden gemeinsam.", "Nicht jede Lösung passt zu jedem Haus."],
      ["Haushalt", "Anschaffungskosten, Förderung und Betriebskosten müssen zusammen gerechnet werden.", "Maximalkosten sind nicht automatisch Normalfall."],
      ["Miete", "Modernisierung kann belasten, wenn Mieterschutz und Förderung nicht greifen.", "Soziale Abfederung ist Teil der Wirkung."],
      ["Kommune", "Wärmeplanung soll zeigen, wo Fernwärme, Quartierslösung oder dezentrale Wärme plausibel ist.", "Planung verhindert Blindinvestitionen."],
      ["Klima", "Fossile Wärme bindet Emissionen bis weit in die Zukunft.", "2045 ist für Heizungszyklen nicht weit weg."],
      ["Abhängigkeit", "Gaspreise, CO₂-Preis und Netzumbau können fossile Heizungen riskanter machen.", "Vertraut heißt nicht automatisch sicher."],
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
    exampleTitle: "Mehr Stunden, mehr Sicherheit",
    example:
      "Eine alleinerziehende Mutter erhöht ihre Arbeitszeit. Die Kita ist verlässlich. Der Weg zur Arbeit ist bezahlbar. Leistungen fallen nicht abrupt weg. Am Monatsende bleibt spürbar mehr übrig. So fühlt sich Arbeit nach Aufstieg an, nicht nach Strafe.",
    question: "Wie sieht ein System aus, in dem mehr Arbeit auch wirklich mehr Sicherheit bringt?",
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
      "Gute Windkraft heißt: passende Standorte, Artenschutz, Abschaltungen, Rückbaukonto und Recycling. Dann entstehen sauberer Strom, lokale Einnahmen und weniger fossile Abhängigkeit.",
    live:
      "Der wahre Punkt ist: Windkraft braucht gute Standorte, Artenschutz und Rückbau. Der falsche Sprung ist: Deshalb sei Windenergie Naturzerstörung. Der Großteil einer Anlage ist recycelbar, Rotorblatt-Recycling entwickelt sich, und SF₆ ist ein Schaltanlagen-Thema mit Ausstiegspfad. Die faire Frage ist: Welche Stromquelle liefert stattdessen - und welche Folgen hat sie?",
    panel:
      "Ich würde das nicht wegwischen. Windenergie hat echte Prüfaufgaben: Standorte, Vögel, Fledermäuse, Wald, Rückbau, Rotorblätter und SF₆ in Schaltanlagen. Aber das sind lösbare Aufgaben, kein Pauschalargument gegen Windstrom. Der größte Teil einer Windenergieanlage besteht aus Stahl, Beton, Kupfer und Aluminium und ist gut recycelbar. Die schwierigere Fraktion sind Rotorblätter aus Faserverbundstoffen. Dort gibt es bereits Verwertungswege, neue Verfahren und kommerziell verfügbare recyclebare Blattdesigns. Bei SF₆ gilt: Das Gas ist klimaschädlich, wenn es entweicht. Aber es steckt nicht im Rotorblatt, sondern in Schaltanlagen. Neue EU-Regeln drängen F-Gase in neuen Schaltanlagen schrittweise zurück. Deshalb lautet die seriöse Antwort nicht: alles egal. Sie lautet: Artenschutz, SF₆-freie Technik, Rückbaupflichten, Recyclingstandards und Materialpässe. Und dann vergleichen wir mit der realen Alternative: Kohle, Gas, Atom, Importstrom oder weniger Versorgungssicherheit. Fossile Energie ist nicht Natur pur. Sie verursacht Tagebau, Methan, CO₂, Feinstaub, Luftschadstoffe, Wasserbelastung und Abhängigkeit. Der faire Vergleich ist Gesamtwirkung gegen Gesamtwirkung.",
    exampleTitle: "Der gut geplante Bürgerwindpark",
    example:
      "Eine Gemeinde plant Windräder auf einer geeigneten Fläche. Vorher werden Arten kartiert. Im Betrieb gibt es Abschaltungen für Fledermäuse. Für den Rückbau liegt Geld zurück. Die Kommune bekommt Einnahmen und kann Schule, Feuerwehr oder Busverbindungen stärken.",
    secondExampleTitle: "Das Recycling-Windrad",
    secondExample:
      "Eine alte Anlage wird ersetzt. Stahl, Kupfer und Aluminium gehen zurück in den Materialkreislauf. Beton wird aufbereitet. Die Rotorblätter werden getrennt verwertet oder durch neue recyclebare Designs ersetzt. Die neue Anlage liefert mit weniger Stückzahl mehr Strom.",
    question: "Welche Planung macht aus Windkraft sauberen Strom, lokale Einnahmen und verlässlichen Rückbau?",
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
    short: "Gute Forschung. Schlechte Ausrede.",
    say:
      "Fusion ist wichtig. Aber Kliniken, Fabriken, Wohnungen und Netze brauchen in diesem Jahrzehnt sauberen, verlässlichen Strom. Forschung ja - Aufschub nein.",
    live:
      "Stell dir zwei Orte vor: Im Labor wird an Fusion geforscht. Draußen entstehen Wind, Solar, Speicher, Netze, Wärmepumpen und flexible Industrie. Beides ist sinnvoll. Falsch wird es, wenn das Labor als Grund dient, die Baustelle zu stoppen.",
    panel:
      "Ich würde Fusion nicht kleinreden. Gute Forschung ist wichtig, und echte Durchbrüche können langfristig sehr wertvoll werden. Aber ein Laborerfolg ist noch kein Kraftwerk im Stromnetz. Zwischen Experiment und Alltag liegen Dauerbetrieb, Wärmeauskopplung, Turbine, Wartung, Materialien, Tritiumkreislauf, Genehmigung, Finanzierung, Bauzeit und bezahlbarer Strom. Darum gilt: Im Labor an morgen forschen, draußen die Versorgung bauen, die heute wirkt.",
    exampleTitle: "Labor und Baustelle gleichzeitig",
    example:
      "Stell dir eine Stadt vor: Im Forschungszentrum wird an Fusion gearbeitet. Gleichzeitig bekommt das Krankenhaus Solarstrom, ein Speicher glättet Lastspitzen, Wärmepumpen entlasten Gas und neue Leitungen verbinden Windstrom mit Betrieben. So sieht es aus, wenn Forschung Zukunft öffnet und heutige Lösungen trotzdem weiterbauen.",
    question: "Welche Lösung liefert wann Strom, Wärme und Sicherheit - Laborforschung später oder verfügbare Infrastruktur jetzt?",
    oldFrame: "Fusion statt Energiewende.",
    notThis: "Fusion ist Unsinn oder wird nie funktionieren.",
    better: "Fusion fördern und gleichzeitig die Lösungen bauen, die heute wirken.",
    impacts: [
      ["Alltag", "Krankenhäuser, Wohnungen und Betriebe brauchen heute verlässliche Energie.", "Nicht erst auf spätere Kraftwerke warten."],
      ["Zeitfenster", "2030 und 2035 sind reale Umbaujahre.", "Jahreszahlen statt Zukunftsgefühl."],
      ["Netzstrom", "Ein Experiment ist noch kein Stromtarif.", "Labor, Turbine und Netz trennen."],
      ["Industrie", "Planbare Energie senkt Standort- und Abhängigkeitsrisiken.", "Netze, Speicher, Effizienz, flexible Lasten."],
      ["Geld", "Kapital und Aufmerksamkeit sind begrenzt.", "Was wirkt mit demselben Einsatz früher?"],
      ["Forschung", "Ehrliche Stufenlogik schützt Wissenschaftsvertrauen.", "Fortschritt ohne Heilsversprechen erklären."],
    ],
    psychology: [
      ["Die perfekte Lösung beruhigt.", "Technological Fix Bias", "Eine spätere Technik wirkt einfacher als heutige Baustellen.", "Forschung anerkennen und fragen: Was wirkt bis wann?"],
      ["Bald klingt näher als es ist.", "Optimism Bias", "Zeit, Kosten und Skalierung werden kleiner gefühlt.", "Experiment, Demonstrator, Kraftwerk und Markt trennen."],
      ["Warten fühlt sich bequem an.", "Status-quo-Bias", "Zukunftshoffnung schützt bestehende Routinen.", "Kosten des Wartens sichtbar machen."],
    ],
  },
  "wasserstoff-fuer-alles": {
    claim: "Wir machen das einfach mit Wasserstoff.",
    short: "Speicherreserve. Kein Dauerstrom.",
    say:
      "Wasserstoff kann Stromlücken absichern. Aber ihn dauerhaft zu verstromen ist ein teurer Umweg. Zuerst gehört er dahin, wo Strom direkt nicht reicht.",
    live:
      "Wasserstoff ist wichtig - aber nicht als Alltagsbrennstoff für alles. Direkter Strom gehört zuerst in Motoren, Wärmepumpen, Netze und Speicher. Wasserstoff gehört dorthin, wo Strom direkt nicht reicht: Stahl, Chemie, Schiffe, Flugzeuge und seltene Stromlücken.",
    panel:
      "Gute Energiearchitektur macht Strom möglichst direkt. Wasserstoff wird erst aus Strom hergestellt, muss gespeichert, transportiert und später wieder genutzt oder verstromt werden. Das kann für Industrie, Moleküle und seltene Reservephasen sinnvoll sein. Als Dauerstrompfad ist es aber ein verlustreicher Wärme-zu-Strom-Umweg.",
    exampleTitle: "Der Wasserstoffspeicher für seltene Wochen",
    example:
      "Ein Energiesystem nutzt Wind und Solar direkt. Batterien glätten Stunden. Wärmespeicher helfen im Alltag. Für wenige lange Engpassphasen gibt es Wasserstoffspeicher und flexible Turbinen. Sie laufen selten - aber sie sichern das System.",
    question: "Wo wirkt direkter Strom besser - und wo braucht das System wirklich Wasserstoff als Molekül oder Reserve?",
    oldFrame: "Wasserstoff löst alles.",
    notThis: "Wasserstoff ist Unsinn.",
    better: "Direktstrom zuerst. Wasserstoff gezielt.",
    impacts: [
      ["Knappheit", "Emissionsarmer Wasserstoff ist global bisher knapp.", "Priorität statt Wunschliste."],
      ["Effizienz", "Direkte Elektrifizierung ist oft schneller und effizienter.", "Direktpfad zuerst prüfen."],
      ["Reserve", "Rückverstromung kann seltene Lücken absichern.", "Sicherheitsnetz, nicht Dauerbetrieb."],
      ["Industrie", "Stahl, Chemie, Ammoniak und Methanol sind No-Regret-Felder.", "Nicht mit Pkw-Heizung vermischen."],
      ["Wärme", "H2-ready ist keine Versorgungsgarantie.", "Straße, Netz und Preis konkret prüfen."],
      ["Mobilität", "H2-Pkw und E-Fuels sind im Massenmarkt meist ineffizient.", "Spezialfälle getrennt bewerten."],
      ["Kernnetz", "Das Kernnetz ist kein Versprechen für jedes Gasverteilnetz.", "Kernnetz, Verteilnetz und Hausanschluss trennen."],
      ["Importe", "Importe können neue Abhängigkeiten schaffen.", "Standards und Diversifizierung verlangen."],
    ],
    psychology: [
      ["Alles kann bleiben.", "Status-quo-Bias", "Wasserstoff verspricht Gasheizung, Verbrenner und Tanklogik ohne großen Umbau.", "Knappheit und lokalen Versorgungspfad sichtbar machen."],
      ["Technik macht es bequem.", "Technological Fix Bias", "Technische Möglichkeit wirkt wie eine Systemlösung.", "Umwandlungskette und Direktstromvergleich zeigen."],
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
    exampleTitle: "Das E-Kerosin für den Flug",
    example:
      "Ein Flugzeug braucht sehr viel Energie auf wenig Gewicht. Dort können synthetische Kraftstoffe helfen. Gleichzeitig fährt das Stadtauto elektrisch, weil es leicht direkt laden kann. So landen knappe Moleküle dort, wo sie wirklich gebraucht werden.",
    question: "Wo passen synthetische Moleküle wirklich besser als direkter Strom?",
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
    claim: "Unser Steuergeld geht in die Ukraine?",
    short: "Echte Haushaltsfrage. Falsches Verlustbild.",
    say: "Ukraine-Hilfe ist nicht einfach Geld weg. Gute Hilfe hält Kliniken, Strom, Wasser, Verwaltung und Schutz stabil. Die richtige Frage ist: Was bewirkt sie konkret - und wie wird sie kontrolliert?",
    exampleTitle: "Das Krankenhaus, in dem das Licht anbleibt",
    example: "Ein Krankenhaus hat Strom. Wasserpumpen laufen. Eine Kommune bleibt erreichbar. Hilfe wird so nicht zu einem abstrakten Betrag, sondern zu funktionierendem Alltag und europäischer Stabilität.",
    question: "Was bewirkt die Unterstützung konkret - und welche Kosten würden entstehen, wenn wir nicht helfen?",
    oldFrame: "Deutschland verschenkt Geld, während hier alles fehlt.",
    better: "Öffentliche Hilfe muss Wirkung, Kontrolle und Sicherheitsnutzen zeigen.",
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

function positiveFallbackExample(slug, claim) {
  const lower = `${slug} ${claim}`.toLowerCase();
  if (/klima|energie|co2|wind|batter|auto|wasserstoff|fuel|wärme|heiz/.test(lower)) {
    return [
      "So sieht es besser aus",
      "Eine Kommune, ein Betrieb oder ein Haushalt prüft zuerst den passenden Weg. Dann werden Daten, Kosten, Förderung, Betrieb und Rückbau gemeinsam geplant. So entsteht eine Lösung, die im Alltag funktioniert und die nächste Abhängigkeit vermeidet.",
    ];
  }
  if (/arbeit|bürgergeld|migration|sozial|wohnen/.test(lower)) {
    return [
      "So sieht es besser aus",
      "Ein Mensch bekommt klare Wege, gute Beratung und weniger Hürden. Arbeit, Wohnen, Betreuung und Qualifikation greifen zusammen. So wird aus Druck echte Handlungsfähigkeit.",
    ];
  }
  if (/medien|zensur|wissenschaft|demokratie|sdg|social|regierung/.test(lower)) {
    return [
      "So sieht es besser aus",
      "Eine Aussage wird ruhig geprüft: Welche Quelle, welche Entscheidung, welche Zuständigkeit? Gute Debatten zeigen Belege, Grenzen und bessere Fragen. So bleibt Kritik möglich, ohne Vertrauen zu zerstören.",
    ];
  }
  return [
    "So sieht es besser aus",
    "Eine gute Lösung zeigt zuerst den besseren Zustand: Wer profitiert, was wird messbar besser, welche Nebenwirkungen werden geprüft? So wird aus Streit eine überprüfbare Wirkungsfrage.",
  ];
}

function renderImpactFan(items) {
  return `<section class="section v2-impact-fan" id="versteckte-wirkungen" data-v2-impact-fan>
        <div>
          <div class="section-header"><p class="hero-kicker">Was wird ausgeblendet?</p><h2>Die ganze Rechnung öffnen.</h2><p>Nicht nur ein Faktor. Gute Antworten zeigen, was sonst noch wirkt.</p></div>
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
  const secondExampleCard = data.secondExample
    ? `\n            <article class="v2-cockpit-card"><p class="v2-badge">Ein gutes Bild</p><h3>${escapeHtml(data.secondExampleTitle || "So sieht es besser aus")}</h3><p>${escapeHtml(data.secondExample)}</p><button class="copy-chip" type="button" data-copy-text='${copy(data.secondExample)}'>Bild kopieren</button></article>`
    : "";
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
            <article class="v2-cockpit-card"><p class="v2-badge">Ein gutes Bild</p><h3>${escapeHtml(data.exampleTitle)}</h3><p>${escapeHtml(data.example)}</p><button class="copy-chip" type="button" data-copy-text='${copy(data.example)}'>Bild kopieren</button></article>${secondExampleCard}
            <article class="v2-cockpit-card"><p class="v2-badge">Die bessere Frage</p><p>${escapeHtml(data.question)}</p><button class="copy-chip" type="button" data-copy-text='${copy(data.question)}'>Frage kopieren</button></article>
          </div>
          <div class="v2-frame-card" id="frame-nicht-uebernehmen">
            <p class="v2-badge">Frame nicht übernehmen</p>
            <div><strong>Alter Frame:</strong> ${escapeHtml(data.oldFrame)}</div>
            <div><strong>Nicht so:</strong> ${escapeHtml(data.notThis)}</div>
            <div><strong>Besser:</strong> ${escapeHtml(data.better)}</div>
            <div><strong>Warum:</strong> Die Antwort malt nicht das Angstbild. Sie zeigt die bessere Lösung und was mitgezählt werden muss.</div>
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
            <details class="radar-answer-item"><summary><span class="radar-answer-time">Ein gutes Bild</span><span class="radar-answer-label">anschaulich</span></summary><p>${escapeHtml(data.example)}</p></details>
            <details class="radar-answer-item"><summary><span class="radar-answer-time">Panel</span><span class="radar-answer-label">längere Antwort</span></summary><p>${escapeHtml(data.panel)}</p></details>
            <details class="radar-answer-item"><summary><span class="radar-answer-time">Die bessere Frage</span><span class="radar-answer-label">Rechnung öffnen</span></summary><p>${escapeHtml(data.question)}</p></details>
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
  const [fallbackExampleTitle, fallbackExample] = positiveFallbackExample(slug, claim);
  return {
    claim,
    short: override.short || shortText(judgement, 90),
    say: override.say || shortText(answer, 260),
    live: override.live || shortText(thirty, 520),
    panel: override.panel || shortText(two, 900),
    exampleTitle: override.exampleTitle || fallbackExampleTitle,
    example: override.example || fallbackExample,
    secondExampleTitle: override.secondExampleTitle || "",
    secondExample: override.secondExample || "",
    question:
      override.question ||
      shortText(firstMatch(html, /<p class="card-kicker">(?:Die bessere Frage|Die bessere Frage)<\/p>[\s\S]*?<p class="card-text">([\s\S]*?)<\/p>/i) || "Wie sieht die bessere Lösung aus, und was wird dadurch messbar besser?", 180),
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
  const heroStart = html.indexOf("<section class=\"hero");
  if (heroStart < 0) return html;
  const after = html.indexOf("</section>", heroStart);
  if (after < 0) return html;
  const insertAt = after + "</section>".length;
  return `${html.slice(0, insertAt)}\n      ${block}\n${html.slice(insertAt)}`;
}

function stripGeneratedV2(html) {
  return html.replace(
    /\n\s*<section class="section(?: section-soft)? (?:v2|v3)-(?:host-cockpit|impact-fan|answer-tabs|psychology-lite|consequence-stack|trust-block|layer[\s\S]*?)"[\s\S]*?<\/section>\s*/g,
    "\n"
  ).replace(
    /\n?\s*<section\b(?=[^>]*(?:data-v2-host-cockpit|data-v2-impact-fan|data-v3-facts-layer|data-v3-consequence-check|data-v3-impact-matrix|data-v3-narrative-mechanism|data-v3-psychology-check|data-v3-frame-shift|data-v3-solution-path|id="antwortformate-v2"|id="warum-der-satz-zieht"|id="folgenkarte-v2"|id="was-passiert-danach"|id="warum-vertrauen"|id="warum-belastbar"|id="verstehen"|id="was-macht-es-besser"|id="linkhub"|id="faktenlage"|id="folgencheck"|id="systemische-wirkungen"|id="narrativ-psychologie"|id="reaktion"|id="loesungspfad"|id="warum-der-radar-so-prueft"))[\s\S]*?<\/section>\s*/g,
    "\n"
  ).replace(
    /\n?\s*<nav class="dossier-tab-nav v3-radar-nav"[\s\S]*?<\/nav>\s*/g,
    "\n"
  );
}

function stripLegacyP0Body(html) {
  const heroStart = html.indexOf("<section class=\"hero");
  if (heroStart < 0) return html;
  const heroEnd = html.indexOf("</section>", heroStart);
  const mainEnd = html.indexOf("</main>", heroEnd);
  if (heroEnd < 0 || mainEnd < 0) return html;
  const keepUntil = heroEnd + "</section>".length;
  return `${html.slice(0, keepUntil)}\n${html.slice(mainEnd)}`;
}

function stripP0HeroProblemCopy(html) {
  const heroStart = html.indexOf("<section class=\"hero");
  if (heroStart < 0) return html;
  const heroEnd = html.indexOf("</section>", heroStart);
  if (heroEnd < 0) return html;
  const hero = html.slice(heroStart, heroEnd + "</section>".length)
    .replace(/\s*<p class="radar-abstract">[\s\S]*?<\/p>/g, "")
    .replace(/\s*<p class="radar-status-line">[\s\S]*?<\/p>/g, "")
    .replace(/\s*<div class="radar-summary-grid[\s\S]*?<\/div>/g, "");
  return `${html.slice(0, heroStart)}${hero}${html.slice(heroEnd + "</section>".length)}`;
}

function transformLivePage(file) {
  const slug = path.basename(path.dirname(file));
  if (slug === "live") return false;
  const html = fs.readFileSync(file, "utf8");
  const p0Dossier = p0DossiersBySlug.get(slug);
  const baseHtml = p0Dossier ? stripLegacyP0Body(stripP0HeroProblemCopy(stripGeneratedV2(html))) : stripGeneratedV2(html);
  const data = p0Dossier ? null : buildData(slug, baseHtml);
  const v2 = p0Dossier ? renderDossierV2Sections(p0Dossier) : [
    renderCockpit(slug, data),
    renderImpactFan(data.impacts),
    renderAnswerTabs(data),
    renderPsychology(slug, data),
    renderConsequences(data),
    renderTrustBlock(data),
  ].join("\n      ");
  const next = insertAfterHero(baseHtml, v2);
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
