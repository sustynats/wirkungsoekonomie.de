import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import {
  rheinlandPfalzCoalitionAssessment,
  rheinlandPfalzCoalitionAtomicCommitments,
  rheinlandPfalzCoalitionChapters,
  rheinlandPfalzCoalitionCommitmentRegister,
  rheinlandPfalzCoalitionCommitments,
  rheinlandPfalzCoalitionExistingImpactCases,
  rheinlandPfalzCoalitionQualityLayers,
  rheinlandPfalzCoalitionRelationshipModel,
  rheinlandPfalzCoalitionSources,
} from "../lib/states/rheinland-pfalz-coalition";

test("Rheinland-Pfalz keeps all nine approved chapter reviews without an overall score", () => {
  assert.equal(rheinlandPfalzCoalitionChapters.length, 9);
  assert.deepEqual(rheinlandPfalzCoalitionChapters.map((chapter) => chapter.chapter), Array.from({ length: 9 }, (_, index) => index + 1));
  assert.ok(rheinlandPfalzCoalitionChapters.every((chapter) => chapter.maturity === "HIGH_MATERIALITY_REVIEW"));
  assert.equal(rheinlandPfalzCoalitionAssessment.directionKind, "portfolio");
  assert.match(rheinlandPfalzCoalitionAssessment.directionLabel, /Keine belastbare einheitliche Wirkungsrichtung/);
});

test("Rheinland-Pfalz imports all 1254 explicit source-bound records without reconstructing content", () => {
  assert.equal(rheinlandPfalzCoalitionCommitmentRegister.declared_source_record_count, 1254);
  assert.equal(rheinlandPfalzCoalitionCommitmentRegister.source_record_count, 1254);
  assert.equal(rheinlandPfalzCoalitionCommitments.length, 1254);
  assert.equal(rheinlandPfalzCoalitionAtomicCommitments.length, 1254);
  assert.equal(rheinlandPfalzCoalitionCommitmentRegister.handoff_record_gap_count, 0);
  assert.deepEqual(rheinlandPfalzCoalitionCommitmentRegister.missing_declared_record_ids, []);
  assert.equal(new Set(rheinlandPfalzCoalitionCommitments.map((record) => record.commitment_id)).size, 1254);
});

test("all nine chapters match the explicit Fach handoffs", () => {
  assert.deepEqual(rheinlandPfalzCoalitionCommitmentRegister.chapter_counts.map((entry) => entry.atomic_commitments), [151, 151, 263, 135, 246, 88, 86, 103, 31]);
  assert.match(rheinlandPfalzCoalitionChapters[2].maturityLabel, /263 Source-Commitments/);
  assert.match(rheinlandPfalzCoalitionChapters[3].maturityLabel, /135 Source-Commitments/);
  assert.match(rheinlandPfalzCoalitionChapters[4].maturityLabel, /246 Source-Commitments/);
  assert.match(rheinlandPfalzCoalitionChapters[5].maturityLabel, /88 Source-Commitments/);
  assert.match(rheinlandPfalzCoalitionChapters[6].maturityLabel, /86 Source-Commitments/);
  assert.match(rheinlandPfalzCoalitionChapters[7].maturityLabel, /103 Source-Commitments/);
  assert.match(rheinlandPfalzCoalitionChapters[8].maturityLabel, /31 Source-Commitments/);
  assert.ok(rheinlandPfalzCoalitionCommitments.some((record) => record.commitment_id === "RLP-KV26-C08-103"));
  assert.ok(rheinlandPfalzCoalitionCommitments.some((record) => record.commitment_id === "RLP-KV26-C09-031"));
  assert.ok(!rheinlandPfalzCoalitionCommitments.some((record) => record.commitment_id === "RLP-KV26-C02-152"));
});

test("Rheinland-Pfalz preserves provenance, all five existing cases and lifecycle separation", () => {
  assert.equal(rheinlandPfalzCoalitionSources.length, 11);
  assert.ok(rheinlandPfalzCoalitionSources.every((source) => source.url.startsWith("https://")));
  assert.equal(rheinlandPfalzCoalitionSources[0].documentDate, null);
  assert.match(rheinlandPfalzCoalitionSources[0].abstract, /kryptographisch nachgewiesene Byte-Identität mit einer signierten Endfassung liegt nicht vor/);
  assert.equal(rheinlandPfalzCoalitionSources[0].url, "https://www.spd-rlp.de/wp-content/uploads/sites/1649/2026/04/KoaV_2026-2031.pdf");
  assert.deepEqual(rheinlandPfalzCoalitionExistingImpactCases.map((record) => record.id), [
    "RP-IMPACT-2026-01", "RP-IMPACT-2026-02", "RP-IMPACT-2026-03", "RP-IMPACT-2026-04", "RP-IMPACT-2026-05-HITZESCHUTZ",
  ]);
  assert.match(rheinlandPfalzCoalitionRelationshipModel.parentChild, /getrennte Lebenslaufobjekte/);
  assert.match(rheinlandPfalzCoalitionRelationshipModel.competence, /keine Umsetzung/);
});

test("Rheinland-Pfalz publishes the additional quality layers without a technical recommendation", () => {
  assert.equal(rheinlandPfalzCoalitionQualityLayers.length, 8);
  const publicCopy = JSON.stringify({
    assessment: rheinlandPfalzCoalitionAssessment,
    chapters: rheinlandPfalzCoalitionChapters,
    layers: rheinlandPfalzCoalitionQualityLayers,
  });
  assert.match(publicCopy, /keine fachlich freigegebene WÖk-Handlungsoption/i);
  assert.doesNotMatch(publicCopy, /Parteigesamtnote|Durchschnittsscore|Wahlempfehlung/);
});

test("Rheinland-Pfalz route uses its reviewed component and source intermediary", () => {
  const route = readFileSync(resolve(process.cwd(), "app/laender/[slug]/mandat-und-praxis/page.tsx"), "utf8");
  const component = readFileSync(resolve(process.cwd(), "app/components/states/RheinlandPfalzCoalitionReview.tsx"), "utf8");
  assert.match(route, /RheinlandPfalzCoalitionReview/);
  assert.match(route, /slug === "rheinland-pfalz"/);
  assert.match(component, /sourceDetailHrefForUrl/);
  assert.doesNotMatch(component, /href=\{source\.url\}/);
  assert.match(component, /Umsetzung ist nicht Wirkung/);
  assert.match(component, /StateCoalitionCommitmentInventory/);
  const approvedReview = readFileSync(resolve(process.cwd(), "data/states/rheinland-pfalz/approved-review-hitzeschutz-2026-08-20.md"), "utf8");
  assert.match(approvedReview, /nicht 2026 neu geschaffen/);
  assert.match(approvedReview, /klares positives Gesundheits- und Resilienzpotenzial/);
  assert.match(approvedReview, /kein freigegebener RecommendationRecord/);
});
