const dimensionLabels = {
  mensch: "Mensch",
  planet: "Planet",
  demokratie: "Demokratie",
  datenqualitaet: "Datenqualität"
};

const toolCopy = {
  "lwk-de": {
    searchPlaceholder: "Bundesland suchen, z. B. Bayern",
    noMatch: "Kein Bundesland gefunden. LWK-DE umfasst alle 16 Bundesländer.",
    resultType: "Bundesland",
    profileTitle: "Länderprofil",
    compareHint: "Bis zu vier Bundesländer können nebeneinander als Datenprofile betrachtet werden.",
    checkQuestion: "Welche Landesdaten zeigen, ob Teilhabe, Fläche, Versorgung und demokratische Infrastruktur auf Kurs sind?"
  },
  "ewk-eu27": {
    searchPlaceholder: "EU-Land suchen, z. B. Deutschland",
    noMatch: "Kein Treffer im EWK-EU27-Universum. Europa+ ist als spätere Erweiterung vorgesehen.",
    resultType: "EU-Mitgliedstaat",
    profileTitle: "Europa-Profil",
    compareHint: "Bis zu vier EU-Staaten können nebeneinander als Datenprofile betrachtet werden.",
    checkQuestion: "Welche EU-Zielpfade, Rechtsstaatsdaten und SDG-Indikatoren sind belastbar genug für eine Richtungsaussage?"
  },
  "wwk-193": {
    searchPlaceholder: "Staat suchen, z. B. Ghana",
    noMatch: "Kein Treffer im WWK-193-Grunduniversum. Bitte offizielle englische UN-Bezeichnung prüfen.",
    resultType: "UN-Mitgliedstaat",
    profileTitle: "Welt-Profil",
    compareHint: "Bis zu vier Staaten können nebeneinander als Datenprofile betrachtet werden.",
    checkQuestion: "Welche Felder sind belastbar, welche sind unsicher und welche Dimension muss wegen Datenlücken gesperrt bleiben?"
  }
};

function text(value, fallback = "nicht hinterlegt") {
  return value === null || value === undefined || value === "" ? fallback : String(value);
}

function escapeHtml(value) {
  return text(value, "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function normalize(value) {
  return text(value, "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function entitySearchText(entity) {
  return normalize([
    entity.name,
    entity.official_name,
    entity.iso2,
    entity.iso3,
    entity.nuts_code,
    entity.ags,
    entity.region_group,
    (entity.comparison_groups || []).join(" ")
  ].filter(Boolean).join(" "));
}

function formatNumber(value, suffix = "") {
  if (typeof value !== "number") return "noch nicht validiert";
  return `${new Intl.NumberFormat("de-DE").format(value)}${suffix}`;
}

function statusBadge(entity) {
  return entity.data_status || entity.status || "Metadaten verfügbar";
}

function renderEntityButton(entity) {
  const meta = [
    entity.region_group,
    entity.iso3,
    entity.nuts_code
  ].filter(Boolean).join(" · ");
  return `
    <button class="wk-result-button" type="button" data-entity-id="${escapeHtml(entity.entity_id)}">
      <span>
        <strong>${escapeHtml(entity.name)}</strong>
        <small>${escapeHtml(meta || "Vergleichsgruppe wird vorbereitet")}</small>
      </span>
      <span class="badge">${escapeHtml(statusBadge(entity))}</span>
    </button>
  `;
}

function scoreCard(label, note) {
  return `
    <article class="card wk-score-card wk-score-card-empty">
      <p class="card-kicker">${escapeHtml(label)}</p>
      <h3 class="card-title">Datenlücke (E)</h3>
      <p class="card-text">${escapeHtml(note)}</p>
    </article>
  `;
}

function renderEmptyChart(target, toolName) {
  target.innerHTML = `
    <svg class="wk-chart" viewBox="0 0 720 305" role="img" aria-labelledby="wk-chart-title wk-chart-desc">
      <title id="wk-chart-title">Zeitverlauf vorgesehen</title>
      <desc id="wk-chart-desc">Der Zeitverlauf wird angezeigt, sobald versionierte Beobachtungen über mehrere Jahre vorliegen.</desc>
      <rect x="1" y="1" width="718" height="303" rx="8" fill="#fbfaf7" stroke="#d9d0c2"></rect>
      <line x1="70" y1="245" x2="660" y2="245" stroke="#d9d0c2"></line>
      <line x1="70" y1="50" x2="70" y2="245" stroke="#d9d0c2"></line>
      <line x1="70" y1="92" x2="660" y2="64" stroke="#5c6975" stroke-dasharray="7 7"></line>
      <text x="70" y="35" class="wk-chart-label">Status -3 bis +3</text>
      <text x="548" y="88" class="wk-chart-label">Zielpfad</text>
      <text x="90" y="145" class="wk-chart-empty">${escapeHtml(toolName)} zeigt hier künftig Status, Trend, Zielabstand und Datenqualität über die Zeit. Im Beta-Snapshot liegen noch keine validierten Beobachtungen vor.</text>
      <g class="wk-chart-legend">
        <circle cx="80" cy="276" r="4"></circle><text x="92" y="280">Status</text>
        <circle cx="160" cy="276" r="4"></circle><text x="172" y="280">Mensch</text>
        <circle cx="242" cy="276" r="4"></circle><text x="254" y="280">Planet</text>
        <circle cx="320" cy="276" r="4"></circle><text x="332" y="280">Demokratie</text>
        <circle cx="432" cy="276" r="4"></circle><text x="444" y="280">Datenqualität</text>
      </g>
    </svg>
  `;
}

function interpretation(entity, universe) {
  return [
    `Im vorhandenen Datenstand liegt für ${entity.name} ein Metadatenprofil im ${universe.shortname}-Universum vor. Ein Wirkungsprofil wird noch nicht berechnet, weil keine versionierten Beobachtungen, Quellenanker und Datenqualitätsprüfungen hinterlegt sind.`,
    "Der Wirkungskompass zeigt deshalb Datenstatus, Vergleichsebene, geplante Provider und offene Datenlücken statt scheingenauer Gesamtwerte. Fehlende Kernfelder werden als Datenlücke (E) markiert und nicht mit 0 gefüllt.",
    "Prüffrage: Welche Indikatoren liegen für Mensch, Planet und Demokratie über mehrere Jahre, mit Lizenz, Abrufdatum, Methodikversion und Datenqualität vor?",
    "Diese Einordnung ist kein Ranking, kein amtliches Rating, keine politische Gesinnungsbewertung und keine automatische Entscheidung."
  ];
}

function renderProfileReadingGuide(copy) {
  return `
    <section class="card" aria-labelledby="wk-reading-title">
      <p class="hero-kicker">Profil in 60 Sekunden</p>
      <h3 id="wk-reading-title">Erst lesen, dann urteilen.</h3>
      <div class="wk-reading-grid">
        <span class="wk-reading-step"><strong>1. Schwachfeld</strong>Reverse Merit Order: Das kritischste Feld zuerst, nicht den Schnitt.</span>
        <span class="wk-reading-step"><strong>2. Datenqualität</strong>A bis E prüfen, bevor eine Zahl als belastbar gilt.</span>
        <span class="wk-reading-step"><strong>3. Status / Trend</strong>Niveau und Richtung getrennt lesen.</span>
        <span class="wk-reading-step"><strong>4. Zielabstand</strong>Nur mit hinterlegtem Zielpfad ausweisen.</span>
        <span class="wk-reading-step"><strong>5. Prüffrage</strong>${escapeHtml(copy.checkQuestion)}</span>
      </div>
    </section>
  `;
}

function renderSourceRows(universe) {
  const rows = [
    ["Territorialer Metadaten-Snapshot", "2026", universe.shortname, "data/wirkungskompass", "10.06.2026", "keine Wirkungsindikatoren", "statischer Snapshot", "Validierung offen"],
    ["Provider-Registry", "2026", "LWK/EWK/WWK", "data/wirkungskompass/provider-registry.json", "10.06.2026", "geplante Datenquellen", "noch kein Import", "methodisch vorbereitet"]
  ];
  return rows.map((row) => `
    <tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>
  `).join("");
}

function compareCard(entity) {
  return `
    <article class="wk-compare-item">
      <p class="card-kicker">${escapeHtml(entity.entity_type)}</p>
      <h4>${escapeHtml(entity.name)}</h4>
      <p class="card-text">${escapeHtml(statusBadge(entity))}</p>
      <p class="card-text">Kein Score: Datenabdeckung noch nicht ausreichend.</p>
    </article>
  `;
}

function renderComparison(target, comparison, copy) {
  target.innerHTML = `
    <div class="inline-heading">
      <div>
        <p class="hero-kicker">Vergleichsansicht</p>
        <h3>Datenprofile nebeneinander</h3>
      </div>
      <p class="card-text">${escapeHtml(copy.compareHint)}</p>
    </div>
    ${comparison.length ? `<div class="wk-compare-list">${comparison.map(compareCard).join("")}</div>` : `<p class="card-text">Noch kein Profil im Vergleich. Wähle eine Einheit aus und füge sie hinzu.</p>`}
  `;
}

function renderProfile(entity, universe, state) {
  const profile = document.querySelector("[data-wk-profile]");
  const copy = toolCopy[state.tool] || toolCopy["lwk-de"];
  profile.hidden = false;
  profile.innerHTML = `
    <section class="section wk-profile-shell" aria-labelledby="wk-profile-title">
      <div class="wk-profile-header">
        <div>
          <p class="hero-kicker">${escapeHtml(copy.profileTitle)}</p>
          <h2 id="wk-profile-title">${escapeHtml(entity.name)}</h2>
          <p class="card-text">${escapeHtml(copy.resultType)} · ${escapeHtml(entity.region_group || "Vergleichsgruppe offen")}</p>
          <div class="wk-action-row">
            <button class="btn btn-secondary" type="button" data-wk-add-compare="${escapeHtml(entity.entity_id)}">Zum Vergleich hinzufügen</button>
          </div>
        </div>
        <div class="wk-meta-grid" aria-label="Metadaten">
          <span><strong>Typ</strong>${escapeHtml(entity.entity_type)}</span>
          <span><strong>Code</strong>${escapeHtml(entity.iso3 || entity.nuts_code || entity.iso2)}</span>
          <span><strong>Gruppe</strong>${escapeHtml((entity.comparison_groups || []).join(", ") || entity.region_group)}</span>
          <span><strong>Datenstand</strong>Metadaten-Snapshot 10.06.2026</span>
          <span><strong>Methodik</strong>${escapeHtml(entity.method_version || universe.method_version)}</span>
          <span><strong>Datenabdeckung</strong>${escapeHtml(entity.coverage || "0 %")} · DQ E</span>
          <span><strong>Bevölkerung</strong>${formatNumber(entity.population)}</span>
          <span><strong>Fläche</strong>${formatNumber(entity.area, " km²")}</span>
        </div>
      </div>

      <aside class="protection-notice" role="note">
        <p class="card-kicker">Gesamtwert</p>
        <h3>Kein Gesamtwert</h3>
        <p>Kein Gesamtwert: Datenabdeckung reicht für eine belastbare Gesamtaussage nicht aus. Fehlende Kernfelder sperren die Dimension, statt sie schönzurechnen.</p>
      </aside>

      ${renderProfileReadingGuide(copy)}

      <div class="card-grid four wk-score-grid">
        ${scoreCard(dimensionLabels.mensch, "Misst Armut, Gesundheit, Bildung, Arbeit, Wohnen, Teilhabe und soziale Sicherheit. Lesart: ohne belastbare Kernfelder kein Urteil. Wichtig für Politik, Verwaltung, Zivilgesellschaft und Forschung.")}
        ${scoreCard(dimensionLabels.planet, "Misst Klima, Energie, Fläche, Luft, Wasser, Biodiversität, Ressourcen und Klimarisiken. Lesart: rote Linien sind nicht durch gute Sozialwerte kompensierbar. Wichtig für Planung, Umweltpolitik und Investitionen.")}
        ${scoreCard(dimensionLabels.demokratie, "Misst Wahlbeteiligung, Rechtsstaatlichkeit, Transparenz, Medienvielfalt, Vertrauen und Zivilgesellschaft als SDG+-Prüffeld. Lesart: Demokratiekrisen deckeln das Profil. Wichtig für Parlamente, Journalismus und Öffentlichkeit.")}
        ${scoreCard(dimensionLabels.datenqualitaet, "Misst Vollständigkeit, Lizenz, Aktualität, Vergleichbarkeit, Quellenanker und Methodikversion. Lesart: E heißt Datenlücke, nicht schlechter Wert. Wichtig für jede Entscheidung, die auf den Daten aufbauen soll.")}
      </div>

      <section class="card" aria-labelledby="wk-timeline-title">
        <div class="inline-heading">
          <div>
            <p class="hero-kicker">Zeitverlauf</p>
            <h3 id="wk-timeline-title">Wirkungsprofil im Verlauf</h3>
          </div>
          <p class="card-text">Status, Trend, Zielabstand und Datenqualität werden erst gezeichnet, wenn mehrere belegte Jahre vorhanden sind.</p>
        </div>
        <div data-wk-chart></div>
      </section>

      <section class="card" aria-labelledby="wk-interpretation-title">
        <p class="hero-kicker">Regelbasierte Interpretation</p>
        <h3 id="wk-interpretation-title">Einordnung für ${escapeHtml(entity.name)}</h3>
        ${interpretation(entity, universe).map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
      </section>

      <div class="card-grid two">
        <article class="card">
          <p class="card-kicker">Auffälligkeiten</p>
          <h3 class="card-title">Noch nicht berechnet</h3>
          <p class="card-text">Auffällige Verbesserungen oder Verschlechterungen werden erst ausgewiesen, wenn Beobachtungen über mehrere Jahre validiert sind.</p>
        </article>
        <article class="card">
          <p class="card-kicker">Datenlücken</p>
          <h3 class="card-title">Datenprofil ohne Score</h3>
          <p class="card-text">Fehlende Daten bedeuten keine schlechte Wirkung. Sie markieren, wo Provider, Lizenz, Gebietsstand oder Vergleichbarkeit geprüft werden müssen. Entscheidend fehlende Felder werden als E sichtbar.</p>
        </article>
      </div>

      <section class="card" aria-labelledby="wk-sources-title">
        <p class="hero-kicker">Quellen und Methodik</p>
        <h3 id="wk-sources-title">Quellenbereich</h3>
        <div class="wk-table-wrap">
          <table class="wk-source-table">
            <thead>
              <tr>
                <th>Dokument / Quelle</th>
                <th>Jahr</th>
                <th>Framework</th>
                <th>URL / Pfad</th>
                <th>Abrufdatum</th>
                <th>Indikatoren</th>
                <th>Extraktion</th>
                <th>Vertrauen</th>
              </tr>
            </thead>
            <tbody>${renderSourceRows(universe)}</tbody>
          </table>
        </div>
        <p class="card-text">${escapeHtml(universe.source_note)}</p>
      </section>

      <section class="card" data-wk-comparison></section>
    </section>
  `;
  renderEmptyChart(profile.querySelector("[data-wk-chart]"), universe.title);
  renderComparison(profile.querySelector("[data-wk-comparison]"), state.comparison, copy);
  profile.scrollIntoView({ behavior: "smooth", block: "start" });
}

function matchesFilter(entity, filter) {
  if (!filter || filter === "all") return true;
  const haystack = normalize([entity.region_group, (entity.comparison_groups || []).join(" ")].join(" "));
  return haystack.includes(normalize(filter));
}

async function initTerritorialCompass() {
  const root = document.querySelector("[data-wk-tool]");
  if (!root) return;
  const state = {
    tool: root.dataset.wkTool || "lwk-de",
    filter: "all",
    comparison: []
  };
  const copy = toolCopy[state.tool] || toolCopy["lwk-de"];
  const response = await fetch(root.dataset.universeUrl);
  const universe = await response.json();
  const entities = Array.isArray(universe.entities) ? universe.entities : [];
  const input = document.querySelector("[data-wk-search]");
  const select = document.querySelector("[data-wk-select]");
  const results = document.querySelector("[data-wk-results]");
  const count = document.querySelector("[data-wk-count]");
  const filters = document.querySelector("[data-wk-filters]");

  input.placeholder = copy.searchPlaceholder;
  count.textContent = `${entities.length} Einheiten im ${universe.shortname}-Universum`;
  select.innerHTML = `<option value="">Einheit auswählen ...</option>${entities.map((entity) => `<option value="${escapeHtml(entity.entity_id)}">${escapeHtml(entity.name)}</option>`).join("")}`;

  if (filters) {
    const filterValues = ["all", ...(universe.available_filters || [])];
    filters.innerHTML = filterValues.map((filter) => `
      <button class="wk-filter-button" type="button" data-wk-filter="${escapeHtml(filter)}" aria-pressed="${filter === "all"}">${escapeHtml(filter === "all" ? "Alle" : filter)}</button>
    `).join("");
  }

  function filteredEntities(query = "") {
    const q = normalize(query);
    return entities
      .filter((entity) => matchesFilter(entity, state.filter))
      .filter((entity) => !q || entitySearchText(entity).includes(q))
      .slice(0, 14);
  }

  function renderResults(query = "") {
    const filtered = filteredEntities(query);
    results.innerHTML = filtered.length
      ? filtered.map(renderEntityButton).join("")
      : `<p class="card-text">${escapeHtml(copy.noMatch)}</p>`;
  }

  function selectEntity(entityId) {
    const entity = entities.find((entry) => entry.entity_id === entityId);
    if (!entity) return;
    input.value = entity.name;
    select.value = entity.entity_id;
    renderResults(entity.name);
    renderProfile(entity, universe, state);
  }

  input.addEventListener("input", () => renderResults(input.value));
  select.addEventListener("change", () => selectEntity(select.value));
  results.addEventListener("click", (event) => {
    const button = event.target.closest("[data-entity-id]");
    if (button) selectEntity(button.dataset.entityId);
  });
  filters?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-wk-filter]");
    if (!button) return;
    state.filter = button.dataset.wkFilter;
    filters.querySelectorAll("[data-wk-filter]").forEach((entry) => {
      entry.setAttribute("aria-pressed", String(entry === button));
    });
    renderResults(input.value);
  });
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-wk-add-compare]");
    if (!button) return;
    const entity = entities.find((entry) => entry.entity_id === button.dataset.wkAddCompare);
    if (!entity) return;
    if (!state.comparison.some((entry) => entry.entity_id === entity.entity_id)) {
      state.comparison = [...state.comparison, entity].slice(-4);
    }
    const comparison = document.querySelector("[data-wk-comparison]");
    if (comparison) renderComparison(comparison, state.comparison, copy);
  });
  document.querySelector("[data-wk-first]")?.addEventListener("click", () => {
    if (entities[0]) selectEntity(entities[0].entity_id);
  });
  renderResults();
}

initTerritorialCompass().catch((error) => {
  const results = document.querySelector("[data-wk-results]");
  if (results) {
    results.innerHTML = `<p class="card-text">Die Wirkungskompass-Metadaten konnten nicht geladen werden. Bitte später erneut prüfen.</p>`;
  }
  console.error(error);
});
