# Nachrichtenfluss und Betriebskosten – 6. September 2026

## Befund und Freigabe

Nach der Laufreparatur vom frühen Morgen blieben 26 Kandidaten unter der
vorsorglich erhöhten KI-Zulassungsschwelle (48 statt 30 Punkte). In 21 gespeicherten
Läufen wurden 98 neue Feed-Einträge erkannt, aber keine Nachrichten veröffentlicht.
Die rund 13,42 USD im internen Kostenbuch enthielten Einrichtungsverbrauch; dies ist
keine Anbieterabrechnung. Das technische Limit von 18,90 USD war nicht ausgeschöpft.
Die Projektinhaberin beauftragte am 6. September die Wiederaufnahme und eine
Betriebskostenmessung mit Ziel **unter 4 Cent je veröffentlichter Nachricht**.

## Dauerhafte Steuerung

- Fachliche Zulassung unverändert ab 30 Punkten; Quellen-, Evidenz-, Dubletten-,
  Fakten-, Medien- und sonstige Publikationsgates bleiben unverändert.
- Ab 70 % des Budgets höchstens acht, ab 85 % höchstens vier Kandidaten je Lauf.
  Darunter gilt die konfigurierte Laufkapazität. Die Stundenbegrenzung hat Vorrang.
- Ältere offene Fälle erhalten weiterhin einen reservierten Anteil der Plätze.
  Ein abgeschlossener Kandidat kann auch eine begründete Ablehnung oder Bündelung sein.
- Ab 95 % bleibt der bestehende Sicherheitsstopp erhalten. Vor jedem weiteren
  KI-Aufruf wird die bestehende Reservierung gegen das Restbudget geprüft.
- Das Monatsbudget bleibt 25 EUR einschließlich der bestehenden Sicherheitsreserven.
  Kein Kostenbuch-Reset, keine rückwirkende Umdeklaration, kein zusätzlicher Anbieter.

## Fortschritt statt bloß grüner Läufe

`queue_completed` zählt abgearbeitete alte Queue-IDs, auch bei korrekter Ablehnung.
Der vorhandene Discord-Monitor erkennt mindestens zwei Stunden ohne Publikation,
Update oder Queue-Abschluss bei weiter wartenden Kapazitätsfällen. Mindestens drei
Laufberichte und eine zweite Monitorbeobachtung sind erforderlich. Keine neuen
Nachrichten ohne Queue sind kein Fehler. Ein leerer Nachrichtenstrom ist niemals
Grund, die Evidenzprüfung zu umgehen oder eine Publikationsquote zu erzwingen.

## Kostenmessung

Die bestehende Zustandsdatei erhält beim ersten neuen Lauf einmalig
`cost_monitoring_started_at`. Der Laufbericht enthält `cost_monitoring`; der
Discord-Tagesbericht zeigt denselben Messzeitraum. Historischer Verbrauch bleibt
unverändert für Monatslimit und Monatsbericht relevant.

- Zähler: gesamte Nachrichten-KI-Kosten im Messzeitraum, einschließlich verworfener
  Ausgaben, Fehlversuche, Wiederholungen, Aktualisierungen und Medienprüfungen.
- Nenner: automatische Erstveröffentlichungen. Zusätzlich werden Aktualisierungen
  und Kosten pro Veröffentlichung/Aktualisierung getrennt ausgewiesen.
- Eigenständige WÖk-Analysen werden separat gezählt und bepreist.
- Euro-Umrechnung mit geprüftem ECB-Kurs und 19 % Steuerreserve.
- Keine Veröffentlichung oder fehlende Kosten/Kursdaten: kein künstlicher Nullwert.
- Anbieter-Tokenwerte, Cache-Hits und konservative Ersatzschätzungen bleiben
  unterscheidbar. Preise × Tokens sind Schätzungen, keine Rechnungsdaten.
- Bildcredits und Hosting sind nicht Teil dieser KI-Stückkosten. Auch unter
  4 Cent je Nachricht gilt weiterhin das Monatsbudget.

## Regressionen

28 Kandidaten unter der alten Schwelle werden in begrenzten Batches vollständig
zugeführt; harte Budget-, Stunden- und Relevanzgrenzen bleiben wirksam. Tests
prüfen Altersreserve, abgeschlossene Ablehnungen als Fortschritt, Stillstand bei
grünen Läufen, leere Queue, Kostennenner, Fehlversuche, Deep-Dive-Trennung,
Einrichtungsabgrenzung ohne Mutation, Duplikate und fehlende Kostendaten.

Diese Tests belegen den Ablauf, nicht die Veröffentlichungsfähigkeit aller Kandidaten.

## Eindeutige KI-Entscheidung

Eine fehlende, als Text gelieferte oder anderweitig nicht boolesche
`publication_recommendation` ist ein wiederholbarer Formatfehler, keine
redaktionelle Ablehnung. Nur ein ausdrücklich boolesches `false` zählt als
Veröffentlichungsablehnung. Es wird niemals automatisch zu `true` geändert.
Das bestehende Entscheidungsprotokoll speichert die boolesche Empfehlung oder
`null` sowie den Ablehnungscode. Alte Protokolle ohne diese Unterscheidung
werden nicht nachträglich als Zustimmung interpretiert.

Ein einmaliger lokaler Scan nimmt nur nie veröffentlichte Altentscheidungen mit
dem alleinigen, früher mehrdeutigen Fehlercode und ohne dokumentiertes boolesches
Nein erneut in die normale begrenzte Queue auf. Die frühere Ablehnung bleibt in
der Historie; der Scan selbst veröffentlicht nichts. Explizite Ablehnungen,
zusätzliche fachliche Ablehnungsgründe und historische Veröffentlichungen werden
nicht wieder geöffnet. Die Prüfung läuft unter denselben Kosten- und Quellengates.
