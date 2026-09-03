import assert from "node:assert/strict";
import test from "node:test";
import { EVENT_CATALOG, EVENT_NAMES, isValidAnalyticsNonce, validateAnalyticsEvent } from "./event-registry.js";

const baseEvent = {
  eventName: "QUESTION_COMPLETED",
  schemaVersion: "1.0",
  timestamp: new Date().toISOString(),
  stepIndex: 2,
  questionType: "scale",
  durationBucket: "10_30s",
  clientEventId: "d21ab2e5-75c4-4a10-8c01-0535d0f281ca"
};

test("allows a registered product event without an answer", () => {
  assert.deepEqual(validateAnalyticsEvent(baseEvent), { ok: true, event: baseEvent });
});

test("product analytics event cannot contain answerId", () => {
  assert.equal(validateAnalyticsEvent({ ...baseEvent, answerId: "answer-42" }).ok, false);
});

test("product analytics event cannot contain answerValue", () => {
  assert.equal(validateAnalyticsEvent({ ...baseEvent, answerValue: "4" }).ok, false);
});

test("product analytics event cannot contain a selected topic", () => {
  assert.deepEqual(validateAnalyticsEvent({ ...baseEvent, selectedTopic: "mobilitaet" }), { ok: false, reason: "sensitive_data" });
});

test("sensitive values are discarded without retaining the value", () => {
  const result = validateAnalyticsEvent({ ...baseEvent, pageKey: "name@example.org" });
  assert.deepEqual(result, { ok: false, reason: "sensitive_data" });
});

test("sensitive keys are blocked before schema validation", () => {
  for (const key of ["fullName", "party", "fraktion", "invitationToken", "surveyResponseId", "exactConstituency", "recommendationId", "rawUserAgent", "clientIp"]) {
    assert.deepEqual(validateAnalyticsEvent({ ...baseEvent, [key]: "synthetic-value" }), { ok: false, reason: "sensitive_data" });
  }
});

test("every registered event has a privacy class, retention and schema version", () => {
  for (const eventName of EVENT_NAMES) {
    const definition = EVENT_CATALOG[eventName];
    assert.equal(definition.privacyClass, "product_pseudonym_free");
    assert.equal(definition.rawTtlHours, 72);
    assert.equal(definition.schemaVersion, "1.0");
    assert.notEqual(definition.description, "");
  }
});

test("only a random base64url analytics nonce is accepted", () => {
  assert.equal(isValidAnalyticsNonce("A".repeat(43)), true);
  assert.equal(isValidAnalyticsNonce("survey-token"), false);
});
