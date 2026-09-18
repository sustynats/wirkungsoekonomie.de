# Meine Einordnung automatisch übernehmen

Stand 18. September 2026.

Natalie: „Meine Einordnung sollte automatisiert erfolgen. Wir hatten ja mal
einen Prozess, wo ChatGPT mit eingebunden war. Wenn ChatGPT nur diese Antwort
liefern muss, könnte der Prozess funktionieren. Der war ja vorher an anderen
Dingen gescheitert."

## Warum dieser Schnitt trägt, wo die alte Bridge scheiterte

Die Ablösung am 15.09.2026 nannte drei Ursachen: 801 Meldungen bis zu acht Tage
in der Warteschlange, **276 Aufträge geclaimt und nie geliefert**, und
Wirkungsbewertungen, die als `insufficient_basis` zurückkamen statt als
modelliertes Potenzial. Alle drei betreffen Teile, die dieser Weg nicht braucht.

| Alte Ursache | Warum sie hier nicht greift |
| --- | --- |
| Geclaimt und nie geliefert | Es wird nichts geclaimt. Bleibt die Antwort aus, bleibt die abgeleitete Einordnung stehen. |
| `insufficient_basis` bei der Bewertung | Fakten, Quellen und MPD bleiben bei der API. Übernommen wird ein Abschnitt. |
| Tage in der Warteschlange | Der Beitrag ist längst veröffentlicht. Die Einordnung kommt als Korrekturfassung nach. |

Und: **kein Dropbox, keine Zugangsdaten, kein Claim-Protokoll.** Die
Arbeitsliste und der Beitrag sind öffentlich lesbar; der Rückweg ist ein Issue.

## Der Ablauf

1. **Der Bau schreibt die Arbeitsliste.**
   `https://wirkungsoekonomie.de/wirkungsticker/data/einordnung-offen.json`
   nennt die veröffentlichten Beiträge, die noch auf Natalies Stimme warten
   (Kennung, Titel, Art, Adresse). Offen heißt: `revision` ist noch 1.
2. **ChatGPT antwortet.** Eine Aufgabe in ihrem eigenen Konto liest die Liste
   und den Beitrag, schreibt die Einordnung und öffnet ein Issue
   `[EINORDNUNG] <slug>` mit dem Text im Körper.
3. **GitHub prüft und reiht ein.** `einordnung-uebernehmen.yml` ersetzt
   ausschließlich den Abschnitt „Meine Einordnung", prüft ihn und legt die
   Fassung über `korrekturfassung.mjs` ab - **ohne bezahlten Aufruf**.
4. **Natalie gibt frei.** Die Fassung erscheint in der Redaktions-App. Erst ihre
   Freigabe bringt sie live. Diese Regel bleibt: auch ChatGPT ist ein Modell.

## Was geprüft wird, bevor etwas in die Freigabeliste kommt

- 300 bis 2600 Zeichen.
- **Keine neuen Zahlen.** Zahlen aus dem Beitrag darf die Einordnung aufgreifen,
  eigene nicht - eine Einordnung gewichtet Belegtes, sie belegt nichts Neues.
- Keine Adressen und keine eigenen Überschriften.
- Kein Verfahrensvermerk und keine Anrede der Redaktion
  (`EDITORIAL_PROCESS_NOTE_IN_TEXT`, siehe den Vorfall vom 18.09.2026).
- Befund, Quellen und Wirkungsbewertung bleiben Zeichen für Zeichen unverändert.

Der Issue-Text ist **Daten**: er wird geprüft und eingereiht, nie ausgeführt.
Nur Issues aus dem eigenen Konto lösen den Lauf aus.

## Die Aufgabe für ChatGPT (wörtlich einsetzbar)

Natalie richtet nichts von Hand ein und stößt nichts stündlich an. Sie gibt
ChatGPT **einmal** diesen Text; ChatGPT legt daraus selbst eine wiederkehrende
Aufgabe an und führt sie danach serverseitig aus.

> Lege dir hierfür eine wiederkehrende Aufgabe an, die stündlich läuft, und
> führe sie ab dann selbstständig aus. Geht stündlich nicht, nimm das kürzeste
> mögliche Intervall und sag mir, welches es ist.
>
> Bei jedem Lauf:
>
> 1. Lies `https://wirkungsoekonomie.de/wirkungsticker/data/einordnung-offen.json`.
> 2. Sieh im Repository `sustynats/wirkungsoekonomie.de` nach, zu welchen
>    Kennungen es schon ein Issue mit dem Titel `[EINORDNUNG] <slug>` gibt -
>    offen oder geschlossen - und überspringe diese. Bleibt kein Eintrag übrig,
>    beende den Lauf ohne Ausgabe und ohne Nachricht an mich.
> 3. Nimm den obersten verbliebenen Eintrag und lies den Beitrag unter seiner
>    Adresse vollständig.
> 4. Schreibe meine persönliche Einordnung für diesen Beitrag: meine Haltung aus
>    unserer Zusammenarbeit, angewandt auf die belegten Befunde des Beitrags,
>    nach der wirkungsökonomischen Methodik - Folgen vor Fakten,
>    Nichtkompensation und Reverse Merit Order, materielle Schutzgrenzen,
>    Korrekturfähigkeit, Systemresilienz. Gewichte, was der Beitrag belegt hat,
>    und benenne Offenes als offen. Schreibe in der ersten Person.
> 5. Halte diese Grenzen ein, sonst wird der Text abgewiesen: 300 bis 2600
>    Zeichen, keine Überschriften, keine Links oder Adressen, **keine Zahl, die
>    nicht im Beitrag steht**, keine erfundenen Erlebnisse, keine behauptete
>    eigene Prüfung, keine Frage und keine Anrede an die Redaktion.
> 6. Öffne im Repository `sustynats/wirkungsoekonomie.de` ein Issue mit dem Titel
>    `[EINORDNUNG] <slug>` - genau die Kennung aus der Liste - und dem Text als
>    Körper, ohne Vorwort und ohne Formatierung drumherum.
> 7. Kommt an dem Issue ein Kommentar mit einem Fehlercode zum Text zurück
>    (`EINORDNUNG_NEUE_ZAHL`, `EINORDNUNG_ZU_LANG`, `EINORDNUNG_ZU_KURZ`,
>    `EINORDNUNG_QUELLE_IM_TEXT`, `EDITORIAL_PROCESS_NOTE_IN_TEXT`), dann
>    korrigiere genau diesen Punkt und öffne ein neues Issue mit demselben Titel.
>    Bei `EINORDNUNG_TECHNISCHER_FEHLER` liegt der Fehler auf unserer Seite:
>    nichts ändern, kein neues Issue - es wird erneut verarbeitet.

Voraussetzung: ChatGPT braucht Zugriff auf GitHub für Schritt 2, 6 und 7. Der
bestand schon - der alte Bridge-Kanal lief über dieselben Issues.

## Takt

Natalie am 18.09.2026: „ChatGPT soll nur 1x täglich laufen? Ich würde eher
sagen stündlich. Weil Meinung&Analyse permanent anfallen kann." Also stündlich,
ein Beitrag je Lauf. Das kostet nichts: kein bezahlter Aufruf, und ohne offenen
Eintrag endet der Lauf ohne Ausgabe.

Zwei Sperren verhindern, dass der stündliche Takt dieselbe Meldung mehrfach in
die Freigabeliste legt:

1. **Die Aufgabe überspringt**, was schon ein `[EINORDNUNG]`-Issue hat.
2. **Der Server lässt nur eine offene Korrekturfassung je Beitrag zu**
   (`already_pending`). Diese Sperre gilt unabhängig davon, was die Aufgabe tut
   - auch wenn sie dieselbe Kennung erneut schickt. Erst wenn Natalie
   freigegeben hat, ist der Beitrag wieder frei; dann steht er ohnehin auf
   `revision 2` und fällt von der Liste.

Ein Eintrag bleibt also genau so lange sichtbar, bis eine Fassung eingereiht
ist - und wird trotzdem nur einmal bearbeitet.
