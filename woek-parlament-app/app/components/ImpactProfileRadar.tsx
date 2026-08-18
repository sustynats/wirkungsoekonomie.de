import { BoundaryIcon, EvidenceIcon, MonitorIcon, PathIcon } from "@/app/components/icons";

export type ImpactProfileAxisStatus = "AUSGEWIESEN" | "TEILWEISE_AUSGEWIESEN" | "OFFEN";

export type ImpactProfileAxis = {
  id: string;
  label: string;
  status: ImpactProfileAxisStatus;
  description: string;
};

const statusLabel: Record<ImpactProfileAxisStatus, string> = {
  AUSGEWIESEN: "ausgewiesen",
  TEILWEISE_AUSGEWIESEN: "teilweise ausgewiesen",
  OFFEN: "offen"
};

const statusRadius: Record<ImpactProfileAxisStatus, number> = {
  AUSGEWIESEN: 82,
  TEILWEISE_AUSGEWIESEN: 60,
  OFFEN: 38
};

function pointFor(index: number, radius: number, total: number) {
  const angle = (-90 + (360 / total) * index) * (Math.PI / 180);
  return { x: 120 + Math.cos(angle) * radius, y: 120 + Math.sin(angle) * radius };
}

function polygonPoints(axes: ImpactProfileAxis[], radiusFor: (axis: ImpactProfileAxis) => number) {
  return axes.map((axis, index) => {
    const point = pointFor(index, radiusFor(axis), axes.length);
    return `${point.x},${point.y}`;
  }).join(" ");
}

/**
 * A radar-shaped disclosure of the *documented examination state*. It is
 * deliberately not an impact score: a longer arm only means that a facet is
 * documented more fully in this particular working act.
 */
export function ImpactProfileRadar({ title = "Wirkungsprofil im Radardiagramm", axes }: { title?: string; axes: ImpactProfileAxis[] }) {
  if (axes.length < 3) return null;
  const outer = polygonPoints(axes, () => 82);
  const middle = polygonPoints(axes, () => 60);
  const inner = polygonPoints(axes, () => 38);
  const profile = polygonPoints(axes, (axis) => statusRadius[axis.status]);
  return <figure className="impact-profile-radar" aria-labelledby="impact-profile-radar-title">
    <div className="impact-profile-radar-graphic" aria-hidden="true">
      <svg viewBox="0 0 240 240" focusable="false">
        <polygon className="impact-profile-radar-ring" points={outer} />
        <polygon className="impact-profile-radar-ring" points={middle} />
        <polygon className="impact-profile-radar-ring" points={inner} />
        {axes.map((axis, index) => {
          const point = pointFor(index, 82, axes.length);
          return <line className="impact-profile-radar-axis" key={axis.id} x1="120" y1="120" x2={point.x} y2={point.y} />;
        })}
        <polygon className="impact-profile-radar-profile" points={profile} />
        {axes.map((axis, index) => {
          const point = pointFor(index, statusRadius[axis.status], axes.length);
          return <circle className={`impact-profile-radar-point impact-profile-radar-point--${axis.status.toLowerCase()}`} key={axis.id} cx={point.x} cy={point.y} r="4.5" />;
        })}
      </svg>
    </div>
    <figcaption>
      <p className="eyebrow">Visuelle Orientierung</p>
      <h2 id="impact-profile-radar-title">{title}</h2>
      <p>Das Diagramm zeigt den dokumentierten Prüfstand der Akte. Es ist keine Gesamtnote: Ein größerer Ausschlag bedeutet nicht automatisch mehr oder bessere Wirkung.</p>
      <ul className="impact-profile-radar-list">
        {axes.map((axis, index) => <li key={axis.id}>
          <span className={`impact-profile-radar-index impact-profile-radar-index--${axis.status.toLowerCase()}`}>{String(index + 1).padStart(2, "0")}</span>
          <div><strong>{axis.label}</strong><span>{statusLabel[axis.status]} · {axis.description}</span></div>
        </li>)}
      </ul>
      <div className="impact-profile-radar-note"><PathIcon aria-hidden="true" /><span>Wirkpfade, <BoundaryIcon aria-hidden="true" /> Schutzgrenzen, <EvidenceIcon aria-hidden="true" /> Evidenz und <MonitorIcon aria-hidden="true" /> Rückkopplung bleiben getrennte Prüffelder.</span></div>
    </figcaption>
  </figure>;
}
