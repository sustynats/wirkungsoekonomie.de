"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ParliamentaryCase } from "@/data/cases";
import { BookmarkLink } from "@/app/components/BookmarkLink";

const topicRules: Array<{ label: string; terms: string[] }> = [
  { label: "Haushalt & Finanzen", terms: ["haushalt", "steuer", "finanz", "sondervermögen", "investition"] },
  { label: "Gesundheit & Soziales", terms: ["gesund", "pflege", "rente", "sozial", "famil", "bürgergeld"] },
  { label: "Klima, Energie & Umwelt", terms: ["klima", "energie", "umwelt", "natur", "emission", "tier", "landwirtschaft"] },
  { label: "Recht, Demokratie & Inneres", terms: ["recht", "demokr", "sicherheit", "straf", "polizei", "asyl", "migration"] },
  { label: "Bildung, Forschung & Digitales", terms: ["bildung", "schule", "forschung", "digital", "daten", "innovation"] },
  { label: "Wohnen, Verkehr & Infrastruktur", terms: ["wohn", "bau", "verkehr", "mobil", "infrastruktur", "bahn"] },
  { label: "Wirtschaft & Arbeit", terms: ["wirtschaft", "arbeit", "unternehmen", "industrie", "handel"] },
  { label: "Europa & Internationales", terms: ["europ", "international", "verteidigung", "ukraine", "auswärt"] }
];

function searchText(item: ParliamentaryCase) {
  return [item.plainTitle, item.title, item.summary, item.whatIsDecided, item.intendedGoal, item.parliamentaryStatus, ...item.affectedGroups].join(" ").toLocaleLowerCase("de");
}

function topicFor(item: ParliamentaryCase) {
  const value = searchText(item);
  return topicRules.find((rule) => rule.terms.some((term) => value.includes(term)))?.label ?? "Weitere Themen";
}

function statusFor(item: ParliamentaryCase) {
  if (item.publicWorkingAct?.voteLayer || /beschlossen|angenommen|abgelehnt/i.test(item.parliamentaryStatus)) return "Entschieden";
  if (item.kind === "RADAR" || /beratung|verfahren|ausschuss|entwurf/i.test(item.parliamentaryStatus)) return "Im Verfahren";
  return "In Prüfung";
}

function typeLabel(item: ParliamentaryCase) {
  if (item.kind === "RADAR") return "Bevorstehender Vorgang";
  if (item.kind === "RETROSPECTIVE_CASE") return "Historischer Rückblick";
  if (item.kind === "IMPACT_BRIEF") return "Wirkungsbrief";
  return item.publicWorkingAct?.voteLayer ? "Entschiedener Vorgang" : "Wirkungsakte";
}

function formattedDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeZone: "Europe/Berlin" }).format(new Date(`${value}T12:00:00Z`));
}

function ExplorerCard({ item }: { item: ParliamentaryCase }) {
  return <article className="case-card">
    <div className="case-card-topline"><span className="case-type-mark case-type-mark--compact">{typeLabel(item)}</span><span className="chip chip--phase">{topicFor(item)}</span></div>
    <h3><Link href={`/entscheidungen/${item.slug}`}>{item.plainTitle}</Link></h3>
    <p>{item.summary}</p>
    <dl className="case-meta">
      <div><dt>Verfahrensstand</dt><dd>{statusFor(item)}</dd></div>
      <div><dt>Amtlicher Status</dt><dd>{item.parliamentaryStatus}</dd></div>
      <div><dt>Aktualisiert</dt><dd>{formattedDate(item.lastUpdated)}</dd></div>
    </dl>
    <div className="case-card-actions"><Link className="text-link" href={`/entscheidungen/${item.slug}`}>Wirkungsakte öffnen <span aria-hidden="true">→</span></Link><BookmarkLink title={item.title} path={`/entscheidungen/${item.slug}`} compact /></div>
  </article>;
}

export function DecisionCaseExplorer({ cases }: { cases: ParliamentaryCase[] }) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("Alle Themen");
  const [status, setStatus] = useState("Alle Stände");
  const [sort, setSort] = useState("updated");
  const topics = useMemo(() => [...new Set(cases.map(topicFor))].sort((a, b) => a.localeCompare(b, "de")), [cases]);
  const statuses = useMemo(() => [...new Set(cases.map(statusFor))].sort((a, b) => a.localeCompare(b, "de")), [cases]);
  const filtered = useMemo(() => cases
    .filter((item) => !query.trim() || searchText(item).includes(query.trim().toLocaleLowerCase("de")))
    .filter((item) => topic === "Alle Themen" || topicFor(item) === topic)
    .filter((item) => status === "Alle Stände" || statusFor(item) === status)
    .sort((a, b) => sort === "title" ? a.plainTitle.localeCompare(b.plainTitle, "de") : b.lastUpdated.localeCompare(a.lastUpdated)), [cases, query, topic, status, sort]);

  return <section className="decision-case-explorer" aria-labelledby="decision-explorer-title">
    <div className="decision-filter" role="search" aria-labelledby="decision-explorer-title">
      <div className="decision-filter-heading"><div><p className="eyebrow">Fälle erschließen</p><h2 id="decision-explorer-title">Wirkungschecks finden</h2></div><p aria-live="polite"><strong>{filtered.length}</strong> von {cases.length} Vorgängen</p></div>
      <div className="decision-filter-fields">
        <label>Suchbegriff<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Titel, Inhalt oder Ziel" /></label>
        <label>Thema<select value={topic} onChange={(event) => setTopic(event.target.value)}><option>Alle Themen</option>{topics.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label>Verfahrensstand<select value={status} onChange={(event) => setStatus(event.target.value)}><option>Alle Stände</option>{statuses.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label>Sortierung<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="updated">zuletzt aktualisiert</option><option value="title">alphabetisch</option></select></label>
      </div>
      {(query || topic !== "Alle Themen" || status !== "Alle Stände") && <button type="button" className="text-button" onClick={() => { setQuery(""); setTopic("Alle Themen"); setStatus("Alle Stände"); }}>Filter zurücksetzen</button>}
    </div>
    {filtered.length > 0 ? <div className="card-grid">{filtered.map((item) => <ExplorerCard item={item} key={item.slug} />)}</div> : <div className="notice"><strong>Für diese Auswahl wurde kein Vorgang gefunden.</strong><p>Setze einen Filter zurück oder verwende einen allgemeineren Suchbegriff.</p></div>}
  </section>;
}
