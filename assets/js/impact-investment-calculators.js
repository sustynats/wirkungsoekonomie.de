(function initImpactInvestmentCalculators() {
  "use strict";

  const calculations = window.WoekImpactCalculations;
  if (!calculations) return;

  const calculators = {
    unternehmen: {
      examples: {
        sanierung: {
          name: "Energetische Unternehmenssanierung", investment: 1000000, financialAnnual: 120000,
          annualDirectBenefit: 180000, annualTransformativeBenefit: 40000, annualHarm: 0, annualOperatingCost: 10000,
          years: 20, discountRate: 5, attribution: 90, deadweight: 10, displacement: 0, uncertainty: 15, dataQuality: 0.9,
          scores: { mensch: 2, planet: 3, demokratie: 1 }, redLine: false,
          interpretation: "Die Sanierung hat einen klaren Wirkpfad. Der zusätzliche Transformationsnutzen muss als eigener Nutzenstrom belegt werden, etwa über dauerhaft übernommene Standards oder Infrastruktur.",
        },
        lieferkette: {
          name: "Lieferantenentwicklung und Datenaufbau", investment: 350000, financialAnnual: 55000,
          annualDirectBenefit: 140000, annualTransformativeBenefit: 30000, annualHarm: 25000, annualOperatingCost: 15000,
          years: 5, discountRate: 5, attribution: 70, deadweight: 10, displacement: 5, uncertainty: 20, dataQuality: 0.75,
          scores: { mensch: 2, planet: 1, demokratie: 1 }, redLine: false,
          interpretation: "Das Programm bleibt datenabhängig. Attribution, Counterfactual und Verdrängung begrenzen den beanspruchten Nutzen bereits vor der Rechenquote.",
        },
        produktportfolio: {
          name: "Kreislauffähiges Produktportfolio", investment: 750000, financialAnnual: 95000,
          annualDirectBenefit: 260000, annualTransformativeBenefit: 60000, annualHarm: 70000, annualOperatingCost: 30000,
          years: 6, discountRate: 5, attribution: 75, deadweight: 10, displacement: 5, uncertainty: 20, dataQuality: 0.8,
          scores: { mensch: 1, planet: 2, demokratie: 0 }, redLine: false,
          interpretation: "Das Profil ist nur dann für eine positive Kennzahl offen, wenn die Demokratie-/Governance-Dimension mindestens nicht negativ bleibt. Datenzugang und Lobby-Alignment sind daher Prüfgegenstand, kein Geld-Multiplikator.",
        },
      },
    },
    finanzmarkt: {
      examples: {
        wirkungskredit: {
          name: "Wirkungskredit für Gebäudesanierung", investment: 1000000, financialAnnual: 45000,
          annualDirectBenefit: 180000, annualTransformativeBenefit: 40000, annualHarm: 0, annualOperatingCost: 10000,
          years: 20, discountRate: 5, attribution: 90, deadweight: 10, displacement: 0, uncertainty: 15, dataQuality: 0.9,
          scores: { mensch: 2, planet: 3, demokratie: 1 }, redLine: false,
          interpretation: "Der Kredit kann Resilienz und Folgekostenvermeidung finanzieren. Das ist kein automatisches Rating: Systemgrenze, Attribution und Datenqualität bleiben dokumentationspflichtig.",
        },
        covenant: {
          name: "Lieferketten-Kredit mit Wirkungs-Covenants", investment: 2000000, financialAnnual: 130000,
          annualDirectBenefit: 420000, annualTransformativeBenefit: 60000, annualHarm: 80000, annualOperatingCost: 40000,
          years: 7, discountRate: 5, attribution: 70, deadweight: 10, displacement: 5, uncertainty: 20, dataQuality: 0.75,
          scores: { mensch: 2, planet: 1, demokratie: 1 }, redLine: false,
          interpretation: "Covenants machen Prüfpfade sichtbar, ersetzen aber keine Grundrechts-, Umwelt- oder individuelle Kreditprüfung.",
        },
        lockin: {
          name: "Fossiler Lock-in im Kreditportfolio", investment: 5000000, financialAnnual: 420000,
          annualDirectBenefit: 350000, annualTransformativeBenefit: 0, annualHarm: 900000, annualOperatingCost: 150000,
          years: 10, discountRate: 5, attribution: 80, deadweight: 5, displacement: 0, uncertainty: 20, dataQuality: 0.8,
          scores: { mensch: 0, planet: -3, demokratie: -1 }, redLine: false,
          interpretation: "Der Finanzrückfluss kann positiv aussehen, während die Schutzprüfung die Wirkungskennzahlen blockiert. Genau das verhindert grün gerechnete Portfolios.",
        },
      },
    },
  };

  const currency = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  const decimal = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function rawValue(form, name) {
    return form.elements[name]?.value;
  }

  function percent(form, name) {
    const raw = rawValue(form, name);
    if (typeof raw === "string" && raw.trim() === "") return raw;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed / 100 : raw;
  }

  function isExplicitNumber(valueToCheck) {
    return valueToCheck !== null
      && valueToCheck !== undefined
      && !(typeof valueToCheck === "string" && valueToCheck.trim() === "")
      && Number.isFinite(Number(valueToCheck));
  }

  function isCompleteProfile(scores) {
    return Object.values(scores).every((valueToCheck) => (
      isExplicitNumber(valueToCheck)
      && Number.isInteger(Number(valueToCheck))
      && Number(valueToCheck) >= -3
      && Number(valueToCheck) <= 3
    ));
  }

  function equallyWeightedNwi(scores, nwiGate, redLineActive) {
    if (!isCompleteProfile(scores)) return calculations.calculateNWI({ redLineActive, gatePassed: false });
    const values = Object.values(scores).map(Number);
    const weight = 1 / values.length;
    return calculations.calculateNWI({
      positive: values.filter((item) => item > 0).reduce((sum, item) => sum + item * weight, 0),
      negative: Math.abs(values.filter((item) => item < 0).reduce((sum, item) => sum + item * weight, 0)),
      redLineActive,
      gatePassed: nwiGate?.passed === true,
    });
  }

  function signed(valueToFormat) {
    return valueToFormat > 0 ? `+${decimal.format(valueToFormat)}` : decimal.format(valueToFormat);
  }

  function setText(root, key, text) {
    const target = root.querySelector(`[data-impact-calc-result="${key}"]`);
    if (target) target.textContent = text;
  }

  function setSteps(root, steps) {
    const target = root.querySelector('[data-impact-calc-result="steps"]');
    if (target) target.innerHTML = steps.map((step) => `<li>${step}</li>`).join("");
  }

  function applyExample(form, example) {
    for (const [key, current] of Object.entries(example)) {
      if (key === "scores" || key === "name" || key === "interpretation" || key === "redLine") continue;
      if (form.elements[key]) form.elements[key].value = current;
    }
    for (const [key, current] of Object.entries(example.scores)) form.elements[key].value = current;
    form.elements.redLine.checked = Boolean(example.redLine);
    form.elements.systemBoundaryDefined.checked = false;
    form.elements.attributionDefined.checked = false;
  }

  function evidenceConfirmed(form, name) {
    return Boolean(form.elements[name]?.checked);
  }

  function resetEvidenceForChangedAssumption(form, event) {
    const name = event?.target?.name;
    if (["preset", "redLine", "systemBoundaryDefined", "attributionDefined"].includes(name)) return;
    form.elements.systemBoundaryDefined.checked = false;
    form.elements.attributionDefined.checked = false;
  }

  function calculate(root, config) {
    const form = root.querySelector("form");
    const investment = rawValue(form, "investment");
    const years = rawValue(form, "years");
    const rate = percent(form, "discountRate");
    const scores = { mensch: rawValue(form, "mensch"), planet: rawValue(form, "planet"), demokratie: rawValue(form, "demokratie") };
    const systemBoundaryDefined = evidenceConfirmed(form, "systemBoundaryDefined");
    const attributionDefined = evidenceConfirmed(form, "attributionDefined");
    const result = calculations.calculateTSROI({
      investment,
      annualDirectBenefit: rawValue(form, "annualDirectBenefit"),
      annualTransformativeBenefit: rawValue(form, "annualTransformativeBenefit"),
      annualHarm: rawValue(form, "annualHarm"),
      annualOperatingCost: rawValue(form, "annualOperatingCost"),
      years,
      benefitDiscountRate: rate,
      costDiscountRate: rate,
      attribution: percent(form, "attribution", 1),
      deadweight: percent(form, "deadweight", 0),
      displacement: percent(form, "displacement", 0),
      uncertainty: percent(form, "uncertainty", 0),
      dataQuality: rawValue(form, "dataQuality"),
      scores,
      redLineActive: form.elements.redLine.checked,
      systemBoundaryDefined,
      attributionDefined,
    });
    const nwiGate = calculations.calculateNwiGate({
      scores,
      redLineActive: form.elements.redLine.checked,
      dataQuality: rawValue(form, "dataQuality"),
      systemBoundaryDefined,
      attributionDefined,
    });
    const nwi = equallyWeightedNwi(scores, nwiGate, form.elements.redLine.checked);
    const financialAnnual = rawValue(form, "financialAnnual");
    const operatingCost = rawValue(form, "annualOperatingCost");
    const hasValidFinancialInputs = isExplicitNumber(financialAnnual)
      && isExplicitNumber(operatingCost)
      && Number(operatingCost) >= 0
      && isExplicitNumber(investment)
      && Number(investment) > 0
      && Number.isInteger(Number(years))
      && Number(years) >= 1
      && Number(years) <= calculations.MAX_HORIZON_YEARS
      && isExplicitNumber(rate)
      && Number(rate) >= 0
      && Number(rate) <= 1;
    const financialPv = hasValidFinancialInputs
      ? calculations.presentValue(Number(financialAnnual) - Number(operatingCost), Number(years), Number(rate))
      : null;
    const financialRoi = financialPv === null ? null : (financialPv - Number(investment)) / Number(investment);
    const selected = config.examples[form.elements.preset.value];

    setText(root, "roi", financialRoi === null ? "nicht berechenbar" : `${decimal.format(financialRoi)} : 1`);
    setText(root, "nwi", nwi.nwi === null ? "blockiert" : `${signed(nwi.nwi)} Punkte`);
    setText(root, "finalScore", isCompleteProfile(scores) ? (result.finalScore > 0 ? `+${result.finalScore}` : String(result.finalScore)) : "nicht gesetzt");
    const evaluated = result.status === "evaluated";
    setText(root, "ioi", evaluated ? `${decimal.format(result.ioi)} EUR/EUR` : "blockiert");
    setText(root, "tsroi", evaluated ? `${decimal.format(result.tsroi)} : 1` : "blockiert");
    setText(root, "netImpact", currency.format(result.benefitPv));
    setText(root, "financialReturn", financialPv === null ? "nicht berechenbar" : currency.format(financialPv));
    setText(root, "interpretation", evaluated
      ? `${selected?.interpretation || "Modellhafte Demonstration."} ${result.explanation}`
      : `${selected?.interpretation || "Modellhafte Demonstration."} ${result.gate.reasons.join(" ")}`);
    setSteps(root, [
      financialPv === null
        ? "Finanzsicht: Netto-Rückflussquote ist wegen unvollständiger oder ungültiger Eingaben nicht berechenbar."
        : `Finanzsicht: diskontierter Netto-Rückfluss ${currency.format(financialPv)} (Finanzrückfluss abzüglich Betriebskosten); nach Abzug der Anfangsinvestition ${currency.format(Number(investment))} ergibt sich ${decimal.format(financialRoi)} : 1.`,
      `Direkter Nutzen ${currency.format(result.directPv)}, transformativer Nutzen ${currency.format(result.transformativePv)} und konservativ angesetzte Schäden ${currency.format(result.harmPv)} werden vor der Quote getrennt ausgewiesen; der Szenarioabschlag reduziert nur beanspruchte Nutzen, nicht Schäden.`,
      `Diskontierter Netto-Nutzen ${currency.format(result.benefitPv)}; diskontierte Ressourcen ${currency.format(result.costPv)}. Demo-Annahme: r = r_K; in einer Prüfung können Nutzen- und Ressourcendiskontsätze getrennt begründet werden.`,
      evaluated
        ? `Gate offen: IOI = ${decimal.format(result.ioi)} EUR/EUR; T-SROI = ${decimal.format(result.tsroi)} : 1.`
        : `Gate blockiert: ${result.gate.reasons.join(" ")} Keine positive IOI- oder T-SROI-Aussage.`,
      nwiGate.passed
        ? "NWI-Schutz-Gate offen: Der gleichgewichtete Profilwert wird unabhängig von der Euro-Quote ausgewiesen."
        : `NWI-Schutz-Gate blockiert: ${nwiGate.reasons.join(" ")} Deshalb wird der NWI nicht positiv ausgewiesen.`,
    ]);
  }

  document.querySelectorAll("[data-impact-investment-calculator]").forEach((root) => {
    const config = calculators[root.getAttribute("data-impact-investment-calculator")];
    const form = root.querySelector("form");
    if (!config || !form) return;
    form.elements.preset.addEventListener("change", () => {
      const example = config.examples[form.elements.preset.value];
      if (example) applyExample(form, example);
      calculate(root, config);
    });
    form.addEventListener("input", (event) => {
      resetEvidenceForChangedAssumption(form, event);
      calculate(root, config);
    });
    form.addEventListener("change", (event) => {
      resetEvidenceForChangedAssumption(form, event);
      calculate(root, config);
    });
    applyExample(form, config.examples[form.elements.preset.value]);
    calculate(root, config);
  });
})();
