"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { SamePageQueryForm } from "@/app/components/SamePageNavigation";
import type { GovernmentActionIndexEntry } from "@/lib/government/public-contract";
import { governmentActionThemeTerms } from "@/lib/government/public-filters";
import { actionTypeLabels, coverageLabels, lifecycleLabels } from "@/lib/government/public-labels";

function formatDate(value: string | null) {
  if (!value) return "Datum offen";
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date(`${value.slice(0, 10)}T12:00:00Z`));
}

function ResultCard({ action }: { action: GovernmentActionIndexEntry }) {
  return <article className="government-action-card" data-woek-preview-card="fact-index">
    <h2><Link href={`/regierung/akte/${encodeURIComponent(action.id)}`}>{action.title}</Link></h2>
    <div className="government-card-meta" data-woek-process-metadata>
      <span className="chip chip--depth">{actionTypeLabels[action.actionType] ?? action.actionType}</span>
      <time dateTime={action.decisionDate ?? undefined}>{formatDate(action.decisionDate)}</time>
    </div>
    <dl className="government-card-facts" data-woek-process-metadata>
      <div><dt>Verfahrensstand</dt><dd>{lifecycleLabels[action.lifecycleStatus] ?? action.lifecycleStatus}</dd></div>
      <div><dt>Zuständig</dt><dd>{action.responsibleInstitutions.join(", ") || "Institution noch nicht öffentlich zugeordnet"}</dd></div>
    </dl>
    <p className="coverage-line"><span aria-hidden="true">◌</span> {coverageLabels[action.coverageScopeStatus] ?? action.coverageScopeStatus}</p>
    <p className="analysis-line"><strong>Wirkungsanalyse:</strong> Fachlich freigegebene Einordnungen stehen in der Detailakte.</p>
    <Link className="text-link" href={`/regierung/akte/${encodeURIComponent(action.id)}`}>Regierungsakte öffnen</Link>
  </article>;
}

export function GovernmentActionDirectory({
  initialCards,
  totalCount,
  types,
}: {
  initialCards: ReactNode;
  totalCount: number;
  types: string[];
}) {
  const params = useSearchParams();
  const query = (params.get("q") ?? "").trim().toLocaleLowerCase("de");
  const type = params.get("typ") ?? "";
  const theme = params.get("thema") ?? "";
  const hasFilter = Boolean(query || type || theme);
  const [entries, setEntries] = useState<GovernmentActionIndexEntry[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (!hasFilter || entries || loadFailed) return;
    let cancelled = false;
    fetch("/regierung/akte/index.json")
      .then((response) => {
        if (!response.ok) throw new Error(`Index request failed with ${response.status}`);
        return response.json() as Promise<GovernmentActionIndexEntry[]>;
      })
      .then((value) => { if (!cancelled) setEntries(value); })
      .catch(() => { if (!cancelled) setLoadFailed(true); });
    return () => { cancelled = true; };
  }, [entries, hasFilter, loadFailed]);

  const filtered = useMemo(() => {
    if (!entries) return [];
    return entries.filter((action) => {
      const themeMatch = !theme || (governmentActionThemeTerms[theme] ?? []).some((term) => action.haystack.includes(term));
      return (!query || action.haystack.includes(query)) && (!type || action.actionType === type) && themeMatch;
    });
  }, [entries, query, theme, type]);

  return <>
    <SamePageQueryForm key={params.toString()} className="government-filter" role="search">
      <label>Regierungsakte durchsuchen<input name="q" type="search" defaultValue={params.get("q") ?? ""} placeholder="Titel, Ressort oder amtliche Kennung" /></label>
      <label>Art des Regierungsakts<select name="typ" defaultValue={type}><option value="">Alle Arten</option>{types.map((value) => <option key={value} value={value}>{actionTypeLabels[value] ?? value}</option>)}</select></label>
      <label>Themenfeld<select name="thema" defaultValue={theme}><option value="">Alle Themen</option>{Object.keys(governmentActionThemeTerms).map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
      <button className="button button-primary" type="submit">Filtern</button>
    </SamePageQueryForm>

    {!hasFilter ? <>
      <p className="government-result-count" aria-live="polite">{totalCount.toLocaleString("de-DE")} Akten. Angezeigt werden die neuesten 120.</p>
      <div className="government-action-grid">{initialCards}</div>
      {totalCount > 120 && <div className="notice notice-neutral"><strong>Faktenbestand durchsuchbar</strong><p>Nutze Suche oder Filter, um den vollständigen Bestand einzugrenzen.</p></div>}
    </> : loadFailed ? <div className="notice notice-neutral"><strong>Der statische Suchindex konnte nicht geladen werden.</strong><p>Die neuesten Akten bleiben ohne Filter verfügbar. Versuche es bitte erneut.</p></div>
      : !entries ? <p className="government-result-count" aria-live="polite">Statischer Suchindex wird geladen …</p>
        : <>
          <p className="government-result-count" aria-live="polite">{filtered.length.toLocaleString("de-DE")} Treffer. Angezeigt werden höchstens 120 je Ansicht.</p>
          <div className="government-action-grid">{filtered.slice(0, 120).map((action) => <ResultCard key={action.id} action={action} />)}</div>
          {filtered.length > 120 && <div className="notice notice-neutral"><strong>Ergebnis begrenzt</strong><p>Bitte Suche oder Filter verfeinern. So wird der umfangreiche Faktenbestand nicht vollständig in eine einzelne Browseransicht geladen.</p></div>}
        </>}
  </>;
}
