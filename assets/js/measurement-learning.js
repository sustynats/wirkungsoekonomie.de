// Local learning calculation only. No data collection, storage or network calls.
export function parseShare(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const text = String(value).trim().replace(',', '.');
  if (!text || !/^[+\-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+\-]?\d+)?$/i.test(text)) return null;
  const number = Number(text);
  const underflow = number === 0 && /[1-9]/.test(text.split(/[eE]/)[0]);
  return Number.isFinite(number) && number >= 0 && !underflow ? number : null;
}

export function calculateDifference(values) {
  if (!Array.isArray(values) || values.length !== 4) return {valid:false, error:'Bitte alle vier Ausgabenanteile als nicht negative Zahlen eingeben.'};
  const parsed = values.map(parseShare);
  if (parsed.some(value => value === null)) return {valid:false, error:'Bitte alle vier Ausgabenanteile als nicht negative Zahlen eingeben. Leere oder ungültige Eingaben ergeben kein Ergebnis.'};
  const [aBefore,aAfter,bBefore,bAfter] = parsed;
  const observed = aBefore - aAfter;
  const comparison = bBefore - bAfter;
  const additional = observed - comparison;
  if (![observed,comparison,additional].every(Number.isFinite)) return {valid:false, error:'Diese Zahlen sind für die Lernrechnung zu groß. Bitte kleinere, endliche Werte verwenden.'};
  return {valid:true, observed, comparison, additional:Object.is(additional,-0) ? 0 : additional};
}

export function formatLearningNumber(value) {
  const magnitude=Math.abs(value);
  const notation=magnitude!==0 && (magnitude<0.000001 || magnitude>=1e9) ? 'scientific' : 'standard';
  return new Intl.NumberFormat('de-DE',{maximumSignificantDigits:12,notation}).format(value);
}

export function mountLearningCalculator(root = document) {
  for (const calculator of root.querySelectorAll('[data-measurement-calculator]')) {
    const inputs = [...calculator.querySelectorAll('[data-learning-input]')];
    const output = calculator.querySelector('[data-learning-output]');
    const error = calculator.querySelector('[data-learning-error]');
    const resultFields = [...calculator.querySelectorAll('[data-learning-result]')];
    const update = () => {
      const result = calculateDifference(inputs.map(input => input.value));
      inputs.forEach(input => input.setAttribute('aria-invalid', String(parseShare(input.value) === null)));
      error.textContent = result.valid ? '' : result.error;
      error.hidden = result.valid;
      output.hidden = !result.valid;
      if (result.valid) for (const field of resultFields) field.textContent = formatLearningNumber(result[field.dataset.learningResult]);
      if (result.valid) for (const unit of calculator.querySelectorAll('[data-learning-unit]')) unit.textContent = Math.abs(result[unit.dataset.learningUnit]) === 1 ? 'Prozentpunkt' : 'Prozentpunkte';
      calculator.querySelector('[data-learning-interpretation]').textContent = !result.valid ? '' : result.additional > 0
        ? 'Der Kostenanteil sinkt im vereinfachten Vergleich zusätzlich. Erreichbarkeit, Zurechnung und Schutzbedingungen sind weiterhin gesondert zu prüfen.'
        : result.additional < 0
          ? 'Der Kostenanteil entwickelt sich im vereinfachten Vergleich ungünstiger. Das ist kein Urteil über Menschen und noch keine Ursachenklärung.'
          : 'Es bleibt in dieser Rechnung keine zusätzliche Verringerung gegenüber der Vergleichsentwicklung. Andere Veränderungen sind damit nicht ausgeschlossen.';
    };
    inputs.forEach(input => input.addEventListener('input', update));
    calculator.querySelector('[data-learning-reset]').addEventListener('click', () => {
      inputs.forEach(input => {input.value = input.defaultValue;});
      update();
      inputs[0].focus();
    });
    calculator.hidden = false;
    update();
  }
}

if (typeof document !== 'undefined') mountLearningCalculator(document);
