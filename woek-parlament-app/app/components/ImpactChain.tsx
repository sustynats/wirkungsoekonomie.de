import { projectChain, type ChainEvidence } from "@/lib/presentation/decision-depth";

export function ImpactChain({ evidence = [] }: { evidence?: readonly ChainEvidence[] }) {
  return <section className="decision-chain" aria-labelledby="decision-chain-title">
    <h2 id="decision-chain-title">Wirkpfad – wo das Wissen endet</h2>
    <ol>{projectChain(evidence).map(({ stage, record }, index) => <li key={stage} className={record ? "" : "is-open"}>
      <h3><span aria-hidden="true">{index + 1} · </span>{stage}</h3>
      <p>{record ? record.statement : "Separater Belegstand offen"}</p>
      {record ? <a href={record.sourceHref}>{record.evidenceLabel}</a> : <span className="chain-evidence"><span aria-hidden="true">?</span> Offen</span>}
    </li>)}</ol>
    <p className="decision-chain-boundary">Offen heißt hier: kein separat freigegebener Beleg für dieses Kettenglied in der Anzeige. Die vollständige Fallprüfung steht darunter.</p>
  </section>;
}
