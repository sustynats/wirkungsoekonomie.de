(function () {
  const root = document.querySelector("[data-product-impact-calculator]");
  if (!root) return;

  const presets = {
    bioApfel: {
      name: "Bio-Apfel regional",
      price: 1,
      scores: { mensch: 2, planet: 1, demokratie: 1, daten: 2 },
      explanation: "Regionale und geprüfte Daten verbessern das Modell, aber der niedrigste Kernfeldscore begrenzt die Steuerklasse.",
    },
    chileApfel: {
      name: "Chile-Apfel importiert",
      price: 1,
      scores: { mensch: 0, planet: -1, demokratie: 0, daten: 1 },
      explanation: "Transport, Wasserstress und Datenlage können die Bewertung begrenzen. Das Beispiel ist bewusst modellhaft.",
    },
    tshirt: {
      name: "T-Shirt",
      price: 24,
      scores: { mensch: 0, planet: -1, demokratie: 0, daten: 0 },
      explanation: "Textilien hängen stark an Arbeit, Wasser, Chemie, Nutzungsdauer und Kreislauffähigkeit.",
    },
    polyamid: {
      name: "Polyamid Produktgruppe",
      price: 399,
      scores: { mensch: 0, planet: -2, demokratie: 0, daten: 1 },
      explanation: "Das Polyamid-Beispiel zeigt den Weg von Konzern- und ESRS-Daten zu Produktgruppen, nicht eine amtliche Einstufung.",
    },
  };

  const taxMatrix = new Map([
    [3, 0],
    [2, 0.05],
    [1, 0.1],
    [0, 0.15],
    [-1, 0.2],
    [-2, 0.25],
    [-3, 0.3],
  ]);

  const form = root.querySelector(".calculator-form");
  const productSelect = form.elements.product;
  const fields = ["mensch", "planet", "demokratie", "daten"];
  const result = (key) => root.querySelector(`[data-result="${key}"]`);
  const productName = root.querySelector("#calc-product-name");
  const money = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

  function clampScore(value) {
    const number = Number.parseInt(value, 10);
    if (Number.isNaN(number)) return 0;
    return Math.max(-3, Math.min(3, number));
  }

  function formatScore(score) {
    return score > 0 ? `+${score}` : String(score);
  }

  function render() {
    const scores = fields.map((field) => clampScore(form.elements[field].value));
    fields.forEach((field, index) => {
      form.elements[field].value = scores[index];
    });
    const netPrice = Math.max(0, Number.parseFloat(form.elements.netPrice.value || "0"));
    const finalScore = Math.min(...scores);
    const taxRate = taxMatrix.get(finalScore) ?? 0.15;
    const grossPrice = netPrice * (1 + taxRate);
    const selected = presets[productSelect.value] || presets.bioApfel;

    productName.textContent = selected.name;
    result("finalScore").textContent = formatScore(finalScore);
    result("taxRate").textContent = finalScore === -3 ? "25-30 % (Demo: 30 %)" : `${Math.round(taxRate * 100)} %`;
    result("netPrice").textContent = money.format(netPrice);
    result("grossPrice").textContent = money.format(grossPrice);
    result("explanation").textContent = selected.explanation;
  }

  productSelect.addEventListener("change", () => {
    const selected = presets[productSelect.value] || presets.bioApfel;
    form.elements.netPrice.value = selected.price.toFixed(2);
    fields.forEach((field) => {
      form.elements[field].value = selected.scores[field];
    });
    render();
  });

  form.addEventListener("input", render);
  productSelect.dispatchEvent(new Event("change"));
})();
