import Link from "next/link";
import { listPublicSources, sourceCategoryLabel, sourceRoleLabel, temporalClassLabel } from "@/lib/sources/public-registry";

export const dynamic = "force-dynamic";

function dateLabel(value: string | null) {
  if (!value) return "nicht angegeben";
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(new Date(`${value}T12:00:00Z`));
}

export default async function SourcesPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const params = await searchParams;
  const query = (params.q ?? "").trim().toLocaleLowerCase("de");
  const allSources = await listPublicSources();
  const filtered = query ? allSources.filter((source) => [source.title, source.institution, source.abstract, source.documentType].some((value) => value?.toLocaleLowerCase("de").includes(query))) : allSources;
  const pageSize = 48;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const maxPage = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, maxPage);
  const sources = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
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
      <form className="source-archive-search" action="/quellen" method="get" role="search">
        <label htmlFor="source-search">Quellen durchsuchen</label>
        <div><input id="source-search" name="q" type="search" defaultValue={params.q ?? ""} placeholder="Titel, Institution oder Quellenart" /><button className="button button-secondary" type="submit">Suchen</button></div>
        <p>{filtered.length.toLocaleString("de-DE")} von {allSources.length.toLocaleString("de-DE")} Quellenakten</p>
      </form>
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
      {maxPage > 1 && <nav className="pagination" aria-label="Seitennavigation">
        {currentPage > 1 && <Link href={`/quellen?${new URLSearchParams({ ...(params.q ? { q: params.q } : {}), page: String(currentPage - 1) })}`}>← Vorherige Seite</Link>}
        <span>Seite {currentPage} von {maxPage}</span>
        {currentPage < maxPage && <Link href={`/quellen?${new URLSearchParams({ ...(params.q ? { q: params.q } : {}), page: String(currentPage + 1) })}`}>Nächste Seite →</Link>}
      </nav>}
      <p className="page-return"><Link href="/transparenz">← Zu Transparenz und Grenzen</Link></p>
    </div>
  );
}
