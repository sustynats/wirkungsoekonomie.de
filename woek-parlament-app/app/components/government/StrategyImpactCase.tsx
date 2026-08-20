import Link from "next/link";
import { FullAnalysisText } from "@/app/components/FullAnalysisText";
import { OverviewAssessment } from "@/app/components/OverviewAssessment";
import {
  ACTION_PLAN_META_ID,
  actionPlanAssessmentForMission,
  actionPlanMetaAssessment,
  actionPlanMetaPaths,
  actionPlanMetaQualityLayers,
  actionPlanRouteFor,
  actionPlanSources,
  getActionPlanMetaMarkdown,
  getActionPlanMissions,
  missionDeepDives,
  strategySourceHashes,
  type ActionPlanMission,
  type StrategyQualityLayer,
} from "@/lib/government/strategy-impact";
import { sourceDetailHrefForUrl } from "@/lib/sources/public-registry";

function StrategySources({ mission }: { mission?: ActionPlanMission }) {
  const sources = actionPlanSources.filter((source) => source.usedBy === "ALL"
    || (!mission && source.usedBy === "META")
    || ((!mission || mission.id === "WOEK-AKN-2026-M04") && source.usedBy === "META_AND_M04"));
  return <section aria-labelledby={`strategy-sources-${mission?.mission ?? "meta"}`}>
    <p className="eyebrow">Vollakte · Originalquellen</p>
    <h2 id={`strategy-sources-${mission?.mission ?? "meta"}`}>Welche Quellen tragen diese Einordnung?</h2>
    <div className="government-impact-grid">{sources.map((source) => <article key={source.url}>
      <h3>{source.title}</h3>
      <p>{source.abstract}</p>
      <p><strong>Fundstellen:</strong> {source.locations.join("; ")}</p>
      <Link className="text-link" href={sourceDetailHrefForUrl(source.url)}>Quellenakte mit Original öffnen</Link>
    </article>)}</div>
  </section>;
}

function ImpactPath({ path }: { path: { A: string; M: string; deltaZ?: string; delta_Z?: string; R: string; risk?: string } }) {
  return <article className="strategy-impact-path">
    <dl>
      <div><dt>Auslöser / Instrument</dt><dd>{path.A}</dd></div>
      <div><dt>Wirkmechanismus</dt><dd>{path.M}</dd></div>
      <div><dt>Mögliche Zustandsänderung</dt><dd>{path.deltaZ ?? path.delta_Z}</dd></div>
      <div><dt>Referenzraum</dt><dd>{path.R}</dd></div>
      {path.risk ? <div><dt>Materielles Risiko</dt><dd>{path.risk}</dd></div> : null}
    </dl>
  </article>;
}

function QualityLayers({ layers }: { layers: StrategyQualityLayer[] }) {
  return <div className="strategy-quality-layers">
    {layers.map((layer) => <details key={layer.id}>
      <summary>{layer.title}</summary>
      <p>{layer.text}</p>
    </details>)}
  </div>;
}

function StrategyStatus({ full = false }: { full?: boolean }) {
  return <div className="open-state" role="note">
    <span aria-hidden="true">i</span>
    <div>
      <strong>{full ? "Vertiefte Ex-ante-Wirkungsakte der Beteiligungsfassung" : "Initiale Ex-ante-Missionsakte"}</strong>
      <p>{full
        ? "Wirkung ist noch nicht beobachtbar. DNS-Ziele und Indikatoren dienen als Referenz- und Monitoringrahmen, nicht als Kausalitätsbeweis."
        : "Die Wirklogik aus der freigegebenen Fachquelle ist veröffentlicht; eine vertiefte Problem-, Ziel-, Rechts- und Delivery-Prüfung liegt für diese Mission noch nicht fachlich freigegeben vor. Offen bedeutet weder neutral noch wirkungslos."}</p>
    </div>
  </div>;
}

export function ActionPlanMetaPreview() {
  return <article className="government-impact-case strategy-impact-case" data-woek-preview-card="published">
    <header>
      <h2><Link href={actionPlanRouteFor(ACTION_PLAN_META_ID)}>Aktionsplan Nachhaltigkeit 2026 – Meta-Wirkungsfall</Link></h2>
      <OverviewAssessment assessment={actionPlanMetaAssessment} compact />
      <p className="eyebrow" data-woek-process-metadata>Beteiligungsfassung · 19 Missionen · Ex-ante-Analyse</p>
      <Link className="text-link" href={actionPlanRouteFor(ACTION_PLAN_META_ID)}>Wirkungsakte öffnen</Link>
    </header>
  </article>;
}

export function ActionPlanMissionPreview({ mission }: { mission: ActionPlanMission }) {
  const assessment = actionPlanAssessmentForMission(mission);
  return <article className="government-impact-case strategy-impact-case" data-woek-preview-card="published">
    <header>
      <h2><Link href={actionPlanRouteFor(mission.id)}>Mission {mission.mission}: {mission.title}</Link></h2>
      <OverviewAssessment assessment={assessment} compact />
      <p className="eyebrow" data-woek-process-metadata>{mission.lead} · Beteiligungsfassung · Ex ante</p>
      <Link className="text-link" href={actionPlanRouteFor(mission.id)}>Missionsakte öffnen</Link>
    </header>
  </article>;
}

export function ActionPlanMetaDetail() {
  const missions = getActionPlanMissions();
  const sourceHash = strategySourceHashes()["aktionsplan-nachhaltigkeit-2026-meta.md"];
  return <article className="government-impact-case strategy-detail" data-woek-preview-card="published">
    <header>
      <p className="eyebrow">Bundesregierung · Nachhaltigkeitsgovernance</p>
      <h1>Aktionsplan Nachhaltigkeit 2026</h1>
      <OverviewAssessment assessment={actionPlanMetaAssessment} />
      <StrategyStatus full />
    </header>

    <section aria-labelledby="strategy-reference">
      <p className="eyebrow">Executive Overview</p>
      <h2 id="strategy-reference">DNS 2025 ist Referenzrahmen – nicht Regierungswirkung</h2>
      <p>Die Deutsche Nachhaltigkeitsstrategie 2025 liefert Ziele und Indikatoren, gegen die Maßnahmen und spätere Zustandsentwicklungen beobachtet werden können. Ein Zielbezug und selbst eine spätere Zielannäherung beweisen jedoch weder Kausalität noch Zurechnung zu diesem Aktionsplan.</p>
      <div className="notice"><strong>Keine Gesamtnote und keine automatische Empfehlung</strong><p>Die 19 heterogenen Missionen werden nicht verrechnet. Der frühere Vorschlag für standardisierte Wirkungssheets bleibt als historische Designanregung sichtbar; er ist kein fachlich freigegebener RecommendationRecord.</p></div>
    </section>

    <section aria-labelledby="strategy-paths">
      <p className="eyebrow">Deep Dive · Wirkungslogik</p>
      <h2 id="strategy-paths">Wie kann der Plan staatliche Wirkungssteuerung verändern?</h2>
      <div className="strategy-path-grid">{actionPlanMetaPaths.map((path) => <div key={path.title}><h3>{path.title}</h3><ImpactPath path={path} /></div>)}</div>
    </section>

    <section aria-labelledby="strategy-missions">
      <p className="eyebrow">19 getrennte Missionsakten</p>
      <h2 id="strategy-missions">Wo die konkrete Wirkung geprüft wird</h2>
      <p>Jede Mission behält ihre eigene Wirklogik, Risiken, Beobachtungsgrößen und fachliche Reife. Gemeinsamkeit im Aktionsplan ist kein Identitäts- oder Kausalitätsbeweis.</p>
      <div className="government-impact-list">{missions.map((mission) => <ActionPlanMissionPreview key={mission.id} mission={mission} />)}</div>
    </section>

    <section aria-labelledby="strategy-quality">
      <p className="eyebrow">System-, Delivery- und Reifeprüfung</p>
      <h2 id="strategy-quality">Was für eine belastbare Wirkungskette noch geklärt werden muss</h2>
      <QualityLayers layers={actionPlanMetaQualityLayers} />
    </section>

    <section aria-labelledby="strategy-reality">
      <p className="eyebrow">Reality Check</p>
      <h2 id="strategy-reality">Noch keine beobachtbare Wirkung</h2>
      <p>Der veröffentlichte Stand ist eine Beteiligungsfassung. Ein späterer Reality Check muss tatsächliche Instrumente, Umsetzung, Zustandsdaten, Gegenfaktum und Zurechnung getrennt prüfen. Die Ex-ante-Fassung bleibt dabei historisch erhalten.</p>
      <p><strong>Versionspfad:</strong> Beteiligungsfassung vom 16. Juli 2026 → finale Fassung als neue Version → Umsetzung → Zustandsbeobachtung → fachlich freigegebener Reality Check.</p>
    </section>

    <StrategySources />
    <details className="technical-transparency">
      <summary>Technische Vollakte und unveränderter freigegebener Fachtext</summary>
      <FullAnalysisText source={{ title: "Aktionsplan Nachhaltigkeit 2026 – Meta-Wirkungsfall", releasedAt: "2026-08-18", sourceHash, markdown: getActionPlanMetaMarkdown() }} />
    </details>
    <section className="government-process-meta" data-woek-process-metadata aria-label="Technische Transparenz">
      <h2>Technische Transparenz</h2>
      <p><strong>Fachfassung:</strong> Beteiligungsfassung vom 16. Juli 2026 · <strong>Analyseart:</strong> Meta-Wirkungsfall mit getrennten Missionsakten</p>
    </section>
  </article>;
}

export function ActionPlanMissionDetail({ mission }: { mission: ActionPlanMission }) {
  const deepDive = missionDeepDives[mission.id];
  const assessment = actionPlanAssessmentForMission(mission);
  return <article className="government-impact-case strategy-detail" data-woek-preview-card="published">
    <header>
      <p className="eyebrow">Aktionsplan Nachhaltigkeit 2026 · Mission {mission.mission}</p>
      <h1>{mission.title}</h1>
      <OverviewAssessment assessment={assessment} />
      <StrategyStatus full={Boolean(deepDive)} />
    </header>

    <section aria-labelledby={`mission-target-${mission.mission}`}>
      <p className="eyebrow">Executive Overview</p>
      <h2 id={`mission-target-${mission.mission}`}>Was soll sich verändern?</h2>
      <p className="lead">{mission.target}</p>
      <p><strong>Federführung:</strong> {mission.lead}</p>
    </section>

    {deepDive ? <>
      <section aria-labelledby={`mission-review-${mission.mission}`}>
        <p className="eyebrow">Problem- und Zielprüfung</p>
        <h2 id={`mission-review-${mission.mission}`}>Sind Problem und Ziel tragfähig gefasst?</h2>
        <div className="government-impact-grid">
          <article><h3>{deepDive.problemReview.status}</h3><p>{deepDive.problemReview.text}</p><p><strong>Tatsächlicher Engpass:</strong> {deepDive.problemReview.bottleneck}</p></article>
          <article><h3>{deepDive.goalReview.status}</h3><p>{deepDive.goalReview.text}</p></article>
        </div>
      </section>
      <section aria-labelledby={`mission-quality-${mission.mission}`}>
        <p className="eyebrow">System-, Delivery- und Reifeprüfung</p>
        <h2 id={`mission-quality-${mission.mission}`}>Welche zusätzlichen Prüfungen sind entscheidend?</h2>
        <QualityLayers layers={deepDive.qualityLayers} />
      </section>
      <section aria-labelledby={`mission-deep-path-${mission.mission}`}>
        <p className="eyebrow">Vertiefte fachliche Wirklogik</p>
        <h2 id={`mission-deep-path-${mission.mission}`}>Präzisierter Wirkpfad der vertieften Prüfung</h2>
        <ImpactPath path={deepDive.path} />
      </section>
    </> : null}

    <section aria-labelledby={`mission-path-${mission.mission}`}>
      <p className="eyebrow">Deep Dive · Wirkpfad</p>
      <h2 id={`mission-path-${mission.mission}`}>Auslöser → Mechanismus → Zustandsänderung → Referenz</h2>
      <ImpactPath path={mission.path} />
      <p><strong>Materielles Risiko:</strong> {mission.risk}</p>
    </section>

    <section aria-labelledby={`mission-evidence-${mission.mission}`}>
      <h2 id={`mission-evidence-${mission.mission}`}>Evidenz, Monitoring und offene Punkte</h2>
      <p>{deepDive?.evidenceMaturity ?? assessment.evidenceSummary}</p>
      <ul>{mission.monitor.map((item) => <li key={item}>{item}</li>)}</ul>
      <p><strong>Datenfunktion:</strong> Die benannten Größen dienen als Ausgangswert, Umsetzungs-, Output-, Outcome-, Verteilungs- oder Zurechnungsinformation. Ihre genaue Funktion muss vor einer kausalen Interpretation explizit bestimmt werden.</p>
    </section>

    <section aria-labelledby={`mission-option-${mission.mission}`}>
      <h2 id={`mission-option-${mission.mission}`}>WÖk-Handlungsoption</h2>
      <p>{deepDive?.recommendationStatus ?? "Für diese Mission liegt noch kein fachlich freigegebener RecommendationRecord vor. CodeX erzeugt daraus keine Empfehlung."}</p>
    </section>

    <section aria-labelledby={`mission-reality-${mission.mission}`}>
      <p className="eyebrow">Reality Check</p>
      <h2 id={`mission-reality-${mission.mission}`}>Noch nicht beobachtbar</h2>
      <p>{assessment.realityCheckSummary}</p>
    </section>

    <StrategySources mission={mission} />
    <section className="government-process-meta" data-woek-process-metadata aria-label="Politischer Lebenslauf und technische Transparenz">
      <h2>Politischer Lebenslauf und technische Transparenz</h2>
      <p>Beteiligungsfassung vom 16. Juli 2026 → Konsultation → angekündigte finale Fassung → Umsetzung → Beobachtung.</p>
      <p><strong>Fachfassung:</strong> Beteiligungsfassung vom 16. Juli 2026 · <strong>Missionsakte:</strong> Mission {mission.mission}</p>
      <p><Link href={actionPlanRouteFor(ACTION_PLAN_META_ID)}>Zum Meta-Wirkungsfall und allen 19 Missionen</Link></p>
    </section>
  </article>;
}
