/* Stranded-Asset-Rechner (Modellrechnung v1)
   Läuft vollständig lokal im Browser, überträgt keine Daten.
   Parameter: assets/data/stranded-assets-parameter.json (Modellannahmen, keine Marktdaten). */
(function () {
  "use strict";

  const root = document.querySelector("[data-stranded-rechner]");
  if (!root) return;

  const tabButtons = Array.from(root.querySelectorAll("[data-sa-tab]"));
  const panels = Array.from(root.querySelectorAll("[data-sa-panel]"));
  const scenarioInputs = Array.from(root.querySelectorAll("[data-sa-szenario] input"));
  const scenarioNote = root.querySelector("[data-sa-szenario-note]");
  const assumptionsBox = root.querySelector("[data-sa-annahmen]");

  let params = null;
  let scenario = "mittel";

  const dataUrl = root.getAttribute("data-parameter-url") || "../assets/data/stranded-assets-parameter.json";

  fetch(dataUrl)
    .then((res) => {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then((json) => {
      params = json;
      init();
    })
    .catch(() => {
      root.querySelectorAll("[data-sa-ergebnis]").forEach((el) => {
        el.innerHTML = '<div class="card"><p class="card-text">Die Modellparameter konnten nicht geladen werden. Bitte Seite neu laden.</p></div>';
      });
    });

  function init() {
    buildUnternehmenFragen();
    renderAnnahmen();
    updateScenarioNote();

    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        tabButtons.forEach((b) => b.setAttribute("aria-selected", b === btn ? "true" : "false"));
        panels.forEach((p) => {
          p.hidden = p.getAttribute("data-sa-panel") !== btn.getAttribute("data-sa-tab");
        });
        recalcAll();
      });
    });

    scenarioInputs.forEach((input) => {
      input.addEventListener("change", () => {
        scenario = input.value;
        updateScenarioNote();
        recalcAll();
      });
    });

    root.querySelectorAll("[data-sa-auto] select, [data-sa-auto] input").forEach((el) => {
      el.addEventListener("input", rechneAuto);
      el.addEventListener("change", rechneAuto);
    });
    root.querySelectorAll("[data-sa-haus] select").forEach((el) =>
      el.addEventListener("change", rechneHaus)
    );
    root.querySelectorAll("[data-sa-unternehmen]").forEach((el) =>
      el.addEventListener("change", rechneUnternehmen)
    );

    recalcAll();
  }

  function updateScenarioNote() {
    if (!scenarioNote || !params) return;
    const s = params.szenarien[scenario];
    scenarioNote.textContent = s ? s.beschreibung : "";
  }

  function faktor() {
    return params.szenarien[scenario] ? params.szenarien[scenario].faktor : 1;
  }

  function recalcAll() {
    rechneAuto();
    rechneHaus();
    rechneUnternehmen();
  }

  function stufenBadge(label, klasse) {
    return '<span class="prototype-badge sa-stufe sa-stufe--' + klasse + '">Strandungsrisiko: ' + label + "</span>";
  }

  function korridorText(mitte, breite) {
    const von = Math.max(0, Math.round(mitte * (1 - breite)));
    const bis = Math.round(mitte * (1 + breite));
    return von + "-" + bis + " %";
  }

  /* ---------- Auto ---------- */
  function rechneAuto() {
    if (!params) return;
    const box = root.querySelector("[data-sa-auto]");
    const out = root.querySelector('[data-sa-ergebnis="auto"]');
    if (!box || !out) return;

    const antrieb = box.querySelector('[name="sa-auto-antrieb"]').value;
    const alter = Number(box.querySelector('[name="sa-auto-alter"]').value) || 0;
    const halte = Number(box.querySelector('[name="sa-auto-haltedauer"]').value) || 1;
    const km = Number(box.querySelector('[name="sa-auto-km"]').value) || 0;

    const a = params.auto.antriebe[antrieb];
    if (!a) return;

    let pa = a.zusatzabschlag_prozentpunkte_pro_jahr * faktor();
    if (alter >= params.auto.alters_daempfung.ab_jahren) pa *= params.auto.alters_daempfung.faktor;
    const gesamt = pa * halte;

    const g = params.auto.stufen_grenzen_prozent;
    const stufe = gesamt <= g.niedrig_bis ? ["Niedrig", "gruen"] : gesamt <= g.mittel_bis ? ["Mittel", "gelb"] : ["Hoch", "rot"];

    const mehrkostenJahr = Math.round((a.mehrkosten_cent_pro_km * faktor() * km) / 100);

    out.innerHTML =
      stufenBadge(stufe[0], stufe[1]) +
      '<p class="card-text"><strong>Zusatzrisiko gegenüber normaler Abnutzung:</strong> Korridor von ' +
      korridorText(gesamt, params.auto.korridor_breite) +
      " des heutigen Fahrzeugwerts über deine Haltedauer von " + halte + " Jahren (Szenario „" + params.szenarien[scenario].label + "“).</p>" +
      '<p class="card-text"><strong>Laufende Mehrkosten im Modell:</strong> in der Größenordnung von ' +
      mehrkostenJahr + " Euro pro Jahr bei " + km.toLocaleString("de-DE") + " km (steigende Einpreisung von Folgekosten).</p>" +
      '<p class="card-text sa-disclaimer">Modellrechnung v1 - illustriert die Logik, ersetzt keine Bewertung deines konkreten Fahrzeugs.</p>';
  }

  /* ---------- Haus ---------- */
  function rechneHaus() {
    if (!params) return;
    const box = root.querySelector("[data-sa-haus]");
    const out = root.querySelector('[data-sa-ergebnis="haus"]');
    if (!box || !out) return;

    const h = params.haus;
    const heizung = box.querySelector('[name="sa-haus-heizung"]').value;
    const klasse = box.querySelector('[name="sa-haus-klasse"]').value;
    const stand = box.querySelector('[name="sa-haus-stand"]').value;

    const beitraege = {
      heizung: h.heizung[heizung].punkte,
      effizienzklasse: h.effizienzklasse[klasse].punkte,
      sanierungsstand: h.sanierungsstand[stand].punkte
    };
    const punkte = (beitraege.heizung + beitraege.effizienzklasse + beitraege.sanierungsstand) * faktor();

    const g = h.stufen_grenzen_punkte;
    const stufe =
      punkte <= g.niedrig_bis ? ["Niedrig", "gruen"] :
      punkte <= g.mittel_bis ? ["Mittel", "gelb"] :
      punkte <= g.erhoeht_bis ? ["Erhöht", "gelb"] : ["Hoch", "rot"];

    const korridorMitte = punkte * h.wertkorridor_prozent_pro_punkt;
    const hebelKey = Object.keys(beitraege).reduce((a, b) => (beitraege[b] > beitraege[a] ? b : a));
    const hebelText = beitraege[hebelKey] > 0 ? h.hebel_texte[hebelKey] : "Dein Gebäude ist im Modell bereits gut aufgestellt - kein einzelner Hebel dominiert.";

    out.innerHTML =
      stufenBadge(stufe[0], stufe[1]) +
      '<p class="card-text"><strong>Wertkorridor im Modell:</strong> mögliche Belastung von ' +
      korridorText(korridorMitte, h.korridor_breite) +
      " des heutigen Werts, wenn Folgekosten im Szenario „" + params.szenarien[scenario].label + "“ eingepreist werden.</p>" +
      '<p class="card-text"><strong>Größter Hebel:</strong> ' + hebelText + "</p>" +
      '<p class="card-text sa-disclaimer">Modellrechnung v1 - kein Gutachten und keine Immobilienbewertung.</p>';
  }

  /* ---------- Unternehmen ---------- */
  function buildUnternehmenFragen() {
    const wrap = root.querySelector("[data-sa-unternehmen]");
    if (!wrap || !params) return;
    wrap.innerHTML = params.unternehmen.fragen
      .map(function (f, i) {
        const options = f.antworten
          .map(function (a, j) {
            return '<option value="' + a.punkte + '"' + (j === 0 ? " selected" : "") + ">" + a.label + "</option>";
          })
          .join("");
        return (
          '<label class="control-label" for="sa-u-' + f.id + '">' + (i + 1) + ". " + f.text +
          '<select id="sa-u-' + f.id + '" data-sa-feld="' + f.feld + '">' + options + "</select></label>"
        );
      })
      .join("");
  }

  function rechneUnternehmen() {
    if (!params) return;
    const wrap = root.querySelector("[data-sa-unternehmen]");
    const out = root.querySelector('[data-sa-ergebnis="unternehmen"]');
    if (!wrap || !out) return;

    const selects = Array.from(wrap.querySelectorAll("select"));
    if (!selects.length) return;

    let maxPunkte = 0;
    let schwaechstesFeld = "";
    selects.forEach(function (sel) {
      const p = Number(sel.value);
      if (p >= maxPunkte) {
        maxPunkte = p;
        if (p > 0) schwaechstesFeld = sel.getAttribute("data-sa-feld");
      }
    });

    let effektiv = maxPunkte;
    if (scenario === "streng" && maxPunkte > 0) {
      effektiv = Math.min(3, maxPunkte + params.unternehmen.szenario_verschaerfung.streng_zuschlag_punkte);
    }
    const stufenKey = String(Math.min(3, Math.round(effektiv)));
    const stufe = params.unternehmen.stufen[stufenKey];

    out.innerHTML =
      stufenBadge(stufe.label, stufe.klasse) +
      '<p class="card-text">' + stufe.text + "</p>" +
      (schwaechstesFeld
        ? '<p class="card-text"><strong>Dein schwächstes Feld:</strong> ' + schwaechstesFeld +
          ". Nach der Schwächstes-Feld-Logik der Wirkungsökonomie bestimmt es das Gesamtrisiko - gute Werte an anderer Stelle rechnen es nicht weg.</p>"
        : "") +
      '<p class="card-text sa-disclaimer">Modellrechnung v1 - ein Schnellcheck der Risikologik, keine Unternehmensbewertung.</p>';
  }

  /* ---------- Annahmen-Panel ---------- */
  function renderAnnahmen() {
    if (!assumptionsBox || !params) return;
    const s = params.szenarien;
    const a = params.auto.antriebe;
    const rows = Object.keys(a)
      .map(function (k) {
        return "<li>" + a[k].label + ": Zusatzabschlag " + a[k].zusatzabschlag_prozentpunkte_pro_jahr +
          " Prozentpunkte/Jahr, Mehrkosten " + a[k].mehrkosten_cent_pro_km + " ct/km (jeweils × Szenariofaktor)</li>";
      })
      .join("");
    assumptionsBox.innerHTML =
      "<p>" + params.hinweis + "</p>" +
      "<ul>" +
      "<li>Szenariofaktoren: moderat " + s.moderat.faktor + " · mittel " + s.mittel.faktor + " · streng " + s.streng.faktor + "</li>" +
      rows +
      "<li>Haus: " + params.haus.wertkorridor_prozent_pro_punkt + " % Wertkorridor je Risikopunkt (Heizung, Effizienzklasse, Sanierungsstand), Korridorbreite ±" + Math.round(params.haus.korridor_breite * 100) + " %</li>" +
      "<li>Unternehmen: " + params.unternehmen.logik + "</li>" +
      "</ul>";
  }
})();
