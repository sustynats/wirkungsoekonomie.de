import Link from "next/link";
import type { ParliamentaryCase } from "@/data/cases";
import { editorialLabel, materialityLabel } from "@/lib/cases";

export function CaseCard({ item }: { item: ParliamentaryCase }) {
  return <article className="decision-card">
    <div className="card-meta"><span className={`chip chip--${item.statusVerification.toLowerCase()}`}>{editorialLabel(item.editorialStatus)}</span><span>Wirkungsrelevanz: {materialityLabel(item.materiality)}</span></div>
    <p className="original-title">{item.title}</p>
    <h2><Link href={`/entscheidungen/${item.slug}`}>{item.plainTitle}</Link></h2>
    <dl className="card-details">
      <div><dt>Phase</dt><dd>{item.phaseLabel}</dd></div>
      <div><dt>Termin</dt><dd>{item.termLabel}</dd></div>
      <div><dt>Analyse</dt><dd>{item.analysisStatus}</dd></div>
    </dl>
    {item.changedSinceLastAnalysis ? <p className="changed-marker">Seit letzter Analyse geändert</p> : null}
    <div className="card-actions"><Link href={`/entscheidungen/${item.slug}#60-sekunden`}>60 Sekunden</Link><Link href={`/entscheidungen/${item.slug}#interaktiv`}>Interaktiv prüfen</Link><Link href={`/entscheidungen/${item.slug}#dossier`}>Fachdossier</Link></div>
  </article>;
}
