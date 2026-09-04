import { directionSymbols, effectPhases, type ImpactSignatureData } from "@/lib/presentation/impact-signature";

/** Three independent axes. No total, rank, weighted average or party input. */
export function ImpactSignature({ signature, compact = false }: { signature: ImpactSignatureData; compact?: boolean }) {
  const { direction, evidence, maturity } = signature;
  const positions = direction.kind === "ambivalent" ? ["left", "right"]
    : direction.kind === "positive" ? ["right"] : direction.kind === "risk" ? ["left"]
      : direction.kind === "neutral" ? ["middle"] : [];
  return (
    <div className={`impact-signature${compact ? " impact-signature--compact" : ""}`} role="group" aria-label="Wirkungssignatur: drei getrennte Achsen" data-impact-signature={compact ? "compact" : "full"}>
      <dl>
        <div className="signature-axis" data-signature-axis="direction">
          <dt>Wirkungsrichtung</dt>
          <dd>
            <span className={`signature-mark signature-mark--${direction.kind}`} aria-hidden="true" data-woek-assessment-icon={direction.kind}>{directionSymbols[direction.kind]}</span>
            <span>{direction.label}</span>
            <span className="signature-direction-track" aria-hidden="true">
              {positions.map((position) => <i key={position} className={`signature-position signature-position--${position}`}>{position === "left" ? "−" : position === "right" ? "+" : "="}</i>)}
              {!positions.length && <i className="signature-position signature-position--unplaced">?</i>}
            </span>
            {!compact && <><span className="signature-track-labels" aria-hidden="true"><span>entfernt sich</span><span>nähert sich</span></span><small>Bezug: die in der Akte benannten Ziel- und Schutzräume. Keine Gesamtnote.</small></>}
          </dd>
        </div>
        <div className="signature-axis" data-signature-axis="evidence">
          <dt>Evidenz</dt>
          <dd>
            <span className="signature-pips" aria-hidden="true" data-evidence-grade={evidence.grade ?? "ungraded"}>
              {[1, 2, 3, 4].map((grade) => <i key={grade} className={evidence.grade !== null && grade <= evidence.grade ? "is-filled" : ""} />)}
              {evidence.grade === null && <span>?</span>}
            </span>
            <span>{evidence.grade === null ? evidence.label : `Stufe ${evidence.grade} von 4`}</span>
            {!compact && <><small>{evidence.detail}</small>{evidence.grade === null && <small>Keine freigegebene Zuordnung zur Vier-Stufen-Skala. Das ist keine Stufe null.</small>}</>}
          </dd>
        </div>
        <div className="signature-axis" data-signature-axis="maturity">
          <dt>Reifegrad</dt>
          <dd>
            <span className="signature-pipeline" aria-hidden="true">
              {effectPhases.map((phase, index) => <i key={phase.id} className={phase.id === maturity.phase ? "is-current" : ""}>{compact ? "" : index + 1}</i>)}
              {maturity.phase === null && <span>?</span>}
            </span>
            <span>{maturity.label}</span>
            {!compact && <><small>Ex ante → In Umsetzung → Beobachtet → Zugerechnet</small><small>{maturity.detail}</small><small>Analysefortschritt ist kein Nachweis eingetretener Wirkung.</small></>}
          </dd>
        </div>
      </dl>
    </div>
  );
}
