(function initToolExamplesDashboard() {
  const calculations = window.WoekImpactCalculations || {
    calculateTSROI({
      nwi = 0,
      redLineActive = false,
      transformation = 0,
      systemLeverage = 1,
      timeFactor = 1,
      resilienceFactor = 1,
      dataQuality = 1,
      investment = 1
    } = {}) {
      if (redLineActive || Number(nwi) < 0) {
        return {
          tsroi: 0,
          status: "blocked",
          explanation: "T-SROI wird nicht positiv ausgewiesen, wenn NWI negativ ist oder eine rote Linie aktiv ist."
        };
      }
      const safeInvestment = Math.max(1, Math.abs(Number(investment) || 1));
      return {
        tsroi:
          ((Number(transformation) || 0) *
            (Number(systemLeverage) || 1) *
            (Number(timeFactor) || 1) *
            (Number(resilienceFactor) || 1) *
            Math.max(0, Math.min(1, Number(dataQuality) || 0))) /
          safeInvestment,
        status: "model",
        explanation: "T-SROI ist ein modellhafter Transformationswert, keine operative Netto-Wirkungskennzahl."
      };
    }
  };
  window.ToolExamplesDashboardLoaded = true;

  function formatScore(value) {
    return Number(value).toLocaleString("de-DE", { maximumFractionDigits: 2 });
  }

  function statusText(value) {
    return {
      interactive: "interaktiv",
      model: "modellhaft",
      "in-preparation": "in Vorbereitung"
    }[value] || value;
  }

  async function loadExamples() {
    const response = await fetch("/assets/data/tool-examples.json");
    return response.json();
  }

  function matches(example, filters) {
    const haystack = [
      example.title,
      example.shortDescription,
      example.cluster,
      example.demoType,
      ...(example.targetGroups || []),
      ...(example.sdgs || []),
      ...(example.sdgPlus || [])
    ].join(" ").toLowerCase();
    return (
      (!filters.search || haystack.includes(filters.search)) &&
      (!filters.cluster || example.cluster === filters.cluster) &&
      (!filters.demoType || example.demoType === filters.demoType) &&
      (!filters.targetGroup || (example.targetGroups || []).includes(filters.targetGroup))
    );
  }

  function renderDashboard(root, examples) {
    const cards = root.querySelector("[data-tool-example-cards]");
    const count = root.querySelector("[data-tool-example-count]");
    const filters = {
      search: root.querySelector("[data-tool-example-search]"),
      cluster: root.querySelector("[data-tool-example-cluster]"),
      demoType: root.querySelector("[data-tool-example-type]"),
      targetGroup: root.querySelector("[data-tool-example-target]")
    };

    function optionList(values) {
      return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b, "de"));
    }

    filters.cluster.innerHTML = `<option value="">Alle Cluster</option>${optionList(examples.map((example) => example.cluster)).map((value) => `<option>${value}</option>`).join("")}`;
    filters.demoType.innerHTML = `<option value="">Alle Demo-Typen</option>${optionList(examples.map((example) => example.demoType)).map((value) => `<option value="${value}">${value}</option>`).join("")}`;
    filters.targetGroup.innerHTML = `<option value="">Alle Zielgruppen</option>${optionList(examples.flatMap((example) => example.targetGroups || [])).map((value) => `<option>${value}</option>`).join("")}`;

    function update() {
      const active = {
        search: filters.search.value.trim().toLowerCase(),
        cluster: filters.cluster.value,
        demoType: filters.demoType.value,
        targetGroup: filters.targetGroup.value
      };
      const visible = examples.filter((example) => matches(example, active));
      count.textContent = `${visible.length} Beispiele sichtbar`;
      cards.innerHTML = visible.map((example) => `
        <article class="card tool-example-card">
          <div class="method-tool-card-head">
            <p class="card-kicker">${example.cluster}</p>
            <span class="status-badge status-badge--${example.status}">${statusText(example.status)}</span>
          </div>
          <h2 class="card-title">${example.title}</h2>
          <p class="card-text">${example.shortDescription}</p>
          <p class="tool-example-warning">${example.disclaimer}</p>
          <div class="method-related">${(example.targetGroups || []).slice(0, 4).map((group) => `<span>${group}</span>`).join("")}</div>
          <div class="portal-card-actions">
            <a class="text-link" href="${example.methodPage}">Methodenseite</a>
            ${example.demoPage ? `<a class="text-link" href="${example.demoPage}">Demo öffnen</a>` : ""}
          </div>
        </article>
      `).join("");
    }

    Object.values(filters).forEach((control) => control.addEventListener("input", update));
    update();
  }

  function renderTSROI(root) {
    if (!calculations) return;
    const inputs = root.querySelectorAll("input, select");
    const output = root.querySelector("[data-tsroi-output]");
    function value(name) {
      const field = root.querySelector(`[name="${name}"]`);
      return field?.type === "checkbox" ? field.checked : Number(field?.value || 0);
    }
    function update() {
      const nwi = value("nwi");
      const redLineActive = value("redLineActive");
      const result = calculations.calculateTSROI({
        nwi,
        redLineActive,
        transformation: value("transformation"),
        systemLeverage: value("systemLeverage"),
        timeFactor: value("timeFactor"),
        resilienceFactor: value("resilienceFactor"),
        dataQuality: value("dataQuality"),
        investment: value("investment")
      });
      output.innerHTML = `
        <div class="result-card ${result.status === "blocked" ? "is-critical" : "is-positive"}">
          <span>T-SROI-Modellwert</span>
          <strong>${result.status === "blocked" ? "blockiert" : formatScore(result.tsroi)}</strong>
          <p>${result.explanation}</p>
        </div>
        <div class="result-card">
          <span>NWI-Eingangsschwelle</span>
          <strong>${formatScore(nwi)}</strong>
          <p>NWI bleibt operative Netto-Wirkungskennzahl. T-SROI bewertet Transformationswirkung nur nach geprüfter Netto-Wirkung.</p>
        </div>
      `;
    }
    inputs.forEach((input) => input.addEventListener("input", update));
    update();
  }

  document.addEventListener("DOMContentLoaded", async () => {
    document.querySelectorAll("[data-tool-examples-dashboard]").forEach(async (root) => {
      renderDashboard(root, await loadExamples());
    });
    document.querySelectorAll("[data-tool-example-tsroi]").forEach(renderTSROI);
  });
})();
