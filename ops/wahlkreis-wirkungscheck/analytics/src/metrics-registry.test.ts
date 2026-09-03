import assert from "node:assert/strict";
import test from "node:test";
import { METRIC_REGISTRY, percentage, surveyCompletionRate } from "./metrics-registry.js";

test("calculates the documented completion rate from the same formula used by exports", () => {
  assert.equal(surveyCompletionRate(100, 80), 80);
});

test("does not render a rate for a zero denominator", () => {
  assert.equal(percentage(0, 0), null);
});

test("keeps every formula versioned and tied to an aggregate source", () => {
  for (const metric of METRIC_REGISTRY) {
    assert.equal(metric.methodVersion, "1.0");
    assert.match(metric.source, /^analytics\./);
    assert.equal(metric.privacyClass, "product_aggregate");
  }
});
