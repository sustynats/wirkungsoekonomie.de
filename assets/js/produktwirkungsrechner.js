(function () {
  const root = document.querySelector("[data-product-impact-calculator]");
  if (!root) return;

  const presets = {
    bioApfel: {
      name: "Bio-Apfel regional",
      price: 1,
      scores: { mensch: 2, planet: 1, demokratie: 1, daten: 2 },
      explanation: "Regionale und geprüfte Daten können den Prüfpfad stärken; ein Score begründet jedoch keine automatische Tarifentscheidung.",
    },
    chileApfel: {
      name: "Chile-Apfel importiert",
      price: 1,
      scores: { mensch: 0, planet: -1, demokratie: 0, daten: 1 },
      explanation: "Transport, Wasserstress und Datenlage können den Prüfstatus begrenzen. Das Beispiel ist bewusst modellhaft.",
    },
    tshirt: {
      name: "T-Shirt",
      price: 24,
      scores: { mensch: 0, planet: -1, demokratie: 0, daten: 0 },
      explanation: "Textilien hängen stark an Arbeit, Wasser, Chemie, Nutzungsdauer und Kreislauffähigkeit; der Prüfstatus ist keine Preisvorgabe.",
    },
    polyamid: {
      name: "Polyamid Produktgruppe",
      price: 399,
      scores: { mensch: 0, planet: -2, demokratie: 0, daten: 1 },
      explanation: "Das Polyamid-Beispiel zeigt den Weg von Konzern- und ESRS-Daten zu Produktgruppen, nicht eine amtliche Einstufung oder Tarifentscheidung.",
    },
  };

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

  function finiteNumber(value, fallback = 0) {
    const number = Number.parseFloat(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function formatScore(score) {
    return score > 0 ? `+${score}` : String(score);
  }

  function assessmentMessage(finalScore, dataScore) {
    if (dataScore < 0) return "nicht bewertbar: Datenstand und Systemgrenze müssen vor jeder Tarifdiskussion geklärt werden.";
    if (finalScore <= -2) return "kritisch: Schutzprüfung und Korrekturweg vor jeder möglichen Rechtsfolge.";
    if (finalScore < 0) return "ambivalent: negativer Kernbefund, kein automatischer Tarif.";
    return "Profil dokumentiert: Eine mögliche Tarifregel müsste separat gesetzlich festgelegt und überprüft werden.";
  }

  function render() {
    const scores = fields.map((field) => clampScore(form.elements[field].value));
    fields.forEach((field, index) => {
      form.elements[field].value = scores[index];
    });
    const netPrice = Math.max(0, finiteNumber(form.elements.netPrice.value));
    const finalScore = Math.min(...scores);
    const modelRate = Math.max(0, Math.min(1, finiteNumber(form.elements.modelRate.value) / 100));
    const grossPrice = netPrice * (1 + modelRate);
    const status = assessmentMessage(finalScore, scores[fields.indexOf("daten")]);
    const selected = presets[productSelect.value] || presets.bioApfel;

    productName.textContent = selected.name;
    result("finalScore").textContent = formatScore(finalScore);
    result("status").textContent = status;
    result("modelRate").textContent = `${Math.round(modelRate * 100)} % (Testannahme, keine Tarifempfehlung)`;
    result("netPrice").textContent = money.format(netPrice);
    result("grossPrice").textContent = money.format(grossPrice);
    result("explanation").textContent = `${selected.explanation} Der angezeigte Preis folgt nur P_brutto = P_netto × (1 + t) mit der von dir eingegebenen Testannahme t.`;
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
