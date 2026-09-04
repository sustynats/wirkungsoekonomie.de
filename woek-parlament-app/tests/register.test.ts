import assert from "node:assert/strict";
import { test } from "node:test";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import { directionDistribution, explicitRegisterFields, filterRegister, readRegisterFilters, registerFacets, registerFacetOptions, type RegisterObject } from "../lib/register-model";

const object: RegisterObject = {
  id: "fixture", sourceId: "fixture", title: "Quellengebundener Fall", href: "/entscheidungen/fixture",
  typeLabel: "Fall", finding: "Unveränderter Befund", status: "Offen", date: null,
  signature: { direction: { kind: "open", label: "Offen" }, evidence: { grade: null, label: "Nicht eingestuft", detail: "Offen" }, maturity: { phase: null, label: "Offen", detail: "Offen" } },
  level: "bund", organ: "bundestag", fields: [], collections: ["entscheidungen"],
};

test("six orthogonal URL facets preserve conjunctions, unknown values and open counts", () => {
  assert.deepEqual(registerFacets.map((facet) => facet.key), ["ebene", "organ", "wirkungsfeld", "richtung", "evidenz", "reifegrad"]);
  const query = readRegisterFilters(Object.fromEntries(new URLSearchParams("ebene=bund&organ=bundestag&richtung=offen")));
  assert.equal(filterRegister([object], query).length, 1);
  assert.equal(filterRegister([object], { ...query, ebene: "eu" }).length, 0);
  assert.equal(filterRegister([object], { ebene: "invalid" }).length, 0);
  assert.ok(registerFacetOptions([object], { ebene: "invalid" }, "ebene").some((option) => option.value === "invalid" && option.count === 0));
  for (const { key } of registerFacets) assert.ok(registerFacetOptions([object], {}, key).some((option) => option.value === "offen"));
});

test("no keyword, identity or missing-data inference enters field or direction distributions", () => {
  assert.deepEqual(explicitRegisterFields(["Mensch", "PLANET", "Demokratie"]), ["mensch", "planet", "demokratie"]);
  assert.deepEqual(explicitRegisterFields(["Gesundheit für Menschen", "Klimaschutz", "Parteiname"]), []);
  const changed = { ...object, title: "Andere Partei", party: "OTHER" };
  assert.deepEqual(directionDistribution([object]), directionDistribution([changed]));
  const open = directionDistribution([object]).find((category) => category.value === "offen");
  assert.equal(open?.count, 1);
  assert.equal(object.signature.evidence.grade, null);
  assert.equal(object.signature.maturity.phase, null);
  const portfolio = { ...object, signature: { ...object.signature, direction: { kind: "portfolio" as const, label: "Getrennte Pfade" } } };
  assert.equal(directionDistribution([portfolio]).find((category) => category.value === "offen")?.count, 1);
});

test("every source object in all six former lists is present once, with exact canonical destination", () => {
  const report = JSON.parse(execFileSync(process.execPath, ["--conditions=react-server", "--import", "tsx", "scripts/quality/check-register.ts"], {
    cwd: process.cwd(), encoding: "utf8", maxBuffer: 8 * 1024 * 1024,
    env: { ...process.env, NODE_PATH: resolve("node_modules/next/dist/compiled") },
  }));
  assert.equal(report.status, "PASS");
  assert.deepEqual(report.missing, []);
  assert.ok(report.objects.length > 0);
  for (const record of report.objects) {
    assert.ok(!/Evidenz/.test(record.relevance ?? ""), "materiality must not reuse evidence labels");
    assert.equal(record.signature.evidence.grade, null, "no invented four-grade evidence mapping");
  }
});

test("all full former collection renderers remain reachable in the explicit context view", () => {
  const context = readFileSync("app/wirkungsakten/bestand/page.tsx", "utf8");
  for (const component of ["ImpactCasesPage", "SectionPage", "FachanalysenPage", "GovernmentImpactCasesPage", "EuImpactCasesPage"]) assert.ok(context.includes(`<${component}`), component);
  const register = readFileSync("app/wirkungsakten/page.tsx", "utf8");
  assert.match(register, /href="\/wirkungsakten\/bestand"/);
  assert.match(register, /SamePageQueryForm/);
});

test("institutional entry has a fixed cross-page register destination and normal scrolling", () => {
  const component = readFileSync("app/components/InstitutionRegisterLink.tsx", "utf8");
  assert.match(component, /pathname: "\/wirkungsakten"/);
  assert.match(component, /ebene: level/);
  assert.doesNotMatch(component, /SamePageStateLink|scroll=\{false\}|router\.push/);
  for (const area of ["bundestag", "bundesregierung", "laender", "eu"]) {
    const page = readFileSync(`app/ebenen/${area}/page.tsx`, "utf8");
    if (area === "laender") {
      assert.match(page, /<StatesPage/);
      assert.match(page, /from "@\/app\/laender\/page"/);
      assert.match(readFileSync("app/laender/page.tsx", "utf8"), /<InstitutionRegisterLink level="land"/);
    } else assert.match(page, /<InstitutionRegisterLink level=/);
  }
});
