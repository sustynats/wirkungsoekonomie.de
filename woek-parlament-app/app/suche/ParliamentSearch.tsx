"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { humanizeSystemValue, materialityLabel } from "@/lib/presentation/labels";
import { defaultSearchFilters, searchFachanalysen, searchGovernmentImpacts, searchPublicCases, type ParliamentSearchFilters, type SearchableCase, type SearchableFachanalyse, type SearchableGovernmentImpact } from "@/lib/search";
import { wirkungsraumBookmarkUrl } from "@/lib/wirkungsraum";

const TYPE_LABELS: Record<ParliamentSearchFilters["type"], string> = {
  ALL: "Alle Inhaltstypen",
  RADAR: "Parlamentsradar",
  IMPACT_BRIEF: "Wirkungsbrief",
  FULL_CHECK: "Wirkungscheck",
  RETROSPECTIVE_CASE: "Historischer Rückblick",
  FACHANALYSE: "WÖk-Fachanalyse",
  REGIERUNGSANALYSE: "Regierungs-Wirkungsanalyse"
};

const EDITORIAL_LABELS: Record<ParliamentSearchFilters["editorial"], string> = {
  ALL: "Alle Analyse-Stände",
  PREPARATION_PUBLISHED: "WÖk-Analyse vor der Entscheidung",
  WORKING_ACT_PUBLISHED: "Wirkungsakte veröffentlicht",
  PUBLISHED: "Fachlich veröffentlicht",
  DEMONSTRATOR: "Demonstrator",
  CONTENT_REQUIRED: "Noch nicht bewertbar"
};

const MATERIALITY_LABELS: Record<ParliamentSearchFilters["materiality"], string> = {
  ALL: "Alle Prüfrelevanzstufen",
  VERY_HIGH: "Sehr hohe Prüfrelevanz",
  HIGH: "Hohe Prüfrelevanz",
  MEDIUM: "Mittlere Prüfrelevanz",
  WATCH: "Beobachten"
};

const SOURCE_LABELS: Record<ParliamentSearchFilters["source"], string> = {
  ALL: "Alle Quellenarten",
  VERIFIED: "Amtliche Quelle geprüft",
  EDITORIAL_DEMONSTRATOR: "Demonstrator",
  STATUS_UNVERIFIED: "Noch ohne veröffentlichte Fallquelle"
};

export function ParliamentSearch({ cases, analyses, governmentImpacts }: { cases: SearchableCase[]; analyses: SearchableFachanalyse[]; governmentImpacts: SearchableGovernmentImpact[] }) {
  const [filters, setFilters] = useState<ParliamentSearchFilters>(defaultSearchFilters);
  const results = useMemo(() => [
    ...searchPublicCases(cases, filters).map((item) => ({ type: "CASE" as const, item })),
    ...searchFachanalysen(analyses, filters).map((item) => ({ type: "FACHANALYSE" as const, item })),
    ...searchGovernmentImpacts(governmentImpacts, filters).map((item) => ({ type: "REGIERUNGSANALYSE" as const, item }))
  ], [analyses, cases, filters, governmentImpacts]);
  const update = <Key extends keyof ParliamentSearchFilters>(key: Key, value: ParliamentSearchFilters[Key]) => setFilters((current) => ({ ...current, [key]: value }));

  return (
    <>
      <form className="parliament-search" onSubmit={(event) => event.preventDefault()} aria-label="Wirkungsportal durchsuchen">
        <label className="search-query-label">
          <span>Entscheidung, Drucksache oder Stichwort</span>
          <input
            type="search"
            value={filters.query}
            onChange={(event) => update("query", event.target.value)}
            placeholder="z. B. Wohnen, Gesundheit, Drucksache …"
          />
        </label>
        <div className="search-filter-grid">
          <SelectFilter label="Inhaltstyp" value={filters.type} values={TYPE_LABELS} onChange={(value) => update("type", value as ParliamentSearchFilters["type"])} />
          <SelectFilter label="Stand der WÖk-Analyse" value={filters.editorial} values={EDITORIAL_LABELS} onChange={(value) => update("editorial", value as ParliamentSearchFilters["editorial"])} />
          <SelectFilter label="Prüfrelevanz" value={filters.materiality} values={MATERIALITY_LABELS} onChange={(value) => update("materiality", value as ParliamentSearchFilters["materiality"])} />
          <SelectFilter label="Art der belegenden Quellen" value={filters.source} values={SOURCE_LABELS} onChange={(value) => update("source", value as ParliamentSearchFilters["source"])} />
        </div>
        <div className="search-actions">
          <button className="button button-secondary" type="button" onClick={() => setFilters(defaultSearchFilters)}>Filter zurücksetzen</button>
          <span aria-live="polite">{results.length} {results.length === 1 ? "Treffer" : "Treffer"}</span>
        </div>
      </form>

      {results.length ? (
        <div className="search-result-list" aria-label="Suchtreffer">
          {results.map((result) => result.type === "CASE"
            ? <CaseSearchResult item={result.item} key={result.item.slug} />
            : result.type === "FACHANALYSE"
              ? <FachanalyseSearchResult item={result.item} key={result.item.slug} />
              : <GovernmentImpactSearchResult item={result.item} key={result.item.impactCaseId} />)}
        </div>
      ) : (
        <div className="notice">
          <strong>Keine veröffentlichten Inhalte passen zu diesen Filtern.</strong>
          <p>Nicht veröffentlichte Rohdaten und ungeprüfte Bewertungen erscheinen bewusst nicht in der Suche.</p>
        </div>
      )}
    </>
  );
}

function GovernmentImpactSearchResult({ item }: { item: SearchableGovernmentImpact }) {
  const path = `/regierung/wirkungsanalysen/${encodeURIComponent(item.impactCaseId)}`;
  return (
    <article>
      <div>
        <p className="eyebrow">Regierungs-Wirkungsanalyse · {item.analysisMode === "IMPACT_REALITY_CHECK" ? "Reality-Check" : "Ex ante"}</p>
        <h2><Link href={path}>{item.title}</Link></h2>
        <p>{item.summary}</p>
        <dl><div><dt>Prüfstand</dt><dd>Fachlich freigegebener WÖkImpactCase</dd></div><div><dt>Materialität</dt><dd>{item.materiality}</dd></div></dl>
      </div>
      <div className="search-result-actions">
        <Link className="text-link" href={path}>Wirkungsanalyse öffnen <span aria-hidden="true">→</span></Link>
        <a className="bookmark-link bookmark-link-compact" href={wirkungsraumBookmarkUrl({ title: item.title, path })}>◇ Merken</a>
      </div>
    </article>
  );
}

function SelectFilter({ label, value, values, onChange }: { label: string; value: string; values: Record<string, string>; onChange: (value: string) => void }) {
  return <label><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{Object.entries(values).map(([key, text]) => <option value={key} key={key}>{text}</option>)}</select></label>;
}

function CaseSearchResult({ item }: { item: SearchableCase }) {
  const path = `/entscheidungen/${item.slug}`;
  return (
    <article>
      <div>
        <p className="eyebrow">{TYPE_LABELS[item.kind]} · {materialityLabel(item.materiality)}</p>
        <h2><Link href={path}>{item.title}</Link></h2>
        <p>{item.summary}</p>
        <dl><div><dt>Parlamentarischer Status</dt><dd>{humanizeSystemValue(item.parliamentaryStatus)}</dd></div><div><dt>Stand der WÖk-Analyse</dt><dd>{EDITORIAL_LABELS[item.editorialStatus]}</dd></div><div><dt>Quellenstatus</dt><dd>{SOURCE_LABELS[item.statusVerification]}</dd></div></dl>
      </div>
      <div className="search-result-actions">
        <Link className="text-link" href={path}>Öffnen <span aria-hidden="true">→</span></Link>
        <a className="bookmark-link bookmark-link-compact" href={wirkungsraumBookmarkUrl({ title: item.title, path })}>◇ Merken</a>
      </div>
    </article>
  );
}

function FachanalyseSearchResult({ item }: { item: SearchableFachanalyse }) {
  const path = `/fachanalysen/${item.slug}`;
  return (
    <article>
      <div>
        <p className="eyebrow">WÖk-Fachanalyse · {item.scope}</p>
        <h2><Link href={path}>{item.title}</Link></h2>
        <p>{item.summary}</p>
        <dl><div><dt>Format</dt><dd>Vertiefendes Dossier</dd></div><div><dt>Prüfstand</dt><dd>{item.status === "PUBLISHED" ? "Fachlich veröffentlicht" : "In Quellen- und Methodenprüfung"}</dd></div><div><dt>Gegenstand</dt><dd>{item.scope}</dd></div></dl>
      </div>
      <div className="search-result-actions">
        <Link className="text-link" href={path}>Dossierstatus öffnen <span aria-hidden="true">→</span></Link>
        <a className="bookmark-link bookmark-link-compact" href={wirkungsraumBookmarkUrl({ title: item.title, path })}>◇ Merken</a>
      </div>
    </article>
  );
}
