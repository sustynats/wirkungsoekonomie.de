import { coverageLabels, getGovernmentPublicData } from "@/lib/government/public-data";
import { getImpactImportMeta, getPublicImpactCases } from "@/lib/government/impact-cases";

const sourceLabels: Record<string, string> = {
  BREG_CABINET_ARCHIVE: "Bundesregierung · Kabinett",
  MINISTRY_BMF: "Bundesministerium der Finanzen",
  MINISTRY_BMI: "Bundesministerium des Innern",
  MINISTRY_AA: "Auswärtiges Amt",
  MINISTRY_BMVg: "Bundesministerium der Verteidigung",
  MINISTRY_BMWE: "Bundesministerium für Wirtschaft und Energie",
  MINISTRY_BMFTR: "Bundesministerium für Forschung, Technologie und Raumfahrt",
  MINISTRY_BMJV: "Bundesministerium der Justiz und für Verbraucherschutz",
  MINISTRY_BMBFSFJ: "Bundesministerium für Bildung, Familie, Senioren, Frauen und Jugend",
  MINISTRY_BMAS: "Bundesministerium für Arbeit und Soziales",
  MINISTRY_BMDS: "Bundesministerium für Digitales und Staatsmodernisierung",
  MINISTRY_BMV: "Bundesministerium für Verkehr",
  MINISTRY_BMUKN: "Bundesministerium für Umwelt, Klimaschutz, Naturschutz und nukleare Sicherheit",
  MINISTRY_BMG: "Bundesministerium für Gesundheit",
  MINISTRY_BMLEH: "Bundesministerium für Landwirtschaft, Ernährung und Heimat",
  MINISTRY_BMZ: "Bundesministerium für wirtschaftliche Zusammenarbeit und Entwicklung",
  MINISTRY_BMWSB: "Bundesministerium für Wohnen, Stadtentwicklung und Bauwesen",
  DIP_API: "Dokumentations- und Informationssystem für Parlamentsmaterialien",
  RECHT_BUND_AND_GII: "Bundesrecht und amtliche Verkündungsinformationen",
  BKAmt: "Bundeskanzleramt",
};

function publicScopeLabel(scope: string) {
  const urls = scope.split(";").map((value) => value.trim()).filter((value) => value.startsWith("https://"));
  if (!urls.length) return scope;
  const hosts = [...new Set(urls.flatMap((value) => { try { return [new URL(value).hostname.replace(/^www\./, "")]; } catch { return []; } }))];
  return hosts.length ? `Amtlicher Web- oder Datenzugang: ${hosts.join(", ")}` : "Amtlicher Web- oder Datenzugang";
}

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
    <div className="government-table-wrap" role="region" aria-label="Abdeckung der amtlichen Regierungsquellen" tabIndex={0}><table><thead><tr><th>Quelle</th><th>Zeitraum</th><th>Gefunden / verarbeitet</th><th>Ungeklärt</th><th>Status</th></tr></thead><tbody>{coverage.sources.map((source) => <tr key={source.source_id}><th scope="row">{sourceLabels[source.source_id] ?? "Amtlicher Quellenraum"}<small>{publicScopeLabel(source.scope)}</small></th><td>{source.period_start} bis {source.period_end}</td><td>{source.found_records} / {source.processed_records}</td><td>{source.unexplained_items}</td><td>{coverageLabels[source.coverage_status] ?? "Status noch nicht öffentlich bezeichnet"}{source.note && <small>{source.note}</small>}</td></tr>)}</tbody></table></div>

    <h2>Was nicht öffentlich ausgespielt wird</h2>
    <ul className="government-principle-list"><li><strong>Ungeprüfte Kandidaten</strong><span>Der kanonische Arbeitsbestand ist kein Public Store.</span></li><li><strong>Offene Identitätsfragen</strong><span>Gemeinsame Drucksachen, Sitzungen oder ähnliche Titel führen nicht zu einem stillen Merge.</span></li><li><strong>Unbelegte Statusfortschreibung</strong><span>Eine Quelle wird nicht stärker formuliert, als sie selbst belegt.</span></li><li><strong>Automatische Wirkung</strong><span>Government Data erzeugt keine WÖk-Richtungen, Scores oder Personennoten.</span></li></ul>

    <h2>Bekannte Grenzen</h2>
    <p>{bestEffort} Quellenräume werden als Best effort für einen definierten amtlichen Suchraum geführt; {unavailable} Quellenräume waren am Datenstand technisch nicht vollständig erreichbar. Haushaltsvollzug, Förderung, Beschaffung, administrative Umsetzung und Beobachtungsdaten werden weiter angebunden. Der Umfang der noch nicht analysierten materiellen Wirkungsfälle ist derzeit nicht als belastbarer Nenner validiert; deshalb wird keine irreführende Prozentquote ausgegeben.</p>
    <p><strong>Datenstand:</strong> {coverage.as_of} · <strong>Faktenmodell:</strong> Government Data {coverage.data_version} · <strong>Fachrelease:</strong> {impactMeta.fachrelease}</p>
  </section>;
}
