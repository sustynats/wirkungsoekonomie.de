# Wirkungsticker: automatische Wiederaufnahme und Veröffentlichung

## Gefundene Ursachen

1. Alte Qualitätsfehler hatten nach drei Versuchen keinen weiteren Termin. Außerdem wurden unvollständige Ausgaben mit einem zusätzlichen Ablehnungscode als endgültige Redaktionsentscheidung behandelt.
2. Vier lokal bereits aussortierte Kandidaten blieben als Kapazitätswarteschlange erhalten.
3. Eine historische HTTP-Dublette des identisch bekannten HTTPS-Artikels blockierte dessen Quellenprüfung.
4. Der Sachsen-Anhalt-Komplex überschritt mit verwandten Akten und Medienkontext die Eingabegröße. Mehrere Promptabsätze erklärten denselben Transport; alte Belegformat-Anweisungen widersprachen der verbindlichen evidence_id-Ausgabe.
5. Ein Nachrichtenlauf kollidierte am 5. September um 20:40 UTC mit einem Release an erzeugten Quellenseiten. Der bisherige Git-Publisher brach bei jedem Rebase-Konflikt ab.
6. Deep-Dive-Korrekturhinweise gingen zwischen Worker-Läufen verloren. Der Discord-Bericht las zudem `total`, während die Worker-Queue `after` liefert.

## Dauerhafte Korrekturen

- Alte fehlerhafte Ausgaben werden wieder aufgenommen. Weitere Fehlschläge erhalten Wartezeiten von 15 Minuten bis höchstens 12 Stunden; vorhandene Stunden-/Lauf-/Budgetgrenzen bleiben wirksam. Reine gültige redaktionelle Ablehnungen werden nicht durch dieselben unveränderten Daten erneut bezahlt.
- Formale Fehler, nicht belegte Zahlen, unbelegte Unabhängigkeit und kausale Überbehauptungen können neu formuliert werden, müssen aber danach dieselben Qualitätsgates bestehen. Keine automatische Herabsetzung der Prüfregeln.
- Lokal abgeschlossene Ablehnungen werden aus der aktiven Warteschlange genommen; bestehende Veröffentlichungen und Versionshistorien bleiben erhalten. Neue materielle Quellen können eine erneute Prüfung auslösen.
- HTTP-Aliase werden nur bei einem bereits vorhandenen identischen HTTPS-Beleg derselben Quelle bereinigt. Abweichende Texte, Rollen, Provenienz oder Forschungsmetadaten bleiben getrennt. Keine URL wird erfunden.
- Der Prompt ist ohne Verlust von Quellen, Claims oder Methodik kompakter. Ein eingefrorener Regressionstest enthält den tatsächlichen September-5-Grenzfall einschließlich verwandter Akten und Medienkontext.
- Bei parallelem Release werden ausschließlich nachweislich erzeugte Publikationsdateien neu gebaut. Kanonische Daten und Programmcode werden nicht durch Wahl einer Konfliktseite überschrieben. Kein Force-Push; maximal drei Push-Versuche. Echte kanonische Konflikte bleiben geschützt und schlagen sichtbar fehl.
- Deep Dives speichern Fehlerhinweise und den nächsten Versuch im vorhandenen Analysenspeicher, gebunden an Quellenfingerprint und Methodikversion. Neues Material wird unmittelbar neu beurteilt; erfolgreiche Veröffentlichungen löschen den Retry-Status.
- Der Discord-Bericht übernimmt die tatsächliche verbleibende Queue-Anzahl.

## Prüfung

- Isolierte Tests simulieren eine echte Git-Kollision zwischen Release und Nachrichtenlauf; das Ergebnis enthält sowohl die neue Vorlage als auch die neuen Nachrichtendaten.
- Regressionen prüfen Legacy-Retries, Wartezeiten, defekte Ablehnungen, lokale Ablehnungen, Quellenalias-Grenzen, vollständige Eingabereferenzen und Deep-Dive-Wiederaufnahme.
- Der lokale Lauf mit dem Bestands-Snapshot löst alle bisherigen technischen Vorprüfungsblockaden; vier lokale Ablehnungen werden abgeschlossen. KI-Antworten wurden hierbei ausschließlich gemockt. Das ist kein Nachweis, dass sämtliche verbleibenden Inhalte publikationsfähig sind.
- Produktive Belege und Quellenunsicherheit bleiben Veröffentlichungsvoraussetzung. `research_pending` bedeutet fehlende Recherchebasis, nicht automatisch einen Softwarefehler. Beliebig große oder widersprüchliche Quellenpakete werden weiterhin nicht blind freigegeben.

## Einstieg

Die neue Headline lautet: „Wichtige Nachrichten. Fakten, Folgen, Zusammenhänge.“ Der Untertitel nennt Politik, Wirtschaft, Gesellschaft, Umwelt und Technik sowie Faktenlage, mögliche Folgen und mediale Vermittlung. Keine behauptete persönliche Betroffenheit.
