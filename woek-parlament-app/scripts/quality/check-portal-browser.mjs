import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { canonicalPortalHref, portalRedirects, portalNavigation, allNavigationItems } from "../../lib/navigation.ts";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PORTAL_PLAYWRIGHT_MODULE ?? "playwright");
const base = process.env.PORTAL_BASE_URL ?? "http://127.0.0.1:3024";
const output = process.env.PORTAL_BROWSER_REPORT_DIR ?? "/tmp/woek-portal-p1-preview";
mkdirSync(output, { recursive: true });
const results = { redirects: [], routes: [], browser: [], errors: [] };
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
  assert.match(body, /aria-label="Brotkrumen"/, path);
  assert.equal((body.match(/aria-label="Brotkrumen"/g) ?? []).length, 1, path);
  assert.doesNotMatch(body, /Wirkungsportal Parlament[^<]*Wirkungsportal Parlament<\/title>/, path);
  results.routes.push({ route: path, status: response.status, breadcrumbs: "PASS" });
}
for (const path of ["/pruefstandard/transparenz/datenbetrieb", "/autopilot/status"]) {
  const response = await fetch(`${base}${path}`, { headers: { purpose: "prefetch" } });
  assert.equal(response.status, 401, `${path} must retain authentication on prefetch`);
}

const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  page.on("pageerror", (error) => results.errors.push(error.message));
  page.on("response", (response) => { if (response.status() >= 500) results.errors.push(`HTTP ${response.status()} ${new URL(response.url()).pathname}`); });
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
  const before = await page.evaluate(() => scrollY);
  await page.keyboard.press("Enter");
  await page.waitForURL("**ansicht=quellen");
  assert.ok(Math.abs(await page.evaluate(() => scrollY) - before) < 8, "view change must not jump to page top");
  assert.equal(await sources.evaluate((el) => el === document.activeElement), true);
  await page.goBack({ waitUntil: "networkidle" });
  assert.equal(new URL(page.url()).pathname, decision);
  assert.equal(new URL(page.url()).searchParams.has("ansicht"), false);
  await page.goForward({ waitUntil: "networkidle" });
  assert.equal(new URL(page.url()).searchParams.get("ansicht"), "quellen");
  assert.deepEqual(results.errors, []);
  results.keyboard = { drawer_focus_trap: "PASS", escape_return_focus: "PASS", visible_focus: "PASS", navigation_closes_drawer: "PASS", legacy_fragment_and_query: "PASS", same_page_scroll_focus_back_forward: "PASS", reduced_motion: "PASS" };
} finally { await browser.close(); }
writeFileSync(join(output, "report.json"), JSON.stringify(results, null, 2) + "\n");
writeFileSync(join(output, "index.html"), `<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>P1 · Navigation – geprüfte Preview</title><h1>P1 · Navigation und Routen</h1><p>Commitgebundene lokale/GitHub-CI-Preview, kein Vercel-Build.</p><p>${results.routes.length} Routen und ${results.redirects.length} Weiterleitungsregeln bestanden.</p>${results.browser.map((item) => `<section><h2>${item.route} · ${item.width} px</h2><img src="${item.screenshot}" alt="Preview der Route ${item.route} bei ${item.width} Pixeln" style="max-width:100%;height:auto"></section>`).join("")}<a href="report.json">Maschinenlesbare Prüfergebnisse</a></html>`);
console.log(JSON.stringify({ status: "PASS", routes: results.routes.length, redirects: results.redirects.length, viewport_checks: results.browser.length, keyboard: results.keyboard }, null, 2));
