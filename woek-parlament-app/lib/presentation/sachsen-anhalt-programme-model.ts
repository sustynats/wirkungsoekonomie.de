import {
  presentSaxonyAnhaltMarkdown,
  publicSaxonyAnhaltLabel,
  saxonyAnhaltProgrammeOverview,
} from "@/lib/presentation/sachsen-anhalt-programmes";

type Node = {
  level: number;
  title: string;
  lines: string[];
  children: Node[];
};

export type ProgrammeImpactPotential = {
  stateChange: string | null;
  mechanism: string | null;
  evidence: string | null;
  indicators: string[];
};

export type ProgrammeImpactRisk = {
  risk: string | null;
  trigger: string | null;
  affected: string[];
  evidence: string | null;
};

export type ProgrammeCommitment = {
  index: number;
  key: string;
  title: string;
  sourceText: string;
  page: string | null;
  section: string | null;
  policyDomain: string | null;
  implementationLevel: string | null;
  intendedChange: string | null;
  readiness: string | null;
  readinessLabel: string;
  missingParameters: string[];
  responsibleActors: string[];
  affectedGroups: string[];
  impactPotentials: ProgrammeImpactPotential[];
  impactRisks: ProgrammeImpactRisk[];
  boundaryConcerns: string[];
  boundaryStatus: string | null;
  boundaryRationales: string[];
  human: string[];
  planet: string[];
  democracy: string[];
  sdgs: string[];
  sdgPlus: string[];
  stateTargets: string[];
  dataGaps: string[];
  firstOrder: string | null;
  secondOrder: string[];
  thirdOrder: string | null;
  distributionNote: string | null;
  shortTerm: string | null;
  mediumTerm: string | null;
  longTerm: string | null;
  intergenerationalRelevance: string | null;
  implementationRequirements: string[];
  capacityStatus: string | null;
  capacityNote: string | null;
  reversibility: string | null;
  reversibilityRationale: string | null;
  informationGapStatus: string | null;
  requiredBeforeDecision: string[];
  primaryIndicator: string | null;
  earliestReview: string | null;
  correctionTrigger: string | null;
  communicativeStatus: string | null;
  communicativeBoundary: string | null;
};

export type ProgrammePattern = {
  title: string;
  rationale: string | null;
  affectedKeys: string[];
};

export type ProgrammeModel = {
  summary: string;
  objective: string | null;
  implementationBoundary: string | null;
  policyDomains: string[];
  commitmentCount: number;
  commitments: ProgrammeCommitment[];
  centralImpactCommitmentKeys: string[];
  crossCuttingPatterns: ProgrammePattern[];
  communicationStatus: string | null;
  communicationEvidence: string[];
  communicationMeasurement: string[];
  communicationBoundary: string | null;
};

function parseTree(markdown: string): Node {
  const root: Node = { level: 0, title: "root", lines: [], children: [] };
  const stack: Node[] = [root];

  for (const rawLine of markdown.replace(/\r\n/g, "\n").split("\n")) {
    const heading = rawLine.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (!heading) {
      stack[stack.length - 1].lines.push(rawLine);
      continue;
    }
    const node: Node = {
      level: heading[1].length,
      title: heading[2].trim(),
      lines: [],
      children: [],
    };
    while (stack.length > 1 && stack[stack.length - 1].level >= node.level) stack.pop();
    stack[stack.length - 1].children.push(node);
    stack.push(node);
  }
  return root;
}

function direct(node: Node | null | undefined, title: string) {
  return node?.children.find((child) => child.title === title) ?? null;
}

function descendants(node: Node | null | undefined): Node[] {
  if (!node) return [];
  return node.children.flatMap((child) => [child, ...descendants(child)]);
}

function findNode(node: Node | null | undefined, title: string): Node | null {
  if (!node) return null;
  if (node.title === title) return node;
  for (const child of node.children) {
    const found = findNode(child, title);
    if (found) return found;
  }
  return null;
}

function field(node: Node | null | undefined, label: string): string | null {
  if (!node) return null;
  const prefix = `**${label}:**`;
  const hit = node.lines.find((line) => line.trim().startsWith(prefix));
  if (!hit) return null;
  const value = hit.trim().slice(prefix.length).trim();
  return clean(value);
}

function fieldDeep(node: Node | null | undefined, label: string): string | null {
  const local = field(node, label);
  if (local) return local;
  for (const child of descendants(node)) {
    const found = field(child, label);
    if (found) return found;
  }
  return null;
}

function fieldsDeep(node: Node | null | undefined, label: string): string[] {
  if (!node) return [];
  const nodes = [node, ...descendants(node)];
  return nodes.flatMap((entry) => {
    const prefix = `**${label}:**`;
    return entry.lines
      .map((line) => line.trim())
      .filter((line) => line.startsWith(prefix))
      .map((line) => clean(line.slice(prefix.length).trim()))
      .filter((value): value is string => Boolean(value));
  });
}

function list(node: Node | null | undefined) {
  if (!node) return [];
  return node.lines
    .map((line) => line.trim())
    .filter((line) => /^[-*+]\s+/.test(line))
    .map((line) => clean(line.replace(/^[-*+]\s+/, "")))
    .filter((value): value is string => Boolean(value));
}

function clean(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "`null`" || trimmed === "null" || /_Leere Liste\._/i.test(trimmed)) return null;
  return presentSaxonyAnhaltMarkdown(trimmed)
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/\bSDG_(\d+)\b/g, "SDG $1")
    .replace(/\bSDG_PLUS_([A-Z0-9_]+)\b/g, (_, code: string) => `WÖk-SDG+ ${code.toLowerCase().replaceAll("_", " ")}`)
    .trim();
}

const statusLabels: Record<string, string> = {
  CLEAR: "entscheidungsreif",
  CONDITIONAL: "bedingt entscheidungsreif",
  NOT_DECISION_READY: "noch nicht entscheidungsreif",
  COMPLETE: "vollständig fachlich geprüft",
  LIMITED: "begrenzte Evidenz",
  HIGH: "hohe Evidenz",
  MEDIUM: "mittlere Evidenz",
  LOW: "geringe Evidenz",
  INSUFFICIENT: "Evidenz nicht ausreichend",
  REVIEW_REQUIRED: "Schutzprüfung erforderlich",
  PASS: "keine materielle Grenzverletzung festgestellt",
  WATCH: "Schutzgrenze beobachten",
  BLOCK: "nicht kompensierbare Schutzgrenze berührt",
  OPEN: "offen - keine Null- oder Neutralbewertung",
  NOT_MATERIAL_IDENTIFIED: "keine eigenständige materielle Vorwirkung festgestellt",
  NO_HIGH_MATERIALITY_CLUSTER_IDENTIFIED_BY_SCREEN: "kein besonders materialer programmweiter Kommunikationspfad identifiziert",
  DATA_GAP_UNTIL_IMPLEMENTATION_DESIGN: "Datenlücke bis zur konkreten Ausgestaltung und Umsetzung",
  PARTLY_REVERSIBLE: "teilweise reversibel",
  FULLY_REVERSIBLE: "weitgehend reversibel",
  LOW_REVERSIBILITY: "nur begrenzt reversibel",
  MATERIAL_GAPS: "wesentliche Informationslücken",
  MATERIAL: "wesentlich",
  PLAUSIBLE_PATHS_NOT_OBSERVED_EFFECTS: "plausible Wirkpfade - noch keine beobachteten Wirkungen",
  EX_ANTE_PROGRAMME_COMMITMENT: "Ex-ante-Prüfung einer Programmzusage",
  LAND: "Land Sachsen-Anhalt",
  MULTI_LEVEL: "Mehr-Ebenen-Pfad zwischen Land, Bund und/oder EU",
};

export function publicProgrammeStatus(value: string | null | undefined, fallback = "fachlich offen") {
  if (!value) return fallback;
  const mapped = statusLabels[value] ?? publicSaxonyAnhaltLabel(value);
  if (mapped !== value) return mapped;
  if (/[a-zäöüß]/.test(value) && !value.includes("_")) return value;
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\bwoek\b/g, "WÖk")
    .replace(/^\p{Ll}/u, (letter) => letter.toLocaleUpperCase("de-DE"));
}

function headline(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= 170) return normalized;
  const shortened = normalized.slice(0, 167);
  const lastSpace = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, lastSpace > 110 ? lastSpace : shortened.length)}…`;
}

function parseRegister(registerMarkdown: string) {
  const root = parseTree(registerMarkdown);
  const commitments = findNode(root, "commitments");
  const map = new Map<string, {
    title: string | null;
    text: string | null;
    page: string | null;
    section: string | null;
    policyDomain: string | null;
    implementationLevel: string | null;
  }>();
  for (const entry of commitments?.children.filter((node) => /^Eintrag\s+\d+$/i.test(node.title)) ?? []) {
    const key = fieldDeep(entry, "commitment_key");
    if (!key) continue;
    map.set(key, {
      title: fieldDeep(entry, "title"),
      text: fieldDeep(entry, "commitment_text"),
      page: fieldDeep(entry, "page"),
      section: fieldDeep(entry, "section"),
      policyDomain: fieldDeep(entry, "policy_domain"),
      implementationLevel: fieldDeep(entry, "implementation_level"),
    });
  }
  return map;
}

function parseSdgs(node: Node | null) {
  if (!node) return [];
  return node.children
    .filter((child) => /^Eintrag\s+\d+$/i.test(child.title))
    .map((entry) => {
      const id = fieldDeep(entry, "id");
      const direction = fieldDeep(entry, "direction");
      return [id ? clean(id) : null, direction ? publicProgrammeStatus(direction) : null]
        .filter(Boolean)
        .join(" - ");
    })
    .filter(Boolean);
}

function parseImpactPotentials(node: Node | null): ProgrammeImpactPotential[] {
  if (!node) return [];
  const entries = node.children.filter((child) => /^Eintrag\s+\d+$/i.test(child.title));
  const candidates = entries.length ? entries : [node];
  return candidates.map((entry) => ({
    stateChange: fieldDeep(entry, "expected_state_change"),
    mechanism: fieldDeep(entry, "mechanism"),
    evidence: fieldDeep(entry, "evidence_status"),
    indicators: list(direct(entry, "indicators")),
  })).filter((item) => item.stateChange || item.mechanism);
}

function parseImpactRisks(node: Node | null): ProgrammeImpactRisk[] {
  if (!node) return [];
  const entries = node.children.filter((child) => /^Eintrag\s+\d+$/i.test(child.title));
  const candidates = entries.length ? entries : [node];
  return candidates.map((entry) => ({
    risk: fieldDeep(entry, "risk"),
    trigger: fieldDeep(entry, "trigger_or_condition"),
    affected: list(direct(entry, "affected_groups_or_goods")),
    evidence: fieldDeep(entry, "evidence_status"),
  })).filter((item) => item.risk);
}

function parseCommitment(entry: Node, index: number, register: ReturnType<typeof parseRegister>): ProgrammeCommitment | null {
  const key = fieldDeep(entry, "commitment_key");
  if (!key) return null;
  const registerEntry = register.get(key);
  const sourceText = fieldDeep(entry, "source_text") ?? registerEntry?.text ?? fieldDeep(entry, "decision_or_measure") ?? "Programmaussage";
  const measure = fieldDeep(entry, "decision_or_measure") ?? registerEntry?.title ?? sourceText;
  const readinessNode = direct(entry, "decision_readiness");
  const impactNode = direct(entry, "impact_potential");
  const riskNode = direct(entry, "impact_risks");
  const boundaryNode = direct(entry, "non_compensable_boundaries");
  const normativeNode = direct(entry, "normative_mapping");
  const impactOrdersNode = direct(entry, "impact_orders");
  const distributionNode = direct(entry, "distribution_and_time");
  const implementationNode = direct(entry, "implementation_and_capacity");
  const reversibilityNode = direct(entry, "reversibility_and_lock_in");
  const informationNode = direct(entry, "decision_information_gap");
  const monitoringNode = direct(entry, "monitoring_and_feedback");
  const communicationNode = direct(entry, "communicative_pre_effect");

  const impactPotentials = parseImpactPotentials(impactNode);
  const impactRisks = parseImpactRisks(riskNode);
  const boundaryStatuses = fieldsDeep(boundaryNode, "status");

  return {
    index,
    key,
    title: headline(registerEntry?.title ?? measure),
    sourceText,
    page: registerEntry?.page ?? fieldDeep(entry, "page"),
    section: registerEntry?.section ?? fieldDeep(entry, "section"),
    policyDomain: registerEntry?.policyDomain ? publicSaxonyAnhaltLabel(registerEntry.policyDomain) : null,
    implementationLevel: registerEntry?.implementationLevel ? publicProgrammeStatus(registerEntry.implementationLevel) : null,
    intendedChange: fieldDeep(entry, "intended_change"),
    readiness: fieldDeep(readinessNode, "status"),
    readinessLabel: publicProgrammeStatus(fieldDeep(readinessNode, "status")),
    missingParameters: list(direct(readinessNode, "missing_parameters")),
    responsibleActors: list(direct(entry, "responsible_actors")),
    affectedGroups: list(direct(entry, "affected_groups")),
    impactPotentials,
    impactRisks,
    boundaryConcerns: fieldsDeep(boundaryNode, "concern"),
    boundaryStatus: boundaryStatuses[0] ?? null,
    boundaryRationales: fieldsDeep(boundaryNode, "rationale"),
    human: list(direct(normativeNode, "human")),
    planet: list(direct(normativeNode, "planet")),
    democracy: list(direct(normativeNode, "democracy")),
    sdgs: parseSdgs(direct(normativeNode, "sdgs")),
    sdgPlus: parseSdgs(direct(normativeNode, "sdg_plus")),
    stateTargets: list(direct(normativeNode, "state_target_ids")),
    dataGaps: list(direct(entry, "data_gaps")),
    firstOrder: fieldDeep(impactOrdersNode, "first_order"),
    secondOrder: list(direct(impactOrdersNode, "second_order")),
    thirdOrder: fieldDeep(impactOrdersNode, "third_order"),
    distributionNote: fieldDeep(distributionNode, "benefit_and_burden_test"),
    shortTerm: fieldDeep(distributionNode, "short_term"),
    mediumTerm: fieldDeep(distributionNode, "medium_term"),
    longTerm: fieldDeep(distributionNode, "long_term"),
    intergenerationalRelevance: fieldDeep(distributionNode, "intergenerational_relevance"),
    implementationRequirements: list(direct(implementationNode, "requirements")),
    capacityStatus: fieldDeep(implementationNode, "capacity_status"),
    capacityNote: fieldDeep(implementationNode, "note"),
    reversibility: fieldDeep(reversibilityNode, "status"),
    reversibilityRationale: fieldDeep(reversibilityNode, "rationale"),
    informationGapStatus: fieldDeep(informationNode, "status"),
    requiredBeforeDecision: list(direct(informationNode, "required_before_binding_decision")),
    primaryIndicator: fieldDeep(monitoringNode, "primary_indicator"),
    earliestReview: fieldDeep(monitoringNode, "earliest_review"),
    correctionTrigger: fieldDeep(monitoringNode, "correction_trigger"),
    communicativeStatus: fieldDeep(communicationNode, "status"),
    communicativeBoundary: fieldDeep(communicationNode, "evidence_boundary"),
  };
}

export function buildSaxonyAnhaltProgrammeModel(reviewMarkdown: string, registerMarkdown: string): ProgrammeModel {
  const overview = saxonyAnhaltProgrammeOverview(reviewMarkdown);
  const reviewRoot = parseTree(reviewMarkdown);
  const register = parseRegister(registerMarkdown);
  const materialCommitments = findNode(reviewRoot, "material_commitments");
  const commitments = (materialCommitments?.children.filter((node) => /^Eintrag\s+\d+$/i.test(node.title)) ?? [])
    .map((entry, index) => parseCommitment(entry, index + 1, register))
    .filter((entry): entry is ProgrammeCommitment => Boolean(entry));

  const central = findNode(reviewRoot, "central_impact_paths");
  const centralImpactCommitmentKeys = list(central)
    .map((pathId) => pathId.replace(/-WP\d+$/i, ""))
    .filter((key) => commitments.some((commitment) => commitment.key === key));

  const crossCutting = findNode(reviewRoot, "cross_cutting_patterns");
  const crossCuttingPatterns = (crossCutting?.children.filter((node) => /^Eintrag\s+\d+$/i.test(node.title)) ?? [])
    .map((entry) => ({
      title: fieldDeep(entry, "pattern") ?? "Querschnittsmuster",
      rationale: fieldDeep(entry, "rationale"),
      affectedKeys: list(direct(entry, "affected_commitment_keys")),
    }));

  const communication = findNode(reviewRoot, "programme_level_communicative_pre_effect");

  return {
    summary: overview.summary,
    objective: overview.objective,
    implementationBoundary: overview.implementationBoundary ? clean(overview.implementationBoundary) : null,
    policyDomains: overview.policyDomains,
    commitmentCount: commitments.length || overview.commitmentCount || register.size,
    commitments,
    centralImpactCommitmentKeys,
    crossCuttingPatterns,
    communicationStatus: fieldDeep(communication, "status"),
    communicationEvidence: list(direct(communication, "source_evidence")),
    communicationMeasurement: list(direct(communication, "measurement_requirements")),
    communicationBoundary: fieldDeep(communication, "attribution_boundary"),
  };
}

export function summarizeStatuses(commitments: ProgrammeCommitment[]) {
  const count = (selector: (entry: ProgrammeCommitment) => string | null | undefined) => {
    const result = new Map<string, number>();
    for (const entry of commitments) {
      const value = selector(entry);
      if (!value) continue;
      result.set(value, (result.get(value) ?? 0) + 1);
    }
    return [...result.entries()].sort((a, b) => b[1] - a[1]);
  };

  return {
    readiness: count((entry) => entry.readiness),
    evidence: count((entry) => entry.impactPotentials.find((item) => item.evidence)?.evidence ?? null),
    boundaries: commitments.filter((entry) => entry.boundaryConcerns.length > 0 || Boolean(entry.boundaryStatus)).length,
    communication: commitments.filter((entry) => entry.communicativeStatus && !entry.communicativeStatus.toLocaleLowerCase("de-DE").includes("keine eigenständige materielle vorwirkung")).length,
  };
}
