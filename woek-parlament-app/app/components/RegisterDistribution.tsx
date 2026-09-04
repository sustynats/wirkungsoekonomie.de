import { directionDistribution, type RegisterObject } from "@/lib/register-model";

export function RegisterDistribution({ objects }: { objects: RegisterObject[] }) {
  const distribution = directionDistribution(objects);
  let position = 0;
  const segments = distribution.filter((item) => item.count > 0).map((item) => {
    const width = item.count / objects.length * 1000;
    const segment = { ...item, x: position, width };
    position += width;
    return segment;
  });
  return <section className="register-distribution" aria-labelledby="register-distribution-title">
    <h2 id="register-distribution-title">Wirkungsrichtungen im gewählten Bestand</h2>
    <p>Absolute Aktenzahlen, kein Gesamturteil. Getrennte Pfade werden nicht verrechnet; Analyse und beobachtete Wirkung bleiben getrennt.</p>
    <svg className="register-distribution-bar" viewBox="0 0 1000 16" preserveAspectRatio="none" aria-hidden="true">
      <defs><pattern id="register-open-hatch" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M-2 2L2-2M0 8L8 0M6 10L10 6" className="register-hatch-stroke" /></pattern></defs>
      {segments.map((item) => <g key={item.value} data-register-segment={item.value} data-count={item.count}>
        {item.kind === "ambivalent" ? <><rect x={item.x} width={item.width / 2} height="16" className="register-direction--risk" /><rect x={item.x + item.width / 2} width={item.width / 2} height="16" className="register-direction--positive" /></> : <rect x={item.x} width={item.width} height="16" className={`register-direction--${item.kind}`} fill={item.kind === "open" ? "url(#register-open-hatch)" : undefined} />}
      </g>)}
    </svg>
    <dl>{distribution.map((item) => <div key={item.value} data-register-direction={item.value}><dt><span aria-hidden="true">{item.symbol}</span> {item.label}</dt><dd>{item.count}</dd></div>)}</dl>
  </section>;
}
