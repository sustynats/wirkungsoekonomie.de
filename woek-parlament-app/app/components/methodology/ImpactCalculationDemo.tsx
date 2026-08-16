"use client";

import { useMemo, useState } from "react";
import { calculateImpactDemo, formatMethodNumber } from "@/lib/methodology";

function parseNumber(value: string): number {
  if (!value.trim()) return Number.NaN;
  return Number(value.replace(",", "."));
}

function SignedNumber({ value }: { value: number }) {
  return <>{value > 0 ? "+" : ""}{formatMethodNumber(value)}</>;
}

export function ImpactCalculationDemo() {
  const [baseline, setBaseline] = useState("100");
  const [observed, setObserved] = useState("82");
  const [counterfactual, setCounterfactual] = useState("92");
  const values = useMemo(() => ({
    baseline: parseNumber(baseline),
    observed: parseNumber(observed),
    counterfactual: parseNumber(counterfactual)
  }), [baseline, observed, counterfactual]);
  const result = calculateImpactDemo(values.baseline, values.observed, values.counterfactual);

  return (
    <section className="method-calculator" aria-labelledby="calculation-demo-title">
      <div className="method-calculator-intro">
        <p className="eyebrow">Ausprobieren</p>
        <h3 id="calculation-demo-title">Wie verändert ein Gegenfaktum die Einordnung?</h3>
        <p>Trage drei Werte ein. Die Rechnung zeigt eine Zustandsveränderung und den zusätzlichen Unterschied zum modellierten Verlauf ohne Maßnahme.</p>
        <p className="method-demo-boundary"><strong>Didaktisches Rechenbeispiel:</strong> Das ist keine reale politische Bewertung.</p>
      </div>
      <div className="method-calculator-workspace">
        <div className="method-calculator-inputs">
          <label>Ausgangswert<input inputMode="decimal" value={baseline} onChange={(event) => setBaseline(event.target.value)} aria-describedby="baseline-help" /><span id="baseline-help">Zustand vor der Maßnahme</span></label>
          <label>Beobachtung danach<input inputMode="decimal" value={observed} onChange={(event) => setObserved(event.target.value)} aria-describedby="observed-help" /><span id="observed-help">Später gemessener Wert</span></label>
          <label>Schätzung ohne Maßnahme<input inputMode="decimal" value={counterfactual} onChange={(event) => setCounterfactual(event.target.value)} aria-describedby="counterfactual-help" /><span id="counterfactual-help">Modellierter Vergleichswert</span></label>
        </div>
        <div className="method-calculator-result" aria-live="polite" aria-atomic="true">
          {result ? <>
            <dl>
              <div><dt>Beobachtete Veränderung</dt><dd><span>{formatMethodNumber(values.observed)} − {formatMethodNumber(values.baseline)} = </span><strong><SignedNumber value={result.observedDelta} /></strong></dd></div>
              <div><dt>Veränderung ohne Maßnahme</dt><dd><span>{formatMethodNumber(values.counterfactual)} − {formatMethodNumber(values.baseline)} = </span><strong><SignedNumber value={result.counterfactualDelta} /></strong></dd></div>
              <div className="method-calculator-total"><dt>Geschätzte zusätzliche Veränderung</dt><dd><span><SignedNumber value={result.observedDelta} /> − (<SignedNumber value={result.counterfactualDelta} />) = </span><strong><SignedNumber value={result.estimatedAdditionalChange} /></strong></dd></div>
            </dl>
            <p>Der beobachtete Zustand hat sich um <strong><SignedNumber value={result.observedDelta} /> Einheiten</strong> verändert. Nach dem Vergleichsmodell wären <strong><SignedNumber value={result.counterfactualDelta} /> Einheiten</strong> wahrscheinlich auch ohne die Maßnahme eingetreten. Der zusätzliche Unterschied beträgt deshalb <strong><SignedNumber value={result.estimatedAdditionalChange} /> Einheiten</strong>. Ob er der Maßnahme zugerechnet werden kann, hängt vom Untersuchungsdesign und von der Datenqualität ab.</p>
          </> : <p className="method-calculator-error" role="alert">Bitte trage in alle drei Felder gültige Zahlen ein. Es wird kein Ergebnis aus unvollständigen Eingaben erzeugt.</p>}
        </div>
      </div>
    </section>
  );
}
