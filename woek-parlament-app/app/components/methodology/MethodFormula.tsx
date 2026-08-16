import type { ReactNode } from "react";

type FormulaKind =
  | "impact-path"
  | "direction-set"
  | "observed-change"
  | "counterfactual-effect"
  | "difference-in-differences"
  | "auto-score"
  | "score-set"
  | "final-score"
  | "no-data-not-zero"
  | "no-data-not-assessed"
  | "bad-average"
  | "protection-gate";

function BlockMath({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="method-formula" role="img" aria-label={label} tabIndex={0}>
      <math display="block" aria-hidden="true">{children}</math>
    </div>
  );
}

export function MethodFormula({ kind }: { kind: FormulaKind }) {
  if (kind === "impact-path") {
    return <BlockMath label="Auslöser führt über einen Wirkmechanismus zu einer Zustandsveränderung, die an einem Referenzziel eingeordnet wird"><mrow><mi>A</mi><mo>→</mo><mi>M</mi><mo>→</mo><mi>ΔZ</mi><mo>→</mo><mi>R</mi></mrow></BlockMath>;
  }
  if (kind === "direction-set") {
    return <BlockMath label="Die Richtung eines Wirkpfads gegenüber einem Ziel ist positiv, negativ, neutral, ambivalent oder offen"><msub><mi>D</mi><mrow><mi>p</mi><mo>,</mo><mi>g</mi></mrow></msub><mo>∈</mo><mo>{"{"}</mo><mtext>positiv</mtext><mo>,</mo><mtext>negativ</mtext><mo>,</mo><mtext>neutral</mtext><mo>,</mo><mtext>ambivalent</mtext><mo>,</mo><mtext>offen</mtext><mo>{"}"}</mo></BlockMath>;
  }
  if (kind === "observed-change") {
    return <BlockMath label="Beobachtete Veränderung ist der Wert nachher minus dem Wert vorher"><msub><mi>ΔY</mi><mtext>beobachtet</mtext></msub><mo>=</mo><msub><mi>Y</mi><mtext>nachher</mtext></msub><mo>−</mo><msub><mi>Y</mi><mtext>vorher</mtext></msub></BlockMath>;
  }
  if (kind === "counterfactual-effect") {
    return <BlockMath label="Geschätzte zusätzliche Veränderung ist die beobachtete Veränderung minus der gegenfaktischen Veränderung"><mover><mi>W</mi><mo>^</mo></mover><mo>=</mo><msub><mi>ΔY</mi><mtext>beobachtet</mtext></msub><mo>−</mo><msub><mi>ΔY</mi><mtext>gegenfaktisch</mtext></msub></BlockMath>;
  }
  if (kind === "difference-in-differences") {
    return <BlockMath label="Difference in Differences: Veränderung der betrachteten Gruppe minus Veränderung der Vergleichsgruppe"><msub><mover><mi>τ</mi><mo>^</mo></mover><mtext>DiD</mtext></msub><mo>=</mo><mo>(</mo><msub><mi>Y</mi><mrow><mi>T</mi><mo>,</mo><mn>1</mn></mrow></msub><mo>−</mo><msub><mi>Y</mi><mrow><mi>T</mi><mo>,</mo><mn>0</mn></mrow></msub><mo>)</mo><mo>−</mo><mo>(</mo><msub><mi>Y</mi><mrow><mi>C</mi><mo>,</mo><mn>1</mn></mrow></msub><mo>−</mo><msub><mi>Y</mi><mrow><mi>C</mi><mo>,</mo><mn>0</mn></mrow></msub><mo>)</mo></BlockMath>;
  }
  if (kind === "auto-score") {
    return <BlockMath label="Der AutoScore eines Indikators entsteht durch Anwendung seiner dokumentierten Regel auf den Messwert"><msub><mi>S</mi><mrow><mtext>auto</mtext><mo>,</mo><mi>i</mi></mrow></msub><mo>=</mo><msub><mi>f</mi><mi>i</mi></msub><mo>(</mo><msub><mi>x</mi><mi>i</mi></msub><mo>)</mo></BlockMath>;
  }
  if (kind === "score-set") {
    return <BlockMath label="Die Menge der vorhandenen belastbaren Scores enthält AutoScore, BenchmarkScore und AssuranceScore, leere Werte werden entfernt"><msub><mi>V</mi><mi>i</mi></msub><mo>=</mo><mo>{"{"}</mo><msub><mi>S</mi><mrow><mtext>auto</mtext><mo>,</mo><mi>i</mi></mrow></msub><mo>,</mo><msub><mi>S</mi><mrow><mtext>Benchmark</mtext><mo>,</mo><mi>i</mi></mrow></msub><mo>,</mo><msub><mi>S</mi><mrow><mtext>Assurance</mtext><mo>,</mo><mi>i</mi></mrow></msub><mo>{"}"}</mo><mo>∖</mo><mo>{"{"}</mo><mi>∅</mi><mo>{"}"}</mo></BlockMath>;
  }
  if (kind === "final-score") {
    return <BlockMath label="Der FinalScore ist der strengste vorhandene belastbare Wert; ohne vorhandenen Wert bleibt er leer"><msub><mi>S</mi><mrow><mtext>final</mtext><mo>,</mo><mi>i</mi></mrow></msub><mo>=</mo><mrow><mo>{"{"}</mo><mtable><mtr><mtd><mrow><mi>min</mi><mo>(</mo><msub><mi>V</mi><mi>i</mi></msub><mo>)</mo></mrow></mtd><mtd><mtext>wenn Werte vorhanden sind</mtext></mtd></mtr><mtr><mtd><mi>∅</mi></mtd><mtd><mtext>wenn kein Wert vorhanden ist</mtext></mtd></mtr></mtable></mrow></BlockMath>;
  }
  if (kind === "no-data-not-zero") {
    return <BlockMath label="Keine Daten sind nicht gleich null"><mtext>keine Daten</mtext><mo>≠</mo><mn>0</mn></BlockMath>;
  }
  if (kind === "no-data-not-assessed") {
    return <BlockMath label="Keine Daten bedeuten nicht bewertet"><mtext>keine Daten</mtext><mo>=</mo><mtext>nicht bewertet</mtext></BlockMath>;
  }
  if (kind === "bad-average") {
    return <BlockMath label="Die beispielhafte Mittelung von plus drei, plus zwei und minus drei zu plus null Komma sechs sieben ist fachlich unzulässig"><mfrac><mrow><mo>+</mo><mn>3</mn><mo>+</mo><mn>2</mn><mo>−</mo><mn>3</mn></mrow><mn>3</mn></mfrac><mo>=</mo><mo>+</mo><mn>0,67</mn><mtext>  nicht zulässig</mtext></BlockMath>;
  }
  return <BlockMath label="Das Schutzgate blockiert bei einer belegten materiellen Grenzverletzung; sonst lässt es die weitere Prüfung zu"><mi>G</mi><mo>=</mo><mrow><mo>{"{"}</mo><mtable><mtr><mtd><mtext>BLOCK</mtext></mtd><mtd><mtext>bei belegter materieller Grenzverletzung</mtext></mtd></mtr><mtr><mtd><mtext>PASS</mtext></mtd><mtd><mtext>wenn keine solche Grenzverletzung vorliegt</mtext></mtd></mtr></mtable></mrow></BlockMath>;
}
