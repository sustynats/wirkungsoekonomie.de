import { parliamentaryCases, type CaseKind, type ParliamentaryCase } from "@/data/cases";
import { materialityLabel as publicMaterialityLabel } from "@/lib/presentation/labels";

export function listPublishedCases(kind?: CaseKind) {
  return parliamentaryCases.filter((item) =>
    (item.editorialStatus === "PUBLISHED" || item.editorialStatus === "PREPARATION_PUBLISHED" || item.editorialStatus === "WORKING_ACT_PUBLISHED") &&
    item.statusVerification === "VERIFIED" &&
    (!kind || item.kind === kind)
  );
}

export function getCase(slug: string): ParliamentaryCase | undefined {
  const publicRouteAliases: Record<string, string> = {
    "schutz-vor-k-o-tropfen": "bt21-dip-907488f49a72",
  };
  const canonicalSlug = publicRouteAliases[slug] ?? slug;
  return listPublishedCases().find((item) => item.slug === canonicalSlug);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeZone: "Europe/Berlin" }).format(new Date(`${value}T12:00:00Z`));
}

export function materialityLabel(value: ParliamentaryCase["materiality"]) {
  return publicMaterialityLabel(value);
}
