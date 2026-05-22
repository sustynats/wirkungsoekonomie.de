(function () {
  const root = document.querySelector("[data-scanner-mvp-root]");
  if (!root) return;

  const modeSelect = root.querySelector("[data-scanner-mode]");
  const input = root.querySelector("[data-scanner-input]");
  const runButton = root.querySelector("[data-scanner-run]");
  const resultPanel = root.querySelector("[data-scanner-result]");
  const demoButtons = Array.from(root.querySelectorAll("[data-scanner-demo]"));

  const modes = {
    text: {
      label: "Text / Artikel analysieren",
      demo: "politische-sprache",
      scope: "Text, Artikel oder kurzer Auszug",
    },
    website: {
      label: "Website analysieren",
      demo: "politische-sprache",
      scope: "Website-Struktur oder kopierter Seitenauszug",
    },
    election: {
      label: "Wahlprogramm analysieren",
      demo: "politische-sprache",
      scope: "Programmabschnitt oder Maßnahme",
    },
    statement: {
      label: "Politische Aussage analysieren",
      demo: "politische-sprache",
      scope: "Begriff, Slogan oder Aussage",
    },
    product: {
      label: "Produkt analysieren",
      demo: "produkt-apfel",
      scope: "Produktname, Produktdaten oder Vergleich",
    },
    company: {
      label: "Unternehmen analysieren",
      demo: "unternehmen",
      scope: "Unternehmensname, Website oder Berichtsauszug",
    },
    decision: {
      label: "Entscheidung / Maßnahme einordnen",
      demo: "entscheidung",
      scope: "Gesetz, Investition, Beschluss oder Maßnahme",
    },
    photo: {
      label: "Foto / Screenshot vorbereiten",
      demo: "produkt-apfel",
      scope: "Beschreibung dessen, was auf dem Bild erkennbar wäre",
    },
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
    },
  };

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

  function renderResult(demoKey, sourceText) {
    const mode = modes[modeSelect.value] || modes.text;
    const demo = demos[demoKey] || demos[mode.demo] || demos["politische-sprache"];
    resultPanel.innerHTML = `
      <article class="scanner-result-card">
        <div class="scanner-result-head">
          <p class="card-kicker">MVP-Ersteinschätzung · ${escapeHtml(mode.label)}</p>
          <h3>${escapeHtml(demo.title)}</h3>
          <span>Datenstatus: Demo / Annahme</span>
        </div>
        <div class="scanner-result-sections">
          <article><h4>Was wurde erkannt?</h4><p>${escapeHtml(demo.recognized)}</p></article>
          <article><h4>Zentrale Aussage / Produkt / Organisation / Entscheidung</h4><p>${escapeHtml(sourceText || demo.central)}</p></article>
          <article><h4>Datenlage</h4><p>${escapeHtml(demo.data)}</p></article>
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
      </article>`;
  }

  function inferDemo() {
    const text = String(input.value || "").toLowerCase();
    if (modeSelect.value === "company" || text.includes("unternehmen")) return "unternehmen";
    if (modeSelect.value === "product" || text.includes("apfel") || text.includes("produkt")) return "produkt-apfel";
    if (modeSelect.value === "decision" || text.includes("maßnahme") || text.includes("gesetz")) return "entscheidung";
    return modes[modeSelect.value]?.demo || "politische-sprache";
  }

  runButton?.addEventListener("click", () => renderResult(inferDemo(), input.value.trim()));
  modeSelect?.addEventListener("change", () => {
    input.placeholder = `Kurzen ${modes[modeSelect.value]?.scope || "Auszug"} einfügen. Im MVP wird eine Demo-Ersteinschätzung erzeugt.`;
  });
  demoButtons.forEach((button) => {
    button.addEventListener("click", () => renderResult(button.dataset.scannerDemo, ""));
  });

  renderResult("politische-sprache", "");
})();
