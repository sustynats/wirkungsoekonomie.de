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

## Nachbesserung am 6. September: Veröffentlichung statt Wiederholung

Die Nachmittagsläufe liefen technisch erfolgreich, veröffentlichten aber wegen wiederkehrender Qualitätsfehler und Priorisierung alter Prüfungen kaum neue Meldungen. Nachgewiesen wurden:

- Ein inhaltlich begründeter, an den Quellen-Fingerprint gebundener Medienbefund wurde nach seiner Zulassung erneut gegen den alten lokalen Trigger geprüft. Das Endgate verwendet jetzt denselben geprüften Befund; geänderte Quellen invalidieren ihn weiterhin.
- `duplicate_without_new_information` im Ablehnungsfeld wird als exaktes Synonym von `no_new_information` normalisiert. Der Originalcode bleibt nachvollziehbar. Fehlende Begründungen und andere ungültige Entscheidungen bleiben gesperrt; eine Ablehnung kann hierdurch niemals zur Veröffentlichung werden.
- Zahlenprüfungen für Claims, Nachrichtentext und Visuals verwenden dieselbe Normalisierung deutscher Tausender-/Dezimalschreibweisen. `5.200`, `5 200` und `5200` sind gleich; `5,2` bleibt etwas anderes. Weder Einheitenumrechnung noch eine unzitierte andere Textstelle liefert einen Beleg.
- Der Frischebonus endet nach drei Stunden Quellenalter. Bei gleicher Relevanz erhält eine erste Veröffentlichung Vorrang vor einer Routineprüfung; zeitkritische materielle Updates behalten ihren Zusatzbonus.
- `ai_retry` bindet Wiederholungswartezeiten an konkrete Quellen, Veröffentlichungsstand und Verarbeitungsversion. Erneute Feedlieferung oder eine fällige Vertiefung umgehen diese Uhr nicht. Neue Belege oder reparierte Regeln erlauben einen neuen Versuch. Historische Versuchszähler und sämtliche Kosten bleiben erhalten.
- Auch bereits wartende Quellen werden über den vorhandenen Registerabgleich ihrem tatsächlichen Publisher zugeordnet. Eine ARD-Weiterleitung wird nicht durch pauschales Freischalten fremder Domains geheilt. Unklare Zuordnungen bleiben HOLD.
- Der Lauf um 19:20 Uhr scheiterte nach seiner Analyse am erneuten Zahlencheck der gespeicherten Fassung. Zahlenbelege aus flüchtigen Artikelabrufen werden nun ohne fremden Volltext als versions- und quellengebundene numerische Prüfreferenz erhalten. Der Worker prüft die gespeicherte Darstellung vor Annahme jeder Veröffentlichung; ein fehlerhafter Übergang hält nur die betroffene Story zurück. Interne Versionsnummern zählen nicht als Leserbehauptungen.
- `processing_version` ermöglicht den Vergleich vor/nach Auslieferung. Fehlgeschlagene Workflows sichern Zustand, Ergebnisse und Nutzungsprotokoll für drei Tage als Wiederherstellungsartefakt; diese Sicherung ist kein ungeprüfter öffentlicher Release. Sie verhindert nicht jede Betriebsstörung, macht bereits bezahlte Arbeit aber wiederherstellbar.
- Der erste Live-Wiederlauf zeigte zusätzlich: Eine alte Neubewertung behandelte „keine neue Information“ als Grund, die bereits veröffentlichte Ursprungsgeschichte auszublenden. Dadurch hing ihre eigenständige WÖk-Analyse ohne aktive Ursprungsgeschichte und blockierte den Gesamtcheck. Eine reine Dublettenentscheidung erhält nun auch bei Neubewertungen den veröffentlichten Stand. Eine Relevanz-Ausblendung verlangt ausdrücklich einen materiellen Ablehnungsgrund; Quellenunsicherheit ist nicht automatisch Irrelevanz.

Die Kostenwirkung ist nach Auslieferung anhand tatsächlicher erster Veröffentlichungen zu messen, inklusive Fehlversuchen und Ablehnungen, getrennt von Vertiefungen. Vier Cent sind ein Ziel und kein aus einem einzelnen grünen Lauf ableitbarer Stabilitätsnachweis.

Vor jedem Nachrichtenlauf werden die letzten 30 fehlgeschlagenen Workflow-Läufe auf vollständige maschinenlesbare Nachrichtenberichte geprüft. Noch nicht verbuchte Berichte des aktuellen Monats werden anhand ihrer Lauf-ID genau einmal ins Nutzungsjournal übernommen. Nicht übertragene Veröffentlichungen zählen dabei als null öffentliche Meldungen; Originalzähler bleiben im Wiederherstellungsvermerk. Das erfindet weder verlorene Artikeltexte noch setzt es Kosten zurück. Unlesbare Berichte bleiben als offen markiert; das unabhängige serverseitige Kostenjournal bleibt maßgeblich. Der erste Nur-Lese-Test fand sechs fehlende Nachrichtenläufe mit zusammen 0,235042 USD gemeldeten Kosten. Vertiefungsrecherche ist in diesen Nachrichtenberichten nicht enthalten.

Bei bisher unveröffentlichten Ein-Dokument-Entwürfen wird eine inzwischen geänderte Quellüberschrift vor der Prüfung übernommen, sofern dieselbe bereits bekannte URL vorliegt. Veröffentlichte Titel und Mehrquellenakten bleiben davon unberührt. Relevanz wird nach Ergänzung aktueller Quellen erneut lokal berechnet. Fehlende Absatzumbrüche in ansonsten ausreichend langer eigener Quellenzusammenfassung werden rein typografisch eingefügt; kein Wort und kein Fakt wird ergänzt. Der Prompt präzisiert die bereits vorhandene Unterscheidung zwischen belegter Zuschreibung aus einer Einzelquelle und unabhängig bestätigter Tatsache. Sonderregeln für bestätigungsbedürftige Quellen und schwere/strittige Behauptungen bleiben unverändert.

Die um 20:00 Uhr erstmals veröffentlichte neue Wahlmeldung wurde im Live-Browser einschließlich Belegen und Folgenteil geprüft. Der Lauf kostete inklusive drei nicht veröffentlichten Prüfungen 0,051682 USD, also ungefähr 5,3 Eurocent pro erster Veröffentlichung; das Viercentziel ist damit noch nicht erreicht. Der vorherige Lauf brachte eine Aktualisierung für insgesamt 0,027041 USD, keine erste Veröffentlichung. Diese Nenner werden nicht vermischt.

Bei technischen Ablehnungen werden jetzt Wort-/Absatzzahl und fehlende numerische Claim-Belege diagnostiziert, ohne fremde Textauszüge zu speichern. Das bisherige pauschale Ausgabelimit von 6300 Zeichen kollidierte mit dem zusätzlichen Medien-Schema; nur für relevante Medienchecks gilt nun ein Gesamtlimit von 10000 Zeichen. Feldgrenzen, Eingabelimit und Evidenzregeln bleiben bestehen. Der schlanke Betriebsmonitor-Checkout enthält auch das gemeinsame Zahlenmodul; sein vollständiger Abhängigkeitstest läuft künftig vor jedem Nachrichtenlauf mit.
