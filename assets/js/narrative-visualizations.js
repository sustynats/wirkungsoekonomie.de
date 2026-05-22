(function () {
  const root = document.querySelector("[data-narrative-app]");
  const scriptUrl =
    document.currentScript?.src || document.querySelector('script[src*="narrative-visualizations.js"]')?.src || "";

  if (!root) return;

  document.documentElement.classList.add("narrative-js");

  const radarAxisDefinitions = [
    {
      id: "angst",
      label: "Angst",
      shortLabel: "Angst",
      description: "Bedrohungsframes aktivieren Unsicherheit, Abwehr oder Kontrollverlust."
    },
    {
      id: "wut",
      label: "Wut",
      shortLabel: "Wut",
      description: "Schuldzuweisungen verstärken Empörung und politische Erregung."
    },
    {
      id: "misstrauen",
      label: "Misstrauen",
      shortLabel: "Misstrauen",
      description: "Das Narrativ schwächt Vertrauen in Institutionen, Verfahren oder demokratische Akteure."
    },
    {
      id: "feindbild",
      label: "Feindbild",
      shortLabel: "Feindbild",
      description: "Gruppen, Institutionen oder politische Gegner werden als Problem oder Bedrohung markiert."
    },
    {
      id: "kontrollsehnsucht",
      label: "Kontrollsehnsucht",
      shortLabel: "Kontrolle",
      description: "Das Narrativ verstärkt das Bedürfnis nach einfachen, harten oder eindeutigen Lösungen."
    },
    {
      id: "vereinfachung",
      label: "Vereinfachung",
      shortLabel: "Vereinfachung",
      description: "Komplexe Ursachen werden auf scheinbar eindeutige Erklärungen reduziert."
    },
    {
      id: "autoritarismuspotenzial",
      label: "Autoritarismuspotenzial",
      shortLabel: "Autoritarismus",
      description: "Die Anschlussfähigkeit für Ordnung, Durchsetzung und Kontrolle steigt gegenüber demokratischer Aushandlung."
    },
    {
      id: "diskursverengung",
      label: "Diskursverengung",
      shortLabel: "Diskurs",
      description: "Der Debattenraum wird enger, weil Bedrohung, Schuld oder Abwehr dominieren."
    },
    {
      id: "demokratierisiko",
      label: "Demokratierisiko",
      shortLabel: "Demokratie",
      description: "Vertrauen, Minderheitenschutz, Kompromissfähigkeit oder institutionelle Stabilität werden geschwächt."
    },
    {
      id: "entsolidarisierung",
      label: "Entsolidarisierung",
      shortLabel: "Entsolidarisierung",
      description: "Gemeinsame Verantwortung wird geschwächt, weil Gruppen gegeneinander gestellt werden."
    }
  ];

  const radarAxisById = Object.fromEntries(radarAxisDefinitions.map((axis) => [axis.id, axis]));

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
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / radarAxisDefinitions.length;
    const scaled = (value / 5) * radius;
    return {
      x: center + Math.cos(angle) * scaled,
      y: center + Math.sin(angle) * scaled
    };
  }

  function gridPoints(value, radius, center = 125) {
    return radarAxisDefinitions
      .map((_, index) => {
        const point = polar(index, value, radius, center);
        return `${point.x.toFixed(1)},${point.y.toFixed(1)}`;
      })
      .join(" ");
  }

  function radarValue(item, axisId) {
    const value = Number(item.radar?.[axisId] || 0);
    return Number.isFinite(value) ? Math.max(0, Math.min(5, value)) : 0;
  }

  function strongestAxes(item, limit = 3) {
    return radarAxisDefinitions
      .map((axis, index) => ({ ...axis, value: radarValue(item, axis.id), order: index }))
      .filter((axis) => axis.value > 0)
      .sort((a, b) => b.value - a.value || a.order - b.order)
      .slice(0, limit);
  }

  function renderStrongestAxes(item) {
    const axes = strongestAxes(item, 3);
    if (!axes.length) return "";
    return `<p class="mini-radar-strongest"><span>Stärkste Ausschläge:</span> ${axes
      .map((axis) => escapeHtml(axis.shortLabel))
      .join(" · ")}</p>`;
  }

  function renderRadar(item, options = {}) {
    const mini = typeof options === "boolean" ? options : Boolean(options.mini);
    const radius = mini ? 72 : 88;
    const center = 125;
    const size = 250;
    const points = radarAxisDefinitions
      .map((axis, index) => {
        const point = polar(index, radarValue(item, axis.id), radius, center);
        return `${point.x.toFixed(1)},${point.y.toFixed(1)}`;
      })
      .join(" ");
    const labels = mini
      ? ""
      : radarAxisDefinitions
          .map((axis, index) => {
            const point = polar(index, 5.9, radius, center);
            const anchor = point.x < center - 8 ? "end" : point.x > center + 8 ? "start" : "middle";
            return `
              <g class="radar-axis-label-hit" tabindex="0" role="button" data-axis="${escapeHtml(axis.id)}" data-axis-value="${radarValue(item, axis.id)}" aria-label="${escapeHtml(axis.label)}: Wert ${radarValue(item, axis.id)} von 5. ${escapeHtml(axis.description)}">
                <text class="radar-label" x="${point.x.toFixed(1)}" y="${point.y.toFixed(1)}" text-anchor="${anchor}" data-axis-label="${escapeHtml(axis.id)}">${escapeHtml(axis.shortLabel)}</text>
                <title>${escapeHtml(axis.label)}: ${radarValue(item, axis.id)} von 5. ${escapeHtml(axis.description)}</title>
              </g>
            `;
          })
          .join("");

    return `
      <svg class="${mini ? "mini-radar" : "radar-svg"}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${mini ? "Resonanzprofil" : "Wirkungsradar"} für ${escapeHtml(item.title)}. Skala 0 innen bis 5 außen. Außen bedeutet stärker ausgeprägtes Wirkungspotenzial, nicht besser.">
        <title>${mini ? "Resonanzprofil" : "Wirkungsradar"} für ${escapeHtml(item.title)}: 0 innen, 5 außen. Außen bedeutet stärker, nicht besser.</title>
        <polygon class="radar-grid" points="${gridPoints(1, radius, center)}"></polygon>
        <polygon class="radar-grid" points="${gridPoints(3, radius, center)}"></polygon>
        <polygon class="radar-grid radar-grid-outer" points="${gridPoints(5, radius, center)}"></polygon>
        ${radarAxisDefinitions
          .map((axis, index) => {
            const end = polar(index, 5, radius, center);
            return `<line class="radar-axis-line" x1="${center}" y1="${center}" x2="${end.x.toFixed(1)}" y2="${end.y.toFixed(1)}"><title>${escapeHtml(axis.label)}: ${escapeHtml(axis.description)}</title></line>`;
          })
          .join("")}
        <polygon class="radar-shape" points="${points}"></polygon>
        ${radarAxisDefinitions
          .map((axis, index) => {
            const value = radarValue(item, axis.id);
            const point = polar(index, value, radius, center);
            if (mini) {
              return `<circle class="radar-point" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="3"><title>${escapeHtml(axis.label)}: ${value} von 5. ${escapeHtml(axis.description)}</title></circle>`;
            }
            return `
              <circle class="radar-point radar-hit" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="4.4" tabindex="0" role="button" data-axis="${escapeHtml(axis.id)}" data-axis-value="${value}" aria-label="${escapeHtml(axis.label)}: Wert ${value} von 5. ${escapeHtml(axis.description)}">
                <title>${escapeHtml(axis.label)}: ${value} von 5. ${escapeHtml(axis.description)}</title>
              </circle>
            `;
          })
          .join("")}
        ${labels}
        ${mini ? "" : '<text class="radar-scale" x="125" y="40" text-anchor="middle">5</text><text class="radar-scale" x="125" y="72" text-anchor="middle">3</text><text class="radar-scale" x="125" y="106" text-anchor="middle">1</text><text class="radar-scale radar-scale-zero" x="125" y="128" text-anchor="middle">0</text>'}
      </svg>
    `;
  }

  function renderMiniRadarBlock(item) {
    return `
      <div class="mini-radar-block" aria-label="Resonanzprofil ${escapeHtml(item.title)}">
        <span class="mini-radar-title">Resonanzprofil</span>
        ${renderRadar(item, { mini: true })}
        <span class="mini-radar-caption">0 innen · 5 außen</span>
        <span class="mini-radar-caption">Außen = stärker, nicht besser</span>
        ${renderStrongestAxes(item)}
      </div>
    `;
  }

  function renderRadarPanel(item) {
    return `
      <div class="radar-layout radar-panel">
        <div>
          <h3>Wirkungsradar</h3>
          <p class="radar-subtitle">Welche Resonanzräume werden durch dieses Narrativ besonders stark aktiviert?</p>
          <p class="narrative-note">Dieses Radar bewertet nicht, ob eine Aussage wahr oder falsch ist. Es zeigt, welche Wirkungspotenziale die Formulierung im demokratischen Resonanzraum aktiviert.</p>
          ${renderRadar(item)}
          <div class="radar-legend" aria-label="Legende">
            <span>0 innen · 5 außen</span>
            <span>Außen bedeutet nicht besser, sondern stärker ausgeprägtes Wirkungspotenzial.</span>
          </div>
          <p class="radar-scale-note">Skala: 0 = nicht ausgeprägt · 5 = sehr stark ausgeprägt.</p>
          <div class="radar-axis-buttons">
            ${radarAxisDefinitions
              .map(
                (axis) =>
                  `<button type="button" data-axis="${escapeHtml(axis.id)}" data-axis-value="${radarValue(item, axis.id)}">${escapeHtml(axis.shortLabel)}</button>`
              )
              .join("")}
          </div>
          <p class="radar-explanation" data-axis-explanation>Tippe, fokussiere oder fahre über eine Achse, um Wert und Bedeutung zu lesen.</p>
        </div>
        <details class="radar-values-details">
          <summary>Radarwerte erklären</summary>
          <table class="radar-table">
            <thead><tr><th>Achse</th><th>Wert</th><th>Bedeutung</th></tr></thead>
            <tbody>
              ${radarAxisDefinitions
                .map(
                  (axis) => `
                    <tr>
                      <td>${escapeHtml(axis.label)}</td>
                      <td><strong>${radarValue(item, axis.id)} / 5</strong></td>
                      <td>${escapeHtml(axis.description)}</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </details>
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
        ${renderMiniRadarBlock(item)}
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

  function immediateFrame(item) {
    const frameNode = (item.network?.nodes || []).find((node) => node.type === "mechanism");
    return frameNode?.label || item.mechanisms?.[0] || "Frame nicht gesetzt";
  }

  function problemDefinition(item) {
    const visible = item.perception_shift?.visible || [];
    if (!visible.length) return "Die Problemdefinition wird über den dominanten Frame verdichtet.";
    return `Das Problem erscheint vor allem als ${visible.map((entry) => entry.toLowerCase()).join(", ")}.`;
  }

  function blameAttribution(item) {
    const visible = item.perception_shift?.visible || [];
    const mechanisms = item.mechanisms || [];
    const hasBlameMechanism = mechanisms.some((entry) => /schuld|sündenbock|feind|delegitimierung|bedrohung/i.test(entry));
    if (hasBlameMechanism) {
      return "Verantwortung wird auf markierte Gruppen, Institutionen oder politische Gegner verdichtet, statt als Systemfrage prüfbar zu bleiben.";
    }
    if (visible.length) {
      return `Verantwortung wird durch den Frame auf ${visible[0].toLowerCase()} zugespitzt.`;
    }
    return "Verantwortung wird auf eine scheinbar eindeutige Ursache zugespitzt.";
  }

  function sdgReferences(item) {
    const base = [
      "SDG+ Demokratie",
      "SDG+ Medienqualität",
      "SDG+ Diskursfähigkeit",
      "SDG+ institutionelles Vertrauen",
      "SDG 16 Frieden, Gerechtigkeit und starke Institutionen"
    ];
    const cluster = String(item.cluster || "").toLowerCase();
    if (cluster.includes("klima") || cluster.includes("energie")) {
      base.push("SDG 7 bezahlbare und saubere Energie", "SDG 13 Klimaschutz");
    }
    if (cluster.includes("migration") || cluster.includes("identität")) {
      base.push("SDG 10 weniger Ungleichheiten", "SDG+ gesellschaftlicher Zusammenhalt");
    }
    if (cluster.includes("kulturkampf")) {
      base.push("SDG 5 Geschlechtergerechtigkeit", "SDG+ Minderheitenschutz");
    }
    return base;
  }

  function analysisLimitsNote() {
    return "Diese Struktur beschreibt Wirkungspotenziale und Resonanzrisiken, keinen automatisch nachgewiesenen Einzelschaden und keine Bewertung von Personen.";
  }

  function renderAnalysis(item) {
    return `
      <div class="narrative-analysis-grid">
        <article class="analysis-box source-box">
          <p class="box-kicker">1. Originalbegriff / Formulierung</p>
          <blockquote>${escapeHtml(item.source.excerpt)}</blockquote>
          <p>Quelle: <a class="text-link" href="${escapeHtml(item.source.url)}" rel="noopener noreferrer">${escapeHtml(item.source.title)}</a></p>
          <p>Abruf: ${escapeHtml(item.source.retrieved_at)}</p>
          <p>${escapeHtml(item.source.context)}</p>
        </article>
        <article class="analysis-box">
          <p class="box-kicker">2. unmittelbarer Frame</p>
          <h4>${escapeHtml(immediateFrame(item))}</h4>
          ${list(item.mechanisms)}
        </article>
        <article class="analysis-box">
          <p class="box-kicker">3. emotionaler Resonanzraum</p>
          ${list(item.resonance_spaces)}
        </article>
        <article class="analysis-box">
          <p class="box-kicker">4. implizite Problemdefinition</p>
          <p>${escapeHtml(problemDefinition(item))}</p>
        </article>
        <article class="analysis-box">
          <p class="box-kicker">5. implizite Schuldzuweisung</p>
          <p>${escapeHtml(blameAttribution(item))}</p>
        </article>
        <article class="analysis-box">
          <p class="box-kicker">6. ausgeblendete Systemfragen</p>
          ${list(item.system_questions, "narrative-list")}
        </article>
        <article class="analysis-box">
          <p class="box-kicker">7. wahrscheinliche Wirkungspotenziale</p>
          ${list(item.mechanisms)}
          ${list(item.resonance_spaces)}
        </article>
        <article class="analysis-box">
          <p class="box-kicker">8. SDG-/SDG+-Bezug</p>
          ${list(sdgReferences(item), "narrative-list")}
        </article>
        <article class="analysis-box">
          <p class="box-kicker">9. demokratische Risiken</p>
          ${list(item.democratic_effects)}
        </article>
        <article class="analysis-box">
          <p class="box-kicker">10. WÖk-Gegenfrage</p>
          <h4>${escapeHtml(item.woek_question)}</h4>
        </article>
        <article class="analysis-box">
          <p class="box-kicker">Zusatz: mögliche Wahrnehmungsverschiebung</p>
          <h4>macht sichtbar</h4>
          ${list(item.perception_shift.visible)}
          <h4>macht unsichtbar</h4>
          ${list(item.perception_shift.hidden)}
        </article>
        <article class="analysis-box">
          <p class="box-kicker">11. kurze Zusammenfassung</p>
          <p>${escapeHtml(item.short_thesis)}</p>
          <p>${escapeHtml(analysisLimitsNote())}</p>
        </article>
        <article class="analysis-box">
          <p class="box-kicker">12. Quellen-/Materialhinweis</p>
          <p>${escapeHtml(item.source.context)}</p>
          <p>Kurzer Begriffsauszug, eigene wirkungsanalytische Einordnung. Keine Vollzitation und keine empirische Wirkungsbehauptung.</p>
        </article>
      </div>
      <div class="woek-question-box">
        <p class="box-kicker">WÖk-Gegenfrage im Fokus</p>
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
    const nodes = [
      { id: "center", label: "gemeinsames Resonanzfeld", x: 500, y: 290, type: "center" },
      { id: "misstrauen", label: "Misstrauen", x: 500, y: 84, type: "shared" },
      { id: "angst", label: "Angst", x: 664, y: 106, type: "shared" },
      { id: "kontrolle", label: "Kontrolle", x: 765, y: 192, type: "shared" },
      { id: "schuld", label: "Schuld", x: 822, y: 292, type: "shared" },
      { id: "volk", label: "Volk / Wir", x: 786, y: 396, type: "shared" },
      { id: "feindbild", label: "Feindbild", x: 674, y: 482, type: "shared" },
      { id: "institutionen", label: "Institutionen", x: 500, y: 508, type: "democracy" },
      { id: "medien", label: "Medien", x: 326, y: 482, type: "media" },
      { id: "wahrheit", label: "Wahrheit", x: 214, y: 396, type: "media" },
      { id: "demokratie", label: "Demokratie", x: 178, y: 292, type: "democracy" },
      { id: "rechtsstaat", label: "Rechtsstaat", x: 236, y: 192, type: "democracy" },
      { id: "klimapolitik", label: "Klimapolitik", x: 336, y: 106, type: "topic" },
      { id: "migration", label: "Migration", x: 664, y: 106, type: "topic", offsetY: 62 },
      { id: "vielfalt", label: "Vielfalt", x: 164, y: 376, type: "topic" },
      { id: "energie", label: "Energie", x: 336, y: 106, type: "topic", offsetY: -62 },
      { id: "freiheit", label: "Freiheit", x: 664, y: 106, type: "topic", offsetY: -62 }
    ];
    const nodeById = Object.fromEntries(nodes.map((node) => [node.id, { ...node, y: node.y + (node.offsetY || 0) }]));
    const edges = [
      ["center", "misstrauen", "verdichtet"],
      ["center", "kontrolle", "ordnet"],
      ["center", "schuld", "externalisiert"],
      ["center", "feindbild", "markiert"],
      ["center", "wahrheit", "konfligiert"],
      ["misstrauen", "institutionen", "schwächt"],
      ["institutionen", "medien", "verschiebt"],
      ["medien", "wahrheit", "umkämpft"],
      ["wahrheit", "demokratie", "stabilisiert oder beschädigt"],
      ["demokratie", "rechtsstaat", "trägt"],
      ["klimapolitik", "energie", "rahmt"],
      ["energie", "freiheit", "koppelt"],
      ["freiheit", "kontrolle", "spannt"],
      ["angst", "kontrolle", "aktiviert"],
      ["migration", "volk", "grenzt"],
      ["volk", "schuld", "ordnet zu"],
      ["schuld", "feindbild", "verstärkt"],
      ["vielfalt", "demokratie", "prüft"],
      ["vielfalt", "feindbild", "wird gerahmt"]
    ];
    const nodeMarkup = nodes
      .map((node) => {
        const point = nodeById[node.id];
        const width = node.type === "center" ? 230 : 132;
        const height = node.type === "center" ? 76 : 44;
        const x = point.x - width / 2;
        const y = point.y - height / 2;
        const centerLabel =
          node.type === "center"
            ? `<text x="${point.x}" y="${point.y - 8}" text-anchor="middle"><tspan x="${point.x}">gemeinsames</tspan><tspan x="${point.x}" dy="28">Resonanzfeld</tspan></text>`
            : `<text x="${point.x}" y="${point.y + 6}" text-anchor="middle">${escapeHtml(node.label)}</text>`;
        return `
          <g class="overall-node overall-node-${escapeHtml(node.type)}" data-overall-node="${escapeHtml(node.id)}">
            <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${height / 2}"></rect>
            ${centerLabel}
          </g>
        `;
      })
      .join("");
    const edgeMarkup = edges
      .map(([from, to, verb], index) => {
        const a = nodeById[from];
        const b = nodeById[to];
        if (!a || !b) return "";
        const midX = (a.x + b.x) / 2;
        const midY = (a.y + b.y) / 2;
        return `
          <g class="overall-edge" data-overall-edge="${index}">
            <line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"></line>
            <text x="${midX}" y="${midY - 6}" text-anchor="middle">${escapeHtml(verb)}</text>
          </g>
        `;
      })
      .join("");
    return `
      <section class="overall-network-panel" aria-labelledby="overall-network-title">
        <p class="hero-kicker">Gesamt-Wirkungsnetz</p>
        <h2 id="overall-network-title">Wie die Narrative zusammenwirken</h2>
        <p>Die Begriffe stehen nicht isoliert nebeneinander. Sie teilen Resonanzräume und bilden gemeinsam ein Feld aus Misstrauen, Kontrolle, Schuld, Feindbild und Wahrheitskonflikt.</p>
        <div class="overall-web" aria-label="Gemeinsames Resonanzfeld mit Verbindungslinien">
          <svg class="overall-web-svg" viewBox="0 0 1000 580" role="img" aria-labelledby="overall-svg-title overall-svg-desc">
            <title id="overall-svg-title">Gesamt-Wirkungsnetz politischer Narrative</title>
            <desc id="overall-svg-desc">Das Netz verbindet ein gemeinsames Resonanzfeld mit Knoten wie Misstrauen, Kontrolle, Schuld, Feindbild, Institutionen, Medien, Wahrheit, Demokratie, Migration, Klima, Energie und Freiheit.</desc>
            <defs>
              <radialGradient id="overall-soft-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#eef5ee" stop-opacity="0.9"></stop>
                <stop offset="100%" stop-color="#eef5ee" stop-opacity="0"></stop>
              </radialGradient>
            </defs>
            <circle class="overall-glow" cx="500" cy="290" r="235"></circle>
            <ellipse class="overall-ring" cx="500" cy="290" rx="348" ry="224"></ellipse>
            <ellipse class="overall-ring overall-ring-inner" cx="500" cy="290" rx="230" ry="148"></ellipse>
            ${edgeMarkup}
            ${nodeMarkup}
          </svg>
          <ul class="overall-edge-list" aria-label="Lesbare Verbindungspfade">
            ${edges
              .slice(0, 10)
              .map(([from, to, verb]) => `<li>${escapeHtml(nodeById[from]?.label || from)} <strong>${escapeHtml(verb)}</strong> ${escapeHtml(nodeById[to]?.label || to)}</li>`)
              .join("")}
          </ul>
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
          <div>${a ? renderMiniRadarBlock(a) : ""}<strong>${escapeHtml(a?.title || "")}</strong></div>
          <div>${b ? renderMiniRadarBlock(b) : ""}<strong>${escapeHtml(b?.title || "")}</strong></div>
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
            <div class="radar-reading-note">
              <h3>Wie das Radar zu lesen ist</h3>
              <p>Die Radare zeigen keine Wahrheitsskala und kein Qualitätsurteil. Sie zeigen, welche Resonanzräume ein Begriff oder Narrativ öffnet. Je weiter außen ein Punkt liegt, desto stärker ist das jeweilige Wirkungspotenzial ausgeprägt. Außen bedeutet also nicht besser, sondern stärker.</p>
            </div>
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
        const axis = radarAxisById[button.getAttribute("data-axis")];
        const value = button.getAttribute("data-axis-value");
        const target = button.closest(".radar-panel")?.querySelector("[data-axis-explanation]");
        if (target && axis) {
          target.textContent = `${axis.label}: Wert ${value || 0} von 5. ${axis.description}`;
        }
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
