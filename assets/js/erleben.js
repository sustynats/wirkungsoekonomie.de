const currencyFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const coreFields = ["Klima", "Ressourcen & Kreislauf", "Arbeit & Fairness", "Gesundheit & Sicherheit"];

const archetypes = {
  higher: {
    label: "Je höher, desto besser",
    score(value, thresholds) {
      const [bad, neutral, good] = thresholds;
      const x = clamp(Number(value), 0, 100);
      if (x <= bad) return -3;
      if (x <= neutral) return lerp(-3, 0, (x - bad) / (neutral - bad));
      if (x <= good) return lerp(0, 3, (x - neutral) / (good - neutral));
      return 3;
    }
  },
  lower: {
    label: "Je niedriger, desto besser",
    score(value, thresholds) {
      const [bad, neutral, good] = thresholds;
      const x = Number(value);
      if (x >= bad) return -3;
      if (x >= neutral) return lerp(-3, 0, (bad - x) / (bad - neutral));
      if (x >= good) return lerp(0, 3, (neutral - x) / (neutral - good));
      return 3;
    }
  },
  zero: {
    label: "Nahe null ist Ziel",
    score(value, thresholds) {
      const [bad, neutral, good] = thresholds;
      const x = Number(value);
      if (x <= good) return 3;
      if (x <= neutral) return lerp(3, 0, (x - good) / (neutral - good));
      if (x <= bad) return lerp(0, -3, (x - neutral) / (bad - neutral));
      return -3;
    }
  }
};

const products = {
  tshirt: {
    name: "T-Shirt",
    description: "Textile Lieferkette mit Wasser, Fairness, Chemikalien und Kreislaufanteilen.",
    components: [
      {
        id: "cotton",
        name: "Baumwolle / Garn",
        sdgs: ["SDG 6 Wasser", "SDG 8 Arbeit", "SDG 12 Kreislauf"],
        suppliers: [
          {
            id: "a",
            name: "Lieferant A (konventionell)",
            price: 2,
            indicators: [
              indicator("CO2e Baumwolle", "kg", "Klima", "SDG 13", "GRI 305; ESRS E1", "lower", [8, 5, 2], 7.2, "LCA"),
              indicator("Wasserintensität", "L/kg", "Ressourcen & Kreislauf", "SDG 6", "GRI 303; ESRS E3", "lower", [12000, 8000, 3000], 10000, "Werksreport"),
              indicator("Living-Wage-Coverage", "%", "Arbeit & Fairness", "SDG 8", "GRI 2-30/401; ESRS S1", "higher", [30, 50, 90], 40, "Sozialaudit"),
              indicator("Rezyklatanteil Faser", "%", "Ressourcen & Kreislauf", "SDG 12", "GRI 301-2; ESRS E5", "higher", [10, 30, 80], 15, "Materialpass")
            ]
          },
          {
            id: "b",
            name: "Lieferant B (verbessert)",
            price: 2.8,
            indicators: [
              indicator("CO2e Baumwolle", "kg", "Klima", "SDG 13", "GRI 305; ESRS E1", "lower", [8, 5, 2], 4.3, "LCA"),
              indicator("Wasserintensität", "L/kg", "Ressourcen & Kreislauf", "SDG 6", "GRI 303; ESRS E3", "lower", [12000, 8000, 3000], 4500, "LCA"),
              indicator("Living-Wage-Coverage", "%", "Arbeit & Fairness", "SDG 8", "GRI 2-30/401; ESRS S1", "higher", [30, 50, 90], 80, "Payroll"),
              indicator("Rezyklatanteil Faser", "%", "Ressourcen & Kreislauf", "SDG 12", "GRI 301-2; ESRS E5", "higher", [10, 30, 80], 55, "Materialpass")
            ]
          },
          {
            id: "c",
            name: "Lieferant Z (regenerativ / bio)",
            price: 3.2,
            indicators: [
              indicator("CO2e Baumwolle", "kg", "Klima", "SDG 13", "GRI 305; ESRS E1", "lower", [8, 5, 2], 2.2, "LCA"),
              indicator("Wasserintensität", "L/kg", "Ressourcen & Kreislauf", "SDG 6", "GRI 303; ESRS E3", "lower", [12000, 8000, 3000], 3200, "LCA"),
              indicator("Living-Wage-Coverage", "%", "Arbeit & Fairness", "SDG 8", "GRI 2-30/401; ESRS S1", "higher", [30, 50, 90], 92, "Audit"),
              indicator("Rezyklatanteil Faser", "%", "Ressourcen & Kreislauf", "SDG 12", "GRI 301-2; ESRS E5", "higher", [10, 30, 80], 70, "Materialpass")
            ]
          }
        ]
      },
      {
        id: "dye",
        name: "Färben / Waschen",
        sdgs: ["SDG 6 Wasser", "SDG 12 Chemikalien", "SDG 3 Sicherheit"],
        suppliers: [
          {
            id: "a",
            name: "Dyehouse X (Standard)",
            price: 1.2,
            indicators: [
              indicator("CO2e Färben", "kg", "Klima", "SDG 13", "GRI 305; ESRS E1", "lower", [4, 2.5, 1], 3.7, "Energie"),
              indicator("Abwasser-COD", "mg/L", "Ressourcen & Kreislauf", "SDG 6", "GRI 303; ESRS E3", "lower", [250, 125, 50], 200, "WWTP"),
              indicator("Gefahrstoff-Substitution", "%", "Gesundheit & Sicherheit", "SDG 3", "GRI 416", "higher", [20, 50, 90], 30, "SDS")
            ]
          },
          {
            id: "b",
            name: "Dyehouse Y (Niedrig-Impact)",
            price: 1.6,
            indicators: [
              indicator("CO2e Färben", "kg", "Klima", "SDG 13", "GRI 305; ESRS E1", "lower", [4, 2.5, 1], 1.6, "Energie"),
              indicator("Abwasser-COD", "mg/L", "Ressourcen & Kreislauf", "SDG 6", "GRI 303; ESRS E3", "lower", [250, 125, 50], 90, "WWTP"),
              indicator("Gefahrstoff-Substitution", "%", "Gesundheit & Sicherheit", "SDG 3", "GRI 416", "higher", [20, 50, 90], 75, "SDS")
            ]
          }
        ]
      },
      {
        id: "sew",
        name: "Nähen / Veredelung",
        sdgs: ["SDG 8 Arbeit", "SDG 12 Kreislauf", "SDG 3 Sicherheit"],
        suppliers: [
          {
            id: "a",
            name: "Lieferant C (Standard)",
            price: 1.8,
            indicators: [
              indicator("CO2e Veredelung", "kg", "Klima", "SDG 13", "GRI 305; ESRS E1", "lower", [3, 1.8, 0.8], 2.5, "Energie"),
              indicator("Arbeitsunfälle", "pro Mio. Std.", "Gesundheit & Sicherheit", "SDG 3", "GRI 403; ESRS S1", "zero", [8, 3, 0], 4, "HSE"),
              indicator("Abfall-Reuse / Recycling", "%", "Ressourcen & Kreislauf", "SDG 12", "GRI 306; ESRS E5", "higher", [20, 50, 90], 40, "Abfall")
            ]
          },
          {
            id: "b",
            name: "Lieferant D (fortschrittlich)",
            price: 2.2,
            indicators: [
              indicator("CO2e Veredelung", "kg", "Klima", "SDG 13", "GRI 305; ESRS E1", "lower", [3, 1.8, 0.8], 1.1, "Energie"),
              indicator("Arbeitsunfälle", "pro Mio. Std.", "Gesundheit & Sicherheit", "SDG 3", "GRI 403; ESRS S1", "zero", [8, 3, 0], 1, "HSE"),
              indicator("Abfall-Reuse / Recycling", "%", "Ressourcen & Kreislauf", "SDG 12", "GRI 306; ESRS E5", "higher", [20, 50, 90], 85, "Bilanz")
            ]
          },
          {
            id: "c",
            name: "Lieferant E (Lean + LW)",
            price: 2,
            indicators: [
              indicator("CO2e Veredelung", "kg", "Klima", "SDG 13", "GRI 305; ESRS E1", "lower", [3, 1.8, 0.8], 1.5, "Energie"),
              indicator("Arbeitsunfälle", "pro Mio. Std.", "Gesundheit & Sicherheit", "SDG 3", "GRI 403; ESRS S1", "zero", [8, 3, 0], 2, "HSE"),
              indicator("Abfall-Reuse / Recycling", "%", "Ressourcen & Kreislauf", "SDG 12", "GRI 306; ESRS E5", "higher", [20, 50, 90], 70, "Bilanz")
            ]
          }
        ]
      }
    ]
  },
  pliers: {
    name: "Zange",
    description: "Industrieprodukt mit Materialeffizienz, Prozessqualität, Chemikalien und Logistik.",
    components: [
      {
        id: "steel",
        name: "Stahl / Rohteil",
        sdgs: ["SDG 12 Materialeffizienz", "SDG 9 Prozess", "SDG 8 Arbeit"],
        suppliers: [
          {
            id: "a",
            name: "Lieferant E (konventionell)",
            price: 4,
            indicators: [
              indicator("CO2e Stahlrohteil", "kg", "Klima", "SDG 13", "GRI 305; ESRS E1", "lower", [5, 3, 1], 4.4, "LCA"),
              indicator("Rezyklatanteil Stahl", "%", "Ressourcen & Kreislauf", "SDG 12", "GRI 301-2; ESRS E5", "higher", [20, 40, 90], 25, "Werkstoff"),
              indicator("Prozess-Ausschuss", "%", "Ressourcen & Kreislauf", "SDG 9", "GRI 302/306; ESRS E5", "lower", [15, 8, 2], 10, "Qualität")
            ]
          },
          {
            id: "b",
            name: "Lieferant F (Recyclingstahl)",
            price: 4.8,
            indicators: [
              indicator("CO2e Stahlrohteil", "kg", "Klima", "SDG 13", "GRI 305; ESRS E1", "lower", [5, 3, 1], 2.2, "LCA"),
              indicator("Rezyklatanteil Stahl", "%", "Ressourcen & Kreislauf", "SDG 12", "GRI 301-2; ESRS E5", "higher", [20, 40, 90], 70, "Werkstoff"),
              indicator("Prozess-Ausschuss", "%", "Ressourcen & Kreislauf", "SDG 9", "GRI 302/306; ESRS E5", "lower", [15, 8, 2], 3, "Qualität")
            ]
          },
          {
            id: "c",
            name: "Lieferant Q (Grünstahl)",
            price: 5.2,
            indicators: [
              indicator("CO2e Stahlrohteil", "kg", "Klima", "SDG 13", "GRI 305; ESRS E1", "lower", [5, 3, 1], 1, "LCA"),
              indicator("Rezyklatanteil Stahl", "%", "Ressourcen & Kreislauf", "SDG 12", "GRI 301-2; ESRS E5", "higher", [20, 40, 90], 85, "Werkstoff"),
              indicator("Prozess-Ausschuss", "%", "Ressourcen & Kreislauf", "SDG 9", "GRI 302/306; ESRS E5", "lower", [15, 8, 2], 2, "Qualität")
            ]
          }
        ]
      },
      {
        id: "handle",
        name: "Griffe / Veredelung",
        sdgs: ["SDG 12 Chemikalien", "SDG 3 Produktsicherheit", "SDG 8 Arbeit"],
        suppliers: [
          {
            id: "a",
            name: "Lieferant G (Standard-PVC)",
            price: 1.5,
            indicators: [
              indicator("CO2e Griffbeschichtung", "kg", "Klima", "SDG 13", "GRI 305; ESRS E1", "lower", [1.4, 0.8, 0.3], 1.2, "Energie"),
              indicator("REACH-Fälle", "pro Jahr", "Gesundheit & Sicherheit", "SDG 3", "GRI 416 / REACH", "zero", [6, 2, 0], 3, "Compliance"),
              indicator("Lösemittel-Recovery", "%", "Ressourcen & Kreislauf", "SDG 12", "GRI 306; ESRS E2/E5", "higher", [20, 50, 90], 35, "Umwelt")
            ]
          },
          {
            id: "b",
            name: "Lieferant H (Low-tox Coating)",
            price: 2,
            indicators: [
              indicator("CO2e Griffbeschichtung", "kg", "Klima", "SDG 13", "GRI 305; ESRS E1", "lower", [1.4, 0.8, 0.3], 0.45, "Energie"),
              indicator("REACH-Fälle", "pro Jahr", "Gesundheit & Sicherheit", "SDG 3", "GRI 416 / REACH", "zero", [6, 2, 0], 0, "Compliance"),
              indicator("Lösemittel-Recovery", "%", "Ressourcen & Kreislauf", "SDG 12", "GRI 306; ESRS E2/E5", "higher", [20, 50, 90], 75, "Umwelt")
            ]
          }
        ]
      },
      {
        id: "pack",
        name: "Verpackung / Logistik",
        sdgs: ["SDG 12 Material", "SDG 13 Klima", "SDG 8 Arbeit"],
        suppliers: [
          {
            id: "a",
            name: "Standard (Karton + LKW)",
            price: 0.6,
            indicators: [
              indicator("CO2e Verpackung & Transport", "kg", "Klima", "SDG 13", "GRI 305; ESRS E1", "lower", [1.2, 0.7, 0.25], 0.9, "LCA"),
              indicator("Rezyklatgehalt Karton", "%", "Ressourcen & Kreislauf", "SDG 12", "GRI 301-2", "higher", [30, 60, 95], 50, "LCA"),
              indicator("Arbeitsunfälle", "pro Mio. Std.", "Gesundheit & Sicherheit", "SDG 8", "GRI 403", "zero", [8, 3, 0], 3, "HSE")
            ]
          },
          {
            id: "b",
            name: "Optimiert (Re-Karton + Schiene)",
            price: 0.8,
            indicators: [
              indicator("CO2e Verpackung & Transport", "kg", "Klima", "SDG 13", "GRI 305; ESRS E1", "lower", [1.2, 0.7, 0.25], 0.3, "LCA"),
              indicator("Rezyklatgehalt Karton", "%", "Ressourcen & Kreislauf", "SDG 12", "GRI 301-2", "higher", [30, 60, 95], 85, "LCA"),
              indicator("Arbeitsunfälle", "pro Mio. Std.", "Gesundheit & Sicherheit", "SDG 8", "GRI 403", "zero", [8, 3, 0], 1, "Ergonomie")
            ]
          }
        ]
      }
    ]
  },
  laptop: {
    name: "Laptop",
    description: "Elektronik mit zirkulären Metallen, Produktsicherheit, Fairness und Modulmontage.",
    components: [
      {
        id: "pcb",
        name: "Hauptplatine / Elektronik",
        sdgs: ["SDG 12 Zirkularität", "SDG 3 Sicherheit", "SDG 8 Arbeit"],
        suppliers: [
          {
            id: "a",
            name: "Lieferant I (Standard-PCB)",
            price: 120,
            indicators: [
              indicator("CO2e Hauptplatine", "kg", "Klima", "SDG 13", "GRI 305; ESRS E1", "lower", [90, 55, 25], 75, "LCA"),
              indicator("Rezyklatanteil Metalle", "%", "Ressourcen & Kreislauf", "SDG 12", "GRI 301-2; ESRS E5", "higher", [10, 30, 80], 20, "Pass"),
              indicator("Rückrufe", "pro Jahr", "Gesundheit & Sicherheit", "SDG 3", "GRI 416", "zero", [6, 2, 0], 2, "QA"),
              indicator("Living-Wage-Coverage", "%", "Arbeit & Fairness", "SDG 8", "GRI 2-30/401; ESRS S1", "higher", [30, 50, 90], 45, "Audit")
            ]
          },
          {
            id: "b",
            name: "Lieferant J (Circular-PCB)",
            price: 140,
            indicators: [
              indicator("CO2e Hauptplatine", "kg", "Klima", "SDG 13", "GRI 305; ESRS E1", "lower", [90, 55, 25], 42, "LCA"),
              indicator("Rezyklatanteil Metalle", "%", "Ressourcen & Kreislauf", "SDG 12", "GRI 301-2; ESRS E5", "higher", [10, 30, 80], 65, "Pass"),
              indicator("Rückrufe", "pro Jahr", "Gesundheit & Sicherheit", "SDG 3", "GRI 416", "zero", [6, 2, 0], 0, "QA"),
              indicator("Living-Wage-Coverage", "%", "Arbeit & Fairness", "SDG 8", "GRI 2-30/401; ESRS S1", "higher", [30, 50, 90], 85, "Audit")
            ]
          },
          {
            id: "c",
            name: "Lieferant M (Low-impact + LW)",
            price: 150,
            indicators: [
              indicator("CO2e Hauptplatine", "kg", "Klima", "SDG 13", "GRI 305; ESRS E1", "lower", [90, 55, 25], 32, "LCA"),
              indicator("Rezyklatanteil Metalle", "%", "Ressourcen & Kreislauf", "SDG 12", "GRI 301-2; ESRS E5", "higher", [10, 30, 80], 75, "Pass"),
              indicator("Rückrufe", "pro Jahr", "Gesundheit & Sicherheit", "SDG 3", "GRI 416", "zero", [6, 2, 0], 0, "QA"),
              indicator("Living-Wage-Coverage", "%", "Arbeit & Fairness", "SDG 8", "GRI 2-30/401; ESRS S1", "higher", [30, 50, 90], 92, "Audit")
            ]
          }
        ]
      },
      {
        id: "battery",
        name: "Batterie / Module",
        sdgs: ["SDG 12 Material", "SDG 8 Arbeit", "SDG 3 Sicherheit"],
        suppliers: [
          {
            id: "a",
            name: "Zellfertiger R (Standard)",
            price: 80,
            indicators: [
              indicator("CO2e Batteriemodul", "kg", "Klima", "SDG 13", "GRI 305; ESRS E1", "lower", [70, 40, 18], 58, "LCA"),
              indicator("Rezyklatanteil Co/Ni", "%", "Ressourcen & Kreislauf", "SDG 12", "GRI 301-2", "higher", [5, 20, 60], 15, "Pass"),
              indicator("Unfälle", "pro Mio. Std.", "Gesundheit & Sicherheit", "SDG 3", "GRI 403", "zero", [8, 3, 0], 3, "HSE")
            ]
          },
          {
            id: "b",
            name: "Zellfertiger S (Re-Metalle)",
            price: 95,
            indicators: [
              indicator("CO2e Batteriemodul", "kg", "Klima", "SDG 13", "GRI 305; ESRS E1", "lower", [70, 40, 18], 25, "LCA"),
              indicator("Rezyklatanteil Co/Ni", "%", "Ressourcen & Kreislauf", "SDG 12", "GRI 301-2", "higher", [5, 20, 60], 55, "Pass"),
              indicator("Unfälle", "pro Mio. Std.", "Gesundheit & Sicherheit", "SDG 3", "GRI 403", "zero", [8, 3, 0], 1, "Sicherheit")
            ]
          }
        ]
      },
      {
        id: "casing",
        name: "Gehäuse / Endmontage",
        sdgs: ["SDG 12 Material", "SDG 8 Arbeit", "SDG 3 Sicherheit"],
        suppliers: [
          {
            id: "a",
            name: "Lieferant K (Alu Druckguss)",
            price: 60,
            indicators: [
              indicator("CO2e Gehäuse", "kg", "Klima", "SDG 13", "GRI 305; ESRS E1", "lower", [45, 25, 10], 34, "LCA"),
              indicator("Rezyklatanteil Alu", "%", "Ressourcen & Kreislauf", "SDG 12", "GRI 301-2; ESRS E5", "higher", [20, 50, 90], 35, "Pass"),
              indicator("Unfälle", "pro Mio. Std.", "Gesundheit & Sicherheit", "SDG 3", "GRI 403", "zero", [8, 3, 0], 3, "HSE")
            ]
          },
          {
            id: "b",
            name: "Lieferant L (Re-Alu + Ergonomie)",
            price: 75,
            indicators: [
              indicator("CO2e Gehäuse", "kg", "Klima", "SDG 13", "GRI 305; ESRS E1", "lower", [45, 25, 10], 14, "LCA"),
              indicator("Rezyklatanteil Alu", "%", "Ressourcen & Kreislauf", "SDG 12", "GRI 301-2; ESRS E5", "higher", [20, 50, 90], 80, "Pass"),
              indicator("Unfälle", "pro Mio. Std.", "Gesundheit & Sicherheit", "SDG 3", "GRI 403", "zero", [8, 3, 0], 1, "Ergonomie")
            ]
          }
        ]
      }
    ]
  }
};

const simulator = document.querySelector("[data-simulator]");
const productSelect = document.querySelector("[data-product-select]");
const productDescription = document.querySelector("[data-product-description]");
const componentList = document.querySelector("[data-component-list]");
const weakestFieldEl = document.querySelector("[data-weakest-field]");
const finalScoreEl = document.querySelector("[data-final-score]");
const taxRateEl = document.querySelector("[data-tax-rate]");
const totalPriceEl = document.querySelector("[data-total-price]");
const productExplanationEl = document.querySelector("[data-product-explanation]");
const productFeedbackEl = document.querySelector("[data-product-feedback]");
const priceSummaryEl = document.querySelector("[data-price-summary]");
const barsEl = document.querySelector("[data-impact-bars]");
const presetButtons = Array.from(document.querySelectorAll("[data-preset]"));

let currentProductKey = "tshirt";
let selections = {};

function indicator(label, unit, core, sdg, gri, archetype, thresholds, value, source) {
  return { label, unit, core, sdg, gri, archetype, thresholds, value, source };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start, end, ratio) {
  return start + (end - start) * clamp(ratio, 0, 1);
}

function scoreIndicator(indicatorData) {
  return archetypes[indicatorData.archetype].score(indicatorData.value, indicatorData.thresholds);
}

function formatScore(score) {
  return score.toFixed(2).replace(".", ",");
}

function formatValue(indicatorData) {
  return `${indicatorData.value.toLocaleString("de-DE")} ${indicatorData.unit}`;
}

function taxRateFromScore(score) {
  if (score >= 2) return 0;
  if (score >= 1) return 0.05;
  if (score >= 0) return 0.1;
  if (score >= -1) return 0.15;
  if (score >= -2) return 0.2;
  return 0.25;
}

function bonusRateFromScore(score) {
  if (score < 1) return 0;
  if (score < 2) return 0.1;
  if (score < 3) return 0.2;
  return 0.3;
}

function malusRateFromScore(score) {
  if (score >= 0) return 0;
  if (score <= -2.5) return 0.3;
  if (score <= -1.5) return 0.2;
  return 0.1;
}

function toneFromScore(score) {
  if (score >= 1) return "tone-good";
  if (score >= 0) return "tone-mid";
  return "tone-bad";
}

function getProduct() {
  return products[currentProductKey];
}

function getSelectedSupplier(component) {
  const selectedId = selections[component.id] || component.suppliers[0].id;
  return component.suppliers.find((supplier) => supplier.id === selectedId) || component.suppliers[0];
}

function computeComponent(component, supplierId = null) {
  const supplier = supplierId
    ? component.suppliers.find((item) => item.id === supplierId)
    : getSelectedSupplier(component);
  const perCore = Object.fromEntries(coreFields.map((field) => [field, 3]));
  const indicatorScores = supplier.indicators.map((item) => {
    const score = scoreIndicator(item);
    perCore[item.core] = Math.min(perCore[item.core], score);
    return { ...item, score };
  });
  const componentScore = Math.min(...coreFields.map((field) => perCore[field]));
  return { supplier, perCore, indicatorScores, componentScore };
}

function computeProduct() {
  const product = getProduct();
  const coreScores = Object.fromEntries(coreFields.map((field) => [field, 3]));
  let net = 0;
  let bonus = 0;
  let malus = 0;
  let nonDeductibleTax = 0;
  const components = [];

  for (const component of product.components) {
    const result = computeComponent(component);
    for (const field of coreFields) {
      coreScores[field] = Math.min(coreScores[field], result.perCore[field]);
    }
    components.push({ component, ...result });
  }

  let weakestField = coreFields[0];
  for (const field of coreFields) {
    if (coreScores[field] < coreScores[weakestField]) {
      weakestField = field;
    }
  }

  const finalScore = coreScores[weakestField];
  const taxRate = taxRateFromScore(finalScore);

  for (const item of components) {
    const bonusRate = bonusRateFromScore(item.componentScore);
    const taxableBase = Math.max(0, item.supplier.price * (1 - bonusRate));
    const itemMalus = taxableBase * malusRateFromScore(item.componentScore);
    const itemTax = item.componentScore < 0 ? taxableBase * taxRate : 0;
    net += item.supplier.price;
    bonus += item.supplier.price * bonusRate;
    malus += itemMalus;
    nonDeductibleTax += itemTax;
  }

  return {
    coreScores,
    weakestField,
    finalScore,
    taxRate,
    totals: {
      net,
      bonus,
      malus,
      nonDeductibleTax,
      grand: net - bonus + malus + nonDeductibleTax
    },
    components
  };
}

function renderProductOptions() {
  if (!productSelect) return;
  productSelect.innerHTML = Object.entries(products)
    .map(([key, product]) => `<option value="${key}">${product.name}</option>`)
    .join("");
  productSelect.value = currentProductKey;
}

function renderComponents() {
  const product = getProduct();
  productDescription.textContent = product.description;
  componentList.innerHTML = product.components.map(renderComponent).join("");
}

function renderComponent(component) {
  const result = computeComponent(component);
  const supplierOptions = component.suppliers
    .map((supplier) => {
      const selected = supplier.id === result.supplier.id ? " selected" : "";
      const supplierResult = computeComponent(component, supplier.id);
      return `<option value="${supplier.id}"${selected}>${supplier.name} - ${currencyFormatter.format(supplier.price)} - Score ${formatScore(supplierResult.componentScore)}</option>`;
    })
    .join("");
  const indicators = result.indicatorScores
    .map((item) => `
      <tr>
        <td>${item.label}<br><span class="card-text">${item.sdg} · ${item.gri}</span></td>
        <td>${formatValue(item)}</td>
        <td>${archetypes[item.archetype].label}<br><span class="card-text">${item.thresholds.join(" / ")}</span></td>
        <td><span class="score-pill ${toneFromScore(item.score)}">${formatScore(item.score)}</span></td>
      </tr>
    `)
    .join("");

  return `
    <article class="component-card">
      <div class="component-head">
        <div>
          <p class="hero-kicker">Komponente</p>
          <h3>${component.name}</h3>
          <div class="component-meta">${component.sdgs.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
        </div>
        <div>
          <label class="control-label" for="supplier-${component.id}">
            Lieferant wählen
            <select id="supplier-${component.id}" data-supplier-select="${component.id}">
              ${supplierOptions}
            </select>
          </label>
          <div class="supplier-actions">
            <span class="score-pill ${toneFromScore(result.componentScore)}">Score ${formatScore(result.componentScore)}</span>
            <span class="tag">${currencyFormatter.format(result.supplier.price)} netto</span>
          </div>
        </div>
      </div>
      <table class="indicator-table">
        <thead>
          <tr>
            <th>Indikator</th>
            <th>Wert</th>
            <th>Logik / Schwellen</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>${indicators}</tbody>
      </table>
    </article>
  `;
}

function renderResults() {
  const result = computeProduct();
  weakestFieldEl.textContent = result.weakestField;
  finalScoreEl.textContent = formatScore(result.finalScore);
  finalScoreEl.className = `score-pill ${toneFromScore(result.finalScore)}`;
  taxRateEl.textContent = `${Math.round(result.taxRate * 100)} %`;
  taxRateEl.className = `score-pill ${toneFromScore(result.finalScore)}`;
  totalPriceEl.textContent = currencyFormatter.format(result.totals.grand);
  if (productExplanationEl) {
    productExplanationEl.textContent = `Der Score folgt dem schwächsten Wirkungsfeld "${result.weakestField}". Dadurch wird sichtbar, wo die Lieferkette zuerst verbessert werden müsste.`;
  }
  if (productFeedbackEl) {
    productFeedbackEl.textContent = result.finalScore < 0
      ? "Negative Wirkung erzeugt Malus und Steuerdruck. Bessere Lieferanten würden Kostenrisiken senken und Kapital in resilientere Wertschöpfung lenken."
      : "Positive Wirkung reduziert Belastungen. Gute Lieferanten werden nicht nur moralisch, sondern ökonomisch attraktiver.";
  }

  priceSummaryEl.innerHTML = `
    <div class="price-row"><span>Summe netto</span><strong>${currencyFormatter.format(result.totals.net)}</strong></div>
    <div class="price-row"><span>Bonus für positive Lieferanten</span><strong>- ${currencyFormatter.format(result.totals.bonus)}</strong></div>
    <div class="price-row"><span>Malus bei negativer Wirkung</span><strong>+ ${currencyFormatter.format(result.totals.malus)}</strong></div>
    <div class="price-row"><span>Nicht abzugsfähige Steuer</span><strong>+ ${currencyFormatter.format(result.totals.nonDeductibleTax)}</strong></div>
    <div class="price-row total"><span>Gesamtpreis</span><strong>${currencyFormatter.format(result.totals.grand)}</strong></div>
  `;

  barsEl.innerHTML = coreFields.map((field) => {
    const score = result.coreScores[field];
    const width = ((score + 3) / 6) * 100;
    return `
      <div class="impact-bar">
        <div class="impact-bar-heading"><span>${field}</span><span>${formatScore(score)}</span></div>
        <div class="impact-track"><div class="impact-fill ${toneFromScore(score)}" style="width:${width}%"></div></div>
      </div>
    `;
  }).join("");
}

function refreshSimulator() {
  renderComponents();
  renderResults();
}

function ensureSelections() {
  const product = getProduct();
  for (const component of product.components) {
    if (!selections[component.id] || !component.suppliers.some((supplier) => supplier.id === selections[component.id])) {
      selections[component.id] = component.suppliers[0].id;
    }
  }
}

function applyPreset(type) {
  const product = getProduct();
  for (const component of product.components) {
    const ranked = component.suppliers
      .map((supplier) => ({ supplier, result: computeComponent(component, supplier.id) }))
      .sort((a, b) => {
        if (type === "cheap") return a.supplier.price - b.supplier.price;
        if (type === "best") return b.result.componentScore - a.result.componentScore || a.supplier.price - b.supplier.price;
        return Math.abs(1.5 - a.result.componentScore) - Math.abs(1.5 - b.result.componentScore) || a.supplier.price - b.supplier.price;
      });

    selections[component.id] = ranked[0].supplier.id;
  }

  presetButtons.forEach((button) => button.classList.toggle("active", button.dataset.preset === type));
  refreshSimulator();
}

function initSimulator() {
  if (!simulator) return;
  renderProductOptions();
  ensureSelections();
  refreshSimulator();

  productSelect.addEventListener("change", () => {
    currentProductKey = productSelect.value;
    selections = {};
    ensureSelections();
    presetButtons.forEach((button) => button.classList.remove("active"));
    refreshSimulator();
  });

  componentList.addEventListener("change", (event) => {
    const select = event.target.closest("[data-supplier-select]");
    if (!select) return;
    selections[select.dataset.supplierSelect] = select.value;
    presetButtons.forEach((button) => button.classList.remove("active"));
    refreshSimulator();
  });

  presetButtons.forEach((button) => {
    button.addEventListener("click", () => applyPreset(button.dataset.preset));
  });
}

function initCompass() {
  const compass = document.querySelector("[data-compass]");
  if (!compass) return;

  const inputs = Array.from(compass.querySelectorAll("input[type='range']"));
  const title = compass.querySelector("[data-compass-title]");
  const score = compass.querySelector("[data-compass-score]");
  const weakest = compass.querySelector("[data-compass-weakest]");
  const text = compass.querySelector("[data-compass-text]");
  const feedback = compass.querySelector("[data-compass-feedback]");

  function update() {
    const values = Object.fromEntries(inputs.map((input) => [input.name, Number(input.value)]));
    const impactScore = Math.round((values.tax + values.democracy + values.boundaries + (100 - values.price)) / 4);
    const weakestSignal = [
      ["Preisdominanz", 100 - values.price],
      ["Wirkungssteuer", values.tax],
      ["Demokratie", values.democracy],
      ["Planetare Grenzen", values.boundaries]
    ].sort((a, b) => a[1] - b[1])[0][0];
    let profile = "Berichtswesen";
    let description = "Wirkung wird sichtbar gemacht, aber sie verändert Preise und Prioritäten noch vorsichtig.";

    if (impactScore >= 72) {
      profile = "Wirkungssteuerung";
      description = "Die Entscheidung würde Wirkung als echte Steuerungsgröße nutzen: Preise, Risiken und Prioritäten verschieben sich sichtbar.";
    } else if (impactScore < 45) {
      profile = "Kapitalzentrierte Logik";
      description = "Kurzfristige Kosten dominieren. Wirkung bleibt eher Kommentar als Kriterium.";
    }

    title.textContent = profile;
    score.textContent = `${impactScore} / 100`;
    if (weakest) weakest.textContent = weakestSignal;
    text.textContent = description;
    if (feedback) {
      feedback.textContent = impactScore >= 72
        ? "Steuern, Investitionen und Sprache würden Wirkung aktiv zurück in Entscheidungen spiegeln."
        : impactScore < 45
          ? "Die Rückkopplung bleibt schwach: Kosten, Reichweite oder Kapital dominieren weiter die Entscheidung."
          : "Die Rückkopplung beginnt, braucht aber klarere Kriterien, Daten und Verantwortlichkeiten.";
    }
  }

  inputs.forEach((input) => input.addEventListener("input", update));
  update();
}

const truthProducts = {
  tshirt: {
    name: "T-Shirt",
    cheap: { label: "Billig im Laden", market: 7.99, hidden: 5.1, impact: 1.6 },
    fair: { label: "wirkungsökonomisch fair", market: 13.9, hidden: 1.4, impact: -2.3 }
  },
  burger: {
    name: "Burger",
    cheap: { label: "Billig im Laden", market: 4.49, hidden: 3.2, impact: 0.9 },
    fair: { label: "regional & regenerativ", market: 7.2, hidden: 0.8, impact: -1.1 }
  },
  phone: {
    name: "Smartphone",
    cheap: { label: "Kurzlebig", market: 399, hidden: 180, impact: 45 },
    fair: { label: "reparierbar & zirkulär", market: 529, hidden: 70, impact: -55 }
  }
};

const radarTopics = {
  "Wärmepumpe": {
    scores: { Mensch: 62, Planet: 86, Demokratie: 58, Kurzfristig: 42, Langfristig: 90 },
    note: "Kurzfristig entstehen Kosten- und Akzeptanzfragen; langfristig sinken Klima- und Abhängigkeitsrisiken."
  },
  "Social Media": {
    scores: { Mensch: 38, Planet: 52, Demokratie: 24, Kurzfristig: 72, Langfristig: 28 },
    note: "Hohe kurzfristige Reichweite kann langfristig Orientierung, Vertrauen und Diskursfähigkeit belasten."
  },
  Pflege: {
    scores: { Mensch: 84, Planet: 46, Demokratie: 68, Kurzfristig: 55, Langfristig: 88 },
    note: "Gute Pflege wirkt weit über Einzelfälle hinaus: Angehörige, Arbeitsmarkt, Würde und Vertrauen stabilisieren sich."
  },
  Auto: {
    scores: { Mensch: 45, Planet: 31, Demokratie: 50, Kurzfristig: 76, Langfristig: 34 },
    note: "Bequemlichkeit und Status stehen Folgekosten bei Fläche, Klima, Gesundheit und Infrastruktur gegenüber."
  },
  Miete: {
    scores: { Mensch: 78, Planet: 48, Demokratie: 74, Kurzfristig: 58, Langfristig: 82 },
    note: "Wohnkosten wirken direkt auf Teilhabe, Vertrauen, Familienplanung und kommunale Stabilität."
  }
};

const policyMeasures = {
  "Energiepreisdeckel": [
    ["Erstwirkung", "Haushalte werden kurzfristig entlastet; politische Spannung sinkt."],
    ["Zweitwirkung", "Preissignale werden schwächer; Einspar- und Investitionsanreize können sinken."],
    ["Drittwirkung", "Wenn befristet und zielgenau, stabilisiert Vertrauen. Wenn breit und dauerhaft, steigen Folgekosten."]
  ],
  "Kostenlose Kita": [
    ["Erstwirkung", "Familien werden entlastet, Erwerbsbeteiligung wird leichter."],
    ["Zweitwirkung", "Fachkräftebedarf und Qualitätsfragen werden sichtbarer."],
    ["Drittwirkung", "Langfristig steigen Bildungschancen, Teilhabe und soziale Stabilität, wenn Qualität mitwächst."]
  ],
  "Tempolimit": [
    ["Erstwirkung", "Geringere Emissionen, weniger schwere Unfälle, aber Akzeptanzkonflikte."],
    ["Zweitwirkung", "Normen für Sicherheit und Ressourcenschutz verschieben sich."],
    ["Drittwirkung", "Vertrauen hängt daran, ob die Maßnahme als fair, wirksam und nachvollziehbar erlebt wird."]
  ],
  "Mietpreisbremse": [
    ["Erstwirkung", "Bestandsmieter werden entlastet; Renditeerwartungen sinken."],
    ["Zweitwirkung", "Investitions- und Angebotsreaktionen können regional unterschiedlich ausfallen."],
    ["Drittwirkung", "Wirksam wird sie erst mit Neubau, Bestandsschutz, Bodennutzung und sozialer Infrastruktur zusammen."]
  ]
};

const cycleSteps = [
  ["Produkt", "Ein Produkt startet nicht beim Preis, sondern bei Material, Arbeit, Energie und Nutzungskontext."],
  ["Nutzung", "Die Nutzung erzeugt Nutzen, aber auch Verbrauch, Risiken, Bindungen oder Entlastungen."],
  ["Schäden / Nutzen", "Wirkung fragt: Welche Zustände verändern sich bei Mensch, Planet und Demokratie?"],
  ["Preise / Steuern", "Positive Wirkung kann entlastet werden; negative Wirkung wird sichtbar und belastet."],
  ["Kapitalflüsse", "Kapital folgt nicht nur Rendite, sondern besserer Wirkung bei gleicher Funktion."],
  ["Verhalten", "Unternehmen, Haushalte und Politik ändern Entscheidungen, weil Rückkopplung spürbar wird."],
  ["Neue Zustände", "Das System lernt: weniger Reparaturkosten, mehr Prävention, stabilere Grundlagen."]
];

const quizQuestions = [
  {
    question: "Was misst das BIP nicht?",
    options: ["Ob Aktivität Zukunft stabilisiert", "Ob Güter verkauft wurden", "Ob Einkommen entstanden ist"],
    answer: 0,
    feedback: "Genau: Das BIP misst Aktivität, aber nicht zuverlässig, ob daraus gute oder schlechte Wirkung entsteht."
  },
  {
    question: "Wann ist Wachstum wirkungsökonomisch problematisch?",
    options: ["Wenn es Folgekosten auslagert", "Wenn Unternehmen Gewinne machen", "Wenn es statistisch sichtbar wird"],
    answer: 0,
    feedback: "Richtig. Wachstum ist nicht automatisch schlecht; kritisch wird es, wenn es Mensch, Planet oder Demokratie destabilisiert."
  },
  {
    question: "Warum ist Wirkung nicht einfach Nachhaltigkeit?",
    options: ["Weil Wirkung reale Zustandsveränderungen bewertet", "Weil Wirkung nur Umwelt meint", "Weil Wirkung keine Daten braucht"],
    answer: 0,
    feedback: "Ja. Wirkung umfasst Umwelt, Soziales, Demokratie, Zeiträume und Rückkopplung in Entscheidungen."
  }
];

const mediaExamples = {
  constructive: {
    title: "Sachlicher Medienbericht zur Wärmewende",
    text: "Die kommunale Wärmewende bleibt umstritten. Der Bericht zeigt Kosten, Förderoptionen, Netzausbau und soziale Härten. Er zitiert Stadtwerk, Mieterverein und Energieberatung und erklärt, welche Annahmen noch unsicher sind.",
    scores: {
      "Wahrheit und Quellenklarheit": 2.2,
      "Kontext und Einordnung": 2,
      Emotionalisierung: 1.4,
      Polarisierungspotenzial: 1.6,
      Feindbildproduktion: 2.4,
      Demokratiewirkung: 1.8,
      Minderheitenschutz: 1.5,
      Diskursqualität: 2.1,
      "Transparenz von Meinung und Information": 2,
      "Manipulations- oder Desinformationsrisiko": 1.9
    },
    explanation: "Der Beitrag trennt Information und Bewertung, nennt Unsicherheiten und macht mehrere Perspektiven sichtbar. Das stärkt Orientierung, ohne Konflikte zu glätten."
  },
  polarizing: {
    title: "Polarisierende Schlagzeile zu Migration",
    text: "Schon wieder versagt die Politik: Diese Gruppen zerstören unser Land. Was verschwiegen wird, zeigt die ganze Wahrheit. Teilen, bevor es gelöscht wird.",
    scores: {
      "Wahrheit und Quellenklarheit": -1.8,
      "Kontext und Einordnung": -2.1,
      Emotionalisierung: -2.6,
      Polarisierungspotenzial: -2.7,
      Feindbildproduktion: -2.5,
      Demokratiewirkung: -2.2,
      Minderheitenschutz: -2.4,
      Diskursqualität: -2.5,
      "Transparenz von Meinung und Information": -1.9,
      "Manipulations- oder Desinformationsrisiko": -2.3
    },
    explanation: "Die Wirkung entsteht nicht dadurch, dass Meinung existiert, sondern durch Pauschalisierung, Feindbildlogik, Löschungsnarrativ und fehlende Quellenklarheit."
  },
  creator: {
    title: "Konstruktiver Creator-Beitrag",
    text: "Ich zeige heute drei Wege, wie Haushalte Energie sparen können, ohne jemanden zu beschämen. Die Zahlen stammen aus Verbraucherberatung und Stadtwerk. Schreibt eure Erfahrungen, ich ergänze Korrekturen.",
    scores: {
      "Wahrheit und Quellenklarheit": 1.7,
      "Kontext und Einordnung": 1.4,
      Emotionalisierung: 0.9,
      Polarisierungspotenzial: 1.2,
      Feindbildproduktion: 2.1,
      Demokratiewirkung: 1.5,
      Minderheitenschutz: 1.4,
      Diskursqualität: 1.8,
      "Transparenz von Meinung und Information": 1.6,
      "Manipulations- oder Desinformationsrisiko": 1.5
    },
    explanation: "Der Beitrag erzeugt Handlungsfähigkeit und lädt zu Korrektur ein. Reichweite wird nicht über Gegnerlogik, sondern über Nützlichkeit gesucht."
  }
};

const mediaSources = [
  "sichtbarer Text",
  "Quellenangaben",
  "Pressekodex",
  "Faktencheck-Datenbanken",
  "Plattformdaten",
  "Sentiment-Analyse",
  "Hate-Speech-Muster",
  "Netzwerkindikatoren"
];

const platformScenarios = {
  factual: {
    title: "Sachlicher Beitrag mit niedriger Erregung",
    base: 1.6,
    note: "Positive Orientierung entsteht, aber Plattformlogiken verstärken sie häufig schwächer als Konflikt."
  },
  outrage: {
    title: "Empörungsbeitrag mit Feindbild",
    base: -1.4,
    note: "Der Inhalt ist formal Meinung, kann aber durch algorithmische Verstärkung Vertrauen und Diskursqualität beschädigen."
  },
  correction: {
    title: "Korrektur und Faktencheck",
    base: 1.2,
    note: "Korrekturen stabilisieren Wahrheit, erreichen aber häufig weniger Netzwerke als der ursprüngliche Erregungsimpuls."
  }
};

const riskScenarios = {
  retail: {
    title: "Retail-Wertschöpfung unter Multikrisenstress",
    exposure: 1.08,
    explanation:
      "Im Retail treffen Klima, Geopolitik, Ressourcenpreise, soziale Risiken und Kapitalmarktbewertung direkt auf Sortiment, Lieferfähigkeit, Marge und Kundennachfrage. WÖk macht sichtbar, wo präventive Steuerung günstiger ist als Krisenmodus."
  },
  industry: {
    title: "Industrie mit energieintensiver Lieferkette",
    exposure: 1.18,
    explanation:
      "Energiepreise, Rohstoffabhängigkeiten, Transportwege und regulatorische Transparenzinstrumente wirken nicht nacheinander, sondern gleichzeitig. Resilienz entsteht durch Datenintegration, Szenarien und robuste Lieferantenentwicklung."
  },
  food: {
    title: "Lebensmittelkette zwischen Klima und Preisvolatilität",
    exposure: 1.14,
    explanation:
      "Dürren, Ernteausfälle, Wasserstress, Arbeitsbedingungen und Transportkosten können Versorgung und Preise schnell verschieben. Wirkungsorientierte Steuerung verbindet ökologische Realität mit ökonomischer Stabilität."
  }
};

const everydayExamples = [
  ["Apfel regional vs. Import", "Regional kann Transportwirkung senken, Import kann saisonal sinnvoll sein. Entscheidend sind Lagerung, Anbau, Wasser, Arbeit und Verluste.", "Preis würde Herkunft, Saison und Lagerenergie abbilden."],
  ["T-Shirt Fast Fashion vs. Fair Fashion", "Fast Fashion ist billig im Regal, aber teuer in Wasser, Arbeit, Chemie, Klima und Abfall.", "Steuern und Kapital würden langlebige, faire Lieferketten bevorzugen."],
  ["Haferdrink vs. Kuhmilch", "Nicht Identität entscheidet, sondern Fläche, Methan, Wasser, Tierwohl, Nährwert und regionale Struktur.", "Preise würden Umwelt- und Gesundheitsfolgen sichtbarer machen."],
  ["Kohle- vs. Solarstrom", "Kohle liefert planbare Leistung, aber hohe Klima- und Gesundheitskosten. Solar senkt Folgekosten, braucht Netze und Speicher.", "Kapital würde stärker in Systemresilienz statt Brennstoffabhängigkeit fließen."],
  ["Günstige Mietwohnung vs. Leerstand", "Günstige Miete stabilisiert Teilhabe. Spekulativer Leerstand entzieht Wohnraum und erzeugt soziale Folgekosten.", "Wirkungssteuer würde Leerstand unattraktiver machen."],
  ["Pflegearbeit vs. Finanzspekulation", "Pflege stabilisiert Leben, Angehörige und Arbeitsfähigkeit. Spekulation kann Kapital bewegen, ohne reale Wirkung zu erzeugen.", "Einkommen und Anerkennung würden stärker an systemischer Wirkung hängen."],
  ["Sachlicher vs. polarisierender Medienbericht", "Sachlichkeit stärkt Orientierung. Polarisierung kann Reichweite erzeugen und Vertrauen beschädigen.", "Reichweitenlogiken würden Diskursqualität berücksichtigen."],
  ["Konstruktiver Creator vs. destruktiver Host", "Creator:innen können Handlungsfähigkeit erzeugen oder Ressentiment monetarisieren.", "Plattformen würden nicht nur Watchtime, sondern Wirkungsrisiken messen."]
];

const mediaScorecardFields = [
  ["Faktenbasis", 1.8, "Quellen, Belege, Korrekturen", "Orientierung", "Vertrauen", "Resilienz"],
  ["Quellenqualität", 1.5, "Primärquellen, Transparenz", "Nachvollziehbarkeit", "Fehlerkorrektur", "Institutionelles Vertrauen"],
  ["Kontext", 1.2, "Einordnung, Vergleichsdaten", "Verstehen", "Weniger Schein-Konflikt", "Bessere Entscheidungen"],
  ["Sprache und Framing", -0.4, "Textanalyse, Framingmuster", "Emotion", "Normverschiebung", "Diskursklima"],
  ["Emotionalisierung", -0.7, "Sentiment, Triggerwörter", "Aufmerksamkeit", "Erregungsspiralen", "Polarisierung"],
  ["Polarisierung", -0.9, "Kommentar- und Teilungsmuster", "Konflikt", "Gruppenbindung", "Demokratische Ermüdung"],
  ["Diskursqualität", 0.8, "Antwortfähigkeit, Fairness", "Gespräch", "Lernfähigkeit", "Öffentliche Vernunft"],
  ["Demokratische Resilienz", 0.6, "Institutionenbezug", "Vertrauen", "Regelakzeptanz", "Stabilität"],
  ["Vulnerable Gruppen", 0.4, "Minderheitenschutz", "Schutz", "Teilhabe", "Würde"],
  ["Korrekturfähigkeit", 1.4, "Updates, Fehlerhinweise", "Transparenz", "Lernsignal", "Vertrauensaufbau"]
];

const quizModules = {
  impact: {
    question: "Welche Entscheidung erzeugt wahrscheinlich positive Systemwirkung?",
    options: ["Kosten senken durch unbezahlte Risiken", "Folgekosten vermeiden und transparent machen", "Reichweite maximieren"],
    answer: 1,
    feedback: "Richtig: Wirkung fragt nach realen Zustandsveränderungen und vermiedenen Folgekosten."
  },
  product: {
    question: "Welches Produkt schneidet wirkungsökonomisch besser ab?",
    options: ["Das billigste Produkt", "Das Produkt mit bester Funktion plus geringeren Folgekosten", "Das Produkt mit größter Marke"],
    answer: 1,
    feedback: "Genau. Preis bleibt relevant, aber nicht ohne Klima, Arbeit, Gesundheit und Kreislauf."
  },
  media: {
    question: "Welche Überschrift polarisiert stärker?",
    options: ["Stadt erklärt Kosten und Förderung der Wärmewende", "Sie verschweigen euch die Wahrheit über diese Gruppen"],
    answer: 1,
    feedback: "Ja. Pauschalisierung, Feindbild und Verschwörungsrahmen erhöhen Polarisierungswirkung."
  },
  capital: {
    question: "Was ist der Unterschied zwischen Kapital und Wirkung?",
    options: ["Kapital ist Mittel, Wirkung ist Zustandsveränderung", "Kapital ist immer Wirkung", "Wirkung ist nur Reichweite"],
    answer: 0,
    feedback: "Richtig. Kapital kann Wirkung ermöglichen, ersetzt aber nicht die Bewertung realer Folgen."
  }
};

let quizIndex = 0;
let gameState = { round: 1, budget: 100, damage: 68, prevention: 18, trust: 50 };

function initPriceTruth() {
  const root = document.querySelector("[data-price-truth]");
  if (!root) return;
  const select = root.querySelector("[data-truth-select]");
  const output = root.querySelector("[data-truth-output]");
  select.innerHTML = Object.entries(truthProducts).map(([key, value]) => `<option value="${key}">${value.name}</option>`).join("");

  function render() {
    const item = truthProducts[select.value];
    output.innerHTML = ["cheap", "fair"].map((key) => {
      const row = item[key];
      const truePrice = row.market + row.hidden + row.impact;
      return `
        <div class="truth-row">
          <span class="hero-kicker">${row.label}</span>
          <strong>${currencyFormatter.format(truePrice)}</strong>
          <span>Marktpreis ${currencyFormatter.format(row.market)} · versteckte Kosten ${currencyFormatter.format(row.hidden)} · Wirkung ${row.impact >= 0 ? "+" : ""}${currencyFormatter.format(row.impact)}</span>
        </div>
      `;
    }).join("");
  }

  select.addEventListener("change", render);
  render();
}

function initKpiCalculator() {
  const root = document.querySelector("[data-kpi-calculator]");
  if (!root) return;
  const inputs = Array.from(root.querySelectorAll("input"));
  const output = root.querySelector("[data-kpi-output]");

  function render() {
    const values = Object.fromEntries(inputs.map((input) => [input.name, Number(input.value)]));
    const score = Math.round(values.human * 0.3 + values.planet * 0.3 + values.democracy * 0.25 + values.quality * 0.15);
    const level = score >= 75 ? "wirkungsorientiert" : score >= 55 ? "entwicklungsfähig" : "kritisch";
    output.innerHTML = `
      <span>Wirkungs-KPI</span>
      <strong>${score} / 100</strong>
      <span>${level}: Der Score zeigt nicht nur Leistung, sondern ob Wirkung auf Mensch, Planet und Demokratie belastbar sichtbar wird.</span>
    `;
  }

  inputs.forEach((input) => input.addEventListener("input", render));
  render();
}

function initTsroiCalculator() {
  const root = document.querySelector("[data-tsroi-calculator]");
  if (!root) return;
  const inputs = Array.from(root.querySelectorAll("input"));
  const output = root.querySelector("[data-tsroi-output]");

  function render() {
    const values = Object.fromEntries(inputs.map((input) => [input.name, Number(input.value)]));
    const adjustedBenefits = (values.benefit + values.avoided) * (1 - clamp(values.deadweight, 0, 100) / 100);
    const ratio = values.investment > 0 ? adjustedBenefits / values.investment : 0;
    const net = adjustedBenefits - values.investment;
    output.innerHTML = `
      <span>T-SROI</span>
      <strong>${ratio.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} : 1</strong>
      <span>Bereinigter Nutzen ${currencyFormatter.format(adjustedBenefits)} · Netto-Wirkungswert ${currencyFormatter.format(net)}.</span>
    `;
  }

  inputs.forEach((input) => input.addEventListener("input", render));
  render();
}

function initNwiCalculator() {
  const root = document.querySelector("[data-nwi-calculator]");
  if (!root) return;
  const inputs = Array.from(root.querySelectorAll("input"));
  const output = root.querySelector("[data-nwi-output]");

  function render() {
    const values = Object.fromEntries(inputs.map((input) => [input.name, Number(input.value)]));
    const inequalityCost = values.base * (clamp(values.inequality, 0, 100) / 100);
    const nwi = values.base - inequalityCost + values.unpaid - values.ecology - values.social;
    const delta = nwi - values.base;
    output.innerHTML = `
      <span>Vereinfachter NWI</span>
      <strong>${nwi.toLocaleString("de-DE", { maximumFractionDigits: 0 })} Mrd. €</strong>
      <span>${delta >= 0 ? "+" : ""}${delta.toLocaleString("de-DE", { maximumFractionDigits: 0 })} Mrd. € gegenüber dem Basiswert. Wohlfahrt steigt, wenn unbezahlte positive Wirkung sichtbar wird und Folgekosten sinken.</span>
    `;
  }

  inputs.forEach((input) => input.addEventListener("input", render));
  render();
}

function initRadar() {
  const root = document.querySelector("[data-radar]");
  if (!root) return;
  const select = root.querySelector("[data-radar-select]");
  const bars = root.querySelector("[data-radar-bars]");
  const note = root.querySelector("[data-radar-note]");
  select.innerHTML = Object.keys(radarTopics).map((topic) => `<option value="${topic}">${topic}</option>`).join("");

  function render() {
    const item = radarTopics[select.value];
    bars.innerHTML = Object.entries(item.scores).map(([label, value]) => `
      <div class="radar-axis">
        <span><b>${label}</b><b>${value}</b></span>
        <div class="mini-track"><div class="mini-fill" style="width:${value}%"></div></div>
      </div>
    `).join("");
    note.textContent = item.note;
  }

  select.addEventListener("change", render);
  render();
}

function initPolicyCheck() {
  const root = document.querySelector("[data-policy-check]");
  if (!root) return;
  const select = root.querySelector("[data-policy-select]");
  const output = root.querySelector("[data-policy-output]");
  select.innerHTML = Object.keys(policyMeasures).map((measure) => `<option value="${measure}">${measure}</option>`).join("");

  function render() {
    output.innerHTML = policyMeasures[select.value].map(([title, text]) => `
      <div class="effect-card"><strong>${title}</strong><br>${text}</div>
    `).join("");
  }

  select.addEventListener("change", render);
  render();
}

function initTaxGame() {
  const root = document.querySelector("[data-tax-game]");
  if (!root) return;
  const stats = root.querySelector("[data-game-stats]");
  const note = root.querySelector("[data-game-note]");

  function render() {
    stats.innerHTML = `
      <div class="game-stat"><span>Runde</span><span>${gameState.round} / 5</span></div>
      <div class="game-stat"><span>Budget</span><span>${gameState.budget}</span></div>
      <div class="game-stat"><span>Schadensdruck</span><span>${gameState.damage}</span></div>
      <div class="game-stat"><span>Prävention</span><span>${gameState.prevention}</span></div>
      <div class="game-stat"><span>Vertrauen</span><span>${gameState.trust}</span></div>
    `;
    note.textContent = gameState.round > 5
      ? "Nach fünf Runden zeigt sich: Reparatur beruhigt kurzfristig, Prävention senkt die nächste Rechnung."
      : "Wähle pro Runde: akute Schäden reparieren oder Ursachen reduzieren.";
  }

  root.addEventListener("click", (event) => {
    const button = event.target.closest("[data-game-action]");
    if (!button) return;
    const action = button.dataset.gameAction;
    if (action === "reset") {
      gameState = { round: 1, budget: 100, damage: 68, prevention: 18, trust: 50 };
      render();
      return;
    }
    if (gameState.round > 5 || gameState.budget <= 0) return;
    if (action === "repair") {
      gameState.budget -= 18;
      gameState.damage = Math.max(0, gameState.damage - 14 + Math.round((100 - gameState.prevention) / 18));
      gameState.trust += 4;
    }
    if (action === "prevent") {
      gameState.budget -= 14;
      gameState.prevention += 14;
      gameState.damage = Math.max(0, gameState.damage - 5);
      gameState.trust -= gameState.round < 3 ? 2 : -5;
    }
    gameState.round += 1;
    gameState.trust = clamp(gameState.trust, 0, 100);
    render();
  });

  render();
}

function initCommunicationCheck() {
  const root = document.querySelector("[data-communication-check]");
  if (!root) return;
  const input = root.querySelector("[data-communication-input]");
  const output = root.querySelector("[data-communication-output]");
  const polarWords = ["verrat", "lüge", "irre", "alle", "immer", "nie", "feind", "versagen"];
  const agencyWords = ["machbar", "gemeinsam", "planbar", "konkret", "schritt", "fair", "entlastet", "lernen"];

  function render() {
    const text = input.value.toLowerCase();
    const polarHits = polarWords.filter((word) => text.includes(word)).length;
    const agencyHits = agencyWords.filter((word) => text.includes(word)).length;
    const trust = clamp(58 + agencyHits * 9 - polarHits * 14, 0, 100);
    const polarization = clamp(34 + polarHits * 18 - agencyHits * 5, 0, 100);
    const orientation = clamp(48 + (text.length > 45 ? 18 : 0) + agencyHits * 5 - polarHits * 6, 0, 100);
    const action = clamp(46 + agencyHits * 10 - polarHits * 4, 0, 100);
    output.innerHTML = [
      ["Vertrauen", trust],
      ["Polarisierung", polarization],
      ["Orientierung", orientation],
      ["Handlungsfähigkeit", action]
    ].map(([label, value]) => `
      <div class="check-score-row">
        <span>${label}</span>
        <div class="mini-track"><div class="mini-fill" style="width:${value}%"></div></div>
        <strong>${value}</strong>
      </div>
    `).join("");
  }

  input.addEventListener("input", render);
  render();
}

function initCycle() {
  const root = document.querySelector("[data-cycle]");
  if (!root) return;
  const steps = root.querySelector("[data-cycle-steps]");
  const output = root.querySelector("[data-cycle-output]");
  steps.innerHTML = cycleSteps.map(([title], index) => `<button class="cycle-step" type="button" data-cycle-index="${index}">${index + 1}. ${title}</button>`).join("");
  root.addEventListener("click", (event) => {
    const button = event.target.closest("[data-cycle-index]");
    if (!button) return;
    const [title, text] = cycleSteps[Number(button.dataset.cycleIndex)];
    output.innerHTML = `<strong>${title}:</strong> ${text}`;
  });
  output.innerHTML = `<strong>${cycleSteps[0][0]}:</strong> ${cycleSteps[0][1]}`;
}

function initQuiz() {
  const root = document.querySelector("[data-mini-quiz]");
  if (!root) return;
  const question = root.querySelector("[data-quiz-question]");
  const options = root.querySelector("[data-quiz-options]");
  const feedback = root.querySelector("[data-quiz-feedback]");

  function render() {
    const current = quizQuestions[quizIndex];
    question.textContent = current.question;
    feedback.textContent = "";
    options.innerHTML = current.options.map((option, index) => `<button class="quiz-option" type="button" data-quiz-option="${index}">${option}</button>`).join("");
  }

  root.addEventListener("click", (event) => {
    const button = event.target.closest("[data-quiz-option]");
    if (!button) return;
    const current = quizQuestions[quizIndex];
    const selected = Number(button.dataset.quizOption);
    Array.from(options.children).forEach((child, index) => {
      child.classList.toggle("correct", index === current.answer);
      child.classList.toggle("wrong", index === selected && selected !== current.answer);
    });
    feedback.textContent = current.feedback;
    quizIndex = (quizIndex + 1) % quizQuestions.length;
    window.setTimeout(render, 1800);
  });

  render();
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clampScore(score) {
  return clamp(score, -3, 3);
}

function renderMediaScore(root, title, text, scores, explanation) {
  const score = clampScore(average(Object.values(scores)));
  const sorted = Object.entries(scores).sort((a, b) => a[1] - b[1]);
  const harms = sorted.filter(([, value]) => value < 0).slice(0, 2).map(([label]) => label);
  const benefits = sorted.filter(([, value]) => value > 0.8).slice(-2).map(([label]) => label);
  const traffic = score >= 1 ? "grün" : score >= -0.5 ? "gelb" : "rot";
  const trafficClass = score >= 1 ? "traffic-good" : score >= -0.5 ? "traffic-mid" : "traffic-bad";

  root.querySelector("[data-media-title]").textContent = title;
  const scoreEl = root.querySelector("[data-media-score]");
  scoreEl.textContent = formatScore(score);
  scoreEl.className = `score-pill ${toneFromScore(score)}`;
  const trafficEl = root.querySelector("[data-media-traffic]");
  trafficEl.textContent = traffic;
  trafficEl.className = trafficClass;
  root.querySelector("[data-media-harm]").textContent = harms.join(", ") || "keine dominante";
  root.querySelector("[data-media-benefit]").textContent = benefits.length
    ? `stärkt ${benefits.join(", ")}`
    : score < -0.5 ? "Vertrauensverlust möglich" : "abhängig von Reichweite";
  root.querySelector("[data-media-explanation]").textContent = explanation;
  const feedbackEl = root.querySelector("[data-media-feedback]");
  if (feedbackEl) {
    feedbackEl.textContent = score < -0.5
      ? "Bei hoher Reichweite könnten Vertrauen, Minderheitenschutz und Diskursqualität belastet werden."
      : score >= 1
        ? "Bei hoher Reichweite könnte der Beitrag Orientierung, Kontext und demokratische Resilienz stärken."
        : "Die Wirkung ist ambivalent und hängt besonders von Reichweite, Kontext und Korrekturfähigkeit ab.";
  }
  root.querySelector("[data-media-dimensions]").innerHTML = Object.entries(scores).map(([label, value]) => `
    <div class="media-dimension">
      <div class="media-dimension-head"><span>${label}</span><span>${formatScore(value)}</span></div>
      <div class="mini-track"><div class="mini-fill ${toneFromScore(value)}" style="width:${((value + 3) / 6) * 100}%"></div></div>
    </div>
  `).join("");
}

function scoreCustomMediaText(text) {
  const lowerText = text.toLowerCase();
  const polarWords = ["verrat", "lüge", "feind", "zerstören", "alle", "immer", "nie", "verschwiegen", "gelöscht", "wahrheit"];
  const sourceWords = ["quelle", "daten", "bericht", "studie", "laut", "pressekodex", "faktencheck", "unsicher"];
  const constructiveWords = ["einordnung", "kontext", "korrigieren", "gemeinsam", "transparent", "abwägen", "lösung", "förderung"];
  const polarHits = polarWords.filter((word) => lowerText.includes(word)).length;
  const sourceHits = sourceWords.filter((word) => lowerText.includes(word)).length;
  const constructiveHits = constructiveWords.filter((word) => lowerText.includes(word)).length;
  const sourceScore = clampScore(-0.8 + sourceHits * 0.75 + (text.length > 180 ? 0.4 : 0));
  const polarScore = clampScore(1.3 + constructiveHits * 0.25 - polarHits * 0.75);
  return {
    "Wahrheit und Quellenklarheit": sourceScore,
    "Kontext und Einordnung": clampScore(-0.3 + constructiveHits * 0.55 + sourceHits * 0.25 - polarHits * 0.2),
    Emotionalisierung: clampScore(1.1 - polarHits * 0.65),
    Polarisierungspotenzial: polarScore,
    Feindbildproduktion: clampScore(1.4 - polarHits * 0.8),
    Demokratiewirkung: clampScore(0.4 + constructiveHits * 0.35 - polarHits * 0.45),
    Minderheitenschutz: clampScore(0.5 - polarHits * 0.35),
    Diskursqualität: clampScore(0.2 + constructiveHits * 0.45 + sourceHits * 0.15 - polarHits * 0.45),
    "Transparenz von Meinung und Information": sourceScore,
    "Manipulations- oder Desinformationsrisiko": clampScore(0.8 + sourceHits * 0.25 - polarHits * 0.65)
  };
}

function initMediaLab() {
  const root = document.querySelector("[data-media-lab]");
  if (!root) return;
  const select = root.querySelector("[data-media-example]");
  const input = root.querySelector("[data-media-input]");
  const output = root.querySelector(".media-score-output");
  const modeButtons = Array.from(root.querySelectorAll("[data-media-mode]"));
  let mode = "example";
  select.innerHTML = Object.entries(mediaExamples).map(([key, item]) => `<option value="${key}">${item.title}</option>`).join("");

  function render() {
    modeButtons.forEach((button) => button.classList.toggle("active", button.dataset.mediaMode === mode));
    if (mode === "example") {
      const item = mediaExamples[select.value];
      input.value = item.text;
      renderMediaScore(output, item.title, item.text, item.scores, item.explanation);
      return;
    }
    const text = input.value.trim();
    const scores = scoreCustomMediaText(text);
    renderMediaScore(output, "Eigener Text", text, scores, "Diese Bewertung nutzt einfache Textsignale: Quellenklarheit, Kontextwörter, Feindbild- und Erregungsmuster. Für reale Anwendungen müssten Datenquellen und Gewichtungen offengelegt werden.");
  }

  select.addEventListener("change", () => {
    mode = "example";
    render();
  });
  input.addEventListener("input", () => {
    mode = "custom";
    render();
  });
  modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      mode = button.dataset.mediaMode;
      render();
    });
  });
  render();
}

function initPlatformLab() {
  const root = document.querySelector("[data-platform-lab]");
  if (!root) return;
  const select = root.querySelector("[data-platform-scenario]");
  const inputs = Array.from(root.querySelectorAll("[data-platform-input]"));
  select.innerHTML = Object.entries(platformScenarios).map(([key, item]) => `<option value="${key}">${item.title}</option>`).join("");

  function render() {
    const scenario = platformScenarios[select.value];
    const values = Object.fromEntries(inputs.map((input) => [input.name, Number(input.value)]));
    const amplifier = 1 + (values.emotion * 0.012 + values.outrage * 0.014 + values.identity * 0.01 + values.comments * 0.009 + values.network * 0.012);
    const reach = Math.round(1000 * amplifier * (scenario.base < 0 ? 1.35 : 0.8));
    const polarization = clamp(Math.round(values.outrage * 0.35 + values.identity * 0.35 + values.emotion * 0.2), 0, 100);
    const trust = clamp(Math.round(72 + scenario.base * 12 - polarization * 0.38), 0, 100);
    const democracy = clampScore(scenario.base - (amplifier - 1) * (scenario.base < 0 ? 0.75 : 0.15));
    const weakSignals = [
      ["Polarisierung", 100 - polarization],
      ["Vertrauen", trust],
      ["Demokratie", ((democracy + 3) / 6) * 100],
      ["Reichweite", scenario.base < 0 ? 100 - clamp(reach / 120, 0, 100) : clamp(reach / 120, 0, 100)]
    ].sort((a, b) => a[1] - b[1]);

    root.querySelector("[data-platform-title]").textContent = scenario.title;
    root.querySelector("[data-platform-base]").textContent = formatScore(scenario.base);
    root.querySelector("[data-platform-weakest]").textContent = weakSignals[0][0];
    root.querySelector("[data-platform-factor]").textContent = `${amplifier.toLocaleString("de-DE", { maximumFractionDigits: 1 })}x`;
    root.querySelector("[data-platform-democracy]").textContent = formatScore(democracy);
    root.querySelector("[data-platform-note]").textContent = scenario.note;
    root.querySelector("[data-platform-explanation]").textContent = `Aus einer Grundwirkung von ${formatScore(scenario.base)} wird durch Algorithmusfaktoren ein Verstärkungsfaktor von ${amplifier.toLocaleString("de-DE", { maximumFractionDigits: 1 })}x und eine simulierte Reichweite von ${reach.toLocaleString("de-DE")}.`;
    root.querySelector("[data-platform-feedback]").textContent = democracy < 0
      ? "Die Rückkopplung kann Polarisierung und Vertrauensverlust vergrößern, obwohl der Inhalt formal als Meinung erscheint."
      : "Die Rückkopplung kann Orientierung verstärken, wenn Reichweite nicht primär über Empörung und Feindbilder entsteht.";
    root.querySelector("[data-platform-bars]").innerHTML = [
      ["Reichweitenwirkung", clamp(Math.round(reach / 120), 0, 100)],
      ["Polarisierungswirkung", polarization],
      ["Vertrauenswirkung", trust],
      ["Kommentaraktivität", values.comments],
      ["Netzwerkverstärkung", values.network]
    ].map(([label, value]) => `
      <div class="radar-axis">
        <span><b>${label}</b><b>${value}</b></span>
        <div class="mini-track"><div class="mini-fill" style="width:${value}%"></div></div>
      </div>
    `).join("");
  }

  select.addEventListener("change", render);
  inputs.forEach((input) => input.addEventListener("input", render));
  render();
}

function initRiskLab() {
  const root = document.querySelector("[data-risk-lab]");
  if (!root) return;
  const select = root.querySelector("[data-risk-scenario]");
  const inputs = Array.from(root.querySelectorAll("[data-risk-input]"));
  select.innerHTML = Object.entries(riskScenarios)
    .map(([key, item]) => `<option value="${key}">${item.title}</option>`)
    .join("");

  function render() {
    const scenario = riskScenarios[select.value];
    const values = Object.fromEntries(inputs.map((input) => [input.name, Number(input.value)]));
    const physicalStress = (values.geopolitics * 0.22 + values.energy * 0.28 + values.climate * 0.24 + values.social * 0.16) * scenario.exposure;
    const riskReduction = values.transparency * 0.34 + values.timing * 0.38;
    const systemRisk = clamp(Math.round(physicalStress - riskReduction * 0.52 + 18), 0, 100);
    const decisionRoom = clamp(Math.round((100 - systemRisk) * 0.55 + values.timing * 0.45), 0, 100);
    const financeCost = clamp(Math.round(18 + systemRisk * 0.72 - values.transparency * 0.25), 0, 100);
    const resilience = clamp(Math.round(values.transparency * 0.42 + values.timing * 0.3 + (100 - systemRisk) * 0.28), 0, 100);
    const stage = decisionRoom >= 68 ? "Frühes Handeln" : decisionRoom >= 42 ? "Spätes Handeln" : "Krisenmodus";
    const financeLabel = financeCost >= 70 ? "Risikoprämien hoch" : financeCost >= 42 ? "Kapital wird selektiv" : "Kapitalzugang stabiler";
    const resilienceLabel = resilience >= 70 ? "robust" : resilience >= 45 ? "verwundbar" : "instabil";
    const weakestRisk = [
      ["Systemrisiko", 100 - systemRisk],
      ["Handlungsspielraum", decisionRoom],
      ["Finanzierungsdruck", 100 - financeCost],
      ["Lieferkettenresilienz", resilience]
    ].sort((a, b) => a[1] - b[1])[0][0];

    root.querySelector("[data-risk-title]").textContent = scenario.title;
    root.querySelector("[data-risk-score]").textContent = `${systemRisk} / 100`;
    root.querySelector("[data-risk-weakest]").textContent = weakestRisk;
    root.querySelector("[data-risk-finance]").textContent = financeLabel;
    root.querySelector("[data-risk-resilience]").textContent = resilienceLabel;
    root.querySelector("[data-risk-explanation]").textContent = scenario.explanation;
    root.querySelector("[data-risk-feedback]").textContent = `${stage}: ${decisionRoom >= 68 ? "frühe Transparenz hält Optionen offen und kann Finanzierungskosten senken." : decisionRoom >= 42 ? "Entscheidungen bleiben möglich, werden aber teurer und konfliktanfälliger." : "Notlösungen dominieren, Lieferfähigkeit und Marge geraten unter Druck."}`;
    root.querySelector("[data-risk-bars]").innerHTML = [
      ["Systemrisiko", systemRisk],
      ["Handlungsspielraum", decisionRoom],
      ["Finanzierungsdruck", financeCost],
      ["Lieferkettenresilienz", resilience],
      ["Datentransparenz", values.transparency],
      ["Timing-Vorteil", values.timing]
    ].map(([label, value]) => `
      <div class="radar-axis">
        <span><b>${label}</b><b>${value}</b></span>
        <div class="mini-track"><div class="mini-fill" style="width:${value}%"></div></div>
      </div>
    `).join("");
  }

  select.addEventListener("change", render);
  inputs.forEach((input) => input.addEventListener("input", render));
  render();
}

function initEverydayLab() {
  const root = document.querySelector("[data-everyday-lab]");
  if (!root) return;
  const grid = root.querySelector("[data-everyday-grid]");
  const output = root.querySelector("[data-everyday-output]");
  let active = 0;

  function render() {
    grid.innerHTML = everydayExamples.map(([title, text], index) => `
      <button class="everyday-card${index === active ? " active" : ""}" type="button" data-everyday-index="${index}">
        <span class="hero-kicker">Beispiel ${index + 1}</span>
        <strong>${title}</strong>
        <em>${text}</em>
      </button>
    `).join("");
    const [title, text, transfer] = everydayExamples[active];
    output.innerHTML = `
      <p class="hero-kicker">Warum bewertet die Wirkungsökonomie so?</p>
      <h3>${title}</h3>
      <p>${text}</p>
      <div class="transfer-grid">
        <div class="transfer-item"><strong>Preis:</strong> ${transfer}</div>
        <div class="transfer-item"><strong>Steuer:</strong> Negative Folgekosten würden nicht mehr unsichtbar bleiben.</div>
        <div class="transfer-item"><strong>Kapital:</strong> Investitionen würden stärker in tragfähige Wirkung statt bloße Rendite fließen.</div>
      </div>
    `;
  }

  root.addEventListener("click", (event) => {
    const button = event.target.closest("[data-everyday-index]");
    if (!button) return;
    active = Number(button.dataset.everydayIndex);
    render();
  });
  render();
}

function initMediaScorecardDemo() {
  const root = document.querySelector("[data-media-scorecard]");
  if (!root) return;
  root.innerHTML = mediaScorecardFields.map(([field, score, source, first, second, third]) => `
    <article class="scorecard-field-row">
      <div class="scorecard-field-head"><span>${field}</span><span>${formatScore(score)}</span></div>
      <div class="mini-track"><div class="mini-fill ${toneFromScore(score)}" style="width:${((score + 3) / 6) * 100}%"></div></div>
      <div class="scorecard-field-body">
        <span><b>Datenquelle:</b> ${source}</span>
        <span><b>Wirkung erster Ordnung:</b> ${first}</span>
        <span><b>Wirkung zweiter Ordnung:</b> ${second}</span>
        <span><b>Wirkung dritter Ordnung:</b> ${third}</span>
      </div>
    </article>
  `).join("");
}

function initQuizModules() {
  document.querySelectorAll("[data-quiz-module]").forEach((root) => {
    const data = quizModules[root.dataset.quizModule];
    const options = root.querySelector("[data-module-options]");
    const feedback = root.querySelector("[data-module-feedback]");
    options.innerHTML = data.options.map((option, index) => `<button class="quiz-option" type="button" data-module-answer="${index}">${option}</button>`).join("");
    root.addEventListener("click", (event) => {
      const button = event.target.closest("[data-module-answer]");
      if (!button) return;
      const selected = Number(button.dataset.moduleAnswer);
      Array.from(options.children).forEach((child, index) => {
        child.classList.toggle("correct", index === data.answer);
        child.classList.toggle("wrong", index === selected && selected !== data.answer);
      });
      feedback.textContent = data.feedback;
    });
  });
}

initSimulator();
initCompass();
initMediaLab();
initPlatformLab();
initRiskLab();
initEverydayLab();
initMediaScorecardDemo();
initQuizModules();
initKpiCalculator();
initTsroiCalculator();
initNwiCalculator();
initPriceTruth();
initRadar();
initPolicyCheck();
initTaxGame();
initCommunicationCheck();
initCycle();
initQuiz();
