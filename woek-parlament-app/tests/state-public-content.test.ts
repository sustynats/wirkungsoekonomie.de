import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { statePublicContent } from "../lib/states/public-content";

const reviews = [
  {
    slug: "baden-wuerttemberg",
    path: "data/states/baden-wuerttemberg/approved-review-2026-08-18.md",
    bytes: 9308,
    ids: ["BW-IMPACT-2026-01", "BW-IMPACT-2026-02", "BW-IMPACT-2026-03", "BW-IMPACT-2026-04", "BW-IMPACT-2026-05"],
  },
  {
    slug: "rheinland-pfalz",
    path: "data/states/rheinland-pfalz/approved-review-2026-08-18.md",
    bytes: 7199,
    ids: ["RP-IMPACT-2026-01", "RP-IMPACT-2026-02", "RP-IMPACT-2026-03", "RP-IMPACT-2026-04"],
    supplemental: {
      path: "data/states/rheinland-pfalz/approved-review-hitzeschutz-2026-08-20.md",
      bytes: 11226,
      ids: ["RP-IMPACT-2026-05-HITZESCHUTZ"],
    },
  },
  {
    slug: "berlin",
    path: "data/states/berlin/approved-review-2026-08-18.md",
    bytes: 12016,
    ids: ["BE-IMPACT-2026-01", "BE-IMPACT-2026-02", "BE-IMPACT-2026-03", "BE-IMPACT-2026-04", "BE-IMPACT-2026-05", "BE-IMPACT-2026-06"],
  },
  {
    slug: "mecklenburg-vorpommern",
    path: "data/states/mecklenburg-vorpommern/approved-review-2026-08-18.md",
    bytes: 11801,
    ids: ["MV-IMPACT-2026-01", "MV-IMPACT-2026-02", "MV-IMPACT-2026-03", "MV-IMPACT-2026-04", "MV-IMPACT-2026-05", "MV-IMPACT-2026-06", "MV-IMPACT-2026-07", "MV-IMPACT-2026-08"],
  },
] as const;

test("approved Länder reviews retain the canonical source byte lengths and impact IDs", () => {
  for (const review of reviews) {
    const absolutePath = resolve(process.cwd(), review.path);
    assert.equal(statSync(absolutePath).size, review.bytes, `${review.slug}: canonical byte length changed`);
    const markdown = readFileSync(absolutePath, "utf8");
    for (const id of review.ids) assert.ok(markdown.includes(id), `${review.slug}: missing ${id}`);
    const supplemental = "supplemental" in review ? review.supplemental : null;
    if (supplemental) {
      const supplementalPath = resolve(process.cwd(), supplemental.path);
      assert.equal(statSync(supplementalPath).size, supplemental.bytes, `${review.slug}: supplemental canonical byte length changed`);
      const supplementalMarkdown = readFileSync(supplementalPath, "utf8");
      for (const id of supplemental.ids) assert.ok(supplementalMarkdown.includes(id), `${review.slug}: missing ${id}`);
    }
    assert.equal(statePublicContent[review.slug]?.review?.caseCount, review.ids.length + (supplemental?.ids.length ?? 0));
  }
});

test("Baden-Württemberg exposes the verified 2026-2031 coalition mandate", () => {
  const mandate = statePublicContent["baden-wuerttemberg"]?.mandate;
  assert.ok(mandate);
  assert.equal(mandate.period, "2026-2031");
  assert.equal(mandate.governmentStart, "13.05.2026");
  assert.match(mandate.title, /Aus Verantwortung fürs Land/);
});

test("Berlin and Mecklenburg-Vorpommern keep official election field and analysis coverage separate", () => {
  assert.match(statePublicContent.berlin.electionField?.officialFieldLabel ?? "", /17 Parteien/);
  assert.match(statePublicContent["mecklenburg-vorpommern"].electionField?.officialFieldLabel ?? "", /19 Landeslisten/);
  assert.equal(statePublicContent.berlin.review?.area, "wahl");
  assert.equal(statePublicContent["mecklenburg-vorpommern"].review?.area, "wahl");
  assert.equal(statePublicContent.berlin.programmeSources?.status, "CURRENT_SOURCE_CLASSIFICATION_COMPLETE_17_OF_17");
  assert.equal(statePublicContent.berlin.programmeSources?.parties.length, 17);
  assert.equal(statePublicContent.berlin.programmeSources?.coverage.final_election_programme_verified_count, 9);
  assert.equal(statePublicContent.berlin.programmeSources?.coverage.full_17_final_election_programme_corpus_available, false);
});
