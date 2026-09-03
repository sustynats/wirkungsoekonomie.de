/* Deterministische, nachvollziehbare Ableitung. Kein KI- und kein Scoring-Code. */
(function () {
  "use strict";
  var roles = {
    rules: { title: "Regeln und Zuständigkeiten", text: "Der Bund kann Rechtsrahmen, Zuständigkeiten und Rechtsklarheit so gestalten, dass der gewählte Weg praktisch möglich und überprüfbar wird." },
    finance: { title: "Finanzierung und Anreize", text: "Der Bund kann Mittel, Vergütung oder Anreize auf den tatsächlich begrenzenden Faktor ausrichten und Additionalität prüfen." },
    delivery: { title: "Umsetzung und Zusammenarbeit", text: "Der Bund kann Vollzug, Kapazität und die Zusammenarbeit mit Ländern, Kommunen und Trägern so organisieren, dass die Entscheidung bei Betroffenen ankommt." },
    data: { title: "Daten und Rückkopplung", text: "Der Bund kann Beobachtung, Datenqualität und eine verbindliche Korrekturentscheidung sichern. Reporting allein ist noch keine Rückkopplung." }
  };
  var fallback = {
    direct: "Der gewählte Ansatz adressiert den benannten Engpass unmittelbar. Eine zweite Bedingung bleibt dennoch offen.",
    partial: "Der gewählte Ansatz kann einen Teil des benannten Engpasses verändern. Für eine Wirkung bei Betroffenen braucht es mindestens eine weitere Bedingung.",
    not_direct: "Der gewählte Ansatz verändert den benannten Engpass zunächst nicht unmittelbar. Das ist ein wichtiges Prüfergebnis, kein Fehler der Auswahl.",
    unclear: "Die Angaben reichen für eine belastbare Priorisierung noch nicht aus. Vor einer Ausweitung sollte der begrenzende Faktor genauer geklärt werden."
  };
  function index(items, id) { return (items || []).filter(function (item) { return item.id === id; })[0]; }
  function unique(items) { return items.filter(function (item, pos) { return items.indexOf(item) === pos; }); }
  function normalizeList(value) { return Array.isArray(value) ? value.filter(Boolean) : value ? [value] : []; }
  function fitFor(module, answers) {
    var approach = index(module.approaches, answers.approach);
    var bottlenecks = normalizeList(answers.bottlenecks).filter(function (id) { return id !== "unclear" && id !== "multiple"; });
    if (!approach || approach.id === "none" || !bottlenecks.length) return { kind: "unclear", text: fallback.unclear };
    var matches = bottlenecks.map(function (b) { return module.pairs[approach.id + ":" + b]; }).filter(Boolean);
    if (!matches.length) return { kind: "partial", text: fallback.partial };
    if (matches.some(function (match) { return match.fit === "direct"; })) return { kind: "direct", text: matches[0].text };
    return { kind: matches[0].fit || "partial", text: matches[0].text || fallback.partial };
  }
  function derive(module, answers) {
    var approach = index(module.approaches, answers.approach) || module.approaches[module.approaches.length - 1];
    var goal = index(module.goals, answers.goal) || module.goals[module.goals.length - 1];
    var selectedBottlenecks = normalizeList(answers.bottlenecks);
    var roleKeys = selectedBottlenecks.map(function (id) {
      var option = index(window.WC_V3_MODULES.common.bottlenecks, id);
      return option ? option.role : null;
    }).filter(function (role) { return role && role !== "clarify"; });
    if (!roleKeys.length && approach.role !== "clarify") roleKeys = [approach.role];
    if (selectedBottlenecks.indexOf("data") !== -1 && roleKeys.indexOf("data") === -1) roleKeys.push("data");
    roleKeys = unique(roleKeys).slice(0, 2);
    var fit = fitFor(module, answers);
    var redLines = normalizeList(answers.redLines).map(function (id) { return index(module.redLines, id); }).filter(Boolean);
    var signals = normalizeList(answers.signals).map(function (id) { return index(module.signals, id); }).filter(Boolean);
    var instrumentIds = [];
    if (roleKeys.indexOf("data") !== -1) instrumentIds.push("WOEK_LEGISLATIVE_IMPACT_FEEDBACK");
    if (roleKeys.indexOf("finance") !== -1) instrumentIds.push("WOEK_FUNDING_FEEDBACK");
    if (redLines.length) instrumentIds.push("WOEK_NON_COMPENSATION");
    if (!instrumentIds.length) instrumentIds.push("WOEK_LEGISLATIVE_IMPACT_FEEDBACK");
    instrumentIds = unique(instrumentIds).slice(0, 2);
    return {
      module: module, goal: goal, approach: approach, fit: fit, roles: roleKeys.map(function (key) { return roles[key]; }),
      redLines: redLines, signals: signals, instrumentIds: instrumentIds,
      path: [
        { title: "Bundesentscheidung", text: approach.label },
        { title: "Verändert zunächst", text: approach.first },
        { title: "Offene Bedingung", text: fit.text },
        { title: "Bei Betroffenen", text: goal.label },
        { title: "Beobachten", text: signals.length ? signals.map(function (signal) { return signal.label; }).join(" ") : "Vor einer Ausweitung ein überprüfbares Erfolgssignal festlegen." }
      ],
      correction: redLines.length ? "Wenn sich eine ausgewählte rote Linie verschlechtert, wird dies nicht gegen Fortschritte im Zielpfad aufgerechnet. Vor einer Ausweitung ist nachzusteuern, auszusetzen oder neu zu gestalten." : fit.kind === "not_direct" ? "Vor einer Ausweitung sollte der benannte Engpass geprüft werden; der gewählte Ansatz verändert ihn zunächst nicht unmittelbar." : "Wenn das gewählte Erfolgssignal ausbleibt, ist zu prüfen, an welcher Stelle die Wirkungskette abbricht und welche Voraussetzung korrigiert werden muss."
    };
  }
  window.WC_V3_RULES = { derive: derive, roles: roles, index: index, normalizeList: normalizeList };
})();
