"use client";

import { useId, useState } from "react";
import { BoundaryIcon, CalculationIcon, EvidenceIcon, MonitorIcon, PathIcon } from "@/app/components/icons";

export type ImpactReviewDimension = {
  id: string;
  label: string;
  detail: string;
  status: string;
};

export function ImpactReviewMap({ title, dimensions }: { title: string; dimensions: ImpactReviewDimension[] }) {
  const [selectedId, setSelectedId] = useState(dimensions[0]?.id);
  const panelId = useId();
  const selected = dimensions.find((item) => item.id === selectedId) ?? dimensions[0];
  if (!selected) return null;
  return (
    <figure className="impact-review-map">
      <div className="impact-map-canvas" aria-hidden="true">
        <svg viewBox="0 0 360 250" focusable="false">
          <path className="impact-map-ring" d="M180 24 323 210H37z" />
          <path className="impact-map-line" d="M180 125 180 24M180 125 323 210M180 125 37 210" />
          <circle className="impact-map-centre" cx="180" cy="125" r="34" />
        </svg>
        <span className="impact-map-centre-label">Prüfraum</span>
      </div>
      <figcaption>
        <p className="eyebrow">Visuelle Prüflandkarte</p>
        <h2>{title}</h2>
        <p>Die Karte zeigt, welche Dimensionen geprüft werden. Sie enthält bewusst noch keine Werte oder Gesamtwertung.</p>
        <div className="impact-map-controls" role="group" aria-label="Prüfdimension auswählen">
          {dimensions.map((dimension, index) => <button aria-pressed={selected.id === dimension.id} aria-controls={panelId} className={selected.id === dimension.id ? "is-selected" : undefined} key={dimension.id} type="button" onClick={() => setSelectedId(dimension.id)}>{index === 0 ? <PathIcon /> : index === 1 ? <BoundaryIcon /> : <MonitorIcon />}<span>{dimension.label}</span></button>)}
        </div>
        <div className="impact-map-detail" id={panelId} aria-live="polite">
          <span>{selected.status}</span>
          <strong>{selected.label}</strong>
          <p>{selected.detail}</p>
        </div>
        <details className="impact-map-method">
          <summary><EvidenceIcon /> So wird aus der Prüflandkarte ein Wirkungscheck</summary>
          <ol>
            <li><PathIcon /> Wirkpfade und mögliche Nebenwirkungen abgrenzen.</li>
            <li><CalculationIcon /> Daten, Gegenfaktum und berechenbare Größen offenlegen.</li>
            <li><BoundaryIcon /> Nicht kompensierbare Grenzen getrennt prüfen.</li>
            <li><MonitorIcon /> Beobachtung und Korrekturpunkte für die Rückkopplung festlegen.</li>
          </ol>
        </details>
      </figcaption>
    </figure>
  );
}
