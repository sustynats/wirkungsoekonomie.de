/* Wahlkreis-Wirkungscheck – redaktionelle Fragen- und Begriffsstruktur.
 * Keine Parteien, Personen oder Wahlprognosen. Die amtlichen Regionaldaten
 * liegen getrennt in data-2025.js; Regelwerk in rules.js. */
(function () {
  "use strict";

  var data = window.WC_DATA;
  if (!data) throw new Error("WC_DATA muss vor WC_CHECK geladen werden.");

  var sources = Object.assign({}, data.sources, {
    method: {
      institution: "Wirkungsökonomie",
      title: "Wirkungscheck: offengelegte Prüfpfade",
      year: "2026",
      level: "Methode",
      quality: "methodischer Prüfrahmen, keine empirische Kausalitätsbehauptung",
      url: "../../wirkungsoekonomie.html",
      territorialNote: "Die Prüfpfade ordnen Angaben und Daten. Sie bewerten keine Personen, Parteien oder Wahlchancen.",
      licence: "Eigene Methodendarstellung"
    }
  });

  window.WC_CHECK = Object.assign({}, data, {
    sources: sources,
    methodVersion: "2026.3",
    topics: [
      { id: "wohnen", label: "Bezahlbares Wohnen", hint: "Kosten, Verfügbarkeit und Wohnsicherheit", field: "Soziales" },
      { id: "gesundheit", label: "Gesundheit und Pflege", hint: "Zugang, Verlässlichkeit und Versorgung", field: "Soziales" },
      { id: "bildung", label: "Bildung und Teilhabe", hint: "Zugang, Qualität und Übergänge", field: "Soziales" },
      { id: "arbeit", label: "Arbeit und Fachkräfte", hint: "Zugang, Qualifizierung und Produktivität", field: "Wirtschaft" },
      { id: "wirtschaft", label: "Wirtschaftliche Transformation", hint: "Resilienz, Investitionen und Wertschöpfung", field: "Wirtschaft" },
      { id: "energie", label: "Energie und Infrastruktur", hint: "Zuverlässigkeit, Kosten und Netze", field: "Infrastruktur" },
      { id: "mobilitaet", label: "Mobilität und Erreichbarkeit", hint: "Zugang zu Arbeit, Bildung und Versorgung", field: "Infrastruktur" },
      { id: "klima", label: "Klimafolgen und Vorsorge", hint: "Schutz, Anpassung und Vorsorge", field: "Umwelt" },
      { id: "digital", label: "Digitale staatliche Infrastruktur", hint: "Zugang, Verfahren und Verlässlichkeit", field: "Staat" },
      { id: "staat", label: "Handlungsfähiger Staat", hint: "Vollzug, Kooperation und Rückkopplung", field: "Staat" }
    ],
    goals: {
      wohnen: [
        { id: "zugang", label: "Zugang zu angemessenem Wohnraum verbessern", hint: "Für wen sich die Lage konkret verändern soll" },
        { id: "bezahlbarkeit", label: "Wohnkosten verlässlicher tragbar machen", hint: "Belastung und Sicherheit im Alltag" }
      ],
      gesundheit: [
        { id: "zugang", label: "Zugang zu gesundheitlicher Versorgung verbessern", hint: "Erreichbarkeit und Wartezeiten" },
        { id: "verlaesslichkeit", label: "Versorgung verlässlicher machen", hint: "Planbarkeit für Betroffene" }
      ],
      bildung: [
        { id: "teilhabe", label: "Bildungs- und Teilhabechancen verbessern", hint: "Zugang und Übergänge" },
        { id: "qualitaet", label: "Lern- und Betreuungsqualität verbessern", hint: "Ergebnis statt Angebot" }
      ],
      arbeit: [
        { id: "zugang", label: "Zugang zu guter Arbeit verbessern", hint: "Übergänge und Qualifizierung" },
        { id: "resilienz", label: "Beschäftigung robuster gegen Umbrüche machen", hint: "Anpassungsfähigkeit und Absicherung" }
      ],
      _generisch: [
        { id: "zugang", label: "Zugang verbessern", hint: "Wer erreicht die Leistung heute nicht" },
        { id: "qualitaet", label: "Qualität verbessern", hint: "Tatsächliche Veränderung statt bloßer Aktivität" },
        { id: "verlaesslichkeit", label: "Verlässlichkeit erhöhen", hint: "Planbarkeit für Menschen, Kommunen und Betriebe" },
        { id: "risiko", label: "Wirkungsrisiken verringern", hint: "Negative Folgen früh sichtbar machen" }
      ]
    },
    bottlenecks: [
      { id: "finanzierung", label: "Finanzierung und Anreize", hint: "Mittel oder Anreizstruktur passen nicht zum Ziel" },
      { id: "personal", label: "Personal und Fähigkeiten", hint: "Kapazitäten oder Kompetenzen fehlen" },
      { id: "verfahren", label: "Regeln und Verfahren", hint: "Recht, Prozess oder Genehmigung verzögern den Vollzug" },
      { id: "daten", label: "Daten und Rückkopplung", hint: "Folgen werden nicht früh genug sichtbar" },
      { id: "koordination", label: "Zusammenwirken der Ebenen", hint: "Bund, Länder und Kommunen greifen nicht verlässlich ineinander" },
      { id: "infrastruktur", label: "Infrastruktur und Zugang", hint: "Räumliche oder technische Voraussetzungen fehlen" }
    ],
    horizons: [
      { id: "kurz", label: "In dieser Wahlperiode", hint: "Frühe Signale und überprüfbare Zwischenschritte" },
      { id: "mittel", label: "In fünf bis zehn Jahren", hint: "Strukturelle Veränderung mit Zwischenzielen" },
      { id: "lang", label: "Über Wahlperioden hinaus", hint: "Langfristige Veränderung, aber mit öffentlicher Rückkopplung" }
    ],
    federalRoles: [
      { id: "bund_recht", label: "Rechtsrahmen und Standards", hint: "Bundesgesetz, Mindeststandard oder verlässliche Regel" },
      { id: "bund_finanzierung", label: "Finanzierung und Anreize", hint: "Bundeshaushalt, Förderung oder Anreizarchitektur" },
      { id: "bund_vollzug", label: "Vollzug und Umsetzbarkeit", hint: "Folgen für Länder, Kommunen, Verwaltung und Betroffene" },
      { id: "bund_rueckkopplung", label: "Wirkungsdaten und Rückkopplung", hint: "Frühe Hinweise nutzen, bevor sich Fehlsteuerung verfestigt" }
    ],
    frameRows: [
      { id: "netto", label: "Positive Netto-Wirkung", hint: "Keine schwere negative Wirkung verdecken" },
      { id: "umsetzung", label: "Umsetzbarkeit", hint: "Vollzug für Länder, Kommunen und Betroffene" },
      { id: "verteilung", label: "Verteilungswirkungen", hint: "Unterschiedliche Folgen sichtbar machen" },
      { id: "verlaesslichkeit", label: "Planbarkeit", hint: "Verlässliche Regeln und Zeiträume" }
    ],
    frameScale: [
      { value: 5, label: "sehr wichtig" },
      { value: 4, label: "wichtig" },
      { value: 3, label: "teils" },
      { value: 2, label: "weniger wichtig" },
      { value: 1, label: "nicht wichtig" }
    ],
    redLines: [
      { id: "risiko_sozial", label: "Soziale Teilhabe", hint: "Keine zusätzliche Hürde für besonders betroffene Menschen" },
      { id: "risiko_kommunal", label: "Kommunale Handlungsfähigkeit", hint: "Keine ungedeckte Daueraufgabe vor Ort" },
      { id: "risiko_oekologisch", label: "Natur und Klima", hint: "Keine schwerwiegende negative Umweltwirkung" },
      { id: "risiko_recht", label: "Rechtsstaatlichkeit und Teilhabe", hint: "Keine Einschränkung von Rechtsschutz oder Beteiligung" }
    ],
    learningLinks: [
      { label: "Wirkung verstehen", href: "../../wirkungsoekonomie.html", text: "Wirkung ist die tatsächliche Veränderung eines Zustands, nicht Reichweite oder bloße Umsetzung." },
      { label: "Wirkungsrisiken prüfen", href: "../wirkungsrisiko-matrix/index.html", text: "Positive Folgen an einer Stelle kompensieren schwere negative Folgen an anderer Stelle nicht." },
      { label: "Reverse Merit Order", href: "../reverse-merit-order/index.html", text: "Zuerst den begrenzenden Faktor bearbeiten, statt Ressourcen dort zu erhöhen, wo sie kaum zusätzliche Wirkung auslösen." },
      { label: "Wirkungscontrolling", href: "../impact-controlling/index.html", text: "Reporting wird erst durch Rückkopplung zur Steuerung." }
    ],
    toolkit: {
      pruefrage: "Welche direkte Veränderung soll die bundespolitische Maßnahme auslösen, wie wird ihre Folgewirkung beobachtet, und welche Wirkungsrisiken schließen wir aus?",
      indikatoren: [
        "Zustandsindikator: Was verändert sich für Betroffene tatsächlich?",
        "Vollzugsindikator: Wo entsteht der Engpass im Weg von der Regel zur Wirkung?",
        "Rückkopplungsindikator: Welches Signal zeigt früh, dass eine Annahme nicht trägt?"
      ],
      dialogfrage: "Woran wäre bundesweit und im Wahlkreis konkret erkennbar, dass eine bundespolitische Änderung hilft – und wer würde eine unerwünschte Folge zuerst bemerken?",
      ersterschritt: "Vor der Entscheidung Zielzustand, Wirkpfad, mögliche Wirkungsrisiken und eine Rückkopplung verbindlich festhalten."
    },
    sensitivity: [
      { id: "mehr_zeit", label: "Mehr Zeit einplanen", text: "Ein längerer Horizont kann die Reihenfolge verändern, weil Rückkopplung und Aufbau von Vollzugskapazität stärker gewichtet werden." },
      { id: "mehr_risiko", label: "Wirkungsrisiken höher gewichten", text: "Bei höherem Gewicht für Wirkungsrisiken bleiben nur Pfade sichtbar, die ihre Annahmen und möglichen Nebenfolgen offenlegen." },
      { id: "mehr_kommunal", label: "Kommunalen Vollzug höher gewichten", text: "Bei höherem Gewicht für Vollzug wird die Frage wichtiger, ob Länder und Kommunen die Regel ohne ungedeckte Zusatzlast umsetzen können." }
    ]
  });
}());
