(function () {
  const root = document.querySelector("[data-impact-controlling-calculator]");
  if (!root) return;

  const presets = {
    praevention: {
      name: "Präventionsprojekt",
      investment: 100000,
      annualValue: 160000,
      years: 3,
      scores: { mensch: 2, planet: 0, demokratie: 1, daten: 1 },
      explanation: "Prävention kann hohe Folgekosten vermeiden; Datenqualität und demokratische Anschlussfähigkeit bleiben begrenzende Faktoren.",
    },
    produkt: {
      name: "Produkttransformation",
      investment: 250000,
      annualValue: 210000,
      years: 4,
      scores: { mensch: 1, planet: 2, demokratie: 0, daten: 1 },
      explanation: "Produkttransformation wirkt über Material, Lieferkette, Nutzung und Marktverhalten. Der schwächste Score begrenzt die Gesamtbewertung.",
    },
    lieferkette: {
      name: "Lieferkettenprogramm",
      investment: 400000,
      annualValue: 260000,
      years: 5,
      scores: { mensch: 1, planet: 1, demokratie: 1, daten: -1 },
      explanation: "Lieferkettenprogramme hängen stark an Datenqualität, Prüfstatus und Lieferantenentwicklung.",
    },
  };

  const form = root.querySelector(".calculator-form");
  const result = (key) => root.querySelector(`[data-result="${key}"]`);
  const fields = ["mensch", "planet", "demokratie", "daten"];
  const money = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

  function clampScore(value) {
    const number = Number.parseInt(value, 10);
    if (Number.isNaN(number)) return 0;
    return Math.max(-3, Math.min(3, number));
  }

  function formatScore(value) {
    return value > 0 ? `+${value}` : String(value);
  }

  function render() {
    const selected = presets[form.elements.preset.value] || presets.praevention;
    const scores = fields.map((field) => clampScore(form.elements[field].value));
    fields.forEach((field, index) => {
      form.elements[field].value = scores[index];
    });

    const investment = Math.max(1, Number.parseFloat(form.elements.investment.value || "0"));
    const annualValue = Math.max(0, Number.parseFloat(form.elements.annualValue.value || "0"));
    const years = Math.max(1, Number.parseInt(form.elements.years.value || "1", 10));
    const finalScore = Math.min(...scores);
    const positive = scores.filter((score) => score > 0).reduce((sum, score) => sum + score, 0);
    const negative = Math.abs(scores.filter((score) => score < 0).reduce((sum, score) => sum + score, 0));
    const nwi = (positive - negative) / fields.length;
    const totalValue = annualValue * years;
    const tsroi = totalValue / investment;

    result("presetName").textContent = selected.name;
    result("finalScore").textContent = formatScore(finalScore);
    result("nwi").textContent = nwi.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    result("tsroi").textContent = `${tsroi.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} : 1`;
    result("totalValue").textContent = money.format(totalValue);
    result("explanation").textContent = selected.explanation;
  }

  form.elements.preset.addEventListener("change", () => {
    const selected = presets[form.elements.preset.value] || presets.praevention;
    form.elements.investment.value = selected.investment;
    form.elements.annualValue.value = selected.annualValue;
    form.elements.years.value = selected.years;
    fields.forEach((field) => {
      form.elements[field].value = selected.scores[field];
    });
    render();
  });

  form.addEventListener("input", render);
  form.elements.preset.dispatchEvent(new Event("change"));
})();
