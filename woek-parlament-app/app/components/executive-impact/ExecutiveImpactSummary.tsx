import Link from "next/link";
import type { ExecutiveImpactSummary, ImpactDimensionSummary, ImpactDirection, ImpactMateriality } from "@/lib/executive-impact/contracts";
import styles from "./ExecutiveImpactSummary.module.css";

const direction: Record<ImpactDirection, { icon: string; label: string }> = {
  POSITIVE: { icon: "↑", label: "positiv" },
  NEGATIVE: { icon: "↓", label: "negativ" },
  NEUTRAL: { icon: "—", label: "begründet ohne materielle Richtungsänderung" },
  AMBIVALENT: { icon: "↕", label: "ambivalent" },
  OPEN: { icon: "○", label: "offen" },
};

const materiality: Record<ImpactMateriality, string> = {
  LOW: "gering",
  MEDIUM: "mittel",
  HIGH: "hoch",
  CRITICAL: "kritisch",
  OPEN: "fachlich offen",
};

const evidence = {
  HIGH: "hoch",
  MEDIUM: "mittel",
  LOW: "gering",
  NOT_ASSESSABLE: "nicht belastbar beurteilbar",
} as const;

const timeHorizon = {
  SHORT: "kurzfristig",
  MEDIUM: "mittelfristig",
  LONG: "langfristig",
  MULTI_GENERATIONAL: "generationenübergreifend",
} as const;

const severity = {
  MATERIAL: "materiell",
  HIGH: "hoch",
  CRITICAL: "kritisch",
} as const;

function Direction({ value }: { value: ImpactDirection }) {
  const item = direction[value];
  return <span className={styles.direction} data-direction={value.toLowerCase()}><span aria-hidden="true">{item.icon}</span><span>{item.label}</span></span>;
}

export function ImpactExecutiveHero({ summary }: { summary: ExecutiveImpactSummary }) {
  return <header className={styles.hero}>
    <p className={styles.eyebrow}>Executive-WÖk-Zusammenfassung · {summary.stage === "EX_ANTE" ? "ex ante" : summary.stage === "EX_POST" ? "ex post" : "Umsetzung"}</p>
    <h2>{summary.bottom_line}</h2>
    {summary.editorial_summary ? <p>{summary.editorial_summary}</p> : null}
    <p><strong>Wirkungsrichtung:</strong> {summary.direction_label}</p>
    <div className={styles.heroGrid}>
      <article><h3>Wirkungspotenzial kompakt</h3><p>{summary.why_it_matters}</p></article>
      <article><h3>{summary.key_finding ? "Key Finding" : "Systemgrenze"}</h3><p>{summary.key_finding ?? summary.system_boundary}</p></article>
    </div>
    {summary.key_finding ? <details><summary>Systemgrenze</summary><p>{summary.system_boundary}</p></details> : null}
  </header>;
}

function DimensionCard({ label, value }: { label: string; value: ImpactDimensionSummary }) {
  return <article className={styles.dimension} data-direction={value.direction.toLowerCase()}>
    <h3>{label}</h3>
    <div className={styles.dimensionSignal}><span><strong>Wirkungsrichtung:</strong> <Direction value={value.direction} /></span><strong>Materialität {materiality[value.materiality]}</strong></div>
    <p className={styles.dimensionHeadline}>{value.headline}</p>
    {value.state_changes.length ? <ul>{value.state_changes.map((item) => <li key={item}>{item}</li>)}</ul> : null}
    <details><summary>Begründung und Evidenz</summary><p>{value.rationale}</p><p><strong>Evidenz:</strong> {evidence[value.evidence]}</p></details>
  </article>;
}

export function MPDImpactTriad({ summary }: { summary: ExecutiveImpactSummary }) {
  return <section aria-labelledby={`${summary.id}-mpd`}>
    <div className={styles.sectionHeading}><p className={styles.eyebrow}>Mensch · Planet · Demokratie</p><h2 id={`${summary.id}-mpd`}>Welche Wirkungsdimensionen sind betroffen?</h2></div>
    <div className={styles.mpd}>
      <DimensionCard label="Mensch" value={summary.mpd.human} />
      <DimensionCard label="Planet" value={summary.mpd.planet} />
      <DimensionCard label="Demokratie" value={summary.mpd.democracy} />
    </div>
  </section>;
}

export function SdgImpactStrip({ summary }: { summary: ExecutiveImpactSummary }) {
  return <section aria-labelledby={`${summary.id}-sdg`}>
    <div className={styles.sectionHeading}><p className={styles.eyebrow}>SDG-Referenzrahmen</p><h2 id={`${summary.id}-sdg`}>Welche Zielbezüge tragen eine freigegebene Richtung?</h2></div>
    {summary.sdg_impacts.length ? <div className={styles.sdgStrip}>{summary.sdg_impacts.map((item) => <article key={`${item.framework}:${item.sdg_id}`} data-direction={item.direction.toLowerCase()}>
      <p>{item.framework === "WOEK_SDG_PLUS" ? "WÖk-Erweiterung" : "UN-Ziel"}</p>
      <h3>{item.sdg_id} · {item.label}</h3>
      <div><Direction value={item.direction} /><span>Materialität {materiality[item.materiality]}</span><span>Evidenz {evidence[item.evidence]}</span></div>
      <p>{item.rationale}</p>
    </article>)}</div> : <div className={styles.failClosed}><strong>Keine freigegebene SDG-Richtungsprojektion.</strong><p>Ein fehlender Zielbezug oder eine fehlende Fachprojektion wird nicht als neutraler Effekt ausgegeben.</p></div>}
  </section>;
}

export function MaterialImpactPaths({ summary }: { summary: ExecutiveImpactSummary }) {
  return <section aria-labelledby={`${summary.id}-paths`}>
    <div className={styles.sectionHeading}><p className={styles.eyebrow}>Materielle Wirkpfade</p><h2 id={`${summary.id}-paths`}>Was könnte sich konkret verändern?</h2><p>{summary.materiality_selection_rationale}</p></div>
    {summary.material_paths.length ? <div className={styles.paths}>{summary.material_paths.map((path) => <article key={path.id} data-direction={path.direction.toLowerCase()}>
      <div className={styles.pathSignal}><Direction value={path.direction} /><span>Materialität {materiality[path.materiality]}</span><span>Evidenz {evidence[path.evidence]}</span></div>
      <h3>{path.title}</h3>
      <p><strong>Zustandsänderung:</strong> {path.state_change}</p>
      {path.affected_group_or_system ? <p><strong>Für wen oder was:</strong> {path.affected_group_or_system}</p> : <p className={styles.openValue}><strong>Für wen oder was:</strong> im freigegebenen Kurzdatensatz nicht separat strukturiert</p>}
      <p><strong>Warum relevant?</strong> {path.why_relevant}</p>
      <details><summary>Mechanismus und Quellenbindung</summary><p>{path.mechanism}</p><p><strong>Wirkungsordnung:</strong> {path.effect_order ? `${path.effect_order}. Ordnung` : "nicht separat freigegeben"}</p><p><strong>Zeithorizont:</strong> {path.time_horizon ? timeHorizon[path.time_horizon] : "nicht separat freigegeben"}</p><p><strong>Pfad-ID:</strong> {path.source_path_ids.join(", ")}</p></details>
    </article>)}</div> : <div className={styles.failClosed}><strong>Keine freigegebene Auswahl materieller Wirkpfade.</strong><p>Technisch vorhandene oder zuerst geprüfte Einträge werden nicht automatisch als die wichtigsten Folgen ausgegeben.</p></div>}
  </section>;
}

export function NonCompensationAlert({ summary }: { summary: ExecutiveImpactSummary }) {
  if (!summary.noncompensable_risks.length) return null;
  return <aside className={styles.noncompensation} aria-labelledby={`${summary.id}-noncomp`}>
    <p className={styles.eyebrow}>Nichtkompensation · Wirkungsgrenze</p>
    <h2 id={`${summary.id}-noncomp`}>Diese Schutzgüter werden nicht gegen positive Einzelpfade verrechnet.</h2>
    <ul>{summary.noncompensable_risks.map((risk) => <li key={`${risk.protected_interest}:${risk.reason}`}><strong>{risk.protected_interest} · {severity[risk.severity]}</strong><span>{risk.reason}</span></li>)}</ul>
  </aside>;
}

export function EvidenceBand({ summary }: { summary: ExecutiveImpactSummary }) {
  return <section className={styles.evidence} aria-labelledby={`${summary.id}-evidence`}>
    <div className={styles.sectionHeading}><p className={styles.eyebrow}>Evidenz und Unsicherheit</p><h2 id={`${summary.id}-evidence`}>Wie sicher wissen wir das?</h2></div>
    <div className={styles.evidenceGrid}><article><h3>Evidenzstatus</h3><p>{summary.evidence_summary}</p></article><article><h3>Unsicherheit</h3><p>{summary.uncertainty_summary}</p></article></div>
    {summary.open_questions.length ? <details><summary>Offene Fragen</summary><ul>{summary.open_questions.map((item) => <li key={item}>{item}</li>)}</ul></details> : null}
  </section>;
}

export function CommunicationImpactPreview({ summary }: { summary: ExecutiveImpactSummary }) {
  const preview = summary.communication_preview;
  if (!preview) return null;
  return <aside className={styles.communication} aria-labelledby={`${summary.id}-communication`}>
    <p className={styles.eyebrow}>Getrennte Analyseachse</p><h2 id={`${summary.id}-communication`}>Kommunikationswirkung</h2>
    <h3>{preview.assessment_label}</h3><p>{preview.summary}</p><p><strong>Evidenz:</strong> {preview.evidence_summary}</p><p><strong>Nichtkompensation:</strong> {preview.noncompensation}</p>
    <a href={preview.href}>Kommunikationsanalyse öffnen →</a>
  </aside>;
}

export function ImpactRealityCheck({ summary }: { summary: ExecutiveImpactSummary }) {
  return <section aria-labelledby={`${summary.id}-reality`}>
    <div className={styles.sectionHeading}><p className={styles.eyebrow}>Reality-Check</p><h2 id={`${summary.id}-reality`}>Woran wäre eine tatsächliche Veränderung später prüfbar?</h2></div>
    {summary.reality_check_indicators.length ? <ul>{summary.reality_check_indicators.map((item) => <li key={item}>{item}</li>)}</ul> : <div className={styles.failClosed}><strong>Noch keine freigegebenen Beobachtungsindikatoren.</strong><p>Ein politischer Beschluss oder ein sichtbares Bild gilt nicht als beobachtete Wirkung.</p></div>}
  </section>;
}

export function SourceTransparencyDrawer({ summary }: { summary: ExecutiveImpactSummary }) {
  return <details className={styles.sources}><summary>Analyse-, Versions- und Quellenprovenienz</summary><dl><div><dt>Analyseversion</dt><dd>{summary.analysis_version}</dd></div><div><dt>Wissensstand</dt><dd>{summary.knowledge_cutoff}</dd></div><div><dt>Editorial-Status</dt><dd>{summary.editorial_status === "APPROVED" ? "freigegeben" : summary.editorial_status === "PARTIAL" ? "teilweise freigegeben; fehlende Schichten bleiben offen" : "keine freigegebene Executive-Projektion"}</dd></div></dl><ul>{summary.source_refs.map((source) => <li key={source.id}>{source.href.startsWith("/") ? <Link href={source.href}>{source.label}</Link> : <a href={source.href} rel="noreferrer">{source.label}</a>}</li>)}</ul></details>;
}

export function ExecutiveImpactSummaryView({ summary }: { summary: ExecutiveImpactSummary }) {
  return <section className={styles.summary} id="gesamtbefund" data-woek-executive-impact={summary.editorial_status} aria-label="Executive-WÖk-Wirkungszusammenfassung">
    <ImpactExecutiveHero summary={summary} />
    <MPDImpactTriad summary={summary} />
    <MaterialImpactPaths summary={summary} />
    <NonCompensationAlert summary={summary} />
    <SdgImpactStrip summary={summary} />
    <EvidenceBand summary={summary} />
    <CommunicationImpactPreview summary={summary} />
    <ImpactRealityCheck summary={summary} />
    <SourceTransparencyDrawer summary={summary} />
  </section>;
}
