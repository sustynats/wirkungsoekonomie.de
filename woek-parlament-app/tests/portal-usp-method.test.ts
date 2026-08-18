import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { indicatorFunctions, portalMethodSourceUrls, portalUsp } from "@/lib/content/portal-usp";

const home = readFileSync("app/page.tsx", "utf8");
const sections = readFileSync("app/[section]/page.tsx", "utf8");
const glossary = readFileSync("app/begriffe/page.tsx", "utf8");
const registry = readFileSync("lib/sources/public-registry.ts", "utf8");

test("portal uses the approved USP frame without denying existing state review", () => {
  assert.match(portalUsp.lead, /Folgen prüfen reicht nicht/);
  assert.match(portalUsp.context, /Deutschland prüft Gesetzesfolgen und Nachhaltigkeitswirkungen bereits heute/);
  assert.match(portalUsp.context, /WÖk setzt nicht bei null an/);
  for (const source of [home, sections]) {
    assert.match(source, /portalUsp\.lead/);
    assert.match(source, /portalUsp\.context/);
  }
  for (const forbidden of [
    "Politik prüft bisher keine Folgen",
    "Die Bundesregierung prüft Nachhaltigkeit nicht",
    "WÖk ist die erste Ex-ante-Wirkungsanalyse",
    "SDGs enthalten Demokratie nicht",
  ]) assert.equal(`${home}\n${sections}\n${glossary}`.includes(forbidden), false, forbidden);
});

test("method page exposes the complete path, measurement and option architecture", () => {
  assert.equal(portalUsp.pathFormula, "A -> M -> ΔZ -> R");
  assert.equal(portalUsp.observedChange, "ΔZ = Z(t) - Z(0)");
  assert.equal(portalUsp.causalEffect, "ΔW = Z_beobachtet - Z_gegenfaktisch");
  for (const field of ["pathFormula", "observedChange", "causalEffect"]) assert.match(sections, new RegExp(`portalUsp\\.${field}`));
  assert.deepEqual(indicatorFunctions.map(([value]) => value), ["BASELINE", "IMPLEMENTATION", "OUTPUT", "OUTCOME", "COUNTERFACTUAL", "DISTRIBUTION", "BOUNDARY", "ATTRIBUTION"]);
  assert.match(sections, /schnellere Netzanschlüsse/);
  assert.match(sections, /WÖk-Handlungsoption/);
  assert.match(sections, /damalige Wissensstand/);
  assert.match(sections, /keine robuste Präferenz/);
});

test("official method claims route through contextual source pages", () => {
  assert.match(home, /sourceDetailHrefForUrl\(portalMethodSourceUrls\.ggo\)/);
  assert.match(sections, /sourceDetailHrefForUrl\(portalMethodSourceUrls\.enapReview\)/);
  assert.match(sections, /sourceDetailHrefForUrl\(portalMethodSourceUrls\.destatisIndicators\)/);
  for (const url of Object.values(portalMethodSourceUrls)) {
    assert.match(url, /^https:\/\//);
    assert.ok(registry.includes(url.split("/")[2]) || registry.includes("portalMethodSourceUrls"));
  }
  assert.match(registry, /Amtlicher Erfahrungsbericht/);
  assert.match(registry, /Ein Zielbezug oder eine Indikatorbewegung/);
});

test("SDG 16, SDG+ and democratic self-limitation stay explicit", () => {
  assert.match(sections, /SDG 16 erfasst wichtige institutionelle Dimensionen/);
  assert.match(sections, /SDG\+ ist eine transparente Erweiterung der Wirkungsökonomie, keine offizielle UN-Kategorie/);
  assert.match(sections, /WÖk informiert demokratische Entscheidung\. Sie ersetzt sie nicht/);
  assert.doesNotMatch(`${home}\n${sections}`, /berechnet automatisch eine (?:politische )?Gesamtnote|ermittelt automatisch die beste Politik/);
});
