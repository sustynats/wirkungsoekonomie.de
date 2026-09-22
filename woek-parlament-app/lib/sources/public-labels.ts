export const sourceCategoryLabel = {
  PARLIAMENTARY_RECORD: "Parlamentarische Primärquelle",
  GOVERNMENT_RECORD: "Amtliche Regierungsquelle",
  OFFICIAL_STATISTICS: "Amtliche Statistik",
  OFFICIAL_EVALUATION: "Amtliche Evaluation",
  SCIENTIFIC_SOURCE: "Wissenschaftliche Primärquelle",
  WOEK_METHOD_REFERENCE: "WÖk-Methodenreferenz",
  OTHER_PRIMARY_SOURCE: "Weitere Primärquelle"
} as const;

export const sourceRoleLabel = {
  DECISION_FACT: "Parlamentarischer Sachverhalt",
  EX_ANTE_EVIDENCE: "Damals verfügbare Evidenz",
  EX_POST_EVIDENCE: "Später veröffentlichte Evidenz",
  CALCULATION_INPUT: "Rechen- bzw. Eingangswert",
  NORMATIVE_REFERENCE: "Normativer Referenzrahmen",
  METHODOLOGY_REFERENCE: "Methodischer Referenzrahmen",
  CONTEXT: "Kontext"
} as const;

export const temporalClassLabel = {
  AVAILABLE_AT_DECISION_TIME: "Zum Entscheidungszeitpunkt verfügbar",
  PUBLISHED_AFTER_DECISION: "Erst nach der Entscheidung veröffentlicht",
  CURRENT_REFERENCE: "Aktuelle Referenz"
} as const;
