import "server-only";

/**
 * Deterministic editorial routing.
 *
 * This module intentionally contains no model call and no party/person fields.
 * Its output is a small package for an editorial task, not a published
 * assessment.  The same fact package therefore always yields the same task
 * package, independent of political metadata.
 */

export const POLICY_FIELDS = [
  "HOUSING",
  "HEALTH_CARE",
  "EDUCATION_PARTICIPATION",
  "WORK_SKILLS",
  "ECONOMY_TRANSFORMATION",
  "ENERGY_GRIDS",
  "MOBILITY",
  "CLIMATE_RESILIENCE",
  "DIGITAL_STATE_INFRASTRUCTURE",
  "STATE_ADMINISTRATION"
] as const;

export const MPD_FIELDS = ["HUMAN", "PLANET", "DEMOCRACY"] as const;

export type PolicyField = (typeof POLICY_FIELDS)[number];
export type MpdField = (typeof MPD_FIELDS)[number];
export type AssessmentField = PolicyField | MpdField;
export type DomainResolution = "MATERIAL" | "INDIRECT" | "NOT_MATERIAL_IDENTIFIED" | "EVIDENCE_OPEN";
export type RouterStatus =
  | "AUTO_RESOLVED"
  | "PRECEDENT_RESOLVED"
  | "AI_MICROTASK_ELIGIBLE"
  | "HUMAN_REQUIRED"
  | "EVIDENCE_REQUIRED"
  | "METHOD_REVIEW_REQUIRED"
  | "LEGAL_REVIEW_REQUIRED";

export type TaskType =
  | "FACT_CONFLICT"
  | "DOMAIN_RELEVANCE"
  | "NORMATIVE_MAPPING_REVIEW"
  | "BOUNDARY_REVIEW"
  | "RECOMMENDATION_REVIEW"
  | "METHOD_PATTERN_PROMOTION";

export type CandidateOption = {
  value: DomainResolution;
  label: string;
  effect: string;
};

export type EditorialTaskDraft = {
  taskType: TaskType;
  routerStatus: RouterStatus;
  question: string;
  reasonManual: string;
  priority: "BLOCKING" | "HIGH" | "NORMAL" | "OPTIONAL";
  blocking: boolean;
  contextRefs: Record<string, unknown>;
  candidateOptions: CandidateOption[] | Array<{ field: AssessmentField; options: CandidateOption[] }>;
  impactPreview: Record<string, unknown>;
  aiEligible: false;
  dependencyIds: string[];
};

export type FactPackageInput = {
  caseId: string;
  caseTitle: string;
  factStatus: "DRAFT" | "SOURCE_REQUIRED" | "EDITORIALLY_CONFIRMED";
  decisionObject?: string | null;
  officialObjective?: string | null;
  parliamentaryStatus?: string | null;
  uncertainties: unknown[];
  sourceDocumentIds: string[];
  dueInDays?: number | null;
  approvedPattern?: {
    id: string;
    resolution: Record<string, unknown>;
    rationale: string;
  } | null;
};

export type DeterministicPreAnalysis = {
  resolver: "RULE" | "PRECEDENT" | "EVIDENCE";
  domainStatus: Array<{ field: AssessmentField; status: DomainResolution }>;
  tasks: EditorialTaskDraft[];
  explanation: string;
};

const domainOptions: CandidateOption[] = [
  {
    value: "MATERIAL",
    label: "Materiell",
    effect: "Das Feld wird im Hauptreport weiter analysiert und erhält einen begründeten Wirkpfad."
  },
  {
    value: "INDIRECT",
    label: "Indirekt",
    effect: "Das Feld erscheint als Folgewirkung, ohne den Hauptreport zu dominieren."
  },
  {
    value: "NOT_MATERIAL_IDENTIFIED",
    label: "Nicht materiell identifiziert",
    effect: "Für diese Fassung wird keine weitere Fachanalyse zu diesem Feld erzeugt."
  },
  {
    value: "EVIDENCE_OPEN",
    label: "Evidenz offen",
    effect: "Das Feld bleibt als benannte Lücke sichtbar; es wird keine Wirkungsbehauptung erzeugt."
  }
];

function priorityFor(dueInDays?: number | null): EditorialTaskDraft["priority"] {
  if (dueInDays !== null && dueInDays !== undefined && dueInDays <= 7) return "HIGH";
  return "NORMAL";
}

function sourceMissingTask(input: FactPackageInput): EditorialTaskDraft {
  return {
    taskType: "FACT_CONFLICT",
    routerStatus: "EVIDENCE_REQUIRED",
    question: "Welche amtliche Originalfassung ist für die Wirkungsanalyse maßgeblich?",
    reasonManual:
      "Der Vorgang ist als amtliche Metadateninformation vorhanden. Eine belastbare Wirkungsanalyse setzt jedoch eine bestätigte Originalfassung und die relevante Passage voraus.",
    priority: priorityFor(input.dueInDays),
    blocking: true,
    contextRefs: {
      case_id: input.caseId,
      case_title: input.caseTitle,
      parliamentary_status: input.parliamentaryStatus ?? null,
      known_uncertainties: input.uncertainties
    },
    candidateOptions: [],
    impactPreview: {
      effect: "Bis zur Quellenbestätigung werden keine Wirkpfade, SDG-/SDG+-Zuordnungen oder Empfehlungskandidaten erzeugt."
    },
    aiEligible: false,
    dependencyIds: []
  };
}

function domainMatrixTask(input: FactPackageInput): EditorialTaskDraft {
  const candidateOptions = POLICY_FIELDS.map((field) => ({ field, options: domainOptions }));
  return {
    taskType: "DOMAIN_RELEVANCE",
    routerStatus: "HUMAN_REQUIRED",
    question: "Welche der zehn Pflicht-Politikfelder sind für diese Fassung materiell, indirekt, nicht materiell identifiziert oder evidenzoffen?",
    reasonManual:
      "Die Materialität steuert, welche Wirkpfade vertieft werden. Sie darf weder aus Parteiinformationen noch aus einem Sprachmodell abgeleitet werden.",
    priority: priorityFor(input.dueInDays),
    blocking: true,
    contextRefs: {
      case_id: input.caseId,
      case_title: input.caseTitle,
      decision_object: input.decisionObject ?? null,
      official_objective: input.officialObjective ?? null,
      source_document_ids: input.sourceDocumentIds,
      known_uncertainties: input.uncertainties,
      minimum_context: ["Entscheidungsgegenstand", "amtliche Zielsetzung", "relevante Originalpassage", "Quellen"]
    },
    candidateOptions,
    impactPreview: {
      material: "Das Feld wird im Hauptreport einschließlich Wirkpfad, Quellen und Gegenprüfung geführt.",
      indirect: "Das Feld bleibt als mögliche Folgewirkung ausgewiesen.",
      evidence_open: "Es wird eine Evidenzlücke, keine zukünftige Wirkung behauptet."
    },
    aiEligible: false,
    dependencyIds: []
  };
}

function precedentResult(input: FactPackageInput): DeterministicPreAnalysis {
  return {
    resolver: "PRECEDENT",
    domainStatus: POLICY_FIELDS.map((field) => ({ field, status: "EVIDENCE_OPEN" })),
    tasks: [],
    explanation: `Ein freigegebenes Entscheidungsmuster (${input.approvedPattern?.id}) passt. Seine Auflösung bleibt mit Quelle und Methodenversion nachvollziehbar und wird nicht stillschweigend zu einer globalen Regel.`
  };
}

export function createDeterministicPreAnalysis(input: FactPackageInput): DeterministicPreAnalysis {
  if (input.factStatus !== "EDITORIALLY_CONFIRMED") {
    return {
      resolver: "EVIDENCE",
      domainStatus: [...POLICY_FIELDS, ...MPD_FIELDS].map((field) => ({ field, status: "EVIDENCE_OPEN" })),
      tasks: [sourceMissingTask(input)],
      explanation: "Ohne bestätigtes Faktpaket wird keine fachliche Wirkungs- oder Normbewertung vorweggenommen."
    };
  }

  if (input.approvedPattern) return precedentResult(input);

  return {
    resolver: "RULE",
    domainStatus: [...POLICY_FIELDS, ...MPD_FIELDS].map((field) => ({ field, status: "EVIDENCE_OPEN" })),
    tasks: [domainMatrixTask(input)],
    explanation:
      "Die deterministische Voranalyse legt nur den Prüfrahmen an. Materialität und normative Zuordnung bleiben vor ihrer Freigabe offen und erzeugen keinen automatischen Schluss."
  };
}

export function routerForQuestion(input: {
  hasConfirmedFacts: boolean;
  hasApprovedPrecedent: boolean;
  isNormativeOrBoundary: boolean;
  isLegalQuestion: boolean;
  needsBoundedSemanticHelp: boolean;
}): RouterStatus {
  if (!input.hasConfirmedFacts) return "EVIDENCE_REQUIRED";
  if (input.isLegalQuestion) return "LEGAL_REVIEW_REQUIRED";
  if (input.isNormativeOrBoundary) return "HUMAN_REQUIRED";
  if (input.hasApprovedPrecedent) return "PRECEDENT_RESOLVED";
  if (input.needsBoundedSemanticHelp) return "AI_MICROTASK_ELIGIBLE";
  return "HUMAN_REQUIRED";
}
