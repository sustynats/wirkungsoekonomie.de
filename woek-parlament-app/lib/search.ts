import type { CaseKind, EditorialStatus, Materiality, ParliamentaryCase } from "@/data/cases";
import type { Fachanalyse } from "@/data/fachanalysen";
import type { OverviewAssessmentData } from "@/lib/presentation/overview-assessment";
import type { PublicMaturityProjection } from "@/lib/presentation/public-maturity";

export type SearchTypeFilter = "ALL" | CaseKind | "FACHANALYSE" | "REGIERUNGSANALYSE";
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

/**
 * The client-side search receives this deliberately small public projection.
 * Full source records remain on their respective detail pages, where they are
 * needed for inspection, instead of being shipped with every search visit.
 */
export type SearchableCaseBase = Pick<ParliamentaryCase,
  "slug" | "title" | "plainTitle" | "kind" | "editorialStatus" | "materiality" |
  "parliamentaryStatus" | "statusVerification" | "summary" | "whatIsDecided" |
  "intendedGoal" | "analysisStatus" | "impactPath" | "affectedGroups" | "questions" | "sources"
>;
export type SearchableCase = SearchableCaseBase & { assessment?: OverviewAssessmentData | null; maturity: PublicMaturityProjection };

export type SearchableFachanalyse = Pick<Fachanalyse, "slug" | "title" | "subtitle" | "type" | "status" | "scope" | "summary" | "focusAreas">;
export type SearchableGovernmentImpact = {
  impactCaseId: string;
  href?: string;
  title: string;
  summary: string;
  analysisMode: "IMPACT_POTENTIAL_EX_ANTE" | "IMPACT_REALITY_CHECK";
  materiality: string;
  assessment: OverviewAssessmentData;
  maturity: PublicMaturityProjection;
  terms: string[];
};

export const defaultSearchFilters: ParliamentSearchFilters = {
  query: "",
  type: "ALL",
  editorial: "ALL",
  materiality: "ALL",
  source: "ALL"
};

export function searchPublicCases<T extends SearchableCaseBase>(cases: T[], filters: ParliamentSearchFilters): T[] {
  const query = normalize(filters.query);
  return cases.filter((item) => {
    if (filters.type !== "ALL" && filters.type !== "FACHANALYSE" && item.kind !== filters.type) return false;
    if (filters.editorial !== "ALL" && item.editorialStatus !== filters.editorial) return false;
    if (filters.materiality !== "ALL" && item.materiality !== filters.materiality) return false;
    if (filters.source !== "ALL" && item.statusVerification !== filters.source) return false;
    return !query || searchableText(item).includes(query);
  });
}

export function searchFachanalysen<T extends SearchableFachanalyse>(analyses: T[], filters: ParliamentSearchFilters): T[] {
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

export function searchGovernmentImpacts<T extends SearchableGovernmentImpact>(items: T[], filters: ParliamentSearchFilters): T[] {
  if (filters.type !== "ALL" && filters.type !== "REGIERUNGSANALYSE") return [];
  if (filters.editorial !== "ALL" || filters.materiality !== "ALL" || filters.source !== "ALL") return [];
  const query = normalize(filters.query);
  return items.filter((item) => !query || normalize([item.title, item.summary, item.analysisMode, item.materiality, ...item.terms].join(" ")).includes(query));
}

function searchableText(item: SearchableCaseBase): string {
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
