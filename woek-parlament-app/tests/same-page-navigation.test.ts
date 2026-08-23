import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { test } from "node:test";
import { listPublishedCases } from "@/lib/cases";
import { parliamentaryOverviewAssessment } from "@/lib/presentation/overview-assessment";

test("shared same-page navigation contract passes all source gates", () => {
  const output = execFileSync(process.execPath, ["scripts/quality/check-same-page-navigation.mjs"], { encoding: "utf8" });
  for (const gate of [
    "SAME_PAGE_QUERY_NAV_PRESERVES_SCROLL",
    "CROSS_PAGE_NAV_DEFAULT_SCROLL_UNCHANGED",
    "NO_HASH_PLACEHOLDER_SCROLL_TRAPS",
    "NON_SUBMIT_UI_BUTTONS_EXPLICIT_TYPE",
  ]) assert.match(output, new RegExp(`${gate}=PASS`));
});

test("browser regression corpus contains at least three published seven-view decisions", () => {
  const sevenViewCases = listPublishedCases().filter((item) => parliamentaryOverviewAssessment(item));
  assert.ok(sevenViewCases.length >= 3);
  assert.ok(sevenViewCases.some((item) => item.slug === "bt21-dip-907488f49a72"));
});
