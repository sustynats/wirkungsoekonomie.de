(function () {
  "use strict";

  var STORE = "wc-bundestag-v3";
  var DATA = window.WC_V3_MODULES;
  var RULES = window.WC_V3_RULES;
  var state = { step: 0, district: null, answers: { topic: null, goal: null, approach: null, bottlenecks: [], redLines: [], signals: [], regional: null, regionalNote: "", conditions: [] } };
  var stage = document.getElementById("v3-stage");
  var live = document.getElementById("v3-live");
  var steps = ["topic", "goal", "approach", "bottlenecks", "redLines", "signals", "regional", "conditions"];

  function $(selector, scope) { return (scope || document).querySelector(selector); }
  function escapeHtml(value) { return String(value == null ? "" : value).replace(/[&<>\"']/g, function (char) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[char]; }); }
  function item(items, id) { return RULES.index(items, id); }
  function module() { return DATA.modules[state.answers.topic]; }
  function track(name) { if (window.WC_V3_ANALYTICS) window.WC_V3_ANALYTICS.track(name); }
  function say(text) { live.textContent = text; }
  function save() { localStorage.setItem(STORE, JSON.stringify(state)); }
  function restore() {
    try {
      var stored = JSON.parse(localStorage.getItem(STORE));
      if (stored && stored.answers) state = Object.assign(state, stored);
    } catch (error) { localStorage.removeItem(STORE); }
  }
  function label(items, id) { var found = item(items, id); return found ? found.label : "Noch nicht festgelegt"; }
  function labels(items, ids) { return (Array.isArray(ids) ? ids : []).map(function (id) { return label(items, id); }); }
  function setScreen(name) {
    document.querySelectorAll("[data-v3-screen]").forEach(function (screen) { screen.hidden = screen.dataset.v3Screen !== name; });
    if (name === "check") renderQuestion();
    if (name === "report") renderReport();
  }
  function isExclusive(options, selected) { return selected.some(function (id) { var choice = item(options, id); return choice && choice.exclusive; }); }
  function optionCards(options, selected, multi, name) {
    return options.map(function (option) {
      var active = selected.indexOf(option.id) !== -1;
      return '<button type="button" class="v3-option' + (active ? ' is-selected' : '') + '" data-choice="' + escapeHtml(option.id) + '" data-name="' + name + '" aria-pressed="' + active + '"><span class="v3-option__mark" aria-hidden="true"></span><span>' + escapeHtml(option.label) + (option.detail ? '<small>' + escapeHtml(option.detail) + '</small>' : '') + '</span></button>';
    }).join("");
  }
  function questionMeta(key) {
    var mod = module();
    var common = DATA.common;
    if (key === "topic") return { eyebrow: "Schritt 1 von 8", title: "Welches bundespolitische Thema möchten Sie prüfen?", hint: "Zum Start sind zwei Themen vollständig ausgearbeitet. Die Auswahl legt keine politische Position fest." };
    if (key === "goal") return { eyebrow: "Schritt 2 von 8", title: "Was soll sich für Menschen oder Institutionen tatsächlich verändern?", hint: "Wählen Sie den Zielzustand, nicht das Instrument." };
    if (key === "approach") return { eyebrow: "Schritt 3 von 8", title: "Über welchen politischen Ansatz soll dieser Zustand wahrscheinlicher werden?", hint: "Nach Ihrer Auswahl sehen Sie sofort, was sich zunächst verändert - und was noch nicht automatisch folgt." };
    if (key === "bottlenecks") return { eyebrow: "Schritt 4 von 8", title: "Was begrenzt diesen Weg derzeit am stärksten?", hint: "Wählen Sie höchstens zwei Faktoren. Das zeigt, welche Bundesrolle zuerst gefragt ist." };
    if (key === "redLines") return { eyebrow: "Schritt 5 von 8", title: "Was darf auf diesem Weg nicht verschlechtert werden?", hint: "Diese roten Linien werden getrennt geprüft. Sie werden nicht gegen andere Fortschritte verrechnet." };
    if (key === "signals") return { eyebrow: "Schritt 6 von 8", title: "Woran wäre bundesweit erkennbar, ob der Ansatz wirklich wirkt?", hint: "Wählen Sie bis zu drei überprüfbare Veränderungen. Aktivitäten oder Mittelabfluss genügen dafür nicht." };
    if (key === "regional") return { eyebrow: "Schritt 7 von 8", title: "Welche Rückmeldung aus der Praxis oder Ihrem Wahlkreis ist wichtig?", hint: "Der Wahlkreis ist eine Rückkopplungsebene - keine Bewertung von Ihnen oder Ihrer Region." };
    return { eyebrow: "Schritt 8 von 8", title: "Was muss vor einer Ausweitung besonders gesichert sein?", hint: "Optional: höchstens zwei Voraussetzungen für eine tragfähige Umsetzung." };
  }
  function feedbackFor(key) {
    var mod = module();
    if (!mod) return "";
    if (key === "approach" && state.answers.approach) {
      var approach = item(mod.approaches, state.answers.approach);
      return '<section class="v3-feedback" aria-live="polite"><p class="v3-feedback__eyebrow">Unmittelbare Einordnung</p><h3>Was verändert sich zuerst?</h3><p>' + escapeHtml(approach.first) + '</p><h3>Was folgt noch nicht automatisch?</h3><p>' + escapeHtml(approach.notYet) + '</p></section>';
    }
    if (key === "bottlenecks" && state.answers.bottlenecks.length) {
      var partial = RULES.derive(mod, state.answers);
      return '<section class="v3-feedback" aria-live="polite"><p class="v3-feedback__eyebrow">Nächste Prüfspur</p><h3>Passt Ansatz und begrenzender Faktor zusammen?</h3><p>' + escapeHtml(partial.fit.text) + '</p></section>';
    }
    if (key === "redLines" && state.answers.redLines.length) {
      return '<section class="v3-feedback v3-feedback--risk" aria-live="polite"><p class="v3-feedback__eyebrow">Eigenständige Schutzprüfung</p><h3>Diese Folgen werden nicht verrechnet.</h3><p>Eine Verbesserung im Zielpfad wäre kein ausreichender Erfolg, wenn ' + escapeHtml(labels(mod.redLines, state.answers.redLines).join(" oder ")) + ' deutlich verschlechtert würde. Dafür braucht es eine getrennte Beobachtung und einen Korrekturpunkt.</p></section>';
    }
    if (key === "signals" && state.answers.signals.length) {
      var hasGap = state.answers.signals.some(function (id) { var signal = item(mod.signals, id); return signal && signal.status === "data_gap"; });
      return '<section class="v3-feedback" aria-live="polite"><p class="v3-feedback__eyebrow">Evidenzgrenze</p><h3>Beobachtung ist nicht automatisch ein Nachweis.</h3><p>' + (hasGap ? "Mindestens ein gewähltes Signal hat derzeit eine ausgewiesene Datenlücke. Der Report behauptet dafür keine Entwicklung und zeigt keine Kurve." : "Für die gewählten Signale sind ergänzende, geprüfte Daten nötig. Der Report trennt deshalb Wirkungspotenzial, Beobachtung und eine belastbare Ursachenbehauptung.") + '</p></section>';
    }
    return "";
  }
  function canContinue(key) {
    if (key === "topic" || key === "goal" || key === "approach" || key === "regional") return Boolean(state.answers[key]);
    if (key === "bottlenecks" || key === "redLines" || key === "signals") return state.answers[key].length > 0;
    return true;
  }
  function renderQuestion() {
    var key = steps[state.step];
    var meta = questionMeta(key);
    var mod = module();
    var options = [];
    var selected = [];
    var multi = false;
    if (key === "topic") { options = Object.keys(DATA.modules).map(function (id) { return { id: id, label: DATA.modules[id].title, detail: DATA.modules[id].short }; }); selected = state.answers.topic ? [state.answers.topic] : []; }
    if (mod && key === "goal") { options = mod.goals; selected = state.answers.goal ? [state.answers.goal] : []; }
    if (mod && key === "approach") { options = mod.approaches; selected = state.answers.approach ? [state.answers.approach] : []; }
    if (mod && key === "bottlenecks") { options = DATA.common.bottlenecks; selected = state.answers.bottlenecks; multi = true; }
    if (mod && key === "redLines") { options = mod.redLines; selected = state.answers.redLines; multi = true; }
    if (mod && key === "signals") { options = mod.signals; selected = state.answers.signals; multi = true; }
    if (mod && key === "conditions") { options = DATA.common.conditions; selected = state.answers.conditions; multi = true; }
    var body = "";
    if (key === "regional") {
      body = '<div class="v3-option-list">' + optionCards(DATA.common.regionalOptions, state.answers.regional ? [state.answers.regional] : [], false, key) + '</div><label class="v3-note-label" for="v3-regional-note">Optional: Was sollte aus Ihrer Praxis oder Ihrem Wahlkreis besonders beachtet werden?</label><textarea id="v3-regional-note" class="v3-textarea" rows="4" maxlength="700" placeholder="Ihre Notiz bleibt lokal im Browser, bis Sie sie freiwillig für eine KI-Vertiefung freigeben.">' + escapeHtml(state.answers.regionalNote || "") + '</textarea><p class="wc-meta">Es werden aktuell keine regionalen Kennzahlen angezeigt: Die verfügbaren Daten sind für diese Ausgabe noch nicht fachlich für eine Wirkungsaussage auditiert.</p>';
    } else {
      var limit = key === "bottlenecks" || key === "redLines" || key === "conditions" ? 2 : key === "signals" ? 3 : 1;
      body = '<div class="v3-option-list" data-limit="' + limit + '">' + optionCards(options, selected, multi, key) + '</div>' + (multi ? '<p class="wc-meta" id="v3-limit">' + selected.length + " von höchstens " + limit + " ausgewählt.</p>" : "") + feedbackFor(key);
    }
    stage.innerHTML = '<div class="v3-check__top"><p class="wc-eyebrow">' + meta.eyebrow + '</p><div class="v3-progress" aria-label="Fortschritt"><span style="width:' + Math.round(((state.step + 1) / steps.length) * 100) + '%"></span></div></div><h1 class="wc-h1" id="v3-question-title" tabindex="-1">' + escapeHtml(meta.title) + '</h1><p class="wc-lead v3-question-hint">' + escapeHtml(meta.hint) + '</p><div class="v3-question-body">' + body + '</div><p class="v3-error" id="v3-error" role="alert"></p><div class="wc-btn-row v3-nav"><button class="wc-btn wc-btn--secondary" type="button" id="v3-back"' + (state.step === 0 ? ' hidden' : '') + '>Zurück</button><button class="wc-btn wc-btn--primary" type="button" id="v3-next">' + (state.step === steps.length - 1 ? "Wirkungsreport erstellen" : "Weiter") + '</button></div>';
    bindQuestion(options, multi, key);
  }
  function updateChoice(key, id, options, multi) {
    if (!multi) { state.answers[key] = id; }
    else {
      var current = state.answers[key].slice();
      var choice = item(options, id);
      if (current.indexOf(id) !== -1) current = current.filter(function (x) { return x !== id; });
      else if (choice && choice.exclusive) current = [id];
      else { current = current.filter(function (x) { var val = item(options, x); return !(val && val.exclusive); }); current.push(id); }
      var limits = { bottlenecks: 2, redLines: 2, signals: 3, conditions: 2 };
      if (current.length > limits[key]) { say("Bitte wählen Sie höchstens " + limits[key] + " Optionen."); return; }
      state.answers[key] = current;
    }
    if (key === "topic") {
      state.answers.goal = null; state.answers.approach = null; state.answers.bottlenecks = []; state.answers.redLines = []; state.answers.signals = []; state.answers.conditions = [];
    }
    save();
    renderQuestion();
  }
  function bindQuestion(options, multi, key) {
    stage.querySelectorAll("[data-choice]").forEach(function (button) { button.addEventListener("click", function () { updateChoice(key, button.dataset.choice, options, multi); }); });
    var note = $("#v3-regional-note");
    if (note) note.addEventListener("input", function () { state.answers.regionalNote = note.value; save(); });
    $("#v3-back").addEventListener("click", function () { state.step -= 1; save(); renderQuestion(); stage.scrollIntoView({ block: "start", behavior: "smooth" }); });
    $("#v3-next").addEventListener("click", function () {
      if (!canContinue(key)) { $("#v3-error").textContent = "Bitte treffen Sie eine Auswahl, damit der nächste Schritt sinnvoll anschließen kann."; return; }
      if (key === "approach" || key === "bottlenecks" || key === "redLines" || key === "signals") track("impact_preview_seen");
      if (state.step === steps.length - 1) { state.step += 1; save(); setScreen("report"); track("report_completed"); return; }
      state.step += 1; save(); renderQuestion(); stage.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  }
  function districtSearch() {
    var input = $("#v3-district-input");
    var results = $("#v3-district-results");
    input.addEventListener("input", function () {
      var term = input.value.trim().toLocaleLowerCase("de");
      if (term.length < 2) { results.innerHTML = ""; return; }
      var hits = ((window.WC_DATA && window.WC_DATA.districts) || []).filter(function (district) { return [district.nr, district.name, district.land].concat(district.plz || []).join(" ").toLocaleLowerCase("de").indexOf(term) !== -1; }).slice(0, 8);
      results.innerHTML = hits.map(function (district) { return '<button type="button" class="v3-district" data-district="' + escapeHtml(district.nr) + '"><strong>' + escapeHtml(district.nr + " · " + district.name) + '</strong><span>' + escapeHtml(district.land) + '</span></button>'; }).join("") || '<p class="wc-meta">Kein Wahlkreis gefunden. Sie können auch ohne Wahlkreis fortfahren.</p>';
      results.querySelectorAll("[data-district]").forEach(function (button) { button.addEventListener("click", function () { state.district = button.dataset.district; save(); renderDistrict(); }); });
    });
  }
  function renderDistrict() {
    var current = state.district && ((window.WC_DATA && window.WC_DATA.districts) || []).filter(function (district) { return district.nr === state.district; })[0];
    $("#v3-district-selected").innerHTML = current ? '<strong>Ausgewählt: ' + escapeHtml(current.nr + " · " + current.name) + '</strong><button type="button" class="wc-btn wc-btn--link" id="v3-district-clear">Ändern</button>' : "";
    if (current) $("#v3-district-clear").addEventListener("click", function () { state.district = null; save(); renderDistrict(); $("#v3-district-input").focus(); });
  }
  function selectedDistrict() { return state.district && ((window.WC_DATA && window.WC_DATA.districts) || []).filter(function (district) { return district.nr === state.district; })[0]; }
  function dataNotice(report) {
    var gaps = report.signals.filter(function (signal) { return signal.status === "data_gap"; });
    return '<section class="v3-data-notice"><h3>Was die Daten hier leisten - und was nicht</h3><p>Die lokale Wahlkreisangabe ordnet nur Ihre Rückkopplung ein. Für diese Ausgabe werden keine regionalen Werte, Verläufe oder Prognosen gezeigt. ' + (gaps.length ? "Für mindestens ein gewähltes Signal ist zusätzlich eine Datenlücke dokumentiert. " : "Für die gewählten Signale sind ergänzende, fachlich geprüfte Daten nötig. ") + 'Eine beobachtete Veränderung wäre außerdem noch kein Beweis, dass gerade dieser Ansatz sie verursacht hat.</p></section>';
  }
  function instrumentCards(report) {
    var source = (window.WC_INSTRUMENTS && window.WC_INSTRUMENTS.instruments) || [];
    var selected = report.instrumentIds.map(function (id) { return source.filter(function (instrument) { return instrument.instrument_id === id; })[0]; }).filter(Boolean);
    return selected.length ? '<section class="v3-report-section"><p class="wc-eyebrow">Weiterführende Instrumente</p><h2 class="wc-h2">Zwei passende Vertiefungen</h2><div class="v3-instrument-grid">' + selected.map(function (instrument) { return '<article class="v3-instrument"><h3>' + escapeHtml(instrument.title) + '</h3><p>' + escapeHtml(instrument.short_explanation) + '</p><a href="' + escapeHtml(instrument.methodology_reference.href) + '">' + escapeHtml(instrument.methodology_reference.label) + '</a></article>'; }).join("") + '</div></section>' : "";
  }
  function reportHtml(report) {
    var mod = report.module;
    var district = selectedDistrict();
    var roleHtml = report.roles.length ? report.roles.map(function (role) { return '<article class="v3-role"><h3>' + escapeHtml(role.title) + '</h3><p>' + escapeHtml(role.text) + '</p></article>'; }).join("") : '<p>Vor einer Priorisierung ist der begrenzende Faktor genauer zu klären.</p>';
    return '<section class="v3-report-hero"><p class="wc-eyebrow">Ihr persönlicher Wirkungsreport</p><h1 class="wc-h1">' + escapeHtml(mod.title) + ': vom politischen Ansatz zur überprüfbaren Veränderung</h1><p class="wc-lead">Dies ist keine Bewertung Ihrer Person, Partei oder Fraktion. Der Report dokumentiert Ihre gewählten Prüfschritte und zeigt, was sie fachlich als Nächstes verlangen.</p><div class="v3-report-actions"><button type="button" class="wc-btn wc-btn--primary" id="v3-share">Report teilen</button><button type="button" class="wc-btn wc-btn--secondary" id="v3-download">Report speichern</button><button type="button" class="wc-btn wc-btn--link" id="v3-new">Neuen Check beginnen</button></div></section><section class="v3-report-section"><p class="wc-eyebrow">1 · Ziel und Ansatz</p><h2 class="wc-h2">Was Sie prüfen</h2><dl class="v3-summary"><div><dt>Zielzustand</dt><dd>' + escapeHtml(report.goal.label) + '</dd></div><div><dt>Gewählter Ansatz</dt><dd>' + escapeHtml(report.approach.label) + '</dd></div><div><dt>Wahlkreis als Rückkopplung</dt><dd>' + escapeHtml(district ? district.nr + " · " + district.name : "Keine regionale Angabe") + '</dd></div></dl></section><section class="v3-report-section"><p class="wc-eyebrow">2 · Wirklogik</p><h2 class="wc-h2">Der abgeleitete Wirkpfad</h2><p class="wc-muted">Der Wirkpfad ist eine überprüfbare Annahme über den Weg der Entscheidung - keine Prognose und kein Kausalitätsnachweis.</p><ol class="v3-path">' + report.path.map(function (point) { return '<li><strong>' + escapeHtml(point.title) + '</strong><span>' + escapeHtml(point.text) + '</span></li>'; }).join("") + '</ol><div class="v3-fit v3-fit--' + escapeHtml(report.fit.kind) + '"><strong>Passung von Ansatz und Engpass: ' + (report.fit.kind === "direct" ? "unmittelbar" : report.fit.kind === "partial" ? "teilweise" : "noch offen") + '</strong><p>' + escapeHtml(report.fit.text) + '</p></div></section><section class="v3-report-section"><p class="wc-eyebrow">3 · Bundesebene</p><h2 class="wc-h2">Welche Rolle ist zuerst gefragt?</h2><div class="v3-role-grid">' + roleHtml + '</div></section><section class="v3-report-section"><p class="wc-eyebrow">4 · Schutz und Korrektur</p><h2 class="wc-h2">Was darf nicht verdeckt werden?</h2>' + (report.redLines.length ? '<ul class="v3-redlines">' + report.redLines.map(function (line) { return '<li><strong>' + escapeHtml(line.label) + '</strong><span>' + escapeHtml(line.detail) + '</span></li>'; }).join("") + '</ul>' : '<p>Sie haben keine rote Linie ausgewählt. Vor einer konkreten Ausgestaltung sollte dennoch geprüft werden, welche Schutzgüter nicht gegen andere Fortschritte aufgerechnet werden dürfen.</p>') + '<div class="v3-correction"><h3>Konkreter Korrekturpunkt</h3><p>' + escapeHtml(report.correction) + '</p></div></section><section class="v3-report-section"><p class="wc-eyebrow">5 · Evidenz</p><h2 class="wc-h2">Woran sich Erfolg prüfen lässt</h2><ul class="v3-signals">' + (report.signals.length ? report.signals.map(function (signal) { return '<li><span>' + escapeHtml(signal.label) + '</span><small>' + (signal.status === "data_gap" ? "Datenlücke: keine Kurve oder quantitative Aussage" : "Ergänzende, fachlich geprüfte Daten erforderlich") + '</small></li>'; }).join("") : '<li>Vor einer Ausweitung ein überprüfbares Erfolgssignal festlegen.</li>') + '</ul>' + dataNotice(report) + '</section>' + instrumentCards(report) + '<section class="v3-report-section v3-ai"><p class="wc-eyebrow">Freiwillige KI-Vertiefung</p><h2 class="wc-h2">Den Report mit der WÖK-KI weiterdenken</h2><p>Auf Wunsch kann die WÖK-KI aus diesem Report eine persönliche Arbeitsnotiz mit offenen Annahmen, Prüfaufträgen und weiterführenden Quellen erstellen. Sie erhält nur die von Ihnen freigegebenen Check-Angaben - keine Partei, Fraktion, E-Mail-Adresse oder CiviCRM-ID.</p><label class="v3-consent"><input type="checkbox" id="v3-ai-consent"> <span>Ich willige ein, die in diesem Report gezeigten Angaben einmalig an die WÖK-KI zu übermitteln.</span></label><button type="button" class="wc-btn wc-btn--primary" id="v3-ai-start" aria-disabled="true">KI-Auswertung anfordern</button><p class="wc-meta" id="v3-ai-status"></p><div id="v3-ai-result"></div></section><section class="v3-report-section v3-why"><button type="button" class="wc-btn wc-btn--link" id="v3-why">Warum sehe ich dieses Ergebnis?</button><div id="v3-why-copy" hidden><p>Die Ableitung ist deterministisch: Thema, Ziel, Ansatz, begrenzende Faktoren, rote Linien und Erfolgssignale werden mit der offen gelegten Modulversion <code>' + escapeHtml(mod.version) + '</code> verbunden. Sie bewertet weder Personen noch Parteien. <a href="../../wirkungssteuerung/">Mehr zur Wirkungsökonomie</a>' + mod.links.map(function (link) { return ' · <a href="' + escapeHtml(link.href) + '">' + escapeHtml(link.label) + '</a>'; }).join("") + '.</p></div></section>';
  }
  function renderReport() {
    var report = RULES.derive(module(), state.answers);
    document.getElementById("v3-report").innerHTML = reportHtml(report);
    $("#v3-share").addEventListener("click", function () { share(); });
    $("#v3-download").addEventListener("click", function () { download(report); });
    $("#v3-new").addEventListener("click", reset);
    $("#v3-why").addEventListener("click", function () { var copy = $("#v3-why-copy"); copy.hidden = !copy.hidden; track("why_opened"); });
    $("#v3-ai-consent").addEventListener("change", function (event) { $("#v3-ai-start").setAttribute("aria-disabled", event.target.checked ? "false" : "true"); });
    $("#v3-ai-start").addEventListener("click", function () { if ($("#v3-ai-start").getAttribute("aria-disabled") === "true") return; requestAi(report); });
  }
  function portable() { return { v: "3", a: { topic: state.answers.topic, goal: state.answers.goal, approach: state.answers.approach, bottlenecks: state.answers.bottlenecks, redLines: state.answers.redLines, signals: state.answers.signals, regional: state.answers.regional, conditions: state.answers.conditions } }; }
  function encoded() { return btoa(unescape(encodeURIComponent(JSON.stringify(portable())))); }
  function shareUrl() { return location.origin + location.pathname + "#report=" + encoded(); }
  function share() {
    var url = shareUrl();
    if (navigator.share) navigator.share({ title: "Wirkungsreport Bundestag", text: "Mein persönlicher Wirkungsreport aus dem Wirkungscheck Bundestag", url: url }).catch(function () {});
    else navigator.clipboard.writeText(url).then(function () { say("Der Link zum Report wurde in die Zwischenablage kopiert."); }, function () { prompt("Kopieren Sie diesen Link:", url); });
  }
  function download(report) {
    var payload = { reportVersion: "3.0.0", createdAt: new Date().toISOString(), choices: portable().a, derivation: { goal: report.goal.label, approach: report.approach.label, fit: report.fit, correction: report.correction, signals: report.signals.map(function (signal) { return { label: signal.label, dataStatus: signal.status }; }) } };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "wirkungsreport-bundestag-v3.json"; link.click(); URL.revokeObjectURL(link.href);
  }
  function requestAi(report) {
    var button = $("#v3-ai-start"), status = $("#v3-ai-status"), target = $("#v3-ai-result");
    button.setAttribute("aria-disabled", "true"); status.textContent = "Die WÖK-KI erstellt die Auswertung …"; track("ki_started");
    if (!window.WoekAiClient) { status.textContent = "Die WÖK-KI ist in dieser Umgebung noch nicht erreichbar."; return; }
    var context = { source: "wirkungscheck-bundestag-v3", moduleVersion: report.module.version, topic: report.module.title, goal: report.goal.label, approach: report.approach.label, fit: report.fit.text, redLines: report.redLines.map(function (line) { return line.label; }), signals: report.signals.map(function (signal) { return signal.label; }), correction: report.correction, regionalFeedback: state.answers.regional, regionalNote: state.answers.regionalNote || undefined };
    window.WoekAiClient.askWoek({ question: "Erstelle eine knappe, sachliche Arbeitsnotiz für die parlamentarische Weiterarbeit. Trenne Wirkungspotenzial, offene Annahmen, Datenbedarf, Schutzrisiken und nächsten Prüfschritt. Behaupte keine gemessene Wirkung und gib keine Partei- oder Personenbewertung ab.", context: context }).then(function (payload) {
      var answer = payload.answer || payload.text || payload.result || "Die KI hat keine lesbare Auswertung geliefert.";
      target.innerHTML = '<article class="v3-ai-result"><h3>Persönliche KI-Auswertung</h3><p>' + escapeHtml(answer).replace(/\n/g, "<br>") + '</p></article>'; status.textContent = "Fertig. Sie können den Report jetzt teilen oder speichern.";
    }).catch(function () { status.textContent = "Die KI-Auswertung ist derzeit nicht verfügbar. Ihr lokaler Report bleibt erhalten."; button.setAttribute("aria-disabled", "false"); });
  }
  function reset() { localStorage.removeItem(STORE); state = { step: 0, district: null, answers: { topic: null, goal: null, approach: null, bottlenecks: [], redLines: [], signals: [], regional: null, regionalNote: "", conditions: [] } }; history.replaceState(null, "", location.pathname); setScreen("landing"); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function beginCheck() { state.step = 0; save(); setScreen("check"); track("landing_started"); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function start() { setScreen("district"); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function loadShared() {
    var match = location.hash.match(/^#report=([^&]+)$/); if (!match) return false;
    try {
      var payload = JSON.parse(decodeURIComponent(escape(atob(match[1]))));
      if (!payload || !payload.a || !DATA.modules[payload.a.topic]) return false;
      /* Ein geteilter Link enthält bewusst keine Freitextnotiz, keine
       * Wahlkreisangabe und keine weitere lokale Vorgeschichte. */
      state.district = null;
      state.answers = Object.assign({ regionalNote: "" }, payload.a);
      state.step = steps.length;
      setScreen("report");
      return true;
    } catch (error) { return false; }
  }
  function init() {
    restore();
    $("#v3-start").addEventListener("click", start);
    $("#v3-example").addEventListener("click", function () { state.answers = { topic: "housing", goal: "access", approach: "use_existing", bottlenecks: ["rules", "data"], redLines: ["cost", "displacement"], signals: ["access", "cost_burden"], regional: "mixed", regionalNote: "", conditions: ["data", "cooperation"] }; state.step = steps.length; save(); setScreen("report"); });
    $("#v3-district-next").addEventListener("click", function () { save(); beginCheck(); });
    $("#v3-district-skip").addEventListener("click", beginCheck);
    $("#v3-open-district").addEventListener("click", function () { setScreen("district"); window.scrollTo({ top: 0, behavior: "smooth" }); });
    districtSearch(); renderDistrict(); if (!loadShared()) setScreen("landing");
  }
  document.addEventListener("DOMContentLoaded", init);
})();
