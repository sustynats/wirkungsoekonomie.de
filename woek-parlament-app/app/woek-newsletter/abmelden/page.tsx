"use client";

import { useEffect } from "react";

const landingUrl = "https://wirkungsoekonomie.de/newsletter/abmelden.html";

/** Redirects historic Wirkungsbrief unsubscribe links to the main site. */
export default function UnsubscribeNewsletterRedirect() {
  useEffect(() => {
    window.location.replace(`${landingUrl}${window.location.search}`);
  }, []);

  return <main className="shell content-page"><p className="eyebrow">Der Wirkungsbrief</p><h1>Weiterleitung zur Abmeldung</h1><p className="lead">Ihre Abmeldung wird auf der Website der Wirkungsökonomie geöffnet.</p><p><a href={landingUrl}>Zur Abmeldeseite</a></p></main>;
}
