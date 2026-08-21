#!/usr/bin/env node

const { createRequire } = require("node:module");
const { mkdirSync, writeFileSync } = require("node:fs");
const path = require("node:path");

const runtime = process.env.WOEK_PLAYWRIGHT_REQUIRE;
if (!runtime) throw new Error("WOEK_PLAYWRIGHT_REQUIRE must point to the approved browser runtime package.json");
const { chromium } = createRequire(runtime)("playwright");
const axeSource = require("axe-core").source;
const baseUrl = (process.env.WOEK_RLP_COALITION_BROWSER_BASE_URL ?? "http://127.0.0.1:3018").replace(/\/$/, "");
const output = process.env.WOEK_RLP_COALITION_BROWSER_REPORT ?? path.resolve("data/autopilot/audit/2.3-remediated/RLP-COALITION-2026-2031-RESPONSIVE-A11Y.json");
const chrome = process.env.WOEK_AUDIT_CHROMIUM;
const widths = [320, 360, 375, 390, 428, 768, 1024, 1280, 1440];
const coalitionRoute = "/laender/rheinland-pfalz/mandat-und-praxis";
const routes = [
  coalitionRoute,
  "/laender/rheinland-pfalz",
  "/laender/rheinland-pfalz/regierung",
  "/suche",
  "/quellen/quelle-6ade1cff08c61280",
  "/quellen/quelle-8b3c481a8be218ab",
  "/quellen/quelle-c075cfc4217ea037",
  "/quellen/quelle-4b0125137a475c7c",
  "/quellen/quelle-0e2b9f976d9dbebd",
  "/quellen/quelle-f512147124c8b14f",
  "/quellen/quelle-3ad90bd6b684e240",
  "/quellen/quelle-95e74c2905cabc7d",
  "/quellen/quelle-b31d73f742fa7655",
  "/quellen/quelle-2b41c262190e77d5",
  "/quellen/quelle-123a206e5bce74d2",
  "/quellen/quelle-f255d91d79106560",
  "/quellen/quelle-5fbffb8156d9536b",
  "/quellen/quelle-4a29e540381929ca",
  "/quellen/quelle-6972a69a97de51a6",
];

(async () => {
  const browser = await chromium.launch({ headless: true, ...(chrome ? { executablePath: chrome } : {}) });
  const results = [];
  try {
    for (const route of routes) {
      for (const width of widths) {
        const context = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 960 } });
        const page = await context.newPage();
        const consoleErrors = [];
        const pageErrors = [];
        page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
        page.on("pageerror", (error) => pageErrors.push(error.message));
        let response = null;
        let navigationError = null;
        try {
          response = await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded", timeout: 90_000 });
        } catch (error) {
          navigationError = String(error);
        }
        const metrics = navigationError ? null : await page.evaluate((expectedRoute) => {
          const visible = document.body.innerText;
          return {
            documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
            viewportWidth: innerWidth,
            h1Count: document.querySelectorAll("h1").length,
            assessmentCount: document.querySelectorAll('[data-woek-preview-assessment="published"]').length,
            coalitionHeading: expectedRoute === location.pathname ? /Gemeinsame Verantwortung für ein starkes Rheinland-Pfalz/.test(visible) : true,
            objectLeak: /Objects are not valid as a React child|\[object Object\]/.test(visible),
            internalIdLeak: /\b(?:RLP-KV26|RP-IMPACT)-[A-Z0-9-]+\b/.test(visible),
            rawTokens: [...new Set(visible.match(/\b(?:HIGH_MATERIALITY_REVIEW|PARTY_OFFICIAL_REPUBLISHED_CONTRACT_TEXT|RecommendationRecord|[A-Z][A-Z0-9]+_[A-Z0-9_]+)\b/g) ?? [])],
          };
        }, coalitionRoute);
        let axeViolations = [];
        if (!navigationError && route === coalitionRoute && (width === 390 || width === 1440)) {
          await page.addScriptTag({ content: axeSource });
          const axe = await page.evaluate(async () => window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } }));
          axeViolations = axe.violations.filter((item) => ["serious", "critical"].includes(item.impact)).map((item) => ({ id: item.id, impact: item.impact, nodes: item.nodes.length }));
        }
        results.push({ route, width, httpStatus: response?.status() ?? null, navigationError, consoleErrors, pageErrors, metrics, axeViolations });
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
  const failures = results.flatMap((result) => {
    const issues = [];
    if (result.httpStatus !== 200) issues.push(`HTTP_${result.httpStatus ?? "NONE"}`);
    if (result.navigationError) issues.push("NAVIGATION");
    if (result.consoleErrors.length) issues.push("CONSOLE");
    if (result.pageErrors.length) issues.push("PAGE_ERROR");
    if (result.metrics && result.metrics.documentWidth > result.metrics.viewportWidth + 1) issues.push("OVERFLOW");
    if (result.metrics?.h1Count !== 1) issues.push("HEADING");
    if (!result.metrics?.coalitionHeading) issues.push("COALITION_CONTENT_MISSING");
    if (result.route === coalitionRoute && !result.metrics?.assessmentCount) issues.push("ASSESSMENT_MISSING");
    if (result.metrics?.objectLeak) issues.push("OBJECT_LEAK");
    if (result.metrics?.internalIdLeak) issues.push("INTERNAL_ID_LEAK");
    if (result.metrics?.rawTokens.length) issues.push("RAW_ENUM");
    if (result.axeViolations.length) issues.push("AXE");
    return issues.length ? [{ route: result.route, width: result.width, issues, rawTokens: result.metrics?.rawTokens }] : [];
  });
  const report = {
    schema_version: "woek-rlp-coalition-responsive-1.0",
    status: failures.length ? "FAIL" : "PASS",
    base_url: baseUrl,
    routes,
    breakpoints: widths,
    checks: results.length,
    results,
    failures,
  };
  mkdirSync(path.dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ status: report.status, checks: results.length, failures: failures.length, output }, null, 2));
  if (failures.length) process.exitCode = 1;
})().catch((error) => { console.error(error); process.exitCode = 1; });
