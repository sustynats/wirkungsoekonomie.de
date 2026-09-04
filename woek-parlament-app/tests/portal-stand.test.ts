import assert from "node:assert/strict";
import { test } from "node:test";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import { portalStand, stateReviewStand } from "../lib/portal-stand";
import { stateJurisdictions } from "../lib/autopilot/registry";
import type { RegisterObject } from "../lib/register-model";

test("portal counts derive from the exact published set and retain unknown phase and date", () => {
  const report = JSON.parse(execFileSync(process.execPath, ["--conditions=react-server", "--import", "tsx", "scripts/quality/check-portal-stand.ts"], { encoding: "utf8", env: { ...process.env, NODE_PATH: resolve("node_modules/next/dist/compiled") } }));
  assert.equal(report.published, new Set(report.recordIds).size);
  assert.equal(report.radar, new Set(report.radarSlugs).size);
  assert.equal(report.maturity.reduce((sum: number, item: { count: number }) => sum + item.count, 0), report.published);
  assert.equal(report.reviewedOfficialSources, null, "no fabricated official-source verification metric");
  const fixture = (id: string, date: string | null, phase: string | null) => ({ id, date, signature: { maturity: { phase } } }) as RegisterObject;
  const records = [fixture("a", "2026-08-01", "EX_ANTE"), fixture("b", null, null), fixture("c", "2026-07-01", "ATTRIBUTED")];
  const stand = portalStand(records, ["one", "one", "two"]);
  assert.equal(stand.published, 3); assert.equal(stand.radar, 2);
  assert.equal(stand.latestRecordDate, "2026-08-01"); assert.equal(stand.undatedRecords, 1);
  assert.equal(stand.maturity.find((item) => item.id === "open")?.count, 1);
  assert.deepEqual(portalStand(records.map((item) => ({ ...item, title: "Other party" })), ["one", "one", "two"]), stand);
  assert.throws(() => portalStand([records[0], records[0]], []), /Duplicate/);
  assert.equal(portalStand([], []).latestRecordDate, null);
});

test("cartogram covers every actual state once; explicit partial and open scopes are not completed", () => {
  const states = stateReviewStand();
  assert.deepEqual(states.map((state) => state.id).sort(), stateJurisdictions.map((state) => state.jurisdiction_id).sort());
  assert.equal(new Set(states.map((state) => state.id)).size, states.length);
  assert.equal(states.find((state) => state.id === "DE-ST")?.category, "complete");
  for (const id of ["DE-BE", "DE-MV"]) assert.equal(states.find((state) => state.id === id)?.category, "materiality");
  for (const id of ["DE-BW", "DE-RP"]) assert.equal(states.find((state) => state.id === id)?.category, "initial");
  assert.equal(states.find((state) => state.id === "DE-BY")?.category, "open");
  const css = readFileSync("app/portal-home.css", "utf8");
  for (const state of states) assert.ok(css.includes(`.state-position-${state.abbreviation} {`));
});

test("every relocated home section is mounted at its reachable commissioned destination", () => {
  for (const [route, component] of [["pruefstandard/methodik", "HomeMethodology"], ["pruefstandard/transparenz", "HomeTrust"], ["monitor", "HomeMonitorContext"], ["ebenen/bundesregierung", "HomeGovernmentContext"], ["ebenen/laender", "HomeStatesContext"], ["aktuell/radar", "HomeRadarScope"]]) {
    assert.ok(readFileSync(`app/${route}/page.tsx`, "utf8").includes(`<${component}`));
  }
  const content = readFileSync("app/components/HomeContentSections.tsx", "utf8");
  assert.match(content, /GOVERNMENT_STAGING === "1"/);
  assert.match(content, /<OriginalHeroExplanation parliamentMode/);
  for (const file of ["app/page.tsx", "app/components/PortalStand.tsx", "app/components/StateCartogram.tsx"]) assert.doesNotMatch(readFileSync(file, "utf8"), /style=\{|new Date\(|Date\.now\(/);
});
