const dashboardRoot = document.querySelector("[data-scorecard-dashboard]");
const euro = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2
});

let scorecardItems = [];
let selectedScorecardId = null;

function scoreTone(score) {
  if (score >= 1) return "tone-good";
  if (score >= 0) return "tone-mid";
  return "tone-bad";
}

function scoreLabel(score) {
  return score.toFixed(1).replace(".", ",");
}

function dimensionWidth(score) {
  return Math.max(0, Math.min(100, ((score + 3) / 6) * 100));
}

function costWidth(value, max) {
  return max > 0 ? Math.max(4, (value / max) * 100) : 0;
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

  list.innerHTML = items.map((item) => `
    <button class="scorecard-list-item ${item.id === selectedScorecardId ? "active" : ""}" type="button" data-scorecard-id="${item.id}">
      <img src="${item.image}" alt="" loading="lazy" decoding="async">
      <span>
        <b>${item.name}</b>
        <small>${item.type} · ${item.sector}</small>
      </span>
      <em class="${scoreTone(item.score)}">${scoreLabel(item.score)}</em>
    </button>
  `).join("");

  renderDetail();
}

function renderBars(target, entries, options = {}) {
  const max = options.max || Math.max(...entries.map((entry) => Math.abs(entry[1])), 1);
  target.innerHTML = entries.map(([label, value]) => {
    const width = options.score ? dimensionWidth(value) : costWidth(Math.abs(value), max);
    const display = options.money ? euro.format(value) : scoreLabel(value);
    return `
      <div class="impact-bar">
        <div class="impact-bar-heading"><span>${label}</span><span>${display}</span></div>
        <div class="impact-track"><div class="impact-fill ${options.score ? scoreTone(value) : "tone-mid"}" style="width:${width}%"></div></div>
      </div>
    `;
  }).join("");
}

function renderDetail() {
  const item = scorecardItems.find((entry) => entry.id === selectedScorecardId) || scorecardItems[0];
  if (!item) return;

  dashboardRoot.querySelector("[data-kpi-market]").textContent = euro.format(item.marketPrice);
  dashboardRoot.querySelector("[data-kpi-external]").textContent = euro.format(item.externalCosts);
  dashboardRoot.querySelector("[data-kpi-true]").textContent = euro.format(item.truePrice);
  const scoreEl = dashboardRoot.querySelector("[data-kpi-score]");
  scoreEl.textContent = scoreLabel(item.score);
  scoreEl.className = `score-pill ${scoreTone(item.score)}`;

  dashboardRoot.querySelector("[data-scorecard-visual]").innerHTML = `
    <img src="${item.image}" alt="" loading="lazy" decoding="async">
    <div>
      <p class="hero-kicker">${item.type} · ${item.sector}</p>
      <h3>${item.name}</h3>
      <p>${item.summary}</p>
      <p class="formula-note">Echter Preis = Marktpreis + externe Kosten + Wirkungsaufschlag/-abschlag. Die Beispiele sind didaktische Modellannahmen.</p>
    </div>
  `;

  renderBars(dashboardRoot.querySelector("[data-dimension-bars]"), Object.entries(item.dimensions), { score: true });
  renderBars(dashboardRoot.querySelector("[data-cost-bars]"), Object.entries(item.costBreakdown), { money: true });

  dashboardRoot.querySelector("[data-source-table]").innerHTML = item.indicators.map((indicator) => `
    <tr>
      <td>${indicator.wokId}</td>
      <td>${indicator.label}</td>
      <td>${indicator.value}</td>
      <td><span class="score-pill ${scoreTone(indicator.score)}">${scoreLabel(indicator.score)}</span></td>
      <td>${indicator.source}</td>
      <td>${indicator.assessment}</td>
    </tr>
  `).join("");
}

async function initScorecardDashboard() {
  if (!dashboardRoot) return;
  const response = await fetch("assets/data/scorecard-examples.json");
  scorecardItems = await response.json();
  selectedScorecardId = scorecardItems[0].id;
  setSectors(scorecardItems);
  renderList();

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
