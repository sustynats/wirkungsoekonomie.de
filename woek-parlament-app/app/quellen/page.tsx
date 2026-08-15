import Link from "next/link";
import { listPublicSources, sourceCategoryLabel, sourceRoleLabel, temporalClassLabel } from "@/lib/sources/public-registry";

export const dynamic = "force-dynamic";

function dateLabel(value: string | null) {
  if (!value) return "nicht angegeben";
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(new Date(`${value}T12:00:00Z`));
}

export default async function SourcesPage() {
  const sources = await listPublicSources();
  return (
    <div className="shell content-page source-archive-page">
      <header className="page-intro">
        <p className="eyebrow">Quellenarchiv</p>
        <h1>Jede Quelle mit Herkunft, Rolle und Fundstelle</h1>
        <p className="lead">Das Quellenarchiv zeigt nicht nur einen Link: Es dokumentiert Fassung, herausgebende Stelle, zeitliche Einordnung und die veröffentlichten Wirkungschecks, in denen eine Quelle entscheidungstragend verwendet wird.</p>
      </header>
      <section className="source-archive-principles" aria-label="Grundsätze des Quellenarchivs">
        <article><strong>Parlamentarische Originalquellen</strong><span>Drucksachen, Beschlussempfehlungen, Plenarprotokolle und Abstimmungsergebnisse belegen den parlamentarischen Sachverhalt.</span></article>
        <article><strong>Staatliche Datenquellen</strong><span>Statistik, Behörden, Haushaltsdaten und Evaluationen können Ausgangslage, Umsetzung und beobachtete Veränderungen belegen.</span></article>
        <article><strong>Wissenschaftliche Evidenz</strong><span>Studien, Reviews, Metaanalysen, Forschungsberichte und anerkannte Datensätze können Wirkmechanismen und Grenzen stützen.</span></article>
        <article><strong>Politische Originalquellen</strong><span>Wahlprogramme, Koalitionsverträge und Parteibeschlüsse belegen Aussagen und Zusagen der jeweiligen politischen Akteure – keine amtlichen Tatsachen.</span></article>
        <article><strong>Interessen- und Praxisevidenz</strong><span>Beiträge von Verbänden, Gewerkschaften, Unternehmen, NGOs und Betroffenenorganisationen zeigen Perspektiven und Erfahrungen. Diese Rolle wird sichtbar gekennzeichnet.</span></article>
        <article><strong>WÖk-Referenzen</strong><span>Begriffsleitfaden, Bewertungsregeln und Indikatoren erläutern Methode und Wertmaßstab. Sie ersetzen keine Tatsachenquelle.</span></article>
      </section>
      {sources.length > 0 ? (
        <div className="source-archive-list">
          {sources.map((source) => <article key={source.id}>
            <div>
              <p className="source-register-label">{sourceCategoryLabel[source.category]} · {sourceRoleLabel[source.role]}</p>
              <h2><Link href={`/quellen/${source.slug}`}>{source.title}</Link></h2>
              <p>{source.abstract ?? "Die Detailansicht dokumentiert Herkunft, Fassung und die konkrete Verwendung im Wirkungscheck."}</p>
              <dl>
                <div><dt>Herausgegeben von</dt><dd>{source.institution}</dd></div>
                <div><dt>Dokumentdatum</dt><dd>{dateLabel(source.documentDate)}</dd></div>
                <div><dt>Zeitliche Einordnung</dt><dd>{temporalClassLabel[source.temporalClass]}</dd></div>
                <div><dt>Verwendet in</dt><dd>{source.usages.length} veröffentlichten Check{source.usages.length === 1 ? "" : "s"}</dd></div>
              </dl>
            </div>
            <Link className="text-link" href={`/quellen/${source.slug}`}>Quelle ansehen →</Link>
          </article>)}
        </div>
      ) : (
        <section className="notice notice-neutral">
          <strong>Das Quellenarchiv wächst mit den veröffentlichten Wirkungschecks.</strong>
          <p>Jede veröffentlichte Quelle erhält eine eigene Detailansicht: mit Herkunft, Fassung, zeitlicher Rolle und nachvollziehbarer Verwendung. Nicht veröffentlichte Arbeitsmaterialien erscheinen nicht im öffentlichen Archiv.</p>
        </section>
      )}
      <p className="page-return"><Link href="/transparenz">← Zu Transparenz und Grenzen</Link></p>
    </div>
  );
}
