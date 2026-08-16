import { readFile } from "node:fs/promises";
import path from "node:path";

export type FachakteDescriptor = {
  id: string;
  title: string;
  eyebrow: string;
  sourceKey: string;
  caseId?: string;
};

const publicFachakteRoot = path.join(process.cwd(), "data", "fachakten", "public");

export const saxonyProgrammeAnalyses: FachakteDescriptor[] = [
  ["cdu", "CDU Sachsen-Anhalt", "Wahlprogramm im Wirkungscheck"],
  ["spd", "SPD Sachsen-Anhalt", "Wahlprogramm im Wirkungscheck"],
  ["gruene", "BÜNDNIS 90/DIE GRÜNEN Sachsen-Anhalt", "Wahlprogramm im Wirkungscheck"],
  ["linke", "DIE LINKE Sachsen-Anhalt", "Wahlprogramm im Wirkungscheck"],
  ["afd", "AfD Sachsen-Anhalt", "Wahlprogramm im Wirkungscheck"],
  ["bsw", "BSW Sachsen-Anhalt", "Wahlprogramm im Wirkungscheck"]
].map(([shortKey, title, eyebrow]) => ({
  id: `sachsen-anhalt-${shortKey}`,
  title,
  eyebrow,
  sourceKey: `ltw-2026-st-${shortKey}`
}));

export const federalProgrammeAnalyses: FachakteDescriptor[] = [
  ["btw-2025-cdu-csu", "CDU/CSU – Bundestagswahlprogramm 2025"],
  ["btw-2025-spd", "SPD – Regierungsprogramm 2025"],
  ["btw-2025-gruene", "BÜNDNIS 90/DIE GRÜNEN – Regierungsprogramm 2025"],
  ["btw-2025-linke", "DIE LINKE – Wahlprogramm 2025"],
  ["btw-2025-afd", "AfD – Wahlprogramm 2025"],
  ["btw-2025-ssw", "SSW – Wahlprogramm 2025"],
  ["coalition-2025-cdu-csu-spd", "Koalitionsvertrag für die 21. Legislaturperiode"]
].map(([sourceKey, title]) => ({
  id: `bund-${sourceKey}`,
  title,
  eyebrow: "Programm und Vereinbarung im Wirkungscheck",
  sourceKey
}));

export const fachakten = [...saxonyProgrammeAnalyses, ...federalProgrammeAnalyses];

export function fachakteById(id: string) {
  const listed = fachakten.find((entry) => entry.id === id);
  if (listed) return listed;
  if (!id.startsWith("case-")) return null;
  const caseId = id.slice("case-".length);
  if (!/^[0-9a-f-]{36}$/i.test(caseId)) return null;
  return {
    id,
    title: "Vollständige Wirkungsakte",
    eyebrow: "Entscheidung im Wirkungscheck",
    sourceKey: caseId,
    caseId
  } satisfies FachakteDescriptor;
}

type ReviewShape = {
  title?: string;
  summary?: string;
  commitments?: number;
  impactPaths?: number;
  calculations?: number;
  dataGaps?: number;
  domains?: number;
  plain_language_summary?: string;
  public_summary?: { headline?: string; key_statement?: string };
  material_commitments?: unknown[];
  central_impact_paths?: unknown[];
  impact_paths?: unknown[];
  calculation_requirements?: unknown[];
  data_gaps?: unknown[];
  programme_profile?: { material_policy_domains?: unknown[] };
  resultHeadline?: string;
  resultTeaser?: string;
  potentialHighlights?: string[];
  riskHighlights?: string[];
  conditions?: string[];
  communicationNote?: string;
  directionReviewPending?: boolean;
  directionalHighlights?: Array<{ direction: "POSITIVE_POTENTIAL" | "NEGATIVE_RISK" | "AMBIVALENT" | "OPEN"; title: string; summary?: string; rationale: string }>;
};

export async function readProgrammeSummary(entry: FachakteDescriptor) {
  const index = JSON.parse(await readFile(path.join(publicFachakteRoot, "index.json"), "utf8")) as { programmes: Record<string, ReviewShape>; cases: Record<string, ReviewShape> };
  const review = entry.caseId ? index.cases[entry.caseId] : index.programmes[entry.sourceKey];
  if (!review) return null;
  const directionReviewPending = review.directionReviewPending === true;
  const pendingDirection = directionReviewPending ? [{
    direction: "OPEN" as const,
    title: "Fachliche Richtungszuordnung noch nicht freigegeben",
    summary: `${Array.isArray(review.material_commitments) ? review.material_commitments.length : review.commitments ?? 0} quellengebundene Zusagen sind erschlossen. Ihre Wirkungsrichtung bleibt bis zur Einzelprüfung offen – nicht neutral.`,
    rationale: "Die vollständige Fachakte dokumentiert Quelle, Zusage und mögliche Wirkpfade. Daraus folgt noch keine positive oder negative Wirkung: Dafür müssen je Zusage der konkrete Zustandsunterschied gegenüber dem Gegenfaktum, betroffene Gruppen, Reichweite, Umsetzungsbedingungen, Risiken, SDG-/SDG+-Bezug und Schutzgrenzen fachlich geprüft werden. Bis diese Zuordnung freigegeben ist, wäre jede pauschale Richtung eine nicht belegte Verkürzung."
  }] : [];
  return {
    title: review.public_summary?.headline ?? review.title,
    summary: review.plain_language_summary ?? review.public_summary?.key_statement ?? review.summary ?? "Die vollständige Fachakte steht mit Quellen, Wirkpfaden, Risiken und offenen Datenfragen bereit.",
    commitments: Array.isArray(review.material_commitments) ? review.material_commitments.length : review.commitments ?? 0,
    impactPaths: Array.isArray(review.central_impact_paths) ? review.central_impact_paths.length : Array.isArray(review.impact_paths) ? review.impact_paths.length : review.impactPaths ?? 0,
    calculations: Array.isArray(review.calculation_requirements) ? review.calculation_requirements.length : review.calculations ?? 0,
    dataGaps: Array.isArray(review.data_gaps) ? review.data_gaps.length : review.dataGaps ?? 0,
    domains: Array.isArray(review.programme_profile?.material_policy_domains) ? review.programme_profile.material_policy_domains.length : review.domains ?? 0,
    resultHeadline: review.resultHeadline ?? (directionReviewPending ? "Quellenbestand vollständig – Wirkungsrichtungen noch nicht fachlich freigegeben." : undefined),
    resultTeaser: review.resultTeaser ?? (directionReviewPending ? "Die Akte erschließt alle gelieferten Zusagen und mögliche Wirkpfade. Sie behauptet noch kein fertiges Wirkungsurteil: Jede Richtung muss an der konkreten Zustandsänderung und dem veröffentlichten Referenzrahmen hergeleitet werden." : undefined),
    potentialHighlights: review.potentialHighlights ?? (directionReviewPending ? ["Mögliche Wirkpfade sind dokumentiert. Ob sie Ziele und Schutzgüter stärken oder schwächen, wird für jede Zusage getrennt geprüft."] : []),
    riskHighlights: review.riskHighlights ?? (directionReviewPending ? ["Ein politisches Ziel, eine Ausgabe oder eine Reichweitenangabe belegt für sich weder positive Wirkung noch positive Netto-Wirkung."] : []),
    conditions: review.conditions ?? (directionReviewPending ? ["Benötigt werden je Zusage eine freigegebene Richtungszuordnung, Baseline, Gegenfaktum, Verteilungsprüfung, Evidenzgrenze und gegebenenfalls Berechnungsdaten."] : []),
    communicationNote: review.communicationNote,
    directionalHighlights: review.directionalHighlights ?? pendingDirection
  };
}
