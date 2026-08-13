/* Wahlkreis-Wirkungscheck
 * Lokaler, regelbasierter Fragebogen. Die Anwendung überträgt keine Antworten.
 * Amtliche Wahlkreisdaten: data-2025.js; Prüfregeln: rules.js.
 */
(function () {
  "use strict";

  var M = window.WC_CHECK;
  var STORE_KEY = "wc_state_v1";
  var SCHEMA = 2;

  /* ------------------------------------------------------------- Zustand */

  var state = {
    schemaVersion: SCHEMA,
    district: null,
    answers: {},
    seenIntro: false,
    whyOpen: false,
    step: 0
  };

  var ui = {
    screen: "landing",
    pathView: {},
    sens: [],
    lastFocus: null
  };

  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) {
      /* Privatmodus oder voller Speicher: Der Fragebogen läuft ohne Persistenz weiter. */
    }
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return false;
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.schemaVersion !== SCHEMA) return "expired";
      state = parsed;
      return true;
    } catch (e) {
      return "expired";
    }
  }

  function wipe() {
    try {
      localStorage.removeItem(STORE_KEY);
    } catch (e) {}
    state = {
      schemaVersion: SCHEMA, district: null, answers: {},
      seenIntro: false, whyOpen: false, step: 0
    };
  }

  /* ------------------------------------------------------------ Helfer */

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "text") node.textContent = attrs[k];
        else if (k === "html") node.innerHTML = attrs[k];
        else if (attrs[k] !== null && attrs[k] !== undefined) node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) {
      if (c) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }
  function announce(msg, assertive) {
    var region = $(assertive ? "#wc-live-assertive" : "#wc-live-polite");
    if (!region) return;
    region.textContent = "";
    window.setTimeout(function () {
      region.textContent = msg;
    }, 60);
  }
  function byId(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  var EVIDENCE = {
    amtlich: { label: "Amtliche Datenquelle", filled: 3, tone: "var(--wc-scale-4)" },
    hoch: { label: "Belegbarkeit: hoch", filled: 3, tone: "var(--wc-scale-4)" },
    mittel: { label: "Belegbarkeit: mittel", filled: 2, tone: "var(--wc-scale-3)" },
    begrenzt: { label: "Belegbarkeit: begrenzt", filled: 1, tone: "var(--wc-scale-2)" },
    datenluecke: { label: "Datenlücke", filled: 0, tone: "var(--wc-scale-2)" },
    annahme: { label: "Modellannahme", filled: -1, tone: "var(--wc-scale-2)" }
  };

  /* Segmentzeichen: gefuellte Rechtecke plus Kontur fuer leere Stufen.
     Bedeutung liegt im Wort, nicht in der Farbe. */
  function evidenceMark(level) {
    var def = EVIDENCE[level] || EVIDENCE.begrenzt;
    var span = el("span", { class: "wc-evidence", role: "img", "aria-label": def.label });
    var svg = '<svg width="34" height="14" viewBox="0 0 34 14" aria-hidden="true" focusable="false">';
    if (def.filled === -1) {
      svg += '<path d="M7 1.5 12.5 7 7 12.5 1.5 7Z" fill="none" stroke="' + def.tone + '" stroke-width="1.5"/>';
    } else {
      for (var i = 0; i < 3; i++) {
        var x = i * 12 + 1;
        if (i < def.filled) {
          svg += '<rect x="' + x + '" y="0.5" width="8" height="13" rx="2" fill="' + def.tone + '"/>';
        } else {
          svg += '<rect x="' + (x + 0.75) + '" y="1.25" width="6.5" height="11.5" rx="2" fill="none" stroke="var(--wc-scale-3)" stroke-width="1.5"/>';
        }
      }
    }
    svg += "</svg>";
    span.innerHTML = svg + "<span>" + def.label + "</span>";
    return span;
  }

  /* Abdeckungsgrad eines Wirkungshebels. Gleiche neutrale Segmentform wie die
     Belegbarkeit, aber andere Bedeutung: hier geht es um „adressiert“, nicht um
     „belegt“. Deshalb traegt das Zeichen keinen eigenen Namen, sondern ist
     dekorativ; die Bedeutung steht als Wort daneben. */
  function degreeMark(degree) {
    var span = el("span", { class: "wc-evidence", "aria-hidden": "true" });
    var svg = '<svg width="34" height="14" viewBox="0 0 34 14" aria-hidden="true" focusable="false">';
    for (var i = 0; i < 3; i++) {
      var x = i * 12 + 1;
      if (i < degree) {
        svg += '<rect x="' + x + '" y="0.5" width="8" height="13" rx="2" fill="var(--wc-scale-4)"/>';
      } else {
        svg += '<rect x="' + (x + 0.75) + '" y="1.25" width="6.5" height="11.5" rx="2" fill="none" stroke="var(--wc-scale-3)" stroke-width="1.5"/>';
      }
    }
    span.innerHTML = svg + "</svg>";
    return span;
  }

  function glyph(mode, checked) {
    var svg;
    if (mode === "multi") {
      svg = '<rect x="2.75" y="2.75" width="18.5" height="18.5" rx="4" fill="none" stroke="currentColor" stroke-width="1.75"/>';
      if (checked) svg += '<path d="M7 12.4 10.6 16 17 8.8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>';
    } else {
      svg = '<circle cx="12" cy="12" r="9.25" fill="none" stroke="currentColor" stroke-width="1.75"/>';
      if (checked) svg += '<circle cx="12" cy="12" r="5" fill="currentColor"/>';
    }
    return '<svg class="wc-tile__glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + svg + "</svg>";
  }

  /* Antwortflaeche. Zustand liegt auf aria-checked, nicht auf einer Klasse. */
  function tile(opts) {
    var b = el("button", {
      type: "button",
      class: "wc-tile",
      role: opts.mode === "multi" ? "checkbox" : "radio",
      "aria-checked": opts.checked ? "true" : "false",
      "data-id": opts.id,
      "data-answer-id": opts.focusId || opts.id
    });
    if (opts.disabled) {
      b.setAttribute("aria-disabled", "true");
      if (opts.disabledHint) b.setAttribute("title", opts.disabledHint);
    }
    var body = el("span", { class: "wc-tile__body" }, [
      el("span", { class: "wc-tile__label", text: opts.label })
    ]);
    if (opts.hint) body.appendChild(el("span", { class: "wc-tile__hint", text: opts.hint }));
    if (opts.field) body.appendChild(el("span", { class: "wc-tile__field", text: opts.field }));
    if (opts.value) body.appendChild(el("span", { class: "wc-tile__value", text: opts.value }));
    b.innerHTML = glyph(opts.mode, opts.checked);
    b.appendChild(body);
    if (opts.extra) b.appendChild(opts.extra);
    b.addEventListener("click", function () {
      if (opts.disabled) {
        announce(opts.disabledHint || "Diese Auswahl ist derzeit nicht möglich.", true);
        return;
      }
      opts.onToggle();
    });
    return b;
  }

  function sourceButton(sourceId) {
    var b = el("button", {
      type: "button", class: "wc-source", "data-source": sourceId,
      "aria-haspopup": "dialog"
    }, ["Quelle"]);
    b.addEventListener("click", function () {
      openSource(sourceId, b);
    });
    return b;
  }

  /* --------------------------------------------------------- Fragenmodell */

  function goalsFor(topicId) {
    return M.goals[topicId] || M.goals._generisch;
  }

  function topPriority() {
    var top = state.answers.q_top3 || state.answers.q_prioritaeten || [];
    return top.length ? byId(M.topics, top[0]) : null;
  }

  function currentIndicators() {
    if (state.district && state.district !== "bundesweit" && state.district.indicators) return state.district.indicators;
    return M.national || [];
  }

  function hasDistrictContext() {
    return Boolean(state.district && state.district !== "bundesweit" && state.district.indicators);
  }

  function nationalIndicator(id) {
    return byId(M.national || [], id);
  }

  function indicatorContextText(indicator) {
    var national = nationalIndicator(indicator.id);
    if (!hasDistrictContext()) return "Bundesebene: " + (indicatorValue(national) || "Datenlücke");
    return "Bundesebene: " + (indicatorValue(national) || "Datenlücke") +
      " · Wahlkreis " + state.district.nr + ": " + (indicatorValue(indicator) || "Datenlücke");
  }

  function currentIndicatorById(id) {
    return byId(currentIndicators(), id);
  }

  function selectedGoalLabel() {
    var topic = topPriority();
    var goal = byId(topic ? goalsFor(topic.id) : M.goals._generisch, state.answers.q_zustandsziel);
    return goal ? goal.label : (state.answers.q_zustandsziel || "der gewählte Zustand");
  }

  function indicatorValue(indicator) {
    if (!indicator || indicator.value === null || indicator.value === undefined || indicator.value === "") return null;
    var number = Number(indicator.value);
    var value = Number.isFinite(number)
      ? number.toLocaleString("de-DE", { maximumFractionDigits: 2 })
      : String(indicator.value);
    return value + (indicator.suffix || "");
  }

  function questions() {
    var list = [];
    var sel = state.answers.q_prioritaeten || [];

    list.push({
      id: "q_prioritaeten", nr: 1, short: "Prioritäten", eyebrow: "Wirkungsprioritäten",
      title: "Welche Veränderung soll Bundespolitik für Menschen und Orte zuerst ermöglichen?",
      help: "Wählen Sie bis zu fünf Themen. Der Wahlkreis ergänzt später die Rückmeldung vor Ort; Bundes- und Wahlkreisebene bleiben sichtbar. Er begrenzt die bundespolitische Frage nicht.",
      type: "multi", options: M.topics, max: 5, min: 1, showField: true,
      error: "Bitte wählen Sie mindestens ein Thema.",
      why: "Wirkung entsteht selten überall gleichzeitig. Die Themenauswahl bestimmt, welche Wirkungszusammenhänge geprüft werden, und mit welchen Daten Ihres Wahlkreises sie abgeglichen werden. Sie legt keine Rangfolge zwischen politischen Zielen fest."
    });

    /* Die Priorisierung ist immer Teil des Fragenkatalogs, auch bei nur einer
       Auswahl. Sonst waechst die Gesamtzahl der Fragen waehrend der Befragung
       von 9 auf 10, und ein Fortschritt, der sich beim Antworten verlaengert,
       widerspricht der Zusage, dass nichts ueberrascht. Bei genau einer Auswahl
       wird der Screen zur Bestaetigung mit Angebot, weitere aufzunehmen. */
    list.push({
      id: "q_top3", nr: 0, short: "Priorisierung", eyebrow: "Priorisierung",
      title: sel.length > 1
        ? "Welche drei Themen haben für Ihre bundespolitische Arbeit den grössten Stellenwert?"
        : "Möchten Sie weitere Schwerpunkte aufnehmen?",
      help: sel.length > 1
        ? "Die Reihenfolge steuert, welchen Wirkungszusammenhang wir zuerst prüfen. Sie ist keine Bewertung der übrigen Themen."
        : "Sie haben ein Thema gewählt. Sie können bis zu drei Schwerpunkte in eine Reihenfolge bringen oder mit diesem einen fortfahren.",
      type: "rank", max: 3, min: 1,
      error: "Bitte nehmen Sie mindestens ein Thema in die Reihenfolge auf.",
      why: "Ressourcen, Zeit und politische Aufmerksamkeit sind begrenzt. Die Reihenfolge entscheidet, welcher Wirkungszusammenhang zuerst auf Engpässe geprüft wird, nicht welches Ziel wichtiger ist."
    });

    var top = topPriority();
    list.push({
      id: "q_zustandsziel", nr: 0, short: "Veränderung", eyebrow: "Gewünschte Veränderung",
      title: top ? "Welcher Zustand soll sich bei „" + top.label + "“ konkret verbessern?"
                 : "Welcher Zustand soll sich konkret verbessern?",
      help: "Gemeint ist der Zustand, nicht die Massnahme.",
      type: "single", options: top ? goalsFor(top.id) : M.goals._generisch, min: 1,
      error: "Bitte wählen Sie einen Zustand.",
      why: "Massnahmen und eingesetzte Mittel zeigen noch nicht automatisch, ob sich ein Zustand tatsächlich verbessert hat. Deshalb unterscheiden wir zwischen Umsetzung und Wirkung. Ein Programm kann vollständig umgesetzt sein, ohne dass sich der Zustand verändert, den es verbessern sollte."
    });

    list.push({
      id: "q_engpass", nr: 0, short: "Engpass", eyebrow: "Engpass",
      title: "Woran hängt die Umsetzung aus Ihrer Sicht derzeit am meisten?",
      help: "Wählen Sie bis zu zwei.",
      type: "multi", options: M.bottlenecks, max: 2, min: 1,
      error: "Bitte wählen Sie mindestens einen Engpass.",
      why: "In der Wirkungsökonomie begrenzt der schwächste zentrale Faktor das Gesamtergebnis. Zusätzliche Mittel an einer Stelle erhöhen die Wirkung nur unterproportional, solange an anderer Stelle etwas blockiert. Ihre Angabe bestimmt, welcher Prüfpfad sichtbar wird."
    });

    list.push({
      id: "q_horizont", nr: 0, short: "Horizont", eyebrow: "Wirkungshorizont",
      title: "In welchem Zeitraum soll die Veränderung spürbar werden?",
      help: "Der Zeitraum beeinflusst, welche Handlungspfade überhaupt in Frage kommen.",
      type: "axis", options: M.horizons, min: 1,
      error: "Bitte wählen Sie einen Zeitraum.",
      why: "Manche Wirkungen treten schnell ein und verpuffen, andere brauchen Jahre und halten. Der gewählte Horizont entscheidet, welche Handlungspfade sinnvoll vergleichbar sind, und welche Indikatoren überhaupt etwas anzeigen können."
    });

    list.push({
      id: "q_bundesrolle", nr: 0, short: "Bundesrolle", eyebrow: "Bundespolitik",
      title: "Welche Rolle des Bundes ist für diese Veränderung vorrangig?",
      help: "Wählen Sie bis zu zwei Rollen. Die Auswahl steuert, welche direkten und indirekten Folgen im Wirkungscheck sichtbar werden.",
      type: "multi", options: M.federalRoles, max: 2, min: 1,
      error: "Bitte wählen Sie mindestens eine bundespolitische Rolle.",
      why: "Der Bundestag kann Rahmen, Anreize, Vollzug und Rückkopplung unterschiedlich gestalten. Eine sichtbare Rolle verhindert, dass der Wirkpfad nur allgemein bleibt."
    });

    list.push({
      id: "q_rahmen", nr: 0, short: "Rahmen", eyebrow: "Rahmenbedingungen",
      title: "Wie wichtig sind Ihnen die folgenden Rahmenbedingungen?",
      help: "Diese Gewichte können Sie später im Report probeweise verschieben und sehen, ob sich das Ergebnis ändert.",
      type: "likert", rows: M.frameRows, scale: M.frameScale, min: 1,
      why: "Handlungspfade unterscheiden sich nicht nur in der Wirkung, sondern in dem, was sie voraussetzen und was sie an anderer Stelle kosten. Ihre Gewichtung macht diese Abwägung explizit, statt sie im Regelwerk zu verstecken."
    });

    list.push({
      id: "q_rote_linie", nr: 0, short: "Rote Linien", eyebrow: "Rote Linien · optional",
      title: "Gibt es etwas, das sich dabei nicht verschlechtern darf?",
      help: "Optional. Mehrfachauswahl möglich.",
      type: "multi", options: M.redLines, min: 0, optional: true,
      why: "Positive Wirkung an einer Stelle kann negative Wirkung an anderer Stelle erzeugen. In der Wirkungsökonomie darf eine schwere negative Wirkung nicht durch positive Werte anderswo verdeckt werden. Ihre Angabe setzt Handlungspfade nach hinten, die das genannte Feld belasten würden."
    });

    list.push({
      id: "q_wahlkreis_kontext", nr: 0, short: "Rückkopplung", eyebrow: state.district && state.district !== "bundesweit" ? "Wahlkreis-Rückkopplung" : "Bundesweite Rückkopplung",
      title: "Welcher Befund soll bei der bundespolitischen Prüfung bundesweit und im Wahlkreis sichtbar bleiben?",
      adaptive: state.district && state.district !== "bundesweit"
        ? "Der Report zeigt den Befund auf Bundesebene und für den Wahlkreis " + state.district.nr + " " + state.district.name + " nebeneinander."
        : "Die Daten zeigen Deutschland insgesamt und ersetzen keine regionale Verteilungsanalyse.",
      help: "Die Werte stammen aus amtlichen Quellen. Sie sind Ausgangsdaten, kein Wirkungsnachweis. Zeitstand, Ebene und räumlicher Hinweis stehen bei jeder Quelle.",
      type: "indicators", options: currentIndicators(), min: 0, optional: true,
      why: "Bundesebene und Wahlkreis bilden zwei Rückkopplungsebenen für bundespolitische Entscheidungen. Ein einzelner Wert beweist keine Wirkung und wird deshalb nicht als Rangliste oder Personenurteil verwendet."
    });

    list.push({
      id: "q_freitext", nr: 0, short: "Ergänzung", eyebrow: "Ergänzung · optional",
      title: "Welcher Hinweis aus Wahlkreis oder Fachpraxis sollte den Wirkungscheck ergänzen?",
      help: "Optional. Höchstens 600 Zeichen. Bitte keine personenbezogenen Angaben Dritter.",
      type: "text", min: 0, optional: true,
      why: "Ihr Hinweis wird nicht automatisch ausgewertet und bleibt in dieser Veröffentlichung lokal in Ihrem Report."
    });

    list.forEach(function (q, i) { q.nr = i + 1; });
    return list;
  }

  function isAnswered(q) {
    var v = state.answers[q.id];
    if (q.optional) return true;
    if (q.type === "likert") {
      if (!v) return false;
      return q.rows.every(function (r) { return v[r.id]; });
    }
    if (Array.isArray(v)) return v.length >= (q.min || 1);
    return v !== undefined && v !== null && v !== "";
  }

  function estimate(remaining) {
    if (remaining >= 8) return "noch etwa 4 Minuten";
    if (remaining >= 5) return "noch etwa 3 Minuten";
    if (remaining >= 3) return "noch etwa 2 Minuten";
    if (remaining >= 1) return "noch etwa 1 Minute";
    return "letzter Schritt";
  }

  /* --------------------------------------------------------------- Router */

  function show(screen) {
    ui.screen = screen;
    $$(".wc-screen").forEach(function (s) {
      s.classList.toggle("is-active", s.id === "screen-" + screen);
    });
    window.scrollTo(0, 0);
  }

  function focusHeading(sel) {
    var h = $(sel);
    if (h) {
      h.setAttribute("tabindex", "-1");
      h.focus();
    }
  }

  /* -------------------------------------------------------------- Landing */

  function renderLanding() {
    var box = $("#landing-resume");
    box.innerHTML = "";
    var hasAnswers = Object.keys(state.answers).length > 0;
    if (hasAnswers) {
      box.appendChild(el("div", { class: "wc-card" }, [
        el("h2", { class: "wc-h3 wc-card__title", text: "Sie haben eine begonnene Befragung" }),
        el("p", { class: "wc-muted", text: "Ihre Antworten liegen in diesem Browser." }),
        (function () {
          var row = el("div", { class: "wc-btn-row" });
          var go = el("button", { type: "button", class: "wc-btn wc-btn--primary", text: "Befragung fortsetzen" });
          go.addEventListener("click", function () { openSurvey(state.step || 0); });
          var again = el("button", { type: "button", class: "wc-btn wc-btn--secondary", text: "Neu beginnen" });
          again.addEventListener("click", function () {
            wipe(); save(); renderLanding(); announce("Neue Befragung begonnen.");
            show("district"); renderDistrict(); focusHeading("#district-h1");
          });
          row.appendChild(go); row.appendChild(again);
          return row;
        })()
      ]));
    }
  }

  /* ------------------------------------------------------- Wahlkreissuche */

  var combo = { items: [], active: -1, open: false };

  function normalize(s) {
    return (s || "").toString().toLowerCase()
      .replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ß/g, "ss");
  }

  function searchDistricts(term) {
    var t = normalize(term.trim());
    if (t.length < 2) return [];
    var exact = [], starts = [], contains = [];
    M.districts.forEach(function (d) {
      var name = normalize(d.name), nr = d.nr, plzHit = d.plz.some(function (p) { return p.indexOf(t) === 0; });
      if (nr === t || (plzHit && t.length >= 4)) exact.push(d);
      else if (name.indexOf(t) === 0 || nr.indexOf(t) === 0) starts.push(d);
      else if (name.indexOf(t) > -1 || normalize(d.land).indexOf(t) > -1) contains.push(d);
    });
    return exact.concat(starts, contains);
  }

  function highlight(text, term) {
    var t = term.trim();
    if (t.length < 2) return document.createTextNode(text);
    var i = normalize(text).indexOf(normalize(t));
    if (i < 0) return document.createTextNode(text);
    var frag = document.createDocumentFragment();
    frag.appendChild(document.createTextNode(text.slice(0, i)));
    frag.appendChild(el("mark", { text: text.slice(i, i + t.length) }));
    frag.appendChild(document.createTextNode(text.slice(i + t.length)));
    return frag;
  }

  function renderDistrict() {
    var wrap = $("#district-body");
    wrap.innerHTML = "";

    if (state.district) {
      var d = state.district;
      var isNational = d === "bundesweit";
      var card = el("div", { class: "wc-card" }, [
        el("p", { class: "wc-eyebrow", text: isNational ? "Gewählter Bezug" : "Gewählter Wahlkreis" }),
        el("h2", { class: "wc-h3", text: isNational ? "Überwiegend landes- oder bundesweite Arbeit" : d.nr + " · " + d.name }),
        el("p", { class: "wc-muted", text: isNational ? "Ihr Report nutzt Bundesdaten und bundesweite Wirkungshebel." : d.land + " · " + d.context })
      ]);
      var change = el("button", { type: "button", class: "wc-btn wc-btn--secondary", text: "Ändern" });
      change.addEventListener("click", function () {
        state.district = null; save(); renderDistrict();
        var inp = $("#district-input"); if (inp) inp.focus();
      });
      card.appendChild(el("div", { class: "wc-btn-row" }, [change]));
      wrap.appendChild(card);
      $("#district-next").setAttribute("aria-disabled", "false");
      return;
    }

    $("#district-next").setAttribute("aria-disabled", "true");

    var field = el("div", { class: "wc-field" }, [
      el("label", { class: "wc-label", for: "district-input", text: "Wahlkreis suchen" }),
      el("p", { class: "wc-meta", id: "district-hint", text: "Suche nach Wahlkreisname, Nummer, Ort oder Postleitzahl" })
    ]);
    var input = el("input", {
      class: "wc-input", id: "district-input", type: "text", role: "combobox",
      autocomplete: "off", "aria-expanded": "false", "aria-controls": "district-list",
      "aria-autocomplete": "list", "aria-describedby": "district-hint",
      placeholder: "Zum Beispiel Mannheim, 275 oder 68159"
    });
    var listbox = el("ul", { class: "wc-combo__list", id: "district-list", role: "listbox", hidden: "" });
    var status = el("p", { class: "wc-meta", id: "district-status", "aria-live": "polite" });

    var comboWrap = el("div", { class: "wc-combo" }, [input, listbox]);
    field.appendChild(comboWrap);
    field.appendChild(status);

    var chips = el("ul", { class: "wc-chips" });
    ["Mannheim", "275", "68159"].forEach(function (ex) {
      var li = el("li");
      var b = el("button", { type: "button", class: "wc-chip", text: ex });
      b.addEventListener("click", function () {
        input.value = ex; input.focus(); update();
      });
      li.appendChild(b); chips.appendChild(li);
    });
    field.appendChild(el("p", { class: "wc-meta", text: "Beispiele:" }));
    field.appendChild(chips);
    wrap.appendChild(field);

    function close() {
      combo.open = false; combo.active = -1;
      listbox.hidden = true; input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
    }

    function choose(d) {
      state.district = d; save(); renderDistrict();
      announce("Wahlkreis " + d.nr + " " + d.name + " gewählt.");
      var next = $("#district-next"); if (next) next.focus();
    }

    function update() {
      var term = input.value;
      if (term.trim().length < 2) {
        combo.items = [];
        status.textContent = term.trim().length ? "Bitte geben Sie mindestens zwei Zeichen ein." : "";
        close();
        return;
      }
      combo.items = searchDistricts(term);
      listbox.innerHTML = "";
      if (!combo.items.length) {
        status.textContent = "Kein Wahlkreis gefunden. Prüfen Sie die Schreibweise, oder fahren Sie ohne Wahlkreisbezug fort.";
        close();
        return;
      }
      status.textContent = combo.items.length === 1 ? "1 Treffer" : combo.items.length + " Treffer";
      combo.items.forEach(function (d, i) {
        var opt = el("li", {
          class: "wc-combo__opt", role: "option", id: "district-opt-" + i, "aria-selected": "false"
        });
        var strong = el("strong");
        strong.appendChild(document.createTextNode(d.nr + " · "));
        strong.appendChild(highlight(d.name, input.value));
        opt.appendChild(strong);
        opt.appendChild(el("span", { text: d.land + " · " + d.context }));
        opt.addEventListener("mousedown", function (ev) { ev.preventDefault(); choose(d); });
        listbox.appendChild(opt);
      });
      listbox.hidden = false;
      combo.open = true;
      input.setAttribute("aria-expanded", "true");
    }

    function setActive(i) {
      var opts = $$(".wc-combo__opt", listbox);
      if (!opts.length) return;
      if (combo.active > -1 && opts[combo.active]) opts[combo.active].setAttribute("aria-selected", "false");
      combo.active = Math.max(0, Math.min(i, opts.length - 1));
      opts[combo.active].setAttribute("aria-selected", "true");
      input.setAttribute("aria-activedescendant", opts[combo.active].id);
      opts[combo.active].scrollIntoView({ block: "nearest" });
    }

    input.addEventListener("input", update);
    input.addEventListener("keydown", function (ev) {
      if (ev.key === "ArrowDown") { ev.preventDefault(); if (!combo.open) update(); setActive(combo.active + 1); }
      else if (ev.key === "ArrowUp") { ev.preventDefault(); setActive(combo.active - 1); }
      else if (ev.key === "Home" && combo.open) { ev.preventDefault(); setActive(0); }
      else if (ev.key === "End" && combo.open) { ev.preventDefault(); setActive(combo.items.length - 1); }
      else if (ev.key === "Enter") {
        if (combo.open && combo.active > -1) { ev.preventDefault(); choose(combo.items[combo.active]); }
      } else if (ev.key === "Escape") {
        if (combo.open) close(); else input.value = "";
      } else if (ev.key === "Tab") {
        close();
      }
    });

    var alt = tile({
      id: "bundesweit", mode: "single", checked: false,
      label: "Überwiegend landes- oder bundesweite Arbeit",
      hint: "Dann entfällt der Wahlkreisbezug. Ihr Report nutzt Bundesdaten und bundesweite Wirkungshebel.",
      onToggle: function () {
        state.district = "bundesweit"; save(); renderDistrict();
        announce("Bundesweite Betrachtung gewählt.");
        var next = $("#district-next"); if (next) next.focus();
      }
    });
    var altGroup = el("div", { role: "radiogroup", "aria-label": "Alternative ohne Wahlkreisbezug", class: "wc-options" }, [alt]);
    wrap.appendChild(el("p", { class: "wc-subhead", text: "Oder ohne Wahlkreisbezug" }));
    wrap.appendChild(altGroup);
    wrap.appendChild(el("p", { class: "wc-meta", style: "margin-top:1rem",
      text: "Die Wahlkreisangabe bleibt in Ihrem Browser. Dieser Fragebogen überträgt keine Angaben." }));
  }

  /* --------------------------------------------------------------- Survey */

  function openSurvey(step) {
    var qs = questions();
    state.step = Math.max(0, Math.min(step || 0, qs.length - 1));
    save();
    show("survey");
    renderQuestion();
  }

  function renderProgress(qs, q) {
    var bar = $("#survey-progress");
    bar.innerHTML = "";
    var segs = el("ul", { class: "wc-progress__segments" });
    qs.forEach(function (item, i) {
      var done = isAnswered(item) && i !== state.step;
      var st = i === state.step ? "current" : (done ? "done" : "todo");
      var li = el("li");
      var b = el("button", {
        type: "button", class: "wc-progress__seg", "data-state": st,
        "aria-label": "Zu Frage " + (i + 1) + ": " + item.short + ". " +
          (st === "current" ? "Aktuelle Frage" : (done ? "Beantwortet" : "Noch nicht beantwortet"))
      }, [el("span", { "aria-hidden": "true" })]);
      if (!done && i !== state.step) b.setAttribute("aria-disabled", "true");
      b.addEventListener("click", function () {
        if (b.getAttribute("aria-disabled") === "true") return;
        openSurvey(i);
      });
      li.appendChild(b);
      segs.appendChild(li);
    });
    bar.appendChild(segs);
    var remaining = qs.length - state.step - 1;
    bar.appendChild(el("p", {
      class: "wc-progress__label",
      text: "Frage " + q.nr + " von " + qs.length + " · " + estimate(remaining)
    }));

    /* Unter 48rem fehlt der Vertrauens-Auslöser im Kopf. Im Survey muss er
       trotzdem ohne Scrollen erreichbar sein (WCAG 3.2.6, konsistente Hilfe). */
    var aside = el("div", { class: "wc-progress__aside" });
    var trust = el("button", {
      type: "button", class: "wc-btn wc-btn--link wc-btn--sm", "aria-haspopup": "dialog",
      text: "Vertrauen & Datenschutz"
    });
    trust.addEventListener("click", function () { openTrust(trust); });
    aside.appendChild(trust);
    bar.appendChild(aside);
  }

  function buildImpactPreview(q) {
    if (["q_engpass", "q_bundesrolle", "q_rote_linie"].indexOf(q.id) < 0) return null;
    var analysis = window.WC_RULE_ENGINE.derive(state.answers, {
      hasDistrictContext: hasDistrictContext(),
      districtName: hasDistrictContext() ? state.district.nr + " " + state.district.name : null
    });
    if (!analysis) return null;

    var preview = el("aside", { class: "wc-card", "aria-live": "polite", style: "margin-top:1.25rem" });
    preview.appendChild(el("p", { class: "wc-eyebrow", text: "Unmittelbare Wirkungsvorschau" }));
    preview.appendChild(el("h2", { class: "wc-h3", text: "Was Ihre Auswahl jetzt im Wirkpfad verändert" }));
    if (analysis.federal.length) {
      preview.appendChild(el("p", { text: analysis.federal[analysis.federal.length - 1] }));
    } else {
      preview.appendChild(el("p", { class: "wc-muted", text: "Die direkte bundespolitische Folge wird sichtbar, sobald Sie eine Bundesrolle auswählen." }));
    }
    if (analysis.constraints.length) {
      preview.appendChild(el("p", { class: "wc-meta", text: "Begrenzender Faktor: " + analysis.constraints[analysis.constraints.length - 1] }));
    }
    if (analysis.risks.length) {
      preview.appendChild(el("p", { class: "wc-meta", text: "Zu prüfende Grenze: " + analysis.risks[analysis.risks.length - 1] }));
    }
    preview.appendChild(el("p", { class: "wc-meta", text: "Modellannahme: Die vollständige Wirkungskette mit Bundes- und Wahlkreisebene erscheint im Report." }));
    return preview;
  }

  function renderQuestion(options) {
    options = options || {};
    var qs = questions();
    var q = qs[state.step];
    if (!q) return;

    renderProgress(qs, q);

    var main = $("#survey-body");
    main.innerHTML = "";
    main.appendChild(el("p", { class: "wc-eyebrow", text: q.eyebrow }));
    main.appendChild(el("h1", { class: "wc-question", id: "survey-h1", "data-scroll-target": "" , text: q.title }));
    if (q.adaptive) main.appendChild(el("p", { class: "wc-note wc-note--quiet", text: q.adaptive }));
    if (q.help) main.appendChild(el("p", { class: "wc-body wc-muted", text: q.help }));

    var errorBox = el("p", { class: "wc-fielderror", id: "survey-error", role: "status" });
    var group = buildAnswerUI(q, errorBox);
    main.appendChild(group);
    var impactPreview = buildImpactPreview(q);
    if (impactPreview) main.appendChild(impactPreview);
    main.appendChild(errorBox);

    if (isAnswered(q) && q.why) {
      var det = el("details", { class: "wc-why" });
      if (state.whyOpen) det.setAttribute("open", "");
      det.appendChild(el("summary", { text: "Warum fragen wir das?" }));
      det.appendChild(el("div", { class: "wc-why__body" }, [el("p", { text: q.why })]));
      det.addEventListener("toggle", function () { state.whyOpen = det.open; save(); });
      main.appendChild(det);
    }

    var foot = $("#survey-foot");
    foot.innerHTML = "";
    var back = el("button", { type: "button", class: "wc-btn wc-btn--secondary", text: "Zurück" });
    back.addEventListener("click", function () {
      if (state.step === 0) { show("district"); renderDistrict(); focusHeading("#district-h1"); }
      else openSurvey(state.step - 1);
    });
    foot.appendChild(back);

    var right = el("div", { class: "wc-btn-row" });
    if (q.optional && !isAnswered(q)) {
      var skip = el("button", { type: "button", class: "wc-btn wc-btn--link", text: "Überspringen" });
      skip.addEventListener("click", function () { advance(qs); });
      right.appendChild(skip);
    }
    var next = el("button", {
      type: "button", class: "wc-btn wc-btn--primary",
      text: state.step === qs.length - 1 ? "Angaben prüfen" : "Weiter",
      "aria-disabled": isAnswered(q) ? "false" : "true"
    });
    next.addEventListener("click", function () {
      if (!isAnswered(q)) {
        errorBox.textContent = q.error || "Bitte beantworten Sie diese Frage, um fortzufahren.";
        announce(q.error || "Bitte beantworten Sie diese Frage, um fortzufahren.", true);
        var first = $("[role='radio'],[role='checkbox'],textarea", group);
        if (first) first.focus();
        return;
      }
      advance(qs);
    });
    right.appendChild(next);
    foot.appendChild(right);

    if (options.preservePosition) {
      /* Eine Auswahl darf weder den Fokus noch die Leseposition nach oben
         ziehen. Der erneuerte Button erhält Fokus ohne Scrollen; danach wird
         exakt die vorherige Position wiederhergestellt. */
      window.requestAnimationFrame(function () {
        if (options.focusId) {
          var target = $("[data-answer-id='" + options.focusId + "']");
          if (target) target.focus({ preventScroll: true });
        }
        window.scrollTo({ top: options.scrollTop || 0, left: 0, behavior: "auto" });
      });
    } else {
      focusHeading("#survey-h1");
      announce("Frage " + q.nr + " von " + qs.length);
    }
  }

  function advance(qs) {
    if (state.step >= qs.length - 1) { openReview(); return; }
    openSurvey(state.step + 1);
  }

  function refresh(options) {
    options = options || {};
    var scrollTop = window.scrollY;
    save();
    renderQuestion({ preservePosition: true, focusId: options.focusId, scrollTop: scrollTop });
  }

  function buildAnswerUI(q, errorBox) {
    var wrap;

    if (q.type === "multi") {
      var cur = state.answers[q.id] || [];
      wrap = el("div", { class: "wc-options" + (q.options.length > 8 ? " wc-options--two" : ""), role: "group", "aria-labelledby": "survey-h1" });
      if (q.max) {
        var counter = el("p", { class: "wc-counter", "aria-live": "polite",
          text: cur.length + " von " + q.max + " gewählt" });
        wrap.parentNode; // Zaehler wird vor der Gruppe eingehaengt
        var holder = el("div");
        holder.appendChild(counter);
        holder.appendChild(wrap);
        q._holder = holder;
      }
      q.options.forEach(function (o) {
        var checked = cur.indexOf(o.id) > -1;
        var atMax = q.max && cur.length >= q.max && !checked;
        wrap.appendChild(tile({
          id: o.id, mode: "multi", checked: checked, label: o.label, hint: o.hint,
          field: q.showField ? o.field : null,
          disabled: atMax,
          disabledHint: "Höchstens " + q.max + " auswählbar. Entfernen Sie eine Auswahl, um eine andere zu treffen.",
          onToggle: function () {
            var list = (state.answers[q.id] || []).slice();
            var i = list.indexOf(o.id);
            if (i > -1) list.splice(i, 1); else list.push(o.id);
            state.answers[q.id] = list;
            if (q.id === "q_prioritaeten") {
              /* Reihenfolge in Auswahlreihenfolge vorbelegen, damit die
                 Priorisierung nicht als Pflichtarbeit erscheint. Sie bleibt
                 vollstaendig aenderbar. */
              var keep = (state.answers.q_top3 || []).filter(function (id) { return list.indexOf(id) > -1; });
              list.forEach(function (id) {
                if (keep.indexOf(id) < 0 && keep.length < 3) keep.push(id);
              });
              state.answers.q_top3 = keep;
            }
            errorBox.textContent = "";
            refresh({ focusId: o.id });
          }
        }));
      });
      return q._holder || wrap;
    }

    if (q.type === "single" || q.type === "axis" || q.type === "indicators") {
      var val = state.answers[q.id];
      wrap = el("div", {
        class: q.type === "axis" ? "wc-axis" : "wc-options",
        role: "radiogroup", "aria-labelledby": "survey-h1"
      });
      q.options.forEach(function (o) {
        var extra = null, hint = o.hint, value = null, sourceMeta = null;
        if (q.type === "indicators") {
          if (o.value) {
            value = indicatorValue(o);
            hint = "Beobachtungszeitpunkt: " + o.observation + ". " + o.territorialNote;
          } else {
            hint = o.gapReason || "Für diesen Indikator liegen keine Daten vor.";
          }
        }
        var t = tile({
          id: o.id, mode: "single", checked: val === o.id, label: o.label, hint: hint, value: value,
          onToggle: function () {
            state.answers[q.id] = (val === o.id && q.optional) ? null : o.id;
            errorBox.textContent = "";
            /* Eine Einzelauswahl schließt die Frage kontrolliert ab. Die
               Mehrfachauswahlen behalten dagegen die Position auf der Seite. */
            if (q.type === "single" || q.type === "axis" || q.type === "indicators") advance(questions());
            else refresh({ focusId: o.id });
          }
        });
        if (q.type === "indicators") {
          sourceMeta = el("div", { class: "wc-meta", style: "margin:-.35rem .5rem .75rem 3.25rem;display:flex;flex-wrap:wrap;gap:.75rem;align-items:center" });
          sourceMeta.appendChild(evidenceMark(o.evidence));
          var sb = sourceButton(o.source);
          sourceMeta.appendChild(sb);
        }
        wrap.appendChild(t);
        if (sourceMeta) wrap.appendChild(sourceMeta);
      });
      return wrap;
    }

    if (q.type === "rank") {
      return buildRanker(q, errorBox);
    }

    if (q.type === "likert") {
      return buildLikert(q, errorBox);
    }

    if (q.type === "text") {
      var holder = el("div", { class: "wc-field" });
      holder.appendChild(el("label", { class: "wc-label", for: "q-text", text: "Ihre Ergänzung" }));
      holder.appendChild(el("p", { class: "wc-meta", id: "q-text-note", text: "Bitte keine personenbezogenen Angaben Dritter." }));
      var ta = el("textarea", { class: "wc-textarea", id: "q-text", rows: "6", "aria-describedby": "q-text-note q-text-count" });
      ta.value = state.answers[q.id] || "";
      var count = el("p", { class: "wc-meta", id: "q-text-count", "aria-live": "polite" });
      function upd() {
        var n = ta.value.length;
        count.textContent = n >= 500 ? n + " von 600 Zeichen" : "";
        errorBox.textContent = n > 600 ? "Der Text ist " + n + " Zeichen lang. Bitte kürzen Sie ihn auf 600 Zeichen. Ihr Text bleibt erhalten." : "";
      }
      ta.addEventListener("input", function () { state.answers[q.id] = ta.value; upd(); save(); });
      upd();
      holder.appendChild(ta);
      holder.appendChild(count);
      holder.appendChild(el("p", { class: "wc-meta",
        text: "Ihr Hinweis wird nicht automatisch ausgewertet und bleibt lokal in Ihrem Report." }));
      return holder;
    }

    return el("div");
  }

  function buildRanker(q, errorBox) {
    var pool = (state.answers.q_prioritaeten || []).map(function (id) { return byId(M.topics, id); }).filter(Boolean);
    var ranked = (state.answers.q_top3 || []).slice();
    var holder = el("div");

    holder.appendChild(el("p", { class: "wc-subhead", text: "Ihre Reihenfolge" }));
    var list = el("ol", { class: "wc-rank" });
    if (!ranked.length) {
      list.appendChild(el("li", { style: "display:block" }, [
        el("span", { class: "wc-muted", text: "Noch nichts aufgenommen. Nehmen Sie unten bis zu drei Themen auf." })
      ]));
    }
    ranked.forEach(function (id, i) {
      var topic = byId(M.topics, id);
      if (!topic) return;
      var li = el("li");
      li.appendChild(el("span", { class: "wc-rank__pos", "aria-hidden": "true", text: (i + 1) + "." }));
      li.appendChild(el("span", { class: "wc-rank__label", text: topic.label }));
      var acts = el("div", { class: "wc-rank__actions" });

      function move(delta) {
        var j = i + delta;
        if (j < 0 || j >= ranked.length) return;
        var tmp = ranked[i]; ranked[i] = ranked[j]; ranked[j] = tmp;
        state.answers.q_top3 = ranked;
        announce(topic.label + " ist jetzt Position " + (j + 1) + " von " + ranked.length + ".", true);
        refresh();
      }

      var up = el("button", { type: "button", class: "wc-iconbtn",
        "aria-label": "„" + topic.label + "“ nach oben, aktuell Position " + (i + 1) + " von " + ranked.length,
        html: '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' });
      if (i === 0) up.setAttribute("aria-disabled", "true");
      up.addEventListener("click", function () { if (up.getAttribute("aria-disabled") !== "true") move(-1); });

      var down = el("button", { type: "button", class: "wc-iconbtn",
        "aria-label": "„" + topic.label + "“ nach unten, aktuell Position " + (i + 1) + " von " + ranked.length,
        html: '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 5v14M5 12l7 7 7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' });
      if (i === ranked.length - 1) down.setAttribute("aria-disabled", "true");
      down.addEventListener("click", function () { if (down.getAttribute("aria-disabled") !== "true") move(1); });

      var rm = el("button", { type: "button", class: "wc-btn wc-btn--link wc-btn--sm",
        text: "Entfernen", "aria-label": "„" + topic.label + "“ aus der Reihenfolge entfernen" });
      rm.addEventListener("click", function () {
        ranked.splice(i, 1); state.answers.q_top3 = ranked;
        announce(topic.label + " aus der Reihenfolge entfernt.", true);
        refresh();
      });

      li.addEventListener("keydown", function (ev) {
        if (!ev.altKey) return;
        if (ev.key === "ArrowUp") { ev.preventDefault(); move(-1); }
        if (ev.key === "ArrowDown") { ev.preventDefault(); move(1); }
      });

      acts.appendChild(up); acts.appendChild(down); acts.appendChild(rm);
      li.appendChild(acts);
      list.appendChild(li);
    });
    holder.appendChild(list);

    var rest = pool.filter(function (t) { return ranked.indexOf(t.id) < 0; });
    if (rest.length) {
      holder.appendChild(el("p", { class: "wc-subhead", text: "Nicht priorisiert" }));
      var restList = el("ul", { class: "wc-rank" });
      rest.forEach(function (topic) {
        var li = el("li");
        li.appendChild(el("span", { class: "wc-rank__label", text: topic.label }));
        var add = el("button", { type: "button", class: "wc-btn wc-btn--quiet wc-btn--sm",
          text: "Aufnehmen", "aria-label": "„" + topic.label + "“ in die Reihenfolge aufnehmen" });
        if (ranked.length >= q.max) {
          add.setAttribute("aria-disabled", "true");
          add.setAttribute("title", "Höchstens drei Themen. Entfernen Sie eines, um ein anderes aufzunehmen.");
        }
        add.addEventListener("click", function () {
          if (add.getAttribute("aria-disabled") === "true") {
            announce("Höchstens drei Themen. Entfernen Sie eines, um ein anderes aufzunehmen.", true);
            return;
          }
          ranked.push(topic.id); state.answers.q_top3 = ranked;
          announce(topic.label + " ist jetzt Position " + ranked.length + " von " + ranked.length + ".", true);
          errorBox.textContent = "";
          refresh();
        });
        li.appendChild(add);
        restList.appendChild(li);
      });
      holder.appendChild(restList);
    }
    return holder;
  }

  function buildLikert(q, errorBox) {
    var val = state.answers[q.id] || {};
    var fs = el("fieldset", { class: "wc-likert" });
    fs.appendChild(el("legend", { class: "wc-sr", text: q.title }));
    q.rows.forEach(function (row) {
      var block = el("div", { class: "wc-likert__row", role: "radiogroup", "aria-labelledby": "lk-" + row.id });
      block.appendChild(el("span", { class: "wc-likert__label", id: "lk-" + row.id, text: row.label }));
      if (row.hint) block.appendChild(el("p", { class: "wc-meta", text: row.hint }));
      var scale = el("div", { class: "wc-likert__scale" });
      q.scale.forEach(function (s) {
        var checked = val[row.id] === s.value;
        var b = el("button", {
          type: "button", class: "wc-likert__opt", role: "radio",
          "aria-checked": checked ? "true" : "false",
          "data-answer-id": row.id + "-" + s.value
        });
        b.innerHTML = glyph("single", checked);
        b.appendChild(el("span", { text: s.label }));
        b.addEventListener("click", function () {
          var v = state.answers[q.id] || {};
          v[row.id] = s.value;
          state.answers[q.id] = v;
          errorBox.textContent = "";
          refresh({ focusId: row.id + "-" + s.value });
        });
        scale.appendChild(b);
      });
      block.appendChild(scale);
      fs.appendChild(block);
    });
    q.error = (function () {
      var open = q.rows.filter(function (r) { return !val[r.id]; }).map(function (r) { return r.label; });
      return open.length ? "Noch offen: " + open.join(", ") : "";
    })();
    return fs;
  }

  /* --------------------------------------------------------------- Review */

  function openReview() {
    show("review");
    renderReview();
    focusHeading("#review-h1");
  }

  function labelFor(q) {
    var v = state.answers[q.id];
    if (q.type === "likert") {
      if (!v) return null;
      return q.rows.map(function (r) {
        var s = q.scale.filter(function (x) { return x.value === v[r.id]; })[0];
        return r.label + ": " + (s ? s.label : "offen");
      }).join(" · ");
    }
    if (q.type === "rank") {
      var r = state.answers.q_top3 || [];
      if (!r.length) return null;
      return r.map(function (id, i) {
        var t = byId(M.topics, id); return (i + 1) + ". " + (t ? t.label : id);
      }).join(" · ");
    }
    if (q.type === "text") return v || null;
    if (Array.isArray(v)) {
      if (!v.length) return null;
      return v.map(function (id) { var o = byId(q.options || [], id); return o ? o.label : id; }).join(" · ");
    }
    if (!v) return null;
    var o = byId(q.options || [], v);
    return o ? o.label : v;
  }

  function renderReview() {
    var qs = questions();
    var body = $("#review-body");
    body.innerHTML = "";

    var d = state.district;
    body.appendChild(el("div", { class: "wc-card" }, [
      el("p", { class: "wc-eyebrow", text: "Bezug" }),
      el("h2", { class: "wc-h3", text: d === "bundesweit" ? "Überwiegend landes- oder bundesweite Arbeit" : (d ? d.nr + " · " + d.name : "Nicht gewählt") }),
      (function () {
        var b = el("button", { type: "button", class: "wc-btn wc-btn--link", text: "Ändern" });
        b.addEventListener("click", function () { show("district"); renderDistrict(); focusHeading("#district-h1"); });
        return b;
      })()
    ]));

    var missing = [];
    qs.forEach(function (q, i) {
      var text = labelFor(q);
      var ok = isAnswered(q);
      if (!ok) missing.push(q.short);
      var card = el("div", { class: "wc-card", style: "margin-top:1rem" }, [
        el("p", { class: "wc-eyebrow", text: "Frage " + q.nr + " · " + q.short }),
        el("h3", { class: "wc-h3", text: q.title })
      ]);
      card.appendChild(el("p", {
        class: text ? "" : "wc-muted",
        text: text || (q.optional ? "Nicht beantwortet · optional" : "Diese Angabe wird für den Report benötigt.")
      }));
      var b = el("button", { type: "button", class: "wc-btn wc-btn--link",
        text: ok ? "Ändern" : "Ergänzen", "aria-label": (ok ? "Antwort ändern zu Frage " : "Antwort ergänzen zu Frage ") + q.nr });
      b.addEventListener("click", function () { openSurvey(i); });
      card.appendChild(b);
      body.appendChild(card);
    });

    var foot = $("#review-foot");
    foot.innerHTML = "";
    foot.appendChild(el("p", { class: "wc-note",
      text: "Ihre Angaben werden lokal mit dem Regelwerk abgeglichen. Es findet keine Übertragung statt." }));
    var row = el("div", { class: "wc-btn-row wc-btn-row--stack" });
    var submit = el("button", { type: "button", class: "wc-btn wc-btn--primary", text: "Wirkungsreport erstellen",
      "aria-disabled": missing.length ? "true" : "false" });
    submit.addEventListener("click", function () {
      if (missing.length) {
        announce("Bitte ergänzen Sie: " + missing.join(", "), true);
        return;
      }
      runLoading();
    });
    row.appendChild(submit);
    var del = el("button", { type: "button", class: "wc-btn wc-btn--danger", text: "Alle lokalen Daten löschen" });
    del.addEventListener("click", confirmWipe);
    row.appendChild(del);
    foot.appendChild(row);
  }

  /* -------------------------------------------------------------- Loading */

  function runLoading() {
    show("loading");
    focusHeading("#loading-h1");
    var steps = $$("#loading-steps li");
    steps.forEach(function (s) { s.setAttribute("data-state", "todo"); s.querySelector(".wc-loading__mark").innerHTML = ""; });
    var i = 0;
    function tick() {
      if (i > 0) {
        steps[i - 1].setAttribute("data-state", "done");
        steps[i - 1].querySelector(".wc-loading__mark").innerHTML =
          '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12.5 10 17.5 19 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      }
      if (i >= steps.length) {
        window.setTimeout(function () { openReport(); }, 260);
        return;
      }
      steps[i].setAttribute("data-state", "active");
      announce(steps[i].querySelector("span:last-child").textContent);
      i++;
      window.setTimeout(tick, 340);
    }
    tick();
  }

  /* --------------------------------------------------------------- Report */

  function openReport() {
    show("report");
    renderReport();
    focusHeading("#report-h1");
  }

  function renderReport() {
    var d = state.district;
    var isNational = d === "bundesweit" || !d;

    $("#report-title").textContent = isNational ? "Bundesweite Betrachtung" : "Wahlkreis " + d.nr + " · " + d.name;
    $("#report-meta").textContent = "Datenstand " + M.dataAsOf + " · Methodik-Version " + M.methodVersion +
      " · Erstellt am " + new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

    /* Prioritaeten */
    var prio = $("#report-priorities");
    prio.innerHTML = "";
    var ranked = (state.answers.q_top3 || state.answers.q_prioritaeten || []);
    ranked.forEach(function (id, i) {
      var t = byId(M.topics, id);
      if (!t) return;
      prio.appendChild(el("div", { class: "wc-card" }, [
        el("p", { class: "wc-eyebrow", text: "Priorität " + (i + 1) }),
        el("h3", { class: "wc-h3", text: t.label }),
        el("p", { class: "wc-muted", text: t.hint })
      ]));
    });

    /* Zustandsziele */
    var goalsBox = $("#report-goals");
    goalsBox.innerHTML = "";
    var top = topPriority();
    var goalId = state.answers.q_zustandsziel;
    var goal = top ? byId(goalsFor(top.id), goalId) : null;
    if (goal) {
      goalsBox.appendChild(el("div", { class: "wc-card" }, [
        el("p", { class: "wc-eyebrow", text: top.label }),
        el("h3", { class: "wc-h3", text: goal.label }),
        el("p", { class: "wc-muted", text: goal.hint })
      ]));
    }
    var txt = state.answers.q_freitext;
    if (txt) {
      goalsBox.appendChild(el("div", { class: "wc-card", style: "margin-top:1rem" }, [
        el("p", { class: "wc-eyebrow", text: "Ihre Ergänzung" }),
        el("p", { text: txt }),
        el("p", { class: "wc-meta", text: "Nicht automatisch ausgewertet." })
      ]));
    }

    /* Kontext: amtliche Daten ergänzen die bundespolitische Herleitung. */
    $("#report-context-title").textContent = isNational ? "Amtlicher Bundeskontext" : "Amtlicher Bundes- und Wahlkreiskontext";
    var ctx = $("#report-context");
    ctx.innerHTML = "";
    currentIndicators().forEach(function (ind) {
      var row = el("div", { class: "wc-datarow" });
      row.appendChild(el("span", { class: "wc-datarow__name", text: ind.label }));
      if (indicatorValue(ind)) {
        row.appendChild(el("span", { class: "wc-datarow__value", text: indicatorContextText(ind) }));
        row.appendChild(el("span", { class: "wc-meta", text: "Beobachtungszeitpunkt: " + ind.observation }));
      } else {
        row.appendChild(evidenceMark("datenluecke"));
        row.appendChild(el("span", { class: "wc-meta", text: ind.gapReason }));
      }
      row.appendChild(sourceButton(ind.source));
      ctx.appendChild(row);
    });

    /* Hebel */
    var lev = $("#report-levers");
    lev.innerHTML = "";
    var bottlenecks = state.answers.q_engpass || [];
    M.bottlenecks.forEach(function (l) {
      var named = bottlenecks.indexOf(l.id) > -1;
      var li = el("li", { class: "wc-lever", "data-binding": named ? "true" : "false" });
      if (named) li.setAttribute("aria-current", "true");
      li.appendChild(el("span", { class: "wc-lever__name", text: l.label }));
      li.appendChild(degreeMark(named ? 1 : 0));
      li.appendChild(el("span", { class: "wc-lever__state", text: named ? "von Ihnen als Engpass genannt" : "nicht als Engpass ausgewählt" }));
      lev.appendChild(li);
    });
    $("#report-levers-conclusion").textContent =
      "Die Markierung zeigt Ihre Angaben, keine objektive Rangfolge. Ein Prüfpfad trennt direkte Folgen, Folgewirkungen und Wirkungsrisiken.";

    /* Pfade */
    var pathsBox = $("#report-paths");
    pathsBox.innerHTML = "";
    var matchingPaths = window.WC_RULE_ENGINE.evaluate(state.answers);
    if (!matchingPaths.length) {
      pathsBox.appendChild(el("div", { class: "wc-card" }, [
        el("h3", { class: "wc-h3", text: "Noch kein passender freigegebener Prüfpfad" }),
        el("p", { class: "wc-muted", text: "Die Herleitung dieser Regel ist noch nicht freigegeben." }),
        el("p", { class: "wc-meta", text: "Wählen Sie bei der Bundesrolle einen der angebotenen Wirkpfade und benennen Sie einen dazu passenden Engpass, damit die transparente Herleitung angezeigt werden kann." })
      ]));
    }
    matchingPaths.forEach(function (p) {
      pathsBox.appendChild(pathCard(p));
    });

    /* MPD */
    var sp = $("#report-spaces");
    sp.innerHTML = "";
    [
      { key: "direct", label: "Direkte erwartete Veränderung", items: matchingPaths.map(function (p) { return { text: p.direct, evidence: p.evidence }; }) },
      { key: "indirect", label: "Mögliche Folgewirkungen", items: matchingPaths.map(function (p) { return { text: p.indirect, evidence: p.evidence }; }) },
      { key: "risk", label: "Wirkungsrisiken", items: matchingPaths.flatMap(function (p) { return p.risks.map(function (text) { return { text: text, evidence: p.evidence }; }); }) }
    ].forEach(function (s) {
      var card = el("div", { class: "wc-card" });
      var inner = el("div", { class: "wc-space", "data-space": s.key });
      inner.appendChild(el("h3", { class: "wc-h3", text: s.label }));
      if (!s.items.length) {
        inner.appendChild(el("p", { class: "wc-muted", text: "Für diesen Wirkungsraum liegen zu Ihrem Schwerpunkt keine belastbaren Angaben vor." }));
      } else {
        var ul = el("ul");
        s.items.forEach(function (it) {
          var li = el("li");
          li.appendChild(el("span", { text: it.text }));
          li.appendChild(el("div", { style: "margin-top:.35rem" }, [evidenceMark(it.evidence)]));
          ul.appendChild(li);
        });
        inner.appendChild(ul);
      }
      card.appendChild(inner);
      sp.appendChild(card);
    });

    renderImpactAnalysis(window.WC_RULE_ENGINE.derive(state.answers, {
      hasDistrictContext: hasDistrictContext(),
      districtName: hasDistrictContext() ? state.district.nr + " " + state.district.name : null
    }), matchingPaths);

    renderSensitivity();
    renderToolkit();
  }

  function impactList(items, options) {
    var list = el("ul");
    (items || []).forEach(function (item) {
      var li = el("li", { text: typeof item === "string" ? item : item.text });
      if (options && options.evidence) li.appendChild(el("div", { style: "margin-top:.35rem" }, [evidenceMark(options.evidence)]));
      list.appendChild(li);
    });
    return list;
  }

  function impactCard(title, text, nodes) {
    var card = el("div", { class: "wc-card" });
    card.appendChild(el("h3", { class: "wc-h3 wc-card__title", text: title }));
    if (text) card.appendChild(el("p", { class: "wc-body", text: text }));
    (nodes || []).forEach(function (node) { if (node) card.appendChild(node); });
    return card;
  }

  function renderImpactAnalysis(analysis, matchingPaths) {
    var box = $("#report-analysis");
    var overall = $("#report-overall");
    box.innerHTML = "";
    overall.innerHTML = "";
    if (!analysis) {
      box.appendChild(impactCard("Noch keine konkrete Wirkungsanalyse", "Wählen Sie zuerst Schwerpunkt und Zustandsziel. Dann wird die Wirkungskette aus Ihren Antworten hergeleitet."));
      overall.appendChild(impactCard("Keine Gesamtbilanz möglich", "Ohne Schwerpunkt und Zustandsziel gibt es keine überprüfbare Wirkannahme."));
      return;
    }
    var goalLabel = selectedGoalLabel();

    box.appendChild(impactCard("Wirkannahme für „" + analysis.subject + "“", analysis.affected, [
      el("p", { class: "wc-meta", text: "Zielzustand aus Ihrer Auswahl: " + goalLabel + "." }),
      el("p", { class: "wc-meta", text: "Die folgenden Aussagen sind Modellannahmen. Amtliche Kontextdaten beschreiben den Ausgangspunkt; sie beweisen keine Ursache." })
    ]));

    box.appendChild(impactCard("1. Direkter Eingriff auf Bundesebene", "Ihre ausgewählte Bundesrolle verändert konkret Folgendes:", [
      impactList(analysis.federal, { evidence: "annahme" })
    ]));

    box.appendChild(impactCard("2. Begrenzender Faktor und Wirkungskette", "Ihre Engpassauswahl entscheidet, was vor einer Skalierung geklärt werden muss:", [
      impactList(analysis.constraints, { evidence: "annahme" })
    ]));

    box.appendChild(impactCard("3. Rückkopplung im Wahlkreis", analysis.local, [
      el("p", { class: "wc-meta", text: hasDistrictContext()
        ? "Der Wahlkreiswert ist ein lokaler Prüfpunkt neben dem Bundeswert; er ersetzt keine Verteilungsanalyse über alle Wahlkreise."
        : "Ohne gewählten Wahlkreis bleibt diese Ebene als notwendiger lokaler Prüfpunkt benannt." })
    ]));

    var signalCard = impactCard("4. Woran sich die Annahme überprüfen lässt", "Die ausgewählten Daten sind Ausgangsdaten. Für den Wirknachweis braucht es Zeitreihen, Vergleichsgruppen oder eine andere geeignete Gegenfaktik.");
    var signalList = el("ul");
    analysis.signals.forEach(function (signal) {
      var li = el("li");
      if (signal.id) {
        var indicator = currentIndicatorById(signal.id);
        var title = signal.title || (indicator && indicator.label) || signal.id;
        li.appendChild(el("strong", { text: title + ": " }));
        li.appendChild(document.createTextNode(signal.text));
        if (indicator && indicatorValue(indicator)) {
          li.appendChild(el("p", { class: "wc-meta", text: indicatorContextText(indicator) + " · Beobachtungszeitpunkt: " + indicator.observation }));
          li.appendChild(sourceButton(indicator.source));
        } else {
          li.appendChild(el("div", { style: "margin-top:.35rem" }, [evidenceMark("datenluecke")]));
        }
      } else {
        li.appendChild(el("strong", { text: signal.required + ": " }));
        li.appendChild(document.createTextNode(signal.text));
        li.appendChild(el("div", { style: "margin-top:.35rem" }, [evidenceMark("datenluecke")]));
      }
      signalList.appendChild(li);
    });
    signalCard.appendChild(signalList);
    box.appendChild(signalCard);

    overall.appendChild(impactCard("Vorläufige Gesamtwirkungsbilanz", analysis.overall, [
      el("p", { class: "wc-meta", text: "Diese Bilanz ist bewusst keine Punktzahl: Direkte Wirkung, Folgewirkungen und Risiken sind nicht gegeneinander verrechenbar." })
    ]));

    var nationalItems = analysis.federal.concat(matchingPaths.map(function (path) { return path.direct; }));
    overall.appendChild(impactCard("Bundesebene", "Der erwartete direkte Veränderungsraum liegt in Regel, Anreiz, Vollzug oder Rückkopplung:", [
      impactList(nationalItems, { evidence: "annahme" })
    ]));

    overall.appendChild(impactCard("Wahlkreisebene", analysis.local, [
      el("p", { class: "wc-meta", text: hasDistrictContext()
        ? "Der gewählte Wahlkreis wird neben dem Bundeswert beobachtet. Sichtbar wird nicht nur Aktivität, sondern ob der Zugang oder Zustand für Betroffene tatsächlich anders wird."
        : "Für die lokale Rückkopplung wäre ein Wahlkreis oder ein anderer klar benannter Umsetzungsraum zu ergänzen." })
    ]));

    var lockCard = impactCard("Nicht kompensierbare Risiken und offene Voraussetzungen", "Positive Folgen an einer Stelle rechtfertigen keine schwere negative Folge an anderer Stelle.");
    lockCard.appendChild(impactList(analysis.risks.concat(analysis.constraints), { evidence: "annahme" }));
    overall.appendChild(lockCard);
  }

  function pathCard(p) {
    var card = el("article", { class: "wc-card wc-path" });
    card.appendChild(el("p", { class: "wc-eyebrow", text: "Handlungspfad " + p.letter }));
    card.appendChild(el("h3", { class: "wc-h3 wc-card__title", text: p.title }));
    card.appendChild(el("p", { class: "wc-body", text: p.summary }));
    card.appendChild(el("p", { class: "wc-path__match", text: "Ausgelöst durch: " + p.rule.conditions.map(function (condition) { return condition.text; }).join(" und ") + "." }));

    var badges = el("ul", { class: "wc-badges" });
    badges.appendChild(el("li", {}, [el("span", { class: "wc-badge", text: p.level })]));
    badges.appendChild(el("li", {}, [el("span", { class: "wc-badge", text: p.horizon })]));
    var evLi = el("li");
    var evBadge = el("span", { class: "wc-badge" });
    evBadge.appendChild(evidenceMark(p.evidence));
    evLi.appendChild(evBadge);
    badges.appendChild(evLi);
    card.appendChild(badges);
    card.appendChild(sourceButton(p.source));

    var acts = el("div", { class: "wc-path__actions" });
    var why = el("button", { type: "button", class: "wc-btn wc-btn--primary wc-btn--sm",
      text: "Warum wird mir das vorgeschlagen?", "aria-haspopup": "dialog" });
    why.addEventListener("click", function () { openExplain(p, why); });
    acts.appendChild(why);

    var pathBtn = el("button", { type: "button", class: "wc-btn wc-btn--link", text: "Wirkungspfad ansehen", "aria-haspopup": "dialog" });
    pathBtn.addEventListener("click", function () { openPath(p, pathBtn); });
    acts.appendChild(pathBtn);

    var alt = el("button", { type: "button", class: "wc-btn wc-btn--link", text: "Alternativen", "aria-haspopup": "dialog" });
    alt.addEventListener("click", function () { openExplain(p, alt, "explain-s6"); });
    acts.appendChild(alt);

    card.appendChild(acts);
    return card;
  }

  function renderSensitivity() {
    var chips = $("#sens-chips");
    chips.innerHTML = "";
    M.sensitivity.forEach(function (s) {
      var li = el("li");
      var active = ui.sens.indexOf(s.id) > -1;
      var atMax = ui.sens.length >= 3 && !active;
      var b = el("button", { type: "button", class: "wc-chip", "aria-pressed": active ? "true" : "false", text: s.label });
      if (atMax) b.setAttribute("aria-disabled", "true");
      b.addEventListener("click", function () {
        if (atMax) {
          announce("Höchstens drei Annahmen gleichzeitig, damit das Ergebnis nachvollziehbar bleibt.", true);
          return;
        }
        var i = ui.sens.indexOf(s.id);
        if (i > -1) ui.sens.splice(i, 1); else ui.sens.push(s.id);
        renderSensitivity();
      });
      li.appendChild(b);
      chips.appendChild(li);
    });

    var out = $("#sens-result");
    out.innerHTML = "";
    if (!ui.sens.length) {
      out.appendChild(el("p", { class: "wc-muted", text: "Wählen Sie oben eine Annahme, um zu sehen, ob sich die Reihenfolge ändern würde." }));
      $("#sens-reset").hidden = true;
      return;
    }
    $("#sens-reset").hidden = false;
    var texts = ui.sens.map(function (id) {
      var s = M.sensitivity.filter(function (x) { return x.id === id; })[0];
      return s ? s.text : "";
    });
    texts.forEach(function (t) { out.appendChild(el("p", { text: t })); });
    out.appendChild(el("p", { class: "wc-meta", text: "Ihre ursprünglichen Angaben bleiben unverändert." }));
    announce(texts.join(" "));
  }

  function renderToolkit() {
    var box = $("#report-kit");
    box.innerHTML = "";
    var items = [
      { title: "Mögliche Prüffrage", hint: "Für Ausschuss, Anfrage oder Fachgespräch", body: M.toolkit.pruefrage, copy: true },
      { title: "Drei Wirkungsindikatoren", hint: "Woran sich später überprüfen lässt, ob sich der Zustand verändert hat", body: M.toolkit.indikatoren, copy: true },
      { title: "Frage für den Wahlkreisdialog", hint: "Für Bürgersprechstunde, Ortstermin oder Verbändegespräch", body: M.toolkit.dialogfrage, copy: true },
      { title: "Ein erster Schritt", hint: "Was sich ohne Gesetzesänderung beginnen lässt", body: M.toolkit.ersterschritt, copy: false }
    ];
    items.forEach(function (it) {
      var card = el("div", { class: "wc-card" });
      card.appendChild(el("h3", { class: "wc-h3 wc-card__title", text: it.title }));
      card.appendChild(el("p", { class: "wc-meta", text: it.hint }));
      var plain;
      if (Array.isArray(it.body)) {
        var ul = el("ul");
        it.body.forEach(function (b) { ul.appendChild(el("li", { text: b })); });
        card.appendChild(ul);
        plain = it.body.join("\n");
      } else {
        card.appendChild(el("p", { text: it.body }));
        plain = it.body;
      }
      if (it.copy) {
        var b = el("button", { type: "button", class: "wc-btn wc-btn--quiet wc-btn--sm", text: "Text kopieren" });
        b.addEventListener("click", function () {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(plain).then(function () {
              announce("Text kopiert");
            }, function () {
              announce("Kopieren ist in diesem Browser nicht verfügbar. Bitte markieren Sie den Text und kopieren Sie ihn mit Strg+C.", true);
            });
          } else {
            announce("Kopieren ist in diesem Browser nicht verfügbar. Bitte markieren Sie den Text und kopieren Sie ihn mit Strg+C.", true);
          }
        });
        card.appendChild(b);
      }
      box.appendChild(card);
    });

    var learning = el("div", { class: "wc-card" });
    learning.appendChild(el("h3", { class: "wc-h3 wc-card__title", text: "Wirkungskompetenz vertiefen" }));
    learning.appendChild(el("p", { class: "wc-meta", text: "Die Begriffe im Report sind keine Schlagworte. Sie beschreiben, was eine politische Maßnahme direkt verändert, welche Folgewirkungen möglich sind und worauf Rückkopplung achten muss." }));
    var learningList = el("ul");
    M.learningLinks.forEach(function (link) {
      var item = el("li");
      item.appendChild(el("a", { href: link.href, text: link.label }));
      item.appendChild(el("span", { class: "wc-muted", text: " – " + link.text }));
      learningList.appendChild(item);
    });
    learning.appendChild(learningList);
    box.appendChild(learning);

    var consent = $("#report-consent");
    consent.innerHTML = "";
    consent.appendChild(el("div", { class: "wc-card" }, [
      el("h3", { class: "wc-h3", text: "Ihre Angaben bleiben lokal" }),
      el("p", { class: "wc-muted", text: "Der veröffentlichte Fragebogen überträgt keine Antworten. Eine freiwillige Forschungsbeteiligung wird erst angeboten, wenn der getrennte Dienst, die Information und der Widerrufsweg veröffentlicht sind." })
    ]));
  }

  /* --------------------------------------------------------------- Drawer */

  var drawer = { node: null, scrim: null, opener: null, keyHandler: null };

  function trapFocus(ev) {
    if (ev.key !== "Tab") return;
    var focusables = $$('a[href],button:not([disabled]),textarea,input,select,summary,[tabindex]:not([tabindex="-1"])', drawer.node)
      .filter(function (n) { return n.offsetParent !== null || n === document.activeElement; });
    if (!focusables.length) return;
    var first = focusables[0], last = focusables[focusables.length - 1];
    if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
    else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
  }

  function openDrawer(title, subtitle, buildBody, opener, focusSection) {
    closeDrawer(true);
    drawer.opener = opener || document.activeElement;
    var node = $("#wc-drawer");
    var scrim = $("#wc-scrim");
    $("#wc-drawer-title").textContent = title;
    $("#wc-drawer-sub").textContent = subtitle || "";
    $("#wc-drawer-sub").hidden = !subtitle;
    var body = $("#wc-drawer-body");
    body.innerHTML = "";
    buildBody(body);
    node.hidden = false;
    scrim.hidden = false;
    document.body.classList.add("is-locked");
    $("#wc-app").setAttribute("inert", "");
    drawer.node = node;
    drawer.scrim = scrim;
    drawer.keyHandler = function (ev) {
      if (ev.key === "Escape") { ev.preventDefault(); closeDrawer(); }
      trapFocus(ev);
    };
    document.addEventListener("keydown", drawer.keyHandler);
    if (focusSection) {
      var sec = $("#" + focusSection, body);
      if (sec) sec.scrollIntoView({ block: "start" });
    }
    $("#wc-drawer-title").setAttribute("tabindex", "-1");
    $("#wc-drawer-title").focus();
  }

  function closeDrawer(silent) {
    var node = $("#wc-drawer"), scrim = $("#wc-scrim");
    if (!node || node.hidden) return;
    node.hidden = true;
    scrim.hidden = true;
    document.body.classList.remove("is-locked");
    $("#wc-app").removeAttribute("inert");
    if (drawer.keyHandler) document.removeEventListener("keydown", drawer.keyHandler);
    drawer.keyHandler = null;
    if (!silent && drawer.opener && document.contains(drawer.opener)) drawer.opener.focus();
    drawer.opener = null;
  }

  function section(id, title, nodes) {
    var s = el("section", { class: "wc-drawer__section", id: id });
    s.appendChild(el("h3", { text: title }));
    nodes.forEach(function (n) { if (n) s.appendChild(n); });
    return s;
  }

  function openExplain(p, opener, focusSection) {
    openDrawer("Warum wird mir das vorgeschlagen?", "Handlungspfad " + p.letter + " · Regel " + p.rule.id, function (body) {
      /* 1 Ihre Angaben */
      var dl = el("dl", { class: "wc-deflist" });
      var qs = questions();
      [
        ["Priorität", (function () { var t = topPriority(); return t ? t.label : null; })()],
        ["Zustandsziel", labelFor(byId(qs, "q_zustandsziel") || {})],
        ["Engpass", labelFor(byId(qs, "q_engpass") || {})],
        ["Bundespolitische Rolle", labelFor(byId(qs, "q_bundesrolle") || {})],
        ["Wirkungshorizont", labelFor(byId(qs, "q_horizont") || {})],
        ["Rote Linie", labelFor(byId(qs, "q_rote_linie") || {})]
      ].forEach(function (pair) {
        dl.appendChild(el("dt", { text: pair[0] }));
        dl.appendChild(el("dd", { text: pair[1] || "keine angegeben" }));
      });
      body.appendChild(section("explain-s1", "Ihre Angaben", [dl]));

      /* 2 Bundes- und Wahlkreisdaten */
      var dataWrap = el("div");
      currentIndicators().forEach(function (ind) {
        var row = el("div", { class: "wc-datarow" });
        row.appendChild(el("span", { class: "wc-datarow__name", text: ind.label }));
        if (indicatorValue(ind)) {
          row.appendChild(el("span", { class: "wc-datarow__value", text: indicatorContextText(ind) }));
        } else {
          row.appendChild(evidenceMark("datenluecke"));
        }
        row.appendChild(sourceButton(ind.source));
        if (!indicatorValue(ind)) {
          row.appendChild(el("p", { class: "wc-meta", style: "flex:1 1 100%",
            text: ind.gapReason }));
        }
        dataWrap.appendChild(row);
      });
      var districtName = state.district && state.district !== "bundesweit"
        ? "Bundesebene und Wahlkreis " + state.district.nr + " " + state.district.name : "Bundesebene";
      body.appendChild(section("explain-s2", "Amtliche Ausgangsdaten · " + districtName, [dataWrap]));

      /* 3 Methodik */
      var rule = el("div", { class: "wc-rulebox" });
      rule.appendChild(el("p", { class: "wc-rule-id", text: "Regel " + p.rule.id }));
      if (window.WC_RULE_ENGINE.hasApprovedText(p)) {
        rule.appendChild(el("p", { text: "Wenn " + p.rule.conditions.map(function (condition) { return condition.text; }).join(" und ") + ", dann " + p.rule.conclusion.text + "." }));
        rule.appendChild(evidenceMark(p.evidence));
        rule.appendChild(el("p", { class: "wc-meta", text: "Grundlage: " + p.rule.basis }));
      } else {
        rule.appendChild(el("p", { text: window.WC_RULE_ENGINE.unavailableText }));
      }
      body.appendChild(section("explain-s3", "Methodik", [
        rule,
        el("p", { class: "wc-meta", style: "margin-top:.75rem",
          text: "Diese Regel wird deterministisch aus Ihren Angaben ausgewertet. Sie beschreibt einen Prüfpfad, keine Wahl- oder Personenempfehlung." })
      ]));

      /* 4 Daraus folgt */
      body.appendChild(section("explain-s4", "Direkte und indirekte Folgen", [
        el("p", { text: "Direkt: " + p.direct }),
        el("p", { text: "Indirekt: " + p.indirect })
      ]));

      /* 5 Was wuerde das veraendern */
      var ul = el("ul");
      ul.appendChild(el("li", { text: "Ein anderer Engpass oder eine andere Bundesrolle kann einen anderen Prüfpfad auslösen." }));
      ul.appendChild(el("li", { text: "Amtliche Kontextdaten ergänzen die Herleitung, sie ersetzen keine Wirkungsprüfung für eine konkrete Maßnahme." }));
      body.appendChild(section("explain-s5", "Was würde das verändern", [ul]));

      /* 6 Wirkungsrisiken */
      var risks = el("ul");
      p.risks.forEach(function (risk) { risks.appendChild(el("li", { text: risk })); });
      body.appendChild(section("explain-s6", "Wirkungsrisiken", [risks]));
    }, opener, focusSection);
  }

  function openPath(p, opener) {
    openDrawer("Möglicher Wirkungspfad", "Handlungspfad " + p.letter, function (body) {
      var view = ui.pathView[p.id] || (window.matchMedia("(min-width: 64rem)").matches ? "flow" : "list");
      var toggle = el("div", { class: "wc-viewtoggle", role: "group", "aria-label": "Darstellung wählen" });
      [["flow", "Als Verlauf"], ["list", "Als Liste"]].forEach(function (v) {
        var b = el("button", { type: "button", class: "wc-chip", "aria-pressed": view === v[0] ? "true" : "false", text: v[1] });
        b.addEventListener("click", function () { ui.pathView[p.id] = v[0]; openPath(p, opener); });
        toggle.appendChild(b);
      });
      body.appendChild(toggle);

      var listText = p.stations.map(function (s, i) {
        return (i + 1) + ". " + s.title + ": " + s.text;
      }).join(" ");

      if (view === "flow") {
        var scroller = el("div", { class: "wc-scroll-x", tabindex: "0", role: "img",
          "aria-label": "Wirkungspfad als Verlauf. " + listText });
        var flow = el("div", { class: "wc-flow" });
        p.stations.forEach(function (s, i) {
          var st = el("div", { class: "wc-flow__station" }, [
            el("p", { class: "wc-eyebrow", text: s.title }),
            el("p", { class: "wc-meta", style: "color:var(--wc-ink)", text: s.text })
          ]);
          st.appendChild(evidenceMark(s.evidence));
          flow.appendChild(st);
          if (i < p.stations.length - 1) {
            flow.appendChild(el("div", { class: "wc-flow__arrow", "aria-hidden": "true",
              html: '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M4 12h16m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' }));
          }
        });
        scroller.appendChild(flow);
        body.appendChild(scroller);
      } else {
        var ol = el("ol", { class: "wc-steps" });
        p.stations.forEach(function (s) {
          var li = el("li");
          li.appendChild(el("strong", { text: s.title }));
          li.appendChild(el("p", { text: s.text }));
          li.appendChild(evidenceMark(s.evidence));
          ol.appendChild(li);
        });
        body.appendChild(ol);
      }

      var risks = el("div", { class: "wc-risks" });
      risks.appendChild(el("h3", { class: "wc-h3", text: "Risiken und Gegenwirkungen" }));
      if (!p.risks.length) {
        risks.appendChild(el("p", { class: "wc-muted", text: "Zu diesem Pfad sind keine belastbaren Gegenwirkungen hinterlegt." }));
      } else {
        var rul = el("ul");
        p.risks.forEach(function (r) {
          var li = el("li");
          li.appendChild(el("span", { text: typeof r === "string" ? r : r.text }));
          li.appendChild(el("div", { style: "margin-top:.35rem" }, [evidenceMark(typeof r === "string" ? p.evidence : r.evidence)]));
          rul.appendChild(li);
        });
        risks.appendChild(rul);
      }
      body.appendChild(risks);
      body.appendChild(el("p", { class: "wc-meta",
        text: "Ein Wirkungspfad beschreibt einen plausiblen Weg, keine Garantie. Jede Station trägt ihre eigene Belegbarkeit." }));
    }, opener);
  }

  function openSource(sourceId, opener) {
    var s = M.sources[sourceId];
    if (!s) return;
    openDrawer("Quelle", s.title || s.metric, function (body) {
      var dl = el("dl", { class: "wc-deflist" });
      [["Institution", s.institution], ["Datensatz oder Methode", s.title || s.metric], ["Jahr", s.year], ["Geografische Ebene", s.level], ["Datenqualität", s.quality], ["Räumlicher Hinweis", s.territorialNote], ["Lizenz", s.licence]]
        .forEach(function (p) {
          dl.appendChild(el("dt", { text: p[0] }));
          dl.appendChild(el("dd", { text: p[1] }));
        });
      body.appendChild(dl);
      if (s.url) {
        body.appendChild(el("a", { class: "wc-btn wc-btn--quiet wc-btn--sm", href: s.url, target: "_blank", rel: "noopener noreferrer", style: "margin-top:1rem", text: "Quelle öffnen" }));
      }
    }, opener);
  }

  function openTrust(opener) {
    openDrawer("Vertrauen & Datenschutz", "Die wichtigsten Angaben in Kurzform", function (body) {
      var items = [
        ["Zweck", "Wofür dieses Werkzeug gebaut wurde",
          "Der Wahlkreis-Wirkungscheck unterstützt Mandatsträgerinnen und Mandatsträger dabei, politische Ziele auf Wirkung statt auf Massnahmen hin zu prüfen. Er ersetzt keine fachliche Beratung und keine parlamentarische Willensbildung.", false],
        ["Betreiber", "Wer verantwortlich ist",
          "Die verantwortliche Stelle und die vollständigen Angaben stehen im Impressum der Wirkungsökonomie.", false],
        ["Daten", "Was gespeichert wird",
          "Ihre Antworten liegen ausschliesslich in Ihrem Browser unter dem Schlüssel wc_state_v1. Es gibt kein Konto und keine Anmeldung. Dieser Fragebogen überträgt nichts, setzt keine Analyse-Cookies und bindet keine Dienste Dritter ein. Sie können alle lokalen Daten jederzeit vollständig löschen.", true],
        ["Veröffentlichung", "Was öffentlich werden kann",
          "Dieser Fragebogen veröffentlicht keine Antworten und überträgt keine Angaben. Ein späterer Forschungsbeitrag wäre ein eigener, nicht vorausgewählter Schritt.", false],
        ["KI", "Wo KI vorkommt und wo nicht",
          "Die Prüfpfade entstehen regelbasiert und deterministisch. Dieselben Angaben führen immer zum selben Ergebnis. Es werden keine Empfehlungen von einem Sprachmodell erzeugt.", false],
        ["Parteiunabhängigkeit", "Unabhängigkeit und Finanzierung",
          "Das Werkzeug fragt weder nach Fraktion noch nach Partei, erstellt keine Rangliste und gibt keine Wahlempfehlung.", false],
        ["Quellen", "Welche Daten verwendet werden",
          "Die Wahlkreisdaten stammen aus den verlinkten amtlichen Datensätzen der Bundeswahlleiterin. Institution, Jahr, Ebene, räumlicher Hinweis und Lizenz sind bei jeder Quelle sichtbar. Datenlücken werden ausgewiesen und nicht überbrückt.", false],
        ["Methodik", "Wie das Ergebnis entsteht",
          "Ihre Angaben werden mit Wahlkreisdaten abgeglichen und auf ein offengelegtes Regelwerk angewendet. Jede Empfehlung nennt die Regel, auf der sie beruht.", false],
        ["Kontakt", "Auskunft, Widerspruch, Korrekturhinweis",
          "Hinweise auf fehlerhafte Daten oder Regeln sind willkommen: wirkungscheck@wirkungsoekonomie.de. Rechtliche Angaben stehen im Impressum.", false]
      ];
      items.forEach(function (it) {
        var d = el("details", { class: "wc-accordion" });
        if (it[3]) d.setAttribute("open", "");
        var sum = el("summary");
        sum.appendChild(document.createTextNode(it[0]));
        sum.appendChild(el("span", { text: it[1] }));
        d.appendChild(sum);
        d.appendChild(el("div", { class: "wc-accordion__body" }, [el("p", { text: it[2] })]));
        body.appendChild(d);
      });
      var del = el("button", { type: "button", class: "wc-btn wc-btn--danger", style: "margin-top:1.5rem",
        text: "Alle lokalen Daten löschen" });
      del.addEventListener("click", function () { closeDrawer(); confirmWipe(); });
      body.appendChild(del);
    }, opener);
  }

  function confirmWipe() {
    var ok = window.confirm("Alle lokalen Daten löschen?\n\nGelöscht werden Ihre Antworten, Ihr Report und Ihre Einstellungen in diesem Browser. Das lässt sich nicht rückgängig machen.");
    if (!ok) return;
    wipe();
    announce("Alle lokalen Daten wurden gelöscht.", true);
    renderLanding();
    show("landing");
    focusHeading("#landing-h1");
  }

  /* ------------------------------------------------------------- Start */

  function init() {
    var loaded = load();
    if (loaded === "expired") {
      wipe();
      $("#expired-note").hidden = false;
    }

    $("#wc-scrim").addEventListener("click", function () { closeDrawer(); });
    $("#wc-drawer-close").addEventListener("click", function () { closeDrawer(); });
    $$("[data-trust]").forEach(function (b) {
      b.addEventListener("click", function () { openTrust(b); });
    });

    $("#landing-start").addEventListener("click", function () {
      show("district"); renderDistrict(); focusHeading("#district-h1");
    });
    $("#landing-start-2").addEventListener("click", function () {
      show("district"); renderDistrict(); focusHeading("#district-h1");
    });
    $("#district-next").addEventListener("click", function () {
      if (!state.district) {
        announce("Bitte wählen Sie einen Wahlkreis oder die bundesweite Betrachtung.", true);
        return;
      }
      if (state.seenIntro) { openSurvey(0); return; }
      show("intro"); focusHeading("#intro-h1");
    });
    $("#district-back").addEventListener("click", function () {
      show("landing"); focusHeading("#landing-h1");
    });
    $("#intro-start").addEventListener("click", function () {
      state.seenIntro = true; save(); openSurvey(0);
    });
    $("#review-back").addEventListener("click", function () {
      var qs = questions();
      openSurvey(qs.length - 1);
    });
    $("#sens-reset").addEventListener("click", function () {
      ui.sens = [];
      renderSensitivity();
      announce("Zurückgesetzt auf Ihre ursprünglichen Angaben.", true);
    });
    $("#report-print").addEventListener("click", function () { window.print(); });

    $$("#report-nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        $$("#report-nav a").forEach(function (x) { x.removeAttribute("aria-current"); });
        a.setAttribute("aria-current", "true");
      });
    });

    renderLanding();
    show("landing");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
