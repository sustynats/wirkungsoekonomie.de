# Suche - Implementation Audit

Stand: 2026-05-20

## 1. Suchtechnologie

Die öffentliche Website nutzt im MVP eine statische, datensparsame Wissenssuche auf Basis von JSON-Dateien und JavaScript:

- `/suche.html`
- `/assets/js/search.js`
- `/assets/css/search.css`
- `/assets/search/search-index.json`
- `/assets/search/search-dictionary.json`
- `/assets/search/search-associations.json`
- `/assets/search/search-curated-entrypoints.json`

Es wird keine externe Suchplattform, kein Google Custom Search und kein personenbezogenes Tracking verwendet.

Pagefind bleibt als spätere Ausbaustufe sinnvoll, sobald ein automatischer GitHub-Actions-Build für die statische Website eingerichtet wird. Der aktuelle Stand ist bewusst wartungsarm und funktioniert ohne zusätzlichen Build-Schritt auf GitHub Pages.

## 2. Index-Erzeugung

Der Index ist im MVP redaktionell kuratiert. Er enthält zentrale Seiten, Glossarbegriffe, Dossiers, Blogartikel, Downloads und neue SDG+-Inhalte. Dadurch werden die wichtigsten Einstiege priorisiert und nicht durch wiederholte Layout-Texte, Navigation oder Footer überlagert.

Später kann der Index automatisch aus HTML-Metadaten oder Pagefind erzeugt werden.

## 3. Indexierte Bereiche

Indexiert sind:

- Startseite
- Wirkungsökonomie verstehen
- Modell
- Workflow / Von Daten zum Steuersatz
- Vergleich
- Erleben
- Anwendungen
- Akademie-Hauptseite
- Buch
- Downloads
- Glossar und zentrale Glossarbegriffe
- SDG+ / Medien und Demokratie
- Wirkung politischer Sprache
- Blog-Dossiers
- ausgewählte Leitartikel und aktuelle Analysen
- zentrale PDF-Downloads mit Titel und Beschreibung

## 4. Ausgeschlossene Bereiche

Bewusst nicht indexiert:

- Navigation
- Footer
- wiederholte Layout-Elemente
- Cookie- oder Tracking-Hinweise
- persönliche Akademie-Dashboards
- geschützte Akademie-Inhalte
- Prüfungsfragen
- persönliche Lernstände

Die öffentliche Suche enthält keine geschützten Kursinhalte der Akademie-App.

## 5. Filter

Umgesetzt wurden Filter für:

- Bereich
- Format
- Wirkungsraum
- Standards / Datenquellen
- Instrumente
- Themen

Die Filter sind als native Select-Elemente umgesetzt und damit tastaturbedienbar.

## 6. Synonyme und Aliases

Hinterlegt wurden Synonyme und Schreibvarianten für unter anderem:

- Wirkungsökonomie / WÖk / Woek / Wirkungsoekonomie
- Wirkungssteuer / WStG / WUStG / Produktsteuer / Wirkungsteuer
- Netto-Wirkungs-Index / NWI / Netto Wirkung / FinalScore
- T-SROI / TSROI / Transformational SROI
- SDG / Nachhaltigkeitsziele / UN-Ziele
- SDG+ / Demokratie / Medienqualität / Diskursfähigkeit
- GRI / Global Reporting Initiative
- CSRD / Nachhaltigkeitsberichtspflicht
- ESRS / European Sustainability Reporting Standards
- Gemeinwohlökonomie / GWÖ / ECG
- Donut-Ökonomie / Doughnut Economics
- Wellbeing Economy / Beyond GDP
- Degrowth / Postwachstum
- Narrative / Framing / politische Sprache / AfD
- Digitaler Produktpass / DPP / Produktpass

## 7. Assoziationen

Die Suche zeigt verwandte Themen an. Beispiele:

- AfD -> Wirkung politischer Sprache, Narrative, Wirkungspotenzial, Medien und Demokratie
- Steuer -> Wirkungssteuer, Steuerklassen, Von Daten zum Steuersatz, Scorecard, NWI
- Gemeinwohl -> Vergleich, Gemeinwohlökonomie, ESG, Donut-Ökonomie
- SDG -> SDGs, SDG+, GRI, CSRD, ESRS
- Reporting -> CSRD, ESRS, GRI, Wirkungsdaten, Rückkopplung

## 8. Live-Vorschau

Die Suche startet ab 2 Zeichen mit einem Debounce von 200 ms. Angezeigt werden:

- Trefferanzahl
- empfohlener Einstieg, sofern passend
- verwandte Themen
- Trefferliste mit Snippets
- Bereichs-Badge
- Pfad / URL
- Tags

Bei leerer Suche werden häufig gesuchte Themen und gute Einstiege angezeigt.

## 9. Trefferanzahl

Die Trefferanzahl wird in einem `aria-live`-Bereich aktualisiert. Screenreader erhalten dadurch Rückmeldung über neue Suchergebnisse.

## 10. Testbegriffe

Geprüft werden sollten:

- Wirkungsökonomie
- Wirkungsoekonomie
- WÖk
- Woek
- Wirkung
- Wirkungssteuer
- Wirkungsteuer
- NWI
- Netto Wirkung
- T-SROI
- TSROI
- SDG
- SDG+
- GRI
- CSRD
- ESRS
- ESG
- Gemeinwohl
- GWÖ
- Donut
- Wellbeing
- Degrowth
- AfD
- Narrative
- Sprache
- Medienwirkung
- Demokratie
- Lieferkette
- Apfel
- Steuersatz
- Steuerklasse
- Produktpass
- DPP

Die lokalen Funktionstests prüfen, ob Suchseite, JSON-Dateien, CSS und JS erreichbar sind und die JSON-Dateien valide sind.

## 11. Offene Punkte

- Pagefind kann später ergänzt werden, wenn die Website einen automatischen Build-Schritt erhält.
- PDF-Volltextindexierung ist noch nicht umgesetzt. Im MVP sind Downloads über Metadaten auffindbar.
- Suchanfragen werden im MVP nicht gespeichert. Eine spätere anonyme, aggregierte Auswertung kann in das eigene Analytics-System integriert werden.
- Die Suchindex-Pflege ist aktuell redaktionell. Für neue Seiten sollte ein Indexeintrag ergänzt oder später eine automatische Index-Pipeline eingerichtet werden.
