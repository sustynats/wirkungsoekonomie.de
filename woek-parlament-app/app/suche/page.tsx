import type { Metadata } from "next";
import Link from "next/link";
import { ParliamentSearch } from "@/app/suche/ParliamentSearch";
import { listPublishedCases } from "@/lib/cases";
import { listFachanalysen } from "@/lib/fachanalysen";
import type { SearchableCase, SearchableFachanalyse } from "@/lib/search";

export const metadata: Metadata = {
  title: "Suche",
  description: "Durchsuche veröffentlichte Wirkungschecks, Hinweise aus dem Parlamentsradar und historische Rückblicke des Wirkungsportals."
};

export default function SearchPage() {
  const cases: SearchableCase[] = listPublishedCases().map(({ slug, title, plainTitle, kind, editorialStatus, materiality, parliamentaryStatus, statusVerification, summary, whatIsDecided, intendedGoal, analysisStatus, impactPath, affectedGroups, questions, sources }) => ({ slug, title, plainTitle, kind, editorialStatus, materiality, parliamentaryStatus, statusVerification, summary, whatIsDecided, intendedGoal, analysisStatus, impactPath, affectedGroups, questions, sources }));
  const analyses: SearchableFachanalyse[] = listFachanalysen().map(({ slug, title, subtitle, type, status, scope, summary, focusAreas }) => ({ slug, title, subtitle, type, status, scope, summary, focusAreas }));
  return (
    <div className="shell content-page">
      <header className="page-intro">
        <p className="eyebrow">Wirkungsportal durchsuchen</p>
        <h1>Entscheidungen, Wirkungschecks und Quellen finden</h1>
        <p className="lead">Suchen Sie nach einem Thema, einer Drucksache oder einer parlamentarischen Entscheidung. Die Treffer zeigen getrennt, was amtlich belegt, was bereits fachlich eingeordnet und was noch offen ist.</p>
      </header>
      <ParliamentSearch cases={cases} analyses={analyses} />
      <p className="page-return"><Link href="/">← Zur Portalstartseite</Link></p>
    </div>
  );
}
