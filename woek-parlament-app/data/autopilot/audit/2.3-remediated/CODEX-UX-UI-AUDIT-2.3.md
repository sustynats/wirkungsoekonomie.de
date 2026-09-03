# CodeX – UX-, UI-, Responsive- und Accessibility-Audit 2.3

Stand: 19. August 2026

## Prüfaufbau

Geprüft wurde der optimierte Produktionsbuild (`next build` + `next start`) mit Chromium und axe-core. Die Matrix umfasst 19 öffentliche Kernrouten an neun Breiten, insgesamt 171 gerenderte Messungen.

Breakpoints:

- Mobile: 320, 360, 375, 390 und 428 px
- Tablet/Desktop: 768, 1.024, 1.280 und 1.440 px

Routenfamilien:

- Startseite und globale Wirkungsfälle
- Parlamentsentscheidung einschließlich K.-o.-Tropfen-Regression
- Bundesregierung, Wirkungsanalysen und strukturierte GovernmentActions
- EU-Hub, EU-Wirkungsfälle und EU-Detailseite
- Länderübersicht, Begriffe, Methodik und Transparenz
- Quellenarchiv, Quellen-Zwischenseite und Suche

## Ergebnis der Browsermatrix

- 171/171 Messungen: PASS
- HTTP ungleich 200: 0
- Console Errors: 0
- Page/React Errors: 0
- horizontale Überläufe: 0
- sichtbare Objektdumps: 0
- sichtbare Roh-Enums/Schemawerte: 0
- Heading-Sprünge: 0
- zu kleine interaktive Ziele unter 24 px: 0
- schwere oder kritische axe-Verstöße: 0
- geprüfte WÖk-Bewertungsblöcke: 108
- Abweichungen zwischen strukturiertem Richtungswert und gerendertem Bewertungsicon: 0

## Accessibility

- Quellcode-Baseline nach WCAG 2.2 AA: 89 Dateien, 0 Funde.
- Gerenderte axe-Prüfung erfolgte für alle 19 Routen bei 390 und 1.440 px: keine schweren oder kritischen Verstöße.
- Fokuszustände, Landmarken, genau eine H1 je Seite, Heading-Reihenfolge, Tabellensemantik und textliche Statusäquivalente wurden geprüft.
- Farbe oder Icon sind an keiner geprüften Bewertungsfläche allein bedeutungstragend.
- Icon, CSS-Zustand, Auditmarker und Screenreader-Text verwenden denselben strukturierten Richtungswert; unbekannte Werte fallen nicht auf „positiv“ zurück.

## Orientierung und Vertrauen

- Die fachliche WÖk-Einordnung ist vor Prozessmetadaten sichtbar.
- Fakt, Wirkungsanalyse, Evidenz, offene Zustände, Quellen und Verfahren sind visuell getrennt.
- Faktenakten ohne freigegebene Analyse werden nicht als neutrale Bewertung ausgegeben.
- Unbekannte technische Werte werden nicht kosmetisch „übersetzt“, sondern fail-closed behandelt.
- Detailseiten beginnen mit Gegenstand, Bewertung und Wirkungslogik; Prozessinformationen folgen später.

## Typografie und Rhythmus

- WÖk-Kurzbewertung als ruhiger Sans-Serif-Lead statt zweiter Display-Überschrift.
- Konsistente Max-Widths, Kartenabstände und responsive Umbrüche.
- Längere Fachanalysen bleiben vollständig, werden jedoch mit Inhaltsverzeichnis, semantischen Kapiteln und fokussierbaren Tabellen strukturiert.

## Stabilitätsnachweis GovernmentAction

Geprüfte Regressionen:

- `/regierung/akte/govaction%3Adip%3A325252`
- `/regierung/akte/govaction%3Abreg-cabinet%3A2435812%3Atop%3A5`
- `/regierung/akte/govaction%3Abreg-cabinet%3A2404212%3Atop%3A7`
- `/regierung/akte/govaction%3Adip%3A329388`

Alle liefern HTTP 200; der Browser-Audit meldet weder White Screen noch React-Object-Render-Fehler.

## Icon-Richtungsregression

- `EU-IMPACT-2026-004`: freigegebene Richtung `AMBIVALENT` → gerendert `data-woek-assessment-icon="ambivalent"` – PASS.
- Positive, negative, ambivalente, offene, neutrale, bedingte, Schutz- und Portfoliozustände besitzen explizite technische Zuordnungen.
- Unbekannte Richtung → `unknown` mit nicht-direktionaler Evidenzdarstellung; niemals positiver Default.
- Die Browsermatrix vergleicht für jede gerenderte Bewertungsfläche `data-woek-assessment-direction` mit `data-woek-assessment-icon`.

## Source-vs.-View und Redaktion

- Government: 53/53 Public ImpactCases, 1.622 öffentliche Felder – PASS
- Recommendations: 6/6, 621 Felder und 22/22 Quellen-Zwischenseiten – PASS
- EU: 16/16 Public ImpactCases, 224 öffentliche Felder – PASS
- Generic Public Editorial Scan: PASS

## Review des React-Codes

Der geänderte TSX-Umfang wurde gegen die React-Best-Practices geprüft: keine neuen unnötigen Client-Komponenten, keine Effektkaskaden, stabile Schlüssel in den neu bearbeiteten Listen, keine neue schwere UI-Abhängigkeit und keine ungesicherte HTML-Injektion. Die vorhandene JSON-LD-Ausgabe serialisiert weiterhin mit maskiertem `<`.

## Restrisiko und Freigabe

Keine bekannten P0-/P1-Restmängel in der geprüften öffentlichen Projektion. Empfehlung: `READY_FOR_EXTERNAL_WOEK_AUDIT`. Production bleibt bis zur externen Freigabe unverändert.
