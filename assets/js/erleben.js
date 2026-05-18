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
              indicator("Abwasser-COD", "mg/L", "Ressourcen & Kreislauf", "SDG 6", "GRI 303; ESRS E3", "lower", [250, 125, 50], 200, "WWTP"),
              indicator("Gefahrstoff-Substitution", "%", "Gesundheit & Sicherheit", "SDG 3", "GRI 416", "higher", [20, 50, 90], 30, "SDS")
            ]
          },
          {
            id: "b",
            name: "Dyehouse Y (Niedrig-Impact)",
            price: 1.6,
            indicators: [
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
              indicator("Arbeitsunfälle", "pro Mio. Std.", "Gesundheit & Sicherheit", "SDG 3", "GRI 403; ESRS S1", "zero", [8, 3, 0], 4, "HSE"),
              indicator("Abfall-Reuse / Recycling", "%", "Ressourcen & Kreislauf", "SDG 12", "GRI 306; ESRS E5", "higher", [20, 50, 90], 40, "Abfall")
            ]
          },
          {
            id: "b",
            name: "Lieferant D (fortschrittlich)",
            price: 2.2,
            indicators: [
              indicator("Arbeitsunfälle", "pro Mio. Std.", "Gesundheit & Sicherheit", "SDG 3", "GRI 403; ESRS S1", "zero", [8, 3, 0], 1, "HSE"),
              indicator("Abfall-Reuse / Recycling", "%", "Ressourcen & Kreislauf", "SDG 12", "GRI 306; ESRS E5", "higher", [20, 50, 90], 85, "Bilanz")
            ]
          },
          {
            id: "c",
            name: "Lieferant E (Lean + LW)",
            price: 2,
            indicators: [
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
              indicator("Rezyklatanteil Stahl", "%", "Ressourcen & Kreislauf", "SDG 12", "GRI 301-2; ESRS E5", "higher", [20, 40, 90], 25, "Werkstoff"),
              indicator("Prozess-Ausschuss", "%", "Ressourcen & Kreislauf", "SDG 9", "GRI 302/306; ESRS E5", "lower", [15, 8, 2], 10, "Qualität")
            ]
          },
          {
            id: "b",
            name: "Lieferant F (Recyclingstahl)",
            price: 4.8,
            indicators: [
              indicator("Rezyklatanteil Stahl", "%", "Ressourcen & Kreislauf", "SDG 12", "GRI 301-2; ESRS E5", "higher", [20, 40, 90], 70, "Werkstoff"),
              indicator("Prozess-Ausschuss", "%", "Ressourcen & Kreislauf", "SDG 9", "GRI 302/306; ESRS E5", "lower", [15, 8, 2], 3, "Qualität")
            ]
          },
          {
            id: "c",
            name: "Lieferant Q (Grünstahl)",
            price: 5.2,
            indicators: [
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
              indicator("REACH-Fälle", "pro Jahr", "Gesundheit & Sicherheit", "SDG 3", "GRI 416 / REACH", "zero", [6, 2, 0], 3, "Compliance"),
              indicator("Lösemittel-Recovery", "%", "Ressourcen & Kreislauf", "SDG 12", "GRI 306; ESRS E2/E5", "higher", [20, 50, 90], 35, "Umwelt")
            ]
          },
          {
            id: "b",
            name: "Lieferant H (Low-tox Coating)",
            price: 2,
            indicators: [
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
              indicator("Rezyklatgehalt Karton", "%", "Ressourcen & Kreislauf", "SDG 12", "GRI 301-2", "higher", [30, 60, 95], 50, "LCA"),
              indicator("Arbeitsunfälle", "pro Mio. Std.", "Gesundheit & Sicherheit", "SDG 8", "GRI 403", "zero", [8, 3, 0], 3, "HSE")
            ]
          },
          {
            id: "b",
            name: "Optimiert (Re-Karton + Schiene)",
            price: 0.8,
            indicators: [
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
              indicator("Rezyklatanteil Co/Ni", "%", "Ressourcen & Kreislauf", "SDG 12", "GRI 301-2", "higher", [5, 20, 60], 15, "Pass"),
              indicator("Unfälle", "pro Mio. Std.", "Gesundheit & Sicherheit", "SDG 3", "GRI 403", "zero", [8, 3, 0], 3, "HSE")
            ]
          },
          {
            id: "b",
            name: "Zellfertiger S (Re-Metalle)",
            price: 95,
            indicators: [
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
              indicator("Rezyklatanteil Alu", "%", "Ressourcen & Kreislauf", "SDG 12", "GRI 301-2; ESRS E5", "higher", [20, 50, 90], 35, "Pass"),
              indicator("Unfälle", "pro Mio. Std.", "Gesundheit & Sicherheit", "SDG 3", "GRI 403", "zero", [8, 3, 0], 3, "HSE")
            ]
          },
          {
            id: "b",
            name: "Lieferant L (Re-Alu + Ergonomie)",
            price: 75,
            indicators: [
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
  const text = compass.querySelector("[data-compass-text]");

  function update() {
    const values = Object.fromEntries(inputs.map((input) => [input.name, Number(input.value)]));
    const impactScore = Math.round((values.tax + values.democracy + values.boundaries + (100 - values.price)) / 4);
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
    text.textContent = description;
  }

  inputs.forEach((input) => input.addEventListener("input", update));
  update();
}

initSimulator();
initCompass();
