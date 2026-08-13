import assert from "node:assert/strict";
import test from "node:test";
import { applyDisclosureControl, DISCLOSURE_CONTROL_VERSION } from "./disclosure-control.js";

test("applies primary suppression below the minimum cohort size", () => {
  const result = applyDisclosureControl(
    [{ id: "party-breakdown", totalCount: 25, cells: [{ id: "a", count: 6 }, { id: "b", count: 19 }] }],
    10
  )[0]!;
  assert.equal(result.totalCount, 25);
  assert.deepEqual(result.cells[0], { id: "a", count: null, suppressed: true, suppressionReason: "primary" });
});

test("adds secondary suppression when one hidden cell could be reconstructed", () => {
  const result = applyDisclosureControl(
    [{ id: "party-breakdown", totalCount: 35, cells: [{ id: "a", count: 6 }, { id: "b", count: 12 }, { id: "c", count: 17 }] }],
    10
  )[0]!;
  assert.deepEqual(result.cells, [
    { id: "a", count: null, suppressed: true, suppressionReason: "primary" },
    { id: "b", count: null, suppressed: true, suppressionReason: "secondary" },
    { id: "c", count: 17, suppressed: false }
  ]);
});

test("does not hide another cell when two primary-suppressed cells prevent subtraction", () => {
  const result = applyDisclosureControl(
    [{ id: "party-breakdown", totalCount: 37, cells: [{ id: "a", count: 6 }, { id: "b", count: 7 }, { id: "c", count: 24 }] }],
    10
  )[0]!;
  assert.equal(result.cells.filter((cell) => cell.suppressionReason === "secondary").length, 0);
  assert.equal(result.cells[2]!.count, 24);
});

test("rejects non-reconciling aggregate input", () => {
  assert.throws(
    () => applyDisclosureControl([{ id: "bad", totalCount: 11, cells: [{ id: "a", count: 10 }] }], 10),
    /do not add up/
  );
});

test("publishes the disclosure-control implementation version", () => {
  assert.equal(DISCLOSURE_CONTROL_VERSION, "1.0");
});
