#!/usr/bin/env node

const { createRequire } = require("node:module");
const { existsSync, mkdirSync, writeFileSync } = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const playwrightRequireRoot = process.env.WOEK_PLAYWRIGHT_REQUIRE;
if (!playwrightRequireRoot) {
  throw new Error("WOEK_PLAYWRIGHT_REQUIRE must point to a package.json in the approved browser-audit runtime.");
}
const runtimeRequire = createRequire(playwrightRequireRoot);
const { chromium } = runtimeRequire("playwright");
const axeSource = require("axe-core").source;

const baseUrl = process.env.WOEK_AUDIT_BASE_URL || "http://127.0.0.1:8787";
const output = path.resolve(process.env.WOEK_AUDIT_OUTPUT || "data/autopilot/audit/2.3-remediated/PUBLIC-UX-RENDERED-AUDIT-2.3.json");
const screenshotDir = process.env.WOEK_AUDIT_SCREENSHOTS || path.join(os.tmpdir(), "woek-public-ux-audit");
const browserCandidates = [
  process.env.WOEK_AUDIT_CHROMIUM,
].filter(Boolean);
const widths = [320, 360, 375, 390, 428, 768, 1024, 1280, 1440];
const routes = [
  "/",
  "/entscheidungen/schutz-vor-k-o-tropfen",
  "/regierung",
  "/regierung/wirkungsanalysen",
  "/regierung/wirkungsanalysen/WOEK-IMPACT-BUND-GMODG-2026",
  "/regierung/akte/govaction%3Adip%3A325252",
  "/regierung/akte/govaction%3Abreg-cabinet%3A2435812%3Atop%3A5",
  "/wirkungsfaelle",
  "/eu",
  "/eu/wirkungsfaelle",
  "/eu/wirkungsfaelle/EU-IMPACT-2026-004",
  "/laender",
  "/begriffe",
  "/entscheidungen/bt21-dip-907488f49a72",
  "/regierung/methodik",
  "/regierung/transparenz",
  "/quellen",
  "/quellen/quelle-3225f31089a72a6b",
  "/suche?q=Klima",
];

function slug(value) {
  return value.replace(/^\//, "home-").replace(/[^a-z0-9]+/gi, "-").replace(/-+$/, "").slice(0, 90);
}

(async () => {
  mkdirSync(path.dirname(output), { recursive: true });
  mkdirSync(screenshotDir, { recursive: true });
  const executablePath = browserCandidates.find(existsSync);
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  const results = [];

  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 960 }, deviceScaleFactor: 1 });
    for (const route of routes) {
      const page = await context.newPage();
      const consoleErrors = [];
      const pageErrors = [];
      page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
      page.on("pageerror", (error) => pageErrors.push(error.message));
      let response;
      let navigationError = null;
      try {
        response = await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle", timeout: 30_000 });
      } catch (error) {
        navigationError = error instanceof Error ? error.message : String(error);
      }

      const metrics = navigationError ? null : await page.evaluate(() => {
        const body = document.body;
        const html = document.documentElement;
        const assessment = document.querySelector(".overview-assessment-label");
        const assessmentSection = document.querySelector(".overview-assessment");
        const process = document.querySelector("[data-woek-process-metadata]");
        const substantive = document.querySelector("[data-woek-substantive-impact]");
        const source = document.querySelector("[data-woek-source-layer]");
        const recommendation = document.querySelector("[data-woek-recommendation-layer]");
        const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((element) => ({
          level: Number(element.tagName.slice(1)),
          text: (element.textContent || "").trim().slice(0, 160),
        }));
        const headingSkips = headings.slice(1).flatMap((heading, index) => heading.level > headings[index].level + 1
          ? [{ from: headings[index], to: heading }]
          : []);
        const overflow = [...document.querySelectorAll("body *")].flatMap((element) => {
          const rect = element.getBoundingClientRect();
          return rect.right > innerWidth + 1 || rect.left < -1
            ? [{ tag: element.tagName, className: String(element.className || "").slice(0, 100), left: Math.round(rect.left), right: Math.round(rect.right) }]
            : [];
        }).slice(0, 20);
        const controls = [...document.querySelectorAll("button,input,select,textarea,summary,a.button-link,a.primary-button,a.secondary-button")];
        const smallTargets = controls.flatMap((element) => {
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && (rect.width < 24 || rect.height < 24)
            ? [{ tag: element.tagName, text: (element.textContent || element.getAttribute("aria-label") || "").trim().slice(0, 100), width: Math.round(rect.width), height: Math.round(rect.height) }]
            : [];
        }).slice(0, 20);
        const publicClone = body.cloneNode(true);
        publicClone.querySelectorAll("script,style").forEach((node) => node.remove());
        const publicText = publicClone.textContent || "";
        // Official source URLs may legitimately contain underscores. Strip the
        // complete URL before looking for machine tokens so URL path segments
        // cannot masquerade as public schema leaks.
        const publicTextWithoutUrls = publicText.replace(/https?:\/\/[^\s<>()\]"']+/gi, " ");
        const rawTokens = [...new Set(publicTextWithoutUrls.match(/\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b|\b[a-z][a-z0-9]*(?:_[a-z0-9]+)+\b/g) || [])].slice(0, 30);
        const assessmentStyle = assessment ? getComputedStyle(assessment) : null;
        const assessmentIconPairs = [...document.querySelectorAll(".overview-assessment")].map((section) => ({
          expected: section.getAttribute("data-woek-assessment-direction"),
          rendered: section.querySelector("[data-woek-assessment-icon]")?.getAttribute("data-woek-assessment-icon") ?? null,
          label: (section.querySelector(".overview-assessment-label")?.textContent || "").trim(),
        }));
        const normalizeAssessmentCopy = (value) => String(value || "")
          .toLocaleLowerCase("de-DE")
          .replace(/[^a-z0-9äöüß]+/gi, " ")
          .replace(/\s+/g, " ")
          .trim();
        const substantiveCopyOverlap = (left, right) => {
          const normalizedLeft = normalizeAssessmentCopy(left);
          const normalizedRight = normalizeAssessmentCopy(right);
          if (!normalizedLeft || !normalizedRight) return false;
          if (normalizedLeft === normalizedRight) return true;
          const shorter = normalizedLeft.length <= normalizedRight.length ? normalizedLeft : normalizedRight;
          const longer = normalizedLeft.length > normalizedRight.length ? normalizedLeft : normalizedRight;
          return shorter.length >= 40 && longer.includes(shorter);
        };
        const duplicateAssessmentCopies = [...document.querySelectorAll(".overview-assessment")].flatMap((section, sectionIndex) => {
          const publicTextOf = (selector, prefix) => (section.querySelector(selector)?.textContent || "").trim().replace(prefix, "").trim();
          const copies = [
            { field: "assessment", value: publicTextOf(".overview-assessment-label", /^/) },
            { field: "summary", value: publicTextOf(".overview-assessment-summary", /^Wirkungspotenzial kompakt:\s*/i) },
            { field: "core", value: publicTextOf(".overview-assessment-core", /^Wirkungskern:\s*/i) },
            { field: "finding", value: publicTextOf(".overview-assessment-finding", /^Key Finding:\s*/i) },
          ].filter((entry) => entry.value);
          const withinAssessment = copies.flatMap((left, leftIndex) => copies.slice(leftIndex + 1).flatMap((right) => substantiveCopyOverlap(left.value, right.value)
            ? [{ sectionIndex, left: left.field, right: right.field, copy: right.value.slice(0, 180) }]
            : []));
          const surface = section.closest("[data-woek-preview-card],.decision-page,.government-impact-case,.source-usage-list article");
          const maturityCopies = surface ? [...surface.querySelectorAll(".public-maturity-columns li")].map((element) => {
            const value = (element.textContent || "").trim();
            return value.replace(/^[^:]{1,80}:\s*/, "");
          }).filter(Boolean) : [];
          const maturityDuplicates = copies.flatMap((copy) => maturityCopies.flatMap((maturityCopy) => substantiveCopyOverlap(copy.value, maturityCopy)
            ? [{ sectionIndex, left: copy.field, right: "public-maturity", copy: maturityCopy.slice(0, 180) }]
            : []));
          return [...withinAssessment, ...maturityDuplicates];
        });
        const focusCandidate = document.querySelector("a[href],button,input,select,textarea,summary");
        if (focusCandidate instanceof HTMLElement) focusCandidate.focus();
        const focusStyle = focusCandidate ? getComputedStyle(focusCandidate) : null;
        return {
          documentWidth: Math.max(body.scrollWidth, html.scrollWidth),
          viewportWidth: innerWidth,
          overflow,
          h1Count: document.querySelectorAll("h1").length,
          headings,
          headingSkips,
          landmarks: {
            header: document.querySelectorAll("header").length,
            nav: document.querySelectorAll("nav").length,
            main: document.querySelectorAll("main").length,
            footer: document.querySelectorAll("footer").length,
          },
          assessment: assessment ? {
            tag: assessment.tagName,
            fontFamily: assessmentStyle.fontFamily,
            fontSize: assessmentStyle.fontSize,
            fontWeight: assessmentStyle.fontWeight,
            lineHeight: assessmentStyle.lineHeight,
            text: (assessment.textContent || "").trim(),
          } : null,
          assessmentBeforeProcess: [...document.querySelectorAll("[data-woek-preview-card]")].every((card) => {
            const cardAssessment = card.querySelector(".overview-assessment");
            const cardProcess = card.querySelector("[data-woek-process-metadata]");
            return !cardAssessment || !cardProcess || Boolean(cardAssessment.compareDocumentPosition(cardProcess) & Node.DOCUMENT_POSITION_FOLLOWING);
          }),
          assessmentIconPairs,
          assessmentIconAgreement: assessmentIconPairs.every((pair) => pair.expected && pair.expected === pair.rendered && pair.expected !== "unknown"),
          duplicateAssessmentCopies,
          substantiveBeforeProcess: !substantive || !process || Boolean(substantive.compareDocumentPosition(process) & Node.DOCUMENT_POSITION_FOLLOWING),
          sourceBeforeProcess: !source || !process || Boolean(source.compareDocumentPosition(process) & Node.DOCUMENT_POSITION_FOLLOWING),
          recommendationBeforeProcess: !recommendation || !process || Boolean(recommendation.compareDocumentPosition(process) & Node.DOCUMENT_POSITION_FOLLOWING),
          smallTargets,
          rawTokens,
          focus: focusCandidate ? {
            tag: focusCandidate.tagName,
            outlineStyle: focusStyle.outlineStyle,
            outlineWidth: focusStyle.outlineWidth,
            outlineOffset: focusStyle.outlineOffset,
          } : null,
          objectDumpVisible: /\[object Object\]|\{\s*(?:agenda_item|dip_document_id)\s*[,}:]/.test(publicText),
        };
      });

      let axe = { violations: [] };
      if (!navigationError && (width === 390 || width === 1440)) {
        await page.addScriptTag({ content: axeSource });
        axe = await page.evaluate(async () => window.axe.run(document, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
        }));
      }
      if (!navigationError && [320, 390, 1440].includes(width) && ["/", "/entscheidungen/schutz-vor-k-o-tropfen", "/regierung/wirkungsanalysen/WOEK-IMPACT-BUND-GMODG-2026", "/regierung/akte/govaction%3Adip%3A325252", "/eu/wirkungsfaelle/EU-IMPACT-2026-004", "/quellen", "/suche?q=Klima"].includes(route)) {
        await page.screenshot({ path: path.join(screenshotDir, `${width}-${slug(route)}.png`), fullPage: true });
      }
      results.push({
        route,
        width,
        httpStatus: response?.status() ?? null,
        navigationError,
        consoleErrors,
        pageErrors,
        metrics,
        axeViolations: axe.violations.map((violation) => ({ id: violation.id, impact: violation.impact, description: violation.description, nodes: violation.nodes.length })),
      });
      await page.close();
    }
    await context.close();
  }
  await browser.close();

  const failures = results.flatMap((result) => {
    const issues = [];
    if (result.httpStatus !== 200) issues.push(`HTTP_${result.httpStatus ?? "NONE"}`);
    if (result.navigationError) issues.push("NAVIGATION_ERROR");
    if (result.consoleErrors.length) issues.push("CONSOLE_ERROR");
    if (result.pageErrors.length) issues.push("PAGE_ERROR");
    if (result.metrics && result.metrics.documentWidth > result.metrics.viewportWidth + 1) issues.push("HORIZONTAL_OVERFLOW");
    if (result.metrics?.objectDumpVisible) issues.push("OBJECT_DUMP_VISIBLE");
    if (result.metrics?.rawTokens.length) issues.push("RAW_INTERNAL_TOKEN_VISIBLE");
    if (result.metrics && result.metrics.h1Count !== 1) issues.push("H1_COUNT");
    if (result.metrics?.headingSkips.length) issues.push("HEADING_LEVEL_SKIP");
    if (result.metrics && (!result.metrics.assessmentBeforeProcess || !result.metrics.substantiveBeforeProcess || !result.metrics.sourceBeforeProcess || !result.metrics.recommendationBeforeProcess)) issues.push("PROCESS_PRECEDES_IMPACT");
    if (result.metrics?.assessment) {
      const fontSize = Number.parseFloat(result.metrics.assessment.fontSize);
      if (result.metrics.assessment.tag !== "P" || fontSize < 18 || fontSize > 20.5 || !/sans/i.test(result.metrics.assessment.fontFamily)) issues.push("ASSESSMENT_TYPOGRAPHY");
    }
    if (result.metrics?.assessmentIconPairs.length && !result.metrics.assessmentIconAgreement) issues.push("ASSESSMENT_ICON_DIRECTION_MISMATCH");
    if (result.metrics?.duplicateAssessmentCopies.length) issues.push("DUPLICATE_ASSESSMENT_COPY");
    if (result.axeViolations.some((violation) => violation.impact === "critical" || violation.impact === "serious")) issues.push("AXE_SERIOUS_OR_CRITICAL");
    return issues.length ? [{ route: result.route, width: result.width, issues }] : [];
  });
  const report = {
    schema_version: "woek-public-ux-rendered-audit-1.0",
    generated_at: new Date().toISOString(),
    base_url: baseUrl,
    status: failures.length ? "FAIL" : "PASS",
    breakpoints: widths,
    routes,
    measurements: results.length,
    screenshots: screenshotDir,
    failures,
    results,
  };
  writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ status: report.status, measurements: report.measurements, failures: failures.length, output, screenshots: screenshotDir }, null, 2));
  if (failures.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
