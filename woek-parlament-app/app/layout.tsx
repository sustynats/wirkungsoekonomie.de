import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import { PortalNav } from "@/app/components/PortalNav";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "parlament.wirkungsoekonomie.de";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  return {
    metadataBase: new URL(`${protocol}://${host}`),
    title: { default: "Wirkungsportal Parlament", template: "%s | Wirkungsportal Parlament" },
    description: "Das Wirkungsportal Parlament zeigt, was politische Entscheidungen bewirken könnten – mit Quellen, Rechenwegen, Unsicherheiten und späterer Überprüfung.",
    robots: { index: false, follow: false },
    openGraph: { type: "website", locale: "de_DE", title: "Wirkungsportal Parlament", description: "Wirkung prüfen. Quellen offenlegen. Aus Entscheidungen lernen.", images: [{ url: "/og.png", width: 1736, height: 909, alt: "Wirkungsportal Parlament" }] },
    twitter: { card: "summary_large_image", title: "Wirkungsportal Parlament", description: "Wirkung prüfen. Quellen offenlegen. Aus Entscheidungen lernen.", images: ["/og.png"] }
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="de"><body>
    <a className="skip-link" href="#main-content">Zum Inhalt springen</a>
    <div className="trust-band"><div className="container">Herausgegeben vom Institut für Wirkungsökonomie <span aria-hidden="true">·</span> <Link href="/transparenz/unabhaengigkeit">parteiunabhängig</Link> <span aria-hidden="true">·</span> <Link href="/methodik">Methodik offen</Link> <span aria-hidden="true">·</span> <Link href="/transparenz">Quellen prüfbar</Link></div></div>
    <header className="site-header"><div className="container header-grid">
      <Link className="brand" href="/"><span className="brand-mark" aria-hidden="true">W</span><span><strong>Wirkungsportal Parlament</strong><small>Institut für Wirkungsökonomie</small></span></Link>
      <Suspense fallback={<nav className="portal-nav" aria-label="Hauptnavigation"><Link href="/bevorstehend">Anstehend</Link><Link href="/entscheidungen">Entscheidungen</Link><Link href="/historie">Historie</Link></nav>}><PortalNav /></Suspense>
    </div></header>
    <main id="main-content">{children}</main>
    <footer className="site-footer"><div className="container footer-grid"><div><p className="kicker">Wirkungsportal Parlament</p><h2>Nachvollziehbar prüfen. Offen korrigieren.</h2><p>Ein öffentliches Fachangebot des Instituts für Wirkungsökonomie. Keine Personen- oder Parteibewertung, kein Social-Credit-System.</p></div><nav aria-label="Fußnavigation"><Link href="/transparenz">Transparenz</Link><Link href="/methodik">Methodik</Link><Link href="/transparenz/korrekturen">Korrekturen</Link><Link href="/datenschutz">Datenschutzerklärung</Link><a href="https://wirkungsoekonomie.de/impressum.html">Impressum</a><Link href="https://wirkungsoekonomie.de">Wirkungsökonomie.de</Link><a href="mailto:wirkungscheck@wirkungsoekonomie.de">Kontakt</a></nav></div></footer>
  </body></html>;
}
