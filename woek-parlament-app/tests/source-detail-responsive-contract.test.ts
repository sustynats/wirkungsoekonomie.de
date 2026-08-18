import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (name: string) => readFileSync(name, "utf8");

test("source intermediary contains component-scoped long-token containment", () => {
  const css = read("app/globals.css");
  assert.match(css, /\.source-detail-page[^}]*\.source-detail-header[^}]*min-width:\s*0;[^}]*max-width:\s*100%/);
  assert.match(css, /\.source-detail-header h1[^}]*max-inline-size:\s*100%[^}]*overflow-wrap:\s*anywhere[^}]*hyphens:\s*auto/);
  assert.match(css, /\.source-detail-page :is\(h2, h3, p, li, dt, dd, a,[^}]*overflow-wrap:\s*anywhere/);
  assert.match(css, /\.source-detail-page :is\(code, pre\)[^}]*overflow-wrap:\s*anywhere[^}]*white-space:\s*pre-wrap/);
  assert.doesNotMatch(css, /\.source-detail-header h1[^{}]*(?:white-space:\s*nowrap|text-overflow:\s*ellipsis|overflow-x:\s*(?:auto|scroll))/);
});

test("responsive browser scan covers every public source route and all required mobile widths", () => {
  const scan = read("scripts/quality/check-source-detail-responsive.mjs");
  assert.match(scan, /discoverSourceRoutes/);
  assert.match(scan, /ALL_PUBLIC_SOURCE_DETAIL_ROUTES_RESPONSIVE_SCAN/);
  for (const width of [320, 360, 390]) assert.match(scan, new RegExp(`\\b${width}\\b`));
  assert.match(scan, /documentElement\.scrollWidth/);
  assert.match(scan, /viewportWidth \+ 1/);
  assert.match(scan, /Bundesimmissionsschutzgenehmigungszuständigkeitsübertragungsverordnung/);
  assert.match(scan, /ununterbrochener-technischer-identifikator/);
  assert.match(scan, /quelle-3225f31089a72a6b/);
});
