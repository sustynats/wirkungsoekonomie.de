import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { portalNavigation, sectionNavigation } from "../../lib/navigation.ts";

/** Read-only browser audit; the frozen text fixture is a GitHub-only artifact,
 * never a dependency of the minimal Parliament runtime build. */
export async function verifyAreas({ browser, page, base, output, axeSource }) {
  const bytes = readFileSync(new URL("../../../docs/parlament/ux/p6-text-baseline-2026-09-04.json", import.meta.url));
  const sha = createHash("sha256").update(bytes).digest("hex");
  assert.equal(sha, "b9d3f89b64e0142a4deb019a35f6c27fd32cd49f9183292b0366f468a009142d");
  const baseline = JSON.parse(bytes);
  const proof = JSON.parse(execFileSync(process.execPath, ["--conditions=react-server", "--import", "tsx", "scripts/quality/check-portal-stand.ts"], {
    encoding: "utf8", env: { ...process.env, NODE_PATH: join(process.cwd(), "node_modules/next/dist/compiled") },
  }));
  const context = await browser.newContext({ javaScriptEnabled: false });
  await context.route("**/*", route => route.abort());
  const textResults = [];
  try {
    for (const record of baseline.records) {
      const response = await fetch(base + record.route);
      assert.equal(response.status, 200);
      const document = await context.newPage();
      await document.setContent(await response.text(), { waitUntil: "domcontentloaded" });
      const targets = await document.locator("main").evaluate(el => [...el.querySelectorAll("header,section,details,ul,form,.portal-landing,.impact-register,.states-page")].map(node => ({
        destination: node.id ? "#" + node.id : node.className || node.tagName.toLowerCase(),
        text: node.textContent.replace(/\s+/g, " ").trim(),
      })));
      const texts = record.texts.map(text => ({ text, destinations: targets.filter(target => target.text.includes(text)).map(target => target.destination) }));
      textResults.push({ route: record.route, texts, missing: texts.filter(item => !item.destinations.length) });
      await document.close();
    }
  } finally { await context.close(); }
  writeFileSync(join(output, "area-text-preservation.json"), JSON.stringify({ source_commit: baseline.source_commit, baseline_sha256: sha, records: textResults }, null, 2) + "\n");
  assert.deepEqual(textResults.flatMap(record => record.missing), [], "every old area passage retains an exact destination");
  const viewports = [];
  const routes = [...portalNavigation.map(item => item.href), "/ebenen/laender"];
  for (const width of [375, 320, 360, 390, 428, 1440]) for (const route of routes) {
    await page.setViewportSize({ width, height: 960 });
    await page.goto(base + route, { waitUntil: "networkidle" });
    assert.equal(await page.locator("main h1").count(), 1, route);
    assert.equal(await page.locator("[data-portal-section-header]").count(), 1, route);
    assert.equal(await page.locator('nav[aria-label="Bereichsnavigation"]').count(), sectionNavigation(route).length ? 1 : 0, route);
    const order = await page.evaluate(() => {
      const breadcrumbs = document.querySelector('nav[aria-label="Brotkrumen"]');
      const header = document.querySelector("[data-portal-section-header]");
      const visual = document.querySelector("[data-portal-area-visual],.register-distribution");
      return { breadcrumbsBeforeHeader: !!(breadcrumbs.compareDocumentPosition(header) & Node.DOCUMENT_POSITION_FOLLOWING), headerBeforeVisual: !!(visual && (header.compareDocumentPosition(visual) & Node.DOCUMENT_POSITION_FOLLOWING)) };
    });
    assert.ok(order.breadcrumbsBeforeHeader && order.headerBeforeVisual, JSON.stringify({ route, order }));
    if (route === "/aktuell") for (const key of ["published", "radar"]) assert.equal(Number(await page.locator('[data-area-count="' + key + '"]').textContent()), proof[key]);
    if (route === "/monitor") {
      for (const stage of proof.maturity) assert.equal(Number(await page.locator('[data-area-maturity="' + stage.id + '"]').textContent()), stage.count);
      assert.equal(await page.locator('[data-area-maturity="open"]').count(), 1);
    }
    if (route === "/ebenen" || route === "/ebenen/laender") {
      assert.deepEqual(await page.locator("[data-state-id]").evaluateAll(nodes => nodes.map(node => [node.dataset.stateId, node.dataset.stateReview]).sort()), proof.states.map(state => [state.id, state.category]).sort());
      for (const category of proof.stateDistribution) assert.equal(Number(await page.locator('[data-state-category="' + category.id + '"] strong').textContent()), category.count);
      for (const state of proof.states) {
        const tile = page.locator('[data-state-id="' + state.id + '"] a');
        assert.equal(await tile.getAttribute("href"), "/ebenen/laender/" + state.slug);
        assert.ok((await tile.innerText()).includes(state.symbol));
        assert.ok((await tile.innerText()).includes(state.compactLabel));
      }
    }
    const disclosure = page.locator("#monitor-einordnung,#states-coverage-context");
    if (await disclosure.count()) {
      await disclosure.locator("summary").focus();
      await page.keyboard.press("Enter");
      assert.notEqual(await disclosure.getAttribute("open"), null);
      assert.equal(await disclosure.locator("p").first().isVisible(), true);
    }
    const geometry = await page.evaluate(() => ({
      viewport: innerWidth, document: document.documentElement.scrollWidth,
      overflowing: [...document.querySelectorAll("body *")].flatMap(node => {
        const rect = node.getBoundingClientRect();
        if (!rect.width || (rect.right <= innerWidth + 1 && rect.left >= -1 && node.scrollWidth <= node.clientWidth + 1)) return [];
        const style = getComputedStyle(node);
        return [{ tag: node.tagName, class: node.className, text: node.textContent.slice(0, 160), left: rect.left, right: rect.right, client: node.clientWidth, scroll: node.scrollWidth, font: style.font, grid: style.gridTemplateColumns }];
      }),
    }));
    if (geometry.document > width) {
      writeFileSync(join(output, "area-overflow-" + width + ".json"), JSON.stringify({ route, ...geometry }, null, 2) + "\n");
      await page.screenshot({ path: join(output, "area-overflow-" + width + ".png") });
    }
    assert.equal(geometry.document > width, false, JSON.stringify({ route, ...geometry }));
    if (route === "/wirkungsakten") {
      const clippedChips = await page.locator(".impact-register-row .chip").evaluateAll(nodes => nodes.filter(node => node.scrollWidth > node.clientWidth + 1).map(node => node.textContent));
      assert.deepEqual(clippedChips, [], "complete materiality labels must fit independently of OS font metrics");
    }
    await page.addScriptTag({ content: axeSource });
    const a11y = await page.evaluate(async () => (await window.axe.run({ include: [["main"]] }, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } })).violations.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target) })));
    assert.deepEqual(a11y, [], route + " accessibility@" + width);
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({ path: join(output, "area-" + route.slice(1).replaceAll("/", "-") + "-" + width + ".png") });
    viewports.push({ route, width, a11y, structure: "PASS", source_bound_counts: "PASS", keyboard_disclosure: "PASS" });
  }
  return { baseline_sha256: sha, preserved_paragraphs: textResults.reduce((count, record) => count + record.texts.length, 0), missing: 0, viewports };
}
