/* Wirkungscheck Bundestag V2
 * Nicht indexierte Vorschau. Der Pflichtpfad ist lokal und deterministisch:
 * keine KI, keine Produktanalyse mit Antwortwerten, keine Personenbewertung.
 */
(function () {
  "use strict";

  var STORE_KEY = "wirkungscheck_bundestag_v2_preview";
  var MAX_OTHER = 300;
  /* Erweiterungen bleiben für den Verständlichkeitstest ausdrücklich aus.
     Sie erhalten erst nach Fach-, Datenschutz- und UX-Abnahme eigene
     Schnittstellen, statt die Baseline unbemerkt zu verändern. */
  var FEATURES = Object.freeze({
    sensitivity: false,
    woekAi: false,
    regionalCurves: false,
    crmPersonalization: false,
    answerValueAnalytics: false
  });
  var state = {
    screen: "landing",
    region: null,
    district: null,
    step: 0,
    answers: {
      topic: null,
      objective: null,
      bottlenecks: [],
      signals: [],
      boundaries: [],
      constraints: [],
      regionalFeedback: null,
      otherFeedback: ""
    }
  };

  var modules = {
    housing: {
      label: "Wohnen",
      audience: "Haushalte, die passenden und bezahlbaren Wohnraum suchen",
      objectives: [
        ["housing_access", "Mehr Haushalte finden passenden und bezahlbaren Wohnraum.", "Zugang passend zu Haushaltsgröße, Lage, Bedarf und Zahlungsfähigkeit."],
        ["housing_existing_use", "Vorhandener Wohnraum wird besser genutzt.", "Leerstand und schlecht genutzter Bestand werden aktiviert, ohne Zwang oder Verdrängung."],
        ["housing_total_cost", "Die gesamten Wohnkosten aus Miete, Energie und Nebenkosten werden tragbarer.", "Entscheidend ist die Gesamtbelastung, nicht nur die Angebotsmiete."],
        ["housing_need_supply", "Mehr benötigter Wohnraum entsteht dort, wo tatsächlich Bedarf besteht.", "Nicht bloß Einheiten zählen, sondern nutzbaren Wohnraum am tatsächlichen Bedarf ausrichten."],
        ["housing_accessible", "Mehr geeigneter barrierearmer oder altersgerechter Wohnraum steht zur Verfügung.", "Nutzbarkeit, Erreichbarkeit und Wechselmöglichkeiten verbessern."],
        ["housing_stability", "Menschen müssen seltener wegen steigender Wohnkosten ihr Umfeld verlassen.", "Unfreiwillige Umzüge und Wohnungsverluste begrenzen."],
        ["housing_unclear", "Noch nicht eindeutig.", "Zunächst klären, welche Menschen und welche Veränderung genau im Mittelpunkt stehen."],
        ["housing_other", "Andere Veränderung.", "Sie können die Veränderung später ergänzen."]
      ],
      signals: [
        ["housing_cost_burden", "Die Wohnkostenbelastung der adressierten Haushalte sinkt.", "Geeignete Ergänzungsdaten erforderlich."],
        ["housing_access", "Passender Wohnraum wird tatsächlich leichter zugänglich.", "Geeignete Ergänzungsdaten erforderlich."],
        ["housing_existing_use", "Bestehender leerer oder schlecht genutzter Wohnraum wird tatsächlich bewohnt.", "Geeignete Ergänzungsdaten erforderlich."],
        ["housing_target_group", "Geförderter Wohnraum erreicht die vorgesehene Zielgruppe.", "Geeignete Ergänzungsdaten erforderlich."],
        ["housing_no_displacement", "Unfreiwillige Wohnungsverluste oder Verdrängung nehmen nicht zu.", "Datenlücke im aktuellen Wahlkreisdatensatz."],
        ["housing_accessible", "Geeigneter barrierearmer Wohnraum wird besser verfügbar.", "Geeignete Ergänzungsdaten erforderlich."],
        ["housing_unknown", "Noch nicht beurteilbar.", "Zunächst eine beobachtbare Messfrage festlegen."]
      ],
      boundaries: [
        ["housing_cost", "Wohnkosten der adressierten Haushalte", "Mehr Angebot gleicht keinen Anstieg dieser Belastung aus."],
        ["housing_tenant_rights", "Miet- und Rechtsschutz", "Der Zugang darf nicht auf Kosten des Rechtsschutzes verbessert werden."],
        ["housing_low_income", "Zugang einkommensschwächerer Haushalte", "Erfolg ist unvollständig, wenn diese Haushalte ausgeschlossen bleiben."],
        ["housing_safety", "Gesundheit und Sicherheit des Wohnraums", "Wohnqualität und Sicherheit sind keine verrechenbare Nebenbedingung."],
        ["housing_accessibility", "Barrierefreiheit", "Fortschritt darf die Zugänglichkeit nicht verschlechtern."],
        ["housing_displacement", "Verdrängung aus bestehenden Quartieren", "Aufwertung und Sanierung müssen auf Verdrängungsfolgen geprüft werden."],
        ["housing_land", "Natur und Fläche", "Mehr Einheiten sind nicht automatisch vorrangig, wenn unverhältnismäßig Fläche verloren geht."],
        ["none", "Keine der genannten", "Es wird keine rote Linie aus dieser Liste priorisiert."],
        ["other", "Anderer Punkt", "Sie können den Punkt später ergänzen."]
      ],
      feedback: [
        ["housing_seekers", "Suchende berichten, dass geeigneter Wohnraum tatsächlich leichter verfügbar ist."],
        ["housing_vacancy", "Leerstand oder schlecht genutzter Bestand wird sichtbar aktiviert."],
        ["housing_subsidy", "Geförderte Wohnungen erreichen die vorgesehenen Haushalte."],
        ["housing_local_cost", "Die Wohnkostenbelastung sinkt auch vor Ort."],
        ["housing_renovation", "Sanierung verbessert die Gesamtbelastung, ohne Verdrängung auszulösen."],
        ["housing_no_progress", "Bundesweiter Fortschritt ist vor Ort bislang nicht erkennbar."],
        ["other", "Andere Beobachtung."]
      ],
      roleDetails: {
        rules: "Prüfen, ob Planungs-, Miet-, Förder- oder Zugangsregeln den gewünschten Zugang unterstützen oder blockieren.",
        finance: "Prüfen, ob Förderung, steuerliche Regeln und Kostenverteilung den adressierten Haushalten zugutekommen statt nur Bautätigkeit auszulösen.",
        delivery: "Prüfen, ob Planung, Bewilligung, Beratung, Verfahren und Kapazitäten den Weg zum Wohnraum praktisch begrenzen.",
        data: "Prüfen, welche Haushalte erreicht werden und ob sich Kosten, Zugang und Verdrängung tatsächlich verändern."
      },
      localGap: "Für diese Wirkungsfrage liegt im aktuellen Wahlkreisdatensatz keine ausreichend passende Kennzahl vor. Fertiggestellte Wohnungen je 1.000 Einwohner:innen wären nur ein Bau-Output und belegen weder Bezahlbarkeit noch Zugang."
    },
    care: {
      label: "Gesundheit und Pflege",
      audience: "Menschen mit gesundheitlichem oder pflegerischem Unterstützungsbedarf sowie ihre Angehörigen",
      objectives: [
        ["care_timely_help", "Menschen erhalten rechtzeitig die gesundheitliche oder pflegerische Hilfe, die sie benötigen.", "Zugang, Wartezeit, Erreichbarkeit und Übergänge verbessern."],
        ["care_self_determined", "Pflegebedürftige Menschen können möglichst selbstbestimmt und sicher leben.", "Unterstützte Autonomie und Sicherheit - nicht bloß Verbleib zu Hause."],
        ["care_relatives", "Angehörige werden durch Pflege nicht dauerhaft überlastet.", "Planbarkeit, Entlastung und Zugang zu Unterstützung verbessern."],
        ["care_workforce_time", "Fachkräfte haben genügend Zeit für gute Versorgung statt für vermeidbaren Verwaltungsaufwand.", "Versorgungszeit und Umsetzbarkeit statt bloßer Dokumentation."],
        ["care_continuity", "Hilfen greifen zwischen Praxis, Krankenhaus, Pflege, Reha und Kommune besser ineinander.", "Weniger Informations-, Zuständigkeits- und Versorgungsbrüche."],
        ["care_prevent_crisis", "Gesundheitliche Verschlechterungen werden früher erkannt und vermeidbare Krisen seltener.", "Frühe Unterstützung und präventive Wege stärken."],
        ["care_unclear", "Noch nicht eindeutig.", "Zunächst den betroffenen Personenkreis und die Veränderung konkretisieren."],
        ["care_other", "Andere Veränderung.", "Sie können die Veränderung später ergänzen."]
      ],
      signals: [
        ["care_timely", "Menschen erhalten notwendige Versorgung rechtzeitig und ohne vermeidbare Brüche.", "Geeignete Ergänzungsdaten erforderlich."],
        ["care_support", "Pflegebedürftige Menschen und ihre Angehörigen finden verlässlich passende Unterstützung.", "Geeignete Ergänzungsdaten erforderlich."],
        ["care_crises", "Vermeidbare Verschlechterungen, Krisen und Krankenhausaufenthalte nehmen ab.", "Geeignete Ergänzungsdaten erforderlich; keine Kausalität aus Routinedaten allein."],
        ["care_time", "Fachkräfte verbringen mehr Zeit mit Versorgung und weniger mit vermeidbarer Bürokratie.", "Geeignete Ergänzungsdaten erforderlich."],
        ["care_equity", "Versorgung erreicht Menschen unabhängig von Wohnort, Einkommen oder Unterstützungsnetz besser.", "Datenlücke im aktuellen Wahlkreisdatensatz."],
        ["care_environment", "Menschen können länger selbstbestimmt und sicher in ihrem gewählten Umfeld leben.", "Geeignete Ergänzungsdaten erforderlich."],
        ["care_unknown", "Noch nicht beurteilbar.", "Zunächst eine beobachtbare Messfrage festlegen."]
      ],
      boundaries: [
        ["care_dignity", "Sicherheit und Würde der versorgten Menschen", "Effizienzgewinn ersetzt keine sichere und würdige Versorgung."],
        ["care_access", "Zugang zu notwendiger Versorgung, auch bei geringem Einkommen", "Erfolg ist unvollständig, wenn Zugangshürden wachsen."],
        ["care_self_determination", "Selbstbestimmung und informierte Entscheidung der Betroffenen", "Entlastung darf nicht gegen den erklärten Willen Betroffener organisiert werden."],
        ["care_relatives", "Schutz von Angehörigen vor Überlastung", "Verlagerung unbezahlter Pflege ist keine neutrale Nebenfolge."],
        ["care_workforce", "Arbeitsbedingungen und Gesundheit der Fachkräfte", "Kapazität darf nicht durch Überlastung erkauft werden."],
        ["care_rural", "Verlässlichkeit im ländlichen Raum und in belasteten Regionen", "Zentralisierung erfordert Prüfung der tatsächlichen Erreichbarkeit."],
        ["care_data", "Schutz persönlicher Gesundheitsdaten", "Datengewinnung muss erforderlich, rechtssicher und verhältnismäßig sein."],
        ["none", "Keine der genannten", "Es wird keine rote Linie aus dieser Liste priorisiert."],
        ["other", "Anderer Punkt", "Sie können den Punkt später ergänzen."]
      ],
      feedback: [
        ["care_help", "Menschen und Angehörige finden vor Ort schneller passende Hilfe."],
        ["care_handover", "Übergänge zwischen Praxis, Krankenhaus, Pflege, Reha und Kommune funktionieren verlässlicher."],
        ["care_staff", "Fachkräfte berichten über weniger vermeidbare Dokumentation und Koordination."],
        ["care_access", "Unterstützung ist auch außerhalb großer Zentren erreichbar."],
        ["care_environment", "Pflegebedürftige Menschen können häufiger im gewünschten Umfeld bleiben."],
        ["care_no_progress", "Bundesweiter Fortschritt ist vor Ort bislang nicht erkennbar."],
        ["other", "Andere Beobachtung."]
      ],
      roleDetails: {
        rules: "Prüfen, ob Leistungs-, Berufs-, Zulassungs- und Datenschutzregeln den Versorgungsweg unnötig unterbrechen.",
        finance: "Prüfen, ob Vergütung und Förderung rechtzeitige, koordinierte und bedarfsgerechte Versorgung belohnen.",
        delivery: "Prüfen, ob Qualifizierung, Personal, sichere Verfahren, Übergaben und regionale Infrastruktur die Versorgung begrenzen.",
        data: "Prüfen, ob Versorgungsbrüche, Belastung und Zugangsungleichheit sichtbar werden, ohne Persönlichkeitsrechte zu verletzen."
      },
      localGap: "Der aktuelle Wahlkreisdatensatz enthält keine fachlich passende Gesundheits- oder Pflegekennzahl. Deshalb zeigt dieser Report keine zufälligen Sozial- oder Arbeitsmarktwerte."
    }
  };

  var bottlenecks = [
    ["rules", "Regeln passen nicht ausreichend zum Ziel.", "Recht, Standards oder Zugangsvoraussetzungen stehen der Veränderung im Weg."],
    ["finance", "Finanzierung oder Anreize lenken in die falsche Richtung.", "Mittel, Kosten oder Vergütung unterstützen den gewünschten Zustand nicht ausreichend."],
    ["people", "Personal oder notwendige Fähigkeiten fehlen.", "Es fehlen Zeit, Fachkräfte, Qualifizierung oder Umsetzungskapazität."],
    ["process", "Verfahren oder digitale Abläufe erschweren die Umsetzung.", "Antrag, Abstimmung oder Datenaustausch führen zu vermeidbarer Reibung."],
    ["coordination", "Bund, Länder und Kommunen greifen nicht gut genug ineinander.", "Zuständigkeiten und Übergaben passen nicht verlässlich zusammen."],
    ["access", "Infrastruktur oder tatsächlicher Zugang fehlen.", "Angebote, Erreichbarkeit oder praktische Zugangsvoraussetzungen reichen nicht aus."],
    ["data", "Wir wissen zu wenig darüber, was die Maßnahmen tatsächlich bewirken.", "Es fehlen geeignete Daten oder verbindliche Rückkopplung."],
    ["multiple", "Mehrere Punkte greifen ineinander.", "Ein einzelner Engpass erklärt die Lage nicht ausreichend."],
    ["unclear", "Noch nicht eindeutig.", "Zuerst einen belastbaren Klärungsauftrag formulieren."],
    ["other", "Sonstiges.", "Sie können den Punkt später ergänzen."]
  ];

  var constraints = [
    ["low_admin", "geringer zusätzlicher Verwaltungsaufwand"],
    ["practical", "praktisch gut umsetzbar"],
    ["funding", "tragfähige Finanzierung"],
    ["long_term", "langfristig belastbar"],
    ["social", "sozial ausgewogen"],
    ["local_scope", "kommunaler Gestaltungsspielraum"],
    ["economic", "wirtschaftlich tragfähig"],
    ["open_tech", "technologisch offen"],
    ["verifiable", "auf überprüfbaren Daten beruhend"],
    ["lawful", "rechtssicher und nachvollziehbar"],
    ["correctable", "leicht korrigierbar, wenn die Wirkung ausbleibt"],
    ["other", "andere Anforderung"]
  ];

  var questions = [
    { key: "topic", title: "Welches bundespolitische Thema möchten Sie heute prüfen?", intro: "Sie betrachten jetzt ein Thema. Weitere Themen können Sie später getrennt durchspielen.", mode: "single", min: 1, max: 1 },
    { key: "objective", title: "Was soll sich durch Bundespolitik in diesem Bereich konkret verbessern?", intro: "Wählen Sie den Zustand, der für Sie im Vordergrund steht.", mode: "single", min: 1, max: 1 },
    { key: "bottlenecks", title: "Was blockiert diese Veränderung derzeit aus Ihrer Sicht am stärksten?", intro: "Wählen Sie höchstens zwei Punkte. Wenn mehrere Punkte zusammenwirken, wählen Sie die entsprechende Antwort.", mode: "multi", min: 1, max: 2 },
    { key: "signals", title: "Woran müsste bundesweit erkennbar sein, dass die Veränderung tatsächlich eintritt?", intro: "Wählen Sie bis zu drei Veränderungen bei den betroffenen Menschen oder in ihrer konkreten Lebenslage. Ausgaben, Programme oder Projektzahlen allein sind noch kein Erfolgssignal.", mode: "multi", min: 1, max: 3 },
    { key: "boundaries", title: "Was darf eine Lösung auf keinen Fall verschlechtern?", intro: "Wählen Sie höchstens zwei rote Linien. Ein Fortschritt in einem Bereich rechtfertigt keine Verschlechterung dieser Punkte.", mode: "multi", min: 1, max: 2 },
    { key: "constraints", title: "Welche Anforderungen muss ein politischer Ansatz für Sie besonders erfüllen?", intro: "Wählen Sie bis zu drei Anforderungen. Diese Auswahl beschreibt einen Gestaltungsrahmen, keine Bewertung Ihrer politischen Haltung.", mode: "multi", min: 0, max: 3 },
    { key: "regionalFeedback", title: "Woran würden Sie in Ihrem Wahlkreis erkennen, dass die Bundespolitik dort tatsächlich ankommt?", intro: "Diese Beobachtung ergänzt die bundesweiten Erfolgssignale. Sie ist kein Vergleich Ihres Wahlkreises mit anderen Wahlkreisen.", mode: "single", min: 1, max: 1 }
  ];

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function create(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (error) {}
  }

  function clearStore() {
    try { localStorage.removeItem(STORE_KEY); } catch (error) {}
  }

  function announce(text) {
    var live = $("#v2-live");
    if (!live) return;
    live.textContent = "";
    window.setTimeout(function () { live.textContent = text; }, 40);
  }

  function currentModule() {
    return modules[state.answers.topic] || null;
  }

  function optionObjects(question) {
    var module = currentModule();
    if (question.key === "topic") {
      return Object.keys(modules).map(function (id) {
        return [id, modules[id].label, id === "housing" ? "Bezahlbarkeit, Zugang, Bestand und Wohnsicherheit." : "Zugang, Selbstbestimmung, Pflege und Versorgungskontinuität."];
      });
    }
    if (!module) return [];
    if (question.key === "objective") return module.objectives;
    if (question.key === "bottlenecks") return bottlenecks;
    if (question.key === "signals") return module.signals;
    if (question.key === "boundaries") return module.boundaries;
    if (question.key === "constraints") return constraints;
    if (question.key === "regionalFeedback") return module.feedback;
    return [];
  }

  function findOption(questionKey, id) {
    var question = questions.filter(function (item) { return item.key === questionKey; })[0];
    var options = optionObjects(question);
    return options.filter(function (option) { return option[0] === id; })[0] || null;
  }

  function selectionFor(question) {
    if (question.mode === "single") return state.answers[question.key] ? [state.answers[question.key]] : [];
    return state.answers[question.key] || [];
  }

  function setScreen(name, focusSelector, scroll) {
    state.screen = name;
    $$(".wcv2-screen").forEach(function (screen) {
      screen.classList.toggle("is-active", screen.id === "v2-" + name);
    });
    save();
    if (focusSelector) {
      window.setTimeout(function () {
        var focusTarget = $(focusSelector);
        if (focusTarget) focusTarget.focus({ preventScroll: true });
        if (scroll) {
          var section = $("#v2-" + name);
          if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 0);
    }
  }

  function resetAll() {
    state = {
      screen: "landing",
      region: null,
      district: null,
      step: 0,
      answers: { topic: null, objective: null, bottlenecks: [], signals: [], boundaries: [], constraints: [], regionalFeedback: null, otherFeedback: "" }
    };
    clearStore();
    setScreen("landing", "#v2-landing h1", true);
  }

  function chooseRegion(value) {
    state.region = value;
    if (value === "no") state.district = null;
    $$(".wcv2-region-choice").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.regionChoice === value));
    });
    $("#v2-district-picker").hidden = value !== "yes";
    $("#v2-region-error").hidden = true;
    save();
    if (value === "yes") $("#v2-district-search").focus();
  }

  function districtMatches(query) {
    var districts = (window.WC_DATA && window.WC_DATA.districts) || [];
    var term = query.trim().toLocaleLowerCase("de-DE");
    if (!term) return [];
    return districts.filter(function (district) {
      return [district.nr, district.name, district.land].join(" ").toLocaleLowerCase("de-DE").indexOf(term) !== -1;
    }).slice(0, 8);
  }

  function renderDistrictMatches() {
    var field = $("#v2-district-search");
    var results = $("#v2-district-results");
    var matches = districtMatches(field.value);
    results.replaceChildren();
    if (!field.value.trim()) return;
    if (!matches.length) {
      var empty = create("p", "wc-meta", "Kein passender Wahlkreis gefunden. Bitte prüfen Sie die Eingabe oder fahren Sie ohne Wahlkreis fort.");
      results.appendChild(empty);
      return;
    }
    matches.forEach(function (district) {
      var button = create("button", "wcv2-result");
      button.type = "button";
      button.setAttribute("role", "option");
      button.textContent = district.nr + " · " + district.name;
      var small = create("small", "", district.land);
      button.appendChild(small);
      button.addEventListener("click", function () {
        state.district = { id: district.nr, name: district.name, land: district.land };
        field.value = district.nr + " · " + district.name;
        results.replaceChildren();
        var selected = $("#v2-district-selected");
        selected.hidden = false;
        selected.textContent = "Ausgewählt: Wahlkreis " + district.nr + " · " + district.name + ". Im Report werden keine Kennzahlen oder Vergleiche zu diesem Wahlkreis angezeigt.";
        $("#v2-region-error").hidden = true;
        save();
        announce("Wahlkreis ausgewählt: " + district.name + ".");
      });
      results.appendChild(button);
    });
  }

  function renderProgress() {
    var holder = $("#v2-progress");
    holder.replaceChildren();
    questions.forEach(function (question, index) {
      var item = create("div", "wcv2-progress__item");
      item.classList.toggle("is-done", index < state.step);
      item.classList.toggle("is-current", index === state.step);
      item.appendChild(create("span", "wcv2-progress__bar"));
      item.appendChild(create("span", "", String(index + 1)));
      item.setAttribute("aria-label", "Frage " + (index + 1) + (index < state.step ? ": beantwortet" : index === state.step ? ": aktuell" : ": noch offen"));
      holder.appendChild(item);
    });
  }

  function optionButton(question, option) {
    var selected = selectionFor(question).indexOf(option[0]) !== -1;
    var button = create("button", "wcv2-option");
    button.type = "button";
    button.dataset.optionId = option[0];
    button.dataset.questionKey = question.key;
    button.dataset.mode = question.mode;
    button.setAttribute("aria-pressed", String(selected));
    button.setAttribute("data-mode", question.mode);
    var mark = create("span", "wcv2-option__mark", selected ? "✓" : "");
    mark.setAttribute("aria-hidden", "true");
    var label = create("span", "wcv2-option__label", option[1]);
    button.appendChild(mark);
    button.appendChild(label);
    if (option[2]) button.appendChild(create("span", "wcv2-option__hint", option[2]));
    button.addEventListener("click", function () {
      toggleAnswer(question, option[0]);
    });
    return button;
  }

  function refreshOptionStates(question) {
    $$(".wcv2-option[data-question-key='" + question.key + "']").forEach(function (button) {
      var active = selectionFor(question).indexOf(button.dataset.optionId) !== -1;
      button.setAttribute("aria-pressed", String(active));
      button.querySelector(".wcv2-option__mark").textContent = active ? "✓" : "";
    });
  }

  function toggleAnswer(question, id) {
    var current = selectionFor(question).slice();
    if (question.mode === "single") {
      state.answers[question.key] = id;
    } else {
      var index = current.indexOf(id);
      if (index !== -1) {
        current.splice(index, 1);
      } else {
        if (question.key === "boundaries" && id === "none") current = ["none"];
        else if (question.key === "boundaries" && current.indexOf("none") !== -1) current = [id];
        else if (current.length >= question.max) {
          showQuestionError("Sie können hier höchstens " + question.max + " Antworten auswählen.");
          announce("Maximal " + question.max + " Antworten möglich.");
          return;
        } else current.push(id);
      }
      state.answers[question.key] = current;
    }

    if (question.key === "topic") {
      state.answers.objective = null;
      state.answers.signals = [];
      state.answers.boundaries = [];
      state.answers.regionalFeedback = null;
      state.answers.otherFeedback = "";
    }
    refreshOptionStates(question);
    showQuestionError("");
    save();
  }

  function showQuestionError(message) {
    var error = $("#v2-question-error");
    error.textContent = message || "";
    error.hidden = !message;
  }

  function questionTitle(question) {
    if (question.key !== "regionalFeedback") return question.title;
    return state.region === "yes" && state.district
      ? "Woran würden Sie in Ihrem Wahlkreis erkennen, dass die Bundespolitik dort tatsächlich ankommt?"
      : "Welche regionale oder praktische Rückmeldung wäre für Ihre bundespolitische Beurteilung besonders wichtig?";
  }

  function questionIntro(question) {
    if (question.key !== "regionalFeedback") return question.intro;
    return state.region === "yes" && state.district
      ? "Diese Beobachtung ergänzt die bundesweiten Erfolgssignale. Sie ist kein Vergleich Ihres Wahlkreises mit anderen Wahlkreisen."
      : "Diese Beobachtung ergänzt die bundesweiten Erfolgssignale. Sie müssen keinen Wahlkreis angeben, um eine praktische Rückmeldung festzuhalten.";
  }

  function renderQuestion() {
    var question = questions[state.step];
    var host = $("#v2-question");
    host.replaceChildren();
    renderProgress();
    showQuestionError("");

    var kicker = create("p", "wcv2-question-kicker", "Frage " + (state.step + 1) + " von " + questions.length + (question.max > 1 ? " · bis zu " + question.max + " Antworten" : ""));
    var title = create("h1", "wc-question", questionTitle(question));
    title.id = "v2-question-title";
    title.tabIndex = -1;
    var intro = create("p", "wcv2-question-intro", questionIntro(question));
    var grid = create("div", "wcv2-option-grid");
    optionObjects(question).forEach(function (option) { grid.appendChild(optionButton(question, option)); });
    host.appendChild(kicker);
    host.appendChild(title);
    host.appendChild(intro);
    host.appendChild(grid);

    if (question.key === "regionalFeedback") {
      var label = create("label", "wcv2-field-label", "Andere Beobachtung oder Ergänzung (optional, maximal 300 Zeichen)");
      label.htmlFor = "v2-other-feedback";
      var area = create("textarea", "wcv2-textarea");
      area.id = "v2-other-feedback";
      area.maxLength = MAX_OTHER;
      area.placeholder = "Keine personenbezogenen Angaben oder vertraulichen Informationen eingeben.";
      area.value = state.answers.otherFeedback || "";
      area.addEventListener("input", function () {
        state.answers.otherFeedback = area.value.slice(0, MAX_OTHER);
        save();
      });
      host.appendChild(label);
      host.appendChild(area);
    }

    var back = $("[data-action='previous']");
    back.textContent = state.step === 0 ? "Regionalen Bezug ändern" : "Zurück";
    window.setTimeout(function () {
      title.focus({ preventScroll: true });
      $("#v2-survey").scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  function validCurrentQuestion() {
    var question = questions[state.step];
    var amount = selectionFor(question).length;
    if (amount < question.min) {
      showQuestionError("Bitte wählen Sie mindestens eine Antwort aus, damit der Report auf Ihre Angaben eingehen kann.");
      return false;
    }
    return true;
  }

  function nextQuestion() {
    if (!validCurrentQuestion()) return;
    if (state.step < questions.length - 1) {
      state.step += 1;
      save();
      renderQuestion();
    } else {
      buildReport();
      setScreen("report", "#v2-report-title", true);
    }
  }

  function previousQuestion() {
    if (state.step === 0) {
      setScreen("region", "#v2-region h1", true);
      return;
    }
    state.step -= 1;
    save();
    renderQuestion();
  }

  function selectedText(key, fallback) {
    var ids = Array.isArray(state.answers[key]) ? state.answers[key] : [state.answers[key]];
    var question = questions.filter(function (item) { return item.key === key; })[0];
    var texts = ids.filter(Boolean).map(function (id) {
      var option = findOption(question.key, id);
      return option ? option[1] : "";
    }).filter(Boolean);
    return texts.length ? texts : (fallback ? [fallback] : []);
  }

  function deriveRoles() {
    var selected = state.answers.bottlenecks || [];
    var roles = [];
    function add(id, label, detail) {
      if (!roles.some(function (role) { return role.id === id; })) roles.push({ id: id, label: label, detail: detail });
    }
    var module = currentModule();
    if (selected.indexOf("rules") !== -1) add("rules", "Rechtsrahmen und Standards", module.roleDetails.rules);
    if (selected.indexOf("finance") !== -1) add("finance", "Finanzierung und Anreize", module.roleDetails.finance);
    if (["people", "process", "coordination", "access"].some(function (id) { return selected.indexOf(id) !== -1; })) add("delivery", "Vollzug und Umsetzbarkeit", module.roleDetails.delivery);
    if (selected.indexOf("data") !== -1) add("data", "Wirkungsdaten und Rückkopplung", module.roleDetails.data);
    if (selected.indexOf("multiple") !== -1 && roles.length < 2) {
      add("delivery", "Vollzug und Umsetzbarkeit", module.roleDetails.delivery);
      add("data", "Wirkungsdaten und Rückkopplung", module.roleDetails.data);
    }
    return roles.slice(0, 2);
  }

  function mechanismFor(roles) {
    if (!roles.length) return "den Engpass mit Betroffenen, zuständigen Stellen und vorhandenen Daten zuerst genauer einzugrenzen";
    if (roles.length === 1) return roles[0].detail.charAt(0).toLowerCase() + roles[0].detail.slice(1);
    return roles[0].detail.charAt(0).toLowerCase() + roles[0].detail.slice(1) + " Zugleich sollte " + roles[1].detail.charAt(0).toLowerCase() + roles[1].detail.slice(1);
  }

  function roleHeadline(roles) {
    if (!roles.length) return "Zuerst den Engpass genauer klären";
    if (roles.length === 1) return roles[0].label;
    return roles[0].label + " und " + roles[1].label;
  }

  function primaryBoundary() {
    var ids = state.answers.boundaries || [];
    var usable = ids.filter(function (id) { return id !== "none" && id !== "other"; });
    return selectedText("boundaries", ["keine rote Linie aus der Auswahl"])[Math.max(0, ids.indexOf(usable[0]))] || selectedText("boundaries", ["keine rote Linie aus der Auswahl"])[0];
  }

  function primarySignal() {
    return selectedText("signals", ["ein noch zu definierendes Erfolgssignal"])[0];
  }

  function feedbackText() {
    if (state.answers.regionalFeedback === "other" && state.answers.otherFeedback.trim()) return state.answers.otherFeedback.trim();
    return selectedText("regionalFeedback", ["eine praktische Rückmeldung aus der Umsetzung"])[0];
  }

  function appendSection(parent, title, intro) {
    var section = create("section", "wcv2-report-section");
    var heading = create("h2", "wc-h2", title);
    section.appendChild(heading);
    if (intro) section.appendChild(create("p", "wc-muted", intro));
    parent.appendChild(section);
    return section;
  }

  function addText(parent, text, className) {
    parent.appendChild(create("p", className || "", text));
  }

  function buildReport() {
    var module = currentModule();
    var objective = selectedText("objective", ["Die gewünschte Veränderung ist noch zu klären."])[0];
    var roles = deriveRoles();
    var signal = primarySignal();
    var boundary = primaryBoundary();
    var feedback = feedbackText();
    var selectedSignals = selectedText("signals", []);
    var report = $("#v2-report-content");
    report.replaceChildren();

    var head = create("div", "wc-band--navy wcv2-report-head");
    var headShell = create("div", "wc-shell wc-shell--narrow");
    headShell.appendChild(create("p", "wc-eyebrow", "Ihr Bundespolitik-Wirkungsreport"));
    var title = create("h1", "wc-h1", module.label);
    title.id = "v2-report-title";
    title.tabIndex = -1;
    headShell.appendChild(title);
    headShell.appendChild(create("p", "wc-meta", state.district ? "Regionale Rückkopplung: Wahlkreis " + state.district.id + " · " + state.district.name : "Bundespolitische Einordnung ohne Wahlkreisvergleich"));
    headShell.appendChild(create("p", "wc-note", "Dieser Report ist ein Prüfauftrag aus Ihren Angaben. Er beschreibt eine plausible Annahme, keine Vorhersage und keine Bewertung Ihrer Person."));
    head.appendChild(headShell);
    report.appendChild(head);

    var shell = create("div", "wc-shell wc-shell--narrow wc-section");
    var layout = create("div", "wcv2-report-layout");
    shell.appendChild(layout);

    var goalSection = appendSection(layout, "Was soll sich verändern?", "Ihr gewählter Zielzustand:");
    addText(goalSection, objective);

    var leverSection = appendSection(layout, "Wo zuerst bundespolitisch prüfen?");
    if (!roles.length) {
      addText(leverSection, "Mit den vorliegenden Angaben lässt sich noch keine belastbare Handlungsoption priorisieren. Sinnvoll wäre zunächst, den Engpass mit den Betroffenen, zuständigen Stellen und vorhandenen Daten einzugrenzen.");
    } else {
      addText(leverSection, "Ihre Angaben sprechen zunächst für: " + roleHeadline(roles) + ".");
      roles.forEach(function (role) {
        var card = create("div", "wc-card");
        card.style.marginTop = "0.75rem";
        card.appendChild(create("h3", "wc-h3 wc-card__title", role.label));
        card.appendChild(create("p", "wc-muted", role.detail));
        leverSection.appendChild(card);
      });
    }

    var pathSection = appendSection(layout, "Über welchen Weg könnte das wirken?", "Dies ist eine prüfbare Annahme. Ob sie trägt, zeigt sich erst an beobachtbaren Veränderungen.");
    var path = create("ol", "wcv2-report-path");
    var pathItems = [
      ["Bund verändert oder prüft …", mechanismFor(roles)],
      ["Dadurch verändert sich bei …", module.audience + " der Zugang, die Verlässlichkeit oder die konkrete Umsetzung."],
      ["Wenn die Annahme trägt, müsste … sichtbar werden", signal],
      [state.district ? "In " + state.district.name + " wäre zusätzlich zu beobachten …" : "In der Praxis wäre zusätzlich zu beobachten …", feedback],
      ["Nicht übersehen werden darf …", boundary]
    ];
    pathItems.forEach(function (entry) {
      var item = create("li");
      item.appendChild(create("strong", "", entry[0]));
      item.appendChild(create("span", "", entry[1]));
      path.appendChild(item);
    });
    pathSection.appendChild(path);

    var observationSection = appendSection(layout, "Drei Dinge beobachten", "Nicht die Zahl gestarteter Projekte oder ausgegebener Mittel, sondern Veränderungen in der tatsächlichen Lebens- oder Versorgungslage.");
    var observations = create("div", "wcv2-observations");
    var selected = selectedSignals.slice(0, 3);
    if (selected.length < 3 && boundary && boundary.indexOf("keine rote") === -1) selected.push("Ob sich die rote Linie verschlechtert: " + boundary + ".");
    while (selected.length < 3) selected.push("Welche geeigneten Ergänzungsdaten zeigen, ob der gewünschte Zustand bei den adressierten Menschen eintritt.");
    selected.slice(0, 3).forEach(function (item) {
      var box = create("div", "wcv2-observation");
      box.appendChild(create("strong", "", item));
      var status = item.indexOf("Datenlücke") !== -1 || item.indexOf("Verdrängung") !== -1 || item.indexOf("unabhängig von Wohnort") !== -1
        ? "Datenlücke im aktuellen Wahlkreisdatensatz."
        : "Geeignete Ergänzungsdaten erforderlich.";
      box.appendChild(create("span", "wcv2-status", status));
      observations.appendChild(box);
    });
    observationSection.appendChild(observations);

    var regionSection = appendSection(layout, state.district ? "Wie sich die Bundeswirkung in " + state.district.name + " prüfen ließe" : "Welche praktische Rückmeldung die Bundesbeurteilung ergänzt");
    addText(regionSection, "Die Rückmeldung ist kein Wahlkreisvergleich und kein Nachweis einer Ursache. Sie hilft zu prüfen, ob eine bundesweite Annahme in der Praxis ankommt: " + feedback);
    var gap = create("p", "wc-note wc-note--quiet", module.localGap);
    regionSection.appendChild(gap);

    var parliamentary = appendSection(layout, "Prüffrage für die parlamentarische Arbeit");
    var questionText = "Welche Daten liegen der Bundesregierung dazu vor, ob " + objective.charAt(0).toLowerCase() + objective.slice(1) + " durch den beschriebenen Ansatz tatsächlich erreicht wird, und anhand welcher Indikatoren wird geprüft, ob " + boundary.charAt(0).toLowerCase() + boundary.slice(1) + " sich verschlechtert?";
    var copy = create("div", "wcv2-question-copy");
    copy.appendChild(create("p", "", questionText));
    var copyButton = create("button", "wc-btn wc-btn--secondary", "Prüffrage kopieren");
    copyButton.type = "button";
    copyButton.addEventListener("click", function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(questionText).then(function () {
          copyButton.textContent = "Kopiert";
          announce("Die Prüffrage wurde in die Zwischenablage kopiert.");
        }).catch(function () { window.prompt("Prüffrage kopieren:", questionText); });
      } else {
        window.prompt("Prüffrage kopieren:", questionText);
      }
    });
    copy.appendChild(copyButton);
    parliamentary.appendChild(copy);

    var risk = appendSection(layout, "Was nicht übersehen werden darf");
    addText(risk, boundary + " ist eine rote Linie. Ein Fortschritt an anderer Stelle gleicht eine Verschlechterung dort nicht aus.");
    risk.appendChild(create("h3", "wc-h3", "Wann sollte nachgesteuert werden?"));
    addText(risk, "Wenn " + boundary.charAt(0).toLowerCase() + boundary.slice(1) + " sich verschlechtert, " + signal.charAt(0).toLowerCase() + signal.slice(1) + " aber nicht besser wird, funktioniert der angenommene Weg offenbar nicht wie erwartet. Dann sollte nicht einfach mehr vom Gleichen gemacht werden. Es braucht eine erneute Prüfung von Regeln, Anreizen oder Umsetzung.");

    var constraintsSection = appendSection(layout, "Rahmen für die Ausgestaltung");
    var selectedConstraints = selectedText("constraints", []);
    addText(constraintsSection, selectedConstraints.length ? "Besonders wichtig nach Ihren Angaben: " + selectedConstraints.join(" · ") + "." : "Sie haben keinen zusätzlichen Gestaltungsrahmen priorisiert. Der Report ergänzt deshalb keine stillschweigende Präferenz.");

    var details = create("details", "wcv2-report-details");
    var summary = create("summary", "", "Warum sehe ich dieses Ergebnis?");
    details.appendChild(summary);
    var detailBody = create("div");
    detailBody.appendChild(create("h3", "wc-h3", "Ihre Angaben"));
    detailBody.appendChild(create("p", "wc-muted", "Thema: " + module.label + " · Ziel: " + objective + " · Engpass: " + selectedText("bottlenecks", ["noch nicht eindeutig"]).join(" / ") + " · Erfolgssignale: " + selectedSignals.join(" / ") + " · rote Linie: " + boundary + "."));
    detailBody.appendChild(create("h3", "wc-h3", "Fachliche Regel"));
    detailBody.appendChild(create("p", "wc-muted", roles.length ? "Der genannte Engpass aktiviert die Bundesrolle(n) " + roleHeadline(roles) + ". Die Ableitung ist ein erster Prüfauftrag, keine Maßnahmenempfehlung." : "Bei unklaren Angaben wird keine Bundesrolle künstlich priorisiert."));
    detailBody.appendChild(create("h3", "wc-h3", "Evidenzgrenze"));
    detailBody.appendChild(create("p", "wc-muted", "Der Report zeigt Wirkungspotenzial und Wirkungsrisiko. Tatsächliche Wirkung kann erst festgestellt werden, wenn eine passend abgegrenzte Zustandsveränderung beobachtet wurde."));
    details.appendChild(detailBody);
    layout.appendChild(details);

    var instruments = appendSection(layout, "Passende Instrumente der Wirkungsökonomie kennenlernen", "Freiwillige Vertiefung. Die folgenden Ansätze verändern Ihren Kurzreport nicht und bewerten keine Person.");
    var instrumentGrid = create("div", "wcv2-instruments");
    chooseInstruments(roles).forEach(function (instrument) {
      var card = create("article", "wcv2-instrument");
      card.appendChild(create("h3", "wc-h3", instrument.title));
      card.appendChild(create("p", "wc-muted", instrument.text));
      var link = create("a", "", "Mehr zum Thema");
      link.href = instrument.href;
      card.appendChild(link);
      instrumentGrid.appendChild(card);
    });
    instruments.appendChild(instrumentGrid);

    var end = create("div", "wc-btn-row");
    end.style.marginTop = "2rem";
    var printButton = create("button", "wc-btn wc-btn--primary", "Report drucken");
    printButton.type = "button";
    printButton.dataset.action = "print";
    printButton.addEventListener("click", function () { window.print(); });
    var restartButton = create("button", "wc-btn wc-btn--secondary", "Neues Thema prüfen");
    restartButton.type = "button";
    restartButton.dataset.action = "restart";
    restartButton.addEventListener("click", resetAll);
    end.appendChild(printButton);
    end.appendChild(restartButton);
    shell.appendChild(end);
    report.appendChild(shell);
  }

  function chooseInstruments(roles) {
    var instruments = [];
    function add(title, text, href) {
      if (instruments.length < 2) instruments.push({ title: title, text: text, href: href });
    }
    if ((state.answers.boundaries || []).some(function (id) { return id !== "none" && id !== "other"; })) {
      add("Nichtkompensation", "Manche Verschlechterungen dürfen nicht gegen Fortschritte an anderer Stelle aufgerechnet werden. Die von Ihnen gewählte rote Linie bleibt deshalb sichtbar, auch wenn andere Signale positiv aussehen.", "../../begriffe/wirkungsrisiko/");
    }
    if ((state.answers.bottlenecks || []).indexOf("finance") !== -1) {
      add("Fördermittelrückkopplung", "Förderung kann so gestaltet werden, dass sichtbar wird, ob die vorgesehene Zielgruppe tatsächlich erreicht wird und wann nachgesteuert werden muss.", "../../wirkungssteuerung/beschaffung-foerderung/");
    } else if ((state.answers.bottlenecks || []).indexOf("data") !== -1 || (state.answers.constraints || []).indexOf("verifiable") !== -1) {
      add("Wirkungsdaten", "Wirkungsdaten fragen nicht nur, wie viel getan wurde. Sie helfen zu prüfen, ob sich für die adressierten Menschen tatsächlich etwas verändert und wo ein Risiko entsteht.", "../../wirkungssteuerung/woek-ids/");
    } else if ((state.answers.constraints || []).indexOf("funding") !== -1) {
      add("Wirkungshaushalt", "Ein Wirkungshaushalt verbindet Mittel, erwartete Veränderung, Risiken und einen Zeitpunkt für die Überprüfung. Er ersetzt keine politische Entscheidung.", "../../wirkungssteuerung/wirkungshaushalt/");
    }
    if (instruments.length < 2) {
      add("Gesetzliche Wirkungsrückkopplung", "Ein Gesetz kann Ziel, Erfolgssignal, rote Linie und Zeitpunkt für die Überprüfung von Anfang an festhalten. Das macht Nachsteuerung möglich, ohne demokratische Entscheidung zu ersetzen.", "../../wirkungssteuerung/wstg/");
    }
    return instruments;
  }

  function startQuestions() {
    if (state.region === null) {
      var error = $("#v2-region-error");
      error.textContent = "Bitte wählen Sie, ob Sie einen Wahlkreis einbeziehen möchten.";
      error.hidden = false;
      return;
    }
    if (state.region === "yes" && !state.district) {
      var districtError = $("#v2-region-error");
      districtError.textContent = "Bitte wählen Sie einen Wahlkreis aus oder fahren Sie nur mit Bundesebene fort.";
      districtError.hidden = false;
      return;
    }
    state.step = 0;
    save();
    setScreen("survey");
    renderQuestion();
  }

  function attachEvents() {
    document.addEventListener("click", function (event) {
      var actionElement = event.target.closest("[data-action]");
      if (!actionElement) return;
      var action = actionElement.dataset.action;
      if (action === "start") {
        event.preventDefault();
        setScreen("region", "#v2-region h1", true);
      } else if (action === "landing") {
        event.preventDefault();
        setScreen("landing", "#v2-landing h1", true);
      } else if (action === "begin-questions") {
        event.preventDefault();
        startQuestions();
      } else if (action === "next") {
        event.preventDefault();
        nextQuestion();
      } else if (action === "previous") {
        event.preventDefault();
        previousQuestion();
      }
    });

    $$(".wcv2-region-choice").forEach(function (button) {
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", function () { chooseRegion(button.dataset.regionChoice); });
    });

    $("#v2-district-search").addEventListener("input", function () {
      state.district = null;
      $("#v2-district-selected").hidden = true;
      renderDistrictMatches();
    });
  }

  function restore() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return;
      var saved = JSON.parse(raw);
      if (!saved || !saved.answers || !saved.answers.topic) return;
      state = saved;
      if (state.region) {
        $$(".wcv2-region-choice").forEach(function (button) {
          button.setAttribute("aria-pressed", String(button.dataset.regionChoice === state.region));
        });
        $("#v2-district-picker").hidden = state.region !== "yes";
      }
    } catch (error) {}
  }

  function init() {
    attachEvents();
    restore();
    if (state.screen === "survey" && state.answers.topic) {
      setScreen("survey");
      renderQuestion();
    } else if (state.screen === "report" && state.answers.topic) {
      buildReport();
      setScreen("report");
    } else {
      setScreen("landing");
    }
  }

  init();
}());
