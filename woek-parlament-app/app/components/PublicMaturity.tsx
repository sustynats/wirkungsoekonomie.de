import { EvidenceIcon } from "@/app/components/icons";
import type { PublicMaturityProjection } from "@/lib/presentation/public-maturity";

const layerStatusLabels = {
  AVAILABLE: "veröffentlicht",
  PENDING: "fachlich noch offen",
  OPEN: "noch nicht belastbar einzuordnen",
} as const;

export function PublicMaturity({ maturity, compact = false }: { maturity: PublicMaturityProjection; compact?: boolean }) {
  if (maturity.primary === "FACT_ONLY") {
    return (
      <div
        className={`public-maturity public-maturity--fact-only${compact ? " public-maturity--compact" : ""}`}
        role="group"
        aria-label="Faktenakte ohne veröffentlichte WÖk-Wirkungsanalyse"
        data-woek-fact-only-status="published"
      >
        <header className="public-maturity-heading">
          <span className="public-maturity-icon" aria-hidden="true"><EvidenceIcon /></span>
          <div>
            <p className="eyebrow">Faktenakte</p>
            <p className="public-maturity-label"><strong>WÖk-Wirkungsanalyse noch nicht veröffentlicht.</strong></p>
          </div>
        </header>
        <p className="public-maturity-hint">Der amtlich dokumentierte Sachverhalt bleibt zugänglich. Eine Wirkungsrichtung, Neutralität oder Wirkungslosigkeit wird daraus nicht abgeleitet.</p>
      </div>
    );
  }
  return (
    <div
      className={`public-maturity${compact ? " public-maturity--compact" : ""}`}
      role="group"
      aria-label={`Öffentlicher WÖk-Einordnungsstand: ${maturity.label}`}
      data-woek-public-maturity={maturity.primary}
    >
      <header className="public-maturity-heading">
        <span className="public-maturity-icon" aria-hidden="true"><EvidenceIcon /></span>
        <div>
          <p className="eyebrow">Öffentlicher Einordnungsstand</p>
          <p className="public-maturity-label"><strong>{maturity.label}</strong></p>
        </div>
      </header>
      <p className="public-maturity-hint">{maturity.compactHint}</p>

      {!compact && <>
        <div className="public-maturity-columns">
          {maturity.assessableNow.length > 0 ? <article>
            <h2>Was wir bereits beurteilen können</h2>
            <ul>{maturity.assessableNow.map((item) => <li key={item}>{item}</li>)}</ul>
          </article> : null}
          <article>
            <h2>Was noch offen ist oder beobachtet werden muss</h2>
            <ul>{maturity.openPoints.map((item) => <li key={item}>{item}</li>)}</ul>
            <p><strong>Offen bedeutet weder neutral noch null und auch nicht: kein Effekt oder kein Risiko.</strong></p>
          </article>
        </div>
        <div className="public-maturity-layers" role="group" aria-label="Getrennte WÖk-Prüfebenen">
          <h2>Getrennte Prüfebenen</h2>
          <dl>{maturity.layers.map((item) => <div key={item.id}>
            <dt>{item.label}</dt>
            <dd><strong>{layerStatusLabels[item.status]}</strong><span>{item.detail}</span></dd>
          </div>)}</dl>
        </div>
      </>}
    </div>
  );
}
