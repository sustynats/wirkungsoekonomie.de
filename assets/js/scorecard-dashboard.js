const dashboardRoot = document.querySelector("[data-scorecard-dashboard]");
const euro = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2
});

let scorecardItems = [];
let selectedScorecardId = null;

const TAX_BANDS = [
  { score: 3, label: "Transformativ", rate: "0 %", tone: "good" },
  { score: 2, label: "Sehr positiv", rate: "0 %", tone: "good" },
  { score: 1, label: "Positiv", rate: "5 %", tone: "good" },
  { score: 0, label: "Neutral", rate: "10 %", tone: "mid" },
  { score: -1, label: "Schädlich", rate: "15 %", tone: "bad" },
  { score: -2, label: "Sehr schädlich", rate: "20 %", tone: "bad" },
  { score: -3, label: "Zerstörerisch", rate: "25 %", tone: "bad" }
];

function scoreTone(score) {
  if (score >= 1) return "tone-good";
  if (score >= 0) return "tone-mid";
  return "tone-bad";
}

function scoreLabel(score) {
  return Number(score).toFixed(1).replace(".", ",");
}

function scoreWord(score) {
  if (score >= 2) return "klar positiv";
  if (score >= 1) return "positiv";
  if (score >= 0) return "neutral bis lernend";
  if (score >= -1) return "kritisch";
  return "deutlich belastend";
}

function passId(item) {
  const hash = Array.from(item.id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return `PP-2026-${String(hash).padStart(4, "0")}`;
}

function dimensionWidth(score) {
  return Math.max(0, Math.min(100, ((score + 3) / 6) * 100));
}

function costWidth(value, max) {
  return max > 0 ? Math.max(4, (value / max) * 100) : 0;
}

function taxBandForScore(score) {
  return Math.max(-3, Math.min(3, Math.round(score)));
}

function taxRateFromScore(score) {
  const active = TAX_BANDS.find((band) => band.score === taxBandForScore(score));
  return active ? active.rate : "10 %";
}

function average(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
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
      <span class="scorecard-list-copy">
        <b>${item.name}</b>
        <small>${item.type} · ${item.sector}</small>
      </span>
      <em class="${scoreTone(item.score)}">${scoreLabel(item.score)}</em>
    </button>
  `).join("");

  renderDashboard(items);
  renderDetail();
}

function renderDashboard(items) {
  const summaryTarget = dashboardRoot.querySelector("[data-dashboard-summary]");
  const coreTarget = dashboardRoot.querySelector("[data-dashboard-core]");
  const historyTarget = dashboardRoot.querySelector("[data-dashboard-history]");
  const rankingTarget = dashboardRoot.querySelector("[data-dashboard-ranking]");
  const chainTarget = dashboardRoot.querySelector("[data-dashboard-chain]");
  const costsTarget = dashboardRoot.querySelector("[data-dashboard-costs]");
  const distributionTarget = dashboardRoot.querySelector("[data-dashboard-distribution]");
  if (!summaryTarget || !coreTarget || !historyTarget || !rankingTarget || !chainTarget || !costsTarget || !distributionTarget) return;

  const totalExternal = sum(items.map((item) => item.externalCosts));
  const totalMarket = sum(items.map((item) => item.marketPrice));
  const averageScore = average(items.map((item) => item.score));
  const averageHiddenShare = totalMarket > 0 ? (totalExternal / totalMarket) * 100 : 0;
  const selectedItem = scorecardItems.find((entry) => entry.id === selectedScorecardId) || items[0];
  const impactPoints = Math.max(0, Math.round((averageScore + 3) * 2450 + items.length * 95));
  const netTax = Math.max(0, Math.round(totalExternal * 1828));
  const best = [...items].sort((a, b) => b.score - a.score)[0];
  const worst = [...items].sort((a, b) => a.score - b.score)[0];

  summaryTarget.innerHTML = [
    ["Final Score", scoreLabel(averageScore), scoreWord(averageScore), averageScore],
    ["Steuerklasse", selectedItem ? taxRateFromScore(selectedItem.score) : "-", selectedItem ? `${selectedItem.name} aktiv` : "-", selectedItem?.score || 0],
    ["Wirkungspunkte", impactPoints.toLocaleString("de-DE"), "+2.350 vs. Vorjahr", averageScore],
    ["Steuerlast (netto)", euro.format(netTax), "nach Wirkung", -averageScore]
  ].map(([label, value, note, toneScore]) => {
    const tone = toneScore >= 1 ? "metric-good" : toneScore >= 0 ? "metric-mid" : "metric-bad";
    return `
    <article class="dashboard-metric ${tone}">
      <div>
        <span>${label}</span>
        <strong>${value}</strong>
        <small>${note}</small>
      </div>
      <i aria-hidden="true">${label === "Final Score" ? "↗" : label === "Steuerklasse" ? "%" : label === "Wirkungspunkte" ? "☆" : "€"}</i>
    </article>
  `;
  }).join("");

  const coreEntries = ["Klima", "Ressourcen & Kreislauf", "Arbeit & Fairness", "Gesundheit & Sicherheit"].map((label, index) => {
    const key = index === 0 ? "Planet" : index === 1 ? "Datenqualität" : index === 2 ? "Mensch" : "Demokratie";
    const value = average(items.map((item) => item.dimensions[key] ?? item.score));
    return [label, value];
  });
  coreTarget.innerHTML = `
    <h3>Scorecard - 4 Kernfelder</h3>
    <div class="core-field-grid">
      ${coreEntries.map(([label, value]) => `
        <div class="core-field">
          <span>${label}</span>
          <strong class="${scoreTone(value)}">${scoreLabel(value)}</strong>
          <div class="score-axis"><i style="left:${dimensionWidth(value)}%"></i></div>
          <small>${scoreWord(value)}</small>
        </div>
      `).join("")}
    </div>
    <p class="formula-note">Reverse Merit Order: Das schwächste Feld begrenzt den Final Score.</p>
  `;

  const history = [-0.2, 0.4, 1.2, averageScore];
  historyTarget.innerHTML = `
    <h3>Entwicklung Final Score</h3>
    <div class="score-history" aria-label="Final Score Entwicklung">
      ${history.map((value, index) => `
        <div class="score-point" style="left:${10 + index * 28}%; bottom:${18 + dimensionWidth(value) * 0.55}%">
          <span>${scoreLabel(value)}</span>
        </div>
      `).join("")}
      <svg viewBox="0 0 100 60" aria-hidden="true" preserveAspectRatio="none">
        <polyline points="${history.map((value, index) => `${10 + index * 28},${52 - dimensionWidth(value) * 0.35}`).join(" ")}" />
      </svg>
    </div>
    <div class="history-years"><span>2022</span><span>2023</span><span>2024</span><span>2025</span></div>
  `;

  const rankedItems = [...items].sort((a, b) => b.score - a.score);
  rankingTarget.innerHTML = `
    <h3>Wirkungsranking</h3>
    <div class="ranking-extremes">
      <div><span>Stärkste Wirkung</span><strong>${best?.name || "-"}</strong><em class="${best ? scoreTone(best.score) : ""}">${best ? scoreLabel(best.score) : "-"}</em></div>
      <div><span>Größte Belastung</span><strong>${worst?.name || "-"}</strong><em class="${worst ? scoreTone(worst.score) : ""}">${worst ? scoreLabel(worst.score) : "-"}</em></div>
    </div>
    <ol class="ranking-list">
      ${rankedItems.slice(0, 5).map((item) => `
        <li>
          <button type="button" data-scorecard-id="${item.id}">
            <span>${item.name}</span>
            <strong class="${scoreTone(item.score)}">${scoreLabel(item.score)}</strong>
          </button>
        </li>
      `).join("")}
    </ol>
  `;

  const costTotals = {};
  items.forEach((item) => {
    Object.entries(item.costBreakdown).forEach(([label, value]) => {
      costTotals[label] = (costTotals[label] || 0) + value;
    });
  });
  const costEntries = Object.entries(costTotals).sort((a, b) => b[1] - a[1]).slice(0, 6);
  costsTarget.innerHTML = `
    <h3>Externe Kostentreiber</h3>
    <div class="impact-bars">${renderBars(costEntries, { money: true })}</div>
  `;

  chainTarget.innerHTML = `
    <h3>Wirkungskette (Auszug)</h3>
    <div class="chain-flow">
      ${["Rohstoffe", "Produktion", "Transport", "Nutzung", "Ende"].map((step, index) => `
        <div class="chain-step">
          <span>${index + 1}</span>
          <strong>${step}</strong>
          <em>${scoreLabel(averageScore + (index - 2) * 0.12)}</em>
        </div>
      `).join("")}
    </div>
    <a class="text-link" href="#dashboard">Gesamte Wirkungskette ansehen</a>
  `;

  const typeCounts = items.reduce((map, item) => {
    map[item.type] = (map[item.type] || 0) + 1;
    return map;
  }, {});
  const sectorCounts = items.reduce((map, item) => {
    map[item.sector] = (map[item.sector] || 0) + 1;
    return map;
  }, {});
  distributionTarget.innerHTML = `
    <h3>Wirkungspunkte</h3>
    <div class="points-donut" style="--score:${Math.max(0, Math.min(100, dimensionWidth(averageScore)))}%">
      <strong>${impactPoints.toLocaleString("de-DE")}</strong>
      <span>Gesamt</span>
    </div>
    <div class="distribution-block">
      <p class="hero-kicker">Typ</p>
      ${Object.entries(typeCounts).map(([label, count]) => `<div class="distribution-row"><span>${label}</span><strong>${count}</strong></div>`).join("")}
    </div>
    <div class="distribution-block">
      <p class="hero-kicker">Sektoren</p>
      ${Object.entries(sectorCounts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, count]) => `<div class="distribution-row"><span>${label}</span><strong>${count}</strong></div>`).join("")}
    </div>
  `;
}

function renderBars(entries, options = {}) {
  const max = options.max || Math.max(...entries.map((entry) => Math.abs(entry[1])), 1);
  return entries.map(([label, value]) => {
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

function lifecycleSteps(item) {
  if (item.sector === "Textilien") return ["Rohstoffe", "Spinnen & Weben", "Färben & Nähen", "Nutzung", "Entsorgung"];
  if (item.sector === "Elektronik") return ["Rohstoffe", "Bauteile", "Montage", "Nutzung", "Rücknahme"];
  if (item.sector === "Ernährung" || item.sector === "Agrarhandel") return ["Anbau", "Verarbeitung", "Transport", "Konsum", "Boden & Abfall"];
  if (item.sector === "Digitale Infrastruktur" || item.sector === "Medien") return ["Infrastruktur", "Datenmodell", "Betrieb", "Nutzung", "Folgewirkung"];
  if (item.sector === "Wohnen") return ["Grundstück", "Bau/Sanierung", "Betrieb", "Nutzung", "Quartier"];
  if (item.sector === "Pflege") return ["Personal", "Planung", "Leistung", "Stabilisierung", "Folgekosten"];
  return ["Input", "Produktion", "Transport", "Nutzung", "Rückkopplung"];
}

function supplySteps(item) {
  const base = {
    Textilien: [["Baumwollanbau", "Türkei"], ["Spinnen/Weben", "Türkei"], ["Färben", "Portugal"], ["Konfektion", "Portugal"], ["Transport", "Portugal -> DE"]],
    Elektronik: [["Rohstoffe", "global"], ["Bauteile", "EU/Asien"], ["Montage", "EU"], ["Rücknahme", "DE"], ["Audit", "extern"]],
    Ernährung: [["Landwirtschaft", "regional/global"], ["Verarbeitung", "DE"], ["Kühlkette", "DE"], ["Handel", "DE"], ["Abfall", "kommunal"]],
    Agrarhandel: [["Kooperative", "Ursprungsland"], ["Aufbereitung", "regional"], ["Import", "EU"], ["Röstung", "DE"], ["Prämie", "geprüft"]],
    "Digitale Infrastruktur": [["Hardware", "Lieferanten"], ["Rechenzentrum", "EU"], ["Strom", "Herkunftsnachweis"], ["Datenresidenz", "vertraglich"], ["Audit", "ISO"]],
    Logistik: [["Depot", "DE"], ["Sortierung", "DE"], ["Zustellung", "regional"], ["Retouren", "DE"], ["Subunternehmer", "geprüft"]],
    Medien: [["Algorithmus", "intern"], ["Moderation", "hybrid"], ["Beschwerdeweg", "öffentlich"], ["Transparenzbericht", "jährlich"], ["Audit", "modelliert"]],
    Wohnen: [["Gebäude", "DE"], ["Energie", "lokal"], ["Mietvertrag", "geprüft"], ["Quartier", "kommunal"], ["Sanierung", "geplant"]],
    Pflege: [["Fachkräfte", "regional"], ["Dienstplanung", "geprüft"], ["Pflegeleistung", "vor Ort"], ["Dokumentation", "laufend"], ["Prävention", "gemessen"]]
  };
  return base[item.sector] || [["Input", "geprüft"], ["Leistung", "geprüft"], ["Nutzung", "gemessen"], ["Folgewirkung", "modelliert"], ["Audit", "plausibilisiert"]];
}

function standards(item) {
  const sources = item.indicators.flatMap((indicator) => indicator.source.split(";").map((entry) => entry.trim()));
  return Array.from(new Set(sources)).slice(0, 5);
}

function recommendations(item) {
  const weakDimensions = Object.entries(item.dimensions)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2)
    .map(([label]) => label);
  const biggestCost = Object.entries(item.costBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || "Folgekosten";
  const lowestIndicator = [...item.indicators].sort((a, b) => a.score - b.score)[0];
  return [
    `${biggestCost} als größte externe Kostenart gezielt senken.`,
    `${weakDimensions.join(" und ")} mit verbindlichen Schwellen verbessern.`,
    `${lowestIndicator.label}: Datenlücke oder Schwachstelle priorisieren.`,
    "Primärdaten erhöhen und externe Prüfung dokumentieren."
  ];
}

function qrCells(item) {
  const seed = Array.from(item.id).map((char) => char.charCodeAt(0));
  return Array.from({ length: 81 }, (_, index) => {
    const finder = (index < 18 && index % 9 < 2) || (index < 18 && index % 9 > 6) || (index > 62 && index % 9 < 2);
    const active = finder || ((seed[index % seed.length] + index * 7) % 5 < 2);
    return `<span class="${active ? "is-dark" : ""}"></span>`;
  }).join("");
}

function renderOverview(item) {
  return `
    <img src="${item.image}" alt="" loading="lazy" decoding="async">
    <div class="pass-overview-copy">
      <p class="hero-kicker">${item.type} · ${item.sector}</p>
      <h3>${item.name}</h3>
      <p>${item.summary}</p>
    </div>
    <ul class="pass-checks" aria-label="Produktpass Eigenschaften">
      <li>Nachvollziehbar</li>
      <li>Vergleichbar</li>
      <li>Wirkungsbasiert</li>
    </ul>
  `;
}

function renderIdentity(item) {
  return `
    <h3>Produktidentität</h3>
    <dl class="pass-facts">
      <div><dt>Pass-ID</dt><dd>${passId(item)}</dd></div>
      <div><dt>Name</dt><dd>${item.name}</dd></div>
      <div><dt>Kategorie</dt><dd>${item.type} · ${item.sector}</dd></div>
      <div><dt>Systemgrenze</dt><dd>Cradle to Gate + Nutzung</dd></div>
      <div><dt>Status</dt><dd>Demo, plausibilisiert</dd></div>
      <div><dt>Gültig bis</dt><dd>31.12.2026</dd></div>
    </dl>
  `;
}

function renderLifecycle(item) {
  return `
    <h3>Lebenszyklus-Übersicht</h3>
    <div class="lifecycle-map">
      ${lifecycleSteps(item).map((step, index) => `
        <div class="lifecycle-node">
          <span>${index + 1}</span>
          <strong>${step}</strong>
        </div>
      `).join("")}
    </div>
  `;
}

function renderScorecard(item) {
  return `
    <h3>Wirkungsscorecard</h3>
    <div class="pass-score-summary">
      <span class="score-pill ${scoreTone(item.score)}">${scoreLabel(item.score)} / 3</span>
      <strong>${scoreWord(item.score)}</strong>
    </div>
    <div class="impact-bars">${renderBars(Object.entries(item.dimensions), { score: true })}</div>
  `;
}

function renderTax(item) {
  const activeScore = taxBandForScore(item.score);
  return `
    <h3>Steuerklasse & Auswirkung</h3>
    <div class="tax-pyramid" aria-label="Steuerklassen nach Wirkung">
      ${TAX_BANDS.map((band, index) => {
        const width = 50 + (index * 8);
        return `
          <div class="tax-band tax-${band.tone} ${band.score === activeScore ? "active" : ""}" style="width:${width}%">
            <span>${band.score > 0 ? `+${band.score}` : band.score}</span>
            <strong>${band.label}</strong>
            <em>${band.rate}</em>
          </div>
        `;
      }).join("")}
    </div>
    <p class="formula-note">Aktive Steuerklasse: ${taxRateFromScore(item.score)}. Reverse Merit Order: positive Netto-Wirkung kann entlastet, negative Wirkung belastet werden.</p>
  `;
}

function renderSupply(item) {
  return `
    <h3>Lieferketten-Transparenz</h3>
    <ul class="pass-list">
      ${supplySteps(item).map(([step, location]) => `<li><span>${step}</span><strong>${location}</strong></li>`).join("")}
    </ul>
  `;
}

function renderStandards(item) {
  return `
    <h3>Zertifizierungen & Standards</h3>
    <ul class="pass-list standards-list">
      ${standards(item).map((standard) => `<li><span>${standard}</span><strong>geprüft</strong></li>`).join("")}
    </ul>
  `;
}

function renderRecommendations(item) {
  return `
    <h3>Empfehlungen & Verbesserungen</h3>
    <ul class="recommendation-list">
      ${recommendations(item).map((entry, index) => `<li><span>${index + 1}</span>${entry}</li>`).join("")}
    </ul>
  `;
}

function renderVerification(item) {
  return `
    <h3>Digitale Verifikation</h3>
    <div class="verification-grid">
      <div class="qr-grid" aria-hidden="true">${qrCells(item)}</div>
      <div>
        <strong>Scannen, prüfen, verstehen.</strong>
        <p>Mehr Informationen und aktuelle Daten finden sich im digitalen Produktpass.</p>
        <small>ID: ${passId(item)}</small>
      </div>
    </div>
  `;
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

  dashboardRoot.querySelector("[data-pass-overview]").innerHTML = renderOverview(item);
  dashboardRoot.querySelector("[data-pass-identity]").innerHTML = renderIdentity(item);
  dashboardRoot.querySelector("[data-pass-lifecycle]").innerHTML = renderLifecycle(item);
  dashboardRoot.querySelector("[data-pass-scorecard]").innerHTML = renderScorecard(item);
  dashboardRoot.querySelector("[data-pass-tax]").innerHTML = renderTax(item);
  dashboardRoot.querySelector("[data-pass-supply]").innerHTML = renderSupply(item);
  dashboardRoot.querySelector("[data-pass-standards]").innerHTML = renderStandards(item);
  dashboardRoot.querySelector("[data-pass-recommendations]").innerHTML = renderRecommendations(item);
  dashboardRoot.querySelector("[data-pass-verification]").innerHTML = renderVerification(item);

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
