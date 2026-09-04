import Link from "next/link";
import type { PortalStand } from "@/lib/portal-stand";

/** Publication inventory, never an effect count or a combined judgement. */
export function CurrentAreaOverview({ stand }: { stand: PortalStand }) {
  return <section aria-labelledby="area-current-title"><h2 id="area-current-title">Veröffentlichter Bestand</h2>
    <dl className="portal-area-counts">
      <div><dt>Vorgänge im Parlamentsradar</dt><dd data-area-count="radar">{stand.radar}</dd></div>
      <div><dt>Akten im gemeinsamen Register</dt><dd data-area-count="published">{stand.published}</dd></div>
    </dl>
    <p>Jüngster datierter Aktenstand: {stand.latestRecordDate ? <time dateTime={stand.latestRecordDate}>{stand.latestRecordDate}</time> : "offen"}. Ein Aktualisierungsdatum ist kein Wirkungsnachweis.</p>
  </section>;
}

export function MonitorAreaOverview({ stand }: { stand: PortalStand }) {
  return <section aria-labelledby="area-monitor-title"><h2 id="area-monitor-title">Wissensstände im veröffentlichten Register</h2>
    <dl className="portal-area-counts">{stand.maturity.map(stage => <div key={stage.id}><dt>{stage.symbol} {stage.label}</dt><dd data-area-maturity={stage.id}>{stage.count}</dd></div>)}</dl>
    <p>Gezählt werden Akten nach ausdrücklich zugeordnetem Reifegrad, nicht Wirkungen. Offen bleibt eine eigene Kategorie; eine Veröffentlichung ist kein Nachweis von Umsetzung oder Zurechnung.</p>
    <Link href="/wirkungsakten">Akten und Aussagegrenzen im Register öffnen →</Link>
  </section>;
}

export function StandardAreaOverview() {
  return <section aria-labelledby="area-standard-title"><h2 id="area-standard-title">Drei Achsen. Keine Note.</h2>
    <dl className="portal-area-principles">
      <div><dt>Wirkungsrichtung</dt><dd>↗ ↘ Gegenläufige Pfade bleiben getrennt. Kein Mittelwert.</dd></div>
      <div><dt>Evidenz</dt><dd>○ Vier Stufen nur bei freigegebener Einstufung. Offen ist weder neutral noch null.</dd></div>
      <div><dt>Reifegrad</dt><dd>● Ex ante, Umsetzung, Beobachtung und Zurechnung sind getrennte Wissensstände.</dd></div>
    </dl>
  </section>;
}
