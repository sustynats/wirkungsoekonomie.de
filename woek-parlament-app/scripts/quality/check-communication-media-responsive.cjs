#!/usr/bin/env node

const { createRequire } = require("node:module");
const { mkdirSync, writeFileSync } = require("node:fs");
const path = require("node:path");

const runtime = process.env.WOEK_PLAYWRIGHT_REQUIRE;
if (!runtime) throw new Error("WOEK_PLAYWRIGHT_REQUIRE must point to the approved browser runtime package.json");
const runtimeRequire = createRequire(runtime);
const { chromium } = runtimeRequire("playwright");
const axeSource = require("axe-core").source;
const baseUrl = (process.env.WOEK_COMMUNICATION_BROWSER_BASE_URL ?? "http://127.0.0.1:3018").replace(/\/$/, "");
const output = process.env.WOEK_COMMUNICATION_BROWSER_REPORT ?? path.resolve("data/autopilot/audit/2.3-remediated/COMMUNICATION-MEDIA-RESPONSIVE-A11Y.json");
const chrome = process.env.WOEK_AUDIT_CHROMIUM;
const widths = [320, 360, 375, 390, 428, 768, 1024, 1280, 1440];
const routes = ["afd", "bsw", "cdu", "spd", "gruene", "linke"].map((party) => `/laender/sachsen-anhalt/wahlprogramme/ltw-2026-st-${party}`);

(async () => {
  const browser = await chromium.launch({ headless: true, ...(chrome ? { executablePath: chrome } : {}) });
  const results = [];
  try {
    let routeCursor = 0;
    await Promise.all(Array.from({ length: 2 }, async () => {
      while (routeCursor < routes.length) {
      const route = routes[routeCursor++];
      const context = await browser.newContext({ viewport: { width: 320, height: 844 }, deviceScaleFactor: 1 });
      const page = await context.newPage();
      const consoleErrors = [];
      const pageErrors = [];
      page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
      page.on("pageerror", (error) => pageErrors.push(error.message));
      let response = null;
      let navigationError = null;
      try { response = await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded", timeout: 90_000 }); }
      catch (error) { navigationError = error instanceof Error ? error.message : String(error); }
      for (const width of widths) {
        await page.setViewportSize({ width, height: width < 600 ? 844 : 960 });
        await page.waitForTimeout(75);
        const metrics = navigationError ? null : await page.evaluate(() => {
          const root = document.querySelector('[data-woek-analysis-layer="COMMUNICATION_MEDIA_IMPACT"]');
          const visibleText = (root?.textContent ?? "").replace(/\s+/g, " ").trim();
          const sourceLinks = [...(root?.querySelectorAll('a[href^="/quellen/"]') ?? [])];
          const summaries = [...(root?.querySelectorAll("details > summary") ?? [])];
          const overflow = [...document.querySelectorAll("body *")].flatMap((element) => {
            const rect = element.getBoundingClientRect();
            return rect.right > innerWidth + 1 || rect.left < -1
              ? [{ tag: element.tagName, className: String(element.className || "").slice(0, 100), left: Math.round(rect.left), right: Math.round(rect.right) }]
              : [];
          }).slice(0, 20);
          const rawTokens = [...new Set(visibleText.match(/\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/g) ?? [])];
          return {
            documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
            viewportWidth: innerWidth,
            h1Count: document.querySelectorAll("h1").length,
            layerPresent: Boolean(root),
            overviewPresent: Boolean(root?.querySelector("article")),
            patterns: root?.querySelectorAll("[data-woek-communication-pattern]").length ?? 0,
            evidenceCards: root?.querySelectorAll('[aria-label="Evidenzprofil der Kommunikationswirkungsanalyse"] article').length ?? 0,
            sourceLinks: sourceLinks.length,
            summariesFocusable: summaries.every((summary) => summary.tabIndex >= 0),
            overflow,
            rawTokens,
          };
        });
        let axeViolations = [];
        if (!navigationError && route === routes[0] && (width === 390 || width === 1440)) {
          await page.addScriptTag({ content: axeSource });
          const axe = await page.evaluate(async () => window.axe.run(document.querySelector('[data-woek-analysis-layer="COMMUNICATION_MEDIA_IMPACT"]'), { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } }));
          axeViolations = axe.violations.filter((item) => item.impact === "serious" || item.impact === "critical").map((item) => ({ id: item.id, impact: item.impact, nodes: item.nodes.length }));
        }
        results.push({ route, width, httpStatus: response?.status() ?? null, navigationError, consoleErrors: [...consoleErrors], pageErrors: [...pageErrors], metrics, axeViolations });
      }
      await context.close();
      }
    }));
  } finally { await browser.close(); }
  const failures = results.flatMap((result) => {
    const issues = [];
    if (result.httpStatus !== 200) issues.push(`HTTP_${result.httpStatus ?? "NONE"}`);
    if (result.navigationError) issues.push("NAVIGATION_ERROR");
    if (result.consoleErrors.length) issues.push("CONSOLE_ERROR");
    if (result.pageErrors.length) issues.push("PAGE_ERROR");
    if (!result.metrics?.layerPresent || !result.metrics?.overviewPresent) issues.push("COMMUNICATION_LAYER_MISSING");
    if (result.metrics?.patterns !== 5) issues.push("PATTERN_COUNT");
    if (result.metrics?.evidenceCards !== 5) issues.push("EVIDENCE_AXES");
    if (!result.metrics?.sourceLinks) issues.push("SOURCE_INTERMEDIARY_MISSING");
    if (!result.metrics?.summariesFocusable) issues.push("SUMMARY_NOT_KEYBOARD_FOCUSABLE");
    if (result.metrics && result.metrics.documentWidth > result.metrics.viewportWidth + 1) issues.push("HORIZONTAL_OVERFLOW");
    if (result.metrics?.rawTokens.length) issues.push("RAW_INTERNAL_ENUM");
    if (result.metrics?.h1Count !== 1) issues.push("H1_COUNT");
    if (result.axeViolations.length) issues.push("AXE_SERIOUS_OR_CRITICAL");
    return issues.length ? [{ route: result.route, width: result.width, issues }] : [];
  });
  const report = { schema_version: "woek-communication-media-responsive-a11y-1.0", status: failures.length ? "FAIL" : "PASS", base_url: baseUrl, breakpoints: widths, routes, axe_reference_route: routes[0], axe_breakpoints: [390, 1440], checks: results.length, results, failures };
  mkdirSync(path.dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ status: report.status, routes: routes.length, breakpoints: widths.length, checks: results.length, failures: failures.length, output }, null, 2));
  if (failures.length) process.exitCode = 1;
})().catch((error) => { console.error(error); process.exitCode = 1; });
