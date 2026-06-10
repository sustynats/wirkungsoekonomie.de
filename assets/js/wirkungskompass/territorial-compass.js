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
    compareHint: "Bis zu vier Bundesländer können nebeneinander als Datenprofile betrachtet werden."
  },
  "ewk-eu27": {
    searchPlaceholder: "EU-Land suchen, z. B. Deutschland",
    noMatch: "Kein Treffer im EWK-EU27-Universum. Europa+ ist als spätere Erweiterung vorgesehen.",
    resultType: "EU-Mitgliedstaat",
    profileTitle: "Europa-Profil",
    compareHint: "Bis zu vier EU-Staaten können nebeneinander als Datenprofile betrachtet werden."
  },
  "wwk-193": {
    searchPlaceholder: "Staat suchen, z. B. Ghana",
    noMatch: "Kein Treffer im WWK-193-Grunduniversum. Bitte offizielle englische UN-Bezeichnung prüfen.",
    resultType: "UN-Mitgliedstaat",
    profileTitle: "Welt-Profil",
    compareHint: "Bis zu vier Staaten können nebeneinander als Datenprofile betrachtet werden."
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

function formatScore(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "offen";
  return new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(value);
}

function numericValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function snapshotsForUniverse(state, universe) {
  const snapshots = state.snapshotManifest?.snapshots || [];
  return snapshots.filter((snapshot) => snapshot.shortname === universe.shortname || snapshot.universe_id === universe.universe_id);
}

function snapshotPath(snapshot) {
  if (!snapshot?.path) return "";
  return snapshot.path.startsWith("/") ? snapshot.path : `/${snapshot.path}`;
}

async function loadSnapshotData(state, universe) {
  const snapshots = snapshotsForUniverse(state, universe);
  const loaded = await Promise.all(snapshots.map(async (snapshot) => {
    const path = snapshotPath(snapshot);
    if (!path) return null;
    try {
      const response = await fetch(path);
      if (!response.ok) return null;
      const data = await response.json();
      return { ...snapshot, data };
    } catch (error) {
      console.warn("Wirkungskompass-Snapshot konnte nicht geladen werden", path, error);
      return null;
    }
  }));
  state.snapshotData = loaded.filter(Boolean);
}

function observationCountForEntity(entity, state, universe) {
  return snapshotsForUniverse(state, universe).reduce((sum, snapshot) => {
    const counts = snapshot.entity_observation_counts || {};
    return sum + (Number(counts[entity.entity_id]) || 0);
  }, 0);
}

function observationsForEntity(entity, state) {
  return (state.snapshotData || []).flatMap((snapshot) => {
    const indicators = new Map((snapshot.data?.indicators || []).map((indicator) => [indicator.indicator_id, indicator]));
    return (snapshot.data?.observations || [])
      .filter((observation) => observation.entity_id === entity.entity_id)
      .map((observation) => ({
        ...observation,
        provider_id: snapshot.provider_id || snapshot.data?.provider_id,
        provider_title: snapshot.provider_title || snapshot.data?.provider_title,
        indicator: indicators.get(observation.indicator_id) || {}
      }));
  });
}

function latestObservations(observations) {
  const byIndicator = new Map();
  observations.forEach((observation) => {
    const current = byIndicator.get(observation.indicator_id);
    if (!current || Number(observation.year) > Number(current.year)) {
      byIndicator.set(observation.indicator_id, observation);
    }
  });
  return [...byIndicator.values()].sort((a, b) => {
    const dimensionCompare = text(a.indicator.dimension).localeCompare(text(b.indicator.dimension));
    if (dimensionCompare !== 0) return dimensionCompare;
    return text(a.indicator.name).localeCompare(text(b.indicator.name));
  });
}

function buildScoringModel(state) {
  if (state.scoringModel) return state.scoringModel;
  const latestByEntityIndicator = new Map();
  (state.snapshotData || []).forEach((snapshot) => {
    const indicators = new Map((snapshot.data?.indicators || []).map((indicator) => [indicator.indicator_id, indicator]));
    (snapshot.data?.observations || []).forEach((observation) => {
      const value = numericValue(observation.raw_value);
      if (value === null) return;
      const indicator = indicators.get(observation.indicator_id) || {};
      const key = `${observation.entity_id}::${observation.indicator_id}`;
      const current = latestByEntityIndicator.get(key);
      if (!current || Number(observation.year) > Number(current.year)) {
        latestByEntityIndicator.set(key, {
          ...observation,
          raw_value: value,
          provider_id: snapshot.provider_id || snapshot.data?.provider_id,
          provider_title: snapshot.provider_title || snapshot.data?.provider_title,
          indicator
        });
      }
    });
  });

  const valuesByIndicator = new Map();
  latestByEntityIndicator.forEach((observation) => {
    if (!valuesByIndicator.has(observation.indicator_id)) valuesByIndicator.set(observation.indicator_id, []);
    valuesByIndicator.get(observation.indicator_id).push(Number(observation.raw_value));
  });

  const baselines = new Map();
  valuesByIndicator.forEach((values, indicatorId) => {
    const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
    if (!sorted.length) return;
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    baselines.set(indicatorId, { min, max, count: sorted.length });
  });

  state.scoringModel = { latestByEntityIndicator, baselines };
  return state.scoringModel;
}

function normalizedIndicatorScore(observation, baseline) {
  const value = numericValue(observation.raw_value);
  if (value === null || !baseline || baseline.count < 2) return null;
  const polarity = observation.indicator?.polarity || "higher_is_better";
  if (baseline.max === baseline.min) return 50;
  const position = ((value - baseline.min) / (baseline.max - baseline.min)) * 100;
  if (polarity === "lower_is_better" || polarity === "near_zero_better") return Math.max(0, Math.min(100, 100 - position));
  if (polarity === "higher_is_better") return Math.max(0, Math.min(100, position));
  return null;
}

function scoreProfileForEntity(entity, state) {
  const model = buildScoringModel(state);
  const latest = [...model.latestByEntityIndicator.values()]
    .filter((observation) => observation.entity_id === entity.entity_id)
    .map((observation) => {
      const score = normalizedIndicatorScore(observation, model.baselines.get(observation.indicator_id));
      return { ...observation, beta_score: score };
    });
  const scored = latest.filter((observation) => typeof observation.beta_score === "number");
  const dimensions = {};
  scored.forEach((observation) => {
    const dimension = observation.indicator.dimension || "datenqualitaet";
    if (!dimensions[dimension]) dimensions[dimension] = { items: [], score: null };
    dimensions[dimension].items.push(observation);
  });
  Object.values(dimensions).forEach((dimension) => {
    dimension.score = dimension.items.reduce((sum, item) => sum + item.beta_score, 0) / dimension.items.length;
  });
  const mpdDimensions = ["mensch", "planet", "demokratie"].filter((dimension) => dimensions[dimension]?.items?.length);
  const overall = mpdDimensions.length
    ? mpdDimensions.reduce((sum, dimension) => sum + dimensions[dimension].score, 0) / mpdDimensions.length
    : null;
  const providerCount = new Set(latest.map((observation) => observation.provider_title || observation.provider_id || observation.source_id)).size;
  const dataQualityScore = latest.length
    ? Math.min(100, Math.round((mpdDimensions.length / 3) * 45 + Math.min(1, scored.length / 18) * 40 + Math.min(1, providerCount / 3) * 15))
    : null;
  const years = [...new Set(latest.map((observation) => Number(observation.year)).filter(Boolean))].sort((a, b) => a - b);
  return {
    latest,
    scored,
    dimensions,
    overall,
    dataQualityScore,
    dimensionCount: mpdDimensions.length,
    indicatorCount: scored.length,
    providerCount,
    years
  };
}

function scoredItemsForDimension(scoreProfile, dimension) {
  return [...(scoreProfile.dimensions[dimension]?.items || [])].sort((a, b) => b.beta_score - a.beta_score);
}

function dataProfileForEntity(entity, state) {
  const observations = observationsForEntity(entity, state);
  const latest = latestObservations(observations);
  const dimensions = {};
  latest.forEach((observation) => {
    const dimension = observation.indicator.dimension || "datenqualitaet";
    if (!dimensions[dimension]) {
      dimensions[dimension] = {
        indicatorIds: new Set(),
        observations: 0,
        latestYear: null,
        providers: new Set(),
        examples: []
      };
    }
    dimensions[dimension].indicatorIds.add(observation.indicator_id);
    dimensions[dimension].providers.add(observation.provider_title || observation.provider_id || observation.source_id);
    dimensions[dimension].latestYear = Math.max(Number(dimensions[dimension].latestYear) || 0, Number(observation.year) || 0);
    dimensions[dimension].examples.push(observation);
  });
  observations.forEach((observation) => {
    const dimension = observation.indicator.dimension || "datenqualitaet";
    if (dimensions[dimension]) dimensions[dimension].observations += 1;
  });
  return { observations, latest, dimensions };
}

function snapshotSummaryForEntity(entity, state, universe) {
  const observationCount = observationCountForEntity(entity, state, universe);
  const snapshotCount = snapshotsForUniverse(state, universe).length;
  if (observationCount > 0) {
    return {
      status: `Rohdaten-Snapshot verfügbar (${observationCount} Werte)`,
      observationCount,
      snapshotCount
    };
  }
  if (snapshotCount > 0) {
    return {
      status: "Snapshot vorhanden, für diese Einheit noch keine Beobachtung",
      observationCount: 0,
      snapshotCount
    };
  }
  return {
    status: entity.data_status || entity.status || "Metadaten verfügbar",
    observationCount: 0,
    snapshotCount
  };
}

function statusBadge(entity, state, universe) {
  return snapshotSummaryForEntity(entity, state, universe).status;
}

function renderEntityButton(entity, state, universe) {
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
      <span class="badge">${escapeHtml(statusBadge(entity, state, universe))}</span>
    </button>
  `;
}

function scoreCard(label, note) {
  return `
    <article class="card wk-score-card wk-score-card-empty">
      <p class="card-kicker">${escapeHtml(label)}</p>
      <h3 class="card-title">Keine Rohdaten im Snapshot</h3>
      <p class="card-text">${escapeHtml(note)}</p>
      <p class="card-text">Für diese Dimension wird kein Wert unterstellt. Die Lücke bleibt sichtbar.</p>
    </article>
  `;
}

function rawDimensionCard(label, dimension, note, profile, scoreProfile) {
  const dimensionProfile = profile.dimensions[dimension];
  const scoreDimension = scoreProfile.dimensions[dimension];
  if (!dimensionProfile) return scoreCard(label, note);
  const indicatorCount = dimensionProfile.indicatorIds.size;
  const providerCount = dimensionProfile.providers.size;
  const example = dimensionProfile.examples[0];
  const latestValue = example
    ? `${formatNumber(Number(example.raw_value))} ${text(example.unit, "")}`.trim()
    : "Werte vorhanden";
  const strongest = scoredItemsForDimension(scoreProfile, dimension)[0];
  return `
    <article class="card wk-score-card">
      <p class="card-kicker">${escapeHtml(label)}</p>
      <h3 class="card-title">${scoreDimension ? `${formatScore(scoreDimension.score)}` : "Rohdaten vorhanden"}</h3>
      <p class="card-text">${scoreDimension ? "Vorläufiger Beta-Arbeitswert 0-100, relativ zum geladenen Snapshot-Universum." : "Noch nicht normalisierbar."}</p>
      <p class="card-text">${indicatorCount} Indikator${indicatorCount === 1 ? "" : "en"} · ${dimensionProfile.observations} Beobachtung${dimensionProfile.observations === 1 ? "" : "en"} · jüngstes Jahr ${escapeHtml(dimensionProfile.latestYear || "offen")}</p>
      <p class="card-text"><strong>Beispiel:</strong> ${escapeHtml(example?.indicator?.name || note)}${example ? ` (${escapeHtml(latestValue)})` : ""}</p>
      ${strongest ? `<p class="card-text"><strong>Stärkster Arbeitswert:</strong> ${escapeHtml(strongest.indicator.name || strongest.indicator_id)} (${formatScore(strongest.beta_score)}).</p>` : ""}
      <p class="card-text">${providerCount} Snapshot-Provider · Arbeitswert, kein finaler Zielpfadscore.</p>
    </article>
  `;
}

function dataQualityCard(profile, summary, scoreProfile) {
  const providerCount = new Set(profile.observations.map((observation) => observation.provider_title || observation.provider_id || observation.source_id)).size;
  const latestYears = profile.latest.map((observation) => Number(observation.year)).filter(Boolean);
  const latestYear = latestYears.length ? Math.max(...latestYears) : null;
  const status = typeof scoreProfile.dataQualityScore === "number" ? formatScore(scoreProfile.dataQualityScore) : (summary.observationCount > 0 ? "Snapshot geladen" : "Keine Rohdaten");
  return `
    <article class="card wk-score-card">
      <p class="card-kicker">${escapeHtml(dimensionLabels.datenqualitaet)}</p>
      <h3 class="card-title">${escapeHtml(status)}</h3>
      <p class="card-text">${typeof scoreProfile.dataQualityScore === "number" ? "Vorläufiger Datenqualitäts-Arbeitswert aus Abdeckung, Providerzahl und verwertbaren Indikatoren." : "Noch kein Datenqualitätswert."}</p>
      <p class="card-text">${profile.latest.length} Indikator${profile.latest.length === 1 ? "" : "en"} · ${summary.observationCount} Rohbeobachtung${summary.observationCount === 1 ? "" : "en"} · ${providerCount} Provider.</p>
      <p class="card-text">Jüngstes Datenjahr: ${escapeHtml(latestYear || "offen")}. Lizenz, Abrufdatum und Quellenanker sind im Snapshot sichtbar.</p>
    </article>
  `;
}

function renderRawObservationRows(profile) {
  if (!profile.latest.length) {
    return `<p class="card-text">Für diese Einheit sind in den geladenen Snapshots noch keine Beobachtungen vorhanden.</p>`;
  }
  return `
    <div class="wk-table-wrap">
      <table class="wk-source-table">
        <thead>
          <tr>
            <th>Dimension</th>
            <th>Indikator</th>
            <th>Jahr</th>
            <th>Wert</th>
            <th>Quelle</th>
            <th>Datenqualität</th>
          </tr>
        </thead>
        <tbody>
          ${profile.latest.map((observation) => `
            <tr>
              <td>${escapeHtml(dimensionLabels[observation.indicator.dimension] || observation.indicator.dimension || "Daten")}</td>
              <td>${escapeHtml(observation.indicator.name || observation.indicator_id)}</td>
              <td>${escapeHtml(observation.year)}</td>
              <td>${escapeHtml(`${formatNumber(Number(observation.raw_value))} ${text(observation.unit, "")}`.trim())}</td>
              <td>${escapeHtml(observation.provider_title || observation.provider_id || observation.source_id)}</td>
              <td>${escapeHtml(observation.data_quality || observation.confidence || "Rohdaten")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function timelineScoresForEntity(entity, state) {
  const observations = observationsForEntity(entity, state)
    .map((observation) => ({ ...observation, raw_value: numericValue(observation.raw_value) }))
    .filter((observation) => observation.raw_value !== null);
  const model = buildScoringModel(state);
  const byYear = new Map();
  observations.forEach((observation) => {
    const baseline = model.baselines.get(observation.indicator_id);
    const betaScore = normalizedIndicatorScore(observation, baseline);
    if (typeof betaScore !== "number") return;
    const year = Number(observation.year);
    if (!year) return;
    if (!byYear.has(year)) byYear.set(year, {});
    const bucket = byYear.get(year);
    const dimension = observation.indicator.dimension || "datenqualitaet";
    if (!bucket[dimension]) bucket[dimension] = [];
    bucket[dimension].push(betaScore);
  });
  return [...byYear.entries()].map(([year, bucket]) => {
    const entry = { year };
    ["mensch", "planet", "demokratie"].forEach((dimension) => {
      if (bucket[dimension]?.length) {
        entry[dimension] = bucket[dimension].reduce((sum, value) => sum + value, 0) / bucket[dimension].length;
      }
    });
    const dimensions = ["mensch", "planet", "demokratie"].filter((dimension) => typeof entry[dimension] === "number");
    if (dimensions.length) entry.status = dimensions.reduce((sum, dimension) => sum + entry[dimension], 0) / dimensions.length;
    return entry;
  }).filter((entry) => typeof entry.status === "number").sort((a, b) => a.year - b.year);
}

function chartPath(points, years, key) {
  const valid = points.filter((point) => typeof point[key] === "number");
  if (valid.length < 2) return "";
  const minYear = years[0];
  const maxYear = years[years.length - 1];
  return valid.map((point, index) => {
    const x = minYear === maxYear ? 360 : 70 + ((point.year - minYear) / (maxYear - minYear)) * 590;
    const y = 245 - (Math.max(0, Math.min(100, point[key])) / 100) * 195;
    return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
}

function renderBetaChart(target, entity, state, toolName, summary) {
  const points = timelineScoresForEntity(entity, state);
  if (points.length < 2) {
    renderEmptyChart(target, toolName, summary);
    return;
  }
  const years = points.map((point) => point.year);
  const series = [
    ["status", "MPD-Status", "#0b1324"],
    ["mensch", "Mensch", "#1f7a7a"],
    ["planet", "Planet", "#7a9442"],
    ["demokratie", "Demokratie", "#9a6d91"]
  ];
  target.innerHTML = `
    <svg class="wk-chart" viewBox="0 0 720 305" role="img" aria-labelledby="wk-chart-title wk-chart-desc">
      <title id="wk-chart-title">Vorläufiger Beta-Zeitverlauf</title>
      <desc id="wk-chart-desc">Relativer Arbeitswert aus vorhandenen Snapshot-Rohdaten. Kein amtlicher Score.</desc>
      <rect x="1" y="1" width="718" height="303" rx="8" fill="#fbfaf7" stroke="#d9d0c2"></rect>
      <line x1="70" y1="245" x2="660" y2="245" stroke="#d9d0c2"></line>
      <line x1="70" y1="50" x2="70" y2="245" stroke="#d9d0c2"></line>
      <line x1="70" y1="147" x2="660" y2="147" stroke="#e5ddd2"></line>
      <line x1="70" y1="92" x2="660" y2="64" stroke="#5c6975" stroke-dasharray="7 7"></line>
      <text x="70" y="35" class="wk-chart-label">Beta-Arbeitswert 0-100</text>
      <text x="548" y="88" class="wk-chart-label">Orientierungspfad</text>
      ${series.map(([key, label, color]) => {
        const path = chartPath(points, years, key);
        return path ? `<path d="${path}" fill="none" stroke="${color}" stroke-width="${key === "status" ? 4 : 2.5}"></path>` : "";
      }).join("")}
      ${years.map((year) => {
        const x = years[0] === years[years.length - 1] ? 360 : 70 + ((year - years[0]) / (years[years.length - 1] - years[0])) * 590;
        return `<text x="${x.toFixed(1)}" y="268" class="wk-chart-label">${year}</text>`;
      }).join("")}
      <g class="wk-chart-legend">
        ${series.map(([, label, color], index) => `<circle cx="${80 + index * 118}" cy="288" r="4" fill="${color}"></circle><text x="${92 + index * 118}" y="292">${label}</text>`).join("")}
      </g>
    </svg>
  `;
}

function renderEmptyChart(target, toolName, summary) {
  const chartText = summary.observationCount > 0
    ? `${toolName} hat bereits ${summary.observationCount} Rohbeobachtungen im Snapshot. Ein Zeitverlauf erscheint, sobald fuer mindestens zwei Jahre normalisierbare Beta-Arbeitswerte vorliegen.`
    : `${toolName} zeigt hier künftig Status, Mensch, Planet, Demokratie und Datenqualität über die Zeit. Im Beta-Snapshot liegen noch keine validierten Beobachtungen vor.`;
  target.innerHTML = `
    <svg class="wk-chart" viewBox="0 0 720 305" role="img" aria-labelledby="wk-chart-title wk-chart-desc">
      <title id="wk-chart-title">Zeitverlauf vorgesehen</title>
      <desc id="wk-chart-desc">Der Zeitverlauf wird angezeigt, sobald versionierte Beobachtungen über mehrere Jahre vorliegen.</desc>
      <rect x="1" y="1" width="718" height="303" rx="8" fill="#fbfaf7" stroke="#d9d0c2"></rect>
      <line x1="70" y1="245" x2="660" y2="245" stroke="#d9d0c2"></line>
      <line x1="70" y1="50" x2="70" y2="245" stroke="#d9d0c2"></line>
      <line x1="70" y1="92" x2="660" y2="64" stroke="#5c6975" stroke-dasharray="7 7"></line>
      <text x="70" y="35" class="wk-chart-label">Score 0-100</text>
      <text x="548" y="88" class="wk-chart-label">Ziel-/Transformationspfad</text>
      <text x="90" y="145" class="wk-chart-empty">${escapeHtml(chartText)}</text>
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

function interpretation(entity, universe, summary, scoreProfile = null) {
  if (scoreProfile?.indicatorCount) {
    return [
      `Im vorhandenen Datenstand kann für ${entity.name} ein vorläufiger Beta-Arbeitswert aus ${scoreProfile.indicatorCount} normalisierbaren Indikatoren berechnet werden. Der MPD-Arbeitswert liegt bei ${formatScore(scoreProfile.overall)} von 100, sofern mindestens eine Dimension Daten enthält.`,
      "Dieser Wert ist relativ zum geladenen Snapshot-Universum min-max-normalisiert. Er ist kein amtlicher Score, kein Ranking, kein finaler Zielpfadwert und keine politische Bewertung.",
      `Abgedeckt sind aktuell ${scoreProfile.dimensionCount} von 3 MPD-Dimensionen. Die Datenqualität wird als Arbeitswert mit ${formatScore(scoreProfile.dataQualityScore)} von 100 ausgewiesen.`,
      "Prüffrage: Welche zusätzlichen Indikatoren, Zielpfade und Datenqualitätsregeln müssen ergänzt werden, damit aus dem Arbeitswert ein belastbares Wirkungsprofil wird?",
      "Diese Einordnung ist kein Ranking, kein amtliches Rating, keine politische Gesinnungsbewertung und keine automatische Entscheidung."
    ];
  }
  const dataLine = summary.observationCount > 0
    ? `Im vorhandenen Datenstand liegen für ${entity.name} bereits ${summary.observationCount} Rohbeobachtungen aus versionierten Snapshot-Importen im ${universe.shortname}-Universum vor. Ein Wirkungsprofil wird noch nicht berechnet, weil Normalisierung, Zielpfad, Datenqualität und Mindestabdeckung fachlich validiert werden müssen.`
    : `Im vorhandenen Datenstand liegt für ${entity.name} ein Metadatenprofil im ${universe.shortname}-Universum vor. Ein Wirkungsprofil wird noch nicht berechnet, weil keine versionierten Beobachtungen, Quellenanker und Datenqualitätsprüfungen hinterlegt sind.`;
  return [
    dataLine,
    "Der Wirkungskompass zeigt deshalb Datenstatus, Vergleichsebene, Snapshot-Provider und offene Datenlücken statt scheingenauer Gesamtwerte.",
    "Prüffrage: Welche Indikatoren liegen für Mensch, Planet und Demokratie über mehrere Jahre, mit Lizenz, Abrufdatum, Methodikversion und Datenqualität vor?",
    "Diese Einordnung ist kein Ranking, kein amtliches Rating, keine politische Gesinnungsbewertung und keine automatische Entscheidung."
  ];
}

function interpretationWithProfile(entity, universe, summary, profile, scoreProfile) {
  const lines = interpretation(entity, universe, summary, scoreProfile);
  if (!profile.latest.length) return lines;
  const availableDimensions = ["mensch", "planet", "demokratie"]
    .filter((dimension) => profile.dimensions[dimension])
    .map((dimension) => dimensionLabels[dimension]);
  const missingDimensions = ["mensch", "planet", "demokratie"]
    .filter((dimension) => !profile.dimensions[dimension])
    .map((dimension) => dimensionLabels[dimension]);
  return [
    `Für ${entity.name} sind aktuell Rohdaten in ${availableDimensions.join(", ") || "keiner MPD-Dimension"} sichtbar. Das ist ein vorläufiges Beta-Datenprofil, noch kein abschließendes Wirkungsurteil.`,
    missingDimensions.length
      ? `Noch unvollständig ist die Datenlage in: ${missingDimensions.join(", ")}. Dort wird kein Wert angezeigt und keine Wirkung unterstellt.`
      : "Für alle drei MPD-Dimensionen liegen erste Rohdaten vor; die fachliche Normalisierung ist weiterhin offen.",
    "Die Karten zeigen deshalb vorläufige Arbeitswerte, Indikatoren, Beobachtungen, jüngstes Datenjahr und Quellenstatus. Ein finaler Gesamtwert folgt erst, wenn Zielpfade, Mindestabdeckung und Datenqualität validiert sind.",
    ...lines
  ];
}

function renderIndicatorList(items, emptyText) {
  if (!items.length) return `<p class="card-text">${escapeHtml(emptyText)}</p>`;
  return `
    <ol class="wk-mini-list">
      ${items.slice(0, 5).map((item) => `
        <li>
          <span>${escapeHtml(item.indicator.name || item.indicator_id)} <small>${escapeHtml(dimensionLabels[item.indicator.dimension] || item.indicator.dimension || "Daten")} · ${escapeHtml(item.year)}</small></span>
          <strong>${formatScore(item.beta_score)}</strong>
        </li>
      `).join("")}
    </ol>
  `;
}

function renderSourceRows(universe, state) {
  const snapshotRows = snapshotsForUniverse(state, universe).map((snapshot) => [
    snapshot.provider_title || snapshot.provider_id,
    (snapshot.years || []).length ? `${snapshot.years[0]}-${snapshot.years[snapshot.years.length - 1]}` : "offen",
    snapshot.shortname,
    snapshot.path,
    snapshot.imported_at || snapshot.retrieved_at || "offen",
    `${snapshot.indicator_count || 0} Indikatoren / ${snapshot.observation_count || 0} Beobachtungen`,
    "versionierter Snapshot-Import",
    snapshot.score_ready ? "Scorefähig" : "Rohdaten, Score offen"
  ]);
  const rows = [
    ...snapshotRows,
    ["Territorialer Metadaten-Snapshot", "2026", universe.shortname, "data/wirkungskompass", "10.06.2026", "feste Entitäten", "statischer Snapshot", "validiert"],
    ["Provider-Registry", "2026", "LWK/EWK/WWK", "data/wirkungskompass/provider-registry.json", "10.06.2026", "geplante Datenquellen", "Snapshot-Import", "methodisch vorbereitet"]
  ];
  return rows.map((row) => `
    <tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>
  `).join("");
}

function compareCard(entity, state, universe) {
  const summary = snapshotSummaryForEntity(entity, state, universe);
  const scoreProfile = scoreProfileForEntity(entity, state);
  return `
    <article class="wk-compare-item">
      <p class="card-kicker">${escapeHtml(entity.entity_type)}</p>
      <h4>${escapeHtml(entity.name)}</h4>
      <p class="card-text">${escapeHtml(summary.status)}</p>
      <p class="card-text">${typeof scoreProfile.overall === "number" ? `Beta-Arbeitswert: ${formatScore(scoreProfile.overall)} / 100 · kein Ranking.` : "Noch kein normalisierbarer Arbeitswert."}</p>
    </article>
  `;
}

function renderComparison(target, comparison, copy, state, universe) {
  target.innerHTML = `
    <div class="inline-heading">
      <div>
        <p class="hero-kicker">Vergleichsansicht</p>
        <h3>Datenprofile nebeneinander</h3>
      </div>
      <p class="card-text">${escapeHtml(copy.compareHint)}</p>
    </div>
    ${comparison.length ? `<div class="wk-compare-list">${comparison.map((entity) => compareCard(entity, state, universe)).join("")}</div>` : `<p class="card-text">Noch kein Profil im Vergleich. Wähle eine Einheit aus und füge sie hinzu.</p>`}
  `;
}

function renderProfile(entity, universe, state) {
  const profile = document.querySelector("[data-wk-profile]");
  const copy = toolCopy[state.tool] || toolCopy["lwk-de"];
  const summary = snapshotSummaryForEntity(entity, state, universe);
  const dataProfile = dataProfileForEntity(entity, state);
  const scoreProfile = scoreProfileForEntity(entity, state);
  const weakestItems = [...scoreProfile.scored].sort((a, b) => a.beta_score - b.beta_score);
  const strongestItems = [...scoreProfile.scored].sort((a, b) => b.beta_score - a.beta_score);
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
          <span><strong>Datenstand</strong>${escapeHtml(summary.snapshotCount ? "Metadaten + Rohdaten-Snapshot" : "Metadaten-Snapshot 10.06.2026")}</span>
          <span><strong>Methodik</strong>${escapeHtml(entity.method_version || universe.method_version)}</span>
          <span><strong>Rohbeobachtungen</strong>${escapeHtml(summary.observationCount)}</span>
          <span><strong>Bevölkerung</strong>${formatNumber(entity.population)}</span>
          <span><strong>Fläche</strong>${formatNumber(entity.area, " km²")}</span>
        </div>
      </div>

      <aside class="protection-notice" role="note">
        <p class="card-kicker">${typeof scoreProfile.overall === "number" ? "Vorläufiger Beta-Arbeitswert" : "Gesamtwert"}</p>
        <h3>${typeof scoreProfile.overall === "number" ? `${formatScore(scoreProfile.overall)} / 100` : "Kein Gesamtwert"}</h3>
        <p>${typeof scoreProfile.overall === "number" ? `Berechnet aus ${scoreProfile.indicatorCount} normalisierbaren Indikatoren im geladenen Snapshot. Dieser Arbeitswert ist relativ, vorläufig und kein amtliches Rating, kein Ranking, keine politische Bewertung und kein finaler Zielpfadscore.` : (summary.observationCount > 0 ? `Rohdaten sind vorhanden: ${summary.observationCount} Beobachtungen aus ${summary.snapshotCount} Snapshot(s). Sie werden unten als Beta-Rohdatenprofil angezeigt. Ein Arbeitswert ist erst möglich, wenn mindestens zwei vergleichbare Rohwerte pro Indikator vorliegen.` : "Kein Gesamtwert: Für diese Einheit liegen noch keine nutzbaren Rohbeobachtungen im Snapshot vor.")}</p>
      </aside>

      <div class="card-grid four wk-score-grid">
        ${rawDimensionCard(dimensionLabels.mensch, "mensch", "Armut, Gesundheit, Bildung, Arbeit, Wohnen, Teilhabe und soziale Sicherheit.", dataProfile, scoreProfile)}
        ${rawDimensionCard(dimensionLabels.planet, "planet", "Klima, Energie, Fläche, Luft, Wasser, Biodiversität, Ressourcen und Klimarisiken.", dataProfile, scoreProfile)}
        ${rawDimensionCard(dimensionLabels.demokratie, "demokratie", "Wahlbeteiligung, Rechtsstaatlichkeit, Transparenz, Medienvielfalt, Vertrauen und Zivilgesellschaft als SDG+-Prüffeld.", dataProfile, scoreProfile)}
        ${dataQualityCard(dataProfile, summary, scoreProfile)}
      </div>

      <section class="card" aria-labelledby="wk-rawdata-title">
        <div class="inline-heading">
          <div>
          <p class="hero-kicker">Beta-Rohdatenprofil</p>
          <h3 id="wk-rawdata-title">Geladene Snapshot-Werte</h3>
        </div>
          <p class="card-text">Diese Werte sind öffentliche Rohdaten aus versionierten Importen. Die Arbeitswerte werden defensiv relativ normalisiert und bleiben als Beta gekennzeichnet.</p>
        </div>
        ${renderRawObservationRows(dataProfile)}
      </section>

      <section class="card" aria-labelledby="wk-timeline-title">
        <div class="inline-heading">
          <div>
          <p class="hero-kicker">Zeitverlauf</p>
          <h3 id="wk-timeline-title">Wirkungsprofil im Verlauf</h3>
        </div>
          <p class="card-text">Der Verlauf zeigt vorläufige relative Arbeitswerte aus vorhandenen Beobachtungsjahren. Zielpfade und finale Datenqualität bleiben gesondert zu validieren.</p>
        </div>
        <div data-wk-chart></div>
      </section>

      <section class="card" aria-labelledby="wk-interpretation-title">
        <p class="hero-kicker">Regelbasierte Interpretation</p>
        <h3 id="wk-interpretation-title">Einordnung für ${escapeHtml(entity.name)}</h3>
        ${interpretationWithProfile(entity, universe, summary, dataProfile, scoreProfile).map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
      </section>

      <div class="card-grid two">
        <article class="card">
          <p class="card-kicker">Größte Wirkungslücken</p>
          <h3 class="card-title">Niedrige Beta-Arbeitswerte</h3>
          ${renderIndicatorList(weakestItems, "Noch keine normalisierbaren Indikatoren vorhanden.")}
        </article>
        <article class="card">
          <p class="card-kicker">Stärkere Ausgangslagen</p>
          <h3 class="card-title">Hohe Beta-Arbeitswerte</h3>
          ${renderIndicatorList(strongestItems, "Noch keine normalisierbaren Indikatoren vorhanden.")}
        </article>
      </div>

      <section class="card" aria-labelledby="wk-beta-disclaimer-title">
        <p class="hero-kicker">Wichtiger Beta-Hinweis</p>
        <h3 id="wk-beta-disclaimer-title">Arbeitswert statt fertiger Index</h3>
        <p>Die hier gezeigten Werte nutzen nur vorhandene öffentliche Snapshot-Daten. Sie werden relativ innerhalb des geladenen Universums normalisiert. Sie ersetzen keine fachlich finalisierte Methodik, keine Zielpfade, keine Kontextprüfung und keine demokratische Bewertung.</p>
        <p>Fehlende Daten bedeuten keine schlechte Wirkung. Niedrige oder hohe Arbeitswerte markieren Prüffragen im vorhandenen Datenstand.</p>
      </section>

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
            <tbody>${renderSourceRows(universe, state)}</tbody>
          </table>
        </div>
        <p class="card-text">${escapeHtml(universe.source_note)}</p>
      </section>

      <section class="card" data-wk-comparison></section>
    </section>
  `;
  renderBetaChart(profile.querySelector("[data-wk-chart]"), entity, state, universe.title, summary);
  renderComparison(profile.querySelector("[data-wk-comparison]"), state.comparison, copy, state, universe);
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
    comparison: [],
    snapshotManifest: null
  };
  const copy = toolCopy[state.tool] || toolCopy["lwk-de"];
  const [response, snapshotResponse] = await Promise.all([
    fetch(root.dataset.universeUrl),
    root.dataset.snapshotsUrl ? fetch(root.dataset.snapshotsUrl).catch(() => null) : Promise.resolve(null)
  ]);
  const universe = await response.json();
  if (snapshotResponse?.ok) {
    state.snapshotManifest = await snapshotResponse.json();
  }
  await loadSnapshotData(state, universe);
  const entities = Array.isArray(universe.entities) ? universe.entities : [];
  const input = document.querySelector("[data-wk-search]");
  const select = document.querySelector("[data-wk-select]");
  const results = document.querySelector("[data-wk-results]");
  const count = document.querySelector("[data-wk-count]");
  const filters = document.querySelector("[data-wk-filters]");

  input.placeholder = copy.searchPlaceholder;
  const universeSnapshots = snapshotsForUniverse(state, universe);
  const observationCount = universeSnapshots.reduce((sum, snapshot) => sum + (Number(snapshot.observation_count) || 0), 0);
  count.textContent = observationCount > 0
    ? `${entities.length} Einheiten im ${universe.shortname}-Universum · ${observationCount} Rohbeobachtungen in ${universeSnapshots.length} Snapshot(s)`
    : `${entities.length} Einheiten im ${universe.shortname}-Universum · noch kein Rohdaten-Snapshot`;
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
      ? filtered.map((entity) => renderEntityButton(entity, state, universe)).join("")
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
    if (comparison) renderComparison(comparison, state.comparison, copy, state, universe);
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
