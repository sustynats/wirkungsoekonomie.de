(function () {
  const calculators = {
    unternehmen: {
      examples: {
        sanierung: {
          name: "Energetische Unternehmenssanierung",
          investment: 1000000,
          financialAnnual: 120000,
          positiveAnnual: 180000,
          negativeAnnual: 0,
          systemAnnual: 0,
          years: 20,
          transform: 1.3,
          time: 1,
          resilience: 1.2,
          quality: 0.9,
          scores: { mensch: 2, planet: 3, demokratie: 0 },
          interpretation:
            "Die Sanierung ist planetseitig stark und finanziell tragfähig. Der FinalScore bleibt wegen fehlender demokratischer Wirkung bei 0; das ist kein Fehler, sondern eine ehrliche Nichtkompensation.",
        },
        lieferkette: {
          name: "Lieferantenentwicklung und Datenaufbau",
          investment: 350000,
          financialAnnual: 55000,
          positiveAnnual: 140000,
          negativeAnnual: 25000,
          systemAnnual: 15000,
          years: 5,
          transform: 1.15,
          time: 1,
          resilience: 1.25,
          quality: 0.75,
          scores: { mensch: 2, planet: 1, demokratie: 1 },
          interpretation:
            "Das Programm erzeugt positive Netto-Wirkung, bleibt aber datenabhängig. Der Wert wird erst steuerbar, wenn Lieferantenentwicklung, Auditstatus und Einkaufsentscheidung gekoppelt werden.",
        },
        produktportfolio: {
          name: "Kreislauffähiges Produktportfolio",
          investment: 750000,
          financialAnnual: 95000,
          positiveAnnual: 260000,
          negativeAnnual: 70000,
          systemAnnual: 30000,
          years: 6,
          transform: 1.4,
          time: 1.1,
          resilience: 1.15,
          quality: 0.8,
          scores: { mensch: 1, planet: 2, demokratie: 0 },
          interpretation:
            "Die Produktumstellung hat Wirkungspotenzial und Marktlogik. Die offene Demokratie-/Governance-Dimension zeigt, wo Finanzkommunikation, Datenzugang und Lobby-Alignment nachziehen müssen.",
        },
      },
    },
    finanzmarkt: {
      examples: {
        wirkungskredit: {
          name: "Wirkungskredit für Gebäudesanierung",
          investment: 1000000,
          financialAnnual: 45000,
          positiveAnnual: 180000,
          negativeAnnual: 0,
          systemAnnual: 0,
          years: 20,
          transform: 1.3,
          time: 1,
          resilience: 1.2,
          quality: 0.9,
          scores: { mensch: 2, planet: 3, demokratie: 0 },
          interpretation:
            "Für die Bank wird sichtbar, dass der Kredit nicht nur Sicherheiten finanziert, sondern Resilienz, Energieeinsparung und Folgekostenvermeidung. Die Datenlage bleibt Teil der Kreditlogik.",
        },
        covenant: {
          name: "Lieferketten-Kredit mit Wirkungs-Covenants",
          investment: 2000000,
          financialAnnual: 130000,
          positiveAnnual: 420000,
          negativeAnnual: 80000,
          systemAnnual: 40000,
          years: 7,
          transform: 1.2,
          time: 1,
          resilience: 1.15,
          quality: 0.75,
          scores: { mensch: 2, planet: 1, demokratie: 1 },
          interpretation:
            "Covenants machen Wirkung kreditfähig: CO2-Pfad, Wasserstress, Living-Wage-Abdeckung und Datenqualität verändern Marge, Risiko und Monitoring.",
        },
        lockin: {
          name: "Fossiler Lock-in im Kreditportfolio",
          investment: 5000000,
          financialAnnual: 420000,
          positiveAnnual: 350000,
          negativeAnnual: 900000,
          systemAnnual: 150000,
          years: 10,
          transform: 1.1,
          time: 1,
          resilience: 1.05,
          quality: 0.8,
          scores: { mensch: 0, planet: -3, demokratie: -1 },
          interpretation:
            "Die Finanzrendite kann positiv aussehen, während der Wirkpfad negativ bleibt. Genau hier schützt Reverse Merit Order vor einem grün gerechneten Portfolio.",
        },
      },
    },
  };

  const currency = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  function number(value, fallback = 0) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function score(value) {
    return Math.max(-3, Math.min(3, Math.round(number(value))));
  }

  function decimal(value) {
    return number(value).toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function signed(value) {
    return value > 0 ? `+${decimal(value)}` : decimal(value);
  }

  function setText(root, key, value) {
    const target = root.querySelector(`[data-impact-calc-result="${key}"]`);
    if (target) target.textContent = value;
  }

  function setSteps(root, steps) {
    const target = root.querySelector('[data-impact-calc-result="steps"]');
    if (!target) return;
    target.innerHTML = steps.map((step) => `<li>${step}</li>`).join("");
  }

  function applyExample(root, example) {
    const form = root.querySelector("form");
    if (!form) return;
    form.elements.investment.value = example.investment;
    form.elements.financialAnnual.value = example.financialAnnual;
    form.elements.positiveAnnual.value = example.positiveAnnual;
    form.elements.negativeAnnual.value = example.negativeAnnual;
    form.elements.systemAnnual.value = example.systemAnnual;
    form.elements.years.value = example.years;
    form.elements.transform.value = example.transform;
    form.elements.time.value = example.time;
    form.elements.resilience.value = example.resilience;
    form.elements.quality.value = example.quality;
    form.elements.mensch.value = example.scores.mensch;
    form.elements.planet.value = example.scores.planet;
    form.elements.demokratie.value = example.scores.demokratie;
  }

  function calculate(root, config) {
    const form = root.querySelector("form");
    const investment = Math.max(1, number(form.elements.investment.value, 1));
    const financialAnnual = number(form.elements.financialAnnual.value);
    const positiveAnnual = number(form.elements.positiveAnnual.value);
    const negativeAnnual = number(form.elements.negativeAnnual.value);
    const systemAnnual = number(form.elements.systemAnnual.value);
    const years = Math.max(1, Math.round(number(form.elements.years.value, 1)));
    const transform = Math.max(0, number(form.elements.transform.value, 1));
    const time = Math.max(0, number(form.elements.time.value, 1));
    const resilience = Math.max(0, number(form.elements.resilience.value, 1));
    const quality = Math.max(0, Math.min(1, number(form.elements.quality.value, 1)));
    const scores = [score(form.elements.mensch.value), score(form.elements.planet.value), score(form.elements.demokratie.value)];
    const finalScore = Math.min(...scores);
    const nwi = scores.reduce((sum, item) => sum + item, 0) / scores.length;
    const financialReturn = financialAnnual * years;
    const directNetAnnual = positiveAnnual - negativeAnnual - systemAnnual;
    const netImpact = directNetAnnual * years;
    const transformedImpact = netImpact * transform * time * resilience * quality;
    const roi = financialReturn / investment;
    const ioi = netImpact / investment;
    const tsroi = transformedImpact / investment;
    const selected = config.examples[form.elements.preset.value];

    setText(root, "roi", `${decimal(roi)} : 1`);
    setText(root, "nwi", signed(nwi));
    setText(root, "finalScore", finalScore > 0 ? `+${finalScore}` : String(finalScore));
    setText(root, "ioi", `${decimal(ioi)} EUR/EUR`);
    setText(root, "tsroi", `${decimal(tsroi)} : 1`);
    setText(root, "netImpact", currency.format(netImpact));
    setText(root, "financialReturn", currency.format(financialReturn));
    setText(root, "interpretation", selected?.interpretation || "Modellhafte Demonstration mit offen ausgewiesenen Annahmen.");
    setSteps(root, [
      `Finanzrückfluss: ${currency.format(financialAnnual)} x ${years} Jahre = ${currency.format(financialReturn)}; ROI = ${currency.format(financialReturn)} / ${currency.format(investment)} = ${decimal(roi)} : 1.`,
      `Positive Netto-Wirkung: (${currency.format(positiveAnnual)} - ${currency.format(negativeAnnual)} - ${currency.format(systemAnnual)}) x ${years} Jahre = ${currency.format(netImpact)}; IOI = ${decimal(ioi)} EUR je investiertem Euro.`,
      `T-SROI: ${currency.format(netImpact)} x ${decimal(transform)} x ${decimal(time)} x ${decimal(resilience)} x ${decimal(quality)} / ${currency.format(investment)} = ${decimal(tsroi)} : 1.`,
      `NWI: (${scores.map((item) => (item > 0 ? `+${item}` : String(item))).join(" + ")}) / 3 = ${signed(nwi)}; FinalScore nach Reverse Merit Order = ${finalScore > 0 ? `+${finalScore}` : String(finalScore)}.`,
    ]);
  }

  document.querySelectorAll("[data-impact-investment-calculator]").forEach((root) => {
    const type = root.getAttribute("data-impact-investment-calculator");
    const config = calculators[type];
    const form = root.querySelector("form");
    if (!config || !form) return;

    form.elements.preset.addEventListener("change", () => {
      const example = config.examples[form.elements.preset.value];
      if (example) applyExample(root, example);
      calculate(root, config);
    });
    form.addEventListener("input", () => calculate(root, config));
    form.elements.preset.dispatchEvent(new Event("change"));
  });
})();
