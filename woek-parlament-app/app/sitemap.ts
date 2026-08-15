import type { MetadataRoute } from "next";
import { listPublishedCases } from "@/lib/cases";
import { listFachanalysen } from "@/lib/fachanalysen";

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
    entry("/mandat-und-praxis", undefined, .8),
    entry("/laender", undefined, .8),
    entry("/laender/sachsen-anhalt", undefined, .8),
    entry("/methodik", undefined, .8),
    entry("/transparenz", undefined, .8),
    entry("/quellen", undefined, .7),
    entry("/begriffe", undefined, .7),
    entry("/wirkungsradar-updates", undefined, .6)
  ];
  const cases = listPublishedCases().map((item) => entry(`/entscheidungen/${item.slug}`, item.lastUpdated, .8));
  const analyses = listFachanalysen().map((analysis) => entry(`/fachanalysen/${analysis.slug}`, analysis.analysisDate, .8));
  return [...staticEntries, ...cases, ...analyses];
}
