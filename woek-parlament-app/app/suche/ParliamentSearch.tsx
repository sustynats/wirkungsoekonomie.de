"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ParliamentaryCase } from "@/data/cases";
import type { Fachanalyse } from "@/data/fachanalysen";
import { materialityLabel } from "@/lib/cases";
import { humanizeSystemValue } from "@/lib/presentation/labels";
import type { FactionImpactProfile } from "@/lib/members/impact-profiles";
import type { PublicMemberDirectoryProfile } from "@/lib/members/public-profiles";
import { defaultSearchFilters, searchFachanalysen, searchFactionProfiles, searchMemberProfiles, searchPublicCases, type ParliamentSearchFilters } from "@/lib/search";
import { wirkungsraumBookmarkUrl } from "@/lib/wirkungsraum";

const TYPE_LABELS: Record<ParliamentSearchFilters["type"], string> = {
  ALL: "Alle Inhaltstypen",
  RADAR: "Parlamentsradar",
  IMPACT_BRIEF: "Wirkungsbrief",
  FULL_CHECK: "Wirkungscheck",
  RETROSPECTIVE_CASE: "Historischer Rückblick",
  FACHANALYSE: "WÖk-Fachanalyse",
  MEMBER_PROFILE: "Wirkungsprofil eines Mitglieds",
  FACTION_PROFILE: "Wirkungsprofil einer Fraktion"
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

export function ParliamentSearch({ cases, analyses, members, factions }: { cases: ParliamentaryCase[]; analyses: Fachanalyse[]; members: PublicMemberDirectoryProfile[]; factions: Array<{ slug: string; profile: FactionImpactProfile }> }) {
  const [filters, setFilters] = useState<ParliamentSearchFilters>(defaultSearchFilters);
  const results = useMemo(() => [
    ...searchPublicCases(cases, filters).map((item) => ({ type: "CASE" as const, item })),
    ...searchFachanalysen(analyses, filters).map((item) => ({ type: "FACHANALYSE" as const, item })),
    ...searchMemberProfiles(members, filters).map((item) => ({ type: "MEMBER_PROFILE" as const, item })),
    ...searchFactionProfiles(factions, filters).map((item) => ({ type: "FACTION_PROFILE" as const, item }))
  ], [analyses, cases, factions, filters, members]);
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
          {results.map((result) => {
            if (result.type === "CASE") return <CaseSearchResult item={result.item} key={`case-${result.item.slug}`} />;
            if (result.type === "FACHANALYSE") return <FachanalyseSearchResult item={result.item} key={`analysis-${result.item.slug}`} />;
            if (result.type === "MEMBER_PROFILE") return <MemberSearchResult item={result.item} key={`member-${result.item.slug}`} />;
            return <FactionSearchResult slug={result.item.slug} profile={result.item.profile} key={`faction-${result.item.slug}`} />;
          })}
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

function MemberSearchResult({ item }: { item: PublicMemberDirectoryProfile }) {
  const path = `/abgeordnete/${item.slug}`;
  return <article><div><p className="eyebrow">Wirkungsprofil · Abgeordnete</p><h2><Link href={path}>{item.displayName}</Link></h2><p>{item.impactProfileAvailable ? `${item.documentedVotes} amtlich dokumentierte namentliche Entscheidung ist mit ihrem Wirkungsprofil verknüpft.` : "Für das aktuelle 28-Fälle-Set liegt noch keine passende namentliche WÖk-Abstimmung vor."}</p><dl><div><dt>Fraktion oder Gruppe</dt><dd>{item.parliamentaryGroup ?? "Nicht ausgewiesen"}</dd></div><div><dt>Datenstatus</dt><dd>{item.impactProfileAvailable ? "Wirkungsprofil vorhanden" : "Noch ohne passende Einzelstimme"}</dd></div></dl></div><div className="search-result-actions"><Link className="text-link" href={path}>Profil öffnen <span aria-hidden="true">→</span></Link></div></article>;
}

function FactionSearchResult({ slug, profile }: { slug: string; profile: FactionImpactProfile }) {
  const path = `/fraktionen/${slug}`;
  return <article><div><p className="eyebrow">Wirkungsprofil · Fraktion</p><h2><Link href={path}>{profile.faction.name}</Link></h2><p>{profile.scope.documented_faction_positions} dokumentierte Positionen werden mit den Wirkungsprofilen der Entscheidungen verbunden – ohne Score oder Ranking.</p><dl><div><dt>Fallset</dt><dd>{profile.scope.case_set}</dd></div><div><dt>Parlament</dt><dd>{profile.scope.parliament}</dd></div></dl></div><div className="search-result-actions"><Link className="text-link" href={path}>Fraktionsprofil öffnen <span aria-hidden="true">→</span></Link></div></article>;
}

function SelectFilter({ label, value, values, onChange }: { label: string; value: string; values: Record<string, string>; onChange: (value: string) => void }) {
  return <label><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{Object.entries(values).map(([key, text]) => <option value={key} key={key}>{text}</option>)}</select></label>;
}

function CaseSearchResult({ item }: { item: ParliamentaryCase }) {
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

function FachanalyseSearchResult({ item }: { item: Fachanalyse }) {
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
