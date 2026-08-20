import type { MetadataRoute } from "next";
import { listPublishedCases } from "@/lib/cases";
import { listFachanalysen } from "@/lib/fachanalysen";
import { saxonyAnhaltElectionProgrammes } from "@/data/sachsen-anhalt-election-programmes";
import { getPublicImpactCases } from "@/lib/government/impact-cases";
import { getEuImpactCases } from "@/lib/eu/impact-cases";
import { listDnsIndicators } from "@/lib/indicators";
import { stateJurisdictions, stateSlug } from "@/lib/autopilot/registry";
import { politicalSourceCatalog } from "@/lib/commitments/source-catalog";
import { getAllCommunicationMediaImpactRecords } from "@/lib/state-programmes/communication-media-impact";
import { sourceSlugForCanonicalUrl } from "@/lib/sources/url";
import { actionPlanRequiredRoutes, actionPlanSources } from "@/lib/government/strategy-impact";

const siteUrl = "https://parlament.wirkungsoekonomie.de";

function entry(path: string, lastModified?: string, priority = 0.7): MetadataRoute.Sitemap[number] {
  return {
    url: `${siteUrl}${path}`,
    lastModified: lastModified ? new Date(`${lastModified}T12:00:00Z`) : new Date("2026-08-15T12:00:00Z"),
    changeFrequency: "weekly",
    priority
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = [
    entry("/", undefined, 1),
    entry("/bevorstehend", undefined, .9),
    entry("/entscheidungen", undefined, .9),
    entry("/historie", undefined, .8),
    entry("/monitor", undefined, .8),
    entry("/fachanalysen", undefined, .8),
    entry("/wirkungsfaelle", undefined, .9),
    entry("/wirkungsobservatorium", undefined, .8),
    entry("/regierung", undefined, .9),
    entry("/mandat-und-praxis", undefined, .8),
    entry("/laender", undefined, .8),
    entry("/laender/sachsen-anhalt", undefined, .8),
    entry("/eu", undefined, .8),
    entry("/eu/wirkungsfaelle", undefined, .8),
    entry("/eu/kommission", undefined, .7),
    entry("/eu/gesetzgebung", undefined, .7),
    entry("/eu/mandat", undefined, .7),
    entry("/methodik", undefined, .8),
    entry("/methodik/wirkindikatoren", undefined, .8),
    entry("/transparenz", undefined, .8),
    entry("/quellen", undefined, .7),
    entry("/suche", undefined, .7),
    entry("/begriffe", undefined, .7),
    entry("/wirkungsradar-updates", undefined, .6)
  ];
  const cases = listPublishedCases().map((item) => entry(`/entscheidungen/${item.slug}`, item.lastUpdated, .8));
  const analyses = listFachanalysen().map((analysis) => entry(`/fachanalysen/${analysis.slug}`, analysis.analysisDate, .8));
  const saxonyAnhaltProgrammes = saxonyAnhaltElectionProgrammes.map((programme) => entry(`/laender/sachsen-anhalt/wahlprogramme/${programme.sourceKey}`, "2026-08-16", .8));
  const communicationSourceRoutes = [...new Set(getAllCommunicationMediaImpactRecords().flatMap((record) => [
    ...record.source_refs.map((source) => source.url),
    record.fach_source.url,
  ]).map(sourceSlugForCanonicalUrl).filter((slug): slug is string => Boolean(slug)))]
    .map((slug) => entry(`/quellen/${slug}`, "2026-08-20", .6));
  const strategyEntries = actionPlanRequiredRoutes().map((path) => entry(path, "2026-08-18", .8));
  const strategySourceRoutes = [...new Set(actionPlanSources.map((source) => sourceSlugForCanonicalUrl(source.url)).filter((slug): slug is string => Boolean(slug)))]
    .map((slug) => entry(`/quellen/${slug}`, "2026-08-18", .6));
  const governmentImpacts = getPublicImpactCases();
  const euImpacts = getEuImpactCases();
  const governmentEntries = governmentImpacts.length ? [entry("/regierung/wirkungsanalysen", undefined, .9), ...governmentImpacts.map((record) => entry(`/regierung/wirkungsanalysen/${encodeURIComponent(record.impact_case_id)}`, record.analysis_as_of, .8))] : [];
  const euEntries = euImpacts.map((record) => entry(`/eu/wirkungsfaelle/${encodeURIComponent(record.impact_case_id)}`, record.analysis_as_of, .8));
  const indicatorEntries = listDnsIndicators().map((item) => entry(`/methodik/wirkindikatoren/${item.indicator_id}`, undefined, .5));
  const stateEntries = stateJurisdictions.filter((item) => item.jurisdiction_id !== "DE-ST").map((item) => entry(`/laender/${stateSlug(item.jurisdiction_id)}`, undefined, .6));
  const mandateEntries = politicalSourceCatalog.map((item) => entry(`/mandat-und-praxis/${item.sourceKey}`, undefined, .7));
  return [...staticEntries, ...cases, ...analyses, ...saxonyAnhaltProgrammes, ...communicationSourceRoutes, ...strategyEntries, ...strategySourceRoutes, ...governmentEntries, ...euEntries, ...indicatorEntries, ...stateEntries, ...mandateEntries];
}
