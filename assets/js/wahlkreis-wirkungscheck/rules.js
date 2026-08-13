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
    hasApprovedText: hasApprovedText,
    unavailableText: "Die Herleitung dieser Regel ist noch nicht freigegeben."
  };
}());
