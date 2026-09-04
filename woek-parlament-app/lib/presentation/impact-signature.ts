import type { OverviewAssessmentData, AssessmentIconKind } from "./overview-assessment";
import type { PublicMaturityProjection } from "./public-maturity";

export type EvidenceGrade = 1 | 2 | 3 | 4;
export type EffectPhase = "EX_ANTE" | "IMPLEMENTATION" | "OBSERVED" | "ATTRIBUTED";
export type ImpactSignatureData = {
  direction: { kind: AssessmentIconKind; label: string };
  evidence: { grade: EvidenceGrade | null; label: string; detail: string };
  maturity: { phase: EffectPhase | null; label: string; detail: string };
};

export const effectPhases: ReadonlyArray<{ id: EffectPhase; label: string }> = [
  { id: "EX_ANTE", label: "Ex ante" },
  { id: "IMPLEMENTATION", label: "In Umsetzung" },
  { id: "OBSERVED", label: "Beobachtet" },
  { id: "ATTRIBUTED", label: "Zugerechnet" },
];

export const directionSymbols: Record<AssessmentIconKind, string> = {
  positive: "↗", risk: "↘", ambivalent: "↙↗", open: "?", neutral: "=",
  portfolio: "⋮", conditional: "◇", protection: "!", unknown: "?",
};

/** Presentation only. Analysis completeness is NOT observed or attributed effect.
 * Neither narrative evidence nor HIGH/MEDIUM/LOW establishes a four-grade scale.
 * Missing grades remain null, never zero, LOW, neutral or a guessed ordinal.
 */
export function projectImpactSignature(
  assessment: OverviewAssessmentData | null,
  maturity: PublicMaturityProjection,
): ImpactSignatureData {
  const phase = maturity.primary === "EX_ANTE_POTENTIAL_ONLY" || maturity.flags.includes("EX_ANTE_POTENTIAL_ONLY")
    ? "EX_ANTE" : null;
  return {
    direction: { kind: assessment?.directionKind ?? "open", label: assessment?.directionLabel ?? "Wirkungsrichtung offen" },
    evidence: {
      grade: null,
      label: "Nicht eingestuft",
      detail: assessment?.evidenceSummary ?? "Keine fachlich freigegebene Evidenzeinstufung veröffentlicht.",
    },
    maturity: {
      phase,
      label: phase ? "Ex ante" : "Offen",
      detail: maturity.label,
    },
  };
}

/** Exact excerpt, not a rewritten assessment. The canonical finding stays intact. */
export function findingExcerpt(value: string, limit = 140) {
  const characters = Array.from(value.trim());
  if (characters.length <= limit) return value.trim();
  const prefix = characters.slice(0, limit - 1).join("");
  const boundary = prefix.lastIndexOf(" ");
  return `${boundary > 0 ? prefix.slice(0, boundary) : prefix}…`;
}
