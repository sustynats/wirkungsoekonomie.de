# Release: Website UX Cleanup

Stand: 2026-05-25

## Ziel des Releases

Der Release `website-ux-cleanup` schliesst den Website-UX-, Informationsarchitektur-, Tool-, CTA- und Such-Cleanup fuer die oeffentliche Website ab. Ziel war, zentrale Seiten nicht mehr wie Werkstatt-, Portal-, Dossier- oder Tool-Spezifikationsseiten wirken zu lassen, sondern als oeffentlich verstaendliches Wissens- und Anwendungssystem.

## Merge

- Merge nach `main`: ja
- Merge-Commit: `13756f16`
- GitHub Pages Deploy: erfolgreich
- Live-Check: erfolgreich
- Kritische Restfehler: nein
- Empfehlung: Release akzeptieren

## Gepruefte Live-URLs

- https://wirkungsoekonomie.de/
- https://wirkungsoekonomie.de/wirkungsfelder/
- https://wirkungsoekonomie.de/wirkungsfelder/arbeit-einkommen/
- https://wirkungsoekonomie.de/wirkungsfelder/wirtschaft-unternehmen/
- https://wirkungsoekonomie.de/werkzeuge/impact-controlling/
- https://wirkungsoekonomie.de/erleben.html
- https://wirkungsoekonomie.de/erleben/automatisierungs-wirkungseinkommensrechner/
- https://wirkungsoekonomie.de/suche.html

## Ergebnis des Live-Checks

- Startseite: Hero beginnt mit `WAS PREISE BISLANG NICHT ZEIGEN`; H1 lautet `Gewinn und Wachstum reichen als Massstab nicht.`
- Wirkungsfelder: Uebersichtslogik ist sichtbar und keine internen Portal-/Statusbegriffe wurden auf den geprueften Seiten gefunden.
- Arbeit & Einkommen: Landingpage-Struktur ist sichtbar; keine Downloads, Onlinefassung oder Inhaltsverzeichnis direkt oben.
- Wirtschaft & Unternehmen: keine sichtbaren Begriffe wie Portaltext, Arbeitsfassung oder Online- und Dossierlogik auf der geprueften Seite.
- Impact Controlling: kein `Methodenseite vorhanden` und keine internen Statuslabels auf der geprueften Seite.
- Erleben und Automatisierungsrechner: keine unfertigen leeren Ergebniswerte; der Automatisierungsrechner enthaelt `Warum dieser Rechner?` und `Woher kommt das Geld?`.
- Suche: Filter sind standardmaessig eingeklappt.

## Entfernte Hauptprobleme

- Generische `Oeffnen`-CTAs auf den geprueften zentralen Seiten.
- Interne Statuslabels wie `Methodenseite vorhanden`.
- Tool-Spezifikationssprache auf den geprueften Tool- und Werkzeugseiten.
- Leere Toolwerte wie `Score-`, `Beitrag-`, `Faktor-`, `FTE-`, `Gesamtpreis-` oder `Wirkungssteuer-` als Standardzustand.
- Nicht eingeklappte Suchfilter.
- Alte Landingpage-/Dossierlogik auf den geprueften Wirkungsfeld- und Werkzeugseiten.

## Verbleibende Hinweise

- GitHub Actions zeigt eine Node-20-Deprecation-Warnung. Das ist kein Website-Release-Blocker, sollte aber als technischer Wartungspunkt vorbereitet werden.
- Word-/Pandoc-/Dokumentenstandardisierung bleibt separat offen und war bewusst nicht Teil dieses Website-Releases.
- Der alte Branch `standardize-dossier-layouts` bleibt als WIP-Sammelstand erhalten und wurde nicht geloescht.
