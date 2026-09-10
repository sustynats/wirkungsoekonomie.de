# Wirkungsbewertung 2.1: atomarer öffentlicher Rollout

Stand: 10.09.2026. Umsetzung läuft; keine vollständige Neubewertung behaupten.

## Sofortkorrektur

Die konservative Migration 2.0 ließ technische Lücken in aktiven Profilen. Der öffentliche Renderer zeigte sie als offene fachliche Ergebnisse. Bis zum vollständigen Backfill steht `PUBLIC_IMPACT_PROFILE_VERSION` auf `null`. Übersichten, Details, öffentliche JSON-Daten, Dimensionsfilter und aus Geschichten erzeugte Titelbilder übernehmen keine unvollständigen Profile. Nachrichten, journalistische Einordnungen, Quellen, URLs und Verlauf bleiben bestehen. Ein allgemeiner Hinweis erklärt die laufende Überarbeitung. Die bestehenden artikelbezogenen Linkvorschauen enthalten ohnehin keine MPD-Bewertung.

Die Methode und die Balken werden nicht abgeschafft. Das Feature Flag darf erst zusammen mit dem vollständigen geprüften Katalog und dessen Coverage-Bericht auf die neue Version gesetzt werden. Private Vorschauen sind kein Produktionsartefakt. Der öffentliche HTML-Generator verweigert Diagnoseausgaben und versehentlich hineinkopierte private Profile.

## Implementiert und noch erforderliche Abnahme

- Implementiert: sechs quellenbegründete Faktoren je modelliertem Hauptpfad; reproduzierbare Rundung, Schutzgrenzen und getrennte Wahrscheinlichkeit/Evidenz.
- Implementiert: neuer unveränderlicher Vertrag, Recherche über die Ausgangsmeldung hinaus und unabhängiger Prüfpass. Jede reguläre Meldung benötigt modellierte Potenziale in allen drei Dimensionen; die frühere Annahme abgeschlossener `not_material`-Dimensionen gilt nicht mehr.
- Implementiert: kleine kategoriale Status-Ringe zusätzlich zu Balken, Richtungslabel und Kurzpfad; separate Beobachtungen mit eigener Tragweite. Echte Karten bei 320/390 Pixel sowie Desktop geprüft. Private Vorschauen werden im öffentlichen Artefakt abgefangen.
- Alle 288 zuvor markierten Datensätze nachbewerten. Vorhandene Rückgaben sind Vorarbeit, keine abgeschlossene 2.1-Bewertung.
- Vollständiger Coverage-Bericht, fachliche Sichtprüfung, öffentliche Methodik und atomare Wiederfreigabe.

Der derzeitige öffentliche Ausblendungszustand ist damit ausdrücklich **kein** erfülltes Produktziel. Die neue Produktinvariante verlangt sichtbare MPD-Zeilen für alle regulären Nachrichten. Diese Abnahme bleibt bis zu den tatsächlichen Neubewertungen und der Wiederfreigabe offen; es werden keine Werte erfunden, um einen grünen Coverage-Bericht zu erzeugen.

Bisherige Vertragsdateien, Inputs, Outputs und ACKs bleiben unverändert. Aktuelle Nachrichten und ihre Korrekturen behalten Vorrang. Kein zusätzlicher KI-Anbieter und kein kostenpflichtiger API-Fallback.
