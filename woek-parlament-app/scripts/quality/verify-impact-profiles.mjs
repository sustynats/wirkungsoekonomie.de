import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const dataRoot = resolve(root, "data/wirkungsprofile");
const read = (name) => JSON.parse(readFileSync(resolve(dataRoot, name), "utf8"));
const members = read("member-impact-profiles.json");
const factions = read("faction-impact-profiles.json");
const decisions = read("decision-impact-profiles.json");
const quality = read("quality-report.json");
const manifest = read("manifest.json");
const allowedDirections = new Set(["POSITIVE_POTENTIAL", "NEGATIVE_RISK", "NEUTRAL", "AMBIVALENT", "OPEN", "NOT_APPLICABLE"]);

function fail(message) {
  throw new Error(`Wirkungsprofile release gate: ${message}`);
}

if (members.length !== 630) fail(`expected 630 member profiles, found ${members.length}`);
if (factions.length !== 5) fail(`expected 5 faction profiles, found ${factions.length}`);
if (decisions.length !== 28) fail(`expected 28 decision profiles, found ${decisions.length}`);
if (decisions.filter((profile) => profile.decision.confirmation_status === "DECISION_CONFIRMED").length !== 12) fail("expected 12 confirmed decisions");
if (factions.reduce((sum, profile) => sum + profile.decisions.length, 0) !== 60) fail("expected 60 faction-decision relations");

const votes = members.flatMap((profile) => profile.decisions.map((decision) => decision.official_vote));
const count = (value) => votes.filter((vote) => vote === value).length;
if (count("YES") !== 444 || count("NO") !== 133 || count("ABSTENTION") !== 0 || count("DID_NOT_VOTE") !== 53) fail("official individual vote totals do not match the source");

for (const profile of members) {
  if (profile.no_person_score !== true || profile.no_ranking !== true || profile.no_faction_vote_inference !== true) fail(`personal safeguards missing for ${profile.member.profile_source_key}`);
  if (profile.decisions.some((decision) => !["YES", "NO", "ABSTENTION", "DID_NOT_VOTE"].includes(decision.official_vote))) fail(`invalid official vote for ${profile.member.profile_source_key}`);
}
for (const profile of factions) {
  if (profile.no_faction_score !== true || profile.no_ranking !== true || profile.no_individual_vote_inference !== true) fail(`faction safeguards missing for ${profile.faction.name}`);
  if (profile.decisions.length !== 12) fail(`expected 12 decisions for ${profile.faction.name}`);
}
for (const profile of decisions) {
  for (const path of profile.corrected_impact_paths) if (!allowedDirections.has(path.direction)) fail(`invalid direction ${path.direction} in ${profile.case_id}`);
}
for (const output of manifest.outputs) {
  const bytes = readFileSync(resolve(dataRoot, output.file));
  const hash = createHash("sha256").update(bytes).digest("hex");
  if (bytes.length !== output.bytes || hash !== output.sha256) fail(`integrity mismatch in ${output.file}`);
}
if (!quality.all_tests_pass) fail("source package quality report is not green");

console.log(`Wirkungsprofile verified: ${members.length} members, ${factions.length} factions, ${decisions.length} decisions.`);
