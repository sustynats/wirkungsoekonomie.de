(function initToolExamplesDashboard() {
  const calculations = window.WoekImpactCalculations;
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
    function rawValue(name) {
      const field = root.querySelector(`[name="${name}"]`);
      return field?.type === "checkbox" ? field.checked : field?.value;
    }
    function percent(name) {
      const raw = rawValue(name);
      if (typeof raw === "string" && raw.trim() === "") return raw;
      const parsed = Number(raw);
      return Number.isFinite(parsed) ? parsed / 100 : raw;
    }
    function resetEvidenceForChangedAssumption(event) {
      const name = event?.target?.name;
      if (["redLineActive", "systemBoundaryDefined", "attributionDefined"].includes(name)) return;
      const systemBoundary = root.querySelector('[name="systemBoundaryDefined"]');
      const attribution = root.querySelector('[name="attributionDefined"]');
      if (systemBoundary) systemBoundary.checked = false;
      if (attribution) attribution.checked = false;
    }
    function update() {
      const redLineActive = rawValue("redLineActive");
      const result = calculations.calculateTSROI({
        investment: rawValue("investment"),
        annualDirectBenefit: rawValue("annualDirectBenefit"),
        annualTransformativeBenefit: rawValue("annualTransformativeBenefit"),
        annualHarm: rawValue("annualHarm"),
        annualOperatingCost: rawValue("annualOperatingCost"),
        years: rawValue("years"),
        benefitDiscountRate: percent("discountRate"),
        costDiscountRate: percent("discountRate"),
        attribution: percent("attribution"),
        deadweight: percent("deadweight"),
        displacement: percent("displacement"),
        uncertainty: percent("uncertainty"),
        redLineActive,
        dataQuality: rawValue("dataQuality"),
        scores: {
          mensch: rawValue("mensch"),
          planet: rawValue("planet"),
          demokratie: rawValue("demokratie"),
        },
        systemBoundaryDefined: rawValue("systemBoundaryDefined"),
        attributionDefined: rawValue("attributionDefined"),
      });
      output.innerHTML = `
        <div class="result-card ${result.status === "blocked" ? "is-critical" : "is-positive"}">
          <span>Monetärer T-SROI</span>
          <strong>${result.status === "blocked" ? "blockiert" : `${formatScore(result.tsroi)} : 1`}</strong>
          <p>${result.explanation}</p>
        </div>
        <div class="result-card">
          <span>Schutz-Gate</span>
          <strong>${result.gate.passed ? "offen" : "blockiert"}</strong>
          <p>${result.gate.passed ? `Diskontierter Netto-Nutzen: ${formatScore(result.benefitPv)} EUR; Ressourcen: ${formatScore(result.costPv)} EUR.` : result.gate.reasons.join(" ")}</p>
        </div>
      `;
    }
    inputs.forEach((input) => {
      input.addEventListener("input", (event) => {
        resetEvidenceForChangedAssumption(event);
        update();
      });
      input.addEventListener("change", (event) => {
        resetEvidenceForChangedAssumption(event);
        update();
      });
    });
    update();
  }

  document.addEventListener("DOMContentLoaded", async () => {
    document.querySelectorAll("[data-tool-examples-dashboard]").forEach(async (root) => {
      renderDashboard(root, await loadExamples());
    });
    document.querySelectorAll("[data-tool-example-tsroi]").forEach(renderTSROI);
  });
})();
