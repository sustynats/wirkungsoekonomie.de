# P6 - gemeinsame Bereichseinstiege

Frischer Branch nach dem vollständig grünen P5-Merge, exakte Ausgangsbasis `0101b3e7569f9a153721ea715cc4068402bf6a87`. Keine Übernahme eines alten Arbeitsbaums. Keine Fach-, Quellen-, Bewertungs-, Hosting- oder Workflow-Änderung.

## Vollständiger Phasenumfang

| Anforderung | Umsetzung und Nachweis |
| --- | --- |
| `/ebenen`, `/monitor`, `/pruefstandard` | Gemeinsame serverseitige `PortalLanding`: vorhandene globale Brotkrumen/Unternavigation → gemeinsamer H1/Lead → berechneter Bestand oder Methodenvisual → Bereichsziele und Inhalt. |
| Alle fünf Einstiege | Auch `/aktuell` verwendet die gemeinsame Landing. `/wirkungsakten` übernimmt denselben `PortalSectionHeader`; seine vollständigen Facetten, Verteilung und Akten bleiben erhalten. |
| Länder-Kartogramm | Dieselbe bestehende `StateCartogram`-Projektion auf `/ebenen` und `/ebenen/laender`; keine zweite Klassifikation. Alle registrierten Länder, jedes Symbol/Wort und jeder Statuszähler stammen aus `stateReviewStand()`. |
| Gemeinsame Regierungsnavigation | Bereits in P1 aufgelöst; RootLayout rendert genau einmal PortalWayfinding. Regierung und Unterseiten verwenden denselben Navigationsbaum, keine zweite Bereichsnavigation. Akteninterne Tabs sind Gliederung der Akte, kein konkurrierender Portalbereich. |
| Öffentliche Unterseiten | Alle Sitemap-/Navigationsziele werden auf HTTP 200, genau eine H1, genau eine Brotkrumennavigation und die aus dem zentralen Baum erwartete Unternavigation geprüft. Kanonische Detailrenderer und ihre vollständigen Akten bleiben bestehen. |
| Regierungsbereiche im Datenaufbau | Dieselbe Abschnittsüberschrift; der bisherige Text bleibt exakt als Lead erhalten, Datenlücke sichtbar. Kein erfundener Monitor. |
| Keine Datenänderung | Zahlen für Radar, Register und Reifestufen ausschließlich aus `portalStand()`; keine Bewertung aus Partei, Text, Datum oder Quellenanzahl. |
| Reproduzierbarer 320-px-Überlauf | Lange Beschriftungen der kompakten Wirkungssignatur liefen über ihre Grid-Zelle hinaus. `minmax(0, 1fr)`, `min-width: 0` und echter Wortumbruch beheben die Ursache; kein Abschneiden/Verstecken von Text und kein gelockerter Test. |
| Linux-/Schriftmetriken-Regressionsschutz | Der erste CI-Browserlauf `33891306679` meldete weiterhin `/wirkungsakten@320`. Lange Materialitäts-Chips dürfen nun auf eine neue Zeile wechseln und vollständig umbrechen; Filter-Labels verwenden ebenfalls eine schrumpfbare Grid-Spalte. Das Gate prüft zusätzlich jeden vollständigen Chip auf internen Überlauf und speichert im Fehlerfall Maße und Screenshot. Kein kosmetisches `overflow: hidden`. |

`Offen` bleibt eigene Kategorie. Sachsen-Anhalts vollständiges **Prüfpaket** ist kein Gesamturteil über ein Land; Berlin/MV bleiben Materialitätsreviews. Register-Reifestufen zählen Akten, niemals eingetretene Wirkungen. Die drei Prüfstandard-Achsen übernehmen wortgleich die bereits veröffentlichte Legende, ohne Gesamtnote.

## Textbestand: Umzug statt Entfernung

| Bisheriger Text | Erreichbares Ziel |
| --- | --- |
| Vollständige Monitor-Einführung und Unterscheidung Monitoring/Evaluation | `/monitor#monitor-einordnung`, nativer Tastatur-Aufklapper; `MonitorContext` enthält den unveränderten Text. |
| Auf der Startseite bereits umgezogene Monitor-/Mandat-/Fachakten-Abschnitte | `HomeMonitorContext` bleibt unverändert auf `/monitor`. |
| Vollständiger Länder-Lead, Abdeckungs- und Adaptererläuterung | `/ebenen/laender#states-coverage-context`; Kartogramm steht davor. |
| Länder-Prinzipien und alle Landeskarten | Unverändert auf `/ebenen/laender`; vorgefilterter Registerlink nun nach dem Kartogramm statt vor H1. |
| Bisherige Einstiegs-/Registertexte | Unverändert in gemeinsamer Überschrift, Zielliste bzw. vollständigem Register. |

Die vor P6 gerenderte Baseline aller fünf Einstiege plus Länderseite enthält **438 Textpassagen**. `ux/p6-text-baseline-2026-09-04.json` ist an den literal getesteten P5-Head `5c706348333b157304a4eed856ac4d422152d91c` gebunden; SHA-256 `b9d3f89b64e0142a4deb019a35f6c27fd32cd49f9183292b0366f468a009142d`. Jede Passage wird gegen ihren gerenderten Zielcontainer geprüft und in `area-text-preservation.json` protokolliert. Das bestehende komplette P1-P6-AST-Textinventar und die 9457 P5-Passagen bleiben zusätzliche Gates. Audit-Fixture nur in GitHub, nicht im minimalen Runtime-Artefakt.

## Prüfumfang

Alle sechs Einstiege bei 375/320/360/390/428/1440 px: Reihenfolge, Tastatur-Aufklapper, alle Länder und Zähler set-weise, horizontaler Overflow, WCAG-Prüfung des gesamten Main-Inhalts auch mit aufgeklapptem Kontext. Hinzu kommen alle öffentlichen Routen, Legacy-308, Source-vs-View, Neutralitätstest, SamePage/Back/Forward/Fokus, P5-Lesemodus, Tests, Typecheck, Lint und Produktionsbuild. Exact-head-/CI-/Preview-Artefakt-/Merge-Belege stehen im zugehörigen PR und Controller-Closeout; sie werden nicht vor dem echten Ergebnis behauptet.

P1 #352, P2 #357, P3 #366, P4 #367 und P5 #371 sind gemergt. P6 bleibt ein eigener sauberer PR. Die §7-Ausnahmen zu nicht berechenbaren optionalen Anzeigen sind vollständig in `P5-ENTSCHEIDUNGSANSICHTEN-2026-09-04.md` dokumentiert; P6 erfindet diese Eingaben nicht.

## Release-Grenze

GitHub-terminal ist nicht live. Der aktuelle #238/#241-Controller und das rote EUR-25-Kostengate bleiben bindend. Kein Vercel-Build, keine Reservierung, keine Vercel-Preview, kein Deployment und keine Promotion. Bestehende Berlin/MV-Fachresiduale werden durch die neue Navigation nicht abgeschlossen oder versteckt.
