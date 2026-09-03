import Link from "next/link";
import { WirkungsradarSignup } from "@/app/wirkungsradar-updates/WirkungsradarSignup";
import { subscriptionDeliveryReady } from "@/lib/wirkungsradar/subscriptions";

export const metadata = {
  title: "Parlamentsradar-Updates",
  description: "Nach bestätigter Anmeldung Hinweise zu bevorstehenden Entscheidungen, Wirkungschecks und Korrekturen erhalten."
};

export default function WirkungsradarUpdatesPage() {
  return (
    <div className="shell content-page">
      <header className="page-intro">
        <p className="eyebrow">Regelmäßige Hinweise auf Wunsch</p>
        <h1>Parlamentsradar-Updates</h1>
        <p className="lead">Sie erhalten eine kurze Nachricht, wenn eine prüfrelevante Entscheidung bevorsteht, ein Wirkungscheck veröffentlicht wird oder neue Evidenz eine wesentliche Korrektur erforderlich macht.</p>
      </header>
      <WirkungsradarSignup deliveryReady={subscriptionDeliveryReady()} />
      <section className="subscription-boundary" aria-labelledby="communication-boundary-title">
        <div><p className="eyebrow">Was Sie erhalten</p><h2 id="communication-boundary-title">Fachinformation statt Werbeverteiler.</h2></div>
        <div><p>Jede Nachricht enthält den politischen Gegenstand, den aktuellen Verfahrensstand, die wichtigste offene Wirkungsfrage und den Link zu Quellen und Analyse. Wenn an einem Tag mehrere freigegebene Änderungen veröffentlicht wurden, werden sie in höchstens einer Tagesübersicht gebündelt. Ohne verifizierte Neuerung gibt es keine Tagesmail.</p><p>Eine allgemeine Nachricht wird nur an bestätigte Anmeldungen versendet. Abgeordnete und Mandatsbüros werden nicht über eine bloße Erstkontaktmail in einen regelmäßigen Verteiler aufgenommen.</p></div>
      </section>
      <section className="method-grid subscription-facts" aria-label="Datenschutz bei Parlamentsradar-Updates">
        <article><span>01</span><h2>Datensparsam</h2><p>Für die Anmeldung genügen E-Mail-Adresse, gewählte Themen und der Nachweis der Einwilligung. Partei, Stimmverhalten oder Nutzungsverhalten gehören nicht in diesen Verteiler.</p></article>
        <article><span>02</span><h2>Nachweisbar</h2><p>Bestätigung, Einwilligungstext und Zeitpunkt werden geschützt dokumentiert. Ohne Bestätigung bleibt die Anmeldung inaktiv und wird fristgerecht gelöscht.</p></article>
        <article><span>03</span><h2>Ohne Tracking</h2><p>Weder Öffnungen noch individuelle Linkklicks, Pixel oder Interessenprofile werden erfasst. Technische Unzustellbarkeit und Abmeldungen dienen nur dem sicheren Versand.</p></article>
        <article><span>04</span><h2>Widerrufbar</h2><p>Jede Nachricht enthält eine unmittelbare Abmeldung. Eine Abmeldung wird als Sperre respektiert und nicht durch ein neues Webformular stillschweigend aufgehoben.</p></article>
      </section>
      <p className="page-return"><Link href="/">← Zur Portalstartseite</Link></p>
    </div>
  );
}
