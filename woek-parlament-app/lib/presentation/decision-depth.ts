import type { ParliamentaryCase } from "@/data/cases";
import { isGenericPublicEditorialText } from "@/lib/publication/public-editorial-projection.mjs";

export const decisionViews = [
  { id: "sachverhalt", label: "Sachverhalt" },
  { id: "wirkungsanalyse", label: "Wirkungsanalyse" },
  { id: "evidenz", label: "Evidenz & Grenzen" },
  { id: "quellen", label: "Quellen" },
  { id: "verlauf", label: "Verlauf" },
] as const;
export type DecisionView = typeof decisionViews[number]["id"];
const legacyViews: Record<string, DecisionView> = {
  ueberblick: "sachverhalt", wirkprofil: "wirkungsanalyse", wirkpfade: "wirkungsanalyse",
  normen: "wirkungsanalyse", berechnungen: "evidenz", fachakte: "evidenz",
};
export function resolveDecisionView(value?: string): DecisionView {
  return decisionViews.find(view => view.id === value)?.id ?? legacyViews[value ?? ""] ?? "sachverhalt";
}

/** Two existing editorial title fields. No machine-authored Fach translation.
 * Findings, qualifications and full evidence are identical in both modes. */
export function decisionReaderTitles(item: Pick<ParliamentaryCase, "plainTitle" | "title">) {
  return { verstaendlich: item.plainTitle, fachlich: item.title };
}

/** Published editorial introduction and original Fach wording from the SAME
 * record. Neither is paraphrased. Generic process copy is never a Fach intro.
 * The complete underlying analysis remains shared between both modes. */
export function decisionReaderParagraphs(item: Pick<ParliamentaryCase, "publicWorkingAct">) {
  const plain = item.publicWorkingAct?.editorialSummary?.keyStatement;
  if (!plain || isGenericPublicEditorialText(plain)) return null;
  const original = item.publicWorkingAct?.overallPotential;
  return { verstaendlich: plain, fachlich: original && !isGenericPublicEditorialText(original) ? original : plain };
}

export const chainStages = ["Entscheidung", "Umsetzung", "Zustandsveränderung", "Zurechnung"] as const;
export type ChainStage = typeof chainStages[number];
export type ChainEvidence = { stage: ChainStage; statement: string; sourceHref: string; evidenceLabel: string };
/** Only explicit stage-bound records may establish a stage. Parliamentary
 * status, a source count and an ex-ante hypothesis do NOT establish it. */
export function projectChain(records: readonly ChainEvidence[] = []) {
  return chainStages.map(stage => {
    const record = records.find(record => record.stage === stage && record.statement.trim() && record.sourceHref && record.evidenceLabel.trim());
    return { stage, record: record ?? null };
  });
}

export type ReviewedQuestion = { id: string; question: string; status: "ANSWERED" | "OPEN"; sourceHref: string | null };
export function questionCoverage(questions?: readonly ReviewedQuestion[]) {
  if (!questions?.length || new Set(questions.map(q => q.id)).size !== questions.length
    || questions.some(q => !q.id || !q.question.trim() || !["ANSWERED", "OPEN"].includes(q.status)
      || (q.status === "ANSWERED" && !q.sourceHref))) return null;
  return { answered: questions.filter(q => q.status === "ANSWERED").length, total: questions.length };
}

export type OfficialProcedureStep = { id: string; label: string; date: string | null; officialSourceHref: string | null };
export function verifiedProcedureSteps(steps?: readonly OfficialProcedureStep[]) {
  if (!steps?.length || new Set(steps.map(step => step.id)).size !== steps.length) return null;
  if (steps.some(step => !step.id || !step.label.trim() || (step.date !== null
    && (!/^\d{4}-\d{2}-\d{2}$/.test(step.date) || !step.officialSourceHref)))) return null;
  return steps;
}
