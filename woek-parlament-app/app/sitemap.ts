import type { MetadataRoute } from "next";
import { listPublishedCases } from "@/lib/cases";
import { listFachanalysen } from "@/lib/fachanalysen";
import { saxonyAnhaltElectionProgrammes } from "@/data/sachsen-anhalt-election-programmes";
import { getPublicImpactCases } from "@/lib/government/impact-cases";

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
    entry("/eu/kommission", undefined, .7),
    entry("/eu/gesetzgebung", undefined, .7),
    entry("/eu/mandat", undefined, .7),
    entry("/methodik", undefined, .8),
    entry("/transparenz", undefined, .8),
    entry("/quellen", undefined, .7),
    entry("/begriffe", undefined, .7),
    entry("/wirkungsradar-updates", undefined, .6)
  ];
  const cases = listPublishedCases().map((item) => entry(`/entscheidungen/${item.slug}`, item.lastUpdated, .8));
  const analyses = listFachanalysen().map((analysis) => entry(`/fachanalysen/${analysis.slug}`, analysis.analysisDate, .8));
  const saxonyAnhaltProgrammes = saxonyAnhaltElectionProgrammes.map((programme) => entry(`/laender/sachsen-anhalt/wahlprogramme/${programme.sourceKey}`, "2026-08-16", .8));
  const governmentImpacts = getPublicImpactCases();
  const governmentEntries = governmentImpacts.length ? [entry("/regierung/wirkungsanalysen", undefined, .9), ...governmentImpacts.map((record) => entry(`/regierung/wirkungsanalysen/${encodeURIComponent(record.impact_case_id)}`, record.analysis_as_of, .8))] : [];
  return [...staticEntries, ...cases, ...analyses, ...saxonyAnhaltProgrammes, ...governmentEntries];
}
