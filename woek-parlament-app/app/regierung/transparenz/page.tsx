import { coverageLabels, getGovernmentPublicData } from "@/lib/government/public-data";
import { getImpactImportMeta, getPublicImpactCases } from "@/lib/government/impact-cases";

export default function GovernmentTransparencyPage() {
  const { actions, coverage } = getGovernmentPublicData();
  const impactCases = getPublicImpactCases();
  const impactMeta = getImpactImportMeta();
  const bestEffort = coverage.sources.filter((row) => row.coverage_status === "BEST_EFFORT_DEFINED_SOURCE_SCOPE").length;
  const unavailable = coverage.sources.filter((row) => row.coverage_status === "SOURCE_UNAVAILABLE").length;
  const realityChecks = impactCases.filter((record) => record.analysis_mode === "IMPACT_REALITY_CHECK").length;
  const highMateriality = impactCases.filter((record) => String(record.materiality).startsWith("HIGH")).length;
  return <section className="section shell government-transparency-page">
    <p className="eyebrow">Quellen, Abdeckung und Grenzen</p><h1>Transparenz der Regierungsdaten</h1>
    <p className="lead">Die Wirkungsökonomie ist eine unabhängige Initiative. Ihre Analysen sind keine amtlichen Bewertungen. Amtliche Fakten, fachliche Wirkungsanalyse, Modellannahmen, Datenlücken und Änderungen werden getrennt ausgewiesen.</p>

    <h2>Faktenabdeckung - Government Data 1.2</h2>
    <div className="government-stat-band"><div><strong>{actions.length.toLocaleString("de-DE")}</strong><span>objektweise freigegebene Faktenakten</span></div><div><strong>{coverage.counts?.government_actions_total.toLocaleString("de-DE") ?? "offen"}</strong><span>kanonische und offene Objekte</span></div><div><strong>{coverage.counts?.government_actions_review.toLocaleString("de-DE") ?? "offen"}</strong><span>nicht veröffentlichte Prüffälle</span></div><div><strong>{coverage.counts?.multi_dip_clusters_split ?? "offen"}</strong><span>aufgelöste Mehrfach-DIP-Cluster</span></div></div>
    <div className="notice"><strong>Vollständigkeit braucht einen Nenner</strong><p>{coverage.disclaimer}</p></div>

    <h2>Wirkungsabdeckung - Fachrelease 2.0</h2>
    <div className="government-stat-band"><div><strong>{impactCases.length}</strong><span>fachlich freigegebene Wirkungsfälle</span></div><div><strong>{highMateriality}</strong><span>davon mit hoher Materialität</span></div><div><strong>{realityChecks}</strong><span>mit vorgesehener Reality-Check-Stufe</span></div><div><strong>{impactMeta.fach_content_loss}</strong><span>verlorene Fachinhalte beim Import</span></div></div>
    <p><strong>Faktenabdeckung ist nicht Wirkungsabdeckung.</strong> {actions.length.toLocaleString("de-DE")} veröffentlichte amtliche Regierungshandlungen bedeuten nicht {actions.length.toLocaleString("de-DE")} bewertete Maßnahmen. Ein WÖk-Wirkungsfall kann mehrere Prozessobjekte verbinden; ein Omnibusvorhaben kann umgekehrt mehrere Wirkungsgegenstände enthalten.</p>
    <p>{impactMeta.note}</p>

    <h2>Abdeckung nach amtlichem Quellenraum</h2>
    <div className="government-table-wrap"><table><thead><tr><th>Quelle</th><th>Zeitraum</th><th>Gefunden / verarbeitet</th><th>Ungeklärt</th><th>Status</th></tr></thead><tbody>{coverage.sources.map((source) => <tr key={source.source_id}><th scope="row">{source.source_id}<small>{source.scope}</small></th><td>{source.period_start} bis {source.period_end}</td><td>{source.found_records} / {source.processed_records}</td><td>{source.unexplained_items}</td><td>{coverageLabels[source.coverage_status] ?? source.coverage_status}{source.note && <small>{source.note}</small>}</td></tr>)}</tbody></table></div>

    <h2>Was nicht öffentlich ausgespielt wird</h2>
    <ul className="government-principle-list"><li><strong>Ungeprüfte Kandidaten</strong><span>Der kanonische Arbeitsbestand ist kein Public Store.</span></li><li><strong>Offene Identitätsfragen</strong><span>Gemeinsame Drucksachen, Sitzungen oder ähnliche Titel führen nicht zu einem stillen Merge.</span></li><li><strong>Unbelegte Statusfortschreibung</strong><span>Eine Quelle wird nicht stärker formuliert, als sie selbst belegt.</span></li><li><strong>Automatische Wirkung</strong><span>Government Data erzeugt keine WÖk-Richtungen, Scores oder Personennoten.</span></li></ul>

    <h2>Bekannte Grenzen</h2>
    <p>{bestEffort} Quellenräume werden als Best effort für einen definierten amtlichen Suchraum geführt; {unavailable} Quellenräume waren am Datenstand technisch nicht vollständig erreichbar. Haushaltsvollzug, Förderung, Beschaffung, administrative Umsetzung und Beobachtungsdaten werden weiter angebunden. Der Umfang der noch nicht analysierten materiellen Wirkungsfälle ist derzeit nicht als belastbarer Nenner validiert; deshalb wird keine irreführende Prozentquote ausgegeben.</p>
    <p><strong>Datenstand:</strong> {coverage.as_of} · <strong>Faktenmodell:</strong> Government Data {coverage.data_version} · <strong>Fachrelease:</strong> {impactMeta.fachrelease}</p>
  </section>;
}
