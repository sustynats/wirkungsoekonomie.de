# Nachrichten: Eingabe- und Budgetkorrektur vom 4. September 2026

## Nachgewiesene Ursachen

- Die alte gemeinsame API-Grenze addierte acht Cent für jede erfolgreiche WÖk-KI-Anfrage, einschließlich der Nachrichten. Bei 625 Anfragen wurden 50 EUR erreicht. Das separate Nachrichtenjournal stand dagegen bei 7,130904 USD einschließlich historischer und unbekannter Reserven. Die beiden Zähler waren keine zwei Rechnungen.
- `evidenceGroups()` erzeugte alle Dokumentpaare auch dann mehrfach, wenn Quellen-IDs und Abhängigkeitsgrund identisch waren. Bei 26 Bundestags-Dokumenten entstanden 325 identische Vermerke; sie allein belegten etwa 25.000 Zeichen.

## Korrektur und Schutz

Das Oracle-Patch `patches/oracle-news-token-budget-20260904.patch` ersetzt den gemeinsamen Pauschalzähler durch ein serialisiertes, atomar geschriebenes Journal. Vor jeder Anbieteranfrage wird eine UUID und Reserve gespeichert. Gemeldeter Tokenverbrauch von `gpt-5.4-mini` einschließlich Cache-Tokens ersetzt danach die Reserve. Unbekannte Modelle, fehlende Usage und Abbrüche bleiben reserviert; beschädigte Dateien sind kein Nullsaldo. Parallele Reservierungen können den gleichen Restbetrag nicht mehrfach verwenden. Netzwerkaufrufe halten die Journalsperre nicht.

Die gemeinsame 50-EUR-Grenze und das eigene Nachrichtenlimit von 18,90 USD (konservativer technischer Rahmen innerhalb 25 EUR brutto) bleiben wirksam. Die gemeinsame Buchung verwendet zusätzlich die vorsichtige Umrechnung USD × 1,19 / 0,9, nicht einen behaupteten Tageskurs. Kosten nach Tokenpreisen sind weiterhin keine Anbieterrechnung.

Die explizite, idempotente Migration ersetzt nur belegte alte Pauschalbuchungen. Im gesicherten Nutzungsjournal waren 531 erfolgreiche, tokenbelegte Nachrichtenaufrufe nach Einrichtung der separaten Route nachgewiesen: 42,48 EUR alte Pauschale wurden entfernt, das vollständige separate Nachrichtenjournal übernommen und 7,52 EUR unklare Altreserve unverändert behalten. Neuer konservativer gemeinsamer Stand: rund 16,95 EUR. Historische Journale und der Beleg-Hash bleiben erhalten. Keine Zähler wurden auf null gesetzt.

Eine authentifizierte Budgetverweigerung liefert `BUDGET_EXHAUSTED` und `provider_called:false`. Der Worker wiederholt sie im selben Lauf nicht und reserviert dafür keine unbekannten Anbieterkosten. Unbestimmte HTTP-429 bleiben dagegen unbestimmt. Monitoring und Health-Prüfung kennzeichnen echte Budgetstopps weiterhin sichtbar; keine Benachrichtigung wurde deaktiviert.

## Eingabevertrag Version 2

1. Exakte Abhängigkeitsvermerke je Quellen-ID-Paar und Grund einmal übertragen; `document_pairs` behält die Anzahl. Herkunftsgruppen und Unsicherheitsstatus bleiben erhalten. Weder weitere Dokumente noch widersprüchliche Aussagen werden dadurch unabhängige Bestätigungen.
2. Bestehende verlustfreie Textreferenzen verwenden. Wenn nötig zusätzlich wiederholte Texte in `text_pool` referenzieren und Quellen/Claims in `sources_table`/`claims_table` darstellen. Ein Decoder und Rundlauf-Tests belegen identische Inhalte, Rollen, Nullwerte, ausgelassene Eigenschaften und IDs.
3. Erst danach greift die bestehende ausdrücklich unvollständige Auswahl optionaler Artikelpassagen. Keine Quelle und kein Claim wird zum Erreichen einer pauschalen Quellenzahl entfernt. Unauflösbar große Eingaben bleiben sichtbar vorgemerkt; keine Behauptung unbegrenzter Kapazität.

Der aktuelle Offline-Wiederlauf prüfte 29 anstehende Kandidaten ohne reale Anbieteranfragen. Größte Anfrage: 36.374 Zeichen. Beide zuvor blockierten Fälle einschließlich zusätzlicher Artikelpassagen und verwandtem Kontext passen unter die unveränderte Grenze von 39.000 Zeichen. Die beiden Fehlerfälle sind eingefrorene Regressionstests.

## Betrieb / Rückfall

Oracle-Release: lokaler Commit `036e955` im geprüften Service-Abbild. Produktionsänderung am 2026-09-04 um 17:32 UTC. Backup: `/home/ubuntu/woek-budget-release-DNNPPe/before-code.tgz`, `before-api-usage.json`, `before-news-budget.json`; dort liegt auch `news-usage-proof.json`. Health nach Neustart: HTTP 200, `ok:true`. Lokale vollständige Service-Prüfung: TypeScript, 47 Tests, Build erfolgreich. Private Journale bleiben ausschließlich auf Oracle. Das Staging liegt außerhalb des Anwendungsbaums, damit Test-Discovery keine unvollständigen Staging-Kopien ausführt.

Code-Rollback: Dienst kontrolliert stoppen, Code-Backup wiederherstellen, Dienst starten. **Nach neuen Anbieteraufrufen nie das alte Kostenjournal zurückkopieren**, da dies neue Kosten verlieren würde. Die Sicherungen dienen dem Audit; eine erneute Ledger-Migration muss den dann aktuellen Stand berücksichtigen. Worker-Rollback berührt keine veröffentlichten Akten oder deren Historien.

Auslieferung weiterhin GitHub/Oracle. Kein Vercel-Build, keine neue Infrastruktur und keine Erhöhung eines Budgets.
