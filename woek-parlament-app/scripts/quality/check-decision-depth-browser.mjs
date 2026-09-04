import assert from "node:assert/strict";
import { join } from "node:path";

/** All published canonical decisions, all five views; no Fach fixtures. */
export async function verifyDecisionDepth({ page, base, output, axeSource, paths }) {
  const proof = [];
  const views = ["sachverhalt", "wirkungsanalyse", "evidenz", "quellen", "verlauf"];
  const widths = [320, 360, 375, 390, 428, 1440];
  for (const [index, route] of paths.entries()) {
    const widthsProof = [];
    for (const width of widths) {
      await page.setViewportSize({ width, height: 960 });
      await page.goto(base + route, { waitUntil: "networkidle" });
      assert.equal(await page.locator(".decision-page h1").count(), 1);
      assert.equal(await page.locator("[data-decision-panel]").count(), 5);
      assert.equal(await page.locator("[data-decision-panel]:visible").count(), 1);
      assert.equal(await page.locator(".decision-chain ol > li").count(), 4);
      assert.equal(await page.locator(".decision-question-ring").count(), 0, "no invented answer completion");
      assert.equal(await page.locator(".decision-procedure").count(), 0, "no lastUpdated-as-event-date");
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${route} @ ${width}`);
      const words = await page.locator(".decision-tier-one").evaluate(el => [...new Intl.Segmenter("de", { granularity: "word" }).segment(el.innerText)].filter(word => word.isWordLike).length);
      widthsProof.push({ width, words, overflow: false });
      if (index === 0) await page.screenshot({ path: join(output, `decision-depth-${width}.png`), fullPage: false });
    }
    await page.setViewportSize({ width: 375, height: 960 });
    const accessibleViews = [];
    for (const view of views) {
      await page.goto(`${base}${route}?ansicht=${view}`, { waitUntil: "networkidle" });
      assert.equal(await page.locator(`[data-decision-panel="${view}"]`).isVisible(), true);
      assert.equal(await page.locator("[data-decision-panel]:visible").count(), 1);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${route} / ${view}`);
      await page.addScriptTag({ content: axeSource });
      const violations = await page.evaluate(async () => (await window.axe.run({ include: [[".decision-page"]] }, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } })).violations.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target) })));
      assert.deepEqual(violations, [], `${route} / ${view} accessibility`);
      accessibleViews.push(view);
    }
    await page.goto(base + route, { waitUntil: "networkidle" });
    const reader = page.getByRole("group", { name: "Lesemodus", exact: true });
    const before = await page.locator(".decision-depth-main").textContent();
    const simpleTitle = await page.locator("h1").innerText();
    await reader.getByRole("button", { name: "Fachlich", exact: true }).focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.locator('.decision-reader').getAttribute('data-reader-mode'), 'fachlich');
    assert.equal(await page.locator(".decision-depth-main").textContent(), before, "Fach qualifications cannot disappear in a reader mode");
    assert.notEqual(await page.locator("h1").innerText(), simpleTitle, "the pre-existing editorial/official wording must actually switch");
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await reader.getByRole("button", { name: "Fachlich", exact: true }).getAttribute("aria-pressed"), "true");
    await reader.getByRole("button", { name: "Verständlich", exact: true }).click();
    assert.equal(await page.locator("h1").innerText(), simpleTitle);
    const transparency = page.locator("#decision-transparency");
    if (await transparency.count()) {
      await transparency.locator(":scope > summary").focus();
      await page.keyboard.press("Enter");
      assert.equal(await transparency.evaluate(el => el.open), true);
      assert.ok((await transparency.textContent()).length > 100);
      await page.goto(`${base}${route}?ansicht=fachakte`, { waitUntil: "networkidle" });
      assert.equal(await transparency.evaluate(el => el.open), true, "legacy transparency view remains directly openable");
    }
    proof.push({ route, widths: widthsProof, accessible_views: accessibleViews, reader_keyboard_storage_substance: "PASS", tier_three_legacy_access: "PASS" });
  }
  // A historical deep-link must reveal its actual full path, including nested details.
  await page.goto(`${base}${paths[0]}?ansicht=wirkpfade`, { waitUntil: "networkidle" });
  const path = page.locator('details[id^="wirkpfad-"]').first();
  if (await path.count()) {
    const id = await path.getAttribute("id");
    await page.goto(`${base}${paths[0]}#${id}`, { waitUntil: "networkidle" });
    assert.equal(await page.locator(`[id="${id}"]`).isVisible(), true);
    assert.equal(await page.locator(`[id="${id}"]`).evaluate(el => el.open), true);
  }
  return proof;
}
