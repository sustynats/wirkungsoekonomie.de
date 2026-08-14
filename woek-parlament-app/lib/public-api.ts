import { getCase, listCases } from "@/lib/cases";
import { listPublishedPortalCases, type PublishedPortalCase } from "@/lib/published-cases";

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

function toPublicDatabaseCase(item: PublishedPortalCase) {
  return {
    id: item.slug,
    type: item.kind,
    title: item.title,
    originalTitle: item.originalTitle,
    status: "VERIFIED",
    editorialStatus: "PUBLISHED",
    phase: item.nextEvent ? "Anstehend" : "Veröffentlicht",
    term: item.nextEvent ?? item.decisionDate ?? item.lastActivityOn,
    materiality: null,
    updatedAt: item.lastUpdated,
    links: { html: `/entscheidungen/${item.slug}`, dossier: `/entscheidungen/${item.slug}#dossier` }
  };
}

export async function publicCases() {
  const [databaseCases, demonstrators] = await Promise.all([
    listPublishedPortalCases(),
    Promise.resolve(listCases().filter((item) => item.editorialStatus === "DEMONSTRATOR"))
  ]);
  return [...databaseCases.map(toPublicDatabaseCase), ...demonstrators.map(toPublicCase)];
}
