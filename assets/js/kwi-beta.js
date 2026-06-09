(function () {
  const root = document.querySelector("[data-kwi-beta]");
  if (!root) return;

  const manifestUrl = root.getAttribute("data-manifest");
  const dataBase = root.getAttribute("data-base") || "";
  const liveApi = root.getAttribute("data-live-api") || "";
  const form = root.querySelector("[data-kwi-form]");
  const input = root.querySelector("[data-kwi-input]");
  const datalist = root.querySelector("[data-kwi-options]");
  const status = root.querySelector("[data-kwi-status]");
  const result = root.querySelector("[data-kwi-result]");
  const progress = root.querySelector("[data-kwi-progress]");
  const progressTitle = root.querySelector("[data-kwi-progress-title]");
  const progressText = root.querySelector("[data-kwi-progress-text]");
  const submitButton = form.querySelector("button[type='submit']");
  const tableBody = document.querySelector("[data-kwi-table]");
  const dimensionFilter = document.querySelector("[data-kwi-dimension-filter]");

  const state = {
    manifest: null,
    snapshot: null,
    dimension: "Alle",
    progressTimers: [],
  };

  const nf = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 });
  const percentFormat = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0, style: "percent" });
  const DIMENSIONS = ["Mensch", "Planet", "Demokratie"];
  const CHART_COLORS = {
    MPD: "#111827",
    Mensch: "#2f6f73",
    Planet: "#6f8f3a",
    Demokratie: "#8a5a82",
    Ideal: "#26333d",
  };
  const DEMOCRACY_DATA_CONCEPT = [
    "SDG 16: Straftaten, kommunale Finanzlage und institutionelle Handlungsfähigkeit als erste harte Proxywerte",
    "Wahlstatistik: Wahlbeteiligung, ungültige Stimmen und Beteiligungstrends aus Bundes-, Landes- und Kommunalwahldaten",
    "Transparenz: Ratsinformationen, OParl, offene Haushaltsdaten, Open-Data-Reife, Vergaben und Beschwerdewege",
    "Rechtsstaatlicher Zugang: Nähe zu Amtsgericht, Verfahrensdauer im Gerichtsbezirk, Beratungshilfe und Verwaltungsfairness",
    "SDG+ Zusatzmodule: lokale Medienvielfalt, Zivilgesellschaft, Beteiligungswirksamkeit, Vertrauen und digitale Selbstbestimmung",
  ];

  function setStatus(message, isError) {
    if (!status) return;
    status.textContent = message || "";
    status.classList.toggle("is-error", Boolean(isError));
  }

  function setBusy(isBusy) {
    if (submitButton) submitButton.disabled = Boolean(isBusy);
    if (input) input.setAttribute("aria-busy", isBusy ? "true" : "false");
  }

  function updateProgress(title, message) {
    if (!progress) return;
    if (progressTitle) progressTitle.textContent = title;
    if (progressText) progressText.textContent = message;
  }

  function showProgress(title, message, steps) {
    if (!progress) return;
    state.progressTimers.forEach((timer) => window.clearTimeout(timer));
    state.progressTimers = [];
    updateProgress(title, message);
    progress.hidden = false;
    steps.forEach((step) => {
      const timer = window.setTimeout(() => updateProgress(step.title, step.message), step.after);
      state.progressTimers.push(timer);
    });
  }

  function hideProgress() {
    state.progressTimers.forEach((timer) => window.clearTimeout(timer));
    state.progressTimers = [];
    if (progress) progress.hidden = true;
  }

  function byScoreAsc(a, b) {
    return (a.score ?? 999) - (b.score ?? 999);
  }

  function byScoreDesc(a, b) {
    return (b.score ?? -999) - (a.score ?? -999);
  }

  function formatValue(item) {
    if (item.value === null || item.value === undefined) return "-";
    return `${nf.format(item.value)}${item.unit ? ` ${item.unit}` : ""}`;
  }

  function scoreClass(score) {
    if (score === null || score === undefined) return "kwi-muted";
    if (score >= 65) return "kwi-good";
    if (score >= 40) return "kwi-mid";
    return "kwi-risk";
  }

  function scoreText(score) {
    return score === null || score === undefined ? "-" : nf.format(score);
  }

  function dimensionName(name) {
    return name === "Demokratie" ? "Demokratie (SDG+ Proxy)" : name;
  }

  function clip(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function scoreIndicatorValue(value, indicator) {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) return null;
    const average = Number(indicator.stateAverage);
    let base = 50;
    if (average && Number.isFinite(average)) {
      let relative = (Number(value) - average) / Math.abs(average);
      if (indicator.direction === "niedriger_ist_besser") relative = -relative;
      base = 50 + relative * 35;
    }
    return Math.round(clip(base, 0, 100) * 10) / 10;
  }

  function buildDimensionHistory(snapshot) {
    const years = Array.from(new Set(snapshot.indicators.flatMap((indicator) => {
      return (indicator.timeseries || []).map((point) => point.year);
    }))).filter(Boolean).sort((a, b) => a - b);

    const series = {};
    DIMENSIONS.forEach((dimension) => {
      series[dimension] = years.map((year) => {
        const values = [];
        snapshot.indicators.forEach((indicator) => {
          if (indicator.dimension !== dimension) return;
          const point = (indicator.timeseries || []).find((item) => item.year === year);
          const score = point ? scoreIndicatorValue(point.value, indicator) : null;
          if (score !== null) values.push(score);
        });
        if (!values.length) return { year, value: null, count: 0 };
        const value = values.reduce((sum, item) => sum + item, 0) / values.length;
        return { year, value: Math.round(value * 10) / 10, count: values.length };
      });
    });

    const weights = snapshot.method?.weights || {};
    series.MPD = years.map((year, index) => {
      let weighted = 0;
      let usedWeights = 0;
      DIMENSIONS.forEach((dimension) => {
        const point = series[dimension][index];
        const weight = Number(weights[dimension] ?? 1);
        if (!point || point.value === null || !Number.isFinite(weight) || weight <= 0) return;
        weighted += point.value * weight;
        usedWeights += weight;
      });
      if (!usedWeights) return { year, value: null, count: 0 };
      return {
        year,
        value: Math.round((weighted / usedWeights) * 10) / 10,
        count: DIMENSIONS.filter((dimension) => series[dimension][index]?.value !== null).length,
      };
    });

    return { years, series };
  }

  function seriesDelta(history, dimension) {
    const points = (history.series[dimension] || []).filter((point) => point.value !== null);
    if (points.length < 2) return null;
    return Math.round((points[points.length - 1].value - points[0].value) * 10) / 10;
  }

  function trendLabel(delta) {
    if (delta === null || delta === undefined) return "ohne belastbaren Verlauf";
    if (delta >= 4) return `steigend (+${nf.format(delta)} Punkte)`;
    if (delta <= -4) return `fallend (${nf.format(delta)} Punkte)`;
    return `weitgehend stabil (${delta > 0 ? "+" : ""}${nf.format(delta)} Punkte)`;
  }

  function coverageText(snapshot) {
    const total = snapshot.summary.indicatorCount || 0;
    const scored = snapshot.summary.scoredIndicatorCount || 0;
    if (!total) return "keine berechenbare Abdeckung";
    return `${scored} von ${total} Indikatoren (${percentFormat.format(scored / total)})`;
  }

  function availableSnapshotsText() {
    const items = state.manifest?.municipalities || [];
    if (!items.length) return "";
    return ` Vorbereitete Snapshots: ${items.map((item) => item.name).join(", ")}.`;
  }

  function liveUnavailableMessage(name) {
    return `Für "${name}" gibt es in dieser öffentlichen Beta noch keinen vorbereiteten Snapshot. Die Live-Erzeugung für weitere Kommunen ist technisch vorbereitet, aber auf der statischen GitHub-Pages-Seite noch nicht aktiv. Dafür braucht es als nächsten Schritt einen Backend- oder Serverless-Endpunkt, der SDG-Bereich-Daten abruft, einen Snapshot erzeugt und zwischenspeichert.${availableSnapshotsText()}`;
  }

  function clearRenderedResult() {
    state.snapshot = null;
    result.innerHTML = "";
    if (tableBody) tableBody.innerHTML = "";
    if (dimensionFilter) dimensionFilter.innerHTML = "";
  }

  function findMunicipality(query) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return state.manifest.municipalities[0];
    const exact = state.manifest.municipalities.find((item) => {
      return item.name.toLowerCase() === normalized || item.slug.toLowerCase() === normalized;
    });
    if (exact) return exact;
    return state.manifest.municipalities.find((item) => {
      return item.name.toLowerCase().includes(normalized) || item.slug.toLowerCase().includes(normalized);
    }) || null;
  }

  async function loadJson(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  async function loadLiveSnapshot(query) {
    if (!liveApi) throw new Error("no-live-api");
    const separator = liveApi.includes("?") ? "&" : "?";
    const response = await fetch(`${liveApi}${separator}q=${encodeURIComponent(query)}`, { cache: "no-store" });
    if (!response.ok) {
      let detail = `HTTP ${response.status}`;
      try {
        const payload = await response.json();
        detail = payload.message || payload.detail || detail;
      } catch (error) {
        // Keep the HTTP status as fallback when the endpoint is not active yet.
      }
      throw new Error(detail);
    }
    return response.json();
  }

  function renderDimensionControls(snapshot) {
    if (!dimensionFilter) return;
    const dimensions = ["Alle"].concat(Object.keys(snapshot.summary.dimensions));
    dimensionFilter.innerHTML = dimensions.map((dimension) => {
      const active = dimension === state.dimension ? " aria-pressed=\"true\"" : "";
      return `<button type="button" class="kwi-chip" data-dimension="${dimension}"${active}>${dimension}</button>`;
    }).join("");
  }

  function renderSummary(snapshot) {
    const summary = snapshot.summary;
    const history = buildDimensionHistory(snapshot);
    const dimensions = Object.entries(summary.dimensions).map(([name, item]) => {
      const score = item.score ?? 0;
      const proxyBadge = name === "Demokratie" ? '<span class="kwi-proxy-badge">SDG+ Proxy</span>' : "";
      const dimensionNote = name === "Demokratie"
        ? '<p class="kwi-dimension-note">Noch keine vollständige SDG+-Demokratiewertung. Aktuell nur verfügbare Proxy-Indikatoren.</p>'
        : "";
      return `
        <article class="kwi-dimension">
          <p class="card-kicker">${name}${proxyBadge}</p>
          <div class="kwi-dimension-head">
            <strong>${scoreText(item.score)}</strong>
            <span>${item.indicatorCount} Werte</span>
          </div>
          <div class="kwi-meter" aria-hidden="true"><span class="${scoreClass(item.score)}" style="width:${Math.max(2, Math.min(100, score))}%"></span></div>
          ${dimensionNote}
        </article>
      `;
    }).join("");

    const quality = summary.qualityCounts || {};
    const gaps = snapshot.indicators.filter((item) => item.score !== null && item.score !== undefined).sort(byScoreAsc).slice(0, 5);
    const strengths = snapshot.indicators.filter((item) => item.score !== null && item.score !== undefined).sort(byScoreDesc).slice(0, 5);

    result.innerHTML = `
      <section class="kwi-result-head" aria-label="KWI Ergebnis">
        <div>
          <p class="hero-kicker">KWI Beta · ${snapshot.method.name}</p>
          <h2>${snapshot.municipality.name}</h2>
          <p class="kwi-source-line">Quelle: ${snapshot.source.name}, Snapshot ${new Date(snapshot.generatedAt).toLocaleDateString("de-DE")}</p>
        </div>
        <div class="kwi-score ${scoreClass(summary.kwiScore)}">
          <span>KWI</span>
          <strong>${scoreText(summary.kwiScore)}</strong>
          <small>0-100</small>
        </div>
      </section>
      <section class="kwi-dimensions" aria-label="Dimensionen">${dimensions}</section>
      <section class="kwi-quality" aria-label="Datenqualität">
        <span><strong>${summary.scoredIndicatorCount}</strong> berechnete Indikatoren</span>
        <span><strong>${quality.hoch || 0}</strong> hoch</span>
        <span><strong>${quality.mittel || 0}</strong> mittel</span>
        <span><strong>${quality.niedrig || 0}</strong> niedrig</span>
      </section>
      ${renderTrendChart(snapshot, history)}
      ${renderDemocracyConcept()}
      ${renderInterpretation(snapshot, history, gaps, strengths)}
      <section class="kwi-signal-grid">
        <div>
          <h3>Größte Wirkungslücken</h3>
          ${renderSignalList(gaps)}
        </div>
        <div>
          <h3>Stärkere Ausgangslagen</h3>
          ${renderSignalList(strengths)}
        </div>
      </section>
    `;
  }

  function renderTrendChart(snapshot, history) {
    if (!history.years.length) return "";

    const width = 760;
    const height = 320;
    const margin = { top: 24, right: 34, bottom: 46, left: 48 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const years = history.years;
    const xFor = (index) => margin.left + (years.length <= 1 ? innerWidth : (index / (years.length - 1)) * innerWidth);
    const yFor = (value) => margin.top + (1 - value / 100) * innerHeight;
    const idealPoints = years.map((year, index) => {
      const progress = years.length <= 1 ? 1 : index / (years.length - 1);
      return { year, value: Math.round((55 + progress * 25) * 10) / 10 };
    });
    const pathFor = (points) => points.map((point) => `${xFor(years.indexOf(point.year)).toFixed(1)},${yFor(point.value).toFixed(1)}`).join(" ");
    const grid = [0, 25, 50, 75, 100].map((value) => `
      <g class="kwi-chart-gridline">
        <line x1="${margin.left}" y1="${yFor(value).toFixed(1)}" x2="${width - margin.right}" y2="${yFor(value).toFixed(1)}"></line>
        <text x="${margin.left - 10}" y="${(yFor(value) + 4).toFixed(1)}">${value}</text>
      </g>
    `).join("");
    const xLabels = years.filter((year, index) => index === 0 || index === years.length - 1 || index % 2 === 0).map((year) => {
      const index = years.indexOf(year);
      return `<text class="kwi-chart-year" x="${xFor(index).toFixed(1)}" y="${height - 14}">${year}</text>`;
    }).join("");
    const mpdPoints = history.series.MPD.filter((point) => point.value !== null && point.count >= 2);
    const mpdLine = mpdPoints.length < 2 ? "" : `
      <polyline class="kwi-chart-mpd" points="${pathFor(mpdPoints)}"></polyline>
      ${mpdPoints.map((point) => `<circle class="kwi-chart-mpd-dot" cx="${xFor(years.indexOf(point.year)).toFixed(1)}" cy="${yFor(point.value).toFixed(1)}" r="4.8"><title>MPD-Status ${point.year}: ${scoreText(point.value)}</title></circle>`).join("")}
      <text class="kwi-chart-mpd-label" x="${Math.min(width - 124, xFor(years.indexOf(mpdPoints[mpdPoints.length - 1].year)) + 9).toFixed(1)}" y="${(yFor(mpdPoints[mpdPoints.length - 1].value) - 8).toFixed(1)}">MPD-Status</text>
    `;
    const lines = DIMENSIONS.map((dimension) => {
      const points = history.series[dimension].filter((point) => point.value !== null);
      if (points.length < 2) return "";
      const last = points[points.length - 1];
      return `
        <polyline class="kwi-chart-line" points="${pathFor(points)}" stroke="${CHART_COLORS[dimension]}"></polyline>
        ${points.map((point) => `<circle class="kwi-chart-dot" cx="${xFor(years.indexOf(point.year)).toFixed(1)}" cy="${yFor(point.value).toFixed(1)}" r="3.6" fill="${CHART_COLORS[dimension]}"><title>${dimension} ${point.year}: ${scoreText(point.value)}</title></circle>`).join("")}
        <text class="kwi-chart-end-label" x="${Math.min(width - 132, xFor(years.indexOf(last.year)) + 8).toFixed(1)}" y="${(yFor(last.value) + 4).toFixed(1)}">${dimension === "Demokratie" ? "Demokratie*" : dimension}</text>
      `;
    }).join("");
    const mpdDelta = seriesDelta(history, "MPD");
    const trendSummary = DIMENSIONS.map((dimension) => {
      return `${dimensionName(dimension)}: ${trendLabel(seriesDelta(history, dimension))}`;
    }).join(". ");

    return `
      <section class="kwi-trend-panel" aria-labelledby="kwi-trend-title">
        <div class="kwi-panel-head">
          <p class="card-kicker">Zeitverlauf</p>
          <h3 id="kwi-trend-title">Wirkungsprofil im Verlauf</h3>
          <p>Die starke MPD-Linie zeigt den gemeinsamen Status aus Mensch, Planet und Demokratie. Die dünneren Linien zeigen die drei Dimensionen als Diagnoseebene. Der gestrichelte Zielpfad ist ein Orientierungspfad für positive Netto-Wirkung, keine amtliche Zielvorgabe.</p>
        </div>
        <div class="kwi-chart-wrap">
          <svg class="kwi-line-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Zeitverlauf der KWI-Dimensionen für ${snapshot.municipality.name}">
            <title>Zeitverlauf für ${snapshot.municipality.name}</title>
            <desc>MPD-Status: ${trendLabel(mpdDelta)}. ${trendSummary}. Zielpfad von 55 auf 80 Punkte.</desc>
            ${grid}
            <polyline class="kwi-chart-ideal" points="${pathFor(idealPoints)}"></polyline>
            ${lines}
            ${mpdLine}
            ${xLabels}
            <text class="kwi-chart-axis" x="${margin.left}" y="14">Score 0-100</text>
          </svg>
        </div>
        <div class="kwi-chart-legend" aria-label="Legende">
          <span><i class="is-mpd"></i>MPD-Status</span>
          ${DIMENSIONS.map((dimension) => `<span><i style="background:${CHART_COLORS[dimension]}"></i>${dimensionName(dimension)}</span>`).join("")}
          <span><i class="is-dashed"></i>Zielpfad</span>
        </div>
      </section>
    `;
  }

  function renderDemocracyConcept() {
    return `
      <section class="kwi-democracy-concept" aria-labelledby="kwi-democracy-concept-title">
        <div>
          <p class="card-kicker">SDG+ Demokratie</p>
          <h3 id="kwi-democracy-concept-title">Demokratie braucht eine eigene Datenlogik.</h3>
          <p>Das SDG-Portal liefert für Demokratie bereits einzelne SDG-16-Signale, etwa Straftaten und kommunale Finanzindikatoren. Im Beta-Profil werden diese Werte als Proxy gelesen. Für eine belastbare SDG+-Dimension braucht der KWI zusätzlich Wahl-, Rechtsstaats-, Transparenz-, Medien-, Zivilgesellschafts- und Vertrauensdaten.</p>
        </div>
        <ul class="kwi-concept-list">
          ${DEMOCRACY_DATA_CONCEPT.slice(0, 4).map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </section>
    `;
  }

  function renderInterpretation(snapshot, history, gaps, strengths) {
    const dimensions = Object.entries(snapshot.summary.dimensions)
      .filter(([, item]) => item.score !== null && item.score !== undefined)
      .sort((a, b) => b[1].score - a[1].score);
    const strongest = dimensions[0];
    const weakest = dimensions[dimensions.length - 1];
    const quality = snapshot.summary.qualityCounts || {};
    const lowQuality = quality.niedrig || 0;
    const gapNames = gaps.slice(0, 3).map((item) => item.title).join(", ");
    const strengthNames = strengths.slice(0, 2).map((item) => item.title).join(", ");
    const weakDelta = weakest ? seriesDelta(history, weakest[0]) : null;
    const coverage = coverageText(snapshot);
    const minimumCoverageMet = (snapshot.summary.scoredIndicatorCount || 0) / Math.max(1, snapshot.summary.indicatorCount || 1) >= 0.5;
    const totalScoreSentence = minimumCoverageMet
      ? `Der Gesamtwert wird angezeigt, weil die Mindestabdeckung im Beta-Modell erreicht ist: ${coverage}.`
      : `Der Gesamtwert sollte zurückhaltend gelesen werden, weil die Datenabdeckung unter der Beta-Schwelle liegt: ${coverage}.`;

    return `
      <section class="kwi-interpretation" aria-labelledby="kwi-interpretation-title">
        <div>
          <p class="card-kicker">Auswertung</p>
          <h3 id="kwi-interpretation-title">Interpretation für ${snapshot.municipality.name}</h3>
          <p>${strongest && weakest ? `Das Profil zeigt die stärkste Ausgangslage derzeit in <strong>${dimensionName(strongest[0])}</strong> (${scoreText(strongest[1].score)}) und den größten Zielabstand in <strong>${dimensionName(weakest[0])}</strong> (${scoreText(weakest[1].score)}).` : "Für diese Kommune liegen noch nicht genug Dimensionswerte für eine belastbare Kurzinterpretation vor."} ${weakest ? `Der Verlauf der schwächsten Dimension ist ${trendLabel(weakDelta)}.` : ""}</p>
          <p>Die politische Frage ist deshalb nicht, ob eine Kommune gut oder schlecht ist. Entscheidend ist, welche Maßnahmen mehrere Wirkungsräume gleichzeitig stärken: soziale Stabilität, ökologische Tragfähigkeit und demokratische Handlungsfähigkeit.</p>
          <p>Die Dimension Demokratie ist in diesem Stand noch kein vollständiger SDG+-Index. Sie zeigt nur erste Proxy-Signale; Wahl-, Beteiligungs-, Transparenz-, Vertrauens- und Zivilgesellschaftsdaten müssen konzeptionell ergänzt werden.</p>
          <p>${gapNames ? `Auffällige Prüfstellen sind im aktuellen Snapshot vor allem: ${gapNames}.` : "Der Snapshot zeigt keine klar priorisierbaren Prüfpunkte."} ${strengthNames ? `Stärkere Ausgangslagen zeigen sich unter anderem bei: ${strengthNames}.` : ""}</p>
        </div>
        <aside class="kwi-interpretation-meta" aria-label="Einordnung und Grenzen">
          <span><strong>Methodik</strong>${snapshot.method.name}</span>
          <span><strong>Datenabdeckung</strong>${coverage}</span>
          <span><strong>Niedrige Datenqualität</strong>${lowQuality} Indikatoren</span>
          <span><strong>Demokratie</strong>SDG+-Konzeptbereich, aktuell nur Proxywerte.</span>
          <span><strong>Schutzlinie</strong>Kein Ranking, keine amtliche Bewertung, keine automatische Entscheidung.</span>
          <p>${totalScoreSentence}</p>
        </aside>
      </section>
    `;
  }

  function renderSignalList(items) {
    return `<ol class="kwi-signal-list">${items.map((item) => `
      <li>
        <span>${item.title}</span>
        <strong class="${scoreClass(item.score)}">${scoreText(item.score)}</strong>
      </li>
    `).join("")}</ol>`;
  }

  function renderTable(snapshot) {
    if (!tableBody) return;
    const indicators = snapshot.indicators.filter((item) => {
      return state.dimension === "Alle" || item.dimension === state.dimension;
    });

    tableBody.innerHTML = indicators.map((item) => `
      <tr>
        <td>
          <strong>${item.title}</strong>
          <span>${item.source || "Quelle nicht ausgewiesen"}</span>
        </td>
        <td>${dimensionName(item.dimension)}</td>
        <td>SDG ${item.sdg}</td>
        <td>${formatValue(item)}</td>
        <td>${item.year || "-"}</td>
        <td><span class="kwi-table-score ${scoreClass(item.score)}">${scoreText(item.score)}</span></td>
        <td>${item.quality}</td>
      </tr>
    `).join("");
  }

  async function selectMunicipality(municipality) {
    if (!municipality) {
      setStatus("Für diese Eingabe liegt noch kein lokaler KWI-Snapshot vor.", true);
      return;
    }
    hideProgress();
    setStatus("Daten werden geladen ...");
    setBusy(true);
    const snapshot = await loadJson(`${dataBase}${municipality.file}`);
    state.snapshot = snapshot;
    state.dimension = "Alle";
    input.value = municipality.name;
    renderDimensionControls(snapshot);
    renderSummary(snapshot);
    renderTable(snapshot);
    setStatus(`${snapshot.summary.indicatorCount} SDG-Indikatoren geladen.`);
    setBusy(false);
  }

  async function selectLiveMunicipality(query) {
    const normalized = query.trim();
    if (!normalized) {
      await selectMunicipality(state.manifest.municipalities[0]);
      return;
    }
    if (!liveApi) {
      clearRenderedResult();
      hideProgress();
      setBusy(false);
      setStatus(liveUnavailableMessage(normalized), true);
      return;
    }
    clearRenderedResult();
    setBusy(true);
    showProgress(
      "Kommune wird gesucht ...",
      "Das Tool fragt die Datenquelle an und löst den Ortsnamen auf.",
      [
        { after: 1400, title: "SDG-Indikatoren werden geladen ...", message: "Zeitreihen, Landesdurchschnitte, Quellen und Datenqualität werden gelesen." },
        { after: 4200, title: "KWI-Profil wird berechnet ...", message: "Mensch, Planet, Demokratie und die gemeinsame MPD-Linie werden zusammengesetzt." },
        { after: 8000, title: "Auswertung wird vorbereitet ...", message: "Bei vielen Indikatoren oder langsamer Quelle kann das etwas länger dauern." },
      ]
    );
    setStatus(`Für "${normalized}" liegt noch kein vorbereiteter Snapshot vor. Live-Daten werden angefragt ...`);
    try {
      const snapshot = await loadLiveSnapshot(normalized);
      state.snapshot = snapshot;
      state.dimension = "Alle";
      input.value = snapshot.municipality.name;
      renderDimensionControls(snapshot);
      renderSummary(snapshot);
      renderTable(snapshot);
      setStatus(`${snapshot.summary.indicatorCount} SDG-Indikatoren live aus dem SDG-Portal geladen. Snapshot wird serverseitig gecacht.`);
    } catch (error) {
      setStatus(liveUnavailableMessage(normalized), true);
    } finally {
      hideProgress();
      setBusy(false);
    }
  }

  async function init() {
    try {
      state.manifest = await loadJson(manifestUrl);
      datalist.innerHTML = state.manifest.municipalities.map((item) => `<option value="${item.name}"></option>`).join("");
      await selectMunicipality(state.manifest.municipalities[0]);
    } catch (error) {
      hideProgress();
      setBusy(false);
      setStatus("KWI-Daten konnten nicht geladen werden.", true);
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const municipality = findMunicipality(input.value);
    const selection = municipality ? selectMunicipality(municipality) : selectLiveMunicipality(input.value);
    selection.catch(() => {
      hideProgress();
      setBusy(false);
      setStatus("Der KWI-Snapshot konnte nicht geladen werden.", true);
    });
  });

  if (dimensionFilter) {
    dimensionFilter.addEventListener("click", (event) => {
      const button = event.target.closest("[data-dimension]");
      if (!button || !state.snapshot) return;
      state.dimension = button.getAttribute("data-dimension");
      renderDimensionControls(state.snapshot);
      renderTable(state.snapshot);
    });
  }

  init();
})();
