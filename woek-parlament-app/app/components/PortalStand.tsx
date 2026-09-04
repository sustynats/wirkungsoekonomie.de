import Link from "next/link";
import type { PortalStand as Stand } from "@/lib/portal-stand";

export function PortalStand({ stand }: { stand: Stand }) {
  let offset = 0;
  return <section className="home-stand" data-home-block="stand" aria-labelledby="portal-stand-title">
    <div className="shell">
      <h2 id="portal-stand-title">Portalstand</h2>
      <dl className="home-stand-counts">
        <div><dt>Akten im gemeinsamen Register</dt><dd data-portal-count="published">{stand.published}</dd></div>
        <div><dt>Vorgänge im Parlamentsradar</dt><dd data-portal-count="radar">{stand.radar}</dd></div>
        <div><dt>Länder mit Fachstand</dt><dd><span data-portal-count="states">{stand.statesWithReview}</span> / {stand.states.length}</dd></div>
      </dl>
      <svg className="home-maturity-ribbon" viewBox="0 0 1000 16" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <defs><pattern id="home-maturity-open" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="currentColor" /><path d="M0 6L6 0" className="home-ribbon-hatch" /></pattern></defs>
        {stand.maturity.map((stage) => {
          const x = offset; const width = stand.published ? stage.count / stand.published * 1000 : 0; offset += width;
          return <rect key={stage.id} x={x} y="0" width={width} height="16" className={`home-maturity-${stage.id}`} fill={stage.id === "open" ? "url(#home-maturity-open)" : undefined} data-maturity-segment={stage.id} data-count={stage.count} />;
        })}
      </svg>
      <ul className="home-maturity-legend" aria-label="Akten je Reifestufe">
        {stand.maturity.map((stage) => <li key={stage.id} data-maturity-category={stage.id}><span>{stage.symbol} {stage.label}</span> <strong>{stage.count}</strong></li>)}
      </ul>
      <p className="home-stand-note">Jüngster datierter Aktenstand: {stand.latestRecordDate ? <time dateTime={stand.latestRecordDate}>{stand.latestRecordDate.split("-").reverse().join(".")}</time> : "offen"}. {stand.undatedRecords} Akten ohne vergleichbares Datum. <Link href="/pruefstandard/transparenz#portalstand">Zählweise und Grenzen</Link></p>
    </div>
  </section>;
}
