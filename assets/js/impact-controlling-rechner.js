(function initImpactControllingCalculator() {
  "use strict";

  const root = document.querySelector("[data-impact-controlling-calculator]");
  if (!root) return;
  const calculations = window.WoekImpactCalculations;
  if (!calculations) return;

  const presets = {
    praevention: {
      name: "Präventionsprojekt",
      investment: 1000000,
      annualDirectBenefit: 500000,
      annualTransformativeBenefit: 200000,
      annualHarm: 100000,
      annualOperatingCost: 0,
      years: 2,
      discountRate: 5,
      attribution: 100,
      deadweight: 0,
      displacement: 0,
      uncertainty: 10,
      dataQuality: 0.8,
      scores: { mensch: 2, planet: 1, demokratie: 1 },
      redLine: false,
      explanation: "Das Beispiel trennt direkten Präventionsnutzen von zusätzlich belegtem Transformationsnutzen. Die Untergrenze bleibt positiv; deshalb kann das Gate in dieser Demo öffnen.",
    },
    produkt: {
      name: "Produkttransformation",
      investment: 250000,
      annualDirectBenefit: 160000,
      annualTransformativeBenefit: 100000,
      annualHarm: 30000,
      annualOperatingCost: 15000,
      years: 3,
      discountRate: 5,
      attribution: 80,
      deadweight: 10,
      displacement: 5,
      uncertainty: 15,
      dataQuality: 0.75,
      scores: { mensch: 1, planet: 2, demokratie: 1 },
      redLine: false,
      explanation: "Die Kausalzurechnung wird vor der Abzinsung reduziert. Dadurch kann die Demo nicht einfach den ganzen beobachteten Nutzen für sich beanspruchen.",
    },
    lieferkette: {
      name: "Lieferkettenprogramm",
      investment: 400000,
      annualDirectBenefit: 260000,
      annualTransformativeBenefit: 90000,
      annualHarm: 60000,
      annualOperatingCost: 30000,
      years: 5,
      discountRate: 5,
      attribution: 70,
      deadweight: 10,
      displacement: 10,
      uncertainty: 20,
      dataQuality: 0.55,
      scores: { mensch: 1, planet: 1, demokratie: -1 },
      redLine: false,
      explanation: "Hier ist das Gate absichtlich geschlossen: Ein negatives Demokratieprofil und zu schwache Datenqualität dürfen nicht durch ein Geldverhältnis überdeckt werden.",
    },
  };

  const form = root.querySelector(".calculator-form");
  const output = (key) => root.querySelector(`[data-impact-result="${key}"]`);
  const fields = ["mensch", "planet", "demokratie"];
  const money = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  const decimal = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function rawValue(name) {
    return form.elements[name]?.value;
  }

  function percentage(name) {
    const raw = rawValue(name);
    if (typeof raw === "string" && raw.trim() === "") return raw;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed / 100 : raw;
  }

  function isCompleteProfile(scores) {
    return fields.every((field) => {
      const valueToCheck = scores[field];
      return valueToCheck !== null
        && valueToCheck !== undefined
        && !(typeof valueToCheck === "string" && valueToCheck.trim() === "")
        && Number.isInteger(Number(valueToCheck))
        && Number(valueToCheck) >= -3
        && Number(valueToCheck) <= 3;
    });
  }

  function equallyWeightedNwi(scores, nwiGate, redLineActive) {
    if (!isCompleteProfile(scores)) return calculations.calculateNWI({ redLineActive, gatePassed: false });
    const values = fields.map((field) => Number(scores[field]));
    const weight = 1 / values.length;
    return calculations.calculateNWI({
      positive: values.filter((item) => item > 0).reduce((sum, item) => sum + item * weight, 0),
      negative: Math.abs(values.filter((item) => item < 0).reduce((sum, item) => sum + item * weight, 0)),
      redLineActive,
      gatePassed: nwiGate?.passed === true,
    });
  }

  function set(key, text) {
    const target = output(key);
    if (target) target.textContent = text;
  }

  function formatScore(valueToFormat) {
    return valueToFormat > 0 ? `+${valueToFormat}` : String(valueToFormat);
  }

  function applyPreset(preset) {
    const values = [
      "investment", "annualDirectBenefit", "annualTransformativeBenefit", "annualHarm", "annualOperatingCost",
      "years", "discountRate", "attribution", "deadweight", "displacement", "uncertainty", "dataQuality",
    ];
    for (const key of values) form.elements[key].value = preset[key];
    for (const field of fields) form.elements[field].value = preset.scores[field];
    form.elements.redLine.checked = Boolean(preset.redLine);
    form.elements.systemBoundaryDefined.checked = false;
    form.elements.attributionDefined.checked = false;
  }

  function evidenceConfirmed(name) {
    return Boolean(form.elements[name]?.checked);
  }

  function resetEvidenceForChangedAssumption(event) {
    const name = event?.target?.name;
    if (["preset", "redLine", "systemBoundaryDefined", "attributionDefined"].includes(name)) return;
    form.elements.systemBoundaryDefined.checked = false;
    form.elements.attributionDefined.checked = false;
  }

  function render() {
    const selected = presets[form.elements.preset.value] || presets.praevention;
    const scores = Object.fromEntries(fields.map((field) => [field, rawValue(field)]));
    const systemBoundaryDefined = evidenceConfirmed("systemBoundaryDefined");
    const attributionDefined = evidenceConfirmed("attributionDefined");
    const result = calculations.calculateTSROI({
      investment: rawValue("investment"),
      annualDirectBenefit: rawValue("annualDirectBenefit"),
      annualTransformativeBenefit: rawValue("annualTransformativeBenefit"),
      annualHarm: rawValue("annualHarm"),
      annualOperatingCost: rawValue("annualOperatingCost"),
      years: rawValue("years"),
      benefitDiscountRate: percentage("discountRate"),
      costDiscountRate: percentage("discountRate"),
      attribution: percentage("attribution"),
      deadweight: percentage("deadweight"),
      displacement: percentage("displacement"),
      uncertainty: percentage("uncertainty"),
      scores,
      redLineActive: form.elements.redLine.checked,
      dataQuality: rawValue("dataQuality"),
      systemBoundaryDefined,
      attributionDefined,
    });
    const nwiGate = calculations.calculateNwiGate({
      scores,
      redLineActive: form.elements.redLine.checked,
      dataQuality: rawValue("dataQuality"),
      systemBoundaryDefined,
      attributionDefined,
    });
    const nwi = equallyWeightedNwi(scores, nwiGate, form.elements.redLine.checked);
    const final = calculations.calculateFinalScore(scores, form.elements.redLine.checked);
    const rate = percentage("discountRate");
    const rateLabel = Number.isFinite(Number(rate)) && !(typeof rate === "string" && rate.trim() === "")
      ? `${(Number(rate) * 100).toLocaleString("de-DE", { maximumFractionDigits: 2 })} %`
      : "nicht gültig";

    set("presetName", selected.name);
    set("finalScore", isCompleteProfile(scores) ? formatScore(final.finalScore) : "nicht gesetzt");
    const evaluated = result.status === "evaluated";
    set("gate", result.gate.passed ? "offen (Demo)" : "blockiert");
    set("nwi", nwi.nwi === null ? "blockiert" : `${formatScore(nwi.nwi)} Punkte`);
    set("ioi", evaluated ? `${decimal.format(result.ioi)} EUR/EUR` : "blockiert");
    set("tsroi", evaluated ? `${decimal.format(result.tsroi)} : 1` : "blockiert");
    set("totalValue", money.format(result.benefitPv));
    set("positiveNetValue", result.gate.passed
      ? `konservative Szenario-Untergrenze: ${money.format(result.lowerNetBenefitPv)}`
      : `Szenario-Untergrenze: ${money.format(result.lowerNetBenefitPv)} – keine positive Kennzahl`);
    set("explanation", evaluated
      ? `${selected.explanation} ${result.explanation}`
      : `${selected.explanation} ${result.gate.explanation} ${result.gate.reasons.join(" ")}`);
    const steps = output("steps");
    if (steps) {
      const share = result.causalShare * 100;
      steps.innerHTML = [
        `Kausaler Anteil für den beanspruchten Nutzen: ${decimal.format(share)} %. Attribution, Counterfactual (Deadweight) und Verdrängung werden vor der Bewertung berücksichtigt.`,
        `Diskontierter direkter Nutzen: ${money.format(result.directPv)}; zusätzlicher transformativ belegter Nutzen: ${money.format(result.transformativePv)}; konservativ angesetzte Schäden: ${money.format(result.harmPv)}. Der Szenarioabschlag reduziert nur die beanspruchten Nutzenströme vor der Abzinsung, nicht Schäden.`,
        `Diskontierter Netto-Nutzen: ${money.format(result.benefitPv)}. Diskontierte Ressourcen: ${money.format(result.costPv)} bei ${rateLabel} Diskontsatz. Demo-Annahme: r = r_K; in einer Prüfung können beide Sätze getrennt begründet werden.`,
        evaluated
          ? `Gate offen: T-SROI = ${money.format(result.benefitPv)} / ${money.format(result.costPv)} = ${decimal.format(result.tsroi)} : 1.`
          : `Gate blockiert: ${result.gate.reasons.join(" ")} Deshalb werden IOI und T-SROI nicht positiv ausgewiesen.`,
        nwiGate.passed
          ? `NWI-Schutz-Gate offen: Der gleichgewichtete Profilwert wird unabhängig von der Euro-Quote ausgewiesen.`
          : `NWI-Schutz-Gate blockiert: ${nwiGate.reasons.join(" ")} Deshalb wird der NWI nicht positiv ausgewiesen.`,
      ].map((item) => `<li>${item}</li>`).join("");
    }
  }

  form.elements.preset.addEventListener("change", () => {
    applyPreset(presets[form.elements.preset.value] || presets.praevention);
    render();
  });
  form.addEventListener("input", (event) => {
    resetEvidenceForChangedAssumption(event);
    render();
  });
  form.addEventListener("change", (event) => {
    resetEvidenceForChangedAssumption(event);
    render();
  });
  applyPreset(presets[form.elements.preset.value] || presets.praevention);
  render();
})();
