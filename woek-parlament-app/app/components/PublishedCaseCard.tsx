import Link from "next/link";
import type { PublishedPortalCase } from "@/lib/published-cases";
import { formatDate } from "@/lib/cases";

const kindLabel: Record<PublishedPortalCase["kind"], string> = {
  RADAR: "Wirkungsradar",
  IMPACT_BRIEF: "Wirkungsbrief",
  FULL_CHECK: "Vollständiger Wirkungscheck",
  RETROSPECTIVE_CASE: "WÖk-Rückblick"
};

export function PublishedCaseCard({ item }: { item: PublishedPortalCase }) {
  const date = item.nextEvent ?? item.decisionDate ?? item.lastActivityOn;
  return <article className="decision-card">
    <div className="card-meta"><span className="chip chip--verified">Veröffentlicht</span><span>{kindLabel[item.kind]}</span></div>
    {item.originalTitle ? <p className="original-title">{item.originalTitle}</p> : null}
    <h2><Link href={`/entscheidungen/${item.slug}`}>{item.title}</Link></h2>
    <dl className="card-details">
      <div><dt>{item.nextEvent ? "Nächster Termin" : "Entscheidungsstand"}</dt><dd>{date ? formatDate(date) : "Amtlich noch ohne Datum"}</dd></div>
      <div><dt>Stand</dt><dd>Redaktionell freigegeben</dd></div>
      <div><dt>Aktualisiert</dt><dd>{formatDate(item.lastUpdated)}</dd></div>
    </dl>
    <div className="card-actions"><Link href={`/entscheidungen/${item.slug}#60-sekunden`}>60 Sekunden</Link><Link href={`/entscheidungen/${item.slug}#dossier`}>Fachdossier</Link></div>
  </article>;
}
