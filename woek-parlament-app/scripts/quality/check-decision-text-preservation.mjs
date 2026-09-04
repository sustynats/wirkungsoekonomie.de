import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { join } from "node:path";

/** Audit-only dependency outside the minimal runtime. Called by the complete
 * GitHub browser preview, never by the minimal deployment artifact build. */
export async function verifyDecisionText({ browser, base, output }) {
  const bytes = gunzipSync(readFileSync(new URL("../../../docs/parlament/ux/p5-text-baseline-2026-09-04.json.gz", import.meta.url)));
  const baselineSha = createHash("sha256").update(bytes).digest("hex");
  assert.equal(baselineSha, "13330a92316cb911dfc9ffe2a037afa803d3895510e2fc4b3eaa663ce1b00c7f");
  const baseline = JSON.parse(bytes);
  assert.equal(baseline.records.length, 196);
  const context = await browser.newContext({ javaScriptEnabled: false });
  await context.route("**/*", route => route.abort());
  const results = [];
  try {
    for (const slug of [...new Set(baseline.records.map(record => record.slug))]) {
      const response = await fetch(`${base}/entscheidungen/${slug}`);
      assert.equal(response.status, 200);
      const page = await context.newPage();
      await page.setContent(await response.text(), { waitUntil: "domcontentloaded" });
      const sections = await page.locator(".decision-page").evaluate(el => [...el.querySelectorAll("[data-decision-panel],.decision-transparency,.decision-tier-one,.decision-rail,.decision-view-nav")].map(node => ({
        destination: node.getAttribute("data-decision-panel") || node.id || node.className,
        text: node.textContent.replace(/\s+/g, " ").trim(),
      })));
      const paragraphs = [...new Set(baseline.records.filter(record => record.slug === slug).flatMap(record => record.texts))];
      const records = paragraphs.map(text => ({ text, sha256: createHash("sha256").update(text).digest("hex"), destinations: sections.filter(section => section.text.includes(text)).map(section => section.destination) }));
      const missing = records.filter(record => !record.destinations.length);
      results.push({ slug, paragraphs: records.length, missing, records });
      await page.close();
    }
  } finally { await context.close(); }
  const proof = { source_commit: baseline.source_commit, baseline_sha256: baselineSha, old_views: baseline.records.length, results };
  writeFileSync(join(output, "decision-text-preservation.json"), JSON.stringify(proof, null, 2) + "\n");
  const missing = results.flatMap(result => result.missing.map(record => ({ slug: result.slug, ...record })));
  assert.deepEqual(missing, [], "every old rendered paragraph must have an exact new disclosure destination");
  return { cases: results.length, old_views: baseline.records.length, paragraphs: results.reduce((count, result) => count + result.paragraphs, 0), missing: 0, baseline_sha256: baselineSha };
}
