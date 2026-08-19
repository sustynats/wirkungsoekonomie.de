import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (file: string) => readFileSync(file, "utf8");

test("detail impact pages expose one semantic case title instead of starting at h2", () => {
  for (const file of ["app/components/government/GovernmentImpactCase.tsx", "app/components/eu/EuImpactCase.tsx"]) {
    const component = source(file);
    assert.match(component, /const Title = compact \? "h2" : "h1"/);
    assert.match(component, /<Title id=/);
  }
});

test("assessment lead remains a compact paragraph with no display heading semantics", () => {
  const component = source("app/components/OverviewAssessment.tsx");
  const styles = source("app/globals.css");
  assert.match(component, /<p className="overview-assessment-label">\{assessment\.assessmentLabel\}<\/p>/);
  assert.doesNotMatch(component, /<h[1-6][^>]*overview-assessment-label/);
  assert.match(styles, /font-size:\s*1\.125rem/);
  assert.match(styles, /@media \(min-width:\s*48rem\)[\s\S]*?\.overview-assessment:not\(\.overview-assessment--compact\) \.overview-assessment-label\s*\{\s*font-size:\s*1\.25rem/);
  assert.match(styles, /font-weight:\s*600/);
  assert.match(styles, /line-height:\s*1\.45/);
});

test("preview and local hosts do not emit a cross-origin analytics request", () => {
  const tracker = source("app/components/SiteAnalyticsTracker.tsx");
  assert.match(tracker, /window\.location\.hostname !== "parlament\.wirkungsoekonomie\.de"/);
  assert.ok(tracker.indexOf("window.location.hostname") < tracker.indexOf("void fetch(endpoint"));
});

test("wide transparency data remains keyboard-scrollable and publicly labelled", () => {
  const page = source("app/regierung/transparenz/page.tsx");
  assert.match(page, /role="region" aria-label="Abdeckung der amtlichen Regierungsquellen" tabIndex=\{0\}/);
  assert.match(page, /sourceLabels\[source\.source_id\]/);
  assert.doesNotMatch(page, /<th scope="row">\{source\.source_id\}/);
});

test("the rendered browser audit covers every contracted breakpoint and the runtime regressions", () => {
  const audit = source("scripts/quality/audit-public-ux.cjs");
  for (const width of [320, 360, 375, 390, 428, 768, 1024, 1280, 1440]) assert.match(audit, new RegExp(`\\b${width}\\b`));
  assert.match(audit, /govaction%3Adip%3A325252/);
  assert.match(audit, /govaction%3Abreg-cabinet%3A2435812%3Atop%3A5/);
  assert.match(audit, /objectDumpVisible/);
});

test("the public K.-o.-Tropfen audit route resolves to its canonical parliamentary case", () => {
  const cases = source("lib/cases.ts");
  assert.match(cases, /"schutz-vor-k-o-tropfen": "bt21-dip-907488f49a72"/);
});

test("long public content wraps inside assessment, source, search and impact surfaces", () => {
  const styles = source("app/globals.css");
  assert.match(styles, /\.government-impact-case h1[^}]+overflow-wrap: anywhere/);
  assert.match(styles, /\.source-archive-list h2[^}]+overflow-wrap: anywhere/);
  assert.match(styles, /\.overview-assessment-axis dd[^}]+overflow-wrap: anywhere/);
  assert.match(styles, /\.page-intro h1[^}]+overflow-wrap: anywhere/);
});
