# Redaktions-Wiederanlauf und Webserverlast - 11.10.2026

Die Verarbeitung wird ueber die bestehenden GitHub-Worker und Oracle-Dienste
repariert. Keine neue Queue, kein Infrastrukturwechsel, kein Vercel-Build und
keine Aenderung von Modellen, Budgets, Zugriffsschutz oder Schlussfreigaben.

## Korrekturen

- Ein ungelieferter `attempt_exhausted`-Auftrag, eine erschoepfte Auftragsliste
  oder eine weiter ungueltige Cacheantwort macht den Worker sichtbar fehlerhaft.
  Ein gelieferter Entwurf oder begruendeter redaktioneller HOLD bleibt ein Ergebnis.
- Verlorene HTTP-Bestaetigungen der eigenen `github-attempt:`-Checkpointwrites
  werden unter dem bestehenden exklusiven Import-Lock zurueckgelesen. Ein
  passender gespeicherter Stand wird akzeptiert. Nur bei nachgewiesen unveraendertem
  Vorzustand folgt hoechstens ein identischer Journalwrite. Unklare Readbacks,
  fremde Aenderungen und Authentifizierungsfehler bleiben Stoppsignale. Keine
  Wiederholung von Modellaufrufen, Dateiverschiebungen oder Freigabeentscheidungen.
- Der Worker liest eine paginierte SQL-Projektion ausschliesslich offener
  Redaktionsauftraege statt saemtlicher historischer Nachrichten mit Volltexten.
  Der alte Server faellt nur bei ausdruecklich unbekannter Operation auf den
  bisherigen Weg zurueck. Authentifizierungs- und Lockfehler werden nicht umgangen.
- Die private Auftragsliste entfernt Artikel, Staging und grosse Historien schon
  in SQLite, vor der JSON-Materialisierung im Webserver. Titel und das Vorliegen
  eines wirklichen Vorschautextes bleiben sichtbar. Originaldaten und der
  eigentuemergepruefte Volltext-Vorschauweg bleiben unveraendert.
- Gleichzeitige Webanfragen derselben Sitzung teilen genau eine aktuelle
  Berechtigungspruefung. Der bestehende 30-Sekunden-Cache wird nicht verlaengert.
  Eine haengende Pruefung liefert vor dem Client-Abbruch eine begrenzte HTTP-503-
  Antwort statt einer falschen Login-Ablehnung; die Sitzung wird nicht geloescht.

## Auslieferung und Rueckfall

GitHub nutzt die Worker-Korrektur erst nach Merge in `main`. Die Workerversion
wird absichtlich nicht erhoeht: Ein Versionssprung wuerde alte bezahlte Versuche
erneut zulassen und waere keine kostenlose Wiederherstellung.

Die Oracle-Aenderungen sind separat backup-first auszuliefern, gemaess
`docs/news/PRIVATE-EDITORIAL.md`: SQLite-Backup und Integritaetspruefung,
aktuellen Release-Link/Unit/Caddy sichern, neue commitgebundene Runtime pruefen,
Linkwechsel und kontrollierter Dienstneustart ohne Enteignung laufender Writer.
Danach lokale HTTP-Latenz, echter Eigentuemerkonto-Login, Auftragsliste und
Vorschau pruefen. Bei einem Fehler den vorherigen Runtime-Link wiederherstellen;
kein Datenbank-Rollback und keine Ruecksetzung menschlicher Entscheidungen.

Ein alter `started`-Versuch ohne verifizierbaren Anbieterbeleg bleibt unklar und
wird nicht automatisch erneut bezahlt. Private Antwortarchive/Workflow-Belege
pruefen; vorhandene Antworten ueber den regulaeren Import wiederverwenden.
Ein lokales Manuskript ist noch keine in der App bereitgestellte Freigabefassung.

## Nachrichten-Spur: Guthaben-/Limitfehler nicht zu Geheimnissen machen

Der Lauf `38117764016` vom 11.10. meldete zwei Anbieterfehler nur als
`[redacted]`, ohne neue Nachricht. Der Laengenschutz in `run.mjs` maskierte
auch die drei bereits vom Transport normalisierten festen Billingcodes.
Dadurch ging nicht nur die Diagnose verloren: Der vorhandene Stopp nach der
ersten Guthaben-, Ausgaben- oder Quotenablehnung erkannte seinen Code nicht
mehr und begann den naechsten Nachrichtenbatch.

Nur diese drei exakten internen Codes bleiben nun wie die vorhandenen
Formatfehler sichtbar. Unbekannte Meldungen, angehaengte Texte und Zugangswerte
bleiben geschwaerzt. Mengen, Modelle, Kostengrenzen, Anbieterretries,
Verarbeitungsfingerprints und historische Versuche werden nicht veraendert.
Die Regression prueft den vollstaendigen Nachrichtenlauf mit zwei verschiedenen
ausgewaehlten Updates und simulierten HTTP-Antworten: ein Aufruf, null Kosten,
sichtbarer Sperrcode, keine Publikation und unveraenderte veroeffentlichte Texte.

Die Unterscheidung von temporaerem 429 und Guthaben-/Ausgaben-/Quotensperre
entspricht der am 11.10. gelesenen
[OpenAI-Fehlerdokumentation](https://developers.openai.com/api/docs/guides/error-codes).
Der alte geschwaerzte Bericht belegt allein noch nicht, welche dieser Sperren
aktuell vorliegt. Das muss ein frischer regulaerer Lauf nach dem Merge zeigen;
kein zusaetzlicher bezahlter Diagnoselauf und keine blinde Budgeterhoehung.

## Lokale Regressionen

Der regulaere Nachrichtenlauf `38124492776` blieb am 11.10. gruen, obwohl
die Freigabequittung `BRIDGE_REMOTE_INVALID_RESPONSE` meldete. Die CLI liefert
bei technischen Fehlern und fehlgeschlagenen Einzeluebernahmen nun Exit 1.
Die bestehenden Continue-on-error-Schritte lassen Nachrichten, Build, Push,
Deployment und Antwortarchivierung weiterhin laufen. Erst danach macht ein
abschliessendes Gate den Gesamtprozess rot. Ein leerer erfolgreicher Readback
oder ein definitiv belegter Lane-Wartezustand wird nicht als technische
Abweisung behandelt. Unklare Quittungen werden nicht blind wiederholt; weder
Freigaben noch Kosten-/Modellregeln werden dadurch veraendert.

Vor der Oracle-Installation wird die neue `store.editorialJobs`-Operation
ausserdem gegen den wirklichen HTTP-Handler geprueft. Ein bisheriger
Praefixvergleich haette diesen reinen Journalread faelschlich an die private
Finalize-Aktion geleitet. Nur die drei ausdruecklichen Claim-/Finalize-/Failure-
Operationen erreichen nun diese Aktionen. Eigentuemertoken, Lane-Locks und
Import-Lane-Grenzen bleiben unveraendert; es gibt keine neue Abschlussentscheidung.

```sh
node --test tests/news/editorial-receipt-health.test.mjs
node --test tests/news/bridge-editorial-dispatch.test.mjs
node --test tests/news/editorial-auth-throughput.test.mjs tests/news/editorial-checkpoint.test.mjs tests/news/redaktionsworker.test.mjs tests/news/editorial-intake.test.mjs tests/news/bridge-queue-pagination.test.mjs tests/news/bridge-remote-read-retry.test.mjs
node --test tests/news/news-provider-refusal.test.mjs tests/news/direct-operation.test.mjs tests/news/budget-throughput.test.mjs tests/news/source-run-health.test.mjs
npm run news:test
```

Geprueft werden verlorene Write-Bestaetigungen vor/nach Anbieterantwort,
Einmalaufruf, unveraenderte Freigaben, begrenzte Wiederholung, alte Server,
Authentifizierungsfehler, parallele/haengende Sitzungspruefungen und grosse
private Manuskripte. Ein bestandener Test ist kein Oracle-Deploymentnachweis.
