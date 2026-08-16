import type { CaseKind, EditorialStatus, Materiality, ParliamentaryCase } from "@/data/cases";
import type { Fachanalyse } from "@/data/fachanalysen";
import type { FactionImpactProfile } from "@/lib/members/impact-profiles";
import type { PublicMemberDirectoryProfile } from "@/lib/members/public-profiles";

export type SearchTypeFilter = "ALL" | CaseKind | "FACHANALYSE" | "MEMBER_PROFILE" | "FACTION_PROFILE" | "REFERENCE";
export type SearchEditorialFilter = "ALL" | EditorialStatus;
export type SearchMaterialityFilter = "ALL" | Materiality;
export type SearchSourceFilter = "ALL" | ParliamentaryCase["statusVerification"];

export type ParliamentSearchFilters = {
  query: string;
  type: SearchTypeFilter;
  editorial: SearchEditorialFilter;
  materiality: SearchMaterialityFilter;
  source: SearchSourceFilter;
};

export const defaultSearchFilters: ParliamentSearchFilters = {
  query: "",
  type: "ALL",
  editorial: "ALL",
  materiality: "ALL",
  source: "ALL"
};

export type PortalSearchPage = {
  path: string;
  title: string;
  description: string;
  keywords: string;
};

export const portalSearchPages: PortalSearchPage[] = [
  {
    path: "/methodik",
    title: "Wie entsteht eine Wirkungsbewertung?",
    description: "Vom Originalsatz über Wirkpfad, Referenzziel, Richtung und Evidenz bis zu späterer Beobachtung, Gegenfaktum und Berechnung.",
    keywords: "Methodik Wirkungsbewertung Wirkpfad SDG SDG+ Evidenz Gegenfaktum Nichtkompensation Reverse Merit Order Formel"
  },
  {
    path: "/methodik/register",
    title: "WÖk-Masterregister v1.4",
    description: "Öffentlicher Viewer für 621 WÖk-IDs mit Indikatoren, Regeln, Quellen, Benchmarks, Kalibrierungen und offenem Prüfstatus.",
    keywords: "Masterregister WÖk-ID Indikator Scoring Regel Benchmark Schwelle Kalibrierung Datenquelle Download XLSX CSV JSON"
  }
];

export function searchPortalPages(filters: ParliamentSearchFilters): PortalSearchPage[] {
  if (filters.type !== "ALL" && filters.type !== "REFERENCE") return [];
  if (filters.editorial !== "ALL" || filters.materiality !== "ALL" || filters.source !== "ALL") return [];
  const query = normalize(filters.query);
  if (!query && filters.type !== "REFERENCE") return [];
  return portalSearchPages.filter((page) => !query || normalize(`${page.title} ${page.description} ${page.keywords}`).includes(query));
}

export function searchPublicCases(cases: ParliamentaryCase[], filters: ParliamentSearchFilters): ParliamentaryCase[] {
  const query = normalize(filters.query);
  return cases.filter((item) => {
    if (filters.type !== "ALL" && filters.type !== "FACHANALYSE" && item.kind !== filters.type) return false;
    if (filters.editorial !== "ALL" && item.editorialStatus !== filters.editorial) return false;
    if (filters.materiality !== "ALL" && item.materiality !== filters.materiality) return false;
    if (filters.source !== "ALL" && item.statusVerification !== filters.source) return false;
    return !query || searchableText(item).includes(query);
  });
}

export function searchFachanalysen(analyses: Fachanalyse[], filters: ParliamentSearchFilters): Fachanalyse[] {
  if (filters.type !== "ALL" && filters.type !== "FACHANALYSE") return [];
  if (filters.editorial !== "ALL" || filters.materiality !== "ALL" || filters.source !== "ALL") return [];
  const query = normalize(filters.query);
  return analyses.filter((analysis) => !query || normalize([
    analysis.title,
    analysis.subtitle,
    analysis.scope,
    analysis.summary,
    ...(analysis.focusAreas ?? [])
  ].join(" ")).includes(query));
}

export function searchMemberProfiles(profiles: PublicMemberDirectoryProfile[], filters: ParliamentSearchFilters): PublicMemberDirectoryProfile[] {
  if (filters.type !== "ALL" && filters.type !== "MEMBER_PROFILE") return [];
  if (filters.editorial !== "ALL" || filters.materiality !== "ALL" || filters.source !== "ALL") return [];
  const query = normalize(filters.query);
  if (!query && filters.type !== "MEMBER_PROFILE") return [];
  return profiles.filter((profile) => !query || normalize([
    profile.displayName,
    profile.parliamentaryGroup,
    profile.federalState,
    profile.constituency
  ].filter(Boolean).join(" ")).includes(query));
}

export function searchFactionProfiles(profiles: Array<{ slug: string; profile: FactionImpactProfile }>, filters: ParliamentSearchFilters) {
  if (filters.type !== "ALL" && filters.type !== "FACTION_PROFILE") return [];
  if (filters.editorial !== "ALL" || filters.materiality !== "ALL" || filters.source !== "ALL") return [];
  const query = normalize(filters.query);
  if (!query && filters.type !== "FACTION_PROFILE") return [];
  return profiles.filter(({ profile }) => !query || normalize(`${profile.faction.name} Deutscher Bundestag Fraktion Wirkungsprofil`).includes(query));
}

function searchableText(item: ParliamentaryCase): string {
  return normalize([
    item.title,
    item.plainTitle,
    item.summary,
    item.whatIsDecided,
    item.intendedGoal,
    item.parliamentaryStatus,
    item.analysisStatus,
    ...item.impactPath,
    ...item.affectedGroups,
    ...item.questions,
    ...item.sources.map((source) => `${source.title} ${source.publisher}`)
  ].join(" "));
}

function normalize(value: string): string {
  return value
    .toLocaleLowerCase("de-DE")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/\s+/g, " ")
    .trim();
}
