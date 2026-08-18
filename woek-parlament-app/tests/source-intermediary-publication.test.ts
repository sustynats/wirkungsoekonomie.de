import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (name: string) => readFileSync(name, "utf8");

test("public impact and fact pages route source links through a source record", () => {
  const files = [
    "app/components/government/GovernmentImpactCase.tsx",
    "app/wirkungsfaelle/[id]/page.tsx",
    "app/regierung/akte/[id]/page.tsx",
  ];
  for (const file of files) {
    const source = read(file);
    assert.match(source, /sourceDetailHrefForUrl/, `${file} does not use the source intermediary`);
    assert.doesNotMatch(source, /href=\{(?:source|url|source\.url)\}/, `${file} links an original source directly`);
  }
});

test("a source detail explains the source and reverse-links its analyses with results", () => {
  const detail = read("app/quellen/[slug]/page.tsx");
  assert.match(detail, /Kurz zusammengefasst/);
  assert.match(detail, /source\.abstract/);
  assert.match(detail, /Verknüpfte Wirkungschecks/);
  assert.match(detail, /Kurzbewertung/);
  assert.match(detail, /analysisDirection/);
  assert.match(detail, /evidenceLevel/);
  assert.match(detail, /Originalquelle öffnen/);
});

test("the source registry retains source summaries and analysis reverse usage", () => {
  const registry = read("lib/sources/public-registry.ts");
  assert.match(registry, /curatedSourceSummaries/);
  assert.match(registry, /analysisSummary/);
  assert.match(registry, /caseHref/);
  assert.match(registry, /Eine verifizierte inhaltliche Quellenzusammenfassung liegt/);
});
