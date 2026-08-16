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

type FederalDirectionSummary = {
  commitments: number;
  impactPaths: number;
  risks: number;
  directed: number;
  counts: { positive: number; negative: number; ambivalent: number; open: number };
  strongestTargets: Array<{ direction: string; name: string; count: number }>;
  resultHeadline: string;
  resultTeaser: string;
  potentialHighlights: string[];
  riskHighlights: string[];
  conditions: string[];
};

function federalDirectionalHighlights(summary: FederalDirectionSummary) {
  const findings: NonNullable<ReviewShape["directionalHighlights"]> = [];
  const targetsFor = (direction: string) => summary.strongestTargets.filter((item) => item.direction === direction).map((item) => `${item.name} (${item.count})`).join(", ");
  if (summary.counts.positive) findings.push({
    direction: "POSITIVE_POTENTIAL",
    title: `${summary.counts.positive} Zusagen mit ausdrücklich positivem Zielpotenzial`,
    summary: targetsFor("POSITIVE_POTENTIAL") || "Positive Zielbezüge sind in der Fachquelle ausdrücklich ausgewiesen.",
    rationale: "Die Zahl bezeichnet Zusagen, bei denen mindestens ein zugeordneter Zielbereich bereits ausdrücklich als positives Wirkungspotenzial gekennzeichnet ist. Sie belegt weder den Eintritt der Wirkung noch eine positive Netto-Wirkung des gesamten Programms: Risiken, Verteilung, Umsetzbarkeit, Gegenfaktum und Schutzgrenzen bleiben je Zusage gesondert zu prüfen."
  });
  if (summary.counts.negative) findings.push({
    direction: "NEGATIVE_RISK",
    title: `${summary.counts.negative} Zusagen mit ausdrücklich negativem Zielbezug`,
    summary: targetsFor("NEGATIVE_RISK") || "Negative Zielbezüge sind in der Fachquelle ausdrücklich ausgewiesen.",
    rationale: "Die Fachquelle weist bei diesen Zusagen mindestens einen negativen Bezug zu einem Nachhaltigkeits- oder Schutzbereich aus. Gemeint ist ein fachlich begründetes Ex-ante-Risiko, nicht bereits beobachtete Wirkung und keine Gesamtbewertung des Programms. Die vollständige Fachakte zeigt je Programmpunkt, welche Zustandsänderung, Risikopfade, Betroffenen und offenen Bedingungen hinter der Zuordnung stehen."
  });
  if (summary.counts.ambivalent) findings.push({
    direction: "AMBIVALENT",
    title: `${summary.counts.ambivalent} Zusagen mit gegenläufigen Zielbezügen`,
    summary: targetsFor("AMBIVALENT") || "Gegenläufige Zielbezüge sind in der Fachquelle ausdrücklich ausgewiesen.",
    rationale: "Bei diesen Zusagen zeigen die zugeordneten Zielbereiche nicht in dieselbe Richtung. Positive Potenziale und negative Folgen dürfen deshalb weder zu einer Durchschnittsnote verrechnet noch durch ein einziges Farbsignal verdeckt werden. Entscheidend sind konkrete Ausgestaltung, Verteilung, Vollzug, mögliche Schutzgrenzen und die Alternative, mit der die Maßnahme verglichen wird."
  });
  if (summary.counts.open) findings.push({
    direction: "OPEN",
    title: `${summary.counts.open} Zusagen mit noch offener Gesamt-Richtung`,
    summary: "Offen bedeutet nicht neutral: Die bisherige Fachquelle reicht noch nicht für eine belastbare positive oder negative Gesamt-Richtung.",
    rationale: "Für diese Zusagen sind politische Absicht, mögliche Wirkpfade und Risiken dokumentiert, aber mindestens Ausgangszustand, Reichweite, betroffene Gruppen, Gegenfaktum, Finanzierung oder Vollzug bleiben unzureichend bestimmt. Eine Richtung wird deshalb nicht aus Zielworten oder Ausgabenvolumen abgeleitet. Die lange Fachakte benennt pro Programmpunkt, welche Information vor einer belastbaren Richtungszuordnung fehlt."
  });
  return findings;
}

export async function readProgrammeSummary(entry: FachakteDescriptor) {
  const [indexText, federalDirectionText] = await Promise.all([
    readFile(path.join(publicFachakteRoot, "index.json"), "utf8"),
    readFile(path.join(publicFachakteRoot, "federal-direction-summary.json"), "utf8").catch(() => '{"programmes":{}}')
  ]);
  const index = JSON.parse(indexText) as { programmes: Record<string, ReviewShape>; cases: Record<string, ReviewShape> };
  const federalDirections = (JSON.parse(federalDirectionText) as { programmes?: Record<string, FederalDirectionSummary> }).programmes ?? {};
  const review = entry.caseId ? index.cases[entry.caseId] : index.programmes[entry.sourceKey];
  if (!review) return null;
  const directionReviewPending = review.directionReviewPending === true;
  const federalDirection = federalDirections[entry.sourceKey];
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
    resultHeadline: federalDirection?.resultHeadline ?? review.resultHeadline ?? (directionReviewPending ? "Quellenbestand vollständig – Wirkungsrichtungen noch nicht fachlich freigegeben." : undefined),
    resultTeaser: federalDirection?.resultTeaser ?? review.resultTeaser ?? (directionReviewPending ? "Die Akte erschließt alle gelieferten Zusagen und mögliche Wirkpfade. Sie behauptet noch kein fertiges Wirkungsurteil: Jede Richtung muss an der konkreten Zustandsänderung und dem veröffentlichten Referenzrahmen hergeleitet werden." : undefined),
    potentialHighlights: federalDirection?.potentialHighlights ?? review.potentialHighlights ?? (directionReviewPending ? ["Mögliche Wirkpfade sind dokumentiert. Ob sie Ziele und Schutzgüter stärken oder schwächen, wird für jede Zusage getrennt geprüft."] : []),
    riskHighlights: federalDirection?.riskHighlights ?? review.riskHighlights ?? (directionReviewPending ? ["Ein politisches Ziel, eine Ausgabe oder eine Reichweitenangabe belegt für sich weder positive Wirkung noch positive Netto-Wirkung."] : []),
    conditions: federalDirection?.conditions ?? review.conditions ?? (directionReviewPending ? ["Benötigt werden je Zusage eine freigegebene Richtungszuordnung, Baseline, Gegenfaktum, Verteilungsprüfung, Evidenzgrenze und gegebenenfalls Berechnungsdaten."] : []),
    communicationNote: review.communicationNote,
    directionalHighlights: federalDirection ? federalDirectionalHighlights(federalDirection) : review.directionalHighlights ?? pendingDirection
  };
}
