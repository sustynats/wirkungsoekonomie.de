import Link from "next/link";
import { formatElectionDate, governmentLifecycleLabel, lifecycleLabel, stateJurisdictions, stateSlug } from "@/lib/autopilot/registry";
import { statePublicContent } from "@/lib/states/public-content";
import { PortalSectionHeader } from "@/app/components/PortalLanding";
import { StateCartogram } from "@/app/components/StateCartogram";
import { InstitutionRegisterLink } from "@/app/components/InstitutionRegisterLink";

export const metadata = {
  title: "Bundesländer",
  description: "Transparenter Fachstatus für alle 16 Länder: Wahlprogramme, Regierungshandeln, Wirkungsanalysen, Vollständigkeit und offene Lücken."
};

const substantiveStateSlugs = new Set([...Object.keys(statePublicContent), "sachsen-anhalt"]);
const electionReviewSlugs = new Set(["berlin", "mecklenburg-vorpommern", "sachsen-anhalt"]);

function governmentStatus(jurisdiction: (typeof stateJurisdictions)[number]) {
  if (jurisdiction.government_lifecycle_state === "GOVERNMENT_MONITORING" && !jurisdiction.monitoring_enabled) {
    return "Fachmonitor angelegt - automatische Quellenaktualisierung noch nicht aktiv";
  }
  return governmentLifecycleLabel(jurisdiction.government_lifecycle_state);
}

export default function StatesPage() {
  const openStateCount = stateJurisdictions.length - substantiveStateSlugs.size;
  const operationalAdapterCount = stateJurisdictions.filter((jurisdiction) => jurisdiction.monitoring_enabled).length;
  return (
    <div className="shell content-page states-page">
      <PortalSectionHeader eyebrow="Bundesländer" title="16 Länder. Ein Prüfstandard. Unterschiedlicher Fachstand." lead="Die Übersichtsseite zeigt nicht nur, was vorhanden ist, sondern ebenso klar, was noch fehlt." />

      <section className="portal-area-visual" data-portal-area-visual aria-labelledby="states-cartogram-title"><h2 id="states-cartogram-title">Fachstand auf einen Blick</h2><StateCartogram /></section>
      <p><InstitutionRegisterLink level="land">Landesbezogene Akten im gemeinsamen Register</InstitutionRegisterLink></p>
      <details className="portal-context" id="states-coverage-context"><summary>Abdeckung, Grenzen und bisherigen Einführungstext lesen</summary>
      <p>Die Übersichtsseite zeigt nicht nur, was vorhanden ist, sondern ebenso klar, was noch fehlt. Eine registrierte Jurisdiktion ist keine fertige Wirkungsanalyse - und ein initialer Materialitätsreview ist keine vollständige Wahlprogrammanalyse.</p>
      <section className="notice" aria-labelledby="states-coverage-status">
        <strong id="states-coverage-status">{substantiveStateSlugs.size} Länder mit substanziellem öffentlichem Fachstand · {openStateCount} Länder ausdrücklich noch offen.</strong>
        <p>Sachsen-Anhalt ist die Blaupause für Wahlprogrammanalysen und erhält die neue Editorial-Schicht mit Gesamtzusammenfassung, Key Findings, Richtung und Evidenz. Baden-Württemberg und Rheinland-Pfalz besitzen initiale Regierungsfachreviews. Berlin und Mecklenburg-Vorpommern besitzen materialitätsorientierte Wahlprogrammreviews, aber noch keine vollständige Auswertung aller zugelassenen Programme. Für die übrigen Länder wird kein generischer Ersatztext als Analyse ausgegeben.</p>
        <p>Für {operationalAdapterCount} von {stateJurisdictions.length} Ländern ist im aktuellen Portalstand bereits ein vollständig operationalisierter amtlicher Quellenadapter nachgewiesen. Vorbereitete Wahl- und Fachbestände werden davon getrennt ausgewiesen.</p>
      </section>

      </details>
      <section className="states-principles" aria-label="Qualitätsregeln des Länderportals">
        <article><span aria-hidden="true">01</span><h2>Vollständigkeit sichtbar</h2><p>Quelle registriert, initial geprüft und vollständig analysiert sind unterschiedliche Reifestufen. Sie werden nicht mehr sprachlich vermischt.</p></article>
        <article><span aria-hidden="true">02</span><h2>Richtung braucht Begründung</h2><p>Positiv, negativ, ambivalent oder offen wird nur mit objektspezifischem Wirkpfad gezeigt. Evidenz bleibt davon getrennt.</p></article>
        <article><span aria-hidden="true">03</span><h2>Fehler fallen geschlossen</h2><p>Bei Quellkollision, falscher Zuordnung oder generischem Template bleibt die Kurzbewertung offen, bis die Fachprüfung korrigiert ist.</p></article>
      </section>

      <section className="section section-compact" aria-labelledby="states-active-title">
        <div className="section-heading"><div><p className="eyebrow">Fach- und Lebenszyklusstatus</p><h2 id="states-active-title">Jedes Land mit ehrlichem Reifestand</h2></div></div>
        <div className="state-card-grid">
          {stateJurisdictions.map((jurisdiction) => {
            const slug = stateSlug(jurisdiction.jurisdiction_id);
            const electionDate = formatElectionDate(jurisdiction.next_election_date);
            const publicContent = statePublicContent[slug];
            const isSachsenAnhalt = slug === "sachsen-anhalt";
            const hasSubstantiveContent = substantiveStateSlugs.has(slug);
            const hasElectionReview = electionReviewSlugs.has(slug);
            const status = isSachsenAnhalt
              ? "WAHLPROGRAMM-BLAUPAUSE IM EDITORIAL-RE-AUDIT"
              : publicContent?.review?.statusLabel ?? "KEIN ÖFFENTLICHER FACHREVIEW";
            const description = isSachsenAnhalt
              ? "Sechs Landtagswahlprogramme sind quellengebunden erschlossen. Die neue Lesefassung zeigt Gesamtbefund und redaktionell nachgeprüfte Schlüsselpfade; nicht verifizierte Alt-Templates bleiben fail-closed."
              : publicContent?.review?.shortLabel
                ? `${publicContent.review.shortLabel}. ${hasElectionReview ? "Der Bestand ist ausdrücklich noch keine vollständige Analyse aller zugelassenen Wahlprogramme." : "Es handelt sich um einen initialen freigegebenen Regierungsfachstand, nicht um eine vollständige Rückschau des Regierungsterms."}`
                : "Jurisdiktion und politischer Lebenszyklus sind registriert. Solange keine freigegebene Fachanalyse vorliegt, wird keine neutrale oder generische Ersatzbewertung erzeugt.";

            return <article className="state-card" key={jurisdiction.jurisdiction_id}>
              <p className="status-pill">{status}</p>
              <h3>{jurisdiction.name}</h3>
              <p>{description}</p>
              <p><strong>Regierungsachse:</strong> {governmentStatus(jurisdiction)}</p>
              <p><strong>Wahlachse:</strong> {lifecycleLabel(jurisdiction.election_cycle_state)}</p>
              <p><strong>Automatisierung:</strong> {jurisdiction.monitoring_enabled ? "laufende Quellenaktualisierung aktiv" : "noch nicht als operativer Adapter aktiviert"}</p>
              {electionDate ? <p className="state-card-date"><strong>{jurisdiction.date_precision === "SEASON_ONLY" ? "Nächstes amtliches Wahlzeitfenster" : "Nächster amtlicher Wahltermin"}</strong><span>{electionDate}</span></p> : <p className="state-card-date"><strong>Wahltermin</strong><span>im Register noch nicht amtlich bestätigt</span></p>}
              <Link className="text-link" href={`/laender/${slug}`}>{hasSubstantiveContent ? "Fachstand und offene Lücken öffnen" : "Länderstatus öffnen"} <span aria-hidden="true">→</span></Link>
            </article>;
          })}
        </div>
      </section>
    </div>
  );
}
