(function () {
  const root = document.querySelector("[data-scanner-mvp-root]");
  if (!root) return;

  const modeSelect = root.querySelector("[data-scanner-mode]");
  const input = root.querySelector("[data-scanner-input]");
  const runButton = root.querySelector("[data-scanner-run]");
  const resultPanel = root.querySelector("[data-scanner-result]");
  const demoButtons = Array.from(root.querySelectorAll("[data-scanner-demo]"));
  const modeCards = Array.from(root.querySelectorAll("[data-mode-card]"));

  const modes = {
    text: {
      label: "Text / Artikel analysieren",
      demo: "politische-sprache",
      scope: "Text, Artikel oder kurzer Auszug",
      status: "URL/Text vorbereitet",
    },
    website: {
      label: "Website analysieren",
      demo: "politische-sprache",
      scope: "Website-Struktur oder kopierter Seitenauszug",
      status: "URL-Abruf vorbereitet",
    },
    election: {
      label: "Wahlprogramm analysieren",
      demo: "politische-sprache",
      scope: "Programmabschnitt oder Maßnahme",
      status: "Datenquelle vorbereitet",
    },
    statement: {
      label: "Politische Aussage analysieren",
      demo: "politische-sprache",
      scope: "Begriff, Slogan oder Aussage",
      status: "Wirkungsökonomische Ersteinschätzung",
    },
    product: {
      label: "Produkt analysieren",
      demo: "produkt-apfel",
      scope: "Produktname, Produktdaten oder Vergleich",
      status: "Datenquelle vorbereitet",
    },
    company: {
      label: "Unternehmen analysieren",
      demo: "unternehmen",
      scope: "Unternehmensname, Website oder Berichtsauszug",
      status: "Datenquelle vorbereitet",
    },
    decision: {
      label: "Entscheidung / Maßnahme einordnen",
      demo: "entscheidung",
      scope: "Gesetz, Investition, Beschluss oder Maßnahme",
      status: "Methodische Einordnung",
    },
    photo: {
      label: "Foto / Screenshot vorbereiten",
      demo: "produkt-apfel",
      scope: "Beschreibung dessen, was auf dem Bild erkennbar wäre",
      status: "Konzept · keine Upload-Speicherung",
    },
  };

  const qualityLevels = {
    A: "geprüfte produkt- oder organisationsspezifische Primärdaten",
    B: "veröffentlichte Berichts- oder Auditdaten",
    C: "offene Datenbank / offizieller Standard / öffentliches Register",
    D: "Branchenbenchmark / Kategorieannahme",
    E: "unvollständige Annahme / Plausibilisierung",
    F: "keine belastbare Datenbasis",
  };

  const demos = {
    "politische-sprache": {
      title: "Politische Sprache / Resonanzrisiko",
      recognized: "Ein politischer Begriff oder eine Aussage erzeugt Angst, Kontrollverlust oder Schuldzuweisung.",
      central: "Sprache als Auslöser mit Wirkungspotenzial, nicht als automatisch nachgewiesener Einzelschaden.",
      data: "Textauszug, erkennbare Frames und Kontext reichen für eine erste Wirkungsfrage; Reichweite, Publikum und empirische Wirkung fehlen.",
      potentials: ["Angstverdichtung", "Schuldzuweisung", "Polarisierung", "sinkendes Vertrauen"],
      spaces: ["Mensch", "Demokratie"],
      sdg: ["SDG 16", "SDG+ Medienqualität", "SDG+ Diskursfähigkeit"],
      path: ["Begriff / Aussage", "Frame", "Resonanzraum", "Wirkungspotenzial", "Wahrnehmungsverschiebung", "mögliches Demokratierisiko", "SDG+-Bezug"],
      conflicts: "Zuspitzung kann Aufmerksamkeit schaffen, aber Orientierung und Vertrauen schwächen.",
      gaps: "Reichweite, Zielgruppe, Verbreitungskanal, Korrekturmechanismen und empirische Wirkung.",
      counter: "Welche Systemfrage wird durch den Frame sichtbar oder verdeckt?",
      sources: "Begriffsleitfaden, SDG+ Medien & Demokratie, Wirkung politischer Sprache.",
      limits: "Diese Analyse beschreibt Wirkungspotenziale und Resonanzrisiken, keinen automatisch nachgewiesenen Einzelschaden.",
      quality: "E",
      sourcePanel: [
        {
          type: "Eingabequelle",
          title: "Textauszug oder URL",
          provided: "sichtbare Sprache, mögliche Frames, Kontext-Hinweise",
          status: "Eingabe, nicht dauerhaft gespeichert",
          limitation: "keine vollständige Faktenprüfung, keine Reichweiten- oder Wirkungsdaten",
        },
        {
          type: "interne WÖk-Basis",
          title: "SDG+ Medien & Demokratie",
          provided: "Resonanzraum, Wirkungspotenzial, Demokratiebezug",
          status: "published / WÖk-Systematik",
          limitation: "ordnet Wirkungspotenziale ein, beweist keinen Einzelschaden",
        },
      ],
    },
    wahlprogramm: {
      title: "Wahlprogramm / Maßnahme wirkungsökonomisch lesen",
      recognized: "Ein politisches Versprechen oder Programmabschnitt mit behauptetem Ziel, Maßnahme, Zielkonflikten und Datenbedarf.",
      central: "Wahlprogramme werden nach Wirkungspotenzialen, Datenlage und Systemfragen gelesen, nicht nach Parteipräferenz.",
      data: "Offizieller Textauszug oder PDF-Kapitel kann Datenqualität B erreichen. Ohne offiziellen Kontext bleibt es eine unvollständige Eingabe.",
      potentials: ["soziale Entlastung oder Folgekosten", "Klima- und Ressourcenwirkung", "Vertrauen oder Polarisierung", "Prävention oder Reparaturpolitik"],
      spaces: ["Mensch", "Planet", "Demokratie"],
      sdg: ["Agenda 2030", "SDG 8", "SDG 10", "SDG 11", "SDG 13", "SDG 16", "SDG+"],
      path: ["behauptetes Ziel", "vorgeschlagene Maßnahme", "impliziter Maßstab", "Wirkungsfrage", "Zielkonflikte", "Folgekosten", "Rückkopplung", "WÖk-Gegenfrage"],
      conflicts: "Eine Maßnahme kann kurzfristig Zustimmung erzeugen und langfristig Folgekosten, Verdrängung oder Vertrauensverlust auslösen.",
      gaps: "Baseline, Finanzierung, betroffene Gruppen, Alternativen, Folgekosten, Umsetzungsdaten, Evaluationslogik.",
      counter: "Welche Folgekosten, Zielkonflikte und Rückkopplungen werden in dieser Maßnahme sichtbar oder ausgeblendet?",
      sources: "Offizielle Parteiseite oder Wahlprogramm-PDF, Politik mit Wirkung, Wirkungshaushalt, SDG+ Demokratie.",
      limits: "Diese Analyse ist keine Wahlempfehlung. Sie zeigt Wirkungspotenziale, Zielkonflikte, Datenlage und offene Systemfragen.",
      quality: "B",
      sourcePanel: [
        {
          type: "Eingabequelle",
          title: "offizielle Parteiseite, Wahlprogramm-PDF oder Textabschnitt",
          provided: "behauptetes Ziel, vorgeschlagene Maßnahme, Wortlaut und Kontext",
          status: "Datenquelle vorbereitet",
          limitation: "keine Wahlempfehlung, keine parteipolitische Gesinnungsbewertung",
        },
        {
          type: "interne WÖk-Basis",
          title: "Politik mit Wirkung und Wirkungshaushalt",
          provided: "alte Logik, Wirkungsräume, Zielkonflikte, Folgekosten, Rückkopplungslogik",
          status: "published / Content-Master",
          limitation: "keine Rechts-, Leistungs- oder Politikberatung",
        },
      ],
    },
    "produkt-apfel": {
      title: "Produktwirkung / Regionaler Bio-Apfel vs. importierter Apfel",
      recognized: "Produktvergleich Lebensmittel, frisches Obst, Anbau- und Transportdaten relevant.",
      central: "Regional und bio kann positiv wirken, ist aber nicht automatisch eine WÖk-Bewertung.",
      data: "Produktkategorie und Vergleichshypothese liegen vor; konkrete Herkunft, Anbau, Lagerung, Wasserstress und Arbeitsdaten fehlen.",
      potentials: ["Boden- und Biodiversitätswirkung", "Transportemissionen", "Wasserwirkung", "Arbeitsbedingungen", "Preisrückkopplung"],
      spaces: ["Mensch", "Planet"],
      sdg: ["SDG 2", "SDG 6", "SDG 8", "SDG 12", "SDG 13", "SDG 15"],
      path: ["Produkt", "Datenlage", "relevante SDGs", "WÖk-ID-Hypothese", "Scorecard-Hypothese", "Datenlücken", "mögliche Rückkopplung"],
      conflicts: "Regionalität, Saison, Lagerung, Wasserstress und Arbeitsbedingungen können unterschiedlich wirken.",
      gaps: "Geprüfte Produkt-, Lieferketten-, Betriebs- und Unternehmensdaten.",
      counter: "Welche Wirkung bleibt im heutigen Preis unsichtbar?",
      sources: "Produktwirkung, WÖk-ID, Scorecard, Methodik und Datenstandards.",
      limits: "Keine finale Steuerklasse. Für eine echte Bewertung braucht es geprüfte Produkt-, Lieferketten- und Unternehmensdaten.",
      quality: "D",
      sourcePanel: [
        {
          type: "externe Datenquelle",
          title: "Open Food Facts / GS1 / Produktseite",
          provided: "mögliche Produktidentifikation, Kategorie, Zutaten, Labels oder Barcode",
          status: "Datenquelle vorbereitet",
          limitation: "liefert keine geprüfte vollständige Lieferkettenwirkung",
        },
        {
          type: "interne WÖk-Basis",
          title: "WÖk-ID, Scorecard, Produktwirkung",
          provided: "Struktur für Wirkungspfad, Datenlücken und Scorecard-Hypothese",
          status: "Demo-Ersteinschätzung",
          limitation: "keine finale Steuerklasse ohne geprüfte Daten",
        },
      ],
    },
    unternehmen: {
      title: "Unternehmen als Wirkungssystem",
      recognized: "Organisation mit Wirkungen durch Produkte, Lieferketten, Kapital, Führung, Kultur, Kommunikation, Daten und Innovation.",
      central: "Das Unternehmen wird als Wirkungssystem gelesen, nicht als ESG-Bericht.",
      data: "Öffentliche Website, Berichte oder Branchenhinweise können Startpunkte sein; interne Führungs-, Kultur-, CAPEX-/OPEX- und Lieferkettendaten fehlen häufig.",
      potentials: ["resiliente Wertschöpfung", "Arbeits- und Kulturwirkung", "Lieferkettenrisiko", "Kapitalwirkung", "Innovationsrichtung"],
      spaces: ["Mensch", "Planet", "Demokratie"],
      sdg: ["SDG 8", "SDG 9", "SDG 12", "SDG 13", "SDG 16", "SDG+"],
      path: ["Unternehmen", "Produkte", "Lieferketten", "Kapital", "Führung", "Kultur", "Kommunikation", "Wirkungsprofil"],
      conflicts: "Kurzfristige Effizienz kann Resilienz, Kultur, Lieferkettenstabilität oder Wirkungslast verschlechtern.",
      gaps: "Lieferantenstruktur, Produktportfolio, Führungssystem, Vergütung, Risiko- und Kulturindikatoren.",
      counter: "Welche Entscheidung würde sich ändern, wenn Wirkung in Führung und Kapital zurückfließt?",
      sources: "Für Unternehmen, Wirkungskapital, T-SROI, Wirkungsmanagement.",
      limits: "Keine finale Unternehmensbewertung. Keine Anlageberatung. Keine ESG-Rating-Ersetzung.",
      quality: "B",
      sourcePanel: [
        {
          type: "externe Quelle",
          title: "Unternehmenswebsite, Geschäftsbericht, Nachhaltigkeitsbericht, CSRD/ESRS/GRI",
          provided: "öffentliche Datenlage, Geschäftsmodell, Berichtsindikatoren und mögliche NACE-Hinweise",
          status: "Datenquelle vorbereitet",
          limitation: "Selbstauskunft und Reporting ersetzen keine WÖk-Bewertung",
        },
        {
          type: "interne WÖk-Basis",
          title: "Unternehmen als Wirkungssystem",
          provided: "Führung, Kultur, Produkte, Lieferketten, Kapital, Kommunikation, Daten, Innovation",
          status: "published / Content-Master",
          limitation: "keine Anlageberatung und keine ESG-Rating-Ersetzung",
        },
      ],
    },
    entscheidung: {
      title: "Entscheidung / Maßnahme",
      recognized: "Maßnahme mit Ziel, Wirkungspotenzial, Nebenwirkungen, Zielkonflikten und Rückkopplungsbedarf.",
      central: "Eine Maßnahme ist nicht automatisch Wirkung. Entscheidend ist, welche Zustände sich verändern.",
      data: "Zielbeschreibung und betroffene Gruppen reichen für eine erste Logik; Wirkungsdaten, Kosten, Alternativen und Nebenwirkungen fehlen.",
      potentials: ["Prävention oder Reparatur", "Verteilungswirkung", "Folgekosten", "Systemresilienz"],
      spaces: ["Mensch", "Planet", "Demokratie"],
      sdg: ["Agenda 2030", "SDG+", "betroffene Fach-SDGs"],
      path: ["Auslöser", "Ziel", "Maßnahme", "Wirkungspotenzial", "Zielkonflikte", "Datenbedarf", "Rückkopplung"],
      conflicts: "Eine kurzfristige Entlastung kann langfristige Folgekosten oder Fehlanreize erzeugen.",
      gaps: "Baseline, betroffene Wirkungsräume, Alternativen, Kosten, Folgekosten, Evaluationsdaten.",
      counter: "Welche Fehlsteuerung erzeugt das Problem, das die Maßnahme reparieren soll?",
      sources: "Politik mit Wirkung, Wirkungshaushalt, Wirkungsrückkopplung.",
      limits: "Keine Rechts-, Steuer-, Leistungs- oder Politikberatung. Keine Wahlempfehlung.",
      quality: "E",
      sourcePanel: [
        {
          type: "Eingabequelle",
          title: "Maßnahmenbeschreibung, Gesetzesauszug oder Wahlprogrammabschnitt",
          provided: "behauptetes Ziel, Maßnahme, betroffene Wirkungsräume",
          status: "Eingabe",
          limitation: "ohne Baseline, Kosten, Alternativen und Evaluationsdaten nur Ersteinschätzung",
        },
        {
          type: "interne WÖk-Basis",
          title: "Wirkungshaushalt und Wirkungsrückkopplung",
          provided: "Prävention, Folgekosten, Zielkonflikte und Rückkopplungslogik",
          status: "published / WÖk-Systematik",
          limitation: "keine Wahlempfehlung, keine Politikberatung",
        },
      ],
    },
  };

  function modeFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const rawMode = String(params.get("mode") || "").trim().toLowerCase();
    const aliases = {
      "politische-aussage": "statement",
      politik: "statement",
      statement: "statement",
      aussage: "statement",
      produkt: "product",
      product: "product",
      unternehmen: "company",
      company: "company",
      firma: "company",
      wahlprogramm: "election",
      election: "election",
      website: "website",
      text: "text",
      entscheidung: "decision",
      massnahme: "decision",
      maßnahme: "decision",
      foto: "photo",
      screenshot: "photo"
    };
    return aliases[rawMode] || "";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function list(items) {
    return `<ul>${(items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }

  function path(items) {
    return `<ol class="scanner-path">${(items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>`;
  }

  function inferInputSource(value) {
    const trimmed = String(value || "").trim();
    if (/^https?:\/\//i.test(trimmed)) {
      return "URL-Eingabe erkannt. Dabei wird kein Paywall-Bypass und kein vollständiger Fremdtext gespeichert; bei nicht abrufbarer URL bitte kurzen Auszug einfügen.";
    }
    if (trimmed.length > 0) {
      return "Textauszug erkannt. Es erfolgt nur eine lokale Demo-Einordnung; keine dauerhafte Speicherung.";
    }
    return "Demo ohne Nutzereingabe.";
  }

  function renderQuality(level) {
    const label = qualityLevels[level] || qualityLevels.F;
    return `<article class="scanner-quality-card"><h4>Datenqualität</h4><p><strong>${escapeHtml(level || "F")}</strong> - ${escapeHtml(label)}</p><p>Für belastbare WÖk-Bewertungen braucht es geprüfte Quellen, Datenstand, Limitierungen und nachvollziehbare Methodik.</p></article>`;
  }

  function renderSourcePanel(demo, inputSource) {
    const sources = demo.sourcePanel || [];
    return `
      <details class="source-panel scanner-source-panel" open>
        <summary>Grundlage dieser Analyse</summary>
        <div>
          <article>
            <strong>Eingabequelle</strong>
            <p>${escapeHtml(inputSource)}</p>
            <p><em>Was diese Quelle nicht liefert:</em> keine geprüfte Gesamtwirkung, keine finale Bewertung, keine amtliche Einordnung.</p>
          </article>
          ${sources.map((source) => `
            <article>
              <strong>${escapeHtml(source.type)}: ${escapeHtml(source.title)}</strong>
              <p><em>Was diese Quelle liefert:</em> ${escapeHtml(source.provided)}</p>
              <p><em>Datenbasis:</em> ${escapeHtml(source.status)}</p>
              <p><em>Limitierung:</em> ${escapeHtml(source.limitation)}</p>
            </article>
          `).join("")}
        </div>
      </details>`;
  }

  function renderResult(demoKey, sourceText) {
    const mode = modes[modeSelect.value] || modes.text;
    const demo = demos[demoKey] || demos[mode.demo] || demos["politische-sprache"];
    resultPanel.innerHTML = `
      <article class="scanner-result-card">
        <div class="scanner-result-head">
          <p class="card-kicker">Wirkungsökonomische Ersteinschätzung · ${escapeHtml(mode.label)}</p>
          <h3>${escapeHtml(demo.title)}</h3>
          <span>Einordnung: ${escapeHtml(mode.status)} · Datenqualität ${escapeHtml(demo.quality || "F")}</span>
        </div>
        <div class="scanner-result-sections">
          <article><h4>Was wurde erkannt?</h4><p>${escapeHtml(demo.recognized)}</p></article>
          <article><h4>Zentrale Aussage / Produkt / Organisation / Entscheidung</h4><p>${escapeHtml(sourceText || demo.central)}</p></article>
          <article><h4>Datenlage</h4><p>${escapeHtml(demo.data)}</p></article>
          ${renderQuality(demo.quality)}
          <article><h4>Wirkungspotenziale</h4>${list(demo.potentials)}</article>
          <article><h4>Wirkungsräume: Mensch, Planet, Demokratie</h4>${list(demo.spaces)}</article>
          <article><h4>SDG-/SDG+-Bezug</h4>${list(demo.sdg)}</article>
          <article><h4>Wirkungspfad</h4>${path(demo.path)}</article>
          <article><h4>Zielkonflikte</h4><p>${escapeHtml(demo.conflicts)}</p></article>
          <article><h4>Datenlücken</h4><p>${escapeHtml(demo.gaps)}</p></article>
          <article><h4>WÖk-Gegenfrage</h4><p>${escapeHtml(demo.counter)}</p></article>
          <article><h4>Quellen</h4><p>${escapeHtml(demo.sources)}</p></article>
          <article><h4>Grenzen der Analyse</h4><p>${escapeHtml(demo.limits)}</p></article>
        </div>
        ${renderSourcePanel(demo, inferInputSource(sourceText))}
        <p class="scanner-legal-note">Diese Analyse ist eine wirkungsökonomische Ersteinschätzung auf Basis verfügbarer Daten. Sie ersetzt keine amtliche Bewertung, keine Rechts-, Steuer-, Anlage- oder Politikberatung.</p>
      </article>`;
  }

  function syncModeCards() {
    modeCards.forEach((card) => {
      const active = card.dataset.modeCard === modeSelect.value;
      card.classList.toggle("active", active);
      card.setAttribute("aria-pressed", String(active));
    });
  }

  function updatePlaceholder() {
    input.placeholder = `Kurzen ${modes[modeSelect.value]?.scope || "Auszug"} einfügen. Daraus wird eine Demo-Ersteinschätzung erzeugt.`;
  }

  function inferDemo() {
    const text = String(input.value || "").toLowerCase();
    if (modeSelect.value === "company" || text.includes("unternehmen")) return "unternehmen";
    if (modeSelect.value === "election" || text.includes("wahlprogramm")) return "wahlprogramm";
    if (modeSelect.value === "product" || text.includes("apfel") || text.includes("produkt")) return "produkt-apfel";
    if (modeSelect.value === "decision" || text.includes("maßnahme") || text.includes("gesetz")) return "entscheidung";
    return modes[modeSelect.value]?.demo || "politische-sprache";
  }

  const initialMode = modeFromUrl();
  if (initialMode && modeSelect && modes[initialMode]) {
    modeSelect.value = initialMode;
  }

  runButton?.addEventListener("click", () => renderResult(inferDemo(), input.value.trim()));
  modeSelect?.addEventListener("change", () => {
    updatePlaceholder();
    syncModeCards();
  });
  modeCards.forEach((card) => {
    card.setAttribute("aria-pressed", String(card.classList.contains("active")));
    card.addEventListener("click", () => {
      if (card.dataset.modeCard && modeSelect) {
        modeSelect.value = card.dataset.modeCard;
        updatePlaceholder();
        syncModeCards();
        renderResult(inferDemo(), input.value.trim());
      }
    });
  });
  demoButtons.forEach((button) => {
    button.addEventListener("click", () => renderResult(button.dataset.scannerDemo, ""));
  });

  syncModeCards();
  updatePlaceholder();
  renderResult("politische-sprache", "");
})();
