import { parliamentaryCases, type CaseKind, type ParliamentaryCase } from "@/data/cases";

export function listPublishedCases(kind?: CaseKind) {
  return parliamentaryCases.filter((item) => !kind || item.kind === kind);
}

export function getCase(slug: string): ParliamentaryCase | undefined {
  return parliamentaryCases.find((item) => item.slug === slug);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeZone: "Europe/Berlin" }).format(new Date(`${value}T12:00:00Z`));
}

export function materialityLabel(value: ParliamentaryCase["materiality"]) {
  return { VERY_HIGH: "sehr hohe Wirkungsrelevanz", HIGH: "hohe Wirkungsrelevanz", MEDIUM: "mittlere Wirkungsrelevanz", WATCH: "beobachten" }[value];
}
