import "server-only";

import type { EditorialTaskDraft, TaskType } from "@/lib/editorial/engine";

type CalculationTaskType = Extract<TaskType,
  | "COUNTERFACTUAL_REVIEW"
  | "CALCULATION_INPUT_REVIEW"
  | "ATTRIBUTION_REVIEW"
  | "BENCHMARK_REVIEW"
  | "NORMALIZATION_REVIEW"
  | "AGGREGATION_REVIEW"
  | "UNCERTAINTY_REVIEW"
  | "DOUBLE_COUNTING_REVIEW"
>;

const optionsByTask: Record<CalculationTaskType, EditorialTaskDraft["candidateOptions"]> = {
  CALCULATION_INPUT_REVIEW: [
    { value: "SOURCE_ADDED", label: "Quelle ergänzen", effect: "Der Operand wird mit Quelle und Fundstelle in die Berechnung aufgenommen." },
    { value: "INTERVAL_SUPPORTED", label: "Intervall verwenden", effect: "Nur ein fachlich herleitbares Intervall wird gespeichert." },
    { value: "WITHOUT_ATTRIBUTION", label: "Ohne Attribution ausweisen", effect: "Die Zustandsänderung bleibt sichtbar, aber ohne kausale Zurechnung." },
    { value: "NOT_ROBUSTLY_QUANTIFIABLE", label: "Nicht quantifizierbar", effect: "Es wird keine Ersatz-Zahl erzeugt." }
  ],
  COUNTERFACTUAL_REVIEW: [
    { value: "STATUS_QUO", label: "Status quo", effect: "Das unveränderte Regelwerk ist das Gegenfaktum." },
    { value: "TREND_CONTINUATION", label: "Trendfortschreibung", effect: "Die zugrunde gelegte Reihe und Annahme werden sichtbar." },
    { value: "EXTERNAL_EVALUATION", label: "Externe Evaluation", effect: "Eine geprüfte Vergleichsquelle bestimmt das Gegenfaktum." },
    { value: "UNRESOLVED", label: "Nicht auflösbar", effect: "Keine starke kausale Quantifizierung wird freigegeben." }
  ],
  ATTRIBUTION_REVIEW: [
    { value: "OFFICIAL_EVALUATION", label: "Amtliche Evaluation", effect: "Eine belegte Zurechnung kann verwendet werden." },
    { value: "QUASI_EXPERIMENTAL", label: "Quasi-experimentell", effect: "Design und Einschränkungen werden dokumentiert." },
    { value: "ATTRIBUTION_UNRESOLVED", label: "Zurechnung offen", effect: "Kein frei geschätzter Attributionsfaktor wird verwendet." }
  ],
  BENCHMARK_REVIEW: [
    { value: "REFERENCE_CONFIRMED", label: "Referenz bestätigt", effect: "Der genaue Referenzsnapshot wird fixiert." },
    { value: "NO_AUTHORIZED_BENCHMARK", label: "Kein autorisierter Referenzwert", effect: "Keine Normalisierung oder Klassenbildung erfolgt." }
  ],
  NORMALIZATION_REVIEW: [
    { value: "RULE_CONFIRMED", label: "Regel bestätigt", effect: "Die veröffentlichte Schwellenregel und Version werden festgehalten." },
    { value: "RULE_MISSING", label: "Regel fehlt", effect: "Der Wert bleibt als Einheit, ohne verdeckte Skalenübertragung." }
  ],
  AGGREGATION_REVIEW: [
    { value: "NO_AGGREGATION", label: "Nicht aggregieren", effect: "Unvergleichbare Wirkungen bleiben getrennt sichtbar." },
    { value: "AGGREGATION_WITH_AUTHORIZED_WEIGHTS", label: "Autorisierte Gewichtung", effect: "Gewichte, Quelle und Version werden im Ledger gespeichert." }
  ],
  UNCERTAINTY_REVIEW: [
    { value: "INTERVAL_SUPPORTED", label: "Intervall belegt", effect: "Unter-, Zentral- und Oberwert werden samt Grundlage ausgewiesen." },
    { value: "QUALITATIVE_UNCERTAINTY", label: "Nur qualitativ ausweisbar", effect: "Keine willkürliche Bandbreite wird ergänzt." }
  ],
  DOUBLE_COUNTING_REVIEW: [
    { value: "DEDUPLICATION_CONFIRMED", label: "Doppelzählung ausgeschlossen", effect: "Der gemeinsame Zustandswert wird nur einmal aggregiert." },
    { value: "DOUBLE_COUNTING_RISK", label: "Doppelzählungsrisiko", effect: "Die Werte werden bis zur Klärung nicht gemeinsam aggregiert." }
  ]
};

/** Build one narrow calculation task.  The caller may group comparable gaps
 * under one batch key; this deliberately never turns every missing input into
 * an unprioritized task flood. */
export function createCalculationReviewTask(input: {
  taskType: CalculationTaskType;
  caseId: string;
  question: string;
  requiredValue: string;
  currentState: string;
  calculationId?: string;
  priority?: EditorialTaskDraft["priority"];
  blocking?: boolean;
}) : EditorialTaskDraft {
  return {
    taskType: input.taskType,
    routerStatus: "HUMAN_REQUIRED",
    question: input.question,
    reasonManual: "Dieser Rechenschritt braucht eine begründete Quelle oder eine explizite Nicht-Quantifizierbarkeit. Das System darf keinen Ersatzwert schätzen.",
    priority: input.priority ?? "NORMAL",
    blocking: input.blocking ?? true,
    contextRefs: {
      case_id: input.caseId,
      calculation_id: input.calculationId ?? null,
      required_value: input.requiredValue,
      current_state: input.currentState,
      minimum_context: ["relevanter Wirkpfad", "benötigter Operand", "Quellen", "Formel/Regel", "Auswirkung auf das Fachvotum"]
    },
    candidateOptions: optionsByTask[input.taskType],
    impactPreview: {
      effect: "Die Berechnung bleibt bis zur Entscheidung entweder offen, wird transparent eingegrenzt oder als nicht robust quantifizierbar veröffentlicht."
    },
    aiEligible: false,
    dependencyIds: input.calculationId ? [input.calculationId] : []
  };
}
