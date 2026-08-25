import descriptorJson from "@/data/impact-visuals/sachsen-anhalt-2026-v1.json";
import { impactVisualDescriptorSchema, type ImpactVisualScenarioRecord } from "./contracts";

export const saxonyAnhaltImpactVisualDescriptor = impactVisualDescriptorSchema.parse(descriptorJson);

const recordsByKey = new Map(
  saxonyAnhaltImpactVisualDescriptor.records.map((record) => [`${record.source_key}:${record.visual_scope}`, record] as const),
);

export function saxonyAnhaltImpactVisualRecord(
  sourceKey: string,
  scope: ImpactVisualScenarioRecord["visual_scope"],
) {
  return recordsByKey.get(`${sourceKey}:${scope}`) ?? null;
}

export function saxonyAnhaltImpactVisualRecords() {
  return saxonyAnhaltImpactVisualDescriptor.records;
}
