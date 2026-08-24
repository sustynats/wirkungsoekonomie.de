import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import currentSourceRegister from "../../data/state-programmes/current-source-registers/mecklenburg-vorpommern-2026-v2.json";
import { statePublicContent } from "../../lib/states/public-content";

const root = process.cwd();
const reviewPath = resolve(root, "data/states/mecklenburg-vorpommern/approved-review-2026-08-18.md");
const reviewBytes = readFileSync(reviewPath);
assert.equal(statSync(reviewPath).size, 11801, "MV: preserved eight-theme Fachreview byte length drifted");
assert.equal(createHash("sha256").update(reviewBytes).digest("hex"), "0fe5316048c5e9fef01dbdc0ccd8326e3c644bdee6ef43997ec12a60c1fd7639", "MV: preserved eight-theme Fachreview hash drifted");

assert.equal(currentSourceRegister.status, "CURRENT_SOURCE_CLASSIFICATION_COMPLETE_19_OF_19");
assert.equal(currentSourceRegister.official_field.admitted_party_count, 19);
assert.equal(currentSourceRegister.official_field.landesliste_count, 19);
assert.equal(currentSourceRegister.official_field.constitutional_court_closure_date, "2026-08-14");
assert.equal(currentSourceRegister.coverage.classified_party_count, 19);
assert.equal(currentSourceRegister.coverage.final_election_programme_verified_count, 12);
assert.equal(currentSourceRegister.coverage.election_source_available_canonicalization_pending_count, 0);
assert.equal(currentSourceRegister.coverage.final_election_programme_not_verified_count, 7);
assert.equal(currentSourceRegister.coverage.source_unavailable_for_election_corpus_count, 6);
assert.equal(currentSourceRegister.coverage.source_available_for_election_corpus_count, 13);
assert.equal(currentSourceRegister.coverage.canonical_artifact_count, 3);
assert.equal(currentSourceRegister.coverage.canonical_final_programme_artifact_count, 2);
assert.equal(currentSourceRegister.coverage.canonical_current_source_finality_open_count, 1);
assert.equal(currentSourceRegister.coverage.full_final_election_programme_corpus_available, false);
assert.equal(currentSourceRegister.preserved_fach_review.materiality_theme_count, 8);

const parties = currentSourceRegister.parties;
assert.equal(parties.length, 19);
assert.equal(new Set(parties.map((party) => party.party)).size, 19, "MV: party names must be unique");
assert.ok(parties.every((party) => party.field_scope === "LANDESLISTE"), "MV: official field must contain only Landeslisten");
assert.deepEqual(parties.filter((party) => party.final_election_programme_verified).map((party) => party.party).sort(), [
  "AfD", "BSW", "BÜNDNIS 90/DIE GRÜNEN", "Bündnis C", "CDU", "Die Linke", "FDP", "FREIE WÄHLER", "PIRATEN", "PdF", "SPD", "Volt",
].sort());
assert.deepEqual(parties.filter((party) => party.canonicalization_pending).map((party) => party.party).sort(), []);
assert.deepEqual(parties.filter((party) => !party.source_available_for_election_corpus).map((party) => party.party).sort(), [
  "Handwerker Partei Deutschland", "KPD", "Team Freiheit", "Tierschutzpartei", "WIR LEBEN DEMOKRATIE", "ÖDP",
].sort());
for (const party of parties) {
  assert.ok(party.public_status_label.trim() && party.public_status_detail.trim(), `${party.party}: public source classification is incomplete`);
  assert.ok(party.source_urls.length > 0, `${party.party}: no source URL recorded`);
  for (const source of party.source_urls) assert.match(source.url, /^https:\/\//, `${party.party}: source URL must use HTTPS`);
  assert.equal(party.assessment_maturity, "SOURCE_CLASSIFICATION_ONLY_EXISTING_FACH_REVIEW_PRESERVED");
}
assert.deepEqual(parties.filter((party) => party.canonical_artifact).map((party) => party.party), ["FREIE WÄHLER", "Die PARTEI", "Volt"]);
for (const party of parties.filter((party) => party.canonical_artifact)) {
  assert.match(party.canonical_artifact!.sha256, /^[a-f0-9]{64}$/);
  assert.ok(party.canonical_artifact!.byte_length > 0);
  assert.equal(party.canonical_artifact!.identity_status, "BYTE_EXACT_PARTY_PRIMARY_ARTIFACT");
}
const diePartei = parties.find((party) => party.party === "Die PARTEI");
assert.equal(diePartei?.final_election_programme_verified, false, "MV: current Die PARTEI route must not be presented as a verified final programme");
assert.match(diePartei?.source_status ?? "", /FINALITY_NOT_VERIFIED/);

assert.deepEqual(currentSourceRegister.source_pins.map((pin) => pin.comment_id), [5367625510, 5374701790]);
assert.deepEqual(currentSourceRegister.publication_integrity.required_content_paths, ["/laender/mecklenburg-vorpommern", "/laender/mecklenburg-vorpommern/wahl"]);
assert.deepEqual(currentSourceRegister.publication_integrity.rendered_content_paths, currentSourceRegister.publication_integrity.required_content_paths);
assert.deepEqual(currentSourceRegister.publication_integrity.unrendered_content_paths, []);
assert.ok(Object.values(currentSourceRegister.constraints).every((value) => value === false), "MV: source register records forbidden synthesis/deployment");
for (const forbiddenKey of ["impact_direction", "dns_reference", "recommendation", "party_score"]) {
  assert.ok(!JSON.stringify(currentSourceRegister).includes(`\"${forbiddenKey}\"`), `MV: source-only register contains forbidden field ${forbiddenKey}`);
}

const electionPage = readFileSync(resolve(root, "app/laender/[slug]/wahl/page.tsx"), "utf8");
const sourceComponent = readFileSync(resolve(root, "app/components/StateProgrammeSourceRegister.tsx"), "utf8");
assert.match(electionPage, /StateProgrammeSourceRegister/, "MV: current-source register is not wired to the public election route");
for (const token of [
  "Alle {register.official_field.admitted_party_count} zugelassenen Parteien",
  "Quellenvollständigkeit bedeutet hier",
  "Keine Wirkung aus dem Quellenstatus ableiten",
  "Technischer Source-Status",
]) assert.ok(sourceComponent.includes(token), `MV: public source register is missing ${token}`);
const publicContent = statePublicContent["mecklenburg-vorpommern"];
assert.equal(publicContent.programmeSources?.descriptor_sha256, currentSourceRegister.descriptor_sha256, "MV: public registry does not use the canonical current-source descriptor");
assert.match(publicContent.electionField?.officialFieldDetail ?? "", /Alle 19 zugelassenen Landeslisten sind im aktuellen Quellenstand klassifiziert/);

console.log(JSON.stringify({
  status: "PASS",
  jurisdiction: "mecklenburg-vorpommern",
  officialPartyField: 19,
  currentSourceClassifications: 19,
  verifiedFinalProgrammes: 12,
  canonicalizationPending: 0,
  canonicalArtifactsCompletedInV2: 3,
  currentSourceFinalityOpen: 1,
  finalProgrammeNotVerified: 7,
  sourceUnavailableForElectionCorpus: 6,
  fullFinalProgrammeCorpusAvailable: false,
  preservedMaterialityThemes: 8,
  unrenderedContentPaths: 0,
  descriptorSha256: currentSourceRegister.descriptor_sha256,
}));
