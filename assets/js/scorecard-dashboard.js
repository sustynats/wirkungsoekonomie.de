const dashboardRoot = document.querySelector("[data-scorecard-dashboard]");

let scorecardItems = [];
let selectedScorecardId = null;

const EFFECT_DIMENSIONS = ["Mensch", "Planet", "Demokratie"];
const DATA_QUALITY_DIMENSION = "Datenqualität";

function scoreTone(score) {
  if (score >= 1) return "tone-good";
  if (score >= 0) return "tone-mid";
  return "tone-bad";
}

function scoreLabel(score) {
  return Number.isFinite(Number(score)) ? Number(score).toFixed(1).replace(".", ",") : "-";
}

function scoreWord(score) {
  if (score >= 2) return "klar positiv";
  if (score >= 1) return "positiv";
  if (score >= 0) return "neutral bis lernend";
  if (score >= -1) return "kritisch";
  return "deutlich belastend";
}

function dimensionWidth(score) {
  return Math.max(0, Math.min(100, ((Number(score) + 3) / 6) * 100));
}

function profileForItem(item) {
  const fields = EFFECT_DIMENSIONS.map((label) => ({
    label,
    value: Number(item?.dimensions?.[label])
  })).filter((field) => Number.isFinite(field.value));
  const missingFields = EFFECT_DIMENSIONS.filter((label) => !fields.some((field) => field.label === label));
  const weakest = fields.length ? [...fields].sort((left, right) => left.value - right.value)[0] : null;
  const dataQuality = Number(item?.dimensions?.[DATA_QUALITY_DIMENSION]);
  const sourcesPresent = Array.isArray(item?.indicators)
    && item.indicators.length > 0
    && item.indicators.every((indicator) => String(indicator.source || "").trim());

  return {
    fields,
    weakest,
    missingFields,
    dataQuality: Number.isFinite(dataQuality) ? dataQuality : null,
    sourcesPresent,
    gateOpen: false,
    gateReason: "geschlossen: Die Beispieldaten enthalten keine dokumentierte Systemgrenze, keinen Vergleichsfall, keine vollständige Attribution und keine unabhängige Prüfung."
  };
}

function setSectors(items) {
  const sectorSelect = dashboardRoot.querySelector("[data-filter-sector]");
  const sectors = Array.from(new Set(items.map((item) => item.sector))).sort((a, b) => a.localeCompare(b, "de"));
  sectorSelect.innerHTML = `<option value="all">Alle Sektoren</option>${sectors.map((sector) => `<option value="${sector}">${sector}</option>`).join("")}`;
}

function filteredItems() {
  const type = dashboardRoot.querySelector("[data-filter-type]").value;
  const sector = dashboardRoot.querySelector("[data-filter-sector]").value;
  return scorecardItems.filter((item) => {
    const typeMatch = type === "all" || item.type === type;
    const sectorMatch = sector === "all" || item.sector === sector;
    return typeMatch && sectorMatch;
  });
}

function renderList() {
  const list = dashboardRoot.querySelector("[data-scorecard-list]");
  const items = filteredItems();
  if (!items.some((item) => item.id === selectedScorecardId)) {
    selectedScorecardId = items[0]?.id || scorecardItems[0]?.id;
  }

  list.innerHTML = items.map((item) => {
    const profile = profileForItem(item);
    const weak = profile.weakest;
    return `
      <button class="scorecard-list-item ${item.id === selectedScorecardId ? "active" : ""}" type="button" data-scorecard-id="${item.id}">
        <img src="${item.image}" alt="" loading="lazy" decoding="async">
        <span class="scorecard-list-copy">
          <b>${item.name}</b>
          <small>${item.type} · ${item.sector}</small>
        </span>
        <em class="${weak ? scoreTone(weak.value) : "tone-mid"}" title="Schwächstes Wirkungsfeld nach Reverse Merit Order">${weak ? scoreLabel(weak.value) : "-"}</em>
      </button>
    `;
  }).join("") || `<p class="formula-note">Für diese Auswahl gibt es kein Beispielprofil.</p>`;

  renderDashboard();
  renderDetail();
}

function renderDashboard() {
  const summaryTarget = dashboardRoot.querySelector("[data-dashboard-summary]");
  const coreTarget = dashboardRoot.querySelector("[data-dashboard-core]");
  const historyTarget = dashboardRoot.querySelector("[data-dashboard-history]");
  const rankingTarget = dashboardRoot.querySelector("[data-dashboard-ranking]");
  const chainTarget = dashboardRoot.querySelector("[data-dashboard-chain]");
  const costsTarget = dashboardRoot.querySelector("[data-dashboard-costs]");
  const distributionTarget = dashboardRoot.querySelector("[data-dashboard-distribution]");
  if (!summaryTarget || !coreTarget || !historyTarget || !rankingTarget || !chainTarget || !costsTarget || !distributionTarget) return;

  const item = scorecardItems.find((entry) => entry.id === selectedScorecardId);
  if (!item) return;
  const profile = profileForItem(item);
  const weak = profile.weakest;
  const gateTone = "metric-bad";

  summaryTarget.innerHTML = [
    ["RMO-Gate", "geschlossen", profile.gateReason, gateTone, "⛔"],
    ["Schwächstes Feld", weak ? weak.label : "nicht bestimmbar", weak ? `${scoreLabel(weak.value)} · ${scoreWord(weak.value)}` : "Kernfeld fehlt", weak ? (weak.value >= 0 ? "metric-mid" : "metric-bad") : "metric-bad", "↓"],
    ["Datenstatus", "Beispieldaten", profile.sourcesPresent ? "Quellenhinweise vorhanden, aber nicht unabhängig verifiziert." : "Quellenhinweise unvollständig.", "metric-mid", "i"],
    ["Ausgabe", "Profil, keine Preisfolge", "Keine Steuerklasse, kein echter Preis, kein Wirkungsranking.", "metric-mid", "≠"]
  ].map(([label, value, note, tone, icon]) => `
    <article class="dashboard-metric ${tone}">
      <div>
        <span>${label}</span>
        <strong>${value}</strong>
        <small>${note}</small>
      </div>
      <i aria-hidden="true">${icon}</i>
    </article>
  `).join("");

  coreTarget.innerHTML = `
    <h3>Wirkungsprofil des ausgewählten Beispiels</h3>
    <div class="core-field-grid">
      ${profile.fields.map(({ label, value }) => `
        <div class="core-field">
          <span>${label}</span>
          <strong class="${scoreTone(value)}">${scoreLabel(value)}</strong>
          <div class="score-axis"><i style="left:${dimensionWidth(value)}%"></i></div>
          <small>${scoreWord(value)}</small>
        </div>
      `).join("")}
      <div class="core-field">
        <span>Datenqualität</span>
        <strong class="${profile.dataQuality === null ? "tone-mid" : scoreTone(profile.dataQuality)}">${profile.dataQuality === null ? "-" : scoreLabel(profile.dataQuality)}</strong>
        <div class="score-axis"><i style="left:${profile.dataQuality === null ? 50 : dimensionWidth(profile.dataQuality)}%"></i></div>
        <small>Prüfbedingung, keine Wirkungsdimension</small>
      </div>
    </div>
    <p class="formula-note">Reverse Merit Order: Das schwächste Wirkungsfeld wird nicht mit anderen Feldern verrechnet. Die Datenqualität prüft, ob überhaupt eine belastbare Aussage möglich ist.</p>
  `;

  historyTarget.innerHTML = `
    <h3>Zeitverlauf</h3>
    <p>Für diese Beispiele ist keine versionierte Zeitreihe hinterlegt. Deshalb zeigt das Dashboard keine Kurve und behauptet keine Verbesserung oder Verschlechterung.</p>
    <p class="formula-note">Für einen Verlauf braucht jede Messung dieselbe Systemgrenze, Methode und Datenbasis.</p>
  `;

  rankingTarget.innerHTML = `
    <h3>Keine Rangliste</h3>
    <p>Die Beispiele dienen der Erklärung, nicht dem Wettbewerb. Ein einzelner Gesamtwert würde Unterschiede in Systemgrenze, Evidenz und Schwachfeldern verschleiern.</p>
    <p class="formula-note">Vergleichen darf nur, wer dieselben Prüfkriterien, Zeiträume und Datenqualitäten offenlegt.</p>
  `;

  chainTarget.innerHTML = `
    <h3>Prüfpfad statt Punkteschlange</h3>
    <div class="chain-flow">
      ${["Systemgrenze", "Wirkpfad", "Vergleichsfall", "Schäden & Nebenfolgen", "Prüfung"].map((step, index) => `
        <div class="chain-step"><span>${index + 1}</span><strong>${step}</strong></div>
      `).join("")}
    </div>
    <p class="formula-note">Die Schritte sind Fragen für eine vollständige Bewertung, keine behauptete Liefer- oder Wirkungskette dieses Beispiels.</p>
  `;

  costsTarget.innerHTML = `
    <h3>Monetarisierung nicht ausgewiesen</h3>
    <p>Für diese Demo sind keine geprüften Preis-, Steuer- oder externen Kostenwerte veröffentlicht. Geldbeträge würden eine Genauigkeit vortäuschen, die die Beispieldaten nicht tragen.</p>
    <p class="formula-note">Eine Monetarisierung braucht Bewertungsjahr, Einheit, Preisbasis, Systemgrenze, Quellen und Sensitivitätsanalyse.</p>
  `;

  distributionTarget.innerHTML = `
    <h3>Datenstatus</h3>
    <div class="distribution-block">
      <p class="hero-kicker">Ausgewähltes Beispiel</p>
      <div class="distribution-row"><span>Indikatorhinweise</span><strong>${Array.isArray(item.indicators) ? item.indicators.length : 0}</strong></div>
      <div class="distribution-row"><span>Kernfelder vorhanden</span><strong>${profile.fields.length} / ${EFFECT_DIMENSIONS.length}</strong></div>
      <div class="distribution-row"><span>Fehlende Kernfelder</span><strong>${profile.missingFields.length || "keine"}</strong></div>
    </div>
    <p class="formula-note">Die Angaben beschreiben die Demo-Datenlage. Sie sind keine Zertifizierung, keine Verifikation und kein Freigabesignal.</p>
  `;
}

function renderBars(entries) {
  return entries.map(([label, value]) => `
    <div class="impact-bar">
      <div class="impact-bar-heading"><span>${label}</span><span>${scoreLabel(value)}</span></div>
      <div class="impact-track"><div class="impact-fill ${scoreTone(value)}" style="width:${dimensionWidth(value)}%"></div></div>
    </div>
  `).join("");
}

function renderOverview(item) {
  return `
    <img src="${item.image}" alt="" loading="lazy" decoding="async">
    <div class="pass-overview-copy">
      <p class="hero-kicker">${item.type} · ${item.sector}</p>
      <h3>${item.name}</h3>
      <p>${item.summary}</p>
    </div>
    <ul class="pass-checks" aria-label="Status des Beispiels">
      <li>Beispieldaten</li>
      <li>keine Zertifizierung</li>
      <li>keine Preis- oder Steuerfolge</li>
    </ul>
  `;
}

function renderIdentity(item) {
  return `
    <h3>Einordnung des Beispiels</h3>
    <dl class="pass-facts">
      <div><dt>Demo-Fall</dt><dd>${item.id}</dd></div>
      <div><dt>Name</dt><dd>${item.name}</dd></div>
      <div><dt>Kategorie</dt><dd>${item.type} · ${item.sector}</dd></div>
      <div><dt>Systemgrenze</dt><dd>nicht dokumentiert</dd></div>
      <div><dt>Prüfstatus</dt><dd>keine unabhängige Verifikation</dd></div>
      <div><dt>Verwendung</dt><dd>Methodenbeispiel, keine Produktbehauptung</dd></div>
    </dl>
  `;
}

function renderLifecycle() {
  return `
    <h3>Wirkpfad prüfen</h3>
    <div class="lifecycle-map">
      ${["Ausgangslage", "Intervention", "beobachtete Veränderung", "Gegenfaktoren", "Folgewirkung"].map((step, index) => `
        <div class="lifecycle-node"><span>${index + 1}</span><strong>${step}</strong></div>
      `).join("")}
    </div>
    <p class="formula-note">Das ist ein Prüfschema. Es beschreibt keine verifizierte Lieferkette des ausgewählten Beispiels.</p>
  `;
}

function renderScorecard(item) {
  const profile = profileForItem(item);
  const weak = profile.weakest;
  return `
    <h3>Wirkungsprofil mit RMO-Gate</h3>
    <div class="pass-score-summary">
      <span class="score-pill ${weak ? scoreTone(weak.value) : "tone-mid"}">${weak ? `${scoreLabel(weak.value)} / 3` : "-"}</span>
      <strong>${weak ? `Schwächstes Feld: ${weak.label}` : "Kernfelder unvollständig"}</strong>
    </div>
    <div class="impact-bars">${renderBars(profile.fields.map(({ label, value }) => [label, value]))}</div>
    <p class="formula-note"><strong>Gate: geschlossen.</strong> ${profile.gateReason}</p>
  `;
}

function renderTax() {
  return `
    <h3>Keine Steuerklasse aus Beispieldaten</h3>
    <p>Eine Steuer- oder Preisfolge braucht eine demokratisch beschlossene Rechtsgrundlage und geprüfte, vergleichbare Daten. Beides liegt hier nicht vor.</p>
    <p class="formula-note">Der RMO-Check verhindert vor allem Scheingenauigkeit: Ein Demo-Profil löst keine Abgabe aus.</p>
  `;
}

function renderSupply() {
  return `
    <h3>Lieferkettennachweis offen</h3>
    <p>Dieses Beispiel enthält keine verifizierte Lieferkettendokumentation. Die unten genannten Quellenhinweise sind Ansatzpunkte für die Prüfung, keine Bestätigung einzelner Stationen.</p>
  `;
}

function renderStandards(item) {
  const sources = Array.from(new Set((item.indicators || [])
    .flatMap((indicator) => String(indicator.source || "").split(";").map((source) => source.trim()))
    .filter(Boolean))).slice(0, 5);
  return `
    <h3>Genannte Referenztypen</h3>
    <ul class="pass-list standards-list">
      ${sources.map((source) => `<li><span>${source}</span><strong>im Beispiel genannt</strong></li>`).join("") || "<li><span>Keine Quellenhinweise</span><strong>Prüfbedarf</strong></li>"}
    </ul>
  `;
}

function renderRecommendations(item) {
  const profile = profileForItem(item);
  const weakFields = profile.fields.slice().sort((left, right) => left.value - right.value).slice(0, 2).map((field) => field.label);
  const lowestIndicator = [...(item.indicators || [])].sort((left, right) => Number(left.score) - Number(right.score))[0];
  const prompts = [
    `${weakFields.join(" und ") || "Kernfelder"}: Messgrenze, Kennzahl und Vergleichsfall offenlegen.`,
    `${lowestIndicator?.label || "Schwächstes Indikatorfeld"}: Datenquelle, Zeitraum und Unsicherheit prüfen.`,
    "Negative Folgen, Verdrängung und Ohnehin-Effekte getrennt dokumentieren.",
    "Erst nach unabhängiger Prüfung über eine Preis-, Steuer- oder Förderfolge entscheiden."
  ];
  return `
    <h3>Nächste Prüffragen</h3>
    <ul class="recommendation-list">
      ${prompts.map((prompt, index) => `<li><span>${index + 1}</span>${prompt}</li>`).join("")}
    </ul>
  `;
}

function renderVerification() {
  return `
    <h3>Keine digitale Verifikation</h3>
    <p>Es gibt für diese Beispiele keinen scanbaren, amtlichen oder zertifizierten Produktpass. Ein Muster-QR-Code würde eine Prüfung vortäuschen und wird deshalb nicht angezeigt.</p>
  `;
}

function renderDetail() {
  const item = scorecardItems.find((entry) => entry.id === selectedScorecardId) || scorecardItems[0];
  if (!item) return;
  const profile = profileForItem(item);
  const weak = profile.weakest;

  dashboardRoot.querySelector("[data-kpi-gate]").textContent = "geschlossen";
  dashboardRoot.querySelector("[data-kpi-weakest]").textContent = weak ? weak.label : "-";
  dashboardRoot.querySelector("[data-kpi-data]").textContent = "Beispieldaten";
  const scoreEl = dashboardRoot.querySelector("[data-kpi-score]");
  scoreEl.textContent = weak ? scoreLabel(weak.value) : "-";
  scoreEl.className = `score-pill ${weak ? scoreTone(weak.value) : "tone-mid"}`;

  dashboardRoot.querySelector("[data-pass-overview]").innerHTML = renderOverview(item);
  dashboardRoot.querySelector("[data-pass-identity]").innerHTML = renderIdentity(item);
  dashboardRoot.querySelector("[data-pass-lifecycle]").innerHTML = renderLifecycle();
  dashboardRoot.querySelector("[data-pass-scorecard]").innerHTML = renderScorecard(item);
  dashboardRoot.querySelector("[data-pass-tax]").innerHTML = renderTax();
  dashboardRoot.querySelector("[data-pass-supply]").innerHTML = renderSupply();
  dashboardRoot.querySelector("[data-pass-standards]").innerHTML = renderStandards(item);
  dashboardRoot.querySelector("[data-pass-recommendations]").innerHTML = renderRecommendations(item);
  dashboardRoot.querySelector("[data-pass-verification]").innerHTML = renderVerification();

  dashboardRoot.querySelector("[data-source-table]").innerHTML = (item.indicators || []).map((indicator) => `
    <tr>
      <td>${indicator.wokId || "-"}</td>
      <td>${indicator.label || "-"}</td>
      <td>${indicator.value || "-"}</td>
      <td><span class="score-pill ${scoreTone(Number(indicator.score))}">${scoreLabel(indicator.score)}</span></td>
      <td>${indicator.source || "-"}</td>
      <td>${indicator.assessment || "Beispieldaten; nicht unabhängig verifiziert"}</td>
    </tr>
  `).join("");
}

async function initScorecardDashboard() {
  if (!dashboardRoot) return;
  const navLinks = Array.from(dashboardRoot.querySelectorAll("[data-dashboard-nav]"));
  const syncActiveNav = (hash = window.location.hash || "#dashboard") => {
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === hash);
    });
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", () => syncActiveNav(link.getAttribute("href")));
  });
  window.addEventListener("hashchange", () => syncActiveNav());
  syncActiveNav();

  try {
    const response = await fetch("assets/data/scorecard-examples.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    scorecardItems = await response.json();
    selectedScorecardId = scorecardItems[0]?.id || null;
    setSectors(scorecardItems);
    renderList();
  } catch (error) {
    const list = dashboardRoot.querySelector("[data-scorecard-list]");
    if (list) list.innerHTML = "<p class=\"formula-note\">Die Beispieldaten konnten nicht geladen werden.</p>";
  }

  dashboardRoot.addEventListener("click", (event) => {
    const button = event.target.closest("[data-scorecard-id]");
    if (!button) return;
    selectedScorecardId = button.dataset.scorecardId;
    renderList();
  });

  dashboardRoot.querySelector("[data-filter-type]").addEventListener("change", renderList);
  dashboardRoot.querySelector("[data-filter-sector]").addEventListener("change", renderList);
}

initScorecardDashboard();
