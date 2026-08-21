import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import {
  badenWuerttembergCoalitionAssessment,
  badenWuerttembergCoalitionAtomicCommitments,
  badenWuerttembergCoalitionChapters,
  badenWuerttembergCoalitionCommitmentRegister,
  badenWuerttembergCoalitionCommitments,
  badenWuerttembergCoalitionExistingImpactCases,
  badenWuerttembergCoalitionGovernanceReview,
  badenWuerttembergCoalitionQualityLayers,
  badenWuerttembergCoalitionRelationshipModel,
  badenWuerttembergCoalitionSources,
} from "../lib/states/baden-wuerttemberg-coalition";

test("Baden-Württemberg coalition review keeps all 15 chapters with transparent maturity", () => {
  assert.equal(badenWuerttembergCoalitionChapters.length, 15);
  assert.deepEqual(badenWuerttembergCoalitionChapters.map((chapter) => chapter.chapter), Array.from({ length: 15 }, (_, index) => index + 1));
  assert.deepEqual(
    badenWuerttembergCoalitionChapters.filter((chapter) => chapter.maturity === "DEEP_REVIEW").map((chapter) => chapter.chapter),
    [1, 2, 3],
  );
  assert.equal(badenWuerttembergCoalitionChapters.filter((chapter) => chapter.maturity === "HIGH_MATERIALITY_REVIEW").length, 12);
  assert.match(badenWuerttembergCoalitionAssessment.directionLabel, /Keine belastbare einheitliche Wirkungsrichtung/);
  assert.equal(badenWuerttembergCoalitionAssessment.directionKind, "portfolio");
});

test("coalition review preserves source provenance and existing child-case identity", () => {
  assert.equal(badenWuerttembergCoalitionSources.length, 3);
  assert.ok(badenWuerttembergCoalitionSources.every((source) => source.url.startsWith("https://")));
  assert.ok(badenWuerttembergCoalitionSources.some((source) => /260506_Koalitionsvertrag/.test(source.url)));
  assert.ok(badenWuerttembergCoalitionSources.some((source) => /Hochschulfinanzierungsvereinbarung 2026–2030/.test(source.title)));
  assert.deepEqual(badenWuerttembergCoalitionExistingImpactCases.map((record) => record.id), [
    "BW-IMPACT-2026-01", "BW-IMPACT-2026-02", "BW-IMPACT-2026-03", "BW-IMPACT-2026-04", "BW-IMPACT-2026-05",
  ]);
});

test("coalition review projects the complete source-bound atomic inventory without double counting containers", () => {
  assert.equal(badenWuerttembergCoalitionCommitmentRegister.source_record_count, 1583);
  assert.equal(badenWuerttembergCoalitionCommitments.length, 1583);
  assert.equal(badenWuerttembergCoalitionCommitmentRegister.atomic_commitment_count, 1577);
  assert.equal(badenWuerttembergCoalitionAtomicCommitments.length, 1577);
  assert.equal(badenWuerttembergCoalitionCommitmentRegister.explicit_deep_split_flags_remaining, 0);
  assert.equal(badenWuerttembergCoalitionCommitmentRegister.non_counting_parent_containers.length, 6);
  assert.equal(badenWuerttembergCoalitionCommitments.filter((record) => !record.atomic_count).length, 6);
  assert.deepEqual(
    badenWuerttembergCoalitionCommitmentRegister.chapter_counts.map((entry) => entry.atomic_commitments),
    [60, 75, 60, 60, 50, 99, 102, 212, 113, 173, 261, 97, 117, 87, 11],
  );
});

test("coalition relationship model fails closed on identity, competence, funding and impact", () => {
  assert.match(badenWuerttembergCoalitionRelationshipModel.sourceDeduplication, /explizite Beziehungen statt Themenähnlichkeit/i);
  assert.match(badenWuerttembergCoalitionRelationshipModel.competence, /offen/i);
  assert.match(badenWuerttembergCoalitionRelationshipModel.budgetReservation, /weder finanziert noch blockiert/i);
  assert.match(badenWuerttembergCoalitionRelationshipModel.maturity, /nur dort ein eigenes Wirkungsurteil/i);
});

test("coalition review publishes all cross-cutting #241 quality layers without an invented option", () => {
  assert.deepEqual(badenWuerttembergCoalitionQualityLayers.map((layer) => layer.title), [
    "Materielle Auslassungen",
    "Policy-Kohärenz",
    "Umsetzungs- und Delivery-Realismus",
    "Ressourcen und Finanzierung",
    "Räumliche und betroffenenbezogene Verteilung",
    "Internationale Spillover und Leakage",
    "Robustheit und Stress-Test",
    "Reversibilität und Lock-in",
    "Falsifikation und Recheck",
    "Politischer Lebenslauf",
    "Versionsvergleich",
    "Abdeckung und Reife",
  ]);
  const publicCopy = JSON.stringify({
    assessment: badenWuerttembergCoalitionAssessment,
    chapters: badenWuerttembergCoalitionChapters,
    layers: badenWuerttembergCoalitionQualityLayers,
  });
  assert.match(publicCopy, /keine fachlich freigegebene WÖk-Handlungsoption/i);
  assert.doesNotMatch(publicCopy, /Parteigesamtnote|Koalitionsnote|Durchschnittsscore|Wahlempfehlung/);
});

test("coalition review projects the approved document-wide outcome governance layer", () => {
  assert.equal(badenWuerttembergCoalitionGovernanceReview.paths.length, 4);
  assert.match(badenWuerttembergCoalitionGovernanceReview.assessment.impactCoreSummary, /Zielzustand, Zielgruppe, Zeithorizont und Monitoring/);
  assert.match(badenWuerttembergCoalitionGovernanceReview.assessment.editorialSummary, /Evaluationspflichten/);
  assert.match(badenWuerttembergCoalitionGovernanceReview.paths[3].risk, /kein Wirkungsnachweis/);
});

test("state mandate route renders the reviewed coalition component and source intermediary links", () => {
  const route = readFileSync(resolve(process.cwd(), "app/laender/[slug]/mandat-und-praxis/page.tsx"), "utf8");
  const component = readFileSync(resolve(process.cwd(), "app/components/states/StateCoalitionReview.tsx"), "utf8");
  assert.match(route, /BadenWuerttembergCoalitionReview/);
  assert.match(route, /slug === "baden-wuerttemberg"/);
  assert.match(component, /sourceDetailHrefForUrl/);
  assert.doesNotMatch(component, /href=\{source\.url\}/);
  assert.match(component, /Umsetzung ist nicht Wirkung/);
  assert.match(component, /StateCoalitionCommitmentInventory/);
});
