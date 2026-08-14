import { parliamentaryCases, type EditorialStatus, type Materiality } from "@/data/cases";

export function getCase(slug: string) {
  return parliamentaryCases.find((item) => item.slug === slug);
}

export function listCases() {
  return parliamentaryCases;
}

export function formatDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(new Date(`${value}T12:00:00Z`));
}

export function materialityLabel(value: Materiality) {
  return { VERY_HIGH: "sehr hoch", HIGH: "hoch", MEDIUM: "mittel", WATCH: "beobachten" }[value];
}

export function editorialLabel(value: EditorialStatus) {
  return { DEMONSTRATOR: "Synthetischer Demonstrator", CONTENT_REQUIRED: "CONTENT_REQUIRED", PUBLISHED: "Veröffentlicht" }[value];
}
