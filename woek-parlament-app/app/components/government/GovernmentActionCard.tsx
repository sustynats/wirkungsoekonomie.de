import Link from "next/link";
import {
  actionTypeLabels,
  coverageLabels,
  formatDate,
  lifecycleLabels,
  readableInstitution,
  type GovernmentAction,
} from "@/lib/government/public-data";
import { impactCasesForGovernmentAction } from "@/lib/government/impact-cases";

export function GovernmentActionCard({ action }: { action: GovernmentAction }) {
  const impactCases = impactCasesForGovernmentAction(action.government_action_id);
  return (
    <article className="government-action-card">
      <div className="government-card-meta">
        <span className="chip chip--depth">{actionTypeLabels[action.action_type] ?? action.action_type}</span>
        <time dateTime={action.decision_date ?? undefined}>{formatDate(action.decision_date)}</time>
      </div>
      <h2><Link href={`/regierung/akte/${encodeURIComponent(action.government_action_id)}`}>{action.title}</Link></h2>
      <dl className="government-card-facts">
        <div><dt>Verfahrensstand</dt><dd>{lifecycleLabels[action.lifecycle_status] ?? action.lifecycle_status}</dd></div>
        <div><dt>Zuständig</dt><dd>{action.responsible_institutions.map(readableInstitution).join(", ") || "Institution noch nicht öffentlich zugeordnet"}</dd></div>
      </dl>
      <p className="coverage-line"><span aria-hidden="true">◌</span> {coverageLabels[action.coverage_scope_status] ?? action.coverage_scope_status}</p>
      <p className="analysis-line"><strong>Wirkungsanalyse:</strong> {impactCases.length ? `${impactCases.length} fachlich freigegebene ${impactCases.length === 1 ? "Analyse" : "Analysen"} verknüpft.` : "Noch nicht fachlich freigegeben. Diese Akte zeigt zunächst den amtlichen Sachverhalt."}</p>
      <Link className="text-link" href={`/regierung/akte/${encodeURIComponent(action.government_action_id)}`}>Regierungsakte öffnen</Link>
    </article>
  );
}
