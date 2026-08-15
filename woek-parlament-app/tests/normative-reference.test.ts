import assert from "node:assert/strict";
import test from "node:test";
import { getNormativeReference, normativeReferenceRegistry } from "@/lib/normative/reference-registry";
import { normativeMappingSchema } from "@/lib/review/contracts";

test("the registry contains all seven canonical SDG+ dimensions", () => {
  const sdgPlus = normativeReferenceRegistry.filter((entry) => entry.framework === "SDG_PLUS");
  assert.deepEqual(sdgPlus.map((entry) => entry.id), [
    "SDG_PLUS_DEMOCRACY",
    "SDG_PLUS_MEDIA_QUALITY",
    "SDG_PLUS_RULE_OF_LAW",
    "SDG_PLUS_DISCOURSE_CAPACITY",
    "SDG_PLUS_INSTITUTIONAL_TRUST",
    "SDG_PLUS_SOCIAL_COHESION",
    "SDG_PLUS_DIGITAL_SELF_DETERMINATION"
  ]);
});

test("animal welfare is a separate constitutional protection anchor", () => {
  const animalWelfare = getNormativeReference("GG_ART_20A_ANIMAL_PROTECTION");
  assert.equal(animalWelfare?.framework, "CONSTITUTIONAL_ANCHOR");
  assert.equal(animalWelfare?.constitutionalAnchorType, "PROTECTION_DUTY");
  assert.equal(animalWelfare?.legalReference, "Art. 20a GG");
  assert.notEqual(animalWelfare?.id, "GG_ART_20A_NATURAL_FOUNDATIONS");
});

test("review mappings accept only the canonical reference identity", () => {
  const valid = {
    reference_frame: "Test",
    tile_mappings: [{
      id: "GG_ART_20A_ANIMAL_PROTECTION",
      framework: "CONSTITUTIONAL_ANCHOR",
      direction: "NEGATIVE_RISK",
      evidence_status: "LIMITED",
      rationale: "Die Fallunterlagen betreffen die Lebensbedingungen empfindungsfähiger Tiere.",
      impact_path_refs: ["IP-1"],
      source_refs: ["SRC-1"]
    }]
  };
  assert.equal(normativeMappingSchema.parse(valid).tile_mappings[0]?.id, "GG_ART_20A_ANIMAL_PROTECTION");
  assert.throws(() => normativeMappingSchema.parse({
    ...valid,
    tile_mappings: [{ ...valid.tile_mappings[0], id: "ANIMAL_WELFARE", framework: "SDG_PLUS" }]
  }));
});
