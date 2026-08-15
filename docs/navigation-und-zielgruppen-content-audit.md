# Navigation und Zielgruppen-Content Audit

Stand: 22. Mai 2026

## 1. Welche Navigation war inkonsistent?

Header und Footer waren unterschiedlich gewichtet. `Quellen` stand auf manchen Seiten früh in der Hauptnavigation, auf anderen fehlte es oben. Unterordner-Indexseiten wurden nicht durch den Layout-Sync erfasst. Zielgruppen-Seiten enthielten teils eigene, minifizierte Header/Footer.

## 2. Welche zentrale Navigation gilt jetzt?

Die zentrale Navigation liegt in `assets/data/navigation.json` und wird von `tools/sync_layout.py` in `templates/header.html` und `templates/footer.html` gerendert.

Header: Start, Kompass, Scanner, Für wen, Anwendungen, Akademie, Suche, Mehr.

Mehr: Wirkungsökonomie, Modell, Ordnung, Erleben, Wissen, Methodik, SDG+, Medien & Demokratie, Blog, Buch, Downloads, Mitmachen, Glossar, Evidenz.

Footer: WÖk-Kompass, Start, Wirkungsökonomie, Modell, Kompass, Scanner, Für wen, Anwendungen, Ordnung, Erleben, Akademie, Blog, Buch, Downloads, Mitmachen, Glossar, SDG+, Methodik, Medien & Demokratie, Wirkung politischer Sprache, Suche, Natalie Weber, Über die Wirkungsökonomie, Evidenz, Impressum, Datenschutz.

## 3. Wo wurde Evidenz platziert?

`Quellen` steht nicht mehr vor Kompass, Für wen, Anwendungen oder Ordnung. Der öffentliche Einstieg heißt jetzt `Evidenz`, steht im Mehr-Menü weit unten, im Footer nahe Ende und in den Evidenz-/Stand-Panels der Zielgruppen-Seiten. Das Quellenregister bleibt als Tiefenebene unter `/quellen/` erhalten.

## 4. Welche Seiten wurden aktualisiert?

Der Layout-Sync aktualisierte 172 HTML-Dateien. Dazu gehören die geforderten Kernseiten, Zielgruppen-Seiten, Ordnung-Seiten, Quellen-Seiten, Blog-/Dossier-Seiten, Methodik-Seiten und statische Hauptseiten.

## 5. Welche Zielgruppen-Seiten wurden vertieft?

Vertieft wurden:

- `/fuer/`
- `/fuer/unternehmen.html`
- `/fuer/politik.html`
- `/fuer/buergerinnen.html`
- `/fuer/mieter.html`
- `/fuer/rente.html`
- `/fuer/wirkungseinkommen.html`
- `/fuer/journalismus.html`
- `/fuer/investoren.html`
- `/fuer/kommunen.html`
- `/fuer/akademie.html`

Die Seiten werden über `tools/generate_fuer_pages.py` aus einem gemeinsamen Schema erzeugt.

## 6. Welche Seiten bleiben draft / needs_review?

Veröffentlicht:

- Unternehmen
- Bürger:innen
- Zielgruppen-Hub

Needs review:

- Politik
- Journalismus
- Investor:innen
- Kommunen

Draft:

- Mieter:innen / Wohnen
- Rente
- Wirkungseinkommen
- Akademie

## 7. Welche Nutzenargumente wurden ergänzt?

Ergänzt wurden zielgruppenspezifische Nutzenargumente zu Resilienz, Kapitalmarktfähigkeit, Gesetzesfolgenabschätzung, ehrlicheren Preisen, Wohnwirkung, Generationenstabilität, Automatisierung, Wirkungsanalyse im Journalismus, Kapitalwirkung, Wirkungshaushalten und Wirkungskompetenz.

## 8. Welche Vorher/Nachher-Elemente wurden ergänzt?

Jede Zielgruppen-Seite enthält jetzt einen Vorher/Nachher-Vergleich: heutige Logik vs. WÖk-Logik. Beispiele sind Berichtspflicht vs. Steuerungsdaten, Symptombehandlung vs. Rückkopplung, moralische Überforderung vs. bessere Systemsignale.

## 9. Welche Beispiele wurden ergänzt?

Jede Zielgruppen-Seite enthält eine Beispielbox. Ergänzt wurden u. a. Lieferantenrisiko, Wohnen und Klimaschutz, Produktpreise mit versteckten Wirkungen, Stadtbaum als kommunale Mehrfachwirkung, Kapitalwirkung und journalistische Wirkungsanalyse.

## 10. Welche Evidenzpanels wurden ergänzt?

Jede Zielgruppen-Seite enthält ein sichtbares Evidenz-/Stand-Panel mit:

- Führender Begriffsleitfaden
- aktuelles Buch und interne Working Papers
- externe Standards und Datenrahmen
- Evidenzhub, Quellenregister und Methodikseiten
- Status und Stand
- Beratungsgrenze

## 11. Wie funktioniert Mobile?

Mobile nutzt dieselbe Navigation wie Desktop, wird vertikal geöffnet und enthält `Mehr` als aufklappbaren Bereich. `Kompass`, `Scanner` und `Suche` sind früh sichtbar. `Evidenz` bleibt unten bei Vertiefung.

Lokal geprüft auf `http://127.0.0.1:8765/fuer/unternehmen.html`: Toggle öffnet die Navigation, `Für wen` ist aktiv, `Evidenz` steht im Mehr-Menü hinten. `/evidenz/` und `/quellen/` markieren `Evidenz` im Mehr-Menü und Footer aktiv. Lange Wirkungspfad-Schritte umbrechen mobil wieder über die volle Breite.

## 12. Offene Punkte

- Die vertieften Zielgruppen-Seiten enthalten bewusst Statushinweise für `draft` und `needs_review`.
- Fachliche Detailquellen können später je Zielgruppe noch feiner verlinkt werden.
- Der Generator kann bei weiteren Zielgruppen erweitert werden.
- Browser-Regressionen sollten bei künftigen Layoutänderungen erneut visuell geprüft werden.
