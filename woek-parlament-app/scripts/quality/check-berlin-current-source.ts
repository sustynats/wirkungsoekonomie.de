import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import currentSourceRegister from "../../data/state-programmes/current-source-registers/berlin-2026.json";
import { statePublicContent } from "../../lib/states/public-content";

const root = process.cwd();
const reviewPath = resolve(root, "data/states/berlin/approved-review-2026-08-18.md");
const reviewBytes = readFileSync(reviewPath);
assert.equal(statSync(reviewPath).size, 12016, "Berlin: preserved six-theme Fachreview byte length drifted");
assert.equal(createHash("sha256").update(reviewBytes).digest("hex"), "6a7c7eb890b57f7b2d5b3ce0d461468d79febb7397e2930a28217f42374ed9f2", "Berlin: preserved six-theme Fachreview hash drifted");

assert.equal(currentSourceRegister.status, "CURRENT_SOURCE_CLASSIFICATION_COMPLETE_17_OF_17");
assert.equal(currentSourceRegister.official_field.admitted_party_count, 17);
assert.equal(currentSourceRegister.official_field.landesliste_count, 12);
assert.equal(currentSourceRegister.official_field.berlinwide_bezirkslisten_count, 3);
assert.equal(currentSourceRegister.official_field.selected_district_bezirkslisten_count, 2);
assert.equal(currentSourceRegister.coverage.classified_party_count, 17);
assert.equal(currentSourceRegister.coverage.final_election_programme_verified_count, 9);
assert.equal(currentSourceRegister.coverage.election_source_available_canonicalization_pending_count, 3);
assert.equal(currentSourceRegister.coverage.final_election_programme_not_verified_count, 5);
assert.equal(currentSourceRegister.coverage.source_available_for_election_corpus_count, 12);
assert.equal(currentSourceRegister.coverage.full_final_election_programme_corpus_available, false);
assert.equal(currentSourceRegister.preserved_fach_review.materiality_theme_count, 6);

const parties = currentSourceRegister.parties;
assert.equal(parties.length, 17);
assert.equal(new Set(parties.map((party) => party.party)).size, 17, "Berlin: party names must be unique");
assert.deepEqual(parties.filter((party) => party.final_election_programme_verified).map((party) => party.party).sort(), [
  "BSW", "BÜNDNIS 90/DIE GRÜNEN", "CDU", "Die Linke", "Die PARTEI", "FDP", "SPD", "Tierschutzpartei", "Volt",
].sort());
assert.deepEqual(parties.filter((party) => party.canonicalization_pending).map((party) => party.party).sort(), ["AfD", "DKP", "SGP"]);
assert.deepEqual(parties.filter((party) => !party.source_available_for_election_corpus).map((party) => party.party).sort(), [
  "B* (bergpartei, die überpartei)", "Die Urbane.", "HEIMAT", "PdF", "ÖDP",
].sort());
for (const party of parties) {
  assert.ok(party.public_status_label.trim() && party.public_status_detail.trim(), `${party.party}: public source classification is incomplete`);
  assert.ok(party.source_urls.length > 0, `${party.party}: no source URL recorded`);
  for (const source of party.source_urls) assert.match(source.url, /^https:\/\//, `${party.party}: source URL must use HTTPS`);
  assert.equal(party.assessment_maturity, "SOURCE_CLASSIFICATION_ONLY_EXISTING_FACH_REVIEW_PRESERVED");
}

assert.deepEqual(currentSourceRegister.source_pins.map((pin) => pin.comment_id), [5367584560, 5374672840]);
assert.deepEqual(currentSourceRegister.publication_integrity.required_content_paths, ["/laender/berlin", "/laender/berlin/wahl"]);
assert.deepEqual(currentSourceRegister.publication_integrity.rendered_content_paths, currentSourceRegister.publication_integrity.required_content_paths);
assert.deepEqual(currentSourceRegister.publication_integrity.unrendered_content_paths, []);
assert.ok(Object.values(currentSourceRegister.constraints).every((value) => value === false), "Berlin: source register records forbidden synthesis/deployment");
for (const forbiddenKey of ["impact_direction", "dns_reference", "recommendation", "party_score"]) {
  assert.ok(!JSON.stringify(currentSourceRegister).includes(`\"${forbiddenKey}\"`), `Berlin: source-only register contains forbidden field ${forbiddenKey}`);
}

const electionPage = readFileSync(resolve(root, "app/laender/[slug]/wahl/page.tsx"), "utf8");
const sourceComponent = readFileSync(resolve(root, "app/components/StateProgrammeSourceRegister.tsx"), "utf8");
assert.match(electionPage, /StateProgrammeSourceRegister/, "Berlin: current-source register is not wired to the public election route");
for (const token of [
  "Alle {register.official_field.admitted_party_count} zugelassenen Parteien",
  "Quellenvollständigkeit bedeutet hier",
  "Keine Wirkung aus dem Quellenstatus ableiten",
  "Technischer Source-Status",
]) assert.ok(sourceComponent.includes(token), `Berlin: public source register is missing ${token}`);
assert.equal(statePublicContent.berlin.programmeSources?.descriptor_sha256, currentSourceRegister.descriptor_sha256, "Berlin: public registry does not use the canonical current-source descriptor");
assert.match(statePublicContent.berlin.electionField?.officialFieldDetail ?? "", /Alle 17 zugelassenen Parteien sind im aktuellen Quellenstand klassifiziert/);

console.log(JSON.stringify({
  status: "PASS",
  jurisdiction: "berlin",
  officialPartyField: 17,
  currentSourceClassifications: 17,
  verifiedFinalProgrammes: 9,
  canonicalizationPending: 3,
  finalProgrammeNotVerified: 5,
  fullFinalProgrammeCorpusAvailable: false,
  preservedMaterialityThemes: 6,
  unrenderedContentPaths: 0,
  descriptorSha256: currentSourceRegister.descriptor_sha256,
}));
