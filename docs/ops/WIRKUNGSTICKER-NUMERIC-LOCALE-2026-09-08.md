# Nachrichtenpruefung: Quellsprache bei Zahlen erhalten

Stand: 8. September 2026, Nachkontrolle ab 7. September 23:52 UTC.

## Nachgewiesener Fehler

Im Hauptzweig `ce88942ba3fe1004434d9bb1579beece16bac37f` laeuft der Nachrichtenbetrieb wieder. Die Meldung `wt-b161eb7e7c403472` wartet unter anderem wegen `CLAIM_NUMBER_NOT_IN_EVIDENCE` und `AI_UNSUPPORTED_NUMBER:1300`. Ihr englischer Euronews-Titel enthaelt `1,300`; die bereits gespeicherte Quellsprache lautet `en`. Die gemeinsame Zahlenfunktion las trotzdem ausschliesslich deutsche Notation und normalisierte diesen Beleg zu `1.3`. Umgekehrt wurde ein englischer Dezimalpunkt mit drei Nachkommastellen teilweise als Tausendertrennzeichen behandelt. Das ist ein lokaler Interpretationsfehler, kein Nachweis eines falschen Quellenfakts und kein Provider-Ausfall.

## Begrenzte Korrektur

- Explizit englische Quellenmetadaten erlauben englische Tausenderkommas; Dezimalpunkte bleiben Dezimalpunkte. Fehlende oder unbekannte Sprache behaelt den bisherigen deutschen Standard. Keine automatische Spracherkennung und keine Groessen-/Einheitenumrechnung.
- Zahlen aus Quellen werden je Quelle verarbeitet, nicht erst nach Zusammenziehen verschiedensprachiger Texte. Claims nutzen die Sprache der exakt zugeordneten Quelle, niemals eine vom Modell behauptete Sprache im Belegobjekt.
- Nachrichten-, Claim- und Visual-Pruefung sowie zahlenbasierte Diagnosen nutzen dieselbe Interpretation. Quelltexte werden nicht veraendert oder neu gespeichert.
- Neue numerische Belegquittungen speichern den verwendeten Sprachkontext. Aenderungen dieses Kontexts machen sie ungueltig; vorhandene historische Quittungen werden nicht still umgedeutet.
- Nicht zitierte Zahlen, falsche Groessenordnungen, ungueltige Quellenzuordnungen und Datumsangaben allein aus einer URL bleiben abgelehnt. Die anderen Fehler dieser wartenden Meldung werden nicht freigegeben. Der vorhandene automatische Retry bleibt zustaendig.

Sechs neue Regressionen wurden vor der Reparatur rot reproduziert; ein weiterer Test sichert historische Quittungen. Keine zusaetzliche KI-/Bildanfrage, kein manuelles Publizieren, keine neue Quelle und keine Aenderung an Budget, Queue, Quellen- oder Medienwirkungs-Gates. Der Investigation-Skill wurde zur Fehlerabgrenzung und Reproduktion genutzt; Vercel ist nicht am Release beteiligt.

## Messstand vor dieser Korrektur

Um 23:55 UTC: 13 offene Pruefungen, davon acht Kapazitaetswartefaelle, zwei Qualitaetswiederholungen und drei Quellen-Holds. 16 Erstveroeffentlichungen seit dem Wiederanlauf ab 20:35 UTC sind im Live-Feed belegt; die drei juengsten Detailseiten liefern HTTP 200. Nachrichtenworkflow und Pages laufen automatisch, der API-Healthcheck ist erfolgreich.

Im gemischten Aufholbetrieb: 101 direkte KI-Anfragen, 16 Erstveroeffentlichungen und zwei Updates fuer 0,637270 USD. Mit dem gespeicherten ECB-Kurs vom 4. September (1,1622 USD/EUR) und 19 Prozent Steuerreserve sind das rund 0,6525 EUR bzw. 4,08 Cent je Erstveroeffentlichung, einschliesslich Fehlversuchen und Ablehnungen. Seit der Septemberfreigabe um 13:27 UTC sind es 31 Erstveroeffentlichungen, sechs Updates und 1,789039 USD bzw. rund 5,91 Cent je Erstveroeffentlichung. Das ist kein Nachweis eines dauerhaft erreichten Viercent-Routineniveaus.

Getrennt seit dem Wiederanlauf: synchrone Autoren-/Hintergrundvertiefungen 0,712187 USD (eine Erstveroeffentlichung, zwei Updates, inklusive erfolgloser Versuche). Batch insgesamt unveraendert acht abgerechnete Jobs fuer 0,042641 USD, sieben angewendet, keine offene Providerreservierung im Repository. Unbekannte historische Oracle-Reserven bleiben unangetastet. Bilder und Hosting sind nicht in diesen Nachrichten-Stueckkosten enthalten.

## Pruefung und Auslieferung

Nachrichten- und Monitor-Tests, Typecheck, Nachrichten-Build/-Validierung, Diff-Pruefung und beide Hosting-Kostengates vor dem Push. Parallel eingetroffene Bot-Daten werden vor dem Release unveraendert uebernommen. Auslieferung ueber den bestehenden GitHub-Nachrichten-/Pages-Weg; keine zusaetzlichen bezahlten Wiederholungen. Die halbstuendliche Kontrolle bleibt wegen des noch vorhandenen alten Rueckstands aktiv.
