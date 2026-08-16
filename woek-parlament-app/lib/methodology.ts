export type ImpactDirection =
  | "POSITIVE_POTENTIAL"
  | "NEGATIVE_RISK"
  | "NEUTRAL"
  | "AMBIVALENT"
  | "OPEN";

export type EvidenceLevel = "HIGH" | "MEDIUM" | "LOW" | "NOT_ASSESSABLE";

export type ImpactAssessmentExplanation = {
  source: {
    title: string;
    href?: string;
    quote?: string;
    locator?: string;
  };
  trigger: string;
  recipients: string[];
  impactSpace: string[];
  mechanism: string;
  assumptions: string[];
  targetMappings: Array<{
    targetId: string;
    targetLabel: string;
    direction: ImpactDirection;
    rationale: string;
  }>;
  evidence: {
    level: EvidenceLevel;
    status:
      | "OFFICIAL_FACT"
      | "EMPIRICALLY_SUPPORTED"
      | "PLAUSIBLE_PATH"
      | "MODEL_ASSUMPTION"
      | "OPEN";
    dataStatus:
      | "MEASURED"
      | "OBSERVED"
      | "MODELLED"
      | "ESTIMATED"
      | "SECONDARY"
      | "MISSING";
  };
  actualEffectStatus: "NOT_ESTABLISHED_EX_ANTE" | "OBSERVED" | "EVALUATED" | "OPEN";
  competence?: {
    level: "LAND" | "BUND" | "EU" | "KOMMUNE" | "MIXED" | "OPEN";
    rationale?: string;
  };
  legalReview?: {
    status: string;
    references: string[];
    rationale?: string;
  };
  risks: string[];
  boundaries: string[];
  dataNeeds: string[];
  method: {
    version: string;
    ruleId?: string;
    reviewedAt?: string;
    changeLogHref?: string;
  };
};

export type DirectionRuleExample = {
  ruleId: string;
  title: string;
  statement: string;
  mechanism: string;
  stateChange: string;
  mappings: ImpactAssessmentExplanation["targetMappings"];
  boundary: string;
  reviewFlags: string[];
  policyOrCommunication: "Sachpolitische Regel" | "Kommunikationsregel";
  version: string;
  registerQuery: string;
};

export const directionLabels: Record<ImpactDirection, string> = {
  POSITIVE_POTENTIAL: "Positives Wirkungspotenzial",
  NEGATIVE_RISK: "Negatives Wirkungspotenzial",
  NEUTRAL: "Neutrale Einordnung",
  AMBIVALENT: "Gegenläufige Potenziale und Risiken",
  OPEN: "Richtung offen"
};

export const evidenceLabels: Record<EvidenceLevel, string> = {
  HIGH: "hoch",
  MEDIUM: "mittel",
  LOW: "gering",
  NOT_ASSESSABLE: "nicht bewertbar"
};

export const directionRuleExamples: DirectionRuleExample[] = [
  {
    ruleId: "EDU-FREE-ACCESS-POS",
    title: "Kostenfreien Bildungszugang prüfen",
    statement: "Kostenfreier Zugang zu Kita, Schulessen oder zentralen Lehrmitteln.",
    mechanism: "Direkte Kostenbarrieren für Bildungs- und Betreuungsleistungen sinken.",
    stateChange: "Zugänglichkeit und Chancengleichheit können steigen.",
    mappings: [
      {
        targetId: "SDG 4",
        targetLabel: "Hochwertige Bildung",
        direction: "POSITIVE_POTENTIAL",
        rationale: "Geringere Kostenbarrieren können den Zugang zu zentralen Bildungsleistungen verbessern."
      },
      {
        targetId: "SDG 10",
        targetLabel: "Weniger Ungleichheiten",
        direction: "POSITIVE_POTENTIAL",
        rationale: "Entlastungen können Unterschiede beim Zugang zwischen Haushalten verringern."
      }
    ],
    boundary: "Finanzierung, Angebotskapazität und tatsächliche Inanspruchnahme bleiben eigene Prüfpfade.",
    reviewFlags: ["Finanzierung prüfen", "Angebotskapazität prüfen"],
    policyOrCommunication: "Sachpolitische Regel",
    version: "1.1",
    registerQuery: "Gleichberechtigter Zugang"
  },
  {
    ruleId: "EDU-HOME-NEG",
    title: "Hausunterricht und Anwesenheitsschule prüfen",
    statement: "Wahlfreiheit zwischen Anwesenheitsschule und Hausunterricht beziehungsweise weitgehende Ablösung der Anwesenheitsschulpflicht.",
    mechanism: "Der Zugang zu professioneller pädagogischer Betreuung, gemeinsamem sozialem Lernen und schulischen Schutz- und Sozialisationsfunktionen verändert sich.",
    stateChange: "Chancengerechtigkeit, Teilhabe und gleichberechtigter Bildungszugang können beeinträchtigt werden.",
    mappings: [
      {
        targetId: "SDG 4",
        targetLabel: "Hochwertige Bildung",
        direction: "NEGATIVE_RISK",
        rationale: "Ungleiche häusliche Ressourcen können Bildungszugang und Lernbedingungen stärker auseinanderziehen."
      },
      {
        targetId: "SDG 10",
        targetLabel: "Weniger Ungleichheiten",
        direction: "NEGATIVE_RISK",
        rationale: "Unterschiede in Betreuung, Ausstattung und sozialer Einbindung können bestehende Ungleichheiten verstärken."
      }
    ],
    boundary: "Das ist eine Ex-ante-Einordnung. Tatsächliche Lernresultate und Kindeswohlwirkungen sind damit noch nicht festgestellt.",
    reviewFlags: ["Art. 7 GG prüfen", "Kindeswohl prüfen"],
    policyOrCommunication: "Sachpolitische Regel",
    version: "1.1",
    registerQuery: "Lernorte Infrastruktur"
  },
  {
    ruleId: "ROAD-NEW-AMB",
    title: "Straßenneubau mehrdimensional prüfen",
    statement: "Neubau oder wesentliche Erweiterung einer Straße.",
    mechanism: "Erreichbarkeit und Verkehrskapazität können steigen; zugleich können Verkehr, Emissionen sowie Flächen- und Naturverbrauch zunehmen.",
    stateChange: "Je Referenzziel entstehen unterschiedliche, teilweise gegenläufige Zustandsveränderungen.",
    mappings: [
      {
        targetId: "SDG 9",
        targetLabel: "Industrie, Innovation und Infrastruktur",
        direction: "POSITIVE_POTENTIAL",
        rationale: "Zusätzliche Kapazität kann Erreichbarkeit und infrastrukturelle Verbindungen verbessern."
      },
      {
        targetId: "SDG 11",
        targetLabel: "Nachhaltige Städte und Gemeinden",
        direction: "AMBIVALENT",
        rationale: "Erreichbarkeitsvorteile stehen möglichen zusätzlichen Verkehrs- und Flächeneffekten gegenüber."
      },
      {
        targetId: "SDG 13",
        targetLabel: "Maßnahmen zum Klimaschutz",
        direction: "NEGATIVE_RISK",
        rationale: "Zusätzlicher motorisierter Verkehr kann Emissionen und langfristige Pfadabhängigkeiten erhöhen."
      },
      {
        targetId: "SDG 15",
        targetLabel: "Leben an Land",
        direction: "NEGATIVE_RISK",
        rationale: "Bau und Nutzung können Flächen versiegeln sowie Lebensräume zerschneiden."
      }
    ],
    boundary: "Aus den vier Zielrichtungen wird kein Durchschnitt gebildet. Trasse, Alternativen, Verkehrsprognose und Schutzflächen müssen fallbezogen geprüft werden.",
    reviewFlags: ["Klimapfad prüfen", "Flächen- und Naturwirkung prüfen"],
    policyOrCommunication: "Sachpolitische Regel",
    version: "1.1",
    registerQuery: "Infrastruktur"
  }
];

export const endToEndExample: ImpactAssessmentExplanation = {
  source: {
    title: "Wahlprogramm der AfD Sachsen-Anhalt",
    href: "/fachakten/sachsen-anhalt-afd",
    quote: "Wir werden deshalb in Anlehnung an das österreichische Modell eine Wahlfreiheit zwischen Schul- und Hausunterricht schaffen.",
    locator: "Programmpunkt 142 der geprüften Programmaussagen"
  },
  trigger: "Ein landespolitisches Modell soll die Anwesenheitsschulpflicht weitgehend durch eine Wahl zwischen Schule und Hausunterricht ersetzen.",
  recipients: ["Schülerinnen und Schüler", "Eltern und Sorgeberechtigte", "Schulen", "Kinder- und Jugendhilfe"],
  impactSpace: ["Bildungszugang", "soziale Teilhabe", "schulische Schutz- und Sozialisationsfunktionen"],
  mechanism: "Wenn der gemeinsame schulische Lern- und Schutzraum nicht mehr regelmäßig erreicht wird, hängen Lernbedingungen, soziale Einbindung und der Zugang zu professioneller pädagogischer Begleitung stärker von den Ressourcen des Elternhauses ab.",
  assumptions: [
    "Hausunterricht ersetzt regelmäßige Anwesenheit in relevantem Umfang.",
    "Qualität, Ausstattung und Betreuung im häuslichen Umfeld unterscheiden sich zwischen Haushalten.",
    "Schulische Schutz- und Sozialisationsfunktionen werden nicht vollständig gleichwertig ersetzt."
  ],
  targetMappings: [
    {
      targetId: "SDG 4",
      targetLabel: "Hochwertige Bildung",
      direction: "NEGATIVE_RISK",
      rationale: "Der gleichberechtigte Zugang zu professioneller pädagogischer Begleitung kann schwächer und stärker vom Elternhaus abhängig werden."
    },
    {
      targetId: "SDG 10",
      targetLabel: "Weniger Ungleichheiten",
      direction: "NEGATIVE_RISK",
      rationale: "Unterschiede in Zeit, Bildung, Einkommen und Ausstattung der Haushalte können sich stärker auf Bildungschancen auswirken."
    }
  ],
  evidence: {
    level: "MEDIUM",
    status: "PLAUSIBLE_PATH",
    dataStatus: "MODELLED"
  },
  actualEffectStatus: "NOT_ESTABLISHED_EX_ANTE",
  competence: {
    level: "LAND",
    rationale: "Schulrecht und Schulorganisation liegen wesentlich in der Verantwortung des Landes; verfassungsrechtliche Vorgaben bleiben bindend."
  },
  legalReview: {
    status: "rechtlich prüfbedürftig",
    references: ["Art. 7 GG", "Schulgesetz Sachsen-Anhalt § 36", "Kindeswohl und staatlicher Bildungsauftrag"],
    rationale: "Die Wirkungseinordnung ersetzt keine Rechtsprüfung. Sie zeigt, welche rechtlichen und tatsächlichen Schutzfragen zusätzlich zu prüfen sind."
  },
  risks: [
    "Verstärkung sozialer Bildungsunterschiede",
    "Schwächere Erreichbarkeit schulischer Schutz- und Unterstützungsangebote",
    "Unterschiedliche Qualität und Kontrollierbarkeit des Unterrichts"
  ],
  boundaries: [
    "Kindeswohl und gleichberechtigter Bildungszugang dürfen nicht durch Vorteile einzelner Haushalte aufgewogen werden.",
    "Eine fachliche Freigabe setzt einen vollständigen und geprüften Quelltext voraus."
  ],
  dataNeeds: [
    "Ausgangslage zu Bildungszugang und sozialer Ungleichheit",
    "Teilnahme-, Leistungs- und Abbruchdaten nach sozialer Lage",
    "Daten zu Schutzmeldungen, Beratung und sozialer Teilhabe",
    "Ein belastbares Vergleichsdesign für alternative Schulmodelle"
  ],
  method: {
    version: "Richtungsregeln Sachsen-Anhalt 1.1",
    ruleId: "EDU-HOME-NEG",
    reviewedAt: "2026-08-16",
    changeLogHref: "/methodik#korrekturen"
  }
};

export type ImpactDemoResult = {
  observedDelta: number;
  counterfactualDelta: number;
  estimatedAdditionalChange: number;
};

export function calculateImpactDemo(baseline: number, observed: number, counterfactual: number): ImpactDemoResult | null {
  if (![baseline, observed, counterfactual].every(Number.isFinite)) return null;
  const observedDelta = observed - baseline;
  const counterfactualDelta = counterfactual - baseline;
  return {
    observedDelta,
    counterfactualDelta,
    estimatedAdditionalChange: observedDelta - counterfactualDelta
  };
}

export type ScoreInputs = {
  autoScore?: number | null;
  benchmarkScore?: number | null;
  benchmarkActive?: boolean;
  assuranceScore?: number | null;
};

function validScore(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= -3 && value <= 3;
}

export function calculateFinalScore(inputs: ScoreInputs): number | null {
  const candidates: number[] = [];
  if (validScore(inputs.autoScore)) candidates.push(inputs.autoScore);
  if (inputs.benchmarkActive && validScore(inputs.benchmarkScore)) candidates.push(inputs.benchmarkScore);
  if (validScore(inputs.assuranceScore)) candidates.push(inputs.assuranceScore);
  return candidates.length > 0 ? Math.min(...candidates) : null;
}

export function formatMethodNumber(value: number): string {
  const normalized = Object.is(value, -0) ? 0 : value;
  return new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 }).format(normalized);
}
