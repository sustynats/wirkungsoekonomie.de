# Batch-Kosten: kostenlose Ablehnung und spätere Annahme auseinanderhalten

Stand: 8. September 2026. Technische Korrektur, keine Budgeterhöhung oder Inhaltsänderung.

## Nachgewiesener Fehler

Prüfbasis: `8dc9cdf7eb4caf2ffc44850ff78bbdf050390019` auf `main`. Zwei identische Auftragsschlüssel waren zunächst lokal kostenlos abgewiesen und erst am folgenden UTC-Tag angenommen worden:

| Key-Ende | Unveränderter ursprünglicher Journalbeginn | Späterer Auftragsbeginn in `state.batch_jobs` |
| --- | --- | --- |
| `ff4f9021` | 2026-09-07T16:39:19.809Z | 2026-09-08T00:08:24.951Z |
| `247b93d7` | 2026-09-07T22:09:44.497Z | 2026-09-08T00:08:28.499Z |

`account()` verwendete erneut dieselbe Kostenzeile, aktualisierte aber ihren Zeitbezug nicht. Dadurch erschienen spätere Batch-Kosten im früheren Beobachtungsfenster; beim Monatswechsel wäre auch die lokale Budgetzuordnung falsch gewesen. Zusätzlich blieb das Abschlussdatum der kostenlosen Ablehnung bei einer später aktiven Einreichung erhalten. Wiederholtes Abholen fertiger Antworten setzte den Abschluss immer erneut auf die aktuelle Prüfzeit.

## Korrektur und Grenzen

- `started_at` bleibt bestehen; additive, herkunftsmarkierte `cost_started_at`-Metadaten bestimmen den Kostenzeitraum. Vor bestätigter Annahme gilt konservativ der Beginn der aktuellen lokalen Reserve.
- Authentifizierte passende Auftragsmetadaten liefern den tatsächlichen Auftragsbeginn. Modellantworten, fremde Identitäten sowie ungültige oder zukünftige Zeitstempel sind kein Beleg.
- Bisherige Zeitbezüge und entfernte Abschlussmarker werden in `batch_timing_history` erhalten. Neue Felder erzeugen keine zweite Kostenzeile.
- Abrechnungssummen, Tarife, offene Reservierungen, Budgetgrenzen, Fingerprints, Qualitätsgates und Artikelversionen bleiben unverändert.
- Bereits abgeschlossene oder angewendete Datensätze werden beim regulären Metadatenabruf nachgetragen. Kein erneutes Anwenden, kein zusätzlicher bezahlter Auftrag, keine manuelle Massenmigration.
- Kostenfenster, Tagesbericht, UTC-Monatsbudget, Stundenlimit und Aufbewahrung verwenden eine gemeinsame Zeitfunktion. Alte Datensätze ohne belastbare Zusatzmetadaten behalten ihren bisherigen Zeitbezug.
- Dies ist weiterhin eine auf Anbieter-Tokens beruhende Betriebskostenschätzung, keine Rechnung. Die unmittelbaren Nachrichtenkosten bleiben von Hintergrund-Batch, Autorenanalysen, Bildern und Hosting getrennt.

## Regressionen

Drei neue Prüfungen waren vor der Korrektur rot: spätere Annahme nach kostenlosem Nein, Nachtrag einer bereits abgeschlossenen Alt-Zeile und korrekte Zuordnung im neuen Kostenfenster. Ergänzend geprüft: UTC-Monatswechsel, Stundenlimit, Aufbewahrung aktueller Kosten, Berliner Tageswechsel, unveränderte Originaldaten/Beträge, idempotente Abholung und Ablehnung fremder/ungültiger Metadaten. Die bestehenden Tests für verlorene Antworten, Authentifizierung, Preisprüfung und geänderte Fakten bleiben unverändert.

Lokaler Prüfstand: 620 News-/Betriebsmonitor-Tests bestanden, ebenso `npm run typecheck`, `npm run news:build`, `npm run news:validate`, `git diff --check` und beide Hosting-Kostengates. Kein Vercel-Build und kein kostenpflichtiger KI-Testlauf. Veröffentlichung über das vorhandene GitHub-Release und automatische Übernahme im regulären Nachrichtenworkflow; produktive Nachträge müssen anschließend im Journal kontrolliert werden.

Die Reparatur ist keine Aussage, dass die übrige Nachrichtenwarteschlange vollständig abgearbeitet oder das Vier-Cent-Ziel dauerhaft erreicht ist. Quellenklärungen und fachliche Qualitätsablehnungen bleiben eigenständige Prüfaufgaben.
