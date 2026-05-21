(function () {
  const root = document.querySelector("[data-narrative-app]");
  const scriptUrl =
    document.currentScript?.src || document.querySelector('script[src*="narrative-visualizations.js"]')?.src || "";

  if (!root) return;

  document.documentElement.classList.add("narrative-js");

  const axisDefs = [
    ["angst", "Angst", "Bedrohungsframes verstärken das Gefühl, dass Sicherheit und Kontrolle verloren gehen."],
    ["wut", "Wut", "Schuldzuweisungen emotionalisieren Konflikte und erhöhen Empörungsenergie."],
    ["misstrauen", "Misstrauen", "Wenn Ursachen auf Gegner reduziert werden, sinkt Vertrauen in Institutionen, Medien und Verfahren."],
    ["feindbild", "Feindbild", "Kollektive Zuschreibungen markieren Gruppen oder politische Gegner als Problem."],
    ["kontrollsehnsucht", "Kontrollsehnsucht", "Starke Kontrollversprechen werden anschlussfähig, wenn Unsicherheit dominiert."],
    ["vereinfachung", "Vereinfachung", "Komplexe Ursachen werden auf eine scheinbar eindeutige Erklärung reduziert."],
    ["autoritarismuspotenzial", "Autoritarismuspotenzial", "Einfache Ordnung wird gegen komplexe demokratische Verfahren gestellt."],
    ["diskursverengung", "Diskursverengung", "Die Debatte verengt sich, wenn Bedrohung, Abwehr oder Schuld im Vordergrund stehen."],
    ["demokratierisiko", "Demokratierisiko", "Demokratische Stabilität leidet, wenn Vertrauen, Kompromissfähigkeit und Minderheitenschutz geschwächt werden."],
    ["entsolidarisierung", "Entsolidarisierung", "Wenn Gruppen gegeneinander gestellt werden, sinkt die Bereitschaft zu gemeinsamen Lösungen."]
  ];

  const typeLabels = {
    narrative: "Narrativ",
    mechanism: "Sprachmechanik",
    resonance: "Resonanzraum",
    perception: "Wahrnehmungsverschiebung",
    democracy: "demokratische Wirkung",
    system: "ausgeblendete Systemfrage",
    woek: "WÖk-Gegenfrage",
    counterframe: "Gegenframe"
  };

  const state = {
    cases: [],
    activeId: null,
    activeTab: "analyse",
    activeFilter: "Alle",
    compareA: null,
    compareB: null
  };

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function slugAnchor(item) {
    const map = {
      altparteien: "narrativ-altparteien",
      "angst-vor-afd-wahlsieg": "narrativ-angst-vor-afd-wahlsieg",
      altparteiendiktatur: "narrativ-altparteiendiktatur",
      masseneinwanderung: "narrativ-masseneinwanderung",
      remigration: "narrativ-remigration",
      "kehrtwende-180-grad": "narrativ-kehrtwende-180-grad",
      "planwirtschaftliche-energiewende": "narrativ-planwirtschaftliche-energiewende",
      klimadiktatur: "narrativ-klimadiktatur",
      genderismus: "narrativ-genderismus",
      "medien-zensur": "narrativ-medien-zensur"
    };
    return map[item.id] || `narrativ-${item.id}`;
  }

  function getActiveCase() {
    return state.cases.find((item) => item.id === state.activeId) || state.cases[0];
  }

  function list(items, className = "narrative-chip-list") {
    return `<ul class="${className}">${(items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }

  function polar(index, value, radius, center = 125) {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / axisDefs.length;
    const scaled = (value / 5) * radius;
    return {
      x: center + Math.cos(angle) * scaled,
      y: center + Math.sin(angle) * scaled
    };
  }

  function gridPoints(value, radius, center = 125) {
    return axisDefs
      .map((_, index) => {
        const point = polar(index, value, radius, center);
        return `${point.x.toFixed(1)},${point.y.toFixed(1)}`;
      })
      .join(" ");
  }

  function renderRadar(item, mini = false) {
    const radius = mini ? 72 : 88;
    const center = 125;
    const size = 250;
    const values = item.radar || {};
    const points = axisDefs
      .map(([key], index) => {
        const point = polar(index, values[key] || 0, radius, center);
        return `${point.x.toFixed(1)},${point.y.toFixed(1)}`;
      })
      .join(" ");
    const labels = mini
      ? ""
      : axisDefs
          .map(([key, label], index) => {
            const point = polar(index, 5.9, radius, center);
            const anchor = point.x < center - 8 ? "end" : point.x > center + 8 ? "start" : "middle";
            return `<text class="radar-label" x="${point.x.toFixed(1)}" y="${point.y.toFixed(1)}" text-anchor="${anchor}" data-axis-label="${escapeHtml(key)}">${escapeHtml(label)}</text>`;
          })
          .join("");

    return `
      <svg class="${mini ? "mini-radar" : "radar-svg"}" viewBox="0 0 ${size} ${size}" role="img" aria-label="Wirkungsradar für ${escapeHtml(item.title)}">
        <polygon class="radar-grid" points="${gridPoints(1, radius, center)}"></polygon>
        <polygon class="radar-grid" points="${gridPoints(3, radius, center)}"></polygon>
        <polygon class="radar-grid radar-grid-outer" points="${gridPoints(5, radius, center)}"></polygon>
        ${axisDefs
          .map(([, ,], index) => {
            const end = polar(index, 5, radius, center);
            return `<line class="radar-axis-line" x1="${center}" y1="${center}" x2="${end.x.toFixed(1)}" y2="${end.y.toFixed(1)}"></line>`;
          })
          .join("")}
        <polygon class="radar-shape" points="${points}"></polygon>
        ${axisDefs
          .map(([key], index) => {
            const point = polar(index, values[key] || 0, radius, center);
            return `<circle class="radar-point" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="${mini ? 3 : 4.2}"></circle>`;
          })
          .join("")}
        ${labels}
        ${mini ? "" : '<text class="radar-scale" x="125" y="40" text-anchor="middle">5</text><text class="radar-scale" x="125" y="72" text-anchor="middle">3</text><text class="radar-scale" x="125" y="106" text-anchor="middle">1</text>'}
      </svg>
    `;
  }

  function renderRadarPanel(item) {
    const values = item.radar || {};
    return `
      <div class="radar-layout">
        <div>
          <h3>Wirkungsradar: ${escapeHtml(item.title)}</h3>
          <p class="narrative-note">Die Werte zeigen eine wirkungsanalytische Einordnung. Sie bewerten nicht Wahrheit oder Zulässigkeit einer Aussage, sondern die Resonanzräume, die durch Sprache geöffnet werden.</p>
          ${renderRadar(item)}
          <div class="radar-legend" aria-label="Legende"><span>0 niedrig</span><span>3 deutlich</span><span>5 sehr stark</span></div>
          <div class="radar-axis-buttons">
            ${axisDefs.map(([key, label, text]) => `<button type="button" data-axis="${escapeHtml(key)}" data-axis-text="${escapeHtml(text)}">${escapeHtml(label)}</button>`).join("")}
          </div>
          <p class="radar-explanation" data-axis-explanation>Tippe oder fokussiere eine Achse, um ihre Wirkung zu lesen.</p>
        </div>
        <table class="radar-table">
          <thead><tr><th>Achse</th><th>Wert</th><th>Erklärung</th></tr></thead>
          <tbody>
            ${axisDefs
              .map(
                ([key, label, text]) => `
                  <tr>
                    <td>${escapeHtml(label)}</td>
                    <td><strong>${values[key] || 0} / 5</strong></td>
                    <td>${escapeHtml(text)}</td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function svgLabel(text) {
    const words = String(text || "").split(/\s+/).filter(Boolean);
    const lines = [];
    let line = "";
    words.forEach((word) => {
      const next = line ? `${line} ${word}` : word;
      if (next.length > 20 && line) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    });
    if (line) lines.push(line);
    return lines.slice(0, 3).map((part, index, all) => {
      const y = (index - (all.length - 1) / 2) * 14;
      return `<tspan x="0" y="${y}">${escapeHtml(part)}</tspan>`;
    }).join("");
  }

  function renderCard(item) {
    return `
      <button class="narrative-case-card" type="button" data-case-card="${escapeHtml(item.id)}" aria-label="Analyse ${escapeHtml(item.title)} öffnen">
        <span class="narrative-status">Pilotanalyse</span>
        <span class="narrative-cluster">${escapeHtml(item.cluster)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.short_thesis)}</p>
        ${list(item.mechanisms.slice(0, 3))}
        ${renderRadar(item, true)}
        <span class="narrative-card-action">Analyse ansehen</span>
      </button>
    `;
  }

  function renderFilters() {
    const clusters = ["Alle", ...Array.from(new Set(state.cases.map((item) => item.cluster)))];
    return `
      <div class="narrative-filterbar" aria-label="Narrativfilter">
        ${clusters
          .map(
            (cluster) => `
              <button type="button" data-filter="${escapeHtml(cluster)}" class="${cluster === state.activeFilter ? "is-active" : ""}">
                ${escapeHtml(cluster)}
              </button>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderAnalysis(item) {
    return `
      <div class="narrative-analysis-grid">
        <article class="analysis-box source-box">
          <p class="box-kicker">Original / Quelle</p>
          <blockquote>${escapeHtml(item.source.excerpt)}</blockquote>
          <p>Quelle: <a class="text-link" href="${escapeHtml(item.source.url)}" rel="noopener noreferrer">${escapeHtml(item.source.title)}</a></p>
          <p>Abruf: ${escapeHtml(item.source.retrieved_at)}</p>
          <p>${escapeHtml(item.source.context)}</p>
        </article>
        <article class="analysis-box">
          <p class="box-kicker">Sprachliche Mechanik</p>
          ${list(item.mechanisms)}
        </article>
        <article class="analysis-box">
          <p class="box-kicker">Resonanzräume</p>
          ${list(item.resonance_spaces)}
        </article>
        <article class="analysis-box">
          <p class="box-kicker">Demokratische Wirkung</p>
          ${list(item.democratic_effects)}
        </article>
        <article class="analysis-box">
          <p class="box-kicker">Wahrnehmungsverschiebung</p>
          <h4>macht sichtbar</h4>
          ${list(item.perception_shift.visible)}
          <h4>macht unsichtbar</h4>
          ${list(item.perception_shift.hidden)}
        </article>
        <article class="analysis-box">
          <p class="box-kicker">Ausgeblendete Systemfragen</p>
          ${list(item.system_questions, "narrative-list")}
        </article>
      </div>
      <div class="woek-question-box">
        <p class="box-kicker">WÖk-Gegenfrage</p>
        <h3>${escapeHtml(item.woek_question)}</h3>
      </div>
    `;
  }

  function pathSteps(item) {
    const firstMechanism = item.mechanisms[0] || "Frame";
    const firstResonance = item.resonance_spaces[0] || "Resonanzraum";
    const visible = item.perception_shift.visible[0] || "Wahrnehmung";
    const hidden = item.perception_shift.hidden[0] || "Systemfrage";
    const democracy = item.democratic_effects[0] || "demokratische Wirkung";
    return [
      ["Narrativ", item.title],
      ["Frame", firstMechanism],
      ["Resonanzraum", firstResonance],
      ["Wahrnehmungsverschiebung", `${visible}; verdeckt: ${hidden}`],
      ["demokratische Wirkung", democracy],
      ["Systemfrage", item.system_questions[0]],
      ["WÖk-Gegenfrage", item.woek_question]
    ];
  }

  function renderPath(item) {
    return `
      <div class="impact-path" aria-label="Wirkungspfad ${escapeHtml(item.title)}">
        ${pathSteps(item)
          .map(
            ([label, text], index) => `
              <article class="impact-path-step">
                <span>${String(index + 1).padStart(2, "0")}</span>
                <p class="box-kicker">${escapeHtml(label)}</p>
                <h3>${escapeHtml(text)}</h3>
              </article>
            `
          )
          .join("")}
      </div>
    `;
  }

  function nodePosition(index, total, radius, centerX, centerY, start = -Math.PI / 2) {
    const angle = start + (Math.PI * 2 * index) / Math.max(total, 1);
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    };
  }

  function renderNetwork(item) {
    const nodes = item.network?.nodes || [];
    const edges = item.network?.edges || [];
    const center = nodes.find((node) => node.type === "narrative") || nodes[0];
    const ringNodes = nodes.filter((node) => node.id !== center?.id);
    const positions = new Map();
    const cx = 420;
    const cy = 260;
    positions.set(center.id, { x: cx, y: cy });
    ringNodes.forEach((node, index) => {
      const radius = node.type === "woek" || node.type === "counterframe" ? 245 : 190;
      positions.set(node.id, nodePosition(index, ringNodes.length, radius, cx, cy));
    });

    const labelById = new Map(nodes.map((node) => [node.id, node.label]));
    const typeById = new Map(nodes.map((node) => [node.id, node.type]));

    return `
      <div class="network-mode">
        <div class="network-svg-wrap">
          <svg class="impact-network-svg" viewBox="0 0 840 520" role="img" aria-label="Kuratiertes Wirkungsnetz für ${escapeHtml(item.title)}">
            <defs>
              <marker id="arrow-${escapeHtml(item.id)}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z"></path>
              </marker>
            </defs>
            <circle class="network-ring ring-one" cx="${cx}" cy="${cy}" r="190"></circle>
            <circle class="network-ring ring-two" cx="${cx}" cy="${cy}" r="245"></circle>
            ${edges
              .map((edge, index) => {
                const source = positions.get(edge.source);
                const target = positions.get(edge.target);
                if (!source || !target) return "";
                const mx = (source.x + target.x) / 2;
                const my = (source.y + target.y) / 2;
                return `
                  <g class="network-edge" data-edge="${index}">
                    <line x1="${source.x}" y1="${source.y}" x2="${target.x}" y2="${target.y}" marker-end="url(#arrow-${escapeHtml(item.id)})"></line>
                    <text x="${mx}" y="${my}" text-anchor="middle">${escapeHtml(edge.verb)}</text>
                  </g>
                `;
              })
              .join("")}
            ${nodes
              .map((node) => {
                const point = positions.get(node.id);
                return `
                  <g class="network-node-svg ${escapeHtml(node.type)}" data-node-svg="${escapeHtml(node.id)}" transform="translate(${point.x} ${point.y})">
                    <rect x="-78" y="-28" width="156" height="56" rx="18"></rect>
                    <text text-anchor="middle">${svgLabel(node.label)}</text>
                  </g>
                `;
              })
              .join("")}
          </svg>
        </div>
        <div class="network-path-list">
          ${edges
            .map(
              (edge) => `
                <button type="button" data-path-edge="${escapeHtml(edge.source)}:${escapeHtml(edge.target)}">
                  <strong>${escapeHtml(labelById.get(edge.source))}</strong>
                  <span>${escapeHtml(edge.verb)}</span>
                  <strong>${escapeHtml(labelById.get(edge.target))}</strong>
                </button>
              `
            )
            .join("")}
        </div>
        <div class="network-node-legend" aria-label="Knotentypen">
          ${Object.entries(typeLabels)
            .filter(([key]) => nodes.some((node) => node.type === key))
            .map(([key, label]) => `<span class="${escapeHtml(key)}">${escapeHtml(label)}</span>`)
            .join("")}
        </div>
        <p class="narrative-note">Auf Mobile wird das Netz zusätzlich als lesbarer Wirkungspfad dargestellt. Die Visualisierung ersetzt keinen Faktencheck und keine juristische Bewertung.</p>
      </div>
    `;
  }

  function renderCounterframe(item) {
    return `
      <div class="counterframe-grid">
        <article class="analysis-box">
          <p class="box-kicker">Was der Frame sichtbar macht</p>
          ${list(item.perception_shift.visible)}
        </article>
        <article class="analysis-box">
          <p class="box-kicker">Was der Frame verdeckt</p>
          ${list(item.perception_shift.hidden)}
        </article>
        <article class="woek-question-box">
          <p class="box-kicker">Gegenframe</p>
          <h3>${escapeHtml(item.counterframe)}</h3>
        </article>
      </div>
    `;
  }

  function renderSource(item) {
    return `
      <div class="analysis-box source-box">
        <p class="box-kicker">Quelle und redaktionelle Grenze</p>
        <blockquote>${escapeHtml(item.source.excerpt)}</blockquote>
        <p>Quelle: <a class="text-link" href="${escapeHtml(item.source.url)}" rel="noopener noreferrer">${escapeHtml(item.source.title)}</a></p>
        <p>Abrufdatum: ${escapeHtml(item.source.retrieved_at)}</p>
        <p>${escapeHtml(item.source.context)}</p>
        <p>Diese Seite analysiert Wirkungspotenziale. Sie behauptet keine Absicht, ersetzt keinen Faktencheck und trifft keine juristische Bewertung.</p>
      </div>
    `;
  }

  function renderFocus() {
    const item = getActiveCase();
    if (!item) return "";
    const tabs = [
      ["analyse", "Analyse"],
      ["radar", "Radar"],
      ["pfad", "Wirkungspfad"],
      ["netz", "Wirkungsnetz"],
      ["gegenframe", "Gegenframe"],
      ["quelle", "Quelle"]
    ];
    const tabContent = {
      analyse: renderAnalysis(item),
      radar: renderRadarPanel(item),
      pfad: renderPath(item),
      netz: renderNetwork(item),
      gegenframe: renderCounterframe(item),
      quelle: renderSource(item)
    }[state.activeTab];

    return `
      <section class="narrative-focus" id="${escapeHtml(slugAnchor(item))}" aria-labelledby="focus-title">
        <div class="narrative-focus-head">
          <div>
            <p class="hero-kicker">${escapeHtml(item.cluster)} · Pilotanalyse</p>
            <h2 id="focus-title">${escapeHtml(item.title)}</h2>
            <p>${escapeHtml(item.short_thesis)}</p>
          </div>
          <a class="btn btn-secondary" href="#narrative-overview">Zur Übersicht</a>
        </div>
        <div class="narrative-tabs" role="tablist" aria-label="Analyseansichten">
          ${tabs
            .map(
              ([key, label]) => `
                <button type="button" role="tab" data-tab="${escapeHtml(key)}" aria-selected="${key === state.activeTab ? "true" : "false"}" class="${key === state.activeTab ? "is-active" : ""}">
                  ${escapeHtml(label)}
                </button>
              `
            )
            .join("")}
        </div>
        <div class="narrative-tab-panel" role="tabpanel">
          ${tabContent}
        </div>
      </section>
    `;
  }

  function renderOverallNetwork() {
    const shared = [
      "Misstrauen",
      "Angst",
      "Kontrolle",
      "Schuld",
      "Volk / Wir",
      "Feindbild",
      "Institutionen",
      "Medien",
      "Wahrheit",
      "Demokratie",
      "Rechtsstaat",
      "Klimapolitik",
      "Migration",
      "Vielfalt",
      "Energie",
      "Freiheit"
    ];
    return `
      <section class="overall-network-panel" aria-labelledby="overall-network-title">
        <p class="hero-kicker">Gesamt-Wirkungsnetz</p>
        <h2 id="overall-network-title">Wie die Narrative zusammenwirken</h2>
        <p>Die Begriffe stehen nicht isoliert nebeneinander. Sie teilen Resonanzräume und bilden gemeinsam ein Feld aus Misstrauen, Kontrolle, Schuld, Feindbild und Wahrheitskonflikt.</p>
        <div class="overall-web" aria-label="Gemeinsames Resonanzfeld">
          <div class="overall-web-center">gemeinsames Resonanzfeld</div>
          ${shared
            .map((node, index) => {
              const angle = -Math.PI / 2 + (Math.PI * 2 * index) / shared.length;
              const x = 50 + Math.cos(angle) * 38;
              const y = 50 + Math.sin(angle) * 40;
              return `<span style="--x:${x.toFixed(1)}%; --y:${y.toFixed(1)}%;">${escapeHtml(node)}</span>`;
            })
            .join("")}
        </div>
        <div class="overall-clusters">
          <article><h3>Institutionen</h3><p>Altparteien, Altparteiendiktatur und Medienframes verdichten Misstrauen gegen Verfahren, Konkurrenz und Kontrolle.</p></article>
          <article><h3>Migration</h3><p>Massenmigration und Remigration verbinden Identität, Sicherheit und Ausschluss zu einer Ordnungserzählung.</p></article>
          <article><h3>Klima</h3><p>Energiewende- und Klimadiktaturframes rahmen Risikosteuerung als Freiheitsverlust.</p></article>
          <article><h3>Kulturkampf</h3><p>Genderismus-Frames koppeln Schutz von Kindern an Abwertung von Vielfalt.</p></article>
        </div>
      </section>
    `;
  }

  function renderCompare() {
    const options = state.cases.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.title)}</option>`).join("");
    const a = state.cases.find((item) => item.id === state.compareA) || state.cases[0];
    const b = state.cases.find((item) => item.id === state.compareB) || state.cases[1] || state.cases[0];
    const common = a && b ? a.resonance_spaces.filter((space) => b.resonance_spaces.includes(space)) : [];
    return `
      <section class="compare-panel" aria-labelledby="compare-title">
        <p class="hero-kicker">Vergleichsmodus</p>
        <h2 id="compare-title">Zwei Narrative vergleichen</h2>
        <div class="compare-controls">
          <label>Erstes Narrativ<select data-compare="a">${options}</select></label>
          <label>Zweites Narrativ<select data-compare="b">${options}</select></label>
        </div>
        <div class="compare-result">
          <div>${a ? renderRadar(a, true) : ""}<strong>${escapeHtml(a?.title || "")}</strong></div>
          <div>${b ? renderRadar(b, true) : ""}<strong>${escapeHtml(b?.title || "")}</strong></div>
          <article>
            <p class="box-kicker">Gemeinsame Resonanzräume</p>
            <p>${common.length ? escapeHtml(common.join(", ")) : "Keine identischen Resonanzräume in der Pilotstruktur."}</p>
          </article>
        </div>
      </section>
    `;
  }

  function renderApp() {
    const filtered =
      state.activeFilter === "Alle" ? state.cases : state.cases.filter((item) => item.cluster === state.activeFilter);
    root.innerHTML = `
      <div class="narrative-lab">
        <div class="narrative-controls" id="narrative-overview">
          <div>
            <p class="hero-kicker">Interaktive Analyseumgebung</p>
            <h2>Zehn Narrative, ein gemeinsames Wirkungsfeld</h2>
            <p class="card-text">Filtere die Begriffe, öffne eine Analyse und wechsle zwischen Radar, Wirkungspfad, Wirkungsnetz, Gegenframe und Quelle.</p>
          </div>
          ${renderFilters()}
        </div>
        <div class="narrative-interactive-grid">
          ${filtered.map(renderCard).join("")}
        </div>
        ${renderFocus()}
        ${renderOverallNetwork()}
        ${renderCompare()}
        <section class="method-limit-box">
          <p class="hero-kicker">Methodische Grenze</p>
          <h2>Wirkungsanalyse ersetzt keine Wahrheitsprüfung.</h2>
          <p>Sie zeigt, welche Resonanzräume Sprache öffnet. Sie behauptet keine Absicht, bewertet keine Zulässigkeit und ersetzt keine juristische Prüfung.</p>
        </section>
      </div>
    `;
    bindInteractions();
  }

  function setActive(id, pushHash = false) {
    if (!state.cases.some((item) => item.id === id)) return;
    state.activeId = id;
    if (pushHash) {
      const item = getActiveCase();
      history.replaceState(null, "", `#${slugAnchor(item)}`);
    }
    renderApp();
    if (pushHash) {
      document.getElementById(slugAnchor(getActiveCase()))?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function bindInteractions() {
    root.querySelectorAll("[data-case-card]").forEach((button) => {
      button.addEventListener("click", () => setActive(button.getAttribute("data-case-card"), true));
    });
    root.querySelectorAll("[data-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        state.activeFilter = button.getAttribute("data-filter");
        renderApp();
      });
    });
    root.querySelectorAll("[data-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        state.activeTab = button.getAttribute("data-tab");
        renderApp();
      });
    });
    root.querySelectorAll("[data-axis]").forEach((button) => {
      const show = () => {
        const target = root.querySelector("[data-axis-explanation]");
        if (target) target.textContent = `${button.textContent}: ${button.getAttribute("data-axis-text")}`;
      };
      button.addEventListener("click", show);
      button.addEventListener("focus", show);
      button.addEventListener("mouseenter", show);
    });
    root.querySelectorAll("[data-compare]").forEach((select) => {
      if (select.getAttribute("data-compare") === "a") select.value = state.compareA;
      if (select.getAttribute("data-compare") === "b") select.value = state.compareB;
      select.addEventListener("change", () => {
        if (select.getAttribute("data-compare") === "a") state.compareA = select.value;
        if (select.getAttribute("data-compare") === "b") state.compareB = select.value;
        renderApp();
      });
    });
  }

  function initFromHash() {
    const hash = window.location.hash.replace("#", "");
    const matched = state.cases.find((item) => slugAnchor(item) === hash);
    state.activeId = matched?.id || state.cases[0]?.id || null;
    state.compareA = state.cases[0]?.id || null;
    state.compareB = state.cases[1]?.id || state.cases[0]?.id || null;
  }

  async function init() {
    try {
      const dataUrl = new URL("../data/narrative-cases.json", scriptUrl).href;
      const response = await fetch(dataUrl);
      state.cases = await response.json();
      initFromHash();
      renderApp();
      window.addEventListener("hashchange", () => {
        const hash = window.location.hash.replace("#", "");
        const matched = state.cases.find((item) => slugAnchor(item) === hash);
        if (matched) {
          state.activeId = matched.id;
          renderApp();
        }
      });
    } catch (error) {
      root.innerHTML = `
        <article class="card">
          <p class="card-kicker">Hinweis</p>
          <h2>Die interaktive Analyse konnte nicht geladen werden.</h2>
          <p>Die statischen Kurzanalysen bleiben unterhalb des Moduls lesbar.</p>
        </article>
      `;
    }
  }

  init();
})();
