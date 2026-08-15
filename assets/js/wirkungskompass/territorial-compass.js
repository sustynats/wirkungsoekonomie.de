const DATA_VERSION = "20260622-impact-data";

const dimensionLabels = {
  mensch: "Mensch",
  planet: "Planet",
  demokratie: "Demokratie",
  datenqualitaet: "Datenqualität",
  unmapped: "Unkartiert"
};

const dimensionOrder = ["mensch", "planet", "demokratie"];

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

function repoUrl(path) {
  return new URL(`../../${path}?v=${DATA_VERSION}`, window.location.href).toString();
}

async function loadJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load ${url}`);
  return response.json();
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

function formatValue(value, unit = "") {
  if (typeof value !== "number") return escapeHtml(text(value, "Datenlücke"));
  const digits = Math.abs(value) < 10 && !Number.isInteger(value) ? 2 : 1;
  const formatted = new Intl.NumberFormat("de-DE", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0
  }).format(value);
  return `${formatted}${unit ? ` ${escapeHtml(unit)}` : ""}`;
}

function qualityClass(observation) {
  if (!observation) return "E";
  if (observation.source_id === "world_bank_wgi" || observation.confidence === "medium") return "C";
  if (observation.confidence === "high" || observation.data_quality === "official_api_raw_observation") return "A";
  return "B";
}

function qualityLabel(observation) {
  const klass = qualityClass(observation);
  const label = {
    A: "A · amtliche/API-Rohdaten",
    B: "B · belastbarer Providerwert",
    C: "C · Modell-/Sekundärwert",
    D: "D · Schätzung",
    E: "E · Datenlücke"
  }[klass] || "Datenqualität offen";
  return label;
}

function indicatorMeta(state, indicatorId) {
  return state.indicators.get(indicatorId) || {
    indicator_id: indicatorId,
    name: indicatorId,
    dimension: "unmapped",
    unit: ""
  };
}

function observationsForEntity(state, entityId) {
  return state.observationsByEntity.get(entityId) || [];
}

function latestByIndicator(observations) {
  const map = new Map();
  observations.forEach((observation) => {
    const current = map.get(observation.indicator_id);
    if (!current || Number(observation.year) > Number(current.year)) {
      map.set(observation.indicator_id, observation);
    }
  });
  return Array.from(map.values()).sort((a, b) => {
    const yearDelta = Number(b.year) - Number(a.year);
    return yearDelta || a.indicator_id.localeCompare(b.indicator_id);
  });
}

function observationCount(state, entityId) {
  return observationsForEntity(state, entityId).length;
}

function statusBadge(entity, state) {
  const count = state ? observationCount(state, entity.entity_id) : 0;
  if (count > 0) return `${count} Wirkungsdaten`;
  return entity.data_status || entity.status || "Metadaten verfügbar";
}

function renderEntityButton(entity, state) {
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
      <span class="badge">${escapeHtml(statusBadge(entity, state))}</span>
    </button>
  `;
}

function matchesFilter(entity, filter) {
  if (!filter || filter === "all") return true;
  const haystack = normalize([entity.region_group, (entity.comparison_groups || []).join(" ")].join(" "));
  return haystack.includes(normalize(filter));
}

async function loadSnapshots(universe) {
  const manifest = await loadJson(repoUrl("data/wirkungskompass/snapshot-manifest.json"));
  const entries = (manifest.snapshots || []).filter((entry) => entry.universe_id === universe.universe_id && entry.observation_count > 0);
  const snapshots = [];
  for (const entry of entries) {
    snapshots.push(await loadJson(repoUrl(entry.path)));
  }
  return { manifest, entries, snapshots };
}

function indexSnapshots(snapshots) {
  const indicators = new Map();
  const observationsByEntity = new Map();
  snapshots.forEach((snapshot) => {
    (snapshot.indicators || []).forEach((indicator) => {
      indicators.set(indicator.indicator_id, indicator);
    });
    (snapshot.observations || []).forEach((observation) => {
      const list = observationsByEntity.get(observation.entity_id) || [];
      list.push(observation);
      observationsByEntity.set(observation.entity_id, list);
    });
  });
  observationsByEntity.forEach((list) => {
    list.sort((a, b) => Number(b.year) - Number(a.year));
  });
  return { indicators, observationsByEntity };
}

function sourceRows(state) {
  return state.snapshots.map((snapshot) => `
    <tr>
      <td>${escapeHtml(snapshot.provider_title || snapshot.provider_id)}</td>
      <td>${escapeHtml((snapshot.years || []).length ? `${Math.min(...snapshot.years)}-${Math.max(...snapshot.years)}` : "offen")}</td>
      <td>${escapeHtml(snapshot.provider_id)}</td>
      <td><a class="text-link" href="${escapeHtml(snapshot.source_url)}">${escapeHtml(snapshot.source_url)}</a></td>
      <td>${escapeHtml(snapshot.imported_at || "Snapshot")}</td>
      <td>${escapeHtml(`${snapshot.indicator_count || 0} Indikatoren / ${snapshot.observation_count || 0} Werte`)}</td>
      <td>${escapeHtml((snapshot.observations || [])[0]?.extraction_method || "Snapshot")}</td>
      <td>${escapeHtml(snapshot.score_ready ? "Score-ready" : "Rohdaten, kein Score")}</td>
    </tr>
  `).join("");
}

function dimensionLatest(state, observations, dimension) {
  return latestByIndicator(observations)
    .filter((observation) => indicatorMeta(state, observation.indicator_id).dimension === dimension)
    .slice(0, 6);
}

function renderDimensionCard(state, observations, dimension) {
  const latest = dimensionLatest(state, observations, dimension);
  if (!latest.length) {
    return `
      <article class="card wk-score-card wk-score-card-empty">
        <p class="card-kicker">${escapeHtml(dimensionLabels[dimension])}</p>
        <h3 class="card-title">Datenlücke (E)</h3>
        <p class="card-text">Für diese Dimension liegt in den aktuellen Snapshots noch kein belegter Wert vor. Die Dimension wird nicht geschätzt und nicht mit 0 gefüllt.</p>
      </article>
    `;
  }
  return `
    <article class="card wk-score-card">
      <p class="card-kicker">${escapeHtml(dimensionLabels[dimension])}</p>
      <h3 class="card-title">${latest.length} aktuelle Felder</h3>
      <ul class="wk-observation-list">
        ${latest.map((observation) => {
          const meta = indicatorMeta(state, observation.indicator_id);
          return `
            <li>
              <strong>${escapeHtml(meta.name)}</strong>
              <span>${formatValue(observation.raw_value, observation.unit || meta.unit)} · ${escapeHtml(observation.year)} · ${escapeHtml(qualityLabel(observation))}</span>
            </li>
          `;
        }).join("")}
      </ul>
      <p class="card-text">Rohdaten. Noch kein normalisierter Status auf -3 bis +3.</p>
    </article>
  `;
}

function observationsByYearAndDimension(state, observations) {
  const counts = {};
  observations.forEach((observation) => {
    const year = String(observation.year);
    const dimension = indicatorMeta(state, observation.indicator_id).dimension || "unmapped";
    counts[year] = counts[year] || {};
    counts[year][dimension] = (counts[year][dimension] || 0) + 1;
  });
  return counts;
}

function renderDataChart(target, state, observations, toolName) {
  const counts = observationsByYearAndDimension(state, observations);
  const years = Object.keys(counts).map(Number).sort((a, b) => a - b);
  if (!years.length) {
    target.innerHTML = `<p class="card-text">${escapeHtml(toolName)} hat für diese Einheit noch keine Rohbeobachtungen.</p>`;
    return;
  }
  const rows = years.map((year) => {
    const row = counts[String(year)] || {};
    const total = Object.values(row).reduce((sum, value) => sum + value, 0);
    return `
      <tr>
        <td>${year}</td>
        <td>${row.mensch || 0}</td>
        <td>${row.planet || 0}</td>
        <td>${row.demokratie || 0}</td>
        <td>${total}</td>
      </tr>
    `;
  }).join("");
  target.innerHTML = `
    <div class="wk-table-wrap">
      <table class="wk-source-table">
        <thead><tr><th>Jahr</th><th>Mensch</th><th>Planet</th><th>Demokratie</th><th>Datenpunkte</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderProfileReadingGuide(copy) {
  return `
    <section class="card" aria-labelledby="wk-reading-title">
      <p class="hero-kicker">Profil in 60 Sekunden</p>
      <h3 id="wk-reading-title">Erst Datenlage lesen, dann urteilen.</h3>
      <div class="wk-reading-grid">
        <span class="wk-reading-step"><strong>1. Schwachfeld</strong>Reverse Merit Order: Das kritischste belegte Feld zuerst, nicht den Schnitt.</span>
        <span class="wk-reading-step"><strong>2. Datenqualität</strong>A bis E prüfen, bevor eine Zahl als belastbar gilt.</span>
        <span class="wk-reading-step"><strong>3. Status / Trend</strong>Rohwert und Richtung getrennt lesen.</span>
        <span class="wk-reading-step"><strong>4. Zielabstand</strong>Nur mit hinterlegtem Zielpfad ausweisen.</span>
        <span class="wk-reading-step"><strong>5. Prüffrage</strong>${escapeHtml(copy.checkQuestion)}</span>
      </div>
    </section>
  `;
}

function interpretation(entity, universe, observations, state) {
  const latest = latestByIndicator(observations);
  const dimensionCounts = Object.fromEntries(dimensionOrder.map((dimension) => [
    dimension,
    latest.filter((observation) => indicatorMeta(state, observation.indicator_id).dimension === dimension).length
  ]));
  if (!latest.length) {
    return [
      `Für ${entity.name} ist das Metadatenprofil im ${universe.shortname}-Universum vorhanden, aber noch kein Wirkungsdaten-Snapshot verknüpft.`,
      "Der Kompass zeigt deshalb keine Werte und sperrt die Dimensionen als Datenlücke (E)."
    ];
  }
  return [
    `${entity.name} hat ${observations.length} Rohbeobachtungen in ${state.snapshots.length} versionierten Snapshot(s). Aktuell belegte Felder: Mensch ${dimensionCounts.mensch}, Planet ${dimensionCounts.planet}, Demokratie ${dimensionCounts.demokratie}.`,
    "Die Werte sind echte Rohdaten mit Quelle, Jahr, Abrufdatum und Datenqualitätsvorbehalt. Sie sind noch keine -3-bis-+3-Statuswerte.",
    "Der nächste fachliche Schritt ist Normalisierung gegen Zielpfade und Reverse Merit Order. Bis dahin bereitet der Kompass Entscheidungen vor, trifft sie aber nicht.",
    "Keine Rangliste, keine Personenbewertung, keine automatische Entscheidung."
  ];
}

function compareCard(entity, state) {
  const observations = observationsForEntity(state, entity.entity_id);
  const latest = latestByIndicator(observations);
  return `
    <article class="wk-compare-item">
      <p class="card-kicker">${escapeHtml(entity.entity_type)}</p>
      <h4>${escapeHtml(entity.name)}</h4>
      <p class="card-text">${escapeHtml(`${observations.length} Rohdaten / ${latest.length} aktuelle Felder`)}</p>
      <p class="card-text">Kein Gesamtwert: erst nach Normalisierung und Mindestabdeckung.</p>
    </article>
  `;
}

function renderComparison(target, comparison, copy, state) {
  target.innerHTML = `
    <div class="inline-heading">
      <div>
        <p class="hero-kicker">Vergleichsansicht</p>
        <h3>Datenprofile nebeneinander</h3>
      </div>
      <p class="card-text">${escapeHtml(copy.compareHint)}</p>
    </div>
    ${comparison.length ? `<div class="wk-compare-list">${comparison.map((entity) => compareCard(entity, state)).join("")}</div>` : `<p class="card-text">Noch kein Profil im Vergleich. Wähle eine Einheit aus und füge sie hinzu.</p>`}
  `;
}

function renderProfile(entity, universe, state) {
  const profile = document.querySelector("[data-wk-profile]");
  const copy = toolCopy[state.tool] || toolCopy["lwk-de"];
  const observations = observationsForEntity(state, entity.entity_id);
  const latest = latestByIndicator(observations);
  const latestYears = observations.map((observation) => Number(observation.year)).filter(Number.isFinite);
  const yearText = latestYears.length ? `${Math.min(...latestYears)}-${Math.max(...latestYears)}` : "keine Daten";
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
          <span><strong>Datenjahre</strong>${escapeHtml(yearText)}</span>
          <span><strong>Methodik</strong>${escapeHtml(entity.method_version || universe.method_version)}</span>
          <span><strong>Datenabdeckung</strong>${escapeHtml(`${observations.length} Rohdaten · ${latest.length} aktuelle Felder`)}</span>
          <span><strong>Bevölkerung</strong>${formatNumber(entity.population)}</span>
          <span><strong>Fläche</strong>${formatNumber(entity.area, " km²")}</span>
        </div>
      </div>

      <aside class="protection-notice" role="note">
        <p class="card-kicker">Gesamtwert</p>
        <h3>Rohdatenprofil, kein Ranking</h3>
        <p>Die Seite zeigt jetzt echte Wirkungsdaten-Snapshots. Ein Gesamtwert wird erst berechnet, wenn Normalisierung, Zielpfade, Datenqualität und Reverse Merit Order fachlich hinterlegt sind.</p>
      </aside>

      ${renderProfileReadingGuide(copy)}

      <div class="card-grid three wk-score-grid">
        ${dimensionOrder.map((dimension) => renderDimensionCard(state, observations, dimension)).join("")}
      </div>

      <section class="card" aria-labelledby="wk-timeline-title">
        <div class="inline-heading">
          <div>
            <p class="hero-kicker">Zeitverlauf</p>
            <h3 id="wk-timeline-title">Datenpunkte nach Jahr und Dimension</h3>
          </div>
          <p class="card-text">Dies ist noch kein Status-Score, sondern die belegte Datenlage im Snapshot.</p>
        </div>
        <div data-wk-chart></div>
      </section>

      <section class="card" aria-labelledby="wk-interpretation-title">
        <p class="hero-kicker">Regelbasierte Interpretation</p>
        <h3 id="wk-interpretation-title">Einordnung für ${escapeHtml(entity.name)}</h3>
        ${interpretation(entity, universe, observations, state).map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
      </section>

      <section class="card" aria-labelledby="wk-values-title">
        <p class="hero-kicker">Alle aktuellen Felder</p>
        <h3 id="wk-values-title">Neueste Rohwerte je Indikator</h3>
        <div class="wk-table-wrap">
          <table class="wk-source-table">
            <thead><tr><th>Dimension</th><th>Indikator</th><th>Jahr</th><th>Wert</th><th>DQ</th><th>Quelle</th></tr></thead>
            <tbody>
              ${latest.map((observation) => {
                const meta = indicatorMeta(state, observation.indicator_id);
                return `
                  <tr>
                    <td>${escapeHtml(dimensionLabels[meta.dimension] || meta.dimension)}</td>
                    <td>${escapeHtml(meta.name)}</td>
                    <td>${escapeHtml(observation.year)}</td>
                    <td>${formatValue(observation.raw_value, observation.unit || meta.unit)}</td>
                    <td>${escapeHtml(qualityLabel(observation))}</td>
                    <td><a class="text-link" href="${escapeHtml(observation.source_url)}">${escapeHtml(observation.source_id)}</a></td>
                  </tr>
                `;
              }).join("") || `<tr><td colspan="6">Keine Rohwerte vorhanden.</td></tr>`}
            </tbody>
          </table>
        </div>
      </section>

      <section class="card" aria-labelledby="wk-sources-title">
        <p class="hero-kicker">Quellen und Methodik</p>
        <h3 id="wk-sources-title">Versionierte Datenquellen</h3>
        <div class="wk-table-wrap">
          <table class="wk-source-table">
            <thead>
              <tr>
                <th>Quelle</th>
                <th>Jahre</th>
                <th>Provider</th>
                <th>URL</th>
                <th>Abrufdatum</th>
                <th>Umfang</th>
                <th>Extraktion</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${sourceRows(state)}</tbody>
          </table>
        </div>
        <p class="card-text">${escapeHtml(universe.source_note)}</p>
      </section>

      <section class="card" data-wk-comparison></section>
    </section>
  `;
  renderDataChart(profile.querySelector("[data-wk-chart]"), state, observations, universe.title);
  renderComparison(profile.querySelector("[data-wk-comparison]"), state.comparison, copy, state);
  profile.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function initTerritorialCompass() {
  const root = document.querySelector("[data-wk-tool]");
  if (!root) return;
  const state = {
    tool: root.dataset.wkTool || "lwk-de",
    filter: "all",
    comparison: [],
    snapshots: [],
    indicators: new Map(),
    observationsByEntity: new Map()
  };
  const copy = toolCopy[state.tool] || toolCopy["lwk-de"];
  const universe = await loadJson(root.dataset.universeUrl);
  const entities = Array.isArray(universe.entities) ? universe.entities : [];
  const loaded = await loadSnapshots(universe);
  state.snapshots = loaded.snapshots;
  const indexed = indexSnapshots(state.snapshots);
  state.indicators = indexed.indicators;
  state.observationsByEntity = indexed.observationsByEntity;

  const input = document.querySelector("[data-wk-search]");
  const select = document.querySelector("[data-wk-select]");
  const results = document.querySelector("[data-wk-results]");
  const count = document.querySelector("[data-wk-count]");
  const filters = document.querySelector("[data-wk-filters]");

  input.placeholder = copy.searchPlaceholder;
  const totalObservations = state.snapshots.reduce((sum, snapshot) => sum + (snapshot.observation_count || 0), 0);
  count.textContent = `${entities.length} Einheiten im ${universe.shortname}-Universum · ${totalObservations} Wirkungsdaten aus ${state.snapshots.length} Snapshot(s)`;
  select.innerHTML = `<option value="">Einheit auswählen ...</option>${entities.map((entity) => `<option value="${escapeHtml(entity.entity_id)}">${escapeHtml(entity.name)} (${observationCount(state, entity.entity_id)})</option>`).join("")}`;

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
      ? filtered.map((entity) => renderEntityButton(entity, state)).join("")
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
    if (comparison) renderComparison(comparison, state.comparison, copy, state);
  });
  document.querySelector("[data-wk-first]")?.addEventListener("click", () => {
    const firstWithData = entities.find((entity) => observationCount(state, entity.entity_id) > 0) || entities[0];
    if (firstWithData) selectEntity(firstWithData.entity_id);
  });
  renderResults();
}

initTerritorialCompass().catch((error) => {
  const results = document.querySelector("[data-wk-results]");
  if (results) {
    results.innerHTML = `<p class="card-text">Die Wirkungskompass-Daten konnten nicht geladen werden. Bitte später erneut prüfen.</p>`;
  }
  console.error(error);
});
