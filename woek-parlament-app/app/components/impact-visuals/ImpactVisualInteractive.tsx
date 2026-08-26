"use client";

import Link from "next/link";
import { useState } from "react";
import type { ImpactVisualVisibleElement } from "@/lib/impact-visuals/contracts";
import styles from "./ImpactVisualScenario.module.css";

const directionLabels = {
  POSITIVE: "positives Wirkungspotenzial",
  NEGATIVE: "negatives Wirkungspotenzial",
  AMBIVALENT: "ambivalentes Wirkungspotenzial",
  OPEN: "Wirkungsrichtung offen",
} as const;

const evidenceLabels = {
  HIGH: "hohe Evidenz",
  MEDIUM: "mittlere Evidenz",
  LOW: "geringe Evidenz",
  NOT_ASSESSABLE: "nicht belastbar beurteilbar",
} as const;

export function ImpactVisualInteractive({
  assetPath,
  altText,
  elements,
}: {
  assetPath: string;
  altText: string;
  elements: ImpactVisualVisibleElement[];
}) {
  const [activeId, setActiveId] = useState(elements[0]?.id ?? null);
  const active = elements.find((element) => element.id === activeId) ?? elements[0];

  return <div className={styles.interactive}>
    <div className={styles.imageFrame}>
      <img src={assetPath} alt={altText} width="1536" height="1024" loading="lazy" decoding="async" />
      {elements.map((element, index) => <button
        key={element.id}
        type="button"
        className={styles.marker}
        style={{ left: `${element.marker_position.x_percent}%`, top: `${element.marker_position.y_percent}%` }}
        aria-label={`Marker ${index + 1}: ${element.state_change}`}
        aria-controls={`impact-visual-legend-${element.id}`}
        aria-expanded={element.id === active?.id}
        data-active={element.id === active?.id ? "true" : "false"}
        onClick={() => setActiveId(element.id)}
      >{index + 1}</button>)}
    </div>

    <div className={styles.legend} aria-label="Was im Bild fachlich zugeordnet ist">
      <h3>Was im Bild sichtbar ist</h3>
      {elements.length === 0 ? <div className={styles.noMarkers}>
        <strong>Keine Marker gesetzt</strong>
        <p>Sichtbare Bildelemente wurden nicht mit einer fachlichen Aussage überladen: Keines ließ sich eindeutig an einen der freigegebenen Wirkpfade binden. Maßgeblich bleiben die geprüften Befunde unter dem Bild.</p>
      </div> : <ol>
        {elements.map((element, index) => <li id={`impact-visual-legend-${element.id}`} key={element.id} data-active={element.id === active?.id ? "true" : "false"}>
          <button type="button" onClick={() => setActiveId(element.id)} aria-pressed={element.id === active?.id}>
            <span>{index + 1}</span>
            <strong>{element.state_change}</strong>
          </button>
          {element.id === active?.id ? <div className={styles.legendDetail} aria-live="polite">
            <dl>
              <div><dt>Betroffene / System</dt><dd>{element.affected_group_or_system}</dd></div>
              <div><dt>Wirkungsordnung</dt><dd>{element.effect_order}. Ordnung</dd></div>
              <div><dt>Zeithorizont</dt><dd>{element.time_horizon}</dd></div>
              <div><dt>Richtung</dt><dd>{directionLabels[element.direction]}</dd></div>
              <div><dt>Evidenz</dt><dd>{evidenceLabels[element.evidence_level]}</dd></div>
              <div><dt>Unsicherheit</dt><dd>{element.uncertainty}</dd></div>
            </dl>
            <Link href={element.analysis_href}>Vollständigen Wirkpfad öffnen →</Link>
          </div> : null}
        </li>)}
      </ol>}
    </div>
  </div>;
}
