import assert from "node:assert/strict";
import test from "node:test";
import { assessEnvironmentPresence } from "../../scripts/ops/check-hosting-env-parity.mjs";

test("a redacted Vercel export is not a usable migration configuration", () => {
  for (const value of ["[REDACTED]", "[ENCRYPTED]", "[SENSITIVE]", "***********", "<SECRET>", "replace_me"]) {
    const result = assessEnvironmentPresence(["TEST_KEY"], { TEST_KEY: value });
    assert.equal(result.status, "BLOCKED");
    assert.deepEqual(result.placeholders, ["TEST_KEY"]);
    assert.equal(result.cutoverApproved, false);
  }
});
test("missing and blank variables block a migration", () => {
  for (const environment of [undefined, {}, { TEST_KEY: " " }]) {
    assert.deepEqual(assessEnvironmentPresence(["TEST_KEY"], environment).missing, ["TEST_KEY"]);
  }
});
test("presence does not assert validity and never returns a secret value", () => {
  const result = assessEnvironmentPresence(["TEST_KEY"], { TEST_KEY: "test-value-do-not-disclose" });
  assert.equal(result.status, "PRESENT_NOT_YET_VALIDATED");
  assert.equal(result.credentialValidityVerified, false);
  assert.equal(result.cutoverApproved, false);
  assert.ok(!JSON.stringify(result).includes("test-value-do-not-disclose"));
});
test("missing or malformed inventory cannot turn a check green", () => {
  for (const keys of [undefined, [], {}, [""], ["invalid key"], [1]]) {
    assert.throws(() => assessEnvironmentPresence(keys, {}));
  }
});
