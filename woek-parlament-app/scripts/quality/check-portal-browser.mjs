import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { canonicalPortalHref, portalRedirects, portalNavigation, allNavigationItems, sectionNavigation } from "../../lib/navigation.ts";
import { filterRegister } from "../../lib/register-model.ts";
import { verifyHome } from "./check-home-browser.mjs";
import { verifyDecisionDepth } from "./check-decision-depth-browser.mjs";
import { verifyDecisionText } from "./check-decision-text-preservation.mjs";
import { verifyAreas } from "./check-area-browser.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PORTAL_PLAYWRIGHT_MODULE ?? "playwright");
const base = process.env.PORTAL_BASE_URL ?? "http://127.0.0.1:3024";
const output = process.env.PORTAL_BROWSER_REPORT_DIR ?? "/tmp/woek-portal-p1-preview";
mkdirSync(output, { recursive: true });
const results = { redirects: [], routes: [], browser: [], errors: [] };
const registerProof = JSON.parse(execFileSync(process.execPath, ["--conditions=react-server", "--import", "tsx", "scripts/quality/check-register.ts"], {
  encoding: "utf8", maxBuffer: 16 * 1024 * 1024,
  env: { ...process.env, NODE_PATH: join(process.cwd(), "node_modules/next/dist/compiled") },
}));
const response = await fetch(`${base}/sitemap.xml`);
assert.equal(response.status, 200);
const sitemap = await response.text();
const paths = new Set([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => {
  const url = new URL(match[1].replaceAll("&amp;", "&"));
  return url.pathname + url.search;
}));
for (const item of allNavigationItems) paths.add(canonicalPortalHref(item.href));
for (const { source } of portalRedirects) {
  const legacy = source.replace(/\/:path[+*]/, "/audit-source");
  const expected = canonicalPortalHref(legacy);
  const redirected = await fetch(`${base}${legacy}`, { redirect: "manual" });
  const location = new URL(redirected.headers.get("location") ?? legacy, base);
  assert.equal(redirected.status, 308, legacy);
  assert.equal(location.pathname + location.search + location.hash, expected, legacy);
  results.redirects.push({ source: legacy, destination: expected, status: 308 });
}
// Every sitemap entry and structural destination is checked, not sampled.
for (const path of paths) {
  const response = await fetch(`${base}${path}`, { redirect: "manual", signal: AbortSignal.timeout(60_000) });
  assert.equal(response.status, 200, path);
  const body = await response.text();
  if (path.startsWith("/entscheidungen/")) assert.match(body, /<dt>Stand der WÖk-Analyse<\/dt>/, "old card analysis status must remain on detail");
  assert.match(body, /aria-label="Brotkrumen"/, path);
  assert.equal((body.match(/aria-label="Brotkrumen"/g) ?? []).length, 1, path);
  assert.equal((body.match(/<h1(?:\s|>)/g) ?? []).length, 1, path);
  assert.equal((body.match(/aria-label="Bereichsnavigation"/g) ?? []).length, sectionNavigation(path).length ? 1 : 0, path);
  assert.doesNotMatch(body, /Wirkungsportal Parlament[^<]*Wirkungsportal Parlament<\/title>/, path);
  results.routes.push({ route: path, status: response.status, breadcrumbs: "PASS", single_h1: "PASS", single_section_navigation: "PASS" });
}
for (const path of ["/pruefstandard/transparenz/datenbetrieb", "/autopilot/status"]) {
  const response = await fetch(`${base}${path}`, { headers: { purpose: "prefetch" } });
  assert.equal(response.status, 401, `${path} must retain authentication on prefetch`);
}

const browser = await chromium.launch({ headless: true });
try {
  results.decisionText = await verifyDecisionText({ browser, base, output });
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  page.on("pageerror", (error) => results.errors.push(error.message));
  page.on("response", (response) => { if (response.status() >= 500) results.errors.push(`HTTP ${response.status()} ${new URL(response.url()).pathname}`); });
  results.signatures = [];
  const axeSource = readFileSync(process.env.PORTAL_AXE_MODULE ?? require.resolve("axe-core/axe.min.js"), "utf8");
  results.areas = await verifyAreas({ browser, page, base, output, axeSource });
  results.home = await verifyHome({ page, base, output, axeSource });
  const decisionPaths = [...paths].filter((path) => path.startsWith("/entscheidungen/"));
  results.decisionDepth = await verifyDecisionDepth({ page, base, output, axeSource, paths: decisionPaths });
  results.register = [];
  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    await page.goto(`${base}/wirkungsakten`, { waitUntil: "networkidle" });
    const readIds = () => page.locator("[data-register-id]").evaluateAll((rows) => rows.map((row) => row.getAttribute("data-register-id")).sort());
    const expectedIds = registerProof.objects.map((item) => item.id).sort();
    assert.deepEqual(await readIds(), expectedIds, "every source object in the browser");
    const rows = await page.locator("[data-register-id]").evaluateAll((rows) => rows.map((row) => ({ id: row.getAttribute("data-register-id"), words: [...new Intl.Segmenter("de", { granularity: "word" }).segment(row.innerText)].filter((word) => word.isWordLike).length, titleX: row.querySelector("h3").getBoundingClientRect().x, signatureX: row.querySelector("[data-impact-signature]").getBoundingClientRect().x })));
    for (const row of rows) assert.ok(row.words <= 60, `${row.id}: ${row.words} words`);
    if (width >= 960) for (const row of rows) assert.ok(row.titleX < row.signatureX, `${row.id}: title/meta left, signature right`);
    assert.equal(await page.locator(".register-filters select").count(), 6);
    const counts = await page.locator("[data-register-direction] dd").allTextContents();
    assert.equal(counts.reduce((sum, count) => sum + Number(count), 0), expectedIds.length);
    assert.equal(await page.locator('[data-register-direction="offen"] dd').count(), 1);
    const segments = await page.locator("[data-register-segment]").evaluateAll((segments) => segments.map((segment) => ({ count: Number(segment.getAttribute("data-count")), width: segment.getBBox().width })));
    assert.equal(segments.reduce((sum, segment) => sum + segment.count, 0), expectedIds.length);
    for (const segment of segments) assert.ok(Math.abs(segment.width / 1000 - segment.count / expectedIds.length) < 0.00001, "actual geometry matches counts under production CSP");
    await page.addScriptTag({ content: axeSource });
    const a11y = await page.evaluate(async () => (await window.axe.run({ include: [[".impact-register"]] }, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } })).violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) })));
    assert.deepEqual(a11y, [], "P3 full register accessibility");
    const selectedFilters = { ebene: "bund", organ: "bundesregierung" };
    const selectedIds = filterRegister(registerProof.objects, selectedFilters).map((item) => item.id).sort();
    assert.ok(selectedIds.length > 0 && selectedIds.length < expectedIds.length);
    await page.locator('select[name="ebene"]').selectOption(selectedFilters.ebene);
    await page.locator('select[name="organ"]').selectOption(selectedFilters.organ);
    const submit = page.getByRole("button", { name: "Filter anwenden" });
    await submit.evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: "instant" }));
    await submit.focus();
    const filterScrollBefore = await page.evaluate(() => scrollY);
    await page.keyboard.press("Enter");
    await page.waitForURL((url) => url.searchParams.get("ebene") === "bund" && url.searchParams.get("organ") === "bundesregierung");
    await page.waitForFunction((count) => document.querySelectorAll("[data-register-id]").length === count, selectedIds.length);
    assert.deepEqual(await readIds(), selectedIds);
    assert.equal(await submit.evaluate((el) => document.activeElement === el), true);
    assert.ok(filterScrollBefore > 0);
    assert.ok(Math.abs(await page.evaluate(() => scrollY) - filterScrollBefore) < 8, "filter submit must preserve the viewport");
    await page.reload({ waitUntil: "networkidle" });
    assert.deepEqual(await readIds(), selectedIds, "shareable URL survives reload");
    await page.goBack({ waitUntil: "networkidle" });
    await page.waitForURL((url) => !url.searchParams.has("ebene"));
    await page.waitForFunction((count) => document.querySelectorAll("[data-register-id]").length === count, expectedIds.length);
    assert.deepEqual(await readIds(), expectedIds);
    assert.equal(await page.locator('select[name="ebene"]').inputValue(), "");
    await page.goForward({ waitUntil: "networkidle" });
    await page.waitForURL((url) => url.searchParams.get("organ") === "bundesregierung");
    await page.waitForFunction((count) => document.querySelectorAll("[data-register-id]").length === count, selectedIds.length);
    assert.deepEqual(await readIds(), selectedIds);
    assert.equal(await page.locator('select[name="organ"]').inputValue(), "bundesregierung");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: join(output, `register-filtered-${width}.png`) });
    results.register.push({ width, objects: expectedIds.length, previous_objects: registerProof.previous_objects, rows, filtered_objects: selectedIds.length, a11y, url_reload_back_forward_focus: "PASS", distribution: "PASS" });
  }
  for (const bestand of ["wirkungsfaelle", "entscheidungen", "fachanalysen", "regierung", "eu"]) {
    await page.goto(`${base}/wirkungsakten/bestand?bestand=${bestand}`, { waitUntil: "networkidle" });
    assert.ok(await page.locator("h1").count());
    assert.equal(await page.getByRole("link", { name: "Zum gemeinsamen Wirkungsakten-Register", exact: true }).count(), 1);
    assert.equal(await page.locator('nav[aria-label="Bestandsansichten"] a[aria-current="page"]').count(), 1);
  }
  results.institutionalEntries = [];
  for (const [area, filters] of [["bundestag", { ebene: "bund", organ: "bundestag" }], ["bundesregierung", { ebene: "bund", organ: "bundesregierung" }], ["laender", { ebene: "land" }], ["eu", { ebene: "eu", organ: "eu" }]]) {
    await page.goto(`${base}/ebenen/${area}`, { waitUntil: "networkidle" });
    await page.locator('a[href^="/wirkungsakten?ebene="]').first().click();
    await page.waitForURL((url) => url.pathname === "/wirkungsakten" && Object.entries(filters).every(([key, value]) => url.searchParams.get(key) === value));
    const expected = filterRegister(registerProof.objects, filters).map((item) => item.id).sort();
    await page.waitForFunction((count) => document.querySelectorAll("[data-register-id]").length === count, expected.length);
    assert.deepEqual(await page.locator("[data-register-id]").evaluateAll((rows) => rows.map((row) => row.getAttribute("data-register-id")).sort()), expected);
    results.institutionalEntries.push({ area, filters, objects: expected.length, status: "PASS" });
  }
  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    await page.goto(`${base}/wirkungsakten?bestand=entscheidungen`, { waitUntil: "networkidle" });
    const cards = await page.locator(".case-card").evaluateAll((cards) => cards.map((card) => ({
      href: card.querySelector("h3 a")?.getAttribute("href"),
      words: [...new Intl.Segmenter("de", { granularity: "word" }).segment(card.innerText)].filter((word) => word.isWordLike).length,
      axes: [...card.querySelectorAll("[data-impact-signature] dt")].map((label) => label.textContent),
      symbol: card.querySelector(".signature-mark")?.textContent,
      direction: card.querySelector("[data-signature-axis=direction] dd > span:nth-child(2)")?.textContent,
      ungraded: card.querySelector("[data-evidence-grade]")?.getAttribute("data-evidence-grade"),
    })));
    assert.deepEqual(cards.map((card) => card.href).sort(), [...decisionPaths].sort(), "all published decisions must have a row");
    for (const card of cards) {
      assert.ok(card.words <= 60, `${card.href}: ${card.words} visible words`);
      assert.deepEqual(card.axes, ["Wirkungsrichtung", "Evidenz", "Reifegrad"]);
      assert.ok(card.symbol?.trim() && card.direction?.trim(), "symbol AND visible wording");
      assert.equal(card.ungraded, "ungraded", "no invented evidence grade");
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.addScriptTag({ content: axeSource });
    const a11y = await page.evaluate(async () => (await window.axe.run({ include: [[".case-card"]] }, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } })).violations.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map((node) => node.target) })));
    assert.deepEqual(a11y, [], "P2 card accessibility");
    await page.locator(".case-card").first().screenshot({ path: join(output, `signature-row-${width}.png`) });
    const firstHref = cards[0].href;
    await page.goto(base + firstHref, { waitUntil: "networkidle" });
    const full = page.locator('[data-impact-signature="full"]').first();
    await full.scrollIntoViewIfNeeded();
    assert.deepEqual(await full.locator("dt").allTextContents(), ["Wirkungsrichtung", "Evidenz", "Reifegrad"]);
    await page.addScriptTag({ content: axeSource });
    const detailA11y = await page.evaluate(async () => (await window.axe.run({ include: [["[data-impact-signature=full]"]] }, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } })).violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) })));
    assert.deepEqual(detailA11y, [], "P2 full signature accessibility");
    await full.screenshot({ path: join(output, `signature-full-${width}.png`) });
    await page.emulateMedia({ forcedColors: "active" });
    assert.ok(await full.locator(".signature-mark").isVisible());
    assert.ok((await full.locator("dd").first().innerText()).trim());
    await page.emulateMedia({ forcedColors: "none" });
    results.signatures.push({ width, cards, a11y, detailA11y, forced_colors: "PASS", axes: "PASS" });
  }
  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    for (const item of portalNavigation) {
      await page.goto(base + item.href, { waitUntil: "networkidle" });
      await page.locator("h1").first().waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${item.href} @ ${width}`);
      assert.equal(await page.locator('nav[aria-label="Brotkrumen"]').count(), 1);
      if (width === 1440) assert.equal(await page.locator('.portal-primary a[aria-current="page"]').count(), 1);
      const filename = `${item.href.slice(1)}-${width}.png`;
      await page.screenshot({ path: join(output, filename) });
      results.browser.push({ route: item.href, width, screenshot: filename, overflow: false });
    }
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${base}/aktuell`, { waitUntil: "networkidle" });
  const trigger = page.getByRole("button", { name: "Bereiche öffnen" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  assert.equal(await page.locator("dialog").evaluate((el) => el.open), true);
  assert.equal(await page.locator('dialog nav > div > a').count(), 5);
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press("Tab");
    assert.equal(await page.evaluate(() => Boolean(document.activeElement?.closest("dialog"))), true, "Focus must stay inside modal");
  }
  await page.screenshot({ path: join(output, "drawer-375.png") });
  await page.keyboard.press("Escape");
  assert.equal(await trigger.evaluate((el) => el === document.activeElement), true);
  const focus = await trigger.evaluate((el) => { const style = getComputedStyle(el); return { width: style.outlineWidth, style: style.outlineStyle }; });
  assert.notEqual(focus.width, "0px");
  assert.notEqual(focus.style, "none");
  await trigger.click();
  await page.getByRole("dialog").getByRole("link", { name: "Bundesländer", exact: true }).click();
  await page.waitForURL("**/ebenen/laender");
  assert.equal(await page.locator("dialog").evaluate((el) => el.open), false);
  await page.goto(`${base}/transparenz#referenzrahmen`, { waitUntil: "networkidle" });
  assert.equal(new URL(page.url()).pathname, "/pruefstandard/transparenz");
  assert.equal(new URL(page.url()).hash, "#referenzrahmen");
  assert.equal(await page.locator("#referenzrahmen").count(), 1);
  await page.goto(`${base}/regierung/akte?q=Klima&typ=GESETZ#content`, { waitUntil: "networkidle" });
  assert.equal(new URL(page.url()).pathname, "/ebenen/bundesregierung/akte");
  assert.equal(new URL(page.url()).searchParams.get("q"), "Klima");
  assert.equal(await page.locator('input[name="q"]').inputValue(), "Klima");
  const decision = [...paths].find((path) => path.startsWith("/entscheidungen/"));
  assert.ok(decision, "published canonical decision required");
  await page.goto(base + decision, { waitUntil: "networkidle" });
  const views = page.getByRole("navigation", { name: "Ansichten dieser Wirkungsakte" });
  const sources = views.getByRole("link", { name: "Quellen", exact: true });
  await sources.scrollIntoViewIfNeeded();
  await sources.focus();
  const before = await sources.boundingBox();
  assert.ok(before);
  await page.keyboard.press("Enter");
  await page.waitForURL("**ansicht=quellen");
  const after = await sources.boundingBox();
  assert.ok(after);
  // Browser scroll anchoring compensates for the overview-only block above
  // the tabs disappearing. The user's visible focus position must stay put.
  assert.ok(Math.abs(after.y - before.y) < 8, "view change must preserve the visible tab position");
  assert.ok(await page.evaluate(() => scrollY > 0), "view change must not jump to page top");
  assert.equal(await sources.evaluate((el) => el === document.activeElement), true);
  await page.goBack({ waitUntil: "networkidle" });
  await page.waitForURL((url) => url.pathname === decision && !url.searchParams.has("ansicht"));
  await page.waitForFunction(() => !document.querySelector('.decision-view-nav a[href$="ansicht=quellen"]')?.hasAttribute("aria-current"));
  assert.equal(new URL(page.url()).pathname, decision);
  assert.equal(new URL(page.url()).searchParams.has("ansicht"), false);
  await page.goForward({ waitUntil: "networkidle" });
  await page.waitForURL("**ansicht=quellen");
  await page.waitForFunction(() => document.querySelector('.decision-view-nav a[href$="ansicht=quellen"]')?.getAttribute("aria-current") === "page");
  assert.equal(new URL(page.url()).searchParams.get("ansicht"), "quellen");
  assert.deepEqual(results.errors, []);
  results.keyboard = { drawer_focus_trap: "PASS", escape_return_focus: "PASS", visible_focus: "PASS", navigation_closes_drawer: "PASS", legacy_fragment_and_query: "PASS", same_page_scroll_focus_back_forward: "PASS", reduced_motion: "PASS" };
} finally { await browser.close(); }
writeFileSync(join(output, "report.json"), JSON.stringify(results, null, 2) + "\n");
writeFileSync(join(output, "index.html"), `<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Parliament-Strukturneubau – geprüfte Preview</title><h1>Parliament-Strukturneubau · geprüfte Vorschau</h1><p>Commitgebundene lokale/GitHub-CI-Preview, kein Vercel-Build.</p><p>${results.routes.length} Routen und ${results.redirects.length} Weiterleitungsregeln bestanden.</p>${results.browser.map((item) => `<section><h2>${item.route} · ${item.width} px</h2><img src="${item.screenshot}" alt="Preview der Route ${item.route} bei ${item.width} Pixeln" style="max-width:100%;height:auto"></section>`).join("")}<a href="report.json">Maschinenlesbare Prüfergebnisse</a></html>`);
console.log(JSON.stringify({ status: "PASS", routes: results.routes.length, redirects: results.redirects.length, viewport_checks: results.browser.length, keyboard: results.keyboard }, null, 2));
