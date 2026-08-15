import test from "node:test";
import assert from "node:assert/strict";
import { parliamentaryCases } from "@/data/cases";
import { defaultSearchFilters, searchPublicCases } from "@/lib/search";

test("search finds public cases by words from the decision content", () => {
  const results = searchPublicCases(parliamentaryCases, { ...defaultSearchFilters, query: "zugang" });
  assert.ok(results.length > 0);
  assert.ok(results.some((item) => item.slug === "musterfall-fassungswechsel"));
  assert.ok(results.every((item) => [item.title, item.plainTitle, item.summary, item.whatIsDecided, item.intendedGoal, item.parliamentaryStatus, item.analysisStatus, ...item.impactPath, ...item.affectedGroups, ...item.questions, ...item.sources.map((source) => `${source.title} ${source.publisher}`)].join(" ").toLocaleLowerCase("de-DE").includes("zugang")));
});

test("search filters by content type and never invents unseen results", () => {
  const results = searchPublicCases(parliamentaryCases, { ...defaultSearchFilters, type: "RETROSPECTIVE_CASE" });
  assert.ok(results.length >= 1);
  assert.ok(results.length < parliamentaryCases.length);
  assert.ok(results.every((item) => item.kind === "RETROSPECTIVE_CASE"));
});
