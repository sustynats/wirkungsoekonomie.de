# Meinung & Analyse: Umstellung vom 7. September 2026

## Redaktion und Inhalt

Die primäre sichtbare Beitragsart aller eigenständigen Ticker-Analysen heißt nun `Meinung & Analyse`. Die bisherige Methodik, Varianten und `/wirkungsticker/analyse/`-URLs bleiben erhalten. Der zentrale Renderer ergänzt den vorgegebenen Transparenzhinweis bei Autorin/Metadaten, vereinheitlicht Karten, Ursprungs-CTAs, Article-Metadaten und Feeds und erklärt das Format im Lesehinweis der Übersicht. Bestehende Datensätze erhalten weder eine erfundene persönliche Haltung noch neue Veröffentlichungsdaten.

Neuer Beitrag: `/wirkungsticker/analyse/eine-volkspartei-merkt-nicht-erst-am-wahlabend-was-im-land-passiert/`, Natalie Weber, 11 Minuten. Beauftragte persönliche Gewichtung bleibt getrennt; 11 datiert geprüfte Quellen, sechs Navigationsgruppen, acht visuelle Anker einschließlich Hero und MPD-Bilanz. Bestehende Wahlnachricht, Staatsmacht-Sonderanalyse und Entzauberungs-Kommentar bleiben eigenständig.

Geprüft: vorläufige Landeswahldaten (03:21 Uhr), MDR-Gemeindedaten (14:51 Uhr), ZDF/ARD zur Pressekonferenz, bpb, Parteiengesetz, Grundgesetz, SDG 16 und Lorenz-Spreen et al. Die Vorwahlumfrage ist ausdrücklich eine Projektion, keine exakte Wahlprognose. Merz' Offenheit für einzelne Reformfragen ist enthalten. Eine defekte Rückkopplung wird nicht aus Aggregatstimmen kausal bewiesen; CDU-Verlust ist nicht automatisch Demokratieverlust.

Das zugeschriebene Schulze-Zitat über eingesparte Umfragekosten ließ sich in den geprüften öffentlichen Berichten nicht hinreichend bestätigen und wird nicht veröffentlicht. Zusätzliche eigenständige interne Seiten zu einer globalen Autokratisierungswelle und internationalen Einflussnetzwerken ließen sich im geprüften Bestand nicht auffinden; keine erfundenen Links. Stattdessen Verbindungen zu den vorhandenen Sachsen-Anhalt-Beiträgen und Methodikseiten.

Der BASF-Hinweis bleibt separat: Eine am 7. September weitergegebene interne Einschätzung belegt kein Vorstandsstatement dieses Datums und kein aktuelles Rekordergebnis. Die öffentliche BASF-Q2-Mitteilung vom 29. Juli belegt operative Verbesserung und erhöhte Prognose; der Nettoergebnisanstieg enthält zusätzlich einen großen Veräußerungsgewinn. Kein unbelegtes aktuelles Vorstandsereignis veröffentlicht.

## Wiederverwendbare Technik

- `EDITORIAL_TRANSPARENCY_NOTE` und `editorialLabel` zentral; HTML/XML-Escaping des kaufmännischen Und.
- `AUTHOR_ANALYSIS_RULE` im vorhandenen Generierungsprompt, ohne zusätzlichen Modellaufruf: Beispiel -> Mechanismus -> System, belegte Fakten, erkennbare Meinung, keine pauschale Wählerabwertung.
- `feedback` erweitert die bestehende evidenzgebundene Kaskade um `closed|broken` und einen expliziten Rückkanal. Ungültige Struktur wird abgewiesen. Kein zweites Rendering-System, keine KI-Bilder.
- Bestehende MPD-Komponente trennt Relevanz, Richtung, Eintritt, Ausmaß und Evidenz. Planet bleibt im neuen Beitrag richtungsoffen und indirekt.
- Kleiner Kostenreport-Fix: explizit null Provideraufrufe bei null Kosten zählen separat als `zero_request_jobs`, nicht als abgeschlossene Providerjobs. Kosten und historische Reserven bleiben unverändert.

## Prüfungen

- Vor dem letzten kleinen Kostenreport-Test: 555 Nachrichtentests bestanden; neue Format-, Rückkopplungs-, XSS-, Historien- und Linktests enthalten.
- `news:build`, `news:validate`, `build:search`, `taxonomy:build`, `typecheck`, `lint`, `check:hosting-cost` erfolgreich. Sprachprüfung meldet 25 bestehende Befunde außerhalb des neuen Beitrags; kein behaupteter projektweiter Nullbefund.
- Vollständiger öffentlicher Artefakt-Build, Privacy- und Größengate bestanden; Linkprüfung: 0 defekte Links. Bestehende globale Orphans und Titelduplikate sind kein neu erzeugter Befund.
- Browser: Desktop 1440 px, Mobile 390 px, Seite und Autorenporträts ohne Überbreite. Übersicht -> neuer Beitrag -> Ursprung mit drei Analyse-CTAs funktioniert. Sechs Navigationsgruppen, zwei Rückkanäle, keine JavaScript-Fehler.
- Produktion folgt dem bestehenden seriellen GitHub-Pages-Releaseweg. Keine Vercel-Nutzung, kein neuer kostenpflichtiger Analyseauftrag, keine Änderung an Budgetdeckeln oder Quellen-/Publikationsgates.
