import { getCase, listCases } from "@/lib/cases";

export function toPublicCase(item: NonNullable<ReturnType<typeof getCase>>) {
  return {
    id: item.slug,
    type: item.kind,
    title: item.plainTitle,
    originalTitle: item.title,
    status: item.statusVerification,
    editorialStatus: item.editorialStatus,
    phase: item.phaseLabel,
    term: item.termLabel,
    materiality: item.materiality,
    updatedAt: item.lastUpdated,
    publishedConclusion: item.publishedConclusion,
    links: { html: `/entscheidungen/${item.slug}`, dossier: `/entscheidungen/${item.slug}#dossier` }
  };
}

export function publicCases() {
  return listCases().map(toPublicCase);
}
