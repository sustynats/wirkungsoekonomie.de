/* Versionierte Instrumentenmodule für Teil 3 des Wahlkreis-Wirkungschecks.
 * Redaktioneller Methodenstand 2026.1. Die Texte werden ausschließlich aus
 * dieser Deklaration gelesen; die Anwendung enthält keine Instrumentenlogik
 * oder Instrumententexte als Sonderfall. */
(function () {
  "use strict";

  var assessmentOptions = [
    { id: "very_useful", label: "Sehr sinnvoll", hint: "Der Ansatz erscheint grundsätzlich tragfähig." },
    { id: "rather_useful", label: "Eher sinnvoll", hint: "Der Ansatz könnte unter Bedingungen tragfähig sein." },
    { id: "mixed", label: "Teils, teils", hint: "Potenziale und Risiken halten sich aus Ihrer Sicht die Waage." },
    { id: "rather_not_useful", label: "Eher nicht sinnvoll", hint: "Sie sehen überwiegend offene Probleme oder Risiken." },
    { id: "not_useful", label: "Nicht sinnvoll", hint: "Der Ansatz überzeugt Sie grundsätzlich nicht." },
    { id: "undecided", label: "Noch nicht beurteilbar", hint: "Sie möchten sich ohne weitere Prüfung nicht festlegen." }
  ];

  var instruments = [
    {
      instrument_id: "WOEK_PRODUCT_IMPACT_TAX",
      version: "2026.1",
      title: "Produktwirkungssteuer",
      short_explanation: "Heute richtet sich die Umsatzsteuer im Wesentlichen nach Produktkategorien. Der WÖk-Ansatz prüft, ob nachweisbare Produktwirkungen innerhalb eines rechtlich und europäisch anschlussfähigen Rahmens in die steuerliche Differenzierung einfließen könnten.",
      detailed_explanation: "Der Ansatz legt keine Steuersätze fest. Er beschreibt eine mögliche Prüfkette aus Wirkungsdaten, Produkt-Scorecard, Prüfung zentraler Wirkungsfelder, Nichtkompensation sowie rechtsstaatlicher und sozialer Absicherung. Erst ein demokratisches Gesetzgebungsverfahren könnte entscheiden, ob und wie diese Informationen steuerlich berücksichtigt werden.",
      baseline: "Innerhalb heutiger Steuerkategorien verändert die konkrete ökologische oder soziale Wirkung eines Produkts den Umsatzsteuersatz grundsätzlich nicht.",
      mechanism: "Standardisierte Wirkungsdaten → Produkt-Scorecard → Prüfung von Klima, Ressourcen und Kreislauf, Arbeit und Fairness sowie Gesundheit und Sicherheit → Nichtkompensationsprüfung → mögliche steuerliche Differenzierung.",
      potential_benefits: ["Preissignale könnten stärker an überprüfbare Folgen statt allein an Kategorien anknüpfen.", "Wirkungsdaten, Rechtsmittel und Vergleichbarkeit würden zu prüfbaren Voraussetzungen."],
      risks: ["Unzureichende Daten, komplexer Vollzug oder die Benachteiligung kleiner Betriebe können den Ansatz verzerren.", "Ohne soziale Absicherung können Preiswirkungen Haushalte unterschiedlich belasten."],
      open_evidence: "Offen sind insbesondere Datenqualität entlang globaler Lieferketten, die zusätzliche Wirkung gegenüber bestehenden Regeln, EU-Kompatibilität, Verwaltungsaufwand und Verteilungsfolgen.",
      methodology_reference: { label: "Produktwirkungssteuer und Wirkungsumsatzsteuer", href: "../../wirkungssteuerung/wustg/" },
      further_reading: [
        { label: "Produkt-Scorecards im Online-Buch", href: "../../referenz/kapitel-050-produktscorecards/", text: "Wie Vergleichbarkeit, Datenqualität und Grenzen von Produktbewertungen zusammenhängen." },
        { label: "Ehrliche Preise im Online-Buch", href: "../../referenz/kapitel-049-ehrliche-preise/", text: "Warum Preissignale Folgen nicht automatisch vollständig abbilden." }
      ],
      status: "Methodischer Arbeitsstand. Keine Festlegung konkreter Steuersätze.",
      alternatives: [
        { title: "Wirkungsorientierte öffentliche Beschaffung", text: "Wirkungskriterien werden zunächst bei öffentlichen Einkäufen erprobt." },
        { title: "Transparente Produkt-Scorecards", text: "Wirkungsinformationen unterstützen Entscheidungen, ohne eine Steuerlogik vorauszusetzen." },
        { title: "Mindeststandards oder gezielte Förderung", text: "Rechtsstandards oder Förderung adressieren einzelne Risiken und Zielgruppen." }
      ],
      diagnostic: { topics: ["wirtschaft", "energie", "klima"], roles: ["bund_recht", "bund_finanzierung"], bottlenecks: ["finanzierung", "daten"] }
    },
    {
      instrument_id: "WOEK_NON_COMPENSATION",
      version: "2026.1",
      title: "Nichtkompensation und Schutzgrenzen",
      short_explanation: "Eine positive Veränderung in einem Feld kann eine schwere negative Folge in einem anderen Feld nicht beliebig aufwiegen.",
      detailed_explanation: "Der Ansatz unterscheidet Zielkonflikte von nicht kompensierbaren Grenzen. Er verlangt, Schutzgüter und Rechtsschutz vorab zu benennen, statt sie nachträglich in einer Gesamtnote zu verrechnen.",
      baseline: "Politische Programme und Bewertungen arbeiten häufig mit zusammengefassten Kennzahlen oder Einzelzielen. Schwere Nebenfolgen können dadurch zu spät sichtbar werden.",
      mechanism: "Zielzustand und rote Linien vorab bestimmen → Risiken getrennt beobachten → bei Verletzung keine positive Netto-Wirkung behaupten → anpassen, aussetzen oder neu gestalten.",
      potential_benefits: ["Schutz von Grundrechten, Teilhabe und ökologischen Grenzen wird nicht in einem Gesamtwert verdeckt.", "Zielkonflikte werden vor der Ausweitung politisch entscheidbar."],
      risks: ["Zu unklare oder zu viele Grenzen können Entscheidungen blockieren.", "Die Festlegung von Grenzen braucht demokratische Legitimation, Rechtsschutz und nachvollziehbare Evidenz."],
      open_evidence: "Offen ist im Einzelfall, welche Folgen die Schwelle einer nicht kompensierbaren Grenze erreichen und wer darüber rechtsstaatlich entscheidet.",
      methodology_reference: { label: "Nichtkompensationsprinzip", href: "../../begriffe/nichtkompensationsprinzip/" },
      further_reading: [
        { label: "Reverse Merit Order", href: "../../werkzeuge/reverse-merit-order/", text: "Begrenzende Faktoren und schwere Risiken zuerst bearbeiten." },
        { label: "Wirkungsrisiko verstehen", href: "../../begriffe/wirkungsrisiko/", text: "Warum ein mögliches Risiko keine tatsächlich eingetretene Wirkung ist." }
      ],
      status: "Methodischer Grundsatz. Er ersetzt keine demokratische Abwägung.",
      alternatives: [
        { title: "Verbindliche Schutzstandards", text: "Mindeststandards sichern einzelne Schutzgüter unmittelbar ab." },
        { title: "Folgenabschätzung mit Rechtsschutz", text: "Risiken werden systematisch geprüft und anfechtbar gemacht." }
      ],
      diagnostic: { topics: [], roles: ["bund_recht", "bund_rueckkopplung"], bottlenecks: ["daten", "verfahren"] }
    },
    {
      instrument_id: "WOEK_LEGISLATIVE_IMPACT_FEEDBACK",
      version: "2026.1",
      title: "Gesetzliche Wirkungsrückkopplung",
      short_explanation: "Bei Gesetzen und Programmen wird vorab zwischen Wirkungspotenzial und später beobachteter Wirkung unterschieden. Die Rückkopplung legt fest, was bei Abweichungen geschieht.",
      detailed_explanation: "Ex ante werden Wirkannahme, Zielgruppen, Indikatoren und mögliche Risiken benannt. Ex post wird beobachtet, ob sich relevante Zustände verändern. Eine Rückkopplung verbindet diese Beobachtung mit einer vorher bestimmten Entscheidung: bestätigen, anpassen, aussetzen oder neu gestalten.",
      baseline: "Evaluationen und Berichte stehen häufig neben einem Gesetz oder Programm, ohne dass vorab bestimmt ist, wer bei negativen Befunden welche Korrekturentscheidung trifft.",
      mechanism: "Wirkungshypothese → Indikatoren und Beobachtungszeitpunkt → Veröffentlichung nach Gruppen und Orten → verbindlicher Korrekturtrigger → parlamentarisch und rechtsstaatlich verantwortete Anpassung.",
      potential_benefits: ["Fehlsteuerungen können vor einer breiten Verstetigung sichtbar werden.", "Bundesweite und lokale Rückmeldung werden mit einer Entscheidung statt nur mit Reporting verbunden."],
      risks: ["Zu enge Kennzahlen können komplexe Aufgaben verzerren.", "Daten- oder Berichtspflichten können zusätzliche Belastung erzeugen, wenn sie nicht in den Vollzug passen."],
      open_evidence: "Offen bleiben je Regel die geeignete Gegenfaktik, die Zeit bis zu belastbaren Signalen und die institutionelle Unabhängigkeit der Auswertung.",
      methodology_reference: { label: "Wirkungsrückkopplung", href: "../../begriffe/wirkungsrueckkopplung/" },
      further_reading: [
        { label: "Von Wirkung zu Messung", href: "../../referenz/kapitel-030-von-wirkung-zu-messung/", text: "Indikatoren, Evidenzgrenzen und Korrekturentscheidungen im Zusammenhang." },
        { label: "Wirkungscontrolling", href: "../../werkzeuge/impact-controlling/", text: "Wie Beobachtung erst durch Rückkopplung zur Steuerung wird." }
      ],
      status: "Methodischer Arbeitsstand für lernfähige Regulierung.",
      alternatives: [
        { title: "Befristung mit Evaluation", text: "Eine Regel endet oder wird überprüft, sofern eine Evaluation nicht rechtzeitig vorliegt." },
        { title: "Pilotierung mit Ausweitungsvorbehalt", text: "Eine Maßnahme wird zunächst begrenzt erprobt und nur unter transparenten Bedingungen ausgeweitet." }
      ],
      diagnostic: { topics: [], roles: ["bund_recht", "bund_rueckkopplung", "bund_vollzug"], bottlenecks: ["daten", "verfahren", "koordination"] }
    },
    {
      instrument_id: "WOEK_IMPACT_BUDGETING",
      version: "2026.1",
      title: "Wirkungshaushalt",
      short_explanation: "Ein Wirkungshaushalt fragt neben dem Mitteleinsatz, welche Zustände öffentliche Programme tatsächlich verändern sollen und woran dies überprüft wird.",
      detailed_explanation: "Input, Output, Outcome und Impact werden getrennt betrachtet. Ein Wirkungshaushalt ergänzt Haushaltsrecht und parlamentarische Entscheidung um Zielzustände, Zielgruppen, Indikatoren, Risiken, Beobachtungszeitpunkte und Rückkopplung.",
      baseline: "Haushalte und Programme dokumentieren vor allem Titel, Mittelansatz und Mittelabfluss. Diese Angaben sind notwendig, belegen aber noch keine Zustandsveränderung.",
      mechanism: "Öffentliche Mittel → klarer Zielzustand und Wirkungsraum → getrennte Beobachtung von Umsetzung und Ergebnis → Risiken und Nebenfolgen → Rückkopplung in die parlamentarische Steuerung.",
      potential_benefits: ["Programme können nach ihrem Beitrag zu nachvollziehbaren Zuständen geprüft werden.", "Blindleistung, Doppelstrukturen und Folgekosten können früher sichtbar werden."],
      risks: ["Messbare Aufgaben könnten gegenüber komplexen, langfristigen oder schwer messbaren Aufgaben bevorzugt werden.", "Kennzahlen können strategisch bedient oder politisch beeinflusst werden."],
      open_evidence: "Offen bleiben geeignete Indikatoren für komplexe Aufgaben, der zusätzliche Aufwand, die demokratische Steuerung von Zielkonflikten und die tatsächliche Lernwirkung im Haushalt.",
      methodology_reference: { label: "Wirkungshaushalt", href: "../../wirkungssteuerung/wirkungshaushalt/" },
      further_reading: [
        { label: "Von Wirkung zu Messung", href: "../../referenz/kapitel-030-von-wirkung-zu-messung/", text: "Messung als Teil einer transparenten Wirkungsarchitektur." },
        { label: "Wirkungscontrolling", href: "../../werkzeuge/impact-controlling/", text: "Input, Output, Outcome und Wirkung getrennt betrachten." }
      ],
      status: "Methodischer Arbeitsstand. Kennzahlen ersetzen keine Haushaltsentscheidung.",
      alternatives: [
        { title: "Programm- und Ausgabenreview", text: "Bestehende Programme werden regelmäßig auf Zweck, Aufwand und Ergebnis geprüft." },
        { title: "Zielorientierte Haushaltsbegründung", text: "Haushaltsansätze werden stärker mit Zielen und Rechenschaft verbunden." }
      ],
      diagnostic: { topics: [], roles: ["bund_finanzierung", "bund_rueckkopplung"], bottlenecks: ["finanzierung", "daten", "koordination"] }
    },
    {
      instrument_id: "WOEK_FUNDING_FEEDBACK",
      version: "2026.1",
      title: "Fördermittel-Rückkopplung",
      short_explanation: "Förderung wird nicht nur nach Bewilligung und Mittelabfluss betrachtet. Sie wird überprüft, wenn die angenommene Zielwirkung trotz Umsetzung wiederholt ausbleibt.",
      detailed_explanation: "Vor Förderbeginn werden Zielgruppe, erwarteter Mechanismus, zusätzliches Ergebnis, Datenbedarf und ein Korrekturpunkt offengelegt. Rückkopplung bedeutet nicht automatische Sanktion: Sie kann auch Zugang, Förderkriterium, Laufzeit, Begleitung oder Vollzug ändern.",
      baseline: "Förderprogramme werden häufig über Mittelbindung, Anträge oder realisierte Aktivitäten berichtet. Die Frage, ob der angestrebte Zustand zusätzlich erreicht wurde, bleibt oft getrennt davon.",
      mechanism: "Förderbedingung und Wirkannahme → Umsetzung → Beobachtung von Zugang, Zusätzlichkeit und Zielzustand → bei wiederholtem Ausbleiben prüfen und anpassen → begründete Fortsetzung, Änderung oder Beendigung.",
      potential_benefits: ["Mitnahmeeffekte und Zugangsbarrieren können früher sichtbar werden.", "Förderung kann auf den tatsächlich begrenzenden Faktor nachgesteuert werden."],
      risks: ["Kurzfristige Messung kann langfristige oder komplexe Vorhaben benachteiligen.", "Zu hohe Nachweislast kann kleine Träger, Kommunen oder Unternehmen ausschließen."],
      open_evidence: "Offen bleiben Additionalität, realistische Beobachtungszeiträume, geeignete Vergleichsmaßstäbe und eine verhältnismäßige Nachweisarchitektur.",
      methodology_reference: { label: "Beschaffung, Förderung und Wirkung", href: "../../wirkungssteuerung/beschaffung-foerderung/" },
      further_reading: [
        { label: "Reverse Merit Order", href: "../../werkzeuge/reverse-merit-order/", text: "Mittel auf den tatsächlich begrenzenden Faktor ausrichten." },
        { label: "Wirkungsrückkopplung", href: "../../begriffe/wirkungsrueckkopplung/", text: "Korrekturpunkte vor der Ausweitung sichtbar machen." }
      ],
      status: "Methodischer Arbeitsstand für lernfähige Förderlogik.",
      alternatives: [
        { title: "Stufenweise Förderung", text: "Förderung wird in nachvollziehbaren Lern- und Entwicklungsstufen fortgesetzt." },
        { title: "Begleitende Beratung und Vollzugshilfe", text: "Zugang und Umsetzung werden verbessert, bevor eine Zielverfehlung allein sanktioniert wird." }
      ],
      diagnostic: { topics: [], roles: ["bund_finanzierung", "bund_rueckkopplung"], bottlenecks: ["finanzierung", "daten", "verfahren"] }
    },
    {
      instrument_id: "WOEK_IMPACT_DATA",
      version: "2026.1",
      title: "Wirkungsdaten und Daten-Governance",
      short_explanation: "Wirkungsdaten verbinden Zielzustände, Indikatoren, Datenqualität, Herkunft und Korrekturentscheidung. Sie sollen Reporting nicht mit Wirkung verwechseln.",
      detailed_explanation: "Ein Datenansatz beschreibt, welche Daten für welche Behauptung geeignet sind, wie Unsicherheit kenntlich bleibt, wer Daten verantwortet und wie Betroffene, Datenschutz, Interoperabilität und Rechtsschutz gesichert werden. Daten allein treffen keine politischen Entscheidungen.",
      baseline: "Daten liegen oft getrennt nach Ressorts, Ebenen und Verfahren vor. Mittel- und Leistungsdaten sind häufig besser verfügbar als Daten zu Zugang, Verteilung, Risiken oder langfristigen Zustandsveränderungen.",
      mechanism: "Dateninventur und Herkunft → gemeinsame Begriffe und Qualitätsangaben → Auswertung nach relevanten Gruppen und Orten → Evidenzgrenze offenlegen → Rückkopplung in eine verantwortete Entscheidung.",
      potential_benefits: ["Datenlücken, regionale Unterschiede und Nebenfolgen können gezielter sichtbar werden.", "Entscheidungen können ihre Annahmen und Unsicherheiten nachvollziehbar offenlegen."],
      risks: ["Zusammenführung von Daten kann Datenschutz, Zweckbindung und Informationssicherheit gefährden.", "Ein scheinbar vollständiges Dashboard kann komplexe Zusammenhänge oder nicht messbare Erfahrungen verdrängen."],
      open_evidence: "Offen bleiben Datenzugang, Qualität, Vergleichbarkeit, Datenschutz, Reidentifikationsrisiken und die Frage, welche Daten tatsächlich für eine kausale Aussage genügen.",
      methodology_reference: { label: "Wirkungsdatenräume", href: "../../werkzeuge/wirkungsdatenraeume/" },
      further_reading: [
        { label: "Wirkungsmessung, Manipulation und Wirkungssimulation", href: "../../referenz/kapitel-104-wirkungsmessung-manipulation-und-wirkungssimulation/", text: "Wie Kennzahlen verzerren können und welche Grenzen offen bleiben müssen." },
        { label: "Von Wirkung zu Messung", href: "../../referenz/kapitel-030-von-wirkung-zu-messung/", text: "Wie Datenbehauptungen und Wirkungsannahmen getrennt geprüft werden." }
      ],
      status: "Methodischer Arbeitsstand. Daten sind Entscheidungshilfe, kein automatisches Entscheidungssystem.",
      alternatives: [
        { title: "Unabhängige Evaluation", text: "Konkrete Programme werden mit einem passenden Evaluationsdesign untersucht." },
        { title: "Regionale Wirkungsberichte", text: "Bundesweite Daten werden durch nachvollziehbare Rückmeldung aus Umsetzungsräumen ergänzt." }
      ],
      diagnostic: { topics: ["digital", "staat"], roles: ["bund_rueckkopplung", "bund_vollzug"], bottlenecks: ["daten", "koordination", "verfahren"] }
    }
  ];

  var requirements = [
    { id: "verifiable_data", label: "Überprüfbare Daten", hint: "Datenherkunft, Qualität und Unsicherheit sind offen gelegt." },
    { id: "low_admin_burden", label: "Verhältnismäßiger Verwaltungsaufwand", hint: "Keine unnötige Mehrfacherfassung oder unverhältnismäßige Nachweislast." },
    { id: "transparent_method", label: "Transparente Methode", hint: "Regeln, Gewichtungen und Evidenzgrenzen sind öffentlich prüfbar." },
    { id: "sme_protection", label: "Schutz kleiner und mittlerer Unternehmen", hint: "Übergänge und Nachweise schließen kleinere Betriebe nicht strukturell aus." },
    { id: "eu_compatibility", label: "Europäische Anschlussfähigkeit", hint: "Rechtsrahmen, Wettbewerb und Datenstandards sind mitgedacht." },
    { id: "independent_governance", label: "Unabhängige Governance", hint: "Prüfung und Korrektur sind nicht allein von Einzelinteressen abhängig." },
    { id: "appeal_rights", label: "Rechtsschutz und Einspruch", hint: "Einstufungen und Entscheidungen bleiben begründbar und anfechtbar." },
    { id: "budget_neutrality", label: "Nachvollziehbare Verteilungs- und Haushaltsfolgen", hint: "Belastungen, Entlastungen und Folgekosten werden offen gelegt." },
    { id: "not_judged", label: "Noch nicht beurteilbar", hint: "Sie möchten diese Voraussetzungen zunächst nicht gewichten.", exclusive: true }
  ];

  window.WC_INSTRUMENTS = {
    version: "2026.1",
    assessmentOptions: assessmentOptions,
    instruments: instruments,
    questions: [
      {
        question_id: "q_inst_product_tax", instrument_id: "WOEK_PRODUCT_IMPACT_TAX", version: "2026.1", display_order: 1,
        question_text: "Wie bewerten Sie grundsätzlich die Idee, Produktsteuern teilweise an nachweisbare Produktwirkungen statt ausschließlich an Produktkategorien zu koppeln?",
        answer_type: "single", answer_options: assessmentOptions, short: "Produktwirkungssteuer", required: true
      },
      {
        question_id: "q_inst_product_tax_conditions", instrument_id: "WOEK_PRODUCT_IMPACT_TAX", version: "2026.1", display_order: 2,
        question_text: "Welche Voraussetzungen wären für einen solchen Ansatz aus Ihrer Sicht besonders wichtig?",
        answer_type: "multi", answer_options: requirements, max: 5, short: "Voraussetzungen", required: true
      },
      {
        question_id: "q_inst_non_compensation", instrument_id: "WOEK_NON_COMPENSATION", version: "2026.1", display_order: 3,
        question_text: "Wie bewerten Sie den Grundsatz, schwere negative Folgen in einem Schutzgut nicht durch positive Werte in anderen Feldern zu verrechnen?",
        answer_type: "single", answer_options: assessmentOptions, short: "Nichtkompensation", required: true
      },
      {
        question_id: "q_inst_legislative_feedback", instrument_id: "WOEK_LEGISLATIVE_IMPACT_FEEDBACK", version: "2026.1", display_order: 4,
        question_text: "Welche Elemente sollten bei einer gesetzlichen Wirkungsrückkopplung vor der Ausweitung verbindlich geklärt sein?",
        answer_type: "multi", answer_options: [
          { id: "hypothesis", label: "Eine überprüfbare Wirkungshypothese", hint: "Der angenommene Weg von der Regel zur Zustandsveränderung." },
          { id: "indicators", label: "Vorab definierte Indikatoren", hint: "Signale für Zielzustand, Zugang, Verteilung und Risiken." },
          { id: "trigger", label: "Ein vorab definierter Korrekturtrigger", hint: "Wann bestätigt, angepasst, ausgesetzt oder neu gestaltet wird." },
          { id: "rights", label: "Rechtsschutz und öffentliche Nachvollziehbarkeit", hint: "Zuständigkeit, Begründung und Einspruch bleiben sichtbar." },
          { id: "not_judged", label: "Noch nicht beurteilbar", hint: "Sie möchten diese Elemente zunächst nicht gewichten.", exclusive: true }
        ], max: 4, short: "Gesetzesrückkopplung", required: true
      },
      {
        question_id: "q_inst_impact_budgeting", instrument_id: "WOEK_IMPACT_BUDGETING", version: "2026.1", display_order: 5,
        question_text: "Wie bewerten Sie grundsätzlich einen Haushalt, der öffentliche Programme zusätzlich an klaren Wirkungszielen und Rückkopplung ausrichtet?",
        answer_type: "single", answer_options: assessmentOptions, short: "Wirkungshaushalt", required: true
      },
      {
        question_id: "q_inst_impact_budgeting_risks", instrument_id: "WOEK_IMPACT_BUDGETING", version: "2026.1", display_order: 6,
        question_text: "Welche Risiken eines Wirkungshaushalts müssten besonders begrenzt werden?",
        answer_type: "multi", answer_options: [
          { id: "admin_burden", label: "Zusätzlicher Verwaltungsaufwand", hint: "Neue Berichts- und Abstimmungsarbeit darf Vollzug nicht lähmen." },
          { id: "metric_gaming", label: "Strategische Bedienung von Kennzahlen", hint: "Messwerte dürfen nicht wichtiger werden als der Zielzustand." },
          { id: "measurement_bias", label: "Mess- und Verzerrungsrisiken", hint: "Datenlücken oder Gruppenunterschiede dürfen nicht unsichtbar bleiben." },
          { id: "complex_task_disadvantage", label: "Benachteiligung komplexer Aufgaben", hint: "Schwer messbare, langfristige oder präventive Aufgaben dürfen nicht verlieren." },
          { id: "political_manipulation", label: "Politische Manipulation", hint: "Ziele und Kennzahlen brauchen öffentliche und unabhängige Kontrolle." },
          { id: "over_rigidity", label: "Übermäßige Starrheit", hint: "Lernen und begründete Anpassung müssen möglich bleiben." },
          { id: "not_judged", label: "Noch nicht beurteilbar", hint: "Sie möchten diese Risiken zunächst nicht gewichten.", exclusive: true }
        ], max: 4, short: "Haushaltsrisiken", required: true
      },
      {
        question_id: "q_inst_funding_feedback", instrument_id: "WOEK_FUNDING_FEEDBACK", version: "2026.1", display_order: 7,
        question_text: "Soll ein Förderprogramm überprüft und gegebenenfalls angepasst werden, wenn Umsetzung stattfindet, die angenommene Zielwirkung jedoch wiederholt ausbleibt?",
        answer_type: "single", answer_options: assessmentOptions, short: "Fördermittel-Rückkopplung", required: true
      },
      {
        question_id: "q_inst_impact_data", instrument_id: "WOEK_IMPACT_DATA", version: "2026.1", display_order: 8,
        question_text: "Wie bewerten Sie grundsätzlich gemeinsame Wirkungsdaten mit offener Datenqualität, Evidenzgrenzen und Rückkopplung in politische Entscheidungen?",
        answer_type: "single", answer_options: assessmentOptions, short: "Wirkungsdaten", required: true
      },
      {
        question_id: "q_inst_interest", instrument_id: null, version: "2026.1", display_order: 9,
        question_text: "Welche der vorgestellten Ansätze erscheinen Ihnen für politische Steuerung besonders prüfenswert?",
        answer_type: "instrument_multi", max: 3, short: "Prüfwerte Ansätze", required: true
      },
      {
        question_id: "q_inst_district_interest", instrument_id: null, version: "2026.1", display_order: 10,
        question_text: "Bei welchem Ansatz würden Sie gerne sehen, wie er auf ein konkretes Problem Ihres Wahlkreises angewendet werden könnte?",
        answer_type: "instrument_single", short: "Vertiefung", required: false
      }
    ]
  };
}());
