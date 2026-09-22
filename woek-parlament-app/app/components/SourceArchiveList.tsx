"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SamePageQueryForm } from "@/app/components/SamePageNavigation";
import { sourceCategoryLabel, sourceRoleLabel, temporalClassLabel } from "@/lib/sources/public-labels";
import type { PublicSource } from "@/lib/sources/public-registry";

function dateLabel(value: string | null) {
  if (!value) return "nicht angegeben";
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(new Date(`${value}T12:00:00Z`));
}

export function SourceArchiveList({ allSources }: { allSources: PublicSource[] }) {
  const params = useSearchParams();
  const rawQuery = params.get("q") ?? "";
  const query = rawQuery.trim().toLocaleLowerCase("de");
  const filtered = query ? allSources.filter((source) => [source.title, source.institution, source.abstract, source.documentType].some((value) => value?.toLocaleLowerCase("de").includes(query))) : allSources;
  const pageSize = 48;
  const requestedPage = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);
  const maxPage = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(requestedPage, maxPage);
  const sources = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pageHref = (page: number) => `/quellen?${new URLSearchParams({ ...(rawQuery ? { q: rawQuery } : {}), page: String(page) })}`;

  return <>
    <SamePageQueryForm className="source-archive-search" role="search">
      <label htmlFor="source-search">Quellen durchsuchen</label>
      <div><input id="source-search" name="q" type="search" defaultValue={rawQuery} placeholder="Titel, Institution oder Quellenart" /><button className="button button-secondary" type="submit">Suchen</button></div>
      <p>{filtered.length.toLocaleString("de-DE")} von {allSources.length.toLocaleString("de-DE")} Quellenakten</p>
    </SamePageQueryForm>
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
      {currentPage > 1 && <Link href={pageHref(currentPage - 1)}>← Vorherige Seite</Link>}
      <span>Seite {currentPage} von {maxPage}</span>
      {currentPage < maxPage && <Link href={pageHref(currentPage + 1)}>Nächste Seite →</Link>}
    </nav>}
  </>;
}
