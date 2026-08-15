import type { Metadata } from "next";
import Link from "next/link";
import { listPublishedMemberProfiles } from "@/lib/members/public-profiles";

export const metadata: Metadata = {
  title: "Abstimmungen im Wirkungscheck",
  description: "Amtlich belegte namentliche Abstimmungen neben transparenten, ex-ante wirkungsökonomischen Einordnungen."
};

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const profiles = await listPublishedMemberProfiles();
  return (
    <div className="shell content-page members-page">
      <header className="page-intro">
        <p className="eyebrow">Abstimmungen im Wirkungscheck · Deutscher Bundestag</p>
        <h1>Namentliche Abstimmungen im Zusammenhang sehen.</h1>
        <p className="lead">Profile zeigen ausschließlich amtlich veröffentlichte individuelle Stimmen bei namentlichen Abstimmungen. Sie setzen diese neben die damals verfügbare, transparent begründete WÖk-Einordnung – keine Bewertung von Menschen oder Gesinnungen.</p>
      </header>

      <section className="member-rules" aria-labelledby="member-rules-title">
        <div><p className="eyebrow">Vier Schutzregeln</p><h2 id="member-rules-title">Keine Rekonstruktion. Keine Rückschau-Strafe. Keine Rangliste.</h2></div>
        <ol>
          <li><strong>Nur namentliche Abstimmungen.</strong><span>Bei anderen Abstimmungen wird keine individuelle Stimme hergeleitet oder geschätzt.</span></li>
          <li><strong>Nur eindeutige Einordnungen.</strong><span>Ohne abstimmbare WÖk-Option wird eine Stimme nicht als übereinstimmend oder abweichend eingeordnet.</span></li>
          <li><strong>Ex ante zuerst.</strong><span>Die damalige Wissenslage bestimmt die Abstimmungsbilanz; spätere Evidenz bleibt eine getrennte Lernperspektive.</span></li>
          <li><strong>Vollständig nachprüfbar.</strong><span>Jeder Eintrag verlinkt künftig auf amtliche Abstimmung, Wirkungscheck, Quellen und Methode.</span></li>
        </ol>
      </section>

      <section className="section section-compact" aria-labelledby="profile-metric-title">
        <div className="section-heading"><div><p className="eyebrow">So wird eine Bilanz gelesen</p><h2 id="profile-metric-title">Ein Abgleich einzelner Stimmen, keine Gesamtbewertung eines Menschen.</h2></div></div>
        <div className="member-metric-grid">
          <article><h3>Einzelfall-Abgleich</h3><p>Jede abgegebene Stimme wird nur bei einer eindeutig abstimmbaren ex-ante Einordnung einzeln dokumentiert.</p></article>
          <article><h3>Abdeckung</h3><p>Die Zahl der auswertbaren Abstimmungen bleibt sichtbar, damit kleine Fallzahlen nicht irreführen.</p></article>
          <article><h3>Enthaltungen &amp; Nichtabstimmungen</h3><p>Sie werden getrennt ausgewiesen und nie automatisch als falsch gewertet.</p></article>
          <article><h3>Rückblick</h3><p>Spätere beobachtete Wirkung ergänzt das Bild, ändert aber nicht rückwirkend die ex-ante Bilanz.</p></article>
        </div>
      </section>

      <section className="notice notice-neutral"><strong>Amtlicher Aufbau läuft.</strong><p>Die Profile werden erst veröffentlicht, wenn sowohl die amtliche namentliche Abstimmung als auch die zugrundeliegende Wirkungsprüfung vollständig geprüft sind. Bis dahin gibt es keine Profile mit scheinbaren Kennzahlen.</p></section>
      {profiles.length > 0 && <section className="section section-compact" aria-labelledby="member-list-title">
        <div className="section-heading"><div><p className="eyebrow">Freigegebene Profile</p><h2 id="member-list-title">Namentliche Abstimmungen im Detail</h2></div></div>
        <div className="member-profile-grid">{profiles.map((profile) => <article key={profile.slug}>
          <p className="source-register-label">Amtliche Metadaten</p><h3>{profile.displayName}</h3>
          <p>{[profile.parliamentaryGroup, profile.constituency].filter(Boolean).join(" · ") || "Deutscher Bundestag"}</p>
          <Link className="text-link" href={`/abgeordnete/${profile.slug}`}>Abstimmungsbilanz ansehen <span aria-hidden="true">→</span></Link>
        </article>)}</div>
      </section>}
      <section className="notice"><strong>Bildnutzung ist einzeln geprüft.</strong><p>Porträts werden standardmäßig nicht übernommen. Ein Bild kann nur erscheinen, wenn die konkrete Bundestags-Bildseite eine passende Nutzung erlaubt, die Quellenangabe hinterlegt und die Nutzung nicht sinnentstellend ist.</p></section>
      <p className="page-return"><Link href="/">← Zur Portalstartseite</Link></p>
    </div>
  );
}
