import type { Metadata } from "next";
import Link from "next/link";
import { ParliamentSearch } from "@/app/suche/ParliamentSearch";
import { listPublishedCases } from "@/lib/cases";
import { listFachanalysen } from "@/lib/fachanalysen";
import { listFactionImpactProfiles } from "@/lib/members/impact-profiles";
import { listPublishedMemberProfiles } from "@/lib/members/public-profiles";

export const metadata: Metadata = {
  title: "Suche",
  description: "Durchsuche veröffentlichte Wirkungschecks, Fachanalysen sowie Wirkungsprofile von Abgeordneten und Fraktionen."
};

export const dynamic = "force-dynamic";

export default async function SearchPage() {
  const members = await listPublishedMemberProfiles();
  return (
    <div className="shell content-page">
      <header className="page-intro">
        <p className="eyebrow">Wirkungsportal durchsuchen</p>
        <h1>Entscheidungen, Wirkungschecks und Quellen finden</h1>
        <p className="lead">Suchen Sie nach einem Thema, einer Drucksache, einer parlamentarischen Entscheidung, einem Mitglied des Bundestags oder einer Fraktion. Die Treffer zeigen getrennt, was amtlich belegt, was bereits fachlich eingeordnet und was noch offen ist.</p>
      </header>
      <ParliamentSearch cases={listPublishedCases()} analyses={listFachanalysen()} members={members} factions={listFactionImpactProfiles()} />
      <p className="page-return"><Link href="/">← Zur Portalstartseite</Link></p>
    </div>
  );
}
