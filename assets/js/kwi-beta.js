(function () {
  const root = document.querySelector("[data-kwi-beta]");
  if (!root) return;

  const manifestUrl = root.getAttribute("data-manifest");
  const dataBase = root.getAttribute("data-base") || "";
  const form = root.querySelector("[data-kwi-form]");
  const input = root.querySelector("[data-kwi-input]");
  const snapshotSelect = root.querySelector("[data-kwi-select]");
  const datalist = root.querySelector("[data-kwi-options]");
  const status = root.querySelector("[data-kwi-status]");
  const result = root.querySelector("[data-kwi-result]");
  const progress = root.querySelector("[data-kwi-progress]");
  const progressTitle = root.querySelector("[data-kwi-progress-title]");
  const progressText = root.querySelector("[data-kwi-progress-text]");
  const submitButton = form?.querySelector("button[type='submit']");
  const tableBody = document.querySelector("[data-kwi-table]");
  const dimensionFilter = document.querySelector("[data-kwi-dimension-filter]");

  const DIMENSIONS = ["Mensch", "Planet", "Demokratie"];
  const nf = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 });
  const state = { manifest: null, snapshot: null, dimension: "Alle", requestId: 0 };

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;",
    })[char]);
  }

  function normalizeLookup(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ß/g, "ss")
      .toLowerCase()
      .replace(/[,/_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function setStatus(message, isError) {
    if (!status) return;
    status.textContent = message || "";
    status.classList.toggle("is-error", Boolean(isError));
  }

  function setBusy(isBusy) {
    if (submitButton) submitButton.disabled = Boolean(isBusy);
    if (input) input.setAttribute("aria-busy", isBusy ? "true" : "false");
    if (snapshotSelect) snapshotSelect.disabled = Boolean(isBusy);
  }

  function showProgress(title, message) {
    if (!progress) return;
    if (progressTitle) progressTitle.textContent = title;
    if (progressText) progressText.textContent = message;
    progress.hidden = false;
  }

  function hideProgress() {
    if (progress) progress.hidden = true;
  }

  function formatValue(item) {
    if (item?.value === null || item?.value === undefined || item?.value === "") return "-";
    return `${nf.format(item.value)}${item.unit ? ` ${item.unit}` : ""}`;
  }

  function dateText(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "nicht ausgewiesen" : date.toLocaleDateString("de-DE");
  }

  function dimensionName(name) {
    return name === "Demokratie" ? "Demokratie (unvollständiger SDG+-Datenbereich)" : name;
  }

  function directionText(direction) {
    if (direction === "hoeher_ist_besser") return "höherer Wert im jeweiligen Indikator günstiger";
    if (direction === "niedriger_ist_besser") return "niedrigerer Wert im jeweiligen Indikator günstiger";
    return "Richtung noch nicht dokumentiert";
  }

  function rawIndicators(snapshot, dimension) {
    return (snapshot?.indicators || []).filter((indicator) => {
      return (!dimension || dimension === "Alle" || indicator.dimension === dimension)
        && indicator.value !== null
        && indicator.value !== undefined;
    });
  }

  function allIndicators(snapshot, dimension) {
    return (snapshot?.indicators || []).filter((indicator) => !dimension || dimension === "Alle" || indicator.dimension === dimension);
  }

  function dimensionFacts(snapshot, dimension) {
    const indicators = allIndicators(snapshot, dimension);
    const withRawValue = rawIndicators(snapshot, dimension);
    const years = withRawValue.map((indicator) => Number(indicator.year)).filter(Number.isFinite);
    const qualities = indicators.reduce((counts, indicator) => {
      const key = String(indicator.quality || "nicht ausgewiesen").toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {});
    return {
      indicators,
      withRawValue,
      years,
      qualities,
      firstYear: years.length ? Math.min(...years) : null,
      lastYear: years.length ? Math.max(...years) : null,
    };
  }

  function timeRange(indicator) {
    const years = (indicator.timeseries || []).map((point) => Number(point.year)).filter(Number.isFinite).sort((left, right) => left - right);
    if (!years.length) return "keine Zeitreihe im Snapshot";
    return years.length === 1 ? `Zeitreihe: ${years[0]}` : `Zeitreihe: ${years[0]}-${years[years.length - 1]}`;
  }

  function democracyDataIncomplete(snapshot) {
    return allIndicators(snapshot, "Demokratie").length < 8;
  }

  function democracyIncompleteNotice(snapshot) {
    if (!democracyDataIncomplete(snapshot)) return "";
    return "Der Demokratie-Datenbereich ist unvollständig: Im Snapshot fehlen unter anderem Wahlbeteiligung, Beteiligungswirksamkeit, Transparenz, Rechtszugang, Medienvielfalt, Zivilgesellschaft und Vertrauensdaten. Daher wird daraus weder ein Demokratie-Score noch ein Gesamt-KWI abgeleitet.";
  }

  function sourceName(snapshot) {
    return snapshot?.source?.name || "Quelle nicht ausgewiesen";
  }

  function sourceWarning(snapshot) {
    return `Die bereitgestellten Snapshots stammen vom ${sourceName(snapshot)} und haben den Stand ${dateText(snapshot?.generatedAt)}. Die frühere 0-100-Aggregation, die MPD-Linie und der Zielpfad sind auf dieser Seite deaktiviert: Normierung, Gewichtung, Mindestabdeckung und Quellenfortschreibung sind noch nicht kanonisch genug. Sichtbar bleiben die Rohwerte mit Einheit, Jahr, Quelle und Datenqualität.`;
  }

  function renderDimensionControls(snapshot) {
    if (!dimensionFilter) return;
    const available = DIMENSIONS.filter((dimension) => allIndicators(snapshot, dimension).length);
    const dimensions = ["Alle", ...available];
    dimensionFilter.innerHTML = dimensions.map((dimension) => {
      const active = dimension === state.dimension ? " aria-pressed=\"true\"" : "";
      return `<button type="button" class="kwi-chip" data-dimension="${dimension}"${active}>${dimension}</button>`;
    }).join("");
  }

  function renderRawList(indicators) {
    if (!indicators.length) return "<p>Keine Rohwerte mit Einheit und Jahr im Snapshot.</p>";
    return `<ol class="kwi-signal-list">${indicators.slice(0, 5).map((indicator) => `
      <li>
        <span><strong>${escapeHtml(indicator.title)}</strong><small>${escapeHtml(formatValue(indicator))} · ${escapeHtml(String(indicator.year || "Jahr nicht ausgewiesen"))} · ${escapeHtml(indicator.quality || "Datenqualität nicht ausgewiesen")}</small></span>
      </li>
    `).join("")}</ol>`;
  }

  function renderSummary(snapshot) {
    const facts = DIMENSIONS.map((dimension) => [dimension, dimensionFacts(snapshot, dimension)]).filter(([, fact]) => fact.indicators.length);
    const total = allIndicators(snapshot).length;
    const rawTotal = rawIndicators(snapshot).length;
    const qualityCounts = allIndicators(snapshot).reduce((counts, indicator) => {
      const key = String(indicator.quality || "nicht ausgewiesen").toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {});

    result.innerHTML = `
      <section class="kwi-result-head" aria-label="KWI Rohdatenprofil">
        <div>
          <p class="hero-kicker">Kommunales Rohdatenprofil · Beta</p>
          <h2>${escapeHtml(snapshot?.municipality?.name || "Kommune")}</h2>
          <p class="kwi-source-line">Quelle: ${escapeHtml(sourceName(snapshot))} · Snapshot ${escapeHtml(dateText(snapshot?.generatedAt))}</p>
        </div>
        <div class="kwi-score kwi-muted">
          <span>Gesamt-KWI</span>
          <strong>nicht ausgewiesen</strong>
          <small>kein 0-100-Wert</small>
        </div>
      </section>
      <aside class="kwi-guardrail-box" role="note" aria-label="Methodischer Hinweis">
        <p class="card-kicker">Methodischer Stopp</p>
        <h3>Kein Durchschnitt, keine MPD-Linie, kein Zielpfad.</h3>
        <p>${escapeHtml(sourceWarning(snapshot))}</p>
      </aside>
      <section class="kwi-dimensions" aria-label="Rohdaten nach Dimensionen">
        ${facts.map(([dimension, fact]) => {
          const proxyBadge = dimension === "Demokratie" ? '<span class="kwi-proxy-badge">unvollständig</span>' : "";
          const timeText = fact.firstYear && fact.lastYear ? `${fact.firstYear}${fact.lastYear !== fact.firstYear ? `-${fact.lastYear}` : ""}` : "Jahre nicht einheitlich ausgewiesen";
          const qualityText = Object.entries(fact.qualities).map(([quality, count]) => `${quality}: ${count}`).join(" · ");
          const note = dimension === "Demokratie" ? `<p class="kwi-dimension-note">${escapeHtml(democracyIncompleteNotice(snapshot) || "Die Auswahl bildet keinen vollständigen Demokratiebegriff ab.")}</p>` : "";
          return `
            <article class="kwi-dimension">
              <p class="card-kicker">${escapeHtml(dimensionName(dimension))}${proxyBadge}</p>
              <div class="kwi-dimension-head"><strong>${fact.withRawValue.length} Rohwerte</strong><span>${timeText}</span></div>
              <p>${qualityText || "Datenqualität nicht ausgewiesen"}</p>
              ${note}
            </article>
          `;
        }).join("")}
      </section>
      <section class="kwi-quality" aria-label="Rohdatenabdeckung">
        <span><strong>${rawTotal}</strong> Rohwerte mit Einheit und Jahr</span>
        <span><strong>${total}</strong> Indikatorfelder im Snapshot</span>
        <span><strong>${qualityCounts.hoch || 0}</strong> hoch</span>
        <span><strong>${qualityCounts.mittel || 0}</strong> mittel</span>
        <span><strong>${qualityCounts.niedrig || 0}</strong> niedrig</span>
      </section>
      <section class="kwi-compass-block" aria-label="So wird das Rohdatenprofil gelesen">
        <p class="card-kicker">So lesen</p>
        <div class="kwi-reading-grid">
          <span class="kwi-reading-step"><strong>1. Einheit</strong>Erst klären, was der einzelne Wert misst.</span>
          <span class="kwi-reading-step"><strong>2. Jahr</strong>Nur Werte mit vergleichbarem Zeitraum nebeneinanderlegen.</span>
          <span class="kwi-reading-step"><strong>3. Quelle</strong>Quelle, Erhebung und Datenqualität vor jeder Deutung prüfen.</span>
          <span class="kwi-reading-step"><strong>4. Lücke</strong>Eine fehlende Dimension bleibt eine offene Frage, kein neutraler Wert.</span>
          <span class="kwi-reading-step"><strong>5. Rückkopplung</strong>Rat, Verwaltung und Öffentlichkeit entscheiden; das Profil bereitet nur Fragen vor.</span>
        </div>
      </section>
      <section class="kwi-signal-grid" aria-label="Rohdaten auswählen">
        ${facts.map(([dimension, fact]) => `
          <div>
            <h3>${escapeHtml(dimensionName(dimension))}: Rohwerte im Snapshot</h3>
            ${renderRawList(fact.withRawValue)}
          </div>
        `).join("")}
      </section>
      <section class="kwi-democracy-concept" aria-labelledby="kwi-democracy-concept-title">
        <div>
          <p class="card-kicker">SDG+ Demokratie</p>
          <h3 id="kwi-democracy-concept-title">Demokratie braucht eigene, vollständige Daten.</h3>
          <p>${escapeHtml(democracyIncompleteNotice(snapshot) || "Dieser Datenbereich ist als Rohdatenliste sichtbar, nicht als Gesamturteil.")}</p>
        </div>
        <ul class="kwi-concept-list">
          <li>Wahlbeteiligung und Wahlstatistik</li>
          <li>Beteiligungswirksamkeit, Transparenz und Rechtszugang</li>
          <li>Medienvielfalt, Zivilgesellschaft und Vertrauen</li>
          <li>Dokumentierte lokale Quellen mit Zeitstand und Qualität</li>
        </ul>
      </section>
    `;
  }

  function renderTable(snapshot) {
    if (!tableBody) return;
    const indicators = allIndicators(snapshot, state.dimension);
    tableBody.innerHTML = indicators.map((indicator) => `
      <tr>
        <td><strong>${escapeHtml(indicator.title)}</strong><span>${escapeHtml(indicator.source || "Quelle nicht ausgewiesen")}</span></td>
        <td>${escapeHtml(dimensionName(indicator.dimension))}</td>
        <td>SDG ${escapeHtml(indicator.sdg || "-")}</td>
        <td>${escapeHtml(formatValue(indicator))}</td>
        <td>${escapeHtml(indicator.year || "-")}</td>
        <td>${escapeHtml(directionText(indicator.direction))}<br><small>${escapeHtml(timeRange(indicator))}</small></td>
        <td>${escapeHtml(indicator.quality || "nicht ausgewiesen")}</td>
      </tr>
    `).join("") || "<tr><td colspan=\"7\">Für diese Dimension liegen keine Indikatoren im Snapshot vor.</td></tr>";
  }

  function manifestEntries() {
    return (state.manifest?.municipalities || []).slice().sort((left, right) => left.name.localeCompare(right.name, "de"));
  }

  function renderMunicipalityControls() {
    const municipalities = manifestEntries();
    if (datalist) datalist.innerHTML = municipalities.map((municipality) => `<option value="${escapeHtml(municipality.name)}"></option>`).join("");
    if (!snapshotSelect) return;
    snapshotSelect.innerHTML = [
      '<option value="">Snapshot auswählen ...</option>',
      ...municipalities.map((municipality) => `<option value="${escapeHtml(municipality.slug)}">${escapeHtml(municipality.name)} · ${municipality.indicatorCount || "?"} Indikatorfelder</option>`),
    ].join("");
  }

  function findMunicipality(query) {
    const normalized = normalizeLookup(query);
    const municipalities = manifestEntries();
    if (!normalized) return municipalities[0] || null;
    return municipalities.find((municipality) => normalizeLookup(municipality.name) === normalized || normalizeLookup(municipality.slug) === normalized)
      || municipalities.find((municipality) => normalizeLookup(municipality.name).includes(normalized) || normalizeLookup(municipality.slug).includes(normalized))
      || null;
  }

  async function loadJson(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  function clearRenderedResult() {
    state.snapshot = null;
    if (result) result.innerHTML = "";
    if (tableBody) tableBody.innerHTML = "";
    if (dimensionFilter) dimensionFilter.innerHTML = "";
  }

  function renderSnapshot(snapshot, statusMessage) {
    state.snapshot = snapshot;
    state.dimension = "Alle";
    if (input) input.value = snapshot?.municipality?.name || "";
    if (snapshotSelect) snapshotSelect.value = snapshot?.municipality?.slug || "";
    renderDimensionControls(snapshot);
    renderSummary(snapshot);
    renderTable(snapshot);
    setStatus(statusMessage);
  }

  async function selectMunicipality(municipality) {
    if (!municipality) {
      setStatus("Für diese Eingabe gibt es keinen vorbereiteten Rohdaten-Snapshot. Ein Live-Abruf ist bis zu einer kanonischen Quellen- und Methodenprüfung ausgesetzt.", true);
      return;
    }
    const requestId = ++state.requestId;
    clearRenderedResult();
    setBusy(true);
    showProgress("Rohdaten-Snapshot wird geladen ...", `Vorliegende Daten für ${municipality.name} werden ohne Gesamt-Score angezeigt.`);
    setStatus(`Rohdaten für ${municipality.name} werden geladen ...`);
    try {
      const snapshot = await loadJson(`${dataBase}${municipality.file}`);
      if (requestId !== state.requestId) return;
      renderSnapshot(snapshot, `${snapshot.indicators?.length || 0} Indikatorfelder für ${snapshot.municipality.name} geladen. Gesamt-KWI, MPD und Zielpfad bleiben bewusst ausgeblendet.`);
    } catch (error) {
      if (requestId === state.requestId) setStatus("Der Rohdaten-Snapshot konnte nicht geladen werden.", true);
    } finally {
      if (requestId === state.requestId) {
        hideProgress();
        setBusy(false);
      }
    }
  }

  async function init() {
    try {
      state.manifest = await loadJson(manifestUrl);
      renderMunicipalityControls();
      await selectMunicipality(manifestEntries()[0]);
    } catch (error) {
      hideProgress();
      setBusy(false);
      setStatus("KWI-Rohdaten konnten nicht geladen werden.", true);
    }
  }

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    selectMunicipality(findMunicipality(input?.value || ""));
  });

  snapshotSelect?.addEventListener("change", () => {
    const municipality = manifestEntries().find((entry) => entry.slug === snapshotSelect.value);
    if (municipality) selectMunicipality(municipality);
  });

  dimensionFilter?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-dimension]");
    if (!button || !state.snapshot) return;
    state.dimension = button.getAttribute("data-dimension") || "Alle";
    renderDimensionControls(state.snapshot);
    renderTable(state.snapshot);
  });

  init();
})();
