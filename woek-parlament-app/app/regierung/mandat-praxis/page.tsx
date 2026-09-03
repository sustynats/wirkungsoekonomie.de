import Link from "next/link";
import { getGovernmentPublicData } from "@/lib/government/public-data";

export default function GovernmentMandatePage() {
  const { actions } = getGovernmentPublicData(); const parliamentary = actions.filter((row) => row.parliamentary_case_refs.length > 0);
  return <section className="section shell government-list-page">
    <p className="eyebrow">Koalitionsvertrag → Handeln → Umsetzung</p><h1>Mandat &amp; Praxis</h1>
    <p className="lead">Ein ähnlicher Titel beweist noch nicht, dass eine Koalitionszusage umgesetzt wurde. Dieser Bereich zeigt nur bestätigte Beziehungen und hält Zuordnung, Umsetzung und beobachtetes Ergebnis getrennt.</p>
    <div className="government-process-line" aria-label="Prüfkette"><span>Koalitionszusage</span><b aria-hidden="true">→</b><span>bestätigter Regierungsakt</span><b aria-hidden="true">→</b><span>Umsetzungsbeleg</span><b aria-hidden="true">→</b><span>Outcome-Beleg</span></div>
    <div className="notice notice-neutral"><strong>Fachlicher Status in Data 1.1</strong><p>Der öffentliche Export enthält {parliamentary.length.toLocaleString("de-DE")} Regierungsakte mit bestätigten parlamentarischen Fallbezügen. Koalitionszusagen werden im 1.1-Public-Store noch nicht als „erfüllt“ oder „nicht erfüllt“ ausgegeben. Die dafür nötige definierte Erfüllungslogik und die fachlich bestätigten Commitment-Bezüge sind ein gesonderter Arbeitsschritt.</p></div>
    <h2>Zulässige Statusstufen</h2>
    <ol className="government-status-steps"><li><strong>Keine bestätigte Zuordnung</strong><span>Es liegt noch kein belastbarer Bezug vor.</span></li><li><strong>Zuordnungskandidat</strong><span>Inhaltlich plausibel, aber fachlich noch nicht bestätigt.</span></li><li><strong>Bestätigter Bezug</strong><span>Quelle oder eindeutige sachliche Identität tragen die Beziehung.</span></li><li><strong>Umsetzung begonnen / belegt</strong><span>Konkrete Vollzugsschritte oder Outputs sind nachgewiesen.</span></li><li><strong>Wirkung noch offen / Outcome beobachtet</strong><span>Zustandsdaten und Zurechnung werden separat geprüft.</span></li></ol>
    <Link className="button button-primary" href="/mandat-und-praxis">Bestehende Wahlprogramm- und Koalitionsvertragsakten</Link>
  </section>;
}

