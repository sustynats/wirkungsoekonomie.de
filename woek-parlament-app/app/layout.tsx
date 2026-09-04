import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { canonicalPortalHref } from "@/lib/navigation";
import { PortalNav } from "@/app/components/PortalNav";
import { PortalWayfinding } from "@/app/components/PortalWayfinding";
import { WirkungsradarQuickSignup } from "@/app/components/WirkungsradarQuickSignup";
import { AudienceModeSwitch } from "@/app/components/AudienceModeSwitch";
import { WirkungsraumLink } from "@/app/components/WirkungsraumLink";
import { SiteAnalyticsTracker } from "@/app/components/SiteAnalyticsTracker";
import { subscriptionDeliveryReady } from "@/lib/wirkungsradar/subscriptions";
import "./globals.css";
import "./impact-signature.css";
import "./register.css";
import "./navigation.css";

export const metadata: Metadata = {
  title: { default: "Wirkungsportal Parlament", template: "%s · Wirkungsportal Parlament" },
  description: "Ein unabhängiges Portal des Instituts für Wirkungsökonomie zu Entscheidungen des Deutschen Bundestages.",
  metadataBase: new URL("https://parlament.wirkungsoekonomie.de"),
  applicationName: "Wirkungsportal Parlament",
  authors: [{ name: "Institut für Wirkungsökonomie", url: "https://wirkungsoekonomie.de" }],
  creator: "Institut für Wirkungsökonomie",
  publisher: "Institut für Wirkungsökonomie",
  ...(process.env.GOVERNMENT_STAGING === "1"
    ? { robots: { index: false, follow: false, nocache: true } }
    : {})
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await connection();
  return (
    <html lang="de" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#content">Zum Inhalt springen</a>
        <SiteAnalyticsTracker />
        <header>
          <div className="trust-band">
            <div className="shell trust-band-inner">
              <span>Unabhängiges Portal des Instituts für Wirkungsökonomie</span>
              <span aria-hidden="true">·</span>
              <Link href={canonicalPortalHref("/transparenz")}>Parteiunabhängig</Link>
              <span aria-hidden="true">·</span>
              <Link href={canonicalPortalHref("/methodik")}>Methodik offen</Link>
              <span aria-hidden="true">·</span>
              <Link href={canonicalPortalHref("/quellen")}>Quellen prüfbar</Link>
            </div>
          </div>
          <div className="site-header">
            <div className="shell header-inner">
              <Link href={canonicalPortalHref("/")} className="brand" aria-label="Wirkungsportal Parlament, Startseite">
                <span className="brand-mark" aria-hidden="true">W</span>
                <span><strong>Wirkungsportal Parlament</strong><small>Parlamentarische Entscheidungen verstehen · Wirkungen prüfen · Entscheidungen rückkoppeln</small></span>
              </Link>
              <nav className="portal-utility-nav" aria-label="Schnellzugriffe">
                <Link href={canonicalPortalHref("/suche")}>Suche</Link>
                <WirkungsraumLink>Merkliste</WirkungsraumLink>
                <Link href={canonicalPortalHref("/aktuell/radar-abo")}>Radar abonnieren</Link>
                <AudienceModeSwitch />
                <a className="ecosystem-link" href="https://wirkungsoekonomie.de">Wirkungsökonomie.de <span aria-hidden="true">↗</span></a>
              </nav>
              <PortalNav />
            </div>
          </div>
        </header>
        <main id="content"><PortalWayfinding />{children}</main>
        <footer className="site-footer">
          <div className="shell">
            <section className="footer-signup" aria-labelledby="footer-signup-title">
              <div>
                <p className="eyebrow">Auf Wunsch informiert bleiben</p>
                <h2 id="footer-signup-title">Parlamentsradar-Updates per E-Mail</h2>
                <p>Kurze Hinweise zu anstehenden Entscheidungen und veröffentlichten Wirkungschecks. Sie entscheiden selbst, welche Themen Sie erhalten möchten.</p>
              </div>
              <WirkungsradarQuickSignup deliveryReady={subscriptionDeliveryReady()} />
            </section>
          </div>
          <div className="shell footer-grid">
            <div>
              <p className="eyebrow">Einordnung statt Parteibewertung</p>
              <h2>Vorher verstehen. Danach prüfen, was sich verändert.</h2>
              <p>Das Portal ist kein Angebot des Deutschen Bundestages. Es bewertet weder Menschen, Parteien noch Gesinnungen. Sein Maßstab, seine Quellen und seine Grenzen bleiben offen einsehbar; politische Entscheidungen trifft das Parlament.</p>
            </div>
            <div className="footer-links">
              <nav aria-label="Analyse" className="footer-nav">
                <h2>Analyse</h2>
                <Link href={canonicalPortalHref("/bevorstehend")}>Anstehende Entscheidungen</Link>
                <Link href={canonicalPortalHref("/entscheidungen")}>Entscheidungen</Link>
                <Link href={canonicalPortalHref("/historie")}>Historie</Link>
                {process.env.GOVERNMENT_STAGING === "1" && <Link href={canonicalPortalHref("/regierung")}>Regierungshandeln</Link>}
                <Link href={canonicalPortalHref("/fachanalysen")}>WÖk-Fachanalysen</Link>
                <Link href={canonicalPortalHref("/monitor")}>Wirkungsmonitor</Link>
              </nav>
              <nav aria-label="Transparenz" className="footer-nav">
                <h2>Transparenz</h2>
                <Link href={canonicalPortalHref("/methodik")}>Methodik</Link>
                <Link href={canonicalPortalHref("/transparenz")}>Über das Portal</Link>
                <Link href={canonicalPortalHref("/quellen")}>Quellenarchiv</Link>
                <Link href={canonicalPortalHref("/mandat-und-praxis")}>Wahlprogramme &amp; Koalition</Link>
                <Link href={canonicalPortalHref("/abgeordnete")}>Abstimmungen im Wirkungscheck</Link>
              </nav>
              <nav aria-label="Kontakt" className="footer-nav">
                <h2>Kontakt</h2>
                <Link href={canonicalPortalHref("/wirkungsradar-updates")}>Parlamentsradar-Updates</Link>
                <Link href={canonicalPortalHref("/suche")}>Suche</Link>
                <WirkungsraumLink>Mein Wirkungsraum</WirkungsraumLink>
                <a href="mailto:wirkungscheck@wirkungsoekonomie.de?subject=Fehler%20oder%20Korrektur">Fehler oder Korrektur melden</a>
                <a href="mailto:wirkungscheck@wirkungsoekonomie.de?subject=Quelle%20oder%20Evidenz">Quelle oder Evidenz einreichen</a>
                <a href="mailto:wirkungscheck@wirkungsoekonomie.de?subject=Methodische%20Frage">Methodische Frage stellen</a>
                <a href="https://wirkungsoekonomie.de/impressum.html">Impressum</a>
                <a href="https://wirkungsoekonomie.de/datenschutz.html">Datenschutz</a>
                <a href="mailto:wirkungscheck@wirkungsoekonomie.de">wirkungscheck@wirkungsoekonomie.de</a>
              </nav>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
