export type MaterialityResult = "NOT_SELECTED_FOR_FULL_IMPACT_REVIEW" | "SELECTED_FOR_FULL_IMPACT_REVIEW" | "MATERIALITY_REVIEW_REQUIRED";

export type MaterialityAssessment = {
  engineVersion: "1.0.0";
  result: MaterialityResult;
  reasons: string[];
};

const routineSignals = [/\bpersonalie\b/i, /\bwahl\b/i, /\bgeschäftsordnung\b/i, /\bprotokoll\b/i, /\büberweisung\b/i];
const highMaterialitySignals = [
  /\bgesetz\b/i,
  /\bhaushalt\b/i,
  /\bnachtrag\b/i,
  /\bsondervermögen\b/i,
  /\bgrundrecht/i,
  /\brente\b/i,
  /\bgesundheit/i,
  /\bwohnen/i,
  /\benergie/i,
  /\bklima/i,
  /\bbildung/i,
  /\bmigration/i,
  /\bdigital/i,
  /\binfrastruktur/i,
  /\barbeit\b/i,
  /\bwirtschaft/i
];

/**
 * A deterministic triage, never a hidden political assessment. Unclear cases
 * remain visible for editorial materiality review instead of being discarded.
 */
export function assessMateriality(title: string): MaterialityAssessment {
  const matchingHighSignals = highMaterialitySignals.filter((signal) => signal.test(title));
  if (matchingHighSignals.length > 0) {
    return {
      engineVersion: "1.0.0",
      result: "SELECTED_FOR_FULL_IMPACT_REVIEW",
      reasons: [`Titel enthält einen materiellen Regelungsindikator (${matchingHighSignals.length}).`, "Vollständige Fall- und Quellenprüfung bleibt erforderlich."]
    };
  }
  if (routineSignals.some((signal) => signal.test(title))) {
    return {
      engineVersion: "1.0.0",
      result: "NOT_SELECTED_FOR_FULL_IMPACT_REVIEW",
      reasons: ["Deterministische Vorsortierung: Routine-, Personal- oder Verfahrenssignal.", "Die Auswahl kann redaktionell jederzeit überschrieben werden."]
    };
  }
  return {
    engineVersion: "1.0.0",
    result: "MATERIALITY_REVIEW_REQUIRED",
    reasons: ["Der Titel reicht für eine verantwortbare automatische Einordnung nicht aus.", "Eine redaktionelle Materialitätsprüfung ist erforderlich."]
  };
}
