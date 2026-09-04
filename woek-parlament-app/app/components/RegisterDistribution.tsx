import { directionDistribution, type RegisterObject } from "@/lib/register-model";

export function RegisterDistribution({ objects }: { objects: RegisterObject[] }) {
  const distribution = directionDistribution(objects);
  return <section className="register-distribution" aria-labelledby="register-distribution-title">
    <h2 id="register-distribution-title">Wirkungsrichtungen im gewählten Bestand</h2>
    <p>Absolute Aktenzahlen, kein Gesamturteil. Getrennte Pfade werden nicht verrechnet; Analyse und beobachtete Wirkung bleiben getrennt.</p>
    <div className="register-distribution-bar" aria-hidden="true">{distribution.filter((item) => item.count > 0).map((item) => <span key={item.value} className={`register-direction--${item.kind}`} style={{ flexGrow: item.count }} />)}</div>
    <dl>{distribution.map((item) => <div key={item.value} data-register-direction={item.value}><dt><span aria-hidden="true">{item.symbol}</span> {item.label}</dt><dd>{item.count}</dd></div>)}</dl>
  </section>;
}
