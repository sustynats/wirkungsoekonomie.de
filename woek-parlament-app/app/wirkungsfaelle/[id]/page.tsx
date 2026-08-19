import Link from "next/link";
import { notFound } from "next/navigation";
import { GovernmentImpactCase, GovernmentProcessSection } from "@/app/components/government/GovernmentImpactCase";
import { getPublicImpactCases, governmentEditorialProjection, publicRecordFromFullSchema } from "@/lib/government/impact-cases";
import { getApprovedPoliticalImpactCase } from "@/lib/parliament/daily-impact-cases";
import { analysisUpdatesForImpactCase, evidenceEventsForImpactCase } from "@/lib/observatory/public-data";
import { sourceDetailHrefForUrl } from "@/lib/sources/public-registry";
import { publicSystemLabel } from "@/lib/presentation/labels";

export default async function ImpactCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const governmentRecord = getPublicImpactCases().find((entry) => entry.impact_case_id === decoded);
  const parliamentaryRecord = governmentRecord ? null : getApprovedPoliticalImpactCase(decoded);
  const record = governmentRecord ?? (parliamentaryRecord ? publicRecordFromFullSchema(parliamentaryRecord) : null);
  if (!record || governmentEditorialProjection(record).status !== "PASS") notFound();
  const evidenceEvents = evidenceEventsForImpactCase(decoded);
  const updates = analysisUpdatesForImpactCase(decoded);
  return <main className="shell content-page"><nav className="breadcrumb" aria-label="Pfad"><Link href="/wirkungsfaelle">Wirkungsfälle</Link><span aria-hidden="true">/</span><span>{record.title}</span></nav><GovernmentImpactCase record={record} includeProcess={false} />
    {evidenceEvents.length > 0 && <section className="section section-compact" aria-labelledby="observed-development" data-woek-evidence-history="published"><p className="eyebrow">Wirkungsobservatorium</p><h2 id="observed-development">Beobachtete Entwicklung</h2><p>Neue Daten verändern eine Bewertung nicht automatisch. Die Timeline zeigt Quelle, Datenqualität, Wirkpfadbezug und die Grenze der Zurechnung.</p><div className="source-register">{evidenceEvents.map((event) => { const relations = (Array.isArray(event.relation_to_impact_case) ? event.relation_to_impact_case : [event.relation_to_impact_case]).map(publicSystemLabel).filter((value): value is string => Boolean(value)); const attribution = publicSystemLabel(event.attribution_status); return <article key={event.evidence_event_id}><p className="source-register-label">Beobachtung: {event.observation_date} · veröffentlicht: {event.publication_date}</p><h3>{event.title}</h3><p>{event.concise_public_summary}</p><p><strong>Betroffene Zustandsgröße:</strong> {event.affected_state_variables.join(", ")}</p>{(relations.length > 0 || attribution) && <p>{relations.length > 0 && <><strong>Bezug:</strong> {relations.join(", ")}</>}{relations.length > 0 && attribution ? " · " : ""}{attribution && <><strong>Zurechnung:</strong> {attribution}</>}</p>}<p>{event.what_changed_or_may_change}</p><ul>{event.official_source_refs.map((source) => { const url = typeof source === "string" ? source : source.url; return <li key={url}><Link href={sourceDetailHrefForUrl(url)}>Quellenakte öffnen</Link></li>; })}</ul></article>; })}</div></section>}
    {updates.length > 0 && <section className="section section-compact" aria-labelledby="analysis-changes" data-woek-evidence-history="published"><p className="eyebrow">Versionsvergleich</p><h2 id="analysis-changes">Was hat die Bewertung verändert?</h2><div className="source-register">{updates.map((update) => <article key={`${update.analysis_version}-${update.supersedes_analysis_version}`}><h3>Analyse {update.supersedes_analysis_version} → {update.analysis_version}</h3><p>{update.public_change_summary}</p><p><strong>Grund:</strong> {update.change_reason}</p><p><strong>Geänderte Felder:</strong> {update.changed_fields.join(", ")}</p></article>)}</div></section>}
    <GovernmentProcessSection record={record} />
  </main>;
}
