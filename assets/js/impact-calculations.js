(function initImpactCalculations(root) {
  function number(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function clampScore(value) {
    return Math.max(-3, Math.min(3, number(value)));
  }

  function calculateFinalScore(scores, redLineActive = false) {
    const values = Object.values(scores || {}).map(clampScore);
    const weakest = values.length ? Math.min(...values) : 0;
    if (redLineActive) {
      return {
        finalScore: -3,
        weakestField: "rote Linie",
        status: "blocked",
        explanation: "Eine rote Linie blockiert eine positive Gesamtbewertung."
      };
    }
    return {
      finalScore: clampScore(weakest),
      weakestField: Object.entries(scores || {}).sort((a, b) => clampScore(a[1]) - clampScore(b[1]))[0]?.[0] || "nicht gesetzt",
      status: weakest >= 1 ? "positive" : weakest >= 0 ? "uncertain" : "critical",
      explanation: "Der FinalScore folgt der Reverse Merit Order: Das schwächste kritische Feld begrenzt die Bewertung."
    };
  }

  function calculateNWI({ positive = 0, negative = 0, dataQuality = 1, uncertainty = 0, redLineActive = false } = {}) {
    const raw = number(positive) - Math.abs(number(negative));
    const qualityFactor = Math.max(0, Math.min(1, number(dataQuality, 1)));
    const uncertaintyPenalty = Math.max(0, number(uncertainty)) * 0.2;
    const value = raw * qualityFactor - uncertaintyPenalty;
    if (redLineActive) {
      return {
        nwi: Math.min(0, value),
        status: "blocked",
        explanation: "Rote Linien verhindern, dass ein positiver NWI ausgewiesen wird."
      };
    }
    return {
      nwi: value,
      status: value > 0 ? "tragfaehig" : value === 0 ? "unklar" : "kritisch",
      explanation: "Der NWI trennt positive und negative Wirkung und macht Datenqualität sichtbar."
    };
  }

  function calculateTSROI({
    nwi = 0,
    redLineActive = false,
    transformation = 0,
    systemLeverage = 1,
    timeFactor = 1,
    resilienceFactor = 1,
    dataQuality = 1,
    investment = 1
  } = {}) {
    if (redLineActive || number(nwi) < 0) {
      return {
        tsroi: 0,
        status: "blocked",
        explanation: "T-SROI wird nicht positiv ausgewiesen, wenn NWI negativ ist oder eine rote Linie aktiv ist."
      };
    }
    const safeInvestment = Math.max(1, Math.abs(number(investment, 1)));
    const tsroi =
      (number(transformation) *
        number(systemLeverage, 1) *
        number(timeFactor, 1) *
        number(resilienceFactor, 1) *
        Math.max(0, Math.min(1, number(dataQuality, 1)))) /
      safeInvestment;
    return {
      tsroi,
      status: tsroi > 0 ? "model" : "uncertain",
      explanation: "T-SROI ist ein modellhafter Transformationswert, keine operative Netto-Wirkungskennzahl."
    };
  }

  function getDataQualityClass({ primaryData = false, audited = false, current = false, estimated = false } = {}) {
    if (primaryData && audited && current) return "A";
    if ((primaryData || audited) && current) return "B";
    if (!estimated && (primaryData || current)) return "C";
    return "D";
  }

  function getDemoWarnings({ redLineActive = false, dataQuality = 1, weakestField = "", personRisk = false } = {}) {
    const warnings = [
      "Modellhafte Demo, keine amtliche Bewertung und keine Beratung.",
      "Keine Personenbewertung und keine automatische Entscheidung."
    ];
    if (redLineActive) warnings.unshift("Rote Linie aktiv: positive Gesamtbewertung blockiert.");
    if (number(dataQuality, 1) < 0.5) warnings.unshift("Datenqualität niedrig: Ergebnis nur als Prüfhinweis lesen.");
    if (weakestField) warnings.push(`Schwächstes Feld: ${weakestField}.`);
    if (personRisk) warnings.unshift("Bewertet werden Strukturen und Wirkungslogiken, nicht Personen.");
    return warnings;
  }

  const api = {
    clampScore,
    calculateFinalScore,
    calculateNWI,
    calculateTSROI,
    getDataQualityClass,
    getDemoWarnings
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.WoekImpactCalculations = api;
})(typeof window !== "undefined" ? window : globalThis);
