import type { ParliamentaryCase } from "@/data/cases";
import { sourceDetailHrefForUrl } from "@/lib/sources/public-registry";
import { parliamentaryOverviewAssessment } from "@/lib/presentation/overview-assessment";

export function publicParliamentSummary(item: ParliamentaryCase) {
  return parliamentaryOverviewAssessment(item)
    ? item.summary
    : `Amtlich dokumentierter parlamentarischer Vorgang: ${item.plainTitle}. Eine WÖk-Wirkungsanalyse ist noch nicht veröffentlicht.`;
}

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
    summary: publicParliamentSummary(item),
    analysisStatus: item.analysisStatus,
    versionNote: item.versionNote
  };
}

export function publicImpact(item: ParliamentaryCase) {
  const assessment = parliamentaryOverviewAssessment(item);
  if (!assessment) {
    return {
      slug: item.slug,
      publicationStatus: "FACT_ONLY" as const,
      whatIsDecided: item.whatIsDecided,
      editorialStatus: item.editorialStatus,
      woekAnalysisPublished: false,
    };
  }
  return {
    slug: item.slug,
    publicationStatus: "WOEK_ANALYSIS_PUBLISHED" as const,
    whatIsDecided: item.whatIsDecided,
    intendedGoal: item.intendedGoal,
    impactPath: item.impactPath,
    affectedGroups: item.affectedGroups,
    questions: item.questions,
    editorialStatus: item.editorialStatus,
    woekAnalysisPublished: true,
  };
}

export function publicSources(item: ParliamentaryCase) {
  return {
    slug: item.slug,
    sources: item.sources.map(({ url: _originalUrl, ...source }) => ({
      ...source,
      detailUrl: sourceDetailHrefForUrl(_originalUrl)
    }))
  };
}

export function publicVersions(item: ParliamentaryCase) {
  return { slug: item.slug, currentVersion: item.versionNote, status: item.editorialStatus };
}
