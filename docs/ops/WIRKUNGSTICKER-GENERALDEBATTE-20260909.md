# Generaldebatte: redaktionelles Veröffentlichungspaket

Stand: 9. September 2026.

## Inhalt und Abgrenzung

- Neue eigenständige Meinung & Analyse von Natalie Weber: `/wirkungsticker/analyse/generaldebatte-deutschland-braucht-mehr-als-einen-gewonnenen-schlagabtausch/`.
- Der bereits vorhandene Nachrichtenentwurf `wt-63cb95e544d260ce` wird nach Quellenprüfung unter seiner bisherigen ID, Ereigniszuordnung und URL veröffentlicht. Keine zusätzliche Generaldebatten-Dublette.
- Kernaussage: Wirksame Sachpolitik und demokratischer Schutz sind keine Alternativen. Haushaltsansätze und Redeankündigungen müssen über Umsetzung und Leistungen zu überprüfbaren Zustandsveränderungen führen.
- Der BILD-Kommentar ist der zugeschriebene publizistische Bezugspunkt, nicht die Hauptquelle. Keine übernommenen Pressefotos. Die Bundestagsdokumentation und die regierungseigene Redezusammenfassung enthalten konkrete Vorschläge; ein pauschales Urteil, es sei nichts Inhaltliches gekommen, wird nicht übernommen.
- 13 Quellen, rund 1.780 Wörter in den Textabsätzen einschließlich 248 Wörtern persönlicher Schlussbewertung; berechnete Lesezeit inklusive zusätzlicher Inhalte: 10 Minuten. Keine bezahlte Generierung.
- Die MPD-Richtungen beziehen sich ausdrücklich auf erläuterte Risiken fehlender Umsetzung, verlorener Schutzfunktionen und einer fossilen Substitution gegenüber verfügbaren emissionsärmeren Alternativen. Keine negative Bewertung des bloßen Debattierens und kein positiver Demokratie-Score für den Informationsnutzen des eigenen Berichts.

## Evidenzgrenzen

Bundestagsdokumentation, Bundesregierung, BMF-Haushaltszahlen und Deutschlandfunk wurden geprüft. Für den BMF-Langtext und die OECD-Auswertung waren die Recherchezugriffe erfolgreich, ein zusätzlicher direkter Abruf wurde teilweise durch Bot-Schutz begrenzt. Deshalb kein pauschales Protokoll „alle Quellen direkt HTTP 200“. Der IPCC-Text wurde nach einem fehlgeschlagenen Rechercheabruf zusätzlich direkt erfolgreich gelesen.

Das verlinkte Plenarprotokoll war beim Abruf noch nicht verfügbar (404). Im Beitrag wird keine vollständige Protokoll- oder Videoauswertung behauptet. Die Haushaltszahlen betreffen den Entwurf des Kernhaushalts, nicht einen bereits verabschiedeten Gesamtetat. Kulturförderung: nominaler Ansatz der benannten Titelgruppe; keine bereits nachgewiesene Theaterschließung. OECD: statistische Zusammenhänge, keine kausale Erklärung des Wahlergebnisses oder gemessene Publikumsreaktion. Rechtliche und Nachhaltigkeitsreferenzen ersetzen keinen Wirkungsnachweis.

## Technische Umsetzung und Prüfung

Bestehendes Analyse-Datenmodell, Kommentar-Metadaten, persönliche Autorinnenperspektive und Renderer. Sechs Navigationsgruppen, Kaskade, Rückkopplungsmodell und responsive Vergleichstabelle. Übersicht, Nachricht, Analyse und interne Vorarbeiten sind miteinander verknüpft. Artikelspezifische First-Party-Linkvorschau: 1200 × 630 Pixel, Titel und Natalie Weber, keine zusätzliche Bildgenerierung.

`story_draft_review` erweitert den vorhandenen geprüften Veröffentlichungsweg: nur unveröffentlichter, nicht stillgelegter Entwurf, exakter Eingangs-Hash, Originalereignis über Quellenlink gebunden. Identitäts- und URL-Erhalt, Quellenintegrität, aktueller Richtungsrahmen und sämtliche fachlichen Gates bleiben erforderlich. Erneuter identischer Aufruf ist idempotent. Überlappende laufende Queue-Änderungen werden nicht automatisch überschrieben.

Lokale Abnahme vor Zusammenführung mit dem laufenden Ticker:

- 760 Tests in `news:test` erfolgreich, einschließlich der zwei zusätzlichen Entwurfs-Review-Regressionstests.
- Typecheck und Nachrichtenvalidierung erfolgreich; Quellenintegritätsaudit: 215/215 aktive Veröffentlichungen ohne Hold.
- Lint erfolgreich beendet, 25 bestehende Sprachhinweise; keine neue pauschale Fehlerfreiheit des gesamten Bestands behauptet.
- Nachrichten-, Such-, Taxonomie- und Deploy-Artefakt gebaut; Datenschutz- und interne Link-Gates erfolgreich.
- Größenprüfung: nur Warnung bei 852,9 MB gegenüber der 850-MB-Warnschwelle, kein harter Build-Abbruch.
- Browserprüfung Desktop 1440 px, Mobil 390 px und 320 px: keine Browserfehler, kein horizontaler Seitenüberlauf, runde Autorinnenabbildung; Tabellen, Kaskaden und Meinungsteil visuell geprüft. Alle sechs Navigationsgruppen führen zu vorhandenen Ankern. Übersicht → Analyse → Ursprungsnachricht und Rückverlinkung geprüft. Linkvorschau visuell geprüft.

Publikation über den bestehenden seriellen GitHub-Pages-Prozess. Kein Vercel-Build, keine Tarifänderung und kein Eingriff in den laufenden Nachrichtenbetrieb. Die allgemeine MPD-Bewertungsgegenstand-Diagnose bleibt ein gesonderter offener Auftrag und wird durch diesen Beitrag nicht als global behoben ausgewiesen.

## Abgleich mit der Abendausgabe

Vor dem Push wurde `def24048273a3a159ae62fc13bd9404e5340d317` aus dem laufenden Ticker übernommen. Dessen zusätzliche Meldungen, Kosten- und Queue-Daten bleiben erhalten. Der Generaldebatten-Entwurf war weiter unveröffentlicht; geändert hatten sich Abruf-/Retry-Metadaten, der Zeitstempel des bereits geprüften Deutschlandfunk-Textes und ein nicht als Beleg verwendeter Spiegel-Indexeintrag. Der unveränderte Bundestagsbeleg und die drei redaktionell geprüften Quellen bleiben die Publikationsbasis. Der Entwurfs-Review ist nach diesem Vergleich an den neuen Eingangs-Hash gebunden und durchläuft erneut dieselben Gates. Kein pauschales Auflösen kanonischer Konflikte zugunsten älterer Daten.

Nach Zusammenführung: erneut 760/760 Tests erfolgreich, Quellenintegrität 216/216 aktive Veröffentlichungen ohne Hold, Nachrichten-/Such-/Taxonomie-Build und Nachrichtenvalidierung erfolgreich. Alle 1.108 Queue-Datensätze des aktuellen Workers bleiben erhalten; nur der beauftragte Generaldebatten-Entwurf wird redaktionell zur Veröffentlichung überführt. Usage-, State- und Newsroom-Dateien sind bytegleich zum Worker-Stand.

Ein währenddessen eingetroffener weiterer Worker-Commit `aa03aea766` wird ebenfalls integriert. Die zusätzlichen Änderungen am Entwurf betreffen Abruf-/Retry-Daten und zwei nicht als Faktenbasis verwendete Spiegel-Einträge, darunter ein Video-Hinweis zum Schlagabtausch. Die überprüften Aussagen der drei verwendeten Quellen haben sich dadurch nicht geändert. Der Eingangs-Hash wird erneut ausdrücklich abgeglichen, statt den Produktionsstand zu überschreiben.
