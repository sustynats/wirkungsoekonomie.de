/* Wahlkreis-Wirkungscheck - BEISPIELDATEN
 * ============================================================================
 * ACHTUNG: Alle Werte in dieser Datei sind ERFUNDEN.
 * Wahlkreiszuschnitte, Indikatorwerte, Quellen, Regeln, Evidenzstufen und
 * Handlungspfade dienen ausschliesslich der Gestaltung des Prototypen.
 * Sie sind KEINE Aussage ueber reale Wahlkreise und KEIN Regelwerk.
 * Vor jeder Veroeffentlichung vollstaendig durch geprueftes Material ersetzen.
 * ============================================================================
 */

window.WC_MOCK = (function () {
  "use strict";

  /* --- Wahlkreise (erfunden, Auszug) ----------------------------------- */
  var districts = [
    { nr: "275", name: "Mannheim", land: "Baden-Württemberg",
      context: "Stadtkreis Mannheim ohne die Stadtbezirke Sandhofen und Schönau",
      plz: ["68159", "68161", "68165", "68167"] },
    { nr: "274", name: "Rhein-Neckar", land: "Baden-Württemberg",
      context: "Rhein-Neckar-Kreis, nördlicher Teil",
      plz: ["68723", "69115", "69214"] },
    { nr: "213", name: "Ludwigshafen/Frankenthal", land: "Rheinland-Pfalz",
      context: "Kreisfreie Städte Ludwigshafen und Frankenthal",
      plz: ["67059", "67061", "67227"] },
    { nr: "081", name: "Uckermark - Barnim II", land: "Brandenburg",
      context: "Landkreis Uckermark und südlicher Barnim",
      plz: ["16303", "16225", "17291"] },
    { nr: "016", name: "Nordfriesland - Dithmarschen Nord", land: "Schleswig-Holstein",
      context: "Kreis Nordfriesland und nördliches Dithmarschen",
      plz: ["25813", "25746", "25899"] },
    { nr: "156", name: "Leipzig II", land: "Sachsen",
      context: "Stadt Leipzig, südlicher und östlicher Teil",
      plz: ["04103", "04277", "04299"] },
    { nr: "119", name: "Aachen I", land: "Nordrhein-Westfalen",
      context: "Stadt Aachen ohne die Bezirke Brand und Eilendorf",
      plz: ["52062", "52074", "52080"] },
    { nr: "218", name: "München-Land", land: "Bayern",
      context: "Landkreis München ohne die Gemeinden im Norden",
      plz: ["82031", "82041", "85521"] }
  ];

  /* --- Themen (ENTWURF, redaktionell nicht freigegeben) ---------------- */
  var topics = [
    { id: "wohnen", label: "Bezahlbarer Wohnraum", hint: "Mietbelastung, Neubau, Bestandssicherung", field: "Mensch" },
    { id: "gesundheit", label: "Gesundheitsversorgung", hint: "Erreichbarkeit, Fachärzte, Pflege", field: "Mensch" },
    { id: "bildung", label: "Bildung und Betreuung", hint: "Schulen, Kitas, Ausbildungsplätze", field: "Mensch" },
    { id: "arbeit", label: "Arbeit und Fachkräfte", hint: "Fachkräftebedarf, Qualifizierung, Erwerbsbeteiligung", field: "Mensch" },
    { id: "einkommen", label: "Einkommen und Lebenshaltung", hint: "Kaufkraft, Energiekosten, Existenzsicherung", field: "Mensch" },
    { id: "sicherheit", label: "Innere Sicherheit", hint: "Kriminalität, Prävention, Sicherheitsgefühl", field: "Mensch" },
    { id: "integration", label: "Zuwanderung und Integration", hint: "Verfahren, Arbeitsmarktzugang, Zusammenhalt", field: "Mensch" },
    { id: "verkehr", label: "Verkehr und Erreichbarkeit", hint: "Nahverkehr, Strassen, Anbindung", field: "Planet" },
    { id: "energie", label: "Energie und Netze", hint: "Anschlüsse, Versorgungssicherheit, Preise", field: "Planet" },
    { id: "klimafolgen", label: "Klimafolgen und Vorsorge", hint: "Hitze, Hochwasser, Anpassung", field: "Planet" },
    { id: "flaeche", label: "Fläche und Landwirtschaft", hint: "Flächennutzung, Betriebe, Naturhaushalt", field: "Planet" },
    { id: "wirtschaft", label: "Wirtschaftsstruktur", hint: "Ansiedlung, Transformation, Betriebe", field: "Planet" },
    { id: "digital", label: "Digitale Infrastruktur", hint: "Netzausbau, Verwaltungsdigitalisierung", field: "Demokratie" },
    { id: "verwaltung", label: "Verwaltung und Verfahren", hint: "Genehmigungsdauer, Bürokratie, Personal", field: "Demokratie" },
    { id: "vertrauen", label: "Vertrauen in Institutionen", hint: "Beteiligung, Transparenz, Erreichbarkeit", field: "Demokratie" },
    { id: "medien", label: "Information und Desinformation", hint: "Medienqualität, Diskursfähigkeit", field: "Demokratie" },
    { id: "kommunal", label: "Kommunale Handlungsfähigkeit", hint: "Haushalt, Personal, Aufgabenlast", field: "Demokratie" }
  ];

  /* --- Zustandsziele je Thema (Auszug, Rest faellt auf generisch) ------- */
  var goals = {
    energie: [
      { id: "z_anschluss", label: "Anschlusszeiten verkürzen", hint: "Wartezeit von Antrag bis Netzanschluss" },
      { id: "z_versorgung", label: "Versorgungssicherheit erhöhen", hint: "Ausfallzeiten und Reservekapazität" },
      { id: "z_preis", label: "Energiekosten senken", hint: "Belastung für Haushalte und Betriebe" },
      { id: "z_ausbau", label: "Erzeugung vor Ort ausbauen", hint: "Anteil regional erzeugter Energie" }
    ],
    wohnen: [
      { id: "z_mietbelastung", label: "Mietbelastung senken", hint: "Anteil des Einkommens für Wohnen" },
      { id: "z_verfuegbar", label: "Verfügbaren Wohnraum erhöhen", hint: "Zahl bezahlbarer Wohnungen" },
      { id: "z_wohndauer", label: "Wohnsicherheit erhöhen", hint: "Verdrängung und unfreiwillige Umzüge" }
    ],
    verkehr: [
      { id: "z_erreichbar", label: "Erreichbarkeit verbessern", hint: "Wegezeiten zu Arbeit, Schule, Versorgung" },
      { id: "z_takt", label: "Nahverkehrsangebot verdichten", hint: "Taktzeiten und Bedienzeiten" },
      { id: "z_sanierung", label: "Zustand der Infrastruktur verbessern", hint: "Sanierungsstau bei Brücken und Strassen" }
    ],
    _generisch: [
      { id: "z_zugang", label: "Zugang verbessern", hint: "Wer erreicht die Leistung heute nicht" },
      { id: "z_qualitaet", label: "Qualität verbessern", hint: "Ergebnis statt Angebot" },
      { id: "z_verlaesslich", label: "Verlässlichkeit erhöhen", hint: "Planbarkeit für Betroffene" },
      { id: "z_gefaelle", label: "Regionales Gefälle verringern", hint: "Unterschiede innerhalb des Wahlkreises" }
    ]
  };

  var bottlenecks = [
    { id: "finanzierung", label: "Finanzierung", hint: "Mittel stehen nicht oder nicht dauerhaft bereit" },
    { id: "personal", label: "Personal und Fachkräfte", hint: "Stellen sind nicht besetzbar" },
    { id: "verfahren", label: "Genehmigungs- und Planungsverfahren", hint: "Dauer und Komplexität der Verfahren" },
    { id: "flaeche", label: "Fläche und Infrastruktur", hint: "Verfügbarkeit und Zustand" },
    { id: "daten", label: "Datenlage und Steuerungswissen", hint: "Wirkung ist nicht messbar" },
    { id: "koordination", label: "Koordination zwischen Bund, Land und Kommune", hint: "Zuständigkeiten greifen nicht ineinander" },
    { id: "akzeptanz", label: "Akzeptanz und Vertrauen", hint: "Zustimmung vor Ort fehlt" },
    { id: "recht", label: "Rechtsrahmen", hint: "Geltendes Recht steht entgegen" }
  ];

  var horizons = [
    { id: "wahlperiode", label: "Innerhalb dieser Wahlperiode", hint: "Wirkung soll bis zum Ende der laufenden Legislatur sichtbar sein" },
    { id: "mittelfristig", label: "5 bis 10 Jahre", hint: "Wirkung über eine Wahlperiode hinaus, planbar und überprüfbar" },
    { id: "generation", label: "Generationenaufgabe", hint: "Wirkung entsteht über Jahrzehnte, Zwischenschritte sind messbar" }
  ];

  var levels = [
    { id: "eu", label: "Europäische Union", hint: "Richtlinien, Beihilferahmen, Binnenmarkt" },
    { id: "bund", label: "Bund", hint: "Bundesgesetze, Bundeshaushalt, Bundesbehörden" },
    { id: "land", label: "Land", hint: "Landesrecht, Landesbehörden, Landesprogramme" },
    { id: "kommune", label: "Kommune", hint: "Satzungen, kommunale Planung, Daseinsvorsorge" }
  ];

  var frameRows = [
    { id: "haushalt", label: "Haushaltsverträglichkeit", hint: "Belastung öffentlicher Haushalte" },
    { id: "aufwand", label: "Verwaltungsaufwand", hint: "Zusätzlicher Vollzugsaufwand" },
    { id: "verteilung", label: "Regionale Verteilungswirkung", hint: "Wirkung auf Stadt und Land" },
    { id: "planung", label: "Planungssicherheit für Betriebe", hint: "Verlässlichkeit von Rahmenbedingungen" },
    { id: "kommunal", label: "Kommunale Eigenverantwortung", hint: "Entscheidungsspielraum vor Ort" }
  ];

  var frameScale = [
    { value: 5, label: "sehr wichtig" },
    { value: 4, label: "wichtig" },
    { value: 3, label: "teils" },
    { value: 2, label: "weniger wichtig" },
    { value: 1, label: "nicht wichtig" }
  ];

  var redLines = [
    { id: "rl_haushalt", label: "Kommunale Haushalte", hint: "Keine zusätzliche dauerhafte Belastung" },
    { id: "rl_bezahlbar", label: "Bezahlbarkeit für Haushalte", hint: "Keine Mehrbelastung unterer Einkommen" },
    { id: "rl_flaeche", label: "Landwirtschaftliche Flächen", hint: "Kein weiterer Flächenverlust" },
    { id: "rl_natur", label: "Naturhaushalt und Artenvielfalt", hint: "Keine zusätzliche Beeinträchtigung" },
    { id: "rl_planung", label: "Planungssicherheit für Betriebe", hint: "Keine kurzfristigen Rahmenwechsel" },
    { id: "rl_laendlich", label: "Gleichwertigkeit ländlicher Räume", hint: "Kein weiteres Zurückfallen" },
    { id: "rl_verwaltung", label: "Verwaltungsbelastung der Kommunen", hint: "Kein zusätzlicher Vollzugsaufwand" }
  ];

  /* --- Quellen (ERFUNDEN) ---------------------------------------------- */
  var sources = {
    s_netz: { institution: "Beispielagentur für Netzstatistik (fiktiv)", metric: "Mittlere Dauer von Antrag bis Netzanschluss",
      year: "2025", level: "Wahlkreis", quality: "mittel", url: "", note: "Beispielwert. Keine reale Erhebung." },
    s_antrag: { institution: "Beispielregister Netzanschlüsse (fiktiv)", metric: "Zahl offener Anschlussanträge",
      year: "2025", level: "Kreis", quality: "mittel", url: "", note: "Beispielwert. Gebietsstand weicht ab." },
    s_ee: { institution: "Beispielstatistik Energie (fiktiv)", metric: "Anteil regional erzeugter Energie",
      year: "2024", level: "Wahlkreis", quality: "hoch", url: "", note: "Beispielwert." },
    s_personal: { institution: "Beispielerhebung Verwaltungspersonal (fiktiv)", metric: "Besetzungsquote Genehmigungsbehörden",
      year: "2025", level: "Land", quality: "datenluecke", url: "", note: "Auf Wahlkreisebene nicht erhoben." },
    s_bund: { institution: "Beispielbundesstatistik (fiktiv)", metric: "Bundesmittel Anschlussdauer",
      year: "2025", level: "Bund", quality: "hoch", url: "", note: "Beispielwert." }
  };

  /* --- Wahlkreis-Indikatoren (ERFUNDEN) -------------------------------- */
  var indicators = [
    { id: "ind_anschlussdauer", label: "Mittlere Netzanschlussdauer", value: "14 Monate",
      compare: "Bundesmittel 9 Monate", source: "s_netz", evidence: "mittel" },
    { id: "ind_antragsstau", label: "Offene Anschlussanträge", value: "+23 % gegenüber 2023",
      compare: "Bundesmittel +11 %", source: "s_antrag", evidence: "mittel" },
    { id: "ind_ee_anteil", label: "Anteil regional erzeugter Energie", value: "38 %",
      compare: "Bundesmittel 44 %", source: "s_ee", evidence: "hoch" },
    { id: "ind_personalquote", label: "Besetzungsquote Genehmigungsbehörden", value: null,
      compare: "", source: "s_personal", evidence: "datenluecke",
      gapReason: "Die Erhebung erfolgt nur auf Landesebene.",
      gapEffect: "Der Verfahrenshebel stützt sich deshalb allein auf die Anschlussdauer." }
  ];

  /* --- Wirkungshebel (ERFUNDEN) ---------------------------------------- */
  var levers = [
    { id: "mittel", label: "Mittel", degree: 3, binding: false },
    { id: "personal", label: "Personal", degree: 2, binding: false },
    { id: "verfahren", label: "Verfahren", degree: 1, binding: true },
    { id: "flaeche", label: "Fläche", degree: 2, binding: false }
  ];

  /* --- Handlungspfade und Regeln (ERFUNDEN) ---------------------------- */
  var paths = [
    {
      id: "P-03",
      letter: "A",
      title: "Verfahrensdauer bei Netzanschlüssen verkürzen",
      summary: "Fristen und Genehmigungsfiktionen im Verfahren so ausgestalten, dass die " +
        "Bearbeitungsdauer planbar wird. Ansatzpunkt ist nicht die Höhe der Mittel, sondern " +
        "die Zeit zwischen Antrag und Anschluss.",
      match: "Engpass Verfahren, Handlungsebene Bund",
      level: "Bund",
      horizon: "3 bis 5 Jahre",
      evidence: "mittel",
      rule: {
        id: "P-03",
        conditions: [
          "der genannte Engpass „Verfahren“ ist",
          "die Anschlussdauer über dem Bundesmittel liegt",
          "die Handlungsebene Bund umfasst"
        ],
        conclusion: "der Verfahrensweg der vorrangige Wirkungshebel ist",
        basis: "2 Studien, 1 amtliche Zeitreihe"
      },
      usesIndicators: ["ind_anschlussdauer", "ind_antragsstau", "ind_ee_anteil", "ind_personalquote"],
      follows: "Ihre Angaben und die Wahlkreisdaten zeigen in dieselbe Richtung: Nicht die Mittel " +
        "begrenzen, sondern die Dauer. Solange das so ist, erhöhen zusätzliche Mittel die Wirkung " +
        "nur unterproportional.",
      wouldChange: [
        "Läge die Anschlussdauer im Bundesmittel, würde Pfad C an die erste Stelle rücken.",
        "Gewichteten Sie Haushaltsverträglichkeit als sehr wichtig, bliebe die Reihenfolge gleich."
      ],
      notAlternative: {
        pathId: "P-07",
        text: "Pfad B (Förderprogramm ausweiten) setzt an den Mitteln an. Nach Ihren Angaben sind " +
          "die Mittel nicht der begrenzende Faktor. Pfad B bleibt verfügbar und würde vorrangig, " +
          "wenn sich der Engpass auf Finanzierung verschiebt."
      },
      stations: [
        { title: "Politischer Hebel", text: "Verbindliche Bearbeitungsfristen mit Genehmigungsfiktion im Fachrecht.", evidence: "mittel" },
        { title: "Unmittelbare Veränderung", text: "Die Zeit zwischen Antrag und Bescheid sinkt, der Antragsstau baut sich ab.", evidence: "mittel" },
        { title: "Folgewirkung", text: "Investitionsentscheidungen werden planbar, Anschlüsse werden vorgezogen.", evidence: "begrenzt" },
        { title: "Systemwirkung", text: "Der regionale Erzeugungsanteil steigt, die Netzbelastung verteilt sich gleichmässiger.", evidence: "begrenzt" }
      ],
      risks: [
        { text: "Fristen ohne zusätzliches Personal können die Prüftiefe senken.", evidence: "mittel" },
        { text: "Genehmigungsfiktionen erhöhen den Klagedruck, wenn Beteiligung verkürzt wird.", evidence: "begrenzt" }
      ]
    },
    {
      id: "P-07",
      letter: "B",
      title: "Förderzugang für kommunale Netzprojekte vereinfachen",
      summary: "Bestehende Programme zusammenführen und den Zugang an die Verwaltungskraft kleiner " +
        "Kommunen anpassen. Wirkt auf die Mittelseite und ist unabhängig vom Verfahrensrecht umsetzbar.",
      match: "Priorität Energie und Netze, Rahmenbedingung Kommunale Eigenverantwortung",
      level: "Bund",
      horizon: "1 bis 2 Jahre",
      evidence: "begrenzt",
      rule: {
        id: "P-07",
        conditions: [
          "die Priorität „Energie und Netze“ genannt ist",
          "kommunale Eigenverantwortung mindestens als wichtig gewichtet wurde"
        ],
        conclusion: "der Zugang zu Mitteln ein nachrangiger, aber eigenständiger Hebel ist",
        basis: "1 Studie, 2 Evaluationsberichte"
      },
      usesIndicators: ["ind_antragsstau", "ind_ee_anteil"],
      follows: "Der Mittelzugang ist nach Ihren Angaben nicht der begrenzende Faktor. Er wirkt " +
        "dennoch eigenständig, weil kleine Kommunen Programme oft aus Kapazitätsgründen nicht abrufen.",
      wouldChange: [
        "Verschöbe sich der Engpass auf Finanzierung, würde dieser Pfad vorrangig.",
        "Bei verlängertem Wirkungshorizont bliebe die Einordnung unverändert."
      ],
      notAlternative: {
        pathId: "P-03",
        text: "Pfad A setzt an der Verfahrensdauer an, die nach Ihren Angaben der begrenzende " +
          "Faktor ist. Deshalb steht Pfad A davor, ohne dass dieser Pfad damit ausgeschlossen wäre."
      },
      stations: [
        { title: "Politischer Hebel", text: "Programme bündeln, Antragswege vereinheitlichen, Pauschalen statt Einzelnachweise.", evidence: "begrenzt" },
        { title: "Unmittelbare Veränderung", text: "Die Zahl abrufender Kommunen steigt, besonders bei kleiner Verwaltung.", evidence: "begrenzt" },
        { title: "Folgewirkung", text: "Projekte starten früher, Eigenanteile werden kalkulierbar.", evidence: "begrenzt" },
        { title: "Systemwirkung", text: "Das Gefälle zwischen finanzstarken und finanzschwachen Kommunen verringert sich.", evidence: "annahme" }
      ],
      risks: [
        { text: "Vereinfachte Nachweise können die Wirkungskontrolle schwächen.", evidence: "mittel" },
        { text: "Mittelabruf allein verändert den Zustand nicht, wenn das Verfahren blockiert.", evidence: "mittel" }
      ]
    },
    {
      id: "P-12",
      letter: "C",
      title: "Personalaufbau in Genehmigungsbehörden gemeinsam mit dem Land",
      summary: "Befristete Personalprogramme und Qualifizierung für Genehmigungsbehörden, verbunden " +
        "mit einer Bund-Land-Vereinbarung über Zuständigkeiten und Kostenteilung.",
      match: "Engpass Verfahren, Handlungsebene Bund und Land",
      level: "Bund und Land",
      horizon: "3 bis 5 Jahre",
      evidence: "begrenzt",
      rule: {
        id: "P-12",
        conditions: [
          "der genannte Engpass „Verfahren“ ist",
          "die Handlungsebene Land umfasst",
          "keine rote Linie „Verwaltungsbelastung der Kommunen“ gesetzt ist"
        ],
        conclusion: "der Personalweg ein flankierender Hebel ist",
        basis: "3 Evaluationsberichte"
      },
      usesIndicators: ["ind_anschlussdauer", "ind_personalquote"],
      follows: "Fristen ohne Bearbeitungskapazität verlagern das Problem. Dieser Pfad ergänzt " +
        "Pfad A und ist ohne ihn nur begrenzt wirksam.",
      wouldChange: [
        "Läge die Besetzungsquote vor, liesse sich dieser Pfad deutlich sicherer einordnen.",
        "Ohne Pfad A bliebe die Wirkung dieses Pfades nach der Datenlage gering."
      ],
      notAlternative: null,
      stations: [
        { title: "Politischer Hebel", text: "Bund-Land-Vereinbarung über befristete Stellen und Qualifizierung.", evidence: "begrenzt" },
        { title: "Unmittelbare Veränderung", text: "Bearbeitungskapazität in den Behörden steigt.", evidence: "begrenzt" },
        { title: "Folgewirkung", text: "Der Antragsstau baut sich schneller ab, auch ohne Fristenregelung.", evidence: "annahme" },
        { title: "Systemwirkung", text: "Verfahrensdauern nähern sich dem Bundesmittel an.", evidence: "annahme" }
      ],
      risks: [
        { text: "Befristete Stellen sind im Fachkräftemarkt schwer besetzbar.", evidence: "mittel" },
        { text: "Ohne Verfahrensvereinfachung verpufft zusätzliches Personal teilweise.", evidence: "begrenzt" }
      ]
    }
  ];

  /* --- Wirkungsraeume (ERFUNDEN, qualitativ) --------------------------- */
  var spaces = [
    { key: "mensch", label: "Mensch", items: [
      { text: "Planbare Anschlusszeiten senken Unsicherheit bei Bauvorhaben und Betriebsansiedlungen.", evidence: "begrenzt" },
      { text: "Kürzere Verfahren können die Belastung von Antragstellenden verringern.", evidence: "mittel" }
    ]},
    { key: "planet", label: "Planet", items: [
      { text: "Ein früherer Anschluss regionaler Erzeugung kann den Erzeugungsanteil vor Ort erhöhen.", evidence: "mittel" },
      { text: "Verkürzte Verfahren sagen nichts über die ökologische Qualität der Vorhaben aus.", evidence: "hoch" }
    ]},
    { key: "demokratie", label: "Demokratie", items: [
      { text: "Verkürzte Beteiligungsfristen können die Akzeptanz vor Ort schwächen.", evidence: "mittel" },
      { text: "Nachvollziehbare Fristen erhöhen die Verlässlichkeit von Verwaltungshandeln.", evidence: "begrenzt" }
    ]}
  ];

  /* --- Sensitivitaet (ERFUNDEN) ---------------------------------------- */
  var sensitivity = [
    { id: "s_haushalt", label: "Haushaltsverträglichkeit stärker gewichten", changed: false,
      text: "An der Reihenfolge würde sich nichts ändern. Der begrenzende Faktor bleibt die Verfahrensdauer, und Pfad A ist nicht mittelintensiv." },
    { id: "s_horizont", label: "Wirkungshorizont verlängern", changed: true,
      text: "Dann würde Handlungspfad C an die erste Position rücken, weil Personalaufbau über einen längeren Zeitraum stärker wirkt als eine Fristenregelung allein." },
    { id: "s_kommunal", label: "Kommunale Eigenverantwortung höher priorisieren", changed: true,
      text: "Dann würde Handlungspfad B an die erste Position rücken, weil der vereinfachte Mittelzugang unmittelbar bei den Kommunen ansetzt." },
    { id: "s_verfahren", label: "Verfahrensbeschleunigung als gesetzt annehmen", changed: true,
      text: "Dann würde Handlungspfad B an die erste Position rücken, weil die Verfahrensdauer dann nicht mehr der begrenzende Faktor wäre." },
    { id: "s_verteilung", label: "Regionale Verteilungswirkung stärker gewichten", changed: false,
      text: "An der Reihenfolge würde sich nichts ändern. Alle drei Pfade wirken im Wahlkreis gleichgerichtet." }
  ];

  /* --- Politik-Kit (ERFUNDEN) ------------------------------------------ */
  var toolkit = {
    pruefrage: "Wie hat sich die mittlere Dauer zwischen Anschlussantrag und Netzanschluss im " +
      "Wahlkreis seit 2023 entwickelt, und welcher Anteil der Verzögerung entfällt auf " +
      "Bearbeitungszeiten in den Behörden gegenüber Wartezeiten auf Netzkapazität?",
    indikatoren: [
      "Mittlere Dauer von Antrag bis Netzanschluss in Monaten, jährlich, Wahlkreisebene",
      "Anteil der Anträge, die innerhalb der gesetzlichen Frist beschieden werden",
      "Zahl offener Anschlussanträge zum Stichtag, im Zeitverlauf"
    ],
    dialogfrage: "Wenn Sie an ein konkretes Vorhaben denken, das bei Ihnen ins Stocken geraten " +
      "ist: An welcher Stelle genau lag die Wartezeit, und wer hätte sie auflösen können?",
    ersterschritt: "Eine schriftliche Anfrage zur Aufschlüsselung der Bearbeitungszeiten nach " +
      "Verfahrensschritt stellen. Das erzeugt die Datengrundlage, die derzeit für die " +
      "Besetzungsquote fehlt, und ist ohne Gesetzesänderung möglich."
  };

  return {
    isMock: true,
    dataAsOf: "30.06.2026",
    methodVersion: "1.0-Entwurf",
    districts: districts,
    topics: topics,
    goals: goals,
    bottlenecks: bottlenecks,
    horizons: horizons,
    levels: levels,
    frameRows: frameRows,
    frameScale: frameScale,
    redLines: redLines,
    sources: sources,
    indicators: indicators,
    levers: levers,
    paths: paths,
    spaces: spaces,
    sensitivity: sensitivity,
    toolkit: toolkit
  };
})();
