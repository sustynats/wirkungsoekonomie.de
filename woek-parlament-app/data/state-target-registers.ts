export type StateTargetStatus =
  | "SOURCE_CAPTURED"
  | "STRUCTURED_AND_VALIDATED"
  | "PUBLISHED";

export type StateTarget = {
  id: string;
  jurisdictionId: string;
  label: string;
  sdgCodes: string[];
  sourceLocation: {
    page: number;
    section: string;
  };
  indicatorRefs: string[];
  targetType: "QUANTIFIED" | "DIRECTIONAL" | "RULE_BASED";
  validFrom: string;
  validTo?: string;
};

export type StateTargetRegister = {
  id: string;
  jurisdictionId: string;
  title: string;
  sourceUrl: string;
  sourceSha256: string;
  sourcePublishedAt: string;
  declaredTargetCount: number;
  sourceRange: string;
  status: StateTargetStatus;
  targets: StateTarget[];
  notes: string;
};

/**
 * The global SDGs remain the common reference frame for every state. This
 * register adds the state's own versioned implementation targets; it neither
 * replaces the SDG mapping nor turns a strategy into constitutional law.
 * Individual state targets are deliberately not guessed from headings:
 * publication starts only after each target, indicator and page reference has
 * passed the structured source check.
 */
export const stateTargetRegisters: StateTargetRegister[] = [
  {
    id: "sachsen-anhalt-nachhaltigkeitsstrategie-2022",
    jurisdictionId: "sachsen-anhalt",
    title: "Nachhaltigkeitsstrategie des Landes Sachsen-Anhalt – Neuauflage 2022",
    sourceUrl: "https://mwu.sachsen-anhalt.de/api/media/230220_Nachhaltigkeitsstrategie_Sachsen-Anhalt-1.pdf?collection=document",
    sourceSha256: "07654ed01f23a8cc5bd81321e9a9bba1e38aeb59978c29f4fad05fd9b4ef849b",
    sourcePublishedAt: "2022-09-20",
    declaredTargetCount: 28,
    sourceRange: "Strategie, S. 46–81; Indikatorenbericht, S. 82–149",
    status: "SOURCE_CAPTURED",
    targets: [],
    notes: "Die Strategie ordnet 28 durch das Land beeinflussbare Nachhaltigkeitsziele den SDGs zu. Ein Ziel wird erst in die öffentliche Zielansicht übernommen, wenn Zielwortlaut, Fundstelle, Indikatorbezug und Versionsstatus strukturiert vorliegen."
  }
];

export function stateTargetRegisterForJurisdiction(jurisdictionId: string) {
  return stateTargetRegisters.find((register) => register.jurisdictionId === jurisdictionId);
}
