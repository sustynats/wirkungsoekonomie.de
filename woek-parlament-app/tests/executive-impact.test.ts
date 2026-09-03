import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { executiveImpactSummarySchema } from "../lib/executive-impact/contracts";

const source = (file: string) => readFileSync(file, "utf8");

test("executive impact contract requires explicit MPD, provenance and fail-closed materiality state", () => {
  const result = executiveImpactSummarySchema.safeParse({});
  assert.equal(result.success, false);
  assert.match(source("lib/executive-impact/contracts.ts"), /FAIL_CLOSED_NO_APPROVED_RANKING/);
  assert.match(source("lib/executive-impact/contracts.ts"), /source_refs/);
  assert.match(source("lib/executive-impact/contracts.ts"), /communication_preview/);
});

test("shared Executive UI exposes every required layer with non-colour direction cues", () => {
  const component = source("app/components/executive-impact/ExecutiveImpactSummary.tsx");
  for (const name of ["ImpactExecutiveHero", "MPDImpactTriad", "SdgImpactStrip", "MaterialImpactPaths", "ImpactCascade", "NonCompensationAlert", "KeyTradeoffs", "EvidenceBand", "CommunicationImpactPreview", "ImpactRealityCheck", "SourceTransparencyDrawer"]) assert.match(component, new RegExp(`export function ${name}\\b`));
  assert.match(component, /icon: "↑"/);
  assert.match(component, /icon: "↓"/);
  assert.match(component, /icon: "○"/);
});

test("adapters do not aggregate MPD direction or inherit case materiality", () => {
  const government = source("lib/executive-impact/government.ts");
  const parliament = source("lib/executive-impact/parliament.ts");
  assert.doesNotMatch(government, /directionFor\(paths\.map/);
  assert.match(government, /direction: "OPEN"/);
  assert.doesNotMatch(parliament, /materiality\(caseMateriality\)/);
  assert.match(parliament, /materiality: "OPEN" as const/);
});

test("Sachsen-Anhalt reuses the approved editorial and communication projections verbatim", () => {
  const adapter = source("lib/executive-impact/sachsen-anhalt.ts");
  assert.match(adapter, /bottom_line: editorial\.overallLabel/);
  assert.match(adapter, /why_it_matters: editorial\.impactCoreSummary/);
  assert.match(adapter, /assessment_label: communication\.overview_assessment_label/);
  assert.match(adapter, /summary: communication\.public_summary/);
  assert.match(adapter, /commitment\?\.boundaryStatus !== "BLOCK"/);
  assert.doesNotMatch(adapter, /nicht kompensier/i);
});
