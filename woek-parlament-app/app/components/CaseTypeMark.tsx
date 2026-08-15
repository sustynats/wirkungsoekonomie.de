import type { CaseKind, PublicMaturityStatus } from "@/data/cases";
import { CalendarIcon, CheckCircleIcon, HistoryIcon, PathIcon } from "@/app/components/icons";
import { caseKindLabel } from "@/lib/presentation/labels";
import { workingActMaturityLabel } from "@/app/components/WorkingActExplainer";

type Props = {
  kind: CaseKind | "FACHANALYSE";
  maturity?: PublicMaturityStatus;
  compact?: boolean;
};

/**
 * A small, repeated visual cue for the type of a case. The label stays in the
 * accessibility tree, but it does not burden the page title with a prefix.
 */
export function CaseTypeMark({ kind, maturity, compact = false }: Props) {
  const label = maturity ? workingActMaturityLabel(maturity) : kind === "FACHANALYSE" ? "Fachanalyse" : caseKindLabel(kind);
  const Icon = maturity ? PathIcon : kind === "RADAR" ? CalendarIcon : kind === "RETROSPECTIVE_CASE" ? HistoryIcon : CheckCircleIcon;
  return <span className={`case-type-mark${compact ? " case-type-mark--compact" : ""}`}><Icon aria-hidden="true" /><span>{label}</span></span>;
}
