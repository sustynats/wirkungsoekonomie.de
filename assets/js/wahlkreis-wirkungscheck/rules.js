/* Deterministisches, offen einsehbares Regelwerk.
 * Ein Pfad wird nur gezeigt, wenn jede Bedingung einen freigegebenen Text hat.
 * Die Texte beschreiben eine Prüfherleitung, keine Wahl- oder Personenempfehlung. */
(function () {
  "use strict";

  function includes(field, value) {
    return function (answers) {
      var selected = answers[field] || [];
      return Array.isArray(selected) && selected.indexOf(value) > -1;
    };
  }

  function anyOf(field, values) {
    return function (answers) {
      var selected = answers[field] || [];
      return Array.isArray(selected) && values.some(function (value) { return selected.indexOf(value) > -1; });
    };
  }

  var paths = [
    {
      id: "P-BUND-RECHT", letter: "A", title: "Rechts- und Vollzugsfolgen vor der Entscheidung prüfen",
      summary: "Prüfpfad für eine bundespolitische Regel: Zielzustand, Vollzugsschritte und Rückkopplung werden gemeinsam offengelegt.",
      level: "Bund", horizon: "wahlperiodenübergreifend", evidence: "annahme", source: "method",
      rule: {
        id: "R-BUND-RECHT-01",
        conditions: [
          { field: "q_bundesrolle", op: "includes", value: "bund_recht", text: "die bundespolitische Rolle „Rechtsrahmen und Standards“ ausgewählt wurde" },
          { field: "q_engpass", op: "includes", value: "verfahren", text: "Regeln und Verfahren als Engpass genannt wurden" }
        ],
        conclusion: { text: "ein Rechts- und Vollzugscheck vor einer konkreten Regeländerung vorrangig ist" },
        basis: "Methodischer Prüfpfad der Wirkungsökonomie"
      },
      direct: "Direkt würde eine konkrete Regel die Entscheidungs- und Vollzugsschritte verändern.",
      indirect: "Indirekt können sich Zugang, Planbarkeit und Belastungen für Betroffene, Länder und Kommunen verändern.",
      risks: ["Eine Regel ohne Vollzugsprüfung kann neue Wartezeiten oder Verlagerungen erzeugen.", "Reporting ohne Rückkopplung zeigt Aktivität, aber keine tatsächliche Veränderung."],
      stations: [
        { title: "Bundespolitischer Hebel", text: "Regel, Standard oder Verfahren präzisieren.", evidence: "annahme" },
        { title: "Direkte Folge", text: "Entscheidungs- und Vollzugsschritte ändern sich.", evidence: "annahme" },
        { title: "Indirekte Folge", text: "Zugang und Planbarkeit können sich für Betroffene und Orte verändern.", evidence: "annahme" },
        { title: "Rückkopplung", text: "Frühe Vollzugs- und Zustandsindikatoren prüfen, ob die Annahme trägt.", evidence: "annahme" }
      ]
    },
    {
      id: "P-BUND-FINANZIERUNG", letter: "B", title: "Anreiz- und Finanzierungsarchitektur auf Wirkung prüfen",
      summary: "Prüfpfad für Bundesmittel und Anreize: Nicht nur die Mittelmenge, sondern Zugang, Reihenfolge und Vollzug werden sichtbar gemacht.",
      level: "Bund", horizon: "mittelfristig", evidence: "annahme", source: "method",
      rule: {
        id: "R-BUND-FIN-01",
        conditions: [
          { field: "q_bundesrolle", op: "includes", value: "bund_finanzierung", text: "die bundespolitische Rolle „Finanzierung und Anreize“ ausgewählt wurde" },
          { field: "q_engpass", op: "includes", value: "finanzierung", text: "Finanzierung und Anreize als Engpass genannt wurden" }
        ],
        conclusion: { text: "zuerst die Anreiz- und Zugangsarchitektur geprüft werden sollte" },
        basis: "Methodischer Prüfpfad der Wirkungsökonomie"
      },
      direct: "Direkt verändern sich Zugangsvoraussetzungen, Mittelbindungen und Anreize.",
      indirect: "Indirekt können Investitionen, kommunaler Handlungsspielraum und Verteilungswirkungen beeinflusst werden.",
      risks: ["Zusätzliche Mittel können am begrenzenden Faktor vorbeigehen.", "Komplexe Anträge können Wirkung zugunsten besser ausgestatteter Stellen verschieben."],
      stations: [
        { title: "Bundespolitischer Hebel", text: "Mittel, Kriterien und Zugang gestalten.", evidence: "annahme" },
        { title: "Direkte Folge", text: "Anreize und verfügbares Handlungsbudget verändern sich.", evidence: "annahme" },
        { title: "Indirekte Folge", text: "Umsetzung vor Ort kann sich beschleunigen oder ungleich verteilen.", evidence: "annahme" },
        { title: "Rückkopplung", text: "Zugang, Vollzug und Zustand getrennt beobachten.", evidence: "annahme" }
      ]
    },
    {
      id: "P-BUND-RUECKKOPPLUNG", letter: "C", title: "Wirkungsdaten und Rückkopplung verbindlich machen",
      summary: "Prüfpfad für eine lernfähige Bundespolitik: Annahmen, direkte Folgen und Wirkungsrisiken werden überprüfbar, bevor Fehlsteuerung verfestigt wird.",
      level: "Bund", horizon: "in dieser Wahlperiode", evidence: "annahme", source: "method",
      rule: {
        id: "R-BUND-LOOP-01",
        conditions: [
          { field: "q_bundesrolle", op: "includes", value: "bund_rueckkopplung", text: "die bundespolitische Rolle „Wirkungsdaten und Rückkopplung“ ausgewählt wurde" },
          { field: "q_engpass", op: "anyOf", value: ["daten", "koordination"], text: "Daten und Rückkopplung oder das Zusammenwirken der Ebenen als Engpass genannt wurden" }
        ],
        conclusion: { text: "eine verbindliche Rückkopplung vor der Skalierung einer Maßnahme vorrangig ist" },
        basis: "Methodischer Prüfpfad der Wirkungsökonomie"
      },
      direct: "Direkt werden Annahmen, Zustandsindikatoren und Zuständigkeiten sichtbar und überprüfbar.",
      indirect: "Indirekt kann Politik schneller nachsteuern, wenn sich Folgen für Wahlkreise oder Gruppen anders entwickeln als erwartet.",
      risks: ["Datenerhebung ohne klare Entscheidungsroutine bleibt Reporting.", "Zu grobe Kennzahlen können Verteilungs- und Nebenfolgen verdecken."],
      stations: [
        { title: "Bundespolitischer Hebel", text: "Rückkopplung und Entscheidungspunkt verbindlich festlegen.", evidence: "annahme" },
        { title: "Direkte Folge", text: "Annahmen und frühe Signale werden sichtbar.", evidence: "annahme" },
        { title: "Indirekte Folge", text: "Korrekturen können vor einer breiten Fehlsteuerung möglich werden.", evidence: "annahme" },
        { title: "Rückkopplung", text: "Wirkungsdaten lösen eine nachvollziehbare Entscheidung aus, nicht nur einen Bericht.", evidence: "annahme" }
      ]
    },
    {
      id: "P-BUND-VOLLZUG", letter: "D", title: "Bundesregel und Vollzug vor Ort zusammen prüfen",
      summary: "Prüfpfad für die Verbindung von Bundespolitik und Wahlkreis: Der Bund setzt den Rahmen, die Rückmeldung aus Orten zeigt, ob der Wirkpfad trägt.",
      level: "Bund und Wahlkreis", horizon: "in dieser Wahlperiode", evidence: "annahme", source: "method",
      rule: {
        id: "R-BUND-VOLLZUG-01",
        conditions: [
          { field: "q_bundesrolle", op: "includes", value: "bund_vollzug", text: "die bundespolitische Rolle „Vollzug und Umsetzbarkeit“ ausgewählt wurde" },
          { field: "q_engpass", op: "anyOf", value: ["koordination", "personal", "infrastruktur"], text: "Zusammenwirken der Ebenen, Personal und Fähigkeiten oder Infrastruktur und Zugang als Engpass genannt wurden" }
        ],
        conclusion: { text: "die Vollzugsfolgen vor Ort als Teil der bundespolitischen Entscheidung geprüft werden sollten" },
        basis: "Methodischer Prüfpfad der Wirkungsökonomie"
      },
      direct: "Direkt werden Zuständigkeiten, Ressourcenbedarf und Übergaben zwischen Ebenen geklärt.",
      indirect: "Indirekt kann die Maßnahme im Wahlkreis verständlicher, zugänglicher und verlässlicher werden.",
      risks: ["Eine neue Bundesaufgabe ohne Ressourcen kann kommunale Handlungsfähigkeit schwächen.", "Ein einzelner Wahlkreiswert ersetzt keine Verteilungsanalyse."],
      stations: [
        { title: "Bundespolitischer Hebel", text: "Vollzugsauftrag, Ressourcen und Rückmeldeweg definieren.", evidence: "annahme" },
        { title: "Direkte Folge", text: "Rollen und Übergaben zwischen Ebenen werden klarer.", evidence: "annahme" },
        { title: "Indirekte Folge", text: "Zugang und Verlässlichkeit können vor Ort steigen.", evidence: "annahme" },
        { title: "Rückkopplung", text: "Wahlkreisdaten und Erfahrungen prüfen den Wirkpfad, nicht die Person.", evidence: "annahme" }
      ]
    }
  ];

  /* Die Fallprofile sind keine Politikempfehlungen. Sie machen transparent,
     welche Veränderung durch die gewählte Kombination überhaupt behauptet
     werden müsste, welche Folgeketten dafür tragen müssen und welche Daten
     dafür noch fehlen. Damit bleibt die Antwort auch bei breiten Themen
     konkret, ohne aus einer Auswahl eine Kausalitätsbehauptung zu machen. */
  var topicProfiles = {
    wohnen: {
      subject: "bezahlbaren und angemessenen Wohnraum",
      affected: "Haushalte können eine passende Wohnung nur dann tatsächlich erreichen, wenn Angebot, Zugangsvoraussetzungen und laufende Belastung zusammenpassen.",
      local: "Im Wahlkreis wäre nicht nur Bautätigkeit, sondern der Zugang betroffener Haushalte zu passendem und tragbarem Wohnraum sichtbar zu machen.",
      roles: {
        bund_recht: "Der Bund würde Anspruchs-, Schutz- oder Standardregeln für Wohnen verändern. Direkt zu prüfen ist, ob daraus ein klarerer Zugang entsteht und welche zusätzlichen Nachweise, Fristen oder Kosten dabei entstehen.",
        bund_finanzierung: "Der Bund würde Förder- oder Anreizbedingungen für Wohnraum verändern. Direkt zu prüfen ist, welche zusätzlichen oder gebundenen Wohnungen dadurch wirtschaftlich entstehen können und wer Zugang zu den Mitteln erhält.",
        bund_vollzug: "Der Bund würde die Umsetzbarkeit für Länder, Kommunen, Vermieter oder Träger mitgestalten. Direkt zu prüfen sind Verfahren, Zuständigkeiten und Bearbeitungszeiten entlang des Zugangswegs.",
        bund_rueckkopplung: "Der Bund würde festlegen, ob Wohnungszugang, Kostenbelastung und Verdrängungsrisiken früh genug erfasst werden und wer bei Abweichungen nachsteuert."
      },
      signals: [
        { id: "housing_completion", title: "Fertiggestellte Wohnungen", text: "zeigt Angebotszugang nur als Vorstufe; der Wert belegt weder Bezahlbarkeit noch die Verteilung auf Suchende." },
        { required: "Wohnkostenbelastung nach Einkommensgruppen, verfügbare gebundene Wohnungen und Bearbeitungsdauer", text: "sind für die behauptete Veränderung des tatsächlichen Zugangs zusätzlich erforderlich." }
      ],
      risks: ["Neue Förderung kann in Preissteigerungen, Bodenrenten oder Mitnahmeeffekten aufgehen.", "Ein formal gleicher Zugang kann Haushalte mit geringerer Liquidität, Sprachbarrieren oder unsicheren Mietverhältnissen weiterhin ausschließen."]
    },
    gesundheit: {
      subject: "verlässliche gesundheitliche und pflegerische Versorgung",
      affected: "Menschen profitieren erst, wenn sie eine fachlich passende Versorgung rechtzeitig erreichen und die Übergänge zwischen Angeboten funktionieren.",
      local: "Im Wahlkreis wäre die Versorgung entlang eines konkreten Wegs sichtbar zu machen: Termin, Erreichbarkeit, Übergabe und Kontinuität – nicht nur die Zahl finanzierter Leistungen.",
      roles: {
        bund_recht: "Der Bund würde Zugangs-, Qualitäts- oder Übergabestandards verändern. Direkt zu prüfen ist, ob diese Standards die Versorgungskette schließen oder zusätzliche Dokumentations- und Zugangshürden schaffen.",
        bund_finanzierung: "Der Bund würde Vergütung oder Finanzierung von Versorgung verändern. Direkt zu prüfen ist, ob die Anreize die knappe Leistung tatsächlich dort verfügbar machen, wo Menschen sie benötigen.",
        bund_vollzug: "Der Bund würde Voraussetzungen für die Umsetzung durch Kassen, Länder, Kommunen und Leistungserbringer beeinflussen. Direkt zu prüfen sind Personal, Schnittstellen und die Übernahme zusätzlicher Aufgaben.",
        bund_rueckkopplung: "Der Bund würde festlegen, ob Wartezeit, Abbruch zwischen Versorgungsstufen und regionale Unterversorgung sichtbar werden und eine Korrektur auslösen."
      },
      signals: [
        { required: "Wartezeit bis zur passenden Versorgung, vermeidbare Versorgungsabbrüche und Erreichbarkeit nach Bedarf", text: "fehlen im Basissatz und müssen vor einer Wirkungsbilanz nach Zielgruppen und Regionen erhoben werden." },
        { id: "employment", title: "Sozialversicherungspflichtig Beschäftigte", text: "kann allenfalls als grober Kontext für Arbeitsmarkt- und Pendelstrukturen dienen, nicht als Versorgungsindikator." }
      ],
      risks: ["Mehr finanzierte Leistung kann Kapazitäten von anderen notwendigen Versorgungswegen abziehen.", "Ein bundesweit einheitlicher Standard kann regionale Engpässe verdecken, wenn Personal und Erreichbarkeit nicht mitgeprüft werden."]
    },
    bildung: {
      subject: "Bildungs- und Teilhabechancen",
      affected: "Eine Verbesserung liegt erst vor, wenn Kinder, Jugendliche oder Erwachsene Zugang haben, Übergänge bewältigen und Lern- oder Teilhabeergebnisse stabiler werden.",
      local: "Im Wahlkreis wäre sichtbar zu machen, ob der Weg von Platz, Angebot und Unterstützung tatsächlich zu Teilnahme und gelungenen Übergängen führt.",
      roles: {
        bund_recht: "Der Bund würde Rechte, Mindeststandards oder Schnittstellen für Teilhabe verändern. Direkt zu prüfen ist, ob die Regel einen Anspruch praktisch erreichbar macht und welche Vollzugslast daraus entsteht.",
        bund_finanzierung: "Der Bund würde Finanzierung oder Anreize für Bildungs- und Teilhabeangebote verändern. Direkt zu prüfen ist, ob Mittel dort ankommen, wo Zugang oder Qualität begrenzt sind.",
        bund_vollzug: "Der Bund würde die Umsetzung über Länder, Kommunen und Träger beeinflussen. Direkt zu prüfen sind Personal, Zuständigkeiten, Übergaben und Zugang ohne zusätzliche Selektionshürden.",
        bund_rueckkopplung: "Der Bund würde festlegen, ob Teilnahme, Abbrüche und Übergänge nach sozialen Gruppen und Orten sichtbar werden und eine Korrektur auslösen."
      },
      signals: [
        { id: "under3_care", title: "Betreuungsquote unter Dreijähriger", text: "zeigt einen Zugangsausschnitt, aber weder die Qualität noch die Teilhabe älterer Kinder und Jugendlicher." },
        { required: "Wartelisten, Teilnahme, Übergänge und Lern- bzw. Teilhabeergebnisse nach Ausgangslage", text: "sind für die behauptete Bildungswirkung zusätzlich erforderlich." }
      ],
      risks: ["Ein Ausbau von Plätzen ohne Personal kann Zugang erhöhen, ohne die Betreuungs- oder Lernqualität zu sichern.", "Einheitliche Nachweis- oder Antragswege können gerade Familien mit höherem Unterstützungsbedarf ausschließen."]
    },
    arbeit: {
      subject: "Zugang zu guter und robuster Arbeit",
      affected: "Wirkung liegt nicht in der Zahl von Maßnahmen, sondern in tragfähigen Übergängen in Beschäftigung, Qualifizierung und Absicherung bei Umbrüchen.",
      local: "Im Wahlkreis wäre sichtbar zu machen, ob Menschen in passende, stabile Beschäftigung übergehen und ob Qualifizierung an reale Arbeitsplätze anschließt.",
      roles: {
        bund_recht: "Der Bund würde Regeln für Zugang, Absicherung oder Qualifizierung verändern. Direkt zu prüfen ist, ob sie Übergänge erleichtern oder neue Ausschlüsse und Bürokratie erzeugen.",
        bund_finanzierung: "Der Bund würde Anreize für Qualifizierung, Einstellung oder Absicherung verändern. Direkt zu prüfen ist, ob sie zusätzliche Übergänge auslösen statt ohnehin geplante Aktivitäten zu finanzieren.",
        bund_vollzug: "Der Bund würde die Umsetzbarkeit durch Arbeitsverwaltung, Bildungsträger und Betriebe beeinflussen. Direkt zu prüfen sind Beratungskapazität, Verfahren und Übergaben.",
        bund_rueckkopplung: "Der Bund würde festlegen, ob Übergänge, Abbrüche und Beschäftigungsstabilität nach Ausgangslage sichtbar werden und eine Korrektur auslösen."
      },
      signals: [
        { id: "unemployment", title: "Arbeitslosenquote", text: "zeigt einen Arbeitsmarktstatus, aber weder Jobqualität noch gelungene Qualifizierung oder Verdrängung." },
        { id: "employment", title: "Sozialversicherungspflichtig Beschäftigte", text: "zeigt Beschäftigungsumfang im Kontext, aber nicht die Qualität, Stabilität oder Zugänglichkeit der Arbeit." },
        { required: "Übergänge aus Arbeitslosigkeit, Qualifizierungsabschluss, Verbleib nach sechs und zwölf Monaten sowie Arbeitsqualität", text: "sind für die Wirkungsprüfung zusätzlich erforderlich." }
      ],
      risks: ["Anreize können Mitnahmeeffekte erzeugen oder Gruppen mit höherem Unterstützungsbedarf aus dem Blick drängen.", "Schnelle Vermittlung kann eine nachhaltige Qualifizierung und Beschäftigungsstabilität verdrängen."]
    },
    wirtschaft: {
      subject: "resiliente wirtschaftliche Transformation und Wertschöpfung",
      affected: "Wirkung liegt vor, wenn Betriebe und Beschäftigte ihre Anpassungsfähigkeit erhöhen, ohne Risiken und Kosten unbemerkt auf andere Gruppen oder Orte zu verlagern.",
      local: "Im Wahlkreis wäre sichtbar zu machen, ob Investitionen zusätzliche Anpassungsfähigkeit und tragfähige Beschäftigung erzeugen, nicht nur Mittelabfluss.",
      roles: {
        bund_recht: "Der Bund würde Regeln für Investition, Standards oder Marktzugang verändern. Direkt zu prüfen ist, welche Umstellung sie auslöst und welche kleineren oder weniger kapitalstarken Betriebe ausgeschlossen werden könnten.",
        bund_finanzierung: "Der Bund würde Transformationsanreize oder Finanzierung verändern. Direkt zu prüfen ist die Zusätzlichkeit: Welche Investition oder Anpassung wäre ohne den Impuls nicht erfolgt?",
        bund_vollzug: "Der Bund würde die praktische Nutzung durch Unternehmen, Förderstellen und Verwaltung beeinflussen. Direkt zu prüfen sind Antrag, Beratung, Nachweis und die Fähigkeit kleiner Betriebe zur Teilnahme.",
        bund_rueckkopplung: "Der Bund würde festlegen, ob Zusätzlichkeit, Beschäftigungsfolgen und regionale Verteilung sichtbar werden und eine Korrektur auslösen."
      },
      signals: [
        { id: "employment", title: "Sozialversicherungspflichtig Beschäftigte", text: "zeigt Beschäftigungsumfang, aber keine Produktivität, Resilienz oder Zusätzlichkeit einer Investition." },
        { required: "zusätzliche Investitionen, Energie- und Materialintensität, Unternehmensüberleben und Beschäftigungsqualität", text: "sind für eine Transformationswirkung zusätzlich erforderlich." }
      ],
      risks: ["Förderung kann ohnehin geplante Investitionen bezuschussen, ohne zusätzliche Wirkung auszulösen.", "Hohe Nachweislast kann kleine und mittlere Unternehmen vom Zugang ausschließen."]
    },
    energie: {
      subject: "zuverlässige und bezahlbare Energie- und Netzinfrastruktur",
      affected: "Wirkung liegt erst vor, wenn Versorgung, Kosten, Anschluss und Resilienz für Haushalte, Betriebe und öffentliche Infrastruktur zusammen besser werden.",
      local: "Im Wahlkreis wäre sichtbar zu machen, ob Anschluss, Netzverfügbarkeit und Kosten den Zugang tatsächlich verbessern, statt nur Projekte oder Mittel zu zählen.",
      roles: {
        bund_recht: "Der Bund würde Planungs-, Anschluss- oder Standardregeln verändern. Direkt zu prüfen ist, welche Genehmigungs- und Umsetzungszeit dadurch sinkt und welche Schutzgüter berührt werden.",
        bund_finanzierung: "Der Bund würde Finanzierung oder Anreize für Netze, Effizienz oder Versorgung verändern. Direkt zu prüfen ist, ob die Mittel den tatsächlich begrenzenden Netz-, Anschluss- oder Kostenfaktor erreichen.",
        bund_vollzug: "Der Bund würde die Umsetzbarkeit durch Netzbetreiber, Länder und Kommunen beeinflussen. Direkt zu prüfen sind Genehmigung, Flächen, Fachkräfte und Schnittstellen.",
        bund_rueckkopplung: "Der Bund würde festlegen, ob Anschlussdauer, Unterbrechungen, Kosten und regionale Verteilung sichtbar werden und eine Korrektur auslösen."
      },
      signals: [
        { required: "Anschlussdauer, verfügbare Netzkapazität, Versorgungsunterbrechungen und Kostenbelastung nach Nutzergruppen", text: "fehlen im Basissatz und sind für eine Energie- oder Infrastrukturwirkung erforderlich." }
      ],
      risks: ["Beschleunigung kann Kosten, Flächenkonflikte oder Naturwirkungen auf Orte verlagern.", "Förderung ohne Netz- und Genehmigungskapazität kann Mittel binden, ohne Anschluss oder Versorgung zu verbessern."]
    },
    mobilitaet: {
      subject: "verlässliche Mobilität und Erreichbarkeit",
      affected: "Wirkung liegt vor, wenn Menschen die für Arbeit, Bildung und Versorgung nötigen Orte tatsächlich erreichbar und planbar erreichen.",
      local: "Im Wahlkreis wäre sichtbar zu machen, ob Reisezeit, Verlässlichkeit und Barrierefreiheit für unterschiedliche Gruppen besser werden, nicht nur ob Infrastruktur gebaut wird.",
      roles: {
        bund_recht: "Der Bund würde Standards, Zuständigkeiten oder Planungsregeln verändern. Direkt zu prüfen ist, ob sie Zugänge vereinfachen und welche neuen Anforderungen für Aufgabenträger entstehen.",
        bund_finanzierung: "Der Bund würde Finanzierung oder Anreize für Mobilität verändern. Direkt zu prüfen ist, ob dadurch ein relevantes Erreichbarkeitsdefizit geschlossen wird und wer profitiert.",
        bund_vollzug: "Der Bund würde die Umsetzung durch Länder, Kommunen und Betreiber beeinflussen. Direkt zu prüfen sind Betriebsfinanzierung, Personal, Schnittstellen und dauerhafte Wartung.",
        bund_rueckkopplung: "Der Bund würde festlegen, ob Reisezeit, Ausfälle und Zugänglichkeit nach Ort und Personengruppe sichtbar werden und eine Korrektur auslösen."
      },
      signals: [
        { required: "Reisezeit zu Arbeit, Bildung und Versorgung, Pünktlichkeit, Ausfälle und Barrierefreiheit", text: "fehlen im Basissatz und sind für die behauptete Erreichbarkeitswirkung erforderlich." }
      ],
      risks: ["Ein Ausbau auf einer Achse kann andere Orte oder Gruppen schlechter anbinden.", "Neue Infrastruktur ohne dauerhaften Betrieb kann nach kurzer Zeit keine verlässliche Erreichbarkeit liefern."]
    },
    klima: {
      subject: "Schutz vor Klimafolgen und Vorsorge",
      affected: "Wirkung liegt vor, wenn konkrete Risiken für Menschen, Natur und Infrastruktur sinken und Schäden nicht nur räumlich oder zeitlich verlagert werden.",
      local: "Im Wahlkreis wäre sichtbar zu machen, ob Exposition, Schutz und Verwundbarkeit tatsächlich sinken – getrennt nach betroffenen Orten und Gruppen.",
      roles: {
        bund_recht: "Der Bund würde Schutz-, Vorsorge- oder Planungsstandards verändern. Direkt zu prüfen ist, welche Risiken verbindlich berücksichtigt werden und welche Zielkonflikte vor Ort entstehen.",
        bund_finanzierung: "Der Bund würde Anreize oder Finanzierung für Vorsorge verändern. Direkt zu prüfen ist, ob Mittel die größte verbleibende Verwundbarkeit erreichen und zusätzliche Schäden vermeiden.",
        bund_vollzug: "Der Bund würde die Umsetzung durch Länder, Kommunen und Träger beeinflussen. Direkt zu prüfen sind Zuständigkeit, Datenlage, Flächen und dauerhafte Pflege der Maßnahmen.",
        bund_rueckkopplung: "Der Bund würde festlegen, ob Schäden, Schutzwirkung und ungleiche Betroffenheit sichtbar werden und eine Korrektur auslösen."
      },
      signals: [
        { required: "Exposition, gefährdete Personen und Einrichtungen, Schadensvermeidung sowie ökologische Nebenwirkungen", text: "fehlen im Basissatz und sind für eine Vorsorgewirkung erforderlich." }
      ],
      risks: ["Schutz an einem Ort kann Risiko oder Belastung in andere Räume verlagern.", "Beschleunigte Maßnahmen können Natur-, Beteiligungs- oder Verteilungswirkungen verdecken."]
    },
    digital: {
      subject: "zugängliche und verlässliche digitale staatliche Infrastruktur",
      affected: "Wirkung liegt vor, wenn ein Anliegen sicher, verständlich und ohne analoge Ausschlüsse erfolgreich erledigt werden kann.",
      local: "Im Wahlkreis wäre sichtbar zu machen, ob Menschen und Betriebe Verfahren tatsächlich abschließen können und ob analoge Zugänge gleichwertig bleiben.",
      roles: {
        bund_recht: "Der Bund würde Rechtsgrundlagen, Standards oder Nachweispflichten verändern. Direkt zu prüfen ist, ob sie Medienbrüche senken und Datenschutz, Rechtsschutz sowie analoge Zugänge sichern.",
        bund_finanzierung: "Der Bund würde Finanzierung oder Anreize für digitale Infrastruktur verändern. Direkt zu prüfen ist, ob sie interoperable, dauerhafte Lösungen statt isolierter Projekte ermöglichen.",
        bund_vollzug: "Der Bund würde die praktische Umsetzung durch Verwaltung und Anbieter beeinflussen. Direkt zu prüfen sind Schnittstellen, Support, Kompetenz und Übergänge zum analogen Weg.",
        bund_rueckkopplung: "Der Bund würde festlegen, ob Erfolgsquote, Abbruch, Bearbeitungsdauer und Ausschlüsse sichtbar werden und eine Korrektur auslösen."
      },
      signals: [
        { required: "Abschlussquote digitaler Verfahren, Bearbeitungsdauer, Medienbrüche, Supportfälle und analoge Gleichwertigkeit", text: "fehlen im Basissatz und sind für die Digitalisierungswirkung erforderlich." }
      ],
      risks: ["Ein digitaler Standard kann ohne gleichwertigen alternativen Zugang neue Ausschlüsse schaffen.", "Schnellere Datennutzung kann Datenschutz, Zweckbindung oder Rechtsschutz beeinträchtigen."]
    },
    staat: {
      subject: "einen handlungsfähigen, rechtsstaatlichen Vollzug",
      affected: "Wirkung liegt vor, wenn Menschen und Organisationen ihr Anliegen zuverlässig, nachvollziehbar und mit Rechtsschutz bearbeiten lassen können.",
      local: "Im Wahlkreis wäre sichtbar zu machen, ob Verfahren tatsächlich schneller, verständlicher und zugänglicher werden – ohne Verlagerung ungedeckter Aufgaben.",
      roles: {
        bund_recht: "Der Bund würde Zuständigkeiten, Anspruchsregeln oder Verfahrensstandards verändern. Direkt zu prüfen ist, ob sie Entscheidungen vereinfachen oder neue Prüf- und Nachweispflichten erzeugen.",
        bund_finanzierung: "Der Bund würde Finanzierung oder Anreize für Verwaltungsfähigkeit verändern. Direkt zu prüfen ist, ob Mittel an einen konkreten Vollzugsengpass gebunden sind und dauerhafte Folgekosten abdecken.",
        bund_vollzug: "Der Bund würde Rollen, Übergaben und Ressourcen zwischen Ebenen beeinflussen. Direkt zu prüfen sind Fallzahl, Personal, IT, Übergangsfristen und ein verbindlicher Rückmeldeweg.",
        bund_rueckkopplung: "Der Bund würde festlegen, ob Bearbeitungsdauer, Widersprüche, Abbrüche und ungleiche Zugänge sichtbar werden und eine Korrektur auslösen."
      },
      signals: [
        { required: "Bearbeitungsdauer, erfolgreiche Abschlüsse, Widersprüche, Abbrüche und Vollzugskosten nach Verfahren", text: "fehlen im Basissatz und sind für die behauptete Verwaltungswirkung erforderlich." }
      ],
      risks: ["Eine Vereinfachung kann Rechtsschutz oder Beteiligung schwächen, wenn die Folgen nicht getrennt geprüft werden.", "Neue Bundespflichten ohne Finanzierung, Personal oder Übergangszeit können kommunale Handlungsfähigkeit mindern."]
    }
  };

  /* Der Fragebogen fragt noch nicht nach einem fertigen Gesetzentwurf. Damit
     der Report trotzdem nicht bei Allgemeinplätzen bleibt, übersetzt diese
     Ebene jede Themenwahl in prüfbare Entscheidungsobjekte, Zustandsmaße und
     Abbruch- bzw. Korrektursignale. Das sind keine Zusagen über Wirkungen,
     sondern Mindestanforderungen an eine belastbare Wirkannahme. */
  var decisionContexts = {
    wohnen: {
      caseLabel: "den Zugang eines Haushalts zu einer angemessenen und tragbaren Wohnung",
      decisionObject: "Anspruch, Schutzstandard, Förderzugang oder eine konkrete Bau- und Belegungsregel",
      outcome: "ob Haushalte tatsächlich eine passende Wohnung erreichen und die laufende Belastung tragen können",
      federalReadout: "Anzahl und Profil der erreichten Haushalte, neue beziehungsweise gesicherte Wohnungen, Wohnkostenbelastung und Dauer des Zugangswegs",
      localReadout: "Wohnungssuche bis Vertragsabschluss, Ablehnungen nach Einkommens- oder Bedarfslage, gebundene Wohnungen und Verdrängungshinweise",
      correctionTrigger: "Steigen Bewilligungen oder Fertigstellungen, ohne dass Haushalte mit niedrigerem Einkommen Zugang gewinnen oder die Belastung sinkt, muss Zugang, Bindung oder Mittelverwendung nachgesteuert werden.",
      evidenceLimit: "Eine Veränderung der Wohnkostenbelastung zeigt einen Zustand, beweist aber nicht für sich allein die Wirkung einer einzelnen Bundesregel: Zinsen, Baukosten, Einkommen, Nachfrage und kommunale Planung wirken gleichzeitig."
    },
    gesundheit: {
      caseLabel: "den Weg einer Person von Bedarf über Termin und Behandlung bis zur verlässlichen Weiterbehandlung",
      decisionObject: "Zugangsstandard, Vergütungsregel, Übergabepflicht oder Versorgungsauftrag",
      outcome: "ob Menschen passende Versorgung rechtzeitig erreichen und nicht zwischen Versorgungsstufen verloren gehen",
      federalReadout: "Wartezeit bis zur passenden Versorgung, regionale Verfügbarkeit, Versorgungsabbrüche und vermeidbare Wiederaufnahmen",
      localReadout: "Erreichbarkeit, Terminwege, Übergaben zwischen Praxis, Klinik, Pflege und Beratung sowie Wartezeiten nach Bedarfslage",
      correctionTrigger: "Steigt die Zahl vergüteter Leistungen, während Wartezeiten, Abbrüche oder regionale Unterversorgung bestehen bleiben, müssen Kapazität, Übergabe oder Anreizlogik korrigiert werden.",
      evidenceLimit: "Weniger Behandlungsfälle können erfolgreiche Prävention ebenso wie schlechteren Zugang bedeuten. Erst die gemeinsame Betrachtung von Zugang, Qualität, Kontinuität und Bedarf erlaubt eine belastbare Einordnung."
    },
    bildung: {
      caseLabel: "den Weg von einem Anspruch oder Angebot zu tatsächlicher Teilnahme und einem gelungenen Übergang",
      decisionObject: "Teilhaberecht, Qualitätsmindeststandard, Finanzierungszugang oder Übergaberegel",
      outcome: "ob Kinder, Jugendliche oder Erwachsene teilnehmen können und Bildungs- oder Teilhabechancen stabiler werden",
      federalReadout: "Teilnahme nach Ausgangslage, Wartelisten, Abbrüche, Übergänge und Qualitätsbedingungen",
      localReadout: "Platzsuche, tatsächliche Teilnahme, Personalverfügbarkeit, Übergänge und Zugang für Familien mit höherem Unterstützungsbedarf",
      correctionTrigger: "Erhöht sich die Zahl der Plätze oder Programme ohne Teilnahme, verlässliche Qualität oder gelingende Übergänge, müssen Personal, Zugang oder Qualitätsvorgaben angepasst werden.",
      evidenceLimit: "Mehr Plätze, Geräte oder Projekte belegen keine Bildungswirkung. Entscheidend sind tatsächliche Teilnahme, Qualität und Übergänge – getrennt nach den Ausgangslagen der betroffenen Gruppen."
    },
    arbeit: {
      caseLabel: "den Übergang einer Person von Arbeitslosigkeit oder Qualifizierung in tragfähige Beschäftigung",
      decisionObject: "Zugangsregel, Qualifizierungsanreiz, Absicherungsinstrument oder Vermittlungsstandard",
      outcome: "ob Menschen in passende, stabile Arbeit übergehen und nicht lediglich kurzfristig aus einer Statistik fallen",
      federalReadout: "Übergänge in Beschäftigung, Abschluss von Qualifizierung, Verbleib nach sechs und zwölf Monaten sowie Arbeitsqualität",
      localReadout: "Beratungszugang, passgenaue Qualifizierung, Übergänge zu regionalen Betrieben und Abbrüche nach Ausgangslage",
      correctionTrigger: "Steigt die schnelle Vermittlung, während Abbrüche, instabile Beschäftigung oder Ausschlüsse zunehmen, muss die Anreizlogik von Tempo auf nachhaltigen Übergang umgestellt werden.",
      evidenceLimit: "Eine sinkende Arbeitslosenquote kann viele Ursachen haben und sagt weder etwas über Arbeitsqualität noch über die Stabilität oder Zugänglichkeit eines Übergangs aus."
    },
    wirtschaft: {
      caseLabel: "die Entscheidung eines Betriebs für eine zusätzliche, resilienzstärkende Investition",
      decisionObject: "Investitionsregel, Förderkriterium, Zugang zu Finanzierung oder Transformationsstandard",
      outcome: "ob zusätzliche Anpassungsfähigkeit und tragfähige Beschäftigung entstehen statt ohnehin geplanter Aktivitäten finanziert zu werden",
      federalReadout: "Zusätzlichkeit der Investition, Energie- und Materialintensität, Unternehmensüberleben sowie Beschäftigungsqualität",
      localReadout: "Zugang kleiner und mittlerer Betriebe, Investitionsentscheidung, Qualifizierungsbedarf und regionale Beschäftigungsfolgen",
      correctionTrigger: "Fließen Mittel überwiegend an ohnehin geplante Vorhaben oder nur an große, antragsstarke Betriebe, müssen Zusätzlichkeitsnachweis und Zugangskriterien geändert werden.",
      evidenceLimit: "Mittelabfluss und höhere Investitionen belegen keine zusätzliche Transformation. Ohne Gegenfaktik bleibt offen, was auch ohne den Impuls geschehen wäre und wer vom Zugang ausgeschlossen wurde."
    },
    energie: {
      caseLabel: "den Anschluss und die verlässliche Versorgung eines Haushalts, Betriebs oder einer öffentlichen Einrichtung",
      decisionObject: "Planungs- oder Anschlussregel, Netz- und Effizienzanreiz oder Umsetzungsauftrag",
      outcome: "ob Versorgung, Anschluss, Kosten und Resilienz für die betroffenen Nutzergruppen tatsächlich besser werden",
      federalReadout: "Anschlussdauer, verfügbare Netzkapazität, Unterbrechungen, Kostenbelastung und regionale Verteilung",
      localReadout: "Wartezeit auf Anschluss, Engpassorte, Kostenwirkung für Haushalte und Betriebe sowie Konflikte um Flächen und Genehmigung",
      correctionTrigger: "Werden Projekte oder Fördermittel sichtbar, aber Anschlusszeiten, Kosten oder Versorgungssicherheit verbessern sich nicht, müssen Netz-, Genehmigungs- oder Zugangshürden zuerst bearbeitet werden.",
      evidenceLimit: "Die Zahl geförderter Anlagen oder Projekte belegt weder eine sichere Versorgung noch eine faire Kostenwirkung. Netze, Anschlüsse, Preise und Verteilungsfolgen müssen getrennt beobachtet werden."
    },
    mobilitaet: {
      caseLabel: "die reale Erreichbarkeit von Arbeit, Bildung und Versorgung für eine Person ohne verlässliche Alternative",
      decisionObject: "Erreichbarkeitsstandard, Finanzierungsregel, Planungszuständigkeit oder Betriebsauftrag",
      outcome: "ob Wege tatsächlich verlässlich, bezahlbar und barrierearm zurückgelegt werden können",
      federalReadout: "Reisezeit zu zentralen Zielen, Pünktlichkeit, Ausfälle, Barrierefreiheit und Verteilung der Erreichbarkeit",
      localReadout: "erste und letzte Meile, Anschlüsse, Ausfälle, Fahrzeit und Zugänglichkeit für unterschiedliche Orte und Gruppen",
      correctionTrigger: "Verbessert sich eine Hauptachse, während Anschlüsse, Randlagen oder Barrierefreiheit schlechter werden, muss die Maßnahme vor einer Ausweitung umgestaltet werden.",
      evidenceLimit: "Mehr Fahrten, Straßenkilometer oder geförderte Fahrzeuge zeigen keine verbesserte Erreichbarkeit. Entscheidend sind verlässliche Wege zu realen Zielen, bezahlbar und barrierearm für unterschiedliche Gruppen."
    },
    klima: {
      caseLabel: "den Schutz einer gefährdeten Person, Einrichtung oder Fläche vor einer konkret benannten Klimafolge",
      decisionObject: "Vorsorge- oder Planungsstandard, Finanzierungszugang, Schutzpflicht oder Umsetzungsauftrag",
      outcome: "ob Exposition und Verwundbarkeit sinken, ohne Risiken oder ökologische Schäden zu verlagern",
      federalReadout: "Exposition, geschützte Personen und Einrichtungen, vermiedene Schäden sowie ökologische Nebenwirkungen",
      localReadout: "betroffene Orte und Gruppen, Schutzlücken, Pflege und Dauerhaftigkeit der Maßnahme sowie Flächen- und Naturkonflikte",
      correctionTrigger: "Senkt eine Maßnahme ein lokales Risiko, verlagert aber Belastungen, Naturverlust oder Schutzlücken an andere Orte, darf sie nicht als positive Netto-Wirkung gelten.",
      evidenceLimit: "Ein einzelnes Ereignis oder ein kurzfristiger Rückgang von Schäden beweist keine Resilienzwirkung. Exposition, Vulnerabilität, Dauerhaftigkeit und ökologische Nebenfolgen müssen über Zeit betrachtet werden."
    },
    digital: {
      caseLabel: "den erfolgreichen Abschluss eines Verwaltungs- oder Alltagsanliegens über einen digitalen und gleichwertigen analogen Zugang",
      decisionObject: "Interoperabilitäts- oder Zugangsstandard, Finanzierung, Vollzugsvorgabe oder Rückkopplungsregel",
      outcome: "ob Anliegen sicher, verständlich und ohne neue Ausschlüsse erledigt werden können",
      federalReadout: "Abschlussquote, Bearbeitungsdauer, Medienbrüche, Supportfälle, Ausfälle und analoge Gleichwertigkeit",
      localReadout: "tatsächliche Nutzung, Abbrüche, Hilfebedarf, analoge Alternative und Verteilung der Zugangsprobleme",
      correctionTrigger: "Sinkt die Bearbeitungszeit nur für digital versierte Gruppen oder steigen Abbrüche und Supportfälle, müssen Zugang, Unterstützung und analoge Gleichwertigkeit vor einer Skalierung gesichert werden.",
      evidenceLimit: "Eine höhere Online-Nutzung oder kürzere digitale Bearbeitung beweist keinen besseren Zugang. Abbrüche, Hilfebedarf, Datenschutz, Ausfälle und die gleichwertige analoge Alternative bleiben Teil der Wirkungsprüfung."
    },
    staat: {
      caseLabel: "den Weg eines Antrags, einer Genehmigung oder eines sonstigen Verwaltungsfalls bis zu einer rechtssicheren Entscheidung",
      decisionObject: "Anspruchs- oder Verfahrensregel, Vollzugspaket oder verbindliche Rückkopplung",
      outcome: "ob Menschen und Organisationen ihr Anliegen rechtzeitig, verständlich und mit wirksamem Rechtsschutz erledigen können",
      federalReadout: "Bearbeitungsdauer nach Verfahrensart, erfolgreiche Abschlüsse, Widersprüche, Abbrüche, Vollzugskosten und ungleiche Zugänge",
      localReadout: "Zahl der Schritte und Nachweise, Wartezeit, Rückfragen, Abbrüche, Widersprüche, Personal- und IT-Belastung im konkreten Verfahren",
      correctionTrigger: "Sinkt die formale Bearbeitungszeit, während Widersprüche, Abbrüche, Fehler oder ungedeckte Mehrarbeit steigen, muss das Verfahren vor einer breiten Ausweitung korrigiert werden.",
      evidenceLimit: "Eine kürzere Durchlaufzeit ist zunächst Verwaltungswirkung. Sie belegt nicht, dass ein Anliegen rechtssicherer, verständlicher oder für alle Gruppen besser zugänglich entschieden wird."
    }
  };

  var bottleneckChecks = {
    finanzierung: "Die Mittel- und Anreizarchitektur muss den begrenzenden Faktor treffen; sonst steigt der Mitteleinsatz ohne entsprechende Zustandsveränderung.",
    personal: "Ohne verfügbare und qualifizierte Menschen bleibt ein Rechtsanspruch, Förderprogramm oder Standard vor Ort begrenzt vollziehbar.",
    verfahren: "Die Zahl der Schritte, Nachweise, Zuständigkeiten und Fristen bestimmt, ob der formale Anspruch praktisch erreichbar wird.",
    daten: "Vor der Skalierung muss feststehen, welches Signal eine falsche Annahme zeigt und welche Stelle darauf entscheidet.",
    koordination: "Die Übergabe zwischen Bund, Ländern, Kommunen und Trägern braucht Zuständigkeit, Finanzierung und einen verbindlichen Rückmeldeweg.",
    infrastruktur: "Räumliche, technische oder organisatorische Kapazität muss vor dem Ausbau der Nachfrage oder Verpflichtung verfügbar sein."
  };

  var riskLocks = {
    risiko_sozial: "Die positive Netto-Wirkung entfällt, wenn der Zugang für Menschen mit höherer Belastung oder geringerem Ressourcenpolster schwerer wird.",
    risiko_kommunal: "Die positive Netto-Wirkung entfällt, wenn eine ungedeckte Daueraufgabe kommunale Handlungsfähigkeit an anderer Stelle schwächt.",
    risiko_oekologisch: "Die positive Netto-Wirkung entfällt, wenn eine schwerwiegende negative Umweltwirkung durch andere Vorteile verdeckt würde.",
    risiko_recht: "Die positive Netto-Wirkung entfällt, wenn Rechtsschutz, Beteiligung oder diskriminierungsfreier Zugang eingeschränkt werden."
  };

  function roleDecisionCheck(role, domain) {
    if (role === "bund_recht") {
      return "Rechtsrahmen: Der Entwurf für " + domain.decisionObject + " muss für " + domain.caseLabel + " Anspruch oder Geltung, zuständige Stelle, zulässige Nachweise, Frist beziehungsweise Verfahrensfolge und Rechtsschutz eindeutig festlegen. Jeder zusätzliche Nachweis und jeder zusätzliche Entscheidungsschritt braucht eine begründete Wirkungsfunktion.";
    }
    if (role === "bund_finanzierung") {
      return "Finanzierungsarchitektur: Die Mittel oder Anreize müssen an " + domain.decisionObject + " und an " + domain.outcome + " gebunden werden. Vorab festzulegen sind Zielgruppe, Zugang, beabsichtigte Zusätzlichkeit, Folgekosten nach Förderende und die Stelle, die Fehlsteuerungen korrigiert.";
    }
    if (role === "bund_vollzug") {
      return "Vollzugspaket: Vor dem Beschluss müssen für " + domain.caseLabel + " Fallzahl, Personal- und Kompetenzbedarf, IT- und Datenübergaben, Übergangsfrist, Finanzierung und Rückmeldung aus Ländern und Kommunen verbindlich geklärt sein. Ein neuer Bundesauftrag ohne diese Voraussetzungen verschiebt nur Lasten.";
    }
    if (role === "bund_rueckkopplung") {
      return "Rückkopplungsregel: Der Beschluss muss eine Ausgangslage, die Indikatoren, einen Beobachtungszeitpunkt, eine nach Gruppen und Orten getrennte Auswertung sowie eine entscheidungsbefugte Stelle festlegen. Ein Bericht ohne vorab definierte Korrekturentscheidung ist keine Rückkopplung.";
    }
    return null;
  }

  function bottleneckDecisionCheck(id, domain) {
    if (id === "verfahren") {
      return "Verfahrensprüfung vor der Ausweitung: Den heutigen und den vorgesehenen Weg für " + domain.caseLabel + " Schritt für Schritt vergleichen – Eingabe, Nachweis, Zuständigkeit, Wartepunkt, Entscheidung und Rechtsbehelf. Eine Beschleunigung ist nicht belegt, wenn nur ein interner Schritt schneller wird und Rückfragen, Ablehnungen oder Widersprüche steigen.";
    }
    if (id === "finanzierung") {
      return "Finanzierungsprüfung vor der Ausweitung: Für " + domain.decisionObject + " den tatsächlich begrenzenden Kostenpunkt, die Trägerschaft, die Dauerfinanzierung und die Verteilungswirkung offenlegen. Mehr Mittel ohne Zugang zum begrenzenden Faktor sind kein Wirkungsnachweis.";
    }
    if (id === "personal") {
      return "Kapazitätsprüfung vor der Ausweitung: Für " + domain.caseLabel + " benötigte Qualifikation, verfügbare Zeit, Ersatz bei Ausfall und Lernaufwand bestimmen. Ein Anspruch oder Programm verändert den Zustand nicht, wenn die erforderliche Arbeit nicht geleistet werden kann.";
    }
    if (id === "daten") {
      return "Wirkungsdatenprüfung vor der Ausweitung: Baseline, Zielgruppe, Gegenprüfung und Korrekturentscheidung für " + domain.outcome + " festlegen. Zählen allein, wie viele Fälle, Mittel oder Projekte es gibt, reicht nicht.";
    }
    if (id === "koordination") {
      return "Schnittstellenprüfung vor der Ausweitung: Für " + domain.caseLabel + " muss jede Übergabe zwischen Bund, Land, Kommune und Träger eine verantwortliche Stelle, eine Frist, Finanzierung und einen Eskalationsweg haben. Sonst wird eine Bundesregel an der Übergabe wirkungslos.";
    }
    if (id === "infrastruktur") {
      return "Zugangsprüfung vor der Ausweitung: Räumliche, technische und organisatorische Kapazität für " + domain.caseLabel + " muss dort verfügbar sein, wo die Regel Nachfrage oder Verpflichtungen auslöst. Ein formaler Anspruch ohne erreichbaren Zugang ist keine tatsächliche Wirkung.";
    }
    return null;
  }

  function decisionPlan(topicId, roles, bottlenecks, context) {
    var domain = decisionContexts[topicId];
    if (!domain) return null;
    return {
      decisionObject: domain.decisionObject,
      caseLabel: domain.caseLabel,
      outcome: domain.outcome,
      modelPath: [
        "Bundesentscheidung: " + domain.decisionObject + ".",
        "Umsetzungssituation: " + domain.caseLabel + ".",
        "Zu prüfende Zustandsveränderung: " + domain.outcome + ".",
        "Rückkopplung: " + domain.federalReadout + "."
      ],
      federalChecks: roles.map(function (role) { return roleDecisionCheck(role, domain); }).filter(Boolean),
      bottleneckChecks: bottlenecks.map(function (id) { return bottleneckDecisionCheck(id, domain); }).filter(Boolean),
      federalReadout: domain.federalReadout,
      localReadout: domain.localReadout,
      correctionTrigger: domain.correctionTrigger,
      evidenceLimit: domain.evidenceLimit,
      districtReference: context && context.districtName ? context.districtName : null
    };
  }

  function selectedFirst(answers, field) {
    var values = answers[field] || [];
    return Array.isArray(values) && values.length ? values[0] : null;
  }

  function selectedAll(answers, field) {
    var values = answers[field] || [];
    return Array.isArray(values) ? values : [];
  }

  function unique(items) {
    return items.filter(function (item, index) { return item && items.indexOf(item) === index; });
  }

  function derive(answers, context) {
    var topicId = selectedFirst(answers, "q_top3") || selectedFirst(answers, "q_prioritaeten");
    var profile = topicProfiles[topicId];
    if (!profile) return null;

    var goal = answers.q_zustandsziel || "den gewählten Zustand";
    var roles = selectedAll(answers, "q_bundesrolle");
    var bottlenecks = selectedAll(answers, "q_engpass");
    var redLines = selectedAll(answers, "q_rote_linie");
    var direct = roles.map(function (role) { return profile.roles[role]; }).filter(Boolean);
    var constraints = bottlenecks.map(function (id) { return bottleneckChecks[id]; }).filter(Boolean);
    var locks = redLines.map(function (id) { return riskLocks[id]; }).filter(Boolean);
    var plan = decisionPlan(topicId, roles, bottlenecks, context);

    return {
      topicId: topicId,
      subject: profile.subject,
      goal: goal,
      affected: profile.affected,
      federal: direct,
      local: profile.local,
      constraints: constraints,
      signals: profile.signals,
      risks: unique(profile.risks.concat(locks)),
      decisionPlan: plan,
      overall: "Die beabsichtigte Gesamtwirkung kann nur als positive Netto-Wirkung gelten, wenn " + (plan ? plan.decisionObject : "der bundespolitische Eingriff") + " den benannten Engpass erreicht, die behauptete Zustandsveränderung für Betroffene tatsächlich eintritt und keine der ausgewählten roten Linien verletzt wird.",
      context: context || {}
    };
  }

  function conditionMatches(condition, answers) {
    if (condition.op === "includes") return includes(condition.field, condition.value)(answers);
    if (condition.op === "anyOf") return anyOf(condition.field, condition.value)(answers);
    return false;
  }

  function hasApprovedText(path) {
    return path.rule && path.rule.conclusion && typeof path.rule.conclusion.text === "string" && path.rule.conclusion.text.trim() &&
      Array.isArray(path.rule.conditions) && path.rule.conditions.every(function (condition) {
        return typeof condition.text === "string" && condition.text.trim();
      });
  }

  function evaluate(answers) {
    return paths.filter(function (path) {
      return hasApprovedText(path) && path.rule.conditions.every(function (condition) { return conditionMatches(condition, answers); });
    }).slice(0, 3);
  }

  window.WC_RULE_ENGINE = {
    paths: paths,
    evaluate: evaluate,
    derive: derive,
    hasApprovedText: hasApprovedText,
    unavailableText: "Die Herleitung dieser Regel ist noch nicht freigegeben."
  };
}());
