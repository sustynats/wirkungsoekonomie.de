import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { canonicalPortalHref, portalNavigation, sectionNavigation } from "@/lib/navigation";

test("the five areas share the section header; the register retains its dedicated filter view", () => {
  for (const { href } of portalNavigation) {
    const page = readFileSync(`app${href}/page.tsx`, "utf8");
    assert.match(page, href === "/wirkungsakten" ? /<PortalSectionHeader/ : /<PortalLanding/);
  }
  const layout = readFileSync("app/layout.tsx", "utf8");
  assert.equal((layout.match(/<PortalWayfinding/g) ?? []).length, 1);
  for (const file of ["app/components/PortalLanding.tsx", "app/regierung/layout.tsx"]) assert.doesNotMatch(readFileSync(file, "utf8"), /<nav|<PortalWayfinding/);
});

test("government child navigation belongs to the same tree, not a second independent menu", () => {
  const area = portalNavigation.find(item => item.href === "/ebenen")!.children!.find(item => item.href.endsWith("bundesregierung"))!;
  assert.deepEqual(sectionNavigation(area.href), area.children);
  for (const item of area.children!) {
    if (canonicalPortalHref(item.href) !== item.href) assert.ok(canonicalPortalHref(item.href).startsWith("/wirkungsakten?bestand="));
    else assert.deepEqual(sectionNavigation(item.href), area.children);
  }
  const layout = readFileSync("app/ebenen/bundesregierung/layout.tsx", "utf8");
  assert.match(layout, /from "@\/app\/regierung\/layout"/);
});

test("area metrics and both country cartograms reuse canonical inventory without a second classifier", () => {
  for (const file of ["app/ebenen/page.tsx", "app/laender/page.tsx"]) assert.match(readFileSync(file, "utf8"), /<StateCartogram/);
  const overview = readFileSync("app/components/PortalAreaOverview.tsx", "utf8");
  for (const field of ["stand.radar", "stand.published", "stand.maturity", "stage.count", "stand.latestRecordDate"]) assert.ok(overview.includes(field));
  assert.doesNotMatch(overview, /\.party|\.partei|\.score|Date\.now\(|new Date\(|useEffect|useState|fetch\(/);
  assert.match(overview, /Gezählt werden Akten/);
  assert.match(readFileSync("app/components/StateCartogram.tsx", "utf8"), /stateReviewStand\(\)/);
});

test("old monitor and state explanations stay mounted in keyboard-native disclosure", () => {
  const monitor = readFileSync("app/monitor/page.tsx", "utf8");
  assert.match(monitor, /<details[^>]*id="monitor-einordnung"/);
  assert.match(monitor, /<MonitorContext/);
  assert.match(monitor, /monitorCopy\.lead/);
  assert.match(monitor, /<HomeMonitorContext/);
  const states = readFileSync("app/laender/page.tsx", "utf8");
  assert.match(states, /<details[^>]*id="states-coverage-context"/);
  assert.match(states, /<StateCartogram/);
  assert.match(states, /<InstitutionRegisterLink level="land"/);
});

test("compact signature text wraps in narrow register rows instead of being clipped", () => {
  const css = readFileSync("app/impact-signature.css", "utf8");
  assert.match(css, /\.impact-signature--compact dd \{[^}]*grid-template-columns: auto minmax\(0, 1fr\)/);
  assert.match(css, /\.impact-signature--compact dt, \.impact-signature--compact dd > span \{ min-width: 0; overflow-wrap: anywhere;/);
});
