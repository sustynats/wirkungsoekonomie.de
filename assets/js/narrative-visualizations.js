(function () {
  const root = document.querySelector("[data-narrative-app]");
  const scriptUrl =
    document.currentScript?.src || document.querySelector('script[src*="narrative-visualizations.js"]')?.src || "";

  if (!root) return;

  const axes = [
    "Angst",
    "Wut",
    "Misstrauen",
    "Feindbild",
    "Kontrollsehnsucht",
    "Vereinfachung",
    "Autoritarismuspotenzial",
    "Diskursverengung",
    "Demokratierisiko",
    "Entsolidarisierung"
  ];

  const sharedNodes = [
    "Misstrauen",
    "Kontrolle",
    "Angst",
    "Systemdelegitimierung",
    "Vereinfachung",
    "Medien",
    "Demokratie",
    "Vertrauen",
    "Spaltung"
  ];

  const state = {
    cases: [],
    activeId: null
  };

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function polarPoint(index, value, radius) {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / axes.length;
    const scaled = (value / 5) * radius;
    return {
      x: 100 + Math.cos(angle) * scaled,
      y: 100 + Math.sin(angle) * scaled
    };
  }

  function gridPoints(value, radius) {
    return axes
      .map((_, index) => {
        const point = polarPoint(index, value, radius);
        return `${point.x.toFixed(2)},${point.y.toFixed(2)}`;
      })
      .join(" ");
  }

  function renderRadar(caseItem, mini = false) {
    const radius = mini ? 72 : 76;
    const points = axes
      .map((axis, index) => {
        const point = polarPoint(index, caseItem.radar_values[axis] || 0, radius);
        return `${point.x.toFixed(2)},${point.y.toFixed(2)}`;
      })
      .join(" ");

    return `
      <svg class="${mini ? "mini-radar" : "radar-svg"}" viewBox="0 0 200 200" role="img" aria-label="Wirkungsradar für ${escapeHtml(caseItem.title)}">
        <polygon class="radar-grid" points="${gridPoints(1, radius)}"></polygon>
        <polygon class="radar-grid" points="${gridPoints(3, radius)}"></polygon>
        <polygon class="radar-grid" points="${gridPoints(5, radius)}"></polygon>
        ${axes
          .map((axis, index) => {
            const end = polarPoint(index, 5, radius);
            return `
              <line class="radar-axis-line" x1="100" y1="100" x2="${end.x.toFixed(2)}" y2="${end.y.toFixed(2)}"></line>
            `;
          })
          .join("")}
        <polygon class="radar-shape" points="${points}"></polygon>
        ${axes
          .map((axis, index) => {
            const point = polarPoint(index, caseItem.radar_values[axis] || 0, radius);
            return `<circle class="radar-point" cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="${mini ? 2.5 : 3.5}"></circle>`;
          })
          .join("")}
      </svg>
    `;
  }

  function renderCaseCard(caseItem) {
    const anchor = getDetailAnchor(caseItem);
    return `
      <button class="narrative-case-card" type="button" data-case-card="${escapeHtml(caseItem.id)}" aria-controls="${escapeHtml(anchor)}">
        <span class="narrative-status">Pilotanalyse</span>
        <h3>${escapeHtml(caseItem.title)}</h3>
        <p>${escapeHtml(caseItem.topic_cluster)}</p>
        <ul class="narrative-tag-list">
          ${caseItem.mechanisms.slice(0, 3).map((tag) => `<li><span>${escapeHtml(tag)}</span></li>`).join("")}
        </ul>
        ${renderRadar(caseItem, true)}
        <span class="text-link">Analyse ansehen</span>
        <span class="visually-hidden">Springt zu ${escapeHtml(anchor)}</span>
      </button>
    `;
  }

  function renderRadarTable(caseItem) {
    return `
      <table class="radar-table">
        <thead>
          <tr><th>Achse</th><th>Wert</th><th>Erklärung</th></tr>
        </thead>
        <tbody>
          ${axes
            .map(
              (axis) => `
                <tr>
                  <td>${escapeHtml(axis)}</td>
                  <td>${caseItem.radar_values[axis] || 0} / 5</td>
                  <td>${escapeHtml(caseItem.radar_explanations[axis])}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    `;
  }

  function renderNetwork(caseItem) {
    const grouped = {
      core: caseItem.network_nodes.filter((node) => node.level === "core"),
      direct: caseItem.network_nodes.filter((node) => node.level === "direct"),
      second: caseItem.network_nodes.filter((node) => node.level === "second")
    };
    const labelById = new Map(caseItem.network_nodes.map((node) => [node.id, node.label]));
    const renderNode = (node) => `
      <button class="network-node ${escapeHtml(node.level)}" type="button" data-network-node="${escapeHtml(caseItem.id)}:${escapeHtml(node.id)}">
        ${escapeHtml(node.label)}
      </button>
    `;

    return `
      <div class="network-map" aria-label="Wirkungsnetz ${escapeHtml(caseItem.title)}">
        <div class="network-column">
          <p class="network-column-title">Narrativ</p>
          ${grouped.core.map(renderNode).join("")}
        </div>
        <div class="network-column">
          <p class="network-column-title">Resonanzräume</p>
          ${grouped.direct.map(renderNode).join("")}
        </div>
        <div class="network-column">
          <p class="network-column-title">Systemursachen / Folgen</p>
          ${grouped.second.map(renderNode).join("")}
        </div>
      </div>
      <div class="network-links" aria-label="Verbindungen im Wirkungsnetz">
        ${caseItem.network_links
          .slice(0, 12)
          .map(
            (link) => `
              <span>
                <strong>${escapeHtml(labelById.get(link.source) || link.source)}</strong>
                <em>wirkt auf</em>
                <strong>${escapeHtml(labelById.get(link.target) || link.target)}</strong>
              </span>
            `
          )
          .join("")}
      </div>
      <div class="network-explanation" data-network-explanation="${escapeHtml(caseItem.id)}">
        <p>Wähle einen Knoten im Netz. Dann erscheint hier, welche Wirkung sichtbar wird und welche Systemfrage oft ausgeblendet bleibt.</p>
      </div>
    `;
  }

  function renderDetail(caseItem) {
    const question = caseItem.system_questions[0] || "";
    const anchor = getDetailAnchor(caseItem);
    return `
      <article class="narrative-detail-panel" id="${escapeHtml(anchor)}" data-case-detail="${escapeHtml(caseItem.id)}">
        <div>
          <p class="hero-kicker">Detailanalyse · ${escapeHtml(caseItem.topic_cluster)}</p>
          <h3>${escapeHtml(caseItem.title)}</h3>
          <div class="narrative-detail-meta">
            <span>Quelle: <a class="text-link" href="${escapeHtml(caseItem.source_url)}" rel="noopener noreferrer">${escapeHtml(caseItem.source_title)}</a></span>
            <span>Abruf: ${escapeHtml(caseItem.retrieved_at)}</span>
            <span>Status: Pilotanalyse</span>
          </div>
          <p class="formula-note">${escapeHtml(caseItem.context)}</p>
        </div>

        <div class="narrative-detail-columns">
          <div>
            <h4>Sprachliche Mechanik</h4>
            <p>${escapeHtml(caseItem.mechanisms.join(", "))}</p>
          </div>
          <div>
            <h4>Wirkungspotenzial</h4>
            <p>${escapeHtml(caseItem.psychological_effects.join(", "))}</p>
          </div>
          <div>
            <h4>Demokratische Wirkung</h4>
            <p>${escapeHtml(caseItem.democratic_effects.join(", "))}</p>
          </div>
          <div>
            <h4>Gegenframe</h4>
            <p>${escapeHtml(caseItem.counterframe)}</p>
          </div>
        </div>

        <div class="narrative-question-card">
          <h4>Wirkungsökonomische Einordnung</h4>
          <p>${escapeHtml(caseItem.woek_analysis)}</p>
        </div>

        <div class="narrative-question-card">
          <h4>WÖk-Gegenfrage</h4>
          <p>${escapeHtml(question)}</p>
        </div>

        <div class="narrative-visual-grid">
          <section class="radar-panel" aria-labelledby="radar-${escapeHtml(caseItem.id)}">
            <h4 id="radar-${escapeHtml(caseItem.id)}">Wirkungsradar</h4>
            <p class="formula-note">Demo - wirkungsanalytische Einordnung, keine amtliche Bewertung.</p>
            ${renderRadar(caseItem)}
            <div class="radar-axis-buttons">
              ${axes.map((axis) => `<button type="button" data-radar-axis="${escapeHtml(caseItem.id)}:${escapeHtml(axis)}">${escapeHtml(axis)}</button>`).join("")}
            </div>
            <p class="radar-explanation" data-radar-explanation="${escapeHtml(caseItem.id)}">Wähle eine Achse, um ihre Bedeutung zu sehen.</p>
            ${renderRadarTable(caseItem)}
          </section>

          <section class="network-panel" aria-labelledby="network-${escapeHtml(caseItem.id)}">
            <h4 id="network-${escapeHtml(caseItem.id)}">Wirkungsnetz</h4>
            <p class="formula-note">Die Visualisierung zeigt Wirkungspotenziale. Sie ersetzt keinen Faktencheck und keine juristische Bewertung.</p>
            ${renderNetwork(caseItem)}
          </section>
        </div>
      </article>
    `;
  }

  function renderOverallNetwork() {
    return `
      <section class="narrative-overlap" aria-labelledby="overall-network-title">
        <p class="hero-kicker">Gesamtansicht</p>
        <h3 id="overall-network-title">Wie die Narrative zusammenhängen</h3>
        <p>Die Begriffe wirken nicht getrennt. Sie teilen Resonanzräume und können gemeinsam ein Feld aus Misstrauen, Kontrolle, Vereinfachung und demokratischer Erschöpfung verstärken.</p>
        <div class="overall-network">
          ${state.cases.map((caseItem) => `<div class="overall-node">${escapeHtml(caseItem.short_title)}</div>`).join("")}
        </div>
        <div class="overall-shared">
          ${sharedNodes.map((node) => `<span>${escapeHtml(node)}</span>`).join("")}
        </div>
      </section>
    `;
  }

  function getDetailAnchor(caseItem) {
    const map = {
      altparteien: "detail-altparteien",
      "angst-vor-afd-wahlsieg": "detail-angst-wahlsieg",
      "illegale-masseneinwanderung": "detail-masseneinwanderung",
      "planwirtschaftliche-energiewende": "detail-energiewende",
      "kehrtwende-180-grad": "detail-kehrtwende"
    };
    return map[caseItem.id] || `detail-${caseItem.id}`;
  }

  function setActiveCase(id, shouldScroll = false) {
    state.activeId = id;
    root.querySelectorAll("[data-case-card]").forEach((card) => {
      card.classList.toggle("is-active", card.getAttribute("data-case-card") === id);
    });
    const select = root.querySelector("[data-narrative-select]");
    if (select instanceof HTMLSelectElement) {
      select.value = id;
    }
    if (shouldScroll) {
      const caseItem = state.cases.find((item) => item.id === id);
      const anchor = caseItem ? getDetailAnchor(caseItem) : `detail-${id}`;
      document.querySelector(`#${CSS.escape(anchor)}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function bindInteractions() {
    root.querySelectorAll("[data-case-card]").forEach((card) => {
      card.addEventListener("click", () => setActiveCase(card.getAttribute("data-case-card"), true));
    });
    root.querySelector("[data-narrative-select]")?.addEventListener("change", (event) => {
      if (event.target instanceof HTMLSelectElement) {
        setActiveCase(event.target.value, true);
      }
    });
    root.querySelectorAll("[data-radar-axis]").forEach((button) => {
      const showAxis = () => {
        const [caseId, axis] = button.getAttribute("data-radar-axis").split(":");
        const caseItem = state.cases.find((item) => item.id === caseId);
        const target = root.querySelector(`[data-radar-explanation="${CSS.escape(caseId)}"]`);
        if (caseItem && target) {
          target.textContent = `${axis}: ${caseItem.radar_explanations[axis]}`;
        }
      };
      button.addEventListener("click", showAxis);
      button.addEventListener("mouseenter", showAxis);
      button.addEventListener("focus", showAxis);
    });
    root.querySelectorAll("[data-network-node]").forEach((button) => {
      const showNode = () => {
        const [caseId, nodeId] = button.getAttribute("data-network-node").split(":");
        const caseItem = state.cases.find((item) => item.id === caseId);
        const node = caseItem?.network_nodes.find((item) => item.id === nodeId);
        const target = root.querySelector(`[data-network-explanation="${CSS.escape(caseId)}"]`);
        if (!node || !target) return;
        root.querySelectorAll(`[data-network-node^="${CSS.escape(caseId)}:"]`).forEach((item) => item.classList.remove("is-active"));
        button.classList.add("is-active");
        target.innerHTML = `
          <h4>${escapeHtml(node.label)}</h4>
          <p>${escapeHtml(node.explanation)}</p>
          <p><strong>Ausgeblendete Systemfrage:</strong> ${escapeHtml(node.system_question)}</p>
          <p><strong>WÖk-Gegenfrage:</strong> ${escapeHtml(node.woek_question)}</p>
        `;
      };
      button.addEventListener("click", showNode);
      button.addEventListener("focus", showNode);
    });
  }

  function render() {
    root.innerHTML = `
      <div class="narrative-lab">
        <div class="narrative-controls">
          <div>
            <p class="hero-kicker">Interaktive Vergleichsstruktur</p>
            <h2>Fünf Narrative, ein gemeinsames Wirkungsfeld</h2>
            <p class="card-text">Wähle ein Narrativ aus oder öffne eine Karte. Radar, Wirkungsnetz und Gegenfrage zeigen, welche Resonanzräume sichtbar werden.</p>
          </div>
          <label>Narrativ auswählen
            <select data-narrative-select>
              ${state.cases.map((caseItem) => `<option value="${escapeHtml(caseItem.id)}">${escapeHtml(caseItem.title)}</option>`).join("")}
            </select>
          </label>
        </div>

        <div class="narrative-interactive-grid">
          ${state.cases.map(renderCaseCard).join("")}
        </div>

        <div class="narrative-detail-interactive">
          ${state.cases.map(renderDetail).join("")}
        </div>

        ${renderOverallNetwork()}
      </div>
    `;
    bindInteractions();
    setActiveCase(state.cases[0]?.id || null);
  }

  async function init() {
    try {
      const dataUrl = new URL("../data/narrative-cases.json", scriptUrl).href;
      const response = await fetch(dataUrl);
      state.cases = await response.json();
      render();
    } catch (error) {
      root.innerHTML = `
        <article class="card">
          <p class="card-kicker">Hinweis</p>
          <h2>Die interaktive Analyse konnte nicht geladen werden.</h2>
          <p>Die Seite bleibt inhaltlich nutzbar. Bitte versuche es später erneut.</p>
        </article>
      `;
    }
  }

  init();
})();
