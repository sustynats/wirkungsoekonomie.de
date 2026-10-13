import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const navigation = fs.readFileSync("assets/js/site-navigation.js", "utf8");
const shell = fs.readFileSync("scripts/lib/site-shell.mjs", "utf8");
const template = fs.readFileSync("templates/header.html", "utf8");

test("the skip link follows the main element's actual id", () => {
  assert.match(navigation, /skipLink\.href = `#\$\{mainElement\.id\}`/);
  assert.doesNotMatch(navigation, /skipLink\.href\s*=\s*["']#main-content["']/);
});

test("navigation state resolves overlapping area matches by specificity", () => {
  const helpers = navigation.match(
    /function normalizeNavigationRoute[\s\S]*?\n  }\n\n  function navigationMatchScore[\s\S]*?\n  }/,
  )?.[0];
  assert.ok(helpers, "navigation route helpers are present");
  const context = {};
  vm.runInNewContext(`${helpers}; this.normalize = normalizeNavigationRoute; this.score = navigationMatchScore;`, context);

  assert.equal(context.normalize("/fuer/wirkungssteuer.html?ansicht=kurz"), "fuer/wirkungssteuer.html");
  assert.equal(context.normalize("/verstehen/index.html"), "verstehen/");
  assert.equal(context.score({ dataset: { navMatch: "fuer/" } }, "fuer/wirkungssteuer.html"), 5);
  assert.equal(
    context.score(
      { dataset: { navMatch: "werkzeuge/|fuer/wirkungssteuer.html" } },
      "fuer/wirkungssteuer.html",
    ),
    "fuer/wirkungssteuer.html".length,
  );
  assert.equal((navigation.match(/setAttribute\("aria-current", "page"\)/g) || []).length, 0);
  assert.match(navigation, /existingPageMarker \? "true" : "page"/);
  assert.match(navigation, /activeArea\.setAttribute\("aria-current", "true"\)/);
});

test("the mobile panel is modal only while open and duplicate quick links are inert", () => {
  assert.match(navigation, /siteNav\.setAttribute\("role", "dialog"\)/);
  assert.match(navigation, /siteNav\.setAttribute\("aria-modal", "true"\)/);
  assert.match(navigation, /siteNav\.removeAttribute\("aria-modal"\)/);
  assert.match(navigation, /primaryUtilityNav\.toggleAttribute\("inert", menuOpen\)/);
  assert.match(navigation, /utilityLinks\.toggleAttribute\("inert", !menuOpen\)/);
  for (const source of [shell, template]) {
    assert.match(source, /class="site-nav-utility"[^>]*aria-hidden="true"[^>]*\binert\b/);
  }
});

test("breadcrumbs become consistently labelled landmarks", () => {
  assert.match(navigation, /breadcrumb instanceof HTMLParagraphElement/);
  assert.match(navigation, /document\.createElement\("nav"\)/);
  assert.match(navigation, /"Brotkrumen"/);
});

test("the two interactive exceptions load the shared navigation runtime", () => {
  for (const file of [
    "werkzeuge/faktencheck/index.html",
    "umfragen/stadtvergleich-bundestagswahl-2025/index.html",
  ]) {
    const html = fs.readFileSync(file, "utf8");
    assert.match(html, /<script[^>]+src=["'][^"']*assets\/js\/site-navigation\.js(?:\?[^"']*)?["']/);
  }
  const sensitivePoll = fs.readFileSync("umfragen/stadtvergleich-bundestagswahl-2025/index.html", "utf8");
  assert.doesNotMatch(sensitivePoll, /<script[^>]+src=["'][^"']*assets\/js\/main\.js/);
});
