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

test("Rheinland-Pfalz imports only the 302 explicit source-bound records and exposes the nine-record transfer gap", () => {
  assert.equal(rheinlandPfalzCoalitionCommitmentRegister.declared_source_record_count, 311);
  assert.equal(rheinlandPfalzCoalitionCommitmentRegister.source_record_count, 302);
  assert.equal(rheinlandPfalzCoalitionCommitments.length, 302);
  assert.equal(rheinlandPfalzCoalitionAtomicCommitments.length, 302);
  assert.equal(rheinlandPfalzCoalitionCommitmentRegister.handoff_record_gap_count, 9);
  assert.deepEqual(rheinlandPfalzCoalitionCommitmentRegister.missing_declared_record_ids, [
    "RLP-KV26-C02-152", "RLP-KV26-C02-153", "RLP-KV26-C02-154",
    "RLP-KV26-C02-155", "RLP-KV26-C02-156", "RLP-KV26-C02-157",
    "RLP-KV26-C02-158", "RLP-KV26-C02-159", "RLP-KV26-C02-160",
  ]);
  assert.equal(rheinlandPfalzCoalitionCommitments.some((record) => rheinlandPfalzCoalitionCommitmentRegister.missing_declared_record_ids.includes(record.commitment_id)), false);
});

test("reviewed chapters three to nine remain mature while their atomic source layer fails closed", () => {
  assert.ok(rheinlandPfalzCoalitionCommitmentRegister.chapter_counts.filter((entry) => entry.chapter >= 3).every((entry) => entry.atomic_commitments === 0));
  assert.ok(rheinlandPfalzCoalitionChapters.filter((chapter) => chapter.chapter >= 3).every((chapter) => /Review veröffentlicht/.test(chapter.maturityLabel)));
});

test("Rheinland-Pfalz preserves provenance, the four existing cases and lifecycle separation", () => {
  assert.equal(rheinlandPfalzCoalitionSources.length, 10);
  assert.ok(rheinlandPfalzCoalitionSources.every((source) => source.url.startsWith("https://")));
  assert.equal(rheinlandPfalzCoalitionSources[0].documentDate, null);
  assert.match(rheinlandPfalzCoalitionSources[0].abstract, /byte-identische signierte Endfassung ist nicht nachgewiesen/);
  assert.deepEqual(rheinlandPfalzCoalitionExistingImpactCases.map((record) => record.id), [
    "RP-IMPACT-2026-01", "RP-IMPACT-2026-02", "RP-IMPACT-2026-03", "RP-IMPACT-2026-04",
  ]);
  assert.match(rheinlandPfalzCoalitionRelationshipModel.parentChild, /getrennte Lifecycle-Objekte/);
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
});
