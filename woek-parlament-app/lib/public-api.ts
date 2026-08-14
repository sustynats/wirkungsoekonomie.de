import type { ParliamentaryCase } from "@/data/cases";

export function publicCase(item: ParliamentaryCase) {
  return {
    slug: item.slug,
    title: item.title,
    plainTitle: item.plainTitle,
    kind: item.kind,
    editorialStatus: item.editorialStatus,
    materiality: item.materiality,
    parliamentaryStatus: item.parliamentaryStatus,
    statusVerification: item.statusVerification,
    nextEvent: item.nextEvent,
    lastUpdated: item.lastUpdated,
    summary: item.summary,
    analysisStatus: item.analysisStatus,
    versionNote: item.versionNote
  };
}

export function publicImpact(item: ParliamentaryCase) {
  return {
    slug: item.slug,
    whatIsDecided: item.whatIsDecided,
    intendedGoal: item.intendedGoal,
    impactPath: item.impactPath,
    affectedGroups: item.affectedGroups,
    questions: item.questions,
    editorialStatus: item.editorialStatus
  };
}

export function publicSources(item: ParliamentaryCase) {
  return { slug: item.slug, sources: item.sources };
}

export function publicVersions(item: ParliamentaryCase) {
  return { slug: item.slug, currentVersion: item.versionNote, status: item.editorialStatus };
}
