import type { Metadata } from "next";
import Link from "next/link";
import { PortalNav } from "@/app/components/PortalNav";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Wirkungsportal Parlament", template: "%s · Wirkungsportal Parlament" },
  description: "Amtlich gestützte und nachvollziehbare Wirkungschecks für parlamentarische Entscheidungen.",
  metadataBase: new URL("https://parlament.wirkungsoekonomie.de")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>
        <a className="skip-link" href="#content">Zum Inhalt springen</a>
        <header className="site-header">
          <div className="shell header-inner">
            <Link href="/" className="brand" aria-label="Wirkungsportal Parlament, Startseite">
              <span className="brand-mark" aria-hidden="true">W</span>
              <span><strong>Wirkungsportal</strong><small>Parlament</small></span>
            </Link>
            <PortalNav />
          </div>
        </header>
        <main id="content">{children}</main>
        <footer className="site-footer">
          <div className="shell footer-grid">
            <div>
              <p className="eyebrow">Parteiunabhängige Wirkungsinfrastruktur</p>
              <h2>Vorher verstehen. Entscheidung prüfen. Nachher messen.</h2>
              <p>Das Portal bewertet keine Menschen, Parteien oder Gesinnungen. Es legt den normativen Referenzrahmen offen; politische Entscheidungen bleiben Aufgabe des Parlaments.</p>
            </div>
            <nav aria-label="Footer Navigation" className="footer-nav">
              <Link href="/methodik">Methodik</Link>
              <Link href="/transparenz">Transparenz</Link>
              <Link href="/werkzeuge">Werkzeuge</Link>
              <a href="https://wirkungsoekonomie.de/impressum.html">Impressum</a>
              <a href="https://wirkungsoekonomie.de/datenschutz.html">Datenschutz</a>
              <a href="mailto:wirkungscheck@wirkungsoekonomie.de">Kontakt</a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
