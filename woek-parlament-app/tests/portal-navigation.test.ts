import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { activePortalBranch, allNavigationItems, canonicalPortalHref, portalBreadcrumbs, portalNavigation, portalRedirects } from "@/lib/navigation";
import { impactRecordAssessmentIconKind, parliamentaryOverviewAssessment } from "@/lib/presentation/overview-assessment";
import { listPublishedCases } from "@/lib/cases";

test("exactly five ordered branches, one unambiguous location per route", () => {
  assert.deepEqual(portalNavigation.map((item) => item.label), ["Aktuell", "Wirkungsakten", "Wirkungsmonitor", "Bund, Länder & EU", "Prüfstandard"]);
  assert.equal(new Set(allNavigationItems.map((item) => item.href)).size, allNavigationItems.length);
  for (const item of allNavigationItems) {
    assert.ok(activePortalBranch(item.href));
    const href = canonicalPortalHref(item.href).split(/[?#]/)[0];
    assert.ok(existsSync(`app${href}/page.tsx`), `missing destination ${href}`);
    assert.equal(portalBreadcrumbs(item.href).at(-1)?.href, href);
  }
});

test("legacy lists are preserved as complete register views, families move in one hop", () => {
  assert.equal(canonicalPortalHref("/entscheidungen?ansicht=quellen#belege"), "/wirkungsakten?bestand=entscheidungen&ansicht=quellen#belege");
  assert.equal(canonicalPortalHref("/regierung/wirkungsanalysen"), "/wirkungsakten?bestand=regierung");
  assert.equal(canonicalPortalHref("/regierung/wirkungsanalysen/A%20B/quellen/official?q=x#quelle"), "/ebenen/bundesregierung/wirkungsanalysen/A%20B/quellen/official?q=x#quelle");
  assert.equal(canonicalPortalHref("/laender/berlin/wahl?q=a&q=b#quelle"), "/ebenen/laender/berlin/wahl?q=a&q=b#quelle");
  assert.equal(canonicalPortalHref("/methodik/wirkindikatoren/1-1"), "/pruefstandard/wirkindikatoren/1-1");
  assert.equal(canonicalPortalHref("/transparenz#referenzrahmen"), "/pruefstandard/transparenz#referenzrahmen");
  assert.equal(canonicalPortalHref("/werkzeuge"), "/pruefstandard/methodik#werkzeuge");
  assert.equal(canonicalPortalHref("/wirkungsradar-updates/bestaetigen?token=test"), "/aktuell/radar-abo/bestaetigen?token=test");
  for (const rule of portalRedirects) {
    assert.equal(rule.permanent, true);
    const sample = rule.source.replace(/\/:path[+*]/, "/exact-source");
    const destination = canonicalPortalHref(sample);
    assert.notEqual(destination, sample);
    assert.equal(canonicalPortalHref(destination), destination, `redirect chain: ${sample}`);
  }
});

test("external URLs, document bytes, query state and canonical decisions are untouched", () => {
  for (const path of ["/entscheidungen/bt21-example?ansicht=fachlich#quellen", "/api/health", "/documents/file.pdf", "https://example.org/regierung", "//example.org/quellen"]) assert.equal(canonicalPortalHref(path), path);
  assert.equal(activePortalBranch("/entscheidungen/bt21-example")?.href, "/wirkungsakten");
  assert.match(readFileSync("app/components/SamePageNavigation.tsx", "utf8"), /scroll=\{false\}/);
});

test("same_case + different_party = identical_verdict (existing publication projection)", () => {
  for (const item of listPublishedCases()) {
    const expected = parliamentaryOverviewAssessment(item);
    for (const party of ["CDU", "SPD", "BÜNDNIS 90/DIE GRÜNEN", "Die Linke", "BSW", "AfD", "unbekannt"]) {
      const sameCaseDifferentParty = { ...item, party };
      assert.deepEqual(parliamentaryOverviewAssessment(sameCaseDifferentParty), expected);
    }
  }
  for (const primary_direction of ["POSITIVE", "NEGATIVE", "AMBIVALENT", "OPEN", "NOT_ASSESSABLE"]) {
    const sameCase = { primary_direction };
    for (const party of ["CDU", "SPD", "Grüne", "Linke", "BSW", "AfD"]) assert.equal(impactRecordAssessmentIconKind({ ...sameCase, ...{ party } }), impactRecordAssessmentIconKind(sameCase));
  }
});
