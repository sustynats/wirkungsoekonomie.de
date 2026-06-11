const methodVersion = "uwp-beta-0.1";

const labels = {
  mensch: "Mensch",
  planet: "Planet",
  demokratie: "Demokratie",
  transformation: "Transformation",
  datenqualitaet: "Datenqualität"
};

const forbiddenInvestmentTerms = /\b(kaufen|verkaufen|unterbewertet|überbewertet|investment attraktiv|kursziel)\b/i;

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

function canShowOverallScore(profile) {
  if (!profile) return false;
  if (profile.red_lines && profile.red_lines.length > 0) return false;
  if ((profile.coverage || 0) < 0.6) return false;
  if (profile.data_quality_score === null || profile.data_quality_score === undefined) return false;
  return profile.data_quality_score >= 50 && profile.overall_score !== null && profile.overall_score !== undefined;
}

function applyReverseMeritOrder(profile) {
  if (!profile || !Array.isArray(profile.red_lines) || profile.red_lines.length === 0) {
    return { blocked: false, note: "Keine belegten roten Linien im aktuellen Snapshot. Das ist kein Freispruch, sondern nur der Stand der erfassten Daten." };
  }
  return {
    blocked: true,
    note: "Positive Werte in anderen Bereichen kompensieren rote Linien nicht automatisch. Eine Gesamtbewertung bleibt begrenzt, bis die Fälle fachlich geprüft sind."
  };
}

function buildInterpretation(company, profile) {
  const name = text(company.name, "das ausgewählte Unternehmen");
  if (!profile) {
    return [
      `Im vorhandenen Datenstand liegt für ${name} ein Metadatenprofil vor. Ein Wirkungsprofil ist noch nicht berechnet, weil noch keine versionierten Beobachtungen aus Berichten, Quellenankern und Datenqualitätsprüfungen hinterlegt sind.`,
      "Eine belastbare Aussage zu Mensch, Planet, Demokratie oder Transformation ist deshalb noch nicht möglich. Das Tool zeigt bewusst Datenstatus und Lücken statt erfundener Scores.",
      "Prüffrage: Welche Berichte, CSRD-/ESRS-Daten, GRI-Angaben, Taxonomie-Kennzahlen, Klimaziele, Kontroversen und Assurance-Informationen liegen öffentlich und lizenzrechtlich nutzbar vor?",
      "Diese Einordnung ist kein kausaler Nachweis, kein Finanzrating und keine Investmentempfehlung."
    ];
  }

  const redLine = applyReverseMeritOrder(profile);
  const intro = canShowOverallScore(profile)
    ? `Im verfügbaren Datenstand ist ein vorläufiger Gesamtwert berechenbar. Rechnerisch wird er durch die getrennten Status-, Trend-, Transformations- und Datenqualitätswerte getragen.`
    : "Im verfügbaren Datenstand wird kein Gesamtwert angezeigt, weil Datenabdeckung, Datenqualität oder rote Linien für eine belastbare Gesamtbewertung nicht ausreichen.";

  return [
    intro,
    redLine.note,
    "Auffällige Verbesserungen oder Verschlechterungen werden erst ausgewiesen, wenn mehrere belegte Berichtsjahre vorliegen. Das Profil unterscheidet dann zwischen besserer Transparenz und tatsächlicher Wirkung.",
    "Prüffrage: Verbessert sich die reale Wirkung oder steigt vor allem die Berichtstiefe?"
  ];
}

function renderEmptyChart(target) {
  target.innerHTML = `
    <svg class="uwp-chart" viewBox="0 0 720 300" role="img" aria-labelledby="uwp-chart-title uwp-chart-desc">
      <title id="uwp-chart-title">Zeitverlauf vorgesehen</title>
      <desc id="uwp-chart-desc">Der Zeitverlauf wird angezeigt, sobald versionierte Beobachtungen über mehrere Jahre vorliegen.</desc>
      <rect x="1" y="1" width="718" height="298" rx="8" fill="#fbfaf7" stroke="#d9d0c2"></rect>
      <line x1="70" y1="240" x2="660" y2="240" stroke="#d9d0c2"></line>
      <line x1="70" y1="50" x2="70" y2="240" stroke="#d9d0c2"></line>
      <line x1="70" y1="90" x2="660" y2="60" stroke="#5c6975" stroke-dasharray="7 7"></line>
      <text x="70" y="35" class="uwp-chart-label">Score 0-100</text>
      <text x="600" y="82" class="uwp-chart-label">Transformationspfad</text>
      <text x="90" y="145" class="uwp-chart-empty">Zeitverlauf für UWP-Status, Mensch, Planet, Demokratie, Transformation und Datenqualität erscheint nach Import geprüfter Beobachtungen.</text>
      <g class="uwp-chart-legend">
        <circle cx="80" cy="272" r="4"></circle><text x="92" y="276">UWP-Status</text>
        <circle cx="178" cy="272" r="4"></circle><text x="190" y="276">Mensch</text>
        <circle cx="260" cy="272" r="4"></circle><text x="272" y="276">Planet</text>
        <circle cx="336" cy="272" r="4"></circle><text x="348" y="276">Demokratie</text>
        <circle cx="442" cy="272" r="4"></circle><text x="454" y="276">Transformation</text>
        <circle cx="576" cy="272" r="4"></circle><text x="588" y="276">Datenqualität</text>
      </g>
    </svg>
  `;
}

function scoreCard(label, value, note) {
  const hasScore = typeof value === "number";
  return `
    <article class="card uwp-score-card ${hasScore ? "" : "uwp-score-card-empty"}">
      <p class="card-kicker">${escapeHtml(label)}</p>
      <h3 class="card-title">${hasScore ? Math.round(value) : "Nicht berechnet"}</h3>
      <p class="card-text">${escapeHtml(note)}</p>
    </article>
  `;
}

function companySearchText(company) {
  return normalize([
    company.name,
    company.legal_name,
    company.isin,
    company.lei,
    company.ticker,
    company.sector,
    company.industry,
    (company.index_memberships || []).join(" ")
  ].filter(Boolean).join(" "));
}

function renderCompanyButton(company) {
  return `
    <button class="uwp-result-button" type="button" data-company-id="${escapeHtml(company.company_id)}">
      <span>
        <strong>${escapeHtml(company.name)}</strong>
        <small>${escapeHtml(company.sector)} · ${escapeHtml((company.index_memberships || []).join(", ") || "Indexumfeld zu prüfen")}</small>
      </span>
      <span class="badge">${escapeHtml(company.data_status || company.status)}</span>
    </button>
  `;
}

function renderProfile(company, profile, universe) {
  const panel = document.querySelector("[data-uwp-profile]");
  const profileForScores = profile || {};
  const redLine = applyReverseMeritOrder(profile);
  const overallAllowed = canShowOverallScore(profile);
  const interpretation = buildInterpretation(company, profile).filter((line) => !forbiddenInvestmentTerms.test(line));

  panel.hidden = false;
  panel.innerHTML = `
    <section class="section uwp-profile-shell" aria-labelledby="uwp-profile-title">
      <div class="uwp-profile-header">
        <div>
          <p class="hero-kicker">Ausgewähltes Unternehmen</p>
          <h2 id="uwp-profile-title">${escapeHtml(company.name)}</h2>
          <p class="card-text">${escapeHtml(company.sector)} · ${escapeHtml(company.country)}</p>
        </div>
        <div class="uwp-meta-grid" aria-label="Unternehmensmetadaten">
          <span><strong>ISIN</strong>${escapeHtml(company.isin)}</span>
          <span><strong>LEI</strong>${escapeHtml(company.lei)}</span>
          <span><strong>Ticker</strong>${escapeHtml(company.ticker)}</span>
          <span><strong>Berichtsjahre</strong>noch nicht importiert</span>
          <span><strong>Datenstand</strong>Metadaten-Snapshot 10.06.2026</span>
          <span><strong>Methodik</strong>${methodVersion}</span>
          <span><strong>Datenabdeckung</strong>${profile ? Math.round((profile.coverage || 0) * 100) + " %" : "0 %"}</span>
          <span><strong>Hinweis</strong>Kein Finanzrating</span>
        </div>
      </div>

      <aside class="protection-notice" role="note">
        <p class="card-kicker">Gesamtwert</p>
        <h3>${overallAllowed ? "Vorläufiger Gesamtwert verfügbar" : "Kein Gesamtwert"}</h3>
        <p>${overallAllowed ? "Der Gesamtwert erfüllt die Mindestregeln der Beta-Methodik." : "Kein Gesamtwert: Datenabdeckung oder rote Linien reichen für eine belastbare Gesamtbewertung nicht aus."}</p>
      </aside>

      <div class="card-grid five uwp-score-grid">
        ${scoreCard(labels.mensch, profileForScores.mensch_score, "Arbeitsbedingungen, Menschenrechte, Sicherheit, Zugang und soziale Produktwirkung.")}
        ${scoreCard(labels.planet, profileForScores.planet_score, "Klima, Energie, Wasser, Kreislaufwirtschaft, Biodiversität und Transformationspfad.")}
        ${scoreCard(labels.demokratie, profileForScores.demokratie_score, "Steuern, Lobbying, Rechtskonformität, Datenschutz, Plattformmacht und Vertrauen.")}
        ${scoreCard(labels.transformation, profileForScores.transformation_score, "Auswertungsebene: Geschäftsmodell, CapEx, Lieferketten und reale Wirkung über Zeit.")}
        ${scoreCard(labels.datenqualitaet, profileForScores.data_quality_score, "Vollständigkeit, Quellenanker, Assurance, Vergleichbarkeit und Maschinenlesbarkeit.")}
      </div>

      <section class="card uwp-chart-card" aria-labelledby="uwp-timeline-title">
        <div class="inline-heading">
          <div>
            <p class="hero-kicker">Zeitverlauf</p>
            <h3 id="uwp-timeline-title">UWP-Profil im Verlauf</h3>
          </div>
          <p class="card-text">Zeitverlauf ist Kernfeature: Status, Dimensionen, Transformation und Datenqualität werden erst gezeichnet, wenn mehrere belegte Jahre vorhanden sind.</p>
        </div>
        <div data-uwp-chart></div>
      </section>

      <section class="card uwp-interpretation" aria-labelledby="uwp-interpretation-title">
        <p class="hero-kicker">Regelbasierte Interpretation</p>
        <h3 id="uwp-interpretation-title">Einordnung für ${escapeHtml(company.name)}</h3>
        ${interpretation.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
      </section>

      <div class="card-grid two">
        <article class="card">
          <p class="card-kicker">Größte Wirkungslücken</p>
          <h3 class="card-title">Noch nicht berechnet</h3>
          <p class="card-text">Niedrigste Indikatoren werden erst angezeigt, wenn Quelle, Jahr, Score, Datenqualität und Methodikversion belegt sind.</p>
        </article>
        <article class="card">
          <p class="card-kicker">Stärkere Ausgangslagen</p>
          <h3 class="card-title">Noch nicht berechnet</h3>
          <p class="card-text">Stärkste Indikatoren werden nicht aus Metadaten abgeleitet. Es werden keine Scores erfunden.</p>
        </article>
      </div>

      <section class="card" aria-labelledby="uwp-redlines-title">
        <p class="hero-kicker">Rote Linien / Nichtkompensation</p>
        <h3 id="uwp-redlines-title">${redLine.blocked ? "Rote Linie im Snapshot" : "Keine rote Linie im aktuellen Snapshot erfasst"}</h3>
        <p>${escapeHtml(redLine.note)}</p>
        <p class="card-text">Geprüft würden unter anderem Menschenrechtskontroversen, schwere Umweltverstöße, Korruptionsfälle, gravierende Datenschutz- oder Demokratie-Risiken sowie schwere Arbeitsschutz- oder Produktsicherheitsfälle.</p>
      </section>

      <section class="card" aria-labelledby="uwp-sources-title">
        <p class="hero-kicker">Quellenbereich</p>
        <h3 id="uwp-sources-title">Quellen und Datenstand</h3>
        <div class="table-wrap">
          <table class="uwp-source-table">
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
                <th>Assurance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Unternehmensmetadaten UWP-100 Beta</td>
                <td>2026</td>
                <td>Beta-Universum</td>
                <td>data/uwp/company-universe.uwp100.json</td>
                <td>10.06.2026</td>
                <td>keine Wirkungsindikatoren</td>
                <td>kuratierter Snapshot</td>
                <td>mittel, Validierung offen</td>
                <td>nicht zutreffend</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="card-text">${escapeHtml(universe.source_note)}</p>
      </section>
    </section>
  `;
  renderEmptyChart(panel.querySelector("[data-uwp-chart]"));
  panel.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function initUwpProfile() {
  const root = document.querySelector("[data-uwp-tool]");
  if (!root) return;
  const universeUrl = root.dataset.universeUrl || "../../data/uwp/company-universe.uwp100.json";
  const response = await fetch(universeUrl);
  const universe = await response.json();
  const companies = Array.isArray(universe.companies) ? universe.companies : [];
  const input = document.querySelector("[data-uwp-search]");
  const results = document.querySelector("[data-uwp-results]");
  const count = document.querySelector("[data-uwp-count]");
  const select = document.querySelector("[data-uwp-select]");
  const profiles = new Map();

  count.textContent = `${companies.length} Unternehmen im Beta-Universum`;
  select.innerHTML = `<option value="">Unternehmen aus UWP-100 auswählen ...</option>${companies.map((company) => `<option value="${escapeHtml(company.company_id)}">${escapeHtml(company.name)}</option>`).join("")}`;

  function renderResults(query = "") {
    const q = normalize(query);
    const filtered = companies
      .filter((company) => !q || companySearchText(company).includes(q))
      .slice(0, 12);
    results.innerHTML = filtered.length
      ? filtered.map(renderCompanyButton).join("")
      : `<p class="card-text">Kein Treffer im UWP-100-Beta-Universum. Die MVP-Suche ist bewusst auf die 100 vorselektierten Unternehmen begrenzt.</p>`;
  }

  function selectCompany(companyId) {
    const company = companies.find((entry) => entry.company_id === companyId);
    if (!company) return;
    input.value = company.name;
    select.value = company.company_id;
    renderResults(company.name);
    renderProfile(company, profiles.get(company.company_id), universe);
  }

  input.addEventListener("input", () => renderResults(input.value));
  results.addEventListener("click", (event) => {
    const button = event.target.closest("[data-company-id]");
    if (button) selectCompany(button.dataset.companyId);
  });
  select.addEventListener("change", () => selectCompany(select.value));
  document.querySelector("[data-uwp-first]")?.addEventListener("click", () => {
    if (companies[0]) selectCompany(companies[0].company_id);
  });
  renderResults();
}

initUwpProfile().catch((error) => {
  const results = document.querySelector("[data-uwp-results]");
  if (results) {
    results.innerHTML = `<p class="card-text">Die UWP-100-Metadaten konnten nicht geladen werden. Bitte später erneut prüfen.</p>`;
  }
  console.error(error);
});
