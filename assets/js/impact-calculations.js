(function initImpactCalculations(root) {
  "use strict";

  const MIN_DATA_QUALITY = 0.6;
  const MAX_HORIZON_YEARS = 100;

  function number(value, fallback = 0) {
    if (value === null || value === undefined || (typeof value === "string" && value.trim() === "")) return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function fraction(value, fallback = 0) {
    return Math.max(0, Math.min(1, number(value, fallback)));
  }

  function clampScore(value) {
    return Math.max(-3, Math.min(3, Math.round(number(value))));
  }

  function discountRate(value, fallback = 0.05) {
    const parsed = number(value, fallback);
    return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : fallback;
  }

  function presentValue(annualAmount, years, rate = 0.05) {
    const horizon = Math.max(0, Math.floor(number(years)));
    const safeRate = discountRate(rate);
    let total = 0;
    for (let year = 1; year <= horizon; year += 1) {
      total += number(annualAmount) / ((1 + safeRate) ** year);
    }
    return total;
  }

  function calculateFinalScore(scores, redLineActive = false) {
    const entries = Object.entries(scores || {});
    const values = entries.map(([, value]) => clampScore(value));
    const weakestIndex = values.length ? values.indexOf(Math.min(...values)) : -1;
    const weakestField = weakestIndex >= 0 ? entries[weakestIndex][0] : "nicht gesetzt";
    if (redLineActive) {
      return {
        finalScore: -3,
        weakestField: "rote Linie",
        status: "blocked",
        explanation: "Eine rote Linie blockiert die positive Gesamtbehauptung. Gute Werte in anderen Feldern heben sie nicht auf.",
      };
    }
    const finalScore = values.length ? Math.min(...values) : 0;
    return {
      finalScore,
      weakestField,
      status: finalScore > 0 ? "positive" : finalScore === 0 ? "uncertain" : "critical",
      explanation: "Der FinalScore folgt der Reverse Merit Order: Das schwächste Kernfeld begrenzt die Gesamtbewertung.",
    };
  }

  function calculateNWI({ positive = 0, negative = 0, redLineActive = false, gatePassed = false } = {}) {
    const raw = number(positive) - Math.abs(number(negative));
    if (redLineActive || gatePassed !== true) {
      return {
        raw,
        nwi: null,
        status: "blocked",
        explanation: "Der Rohwert bleibt für die Prüfung sichtbar, darf bei geschlossenem Schutz-Gate aber nicht als positive Netto-Wirkung ausgewiesen werden.",
      };
    }
    return {
      raw,
      nwi: raw,
      status: raw > 0 ? "tragfaehig" : raw === 0 ? "unklar" : "kritisch",
      explanation: "Der NWI ist eine dimensionsgleiche Netto-Differenz. Datenqualität wird ausgewiesen, aber weder Schäden noch Punkte werden damit multipliziert.",
    };
  }

  function isExplicitFiniteNumber(value) {
    return value !== null
      && value !== undefined
      && !(typeof value === "string" && value.trim() === "")
      && Number.isFinite(Number(value));
  }

  function isUnitInterval(value) {
    return isExplicitFiniteNumber(value) && Number(value) >= 0 && Number(value) <= 1;
  }

  function isNonNegativeAmount(value) {
    return isExplicitFiniteNumber(value) && Number(value) >= 0;
  }

  function isWholePositiveHorizon(value) {
    return isExplicitFiniteNumber(value)
      && Number.isInteger(Number(value))
      && Number(value) >= 1
      && Number(value) <= MAX_HORIZON_YEARS;
  }

  function isScoreValue(value) {
    return isExplicitFiniteNumber(value) && Number.isInteger(Number(value)) && Number(value) >= -3 && Number(value) <= 3;
  }

  function hasExplicitScoreProfile(scores) {
    const requiredFields = ["mensch", "planet", "demokratie"];
    return Boolean(scores) && requiredFields.every((field) => isScoreValue(scores[field]));
  }

  function hasDocumentedQuality(value) {
    return isUnitInterval(value);
  }

  function calculateImpactGate({
    scores,
    redLineActive = false,
    dataQuality,
    lowerNetBenefit = 0,
    resourceBase = null,
    systemBoundaryDefined = false,
    attributionDefined = false,
    minimumDataQuality = MIN_DATA_QUALITY,
    inputErrors = [],
  } = {}) {
    const final = calculateFinalScore(scores, redLineActive);
    const reasons = [];
    if (redLineActive === true) reasons.push("Eine rote Linie ist aktiv.");
    for (const error of inputErrors) reasons.push(error);
    if (!hasExplicitScoreProfile(scores)) reasons.push("Das vollständige Schutzprofil für Mensch, Planet und Demokratie ist nicht dokumentiert.");
    if (final.finalScore < 0) reasons.push(`Das schwächste Kernfeld (${final.weakestField}) ist negativ.`);
    if (!hasDocumentedQuality(dataQuality)) reasons.push("Die Datenqualität ist nicht ausdrücklich im Bereich von 0 bis 1 dokumentiert.");
    else if (fraction(dataQuality) < fraction(minimumDataQuality, MIN_DATA_QUALITY)) reasons.push("Die dokumentierte Datenqualität liegt unter dem Mindeststandard.");
    if (systemBoundaryDefined !== true) reasons.push("Die Systemgrenze ist nicht dokumentiert.");
    if (attributionDefined !== true) reasons.push("Die kausale Zurechnung ist nicht dokumentiert.");
    if (number(lowerNetBenefit) <= 0) reasons.push("Die konservative Szenario-Untergrenze des Nettonutzens ist nicht positiv.");
    if (resourceBase !== null && number(resourceBase) <= 0) reasons.push("Die diskontierte Ressourcenbasis ist nicht positiv; eine Verhältniskennzahl ist nicht berechenbar.");
    return {
      passed: reasons.length === 0,
      finalScore: final.finalScore,
      weakestField: final.weakestField,
      reasons,
      explanation: reasons.length
        ? "Das Schutz-Gate ist geschlossen: Die Profil- und Prüfbefunde erlauben keine positive Gesamtkennzahl."
        : "Das Schutz-Gate ist offen: Profil, Systemgrenze, Zurechnung, Datenqualität, konservative Untergrenze und Ressourcenbasis sind dokumentiert. In einer Demo bleibt das eine Modellannahme, keine unabhängige Prüfung.",
    };
  }

  // The NWI is a dimensionless, equal-weighted profile value. It needs the
  // same documented protection conditions as every positive model claim, but
  // it is not a monetary return ratio and therefore must not inherit the
  // T-SROI numerator or resource-base conditions.
  function calculateNwiGate({
    scores,
    redLineActive = false,
    dataQuality,
    systemBoundaryDefined = false,
    attributionDefined = false,
    minimumDataQuality = MIN_DATA_QUALITY,
    inputErrors = [],
  } = {}) {
    const final = calculateFinalScore(scores, redLineActive);
    const reasons = [];
    if (redLineActive === true) reasons.push("Eine rote Linie ist aktiv.");
    for (const error of inputErrors) reasons.push(error);
    if (!hasExplicitScoreProfile(scores)) reasons.push("Das vollständige Schutzprofil für Mensch, Planet und Demokratie ist nicht dokumentiert.");
    if (final.finalScore < 0) reasons.push(`Das schwächste Kernfeld (${final.weakestField}) ist negativ.`);
    if (!hasDocumentedQuality(dataQuality)) reasons.push("Die Datenqualität ist nicht ausdrücklich im Bereich von 0 bis 1 dokumentiert.");
    else if (fraction(dataQuality) < fraction(minimumDataQuality, MIN_DATA_QUALITY)) reasons.push("Die dokumentierte Datenqualität liegt unter dem Mindeststandard.");
    if (systemBoundaryDefined !== true) reasons.push("Die Systemgrenze ist nicht dokumentiert.");
    if (attributionDefined !== true) reasons.push("Die kausale Zurechnung ist nicht dokumentiert.");
    return {
      passed: reasons.length === 0,
      finalScore: final.finalScore,
      weakestField: final.weakestField,
      reasons,
      explanation: reasons.length
        ? "Das NWI-Schutz-Gate ist geschlossen: Profil- und Prüfbefunde erlauben keine positive Netto-Wirkungs-Aussage."
        : "Das NWI-Schutz-Gate ist offen: Profil, Systemgrenze, Zurechnung und Datenqualität sind dokumentiert. Der NWI bleibt ein dimensionsloser Modellwert, kein Euro- oder Beweiswert.",
    };
  }

  // Monetary T-SROI: all benefit and cost terms are EUR in the same price
  // basis. Transformation is a separately evidenced benefit stream, never a
  // freely chosen multiplier. Attribution, counterfactual/deadweight and
  // displacement reduce the claimed benefit before discounting. Harm is
  // conservatively entered inside the system boundary and is not silently
  // attenuated by the benefit factor. The conservative scenario reduces only
  // the claimed benefit stream before discounting; it never reduces harm.
  function calculateTSROI({
    investment = 0,
    annualDirectBenefit = 0,
    annualTransformativeBenefit = 0,
    annualHarm = 0,
    annualOperatingCost = 0,
    years = 1,
    benefitDiscountRate = 0.05,
    costDiscountRate = benefitDiscountRate,
    attribution = 1,
    deadweight = 0,
    displacement = 0,
    uncertainty = 0,
    scores,
    redLineActive = false,
    dataQuality,
    systemBoundaryDefined = false,
    attributionDefined = false,
  } = {}) {
    const inputErrors = [];
    const invalid = (condition, message) => {
      if (condition) inputErrors.push(message);
    };
    invalid(!isNonNegativeAmount(investment), "Die Investition muss als nichtnegativer Eurobetrag eingegeben werden.");
    invalid(!isNonNegativeAmount(annualDirectBenefit), "Der direkte Nutzen muss als nichtnegativer Eurobetrag eingegeben werden.");
    invalid(!isNonNegativeAmount(annualTransformativeBenefit), "Der transformative Nutzen muss als nichtnegativer Eurobetrag eingegeben werden.");
    invalid(!isNonNegativeAmount(annualHarm), "Der Schaden muss als nichtnegativer Eurobetrag eingegeben werden.");
    invalid(!isNonNegativeAmount(annualOperatingCost), "Die Betriebskosten müssen als nichtnegativer Eurobetrag eingegeben werden.");
    invalid(!isWholePositiveHorizon(years), `Der Betrachtungszeitraum muss eine ganze Zahl von 1 bis ${MAX_HORIZON_YEARS} Jahren sein.`);
    invalid(!isUnitInterval(benefitDiscountRate), "Der Nutzen-Diskontsatz muss zwischen 0 und 1 liegen.");
    invalid(!isUnitInterval(costDiscountRate), "Der Ressourcen-Diskontsatz muss zwischen 0 und 1 liegen.");
    invalid(!isUnitInterval(attribution), "Die Attribution muss zwischen 0 und 1 liegen.");
    invalid(!isUnitInterval(deadweight), "Der Counterfactual/Deadweight muss zwischen 0 und 1 liegen.");
    invalid(!isUnitInterval(displacement), "Die Verdrängung muss zwischen 0 und 1 liegen.");
    invalid(!isUnitInterval(uncertainty), "Die Unsicherheit muss zwischen 0 und 1 liegen.");

    const horizon = isWholePositiveHorizon(years) ? Number(years) : 0;
    const benefitRate = isUnitInterval(benefitDiscountRate) ? Number(benefitDiscountRate) : 0;
    const resourceRate = isUnitInterval(costDiscountRate) ? Number(costDiscountRate) : 0;
    const causalShare = isUnitInterval(attribution) && isUnitInterval(deadweight) && isUnitInterval(displacement)
      ? Number(attribution) * (1 - Number(deadweight)) * (1 - Number(displacement))
      : 0;
    const directAnnual = (isNonNegativeAmount(annualDirectBenefit) ? Number(annualDirectBenefit) : 0) * causalShare;
    const transformativeAnnual = (isNonNegativeAmount(annualTransformativeBenefit) ? Number(annualTransformativeBenefit) : 0) * causalShare;
    const harmAnnual = isNonNegativeAmount(annualHarm) ? Number(annualHarm) : 0;
    const attributableBenefitAnnual = directAnnual + transformativeAnnual;
    const conservativeBenefitAnnual = attributableBenefitAnnual * (1 - (isUnitInterval(uncertainty) ? Number(uncertainty) : 0));
    const grossAnnual = attributableBenefitAnnual - harmAnnual;
    const conservativeAnnual = conservativeBenefitAnnual - harmAnnual;
    const directPv = presentValue(directAnnual, horizon, benefitRate);
    const transformativePv = presentValue(transformativeAnnual, horizon, benefitRate);
    const harmPv = presentValue(harmAnnual, horizon, benefitRate);
    const benefitPv = directPv + transformativePv - harmPv;
    const lowerNetBenefitPv = presentValue(conservativeAnnual, horizon, benefitRate);
    const investmentPv = isNonNegativeAmount(investment) ? Number(investment) : 0;
    const operatingCostPv = presentValue(isNonNegativeAmount(annualOperatingCost) ? Number(annualOperatingCost) : 0, horizon, resourceRate);
    const costPv = investmentPv + operatingCostPv;
    const gate = calculateImpactGate({
      scores,
      redLineActive,
      dataQuality,
      lowerNetBenefit: lowerNetBenefitPv,
      resourceBase: costPv,
      systemBoundaryDefined,
      attributionDefined,
      inputErrors,
    });
    const directNetPv = directPv - harmPv;
    const safeCostPv = costPv > 0 ? costPv : null;
    const rawIoi = safeCostPv ? directNetPv / safeCostPv : null;
    const rawTsroi = safeCostPv ? benefitPv / safeCostPv : null;
    return {
      gate,
      finalScore: gate.finalScore,
      weakestField: gate.weakestField,
      horizon,
      causalShare,
      directAnnual,
      transformativeAnnual,
      harmAnnual,
      attributableBenefitAnnual,
      conservativeBenefitAnnual,
      grossAnnual,
      conservativeAnnual,
      directPv,
      transformativePv,
      harmPv,
      benefitPv,
      lowerNetBenefitPv,
      investmentPv,
      operatingCostPv,
      costPv,
      rawIoi,
      rawTsroi,
      ioi: gate.passed && rawIoi !== null ? rawIoi : null,
      tsroi: gate.passed && rawTsroi !== null ? rawTsroi : null,
      status: gate.passed && rawTsroi !== null ? "evaluated" : "blocked",
      explanation: gate.passed
        ? "T-SROI ist der diskontierte, kausal zugerechnete Nutzen abzüglich konservativ angesetzter Schäden in EUR je diskontiertem EUR Ressourceneinsatz. Der konservative Szenarioabschlag reduziert nur beanspruchte Nutzenströme, nicht Schäden."
        : "T-SROI und IOI bleiben blockiert; Rohwerte dürfen nicht als positive Gesamtkennzahl gelesen werden.",
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
      "Keine Personenbewertung und keine automatische Entscheidung.",
      "Wirkungspotenzial, Reichweite und eingetretene Wirkung bleiben getrennt.",
    ];
    if (redLineActive) warnings.unshift("Rote Linie aktiv: positive Gesamtkennzahlen sind blockiert.");
    if (fraction(dataQuality, 1) < MIN_DATA_QUALITY) warnings.unshift("Datenqualität unter Mindeststandard: Ergebnis ist nicht bewertbar.");
    if (weakestField) warnings.push(`Schwächstes Kernfeld: ${weakestField}.`);
    if (personRisk) warnings.unshift("Bewertet werden Systeme, Maßnahmen und Wirkpfade, nicht Menschen.");
    return warnings;
  }

  const api = {
    MIN_DATA_QUALITY,
    MAX_HORIZON_YEARS,
    number,
    fraction,
    clampScore,
    presentValue,
    calculateFinalScore,
    calculateNWI,
    calculateImpactGate,
    calculateNwiGate,
    calculateTSROI,
    getDataQualityClass,
    getDemoWarnings,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.WoekImpactCalculations = api;
})(typeof window !== "undefined" ? window : globalThis);
