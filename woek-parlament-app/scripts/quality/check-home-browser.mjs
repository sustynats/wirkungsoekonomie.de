import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

export async function verifyHome({ page, base, output, axeSource }) {
  const proof = JSON.parse(execFileSync(process.execPath, ["--conditions=react-server", "--import", "tsx", "scripts/quality/check-portal-stand.ts"], { encoding: "utf8", env: { ...process.env, NODE_PATH: join(process.cwd(), "node_modules/next/dist/compiled") } }));
  const reports = [];
  for (const width of [320, 360, 375, 390, 428, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    await page.goto(`${base}/`, { waitUntil: "networkidle" });
    assert.deepEqual(await page.locator("[data-home-block]").evaluateAll((blocks) => blocks.map((block) => block.dataset.homeBlock)), ["hero", "stand", "radar", "legend", "ways", "states"]);
    const words = await page.locator(".portal-home").evaluate((element) => [...new Intl.Segmenter("de", { granularity: "word" }).segment(element.innerText)].filter((word) => word.isWordLike).length);
    assert.ok(words <= 500, `Home ${width}: ${words} words > 500`);
    for (const [field, count] of [["published", proof.published], ["radar", proof.radar], ["states", proof.statesWithReview]]) assert.equal(Number(await page.locator(`[data-portal-count="${field}"]`).textContent()), count);
    assert.equal(await page.locator(".home-stand time").getAttribute("datetime"), proof.latestRecordDate);
    assert.deepEqual(await page.locator("[data-state-id]").evaluateAll((items) => items.map((item) => [item.dataset.stateId, item.dataset.stateReview]).sort()), proof.states.map((state) => [state.id, state.category]).sort());
    for (const stage of proof.maturity) assert.equal(Number(await page.locator(`[data-maturity-category="${stage.id}"] strong`).textContent()), stage.count);
    for (const category of proof.stateDistribution) assert.equal(Number(await page.locator(`[data-state-category="${category.id}"] strong`).textContent()), category.count);
    const segments = await page.locator("[data-maturity-segment]").evaluateAll((segments) => segments.map((segment) => ({ count: Number(segment.dataset.count), width: segment.getBBox().width })));
    for (const segment of segments) assert.ok(Math.abs(segment.width / 1000 - segment.count / proof.published) < 0.00001);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `overflow ${width}`);
    await page.addScriptTag({ content: axeSource });
    const a11y = await page.evaluate(async () => (await window.axe.run({ include: [[".portal-home"]] }, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } })).violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) })));
    assert.deepEqual(a11y, [], `home accessibility ${width}`);
    await page.screenshot({ path: join(output, `home-${width}.png`), fullPage: true });
    reports.push({ width, words, a11y, count_binding: "PASS", cartogram_exact_set: "PASS", proportional_geometry_under_csp: "PASS" });
  }
  await page.goto(`${base}/pruefstandard/methodik`, { waitUntil: "networkidle" });
  const details = page.locator(".relocated-parliament-mode");
  await details.locator("summary").focus(); await page.keyboard.press("Enter");
  assert.ok(await details.getAttribute("open") !== null);
  assert.ok(await page.getByText("Für die parlamentarische Vorbereitung", { exact: true }).isVisible());
  for (const path of ["/pruefstandard/transparenz#portalstand", "/monitor", "/ebenen/laender", "/aktuell/radar"]) {
    await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
    assert.equal(await page.locator("h1").count(), 1, `relocation must not duplicate H1 ${path}`);
  }
  return { proof, viewports: reports, keyboard_disclosure: "PASS" };
}
