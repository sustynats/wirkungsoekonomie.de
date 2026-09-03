import afd from "@/data/state-programmes/communication-media-impact/ltw-2026-st-afd.json";
import bsw from "@/data/state-programmes/communication-media-impact/ltw-2026-st-bsw.json";
import cdu from "@/data/state-programmes/communication-media-impact/ltw-2026-st-cdu.json";
import gruene from "@/data/state-programmes/communication-media-impact/ltw-2026-st-gruene.json";
import linke from "@/data/state-programmes/communication-media-impact/ltw-2026-st-linke.json";
import spd from "@/data/state-programmes/communication-media-impact/ltw-2026-st-spd.json";

export type CommunicationEvidence = {
  text: string;
  mechanism: string;
  reach_resonance: string;
  observed_outcome: string;
  attribution: string;
};

export type CommunicationPattern = {
  pattern_id: string;
  title: string;
  source_locator: string;
  source_url: string;
  communication_unit: string;
  frame_or_pattern: string;
  target_or_referent: string;
  problem_definition_and_causal_attribution?: string;
  ingroup_outgroup_structure?: string;
  attention_or_agenda_effect?: string;
  emotional_activation?: string;
  interpretation_effect?: string;
  resonance_or_amplification?: string;
  normalization_or_sayability_shift?: string;
  stigmatization_or_dehumanization_review?: string;
  first_order: string;
  second_order: string;
  third_order: string;
  democratic_resilience_effect: string;
  protected_interests: string[];
  counterfactual?: string;
  falsification_recheck_trigger: string;
};

export type CommunicationMediaImpactRecord = {
  communication_review_id: string;
  programme_source_key: string;
  communication_review_version: string;
  fach_status: string;
  restore_classification: string;
  coverage_scope: string;
  assessment_maturity: string;
  assessment_icon_kind: "risk" | "ambivalent" | "positive" | "open";
  overview_assessment_label: string;
  public_summary: string;
  positive_potentials: string[];
  material_risks: string[];
  noncompensation: string;
  evidence: CommunicationEvidence;
  protected_interests: string[];
  cascade_summary: string;
  open_points: string[];
  patterns: CommunicationPattern[];
  source_refs: Array<{ title: string; url: string; locator: string }>;
  fach_source: { issue: number; comment_id: number; url: string };
};

const records = [afd, bsw, cdu, spd, gruene, linke] as CommunicationMediaImpactRecord[];

export function getCommunicationMediaImpact(sourceKey: string) {
  return records.find((record) => record.programme_source_key === sourceKey) ?? null;
}

export function getAllCommunicationMediaImpactRecords() {
  return records;
}
