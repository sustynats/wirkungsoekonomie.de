(function () {
  const DATA_URL = "../../data/uwp/snapshots/uwp-100.sbti.latest.json?v=20260610-uwp-sbti";
  const FALLBACK_MESSAGE = "UWP-Snapshot konnte nicht geladen werden.";

  const state = {
    companies: [],
    profiles: new Map(),
    sources: [],
    activeSector: "Alle",
    selectedId: "",
    query: "",
    snapshot: null,
  };

  const elements = {
    search: document.getElementById("uwp-search"),
    select: document.getElementById("uwp-select"),
    results: document.getElementById("uwp-results"),
    profile: document.getElementById("uwp-profile"),
    filters: document.getElementById("uwp-filters"),
    summary: document.getElementById("uwp-summary"),
  };

  const sectors = ["Alle", "Large Cap / DAX-Umfeld", "Mid Cap / MDAX-TecDAX-Umfeld", "Small Cap / SDAX-Umfeld"];

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatScore(value) {
    if (typeof value !== "number" || Number.isNaN(value)) return "Offen";
    return String(Math.round(value)).replace(".", ",");
  }

  function formatPercent(value) {
    if (typeof value !== "number" || Number.isNaN(value)) return "Offen";
    return `${Math.round(value * 100)} %`;
  }

  function profileFor(company) {
    return state.profiles.get(company.company_id) || {};
  }

  function hasPartialScore(profile) {
    return Boolean(profile.matched_provider_name) && (typeof profile.planet_score === "number" || typeof profile.transformation_score === "number");
  }

  function statusLabel(profile) {
    if (hasPartialScore(profile)) return "Teilprofil berechnet";
    return "Quellenprofil berechnet";
  }

  function renderSummary() {
    if (!state.snapshot || !elements.summary) return;
    elements.summary.innerHTML = `
      <article class="wk-status-note wk-compact-note">
        <p class="hero-kicker">Snapshot-Stand</p>
        <h3>${escapeHtml(state.snapshot.matched_company_count)} von ${escapeHtml(state.snapshot.company_count)} Unternehmen mit SBTi-Teilprofil</h3>
        <p>${escapeHtml(state.snapshot.score_note)}</p>
      </article>
    `;
  }

  function renderFilters() {
    elements.filters.innerHTML = sectors
      .map((sector) => `<button class="wk-filter-button" type="button" data-sector="${escapeHtml(sector)}" aria-pressed="${sector === state.activeSector}">${escapeHtml(sector)}</button>`)
      .join("");
  }

  function filteredCompanies() {
    const query = state.query.trim().toLowerCase();
    return state.companies
      .filter((company) => state.activeSector === "Alle" || company.sector === state.activeSector)
      .filter((company) => !query || company.name.toLowerCase().includes(query))
      .slice(0, 28);
  }

  function renderSelect() {
    elements.select.innerHTML = `<option value="">Unternehmen auswählen ...</option>` + state.companies
      .map((company) => `<option value="${escapeHtml(company.company_id)}">${escapeHtml(company.name)}</option>`)
      .join("");
  }

  function renderResults() {
    const list = filteredCompanies();
    elements.results.innerHTML = list.map((company) => {
      const profile = profileFor(company);
      const selected = state.selectedId === company.company_id ? "true" : "false";
      const scoreLine = hasPartialScore(profile)
        ? `Planet ${formatScore(profile.planet_score)} · Transformation ${formatScore(profile.transformation_score)} · Datenqualität ${formatScore(profile.data_quality_score)}`
        : `Datenreife ${formatScore(profile.data_quality_score)} · SBTi-Match offen`;
      return `
        <button class="wk-result-button" type="button" data-id="${escapeHtml(company.company_id)}" aria-pressed="${selected}">
          <span>
            <strong>${escapeHtml(company.name)}</strong>
            <small>${escapeHtml(company.sector)} · ${escapeHtml(company.country)} · ${escapeHtml(company.universe)}</small>
            <small>${escapeHtml(scoreLine)}</small>
          </span>
          <span>${escapeHtml(statusLabel(profile))}</span>
        </button>
      `;
    }).join("") || `<p>Kein Unternehmen im UWP-100-Universum gefunden.</p>`;
  }

  function scoreCard(title, value, text, options = {}) {
    const isNumber = typeof value === "number" && !Number.isNaN(value);
    const bar = isNumber ? `<span class="wk-score-bar"><span style="width:${Math.max(0, Math.min(100, value))}%"></span></span>` : "";
    const kicker = options.kicker || (isNumber ? "Teilwert 0-100" : "Datenlücke");
    return `
      <article class="card wk-score-card-empty">
        <p class="card-kicker">${escapeHtml(kicker)}</p>
        <h3 class="card-title">${escapeHtml(title)}</h3>
        <p class="wk-score-number">${escapeHtml(formatScore(value))}</p>
        ${bar}
        <p class="card-text">${escapeHtml(text)}</p>
      </article>
    `;
  }

  function renderSources(profile) {
    const source = state.sources[0];
    const matched = profile.matched_provider_name ? `
      <tr><td>SBTi-Match</td><td>${escapeHtml(profile.matched_provider_name)}</td></tr>
      <tr><td>Provider-Sektor</td><td>${escapeHtml(profile.provider_sector || "nicht angegeben")}</td></tr>
      <tr><td>ISIN / LEI</td><td>${escapeHtml(profile.isin || "offen")} / ${escapeHtml(profile.lei || "offen")}</td></tr>
    ` : `<tr><td>SBTi-Match</td><td>Kein sicherer Treffer im Snapshot; keine negative Bewertung daraus abgeleitet.</td></tr>`;
    return `
      <div class="wk-table-wrap" style="margin-top:1rem">
        <table class="wk-source-table">
          <tbody>
            <tr><th>Quelle</th><td>${escapeHtml(source?.title || "SBTi Target Dashboard")}</td></tr>
            <tr><th>Provider</th><td>${escapeHtml(source?.provider || "Science Based Targets initiative")}</td></tr>
            <tr><th>Abruf</th><td>${escapeHtml(source?.retrieved_at || state.snapshot?.imported_at || "Snapshot")}</td></tr>
            <tr><th>Verwendet für</th><td>${escapeHtml(source?.used_for || "Planet-/Transformations-Teilprofil")}</td></tr>
            <tr><th>Grenze</th><td>${escapeHtml(source?.limits || "Zielstatus ersetzt keine vollständige Wirkungsbewertung.")}</td></tr>
            ${matched}
          </tbody>
        </table>
      </div>
    `;
  }

  function showProfile(company) {
    const profile = profileFor(company);
    state.selectedId = company.company_id;
    elements.profile.hidden = false;
    elements.profile.innerHTML = `
      <section class="card" style="margin-top:1rem">
        <div class="wk-profile-header">
          <div>
            <p class="hero-kicker">UWP-100 Beta / Snapshot-Profil</p>
            <h2>${escapeHtml(company.name)}</h2>
            <p>${escapeHtml(company.sector)} · ${escapeHtml(company.country)} · ${escapeHtml(company.universe)}</p>
          </div>
          <div class="wk-meta-grid">
            <span><strong>Datenstatus</strong>${escapeHtml(profile.status || statusLabel(profile))}</span>
            <span><strong>Methodikversion</strong>${escapeHtml(state.snapshot?.method_version || "UWP-100 Beta")}</span>
            <span><strong>Datenabdeckung</strong>${escapeHtml(formatPercent(profile.coverage))}</span>
            <span><strong>Hinweis</strong>Kein Finanzrating, kein Gesamtwert</span>
          </div>
        </div>
      </section>
      <aside class="wk-status-note" role="note" style="margin-top:1rem">
        <p class="card-text"><strong>Kein Gesamtwert:</strong> Für ${escapeHtml(company.name)} werden nur die Teilwerte berechnet, die quellenbasiert vorliegen. Mensch und Demokratie brauchen weitere öffentliche, versionierte Quellen; positive Zielwerte kompensieren keine roten Linien.</p>
      </aside>
      <div class="card-grid four wk-score-grid" style="margin-top:1rem">
        ${scoreCard("Mensch", profile.mensch_score, "Noch kein belastbarer Snapshot zu Arbeitsbedingungen, Menschenrechten, Lieferketten, Produktsicherheit oder sozialer Produktwirkung.")}
        ${scoreCard("Planet", profile.planet_score, profile.planet_score === null ? "Kein sicherer SBTi-Treffer. Das ist eine Datenlücke, keine Klimabewertung." : "Teilwert aus SBTi-Zielstatus und Zielklassifikation. Kein Nachweis tatsächlicher Emissionsreduktion.")}
        ${scoreCard("Demokratie", profile.demokratie_score, "Noch kein belastbarer Snapshot zu Steuertransparenz, Lobbying, Datenschutz, Korruption, Rechtskonformität oder institutionellem Vertrauen.")}
        ${scoreCard("Transformation", profile.transformation_score, hasPartialScore(profile) ? "Teilwert aus Near-Term-/Net-Zero-Status und vorhandenen Zielinformationen." : "Quellenreife berechnet; Transformationswirkung noch nicht quellenbasiert bewertet.")}
        ${scoreCard("Datenqualität", profile.data_quality_score, "Berechnet aus Quellenmatch, Zieltext, Identifiern und Beobachtungsumfang.", { kicker: "Quellenqualität 0-100" })}
      </div>
      <section class="card" style="margin-top:1rem">
        <p class="hero-kicker">Regelbasierte Interpretation</p>
        <h3>Einordnung für ${escapeHtml(company.name)}</h3>
        <p>${escapeHtml(profile.interpretation || "Quellenprofil angelegt; weitere Snapshot-Provider erforderlich.")}</p>
        <p>${escapeHtml(profile.calculation_note || "Keine Investmentempfehlung, kein ESG-Rating und kein vollständiges Wirkungsurteil.")}</p>
      </section>
      <section class="card" style="margin-top:1rem">
        <p class="hero-kicker">Quellen und Grenzen</p>
        <h3>Welche Daten wurden wirklich verwendet?</h3>
        ${renderSources(profile)}
      </section>
    `;
    renderResults();
  }

  async function loadSnapshot() {
    const response = await fetch(DATA_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`${FALLBACK_MESSAGE} (${response.status})`);
    const snapshot = await response.json();
    state.snapshot = snapshot;
    state.companies = snapshot.companies || [];
    state.profiles = new Map((snapshot.profiles || []).map((profile) => [profile.company_id, profile]));
    state.sources = snapshot.sources || [];
  }

  function bindEvents() {
    elements.filters.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-sector]");
      if (!button) return;
      state.activeSector = button.dataset.sector;
      renderFilters();
      renderResults();
    });
    elements.search.addEventListener("input", () => {
      state.query = elements.search.value;
      renderResults();
    });
    elements.select.addEventListener("change", () => {
      const company = state.companies.find((item) => item.company_id === elements.select.value);
      if (company) showProfile(company);
    });
    elements.results.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-id]");
      if (!button) return;
      const company = state.companies.find((item) => item.company_id === button.dataset.id);
      if (company) {
        elements.select.value = company.company_id;
        showProfile(company);
      }
    });
  }

  async function init() {
    try {
      bindEvents();
      renderFilters();
      elements.results.innerHTML = `<p>UWP-Snapshot wird geladen ...</p>`;
      await loadSnapshot();
      renderSummary();
      renderSelect();
      renderResults();
      const firstPartial = state.companies.find((company) => hasPartialScore(profileFor(company))) || state.companies[0];
      if (firstPartial) {
        elements.select.value = firstPartial.company_id;
        showProfile(firstPartial);
      }
    } catch (error) {
      elements.results.innerHTML = `<p>${escapeHtml(error.message || FALLBACK_MESSAGE)}</p>`;
    }
  }

  init();
})();
