"use client";

import { useEffect } from "react";

const landingUrl = "https://wirkungsoekonomie.de/newsletter/bestaetigen.html";

/**
 * Kept only for confirmation links sent before the landing page moved. The
 * Wirkungsbrief is a main-site newsletter and must never expose its flow as
 * a Parliament product.
 */
export default function ConfirmNewsletterRedirect() {
  useEffect(() => {
    window.location.replace(`${landingUrl}${window.location.search}`);
  }, []);

  return <main className="shell content-page"><p className="eyebrow">Der Wirkungsbrief</p><h1>Weiterleitung zur Bestätigung</h1><p className="lead">Ihre Anmeldung wird auf der Website der Wirkungsökonomie geöffnet.</p><p><a href={landingUrl}>Zur Bestätigungsseite</a></p></main>;
}
