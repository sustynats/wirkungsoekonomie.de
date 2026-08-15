import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicSource, sourceCategoryLabel, sourceRoleLabel, temporalClassLabel } from "@/lib/sources/public-registry";

export const dynamic = "force-dynamic";

function dateLabel(value: string | null) {
  if (!value) return "nicht angegeben";
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date(`${value}T12:00:00Z`));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const source = await getPublicSource((await params).slug);
  return source ? { title: source.title, description: `Quellendetail: ${source.institution}.` } : { title: "Quelle nicht gefunden" };
}

export default async function SourceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const source = await getPublicSource((await params).slug);
  if (!source) notFound();
  return (
    <div className="shell content-page source-detail-page">
      <p className="breadcrumb"><Link href="/quellen">Quellenarchiv</Link><span>/</span><span>{sourceCategoryLabel[source.category]}</span></p>
      <header className="source-detail-header">
        <div>
          <p className="eyebrow">{sourceCategoryLabel[source.category]}</p>
          <h1>{source.title}</h1>
          <p className="lead">{source.abstract ?? "Diese Seite dokumentiert die veröffentlichte Quelle und ihre nachvollziehbare Verwendung im Wirkungsportal."}</p>
        </div>
        <a className="button button-primary" href={source.canonicalUrl} target="_blank" rel="noreferrer">Originalquelle öffnen ↗</a>
      </header>
      <div className="source-detail-grid">
        <section className="decision-section">
          <h2>Quellensteckbrief</h2>
          <dl className="source-facts">
            <div><dt>Herausgebende Stelle</dt><dd>{source.institution}</dd></div>
            <div><dt>Dokumenttyp</dt><dd>{source.documentType}</dd></div>
            <div><dt>Dokumentdatum</dt><dd>{dateLabel(source.documentDate)}</dd></div>
            <div><dt>Zuletzt abgerufen</dt><dd>{dateLabel(source.retrievedAt.slice(0, 10))}</dd></div>
            <div><dt>Fassung</dt><dd>{source.versionLabel ?? "Keine gesonderte Fassungsangabe veröffentlicht"}</dd></div>
            <div><dt>Prüfrolle</dt><dd>{sourceRoleLabel[source.role]}</dd></div>
            <div><dt>Zeitliche Einordnung</dt><dd>{temporalClassLabel[source.temporalClass]}</dd></div>
            <div><dt>Quellenfingerabdruck</dt><dd>{source.sourceHash ?? "Für diese Veröffentlichung nicht verfügbar"}</dd></div>
          </dl>
        </section>
        <aside className="decision-section side-card">
          <h2>Warum diese Einordnung?</h2>
          <p>Die zeitliche Klasse steuert, ob eine Quelle für die Ex-ante-Perspektive einer Entscheidung verwendet werden darf. Eine nachträglich veröffentlichte Evaluation kann sie nicht ersetzen.</p>
          <Link className="text-link" href="/methodik">Prüfstandard ansehen →</Link>
        </aside>
      </div>
      <section className="decision-section source-usage-section">
        <p className="eyebrow">Verwendung im Portal</p>
        <h2>Verknüpfte Wirkungschecks</h2>
        {source.usages.length > 0 ? <div className="source-usage-list">{source.usages.map((usage) => <article key={`${usage.caseSlug}-${usage.sourceRole}`}>
          <div>
            <p className="source-register-label">{sourceRoleLabel[usage.sourceRole]}{usage.decisionDate ? ` · Entscheidung ${dateLabel(usage.decisionDate)}` : ""}</p>
            <h3><Link href={`/entscheidungen/${usage.caseSlug}`}>{usage.caseTitle}</Link></h3>
            {usage.note && <p>{usage.note}</p>}
            {usage.locations.length > 0 && <p className="source-locations"><strong>Relevante Fundstellen:</strong> {usage.locations.join(" · ")}</p>}
          </div>
          <Link className="text-link" href={`/entscheidungen/${usage.caseSlug}`}>Check ansehen →</Link>
        </article>)}</div> : <p>Diese Quelle ist veröffentlicht, aber derzeit keinem veröffentlichten Wirkungscheck zugeordnet.</p>}
      </section>
    </div>
  );
}
