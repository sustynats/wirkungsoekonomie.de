import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import {
  assertNoChangedHash,
  berlinDateSlot,
  hasForbiddenImpactFields,
  isExAnteLanguageSafe,
  normalizeOfficialVote,
  validateIndividualVotes,
  validateVoteEvents,
} from "../lib/parliament/daily-ingest-core";
import { formatElectionDate } from "../lib/autopilot/registry";

const registry = JSON.parse(readFileSync("data/political-jurisdictions.json", "utf8"));

test("the shared registry contains Bund, all 16 states and EU", () => {
  assert.equal(registry.jurisdictions.filter((entry: { jurisdiction_type: string }) => entry.jurisdiction_type === "STATE").length, 16);
  assert.equal(registry.jurisdictions.some((entry: { jurisdiction_id: string }) => entry.jurisdiction_id === "DE"), true);
  assert.equal(registry.jurisdictions.some((entry: { jurisdiction_id: string }) => entry.jurisdiction_id === "EU"), true);
});

test("EU Parliament and Commission terms remain separate", () => {
  const eu = registry.jurisdictions.find((entry: { jurisdiction_id: string }) => entry.jurisdiction_id === "EU");
  assert.equal(eu.institutional_terms.european_parliament_term_start, "2024-07-16");
  assert.equal(eu.institutional_terms.european_commission_term_start, "2024-12-01");
  assert.notEqual(eu.institutional_terms.european_parliament_term_id, eu.institutional_terms.european_commission_term_id);
});

test("exact and season-only election dates remain renderable", () => {
  assert.equal(formatElectionDate("2026-09-20"), "20. September 2026");
  assert.equal(formatElectionDate("2027-AUTUMN"), "Herbst 2027");
  assert.equal(formatElectionDate("not-a-date"), null);
});

test("Berlin scheduling executes only the intended local slots", () => {
  assert.equal(berlinDateSlot(new Date("2026-01-20T05:00:00Z")).slot, "AM");
  assert.equal(berlinDateSlot(new Date("2026-07-20T04:00:00Z")).slot, "AM");
  assert.equal(berlinDateSlot(new Date("2026-07-20T14:00:00Z")).slot, "PM");
  assert.equal(berlinDateSlot(new Date("2026-07-20T13:00:00Z")).slot, null);
});

test("official individual votes are preserved and never inferred from factions", () => {
  assert.equal(normalizeOfficialVote("YES"), "JA");
  assert.equal(normalizeOfficialVote("NO"), "NEIN");
  assert.equal(normalizeOfficialVote("ABSTENTION"), "ENTHALTUNG");
  const source = readFileSync("lib/parliament/daily-ingest.ts", "utf8");
  assert.doesNotMatch(source, /fraktion.*actual_vote|actual_vote.*fraktion/i);
});

test("vote schemas reject missing official sources", () => {
  assert.equal(validateVoteEvents([{ vote_event_id: "v1", parliamentary_case_id: "c1", date: "2026-08-18", question_official: "Frage", vote_type: "NAMENTLICHE_ABSTIMMUNG", result: { yes: 1, no: 0, abstain: 0, other: 0 }, source_refs: [] }]).length, 1);
  assert.equal(validateIndividualVotes([{ vote_event_id: "v1", mp_id: "m1", vote: "JA", source_ref: "" }]).length, 1);
});

test("changed handoff content and score fields fail closed", () => {
  assert.throws(() => assertNoChangedHash("review.json", "b", [{ filename: "review.json", hash: "a" }]), /CONTENT_CHANGED_AFTER_HANDOFF/);
  assert.equal(hasForbiddenImpactFields({ nested: { party_score: 3 } }), true);
  assert.equal(hasForbiddenImpactFields({ vote: "JA" }), false);
});

test("ex-ante language does not claim an observed effect", () => {
  assert.equal(isExAnteLanguageSafe("Die Maßnahme kann den Zugang verbessern."), true);
  assert.equal(isExAnteLanguageSafe("Die Maßnahme hat den Zugang verbessert."), false);
});

test("political architecture contracts validate the registered election cycles", () => {
  const schema = JSON.parse(readFileSync("data/autopilot/contracts/election-cycle.schema.json", "utf8"));
  const cycles = JSON.parse(readFileSync("data/autopilot/election-cycles.json", "utf8"));
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  for (const cycle of cycles.cycles) assert.equal(validate(cycle), true, JSON.stringify(validate.errors));
});

test("autopilot status is protected and public impact routes are not", () => {
  const proxy = readFileSync("proxy.ts", "utf8");
  assert.match(proxy, /AUTOPILOT_STATUS_USER/);
  assert.match(proxy, /AUTOPILOT_STATUS_PASSWORD/);
  const nav = readFileSync("app\/components\/PortalNav.tsx", "utf8");
  assert.match(nav, /Wirkungsfälle/);
  assert.match(nav, /Europäische Union/);
});

test("each primary navigation surface exposes every destination exactly once", () => {
  const nav = readFileSync("app/components/PortalNav.tsx", "utf8");
  const destinations = [...nav.matchAll(/\["[^"]+",\s*"([^"]+)"\]/g)].map((match) => match[1]);
  assert.equal(destinations.filter((href) => href === "/laender").length, 1);
  assert.equal(new Set(destinations).size, destinations.length);
});
