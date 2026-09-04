import assert from "node:assert/strict";
import { getPublicRegister } from "../../lib/register";
import { listPublishedCases } from "../../lib/cases";
import { listFachanalysen } from "../../lib/fachanalysen";
import { getPublicImpactCases } from "../../lib/government/impact-cases";
import { getEuImpactCases } from "../../lib/eu/impact-cases";
import { getApprovedParliamentDailyImpactCases } from "../../lib/parliament/daily-impact-cases";
import { getActionPlanMissions, ACTION_PLAN_META_ID } from "../../lib/government/strategy-impact";
import { canonicalPortalHref } from "../../lib/navigation";
import { directionDistribution, filterRegister, facetValues, registerFacets } from "../../lib/register-model";

const objects = getPublicRegister();
const previous = [
  ...listPublishedCases().map((item) => ({ id: `parliament:${item.slug}`, href: `/entscheidungen/${item.slug}`, source: "entscheidungen" })),
  ...getPublicImpactCases().map((item) => ({ id: `government:${item.impact_case_id}`, href: canonicalPortalHref(`/regierung/wirkungsanalysen/${encodeURIComponent(item.impact_case_id)}`), source: "regierung" })),
  ...getApprovedParliamentDailyImpactCases().map((item) => ({ id: `daily:${item.impact_case_id}`, href: canonicalPortalHref(`/wirkungsfaelle/${encodeURIComponent(item.impact_case_id)}`), source: "wirkungsfaelle" })),
  ...getEuImpactCases().map((item) => ({ id: `eu:${item.impact_case_id}`, href: canonicalPortalHref(`/eu/wirkungsfaelle/${encodeURIComponent(item.impact_case_id)}`), source: "eu" })),
  ...listFachanalysen().map((item) => ({ id: `dossier:${item.slug}`, href: canonicalPortalHref(`/fachanalysen/${item.slug}`), source: "fachanalysen" })),
  ...[ACTION_PLAN_META_ID, ...getActionPlanMissions().map((item) => item.id)].map((id) => ({ id: `strategy:${id}`, href: canonicalPortalHref(`/regierung/wirkungsanalysen/${id}`), source: "regierung" })),
];
for (const old of previous) {
  const current = objects.find((item) => item.id === old.id);
  assert.ok(current, `Lost source object ${old.id}`);
  assert.equal(current.href, old.href);
  assert.ok(filterRegister(objects, { bestand: old.source }).some((item) => item.id === old.id));
}
assert.equal(new Set(objects.map((item) => item.id)).size, objects.length);
assert.equal(new Set(objects.map((item) => item.href)).size, objects.length);
const combinations = registerFacets.flatMap(({ key }) => [...new Set(objects.flatMap((item) => facetValues(item, key)))].map((value) => ({ [key]: value })));
for (const left of combinations) for (const right of combinations) {
  const selected = filterRegister(objects, { ...left, ...right });
  const distribution = directionDistribution(selected);
  assert.equal(distribution.reduce((sum, category) => sum + category.count, 0), selected.length);
  assert.ok(distribution.some((category) => category.value === "offen"));
}
console.log(JSON.stringify({ status: "PASS", object_count: objects.length, previous_objects: previous.length, missing: [], pairwise_filter_checks: combinations.length ** 2, previous, objects, distribution: directionDistribution(objects) }));
